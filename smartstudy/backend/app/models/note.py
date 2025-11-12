from beanie import Document, Link
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.user import User

class Note(Document):
    # Core fields (compatible with NestJS)
    title: str
    content: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    user: Link[User]  # Maps to NestJS user field
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Timestamps (compatible with NestJS)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "notes"
        # Remove indexes to avoid conflicts

# API Models (compatible with NestJS DTOs)
class CreateNoteDto(BaseModel):
    title: str = Field(..., min_length=1)
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class UpdateNoteDto(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class NoteResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    content: Optional[str]
    tags: List[str]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True