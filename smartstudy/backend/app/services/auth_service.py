from typing import Optional
from datetime import timedelta
from app.models.user import User, UserCreate, UserLogin, UserResponse, Token
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.config import settings
from fastapi import HTTPException, status

class AuthService:
    
    async def register(self, user_data: UserCreate) -> UserResponse:
        """Register new user"""
        
        # Check if user already exists
        existing_user = await User.find_one(User.email == user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        
        user = User(
            name=user_data.name,
            email=user_data.email,
            password=hashed_password
        )
        
        await user.save()
        
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user credentials"""
        user = await User.find_one(User.email == email)
        if not user or not verify_password(password, user.password):
            return None
        return user
    
    async def login(self, login_data: UserLogin) -> Token:
        """Login user and return access token"""
        
        user = await self.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
        )

# Global instance
auth_service = AuthService()