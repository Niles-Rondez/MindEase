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
IMPORTANT: Your response MUST be a strict JSON object. Do NOT include any comments, trailing commas, or extra text outside the JSON. All keys MUST be double-quoted.

Analyze the following journal entries to provide a comprehensive wellness insight.
Ensure all fields in the example JSON structure are populated, even if with default or "N/A" values if specific data is not available from the entries.

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
```

Journal Entries for Analysis:
{full_text}
"""
    print(f"DEBUG: Sending prompt to Gemini:\n{prompt[:500]}...") 
    response = model.generate_content(prompt)
    return response.text

def parse_response(text):
    try:
        print("🔍 Raw Gemini response (before parsing):")
        print(text)

        
        if "```json" in text:
            content = text.split("```json")[1].split("```")[0].strip()
        else:
            content = text.strip()

        # Attempt to load JSON
        parsed_json = json.loads(content)
        print("✅ Successfully parsed Gemini response.")
        return parsed_json

    except json.JSONDecodeError as e:
        print(f"❌ JSONDecodeError: {e}")
        print(f"Content that caused error: {content}") 
        return {
            "weekly_summary": {"summary": "⚠️ Invalid JSON returned by Gemini. Please check backend logs."},
            "trend_analysis": {"trend": "Unknown"},
            "insight": "Error: Invalid JSON from AI. Check backend logs.", 
            "confidence_score": 0.0, 
            "today_affirmation": "AI is currently unavailable for affirmations.", 
            "prediction_accuracy": 0.0, 
            "quick_tip": "AI is currently unavailable for quick tips.", 
            "today_recommendations": [],
            "actual_mood": [], 
            "predicted_mood": [], 
            "suggestions": [],
            "mood_triggers": [],
            "mood_improvement_tips": [], 
            "positive_patterns": [],
        }
    except Exception as e:
        print(f"❌ An unexpected error occurred during parsing: {e}")
        return {
            "weekly_summary": {"summary": "⚠️ An unexpected error occurred during parsing."},
            "trend_analysis": {"trend": "Unknown"},
            "insight": "Error: An unexpected error occurred. Check backend logs.", 
            "confidence_score": 0.0,
            "today_affirmation": "AI is currently unavailable for affirmations.", 
            "prediction_accuracy": 0.0, 
            "quick_tip": "AI is currently unavailable for quick tips.",
            "today_recommendations": [], 
            "actual_mood": [], 
            "predicted_mood": [], 
            "suggestions": [],
            "mood_triggers": [],
            "mood_improvement_tips": [], 
            "positive_patterns": [],
        }


def store_ai_insight(user_id, journal_id, parsed):
  
    print(f"DEBUG: Storing insight for user_id: {user_id}, journal_id: {journal_id}")
    print(f"DEBUG: Insight summary: {parsed.get('weekly_summary', {}).get('summary', 'N/A')}")
    print(f"DEBUG: Today Affirmation: {parsed.get('today_affirmation', 'N/A')}")
    print(f"DEBUG: Quick Tip: {parsed.get('quick_tip', 'N/A')}")
    print(f"DEBUG: Prediction Accuracy: {parsed.get('prediction_accuracy', 'N/A')}")
    print(f"DEBUG: Today Recommendations: {parsed.get('today_recommendations', 'N/A')}")
    print(f"DEBUG: Actual Mood: {parsed.get('trend_analysis', {}).get('actual_mood', 'N/A')}")
    print(f"DEBUG: Predicted Mood: {parsed.get('trend_analysis', {}).get('predicted_mood', 'N/A')}")


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
        "day": datetime.utcnow().strftime("%a"), 
    }).execute()


@app.get("/generate-insight")
async def generate_insight(user_id: str = Query(...)):
    try:
        entries = fetch_recent_journals(user_id)

        if not entries:
            print(f"DEBUG: No journal entries found for user_id: {user_id}")
            return JSONResponse(status_code=404, content={"error": "No journal entries found."})

        ai_response = analyze_entries(entries)
        parsed = parse_response(ai_response)


        if "⚠️ Invalid JSON returned by Gemini" in parsed.get("weekly_summary", {}).get("summary", ""):
            print("DEBUG: Not storing insight due to invalid JSON from Gemini.")
            return JSONResponse(status_code=500, content={"error": "AI response was invalid JSON."})

      
        most_recent_journal_id = entries[0]["id"] if entries else None
        if most_recent_journal_id:
            store_ai_insight(user_id, most_recent_journal_id, parsed)
        else:
            print("DEBUG: No journal ID available to store insight.")

        return {
            "message": "AI insight generated and stored successfully.",
            "insight": parsed 
        }

    except Exception as e:
        print(f"ERROR: An exception occurred in generate_insight: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})