from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.collector import (
    configure_collector,
    get_collector_status,
    start_collector,
    stop_collector,
)

router = APIRouter()


class CollectorConfig(BaseModel):
    enabled: bool
    watch_directory: str
    poll_interval: Optional[int] = 5


@router.get("/status")
async def get_status():
    return get_collector_status()


@router.post("/configure")
async def configure(config: CollectorConfig):
    if config.watch_directory and not config.watch_directory.strip():
        raise HTTPException(status_code=400, detail="Watch directory cannot be empty")

    result = configure_collector(
        enabled=config.enabled,
        watch_directory=config.watch_directory.strip() if config.watch_directory else None,
        poll_interval=config.poll_interval,
    )

    if result["enabled"]:
        start_collector()
    else:
        stop_collector()

    return {
        "message": "Collector configured successfully",
        "config": result
    }


@router.post("/start")
async def start():
    start_collector()
    return {"message": "Collector started"}


@router.post("/stop")
async def stop():
    stop_collector()
    return {"message": "Collector stopped"}