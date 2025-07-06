import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-pro")

def get_journal_insights(text: str) -> dict:
    prompt = f"""
    Analyze the following journal entry from a mental wellness perspective:
    
    "{text}"
    
    Provide:
    1. Sentiment (Very Negative, Negative, Neutral, Positive, Very Positive)
    2. Short explanation of sentiment
    3. A motivational or mindfulness insight
    4. 1-2 personalized suggestions for the user
    5. Any signs of recurring patterns (if applicable)
    
    Respond in JSON:
    {{
      "sentiment": "...",
      "explanation": "...",
      "insight": "...",
      "suggestions": ["...", "..."],
      "patterns": "..."
    }}
    """
    response = model.generate_content(prompt)
    return eval(response.text)  
