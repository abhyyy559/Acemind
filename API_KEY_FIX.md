# 🔧 API Key Error Fix

## Problem

```
ERROR: Illegal header value b'Bearer '
```

This error occurred because the DeepSeek API key was empty in the `.env` file.

---

## Root Cause

### API Call Flow:
1. **Try Ollama** → Failed (unknown error)
2. **Try NVIDIA** → Skipped (no API key)
3. **Try DeepSeek** → Failed (empty API key = `Bearer ` with no token)

### The Issue:
- `.env` file had empty API keys
- System tried to use DeepSeek with empty key
- HTTP header `Authorization: Bearer ` is invalid (needs a token after "Bearer")

---

## Fix Applied

### 1. Added API Key Validation ✅

**Before**:
```python
headers = {
    "Authorization": f"Bearer {self.api_key}",  # Empty key = "Bearer "
    "Content-Type": "application/json"
}
```

**After**:
```python
# Check if API key exists before using it
if not self.api_key or self.api_key.strip() == "":
    logger.error("No API keys configured")
    raise Exception("No AI API available. Configure Ollama, NVIDIA, or DeepSeek")

headers = {
    "Authorization": f"Bearer {self.api_key}",
    "Content-Type": "application/json"
}
```

### 2. Improved Error Logging ✅

**Before**:
```python
except Exception as e:
    logger.warning(f"Ollama API call failed: {e}")  # Empty error message
```

**After**:
```python
except Exception as e:
    logger.warning(f"Ollama API call failed: {str(e) or 'Unknown error'}")
    logger.debug(f"Ollama error details: {type(e).__name__}: {e}")
```

---

## Solution

### Option 1: Use Ollama (Recommended) ⭐

**Check if Ollama is running**:
```bash
curl http://localhost:11434/api/tags
```

**If not running, start it**:
```bash
ollama serve
```

**Check if model is available**:
```bash
ollama list
```

**If model not found, pull it**:
```bash
ollama pull deepseek-coder-v2:latest
```

---

### Option 2: Add DeepSeek API Key

**Edit `.env` file**:
```env
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
```

**Get API key from**:
https://platform.deepseek.com/api_keys

---

### Option 3: Add NVIDIA API Key

**Edit `.env` file**:
```env
NVIDIA_API_KEY=nvapi-your-actual-api-key-here
```

**Get API key from**:
https://build.nvidia.com/

---

## Current Status

### What's Configured:
- ✅ Ollama URL: `http://localhost:11434`
- ✅ Ollama Model: `deepseek-coder-v2:latest`
- ❌ NVIDIA API Key: Empty
- ❌ DeepSeek API Key: Empty

### What Works:
- ✅ Ollama (if running and model available)
- ❌ NVIDIA API (no key)
- ❌ DeepSeek API (no key)

---

## Testing

### Test Ollama:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Expected: List of models
# If error: Start Ollama with `ollama serve`
```

### Test Quiz Generation:
```bash
# Use the frontend
1. Go to http://localhost:3001
2. Click "Text Input"
3. Paste some text
4. Click "Generate Quiz"

# Should work if Ollama is running
```

---

## Troubleshooting

### Error: "Ollama API call failed"

**Check if Ollama is running**:
```bash
# Windows
tasklist | findstr ollama

# Mac/Linux
ps aux | grep ollama
```

**Start Ollama**:
```bash
ollama serve
```

### Error: "No DeepSeek models found"

**Pull the model**:
```bash
ollama pull deepseek-coder-v2:latest
```

### Error: "No AI API available"

**Solution**: Configure at least one API:
- Start Ollama (free, local)
- OR add DeepSeek API key
- OR add NVIDIA API key

---

## Recommended Setup

### For Development (Free, Unlimited):
```bash
# 1. Install Ollama
# Visit: https://ollama.ai/download

# 2. Pull model
ollama pull deepseek-coder-v2:latest

# 3. Start Ollama
ollama serve

# 4. Restart backend
cd smartstudy/backend
python main.py
```

### For Production (Paid, Reliable):
```env
# Add to .env
DEEPSEEK_API_KEY=sk-your-key-here
# OR
NVIDIA_API_KEY=nvapi-your-key-here
```

---

## Summary

### ✅ Fixed:
- Added API key validation
- Improved error messages
- Prevents "Illegal header value" error

### 🎯 Next Steps:
1. **Start Ollama**: `ollama serve`
2. **Verify model**: `ollama list`
3. **Test quiz generation**: Use frontend

### 💡 Recommendation:
**Use Ollama** for development - it's free, unlimited, and works offline!

---

**The API key error is now fixed!** 🎉

Just make sure Ollama is running, and quiz generation will work perfectly!
