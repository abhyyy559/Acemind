# 🎓 AceMind - AI-Powered Study Platform

> Transform your study materials into personalized quizzes with AI

## 🚀 Quick Start

```bash
# Backend
cd smartstudy/backend
pip install -r requirements.txt
cp .env.example .env
# Add your DEEPSEEK_API_KEY to .env
uvicorn app.main:app --reload --port 4000

# Frontend (new terminal)
cd smartstudy/frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

## 📚 Full Documentation

See [smartstudy/README.md](smartstudy/README.md) for complete documentation.

## ✨ Features

- 🧠 **AI Quiz Generation** - Generate quizzes from text or PDF
- 📅 **AI Study Planner** - Smart scheduling with 3-phase approach
- 📝 **Notes Management** - Tag-based organization with search
- 📊 **Analytics Dashboard** - Real-time performance tracking
- 💾 **Data Export** - Download as JSON, Text, Markdown, iCal
- 🔒 **Complete Privacy** - All data stored locally in browser

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + DeepSeek AI + PyPDF2
- **Storage**: Browser localStorage (no database needed)

## 📦 Project Structure

```
smartstudy/
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # AI services
│   │   └── utils/     # PDF parser, etc.
│   └── requirements.txt
└── frontend/          # React TypeScript frontend
    ├── src/
    │   ├── pages/     # Route components
    │   ├── components/# UI components
    │   └── services/  # API clients
    └── package.json
```

## 🔧 Environment Variables

Create `backend/.env`:
```env
DEEPSEEK_API_KEY=your_api_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
PORT=4000
```

## 📖 API Documentation

When backend is running, visit:
- Swagger UI: `http://localhost:4000/docs`
- ReDoc: `http://localhost:4000/redoc`

## 🎯 Key Features

### AI Quiz Generation
- Upload PDF or paste text
- AI analyzes content and generates questions
- Multiple difficulty levels
- Instant feedback with explanations

### AI Study Planner
- Set exam date and subjects
- AI creates day-by-day schedule
- Track progress and completion
- Export to calendar (iCal)

### Notes Management
- Create, edit, delete notes
- Tag-based organization
- Full-text search
- Export as Markdown

### Analytics
- Quiz performance tracking
- Study time analysis
- Progress visualization
- Downloadable reports

## 🚀 Deployment

### Frontend
Deploy to Vercel, Netlify, or any static hosting:
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend
Deploy to Heroku, Railway, or Render:
```bash
cd backend
# No database needed!
# Just set environment variables
```

## 📝 License

MIT License - Feel free to use for personal or commercial projects

---

Made with ❤️ for students everywhere
