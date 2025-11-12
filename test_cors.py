#!/usr/bin/env python3
"""
Test CORS Configuration
"""

import requests
import json

def test_cors():
    print("🧪 Testing CORS Configuration")
    print("=" * 50)
    
    base_url = "http://localhost:4000"
    origin = "http://localhost:3001"
    
    try:
        # Test 1: Preflight request
        print("\n🔄 Testing CORS preflight request...")
        response = requests.options(
            f"{base_url}/quiz/generate-from-pdf",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=10
        )
        
        print(f"✅ Preflight Status: {response.status_code}")
        print(f"   Allow-Origin: {response.headers.get('access-control-allow-origin', 'Not set')}")
        print(f"   Allow-Methods: {response.headers.get('access-control-allow-methods', 'Not set')}")
        print(f"   Allow-Headers: {response.headers.get('access-control-allow-headers', 'Not set')}")
        
        # Test 2: Actual request
        print("\n🔄 Testing actual CORS request...")
        response = requests.get(
            f"{base_url}/health",
            headers={"Origin": origin},
            timeout=10
        )
        
        print(f"✅ Actual Request Status: {response.status_code}")
        print(f"   Allow-Origin: {response.headers.get('access-control-allow-origin', 'Not set')}")
        print(f"   Response: {response.json()}")
        
        print(f"\n🎉 CORS tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("💡 Make sure your backend is running: python main.py")
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

if __name__ == "__main__":
    test_cors()