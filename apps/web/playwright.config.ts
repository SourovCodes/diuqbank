import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Local D1 must be migrated first: `pnpm db:migrate` from the repo root.
  webServer: [
    {
      command: "pnpm --filter @qb/api dev",
      url: "http://localhost:8787/api/v1/health",
      reuseExistingServer: !isCI,
    },
    {
      command: "pnpm --filter @qb/web dev",
      url: "http://localhost:5173",
      reuseExistingServer: !isCI,
    },
  ],
});
