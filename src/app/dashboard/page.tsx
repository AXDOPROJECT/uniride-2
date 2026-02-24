import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, AlertCircle } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import ProfileForm from './ProfileForm'
import DashboardFeed from './DashboardFeed'

export const revalidate = 0;

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Auth guard is handled by middleware, but double check
    if (authError || !user) {
        redirect('/login')
    }

    // Fetch user profile data to feed into the Profile Form
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Dashboard Fetching Logic
    // 1. If Driver: Fetch rides they published, and attach pending/accepted requests
    const { data: publishedRides } = await supabase
        .from('rides')
        .select(`
            *,
            requests:ride_requests(
                id, status, passenger_id, created_at, confirmation_code,
                passenger:users!ride_requests_passenger_id_fkey(name, phone, email)
            )
        `)
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: true })

    // 2. If Passenger: Fetch ride requests they made, and attach the ride details
    const { data: myBookings } = await supabase
        .from('ride_requests')
        .select(`
            id, status, created_at, confirmation_code,
            ride:rides(
                id, origin, destination, departure_time, price,
                driver:users!rides_driver_id_fkey(name, phone)
            )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Mon Espace UNIRIDE
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Bonjour, {profile?.name || user.email}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/proposer" className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        Nouveau Trajet
                    </Link>
                    <LogoutButton />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Management / Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <DashboardFeed
                        publishedRides={publishedRides || []}
                        myBookings={myBookings || []}
                    />
                </div>

                {/* Right Column: Profile & Settings */}
                <div className="space-y-8">
                    <ProfileForm
                        initialName={profile?.name}
                        initialPhone={profile?.phone}
                        isVerified={profile?.verified_license}
                    />

                    {/* Quick Security Tip Widget */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800/30">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Sécurité Campus</h3>
                                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
                                    Vérifiez toujours l'identité du conducteur ou du passager avant de monter à bord. Le paiement se fait traditionnellement en espèces ou Lydia à la fin du trajet.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
