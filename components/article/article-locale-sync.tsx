'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { contentLocale, postPath, type AnyLocale } from '@/lib/content-locale';

/**
 * Leva o leitor para a versão do artigo no idioma que ELE escolheu no seletor
 * (pt-BR = /post/x, inglês = /en/post/x, espanhol = /es/post/x).
 * Só age quando há uma escolha salva; visitantes vindos do Google em outro
 * idioma continuam na página que abriram.
 */
export function ArticleLocaleSync({ slug, pageLocale, available }: { slug: string; pageLocale: AnyLocale; available: string[] }) {
  const { locale } = useI18n();
  const router = useRouter();
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('hypeverso_locale');
    } catch {}
    if (!saved) return;
    const wanted: AnyLocale = contentLocale(saved) ?? 'pt-BR';
    if (wanted === pageLocale) return;
    let target: string | null = null;
    if (wanted === 'pt-BR') target = postPath(slug);
    else if (available.includes(wanted)) target = postPath(slug, wanted);
    else if (pageLocale !== 'pt-BR') target = postPath(slug); // idioma sem tradução: volta ao original
    if (target && target !== window.location.pathname) router.replace(target + window.location.hash, { scroll: false });
  }, [locale, slug, pageLocale, available, router]);
  return null;
}
