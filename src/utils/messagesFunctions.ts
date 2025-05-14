import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type ContactMessage = {
  id?: string;
  member_id: string;
  sender_name: string;
  sender_email: string;
  sender_whatsapp?: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
};

/**
 * Envia uma nova mensagem de contato para um membro
 */
export async function sendContactMessage(message: ContactMessage) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('contact_messages')
    .insert(message)
    .select('*')
    .single();
    
  if (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
  
  // Opcional: Enviar notificação por email para o membro
  try {
    await sendEmailNotification(message);
  } catch (emailError) {
    console.error('Erro ao enviar notificação por email:', emailError);
    // Não interrompe o fluxo, apenas loga o erro
  }
  
  return data;
}

/**
 * Busca todas as mensagens de contato do membro autenticado
 */
export async function getMyContactMessages() {
  const supabase = createClientComponentClient();
  
  // Vamos usar uma abordagem direta que depende das políticas RLS do Supabase
  // O Supabase irá filtrar as mensagens automaticamente com base no usuário autenticado
  
  // Verifica se o usuário está autenticado
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) throw new Error('Usuário não autenticado');

  // Busca diretamente as mensagens vinculadas ao usuário atual
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar mensagens:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Marca uma mensagem como lida
 */
export async function markMessageAsRead(messageId: string) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('*')
    .single();
    
  if (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    throw error;
  }
  
  return data;
}

/**
 * Envia notificação por email para o membro
 * Nota: Esta função precisaria ser implementada como uma função serverless
 * ou usando um serviço de email como SendGrid ou AWS SES
 */
async function sendEmailNotification(message: ContactMessage) {
  // Implementação real depende do serviço de email que você deseja usar
  // Este é apenas um placeholder
  
  // Exemplo usando uma API de email:
  // const response = await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     to: memberEmail,
  //     subject: `Nova mensagem de contato de ${message.sender_name}`,
  //     text: `Você recebeu uma nova mensagem de ${message.sender_name} (${message.sender_email}).\n\nMensagem: ${message.message}\n\nAcesse a plataforma BNI ACESSO para responder.`
  //   })
  // });
  
  // return response.json();
  
  // Por enquanto, apenas simula o envio bem-sucedido
  return Promise.resolve({ success: true });
}
