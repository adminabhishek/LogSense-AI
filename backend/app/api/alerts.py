from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.alert import Alert
from app.schemas.alerts import AlertResponse, AlertAcknowledge
from datetime import datetime

router = APIRouter()


@router.get("")
async def get_alerts(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)

    if active_only:
        query = query.filter(Alert.is_active == True)

    alerts = query.order_by(Alert.timestamp.desc()).all()
    return [AlertResponse.model_validate(alert) for alert in alerts]


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"error": "Alert not found"}

    alert.is_acknowledged = True
    alert.is_active = False
    db.commit()
    return {"message": "Alert acknowledged"}


@router.post("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"error": "Alert not found"}

    alert.is_resolved = True
    alert.is_active = False
    db.commit()
    return {"message": "Alert resolved"}


@router.post("")
async def create_alert(
    title: str,
    message: str,
    severity: str,
    metric_name: str = None,
    metric_value: float = None,
    threshold: float = None,
    db: Session = Depends(get_db)
):
    alert = Alert(
        timestamp=datetime.now(),
        severity=severity,
        title=title,
        message=message,
        metric_name=metric_name,
        metric_value=metric_value,
        threshold=threshold,
        is_active=True
    )
    db.add(alert)
    db.commit()
    return {"message": "Alert created", "id": alert.id}