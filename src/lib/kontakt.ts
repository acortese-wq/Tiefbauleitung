// Serverseitige Validierung des Kontaktformulars. Bewusst ohne Abhängigkeit vom
// Astro-Laufzeitkontext, damit die Logik in Unit-Tests geprüft werden kann.

export const ANLIEGEN = [
  'Fachlicher Austausch',
  'KI im Bauwesen',
  'Tiefbau und Netzinfrastruktur',
  'Vortrag oder Workshop',
  'Anderes',
] as const;

export type KontaktDaten = {
  name: string;
  email: string;
  firma: string;
  anliegen: (typeof ANLIEGEN)[number];
  nachricht: string;
};

export type Validierung =
  | { ok: true; daten: KontaktDaten }
  | { ok: false; fehler: Partial<Record<keyof KontaktDaten | 'einwilligung', string>> };

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

function text(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim() : '';
}

/** Entfernt Steuerzeichen (ausser Zeilenumbruch und Tab). */
export function bereinigen(s: string): string {
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export function validiereKontakt(form: FormData): Validierung {
  const name = bereinigen(text(form.get('name')));
  const email = bereinigen(text(form.get('email')));
  const firma = bereinigen(text(form.get('firma')));
  const anliegen = text(form.get('anliegen'));
  const nachricht = bereinigen(text(form.get('nachricht')));
  const einwilligung = text(form.get('einwilligung'));

  const fehler: Partial<Record<keyof KontaktDaten | 'einwilligung', string>> = {};

  if (name.length < 2) fehler.name = 'Bitte geben Sie Ihren Namen an.';
  else if (name.length > 100) fehler.name = 'Der Name darf höchstens 100 Zeichen lang sein.';
  else if (/[\n<>]/.test(name)) fehler.name = 'Der Name enthält unzulässige Zeichen.';

  if (!EMAIL.test(email) || email.length > 200) fehler.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';

  if (firma.length > 120) fehler.firma = 'Der Firmenname darf höchstens 120 Zeichen lang sein.';
  else if (/[\n<>]/.test(firma)) fehler.firma = 'Der Firmenname enthält unzulässige Zeichen.';

  if (!(ANLIEGEN as readonly string[]).includes(anliegen)) fehler.anliegen = 'Bitte wählen Sie ein Anliegen.';

  if (nachricht.length < 20) fehler.nachricht = 'Bitte beschreiben Sie Ihr Anliegen in mindestens 20 Zeichen.';
  else if (nachricht.length > 4000) fehler.nachricht = 'Die Nachricht darf höchstens 4000 Zeichen lang sein.';
  else if ((nachricht.match(/https?:\/\//gi) ?? []).length > 3) fehler.nachricht = 'Bitte senden Sie höchstens drei Links.';

  if (einwilligung !== 'ja') fehler.einwilligung = 'Bitte bestätigen Sie die Datenschutzhinweise.';

  if (Object.keys(fehler).length > 0) return { ok: false, fehler };
  return {
    ok: true,
    daten: { name, email, firma, anliegen: anliegen as KontaktDaten['anliegen'], nachricht },
  };
}
