import { describe, it, expect } from 'vitest';
import { validiereKontakt, bereinigen } from '../../src/lib/kontakt';

function formular(werte: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(werte)) f.set(k, v);
  return f;
}

const gueltig = {
  name: 'Maria Muster',
  email: 'maria.muster@firma.ch',
  firma: 'Muster AG',
  anliegen: 'KI im Bauwesen',
  nachricht: 'Guten Tag, ich interessiere mich für KI-Agenten in der Abrechnungsprüfung.',
  einwilligung: 'ja',
};

describe('validiereKontakt', () => {
  it('akzeptiert eine vollständige, gültige Anfrage', () => {
    const r = validiereKontakt(formular(gueltig));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.daten.name).toBe('Maria Muster');
  });

  it('meldet alle fehlenden Pflichtfelder', () => {
    const r = validiereKontakt(formular({}));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fehler).sort()).toEqual(['anliegen', 'einwilligung', 'email', 'nachricht', 'name']);
  });

  it.each(['keine-mail', 'a@b', 'a b@firma.ch', 'x@firma.c', '<script>@firma.ch'])('lehnt ungültige E-Mail %s ab', (email) => {
    const r = validiereKontakt(formular({ ...gueltig, email }));
    expect(r.ok).toBe(false);
  });

  it('lehnt unbekannte Anliegen ab', () => {
    const r = validiereKontakt(formular({ ...gueltig, anliegen: 'Werbung' }));
    expect(r.ok).toBe(false);
  });

  it('verhindert Header-Injection über Zeilenumbrüche im Namen', () => {
    const r = validiereKontakt(formular({ ...gueltig, name: 'Max\nBcc: alle@example.ch' }));
    expect(r.ok).toBe(false);
  });

  it('begrenzt Länge und Anzahl Links der Nachricht', () => {
    expect(validiereKontakt(formular({ ...gueltig, nachricht: 'a'.repeat(4001) })).ok).toBe(false);
    expect(validiereKontakt(formular({ ...gueltig, nachricht: 'http://a.ch http://b.ch http://c.ch http://d.ch Text' })).ok).toBe(false);
  });

  it('verlangt die Einwilligung', () => {
    expect(validiereKontakt(formular({ ...gueltig, einwilligung: '' })).ok).toBe(false);
  });

  it('entfernt Steuerzeichen', () => {
    expect(bereinigen('A\u0000B\u0007C\nD')).toBe('ABC\nD');
  });
});
