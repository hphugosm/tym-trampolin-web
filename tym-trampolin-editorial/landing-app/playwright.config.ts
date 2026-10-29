import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 40_000,
  use: {
    baseURL: process.env.EVOLUTION_BASE_URL || "http://127.0.0.1:5200",
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    },
    screenshot: "only-on-failure",
  },
  webServer: process.env.EVOLUTION_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 5200 --strictPort",
        url: "http://127.0.0.1:5200",
        reuseExistingServer: !process.env.CI,
      },
});
