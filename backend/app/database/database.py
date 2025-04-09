from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# データベースURLを環境変数から取得するか、デフォルト値を使用
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./property_search.db")

# SQLiteの場合、check_same_threadをFalseに設定
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 依存性注入のためのセッション取得関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
