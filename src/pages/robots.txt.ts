import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).href;
  // Solange die Platzhalter-Domain aktiv ist, wird die Indexierung verhindert.
  const platzhalter = site?.hostname === 'www.example.ch';
  const regeln = platzhalter
    ? ['User-agent: *', 'Disallow: /']
    : ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /keystatic/'];
  return new Response([...regeln, '', `Sitemap: ${sitemap}`, ''].join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
