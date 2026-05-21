'use client';

import { useState, useEffect } from 'react';
import { fetchVetServiceTypes, fetchVeterinarians, fetchServiceProviders, fetchCremationCenters } from '@/lib/api';

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

export function useVetServices(options = {}) {
  const { category, city, search } = options;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeList, setTypeList] = useState([]);
  const categories = ['All', ...(typeList.length ? typeList.map((t) => t.name) : VET_SERVICE_CATEGORIES.slice(1))];

  useEffect(() => {
    let cancelled = false;
    fetchVetServiceTypes()
      .then((list) => {
        if (cancelled || !list || !list.length) return;
        setTypeList(list.map((t) => ({ name: t.name, slug: t.slug || t.name, source: t.source })));
      })
      .catch(() => setTypeList([]));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const selected = category && category !== 'All' ? category : null;
    const typesToUse = typeList.length
      ? typeList
      : VET_SERVICE_CATEGORIES.slice(1).map((name) => ({
          name,
          slug: name,
          source: name === 'Veterinarians' ? 'veterinarian' : name === 'Pet Cremation' ? 'cremation' : 'service_provider',
        }));

    const load = async () => {
      try {
        const all = [];
        const listToFetch = selected ? typesToUse.filter((t) => t.name === selected) : typesToUse;

        for (const t of listToFetch) {
          if (t.source === 'cremation') {
            const centers = await fetchCremationCenters({ city: city || undefined });
            centers.forEach((c, i) =>
              all.push(toServiceItem({
                _id: c._id,
                name: c.name,
                phone: c.phone,
                address: [c.address, c.city, c.state].filter(Boolean).join(', '),
              }, t.name, all.length + i))
            );
          } else {
            // Har type ke liye dono: veterinarians (serviceType) + service providers (serviceType)
            const vets = await fetchVeterinarians({
              city: city || undefined,
              serviceType: t.slug && t.slug !== 'All' ? t.slug : undefined,
            });
            vets.forEach((v, i) => all.push(toServiceItem(v, t.name, all.length + i)));
            const providers = await fetchServiceProviders({
              serviceType: t.slug && t.slug !== 'All' ? t.slug : undefined,
            });
            providers.forEach((p, i) => all.push(toServiceItem(p, t.name, all.length + i)));
          }
        }

        if (!cancelled) setServices(all);
      } catch (e) {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [category, city, search, typeList]);

  return { services, loading, categories };
}
