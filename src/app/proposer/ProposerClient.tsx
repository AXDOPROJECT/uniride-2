'use client'

import { useState } from 'react';
import AddressInput from '@/components/AddressInput';
import { calculateRideDistanceAndPrice, type RouteCalculationResult } from '@/agents/pricing';
import { publishRide } from '@/app/actions/rides';
import type { Location } from '@/types/location';
import { Loader2, Route, Euro, Map } from 'lucide-react';

export default function ProposerTrajet() {
    const [origin, setOrigin] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [date, setDate] = useState('');
    const [seats, setSeats] = useState(3);

    const [isCalculating, setIsCalculating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [calculationResult, setCalculationResult] = useState<RouteCalculationResult | null>(null);
    const [publishError, setPublishError] = useState<string | null>(null);

    const handleCalculate = async () => {
        if (!origin || !destination || !date) {
            alert("Veuillez remplir tous les champs (Départ, Arrivée, Date)");
            return;
        }
        setIsCalculating(true);
        setPublishError(null);
        const result = await calculateRideDistanceAndPrice(origin, destination);
        setCalculationResult(result);
        setIsCalculating(false);
    };

    const handlePublish = async () => {
        if (!origin || !destination || !date || !calculationResult) return;

        setIsPublishing(true);
        setPublishError(null);

        try {
            // Next.js Server Action called dynamically from Client
            await publishRide(origin, destination, date, seats, calculationResult.price);
        } catch (err) {
            setPublishError(err instanceof Error ? err.message : "Erreur inconnue");
            setIsPublishing(false);
        }
    };

    return (
        <main className="flex-1 bg-slate-50 dark:bg-black/50 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-8">

                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Proposer un Trajet</h1>
                    <p className="text-slate-500 dark:text-zinc-500 font-medium">Partagez vos frais et voyagez ensemble.</p>
                </div>

                <div className="space-y-6">
                    {/* Itinerary Section */}
                    <div className="premium-card p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Route className="w-5 h-5 text-brand-purple" />
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Itinéraire</h2>
                        </div>

                        <AddressInput
                            id="origin"
                            name="origin"
                            label="Point de départ"
                            placeholder="Ex: Campus Sciences, Avenue des Facultés"
                            onLocationSelect={(loc) => {
                                setOrigin(loc);
                                setCalculationResult(null);
                            }}
                        />

                        <AddressInput
                            id="destination"
                            name="destination"
                            label="Destination"
                            placeholder="Ex: Centre Ville, Gare SNCF"
                            onLocationSelect={(loc) => {
                                setDestination(loc);
                                setCalculationResult(null);
                            }}
                        />
                    </div>

                    {/* Logistics Section */}
                    <div className="premium-card p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="date" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date et heure</label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    id="date"
                                    required
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        setCalculationResult(null);
                                    }}
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-3 px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="seats" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Places</label>
                                <input
                                    type="number"
                                    name="seats"
                                    id="seats"
                                    required
                                    min="1"
                                    max="8"
                                    value={seats}
                                    onChange={(e) => setSeats(Number(e.target.value))}
                                    className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-3 px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action & Preview */}
                    <div className="space-y-4">
                        {!calculationResult ? (
                            <button
                                type="button"
                                onClick={handleCalculate}
                                disabled={isCalculating || !origin || !destination || !date}
                                className="w-full premium-btn bg-slate-900 dark:bg-white dark:text-slate-900 py-5 text-lg gap-3"
                            >
                                {isCalculating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Map className="h-6 w-6" />}
                                {isCalculating ? "Calcul en cours..." : "VOIR LE PRIX"}
                            </button>
                        ) : (
                            <div className="premium-card p-6 border-brand-purple/20 bg-brand-purple/5">
                                {calculationResult.error ? (
                                    <div className="text-red-500 font-bold p-3 text-center text-sm">
                                        {calculationResult.error}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                                                    <Euro className="h-6 w-6 text-emerald-600" />
                                                </div>
                                                <span className="font-bold text-slate-500">Tarif suggéré</span>
                                            </div>
                                            <span className="font-black text-emerald-600 text-3xl">
                                                {calculationResult.price.toFixed(2)}€
                                            </span>
                                        </div>

                                        {publishError && (
                                            <div className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl text-center border border-red-100">
                                                {publishError}
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handlePublish}
                                            disabled={isPublishing}
                                            className="w-full premium-btn text-xl gap-3 py-5"
                                        >
                                            {isPublishing ? <Loader2 className="h-7 w-7 animate-spin" /> : null}
                                            {isPublishing ? "PUBLICATION..." : "CONFIRMER ET PUBLIER"}
                                        </button>

                                        <button
                                            onClick={() => setCalculationResult(null)}
                                            className="w-full text-center text-sm font-bold text-slate-400 hover:text-slate-600"
                                        >
                                            Modifier l'itinéraire
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
