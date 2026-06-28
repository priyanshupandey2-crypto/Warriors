from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_note import UserNote
from app.utils.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/notes", tags=["notes"])

class NoteUpdate(BaseModel):
    content: str

@router.get("")
def get_user_note(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["sub"])
    note = db.query(UserNote).filter(UserNote.user_id == user_id).first()
    return {"content": note.content if note else ""}

@router.post("")
def save_user_note(req: NoteUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["sub"])
    note = db.query(UserNote).filter(UserNote.user_id == user_id).first()
    if note:
        note.content = req.content
    else:
        note = UserNote(user_id=user_id, content=req.content)
        db.add(note)
    db.commit()
    return {"content": note.content, "status": "saved"}
