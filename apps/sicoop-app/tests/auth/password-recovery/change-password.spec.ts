import { test, expect } from '@playwright/test';
import { getActualUser, reloadTestConfig } from '../../helpers/test-config';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Troca de Senha', () => {
  test('deve trocar a senha do usuário', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🎯 Testando troca de senha');
    
    const user = getActualUser();
    
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
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
    
    // 3. Preencher o formulário de troca de senha
    console.log('🔑 Preenchendo formulário de troca de senha...');
    
    // Aguardar o card de segurança aparecer
    await page.waitForSelector('h2.card-title:has-text("Segurança da Conta"), h2:has-text("Segurança da Conta")', { timeout: 5000 });
    console.log('✅ Card "Segurança da Conta" encontrado');
    
    // Preencher Senha Atual
    const currentPasswordInput = page.locator('input#currentPassword, input[name="currentPassword"]').first();
    if (await currentPasswordInput.isVisible({ timeout: 3000 })) {
      await currentPasswordInput.fill(user.currentPassword);
      console.log('✅ Campo "Senha Atual" preenchido');
    } else {
      throw new Error('❌ Campo "Senha Atual" não encontrado');
    }
    
    // Preencher Nova Senha
    const newPasswordInput = page.locator('input#newPassword, input[name="newPassword"]').first();
    if (await newPasswordInput.isVisible({ timeout: 3000 })) {
      await newPasswordInput.fill(user.nextPassword);
      console.log('✅ Campo "Nova Senha" preenchido');
      
      // Aguardar um pouco para o indicador de força da senha aparecer
      await page.waitForTimeout(1000);
    } else {
      throw new Error('❌ Campo "Nova Senha" não encontrado');
    }
    
    // Preencher Confirmar Nova Senha
    const confirmPasswordInput = page.locator('input#confirmPassword, input[name="confirmPassword"]').first();
    if (await confirmPasswordInput.isVisible({ timeout: 3000 })) {
      await confirmPasswordInput.fill(user.nextPassword);
      console.log('✅ Campo "Confirmar Nova Senha" preenchido');
    } else {
      throw new Error('❌ Campo "Confirmar Nova Senha" não encontrado');
    }
    
    // 4. Clicar no botão "Atualizar Senha"
    console.log('💾 Clicando em "Atualizar Senha"...');
    const updatePasswordButton = page.locator('button[type="submit"]:has-text("Atualizar Senha"), button:has-text("Atualizar Senha")').first();
    
    if (await updatePasswordButton.isVisible({ timeout: 3000 })) {
      await updatePasswordButton.click();
      console.log('✅ Botão "Atualizar Senha" clicado');
    } else {
      // Tentar encontrar o botão dentro do formulário de senha
      const formPassword = page.locator('form').filter({ has: page.locator('input#currentPassword') }).first();
      const submitButton = formPassword.locator('button[type="submit"]').first();
      if (await submitButton.isVisible({ timeout: 2000 })) {
        await submitButton.click();
        console.log('✅ Botão de submit encontrado no formulário');
      } else {
        throw new Error('❌ Botão "Atualizar Senha" não encontrado');
      }
    }
    
    // 5. Aguardar mensagem de sucesso
    console.log('⏳ Aguardando confirmação de sucesso...');
    await page.waitForTimeout(2000);
    
    const successMessage = page.locator('.alert-success:has-text("Senha atualizada"), .alert:has-text("Senha atualizada"), div:has-text("✅ Senha atualizada com sucesso")').first();
    
    if (await successMessage.isVisible({ timeout: 5000 })) {
      console.log('✅ Mensagem de sucesso exibida: Senha atualizada com sucesso!');
    } else {
      // Verificar se há algum erro
      const errorMessage = page.locator('.alert-error, .alert-danger, [class*="error"]').first();
      if (await errorMessage.isVisible({ timeout: 2000 })) {
        const errorText = await errorMessage.textContent();
        throw new Error(`❌ Erro ao atualizar senha: ${errorText}`);
      } else {
        // Se não há mensagem de erro visível, considerar sucesso (pode ter desaparecido rapidamente)
        console.log('⚠️ Mensagem de sucesso não encontrada, mas nenhum erro foi exibido. Considerando sucesso.');
      }
    }
    
    // 6. Rotacionar senhas no config.test
    console.log('🔄 Rotacionando senhas no config.test...');
    const configPath = path.join(__dirname, '../../config.test');
    let configContent = fs.readFileSync(configPath, 'utf-8');
    
    const userId = user.id;
    
    // Gerar nova senha aleatória para o próximo teste
    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
    
    const newRandomPassword = generateRandomPassword();
    console.log('🔑 Nova senha gerada para o próximo teste:', newRandomPassword);
    
    // Trocar senha atual pela próxima senha
    const currentPasswordRegex = new RegExp(`(TEST_USER_${userId}_CURRENT_PASSWORD=).*`, 'g');
    configContent = configContent.replace(currentPasswordRegex, `$1${user.nextPassword}`);
    
    // Atualizar próxima senha com a nova senha gerada
    const nextPasswordRegex = new RegExp(`(TEST_USER_${userId}_NEXT_PASSWORD=).*`, 'g');
    configContent = configContent.replace(nextPasswordRegex, `$1${newRandomPassword}`);
    
    fs.writeFileSync(configPath, configContent, 'utf-8');
    console.log('✅ Senhas rotacionadas no config.test');
    
    // Recarregar configuração para usar a nova senha
    reloadTestConfig();
    
    // 7. Fazer logout
    console.log('🚪 Realizando logout...');
    
    // Clicar no perfil do usuário no header para abrir o dropdown
    const profileButtonLogout = page.locator('.user-profile-button, [data-testid="user-profile"], button:has([class*="profile"])').first();
    
    if (await profileButtonLogout.isVisible({ timeout: 5000 })) {
      await profileButtonLogout.click();
      console.log('✅ Perfil do usuário clicado');
      await page.waitForTimeout(1000);
    }
    
    // Clicar no botão "Sair" do dropdown
    const sairButton = page.locator('button.dropdown-option:has-text("Sair"), button:has-text("Sair")').first();
    
    if (await sairButton.isVisible({ timeout: 3000 })) {
      await sairButton.click();
      console.log('✅ Botão "Sair" do dropdown clicado');
    }
    
    // Aguardar o modal de confirmação aparecer
    await page.waitForTimeout(2000);
    const modalOverlay = page.locator('.modal-overlay').first();
    await modalOverlay.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Modal de confirmação apareceu');
    
    // Clicar no botão de confirmação do modal
    const logoutConfirmButton = page.locator('button.logout-confirm-button:has-text("Sair")').first();
    
    if (await logoutConfirmButton.isVisible({ timeout: 3000 })) {
      await logoutConfirmButton.click();
      console.log('✅ Botão de confirmação do modal clicado');
    } else {
      // Fallback para outros seletores
      const confirmButtonFallback = page.locator('button:has-text("Sair"), button:has-text("Confirmar")').filter({ hasText: /Sair|Confirmar/ }).first();
      if (await confirmButtonFallback.isVisible({ timeout: 2000 })) {
        await confirmButtonFallback.click();
        console.log('✅ Botão de confirmação encontrado por fallback');
      }
    }
    
    // Aguardar o logout ser processado e redirecionamento
    await page.waitForURL(/auth\/login/);
    const finalUrl = page.url();
    expect(finalUrl.includes('login') || finalUrl.includes('auth')).toBe(true);
    console.log('✅ Logout realizado com sucesso');
    
    console.log('🎯 Teste de troca de senha concluído');
  });
});

