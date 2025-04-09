from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PropertyBase(BaseModel):
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    station: str
    walking_minutes: int
    rent: int
    management_fee: Optional[int] = None
    deposit: Optional[int] = None
    key_money: Optional[int] = None
    floor_plan: str
    size_sqm: float
    building_structure: str
    built_year: int
    total_floors: Optional[int] = None
    floor: int
    corner_room: bool
    status: str
    site_url: str
    main_image_url: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(PropertyBase):
    pass


class InternetProviderBase(BaseModel):
    property_id: int
    flets_plan: Optional[str] = None
    au_hikari_plan: Optional[str] = None
    nuro_plan: Optional[str] = None
    jcom_plan: Optional[str] = None
    checked_at: datetime


class InternetProviderCreate(InternetProviderBase):
    pass


class InternetProviderUpdate(InternetProviderBase):
    pass


class BikeParkingBase(BaseModel):
    property_id: int
    parking_name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance: Optional[float] = None
    fee: Optional[str] = None
    parking_url: str


class BikeParkingCreate(BikeParkingBase):
    pass


class BikeParkingUpdate(BikeParkingBase):
    pass


class NotificationBase(BaseModel):
    property_id: int
    notified_at: datetime
    line_message_id: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(NotificationBase):
    pass


class BikeParking(BikeParkingBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class InternetProvider(InternetProviderBase):
    id: int

    class Config:
        orm_mode = True


class Notification(NotificationBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class Property(PropertyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    internet_provider: Optional[InternetProvider] = None
    bike_parkings: List[BikeParking] = []
    notifications: List[Notification] = []

    class Config:
        orm_mode = True
