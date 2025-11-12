"""
Quiz Router V2 - Optimized for speed and multi-source support
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
from pydantic import BaseModel
import logging

from app.services.fast_ai_service import fast_ai_service
from app.services.exam_extractor import exam_extractor
from app.services.source_manager import source_manager
from app.models.quiz import QuizQuestion

logger = logging.getLogger(__name__)

router = APIRouter()

class QuizGenerateRequest(BaseModel):
    content: str
    topic: Optional[str] = None
    num_questions: int = 10

class QuizResponse(BaseModel):
    success: bool
    questions: List[QuizQuestion]
    metadata: dict

@router.post("/generate-fast", response_model=QuizResponse)
async def generate_quiz_fast(request: QuizGenerateRequest):
    """
    Generate quiz quickly using optimized AI service
    Target: < 10 seconds for 20 questions
    """
    
    try:
        logger.info(f"🚀 Fast quiz generation: {request.num_questions} questions")
        
        # Check if content is an exam key
        if exam_extractor.is_exam_key(request.content):
            logger.info("📋 Detected exam key, extracting questions...")
            questions = exam_extractor.extract_exam_questions(request.content)
            
            return QuizResponse(
                success=True,
                questions=questions[:request.num_questions],
                metadata={
                    "method": "exam_extraction",
                    "total_extracted": len(questions),
                    "returned": min(len(questions), request.num_questions)
                }
            )
        
        # Generate using fast AI
        questions = await fast_ai_service.generate_quiz_fast(
            content=request.content,
            topic=request.topic,
            num_questions=request.num_questions
        )
        
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to generate questions")
        
        return QuizResponse(
            success=True,
            questions=questions,
            metadata={
                "method": "ai_generation",
                "generated": len(questions)
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-from-pdf-fast")
async def generate_quiz_from_pdf_fast(
    file: UploadFile = File(...),
    topic: Optional[str] = Form(None),
    num_questions: int = Form(10)
):
    """
    Generate quiz from PDF quickly
    Supports both regular PDFs and exam keys
    """
    
    try:
        logger.info(f"📄 Processing PDF: {file.filename}")
        
        # Add PDF as source
        source = await source_manager.add_pdf_source(file, title=file.filename)
        
        if source.status == "error":
            raise HTTPException(
                status_code=400,
                detail=f"PDF processing failed: {source.metadata.get('error', 'Unknown error')}"
            )
        
        # Check if it's an exam key
        if exam_extractor.is_exam_key(source.content):
            logger.info("📋 Detected exam key in PDF")
            questions = exam_extractor.extract_exam_questions(source.content)
            
            return QuizResponse(
                success=True,
                questions=questions[:num_questions],
                metadata={
                    "method": "exam_extraction",
                    "source_id": source.id,
                    "total_extracted": len(questions)
                }
            )
        
        # Generate using fast AI
        questions = await fast_ai_service.generate_quiz_fast(
            content=source.content,
            topic=topic,
            num_questions=num_questions
        )
        
        return QuizResponse(
            success=True,
            questions=questions,
            metadata={
                "method": "ai_generation",
                "source_id": source.id,
                "word_count": source.word_count
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ PDF quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-from-url-fast")
async def generate_quiz_from_url_fast(
    url: str = Form(...),
    topic: Optional[str] = Form(None),
    num_questions: int = Form(10)
):
    """
    Generate quiz from URL quickly
    """
    
    try:
        logger.info(f"🌐 Processing URL: {url}")
        
        # Add URL as source
        source = await source_manager.add_url_source(url)
        
        if source.status == "error":
            raise HTTPException(
                status_code=400,
                detail=f"URL fetch failed: {source.metadata.get('error', 'Unknown error')}"
            )
        
        # Generate using fast AI
        questions = await fast_ai_service.generate_quiz_fast(
            content=source.content,
            topic=topic or source.title,
            num_questions=num_questions
        )
        
        return QuizResponse(
            success=True,
            questions=questions,
            metadata={
                "method": "ai_generation",
                "source_id": source.id,
                "url": url,
                "word_count": source.word_count
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ URL quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources")
async def list_sources():
    """List all sources"""
    sources = source_manager.get_all_sources()
    return {"sources": sources}

@router.delete("/sources/{source_id}")
async def remove_source(source_id: str):
    """Remove a source"""
    success = source_manager.remove_source(source_id)
    if not success:
        raise HTTPException(status_code=404, detail="Source not found")
    return {"success": True}
