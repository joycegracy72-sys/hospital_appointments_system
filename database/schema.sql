-- ===================================================================
-- Hospital Appointment and Patient Management System
-- Database Schema Definition (MySQL 8.0+)
-- ===================================================================

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- Disable foreign key checks for clean drops
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctor_availabilities;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------
-- 1. Patients Table
-- Stores patient demographic and medical contact information.
-- Uses is_active flag for soft-deactivation to preserve appointment history.
-- -------------------------------------------------------------------
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    blood_group VARCHAR(5) NULL,
    address VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_name (last_name, first_name),
    INDEX idx_patient_phone (phone),
    INDEX idx_patient_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 2. Doctors Table
-- Stores medical practitioner profiles, specialization, and consultation fees.
-- -------------------------------------------------------------------
CREATE TABLE doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_doctor_specialization (specialization),
    INDEX idx_doctor_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 3. Doctor Availabilities Table
-- Configures weekly recurring working hours/slots for each doctor.
-- -------------------------------------------------------------------
CREATE TABLE doctor_availabilities (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, day_of_week, start_time),
    INDEX idx_availability_doc_day (doctor_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 4. Appointments Table
-- Tracks scheduled, completed, cancelled, and no-show consultations.
-- Enforces referential integrity with RESTRICT on delete so deactivated
-- doctors or patients never break existing historical records.
-- -------------------------------------------------------------------
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    reason_for_visit VARCHAR(255) NULL,
    notes TEXT NULL,
    cancellation_reason VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    INDEX idx_appointment_doctor_time (doctor_id, appointment_date, start_time),
    INDEX idx_appointment_patient (patient_id, appointment_date),
    INDEX idx_appointment_status (status),
    INDEX idx_appointment_date (appointment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
