'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookRide(rideId: string) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Vous devez être connecté pour réserver un trajet.")
    }

    // Check if passenger already has a pending or accepted request for this ride
    const { data: existingRequests } = await supabase
        .from('ride_requests')
        .select('id, status')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'accepted'])

    if (existingRequests && existingRequests.length > 0) {
        throw new Error("Vous avez déjà une réservation en cours pour ce trajet.")
    }

    // Check if ride driver is the current user (can't book own ride)
    const { data: ride } = await supabase
        .from('rides')
        .select('driver_id')
        .eq('id', rideId)
        .single()

    if (ride && ride.driver_id === user.id) {
        throw new Error("Vous ne pouvez pas réserver votre propre trajet.")
    }

    const confirmationCode = Math.random().toString(36).substring(2, 6).toUpperCase()

    // Insert pending request
    const { error } = await supabase
        .from('ride_requests')
        .insert({
            ride_id: rideId,
            passenger_id: user.id,
            status: 'pending',
            confirmation_code: confirmationCode
        })

    if (error) {
        console.error("Booking error:", error)
        throw new Error("Erreur lors de la réservation.")
    }

    // Notify Driver
    if (ride?.driver_id) {
        await supabase.from('notifications').insert({
            user_id: ride.driver_id,
            title: "Nouvelle demande de réservation",
            content: "Un passager souhaite rejoindre votre trajet.",
            link: "/dashboard"
        })
    }

    // Revalidate to update UI state
    revalidatePath(`/trajet/${rideId}`)
    revalidatePath('/dashboard')

    return { success: true }
}

export async function acceptRequest(requestId: string, rideId: string) {
    const supabase = await createClient()

    // 1. Get the ride and verify caller is the driver, AND seats are available
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non autorisé")

    const { data: ride } = await supabase
        .from('rides')
        .select('driver_id, available_seats')
        .eq('id', rideId)
        .single()

    if (!ride || ride.driver_id !== user.id) {
        throw new Error("Vous n'êtes pas autorisé à modifier ce trajet.")
    }

    if (ride.available_seats <= 0) {
        throw new Error("Ce trajet est complet.")
    }

    // 2. Decrement seats
    const { error: updateRideError } = await supabase
        .from('rides')
        .update({ available_seats: ride.available_seats - 1 })
        .eq('id', rideId)

    if (updateRideError) throw new Error("Erreur mise à jour des places.")

    // 3. Update Request Status to 'accepted'
    const { data: request, error: updateRequestError } = await supabase
        .from('ride_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('status', 'pending') // Double check it was pending
        .select('passenger_id')
        .single()

    if (updateRequestError) throw new Error("Erreur acceptation de la demande.")

    // 4. Notify Passenger
    if (request && request.passenger_id) {
        await supabase.from('notifications').insert({
            user_id: request.passenger_id,
            title: "Trajet Accepté ! 🎉",
            content: "Le conducteur a accepté votre demande. Vous pouvez maintenant discuter et consulter votre code de confirmation.",
            link: `/messages/${rideId}`
        })
    }

    revalidatePath('/dashboard')
    revalidatePath(`/trajet/${rideId}`)
    return { success: true }
}

export async function rejectRequest(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non autorisé")

    // We rely on RLS/Backend implicitly checking the user is either the passenger cancelling 
    // or driver rejecting, but for MVP we just enforce status update.
    const { data: request, error } = await supabase
        .from('ride_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .select('passenger_id, rides(id)')
        .single()

    if (error) throw new Error("Erreur lors du refus de la demande.")

    if (request && request.passenger_id) {
        await supabase.from('notifications').insert({
            user_id: request.passenger_id,
            title: "Trajet Refusé",
            content: "Le conducteur a malheureusement dû refuser votre demande pour ce trajet."
        })
    }

    revalidatePath('/dashboard')
    return { success: true }
}
