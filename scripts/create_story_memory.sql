-- Migration: add story memory fields and chapter metadata
-- Run this on your Supabase database (psql or via SQL editor)

-- STORIES table additions
ALTER TABLE IF EXISTS stories
  ADD COLUMN IF NOT EXISTS story_dna jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS story_memory jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS current_arc text DEFAULT '',
  ADD COLUMN IF NOT EXISTS emotion_tags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cover_prompt text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cover_style text DEFAULT '';

-- CHAPTERS table additions
ALTER TABLE IF EXISTS chapters
  ADD COLUMN IF NOT EXISTS summary text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cliffhanger text DEFAULT '',
  ADD COLUMN IF NOT EXISTS important_events jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS emotion_tags jsonb DEFAULT '[]'::jsonb;

-- Note: adjust table/column names if your schema differs. Test on a staging DB first.
