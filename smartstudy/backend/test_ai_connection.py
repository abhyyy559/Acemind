#!/usr/bin/env python3
"""
Test script to check AI service connectivity
"""
import asyncio
import httpx
import sys

async def test_ollama():
    """Test Ollama connection"""
    print("🔍 Testing Ollama connection...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                print(f"✅ Ollama is running!")
                print(f"📦 Available models: {models}")
                
                # Check for DeepSeek models
                deepseek_models = [m for m in models if "deepseek" in m.lower()]
                if deepseek_models:
                    print(f"🎯 DeepSeek models found: {deepseek_models}")
                else:
                    print("⚠️ No DeepSeek models found")
                    print("💡 Install with: ollama pull deepseek-coder-v2")
                return True
            else:
                print(f"❌ Ollama returned status {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Ollama not available: {e}")
        print("💡 Start Ollama with: ollama serve")
        return False

async def test_deepseek():
    """Test DeepSeek API"""
    print("\n🔍 Testing DeepSeek API...")
    try:
        from app.config import settings
        if not settings.DEEPSEEK_API_KEY:
            print("⚠️ DEEPSEEK_API_KEY not configured in .env")
            return False
        
        print(f"✅ DeepSeek API key is configured")
        print(f"🔗 Base URL: {settings.DEEPSEEK_BASE_URL}")
        return True
    except Exception as e:
        print(f"❌ Error checking DeepSeek config: {e}")
        return False

async def test_nvidia():
    """Test NVIDIA API"""
    print("\n🔍 Testing NVIDIA API...")
    try:
        from app.config import settings
        nvidia_key = getattr(settings, 'NVIDIA_API_KEY', None)
        if not nvidia_key:
            print("⚠️ NVIDIA_API_KEY not configured in .env")
            return False
        
        print(f"✅ NVIDIA API key is configured")
        return True
    except Exception as e:
        print(f"❌ Error checking NVIDIA config: {e}")
        return False

async def test_quiz_generation():
    """Test actual quiz generation"""
    print("\n🔍 Testing quiz generation...")
    try:
        from app.services.deepseek_ai import DeepSeekAIService
        
        service = DeepSeekAIService()
        test_content = """
        Machine Learning is a subset of artificial intelligence that enables systems to learn 
        and improve from experience without being explicitly programmed. There are three main 
        types of machine learning: supervised learning, unsupervised learning, and reinforcement 
        learning. Supervised learning uses labeled data to train models, while unsupervised 
        learning finds patterns in unlabeled data. Reinforcement learning involves an agent 
        learning through trial and error by receiving rewards or penalties.
        """
        
        print("📝 Generating quiz from test content...")
        questions = await service.generate_quiz_from_text(test_content, "Machine Learning", 3)
        
        if questions:
            print(f"✅ Generated {len(questions)} questions!")
            for i, q in enumerate(questions, 1):
                print(f"\n❓ Question {i}: {q.question}")
                print(f"   Options: {q.options}")
        else:
            print("❌ No questions generated")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Quiz generation failed: {e}")
        import traceback
        print(traceback.format_exc())
        return False

async def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 AceMind AI Service Connection Test")
    print("=" * 60)
    
    ollama_ok = await test_ollama()
    deepseek_ok = await test_deepseek()
    nvidia_ok = await test_nvidia()
    
    print("\n" + "=" * 60)
    print("📊 Summary:")
    print("=" * 60)
    print(f"Ollama:   {'✅' if ollama_ok else '❌'}")
    print(f"DeepSeek: {'✅' if deepseek_ok else '❌'}")
    print(f"NVIDIA:   {'✅' if nvidia_ok else '❌'}")
    
    if not (ollama_ok or deepseek_ok or nvidia_ok):
        print("\n⚠️ No AI services available!")
        print("💡 Configure at least one:")
        print("   1. Start Ollama: ollama serve")
        print("   2. Add DEEPSEEK_API_KEY to .env")
        print("   3. Add NVIDIA_API_KEY to .env")
        sys.exit(1)
    
    # Test actual generation
    quiz_ok = await test_quiz_generation()
    
    if quiz_ok:
        print("\n🎉 All tests passed! AI service is working correctly.")
    else:
        print("\n❌ Quiz generation test failed. Check logs above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
