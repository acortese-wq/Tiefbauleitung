// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Die Admin-Oberfläche (Keystatic) läuft nur lokal mit `npm run admin`.
// Im Produktions-Build ist sie nicht enthalten und damit nicht angreifbar.
const enableAdmin = process.env.KEYSTATIC === 'true';
// DEPLOY_ZIEL=github-pages erzeugt eine rein statische Seite ohne Node-Server.
const githubPages = process.env.DEPLOY_ZIEL === 'github-pages';
const formular = process.env.PUBLIC_CONTACT_FORM === 'true' && !githubPages;
const site = process.env.SITE_URL || (githubPages ? 'https://acortese-wq.github.io' : 'https://www.example.ch');

/** @type {import('astro').AstroIntegration[]} */
const integrations = [
  {
    // Kontaktseite nur serverseitig rendern, wenn das Formular aktiv ist. Sonst statisch.
    name: 'kontakt-vorrendern',
    hooks: {
      'astro:route:setup': ({ route }) => {
        if (route.component.endsWith('src/pages/kontakt.astro')) route.prerender = !formular;
      },
    },
  },
  sitemap({
    filter: (page) => !page.includes('/keystatic') && !page.includes('/api/'),
    // Mit aktivem Formular wird die Kontaktseite serverseitig gerendert und deshalb von Hand ergänzt.
    customPages: formular ? [new URL('/kontakt/', site).href] : [],
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
  adapter: githubPages ? undefined : node({ mode: 'standalone', bodySizeLimit: 32 * 1024 }),
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
