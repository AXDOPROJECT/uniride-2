CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- create policy for read (anyone can read)
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements
    FOR SELECT USING (true);

-- create policy for insert (only admins)
CREATE POLICY "Only admins can insert announcements" ON public.announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

