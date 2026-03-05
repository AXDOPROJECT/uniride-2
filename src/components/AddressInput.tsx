'use client'

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import type { Location } from '@/types/location';
import { usePlacesWidget } from 'react-google-autocomplete';

interface AddressInputProps {
    id: string;
    name: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    onLocationSelect: (location: Location) => void;
}

export default function AddressInput({ id, name, label, placeholder, defaultValue = '', onLocationSelect }: AddressInputProps) {
    // We only use query for raw controlled input text just in case
    const [query, setQuery] = useState(defaultValue);

    useEffect(() => {
        setQuery(defaultValue);
    }, [defaultValue]);

    const { ref: materialRef } = usePlacesWidget({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        onPlaceSelected: (place) => {
            if (place && place.geometry && place.geometry.location) {
                const formattedAddress = place.formatted_address || place.name || '';
                setQuery(formattedAddress);

                onLocationSelect({
                    address: formattedAddress,
                    lat: place.geometry.location.lat(),
                    lon: place.geometry.location.lng()
                });
            }
        },
        options: {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: "fr" }, // Assuming UNIRIDE is mostly France-based
        },
    });

    return (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                {label}
            </label>
            <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                {/* @ts-ignore - react-google-autocomplete ref typing mismatch with generic input */}
                <input
                    ref={materialRef}
                    type="text"
                    name={name}
                    id={id}
                    className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                    placeholder={placeholder || 'Entrez une adresse...'}
                    autoComplete="off"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            {/* The Google Places dropdown mounts natively outside the DOM flow over this input */}
        </div>
    );
}
