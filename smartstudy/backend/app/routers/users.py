from fastapi import APIRouter, HTTPException, Depends
from app.models.user import User, UserResponse
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/{user_id}")
async def find_one(user_id: str):
    """Get user by ID - compatible with NestJS"""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return format compatible with NestJS
    return {
        "_id": str(user.id),
        "name": user.name,
        "email": user.email
    }