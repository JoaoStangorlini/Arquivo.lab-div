-- Script to add missing disciplines identified from JupiterWeb screenshots
-- Preserving idempotency with ON CONFLICT DO NOTHING

INSERT INTO learning_trails (
    course_code, 
    title, 
    description,
    credits_aula, 
    credits_trabalho, 
    category, 
    category_map, 
    axis,
    status
) VALUES 
-- IEE Courses
(
    'IEE0003', 
    'Aplicações da Energia Solar Térmica',
    'Disciplina aborda os princípios físicos da conversão de energia solar e suas aplicações técnicas em sistemas térmicos.',
    2, 
    1, 
    'livre', 
    '{"bacharelado": "livre", "licenciatura": "livre", "fisica_medica": "livre"}'::jsonb,
    'comum',
    'estavel'
),
(
    'IEE0004', 
    'Aplicações da Energia Solar Fotovoltaica',
    'Disciplina focada em semicondutores e painéis fotovoltaicos, explorando a física do estado sólido aplicada à conversão de energia.',
    2, 
    1, 
    'livre', 
    '{"bacharelado": "livre", "licenciatura": "livre", "fisica_medica": "livre"}'::jsonb,
    'comum',
    'estavel'
),
-- MAC
(
    'MAC0115', 
    'Introdução à Computação para Ciências Exatas e Tecnologia',
    'Introdução à programação com linguagens e algoritmos essenciais para alunos da área de ciências exatas, com foco no paradigma estruturado/procedural.',
    4, 
    0, 
    'obrigatoria', 
    '{"bacharelado": "obrigatoria", "licenciatura": "obrigatoria", "fisica_medica": "obrigatoria"}'::jsonb,
    'comum',
    'estavel'
),
-- Astronomia
(
    'AGA0105', 
    'Astronomia de Posição',
    'Estudo dos sistemas de coordenadas celestes, movimentos aparentes dos astros, determinação de tempo e posições geográficas.',
    4, 
    0, 
    'eletiva', 
    '{"bacharelado": "eletiva", "licenciatura": "eletiva", "fisica_medica": "eletiva"}'::jsonb,
    'comum',
    'estavel'
),
-- Física (Processos Criativos)
(
    '4300220', 
    'Processos Criativos em Ciências: da Imaginação à Divulgação Científica',
    'Exploração do papel da criatividade, intuição e imaginação metodológica na ciência, com ênfase nas práticas de comunicação e divulgação dos conceitos científicos.',
    4, 
    0, 
    'eletiva', 
    '{"bacharelado": "eletiva", "licenciatura": "eletiva", "fisica_medica": "eletiva"}'::jsonb,
    'comum',
    'estavel'
),
-- Educação (Licenciatura Focus mas disponíveis Eletivas FEUSP)
(
    'EDF0285', 
    'Introdução aos Estudos da Educação: Enfoque Filosófico',
    'Fundamentos filosóficos históricos da educação brasileira, analisando as correntes de pensamento e as transformações da práxis socioeducacional.',
    4, 
    0, 
    'eletiva', 
    '{"bacharelado": "livre", "licenciatura": "obrigatoria", "fisica_medica": "livre"}'::jsonb,
    'lic',
    'estavel'
),
(
    'EDF0287', 
    'Introdução aos Estudos da Educação: Enfoque Histórico',
    'Análise histórica das instituições, sistemas formativos e cultura escolar com base nas etapas do desenvolvimento da Educação brasileira e mundial.',
    4, 
    0, 
    'eletiva', 
    '{"bacharelado": "livre", "licenciatura": "obrigatoria", "fisica_medica": "livre"}'::jsonb,
    'lic',
    'estavel'
),
(
    'EDF0289', 
    'Introdução aos Estudos da Educação: Enfoque Sociológico',
    'Sociologia aplicada à Educação. Estudo das estruturas sistêmicas, diversidade, igualdade material e o papel do Estado na formação didática e cidadã.',
    4, 
    0, 
    'eletiva', 
    '{"bacharelado": "livre", "licenciatura": "obrigatoria", "fisica_medica": "livre"}'::jsonb,
    'lic',
    'estavel'
)
ON CONFLICT (course_code) 
DO UPDATE SET 
    title = EXCLUDED.title,
    credits_aula = EXCLUDED.credits_aula,
    credits_trabalho = EXCLUDED.credits_trabalho,
    category = EXCLUDED.category,
    category_map = EXCLUDED.category_map,
    axis = EXCLUDED.axis;
