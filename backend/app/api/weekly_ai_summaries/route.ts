import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle CORS preflight
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

// GET /api/weekly_ai_summaries?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return addCorsHeaders(
      NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
    );
  }

  // Corrected to use the actual table field names
  const { data, error } = await supabaseAdmin
    .from("weekly_ai_summaries")
    .select("summary_text, week_start_date")
    .eq("user_id", userId)
    .order("week_start_date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return addCorsHeaders(
      NextResponse.json({ success: false, error: error.message }, { status: 500 })
    );
  }
  if (!data) {
    return addCorsHeaders(
      NextResponse.json({ success: false, error: "No weekly AI summary found." }, { status: 404 })
    );
  }

  return addCorsHeaders(
    NextResponse.json({ 
      success: true, 
      mood_summary: data.summary_text,         // Use actual column name
      week_start: data.week_start_date         // Use actual column name
    })
  );
}
