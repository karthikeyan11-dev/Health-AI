"""
Pydantic Schemas for Digital Twin Trajectory Simulation
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class DigitalTwinSimulateRequest(BaseModel):
    user_id: Optional[str] = Field(default=None, description="Patient User ID")
    initial_vitals: Dict[str, Any] = Field(..., description="Current/latest vitals snapshot")
    historical_days: Optional[List[Dict[str, Any]]] = Field(default=None, description="Historical sequence of daily vitals")
    forecast_days: int = Field(default=30, ge=1, le=90, description="Number of future days to simulate")

class VitalsSnapshot(BaseModel):
    bp_systolic: Optional[float] = None
    bp_diastolic: Optional[float] = None
    resting_hr: Optional[float] = None
    hrv: Optional[float] = None

class TrajectoryPoint(BaseModel):
    day: int
    risk_class: int
    risk_level: str
    risk_score: float
    confidence: float
    probabilities: Dict[str, float]
    vitals_snapshot: VitalsSnapshot

class DigitalTwinSimulateResponse(BaseModel):
    status: str
    forecast_days: int
    mean_risk_score: float
    risk_trend: str
    trajectory: List[TrajectoryPoint]
