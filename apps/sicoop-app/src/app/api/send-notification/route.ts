import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

// Criar cliente admin com service role key para bypass RLS
// Usar auth: { persistSession: false } para garantir que não há sessão de usuário interferindo
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

interface NotificationData {
  category: string;
  entityType: 'mensagem' | 'analise';
  entityId: string;
  entityData: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // Validar variáveis de ambiente
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY não configurada');
      return NextResponse.json(
        { 
          error: 'RESEND_API_KEY não configurada. Configure a chave do Resend para enviar emails.',
          success: false
        },
        { status: 500 }
      );
    }

    const body: NotificationData = await request.json();
    const { category, entityType, entityId, entityData } = body;

    console.log(`📧 send-notification recebido:`, {
      category,
      entityType,
      entityId,
      hasEntityData: !!entityData,
      resendApiKeyConfigured: !!resendApiKey
    });

    if (!category || !entityType || !entityId || !entityData) {
      console.error('❌ Dados obrigatórios não fornecidos:', { category, entityType, entityId, hasEntityData: !!entityData });
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos', success: false },
        { status: 400 }
      );
    }

    // Buscar categoria de notificação usando função RPC (bypass RLS)
    // Primeiro tentar buscar por name exato
    const { data: categoryDataArray, error: categoryError } = await supabase
      .rpc('get_notification_category', { p_category_name: category });

    interface NotificationCategory {
      id: string;
      name: string;
      display_name: string;
      email_template_subject: string;
      email_template_body: string;
      is_active: boolean;
    }

    let categoryData: NotificationCategory | null = null;
    let todasCategorias: NotificationCategory[] | null = null;

    // Se encontrar resultado, pegar o primeiro
    if (categoryDataArray && categoryDataArray.length > 0) {
      const firstCategory = categoryDataArray[0];
      if (firstCategory) {
        categoryData = firstCategory;
        console.log(`✅ Categoria encontrada: ${firstCategory.name} (${firstCategory.display_name})`);
      }
    } else {
      // Se não encontrar por name exato, tentar busca parcial
      console.log(`⚠️ Categoria "${category}" não encontrada por name exato, tentando busca parcial...`);
      const { data: categoriasPorBusca } = await supabase
        .rpc('get_notification_category', { p_search_term: category });
      
      todasCategorias = categoriasPorBusca || [];
      console.log(`📋 Categorias encontradas por busca:`, todasCategorias?.map(c => ({ name: c.name, display_name: c.display_name })));
      
      // Buscar categoria que contenha o termo no name ou display_name
      categoryData = todasCategorias?.find(cat => 
        cat.name?.toLowerCase().includes(category.toLowerCase()) || 
        cat.display_name?.toLowerCase().includes(category.toLowerCase())
      ) || null;
      
      if (categoryData) {
        console.log(`✅ Categoria encontrada por busca parcial: ${categoryData.name} (${categoryData.display_name})`);
      } else {
        console.error(`❌ Categoria não encontrada mesmo com busca parcial: ${category}`);
      }
    }

    if (categoryError || !categoryData) {
      return NextResponse.json(
        { 
          error: `Categoria de notificação não encontrada: ${category}`,
          details: categoryError,
          searchedCategories: todasCategorias?.map(c => ({ name: c.name, display_name: c.display_name }))
        },
        { status: 404 }
      );
    }

    // Buscar destinatários usando o name da categoria encontrada (não o parâmetro recebido)
    const categoryNameToUse = categoryData.name;
    console.log(`👥 Buscando destinatários para categoria: ${categoryNameToUse} (recebido: ${category})`);
    
    const { data: recipients, error: recipientsError } = await supabase
      .rpc('get_notification_recipients', { p_category_name: categoryNameToUse });

    interface Recipient {
      user_id: string;
      email: string;
    }

    console.log(`📊 Resultado da busca de destinatários:`, {
      recipientsCount: recipients?.length || 0,
      error: recipientsError,
      recipients: recipients?.map((r: Recipient) => ({ user_id: r.user_id, email: r.email }))
    });

    if (recipientsError) {
      console.error(`❌ Erro ao buscar destinatários:`, recipientsError);
      return NextResponse.json(
        { 
          error: `Erro ao buscar destinatários: ${recipientsError.message}`,
          details: recipientsError
        },
        { status: 500 }
      );
    }

    if (!recipients || recipients.length === 0) {
      console.log(`⚠️ Nenhum destinatário encontrado para categoria ${categoryNameToUse}`);
      return NextResponse.json({
        success: true,
        message: 'Nenhum destinatário encontrado para esta categoria',
        recipientsCount: 0
      });
    }

    // Processar template de email
    const processTemplate = (template: string, data: Record<string, unknown>): string => {
      // Primeiro, converter \n literais para quebras de linha reais
      // Também converter \\n (duplo escape) e \r\n (Windows)
      let processed = template
        .replace(/\\n/g, '\n')
        .replace(/\\r\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
      
      // Adicionar variáveis específicas do sistema
      const templateData = {
        ...data,
        nome_administrador: 'Administrador', // Pode ser personalizado no futuro
        sistema: 'Sicoop',
        data_atual: new Date().toLocaleDateString('pt-BR')
      };
      
      // Substituir variáveis {{variavel}}
      processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const value = templateData[key.trim() as keyof typeof templateData];
        return value !== undefined ? String(value) : match;
      });
      
      return processed;
    };

    const template = {
      subject: processTemplate(categoryData.email_template_subject, entityData),
      body: processTemplate(categoryData.email_template_body, entityData)
    };

    // Converter texto para HTML com formatação melhorada e quebras de linha preservadas
    const convertMarkdownToHtml = (text: string): string => {
      // Primeiro, garantir que temos quebras de linha reais
      // Converter múltiplas quebras de linha consecutivas em quebras duplas (parágrafos)
      let html = text.replace(/\n{3,}/g, '\n\n');
      
      // Dividir em linhas preservando quebras de linha
      const lines = html.split('\n');
      let inList = false;
      const result: string[] = [];
      let currentParagraph: string[] = [];
      
      const flushParagraph = () => {
        if (currentParagraph.length > 0) {
          const paraText = currentParagraph.join(' ').trim();
          if (paraText) {
            result.push(`<p style="margin: 12px 0; color: #374161; line-height: 1.7; font-size: 15px;">${paraText}</p>`);
          }
          currentParagraph = [];
        }
      };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Linha vazia - fecha parágrafo atual e lista se necessário
        if (!line) {
          flushParagraph();
          if (inList) {
            result.push('</ul>');
            inList = false;
          }
          continue;
        }
        
        // Verificar se é um título **Título:**
        if (line.match(/^\*\*(.+?):\*\*$/)) {
          flushParagraph();
          if (inList) {
            result.push('</ul>');
            inList = false;
          }
          const title = line.replace(/^\*\*(.+?):\*\*$/, '$1');
          result.push(`<h3 style="color: #374161; margin: 24px 0 16px 0; font-size: 18px; font-weight: bold; font-family: 'Montserrat', Arial, sans-serif;">${title}</h3>`);
          continue;
        }
        
        // Verificar se é um item de lista (começa com •)
        if (line.match(/^•\s+(.+)$/)) {
          flushParagraph();
          if (!inList) {
            result.push('<ul style="margin: 16px 0; padding-left: 0; list-style: none;">');
            inList = true;
          }
          const content = line.replace(/^•\s+/, '');
          // Formatar como "Chave: Valor" se houver dois pontos
          if (content.includes(':')) {
            const colonIndex = content.indexOf(':');
            const key = content.substring(0, colonIndex).trim();
            const value = content.substring(colonIndex + 1).trim();
            // Converter email para link se for email
            let formattedValue = value;
            if (value.includes('@') && value.includes('.')) {
              formattedValue = `<a href="mailto:${value}" style="color: #6374AD; text-decoration: none; border-bottom: 1px solid #6374AD;">${value}</a>`;
            }
            result.push(`<li style="margin: 10px 0; padding-left: 24px; position: relative; color: #374161; line-height: 1.7;">
              <span style="position: absolute; left: 0; color: #6374AD; font-weight: bold; font-size: 18px;">•</span>
              <span style="font-weight: bold; color: #374161;">${key}:</span> 
              <span style="color: #6374AD;">${formattedValue}</span>
            </li>`);
          } else {
            result.push(`<li style="margin: 10px 0; padding-left: 24px; position: relative; color: #374161; line-height: 1.7;">
              <span style="position: absolute; left: 0; color: #6374AD; font-weight: bold; font-size: 18px;">•</span>
              <span style="padding-left: 8px;">${content}</span>
            </li>`);
          }
          continue;
        }
        
        // Linha normal - adicionar ao parágrafo atual
        // Remover ** do texto se houver (já processamos títulos)
        const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #374161; font-weight: bold;">$1</strong>');
        currentParagraph.push(cleanLine);
      }
      
      // Fechar parágrafo e lista se ainda estiverem abertos
      flushParagraph();
      if (inList) {
        result.push('</ul>');
      }
      
      html = result.join('');
      
      // Converter --- para <hr>
      html = html.replace(/<p[^>]*>---<\/p>/g, '<hr style="border: none; border-top: 2px solid #dbe2ea; margin: 24px 0;">');
      
      // Converter links para <a> com estilo Goalmoon (mas não emails que já foram convertidos)
      html = html.replace(/(https?:\/\/[^\s<>"']+)/g, (match) => {
        // Não converter se já está dentro de um link
        if (html.indexOf(`href="${match}"`) === -1 && html.indexOf(`mailto:`) === -1) {
          return `<a href="${match}" style="color: #6374AD; text-decoration: none; border-bottom: 1px solid #6374AD;">${match}</a>`;
        }
        return match;
      });
      
      return html;
    };

    const results = [];

    // Enviar emails para cada destinatário
    for (const recipient of recipients) {
      try {
        console.log(`Enviando email para ${recipient.email} - ${category} - ${entityType}:${entityId}`);
        
        // Enviar email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Sicoop <contato@goalmoon.com>',
            to: [recipient.email],
            subject: template.subject,
            text: template.body,
            html: `
              <!DOCTYPE html>
              <html lang="pt-BR">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>${template.subject}</title>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
              </head>
              <body style="margin: 0; padding: 0; background-color: #eaf0f5; font-family: 'Montserrat', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #eaf0f5; padding: 20px;">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(55, 65, 97, 0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="background-color: #374161; padding: 32px 24px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; font-family: 'Montserrat', Arial, sans-serif; letter-spacing: -0.5px; line-height: 1.2;">
                              Sicoop
                            </h1>
                            <p style="margin: 8px 0 0 0; font-size: 14px; color: #dbe2ea; font-family: 'Montserrat', Arial, sans-serif; line-height: 1.4;">
                              Sistema de Controle de Operações
                            </p>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="background-color: #ffffff; padding: 32px 24px;">
                            <div style="color: #374161; font-family: 'Montserrat', Arial, sans-serif; line-height: 1.7;">
                              ${convertMarkdownToHtml(template.body)}
                            </div>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #dbe2ea;">
                            <p style="margin: 0; font-size: 12px; color: #6374AD; font-family: 'Montserrat', Arial, sans-serif; line-height: 1.5;">
                              Este é um email automático do sistema Sicoop
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `
          }),
        });

        const emailResult = await emailResponse.json();
        
        if (!emailResponse.ok) {
          const errorMessage = `Resend Error (${emailResponse.status}): ${emailResult.message || emailResult.error || 'Erro desconhecido'} - Dados: ${JSON.stringify(entityData)}`;
          console.error('Erro do Resend:', errorMessage);
          throw new Error(errorMessage);
        }

        console.log(`✅ Email enviado com sucesso para ${recipient.email}:`, emailResult.id);

        // Não criar novo log aqui - o log já existe e será atualizado pela API process-pending-notifications
        // Apenas adicionar ao resultado para retornar à API chamadora

        results.push({
          recipient: recipient.email,
          success: true,
          messageId: emailResult.id
        });

      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        const errorStack = error instanceof Error ? error.stack : undefined;
        const errorMessage = `Erro ao enviar para ${recipient.email}: ${errorMsg}`;
        console.error(`❌ Erro ao enviar email:`, {
          recipient: recipient.email,
          error: errorMsg,
          stack: errorStack,
          category,
          entityType,
          entityId
        });
        
        // Não criar novo log aqui - o log já existe e será atualizado pela API process-pending-notifications
        // Apenas adicionar ao resultado para retornar à API chamadora

        results.push({
          recipient: recipient.email,
          success: false,
          error: errorMessage
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`📊 Resumo do envio:`, {
      totalRecipients: recipients.length,
      successCount,
      errorCount,
      results: results.map(r => ({ recipient: r.recipient, success: r.success, error: r.error }))
    });

    return NextResponse.json({
      success: true,
      message: `Notificações processadas: ${successCount} sucessos, ${errorCount} erros`,
      recipientsCount: recipients.length,
      results
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorStack
      },
      { status: 500 }
    );
  }
}
