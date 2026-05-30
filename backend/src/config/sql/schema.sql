-- ==========================================
-- Smart Blood Bank Management System Schema
-- ==========================================


-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'donor', 'hospital') NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Donors Table
CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    weight DECIMAL(5,2),
    last_donation_date DATE NULL,
    is_eligible TINYINT(1) DEFAULT 1,
    next_eligible_date DATE NULL,
    medical_conditions TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    emergency_contact VARCHAR(20) NOT NULL,
    hospital_type ENUM('government', 'private', 'clinic') DEFAULT 'private',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Blood Stock Table (Summarized stock levels)
CREATE TABLE IF NOT EXISTS blood_stock (
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') PRIMARY KEY,
    total_units INT DEFAULT 0,
    min_required_units INT DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Blood Units Table (Tracking individual units and their expiries)
CREATE TABLE IF NOT EXISTS blood_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    donation_id INT DEFAULT NULL,
    collected_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('available', 'reserved', 'used', 'expired') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    donation_date DATE NOT NULL,
    units_donated INT DEFAULT 1,
    blood_pressure VARCHAR(20),
    pulse_rate INT,
    hemoglobin DECIMAL(4,2),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    notes TEXT,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_requested INT NOT NULL,
    priority ENUM('critical', 'emergency', 'normal') DEFAULT 'normal',
    required_before DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Eligibility Checks Table
CREATE TABLE IF NOT EXISTS eligibility_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    check_date DATE NOT NULL,
    is_eligible TINYINT(1) NOT NULL,
    reason TEXT,
    weight_kg DECIMAL(5,2),
    age INT,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Emergency Alerts Table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_needed INT NOT NULL,
    city VARCHAR(100),
    hospital_name VARCHAR(255),
    message TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Request Status Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS request_status_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_table VARCHAR(100),
    target_id INT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Blood Compatibility Table
CREATE TABLE IF NOT EXISTS blood_compatibility (
    recipient_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    donor_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    PRIMARY KEY (recipient_group, donor_group)
) ENGINE=InnoDB;

-- ==========================================
-- Insert Default Master & Seed Data
-- ==========================================

-- Populate Blood Compatibility Matrix
INSERT IGNORE INTO blood_compatibility (recipient_group, donor_group) VALUES
('A+', 'A+'), ('A+', 'A-'), ('A+', 'O+'), ('A+', 'O-'),
('A-', 'A-'), ('A-', 'O-'),
('B+', 'B+'), ('B+', 'B-'), ('B+', 'O+'), ('B+', 'O-'),
('B-', 'B-'), ('B-', 'O-'),
('AB+', 'A+'), ('AB+', 'A-'), ('AB+', 'B+'), ('AB+', 'B-'), ('AB+', 'AB+'), ('AB+', 'AB-'), ('AB+', 'O+'), ('AB+', 'O-'),
('AB-', 'A-'), ('AB-', 'B-'), ('AB-', 'AB-'), ('AB-', 'O-'),
('O+', 'O+'), ('O+', 'O-'),
('O-', 'O-');

-- Initialize Blood Stock for all blood types
INSERT IGNORE INTO blood_stock (blood_group, total_units, min_required_units) VALUES
('A+', 15, 10),
('A-', 5, 8),
('B+', 12, 10),
('B-', 4, 8),
('AB+', 8, 8),
('AB-', 2, 5),
('O+', 20, 12),
('O-', 3, 10);

-- Seed initial active blood units in inventory to match summary counts
-- We insert units with an expiry date of 40 days in the future to keep them active
INSERT INTO blood_units (blood_group, collected_date, expiry_date, status) VALUES
-- A+ (15 units)
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
-- A- (5 units)
('A-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('A-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
-- B+ (12 units)
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
-- B- (4 units)
('B-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('B-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
-- AB+ (8 units)
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
-- AB- (2 units)
('AB-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('AB-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
-- O+ (20 units)
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O+', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
-- O- (3 units)
('O-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available'),
('O-', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'available');

-- Create Indexes for optimization
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_donors_blood ON donors(blood_group);
CREATE INDEX idx_blood_units_expiry ON blood_units(expiry_date, status);
CREATE INDEX idx_requests_status ON blood_requests(status);
