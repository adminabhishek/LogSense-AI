from fastapi import APIRouter
from datetime import datetime
import psutil
import platform
from app.schemas.metrics import MetricsResponse, MetricsHistory

router = APIRouter()

metrics_history = {
    "timestamps": [],
    "cpu_percent": [],
    "memory_percent": [],
    "disk_percent": []
}

MAX_HISTORY = 60


@router.get("", response_model=MetricsResponse)
async def get_metrics():
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    uptime_seconds = psutil.boot_time()
    uptime_formatted = str(datetime.now() - datetime.fromtimestamp(uptime_seconds)).split('.')[0]

    now = datetime.now().isoformat()

    metrics_history["timestamps"].append(now)
    metrics_history["cpu_percent"].append(cpu_percent)
    metrics_history["memory_percent"].append(memory.percent)
    metrics_history["disk_percent"].append(disk.percent)

    if len(metrics_history["timestamps"]) > MAX_HISTORY:
        metrics_history["timestamps"] = metrics_history["timestamps"][-MAX_HISTORY:]
        metrics_history["cpu_percent"] = metrics_history["cpu_percent"][-MAX_HISTORY:]
        metrics_history["memory_percent"] = metrics_history["memory_percent"][-MAX_HISTORY:]
        metrics_history["disk_percent"] = metrics_history["disk_percent"][-MAX_HISTORY:]

    return MetricsResponse(
        cpu_percent=cpu_percent,
        memory_percent=memory.percent,
        disk_percent=disk.percent,
        memory_total=round(memory.total / (1024**3), 2),
        memory_used=round(memory.used / (1024**3), 2),
        memory_available=round(memory.available / (1024**3), 2),
        disk_total=round(disk.total / (1024**3), 2),
        disk_used=round(disk.used / (1024**3), 2),
        disk_free=round(disk.free / (1024**3), 2),
        timestamp=now,
        uptime=uptime_formatted,
        hostname=platform.node()
    )


@router.get("/history", response_model=MetricsHistory)
async def get_metrics_history():
    return MetricsHistory(**metrics_history)