"""
Pydantic Schemas for Cardiovascular Risk Assessment
"""

from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field

CardiovascularRiskLevel = Literal["OPTIMAL", "LOW", "MODERATE", "HIGH", "CRITICAL"]

class CardioPredictRequest(BaseModel):
    # Demographics & Clinical Attributes
    age: float = Field(default=35.0, ge=1.0, le=120.0, description="Age in years")
    sex: int = Field(default=1, ge=0, le=1, description="Sex: 1 for Male, 0 for Female")
    bmi: float = Field(default=24.5, ge=10.0, le=70.0, description="Body Mass Index")
    smoking_status: int = Field(default=0, ge=0, le=1, description="Smoking status (1=smoker, 0=non-smoker)")
    family_history_cvd: int = Field(default=0, ge=0, le=1, description="Family history of CVD (1=yes, 0=no)")
    
    # Telemetry / Biometrics
    avg_heart_rate: float = Field(default=75.0, ge=30.0, le=240.0, description="Average Heart Rate (BPM)")
    resting_hr: float = Field(default=68.0, ge=30.0, le=180.0, description="Resting Heart Rate (BPM)")
    spo2: float = Field(default=98.0, ge=70.0, le=100.0, description="Blood Oxygen Saturation (%)")
    body_temp_c: float = Field(default=36.6, ge=34.0, le=43.0, description="Body Temperature in Celsius")
    bp_systolic: float = Field(default=120.0, ge=60.0, le=260.0, description="Systolic Blood Pressure (mmHg)")
    bp_diastolic: float = Field(default=80.0, ge=40.0, le=160.0, description="Diastolic Blood Pressure (mmHg)")
    hrv: float = Field(default=45.0, ge=5.0, le=250.0, description="Heart Rate Variability (ms)")
    
    # Lifestyle & Daily Activity
    steps: float = Field(default=7500.0, ge=0.0, le=100000.0, description="Daily steps count")
    calories_burned: float = Field(default=2200.0, ge=0.0, le=15000.0, description="Total daily calories burned (kcal)")
    distance_km: float = Field(default=5.0, ge=0.0, le=100.0, description="Daily distance walked/run in km")
    sleep_hours: float = Field(default=7.5, ge=0.0, le=24.0, description="Daily sleep duration in hours")
    sleep_efficiency: float = Field(default=0.85, ge=0.0, le=1.0, description="Sleep efficiency ratio (0.0 - 1.0)")
    calories_consumed: float = Field(default=2100.0, ge=0.0, le=15000.0, description="Daily calories consumed (kcal)")
    water_intake_l: float = Field(default=2.5, ge=0.0, le=20.0, description="Daily water intake in liters")
    
    # Activity Mode
    activity_type: Optional[str] = Field(default="Walking", description="Primary activity: Cycling, Mixed_Cardio, Rest, Running, Strength, Walking, Yoga")
    activity_Cycling: Optional[float] = None
    activity_Mixed_Cardio: Optional[float] = None
    activity_Rest: Optional[float] = None
    activity_Running: Optional[float] = None
    activity_Strength: Optional[float] = None
    activity_Walking: Optional[float] = None
    activity_Yoga: Optional[float] = None

class ShapDriver(BaseModel):
    feature: str
    value: float
    impact: float

class GuidancePayload(BaseModel):
    guidance_status: str
    provider: str
    message: str

class CardioAssessmentData(BaseModel):
    risk_class: int
    risk_level: CardioPredictRequest
    risk_level_str: str = Field(alias="risk_level")
    confidence: float
    probabilities: Dict[str, float]
    top_drivers: List[ShapDriver]
    shap_string: str
    recommended_intervention: str
    action_id: int

class CardioPredictResponse(BaseModel):
    status: str
    assessment: Dict[str, object]
    guidance: GuidancePayload
