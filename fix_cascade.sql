-- Ensure all foreign keys to 'rides' have ON DELETE CASCADE
-- This allows deleting a ride even if it has requests or reviews.

DO $$
BEGIN
    -- 1. Fix ride_requests
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ride_requests_ride_id_fkey'
    ) THEN
        ALTER TABLE public.ride_requests DROP CONSTRAINT ride_requests_ride_id_fkey;
    END IF;
    
    ALTER TABLE public.ride_requests 
    ADD CONSTRAINT ride_requests_ride_id_fkey 
    FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE;

    -- 2. Fix reviews
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_ride_id_fkey'
    ) THEN
        ALTER TABLE public.reviews DROP CONSTRAINT reviews_ride_id_fkey;
    END IF;

    ALTER TABLE public.reviews 
    ADD CONSTRAINT reviews_ride_id_fkey 
    FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE;

END $$;
