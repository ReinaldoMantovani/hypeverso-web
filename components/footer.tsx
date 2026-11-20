'use client';
import Link from 'next/link';
import { Logo } from './logo';
import { CookieSettingsLink } from './cookie-settings-link';
import { LegalLink } from './legal/legal-link';
import { useI18n } from '@/lib/i18n';
import { NewsletterSignup } from './engagement/newsletter-signup';
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-white/50">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <Logo />
          <p>
            © {new Date().getFullYear()} Hypeverso. {t('footerTagline')}
          </p>
        </div>
        <div className="mt-6 grid gap-6 border-t border-white/5 pt-6 md:grid-cols-[1fr_380px]">
          <nav aria-label="Comunidade" className="flex flex-wrap content-start gap-x-5 gap-y-2 text-xs">
            <Link className="hover:text-white" href="/listas">
              {t('lists')}
            </Link>
            <Link className="hover:text-white" href="/discussoes">
              {t('discussions')}
            </Link>
            <Link className="hover:text-white" href="/comunidade/moderacao">
              {t('triage')}
            </Link>
            <Link className="hover:text-white" href="/newsletter">
              {t('newsletter')}
            </Link>
          </nav>
          <NewsletterSignup compact />
        </div>
        <nav
          aria-label="Institucional"
          className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/5 pt-5 text-xs"
        >
          <Link className="hover:text-white" href="/sobre">
            {t('about')}
          </Link>
          <Link className="hover:text-white" href="/contato">
            {t('contact')}
          </Link>
          <LegalLink kind="privacy" className="hover:text-white">
            {t('privacy')}
          </LegalLink>
          <LegalLink kind="terms" className="hover:text-white">
            {t('terms')}
          </LegalLink>
          <LegalLink kind="cookies" className="hover:text-white">
            {t('cookies')}
          </LegalLink>
          <CookieSettingsLink />
        </nav>
      </div>
    </footer>
  );
}
