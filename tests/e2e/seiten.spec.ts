import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SEITEN = [
  '/',
  '/profil/',
  '/kompetenzen/',
  '/kompetenzen/tiefbau-infrastruktur/',
  '/kompetenzen/netzinfrastruktur-leitungsbau/',
  '/kompetenzen/digitalisierung-prozesse/',
  '/kompetenzen/ki-agenten/',
  '/projekte/',
  '/projekte/bm-trainer/',
  '/projekte/rechnen-mit-pokemon/',
  '/projekte/konzept-pruefagent-abrechnung/',
  '/wissen/',
  '/suche/',
  '/kontakt/',
  '/impressum/',
  '/datenschutz/',
];

function sammleFehler(page: Page) {
  const fehler: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  page.on('pageerror', (e) => fehler.push(e.message));
  page.on('requestfailed', (r) => fehler.push(`Netzwerk: ${r.url()} ${r.failure()?.errorText}`));
  return fehler;
}

for (const pfad of SEITEN) {
  test(`${pfad} lädt ohne Konsolen-, CSP- und Netzwerkfehler`, async ({ page }) => {
    const fehler = sammleFehler(page);
    const antwort = await page.goto(pfad);
    expect(antwort?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Alessandro Cortese/);
    const beschreibung = await page.locator('meta[name="description"]').getAttribute('content');
    expect(beschreibung?.length ?? 0).toBeGreaterThan(50);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await page.waitForLoadState('networkidle');
    expect(fehler).toEqual([]);
  });

  test(`${pfad} ohne horizontales Scrollen`, async ({ page }) => {
    await page.goto(pfad);
    const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(ueberlauf).toBeLessThanOrEqual(0);
  });

  test(`${pfad} erfüllt automatische WCAG-2.2-AA-Prüfungen`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(pfad);
    const ergebnis = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const verstoesse = ergebnis.violations.map((v) => `${v.id}: ${v.nodes.length}× – ${v.help}`);
    expect(verstoesse).toEqual([]);
  });
}

test('Unbekannte Seite liefert 404 mit Hilfelinks', async ({ page }) => {
  const antwort = await page.goto('/gibt-es-nicht/');
  expect(antwort?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Leitungsplan');
  await expect(page.getByRole('link', { name: 'Zur Startseite', exact: true })).toBeVisible();
});

test('Sicherheits-Header sind gesetzt', async ({ request }) => {
  const r = await request.get('/');
  const h = r.headers();
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['strict-transport-security']).toContain('max-age=');
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('Seiten enthalten eine CSP mit Hashes statt unsafe-inline', async ({ page }) => {
  await page.goto('/');
  const csp = await page.locator('meta[http-equiv="content-security-policy"]').getAttribute('content');
  expect(csp).toContain("default-src 'self'");
  expect(csp).not.toContain("'unsafe-inline'");
});

test('Pfad-Traversal wird abgewiesen', async ({ request }) => {
  const r = await request.get('/..%2f..%2fetc%2fpasswd');
  expect(r.status()).not.toBe(200);
});

test('robots.txt und Sitemap sind erreichbar', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap:');
  const sitemap = await request.get('/sitemap-0.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain('/profil/');
  expect(xml).toContain('/kontakt/');
});
