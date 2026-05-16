from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertBase(BaseModel):
    severity: str
    title: str
    message: str
    metric_name: Optional[str] = None
    metric_value: Optional[float] = None
    threshold: Optional[float] = None


class AlertCreate(AlertBase):
    pass


class AlertResponse(AlertBase):
    id: int
    timestamp: datetime
    is_active: bool
    is_acknowledged: bool
    is_resolved: bool

    class Config:
        from_attributes = True


class AlertAcknowledge(BaseModel):
    alert_id: int