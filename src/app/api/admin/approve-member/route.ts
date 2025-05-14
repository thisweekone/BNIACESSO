import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, memberData } = await request.json();
    
    // Log para depuração - verificar se as variáveis de ambiente estão disponíveis
    console.log('URL do Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service Key disponível:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Criar cliente Supabase diretamente com a URL e chave de serviço
    // Esta abordagem é mais confiável para operações administrativas
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
    
    // Verificar se temos a chave de serviço
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Chave de serviço do Supabase não encontrada. Configure a variável SUPABASE_SERVICE_ROLE_KEY.');
    }
    
    // Tentativa de criar ou encontrar o usuário
    let userId;
    
    try {
      // Tentar criar o usuário
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      
      if (error) {
        // Se o erro for de usuário já existente, lidar com isso
        if (error.message && error.message.includes('already been registered')) {
          console.log('Usuário já existe no Supabase, buscando informações...');
          
          // Para buscar usuário por email, usamos o método de admin listUsers
          const { data: usersData } = await supabase.auth.admin.listUsers();
          
          if (usersData && usersData.users) {
            const existingUser = usersData.users.find(u => u.email === email);
            
            if (existingUser) {
              console.log('Usuário encontrado com ID:', existingUser.id);
              userId = existingUser.id;
            } else {
              throw new Error('Usuário já existe mas não foi possível encontrá-lo');
            }
          } else {
            throw new Error('Falha ao listar usuários');
          }
        } else {
          // Outro tipo de erro
          console.error('Erro ao criar usuário:', error);
          throw error;
        }
      } else if (newUser && newUser.user) {
        // Usuário criado com sucesso
        userId = newUser.user.id;
      } else {
        throw new Error('Falha ao criar usuário: dados de retorno inválidos');
      }
    } catch (error) {
      console.error('Erro ao processar criação de usuário:', error);
      throw error;
    }
    
    // Se tiver dados adicionais do membro para salvar
    if (userId) {
      // Criar objeto com valores padrão para todos os campos obrigatórios
      const defaultMemberData = {
        id: userId,
        email: email,
        specialty: 'Não informado', // Valor padrão para o campo obrigatório
        bio: '',                    // Outros campos que podem ser obrigatórios
        status: 'aprovado',
        role: 'membro',
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      // Mesclar dados do membro fornecidos com os valores padrão
      const memberDataToSave = {
        ...defaultMemberData,
        ...(memberData || {})
      };
      
      console.log('Salvando dados do membro:', memberDataToSave);
      
      // Atualizar dados na tabela de membros
      const { error: memberError } = await supabase
        .from('members')
        .upsert(memberDataToSave);
        
      if (memberError) {
        console.error('Erro ao salvar dados do membro:', memberError);
        throw memberError;
      }
    }
    
    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Erro ao aprovar membro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
