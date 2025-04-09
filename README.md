# 物件検索システム - README

## 概要
このシステムは、物件情報を検索し、インターネット回線プランやバイク駐輪場情報を確認できる物件検索システムです。

## 機能
- 物件の検索（駅名、家賃、間取りなどでフィルタリング）
- 物件詳細情報の表示
- インターネット回線プラン情報の表示
- バイク駐輪場情報の表示

## 技術スタック
### バックエンド
- Python 3.9+
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite（開発環境）

### フロントエンド
- Next.js
- React
- Tailwind CSS

## システム構成
- バックエンド：RESTful API（FastAPI）
- フロントエンド：Next.jsアプリケーション
- データベース：SQLite（開発環境）、MySQL/PostgreSQL（本番環境を想定）

## セットアップ方法

### 前提条件
- Python 3.9以上
- Node.js
- npm または pnpm

### バックエンドのセットアップ
1. 仮想環境を作成し、アクティベートする
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
```

2. 必要なパッケージをインストールする
```bash
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv geopy haversine
```

3. データベースを初期化する
```bash
cd app
uvicorn main:app --reload
```
※ 初回起動時にデータベースが自動的に初期化されます

### フロントエンドのセットアップ
1. 必要なパッケージをインストールする
```bash
cd frontend/property-search-ui
npm install  # または pnpm install
```

2. 開発サーバーを起動する
```bash
npm run dev  # または pnpm dev
```

## 起動方法
1. バックエンドサーバーの起動
```bash
./start_backend.sh
```

2. フロントエンドサーバーの起動
```bash
./start_frontend.sh
```

## アクセス方法
- バックエンドAPI: http://localhost:8000
- APIドキュメント: http://localhost:8000/docs
- フロントエンド: http://localhost:3000

## テスト実行方法
### バックエンドテスト
```bash
cd backend
pytest tests/
```

### フロントエンドテスト
```bash
cd frontend/property-search-ui
npm test  # または pnpm test
```

## デプロイ方法
### バックエンド
- Dockerコンテナ化してKubernetesやECSなどで実行
- PythonアプリケーションとしてHerokuやAWS Elastic Beanstalkにデプロイ

### フロントエンド
- Vercelを使用したNext.jsアプリケーションのデプロイ
- AWS AmplifyやNetlifyを使用した静的サイトとしてのデプロイ

## ディレクトリ構造
```
property-search-system/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── main.py
│   ├── migrations/
│   ├── tests/
│   └── venv/
├── frontend/
│   └── property-search-ui/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── hooks/
│       ├── public/
│       └── tests/
├── start_backend.sh
└── start_frontend.sh
```

## API エンドポイント
- `GET /properties/` - 物件一覧を取得
- `GET /properties/{property_id}` - 指定されたIDの物件詳細を取得
- `GET /internet-providers/{property_id}` - 指定された物件IDのインターネット回線プラン情報を取得
- `GET /bike-parkings/property/{property_id}` - 指定された物件IDの近隣バイク駐輪場情報を取得

詳細なAPIドキュメントは http://localhost:8000/docs で確認できます。
