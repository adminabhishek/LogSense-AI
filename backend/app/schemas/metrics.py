from pydantic import BaseModel
from typing import Optional, List


class MetricsBase(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    memory_total: float
    memory_used: float
    memory_available: float
    disk_total: float
    disk_used: float
    disk_free: float


class MetricsResponse(MetricsBase):
    timestamp: str
    uptime: str
    hostname: str


class MetricsHistory(BaseModel):
    timestamps: List[str]
    cpu_percent: List[float]
    memory_percent: List[float]
    disk_percent: List[float]