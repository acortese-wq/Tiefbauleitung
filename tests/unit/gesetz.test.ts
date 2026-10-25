import { describe, it, expect } from 'vitest';
import {
  BEISPIEL_FRAGE, BEISPIEL_REGLEMENT, begriffe, erkenneErlass, erstelleDokument, fristen, gesetzPrompt, markierungen,
  normalisiere, quellen, stamm, suche, zerlegeArtikel,
} from '../../src/lib/gesetz';

const BUND = `784.10
Fernmeldegesetz
(FMG)
vom 30. April 1997 (Stand am 1. Januar 2025)
Die Bundesversammlung der Schweizerischen Eidgenossenschaft,
gestützt auf Artikel 92 der Bundesverfassung,
beschliesst:
Art. 1 Zweck
1 Dieses Gesetz soll gewährleisten, dass Fernmeldedienste angeboten werden.
Art. 35 Benützung von Boden im Gemeingebrauch
1 Die Eigentümer von Boden im Gemeingebrauch müssen den Anbieterinnen die Benützung dieses Bodens für Leitungen gestatten.
2 Die Bewilligung ist innert 30 Tagen zu erteilen; Art. 12 Abs. 2 bleibt vorbehalten.`;

const KANTON = `Strassengesetz des Kantons Graubünden (StrG)
vom 1. September 2005
Der Grosse Rat des Kantons Graubünden,
gestützt auf Art. 31 der Kantonsverfassung1,
beschliesst:
1 SR 101
§ 12 Leitungen im Strassengebiet
Für Leitungen im Strassengebiet ist eine Bewilligung erforderlich.`;

describe('Text und Begriffe', () => {
  it('normalisiert zeichengenau ohne Akzente', () => {
    const t = 'Gebühr für Trottoirbenützung';
    expect(normalisiere(t)).toBe('gebuhr fur trottoirbenutzung');
    expect(normalisiere(t).length).toBe(t.length);
  });

  it('bildet Stämme und verwandte Begriffe, Füllwörter fallen weg', () => {
    expect(stamm('Bewilligungen')).toBe('bewilli');
    expect(stamm('Fristen')).toBe('frist');
    const b = begriffe('Wer trägt die Kosten bei Grabarbeiten im Strassengebiet?');
    expect(b.map((x) => x.wort)).toEqual(['trägt', 'Kosten', 'Grabarbeiten', 'Strassengebiet']);
    expect(b.find((x) => x.wort === 'Grabarbeiten')!.stamme).toContain('grab');
    expect(b.find((x) => x.wort === 'Kosten')!.stamme).toContain('gebuhr');
  });

  it('markiert ganze Wörter und führt Überlappungen zusammen', () => {
    const t = 'Die Bewilligungspflicht gilt; Bewilligung beim Bauamt.';
    const m = markierungen(t, ['bewilli', 'bewilligungsp']);
    expect(m.map((b) => t.slice(b.start, b.ende))).toEqual(['Bewilligungspflicht', 'Bewilligung']);
  });
});

describe('Artikel zerlegen', () => {
  it('erkennt Art. und §, Sachtitel, Absätze und Seiten', () => {
    const a = zerlegeArtikel(['Art. 1 Zweck\n1 Erster Absatz\nmit Umbruch.\n2 Zweiter Absatz.', '§ 5a\nGebühren\nDie Gebühr be-\nträgt Fr. 100.']);
    expect(a.map((x) => x.nr)).toEqual(['Art. 1', '§ 5a']);
    expect(a[0].titel).toBe('Zweck');
    expect(a[0].text).toBe('1 Erster Absatz mit Umbruch.\n2 Zweiter Absatz.');
    expect(a[1]).toMatchObject({ titel: 'Gebühren', text: 'Die Gebühr beträgt Fr. 100.', seite: 2 });
  });

  it('hält Verweise im Fliesstext und Fussnoten nicht für Artikel', () => {
    const a = zerlegeArtikel([BUND]);
    expect(a.filter((x) => x.nr).map((x) => x.nr)).toEqual(['Art. 1', 'Art. 35']);
    const k = zerlegeArtikel([KANTON]);
    expect(k.find((x) => x.nr === '§ 12')!.text).not.toContain('SR 101');
  });

  it('sucht ohne Artikelnummern seitenweise', () => {
    const d = erstelleDokument('m', 'merkblatt.pdf', ['Merkblatt Grabarbeiten\nBeläge sind sauber zu schneiden.', 'Kontakt Bauamt']);
    expect(d.artikel.map((a) => a.nr)).toEqual(['Seite 1', 'Seite 2']);
    expect(suche([d], 'Wie ist der Belag zu schneiden?')[0].artikel.nr).toBe('Seite 1');
  });

  it('entfernt wiederholte Kopfzeilen und Seitenzahlen', () => {
    const seiten = [1, 2, 3].map((n) => `Strassengesetz\nArt. ${n} Titel ${n}\nText ${n}.\n${n}`);
    const a = zerlegeArtikel(seiten);
    expect(a.every((x) => !x.text.includes('Strassengesetz'))).toBe(true);
    expect(a.map((x) => x.text)).toEqual(['Text 1.', 'Text 2.', 'Text 3.']);
  });
});

