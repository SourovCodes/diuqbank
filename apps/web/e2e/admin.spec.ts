import { expect, test } from "@playwright/test";
import {
  failOnConsoleErrors,
  logIn,
  logOut,
  SEED_ADMIN,
  signUpAs,
  uploadPaperWithNewCourse,
} from "./helpers";

failOnConsoleErrors();

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

test("members can't open the admin panel", async ({ page }) => {
  await signUpAs(page, "E2E Member", "/account");
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
  await signUpAs(page, "E2E Proposer", "/contribute");
  await uploadPaperWithNewCourse(page, courseName);
  await logOut(page);

  // The admin finds it in the review queue from the account menu.
  await logIn(page, SEED_ADMIN, "/");
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

  // Now it's public, filed under the new course.
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Open the public page" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(courseName);
  await expect(page.getByTestId("pdf-viewer")).toBeVisible();
});

test("an admin adds, renames and deletes a semester", async ({ page }) => {
  const name = `E2E Term ${unique()}`;
  await logIn(page, SEED_ADMIN, "/admin/catalog?tab=semesters");

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
  await dialog.getByLabel("Name").fill(`${name} renamed`);
  await dialog.getByRole("button", { name: "Save" }).click();
  const renamed = page.getByRole("row", {
    name: new RegExp(`${name} renamed`),
  });
  await expect(renamed).toBeVisible();

  await renamed
    .getByRole("button", { name: `Actions for ${name} renamed` })
    .click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(renamed).toHaveCount(0);

  // Semesters in use can't be deleted.
  await page.getByRole("button", { name: "Actions for 1st Semester" }).click();
  await expect(
    page.getByRole("menuitem", { name: /can’t delete/ }),
  ).toHaveAttribute("aria-disabled", "true");
});
