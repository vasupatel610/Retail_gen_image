"""
Application configuration management.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Get the project root directory (parent of app directory)
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings"""
    
    # App Info
    APP_NAME: str = "Image Generation API"
    VERSION: str = "1.0.0"
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8010"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # API Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Image Settings
    MAX_IMAGE_SIZE: int = int(os.getenv("MAX_IMAGE_SIZE", "10485760"))  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp"]
    OUTPUT_DIR: str = str(BASE_DIR / os.getenv("OUTPUT_DIR", "outputs"))
    UPLOAD_DIR: str = str(BASE_DIR / os.getenv("UPLOAD_DIR", "uploads"))
    
    # Gemini Model
    GEMINI_MODEL: str = "gemini-2.5-flash-image"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]  # Configure this for production
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env


settings = Settings()

# Create necessary directories
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
