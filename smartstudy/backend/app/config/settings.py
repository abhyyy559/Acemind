from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/acemind"
    DATABASE_NAME: str = "acemind"
    
    # AI APIs (Priority: OpenAI > DeepSeek > Ollama)
    OPENAI_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"
    
    # NVIDIA AI (Alternative/Primary AI provider)
    NVIDIA_API_KEY: str = ""
    
    # Ollama (Local AI - No limits!)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "deepseek-coder-v2:latest"
    
    # Google Vision API (OCR for image-based PDFs)
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GOOGLE_CLOUD_PROJECT: str = ""
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 4000  # Changed to match NestJS backend port
    DEBUG: bool = True
    
    # Environment Configuration
    ENVIRONMENT: str = "development"
    
    # CORS Configuration - Dynamic based on environment
    def get_allowed_origins(self) -> List[str]:
        """Get CORS origins based on environment"""
        base_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",  # Vite dev server
        ]
        
        # Add production origins
        production_origins = [
            "https://acemind-study.vercel.app",
            "https://acemind-study.vercel.app/",
        ]
        
        # In production, include both dev and prod origins for flexibility
        return base_origins + production_origins
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return self.get_allowed_origins()
    CORS_ORIGINS: str = ""  # Comma-separated string for custom environments
    CORS_DEBUG: bool = True
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env file

settings = Settings()