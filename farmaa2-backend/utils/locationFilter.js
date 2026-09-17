/**
 * Location matching for list APIs (Hope, events, cremation, vets).
 * Google Places returns "Sector 62, Noida, Uttar Pradesh, India" —
 * we match any meaningful segment against stored city/address fields.
 */

export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SKIP_PARTS = /^(india|in|bharat)$/i;
const SKIP_WORDS =
  /^(india|in|bharat|municipal|corporation|district|division|tehsil|taluka|nagar|area|near|the|and|of|ward|zone|block)$/i;

const COORD_PATTERN = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

/** Skip raw "lat, lng" strings — they never match stored addresses */
export function isCoordinateLocation(locationOrCity) {
  return COORD_PATTERN.test(String(locationOrCity || '').trim());
}

/**
 * Prefer a city-like token from a geocoded / Places label.
 * e.g. "Jaipur Municipal Corporation, Jaipur, Rajasthan" → "Jaipur"
 */
export function preferredCityToken(locationOrCity) {
  const raw = String(locationOrCity || '').trim();
  if (!raw || isCoordinateLocation(raw)) return '';
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length >= 2 && !SKIP_PARTS.test(p));
  if (!parts.length) return raw;
  const cityLike = parts.find((p) => !/municipal|corporation|district|division|tehsil|taluka/i.test(p));
  if (cityLike) {
    // If part is multi-word like "Jaipur Municipal", take first meaningful word
    const words = cityLike.split(/\s+/).filter((w) => w.length >= 3 && !SKIP_WORDS.test(w));
    return words[0] || cityLike;
  }
  return parts[1] || parts[0];
}

/**
 * Normalize admin-saved address so city/state are clean for nearby matching.
 */
export function normalizeVetAddress(address) {
  if (!address || typeof address !== 'object') return address;
  const street = String(address.street || '').trim();
  let city = String(address.city || '').trim();
  let state = String(address.state || '').trim();

  const source = city.includes(',') ? city : street.includes(',') ? street : city || street;
  if (source && (city.includes(',') || !city || city === street)) {
    const parts = source
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length >= 2 && !SKIP_PARTS.test(p));
    if (parts.length) {
      const cityPart =
        parts.find((p) => !/municipal|corporation|district|division|tehsil|taluka/i.test(p)) ||
        parts[Math.max(0, parts.length - 2)] ||
        parts[0];
      const words = cityPart.split(/\s+/).filter((w) => w.length >= 3 && !SKIP_WORDS.test(w));
      city = words[0] || cityPart;
      if (!state) {
        const statePart = parts.find((p) =>
          /pradesh|rajasthan|gujarat|maharashtra|delhi|bengal|karnataka|tamil|punjab|haryana|bihar|odisha|kerala|goa|assam|uttarakhand|telangana|andhra|madhya|chhattisgarh|jharkhand|himachal|manipur|meghalaya|mizoram|nagaland|sikkim|tripura|ladakh|puducherry/i.test(
            p
          )
        );
        if (statePart) state = statePart;
      }
    }
  }

  return {
    ...address,
    street: street || address.street,
    city: city || preferredCityToken(street) || address.city,
    state: state || address.state,
    latitude: address.latitude,
    longitude: address.longitude,
    zipCode: address.zipCode,
  };
}

/**
 * @param {string} locationOrCity
 * @returns {string[]}
 */
export function locationTokens(locationOrCity) {
  const raw = String(locationOrCity || '').trim();
  if (!raw || raw.toLowerCase() === 'all' || isCoordinateLocation(raw)) return [];

  const tokens = new Set();
  const preferred = preferredCityToken(raw);
  if (preferred) tokens.add(preferred);

  /** Single word e.g. "delhi" — substring match on city/locationText */
  if (!raw.includes(',')) {
    tokens.add(raw);
    raw.split(/\s+/).forEach((w) => {
      if (w.length >= 3 && !SKIP_WORDS.test(w)) tokens.add(w);
    });
  }

  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length >= 2 && !SKIP_PARTS.test(p));

  for (const part of parts) {
    if (!/municipal|corporation|district|division/i.test(part)) {
      tokens.add(part);
    }
    const words = part.split(/\s+/).filter((w) => w.length >= 3 && !SKIP_WORDS.test(w));
    words.forEach((w) => tokens.add(w));
  }

  if (tokens.size === 0 && preferred) tokens.add(preferred);
  if (tokens.size === 0) tokens.add(raw);

  return [...tokens];
}

/**
 * Mongo $or clause: any token matches any of the given field paths.
 * @param {string} locationOrCity
 * @param {string[]} fieldPaths e.g. ['city', 'venue'] or ['locationText']
 */
export function buildLocationMatchClause(locationOrCity, fieldPaths) {
  const tokens = locationTokens(locationOrCity);
  if (!tokens.length || !fieldPaths?.length) return null;

  const or = [];
  for (const token of tokens) {
    const re = escapeRegex(token);
    for (const field of fieldPaths) {
      or.push({ [field]: { $regex: re, $options: 'i' } });
    }
  }

  return { $or: or };
}

/** Cremation centers: city, state, address */
export function cremationLocationClause(locationOrCity) {
  const raw = String(locationOrCity || '').trim();
  if (!raw || isCoordinateLocation(raw)) return null;
  return buildLocationMatchClause(raw, ['city', 'state', 'address']);
}

/** Pet events: city, venue, full address */
export function petEventLocationClause(locationOrCity) {
  return buildLocationMatchClause(locationOrCity, [
    'city',
    'venue',
    'state',
    'formattedAddress',
  ]);
}

/** Hope posts: locationText */
export function hopeLocationClause(locationOrCity) {
  return buildLocationMatchClause(locationOrCity, ['locationText']);
}

/** Veterinarians & service providers: street, city, state */
export function vetLocationClause(locationOrCity) {
  const raw = String(locationOrCity || '').trim();
  if (!raw || isCoordinateLocation(raw)) return null;
  return buildLocationMatchClause(raw, [
    'address.city',
    'address.street',
    'address.state',
  ]);
}
