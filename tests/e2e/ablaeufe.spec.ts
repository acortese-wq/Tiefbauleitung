import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

test('Startseite zeigt das Bildband «Vom Rechenzentrum bis ins Wohnzimmer» als beschriebenes Video', async ({ page }) => {
  await page.goto('/');
  const band = page.getByRole('region', { name: 'Vom Rechenzentrum bis ins Wohnzimmer' });
  await expect(band.locator('video')).toHaveAttribute('aria-describedby', 'weg-video-text');
  await expect(band.locator('#weg-video-text')).toContainText('Hausanschluss');
  await expect(band.locator('img')).toHaveCount(0);
});

test('Werkzeugkasten zeigt freigegebene Werkzeuge mit Urheberangabe', async ({ page }) => {
  await page.goto('/projekte/#werkzeugkasten');
  const karten = page.locator('#werkzeugkasten .wk-karte');
  await expect(karten).toHaveCount(11);
  await expect(page.locator('#werkzeugkasten')).toContainText('Urheber: Alessandro Cortese');
  await expect(page.locator('#werkzeugkasten')).toContainText('Stärkste Arbeit im Kurs');
  await expect(page.locator('#werkzeugkasten')).toContainText('Tiefbaukooperations-Agent');
  await expect(page.locator('#werkzeugkasten')).toContainText('Offertkontrolle für Team und Partner');
  await expect(page.locator('#werkzeugkasten')).not.toContainText(/Füllrate|DLV/);
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
  await expect(netzbau.locator('.perspektive')).toHaveCount(4);
  await expect(netzbau.locator('.perspektive', { hasText: '2013–2021' })).toContainText('Werkeigentümer');
  await expect(netzbau.locator('.perspektive', { hasText: '2013–2021' }).getByRole('link', { name: 'Sassal' })).toHaveAttribute('href', '/projekte/plessurbruecke-sassal/');
  await expect(netzbau.locator('.zitat')).toContainText('Interessen aller Beteiligten');
  await expect(netzbau.locator('.zitat')).toContainText('Schlusszeugnis 2025');
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
  // Jeder Schwerpunkt ist ein Link mit Nutzen für Auftraggeber
  await expect(bp.locator('.bp-schwerpunkte a')).toHaveCount(13);
  await expect(bp.locator('.bp-arbeitsweise li')).toHaveCount(6);
  await expect(bp).toContainText('Netzinfrastruktur, FTTH-Ausbau');
  await bp.getByRole('link', { name: /Ausmass-, Offert- und Rechnungsprüfung/ }).click();
  await expect(page).toHaveURL(/ki-labor\/werkbank\/#lv-plausibilitaet$/);
});

test('Referenz Jenins zeigt Ort, Kurzbeschrieb, Netzbau-Filter und Link zur Fallstudie', async ({ page }) => {
  await page.goto('/projekte/');
  const eintrag = page.locator('.ref-liste li', { hasText: 'Ortsdurchfahrt Jenins' });
  await expect(eintrag).toContainText('2018');
  await expect(eintrag.locator('.ref-kurz')).toContainText('Kabelschutzrohren');
  await eintrag.getByRole('link', { name: /^Infos/ }).click();
  await expect(page.locator('h1')).toContainText('Ortsdurchfahrt Jenins');
  // Keine Namen von Beteiligten, Kosten oder Grundstücke
  const text = await page.locator('main').innerText();
  for (const intern of ['Swisscom', 'Franken', 'Parzelle']) expect(text).not.toContain(intern);
});

test('Referenz Plessurbrücke Sassal zeigt Jahre, Bild und Fallstudie ohne Namen von Beteiligten', async ({ page }) => {
  await page.goto('/projekte/');
  const eintrag = page.locator('.ref-liste li', { hasText: 'Plessurbrücke Sassal' });
  await expect(eintrag).toContainText('2020–2021');
  await eintrag.getByRole('link', { name: /^Infos/ }).click();
  await expect(page.locator('h1')).toContainText('Plessurbrücke Sassal');
  await expect(page.locator('main img[src*="sassal-werkleitungen"]')).toHaveCount(1);
  const text = await page.locator('main').innerText();
  for (const intern of ['Swisscom', 'Parzelle']) expect(text).not.toContain(intern);
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
  await expect(page.getByRole('link', { name: /OpenRouter Rankings/ })).toHaveAttribute('href', 'https://openrouter.ai/rankings');
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

test('Kernaussage erscheint als Zitat auf Startseite und im KI-Labor', async ({ page }) => {
  for (const pfad of ['/', '/ki-labor/']) {
    await page.goto(pfad);
    const k = page.locator('.kernaussage');
    await expect(k).toContainText('Die KI liefert das Tempo');
    await expect(k.locator('figcaption')).toContainText('Alessandro Cortese');
  }
});

test('Kennzahlen zählen hoch und enden beim Wert aus dem HTML', async ({ page }) => {
  await page.goto('/');
  const werte = page.locator('[data-zaehlen]');
  await page.locator('.kennzahlen').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await expect(werte).toHaveText(['30+', '25', '17', '2'], { timeout: 5000 });
  // Beim Drucken stehen die Endwerte sofort da
  await page.goto('/');
  await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
  expect(await werte.allTextContents()).toEqual(['30+', '25', '17', '2']);
});

test('Mit reduzierter Bewegung: Kennzahlen sofort, keine Seitenübergänge, kein Lesefortschritt', async ({ browser }) => {
  const kontext = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await kontext.newPage();
  await page.goto('/');
  expect(await page.locator('[data-zaehlen]').allTextContents()).toEqual(['30+', '25', '17', '2']);
  expect(await page.locator('.kopf').evaluate((e) => getComputedStyle(e).viewTransitionName)).toBe('none');
  await page.goto('/projekte/plessurbruecke-sassal/');
  expect(await page.locator('.kopf').evaluate((e) => getComputedStyle(e, '::after').content)).toBe('none');
  await kontext.close();
});

test('Fallstudie zeigt den Lesefortschritt unter der Kopfzeile', async ({ page }) => {
  await page.goto('/projekte/plessurbruecke-sassal/');
  await expect(page.locator('[data-lesefortschritt]')).toHaveCount(1);
  const fortschritt = () => page.locator('.kopf').evaluate((e) => getComputedStyle(e, '::after').scale);
  expect(await fortschritt()).toMatch(/^0( 1)?$/);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(fortschritt).toMatch(/^1( 1)?$/);
});

test('Werdegang: Stationen leuchten auf, sobald die Trasse sie erreicht', async ({ page }) => {
  await page.goto('/profil/');
  const erste = page.locator('.zeitachse > li').first();
  await erste.evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.evaluate(() => window.scrollBy({ top: -innerHeight / 3, behavior: 'instant' }));
  await expect.poll(() => erste.evaluate((e) => getComputedStyle(e, '::before').backgroundColor)).toBe('rgb(143, 211, 255)');
  const letzte = page.locator('.zeitachse > li').last();
  expect(await letzte.evaluate((e) => getComputedStyle(e, '::before').backgroundColor)).toBe('rgb(10, 15, 20)');
});

test('Fallstudien und Referenzen nennen keine Protokolle oder Sitzungen', async ({ page }) => {
  await page.goto('/projekte/');
  const pfade = await page.locator('main a[href^="/projekte/"]').evaluateAll((links) =>
    [...new Set(links.map((a) => a.getAttribute('href') ?? '').filter((h) => /^\/projekte\/[^#]+\/$/.test(h)))],
  );
  expect(pfade.length).toBeGreaterThan(8);
  for (const pfad of ['/projekte/', ...pfade]) {
    await page.goto(pfad);
    const text = (await page.locator('main').innerText()).toLowerCase();
    for (const wort of ['protokoll', 'sitzung', 'rapport', 'jour fixe', 'pendenz']) expect(text, `«${wort}» auf ${pfad}`).not.toContain(wort);
  }
});

// Netzbau-Quiz: beantwortet eine Runde; mit «richtig» anhand des Fragenpools (Rechenaufgaben stehen nicht im Pool)
async function spieleRunde(page: Page, richtig: boolean, hooks: { vorPruefen?: (i: number) => Promise<void>; nachPruefen?: (i: number) => Promise<void> } = {}) {
  const pool: { frage: string; antworten: { text: string; richtig: boolean }[] }[] = JSON.parse((await page.locator('[data-quiz-pool]').textContent()) ?? '[]');
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('[data-stand]')).toHaveText(`Frage ${i + 1} von 10`);
    const fragetext = await page.locator('[data-fragetext]').textContent();
    const f = pool.find((x) => x.frage === fragetext);
    const antworten = page.locator('.qz-antwort');
    if (richtig && f) {
      for (const a of await antworten.all()) {
        const text = await a.locator('.qz-text').textContent();
        if (f.antworten.find((x) => x.text === text)?.richtig) await a.click();
      }
    } else await antworten.first().click();
    await hooks.vorPruefen?.(i);
    await page.getByRole('button', { name: 'Antwort prüfen' }).click();
    await expect(page.locator('[data-rueckmeldung]')).toBeVisible();
    await hooks.nachPruefen?.(i);
    await page.locator('[data-weiter]').click();
  }
}

test('Netzbau-Quiz: Runde mit Fortschritt, Erklärung, KI-Potenzial, Ergebnis, Bestwert und Zertifikat', async ({ page }) => {
  await page.goto('/netzbau-quiz/');
  await page.locator('.qz-karte', { hasText: 'BHV' }).click();
  await page.getByRole('button', { name: /Quiz starten/ }).click();
  await expect(page.locator('[data-stufe-anzeige]')).toContainText('BHV');
  const axeFrage = await new AxeBuilder({ page }).include('[data-quiz]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axeFrage.violations.map((v) => v.id)).toEqual([]);
  await spieleRunde(page, true, {
    nachPruefen: async (i) => {
      if (i !== 0) return;
      await expect(page.locator('.qz-ki')).toContainText('KI-Potenzial');
      await expect(page.locator('[data-rm-erklaerung]')).not.toBeEmpty();
      await expect(page.locator('[data-pruefen]')).toBeHidden();
      expect(await page.locator('[data-fortschritt]').evaluate((e) => (e as HTMLProgressElement).value)).toBe(1);
    },
  });
  await expect(page.locator('[data-erg-titel]')).toContainText('von 10 richtig');
  await expect(page.locator('[data-kategorien] li').first()).toBeVisible();
  const axeErgebnis = await new AxeBuilder({ page }).include('[data-quiz]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axeErgebnis.violations.map((v) => v.id)).toEqual([]);

  // Bestwert lokal gespeichert und nach dem Neuladen sichtbar
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('netzbau-quiz-bestwerte'))) ?? '[]')).toHaveLength(1);
  // Zertifikat: alle Fachfragen richtig, höchstens die eine Rechenaufgabe falsch, also mindestens 90 %
  await expect(page.locator('[data-zert-ok]')).toBeVisible();
  await page.evaluate(() => { window.print = () => document.body.setAttribute('data-gedruckt', 'ja'); });
  await page.fill('[data-zert-name]', 'Test Person');
  await page.getByRole('button', { name: 'Zertifikat als PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-gedruckt', 'ja');
  await expect(page.locator('body')).toHaveClass(/druck-zertifikat/);
  await expect(page.locator('[data-zt-name]')).toHaveText('Test Person');
  await expect(page.locator('[data-zt-text]')).toContainText('bestanden');
  await expect(page.locator('.qz-zertifikat')).toContainText('Keine offizielle Qualifikation');
  await page.reload();
  await expect(page.locator('[data-bestwerte] tbody tr')).toHaveCount(1);
});

test('Netzbau-Quiz: Zeitmodus zählt herunter und wertet abgelaufene Fragen als falsch', async ({ page }) => {
  await page.clock.install();
  await page.goto('/netzbau-quiz/');
  await page.locator('.qz-karte', { hasText: 'Zeitmodus' }).click();
  await page.getByRole('button', { name: /Quiz starten/ }).click();
  await expect(page.locator('[data-timer]')).toBeVisible();
  const start = Number((await page.locator('[data-timer-text]').textContent())?.replace(/\D/g, ''));
  expect(start).toBeGreaterThanOrEqual(45);
  await page.clock.runFor(10_000);
  expect(Number((await page.locator('[data-timer-text]').textContent())?.replace(/\D/g, ''))).toBeLessThan(start);
  await page.clock.runFor(120_000);
  await expect(page.locator('[data-rm-titel]')).toHaveText('Die Zeit ist abgelaufen.');
  await expect(page.locator('[data-punkte]')).toHaveText('0');
});

test('Netzbau-Quiz: Spezialbereich stellt Kosten-, Ausmass- und Regieaufgaben mit Rechengenerator', async ({ page }) => {
  await page.goto('/netzbau-quiz/');
  await page.locator('.qz-karte', { hasText: 'Spezialbereich Kosten' }).click();
  await page.getByRole('button', { name: /Quiz starten/ }).click();
  let rechenaufgaben = 0;
  await spieleRunde(page, false, {
    vorPruefen: async () => {
      const meta = (await page.locator('[data-meta]').textContent()) ?? '';
      expect(meta).toContain('Kosten, Ausmass und Regie');
      if (meta.includes('Rechenaufgabe')) rechenaufgaben++;
    },
  });
  expect(rechenaufgaben).toBeGreaterThanOrEqual(4);
});

test('Probierfrage aus dem Netzbau-Quiz auf Startseite und Kompetenz Netzbau', async ({ page }) => {
  for (const pfad of ['/', '/kompetenzen/netzinfrastruktur-leitungsbau/']) {
    await page.goto(pfad);
    const block = page.locator('[data-quiz-teaser]');
    await expect(block.locator('.qt-antwort').first()).toBeVisible();
    await block.locator('.qt-antwort').first().click();
    await expect(block.locator('[data-qt-urteil]')).toHaveText(/^(Richtig\.|Nicht ganz\.)/);
    await expect(block.getByRole('link', { name: /Quiz/ })).toHaveAttribute('href', /netzbau-quiz/);
  }
  // Auf der Kompetenzseite steht die Probierfrage direkt nach der Netz-Übersicht
  expect(await page.evaluate(() => {
    const grafik = document.querySelector('#netz-uebersicht');
    const block = document.querySelector('[data-quiz-teaser]');
    return !!grafik && !!block && !!(grafik.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING) && !!block.closest('.prosa');
  })).toBe(true);
});

test('Grafiken öffnen sich vergrössert und lassen sich mit ×, Esc und Klick daneben wieder schliessen', async ({ page }) => {
  for (const [pfad, grafik] of [['/profil/', '#werdegang-grafik'], ['/kompetenzen/netzinfrastruktur-leitungsbau/', '#netz-uebersicht']]) {
    await page.goto(pfad);
    const dialog = page.locator('[data-bildzoom]');
    const vorschau = page.locator(`${grafik} picture`);
    await vorschau.scrollIntoViewIfNeeded();
    // Öffnen und mit × schliessen; die Seite bleibt dieselbe
    await vorschau.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveJSProperty('complete', true);
    expect(await dialog.locator('img').evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(1000);
    await expect(page).toHaveURL(new RegExp(`${pfad}$`));
    await page.getByRole('button', { name: 'Vergrösserung schliessen' }).click();
    await expect(dialog).toBeHidden();
    // Esc
    await vorschau.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    // Klick neben das Bild
    await page.locator(`${grafik} figcaption a`).click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, (page.viewportSize()?.height ?? 600) - 5);
    await expect(dialog).toBeHidden();
  }
});

test('Profil zeigt Zitate aus dem Schlusszeugnis 2025, ohne Geburtsdatum und ohne Namen der Unterzeichnenden', async ({ page }) => {
  await page.goto('/profil/');
  const zeugnisse = page.locator('section[aria-labelledby="zeugnis-titel"]');
  await expect(zeugnisse.locator('.zeugnis-gross')).toContainText('umfassend, sicher und vollkommen');
  await expect(zeugnisse.locator('.zeugnis-gross')).toContainText('Schlusszeugnis 2025');
  await expect(zeugnisse).toContainText('Wir bedauern seinen Austritt sehr');
  await expect(zeugnisse).toContainText('zum Leiter Projektierung/Bau');
  await expect(page.locator('.zeitachse')).toContainText('Aufgrund guter Leistungen aus der Bauleitung befördert');
  for (const pfad of ['/', '/profil/', '/kompetenzen/netzinfrastruktur-leitungsbau/']) {
    await page.goto(pfad);
    const text = await page.locator('body').innerText();
    for (const privat of ['1977', 'Hartmann', 'Kaufmann']) expect(text, `${privat} auf ${pfad}`).not.toContain(privat);
  }
});

test('Video auf der Startseite: Standbild, Kennzeichnung, startet sichtbar und lässt sich anhalten', async ({ page }) => {
  await page.goto('/');
  const figur = page.locator('[data-weg-video]');
  const video = figur.locator('video');
  await expect(video).toHaveAttribute('poster', /rechenzentrum-wohnzimmer-v2-poster\.webp$/);
  await expect(video.locator('source[type="video/webm"]')).toHaveCount(1);
  await expect(figur.locator('figcaption')).toContainText('KI-generiertes Video');
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop && !v.controls)).toBe(true);
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused), { timeout: 10_000 }).toBe(true);
  const knopf = figur.getByRole('button', { name: 'Video anhalten' });
  await knopf.click();
  await expect(figur.getByRole('button', { name: 'Video abspielen' })).toBeVisible();
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('Video auf der Startseite startet bei «Bewegung reduzieren» nicht von selbst', async ({ browser }) => {
  const kontext = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await kontext.newPage();
  await page.goto('/');
  const video = page.locator('[data-weg-video] video');
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.locator('[data-weg-video]').getByRole('button', { name: 'Video abspielen' }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused), { timeout: 10_000 }).toBe(true);
  await kontext.close();
});

test('Gesetzesprüfung: Beispiel liefert Fundstellen nach Ebene, Fristen, Quellen und Prompt', async ({ page }) => {
  await page.goto('/ki-labor/');
  await page.getByRole('link', { name: /Gesetzesprüfung/ }).click();
  await expect(page).toHaveURL(/\/ki-labor\/gesetzespruefung\/$/);
  const gp = page.locator('[data-gesetz]');
  await expect(gp.locator('[data-kanton]')).toHaveValue('GR');
  await gp.getByRole('button', { name: 'Beispiel einsetzen' }).click();
  await expect(gp.locator('.gp-dok')).toHaveCount(1);
  await expect(gp.locator('.gp-dok select')).toHaveValue('gemeinde');

  const gemeinde = gp.locator('.gp-ebene[data-ebene="gemeinde"]');
  await expect(gemeinde.locator('.gp-fund header strong', { hasText: 'Art. 3 Bewilligungspflicht' })).toHaveCount(1);
  await expect(gemeinde.locator('.gp-fund mark').first()).toBeVisible();
  await expect(gp.locator('.gp-ebene[data-ebene="bund"]')).toContainText('Kein Bundesrecht eingefügt');
  await expect(gp.locator('.gp-ebene[data-ebene="bund"] a')).toHaveAttribute('href', /fedlex\.admin\.ch/);
  await expect(gp.locator('.gp-ebene[data-ebene="kanton"] a').first()).toHaveAttribute('href', 'https://www.gr-lex.gr.ch');
  await expect(gp.locator('.gp-fristen')).toContainText('während fünf Jahren');

  const prompt = gp.locator('[data-prompt]');
  await expect(prompt).toContainText('Gemeinde Musterdorf, Kanton Graubünden, Schweiz');
  await expect(prompt).toContainText('Art. 3 Bewilligungspflicht');
  await expect(prompt.locator('mark')).toHaveCount(0);
  const axe = await new AxeBuilder({ page }).include('[data-gesetz]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);

  await gp.getByRole('button', { name: /neuer Belag/ }).click();
  await expect(gemeinde.locator('.gp-fund header strong').first()).toHaveText('Art. 6 Aufbruchsperre');
  await gp.locator('.gp-dok select').selectOption('kanton');
  await expect(gp.locator('.gp-ebene[data-ebene="kanton"] .gp-fund').first()).toBeVisible();
  await gp.getByRole('button', { name: 'Entfernen: Beispielreglement (fiktiv)' }).click();
  await expect(gp.locator('.gp-dok')).toHaveCount(0);
  await expect(gp.locator('[data-leer]')).toBeVisible();
});

test('Gesetzesprüfung liest eine PDF im Browser und ordnet sie dem Bund zu', async ({ page, context }) => {
  const druck = await context.newPage();
  await druck.setContent(`<!doctype html><html lang="de"><body style="font-family: sans-serif">
    <p>Bundesgesetz über Musterleitungen (Musterleitungsgesetz, MLG)</p>
    <p>vom 1. Juni 2020 (Stand am 1. Januar 2026)</p>
    <p>Die Bundesversammlung der Schweizerischen Eidgenossenschaft beschliesst:</p>
    <p>Art. 1 Zweck</p><p>1 Dieses Gesetz regelt fiktive Musterleitungen.</p>
    <p>Art. 2 Benützung von Boden im Gemeingebrauch</p>
    <p>1 Die Eigentümer von Strassen müssen Leitungen dulden.</p>
    <p>2 Die Bewilligung ist innert 60 Tagen zu erteilen.</p>
  </body></html>`);
  const pdf = await druck.pdf({ format: 'A4' });
  await druck.close();

  await page.goto('/ki-labor/gesetzespruefung/');
  const gp = page.locator('[data-gesetz]');
  await gp.locator('[data-frage]').fill('Muss die Gemeinde Leitungen in der Strasse bewilligen, und innert welcher Frist?');
  await gp.locator('[data-datei]').setInputFiles({ name: 'musterleitungsgesetz.pdf', mimeType: 'application/pdf', buffer: pdf });
  await expect(gp.locator('[data-status]')).toContainText('erkannt als Bundesrecht', { timeout: 20_000 });
  await expect(gp.locator('.gp-dok')).toContainText('2 Artikel');
  await expect(gp.locator('.gp-dok')).toContainText('Stand 1. Januar 2026');
  const bund = gp.locator('.gp-ebene[data-ebene="bund"]');
  await expect(bund.locator('.gp-fund header strong').first()).toHaveText('Art. 2 Benützung von Boden im Gemeingebrauch');
  await expect(gp.locator('.gp-fristen')).toContainText('innert 60 Tagen');
  await expect(gp.locator('[data-prompt]')).toContainText('Bundesrecht: Bundesgesetz über Musterleitungen');
});

test('Jahreswerte 2021–2025 mit Link zum Strassenbauprogramm auf Profil und Startseite', async ({ page }) => {
  for (const pfad of ['/profil/', '/']) {
    await page.goto(pfad);
    await expect(page.getByText(/rund 25 Mio\. CHF pro Jahr: 12 Mio\. baulicher Unterhalt/).first()).toBeVisible();
    const link = page.getByRole('link', { name: /Strassenbauprogramm 2021–2024/ }).first();
    await expect(link).toHaveAttribute('href', /^https:\/\/www\.gr\.ch\/.*bericht_strassenbauprogramm_2021-2024\.pdf$/);
    await expect(link).toHaveAttribute('target', '_blank');
  }
});
