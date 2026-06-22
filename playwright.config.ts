import { defineConfig, devices } from "@playwright/test";

const isCi = process.env.CI === "true";

export default defineConfig({
  testDir: "tests/browser",
  outputDir: "test-results/browser",
  fullyParallel: true,
  timeout: 15_000,
  globalTimeout: isCi ? 180_000 : undefined,
  workers: isCi ? 1 : undefined,
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ]
});
