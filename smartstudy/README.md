# 🎓 AceMind - AI-Powered Study Platform

> **Session-Based Study Platform with Complete Privacy & Data Portability**

## 🌟 Features

- ✅ **AI Quiz Generation** - Generate quizzes from text or PDF using DeepSeek AI
- ✅ **AI Study Planner** - Smart scheduling with 3-phase approach
- ✅ **Notes Management** - Tag-based organization with search
- ✅ **Analytics Dashboard** - Real-time performance tracking
- ✅ **Download Everything** - Export all your data (JSON, Text, Markdown, iCal)
- ✅ **Complete Privacy** - All data stored in browser localStorage
- ✅ **Offline First** - Works without internet (except AI generation)

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd smartstudy/backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your DEEPSEEK_API_KEY

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 4000
```

### Frontend Setup
```bash
cd smartstudy/frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

## 📦 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- localStorage for data persistence

### Backend
- FastAPI (Python)
- DeepSeek AI (with Ollama & NVIDIA fallbacks)
- PyPDF2 for PDF processing

## 🎯 Session-Based Architecture

All data is stored in browser localStorage:
- No database required
- Complete privacy
- Easy data export/import
- Fast performance

## 📥 Download Features

- **Quiz Results**: JSON, Text Report
- **Study Plans**: JSON, Text, iCal (calendar import)
- **Notes**: Markdown
- **Complete Backup**: All data as JSON

## 🔧 Environment Variables

Create `backend/.env`:
```env
DEEPSEEK_API_KEY=your_api_key_here
NVIDIA_API_KEY=your_nvidia_key (optional)
OLLAMA_BASE_URL=http://localhost:11434 (optional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
HOST=0.0.0.0
PORT=4000
```

## 📚 Documentation

- **Frontend Setup**: See `frontend/SHADCN_SETUP.md` for shadcn/ui components
- **API Docs**: Visit `http://localhost:4000/docs` when backend is running

## 🎨 Key Pages

- `/` - Dashboard with quick stats
- `/quiz` - AI Quiz Generator
- `/planner` - AI Study Planner
- `/notes` - Notes Management
- `/analytics` - Performance Analytics
- `/data` - Data Management (Export/Import)

## 🛠️ Development

### Add shadcn/ui Components
```bash
cd frontend
npx shadcn-ui@latest add button card dialog
```

### Run Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📝 License

MIT License - Feel free to use for personal or commercial projects

---

Made with ❤️ by the AceMind Team
