import { execFileSync } from "node:child_process";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

// Shared by the e2e specs. They rely on the local seed data: `pnpm db:migrate && pnpm db:seed`.

// Fail any test that logs a console error, such as React's duplicate key or hydration
// warnings, which otherwise go unnoticed while every assertion still passes.
const consoleErrors = new WeakMap<Page, string[]>();

/** Fails any test in the calling spec that logs a console error. */
export function failOnConsoleErrors() {
  test.beforeEach(({ page }) => {
    const errors: string[] = [];
    consoleErrors.set(page, errors);
    page.on("console", (message) => {
      // Failed requests (such as expected 404s) aren't app bugs, and neither is a
      // route discovery request that a full page navigation cancelled.
      if (
        message.type() === "error" &&
        !message.text().startsWith("Failed to load resource") &&
        !message.text().startsWith("Failed to fetch manifest patches")
      ) {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.push(error.message));
  });

  test.afterEach(({ page }) => {
    expect(consoleErrors.get(page) ?? [], "console errors").toEqual([]);
  });
}

/**
 * Opens a searchable select. Right after a full page load the click can land on the
 * server-rendered button before React has hydrated, so retry until it opens.
 */
export async function openCombobox(page: Page, name: string) {
  const combobox = page.getByRole("combobox", { name });
  await expect(async () => {
    await combobox.click();
    await expect(combobox).toHaveAttribute("aria-expanded", "true", {
      timeout: 1_000,
    });
  }).toPass();
}

/**
 * Opens the questions page's filters: inline on wide screens, behind a "Filters"
 * button in a sheet on phones.
 */
export async function openQuestionFilters(page: Page) {
  const button = page.getByRole("button", { name: /^Filters/ });
  if (!(await button.isVisible())) return;
  const sheet = page.getByRole("dialog", { name: "Filter questions" });
  await expect(async () => {
    await button.click();
    await expect(sheet).toBeVisible({ timeout: 1_000 });
  }).toPass();
}

/** Closes the filter sheet on phones with its "Show N questions" button. */
export async function closeQuestionFilters(page: Page) {
  const sheet = page.getByRole("dialog", { name: "Filter questions" });
  if (await sheet.isVisible()) {
    await sheet.getByRole("button", { name: /^Show \d+ question/ }).click();
    await expect(sheet).toBeHidden();
  }
}

/**
 * Clicks a link until the URL changes. A click that lands while the page is still
 * hydrating can be dropped, so retry instead of asserting once.
 */
export async function clickUntilUrl(page: Page, name: string, url: RegExp) {
  await expect(async () => {
    await page.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url, { timeout: 2_000 });
  }).toPass();
}

/** Fills in and submits the contribute form: CSE, a new course, Fall 24, Final. */
export async function uploadPaperWithNewCourse(page: Page, courseName: string) {
  await openCombobox(page, "Department");
  await page.getByPlaceholder("Search or add department…").fill("CSE");
  await page.getByRole("option", { name: /Computer Science/ }).click();

  await openCombobox(page, "Course");
  // Typed key by key: the "Add" option must appear while typing, not only on paste.
  await page
    .getByPlaceholder("Search or add course…")
    .pressSequentially(courseName);
  await page
    .getByRole("option", { name: `Add “${courseName}” as a new course` })
    .click();
  await expect(page.getByRole("combobox", { name: "Course" })).toContainText(
    `${courseName} (new)`,
  );

  await openCombobox(page, "Semester");
  await page.getByRole("option", { name: "Fall 24" }).click();
  await openCombobox(page, "Exam type");
  await page.getByRole("option", { name: "Final" }).click();

  await page.getByLabel("PDF file").setInputFiles({
    name: "paper.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7\n%e2e upload\n"),
  });
  await page.getByRole("button", { name: "Submit paper" }).click();
  // Lands on the paper's status page.
  await expect(page).toHaveURL(/\/account\/submissions\/[^/?]+/);
  await expect(
    page.getByText("Thanks! Your paper was uploaded."),
  ).toBeVisible();
}

export async function logOut(page: Page) {
  // Right after a navigation the click can land before the menu has hydrated.
  const logOutItem = page.getByRole("menuitem", { name: "Log out" });
  await expect(async () => {
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(logOutItem).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await logOutItem.click();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
}

const apiDir = path.join(import.meta.dirname, "../../api");

/** The API's session-cookie secret, from `apps/api/.dev.vars` (CI writes a random one). */
function authSecret() {
  const vars = readFileSync(path.join(apiDir, ".dev.vars"), "utf8");
  const secret = /^BETTER_AUTH_SECRET=(.*)$/m
    .exec(vars)?.[1]
    ?.trim()
    .replace(/^"(.*)"$/, "$1");
  if (!secret)
    throw new Error("BETTER_AUTH_SECRET missing from apps/api/.dev.vars");
  return secret;
}

const sql = (value: string) => `'${value.replaceAll("'", "''")}'`;

/** The admin account created by `pnpm db:seed`. */
export const SEED_ADMIN = { id: "seed-user-admin" };

/**
 * Signs in without Google: writes a session straight into the local D1 database and
 * gives the browser Better Auth's signed session cookie, then opens `redirectTo`.
 * Pass `{ name }` for a fresh user (an `@example.com` address, which `pnpm db:seed`
 * cleans up) or `{ id }` for an existing one.
 */
export async function logInAs(
  page: Page,
  user: { name: string } | { id: string },
  redirectTo: string,
) {
  const id = "id" in user ? user.id : `e2e-${randomUUID()}`;
  const email = `${id}@example.com`;
  const token = randomBytes(24).toString("base64url");
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const statements = [
    ...("name" in user
      ? [
          `INSERT INTO "user" (id, name, email, email_verified) VALUES (${sql(id)}, ${sql(user.name)}, ${sql(email)}, 1);`,
        ]
      : []),
    `INSERT INTO session (id, token, user_id, expires_at) VALUES (${sql(randomUUID())}, ${sql(token)}, ${sql(id)}, ${expiresAt});`,
  ];
  execFileSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--local",
      "--command",
      statements.join(" "),
    ],
    { cwd: apiDir, stdio: ["ignore", "ignore", "inherit"] },
  );

  // Signed like Better Auth (better-call): `token.base64(HMAC-SHA256(token))`, URI-encoded.
  const signature = createHmac("sha256", authSecret())
    .update(token)
    .digest("base64");
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: encodeURIComponent(`${token}.${signature}`),
      url: "http://localhost:5173",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto(redirectTo);
  return { id, email };
}
