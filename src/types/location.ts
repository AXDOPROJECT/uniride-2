export interface Location {
    address: string;
    lat: number;
    lon: number;
}

export interface NominatimResponse {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    type: string;
    importance: number;
}
