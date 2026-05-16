from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LogEntryBase(BaseModel):
    timestamp: Optional[datetime] = None
    level: str
    source: str
    message: str
    raw_content: Optional[str] = None


class LogEntryCreate(LogEntryBase):
    pass


class LogEntryResponse(LogEntryBase):
    id: int

    class Config:
        from_attributes = True


class LogAnalysisRequest(BaseModel):
    logs: list[str]


class LogAnalysisResponse(BaseModel):
    summary: str
    issues: list[str]
    severity_breakdown: dict
    root_causes: list[str]
    recommendations: list[str]