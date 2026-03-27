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

    let isAuthorizedPassenger = false
    if (!isDriver) {
        const { data: request, error: reqError } = await supabase
            .from('ride_requests')
            .select('id, status')
            .eq('ride_id', rideId)
            .eq('passenger_id', user.id)
            .in('status', ['accepted', 'pending'])
            .single()

        if (request && !reqError) {
            isAuthorizedPassenger = true
        }
    }

    if (!isDriver && !isAuthorizedPassenger) {
        throw new Error("Vous n'êtes pas autorisé à envoyer des messages sur ce trajet. Vous devez d'abord réserver ce trajet.");
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

    // 4. Create Notifications for recipients
    // We notify the Driver if a passenger sends a message, and notify all associated passengers if the driver (or another passenger) sends a message.
    // For simplicity: Notify anyone who is the Driver OR a Passenger (accepted/pending) excluding the sender.
    
    // Get all potential recipients: Driver + all passengers (accepted/pending)
    const { data: allParticipants } = await supabase
        .from('ride_requests')
        .select('passenger_id')
        .eq('ride_id', rideId)
        .in('status', ['accepted', 'pending']);
    
    const recipients = new Set<string>();
    if (!isDriver) recipients.add(ride.driver_id); // Notify driver if a passenger sent it
    
    (allParticipants || []).forEach(p => {
        if (p.passenger_id !== user.id) {
            recipients.add(p.passenger_id);
        }
    });

    if (recipients.size > 0) {
        const notificationPayloads = Array.from(recipients).map(uid => ({
            user_id: uid,
            title: `Nouveau message`,
            content: `${user.user_metadata?.name || 'Un utilisateur'} a envoyé : "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
            link: `/messages/${rideId}`,
            is_read: false
        }));

        await supabase.from('notifications').insert(notificationPayloads);
    }

    revalidatePath(`/messages/${rideId}`)
    revalidatePath('/alertes')
    return message
}
