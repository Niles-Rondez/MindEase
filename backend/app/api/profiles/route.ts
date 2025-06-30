import { supabaseAdmin } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const {
    id,
    first_name,
    birthdate,
    sex,
    gender_identity,
    hobby_ids,
    activity_level,
    onboarding_complete,
  } = body

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      first_name,
      birthdate,
      sex,
      gender_identity,
      hobby_ids,
      activity_level,
      onboarding_complete,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
