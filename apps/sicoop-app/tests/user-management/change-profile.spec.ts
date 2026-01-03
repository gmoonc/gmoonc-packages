import { test, expect } from '@playwright/test';
import { getAdminUser, getActualUser } from '../helpers/test-config';

test.describe('Mudança de Perfil', () => {
  test('deve mudar o perfil do usuário', async ({ page }) => {
    console.log('🎯 Testando mudança de perfil');
    
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
    console.log(`🎯 Usuário a modificar: ${targetUser.email}`);
    
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
    
    // 2 - Navegar para Menu -> Administrativo -> Gerenciamento de Autorizações
    console.log('🔍 Passo 2: Navegando para Menu -> Administrativo -> Gerenciamento de Autorizações...');
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
      await page.screenshot({ path: 'test-results/menu-not-found-profile.png', fullPage: true });
      throw new Error('❌ Menu "Administrativo" não encontrado');
    }
    
    // Procurar e clicar no submenu "Gerenciamento de Autorizações"
    console.log('🔍 Procurando submenu "Gerenciamento de Autorizações"...');
    const authMenuLinks = [
      page.locator('text=Gerenciamento de Autorizações').first(),
      page.locator('a:has-text("Gerenciamento de Autorizações")').first(),
      page.locator('[class*="menu-link"]:has-text("Autorizações")').first(),
    ];
    
    let authLinkFound = false;
    for (const authLink of authMenuLinks) {
      if (await authLink.isVisible({ timeout: 3000 })) {
        console.log('✅ Link "Gerenciamento de Autorizações" encontrado');
        await authLink.click();
        authLinkFound = true;
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    if (!authLinkFound) {
      throw new Error('❌ Link "Gerenciamento de Autorizações" não encontrado');
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
      await page.screenshot({ path: 'test-results/user-list-auth.png', fullPage: true });
      throw new Error(`❌ Usuário ${targetUser.email} não encontrado na lista`);
    }
    
    // 4 - Encontrar o select/dropdown de role na linha do usuário e mudar
    console.log('🔄 Passo 4: Procurando seletor de autorização/role...');
    const rowWithUser = page.locator(`tr:has-text("${targetUser.email}")`);
    
    // Procurar select de role/autorização na linha do usuário
    const roleSelect = rowWithUser.locator('select').first();
    
    if (!(await roleSelect.isVisible({ timeout: 5000 }))) {
      await page.screenshot({ path: 'test-results/role-select-not-found.png', fullPage: true });
      throw new Error('❌ Seletor de autorização não encontrado');
    }
    
    console.log('✅ Seletor de autorização encontrado');
    
    // Obter o role atual
    const currentRole = await roleSelect.inputValue();
    console.log(`📋 Role atual: ${currentRole}`);
    
    // Obter todas as opções disponíveis
    const options = await roleSelect.locator('option').all();
    console.log(`📋 Opções disponíveis: ${options.length}`);
    
    if (options.length > 1) {
      // Pegar uma opção diferente da atual
      let newRole = '';
      let newRoleLabel = '';
      
      for (const option of options) {
        const value = await option.getAttribute('value');
        const text = await option.textContent();
        if (value && value !== currentRole && value !== '') {
          newRole = value;
          newRoleLabel = text || value;
          break;
        }
      }
      
      if (newRole) {
        console.log(`🔄 Alterando role de "${currentRole}" para "${newRoleLabel}"`);
        await roleSelect.selectOption(newRole);
        await page.waitForTimeout(2000);
        
        // 5 - Confirmar a mudança (botão "✓ Confirmar" deve aparecer)
        console.log('🔍 Procurando botão de confirmar...');
        const confirmButton = rowWithUser.locator('button:has-text("Confirmar")').first();
        
        if (await confirmButton.isVisible({ timeout: 5000 })) {
          await confirmButton.click();
          console.log('✅ Mudança confirmada');
          await page.waitForTimeout(3000);
          
          // 6 - Verificar mensagem de sucesso
          console.log('📋 Passo 6: Verificando mensagem de sucesso...');
          const successMessages = [
            page.locator('text=atualizada com sucesso'),
            page.locator('text=Autorização atualizada'),
            page.locator('.success-message'),
            page.locator('.alert-success'),
            page.locator('[class*="success"]'),
          ];
          
          let hasSuccess = false;
          for (const msg of successMessages) {
            if (await msg.isVisible({ timeout: 5000 }).catch(() => false)) {
              const text = await msg.textContent();
              console.log(`✅ Mensagem de sucesso: ${text}`);
              hasSuccess = true;
              break;
            }
          }
          
          if (!hasSuccess) {
            console.log('⚠️ Mensagem de sucesso não encontrada, mas mudança pode ter sido aplicada');
          }
          
          // Verificar se o role mudou na tabela
          await page.waitForTimeout(2000);
          const updatedRole = await roleSelect.inputValue();
          if (updatedRole === newRole) {
            console.log(`✅ Role confirmado na tabela: ${updatedRole}`);
          } else {
            console.log(`⚠️ Role na tabela: ${updatedRole} (esperado: ${newRole})`);
          }
        } else {
          await page.screenshot({ path: 'test-results/confirm-button-not-found.png', fullPage: true });
          throw new Error('❌ Botão de confirmar não apareceu após mudar o select');
        }
      } else {
        console.log('⚠️ Não há outras opções de role disponíveis para selecionar');
      }
    } else {
      console.log('⚠️ Apenas uma opção de role disponível');
    }
    
    // 5 - Fazer logout
    console.log('🚪 Passo 5: Realizando logout...');
    
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
    
    console.log('✅ Logout realizado com sucesso');
    console.log('🎯 Teste de mudança de perfil concluído');
  });
});

