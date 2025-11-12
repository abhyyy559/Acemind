# 🔍 Google Vision API Setup Guide

## Overview

Google Vision API provides highly accurate OCR (Optical Character Recognition) for extracting text from image-based PDFs. This integration allows AceMind to automatically process scanned documents.

---

## Benefits

### ✅ Advantages:
- **High Accuracy**: 95%+ text recognition accuracy
- **Multi-language**: Supports 50+ languages
- **Automatic**: No manual text input needed
- **Fast**: Processes pages in seconds
- **Reliable**: Enterprise-grade Google infrastructure

### vs. Alternatives:
| Feature | Google Vision | Tesseract | Manual Input |
|---------|--------------|-----------|--------------|
| Accuracy | 95%+ | 80-85% | 100% |
| Speed | Fast | Medium | Slow |
| Setup | Medium | Easy | None |
| Cost | Free tier | Free | Free |
| Languages | 50+ | 100+ | Any |

---

## Setup Steps

### Step 1: Install Python Packages

```bash
cd smartstudy/backend
pip install google-cloud-vision pdf2image Pillow
```

**What this installs**:
- `google-cloud-vision`: Google Vision API client
- `pdf2image`: Converts PDF pages to images
- `Pillow`: Image processing library

---

### Step 2: Install Poppler (PDF to Image Converter)

#### Windows:
```bash
# Download Poppler for Windows
# Visit: https://github.com/oschwartz10612/poppler-windows/releases
# Download: poppler-xx.xx.x_x64.zip

# Extract to: C:\Program Files\poppler
# Add to PATH: C:\Program Files\poppler\Library\bin
```

#### Mac:
```bash
brew install poppler
```

#### Linux:
```bash
sudo apt-get update
sudo apt-get install poppler-utils
```

---

### Step 3: Create Google Cloud Project

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Create New Project**:
   - Click "Select a project" → "New Project"
   - Name: "AceMind OCR" (or any name)
   - Click "Create"

3. **Enable Vision API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Cloud Vision API"
   - Click "Enable"

---

### Step 4: Create Service Account

1. **Go to IAM & Admin**:
   - Navigate to: IAM & Admin → Service Accounts
   - Click "Create Service Account"

2. **Configure Service Account**:
   - Name: `acemind-ocr`
   - Description: "OCR service for AceMind"
   - Click "Create and Continue"

3. **Grant Permissions**:
   - Role: "Cloud Vision AI Service Agent"
   - Click "Continue" → "Done"

4. **Create Key**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Click "Create"
   - **Save the downloaded JSON file securely!**

---

### Step 5: Configure Credentials

#### Option A: Environment Variable (Recommended)

**Windows (PowerShell)**:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account-key.json"
```

**Windows (CMD)**:
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\service-account-key.json
```

**Mac/Linux**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

**Make it permanent** (add to your shell profile):
```bash
# Mac/Linux: Add to ~/.bashrc or ~/.zshrc
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"' >> ~/.bashrc

# Windows: Set system environment variable
# Control Panel → System → Advanced → Environment Variables
```

#### Option B: Place in Project Directory

```bash
# Create credentials directory
mkdir smartstudy/backend/credentials

# Copy your JSON key file
cp ~/Downloads/service-account-key.json smartstudy/backend/credentials/google-vision-key.json

# Set environment variable to point to it
export GOOGLE_APPLICATION_CREDENTIALS="./credentials/google-vision-key.json"
```

**⚠️ Important**: Add to `.gitignore`:
```
credentials/
*.json
```

---

### Step 6: Update .env File

Add to `smartstudy/backend/.env`:

```env
# Google Vision API
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
GOOGLE_CLOUD_PROJECT=your-project-id
```

---

### Step 7: Test the Setup

Create a test script:

```python
# test_google_vision.py
from google.cloud import vision
import io

def test_vision_api():
    try:
        client = vision.ImageAnnotatorClient()
        print("✅ Google Vision API client initialized successfully!")
        
        # Test with a simple image
        with open("test_image.png", "rb") as image_file:
            content = image_file.read()
        
        image = vision.Image(content=content)
        response = client.text_detection(image=image)
        
        if response.text_annotations:
            print(f"✅ OCR working! Detected text: {response.text_annotations[0].description[:100]}...")
        else:
            print("⚠️  No text detected in image")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_vision_api()
```

Run it:
```bash
python test_google_vision.py
```

---

## Usage

### Automatic OCR

Once configured, OCR happens automatically:

