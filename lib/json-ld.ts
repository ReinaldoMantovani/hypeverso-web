// Serializa JSON-LD com escape de caracteres que poderiam fechar a tag <script>.
export const safeJsonLd = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function organizationJsonLd() {
  const site = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site}/#organization`,
    name: 'Hypeverso',
    url: site,
    logo: { '@type': 'ImageObject', url: `${site}/logo.png`, width: 600, height: 600 },
    ...(process.env.NEXT_PUBLIC_CONTACT_EMAIL
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
          },
        }
      : {}),
  };
}

export function websiteJsonLd() {
  const site = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    name: 'Hypeverso',
    url: site,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${site}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site}/buscar?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  const site = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${site}${item.path}` } : {}),
    })),
  };
}
