-- Migration: Add saved_posts and follows tables
-- Created at: 2026-02-22

-- 1. Create saved_posts table
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, submission_id)
);

-- 2. Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_author TEXT NOT NULL, -- Reference by author name for now as per current schema
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_author)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for saved_posts
CREATE POLICY "Allow authenticated users to view their own saved posts" 
ON saved_posts FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert their own saved posts" 
ON saved_posts FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own saved posts" 
ON saved_posts FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. RLS Policies for follows
CREATE POLICY "Allow authenticated users to view their own follows" 
ON follows FOR SELECT 
TO authenticated 
USING (auth.uid() = follower_id);

CREATE POLICY "Allow authenticated users to insert their own follows" 
ON follows FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Allow authenticated users to delete their own follows" 
ON follows FOR DELETE 
TO authenticated 
USING (auth.uid() = follower_id);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
