-- ==============================================================================
-- UPDATE: Fix spelling of Shruthi Nair (Roll 39) — SHRUTI → SHRUTHI
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xrqwdurntnvdqusfundv/sql
-- ==============================================================================

UPDATE public.profiles
SET
  student_id    = 'SHRUTHI-D9B-39',
  student_name  = 'Shruthi Nair',
  full_name     = 'Shruthi Nair (D9B-39)',
  password_hash = 'SHRUTHI-D9B-39'
WHERE roll_number = '39' AND role = 'CR';

-- Verify the update
SELECT student_id, student_name, full_name, password_hash, role, batch
FROM public.profiles
WHERE roll_number = '39';
