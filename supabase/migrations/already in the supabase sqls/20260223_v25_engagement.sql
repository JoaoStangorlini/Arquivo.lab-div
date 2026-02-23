-- ==========================================================
-- VERSÃO 2.5 — ENGAJAMENTO E ACERVO PESSOAL (FINAL)
-- ==========================================================

-- 1. MODIFICAÇÕES EM SUBMISSIONS (CACHE ATÔMICO)
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS reactions_summary JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS kudos_total INTEGER DEFAULT 0;

-- 2. COLEÇÕES PRIVADAS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection_id, submission_id)
);

-- 3. REAÇÕES TEMÁTICAS
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- atom_blue, bulb_yellow, spark_red
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, user_id)
);

-- 4. FILA DE NOTIFICAÇÕES (SCALABILITY)
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. KUDOS E FOLLOWS
CREATE TABLE IF NOT EXISTS public.kudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tag_follows (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, tag_name)
);

-- 6. TRIGGERS DE ALTA PERFORMANCE (COUNTER CACHE ATÔMICO)

CREATE OR REPLACE FUNCTION update_reaction_summary_atomic()
RETURNS TRIGGER AS $$
DECLARE
    r_type TEXT;
    delta INTEGER;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        r_type := NEW.reaction_type;
        delta := 1;
        
        -- Garante atomicidade via UPDATE com jsonb_set e tratamento de nulos
        UPDATE public.submissions 
        SET reactions_summary = COALESCE(reactions_summary, '{}'::jsonb) || 
            jsonb_build_object(r_type, (COALESCE((reactions_summary->>r_type)::int, 0) + delta))
        WHERE id = NEW.submission_id;
        
    ELSIF (TG_OP = 'DELETE') THEN
        r_type := OLD.reaction_type;
        delta := -1;
        
        UPDATE public.submissions 
        SET reactions_summary = COALESCE(reactions_summary, '{}'::jsonb) || 
            jsonb_build_object(r_type, GREATEST((COALESCE((reactions_summary->>r_type)::int, 0) + delta), 0))
        WHERE id = OLD.submission_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reaction_change ON public.reactions;
CREATE TRIGGER on_reaction_change
    AFTER INSERT OR DELETE ON public.reactions
    FOR EACH ROW EXECUTE PROCEDURE update_reaction_summary_atomic();

-- Trigger para Fila de Kudos (Escalabilidade)
CREATE OR REPLACE FUNCTION enqueue_kudos_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Insere na fila para processamento assíncrono (Edge Function / Cron)
    INSERT INTO public.notification_queue (type, payload)
    VALUES ('kudos', jsonb_build_object(
        'receiver_id', NEW.receiver_id, 
        'sender_id', NEW.sender_id,
        'submission_id', NEW.submission_id
    ));
    
    -- Incrementa total de kudos no cache do autor/submissão
    UPDATE public.submissions SET kudos_total = kudos_total + NEW.weight WHERE id = NEW.submission_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_kudos_insert ON public.kudos;
CREATE TRIGGER on_kudos_insert
    AFTER INSERT ON public.kudos
    FOR EACH ROW EXECUTE PROCEDURE enqueue_kudos_notification();

-- 7. SEGURANÇA (RLS FINAL)

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_follows ENABLE ROW LEVEL SECURITY;

-- Collections: Privadas por padrão
CREATE POLICY "Users can manage their own collections" ON public.collections
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable by everyone" ON public.collections
    FOR SELECT USING (is_private = false);

-- Reações
CREATE POLICY "Users can manage their own reactions" ON public.reactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reactions are viewable by everyone" ON public.reactions
    FOR SELECT USING (true);

-- Notificações: Privadíssimas
CREATE POLICY "Users can view and update their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tags
CREATE POLICY "Users can manage their own tag follows" ON public.tag_follows
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. REPUTAÇÃO E RANKING (STABLE FUNCTION)
CREATE OR REPLACE FUNCTION get_author_reputation(author_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_reputation INTEGER;
BEGIN
    SELECT 
        (COALESCE(SUM(kudos_total), 0) * 10) + (COALESCE(SUM(views), 0) / 100)
    INTO total_reputation
    FROM public.submissions 
    WHERE user_id = author_id;
    
    RETURN total_reputation;
END;
$$ LANGUAGE plpgsql STABLE;
