'use client'

import { useState, useTransition, useMemo } from 'react'
import { Car, Clock, CheckCircle2, XCircle, MapPin, MessageCircle, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DriverRequestsManager from './DriverRequestsManager'
import ReviewModal from '@/components/ReviewModal'
import { cancelRideRequest, deleteRide, completeRide, hideRideFromHistory, hideBookingFromHistory } from '@/app/actions/rides'
import { cn } from '@/utils/cn'

type DashboardFeedProps = {
    publishedRides: any[];
    myBookings: any[];
}

export default function DashboardFeed({ publishedRides, myBookings }: DashboardFeedProps) {
    const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'past'>('current')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const tabs = [
        { id: 'current', label: 'En cours' },
        { id: 'upcoming', label: 'À venir' },
        { id: 'past', label: 'Passés' },
    ] as const

    // Filtering logic for the tabs
    const filteredContent = useMemo(() => {
        const now = new Date()

        if (activeTab === 'current') {
            // "En cours": 
            // - Driver: Ride is 'scheduled' but has 'onboarded' passengers OR the departure time has passed.
            // - Passenger: Request status is 'onboarded'.
            return [
                ...publishedRides
                    .filter(r => {
                        const isScheduled = r.status === 'scheduled' || r.status === 'ongoing';
                        const hasOnboarded = r.requests?.some((req: any) => req.status === 'onboarded');
                        const isPastDeparture = new Date(r.departure_time) <= now;
                        return isScheduled && (hasOnboarded || isPastDeparture);
                    })
                    .map(r => ({ ...r, role: 'driver' })),
                ...myBookings
                    .filter(b => b.status === 'onboarded')
                    .map(b => ({
                        ...(b.ride || {}),
                        role: 'passenger',
                        bookingId: b.id,
                        status: b.status,
                        confirmation_code: b.confirmation_code
                    }))
            ].filter(item => item.id).sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
        }

        if (activeTab === 'upcoming') {
            // "À venir": 
            // - Driver: Scheduled rides with NO onboarded passenger yet AND departure time is in the future.
            // - Passenger: Requests that are 'pending' or 'accepted'.
            return [
                ...publishedRides
                    .filter(r => {
                        const isScheduled = r.status === 'scheduled';
                        const hasNoActivePassengers = !r.requests || !r.requests.some((req: any) => req.status === 'onboarded' || req.status === 'completed');
                        const isFuture = new Date(r.departure_time) > now;
                        return isScheduled && hasNoActivePassengers && isFuture && !r.is_hidden_by_driver;
                    })
                    .map(r => ({ ...r, role: 'driver' })),
                ...myBookings
                    .filter(b => (b.status === 'accepted' || b.status === 'pending') && !b.is_hidden_by_passenger)
                    .map(b => ({
                        ...(b.ride || {}),
                        role: 'passenger',
                        bookingId: b.id,
                        status: b.status,
                        confirmation_code: b.confirmation_code
                    }))
            ].filter(item => item.id).sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
        }

        if (activeTab === 'past') {
            // "Passés": 
            // - Driver: Rides explicitly marked as 'completed'.
            // - Passenger: Requests explicitly marked as 'completed' (or 'no_show').
            return [
                ...publishedRides
                    .filter(r => r.status === 'completed' && !r.is_hidden_by_driver)
                    .map(r => ({ ...r, role: 'driver' })),
                ...myBookings
                    .filter(b => (b.status === 'completed' || b.status === 'no_show') && !b.is_hidden_by_passenger)
                    .map(b => ({
                        ...(b.ride || {}),
                        role: 'passenger',
                        bookingId: b.id,
                        status: b.status
                    }))
            ].filter(item => item.id).sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())
        }

        return []
    }, [activeTab, publishedRides, myBookings])

    const isEmpty = filteredContent.length === 0

    const handleDelete = async (rideId: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est irréversible et annulera toutes les réservations en cours.")) return;

        startTransition(async () => {
            const result = await deleteRide(rideId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error);
            }
        });
    }

    const handleCancel = async (bookingId: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler votre réservation ?")) return;

        startTransition(async () => {
            const result = await cancelRideRequest(bookingId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error);
            }
        });
    }

    const handleComplete = async (rideId: string) => {
        if (!window.confirm("Avez-vous bien déposé tous vos passagers ? Ce trajet sera marqué comme terminé.")) return;

        startTransition(async () => {
            const result = await completeRide(rideId);
            if (result.success) {
                router.refresh();
                setActiveTab('past');
            } else {
                alert(result.error);
            }
        });
    }

    const handleHideFromHistory = async (id: string, role: 'driver' | 'passenger') => {
        if (!window.confirm("Voulez-vous supprimer ce trajet de votre historique ?")) return;

        startTransition(async () => {
            const result = role === 'driver'
                ? await hideRideFromHistory(id)
                : await hideBookingFromHistory(id);

            if (result.success) {
                router.refresh();
            } else {
                alert(result.error);
            }
        });
    }

    return (
        <div className="space-y-8">
            {/* Timeline Tabs */}
            <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-black/80 backdrop-blur-md pt-2 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex justify-around">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "pb-4 px-2 text-sm font-bold transition-all relative",
                                activeTab === tab.id
                                    ? "text-brand-purple"
                                    : "text-slate-400 dark:text-zinc-500"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-purple rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed Content */}
            <div className={cn("space-y-6", isPending && "opacity-50 pointer-events-none transition-opacity")}>
                {isEmpty ? (
                    <div className="premium-card p-12 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-slate-600 dark:text-zinc-400 font-bold">
                            Vous n'avez aucun trajet {activeTab === 'current' ? 'en cours' : activeTab === 'upcoming' ? 'à venir' : 'passé'}.
                        </p>
                    </div>
                ) : (
                    filteredContent.map((item: any) => (
                        <div key={item.id} className="premium-card overflow-hidden group">
                            <div className="p-5 border-b border-slate-50 dark:border-zinc-800 flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-black text-brand-purple uppercase tracking-wider mb-1">
                                        {item.role === 'driver' ? '🚗 Conducteur' : '🎒 Passager'}
                                    </p>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                        {new Date(item.departure_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-500">
                                        {new Date(item.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="text-xl font-black text-slate-900 dark:text-white">{item.price}€</div>
                                    {item.role === 'driver' ? (
                                        <div className="flex gap-2">
                                            {(activeTab === 'current' || (activeTab === 'upcoming' && new Date(item.departure_time) <= new Date())) && (
                                                <button
                                                    onClick={() => handleComplete(item.id)}
                                                    className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Terminer
                                                </button>
                                            )}
                                            {activeTab === 'past' ? (
                                                <button
                                                    onClick={() => handleHideFromHistory(item.id, 'driver')}
                                                    className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-500 hover:text-red-500 transition-colors"
                                                    title="Supprimer de l'historique"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                activeTab === 'upcoming' && (
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                        title="Supprimer ce trajet"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {activeTab === 'past' ? (
                                                <button
                                                    onClick={() => handleHideFromHistory(item.bookingId, 'passenger')}
                                                    className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-500 hover:text-red-500 transition-colors"
                                                    title="Supprimer de l'historique"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    <div className={cn(
                                                        "inline-flex py-1 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-black ring-1 ring-inset",
                                                        item.status === 'accepted' || item.status === 'onboarded'
                                                            ? "bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20"
                                                            : "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 ring-amber-600/20"
                                                    )}>
                                                        {item.status === 'onboarded' ? 'À bord' : item.status === 'accepted' ? 'Confirmé' : 'En attente'}
                                                    </div>
                                                    {activeTab === 'upcoming' && (
                                                        <button
                                                            onClick={() => handleCancel(item.bookingId)}
                                                            className="p-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                            title="Annuler ma réservation"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center gap-1 py-1">
                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-purple bg-white" />
                                        <div className="w-0.5 h-6 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                                    </div>
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{item.origin}</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{item.destination}</div>
                                    </div>
                                </div>

                                {item.role === 'driver' && (
                                    <div className="pt-4 border-t border-slate-50 dark:border-zinc-800">
                                        {activeTab === 'past' ? (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Évaluer les passagers :</h4>
                                                {item.requests?.filter((req: any) => req.status === 'onboarded' || req.status === 'completed').map((req: any) => (
                                                    <div key={req.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {req.passenger?.name || req.passenger?.email?.split('@')[0]}
                                                        </span>
                                                        <ReviewModal
                                                            rideId={item.id}
                                                            revieweeId={req.passenger_id}
                                                            revieweeName={req.passenger?.name || req.passenger?.email?.split('@')[0]}
                                                            triggerElement={
                                                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                                    <Star className="w-3.5 h-3.5" /> Évaluer
                                                                </button>
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                                {(!item.requests || item.requests.filter((req: any) => req.status === 'onboarded' || req.status === 'completed').length === 0) && (
                                                    <p className="text-sm text-slate-500">Aucun passager à évaluer.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <DriverRequestsManager rideId={item.id} requests={item.requests || []} />
                                        )}
                                    </div>
                                )}

                                {item.role === 'passenger' && (
                                    <div className="pt-4 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between gap-3">
                                        <div className="flex gap-2">
                                            {(item.status === 'accepted' || item.status === 'onboarded' || item.status === 'completed') && (
                                                <Link href={`/messages/${item.id}`} className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                                    <MessageCircle className="w-5 h-5" />
                                                </Link>
                                            )}
                                            {activeTab === 'past' && item.driver && (
                                                <ReviewModal
                                                    rideId={item.id}
                                                    revieweeId={item.driver.id}
                                                    revieweeName={item.driver.name}
                                                    triggerElement={
                                                        <button className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                                            <Star className="w-5 h-5" />
                                                        </button>
                                                    }
                                                />
                                            )}
                                        </div>
                                        {(item.status === 'accepted' || item.status === 'onboarded') && item.confirmation_code && (
                                            <div className="bg-brand-purple-soft dark:bg-brand-purple/10 px-4 py-2 rounded-2xl border border-brand-purple/20">
                                                <span className="text-[10px] block opacity-50 font-black text-brand-purple uppercase">Code PIN</span>
                                                <span className="text-lg font-black text-brand-purple tracking-widest">{item.confirmation_code}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
