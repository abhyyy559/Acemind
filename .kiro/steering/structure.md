# Project Structure

## Root Organization

```
smartstudy/
├── backend/           # FastAPI Python backend
├── frontend/          # React TypeScript frontend
└── PROJECT_DOCUMENTATION.md
```

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point, CORS, lifespan
│   ├── database.py          # MongoDB connection and initialization
│   ├── dependencies.py      # Dependency injection (auth, etc.)
│   ├── config/              # Configuration management
│   ├── models/              # Pydantic models and Beanie documents
│   ├── routers/             # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User management
│   │   ├── notes.py         # Notes CRUD
│   │   ├── quiz.py          # Quiz generation and management
│   │   ├── study_sessions.py
│   │   └── test_quiz.py     # Test endpoints
│   ├── services/            # Business logic services
│   │   └── deepseek_ai.py   # DeepSeek AI integration
│   └── utils/               # Utility functions
├── uploads/                 # File upload directory
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
├── Dockerfile
└── docker-compose.yml
```

## Frontend Structure

```
frontend/
├── src/
│   ├── main.tsx            # Application entry point
│   ├── App.tsx             # Router and layout setup
│   ├── index.css           # Global styles and Tailwind imports
│   ├── components/         # Reusable UI components
│   │   └── Layout.tsx      # Main layout with navigation
│   ├── contexts/           # React Context providers
│   │   └── ThemeContext.tsx
│   ├── pages/              # Route components
│   │   ├── Home.tsx        # Dashboard with stats
│   │   ├── EnhancedQuiz.tsx # Quiz generation interface
│   │   ├── Planner.tsx     # Study planning calendar
│   │   ├── Focus.tsx       # Focus room with 3D scene
│   │   ├── Notes.tsx       # Notes management
│   │   └── Analytics.tsx   # Performance analytics
│   └── services/           # API client services
├── public/                 # Static assets
├── package.json
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js
└── vite.config.ts          # Vite build configuration
```

## Key Architectural Patterns

### Backend
- **Async/Await**: All database and I/O operations are async
- **Dependency Injection**: FastAPI's dependency system for auth and database
- **Router-based Organization**: Endpoints grouped by feature in routers/
- **Service Layer**: Business logic separated in services/
- **ODM Pattern**: Beanie for MongoDB document modeling

### Frontend
- **Component-based**: Reusable React components
- **Route-based Code Splitting**: Lazy loading for pages
- **Context for Global State**: Theme and auth state management
- **Utility-first CSS**: Tailwind for styling
- **Type Safety**: TypeScript throughout

## File Naming Conventions

### Backend (Python)
- Snake_case for files: `deepseek_ai.py`, `study_sessions.py`
- PascalCase for classes: `QuizModel`, `UserDocument`
- Snake_case for functions: `generate_quiz()`, `get_current_user()`

### Frontend (TypeScript/React)
- PascalCase for components: `EnhancedQuiz.tsx`, `Layout.tsx`
- camelCase for utilities: `apiClient.ts`
- PascalCase for contexts: `ThemeContext.tsx`

## Import Organization

### Backend
```python
# Standard library
import os
from typing import List

# Third-party
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Local
from app.models import User
from app.services import deepseek_ai
```

### Frontend
```typescript
// React and third-party
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Local components
import Layout from "./components/Layout";

// Local utilities
import { apiClient } from "./services/api";
```
