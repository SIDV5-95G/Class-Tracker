-- ==============================================================================
-- FIX: ALLOW 'Project' IN TASKS CATEGORY
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xrqwdurntnvdqusfundv/sql
-- ==============================================================================

-- 1. Drop old constraint that only allowed ('Assignment', 'Test', 'Lab')
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_category_check;

-- 2. Add updated constraint that includes 'Project'
ALTER TABLE public.tasks ADD CONSTRAINT tasks_category_check 
  CHECK (category IN ('Assignment', 'Test', 'Lab', 'Project'));
