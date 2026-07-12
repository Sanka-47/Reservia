# Reservia - Service Booking Platform

## 📖 1. Project Overview

Reservia is a modern, premium service booking and scheduling application designed with a high-fidelity dark-neon glassmorphism aesthetic. It allows guests to schedule appointments anonymously, users to manage their bookings, and administrators to orchestrate catalog services.

👉 **Live Demo URL**: [https://reservia-2cjaxmb3r-sanka-47s-projects.vercel.app/](https://reservia-2cjaxmb3r-sanka-47s-projects.vercel.app/)

### 🛠 Tech Stack
* **Backend**: NestJS (TypeScript), TypeORM, PostgreSQL, class-validator, Swagger UI.
* **Frontend**: React (TypeScript), Vite, HSL-themed Vanilla CSS.
* **Orchestration**: Docker & Docker Compose.

### 📋 Directory Structure
```text
reservia/
├── backend/            # NestJS API Engine
├── frontend/           # Vite + React Client
├── docker-compose.yml  # Docker composition
├── .env.example        # Reference environment variables config
└── README.md           # Documentation (this file)
```

---

## 🚀 2. Installation Steps

To install the dependencies for local execution, run the following commands:

### Backend Installation:
```bash
cd backend
npm install
```

### Frontend Installation:
```bash
cd frontend
npm install
```

---

## 🔑 3. Environment Variables

Create a `.env` file in the root workspace directory (copied from `.env.example`):

```ini
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=reservia
DB_SSL=false
JWT_SECRET=super_secret_jwt_key_change_me
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_change_me
```

---

## 💾 4. Database Setup

Reservia runs with PostgreSQL.
* **Schema Sync**: NestJS TypeORM dynamically synchronizes the schema based on entity mappings (`synchronize: true`), making traditional manual migrations unnecessary for local setup.
* **Seed Script**: Real mock entities (admin, customer users, services, initial appointments) are populated via `backend/src/seed.ts`.
* **Automatic Admin Seeding**: The system automatically seeds the main administrator profile on the first startup if it doesn't exist.

---

## 💻 5. Running the Application

### Option A: Via Docker Compose (Recommended)
From the root directory, run:
```bash
docker compose up -d --build
```
This automatically starts PostgreSQL, backend server, and frontend server:
* **Frontend Portal**: [http://localhost:3001](http://localhost:3001)
* **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
* **API Documentation (Swagger)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Option B: Local Run (Without Docker)
1. Start your local PostgreSQL server and create a database named `reservia`.
2. Run the backend:
   ```bash
   cd backend
   npm run start:dev
   ```
3. Run the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

## ⚙️ 6. Running Migrations

* **Automated Sync**: Because the application utilizes `synchronize: true` in development, manual database migration scripts are not required. The tables are generated dynamically on startup.
* **Seeding Test Data**: To run the database seeder (to populate initial services, test accounts, and bookings):
  * **If using Docker Compose**:
    ```bash
    docker exec -it reservia-api npm run db:seed
    ```
  * **If running locally**:
    ```bash
    cd backend
    npm run db:seed
    ```

#### 🔑 Predefined Accounts for Testing:
| Role | Username | Password | Email | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | `admin@reservia.com` | Accesses statistics cards, manages services. |
| **Customer (John Doe)** | `john_doe` | `password123` | `john@example.com` | Books services, reschedules appointments. |
| **Customer (Jane Smith)** | `jane_smith` | `password123` | `jane@example.com` | Books services, reschedules appointments. |

---

## 📖 7. API Documentation

Reservia is configured with Swagger. Navigate to:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

This interactive panel allows you to check and execute all endpoints, parameters, and headers (such as Bearer JWT Authentication headers). Accessing `http://localhost:3000/` or `http://localhost:3000/api` will automatically redirect you to this panel.

---

## 🧠 8. Assumptions Made

1. **Guest Claims on Login**: Guests booking appointments anonymously have their booking UUIDs saved in `localStorage`. When they log in or register during that session, the frontend automatically updates the database to associate those guest bookings with their newly logged-in user profile.
2. **Double-booking Prevention**: A partial database unique index ensures that no two active bookings (`status != 'CANCELLED'`) can coexist for the same service, date, and timeslot.
3. **Cancellation instead of deletion**: Customer bookings cannot be hard-deleted from the database. Instead, they are set to `CANCELLED` to preserve audit records.
4. **Service Deletion Restriction**: Deleting services is prohibited to avoid breaking historical active booking relations. Instead, services can be marked `isActive: false` (inactive) to hide them from the booking screen without breaking history.
5. **Rescheduling Status Reset**: When a booking is rescheduled (its date or time is changed), its status automatically resets back to `PENDING` to allow administrators to verify and confirm the new date/time slot.

---

## 🔮 9. Future Improvements

1. **Email OTP Verification**: Require guest bookings to be verified using a one-time passcode before linking them to any account.
2. **Calendar Integrations**: Synchronize appointments with external platforms (Google Calendar, Outlook).
3. **Advanced Filtering**: Add paginated sorting, service category filtering, and status history logs in the Admin Dashboard.
