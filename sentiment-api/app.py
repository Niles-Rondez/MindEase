from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()  

# Load sentiment pipeline
sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

@app.post("/analyze")
async def analyze_sentiment(payload: dict):
    text = payload.get("text", "")
    if not text:
        return {"error": "Text is required"}

    result = sentiment_pipeline(text)[0]
    label = result["label"]  
    score = result["score"]  

    sentiment_map = {
        "1 star": "Very Negative",
        "2 stars": "Negative",
        "3 stars": "Neutral",
        "4 stars": "Positive",
        "5 stars": "Very Positive"
    }

    sentiment = sentiment_map.get(label.lower(), "Unknown")

    return {
        "sentiment": sentiment,
        "confidence": round(score, 4),
        "raw_label": label
    }
