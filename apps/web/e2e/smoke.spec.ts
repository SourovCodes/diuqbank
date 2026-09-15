import { expect, test, type Page } from "@playwright/test";

// These tests rely on the local seed data: `pnpm db:migrate && pnpm db:seed`.
// Question 1 (Data Structures) has 2 published, 1 pending and 1 rejected submission.

/**
 * Opens a searchable select. Right after a full page load the click can land on the
 * server-rendered button before React has hydrated, so retry until it opens.
 */
async function openCombobox(page: Page, name: string) {
  const combobox = page.getByRole("combobox", { name });
  await expect(async () => {
    await combobox.click();
    await expect(combobox).toHaveAttribute("aria-expanded", "true", {
      timeout: 1_000,
    });
  }).toPass();
}

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
  await openCombobox(page, "Course");
  await expect(
    page.getByRole("option", { name: "Circuit Analysis (EEE)" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  // Pick a department by searching its short name.
  await openCombobox(page, "Department");
  await page.getByPlaceholder("Search departments…").fill("CSE");
  await page.getByRole("option", { name: /Computer Science/ }).click();
  await expect(page).toHaveURL(/departmentId=1/);

  // Now only that department's courses, without the suffix.
  await openCombobox(page, "Course");
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
});

test("question page embeds the PDF, shows its uploader and switches submissions", async ({
  page,
}) => {
  // Keep tests offline: the Google Docs fallback is only checked by its URL.
  await page.route("https://docs.google.com/**", (route) => route.abort());
  await page.goto("/questions/1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Data Structures",
  );

  // The newest published paper (seed-01, by Ayesha) is selected by default.
  await expect(page.getByRole("link", { name: /Paper 1/ })).toHaveAttribute(
    "aria-current",
    "true",
  );
  const viewer = page.getByTestId("pdf-viewer");
  await expect(viewer).toHaveAttribute(
    "data",
    /^\/api\/v1\/submissions\/seed-01\/file/,
  );
  await expect(page.getByTestId("pdf-viewer-fallback")).toHaveAttribute(
    "src",
    "https://docs.google.com/gview?embedded=true&url=" +
      encodeURIComponent(
        "http://localhost:5173/api/v1/submissions/seed-01/file",
      ),
  );
  await expect(page.getByRole("link", { name: /Ayesha Rahman/ })).toBeVisible();

  await page.getByRole("link", { name: /Paper 2/ }).click();
  await expect(page).toHaveURL(/submission=seed-02/);
  await expect(page.getByRole("link", { name: /Paper 2/ })).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(viewer).toHaveAttribute("data", /seed-02/);
  await expect(page.getByRole("link", { name: /Tanvir Hasan/ })).toBeVisible();

  // Unpublished submissions are listed but can't be opened.
  await expect(page.getByText("Pending review", { exact: true })).toBeVisible();
  await expect(page.getByText("Rejected", { exact: true })).toBeVisible();
  const pendingFile = await page.request.get(
    "/api/v1/submissions/seed-13/file",
  );
  expect(pendingFile.status()).toBe(404);
});

test("question with only pending submissions explains the review", async ({
  page,
}) => {
  // Question 9 (Marketing Management) only has a pending submission.
  await page.goto("/questions/9");
  await expect(page.getByText("No published paper yet")).toBeVisible();
  await expect(
    page.getByText(/waiting for admin review/).first(),
  ).toBeVisible();
  await expect(page.getByTestId("pdf-viewer")).toHaveCount(0);
});

test("contributors index leads to a contributor's submissions", async ({
  page,
}) => {
  await page.goto("/contributors");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Contributors",
  );
  // Most published papers first.
  await expect(page.locator("main li").first()).toContainText("Ayesha Rahman");

  await page.getByRole("link", { name: /Nusrat Jahan/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nusrat Jahan",
  );
  await expect(page.getByText("Pending review").first()).toBeVisible();

  // Published submissions open the question with that paper selected.
  await page.getByRole("link", { name: /Algorithms/ }).click();
  await expect(page).toHaveURL(/\/questions\/3\?submission=seed-04$/);
  await expect(page.getByRole("link", { name: /Nusrat Jahan/ })).toBeVisible();
});

test("a contributor can upload a paper with a new course", async ({ page }) => {
  await page.goto("/contribute");
  await expect(page).toHaveURL(/\/login\?redirectTo=%2Fcontribute/);

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await page.goto("/signup?redirectTo=%2Fcontribute");
  await page.getByLabel("Name").fill("E2E Contributor");
  await page.getByLabel("Email").fill(`e2e-${suffix}@example.com`);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/contribute$/);

  await openCombobox(page, "Department");
  await page.getByPlaceholder("Search or add department…").fill("CSE");
  await page.getByRole("option", { name: /Computer Science/ }).click();

  const courseName = `E2E Course ${suffix}`;
  await openCombobox(page, "Course");
  await page.getByPlaceholder("Search or add course…").fill(courseName);
  await page
    .getByRole("option", { name: `Add “${courseName}” as a new course` })
    .click();
  await expect(page.getByRole("combobox", { name: "Course" })).toContainText(
    `${courseName} (new)`,
  );

  await openCombobox(page, "Semester");
  await page.getByRole("option", { name: "3rd Semester" }).click();
  await openCombobox(page, "Exam type");
  await page.getByRole("option", { name: "Final" }).click();

  await page.getByLabel("PDF file").setInputFiles({
    name: "paper.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7\n%e2e upload\n"),
  });
  await page.getByRole("button", { name: "Submit paper" }).click();
  await expect(page.getByRole("status")).toContainText("submitted for review");

  await page.getByRole("link", { name: "See your contributions" }).click();
  await expect(page.getByText(courseName)).toBeVisible();
  await expect(
    page.getByText("Includes new entries awaiting approval"),
  ).toBeVisible();
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
