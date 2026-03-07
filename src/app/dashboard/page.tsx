import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardFeed from './DashboardFeed'

export const revalidate = 0;

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Fetch all Dashboard Data in Parallel for performance
    const [profileResponse, publishedRidesResponse, myBookingsResponse] = await Promise.all([
        supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single(),
        supabase
            .from('rides')
            .select(`
                *,
                requests:ride_requests(
                    id, status, passenger_id, created_at,
                    passenger:users!ride_requests_passenger_id_fkey(name, phone, email)
                )
            `)
            .eq('driver_id', user.id)
            .order('departure_time', { ascending: true }),
        supabase
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
    ])

    const profile = profileResponse.data
    const publishedRides = publishedRidesResponse.data
    const myBookings = myBookingsResponse.data

    if (publishedRidesResponse.error) console.error("Error publishedRides:", publishedRidesResponse.error.message)
    if (myBookingsResponse.error) console.error("Error myBookings:", myBookingsResponse.error.message)

    return (
        <main className="flex-1 bg-transparent overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-8">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mes trajets</h1>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Suivi de vos voyages</p>
                </div>

                {/* Dashboard Feed */}
                <DashboardFeed
                    publishedRides={publishedRides || []}
                    myBookings={myBookings || []}
                />
            </div>
        </main>
    )
}
