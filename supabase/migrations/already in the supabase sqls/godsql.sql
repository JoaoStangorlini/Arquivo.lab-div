-- ==========================================================
-- THE GOD SQL v2.3.5 — HUB DE COMUNICAÇÃO CIENTÍFICA (IFUSP)
-- ==========================================================
-- Script 100% IDEMPOTENTE. Pode ser rodado múltiplas vezes
-- sem quebrar. Funciona em banco limpo ou já povoado.
-- Ctrl+A → Ctrl+C → Ctrl+V no Supabase SQL Editor.
-- ==========================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 1. EXTENSÕES                                            ║
-- ╚══════════════════════════════════════════════════════════╝
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 2. ENUMS (Criação segura)                               ║
-- ╚══════════════════════════════════════════════════════════╝
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado', 'deleted');
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx');
    END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 3. TABELAS (CREATE IF NOT EXISTS)                       ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    status submission_status DEFAULT 'pendente' NOT NULL,
    admin_feedback TEXT,
    whatsapp TEXT,
    external_link TEXT,
    technical_details TEXT,
    alt_text TEXT,
    testimonial TEXT,
    is_featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    reading_time INTEGER DEFAULT 0,
    co_author_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    inline_paragraph_id TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reproductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text_content TEXT,
    media_url TEXT,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_plays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('view', 'audio_play')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trail_submissions (
    trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (trail_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status submission_status DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fingerprint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT curtidas_submission_fingerprint_unique UNIQUE (submission_id, fingerprint)
);

CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_author TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_author)
);

