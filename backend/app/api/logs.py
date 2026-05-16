from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.log import LogEntry
from app.schemas.logs import LogEntryResponse, LogAnalysisRequest, LogAnalysisResponse
from datetime import datetime
import re
from typing import List, Optional

router = APIRouter()


def parse_log_line(line: str) -> dict:
    patterns = [
        r'\[(?P<timestamp>[\d\-:T\s.]+)\]\s*\[(?P<level>\w+)\]\s*(?P<message>.*)',
        r'(?P<timestamp>[\d\-:T\s.]+)\s*-\s*(?P<level>\w+)\s*-\s*(?P<message>.*)',
        r'(?P<level>ERROR|WARN|WARNING|INFO|DEBUG|FATAL|CRITICAL):\s*(?P<message>.*)',
    ]

    for pattern in patterns:
        match = re.match(pattern, line.strip())
        if match:
            data = match.groupdict()
            if 'timestamp' not in data:
                data['timestamp'] = datetime.now().isoformat()
            if 'level' not in data:
                data['level'] = 'INFO'
            return data

    return {
        'timestamp': datetime.now().isoformat(),
        'level': 'INFO',
        'message': line.strip()
    }


@router.post("/upload")
async def upload_logs(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.log', '.txt')):
        raise HTTPException(status_code=400, detail="Only .log and .txt files are allowed")

    content = await file.read()
    lines = content.decode('utf-8').split('\n')

    logs = []
    for line in lines:
        if line.strip():
            parsed = parse_log_line(line)
            log_entry = LogEntry(
                timestamp=datetime.fromisoformat(parsed['timestamp']) if 'timestamp' in parsed else datetime.now(),
                level=parsed.get('level', 'INFO'),
                source=file.filename,
                message=parsed.get('message', line),
                raw_content=line
            )
            db.add(log_entry)
            logs.append(log_entry)

    db.commit()
    return {"message": f"Uploaded {len(logs)} log entries", "count": len(logs)}


@router.get("")
async def get_logs(
    level: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    query = db.query(LogEntry)

    if level:
        query = query.filter(LogEntry.level == level.upper())
    if source:
        query = query.filter(LogEntry.source == source)
    if search:
        query = query.filter(LogEntry.message.contains(search))

    total = query.count()
    logs = query.order_by(LogEntry.timestamp.desc()).offset(offset).limit(limit).all()

    return {
        "logs": [LogEntryResponse.model_validate(log) for log in logs],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.post("/analyze", response_model=LogAnalysisResponse)
async def analyze_logs(request: LogAnalysisRequest, db: Session = Depends(get_db)):
    from app.ai.service import analyze_logs_with_ai

    all_logs = request.logs if request.logs else []

    if not all_logs:
        recent_logs = db.query(LogEntry).order_by(LogEntry.timestamp.desc()).limit(100).all()
        all_logs = [log.message for log in recent_logs]

    if not all_logs:
        return LogAnalysisResponse(
            summary="No logs available for analysis.",
            issues=[],
            severity_breakdown={"INFO": 0, "WARNING": 0, "ERROR": 0},
            root_causes=[],
            recommendations=[]
        )

    result = await analyze_logs_with_ai(all_logs)
    return result