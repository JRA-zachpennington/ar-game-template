import { defineConfig } from "@playwright/test";
// PORT lets parallel worktrees each run their own dev server.
const port = process.env.PORT || 3000;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  fullyParallel: false,
  use: {
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 390, height: 844 },
    launchOptions: {
      args: [
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env.CI,
  },
});
