from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import List, Optional, Dict, Literal
from enum import Enum

# Enum for API responses
class Season(str, Enum):
    winter = "winter"
    spring_autumn = "spring_autumn"
    summer = "summer"

class Status(str, Enum):
    available = "available"
    in_use = "in_use"
    maintenance = "maintenance"
    storage = "storage"

# Enhanced Base Schemas
class QuiltBase(BaseModel):
    group_id: Optional[int] = None
    item_number: int
    name: str
    season: Season
    length_cm: int
    width_cm: int
    weight_grams: int
    fill_material: str
    material_details: Optional[str] = None
    color: str
    brand: Optional[str] = None
    purchase_date: Optional[date] = None
    location: str
    packaging_info: Optional[str] = None
    current_status: Status = Status.available
    notes: Optional[str] = None

class QuiltCreate(QuiltBase):
    @validator('weight_grams')
    def weight_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Weight must be positive')
        return v

    @validator('length_cm', 'width_cm')
    def dimensions_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Dimensions must be positive')
        return v

class QuiltUpdate(BaseModel):
    group_id: Optional[int] = None
    name: Optional[str] = None
    season: Optional[Season] = None
    length_cm: Optional[int] = None
    width_cm: Optional[int] = None
    weight_grams: Optional[int] = None
    fill_material: Optional[str] = None
    material_details: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    purchase_date: Optional[date] = None
    location: Optional[str] = None
    packaging_info: Optional[str] = None
    current_status: Optional[Status] = None
    notes: Optional[str] = None

class Quilt(QuiltBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Usage Period Schemas
class UsagePeriodBase(BaseModel):
    start_date: date
    end_date: Optional[date] = None
    season_used: Optional[str] = None
    notes: Optional[str] = None

class UsagePeriodCreate(UsagePeriodBase):
    quilt_id: int

class QuiltUsagePeriod(UsagePeriodBase):
    id: int
    quilt_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Current Usage Schemas
class CurrentUsageBase(BaseModel):
    started_at: date
    expected_end_date: Optional[date] = None
    usage_type: str = "regular"

class CurrentUsageCreate(CurrentUsageBase):
    quilt_id: int

class CurrentUsage(CurrentUsageBase):
    id: int
    quilt_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Enhanced Quilt with relationships
class QuiltWithUsage(Quilt):
    usage_periods: List[QuiltUsagePeriod] = []
    current_usage: Optional[CurrentUsage] = None

class QuiltDetailed(QuiltWithUsage):
    # Calculated fields
    total_usage_days: int = 0
    usage_frequency: float = 0.0
    last_used_date: Optional[date] = None

# Summary schemas for lists
class QuiltSummary(BaseModel):
    id: int
    item_number: int
    name: str
    season: Season
    weight_grams: int
    color: str
    location: str
    current_status: Status
    last_used_date: Optional[date] = None
    
    class Config:
        from_attributes = True

# Search and Filter schemas
class QuiltFilters(BaseModel):
    season: Optional[Season] = None
    status: Optional[Status] = None
    location: Optional[str] = None
    search: Optional[str] = None
    min_weight: Optional[int] = None
    max_weight: Optional[int] = None
    brand: Optional[str] = None

class SearchQuery(BaseModel):
    text: Optional[str] = None
    filters: QuiltFilters = QuiltFilters()
    sort_by: str = "item_number"
    sort_order: Literal["asc", "desc"] = "asc"
    skip: int = 0
    limit: int = 100

# Analytics schemas
class UsageStats(BaseModel):
    total_usage_days: int
    average_duration: float
    usage_count: int
    last_used: Optional[date] = None

class QuiltUsageSummary(BaseModel):
    quilt: QuiltSummary
    stats: UsageStats

class DashboardData(BaseModel):
    total_quilts: int
    in_use_count: int
    available_count: int
    storage_count: int
    maintenance_count: int
    seasonal_distribution: Dict[str, int]
    storage_distribution: Dict[str, int]
    brand_distribution: Dict[str, int]
    top_used_quilts: List[QuiltUsageSummary]

# Seasonal recommendation schemas
class SeasonalRecommendationBase(BaseModel):
    season: Season
    min_weight: int
    max_weight: int
    recommended_materials: List[str]
    description: str

class SeasonalRecommendationCreate(SeasonalRecommendationBase):
    pass

class SeasonalRecommendation(SeasonalRecommendationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Keep old schemas for backward compatibility during migration
class QuiltUsageBase(BaseModel):
    quilt_id: int
    used_at: Optional[datetime] = None
    notes: Optional[str] = None

class QuiltUsageCreate(QuiltUsageBase):
    pass

class QuiltUsage(QuiltUsageBase):
    id: int

    class Config:
        from_attributes = True

# User and Token Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None