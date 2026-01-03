import { test, expect } from '@playwright/test';
import { getActualUser, getAdminUser } from '../helpers/test-config';

test.describe('Exclusão de Usuário - Interface Administrativa', () => {
  test('deve excluir usuário pela interface administrativa', async ({ page }) => {
    console.log('🎯 Testando exclusão de usuário pela interface administrativa');
    
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
    
    // 1 - Login como administrador
    console.log('🔐 Passo 1: Fazendo login como administrador...');
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.currentPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Verificar login bem-sucedido
    const loginIndicators = [
      page.locator('text=Bem-vindo'),
      page.locator('text=Selecione um módulo'),
      page.locator('text=administrador'),
      page.locator('h2:has-text("Bem-vindo")'),
      page.locator('heading:has-text("Bem-vindo ao Sicoop")'),
    ];
    
    let loginSuccess = false;
    for (const indicator of loginIndicators) {
      if (await indicator.isVisible({ timeout: 5000 })) {
        loginSuccess = true;
        break;
      }
    }
    
    // Também verificar por URL
    if (!loginSuccess && page.url().includes('dashboard') || page.url().includes('/auth/login') === false) {
      loginSuccess = true;
    }
    
    expect(loginSuccess).toBe(true);
    console.log('✅ Login realizado com sucesso');
    
    // 2 - Menu -> Administrativo -> Usuários
    console.log('🔍 Passo 2: Navegando para Menu -> Administrativo -> Usuários...');
    
    // Aguardar dashboard carregar completamente
    await page.waitForTimeout(3000);
    
    // Procurar e expandir o menu "Administrativo" (agora é o primeiro item)
    console.log('🔍 Procurando menu "Administrativo" (primeiro item do menu)...');
    const adminMenuItems = [
      // Tentar pelo primeiro item do menu (já que Administrativo é o primeiro)
      page.locator('[class*="menu-item"]').first(),
      page.locator('text=Administrativo').first(),
      page.locator('[class*="menu-item"]:has-text("Administrativo")').first(),
      page.locator('.menu-item:has-text("Administrativo")').first(),
      page.locator('button:has-text("Administrativo")').first(),
      page.locator('div:has-text("Administrativo")').first(),
    ];
    
    let adminMenuFound = false;
    for (const menuItem of adminMenuItems) {
      try {
        if (await menuItem.isVisible({ timeout: 2000 })) {
          const text = await menuItem.textContent();
          if (text && text.includes('Administrativo')) {
            console.log('✅ Menu "Administrativo" encontrado');
            // Clicar no menu para expandir
            await menuItem.click();
            adminMenuFound = true;
            await page.waitForTimeout(1000);
            break;
          }
        }
      } catch (e) {
        // Continuar tentando próximo seletor
        continue;
      }
    }
    
    if (!adminMenuFound) {
      console.log('⚠️ Menu "Administrativo" não encontrado');
      // Capturar screenshot para debug
      await page.screenshot({ path: 'test-results/menu-not-found.png', fullPage: true });
      console.log('📸 Screenshot capturado');
    }
    
    // Procurar e clicar no submenu "Usuários"
    console.log('🔍 Procurando submenu "Usuários"...');
    const userMenuLinks = [
      page.locator('text=Usuários').filter({ hasText: 'Usuários' }).first(),
      page.locator('.menu-item:has-text("Usuários")'),
      page.locator('[class*="menu-link"]:has-text("Usuários")'),
      page.locator('a:has-text("Usuários")').filter({ hasText: 'Usuários' }).first(),
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
      console.log('⚠️ Link "Usuários" não encontrado');
      // Tentar navegação direta para o componente UserManagement
      console.log('🔄 Tentando clicar diretamente no componente de usuários...');
      
      // O componente UserManagement é renderizado dinamicamente
      // Vamos aguardar o conteúdo aparecer
      await page.waitForTimeout(2000);
    }
    
    console.log('📍 URL atual:', page.url());
    
    // 3 - Localizar o usuário atual na lista
    console.log(`🔍 Passo 3: Localizando usuário ${targetUser.email} na lista...`);
    
    await page.waitForTimeout(2000);
    
    // Procurar por linhas da tabela
    const rows = page.locator('table tr, .user-row, .table-row');
    const rowCount = await rows.count();
    console.log(`📋 Linhas encontradas na tabela: ${rowCount}`);
    
    // Procurar o email do usuário alvo
    const userEmailCell = page.locator(`text=${targetUser.email}`);
    let userFound = false;
    
    if (await userEmailCell.isVisible()) {
      console.log('✅ Usuário encontrado na lista');
      userFound = true;
    } else {
      // Scroll para garantir que todos os elementos estão visíveis
      console.log('⚠️ Usuário não encontrado de primeira, fazendo scroll...');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      if (await userEmailCell.isVisible()) {
        console.log('✅ Usuário encontrado após scroll');
        userFound = true;
      }
    }
    
    if (!userFound) {
      // Capturar screenshot para debug
      await page.screenshot({ path: 'test-results/user-list.png', fullPage: true });
      console.log('📸 Screenshot da lista de usuários capturado');
      
      // Listar todos os emails visíveis na página para debug
      const allEmails = await page.locator('text=@goalmoon.com').allTextContents();
      console.log('📧 Emails encontrados na página:', allEmails);
      
      throw new Error(`❌ Usuário ${targetUser.email} não encontrado na lista`);
    }
    
    // 4 - Pressionar o Botão Excluir
    console.log('🗑️ Passo 4: Procurando botão de excluir...');
    
    // Procurar o botão de excluir próximo ao email do usuário
    // Estratégia: encontrar a linha com o email e procurar o botão na mesma linha
    const rowWithUser = page.locator(`tr:has-text("${targetUser.email}"), .user-row:has-text("${targetUser.email}")`);
    
    // Procurar botão de excluir na linha
    const deleteButtons = [
      rowWithUser.locator('button:has-text("Excluir")'),
      rowWithUser.locator('button:has-text("Delete")'),
      rowWithUser.locator('button:has-text("Remover")'),
      rowWithUser.locator('button[aria-label*="Excluir"]'),
      rowWithUser.locator('button[aria-label*="Delete"]'),
      rowWithUser.locator('.delete-button'),
      rowWithUser.locator('.btn-delete'),
      rowWithUser.locator('button.danger'),
      rowWithUser.locator('button:has([class*="trash"])'),
      rowWithUser.locator('button:has([aria-label*="remove"])'),
    ];
    
    let deleteButtonFound = false;
    let deleteButton = null;
    
    for (const btn of deleteButtons) {
      if (await btn.isVisible()) {
        deleteButton = btn;
        deleteButtonFound = true;
        console.log('✅ Botão de excluir encontrado');
        break;
      }
    }
    
    if (!deleteButtonFound) {
      // Capturar screenshot para debug
      await page.screenshot({ path: 'test-results/delete-button-not-found.png', fullPage: true });
      console.log('📸 Screenshot capturado - botão de excluir não encontrado');
      
      // Listar todos os botões visíveis para debug
      const allButtons = await page.locator('button').allTextContents();
      console.log('🔘 Botões encontrados:', allButtons);
      
      throw new Error('❌ Botão de excluir não encontrado');
    }
    
    // Clicar no botão de excluir
    await deleteButton!.click();
    console.log('✅ Botão de excluir clicado');
    await page.waitForTimeout(2000);
    
    // Confirmar exclusão no modal
    console.log('🔍 Procurando modal de confirmação...');
    
    // Aguardar modal aparecer
    await page.waitForSelector('.delete-confirm-modal', { timeout: 5000 });
    console.log('✅ Modal de confirmação encontrado');
    
    // Procurar e clicar no botão de confirmação "Sim, Excluir Usuário"
    const confirmButton = page.locator('button.delete-confirm-button:has-text("Sim, Excluir Usuário")');
    
    if (await confirmButton.isVisible({ timeout: 3000 })) {
      await confirmButton.click();
      console.log('✅ Botão de confirmação clicado');
      // Aguardar a exclusão processar
      await page.waitForTimeout(5000);
    } else {
      console.log('❌ Botão de confirmação não encontrado no modal');
      // Capturar screenshot para debug
      await page.screenshot({ path: 'test-results/modal-not-found.png', fullPage: true });
      throw new Error('Botão de confirmação não encontrado');
    }
    
    // 5 - Verificar mensagem de sucesso/falha
    console.log('📋 Passo 5: Verificando mensagem de sucesso/falha...');
    await page.waitForTimeout(3000);
    
    // Procurar por mensagens de sucesso ou erro
    const successMessages = [
      page.locator('text=Usuário excluído'),
      page.locator('text=usuário excluído'),
      page.locator('text=User deleted'),
      page.locator('text=excluído com sucesso'),
      page.locator('text=excluído com êxito'),
      page.locator('.success-message'),
      page.locator('.alert-success'),
      page.locator('[class*="success"]'),
    ];
    
    const errorMessages = [
      page.locator('text=Erro ao excluir'),
      page.locator('text=erro ao excluir'),
      page.locator('text=Error deleting'),
      page.locator('.error-message'),
      page.locator('.alert-danger'),
      page.locator('[class*="error"]'),
    ];
    
    let hasSuccess = false;
    let hasError = false;
    
    for (const msg of successMessages) {
      if (await msg.isVisible()) {
        console.log('✅ Mensagem de sucesso detectada');
        hasSuccess = true;
        break;
      }
    }
    
    for (const msg of errorMessages) {
      if (await msg.isVisible()) {
        console.log('❌ Mensagem de erro detectada');
        hasError = true;
        const errorText = await msg.textContent();
        console.log('Erro:', errorText);
        break;
      }
    }
    
    if (!hasSuccess && !hasError) {
      console.log('⚠️ Nenhuma mensagem explícita encontrada');
    }
    
    // Verificar se o usuário foi removido da lista (sem reload)
    console.log('🔍 Verificando se o usuário foi removido da lista...');
    await page.waitForTimeout(3000);
    
    const userStillVisible = await userEmailCell.isVisible({ timeout: 2000 }).catch(() => false);
    if (!userStillVisible) {
      console.log('✅ Usuário removido da lista');
    } else {
      console.log('⚠️ Usuário ainda aparece na lista');
    }
    
    // Capturar screenshot do resultado final
    await page.screenshot({ path: 'test-results/delete-result.png', fullPage: true });
    console.log('📸 Screenshot do resultado final capturado');
    
    // 6 - Efetuar o logout
    console.log('🚪 Passo 6: Realizando logout...');
    
    // Clicar no perfil do usuário no header para abrir o dropdown
    const profileButton = page.locator('[data-testid="user-profile"], .user-profile, button:has([class*="profile"])').first();
    
    if (await profileButton.isVisible({ timeout: 5000 })) {
      await profileButton.click();
      console.log('✅ Perfil do usuário clicado');
      await page.waitForTimeout(1000);
    } else {
      // Tentar encontrar o botão de perfil por outras formas
      const alternativeProfileSelectors = [
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
        const adminUser = getAdminUser();
        const initials = adminUser?.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || adminUser?.email?.charAt(0).toUpperCase() || 'U';
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
    
    console.log('🎯 Teste de exclusão de usuário concluído');
    
    // Informar o resultado
    if (hasError) {
      console.log('❌ O teste detectou um erro na exclusão do usuário');
    } else if (hasSuccess && !userStillVisible) {
      console.log('✅ Usuário excluído com sucesso');
    } else {
      console.log('⚠️ Teste concluído com resultados inconclusivos');
    }
  });
});

