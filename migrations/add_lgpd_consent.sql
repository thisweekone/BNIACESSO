-- Adicionar campo de consentimento LGPD na tabela de membros
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lgpd_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profile_description TEXT;

-- Criação de índice para melhorar a performance de buscas de perfis públicos
CREATE INDEX IF NOT EXISTS idx_members_public_profile ON members(public_profile);

-- Adicionar políticas de segurança (RLS) para garantir acesso seguro
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Política para perfis públicos - qualquer pessoa pode visualizar membros que deram consentimento
CREATE POLICY members_public_read_policy ON members
  FOR SELECT 
  USING (public_profile = true);

-- Política para administradores - podem visualizar todos os perfis
CREATE POLICY members_admin_all_policy ON members
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Política para próprio usuário - pode editar seus próprios dados
CREATE POLICY members_self_update_policy ON members
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para registrar a data de consentimento quando o membro mudar para public_profile = true
CREATE OR REPLACE FUNCTION set_lgpd_consent_date() 
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.public_profile = true AND (OLD.public_profile = false OR OLD.public_profile IS NULL)) THEN
    NEW.lgpd_consent_date = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_lgpd_consent
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION set_lgpd_consent_date();
