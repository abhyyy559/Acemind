from beanie import Document, Link
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from app.models.user import User

class QuizStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]

class Quiz(Document):
    # Core fields (compatible with NestJS)
    topic: str
    created_by: Link[User]  # Maps to NestJS createdBy
    questions: List[QuizQuestion]
    correct_answers: List[str]  # Maps to NestJS correctAnswers
    status: QuizStatus = QuizStatus.ACTIVE
    source_content: Optional[str] = None  # Maps to NestJS sourceContent
    
    # Timestamps (compatible with NestJS)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "quizzes"
        # Remove indexes to avoid conflicts with existing data

class QuizAttempt(Document):
    quiz: Link[Quiz]
    user: Link[User]
    answers: Dict[str, str] = Field(default_factory=dict)
    score: int = 0
    max_score: int = 0
    percentage: float = 0.0
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    is_completed: bool = False
    
    class Settings:
        name = "quiz_attempts"
        # Remove indexes to avoid conflicts

# API Models (compatible with NestJS DTOs)
class GenerateQuizDto(BaseModel):
    input_method: str = Field(..., pattern="^(text|pdf)$")  # Maps to inputMethod
    text_content: Optional[str] = Field(None, min_length=50)  # Maps to textContent
    topic: Optional[str] = None

class SubmitQuizDto(BaseModel):
    answers: Dict[str, str]

class QuizData(BaseModel):
    id: str = Field(alias="_id")
    topic: str
    questions: List[QuizQuestion]
    created_at: datetime
    
    class Config:
        populate_by_name = True

class QuizResponse(BaseModel):
    id: str = Field(alias="_id")
    topic: str
    questions: List[QuizQuestion]
    status: QuizStatus
    created_at: datetime
    
    class Config:
        populate_by_name = True

class QuizResult(BaseModel):
    quiz_id: str
    score: int
    max_score: int
    percentage: float
    answers: Dict[str, str]
    correct_answers: List[str]

class QuizHistory(BaseModel):
    quiz_id: str
    topic: str
    score: int
    max_score: int
    percentage: float
    completed_at: datetime