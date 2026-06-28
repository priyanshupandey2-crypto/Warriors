from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any
import requests
from pydantic import BaseModel
from app.logger import get_logger
from app.config import settings

logger = get_logger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("")
async def chat_with_gemini(req: ChatRequest):
    try:
        api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key missing")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

        prompt = f"""You are AuraBot, a helpful assistant for AuraLearn course platform.
Keep your responses SHORT and CONCISE (2-4 sentences max).
Never use asterisks (*) for emphasis or lists - use simple text instead.
Avoid bullet points - use inline explanations.
Be direct and practical.
User question: {req.message}
"""

        data = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        response = requests.post(url, json=data)
        if response.status_code != 200:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"Gemini API returned error: {response.text}")

        result = response.json()
        try:
            reply = result['candidates'][0]['content']['parts'][0]['text']
            return {"reply": reply}
        except KeyError as e:
            logger.error(f"Invalid response format from Gemini: {result}")
            raise HTTPException(status_code=500, detail="Invalid response format from Gemini")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
