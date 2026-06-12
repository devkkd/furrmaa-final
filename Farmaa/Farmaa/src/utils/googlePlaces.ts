import { GOOGLE_MAPS_API_KEY, isGooglePlacesConfigured } from '../config/googleMaps';
import type { LocationSuggestion } from './geolocation';

type AutocompletePrediction = {
  place_id: string;
  description: string;
};

type PlaceDetailsResult = {
  result?: {
    formatted_address?: string;
    name?: string;
    geometry?: { location?: { lat: number; lng: number } };
    address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
  };
};

function parseAddressComponents(
  comps: Array<{ long_name: string; types: string[] }> = []
) {
  const get = (...types: string[]) => {
    const c = comps.find((x) => types.some((t) => x.types?.includes(t)));
    return c?.long_name || '';
  };
  const city =
    get('locality') ||
    get('administrative_area_level_2') ||
    get('sublocality_level_1');
  const state = get('administrative_area_level_1');
  return { city, state };
}

async function fetchPlaceDetails(placeId: string): Promise<LocationSuggestion | null> {
  const key = GOOGLE_MAPS_API_KEY.trim();
  const fields = 'place_id,formatted_address,name,geometry,address_components';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${key}&language=en`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as PlaceDetailsResult & { status?: string };
  if (data.status !== 'OK' || !data.result?.geometry?.location) return null;

  const { lat, lng } = data.result.geometry.location;
  const { city } = parseAddressComponents(data.result.address_components);
  const displayName =
    data.result.formatted_address ||
    data.result.name ||
    `${lat}, ${lng}`;

  return {
    id: placeId,
    displayName,
    lat,
    lng,
    city: city || displayName.split(',')[0]?.trim(),
  };
}

/**
 * Google Places Autocomplete (India). Requires GOOGLE_MAPS_API_KEY in config.
 */
export async function searchGooglePlaces(query: string): Promise<LocationSuggestion[]> {
  if (!isGooglePlacesConfigured() || !query?.trim() || query.trim().length < 2) {
    return [];
  }

  const key = GOOGLE_MAPS_API_KEY.trim();
  const input = encodeURIComponent(query.trim());
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${key}&components=country:in&language=en`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = (await res.json()) as {
    status?: string;
    predictions?: AutocompletePrediction[];
  };

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return [];
  }

  const predictions = data.predictions || [];
  const top = predictions.slice(0, 6);
  const details = await Promise.all(
    top.map((p) => fetchPlaceDetails(p.place_id))
  );

  return details.filter((d): d is LocationSuggestion => Boolean(d));
}

export { isGooglePlacesConfigured };
