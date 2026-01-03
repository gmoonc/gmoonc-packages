import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Criar cliente admin com service role key para bypass RLS
// Criado no nível do módulo (igual ao send-notification) para garantir consistência
// Usar auth: { persistSession: false } para garantir que não há sessão de usuário interferindo
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Tipo para o retorno da função RPC get_pending_notification_logs
interface PendingNotificationLog {
  id: string;
  category_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
  sent_at: string | null;
  category_name: string;
  category_display_name: string;
  category_email_template_subject: string;
  category_email_template_body: string;
  user_name: string;
  user_email: string;
}


export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente Supabase ausentes.');
    return NextResponse.json({
      success: false,
      error: 'Variáveis de ambiente Supabase ausentes.',
      details: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        serviceKeyLength: supabaseServiceKey?.length || 0
      }
    }, { status: 500 });
  }

  try {
    console.log('🔄 Processando notificações pendentes...');
    console.log('🔑 Verificando variáveis de ambiente:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length || 0,
      serviceKeyPrefix: supabaseServiceKey?.substring(0, 20) || 'não configurado'
    });
    
    // Testar acesso usando função RPC (que bypassa RLS com SECURITY DEFINER)
    const testQuery = await supabase
      .rpc('get_pending_notification_logs', { p_limit: 1 });
    
    if (testQuery.error) {
      console.error('❌ Erro ao testar acesso via RPC:', testQuery.error);
      // Se a função não existir, tentar acesso direto como fallback
      const directTest = await supabase
        .from('notification_logs')
        .select('id')
        .limit(1);
      
      if (directTest.error) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao acessar notification_logs',
          details: directTest.error.message,
          hint: 'Verifique se SUPABASE_SERVICE_ROLE_KEY está configurada corretamente e se a função get_pending_notification_logs existe'
        }, { status: 500 });
      }
    }
    
    console.log('✅ Acesso verificado com sucesso');

    // PRIMEIRO: Criar logs para mensagens/análises que ainda não têm logs
    console.log('📝 Passo 1: Criando logs para entidades sem notificação...');
    
    // Buscar mensagens recentes (últimos 7 dias para garantir que encontre)
    const { data: mensagensRecentes, error: mensagensError } = await supabase
      .from('mensagens')
      .select('id, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    console.log(`📊 Mensagens encontradas: ${mensagensRecentes?.length || 0}`, mensagensError);

    if (mensagensError) {
      console.error('Erro ao buscar mensagens:', mensagensError);
    } else if (mensagensRecentes && mensagensRecentes.length > 0) {
      // Buscar logs existentes para essas mensagens
      // IMPORTANTE: Verificar se já existe um log com email_sent=true para evitar duplicatas
      const mensagemIds = mensagensRecentes.map(m => m.id);
      const { data: logsExistentes, error: logsError } = await supabase
        .from('notification_logs')
        .select('entity_id, email_sent')
        .eq('entity_type', 'mensagem')
        .in('entity_id', mensagemIds);

      console.log(`📊 Logs existentes encontrados: ${logsExistentes?.length || 0}`, logsError);

      // Criar um Set com IDs de mensagens que já têm algum log (para evitar criar logs duplicados na primeira verificação)
      // Mas não vamos filtrar aqui - vamos deixar a verificação por usuário fazer o trabalho pesado
      const idsComLog = new Set((logsExistentes || []).map((l: { entity_id: string }) => l.entity_id));
      
      // Filtrar apenas mensagens que não têm NENHUM log ainda
      // Mensagens que têm logs mas podem ter novos destinatários serão tratadas na verificação por usuário
      const mensagensSemLog = mensagensRecentes.filter(m => !idsComLog.has(m.id));

      console.log(`📊 Mensagens sem log: ${mensagensSemLog.length}`);

      if (mensagensSemLog.length > 0) {
        console.log(`📋 Encontradas ${mensagensSemLog.length} mensagens sem log de notificação`);
        
        // Buscar categoria "novas_mensagens" usando função RPC (bypass RLS)
        // Primeiro tentar buscar exatamente "novas_mensagens"
        const categoriaMensagensResult = await supabase
          .rpc('get_notification_category', { p_category_name: 'novas_mensagens' });
        let categoriasMensagens = categoriaMensagensResult.data;
        const categoriaError = categoriaMensagensResult.error;

        // Se não encontrar, buscar qualquer categoria ativa que contenha "mensagem" no display_name ou name
        if (categoriaError || !categoriasMensagens || categoriasMensagens.length === 0) {
          console.log('⚠️ Categoria "novas_mensagens" não encontrada, buscando categorias com "mensagem"...');
          const { data: categoriasPorBusca } = await supabase
            .rpc('get_notification_category', { p_search_term: 'mensagem' });
          
          console.log('📋 Categorias encontradas por busca:', categoriasPorBusca);
          
          categoriasMensagens = categoriasPorBusca || [];
          
          if (categoriasMensagens.length > 0) {
            console.log(`✅ Categoria encontrada por busca parcial: ${categoriasMensagens[0].name} (${categoriasMensagens[0].display_name})`);
          }
        }

        console.log('📊 Categoria encontrada:', categoriasMensagens, categoriaError);

        const categoriaMensagens = categoriasMensagens && categoriasMensagens.length > 0 ? categoriasMensagens[0] : null;

        if (categoriaMensagens) {
          // Usar RPC diretamente para garantir acesso mesmo com RLS
          const categoryName = categoriaMensagens.name;
          console.log(`🔍 Buscando destinatários via função RPC get_notification_recipients para categoria: ${categoryName}...`);
          const { data: recipientsData, error: recipientsError } = await supabase
            .rpc('get_notification_recipients', { p_category_name: categoryName });
          
          console.log(`📊 Recipientes encontrados via RPC:`, recipientsData, recipientsError);

          interface Setting {
            user_id: string;
          }

          const settings: Setting[] = recipientsData && recipientsData.length > 0 
            ? recipientsData.map((r: { user_id: string }) => ({ user_id: r.user_id }))
            : [];

          console.log(`📊 Configurações finais: ${settings.length} destinatários`);

          if (settings && settings.length > 0) {
            let logsCriados = 0;
            let logsErros = 0;
            let logsIgnorados = 0;
            
            // Verificar logs existentes por mensagem E usuário para evitar duplicatas
            // Buscar logs para TODAS as mensagens recentes (não apenas as sem log) para garantir que processamos também mensagens com logs parciais
            const mensagemIds = mensagensRecentes.map(m => m.id);
            const userIds = settings.map((s: Setting) => s.user_id);
            const { data: logsExistentesPorUsuario } = await supabase
              .from('notification_logs')
              .select('entity_id, user_id, email_sent')
              .eq('entity_type', 'mensagem')
              .in('entity_id', mensagemIds)
              .in('user_id', userIds);
            
            // Criar um Set de chaves "entity_id:user_id" para logs já existentes com sucesso
            const logsJaEnviados = new Set<string>();
            if (logsExistentesPorUsuario) {
              logsExistentesPorUsuario.forEach((log: { entity_id: string; user_id: string; email_sent: boolean }) => {
                if (log.email_sent === true) {
                  logsJaEnviados.add(`${log.entity_id}:${log.user_id}`);
                }
              });
            }
            
            // Criar logs para cada mensagem (incluindo as que já têm logs parciais) e cada usuário, mas apenas se não foi enviado antes
            // Usar mensagensRecentes em vez de mensagensSemLog para processar também mensagens com logs parciais
            for (const mensagem of mensagensRecentes) {
              for (const setting of settings) {
                const logKey = `${mensagem.id}:${setting.user_id}`;
                
                // Pular se já existe um log com email_sent=true para esta combinação
                if (logsJaEnviados.has(logKey)) {
                  logsIgnorados++;
                  console.log(`⏭️ Pulando log para mensagem ${mensagem.id}, usuário ${setting.user_id} - já foi notificado`);
                  continue;
                }
                
                try {
                  const { data, error } = await supabase.rpc('log_notification', {
                    p_category_name: categoriaMensagens.name,
                    p_user_id: setting.user_id,
                    p_entity_type: 'mensagem',
                    p_entity_id: mensagem.id,
                    p_email_sent: false,
                    p_email_error: null
                  });
                  
                  if (error) {
                    logsErros++;
                    console.error(`❌ Erro ao criar log para mensagem ${mensagem.id}, usuário ${setting.user_id}:`, error);
                  } else {
                    logsCriados++;
                    console.log(`✅ Log criado (ID: ${data}) para mensagem ${mensagem.id}, usuário ${setting.user_id}`);
                  }
                } catch (error) {
                  logsErros++;
                  console.error(`❌ Exceção ao criar log para mensagem ${mensagem.id}:`, error);
                }
              }
            }
            
            if (logsIgnorados > 0) {
              console.log(`⏭️ ${logsIgnorados} logs ignorados (já notificados anteriormente)`);
            }
            console.log(`✅ Resumo: ${logsCriados} logs criados, ${logsErros} erros para ${mensagensSemLog.length} mensagens`);
            
            // Aguardar um pouco para garantir que os logs foram persistidos
            if (logsCriados > 0) {
              console.log('⏳ Aguardando 1 segundo para garantir persistência dos logs...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            console.log(`⚠️ Nenhuma configuração ativa encontrada para a categoria ${categoriaMensagens?.name || 'mensagens'}`);
          }
        } else {
          console.log('⚠️ Categoria de mensagens não encontrada ou inativa');
        }
      } else {
        console.log('ℹ️ Todas as mensagens já têm logs de notificação');
      }
    } else {
      console.log('ℹ️ Nenhuma mensagem recente encontrada');
    }

    // Buscar análises recentes (últimos 7 dias)
    const { data: analisesRecentes, error: analisesError } = await supabase
      .from('analises_cobertura')
      .select('id, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (analisesError) {
      console.error('Erro ao buscar análises:', analisesError);
    } else if (analisesRecentes && analisesRecentes.length > 0) {
      // Buscar logs existentes para essas análises
      // IMPORTANTE: Verificar se já existe um log com email_sent=true para evitar duplicatas
      const analiseIds = analisesRecentes.map(a => a.id);
      const { data: logsExistentes } = await supabase
        .from('notification_logs')
        .select('entity_id, email_sent')
        .eq('entity_type', 'analise')
        .in('entity_id', analiseIds);

      // Criar um Set com IDs de análises que já têm algum log (para evitar criar logs duplicados na primeira verificação)
      // Mas não vamos filtrar aqui - vamos deixar a verificação por usuário fazer o trabalho pesado
      const idsComLog = new Set((logsExistentes || []).map((l: { entity_id: string }) => l.entity_id));
      
      // Filtrar apenas análises que não têm NENHUM log ainda
      // Análises que têm logs mas podem ter novos destinatários serão tratadas na verificação por usuário
      const analisesSemLog = analisesRecentes.filter(a => !idsComLog.has(a.id));

      if (analisesSemLog.length > 0) {
        console.log(`📋 Encontradas ${analisesSemLog.length} análises sem log de notificação`);
        
        // Buscar categoria de análises usando função RPC (bypass RLS)
        // Primeiro tentar buscar exatamente "novas_analises"
        const categoriaAnalisesResult = await supabase
          .rpc('get_notification_category', { p_category_name: 'novas_analises' });
        let categoriasAnalises = categoriaAnalisesResult.data;
        const categoriaAnalisesError = categoriaAnalisesResult.error;

        // Se não encontrar, buscar qualquer categoria ativa que contenha "análise" no display_name ou name
        if (categoriaAnalisesError || !categoriasAnalises || categoriasAnalises.length === 0) {
          console.log('⚠️ Categoria "novas_analises" não encontrada, buscando categorias com "análise" ou "analise"...');
          const { data: categoriasPorBusca } = await supabase
            .rpc('get_notification_category', { p_search_term: 'analise' });
          
          console.log('📋 Categorias encontradas por busca:', categoriasPorBusca);
          
          // Se não encontrou com "analise", tentar com "análise"
          if (!categoriasPorBusca || categoriasPorBusca.length === 0) {
            const { data: categoriasPorBuscaAcento } = await supabase
              .rpc('get_notification_category', { p_search_term: 'análise' });
            categoriasAnalises = categoriasPorBuscaAcento || [];
          } else {
            categoriasAnalises = categoriasPorBusca;
          }
          
          if (categoriasAnalises.length > 0) {
            console.log(`✅ Categoria de análises encontrada por busca parcial: ${categoriasAnalises[0].name} (${categoriasAnalises[0].display_name})`);
          }
        }

        console.log('📊 Categoria análises encontrada:', categoriasAnalises, categoriaAnalisesError);

        const categoriaAnalises = categoriasAnalises && categoriasAnalises.length > 0 ? categoriasAnalises[0] : null;

        if (categoriaAnalises) {
          // Usar RPC diretamente para garantir acesso mesmo com RLS
          const categoryName = categoriaAnalises.name;
          console.log(`🔍 Buscando destinatários para análises via função RPC para categoria: ${categoryName}...`);
          const { data: recipientsData, error: recipientsError } = await supabase
            .rpc('get_notification_recipients', { p_category_name: categoryName });
          
          console.log(`📊 Recipientes encontrados via RPC:`, recipientsData, recipientsError);

          interface Setting {
            user_id: string;
          }

          const settings: Setting[] = recipientsData && recipientsData.length > 0 
            ? recipientsData.map((r: { user_id: string }) => ({ user_id: r.user_id }))
            : [];

          console.log(`📊 Configurações finais para análises: ${settings.length} destinatários`);

          if (settings && settings.length > 0) {
            let logsCriados = 0;
            let logsErros = 0;
            let logsIgnorados = 0;
            
            // Verificar logs existentes por análise E usuário para evitar duplicatas
            // Buscar logs para TODAS as análises recentes (não apenas as sem log) para garantir que processamos também análises com logs parciais
            const analiseIds = analisesRecentes.map(a => a.id);
            const userIds = settings.map((s: Setting) => s.user_id);
            const { data: logsExistentesPorUsuario } = await supabase
              .from('notification_logs')
              .select('entity_id, user_id, email_sent')
              .eq('entity_type', 'analise')
              .in('entity_id', analiseIds)
              .in('user_id', userIds);
            
            // Criar um Set de chaves "entity_id:user_id" para logs já existentes com sucesso
            const logsJaEnviados = new Set<string>();
            if (logsExistentesPorUsuario) {
              logsExistentesPorUsuario.forEach((log: { entity_id: string; user_id: string; email_sent: boolean }) => {
                if (log.email_sent === true) {
                  logsJaEnviados.add(`${log.entity_id}:${log.user_id}`);
                }
              });
            }
            
            // Criar logs para cada análise (incluindo as que já têm logs parciais) e cada usuário, mas apenas se não foi enviado antes
            // Usar analisesRecentes em vez de analisesSemLog para processar também análises com logs parciais
            for (const analise of analisesRecentes) {
              for (const setting of settings) {
                const logKey = `${analise.id}:${setting.user_id}`;
                
                // Pular se já existe um log com email_sent=true para esta combinação
                if (logsJaEnviados.has(logKey)) {
                  logsIgnorados++;
                  console.log(`⏭️ Pulando log para análise ${analise.id}, usuário ${setting.user_id} - já foi notificado`);
                  continue;
                }
                
                try {
                  const { data, error } = await supabase.rpc('log_notification', {
                    p_category_name: categoriaAnalises.name,
                    p_user_id: setting.user_id,
                    p_entity_type: 'analise',
                    p_entity_id: analise.id,
                    p_email_sent: false,
                    p_email_error: null
                  });
                  
                  if (error) {
                    logsErros++;
                    console.error(`❌ Erro ao criar log para análise ${analise.id}, usuário ${setting.user_id}:`, error);
                  } else {
                    logsCriados++;
                    console.log(`✅ Log criado (ID: ${data}) para análise ${analise.id}, usuário ${setting.user_id}`);
                  }
                } catch (error) {
                  logsErros++;
                  console.error(`❌ Exceção ao criar log para análise ${analise.id}:`, error);
                }
              }
            }
            
            if (logsIgnorados > 0) {
              console.log(`⏭️ ${logsIgnorados} logs ignorados (já notificados anteriormente)`);
            }
            console.log(`✅ Resumo: ${logsCriados} logs criados, ${logsErros} erros, ${logsIgnorados} ignorados para ${analisesSemLog.length} análises`);
          }
        }
      }
    }

    // SEGUNDO: Buscar notificações pendentes para processar usando função RPC
    console.log('🔍 Passo 2: Buscando notificações pendentes via RPC...');
    
    // Usar função RPC com SECURITY DEFINER para bypass RLS
    const { data: pendingLogs, error: logsError } = await supabase
      .rpc('get_pending_notification_logs', { p_limit: 10 });

    console.log('📊 Query result (via RPC):', { 
      count: pendingLogs?.length || 0, 
      logs: pendingLogs,
      error: logsError 
    });

    if (logsError) {
      console.error('Erro ao buscar logs pendentes:', logsError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar notificações pendentes',
        details: logsError.message
      }, { status: 500 });
    }

    if (!pendingLogs || pendingLogs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma notificação pendente encontrada',
        processedCount: 0
      });
    }

    console.log(`📋 Encontradas ${pendingLogs.length} notificações pendentes`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Type assertion para garantir que os logs têm o formato correto da função RPC
    const typedLogs = pendingLogs as unknown as PendingNotificationLog[];
    
    for (const log of typedLogs) {
      try {
        // Marcar como processando usando função RPC (bypass RLS)
        // Não usar email_error para "Processando..." - isso é confuso
        // O status de processamento será indicado pelo email_sent=false e email_error=null
        // Não precisamos atualizar nada aqui, apenas processar

        // Buscar dados da entidade
        let entityData;
        if (log.entity_type === 'mensagem') {
          const { data: mensagem } = await supabase
            .from('mensagens')
            .select('*')
            .eq('id', log.entity_id)
            .single();
          entityData = mensagem;
        } else if (log.entity_type === 'analise') {
          const { data: analise } = await supabase
            .from('analises_cobertura')
            .select('*')
            .eq('id', log.entity_id)
            .single();
          entityData = analise;
        }

        if (!entityData) {
          const errorMsg = 'Dados da entidade não encontrados';
          console.error(`❌ Log ${log.id}: ${errorMsg} (${log.entity_type}:${log.entity_id})`);
          await supabase.rpc('update_notification_log', {
            p_log_id: log.id,
            p_email_sent: false,
            p_email_error: errorMsg
          });
          errorCount++;
          results.push({
            logId: log.id,
            category: log.category_name || 'unknown',
            recipient: log.user_email || 'unknown',
            success: false,
            error: errorMsg
          });
          continue;
        }

        console.log(`📧 Processando log ${log.id}: categoria=${log.category_name}, destinatário=${log.user_email}, entidade=${log.entity_type}:${log.entity_id}`);

        // Chamar a API de envio de email
        // Detectar URL base automaticamente: primeiro tentar headers da requisição, depois variáveis de ambiente
        let baseUrl = 'http://localhost:3000';
        
        try {
          // Tentar obter URL base da requisição atual
          const url = new URL(request.url);
          
          // Em produção (Vercel), usar headers para detectar a URL correta
          const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
          const protocol = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
          
          baseUrl = `${protocol}://${host}`;
          console.log(`🌐 URL base detectada: ${baseUrl} (host: ${host}, protocol: ${protocol})`);
        } catch (e) {
          console.warn(`⚠️ Erro ao detectar URL da requisição:`, e);
          // Se falhar, usar variáveis de ambiente
          baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
            || process.env.NEXT_PUBLIC_APP_URL 
            || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
            || 'http://localhost:3000';
          console.log(`🌐 URL base usando variáveis de ambiente: ${baseUrl}`);
        }
        
        const sendNotificationUrl = `${baseUrl}/api/send-notification`;
        const requestBody = {
          category: log.category_name || 'unknown',
          entityType: log.entity_type,
          entityId: log.entity_id,
          entityData: entityData
        };
        
        console.log(`📤 Chamando ${sendNotificationUrl} com categoria: ${requestBody.category}`);
        console.log(`🔍 URL base detectada: ${baseUrl} (NEXT_PUBLIC_SITE_URL=${process.env.NEXT_PUBLIC_SITE_URL}, NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL}, VERCEL_URL=${process.env.VERCEL_URL})`);
        
        let emailResponse;
        let emailResult;
        
        try {
          // Adicionar timeout de 30 segundos para evitar travamento
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
          
          emailResponse = await fetch(sendNotificationUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          emailResult = await emailResponse.json();
          console.log(`📥 Resposta da API send-notification para log ${log.id}:`, {
            ok: emailResponse.ok,
            status: emailResponse.status,
            success: emailResult.success,
            error: emailResult.error,
            message: emailResult.message,
            recipientsCount: emailResult.recipientsCount,
            details: emailResult.details
          });
        } catch (fetchError) {
          const errorMsg = fetchError instanceof Error 
            ? (fetchError.name === 'AbortError' 
                ? 'Timeout ao chamar API send-notification (30s)' 
                : fetchError.message)
            : 'Erro ao chamar API send-notification';
          console.error(`❌ Erro ao chamar send-notification para log ${log.id}:`, {
            error: errorMsg,
            errorName: fetchError instanceof Error ? fetchError.name : 'Unknown',
            logId: log.id,
            category: log.category_name
          });
          await supabase.rpc('update_notification_log', {
            p_log_id: log.id,
            p_email_sent: false,
            p_email_error: errorMsg
          });
          errorCount++;
          results.push({
            logId: log.id,
            category: log.category_name || 'unknown',
            recipient: log.user_email || 'unknown',
            success: false,
            error: errorMsg
          });
          continue;
        }

        // Verificar se realmente houve envio de emails
        // Se recipientsCount for 0, significa que não há destinatários configurados
        const hasRecipients = emailResult.recipientsCount !== undefined && emailResult.recipientsCount > 0;
        const hasResults = emailResult.results && Array.isArray(emailResult.results) && emailResult.results.length > 0;
        const actuallySent = hasRecipients || hasResults;
        
        console.log(`🔍 Verificando resultado para log ${log.id}:`, {
          ok: emailResponse.ok,
          success: emailResult.success,
          recipientsCount: emailResult.recipientsCount,
          resultsLength: emailResult.results?.length || 0,
          hasRecipients,
          hasResults,
          actuallySent
        });
        
        if (emailResponse.ok && emailResult.success && actuallySent) {
          // Email realmente enviado
          console.log(`✅ Log ${log.id}: Email enviado com sucesso`);
          const updateResult = await supabase.rpc('update_notification_log', {
            p_log_id: log.id,
            p_email_sent: true,
            p_sent_at: new Date().toISOString(),
            p_email_error: null
          });
          
          if (updateResult.error) {
            console.error(`❌ Erro ao atualizar log ${log.id}:`, updateResult.error);
          }
          
          successCount++;
          results.push({
            logId: log.id,
            category: log.category_name || 'unknown',
            recipient: log.user_email || 'unknown',
            success: true
          });
        } else if (emailResponse.ok && emailResult.success && !actuallySent) {
          // Sucesso mas sem destinatários - marcar como erro
          const noRecipientsMsg = emailResult.message || 'Nenhum destinatário encontrado para esta categoria';
          console.log(`⚠️ Log ${log.id}: ${noRecipientsMsg}`);
          const updateResult = await supabase.rpc('update_notification_log', {
            p_log_id: log.id,
            p_email_sent: false,
            p_email_error: noRecipientsMsg
          });
          
          if (updateResult.error) {
            console.error(`❌ Erro ao atualizar log ${log.id} com erro:`, updateResult.error);
          } else {
            console.log(`✅ Log ${log.id} atualizado com erro: ${noRecipientsMsg}`);
          }
          
          errorCount++;
          results.push({
            logId: log.id,
            category: log.category_name || 'unknown',
            recipient: log.user_email || 'unknown',
            success: false,
            error: noRecipientsMsg
          });
        } else {
          const errorMessage = emailResult.error || emailResult.message || `Erro desconhecido na API (status: ${emailResponse.status})`;
          console.error(`❌ Erro ao processar log ${log.id}:`, {
            status: emailResponse.status,
            error: emailResult.error,
            message: emailResult.message,
            details: emailResult.details,
            category: log.category_name
          });
          
          await supabase.rpc('update_notification_log', {
            p_log_id: log.id,
            p_email_sent: false,
            p_email_error: errorMessage
          });
          
          errorCount++;
          results.push({
            logId: log.id,
            category: log.category_name || 'unknown',
            recipient: log.user_email || 'unknown',
            success: false,
            error: errorMessage
          });
        }

      } catch (error) {
        console.error(`Erro ao processar log ${log.id}:`, error);
        
        await supabase.rpc('update_notification_log', {
          p_log_id: log.id,
          p_email_sent: false,
          p_email_error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        
        errorCount++;
        results.push({
          logId: log.id,
            category: log.category_name || 'unknown',
          recipient: log.user_email || 'unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    console.log(`✅ Processamento concluído: ${successCount} sucessos, ${errorCount} erros`);

    return NextResponse.json({
      success: true,
      message: `Processadas: ${successCount} sucessos, ${errorCount} erros`,
      processedCount: successCount,
      results
    });

  } catch (error) {
    console.error('Erro no processamento de notificações:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}


