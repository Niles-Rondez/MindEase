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
  console.log('[API Call] Received POST request for journal entry.'); // Log 1
  try {
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      console.error('[API Error] Unsupported content type:', contentType); // Log 2
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

    console.log('[API Data] Parsed formData:', { userId, entryText: entryText.substring(0, 100) + '...', moodRating, filesCount: files.length }); // Log 3

    if (!userId || !entryText || !moodRating) {
      console.error('[API Error] Missing required fields:', { userId, entryText, moodRating }); // Log 4
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
          console.error('[Supabase Upload Error]', uploadError); // Log 5
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

    console.log('[Supabase] Attempting to insert journal entry...'); // Log 6
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
      console.error('[Supabase Insert Error]', insertError); // Log 7
      return addCorsHeaders(NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      ));
    }

    const newJournalEntry = insertedEntryData[0];
    console.log('[Supabase] Journal entry inserted:', newJournalEntry.id, newJournalEntry.created_at); // Log 8

    let insightsData: any = null;
    let pythonErrorOutput = '';

    const pythonScriptPath = path.join(process.cwd(), 'scripts', 'generate_insight.py');
    console.log(`[Insight Generation] Attempting to run Python script at: ${pythonScriptPath}`); // Log 9

    const pythonProcess = spawn('python', [
      pythonScriptPath,
      newJournalEntry.id,
      entryText
    ]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`[Insight Generation] Raw Python STDOUT: ${data.toString()}`); // Log 10
      try {
        insightsData = JSON.parse(data.toString());
        console.log('[Insight Generation] Python script output (parsed):', insightsData); // Log 11
      } catch (e) {
        console.error("[Insight Generation] Failed to parse Python script output:", data.toString(), e); // Log 12
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonErrorOutput += data.toString();
      console.error(`[Insight Generation] Python STDERR: ${data}`); // Log 13
    });

    await new Promise<void>((resolve) => {
      pythonProcess.on('close', async (code) => {
        console.log(`[Insight Generation] Python process exited with code: ${code}`); // Log 14
        if (code === 0) {
          console.log('[Insight Generation] generate_insights.py script finished successfully.'); // Log 15
          if (insightsData && newJournalEntry.id) {
            console.log(`[Supabase] Attempting to update journal entry ${newJournalEntry.id} with insights...`); // Log 16
            const { error: updateError } = await supabaseAdmin
              .from('journal_entries')
              .update({ insights: insightsData })
              .eq('id', newJournalEntry.id);

            if (updateError) {
              console.error('[Supabase Insights Update Error]', updateError); // Log 17
            } else {
              console.log(`[Supabase Update] Journal entry ${newJournalEntry.id} updated with insights.`); // Log 18
            }
          } else {
              console.warn('[Supabase Update] No insights data to update or entry ID missing.'); // Log 19
          }
        } else {
          console.error(`[Insight Generation] generate_insights.py script failed. Error: ${pythonErrorOutput}`); // Log 20
        }
        resolve();
      });

      pythonProcess.on('error', (err) => {
        console.error(`[Insight Generation] Failed to start Python script process: ${err.message}`); // Log 21
        resolve();
      });
    });

    console.log('[API Response] Sending final response to frontend.'); // Log 22
    return addCorsHeaders(NextResponse.json({
      success: true,
      message: 'Journal entry saved successfully and insights generation initiated.',
      entry: newJournalEntry,
      insights: insightsData
    }));

  } catch (error: any) {
    console.error('[Fatal API Error]', error); // Log 23
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Unexpected server error', details: error.message },
      { status: 500 }
    ));
  }
} 