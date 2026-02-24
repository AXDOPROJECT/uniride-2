import { Send } from 'lucide-react';

export default function Messages() {
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                Messages du Trajet
            </h1>

            {/* Chat Box Container */}
            <div className="flex-1 overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800 flex flex-col">
                {/* Message Header */}
                <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        Trajet: Campus vers Centre Ville
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Conducteur: Alex • Départ: 18h30
                    </p>
                </div>

                {/* Message Thread (Placeholder) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 max-w-md">
                            <p className="text-sm text-slate-800 dark:text-slate-200">
                                Salut ! On se retrouve à quel arrêt devant la fac ?
                            </p>
                            <span className="text-xs text-slate-500 mt-1 block">18:05</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <div className="bg-indigo-600 rounded-lg px-4 py-2 max-w-md">
                            <p className="text-sm text-white">
                                Devant la bibliothèque des sciences, j'y serai dans 10 min.
                            </p>
                            <span className="text-xs text-indigo-200 mt-1 block text-right">18:07</span>
                        </div>
                    </div>

                </div>

                {/* Message Input */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                    <form className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Écrivez votre message..."
                            className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                        />
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <Send className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
