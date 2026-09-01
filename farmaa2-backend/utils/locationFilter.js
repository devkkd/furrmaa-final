/**
 * Location matching for list APIs (Hope, events, cremation, vets).
 * Google Places returns "Sector 62, Noida, Uttar Pradesh, India" —
 * we match any meaningful segment against stored city/address fields.
 */

export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SKIP_PARTS = /^(india|in|bharat)$/i;

/**
 * @param {string} locationOrCity
 * @returns {string[]}
 */
export function locationTokens(locationOrCity) {
  const raw = String(locationOrCity || '').trim();
  if (!raw || raw.toLowerCase() === 'all') return [];

  const tokens = new Set();

  /** Single word e.g. "delhi" — substring match on city/locationText */
  if (!raw.includes(',')) {
    tokens.add(raw);
    raw.split(/\s+/).forEach((w) => {
      if (w.length >= 3) tokens.add(w);
    });
  }

  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length >= 2 && !SKIP_PARTS.test(p));

  for (const part of parts) {
    tokens.add(part);
    const words = part.split(/\s+/).filter((w) => w.length >= 3);
    if (words.length > 1) {
      words.forEach((w) => tokens.add(w));
    }
  }

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

  const fullRe = escapeRegex(tokens.join(', '));
  for (const field of fieldPaths) {
    or.push({ [field]: { $regex: fullRe, $options: 'i' } });
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

const COORD_PATTERN = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;

/** Skip raw "lat, lng" strings — they never match stored addresses */
export function isCoordinateLocation(locationOrCity) {
  return COORD_PATTERN.test(String(locationOrCity || '').trim());
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
