import { defineConfig, devices } from '@playwright/test';

// Prüft den statischen Swizzonic-Build (npm run build:swizzonic) an der Wurzel, wie unter tiefbauleitung.com.
const PORT = 4325;

export default defineConfig({
  testDir: './tests/e2e-swizzonic',
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}/` },
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
