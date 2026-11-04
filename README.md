# Hospital Appointment and Patient Management System

A full-stack, production-grade College Mini-Project developed for 2nd-Year B.E. Computer Science students. Demonstrates clean multi-tier architecture, RESTful APIs, explicit parameterized SQL via **Spring JdbcTemplate** (strictly **NO** ORM / Hibernate / JPA), **MySQL 8.0** integration, and **Future-Ready Intelligent Scheduling Engines**.

---

## 🏛️ System Architecture

```text
+--------------------------------------------------------------+
|                    Vite + Tailwind CSS SPA                   |
|     (HTML5, Modern JavaScript, Responsive Dashboard UI)      |
|               Runs on: http://localhost:5173                 |
|   (Embedded in Spring Boot for single-service cloud deploy)  |
+--------------------------------------------------------------+
                              |
                              | HTTP / REST (JSON)
                              v
+--------------------------------------------------------------+
|                   Spring Boot REST Controllers               |
|  (PatientController, DoctorController, AppointmentController,|
|   DoctorRestPeriodController, ScheduleSimulationController,  |
|   WaitlistController, DashboardController)                   |
|               Runs on: http://localhost:8080                 |
+--------------------------------------------------------------+
                              |
                              v
+--------------------------------------------------------------+
|                       Service Layer                          |
|  - SchedulingEngineService (20-min slots, workload balancing)|
|  - ScheduleSimulationService (Digital Twin What-If preview)  |
|  - WaitlistService (FIFO candidate matching on cancel)       |
|  - DoctorRestPeriodService (protected rest boundaries)       |
|  - AppointmentService (transactional overlap & live queue)   |
+--------------------------------------------------------------+
                              |
                              v
+--------------------------------------------------------------+
|                      Repository Layer                        |
|   (Pure Spring JdbcTemplate, Parameterized SQL, RowMappers)  |
|  - AppointmentRepository, DoctorRestPeriodRepository,        |
|  - WaitlistRepository, DoctorRepository, PatientRepository    |
+--------------------------------------------------------------+
                              |
                              | JDBC (HikariCP Connection Pool)
                              v
+--------------------------------------------------------------+
|                     MySQL 8.0 Database                       |
|   (patients, doctors, doctor_availability, appointments,     |
|    doctor_rest_periods, appointment_waitlist)                |
|                Database: hospital_db:3306 / Cloud MySQL      |
+--------------------------------------------------------------+
```

---

## 🌟 Future-Ready Intelligent Upgrades (V2)

### 1. Mandatory 20-Minute Scheduling & Safe Concurrency
- **Strict Duration:** Every outpatient consultation lasts exactly 20 minutes. End times are calculated strictly on the backend (`start + 20 min`), ignoring untrusted client input.
- **Protected Doctor Rest Periods:** Non-bypassable breaks (e.g. lunch 13:00–14:00, clinical rounds, meetings). Bookings overlapping rest periods are rejected with explicit alternatives.
- **Concurrent Overlap Defense:** Validates doctor availability, doctor appointment collisions, and patient concurrent booking collisions within an atomic transaction.

### 2. Feature 1: Intelligent Appointment Recommendation Engine
- **Deterministic Rule-Based Evaluation:** Evaluates all candidate 20-minute slots in a doctor's shift against working hours, rest breaks, and active bookings.
- **Ranking Factors:** Ranks valid slots by proximity to requested preferred time or earliest available shift slot.
- **Explainable Decisions:** Returns transparent justifications for recommended slots along with an audit of rejected candidate slots and reasons.

### 3. Feature 2: Hospital Schedule Digital Twin / What-If Simulator
- **In-Memory Predictive Modeling:** Simulates proposed schedule modifications (extra rest periods, reduced shift hours, priority emergency insertions) purely in-memory with **zero database mutation**.
- **Impact Assessment:** Calculates baseline vs. projected slot counts, slot delta, risk levels (`SAFE`, `CAUTION`, `HIGH_CONFLICT`), and lists impacted active appointments.
- **Controlled Application:** Safe simulated rest periods can be committed directly to the doctor's live schedule after administrative review.

### 4. Feature 3: Adaptive Doctor Workload Balancing
- **Specialization Balancing:** Queries all active doctors in a requested medical specialization.
- **Workload Analysis:** Computes actual scheduled appointments and minutes booked for the target day.
- **Least-Loaded Recommendation:** Automatically selects and recommends the least-loaded doctor, preventing physician burnout.

### 5. Feature 4: Intelligent Cancellation Waitlist
- **Automatic Matching:** When an appointment is cancelled, the engine automatically searches the waitlist for matching patients in FIFO order.
- **Explicit Offer Lifecycle:** Creates a time-bounded slot offer (`OFFERED`). Patients can accept (instantly converting to a confirmed appointment with atomic revalidation) or decline (cascading the slot to the next candidate).

