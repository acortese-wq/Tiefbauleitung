import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Relative Pfade, da die Seite im Unterordner /Tiefbauleitung/ liegt.
const SEITEN = [
  './', 'profil/', 'kompetenzen/', 'kompetenzen/tiefbau-infrastruktur/', 'kompetenzen/netzinfrastruktur-leitungsbau/',
  'kompetenzen/digitalisierung-prozesse/', 'kompetenzen/ki-agenten/', 'projekte/', 'projekte/bm-trainer/',
  'projekte/rechnen-mit-pokemon/', 'projekte/konzept-pruefagent-abrechnung/', 'projekte/trennungskompass/', 'wissen/', 'suche/', 'kontakt/',
  'impressum/', 'datenschutz/',
];
const BASIS = '/Tiefbauleitung/';

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
    const falscheLinks = await page.$$eval('a[href], img[src], link[href], script[src], source[srcset]', (els, basis) =>
      els
        // srcset kann mehrere Adressen enthalten: jede einzeln prüfen
        .flatMap((e) => (e.getAttribute('href') ?? e.getAttribute('src') ?? e.getAttribute('srcset') ?? '').split(','))
        .map((u) => u.trim())
        .filter((u) => u.startsWith('/') && !u.startsWith(basis)), BASIS);
    expect(falscheLinks).toEqual([]);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });
}

test('Kanonische URLs zeigen auf GitHub Pages', async ({ page }) => {
  await page.goto('profil/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://acortese-wq.github.io/Tiefbauleitung/profil/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://acortese-wq.github.io/Tiefbauleitung/og-bild.png');
});

test('Datenschutz nennt GitHub als Hoster, kein Formular', async ({ page }) => {
  await page.goto('datenschutz/');
  await expect(page.locator('main')).toContainText('GitHub Pages');
  await expect(page.locator('main')).toContainText('kein Kontaktformular');
  await page.goto('kontakt/');
  await expect(page.locator('form')).toHaveCount(0);
});

test('Suche funktioniert statisch und verlinkt in den Unterordner', async ({ page }) => {
  await page.goto('suche/?q=Glasfaser');
  await expect(page.locator('[data-status]')).toContainText('Treffer');
  const erster = page.locator('[data-ergebnisse] a').first();
  await expect(erster).toHaveAttribute('href', /^\/Tiefbauleitung\//);
  await erster.click();
  await expect(page.locator('h1')).toBeVisible();
});

test('Navigation bleibt im Unterordner', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Kompetenzen entdecken' }).click();
  await expect(page).toHaveURL(/\/Tiefbauleitung\/kompetenzen\/$/);
  await expect(page.locator('h1')).toContainText('Kompetenzen');
});

test('robots.txt erlaubt Indexierung und nennt die Sitemap', async ({ request }) => {
  const t = await (await request.get('robots.txt')).text();
  expect(t).toContain('https://acortese-wq.github.io/Tiefbauleitung/sitemap-index.xml');
  const sitemap = await (await request.get('sitemap-0.xml')).text();
  expect(sitemap).toContain('https://acortese-wq.github.io/Tiefbauleitung/profil/');
  expect(sitemap).not.toMatch(/github\.io\/(?!Tiefbauleitung)/);
  expect((await request.get('.nojekyll')).status()).toBe(200);
});
