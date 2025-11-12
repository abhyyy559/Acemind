from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from app.models.note import Note, CreateNoteDto, UpdateNoteDto, NoteResponse
from app.models.user import User
from app.dependencies import get_current_user, get_current_user_optional
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=NoteResponse)
async def create(create_note_dto: CreateNoteDto, current_user: User = Depends(get_current_user)):
    """Create note - compatible with NestJS"""
    
    note = Note(
        title=create_note_dto.title,
        content=create_note_dto.content,
        tags=create_note_dto.tags or [],
        user=current_user,
        metadata=create_note_dto.metadata or {}
    )
    
    await note.save()
    
    return NoteResponse(
        id=str(note.id),
        title=note.title,
        content=note.content,
        tags=note.tags,
        metadata=note.metadata,
        created_at=note.created_at,
        updated_at=note.updated_at
    )

@router.get("/", response_model=List[NoteResponse])
async def find_all(current_user: User = Depends(get_current_user)):
    """Get all user notes - compatible with NestJS"""
    
    notes = await Note.find(Note.user.id == current_user.id).to_list()
    
    return [
        NoteResponse(
            id=str(note.id),
            title=note.title,
            content=note.content,
            tags=note.tags,
            metadata=note.metadata,
            created_at=note.created_at,
            updated_at=note.updated_at
        )
        for note in notes
    ]

@router.get("/{note_id}", response_model=NoteResponse)
async def find_one(note_id: str, current_user: User = Depends(get_current_user)):
    """Get specific note - compatible with NestJS"""
    
    note = await Note.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return NoteResponse(
        id=str(note.id),
        title=note.title,
        content=note.content,
        tags=note.tags,
        metadata=note.metadata,
        created_at=note.created_at,
        updated_at=note.updated_at
    )

@router.patch("/{note_id}", response_model=NoteResponse)
async def update(note_id: str, update_note_dto: UpdateNoteDto, current_user: User = Depends(get_current_user)):
    """Update note - compatible with NestJS"""
    
    note = await Note.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    if update_note_dto.title is not None:
        note.title = update_note_dto.title
    if update_note_dto.content is not None:
        note.content = update_note_dto.content
    if update_note_dto.tags is not None:
        note.tags = update_note_dto.tags
    if update_note_dto.metadata is not None:
        note.metadata = update_note_dto.metadata
    
    note.updated_at = datetime.utcnow()
    await note.save()
    
    return NoteResponse(
        id=str(note.id),
        title=note.title,
        content=note.content,
        tags=note.tags,
        metadata=note.metadata,
        created_at=note.created_at,
        updated_at=note.updated_at
    )

@router.delete("/{note_id}")
async def remove(note_id: str, current_user: User = Depends(get_current_user)):
    """Delete note - compatible with NestJS"""
    
    note = await Note.get(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.user.id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await note.delete()
    return {"message": "Note deleted successfully"}

@router.post("/upload", response_model=NoteResponse)
async def upload_note(create_note_dto: CreateNoteDto, current_user: User = Depends(get_current_user)):
    """Upload note - compatible with NestJS"""
    return await create(create_note_dto, current_user)

@router.post("/search", response_model=List[NoteResponse])
async def search_notes(query_data: dict, current_user: User = Depends(get_current_user)):
    """Search notes - compatible with NestJS"""
    
    query = query_data.get("query", "")
    if not query:
        return []
    
    # Simple text search in title and content
    notes = await Note.find({
        "user": current_user.id,
        "$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"content": {"$regex": query, "$options": "i"}},
            {"tags": {"$in": [query]}}
        ]
    }).to_list()
    
    return [
        NoteResponse(
            id=str(note.id),
            title=note.title,
            content=note.content,
            tags=note.tags,
            metadata=note.metadata,
            created_at=note.created_at,
            updated_at=note.updated_at
        )
        for note in notes
    ]