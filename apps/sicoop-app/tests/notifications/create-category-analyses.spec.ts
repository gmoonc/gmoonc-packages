import { test, expect } from '@playwright/test';
import { getAdminUser, getAnalysisCategoryConfig } from '../helpers/test-config';

test.describe('Criação de Categoria de Notificação - Análises', () => {
  test('deve criar uma categoria de notificação para análises', async ({ page }) => {
    console.log('🎯 Testando criação de categoria de notificação para análises');
    
    // Escutar logs do console
    page.on('console', msg => {
      console.log(`🖥️ CONSOLE: ${msg.text()}`);
    });
    
    // Capturar erros da página
    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    const adminUser = getAdminUser();
    const categoryConfig = getAnalysisCategoryConfig();
    
    if (!adminUser) {
      throw new Error('❌ Usuário administrador não configurado. Configure TEST_ADMIN_USER no config.test');
    }
    
    if (!categoryConfig) {
      throw new Error('❌ Configuração de categoria de análises não encontrada. Configure ANALYSIS_CATEGORY_* no config.test');
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
    
    // 3 - Clicar no botão "Nova Categoria"
    console.log('🔍 Passo 3: Procurando botão "Nova Categoria"...');
    const newCategoryButton = page.locator('button:has-text("Nova Categoria")').first();
    
    if (!(await newCategoryButton.isVisible({ timeout: 5000 }))) {
      await page.screenshot({ path: 'test-results/new-category-button-not-found.png', fullPage: true });
      throw new Error('❌ Botão "Nova Categoria" não encontrado');
    }
    
    console.log('✅ Botão "Nova Categoria" encontrado');
    await newCategoryButton.click();
    await page.waitForTimeout(2000);
    
    // 4 - Preencher o formulário de categoria
    console.log('📝 Passo 4: Preenchendo formulário de categoria de análises...');
    
    // Nome da Categoria (Display Name)
    const nameInput = page.locator('input[placeholder*="Nome"], input[placeholder*="Categoria"], label:has-text("Nome") + input, label:has-text("Nome da Categoria") + input').first();
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill(categoryConfig.displayName);
      console.log(`✅ Nome preenchido: ${categoryConfig.displayName}`);
    } else {
      // Tentar encontrar por label
      const nameLabel = page.locator('label:has-text("Nome")').first();
      if (await nameLabel.isVisible({ timeout: 2000 })) {
        const input = nameLabel.locator('..').locator('input').first();
        if (await input.isVisible({ timeout: 2000 })) {
          await input.fill(categoryConfig.displayName);
          console.log(`✅ Nome preenchido via label: ${categoryConfig.displayName}`);
        }
      }
    }
    
    // Descrição
    const descriptionInput = page.locator('textarea[placeholder*="Descrição"], label:has-text("Descrição") + textarea').first();
    if (await descriptionInput.isVisible({ timeout: 3000 })) {
      await descriptionInput.fill(categoryConfig.description);
      console.log(`✅ Descrição preenchida`);
    }
    
    // Assunto do Email
    const subjectInput = page.locator('input[placeholder*="Assunto"], label:has-text("Assunto") + input').first();
    if (await subjectInput.isVisible({ timeout: 3000 })) {
      await subjectInput.fill(categoryConfig.subject);
      console.log(`✅ Assunto preenchido`);
    }
    
    // Corpo do Email
    const bodyInput = page.locator('textarea[placeholder*="Corpo"], textarea[placeholder*="Email"], label:has-text("Corpo") + textarea').first();
    if (await bodyInput.isVisible({ timeout: 3000 })) {
      await bodyInput.fill(categoryConfig.body);
      console.log(`✅ Corpo do email preenchido`);
    }
    
    // Verificar se checkbox "Categoria ativa" está marcado (deve estar por padrão)
    const activeCheckbox = page.locator('input[type="checkbox"][id*="active"], input[type="checkbox"]:near(label:has-text("ativa"))').first();
    if (await activeCheckbox.isVisible({ timeout: 2000 })) {
      const isChecked = await activeCheckbox.isChecked();
      if (!isChecked) {
        await activeCheckbox.check();
        console.log('✅ Checkbox "Categoria ativa" marcado');
      }
    }
    
    await page.waitForTimeout(1000);
    
    // 5 - Clicar no botão "Criar"
    console.log('💾 Passo 5: Clicando no botão "Criar"...');
    const createButton = page.locator('button:has-text("Criar"), button:has-text("Salvar"), button[type="submit"]').first();
    
    if (!(await createButton.isVisible({ timeout: 3000 }))) {
      await page.screenshot({ path: 'test-results/create-button-not-found.png', fullPage: true });
      throw new Error('❌ Botão "Criar" não encontrado');
    }
    
    await createButton.click();
    console.log('✅ Botão "Criar" clicado');
    await page.waitForTimeout(3000);
    
    // 6 - Verificar se a categoria foi criada com sucesso
    console.log('✅ Passo 6: Verificando se categoria foi criada...');
    await page.waitForTimeout(2000);
    
    // Primeiro verificar se há mensagem de erro
    const errorMessages = [
      page.locator('text=Erro ao criar categoria').first(),
      page.locator('text=Erro ao carregar categorias').first(),
      page.locator('[class*="error"]').first(),
      page.locator('text=Could not find the table').first(),
    ];
    
    let hasError = false;
    for (const errorMsg of errorMessages) {
      if (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
        const errorText = await errorMsg.textContent();
        console.log(`❌ Erro encontrado: ${errorText}`);
        hasError = true;
        break;
      }
    }
    
    if (hasError) {
      await page.screenshot({ path: 'test-results/category-creation-error.png', fullPage: true });
      throw new Error('❌ Erro ao criar categoria. As tabelas de notificação podem não existir no banco de dados. Execute as migrações SQL primeiro.');
    }
    
    // Verificar mensagem de sucesso
    const successMessages = [
      page.locator('text=criada com sucesso'),
      page.locator('text=Categoria criada'),
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
    
    // Verificar se a categoria aparece na lista (pode aparecer pelo display_name ou pelo name gerado)
    const categoryInList = page.locator(`text=${categoryConfig.displayName}`).first();
    if (await categoryInList.isVisible({ timeout: 5000 })) {
      console.log(`✅ Categoria "${categoryConfig.displayName}" encontrada na lista`);
      hasSuccess = true;
    }
    
    if (!hasSuccess) {
      await page.screenshot({ path: 'test-results/category-creation-failed.png', fullPage: true });
      throw new Error('❌ Categoria não foi criada. Verifique os logs do console para mais detalhes.');
    }
    
    expect(hasSuccess).toBe(true);
    console.log('🎯 Teste de criação de categoria de análises concluído com sucesso');
  });
});

