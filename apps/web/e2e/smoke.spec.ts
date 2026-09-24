import { expect, test, type Page } from "@playwright/test";
import {
  clickUntilUrl,
  closeQuestionFilters,
  failOnConsoleErrors,
  logOut,
  openCombobox,
  openQuestionFilters,
  signUpAs,
  uploadPaperWithNewCourse,
} from "./helpers";

// These tests rely on the local seed data: `pnpm db:migrate && pnpm db:seed`.
// Question 1 (Data Structures) has 2 published, 1 pending and 1 rejected submission.

failOnConsoleErrors();

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

test("an unknown URL renders a styled 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found — QuestionBank");
  await expect(page.getByText("Page not found")).toBeVisible();

  // The document must carry real CSS, or the page paints unstyled until hydration.
  // The dev server builds its stylesheet from the matched routes, so before the
  // catch-all route an unmatched path served an empty one.
  const html = await (await page.request.get("/no-such-page")).text();
  const hrefs = [
    ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g),
  ].map((match) => match[1]!);
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    const css = await (await page.request.get(href)).text();
    expect(css.length, href).toBeGreaterThan(0);
  }

  await clickUntilUrl(page, "Back to home", /\/$/);

  // Routes that exist but can't find their record still go through the error boundary.
  const missing = await page.goto("/questions/999999");
  expect(missing?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
});

