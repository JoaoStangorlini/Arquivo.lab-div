-- ==========================================================
-- 🛡️ HUB DE COMUNICAÇÃO CIENTÍFICA - GOLDEN MASTER V3.6
-- Migração: v26_final_trigger.sql
-- Objetivo: Proteção Atômica contra o "Status Shift Bug"
-- Permite edições (Self-Edit) sem disparar o limite falso.
-- ==========================================================

CREATE OR REPLACE FUNCTION public.check_pseudonym_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Só valida se a submissão resultar em (use_pseudonym = true) 
    -- e estiver em estado ativo (pendente/aprovado)
    IF (NEW.use_pseudonym = true AND NEW.status IN ('pendente', 'aprovado')) THEN
        
        -- Contagem Atômica:
        -- 1. Pertence ao mesmo usuário
        -- 2. Usa pseudônimo
        -- 3. Está ativa (pendente/aprovado)
        -- 4. NÃO é o registro atual (Self-Edit Guard)
        SELECT count(id) INTO v_count 
        FROM public.submissions 
        WHERE user_id = NEW.user_id 
          AND use_pseudonym = true 
          AND status IN ('pendente', 'aprovado')
          AND (NEW.id IS NULL OR id <> NEW.id); -- 🛡️ ATOMIC SELF-EDIT GUARD

        -- Bloqueio se o limite de 2 slots ativos for excedido
        IF v_count >= 2 THEN
            RAISE EXCEPTION 'LIMITE_PSEUDONIMO_ATINGIDO';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-vincula o trigger (Garante aplicação da lógica V3.6)
DROP TRIGGER IF EXISTS tr_check_pseudonym_limit ON public.submissions;
CREATE TRIGGER tr_check_pseudonym_limit
    BEFORE INSERT OR UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.check_pseudonym_limit();

COMMENT ON FUNCTION public.check_pseudonym_limit() IS 'Enforces a strict limit of 2 active pseudonyms per account, with self-edit resilience (V3.6).';
