-- Criar tabela member_services se ela não existir
CREATE TABLE IF NOT EXISTS public.member_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL,
    service_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_member_id FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE
);

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_member_services_member_id ON public.member_services(member_id);

-- Comentários para documentação
COMMENT ON TABLE public.member_services IS 'Serviços oferecidos pelos membros';
COMMENT ON COLUMN public.member_services.member_id IS 'ID do membro que oferece o serviço';
COMMENT ON COLUMN public.member_services.service_name IS 'Nome do serviço oferecido';
COMMENT ON COLUMN public.member_services.created_at IS 'Data de criação do registro';
