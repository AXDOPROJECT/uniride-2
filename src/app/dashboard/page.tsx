import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, Clock, CheckCircle2, XCircle, MapPin, AlertCircle, MessageCircle, Star } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import ProfileForm from './ProfileForm'
import DriverRequestsManager from './DriverRequestsManager'
import ReviewModal from '@/components/ReviewModal'

export const revalidate = 0;

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Auth guard is handled by middleware, but double check
    if (authError || !user) {
        redirect('/login')
    }

    // Fetch user profile data to feed into the Profile Form
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // Dashboard Fetching Logic
    // 1. If Driver: Fetch rides they published, and attach pending/accepted requests
    const { data: publishedRides } = await supabase
        .from('rides')
        .select(`
            *,
            requests:ride_requests(
                id, status, passenger_id, created_at,
                passenger:users!ride_requests_passenger_id_fkey(name, phone, email)
            )
        `)
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: true })

    // 2. If Passenger: Fetch ride requests they made, and attach the ride details
    const { data: myBookings } = await supabase
        .from('ride_requests')
        .select(`
            id, status, created_at,
            ride:rides(
                id, origin, destination, departure_time, price,
                driver:users!rides_driver_id_fkey(name, phone)
            )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false })

    const isDriver = publishedRides && publishedRides.length > 0;
    const isPassenger = myBookings && myBookings.length > 0;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Mon Espace UNIRIDE
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Bonjour, {profile?.name || user.email}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/proposer" className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        Nouveau Trajet
                    </Link>
                    <LogoutButton />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Management / Activity */}
                <div className="lg:col-span-2 space-y-8">

                    {/* DRIVER SECTION */}
                    {isDriver && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <Car className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Mes Trajets Publiés
                            </h2>
                            <div className="grid gap-6">
                                {publishedRides.map(ride => (
                                    <div key={ride.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {new Date(ride.departure_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[200px]">{ride.origin}</span>
                                                    <span>→</span>
                                                    <span className="truncate max-w-[200px]">{ride.destination}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
                                                    {ride.available_seats} places restantes
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            {/* Requests associated with this published ride */}
                                            <DriverRequestsManager rideId={ride.id} requests={ride.requests} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* PASSENGER SECTION */}
                    {isPassenger && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Mes Réservations
                            </h2>
                            <div className="grid gap-4">
                                {myBookings.map((booking: any) => (
                                    <div key={booking.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="space-y-1">
                                            <Link href={`/trajet/${booking.ride.id}`} className="hover:text-indigo-600 transition-colors">
                                                <p className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                                                    {new Date(booking.ride.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </Link>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-sm">
                                                {booking.ride.origin} → {booking.ride.destination}
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                                Conducteur: {booking.ride.driver?.name || 'Inconnu'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:items-end justify-between">
                                            <div className="font-bold text-slate-900 dark:text-white">{booking.ride.price} €</div>

                                            {/* Status Badge */}
                                            <div className="mt-2 flex flex-col items-end gap-2">
                                                {booking.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20">
                                                        <Clock className="w-3 h-3" /> En attente
                                                    </span>
                                                )}
                                                {booking.status === 'accepted' && (
                                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20 justify-center">
                                                            <CheckCircle2 className="w-3 h-3" /> Accepté !
                                                        </span>
                                                        <Link
                                                            href={`/messages/${booking.ride.id}`}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                                        >
                                                            <MessageCircle className="w-3.5 h-3.5" /> Messages
                                                        </Link>

                                                        {/* Native Review Modal Trigger mapped explicitly to accepted rides and passed up to the Server Action */}
                                                        {booking.ride.driver?.id && (
                                                            <ReviewModal
                                                                rideId={booking.ride.id}
                                                                driverId={booking.ride.driver.id}
                                                                driverName={booking.ride.driver.name || 'Conducteur'}
                                                                triggerElement={
                                                                    <button className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30 justify-center hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer">
                                                                        <Star className="w-3.5 h-3.5" /> Noter
                                                                    </button>
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {booking.status === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-400/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10">
                                                        <XCircle className="w-3 h-3" /> Refusé
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isDriver && !isPassenger && (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                            <Car className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">Aucun trajet</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Vous n'avez pas encore publié ni réservé de trajet.
                            </p>
                            <div className="mt-6 flex justify-center gap-4">
                                <Link href="/rechercher" className="inline-flex items-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">
                                    Trouver un trajet
                                </Link>
                                <Link href="/proposer" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                    Publier un trajet
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Profile & Settings */}
                <div className="space-y-8">
                    <ProfileForm
                        initialName={profile?.name}
                        initialPhone={profile?.phone}
                        isVerified={profile?.verified_license}
                    />

                    {/* Quick Security Tip Widget */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800/30">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400">Sécurité Campus</h3>
                                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
                                    Vérifiez toujours l'identité du conducteur ou du passager avant de monter à bord. Le paiement se fait traditionnellement en espèces ou Lydia à la fin du trajet.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
