-- Função para obter o ID do membro atual baseado no usuário autenticado
CREATE OR REPLACE FUNCTION get_current_member_id()
RETURNS TABLE (id UUID) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Esta função usa SECURITY DEFINER para executar com privilégios elevados
  -- Assim podemos acessar o auth.uid() sem problemas de permissão
  RETURN QUERY
  SELECT m.id FROM members m
  WHERE m.email = current_user;
END;
$$;

-- Concede permissão para o role 'authenticated' executar esta função
GRANT EXECUTE ON FUNCTION get_current_member_id() TO authenticated;
