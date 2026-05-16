from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from app.database import Base
from datetime import datetime


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String(20), index=True)
    title = Column(String(200))
    message = Column(String(500))
    metric_name = Column(String(50))
    metric_value = Column(Float)
    threshold = Column(Float)
    is_active = Column(Boolean, default=True)
    is_acknowledged = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)