-- Versão 2.7 & 2.8: Gamificação, Analytics e Vizinhança
-- Local: supabase/migrations/newsqls/20260224_v27_v28_final.sql

-- 1. Gamificação: XP e Níveis
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- 2. Sistema de Badges (Medalhas)
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_svg TEXT, -- SVG leve para animações
    requirement_type TEXT, -- 'submissions', 'xp', 'reactions'
    requirement_threshold INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profile_badges (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_id, badge_id)
);

-- 3. Analytics: Heatmap do Mapa
CREATE TABLE IF NOT EXISTS public.map_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    interaction_type TEXT DEFAULT 'click',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Funções Atômicas: Cálculos de XP (Lei Suprema: Server-side)
CREATE OR REPLACE FUNCTION public.calculate_profile_xp()
RETURNS TRIGGER AS $$
DECLARE
    points INTEGER := 0;
BEGIN
    -- Definição de Pontos
    IF (TG_TABLE_NAME = 'submissions' AND NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado')) THEN
        points := 50;
    ELSIF (TG_TABLE_NAME = 'reactions' AND TG_OP = 'INSERT') THEN
        points := 5;
    ELSIF (TG_TABLE_NAME = 'kudos' AND TG_OP = 'INSERT') THEN
        points := 10;
    END IF;

    -- Update XP e Nível (Simples: 100 XP por nível)
    IF points > 0 THEN
        UPDATE public.profiles 
        SET xp = xp + points,
            level = floor((xp + points) / 100) + 1
        WHERE id = COALESCE(NEW.user_id, NEW.profile_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Triggers de XP
CREATE TRIGGER tr_xp_on_submission_approved
AFTER UPDATE OF status ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_xp();

CREATE TRIGGER tr_xp_on_reaction
AFTER INSERT ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_xp();

-- 6. RPC para Heatmap (Eficiência Analytics)
CREATE OR REPLACE FUNCTION public.get_map_heatmap()
RETURNS TABLE (building_id TEXT, click_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT m.building_id, COUNT(*) as click_count
    FROM public.map_interactions m
    GROUP BY m.building_id
    ORDER BY click_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
