#!/usr/bin/env python3
"""
Test Ollama API Directly
"""
import asyncio
import httpx
import json

async def test_ollama():
    print("🧪 Testing Ollama API Directly")
    print("=" * 60)
    
    ollama_url = "http://localhost:11434"
    model = "deepseek-coder-v2:latest"
    
    try:
        # Test 1: Health Check
        print("\n[1/3] Testing health check...")
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{ollama_url}/api/tags")
            print(f"✅ Health check: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                models = [m.get("name") for m in data.get("models", [])]
                print(f"✅ Available models: {models}")
            else:
                print(f"❌ Health check failed: {response.text}")
                return
        
        # Test 2: Simple Generation
        print("\n[2/3] Testing simple generation...")
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": "Say 'Hello, I am working!' in JSON format: {\"message\": \"...\"}"
                }
            ],
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            print(f"Sending request to {ollama_url}/api/chat...")
            response = await client.post(
                f"{ollama_url}/api/chat",
                json=payload
            )
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("message", {}).get("content", "")
                print(f"✅ Response received: {content[:100]}...")
            else:
                print(f"❌ Request failed: {response.text}")
                return
        
        # Test 3: Quiz Generation
        print("\n[3/3] Testing quiz generation...")
        quiz_payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a quiz generator. Respond with ONLY valid JSON arrays."
                },
                {
                    "role": "user",
                    "content": """Generate 2 quiz questions about Python in JSON format:
[
  {
    "id": "q1",
    "question": "What is Python?",
    "options": ["A programming language", "A snake", "A tool", "A framework"]
  },
  {
    "id": "q2",
    "question": "What is a variable?",
    "options": ["A storage location", "A function", "A class", "A module"]
  }
]

Respond with ONLY the JSON array above:"""
                }
            ],
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 1024
            }
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            print("Generating quiz questions...")
            response = await client.post(
                f"{ollama_url}/api/chat",
                json=quiz_payload
            )
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("message", {}).get("content", "")
                print(f"✅ Quiz response received ({len(content)} chars)")
                print(f"\nResponse:\n{content}\n")
                
                # Try to parse as JSON
                try:
                    parsed = json.loads(content.strip())
                    print(f"✅ Valid JSON! Type: {type(parsed)}")
                    if isinstance(parsed, list):
                        print(f"✅ Is array with {len(parsed)} items")
                    print("\n🎉 Ollama is working perfectly!")
                except json.JSONDecodeError as e:
                    print(f"⚠️  JSON parse error: {e}")
                    print("Response might need cleaning")
            else:
                print(f"❌ Request failed: {response.text}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        print(f"\nTraceback:\n{traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_ollama())
