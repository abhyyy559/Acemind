#!/usr/bin/env python3
"""
Quick Ollama Setup Script for AceMind Quiz Generator
"""

import subprocess
import sys
import time
import requests
import json

def run_command(command, description):
    """Run a command and return success status"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            return True, result.stdout
        else:
            print(f"❌ {description} - Failed: {result.stderr}")
            return False, result.stderr
    except Exception as e:
        print(f"❌ {description} - Error: {e}")
        return False, str(e)

def check_ollama_status():
    """Check if Ollama is running"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            return True, models
        return False, []
    except:
        return False, []

def main():
    print("🚀 AceMind Ollama Setup Script")
    print("=" * 50)
    
    # Step 1: Check if Ollama is installed
    success, output = run_command("ollama --version", "Checking Ollama installation")
    if not success:
        print("\n❌ Ollama is not installed!")
        print("📥 Please install Ollama first:")
        print("   Windows: Download from https://ollama.com/download")
        print("   macOS: brew install ollama")
        print("   Linux: curl -fsSL https://ollama.com/install.sh | sh")
        return
    
    print(f"📦 Ollama version: {output.strip()}")
    
    # Step 2: Check if Ollama is running
    print("\n🔍 Checking Ollama service...")
    is_running, models = check_ollama_status()
    
    if not is_running:
        print("⚠️  Ollama service is not running")
        print("🔄 Starting Ollama service...")
        
        # Try to start Ollama
        subprocess.Popen("ollama serve", shell=True)
        time.sleep(3)  # Wait for service to start
        
        # Check again
        is_running, models = check_ollama_status()
        if not is_running:
            print("❌ Failed to start Ollama service")
            print("💡 Please run manually: ollama serve")
            return
    
    print("✅ Ollama service is running")
    
    # Step 3: List available models
    print(f"\n📋 Available models: {len(models)}")
    deepseek_models = []
    for model in models:
        model_name = model.get("name", "")
        print(f"   - {model_name}")
        if "deepseek" in model_name.lower():
            deepseek_models.append(model_name)
    
    # Step 4: Download DeepSeek model if needed
    if not deepseek_models:
        print("\n📥 No DeepSeek models found. Downloading recommended model...")
        
        # Try different DeepSeek models in order of preference
        models_to_try = [
            "deepseek-r1:7b",
            "deepseek-coder:6.7b", 
            "deepseek-chat:7b",
            "deepseek-r1:1.5b"
        ]
        
        for model in models_to_try:
            print(f"\n🔄 Trying to download {model}...")
            success, output = run_command(f"ollama pull {model}", f"Downloading {model}")
            if success:
                print(f"✅ Successfully downloaded {model}")
                deepseek_models.append(model)
                break
            else:
                print(f"❌ Failed to download {model}")
        
        if not deepseek_models:
            print("\n❌ Failed to download any DeepSeek models")
            print("💡 Try manually: ollama pull deepseek-r1:7b")
            return
    
    # Step 5: Test the model
    test_model = deepseek_models[0]
    print(f"\n🧪 Testing model: {test_model}")
    
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": test_model,
                "messages": [{"role": "user", "content": "Generate 1 quiz question about photosynthesis"}],
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("message", {}).get("content", "")
            if content:
                print("✅ Model test successful!")
                print(f"📝 Sample response: {content[:100]}...")
            else:
                print("⚠️  Model responded but with empty content")
        else:
            print(f"❌ Model test failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Model test error: {e}")
    
    # Step 6: Update configuration
    print(f"\n⚙️  Recommended configuration for your .env file:")
    print("=" * 50)
    print("# Ollama (Local AI - No limits, no cost!)")
    print("OLLAMA_BASE_URL=http://localhost:11434")
    print(f"OLLAMA_MODEL={test_model}")
    print("=" * 50)
    
    print(f"\n🎉 Setup complete!")
    print(f"✅ Ollama is running")
    print(f"✅ DeepSeek model available: {test_model}")
    print(f"✅ Ready for unlimited quiz generation!")
    
    print(f"\n🚀 Next steps:")
    print(f"1. Update your .env file with the configuration above")
    print(f"2. Restart your backend server")
    print(f"3. Generate quizzes without limits!")

if __name__ == "__main__":
    main()