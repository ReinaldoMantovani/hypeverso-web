'use client';
import { useEffect, useState } from 'react';
import { Cookie, Settings2, X } from 'lucide-react';
import { Button } from '@/ui';
import { useI18n } from '@/lib/i18n';
import { readConsent, saveConsent, type ConsentChoices } from '@/lib/consent';
import { LegalLink } from '@/components/legal/legal-link';

export type { Consent } from '@/lib/consent';
const OPEN_EVENT = 'hyperverso:open-cookie-settings';

export function openCookieSettings() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_EVENT));
}

const NONE: ConsentChoices = { analytics: false, personalization: false, ads: false };
const ALL: ConsentChoices = { analytics: true, personalization: true, ads: true };

export function CookieConsent() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [prefs, setPrefs] = useState<ConsentChoices>(NONE);
  useEffect(() => {
    const current = readConsent();
    if (!current) setOpen(true);
    else setPrefs({ analytics: current.analytics, personalization: current.personalization, ads: current.ads });
    const handler = () => {
      const c = readConsent();
      if (c) setPrefs({ analytics: c.analytics, personalization: c.personalization, ads: c.ads });
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);
  if (!open) return null;
  const commit = (values: ConsentChoices) => {
    setPrefs(values);
    saveConsent(values);
    setOpen(false);
    setCustom(false);
  };
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5"
    >
      <div className="mx-auto max-h-[85vh] max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0712]/95 p-4 shadow-[0_-20px_80px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-200">
            <Cookie size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="cookie-title" className="font-black">
              {t('cookieTitle')}
            </h2>
            <p id="cookie-text" className="mt-1 text-sm leading-6 text-white/55">
              {t('cookieText')}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <LegalLink kind="privacy" className="text-cyan-300 hover:underline">
                {t('privacy')}
              </LegalLink>
              <LegalLink kind="cookies" className="text-cyan-300 hover:underline">
                {t('cookies')}
              </LegalLink>
              <LegalLink kind="terms" className="text-cyan-300 hover:underline">
                {t('terms')}
              </LegalLink>
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 hover:underline"
              >
                {t('cookieGoogleHow')}
              </a>
            </div>
          </div>
          {/* Fechar sem escolher = recusar opcionais (exigência LGPD/GDPR: recusar deve ser tão fácil quanto aceitar). */}
          <button
            aria-label={t('cookieCloseReject')}
            title={t('cookieCloseReject')}
            className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white"
            onClick={() => commit(custom ? prefs : NONE)}
          >
            <X size={18} />
          </button>
        </div>
        {custom && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <ConsentToggle
              label={t('necessary')}
              detail={t('cookieNecessaryDesc')}
              badge={t('alwaysOn')}
              checked
              disabled
              onChange={() => {}}
            />
            <ConsentToggle
              label={t('analytics')}
              detail={t('cookieAnalyticsDesc')}
              checked={prefs.analytics}
              onChange={v => setPrefs(p => ({ ...p, analytics: v }))}
            />
            <ConsentToggle
              label={t('personalization')}
              detail={t('cookiePersonalizationDesc')}
              checked={prefs.personalization}
              onChange={v => setPrefs(p => ({ ...p, personalization: v }))}
            />
            <ConsentToggle
              label={t('ads')}
              detail={t('cookieAdsDesc')}
              checked={prefs.ads}
              onChange={v => setPrefs(p => ({ ...p, ads: v }))}
            />
          </div>
        )}
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {custom ? (
            <Button variant="outline" onClick={() => commit(prefs)}>
              {t('cookieSave')}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setCustom(true)}>
              <Settings2 size={15} />
              {t('cookieCustomize')}
            </Button>
          )}
          <Button variant="outline" onClick={() => commit(NONE)}>
            {t('cookieReject')}
          </Button>
          <Button onClick={() => commit(ALL)}>{t('cookieAccept')}</Button>
        </div>
      </div>
    </div>
  );
}

function ConsentToggle({
  label,
  detail,
  badge,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  detail?: string;
  badge?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3 ${disabled ? '' : 'cursor-pointer hover:border-white/15'}`}
    >
      <span>
        <b className="block text-sm">
          {label}
          {badge && (
            <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              {badge}
            </span>
          )}
        </b>
        {detail && <span className="mt-0.5 block text-[11px] leading-5 text-white/40">{detail}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-violet-500"
      />
    </label>
  );
}
