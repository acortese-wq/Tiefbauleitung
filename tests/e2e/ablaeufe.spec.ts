import { test, expect } from '@playwright/test';

test('Navigation führt zu allen Hauptseiten', async ({ page, isMobile }) => {
  await page.goto('/');
  // «Wissen» erscheint erst, wenn Fachbeiträge veröffentlicht sind (siehe Varianten-Tests)
  const ziele = ['Profil', 'Kompetenzen', 'Projekte', 'KI-Labor', 'Kontakt'];
  for (const ziel of ziele) {
    if (isMobile) await page.locator('.nav-klein summary').click();
    const nav = page.getByRole('navigation', { name: isMobile ? 'Hauptnavigation mobil' : 'Hauptnavigation' });
    await nav.getByRole('link', { name: ziel, exact: true }).click();
    await expect(page.locator('h1')).toBeVisible();
    const navKlasse = isMobile ? '.nav-klein' : '.nav-gross';
    await expect(page.locator(`${navKlasse} a[aria-current="page"]`)).toHaveText(ziel);
  }
});

test('Startseite zeigt Positionierung und zwei Handlungsoptionen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Tiefbau und Netzbau verstehen');
  await expect(page.getByRole('link', { name: /Fachlichen Austausch starten/ })).toHaveAttribute('href', '/kontakt/');
  await expect(page.getByRole('link', { name: 'Kompetenzen entdecken' })).toHaveAttribute('href', '/kompetenzen/');
});

test('Alle internen Links der Startseite und Unterseiten funktionieren', async ({ page, request }) => {
  const besucht = new Set<string>();
  const offen = ['/'];
  const kaputt: string[] = [];
  while (offen.length) {
    const pfad = offen.shift()!;
    if (besucht.has(pfad)) continue;
    besucht.add(pfad);
    const r = await request.get(pfad);
    if (r.status() >= 400) { kaputt.push(`${pfad} → ${r.status()}`); continue; }
    if (!(r.headers()['content-type'] ?? '').includes('text/html')) continue;
    await page.goto(pfad);
    const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')!));
    for (const h of hrefs) {
      const sauber = h.split('#')[0];
      if (sauber && !besucht.has(sauber)) offen.push(sauber);
    }
  }
  expect(kaputt).toEqual([]);
  expect(besucht.size).toBeGreaterThan(15);
});

test('Referenzprojekte lassen sich filtern', async ({ page }) => {
  await page.goto('/projekte/');
  const zaehler = page.locator('[data-zaehler]');
  await expect(zaehler).toContainText('38');
  await page.getByRole('button', { name: /Bahn/ }).click();
  await expect(zaehler).toContainText('1 von 38');
  await page.getByRole('button', { name: /^Alle/ }).click();
  await expect(zaehler).toContainText('38 von 38');
});

test('Kontaktseite verweist auf LinkedIn, solange das Formular deaktiviert ist', async ({ page }) => {
  await page.goto('/kontakt/');
  await expect(page.getByRole('link', { name: /Nachricht auf LinkedIn/ })).toHaveAttribute('href', /linkedin\.com\/in\//);
  await expect(page.locator('form.formular')).toHaveCount(0);
  await expect(page.getByText('Kontakt über LinkedIn')).toBeVisible();
});

test('Bei deaktiviertem Formular ist die Kontaktseite statisch und verarbeitet keine Eingaben', async ({ request, baseURL }) => {
  const r = await request.post('/kontakt/', {
    form: { name: 'Test', email: 'test@example.ch', anliegen: 'Anderes', nachricht: 'x'.repeat(30), einwilligung: 'ja' },
    headers: { origin: baseURL! },
  });
  const html = await r.text();
  expect(html).not.toContain('Vielen Dank');
  expect(html).not.toContain('name="token"');
});

test('Suche findet Inhalte', async ({ page }) => {
  await page.goto('/suche/');
  await page.getByLabel('Suchbegriff').fill('Abrechnung');
  await page.getByRole('button', { name: 'Suchen' }).click();
  await expect(page.locator('[data-status]')).toContainText('Treffer');
  await expect(page.locator('[data-ergebnisse] li').first()).toBeVisible();
});

test('Suche meldet leere Ergebnisse verständlich', async ({ page }) => {
  await page.goto('/suche/?q=Xylophonorchester');
  await expect(page.locator('[data-status]')).toContainText('Keine Treffer');
});

test('Skip-Link springt zum Inhalt', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Tastaturbedienung nur auf Desktop geprüft');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Zum Inhalt springen' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#inhalt$/);
});

