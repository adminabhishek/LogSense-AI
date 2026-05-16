from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from loguru import logger
import sys
import threading
import time
import os
from app.api import metrics, logs, alerts, system, settings, chat, collector, client_metrics
from app.database import init_db

monitoring_running = False

logger.remove()
logger.add(sys.stdout, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>")

app = FastAPI(
    title="AI Infrastructure Dashboard API",
    description="Real-time infrastructure monitoring with AI-powered analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

# Serve index.html for root path
@app.get("/")
async def serve_frontend():
    index_path = os.path.join(static_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "API running. Frontend not found."}

app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(system.router, prefix="/api/system", tags=["System"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(collector.router, prefix="/api/collector", tags=["Collector"])
app.include_router(client_metrics.router, prefix="/api/client-metrics", tags=["ClientMetrics"])


def monitoring_worker():
    global monitoring_running
    while monitoring_running:
        try:
            from app.database import SessionLocal
            from app.models.setting import Setting

            db = SessionLocal()
            settings = {s.key: s.value for s in db.query(Setting).all()}
            db.close()

            cpu_threshold = float(settings.get("cpu_threshold", 80.0))
            ram_threshold = float(settings.get("ram_threshold", 80.0))
            disk_threshold = float(settings.get("disk_threshold", 90.0))

            from app.monitoring import ThresholdMonitor
            monitor = ThresholdMonitor(cpu_threshold, ram_threshold, disk_threshold)

            alerts = monitor.check_thresholds()
            if alerts:
                for alert in alerts:
                    if alert:
                        logger.info(f"Alert created: {alert.title}")
        except Exception as e:
            logger.error(f"Error in monitoring: {e}")
        time.sleep(30)


@app.on_event("startup")
async def startup_event():
    global monitoring_running
    logger.info("Starting AI Infrastructure Dashboard API")
    init_db()

    monitoring_running = True
    monitor_thread = threading.Thread(target=monitoring_worker, daemon=True)
    monitor_thread.start()
    logger.info("Threshold monitoring started")

    import time
    time.sleep(2)
    from app.monitoring import ThresholdMonitor
    from app.database import SessionLocal
    from app.models.setting import Setting
    db = SessionLocal()
    s = {st.key: st.value for st in db.query(Setting).all()}
    db.close()
    m = ThresholdMonitor(float(s.get("cpu_threshold", 80)), float(s.get("ram_threshold", 80)), float(s.get("disk_threshold", 90)))
    m.check_thresholds()

    from app.database import SessionLocal
    from app.models.setting import Setting

    db = SessionLocal()
    try:
        settings = {s.key: s.value for s in db.query(Setting).all()}
        provider = settings.get("ai_provider", "openai")
        api_key = settings.get("api_key", "")
        model = settings.get("model", "gpt-3.5-turbo")

        from app.ai.service import set_ai_config
        set_ai_config(provider, api_key, model)
        logger.info(f"AI config loaded: provider={provider}, model={model}")

        collector_enabled = settings.get("collector_enabled", "false").lower() == "true"
        collector_directory = settings.get("collector_directory", "")
        collector_interval = int(settings.get("collector_interval", "5"))

        if collector_enabled and collector_directory:
            from app.collector import configure_collector, start_collector
            configure_collector(
                enabled=True,
                watch_directory=collector_directory,
                poll_interval=collector_interval
            )
            start_collector()
            logger.info(f"Log collector started: watching {collector_directory}")
    except Exception as e:
        logger.warning(f"Could not load config: {e}")
    finally:
        db.close()


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ai-infra-dashboard"}


@app.get("/health")
async def root_health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)