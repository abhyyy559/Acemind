from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from app.services.deepseek_ai import deepseek_service
from app.utils.pdf_parser import extract_text_from_pdf

router = APIRouter()

class TestQuizRequest(BaseModel):
    content: str
    topic: Optional[str] = None

@router.post("/test-generate")
async def test_generate_quiz(request: TestQuizRequest):
    """Test quiz generation without database"""
    
    try:
        # Generate questions using AI service
        questions = await deepseek_service.generate_quiz_from_text(
            request.content, 
            request.topic
        )
        
        if not questions:
            raise HTTPException(status_code=400, detail="Failed to generate questions")
        
        return {
            "success": True,
            "topic": request.topic or "Generated Quiz",
            "questions": [
                {
                    "id": q.id,
                    "question": q.question,
                    "options": q.options
                }
                for q in questions
            ],
            "total_questions": len(questions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

@router.post("/test-generate-pdf")
async def test_generate_quiz_from_pdf(
    file: UploadFile = File(...),
    topic: Optional[str] = Form(None),
    difficulty: str = Form("medium")
):
    """Test quiz generation from PDF without database"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Extract text from PDF
        content = await extract_text_from_pdf(file)
        
        if len(content.strip()) < 50:
            raise HTTPException(status_code=400, detail="PDF content too short for quiz generation")
        
        # Generate questions using AI service
        questions = await deepseek_service.generate_quiz_from_text(content, topic)
        
        if not questions:
            raise HTTPException(status_code=400, detail="Failed to generate questions")
        
        return {
            "success": True,
            "topic": topic or "PDF Quiz",
            "difficulty": difficulty,
            "content_length": len(content),
            "content_preview": content[:200] + "..." if len(content) > 200 else content,
            "questions": [
                {
                    "id": q.id,
                    "question": q.question,
                    "options": q.options
                }
                for q in questions
            ],
            "total_questions": len(questions),
            "metadata": {
                "generation_method": "ai" if deepseek_service.api_key else "intelligent_fallback",
                "estimated_completion_time": len(questions) * 1.5
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF quiz generation failed: {str(e)}")

@router.get("/test-ai-status")
async def test_ai_status():
    """Test AI service status"""
    
    from app.config import settings
    
    return {
        "deepseek_configured": bool(settings.DEEPSEEK_API_KEY),
        "deepseek_api_key_length": len(settings.DEEPSEEK_API_KEY) if settings.DEEPSEEK_API_KEY else 0,
        "deepseek_base_url": settings.DEEPSEEK_BASE_URL,
        "service_status": "ready"
    }

@router.post("/debug-quiz-generation")
async def debug_quiz_generation(request: TestQuizRequest):
    """Debug quiz generation process step by step"""
    
    debug_info = {
        "step": "starting",
        "content_length": len(request.content),
        "content_preview": request.content[:200] + "..." if len(request.content) > 200 else request.content,
        "topic": request.topic,
        "ai_configured": bool(deepseek_service.api_key)
    }
    
    try:
        # Step 1: Check AI configuration
        debug_info["step"] = "checking_ai_config"
        if not deepseek_service.api_key:
            debug_info["ai_status"] = "not_configured"
            debug_info["using_fallback"] = True
        else:
            debug_info["ai_status"] = "configured"
            debug_info["using_fallback"] = False
        
        # Step 2: Generate prompt
        debug_info["step"] = "generating_prompt"
        prompt = deepseek_service._create_quiz_prompt(request.content, request.topic)
        debug_info["prompt_length"] = len(prompt)
        debug_info["prompt_preview"] = prompt[:300] + "..." if len(prompt) > 300 else prompt
        
        # Step 3: Try AI generation
        if deepseek_service.api_key:
            debug_info["step"] = "calling_ai_api"
            try:
                ai_response = await deepseek_service._call_deepseek_api(prompt)
                debug_info["ai_response_length"] = len(ai_response)
                debug_info["ai_response_preview"] = ai_response[:500] + "..." if len(ai_response) > 500 else ai_response
                
                # Step 4: Parse AI response
                debug_info["step"] = "parsing_ai_response"
                questions = deepseek_service._parse_quiz_response(ai_response)
                debug_info["ai_questions_count"] = len(questions)
                debug_info["ai_questions"] = [{"id": q.id, "question": q.question[:100] + "..."} for q in questions]
                
            except Exception as e:
                debug_info["ai_error"] = str(e)
                debug_info["using_fallback"] = True
        
        # Step 5: Generate fallback if needed
        if debug_info.get("using_fallback", False) or not deepseek_service.api_key:
            debug_info["step"] = "generating_fallback"
            fallback_questions = deepseek_service._generate_fallback_questions(request.content, request.topic)
            debug_info["fallback_questions_count"] = len(fallback_questions)
            debug_info["fallback_questions"] = [{"id": q.id, "question": q.question[:100] + "..."} for q in fallback_questions]
        
        debug_info["step"] = "completed"
        return debug_info
        
    except Exception as e:
        debug_info["error"] = str(e)
        debug_info["step"] = "failed"
        return debug_info