# Hospital Appointment and Patient Management System

A production-grade, multi-tier College Mini-Project developed for 2nd-Year B.E. Computer Science students. Demonstrates Clean Object-Oriented Design, RESTful API architecture, parameterized SQL via **Spring JdbcTemplate** (strictly **NO** ORM / Hibernate / JPA), and MySQL integration.

---

## 🏛️ System Architecture

```text
+--------------------------------------------------------------+
|                    Vite + Tailwind CSS SPA                   |
|     (HTML5, Modern JavaScript, Responsive Dashboard UI)      |
+--------------------------------------------------------------+
                              |
                              | HTTP / REST (JSON)
                              v
+--------------------------------------------------------------+
|                   Spring Boot REST Controllers               |
|      (PatientController, DoctorController, Appointment, etc) |
+--------------------------------------------------------------+
                              |
                              v
+--------------------------------------------------------------+
|                       Service Layer                          |
|   (Business Validation, Overlap Detection, @Transactional)   |
+--------------------------------------------------------------+
                              |
                              v
+--------------------------------------------------------------+
|                      Repository Layer                        |
|   (Pure Spring JdbcTemplate, Parameterized SQL, RowMappers)  |
+--------------------------------------------------------------+
                              |
                              | JDBC (HikariCP)
                              v
+--------------------------------------------------------------+
|                     MySQL 8.0 Database                       |
|         (Tables: patients, doctors, availabilities, appts)   |
+--------------------------------------------------------------+
```

---

## 🚀 Tech Stack

- **Backend:** Java (OpenJDK 21 / 25), Spring Boot, Maven Wrapper (`mvnw`).
- **Persistence:** Spring `JdbcTemplate` with explicit parameterized queries (PreparedStatements).
- **Database:** MySQL Community Server 8.0.
- **Frontend (Upcoming):** HTML5, Tailwind CSS, JavaScript (ES6+), Vite.
- **Testing:** JUnit 5, H2 Database (in-memory for isolated test runner).

---

## 📂 Project Structure

```text
OOPS PRO/
├── .gitignore                          # Excludes secrets, target/, node_modules/
├── README.md                           # Documentation & setup guide
├── database/
│   ├── schema.sql                      # DDL for hospital_db tables and indexes
│   └── seed.sql                        # Realistic demo records (doctors, patients, visits)
├── backend/                            # Spring Boot REST API
│   ├── mvnw / mvnw.cmd                 # Maven Wrapper (no global Maven install required)
│   ├── pom.xml                         # Dependencies (spring-boot-starter-jdbc, mysql-connector-j)
│   └── src/
│       ├── main/
│       │   ├── java/com/hospital/
│       │   │   ├── HospitalManagementApplication.java
│       │   │   └── config/
│       │   │       ├── CorsConfig.java          # Cross-origin policy for frontend
│       │   │       └── DatabaseConfig.java      # JdbcTemplate & TransactionManager setup
│       │   └── resources/
│       │       ├── application.properties.example # Template (committed)
│       │       └── application.properties         # Local config (gitignored)
│       └── test/
│           ├── java/com/hospital/HospitalManagementApplicationTests.java
│           └── resources/application.properties  # H2 in-memory test config
└── frontend/                           # Vite SPA (Milestone 4)
```

---

## 🛠️ Step-by-Step Setup Guide

### 1. Database Setup in MySQL

You can initialize the database using either **MySQL Command Line** or **MySQL Workbench**.

#### Option A: Using MySQL Command Line (PowerShell)
Execute the following commands in PowerShell. Replace `"YOUR_PASSWORD"` with your MySQL `root` password:

```powershell
# 1. Execute schema creation
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source database/schema.sql"

# 2. (Optional) Load realistic demo seed data
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "source database/seed.sql"
```

#### Option B: Using MySQL Workbench
1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Go to **File -> Open SQL Script...** and select `database/schema.sql`.
3. Click the **Execute (⚡ lightning bolt)** icon.
4. (Optional) Repeat the same step with `database/seed.sql` to populate sample patients, doctors, and appointments.

---

### 2. Configure Database Credentials

The application is engineered to never hardcode credentials. You can provide your password in **either** of two ways:

#### Option A: Environment Variable (Recommended)
Set the environment variable in your terminal before running:
```powershell
# In PowerShell:
$env:DB_PASSWORD="your_mysql_password"

# In Command Prompt (cmd):
set DB_PASSWORD=your_mysql_password
```

#### Option B: Local Properties File
Edit `backend/src/main/resources/application.properties` (this file is excluded from Git so your password will never be committed):
```properties
spring.datasource.username=root
spring.datasource.password=your_actual_password
```

---

### 3. Build & Run the Backend

Navigate to the `backend` directory and use the included **Maven Wrapper**:

```powershell
cd backend

# Run automated tests
.\mvnw.cmd clean test

# Run the backend server
.\mvnw.cmd spring-boot:run
```

Once started, the backend server will be listening at:  
👉 **`http://localhost:8080`**

---

## 🎓 Academic / Viva Highlights

- **Why JdbcTemplate instead of Hibernate / JPA?**
  1. **Complete Control:** SQL queries are explicitly written, making query performance, join logic, and execution plans predictable and transparent.
  2. **No Hidden Overhead:** Avoids N+1 query traps, lazy-loading exceptions, and unintended entity cascade side-effects.
  3. **Direct Demonstration of SQL Skills:** Allows students to demonstrate knowledge of indexes, parameterized queries, and ACID transaction boundaries.

- **How is Appointment Double-Booking Prevented?**
  Every booking request runs inside an isolated `@Transactional` service boundary with an explicit overlap check:
  ```sql
  SELECT COUNT(*) FROM appointments 
  WHERE doctor_id = ? 
    AND appointment_date = ? 
    AND status IN ('SCHEDULED') 
    AND (start_time < ? AND end_time > ?)
  ```

- **How are Inactive Records Handled?**
  Patients and doctors use a soft-deactivation flag (`is_active = FALSE`). Deactivating a patient preserves all historical appointments for medical audit logs and reporting, while filtering them out from new appointment booking dialogs.
