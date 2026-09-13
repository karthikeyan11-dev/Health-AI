"""
Stress AI V2 Inference Engine
Encapsulates frozen SVM RBF Kernel model artifacts and inference execution.
"""

import os
import json
import logging
import warnings
from typing import Optional, List, Dict, Any

warnings.filterwarnings("ignore")
import joblib
import pandas as pd
import numpy as np

from config import (
    STRESS_MODEL_PATH,
    STRESS_SCALER_PATH,
    STRESS_FEATS_PATH,
    STRESS_META_PATH,
    STRESS_ARTIFACTS_DIR
)
from services.stress.feature_extractor import extract_features_from_window

logger = logging.getLogger("ai_service.stress.inference")

class StressInferenceEngine:
    """
    Singleton engine managing loaded SVM, Scaler, and feature extraction artifacts.
    """
    _instance: Optional["StressInferenceEngine"] = None

    def __init__(self):
        self.model: Optional[Any] = None
        self.scaler: Optional[Any] = None
        self.label_encoder_bin: Optional[Any] = None
        self.feature_names: List[str] = []
        self.metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.load_artifacts()

    @classmethod
    def get_instance(cls) -> "StressInferenceEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self) -> None:
        """Loads model weights, scaler, encoders, and feature definitions."""
        try:
            logger.info("Loading Stress AI V2 Artifacts...")
            self.model = joblib.load(STRESS_MODEL_PATH)
            self.scaler = joblib.load(STRESS_SCALER_PATH)
            
            le_path = os.path.join(STRESS_ARTIFACTS_DIR, "label_encoder_binary.joblib")
            if os.path.exists(le_path):
                self.label_encoder_bin = joblib.load(le_path)
            
            with open(STRESS_FEATS_PATH, "r") as f:
                self.feature_names = json.load(f)
                
            with open(STRESS_META_PATH, "r") as f:
                self.metadata = json.load(f)
                
            self.is_loaded = True
            logger.info(f"✅ Stress AI Engine loaded! ({len(self.feature_names)} features, Model: {type(self.model).__name__})")
        except Exception as e:
            self.is_loaded = False
            logger.error(f"❌ Failed to load Stress AI Engine artifacts: {e}", exc_info=True)
            raise e

    def derive_subject_baseline_from_readings(self, df_readings: pd.DataFrame) -> Dict[str, float]:
        """
        Derives baseline stats automatically from initial readings if no baseline is provided.
        """
        initial_df = df_readings.iloc[:min(30, len(df_readings))]
        
        hr_vals = initial_df['hr'].to_numpy(dtype=float)
        temp_vals = initial_df['temp'].to_numpy(dtype=float)
        spo2_vals = initial_df['SpO2'].to_numpy(dtype=float)
        
        hr_std = float(np.std(hr_vals, ddof=1)) if len(hr_vals) > 1 else 1.0
        temp_std = float(np.std(temp_vals, ddof=1)) if len(temp_vals) > 1 else 1.0
        spo2_std = float(np.std(spo2_vals, ddof=1)) if len(spo2_vals) > 1 else 1.0
        
        return {
            'hr_mean': float(np.mean(hr_vals)),
            'hr_std': hr_std if hr_std >= 1e-6 else 1.0,
            'temp_mean': float(np.mean(temp_vals)),
            'temp_std': temp_std if temp_std >= 1e-6 else 1.0,
            'spo2_mean': float(np.mean(spo2_vals)),
            'spo2_std': spo2_std if spo2_std >= 1e-6 else 1.0,
        }

    def predict(self, readings_raw: List[Dict[str, Any]], custom_baseline: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """
        Executes stress prediction for a window of telemetry readings.
        """
        if not self.is_loaded or self.model is None or self.scaler is None:
            raise RuntimeError("Stress Inference Engine is not fully loaded.")

        if not readings_raw:
            raise ValueError("Telemetry readings list cannot be empty.")

        # Build DataFrame and standardize column names
        df_readings = pd.DataFrame(readings_raw)
        rename_map = {}
        for col in df_readings.columns:
            if col.lower() in ['spo2', 'blood_oxygen']:
                rename_map[col] = 'SpO2'
            elif col.lower() in ['hr', 'heartrate', 'heart_rate']:
                rename_map[col] = 'hr'
            elif col.lower() in ['temp', 'temperature', 'body_temp']:
                rename_map[col] = 'temp'
                
        df_readings = df_readings.rename(columns=rename_map)
        
        # Ensure mandatory columns exist
        for req in ['hr', 'SpO2', 'temp']:
            if req not in df_readings.columns:
                raise ValueError(f"Missing required vital column: {req}")

        # If fewer than 90 readings, tile/pad to 90
        if len(df_readings) < 90:
            repeats = int(np.ceil(90 / len(df_readings)))
            df_readings = pd.concat([df_readings] * repeats, ignore_index=True).iloc[:90]

        # Use or derive baseline
        baseline = custom_baseline or self.derive_subject_baseline_from_readings(df_readings)
        
        # Extract features
        feats_dict = extract_features_from_window(df_readings, baseline)
        feats_df = pd.DataFrame([feats_dict])[self.feature_names]
        
        # Scale & Predict
        scaled_feats = self.scaler.transform(feats_df)
        pred_int = int(self.model.predict(scaled_feats)[0])
        
        # Probability & Confidence
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(scaled_feats)[0]
            stress_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
            confidence = float(np.max(probs))
        else:
            stress_prob = 1.0 if pred_int == 1 else 0.0
            confidence = 1.0

        label_name = "Stress" if pred_int == 1 else "Relax"
        
        summary = {
            "hr_mean": round(float(np.mean(df_readings['hr'])), 1),
            "hr_min": round(float(np.min(df_readings['hr'])), 1),
            "hr_max": round(float(np.max(df_readings['hr'])), 1),
            "spo2_mean": round(float(np.mean(df_readings['SpO2'])), 1),
            "temp_mean": round(float(np.mean(df_readings['temp'])), 1),
        }

        return {
            "primary_prediction": label_name,
            "stress_probability": round(stress_prob, 4),
            "confidence": round(confidence, 4),
            "summary_vitals": summary,
            "model_name": "Support Vector Machine (SVM RBF Kernel)",
            "window_size_sec": len(df_readings)
        }

def get_stress_engine() -> StressInferenceEngine:
    return StressInferenceEngine.get_instance()
