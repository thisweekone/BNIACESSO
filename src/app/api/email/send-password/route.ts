import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com a chave de serviço
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Usar signInWithOtp para enviar um email de acesso (magic link)
    // Em ambiente real, você pode configurar o template de email do Supabase para incluir a senha temporária
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
      }
    });
    
    // Como alternativa, em um ambiente de produção você poderia usar um serviço de email como SendGrid, Mailgun, etc.
    // para enviar um email formatado bonitinho com a senha temporária
    
    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao enviar email' },
      { status: 500 }
    );
  }
}
