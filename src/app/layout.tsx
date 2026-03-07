import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import AnnouncementsBanner from '@/components/AnnouncementsBanner';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UNIRIDE - Le covoiturage étudiant par excellence',
  description: 'La solution premium de covoiturage réservée aux étudiants. Sécurité, simplicité et économies.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_blocked')
      .eq('id', user.id)
      .single();

    if (profile?.is_blocked) {
      redirect('/blocked');
    }
  }

  return (
    <html lang="fr" className="h-full antialiased selection:bg-brand-blue/30 dark">
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        ></script>
      </head>
      <body className={`${inter.className} h-full`}>
        <div className="flex min-h-full flex-col pb-20 sm:pb-0">
          <AnnouncementsBanner />
          <TopNav />
          <main className="flex-1">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
