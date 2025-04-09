from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from geopy.distance import distance
from ..database.database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter()

@router.get("/bike-parkings/property/{property_id}", response_model=List[schemas.BikeParking])
def get_bike_parkings_by_property(property_id: int, db: Session = Depends(get_db)):
    """
    指定された物件IDの近隣バイク駐輪場情報を取得するエンドポイント。
    """
    bike_parkings = db.query(models.BikeParking).filter(
        models.BikeParking.property_id == property_id
    ).all()
    
    return bike_parkings

@router.post("/bike-parkings/", response_model=schemas.BikeParking)
def create_bike_parking(bike_parking: schemas.BikeParkingCreate, db: Session = Depends(get_db)):
    """
    新しいバイク駐輪場情報を作成するエンドポイント。
    物件と駐輪場の緯度経度が両方存在する場合は距離を自動計算します。
    """
    # 物件が存在するか確認
    property = db.query(models.Property).filter(
        models.Property.id == bike_parking.property_id
    ).first()
    
    if property is None:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # 距離の計算（緯度経度が両方存在する場合）
    if (property.latitude and property.longitude and 
        bike_parking.latitude and bike_parking.longitude):
        property_coords = (float(property.latitude), float(property.longitude))
        parking_coords = (float(bike_parking.latitude), float(bike_parking.longitude))
        
        # geopyを使用して距離をkm単位で計算
        dist_km = distance(property_coords, parking_coords).km
        bike_parking_dict = bike_parking.dict()
        bike_parking_dict["distance"] = dist_km
        
        db_bike_parking = models.BikeParking(**bike_parking_dict)
    else:
        db_bike_parking = models.BikeParking(**bike_parking.dict())
    
    db.add(db_bike_parking)
    db.commit()
    db.refresh(db_bike_parking)
    return db_bike_parking

@router.put("/bike-parkings/{parking_id}", response_model=schemas.BikeParking)
def update_bike_parking(
    parking_id: int, 
    bike_parking: schemas.BikeParkingUpdate, 
    db: Session = Depends(get_db)
):
    """
    指定されたIDのバイク駐輪場情報を更新するエンドポイント。
    物件と駐輪場の緯度経度が両方存在する場合は距離を自動再計算します。
    """
    db_bike_parking = db.query(models.BikeParking).filter(
        models.BikeParking.id == parking_id
    ).first()
    
    if db_bike_parking is None:
        raise HTTPException(status_code=404, detail="Bike parking not found")
    
    # 更新用のデータを準備
    update_data = bike_parking.dict()
    
    # 物件情報を取得
    property = db.query(models.Property).filter(
        models.Property.id == bike_parking.property_id
    ).first()
    
    if property is None:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # 距離の再計算（緯度経度が両方存在する場合）
    if (property.latitude and property.longitude and 
        bike_parking.latitude and bike_parking.longitude):
        property_coords = (float(property.latitude), float(property.longitude))
        parking_coords = (float(bike_parking.latitude), float(bike_parking.longitude))
        
        # geopyを使用して距離をkm単位で計算
        update_data["distance"] = distance(property_coords, parking_coords).km
    
    # 更新対象のプロパティを更新
    for key, value in update_data.items():
        setattr(db_bike_parking, key, value)
    
    db.commit()
    db.refresh(db_bike_parking)
    return db_bike_parking

@router.delete("/bike-parkings/{parking_id}")
def delete_bike_parking(parking_id: int, db: Session = Depends(get_db)):
    """
    指定されたIDのバイク駐輪場情報を削除するエンドポイント。
    """
    db_bike_parking = db.query(models.BikeParking).filter(
        models.BikeParking.id == parking_id
    ).first()
    
    if db_bike_parking is None:
        raise HTTPException(status_code=404, detail="Bike parking not found")
    
    db.delete(db_bike_parking)
    db.commit()
    return {"message": "Bike parking deleted successfully"}
