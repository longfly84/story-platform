-- Analytics / Engagement schema for Supabase
-- 1) page_views: track page views and basic session info
-- 2) story_stats: aggregated counters per story (maintained by scheduled job or triggers)
-- 3) story_ratings: user ratings for stories
-- 4) comments: user comments with status moderation
-- 5) indexes for common queries
-- 6) basic RLS policies (examples) - adapt to your auth setup

BEGIN;

-- Page views
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  user_id uuid NULL,
  story_slug text NULL,
  referrer text NULL,
  user_agent text NULL,
  ip_addr text NULL,
  created_at timestamptz DEFAULT now()
);

-- Story stats (aggregated counters)
CREATE TABLE IF NOT EXISTS public.story_stats (
  story_slug text PRIMARY KEY,
  views bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  ratings_count bigint DEFAULT 0,
  ratings_sum bigint DEFAULT 0,
  comments_count bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Story ratings: allow public users to insert rating rows
CREATE TABLE IF NOT EXISTS public.story_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_slug text NOT NULL,
  user_id uuid NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_slug text NULL,
  user_id uuid NULL,
  author_name text NULL,
  content text NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, rejected
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_path_created_at ON public.page_views (path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_story_slug ON public.page_views (story_slug);
CREATE INDEX IF NOT EXISTS idx_story_ratings_story_slug ON public.story_ratings (story_slug);
CREATE INDEX IF NOT EXISTS idx_comments_story_slug_status ON public.comments (story_slug, status);

-- Example RLS policies (requires row level security enabled on these tables and proper auth setup)
-- Enable RLS
ALTER TABLE IF EXISTS public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.story_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.story_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: allow public inserts into page_views
DROP POLICY IF EXISTS "public_insert_page_views" ON public.page_views;
CREATE POLICY "public_insert_page_views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Policy: allow public read on story_stats
DROP POLICY IF EXISTS "public_read_story_stats" ON public.story_stats;
CREATE POLICY "public_read_story_stats" ON public.story_stats
  FOR SELECT USING (true);

-- Policy: allow public insert ratings
DROP POLICY IF EXISTS "public_insert_story_ratings" ON public.story_ratings;
CREATE POLICY "public_insert_story_ratings" ON public.story_ratings
  FOR INSERT WITH CHECK (true);

-- Policy: allow public insert comments
DROP POLICY IF EXISTS "public_insert_comments" ON public.comments;
CREATE POLICY "public_insert_comments" ON public.comments
  FOR INSERT WITH CHECK (true);

-- Policy: allow public select only approved comments
DROP POLICY IF EXISTS "public_select_approved_comments" ON public.comments;
CREATE POLICY "public_select_approved_comments" ON public.comments
  FOR SELECT USING (status = 'approved');

COMMIT;

-- Notes:
-- - Adjust schema ownership, types and RLS policies to your Supabase auth setup.
-- - story_stats is intended to be maintained via triggers or scheduled job that aggregates page_views, ratings, comments.
