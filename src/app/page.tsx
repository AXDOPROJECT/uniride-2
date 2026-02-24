import { CarFront, Search } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center -mt-10 sm:mt-0">
      <div className="w-full max-w-xl space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            UNIRIDE
          </h1>
          <p className="text-lg leading-7 text-slate-600 dark:text-slate-300 px-4">
            Le covoiturage repensé pour les étudiants.
            <br className="hidden sm:block" />
            Partagez vos trajets et voyagez en toute sécurité.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4">
          <Link
            href="/rechercher"
            className="flex items-center justify-center gap-3 w-full sm:w-auto rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95"
          >
            <Search className="w-6 h-6" />
            Trouver un trajet
          </Link>
          <Link
            href="/proposer"
            className="flex items-center justify-center gap-3 w-full sm:w-auto rounded-2xl bg-white dark:bg-slate-800 px-8 py-4 text-lg font-semibold text-slate-900 dark:text-white shadow-md ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            <CarFront className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Proposer un trajet
          </Link>
        </div>

      </div>
    </main>
  );
}
