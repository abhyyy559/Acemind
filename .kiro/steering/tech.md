# Technology Stack

## AceMind (smartstudy/)

### Frontend
- **Framework:** React 18.2 with TypeScript 5.2
- **Build Tool:** Vite 4.5
- **Routing:** React Router DOM 6.20
- **Styling:** TailwindCSS 3.3 with tailwindcss-animate
- **UI Libraries:** Lucide React (icons), Tabler Icons, Motion (animations)
- **PDF Generation:** jsPDF 3.0 with jspdf-autotable 5.0
- **Backend Client:** Axios 1.13, Supabase JS 2.84

### Backend
- **Framework:** FastAPI with Uvicorn (ASGI server)
- **Language:** Python 3.11+
- **Database:** MongoDB with Motor (async driver) and Beanie ODM
- **Authentication:** Supabase Auth, python-jose (JWT), passlib (bcrypt)
- **AI Services:** 
  - DeepSeek API (primary)
  - Ollama (local LLM option)
  - OpenAI (fallback)
- **File Processing:**
  - PyPDF2 3.0 (PDF text extraction)
  - Google Cloud Vision API (OCR for scanned PDFs)
  - pdf2image, Pillow (image processing)
- **Web Scraping:** BeautifulSoup4, lxml, aiohttp, httpx
- **Validation:** Pydantic 2.0 with pydantic-settings

### Common Commands
```bash
# Frontend (smartstudy/frontend/)
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint

# Backend (smartstudy/backend/)
python -m venv venv                    # Create virtual environment
venv\Scripts\activate                  # Activate (Windows)
source venv/bin/activate               # Activate (Mac/Linux)
pip install -r requirements.txt        # Install dependencies
uvicorn app.main:app --reload --port 4000  # Start dev server
python -m pytest                       # Run tests
```

---

## GrowMap (Growmap/)

### Frontend
- **Framework:** React 18.2 (JavaScript, no TypeScript)
- **Build Tool:** Vite 4.5
- **Routing:** React Router DOM 6.18
- **Styling:** TailwindCSS 3.3
- **Visualization:** 
  - Markmap (mind map rendering)
  - D3.js 7.8 (SVG manipulation)
- **3D Graphics:** Three.js 0.152, React Three Fiber 8.13, React Three Drei 9.86
- **Animations:** Framer Motion 12.23, GSAP 3.13
- **UI Libraries:** Lucide React (icons), React Hot Toast (notifications)
- **Markdown:** Marked 9.1, DOMPurify 3.2 (sanitization)
- **HTTP Client:** Axios 1.6

### Backend
- **Framework:** FastAPI with Uvicorn
- **Language:** Python 3.8+
- **AI Services:**
  - Ollama (local LLM - DeepSeek Coder V2)
  - Google Gemini API (fallback)
- **Web Scraping:** BeautifulSoup4, aiohttp, requests
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Validation:** Pydantic
- **Environment:** python-dotenv

### Common Commands
```bash
# Frontend (Growmap/frontend/)
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build

# Backend (Growmap/backend/)
python -m venv venv                    # Create virtual environment
venv\Scripts\activate                  # Activate (Windows)
pip install -r requirements.txt        # Install dependencies
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  # Start dev server

# Ollama (for local AI)
ollama pull deepseek-coder-v2:latest   # Download model
ollama serve                           # Start Ollama server
ollama list                            # List installed models
```

---

## Shared Technologies

### Development Tools
- **Version Control:** Git
- **Package Managers:** npm (frontend), pip (backend)
- **Code Quality:** ESLint (frontend), Python type hints (backend)
- **Environment Variables:** .env files (never commit!)

### Deployment
- **Frontend:** Vercel (both projects previously deployed)
- **Backend:** Render.com (both projects previously deployed)
- **Database:** 
  - AceMind: MongoDB Atlas
  - GrowMap: Supabase Cloud

### API Patterns
- RESTful APIs with FastAPI
- CORS configured for local development and production
- Async/await patterns throughout
- Pydantic models for request/response validation
- JWT authentication where applicable

### Performance Considerations
- Vite for fast HMR and optimized builds
- Async operations in Python (FastAPI, Motor, aiohttp)
- Connection pooling for database
- Lazy loading and code splitting in React
- Local AI processing to reduce API costs and latency
