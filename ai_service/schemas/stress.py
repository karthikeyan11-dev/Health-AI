"""
Pydantic Schemas for Autonomic Stress Assessment
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class ReadingItem(BaseModel):
    hr: float = Field(..., description="Heart rate in BPM", ge=30.0, le=240.0)
    spo2: float = Field(..., description="Blood oxygen SpO2 %", ge=70.0, le=100.0)
    temp: float = Field(..., description="Body temperature in Celsius", ge=30.0, le=45.0)
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp string")

class SubjectBaseline(BaseModel):
    hr_mean: float = Field(default=75.0, ge=30.0, le=200.0)
    hr_std: float = Field(default=5.0, ge=0.01, le=50.0)
    temp_mean: float = Field(default=36.6, ge=30.0, le=43.0)
    temp_std: float = Field(default=0.3, ge=0.001, le=5.0)
    spo2_mean: float = Field(default=98.0, ge=70.0, le=100.0)
    spo2_std: float = Field(default=0.5, ge=0.001, le=10.0)

class StressPredictRequest(BaseModel):
    readings: List[ReadingItem] = Field(..., min_length=1, description="Array of 1Hz physiological readings (ideal: 90s)")
    subject_baseline: Optional[SubjectBaseline] = Field(default=None, description="Optional custom patient baseline statistics")

class SummaryVitals(BaseModel):
    hr_mean: float
    hr_min: float
    hr_max: float
    spo2_mean: float
    temp_mean: float

class StressPredictResponse(BaseModel):
    primary_prediction: str
    stress_probability: float
    confidence: float
    summary_vitals: Dict[str, float]
    model_name: str
    window_size_sec: int