### 6. Live Patient Queue & Schedule Conflict Scanner
- **Live Outpatient Queue:** Real-time queue view with queue positions (#1, #2, #3...), patient check-in status, and estimated wait times (20 mins per preceding patient).
- **Conflict Scanner:** Administrative scanner inspecting all active appointments to detect double-bookings, patient overlaps, or rest-period violations.

---

## 🚀 Tech Stack

- **Frontend:** HTML5, Modern JavaScript (ES6+), Tailwind CSS, Vite, PostCSS.
- **Backend:** Java (OpenJDK 25 LTS / 21), Spring Boot 4.x, Apache Maven Wrapper (`mvnw`).
- **Persistence:** Spring `JdbcTemplate` with explicit parameterized queries (`PreparedStatement`), `DataSourceTransactionManager`.
- **Database:** MySQL Community Server 8.0 (`hospital_db`) / Aiven Cloud MySQL.
- **Testing:** JUnit 5, Mockito, Spring MockMvc, H2 (in-memory MySQL mode for isolated offline testing).

---

## 📂 Project Structure

```text
OOPS PRO/
├── .gitignore                          # Excludes credentials, build artifacts, node_modules
├── Dockerfile                          # Production multi-stage Docker build for Render
├── README.md                           # Documentation & viva presentation guide
├── start-backend.ps1                   # One-click PowerShell launch script for backend
├── start-frontend.ps1                  # One-click PowerShell launch script for frontend
├── database/
│   ├── schema.sql                      # Complete DDL for hospital_db tables and indexes
│   ├── migration_v2.sql                # Non-destructive migration for rest periods & waitlist
│   └── seed.sql                        # Realistic demo records (patients, doctors, slots)
├── backend/                            # Spring Boot REST API
│   ├── mvnw / mvnw.cmd                 # Maven Wrapper (no global Maven install required)
│   ├── pom.xml                         # Dependencies (zero JPA/Hibernate)
│   └── src/
│       ├── main/
│       │   ├── java/com/hospital/
│       │   │   ├── HospitalManagementApplication.java
│       │   │   ├── config/               # CorsConfig, DatabaseConfig (JdbcTemplate)
│       │   │   ├── controller/           # REST API Endpoints
│       │   │   │   ├── AppointmentController.java
│       │   │   │   ├── DoctorController.java
│       │   │   │   ├── DoctorRestPeriodController.java
│       │   │   │   ├── ScheduleSimulationController.java
│       │   │   │   ├── WaitlistController.java
│       │   │   │   ├── PatientController.java
│       │   │   │   └── DashboardController.java
│       │   │   ├── dto/                  # Request & Response DTOs
│       │   │   ├── exception/            # Global Exception Handler
│       │   │   ├── model/                # Domain Models (Patient, Doctor, Appointment, RestPeriod, Waitlist)
│       │   │   ├── repository/           # Pure JdbcTemplate parameterized SQL queries
│       │   │   └── service/              # SchedulingEngine, Simulation, Waitlist, Appointment
│       │   └── resources/
│       │       ├── application.properties.example# Template configuration (committed)
│       │       ├── application.properties        # Local config (gitignored)
│       │       └── static/               # Pre-built Vite SPA bundle for all-in-one run
│       └── test/                         # 21 Automated unit & integration tests (100% pass)
└── frontend/                           # Vite + Tailwind CSS Single Page Application
    ├── index.html                      # Responsive navigation: Dashboard, Engine, Simulator, Queue
    ├── package.json
    ├── vite.config.js                  # Proxies /api to http://localhost:8080
    ├── tailwind.config.js
    └── src/
        ├── api.js                      # REST API client mapping
        ├── main.js                     # SPA views, What-If simulator, Queue, Smart Engine
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
👉 **`http://localhost:5173`** (or access the embedded frontend directly at `http://localhost:8080`).

---

## 🧪 Automated Testing

Run the automated test suite completely offline (uses in-memory H2 database with exact MySQL schema):

```powershell
cd backend
.\mvnw.cmd test
```

### Verified Test Suites (21 Tests, 0 Failures):
- `AppointmentServiceTest` (8 tests): Verifies 20-min slot duration, rest period conflict rejection, patient overlap rejection, check-in, and waitlist cancellation cascading.
- `SchedulingEngineServiceTest` (5 tests): Verifies custom & default rest period detection, deterministic slot recommendation, workload-balanced doctor ranking across a specialization, and 20-min timeline generation.
- `ScheduleSimulationServiceTest` (2 tests): Verifies in-memory What-If previews for SAFE breaks and CAUTION conflict detection without DB mutation.
- `WaitlistServiceTest` (3 tests): Verifies waitlist registration, FIFO candidate matching on cancellation, and atomic offer acceptance.
- `JdbcRepositoryIntegrationTest` (1 test): Validates patient insertion, doctor availability check, appointment booking, 3-table SQL JOIN queries, and soft deactivation.
- `PatientAndDoctorControllerTest` (1 test): Validates HTTP 200 OK responses, JSON envelope serialization, and REST controller endpoints using MockMvc.
- `HospitalManagementApplicationTests` (1 test): Verifies Spring application context and `JdbcTemplate` wiring.

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
  AND status IN ('SCHEDULED', 'RESCHEDULED', 'CHECKED_IN') 
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

---

## 🌐 Free-Tier Cloud Deployment Guide (Render + Aiven MySQL)

Deploy the full-stack system with a single public URL on **Render** (Docker Web Service) backed by a managed **Aiven Free MySQL** database.

### Step 1: Provision Aiven Free MySQL
1. Sign up / Log in to [Aiven.io](https://aiven.io/).
2. Create a new service -> Select **MySQL** (Free Tier).
3. In Aiven Console:
   - Run `database/schema.sql` (or `database/migration_v2.sql` if upgrading an existing database).
   - (Optional) Run `database/seed.sql` to populate sample demo data.

### Step 2: Deploy on Render as Docker Web Service
1. Log in to [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/joycegracy72-sys/hospital_appointments_system.git`.
4. Configure service settings:
   - **Branch:** `master`
   - **Runtime:** `Docker`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `DB_URL` | `jdbc:mysql://<AIVEN_HOST>:<AIVEN_PORT>/<AIVEN_DB>?sslMode=REQUIRED` | MySQL JDBC URL with required TLS |
   | `DB_USERNAME` | `<AIVEN_USER>` (e.g. `avnadmin`) | Cloud database username |
   | `DB_PASSWORD` | `<AIVEN_PASSWORD>` | Cloud database password |

6. Click **Deploy Web Service**.
Your complete application will be live at:
👉 **`https://<your-service-name>.onrender.com`**
