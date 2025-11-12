from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class User(Document):
    # Core fields (compatible with NestJS)
    name: str
    email: Indexed(EmailStr, unique=True)
    password: str  # This will be hashed
    
    # Enhanced fields
    role: UserRole = UserRole.STUDENT
    is_active: bool = True
    
    # Timestamps (compatible with NestJS)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        # Remove indexes to avoid conflicts with existing NestJS indexes
        # The existing unique email index will be preserved

# Pydantic models for API
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse