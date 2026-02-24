-- UNIRIDE Phase 10: Missing Core Features Schema
-- Please paste and execute this directly in your Supabase SQL Editor

-- 1. Create Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    link TEXT, -- Optional Deep Link (e.g. /trajet/123)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect Notifications with Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- 2. Create Announcements Table (Admin Only conceptually, public read)
CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Allow anyone to read active announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read announcements"
    ON public.announcements
    FOR SELECT
    TO public
    USING (true);

-- Note: Inserting into announcements is reserved for admins in the Supabase Dashboard, so no insert policy is provided for regular users.

-- 3. Modify `ride_requests` to include a 4-digit confirmation code
ALTER TABLE public.ride_requests 
ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(10);
