-- UNIRIDE Phase 20: Payments, Live Map & PIN Boarding
-- Execute this in the Supabase SQL Editor

-- 1. Update rides table to store coordinates
ALTER TABLE public.rides 
ADD COLUMN IF NOT EXISTS origin_lat NUMERIC,
ADD COLUMN IF NOT EXISTS origin_lng NUMERIC,
ADD COLUMN IF NOT EXISTS dest_lat NUMERIC,
ADD COLUMN IF NOT EXISTS dest_lng NUMERIC;

-- 2. Update ride_requests table for payments and boarding
ALTER TABLE public.ride_requests 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash',
DROP CONSTRAINT IF EXISTS ride_requests_status_check;

-- Ensure status check includes new values
ALTER TABLE public.ride_requests
ADD CONSTRAINT ride_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'onboarded', 'no_show'));
