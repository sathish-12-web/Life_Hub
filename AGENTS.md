# AGENTS.md — LIFEHUB project rules

Read this file fully before every task. Also read PROJECT_OVERVIEW.md for scope, schema and setup.

## 1. Project in one paragraph

LIFEHUB is a personal workspace app (tasks, planner/events, expenses, notes, quick capture; shared spaces and a document vault come later). Stack: React + Redux Toolkit + Tailwind (client), Node.js + Express (server), PostgreSQL via Prisma. It is a GitHub portfolio project, so code quality, tests and documentation matter as much as features.

## 2. How to work (process rules)

1. Work on ONE sprint or ONE task at a time, in the order given in PROJECT_OVERVIEW.md. Do not build features from later sprints.
2. Before writing code, produce a short plan (files to create or change, commands to run) and wait for approval on anything that changes the database schema, auth, or dependencies.
3. Keep changes small and focused. One logical change per commit. Suggest a commit message in the form `type(scope): summary` (feat, fix, test, docs, chore, refactor).
4. After each task, run lint and tests and report the result. Never say something works unless you ran it.
5. If a requirement is unclear, ask a short question instead of guessing.
6. Do not add libraries that are not in the approved stack without asking and giving a reason.
7. Do not claim a feature is done if it is partly built. List what is missing.

## 3. Safety rules for commands and files

- Never run destructive commands (drop database, `prisma migrate reset`, `rm -rf`, `git reset --hard`, force push) without explicit approval in the chat.
- Never read, print, edit or commit `.env`. Only edit `.env.example`, and never put real secrets in it.
- Never commit `node_modules`, build output, uploaded files or real user data.
- Run the app only against the local development database or the test database, never a production database.
- Do not install global packages. Install dependencies inside `client/` or `server/`.

## 4. Repository layout

```text
lifehub/
  AGENTS.md
  PROJECT_OVERVIEW.md
  docker-compose.yml
  .env.example
  client/src/   app/ features/ components/ services/ hooks/ utils/
  server/
    prisma/     schema.prisma, migrations/, seed.js
    src/        config/ modules/ middleware/ validators/ utils/ app.js server.js
```

- Frontend features live in `client/src/features/<name>/` (components, slice, api calls together).
- Backend features live in `server/src/modules/<name>/` with `routes`, `controller`, `service`, `schema` (Zod) files.

## 5. Backend rules

- Keep controllers thin: parse request, call a service, send response. Business rules go in services.
- Validate every request body, query and param with Zod before use.
- Use one centralized error handler and one response shape:
  - success: `{ "data": ..., "meta": { ... } }`
  - error: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`
- Use correct HTTP status codes (201 create, 204 delete, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict).
- Paginate every list endpoint (`?page=1&limit=20`, max limit 100) and allowlist sort fields.
- Never return `password_hash`, refresh tokens or storage keys.
- Use `async/await`, no callbacks. Wrap async route handlers so errors reach the central handler.
- Read configuration only from environment variables through `server/src/config/`.

## 6. Authentication and authorization rules (highest priority)

- Hash passwords with bcrypt. Lowercase and trim emails before saving.
- The user id MUST come from the verified JWT, never from the request body, query or params.
- Every query on personal data MUST filter by `owner_id` (or `ownerId` in Prisma). Never fetch by `id` alone.
- Return 404 (not 403) when a user requests another user's resource, so ids are not revealed.
- For shared resources, check active membership and role in `space_members` on every endpoint.
- Rate-limit login and register. Configure CORS to the client origin only.
- Every module that has data MUST have tests proving user A cannot read, update or delete user B's data.

## 7. Database rules (PostgreSQL + Prisma)

- The schema is defined in `server/prisma/schema.prisma`. Every schema change is a committed Prisma migration. Never edit the database by hand.
- Use UUID primary keys, `timestamptz` timestamps, foreign keys with explicit `onDelete`, and indexes for owner, date and status filters.
- Money columns use `Decimal(12,2)`, never `Float`. Validate `amount > 0`.
- Use enums for status, priority, transaction type and space role.
- Use transactions (`prisma.$transaction`) when more than one write must succeed together.
- Use Prisma queries or parameterized raw queries (`$queryRaw` with template literals). Never build SQL by string concatenation.
- Reports (monthly totals, category totals) must be calculated in the database with aggregates, not by looping in JavaScript.
- Tests run against `TEST_DATABASE_URL`, never the development database.
- Provide a seed script with safe sample data and one demo user. Never seed real personal data.
- Prisma setup differs between major versions. Check the official Prisma docs for the installed version before changing configuration.

## 8. Frontend rules

- React function components and hooks only. One component per file, PascalCase names.
- Redux Toolkit for auth and shared state. Keep local UI state in the component.
- All API calls go through `client/src/services/api.js` (one client with the base URL and auth handling). No `fetch` calls scattered in components.
- Tailwind CSS for styling. Mobile-first and responsive down to 360px width.
- Every data screen needs loading, empty and error states.
- Forms: validate on the client for convenience, but the server is the source of truth.
- Basic accessibility: labels on inputs, button text, keyboard focus visible, sufficient contrast.
- Never store passwords or long-lived tokens in `localStorage`. Prefer httpOnly cookies for the refresh token.

## 9. Code style

- JavaScript (ES modules). Add TypeScript only if the owner asks.
- ESLint + Prettier are the source of truth. Run `npm run lint` and `npm run format` before finishing a task.
- Names: camelCase for variables and functions, PascalCase for components, kebab-case for file names except components, snake_case for database columns (map in Prisma with `@map`).
- Functions should be short and do one thing. Add a comment only to explain why, not what.
- No `console.log` left in committed code. Use the logger in `server/src/utils/`.
- No dead code, no commented-out blocks, no TODOs without an issue note.

## 10. Testing rules

- Server: Vitest or Jest + Supertest. Test: happy path, validation errors, unauthenticated, wrong-owner access, and role checks.
- Client: Vitest + React Testing Library for key forms and flows.
- A task is not done until its tests pass locally. Add or update tests in the same change as the feature.
- GitHub Actions must run lint and tests against a PostgreSQL service container.

## 11. Documentation rules

- Keep README.md accurate: what it is, screenshots, tech stack, setup in 5 commands, env variables, scripts, API summary, ER diagram, live demo link.
- When an endpoint is added or changed, update the API docs (OpenAPI file or Postman collection) in the same change.
- When the schema changes, update the ER diagram and the schema section in PROJECT_OVERVIEW.md.
- Only list features in the README and resume text that are implemented and tested.

## 12. Scope guard

- MVP first: auth, tasks, planner, expenses, notes, quick capture (rule-based), settings.
- Do NOT start shared spaces, document vault, real-time, email reminders or AI features until the MVP is deployed and the owner says so.
- Quick Capture must always show a preview and require user confirmation before saving. Never create financial transactions or send messages automatically.

## 13. Definition of done (for every task)

1. Code runs locally with `docker compose up -d` and the documented scripts.
2. Lint passes and tests pass (state the commands you ran and the result).
3. Authorization is covered by a test for any new data endpoint.
4. No secrets, `.env` or personal data in the diff.
5. Docs updated (README, API docs, schema notes) where relevant.
6. A suggested commit message is provided.
