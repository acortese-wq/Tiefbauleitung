// Holt öffentliche Daten für den «KI-Radar» im KI-Labor und schreibt src/data/ki-radar.json.
// Läuft im Build auf GitHub (täglich per Zeitplan), nicht im Browser der Besucher: keine Anfragen an Dritte beim Seitenaufruf.
// Schlägt eine Quelle fehl, bleiben ihre bisherigen Daten mit Datum erhalten; die Seite blendet veraltete Daten aus.
//
// Quellen (OpenRouter, Plattform mit Zugang zu über 400 Modellen vieler Anbieter):
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

let bisher = {};
try { bisher = JSON.parse(await readFile(ZIEL, 'utf8')); } catch { /* erste Ausführung */ }
const radar = { abgerufen: heute, neu: bisher.neu };

// Eine Nutzungsrangliste wird bewusst nicht mehr geladen: OpenRouter bietet dafür keine Schnittstelle, und das
// Auslesen der Rankings-Seite lieferte am 24.10.2026 eine falsche Reihenfolge. Die Seite verlinkt die Live-Ranglisten.
let modellListe = [];
try { modellListe = (await holeJson(MODELLE)).data ?? []; } catch (e) { console.warn(`! Modellliste: ${e.message}`); }

try {
  const data = modellListe;
  if (!data.length) throw new Error('leer');
  radar.neu = {
    quelle: 'https://openrouter.ai/models',
    stand: heute,
    modelle: data
      .filter((m) => m.created && !/:free$|batch/i.test(`${m.id} ${m.name}`))
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
