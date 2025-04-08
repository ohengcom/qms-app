from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import SessionLocal, engine

# 初始化数据库
models.Base.metadata.create_all(bind=engine)

router = APIRouter()

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 被子管理
@router.post("/quilts/", response_model=schemas.Quilt)
def create_quilt(quilt: schemas.QuiltCreate, db: Session = Depends(get_db)):
    db_quilt = models.Quilt(**quilt.dict())
    db.add(db_quilt)
    db.commit()
    db.refresh(db_quilt)
    return db_quilt

@router.get("/quilts/", response_model=list[schemas.Quilt])
def read_quilts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.Quilt).offset(skip).limit(limit).all()

# 使用记录管理
@router.post("/quilts/{quilt_id}/usage/", response_model=schemas.QuiltUsage)
def create_usage_record(quilt_id: int, usage: schemas.QuiltUsageCreate, db: Session = Depends(get_db)):
    db_quilt = db.query(models.Quilt).filter(models.Quilt.id == quilt_id).first()
    if not db_quilt:
        raise HTTPException(status_code=404, detail="被子不存在")
    db_usage = models.QuiltUsage(**usage.dict(), quilt_id=quilt_id)
    db.add(db_usage)
    db.commit()
    db.refresh(db_usage)
    return db_usage

@router.get("/quilts/{quilt_id}/usage/", response_model=list[schemas.QuiltUsage])
def read_usage_records(quilt_id: int, db: Session = Depends(get_db)):
    return db.query(models.QuiltUsage).filter(models.QuiltUsage.quilt_id == quilt_id).all()