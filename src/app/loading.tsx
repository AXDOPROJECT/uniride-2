import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <main className="flex-1 bg-slate-50 dark:bg-black/50 overflow-hidden flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl shadow-brand-purple/10 flex items-center justify-center border border-slate-100 dark:border-zinc-800">
                    <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
                </div>
                <p className="text-sm font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest animate-pulse">
                    Chargement...
                </p>
            </div>
        </main>
    )
}
