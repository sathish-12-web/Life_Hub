# LIFEHUB — Project Overview and Setup Guide

One app to organize everyday life: tasks, events, expenses, notes, documents and shared spaces.
Stack: React, Redux Toolkit, Tailwind CSS, Node.js, Express, PostgreSQL, Prisma.

This file is the single source of truth for scope, database design and setup. The coding rules for Antigravity are in `AGENTS.md`.

---

## 1. What we are building

LIFEHUB replaces separate apps for reminders, calendar, expenses, notes and shared lists with one workspace.

**Principles:** useful without AI, private by default, modular, mobile-friendly, and honest automation (always preview and confirm).

**Target users:** students, employees, freelancers, families, small teams.

## 2. Scope

### MVP (build this first)

| Module | Capabilities |
| --- | --- |
| Accounts | Register, login, logout, profile, bcrypt hashing, JWT access + refresh |
| Dashboard | Today's tasks, upcoming events, monthly expense summary, recent activity |
| Tasks | Create, edit, complete, delete; due date, priority, status, tags |
| Planner | Events, reminders, basic recurrence |
| Expenses | Income/expense entries, categories, date filters, monthly totals |
| Notes | Create, edit, full-text search, archive |
| Quick Capture | One text box; rule-based parsing; user confirms type and fields before saving |
| Settings | Profile, timezone, notification preferences, account controls |

### Later (only after MVP is deployed)

Shared spaces with roles, document vault (files in object storage), Socket.IO live updates, email reminders, CSV import/export, AI extraction.

## 3. Folder structure

```text
lifehub/
  AGENTS.md
  PROJECT_OVERVIEW.md
  README.md
  docker-compose.yml
  .env.example
  .gitignore
  client/            React app (Vite)
    src/ app/ features/ components/ services/ hooks/ utils/
  server/            Express API
    prisma/ schema.prisma, migrations/, seed.js
    src/ config/ modules/ middleware/ validators/ utils/ app.js server.js
```

## 4. Database design (PostgreSQL)

| Table | Key columns | Notes |
| --- | --- | --- |
| users | id, name, email (unique), password_hash, timezone, created_at | Lowercase emails |
| tasks | id, owner_id, space_id?, title, description, status, priority, due_at, tags, created_at | status/priority are enums |
| events | id, owner_id, space_id?, title, start_at, end_at, reminder_at, recurrence_rule? | end_at >= start_at |
| transactions | id, owner_id, type, amount, currency, category, occurred_at, note | amount NUMERIC(12,2) |
| notes | id, owner_id, space_id?, title, body, tags, archived_at, search_vector | Full-text search (GIN) |
| spaces | id, name, owner_id, created_at | Phase 2 |
| space_members | id, space_id, user_id, role, joined_at | UNIQUE (space_id, user_id) |
| files | id, owner_id, space_id?, storage_key, original_name, mime_type, size_bytes, created_at | Phase 2 |
| activity_logs | id, actor_id, space_id?, action, resource_type, resource_id, created_at | Append-only |

Rules: UUID primary keys, `timestamptz` for all times, foreign keys with `ON DELETE`, indexes on `(owner_id, status, due_at)` and `(owner_id, occurred_at)`. Prisma maps these tables; the SQL equivalent for the core tables is in the blueprint document.

Authorization: personal data is always filtered by `owner_id` from the JWT. Shared data is checked through `space_members` and role.

## 5. API summary

| Area | Endpoints |
| --- | --- |
| Auth | POST /api/auth/register, /login, /logout, GET /api/auth/me |
| Tasks | GET, POST /api/tasks; GET, PATCH, DELETE /api/tasks/:id |
| Events | GET, POST /api/events; PATCH, DELETE /api/events/:id |
| Transactions | GET, POST /api/transactions; PATCH, DELETE /api/transactions/:id; GET /api/transactions/summary?month=YYYY-MM |
| Notes | GET /api/notes?q=; POST /api/notes; PATCH, DELETE /api/notes/:id |
| Capture | POST /api/capture/preview, POST /api/capture/confirm |
| Health | GET /api/health (also pings the database) |

All list endpoints are paginated (`?page=1&limit=20`).

## 6. Roadmap

