// Läuft gegen einen Build mit PUBLIC_CONTACT_FORM=true und SHOW_DRAFTS=true
// (npm run test:varianten). SMTP zeigt auf einen nicht erreichbaren Server,
// damit kein echter Versand stattfindet und der Fehlerfall geprüft wird.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({ mode: 'serial' });

test('Formular ist sichtbar und barrierefrei', async ({ page }) => {
  await page.goto('/kontakt/');
  await expect(page.locator('form.formular')).toBeVisible();
  await expect(page.getByLabel(/Anliegen/)).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
});

test('Serverseitige Validierung meldet Fehler verständlich und behält Eingaben', async ({ page }) => {
  await page.goto('/kontakt/');
  await page.getByLabel(/^Name/).fill('Maria Muster');
  await page.getByLabel(/Geschäftliche E-Mail/).fill('keine-adresse');
  await page.waitForTimeout(4500);
  await page.getByRole('button', { name: 'Nachricht senden' }).click();
  await expect(page.getByRole('alert')).toContainText('Bitte prüfen Sie Ihre Angaben');
  await expect(page.getByText('Bitte geben Sie eine gültige E-Mail-Adresse an.').first()).toBeVisible();
  await expect(page.getByLabel(/^Name/)).toHaveValue('Maria Muster');
  await expect(page.getByLabel(/Geschäftliche E-Mail/)).toHaveAttribute('aria-invalid', 'true');
});

test('Gültige Anfrage ohne erreichbaren Mailserver zeigt technischen Fehler', async ({ page }) => {
  await page.goto('/kontakt/');
  await page.getByLabel(/Anliegen/).selectOption('KI im Bauwesen');
  await page.getByLabel(/^Name/).fill('Maria Muster');
  await page.getByLabel(/Geschäftliche E-Mail/).fill('maria@firma.ch');
  await page.getByLabel(/^Nachricht/).fill('Guten Tag, ich möchte mich zu KI-Agenten in der Abrechnungsprüfung austauschen.');
  await page.getByLabel(/Datenschutzhinweise/).check();
  await page.waitForTimeout(4500);
  await page.getByRole('button', { name: 'Nachricht senden' }).click();
  await expect(page.getByRole('alert')).toContainText('konnte nicht gesendet werden');
  await expect(page.getByLabel(/^Nachricht/)).toHaveValue(/Abrechnungsprüfung/);
});

test('Ausgefülltes Honeypot-Feld wird still verworfen', async ({ request, baseURL }) => {
  const seite = await request.get('/kontakt/');
  const token = (await seite.text()).match(/name="token" value="([^"]+)"/)?.[1] ?? '';
  const r = await request.post('/kontakt/', {
    headers: { origin: baseURL! },
    form: { token, website: 'http://spam.example', name: 'Bot', email: 'bot@spam.example', anliegen: 'Anderes', nachricht: 'x'.repeat(40), einwilligung: 'ja' },
  });
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain('Vielen Dank');
});

test('POST von fremder Herkunft wird blockiert (CSRF-Schutz)', async ({ request }) => {
  const r = await request.post('/kontakt/', { form: { name: 'Test' }, headers: { origin: 'https://angreifer.example' } });
  expect(r.status()).toBe(403);
});

test('Ratenbegrenzung greift nach fünf Absendungen', async ({ request, baseURL }) => {
  let letzter = 0;
  for (let i = 0; i < 6; i++) {
    const r = await request.post('/kontakt/', { headers: { origin: baseURL! }, form: { name: 'x' } });
    letzter = r.status();
  }
  expect(letzter).toBe(429);
});

test('Entwürfe erscheinen in der Vorschau, gekennzeichnet und mit noindex', async ({ page }) => {
  await page.goto('/wissen/');
  await expect(page.locator('.artikel-karte')).toHaveCount(3);
  await page.locator('.artikel-karte').first().click();
  await expect(page.locator('.hinweis')).toContainText('Entwurf');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
});

test('Kategorie- und Schlagwortseiten funktionieren', async ({ page }) => {
  await page.goto('/wissen/kategorie/ki-agenten/');
  await expect(page.locator('h1')).toContainText('KI-Agenten');
  await page.goto('/wissen/schlagwort/ftth/');
  await expect(page.locator('.artikel-karte')).toHaveCount(1);
});

test('Mit sichtbaren Beiträgen erscheint «Wissen» in Navigation und Startseite', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('link', { name: 'Wissen' })).toBeAttached();
  await expect(page.locator('#wissen-titel')).toBeVisible();
});
