export interface Profile {
  id: string                     // UUID, primary key
  first_name: string
  birthdate: string              // ISO date (e.g. '2001-05-15')
  sex: string
  gender_identity: string
  hobby_ids: number[]            // Array of hobby IDs
  activity_level: number
  created_at: string             // Timestamp string
  onboarding_complete: boolean
}