| Sprint | Deliverable | Done when |
| --- | --- | --- |
| 1 | Repo, React shell, Express, Docker Postgres, Prisma first migration | Client, server and DB start locally |
| 2 | Register/login, profile, protected routes | Auth works; bad credentials handled |
| 3 | Tasks CRUD + dashboard | Users cannot access each other's tasks (tested) |
| 4 | Planner / events | Events created, edited, shown by date |
| 5 | Expenses and reports | Monthly totals come from SQL and match rows |
| 6 | Notes with search + Quick Capture MVP | Preview is editable and confirmed before saving |
| 7 | Tests, security, responsive polish | Core flows tested; mobile usable |
| 8 | Deployment, README, demo, seed data | Live link, screenshots, setup steps |

**First milestone (vertical slice):** register/login, dashboard, create a task, edit/complete it, and prove user B cannot access user A's task.

---

# Setup Guide

## 7. Install prerequisites

| Tool | Version | Check command |
| --- | --- | --- |
| Node.js | current LTS (20 or newer) | `node -v` |
| npm | comes with Node | `npm -v` |
| Git | any recent | `git --version` |
| Docker Desktop | recommended for the database | `docker --version` |
| Antigravity | your IDE | open the project folder |

## 8. Install PostgreSQL

Pick **one** option. Option A (Docker) is recommended because the whole team gets the same database with one command, and nothing is installed on your system.

### Option A — Docker (recommended)

1. Install and start Docker Desktop.
2. In the project root create `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16
    container_name: lifehub-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: lifehub
      POSTGRES_PASSWORD: change_me
      POSTGRES_DB: lifehub
    ports:
      - "5432:5432"
    volumes:
      - lifehub_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lifehub -d lifehub"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  lifehub_pgdata:
```

3. Start it:

```bash
docker compose up -d
docker compose ps
```

The `db` service should show as `healthy`.

4. Create the test database (used by automated tests):

```bash
docker compose exec db createdb -U lifehub lifehub_test
```

5. Open a SQL shell any time:

```bash
docker compose exec db psql -U lifehub -d lifehub
```

Useful commands: `docker compose stop` (stop, keep data), `docker compose down` (remove container, keep data), `docker compose down -v` (also deletes all data).

### Option B — Install PostgreSQL directly

**Windows**

1. Download the PostgreSQL 16 installer from https://www.postgresql.org/download/windows/ and run it.
2. Keep the defaults (port 5432). Set a password for the `postgres` superuser and remember it. Pgadmin 4 is included.
3. Open "SQL Shell (psql)" from the Start menu, press Enter through the prompts, and enter the password.

**macOS (Homebrew)**

```bash
brew install postgresql@16
brew services start postgresql@16
psql postgres
```

**Ubuntu / Debian**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo -u postgres psql
```

**Create the app user and databases (Option B only)** — run inside psql:

```sql
CREATE USER lifehub WITH PASSWORD 'change_me' CREATEDB;
CREATE DATABASE lifehub OWNER lifehub;
CREATE DATABASE lifehub_test OWNER lifehub;
\q
```

`CREATEDB` is needed because Prisma creates a temporary shadow database when running `prisma migrate dev`.

### Check that the database works

```bash
psql "postgresql://lifehub:change_me@localhost:5432/lifehub" -c "SELECT version();"
```

If `psql` is not installed locally (Docker users), use `docker compose exec db psql -U lifehub -d lifehub -c "SELECT 1;"`.

## 9. Create the project

```bash
mkdir lifehub && cd lifehub
git init
```

Add `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
coverage/
uploads/
.DS_Store
```

### Server

```bash
mkdir server && cd server
npm init -y
npm pkg set type=module
npm install express cors helmet cookie-parser jsonwebtoken bcrypt zod express-rate-limit dotenv @prisma/client
npm install -D prisma nodemon eslint prettier vitest supertest
npm pkg set scripts.dev="nodemon src/server.js" scripts.start="node src/server.js" scripts.test="vitest run" scripts.lint="eslint ."
cd ..
```

If `bcrypt` fails to build on Windows, use `bcryptjs` instead (same API, pure JavaScript).

### Client

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install react-router-dom @reduxjs/toolkit react-redux recharts
```

Add Tailwind CSS by following the official guide for Vite at https://tailwindcss.com/docs (the setup steps differ between Tailwind versions, so use the guide for the version you install).

## 10. Environment variables

Create `.env.example` in the project root (commit this) and copy it to `server/.env` (never commit):

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DATABASE_URL="postgresql://lifehub:change_me@localhost:5432/lifehub?schema=public"
TEST_DATABASE_URL="postgresql://lifehub:change_me@localhost:5432/lifehub_test?schema=public"

JWT_ACCESS_SECRET=replace_with_long_random_string
JWT_REFRESH_SECRET=replace_with_another_long_random_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 11. Set up Prisma and run the first migration

