import { expect, test } from "@playwright/test";
import {
  failOnConsoleErrors,
  logInAs,
  logOut,
  SEED_ADMIN,
  uploadPaperWithNewCourse,
} from "./helpers";

failOnConsoleErrors();

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

test("members can't open the admin panel", async ({ page }) => {
  await logInAs(page, { name: "E2E Member" }, "/account");
  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Page not found")).toBeVisible();
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Admin panel" })).toHaveCount(
    0,
  );
});

test("an admin approves a proposed course and publishes the paper", async ({
  page,
}) => {
  // A contributor uploads a paper with a new course.
  const courseName = `E2E Proposed ${unique()}`;
  await logInAs(page, { name: "E2E Proposer" }, "/contribute");
  await uploadPaperWithNewCourse(page, courseName);
  await logOut(page);

  // The admin finds it in the review queue from the account menu.
  await logInAs(page, SEED_ADMIN, "/");
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Admin panel" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dashboard");

  // The admin panel has its own shell, without the site header.
  await expect(page.getByRole("link", { name: "Contribute" })).toHaveCount(0);
  await page.getByRole("link", { name: "Review submissions" }).click();
  await expect(page).toHaveURL(/\/admin\/submissions$/);
  await page.getByRole("link", { name: new RegExp(courseName) }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(courseName);
  await expect(
    page.getByText("This paper proposes new catalog entries"),
  ).toBeVisible();
  await expect(page.getByTestId("pdf-viewer")).toHaveAttribute(
    "data",
    /^\/api\/v1\/admin\/submissions\/[^/]+\/file/,
  );

  // It can't be published until the new course is approved.
  const publish = page.getByRole("button", { name: "Publish" });
  await expect(publish).toBeDisabled();

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("button", { name: "Review entries" }).click();
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await expect(dialog.getByRole("combobox", { name: "Course" })).toContainText(
    `${courseName} (new)`,
  );
  await dialog.getByRole("button", { name: "Approve and save" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("New entries approved")).toBeVisible();
  await expect(
    page.getByText("This paper proposes new catalog entries"),
  ).toHaveCount(0);

  await publish.click();
  await expect(page.getByText("Paper published")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Back to review" }),
  ).toBeVisible();
  // Publishing starts the watermarked public copy.
  await expect(page.getByText("Public download")).toBeVisible();
  await expect(
    page.getByText(/Watermarking…|Watermarked|watermark failed/),
  ).toBeVisible();

  // Now it's public, filed under the new course.
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Open the public page" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(courseName);
  await expect(page.getByTestId("pdf-viewer")).toBeVisible();
});

test("an admin watermarks published papers that have no public copy", async ({
  page,
}) => {
  await logInAs(page, SEED_ADMIN, "/admin/submissions");
  await page.getByRole("button", { name: "Watermark missing PDFs" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("Watermark published papers?");
  await dialog.getByRole("button", { name: "Watermark" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Watermarking started")).toBeVisible();
});

test("an admin adds, renames and deletes a semester", async ({
  page,
}, testInfo) => {
  // Semester names are a term and a two-digit year, so each project gets its own.
  const [name, renamedName] =
    testInfo.project.name === "mobile"
      ? ["Short 17", "Short 18"]
      : ["Short 15", "Short 16"];
  await logInAs(page, SEED_ADMIN, "/admin/catalog?tab=semesters");

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("button", { name: "Add semester" }).click();
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await dialog.getByLabel("Name").fill(name);
  await dialog.getByRole("button", { name: "Add" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Semester added")).toBeVisible();
  const row = page.getByRole("row", { name: new RegExp(name) });
  await expect(row).toBeVisible();

  // Names must be unique.
  await page.getByRole("button", { name: "Add semester" }).click();
  await dialog.getByLabel("Name").fill(name);
  await dialog.getByRole("button", { name: "Add" }).click();
  await expect(dialog.getByRole("alert")).toContainText("already exists");
  await dialog.getByRole("button", { name: "Cancel" }).click();

  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await dialog.getByLabel("Name").fill(renamedName.toLowerCase());
  await dialog.getByRole("button", { name: "Save" }).click();
  // Stored in the standard spelling.
  const renamed = page.getByRole("row", { name: new RegExp(renamedName) });
  await expect(renamed).toBeVisible();

  await renamed
    .getByRole("button", { name: `Actions for ${renamedName}` })
    .click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.getByText(`Deleted “${renamedName}”`)).toBeVisible();
  await expect(renamed).toHaveCount(0);

  // Semesters in use can't be deleted.
  await page.getByRole("button", { name: "Actions for Spring 24" }).click();
  await expect(
    page.getByRole("menuitem", { name: /can’t delete/ }),
  ).toHaveAttribute("aria-disabled", "true");
});

test("an admin compares the AI's reading and prefills the form with it", async ({
  page,
}) => {
  // Seeded: the AI reads a different semester and a section for seed-15.
  await logInAs(page, SEED_ADMIN, "/admin/submissions/seed-15");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Operating Systems",
  );
  await expect(page.getByText("A question paper")).toBeVisible();
  await expect(page.getByText("A single paper")).toBeVisible();
  await expect(page.getByText("AI: Summer 25")).toBeVisible();

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("button", { name: "Apply AI values" }).click();
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await expect(
    dialog.getByRole("combobox", { name: "Semester" }),
  ).toContainText("Summer 25");
  await expect(dialog.getByLabel("Section (optional)")).toHaveValue("B");
  // Nothing is saved until the admin confirms.
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();

  // The list flags papers the AI disagrees with, and multi-paper files.
  await page.goto("/admin/submissions?ai=flagged");
  await expect(
    page.getByRole("row", { name: /Multiple papers/ }),
  ).toBeVisible();
  await page.goto("/admin/submissions/seed-13");
  await expect(
    page.getByText("The AI found several question papers in this file"),
  ).toBeVisible();
});
