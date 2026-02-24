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
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Proposer un Trajet</h1>

            <div className="mt-8 space-y-6">
                <AddressInput
                    id="origin"
                    name="origin"
                    label="Point de départ"
                    placeholder="Ex: Campus Sciences, Avenue des Facultés"
                    onLocationSelect={(loc) => {
                        setOrigin(loc);
                        setCalculationResult(null); // Reset preview on change
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

                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Date et heure de départ</label>
                        <div className="mt-2">
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
                                className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="seats" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">Places disponibles</label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="seats"
                                id="seats"
                                required
                                min="1"
                                max="8"
                                value={seats}
                                onChange={(e) => setSeats(Number(e.target.value))}
                                className="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Sticky Action Footer purely for Mobile, standard flow for Desktop */}
                <div className="sticky bottom-[80px] sm:static mt-8 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sm:bg-transparent sm:dark:bg-transparent -mx-4 px-4 py-4 sm:mx-0 sm:px-0 sm:py-0 border-t sm:border-none border-slate-200 dark:border-slate-800 z-40">

                    {origin && destination && !calculationResult && (
                        <button
                            type="button"
                            onClick={handleCalculate}
                            disabled={isCalculating || !date}
                            className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {isCalculating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Map className="h-5 w-5" />}
                            {isCalculating ? "Calcul en cours..." : "Calculer l'itinéraire et le prix"}
                        </button>
                    )}

                    {calculationResult && (
                        <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 p-5 sm:p-6 border border-indigo-100 dark:border-indigo-800/30">
                            <h3 className="text-base sm:text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-4 hidden sm:block">
                                Détails du Trajet Automatisé
                            </h3>

                            {calculationResult.error ? (
                                <div className="text-red-500 font-medium p-3 bg-red-100 dark:bg-red-900/30 rounded-md text-sm">
                                    {calculationResult.error}
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between text-sm sm:text-base">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Route className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                                            <span>Distance:</span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {calculationResult.distanceKm} km
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm sm:text-base">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                                            <span>Tarif / passager:</span>
                                        </div>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg sm:text-2xl">
                                            {calculationResult.price.toFixed(2)} €
                                        </span>
                                    </div>

                                    {publishError && (
                                        <div className="mt-3 text-xs sm:text-sm font-medium text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md text-center">
                                            {publishError}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handlePublish}
                                        disabled={isPublishing}
                                        className="mt-4 sm:mt-6 flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all active:scale-95"
                                    >
                                        {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                                        {isPublishing ? "Publication en cours..." : "Confirmer et Publier"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
