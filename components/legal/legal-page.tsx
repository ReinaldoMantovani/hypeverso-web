'use client';
import Link from 'next/link';
import { LegalDocument } from './legal-document';
import type { LegalKind } from '@/lib/legal-content';
import { useI18n } from '@/lib/i18n';
import { CookieSettingsLink } from '@/components/cookie-settings-link';

export function LegalPage({ kind }: { kind: LegalKind }) {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <LegalDocument kind={kind} />
      {kind === 'cookies' && (
        <div className="mt-8">
          <CookieSettingsLink className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500" />
        </div>
      )}
      <nav
        aria-label="Documentos legais"
        className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-sm text-white/45"
      >
        <Link href="/politica-de-privacidade" className="hover:text-white">
          {t('privacy')}
        </Link>
        <Link href="/termos-de-uso" className="hover:text-white">
          {t('terms')}
        </Link>
        <Link href="/politica-de-cookies" className="hover:text-white">
          {t('cookies')}
        </Link>
        <Link href="/contato" className="hover:text-white">
          {t('contact')}
        </Link>
      </nav>
    </section>
  );
}
