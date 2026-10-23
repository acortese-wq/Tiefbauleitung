import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const SEITEN = [
  '/', '/profil/', '/kompetenzen/', '/kompetenzen/netzinfrastruktur-leitungsbau/', '/kompetenzen/tiefbau-infrastruktur/',
  '/kompetenzen/digitalisierung-prozesse/', '/kompetenzen/ki-agenten/', '/projekte/', '/projekte/trennungskompass/',
  '/suche/', '/kontakt/', '/impressum/', '/datenschutz/',
];
const DOMAIN = 'https://tiefbauleitung.com';

for (const pfad of SEITEN) {
  test(`${pfad}: an der Wurzel fehlerfrei und barrierefrei`, async ({ page }) => {
    const fehler: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
    page.on('requestfailed', (r) => fehler.push(`${r.url()} ${r.failure()?.errorText}`));
    const antwort = await page.goto(pfad);
    expect(antwort?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    expect(fehler).toEqual([]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${DOMAIN}${pfad}`);
    await expect(page.locator('.offen, .hinweis')).toHaveCount(0);
    // Keine Reste des GitHub-Unterordners
    const html = await page.content();
    expect(html).not.toContain('/Tiefbauleitung/');
    expect(html).not.toContain('github.io');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations.map((v) => v.id)).toEqual([]);
  });
}

test('Datenschutz nennt Swizzonic als Hoster', async ({ page }) => {
  await page.goto('/datenschutz/');
  await expect(page.locator('main')).toContainText('Swizzonic AG');
  await expect(page.locator('main')).not.toContainText('GitHub');
});

test('robots.txt erlaubt Indexierung und nennt die Sitemap der Domain', async ({ request }) => {
  const text = await (await request.get('/robots.txt')).text();
  expect(text).toContain('Allow: /');
  expect(text).toContain(`Sitemap: ${DOMAIN}/sitemap-index.xml`);
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain(`${DOMAIN}/profil/`);
});

test('Serverregeln liegen im Build: https, www-Umleitung, Sicherheits-Header, 404', async () => {
  const regeln = await readFile('dist/.htaccess', 'utf8');
  for (const teil of ['DirectoryIndex index.html', 'RewriteCond %{HTTPS} !=on', 'Strict-Transport-Security', 'X-Frame-Options', "frame-ancestors 'none'", 'ErrorDocument 404 /404.html']) {
    expect(regeln).toContain(teil);
  }
  expect(await readFile('dist/_astro/.htaccess', 'utf8')).toContain('immutable');
  await expect(readFile('dist/404.html', 'utf8')).resolves.toContain('Seite nicht gefunden');
});

test('Suche funktioniert an der Wurzel', async ({ page }) => {
  await page.goto('/suche/?q=Glasfaser');
  await expect(page.locator('[data-status]')).toContainText('Treffer');
  const erster = page.locator('[data-ergebnisse] a').first();
  await expect(erster).toHaveAttribute('href', /^\/(?!Tiefbauleitung)/);
  await erster.click();
  await expect(page.locator('h1')).toBeVisible();
});
