from beanie import Document, Link
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.user import User

class StudySession(Document):
    # Core fields (compatible with NestJS)
    user_id: Link[User]  # Maps to NestJS userId
    start_time: datetime  # Maps to NestJS startTime
    end_time: Optional[datetime] = None  # Maps to NestJS endTime
    duration_minutes: int  # Maps to NestJS durationMinutes
    session_type: str = "focus"  # Maps to NestJS sessionType
    notes: Optional[str] = None
    
    # Timestamps (compatible with NestJS)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "studysessions"
        # Remove indexes to avoid conflicts

# API Models (compatible with NestJS DTOs)
class CreateStudySessionDto(BaseModel):
    user_id: str  # Maps to NestJS userId
    start_time: datetime  # Maps to NestJS startTime
    end_time: Optional[datetime] = None
    duration_minutes: int
    session_type: str = "focus"
    notes: Optional[str] = None

class StudySessionResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: int
    session_type: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True

class StudySessionStats(BaseModel):
    total_sessions: int
    total_minutes: int
    average_session_length: float
    sessions_this_week: int
    minutes_this_week: int