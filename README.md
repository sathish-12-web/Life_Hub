# LIFEHUB — Personal Workspace

> One app to organize everyday life: tasks, planner/events, expenses, notes, documents, and shared spaces.

LIFEHUB is a modular personal productivity system built with **React**, **Redux Toolkit**, **Tailwind CSS**, **Node.js / Express**, and **PostgreSQL** via **Prisma ORM**.

---

## Current Status: Milestone 1 / Sprint 3 Complete (Tasks CRUD & Dashboard)

- [x] **Sprint 1 (Foundation):** Express server, Prisma migrations, PostgreSQL integration, and React client shell.
- [x] **Sprint 2 (Authentication):**
  - Registration with Zod validation, unique lowercase email check, and bcrypt password hashing.
  - Login with brute-force rate limiting and non-revealing error messages.
  - Dual-token auth: short-lived JWT access token in memory + httpOnly refresh cookie.
  - Protected route middleware (`authenticate.js`) and user profile retrieval (`GET /api/auth/me`).
- [x] **Sprint 3 (Tasks CRUD & Dashboard - First Milestone Vertical Slice):**
  - Full task lifecycle (create, paginated list, filter by status/priority, edit, complete, delete).
  - Strict user isolation tests: User B cannot access, read, modify, or delete User A's tasks (returning 404 Not Found to prevent ID enumeration).
  - Dashboard overview metrics (Total, To Do, In Progress, Completed, Overdue).
  - Interactive React interface with filter tabs, priority indicators, tags, and modal dialogs.

---

## Tech Stack

- **Client:** React 19, Redux Toolkit, Tailwind CSS v4, React Router DOM, Recharts, Vite
- **Server:** Node.js (v22+), Express 5, Prisma 7, Zod, Helmet, CORS, Cookie-parser, bcryptjs, jsonwebtoken, express-rate-limit
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
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
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
npm test        # Runs Vitest test suite (24 passing tests)
npm run lint    # Runs ESLint (0 errors, 0 warnings)
```

### Client:
```bash
cd client
npm run build   # Production bundle verification
```

---

## API Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies API runtime and PostgreSQL database connection | No |
| `POST` | `/api/auth/register` | Register new user, hashes password, sets refresh cookie | No (Rate-limited) |
| `POST` | `/api/auth/login` | Authenticate user, returns access token + refresh cookie | No (Rate-limited) |
| `POST` | `/api/auth/logout` | Clears refresh token cookie and ends session | No |
| `POST` | `/api/auth/refresh` | Issues fresh access token using valid httpOnly cookie | No |
| `GET` | `/api/auth/me` | Fetches current user profile from verified JWT | Yes (Bearer token) |
| `GET` | `/api/tasks` | Paginated task list with status, priority, and sorting filters | Yes (Bearer token) |
| `GET` | `/api/tasks/stats` | Aggregated dashboard stats (total, todo, in-progress, done, overdue) | Yes (Bearer token) |
| `POST` | `/api/tasks` | Create a new task assigned to authenticated user | Yes (Bearer token) |
| `GET` | `/api/tasks/:id` | Retrieve single task owned by user (404 for other users) | Yes (Bearer token) |
| `PATCH` | `/api/tasks/:id` | Update task details or toggle status (404 for other users) | Yes (Bearer token) |
| `DELETE` | `/api/tasks/:id` | Delete task owned by user (404 for other users) | Yes (Bearer token) |

---

## Database Schema (Initial Migration: `init`)

- **`users`**: `id` (UUID), `name`, `email` (unique), `password_hash`, `timezone`, `created_at`, `updated_at`
- **`tasks`**: `id` (UUID), `owner_id` (FK -> users), `title`, `description`, `status` (`TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `due_at`, `tags`, `created_at`, `updated_at`
