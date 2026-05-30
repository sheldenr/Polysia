-- Create stories table with storyline and chapter support
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh text NOT NULL UNIQUE,
  title_en text NOT NULL,
  content_zh text NOT NULL,
  hsk_level integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'General',
  storyline_id text,
  chapter_number integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select stories
DROP POLICY IF EXISTS "stories_select_all" ON public.stories;
CREATE POLICY "stories_select_all" ON public.stories FOR SELECT USING (true);

-- Add indices
CREATE INDEX IF NOT EXISTS idx_stories_hsk_level ON public.stories(hsk_level);
CREATE INDEX IF NOT EXISTS idx_stories_category ON public.stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_storyline_id ON public.stories(storyline_id);
CREATE INDEX IF NOT EXISTS idx_stories_chapter_number ON public.stories(chapter_number);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stories_updated_at ON public.stories;
CREATE TRIGGER trg_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
