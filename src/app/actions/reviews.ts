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

    // 3. Verify that the reviewer and reviewee were part of the SAME ride.
    // Case A: Reviewer is Passenger, Reviewee is Driver
    // Case B: Reviewer is Driver, Reviewee is Passenger

    // First, check if the ride exists and get its driver
    const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('driver_id')
        .eq('id', rideId)
        .single();

    if (rideError || !ride) {
        throw new Error("Trajet introuvable");
    }

    // Now, verify the relationship based on roles
    let isAuthorized = false;

    if (user.id === ride.driver_id) {
        // Reviewer is the driver. The reviewee must be an accepted/onboarded/completed passenger for THIS ride.
        const { data: request } = await supabase
            .from('ride_requests')
            .select('id')
            .eq('ride_id', rideId)
            .eq('passenger_id', revieweeId)
            .in('status', ['accepted', 'onboarded', 'completed'])
            .single();

        if (request) isAuthorized = true;
    } else {
        // Reviewer is NOT the driver, so they MUST be a passenger rating the driver.
        // Therefore, the reviewee MUST be the driver.
        if (revieweeId === ride.driver_id) {
            const { data: request } = await supabase
                .from('ride_requests')
                .select('id')
                .eq('ride_id', rideId)
                .eq('passenger_id', user.id)
                .in('status', ['accepted', 'onboarded', 'completed'])
                .single();

            if (request) isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        throw new Error("Vous n'êtes pas autorisé à laisser un avis pour cet utilisateur sur ce trajet.");
    }

    const { error: insertError } = await supabase
        .from('reviews')
        .insert({
            reviewer_id: user.id,
            reviewee_id: revieweeId,
            ride_id: rideId,
            rating: rating,
            comment: comment.trim() || null
        });

    if (insertError) {
        console.error("Erreur insertion avis:", insertError);
        if (insertError.code === '23505') {
            throw new Error("Vous avez déjà laissé un avis pour ce trajet");
        }
        throw new Error("Erreur lors de la soumission de l'avis");
    }

    // 5. Deductive Rating Logic: If rating < 3, decrement reviewee's total rating by 0.25
    if (rating < 3) {
        const { data: currentReviewee } = await supabase
            .from('users')
            .select('rating')
            .eq('id', revieweeId)
            .single()

        const currentRating = currentReviewee?.rating || 5.0
        const newRating = Math.max(0, currentRating - 0.25)
        const shouldBlock = newRating <= 2.0

        await supabase
            .from('users')
            .update({
                rating: newRating,
                is_blocked: shouldBlock
            })
            .eq('id', revieweeId)
    }

    // 6. Revalidate common pathways where reviews might be displayed
    revalidatePath('/dashboard');
    revalidatePath(`/trajet/${rideId}`);

    return { success: true };
}
