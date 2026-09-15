# QuestionBank – working notes

pnpm monorepo, two Cloudflare Workers. See README.md for the architecture overview.

## Commands

- `pnpm check` – run before considering work done (lint, format, typecheck, tests).
- `pnpm --filter @qb/api test` / `pnpm --filter @qb/web test` – package tests.
- `pnpm test:e2e` – Playwright; needs `pnpm db:migrate && pnpm db:seed` first (tests rely on `apps/api/seeds/dev.sql`).
- After editing `apps/api/src/db/schema/*`: `pnpm db:generate`, review the SQL, then `pnpm db:migrate`. Never edit a migration that has been applied anywhere. For SQLite table rebuilds, drizzle-kit may copy newly added columns from the old table (`SELECT "new_col" …` silently yields the string literal) — trim the INSERT to existing columns, as in `0001_submission_proposals.sql`.
- Triggers (and other SQL drizzle-kit can't model) go in a custom migration: `pnpm --filter @qb/api exec drizzle-kit generate --custom --name=<name>`, separated with `--> statement-breakpoint` as in `0003_engagement_triggers.sql`. `wrangler d1` and the Vitest pool both split `BEGIN … END` trigger bodies correctly.
- After editing a `wrangler.jsonc`: `pnpm --filter <pkg> cf-typegen`.

## Conventions

- API contracts (request/response shapes) live in `packages/shared` as Zod schemas. The API validates with them, clients consume the inferred types. Browser code imports constants from `@qb/shared/constants` so Zod stays out of the client bundle.
- API layering: `routes/` (createRoute + validation, thin) → `services/` (logic, DB, R2). Throw `AppError` for expected failures; errors are `{ error: { code, message, details? } }`.
- API routes are versioned under `/api/v1`; Better Auth owns `/api/auth/*`.
- Bindings are per request: build DB/auth from `c.env` in middleware, never as module-level singletons.
- `submissions.like_count`, `dislike_count` and `pending_report_count` are maintained by triggers: write to `submission_votes` / `submission_reports`, never to the counters. View counters are bumped with raw SQL so `updated_at` doesn't change.
- Only protected routes look up sessions (`requireAuth`); public reads must stay session-free.
- Web: data loading happens in loaders/actions via `apiFetch` (`app/lib/api.server.ts`), never directly against D1/R2. Server-only modules end in `.server.ts`.
- UI uses shadcn/ui components in `app/components/ui` (add with `pnpm dlx shadcn@latest add <name>` from `apps/web`).
- Every new API route gets an integration test in `apps/api/test`; user-facing flows get a Playwright test.
