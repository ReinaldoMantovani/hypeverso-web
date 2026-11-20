import { test, expect } from '@playwright/test';

test.describe('consentimento de cookies e popups legais', () => {
  test('banner aparece, recusar grava escolha e mantém Consent Mode negado', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('dialog', { name: 'Sua privacidade importa' });
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Recusar opcionais', exact: true }).click();
    await expect(banner).toBeHidden();
    const state = await page.evaluate(() => ({
      consent: JSON.parse(localStorage.getItem('hyperverso_cookie_consent_v2') || 'null'),
      dataLayer: JSON.stringify((window as any).dataLayer?.map((x: any) => Array.from(x))),
    }));
    expect(state.consent.ads).toBe(false);
    expect(state.dataLayer).toContain('"ad_storage":"denied"');
    await page.reload();
    await expect(page.getByRole('dialog', { name: 'Sua privacidade importa' })).toBeHidden();
  });

  test('fechar o banner equivale a recusar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Fechar e recusar opcionais' }).click();
    const consent = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('hyperverso_cookie_consent_v2') || 'null'),
    );
    expect(consent.analytics).toBe(false);
  });

  test('links legais abrem o popup e a página completa continua indexável', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('dialog', { name: 'Sua privacidade importa' })
      .getByRole('link', { name: 'Termos de Uso' })
      .click();
    const modal = page.getByRole('dialog', { name: 'Termos de Uso' });
    await expect(modal).toBeVisible();
    await modal.getByRole('tab', { name: 'Política de Privacidade' }).click();
    await expect(modal.getByText('Fornecedores terceiros, incluindo o Google')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    const res = await page.goto('/politica-de-privacidade');
    expect(res?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1, name: 'Política de Privacidade' })).toBeVisible();
  });

  test('aceitar libera anúncios personalizados no Consent Mode', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar todos' }).click();
    const dl = await page.evaluate(() => JSON.stringify((window as any).dataLayer?.map((x: any) => Array.from(x))));
    expect(dl).toContain('"ad_personalization":"granted"');
  });
});
