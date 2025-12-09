from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.database import init_database, close_database
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await init_database()
        logger.info("✅ Database connected successfully")
    except Exception as e:
        logger.warning(f"⚠️ Database connection failed: {e}")
        logger.info("🚀 Starting without database for testing...")
    
    logger.info("🚀 FastAPI AceMind Backend Started!")
    logger.info(f"📊 Database: {settings.DATABASE_NAME}")
    logger.info(f"🤖 DeepSeek API: {'Configured' if settings.DEEPSEEK_API_KEY else 'Not Configured'}")
    yield
    # Shutdown
    try:
        await close_database()
    except:
        pass
    logger.info("👋 FastAPI AceMind Backend Shutting Down...")

# Create FastAPI app
app = FastAPI(
    title="AceMind API",
    description="AI-Powered Study Platform with DeepSeek Integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Import routers
from app.routers import auth, users, notes, study_sessions, quiz, quiz_v2, test_quiz, roadmap

# Include routers
app.include_router(test_quiz.router, prefix="/test", tags=["Test Quiz Generation"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(study_sessions.router, prefix="/study-sessions", tags=["Study Sessions"])
app.include_router(quiz_v2.router, prefix="/quiz/v2", tags=["Quiz V2 - Fast"])
app.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
app.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])

# Health check endpoints
@app.get("/")
async def root():
    return {
        "message": "🎓 Welcome to AceMind API",
        "version": "2.0.0",
        "docs": "/docs",
        "features": [
            "🧠 AI Quiz Generation with DeepSeek",
            "📅 AI Study Planning",
            "📝 Notes Management",
            "📊 Progress Analytics",
            "🔐 User Authentication"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "available" if settings.DEEPSEEK_API_KEY else "not_configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )