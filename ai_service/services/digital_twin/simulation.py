"""
Digital Twin Trajectory Simulation Engine
Runs the trained PyTorch GRU-Attention model to project 30-day health trajectories,
risk class distributions, and state evolution.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import torch

from config import TWIN_MODEL_PATH, TWIN_STATS_PATH, TWIN_ARTIFACTS_DIR
from services.digital_twin.gru_model import GRUAttentionNet
from services.cardio.features import calculate_clinical_biometrics, format_patient_features

logger = logging.getLogger("ai_service.digital_twin.simulation")

RISK_LABELS = {
    0: "OPTIMAL",
    1: "LOW",
    2: "MODERATE",
    3: "HIGH",
    4: "CRITICAL"
}

MODEL_WEIGHTS_PATH = TWIN_MODEL_PATH
STATS_PATH = TWIN_STATS_PATH

class DigitalTwinSimulator:
    """
    Singleton simulator holding pre-loaded GRU-Attention model and normalization stats.
    """
    _instance: Optional["DigitalTwinSimulator"] = None

    def __init__(self):
        self.model: Optional[GRUAttentionNet] = None
        self.mu: Optional[np.ndarray] = None
        self.sigma: Optional[np.ndarray] = None
        self.feature_cols: List[str] = []
        self.device = torch.device("cpu")
        self.is_loaded = False
        self.load_artifacts()

    @classmethod
    def get_instance(cls) -> "DigitalTwinSimulator":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self) -> None:
        try:
            if not os.path.exists(STATS_PATH) or not os.path.exists(MODEL_WEIGHTS_PATH):
                logger.warning("Digital Twin artifacts not found at %s. Simulator awaiting training.", TWIN_ARTIFACTS_DIR)
                return

            with open(STATS_PATH, "r") as f:
                stats = json.load(f)

            self.mu = np.array(stats["mu"], dtype=np.float32)
            self.sigma = np.array(stats["sigma"], dtype=np.float32)
            self.feature_cols = stats["feature_cols"]

            self.model = GRUAttentionNet(input_dim=len(self.feature_cols)).to(self.device)
            state_dict = torch.load(MODEL_WEIGHTS_PATH, map_location=self.device)
            self.model.load_state_dict(state_dict)
            self.model.eval()

            self.is_loaded = True
            logger.info("✅ Digital Twin GRU-Attention Simulator successfully loaded! (%d features)", len(self.feature_cols))
        except Exception as e:
            self.is_loaded = False
            logger.error("❌ Failed to load Digital Twin Simulator: %s", e, exc_info=True)

    def simulate_trajectory(
        self,
        initial_vitals: Dict[str, Any],
        historical_days: Optional[List[Dict[str, Any]]] = None,
        forecast_days: int = 30
    ) -> Dict[str, Any]:
        """
        Simulates 30-day temporal health trajectory using GRU-Attention network.
        If historical records exist, feeds them as prefix; otherwise generates stochastic projection.
        """
        if not self.is_loaded or self.model is None or self.mu is None or self.sigma is None:
            raise RuntimeError("Digital Twin GRU Simulator is not loaded.")

        # Build 30-day sequence
        sequence_rows = []
        if historical_days and len(historical_days) > 0:
            for day_data in historical_days[:forecast_days]:
                df_day = format_patient_features(day_data, self.feature_cols)
                sequence_rows.append(df_day.values[0])

        # Fill remaining days by projecting forward from initial/latest vitals
        base_vitals = dict(initial_vitals)
        while len(sequence_rows) < forecast_days:
            # Add subtle physiological random walk noise
            day_vitals = dict(base_vitals)
            noise_hr = np.random.normal(0, 1.5)
            noise_sbp = np.random.normal(0, 2.0)
            noise_dbp = np.random.normal(0, 1.0)
            noise_sleep = np.random.normal(0, 0.2)

            day_vitals["resting_hr"] = max(45.0, min(140.0, float(day_vitals.get("resting_hr", 70.0)) + noise_hr))
            day_vitals["bp_systolic"] = max(80.0, min(200.0, float(day_vitals.get("bp_systolic", 120.0)) + noise_sbp))
            day_vitals["bp_diastolic"] = max(50.0, min(120.0, float(day_vitals.get("bp_diastolic", 80.0)) + noise_dbp))
            day_vitals["sleep_hours"] = max(4.0, min(10.0, float(day_vitals.get("sleep_hours", 7.0)) + noise_sleep))

            df_sim = format_patient_features(day_vitals, self.feature_cols)
            sequence_rows.append(df_sim.values[0])

        raw_sequence = np.array(sequence_rows[:forecast_days], dtype=np.float32)  # (30, num_features)
        norm_sequence = (raw_sequence - self.mu) / self.sigma

        # PyTorch Tensor (1, 30, num_features)
        tensor_in = torch.tensor(norm_sequence, dtype=torch.float32).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor_in)  # (1, 30, 5)
            probs = torch.softmax(logits, dim=-1).squeeze(0).cpu().numpy()  # (30, 5)
            predicted_classes = np.argmax(probs, axis=-1)  # (30,)

        # Build trajectory response
        trajectory_points = []
        for day_idx in range(forecast_days):
            p_dist = probs[day_idx]
            r_class = int(predicted_classes[day_idx])
            day_score = round(float(np.sum([i * 25.0 * p for i, p in enumerate(p_dist)])), 1)

            # Extract key vitals for that day
            sbp_idx = self.feature_cols.index("bp_systolic") if "bp_systolic" in self.feature_cols else None
            dbp_idx = self.feature_cols.index("bp_diastolic") if "bp_diastolic" in self.feature_cols else None
            rhr_idx = self.feature_cols.index("resting_hr") if "resting_hr" in self.feature_cols else None
            hrv_idx = self.feature_cols.index("hrv") if "hrv" in self.feature_cols else None

            trajectory_points.append({
                "day": day_idx + 1,
                "risk_class": r_class,
                "risk_level": RISK_LABELS.get(r_class, "UNKNOWN"),
                "risk_score": day_score,
                "confidence": round(float(p_dist[r_class]) * 100, 1),
                "probabilities": {RISK_LABELS[i]: round(float(p), 4) for i, p in enumerate(p_dist)},
                "vitals_snapshot": {
                    "bp_systolic": round(float(raw_sequence[day_idx, sbp_idx]), 1) if sbp_idx is not None else None,
                    "bp_diastolic": round(float(raw_sequence[day_idx, dbp_idx]), 1) if dbp_idx is not None else None,
                    "resting_hr": round(float(raw_sequence[day_idx, rhr_idx]), 1) if rhr_idx is not None else None,
                    "hrv": round(float(raw_sequence[day_idx, hrv_idx]), 1) if hrv_idx is not None else None,
                }
            })

        # Calculate overall 30-day risk summary
        mean_risk_score = round(float(np.mean([p["risk_score"] for p in trajectory_points])), 1)
        risk_trend = "STABLE"
        first_half_mean = np.mean([p["risk_score"] for p in trajectory_points[:15]])
        second_half_mean = np.mean([p["risk_score"] for p in trajectory_points[15:]])
        if second_half_mean - first_half_mean > 5.0:
            risk_trend = "INCREASING_RISK"
        elif first_half_mean - second_half_mean > 5.0:
            risk_trend = "IMPROVING"

        return {
            "status": "success",
            "forecast_days": forecast_days,
            "mean_risk_score": mean_risk_score,
            "risk_trend": risk_trend,
            "trajectory": trajectory_points
        }

def get_digital_twin_simulator() -> DigitalTwinSimulator:
    return DigitalTwinSimulator.get_instance()
