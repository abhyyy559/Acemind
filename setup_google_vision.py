#!/usr/bin/env python3
"""
Google Vision API Setup Helper
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and show progress"""
    print(f"\n{'='*60}")
    print(f"📦 {description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Success!")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed!")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def check_environment():
    """Check if Google Vision credentials are configured"""
    creds = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if creds:
        print(f"✅ GOOGLE_APPLICATION_CREDENTIALS is set: {creds}")
        if os.path.exists(creds):
            print(f"✅ Credentials file exists")
            return True
        else:
            print(f"❌ Credentials file not found at: {creds}")
            return False
    else:
        print(f"❌ GOOGLE_APPLICATION_CREDENTIALS not set")
        return False

def main():
    print("🚀 Google Vision API Setup for AceMind")
    print("="*60)
    
    # Step 1: Install Python packages
    packages = [
        "google-cloud-vision",
        "pdf2image",
        "Pillow"
    ]
    
    print("\n📦 Installing Python packages...")
    for package in packages:
        success = run_command(
            f"pip install {package}",
            f"Installing {package}"
        )
        if not success:
            print(f"\n⚠️  Failed to install {package}")
            print(f"💡 Try manually: pip install {package}")
    
    # Step 2: Check Poppler
    print("\n\n🔍 Checking Poppler installation...")
    if sys.platform == "win32":
        print("⚠️  Windows detected")
        print("📥 Please install Poppler manually:")
        print("   1. Download: https://github.com/oschwartz10612/poppler-windows/releases")
        print("   2. Extract to: C:\\Program Files\\poppler")
        print("   3. Add to PATH: C:\\Program Files\\poppler\\Library\\bin")
    elif sys.platform == "darwin":
        print("🍎 Mac detected")
        run_command("brew install poppler", "Installing Poppler via Homebrew")
    else:
        print("🐧 Linux detected")
        run_command("sudo apt-get install -y poppler-utils", "Installing Poppler")
    
    # Step 3: Check Google Vision credentials
    print("\n\n🔑 Checking Google Vision API credentials...")
    if check_environment():
        print("\n✅ Google Vision API is configured!")
    else:
        print("\n⚠️  Google Vision API not configured")
        print("\n📋 Next steps:")
        print("   1. Create Google Cloud project: https://console.cloud.google.com/")
        print("   2. Enable Vision API")
        print("   3. Create service account")
        print("   4. Download JSON key")
        print("   5. Set environment variable:")
        print("      export GOOGLE_APPLICATION_CREDENTIALS='/path/to/key.json'")
        print("\n📖 Full guide: GOOGLE_VISION_SETUP.md")
    
    # Step 4: Test installation
    print("\n\n🧪 Testing installation...")
    try:
        from google.cloud import vision
        from pdf2image import convert_from_bytes
        from PIL import Image
        
        print("✅ All packages imported successfully!")
        
        # Try to initialize Vision client
        try:
            client = vision.ImageAnnotatorClient()
            print("✅ Google Vision API client initialized!")
            print("\n🎉 Setup complete! You can now process image-based PDFs!")
        except Exception as e:
            print(f"⚠️  Could not initialize Vision client: {e}")
            print("💡 Make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly")
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Try restarting your terminal and running this script again")
    
    print("\n" + "="*60)
    print("📖 For detailed setup instructions, see: GOOGLE_VISION_SETUP.md")
    print("="*60)

if __name__ == "__main__":
    main()
