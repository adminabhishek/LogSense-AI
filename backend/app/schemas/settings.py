from pydantic import BaseModel
from typing import Optional


class SettingsBase(BaseModel):
    theme: str = "dark"
    refresh_interval: int = 5
    cpu_threshold: float = 80.0
    ram_threshold: float = 80.0
    disk_threshold: float = 90.0
    ai_provider: str = "openai"
    api_key: Optional[str] = None
    model: str = "gpt-3.5-turbo"
    collector_enabled: bool = False
    collector_directory: str = ""
    collector_interval: int = 5


class SettingsResponse(SettingsBase):
    pass


class SettingsUpdate(SettingsBase):
    pass