test("course filter follows the selected department", async ({ page }) => {
  await page.goto("/questions");
  await openQuestionFilters(page);

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
  await closeQuestionFilters(page);

  await page
    .getByRole("link", { name: /Data Structures/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Data Structures",
  );
});

/** A paper switch: the list's link, or on phones the chip row's, which comes first. */
const paperLink = (page: Page, n: number) =>
  page
    .getByRole("link", { name: new RegExp(`^Paper ${n}(?!\\d)`) })
    .filter({ visible: true })
    .first();

test("question page embeds the PDF, shows its uploader and switches submissions", async ({
  page,
}) => {
  await page.goto("/questions/1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Data Structures",
  );

  // The newest published paper (seed-01, by Ayesha) is selected by default.
  await expect(paperLink(page, 1)).toHaveAttribute("aria-current", "true");
  const viewer = page.getByTestId("pdf-viewer");
  await expect(viewer).toHaveAttribute(
    "data",
    /^\/api\/v1\/submissions\/seed-01\/file/,
  );
  // Browsers without an inline PDF viewer get links to the same file instead.
  await expect(
    page.getByTestId("pdf-viewer-fallback").locator("a[download]"),
  ).toHaveAttribute("href", "/api/v1/submissions/seed-01/file");
  await expect(page.getByRole("link", { name: /Ayesha Rahman/ })).toBeVisible();
  // The optional section and batch tell papers apart.
  await expect(paperLink(page, 1)).toContainText("Section A · Batch 61");

  await paperLink(page, 2).click();
  await expect(page).toHaveURL(/submission=seed-02/);
  await expect(paperLink(page, 2)).toHaveAttribute("aria-current", "true");
  await expect(viewer).toHaveAttribute("data", /seed-02/);
  await expect(page.getByRole("link", { name: /Tanvir Hasan/ })).toBeVisible();

  // Switching back and forth keeps exactly one toolbar and viewer on the page.
  await paperLink(page, 1).click();
  await expect(viewer).toHaveAttribute("data", /seed-01/);
  await paperLink(page, 2).click();
  await expect(viewer).toHaveAttribute("data", /seed-02/);
  await expect(page.getByRole("link", { name: /^Log in to like/ })).toHaveCount(
    1,
  );
  await expect(page.getByRole("link", { name: "Report" })).toHaveCount(1);
  await expect(viewer).toHaveCount(1);

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

test("a question links to the same exam from other semesters", async ({
  page,
}) => {
  // Questions 1 and 11: the Data Structures midterm, 2nd and 1st semester.
  await page.goto("/questions/1");
  const others = page.getByRole("heading", { name: "Other semesters" });
  await others.scrollIntoViewIfNeeded();
  await clickUntilUrl(page, "1st Semester", /\/questions\/11$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Data Structures",
  );
  await expect(page.getByText("1st Semester").first()).toBeVisible();
});

test("forgot password explains how to get a new one", async ({ page }) => {
  await page.goto("/login");
  await clickUntilUrl(page, "Forgot password?", /\/forgot-password$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Forgot your password?",
  );
  await expect(
    page.getByRole("link", { name: "Email for a new password" }),
  ).toHaveAttribute("href", /^mailto:sourov2305101004@diu\.edu\.bd\?/);
});

test("contributors index leads to a contributor's submissions", async ({
  page,
}) => {
  await page.goto("/contributors");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Contributors",
  );
  // Most published papers first.
  await expect(
    page
      .getByRole("list", { name: "Contributors" })
      .getByRole("listitem")
      .first(),
  ).toContainText("Ayesha Rahman");

  await page.getByRole("link", { name: /Nusrat Jahan/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nusrat Jahan",
  );
  // Only published papers are public; pending uploads stay private.
  await expect(page.getByText("Pending review")).toHaveCount(0);

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

type ButtonLocator = ReturnType<Page["getByRole"]>;

/** The count in a vote button's accessible name, e.g. "Like (3)" → 3. */
async function voteCount(button: ButtonLocator) {
  const label = (await button.getAttribute("aria-label")) ?? "";
  return Number(/\((\d+)\)/.exec(label)?.[1]);
}

/**
 * Clicks a vote button and waits until the server has saved the vote. The counts update
 * optimistically, so without waiting a reload could cancel the request.
 */
async function castVote(page: Page, button: ButtonLocator, questionId: number) {
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname.startsWith(`/questions/${questionId}`),
  );
  await button.click();
  await saved;
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

  await castVote(page, like, questionId);
  await expect(like).toHaveAttribute("aria-pressed", "true");
  await expect(like).toHaveAttribute("aria-label", `Like (${likes + 1})`);

  // Switching moves the vote; it is saved, so it survives a reload.
  await castVote(page, dislike, questionId);
  await expect(dislike).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(dislike).toHaveAttribute("aria-pressed", "true");
  await expect(like).toHaveAttribute("aria-label", `Like (${likes})`);
  await expect(dislike).toHaveAttribute(
    "aria-label",
    `Dislike (${dislikes + 1})`,
  );

  // Pressing the active vote again clears it.
  await castVote(page, dislike, questionId);
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

/** A wide image drawn in the page, so the cropper has something to crop. */
async function widePhoto(page: Page) {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 600;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No canvas context");
    context.fillStyle = "#0ea5e9";
    context.fillRect(0, 0, 900, 600);
    context.fillStyle = "#7c3aed";
    context.fillRect(450, 0, 450, 600);
    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl.slice(dataUrl.indexOf(",") + 1);
  });
  return {
    name: "wide photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(base64, "base64"),
  };
}

test("a user crops, sets and removes a profile photo", async ({ page }) => {
  await signUpAs(page, "E2E Photo", "/account");
  const headerImage = page
    .getByRole("button", { name: "Account menu" })
    .locator("img");
  await expect(headerImage).toHaveCount(0);

  const photo = await widePhoto(page);
  const choose = page.getByLabel(/^(Choose|Change) photo$/);
  const dialog = page.getByRole("dialog");
  const save = page.getByRole("button", { name: "Save photo" });

  // Opening the cropper needs hydration, so retry picking the file.
  await expect(async () => {
    await choose.setInputFiles(photo);
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass();

  // Cancelling the crop leaves nothing to save.
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(save).toHaveCount(0);

  await choose.setInputFiles(photo);
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Use photo" }).click();
  await expect(dialog).toBeHidden();
  await save.click();
  await expect(page.getByText("Photo updated")).toBeVisible();
  await expect(headerImage).toHaveAttribute("src", /^\/api\/v1\/avatars\//);

  // What was uploaded is the square crop, not the wide original.
  const uploaded = await page.evaluate(async () => {
    const image = document.querySelector<HTMLImageElement>(
      'img[src^="/api/v1/avatars/"]',
    );
    if (!image) throw new Error("No avatar image");
    const blob = await fetch(image.src).then((res) => res.blob());
    const bitmap = await createImageBitmap(blob);
    return { type: blob.type, width: bitmap.width, height: bitmap.height };
  });
  expect(uploaded.type).toBe("image/webp");
  expect(uploaded.width).toBe(uploaded.height);

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
  const row = page.getByRole("row").filter({ hasText: courseName });
  await expect(row).toContainText("Pending review");

  // Uploaders can open their own pending PDF.
  const actions = row.getByRole("button", {
    name: `Actions for ${courseName}`,
  });
  await expect(async () => {
    await actions.click();
    await expect(page.getByRole("menuitem", { name: "Preview" })).toBeVisible({
      timeout: 1_000,
    });
  }).toPass();
  const preview = page.getByRole("menuitem", { name: "Preview" });
  const previewFile = await page.request.get(
    (await preview.getAttribute("href"))!,
  );
  expect(previewFile.status()).toBe(200);

  await page.getByRole("menuitem", { name: "Withdraw" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Withdraw" })
    .click();
  await expect(page.getByText("Submission withdrawn")).toBeVisible();
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
