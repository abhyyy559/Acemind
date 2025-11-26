# 🎓 AceMind - College Project Documentation

## 📌 Project Overview

**Project Name:** AceMind - AI-Powered Study Platform  
**Type:** Final Year College Project  
**Domain:** Educational Technology (EdTech)  
**Team Size:** [Your team size]  
**Duration:** [Project duration]

---

## 🎯 What is AceMind?

AceMind is a web-based study platform that uses AI to automatically generate quizzes from study materials. Students can upload PDFs, paste text, or share URLs, and the system creates practice questions instantly.

**Simple Explanation:**
- You give it study material
- AI reads and understands it
- Creates quiz questions automatically
- You take the quiz and see results
- Track your progress over time

---

## 🔧 Technology Stack

### Frontend (What users see)
- **React 18** - JavaScript library for building UI
- **TypeScript** - Adds type safety to JavaScript
- **Tailwind CSS** - For styling and design
- **Vite** - Build tool (faster than Create React App)

### Backend (Server-side)
- **FastAPI** - Python web framework
- **Python 3.11** - Programming language
- **Uvicorn** - Server to run FastAPI

### Database & Authentication
- **Supabase** - Handles everything:
  - PostgreSQL database (stores user data, quizzes)
  - User authentication (login/signup)
  - File storage (for PDFs)
  - Real-time updates

### AI Integration
- **Ollama** - Local AI for quiz generation (free)
- **DeepSeek API** - Backup cloud AI
- Models: deepseek-coder-v2, qwen2.5

### Additional Tools
- **PyPDF2** - Extract text from PDFs
- **BeautifulSoup** - Scrape content from websites
- **jsPDF** - Generate PDF reports

---

## 🏗️ System Architecture

```
User Browser (React)
        ↓
    Frontend
        ↓
   REST API
        ↓
FastAPI Backend
        ↓
    ┌───┴───┐
    ↓       ↓
Supabase  Ollama AI
(Database) (Quiz Gen)
```

---

## ✨ Main Features

### 1. AI Quiz Generator
- Input: Text, PDF, or URL
- Output: Multiple choice questions
- Time: 5-12 seconds
- Questions: 5-20 (user choice)

### 2. Study Planner
- Add subjects and exam date
- AI creates day-by-day schedule
- Track task completion

### 3. Quiz Interface
- Take quizzes with timer
- Navigate between questions
- See results instantly
- Download PDF report

### 4. Progress Tracking
- Study streak counter
- Quiz history
- Score statistics
- Time spent studying

### 5. Dark Mode
- Toggle light/dark theme
- Saves preference

---

## 🔄 How It Works

### Quiz Generation Flow:
```
1. User uploads PDF or pastes text
2. Backend extracts content
3. Sends to AI (Ollama)
4. AI generates questions
5. Saves to Supabase database
6. Shows quiz to user
7. User takes quiz
8. Results saved
9. PDF report generated
```

### User Authentication Flow:
```
1. User signs up with email
2. Supabase creates account
3. Sends verification email
4. User logs in
5. Gets JWT token
6. Token used for all requests
7. Can access their data only
```

---

## 🗄️ Database Tables (Supabase)

### users
- id, email, name, avatar
- theme preference
- study stats

### quizzes
- id, user_id, topic
- source (text/pdf/url)
- questions array
- created date

### quiz_results
- id, quiz_id, user_id
- score, percentage
- time taken
- answers

### study_plans
- id, user_id, title
- exam date
- subjects
- daily tasks

### notes
- id, user_id, title
- content, tags
- created/updated dates

---

## 🚀 Setup & Installation

### Prerequisites:
- Node.js 18+
- Python 3.11+
- Ollama installed
- Supabase account

### Frontend Setup:
```bash
cd smartstudy/frontend
npm install
npm run dev
```

### Backend Setup:
```bash
cd smartstudy/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 4000
```

### Supabase Setup:
1. Create project at supabase.com
2. Copy URL and keys
3. Add to .env file
4. Run database migrations

---

## 📊 Project Scope

### What We Built:
✅ AI quiz generation (3 input methods)
✅ User authentication
✅ Study planner
✅ Progress tracking
✅ PDF reports
✅ Dark mode
✅ Responsive design

### What We Didn't Build:
❌ Mobile apps
❌ Payment system
❌ Social features
❌ Video content

---

## 🎓 Learning Outcomes

### Technical Skills Gained:
- Full-stack web development
- React and TypeScript
- Python and FastAPI
- Database design (PostgreSQL)
- AI integration
- Authentication systems
- API development
- PDF processing
- Web scraping

### Concepts Learned:
- REST API design
- JWT authentication
- Database relationships
- State management
- Async programming
- Error handling
- Security best practices

---

## 🔍 Challenges Faced

### 1. PDF Text Extraction
**Problem:** Some PDFs are scanned images  
**Solution:** Added OCR using Pytesseract

### 2. AI Response Time
**Problem:** Cloud AI was slow and costly  
**Solution:** Used local Ollama (free and fast)

### 3. Database Design
**Problem:** Complex relationships  
**Solution:** Used Supabase with Row Level Security

### 4. Authentication
**Problem:** Building auth from scratch is hard  
**Solution:** Used Supabase built-in auth

---

## 📈 Future Improvements

If we had more time:
- Mobile app (React Native)
- Flashcard system
- Voice notes
- Collaborative study rooms
- More AI models
- Better analytics
- Gamification

---

## 🎯 Project Objectives Met

✅ **Objective 1:** Build AI-powered quiz generator  
✅ **Objective 2:** Implement user authentication  
✅ **Objective 3:** Create study planning system  
✅ **Objective 4:** Track user progress  
✅ **Objective 5:** Generate PDF reports  
✅ **Objective 6:** Responsive design  

---

## 📝 Conclusion

AceMind successfully demonstrates:
- Integration of AI in education
- Full-stack web development
- Modern tech stack usage
- Real-world problem solving
- User-centric design

**Result:** A functional, useful study platform that students can actually use.

---

## 👥 Team & Contributions

[Add your team members and their contributions]

---

## 📚 References

- React Documentation
- FastAPI Documentation
- Supabase Documentation
- Ollama Documentation
- Tailwind CSS Documentation

---

*College Project - [Year]*  
*Department: [Your Department]*  
*Institution: [Your College]*

