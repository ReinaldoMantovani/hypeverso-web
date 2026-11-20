'use client';
import { openCookieSettings } from './cookie-consent';
import { useI18n } from '@/lib/i18n';
export function CookieSettingsLink({ className = 'hover:text-white' }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      {t('cookieSettings')}
    </button>
  );
}
