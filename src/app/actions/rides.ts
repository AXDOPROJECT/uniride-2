'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Location } from '@/types/location'

export async function publishRide(
    origin: Location,
    destination: Location,
    dateStr: string,
    seats: number,
    price: number
) {
    const supabase = await createClient()

    // Verify the user is authenticated securely on the server
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Vous devez être connecté pour publier un trajet.')
    }

    // Insert the ride into the `rides` table
    const { error } = await supabase
        .from('rides')
        .insert({
            driver_id: user.id, // Supabase user ID linking to public.users via RLS and triggers
            origin: origin.address, // We save the text string for display, though we could save lat/lon too
            destination: destination.address,
            departure_time: new Date(dateStr).toISOString(),
            total_seats: seats,
            available_seats: seats, // Initially all seats are available
            price: price
        })

    if (error) {
        console.error('Error publishing ride:', error)
        throw new Error('Erreur lors de la publication du trajet.')
    }

    // Revalidate the dashboard and home
    revalidatePath('/dashboard')
    revalidatePath('/')

    // Redirect to dashboard with success message
    redirect('/dashboard?success=Trajet%20publié%20avec%20succès')
}

export async function searchRides(originQuery: string, destinationQuery: string, dateStr?: string) {
    const supabase = await createClient()

    // Base query: Only scheduled rides with available seats. We also join the driver's name using public.users relation.
    // We also join reviews to compute dynamic rating averages for the driver.
    let query = supabase
        .from('rides')
        .select(`
      *,
      driver:users!rides_driver_id_fkey(
          name, 
          email, 
          verified_license,
          reviews:reviews!reviews_reviewee_id_fkey(rating)
      )
    `)
        .eq('status', 'scheduled')
        .gt('available_seats', 0)

    // Extract core keywords to filter loosely. Nominatim strings can be very long.
    // Example: "Avenue des facultés, Pessac" -> we'll just check if it contains "Pessac" or the first significant word if possible,
    // For MVP, we'll split by comma and use the first reasonably sized word to ILIKE match.

    if (originQuery) {
        const originFirstPart = originQuery.split(',')[0].trim()
        if (originFirstPart) {
            query = query.ilike('origin', `%${originFirstPart}%`)
        }
    }

    if (destinationQuery) {
        const destFirstPart = destinationQuery.split(',')[0].trim()
        if (destFirstPart) {
            query = query.ilike('destination', `%${destFirstPart}%`)
        }
    }

    if (dateStr) {
        // If a date is provided, find rides starting from the beginning of that day
        const searchDate = new Date(dateStr)
        const startDateISO = new Date(searchDate.setHours(0, 0, 0, 0)).toISOString()
        const endDateISO = new Date(searchDate.setHours(23, 59, 59, 999)).toISOString()

        query = query.gte('departure_time', startDateISO).lte('departure_time', endDateISO)
    }

    // Order by departure time by default
    query = query.order('departure_time', { ascending: true })

    const { data, error } = await query

    if (error) {
        console.error('Error searching rides:', error)
        throw new Error('Impossible de rechercher les trajets.')
    }

    // Process reviews into clean averages to avoid sending massive arrays of review payloads to the client
    const processedData = (data || []).map(ride => {
        let avgRating = 0;
        let totalReviews = 0;

        if (ride.driver && ride.driver.reviews) {
            const reviewsArray = Array.isArray(ride.driver.reviews) ? ride.driver.reviews : [ride.driver.reviews]
            if (reviewsArray.length > 0) {
                totalReviews = reviewsArray.length;
                const sum = reviewsArray.reduce((acc: number, curr: { rating?: number | null }) => acc + (curr.rating || 0), 0);
                avgRating = Number((sum / totalReviews).toFixed(1));
            }
        }

        // Return a cleaner object omitting the raw unneeded review array
        return {
            ...ride,
            driver: ride.driver ? {
                name: ride.driver.name,
                email: ride.driver.email,
                verified_license: ride.driver.verified_license,
                avg_rating: avgRating,
                total_reviews: totalReviews
            } : null
        }
    });

    return processedData
}
