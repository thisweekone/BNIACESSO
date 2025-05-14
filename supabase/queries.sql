-- Inserir um membro (apenas se não existir)
INSERT INTO members (name, specialty, city, bio, email, phone, website)
SELECT 
    'João Silva',
    'Marketing Digital',
    'São Paulo, SP',
    'Especialista em marketing digital com mais de 10 anos de experiência.',
    'joao.silva@email.com',
    '(11) 99999-9999',
    'www.joaosilva.com.br'
WHERE NOT EXISTS (
    SELECT 1 FROM members WHERE email = 'joao.silva@email.com'
);

-- Inserir serviços (apenas se não existirem)
INSERT INTO services (name, description)
SELECT name, description
FROM (VALUES 
    ('Consultoria em Marketing Digital', 'Estratégias personalizadas para seu negócio'),
    ('Gestão de Mídias Sociais', 'Gestão completa das suas redes sociais'),
    ('SEO e Otimização', 'Melhore seu posicionamento nos buscadores'),
    ('Desenvolvimento Web', 'Criação de sites e aplicações web'),
    ('Design Gráfico', 'Criação de identidade visual e materiais gráficos'),
    ('Consultoria Financeira', 'Análise e planejamento financeiro'),
    ('Gestão de Projetos', 'Planejamento e execução de projetos'),
    ('Recursos Humanos', 'Gestão de pessoas e processos de RH')
) AS new_services(name, description)
WHERE NOT EXISTS (
    SELECT 1 FROM services s WHERE s.name = new_services.name
);

-- Inserir tags (apenas se não existirem)
INSERT INTO tags (name)
SELECT name
FROM (VALUES 
    ('Marketing'),
    ('Digital'),
    ('SEO'),
    ('Redes Sociais'),
    ('Tecnologia'),
    ('Design'),
    ('Finanças'),
    ('Gestão'),
    ('RH'),
    ('Desenvolvimento'),
    ('Web'),
    ('Mobile')
) AS new_tags(name)
WHERE NOT EXISTS (
    SELECT 1 FROM tags t WHERE t.name = new_tags.name
);

-- Associar serviços ao membro (apenas se não existir)
INSERT INTO member_services (member_id, service_id)
SELECT 
    (SELECT id FROM members WHERE email = 'joao.silva@email.com'),
    s.id
FROM services s
WHERE NOT EXISTS (
    SELECT 1 FROM member_services ms 
    WHERE ms.member_id = (SELECT id FROM members WHERE email = 'joao.silva@email.com')
    AND ms.service_id = s.id
);

-- Associar tags ao membro (apenas se não existir)
INSERT INTO member_tags (member_id, tag_id)
SELECT 
    (SELECT id FROM members WHERE email = 'joao.silva@email.com'),
    t.id
FROM tags t
WHERE NOT EXISTS (
    SELECT 1 FROM member_tags mt 
    WHERE mt.member_id = (SELECT id FROM members WHERE email = 'joao.silva@email.com')
    AND mt.tag_id = t.id
);

-- Inserir uma referência
INSERT INTO member_references (
    type,
    status,
    description,
    value,
    date,
    giver_id,
    receiver_id
)
VALUES (
    'given',
    'completed',
    'Excelente profissional, ajudou muito no crescimento do meu negócio',
    5000.00,
    CURRENT_DATE,
    (SELECT id FROM members WHERE email = 'joao.silva@email.com'),
    (SELECT id FROM members WHERE email = 'joao.silva@email.com')
);

-- Inserir mais membros (apenas se não existirem)
INSERT INTO members (name, specialty, city, bio, email, phone, website)
SELECT name, specialty, city, bio, email, phone, website
FROM (VALUES 
    ('Maria Santos', 'Desenvolvimento Web', 'Rio de Janeiro, RJ', 'Desenvolvedora full-stack com foco em React e Node.js', 'maria.santos@email.com', '(21) 98888-8888', 'www.mariasantos.com.br'),
    ('Pedro Oliveira', 'Design Gráfico', 'Belo Horizonte, MG', 'Designer especializado em branding e identidade visual', 'pedro.oliveira@email.com', '(31) 97777-7777', 'www.pedrodesign.com.br'),
    ('Ana Costa', 'Consultoria Financeira', 'Curitiba, PR', 'Consultora financeira com experiência em planejamento estratégico', 'ana.costa@email.com', '(41) 96666-6666', 'www.anacosta.com.br'),
    ('Carlos Mendes', 'Gestão de Projetos', 'Porto Alegre, RS', 'Gerente de projetos certificado PMP', 'carlos.mendes@email.com', '(51) 95555-5555', 'www.carlosmendes.com.br'),
    ('Juliana Lima', 'Recursos Humanos', 'Salvador, BA', 'Especialista em gestão de pessoas e desenvolvimento organizacional', 'juliana.lima@email.com', '(71) 94444-4444', 'www.julianalima.com.br')
) AS new_members(name, specialty, city, bio, email, phone, website)
WHERE NOT EXISTS (
    SELECT 1 FROM members m WHERE m.email = new_members.email
);

-- Associar serviços aos novos membros (apenas se não existirem)
INSERT INTO member_services (member_id, service_id)
SELECT 
    m.id,
    s.id
