from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import tempfile
import os
from .. import models, schemas
from ..database import SessionLocal, engine
from ..migration.excel_importer import ExcelImporter

# Initialize database
models.Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api", tags=["Enhanced Quilts API"])

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper functions
def get_current_season() -> str:
    """Determine current season based on month"""
    month = datetime.now().month
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5, 9, 10, 11]:
        return "spring_autumn"
    else:  # 6, 7, 8
        return "summer"

# Enhanced Quilts Endpoints
@router.get("/quilts/", response_model=List[schemas.QuiltWithUsage])
async def list_quilts(
    skip: int = 0,
    limit: int = 100,
    season: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "item_number",
    sort_order: str = "asc",
    db: Session = Depends(get_db)
):
    """Enhanced list with filtering, searching, and sorting"""
    query = db.query(models.Quilt)
    
    # Apply filters
    if season:
        query = query.filter(models.Quilt.season == season)
    if status:
        query = query.filter(models.Quilt.current_status == status)
    if location:
        query = query.filter(models.Quilt.location.contains(location))
    if search:
        search_filter = or_(
            models.Quilt.name.contains(search),
            models.Quilt.brand.contains(search),
            models.Quilt.color.contains(search),
            models.Quilt.notes.contains(search)
        )
        query = query.filter(search_filter)
    
    # Apply sorting
    sort_field = getattr(models.Quilt, sort_by, models.Quilt.item_number)
    if sort_order.lower() == 'desc':
        query = query.order_by(desc(sort_field))
    else:
        query = query.order_by(asc(sort_field))
    
    return query.offset(skip).limit(limit).all()

@router.get("/quilts/{quilt_id}", response_model=schemas.QuiltDetailed)
async def get_quilt_by_id(quilt_id: int, db: Session = Depends(get_db)):
    """Get detailed quilt information with full usage history"""
    quilt = db.query(models.Quilt).filter(models.Quilt.id == quilt_id).first()
    if not quilt:
        raise HTTPException(status_code=404, detail=f"Quilt with ID {quilt_id} not found")
    
    # Calculate additional fields
    usage_periods = quilt.usage_periods
    total_days = sum([
        (period.end_date - period.start_date).days if period.end_date else 0 
        for period in usage_periods if period.end_date
    ])
    
    quilt_detailed = schemas.QuiltDetailed.from_orm(quilt)
    quilt_detailed.total_usage_days = total_days
    quilt_detailed.usage_frequency = len(usage_periods) / max(1, (datetime.now().date() - quilt.created_at.date()).days) * 365
    quilt_detailed.last_used_date = max([p.start_date for p in usage_periods], default=None)
    
    return quilt_detailed

@router.post("/quilts/", response_model=schemas.Quilt)
async def create_quilt(quilt: schemas.QuiltCreate, db: Session = Depends(get_db)):
    """Create new quilt with enhanced fields"""
    # Check for duplicate item_number
    existing = db.query(models.Quilt).filter(models.Quilt.item_number == quilt.item_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Quilt with item number {quilt.item_number} already exists")
    
    db_quilt = models.Quilt(**quilt.dict())
    db.add(db_quilt)
    db.commit()
    db.refresh(db_quilt)
    return db_quilt

@router.put("/quilts/{quilt_id}", response_model=schemas.Quilt)
async def update_quilt(
    quilt_id: int,
    quilt_update: schemas.QuiltUpdate,
    db: Session = Depends(get_db)
):
    """Update quilt information"""
    db_quilt = db.query(models.Quilt).filter(models.Quilt.id == quilt_id).first()
    if not db_quilt:
        raise HTTPException(status_code=404, detail=f"Quilt with ID {quilt_id} not found")
    
    update_data = quilt_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_quilt, field, value)
    
    db_quilt.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_quilt)
    return db_quilt

@router.delete("/quilts/{quilt_id}")
async def delete_quilt(quilt_id: int, db: Session = Depends(get_db)):
    """Delete quilt"""
    db_quilt = db.query(models.Quilt).filter(models.Quilt.id == quilt_id).first()
    if not db_quilt:
        raise HTTPException(status_code=404, detail=f"Quilt with ID {quilt_id} not found")
    
    db.delete(db_quilt)
    db.commit()
    return {"message": f"Quilt {quilt_id} deleted successfully"}

