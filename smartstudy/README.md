# 🎓 AceMind - AI-Powered Study Platform

> Transform your learning materials into personalized, interactive quizzes and study tools powered by AI

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green.svg)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture](#-architecture)
5. [Database Schema](#-database-schema)
6. [Authentication Flow](#-authentication-flow)
7. [Setup Instructions](#-setup-instructions)
8. [API Documentation](#-api-documentation)
9. [Deployment](#-deployment)
10. [Contributing](#-contributing)

---

## 🎯 Overview

**AceMind** is a modern, AI-powered study platform designed to revolutionize how students learn and prepare for exams. By leveraging cutting-edge AI technology, AceMind transforms any study material into interactive quizzes, creates personalized study plans, and tracks your progress.

### 🎪 Key Highlights

- **AI Quiz Generation**: Convert text, PDFs, or web articles into intelligent quizzes
- **Smart Study Planning**: AI-powered personalized study schedules
- **Progress Tracking**: Comprehensive analytics and study streak tracking
- **Professional Reports**: Download beautiful PDF reports
- **Immersive Focus**: 3D focus room for distraction-free studying
- **Dark Mode**: Beautiful violet-tinted dark theme

### 🎯 Target Users

- 📚 Students preparing for exams
- 👨‍🏫 Educators creating assessments
- 🎓 Self-learners seeking structure
- 💼 Professionals validating skills

---

## ✨ Features

### 1. 🧠 AI Quiz Generator

Generate intelligent multiple-choice quizzes from any content source.

**Input Methods:**
- 📝 **Text Input** - Paste study material directly
- 📄 **PDF Upload** - Upload PDF documents (supports OCR)
- 🌐 **URL Input** - Fetch content from web articles

**Capabilities:**
- Dynamic question count (5-20 questions)
- Multiple difficulty levels
- Auto-generated explanations
- Fast generation (5-12 seconds)
- Supports Wikipedia, blogs, documentation

**Example:**
```
Input: Wikipedia article on Photosynthesis
Output: 10 intelligent questions with explanations
Time: ~8 seconds
```



### 2. 📅 AI Study Planner

Create personalized study schedules optimized by AI.

**Features:**
- Multi-subject planning
- Exam date countdown
- Daily study hour allocation
- Priority-based task distribution
- Progress tracking
- Day-wise breakdown

**AI Optimization:**
- Smart time allocation based on difficulty
- Priority-based scheduling
- Phase-based planning (learning → practice → revision)
- Adaptive difficulty adjustment

### 3. 📝 Interactive Quiz Interface

Engaging quiz-taking experience with modern UX.

**Features:**
- ⌨️ **Keyboard Shortcuts** (1-4, Space, ←→, Enter)
- 🎯 **Question Navigation** - Jump to any question
- ⏱️ **Real-time Timer** - Track your time
- 📊 **Progress Bar** - Visual progress indicator
- 🎨 **Color-coded Status** - Current, answered, unanswered
- 🌙 **Dark Mode** - Easy on the eyes

### 4. 📄 Professional PDF Reports

Download beautiful, professional reports.

**Quiz Reports Include:**
- Score summary with percentage
- Time statistics
- Question-by-question breakdown
- Correct/incorrect indicators
- Explanations
- Performance rating

**Study Plan Reports Include:**
- Complete schedule
- Subject details
- Day-wise tasks
- Progress statistics
- Motivational messages

### 5. 📊 Progress Tracking

Comprehensive analytics to monitor your learning.

**Metrics:**
- 🔥 Study streak (consecutive days)
- 🧠 Quiz completion count
- 📈 Average scores
- ⏰ Time spent studying
- 📚 Subject-wise performance
- 📜 Historical data

### 6. 🎯 Focus Room

Immersive 3D environment for distraction-free studying.

**Features:**
- 3D scene rendering
- Ambient sounds
- Pomodoro timer
- Customizable environment

### 7. 📝 Notes Management

Organized note-taking with cloud sync.

**Features:**
- Create/edit/delete notes
- Search functionality
- Categorization & tagging
- Rich text editing
- Cloud sync via Supabase



---

## 💻 Technology Stack

### Frontend

#### Core Framework
```json
{
  "react": "^18.3.1",
  "typescript": "^5.5.3",
  "vite": "^5.4.2",
  "react-router-dom": "^6.26.1"
}
```

#### Styling & UI
```json
{
  "tailwindcss": "^3.4.10",
  "postcss": "^8.4.45",
  "tailwindcss-animate": "^1.0.7"
}
```

#### PDF Generation
```json
{
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.4"
}
```

#### Development Tools
```json
{
  "eslint": "^9.9.1",
  "@typescript-eslint/eslint-plugin": "^8.3.0",
  "@vitejs/plugin-react": "^4.3.1"
}
```

### Backend

#### Core Framework
```python
fastapi==0.115.0
uvicorn==0.31.0
python-dotenv==1.0.1
```

#### Database & Authentication
```python
# Supabase (Primary)
supabase==2.7.4
postgrest-py==0.17.0

# For direct PostgreSQL access if needed
asyncpg==0.29.0
sqlalchemy==2.0.35
```

#### AI Integration
```python
# Local AI (Primary)
ollama-python==0.3.3

# Cloud AI (Fallback)
openai==1.51.0
anthropic==0.34.2
```

#### File Processing
```python
PyPDF2==2.12.1
python-multipart==0.0.12
aiofiles==24.1.0
pytesseract==0.3.13
pdf2image==1.17.0
```

#### Web Scraping
```python
beautifulsoup4==4.12.3
requests==2.32.3
lxml==5.3.0
httpx==0.27.2
```

#### Data Validation
```python
pydantic==2.9.2
pydantic-settings==2.5.2
```



---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │   Quiz   │  │ Planner  │  │  Focus   │       │
│  │          │  │Generator │  │          │  │   Room   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │              │              │
│       └─────────────┴──────────────┴──────────────┘             │
│                          │                                       │
│                   React Router                                   │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                      REST API / WebSocket
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                   BACKEND (FastAPI)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │   Quiz   │  │ Planner  │  │   File   │       │
│  │  Router  │  │  Router  │  │  Router  │  │ Processor│       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │              │              │
│       └─────────────┴──────────────┴──────────────┘             │
│                          │                                       │
│                   Service Layer                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │    AI    │  │   PDF    │  │   Web    │  │  Study   │       │
│  │ Service  │  │  Parser  │  │ Scraper  │  │ Planner  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        │             │             │             │
┌───────▼─────┐ ┌─────▼──────┐ ┌──▼──────────┐ ┌▼──────────────┐
│  Supabase   │ │   Ollama   │ │  External   │ │  File Storage │
│             │ │            │ │  AI APIs    │ │   (Supabase)  │
│ PostgreSQL  │ │  Local AI  │ │             │ │               │
│    Auth     │ │  Models    │ │  DeepSeek   │ │  PDF/Images   │
│  Storage    │ │            │ │   OpenAI    │ │               │
│  Real-time  │ │            │ │             │ │               │
└─────────────┘ └────────────┘ └─────────────┘ └───────────────┘
```

### Data Flow

#### 1. Quiz Generation Flow
```
User Input (Text/PDF/URL)
    ↓
Frontend Validation
    ↓
API Request to Backend (/quiz/v2/generate-fast)
    ↓
Content Extraction
    ├─ PDF: PyPDF2 + OCR (if needed)
    ├─ URL: BeautifulSoup + Requests
    └─ Text: Direct processing
    ↓
AI Service (Priority Order)
    ├─ 1. Ollama (Local, Fast, Free)
    ├─ 2. DeepSeek (Cloud, Fallback)
    └─ 3. OpenAI (Cloud, Fallback)
    ↓
Question Generation & Validation
    ↓
Store in Supabase (quizzes table)
    ↓
Return JSON Response
    ↓
Frontend Display
    ↓
User Takes Quiz
    ↓
Submit Results
    ↓
Save to Supabase (quiz_results table)
    ↓
Update User Stats (Supabase)
    ↓
Generate PDF Report (jsPDF)
```



#### 2. Authentication Flow (Supabase)
```
User Registration/Login
    ↓
Frontend: Supabase Auth SDK
    ↓
Supabase Auth API
    ├─ Email/Password
    ├─ OAuth (Google, GitHub)
    └─ Magic Link
    ↓
JWT Token Generation
    ↓
Store Token
    ├─ httpOnly Cookie (secure)
    └─ localStorage (access token)
    ↓
Include Token in API Headers
    ↓
Backend: Verify JWT with Supabase
    ↓
Extract User ID from Token
    ↓
Row Level Security (RLS) Enforcement
    ↓
Access Protected Resources
```

#### 3. Study Plan Generation Flow
```
User Input (Subjects, Exam Date, Goals)
    ↓
Frontend Validation
    ↓
API Request (/planner/generate)
    ↓
AI Study Planner Service
    ├─ Calculate days until exam
    ├─ Analyze subject difficulty
    ├─ Prioritize topics
    └─ Distribute study hours
    ↓
Generate Day-wise Schedule
    ↓
Store in Supabase (study_plans table)
    ↓
Return Schedule
    ↓
Frontend Display
    ↓
User Tracks Progress
    ↓
Update Completion Status (Supabase)
    ↓
Generate PDF Report
```

---

## 🗄️ Database Schema (Supabase/PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Supabase Auth Integration
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Preferences
  theme VARCHAR(20) DEFAULT 'light',
  daily_study_goal INTEGER DEFAULT 120, -- minutes
  notification_enabled BOOLEAN DEFAULT true,
  
  -- Stats
  total_quizzes INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- minutes
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);
```



### Quizzes Table
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium',
  source_type VARCHAR(20), -- 'text', 'pdf', 'url'
  source_content TEXT,
  source_url TEXT,
  num_questions INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  generation_method VARCHAR(50), -- 'ollama', 'deepseek', 'openai'
  generation_time INTEGER, -- seconds
  content_word_count INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' -- 'draft', 'active', 'completed'
);

-- Indexes
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);
CREATE INDEX idx_quizzes_status ON quizzes(status);

-- RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quizzes"
  ON quizzes FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create own quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```

### Questions Table
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- ["option1", "option2", "option3", "option4"]
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20),
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);

-- RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions of own quizzes"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN users u ON q.user_id = u.id
      WHERE q.id = quiz_id AND u.auth_id = auth.uid()
    )
  );
```

### Quiz Results Table
```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_spent INTEGER NOT NULL, -- seconds
  answers JSONB NOT NULL, -- {"question_id": "selected_answer"}
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX idx_quiz_results_completed_at ON quiz_results(completed_at DESC);

-- RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create own results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```



### Study Plans Table
```sql
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  exam_date DATE NOT NULL,
  daily_study_hours DECIMAL(4,2) NOT NULL,
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' -- 'active', 'completed', 'archived'
);

-- RLS
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study plans"
  ON study_plans FOR ALL
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```

### Study Tasks Table
```sql
CREATE TABLE study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20),
  priority VARCHAR(20),
  duration INTEGER NOT NULL, -- minutes
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_study_tasks_plan_id ON study_tasks(study_plan_id);
CREATE INDEX idx_study_tasks_date ON study_tasks(scheduled_date);
CREATE INDEX idx_study_tasks_completed ON study_tasks(completed);

-- RLS
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tasks of own plans"
  ON study_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM study_plans sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = study_plan_id AND u.auth_id = auth.uid()
    )
  );
```

### Notes Table
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[], -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- Full-text search
CREATE INDEX idx_notes_search ON notes USING GIN(
  to_tsvector('english', title || ' ' || content)
);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes"
  ON notes FOR ALL
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));
```



---

## 🔐 Authentication Flow (Supabase)

### Setup Supabase Auth

1. **Create Supabase Project**
```bash
# Visit https://supabase.com
# Create new project
# Copy Project URL and anon key
```

2. **Configure Environment Variables**
```env
# Frontend (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

3. **Install Supabase Client**
```bash
# Frontend
npm install @supabase/supabase-js

# Backend
pip install supabase
```

### Frontend Authentication Implementation

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// OAuth providers
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}
```



### Backend Authentication Middleware

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import os

security = HTTPBearer()

def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase_client)
):
    token = credentials.credentials
    
    try:
        # Verify JWT token
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

# Usage in routes
@router.get("/profile")
async def get_profile(current_user = Depends(get_current_user)):
    return {"user": current_user}
```

### Protected Route Example

```python
# app/routers/quiz.py
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user, get_supabase_client

router = APIRouter()

@router.post("/quiz/generate")
async def generate_quiz(
    content: str,
    current_user = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    user_id = current_user.id
    
    # Generate quiz logic...
    quiz_data = {...}
    
    # Save to Supabase
    result = supabase.table('quizzes').insert({
        'user_id': user_id,
        'topic': quiz_data['topic'],
        'questions': quiz_data['questions']
    }).execute()
    
    return result.data
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Ollama (for local AI)
- Supabase account
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/acemind.git
cd acemind
```

### 2. Setup Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run database migrations (see Database Schema section)
3. Enable Email Auth in Authentication settings
4. (Optional) Configure OAuth providers
5. Copy Project URL and keys



### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:4000
EOF

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3001`

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# AI Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder-v2:latest

# Optional: Cloud AI fallbacks
DEEPSEEK_API_KEY=your-deepseek-key
OPENAI_API_KEY=your-openai-key

# Server
HOST=0.0.0.0
PORT=4000
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
EOF

# Start server
uvicorn app.main:app --reload --port 4000
```

Backend will run on `http://localhost:4000`

### 5. Setup Ollama (Local AI)

```bash
# Install Ollama
# Visit: https://ollama.ai

# Pull model
ollama pull deepseek-coder-v2:latest

# Verify
ollama list

# Run (optional, runs automatically)
ollama serve
```

### 6. Access Application

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:4000`
- API Docs: `http://localhost:4000/docs`
- Supabase Dashboard: `https://app.supabase.com`

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:4000
Production: https://api.acemind.com
```

### Authentication

All protected endpoints require Bearer token: