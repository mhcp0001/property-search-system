-- 物件検索システム データベース初期化スクリプト

-- properties テーブル (物件情報)
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    station VARCHAR(255) NOT NULL,
    walking_minutes INT NOT NULL,
    rent INT NOT NULL,
    management_fee INT,
    deposit INT,
    key_money INT,
    floor_plan VARCHAR(50) NOT NULL,
    size_sqm FLOAT NOT NULL,
    building_structure VARCHAR(50) NOT NULL,
    built_year INT NOT NULL,
    total_floors INT,
    floor INT NOT NULL,
    corner_room TINYINT(1) NOT NULL,
    status VARCHAR(20) NOT NULL,
    site_url VARCHAR(500) NOT NULL,
    main_image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_station (station),
    INDEX idx_rent (rent),
    INDEX idx_floor_plan (floor_plan),
    UNIQUE INDEX idx_property_unique (name, address, floor)
);

-- internet_providers テーブル (インターネット回線プラン)
CREATE TABLE IF NOT EXISTS internet_providers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    flets_plan VARCHAR(100),
    au_hikari_plan VARCHAR(100),
    nuro_plan VARCHAR(100),
    jcom_plan VARCHAR(100),
    checked_at DATETIME NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id)
);

-- bike_parkings テーブル (近隣バイク駐輪場)
CREATE TABLE IF NOT EXISTS bike_parkings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    parking_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    distance FLOAT,
    fee VARCHAR(50),
    parking_url VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_distance (distance)
);

-- notifications テーブル (通知履歴)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    notified_at DATETIME NOT NULL,
    line_message_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_notified_at (notified_at)
);
