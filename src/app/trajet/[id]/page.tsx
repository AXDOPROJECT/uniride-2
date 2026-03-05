import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Euro, MapPin, Users, ShieldCheck, ArrowLeft, Info, MessageCircle, Star } from 'lucide-react'
import BookingButton from './BookingButton'
import ReportModal from '@/components/ReportModal'

export const revalidate = 0; // Ensure fresh data on load

export default async function Page({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = await paramsPromise
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
    let userConfirmationCode = null;

    if (user && user.id !== ride.driver_id) {
        const { data: existingRequest } = await supabase
            .from('ride_requests')
            .select('status, confirmation_code')
            .eq('ride_id', ride.id)
            .eq('passenger_id', user.id)
            .in('status', ['pending', 'accepted', 'onboarded'])
            .maybeSingle()

        if (existingRequest) {
            userHasRequested = true;
            requestStatus = existingRequest.status;
            userConfirmationCode = existingRequest.confirmation_code;
        }
    }

    // Check if eligible for card payment (>= 2 onboarded rides with this driver)
    let cardEligible = false;
    if (user && ride.driver_id) {
        const { data: previousRides } = await supabase
            .from('ride_requests')
            .select('id, rides!inner(driver_id)')
            .eq('passenger_id', user.id)
            .eq('status', 'onboarded')
            .eq('rides.driver_id', ride.driver_id)

        cardEligible = (previousRides?.length || 0) >= 2;
    }

    const isDriver = user?.id === ride.driver_id;

    const isFull = ride.available_seats === 0;

    return (
        <main className="flex-1 bg-slate-50 dark:bg-black/50 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-8">

                {/* Back Button */}
                <div className="flex items-center">
                    <Link href="/rechercher" className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm transition-all active:scale-95">
                        <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
                    </Link>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Header Card */}
                    <div className="premium-card p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Détails du Trajet</h1>
                                <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                                    {new Date(ride.departure_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-brand-purple">{ride.price}€</span>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Tarif étudiant</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 pt-4">
                            <div className="flex flex-col items-center gap-1 py-1">
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-purple bg-white" />
                                <div className="w-0.5 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                            </div>
                            <div className="space-y-8 flex-1">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Départ</p>
                                    <p className="font-bold text-slate-900 dark:text-zinc-100">{ride.origin}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrivée</p>
                                    <p className="font-bold text-slate-900 dark:text-zinc-100">{ride.destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logistics & Driver */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Driver Card */}
                        <div className="premium-card p-6 space-y-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Conducteur</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-brand-purple shadow-lg shadow-brand-purple/20 flex items-center justify-center text-white text-2xl font-black">
                                    {ride.driver?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase truncate">
                                        {ride.driver?.name || 'Étudiant'}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                                            <Star className="w-4 h-4 fill-amber-500" />
                                            <span>{avgRating || '5.0'}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">({totalReviews} avis)</span>
                                    </div>
                                </div>
                                {ride.driver?.verified_license && (
                                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specs Card */}
                        <div className="premium-card p-6 flex justify-around">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Heure</p>
                                <p className="font-black text-slate-900 dark:text-white text-lg">
                                    {new Date(ride.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="w-px h-10 bg-slate-100 dark:bg-zinc-800" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Places</p>
                                <p className="font-black text-slate-900 dark:text-white text-lg">
                                    {ride.available_seats} / {ride.total_seats}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-4">
                        {!user ? (
                            <div className="premium-card p-6 text-center space-y-4 border-dashed border-2">
                                <p className="text-sm font-bold text-slate-500">Connectez-vous pour réserver.</p>
                                <Link href="/login" className="flex w-full justify-center rounded-3xl bg-slate-900 dark:bg-white dark:text-black py-4 text-base font-black shadow-lg">
                                    SE CONNECTER
                                </Link>
                            </div>
                        ) : isDriver ? (
                            <div className="premium-card p-6 text-center text-slate-500 font-bold bg-slate-50 border-none">
                                Ceci est votre trajet.
                            </div>
                        ) : userHasRequested ? (
                            <div className="premium-card p-6 text-center space-y-6 border-brand-purple/20 bg-brand-purple/5">
                                <div className="space-y-1">
                                    <h3 className="text-brand-purple font-black text-lg">
                                        {requestStatus === 'pending' ? 'DEMANDE ENVOYÉE !' : 'DEMANDE ACCEPTÉE !'}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500">
                                        {requestStatus === 'pending'
                                            ? "Le conducteur doit confirmer votre demande."
                                            : "Préparez vos bagages, le voyage arrive !"}
                                    </p>
                                </div>

                                {/* PIN Visibility Fix */}
                                {requestStatus && (requestStatus === 'pending' || requestStatus === 'accepted') && userConfirmationCode && (
                                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border-2 border-brand-purple/20 shadow-sm space-y-2">
                                        <span className="text-[10px] font-black text-brand-purple uppercase tracking-widest opacity-60">Votre Code PIN Embarquement</span>
                                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-[0.5em] font-mono">
                                            {userConfirmationCode}
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 mt-2">
                                            Donnez ce code au conducteur <br /> lors de l'embarquement.
                                        </p>
                                    </div>
                                )}

                                {requestStatus === 'accepted' && (
                                    <Link href={`/messages/${ride.id}`} className="flex w-full justify-center items-center gap-2 rounded-3xl bg-brand-purple py-4 text-base font-black text-white shadow-lg shadow-brand-purple/30">
                                        <MessageCircle className="w-5 h-5" /> DISCUTER
                                    </Link>
                                )}
                            </div>
                        ) : isFull ? (
                            <div className="premium-card p-6 text-center text-red-500 font-black bg-red-50 dark:bg-red-900/20 border-none">
                                TRAJET COMPLET
                            </div>
                        ) : (
                            <BookingButton rideId={ride.id} cardEligible={cardEligible} />
                        )}
                    </div>

                    {/* Report Modal Access */}
                    {user && !isDriver && (
                        <div className="flex justify-center pt-4">
                            <ReportModal
                                reportedUserId={ride.driver_id}
                                reportedUserName={ride.driver?.name || "Le conducteur"}
                                rideId={ride.id}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
