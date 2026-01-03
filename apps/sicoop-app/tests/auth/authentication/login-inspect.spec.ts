import { test, expect } from '@playwright/test';
import { getActualUser } from '../../helpers/test-config';

test.describe('Login para Inspeção', () => {
  test('deve fazer login, pausar para inspeção e fazer logout ao continuar - Desktop', async ({ page }) => {
    console.log('🎯 Testando login para inspeção manual - Desktop');
    
    // Configurar viewport desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const user = getActualUser();
    
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Sicoop');
    console.log('✅ Página de login carregada');
    
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.currentPassword);
    await page.click('button[type="submit"]');
    console.log('✅ Login iniciado');
    
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    
    const loginSuccess = await page.locator('text=Bem-vindo').isVisible() || 
                        currentUrl.includes('dashboard') ||
                        await page.locator('text=Dashboard').isVisible();
    
    expect(loginSuccess).toBe(true);
    console.log('✅ Login realizado com sucesso');
    console.log('📍 URL atual:', currentUrl);
    
    // Pausar para inspeção manual
    // O Playwright Inspector será aberto e você pode:
    // - Inspecionar elementos
    // - Ver o console
    // - Navegar manualmente
    // - Clicar em "Resume" para continuar (fará logout automaticamente)
    console.log('⏸️ Pausando para inspeção manual...');
    console.log('💡 Use o Playwright Inspector para inspecionar a página');
    console.log('💡 Clique em "Resume" para continuar e fazer logout automaticamente');
    
    await page.pause();
    
    // Após o resume, fazer logout automaticamente
    console.log('🚪 Realizando logout após inspeção...');
    
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
        console.log('⚠️ Modal de confirmação não encontrado após aguardar');
      }
    }
    
    // Aguardar o logout ser processado e redirecionamento
    await page.waitForTimeout(3000);
    
    // Verificar se foi redirecionado para a página de login
    const finalUrl = page.url();
    const isLoggedOut = finalUrl.includes('login') || finalUrl.includes('auth') || finalUrl.includes('/auth/login');
    
    if (isLoggedOut) {
      console.log('✅ Logout realizado com sucesso');
    } else {
      console.log('⚠️ Logout processado, mas URL ainda não mudou');
    }
    
    console.log('🎯 Teste de login para inspeção concluído');
  });

  test('deve fazer login, pausar para inspeção e fazer logout ao continuar - Tablet', async ({ page }) => {
    console.log('🎯 Testando login para inspeção manual - Tablet');
    
    // Configurar viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const user = getActualUser();
    
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Sicoop');
    console.log('✅ Página de login carregada');
    
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.currentPassword);
    await page.click('button[type="submit"]');
    console.log('✅ Login iniciado');
    
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    
    const loginSuccess = await page.locator('text=Bem-vindo').isVisible() || 
                        currentUrl.includes('dashboard') ||
                        await page.locator('text=Dashboard').isVisible();
    
    expect(loginSuccess).toBe(true);
    console.log('✅ Login realizado com sucesso');
    console.log('📍 URL atual:', currentUrl);
    
    // Pausar para inspeção manual
    console.log('⏸️ Pausando para inspeção manual...');
    console.log('💡 Use o Playwright Inspector para inspecionar a página');
    console.log('💡 Clique em "Resume" para continuar e fazer logout automaticamente');
    
    await page.pause();
    
    // Após o resume, fazer logout automaticamente
    console.log('🚪 Realizando logout após inspeção...');
    
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
        console.log('⚠️ Modal de confirmação não encontrado após aguardar');
      }
    }
    
    // Aguardar o logout ser processado e redirecionamento
    await page.waitForTimeout(3000);
    
    // Verificar se foi redirecionado para a página de login
    const finalUrl = page.url();
    const isLoggedOut = finalUrl.includes('login') || finalUrl.includes('auth') || finalUrl.includes('/auth/login');
    
    if (isLoggedOut) {
      console.log('✅ Logout realizado com sucesso');
    } else {
      console.log('⚠️ Logout processado, mas URL ainda não mudou');
    }
    
    console.log('🎯 Teste de login para inspeção concluído');
  });

  test('deve fazer login, pausar para inspeção e fazer logout ao continuar - Mobile', async ({ page }) => {
    console.log('🎯 Testando login para inspeção manual - Mobile');
    
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    const user = getActualUser();
    
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Sicoop');
    console.log('✅ Página de login carregada');
    
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.currentPassword);
    await page.click('button[type="submit"]');
    console.log('✅ Login iniciado');
    
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    
    const loginSuccess = await page.locator('text=Bem-vindo').isVisible() || 
                        currentUrl.includes('dashboard') ||
                        await page.locator('text=Dashboard').isVisible();
    
    expect(loginSuccess).toBe(true);
    console.log('✅ Login realizado com sucesso');
    console.log('📍 URL atual:', currentUrl);
    
    // Pausar para inspeção manual
    console.log('⏸️ Pausando para inspeção manual...');
    console.log('💡 Use o Playwright Inspector para inspecionar a página');
    console.log('💡 Clique em "Resume" para continuar e fazer logout automaticamente');
    
    await page.pause();
    
    // Após o resume, fazer logout automaticamente
    console.log('🚪 Realizando logout após inspeção...');
    
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
        console.log('⚠️ Modal de confirmação não encontrado após aguardar');
      }
    }
    
    // Aguardar o logout ser processado e redirecionamento
    await page.waitForTimeout(3000);
    
    // Verificar se foi redirecionado para a página de login
    const finalUrl = page.url();
    const isLoggedOut = finalUrl.includes('login') || finalUrl.includes('auth') || finalUrl.includes('/auth/login');
    
    if (isLoggedOut) {
      console.log('✅ Logout realizado com sucesso');
    } else {
      console.log('⚠️ Logout processado, mas URL ainda não mudou');
    }
    
    console.log('🎯 Teste de login para inspeção concluído');
  });
});

