'use server'

import { createClient } from '@/utils/supabase/server'

export async function reportUser(reportedUserId: string, reason: string, description: string, rideId?: string) {
    if (!reason || !description) {
        throw new Error('Le motif et la description sont obligatoires.');
    }

    const supabase = await createClient()

    // 1. Authenticate Request
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Non autorisé');
    }

    // 2. Prevent self-reporting
    if (user.id === reportedUserId) {
        throw new Error('Vous ne pouvez pas vous signaler vous-même.');
    }

    // 3. Submit payload to the `alerts` table natively
    const { error: insertError } = await supabase
        .from('alerts')
        .insert({
            reporter_id: user.id,
            reported_id: reportedUserId,
            ride_id: rideId || null,
            reason: reason,
            description: description.trim(),
            status: 'pending' // Default status for admin review
        });

    if (insertError) {
        console.error("Erreur insertion signalement:", insertError);
        throw new Error("Erreur lors de l'envoi du signalement.");
    }

    return { success: true };
}
