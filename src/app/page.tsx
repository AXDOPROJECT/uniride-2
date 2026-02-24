export default function Page() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          UNIRIDE
        </h1>
        <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
          Le covoiturage repensé pour les étudiants.
          Partagez vos trajets, faites des économies et voyagez en toute sécurité.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a
            href="/proposer"
            className="rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            Proposer un trajet
          </a>
          <a
            href="/rechercher"
            className="rounded-full bg-white dark:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 gap-x-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Rechercher un trajet
          </a>
        </div>

      </div>
    </main>
  );
}
