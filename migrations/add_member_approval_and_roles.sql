-- Adicionar sistema de aprovação de membros e perfis de acesso

-- Criar enum para situação dos membros
CREATE TYPE member_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'inativo');

-- Criar enum para perfis de acesso
CREATE TYPE user_role AS ENUM (
  'administrador_plataforma', 
  'membro', 
  'administrador_grupo', 
  'administrativo_grupo'
);

-- Alterar tabela members para incluir os novos campos
ALTER TABLE members
ADD COLUMN IF NOT EXISTS status member_status DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'membro',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS group_id UUID; -- Para associar membro a um grupo específico

-- Criar tabela de grupos
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de segurança (RLS)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Somente administradores da plataforma podem gerenciar grupos
CREATE POLICY groups_admin_policy ON groups
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.email = auth.jwt() ->> 'email'
      AND members.role = 'administrador_plataforma'
    )
  );

-- Políticas para tabela members
DROP POLICY IF EXISTS members_select_policy ON members;

-- Todos podem ver membros aprovados
CREATE POLICY members_public_policy ON members
  FOR SELECT
  USING (status = 'aprovado');

-- Administradores podem ver todos os membros
CREATE POLICY members_admin_select_policy ON members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members AS m
      WHERE m.email = auth.jwt() ->> 'email'
      AND (m.role = 'administrador_plataforma' OR m.role = 'administrador_grupo')
    )
  );

-- Administradores podem modificar membros
CREATE POLICY members_admin_update_policy ON members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members AS m
      WHERE m.email = auth.jwt() ->> 'email'
      AND (m.role = 'administrador_plataforma' OR 
           (m.role = 'administrador_grupo' AND m.group_id = members.group_id))
    )
  );

-- Criar função para atualizar timestamp de edição
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar timestamp de edição
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Criar tabela para solicitações de cadastro (pré-cadastro)
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  group_id UUID REFERENCES groups(id),
  status member_status DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar políticas de segurança para registration_requests
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode criar uma solicitação de cadastro
CREATE POLICY registration_requests_insert_policy ON registration_requests
  FOR INSERT
  WITH CHECK (true);

-- Administradores podem ver e gerenciar todas as solicitações
CREATE POLICY registration_requests_admin_policy ON registration_requests
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.email = auth.jwt() ->> 'email'
      AND (members.role = 'administrador_plataforma' OR members.role = 'administrador_grupo')
    )
  );

-- Trigger para atualizar timestamp
CREATE TRIGGER update_registration_requests_updated_at
BEFORE UPDATE ON registration_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Adicionar administrador padrão do sistema se não existir
-- Essa operação só deve ser executada uma vez em produção
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM members 
    WHERE role = 'administrador_plataforma' 
    LIMIT 1
  ) THEN
    -- Insira um e-mail de administrador real aqui
    INSERT INTO members (
      email, 
      name, 
      role, 
      status, 
      specialty,
      phone,
      bio,
      city
    )
    VALUES (
      'admin@bniacesso.com.br', 
      'Administrador do Sistema', 
      'administrador_plataforma', 
      'aprovado',
      'Administração', -- specialty é obrigatório
      '(00) 00000-0000', -- phone
      'Administrador da plataforma BNI Acesso', -- bio
      'São Paulo' -- city
    );
  END IF;
END $$;
