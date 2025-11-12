"""
CORS Configuration Module

This module provides environment-aware CORS configuration for the FastAPI backend,
enabling secure communication with the React frontend while maintaining security
best practices across different deployment environments.
"""

from typing import List
import os
import logging

logger = logging.getLogger(__name__)


class CORSConfig:
    """
    CORS configuration class that provides environment-specific settings
    for Cross-Origin Resource Sharing.
    """
    
    def __init__(self):
        self.allowed_origins = self._get_allowed_origins()
        self.allowed_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        self.allowed_headers = [
            "Content-Type", 
            "Authorization", 
            "Accept", 
            "Origin", 
            "X-Requested-With",
            "X-CSRF-Token"
        ]
        self.allow_credentials = True
        self.expose_headers = self._get_expose_headers()
        
        # Log configuration for debugging
        logger.info(f"CORS configured for environment: {os.getenv('ENVIRONMENT', 'development')}")
        logger.info(f"Allowed origins: {self.allowed_origins}")
    
    def _get_allowed_origins(self) -> List[str]:
        """
        Get allowed origins based on environment configuration.
        
        Returns:
            List[str]: List of allowed origin URLs
        """
        env = os.getenv("ENVIRONMENT", "development").lower()
        
        if env == "development":
            # Development environment - allow localhost origins
            return [
                "http://localhost:3000",
                "http://localhost:3001", 
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
                "http://localhost:5173",  # Vite default port
                "http://127.0.0.1:5173"
            ]
        elif env == "production":
            # Production environment - use configured domains
            origins_env = os.getenv("ALLOWED_ORIGINS", "")
            if origins_env:
                origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]
                logger.info(f"Production origins from env: {origins}")
                return origins
            else:
                logger.warning("No ALLOWED_ORIGINS set for production environment")
                return []
        else:
            # Custom environment - check for CORS_ORIGINS
            custom_origins = os.getenv("CORS_ORIGINS", "")
            if custom_origins:
                origins = [origin.strip() for origin in custom_origins.split(",") if origin.strip()]
                logger.info(f"Custom origins: {origins}")
                return origins
            else:
                # Safe default for unknown environments
                logger.info("Using safe default origins for unknown environment")
                return ["http://localhost:3001"]
    
    def _get_expose_headers(self) -> List[str]:
        """
        Get headers to expose based on environment.
        
        Returns:
            List[str]: List of headers to expose
        """
        env = os.getenv("ENVIRONMENT", "development").lower()
        
        if env == "production":
            # Limit exposed headers in production for security
            return ["Content-Type", "Authorization", "X-Total-Count"]
        else:
            # More permissive for development
            return ["*"]
    
    def is_origin_allowed(self, origin: str) -> bool:
        """
        Check if an origin is allowed.
        
        Args:
            origin (str): The origin to check
            
        Returns:
            bool: True if origin is allowed, False otherwise
        """
        if not origin:
            return False
            
        # Check exact matches first
        if origin in self.allowed_origins:
            return True
            
        # For development, also check pattern matches
        env = os.getenv("ENVIRONMENT", "development").lower()
        if env == "development":
            import re
            localhost_pattern = r"^https?://(?:localhost|127\.0\.0\.1):\d+$"
            if re.match(localhost_pattern, origin):
                return True
                
        return False


def get_cors_config() -> CORSConfig:
    """
    Factory function to get CORS configuration instance.
    
    Returns:
        CORSConfig: Configured CORS settings
    """
    return CORSConfig()


def log_cors_request(origin: str, method: str, path: str, allowed: bool):
    """
    Log CORS request details for debugging and monitoring.
    
    Args:
        origin (str): Request origin
        method (str): HTTP method
        path (str): Request path
        allowed (bool): Whether request was allowed
    """
    status = "ALLOWED" if allowed else "BLOCKED"
    logger.info(f"CORS {status}: {method} {path} from {origin}")
    
    if not allowed:
        logger.warning(f"CORS request blocked from unauthorized origin: {origin}")