/**
 * Maps UI category labels / legacy slugs to backend Product.category enum.
 * Backend values: food, toys, accessories, grooming, health, bedding, other
 */
export const UI_TO_BACKEND_CATEGORY = {
  'All For You': '',
  Food: 'food',
  food: 'food',
  Medicine: 'health',
  medicine: 'health',
  Toys: 'toys',
  toys: 'toys',
  Accessories: 'accessories',
  accessories: 'accessories',
  Grooming: 'grooming',
  grooming: 'grooming',
  Walk: 'accessories',
  walk: 'accessories',
  Feeders: 'accessories',
  feeders: 'accessories',
  Treats: 'food',
  treats: 'food',
  Diet: 'food',
  diet: 'food',
  Supplements: 'health',
  supplements: 'health',
  Litter: 'bedding',
  litter: 'bedding',
  'Kidney Care': 'health',
  'kidney-care': 'health',
  'kidney care': 'health',
  'De-wormer': 'health',
  'de-wormer': 'health',
  'Tick & Flea': 'health',
  'tick-flea': 'health',
  'tick & flea': 'health',
  'Joint Care': 'health',
  'joint-care': 'health',
  'joint care': 'health',
  'Immune Care': 'health',
  'immune-care': 'health',
  'immune care': 'health',
  'Liver Care': 'health',
  'liver-care': 'health',
  'liver care': 'health',
  'Beds & Mats': 'bedding',
  'beds-mats': 'bedding',
  'beds & mats': 'bedding',
  bedding: 'bedding',
  Travel: 'accessories',
  travel: 'accessories',
  health: 'health',
  other: 'other',
};

/**
 * @param {string} uiName - Label or slug from nav / tiles / URL
 * @returns {string} Backend category slug (may be empty for "All")
 */
export function getBackendCategory(uiName) {
  if (uiName == null || uiName === '') return '';
  const raw = String(uiName).trim();
  if (!raw) return '';

  if (Object.prototype.hasOwnProperty.call(UI_TO_BACKEND_CATEGORY, raw)) {
    return UI_TO_BACKEND_CATEGORY[raw];
  }

  const lower = raw.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(UI_TO_BACKEND_CATEGORY, lower)) {
    return UI_TO_BACKEND_CATEGORY[lower];
  }

  // Title Case key e.g. "Kidney Care"
  const titled = raw.replace(/\b\w/g, (c) => c.toUpperCase());
  if (Object.prototype.hasOwnProperty.call(UI_TO_BACKEND_CATEGORY, titled)) {
    return UI_TO_BACKEND_CATEGORY[titled];
  }

  return lower;
}

/**
 * Map a URL category param (possibly comma-separated) to backend slugs.
 * @param {string|null|undefined} categoryParam
 * @returns {string|undefined}
 */
export function mapCategoryParam(categoryParam) {
  if (!categoryParam || !String(categoryParam).trim()) return undefined;
  const mapped = String(categoryParam)
    .split(',')
    .map((c) => getBackendCategory(c.trim()))
    .filter(Boolean);
  // de-dupe (medicine + supplements → health,health)
  const unique = [...new Set(mapped)];
  return unique.length ? unique.join(',') : undefined;
}
