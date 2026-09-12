"""
Health and Readiness Probes for AI Service
"""

import time
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from services.cardio.inference import get_cardio_engine
from services.stress.inference import get_stress_engine

router = APIRouter(tags=["Health"])

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str

class ReadyResponse(BaseModel):
    status: str
    cardio_model_loaded: bool
    stress_model_loaded: bool
    timestamp: str

@router.get("/health", response_model=HealthResponse)
async def get_health():
    return HealthResponse(
        status="healthy",
        service="health-ai-unified-hub",
        version="1.0.0",
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    )

@router.get("/ready", response_model=ReadyResponse)
async def get_readiness():
    try:
        cardio = get_cardio_engine()
        stress = get_stress_engine()
        
        if not cardio.is_loaded or not stress.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="One or more AI model engines are not loaded."
            )
            
        return ReadyResponse(
            status="ready",
            cardio_model_loaded=cardio.is_loaded,
            stress_model_loaded=stress.is_loaded,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Readiness check failed: {str(e)}"
        )
