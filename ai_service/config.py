"""
Configuration module for Unified AI Hub Service
Loads environment variables and sets artifact file paths.
"""

import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

# Sub-artifact paths
CARDIO_ARTIFACTS_DIR = os.path.join(ARTIFACTS_DIR, "cardio")
STRESS_ARTIFACTS_DIR = os.path.join(ARTIFACTS_DIR, "stress")

# Model File Paths
CARDIO_MODEL_PATH = os.path.join(CARDIO_ARTIFACTS_DIR, "cardio_risk_catboost_candidate.cbm")
CARDIO_SCALER_PATH = os.path.join(CARDIO_ARTIFACTS_DIR, "cardio_risk_catboost_candidate_scaler.pkl")
CARDIO_PPO_PATH = os.path.join(CARDIO_ARTIFACTS_DIR, "ppo_cardio_agent.zip")
CARDIO_TEMPLATE_PATH = os.path.join(CARDIO_ARTIFACTS_DIR, "template_features.csv")

STRESS_MODEL_PATH = os.path.join(STRESS_ARTIFACTS_DIR, "best_stress_model.joblib")
STRESS_SCALER_PATH = os.path.join(STRESS_ARTIFACTS_DIR, "scaler.joblib")
STRESS_FEATS_PATH = os.path.join(STRESS_ARTIFACTS_DIR, "feature_names.json")
STRESS_META_PATH = os.path.join(STRESS_ARTIFACTS_DIR, "model_metadata.json")

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Server settings
PORT = int(os.getenv("PORT", "5001"))
HOST = os.getenv("HOST", "0.0.0.0")
