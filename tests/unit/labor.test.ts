import { describe, it, expect } from 'vitest';
import { fuelle, fehlendePflichtfelder, type Feld } from '../../src/lib/prompt';
import { pruefe, zahl } from '../../src/lib/tabellenpruefung';
import { prompts } from '../../src/data/prompts';

const felder: Feld[] = [
  { name: 'projekt', label: 'Projekt', typ: 'text', pflicht: true },
  { name: 'fokus', label: 'Fokus', typ: 'text' },
  { name: 'punkte', label: 'Punkte', typ: 'checks', optionen: [{ wert: 'Mengen', label: 'Mengen' }, { wert: 'Einheiten', label: 'Einheiten' }] },
];

describe('fuelle', () => {
  it('setzt Werte ein und markiert fehlende Pflichtfelder', () => {
    expect(fuelle('Projekt: {{projekt}}', felder, {})).toBe('Projekt: [FEHLT: Projekt]');
    expect(fuelle('Projekt: {{projekt}}', felder, { projekt: 'Brücke' })).toBe('Projekt: Brücke');
  });
  it('lässt bedingte Blöcke ohne Wert weg', () => {
    const v = 'A\n[[fokus|Fokus: {{fokus}}\n]]B';
    expect(fuelle(v, felder, {})).toBe('A\nB');
    expect(fuelle(v, felder, { fokus: 'Belag' })).toBe('A\nFokus: Belag\nB');
  });
  it('setzt Mehrfachauswahl als Aufzählung ein', () => {
    expect(fuelle('{{punkte}}', felder, { punkte: ['Mengen', 'Einheiten'] })).toBe('- Mengen\n- Einheiten');
  });
  it('meldet fehlende Pflichtfelder', () => {
    expect(fehlendePflichtfelder(felder, { projekt: ' ' }).map((f) => f.name)).toEqual(['projekt']);
  });
});

describe('Vorlagen', () => {
  it('haben eindeutige IDs und nur bekannte Platzhalter', () => {
    expect(new Set(prompts.map((p) => p.id)).size).toBe(prompts.length);
    for (const p of prompts) {
      const namen = new Set(p.felder.map((f) => f.name));
      for (const [, n] of p.vorlage.matchAll(/\{\{(\w+)\}\}|\[\[(\w+)\|/g)) if (n) expect(namen, `${p.id}: ${n}`).toContain(n);
      for (const m of p.vorlage.matchAll(/\{\{(\w+)\}\}/g)) expect(namen, `${p.id}: ${m[1]}`).toContain(m[1]);
    }
  });
});

describe('zahl', () => {
  it('liest Schweizer und deutsche Formate', () => {
    expect(zahl("1'234.50")).toBe(1234.5);
    expect(zahl('1 234,50')).toBe(1234.5);
    expect(zahl('1.234,50')).toBe(1234.5);
    expect(zahl('CHF 85')).toBe(85);
    expect(zahl('offen')).toBeNull();
  });
});

describe('pruefe', () => {
  it('findet Rechenfehler, fehlende Preise, Einheiten und Doppelpositionen im LV', () => {
    const lv = [
      'Pos\tText\tMenge\tEinheit\tEP\tBetrag',
      '211.101\tAushub Graben maschinell\t120\tm2\t35\t4200',
      '211.102\tAushub Graben maschinell\t20\tm3\t35\t700',
      '221.300\tRohr PE 110 verlegen\t200\tm\t\t',
      '311.100\tBelag AC T 16\t150\tm2\t40\t6100',
    ].join('\n');
    const r = pruefe(lv);
    expect(r.art).toBe('lv');
    const titel = r.befunde.map((b) => b.titel).join(' | ');
    expect(titel).toContain('1 Rechenfehler');
    expect(titel).toContain('fehlende Angabe');
    expect(titel).toContain('Doppelposition');
    expect(titel).toContain('prüfen');
  });

  it('erkennt einen Offertvergleich und markiert spekulative Preise', () => {
    const t = [
      'Pos;Text;Menge;Einheit;Bau AG;Tief GmbH;Strasse SA',
      '1;Aushub;100;m3;30;32;12',
      '2;Belag;200;m2;40;41;44',
    ].join('\n');
    const r = pruefe(t);
    expect(r.art).toBe('offerten');
    expect(r.befunde.some((b) => b.titel.includes('unter 50 %'))).toBe(true);
    expect(r.befunde[0].details?.[0]).toContain('Strasse SA');
  });

  it('vergleicht Ausmass mit Vertragsmenge', () => {
    const t = ['Pos\tText\tEinheit\tVertragsmenge\tAusmass\tEP', '1\tAushub\tm3\t100\t130\t30', '2\tBelag\tm2\t200\t205\t40', '3\tFelsabtrag\tm3\t\t12\t90'].join('\n');
    const r = pruefe(t);
    expect(r.art).toBe('ausmass');
    expect(r.befunde.map((b) => b.titel).join(' ')).toContain('ohne Vertragsmenge');
    expect(r.kennzahlen.find((k) => k.label.startsWith('Differenz'))?.wert).toMatch(/^\+CHF 1.100\.00$/);
  });
});
