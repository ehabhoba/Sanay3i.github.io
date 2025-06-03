USE sanai3y_db;

-- إضافة جدول للمواقع الجغرافية
CREATE TABLE IF NOT EXISTS professional_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT,
    is_available BOOLEAN DEFAULT true,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;

-- إضافة جدول للتوصيات
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    preferred_services JSON,
    preferred_locations JSON,
    price_range VARCHAR(20),
    availability_preferences JSON,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- إضافة جدول للمهارات والشهادات
CREATE TABLE IF NOT EXISTS professional_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    skill_name VARCHAR(100),
    certification_url VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;

-- تعديل جدول الصنايعيين لإضافة أعمدة جديدة
-- نفذ هذا الأمر فقط إذا لم تكن الأعمدة موجودة
-- ALTER TABLE professionals 
-- ADD COLUMN is_verified BOOLEAN DEFAULT false,
-- ADD COLUMN membership_type ENUM('free', 'paid') DEFAULT 'free',
-- ADD COLUMN verified_enabled BOOLEAN DEFAULT true,
-- ADD COLUMN membership_expiry DATE DEFAULT NULL;

-- تعديل جدول المستخدمين لإضافة أعمدة جديدة
-- نفذ هذا الأمر فقط إذا لم تكن الأعمدة موجودة
-- ALTER TABLE users 
-- ADD COLUMN ai_usage_count INT DEFAULT 0,
-- ADD COLUMN membership_type ENUM('free', 'paid') DEFAULT 'free',
-- ADD COLUMN ai_enabled BOOLEAN DEFAULT true,
-- ADD COLUMN membership_expiry DATE DEFAULT NULL;

-- Add performance indexes
-- لا تكرر إضافة الفهارس إذا كانت موجودة
-- CREATE INDEX idx_professionals_service_location ON professionals(service_type, location);
-- CREATE INDEX idx_orders_status_date ON orders(status, created_at);
-- CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Add full-text search capabilities
ALTER TABLE professionals ADD FULLTEXT INDEX ft_professional_search(service_type, description);
ALTER TABLE services ADD FULLTEXT INDEX ft_service_search(name, description);

-- Add caching table
CREATE TABLE cache (
    `key` VARCHAR(255) PRIMARY KEY,
    `value` TEXT,
    `expiry` TIMESTAMP
) ENGINE=InnoDB;

-- Add rate limiting table
CREATE TABLE rate_limits (
    ip_address VARCHAR(45),
    endpoint VARCHAR(100),
    requests INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip_address, endpoint)
) ENGINE=InnoDB;

-- Add session management
CREATE TABLE user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
