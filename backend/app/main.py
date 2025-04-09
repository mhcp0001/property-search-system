from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import property_routes, internet_provider_routes, bike_parking_routes, notification_routes
from .database.database import engine
from .models import models

# データベーステーブルの作成
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="物件検索システム API", description="物件情報、インターネット回線プラン、バイク駐輪場情報を管理するAPI")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に制限すること
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(property_routes.router, tags=["properties"])
app.include_router(internet_provider_routes.router, tags=["internet_providers"])
app.include_router(bike_parking_routes.router, tags=["bike_parkings"])
app.include_router(notification_routes.router, tags=["notifications"])

@app.get("/")
def read_root():
    return {"message": "物件検索システム API へようこそ"}
