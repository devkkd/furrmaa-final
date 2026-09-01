'use client';

import { useState, useEffect } from 'react';
import { fetchVetServiceTypes, fetchVeterinarians, fetchServiceProviders, fetchCremationCenters } from '@/lib/api';
import { locationSearchToken } from '@/lib/geolocation';

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
function toServiceItem(item, typeName, index) {
  const addr = item.address;
  const addressStr = typeof addr === 'object'
    ? [addr?.street, addr?.city, addr?.state].filter(Boolean).join(', ')
    : (addr || item.address) || '';
  const fullAddress = typeof addr === 'object'
    ? `${addr?.street || ''}, ${addr?.city || ''}, ${addr?.state || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || addressStr
    : addressStr;
  return {
    id: item._id,
    name: item.name || item.clinicName || 'Service',
    distance: `${(index + 1) * 0.5} km away`,
    address: fullAddress || 'Address not available',
    image: item.profileImage || undefined,
    category: item.specialization || item.services?.[0] || typeName,
    phone: item.phone,
    type: typeName,
  };
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
  const { category, city, location, search } = options;
  const locationQuery = locationSearchToken(location) || locationSearchToken(city) || undefined;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeList, setTypeList] = useState([]);
  const categories = ['All', ...(typeList.length ? typeList.map((t) => t.name) : VET_SERVICE_CATEGORIES.slice(1))];

  useEffect(() => {
    let cancelled = false;
    fetchVetServiceTypes()
      .then((list) => {
        if (cancelled) return;
        setTypeList(mergeTypeLists(list));
      })
      .catch(() => {
        if (!cancelled) setTypeList(DEFAULT_TYPES);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const selected = category && category !== 'All' ? category : null;
    const typesToUse = typeList.length ? typeList : DEFAULT_TYPES;

    const load = async () => {
      try {
        const all = [];
        const seen = new Set();

        const pushUnique = (item, typeName, index) => {
          const key = String(item._id || item.id || '');
          if (key && seen.has(key)) return;
          if (key) seen.add(key);
          all.push(toServiceItem(item, typeName, index));
        };

        if (!selected) {
          const [vets, providers, centers] = await Promise.all([
            fetchVeterinarians({ location: locationQuery }),
            fetchServiceProviders({ location: locationQuery }),
            fetchCremationCenters({ location: locationQuery }),
          ]);

          vets.forEach((v, i) => pushUnique(v, resolveTypeName(v, 'Veterinarians'), i));
          providers.forEach((p, i) => pushUnique(p, resolveTypeName(p, 'Service'), vets.length + i));
          centers.forEach((c, i) =>
            pushUnique({
              _id: c._id,
              name: c.name,
              phone: c.phone,
              address: [c.address, c.city, c.state].filter(Boolean).join(', '),
            }, 'Pet Cremation', vets.length + providers.length + i)
          );
        } else {
          const listToFetch = typesToUse.filter((t) => t.name === selected);

          for (const t of listToFetch) {
            if (t.source === 'cremation') {
              const centers = await fetchCremationCenters({ location: locationQuery });
              centers.forEach((c, i) =>
                pushUnique({
                  _id: c._id,
                  name: c.name,
                  phone: c.phone,
                  address: [c.address, c.city, c.state].filter(Boolean).join(', '),
                }, t.name, all.length + i)
              );
            } else {
              const slug = t.slug && t.slug !== 'All' ? t.slug : undefined;
              const [vets, providers] = await Promise.all([
                fetchVeterinarians({ location: locationQuery, serviceType: slug }),
                fetchServiceProviders({ location: locationQuery, serviceType: slug }),
              ]);
              vets.forEach((v, i) => pushUnique(v, t.name, all.length + i));
              providers.forEach((p, i) => pushUnique(p, t.name, all.length + i));
            }
          }
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

        if (!cancelled) setServices(result);
      } catch (e) {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [category, city, location, search, typeList, locationQuery]);

  return { services, loading, categories };
}
