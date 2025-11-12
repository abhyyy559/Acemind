from fastapi import APIRouter, HTTPException, Depends, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import auth_service
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register new user - compatible with NestJS"""
    return await auth_service.register(user_data)

@router.post("/login", response_model=dict)
async def login(login_data: UserLogin, response: Response):
    """Login user and return access token - compatible with NestJS"""
    
    token_data = await auth_service.login(login_data)
    
    # Set JWT as HTTP-only cookie (compatible with NestJS)
    response.set_cookie(
        key="jwt",
        value=token_data.access_token,
        httponly=True,
        secure=False,  # Set to True in production
        samesite="strict",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    # Return user data (compatible with NestJS response format)
    return {"user": token_data.user}

@router.post("/logout")
async def logout(response: Response):
    """Logout user - compatible with NestJS"""
    response.delete_cookie(key="jwt")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )