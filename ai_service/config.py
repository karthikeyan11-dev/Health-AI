"""
Configuration module for Unified AI Hub Service
Loads environment variables and sets artifact file paths.
"""

import os
try:
    from dotenv import load_dotenv
    _BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    _local_env = os.path.join(_BASE_DIR, ".env")
    _root_env = os.path.join(os.path.dirname(_BASE_DIR), ".env")
    if os.path.exists(_local_env):
        load_dotenv(_local_env)
    elif os.path.exists(_root_env):
        load_dotenv(_root_env)
    else:
        load_dotenv()
except ImportError:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.getenv("AI_ARTIFACTS_DIR", os.path.join(BASE_DIR, "artifacts"))

# Sub-artifact directory paths
CARDIO_ARTIFACTS_DIR = os.path.join(ARTIFACTS_DIR, "cardio")
STRESS_ARTIFACTS_DIR = os.path.join(ARTIFACTS_DIR, "stress")
TWIN_ARTIFACTS_DIR = os.path.join(ARTIFACTS_DIR, "digital_twin")

# Cardiovascular & Digital Twin Artifact Paths
CARDIO_MODEL_PATH = os.getenv("CARDIO_MODEL_PATH", os.path.join(CARDIO_ARTIFACTS_DIR, "rf_risk_classifier.joblib"))
CARDIO_SCALER_PATH = os.getenv("CARDIO_SCALER_PATH", os.path.join(CARDIO_ARTIFACTS_DIR, "feature_scaler.joblib"))
CARDIO_PPO_PATH = os.getenv("CARDIO_PPO_PATH", os.path.join(CARDIO_ARTIFACTS_DIR, "ppo_intervention_agent.zip"))
CARDIO_SHAP_BG_PATH = os.getenv("CARDIO_SHAP_BG_PATH", os.path.join(CARDIO_ARTIFACTS_DIR, "shap_background.joblib"))
CARDIO_TEMPLATE_PATH = os.getenv("CARDIO_TEMPLATE_PATH", os.path.join(CARDIO_ARTIFACTS_DIR, "template_features.csv"))
CARDIO_FEATS_PATH = os.getenv("CARDIO_FEATS_PATH", os.path.join(CARDIO_ARTIFACTS_DIR, "feature_names.json"))

TWIN_MODEL_PATH = os.getenv("TWIN_MODEL_PATH", os.path.join(TWIN_ARTIFACTS_DIR, "gru_attention_net.pt"))
TWIN_STATS_PATH = os.getenv("TWIN_STATS_PATH", os.path.join(TWIN_ARTIFACTS_DIR, "normalization_stats.json"))

# Stress Artifact Paths
STRESS_MODEL_PATH = os.getenv("STRESS_MODEL_PATH", os.path.join(STRESS_ARTIFACTS_DIR, "best_stress_model.joblib"))
STRESS_SCALER_PATH = os.getenv("STRESS_SCALER_PATH", os.path.join(STRESS_ARTIFACTS_DIR, "scaler.joblib"))
STRESS_FEATS_PATH = os.getenv("STRESS_FEATS_PATH", os.path.join(STRESS_ARTIFACTS_DIR, "feature_names.json"))
STRESS_META_PATH = os.getenv("STRESS_META_PATH", os.path.join(STRESS_ARTIFACTS_DIR, "model_metadata.json"))

# API Keys & LLM Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-3.5-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.6-flash")
GEMINI_TIMEOUT_MS = int(os.getenv("GEMINI_TIMEOUT_MS", "10000"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_PRIMARY_MODEL = os.getenv("GROQ_PRIMARY_MODEL", "openai/gpt-oss-120b")
GROQ_FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "qwen/qwen3.8-27b")
GROQ_TIMEOUT_MS = int(os.getenv("GROQ_TIMEOUT_MS", "5000"))

GUIDANCE_MAX_TOKENS = int(os.getenv("GUIDANCE_MAX_TOKENS", "250"))
GUIDANCE_TEMPERATURE = float(os.getenv("GUIDANCE_TEMPERATURE", "0.6"))

# Digital Twin Simulation Defaults
TWIN_DEFAULT_FORECAST_DAYS = int(os.getenv("TWIN_DEFAULT_FORECAST_DAYS", "30"))
TWIN_MAX_FORECAST_DAYS = int(os.getenv("TWIN_MAX_FORECAST_DAYS", "90"))

# Server Settings & Networking
PORT = int(os.getenv("PORT", "5001"))
HOST = os.getenv("HOST", "0.0.0.0")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = [orig.strip() for orig in CORS_ORIGINS_RAW.split(",")] if CORS_ORIGINS_RAW != "*" else ["*"]
