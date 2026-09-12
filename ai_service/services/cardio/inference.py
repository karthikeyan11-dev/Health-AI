"""
Cardiovascular Risk Inference Engine (MATLAB Research Model Upgrade)
Loads frozen 5-Class Random Forest Classifier, StandardScaler, PPO Policy, and SHAP Explainer into memory.
Performs sub-second deterministic inference with clinical safety action masking.
"""

import os
import json
import logging
import warnings
from typing import Dict, Any, List, Optional

warnings.filterwarnings("ignore")
import joblib
import pandas as pd
import numpy as np
import shap
from sklearn.ensemble import RandomForestClassifier
from stable_baselines3 import PPO

from config import (
    CARDIO_MODEL_PATH,
    CARDIO_SCALER_PATH,
    CARDIO_PPO_PATH,
    CARDIO_SHAP_BG_PATH,
    CARDIO_FEATS_PATH,
    TWIN_STATS_PATH,
    GEMINI_API_KEY,
    GROQ_API_KEY
)
from services.cardio.features import calculate_clinical_biometrics, format_patient_features
from services.cardio.guidance import generate_patient_guidance

logger = logging.getLogger("ai_service.cardio.inference")

RISK_LABELS = {
    0: "OPTIMAL",
    1: "LOW",
    2: "MODERATE",
    3: "HIGH",
    4: "CRITICAL"
}

# 4 Discrete Clinical Actions from MATLAB CardioEnv
ACTION_MAP = {
    0: "Maintain Routine / Rest & Monitor",
    1: "Diet & Nutrition Intervention (Reduce Sodium / BP Control)",
    2: "Sleep & Recovery Improvement Protocol",
    3: "Increase Physical Activity / Cardio Rehabilitation",
}

