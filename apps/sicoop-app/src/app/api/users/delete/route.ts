import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(request: NextRequest) {
  try {
    // Verificar se temos as credenciais necessárias
    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Service role key não configurada' },
        { status: 500 }
      );
    }

    // Criar cliente admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Extrair ID do usuário do corpo da requisição
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🗑️ Iniciando exclusão recursiva do usuário:', userId);

    // 1. Remover registros dependentes primeiro (para evitar conflito de foreign keys)
    console.log('🗑️ Removendo registros dependentes...');
    
    // Remover de analises_cobertura
    const { error: deleteAnalisesError } = await supabaseAdmin
      .from('analises_cobertura')
      .delete()
      .eq('user_id', userId);

    if (deleteAnalisesError) {
      console.error('❌ Erro ao remover análises:', deleteAnalisesError);
    } else {
      console.log('✅ Análises removidas');
    }

    // Remover de mensagens
    const { error: deleteMensagensError } = await supabaseAdmin
      .from('mensagens')
      .delete()
      .eq('user_id', userId);

    if (deleteMensagensError) {
      console.error('❌ Erro ao remover mensagens:', deleteMensagensError);
    } else {
      console.log('✅ Mensagens removidas');
    }

    // 2. Remover perfil da tabela profiles
    console.log('🗑️ Removendo perfil...');
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('❌ Erro ao remover perfil:', deleteProfileError);
      return NextResponse.json(
        { error: `Falha ao remover perfil: ${deleteProfileError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Perfil removido com sucesso');

    // 3. Remover usuário do Supabase Auth (requer service role)
    console.log('🗑️ Removendo usuário do Auth...');
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('❌ Erro ao remover usuário do Auth:', authError);
      return NextResponse.json(
        { error: `Falha ao remover usuário do Auth: ${authError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Usuário removido do Auth com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso do sistema'
    });

  } catch (error) {
    console.error('❌ Erro inesperado ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
