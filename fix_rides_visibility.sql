-- UNIRIDE: Fix Ride Visibility & RLS Policies
-- Execute this in the Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive select policies if they exist
DROP POLICY IF EXISTS "Anyone can view scheduled rides" ON public.rides;
DROP POLICY IF EXISTS "Users can view all rides" ON public.rides;
DROP POLICY IF EXISTS "Public rides access" ON public.rides;

-- 3. Create a clean global visibility policy
-- This allows any authenticated user to see rides that are:
-- a) Scheduled (available for booking)
-- b) Not hidden by the driver
CREATE POLICY "Global visibility for scheduled rides" 
ON public.rides 
FOR SELECT 
TO authenticated 
USING (
    (status IN ('scheduled', 'ongoing') OR driver_id = auth.uid()) 
    AND is_hidden_by_driver = false
);

-- 4. Ensure drivers can still manage their own rides
DROP POLICY IF EXISTS "Drivers can update their own rides" ON public.rides;
CREATE POLICY "Drivers can update their own rides" 
ON public.rides 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can delete their own rides" ON public.rides;
CREATE POLICY "Drivers can delete their own rides" 
ON public.rides 
FOR DELETE 
TO authenticated 
USING (auth.uid() = driver_id);

-- 5. Ensure anyone authenticated can insert (to publish a ride)
DROP POLICY IF EXISTS "Authenticated users can publish rides" ON public.rides;
CREATE POLICY "Authenticated users can publish rides" 
ON public.rides 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = driver_id);

GRANT ALL ON public.rides TO authenticated;
GRANT ALL ON public.rides TO service_role;
