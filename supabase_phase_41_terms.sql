-- UNIRIDE Phase 41: Terms of Use Acceptance Tracking
-- Execute this in the Supabase SQL Editor

-- 1. Create terms_acceptances table for historical audits
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    terms_version TEXT DEFAULT '1.0' -- To track which version they accepted
);

-- Enable RLS
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own acceptances
CREATE POLICY "Users can view their own terms acceptances" 
ON public.terms_acceptances FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own acceptance
CREATE POLICY "Users can record their own terms acceptance" 
ON public.terms_acceptances FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 2. Update users table with a quick-check flag
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS has_accepted_terms BOOLEAN DEFAULT false;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;
