import { Bell } from 'lucide-react'

export default function AlertesPage() {
    return (
        <main className="flex-1 bg-transparent overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-10">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alertes</h1>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Notifications & Infos</p>
                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-300 dark:text-zinc-700">
                        <Bell className="w-12 h-12" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-slate-900 dark:text-white font-black uppercase tracking-tight">C'est tout calme ici</p>
                        <p className="text-sm text-slate-500 dark:text-zinc-500 font-bold">Vous n'avez aucune nouvelle notification.</p>
                    </div>
                </div>

            </div>
        </main>
    )
}
