import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
Deno.serve(async (req)=>{
  // Configurar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }
  try {
    console.log('Edge Function iniciada');
    // Verificar se é POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Método não permitido'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Obter dados da requisição
    const body = await req.json();
    console.log('Dados recebidos:', body);
    const { category, entityType, entityId, entityData } = body;
    if (!category || !entityType || !entityId || !entityData) {
      return new Response(JSON.stringify({
        error: 'Dados obrigatórios não fornecidos'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log('Variáveis de ambiente:');
    console.log('SUPABASE_URL:', supabaseUrl ? 'Definida' : 'Não definida');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Definida' : 'Não definida');
    console.log('RESEND_API_KEY:', resendApiKey ? 'Definida' : 'Não definida');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({
        error: 'Variáveis de ambiente do Supabase não configuradas',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseServiceKey: !!supabaseServiceKey
        }
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (!resendApiKey) {
      return new Response(JSON.stringify({
        error: 'RESEND_API_KEY não configurada. Configure a chave do Resend para enviar emails.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Buscar categoria de notificação
    console.log('Buscando categoria:', category);
    const { data: categoryData, error: categoryError } = await supabase.from('notification_categories').select('*').eq('name', category).eq('is_active', true).single();
    if (categoryError || !categoryData) {
      console.error('Erro ao buscar categoria:', categoryError);
      return new Response(JSON.stringify({
        error: `Categoria de notificação não encontrada: ${category}`,
        details: categoryError
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Categoria encontrada:', categoryData);
    // Buscar destinatários
    console.log('Buscando destinatários para categoria:', category);
    const { data: recipients, error: recipientsError } = await supabase.rpc('get_notification_recipients', {
      category_name: category
    });
    if (recipientsError) {
      console.error('Erro ao buscar destinatários:', recipientsError);
      return new Response(JSON.stringify({
        error: `Erro ao buscar destinatários: ${recipientsError.message}`,
        details: recipientsError
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Destinatários encontrados:', recipients);
    if (!recipients || recipients.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum destinatário encontrado para esta categoria',
        recipientsCount: 0
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Processar template de email
    const processTemplate = (template, data)=>{
      return template.replace(/\{\{([^}]+)\}\}/g, (match, key)=>{
        const value = data[key.trim()];
        return value !== undefined ? String(value) : match;
      });
    };
    const template = {
      subject: processTemplate(categoryData.email_template_subject, entityData),
      body: processTemplate(categoryData.email_template_body, entityData)
    };
    console.log('Template processado:', template);
    const results = [];
    // Enviar emails para cada destinatário
    for (const recipient of recipients){
      try {
        console.log(`Enviando email para ${recipient.email}`);
        // Enviar email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Sicoop <noreply@sicoop.com>',
            to: [
              recipient.email
            ],
            subject: template.subject,
            text: template.body,
            html: template.body.replace(/\n/g, '<br>')
          })
        });
        const emailResult = await emailResponse.json();
        if (!emailResponse.ok) {
          throw new Error(`Erro do Resend: ${emailResult.message || 'Erro desconhecido'}`);
        }
        console.log(`Email enviado com sucesso para ${recipient.email}:`, emailResult);
        // Registrar log de sucesso
        await supabase.rpc('log_notification', {
          p_category_name: category,
          p_user_id: recipient.user_id,
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_email_sent: true
        });
        results.push({
          recipient: recipient.email,
          success: true,
          messageId: emailResult.id
        });
      } catch (error) {
        console.error(`Erro ao enviar email para ${recipient.email}:`, error);
        // Registrar log de erro
        await supabase.rpc('log_notification', {
          p_category_name: category,
          p_user_id: recipient.user_id,
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_email_sent: false,
          p_email_error: error.message
        });
        results.push({
          recipient: recipient.email,
          success: false,
          error: error.message
        });
      }
    }
    const successCount = results.filter((r)=>r.success).length;
    const errorCount = results.filter((r)=>!r.success).length;
    console.log(`Processamento concluído: ${successCount} sucessos, ${errorCount} erros`);
    return new Response(JSON.stringify({
      success: true,
      message: `Notificações processadas: ${successCount} sucessos, ${errorCount} erros`,
      recipientsCount: recipients.length,
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor',
      details: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
