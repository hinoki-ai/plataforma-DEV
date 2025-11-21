import { defineConfig, devices } from "@playwright/test";

enum EnvVar {
  BaseUrl = "E2E_BASE_URL",
}

// Default to localhost:3000 for dev mode, production for CI
const isDevMode =
  process.env.NODE_ENV === "development" || process.env.E2E_DEV_MODE === "true";
const baseURL =
  process.env[EnvVar.BaseUrl] ??
  (isDevMode ? "http://localhost:3000" : "https://plataforma.aramac.dev");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: isDevMode ? 300_000 : 120_000, // Longer timeout for dev mode (turbopack compilation)
  expect: {
    timeout: isDevMode ? 60_000 : 45_000, // Longer expect timeout for dev mode
  },
  retries: isDevMode ? 2 : 1, // More retries in dev mode
  fullyParallel: false,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/e2e-results.json" }], // Add JSON reporter for analysis
  ],
  use: {
    baseURL,
    headless: isDevMode ? false : true, // Show browser in dev mode for debugging
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true, // Allow self-signed certificates in dev
    actionTimeout: isDevMode ? 45_000 : 30_000,
    navigationTimeout: isDevMode ? 60_000 : 45_000, // Longer navigation timeout for dev
    trace: isDevMode ? "on" : "on-first-retry", // Always capture traces in dev mode
    screenshot: isDevMode ? "on" : "only-on-failure", // Always capture screenshots in dev mode
    video: isDevMode ? "on" : "retain-on-failure", // Always capture video in dev mode
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Dev mode project with extended timeouts and debugging enabled
    ...(isDevMode
      ? [
          {
            name: "dev-mode",
            use: {
              ...devices["Desktop Chrome"],
              headless: false,
              trace: "on",
              screenshot: "on",
              video: "on",
              actionTimeout: 60_000,
              navigationTimeout: 90_000,
            },
            timeout: 600_000, // 10 minutes for dev mode tests
            expect: {
              timeout: 90_000,
            },
          },
        ]
      : []),
  ],
});
