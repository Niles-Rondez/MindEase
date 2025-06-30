import { supabaseAdmin } from '../../../lib/supabaseClient'  // Import supabaseAdmin instead of supabase
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing with admin client...')
    
    // Use supabaseAdmin instead of supabase
    const { data, error } = await supabaseAdmin.from('profiles').select('*')

    console.log('Data:', data)
    console.log('Error:', error)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data, 
      count: data?.length || 0 
    })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}