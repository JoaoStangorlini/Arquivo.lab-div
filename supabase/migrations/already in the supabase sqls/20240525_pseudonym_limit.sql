-- ==========================================================
-- 🛡️ HUB DE COMUNICAÇÃO CIENTÍFICA - GOLDEN MASTER V3.0
-- Migração: 20240525_pseudonym_limit.sql
-- Objetivo: Limitar a 2 o número de pseudônimos ativos por usuário. 
-- Slots ocupados apenas por status 'pendente' ou 'aprovado'.
-- ==========================================================

-- 1. Função de Validação de Slots
CREATE OR REPLACE FUNCTION public.check_pseudonym_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Só valida se o novo registro (ou atualização) for use_pseudonym = true
    IF (NEW.use_pseudonym = true) THEN
        -- Conta submissões ativas (pendente/aprovado) com pseudônimo para o mesmo usuário
        -- Exclui o ID atual em caso de UPDATE para não contar a si mesmo
        SELECT count(id) INTO v_count 
        FROM public.submissions 
        WHERE user_id = NEW.user_id 
          AND use_pseudonym = true 
          AND status IN ('pendente', 'aprovado')
          AND (NEW.id IS NULL OR id <> NEW.id); -- ROBUST SLOT GUARD V3.3

        -- Se atingiu o limite de 2 slots ativos, barra a transação
        IF v_count >= 2 THEN
            RAISE EXCEPTION 'LIMITE_PSEUDONIMO_ATINGIDO';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger Atômico (BEFORE INSERT OR UPDATE)
DROP TRIGGER IF EXISTS tr_check_pseudonym_limit ON public.submissions;
CREATE TRIGGER tr_check_pseudonym_limit
    BEFORE INSERT OR UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.check_pseudonym_limit();

-- 3. Comentário de Auditoria
COMMENT ON FUNCTION public.check_pseudonym_limit() IS 'Enforces a limit of 2 active pseudonyms (pending/approved) per user.';
