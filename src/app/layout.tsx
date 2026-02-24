import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UNIRIDE - Le covoiturage étudiant par excellence',
  description: 'Trouvez et proposez des trajets sécurisés et abordables entre étudiants.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased dark">
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        ></script>
      </head>
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50`}>
        <div className="flex min-h-full flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
