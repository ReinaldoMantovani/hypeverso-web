import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AdSenseScript } from '@/components/adsense';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from '@/lib/adsense-config';
import { consentBootstrapScript } from '@/lib/consent';
import { organizationJsonLd, safeJsonLd, websiteJsonLd } from '@/lib/json-ld';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Hypeverso — Universo Geek', template: '%s | Hypeverso' },
  description: 'Cinema, séries, games, anime, mangás, HQs, tecnologia e comunidade geek.',
  applicationName: 'Hypeverso',
  openGraph: {
    type: 'website',
    siteName: 'Hypeverso',
    locale: 'pt_BR',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Hypeverso' }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: 'Hypeverso', statusBarStyle: 'black-translucent' },
  // Verificação de propriedade do site no AdSense (equivalente à meta google-adsense-account).
  ...(ADSENSE_ENABLED ? { other: { 'google-adsense-account': ADSENSE_CLIENT } } : {}),
};
export const viewport: Viewport = { themeColor: '#07050d', colorScheme: 'dark' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Nonce da CSP gerado em proxy.ts (cada resposta tem o seu).
  const nonce = process.env.CSP_STRICT === 'false' ? undefined : (await headers()).get('x-nonce') || undefined;
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Google Consent Mode v2: tudo negado por padrão, antes de qualquer tag do Google. */}
        <script
          id="consent-mode-default"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: consentBootstrapScript() }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: safeJsonLd([organizationJsonLd(), websiteJsonLd()]) }}
        />
      </head>
      <body className="grid-bg" suppressHydrationWarning>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-violet-600 focus:px-3 focus:py-2"
        >
          Pular para o conteúdo
        </a>
        <Providers>
          <Header />
          <main id="conteudo" className="min-h-[70vh]">
            {children}
          </main>
          <Footer />
          <AdSenseScript nonce={nonce} />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
