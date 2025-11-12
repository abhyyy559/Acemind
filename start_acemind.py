#!/usr/bin/env python3
"""
AceMind Startup Script
Starts backend and frontend servers
"""

import subprocess
import time
import sys
import os
import requests

def check_ollama():
    """Check if Ollama is running"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        return response.status_code == 200
    except:
        return False

def start_ollama():
    """Start Ollama service"""
    print("🔄 Starting Ollama...")
    try:
        subprocess.Popen(["ollama", "serve"], 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        time.sleep(3)
        return check_ollama()
    except:
        return False

def main():
    print("=" * 50)
    print("🚀 Starting AceMind Quiz System")
    print("=" * 50)
    print()
    
    # Step 1: Check/Start Ollama
    print("[1/3] Checking Ollama...")
    if not check_ollama():
        print("⚠️  Ollama not running, attempting to start...")
        if start_ollama():
            print("✅ Ollama started successfully")
        else:
            print("❌ Failed to start Ollama")
            print("💡 Please run manually: ollama serve")
            print()
    else:
        print("✅ Ollama is running")
    
    print()
    
    # Step 2: Start Backend
    print("[2/3] Starting Backend Server...")
    backend_path = os.path.join("smartstudy", "backend")
    
    if sys.platform == "win32":
        backend_process = subprocess.Popen(
            ["cmd", "/c", "start", "cmd", "/k", f"cd {backend_path} && python main.py"],
            shell=True
        )
    else:
        backend_process = subprocess.Popen(
            ["python", "main.py"],
            cwd=backend_path
        )
    
    print("✅ Backend starting...")
    time.sleep(3)
    
    print()
    
    # Step 3: Start Frontend
    print("[3/3] Starting Frontend...")
    frontend_path = os.path.join("smartstudy", "frontend")
    
    if sys.platform == "win32":
        frontend_process = subprocess.Popen(
            ["cmd", "/c", "start", "cmd", "/k", f"cd {frontend_path} && npm run dev"],
            shell=True
        )
    else:
        frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_path
        )
    
    print("✅ Frontend starting...")
    
    print()
    print("=" * 50)
    print("✅ AceMind is starting!")
    print("=" * 50)
    print()
    print("📍 URLs:")
    print("   Backend:  http://localhost:4000")
    print("   Frontend: http://localhost:3001")
    print("   API Docs: http://localhost:4000/docs")
    print()
    print("💡 Check the terminal windows for logs")
    print("🛑 Press Ctrl+C in each terminal to stop")
    print()

if __name__ == "__main__":
    main()