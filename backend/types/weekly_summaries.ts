export interface WeeklySummary {
  id: string
  user_id: string
  week_start_date: string
  week_end_date: string
  mood_summary: string
  mood_graph_data: any // You can replace 'any' with a specific type if you know the JSON structure
  created_at: string
}
