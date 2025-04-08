from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Quilt(Base):
    __tablename__ = "quilts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    size = Column(String)
    material = Column(String)
    color = Column(String)
    location = Column(String)
    notes = Column(String)

    # 关联到使用记录
    usage_records = relationship("QuiltUsage", back_populates="quilt")


class QuiltUsage(Base):
    __tablename__ = "quilt_usage"

    id = Column(Integer, primary_key=True, index=True)
    quilt_id = Column(Integer, ForeignKey("quilts.id"))
    used_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String)

    # 关联到被子
    quilt = relationship("Quilt", back_populates="usage_records")