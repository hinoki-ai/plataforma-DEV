import { defineConfig, devices } from "@playwright/test";

enum EnvVar {
  BaseUrl = "E2E_BASE_URL",
}

const baseURL = process.env[EnvVar.BaseUrl] ?? "https://plataforma.aramac.dev";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: {
    timeout: 45_000,
  },
  retries: 1,
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: false,
    actionTimeout: 30_000,
    navigationTimeout: 45_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
