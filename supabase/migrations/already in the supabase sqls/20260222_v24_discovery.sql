-- ==========================================================
-- MIGRATION: 20260222_v24_discovery.sql
-- VERSÃO 2.4 - DESCOBERTA E CONTEXTO HISTÓRICO
-- ==========================================================

-- 1. EXTENSÕES PARA BUSCA AVANÇADA E GEOMETRIA
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. NOVAS COLUNAS EM SUBMISSIONS (TIMELINE + MAPA)
-- event_date: Data física/histórica do registro (independente do created_at)
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS location_lat DECIMAL(9,6);
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS location_lng DECIMAL(9,6);
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS location_name TEXT;

-- 3. TABELA DE HISTÓRICO DE LEITURA (PERFORMANCE OPTIMIZED)
CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

-- 4. ÍNDICES DE PERFORMANCE (VITAL PARA FILTROS E BUSCA)

-- Timeline: Ordenação cronológica histórica indexada (B-Tree focado em mídias datadas)
CREATE INDEX IF NOT EXISTS idx_submissions_event_date 
ON public.submissions (event_date DESC)
WHERE status = 'aprovado' AND event_date IS NOT NULL;

-- Mapa: Indexação espacial básica para Pins (B-Tree)
CREATE INDEX IF NOT EXISTS idx_submissions_geo 
ON public.submissions (location_lat, location_lng)
WHERE location_lat IS NOT NULL AND status = 'aprovado';

-- Busca por Tags: GIN Index para queries ultra-rápidas com @> (contains)
CREATE INDEX IF NOT EXISTS idx_submissions_tags_gin 
ON public.submissions USING GIN (tags);

-- Busca por Autor: Performance com Trigram para buscas parciais/fuzzy (GIST)
CREATE INDEX IF NOT EXISTS idx_submissions_authors_fuzzy 
ON public.submissions USING GIST (authors gist_trgm_ops);

-- Histórico: Busca ultrarápida por sessão do usuário (B-Tree)
CREATE INDEX IF NOT EXISTS idx_reading_history_user_lookup 
ON public.reading_history (user_id, last_accessed_at DESC);

-- 5. SEGURANÇA (RLS)
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- Política restritiva: Usuário só vê e altera o PRÓPRIO histórico
DROP POLICY IF EXISTS "Users can manage their own reading history" ON public.reading_history;
CREATE POLICY "Users can manage their own reading history" ON public.reading_history
    FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- 6. FUNÇÃO RPC PARA AUTOCOMPLETE (RIGOROSAMENTE OTIMIZADA)
-- Implementa busca conjunta em Tags e Títulos com ranking por views
CREATE OR REPLACE FUNCTION public.search_autocomplete(search_term TEXT)
RETURNS TABLE (suggestion TEXT, type TEXT) AS $$
BEGIN
    RETURN QUERY
    (
        -- Sugestões de Tags (Busca indexada GIN)
        -- Usamos similarity ou ilike dependendo da necessidade, 
        -- mas para performance em tags GIN é melhor
        SELECT DISTINCT s.tag, 'tag' as type
        FROM (SELECT UNNEST(tags) as tag FROM public.submissions WHERE status = 'aprovado') s
        WHERE s.tag ILIKE search_term || '%'
        LIMIT 4
    )
    UNION ALL
    (
        -- Sugestões de Títulos (Busca parcial indexada por Trigram)
        SELECT title as suggestion, 'title' as type
        FROM public.submissions
        WHERE status = 'aprovado' AND title ILIKE '%' || search_term || '%'
        ORDER BY views DESC
        LIMIT 4
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
