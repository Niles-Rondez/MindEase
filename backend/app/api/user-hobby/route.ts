import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
    const { userId, hobbyIds } = await request.json();

    if (!userId || !Array.isArray(hobbyIds) || hobbyIds.length === 0) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'userId and hobbyIds are required' },
        { status: 400 }
      ));
    }

    // Construct insert payload
    const inserts = hobbyIds.map((hobbyId: number) => ({
      user_id: userId,
      hobby_id: hobbyId,
    }));

    // Use upsert to prevent duplicate errors
    const { data, error } = await supabaseAdmin
      .from('user_hobby')
      .upsert(inserts, { onConflict: 'user_id,hobby_id' })
      .select();

    if (error) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      ));
    }

    return addCorsHeaders(NextResponse.json({
      success: true,
      message: 'User hobbies saved successfully',
      data,
    }));

  } catch (error: any) {
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Unexpected server error', details: error.message },
      { status: 500 }
    ));
  }
}
