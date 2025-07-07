import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin") || "*";
  const userId = new URL(req.url).searchParams.get("userId");

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: "Missing userId" }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json",
      },
    });
  }

  const { data, error } = await supabaseAdmin
    .from("ai_insights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(7);

  if (error || !data || data.length === 0) {
    return new NextResponse(JSON.stringify({ error: "No AI insights found" }), {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Content-Type": "application/json",
      },
    });
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Content-Type": "application/json",
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
