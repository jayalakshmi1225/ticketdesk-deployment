# TicketDesk — IT Support Ticket Tracker (AWS Capstone POC)

TicketDesk is a containerized, modular IT support ticket tracking application built with Spring Boot 3.4 / Java 17, Spring Data JPA, Spring Security (Stateless JWT), MySQL 8.4, and Flyway database migrations.

---

## 🚀 Run Locally

### Prerequisites
- Java 17+ JDK installed
- Docker & Docker Compose installed
- Maven (or use included `./mvnw` wrapper)

### Step 1: Start Local MySQL 8.4 Database
Start the local MySQL database container using Docker Compose:

```bash
docker compose up -d db
```

Wait until the container is healthy:
```bash
docker compose ps
```

### Step 2: Run the Spring Boot Application
Run the application using the Maven wrapper. By default, the `local` profile is active:

```bash
./mvnw spring-boot:run
```

> **Note on Seeding**: When running under the `local` profile, an admin user (`admin` / `Admin@123`) is automatically seeded on startup if not already present.

---

## 🧪 Verification & Authentication

### 1. Check Application Health
Verify database connectivity and application status:
```bash
curl -X GET http://localhost:8080/api/health
```
**Expected Response:**
```json
{
  "status": "UP",
  "dbConnected": true
}
```

### 2. Login as Admin User (Get JWT Token)
Authenticate with the seeded `admin` credentials to retrieve a JWT Bearer token:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "admin",
  "role": "ADMIN"
}
```

### 3. Interactive API Documentation (Swagger UI)
Open your browser and navigate to:
```text
http://localhost:8080/swagger-ui.html
```

---

## 🔒 Configuration & Environment Variables

No secrets or passwords are hardcoded in the codebase. All configuration parameters are dynamically read from environment variables with safe local development defaults in `application.yml`:

| Environment Variable | Description | Local Default |
| :--- | :--- | :--- |
| `DB_HOST` | MySQL Database Hostname | `localhost` |
| `DB_PORT` | MySQL Database Port | `3306` |
| `DB_NAME` | Database Name | `ticketdesk` |
| `DB_USER` | Database Username | `root` |
| `DB_PASSWORD` | Database Password | `root` |
| `JWT_SECRET` | 256-bit HMAC SHA key for JWT signing | `404E6352...` *(Local-only fallback key)* |
| `JWT_EXPIRATION_MS` | JWT expiration time in milliseconds | `86400000` (24 Hours) |
| `ADMIN_SEED_PASSWORD` | Initial password for seeded `admin` user | `Admin@123` |
| `ATTACHMENT_STORAGE_PATH` | Local file attachment root folder | `./uploads` |

---

## 🛠️ Running Unit & Integration Tests

Execute the full suite of 44 unit and integration tests:

```bash
./mvnw test
```
