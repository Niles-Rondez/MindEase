import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

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
    const contentType = request.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
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

    if (!userId || !entryText || !moodRating) {
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
          console.error('[Upload Error]', uploadError);
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

    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .insert({
        user_id: userId,
        entry_text: entryText,
        mood_rating: moodRating,
        photo_url: photoUrls.length ? photoUrls : null
      })
      .select();

    if (error) {
      console.error('[Insert Error]', error);
      return addCorsHeaders(NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      ));
    }

  const nlpRes = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: entryText }),
  });
  const nlpData = await nlpRes.json();
  const { sentiment, confidence } = nlpData;


  const { data: insertedEntry, error: insertError } = await supabaseAdmin
    .from('journal_entries')
    .insert({
      user_id: userId,
      entry_text: entryText,
      mood_rating: moodRating,
      photo_url: photoUrls.length ? photoUrls : null,
      sentiment_label: sentiment,
      sentiment_score: confidence
    })
    .select();

    if (insertError) {
      console.error('[Insert Error]', insertError);
      return addCorsHeaders(NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      ));
    }

    return addCorsHeaders(NextResponse.json({
      success: true,
      message: 'Journal entry saved successfully',
      entry: insertedEntry[0]
    }));
  } catch (error: any) {
    console.error('[Fatal Error]', error);
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Unexpected server error', details: error.message },
      { status: 500 }
    ));
  }
}
