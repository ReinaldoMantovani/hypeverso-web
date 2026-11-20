/**
 * Produtos da Shop dentro de artigos. No CMS o editor insere um parágrafo com o
 * código [[produto:slug]]; aqui o HTML é dividido em pedaços e cada código vira
 * um card de compra (com o modal de apoio).
 */
export type PostSegment = { type: 'html'; html: string } | { type: 'product'; key: string };

const EMBED = /<p>\s*\[\[produto:([a-z0-9-]{1,120})\]\]\s*<\/p>/gi;

export function productKeys(html: string) {
  return [...new Set([...html.matchAll(EMBED)].map(m => m[1]))].slice(0, 20);
}

export function splitPostHtml(html: string): PostSegment[] {
  const out: PostSegment[] = [];
  let last = 0;
  for (const m of html.matchAll(EMBED)) {
    if (m.index! > last) out.push({ type: 'html', html: html.slice(last, m.index) });
    out.push({ type: 'product', key: m[1] });
    last = m.index! + m[0].length;
  }
  if (last < html.length) out.push({ type: 'html', html: html.slice(last) });
  return out.filter(s => s.type === 'product' || s.html.trim());
}

/** Remove códigos soltos (ex.: produto excluído) para não aparecer texto cru. */
export function stripLeftoverCodes(html: string) {
  return html.replace(/\[\[produto:[a-z0-9-]{1,120}\]\]/gi, '');
}
