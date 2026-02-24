import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatInterface from './ChatInterface'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function MessagePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Authenticate Request
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch context to ensure the user actually belongs in this chat
    const rideId = params.id
    const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select(`
            id,
            origin,
            destination,
            driver_id
        `)
        .eq('id', rideId)
        .single()

    if (rideError || !ride) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <p className="text-red-600">Trajet introuvable.</p>
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 font-medium">Retour au tableau de bord</Link>
            </div>
        )
    }

    const isDriver = ride.driver_id === user.id

    // Check if the current user is an accepted passenger for this ride
    const { data: acceptedRequest } = await supabase
        .from('ride_requests')
        .select('id')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .eq('status', 'accepted')
        .single()

    const isAcceptedPassenger = !!acceptedRequest

    if (!isDriver && !isAcceptedPassenger) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <p className="text-red-600 text-lg font-semibold">Accès Refusé</p>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Vous devez être le conducteur ou un passager accepté pour discuter sur ce trajet.</p>
                <Link href="/dashboard" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium">Retour au tableau de bord</Link>
            </div>
        )
    }

    // 3. Fetch initial Message History to pre-hydrate the UI
    const { data: rawMessages } = await supabase
        .from('messages')
        .select(`
            id,
            content,
            created_at,
            sender_id,
            users (
                name,
                email
            )
        `)
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true })

    // Supabase returns related `users` joined as an object if it's a 1-to-1 or single mapping usually,
    // but sometimes typing inferences cast it to array if not explicitly .single()
    const initialMessages = (rawMessages || []).map(msg => ({
        ...msg,
        users: Array.isArray(msg.users) ? msg.users[0] : msg.users
    }))

    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Link>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        Discussion
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {ride.origin} <span className="mx-1 text-slate-400">→</span> {ride.destination}
                    </p>
                </div>
            </div>

            <ChatInterface
                rideId={rideId}
                currentUserId={user.id}
                initialMessages={initialMessages as any}
            />
        </div>
    )
}
