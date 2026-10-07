import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

const databaseURL = URL.parse(process.env.DATABASE_URL ?? "");
if (
  !databaseURL ||
  process.env.DATABASE_URL !== process.env.FIXTURE_DATABASE_URL ||
  !["postgres:", "postgresql:"].includes(databaseURL.protocol) ||
  databaseURL.pathname !== "/beacon_fixture" ||
  ![
    "localhost",
    "127.0.0.1",
    "[::1]",
    ...(process.env.CI === "true" ? ["postgres"] : []),
  ].includes(databaseURL.hostname) ||
  databaseURL.search ||
  databaseURL.hash
) {
  throw new Error(
    "Set DATABASE_URL and FIXTURE_DATABASE_URL to the same local or CI beacon_fixture database."
  );
}

const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bun start --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: { BETTER_AUTH_URL: baseURL },
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
  },
});
