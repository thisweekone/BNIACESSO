import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, memberData } = await request.json();
    
    // Use o cliente Supabase com a chave de serviço (definida nas variáveis de ambiente do Vercel)
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY // chave de serviço, não a anônima
      }
    );
    
    // Criar o usuário com a API de Administrador
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (error) throw error;
    
    // Se tiver dados adicionais do membro para salvar
    if (memberData) {
      // Atualizar dados na tabela de membros
      const { error: memberError } = await supabase
        .from('members')
        .upsert({ 
          id: data.user.id,
          email: email,
          ...memberData
        });
        
      if (memberError) throw memberError;
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao aprovar membro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
