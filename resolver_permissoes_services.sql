-- Script para garantir que a tabela 'services' tenha as permissões corretas
-- Execute este script no SQL Editor do Supabase

-- Verificar quantos serviços existem na tabela (para debug)
SELECT COUNT(*) FROM services;

-- Garantir que o acesso anônimo à tabela services esteja habilitado para leitura
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Criar política que permite a leitura dos serviços para qualquer usuário autenticado
DROP POLICY IF EXISTS "Permitir leitura de serviços para usuários autenticados" ON services;
CREATE POLICY "Permitir leitura de serviços para usuários autenticados" 
ON services FOR SELECT 
TO authenticated
USING (true);

-- Política para permitir que administradores inserir, atualizar e excluir serviços
DROP POLICY IF EXISTS "Somente admins podem manipular serviços" ON services;
CREATE POLICY "Somente admins podem manipular serviços" 
ON services FOR ALL 
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admins));

-- Se a tabela admins não existir, podemos criar uma temporariamente ou usar outra estratégia
-- Abaixo está uma solução alternativa que permite que apenas o serviço acesse os dados, sem exigir a tabela admins

DROP POLICY IF EXISTS "Service role pode manipular todos os serviços" ON services;
CREATE POLICY "Service role pode manipular todos os serviços" 
ON services FOR ALL 
TO service_role
USING (true);

-- Política que permite leitura mesmo para usuários não autenticados (se necessário)
DROP POLICY IF EXISTS "Acesso público somente leitura" ON services;
CREATE POLICY "Acesso público somente leitura" 
ON services FOR SELECT 
TO anon
USING (true);
