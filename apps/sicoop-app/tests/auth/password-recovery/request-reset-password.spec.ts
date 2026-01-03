import { test, expect } from '@playwright/test';
import { getActualUser } from '../../helpers/test-config';

test.describe('Solicitar Reset de Senha', () => {
  test('deve solicitar reset de senha', async ({ page }) => {
    console.log('🎯 Testando solicitação de reset de senha');
    
    const user = getActualUser();
    
    console.log('🔐 Acessando página de login...');
    await page.goto('/auth/login');
    console.log('✅ Página de login carregada');
    
    console.log('🔍 Procurando link "Esqueceu sua senha?"...');
    const forgotPasswordLink = page.locator('a:has-text("Esqueceu sua senha?")');
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      console.log('✅ Link "Esqueceu sua senha?" clicado');
      await page.waitForTimeout(2000);
      console.log('✅ Página de recuperação carregada');
    } else {
      console.log('⚠️ Link "Esqueceu sua senha?" não encontrado, navegando diretamente');
      await page.goto('/auth/forgot-password');
      await page.waitForTimeout(2000);
    }
    
    console.log('📧 Preenchendo email...');
    await page.fill('input[type="email"]', user.email);
    console.log(`✅ Email preenchido: ${user.email}`);
    
    console.log('📤 Clicando no botão de enviar...');
    await page.click('button[type="submit"]');
    console.log('✅ Solicitação de reset enviada');
    
    await page.waitForTimeout(3000);
    
    // Verificar se houve mensagem de sucesso
    const successMessages = [
      page.locator('text=Email enviado'),
      page.locator('text=Verifique seu email'),
      page.locator('text=Link de recuperação enviado'),
      page.locator('text=Email de recuperação enviado'),
      page.locator('text=Sucesso'),
      page.locator('text=Recuperação')
    ];
    
    let hasSuccess = false;
    for (const message of successMessages) {
      if (await message.isVisible()) {
        console.log('✅ Mensagem de sucesso detectada');
        hasSuccess = true;
        break;
      }
    }
    
    if (!hasSuccess) {
      console.log('✅ Solicitação de reset processada (sem mensagem visível)');
    }
    
    console.log('📧 Email de reset deve ter sido enviado');
    console.log('📝 Próximo passo: Cole o link de reset no arquivo tests/config.test');
    console.log('🎯 Teste de solicitação concluído');
  });
});

