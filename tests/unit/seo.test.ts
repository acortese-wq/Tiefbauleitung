import { describe, it, expect } from 'vitest';
import { metaBeschreibung, seitenUrl, breadcrumbJsonLd } from '../../src/lib/seo';

describe('metaBeschreibung', () => {
  it('lässt kurze Texte unverändert, nur Leerraum wird bereinigt', () => {
    expect(metaBeschreibung('  Kurzer   Text. ')).toBe('Kurzer Text.');
  });

  it('kürzt am Satzende, wenn es spät genug liegt', () => {
    const satz1 = 'Ersatzneubau einer Brücke von 1967 als Stahlverbundbrücke mit Hilfsbrücke, direkt neben der Bahnlinie Chur–Arosa und der Plessur.';
    const t = `${satz1} Druckleitung und viele Werkleitungen im Brückenbereich wurden umgelegt und in die neue Brücke integriert.`;
    const m = metaBeschreibung(t);
    expect(m).toBe(satz1);
    expect(m.length).toBeLessThanOrEqual(160);
  });

  it('kürzt sonst an einer Wortgrenze mit Auslassungszeichen', () => {
    const t = 'Frage stellen und Gesetz einfügen und Artikel finden und Fristen herausziehen und Quellen nennen und Prompt bauen und alles im Browser ohne Hochladen und ohne Konto und ohne Kosten für alle';
    const m = metaBeschreibung(t);
    expect(m.length).toBeLessThanOrEqual(160);
    expect(m.endsWith(' …')).toBe(true);
    expect(t.startsWith(m.slice(0, -2))).toBe(true);
    expect(m.slice(0, -2)).not.toMatch(/\s$/);
  });
});

describe('seitenUrl und Brotkrumen', () => {
  it('baut absolute Adressen ohne doppelte Schrägstriche', () => {
    const site = new URL('https://tiefbauleitung.com');
    expect(seitenUrl('/profil/', site)).toBe('https://tiefbauleitung.com/profil/');
    expect(seitenUrl('kontakt/', site)).toBe('https://tiefbauleitung.com/kontakt/');
  });

  it('nummeriert die Glieder der BreadcrumbList', () => {
    const ld = breadcrumbJsonLd([{ name: 'Start', url: 'https://a.ch/' }, { name: 'Profil', url: 'https://a.ch/profil/' }]);
    expect(ld.itemListElement.map((x) => x.position)).toEqual([1, 2]);
  });
});
