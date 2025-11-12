#!/usr/bin/env python3
"""
Quick Test - Generate Quiz from Text
Use this while Poppler is being installed
"""
import requests
import json

# Sample text (replace with your content)
sample_text = """
Photosynthesis is the process by which plants convert sunlight into energy.
It occurs in the chloroplasts of plant cells and requires carbon dioxide,
water, and sunlight. The process produces glucose and oxygen as byproducts.
The chemical equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.
Chlorophyll is the green pigment that captures light energy. Plants use
the glucose produced for growth and energy, while the oxygen is released
into the atmosphere. This process is essential for life on Earth as it
provides oxygen for animals and removes carbon dioxide from the air.
There are two main stages: light-dependent reactions and the Calvin cycle.
"""

def test_fast_generation():
    print("🚀 Testing Fast Quiz Generation (V2)")
    print("=" * 60)
    
    url = "http://localhost:4000/quiz/v2/generate-fast"
    
    payload = {
        "content": sample_text,
        "topic": "Photosynthesis",
        "num_questions": 5
    }
    
    print("📡 Sending request...")
    print(f"Content length: {len(sample_text)} characters")
    print()
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success"):
                questions = data.get("questions", [])
                print(f"✅ Generated {len(questions)} questions!")
                print()
                
                for i, q in enumerate(questions, 1):
                    print(f"Question {i}:")
                    print(f"  Q: {q.get('question', 'N/A')}")
                    print(f"  Options:")
                    for j, opt in enumerate(q.get('options', []), 1):
                        print(f"    {j}. {opt}")
                    print()
                
                print("🎉 Success! Fast generation working!")
            else:
                print(f"❌ Generation failed: {data}")
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend")
        print("💡 Make sure backend is running: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_fast_generation()
