-- PHASE 12 MIGRATION: RATING & VISIBILITY OVERHAUL

-- 1. Update Users Table with Deductive Rating System
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- 2. Initialize existing users
UPDATE public.users SET rating = 5.0 WHERE rating IS NULL;
UPDATE public.users SET is_blocked = false WHERE is_blocked IS NULL;

-- 3. Ensure Announcements are public-readable for "Absolute Visibility"
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'announcements' AND policyname = 'Allow public read for announcements'
    ) THEN
        CREATE POLICY "Allow public read for announcements" 
        ON public.announcements FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Verify RLS for Notifications (Should already be user-specific)
-- Ensure users can only see their own notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications'
    ) THEN
        CREATE POLICY "Users can view own notifications" 
        ON public.notifications FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
END $$;
