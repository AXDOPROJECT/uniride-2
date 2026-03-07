import { Megaphone } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Messages() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch driver rides & passenger rides in parallel
    const [driverRidesRes, passengerReqsRes] = await Promise.all([
        supabase
            .from('rides')
            .select(`
                id,
                origin,
                destination,
                departure_time,
                driver_id,
                driver:users!rides_driver_id_fkey(id, name),
                passengers:ride_requests(
                    status,
                    user:users!ride_requests_passenger_id_fkey(id, name)
                )
            `)
            .eq('driver_id', user.id)
            .order('departure_time', { ascending: false }),
        supabase
            .from('ride_requests')
            .select(`
                status,
                ride:rides(
                    id,
                    origin,
                    destination,
                    departure_time,
                    driver_id,
                    driver:users!rides_driver_id_fkey(id, name)
                )
            `)
            .eq('passenger_id', user.id)
            .eq('status', 'accepted')
    ])

    const driverRides = driverRidesRes.data || []
    const passengerReqs = passengerReqsRes.data || []

    const discussions = []

    // Map Driver Rides
    for (const chat of driverRides) {
        const acceptedPassengers = (chat.passengers as any[])?.filter(p => p.status === 'accepted') || []

        let chatName = "En attente de passagers"
        let avatar = "🚗"

        if (acceptedPassengers.length === 1) {
            chatName = acceptedPassengers[0].user?.name || "Passager"
            avatar = acceptedPassengers[0].user?.name?.charAt(0).toUpperCase() || "🎓"
        } else if (acceptedPassengers.length > 1) {
            chatName = "Mes Passagers"
            avatar = "👥"
        }

        discussions.push({
            id: chat.id,
            name: chatName,
            message: `${chat.origin} → ${chat.destination}`,
            time: new Date(chat.departure_time).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
            avatar: avatar,
            timestamp: new Date(chat.departure_time).getTime()
        })
    }

    // Map Passenger Rides
    for (const req of passengerReqs) {
        const chat = req.ride as any
        if (!chat) continue

        const driverData = chat.driver
        const chatName = driverData?.name || "Conducteur"
        const avatar = driverData?.name?.charAt(0).toUpperCase() || "🧔"

        discussions.push({
            id: chat.id,
            name: chatName,
            message: `${chat.origin} → ${chat.destination}`,
            time: new Date(chat.departure_time).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
            avatar: avatar,
            timestamp: new Date(chat.departure_time).getTime()
        })
    }

    // Sort discussions by most recent first
    discussions.sort((a, b) => b.timestamp - a.timestamp)

    return (
        <main className="flex-1 bg-transparent overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-10">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Messages</h1>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Vos communications</p>
                </div>

                {/* Campus Announcements Link */}
                <Link href="/messages/annonces" className="premium-card p-6 flex items-center gap-5 bg-white dark:bg-zinc-900 relative overflow-hidden group border-none block">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                        <Megaphone className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">Annonces Campus</h3>
                        <p className="text-sm text-slate-500 dark:text-zinc-500 font-bold">Infos officielles</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                </Link>

                {/* Private Discussions */}
                <div className="space-y-5">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Discussions privées</h2>
                    <div className="space-y-4">
                        {discussions.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 font-medium">
                                Vous n'avez aucune discussion active.
                            </div>
                        ) : (
                            discussions.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/messages/${chat.id}`}
                                    className="premium-card p-5 flex items-center gap-5 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all border-none shadow-sm"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-brand-purple-soft dark:bg-brand-purple/10 flex items-center justify-center text-3xl">
                                        {chat.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-black text-slate-900 dark:text-white uppercase truncate text-lg tracking-tight">{chat.name}</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">{chat.time}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-zinc-500 font-bold truncate">
                                            {chat.message}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </main>
    )
}
