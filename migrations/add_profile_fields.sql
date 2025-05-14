-- Adicionar campos de redes sociais
ALTER TABLE IF EXISTS public.members 
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT;

-- Adicionar campos de endereço completo
ALTER TABLE IF EXISTS public.members 
ADD COLUMN IF NOT EXISTS zipcode TEXT,
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS street_number TEXT,
ADD COLUMN IF NOT EXISTS complement TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS state VARCHAR(2);

-- Comentário para os novos campos
COMMENT ON COLUMN public.members.linkedin IS 'Perfil do LinkedIn do membro';
COMMENT ON COLUMN public.members.instagram IS 'Perfil do Instagram do membro';
COMMENT ON COLUMN public.members.facebook IS 'Perfil do Facebook do membro';
COMMENT ON COLUMN public.members.zipcode IS 'CEP do endereço do membro';
COMMENT ON COLUMN public.members.street IS 'Logradouro do endereço do membro';
COMMENT ON COLUMN public.members.street_number IS 'Número do endereço do membro';
COMMENT ON COLUMN public.members.complement IS 'Complemento do endereço do membro';
COMMENT ON COLUMN public.members.neighborhood IS 'Bairro do endereço do membro';
COMMENT ON COLUMN public.members.state IS 'UF do estado do membro';
