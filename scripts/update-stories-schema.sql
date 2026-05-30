-- Update stories table to include storyline_id and chapter_number
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS storyline_id text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS chapter_number integer DEFAULT 1;

-- Add index for storyline_id and chapter_number
CREATE INDEX IF NOT EXISTS idx_stories_storyline_id ON public.stories(storyline_id);
CREATE INDEX IF NOT EXISTS idx_stories_chapter_number ON public.stories(chapter_number);
