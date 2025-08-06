from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Text, Enum, Float, JSON
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum

# Enum definitions
class SeasonEnum(enum.Enum):
    winter = "winter"
    spring_autumn = "spring_autumn"
    summer = "summer"

class StatusEnum(enum.Enum):
    available = "available"
    in_use = "in_use"
    maintenance = "maintenance"
    storage = "storage"

class Quilt(Base):
    __tablename__ = "quilts"

    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, nullable=True, index=True)  # Excel Group column
    item_number = Column(Integer, unique=True, index=True)  # Excel 编号
    
    # Basic information
    name = Column(String, index=True)
    season = Column(Enum(SeasonEnum), index=True)  # 季节
    
    # Physical specifications
    length_cm = Column(Integer)  # 长
    width_cm = Column(Integer)   # 宽
    weight_grams = Column(Integer, index=True)  # 重量（g）
    
    # Material composition
    fill_material = Column(String)  # 填充物
    material_details = Column(Text)  # Detailed composition like "50%棉+50%聚酯纤维"
    color = Column(String)  # 颜色
    
    # Brand and purchase info
    brand = Column(String, index=True)  # 品牌
    purchase_date = Column(Date, nullable=True)  # 购买日期
    
    # Storage and packaging
    location = Column(String, index=True)  # 放置位置
    packaging_info = Column(String)  # 包
    
    # Status and metadata
    current_status = Column(Enum(StatusEnum), default=StatusEnum.available, index=True)
    notes = Column(Text)  # 备注
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    usage_periods = relationship("QuiltUsagePeriod", back_populates="quilt", cascade="all, delete-orphan")
    current_usage = relationship("CurrentUsage", back_populates="quilt", uselist=False)

# Enhanced Usage Period Model (replaces simple QuiltUsage)
class QuiltUsagePeriod(Base):
    __tablename__ = "quilt_usage_periods"
    
    id = Column(Integer, primary_key=True, index=True)
    quilt_id = Column(Integer, ForeignKey("quilts.id"), index=True)
    
    # Usage period
    start_date = Column(Date, index=True)
    end_date = Column(Date, nullable=True, index=True)  # NULL if currently in use
    
    # Usage context
    season_used = Column(String)  # Which season it was used for
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    quilt = relationship("Quilt", back_populates="usage_periods")

# Current Usage Tracking
class CurrentUsage(Base):
    __tablename__ = "current_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    quilt_id = Column(Integer, ForeignKey("quilts.id"), unique=True)
    
    # Current usage details
    started_at = Column(Date, index=True)
    expected_end_date = Column(Date, nullable=True)
    usage_type = Column(String, default="regular")  # regular, guest, special occasion, etc.
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    quilt = relationship("Quilt", back_populates="current_usage")

# Seasonal Recommendations
class SeasonalRecommendation(Base):
    __tablename__ = "seasonal_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    season = Column(Enum(SeasonEnum), index=True)
    
    # Recommendation criteria
    min_weight = Column(Integer)  # Minimum weight for season
    max_weight = Column(Integer)  # Maximum weight for season
    recommended_materials = Column(JSON)  # List of suitable materials
    
    # Usage guidelines
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Keep the old QuiltUsage for backward compatibility during migration
class QuiltUsage(Base):
    __tablename__ = "quilt_usage"

    id = Column(Integer, primary_key=True, index=True)
    quilt_id = Column(Integer, ForeignKey("quilts.id"))
    used_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String)

    # 关联到被子 - will be used during migration
    quilt = relationship("Quilt")