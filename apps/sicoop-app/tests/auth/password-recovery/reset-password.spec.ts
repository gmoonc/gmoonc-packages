import { test, expect } from '@playwright/test';
import { getActualUser, loadTestConfig, reloadTestConfig } from '../../helpers/test-config';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Confirmar Reset de Senha', () => {
  test('deve confirmar reset de senha e rotacionar senhas', async ({ page }) => {
    console.log('🎯 Testando confirmação de reset de senha');
    
    // Escutar logs do console
    page.on('console', msg => {
      console.log(`🖥️ CONSOLE: ${msg.text()}`);
    });
    
    // Capturar erros da página
    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    const config = loadTestConfig();
    const user = getActualUser();
    
    // Verificar se link foi configurado
    if (!config.temporaryLink || config.temporaryLink.trim() === '') {
      throw new Error(
        '❌ Link temporário não configurado.\n' +
        '📝 Preencha TEMPORARY_LINK no arquivo tests/config.test'
      );
    }
    
    console.log('🔗 Acessando link de reset...');
    const resetLink = config.temporaryLink.trim();
    await page.goto(resetLink);
    await page.waitForTimeout(3000);
    
    // Verificar se houve erro (link expirado ou inválido)
    const errorMessages = [
      page.locator('text=Link expirado'),
      page.locator('text=Link inválido'),
      page.locator('text=Link não encontrado'),
      page.locator('text=Expired'),
      page.locator('text=Invalid'),
      page.locator('text=Erro'),
      page.locator('.auth-error')
    ];
    
    let hasError = false;
    for (const errorMsg of errorMessages) {
      if (await errorMsg.first().isVisible()) {
        const errorText = await errorMsg.first().textContent();
        console.log('❌ Erro detectado:', errorText);
        hasError = true;
        break;
      }
    }
    
    if (hasError) {
      console.log('❌ Link de reset é inválido ou expirado');
      
      // Aguardar um pouco para garantir que a página de erro está totalmente carregada
      await page.waitForTimeout(1000);
      
      // Capturar screenshot da página de erro ANTES de interagir
      await page.screenshot({ path: 'test-results/error-page.png', fullPage: true });
      console.log('📸 Screenshot da página de erro capturado');
      
      console.log('🔄 Clicando em "Solicitar novo link de recuperação"...');
      
      // Clicar no link para solicitar novo reset
      const requestNewLink = page.locator('a:has-text("Solicitar novo link de recuperação")');
      if (await requestNewLink.isVisible()) {
        await requestNewLink.click();
        await page.waitForTimeout(2000);
        console.log('✅ Redirecionado para página de recuperação');
        
        // Preencher email e enviar
        await page.fill('input[type="email"]', user.email);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        console.log('✅ Novo link de reset solicitado');
      }
      
      throw new Error(
        '❌ Link de reset era inválido ou expirado.\n' +
        '📧 Novo link de reset foi solicitado automaticamente.\n' +
        '📝 Verifique o email e cole o novo link em tests/config.test'
      );
    }
    
    // Verificar se estamos na página correta
    const currentUrl = page.url();
    const isOnResetPage = currentUrl.includes('reset') || 
                          await page.locator('text=Redefinir Senha').isVisible() ||
                          await page.locator('text=Nova Senha').isVisible();
    
    if (!isOnResetPage) {
      console.log('⚠️ Não está na página de reset. URL atual:', currentUrl);
      throw new Error('Link de reset não redirecionou para a página correta');
    }
    
    console.log('✅ Página de reset carregada corretamente');
    
    // Definir nova senha (há dois campos: password e confirmPassword)
    console.log('🆕 Definindo nova senha...');
    
    // Usar a próxima senha do usuário
    const newPassword = user.nextPassword;
    
    // Preencher o primeiro campo de senha
    const passwordInput = page.locator('input[id="password"]');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(newPassword);
      console.log('✅ Campo de senha preenchido');
    } else {
      // Tentar por type=password como fallback
      await page.fill('input[type="password"]', newPassword);
    }
    
    // Preencher o campo de confirmação de senha
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    if (await confirmPasswordInput.isVisible()) {
      await confirmPasswordInput.fill(newPassword);
      console.log('✅ Campo de confirmação preenchido');
    }
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Nova senha definida');
    
    // Gerar nova senha aleatória para o próximo teste
    console.log('🎲 Gerando nova senha aleatória para o próximo teste...');
    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
    
    const newRandomPassword = generateRandomPassword();
    console.log('🔑 Nova senha gerada:', newRandomPassword);
    
    // Rotação de senha no config.test
    console.log('🔄 Rotacionando senhas no config.test...');
    const configPath = path.join(__dirname, '../../config.test');
    let configContent = fs.readFileSync(configPath, 'utf-8');
    
    const userId = config.actualUser;
    
    // Trocar senha atual pela próxima senha
    configContent = configContent.replace(
      new RegExp(`TEST_USER_${userId}_CURRENT_PASSWORD=.*`),
      `TEST_USER_${userId}_CURRENT_PASSWORD=${newPassword}`
    );
    
    // Preencher com a nova senha aleatória para o próximo teste
    configContent = configContent.replace(
      new RegExp(`TEST_USER_${userId}_NEXT_PASSWORD=.*`),
      `TEST_USER_${userId}_NEXT_PASSWORD=${newRandomPassword}`
    );
    
    // Limpar link temporário
    configContent = configContent.replace(
      /TEMPORARY_LINK=.*/,
      'TEMPORARY_LINK='
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Senhas rotacionadas no config.test');
    
    // Após trocar a senha, o usuário é redirecionado para login
    // Vamos fazer login com a nova senha
    console.log('🔐 Fazendo login com a nova senha...');
    await page.waitForTimeout(3000); // Aguardar redirecionamento
    
    // Verificar se estamos na página de login
    const loginUrl = page.url();
    console.log('📍 URL atual:', loginUrl);
    
    if (loginUrl.includes('login')) {
      // Preencher formulário de login
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', newPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Verificar login bem-sucedido
      const loginSuccess = await page.locator('text=Bem-vindo').isVisible() ||
                          page.url().includes('dashboard') ||
                          await page.locator('text=Dashboard').isVisible();
      
      expect(loginSuccess).toBe(true);
      console.log('✅ Login com nova senha realizado');
    } else {
      // Se já estiver na dashboard, apenas validar
      console.log('✅ Já está na dashboard após troca de senha');
    }
    
    // Fazer logout
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
    
    console.log('✅ Logout realizado com sucesso');
    
    console.log('🎯 Teste de reset de senha concluído');
  });
});
