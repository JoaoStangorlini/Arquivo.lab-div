-- Plano de Estabilização V4: Integridade Atômica e Desacoplamento
-- Atualização: Suporte a decremento atômico e prevenção de race conditions

-- 1. Função Atômica para Gerenciamento de Reações (Incremento/Decremento)
CREATE OR REPLACE FUNCTION public.update_reaction_summary_atomic()
RETURNS TRIGGER AS $$
DECLARE
    r_type TEXT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        r_type := NEW.type;
        UPDATE public.submissions 
        SET reactions_summary = COALESCE(reactions_summary, '{}'::jsonb) || 
            jsonb_build_object(r_type, (COALESCE((reactions_summary->>r_type)::int, 0) + 1))
        WHERE id = NEW.submission_id;
    ELSIF (TG_OP = 'DELETE') THEN
        r_type := OLD.type;
        UPDATE public.submissions 
        SET reactions_summary = reactions_summary || 
            jsonb_build_object(r_type, GREATEST(0, (COALESCE((reactions_summary->>r_type)::int, 0) - 1)))
        WHERE id = OLD.submission_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Handle type switching
        IF NEW.type <> OLD.type THEN
            -- Decrement old
            UPDATE public.submissions 
            SET reactions_summary = reactions_summary || 
                jsonb_build_object(OLD.type, GREATEST(0, (COALESCE((reactions_summary->>OLD.type)::int, 0) - 1)))
            WHERE id = OLD.submission_id;
            -- Increment new
            UPDATE public.submissions 
            SET reactions_summary = reactions_summary || 
                jsonb_build_object(NEW.type, (COALESCE((reactions_summary->>NEW.type)::int, 0) + 1))
            WHERE id = NEW.submission_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Recriação do Trigger de Reações
DROP TRIGGER IF EXISTS tr_update_reaction_summary ON public.reactions;
CREATE TRIGGER tr_update_reaction_summary
AFTER INSERT OR DELETE OR UPDATE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.update_reaction_summary_atomic();

-- 3. Blindagem de RLS para Coleções (V4 - 404 Behavior Simulation)
-- Nota: O Supabase retorna 404 por padrão quando políticas de SELECT não batem em consultas de linha única.
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coleções privadas são invisíveis" ON public.collections;
CREATE POLICY "Coleções privadas são invisíveis" 
ON public.collections 
FOR SELECT 
USING (
  (is_private = false) OR 
  (auth.uid() = user_id)
);

-- 4. Otimização da Fila de Notificações
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
