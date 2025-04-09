import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import Base, get_db
from app.models.models import Property, InternetProvider, BikeParking

# テスト用のインメモリSQLiteデータベースを設定
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# テスト用のデータベース依存性を上書き
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# テストクライアントを作成
client = TestClient(app)

@pytest.fixture
def test_db():
    # テスト用のデータベーススキーマを作成
    Base.metadata.create_all(bind=engine)
    yield
    # テスト後にテーブルをクリア
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def sample_property(test_db):
    # テスト用の物件データを作成
    db = TestingSessionLocal()
    property = Property(
        name="テスト物件",
        address="東京都新宿区1-1-1",
        station="新宿",
        walking_minutes=5,
        rent=100000,
        management_fee=5000,
        floor_plan="1LDK",
        size_sqm=40.5,
        building_structure="RC",
        built_year=2015,
        floor=3,
        corner_room=True,
        status="NEW",
        site_url="https://example.com/property/1"
    )
    db.add(property)
    db.commit()
    db.refresh(property)
    
    # インターネット回線情報を追加
    internet_provider = InternetProvider(
        property_id=property.id,
        flets_plan="フレッツ 光ネクスト マンションタイプ",
        au_hikari_plan="auひかり マンションタイプ",
        nuro_plan="NURO光 for マンション",
        jcom_plan="J:COM NET 320M コース",
        checked_at="2025-04-01T00:00:00"
    )
    db.add(internet_provider)
    
    # バイク駐輪場情報を追加
    bike_parking = BikeParking(
        property_id=property.id,
        parking_name="テスト駐輪場",
        address="東京都新宿区1-2-3",
        distance=0.5,
        fee="月額2000円",
        parking_url="https://example.com/parking/1"
    )
    db.add(bike_parking)
    
    db.commit()
    db.close()
    
    return property.id

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_get_properties(sample_property):
    response = client.get("/properties/")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["name"] == "テスト物件"

def test_get_property(sample_property):
    response = client.get(f"/properties/{sample_property}")
    assert response.status_code == 200
    assert response.json()["name"] == "テスト物件"
    assert response.json()["address"] == "東京都新宿区1-1-1"

def test_get_property_not_found():
    response = client.get("/properties/9999")
    assert response.status_code == 404

def test_get_internet_provider(sample_property):
    response = client.get(f"/internet-providers/{sample_property}")
    assert response.status_code == 200
    assert response.json()["flets_plan"] == "フレッツ 光ネクスト マンションタイプ"
    assert response.json()["au_hikari_plan"] == "auひかり マンションタイプ"

def test_get_bike_parkings(sample_property):
    response = client.get(f"/bike-parkings/property/{sample_property}")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["parking_name"] == "テスト駐輪場"
    assert response.json()[0]["distance"] == 0.5
