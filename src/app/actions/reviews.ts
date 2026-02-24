'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(rideId: string, revieweeId: string, rating: number, comment: string) {
    if (rating < 1 || rating > 5) {
        throw new Error('La note doit être comprise entre 1 et 5 étoiles');
    }

    const supabase = await createClient()

    // 1. Authenticate Request
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error('Non autorisé');
    }

    // 2. Prevent self-review
    if (user.id === revieweeId) {
        throw new Error('Vous ne pouvez pas vous évaluer vous-même');
    }

    // 3. Verify that the current user was ACTUALLY an accepted passenger for this EXACT ride
    const { data: request, error: reqError } = await supabase
        .from('ride_requests')
        .select('id, status')
        .eq('ride_id', rideId)
        .eq('passenger_id', user.id)
        .eq('status', 'accepted')
        .single();

    if (reqError || !request) {
        throw new Error("Vous devez être un passager accepté sur ce trajet pour laisser un avis");
    }

    // 4. Submit payload
    const { error: insertError } = await supabase
        .from('reviews')
        .insert({
            reviewer_id: user.id,
            reviewee_id: revieweeId,
            ride_id: rideId,
            rating: rating,
            comment: comment.trim() || null
        });

    // Postgres Unique Constraints: The `reviews` table has a primary key or unique index on (ride_id, reviewer_id, reviewee_id)
    // Supabase will automatically block duplicate inserts here.
    if (insertError) {
        console.error("Erreur insertion avis:", insertError);
        // Map common duplicate constraint errors to friendly UI messages
        if (insertError.code === '23505') {
            throw new Error("Vous avez déjà laissé un avis pour ce trajet");
        }
        throw new Error("Erreur lors de la soumission de l'avis");
    }

    // 5. Revalidate common pathways where reviews might be displayed
    revalidatePath('/dashboard');
    revalidatePath(`/trajet/${rideId}`);

    return { success: true };
}
