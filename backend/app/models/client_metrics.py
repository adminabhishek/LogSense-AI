from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base
from datetime import datetime

class ClientMetrics(Base):
    __tablename__ = "client_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now)
    browser = Column(String, nullable=True)
    os = Column(String, nullable=True)
    screen_width = Column(Integer, nullable=True)
    screen_height = Column(Integer, nullable=True)
    device_type = Column(String, nullable=True)
    cpu_cores = Column(Integer, nullable=True)
    memory_gb = Column(Float, nullable=True)
    connection_type = Column(String, nullable=True)
    page_url = Column(String, nullable=True)
    session_duration = Column(Integer, nullable=True)  # seconds