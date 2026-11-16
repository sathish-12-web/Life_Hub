# LIFEHUB — Personal Workspace

> One app to organize everyday life: tasks, planner/events, expenses, notes, documents, and shared spaces.

LIFEHUB is a modular personal productivity system built with **React**, **Redux Toolkit**, **Tailwind CSS**, **Node.js / Express**, and **PostgreSQL** via **Prisma ORM**.

---

## Current Status: Sprint 1 (Foundation & First Migration)

- [x] Repository initialized with Git and standard structure.
- [x] Express backend configured with ES Modules, centralized error handling, and security middlewares (Helmet, CORS, Cookie-parser).
- [x] PostgreSQL connection active via Prisma ORM (`@prisma/adapter-pg`).
- [x] Initial migration applied for core models: `User` and `Task`.
- [x] Health check endpoint `GET /api/health` live with automated test coverage.
- [x] React (Vite) client shell configured with Redux Toolkit and Tailwind CSS.

---

## Tech Stack

- **Client:** React 19, Redux Toolkit, Tailwind CSS v4, React Router DOM, Recharts, Vite
- **Server:** Node.js (v22+), Express 5, Prisma 7, Zod, Helmet, CORS, Cookie-parser, bcryptjs, jsonwebtoken
- **Database:** PostgreSQL 18 (Local Service or Docker)
- **Testing & Quality:** Vitest, Supertest, ESLint, Prettier

---

## Quick Start (Local Setup)

### 1. Prerequisites
- Node.js 20+ (`node -v`)
- PostgreSQL 16+ running locally on port 5432 (or via Docker: `docker compose up -d`)

### 2. Configure Environment
Copy `.env.example` to `server/.env`:
```bash
# In server/.env
DATABASE_URL="postgresql://lifehub:change_me@localhost:5432/lifehub?schema=public"
TEST_DATABASE_URL="postgresql://lifehub:change_me@localhost:5432/lifehub_test?schema=public"
```

### 3. Run Backend (API)
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 4. Run Frontend (Client)
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## Automated Tests & Linting

### Server:
```bash
cd server
npm test        # Runs Vitest test suite
npm run lint    # Runs ESLint
```

### Client:
```bash
cd client
npm run build   # Production bundle verification
```

---

## API Summary (Sprint 1)

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies API runtime and PostgreSQL database connection | 200 OK |

---

## Database Schema (Initial Migration: `init`)

- **`users`**: `id` (UUID), `name`, `email` (unique), `password_hash`, `timezone`, `created_at`, `updated_at`
- **`tasks`**: `id` (UUID), `owner_id` (FK -> users), `title`, `description`, `status` (`TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `due_at`, `tags`, `created_at`, `updated_at`
