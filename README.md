# Reservia - Service Booking Platform

Reservia is a modern, premium service booking and scheduling application designed with a high-fidelity dark-neon glassmorphism aesthetic. It allows guests to schedule appointments anonymously, users to manage their bookings, and administrators to orchestrate catalog services.

---

## 🛠 Tech Stack

* **Backend**: NestJS (TypeScript), TypeORM, PostgreSQL, class-validator, Swagger UI.
* **Frontend**: React (TypeScript), Vite, HSL-themed Vanilla CSS.
* **Orchestration**: Docker & Docker Compose.

---

## 📋 Directory Structure

```
reservia/
├── backend/            # NestJS API Engine
├── frontend/           # Vite + React Client
├── docker-compose.yml  # Docker composition
├── .env.example        # Reference environment variables config
└── README.md           # Documentation (this file)
```

---

## 🔑 Environment Variables

Create a `.env` file in the root workspace directory (copied from `.env.example`):

```ini
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=reservia
JWT_SECRET=super_secret_jwt_key_change_me
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_change_me

```

---

## 🚀 Getting Started

The recommended way to boot the complete stack (Database, API, and Frontend) is via Docker:

### 1. Installation & Booting (Docker Compose)
From the root directory, run:
```bash
docker compose up -d --build
```
This automatically downloads PostgreSQL, compiles both apps, sets up the database schema, and starts the servers:
* **Frontend Portal**: [http://localhost:3001](http://localhost:3001)
* **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
* **API Documentation (Swagger)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### 2. Database Seeding
To seed test data (sample catalog services, user profiles, admin, and active bookings):
```bash
docker exec -it reservia-api npm run seed
```

---

## 💾 Database Setup & Migrations

* **Schema Sync**: On initialization, NestJS TypeORM dynamically synchronizes the schema based on entity mappings (`synchronize: true`), making traditional manual migrations unnecessary for local setup.
* **Seed Script**: Real mock entities (admin, customer users, services, initial appointments) are populated via `backend/src/seed.ts`.

---

## 📖 API Documentation

Reservia is configured with Swagger. Navigate to:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

This interactive panel allows you to check and execute all endpoints, parameters, and headers (such as Bearer JWT Authentication headers).

---

## 🧠 Assumptions Made

1. **Guest Claims on Login**: Guests booking appointments anonymously have their booking UUIDs saved in `localStorage`. When they log in or register during that session, the frontend automatically updates the database to associate those guest bookings with their newly logged-in user profile.
2. **Double-booking Prevention**: A partial database unique index ensures that no two active bookings (`status != 'CANCELLED'`) can coexist for the same service, date, and timeslot.
3. **Cancellation instead of deletion**: Customer bookings cannot be hard-deleted from the database. Instead, they are set to `CANCELLED` to preserve audit records.
4. **Service Deletion Restriction**: Deleting services is prohibited to avoid breaking historical active booking relations. Instead, services can be marked `isActive: false` (inactive) to hide them from the booking screen without breaking history.

---

## 🔮 Future Improvements

1. **Email OTP Verification**: Require guest bookings to be verified using a one-time passcode before linking them to any account.
2. **Calendar Integrations**: Synchronize appointments with external platforms (Google Calendar, Outlook).
3. **Advanced Filtering**: Add paginated sorting, service category filtering, and status history logs in the Admin Dashboard.
