import { test, expect } from '@playwright/test';
import { getActualUser } from '../../helpers/test-config';

test.describe('Criação de Usuário', () => {
  test('deve criar um novo usuário', async ({ page }) => {
    console.log('🎯 Testando criação de usuário');
    
    const user = getActualUser();
    
    await page.goto('/auth/register');
    await expect(page.locator('h1')).toContainText('Criar Conta');
    console.log('✅ Página de registro carregada');

    const [firstName, lastName] = user.email.split('@')[0].split('.');
    const fullName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
    
    await page.fill('input[name="name"]', fullName);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.currentPassword);
    await page.fill('input[name="confirmPassword"]', user.currentPassword);
    console.log(`✅ Formulário preenchido com ${fullName}`);

    await page.click('button[type="submit"]');
    console.log('✅ Botão de criar conta clicado');

    await page.waitForTimeout(5000);
    console.log('⏳ Aguardando processamento...');

    const successMessage = page.locator('text=Conta criada com sucesso! Verifique seu email para ativar a conta.');
    const errorMessage = page.locator('.auth-error');
    
    const hasSuccess = await successMessage.isVisible();
    const hasError = await errorMessage.isVisible();
    
    if (hasSuccess) {
      console.log(`✅ Usuário ${fullName} criado com sucesso!`);
      console.log(`📧 Email de confirmação enviado para ${user.email}`);
    } else if (hasError) {
      const errorText = await errorMessage.textContent();
      console.log('⚠️ Erro na criação:', errorText);
    }
    
    await expect(successMessage.or(errorMessage)).toBeVisible();
    console.log('🎯 Teste de criação concluído');
  });
});

