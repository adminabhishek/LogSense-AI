from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.setting import Setting
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.ai.service import set_ai_config
from typing import Optional

router = APIRouter()

DEFAULT_SETTINGS = {
    "theme": "dark",
    "refresh_interval": "5",
    "cpu_threshold": "80.0",
    "ram_threshold": "80.0",
    "disk_threshold": "90.0",
    "ai_provider": "openai",
    "api_key": "",
    "model": "gpt-3.5-turbo",
    "collector_enabled": "false",
    "collector_directory": "",
    "collector_interval": "5"
}

AI_PROVIDERS = {
    "openai": {
        "name": "OpenAI",
        "default_model": "gpt-3.5-turbo"
    },
    "opencode": {
        "name": "OpenCode (Free)",
        "default_model": "minimax-m2.5-free"
    },
    "minimax": {
        "name": "MiniMax",
        "default_model": "abab6.5s-chat"
    },
    "ollama": {
        "name": "Ollama (Local)",
        "default_model": "llama2"
    }
}


@router.get("", response_model=SettingsResponse)
async def get_settings(db: Session = Depends(get_db)):
    settings = {}
    db_settings = db.query(Setting).all()

    for setting in db_settings:
        settings[setting.key] = setting.value

    for key, default in DEFAULT_SETTINGS.items():
        if key not in settings:
            settings[key] = default

    return SettingsResponse(
        theme=settings.get("theme", "dark"),
        refresh_interval=int(settings.get("refresh_interval", 5)),
        cpu_threshold=float(settings.get("cpu_threshold", 80.0)),
        ram_threshold=float(settings.get("ram_threshold", 80.0)),
        disk_threshold=float(settings.get("disk_threshold", 90.0)),
        ai_provider=settings.get("ai_provider", "openai"),
        api_key=settings.get("api_key", ""),
        model=settings.get("model", "gpt-3.5-turbo"),
        collector_enabled=settings.get("collector_enabled", "false").lower() == "true",
        collector_directory=settings.get("collector_directory", ""),
        collector_interval=int(settings.get("collector_interval", 5))
    )


@router.put("", response_model=SettingsResponse)
async def update_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db)
):
    settings_dict = settings_update.model_dump()

    for key, value in settings_dict.items():
        setting = db.query(Setting).filter(Setting.key == key).first()
        if setting:
            setting.value = str(value)
        else:
            setting = Setting(key=key, value=str(value), value_type=type(value).__name__)
            db.add(setting)

    db.commit()

    set_ai_config(
        settings_dict.get("ai_provider", "openai"),
        settings_dict.get("api_key", ""),
        settings_dict.get("model", "gpt-3.5-turbo")
    )

    from app.collector import configure_collector, start_collector, stop_collector
    if settings_dict.get("collector_enabled") and settings_dict.get("collector_directory"):
        configure_collector(
            enabled=True,
            watch_directory=settings_dict.get("collector_directory", ""),
            poll_interval=settings_dict.get("collector_interval", 5)
        )
        start_collector()
    else:
        stop_collector()

    return settings_update