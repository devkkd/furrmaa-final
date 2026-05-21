/**
 * Vet Service types – same list as web (useVetServices) for consistency.
 * Used for category filter and API params.
 */
export const VET_SERVICE_TYPES = [
  'All',
  'Veterinarians',
  'Pet Shops',
  'Hospitals',
  'Pet Hotels / Hostels',
  'NGOs',
  'Shelters',
  'Rescue Centers',
  'Pet Cremation',
] as const;

export type VetServiceType = (typeof VET_SERVICE_TYPES)[number];

/** Map UI category to backend serviceType for service-providers API */
export function getServiceTypeForApi(category: string): string | undefined {
  if (!category || category === 'All') return undefined;
  if (category === 'Pet Cremation') return 'cremation';
  if (category === 'Veterinarians') return 'Veterinarians';
  return category;
}
