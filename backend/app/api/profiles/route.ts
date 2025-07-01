import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabase admin client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

//  Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, GET');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

//  Preflight CORS check
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

//  Initial profile creation/update during onboarding
export async function POST(request: NextRequest) {
  try {
    const {
      id,
      first_name,
      birthdate,
      sex,
      gender_identity,
      hobby_ids,
      activity_level,
      onboarding_complete
    } = await request.json();

    if (!id) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 }));
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name,
        birthdate,
        sex,
        gender_identity,
        hobby_ids,
        activity_level,
        onboarding_complete
      })
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

//  Update specific fields in profile
export async function PUT(request: NextRequest) {
  try {
    const { userId, hobbyIds, activityLevel, onboardingComplete } = await request.json();

    if (!userId) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 }));
    }

    const updateData: Record<string, any> = {};
    if (Array.isArray(hobbyIds)) updateData.hobby_ids = hobbyIds;
    if (typeof activityLevel === 'number') updateData.activity_level = activityLevel;
    if (typeof onboardingComplete === 'boolean') updateData.onboarding_complete = onboardingComplete;

    if (Object.keys(updateData).length === 0) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 }));
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
    }

    return addCorsHeaders(NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data
    }));
  } catch (error: any) {
    return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

//  Fetch onboarding status + hobbies
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return addCorsHeaders(NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 }));
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("hobby_ids, onboarding_complete")
    .eq("id", userId)
    .single();

  if (error) {
    return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }

  return addCorsHeaders(NextResponse.json({
    success: true,
    hobby_ids: data?.hobby_ids || [],
    onboarding_complete: data?.onboarding_complete ?? false
  }));
}
