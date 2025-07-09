import os
import json
import sys
from dotenv import load_dotenv
from datetime import datetime
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configure Google Generative AI with API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Supabase client removed - Python script no longer directly interacts with DB

def analyze_entries(consolidated_journal_text: str):
    """
    Analyzes a consolidated string of multiple journal entries using the Gemini model
    to generate comprehensive wellness insights, including trends.
    """
    prompt = f"""
IMPORTANT: Your response MUST be a strict JSON object. Do NOT include any comments, trailing commas, or extra text outside the JSON. All keys MUST be double-quoted.

You are provided with a sequence of journal entries, ordered from oldest to newest, separated by '--- ENTRY (YYYY-MM-DD) ---'.
Analyze the collective history of these entries to provide comprehensive wellness insights, focusing on:
- Overall mood trends and fluctuations over time.
- Recurring themes or patterns across multiple entries.
- Potential triggers for mood changes.
- Positive habits or coping mechanisms observed.
- Recommendations and affirmations based on the entire history, but with a focus on the most recent state.

Ensure all fields in the example JSON structure are populated, even if with default or "N/A" values if specific data is not available from the entries.

```json
{{
  "weekly_summary": {{
    "summary": "User has shown signs of increased emotional awareness and a slight improvement in mood towards the end of the week. Noted consistent efforts in practicing mindfulness.",
    "overall_mood": "Improving"
  }},
  "trend_analysis": {{
    "trend": "Mood started low at the beginning of the period but gradually improved, with a dip midweek. Consistency in journaling seems to correlate with mood stability.",
    "actual_mood": [
      {{ "date": "2025-07-01", "mood": 2 }},
      {{ "date": "2025-07-02", "mood": 3 }},
      {{ "date": "2025-07-03", "mood": 2 }},
      {{ "date": "2025-07-04", "mood": 3 }},
      {{ "date": "2025-07-05", "mood": 4 }}
    ],
    "predicted_mood": [
      {{ "date": "2025-07-06", "mood": 3.5 }},
      {{ "date": "2025-07-07", "mood": 4.0 }}
    ]
  }},
  "today_affirmation": "I am resilient and capable of continuous growth and self-improvement.",
  "prediction_accuracy": 85.5,
  "quick_tip": "Reflect on small daily wins to boost overall well-being and maintain a positive outlook.",
  "today_recommendations": [
    {{
      "title": "Evening Gratitude Journaling",
      "description": "Spend 5-10 minutes each evening noting down things you are grateful for.",
      "priority": "high",
      "type": "Wellness",
      "timeEstimate": "10 min",
      "completed": false
    }},
    {{
      "title": "Mindful Walking",
      "description": "Take a 15-minute walk focusing on your senses: sights, sounds, smells.",
      "priority": "medium",
      "type": "Physical Activity",
      "timeEstimate": "15 min",
      "completed": false
    }}
  ],
  "suggestions": ["Maintain consistent sleep schedule.", "Explore new relaxation techniques."],
  "mood_triggers": ["work-related stress", "social pressure"],
  "mood_improvement_tips": ["engage in creative hobbies", "spend time in nature"],
  "positive_patterns": ["regular exercise", "daily meditation", "consistent self-reflection"],
  "confidence_score": 0.95
}}
Journal Entries for Analysis:
{consolidated_journal_text}
"""
    print(f"DEBUG (Python): Sending prompt to Gemini. Consolidated text length: {len(consolidated_journal_text)}", file=sys.stderr)
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"ERROR (Python): Gemini API call failed: {e}", file=sys.stderr)
        return json.dumps({
            "error": "Gemini API call failed.",
            "weekly_summary": {"summary": f"⚠️ Gemini API Error: {e}"},
            "confidence_score": 0.0
        })

def parse_response(text: str):
    """
    Parses the raw text response from the Gemini model into a JSON object.
    Handles cases where Gemini might include markdown or produce invalid JSON.
    """
    print("DEBUG (Python): Raw Gemini response (before parsing):", file=sys.stderr)
    print(text, file=sys.stderr)

    try:
        if "```json" in text:
            content = text.split("```json")[1].split("```")[0].strip()
        else:
            content = text.strip()

        parsed_json = json.loads(content)
        print("DEBUG (Python): Successfully parsed Gemini response.", file=sys.stderr)
        return parsed_json

    except json.JSONDecodeError as e:
        print(f"ERROR (Python): JSONDecodeError during parsing: {e}", file=sys.stderr)
        print(f"ERROR (Python): Content that caused error: {content}", file=sys.stderr)
        return {
            "error": "Invalid JSON returned by Gemini.",
            "weekly_summary": {"summary": "⚠️ Invalid JSON returned by Gemini. Please check Python script logs."},
            "trend_analysis": {"trend": "Unknown"},
            "confidence_score": 0.0,
            "today_affirmation": "AI is currently unavailable for affirmations.",
            "prediction_accuracy": 0.0,
            "quick_tip": "AI is currently unavailable for quick tips.",
            "today_recommendations": [],
            "suggestions": [],
            "mood_triggers": [],
            "mood_improvement_tips": [],
            "positive_patterns": [],
            "actual_mood": [],
            "predicted_mood": [],
        }
    except Exception as e:
        print(f"ERROR (Python): An unexpected error occurred during parsing: {e}", file=sys.stderr)
        return {
            "error": "An unexpected error occurred during parsing.",
            "weekly_summary": {"summary": "⚠️ An unexpected error occurred during parsing."},
            "trend_analysis": {"trend": "Unknown"},
            "confidence_score": 0.0,
            "today_affirmation": "AI is currently unavailable for affirmations.",
            "prediction_accuracy": 0.0,
            "quick_tip": "AI is currently unavailable for quick tips.",
            "today_recommendations": [],
            "suggestions": [],
            "mood_triggers": [],
            "mood_improvement_tips": [],
            "positive_patterns": [],
            "actual_mood": [],
            "predicted_mood": [],
        }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("ERROR (Python): Usage: python generate_insight.py <entry_id> <consolidated_journal_text>", file=sys.stderr)
        sys.exit(1)

    entry_id_from_node = sys.argv[1]
    consolidated_journal_text_from_node = sys.argv[2]

    print(f"DEBUG (Python): Script received entry ID: {entry_id_from_node}, Consolidated text length: {len(consolidated_journal_text_from_node)}", file=sys.stderr)

    ai_response_text = analyze_entries(consolidated_journal_text_from_node)
    parsed_insights = parse_response(ai_response_text)

    if parsed_insights and not parsed_insights.get("error"):
        print(json.dumps(parsed_insights, ensure_ascii=False))
        sys.exit(0)
    else:
        print("ERROR (Python): Failed to generate or parse valid insights. See above logs for details.", file=sys.stderr)
        sys.exit(1)