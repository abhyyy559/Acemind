#!/usr/bin/env python3
"""
Start the AceMind Backend Server
"""

import uvicorn
import os
import sys
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def main():
    try:
        # Get configuration
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", 4000))
        
        logger.info("🚀 Starting AceMind Backend Server")
        logger.info(f"📍 Server will run on: http://{host}:{port}")
        logger.info(f"📚 API Documentation: http://localhost:{port}/docs")
        logger.info(f"🔧 Health Check: http://localhost:{port}/health")
        
        # Check if Ollama is available
        try:
            import httpx
            import asyncio
            
            async def check_ollama():
                try:
                    async with httpx.AsyncClient(timeout=5.0) as client:
                        response = await client.get("http://localhost:11434/api/tags")
                        if response.status_code == 200:
                            models = response.json().get("models", [])
                            model_names = [m.get("name", "") for m in models]
                            logger.info(f"✅ Ollama is running with {len(models)} models")
                            if "deepseek-coder-v2:latest" in model_names:
                                logger.info("✅ deepseek-coder-v2:latest model is available")
                            else:
                                logger.warning(f"⚠️  deepseek-coder-v2:latest not found. Available: {model_names}")
                        else:
                            logger.warning("⚠️  Ollama is running but returned error")
                except Exception as e:
                    logger.warning(f"⚠️  Ollama not available: {e}")
                    logger.info("💡 To start Ollama: ollama serve")
            
            asyncio.run(check_ollama())
            
        except ImportError:
            logger.warning("⚠️  Cannot check Ollama status (httpx not available)")
        
        # Start the server
        logger.info("🔄 Starting server...")
        
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=True,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        logger.info("👋 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()