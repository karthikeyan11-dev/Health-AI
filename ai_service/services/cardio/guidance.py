"""
Cardiovascular AI Guidance Generator
Translates real model outputs (CatBoost + SHAP + PPO) into patient-friendly guidance.
Implements strict fallback hierarchy: Gemini -> Groq -> Static Fallback Message.
Never invents, modifies, or mocks clinical assessment data.
"""

import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("ai_service.cardio.guidance")

STATIC_FALLBACK_GUIDANCE = (
    "Cardiovascular assessment completed successfully.\n\n"
    "Your risk assessment and contributing factors were calculated from the available health data.\n\n"
    "Personalized AI guidance is currently unavailable because the AI guidance service is not configured. Please try again later."
)

def generate_patient_guidance(
    risk_class: int,
    risk_level: str,
    confidence: float,
    shap_drivers: str,
    recommended_intervention: str,
    gemini_api_key: Optional[str] = None,
    groq_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Transforms real model outputs (CatBoost/RF + SHAP + PPO) into patient-friendly guidance.
    
    Args:
        risk_class: Integer 0..4 from risk classifier model
        risk_level: String label ('OPTIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')
        confidence: Float probability from risk classifier model
        shap_drivers: String of top physiological drivers from Kernel SHAP
        recommended_intervention: String action from PPO RL policy
        gemini_api_key: Optional Gemini API key override
        groq_api_key: Optional Groq API key override

    Returns:
        Dict with 'guidance_status', 'provider', and 'message'
    """
    prompt = f"""
    You are an empathetic, professional AI cardiovascular health coach in a smart monitoring app. 
    Translate the following technical data into a short, encouraging, and easy-to-understand 
    message for the patient (maximum 4 sentences). Do not use medical jargon.

    Patient Data:
    - Predicted Risk Level: {risk_level} (Class {risk_class})
    - AI Confidence: {confidence * 100:.2f}%
    - Top physiological factors driving this score: {shap_drivers}
    - Recommended Intervention (from RL Agent): {recommended_intervention}
    """.strip()

    # 1. Attempt Primary Provider (Google Gemini)
    effective_gemini_key = gemini_api_key or os.environ.get("GEMINI_API_KEY", "")
    if effective_gemini_key and effective_gemini_key not in ["YOUR_GEMINI_API_KEY_HERE", ""]:
        for gemini_model in ["gemini-3.5-flash", "gemini-3.6-flash"]:
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(
                    api_key=effective_gemini_key,
                    http_options=types.HttpOptions(timeout=10000)
                )
                response = client.models.generate_content(
                    model=gemini_model,
                    contents=prompt
                )
                if response and response.text:
                    return {
                        "guidance_status": "success",
                        "provider": f"gemini ({gemini_model})",
                        "message": response.text.strip()
                    }
            except Exception as e:
                logger.warning(f"Gemini ({gemini_model}) guidance generation failed: {e}. Trying next...")

    # 2. Attempt Secondary Fallback Provider (Groq Fast LLM)
    effective_groq_key = groq_api_key or os.environ.get("GROQ_API_KEY", "")
    if effective_groq_key and effective_groq_key not in ["YOUR_GROQ_API_KEY_HERE", ""]:
        for groq_model in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "groq/compound-mini"]:
            try:
                from groq import Groq
                groq_client = Groq(api_key=effective_groq_key, timeout=5.0)
                groq_response = groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=groq_model,
                    max_tokens=250,
                    temperature=0.6,
                )
                if groq_response and groq_response.choices:
                    choice = groq_response.choices[0]
                    if choice.message and choice.message.content:
                        return {
                            "guidance_status": "fallback_groq",
                            "provider": f"groq ({groq_model})",
                            "message": choice.message.content.strip()
                        }
            except Exception as e:
                logger.warning(f"Groq ({groq_model}) fallback failed: {e}. Trying next...")

    # 3. Tertiary Static Fallback (When both are unconfigured, invalid, or offline)
    return {
        "guidance_status": "unavailable",
        "provider": "none",
        "message": STATIC_FALLBACK_GUIDANCE
    }
