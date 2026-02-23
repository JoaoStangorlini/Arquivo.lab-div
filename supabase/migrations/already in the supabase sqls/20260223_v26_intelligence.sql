-- Versão 2.6: Inteligência & Automação Admin
-- Local: C:\Users\Stangorlini\.gemini\antigravity\scratch\if-usp-ciencia\supabase\migrations\newsqls\20260223_v26_intelligence.sql

-- 1. Adição de Colunas para Inteligência Artificial
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS ocr_content TEXT,
ADD COLUMN IF NOT EXISTS ai_suggested_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_suggested_alt TEXT,
ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'completed', 'error')),
ADD COLUMN IF NOT EXISTS ai_last_processed TIMESTAMPTZ;

-- 2. Função para Merge Inteligente de Tags (Human-in-the-loop)
CREATE OR REPLACE FUNCTION public.accept_ai_suggestions(submission_id UUID)
RETURNS VOID AS $$
DECLARE
    suggested_tags JSONB;
    current_tags TEXT[];
BEGIN
    -- Busca sugestões e tags atuais
    SELECT ai_suggested_tags, tags INTO suggested_tags, current_tags
    FROM public.submissions
    WHERE id = submission_id;

    -- Converte JSONB array para TEXT[] e une com as atuais removendo duplicatas
    UPDATE public.submissions
    SET 
        tags = (
            SELECT ARRAY_AGG(DISTINCT t)
            FROM (
                SELECT UNNEST(current_tags) AS t
                UNION
                SELECT UNNEST(ARRAY(SELECT jsonb_array_elements_text(suggested_tags))) AS t
            ) AS combined_tags
        ),
        alt_text = COALESCE(ai_suggested_alt, alt_text), -- Aceita alt_text se existir
        ai_suggested_tags = '[]'::jsonb,
        ai_suggested_alt = NULL
    WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função em Massa (Bulk) para Aceitação Atômica
CREATE OR REPLACE FUNCTION public.accept_ai_suggestions_bulk(submission_ids UUID[])
RETURNS VOID AS $$
BEGIN
    -- Atualiza todos os registros em uma única transação
    UPDATE public.submissions
    SET 
        tags = (
            SELECT ARRAY_AGG(DISTINCT t)
            FROM (
                SELECT UNNEST(tags) AS t
                UNION
                SELECT UNNEST(ARRAY(SELECT jsonb_array_elements_text(ai_suggested_tags))) AS t
            ) AS combined_tags
        ),
        alt_text = COALESCE(ai_suggested_alt, alt_text),
        ai_suggested_tags = '[]'::jsonb,
        ai_suggested_alt = NULL
    WHERE id = ANY(submission_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.submissions.ai_status IS 'Estado do processamento de IA (pendente, processando, concluído, erro)';
COMMENT ON COLUMN public.submissions.ai_suggested_tags IS 'Buffer de sugestões de tags geradas por IA (Aguardando aprovação humana)';
