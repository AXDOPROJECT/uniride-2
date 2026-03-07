'use client'

import { useState } from 'react';
import Link from 'next/link';
import AddressInput from '@/components/AddressInput';
import type { Location } from '@/types/location';
import { searchRides } from '@/app/actions/rides';
import { Loader2, Search, Calendar, Clock, MapPin, Users, Euro, Star } from 'lucide-react';

// Type representing the joined shape from Supabase
type RideResult = {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    available_seats: number;
    price: number;
    driver: {
        name: string | null;
        email: string;
        verified_license: boolean | null;
        avg_rating?: number;
        total_reviews?: number;
    } | null;
};

export default function RechercherTrajet() {
    const [origin, setOrigin] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<RideResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setError(null);
        setResults(null);

        try {
            // We pass the string addresses so the action can filter by city/keywords
            const data = await searchRides(
                origin?.address || '',
                destination?.address || '',
                date || undefined,
                time || undefined,
                origin?.lat,
                origin?.lon,
                destination?.lat,
                destination?.lon
            );

            // Supabase returns an array of any type from joins, we cast it for type safety in the UI map
            setResults(data as unknown as RideResult[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur de recherche");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <main className="flex-1 bg-transparent overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-8">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Trouver un Trajet</h1>
                    <p className="text-slate-500 dark:text-zinc-500 font-medium">Recherchez votre prochain voyage étudiant.</p>
                </div>

                {/* Search Form Panel */}
                <div className="premium-card p-6 border-none shadow-sm space-y-6 bg-white dark:bg-zinc-900">
                    <form className="space-y-6" onSubmit={handleSearch}>
                        <div className="space-y-6">
                            <AddressInput
                                id="origin"
                                name="origin"
                                label="Départ souhaité"
                                placeholder="Ex: Talence, Pessac..."
                                onLocationSelect={setOrigin}
                            />

                            <AddressInput
                                id="destination"
                                name="destination"
                                label="Arrivée"
                                placeholder="Ex: Gare St Jean, Campus 1..."
                                onLocationSelect={setDestination}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                                    <Calendar className="w-3 h-3 text-brand-lime" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-3.5 px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-lime transition-all sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="time" className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                                    <Clock className="w-3 h-3 text-brand-lime" />
                                    Heure
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    id="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-3.5 px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-lime transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full flex justify-center items-center gap-3 rounded-2xl bg-brand-lime py-4 text-black text-lg font-black shadow-xl shadow-brand-lime/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
                        >
                            {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
                            {isSearching ? "RECHERCHE..." : "RECHERCHER"}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {error && (
                        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-800/20">
                            <p className="text-sm font-bold text-red-600 dark:text-red-400 text-center">{error}</p>
                        </div>
                    )}

                    {results !== null && !isSearching && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                    {results.length} résultat{results.length !== 1 ? 's' : ''}
                                </h2>
                            </div>

                            {results.length === 0 ? (
                                <div className="premium-card p-12 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-2">
                                    <p className="text-slate-500 dark:text-zinc-500 font-bold">Aucun trajet trouvé.</p>
                                    <p className="text-xs text-slate-400 dark:text-zinc-600 font-medium max-w-xs mx-auto">
                                        Essayez avec des mots-clés plus larges (ex: juste la ville).
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {results.map((ride) => (
                                        <Link key={ride.id} href={`/trajet/${ride.id}`} className="block group">
                                            <div className="premium-card p-5 bg-white dark:bg-zinc-900 overflow-hidden border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-xs font-black text-brand-purple uppercase tracking-tight mb-2">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(ride.departure_time).toLocaleString('fr-FR', {
                                                                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-lg bg-brand-purple-soft dark:bg-brand-purple/20 flex items-center justify-center text-[10px] font-black text-brand-purple">
                                                                {ride.driver?.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-300">
                                                                {ride.driver?.name || 'Étudiant'}
                                                            </span>
                                                            {ride.driver?.avg_rating && ride.driver.avg_rating > 0 && (
                                                                <div className="flex items-center gap-0.5 text-xs font-black text-amber-500">
                                                                    <Star className="w-3 h-3 fill-amber-500" />
                                                                    <span>{ride.driver.avg_rating}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{ride.price}€</div>
                                                        <div className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase">{ride.available_seats} places dispo.</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="flex flex-col items-center gap-1 py-1">
                                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-brand-purple bg-white" />
                                                        <div className="w-0.5 h-6 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />
                                                    </div>
                                                    <div className="space-y-3 flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{ride.origin}</div>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{ride.destination}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
