import { defineConfig, devices } from '@playwright/test';

// Prüft den statischen GitHub-Pages-Build (npm run build:pages) mit einem einfachen Dateiserver.
const PORT = 4324;

export default defineConfig({
  testDir: './tests/e2e-pages',
  reporter: [['list']],
  // GitHub Pages liefert die Seite im Unterordner /Tiefbauleitung/ aus. Der Testserver bildet das nach.
  use: { baseURL: `http://127.0.0.1:${PORT}/Tiefbauleitung/` },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `rm -rf .pages-test && mkdir -p .pages-test && ln -s ../dist .pages-test/Tiefbauleitung && python3 -m http.server ${PORT} --bind 127.0.0.1 --directory .pages-test`,
    url: `http://127.0.0.1:${PORT}/Tiefbauleitung/`,
    reuseExistingServer: false,
  },
});
