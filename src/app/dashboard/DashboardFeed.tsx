'use client'

import { useState } from 'react'
import { Car, Clock, CheckCircle2, XCircle, MapPin, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'
import DriverRequestsManager from './DriverRequestsManager'
import ReviewModal from '@/components/ReviewModal'
import { cn } from '@/utils/cn'

export default function DashboardFeed({ publishedRides, myBookings }: { publishedRides: any[], myBookings: any[] }) {
    const isDriver = publishedRides && publishedRides.length > 0;
    const isPassenger = myBookings && myBookings.length > 0;

    // Default tab logic based on user state
    const [activeTab, setActiveTab] = useState<'driver' | 'passenger'>(
        isDriver ? 'driver' : (isPassenger ? 'passenger' : 'driver')
    )

    if (!isDriver && !isPassenger) {
        return (
            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                <Car className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Aucun trajet</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Vous n'avez pas encore publié ni réservé de trajet.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/rechercher" className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-white dark:bg-slate-700 px-6 py-3.5 text-sm font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all">
                        Trouver un trajet
                    </Link>
                    <Link href="/proposer" className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all">
                        Publier un trajet
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Mobile Tab Segment Control */}
            {isDriver && isPassenger && (
                <div className="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                    <button
                        onClick={() => setActiveTab('driver')}
                        className={cn(
                            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
                            activeTab === 'driver'
                                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                        )}
                    >
                        Mes Activités Pro
                    </button>
                    <button
                        onClick={() => setActiveTab('passenger')}
                        className={cn(
                            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all",
                            activeTab === 'passenger'
                                ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                        )}
                    >
                        Mes Passagers
                    </button>
                </div>
            )}

            {/* DRIVER FEED */}
            {activeTab === 'driver' && isDriver && (
                <div className="grid gap-6">
                    {publishedRides.map(ride => (
                        <div key={ride.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {new Date(ride.departure_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4 flex-shrink-0 text-indigo-500" />
                                        <span className="truncate">{ride.origin}</span>
                                        <span className="text-slate-400">→</span>
                                        <span className="truncate">{ride.destination}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center sm:block">
                                    <span className="sm:hidden text-lg font-bold text-slate-900 dark:text-white">{ride.price} €</span>
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
                                        {ride.available_seats} places restantes
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5">
                                <DriverRequestsManager rideId={ride.id} requests={ride.requests} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PASSENGER FEED */}
            {activeTab === 'passenger' && isPassenger && (
                <div className="grid gap-4">
                    {myBookings.map((booking: any) => (
                        <div key={booking.id} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">

                            <div className="flex justify-between items-start gap-4">
                                <Link href={`/trajet/${booking.ride.id}`} className="space-y-1 block hover:opacity-80 transition-opacity flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-white text-base">
                                        {new Date(booking.ride.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {booking.ride.origin} → {booking.ride.destination}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-2">
                                        Par: {booking.ride.driver?.name || 'Inconnu'}
                                    </p>
                                </Link>
                                <div className="font-bold text-lg text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 px-3 py-1 rounded-lg">
                                    {booking.ride.price} €
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                                {booking.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-400/10 px-3 py-1.5 text-xs font-bold text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20">
                                        <Clock className="w-4 h-4" /> En attente
                                    </span>
                                )}
                                {booking.status === 'rejected' && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-400/10 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10">
                                        <XCircle className="w-4 h-4" /> Refusé
                                    </span>
                                )}
                                {booking.status === 'accepted' && (
                                    <>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
                                            <CheckCircle2 className="w-4 h-4" /> Accepté !
                                        </span>
                                        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                            <Link
                                                href={`/messages/${booking.ride.id}`}
                                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors active:scale-95"
                                            >
                                                <MessageCircle className="w-4 h-4" /> Messages
                                            </Link>
                                            {booking.ride.driver?.id && (
                                                <div className="flex-1 sm:flex-none">
                                                    <ReviewModal
                                                        rideId={booking.ride.id}
                                                        driverId={booking.ride.driver.id}
                                                        driverName={booking.ride.driver.name || 'Conducteur'}
                                                        triggerElement={
                                                            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors active:scale-95">
                                                                <Star className="w-4 h-4" /> Noter
                                                            </button>
                                                        }
                                                    />
                                                </div>
                                            )}
                                            {booking.confirmation_code && (
                                                <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-mono font-bold tracking-widest text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                                                    PIN: {booking.confirmation_code}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
