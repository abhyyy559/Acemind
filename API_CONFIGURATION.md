# 🔧 AceMind API Configuration

## ✅ Current Setup (Ollama-First)

Your system is configured to use **local Ollama API** as the primary AI provider with automatic fallback.

### API Priority Order:

```
1. 🏠 Ollama (Local)     ← PRIMARY (Unlimited, Free)
   └─ http://localhost:11434
   └─ Model: deepseek-coder-v2:latest

2. 🚫 NVIDIA API         ← DISABLED
   └─ API Key: (empty)

3. 🚫 DeepSeek API       ← DISABLED  
   └─ API Key: (empty)

4. 🧠 Intelligent Fallback ← Last Resort
   └─ Content-based question generation
```

## 📋 Environment Variables (.env)

```env
# Ollama Configuration (PRIMARY)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder-v2:latest

# NVIDIA API (DISABLED)
NVIDIA_API_KEY=

# DeepSeek API (DISABLED)
DEEPSEEK_API_KEY=
```

## 🔄 How API Selection Works

The system tries APIs in this order:

### Step 1: Try Ollama (Local)
```python
# Check if Ollama is available
health_check → http://localhost:11434/api/tags

# If available, use it
POST → http://localhost:11434/api/chat
{
  "model": "deepseek-coder-v2:latest",
  "messages": [...],
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "num_predict": 4096
  }
}
```

### Step 2: Try NVIDIA (If Ollama Fails)
```python
# Only if NVIDIA_API_KEY is set
if self.nvidia_api_key:
    POST → https://integrate.api.nvidia.com/v1/chat/completions
```
**Status:** ❌ Disabled (no API key)

### Step 3: Try DeepSeek (If Both Fail)
```python
# Only if DEEPSEEK_API_KEY is set
if self.api_key:
    POST → https://api.deepseek.com/v1/chat/completions
```
**Status:** ❌ Disabled (no API key)

### Step 4: Intelligent Fallback
```python
# If all APIs fail, use content analysis
return self._generate_fallback_questions(content, topic, num_questions)
```

## 🎯 Benefits of Current Configuration

### ✅ Advantages:
- **Unlimited Usage**: No API rate limits
- **Zero Cost**: Completely free
- **Privacy**: All data stays local
- **Fast**: No network latency
- **Reliable**: No external dependencies

### ⚠️ Considerations:
- Requires Ollama service running
- Uses local compute resources
- Model must be downloaded first

## 🚀 Server Status

### Backend Server
- **URL**: http://localhost:4000
- **Status**: ✅ Running
- **API Docs**: http://localhost:4000/docs

### Frontend Server
- **URL**: http://localhost:3001
- **Status**: ✅ Running

### Ollama Service
- **URL**: http://localhost:11434
- **Status**: ✅ Running
- **Model**: deepseek-coder-v2:latest

## 🧪 Testing the Configuration

### Test 1: Check Ollama
```bash
curl http://localhost:11434/api/tags
```

### Test 2: Generate Quiz
```bash
curl -X POST http://localhost:4000/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Photosynthesis is the process by which plants convert sunlight into energy.",
    "topic": "Biology"
  }'
```

### Test 3: Check Backend Health
```bash
curl http://localhost:4000/
```

## 📊 Code Location

The API selection logic is in:
```
smartstudy/backend/app/services/deepseek_ai.py
└─ async def _call_deepseek_api(self, prompt: str)
```

## 🔄 To Switch Back to NVIDIA API

If you want to use NVIDIA API instead:

1. **Edit `.env` file:**
```env
NVIDIA_API_KEY=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
```

2. **Restart backend:**
```bash
cd smartstudy/backend
python main.py
```

The system will automatically try NVIDIA if Ollama fails.

## 🎉 Summary

Your AceMind system is now configured to:
- ✅ Use **Ollama** as primary AI provider
- ✅ Run completely **offline** and **free**
- ✅ Generate **unlimited quizzes**
- ✅ Maintain **privacy** (no external API calls)
- ✅ Provide **fast responses** (local processing)

**Everything is ready to use!** 🚀
