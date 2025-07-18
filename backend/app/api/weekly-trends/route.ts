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

// Helper function to convert mood rating to numeric score
function getMoodScore(moodRating: string): number {
  switch (moodRating) {
    case 'Red': return 1;      // Very Sad
    case 'Orange': return 2;   // Sad
    case 'Yellow': return 3;   // Neutral
    case 'Green': return 4;    // Happy
    case 'Blue': return 5;     // Very Happy
    default: return 3;         // Default to neutral
  }
}

// Helper function to get week number (1-4) based on day of month
function getWeekOfMonth(date: Date): number {
  const dayOfMonth = date.getDate();
  return Math.ceil(dayOfMonth / 7);
}

// Helper function to calculate consistency percentage for a specific week
function calculateConsistency(entries: any[], weekNumber: number, year: number, month: number): number {
  if (entries.length === 0) return 0;
  
  // Calculate the date range for this specific week
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = Math.min(weekNumber * 7, new Date(year, month, 0).getDate()); // Don't exceed days in month
  
  // Group entries by date within this week
  const dateGroups = new Set<string>();
  entries.forEach(entry => {
    const entryDate = new Date(entry.created_at);
    const dayOfMonth = entryDate.getDate();
    
    // Only count days within this week's range
    if (dayOfMonth >= startDay && dayOfMonth <= endDay) {
      const dateKey = entryDate.toISOString().split('T')[0];
      dateGroups.add(dateKey);
    }
  });

  // Calculate days with entries out of total days in this week
  const daysWithEntries = dateGroups.size;
  const totalDaysInWeek = endDay - startDay + 1;
  
  return Math.round((daysWithEntries / totalDaysInWeek) * 100);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Check if user ID is provided
    if (!userId) {
      return addCorsHeaders(NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      ));
    }

    // Calculate date range for the current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based (0 = January)
    
    // Start from the 1st of the current month
    const startDate = new Date(currentYear, currentMonth, 1);
    
    // End at the current date or end of month (whichever is earlier)
    const endDate = new Date(currentYear, currentMonth + 1, 0); // Last day of current month
    const today = new Date();
    const actualEndDate = endDate > today ? today : endDate;

    // Query journal entries for the user within the current month
    const { data: entries, error } = await supabaseAdmin
      .from('journal_entries')
      .select('mood_rating, mood_tag, created_at, mood_score')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', actualEndDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Query Error]', error);
      return addCorsHeaders(NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      ));
    }

    if (!entries || entries.length === 0) {
      return addCorsHeaders(NextResponse.json({
        success: true,
        trends: [],
        message: 'No journal entries found for the current month'
      }));
    }

    // Group entries by week of the month
    const weeklyGroups = new Map<number, any[]>();
    
    // Determine how many weeks we need based on the current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const maxWeeks = Math.ceil(lastDayOfMonth / 7);
    
    // Initialize all weeks in the current month
    for (let i = 1; i <= maxWeeks; i++) {
      weeklyGroups.set(i, []);
    }

    entries.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      const weekNumber = getWeekOfMonth(entryDate);
      
      // Make sure week number is valid
      if (weekNumber >= 1 && weekNumber <= maxWeeks) {
        weeklyGroups.get(weekNumber)!.push(entry);
      }
    });

    // Calculate trends for each week
    const trends = Array.from(weeklyGroups.entries()).map(([weekNumber, weekEntries]) => {
      const totalEntries = weekEntries.length;
      
      // Calculate average mood using mood_rating converted to numeric
      let avgMood = 0;
      if (totalEntries > 0) {
        const moodScores = weekEntries.map(entry => getMoodScore(entry.mood_rating));
        avgMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
      }

      // Calculate consistency percentage for this specific week
      const consistencyPercentage = calculateConsistency(weekEntries, weekNumber, currentYear, currentMonth + 1);

      // Calculate mood tag percentages
      const moodTagCounts = {
        positive: 0,
        neutral: 0,
        negative: 0
      };

      weekEntries.forEach(entry => {
        if (entry.mood_tag && moodTagCounts.hasOwnProperty(entry.mood_tag)) {
          moodTagCounts[entry.mood_tag as keyof typeof moodTagCounts]++;
        }
      });

      const positivePercentage = totalEntries > 0 ? (moodTagCounts.positive / totalEntries) * 100 : 0;
      const neutralPercentage = totalEntries > 0 ? (moodTagCounts.neutral / totalEntries) * 100 : 0;
      const negativePercentage = totalEntries > 0 ? (moodTagCounts.negative / totalEntries) * 100 : 0;

      // Calculate mood rating distribution
      const moodRatingCounts = {
        'Red': 0,
        'Orange': 0,
        'Yellow': 0,
        'Green': 0,
        'Blue': 0
      };

      weekEntries.forEach(entry => {
        if (entry.mood_rating && moodRatingCounts.hasOwnProperty(entry.mood_rating)) {
          moodRatingCounts[entry.mood_rating as keyof typeof moodRatingCounts]++;
        }
      });

      // Calculate the date range for this week
      const startDay = (weekNumber - 1) * 7 + 1;
      const endDay = Math.min(weekNumber * 7, lastDayOfMonth);
      
      return {
        week: `Week ${weekNumber}`,
        weekNumber,
        avgMood: parseFloat(avgMood.toFixed(1)),
        totalEntries,
        consistencyPercentage,
        positivePercentage: parseFloat(positivePercentage.toFixed(1)),
        neutralPercentage: parseFloat(neutralPercentage.toFixed(1)),
        negativePercentage: parseFloat(negativePercentage.toFixed(1)),
        moodRatingCounts,
        moodTagCounts,
        dateRange: {
          start: startDay,
          end: endDay
        }
      };
    });

    // Sort trends by week number
    trends.sort((a, b) => a.weekNumber - b.weekNumber);

    return addCorsHeaders(NextResponse.json({
      success: true,
      trends,
      dateRange: {
        from: startDate.toISOString().split('T')[0],
        to: actualEndDate.toISOString().split('T')[0]
      },
      month: {
        year: currentYear,
        month: currentMonth + 1,
        name: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
    }));

  } catch (error: any) {
    console.error('[Fatal Error]', error);
    return addCorsHeaders(NextResponse.json(
      { success: false, error: 'Unexpected server error', details: error.message },
      { status: 500 }
    ));
  }
}