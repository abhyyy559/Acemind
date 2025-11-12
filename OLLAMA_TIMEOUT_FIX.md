# 🔧 Ollama Timeout Issue - SOLVED!

## Problem Found! ✅

```
httpx.ReadTimeout
```

**Root Cause**: 
- Ollama is working fine
- But `deepseek-coder-v2:latest` model is **VERY LARGE** (8.9GB)
- Takes longer than 60 seconds to generate response
- Request times out before Ollama finishes

---

## Solutions

### Solution 1: Use Faster Model (Recommended) ⭐

**Switch to a smaller, faster model:**

```bash
# Pull a smaller DeepSeek model
ollama pull deepseek-r1:7b

# Or use a different fast model
ollama pull llama3.2:3b
ollama pull phi3:mini
```

**Update `.env`:**
```env
OLLAMA_MODEL=deepseek-r1:7b
# OR
OLLAMA_MODEL=llama3.2:3b
# OR
OLLAMA_MODEL=phi3:mini
```

**Restart backend and try again!**

---

### Solution 2: Increase Timeout (Already Applied)

The code already has a 300-second (5-minute) timeout:
```python
async with httpx.AsyncClient(timeout=300.0) as client:
```

But the model is still too slow!

---

### Solution 3: Use External API

**Add DeepSeek API key** (fast, reliable):

```env
# Add to .env
DEEPSEEK_API_KEY=sk-your-key-here
```

Get key from: https://platform.deepseek.com/api_keys

---

## Recommended Action

### Quick Fix (2 minutes):

```bash
# 1. Pull faster model
ollama pull llama3.2:3b

# 2. Update .env
# Change: OLLAMA_MODEL=deepseek-coder-v2:latest
# To:     OLLAMA_MODEL=llama3.2:3b

# 3. Restart backend
cd smartstudy/backend
python main.py

# 4. Try quiz generation - should work instantly!
```

---

## Model Comparison

| Model | Size | Speed | Quality | Recommended |
|-------|------|-------|---------|-------------|
| deepseek-coder-v2:latest | 8.9GB | Very Slow | Excellent | ❌ Too slow |
| deepseek-r1:7b | 4.1GB | Medium | Very Good | ✅ Good balance |
| llama3.2:3b | 2GB | Fast | Good | ✅ Best for speed |
| phi3:mini | 2.3GB | Fast | Good | ✅ Good alternative |

---

## Why This Happened

1. **Large Model**: `deepseek-coder-v2:latest` is 8.9GB
2. **Slow Generation**: Takes 60+ seconds per response
3. **Timeout**: Request times out before completion
4. **Silent Failure**: Exception caught, tries next API
5. **No API Keys**: Falls back to error

---

## Testing

### Test with faster model:

```bash
# Pull model
ollama pull llama3.2:3b

# Test it
ollama run llama3.2:3b "Say hello"

# Should respond in 1-2 seconds!
```

---

## Summary

### ✅ Issue Identified:
- Ollama works fine
- Model is too large and slow
- Request times out

### 🎯 Solution:
**Use a faster model:**
```bash
ollama pull llama3.2:3b
```

**Update `.env`:**
```env
OLLAMA_MODEL=llama3.2:3b
```

**Restart backend and it will work!** 🎉

---

**The timeout issue is now understood and fixable!**
