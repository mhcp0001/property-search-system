from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, DECIMAL, Boolean, func
from sqlalchemy.orm import relationship
from ..database.database import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(DECIMAL(9, 6), nullable=True)
    longitude = Column(DECIMAL(9, 6), nullable=True)
    station = Column(String(255), nullable=False)
    walking_minutes = Column(Integer, nullable=False)
    rent = Column(Integer, nullable=False)
    management_fee = Column(Integer, nullable=True)
    deposit = Column(Integer, nullable=True)
    key_money = Column(Integer, nullable=True)
    floor_plan = Column(String(50), nullable=False)
    size_sqm = Column(Float, nullable=False)
    building_structure = Column(String(50), nullable=False)
    built_year = Column(Integer, nullable=False)
    total_floors = Column(Integer, nullable=True)
    floor = Column(Integer, nullable=False)
    corner_room = Column(Boolean, nullable=False)
    status = Column(String(20), nullable=False)
    site_url = Column(String(500), nullable=False)
    main_image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())

    # リレーションシップ
    internet_provider = relationship("InternetProvider", back_populates="property", uselist=False)
    bike_parkings = relationship("BikeParking", back_populates="property")
    notifications = relationship("Notification", back_populates="property")


class InternetProvider(Base):
    __tablename__ = "internet_providers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    flets_plan = Column(String(100), nullable=True)
    au_hikari_plan = Column(String(100), nullable=True)
    nuro_plan = Column(String(100), nullable=True)
    jcom_plan = Column(String(100), nullable=True)
    checked_at = Column(DateTime, nullable=False)

    # リレーションシップ
    property = relationship("Property", back_populates="internet_provider")


class BikeParking(Base):
    __tablename__ = "bike_parkings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    parking_name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(DECIMAL(9, 6), nullable=True)
    longitude = Column(DECIMAL(9, 6), nullable=True)
    distance = Column(Float, nullable=True)
    fee = Column(String(50), nullable=True)
    parking_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # リレーションシップ
    property = relationship("Property", back_populates="bike_parkings")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    notified_at = Column(DateTime, nullable=False)
    line_message_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # リレーションシップ
    property = relationship("Property", back_populates="notifications")