test('Ohne veröffentlichte Beiträge verlinkt die Startseite keinen leeren Wissensbereich', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="/wissen/"]')).toHaveCount(0);
  await expect(page.getByText('Die ersten Beiträge sind in Arbeit')).toHaveCount(0);
});

test('Startseite nennt Zielgruppen und zeigt Fotos der Referenzobjekte', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.held-zielgruppe')).toContainText('Bauherren');
  const fotos = page.locator('.foto-reihe figure');
  expect(await fotos.count()).toBeGreaterThan(0);
  await expect(fotos.first().locator('img')).toHaveAttribute('alt', /.+/);
  await expect(fotos.first().locator('figcaption')).toContainText('Foto:');
});

test('Referenzliste ist chronologisch, neueste zuerst', async ({ page }) => {
  await page.goto('/projekte/');
  const zeitraeume = (await page.locator('.ref-liste .ref-zeit').allTextContents()).map((t) => Number(t.slice(0, 4)));
  expect(zeitraeume.length).toBeGreaterThan(10);
  expect([...zeitraeume].sort((a, b) => b - a)).toEqual(zeitraeume);
});

test('Mobiles Menü schliesst mit Escape und Klick ausserhalb', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'nur mobil');
  await page.goto('/');
  const menue = page.locator('.nav-klein');
  await menue.locator('summary').click();
  await expect(menue).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(menue).not.toHaveAttribute('open', '');
  await menue.locator('summary').click();
  // Freie Fläche unten links, ausserhalb des aufgeklappten Menüs
  const ansicht = page.viewportSize()!;
  await page.mouse.click(8, ansicht.height - 8);
  await expect(menue).not.toHaveAttribute('open', '');
});