FROM members m
CROSS JOIN services s
WHERE m.email IN ('maria.santos@email.com', 'pedro.oliveira@email.com', 'ana.costa@email.com', 'carlos.mendes@email.com', 'juliana.lima@email.com')
AND s.name IN ('Desenvolvimento Web', 'Design Gráfico', 'Consultoria Financeira', 'Gestão de Projetos', 'Recursos Humanos')
AND NOT EXISTS (
    SELECT 1 FROM member_services ms 
    WHERE ms.member_id = m.id AND ms.service_id = s.id
);

-- Associar tags aos novos membros (apenas se não existirem)
INSERT INTO member_tags (member_id, tag_id)
SELECT 
    m.id,
    t.id
FROM members m
CROSS JOIN tags t
WHERE m.email IN ('maria.santos@email.com', 'pedro.oliveira@email.com', 'ana.costa@email.com', 'carlos.mendes@email.com', 'juliana.lima@email.com')
AND (
    (m.email = 'maria.santos@email.com' AND t.name IN ('Tecnologia', 'Desenvolvimento', 'Web'))
    OR (m.email = 'pedro.oliveira@email.com' AND t.name IN ('Design', 'Web'))
    OR (m.email = 'ana.costa@email.com' AND t.name IN ('Finanças', 'Gestão'))
    OR (m.email = 'carlos.mendes@email.com' AND t.name IN ('Gestão', 'Projetos'))
    OR (m.email = 'juliana.lima@email.com' AND t.name IN ('RH', 'Gestão'))
)
AND NOT EXISTS (
    SELECT 1 FROM member_tags mt 
    WHERE mt.member_id = m.id AND mt.tag_id = t.id
);

-- Inserir mais referências (apenas se não existirem)
INSERT INTO member_references (type, status, description, value, date, giver_id, receiver_id)
SELECT 
    CASE WHEN random() < 0.5 THEN 'given' ELSE 'received' END,
    CASE WHEN random() < 0.7 THEN 'completed' ELSE 'pending' END,
    'Excelente profissional, recomendo!',
    (random() * 10000)::numeric(10,2),
    CURRENT_DATE - (random() * 365)::integer,
    m1.id,
    m2.id
FROM members m1
CROSS JOIN members m2
WHERE m1.id != m2.id
AND NOT EXISTS (
    SELECT 1 FROM member_references mr 
    WHERE mr.giver_id = m1.id AND mr.receiver_id = m2.id
)
LIMIT 20;

-- Consultas de exemplo:

-- Buscar todos os membros
SELECT * FROM members;

-- Buscar membros com seus serviços
SELECT 
    m.name,
    m.specialty,
    s.name as service
FROM members m
JOIN member_services ms ON m.id = ms.member_id
JOIN services s ON ms.service_id = s.id;

-- Buscar membros com suas tags
SELECT 
    m.name,
    t.name as tag
FROM members m
JOIN member_tags mt ON m.id = mt.member_id
JOIN tags t ON mt.tag_id = t.id;

-- Buscar referências de um membro
SELECT 
    mr.description,
    mr.value,
    mr.date,
    mr.status,
    giver.name as giver_name,
    receiver.name as receiver_name
FROM member_references mr
JOIN members giver ON mr.giver_id = giver.id
JOIN members receiver ON mr.receiver_id = receiver.id
WHERE mr.giver_id = (SELECT id FROM members WHERE email = 'joao.silva@email.com')
   OR mr.receiver_id = (SELECT id FROM members WHERE email = 'joao.silva@email.com');

-- Estatísticas de referências por membro
SELECT 
    m.name,
    COUNT(CASE WHEN mr.type = 'given' THEN 1 END) as references_given,
    COUNT(CASE WHEN mr.type = 'received' THEN 1 END) as references_received,
    SUM(CASE WHEN mr.type = 'given' THEN mr.value ELSE 0 END) as total_given,
    SUM(CASE WHEN mr.type = 'received' THEN mr.value ELSE 0 END) as total_received
FROM members m
LEFT JOIN member_references mr ON m.id = mr.giver_id OR m.id = mr.receiver_id
GROUP BY m.id, m.name;

-- Consulta para listar membros com filtros
SELECT 
    m.id,
    m.name,
    m.specialty,
    m.city,
    m.email,
    m.phone,
    m.website,
    m.bio,
    array_agg(DISTINCT s.name) as services,
    array_agg(DISTINCT t.name) as tags,
    COUNT(DISTINCT CASE WHEN mr.type = 'given' THEN mr.id END) as references_given,
    COUNT(DISTINCT CASE WHEN mr.type = 'received' THEN mr.id END) as references_received,
    COALESCE(SUM(CASE WHEN mr.type = 'given' THEN mr.value ELSE 0 END), 0) as total_given,
    COALESCE(SUM(CASE WHEN mr.type = 'received' THEN mr.value ELSE 0 END), 0) as total_received
FROM members m
LEFT JOIN member_services ms ON m.id = ms.member_id
LEFT JOIN services s ON ms.service_id = s.id
LEFT JOIN member_tags mt ON m.id = mt.member_id
LEFT JOIN tags t ON mt.tag_id = t.id
LEFT JOIN member_references mr ON m.id = mr.giver_id OR m.id = mr.receiver_id
GROUP BY m.id, m.name, m.specialty, m.city, m.email, m.phone, m.website, m.bio; 