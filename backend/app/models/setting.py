from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, index=True)
    value = Column(String(500))
    value_type = Column(String(20))