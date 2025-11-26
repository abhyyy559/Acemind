#!/usr/bin/env python3
"""
Test script for the /roadmap/generate endpoint
"""
import requests
import json

# Test data
test_data = {
    "topic": "Full-Stack Web Development",
    "difficulty_level": "intermediate",
    "roadmap_markdown": ""
}

# API endpoint
url = "http://localhost:4000/roadmap/generate"

print("=" * 60)
print("Testing Roadmap Generate Endpoint")
print("=" * 60)
print(f"URL: {url}")
print(f"Topic: {test_data['topic']}")
print(f"Difficulty: {test_data['difficulty_level']}")
print("-" * 60)

try:
    response = requests.post(url, json=test_data)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ SUCCESS! Roadmap generated successfully\n")
        
        data = response.json()
        
        print(f"📚 Topic: {data['topic']}")
        print(f"⏱️  Estimated Duration: {data['estimated_duration']}")
        print(f"📖 Resources: {len(data['resources'])} items")
        print(f"📝 Markdown Length: {len(data['roadmap_markdown'])} characters")
        
        print("\n" + "=" * 60)
        print("ROADMAP CONTENT:")
        print("=" * 60)
        print(data['roadmap_markdown'])
        
        print("\n" + "=" * 60)
        print("RESOURCES:")
        print("=" * 60)
        for i, resource in enumerate(data['resources'], 1):
            print(f"\n{i}. {resource['title']}")
            print(f"   Type: {resource['type']}")
            print(f"   URL: {resource['url']}")
            if resource.get('description'):
                print(f"   Description: {resource['description']}")
        
        print("\n" + "=" * 60)
        print("✅ All checks passed!")
        print("=" * 60)
        
    else:
        print(f"❌ ERROR: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ ERROR: Could not connect to the server")
    print("Make sure the backend is running on http://localhost:4000")
    print("\nTo start the backend:")
    print("  cd smartstudy/backend")
    print("  uvicorn app.main:app --reload --port 4000")
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print("\nTest complete!")
