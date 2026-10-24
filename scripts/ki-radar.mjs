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
const RANGLISTE = (kategorie) =>
  `https://openrouter.ai/api/frontend/models/find?order=top-weekly${kategorie ? `&categories=${kategorie}` : ''}`;
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

try {
  const kategorien = {};
  for (const [schluessel, kat] of [['gesamt', ''], ['programmieren', 'programming']]) {
    try {
      const liste = leseRangliste(await holeJson(RANGLISTE(kat)));
      if (liste.length >= 5) kategorien[schluessel] = liste;
    } catch (e) { console.warn(`! Rangliste ${schluessel}: ${e.message}`); }
  }
  if (!kategorien.gesamt) throw new Error('keine verwertbare Gesamtrangliste');
  radar.nutzung = { quelle: 'https://openrouter.ai/rankings', stand: heute, kategorien };
  console.log(`✓ OpenRouter Rangliste: ${Object.keys(kategorien).join(', ')}; Rang 1: ${kategorien.gesamt[0].modell}`);
} catch (e) { console.warn(`! OpenRouter Rangliste nicht verfügbar, bisherige Daten bleiben: ${e.message}`); }

try {
  const { data } = await holeJson(MODELLE);
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
