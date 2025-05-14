import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
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
    
    // Gerar o token para redefinição de senha usando a API do Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/atualizar-senha`
      }
    });
    
    if (error) {
      console.error('Erro ao gerar link de recuperação:', error);
      throw error;
    }
    
    // Obter o link de recuperação gerado
    const resetLink = data?.properties?.action_link;
    
    if (!resetLink) {
      throw new Error('Falha ao gerar link de recuperação');
    }
    
    // Configurar o transporte de email com as configurações da Hostinger
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'seu-email@seudominio.com',
        pass: process.env.EMAIL_PASSWORD || 'sua-senha-de-email'
      }
    });
    
    // URL do site
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Template HTML personalizado usando o design fornecido pelo usuário
    const currentYear = new Date().getFullYear();
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Redefinir Senha</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }

          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            text-align: center;
          }

          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px auto;
            background-color: #e61926;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          }

          h2 {
            color: #222222;
            margin-top: 10px;
          }

          p {
            font-size: 16px;
            color: #444444;
            margin: 20px 0;
          }

          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #e61926;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
          }

          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #aaaaaa;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">BNI</div>
          <h2>Redefinir sua senha</h2>
          <p>Você solicitou a redefinição da senha da sua conta.</p>
          <p>Para criar uma nova senha, clique no botão abaixo:</p>
          <a class="button" href="${resetLink}">Redefinir senha</a>
          <p style="margin-top: 30px;">Se você não solicitou essa ação, ignore este e-mail.</p>
          <div class="footer">
            © ${currentYear} BNI Acesso. Todos os direitos reservados.
          </div>
        </div>
      </body>
    </html>
    `;
    
    // Configurar o email
    const mailOptions = {
      from: '"BNI Acesso" <noreply@bniacesso.com>',
      to: email,
      subject: 'Redefinição de Senha - BNI Acesso',
      html: htmlContent
    };
    
    // Enviar o email
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      throw new Error('Falha ao enviar email de redefinição de senha');
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao processar redefinição de senha:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao processar pedido de redefinição de senha' },
      { status: 500 }
    );
  }
}
