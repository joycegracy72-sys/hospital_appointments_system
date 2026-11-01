# Hospital Appointment and Patient Management System

A full-stack, production-grade College Mini-Project developed for 2nd-Year B.E. Computer Science students. Demonstrates clean multi-tier architecture, RESTful APIs, explicit parameterized SQL via **Spring JdbcTemplate** (strictly **NO** ORM / Hibernate / JPA), and **MySQL 8.0** integration.

---

## 🏛️ System Architecture

```text
+--------------------------------------------------------------+
|                    Vite + Tailwind CSS SPA                   |
|     (HTML5, Modern JavaScript, Responsive Dashboard UI)      |
|               Runs on: http://localhost:5173                 |
+--------------------------------------------------------------+
                              |
                              | HTTP / REST (JSON)
                              v
+--------------------------------------------------------------+
|                   Spring Boot REST Controllers               |
|      (PatientController, DoctorController, Appointment, etc) |
|               Runs on: http://localhost:8080                 |
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
                              | JDBC (HikariCP Pool)
                              v
+--------------------------------------------------------------+
|                     MySQL 8.0 Database                       |
|   (Tables: patients, doctors, doctor_availability, appts)    |
|                Database: hospital_db:3306                    |
+--------------------------------------------------------------+
```

---

## 🚀 Tech Stack

- **Frontend:** HTML5, Modern JavaScript (ES6+), Tailwind CSS, Vite, PostCSS.
- **Backend:** Java (OpenJDK 25 LTS / 21), Spring Boot 4.x, Apache Maven Wrapper (`mvnw`).
- **Persistence:** Spring `JdbcTemplate` with explicit parameterized queries (`PreparedStatement`), `DataSourceTransactionManager`.
- **Database:** MySQL Community Server 8.0 (`hospital_db`).
- **Testing:** JUnit 5, Mockito, Spring MockMvc, H2 (in-memory MySQL mode for isolated offline testing).

---

## 📂 Project Structure

```text
OOPS PRO/
├── .gitignore                          # Excludes credentials, build artifacts, node_modules
├── README.md                           # Documentation & viva presentation guide
├── start-backend.ps1                   # One-click PowerShell launch script for backend
├── start-frontend.ps1                  # One-click PowerShell launch script for frontend
├── database/
│   ├── schema.sql                      # DDL for hospital_db tables and indexes
│   └── seed.sql                        # Realistic demo records (patients, doctors, slots)
├── backend/                            # Spring Boot REST API
│   ├── mvnw / mvnw.cmd                 # Maven Wrapper (no global Maven install required)
│   ├── pom.xml                         # Dependencies (zero JPA/Hibernate)
│   └── src/
│       ├── main/
│       │   ├── java/com/hospital/
│       │   │   ├── HospitalManagementApplication.java
│       │   │   ├── config/
│       │   │   │   ├── CorsConfig.java           # Cross-origin policy for localhost:5173
│       │   │   │   └── DatabaseConfig.java       # JdbcTemplate & TransactionManager setup
│       │   │   ├── controller/                   # REST API Endpoints
│       │   │   │   ├── PatientController.java    # /api/patients
│       │   │   │   ├── DoctorController.java     # /api/doctors
│       │   │   │   ├── AppointmentController.java# /api/appointments
│       │   │   │   └── DashboardController.java  # /api/dashboard/stats
│       │   │   ├── dto/                          # Request & Response Transfer Objects
│       │   │   ├── exception/                    # Global Exception Handler
│       │   │   ├── model/                        # Domain Models (Patient, Doctor, Appointment)
│       │   │   ├── repository/                   # Pure JdbcTemplate parameter-driven SQL
│       │   │   └── service/                      # Overlap detection & Transactional logic
│       │   └── resources/
│       │       ├── application.properties.example# Template configuration (committed)
│       │       ├── application.properties        # Local config (gitignored)
│       │       └── static/                       # Pre-built Vite SPA bundle for all-in-one run
│       └── test/                                 # 8 Automated unit & integration tests
└── frontend/                           # Vite + Tailwind CSS Single Page Application
    ├── index.html
    ├── package.json
    ├── vite.config.js                   # Proxies /api to http://localhost:8080
    ├── tailwind.config.js
    └── src/
        ├── api.js                      # REST API client mapping
        ├── main.js                     # SPA views, modals, toasts, filters
        └── style.css                   # Tailwind styles
```

---

## ⚡ Quick Start & Run Instructions

### Step 1: Start the Backend (Port 8080)

Open a PowerShell terminal and set your MySQL password for the session, then run the Maven Wrapper:

```powershell
# Set your MySQL root password for the active terminal session
$env:DB_PASSWORD = "your_mysql_password"

# Launch backend using Maven Wrapper
cd backend
.\mvnw.cmd spring-boot:run
```

> **Convenience:** You can also simply run `.\start-backend.ps1` from the project root!

Once started, the backend is active at:
👉 **`http://localhost:8080`**

---

### Step 2: Start the Frontend (Port 5173)

Open a second PowerShell terminal:

```powershell
cd frontend
npm run dev
```

> **Convenience:** You can also run `.\start-frontend.ps1`!

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🧪 Automated Testing

Run the automated test suite completely offline (uses in-memory H2 database with exact MySQL schema):

```powershell
cd backend
.\mvnw.cmd test
```

### Verified Tests:
- `HospitalManagementApplicationTests`: Verifies Spring application context and `JdbcTemplate` wiring.
- `JdbcRepositoryIntegrationTest`: Validates patient insertion, doctor availability check, appointment booking, 3-table SQL JOIN queries, overlap collision detection, and patient soft deactivation.
- `AppointmentServiceTest`: Verifies business logic, time boundary validation, deactivated patient rejection, rescheduling, and cancellation.
- `PatientAndDoctorControllerTest`: Validates HTTP 200 OK responses, JSON envelope serialization, and REST controller endpoints using MockMvc.

---

## 🎓 Academic / Viva Highlights

### 1. Why JdbcTemplate instead of Hibernate / JPA?
- **Explicit SQL Control:** Query performance, table joins, and execution plans are clear, predictable, and written by hand.
- **Academic Demonstration:** Demonstrates mastery of database constraints, foreign keys, transactions, and parameterized PreparedStatements.
- **No Hidden Magic:** Eliminates lazy-loading exceptions, N+1 query surprises, and inadvertent cascading deletions.

### 2. How is Double-Booking Prevented?
Every appointment creation or rescheduling executes inside an isolated `@Transactional` service boundary:
```sql
SELECT COUNT(*) FROM appointments 
WHERE doctor_id = ? 
  AND appointment_date = ? 
  AND status IN ('SCHEDULED', 'RESCHEDULED') 
  AND (start_time < ? AND end_time > ?) 
  AND (? IS NULL OR appointment_id != ?)
```
If this count is greater than zero, the service throws a `BusinessConflictException` (mapped to HTTP 409 Conflict), preventing overlapping bookings.

### 3. How is Patient History Preserved?
When a patient is deactivated:
```sql
UPDATE patients SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE patient_id = ?
```
The patient is hidden from the booking form, but their historical consultation records and audit logs remain linked via foreign keys (`ON DELETE RESTRICT`).
