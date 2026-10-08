-- ==============================================================================
-- FIX: Allow anonymous read on profiles + enforce roll_number uniqueness
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xrqwdurntnvdqusfundv/sql
-- ==============================================================================

-- 1. Allow anon (unauthenticated) users to read profiles
--    This is needed so the signup flow can check roll number / student_id uniqueness
DROP POLICY IF EXISTS "Allow anon to read profiles for validation" ON public.profiles;
CREATE POLICY "Allow anon to read profiles for validation"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- 2. Add UNIQUE constraint on roll_number (database-level guard)
--    This will reject any duplicate insert regardless of RLS or app logic
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_roll_number_unique;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_roll_number_unique UNIQUE (roll_number);

-- 3. Also add UNIQUE on student_id if not already present
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_student_id_unique;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_student_id_unique UNIQUE (student_id);

-- Verify: confirm no duplicates exist (should return 0 rows)
SELECT roll_number, COUNT(*) as count
FROM public.profiles
GROUP BY roll_number
HAVING COUNT(*) > 1;
