from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import SessionLocal
from ..models import CachedResponse, AuditLog
from ..services.openai_client import OpenAIService
import hashlib, json

router = APIRouter(tags=["chat"])

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]] = Field(..., description="OpenAI chat messages")

def _cache_key(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

@router.post("/chat")
def chat(req: ChatRequest):
    key = _cache_key(req.model_dump())
    with SessionLocal() as db:
        cr = db.execute(select(CachedResponse).where(CachedResponse.cache_key == key)).scalar_one_or_none()
        if cr:
            db.add(AuditLog(actor="system", action="chat.cached_hit", details={"key": key}))
            db.commit()
            return {"cached": True, "content": cr.response.get("content")}

        try:
            content = OpenAIService.chat(req.messages)
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e))

        cr = CachedResponse(cache_key=key, request=req.model_dump(), response={"content": content})
        db.add(cr)
        db.add(AuditLog(actor="system", action="chat.completion", details={"key": key}))
        db.commit()
        return {"cached": False, "content": content}
