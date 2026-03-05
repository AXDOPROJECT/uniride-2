-- UNIRIDE Phase 27: Ride Status & History Visibility Overhaul

-- 1. Add visibility flags for individual history deletion
ALTER TABLE public.rides 
ADD COLUMN IF NOT EXISTS is_hidden_by_driver BOOLEAN DEFAULT false;

ALTER TABLE public.ride_requests 
ADD COLUMN IF NOT EXISTS is_hidden_by_passenger BOOLEAN DEFAULT false;

-- 2. Update status constraint to include 'completed' and 'cancelled'
-- First drop existing constraint
ALTER TABLE public.rides DROP CONSTRAINT IF EXISTS rides_status_check;
ALTER TABLE public.rides ADD CONSTRAINT rides_status_check 
CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled'));

ALTER TABLE public.ride_requests DROP CONSTRAINT IF EXISTS ride_requests_status_check;
ALTER TABLE public.ride_requests ADD CONSTRAINT ride_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'onboarded', 'no_show', 'completed', 'cancelled'));

-- 3. Add default status to rides if not exists
ALTER TABLE public.rides ALTER COLUMN status SET DEFAULT 'scheduled';
