# AceMind - AI-Powered Study Platform

An intelligent study companion that helps students learn more effectively using AI.

## Features

### 🧠 AI Quiz Generator
- Generate quizzes from text or PDF content
- Multiple difficulty levels
- Instant feedback with explanations
- Beautiful results page with performance insights

### 🗺️ Learning Roadmap Generator
- AI-powered personalized learning paths
- Interactive mind map visualization
- Real resources from YouTube, Coursera, Udemy, etc.
- Download as standalone HTML

### 📅 AI Study Planner
- Personalized study schedules
- 5 comprehensive study phases
- Drag & drop task management
- Progress tracking with motivational insights

### 📝 Notes Management
- Cloud-synced notes
- Markdown support
- Organize by topics

## Tech Stack

### Frontend
- React 18.2 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (navigation)
- Axios (HTTP client)

### Backend
- FastAPI (Python framework)
- MongoDB with Beanie ODM
- Supabase (authentication & database)
- DeepSeek AI / Ollama (LLM)
- BeautifulSoup4 (web scraping)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local or Atlas)
- Ollama (optional, for local AI)

### Backend Setup

```bash
cd smartstudy/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start server
uvicorn app.main:app --reload --port 4000
```

### Frontend Setup

```bash
cd smartstudy/frontend

# Install dependencies
npm install

# Configure environment
# Create .env file with:
# VITE_API_URL=http://localhost:4000

# Start development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/docs

## Environment Variables

### Backend (.env)
```bash
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=acemind

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# AI Services (choose one or more)
# Ollama (Local - Recommended)
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=deepseek-coder-v2:latest

# Gemini (Cloud)
GEMINI_API_KEY=your_gemini_key

# DeepSeek (Cloud)
DEEPSEEK_API_KEY=your_deepseek_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Google Cloud Vision (for PDF OCR)
GOOGLE_APPLICATION_CREDENTIALS=path/to/vision.json
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:4000
```

## Project Structure

```
acemind/
├── smartstudy/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── routers/      # API endpoints
│   │   │   ├── services/     # Business logic
│   │   │   ├── models/       # Data models
│   │   │   ├── utils/        # Utilities
│   │   │   └── main.py       # FastAPI app
│   │   ├── requirements.txt
│   │   └── .env.example
│   │
│   └── frontend/
│       ├── src/
│       │   ├── pages/        # React pages
│       │   ├── components/   # Reusable components
│       │   ├── services/     # API clients
│       │   ├── contexts/     # React contexts
│       │   └── App.tsx       # Main app
│       ├── package.json
│       └── vite.config.ts
│
├── start_acemind.py          # Quick start script
├── FINAL_IMPLEMENTATION_SUMMARY.md  # Detailed docs
└── README.md                 # This file
```

## Features in Detail

### Quiz Generator
1. Input study material (text or PDF)
2. AI generates relevant questions
3. Take quiz with instant feedback
4. View detailed results with explanations
5. Track performance over time

### Roadmap Generator
1. Enter topic and difficulty level
2. AI generates structured learning path
3. View as markdown or interactive mind map
4. Get curated resources from multiple platforms
5. Download roadmap as HTML

### Study Planner
1. Add subjects with topics and priorities
2. Set exam date and daily study hours
3. AI generates comprehensive study schedule
4. Track progress day by day
5. Drag & drop to reorganize tasks

## Development

### Run Tests
```bash
# Backend
cd smartstudy/backend
python -m pytest

# Frontend
cd smartstudy/frontend
npm run test
```

### Build for Production
```bash
# Frontend
cd smartstudy/frontend
npm run build

# Backend
# Use uvicorn with --workers flag
uvicorn app.main:app --host 0.0.0.0 --port 4000 --workers 4
```

## Deployment

### Frontend (Vercel)
```bash
cd smartstudy/frontend
vercel deploy
```

### Backend (Render/Railway)
- Connect GitHub repository
- Set environment variables
- Deploy with: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: See FINAL_IMPLEMENTATION_SUMMARY.md

## Acknowledgments

- DeepSeek AI for LLM capabilities
- Markmap for mind map visualization
- Supabase for backend services
- All open-source contributors

---

Built with ❤️ for students worldwide
