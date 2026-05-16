from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.client_metrics import ClientMetrics
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class ClientMetricsPayload(BaseModel):
    browser: str = None
    os: str = None
    screen_width: int = None
    screen_height: int = None
    device_type: str = None
    cpu_cores: int = None
    memory_gb: float = None
    connection_type: str = None
    page_url: str = None
    session_duration: int = None


@router.post("")
async def submit_client_metrics(payload: ClientMetricsPayload, db: Session = Depends(get_db)):
    """Store client-side metrics from browser"""
    metrics = ClientMetrics(
        timestamp=datetime.now(),
        browser=payload.browser,
        os=payload.os,
        screen_width=payload.screen_width,
        screen_height=payload.screen_height,
        device_type=payload.device_type,
        cpu_cores=payload.cpu_cores,
        memory_gb=payload.memory_gb,
        connection_type=payload.connection_type,
        page_url=payload.page_url,
        session_duration=payload.session_duration
    )
    db.add(metrics)
    db.commit()
    return {"message": "Metrics recorded"}


@router.get("")
async def get_client_metrics(db: Session = Depends(get_db)):
    """Get recent client metrics"""
    metrics = db.query(ClientMetrics).order_by(ClientMetrics.timestamp.desc()).limit(100).all()
    return [{
        "id": m.id,
        "timestamp": m.timestamp.isoformat() if m.timestamp else None,
        "browser": m.browser,
        "os": m.os,
        "screen_width": m.screen_width,
        "screen_height": m.screen_height,
        "device_type": m.device_type,
        "cpu_cores": m.cpu_cores,
        "memory_gb": m.memory_gb,
        "connection_type": m.connection_type,
        "page_url": m.page_url,
        "session_duration": m.session_duration
    } for m in metrics]