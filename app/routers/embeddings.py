from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy import text
from ..db import SessionLocal, engine
from ..models import Document
from ..services.openai_client import OpenAIService

router = APIRouter(tags=["embeddings"])

class EmbedRequest(BaseModel):
    content: str = Field(..., description="Raw text content")
    title: Optional[str] = None
    store: bool = True

@router.post("/embed")
def embed(req: EmbedRequest):
    try:
        vector = OpenAIService.embed([req.content])[0]
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    doc_id = None
    if req.store:
        with SessionLocal() as db:
            doc = Document(title=req.title, content=req.content, embedding=vector)
            db.add(doc)
            db.commit()
            db.refresh(doc)
            doc_id = doc.id
    return {"id": doc_id, "dim": len(vector)}

@router.get("/search")
def search(q: str, k: int = 5):
    try:
        v = OpenAIService.embed([q])[0]
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    sql = text("""
        SELECT id, title, content
        FROM documents
        ORDER BY embedding <-> (:vec)
        LIMIT :k
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"vec": v, "k": k}).mappings().all()
    return {"matches": [dict(r) for r in rows]}
