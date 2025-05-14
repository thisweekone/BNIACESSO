-- Adicionar UUID extension se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela para armazenar as respostas às referências
CREATE TABLE IF NOT EXISTS reference_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES reference_requests(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES members(id),
  responder_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  company_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_address TEXT,
  description TEXT,
  heat_level INTEGER NOT NULL, -- 1-5 indicando quão "quente" é a referência
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar o histórico de contatos para alertas futuros
CREATE TABLE IF NOT EXISTS contact_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id),
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  tags TEXT, -- Tags associadas à referência original
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campo status à tabela reference_requests se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'reference_requests' AND column_name = 'status') THEN
    ALTER TABLE reference_requests ADD COLUMN status TEXT DEFAULT 'open';
  END IF;
END $$;

-- Adicione índices para melhorar a performance das consultas mais frequentes
CREATE INDEX IF NOT EXISTS idx_reference_responses_request_id ON reference_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_reference_responses_responder_id ON reference_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_member_id ON contact_history(member_id);
CREATE INDEX IF NOT EXISTS idx_reference_requests_status ON reference_requests(status);
