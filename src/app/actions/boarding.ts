'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Driver confirms that the passenger has entered the vehicle by validating their secret PIN.
 */
export async function confirmOnboarding(requestId: string, inputPin: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Non autorisé")
    }

    // 1. Fetch the request and ensure the caller is the driver of the associated ride
    const { data: request, error: fetchError } = await supabase
        .from('ride_requests')
        .select(`
            id,
            status,
            confirmation_code,
            ride_id,
            rides!inner(driver_id)
        `)
        .eq('id', requestId)
        .single()

    if (fetchError || !request) {
        throw new Error("Réservation introuvable.")
    }

    if ((request.rides as any).driver_id !== user.id) {
        throw new Error("Vous n'êtes pas le conducteur de ce trajet.")
    }

    if (request.status !== 'accepted') {
        throw new Error("Cette réservation ne peut pas être validée (statut: " + request.status + ").")
    }

    // 2. Validate PIN
    if (request.confirmation_code !== inputPin.toUpperCase()) {
        throw new Error("Code PIN invalide. Veuillez demander au passager de vous donner le code affiché sur son application.")
    }

    // 3. Update status to 'onboarded'
    const { error: updateError } = await supabase
        .from('ride_requests')
        .update({ status: 'onboarded' })
        .eq('id', requestId)

    if (updateError) {
        console.error("Boarding confirm error:", updateError)
        throw new Error("Erreur lors de la validation de l'embarquement.")
    }

    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * Driver marks a passenger as "No Show" if they didn't appear for the ride.
 */
export async function markNoShow(requestId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Non autorisé")
    }

    const { data: request, error: fetchError } = await supabase
        .from('ride_requests')
        .select(`
            id,
            status,
            ride_id,
            rides!inner(driver_id)
        `)
        .eq('id', requestId)
        .single()

    if (fetchError || !request) {
        throw new Error("Réservation introuvable.")
    }

    if ((request.rides as any).driver_id !== user.id) {
        throw new Error("Vous n'êtes pas autorisé.")
    }

    // Update status to 'no_show'
    const { error: updateError } = await supabase
        .from('ride_requests')
        .update({ status: 'no_show' })
        .eq('id', requestId)

    if (updateError) {
        throw new Error("Erreur lors du marquage 'Non présent'.")
    }

    revalidatePath('/dashboard')
    return { success: true }
}
