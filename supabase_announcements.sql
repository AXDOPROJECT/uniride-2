CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Announcements are viewable by everyone' ) THEN CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true); END IF; IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Only admins can insert announcements' ) THEN CREATE POLICY "Only admins can insert announcements" ON public.announcements FOR INSERT WITH CHECK ( EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') ); END IF; END $$;
