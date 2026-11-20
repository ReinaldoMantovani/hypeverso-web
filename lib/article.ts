// Utilidades de leitura: tempo estimado e índice (TOC) gerados a partir do HTML
// já sanitizado pela API.
export type TocItem = { id: string; text: string; level: 2 | 3 };

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

export function plainText(html: string) {
  return decode(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingTimeMinutes(html: string, wordsPerMinute = 220) {
  const words = plainText(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

function slug(text: string) {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'secao'
  );
}

/** Adiciona ids aos h2/h3 e devolve o índice. */
export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const out = html.replace(
    /<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (_m, tag: string, attrs: string | undefined, inner: string) => {
      const text = plainText(inner);
      if (!text) return _m;
      const base = slug(text);
      const n = used.get(base) || 0;
      used.set(base, n + 1);
      const id = n ? `${base}-${n + 1}` : base;
      toc.push({ id, text: text.slice(0, 120), level: tag.toLowerCase() === 'h2' ? 2 : 3 });
      const cleanAttrs = (attrs || '').replace(/\sid="[^"]*"/i, '');
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    },
  );
  return { html: out, toc };
}
