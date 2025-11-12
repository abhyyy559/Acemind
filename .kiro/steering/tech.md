# Technology Stack

## Frontend

**Framework & Build**
- React 18 with TypeScript
- Vite for fast development and building
- React Router DOM v6 for navigation

**Styling**
- Tailwind CSS for utility-first styling
- PostCSS for CSS processing
- Custom glassmorphism and gradient designs

**State Management**
- React Hooks (useState, useEffect)
- Context API for theme management

**Development Tools**
- ESLint for code quality
- TypeScript for type safety

## Backend

**Framework**
- FastAPI (Python) - async/await throughout
- Uvicorn ASGI server

**Database**
- MongoDB for data storage
- Beanie ODM for async document operations
- Motor for async MongoDB driver

**AI Integration**
- DeepSeek API for quiz generation and content analysis

**Authentication**
- JWT-based authentication
- python-jose for token handling
- passlib with bcrypt for password hashing

**File Processing**
- PyPDF2 for PDF text extraction
- python-multipart for file uploads
- aiofiles for async file operations

**Development Tools**
- pytest for testing
- python-dotenv for environment management
- pydantic for data validation

## Common Commands

### Frontend Development
```bash
cd smartstudy/frontend
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

### Backend Development
```bash
cd smartstudy/backend
pip install -r requirements.txt    # Install dependencies
uvicorn app.main:app --reload      # Start dev server (http://localhost:8000)
python -m pytest                   # Run tests
```

### Docker
```bash
cd smartstudy/backend
docker-compose up --build          # Build and run with Docker
```

## Environment Configuration

**Backend (.env)**
- `MONGODB_URL`: MongoDB connection string
- `DEEPSEEK_API_KEY`: DeepSeek AI API key
- `JWT_SECRET_KEY`: JWT signing secret
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

## API Documentation

- Interactive Swagger UI: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

## Performance Targets

- Quiz generation: 3-8 seconds
- PDF processing: 2-5 seconds
- API response time: <500ms
- Authentication: <200ms
