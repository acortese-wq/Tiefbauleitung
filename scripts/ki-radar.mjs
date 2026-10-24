// Holt öffentliche Daten für den «KI-Radar» im KI-Labor und schreibt src/data/ki-radar.json.
// Läuft im Build auf GitHub (täglich per Zeitplan), nicht im Browser der Besucher: keine Anfragen an Dritte beim Seitenaufruf.
// Schlägt eine Quelle fehl, bleiben ihre bisherigen Daten mit Datum erhalten; die Seite blendet veraltete Daten aus.
//
// Quellen (OpenRouter, Plattform mit Zugang zu über 400 Modellen vieler Anbieter):
//  - Meistgenutzte Modelle der Woche nach verarbeiteten Tokens: openrouter.ai/rankings
//    (Datenquelle der öffentlichen Rangliste; kein offiziell dokumentierter Endpunkt, deshalb tolerant gelesen)
//  - Neu verfügbare Modelle: offizielle Modellliste openrouter.ai/api/v1/models
// Die frühere Quelle LMArena (github.com/lmarena/arena-catalog) wird seit Dezember 2025 nicht mehr nachgeführt.
import { readFile, writeFile } from 'node:fs/promises';

const ZIEL = new URL('../src/data/ki-radar.json', import.meta.url);
const MODELLE = 'https://openrouter.ai/api/v1/models';
const heute = new Date().toISOString().slice(0, 10);

async function holeJson(url) {
  const antwort = await fetch(url, { headers: { 'user-agent': 'tiefbauleitung.com KI-Radar', accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!antwort.ok) throw new Error(`${url}: HTTP ${antwort.status}`);
  return antwort.json();
}

const ohnePraefix = (name) => String(name ?? '').replace(/^[^:]+:\s*/, '');
const anbieterVon = (m) => {
  const name = String(m.name ?? '');
  if (name.includes(':')) return name.split(':')[0].trim();
  return String(m.author ?? m.slug ?? m.id ?? '').split('/')[0];
};

/** Liest die Rangliste unabhängig davon, ob die Modelle unter data.models, data oder models liegen. */
function leseRangliste(json, n = 10) {
  const liste = [json?.data?.models, json?.data, json?.models].find(Array.isArray) ?? [];
  return liste
    .filter((m) => m && (m.name || m.slug) && !/:free$/.test(m.slug ?? m.id ?? ''))
    .slice(0, n)
    .map((m, i) => ({ rang: i + 1, modell: ohnePraefix(m.short_name ?? m.name ?? m.slug), anbieter: anbieterVon(m) }));
}

let bisher = {};
try { bisher = JSON.parse(await readFile(ZIEL, 'utf8')); } catch { /* erste Ausführung */ }
const radar = { abgerufen: heute, nutzung: bisher.nutzung, neu: bisher.neu };

// Rangliste: mehrere Wege, weil OpenRouter dafür keine dokumentierte Schnittstelle anbietet.
// 1) JSON-Endpunkte der Webseite, 2) Rankings-Seite, 3) Modellseite nach Wochennutzung (Reihenfolge der Modell-Links).
const KANDIDATEN_JSON = [
  'https://openrouter.ai/api/frontend/models/find?order=top-weekly',
  'https://openrouter.ai/api/frontend/models?order=top-weekly',
];
const KANDIDATEN_HTML = ['https://openrouter.ai/rankings', 'https://openrouter.ai/models?order=top-weekly'];

async function holeText(url) {
  const antwort = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (tiefbauleitung.com KI-Radar)', accept: 'text/html' }, signal: AbortSignal.timeout(20000) });
  if (!antwort.ok) throw new Error(`${url}: HTTP ${antwort.status}`);
  return antwort.text();
}

/** Modell-Slugs («anbieter/modell») in der Reihenfolge ihres ersten Auftretens im HTML bzw. eingebetteten Daten. */
function slugsAusHtml(html, bekannt) {
  const gesehen = [];
  for (const m of html.matchAll(/(?:href=\\?"\/|"(?:permaslug|slug)\\?":\\?")([a-z0-9-]+\/[a-z0-9.\-:]+)/gi)) {
    const slug = m[1].replace(/:.*$/, '').toLowerCase();
    if (bekannt.has(slug) && !gesehen.includes(slug)) gesehen.push(slug);
  }
  return gesehen;
}

let modellListe = [];
try { modellListe = (await holeJson(MODELLE)).data ?? []; } catch (e) { console.warn(`! Modellliste: ${e.message}`); }
const nachSlug = new Map(modellListe.map((m) => [String(m.id).replace(/:.*$/, '').toLowerCase(), m]));

let gesamt = [];
for (const url of KANDIDATEN_JSON) {
  try {
    gesamt = leseRangliste(await holeJson(url));
    if (gesamt.length >= 5) { console.log(`✓ Rangliste aus ${url}`); break; }
    console.warn(`! ${url}: kein verwertbares Format`);
  } catch (e) { console.warn(`! ${e.message}`); }
}
if (gesamt.length < 5 && nachSlug.size) {
  for (const url of KANDIDATEN_HTML) {
    try {
      const slugs = slugsAusHtml(await holeText(url), new Set(nachSlug.keys()));
      console.log(`  ${url}: ${slugs.length} Modelle erkannt`);
      if (slugs.length >= 5) {
        gesamt = slugs.slice(0, 10).map((slug, i) => {
          const m = nachSlug.get(slug);
          return { rang: i + 1, modell: ohnePraefix(m.name ?? slug), anbieter: anbieterVon(m) };
        });
        console.log(`✓ Rangliste aus ${url}`);
        break;
      }
    } catch (e) { console.warn(`! ${e.message}`); }
  }
}
if (gesamt.length >= 5) {
  radar.nutzung = { quelle: 'https://openrouter.ai/rankings', stand: heute, kategorien: { gesamt } };
  console.log(`✓ OpenRouter Rangliste: ${gesamt.map((e) => e.modell).join(' · ')}`);
} else {
  console.warn('! OpenRouter Rangliste nicht verfügbar, bisherige Daten bleiben (die Seite blendet sie nach 14 Tagen aus).');
}

try {
  const data = modellListe;
  if (!data.length) throw new Error('leer');
  radar.neu = {
    quelle: 'https://openrouter.ai/models',
    stand: heute,
    modelle: data
      .filter((m) => m.created && !/:free$/.test(m.id))
      .sort((a, b) => b.created - a.created)
      .slice(0, 8)
      .map((m) => ({
        name: ohnePraefix(m.name ?? m.id),
        anbieter: anbieterVon(m),
        datum: new Date(m.created * 1000).toISOString().slice(0, 10),
        kontext: m.context_length ?? null,
      })),
  };
  console.log(`✓ OpenRouter Modellliste: ${data.length} Modelle`);
} catch (e) { console.warn(`! OpenRouter Modellliste nicht erreichbar, bisherige Daten bleiben: ${e.message}`); }

await writeFile(ZIEL, `${JSON.stringify(radar, null, 2)}\n`);
console.log(`KI-Radar geschrieben (${radar.abgerufen}).`);
