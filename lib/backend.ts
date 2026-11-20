/**
 * Conexão servidor → API do Hypeverso (usado só no lado do servidor: SSR,
 * gateway /api, proxy /uploads e sitemaps).
 *
 * Na Hostinger o site e a API ficam em servidores diferentes. Configure:
 *   API_INTERNAL_URL=https://api.seudominio.com.br
 *   GATEWAY_SHARED_SECRET=<mesmo valor do .env da API>
 */
export function backendBase() {
  return (process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000').replace(/\/$/, '');
}

const SECRET = () => (process.env.GATEWAY_SHARED_SECRET || '').trim();

/**
 * IP real do visitante. Na Hostinger o proxy da hospedagem envia X-Real-IP /
 * X-Forwarded-For; com Cloudflare na frente use CLIENT_IP_HEADER=cf-connecting-ip.
 */
export function visitorIp(headers: Headers) {
  const preferred = (process.env.CLIENT_IP_HEADER || '').trim().toLowerCase();
  if (preferred) {
    const v = headers.get(preferred);
    if (v) return v.split(',')[0].trim();
  }
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  // O proxy mais próximo acrescenta o IP de quem falou com ele no FIM da lista.
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return '';
}

/** Cabeçalhos que identificam este servidor como gateway confiável da API. */
export function gatewayHeaders(clientIp?: string): Record<string, string> {
  const secret = SECRET();
  if (!secret) return {};
  return clientIp ? { 'x-hv-gateway-secret': secret, 'x-hv-client-ip': clientIp } : { 'x-hv-gateway-secret': secret };
}
