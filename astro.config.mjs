// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Die Admin-Oberfläche (Keystatic) läuft nur lokal mit `npm run admin`.
// Im Produktions-Build ist sie nicht enthalten und damit nicht angreifbar.
const enableAdmin = process.env.KEYSTATIC === 'true';
// DEPLOY_ZIEL=github-pages oder swizzonic erzeugt eine rein statische Seite ohne Node-Server.
const githubPages = process.env.DEPLOY_ZIEL === 'github-pages';
const swizzonic = process.env.DEPLOY_ZIEL === 'swizzonic';
const statisch = githubPages || swizzonic;
const formular = process.env.PUBLIC_CONTACT_FORM === 'true' && !statisch;
const site =
  process.env.SITE_URL ||
  (githubPages ? 'https://acortese-wq.github.io' : swizzonic ? 'https://tiefbauleitung.com' : 'https://www.example.ch');
// GitHub Pages aus dem Repository «Tiefbauleitung» liegt im Unterordner /Tiefbauleitung.
const base = githubPages ? process.env.BASE_PATH || '/Tiefbauleitung' : undefined;

/**
 * Alle Dateien eines Ordners (rekursiv), deren Name zum Muster passt.
 * @param {string} ordner
 * @param {RegExp} muster
 * @returns {AsyncGenerator<string>}
 */
async function* dateien(ordner, muster) {
  for (const e of await readdir(ordner, { withFileTypes: true })) {
    const pfad = join(ordner, e.name);
    if (e.isDirectory()) yield* dateien(pfad, muster);
    else if (muster.test(e.name)) yield pfad;
  }
}

/**
 * Fotos aus Markdown-Inhalten (<img> aus /bilder/ ohne Breitenangabe) im fertigen Build ergänzen:
 * Breite und Höhe (kein Springen beim Laden), Laden erst beim Scrollen und, wo vorhanden, die WebP-Fassung.
 * Astro 7 rendert Markdown mit Sätteri; so braucht es dafür kein zusätzliches Paket. Läuft vor «unterordnerLinks».
 * @returns {import('astro').AstroIntegration}
 */
function markdownBilder() {
  const oeffentlich = fileURLToPath(new URL('./public', import.meta.url));
  /** @param {string} pfad */
  const vorhanden = (pfad) => access(pfad).then(() => true, () => false);
  /** @type {Map<string, string>} */
  const ersatz = new Map();
  /** @param {string} tag */
  async function ergaenze(tag) {
    const src = tag.match(/\ssrc="(\/bilder\/[^"]+\.(?:jpe?g|png))"/i)?.[1];
    if (!src || /\swidth=/.test(tag)) return tag;
    if (!ersatz.has(src)) {
      const { width, height } = await sharp(join(oeffentlich, src)).metadata();
      const webp = src.replace(/\.(jpe?g|png)$/i, '.webp');
      const quelle = (await vorhanden(join(oeffentlich, webp))) ? `<source srcset="${webp}" type="image/webp">` : '';
      ersatz.set(src, `${quelle}|width="${width}" height="${height}" loading="lazy" decoding="async"`);
    }
    const [quelle, attribute] = /** @type {string} */ (ersatz.get(src)).split('|');
    const img = tag.replace(/\s*\/?>$/, ` ${attribute}>`);
    return quelle ? `<picture>${quelle}${img}</picture>` : img;
  }
  return {
    name: 'markdown-bilder',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        for await (const datei of dateien(fileURLToPath(dir), /\.html$/)) {
          const alt = await readFile(datei, 'utf8');
          const tags = [...new Set(alt.match(/<img\s[^>]*>/g) ?? [])];
          let neu = alt;
          for (const tag of tags) {
            const ergebnis = await ergaenze(tag);
            if (ergebnis !== tag) neu = neu.split(tag).join(ergebnis);
          }
          if (neu !== alt) await writeFile(datei, neu);
        }
      },
    },
  };
}

/**
 * Ergänzt im fertigen Build den Unterordner in allen internen Links und absoluten Adressen.
 * So bleiben Komponenten und Markdown-Inhalte einfach (Links beginnen mit «/»).
 * @param {string} unterordner z. B. «/Tiefbauleitung»
 * @param {string} seite z. B. «https://acortese-wq.github.io»
 * @returns {import('astro').AstroIntegration}
 */
function unterordnerLinks(unterordner, seite) {
  const ohne = unterordner.replace(/^\//, '');
  const intern = new RegExp(`((?:href|src|action|poster)=")/(?!/|${ohne}/)`, 'g');
  // srcset kann mehrere Adressen enthalten («a.webp 800w, b.webp 1600w»): jede einzeln ergänzen
  const srcset = /srcset="([^"]*)"/g;
  const eintrag = new RegExp(`(^|,\\s*)/(?!/|${ohne}/)`, 'g');
  const absolut = new RegExp(`${seite.replace(/[.]/g, '\\.')}/(?!${ohne}/)`, 'g');
  return {
    name: 'unterordner-links',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        for await (const datei of dateien(fileURLToPath(dir), /\.(html|xml|txt)$/)) {
          const alt = await readFile(datei, 'utf8');
          const neu = alt
            .replace(srcset, (_, wert) => `srcset="${wert.replace(eintrag, `$1${unterordner}/`)}"`)
            .replace(intern, `$1${unterordner}/`)
            .replace(absolut, `${seite}${unterordner}/`);
          if (neu !== alt) await writeFile(datei, neu);
        }
      },
    },
  };
}

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
  markdownBilder(),
];

if (base) integrations.push(unterordnerLinks(base, site));

if (enableAdmin) {
  const react = (await import('@astrojs/react')).default;
  const keystatic = (await import('@keystatic/astro')).default;
  integrations.push(react(), keystatic());
}

export default defineConfig({
  // Platzhalter, bis die Domain feststeht. Über SITE_URL beim Build setzen.
  site,
  base,
  output: 'static',
  adapter: statisch ? undefined : node({ mode: 'standalone', bodySizeLimit: 32 * 1024 }),
  trailingSlash: 'ignore',
  integrations,
  build: { inlineStylesheets: 'never' },
  // Module-Worker (pdf.js in der Gesetzesprüfung) als .js ausgeben, damit jeder Server den richtigen MIME-Typ sendet
  vite: { build: { assetsInlineLimit: 0 }, worker: { format: 'es' } },
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
