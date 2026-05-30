-- Rename flashcards table to reviews and wipe data
TRUNCATE TABLE public.flashcards;
ALTER TABLE public.flashcards RENAME TO reviews;

-- Rename indices
ALTER INDEX IF EXISTS idx_flashcards_user_due_date RENAME TO idx_reviews_user_due_date;
ALTER INDEX IF EXISTS idx_flashcards_user_hsk_level RENAME TO idx_reviews_user_hsk_level;
ALTER INDEX IF EXISTS idx_flashcards_user_source_id_unique RENAME TO idx_reviews_user_source_id_unique;

-- Rename triggers and functions (if needed)
-- trg_flashcards_updated_at uses public.set_updated_at() which is shared.
-- We just need to rename the trigger itself on the new table name.
-- Actually RENAME TABLE usually renames the trigger attached to it.
-- Let's double check trigger names.

-- Update learning_activity check constraint
ALTER TABLE public.learning_activity DROP CONSTRAINT IF EXISTS learning_activity_mode_check;
ALTER TABLE public.learning_activity ADD CONSTRAINT learning_activity_mode_check CHECK (mode IN ('review', 'reading', 'roleplay'));

-- Update existing activity records
UPDATE public.learning_activity SET mode = 'review' WHERE mode = 'flashcards';

-- Policies need to be renamed/re-applied
-- (Renaming a table in Supabase sometimes requires re-applying RLS policies)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "flashcards_select_own" ON public.reviews;
CREATE POLICY "reviews_select_own" ON public.reviews FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "flashcards_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "flashcards_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "flashcards_delete_own" ON public.reviews;
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
