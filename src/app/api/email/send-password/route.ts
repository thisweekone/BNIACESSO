import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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
    
    // Configurar o transporte de email com as configurações da Hostinger
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.hostinger.com', // Servidor SMTP da Hostinger
      port: parseInt(process.env.EMAIL_PORT || '465'),     // Porta 465 para SSL, 587 para TLS
      secure: process.env.EMAIL_SECURE === 'true',         // true para 465, false para outras portas
      auth: {
        user: process.env.EMAIL_USER || 'seu-email@seudominio.com',
        pass: process.env.EMAIL_PASSWORD || 'sua-senha-de-email'
      }
    });
    
    // URL do site
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Template HTML personalizado
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao BNI Acesso</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #004A8F;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
          }
          .password-box {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            letter-spacing: 1px;
          }
          .button {
            display: inline-block;
            background-color: #004A8F;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BNI Acesso</h1>
        </div>
        <div class="content">
          <h2>Bem-vindo(a), ${name}!</h2>
          <p>Sua solicitação de cadastro foi aprovada. Você agora tem acesso à plataforma BNI Acesso.</p>
          <p>Sua senha temporária é:</p>
          <div class="password-box">
            <strong>${password}</strong>
          </div>
          <p>Por motivos de segurança, recomendamos que você altere esta senha no primeiro acesso.</p>
          <p>Para acessar a plataforma, clique no botão abaixo:</p>
          <p style="text-align: center;">
            <a href="${siteUrl}/login" class="button">Acessar a Plataforma</a>
          </p>
          <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
          <p>${siteUrl}/login</p>
        </div>
        <div class="footer">
          <p>Esta é uma mensagem automática, por favor não responda este email.</p>
          <p>&copy; ${new Date().getFullYear()} BNI Acesso. Todos os direitos reservados.</p>
        </div>
      </body>
    </html>
    `;
    
    // Configurar o email
    const mailOptions = {
      from: '"BNI Acesso" <noreply@bniacesso.com>',
      to: email,
      subject: 'Bem-vindo ao BNI Acesso - Suas Credenciais de Acesso',
      html: htmlContent
    };
    
    // Enviar o email
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      throw new Error('Falha ao enviar email com a senha');
    }
    
    // Usar supabase admin para garantir que o usuário tenha a senha configurada
    // Primeiro buscar o ID do usuário pelo email
    const { data: usersData } = await supabase.auth.admin.listUsers();
    let userId = null;
    
    if (usersData && usersData.users) {
      const user = usersData.users.find(u => u.email === email);
      if (user) {
        userId = user.id;
      }
    }
    
    // Se encontramos o usuário, atualizamos a senha
    let error = null;
    if (userId) {
      const result = await supabase.auth.admin.updateUserById(
        userId,
        { password: password }
      );
      error = result.error;
    } else {
      console.error('Usuário não encontrado para definir senha');
    }
    
    if (error) {
      console.error('Erro ao atualizar senha do usuário:', error);
      // Não lançamos erro aqui porque já enviamos o email
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
