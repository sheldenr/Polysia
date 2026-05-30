-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh text NOT NULL UNIQUE,
  title_en text NOT NULL,
  content_zh text NOT NULL,
  hsk_level integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'General',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select stories
CREATE POLICY "stories_select_all" ON public.stories FOR SELECT USING (true);

-- Add some initial indices
CREATE INDEX IF NOT EXISTS idx_stories_hsk_level ON public.stories(hsk_level);
CREATE INDEX IF NOT EXISTS idx_stories_category ON public.stories(category);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_stories_updated_at ON public.stories;
CREATE TRIGGER trg_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
