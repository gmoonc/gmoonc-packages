import { test, expect } from '@playwright/test';
import { getActualUser, loadTestConfig } from '../../helpers/test-config';

test.describe('Confirmação de Usuário', () => {
  test('deve confirmar usuário via email e fazer login/logout', async ({ page }) => {
    console.log('🎯 Testando confirmação de usuário');
    
    const config = loadTestConfig();
    const user = getActualUser();
    
    if (!config.temporaryLink || config.temporaryLink.trim() === '') {
      throw new Error(
        '❌ Link temporário não configurado.\n' +
        '📝 Preencha TEMPORARY_LINK no arquivo tests/config.test'
      );
    }
    
    const confirmationLink = config.temporaryLink.trim();
    console.log('✅ Link temporário carregado');

    console.log('🔗 Acessando link de confirmação...');
    await page.goto(confirmationLink);
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('🌐 URL após confirmação:', currentUrl);
    
    let confirmationSuccess = false;
    const successIndicators = ['Conta confirmada', 'Email confirmado', 'Bem-vindo', 'Dashboard'];
    
    for (const indicator of successIndicators) {
      const element = page.locator(`text=${indicator}`);
      if (await element.isVisible()) {
        console.log(`✅ Confirmação detectada: ${indicator}`);
        confirmationSuccess = true;
        break;
      }
    }
    
    if (!confirmationSuccess && !currentUrl.includes('dashboard')) {
      console.log('🔄 Tentando fazer login após confirmação...');
      await page.goto('/auth/login');
      await page.waitForTimeout(2000);
      
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', user.currentPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const loginSuccess = await page.locator('text=Bem-vindo').isVisible() ||
                          page.url().includes('dashboard');
      
      if (loginSuccess) {
        confirmationSuccess = true;
      }
    }

    expect(confirmationSuccess).toBe(true);
    console.log('✅ Usuário confirmado');

    console.log('🚪 Realizando logout...');
    
    // Clicar no perfil do usuário no header para abrir o dropdown
    const profileButton = page.locator('[data-testid="user-profile"], .user-profile, button:has([class*="profile"])').first();
    
    if (await profileButton.isVisible({ timeout: 5000 })) {
      await profileButton.click();
      console.log('✅ Perfil do usuário clicado');
      await page.waitForTimeout(1000);
    } else {
      // Tentar encontrar o botão de perfil por outras formas
      const alternativeProfileSelectors = [
        'button:has-text("' + user.name?.split(' ')[0] + '")',
        '.profile-button',
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
        // Última tentativa: procurar qualquer elemento clicável que possa ser o perfil
        const initials = user.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
        const initialsButton = page.locator(`text=${initials}`).first();
        if (await initialsButton.isVisible({ timeout: 2000 })) {
          await initialsButton.click();
          console.log('✅ Perfil do usuário encontrado pelas iniciais');
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Clicar no botão "Sair" do dropdown
    const sairButton = page.locator('button.dropdown-option:has-text("Sair"), button:has-text("Sair")').first();
    
    if (await sairButton.isVisible({ timeout: 3000 })) {
      await sairButton.click();
      console.log('✅ Botão "Sair" do dropdown clicado');
    } else {
      // Tentar encontrar o botão Sair no menu lateral como fallback
      const menuSairButton = page.locator('div.menu-link:has-text("Sair")');
      if (await menuSairButton.isVisible({ timeout: 2000 })) {
        await menuSairButton.click();
        console.log('✅ Botão "Sair" do menu clicado');
      }
    }
    
    // Aguardar o modal de confirmação aparecer
    await page.waitForTimeout(2000);
    
    // Aguardar o modal estar visível antes de tentar clicar
    const modalOverlay = page.locator('.modal-overlay').first();
    await modalOverlay.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Modal de confirmação apareceu');
    
    // Clicar no botão de confirmação do modal
    const confirmButton = page.locator('button.logout-confirm-button:has-text("Sair")').first();
    
    if (await confirmButton.isVisible({ timeout: 3000 })) {
      await confirmButton.click();
      console.log('✅ Botão de confirmação do modal clicado');
    } else {
      // Tentar outros seletores como fallback
      const fallbackSelectors = [
        '.logout-confirm-button',
        'button.logout-confirm-button',
        'button:has-text("Sair")'
      ];
      
      let modalConfirmed = false;
      for (const selector of fallbackSelectors) {
        const modalButton = page.locator(selector).first();
        if (await modalButton.isVisible({ timeout: 2000 })) {
          await modalButton.click();
          modalConfirmed = true;
          console.log(`✅ Botão de confirmação encontrado com seletor: ${selector}`);
          break;
        }
      }
      
      if (!modalConfirmed) {
        throw new Error('Modal de confirmação não encontrado após aguardar');
      }
    }
    
    // Aguardar o logout ser processado e redirecionamento
    await page.waitForTimeout(3000);
    
    // Verificar se foi redirecionado para a página de login
    const finalUrl = page.url();
    const isLoggedOut = finalUrl.includes('login') || finalUrl.includes('auth') || finalUrl.includes('/auth/login');
    
    if (!isLoggedOut) {
      // Aguardar um pouco mais e verificar novamente
      await page.waitForTimeout(2000);
      const retryUrl = page.url();
      expect(retryUrl.includes('login') || retryUrl.includes('auth') || retryUrl.includes('/auth/login')).toBe(true);
    } else {
      expect(isLoggedOut).toBe(true);
    }
    
    console.log('✅ Logout realizado');

    console.log('🎯 Teste de confirmação concluído');
  });
});

