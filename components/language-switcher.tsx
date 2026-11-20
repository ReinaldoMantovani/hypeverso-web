'use client';
import { Languages } from 'lucide-react';
import { Locale, useI18n } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className="relative flex items-center" title={t('language')}>
      <Languages size={17} className="pointer-events-none absolute left-2.5 text-white/55" />
      <select
        aria-label={t('language')}
        value={locale}
        onChange={e => setLocale(e.target.value as Locale)}
        className="h-9 appearance-none rounded-xl border border-white/10 bg-[#0b0714] pl-8 pr-7 text-xs font-semibold text-white/75 outline-none hover:border-white/20 focus:border-violet-400/50"
      >
        <option value="pt-BR">PT-BR</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </label>
  );
}
