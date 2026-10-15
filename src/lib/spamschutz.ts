import { createHmac, timingSafeEqual } from 'node:crypto';

// Zeitstempel-Token: Das Formular erhält beim Laden einen signierten Zeitstempel.
// Abgelehnt werden Absendungen, die zu schnell (Bots) oder zu spät erfolgen,
// sowie manipulierte Tokens. Dazu kommt ein verstecktes Honeypot-Feld.

export const MIN_SEKUNDEN = 4;
export const MAX_SEKUNDEN = 60 * 60 * 2;

function signatur(zeit: string, secret: string): string {
  return createHmac('sha256', secret).update(`kontakt:${zeit}`).digest('base64url');
}

export function erstelleToken(secret: string, jetzt = Date.now()): string {
  const zeit = String(Math.floor(jetzt / 1000));
  return `${zeit}.${signatur(zeit, secret)}`;
}

export type TokenPruefung = { ok: true } | { ok: false; grund: 'ungueltig' | 'zu-schnell' | 'abgelaufen' };

export function pruefeToken(token: string, secret: string, jetzt = Date.now()): TokenPruefung {
  const [zeit, sig] = token.split('.');
  if (!zeit || !sig || !/^\d{9,11}$/.test(zeit)) return { ok: false, grund: 'ungueltig' };
  const erwartet = Buffer.from(signatur(zeit, secret));
  const erhalten = Buffer.from(sig);
  if (erwartet.length !== erhalten.length || !timingSafeEqual(erwartet, erhalten)) {
    return { ok: false, grund: 'ungueltig' };
  }
  const alter = Math.floor(jetzt / 1000) - Number(zeit);
  if (alter < MIN_SEKUNDEN) return { ok: false, grund: 'zu-schnell' };
  if (alter > MAX_SEKUNDEN) return { ok: false, grund: 'abgelaufen' };
  return { ok: true };
}

/** Honeypot: Menschen sehen das Feld nicht und lassen es leer. */
export function istHoneypotGefuellt(wert: FormDataEntryValue | null): boolean {
  return typeof wert === 'string' && wert.trim().length > 0;
}