describe('Erlass erkennen', () => {
  it('Bundesgesetz mit Kurztitel, Datum und Stand', () => {
    expect(erkenneErlass(BUND)).toMatchObject({ titel: 'Fernmeldegesetz', ebene: 'bund', sicher: true, datum: '30. April 1997', stand: '1. Januar 2025' });
    expect(erkenneErlass('Fernmeldegesetz (Fernmeldegesetz, FMG)\nDie Bundesversammlung der Schweizerischen Eidgenossenschaft').kurz).toBe('FMG');
  });

  it('kantonales Gesetz mit Kanton, Fussnote mit SR zählt nicht als Bund', () => {
    expect(erkenneErlass(KANTON)).toMatchObject({ ebene: 'kanton', kanton: 'GR', kurz: 'StrG', sicher: true });
  });

  it('Gemeindereglement', () => {
    expect(erkenneErlass(BEISPIEL_REGLEMENT)).toMatchObject({ ebene: 'gemeinde', sicher: true, datum: '1. März 2024', stand: '1. Januar 2026' });
  });

  it('ohne Merkmale unsicher, Vorgabe Kanton', () => {
    expect(erkenneErlass('Irgendein Text ohne Kopf')).toMatchObject({ ebene: 'kanton', sicher: false });
  });
});

describe('Suche, Fristen, Prompt', () => {
  const dok = erstelleDokument('d1', 'reglement.txt', [BEISPIEL_REGLEMENT]);

  it('findet die passenden Artikel zur Beispielfrage', () => {
    const f = suche([dok], BEISPIEL_FRAGE, 5);
    const nr = f.map((x) => x.artikel.nr);
    expect(nr).toContain('Art. 3');
    expect(nr).toContain('Art. 8');
    expect(nr.indexOf('Art. 3')).toBeLessThan(3);
    expect(f[0].markiert.length).toBeGreaterThan(0);
    expect(f.every((x) => x.auszug.length <= 330)).toBe(true);
  });

  it('Aufbruchsperre wird über verwandte Begriffe gefunden', () => {
    const f = suche([dok], 'Wie lange darf ein neuer Belag nicht aufgebrochen werden?', 3);
    expect(f[0].artikel.nr).toBe('Art. 6');
  });

  it('zieht Fristen mit Fundstelle heraus', () => {
    const fr = fristen(suche([dok], 'Gesuch Bewilligung Rechtsmittel Frist', 8));
    expect(fr.map((x) => x.frist)).toEqual(expect.arrayContaining(['spätestens 30 Tage', 'innert 30 Tagen']));
    expect(fr.find((x) => x.frist === 'spätestens 30 Tage')!.fundstelle).toMatch(/^Art\. 4 /);
    // zwei Fristen im selben Satz erscheinen zusammen
    expect(fr.map((x) => x.frist)).toContain('innert 24 Stunden · innert drei Arbeitstagen');
  });

  it('baut einen Prompt mit Ebenen, Vorrang und Fundstellen', () => {
    const f = suche([dok], BEISPIEL_FRAGE, 4);
    const p = gesetzPrompt({ frage: BEISPIEL_FRAGE, kanton: 'GR', gemeinde: 'Musterdorf', dokumente: [dok], fundstellen: f });
    expect(p).toContain('Gemeinde Musterdorf, Kanton Graubünden, Schweiz');
    expect(p).toContain('Art. 49 BV');
    expect(p).toContain('Kommunales Recht: Reglement über die Benützung');
    expect(p).toContain('Nicht eingefügt: Bundesrecht, Kantonales Recht');
    expect(p).toContain('Art. 3 Bewilligungspflicht');
    expect(p).not.toContain('[FEHLT');
  });

  it('kürzt lange Anhänge und meldet fehlende Angaben', () => {
    const p = gesetzPrompt({ frage: '', dokumente: [dok], fundstellen: [], ganz: true, maxZeichen: 600 });
    expect(p).toContain('[FEHLT: Frage]');
    expect(p).toContain('(gekürzt');
    expect(gesetzPrompt({ frage: 'x', dokumente: [], fundstellen: [] })).toContain('[FEHLT: Erlass als PDF oder Text]');
  });

  it('liefert offizielle Quellen je Ebene', () => {
    expect(quellen('bund')[0].href).toContain('fedlex.admin.ch');
    expect(quellen('kanton', 'GR').map((q) => q.href)).toEqual(['https://www.gr-lex.gr.ch', 'https://www.lexfind.ch']);
    expect(quellen('gemeinde', undefined, 'Chur')[0].label).toContain('Chur');
  });
});
