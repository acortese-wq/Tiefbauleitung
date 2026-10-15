import { defineConfig, devices } from '@playwright/test';

// Variante: Kontaktformular aktiv und Entwürfe sichtbar. Build vorher mit
// PUBLIC_CONTACT_FORM=true SHOW_DRAFTS=true (siehe npm run test:varianten).
const PORT = 4323;

export default defineConfig({
  testDir: './tests/e2e-varianten',
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}`, ...devices['Desktop Chrome'] },
  webServer: {
    command: 'node server.mjs',
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    env: {
      PORT: String(PORT),
      HOST: '127.0.0.1',
      CONTACT_SECRET: 'e2e-test-geheimnis-mit-mindestens-32-zeichen',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: '2',
      SMTP_USER: 'test',
      SMTP_PASS: 'test',
      CONTACT_TO: 'empfang@example.ch',
      CONTACT_FROM: 'webseite@example.ch',
    },
  },
});
