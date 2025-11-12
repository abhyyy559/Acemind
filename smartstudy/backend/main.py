from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os
import logging

# Import routers
from app.routers import auth, users, quiz, notes, study_sessions, quiz_v2
from app.database import init_database, close_database
from app.config.cors import get_cors_config

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    yield
    # Shutdown
    await close_database()

# Create FastAPI app
app = FastAPI(
    title="SmartStudy API",
    description="AI-powered study companion backend with DeepSeek integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS with environment-aware settings
cors_config = get_cors_config()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_config.allowed_origins,
    allow_credentials=cors_config.allow_credentials,
    allow_methods=cors_config.allowed_methods,
    allow_headers=cors_config.allowed_headers,
    expose_headers=cors_config.expose_headers,
)

# Log CORS configuration
logging.info(f"CORS configured with origins: {cors_config.allowed_origins}")
logging.info(f"CORS allow credentials: {cors_config.allow_credentials}")
logging.info(f"CORS allowed methods: {cors_config.allowed_methods}")

# Add CORS logging middleware
@app.middleware("http")
async def cors_logging_middleware(request, call_next):
    origin = request.headers.get("origin")
    method = request.method
    path = request.url.path
    
    if origin:
        logging.info(f"CORS request: {method} {path} from {origin}")
    
    response = await call_next(request)
    
    # Log CORS headers in response for debugging
    cors_headers = {
        key: value for key, value in response.headers.items() 
        if key.lower().startswith("access-control-")
    }
    
    if cors_headers and origin:
        logging.debug(f"CORS response headers for {origin}: {cors_headers}")
    
    return response

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
app.include_router(quiz_v2.router, prefix="/quiz/v2", tags=["Quiz V2 (Fast)"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(study_sessions.router, prefix="/study-sessions", tags=["Study Sessions"])

@app.get("/")
async def root():
    return {
        "message": "SmartStudy FastAPI Backend",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "smartstudy-api"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 4000)),
        reload=True,
        log_level="info"
    )