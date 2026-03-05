'use client'

import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api'
import { useState, useCallback, useEffect } from 'react'

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '24px',
}

// Map style (Sleek Dark Mode)
const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
        },
    ]
}

type RideWithCoords = {
    id: string;
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    origin: string;
    destination: string;
}

export default function LiveRideMap({ rides, apiKey }: { rides: any[], apiKey: string }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey
    })

    const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default Paris

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => console.log("Geolocation blocked or failed")
            );
        }
    }, []);

    const routes = rides
        .filter(r => r.origin_lat && r.origin_lng && r.dest_lat && r.dest_lng)
        .map(r => ({
            id: r.id,
            path: [
                { lat: Number(r.origin_lat), lng: Number(r.origin_lng) },
                { lat: Number(r.dest_lat), lng: Number(r.dest_lng) }
            ]
        }));

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            options={mapOptions}
        >
            {routes.map(route => (
                <div key={route.id}>
                    <Polyline
                        path={route.path}
                        options={{
                            strokeColor: "#7C3AED", // brand-purple
                            strokeOpacity: 0.6,
                            strokeWeight: 4,
                        }}
                    />
                    <Marker position={route.path[0]} icon={{ url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png" }} />
                    <Marker position={route.path[1]} icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }} />
                </div>
            ))}
        </GoogleMap>
    ) : (
        <div className="w-full h-[400px] bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-[24px]" />
    )
}
