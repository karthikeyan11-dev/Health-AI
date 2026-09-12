"""
Cardiovascular Risk Assessment Router
"""

import logging
from fastapi import APIRouter, HTTPException, status
from schemas.cardio import CardioPredictRequest, CardioPredictResponse
from services.cardio.inference import get_cardio_engine

logger = logging.getLogger("ai_service.routers.cardio")
router = APIRouter(prefix="/cardio", tags=["Cardiovascular Risk"])

@router.post("/predict", response_model=CardioPredictResponse)
async def predict_cardiovascular_risk(payload: CardioPredictRequest):
    """
    Predicts cardiovascular risk using CatBoost classifier, extracts Top 3 SHAP drivers,
    determines optimal intervention via PPO RL agent, and synthesizes patient guidance.
    """
    engine = get_cardio_engine()
    if not engine.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cardiovascular inference engine is not ready."
        )

    try:
        data_dict = payload.model_dump()
        result = engine.predict(data_dict)
        return CardioPredictResponse(**result)
    except Exception as e:
        logger.error(f"Error during cardio prediction: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cardiovascular prediction failed: {str(e)}"
        )
