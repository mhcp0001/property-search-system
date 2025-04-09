from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database.database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter()

@router.get("/internet-providers/{property_id}", response_model=schemas.InternetProvider)
def get_internet_provider(property_id: int, db: Session = Depends(get_db)):
    """
    指定された物件IDのインターネット回線プラン情報を取得するエンドポイント。
    """
    internet_provider = db.query(models.InternetProvider).filter(
        models.InternetProvider.property_id == property_id
    ).first()
    
    if internet_provider is None:
        raise HTTPException(status_code=404, detail="Internet provider information not found")
    
    return internet_provider

@router.post("/internet-providers/", response_model=schemas.InternetProvider)
def create_internet_provider(
    internet_provider: schemas.InternetProviderCreate, 
    db: Session = Depends(get_db)
):
    """
    新しいインターネット回線プラン情報を作成するエンドポイント。
    """
    # 物件が存在するか確認
    property_exists = db.query(models.Property).filter(
        models.Property.id == internet_provider.property_id
    ).first()
    
    if property_exists is None:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # 既存のレコードがあるか確認
    existing_provider = db.query(models.InternetProvider).filter(
        models.InternetProvider.property_id == internet_provider.property_id
    ).first()
    
    if existing_provider:
        # 既存のレコードを更新
        for key, value in internet_provider.dict().items():
            setattr(existing_provider, key, value)
        db.commit()
        db.refresh(existing_provider)
        return existing_provider
    else:
        # 新しいレコードを作成
        db_internet_provider = models.InternetProvider(**internet_provider.dict())
        db.add(db_internet_provider)
        db.commit()
        db.refresh(db_internet_provider)
        return db_internet_provider

@router.put("/internet-providers/{provider_id}", response_model=schemas.InternetProvider)
def update_internet_provider(
    provider_id: int, 
    internet_provider: schemas.InternetProviderUpdate, 
    db: Session = Depends(get_db)
):
    """
    指定されたIDのインターネット回線プラン情報を更新するエンドポイント。
    """
    db_internet_provider = db.query(models.InternetProvider).filter(
        models.InternetProvider.id == provider_id
    ).first()
    
    if db_internet_provider is None:
        raise HTTPException(status_code=404, detail="Internet provider information not found")
    
    # 更新対象のプロパティを更新
    for key, value in internet_provider.dict().items():
        setattr(db_internet_provider, key, value)
    
    db.commit()
    db.refresh(db_internet_provider)
    return db_internet_provider

@router.delete("/internet-providers/{provider_id}")
def delete_internet_provider(provider_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDのインターネット回線プラン情報を削除するエンドポイント。
    """
    db_internet_provider = db.query(models.InternetProvider).filter(
        models.InternetProvider.id == provider_id
    ).first()
    
    if db_internet_provider is None:
        raise HTTPException(status_code=404, detail="Internet provider information not found")
    
    db.delete(db_internet_provider)
    db.commit()
    return {"message": "Internet provider information deleted successfully"}
