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
      // Prefer GPS when available; avoid long-lived Wi‑Fi/IP cache (laptop often wrong city)
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60_000 }
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

/** Address + coords for distance sorting (Near By). */
export async function getCurrentLocationWithCoords() {
  const { lat, lng } = await getCurrentPosition();
  let address;
  try {
    address = await reverseGeocode(lat, lng);
  } catch {
    address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  return { address, lat, lng };
}

/** Forward geocode address → lat/lng (Nominatim). */
export async function forwardGeocode(address) {
  if (!address?.trim()) return null;
  const q = encodeURIComponent(address.trim());
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  if (!first || first.lat == null || first.lon == null) return null;
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

/** Haversine distance in km */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const COORD_PATTERN = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

/** True when location is a raw "lat, lng" fallback (not useful for API filters). */
export function isCoordinateLocation(location) {
  return COORD_PATTERN.test(String(location || '').trim());
}

/**
 * City token for list APIs.
 * "Nirman Nagar, Jaipur, Rajasthan" → "Jaipur" (not "Nirman")
 * "Jaipur Municipal Corporation, Jaipur, Rajasthan" → "Jaipur"
 */
export function locationSearchToken(location) {
  if (!location?.trim() || isCoordinateLocation(location)) return '';
  const parts = location
    .split(',')
    .map((s) => s.trim())
    .filter((p) => p.length >= 2 && !/^(india|in|bharat)$/i.test(p));
  if (!parts.length) return '';

  const skipPart = /municipal|corporation|district|division|tehsil|taluka/i;
  const stateLike =
    /pradesh|rajasthan|gujarat|maharashtra|delhi|bengal|karnataka|tamil|punjab|haryana|bihar|odisha|kerala|goa|assam|uttarakhand|telangana|andhra|madhya|chhattisgarh|jharkhand|himachal|manipur|meghalaya|mizoram|nagaland|sikkim|tripura|ladakh|puducherry|chandigarh|india/i;
  const skipWord =
    /^(municipal|corporation|district|division|tehsil|taluka|nagar|area|near|the|and|of|ward|zone|block|sector|phase|colony|scheme|road|marg|street)$/i;

  const nonState = parts.filter((p) => !stateLike.test(p) && !skipPart.test(p));
  // Locality first, city before state — prefer last non-state segment
  const cityPart =
    (nonState.length >= 2 ? nonState[nonState.length - 1] : nonState[0]) ||
    parts.find((p) => !stateLike.test(p) && !skipPart.test(p)) ||
    parts[1] ||
    parts[0];

  const words = cityPart.split(/\s+/).filter((w) => w.length >= 3 && !skipWord.test(w));
  if (words.length === 1) return words[0];
  if (words.length > 1 && cityPart.length <= 24) return words.join(' ');
  return words[words.length - 1] || words[0] || cityPart || '';
}
