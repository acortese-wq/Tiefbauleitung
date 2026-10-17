import { person } from '../data/person';

// Strukturierte Daten nur mit belegten Angaben.
export function personJsonLd(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: [person.beruf, person.rolle],
    worksFor: { '@type': 'Organization', name: person.arbeitgeber },
    address: { '@type': 'PostalAddress', addressLocality: person.ort, addressRegion: 'GR', addressCountry: 'CH' },
    knowsLanguage: ['de', 'it', 'en'],
    knowsAbout: [
      'Tiefbau', 'Netzbau', 'Glasfaserausbau (FTTH)', 'Werkleitungen', 'Bauherrenvertretung', 'Bauleitung',
      'Vergabewesen (IVöB/BöB)', 'SIA 118', 'NPK', 'Abrechnungsprüfung', 'KI-Agenten',
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: 'KI-Professional (KI-Agent)',
      credentialCategory: 'Zertifikat',
      recognizedBy: { '@type': 'EducationalOrganization', name: 'HSO Wirtschafts- und Informatikschule' },
    },
    sameAs: [person.linkedin],
    url: site.href,
    image: new URL(`${person.portrait}`, site).href,
  };
}

export function artikelJsonLd(opts: { title: string; description: string; datum: Date; aktualisiert?: Date; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datum.toISOString(),
    dateModified: (opts.aktualisiert ?? opts.datum).toISOString(),
    author: { '@type': 'Person', name: person.name },
    inLanguage: 'de-CH',
    mainEntityOfPage: opts.url,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** JSON sicher in ein <script>-Element einbetten. */
export function jsonFuerScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
