from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database.database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter()

@router.get("/notifications/property/{property_id}", response_model=List[schemas.Notification])
def get_notifications_by_property(property_id: int, db: Session = Depends(get_db)):
    """
    指定された物件IDの通知履歴を取得するエンドポイント。
    """
    notifications = db.query(models.Notification).filter(
        models.Notification.property_id == property_id
    ).all()
    
    return notifications

@router.post("/notifications/", response_model=schemas.Notification)
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    """
    新しい通知履歴を作成するエンドポイント。
    """
    # 物件が存在するか確認
    property_exists = db.query(models.Property).filter(
        models.Property.id == notification.property_id
    ).first()
    
    if property_exists is None:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # 通知履歴を作成
    db_notification = models.Notification(**notification.dict())
    db.add(db_notification)
    
    # 物件のステータスを更新
    property_exists.status = "NOTIFIED"
    
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDの通知履歴を削除するエンドポイント。
    """
    db_notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()
    
    if db_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(db_notification)
    db.commit()
    return {"message": "Notification deleted successfully"}
