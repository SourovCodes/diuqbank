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

/**
 * Clicks a link until the URL changes. A click that lands while the page is still
 * hydrating can be dropped, so retry instead of asserting once.
 */
async function clickUntilUrl(page: Page, name: string, url: RegExp) {
  await expect(async () => {
    await page.getByRole("link", { name }).click();
    await expect(page).toHaveURL(url, { timeout: 2_000 });
  }).toPass();
}

test("landing page leads to the questions page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Past question papers",
  );

  await clickUntilUrl(page, "Browse questions", /\/questions$/);
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

  const courseName = `E2E Course ${suffix}`;
  await uploadPaperWithNewCourse(page, courseName);

  await page.getByRole("link", { name: "See your contributions" }).click();
  await expect(page.getByText(courseName)).toBeVisible();
  await expect(
    page.getByText("Includes new entries awaiting approval"),
  ).toBeVisible();
});

/** Fills in and submits the contribute form: CSE, a new course, 3rd Semester, Final. */
async function uploadPaperWithNewCourse(page: Page, courseName: string) {
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
}

async function logOut(page: Page) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
}

/** Signs up a fresh account and waits to land on `redirectTo`. */
async function signUpAs(page: Page, name: string, redirectTo: string) {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  await page.goto(`/signup?redirectTo=${encodeURIComponent(redirectTo)}`);
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(
    new RegExp(`${redirectTo.replace(/[?]/g, "\\?")}$`),
  );
  return email;
}

/** The count in a vote button's accessible name, e.g. "Like (3)" → 3. */
async function voteCount(button: ReturnType<Page["getByRole"]>) {
  const label = (await button.getAttribute("aria-label")) ?? "";
  return Number(/\((\d+)\)/.exec(label)?.[1]);
}

test("a member can like, dislike and report a paper", async ({
  page,
}, testInfo) => {
  // The two projects share one database, so each votes on its own paper:
  // question 10 (seed-11) on desktop, question 8 (seed-09) on mobile.
  const questionId = testInfo.project.name === "mobile" ? 8 : 10;
  await signUpAs(page, "E2E Voter", `/questions/${questionId}`);
  await expect(page.getByText(/\d+ views?/).first()).toBeVisible();

  const like = page.getByRole("button", { name: /^Like/ });
  const dislike = page.getByRole("button", { name: /^Dislike/ });
  await expect(like).toHaveAttribute("aria-pressed", "false");
  const likes = await voteCount(like);
  const dislikes = await voteCount(dislike);

  await like.click();
  await expect(like).toHaveAttribute("aria-pressed", "true");
  await expect(like).toHaveAttribute("aria-label", `Like (${likes + 1})`);

  // Switching moves the vote; it is saved, so it survives a reload.
  await dislike.click();
  await expect(dislike).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(dislike).toHaveAttribute("aria-pressed", "true");
  await expect(like).toHaveAttribute("aria-label", `Like (${likes})`);
  await expect(dislike).toHaveAttribute(
    "aria-label",
    `Dislike (${dislikes + 1})`,
  );

  // Pressing the active vote again clears it.
  await dislike.click();
  await expect(dislike).toHaveAttribute("aria-pressed", "false");
  await expect(dislike).toHaveAttribute("aria-label", `Dislike (${dislikes})`);

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("button", { name: "Report" }).click();
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await dialog.getByLabel("Unreadable or broken file").check();
  await dialog.getByLabel(/^Details/).fill("E2E: the second page is blurry");
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByText("Thanks for the report")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reported" })).toBeDisabled();
});

test("visitors are asked to log in before voting", async ({ page }) => {
  await page.goto("/questions/1");
  await page.getByRole("link", { name: /^Log in to like/ }).click();
  await expect(page).toHaveURL(/\/login\?redirectTo=%2Fquestions%2F1/);
});

// A 1×1 PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

test("a user can set and remove a profile photo", async ({ page }) => {
  await signUpAs(page, "E2E Photo", "/account");
  const headerImage = page
    .getByRole("button", { name: "Account menu" })
    .locator("img");
  await expect(headerImage).toHaveCount(0);

  // The preview and "Save photo" need hydration, so retry picking the file.
  const save = page.getByRole("button", { name: "Save photo" });
  await expect(async () => {
    await page
      .getByLabel("Choose photo")
      .setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
    await expect(save).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await save.click();
  await expect(page.getByText("Photo updated")).toBeVisible();
  await expect(headerImage).toHaveAttribute("src", /^\/api\/v1\/avatars\//);

  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Photo removed")).toBeVisible();
  await expect(headerImage).toHaveCount(0);
});

test("a user can sign up and log out", async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();

  await logOut(page);
});

test("a contributor can manage their submissions and profile", async ({
  page,
}) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `e2e-${suffix}@example.com`;
  await page.goto("/signup?redirectTo=%2Fcontribute");
  await page.getByLabel("Name").fill("E2E Account");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/contribute$/);

  const courseName = `E2E Withdrawn ${suffix}`;
  await uploadPaperWithNewCourse(page, courseName);

  // The account menu leads to the user's own submissions, including unpublished ones.
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "My submissions" }).click();
  await expect(page).toHaveURL(/\/account\/submissions$/);
  const row = page.locator("main li").filter({ hasText: courseName });
  await expect(row).toContainText("Pending review");

  // Uploaders can open their own pending PDF.
  const preview = row.getByRole("link", { name: "Preview" });
  const previewFile = await page.request.get(
    (await preview.getAttribute("href"))!,
  );
  expect(previewFile.status()).toBe(200);

  await row.getByRole("button", { name: "Withdraw" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Withdraw" })
    .click();
  await expect(page.getByText("No submissions yet")).toBeVisible();

  // Rename.
  await page.getByRole("link", { name: "Profile", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Renamed Contributor");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Profile updated")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Renamed Contributor",
  );

  // Wrong current password, then a real change.
  const newPassword = "another-horse-battery";
  await page.getByLabel("Current password").fill("not-my-password");
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password").fill(newPassword);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(
    page.getByText("Your current password is incorrect."),
  ).toBeVisible();

  await page.getByLabel("Current password").fill("correct-horse-battery");
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password").fill(newPassword);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password changed")).toBeVisible();

  // The new password works.
  await logOut(page);
  await page.goto("/login?redirectTo=%2Faccount");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(newPassword);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Renamed Contributor",
  );
});
