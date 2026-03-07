import { signup } from '@/app/actions/auth'

export default async function Signup({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const error = (await searchParams)?.error;

    return (
        <main className="flex-1 bg-slate-50 dark:bg-black/50 overflow-y-auto">
            <div className="max-w-md mx-auto px-6 py-20 flex flex-col justify-center min-h-[80vh] space-y-10">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Inscription</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Créez votre compte Uniride</p>
                </div>

                <div className="premium-card p-8 space-y-8">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/20 text-red-500 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" action={signup}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom complet</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Léo Martin"
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-4 px-5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail universitaire</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="nom@ecole.fr"
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-4 px-5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-4 px-5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Je souhaite principalement</label>
                                <select
                                    id="role"
                                    name="role"
                                    defaultValue="passenger"
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-4 px-5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm"
                                >
                                    <option value="passenger">Réserver des trajets (Passager)</option>
                                    <option value="driver">Conduire (Conducteur)</option>
                                    <option value="both">Les deux</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full premium-btn text-lg gap-3 py-5"
                        >
                            S'INSCRIRE
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm font-bold text-slate-400">
                    Déjà membre ?{' '}
                    <a href="/login" className="text-brand-purple hover:underline">
                        Se connecter
                    </a>
                </p>
            </div>
        </main>
    )
}
