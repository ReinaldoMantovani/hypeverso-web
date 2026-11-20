// /ads.txt — obrigatório para o AdSense autorizar a venda do inventário do domínio.
// Gerado a partir de NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX → pub-XXXX).
// ADS_TXT_EXTRA permite acrescentar linhas de outras redes (separadas por \n).
export const dynamic = 'force-static';
export function GET() {
  const client = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '').trim();
  const lines: string[] = [];
  const pub = client.replace(/^ca-/, '');
  if (/^pub-\d{10,20}$/.test(pub)) lines.push(`google.com, ${pub}, DIRECT, f08c47fec0942fa0`);
  const extra = (process.env.ADS_TXT_EXTRA || '')
    .split(/\\n|\n/)
    .map(l => l.trim())
    .filter(Boolean);
  lines.push(...extra);
  const body = lines.length
    ? lines.join('\n') + '\n'
    : '# ads.txt ainda não configurado (defina NEXT_PUBLIC_ADSENSE_CLIENT)\n';
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
