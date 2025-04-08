from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class QuiltBase(BaseModel):
    name: str
    size: str
    material: str
    color: str
    location: str
    notes: Optional[str] = None

class QuiltCreate(QuiltBase):
    pass

class Quilt(QuiltBase):
    id: int
    usage_records: List["QuiltUsage"] = []

    class Config:
        orm_mode = True


class QuiltUsageBase(BaseModel):
    quilt_id: int
    used_at: Optional[datetime] = None
    notes: Optional[str] = None

class QuiltUsageCreate(QuiltUsageBase):
    pass

class QuiltUsage(QuiltUsageBase):
    id: int

    class Config:
        orm_mode = True