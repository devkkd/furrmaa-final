'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchVetServiceTypes, fetchVeterinarians, fetchServiceProviders, fetchCremationCenters } from '@/lib/api';
import { haversineKm, isCoordinateLocation, locationSearchToken } from '@/lib/geolocation';

/** Fallback when API has no types */
export const VET_SERVICE_CATEGORIES = [
  'All',
  'Veterinarians',
  'Pet Shops',
  'Hospitals',
  'Pet Hotels / Hostels',
  'NGOs',
  'Shelters',
  'Rescue Centers',
  'Pet Cremation',
];

const DEFAULT_TYPES = VET_SERVICE_CATEGORIES.slice(1).map((name) => ({
  name,
  slug: name,
  source: name === 'Veterinarians' ? 'veterinarian' : name === 'Pet Cremation' ? 'cremation' : 'service_provider',
}));

/** Normalize vet/service; typeName = admin type name (filter tab) */
function toServiceItem(item, typeName) {
  const addr = item.address;
  const addressStr = typeof addr === 'object'
    ? [addr?.street, addr?.city, addr?.state].filter(Boolean).join(', ')
    : (addr || item.address) || '';
  const fullAddress = typeof addr === 'object'
    ? `${addr?.street || ''}, ${addr?.city || ''}, ${addr?.state || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || addressStr
    : addressStr;
  const latRaw =
    (typeof addr === 'object' ? addr?.latitude ?? addr?.lat : null) ??
    item.latitude ??
    item.lat;
  const lngRaw =
    (typeof addr === 'object' ? addr?.longitude ?? addr?.lng : null) ??
    item.longitude ??
    item.lng;
  const lat = latRaw != null && latRaw !== '' ? Number(latRaw) : null;
  const lng = lngRaw != null && lngRaw !== '' ? Number(lngRaw) : null;
  return {
    id: item._id,
    name: item.name || item.clinicName || 'Service',
    distance: '— km',
    distanceKm: 9999,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    address: fullAddress || 'Address not available',
    image: item.profileImage || undefined,
    category: item.specialization || item.services?.[0] || typeName,
    phone: item.phone,
    type: typeName,
  };
}

function withDistanceSorted(list, userCoords) {
  const scored = (list || []).map((s) => {
    if (
      userCoords?.lat != null &&
      userCoords?.lng != null &&
      s.lat != null &&
      s.lng != null
    ) {
      const km = haversineKm(userCoords.lat, userCoords.lng, s.lat, s.lng);
      return {
        ...s,
        distanceKm: km,
        distance: `${km.toFixed(1)} km away`,
      };
    }
    return { ...s, distanceKm: 9999, distance: s.distance || '— km' };
  });
  // Nearest first by default
  return scored.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
}

function mergeTypeLists(apiTypes) {
  const byName = new Map();
  DEFAULT_TYPES.forEach((t) => byName.set(t.name.toLowerCase(), t));
  (apiTypes || []).forEach((t) => {
    byName.set(t.name.toLowerCase(), {
      name: t.name,
      slug: t.slug || t.name,
      source: t.source,
    });
  });
  return [...byName.values()].sort((a, b) => {
    const ai = DEFAULT_TYPES.findIndex((d) => d.name === a.name);
    const bi = DEFAULT_TYPES.findIndex((d) => d.name === b.name);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function resolveTypeName(record, fallback = 'Veterinarians') {
  const raw = record.serviceType || record.services?.[0];
  return raw && String(raw).trim() ? String(raw).trim() : fallback;
}

export function useVetServices(options = {}) {
  const { category, city, location, search, userCoords } = options;
  // Send full address when possible so API can match city + locality;
  // fall back to extracted city token (never raw lat,lng).
  const rawLoc = String(location || city || '').trim();
  const locationQuery = rawLoc && !isCoordinateLocation(rawLoc)
    ? rawLoc
    : locationSearchToken(location) || locationSearchToken(city) || undefined;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeList, setTypeList] = useState(DEFAULT_TYPES);
  const hasData = useRef(false);
  const categories = ['All', ...typeList.map((t) => t.name)];

  useEffect(() => {
    let cancelled = false;
    fetchVetServiceTypes()
      .then((list) => {
        if (cancelled || !list?.length) return;
        setTypeList(mergeTypeLists(list));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Keep previous list visible while refining (location / filter) — avoid long blank spinner
    if (!hasData.current) setLoading(true);

    const selected = category && category !== 'All' ? category : null;
    const typesToUse = typeList.length ? typeList : DEFAULT_TYPES;

    const load = async () => {
      try {
        const all = [];
        const seen = new Set();

        const pushUnique = (item, typeName) => {
          const key = String(item._id || item.id || '');
          if (key && seen.has(key)) return;
          if (key) seen.add(key);
          all.push(toServiceItem(item, typeName));
        };

        if (!selected) {
          const [vets, providers, centers] = await Promise.all([
            fetchVeterinarians({ location: locationQuery }).catch(() => []),
            fetchServiceProviders({ location: locationQuery }).catch(() => []),
            fetchCremationCenters({ location: locationQuery }).catch(() => []),
          ]);

          vets.forEach((v) => pushUnique(v, resolveTypeName(v, 'Veterinarians')));
          providers.forEach((p) => pushUnique(p, resolveTypeName(p, 'Service')));
          centers.forEach((c) =>
            pushUnique({
              _id: c._id,
              name: c.name,
              phone: c.phone,
              address: [c.address, c.city, c.state].filter(Boolean).join(', '),
              latitude: c.latitude,
              longitude: c.longitude,
            }, 'Pet Cremation')
          );
        } else {
          const listToFetch = typesToUse.filter((t) => t.name === selected);

          await Promise.all(
            listToFetch.map(async (t) => {
              if (t.source === 'cremation') {
                const centers = await fetchCremationCenters({ location: locationQuery }).catch(() => []);
                centers.forEach((c) =>
                  pushUnique({
                    _id: c._id,
                    name: c.name,
                    phone: c.phone,
                    address: [c.address, c.city, c.state].filter(Boolean).join(', '),
                    latitude: c.latitude,
                    longitude: c.longitude,
                  }, t.name)
                );
              } else {
                const slug = t.slug && t.slug !== 'All' ? t.slug : undefined;
                const [vets, providers] = await Promise.all([
                  fetchVeterinarians({ location: locationQuery, serviceType: slug }).catch(() => []),
                  fetchServiceProviders({ location: locationQuery, serviceType: slug }).catch(() => []),
                ]);
                vets.forEach((v) => pushUnique(v, t.name));
                providers.forEach((p) => pushUnique(p, t.name));
              }
            })
          );
        }

        let result = all;
        if (search?.trim()) {
          const q = search.trim().toLowerCase();
          result = all.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              (s.address && s.address.toLowerCase().includes(q)) ||
              (s.type && s.type.toLowerCase().includes(q))
          );
        }

        result = withDistanceSorted(result, userCoords);

        if (!cancelled) {
          setServices(result);
          hasData.current = true;
        }
      } catch {
        if (!cancelled && !hasData.current) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [category, city, location, search, typeList, locationQuery, userCoords?.lat, userCoords?.lng]);

  return { services, loading, categories };
}
