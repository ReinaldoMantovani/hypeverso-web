import { withContentLocale } from './content-locale';
// Browser requests use the Next.js same-origin gateway (/api/*). This avoids
// CORS/preflight problems and prevents transient API container restarts from
// surfacing as the unhelpful browser error "Failed to fetch".
const configuredPublicApi = (process.env.NEXT_PUBLIC_API_URL || '').trim();
export const API_URL = configuredPublicApi.startsWith('/') ? configuredPublicApi.replace(/\/$/, '') : '';
let refreshing: Promise<boolean> | null = null;
let csrfLoading: Promise<string | null> | null = null;

// A sessão vive em cookies HttpOnly (nv_access / nv_refresh) definidos pela API:
// o JavaScript da página não tem acesso ao token. Para requisições que alteram
// dados enviamos o token CSRF (double-submit) lido do cookie nv_csrf.
const CSRF_COOKIE = 'nv_csrf';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

async function csrfToken() {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  csrfLoading ??= fetch(`${API_URL}/api/auth/csrf`, { credentials: 'include', cache: 'no-store' })
    .then(r => r.json())
    .then((j: { csrfToken?: string }) => readCookie(CSRF_COOKIE) || j.csrfToken || null)
    .catch(() => null)
    .finally(() => {
      csrfLoading = null;
    });
  return csrfLoading;
}

/** @deprecated A sessão agora fica em cookie HttpOnly; mantido só por compatibilidade. */
export function setToken(_v: string | null) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('nv_access');
    } catch {}
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function isRetryableMethod(method: string) {
  return ['GET', 'HEAD', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

async function fetchResilient(url: string, init: RequestInit, attempts?: number) {
  const method = (init.method || 'GET').toUpperCase();
  const retryableMethod = isRetryableMethod(method);
  const maxAttempts = attempts ?? (retryableMethod ? 6 : 1);
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, init);
      // O gateway pode retornar 502 enquanto o container da API reinicia e a API
      // pode devolver 503/504 em indisponibilidades transitórias de banco. Para
      // operações idempotentes, tente novamente antes de transformar isso em erro
      // visível na interface.
      const retryableStatus = response.status === 502 || response.status === 503 || response.status === 504;
      if (retryableMethod && retryableStatus && attempt < maxAttempts) {
        await response.arrayBuffer().catch(() => undefined);
        await sleep(350 * attempt);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(350 * attempt);
        continue;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Falha de comunicação com a API');
}

async function refresh() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const headers = new Headers({ Accept: 'application/json' });
    const csrf = await csrfToken();
    if (csrf) headers.set('x-csrf-token', csrf);
    const r = await fetchResilient(
      `${API_URL}/api/auth/refresh`,
      { method: 'POST', credentials: 'include', cache: 'no-store', headers },
      1,
    );
    return r.ok;
  })()
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function readResponseText(res: Response) {
  return (await res.text()).replace(/^\uFEFF/, '').trim();
}

function parseJsonText(text: string) {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (error) {
    const preview = text.slice(0, 80).replace(/\s+/g, ' ');
    throw new Error(`Resposta JSON inválida recebida pelo gateway. Início da resposta: ${preview}`);
  }
}

async function errorInfo(res: Response): Promise<{ message: string; code?: string }> {
  try {
    const text = await readResponseText(res);
    const j = parseJsonText(text) as any;
    return { message: formatError(j, res.status), code: typeof j?.code === 'string' ? j.code : undefined };
  } catch (error) {
    return { message: error instanceof Error ? error.message : `Erro HTTP ${res.status}` };
  }
}

function formatError(j: any, status: number) {
  {
    const requestId = j?.requestId ? ` · ID ${j.requestId}` : '';
    if (Array.isArray(j?.issues) && j.issues.length) {
      const detail = j.issues
        .map((i: any) => `${Array.isArray(i.path) && i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`)
        .join(' · ');
      return `${j.error || 'Dados inválidos'} — ${detail}${requestId}`;
    }
    const primary =
      j?.error && j.error !== 'Internal Server Error' ? j.error : j?.message || j?.error || `Erro HTTP ${status}`;
    return `${primary}${requestId}`;
  }
}

function browserLocale() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('hypeverso_locale');
  } catch {
    return null;
  }
}

export async function api<T = any>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  // Listas de artigos e da Shop vêm no idioma escolhido (quando já traduzidas).
  if (!init.method || init.method.toUpperCase() === 'GET') path = withContentLocale(path, browserLocale());
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && init.body !== undefined) headers.set('Content-Type', 'application/json');
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  const method = (init.method || 'GET').toUpperCase();
  if (UNSAFE_METHODS.has(method)) {
    const csrf = await csrfToken();
    if (csrf) headers.set('x-csrf-token', csrf);
  }

  const requestInit: RequestInit = { ...init, headers, credentials: 'include', cache: 'no-store' };
  let res: Response;
  try {
    res = await fetchResilient(`${API_URL}${path}`, requestInit);
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? `Não foi possível alcançar a API: ${error.message}`
        : 'Não foi possível alcançar a API.',
    );
  }

  if (res.status === 401 && retry && !path.startsWith('/api/auth/')) {
    if (await refresh()) res = await fetchResilient(`${API_URL}${path}`, { ...requestInit, headers });
  }
  if (res.status === 403 && retry && UNSAFE_METHODS.has(method)) {
    // Cookie CSRF ausente/rotacionado: obtém um novo e repete uma única vez.
    const info = await errorInfo(res.clone());
    if (info.code === 'CSRF_INVALID') {
      document.cookie = `${CSRF_COOKIE}=; path=/; max-age=0`;
      const csrf = await csrfToken();
      if (csrf) headers.set('x-csrf-token', csrf);
      res = await fetchResilient(`${API_URL}${path}`, { ...requestInit, headers });
    }
  }
  if (!res.ok) {
    const info = await errorInfo(res);
    throw new ApiError(info.message, res.status, info.code);
  }
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return undefined as T;
  const text = await readResponseText(res);
  if (!text) return undefined as T;
  try {
    return parseJsonText(text) as T;
  } catch (error) {
    // Em gravações 2xx, o banco já confirmou a operação. Não transforme um problema
    // de representação da resposta em falso "falhou ao salvar". Para GET/HEAD,
    // o JSON é o dado solicitado e portanto a falha precisa continuar visível.
    if (method !== 'GET' && method !== 'HEAD') {
      console.warn('[Hypeverso] operação concluída, mas a resposta JSON não pôde ser interpretada', error);
      return undefined as T;
    }
    throw error;
  }
}

export async function serverApi<T = any>(path: string): Promise<T> {
  const { backendBase, gatewayHeaders } = await import('./backend');
  // No servidor o idioma vem do cookie hv_locale (definido pelo seletor de idioma).
  if (!/[?&]locale=/.test(path)) {
    try {
      const { cookies } = await import('next/headers');
      path = withContentLocale(path, (await cookies()).get('hv_locale')?.value);
    } catch {
      // fora de uma requisição (build/sitemap): sem idioma
    }
  }
  const res = await fetch(`${backendBase()}${path}`, {
    // O segredo do gateway isenta a renderização do servidor do rate limit por IP.
    headers: { Accept: 'application/json', 'Accept-Encoding': 'identity', ...gatewayHeaders() },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Falha ao carregar dados');
  const text = (await res.text()).replace(/^\uFEFF/, '').trim();
  if (!text) return undefined as T;
  return parseJsonText(text) as T;
}
