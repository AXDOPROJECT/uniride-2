import { Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NotificationsList from './NotificationsList'

export default async function AlertesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <main className="flex-1 bg-transparent overflow-y-auto pb-24">
            <div className="max-w-xl mx-auto px-6 pt-10 space-y-10">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alertes</h1>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Notifications & Infos</p>
                </div>

                {/* Notifications List */}
                <NotificationsList notifications={notifications || []} />

            </div>
        </main>
    )
}