class CardioInferenceEngine:
    """
    Singleton engine managing loaded Random Forest, Scaler, PPO, and SHAP explainer artifacts.
    """
    _instance: Optional["CardioInferenceEngine"] = None

    def __init__(self):
        self.clf: Optional[RandomForestClassifier] = None
        self.scaler: Optional[Any] = None
        self.ppo_agent: Optional[PPO] = None
        self.explainer: Optional[shap.KernelExplainer] = None
        self.feature_cols: List[str] = []
        self.twin_mu: Optional[np.ndarray] = None
        self.twin_sigma: Optional[np.ndarray] = None
        self.is_loaded: bool = False
        self.load_artifacts()

    @classmethod
    def get_instance(cls) -> "CardioInferenceEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self) -> None:
        """Loads all model weights and initializes SHAP background sample."""
        try:
            logger.info("Loading Cardiovascular AI Artifacts...")
            
            if not os.path.exists(CARDIO_MODEL_PATH):
                logger.warning("Cardiovascular model not yet exported to %s.", CARDIO_MODEL_PATH)
                return

            # 1. Load Feature Names
            with open(CARDIO_FEATS_PATH, "r") as f:
                self.feature_cols = json.load(f)

            # 2. Load Scaler & Random Forest Classifier
            self.scaler = joblib.load(CARDIO_SCALER_PATH)
            self.clf = joblib.load(CARDIO_MODEL_PATH)

            # 3. Load PPO RL Agent
            self.ppo_agent = PPO.load(CARDIO_PPO_PATH)

            # 4. Load Normalization stats for PPO observation state
            if os.path.exists(TWIN_STATS_PATH):
                with open(TWIN_STATS_PATH, "r") as f:
                    t_stats = json.load(f)
                    self.twin_mu = np.array(t_stats["mu"], dtype=np.float32)
                    self.twin_sigma = np.array(t_stats["sigma"], dtype=np.float32)

            # 5. Initialize Kernel SHAP Explainer with saved background data
            if os.path.exists(CARDIO_SHAP_BG_PATH):
                bg_data = joblib.load(CARDIO_SHAP_BG_PATH)
                # Use kmeans summary for ultra-fast SHAP computation
                summary_bg = shap.kmeans(bg_data, 10)
                self.explainer = shap.KernelExplainer(self.clf.predict_proba, summary_bg)

            self.is_loaded = True
            logger.info(f"✅ Cardiovascular AI Engine loaded! ({len(self.feature_cols)} features)")
        except Exception as e:
            self.is_loaded = False
            logger.error(f"❌ Failed to load Cardiovascular AI Engine artifacts: {e}", exc_info=True)

    def check_action_safety(self, action: int, raw_dict: Dict[str, Any]) -> tuple[bool, int]:
        """
        Rule-Guided Action Masking (Safety Guardrails):
        Blocks vigorous exercise (Action 3) if systolic BP >= 160 or resting HR >= 100.
        Falls back to Maintain Routine / Rest (Action 0).
        """
        sbp = float(raw_dict.get("bp_systolic") or raw_dict.get("systolic_bp") or 120.0)
        rhr = float(raw_dict.get("resting_hr") or raw_dict.get("heart_rate") or 70.0)

        is_safe = True
        effective_action = action

        if action == 3 and (sbp >= 160.0 or rhr >= 100.0):
            is_safe = False
            effective_action = 0  # Fall back to Maintain Routine / Rest

        return is_safe, effective_action

    def predict(
        self,
        patient_data: Dict[str, Any],
        gemini_key: Optional[str] = None,
        groq_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes verified end-to-end cardiovascular inference pipeline:
        1. Feature formatting & deterministic clinical feature calculations (PP, MAP, RPP, Sleep Impact, Autonomic Stress)
        2. 5-Class Bagged Random Forest Risk Classification
        3. Kernel SHAP Top 3 physiological attribution drivers
        4. PPO RL policy action prediction with Rule-Guided Action Masking Guardrails
        5. Empathetic patient guidance synthesis (Gemini -> Groq -> Clinical Fallback)
        """
        if not self.is_loaded or self.clf is None or self.scaler is None or self.ppo_agent is None or self.explainer is None:
            raise RuntimeError("Cardiovascular Inference Engine is not fully loaded.")

        # 1. Format Features & Calculate Derived Biometrics
        df_input = format_patient_features(patient_data, self.feature_cols)
        biometrics = calculate_clinical_biometrics(patient_data)
        scaled_input = self.scaler.transform(df_input)

        # 2. Random Forest Classification
        probabilities = self.clf.predict_proba(scaled_input)[0]
        risk_class = int(np.argmax(probabilities))
        confidence = float(probabilities[risk_class])
        risk_level = RISK_LABELS.get(risk_class, "UNKNOWN")

        # Risk score on continuous 0-100 scale: sum(class_idx * 25 * prob)
        risk_score = round(float(np.sum([i * 25.0 * p for i, p in enumerate(probabilities)])), 1)

        # 3. Kernel SHAP Attribution
        shap_values = self.explainer.shap_values(scaled_input)
        if isinstance(shap_values, list):
            pred_shap = shap_values[risk_class]
        else:
            pred_shap = shap_values[:, :, risk_class]

        feature_impacts = np.abs(pred_shap[0])
        top_indices = np.argsort(feature_impacts)[-3:][::-1]

        top_features_list = []
        top_drivers_structured = []
        for idx in top_indices:
            feat_name = self.feature_cols[idx]
            raw_val = float(df_input.iloc[0][feat_name])
            shap_impact = float(feature_impacts[idx])
            top_features_list.append(f"{feat_name} ({raw_val:.1f})")
            top_drivers_structured.append({
                "feature": feat_name,
                "value": round(raw_val, 2),
                "impact": round(shap_impact, 4)
            })

        shap_string = ", ".join(top_features_list)

        # 4. PPO RL Intervention Policy with Rule-Guided Action Masking
        if self.twin_mu is not None and self.twin_sigma is not None:
            norm_vector = (df_input.values.astype(np.float32)[0] - self.twin_mu) / self.twin_sigma
            obs_state = np.append(norm_vector, float(risk_class)).astype(np.float32)
        else:
            obs_state = np.append(scaled_input[0].astype(np.float32), float(risk_class)).astype(np.float32)

        raw_action_id, _ = self.ppo_agent.predict(obs_state, deterministic=True)
        raw_action_id = int(raw_action_id)

        # Apply Safety Guardrail Action Masking
        is_safe, effective_action_id = self.check_action_safety(raw_action_id, biometrics)
        recommended_intervention = ACTION_MAP.get(effective_action_id, "Maintain Routine / Rest & Monitor")

        # 5. Patient Guidance Synthesis
        guidance = generate_patient_guidance(
            risk_class=risk_class,
            risk_level=risk_level,
            confidence=confidence,
            shap_drivers=shap_string,
            recommended_intervention=recommended_intervention,
            gemini_api_key=gemini_key or GEMINI_API_KEY,
            groq_api_key=groq_key or GROQ_API_KEY
        )

        # 6. Assemble Structured Response
        return {
            "status": "success",
            "assessment": {
                "risk_class": risk_class,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "confidence": round(confidence * 100, 2),
                "probabilities": {RISK_LABELS[i]: round(float(p), 4) for i, p in enumerate(probabilities)},
                "biometrics": biometrics,
                "top_drivers": top_drivers_structured,
                "shap_string": shap_string,
                "recommended_intervention": recommended_intervention,
                "action_id": effective_action_id,
                "raw_action_id": raw_action_id,
                "is_action_safe": is_safe
            },
            "guidance": guidance
        }

def get_cardio_engine() -> CardioInferenceEngine:
    return CardioInferenceEngine.get_instance()
