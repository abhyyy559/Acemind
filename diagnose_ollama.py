#!/usr/bin/env python3
"""
Diagnose Ollama Response Issue
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'smartstudy', 'backend'))

import asyncio
import httpx
import json

async def test_ollama():
    print("🔍 Diagnosing Ollama Response Issue")
    print("=" * 60)
    
    ollama_url = "http://localhost:11434"
    
    # Check if Ollama is running
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{ollama_url}/api/tags")
            if response.status_code == 200:
                print("✅ Ollama is running")
                models = response.json().get("models", [])
                print(f"   Available models: {[m.get('name') for m in models]}")
            else:
                print(f"❌ Ollama returned status {response.status_code}")
                return
    except Exception as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        return
    
    print()
    
    # Test quiz generation
    model = "deepseek-coder-v2:latest"
    test_content = """
    Photosynthesis is the process by which plants convert sunlight into energy.
    It occurs in the chloroplasts of plant cells and requires carbon dioxide,
    water, and sunlight. The process produces glucose and oxygen as byproducts.
    """
    
    prompt = f"""You are an expert educational assessment designer. Create 3 high-quality multiple-choice questions based on this content.

CONTENT:
{test_content}

CRITICAL OUTPUT REQUIREMENTS:
- You MUST respond with ONLY valid JSON arrays starting with [ and ending with ]
- Do NOT include markdown formatting, code blocks, or explanations
- Start your response with [ and end with ]

EXACT OUTPUT FORMAT:
[
  {{
    "id": "q1",
    "question": "What is photosynthesis?",
    "options": ["Process of converting sunlight to energy", "Wrong 1", "Wrong 2", "Wrong 3"]
  }},
  {{
    "id": "q2",
    "question": "Where does photosynthesis occur?",
    "options": ["In chloroplasts", "Wrong 1", "Wrong 2", "Wrong 3"]
  }},
  {{
    "id": "q3",
    "question": "What does photosynthesis produce?",
    "options": ["Glucose and oxygen", "Wrong 1", "Wrong 2", "Wrong 3"]
  }}
]

GENERATE EXACTLY 3 QUESTIONS NOW. RESPOND WITH ONLY THE JSON ARRAY:"""
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert educational assessment designer. You MUST respond with ONLY valid JSON arrays starting with [ and ending with ]. Do not include markdown formatting, code blocks, explanations, or any text outside the JSON array structure."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 2048
        }
    }
    
    print("📡 Sending request to Ollama...")
    print(f"   Model: {model}")
    print(f"   Prompt length: {len(prompt)} characters")
    print()
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{ollama_url}/api/chat",
                json=payload
            )
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("message", {}).get("content", "")
                
                print(f"✅ Response received!")
                print(f"   Length: {len(content)} characters")
                print()
                print("=" * 60)
                print("FULL RESPONSE:")
                print("=" * 60)
                print(content)
                print("=" * 60)
                print()
                
                # Analyze response
                print("🔍 Response Analysis:")
                print(f"   Starts with '[': {content.strip().startswith('[')}")
                print(f"   Ends with ']': {content.strip().endswith(']')}")
                print(f"   Contains '{{': {'{' in content}")
                print(f"   Contains '}}': {'}' in content}")
                print(f"   First 50 chars: {content[:50]}")
                print(f"   Last 50 chars: {content[-50:]}")
                print()
                
                # Try to parse as JSON
                print("🔍 JSON Parsing Test:")
                try:
                    parsed = json.loads(content.strip())
                    print(f"✅ Valid JSON!")
                    print(f"   Type: {type(parsed)}")
                    if isinstance(parsed, list):
                        print(f"   ✅ Is array with {len(parsed)} items")
                        for i, item in enumerate(parsed):
                            if isinstance(item, dict):
                                print(f"   Item {i+1}: {list(item.keys())}")
                            else:
                                print(f"   Item {i+1}: {type(item)}")
                    elif isinstance(parsed, dict):
                        print(f"   ⚠️  Is single object (not array)")
                        print(f"   Keys: {list(parsed.keys())}")
                    print()
                    print("✅ Parsing would succeed!")
                except json.JSONDecodeError as e:
                    print(f"❌ JSON Parse Error!")
                    print(f"   Error: {e}")
                    print(f"   Position: {e.pos}")
                    print(f"   Line: {e.lineno}, Column: {e.colno}")
                    print()
                    print("❌ This is why quiz generation fails!")
                
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ollama())
