-- Tabela para armazenar conexões entre usuários baseadas em referências
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES members(id),
  requester_email TEXT NOT NULL,
  target_id UUID REFERENCES members(id),
  target_email TEXT NOT NULL,
  request_id UUID REFERENCES reference_requests(id) ON DELETE CASCADE,
  target_request_id UUID REFERENCES reference_requests(id),
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicione índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_user_connections_requester ON user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_target ON user_connections(target_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_request_id ON user_connections(request_id);

-- Comentários para documentação
COMMENT ON TABLE user_connections IS 'Conexões entre usuários baseadas em matches de referências';
COMMENT ON COLUMN user_connections.requester_id IS 'ID do usuário que solicitou a conexão';
COMMENT ON COLUMN user_connections.target_id IS 'ID do usuário alvo da solicitação';
COMMENT ON COLUMN user_connections.request_id IS 'ID da solicitação de referência do solicitante';
COMMENT ON COLUMN user_connections.target_request_id IS 'ID da solicitação de referência do alvo';
COMMENT ON COLUMN user_connections.status IS 'Status da conexão: pending, accepted, rejected';

-- Trigger para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_connections_updated_at
BEFORE UPDATE ON user_connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
