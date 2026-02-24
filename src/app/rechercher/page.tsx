'use client'

import { useState } from 'react';
import Link from 'next/link';
import AddressInput from '@/components/AddressInput';
import type { Location } from '@/types/location';
import { searchRides } from '@/app/actions/rides';
import { Loader2, Search, Calendar, MapPin, Users, Euro, Star } from 'lucide-react';

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
                date || undefined
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
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">Rechercher un Trajet</h1>

            {/* Search Form Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                <form className="space-y-6" onSubmit={handleSearch}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="md:w-1/2">
                        <label htmlFor="date" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Date de départ (Optionnelle)</label>
                        <div className="mt-2 text-slate-800 dark:text-white">
                            <input
                                type="date"
                                name="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                            />
                        </div>
                    </div>

                    <div className="sticky bottom-[80px] sm:static mt-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md sm:bg-transparent sm:dark:bg-transparent -mx-6 px-6 py-4 sm:mx-0 sm:px-0 sm:py-0 border-t border-slate-200 dark:border-slate-700 sm:border-t pt-4 z-40">
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 transition-all active:scale-95"
                        >
                            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                            {isSearching ? "Recherche en cours..." : "Rechercher des trajets"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <div className="mt-12 space-y-6">
                {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800/50">
                        <p className="text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
                    </div>
                )}

                {results !== null && !isSearching && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {results.length} trajet{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
                        </h2>

                        {results.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 border-dashed">
                                <p className="text-slate-500 dark:text-slate-400">Aucun trajet ne correspond exactement à votre recherche.</p>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Essayez de simplifier vos lieux de départ et d'arrivée (ex: juste la ville).</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {results.map((ride) => (
                                    <Link key={ride.id} href={`/trajet/${ride.id}`} className="block">
                                        <div className="bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-200 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center cursor-pointer group">

                                            {/* Route Info */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex flex-col items-center gap-1 mt-1">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                                                        <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-600"></div>
                                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-800"></div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5 font-medium">Départ</p>
                                                            <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{ride.origin}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5 font-medium">Arrivée</p>
                                                            <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{ride.destination}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Generic Info */}
                                            <div className="flex flex-row md:flex-col items-center md:items-end w-full md:w-auto gap-4 justify-between border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-4 md:pt-0">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(ride.departure_time).toLocaleString('fr-FR', {
                                                            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>

                                                    {/* Rating Display */}
                                                    {ride.driver && ride.driver.avg_rating && ride.driver.avg_rating > 0 && (
                                                        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
                                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                            <span>{ride.driver.avg_rating}</span>
                                                            <span className="text-slate-400 dark:text-slate-500 font-normal">({ride.driver.total_reviews})</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md">
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span>{ride.available_seats} places</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right flex items-center gap-1">
                                                    <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                                                        {ride.price}
                                                    </p>
                                                    <Euro className="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
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
    )
}