test('Jede Kompetenzseite zeigt eine beschriebene Planzeichnung im Seitenkopf', async ({ page }) => {
  for (const id of ['tiefbau-infrastruktur', 'netzinfrastruktur-leitungsbau', 'digitalisierung-prozesse', 'ki-agenten']) {
    await page.goto(`/kompetenzen/${id}/`);
    const zeichnung = page.locator('.seitenkopf .kopf-illustration svg[role="img"]');
    await expect(zeichnung).toBeVisible();
    await expect(zeichnung.locator('title')).not.toBeEmpty();
    await expect(zeichnung.locator('desc')).not.toBeEmpty();
    // Text bleibt vor der Zeichnung lesbar (h1 nicht verdeckt)
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('Kompetenzbereiche der Startseite zeigen dekorative Zeichnungen', async ({ page }) => {
  await page.goto('/');
  const zeichnungen = page.locator('.bereich-bild svg');
  await expect(zeichnungen).toHaveCount(4);
  for (const z of await zeichnungen.all()) {
    await expect(z).toBeVisible();
    await expect(z).toHaveAttribute('aria-hidden', 'true');
  }
});

test('Startseite zeigt das Bild «Vom Graben zum Rechenzentrum» mit KI-Kennzeichnung', async ({ page }) => {
  await page.goto('/');
  const bild = page.locator('.weg-bild');
  await bild.scrollIntoViewIfNeeded();
  await expect(bild.locator('img')).toHaveAttribute('alt', /Leitungsgraben/);
  await expect.poll(() => bild.locator('img').evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
  await expect(bild.locator('figcaption')).toContainText('KI-generierte Illustration');
});

test('Werkzeugkasten zeigt freigegebene Werkzeuge mit Urheberangabe', async ({ page }) => {
  await page.goto('/projekte/#werkzeugkasten');
  const karten = page.locator('#werkzeugkasten .wk-karte');
  await expect(karten).toHaveCount(11);
  await expect(page.locator('#werkzeugkasten')).toContainText('Urheber: Alessandro Cortese');
  await expect(page.locator('#werkzeugkasten')).toContainText('Stärkste Arbeit im Kurs');
  await page.goto('/kompetenzen/ki-agenten/');
  await expect(page.locator('.werkzeugkasten')).toContainText('Schachtassistent');
});

test('Nicht freigegebene Werkzeug- und Markennamen erscheinen nirgends', async ({ page }) => {
  for (const pfad of ['/', '/profil/', '/projekte/', '/kompetenzen/ki-agenten/', '/kompetenzen/digitalisierung-prozesse/', '/kompetenzen/netzinfrastruktur-leitungsbau/', '/kompetenzen/tiefbau-infrastruktur/']) {
    await page.goto(pfad);
    const text = (await page.locator('body').innerText()).toLowerCase();
    for (const verboten of ['preisanalyse', 'swisscomgpt', 'cablex', 'job band', 'becher', 'c2 internal']) expect(text, `${verboten} auf ${pfad}`).not.toContain(verboten);
  }
});

test('Fallstudie Trennungskompass nennt Gruppenarbeit, Bewertung und Grenzen, ohne Kanzleizahlen', async ({ page }) => {
  await page.goto('/projekte/trennungskompass/');
  const inhalt = page.locator('main');
  await expect(inhalt).toContainText('Gruppenarbeit');
  await expect(inhalt).toContainText('91 von 100');
  await expect(inhalt).toContainText('Grenzen und offene Risiken');
  const text = await inhalt.innerText();
  for (const vertraulich of ['7\'725', '7’725', 'Bexio', '54 Erstkontakte', 'intoChat']) expect(text).not.toContain(vertraulich);
});

test('Startseite zeigt Netzbau aus beiden Perspektiven und den Nutzen für Auftraggeber', async ({ page }) => {
  await page.goto('/');
  const netzbau = page.locator('section.netzbau');
  await expect(netzbau.locator('.perspektive')).toHaveCount(3);
  await expect(netzbau).toContainText('Netzbetreiber');
  await expect(netzbau).toContainText('Strasseneigentümer');
  await expect(netzbau).toContainText('Was Auftraggeber davon haben');
  await expect(netzbau.getByRole('link', { name: /im Detail/ })).toHaveAttribute('href', '/kompetenzen/netzinfrastruktur-leitungsbau/');
});

test('Kompetenzseite Netzbau trennt Vorhandenes, Konzept und Ideen', async ({ page }) => {
  await page.goto('/kompetenzen/netzinfrastruktur-leitungsbau/');
  const prosa = page.locator('article.prosa');
  for (const t of ['Eigenentwicklungen, vorhanden', 'Konzept', 'Ideen, noch nicht umgesetzt']) await expect(prosa).toContainText(t);
});

test('Hero nennt Name und Rolle, Projektkarten zeigen Beitrag und belegtes Ergebnis', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.held-name')).toContainText('Alessandro Cortese');
  await expect(page.locator('.held-name')).toContainText('Bauingenieur');
  const karte = page.locator('.projekt-karte', { hasText: 'Trennungskompass' });
  await expect(karte.locator('.projekt-fakten')).toContainText('Mein Beitrag');
  await expect(karte.locator('.projekt-fakten')).toContainText('91 von 100');
  // Ohne belegtes Ergebnis keine Ergebniszeile
  await page.goto('/projekte/');
  await expect(page.locator('.projekt-karte', { hasText: 'Prüf-Agent' }).locator('.projekt-fakten')).not.toContainText('Ergebnis');
});

test('Scroll-Animation verändert nie die Deckkraft und entfällt bei reduzierter Bewegung', async ({ browser }) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const kontext = await browser.newContext({ reducedMotion });
    const seite = await kontext.newPage();
    await seite.goto('/');
    const karte = seite.locator('.projekt-karte').first();
    const zustand = await karte.evaluate((e) => ({
      animationen: e.getAnimations().map((a) => (a as CSSAnimation).animationName),
      deckkraft: getComputedStyle(e).opacity,
    }));
    expect(zustand.deckkraft).toBe('1');
    if (reducedMotion === 'reduce') expect(zustand.animationen).not.toContain('auftauchen');
    await kontext.close();
  }
});

test('Profil zeigt berufliches Profil mit Schwerpunkten und Arbeitsweise', async ({ page }) => {
  await page.goto('/profil/');
  const bp = page.locator('#berufsprofil');
  await expect(bp.getByRole('heading', { name: 'Berufliches Profil' })).toBeVisible();
  await expect(bp.locator('.bp-schwerpunkte li')).toHaveCount(13);
  await expect(bp.locator('.bp-arbeitsweise li')).toHaveCount(6);
  await expect(bp).toContainText('Netzinfrastruktur, FTTH-Ausbau');
});

test('Referenz Jenins zeigt Ort, Kurzbeschrieb, Netzbau-Filter und Link zur Fallstudie', async ({ page }) => {
  await page.goto('/projekte/');
  const eintrag = page.locator('.ref-liste li', { hasText: 'Ortsdurchfahrt Jenins' });
  await expect(eintrag).toContainText('2018');
  await expect(eintrag.locator('.ref-kurz')).toContainText('Kabelschutzrohren');
  await eintrag.getByRole('link', { name: /^Infos/ }).click();
  await expect(page.locator('h1')).toContainText('Ortsdurchfahrt Jenins');
  // Keine Namen von Beteiligten oder Kosten aus den Protokollen
  const text = await page.locator('main').innerText();
  for (const intern of ['Walo', 'Repower', 'Swisscom', 'Fromm', 'Franken', 'Parzelle']) expect(text).not.toContain(intern);
});

test('Referenz Plessurbrücke Sassal zeigt Jahre, Bild und Fallstudie ohne Namen aus den Protokollen', async ({ page }) => {
  await page.goto('/projekte/');
  const eintrag = page.locator('.ref-liste li', { hasText: 'Plessurbrücke Sassal' });
  await expect(eintrag).toContainText('2020–2021');
  await eintrag.getByRole('link', { name: /^Infos/ }).click();
  await expect(page.locator('h1')).toContainText('Plessurbrücke Sassal');
  await expect(page.locator('main img[src*="sassal-werkleitungen"]')).toHaveCount(1);
  const text = await page.locator('main').innerText();
  for (const intern of ['Vetsch', 'Casutt', 'Stoffel', 'IBC', 'Swisscom', 'UPC', 'Parzelle']) expect(text).not.toContain(intern);
});

test('Referenz Fläscherstrasse nennt die Kleintiermauer und führt über «Infos» zur Fallstudie', async ({ page }) => {
  await page.goto('/projekte/');
  const eintrag = page.locator('.ref-liste li', { hasText: 'Fläscherstrasse' });
  await expect(eintrag.locator('.ref-kurz')).toContainText('Kleintiermauer');
  await eintrag.getByRole('link', { name: /^Infos zu Fläscherstrasse/ }).click();
  await expect(page.locator('h1')).toContainText('Kleintiermauer');
  await expect(page.locator('main')).toContainText('Amphibien');
});

test('Fusszeile führt zur lesbaren Seitenübersicht mit allen Fallstudien', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').getByRole('link', { name: 'Seitenübersicht' }).click();
  await expect(page.locator('h1')).toContainText('Seitenübersicht');
  await expect(page.locator('main')).toContainText('Plessurbrücke Sassal');
  await expect(page.locator('main').getByRole('link', { name: 'XML-Sitemap' })).toHaveAttribute('href', /sitemap-index\.xml$/);
});

