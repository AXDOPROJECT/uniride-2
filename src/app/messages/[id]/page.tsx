import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatInterface from './ChatInterface'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0;

export default async function MessagePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = await paramsPromise
    const supabase = await createClient()

    // 1. Authenticate Request
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    const rideId = params.id

    // 2. Fetch critical Ride Info (minimal join that we know works)
    const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select(`
            id,
            origin,
            destination,
            driver_id,
            driver:users!rides_driver_id_fkey(id, name, phone)
        `)
        .eq('id', rideId)
        .single()

    if (rideError || !ride) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <p className="text-red-600">Trajet introuvable.</p>
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 font-medium font-bold">Retour au tableau de bord</Link>
            </div>
        )
    }

    const isDriver = ride.driver_id === user.id

    // Check if the current user is a passenger with an relevant request
    const { data: userRequest } = await supabase
        .from('ride_requests')
        .select('id, status')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'accepted', 'onboarded'])
        .maybeSingle()

    const isPassenger = !!userRequest

    if (!isDriver && !isPassenger) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-12 text-center space-y-4">
                <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/20 inline-block">
                   <p className="text-red-600 text-lg font-black uppercase">Accès Refusé</p>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-bold">Vous n'êtes pas autorisé à accéder à cette conversation.</p>
                <Link href="/dashboard" className="premium-btn py-3 px-8 mt-4 inline-flex">Retour au tableau de bord</Link>
            </div>
        )
    }

    // 3. Fetch partners (all people with accepted/onboarded status)
    // We do this via a separate query to be absolutely safe with FK joins
    const { data: requestsWithPartners } = await supabase
        .from('ride_requests')
        .select(`
            status,
            passenger:users!ride_requests_passenger_id_fkey(name, phone)
        `)
        .eq('ride_id', rideId)
        .in('status', ['accepted', 'onboarded'])

    // Initial partner: The driver
    const driverData: any = Array.isArray(ride.driver) ? ride.driver[0] : ride.driver
    let chatPartners: { name: string, phone: string | null, role: string }[] = []

    if (isDriver) {
        // Driver sees all accepted passengers
        chatPartners = (requestsWithPartners || []).map((req: any) => ({
            name: req.passenger?.name || 'Passager',
            phone: req.passenger?.phone || null,
            role: 'Passager'
        }))
    } else {
        // Passenger sees the driver
        chatPartners = [{
            name: driverData?.name || 'Conducteur',
            phone: driverData?.phone || null,
            role: 'Conducteur'
        }]
    }

    // 4. Fetch Message History
    let initialMessages: any[] = []
    try {
        const { data: rawMessages, error: msgError } = await supabase
            .from('messages')
            .select(`
                id,
                content,
                created_at,
                sender_id,
                sender:users!messages_sender_id_fkey(
                    name,
                    email
                )
            `)
            .eq('ride_id', rideId)
            .order('created_at', { ascending: true })

        if (!msgError && rawMessages) {
            initialMessages = rawMessages.map(msg => ({
                ...msg,
                users: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
            }))
        }
    } catch (e) {
        console.error('Error fetching messages:', e)
        // Continue with empty messages rather than crashing
    }

    return (
        <main className="flex-1 bg-transparent overflow-y-auto">
            <div className="mx-auto max-w-xl px-6 pt-10 pb-24 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95 inline-flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <ArrowLeft className="w-5 h-5" /> Retour
                        </Link>
                        <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white uppercase leading-tight italic">
                            Discussion
                        </h1>
                        <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mt-1">
                            {ride.origin} <span className="text-brand-purple">→</span> {ride.destination}
                        </p>
                    </div>
                </div>

                <ChatInterface
                    rideId={rideId}
                    currentUserId={user.id}
                    initialMessages={initialMessages as any}
                    chatPartners={chatPartners}
                />
            </div>
        </main>
    )
}
