# AceMind FastAPI Backend

AI-Powered Study Platform backend built with FastAPI and Python.

## Features

- 🧠 AI Quiz Generation with DeepSeek
- 📅 AI Study Planning
- 📝 Notes Management
- 📊 Progress Analytics
- 🔐 JWT Authentication
- 📚 MongoDB with Beanie ODM
- 🚀 Async/Await throughout
- 📖 Auto-generated OpenAPI docs

## Quick Start

### Prerequisites

- Python 3.11+
- MongoDB
- DeepSeek API key (optional)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd smartstudy/fastapi-backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Access the API:**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run just the backend (requires external MongoDB)
docker build -t smartstudy-fastapi .
docker run -p 8000:8000 smartstudy-fastapi
```

## Project Structure

```
app/
├── __init__.py
├── main.py              # FastAPI application entry point
├── config.py            # Configuration management
├── database.py          # Database connection and initialization
├── dependencies.py      # Dependency injection (auth, etc.)
├── models/              # Pydantic models and Beanie documents
├── routers/             # API route handlers
├── services/            # Business logic services
└── utils/               # Utility functions
```

## Configuration

Key environment variables:

- `MONGODB_URL`: MongoDB connection string
- `DEEPSEEK_API_KEY`: DeepSeek AI API key
- `JWT_SECRET_KEY`: JWT signing secret
- `ALLOWED_ORIGINS`: CORS allowed origins

## Development

### Running Tests

```bash
pytest
```

### Code Quality

```bash
# Format code
black app/

# Lint code
flake8 app/
```

## API Documentation

Once running, visit:
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Migration from NestJS

This FastAPI backend maintains full API compatibility with the existing NestJS backend while providing:

- Better async performance
- Native Python AI integration
- Enhanced DeepSeek AI features
- Improved development experience
- Auto-generated comprehensive documentation

## License

MIT License