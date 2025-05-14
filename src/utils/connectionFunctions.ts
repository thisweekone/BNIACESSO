import { supabase } from '@/lib/supabase';
import { ReferenceMatch } from '@/types/references';

interface ConnectionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Cria uma conexão entre dois usuários baseada em um match de referência
 */
export async function createUserConnection(
  requestId: string, 
  match: ReferenceMatch, 
  message?: string
): Promise<ConnectionResult> {
  try {
    // Primeiro, obtém informações do usuário atual (remetente)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }

    // Verificar se já existe uma conexão para estes usuários e esta solicitação
    const { data: existingConnection, error: checkError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('requester_email', user.email)
      .eq('target_email', match.user_email)
      .eq('request_id', requestId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Erro ao verificar conexão existente:', checkError);
      return {
        success: false,
        message: 'Erro ao verificar conexão existente'
      };
    }
    
    // Se já existe uma conexão, retorna informação
    if (existingConnection) {
      return {
        success: false,
        message: 'Você já enviou uma solicitação para este usuário para esta referência',
        data: existingConnection
      };
    }

    // Criar a nova conexão
    const { data: connection, error } = await supabase
      .from('user_connections')
      .insert({
        requester_email: user.email,
        target_email: match.user_email,
        request_id: requestId,
        target_request_id: match.request_id,
        message: message || `Olá! Vi que temos interesses em comum relacionados a tags como ${match.matching_tags.join(', ')}. Gostaria de conectar para trocarmos mais informações.`
      })
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao criar conexão:', error);
      return {
        success: false,
        message: `Erro ao criar conexão: ${error.message}`
      };
    }

    // Sucesso
    return {
      success: true,
      message: 'Solicitação de conexão enviada com sucesso',
      data: connection
    };
  } catch (error) {
    console.error('Erro ao criar conexão:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao criar a conexão'
    };
  }
}

/**
 * Obtém todas as conexões do usuário atual
 */
export async function getUserConnections(status?: string): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    let query = supabase
      .from('user_connections')
      .select(`
        *,
        requester:requester_email(email, id),
        target:target_email(email, id),
        requester_request:request_id(title, description, tags),
        target_request:target_request_id(title, description, tags)
      `)
      .or(`requester_email.eq.${user.email},target_email.eq.${user.email}`);
      
    // Filtrar por status se fornecido
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar conexões:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar conexões do usuário:', error);
    return [];
  }
}

/**
 * Atualiza o status de uma conexão (aceitar/rejeitar)
 */
export async function updateConnectionStatus(
  connectionId: string, 
  status: 'accepted' | 'rejected'
): Promise<ConnectionResult> {
  try {
    const { data, error } = await supabase
      .from('user_connections')
      .update({ status })
      .eq('id', connectionId)
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao atualizar status da conexão:', error);
      return {
        success: false,
        message: `Erro ao atualizar status: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: status === 'accepted' 
        ? 'Conexão aceita com sucesso'
        : 'Conexão rejeitada',
      data
    };
  } catch (error) {
    console.error('Erro ao atualizar status da conexão:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao atualizar a conexão'
    };
  }
}
