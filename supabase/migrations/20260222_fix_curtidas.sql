-- Migration: Fix curtidas table for fingerprint-based toggle likes
-- This adds the fingerprint column if it doesn't exist and creates a unique constraint

-- 1. Create curtidas table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.curtidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fingerprint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add fingerprint column if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'curtidas' AND column_name = 'fingerprint'
    ) THEN
        ALTER TABLE curtidas ADD COLUMN fingerprint TEXT;
    END IF;
END $$;

-- 3. Add unique constraint to prevent duplicate likes from same fingerprint
-- Drop first if exists to be idempotent
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'curtidas_submission_fingerprint_unique'
    ) THEN
        ALTER TABLE curtidas ADD CONSTRAINT curtidas_submission_fingerprint_unique 
        UNIQUE (submission_id, fingerprint);
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE curtidas ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
DROP POLICY IF EXISTS "Anyone can read likes" ON curtidas;
CREATE POLICY "Anyone can read likes" ON curtidas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert likes" ON curtidas;
CREATE POLICY "Anyone can insert likes" ON curtidas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete own likes" ON curtidas;
CREATE POLICY "Anyone can delete own likes" ON curtidas FOR DELETE USING (true);
