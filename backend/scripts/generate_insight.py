import os
import json
import sys
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def analyze_entries(entries_text: str):
    full_text = entries_text
    prompt = f"""
IMPORTANT: Your response MUST be a strict JSON object. Do NOT include any comments, trailing commas, or extra text outside the JSON. All keys MUST be double-quoted.

Analyze the following journal entry to provide a comprehensive wellness insight.
Ensure all fields in the example JSON structure are populated, even if with default or "N/A" values if specific data is not available from the entry.
You are provided with a journal entry.

```json
{{
  "weekly_summary": {{
    "summary": "User has shown signs of increased emotional awareness...",
    "overall_mood": "Neutral"
  }},
  "trend_analysis": {{
    "trend": "Mood improved midweek after a low start.",
    "actual_mood": [
      {{ "date": "2025-07-07", "mood": 2 }}
    ],
    "predicted_mood": [
      {{ "date": "2025-07-07", "mood": 2.5 }}
    ]
  }},
  "today_affirmation": "I am capable of navigating life with calm and clarity.",
  "prediction_accuracy": 78.2,
  "quick_tip": "Use the 5-4-3-2-1 grounding technique when feeling overwhelmed.",
  "today_recommendations": [
    {{
      "title": "Morning Meditation",
      "description": "Start your day with 10 minutes of mindfulness",
      "priority": "high",
      "type": "Wellness",
      "timeEstimate": "10 min",
      "completed": false
    }}
  ],
  "suggestions": ["Stick to your morning routine."],
  "mood_triggers": ["lack of sleep"],
  "mood_improvement_tips": ["go for a walk"],
  "positive_patterns": ["consistent writing"],
  "confidence_score": 0.91
}}
```

Journal Entry for Analysis:
{full_text}
"""
    print(f"DEBUG (Python): Sending prompt to Gemini:\n{prompt[:500]}...", file=sys.stderr)
    response = model.generate_content(prompt)
    return response.text

def parse_response(text):
    try:
        print("🔍 Raw Gemini response (before parsing):", file=sys.stderr)
        print(text, file=sys.stderr)

        if "```json" in text:
            content = text.split("```json")[1].split("```")[0].strip()
        else:
            content = text.strip()

        parsed_json = json.loads(content)
        print("✅ Successfully parsed Gemini response.", file=sys.stderr)
        return parsed_json

    except json.JSONDecodeError as e:
        print(f"❌ JSONDecodeError: {e}", file=sys.stderr)
        print(f"Content that caused error: {content}", file=sys.stderr)
        return {
            "error": "Invalid JSON returned by Gemini. Check backend logs.",
            "weekly_summary": {"summary": "⚠️ Invalid JSON returned by Gemini. Please check backend logs."},
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
        print(f"❌ An unexpected error occurred during parsing: {e}", file=sys.stderr)
        return {
            "error": "An unexpected error occurred during parsing. Check backend logs.",
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
        print("Usage: python generate_insight.py <entry_id> <journal_text>", file=sys.stderr)
        sys.exit(1)

    entry_id_from_node = sys.argv[1]
    journal_text_from_node = sys.argv[2]

    print(f"DEBUG (Python): Script received entry_id: {entry_id_from_node}, text length: {len(journal_text_from_node)}", file=sys.stderr)

    ai_response_text = analyze_entries(journal_text_from_node)
    parsed_insights = parse_response(ai_response_text)

    if parsed_insights and not parsed_insights.get("error"):
        print(json.dumps(parsed_insights, ensure_ascii=False))
        sys.exit(0)
    else:
        print("ERROR (Python): Failed to generate or parse insights.", file=sys.stderr)
        sys.exit(1)
