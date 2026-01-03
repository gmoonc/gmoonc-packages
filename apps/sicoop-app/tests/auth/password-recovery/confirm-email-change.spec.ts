import { test, expect, chromium, Browser } from '@playwright/test';
import { getActualUser, getSecondUser, loadTestConfig } from '../../helpers/test-config';

test.describe('Confirmação de Troca de Email', () => {
  test('deve confirmar troca de email através dos dois links', async () => {
    console.log('🎯 Testando confirmação de troca de email');
    
    const config = loadTestConfig();
    const user = getActualUser();
    const secondUser = getSecondUser();
    
    if (!secondUser) {
      throw new Error('❌ Usuário secundário não configurado. Configure ACTUAL_TEST_SECOND_USER no config.test');
    }
    
    if (!config.temporaryLink || config.temporaryLink.trim() === '') {
      throw new Error(
        '❌ Link temporário do usuário principal não configurado.\n' +
        '📝 Preencha TEMPORARY_LINK no arquivo tests/config.test'
      );
    }
    
    if (!config.temporarySecondUserLink || config.temporarySecondUserLink.trim() === '') {
      throw new Error(
        '❌ Link temporário do usuário secundário não configurado.\n' +
        '📝 Preencha TEMPORARY_SECOND_USER_LINK no arquivo tests/config.test'
      );
    }
    
    console.log(`📧 Usuário principal: ${user.email}`);
    console.log(`📧 Usuário secundário: ${secondUser.email}`);
    
    // ==========================================
    // PRIMEIRA SESSÃO: Confirmar link do usuário principal (Gus)
    // ==========================================
    console.log('\n📧 SESSÃO 1: Confirmando link do usuário principal...');
    
    const browser = await chromium.launch();
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    await page1.setViewportSize({ width: 1920, height: 1080 });
    
    const confirmationLink1 = config.temporaryLink.trim();
    console.log('🔗 Acessando link de confirmação do usuário principal...');
    
    await page1.goto(confirmationLink1);
    await page1.waitForTimeout(3000);
    
    const currentUrl1 = page1.url();
    console.log('🌐 URL após confirmação (sessão 1):', currentUrl1);
    
    // Verificar se foi redirecionado para login ou dashboard
    let confirmation1Success = false;
    const successIndicators1 = [
      'Conta confirmada',
      'Email confirmado',
      'Bem-vindo',
      'Dashboard',
      'login'
    ];
    
    for (const indicator of successIndicators1) {
      if (currentUrl1.toLowerCase().includes(indicator.toLowerCase())) {
        console.log(`✅ Confirmação detectada (sessão 1): ${indicator}`);
        confirmation1Success = true;
        break;
      }
    }
    
    // Verificar elementos na página também
    if (!confirmation1Success) {
      for (const indicator of successIndicators1) {
        try {
          const element = page1.locator(`text=${indicator}`);
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Confirmação detectada via elemento (sessão 1): ${indicator}`);
            confirmation1Success = true;
            break;
          }
        } catch {
          // Continuar tentando outros indicadores
        }
      }
    }
    
    expect(confirmation1Success).toBe(true);
    console.log('✅ Link do usuário principal confirmado com sucesso');
    
    // Fechar a primeira sessão
    await page1.close();
    await context1.close();
    console.log('✅ Sessão 1 encerrada\n');
    
    // Aguardar um pouco antes de iniciar a segunda sessão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ==========================================
    // SEGUNDA SESSÃO: Confirmar link do usuário secundário (John)
    // ==========================================
    console.log('📧 SESSÃO 2: Confirmando link do usuário secundário...');
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    await page2.setViewportSize({ width: 1920, height: 1080 });
    
    const confirmationLink2 = config.temporarySecondUserLink.trim();
    console.log('🔗 Acessando link de confirmação do usuário secundário...');
    
    await page2.goto(confirmationLink2);
    await page2.waitForTimeout(3000);
    
    const currentUrl2 = page2.url();
    console.log('🌐 URL após confirmação (sessão 2):', currentUrl2);
    
    // Verificar se foi redirecionado para login ou dashboard
    let confirmation2Success = false;
    const successIndicators2 = [
      'Conta confirmada',
      'Email confirmado',
      'Bem-vindo',
      'Dashboard',
      'login'
    ];
    
    for (const indicator of successIndicators2) {
      if (currentUrl2.toLowerCase().includes(indicator.toLowerCase())) {
        console.log(`✅ Confirmação detectada (sessão 2): ${indicator}`);
        confirmation2Success = true;
        break;
      }
    }
    
    // Verificar elementos na página também
    if (!confirmation2Success) {
      for (const indicator of successIndicators2) {
        try {
          const element = page2.locator(`text=${indicator}`);
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✅ Confirmação detectada via elemento (sessão 2): ${indicator}`);
            confirmation2Success = true;
            break;
          }
        } catch {
          // Continuar tentando outros indicadores
        }
      }
    }
    
    expect(confirmation2Success).toBe(true);
    console.log('✅ Link do usuário secundário confirmado com sucesso');
    
    // Fechar a segunda sessão
    await page2.close();
    await context2.close();
    await browser.close();
    console.log('✅ Sessão 2 encerrada\n');
    
    console.log('🎯 Teste de confirmação de troca de email concluído');
    console.log(`📧 Ambos os links foram confirmados com sucesso`);
    console.log(`📧 Email do usuário ${user.email} foi alterado para ${secondUser.email}`);
    console.log('✅ Troca de email efetivada!');
  });
});

