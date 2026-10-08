-- ==============================================================================
-- CLASS TRACKER - SUPABASE DATABASE SCHEMA & RLS SETUP
-- Execute this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE 'tasks' TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Assignment', 'Test', 'Lab', 'Project')),
    due_date TIMESTAMPTZ NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'All Students' CHECK (target_audience IN ('All Students', 'Batch A', 'Batch B', 'Batch C')),
    drive_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. CREATE 'completions' TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_task_user_completion UNIQUE (task_id, user_id)
);

-- ==============================================================================
-- 4. CREATE 'profiles' TABLE (Linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'CR')),
    batch TEXT NOT NULL DEFAULT 'Batch A' CHECK (batch IN ('Batch A', 'Batch B', 'Batch C')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, batch)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Student'),
        COALESCE(NEW.raw_user_meta_data->>'batch', 'Batch A')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        batch = EXCLUDED.batch;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_target_audience ON public.tasks (target_audience);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks (category);
CREATE INDEX IF NOT EXISTS idx_completions_user_id ON public.completions (user_id);
CREATE INDEX IF NOT EXISTS idx_completions_task_id ON public.completions (task_id);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- TASKS POLICIES
-- Anyone authenticated can view tasks
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
CREATE POLICY "Authenticated users can view tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can create tasks
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
CREATE POLICY "Authenticated users can create tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update tasks
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
CREATE POLICY "Authenticated users can update tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (true);

-- Authenticated users can delete tasks
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;
CREATE POLICY "Authenticated users can delete tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (true);

-- COMPLETIONS POLICIES
-- Authenticated users can view completions (for aggregate progress charts & student status)
DROP POLICY IF EXISTS "Authenticated users can view completions" ON public.completions;
CREATE POLICY "Authenticated users can view completions"
    ON public.completions FOR SELECT
    TO authenticated
    USING (true);

-- Students can only mark their own completions
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.completions;
CREATE POLICY "Users can insert their own completions"
    ON public.completions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Students can only delete/uncheck their own completions
DROP POLICY IF EXISTS "Users can delete their own completions" ON public.completions;
CREATE POLICY "Users can delete their own completions"
    ON public.completions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
CREATE POLICY "Users can delete profiles"
    ON public.profiles FOR DELETE
    USING (true);

-- ==============================================================================
-- 7. ENABLE REALTIME BROADCASTING
-- ==============================================================================
-- Ensure the tables broadcast changes live to Next.js clients
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.completions;
