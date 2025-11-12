# 🔍 AI Service Diagnosis Guide

## Problem: Questions Coming Too Fast / Generic Questions

If you're getting questions instantly and they seem generic, it means the system is using the **fallback generator** instead of calling the AI API.

## Quick Diagnosis

### Step 1: Run the Test Script

```bash
cd smartstudy/backend
python test_ai_connection.py
```

This will check:
- ✅ Is Ollama running?
- ✅ Are API keys configured?
- ✅ Can we generate questions?

### Step 2: Check Your .env File

Your `.env` file should have at least ONE of these:

```env
# Option 1: Ollama (Local, Free, No API key needed)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder-v2:latest

# Option 2: DeepSeek API (Cloud, Requires API key)
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Option 3: NVIDIA API (Cloud, Requires API key)
NVIDIA_API_KEY=your_nvidia_key_here
```

### Step 3: Check Backend Logs

When you generate a quiz, look for these log messages:

**✅ GOOD (Using AI)**:
```
🎯 Batch 1/1: Attempting to generate 5 questions using AI
📝 Prompt created, length: 2500 characters
Making API call to Ollama: http://localhost:11434
✅ Received AI response, length: 1500 characters
🎉 Successfully generated 5 questions using AI
```

**❌ BAD (Using Fallback)**:
```
DeepSeek API key not configured, using intelligent fallback
```

## Common Issues & Solutions

### Issue 1: Ollama Not Running

**Symptoms**:
- Questions come instantly
- Log shows: "Ollama not available"

**Solution**:
```bash
# Start Ollama
ollama serve

# In another terminal, pull the model
ollama pull deepseek-coder-v2
```

### Issue 2: No API Keys Configured

**Symptoms**:
- Questions come instantly
- Log shows: "DeepSeek API key not configured"

**Solution**:
Add to `.env`:
```env
DEEPSEEK_API_KEY=sk-your-key-here
```

Or use Ollama (no API key needed):
```bash
ollama serve
ollama pull deepseek-coder-v2
```

### Issue 3: Ollama Model Not Installed

**Symptoms**:
- Ollama is running
- Log shows: "No DeepSeek models found"

**Solution**:
```bash
ollama pull deepseek-coder-v2
# or
ollama pull deepseek-r1:7b
```

### Issue 4: JSON Parsing Fails

**Symptoms**:
- AI is called (takes 5-10 seconds)
- Log shows: "No questions found in expected format"
- Falls back to generic questions

**Solution**:
This is the prompt/parsing issue. Check:
1. Is the AI returning valid JSON?
2. Look at the "Response preview" in logs
3. The response should start with `[` and end with `]`

## How to Tell If AI Is Working

### Timing Test:
- **Fallback**: Questions appear in < 1 second
- **AI**: Questions take 5-15 seconds to generate

### Quality Test:
- **Fallback**: Generic questions like "What is X?"
- **AI**: Specific questions like "According to the text, what specific definition..."

### Log Test:
Look for these in backend logs:
```
✅ Making API call to Ollama
✅ Received AI response, length: 1500 characters
✅ Successfully generated 5 questions using AI
```

## Enable Debug Logging

Add to your `.env`:
```env
DEBUG=True
LOG_LEVEL=DEBUG
```

Then restart backend:
```bash
uvicorn app.main:app --reload --port 4000
```

## Test with Curl

Test Ollama directly:
```bash
curl http://localhost:11434/api/tags
```

Should return:
```json
{
  "models": [
    {
      "name": "deepseek-coder-v2:latest",
      ...
    }
  ]
}
```

## Next Steps

1. **Run test script**: `python test_ai_connection.py`
2. **Check logs**: Look for 🎯 and ✅ emojis
3. **Verify timing**: AI should take 5-15 seconds
4. **Check question quality**: Should reference specific content

## Still Not Working?

Share your:
1. Output from `test_ai_connection.py`
2. Backend logs when generating a quiz
3. Your `.env` configuration (hide API keys)

---

**Quick Fix**: If nothing works, just start Ollama:
```bash
ollama serve
ollama pull deepseek-coder-v2
```

Then restart your backend and try again!
