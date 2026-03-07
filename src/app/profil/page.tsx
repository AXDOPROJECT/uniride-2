import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Star, Phone } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default async function ProfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    const initial = profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'

    return (
        <main className="flex-1 bg-slate-50 dark:bg-black/50 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-10 text-center">

                {/* Profile Identity */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-brand-purple flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-brand-purple/20">
                        {initial}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase drop-shadow-sm">
                            {profile?.name || user.email?.split('@')[0]}
                        </h1>
                        <p className="text-slate-500 dark:text-zinc-500 font-bold">Étudiant</p>
                    </div>

                    {/* Rating and KYC Badge */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 mx-auto">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-black text-slate-900 dark:text-white">{profile?.rating || '5'}</span>
                        </div>

                        {profile?.license_status === 'verified' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ccff00]/20 text-[#8ab300] dark:text-[#ccff00] font-bold text-xs rounded-full uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-[#a3cc00]"></span>
                                Conducteur Vérifié
                            </div>
                        ) : profile?.license_status === 'pending' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-full uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Analyse en cours...
                            </div>
                        ) : (
                            <a href="/verification" className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 font-bold text-xs rounded-full uppercase tracking-wide hover:bg-red-100 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Non-Vérifié (Cliquez ici)
                            </a>
                        )}
                    </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-4">
                    <div className="group premium-card p-5 flex items-center gap-4 bg-white dark:bg-zinc-900">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-0.5">Téléphone</span>
                            <span className="text-base font-bold text-slate-900 dark:text-zinc-100">
                                {profile?.phone || 'Non renseigné'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <div className="pt-4">
                    <LogoutButton />
                </div>

            </div>
        </main>
    )
}