test('KI-Labor: Werkbank füllt den Prompt live und markiert fehlende Angaben, ohne externe Anfragen', async ({ page }) => {
  const anfragen: string[] = [];
  page.on('request', (r) => anfragen.push(r.url()));
  await page.goto('/ki-labor/werkbank/#nachtrag');
  const wb = page.locator('#nachtrag');
  await expect(wb).toBeVisible();
  await expect(page.locator('#lv-plausibilitaet')).toBeHidden();
  await expect(wb.locator('[data-prompt]')).toContainText('[FEHLT: Nachgetragene Leistung]');
  await wb.getByLabel('Nachgetragene Leistung').fill('Felsabtrag im Graben');
  await expect(wb.locator('[data-prompt]')).toContainText('Nachtrag: Felsabtrag im Graben');
  await expect(wb.locator('[data-prompt]')).not.toContainText('{{');
  const extern = anfragen.filter((u) => !u.startsWith(new URL(page.url()).origin));
  expect(extern).toEqual([]);
});

test('KI-Labor: Schnellprüfung rechnet ein LV im Browser nach', async ({ page }) => {
  await page.goto('/ki-labor/werkbank/#lv-plausibilitaet');
  const wb = page.locator('#lv-plausibilitaet');
  await wb.getByRole('button', { name: 'Beispiel einsetzen' }).click();
  const res = wb.locator('[data-pruefung]');
  await expect(res).toContainText('Rechenfehler');
  await expect(res).toContainText('Summenzeile stimmt nicht');
  await expect(res).toContainText('Doppelposition');
  await expect(wb.locator('.wb-fortschritt')).toContainText('vollständig');
  await expect(wb.locator('[data-prompt]')).toContainText('UNTERLAGE [DOK]');
});

