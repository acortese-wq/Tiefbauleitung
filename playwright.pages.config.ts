import { defineConfig, devices } from '@playwright/test';

// Prüft den statischen GitHub-Pages-Build (npm run build:pages) mit einem einfachen Dateiserver.
const PORT = 4324;

export default defineConfig({
  testDir: './tests/e2e-pages',
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1 --directory dist`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
  },
});
