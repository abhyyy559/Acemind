from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from app.models.study_session import StudySession, CreateStudySessionDto, StudySessionResponse, StudySessionStats
from app.models.user import User
from app.dependencies import get_current_user
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/", response_model=StudySessionResponse)
async def create(create_study_session_dto: CreateStudySessionDto, current_user: User = Depends(get_current_user)):
    """Create study session - compatible with NestJS"""
    
    # Ensure the user can only create sessions for themselves
    if create_study_session_dto.user_id != str(current_user.id):
        raise HTTPException(status_code=401, detail="You can only create sessions for your own account")
    
    study_session = StudySession(
        user_id=current_user,
        start_time=create_study_session_dto.start_time,
        end_time=create_study_session_dto.end_time,
        duration_minutes=create_study_session_dto.duration_minutes,
        session_type=create_study_session_dto.session_type,
        notes=create_study_session_dto.notes
    )
    
    await study_session.save()
    
    return StudySessionResponse(
        id=str(study_session.id),
        user_id=str(study_session.user_id.id),
        start_time=study_session.start_time,
        end_time=study_session.end_time,
        duration_minutes=study_session.duration_minutes,
        session_type=study_session.session_type,
        notes=study_session.notes,
        created_at=study_session.created_at,
        updated_at=study_session.updated_at
    )

@router.get("/", response_model=List[StudySessionResponse])
async def find_all(current_user: User = Depends(get_current_user)):
    """Get all user study sessions - compatible with NestJS"""
    
    sessions = await StudySession.find(StudySession.user_id.id == current_user.id).to_list()
    
    return [
        StudySessionResponse(
            id=str(session.id),
            user_id=str(session.user_id.id),
            start_time=session.start_time,
            end_time=session.end_time,
            duration_minutes=session.duration_minutes,
            session_type=session.session_type,
            notes=session.notes,
            created_at=session.created_at,
            updated_at=session.updated_at
        )
        for session in sessions
    ]

@router.get("/stats", response_model=StudySessionStats)
async def get_stats(current_user: User = Depends(get_current_user)):
    """Get study session statistics - compatible with NestJS"""
    
    # Get all user sessions
    sessions = await StudySession.find(StudySession.user_id.id == current_user.id).to_list()
    
    if not sessions:
        return StudySessionStats(
            total_sessions=0,
            total_minutes=0,
            average_session_length=0,
            sessions_this_week=0,
            minutes_this_week=0
        )
    
    # Calculate stats
    total_sessions = len(sessions)
    total_minutes = sum(session.duration_minutes for session in sessions)
    average_session_length = total_minutes / total_sessions if total_sessions > 0 else 0
    
    # Calculate this week's stats
    week_ago = datetime.utcnow() - timedelta(days=7)
    sessions_this_week = [s for s in sessions if s.start_time >= week_ago]
    sessions_this_week_count = len(sessions_this_week)
    minutes_this_week = sum(session.duration_minutes for session in sessions_this_week)
    
    return StudySessionStats(
        total_sessions=total_sessions,
        total_minutes=total_minutes,
        average_session_length=average_session_length,
        sessions_this_week=sessions_this_week_count,
        minutes_this_week=minutes_this_week
    )