# QuestionBank

A public question-paper bank. Anyone can browse and download papers; signed-in contributors will be able to upload PDFs, which are published after review.

## Data model

```
departments (id, name, short_name)      semesters (id, name)      exam_types (id, name)
     │
courses (id, name, department_id)
     │
questions (id, department_id, course_id, semester_id, exam_type_id, view_count)
     │   · unique (course_id, semester_id, exam_type_id)
     │   · FK (course_id, department_id) → courses (id, department_id),
     │     so a question's department always matches its course's department
     │
submissions (id, question_id?, status, file_key, file_size, uploader_id,
             department_id? | custom_department_name (+ custom_department_short_name),
             course_id? | custom_course_name, semester_id? | custom_semester_name, exam_type_id?)
         status: pending_review | published | rejected — only published PDFs are public
         like_count, dislike_count, pending_report_count — maintained by triggers; view_count
     │
submission_votes (submission_id, user_id, value ±1)
submission_reports (id, submission_id, reporter_id, reason, details, status: pending | resolved | dismissed)

user (Better Auth) + role: user | admin
```

PDFs live in R2 under `file_key`. A question is listed once it has at least one submission.

Signed-in users manage their account at `/account` (name and password, through Better Auth's `update-user` and `change-password` endpoints) and their uploads at `/account/submissions` (backed by `/api/v1/me/submissions`). Uploaders can preview their own PDFs in any status and withdraw submissions that aren't published yet; published papers stay in the bank. Profile images are cropped to a square in the browser (`AvatarInput`, react-easy-crop) and re-encoded as WebP at up to 512 px before upload, so the file that reaches the API is small; they are stored in R2 (JPEG, PNG or WebP, max 2 MB) and served from `/api/v1/avatars/{id}`.

Engagement on published papers:

- **Views** — question pages and papers count their views separately (`POST …/views`, open to everyone, no deduplication yet).
- **Votes** — signed-in users like or dislike a paper (not their own). SQLite triggers in `migrations/0003_engagement_triggers.sql` keep `like_count` / `dislike_count` in sync. A question's papers are ranked by score (likes − dislikes), then views, then newest; the top paper opens by default.
- **Reports** — signed-in users report a problem (one open report per user per paper) for admin review. A trigger counts open reports and moves a published paper back to `pending_review` (hidden) at 3 (`REPORT_HIDE_THRESHOLD`). Admins resolve or dismiss reports in the admin panel; that doesn't publish a hidden paper again, which is a separate decision.

When contributing, department, course and semester can each be an existing value or a new name. If every value exists, the submission is linked to its question (created on demand). A new name that matches an existing value (ignoring case; departments also by short name, courses only within the chosen department) uses the existing value. If any value is still new, `question_id` stays null and the proposed values are stored on the submission until an admin creates them. A CHECK constraint enforces that a submission has exactly one of these shapes.

## Admin panel

Users with the `admin` role get an **Admin panel** entry in the account menu, leading to `/admin`. The panel has its own shell, built from shadcn's `dashboard-01` block: a collapsible sidebar, a top bar with breadcrumbs, cards, tabs, tables with row menus, and toasts for results (everyone else gets a 404 there, and the API answers 403 under `/api/v1/admin/*`):

- **Dashboard** — queue sizes, uploads over the last 30 days, submissions by status, the newest pending papers and open reports.
- **Submissions** — every paper by status. The review page shows the PDF (in any status) next to the decision (publish, reject, back to review, delete), its classification, uploader and reports. A paper that proposes new entries can't be published until an admin approves them: "Review entries" creates the new department, course or semester (or maps them to existing ones) and files the paper under its question. The same dialog corrects a paper filed under the wrong details.
- **Reports** — open, resolved and dismissed reports with the paper they're about.
- **Catalog** — add, rename and delete departments, courses, semesters and exam types. Entries in use can be renamed but not deleted; a course keeps its department because questions depend on it.
- **Users** — search by name or email, and grant or remove admin rights. Admins can't change their own role, so there is always at least one.

`role` is a Better Auth additional field with `input: false`, so sign-up and `update-user` can't set it. `pnpm db:seed` creates a local admin (`admin@seed.local` / `correct-horse-battery`). To promote an existing account, sign up first, then run `pnpm make-admin you@example.com` (add `--remote` for the deployed database).

## Stack

| Area            | Choice                                                                                |
| --------------- | ------------------------------------------------------------------------------------- |
| Runtime         | Cloudflare Workers (two workers, connected by a Service Binding)                      |
| API             | [Hono](https://hono.dev) + `@hono/zod-openapi` (OpenAPI 3.1 docs at `/api/docs`)      |
| Web             | [React Router v8](https://reactrouter.com) (SSR) + Tailwind CSS v4 + shadcn/ui        |
| Database        | Cloudflare D1 (SQLite) via [Drizzle ORM](https://orm.drizzle.team)                    |
| File storage    | Cloudflare R2 (PDFs)                                                                  |
| Auth            | [Better Auth](https://better-auth.com) (email + password, cookie sessions)            |
| Shared contract | Zod schemas in `packages/shared`, used by the API, the web app and future mobile apps |
| Tests           | Vitest (API runs inside `workerd` with real local D1/R2), Testing Library, Playwright |
| Tooling         | pnpm workspaces, TypeScript, ESLint, Prettier, GitHub Actions                         |

## Project structure

```
apps/
  api/                    Hono worker: REST API + auth, owns D1 and R2
    src/
      app.ts              App composition (middleware, routes, OpenAPI docs)
      routes/             HTTP layer: route definitions + validation only
      services/           Business logic (DB + R2), called by routes
      db/schema/          Drizzle tables  → `pnpm db:generate` → migrations/
      lib/                auth, errors
      middleware/         per-request context, requireAuth
    migrations/           SQL migrations (generated by drizzle-kit, applied by wrangler)
    test/                 Integration tests running in workerd
  web/                    React Router SSR worker
    workers/app.ts        Worker entry: proxies /api/* to the API, renders everything else
    app/routes/           Pages (loaders/actions run on the server)
    app/components/       UI components (ui/ = shadcn/ui)
    app/lib/              *.server.ts = server-only helpers
    e2e/                  Playwright tests (spin up both workers)
packages/
  shared/                 Zod schemas, types and constants shared by all clients
```

### How requests flow

```
Browser ──► web worker ──(/api/*, Service Binding)──► api worker ──► D1 / R2
               │  SSR loaders/actions call the API the same way,
               └─ forwarding the user's cookies
Mobile app ─────────────────────────────────────────► api worker
```

The browser only ever talks to the web origin, so auth cookies are first-party and no CORS is needed. Native apps will call the API worker directly using the OpenAPI spec.

## Getting started

Prerequisites: Node.js 22.22+ (see `.nvmrc`) and pnpm 11 (`corepack enable`).

```bash
pnpm install
cp apps/api/.dev.vars.example apps/api/.dev.vars   # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:migrate                                    # create tables in the local D1 database
pnpm db:seed                                       # sample departments, courses, questions + PDFs
pnpm dev                                           # api on :8787, web on :5173
```

Open http://localhost:5173. API docs are at http://localhost:8787/api/docs.

Everything (D1, R2, secrets) runs locally through Wrangler/Miniflare; local data lives in `apps/api/.wrangler/state`. No Cloudflare account is needed until deployment.

> The web worker reaches the API through Wrangler's local dev registry. If the very first page load shows "Network connection lost", the API was still starting — refresh once it logs `Ready on http://localhost:8787`.

## Common commands

| Command            | What it does                                                          |
| ------------------ | --------------------------------------------------------------------- |
| `pnpm dev`         | Run API and web workers locally                                       |
| `pnpm check`       | Lint + format check + typecheck + unit/integration tests              |
| `pnpm test`        | Unit and integration tests for every package                          |
| `pnpm test:e2e`    | Playwright end-to-end tests (needs `pnpm db:migrate && pnpm db:seed`) |
| `pnpm db:generate` | Generate a SQL migration after changing `apps/api/src/db/schema`      |
| `pnpm db:migrate`  | Apply pending migrations to the local D1 database                     |
| `pnpm db:seed`     | Reset local question data to the sample set, with an admin login      |
| `pnpm make-admin`  | Give an existing account the admin role (`<email> [--remote]`)        |
| `pnpm format`      | Format the codebase with Prettier                                     |

## Testing strategy

- **`packages/shared`** – unit tests for schemas.
- **`apps/api`** – integration tests call the real worker inside `workerd` with isolated per-file D1 and R2 storage (`@cloudflare/vitest-plugin`). Migrations are applied automatically.
- **`apps/web`** – unit/component tests with Vitest + Testing Library; Playwright covers full user journeys against both workers.
- **CI** (`.github/workflows/ci.yml`) runs all of the above on every push and pull request.

## Before going to production (later)

- Create real resources (`wrangler d1 create`, `wrangler r2 bucket create`) and put the D1 id in `apps/api/wrangler.jsonc`.
- Set `BETTER_AUTH_SECRET` with `wrangler secret put`, and update `BETTER_AUTH_URL` / `TRUSTED_ORIGINS` for the real domain.
- Add email verification and password reset (e.g. Cloudflare Email Service), rate limiting and Turnstile on auth forms.
- Promote the first admin with `pnpm make-admin <email> --remote` after signing up.
- Add email change (with verification) and account deletion.
- Add caching for public pages and PDFs, a sitemap, and staging/production environments.
