-- Remover políticas existentes
DROP POLICY IF EXISTS "Members can view their own messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON contact_messages;
DROP POLICY IF EXISTS "Members can update their own messages" ON contact_messages;

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
