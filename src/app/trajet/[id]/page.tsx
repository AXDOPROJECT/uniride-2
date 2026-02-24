import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Euro, MapPin, Users, ShieldCheck, ArrowLeft, Info, MessageCircle, Star } from 'lucide-react'
import BookingButton from './BookingButton'
import ReportModal from '@/components/ReportModal'

export const revalidate = 0; // Ensure fresh data on load

export default async function Page({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Get current user to determine booking access
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch the ride with the driver relation, and compute their rating organically from the DB
    const { data: ride, error } = await supabase
        .from('rides')
        .select(`
            *,
            driver:users!rides_driver_id_fkey(
                name, 
                email, 
                verified_license, 
                phone,
                reviews:reviews!reviews_reviewee_id_fkey(rating)
            )
        `)
        .eq('id', params.id)
        .single()

    if (error || !ride) {
        notFound()
    }

    // Process Driver Rating directly on the server component
    let avgRating = 0;
    let totalReviews = 0;

    if (ride.driver && ride.driver.reviews) {
        const reviewsArray = Array.isArray(ride.driver.reviews) ? ride.driver.reviews : [ride.driver.reviews];
        if (reviewsArray.length > 0) {
            totalReviews = reviewsArray.length;
            const sum = reviewsArray.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0);
            avgRating = Number((sum / totalReviews).toFixed(1));
        }
    }

    // Check if the current user already has a pending or accepted request for this ride
    let userHasRequested = false;
    let requestStatus = null;

    if (user && user.id !== ride.driver_id) {
        const { data: existingRequest } = await supabase
            .from('ride_requests')
            .select('status')
            .eq('ride_id', ride.id)
            .eq('passenger_id', user.id)
            .single()

        if (existingRequest) {
            userHasRequested = true;
            requestStatus = existingRequest.status;
        }
    }

    const isDriver = user?.id === ride.driver_id;
    const isFull = ride.available_seats === 0;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link href="/rechercher" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux résultats
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header / Route */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Détails du Trajet</h1>

                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1.5">
                            <div className="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                            <div className="w-0.5 h-10 bg-slate-200 dark:bg-slate-600"></div>
                            <div className="w-3 h-3 rounded-full border-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-800"></div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Point de départ</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                                    {ride.origin}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Destination d'arrivée</p>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                                    {ride.destination}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Informations</h2>

                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Date et heure</p>
                                <p className="font-medium">
                                    {new Date(ride.departure_time).toLocaleString('fr-FR', {
                                        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <Euro className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tarif par passager</p>
                                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{ride.price} €</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Disponibilité</p>
                                <p className="font-medium">{ride.available_seats} {ride.available_seats <= 1 ? 'place restante' : 'places restantes'} sur {ride.total_seats}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conducteur</h2>

                        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xl font-bold">
                                {ride.driver?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold text-slate-900 dark:text-white text-lg">{ride.driver?.name || 'Utilisateur Anonyme'}</p>

                                    {/* Rating Display */}
                                    {avgRating > 0 && (
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded text-sm font-medium text-amber-600 dark:text-amber-400">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                            <span>{avgRating} <span className="text-amber-600/60 dark:text-amber-400/60 font-normal">({totalReviews})</span></span>
                                        </div>
                                    )}
                                </div>

                                {ride.driver?.verified_license ? (
                                    <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Permis vérifié</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <Info className="w-4 h-4" />
                                        <span>Permis non vérifié</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Report User Button for logged-in passengers */}
                        {user && !isDriver && (
                            <div className="flex justify-end pr-2">
                                <ReportModal
                                    reportedUserId={ride.driver_id}
                                    reportedUserName={ride.driver?.name || "L'utilisateur"}
                                    rideId={ride.id}
                                />
                            </div>
                        )}

                        {/* ACTION AREA */}
                        <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-700">
                            {!user ? (
                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/30">
                                    <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">Connectez-vous pour réserver ce trajet.</p>
                                    <Link href="/login" className="inline-block px-4 py-2 border border-orange-200 dark:border-orange-700/50 rounded-md text-sm font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                                        Se connecter
                                    </Link>
                                </div>
                            ) : isDriver ? (
                                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    Ceci est votre trajet publié.
                                </div>
                            ) : userHasRequested ? (
                                <div className="text-center p-4 rounded-lg border bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30">
                                    <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-1">
                                        {requestStatus === 'pending' ? 'Demande envoyée !' : 'Demande acceptée !'}
                                    </h3>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">
                                        {requestStatus === 'pending'
                                            ? "En attente de confirmation par le conducteur."
                                            : "Le conducteur a validé votre réservation."}
                                    </p>
                                    {requestStatus === 'accepted' && (
                                        <Link href="/messages" className="mt-4 flex w-full justify-center items-center gap-2 rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                                            <MessageCircle className="w-4 h-4" /> Discuter avec le conducteur
                                        </Link>
                                    )}
                                </div>
                            ) : isFull ? (
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 font-medium">
                                    Complet - Aucune place disponible
                                </div>
                            ) : (
                                // The actual Booking Button Client Component
                                <BookingButton rideId={ride.id} />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
