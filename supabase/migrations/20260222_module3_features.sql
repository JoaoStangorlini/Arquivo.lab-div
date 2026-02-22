-- ==========================================================
-- MODULE 3: Immersive Reading & Academic Collaboration
-- Created at: 2026-02-22
-- ==========================================================

-- 1. Corrections Table (Peer Review)
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

-- 2. Private Notes Table (Personal Annotations)
CREATE TABLE IF NOT EXISTS public.private_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    selection_hash TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Update Comments Table for Inline Comments
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS inline_paragraph_id TEXT;

-- 4. Enable RLS
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_notes ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Private Notes
DROP POLICY IF EXISTS "Users can manage their own private notes" ON public.private_notes;
CREATE POLICY "Users can manage their own private notes"
ON public.private_notes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Policies for Corrections
-- Senders and Admins can see
DROP POLICY IF EXISTS "Users can see their own sent corrections" ON public.corrections;
CREATE POLICY "Users can see their own sent corrections"
ON public.corrections FOR SELECT
USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Authors of the original post can see corrections to their work
DROP POLICY IF EXISTS "Authors can see corrections for their submissions" ON public.corrections;
CREATE POLICY "Authors can see corrections for their submissions"
ON public.corrections FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.submissions s 
    WHERE s.id = submission_id AND s.user_id = auth.uid()
));

-- Anyone authenticated can create a correction
DROP POLICY IF EXISTS "Users can create corrections" ON public.corrections;
CREATE POLICY "Users can create corrections"
ON public.corrections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update/delete status
DROP POLICY IF EXISTS "Admins manage corrections" ON public.corrections;
CREATE POLICY "Admins manage corrections"
ON public.corrections
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
