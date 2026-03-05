import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Megaphone, ShieldAlert, Send } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AnnouncementsPage() {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Role Check (Admin or User)
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
    const isAdmin = userData?.role === 'admin'

    // 3. Fetch Announcements
    // If the table doesn't exist yet (because SQL run failed), we trap the error and show empty
    const { data: announcements, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

    const safeAnnouncements = announcements || []

    async function postAnnouncement(formData: FormData) {
        'use server'
        const content = formData.get('content') as string
        if (!content) return

        const supabaseServer = await createClient()
        const { data: { user } } = await supabaseServer.auth.getUser()

        if (user) {
            await supabaseServer.from('announcements').insert({
                content,
                author_id: user.id
            })
            revalidatePath('/messages/annonces')
        }
    }

    return (
        <main className="flex-1 bg-slate-50 dark:bg-black/50 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/messages" className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm transition-transform active:scale-95">
                        <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Megaphone className="w-6 h-6 text-brand-purple" /> Annonces
                        </h1>
                    </div>
                </div>

                {/* Admin Post Form */}
                {isAdmin && (
                    <div className="premium-card p-5 bg-white dark:bg-zinc-900 border-2 border-brand-purple/20">
                        <div className="flex items-center gap-2 mb-4 text-brand-purple font-black uppercase tracking-widest text-xs">
                            <ShieldAlert className="w-4 h-4" /> Mode Administrateur
                        </div>
                        <form action={postAnnouncement} className="space-y-3">
                            <textarea
                                name="content"
                                required
                                placeholder="Rédigez une annonce publique..."
                                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-brand-purple focus:outline-none resize-none h-24"
                            />
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-purple text-white rounded-2xl py-3 font-black uppercase text-sm shadow-lg shadow-brand-purple/30 active:scale-95 transition-transform">
                                <Send className="w-4 h-4" /> Diffuser à tous
                            </button>
                        </form>
                    </div>
                )}

                {/* Feed */}
                <div className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center">
                            Connectez-vous à Supabase et exécutez le script SQL d'annonces.
                        </div>
                    )}
                    {safeAnnouncements.length === 0 && !error ? (
                        <div className="text-center py-10 text-slate-500 font-medium">
                            Aucune annonce pour le moment.
                        </div>
                    ) : (
                        safeAnnouncements.map((msg) => {
                            const authorData = msg.author as any;
                            return (
                                <div key={msg.id} className="premium-card p-5 bg-white dark:bg-zinc-900 space-y-3 shadow-sm border-none">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-lg">
                                            {authorData?.avatar_url ? (
                                                <img src={authorData.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                "🎓"
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white leading-tight">L'Équipe UNIRIDE</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                                                {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-slate-700 dark:text-zinc-300 text-sm font-medium leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>
                            )
                        })
                    )}
                </div>

            </div>
        </main>
    )
}
