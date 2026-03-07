-- Migration: Governança e Papéis v1
-- Adiciona flags de Membro Lab-Div e Visibilidade, e ajusta restrições de Role.

-- 1. Adicionar novas colunas se não existirem
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_labdiv BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. Migrar papel 'labdiv' legado para a nova flag
-- Todos que eram 'labdiv' agora são 'user' com a flag is_labdiv = true
UPDATE public.profiles 
SET is_labdiv = true, role = 'user' 
WHERE role = 'labdiv';

-- 3. Garantir que todos tenham um papel válido (fallback para 'user')
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'moderator', 'admin');

-- 4. Atualizar restrição de CHECK para os papéis permitidos
-- Nota: Se o constraint tiver outro nome, o drop pode falhar, mas o add garantirá a nova regra.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'moderator', 'admin'));

-- 5. Comentários para documentação
COMMENT ON COLUMN public.profiles.is_labdiv IS 'Indica se o usuário é um membro oficial do Lab-Div (recurso de governança).';
COMMENT ON COLUMN public.profiles.is_visible IS 'Controla se o perfil é visível publicamente na plataforma (ajustável por Admins).';
