"""
Source Model - Represents a content source
"""
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime
from enum import Enum

class SourceType(str, Enum):
    TEXT = "text"
    PDF = "pdf"
    URL = "url"
    DOCUMENT = "document"

class Source(BaseModel):
    id: str
    type: SourceType
    title: str
    content: str
    metadata: Dict
    created_at: datetime
    word_count: int
    status: str  # processing, ready, error
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
