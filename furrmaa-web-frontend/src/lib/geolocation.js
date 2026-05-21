// Nominatim requires a valid User-Agent; otherwise requests can be blocked (403)
const NOMINATIM_HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'FurrmaaWeb/1.0 (https://furrmaa.com)',
};

/**
 * Get current position via browser Geolocation API
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 }
    );
  });
}

/**
 * Reverse geocode lat/lng to address using OpenStreetMap Nominatim (free, no API key)
 */
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  const addr = data.address || {};
  const parts = [
    addr.suburb || addr.neighbourhood || addr.locality,
    addr.city || addr.town || addr.village || addr.county,
    addr.state,
  ].filter(Boolean);
  return parts.join(', ') || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Get current location as readable address string.
 * If reverse geocode fails (e.g. 403/CORS), returns "lat, lng" as fallback.
 */
export async function getCurrentLocationString() {
  const { lat, lng } = await getCurrentPosition();
  try {
    return await reverseGeocode(lat, lng);
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
