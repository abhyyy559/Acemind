from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request, Form
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
from app.models.quiz import (
    Quiz, QuizAttempt, GenerateQuizDto, SubmitQuizDto, 
    QuizData, QuizResponse, QuizResult, QuizHistory, QuizQuestion
)
from app.models.user import User
from app.dependencies import get_current_user, get_current_user_optional
from app.services.deepseek_ai import deepseek_service
from app.utils.pdf_parser import extract_text_from_pdf

router = APIRouter()

# NestJS compatible request model
class GenerateQuizRequest(BaseModel):
    prompt: str
    content: str
    topic: str
    difficulty: str = "medium"

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    generate_quiz_dto: GenerateQuizDto,
    file: UploadFile = File(None),
    request: Request = None
):
    """Generate quiz - compatible with NestJS"""
    
    # Get user info (compatible with NestJS anonymous user handling)
    user_info = await get_current_user_optional(request)
    user_id = user_info.get("id", "anonymous")
    
    try:
        if generate_quiz_dto.input_method == "text":
            if not generate_quiz_dto.text_content:
                raise HTTPException(status_code=400, detail="Text content is required for text-based quiz generation")
            
            # Calculate number of questions based on content length
            word_count = len(generate_quiz_dto.text_content.split())
            num_questions = max(5, min(200, word_count // 200))
            
            # Generate questions using AI service
            questions = await deepseek_service.generate_quiz_from_text(
                generate_quiz_dto.text_content, 
                generate_quiz_dto.topic,
                num_questions
            )
            source_content = generate_quiz_dto.text_content
            
        elif generate_quiz_dto.input_method == "pdf":
            if not file:
                raise HTTPException(status_code=400, detail="PDF file is required for PDF-based quiz generation")
            
            # Extract text from PDF
            text_content = await extract_text_from_pdf(file)
            
            # Calculate number of questions based on content length
            word_count = len(text_content.split())
            num_questions = max(5, min(200, word_count // 200))
            
            # Generate questions using AI service
            questions = await deepseek_service.generate_quiz_from_text(text_content, generate_quiz_dto.topic, num_questions)
            source_content = text_content[:500] + "..." if len(text_content) > 500 else text_content
            
        else:
            raise HTTPException(status_code=400, detail="Invalid input method")
        
        if not questions:
            raise HTTPException(status_code=400, detail="Failed to generate questions")
        
        # Extract correct answers (first option for fallback questions)
        correct_answers = [q.options[0] for q in questions]
        
        # Create quiz document
        quiz = Quiz(
            topic=generate_quiz_dto.topic or "Generated Quiz",
            created_by=user_info.get("user") if user_id != "anonymous" else None,
            questions=questions,
            correct_answers=correct_answers,
            source_content=source_content
        )
        
        await quiz.save()
        
        return QuizResponse(
            id=str(quiz.id),
            topic=quiz.topic,
            questions=quiz.questions,
            status=quiz.status,
            created_at=quiz.created_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

@router.get("/{quiz_id}", response_model=QuizData)
async def get_quiz(quiz_id: str, request: Request):
    """Get quiz by ID - compatible with NestJS"""
    
    user_info = await get_current_user_optional(request)
    
    quiz = await Quiz.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return QuizData(
        id=str(quiz.id),
        topic=quiz.topic,
        questions=quiz.questions,
        created_at=quiz.created_at
    )

@router.post("/{quiz_id}/submit", response_model=QuizResult)
async def submit_quiz(
    quiz_id: str,
    submit_quiz_dto: SubmitQuizDto,
    request: Request
):
    """Submit quiz answers - compatible with NestJS"""
    
    user_info = await get_current_user_optional(request)
    user_id = user_info.get("id", "anonymous")
    
    quiz = await Quiz.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Calculate score
    score = 0
    max_score = len(quiz.questions)
    
    for i, question in enumerate(quiz.questions):
        user_answer = submit_quiz_dto.answers.get(question.id, "")
        if i < len(quiz.correct_answers) and user_answer == quiz.correct_answers[i]:
            score += 1
    
    percentage = (score / max_score) * 100 if max_score > 0 else 0
    
    # Create quiz attempt if user is authenticated
    if user_id != "anonymous" and user_info.get("user"):
        attempt = QuizAttempt(
            quiz=quiz,
            user=user_info["user"],
            answers=submit_quiz_dto.answers,
            score=score,
            max_score=max_score,
            percentage=percentage,
            completed_at=datetime.utcnow(),
            is_completed=True
        )
        await attempt.save()
    
    return QuizResult(
        quiz_id=str(quiz.id),
        score=score,
        max_score=max_score,
        percentage=percentage,
        answers=submit_quiz_dto.answers,
        correct_answers=quiz.correct_answers
    )

@router.get("/user/{user_id}/history", response_model=List[QuizHistory])
async def get_user_quiz_history(user_id: str):
    """Get user quiz history - compatible with NestJS"""
    
    attempts = await QuizAttempt.find(
        QuizAttempt.user.id == user_id,
        QuizAttempt.is_completed == True
    ).sort(-QuizAttempt.completed_at).to_list()
    
    history = []
    for attempt in attempts:
        quiz = await Quiz.get(attempt.quiz.id)
        if quiz:
            history.append(QuizHistory(
                quiz_id=str(quiz.id),
                topic=quiz.topic,
                score=attempt.score,
                max_score=attempt.max_score,
                percentage=attempt.percentage,
                completed_at=attempt.completed_at
            ))
    
    return history

@router.post("/generate-deepseek")
async def generate_quiz_with_deepseek(request: GenerateQuizRequest):
    """Generate quiz with DeepSeek - compatible with NestJS frontend"""
    
    try:
        # Calculate number of questions based on content length
        word_count = len(request.content.split())
        num_questions = max(5, min(200, word_count // 200))  # 1 question per 200 words
        
        # Generate questions using AI service
        questions = await deepseek_service.generate_quiz_from_text(
            request.content, 
            request.topic,
            num_questions
        )
        
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate quiz questions")
        
        # Analyze content for better response
        content_stats = {
            "word_count": len(request.content.split()),
            "character_count": len(request.content),
            "estimated_reading_time": max(1, len(request.content.split()) // 200)  # minutes
        }
        
        # Convert to frontend-compatible format with enhanced information
        formatted_questions = []
        for i, q in enumerate(questions):
            formatted_questions.append({
                "id": q.id,
                "question": q.question,
                "options": q.options,
                "correctAnswer": q.options[0],  # First option is correct for fallback questions
                "type": "multiple_choice",
                "difficulty": request.difficulty,
                "points": 1
            })
        
        return {
            "success": True,
            "questions": formatted_questions,
            "topic": request.topic,
            "difficulty": request.difficulty,
            "metadata": {
                "total_questions": len(formatted_questions),
                "content_analyzed": content_stats,
                "generation_method": "ai" if _has_ai_key() else "intelligent_fallback",
                "estimated_completion_time": len(formatted_questions) * 1.5  # minutes
            }
        }
        
    except Exception as e:
        print(f"DeepSeek quiz generation error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate quiz questions"
        )

@router.post("/generate-from-pdf")
async def generate_quiz_from_pdf(
    file: UploadFile = File(...),
    topic: str = Form("PDF Content"),
    difficulty: str = Form("medium")
):
    """Generate quiz from PDF - compatible with enhanced frontend"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        logger.info(f"Processing PDF file: {file.filename}")
        
        # Extract text from PDF
        content = await extract_text_from_pdf(file)
        logger.info(f"Extracted {len(content)} characters from PDF")
        
        if len(content.strip()) < 50:
            raise HTTPException(status_code=400, detail="PDF content too short for quiz generation")
        
        # Calculate number of questions based on content length
        word_count = len(content.split())
        num_questions = max(5, min(200, word_count // 200))  # 1 question per 200 words
        
        logger.info(f"Generating {num_questions} questions from {word_count} words")
        
        # Generate questions using AI service (same as text input)
        questions = await deepseek_service.generate_quiz_from_text(content, topic, num_questions)
        
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate quiz questions")
        
        # Analyze content for better response
        content_stats = {
            "word_count": len(content.split()),
            "character_count": len(content),
            "estimated_reading_time": max(1, len(content.split()) // 200),  # minutes
            "pages_processed": content.count('\n\n') + 1  # Rough page estimate
        }
        
        # Convert to frontend-compatible format with enhanced information
        formatted_questions = []
        for i, q in enumerate(questions):
            formatted_questions.append({
                "id": q.id,
                "question": q.question,
                "options": q.options,
                "correctAnswer": q.options[0],  # First option is correct for fallback questions
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
                "content_analyzed": content_stats,
                "generation_method": "ai" if _has_ai_key() else "intelligent_fallback",
                "estimated_completion_time": len(formatted_questions) * 1.5,  # minutes
                "source_type": "pdf",
                "filename": file.filename
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF quiz generation error: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz from PDF: {str(e)}"
        )

def _has_ai_key() -> bool:
    """Check if AI service is configured"""
    from app.config import settings
    return bool(settings.DEEPSEEK_API_KEY)