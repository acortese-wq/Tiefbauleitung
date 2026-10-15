import nodemailer from 'nodemailer';
import type { KontaktDaten } from './kontakt';

export type VersandKonfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  an: string;
  von: string;
};

/** Liest die SMTP-Konfiguration. Gibt null zurück, wenn etwas fehlt. */
export function leseVersandKonfig(env: Record<string, string | undefined>): VersandKonfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM } = env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO || !CONTACT_FROM) return null;
  const port = Number(SMTP_PORT || 465);
  if (!Number.isInteger(port) || port <= 0) return null;
  return { host: SMTP_HOST, port, user: SMTP_USER, pass: SMTP_PASS, an: CONTACT_TO, von: CONTACT_FROM };
}

export function baueNachricht(d: KontaktDaten): string {
  return [
    `Anliegen: ${d.anliegen}`,
    `Name: ${d.name}`,
    `E-Mail: ${d.email}`,
    d.firma ? `Unternehmen: ${d.firma}` : null,
    '',
    d.nachricht,
    '',
    '—',
    'Gesendet über das Kontaktformular der Webseite.',
  ]
    .filter((z) => z !== null)
    .join('\n');
}

export async function sendeKontakt(k: VersandKonfig, d: KontaktDaten): Promise<void> {
  const transport = nodemailer.createTransport({
    host: k.host,
    port: k.port,
    secure: k.port === 465,
    auth: { user: k.user, pass: k.pass },
  });
  await transport.sendMail({
    from: k.von,
    to: k.an,
    replyTo: d.email,
    subject: `Webseite: ${d.anliegen}`,
    text: baueNachricht(d),
  });
}
