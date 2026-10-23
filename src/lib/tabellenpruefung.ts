// Schnellprüfung von Leistungsverzeichnissen, Offertvergleichen und Ausmassen – ohne KI, nur Rechnen im Browser.
// Eingabe: aus Excel kopierte Tabelle (Tabulator) oder CSV mit Semikolon. Erste Zeile darf Spaltenköpfe enthalten.

export type Stufe = 'fehler' | 'warnung' | 'hinweis' | 'ok';

export interface Befund {
  stufe: Stufe;
  titel: string;
  details?: string[];
}

export interface Kennzahl {
  label: string;
  wert: string;
}

export interface Pruefergebnis {
  art: 'lv' | 'offerten' | 'ausmass' | 'leer';
  spalten: string[];
  zeilen: number;
  kennzahlen: Kennzahl[];
  befunde: Befund[];
}

const mz = (n: number, eins: string, mehr: string) => `${n} ${n === 1 ? eins : mehr}`;
const chf = (n: number) => `CHF ${n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const prozent = (n: number) => `${n.toLocaleString('de-CH', { maximumFractionDigits: 1 })} %`;

/** Schweizer und deutsche Zahlenformate: 1'234.50 · 1 234,50 · 1.234,50 · 1234.5 */
export function zahl(roh: string | undefined): number | null {
  if (roh == null) return null;
  let s = roh.trim().replace(/^(chf|fr\.?)\s*/i, '').replace(/[’'\s]/g, '');
  if (!s || s === '-' || /^offen$/i.test(s)) return null;
  if (/,\d{1,2}$/.test(s) && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/,\d{1,3}$/.test(s) && !s.includes('.')) s = s.replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function zerlege(text: string): string[][] {
  const zeilen = text.replace(/\r/g, '').split('\n').filter((z) => z.trim());
  if (!zeilen.length) return [];
  const trenner = zeilen.some((z) => z.includes('\t')) ? '\t' : zeilen[0].includes(';') ? ';' : ',';
  return zeilen.map((z) => z.split(trenner).map((c) => c.trim()));
}

type Rolle = 'pos' | 'text' | 'menge' | 'einheit' | 'ep' | 'betrag' | 'vertrag' | 'ausmass';

const KOPF: [Rolle, RegExp][] = [
  ['pos', /^(pos|position|nr|npk)/i],
  ['text', /^(text|bezeichnung|beschrieb|leistung|kurztext)/i],
  ['vertrag', /^(vertrag|soll|devis|offert)\w*menge|^vertragsmenge|^menge\s*vertrag/i],
  ['ausmass', /^(ausmass|ist|ausgef|abgerechnet)/i],
  ['menge', /^(menge|anz|qty)/i],
  ['einheit', /^(einh|eh|me$|unit)/i],
  ['betrag', /^(betrag|total|summe|gesamt)/i],
  ['ep', /^(ep|e\.?p\.?|einheitspreis|preis)/i],
];

function erkenneKopf(zeile: string[]): (Rolle | 'anbieter' | null)[] | null {
  const rollen = zeile.map((c) => {
    for (const [r, re] of KOPF) if (re.test(c)) return r;
    return null;
  });
  const treffer = rollen.filter(Boolean).length;
  if (treffer < 2) return null;
  // Weitere Spalten mit Text im Kopf, aber ohne Rolle: Anbieter im Offertvergleich
  return rollen.map((r, i) => r ?? (zeile[i] && zahl(zeile[i]) == null ? 'anbieter' : null));
}

const STANDARD: Rolle[] = ['pos', 'text', 'menge', 'einheit', 'ep', 'betrag'];

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** Erwartete Einheit aus Stichworten im Positionstext (nur Hinweis, keine Regel). */
const EINHEITEN: [RegExp, string[]][] = [
  [/aushub|abtrag|baugrube|schüttung|hinterfüll|auffüll|beton(?!stein)|magerbeton|kies\b|fundationsschicht/i, ['m3', 'm³']],
  [/belag|planie|schalung|vlies|ansaat|humusier|pflästerung|abdichtung|fräsen/i, ['m2', 'm²']],
  [/rohr|leitung|graben|randstein|randabschluss|kabelschutz|kanal|rinne|leitschranke|geländer/i, ['m', 'lm']],
  [/schacht|deckel|abdeckung|stück|einlauf|anschluss|bogen|muffe/i, ['st', 'stk', 'stück']],
];

function einheitPasst(text: string, einheit: string): string | null {
  const e = norm(einheit).replace('.', '');
  if (!e || /^(gl|psch|pauschal|le|h|std|t|kg)$/.test(e)) return null;
  for (const [re, erlaubt] of EINHEITEN) {
    if (re.test(text)) return erlaubt.includes(e) ? null : erlaubt[0];
  }
  return null;
}

function median(werte: number[]): number {
  const s = [...werte].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function pruefe(text: string): Pruefergebnis {
  const tabelle = zerlege(text);
  if (!tabelle.length) return { art: 'leer', spalten: [], zeilen: 0, kennzahlen: [], befunde: [] };

  const kopf = erkenneKopf(tabelle[0]);
  const rollen: (Rolle | 'anbieter' | null)[] = kopf ?? tabelle[0].map((_, i) => STANDARD[i] ?? null);
  const daten = kopf ? tabelle.slice(1) : tabelle;
  const spaltenNamen = kopf ? tabelle[0] : rollen.map((r) => r ?? '–');
  const idx = (r: Rolle) => rollen.indexOf(r);
  const anbieter = rollen.map((r, i) => (r === 'anbieter' ? i : -1)).filter((i) => i >= 0);

  // Summenzeilen («Total», «Summe») nicht als Positionen behandeln
  const iText = idx('text');
  const istSumme = (z: string[]) => [z[iText], z[0]].some((c) => /^(total|summe|zwischensumme|gesamt)/i.test(c ?? ''));
  const positionen = daten.filter((z) => !istSumme(z));
  const summenZeile = daten.find(istSumme);

  const spalten = spaltenNamen.map((n, i) => `${n || '–'} → ${rollen[i] ?? 'ignoriert'}`);

  if (idx('vertrag') >= 0 && idx('ausmass') >= 0) return pruefeAusmass(positionen, rollen, spalten);
  if (anbieter.length >= 2) return pruefeOfferten(positionen, rollen, anbieter, spaltenNamen, spalten);
  return pruefeLv(positionen, rollen, spalten, summenZeile);
}

function pruefeLv(pos: string[][], rollen: (Rolle | 'anbieter' | null)[], spalten: string[], summenZeile?: string[]): Pruefergebnis {
  const i = (r: Rolle) => rollen.indexOf(r);
  const befunde: Befund[] = [];
  const rechen: string[] = [];
  const offen: string[] = [];
  const einheiten: string[] = [];
  const pauschal: string[] = [];
  const doppelt: string[] = [];
  const gesehen = new Map<string, string>();
  const betraege: { label: string; betrag: number }[] = [];
  let summe = 0;
  let aushub = 0;
  let graben = 0;

  for (const z of pos) {
    const nr = z[i('pos')] ?? '';
    const text = z[i('text')] ?? '';
    const label = [nr, text].filter(Boolean).join(' ').slice(0, 70) || '(ohne Bezeichnung)';
    const menge = zahl(z[i('menge')]);
    const einheit = z[i('einheit')] ?? '';
    const ep = i('ep') >= 0 ? zahl(z[i('ep')]) : null;
    const betrag = i('betrag') >= 0 ? zahl(z[i('betrag')]) : null;

    if (menge == null || menge === 0) offen.push(`${label}: Menge fehlt`);
    if (!einheit) offen.push(`${label}: Einheit fehlt`);
    if (i('ep') >= 0 && ep == null) offen.push(`${label}: Einheitspreis OFFEN`);

    if (menge != null && ep != null && betrag != null) {
      const soll = menge * ep;
      if (Math.abs(soll - betrag) > Math.max(0.05, Math.abs(soll) * 0.0005)) {
        rechen.push(`${label}: ${menge} × ${ep} = ${chf(soll)}, angegeben ${chf(betrag)}`);
      }
    }
    const b = betrag ?? (menge != null && ep != null ? menge * ep : null);
    if (b != null) {
      summe += b;
      betraege.push({ label, betrag: b });
    }

    const erwartet = einheitPasst(text, einheit);
    if (erwartet) einheiten.push(`${label}: Einheit «${einheit}», erwartet eher «${erwartet}»`);
    if (/^(gl|psch|pauschal|le)$/i.test(einheit.trim())) pauschal.push(label);

    const schluessel = norm(text);
    if (schluessel && gesehen.has(schluessel)) doppelt.push(`${label} (gleich wie ${gesehen.get(schluessel)})`);
    else if (schluessel) gesehen.set(schluessel, nr || text.slice(0, 30));
    if (nr && pos.filter((x) => (x[i('pos')] ?? '') === nr).length > 1 && !doppelt.some((d) => d.startsWith(nr))) {
      doppelt.push(`Positionsnummer ${nr} kommt mehrfach vor`);
    }

    if (menge != null && /aushub/i.test(text) && /m3|m³/i.test(einheit)) aushub += menge;
    if (menge != null && /graben/i.test(text) && /^(m|lm)$/i.test(einheit.trim())) graben += menge;
  }

  if (rechen.length) befunde.push({ stufe: 'fehler', titel: `${rechen.length} Rechenfehler (Menge × Einheitspreis ≠ Betrag)`, details: rechen });
  if (offen.length) befunde.push({ stufe: 'warnung', titel: mz(offen.length, 'fehlende Angabe', 'fehlende Angaben'), details: offen });
  if (doppelt.length) befunde.push({ stufe: 'warnung', titel: mz(doppelt.length, 'mögliche Doppelposition', 'mögliche Doppelpositionen'), details: doppelt });
  if (einheiten.length) befunde.push({ stufe: 'hinweis', titel: `${mz(einheiten.length, 'Einheit', 'Einheiten')} prüfen`, details: einheiten });

  const kennzahlen: Kennzahl[] = [{ label: 'Positionen', wert: String(pos.length) }];
  if (summe) {
    kennzahlen.push({ label: 'Summe berechnet', wert: chf(summe) });
    const sortiert = [...betraege].sort((a, b) => b.betrag - a.betrag);
    let kum = 0;
    let n = 0;
    for (const p of sortiert) {
      kum += p.betrag;
      n++;
      if (kum >= summe * 0.8) break;
    }
    kennzahlen.push({ label: '80 % der Summe in', wert: `${n} von ${pos.length} Positionen` });
    befunde.push({
      stufe: 'hinweis',
      titel: 'Kostentreiber: hier lohnt die genaue Prüfung',
      details: sortiert.slice(0, 5).map((p) => `${p.label}: ${chf(p.betrag)} (${prozent((p.betrag / summe) * 100)})`),
    });
    const pauschalSumme = betraege.filter((b) => pauschal.includes(b.label)).reduce((s, b) => s + b.betrag, 0);
    if (pauschalSumme / summe > 0.1) {
      befunde.push({ stufe: 'warnung', titel: `Pauschalen machen ${prozent((pauschalSumme / summe) * 100)} der Summe aus`, details: pauschal });
    }
    if (summenZeile) {
      const angegeben = summenZeile.map(zahl).filter((x): x is number => x != null).pop();
      if (angegeben != null && Math.abs(angegeben - summe) > 1) {
        befunde.push({ stufe: 'fehler', titel: 'Summenzeile stimmt nicht', details: [`angegeben ${chf(angegeben)}, berechnet ${chf(summe)}`] });
      }
    }
  }
  if (aushub && graben) kennzahlen.push({ label: 'Aushub pro Laufmeter Graben', wert: `${(aushub / graben).toLocaleString('de-CH', { maximumFractionDigits: 2 })} m³/m` });

  if (!befunde.some((b) => b.stufe === 'fehler' || b.stufe === 'warnung')) {
    befunde.unshift({ stufe: 'ok', titel: 'Keine Rechenfehler, keine fehlenden Angaben gefunden' });
  }
  return { art: 'lv', spalten, zeilen: pos.length, kennzahlen, befunde };
}

function pruefeOfferten(
  pos: string[][],
  rollen: (Rolle | 'anbieter' | null)[],
  anbieter: number[],
  namen: string[],
  spalten: string[],
): Pruefergebnis {
  const i = (r: Rolle) => rollen.indexOf(r);
  const totale = anbieter.map(() => 0);
  const ausreisser: string[] = [];
  const spekulativ: string[] = [];
  const fehlend: string[] = [];

  for (const z of pos) {
    const label = [z[i('pos')], z[i('text')]].filter(Boolean).join(' ').slice(0, 60) || '(ohne Bezeichnung)';
    const menge = zahl(z[i('menge')]) ?? 1;
    const preise = anbieter.map((s) => zahl(z[s]));
    const vorhanden = preise.filter((p): p is number => p != null && p > 0);
    preise.forEach((p, k) => {
      if (p == null) fehlend.push(`${namen[anbieter[k]]}: ${label}`);
      else totale[k] += p * menge;
    });
    if (vorhanden.length < 2) continue;
    const m = median(vorhanden);
    preise.forEach((p, k) => {
      if (p == null || !m) return;
      const abw = ((p - m) / m) * 100;
      if (p < m * 0.5) spekulativ.push(`${namen[anbieter[k]]}: ${label} – ${p} statt Median ${m.toFixed(2)} (${prozent(abw)})`);
      else if (Math.abs(abw) > 30) ausreisser.push(`${namen[anbieter[k]]}: ${label} – ${p} (${abw > 0 ? '+' : ''}${prozent(abw)} zum Median)`);
    });
  }

  const rangliste = anbieter
    .map((s, k) => ({ name: namen[s], total: totale[k] }))
    .sort((a, b) => a.total - b.total);
  const guenstigste = rangliste[0]?.total || 1;
  const befunde: Befund[] = [
    {
      stufe: 'hinweis',
      titel: 'Rangliste nach Total (Menge × Einheitspreis)',
      details: rangliste.map((r, k) => `${k + 1}. ${r.name}: ${chf(r.total)}${k ? ` (+${prozent(((r.total - guenstigste) / guenstigste) * 100)})` : ''}`),
    },
  ];
  if (spekulativ.length) befunde.push({ stufe: 'fehler', titel: `${mz(spekulativ.length, 'Preis', 'Preise')} unter 50 % des Medians (Spekulation oder Irrtum?)`, details: spekulativ });
  if (ausreisser.length) befunde.push({ stufe: 'warnung', titel: `${mz(ausreisser.length, 'Preis', 'Preise')} mehr als 30 % vom Median entfernt`, details: ausreisser });
  if (fehlend.length) befunde.push({ stufe: 'warnung', titel: `${mz(fehlend.length, 'Position', 'Positionen')} ohne Preis`, details: fehlend });

  return {
    art: 'offerten',
    spalten,
    zeilen: pos.length,
    kennzahlen: [
      { label: 'Positionen', wert: String(pos.length) },
      { label: 'Anbieter', wert: String(anbieter.length) },
      { label: 'Spanne', wert: rangliste.length > 1 ? prozent(((rangliste.at(-1)!.total - guenstigste) / guenstigste) * 100) : '–' },
    ],
    befunde,
  };
}

function pruefeAusmass(pos: string[][], rollen: (Rolle | 'anbieter' | null)[], spalten: string[]): Pruefergebnis {
  const i = (r: Rolle) => rollen.indexOf(r);
  const mehr: string[] = [];
  const neu: string[] = [];
  let differenz = 0;
  let mitPreis = false;
  for (const z of pos) {
    const label = [z[i('pos')], z[i('text')]].filter(Boolean).join(' ').slice(0, 60) || '(ohne Bezeichnung)';
    const vertrag = zahl(z[i('vertrag')]);
    const ist = zahl(z[i('ausmass')]);
    const ep = i('ep') >= 0 ? zahl(z[i('ep')]) : null;
    if (ist == null) continue;
    if (!vertrag) {
      neu.push(`${label}: ${ist} ohne Vertragsmenge (Nachtrag?)`);
      continue;
    }
    const abw = ((ist - vertrag) / vertrag) * 100;
    if (Math.abs(abw) > 10) {
      const geld = ep != null ? `, ${abw > 0 ? 'Mehrkosten' : 'Minderkosten'} ${chf(Math.abs((ist - vertrag) * ep))}` : '';
      mehr.push(`${label}: ${vertrag} → ${ist} (${abw > 0 ? '+' : ''}${prozent(abw)}${geld})`);
    }
    if (ep != null) {
      mitPreis = true;
      differenz += (ist - vertrag) * ep;
    }
  }
  const befunde: Befund[] = [];
  if (neu.length) befunde.push({ stufe: 'fehler', titel: `${mz(neu.length, 'Position', 'Positionen')} ohne Vertragsmenge`, details: neu });
  if (mehr.length) befunde.push({ stufe: 'warnung', titel: `${mehr.length === 1 ? '1 Position weicht' : `${mehr.length} Positionen weichen`} mehr als 10 % ab`, details: mehr });
  if (!befunde.length) befunde.push({ stufe: 'ok', titel: 'Alle Mengen innerhalb von ±10 % der Vertragsmenge' });
  const kennzahlen: Kennzahl[] = [{ label: 'Positionen', wert: String(pos.length) }];
  if (mitPreis) kennzahlen.push({ label: 'Differenz zum Vertrag', wert: `${differenz >= 0 ? '+' : '−'}${chf(Math.abs(differenz))}` });
  return { art: 'ausmass', spalten, zeilen: pos.length, kennzahlen, befunde };
}
