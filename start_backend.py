#!/usr/bin/env python3
"""
Start Backend Server with Error Handling
"""

import sys
import os
import asyncio
import logging

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'smartstudy', 'backend'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_components():
    """Test all components before starting server"""
    
    print("🧪 Testing Backend Components")
    print("=" * 50)
    
    try:
        # Test 1: Environment variables
        from dotenv import load_dotenv
        load_dotenv('smartstudy/backend/.env')
        print("✅ Environment variables loaded")
        
        # Test 2: Database (skip if MongoDB not running)
        try:
            from app.database import init_database
            print("✅ Database module imported")
        except Exception as e:
            print(f"⚠️  Database module issue (will skip): {e}")
        
        # Test 3: AI Service
        from app.services.deepseek_ai import deepseek_service
        print("✅ AI service imported")
        
        # Test 4: CORS Config
        from app.config.cors import get_cors_config
        cors_config = get_cors_config()
        print(f"✅ CORS configured for: {cors_config.allowed_origins}")
        
        # Test 5: PDF Parser
        from app.utils.pdf_parser import extract_text_from_pdf
        print("✅ PDF parser imported")
        
        # Test 6: Quiz Router
        from app.routers.quiz import router
        print("✅ Quiz router imported")
        
        print("\n🎉 All components tested successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Component test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def start_server():
    """Start the FastAPI server"""
    
    print("\n🚀 Starting FastAPI Server")
    print("=" * 50)
    
    try:
        import uvicorn
        from smartstudy.backend.main import app
        
        print("✅ FastAPI app imported")
        print("🌐 Starting server at http://localhost:4000")
        print("📚 API docs at http://localhost:4000/docs")
        print("🛑 Press Ctrl+C to stop")
        
        uvicorn.run(
            "smartstudy.backend.main:app",
            host="0.0.0.0",
            port=4000,
            reload=True,
            log_level="info"
        )
        
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Main function"""
    
    # Test components first
    if await test_components():
        # Start server if tests pass
        start_server()
    else:
        print("\n❌ Component tests failed. Please fix issues before starting server.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())