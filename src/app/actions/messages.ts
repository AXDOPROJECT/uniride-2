'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(rideId: string, content: string) {
    if (!content.trim()) {
        throw new Error('Le message ne peut pas être vide')
    }

    const supabase = await createClient()

    // 1. Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Non autorisé')
    }

    // 2. Validate authorization (User must be the Driver OR an Accepted Passenger)
    const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('driver_id')
        .eq('id', rideId)
        .single()

    if (rideError || !ride) {
        throw new Error('Trajet introuvable')
    }

    const isDriver = ride.driver_id === user.id

    let isAcceptedPassenger = false
    if (!isDriver) {
        const { data: request, error: reqError } = await supabase
            .from('ride_requests')
            .select('id')
            .eq('ride_id', rideId)
            .eq('passenger_id', user.id)
            .eq('status', 'accepted')
            .single()

        if (request && !reqError) {
            isAcceptedPassenger = true
        }
    }

    if (!isDriver && !isAcceptedPassenger) {
        throw new Error("Vous n'êtes pas autorisé à envoyer des messages sur ce trajet. Votre demande doit être acceptée.");
    }

    // 3. Insert the message
    const { data: message, error: insertError } = await supabase
        .from('messages')
        .insert({
            ride_id: rideId,
            sender_id: user.id,
            content: content.trim()
        })
        .select()
        .single()

    if (insertError) {
        console.error("Erreur insertion message:", insertError)
        throw new Error("Erreur lors de l'envoi du message")
    }

    revalidatePath(`/messages/${rideId}`)
    return message
}
