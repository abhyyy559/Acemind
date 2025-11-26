#!/usr/bin/env python3
"""
Test script for the roadmap visualization endpoint
"""
import requests
import json

# Test data
test_data = {
    "topic": "React Development",
    "difficulty_level": "intermediate",
    "roadmap_markdown": """# React Development

## Fundamentals
- JavaScript ES6+
- HTML & CSS
- DOM Manipulation

## React Basics
- Components
- Props & State
- Hooks (useState, useEffect)

## Advanced Concepts
- Context API
- Custom Hooks
- Performance Optimization

## Ecosystem
- React Router
- State Management (Redux/Zustand)
- Testing (Jest, React Testing Library)
"""
}

# API endpoint
url = "http://localhost:4000/roadmap/generate-visual-roadmap"

print("Testing Roadmap Visualization Endpoint...")
print(f"URL: {url}")
print(f"Topic: {test_data['topic']}")
print(f"Difficulty: {test_data['difficulty_level']}")
print("-" * 50)

try:
    response = requests.post(url, json=test_data)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ SUCCESS! HTML generated successfully")
        
        # Save the HTML to a file
        with open("test-roadmap-output.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        
        print("📄 HTML saved to: test-roadmap-output.html")
        print(f"📏 HTML size: {len(response.text)} bytes")
        
        # Check for key elements
        if "markmap" in response.text.lower():
            print("✅ Markmap library included")
        if "downloadHTML" in response.text:
            print("✅ Download function present")
        if test_data['topic'] in response.text:
            print("✅ Topic included in HTML")
        
    else:
        print(f"❌ ERROR: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ ERROR: Could not connect to the server")
    print("Make sure the backend is running on http://localhost:4000")
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print("-" * 50)
print("Test complete!")
