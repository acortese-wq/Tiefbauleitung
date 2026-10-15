import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SEITEN = [
  '/', '/profil/', '/kompetenzen/', '/kompetenzen/tiefbau-infrastruktur/', '/kompetenzen/netzinfrastruktur-leitungsbau/',
  '/kompetenzen/digitalisierung-prozesse/', '/kompetenzen/ki-agenten/', '/projekte/', '/projekte/bm-trainer/',
  '/projekte/rechnen-mit-pokemon/', '/projekte/konzept-pruefagent-abrechnung/', '/wissen/', '/suche/', '/kontakt/',
  '/impressum/', '/datenschutz/',
];

for (const pfad of SEITEN) {
  test(`${pfad}: statisch, fehlerfrei, barrierefrei, ohne interne Platzhalter`, async ({ page }) => {
    const fehler: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
    page.on('pageerror', (e) => fehler.push(e.message));
    expect((await page.goto(pfad))?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    expect(fehler).toEqual([]);
    await expect(page.locator('.offen, .hinweis')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('ergänzen');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });
}

test('Kanonische URLs zeigen auf GitHub Pages', async ({ page }) => {
  await page.goto('/profil/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://acortese-wq.github.io/profil/');
});

test('Datenschutz nennt GitHub als Hoster, kein Formular', async ({ page }) => {
  await page.goto('/datenschutz/');
  await expect(page.locator('main')).toContainText('GitHub Pages');
  await expect(page.locator('main')).toContainText('kein Kontaktformular');
  await page.goto('/kontakt/');
  await expect(page.locator('form')).toHaveCount(0);
});

test('Suche funktioniert statisch', async ({ page }) => {
  await page.goto('/suche/?q=Glasfaser');
  await expect(page.locator('[data-status]')).toContainText('Treffer');
});

test('robots.txt erlaubt Indexierung und nennt die Sitemap', async ({ request }) => {
  const t = await (await request.get('/robots.txt')).text();
  expect(t).toContain('Allow: /');
  expect(t).toContain('https://acortese-wq.github.io/sitemap-index.xml');
  expect((await request.get('/.nojekyll')).status()).toBe(200);
});
