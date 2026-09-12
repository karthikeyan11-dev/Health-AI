"""
Digital Twin FastAPI Router
Exposes 30-day temporal health trajectory simulation powered by PyTorch GRU-Attention model.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from schemas.digital_twin import DigitalTwinSimulateRequest, DigitalTwinSimulateResponse
from services.digital_twin.simulation import get_digital_twin_simulator

logger = logging.getLogger("ai_service.routers.digital_twin")
router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])

@router.post(
    "/simulate",
    response_model=DigitalTwinSimulateResponse,
    status_code=status.HTTP_200_OK,
    summary="Simulate 30-Day Digital Twin Trajectory",
    description="Projects 30-day temporal health trajectory and state evolution using deep PyTorch GRU-Attention network."
)
async def simulate_trajectory(payload: DigitalTwinSimulateRequest):
    try:
        simulator = get_digital_twin_simulator()
        if not simulator.is_loaded:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Digital Twin GRU Simulation Engine is not loaded."
            )

        result = simulator.simulate_trajectory(
            initial_vitals=payload.initial_vitals,
            historical_days=payload.historical_days,
            forecast_days=payload.forecast_days
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error during Digital Twin trajectory simulation: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Digital Twin simulation failed: {str(e)}"
        )
