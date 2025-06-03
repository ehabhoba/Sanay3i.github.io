USE sanai3y_db;

-- المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    type ENUM('client','professional','admin') NOT NULL DEFAULT 'client',
    membership_type ENUM('free','paid') DEFAULT 'free',
    ai_usage_count INT DEFAULT 0,
    ai_enabled BOOLEAN DEFAULT true,
    membership_expiry DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- الصنايعية
CREATE TABLE IF NOT EXISTS professionals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_type VARCHAR(100),
    description TEXT,
    location VARCHAR(255),
    rating FLOAT DEFAULT 0,
    profile_image VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    verified_enabled BOOLEAN DEFAULT true,
    membership_type ENUM('free','paid') DEFAULT 'free',
    membership_expiry DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- المواقع الجغرافية للصنايعية
CREATE TABLE IF NOT EXISTS professional_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT,
    is_available BOOLEAN DEFAULT true,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('available','busy','offline') DEFAULT 'offline',
    last_location_update TIMESTAMP NULL,
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;

-- مهارات الصنايعي
CREATE TABLE IF NOT EXISTS professional_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    skill_name VARCHAR(100),
    certification_url VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;

-- الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT,
    professional_id INT,
    professional_name VARCHAR(100),
    service_name VARCHAR(100),
    description TEXT,
    address VARCHAR(255),
    phone VARCHAR(20),
    status ENUM('pending','accepted','on-the-way','completed','cancelled') DEFAULT 'pending',
    status_ar VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT false,
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;

-- إضافة جدول تأكيدات الطلب
CREATE TABLE IF NOT EXISTS order_confirmations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    client_confirmed BOOLEAN DEFAULT FALSE,
    professional_confirmed BOOLEAN DEFAULT FALSE,
    arrival_time TIMESTAMP NULL,
    work_start_time TIMESTAMP NULL,
    work_end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

-- التقييمات
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    professional_id INT NOT NULL,
    client_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id),
    FOREIGN KEY (client_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- المدفوعات
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    professional_id INT,
    invoice_number VARCHAR(50),
    service_name VARCHAR(100),
    amount DECIMAL(10,2),
    status ENUM('pending','paid','failed') DEFAULT 'pending',
    status_ar VARCHAR(50),
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;

-- تفضيلات المستخدم
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    preferred_services JSON,
    preferred_locations JSON,
    price_range VARCHAR(20),
    availability_preferences JSON,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB;

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- جدول سجل الأحداث
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id),
    INDEX(action)
) ENGINE=InnoDB;

-- جدول الدعم الفني/الشكاوى
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open','closed','pending') DEFAULT 'open',
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX(user_id),
    INDEX(status)
) ENGINE=InnoDB;

-- جدول الرسائل (دردشة)
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    INDEX(sender_id),
    INDEX(receiver_id)
) ENGINE=InnoDB;

-- إضافة جدول الشكاوى
CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reported_user_id INT NOT NULL,
    order_id INT NOT NULL,
    complaint_text TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reported_user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

-- إضافة جدول الحظر
CREATE TABLE IF NOT EXISTS user_bans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reason TEXT NOT NULL,
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    banned_until TIMESTAMP NULL,
    is_permanent BOOLEAN DEFAULT FALSE,
    admin_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- فهارس إضافية
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_phone ON users(phone);
-- CREATE INDEX idx_orders_status ON orders(status);
-- CREATE INDEX idx_orders_client_id ON orders(client_id);
-- CREATE INDEX idx_orders_professional_id ON orders(professional_id);
-- CREATE INDEX idx_complaints_user ON complaints(user_id);
-- CREATE INDEX idx_complaints_reported ON complaints(reported_user_id);
-- CREATE INDEX idx_complaints_date ON complaints(created_at);
