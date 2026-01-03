import { test, expect } from '@playwright/test';
import { getAdminUser, getActualUser } from '../helpers/test-config';

test.describe('Exclusão de Usuário', () => {
  test('deve excluir um usuário', async ({ page }) => {
    console.log('🎯 Testando exclusão de usuário');
    
    // Escutar logs do console
    page.on('console', msg => {
      console.log(`🖥️ CONSOLE: ${msg.text()}`);
    });
    
    // Capturar erros da página
    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    const adminUser = getAdminUser();
    const targetUser = getActualUser();
    
    if (!adminUser) {
      throw new Error('❌ Usuário administrador não configurado. Configure TEST_ADMIN_USER no config.test');
    }
    
    console.log(`👤 Admin: ${adminUser.email}`);
    console.log(`🎯 Usuário a excluir: ${targetUser.email}`);
    
    // Garantir viewport desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 1 - Login como administrador
    console.log('🔐 Passo 1: Fazendo login como administrador...');
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.currentPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Verificar login bem-sucedido
    const loginSuccess = await page.locator('text=Bem-vindo').isVisible({ timeout: 5000 }) ||
                        page.url().includes('dashboard') ||
                        !page.url().includes('/auth/login');
    
    expect(loginSuccess).toBe(true);
    console.log('✅ Login realizado com sucesso');
    
    // 2 - Navegar para Menu -> Administrativo -> Usuários
    console.log('🔍 Passo 2: Navegando para Menu -> Administrativo -> Usuários...');
    await page.waitForTimeout(3000);
    
    // Procurar e expandir o menu "Administrativo" (primeiro item)
    console.log('🔍 Procurando menu "Administrativo"...');
    const adminMenuSelectors = [
      'listitem:has-text("Administrativo")',
      'li:has-text("Administrativo")',
      '[class*="menu-item"]:has-text("Administrativo")',
      'text=Administrativo',
    ];
    
    let adminMenuFound = false;
    for (const selector of adminMenuSelectors) {
      try {
        const menuItem = page.locator(selector).first();
        if (await menuItem.isVisible({ timeout: 3000 })) {
          const text = await menuItem.textContent();
          if (text && text.trim().includes('Administrativo')) {
            console.log(`✅ Menu "Administrativo" encontrado com seletor: ${selector}`);
            await menuItem.click();
            adminMenuFound = true;
            await page.waitForTimeout(1500); // Aguardar submenu expandir
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!adminMenuFound) {
      // Tentar encontrar pelo primeiro item da lista como fallback
      const firstMenuItem = page.locator('listitem').first();
      if (await firstMenuItem.isVisible({ timeout: 2000 })) {
        const text = await firstMenuItem.textContent();
        if (text && text.trim().includes('Administrativo')) {
          console.log('✅ Menu "Administrativo" encontrado como primeiro item');
          await firstMenuItem.click();
          adminMenuFound = true;
          await page.waitForTimeout(1500);
        }
      }
    }
    
    if (!adminMenuFound) {
      await page.screenshot({ path: 'test-results/menu-not-found.png', fullPage: true });
      throw new Error('❌ Menu "Administrativo" não encontrado');
    }
    
    // Procurar e clicar no submenu "Usuários"
    console.log('🔍 Procurando submenu "Usuários"...');
    const userMenuLinks = [
      page.locator('text=Usuários').filter({ hasText: 'Usuários' }).first(),
      page.locator('a:has-text("Usuários")').first(),
      page.locator('[class*="menu-link"]:has-text("Usuários")').first(),
    ];
    
    let userLinkFound = false;
    for (const userLink of userMenuLinks) {
      if (await userLink.isVisible({ timeout: 3000 })) {
        console.log('✅ Link "Usuários" encontrado');
        await userLink.click();
        userLinkFound = true;
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    if (!userLinkFound) {
      throw new Error('❌ Link "Usuários" não encontrado');
    }
    
    // 3 - Localizar o usuário na lista
    console.log(`🔍 Passo 3: Localizando usuário ${targetUser.email} na lista...`);
    await page.waitForTimeout(2000);
    
    const userEmailCell = page.locator(`text=${targetUser.email}`);
    let userFound = false;
    
    if (await userEmailCell.isVisible({ timeout: 5000 })) {
      console.log('✅ Usuário encontrado na lista');
      userFound = true;
    } else {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      if (await userEmailCell.isVisible({ timeout: 3000 })) {
        console.log('✅ Usuário encontrado após scroll');
        userFound = true;
      }
    }
    
    if (!userFound) {
      await page.screenshot({ path: 'test-results/user-list.png', fullPage: true });
      throw new Error(`❌ Usuário ${targetUser.email} não encontrado na lista`);
    }
    
    // 4 - Clicar no botão de excluir
    console.log('🗑️ Passo 4: Procurando botão de excluir...');
    const rowWithUser = page.locator(`tr:has-text("${targetUser.email}"), .user-row:has-text("${targetUser.email}")`);
    
    const deleteButtons = [
      rowWithUser.locator('button:has-text("Excluir")'),
      rowWithUser.locator('button[aria-label*="Excluir"]'),
      rowWithUser.locator('.delete-button'),
      rowWithUser.locator('button.danger'),
    ];
    
    let deleteButtonFound = false;
    let deleteButton = null;
    
    for (const btn of deleteButtons) {
      if (await btn.isVisible({ timeout: 2000 })) {
        deleteButton = btn;
        deleteButtonFound = true;
        console.log('✅ Botão de excluir encontrado');
        break;
      }
    }
    
    if (!deleteButtonFound) {
      await page.screenshot({ path: 'test-results/delete-button-not-found.png', fullPage: true });
      throw new Error('❌ Botão de excluir não encontrado');
    }
    
    await deleteButton!.click();
    console.log('✅ Botão de excluir clicado');
    await page.waitForTimeout(2000);
    
    // 5 - Confirmar exclusão no modal
    console.log('🔍 Procurando modal de confirmação...');
    const confirmButton = page.locator('button:has-text("Sim, Excluir"), button:has-text("Confirmar"), button.delete-confirm-button');
    
    if (await confirmButton.isVisible({ timeout: 5000 })) {
      await confirmButton.click();
      console.log('✅ Confirmação de exclusão clicada');
      await page.waitForTimeout(5000);
    } else {
      await page.screenshot({ path: 'test-results/modal-not-found.png', fullPage: true });
      throw new Error('❌ Modal de confirmação não encontrado');
    }
    
    // 6 - Verificar que usuário foi excluído
    console.log('📋 Passo 6: Verificando que usuário foi excluído...');
    await page.waitForTimeout(3000);
    
    // Verificar mensagem de sucesso
    const successMessage = page.locator('text=excluído, text=excluido, text=deletado, .success-message, .alert-success');
    const hasSuccess = await successMessage.first().isVisible({ timeout: 5000 });
    
    // Verificar que usuário não está mais na lista
    const userStillVisible = await userEmailCell.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasSuccess || !userStillVisible).toBe(true);
    console.log('✅ Usuário excluído com sucesso');
    
    // 7 - Fazer logout
    console.log('🚪 Passo 7: Realizando logout...');
    
    // Clicar no perfil do usuário no header para abrir o dropdown
    const profileButton = page.locator('[data-testid="user-profile"], .user-profile, button:has([class*="profile"])').first();
    
    if (await profileButton.isVisible({ timeout: 5000 })) {
      await profileButton.click();
      console.log('✅ Perfil do usuário clicado');
      await page.waitForTimeout(1000);
    } else {
      // Tentar encontrar o botão de perfil por outras formas
      const alternativeProfileSelectors = [
        'button:has-text("' + adminUser.name?.split(' ')[0] + '")',
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
        const initials = adminUser.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || adminUser.email?.charAt(0).toUpperCase() || 'U';
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
    
    // Clicar no botão de confirmação do modal de logout
    const logoutConfirmButton = page.locator('button.logout-confirm-button:has-text("Sair")').first();
    
    if (await logoutConfirmButton.isVisible({ timeout: 3000 })) {
      await logoutConfirmButton.click();
      console.log('✅ Botão de confirmação do modal de logout clicado');
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
    try {
      await page.waitForURL(/.*\/auth\/login.*|.*\/login.*/, { timeout: 10000 });
      console.log('✅ Logout realizado com sucesso - redirecionado para login');
    } catch (e) {
      // Verificar se já está na página de login mesmo sem waitForURL ter funcionado
      const finalUrl = page.url();
      const isLoggedOut = finalUrl.includes('login') || finalUrl.includes('auth') || finalUrl.includes('/auth/login');
      if (isLoggedOut) {
        console.log('✅ Logout realizado com sucesso - já na página de login');
      } else {
        throw new Error('Logout não redirecionou para a página de login');
      }
    }
    console.log('🎯 Teste de exclusão concluído');
  });
});

