import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 }));
    }

    // Get all journal entries for the past 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const { data: entries, error } = await supabaseAdmin
      .from('journal_entries')
      .select('id, entry_text, created_at')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
    }
    if (!entries || entries.length === 0) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'No journal entries found for the past week.' }, { status: 404 }));
    }

    // Consolidate entries for AI
    const consolidatedJournalText = entries.map(entry => {
      const date = entry.created_at ? new Date(entry.created_at).toISOString().split('T')[0] : 'Unknown Date';
      return `--- ENTRY (${date}) ---\n${entry.entry_text}`;
    }).join('\n\n');

    // Call Python script
    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'generate_insight.py');
    let insightsData: any = null;
    let pythonErrorOutput = '';

    const pythonProcess = spawn('python', [
      pythonScriptPath,
      entries[entries.length - 1].id, // Use the most recent entry's ID for reference
      consolidatedJournalText
    ]);

    pythonProcess.stdout.on('data', (data) => {
      try {
        insightsData = JSON.parse(data.toString());
      } catch (e) {
        // ignore parse error here, will handle below
      }
    });
    pythonProcess.stderr.on('data', (data) => {
      pythonErrorOutput += data.toString();
    });

    await new Promise<void>((resolve) => {
      pythonProcess.on('close', async (code) => {
        if (code === 0 && insightsData) {
          // Insert into ai_insights
          await supabaseAdmin.from('ai_insights').insert({
            journal_id: entries[entries.length - 1].id,
            user_id: userId,
            explanation: insightsData.weekly_summary?.summary || null,
            suggestions: insightsData.suggestions || [],
            patterns: insightsData.positive_patterns?.join(', ') || null,
            created_at: new Date().toISOString(),
            insight_type: 'weekly_summary',
            confidence_score: insightsData.confidence_score || null,
            mood_triggers: insightsData.mood_triggers || [],
            recommended_activities: insightsData.today_recommendations?.map((rec: any) => rec.title || rec.description).filter(Boolean) || [],
            mood_improvement_tips: insightsData.mood_improvement_tips || [],
            stress_indicators: null,
            positive_patterns: insightsData.positive_patterns || [],
            weekly_summary: insightsData.weekly_summary || null,
            trend_analysis: insightsData.trend_analysis || null,
            priority_level: null,
            is_active: true,
            expires_at: null,
            today_recommendations: insightsData.today_recommendations || null,
            today_affirmation: insightsData.today_affirmation || null,
            prediction_accuracy: insightsData.prediction_accuracy || null,
            quick_tip: insightsData.quick_tip || null,
            day: new Date().toLocaleString('en-US', { weekday: 'short' }),
            monthly_trends: null,
          });
        }
        resolve();
      });
      pythonProcess.on('error', () => resolve());
    });

    if (!insightsData) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'AI insight generation failed', details: pythonErrorOutput }, { status: 500 }));
    }

    return addCorsHeaders(NextResponse.json({ success: true, insights: insightsData }));
  } catch (error: any) {
    return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}
