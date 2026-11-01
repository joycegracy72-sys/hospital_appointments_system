-- ===================================================================
-- Hospital Appointment and Patient Management System
-- Sample Seed Data for Demonstrations & Testing
-- ===================================================================

USE hospital_db;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctor_availability;
TRUNCATE TABLE doctors;
TRUNCATE TABLE patients;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------
-- 1. Insert Doctors
-- -------------------------------------------------------------------
INSERT INTO doctors (doctor_id, first_name, last_name, specialization, email, phone, consultation_fee, is_active)
VALUES
(1, 'Rajesh', 'Sharma', 'Cardiology', 'rajesh.sharma@hospital.org', '+91 98201 12345', 800.00, TRUE),
(2, 'Priya', 'Nair', 'Dermatology', 'priya.nair@hospital.org', '+91 98450 23456', 650.00, TRUE),
(3, 'Ananya', 'Iyer', 'Pediatrics', 'ananya.iyer@hospital.org', '+91 97110 34567', 500.00, TRUE),
(4, 'Vikram', 'Patel', 'Orthopedics', 'vikram.patel@hospital.org', '+91 98980 45678', 750.00, TRUE),
(5, 'Suresh', 'Menon', 'General Medicine', 'suresh.menon@hospital.org', '+91 94470 56789', 400.00, TRUE);

-- -------------------------------------------------------------------
-- 2. Insert Doctor Availability (Date-Specific Availability)
-- -------------------------------------------------------------------
INSERT INTO doctor_availability (doctor_id, available_date, start_time, end_time)
VALUES
(1, CURRENT_DATE + INTERVAL 1 DAY, '09:00:00', '13:00:00'),
(1, CURRENT_DATE + INTERVAL 2 DAY, '09:00:00', '13:00:00'),
(2, CURRENT_DATE + INTERVAL 1 DAY, '10:00:00', '14:00:00'),
(2, CURRENT_DATE + INTERVAL 3 DAY, '10:00:00', '14:00:00'),
(3, CURRENT_DATE + INTERVAL 1 DAY, '14:00:00', '18:00:00'),
(4, CURRENT_DATE + INTERVAL 2 DAY, '10:00:00', '15:00:00'),
(5, CURRENT_DATE + INTERVAL 1 DAY, '09:00:00', '13:00:00');

-- -------------------------------------------------------------------
-- 3. Insert Patients
-- -------------------------------------------------------------------
INSERT INTO patients (patient_id, first_name, last_name, email, phone, date_of_birth, gender, blood_group, address, is_active)
VALUES
(1, 'Rahul', 'Verma', 'rahul.verma@example.com', '+91 98111 22334', '1988-04-12', 'MALE', 'B+', '42 Park Street, Bangalore', TRUE),
(2, 'Sneha', 'Kulkarni', 'sneha.k@example.com', '+91 98222 33445', '1995-09-23', 'FEMALE', 'O+', '15 MG Road, Pune', TRUE),
(3, 'Amit', 'Gupta', 'amit.gupta@example.com', '+91 98333 44556', '1972-11-05', 'MALE', 'A+', '88 Sector 17, Chandigarh', TRUE),
(4, 'Meera', 'Krishnan', 'meera.k@example.com', '+91 98444 55667', '2001-02-18', 'FEMALE', 'AB+', '204 Anna Nagar, Chennai', TRUE),
(5, 'Rohan', 'Joshi', 'rohan.joshi@example.com', '+91 98555 66778', '2015-06-30', 'MALE', 'O-', '12 FC Road, Pune', TRUE),
(6, 'Sunita', 'Rao', 'sunita.rao@example.com', '+91 98666 77889', '1960-08-14', 'FEMALE', 'B-', '56 Malleshwaram, Bangalore', TRUE),
(7, 'Arjun', 'Das', 'arjun.das@example.com', '+91 98777 88990', '1992-12-01', 'MALE', 'A-', '7 Salt Lake, Kolkata', TRUE),
(8, 'Kavita', 'Deshmukh', 'kavita.d@example.com', '+91 98888 99001', '1985-03-27', 'FEMALE', 'O+', '91 Bandra West, Mumbai', FALSE);

-- -------------------------------------------------------------------
-- 4. Insert Appointments (Historical and Upcoming)
-- -------------------------------------------------------------------
INSERT INTO appointments (appointment_id, patient_id, doctor_id, appointment_date, start_time, end_time, status, reason_for_visit, notes, cancellation_reason)
VALUES
-- Past Completed Appointments
(1, 1, 1, '2026-10-12', '09:30:00', '10:00:00', 'COMPLETED', 'Routine ECG & Blood Pressure follow-up', 'BP normal at 120/80. Continue current medication.', NULL),
(2, 2, 2, '2026-10-13', '10:30:00', '11:00:00', 'COMPLETED', 'Severe skin rash and allergy consultation', 'Prescribed topical ointment and antihistamine.', NULL),
(3, 5, 3, '2026-10-14', '14:30:00', '15:00:00', 'COMPLETED', 'Annual pediatric vaccination and growth check', 'Growth percentiles on track. Next dose scheduled in 6 months.', NULL),
(4, 3, 4, '2026-10-14', '11:00:00', '11:30:00', 'COMPLETED', 'Chronic knee pain after sports activity', 'Advised MRI scan and prescribed mild anti-inflammatory.', NULL),

-- Past Cancelled & No-Show Appointments
(5, 4, 1, '2026-10-16', '10:00:00', '10:30:00', 'CANCELLED', 'Palpitations during exercise', NULL, 'Patient had an emergency out of city travel'),
(6, 7, 5, '2026-10-16', '16:30:00', '17:00:00', 'NO_SHOW', 'Seasonal fever and cough', 'Patient failed to appear without notification.', NULL),

-- Today & Upcoming Scheduled Appointments
(7, 1, 5, '2026-10-20', '09:30:00', '10:00:00', 'SCHEDULED', 'General health wellness checkup', NULL, NULL),
(8, 2, 1, '2026-10-21', '09:00:00', '09:30:00', 'SCHEDULED', 'Chest tightness investigation', NULL, NULL),
(9, 3, 2, '2026-10-22', '10:00:00', '10:30:00', 'SCHEDULED', 'Dermatitis follow-up assessment', NULL, NULL),
(10, 6, 4, '2026-10-24', '10:30:00', '11:00:00', 'SCHEDULED', 'Post-operative orthopedic mobility check', NULL, NULL),
(11, 4, 3, '2026-10-26', '15:00:00', '15:30:00', 'SCHEDULED', 'Sibling fever & viral symptom check', NULL, NULL),
(12, 8, 5, '2026-10-27', '11:00:00', '11:30:00', 'SCHEDULED', 'Historical consult prior to deactivation', 'Demonstrates preserved record of inactive patient.', NULL);
