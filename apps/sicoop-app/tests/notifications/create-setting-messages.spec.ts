import { test, expect } from '@playwright/test';
import { getAdminUser, getNotificationCategoryConfig } from '../helpers/test-config';

test.describe('Criação de Configuração de Notificação - Mensagens', () => {
  test('deve criar uma configuração de notificação para mensagens', async ({ page }) => {
    console.log('🎯 Testando criação de configuração de notificação para mensagens');
    
    // Escutar logs do console
    page.on('console', msg => {
      console.log(`🖥️ CONSOLE: ${msg.text()}`);
    });
    
    // Capturar erros da página
    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    const adminUser = getAdminUser();
    const categoryConfig = getNotificationCategoryConfig();
    
    if (!adminUser) {
      throw new Error('❌ Usuário administrador não configurado. Configure TEST_ADMIN_USER no config.test');
    }
    
    if (!categoryConfig) {
      throw new Error('❌ Configuração de categoria não encontrada. Configure NOTIFICATION_CATEGORY_* no config.test');
    }
    
    console.log(`👤 Admin: ${adminUser.email}`);
    console.log(`📋 Categoria: ${categoryConfig.displayName}`);
    
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
    
    // 2 - Navegar para Menu -> Administrativo -> Gerenciamento de Notificações
    console.log('🔍 Passo 2: Navegando para Menu -> Administrativo -> Gerenciamento de Notificações...');
    await page.waitForTimeout(3000);
    
    // Procurar e expandir o menu "Administrativo"
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
      await page.screenshot({ path: 'test-results/menu-not-found-notifications.png', fullPage: true });
      throw new Error('❌ Menu "Administrativo" não encontrado');
    }
    
    // Procurar e clicar no submenu "Gerenciamento de Notificações"
    console.log('🔍 Procurando submenu "Gerenciamento de Notificações"...');
    const notificationMenuLinks = [
      page.locator('text=Gerenciamento de Notificações').first(),
      page.locator('a:has-text("Gerenciamento de Notificações")').first(),
      page.locator('[class*="menu-link"]:has-text("Notificações")').first(),
      page.locator('text=Notificações').first(),
    ];
    
    let notificationLinkFound = false;
    for (const link of notificationMenuLinks) {
      if (await link.isVisible({ timeout: 3000 })) {
        console.log('✅ Link "Gerenciamento de Notificações" encontrado');
        await link.click();
        notificationLinkFound = true;
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    if (!notificationLinkFound) {
      await page.screenshot({ path: 'test-results/notification-menu-not-found.png', fullPage: true });
      throw new Error('❌ Link "Gerenciamento de Notificações" não encontrado');
    }
    
    // Verificar se estamos na página correta
    await page.waitForTimeout(2000);
    const pageTitle = page.locator('h1, h2').filter({ hasText: /Notificação/i }).first();
    if (await pageTitle.isVisible({ timeout: 5000 })) {
      console.log('✅ Página de notificações carregada');
    }
    
    // 3 - Clicar na aba "Configurações"
    console.log('🔍 Passo 3: Clicando na aba "Configurações"...');
    const settingsTab = page.locator('button:has-text("Configurações"), button:has-text("Configuração")').first();
    
    if (!(await settingsTab.isVisible({ timeout: 5000 }))) {
      await page.screenshot({ path: 'test-results/settings-tab-not-found.png', fullPage: true });
      throw new Error('❌ Aba "Configurações" não encontrada');
    }
    
    console.log('✅ Aba "Configurações" encontrada');
    await settingsTab.click();
    await page.waitForTimeout(2000);
    
    // 4 - Clicar no botão "Nova Configuração"
    console.log('🔍 Passo 4: Procurando botão "Nova Configuração"...');
    const newSettingButton = page.locator('button:has-text("Nova Configuração"), button:has-text("Nova")').first();
    
    if (!(await newSettingButton.isVisible({ timeout: 5000 }))) {
      await page.screenshot({ path: 'test-results/new-setting-button-not-found.png', fullPage: true });
      throw new Error('❌ Botão "Nova Configuração" não encontrado');
    }
    
    console.log('✅ Botão "Nova Configuração" encontrado');
    await newSettingButton.click();
    await page.waitForTimeout(2000);
    
    // 5 - Preencher o formulário de configuração
    console.log('📝 Passo 5: Preenchendo formulário de configuração...');
    
    // Selecionar usuário administrador
    console.log('🔍 Selecionando usuário administrador...');
    // O elemento é um combobox, não um select tradicional
    const userSelect = page.locator('combobox:has(option:has-text("Selecione um usuário")), select:has(option:has-text("Selecione um usuário")), label:has-text("Usuário Administrador") + combobox, label:has-text("Usuário Administrador") + select').first();
    
    if (await userSelect.isVisible({ timeout: 3000 })) {
      // Aguardar que as opções sejam carregadas
      await page.waitForTimeout(2000);
      
      // Tentar selecionar o usuário pelo email ou nome
      const userOption = page.locator(`combobox option:has-text("${adminUser.email}"), select option:has-text("${adminUser.email}"), combobox option:has-text("${adminUser.email.split('@')[0]}"), select option:has-text("${adminUser.email.split('@')[0]}")`).first();
      
      if (await userOption.isVisible({ timeout: 3000 })) {
        const optionValue = await userOption.getAttribute('value');
        if (optionValue) {
          await userSelect.selectOption(optionValue);
          console.log(`✅ Usuário selecionado: ${adminUser.email}`);
        } else {
          // Tentar selecionar pelo texto completo
          const optionText = await userOption.textContent();
          if (optionText) {
            await userSelect.selectOption({ label: optionText.trim() });
            console.log(`✅ Usuário selecionado por texto: ${optionText.trim()}`);
          }
        }
      } else {
        // Tentar selecionar a primeira opção disponível (depois de "Selecione um usuário")
        const options = await userSelect.locator('option').all();
        if (options.length > 1) {
          // Pular a primeira opção (placeholder) e selecionar a segunda
          const secondOption = options[1];
          const value = await secondOption.getAttribute('value');
          const text = await secondOption.textContent();
          if (value) {
            await userSelect.selectOption(value);
            console.log(`✅ Usuário selecionado (primeira opção disponível): ${text?.trim()}`);
          } else if (text) {
            await userSelect.selectOption({ label: text.trim() });
            console.log(`✅ Usuário selecionado por texto (primeira opção): ${text.trim()}`);
          }
        } else {
          throw new Error('❌ Nenhum usuário disponível no select');
        }
      }
    } else {
      await page.screenshot({ path: 'test-results/user-select-not-found.png', fullPage: true });
      throw new Error('❌ Select/Combobox de usuário não encontrado');
    }
    
    await page.waitForTimeout(1000);
    
    // Selecionar categoria
    console.log('🔍 Selecionando categoria...');
    // O elemento é um combobox, não um select tradicional
    const categorySelect = page.locator('combobox:has(option:has-text("Selecione uma categoria")), select:has(option:has-text("Selecione uma categoria")), label:has-text("Categoria de Notificação") + combobox, label:has-text("Categoria de Notificação") + select').first();
    
    if (await categorySelect.isVisible({ timeout: 3000 })) {
      // Aguardar que as opções sejam carregadas
      await page.waitForTimeout(2000);
      
      // Tentar selecionar a categoria pelo display name
      const categoryOption = page.locator(`combobox option:has-text("${categoryConfig.displayName}"), select option:has-text("${categoryConfig.displayName}")`).first();
      
      if (await categoryOption.isVisible({ timeout: 3000 })) {
        const optionValue = await categoryOption.getAttribute('value');
        if (optionValue) {
          await categorySelect.selectOption(optionValue);
          console.log(`✅ Categoria selecionada: ${categoryConfig.displayName}`);
        } else {
          // Tentar selecionar pelo texto
          await categorySelect.selectOption({ label: categoryConfig.displayName });
          console.log(`✅ Categoria selecionada por texto: ${categoryConfig.displayName}`);
        }
      } else {
        // Tentar selecionar a primeira opção disponível (depois de "Selecione uma categoria")
        const options = await categorySelect.locator('option').all();
        if (options.length > 1) {
          // Pular a primeira opção (placeholder) e selecionar a segunda
          const secondOption = options[1];
          const value = await secondOption.getAttribute('value');
          const text = await secondOption.textContent();
          if (value) {
            await categorySelect.selectOption(value);
            console.log(`✅ Categoria selecionada (primeira opção disponível): ${text?.trim()}`);
          } else if (text) {
            await categorySelect.selectOption({ label: text.trim() });
            console.log(`✅ Categoria selecionada por texto (primeira opção): ${text.trim()}`);
          }
        } else {
          throw new Error('❌ Nenhuma categoria disponível no select. Certifique-se de que existe pelo menos uma categoria ativa.');
        }
      }
    } else {
      await page.screenshot({ path: 'test-results/category-select-not-found.png', fullPage: true });
      throw new Error('❌ Select/Combobox de categoria não encontrado');
    }
    
    await page.waitForTimeout(1000);
    
    // Verificar se checkbox "Notificação ativa" está marcado (deve estar por padrão)
    const enabledCheckbox = page.locator('input[type="checkbox"][id*="enabled"], input[type="checkbox"]:near(label:has-text("ativa"))').first();
    if (await enabledCheckbox.isVisible({ timeout: 2000 })) {
      const isChecked = await enabledCheckbox.isChecked();
      if (!isChecked) {
        await enabledCheckbox.check();
        console.log('✅ Checkbox "Notificação ativa" marcado');
      } else {
        console.log('✅ Checkbox "Notificação ativa" já estava marcado');
      }
    }
    
    await page.waitForTimeout(1000);
    
    // 6 - Clicar no botão "Criar"
    console.log('💾 Passo 6: Clicando no botão "Criar"...');
    const createButton = page.locator('button:has-text("Criar"), button:has-text("Salvar"), button[type="submit"]').first();
    
    if (!(await createButton.isVisible({ timeout: 3000 }))) {
      await page.screenshot({ path: 'test-results/create-setting-button-not-found.png', fullPage: true });
      throw new Error('❌ Botão "Criar" não encontrado');
    }
    
    await createButton.click();
    console.log('✅ Botão "Criar" clicado');
    
    // 7 - Verificar se a configuração foi criada com sucesso
    console.log('✅ Passo 7: Verificando se configuração foi criada...');
    
    // Aguardar que o modal feche ou a configuração apareça na lista
    // Verificar primeiro se o modal foi fechado (indicando sucesso)
    const modal = page.locator('text=Nova Configuração, text=Editar Configuração').first();
    await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('⚠️ Modal ainda visível, continuando verificação...');
    });
    
    // Aguardar um pouco para a lista atualizar
    await page.waitForTimeout(1000);
    
    // Primeiro verificar se há mensagem de erro
    const errorMessages = [
      page.locator('text=Erro ao criar configuração').first(),
      page.locator('text=Erro ao carregar configurações').first(),
      page.locator('[class*="error"]').first(),
      page.locator('text=Could not find the table').first(),
    ];
    
    let hasError = false;
    for (const errorMsg of errorMessages) {
      if (await errorMsg.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = await errorMsg.textContent();
        console.log(`❌ Erro encontrado: ${errorText}`);
        hasError = true;
        break;
      }
    }
    
    if (hasError) {
      await page.screenshot({ path: 'test-results/setting-creation-error.png', fullPage: true });
      throw new Error('❌ Erro ao criar configuração. Verifique os logs do console para mais detalhes.');
    }
    
    // Verificar se a configuração aparece na lista (verificar pelo display name da categoria ou email do usuário)
    const categoryInList = page.locator(`text=${categoryConfig.displayName}`).first();
    const userEmailPart = adminUser.email.split('@')[0];
    const userNameInList = page.locator(`text=${userEmailPart}`).first();
    
    // Verificar se o contador de configurações aumentou
    const configCount = page.locator('button:has-text("Configurações")').first();
    const countText = await configCount.textContent().catch(() => '');
    const hasCountIncreased = countText && parseInt(countText) > 0;
    
    let hasSuccess = false;
    
    // Verificar se a categoria aparece na lista
    if (await categoryInList.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log(`✅ Configuração encontrada na lista (categoria: ${categoryConfig.displayName})`);
      hasSuccess = true;
    }
    
    // Verificar se o nome do usuário aparece na lista
    if (await userNameInList.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log(`✅ Configuração encontrada na lista (usuário: ${userEmailPart})`);
      hasSuccess = true;
    }
    
    // Verificar se o contador aumentou
    if (hasCountIncreased) {
      console.log(`✅ Contador de configurações aumentou: ${countText}`);
      hasSuccess = true;
    }
    
    // Verificar mensagem de sucesso (se houver)
    const successMessages = [
      page.locator('text=criada com sucesso'),
      page.locator('text=Configuração criada'),
      page.locator('.success-message'),
      page.locator('.alert-success'),
    ];
    
    for (const msg of successMessages) {
      if (await msg.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await msg.textContent();
        console.log(`✅ Mensagem de sucesso: ${text}`);
        hasSuccess = true;
        break;
      }
    }
    
    if (!hasSuccess) {
      await page.screenshot({ path: 'test-results/setting-creation-failed.png', fullPage: true });
      throw new Error('❌ Configuração não foi criada. Verifique os logs do console para mais detalhes.');
    }
    
    expect(hasSuccess).toBe(true);
    console.log('🎯 Teste de criação de configuração concluído com sucesso');
  });
});

