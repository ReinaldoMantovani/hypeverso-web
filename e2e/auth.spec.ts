import { test, expect } from '@playwright/test';

// Requer a API e o banco (em CI: docker compose). Ignorado quando E2E_WITH_API não está definido.
test.skip(!process.env.E2E_WITH_API, 'Fluxos de conta exigem API + banco (defina E2E_WITH_API=1)');

const unique = Date.now().toString(36);
const user = {
  name: 'Teste E2E',
  username: `e2e_${unique}`,
  email: `e2e_${unique}@example.com`,
  password: 'senha-super-forte-123',
};

test('cadastro exige aceite, cria sessão HttpOnly e permite sair e entrar', async ({ page, context }) => {
  await page.goto('/cadastro');
  await page.getByRole('button', { name: 'Recusar opcionais', exact: true }).click();
  await page.getByPlaceholder('Nome').fill(user.name);
  await page.getByPlaceholder('Usuário').fill(user.username);
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Senha').fill(user.password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  // Sem o aceite, o navegador barra (checkbox required); marcamos e enviamos.
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/$/);

  const cookies = await context.cookies();
  const access = cookies.find(c => c.name === 'nv_access');
  expect(access?.httpOnly).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('nv_access'))).toBeNull();
  await expect(page.getByText('Confirme seu e-mail')).toBeVisible();

  await page.getByTitle('Sair').click();
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Senha').fill(user.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('central de privacidade exporta os dados da conta', async ({ page }) => {
  await page.goto('/login');
  const banner = page.getByRole('button', { name: 'Recusar opcionais', exact: true });
  if (await banner.isVisible()) await banner.click();
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Senha').fill(user.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/conta/privacidade');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar dados' }).click();
  expect((await download).suggestedFilename()).toContain('hypeverso-meus-dados');
});
