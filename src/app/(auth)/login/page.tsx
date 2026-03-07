import { login } from '@/app/actions/auth'

export default async function Login({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const error = (await searchParams)?.error;

    return (
        <main className="flex-1 bg-slate-50 dark:bg-black/50 overflow-y-auto">
            <div className="max-w-md mx-auto px-6 py-20 flex flex-col justify-center min-h-[80vh] space-y-10">

                {/* Logo & Welcome */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-lime shadow-2xl shadow-brand-lime/20 mb-2 overflow-hidden border-4 border-white dark:border-zinc-800">
                        <img src="/logo.png" alt="UNIRIDE Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Bonjour !</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Connectez-vous à UNIRIDE</p>
                </div>

                {/* Form Card */}
                <div className="premium-card p-8 space-y-8">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/20 text-red-500 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" action={login}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adresse e-mail</label>
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
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-4 px-5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full premium-btn text-xl gap-3 py-5"
                        >
                            SE CONNECTER
                        </button>
                    </form>
                </div>

                {/* Signup Link */}
                <p className="text-center text-sm font-bold text-slate-400">
                    Pas encore membre ?{' '}
                    <a href="/signup" className="text-brand-purple hover:underline">
                        Créer un compte
                    </a>
                </p>
            </div>
        </main>
    )
}