CREATE TABLE IF NOT EXISTS public.corrections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    original_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'rejeitado')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.private_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    selection_hash TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.perguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'respondida')),
    respondido_por TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data TEXT NOT NULL,
    local TEXT NOT NULL,
    link TEXT,
    tipo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    assunto TEXT,
    mensagem TEXT NOT NULL,
    status TEXT DEFAULT 'nova' CHECK (status IN ('nova', 'lida', 'arquivada')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES auth.users(id) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisado', 'ignorado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    credential_id TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    device_type TEXT CHECK (device_type IN ('platform', 'cross-platform')),
    backed_up BOOLEAN DEFAULT false,
    transports TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 4. ALTER TABLE — Colunas novas em tabelas existentes    ║
-- ║    (Para bancos que já tinham as tabelas antes)          ║
-- ╚══════════════════════════════════════════════════════════╝
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS co_author_ids UUID[] DEFAULT '{}';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS alt_text TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS technical_details TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS testimonial TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS admin_feedback TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS external_link TEXT;

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS inline_paragraph_id TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.reproductions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 5. FUNÇÕES E TRIGGERS                                   ║
-- ╚══════════════════════════════════════════════════════════╝
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'role' = 'admin' OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION update_submission_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.submissions SET like_count = like_count + 1 WHERE id = NEW.submission_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.submissions SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.submission_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_like_count ON public.curtidas;
CREATE TRIGGER trigger_update_like_count
    AFTER INSERT OR DELETE ON public.curtidas
    FOR EACH ROW EXECUTE FUNCTION update_submission_like_count();

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 6. ÍNDICES DE PERFORMANCE                               ║
-- ╚══════════════════════════════════════════════════════════╝
CREATE INDEX IF NOT EXISTS idx_submissions_views_desc ON public.submissions (views DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at_desc ON public.submissions (created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_submissions_category_views ON public.submissions (category, views DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_submissions_status_created_at ON public.submissions (status, created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_submissions_status_views ON public.submissions (status, views DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sub_type ON public.analytics_plays(submission_id, type);
CREATE INDEX IF NOT EXISTS idx_trail_subs_order ON public.trail_submissions(trail_id, sort_order);

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 7. ENABLE RLS EM TODAS AS TABELAS                      ║
-- ╚══════════════════════════════════════════════════════════╝
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curtidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 8. POLÍTICAS RLS (DROP + CREATE para idempotência)      ║
-- ╚══════════════════════════════════════════════════════════╝

-- ── Profiles ──
DROP POLICY IF EXISTS "Perfis visíveis para todos" ON public.profiles;
CREATE POLICY "Perfis visíveis para todos" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Usuários editam o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários editam o próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Usuários criam o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários criam o próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles USING (public.is_admin());

-- ── Submissions ──
DROP POLICY IF EXISTS "Public can view approved submissions" ON public.submissions;
CREATE POLICY "Public can view approved submissions" ON public.submissions FOR SELECT USING ((status = 'aprovado' AND status <> 'deleted') OR public.is_admin());
DROP POLICY IF EXISTS "Usuários autenticados podem inserir submissões" ON public.submissions;
CREATE POLICY "Usuários autenticados podem inserir submissões" ON public.submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins manage submissions" ON public.submissions;
CREATE POLICY "Admins manage submissions" ON public.submissions USING (public.is_admin());
DROP POLICY IF EXISTS "Authors can update submissions" ON public.submissions;
CREATE POLICY "Authors can update submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id);

-- ── Comments (Moderação Estrita v2.3.5) ──
DROP POLICY IF EXISTS "Anyone can read all comments" ON public.comments;
CREATE POLICY "Anyone can read all comments" ON public.comments FOR SELECT USING (status = 'aprovado' OR public.is_admin());
DROP POLICY IF EXISTS "Qualquer um pode comentar" ON public.comments;
CREATE POLICY "Qualquer um pode comentar" ON public.comments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage comments" ON public.comments;
CREATE POLICY "Admins manage comments" ON public.comments USING (public.is_admin());
DROP POLICY IF EXISTS "Anyone can update comments" ON public.comments;
CREATE POLICY "Anyone can update comments" ON public.comments FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "Anyone can delete comments" ON public.comments;
CREATE POLICY "Anyone can delete comments" ON public.comments FOR DELETE USING (public.is_admin());

-- ── Reproductions (Moderação Estrita v2.3.5) ──
DROP POLICY IF EXISTS "Anyone can read all reproductions" ON public.reproductions;
CREATE POLICY "Anyone can read all reproductions" ON public.reproductions FOR SELECT USING (status = 'aprovado' OR public.is_admin());
DROP POLICY IF EXISTS "Usuários logados podem enviar reproduções" ON public.reproductions;
CREATE POLICY "Usuários logados podem enviar reproduções" ON public.reproductions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage reproductions" ON public.reproductions;
CREATE POLICY "Admins manage reproductions" ON public.reproductions USING (public.is_admin());
DROP POLICY IF EXISTS "Anyone can update reproductions" ON public.reproductions;
CREATE POLICY "Anyone can update reproductions" ON public.reproductions FOR UPDATE USING (public.is_admin());
DROP POLICY IF EXISTS "Anyone can delete reproductions" ON public.reproductions;
CREATE POLICY "Anyone can delete reproductions" ON public.reproductions FOR DELETE USING (public.is_admin());

-- ── Analytics Plays ──
DROP POLICY IF EXISTS "Public can insert analytics" ON public.analytics_plays;
CREATE POLICY "Public can insert analytics" ON public.analytics_plays FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_plays;
CREATE POLICY "Admins can view analytics" ON public.analytics_plays FOR SELECT USING (true);

-- ── Learning Trails ──
DROP POLICY IF EXISTS "Public can view trails" ON public.learning_trails;
CREATE POLICY "Public can view trails" ON public.learning_trails FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage trails" ON public.learning_trails;
CREATE POLICY "Admins manage trails" ON public.learning_trails FOR ALL USING (public.is_admin());

-- ── Trail Submissions ──
DROP POLICY IF EXISTS "Public can view trail submissions" ON public.trail_submissions;
CREATE POLICY "Public can view trail submissions" ON public.trail_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage trail submissions" ON public.trail_submissions;
CREATE POLICY "Admins manage trail submissions" ON public.trail_submissions FOR ALL USING (public.is_admin());

-- ── Testimonials ──
DROP POLICY IF EXISTS "Testemunhos aprovados são públicos" ON public.testimonials;
CREATE POLICY "Testemunhos aprovados são públicos" ON public.testimonials FOR SELECT USING ((status = 'aprovado' AND status <> 'deleted') OR public.is_admin());
DROP POLICY IF EXISTS "Usuários logados podem enviar testemunhos" ON public.testimonials;
CREATE POLICY "Usuários logados podem enviar testemunhos" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials USING (public.is_admin());

-- ── Badges ──
DROP POLICY IF EXISTS "Badges são públicas" ON public.badges;
CREATE POLICY "Badges são públicas" ON public.badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage badges" ON public.badges;
CREATE POLICY "Admins manage badges" ON public.badges USING (public.is_admin());
DROP POLICY IF EXISTS "User badges são públicas" ON public.user_badges;
CREATE POLICY "User badges são públicas" ON public.user_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage user badges" ON public.user_badges;
CREATE POLICY "Admins manage user badges" ON public.user_badges USING (public.is_admin());

-- ── Curtidas ──
DROP POLICY IF EXISTS "Anyone can read likes" ON public.curtidas;
CREATE POLICY "Anyone can read likes" ON public.curtidas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert likes" ON public.curtidas;
CREATE POLICY "Anyone can insert likes" ON public.curtidas FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can delete own likes" ON public.curtidas;
CREATE POLICY "Anyone can delete own likes" ON public.curtidas FOR DELETE USING (true);

-- ── Saved Posts ──
DROP POLICY IF EXISTS "Allow authenticated users to view their own saved posts" ON public.saved_posts;
CREATE POLICY "Allow authenticated users to view their own saved posts" ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow authenticated users to insert their own saved posts" ON public.saved_posts;
CREATE POLICY "Allow authenticated users to insert their own saved posts" ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow authenticated users to delete their own saved posts" ON public.saved_posts;
CREATE POLICY "Allow authenticated users to delete their own saved posts" ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- ── Follows ──
DROP POLICY IF EXISTS "Allow authenticated users to view their own follows" ON public.follows;
CREATE POLICY "Allow authenticated users to view their own follows" ON public.follows FOR SELECT USING (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Allow authenticated users to insert their own follows" ON public.follows;
CREATE POLICY "Allow authenticated users to insert their own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Allow authenticated users to delete their own follows" ON public.follows;
CREATE POLICY "Allow authenticated users to delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ── Private Notes ──
DROP POLICY IF EXISTS "Users can manage their own private notes" ON public.private_notes;
CREATE POLICY "Users can manage their own private notes" ON public.private_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Corrections ──
DROP POLICY IF EXISTS "Users can see their own sent corrections" ON public.corrections;
CREATE POLICY "Users can see their own sent corrections" ON public.corrections FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can create corrections" ON public.corrections;
CREATE POLICY "Users can create corrections" ON public.corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage corrections" ON public.corrections;
CREATE POLICY "Admins manage corrections" ON public.corrections USING (public.is_admin());

-- ── Perguntas ──
DROP POLICY IF EXISTS "Perguntas respondidas são públicas" ON public.perguntas;
CREATE POLICY "Perguntas respondidas são públicas" ON public.perguntas FOR SELECT USING (status = 'respondida' OR public.is_admin());
DROP POLICY IF EXISTS "Qualquer um pode enviar perguntas" ON public.perguntas;
CREATE POLICY "Qualquer um pode enviar perguntas" ON public.perguntas FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins gerenciam perguntas" ON public.perguntas;
CREATE POLICY "Admins gerenciam perguntas" ON public.perguntas USING (public.is_admin());

-- ── Oportunidades ──
DROP POLICY IF EXISTS "Oportunidades são públicas" ON public.oportunidades;
CREATE POLICY "Oportunidades são públicas" ON public.oportunidades FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gerenciam oportunidades" ON public.oportunidades;
CREATE POLICY "Admins gerenciam oportunidades" ON public.oportunidades USING (public.is_admin());

-- ── Contatos ──
DROP POLICY IF EXISTS "Qualquer um pode enviar contato" ON public.contatos;
CREATE POLICY "Qualquer um pode enviar contato" ON public.contatos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins gerenciam contatos" ON public.contatos;
CREATE POLICY "Admins gerenciam contatos" ON public.contatos USING (public.is_admin());

-- ── Reports ──
DROP POLICY IF EXISTS "Users can report" ON public.reports;
CREATE POLICY "Users can report" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "Admins can manage reports" ON public.reports;
CREATE POLICY "Admins can manage reports" ON public.reports USING (public.is_admin());

-- ── WebAuthn Credentials ──
DROP POLICY IF EXISTS "Users manage own credentials" ON public.webauthn_credentials;
CREATE POLICY "Users manage own credentials" ON public.webauthn_credentials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all credentials" ON public.webauthn_credentials;
CREATE POLICY "Admins can view all credentials" ON public.webauthn_credentials FOR SELECT USING (public.is_admin());

-- ╔══════════════════════════════════════════════════════════╗
-- ║ 9. SEED DATA                                            ║
-- ╚══════════════════════════════════════════════════════════╝
INSERT INTO public.badges (name, icon, description)
VALUES ('Pesquisador Sênior', 'elderly', 'Colaborador frequente com 3 ou mais publicações aprovadas.')
ON CONFLICT (name) DO NOTHING;
