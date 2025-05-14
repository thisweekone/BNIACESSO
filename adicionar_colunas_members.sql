-- Script para adicionar as colunas 'company' e 'tags' à tabela 'members'

-- Adicionar coluna 'company' para armazenar o nome da empresa
ALTER TABLE members
ADD COLUMN IF NOT EXISTS company VARCHAR(255);

-- Adicionar coluna 'tags' para armazenar as tags do membro (como um array)
ALTER TABLE members
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Comentários das colunas
COMMENT ON COLUMN members.company IS 'Nome da empresa ou negócio do membro';
COMMENT ON COLUMN members.tags IS 'Array de tags associadas ao membro para facilitar busca e categorização';