```bash
cd server
npx prisma init --datasource-provider postgresql
```

Then define the `User` and `Task` models in `prisma/schema.prisma` (the first milestone only needs these two), and run:

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

`prisma studio` opens a browser view of your tables. Prisma's configuration changed between major versions, so if a command or file differs from this guide, follow the Prisma docs for your installed version: https://www.prisma.io/docs

Day-to-day commands:

| Task | Command |
| --- | --- |
| Create/apply a migration | `npx prisma migrate dev --name <change>` |
| Apply migrations in production | `npx prisma migrate deploy` |
| View data | `npx prisma studio` |
| Seed sample data | `npx prisma db seed` (after configuring the seed command) |
| Reset dev DB (deletes data!) | `npx prisma migrate reset` |

## 12. Run the project

Terminal 1 (database): `docker compose up -d`
Terminal 2 (API): `cd server && npm run dev` → http://localhost:5000/api/health
Terminal 3 (UI): `cd client && npm run dev` → http://localhost:5173

## 13. Using this with Antigravity

1. Open the `lifehub` folder as the workspace in Antigravity.
2. Keep `AGENTS.md` and `PROJECT_OVERVIEW.md` in the repository root. Antigravity reads `AGENTS.md` (or `GEMINI.md`) from the workspace root at the start of a session. If you also create a `GEMINI.md`, it takes precedence when rules conflict, so keep one source of truth.
3. Work sprint by sprint. Example first prompt:

> Read AGENTS.md and PROJECT_OVERVIEW.md. We are on Sprint 1 only. Make a plan first: create the client and server folders, docker-compose.yml, .env.example, an Express server with GET /api/health that pings the database, and the first Prisma migration. Do not start Sprint 2. Wait for my approval of the plan.

4. Review the plan before approving. Check every command the agent wants to run, especially anything that touches the database or deletes files. Prefer the setting that asks for your review before terminal commands run.
5. After each task, ask: "Run lint and tests, show the result, and give me a commit message." Commit small and often.
6. Never paste real secrets into the chat.

Suggested prompts per sprint:

| Sprint | Prompt idea |
| --- | --- |
| 2 | "Implement register, login, logout and /me with bcrypt, JWT access token and httpOnly refresh cookie, Zod validation and rate limiting, plus tests." |
| 3 | "Implement tasks CRUD filtered by owner_id from the JWT, pagination, and tests proving user B cannot read, edit or delete user A's tasks." |
| 5 | "Implement transactions CRUD and a monthly summary endpoint using SQL aggregates through Prisma; add tests with known totals." |
| 6 | "Add notes with Postgres full-text search and a rule-based Quick Capture preview/confirm flow." |

## 14. Troubleshooting

| Problem | Fix |
| --- | --- |
| `ECONNREFUSED 127.0.0.1:5432` | Database is not running. Run `docker compose up -d` (or start the PostgreSQL service). |
| `password authentication failed` | The password in `DATABASE_URL` does not match. With Docker, if you changed the password after first start, run `docker compose down -v` and start again (this deletes data). |
| Port 5432 already in use | Another PostgreSQL is running. Stop it, or change the compose mapping to `"5433:5432"` and use port 5433 in the URLs. |
| `permission denied to create database` (Prisma) | Give the user `CREATEDB`: `ALTER USER lifehub CREATEDB;` |
| `bcrypt` install fails | Use `bcryptjs`, or install the build tools for your OS. |
| CORS error in the browser | Set `CLIENT_URL` correctly and restrict CORS to that origin only. |
| Migration drift error | Do not edit the DB by hand. In development only, `npx prisma migrate reset` (deletes data). |

## 15. Deployment notes (Sprint 8)

- Database: a managed PostgreSQL service (for example Neon, Supabase or Render). Use its connection string as `DATABASE_URL` and require SSL.
- API: deploy `server/` to Render, Railway or Fly.io; run `npx prisma migrate deploy` on release.
- Client: deploy `client/` to Vercel or Netlify with the API URL set as an environment variable.
- Put the live link, screenshots, ER diagram and test-account details at the top of the README.

## 16. Portfolio checklist

- [ ] README with live link, screenshots, tech stack and 5-command setup
- [ ] ER diagram and migrations folder committed
- [ ] API docs (OpenAPI or Postman collection)
- [ ] Authorization tests (user A vs user B) passing in GitHub Actions
- [ ] Seed script and demo account
- [ ] "Trade-offs" section: why PostgreSQL, what you would improve next
- [ ] Resume bullet only for features that are built and tested
