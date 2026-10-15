import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { slugify, lesezeit } from '../../src/lib/hilfen';
import { jsonFuerScript } from '../../src/lib/seo';
import { leseVersandKonfig, baueNachricht } from '../../src/lib/versand';

describe('slugify', () => {
  it('erzeugt URL-taugliche Schweizer Slugs', () => {
    expect(slugify('KI im Bauwesen')).toBe('ki-im-bauwesen');
    expect(slugify('Schnittstellen & Kostenteiler')).toBe('schnittstellen-kostenteiler');
    expect(slugify('Fläsch – Rheinbrücke')).toBe('flaesch-rheinbruecke');
    expect(slugify('Glühen Öl Übung')).toBe('gluehen-oel-uebung');
  });
});

describe('lesezeit', () => {
  it('rechnet mit 200 Wörtern pro Minute und mindestens einer Minute', () => {
    expect(lesezeit('Wort '.repeat(1000))).toBe(5);
    expect(lesezeit('kurz')).toBe(1);
  });
});

describe('jsonFuerScript', () => {
  it('maskiert spitze Klammern gegen Ausbruch aus dem Script-Element', () => {
    expect(jsonFuerScript({ a: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('Versand-Konfiguration', () => {
  it('ist ohne vollständige Angaben deaktiviert', () => {
    expect(leseVersandKonfig({})).toBeNull();
    expect(leseVersandKonfig({ SMTP_HOST: 'mail.example.ch' })).toBeNull();
  });
  it('liest vollständige Angaben', () => {
    const k = leseVersandKonfig({ SMTP_HOST: 'h', SMTP_PORT: '587', SMTP_USER: 'u', SMTP_PASS: 'p', CONTACT_TO: 't@x.ch', CONTACT_FROM: 'f@x.ch' });
    expect(k?.port).toBe(587);
  });
  it('baut eine reine Textnachricht', () => {
    const t = baueNachricht({ name: 'A', email: 'a@b.ch', firma: '', anliegen: 'Anderes', nachricht: 'Hallo Welt, eine Nachricht.' });
    expect(t).toContain('Anliegen: Anderes');
    expect(t).not.toContain('Unternehmen:');
  });
});

describe('Inhalte', () => {
  const ordner = ['src/content/artikel', 'src/content/projekte', 'src/content/kompetenzen'];
  const dateien = ordner.flatMap((o) => readdirSync(o).map((d) => `${o}/${d}`));

  it('verwenden Schweizer Orthografie ohne «ß»', () => {
    const mitSz = dateien.filter((d) => readFileSync(d, 'utf8').includes('ß'));
    expect(mitSz).toEqual([]);
  });

  it('enthalten keine internen Bezeichnungen aus dem aktuellen Arbeitsverhältnis', () => {
    const verboten = /cablex|swisscomgpt/i;
    const treffer = dateien.filter((d) => verboten.test(readFileSync(d, 'utf8')));
    expect(treffer).toEqual([]);
  });
});
