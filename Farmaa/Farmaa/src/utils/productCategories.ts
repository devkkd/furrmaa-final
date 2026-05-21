/**
 * Maps UI category labels to backend category enum.
 * Admin sets product category as one of: food, toys, accessories, grooming, health, bedding, other
 */
export const UI_TO_BACKEND_CATEGORY: Record<string, string> = {
  'All For You': '',
  'Food': 'food',
  'Medicine': 'health',
  'Toys': 'toys',
  'Accessories': 'accessories',
  'Grooming': 'grooming',
  'Walk': 'accessories',
  'Feeders': 'accessories',
  'Treats': 'food',
  'Diet': 'food',
  'Supplements': 'health',
  'Litter': 'bedding',
  'Kidney Care': 'health',
  'De-wormer': 'health',
  'Tick & Flea': 'health',
  'Joint Care': 'health',
  'Immune Care': 'health',
  'Liver Care': 'health',
  'Beds & Mats': 'bedding',
  'Travel': 'accessories',
};

export function getBackendCategory(uiName: string): string {
  const mapped = UI_TO_BACKEND_CATEGORY[uiName];
  if (mapped !== undefined) return mapped;
  return uiName.toLowerCase();
}

/** Backend category enum values for reference */
export const BACKEND_CATEGORIES = ['food', 'toys', 'accessories', 'grooming', 'health', 'bedding', 'other'] as const;