# Seasonal Intelligence Endpoints
@router.get("/quilts/seasonal/{season}", response_model=List[schemas.QuiltSummary])
async def get_seasonal_quilts(
    season: schemas.Season,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get quilts suitable for specific season"""
    query = db.query(models.Quilt).filter(models.Quilt.season == season)
    
    if available_only:
        query = query.filter(models.Quilt.current_status == "available")
    
    return query.all()

@router.get("/quilts/recommendations/{season}")
async def get_seasonal_recommendations(
    season: schemas.Season,
    current_temperature: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Smart seasonal recommendations based on usage history and specs"""
    # Get quilts suitable for the season
    seasonal_quilts = db.query(models.Quilt).filter(
        and_(
            models.Quilt.season == season,
            models.Quilt.current_status == "available"
        )
    ).all()
    
    recommendations = []
    for quilt in seasonal_quilts:
        # Calculate recommendation score based on usage history
        usage_count = len(quilt.usage_periods)
        last_used = max([p.start_date for p in quilt.usage_periods], default=None)
        days_since_used = (datetime.now().date() - last_used).days if last_used else 365
        
        score = usage_count * 0.4 + (365 - days_since_used) / 365 * 0.6
        
        recommendations.append({
            "quilt": quilt,
            "recommendation_score": score,
            "reason": f"Used {usage_count} times, last used {days_since_used} days ago"
        })
    
    # Sort by score
    recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
    
    return {
        "season": season,
        "recommendations": recommendations[:5],
        "total_available": len(seasonal_quilts)
    }

@router.get("/quilts/current-season")
async def get_current_season_quilts(
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get quilts recommended for current season"""
    current_season = get_current_season()
    return await get_seasonal_recommendations(current_season, db=db)

# Enhanced Usage Management
@router.post("/usage/start", response_model=schemas.CurrentUsage)
async def start_usage(
    usage_start: schemas.CurrentUsageCreate,
    db: Session = Depends(get_db)
):
    """Start using a quilt"""
    # Check if quilt exists and is available
    db_quilt = db.query(models.Quilt).filter(models.Quilt.id == usage_start.quilt_id).first()
    if not db_quilt:
        raise HTTPException(status_code=404, detail=f"Quilt with ID {usage_start.quilt_id} not found")
    
    if db_quilt.current_status != "available":
        raise HTTPException(status_code=400, detail=f"Quilt {usage_start.quilt_id} is not available for use")
    
    # Create current usage record
    db_usage = models.CurrentUsage(**usage_start.dict())
    db.add(db_usage)
    
    # Update quilt status
    db_quilt.current_status = models.StatusEnum.in_use
    db_quilt.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_usage)
    return db_usage

@router.post("/usage/end/{usage_id}")
async def end_usage(
    usage_id: int,
    end_date: Optional[date] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """End current usage and create historical record"""
    # Get current usage
    db_usage = db.query(models.CurrentUsage).filter(models.CurrentUsage.id == usage_id).first()
    if not db_usage:
        raise HTTPException(status_code=404, detail=f"Usage record {usage_id} not found")
    
    end_date = end_date or datetime.now().date()
    
    # Create usage period record
    usage_period = models.QuiltUsagePeriod(
        quilt_id=db_usage.quilt_id,
        start_date=db_usage.started_at,
        end_date=end_date,
        season_used=get_current_season(),
        notes=notes or f"Usage ended on {end_date}"
    )
    db.add(usage_period)
    
    # Update quilt status to available
    db_quilt = db.query(models.Quilt).filter(models.Quilt.id == db_usage.quilt_id).first()
    db_quilt.current_status = models.StatusEnum.available
    db_quilt.updated_at = datetime.utcnow()
    
    # Remove current usage record
    db.delete(db_usage)
    
    db.commit()
    return {"message": f"Usage ended successfully, historical record created"}

@router.get("/usage/current", response_model=List[schemas.CurrentUsage])
async def get_current_usage(db: Session = Depends(get_db)):
    """Get all currently in-use quilts"""
    return db.query(models.CurrentUsage).all()

@router.get("/usage/history/{quilt_id}", response_model=List[schemas.QuiltUsagePeriod])
async def get_usage_history(
    quilt_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get detailed usage history for a quilt"""
    return db.query(models.QuiltUsagePeriod)\
        .filter(models.QuiltUsagePeriod.quilt_id == quilt_id)\
        .order_by(desc(models.QuiltUsagePeriod.start_date))\
        .limit(limit).all()

# Analytics & Dashboard
@router.get("/analytics/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Complete dashboard statistics"""
    # Basic counts
    total_quilts = db.query(models.Quilt).count()
    in_use_count = db.query(models.Quilt).filter(models.Quilt.current_status == "in_use").count()
    available_count = db.query(models.Quilt).filter(models.Quilt.current_status == "available").count()
    storage_count = db.query(models.Quilt).filter(models.Quilt.current_status == "storage").count()
    maintenance_count = db.query(models.Quilt).filter(models.Quilt.current_status == "maintenance").count()
    
    # Seasonal distribution
    seasonal_dist = db.query(
        models.Quilt.season,
        func.count(models.Quilt.id).label('count')
    ).group_by(models.Quilt.season).all()
    seasonal_distribution = {season: count for season, count in seasonal_dist}
    
    # Storage distribution
    storage_dist = db.query(
        models.Quilt.location,
        func.count(models.Quilt.id).label('count')
    ).group_by(models.Quilt.location).all()
    storage_distribution = {location: count for location, count in storage_dist}
    
    # Brand distribution
    brand_dist = db.query(
        models.Quilt.brand,
        func.count(models.Quilt.id).label('count')
    ).filter(models.Quilt.brand.isnot(None))\
    .group_by(models.Quilt.brand).all()
    brand_distribution = {brand: count for brand, count in brand_dist}
    
    # Top used quilts
    top_used = db.query(
        models.Quilt,
        func.count(models.QuiltUsagePeriod.id).label('usage_count')
    ).join(models.QuiltUsagePeriod)\
    .group_by(models.Quilt.id)\
    .order_by(desc('usage_count'))\
    .limit(5).all()
    
    top_used_quilts = []
    for quilt, usage_count in top_used:
        total_days = db.query(
            func.sum(
                func.julianday(models.QuiltUsagePeriod.end_date) -
                func.julianday(models.QuiltUsagePeriod.start_date)
            )
        ).filter(
            and_(
                models.QuiltUsagePeriod.quilt_id == quilt.id,
                models.QuiltUsagePeriod.end_date.isnot(None)
            )
        ).scalar() or 0
        
        top_used_quilts.append({
            "quilt": schemas.QuiltSummary.from_orm(quilt),
            "stats": {
                "total_usage_days": int(total_days),
                "usage_count": usage_count,
                "average_duration": total_days / max(usage_count, 1)
            }
        })
    
    return schemas.DashboardData(
        total_quilts=total_quilts,
        in_use_count=in_use_count,
        available_count=available_count,
        storage_count=storage_count,
        maintenance_count=maintenance_count,
        seasonal_distribution=seasonal_distribution,
        storage_distribution=storage_distribution,
        brand_distribution=brand_distribution,
        top_used_quilts=top_used_quilts
    )

@router.get("/analytics/usage-patterns")
async def get_usage_patterns(
    period: str = "year",
    db: Session = Depends(get_db)
):
    """Analyze usage patterns over time"""
    # Implementation for usage pattern analysis
    # This would include seasonal trends, frequency analysis, etc.
    return {"message": "Usage patterns analysis - to be implemented"}

# Search functionality
@router.get("/search", response_model=List[schemas.QuiltSummary])
async def search_quilts(
    q: str,
    fields: List[str] = Query(default=["name", "brand", "color", "notes"]),
    db: Session = Depends(get_db)
):
    """Advanced search across multiple fields"""
    search_filters = []
    
    if "name" in fields:
        search_filters.append(models.Quilt.name.contains(q))
    if "brand" in fields:
        search_filters.append(models.Quilt.brand.contains(q))
    if "color" in fields:
        search_filters.append(models.Quilt.color.contains(q))
    if "notes" in fields:
        search_filters.append(models.Quilt.notes.contains(q))
    
    if not search_filters:
        return []
    
    quilts = db.query(models.Quilt).filter(or_(*search_filters)).all()
    return [schemas.QuiltSummary.from_orm(quilt) for quilt in quilts]