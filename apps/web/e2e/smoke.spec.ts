import { expect, test } from "@playwright/test";

// These tests rely on the local seed data: `pnpm db:migrate && pnpm db:seed`.

test("landing page leads to the questions page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Past question papers",
  );

  await page.getByRole("link", { name: "Browse questions" }).click();
  await expect(page).toHaveURL(/\/questions$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Browse questions",
  );
});

test("course filter follows the selected department", async ({ page }) => {
  await page.goto("/questions");

  // No department: every course, suffixed with its department's short name.
  await page.getByRole("combobox", { name: "Course" }).click();
  await expect(
    page.getByRole("option", { name: "Circuit Analysis (EEE)" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  // Pick a department by searching its short name.
  await page.getByRole("combobox", { name: "Department" }).click();
  await page.getByPlaceholder("Search departments…").fill("CSE");
  await page.getByRole("option", { name: /Computer Science/ }).click();
  await expect(page).toHaveURL(/departmentId=1/);

  // Now only that department's courses, without the suffix.
  await page.getByRole("combobox", { name: "Course" }).click();
  await expect(
    page.getByRole("option", { name: "Algorithms", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: /Circuit Analysis/ }),
  ).toHaveCount(0);
  await page
    .getByRole("option", { name: "Data Structures", exact: true })
    .click();
  await expect(page).toHaveURL(/courseId=1/);

  await page
    .getByRole("link", { name: /Data Structures/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Data Structures",
  );
  await expect(
    page.getByRole("link", { name: "Open PDF" }).first(),
  ).toBeVisible();
});

test("contribute page is a placeholder", async ({ page }) => {
  await page.goto("/contribute");
  await expect(page.getByText("coming soon")).toBeVisible();
});

test("a user can sign up and log out", async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
});
