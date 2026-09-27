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
submission_analyses (submission_id, run_id, status, AI verdict + extracted values)
submission_votes (submission_id, user_id, value ±1)
submission_reports (id, submission_id, reporter_id, reason, details, status: pending | resolved | dismissed)

user (Better Auth) + role: user | admin
```

PDFs live in R2 under `file_key`. A question is listed once it has at least one submission.

Sign-in is Google-only (`/login`, Better Auth's `sign-in/social`); the account is created on the first sign-in, and Google reports whether the email is verified, and new users are stored that way. `pnpm import-legacy` marks imported users verified, so their first Google sign-in with the same email links to the imported account (Better Auth only links to verified users). Signed-in users manage their account at `/account` (name and photo; the name through Better Auth's `update-user` endpoint) and their uploads at `/account/submissions` (backed by `/api/v1/me/submissions`). Uploaders can preview their own PDFs in any status and withdraw submissions that aren't published yet; published papers stay in the bank. Profile images are cropped to a square in the browser (`AvatarInput`, react-easy-crop) and re-encoded as WebP at up to 512 px before upload, so the file that reaches the API is small; they are stored in R2 (JPEG, PNG or WebP, max 2 MB) and served from `/api/v1/avatars/{id}`. A new user's Google photo is copied the same way when the account is created (full size, which is Google's URL without its `=s96-c` size option, falling back to the size Google sent). If both downloads fail, the user keeps Google's URL.

Engagement on published papers:

- **Views** — question pages and papers count their views separately (`POST …/views`, open to everyone, no deduplication yet).
- **Votes** — signed-in users like or dislike a paper (not their own). SQLite triggers in `migrations/0001_triggers.sql` keep `like_count` / `dislike_count` in sync. A question's papers are ranked by score (likes − dislikes), then views, then newest; the top paper opens by default.
- **Reports** — signed-in users report a problem (one open report per user per paper) for admin review. A trigger counts open reports and moves a published paper back to `pending_review` (hidden) at 3 (`REPORT_HIDE_THRESHOLD`). Admins resolve or dismiss reports in the admin panel; that doesn't publish a hidden paper again, which is a separate decision.

Semester names have a strict format: a term (Spring, Summer, Fall or Short) and a two-digit year from 15 to 30, e.g. `Fall 25`. `parseSemesterName` (`@qb/shared/constants`) turns other spellings such as "fall 2025" into the standard one; uploads, admin edits, the catalog and the AI analysis all go through it, and anything else is rejected. Semesters sort newest first by year, then Fall, Summer, Spring, Short.

When contributing, department, course and semester can each be an existing value or a new name. If every value exists, the submission is linked to its question (created on demand). A new name that matches an existing value (ignoring case; departments also by short name, courses only within the chosen department) uses the existing value. If any value is still new, `question_id` stays null and the proposed values are stored on the submission until an admin creates them. A CHECK constraint enforces that a submission has exactly one of these shapes.

## AI analysis of uploads

Every upload is checked in the background. The API enqueues a message on the `qb-submission-analysis` Cloudflare Queue; its queue handler (`services/analysis.ts`) reads the PDF from R2, compresses it with the PDF processor API (only to cut AI cost; the compressed copy isn't stored) and sends it to Gemini in one `generateContent` call, together with the existing departments, courses, semesters and exam types. Gemini answers whether the file is a question paper, how many papers it contains, and the department (full name), course, semester, exam type, section and batch from its header. Names are matched to catalog entries or standardized (`normalizeCatalogName`: "and" instead of "&", single spaces, no trailing punctuation) — the same spelling rule applies to names typed by uploaders and admins. Failed runs retry up to 3 times.

**Auto-publishing.** The check that runs right after upload publishes the paper on its own when the AI finds exactly one question paper and reads the same department, course, semester and exam type (the same existing catalog entries, character for character) that the paper is filed under. Papers with new entries or reports, and re-runs started by an admin, are never auto-published. `submissions.auto_published_at` records it until an admin changes the status.

**Uploaders** follow their papers at `/account/submissions` (cards) and `/account/submissions/{id}`: a timeline (uploaded → AI check → decision), what the AI said and read next to what they chose, and whether it was auto-published or is waiting for an admin (`/api/v1/me/submissions/{id}`). Uploading leads straight to that page, which refreshes while the check runs. While a paper waits for review, its uploader can fix the details ("Use the AI's details" or "Edit my details", `PUT /api/v1/me/submissions/{id}/classification`); the new details are compared with the AI's earlier reading and the paper is published right away if they now match.

The questions list shows the newest papers first by default (`sort=newest`), or the most viewed (`popular`) or A–Z (`az`). Course names get the standard spelling for numbered parts ("Physics I", not "Physics-I"); `pnpm import-legacy` applies the same spelling to imported names, skipping any that would clash with a course already in the department.

Otherwise results only flag, never reject: the admin list shows an AI badge and can filter by "Flagged by AI" (not a paper, several papers) or "AI disagrees". The review page shows the AI's values next to the submitted ones, **Apply AI values** prefills the classification dialog with them, and **Re-run** starts a new analysis.

Configuration: `GEMINI_MODEL` and `PDF_PROCESSOR_URL` in `apps/api/wrangler.jsonc`, secrets `GEMINI_API_KEY` and `COMPRESSOR_API_KEY` (`.dev.vars` locally; without them runs fail as "not configured"). See [Deploying](#deploying) for the production setup. Tests never call the real services.

## Watermarked public PDFs

Whenever a paper is published (by an admin, by the AI check, or after its uploader fixes the details), the API queues it on `qb-pdf-watermark`. The handler (`services/watermark.ts`) sends the original to the PDF processor's `watermark-compress` endpoint. That endpoint puts a credit line on top of every page ("diuqbank.com | Shared by <contributor>", ASCII only because the processor uses a standard PDF font) and compresses the file. The handler stores the result in R2 as `watermarked/{id}.pdf`. The original under `file_key` is never changed.

- **Public route** `/api/v1/submissions/{id}/file` serves the watermarked copy. Until the copy is ready, or if watermarking failed, it serves the original, cached for 5 minutes instead of a day. Public file sizes are those of the copy.
- **Originals:** the admin and uploader file routes keep serving the original.
- **Admins:** the review page shows the state of the public copy and can **Redo the watermark**, e.g. after a contributor renames themselves. **Watermark missing PDFs** on the submissions list queues every published paper without a copy, which is how existing papers get one.

## Admin panel

Users with the `admin` role get an **Admin panel** entry in the account menu, leading to `/admin`. The panel has its own shell, built from shadcn's `dashboard-01` block: a collapsible sidebar, a top bar with breadcrumbs, cards, tabs, tables with row menus, and toasts for results (everyone else gets a 404 there, and the API answers 403 under `/api/v1/admin/*`):

- **Dashboard** — queue sizes, uploads over the last 30 days, submissions by status, the newest pending papers and open reports.
- **Submissions** — every paper by status. The review page shows the PDF (in any status) next to the decision (publish, reject, back to review, delete), its classification, uploader and reports. A paper that proposes new entries can't be published until an admin approves them: "Review entries" creates the new department, course or semester (or maps them to existing ones) and files the paper under its question. The same dialog corrects a paper filed under the wrong details.
- **Reports** — open, resolved and dismissed reports with the paper they're about.
- **Catalog** — add, rename and delete departments, courses, semesters and exam types. Entries in use can be renamed but not deleted; a course keeps its department because questions depend on it.
- **Users** — search by name or email, and grant or remove admin rights. Admins can't change their own role, so there is always at least one.

`role` is a Better Auth additional field with `input: false`, so sign-up and `update-user` can't set it. To make yourself an admin, log in with Google once, then run `pnpm make-admin you@gmail.com` (add `--remote` for the deployed database). `pnpm db:seed` also adds an admin user without a login, for the e2e tests.

## Stack

| Area            | Choice                                                                                |
| --------------- | ------------------------------------------------------------------------------------- |
| Runtime         | Cloudflare Workers (two workers, connected by a Service Binding)                      |
| API             | [Hono](https://hono.dev) + `@hono/zod-openapi` (OpenAPI 3.1 docs at `/api/docs`)      |
| Web             | [React Router v8](https://reactrouter.com) (SSR) + Tailwind CSS v4 + shadcn/ui        |
| Database        | Cloudflare D1 (SQLite) via [Drizzle ORM](https://orm.drizzle.team)                    |
| File storage    | Cloudflare R2 (PDFs)                                                                  |
| Auth            | [Better Auth](https://better-auth.com) (Google OAuth, cookie sessions)                |
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
cp apps/api/.dev.vars.example apps/api/.dev.vars   # then set BETTER_AUTH_SECRET and the Google OAuth client
pnpm db:migrate                                    # create tables in the local D1 database
pnpm db:seed                                       # sample departments, courses, questions + PDFs
pnpm dev                                           # api on :8787, web on :5173
```

Google sign-in needs an OAuth client (Google Cloud Console → APIs & Services → Credentials → "Web application") with the redirect URI `http://localhost:5173/api/auth/callback/google`; `.dev.vars.example` has the details.

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

## Deploying

CI deploys `main` after lint, tests and e2e pass (the `deploy` job in `.github/workflows/ci.yml`): it applies the D1 migrations, deploys the API worker, then builds and deploys the web worker. Nothing in the repo names the production domain. The site's URL is the `SITE_URL` var of the API worker (auth origin, trusted origin, and the domain in PDF watermarks). It defaults to `http://localhost:5173`, and CI replaces it with the `SITE_URL` repository variable at deploy time. To move the site, change that variable, the custom domain and the Google redirect URI, then re-run the deploy.

One-time setup (the deploy job is skipped until `SITE_URL` is set):

1. Create the resources, from `apps/api` (after `pnpm exec wrangler login`):
   - `wrangler d1 create questionbank`, and put its id in `apps/api/wrangler.jsonc` (replacing the `0000…` placeholder)
   - `wrangler r2 bucket create questionbank-papers`
   - `wrangler queues create qb-submission-analysis` and `wrangler queues create qb-pdf-watermark`
2. Set the API secrets with `wrangler secret put <NAME>`: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GEMINI_API_KEY`, `COMPRESSOR_API_KEY`. They survive deploys, so CI never sees them.
3. Create a Cloudflare API token with Workers Scripts, D1, Workers R2 Storage and Queues edit permissions. In GitHub (Settings → Secrets and variables → Actions), add the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` and the variable `SITE_URL` (e.g. `https://example.com`, no trailing path).
4. Push to `main` (or re-run the latest CI run) to deploy. Then attach the domain in the dashboard: Workers & Pages → `questionbank-web` → Settings → Domains & Routes → Custom domain. The web worker's `wrangler.jsonc` has no `routes`, so deploys leave that domain alone.
5. Add `<SITE_URL>/api/auth/callback/google` to the Google OAuth client's redirect URIs, log in, and promote yourself with `pnpm make-admin <email> --remote`.

## Before going to production (later)

- Add rate limiting on the API.
- Add email change (with verification) and account deletion.
- Add caching for public pages and PDFs, a sitemap, and staging/production environments.
