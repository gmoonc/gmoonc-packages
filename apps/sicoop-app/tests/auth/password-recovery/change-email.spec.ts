import { test, expect } from '@playwright/test';
import { getActualUser, getSecondUser } from '../../helpers/test-config';

test.describe('Troca de Email', () => {
  test('deve trocar o email do usuário', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🎯 Testando troca de email');
    
    const user = getActualUser();
    const secondUser = getSecondUser();
    
    if (!secondUser) {
      throw new Error('❌ Usuário secundário não configurado. Configure ACTUAL_TEST_SECOND_USER no config.test');
    }
    
    console.log(`📧 Usuário atual: ${user.email}`);
    console.log(`📧 Novo email (do usuário secundário): ${secondUser.email}`);
    
    // 1. Fazer login com o usuário atual
    console.log('🔐 Fazendo login...');
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Sicoop');
    console.log('✅ Página de login carregada');
    
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.currentPassword);
    await page.click('button[type="submit"]');
    console.log('✅ Login iniciado');
    
    // Aguardar navegação ou verificar erro
    try {
      // Tentar aguardar navegação para dashboard ou página principal
      await Promise.race([
        page.waitForURL(/dashboard|^\/(?!auth)/, { timeout: 5000 }),
        page.waitForSelector('text=Bem-vindo', { timeout: 5000 }),
        page.waitForSelector('.user-profile-button', { timeout: 5000 })
      ]);
      
      // Verificar se ainda está na página de login (erro)
      const currentUrl = page.url();
      if (currentUrl.includes('/auth/login')) {
        // Verificar se há mensagem de erro
        const errorAlert = page.locator('.alert, [role="alert"], .error-message').first();
        if (await errorAlert.isVisible({ timeout: 2000 })) {
          const errorText = await errorAlert.textContent();
          throw new Error(`❌ Login falhou: ${errorText}`);
        }
        throw new Error('❌ Login falhou: ainda na página de login');
      }
      
      console.log('✅ Login realizado com sucesso');
    } catch (error) {
      // Se não navegou, verificar se há mensagem de erro específica
      const errorAlert = page.locator('.alert, [role="alert"], .error-message').first();
      if (await errorAlert.isVisible({ timeout: 2000 })) {
        const errorText = await errorAlert.textContent();
        throw new Error(`❌ Login falhou: ${errorText}. Verifique se a senha está correta no config.test`);
      }
      throw error;
    }
    
    // 2. Acessar "Gerenciar Minha Conta"
    console.log('👤 Acessando "Gerenciar Minha Conta"...');
    
    // Clicar no perfil do usuário no header para abrir o dropdown
    const profileButton = page.locator('.user-profile-button, [data-testid="user-profile"], button:has([class*="profile"])').first();
    
    if (await profileButton.isVisible({ timeout: 5000 })) {
      await profileButton.click();
      console.log('✅ Perfil do usuário clicado');
      await page.waitForTimeout(1000);
    } else {
      // Tentar encontrar o botão de perfil por outras formas
      const alternativeProfileSelectors = [
        '.user-profile button',
        'button:has([class*="avatar"])',
        '[aria-label*="perfil" i]',
        '[aria-label*="profile" i]'
      ];
      
      let profileFound = false;
      for (const selector of alternativeProfileSelectors) {
        const altButton = page.locator(selector).first();
        if (await altButton.isVisible({ timeout: 2000 })) {
          await altButton.click();
          profileFound = true;
          console.log('✅ Perfil do usuário encontrado por seletor alternativo');
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      if (!profileFound) {
        throw new Error('❌ Não foi possível encontrar o botão de perfil do usuário');
      }
    }
    
    // Clicar no botão "Conta" do dropdown
    const contaButton = page.locator('button.dropdown-option:has-text("Conta"), button:has-text("Conta")').first();
    
    if (await contaButton.isVisible({ timeout: 3000 })) {
      await contaButton.click();
      console.log('✅ Botão "Conta" clicado');
      await page.waitForTimeout(2000);
    } else {
      // Tentar encontrar por ícone ou texto alternativo
      const contaAlternativeSelectors = [
        'button:has([class*="option"]):has-text("Conta")',
        'button[role="menuitem"]:has-text("Conta")',
        '.dropdown-option:has-text("Conta")'
      ];
      
      let contaFound = false;
      for (const selector of contaAlternativeSelectors) {
        const altButton = page.locator(selector).first();
        if (await altButton.isVisible({ timeout: 2000 })) {
          await altButton.click();
          contaFound = true;
          console.log('✅ Botão "Conta" encontrado por seletor alternativo');
          await page.waitForTimeout(2000);
          break;
        }
      }
      
      if (!contaFound) {
        throw new Error('❌ Não foi possível encontrar o botão "Conta" no dropdown');
      }
    }
    
    // Verificar se a página "Gerenciar Minha Conta" foi carregada
    await page.waitForSelector('h1.page-title:has-text("Gerenciar Minha Conta"), h1:has-text("Gerenciar Minha Conta")', { timeout: 5000 });
    console.log('✅ Página "Gerenciar Minha Conta" carregada');
    
    // 3. Preencher o formulário de troca de email
    console.log('📧 Preenchendo formulário de troca de email...');
    
    // Aguardar o card de alterar email aparecer
    await page.waitForSelector('h2.card-title:has-text("Alterar Email"), h2:has-text("Alterar Email")', { timeout: 5000 });
    console.log('✅ Card "Alterar Email" encontrado');
    
    // Preencher Novo Email com o email do usuário secundário
    const newEmailInput = page.locator('input#newEmail, input[name="newEmail"]').first();
    if (await newEmailInput.isVisible({ timeout: 3000 })) {
      await newEmailInput.fill(secondUser.email);
      console.log(`✅ Campo "Novo Email" preenchido com: ${secondUser.email}`);
      await page.waitForTimeout(1000);
    } else {
      throw new Error('❌ Campo "Novo Email" não encontrado');
    }
    
    // 4. Clicar no botão "Solicitar Alteração"
    console.log('💾 Clicando em "Solicitar Alteração"...');
    const requestChangeButton = page.locator('button[type="submit"]:has-text("Solicitar Alteração"), button:has-text("Solicitar Alteração")').first();
    
    if (await requestChangeButton.isVisible({ timeout: 3000 })) {
      // Verificar se o botão não está desabilitado
      const isDisabled = await requestChangeButton.isDisabled();
      if (isDisabled) {
        throw new Error('❌ Botão "Solicitar Alteração" está desabilitado. Verifique se o email é diferente do atual.');
      }
      
      await requestChangeButton.click();
      console.log('✅ Botão "Solicitar Alteração" clicado');
    } else {
      // Tentar encontrar o botão dentro do formulário de email
      const formEmail = page.locator('form').filter({ has: page.locator('input#newEmail') }).first();
      const submitButton = formEmail.locator('button[type="submit"]').first();
      if (await submitButton.isVisible({ timeout: 2000 })) {
        const isDisabled = await submitButton.isDisabled();
        if (isDisabled) {
          throw new Error('❌ Botão de submit está desabilitado. Verifique se o email é diferente do atual.');
        }
        await submitButton.click();
        console.log('✅ Botão de submit encontrado no formulário');
      } else {
        throw new Error('❌ Botão "Solicitar Alteração" não encontrado');
      }
    }
    
    // 5. Aguardar redirecionamento para página de instruções
    console.log('⏳ Aguardando processamento e redirecionamento...');
    
    // O sistema deve redirecionar para a página de instruções de troca de email
    await page.waitForURL(/auth\/email-change-instructions/, { timeout: 10000 });
    const finalUrl = page.url();
    
    expect(finalUrl.includes('email-change-instructions')).toBe(true);
    console.log('✅ Redirecionamento para página de instruções realizado');
    
    // Verificar se a página de instruções foi carregada corretamente
    const instructionsPage = await page.locator('h1, h2').first();
    if (await instructionsPage.isVisible({ timeout: 3000 })) {
      const pageText = await instructionsPage.textContent();
      console.log(`✅ Página de instruções carregada: ${pageText}`);
    }
    
    console.log('🎯 Teste de troca de email concluído');
    console.log(`📧 Email do usuário ${user.email} foi alterado para ${secondUser.email}`);
    console.log('⚠️ IMPORTANTE: O usuário foi deslogado automaticamente. É necessário confirmar o novo email através do link enviado.');
  });
});

