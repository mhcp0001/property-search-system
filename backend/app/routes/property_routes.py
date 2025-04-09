from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.database import get_db
from ..models import models
from ..schemas import schemas
from geopy.distance import distance

router = APIRouter()

@router.get("/properties/", response_model=List[schemas.Property])
def get_properties(
    skip: int = 0, 
    limit: int = 100,
    station: Optional[str] = None,
    min_rent: Optional[int] = None,
    max_rent: Optional[int] = None,
    floor_plan: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    物件一覧を取得するエンドポイント。
    フィルタリングパラメータを指定可能。
    """
    query = db.query(models.Property)
    
    # フィルタリング条件の適用
    if station:
        query = query.filter(models.Property.station == station)
    if min_rent:
        query = query.filter(models.Property.rent >= min_rent)
    if max_rent:
        query = query.filter(models.Property.rent <= max_rent)
    if floor_plan:
        query = query.filter(models.Property.floor_plan == floor_plan)
    
    # ページネーション
    properties = query.offset(skip).limit(limit).all()
    return properties


@router.get("/properties/{property_id}", response_model=schemas.Property)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDの物件詳細を取得するエンドポイント。
    """
    property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if property is None:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.post("/properties/", response_model=schemas.Property)
def create_property(property: schemas.PropertyCreate, db: Session = Depends(get_db)):
    """
    新しい物件を作成するエンドポイント。
    """
    db_property = models.Property(**property.dict())
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property


@router.put("/properties/{property_id}", response_model=schemas.Property)
def update_property(property_id: int, property: schemas.PropertyUpdate, db: Session = Depends(get_db)):
    """
    指定されたIDの物件情報を更新するエンドポイント。
    """
    db_property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # 更新対象のプロパティを更新
    for key, value in property.dict().items():
        setattr(db_property, key, value)
    
    db.commit()
    db.refresh(db_property)
    return db_property


@router.delete("/properties/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDの物件を削除するエンドポイント。
    """
    db_property = db.query(models.Property).filter(models.Property.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(db_property)
    db.commit()
    return {"message": "Property deleted successfully"}
