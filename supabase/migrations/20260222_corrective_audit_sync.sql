-- ==========================================================
-- AUDIT CORRECTION: Missing Tables & RLS Policies
-- Created at: 2026-02-22 (Audit Sync)
-- ==========================================================

-- 1. Tabela de Perguntas (Pergunte a um Cientista)
CREATE TABLE IF NOT EXISTS public.perguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'respondida')),
    respondido_por TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;

-- Políticas Perguntas
DROP POLICY IF EXISTS "Perguntas respondidas são públicas" ON public.perguntas;
CREATE POLICY "Perguntas respondidas são públicas" 
    ON public.perguntas FOR SELECT 
    USING (status = 'respondida' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Qualquer um pode enviar perguntas" ON public.perguntas;
CREATE POLICY "Qualquer um pode enviar perguntas" 
    ON public.perguntas FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins gerenciam perguntas" ON public.perguntas;
CREATE POLICY "Admins gerenciam perguntas" 
    ON public.perguntas 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- 2. Tabela de Oportunidades (Palestras, Vagas, Eventos)
CREATE TABLE IF NOT EXISTS public.oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data TEXT NOT NULL,
    local TEXT NOT NULL,
    link TEXT,
    tipo TEXT NOT NULL, -- palestra, vaga, evento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;

-- Políticas Oportunidades
DROP POLICY IF EXISTS "Oportunidades são públicas" ON public.oportunidades;
CREATE POLICY "Oportunidades são públicas" 
    ON public.oportunidades FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admins gerenciam oportunidades" ON public.oportunidades;
CREATE POLICY "Admins gerenciam oportunidades" 
    ON public.oportunidades 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- 3. Tabela de Contatos (Suporte/Contato Geral)
CREATE TABLE IF NOT EXISTS public.contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    assunto TEXT,
    mensagem TEXT NOT NULL,
    status TEXT DEFAULT 'nova' CHECK (status IN ('nova', 'lida', 'arquivada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

-- Políticas Contatos
DROP POLICY IF EXISTS "Qualquer um pode enviar contato" ON public.contatos;
CREATE POLICY "Qualquer um pode enviar contato" 
    ON public.contatos FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins gerenciam contatos" ON public.contatos;
CREATE POLICY "Admins gerenciam contatos" 
    ON public.contatos 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 4. Inconsistência is_featured (Garantir que a coluna única seja is_featured)
-- Este passo já foi em parte abordado por 20260222_add_is_featured_column.sql
-- Mas garantimos aqui que o código deva usar is_featured.
