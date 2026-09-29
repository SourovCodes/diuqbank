# QuestionBank – working notes

pnpm monorepo, one Cloudflare Worker: `apps/web` (React Router SSR) runs `@qb/api` (Hono, a library in `apps/api`) under `/api/*` and its queue handlers. `apps/mobile` is a Flutter app (Android + iOS) that calls `/api/v1`. The Worker config (bindings, vars, `.dev.vars`, local state) lives in `apps/web`. See README.md for the architecture overview.

## Commands

- `pnpm check` – run before considering work done (lint, format, typecheck, tests).
- `pnpm --filter @qb/api test` / `pnpm --filter @qb/web test` – package tests.
- `pnpm test:e2e` – Playwright; needs `pnpm db:migrate && pnpm db:seed` first (tests rely on `apps/api/seeds/dev.sql`).
- After editing `apps/api/src/db/schema/*`: `pnpm db:generate`, review the SQL, then `pnpm db:migrate`. Never edit a migration that has been applied anywhere. For SQLite table rebuilds, drizzle-kit may copy newly added columns from the old table (`SELECT "new_col" …` silently yields the string literal) — trim the INSERT to existing columns.
- Triggers (and other SQL drizzle-kit can't model) go in a custom migration: `pnpm --filter @qb/api exec drizzle-kit generate --custom --name=<name>`, separated with `--> statement-breakpoint` as in `0001_triggers.sql`. `wrangler d1` and the Vitest pool both split `BEGIN … END` trigger bodies correctly.
- After changing an API route or a schema in `packages/shared`: `pnpm openapi`, then `apps/mobile/tool/generate_api.sh` (the Flutter app's Dart client), and commit both. New object schemas that public endpoints return get a `.meta({ id: "Name" })`.
- Flutter app (`apps/mobile`, not in the pnpm workspace): `flutter analyze`, `flutter test` and `dart format lib test` from there. Android releases: push a `mobile-vX.Y.Z` tag on a commit on `main` (README, "Releasing the Android app"); never commit `android/key.properties` or a keystore.
- After editing `apps/web/wrangler.jsonc`: `pnpm --filter @qb/web cf-typegen` and `pnpm --filter @qb/api cf-typegen`. A new binding, var or secret the API uses also goes in `apps/api/src/env.d.ts` (the API declares what it needs; vars are typed as plain strings on both sides).

## Conventions

- API contracts (request/response shapes) live in `packages/shared` as Zod schemas. The API validates with them, clients consume the inferred types. Browser code imports constants from `@qb/shared/constants` so Zod stays out of the client bundle.
- API layering: `routes/` (createRoute + validation, thin) → `services/` (logic, DB, R2). Throw `AppError` for expected failures; errors are `{ error: { code, message, details? } }`.
- API routes are versioned under `/api/v1`; Better Auth owns `/api/auth/*`.
- Bindings are per request: build DB/auth from `c.env` in middleware, never as module-level singletons.
- Counters maintained by triggers, never written by application code: `submissions.like_count`, `dislike_count`, `pending_report_count` (from `submission_votes` / `submission_reports`, migration 0001); `questions.published_count`, `pending_review_count`, `rejected_count`, `latest_published_at`, `departments.published_count`, `user.published_submission_count`, `published_view_count` (from `submissions`, migration 0006). Public lists read these instead of aggregating `submissions`. View counters are bumped with raw SQL so `updated_at` doesn't change, once per browser per day (the `qb_views_q` / `qb_views_s` cookies, `lib/view-cookie.ts`).
- Taxonomy for pages comes from `loadTaxonomy` (`app/lib/taxonomy.server.ts`): one `/api/v1/taxonomy` call, cached per isolate for 60s. Admin loaders pass `{ fresh: true }`; admin actions that change the catalog call `invalidateTaxonomy()`.
- Only protected routes look up sessions (`requireAuth`); public reads must stay session-free.
- Admin-only API routes live in `routes/admin.ts` behind `requireAdmin` (403 for non-admins). Web admin pages sit under `/admin` (`routes/admin*.tsx`): the layout calls `requireAdmin`, child loaders use `adminGetJson` and actions `adminRequest` (`app/lib/admin.server.ts`).
- Web: data loading happens in loaders/actions via `apiFetch` (`app/lib/api.server.ts`, an in-process call into `@qb/api`), never directly against D1/R2. Server-only modules end in `.server.ts`.
- UI uses shadcn/ui components in `app/components/ui` (add with `pnpm dlx shadcn@latest add <name>` from `apps/web`).
- The site and the admin panel share one look: `PageHeader` (breadcrumbs, title, actions), `EmptyState` (shadcn Empty), `StatusBadge`, `ContributorAvatar` (shadcn Avatar), `TablePagination`, `UrlTabs` (URL-driven Tabs), and `components/actions.tsx` (`ActionDialog`, `ConfirmAction`, `useFormAction`, with sonner toasts). Public lists (questions, contributors, a contributor's papers) are card grids (`CARD_GRID`, `LINK_CARD`, `STRETCHED_LINK` in `components/question-cards.tsx`); account and admin lists are bordered `Table`s with a `bg-muted` header and row `DropdownMenu`s. When an action removes the row it was started from, run it through a `useFormAction` owned by the page, or the result toast is lost with the row.
- Sign-in is Google-only (Better Auth `socialProviders.google`); there are no password endpoints. API tests sign in with `signIn()` (Better Auth `testUtils`), e2e tests with `logInAs(page, NEW_USER | SEED_ADMIN, path)`, which claims a session that Playwright's global setup wrote to local D1 (`e2e/sessions.ts`). Don't write to the local D1 file while tests run: the dev server's queries then fail.
- Theme: the `dark` class on `<html>` is set by `THEME_SCRIPT` / `setTheme` (`app/lib/theme.ts`), never rendered by React. Give hard-coded palette colours a `dark:` variant.
- Every new API route gets an integration test in `apps/api/test`; user-facing flows get a Playwright test.
