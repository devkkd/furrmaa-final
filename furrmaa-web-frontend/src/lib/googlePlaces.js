/**
 * Google Maps Places (browser). Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env
 * Enable: Maps JavaScript API + Places API in Google Cloud Console.
 */

export function getGoogleMapsApiKey() {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim();
  }
  return '';
}

export function isGooglePlacesConfigured() {
  return Boolean(getGoogleMapsApiKey());
}

let loadPromise = null;

export function loadGoogleMapsPlaces() {
  const key = getGoogleMapsApiKey();
  if (!key) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set'));
  }
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-furrmaa-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.google?.maps?.places) resolve(window.google.maps);
        else reject(new Error('Google Maps Places failed to load'));
      });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.furrmaaGoogleMaps = '1';
    script.onload = () => {
      if (window.google?.maps?.places) resolve(window.google.maps);
      else reject(new Error('Google Maps Places failed to load'));
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * @param {google.maps.places.PlaceResult} place
 */
export function parseGooglePlace(place) {
  const comps = place.address_components || [];
  const get = (...types) => {
    const c = comps.find((x) => types.some((t) => x.types?.includes(t)));
    return c?.long_name || '';
  };

  const city =
    get('locality') ||
    get('administrative_area_level_2') ||
    get('sublocality_level_1') ||
    get('postal_town');
  const state = get('administrative_area_level_1');
  const latFn = place.geometry?.location?.lat;
  const lngFn = place.geometry?.location?.lng;
  const lat = typeof latFn === 'function' ? latFn() : latFn;
  const lng = typeof lngFn === 'function' ? lngFn() : lngFn;

  const formattedAddress = place.formatted_address || '';
  const name = place.name || '';
  const venue =
    name && formattedAddress && !formattedAddress.startsWith(name)
      ? name
      : name || formattedAddress.split(',')[0]?.trim() || '';

  const label = formattedAddress || name || '';

  return {
    label,
    formattedAddress: label,
    venue: venue || label.split(',')[0]?.trim() || '',
    city: city || state || label.split(',')[0]?.trim() || '',
    state,
    lat,
    lng,
    placeId: place.place_id,
  };
}
