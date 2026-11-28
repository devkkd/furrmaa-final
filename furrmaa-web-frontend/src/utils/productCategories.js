/**
 * Maps UI category labels / legacy slugs to backend Product.category enum.
 * Backend values: food, toys, accessories, grooming, health, bedding, other
 */
export const UI_TO_BACKEND_CATEGORY = {
  'All For You': '',
  Food: 'food',
  food: 'food',
  foodnew: 'food',
  'cat-food': 'food',
  'cat-treats': 'food',
  Medicine: 'health',
  medicine: 'health',
  Toys: 'toys',
  toys: 'toys',
  toyss: 'toys',
  'cat-toys': 'toys',
  Accessories: 'accessories',
  accessories: 'accessories',
  Walk: 'accessories',
  walk: 'accessories',
  'cat-walk': 'accessories',
  Feeders: 'accessories',
  feeders: 'accessories',
  feederss: 'accessories',
  'cat-feeders': 'accessories',
  Grooming: 'grooming',
  grooming: 'grooming',
  groomings: 'grooming',
  'cat-grooming': 'grooming',
  Treats: 'food',
  treats: 'food',
  Diet: 'food',
  diet: 'food',
  Supplements: 'health',
  supplements: 'health',
  Litter: 'bedding',
  litter: 'bedding',
  'cat-litter': 'bedding',
  'Kidney Care': 'health',
  'kidney-care': 'health',
  'kidney care': 'health',
  'cat-kidney-care': 'health',
  'De-wormer': 'health',
  'de-wormer': 'health',
  dewormer: 'health',
  'cat-dewormer': 'health',
  'Tick & Flea': 'health',
  'tick-flea': 'health',
  'tick & flea': 'health',
  'tick--fleas': 'health',
  'cat-tick--fleas': 'health',
  'Joint Care': 'health',
  'joint-care': 'health',
  'joint care': 'health',
  'cat-joint-care': 'health',
  'Immune Care': 'health',
  'immune-care': 'health',
  'immune care': 'health',
  'Liver Care': 'health',
  'liver-care': 'health',
  'liver care': 'health',
  'cat-liver-care': 'health',
  'Cardiac Care': 'health',
  'cardiac-care': 'health',
  'cat-cardiac-care': 'health',
  'cat-supplements': 'health',
  'Beds & Mats': 'bedding',
  'beds-mats': 'bedding',
  'beds & mats': 'bedding',
  'cat-beds--mats': 'bedding',
  bedding: 'bedding',
  Travel: 'accessories',
  travel: 'accessories',
  'cat-travel': 'accessories',
  health: 'health',
  other: 'other',
};

/**
 * Intelligent categorization fallback based on product name and keywords.
 * Resolves miscategorized database items (e.g. combs marked as food).
 */
export function inferProductCategory(product) {
  if (!product) return 'other';
  const name = String(product.name || '').toLowerCase();
  const rawCat = String(product.category || '').toLowerCase().trim();

  // 1. Definite Grooming items
  if (/\b(comb|combs|brush|brushes|grooming|shampoo|conditioner|dryer|trimmer|nail|de-shedding)\b/i.test(name)) {
    return 'grooming';
  }

  // 2. Definite Accessories items
  if (/\b(harness|collar|leash|carrier|crate|feeder|bowl|belt|bandana|shoes|raincoat|jacket|dispenser)\b/i.test(name)) {
    return 'accessories';
  }

  // 3. Definite Bedding & Litter items
  if (/\b(cat litter|litter|bed|mat|mats|cushion|blanket|house)\b/i.test(name)) {
    return 'bedding';
  }

  // 4. Definite Medicine & Health items
  if (/\b(lotion|syrup|drop|drops|spray|wound|tick|flea|dewormer|nutricoat|calcium|vitamin|omega|paw cream|antiseptic|tablet|capsule|tonic)\b/i.test(name)) {
    return 'health';
  }

  // 5. Definite Food & Treats items
  if (/\b(food|meal|meals|broth|gravy|biscuit|biscuits|chew|chews|treat|treats|dry food|wet food|dry|kibble)\b/i.test(name)) {
    return 'food';
  }

  // 6. Definite Toys
  if (/\b(toy|toys|ball|rope|squeak|plush|teaser)\b/i.test(name)) {
    return 'toys';
  }

  return getBackendCategory(rawCat) || rawCat || 'other';
}

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
