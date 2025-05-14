-- Criar tabela para mensagens de contato
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_whatsapp TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de segurança
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Política para os membros verem apenas suas próprias mensagens
CREATE POLICY "Members can view their own messages" 
  ON contact_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE id = member_id AND email = current_user
    )
  );

-- Política para inserção de mensagens para todos os usuários autenticados
CREATE POLICY "Anyone can insert contact messages" 
  ON contact_messages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Política para os membros poderem atualizar suas próprias mensagens (marcar como lida)
CREATE POLICY "Members can update their own messages" 
  ON contact_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE id = member_id AND email = current_user
    )
  );
