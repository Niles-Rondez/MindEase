import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Add CORS headers to allow frontend to access this API
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET(request: NextRequest) {
  try {
    // Get all the filter parameters from the URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moodFilter = searchParams.get('mood');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const searchText = searchParams.get('search');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    // Check if user ID is provided
    if (!userId) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      ));
    }

    // Start building the database query
    let query = supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply mood filter if provided - convert numeric rating to color
    if (moodFilter) {
      const colorFromRating = getColorFromRating(moodFilter);
      if (colorFromRating) {
        query = query.eq('mood_rating', colorFromRating);
      }
    }

    // Apply date range filters if provided
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply search text filter if provided
    if (searchText) {
      query = query.ilike('entry_text', `%${searchText}%`);
    }

    // Apply pagination (how many entries to show)
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Execute the database query
    const { data, error, count } = await query;

    if (error) {
      console.error('[Query Error]', error);
      return addCorsHeaders(NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      ));
    }

    // Transform database data to match what the frontend expects
    const transformedEntries = data?.map(entry => ({
      id: entry.id,
      date: entry.created_at ? new Date(entry.created_at).toISOString().split('T')[0] : '',
      mood: getMoodText(entry.mood_rating), // Convert color to text
      moodEmoji: getMoodEmoji(entry.mood_rating), // Convert color to emoji
      entry: entry.entry_text,
      images: entry.photo_url || [],
      created_at: entry.created_at,
      mood_rating: entry.mood_rating
    })) || [];

    // Send the response back to frontend
    return addCorsHeaders(NextResponse.json({
      success: true,
      entries: transformedEntries,
      total: count,
      hasMore: (parseInt(offset) + parseInt(limit)) < (count || 0)
    }));

  } catch (error: any) {
    console.error('[Fatal Error]', error);
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Unexpected server error', details: error.message },
      { status: 500 }
    ));
  }
}

// FIXED: Convert color-based mood rating to readable text
function getMoodText(rating: string): string {
  const moodMap: { [key: string]: string } = {
    'Red': 'Very Sad',      // Red = Very Sad (😢)
    'Orange': 'Sad',        // Orange = Sad (😕)
    'Yellow': 'Neutral',    // Yellow = Neutral (😐)
    'Green': 'Happy',       // Green = Happy (😊)
    'Blue': 'Very Happy',   // Blue = Very Happy (😄)
  };
  return moodMap[rating] || 'Neutral'; // Default to Neutral
}
//Convert color-based mood rating to correct emoji
function getMoodEmoji(rating: string): string {
  const emojiMap: { [key: string]: string } = {
    'Red': '😢',     // Very Sad
    'Orange': '😕',  // Sad
    'Yellow': '😐',  // Neutral
    'Green': '😊',   // Happy
    'Blue': '😄',    // Very Happy
  };
  return emojiMap[rating] || '😐'; // Default to neutral face
}

//Convert numeric mood rating to color for filtering
function getColorFromRating(rating: string): string | null {
  const ratingToColorMap: { [key: string]: string } = {
    '1': 'Red',     // Very Sad
    '2': 'Orange',  // Sad
    '3': 'Yellow',  // Neutral
    '4': 'Green',   // Happy
    '5': 'Blue',    // Very Happy
  };
  return ratingToColorMap[rating] || null;
}