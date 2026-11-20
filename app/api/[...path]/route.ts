import type { NextRequest } from 'next/server';
import { backendBase, gatewayHeaders, visitorIp } from '@/lib/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
]);


function canRetry(method: string) {
  return ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method.toUpperCase());
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathname = `/api/${(path || []).map(encodeURIComponent).join('/')}`;
  const target = `${backendBase()}${pathname}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === 'host' || lower === 'accept-encoding' || lower.startsWith('x-hv-')) return;
    headers.set(key, value);
  });
  // IMPORTANT: não encaminhe gzip/br/zstd do navegador para a API. O fetch do
  // Node pode descompactar alguns encodings automaticamente e manter outros como
  // bytes crus, o que fazia JSON válido chegar ao browser como caracteres binários
  // ("Unexpected token ... is not valid JSON"). Entre Web -> API usamos identity.
  headers.set('accept-encoding', 'identity');
  headers.set('x-nexverse-internal-gateway', '1');
  headers.set('x-forwarded-host', request.headers.get('host') || 'localhost:3000');
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', '') || 'http');
  // A API fica em outro servidor: repassamos o IP real do visitante assinado com o
  // segredo compartilhado (rate limit e antifraude por visitante, não por servidor).
  const ip = visitorIp(request.headers);
  for (const [key, value] of Object.entries(gatewayHeaders(ip || 'unknown'))) headers.set(key, value);

  const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.arrayBuffer();
  const attempts = canRetry(method) ? 3 : 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 65_000);
      let upstream: Response;
      try {
        upstream = await fetch(target, {
          method,
          headers,
          body,
          redirect: 'manual',
          cache: 'no-store',
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (canRetry(method) && [502, 503, 504].includes(upstream.status) && attempt < attempts) {
        await upstream.arrayBuffer().catch(() => undefined);
        await new Promise(resolve => setTimeout(resolve, 400 * attempt));
        continue;
      }

      const responseHeaders = new Headers();
      upstream.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (HOP_BY_HOP.has(lower) || lower === 'content-encoding' || lower === 'set-cookie') return;
        responseHeaders.append(key, value);
      });

      const getSetCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
      if (typeof getSetCookie === 'function') {
        for (const cookie of getSetCookie.call(upstream.headers)) responseHeaders.append('set-cookie', cookie);
      } else {
        const cookie = upstream.headers.get('set-cookie');
        if (cookie) responseHeaders.append('set-cookie', cookie);
      }

      responseHeaders.set('x-nexverse-gateway', 'web');
      responseHeaders.set('x-nexverse-gateway-version', 'v8-runtime-fix');
      // Como pedimos identity, o corpo chega sem compressão. Para JSON usamos text()
      // para garantir que o Next devolva UTF-8 textual; binários continuam ArrayBuffer.
      const upstreamType = upstream.headers.get('content-type') || '';
      const responseBody =
        method === 'HEAD'
          ? null
          : upstreamType.includes('application/json')
            ? await upstream.text()
            : await upstream.arrayBuffer();
      return new Response(responseBody, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 350 * attempt));
    }
  }

  // "fetch failed" sozinho não diz nada: mostra o motivo real (cause) e para onde tentou ir.
  const cause =
    lastError instanceof Error && lastError.cause && typeof lastError.cause === 'object'
      ? (lastError.cause as { code?: string; message?: string })
      : undefined;
  const destino = (() => {
    try {
      return new URL(backendBase()).origin;
    } catch {
      return 'API_INTERNAL_URL inválida';
    }
  })();
  const base = lastError instanceof Error ? lastError.message : 'Falha de comunicação com a API';
  const detail = cause ? ` (${[cause.code, cause.message].filter(Boolean).join(': ')})` : '';
  const hint = process.env.API_INTERNAL_URL ? '' : ' — API_INTERNAL_URL não definida no site';
  const message = `${base}${detail} → ${destino}${hint}`;
  return Response.json(
    {
      error:
        'A API do Hypeverso ficou temporariamente indisponível. Tente novamente em alguns segundos; o editor mantém seu conteúdo na tela.',
      message,
      code: 'API_GATEWAY_UNAVAILABLE',
    },
    { status: 502, headers: { 'x-nexverse-gateway': 'web' } },
  );
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
export const OPTIONS = forward;
export const HEAD = forward;
