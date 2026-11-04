-- ===================================================================
-- Hospital Appointment and Patient Management System
-- Database Migration v2: Intelligent Scheduling & Waitlist Additions
-- Compatible with MySQL 8.0+ and Aiven Managed Cloud MySQL
-- ===================================================================

-- 1. Doctor Protected Rest Periods Table
CREATE TABLE IF NOT EXISTS doctor_rest_periods (
    rest_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    rest_date DATE NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(100) NOT NULL DEFAULT 'Rest / Lunch Break',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    INDEX idx_rest_doc_date (doctor_id, rest_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add check_in_time and update status enum on appointments table
ALTER TABLE appointments 
    MODIFY COLUMN status ENUM('SCHEDULED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED';

-- Add check_in_time column if not already present
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'appointments' AND column_name = 'check_in_time';

SET @stmt = IF(@col_exists = 0, 'ALTER TABLE appointments ADD COLUMN check_in_time TIMESTAMP NULL AFTER cancellation_reason;', 'SELECT "Column check_in_time already exists";');
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Cancellation Waitlist Table
CREATE TABLE IF NOT EXISTS appointment_waitlist (
    waitlist_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NULL,
    specialization VARCHAR(100) NULL,
    preferred_date DATE NOT NULL,
    preferred_start_time TIME NULL,
    preferred_end_time TIME NULL,
    status ENUM('WAITING', 'OFFERED', 'ACCEPTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'WAITING',
    offered_appointment_date DATE NULL,
    offered_start_time TIME NULL,
    offered_end_time TIME NULL,
    offered_doctor_id INT NULL,
    offer_expires_at TIMESTAMP NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    FOREIGN KEY (offered_doctor_id) REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    INDEX idx_waitlist_status (status),
    INDEX idx_waitlist_match (preferred_date, specialization, doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
