from fastapi import APIRouter
from sqlalchemy import select, desc
from ..db import SessionLocal
from ..models import AuditLog

router = APIRouter(tags=["audit"])

@router.get("/audit")
def list_audit(limit: int = 50):
    with SessionLocal() as db:
        rows = db.execute(select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit)).scalars().all()
        return [{"id": r.id, "actor": r.actor, "action": r.action, "created_at": r.created_at.isoformat()} for r in rows]
