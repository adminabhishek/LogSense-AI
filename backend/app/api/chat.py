from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.log import LogEntry
from app.models.alert import Alert
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.service import chat_with_ai

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    recent_logs = db.query(LogEntry).order_by(LogEntry.timestamp.desc()).limit(50).all()
    active_alerts = db.query(Alert).filter(Alert.is_active == True).all()

    context = {
        "recent_logs": [
            {"level": log.level, "message": log.message, "timestamp": log.timestamp.isoformat()}
            for log in recent_logs[:20]
        ],
        "active_alerts": [
            {"severity": alert.severity, "title": alert.title, "message": alert.message}
            for alert in active_alerts[:10]
        ],
        "system_info": "Available via /api/system endpoint"
    }

    if request.context:
        context.update(request.context)

    response = await chat_with_ai(request.message, context)
    return response