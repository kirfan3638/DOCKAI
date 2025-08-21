from fastapi import APIRouter
from sqlalchemy import text
from ..db import engine

router = APIRouter(tags=["health"])

@router.get("/health")
def health():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}
