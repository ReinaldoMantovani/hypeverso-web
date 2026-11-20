export function assetUrl(value?: string | null) {
  if (!value) return '';
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const current = new URL(base);
    const parsed = new URL(value, base);
    const localLegacyApi = ['localhost', '127.0.0.1'].includes(parsed.hostname) && parsed.port === '4000';
    const sameOrigin = parsed.origin === current.origin;
    if (parsed.pathname.startsWith('/uploads/') && (sameOrigin || localLegacyApi)) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return value;
  } catch {
    return value;
  }
}

export function normalizeManagedAssetHtml(html?: string | null) {
  if (!html) return '';
  return html.replace(
    /(src=["'])(https?:\/\/(?:localhost|127\.0\.0\.1):4000)?(\/uploads\/[^"']+)(["'])/gi,
    (_m, prefix, _origin, path, suffix) => `${prefix}${path}${suffix}`,
  );
}
