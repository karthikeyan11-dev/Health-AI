"""
Autonomic Stress Assessment Router
"""

import logging
from fastapi import APIRouter, HTTPException, status
from schemas.stress import StressPredictRequest, StressPredictResponse
from services.stress.inference import get_stress_engine

logger = logging.getLogger("ai_service.routers.stress")
router = APIRouter(prefix="/stress", tags=["Stress Assessment"])

@router.post("/predict", response_model=StressPredictResponse)
async def predict_stress(payload: StressPredictRequest):
    """
    Predicts autonomic stress level from physiological telemetry window (HR, SpO2, Temp).
    """
    engine = get_stress_engine()
    if not engine.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stress inference engine is not ready."
        )

    try:
        readings_raw = [r.model_dump() for r in payload.readings]
        custom_baseline = payload.subject_baseline.model_dump() if payload.subject_baseline else None
        result = engine.predict(readings_raw, custom_baseline)
        return StressPredictResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        logger.error(f"Error during stress prediction: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stress prediction failed: {str(e)}"
        )
