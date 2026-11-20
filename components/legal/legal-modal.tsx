'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, Cookie, ShieldCheck, X } from 'lucide-react';
import { LegalDocument } from './legal-document';
import { legalRoutes, type LegalKind } from '@/lib/legal-content';
import { openCookieSettings } from '@/components/cookie-consent';
import { useI18n } from '@/lib/i18n';

const OPEN_EVENT = 'hypeverso:open-legal';

/** Abre o popup jurídico de qualquer lugar do app. */
export function openLegalModal(kind: LegalKind) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<LegalKind>(OPEN_EVENT, { detail: kind }));
}

const TABS: { kind: LegalKind; icon: typeof FileText; key: 'privacy' | 'terms' | 'cookies' }[] = [
  { kind: 'privacy', icon: ShieldCheck, key: 'privacy' },
  { kind: 'terms', icon: FileText, key: 'terms' },
  { kind: 'cookies', icon: Cookie, key: 'cookies' },
];

export function LegalModal() {
  const { t } = useI18n();
  const [kind, setKind] = useState<LegalKind | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    setKind(null);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      lastFocus.current = document.activeElement as HTMLElement;
      setKind((e as CustomEvent<LegalKind>).detail || 'privacy');
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!kind) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    bodyRef.current?.scrollTo({ top: 0 });
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      // Focus trap simples para acessibilidade.
      const nodes = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      ];
      if (!nodes.length) return;
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [kind, close]);

  if (!kind) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={e => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0b0814] shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <h2 id="legal-modal-title" className="font-black">
            {t(kind)}
          </h2>
          <button
            data-autofocus
            aria-label={t('close')}
            onClick={close}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div
          role="tablist"
          aria-label="Documentos legais"
          className="flex gap-1 overflow-x-auto border-b border-white/5 px-3 py-2 sm:px-5"
        >
          {TABS.map(({ kind: k, icon: Icon, key }) => (
            <button
              key={k}
              role="tab"
              aria-selected={kind === k}
              onClick={() => {
                setKind(k);
                bodyRef.current?.scrollTo({ top: 0 });
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${kind === k ? 'bg-violet-500/20 text-violet-100' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={14} />
              {t(key)}
            </button>
          ))}
        </div>
        <div ref={bodyRef} role="tabpanel" className="overflow-y-auto px-4 py-5 text-sm sm:px-6">
          <LegalDocument kind={kind} compact headingLevel={2} />
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            href={legalRoutes[kind]}
            onClick={close}
            className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:underline"
          >
            <ExternalLink size={13} />
            {t('legalOpenPage')}
          </Link>
          <div className="flex gap-2">
            {kind === 'cookies' && (
              <button
                onClick={() => {
                  close();
                  openCookieSettings();
                }}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5"
              >
                {t('cookieSettings')}
              </button>
            )}
            <button
              onClick={close}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
            >
              {t('legalUnderstood')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
