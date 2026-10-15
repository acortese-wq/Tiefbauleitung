// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Die Admin-Oberfläche (Keystatic) läuft nur lokal mit `npm run admin`.
// Im Produktions-Build ist sie nicht enthalten und damit nicht angreifbar.
const enableAdmin = process.env.KEYSTATIC === 'true';
const site = process.env.SITE_URL || 'https://www.example.ch';

const integrations = [
  sitemap({
    filter: (page) => !page.includes('/keystatic') && !page.includes('/api/'),
    // Die Kontaktseite wird serverseitig gerendert und deshalb von Hand ergänzt.
    customPages: [new URL('/kontakt/', site).href],
  }),
];

if (enableAdmin) {
  const react = (await import('@astrojs/react')).default;
  const keystatic = (await import('@keystatic/astro')).default;
  integrations.push(react(), keystatic());
}

export default defineConfig({
  // Platzhalter, bis die Domain feststeht. Über SITE_URL beim Build setzen.
  site,
  output: 'static',
  adapter: node({ mode: 'standalone', bodySizeLimit: 32 * 1024 }),
  trailingSlash: 'ignore',
  integrations,
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  security: {
    checkOrigin: true,
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "manifest-src 'self'",
      ],
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
      styleDirective: { resources: ["'self'"] },
    },
  },
});
