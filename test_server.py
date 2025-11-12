#!/usr/bin/env python3
"""
Minimal Test Server for Quiz Generation
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
import os
import logging

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'smartstudy', 'backend'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create minimal FastAPI app
app = FastAPI(title="AceMind Quiz Test Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AceMind Test Server", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/quiz/generate-from-pdf")
async def generate_quiz_from_pdf_test(
    file: UploadFile = File(...),
    topic: str = Form("PDF Content"),
    difficulty: str = Form("medium")
):
    """Test PDF quiz generation without database"""
    
    try:
        logger.info(f"Processing PDF: {file.filename}")
        
        # Import services
        from app.utils.pdf_parser import extract_text_from_pdf
        from app.services.deepseek_ai import deepseek_service
        
        # Extract text
        content = await extract_text_from_pdf(file)
        logger.info(f"Extracted {len(content)} characters")
        
        # Calculate questions
        word_count = len(content.split())
        num_questions = max(5, min(50, word_count // 200))  # Limit to 50 for testing
        logger.info(f"Generating {num_questions} questions from {word_count} words")
        
        # Generate questions
        questions = await deepseek_service.generate_quiz_from_text(content, topic, num_questions)
        logger.info(f"Generated {len(questions)} questions")
        
        # Format response
        formatted_questions = []
        for q in questions:
            formatted_questions.append({
                "id": q.id,
                "question": q.question,
                "options": q.options,
                "correctAnswer": q.options[0],
                "type": "multiple_choice",
                "difficulty": difficulty,
                "points": 1
            })
        
        return {
            "success": True,
            "questions": formatted_questions,
            "topic": topic,
            "difficulty": difficulty,
            "metadata": {
                "total_questions": len(formatted_questions),
                "content_analyzed": {
                    "word_count": word_count,
                    "character_count": len(content),
                    "estimated_reading_time": max(1, word_count // 200)
                },
                "generation_method": "ollama_local",
                "estimated_completion_time": len(formatted_questions) * 1.5
            }
        }
        
    except Exception as e:
        logger.error(f"PDF processing error: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🧪 Starting Test Server")
    print("🌐 Server: http://localhost:4000")
    print("📚 Test endpoint: http://localhost:4000/quiz/generate-from-pdf")
    print("🛑 Press Ctrl+C to stop")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=4000,
        log_level="info"
    )