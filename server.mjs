// Produktionsserver: startet den von Astro gebauten Node-Handler und ergänzt
// Sicherheits-Header für alle Antworten (statische Seiten und Serverseiten).
// Start: `node server.mjs` (PORT und HOST über Umgebungsvariablen).

import http from 'node:http';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? '0.0.0.0';

export const SICHERHEITS_HEADER = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  // Ergänzt die von Astro pro Seite erzeugte CSP (meta) um Direktiven, die nur als Header wirken.
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
};

const server = http.createServer((req, res) => {
  for (const [k, v] of Object.entries(SICHERHEITS_HEADER)) res.setHeader(k, v);
  res.removeHeader('X-Powered-By');
  // Lange Zwischenspeicherung nur für unveränderliche, gehashte Build-Dateien.
  if (req.url?.startsWith('/_astro/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  handler(req, res);
});

server.headersTimeout = 20_000;
server.requestTimeout = 30_000;
server.listen(port, host, () => {
  console.log(`Server läuft auf http://${host}:${port}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