test('KI-Labor: Offertvergleich erkennt Anbieter und Spekulationsverdacht', async ({ page }) => {
  await page.goto('/ki-labor/werkbank/');
  await page.getByRole('navigation', { name: 'Vorlagen' }).getByRole('link', { name: /Offerten vergleichen/ }).click();
  const wb = page.locator('#offertvergleich');
  await wb.getByRole('button', { name: 'Beispiel einsetzen' }).click();
  await expect(wb.locator('[data-pruefung]')).toContainText('Rangliste nach Total');
  await expect(wb.locator('[data-pruefung]')).toContainText('unter 50 %');
});

test('KI-Labor: Übersicht führt zu Werkbank, Nutzenrechner und Radar', async ({ page }) => {
  await page.goto('/ki-labor/');
  await expect(page.locator('.felder > li')).toHaveCount(10);
  await page.locator('.feld-link', { hasText: 'Zur Werkbank' }).first().click();
  await expect(page).toHaveURL(/\/ki-labor\/werkbank\/#lv-plausibilitaet$/);
  await expect(page.locator('#lv-plausibilitaet')).toBeVisible();
  await page.goto('/ki-labor/radar/');
  // Ohne frische Daten (lokal oder bei Ausfall der Quelle) erscheint ein Hinweis statt veralteter Zahlen
  const radar = page.locator('[data-radar], [data-radar-leer]');
  await expect(radar).toHaveCount(1);
  await expect(page.locator('main')).not.toContainText('LMArena');
  if (await page.locator('[data-radar]').count()) await expect(page.locator('[data-radar] [role="tabpanel"]:visible li').first()).toBeVisible();
});

test('Nutzenrechner rechnet in Franken und bietet Druck an', async ({ page }) => {
  await page.goto('/ki-labor/nutzenrechner/');
  const r = page.locator('[data-rechner]');
  await r.getByLabel('Teamgrösse').fill('12');
  await r.getByLabel('Stunden pro Woche und Person').fill('10');
  await r.getByLabel('Stundensatz', { exact: true }).fill('65');
  await expect(r.locator('[data-wert="kostenMonat"]')).toHaveText(/^CHF 33.800$/);
  await expect(r.locator('[data-wert="paybackMonate"]')).not.toHaveText('');
  await expect(r.locator('[data-wert="paybackRechnung"]')).toContainText('Monate');
  await expect(r.locator('.rk-erklaerung')).toContainText('Was ist der Simple Payback?');
  await expect(r.getByRole('button', { name: /Drucken/ })).toBeVisible();
  await expect(r).not.toContainText('Erstgespräch');
});

test('Kompetenz Netzbau zeigt die Übersichtsgrafik mit Legende und KI-Kennzeichnung', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Grafik: Vom Rechenzentrum bis ins Wohnzimmer/ }).click();
  await expect(page).toHaveURL(/netzinfrastruktur-leitungsbau\/#netz-uebersicht$/);
  const fig = page.locator('#netz-uebersicht');
  await expect(fig.locator('img')).toHaveAttribute('alt', /acht Schritten/);
  await expect(fig).toContainText('Hier arbeite ich');
  await expect(fig).toContainText('KI-generierte Illustration');
});

test('Kompetenz Netzbau zeigt das Kompetenzprofil mit Swisscom-Bezug und Hinweis, ohne interne Namen', async ({ page }) => {
  await page.goto('/kompetenzen/netzinfrastruktur-leitungsbau/');
  await expect(page.locator('.kp-karte')).toHaveCount(8);
  const main = page.locator('main');
  await expect(main).toContainText('Interessen der Swisscom als Bauherrin vertreten');
  await expect(main).toContainText('geben nicht die Haltung der Swisscom wieder');
  const text = (await main.innerText()).toLowerCase();
  for (const intern of ['cablex', 'swisscomgpt', 'c2 internal']) expect(text).not.toContain(intern);
});

test('Profil zeigt die Werdegang-Grafik vor den beruflichen Stationen', async ({ page }) => {
  await page.goto('/profil/');
  const fig = page.locator('#werdegang-grafik');
  await expect(fig.locator('img')).toHaveAttribute('alt', /Tiefbauzeichner zum Bauingenieur/);
  await expect(fig).toContainText('KI-generierte Illustration');
});
