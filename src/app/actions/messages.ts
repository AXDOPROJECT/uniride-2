'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(rideId: string, content: string) {
    try {
        if (!content || !content.trim()) {
            return { error: 'Le message ne peut pas être vide' }
        }

        const supabase = await createClient()

        // 1. Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Vous devez être connecté' }
        }

        // 2. Validate authorization (User must be the Driver OR a Passenger with active request)
        const { data: ride, error: rideError } = await supabase
            .from('rides')
            .select('driver_id')
            .eq('id', rideId)
            .single()

        if (rideError || !ride) {
            return { error: 'Trajet introuvable' }
        }

        const isDriver = ride.driver_id === user.id

        let isAuthorizedPassenger = false
        if (!isDriver) {
            const { data: request, error: reqError } = await supabase
                .from('ride_requests')
                .select('id, status')
                .eq('ride_id', rideId)
                .eq('passenger_id', user.id)
                .in('status', ['accepted', 'pending', 'onboarded', 'completed'])
                .maybeSingle()

            if (request && !reqError) {
                isAuthorizedPassenger = true
            }
        }

        if (!isDriver && !isAuthorizedPassenger) {
            return { error: "Vous n'êtes pas autorisé à envoyer des messages sur ce trajet. Vous devez d'abord réserver ce trajet." }
        }

        // Fetch sender name for notification
        const { data: senderUser } = await supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .maybeSingle()

        const senderName = senderUser?.name || user.user_metadata?.name || 'Un utilisateur'

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
            return { error: "Erreur lors de l'envoi du message dans la base de données" }
        }

        // 4. Create Notifications for recipients (Driver + all active Passengers excluding sender)
        const { data: allParticipants } = await supabase
            .from('ride_requests')
            .select('passenger_id')
            .eq('ride_id', rideId)
            .in('status', ['accepted', 'pending', 'onboarded', 'completed'])

        const recipients = new Set<string>();
        if (!isDriver) {
            recipients.add(ride.driver_id);
        }

        if (allParticipants && allParticipants.length > 0) {
            for (const p of allParticipants) {
                if (p.passenger_id !== user.id) {
                    recipients.add(p.passenger_id);
                }
            }
        }

        if (recipients.size > 0) {
            const notificationPayloads = Array.from(recipients).map(uid => ({
                user_id: uid,
                title: `Nouveau message de ${senderName}`,
                content: `"${content.trim().substring(0, 40)}${content.trim().length > 40 ? '...' : ''}"`,
                link: `/messages/${rideId}`,
                is_read: false
            }))

            await supabase.from('notifications').insert(notificationPayloads)
        }

        revalidatePath(`/messages/${rideId}`)
        revalidatePath('/messages')
        revalidatePath('/alertes')
        return { success: true, message }
    } catch (err: any) {
        console.error("Uncaught sendMessage error:", err)
        return { error: err?.message || "Une erreur inattendue est survenue" }
    }
}

