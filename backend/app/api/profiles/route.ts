import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, GET');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const { id, first_name, birthdate, sex, gender_identity, hobby_ids, activity_level, onboarding_complete } = await request.json();

    if (!id) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 }));
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ first_name, birthdate, sex, gender_identity, hobby_ids, activity_level, onboarding_complete })
      .eq('id', id)
      .select();

    if (error) {
      return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
    }

    return addCorsHeaders(NextResponse.json({ success: true, data: data[0] }));
  } catch (error) {
    return addCorsHeaders(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }
}

// ✅ ✅ ✅ Add this missing PUT handler
export async function PUT(request: NextRequest) {
  try {
    const { userId, hobbyIds } = await request.json();

    if (!userId) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 }));
    }

    if (!Array.isArray(hobbyIds)) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'Hobby IDs must be an array' }, { status: 400 }));
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ hobby_ids: hobbyIds })
      .eq('id', userId)
      .select();

    if (error) {
      return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
    }

    return addCorsHeaders(NextResponse.json({ success: true, message: 'Hobby IDs updated', data }));
  } catch (error: any) {
    return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return addCorsHeaders(NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 }));
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("hobby_ids")
    .eq("id", userId)
    .single();

  if (error) {
    return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }

  return addCorsHeaders(NextResponse.json({ success: true, hobby_ids: data?.hobby_ids || [] }));
}
