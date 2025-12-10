# Environment Setup Guide

## Overview
This project is configured to work seamlessly in both development and production environments.

## 🔧 Development Phase

### Backend (Local)
```bash
cd smartstudy/backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 4000
```

**Environment Variables (.env):**
```bash
# AI APIs (at least one required)
DEEPSEEK_API_KEY=your_deepseek_key  # Optional for dev
GEMINI_API_KEY=your_gemini_key      # Optional for dev

# Database (optional for dev)
MONGODB_URL=mongodb://localhost:27017/acemind

# Environment
ENVIRONMENT=development
```

### Frontend (Local)
```bash
cd smartstudy/frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

**Uses `.env` file:**
- API calls go to: `http://localhost:4000`
- OAuth redirects to: `http://localhost:3000`

### AI Service Priority (Development):
1. 🥇 **Ollama** (local, free, unlimited)
2. 🥈 **DeepSeek API** (if key provided)
3. 🥉 **Gemini API** (if key provided)
4. 🔄 **Fallback** (basic template)

---

## 🚀 Production Phase

### Backend (Render.com)
**Environment Variables (Render Dashboard):**
```bash
# Required
DEEPSEEK_API_KEY=your_deepseek_key
ENVIRONMENT=production

# Optional but recommended
GEMINI_API_KEY=your_gemini_key
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/acemind
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### Frontend (Vercel)
**Environment Variables (Vercel Dashboard):**
```bash
VITE_API_URL=https://acemind.onrender.com
VITE_APP_URL=https://acemind-study.vercel.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Uses `.env.production` file:**
- API calls go to: `https://acemind.onrender.com`
- OAuth redirects to: `https://acemind-study.vercel.app`

### AI Service Priority (Production):
1. 🥇 **DeepSeek API** (reliable, fast cloud API)
2. 🥈 **Gemini API** (Google's free tier)
3. 🔄 **Fallback** (basic template)

---

## 🧪 Testing Scenarios

### Scenario 1: Full Local Development
```bash
# Backend: http://localhost:4000
# Frontend: http://localhost:3000
# AI: Ollama (local)
```

### Scenario 2: Local Frontend + Production Backend
```bash
# Rename .env.local to .env.local (if you want to test with prod backend)
# Frontend: http://localhost:3000
# Backend: https://acemind.onrender.com
# AI: DeepSeek API
```

### Scenario 3: Full Production
```bash
# Frontend: https://acemind-study.vercel.app
# Backend: https://acemind.onrender.com
# AI: DeepSeek API
```

---

## 📋 Quick Setup Checklist

### Development Setup:
- [ ] Clone repository
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Start Ollama (optional): `ollama serve`
- [ ] Pull DeepSeek model (optional): `ollama pull deepseek-coder-v2`
- [ ] Start backend: `uvicorn app.main:app --reload --port 4000`
- [ ] Start frontend: `npm run dev`

### Production Deployment:
- [ ] Set Render environment variables
- [ ] Set Vercel environment variables
- [ ] Configure Supabase redirect URLs
- [ ] Push to GitHub (auto-deploys)
- [ ] Verify both services are live

---

## 🔑 API Keys Setup

### DeepSeek API (Recommended for Production)
1. Go to https://platform.deepseek.com/
2. Create account and get API key
3. Add credits to your account
4. Set `DEEPSEEK_API_KEY` in environment

### Gemini API (Free Tier)
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Set `GEMINI_API_KEY` in environment

### Ollama (Local Development)
1. Install Ollama: https://ollama.ai/
2. Run: `ollama pull deepseek-coder-v2`
3. Start: `ollama serve`

---

## 🐛 Troubleshooting

### CORS Errors
- Check backend CORS configuration includes your frontend URL
- Verify environment variables are set correctly

### AI Generation Fails
- Check API keys are valid and have credits
- Verify Ollama is running (for local dev)
- Check backend logs for specific error messages

### Database Connection Issues
- MongoDB is optional for basic functionality
- Quiz/roadmap generation works without database
- User accounts require database connection

---

## 🔄 Environment Switching

### Switch to Local Development:
```bash
# Use .env file (already configured)
npm run dev
```

### Switch to Production Testing:
```bash
# Rename .env.local to .env.local
npm run dev
```

### Deploy to Production:
```bash
git push  # Auto-deploys to Vercel and Render
```