import React from 'react'
import { MapPin, Clock, User } from 'lucide-react'

type Ride = {
    id: string
    origin: string
    destination: string
    departure_time: string
    driver: any // Keeping it flexible to handle array or object from Supabase
}

export default function LiveRideTicker({ rides }: { rides: Ride[] }) {
    if (!rides || rides.length === 0) return null

    // Double the rides to create a seamless loop
    const displayRides = [...rides, ...rides]

    return (
        <div className="relative w-full overflow-hidden bg-slate-900 dark:bg-black py-4 border-y border-brand-lime/10">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 dark:from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 dark:from-black to-transparent z-10" />

            <div className="animate-marquee space-x-6 px-10">
                {displayRides.map((ride, idx) => {
                    // Handle driver being an object or an array (Supabase join inconsistency)
                    const driverData = Array.isArray(ride.driver) ? ride.driver[0] : ride.driver;
                    const driverName = driverData?.name || "Conducteur";

                    return (
                        <div
                            key={`${ride.id}-${idx}`}
                            className="flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 min-w-[320px] transition-colors hover:bg-white/10"
                        >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-lime flex items-center justify-center">
                                <User className="w-5 h-5 text-black" />
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-white truncate max-w-[120px]">
                                        {driverName}
                                    </span>
                                    <span className="text-[10px] font-black text-brand-lime px-2 py-0.5 rounded-full bg-brand-lime/10 flex items-center gap-1 uppercase tracking-tighter">
                                        <Clock className="w-3 h-3" />
                                        {new Date(ride.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold truncate">
                                    <MapPin className="w-3 h-3 text-brand-lime" />
                                    <span className="truncate">{ride.origin.split(',')[0]}</span>
                                    <span className="text-slate-600">→</span>
                                    <span className="truncate">{ride.destination.split(',')[0]}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
