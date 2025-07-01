import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Get Supabase connection details from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Create admin client to talk to Supabase database
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Add headers so frontend can talk to this API without errors
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle browser's preflight check before sending real request
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}


// Handle the actual data submission from frontend
export async function POST(request: NextRequest) {
  try {
    // Get all the form data from the frontend request
    const { id, first_name, birthdate, sex, gender_identity, hobby_ids, activity_level, onboarding_complete } = await request.json();
    // Make sure user ID exists before doing anything
    if (!id) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 }));
    }
    
    // Update the user's profile in Supabase database
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ first_name, birthdate, sex, gender_identity, hobby_ids, activity_level, onboarding_complete })
      .eq('id', id)
      .select();

    if (error) {
      return addCorsHeaders(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
    }

    if (!data || data.length === 0) {
      return addCorsHeaders(NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 }));
    }

    return addCorsHeaders(NextResponse.json({ success: true, data: data[0] }));
  } catch (error) {
    return addCorsHeaders(NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }));
  }
}