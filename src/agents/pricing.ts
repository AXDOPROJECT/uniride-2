'use server'

import type { Location } from '@/types/location';

export interface RouteCalculationResult {
    distanceKm: number;
    price: number;
    error?: string;
}

/**
 * Calculates the exact pricing tier based on UNIRIDE rules:
 * 0-10 km -> 0.30€
 * 10-20 km -> 0.60€
 * 20-37 km -> 0.80€
 * >37 km -> 1.00€
 */
function calculateUniridePrice(distanceKm: number): number {
    if (distanceKm <= 10) return 0.30;
    if (distanceKm <= 20) return 0.60;
    if (distanceKm <= 37) return 0.80;
    return 1.00;
}

/**
 * Uses OSRM (Open Source Routing Machine) to fetch the actual road routing distance.
 * This is much more accurate than straight-line bird distance.
 */
export async function calculateRideDistanceAndPrice(origin: Location, destination: Location): Promise<RouteCalculationResult> {
    if (!origin?.lat || !origin?.lon || !destination?.lat || !destination?.lon) {
        return { distanceKm: 0, price: 0, error: 'Coordonnées invalides.' };
    }

    try {
        // OSRM expects coordinates as lon,lat
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=false`;

        const response = await fetch(osrmUrl);

        if (!response.ok) {
            throw new Error(`OSRM Api returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            return { distanceKm: 0, price: 0, error: 'Impossible de calculer la route.' };
        }

        // OSRM returns distance in meters
        const distanceMeters = data.routes[0].distance;
        const distanceKm = Number((distanceMeters / 1000).toFixed(1));

        const price = calculateUniridePrice(distanceKm);

        return {
            distanceKm,
            price
        };

    } catch (error) {
        console.error('Pricing Agent Error calculating distance:', error);
        return {
            distanceKm: 0,
            price: 0,
            error: 'Erreur Serveur: Calcul impossible.'
        };
    }
}
