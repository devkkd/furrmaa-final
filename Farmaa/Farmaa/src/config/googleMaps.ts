/**
 * Google Maps / Places API key for address autocomplete in the app.
 * Create key: https://console.cloud.google.com/google/maps-apis
 * Enable: Places API (+ Geocoding API optional). Restrict key to Places API.
 *
 * Replace with your key (same project key as web NEXT_PUBLIC_GOOGLE_MAPS_API_KEY works).
 */
export const GOOGLE_MAPS_API_KEY = '';

export function isGooglePlacesConfigured(): boolean {
  return Boolean(GOOGLE_MAPS_API_KEY?.trim());
}
