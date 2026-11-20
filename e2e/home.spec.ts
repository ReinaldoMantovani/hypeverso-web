import { test, expect } from '@playwright/test';

test('home renderiza a marca Hypeverso e o JSON-LD da organização', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Hypeverso/ }).first()).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ld).toContain('"Organization"');
});

test('CSP com nonce em todas as páginas HTML', async ({ request }) => {
  const res = await request.get('/');
  const csp = res.headers()['content-security-policy'] || '';
  expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
  expect(csp).toContain("object-src 'none'");
});

test('ads.txt, robots e sitemaps respondem', async ({ request }) => {
  expect((await request.get('/ads.txt')).ok()).toBeTruthy();
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('sitemap.xml');
  expect(robots).toContain('news-sitemap.xml');
  const index = await request.get('/sitemap.xml');
  expect(index.headers()['content-type']).toContain('xml');
  expect(await index.text()).toContain('<sitemapindex');
});

test('manifest PWA e service worker disponíveis', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some((i: any) => i.purpose === 'maskable')).toBeTruthy();
  expect((await request.get('/sw.js')).ok()).toBeTruthy();
});
