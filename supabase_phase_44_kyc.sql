-- 1. Create the KYC documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc_documents', 'kyc_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Add RLS policies for the bucket (only the user can upload their own docs, and only they can see them)
CREATE POLICY "Users can upload their own KYC docs" 
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own KYC docs" 
ON storage.objects FOR SELECT TO authenticated USING (
    bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own KYC docs" 
ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'kyc_documents' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Update the users table to track license verification status
-- Status can be: 'unverified', 'pending', 'verified', 'rejected'
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_status TEXT DEFAULT 'unverified';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS license_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- 4. Enable RLS for updates on these specific columns (we will do this server-side via Service Role, 
-- but users should be able to read their own status, which is already handled by the existing users SELECT policy)