1. **User uploads image-based PDF**
2. **System tries standard text extraction** (fast)
3. **If no text found, uses Google Vision OCR** (automatic)
4. **Text extracted and quiz generated** ✅

### Flow Diagram

```
PDF Upload
    ↓
Standard Extraction (PyPDF2)
    ↓
Text Found? ──Yes──→ Generate Quiz ✅
    ↓ No
Google Vision OCR
    ↓
Text Extracted? ──Yes──→ Generate Quiz ✅
    ↓ No
Pytesseract Fallback (if installed)
    ↓
Text Extracted? ──Yes──→ Generate Quiz ✅
    ↓ No
Error: Use Text Input ❌
```

---

## Pricing

### Google Vision API Free Tier:
- **1,000 requests/month**: FREE
- **After 1,000**: $1.50 per 1,000 requests

### Typical Usage:
- **1 PDF page** = 1 request
- **10-page PDF** = 10 requests
- **100 PDFs/month** (10 pages each) = 1,000 requests = **FREE**

### Cost Examples:
| Usage | Requests | Cost |
|-------|----------|------|
| 100 PDFs (10 pages) | 1,000 | $0 |
| 200 PDFs (10 pages) | 2,000 | $1.50 |
| 500 PDFs (10 pages) | 5,000 | $6.00 |

**For most students**: Completely FREE! 🎉

---

## Monitoring Usage

### Check API Usage:
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select your project
3. View "Cloud Vision API" usage

### Set Budget Alerts:
1. Go to: Billing → Budgets & alerts
2. Create budget: $5/month
3. Set alert at 50%, 90%, 100%

---

## Troubleshooting

### Error: "Could not load credentials"

**Solution**:
```bash
# Check if environment variable is set
echo $GOOGLE_APPLICATION_CREDENTIALS

# Verify file exists
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# Check file permissions
chmod 600 /path/to/service-account-key.json
```

### Error: "API not enabled"

**Solution**:
1. Go to: https://console.cloud.google.com/apis/library
2. Search "Cloud Vision API"
3. Click "Enable"

### Error: "Permission denied"

**Solution**:
1. Go to: IAM & Admin → Service Accounts
2. Select your service account
3. Add role: "Cloud Vision AI Service Agent"

### Error: "Quota exceeded"

**Solution**:
- You've used more than 1,000 requests this month
- Either wait for next month or enable billing

---

## Security Best Practices

### ✅ Do:
- Store credentials outside project directory
- Use environment variables
- Add `*.json` to `.gitignore`
- Rotate keys every 90 days
- Use separate keys for dev/prod

### ❌ Don't:
- Commit credentials to Git
- Share credentials publicly
- Use same key across projects
- Store credentials in code
- Leave unused keys active

---

## Alternative: Pytesseract Fallback

If you don't want to use Google Vision API, you can use Pytesseract (free, offline):

```bash
# Install Pytesseract
pip install pytesseract

# Install Tesseract engine
# Windows: https://github.com/UB-Mannheim/tesseract/wiki
# Mac: brew install tesseract
# Linux: sudo apt-get install tesseract-ocr
```

**System will automatically use Pytesseract if Google Vision is not configured.**

---

## Status Check

Run this to check your setup:

```bash
cd smartstudy/backend
python -c "
from app.utils.pdf_parser import GOOGLE_VISION_AVAILABLE, PYTESSERACT_AVAILABLE, OCR_AVAILABLE
print(f'Google Vision: {'✅' if GOOGLE_VISION_AVAILABLE else '❌'}')
print(f'Pytesseract: {'✅' if PYTESSERACT_AVAILABLE else '❌'}')
print(f'OCR Available: {'✅' if OCR_AVAILABLE else '❌'}')
"
```

**Expected output**:
```
Google Vision: ✅
Pytesseract: ❌ (or ✅)
OCR Available: ✅
```

---

## Summary

### Setup Checklist:
- [ ] Install Python packages (`google-cloud-vision`, `pdf2image`, `Pillow`)
- [ ] Install Poppler (PDF converter)
- [ ] Create Google Cloud project
- [ ] Enable Vision API
- [ ] Create service account
- [ ] Download JSON key
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- [ ] Test with sample PDF
- [ ] Restart backend server

### After Setup:
- ✅ Image-based PDFs work automatically
- ✅ No manual text input needed
- ✅ High accuracy OCR
- ✅ Free for typical usage

---

**Ready to process image-based PDFs!** 🎉
