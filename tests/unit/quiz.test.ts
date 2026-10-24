import { describe, it, expect } from 'vitest';
import { quizFragen } from '../../src/data/quiz-fragen';
import {
  STUFEN, KATEGORIEN, GENERATOR_TYPEN, auswerten, generiere, generiereTyp, istRichtig, punkte, waehleRunde, zufallsgenerator,
  type Frage, type Stufe,
} from '../../src/lib/quiz';

const SCHEMAS = ['ftth', 'schacht', 'muffe', 'graben', 'hausanschluss'];
/** Schweizer Zahlformat zurück in eine Zahl: 2’318.40 → 2318.4. Das Tausenderzeichen hängt von der ICU-Version ab (’ oder '). */
const num = (s: string) => Number(s.replace(/\u2212/g, '-').replace(/[^\d.+-]/g, ''));
/** Zahl im Fragetext, unabhängig vom Tausenderzeichen */
const Z = String.raw`[\d’'\u00a0\u202f]+`;
const richtigeAntwort = (f: Frage) => f.antworten.find((a) => a.richtig)!.text;

describe('Fragenpool', () => {
  it('hat eindeutige IDs und gültige Antworten je Fragetyp', () => {
    expect(new Set(quizFragen.map((f) => f.id)).size).toBe(quizFragen.length);
    for (const f of quizFragen) {
      const r = f.antworten.filter((a) => a.richtig).length;
      if (f.typ === 'einfach') expect([r, f.antworten.length], f.id).toEqual([1, 4]);
      if (f.typ === 'mehrfach') expect(r >= 2 && r <= 3 && f.antworten.length >= 4 && f.antworten.length <= 5, f.id).toBe(true);
      if (f.typ === 'wahr-falsch') expect(f.antworten.map((a) => a.text), f.id).toEqual(['Wahr', 'Falsch']);
      expect(new Set(f.antworten.map((a) => a.text)).size, f.id).toBe(f.antworten.length);
    }
  });

  it('hält Längen, Rechtschreibung und Vertraulichkeit ein', () => {
    for (const f of quizFragen) {
      expect(f.frage.length, f.id).toBeLessThanOrEqual(220);
      expect(f.erklaerung.length, f.id).toBeLessThanOrEqual(400);
      for (const a of f.antworten) expect(a.text.length, `${f.id}: ${a.text}`).toBeLessThanOrEqual(140);
      const text = JSON.stringify(f);
      expect(text, f.id).not.toContain('ß');
      for (const intern of ['Swisscom', 'Cablex', 'Sunrise', 'Salt', 'Protokoll', 'Sitzung']) expect(text, `${f.id}: ${intern}`).not.toContain(intern);
      if (f.bild) expect(SCHEMAS, f.id).toContain(f.bild);
    }
  });

  it('deckt jede Stufe mit allen Kategorien ab und hat genug Fragen für den Spezialbereich', () => {
    for (const s of STUFEN) {
      const fragen = quizFragen.filter((f) => f.stufe === s.id);
      expect(fragen.length, s.id).toBeGreaterThanOrEqual(30);
      expect(new Set(fragen.map((f) => f.kategorie)).size, s.id).toBe(Object.keys(KATEGORIEN).length);
      expect(fragen.filter((f) => f.kategorie === 'kosten').length, s.id).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('Runde', () => {
  it('wählt zehn verschiedene Fragen der Stufe, ausgewogen über die Kategorien', () => {
    for (const s of STUFEN) {
      const runde = waehleRunde(quizFragen, s.id, 'alle', zufallsgenerator(7));
      expect(runde).toHaveLength(10);
      expect(new Set(runde.map((f) => f.id)).size).toBe(10);
      expect(runde.every((f) => f.stufe === s.id)).toBe(true);
      expect(runde.filter((f) => f.generiert)).toHaveLength(1);
      const jeKategorie = Object.values(Object.groupBy(runde, (f) => f.kategorie)).map((l) => l!.length);
      expect(Math.max(...jeKategorie)).toBeLessThanOrEqual(2);
    }
  });

  it('nimmt im Spezialbereich nur Kosten, Ausmass und Regie, mit mindestens vier Rechenaufgaben', () => {
    const runde = waehleRunde(quizFragen, 'bhv', 'kosten', zufallsgenerator(3));
    expect(runde).toHaveLength(10);
    expect(runde.every((f) => f.kategorie === 'kosten')).toBe(true);
    expect(runde.filter((f) => f.generiert).length).toBeGreaterThanOrEqual(4);
  });

  it('mischt die Antworten, Wahr/Falsch bleibt in fester Reihenfolge', () => {
    const runden = Array.from({ length: 20 }, (_, i) => waehleRunde(quizFragen, 'anfaenger', 'alle', zufallsgenerator(i))).flat();
    for (const f of runden.filter((f) => f.typ === 'wahr-falsch')) expect(f.antworten.map((a) => a.text)).toEqual(['Wahr', 'Falsch']);
    const positionen = new Set(runden.filter((f) => f.typ === 'einfach').map((f) => f.antworten.findIndex((a) => a.richtig)));
    expect(positionen.size).toBe(4);
  });
});

describe('Bewertung', () => {
  const frage = quizFragen.find((f) => f.typ === 'mehrfach')!;
  const richtigeIndizes = frage.antworten.flatMap((a, i) => (a.richtig ? [i] : []));

  it('verlangt bei Mehrfachauswahl alle richtigen und keine falschen Antworten', () => {
    expect(istRichtig(frage, richtigeIndizes)).toBe(true);
    expect(istRichtig(frage, richtigeIndizes.slice(1))).toBe(false);
    expect(istRichtig(frage, [...richtigeIndizes, frage.antworten.findIndex((a) => !a.richtig)])).toBe(false);
  });

  it('vergibt 100 Punkte und im Zeitmodus bis 50 Bonuspunkte', () => {
    expect(punkte(false, 1)).toBe(0);
    expect(punkte(true)).toBe(100);
    expect(punkte(true, 1)).toBe(150);
    expect(punkte(true, 0.5)).toBe(125);
    expect(punkte(true, 2)).toBe(150);
  });

  it('wertet je Kategorie aus und besteht ab 70 Prozent', () => {
    const fragen = quizFragen.slice(0, 10);
    const a = auswerten(fragen.map((f, i) => ({ frage: f, richtig: i < 7 })));
    expect([a.richtig, a.gesamt, a.prozent, a.bestanden]).toEqual([7, 10, 70, true]);
    expect(a.jeKategorie.reduce((s, k) => s + k.gesamt, 0)).toBe(10);
    expect(auswerten(fragen.map((f, i) => ({ frage: f, richtig: i < 6 }))).bestanden).toBe(false);
  });
});

describe('Rechengenerator', () => {
  const pruefe: Record<string, (f: Frage) => number> = {
    rohrmeter: (f) => { const [l, n] = f.frage.match(/([\d’]+) m lang.*?(\d+) Kabelschutzrohre/)!.slice(1).map(num); return l * n; },
    belag: (f) => { const [l, b, u] = f.frage.match(/([\d’.]+) m lang und ([\d.]+) m breit.*?je (\d+) cm/)!.slice(1).map(num); return l * (b + (2 * u) / 100); },
    aushub: (f) => { const [l, b, t] = f.frage.match(/([\d’.]+) m lang, ([\d.]+) m breit, ([\d.]+) m tief/)!.slice(1).map(num); return l * b * t; },
    rechnung: (f) => { const [m, ep] = f.frage.match(/([\d’.]+) m Kabelschutzrohr verlegen à CHF ([\d’.]+)/)!.slice(1).map(num); return m * ep; },
    regie: (f) => { const [p, h, s, hm, ms] = f.frage.match(/(\d) Personen je ([\d.]+) h à CHF ([\d’.]+), dazu Bagger ([\d.]+) h à CHF ([\d’]+\.\d{2})/)!.slice(1).map(num); return p * h * s + hm * ms; },
    mehrmenge: (f) => { const [v, a] = f.frage.match(new RegExp(`stehen (${Z}) m Graben, das Ausmass ergibt (${Z}) m`))!.slice(1).map(num); return ((a - v) / v) * 100; },
    fuellgrad: (f) => { const [k, d, w] = f.frage.match(/([\d.]+) mm Durchmesser.*?Rohr (\d+) × ([\d.]+) mm/)!.slice(1).map(num); return (k / (d - 2 * w)) ** 2 * 100; },
  };

  it('rechnet jede Aufgabe richtig und bietet vier verschiedene Antworten', () => {
    expect(Object.keys(pruefe).sort()).toEqual([...GENERATOR_TYPEN].sort());
    for (const typ of GENERATOR_TYPEN) {
      for (let seed = 0; seed < 200; seed++) {
        const f = generiereTyp(typ, 'praktiker', zufallsgenerator(seed));
        expect(new Set(f.antworten.map((a) => a.text)).size, `${typ} ${seed}`).toBe(4);
        expect(f.antworten.filter((a) => a.richtig)).toHaveLength(1);
        const soll = pruefe[typ](f);
        const ist = num(richtigeAntwort(f).replace(/[²³]/g, ''));
        expect(Math.abs(ist - soll), `${typ} ${seed}: ${f.frage} → ${richtigeAntwort(f)}`).toBeLessThan(typ === 'mehrmenge' || typ === 'fuellgrad' ? 0.051 : 0.0051);
      }
    }
  });

  it('erzeugt zur Stufe passende, reproduzierbare Aufgaben', () => {
    const stufen: Stufe[] = ['anfaenger', 'praktiker', 'experte', 'bhv'];
    for (const s of stufen) {
      const a = generiere(s, zufallsgenerator(42));
      const b = generiere(s, zufallsgenerator(42));
      expect(a).toEqual(b);
      expect(a.stufe).toBe(s);
      expect(a.kategorie).toBe('kosten');
    }
  });
});
