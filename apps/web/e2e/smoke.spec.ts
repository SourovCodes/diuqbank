import { expect, test } from "@playwright/test";

test("home page renders and is searchable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Find past question papers",
  );

  await page.getByLabel("Subject").fill("Physics");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/subject=Physics/);
});

test("contributing requires signing in", async ({ page }) => {
  await page.goto("/contribute");
  await expect(page).toHaveURL(/\/login\?redirectTo=%2Fcontribute/);
});

test("a contributor can sign up, upload a PDF and log out", async ({
  page,
}) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  await page.goto("/signup?redirectTo=%2Fcontribute");
  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/contribute$/);
  await page.getByLabel("Title").fill("E2E Physics Final");
  await page.getByLabel("Subject").fill("Physics");
  await page.getByLabel("Year").fill("2024");
  await page.getByLabel(/PDF file/).setInputFiles({
    name: "paper.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7\n%e2e test\n"),
  });
  await page.getByRole("button", { name: "Submit paper" }).click();
  await expect(page.getByRole("status")).toContainText("submitted for review");

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
});
