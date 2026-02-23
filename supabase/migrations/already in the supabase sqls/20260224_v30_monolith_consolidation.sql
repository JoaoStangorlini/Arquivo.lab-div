-- ==========================================================
-- V3.0 ULTIMATE GREEN MASTER MONOLITH
-- Local: supabase/migrations/newsqls/20260224_v30_monolith_consolidation.sql
-- ==========================================================

-- 1. ESTRUTURA DE DADOS (GAMIFICAÇÃO & ANALYTICS)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_svg TEXT,
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

CREATE TABLE IF NOT EXISTS public.map_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    interaction_type TEXT DEFAULT 'click',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HARDENING V3.0: SHADOW QUOTA TABLE (LOCK-FREE THROTTLING)
-- Tabela leve para controle de rate-limit sem lockar a tabela de perfis.
CREATE TABLE IF NOT EXISTS public.kudos_quota_logs (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL,
    action_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kudos_quota_profile_time ON public.kudos_quota_logs (profile_id, action_at);

-- Limpeza automática (Manutenção de 24h)
CREATE OR REPLACE FUNCTION public.prune_kudos_logs() 
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.kudos_quota_logs WHERE action_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ANONIMIZAÇÃO NATIVA (PRIVACIDADE SUPREMA)
CREATE OR REPLACE FUNCTION public.tr_anonymize_map_interaction()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id := NULL; -- Force anonymity at DB level
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_force_anonymity_map ON public.map_interactions;
CREATE TRIGGER tr_force_anonymity_map
BEFORE INSERT ON public.map_interactions
FOR EACH ROW EXECUTE FUNCTION public.tr_anonymize_map_interaction();

-- 4. ENGINE DE XP V3.0 (DECOUPLED & HARDENED)
CREATE OR REPLACE FUNCTION public.calculate_profile_xp()
RETURNS TRIGGER AS $$
DECLARE
    points INTEGER := 0;
    v_profile_id UUID;
    v_recent_quota_count INTEGER;
BEGIN
    v_profile_id := COALESCE(NEW.user_id, NEW.profile_id);

    IF (TG_TABLE_NAME = 'submissions' AND NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado')) THEN
        points := 50;
    ELSIF (TG_TABLE_NAME = 'reactions' AND TG_OP = 'INSERT') THEN
        points := 5;
    ELSIF (TG_TABLE_NAME = 'kudos' AND TG_OP = 'INSERT') THEN
        -- Hardening: Rate Limiting via Shadow Table (Decoupled)
        SELECT COUNT(*) INTO v_recent_quota_count
        FROM public.kudos_quota_logs
        WHERE profile_id = v_profile_id AND action_at > NOW() - INTERVAL '1 hour';
        
        IF v_recent_quota_count < 10 THEN
            points := 10;
            -- Registra o log de cota de forma rápida
            INSERT INTO public.kudos_quota_logs (profile_id) VALUES (v_profile_id);
        ELSE
            points := 0;
        END IF;
    END IF;

    -- Update XP e Nível (Index-optimized)
    IF points > 0 THEN
        UPDATE public.profiles 
        SET xp = xp + points,
            level = floor((xp + points) / 100) + 1
        WHERE id = v_profile_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reinstate Triggers
DROP TRIGGER IF EXISTS tr_xp_on_submission_approved ON public.submissions;
CREATE TRIGGER tr_xp_on_submission_approved
AFTER UPDATE OF status ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_xp();

DROP TRIGGER IF EXISTS tr_xp_on_reaction ON public.reactions;
CREATE TRIGGER tr_xp_on_reaction
AFTER INSERT ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_xp();

DROP TRIGGER IF EXISTS tr_xp_on_kudos ON public.kudos;
CREATE TRIGGER tr_xp_on_kudos
AFTER INSERT ON public.kudos
FOR EACH ROW EXECUTE FUNCTION public.calculate_profile_xp();

-- 5. PERFORMANCE: INDEX-ONLY SCANS (B-TREE + INCLUDE)
-- Em vez de BRIN, usamos Covering Indexes para tabelas de média escala.
CREATE INDEX IF NOT EXISTS idx_submissions_main_search 
ON public.submissions (created_at DESC) 
INCLUDE (title, authors, media_type, category);

CREATE INDEX IF NOT EXISTS idx_map_interactions_agg 
ON public.map_interactions (building_id) 
INCLUDE (interaction_type);

CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard 
ON public.profiles (xp DESC) 
INCLUDE (full_name, avatar_url, level);

-- 6. ANALYTICS: RPC HEATMAP EFICIENTE
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
