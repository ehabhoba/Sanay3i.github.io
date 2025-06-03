USE sanai3y_db;

-- Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Add service categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50)
) ENGINE=InnoDB;

-- Add service areas table
CREATE TABLE IF NOT EXISTS service_areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;

-- Add availability schedule table
CREATE TABLE IF NOT EXISTS availability_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professional_id INT NOT NULL,
    day_of_week TINYINT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
) ENGINE=InnoDB;
