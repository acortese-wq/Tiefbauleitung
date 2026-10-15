import { describe, it, expect } from 'vitest';
import { erstelleToken, pruefeToken, istHoneypotGefuellt, MIN_SEKUNDEN, MAX_SEKUNDEN } from '../../src/lib/spamschutz';
import { erstelleLimiter } from '../../src/lib/ratenbegrenzung';

const SECRET = 'test-geheimnis-mit-ausreichender-laenge-123456';
const T0 = 1_760_000_000_000;

describe('Formular-Token', () => {
  it('ist nach der Mindestzeit gültig', () => {
    const t = erstelleToken(SECRET, T0);
    expect(pruefeToken(t, SECRET, T0 + (MIN_SEKUNDEN + 1) * 1000)).toEqual({ ok: true });
  });

  it('lehnt zu schnelle Absendungen ab', () => {
    const t = erstelleToken(SECRET, T0);
    expect(pruefeToken(t, SECRET, T0 + 1000)).toEqual({ ok: false, grund: 'zu-schnell' });
  });

  it('lehnt abgelaufene Tokens ab', () => {
    const t = erstelleToken(SECRET, T0);
    expect(pruefeToken(t, SECRET, T0 + (MAX_SEKUNDEN + 10) * 1000)).toEqual({ ok: false, grund: 'abgelaufen' });
  });

  it('erkennt Manipulation am Zeitstempel und falsche Schlüssel', () => {
    const t = erstelleToken(SECRET, T0);
    const [, sig] = t.split('.');
    expect(pruefeToken(`${Math.floor(T0 / 1000) - 100}.${sig}`, SECRET, T0 + 10_000).ok).toBe(false);
    expect(pruefeToken(t, 'anderes-geheimnis-mit-ausreichender-laenge', T0 + 10_000).ok).toBe(false);
    expect(pruefeToken('', SECRET).ok).toBe(false);
    expect(pruefeToken('abc.def', SECRET).ok).toBe(false);
  });
});

describe('Honeypot', () => {
  it('erkennt ausgefüllte Felder', () => {
    expect(istHoneypotGefuellt('http://spam.example')).toBe(true);
    expect(istHoneypotGefuellt('')).toBe(false);
    expect(istHoneypotGefuellt(null)).toBe(false);
  });
});

describe('Ratenbegrenzung', () => {
  it('erlaubt bis zum Limit und sperrt danach', () => {
    const l = erstelleLimiter(3, 60_000);
    expect([1, 2, 3].map(() => l.pruefe('1.2.3.4', T0).erlaubt)).toEqual([true, true, true]);
    expect(l.pruefe('1.2.3.4', T0).erlaubt).toBe(false);
    expect(l.pruefe('5.6.7.8', T0).erlaubt).toBe(true);
  });

  it('setzt das Fenster nach Ablauf zurück', () => {
    const l = erstelleLimiter(1, 60_000);
    expect(l.pruefe('a', T0).erlaubt).toBe(true);
    expect(l.pruefe('a', T0 + 1000).erlaubt).toBe(false);
    expect(l.pruefe('a', T0 + 61_000).erlaubt).toBe(true);
  });

  it('räumt alte Einträge auf, damit der Speicher begrenzt bleibt', () => {
    const l = erstelleLimiter(1, 1000, 10);
    for (let i = 0; i < 10; i++) l.pruefe(`ip-${i}`, T0);
    l.pruefe('neu', T0 + 5000);
    expect(l.groesse()).toBe(1);
  });
});
