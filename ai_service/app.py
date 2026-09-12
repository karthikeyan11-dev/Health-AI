"""
Unified AI Hub Microservice Entrypoint
Serves Cardiovascular Risk, Autonomic Stress, Digital Twin Trajectory Simulation, and System Health on Port 5001.
"""

import sys
import os
import logging
from contextlib import asynccontextmanager

_APP_DIR = os.path.dirname(os.path.abspath(__file__))
if _APP_DIR not in sys.path:
    sys.path.insert(0, _APP_DIR)

# Auto-add local venv if present
_VENV_SITE = os.path.join(_APP_DIR, "venv", "lib", f"python{sys.version_info.major}.{sys.version_info.minor}", "site-packages")
if os.path.exists(_VENV_SITE) and _VENV_SITE not in sys.path:
    sys.path.insert(0, _VENV_SITE)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import PORT, HOST
from services.cardio.inference import get_cardio_engine
from services.stress.inference import get_stress_engine
from services.digital_twin.simulation import get_digital_twin_simulator
from routers import health, cardio, stress, digital_twin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to safely preload all ML model artifacts into RAM at startup.
    Eliminates cold-start inference latency.
    """
    logger.info("Initializing Unified Health AI Hub Service...")
    try:
        # Preload Cardio Engine (Random Forest, Scaler, PPO, SHAP background)
        cardio_eng = get_cardio_engine()
        logger.info(f"🚀 Cardio AI Engine initialized: {len(cardio_eng.feature_cols)} features loaded.")
        
        # Preload Stress Engine (SVM, Scaler, Metadata)
        stress_eng = get_stress_engine()
        logger.info(f"🚀 Stress AI Engine initialized: {len(stress_eng.feature_names)} features loaded.")

        # Preload Digital Twin GRU-Attention Simulator
        twin_sim = get_digital_twin_simulator()
        logger.info(f"🚀 Digital Twin GRU Simulator initialized: {len(twin_sim.feature_cols)} features loaded.")
        
        logger.info("🎯 All AI Microservice Models are preloaded and ready for real-time inference!")
    except Exception as e:
        logger.error(f"❌ Failed to initialize AI models at startup: {e}", exc_info=True)
        raise e
        
    yield
    logger.info("Shutting down Unified Health AI Hub Service...")

app = FastAPI(
    title="Health AI Unified Hub",
    description="Unified AI service providing Cardiovascular Risk, Autonomic Stress, and Digital Twin Intelligence.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for internal backend gateway communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health.router)
app.include_router(cardio.router)
app.include_router(stress.router)
app.include_router(digital_twin.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=HOST, port=PORT, reload=False)
