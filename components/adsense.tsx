'use client';
import Script from 'next/script';
import { useEffect, useRef } from 'react';

import { ADSENSE_CLIENT, ADSENSE_ENABLED as VALID_CLIENT } from '@/lib/adsense-config';
import { isPremiumUser, useAuth } from '@/stores/auth';

/** Assinantes Premium navegam sem anúncios (benefício da assinatura). */
export function useAdsAllowed() {
  const { user, hydrated } = useAuth();
  return VALID_CLIENT && hydrated && !isPremiumUser(user);
}

/**
 * Carrega o adsbygoogle.js. As requisições de anúncio ficam pausadas
 * (pauseAdRequests=1, definido no <head>) até o usuário decidir no banner;
 * os sinais do Consent Mode v2 decidem entre anúncios personalizados ou não.
 */
export function AdSenseScript({ nonce }: { nonce?: string }) {
  const allowed = useAdsAllowed();
  // O script só é carregado após saber se o usuário é Premium: nada de Auto Ads
  // para assinantes (nem requisições ao Google).
  if (!allowed) return null;
  return (
    <Script
      nonce={nonce}
      id="adsbygoogle-js"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}

/**
 * Bloco de anúncio manual. Use apenas em páginas com conteúdo editorial próprio
 * (política do AdSense: nada de anúncios em telas vazias, de login ou de erro).
 */
export function AdSlot({
  slot,
  format = 'auto',
  layout,
  className = '',
}: {
  slot?: string;
  format?: string;
  layout?: string;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const allowed = useAdsAllowed();
  useEffect(() => {
    if (!allowed || !slot || !ref.current || ref.current.dataset.adsPushed) return;
    ref.current.dataset.adsPushed = '1';
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot, allowed]);
  if (!allowed || !slot) return null;
  return (
    <aside aria-label="Publicidade" className={`my-10 ${className}`}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-[.2em] text-white/30">Publicidade</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
