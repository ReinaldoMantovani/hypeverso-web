/**
 * Idioma do CONTEÚDO (artigos e Shop) pedido à API.
 * - Artigos e produtos traduzidos pela IA local ficam em /en/... e /es/...
 * - Nas listagens o servidor lê o cookie hv_locale e o navegador lê o localStorage.
 */
export const CONTENT_LOCALES = ['en', 'es'] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];
export type AnyLocale = 'pt-BR' | ContentLocale;

export function contentLocale(v: string | null | undefined): ContentLocale | null {
  const base = (v || '').toLowerCase().split(/[-_]/)[0];
  return (CONTENT_LOCALES as readonly string[]).includes(base) ? (base as ContentLocale) : null;
}

/** Caminhos cujo conteúdo a API traduz quando recebe ?locale= */
const LOCALIZED = /^\/api\/(posts(\?|$)|posts\/[^/?]+(\?|$)|shop\/products|shop\/collections\/)/;

/** Acrescenta ?locale=xx (se ainda não houver) para os caminhos traduzíveis. */
export function withContentLocale(path: string, locale: string | null | undefined) {
  const l = contentLocale(locale);
  if (!l || !LOCALIZED.test(path) || /[?&]locale=/.test(path)) return path;
  return `${path}${path.includes('?') ? '&' : '?'}locale=${l}`;
}

/** URL pública de um artigo no idioma (pt-BR = sem prefixo). */
export function postPath(slug: string, locale?: string | null) {
  const l = contentLocale(locale);
  return l ? `/${l}/post/${slug}` : `/post/${slug}`;
}
