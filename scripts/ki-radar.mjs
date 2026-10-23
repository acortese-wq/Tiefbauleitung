// Holt öffentliche Daten für den «KI-Radar» im KI-Labor und schreibt src/data/ki-radar.json.
// Läuft im Build auf GitHub (täglich per Zeitplan), nicht im Browser der Besucher: keine Anfragen an Dritte beim Seitenaufruf.
// Schlägt eine Quelle fehl, bleiben ihre bisherigen Daten erhalten. Der Build bricht nie wegen dieses Skripts ab.
//
// Quellen:
//  - LMArena (Chatbot Arena), Text-Rangliste aus Blindvergleichen: github.com/lmarena/arena-catalog
//  - OpenRouter, öffentliche Modellliste (ohne Schlüssel): openrouter.ai/api/v1/models
import { readFile, writeFile } from 'node:fs/promises';

const ZIEL = new URL('../src/data/ki-radar.json', import.meta.url);
const ARENA = 'https://raw.githubusercontent.com/lmarena/arena-catalog/main/data/leaderboard-text.json';
const ARENA_COMMITS = 'https://api.github.com/repos/lmarena/arena-catalog/commits?path=data/leaderboard-text.json&per_page=1';
const OPENROUTER = 'https://openrouter.ai/api/v1/models';

const ANBIETER = [
  [/^gemini|^gemma/i, 'Google'], [/^claude/i, 'Anthropic'], [/^(gpt|o\d|chatgpt)/i, 'OpenAI'], [/^grok/i, 'xAI'],
  [/^deepseek/i, 'DeepSeek'], [/^qwen/i, 'Alibaba'], [/^(llama|meta)/i, 'Meta'], [/^(mistral|magistral|codestral)/i, 'Mistral'],
  [/^ernie/i, 'Baidu'], [/^(kimi|moonshot)/i, 'Moonshot'], [/^glm/i, 'Zhipu'], [/^longcat/i, 'Meituan'], [/^(nova|amazon)/i, 'Amazon'],
  [/^(command|cohere)/i, 'Cohere'], [/^hunyuan/i, 'Tencent'], [/^minimax/i, 'MiniMax'],
];
const anbieter = (id) => ANBIETER.find(([re]) => re.test(id))?.[1] ?? '–';

async function holeJson(url) {
  const antwort = await fetch(url, { headers: { 'user-agent': 'tiefbauleitung.com KI-Radar', accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!antwort.ok) throw new Error(`${url}: HTTP ${antwort.status}`);
  return antwort.json();
}

const topN = (kategorie, n = 10) =>
  Object.entries(kategorie ?? {})
    .sort((a, b) => b[1].rating - a[1].rating)
    .slice(0, n)
    .map(([modell, w], i) => ({ rang: i + 1, modell, anbieter: anbieter(modell), score: Math.round(w.rating) }));

let bisher = {};
try { bisher = JSON.parse(await readFile(ZIEL, 'utf8')); } catch { /* erste Ausführung */ }
const radar = { ...bisher, abgerufen: new Date().toISOString().slice(0, 10) };

try {
  const daten = await holeJson(ARENA);
  let stand = null;
  try {
    const commits = await holeJson(ARENA_COMMITS);
    stand = commits?.[0]?.commit?.committer?.date?.slice(0, 10) ?? null;
  } catch (e) { console.warn(`! Datenstand LMArena nicht ermittelt: ${e.message}`); }
  radar.arena = {
    quelle: 'https://lmarena.ai/leaderboard',
    stand: stand ?? bisher.arena?.stand ?? null,
    kategorien: { gesamt: topN(daten.full), deutsch: topN(daten.german), programmieren: topN(daten.coding) },
  };
  console.log(`✓ LMArena: ${Object.keys(daten.full ?? {}).length} Modelle, Stand ${radar.arena.stand ?? 'unbekannt'}`);
} catch (e) { console.warn(`! LMArena nicht erreichbar, bisherige Daten bleiben: ${e.message}`); }

try {
  const { data } = await holeJson(OPENROUTER);
  radar.neu = {
    quelle: 'https://openrouter.ai/models',
    modelle: data
      .filter((m) => m.created && !/:free$/.test(m.id))
      .sort((a, b) => b.created - a.created)
      .slice(0, 8)
      .map((m) => ({
        name: String(m.name ?? m.id).replace(/^[^:]+:\s*/, ''),
        anbieter: String(m.name ?? '').includes(':') ? String(m.name).split(':')[0].trim() : m.id.split('/')[0],
        datum: new Date(m.created * 1000).toISOString().slice(0, 10),
        kontext: m.context_length ?? null,
      })),
  };
  console.log(`✓ OpenRouter: ${data.length} Modelle`);
} catch (e) { console.warn(`! OpenRouter nicht erreichbar, bisherige Daten bleiben: ${e.message}`); }

await writeFile(ZIEL, `${JSON.stringify(radar, null, 2)}\n`);
console.log(`KI-Radar geschrieben (${radar.abgerufen}).`);
