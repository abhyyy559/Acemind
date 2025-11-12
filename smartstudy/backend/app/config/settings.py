from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/acemind"
    DATABASE_NAME: str = "acemind"
    
    # DeepSeek AI
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
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
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