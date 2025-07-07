import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from supabase import create_client
from datetime import datetime
import google.generativeai as genai


load_dotenv()


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")


supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

app = FastAPI()

# --------------------------
# Utility Functions
# --------------------------

def fetch_recent_journals(user_id: str):
    response = supabase.table("journal_entries") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(7) \
        .execute()
    return response.data

def analyze_entries(entries):
    texts = [entry["entry_text"] for entry in entries]
    full_text = "\n\n".join(texts)

    prompt = f"""
    
IMPORTANT: Return only strict JSON with no trailing commas, no comments, and double quotes around keys.
    Analyze the following journal entries and provide a structured JSON response like this:

```json
{{
  "weekly_summary": {{
    "summary": "User has shown signs of increased emotional awareness...",
    "overall_mood": "Neutral"
  }},
  "trend_analysis": {{
    "trend": "Mood improved midweek after a low start.",
    "actual_mood": [
      {{ "day": "Mon", "mood": 2 }},
      {{ "day": "Tue", "mood": 2 }},
      {{ "day": "Wed", "mood": 1 }},
      {{ "day": "Thu", "mood": 1 }},
      {{ "day": "Fri", "mood": 2 }},
      {{ "day": "Sat", "mood": 4 }},
      {{ "day": "Sun", "mood": 3 }}
    ],
    "predicted_mood": [
      {{ "day": "Mon", "mood": 3.2 }},
      {{ "day": "Tue", "mood": 2.8 }},
      {{ "day": "Wed", "mood": 2.5 }},
      {{ "day": "Thu", "mood": 2.2 }},
      {{ "day": "Fri", "mood": 3.0 }},
      {{ "day": "Sat", "mood": 3.8 }},
      {{ "day": "Sun", "mood": 3.5 }}
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
    }},
    {{
      "title": "Midday Check-in",
      "description": "Reflect on your mood and energy levels",
      "priority": "medium",
      "type": "Routine",
      "timeEstimate": "5 min",
      "completed": false
    }}
  ],
  "suggestions": [
    "Stick to your morning routine to improve consistency.",
    "Consider journaling at the same time each day."
  ],
  "mood_triggers": ["lack of sleep", "social interactions"],
  "mood_improvement_tips": ["go for a walk", "hydrate", "take 5-minute breaks"],
  "positive_patterns": ["consistent writing", "self-reflection"],
  "confidence_score": 0.91
}}

Journal Entries:
{full_text}
"""

    response = model.generate_content(prompt)
    return response.text

def parse_response(text):
    try:
        # Print full response for debugging
        print("🔍 Raw Gemini response:")
        print(text)

        
        if "```json" in text:
            content = text.split("```json")[1].split("```")[0].strip()
        else:
            content = text.strip()

        #
        return json.loads(content)

    except json.JSONDecodeError as e:
        print("❌ JSONDecodeError:", e)
        return {
            "weekly_summary": {"summary": "⚠️ Invalid JSON returned by Gemini"},
            "trend_analysis": {"trend": "Unknown"},
            "insight": text[:500],
            "confidence_score": 0.5
        }


def store_ai_insight(user_id, journal_id, parsed):
    supabase.table("ai_insights").insert({
        "user_id": user_id,
        "journal_id": journal_id,
        "insight": parsed.get("weekly_summary", {}).get("summary", ""),
        "insight_type": "weekly_summary",
        "confidence_score": parsed.get("confidence_score"),
        "today_affirmation": parsed.get("today_affirmation"),
        "prediction_accuracy": parsed.get("prediction_accuracy"),
        "quick_tip": parsed.get("quick_tip"),
        "today_recommendations": parsed.get("today_recommendations"),
        "actual_mood": parsed.get("trend_analysis", {}).get("actual_mood"),
        "predicted_mood": parsed.get("trend_analysis", {}).get("predicted_mood"),
        "weekly_summary": parsed.get("weekly_summary"),
        "trend_analysis": parsed.get("trend_analysis"),
        "day": datetime.utcnow().strftime("%a"),  # e.g., "Mon"
    }).execute()



@app.get("/generate-insight")
async def generate_insight(user_id: str = Query(...)):
    try:
        entries = fetch_recent_journals(user_id)

        if not entries:
            return JSONResponse(status_code=404, content={"error": "No journal entries found."})

        ai_response = analyze_entries(entries)
        parsed = parse_response(ai_response)
        store_ai_insight(user_id, entries[0]["id"], parsed)

        return {
            "message": "AI insight generated and stored successfully.",
            "insight": parsed
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
