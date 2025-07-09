import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
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
  console.log('[API Call] Received POST request for journal entry.');
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      console.error('[API Error] Unsupported content type:', contentType);
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Unsupported content type' },
        { status: 415 }
      ));
    }

    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const entryText = formData.get('entry_text') as string;
    const moodRating = formData.get('mood_rating') as string;
    const files = formData.getAll('file');

    console.log('[API Data] Parsed formData:', { userId, entryText: entryText.substring(0, Math.min(entryText.length, 100)) + '...', moodRating, filesCount: files.length });

    if (!userId || !entryText || !moodRating) {
      console.error('[API Error] Missing required fields:', { userId, entryText, moodRating });
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      ));
    }

    const photoUrls: string[] = [];

    for (const file of files) {
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const sanitizedFilename = file.name.replace(/[^\w.-]/g, '_');
        const filename = `${userId}/${uuidv4()}_${sanitizedFilename}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('journal-photos')
          .upload(filename, buffer, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) {
          console.error('[Supabase Upload Error]', uploadError);
          continue;
        }

        const { data: publicUrlData } = supabaseAdmin.storage
          .from('journal-photos')
          .getPublicUrl(filename);

        if (publicUrlData?.publicUrl) {
          photoUrls.push(publicUrlData.publicUrl);
        }
      }
    }

    console.log('[Supabase] Attempting to insert journal entry...');
    const { data: insertedEntryData, error: insertError } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: userId,
        entry_text: entryText,
        mood_rating: moodRating,
        photo_url: photoUrls.length ? photoUrls : null
      })
      .select();

    if (insertError) {
      console.error('[Supabase Insert Error]', insertError);
      return addCorsHeaders(NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      ));
    }

    const newJournalEntry = insertedEntryData[0];
    console.log('[Supabase] Journal entry inserted:', newJournalEntry.id, newJournalEntry.created_at);

    let insightsData: any = null;
    let pythonErrorOutput = '';

    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'generate_insight.py');
    console.log(`[Insight Generation] Attempting to run Python script at: ${pythonScriptPath}`);

    const pythonProcess = spawn('python', [
      pythonScriptPath,
      newJournalEntry.id,
      entryText
    ]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`[Insight Generation] Raw Python STDOUT: ${data.toString()}`);
      try {
        insightsData = JSON.parse(data.toString());
        console.log('[Insight Generation] Python script output (parsed):', insightsData);
      } catch (e) {
        console.error("[Insight Generation] Failed to parse Python script output:", data.toString(), e);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonErrorOutput += data.toString();
      console.error(`[Insight Generation] Python STDERR: ${data}`);
    });

    await new Promise<void>((resolve) => {
      pythonProcess.on('close', async (code) => {
        console.log(`[Insight Generation] Python process exited with code: ${code}`);
        if (code === 0) {
          console.log('[Insight Generation] generate_insight.py script finished successfully.');
          if (insightsData && newJournalEntry.id && newJournalEntry.user_id) {
            console.log(`[Supabase] Attempting to INSERT into 'ai_insights' table for journal entry ${newJournalEntry.id}...`);

            const { error: insertInsightError } = await supabaseAdmin
              .from('ai_insights')
              .insert({
                journal_id: newJournalEntry.id,
                user_id: newJournalEntry.user_id,
                
                insight: insightsData.weekly_summary?.summary || null,
                explanation: insightsData.weekly_summary?.summary || null,
                confidence_score: insightsData.confidence_score || null,
                today_affirmation: insightsData.today_affirmation || null,
                prediction_accuracy: insightsData.prediction_accuracy || null,
                quick_tip: insightsData.quick_tip || null,
                weekly_summary: insightsData.weekly_summary || null,
                trend_analysis: insightsData.trend_analysis || null,
                actual_mood: insightsData.trend_analysis?.actual_mood || null,
                predicted_mood: insightsData.trend_analysis?.predicted_mood || null,
                today_recommendations: insightsData.today_recommendations || null,
                
                suggestions: insightsData.suggestions || [],
                mood_triggers: insightsData.mood_triggers || [],
                mood_improvement_tips: insightsData.mood_improvement_tips || [],
                positive_patterns: insightsData.positive_patterns || [],

                recommended_activities: insightsData.today_recommendations?.map((rec: any) => rec.title || rec.description).filter(Boolean) || [],
                
                patterns: insightsData.positive_patterns?.join(', ') || null,
                
                insight_type: 'weekly_summary',
                
                day: insightsData.generated_at ? new Date(insightsData.generated_at).toLocaleString('en-US', { weekday: 'short' }) : new Date().toLocaleString('en-US', { weekday: 'short' }),

                stress_indicators: null,
                priority_level: null,
                monthly_trends: null,
                is_active: true,
                expires_at: null,
              });

            if (insertInsightError) {
              console.error('[Supabase AI Insight Insert Error]', insertInsightError);
            } else {
              console.log(`[Supabase Update] AI insights successfully stored for journal entry ${newJournalEntry.id} in 'ai_insights' table.`);
            }
          } else {
              console.warn('[Supabase Update] No insights data or required IDs (journal_id, user_id) available for AI insight storage.');
          }
        } else {
          console.error(`[Insight Generation] generate_insight.py script failed. Error: ${pythonErrorOutput}`);
        }
        resolve();
      });

      pythonProcess.on('error', (err) => {
        console.error(`[Insight Generation] Failed to start Python script process: ${err.message}`);
        resolve();
      });
    });

    console.log('[API Response] Sending final response to frontend.');
    return addCorsHeaders(NextResponse.json({
      success: true,
      message: 'Journal entry saved successfully and insights generation initiated.',
      entry: newJournalEntry,
      insights: insightsData
    }));

  } catch (error: any) {
    console.error('[Fatal API Error]', error);
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Unexpected server error', details: error.message },
      { status: 500 }
    ));
  }
}