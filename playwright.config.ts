import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { browserName: "chromium", baseURL: "http://127.0.0.1:4173" },
  timeout: 30_000,
  webServer: {
    command: "python3 -m http.server 4173 --directory tests/e2e/fixture",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
