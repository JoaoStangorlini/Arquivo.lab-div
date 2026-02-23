-- ==========================================================
-- V3.0 ULTIMATE GREEN MASTER: SQL HARDENING & LEVEL SYNC
-- ==========================================================

BEGIN;

-- 1. INFRAESTRUTURA DE HISTÓRICO
CREATE TABLE IF NOT EXISTS public.profiles_xp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_id UUID NOT NULL,
    points INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_xp_action UNIQUE (action_id)
);

-- Indexação para Performance O(log n)
CREATE INDEX IF NOT EXISTS idx_xp_history_profile_points ON public.profiles_xp_history (profile_id) INCLUDE (points);

-- 2. MIGRAÇÃO ATÔMICA E IDEMPOTENTE (LEVEL SYNC)
DO $$
DECLARE
    has_trigger BOOLEAN;
BEGIN
    -- Inspeção Dinâmica
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'profiles_xp_history' AND trigger_schema = 'public'
    ) INTO has_trigger;

    -- Inserção Retroativa (Submissões V2.4 - V2.6)
    WITH new_points AS (
        INSERT INTO public.profiles_xp_history (profile_id, action_id, points, action_type)
        SELECT user_id, id, 50, 'submission' 
        FROM public.submissions 
        WHERE status = 'aprovado'
        ON CONFLICT (action_id) DO NOTHING
        RETURNING profile_id, points
    )
    -- Sincronização de Nível (Apenas se não houver trigger automatizado)
    UPDATE public.profiles p 
    SET 
        xp = p.xp + np.total_points, 
        level = FLOOR((p.xp + np.total_points) / 100) + 1 
    FROM (SELECT profile_id, SUM(points) as total_points FROM new_points GROUP BY profile_id) np 
    WHERE p.id = np.profile_id AND NOT has_trigger;
END $$;

-- 3. HARDENING: SECURITY DEFINER & RLS BLINDAGEM
-- Refatoração da função Engine para garantir privilégios de sistema
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
        -- Hardening: Rate Limiting via Kudos Logs
        SELECT COUNT(*) INTO v_recent_quota_count
        FROM public.kudos_quota_logs
        WHERE profile_id = v_profile_id AND action_at > NOW() - INTERVAL '1 hour';
        
        IF v_recent_quota_count < 10 THEN
            points := 10;
            INSERT INTO public.kudos_quota_logs (profile_id) VALUES (v_profile_id);
        ELSE
            points := 0;
        END IF;
    END IF;

    -- Update Atômico com Level Sync (B-Tree Optimized)
    IF points > 0 THEN
        UPDATE public.profiles 
        SET xp = p.xp + points, -- Using explicit p. prefix is safer
            level = FLOOR((p.xp + points) / 100) + 1
        FROM public.profiles p -- Self-join for safer update in concurrent environments
        WHERE public.profiles.id = v_profile_id AND p.id = v_profile_id;
        
        -- Persistência no Histórico para Auditoria
        INSERT INTO public.profiles_xp_history (profile_id, action_id, points, action_type)
        VALUES (v_profile_id, NEW.id, points, TG_TABLE_NAME)
        ON CONFLICT (action_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. PERFORMANCE: B-TREE + INCLUDE (COVERING INDEXES)
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard_optimized 
ON public.profiles (xp DESC) 
INCLUDE (full_name, avatar_url, level);

COMMIT;
