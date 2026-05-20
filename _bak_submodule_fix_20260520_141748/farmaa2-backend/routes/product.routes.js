import express from 'express';
import Product from '../models/Product.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { normalizeProductImageUrls } from '../utils/productImages.js';
import { addProductReview, getReviewEligibility } from '../utils/productReviews.js';

function withNormalizedImages(doc) {
  const p = doc?.toObject ? doc.toObject() : { ...doc };
  p.images = normalizeProductImageUrls(p.images);
  return p;
}

const router = express.Router();

// Helper: filter sirf tab lagao jab param select ho (non-empty)
const hasVal = (v) => v != null && String(v).trim() !== '';

// Get all products ('' and '/' dono match – Express path normalisation ke liye)
router.get(['/', ''], async (req, res) => {
  try {
    const { category, petType, age, search, sortBy, minPrice, maxPrice, minRating, size, dietary } = req.query;
    const query = { isActive: true };

    // Age filter – sirf jab age select ho
    if (hasVal(age)) {
      const ages = age.split(',').map(a => a.trim().toLowerCase()).filter(Boolean);
      const validAges = ages.filter(a => ['puppy', 'young', 'adult', 'senior'].includes(a));
      if (validAges.length && !ages.includes('all')) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { age: { $in: validAges } },
            { age: 'all' },
          ],
        });
      }
    }

    // Category filter – sirf jab category select ho (case-insensitive)
    if (hasVal(category)) {
      const cats = Array.isArray(category)
        ? category.map(c => c.trim().toLowerCase()).filter(Boolean)
        : typeof category === 'string'
          ? category.split(',').map(c => c.trim().toLowerCase()).filter(Boolean)
          : [];
      if (cats.length) {
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (cats.length === 1) {
          query.category = new RegExp('^' + escapeRegex(cats[0]) + '$', 'i');
        } else {
          query.$and = query.$and || [];
          query.$and.push({
            $or: cats.map((c) => ({ category: new RegExp('^' + escapeRegex(c) + '$', 'i') })),
          });
        }
      }
    }
    
    // Pet type filter – multiple allowed (comma-separated)
    if (hasVal(petType)) {
      const types = String(petType).split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
      if (types.length) {
        query.petType = { $in: [...types, 'both'] };
      }
    }
    
    // Search filter – name, description, aur category (slug) sab pe match; "food" / category search pe saari food products aayengi
    if (hasVal(search)) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const searchQuery = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
      query.$and = query.$and || [];
      query.$and.push({ $or: searchQuery });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Rating filter – sirf jab rating select ho
    if (minRating != null && minRating !== '') {
      query.rating = { $gte: Number(minRating) };
    }

    // Size filter – sirf jab size select ho
    if (hasVal(size)) {
      const sizes = typeof size === 'string' ? size.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
      if (sizes.length) {
        const sizeMatch = sizes.length === 1 ? sizes[0] : { $in: sizes };
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { size: sizeMatch },
            { size: null },
            { size: '' },
            { size: { $exists: false } },
          ],
        });
      }
    }

    // Dietary filter – sirf jab dietary select ho (slug normalize)
    if (hasVal(dietary)) {
      const raw = typeof dietary === 'string' ? dietary.split(',').map(d => d.trim().toLowerCase()).filter(Boolean) : [];
      const dietaryList = raw.map((d) => d.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      if (dietaryList.length) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { dietaryNeeds: { $in: dietaryList } },
            { dietaryNeeds: { $exists: false } },
            { dietaryNeeds: { $size: 0 } },
          ],
        });
      }
    }

    // Build sort object
    let sort = { createdAt: -1 }; // Default: newest first
    
    if (sortBy) {
      switch (sortBy) {
        case 'popularity':
        case 'Popularity':
          sort = { rating: -1, createdAt: -1 }; // High rating first, then newest
          break;
        case 'newest':
        case 'New Arrivals':
          sort = { createdAt: -1 }; // Newest first
          break;
        case 'price-low':
        case 'Price: Low to High':
          sort = { price: 1 }; // Low to high
          break;
        case 'price-high':
        case 'Price: High to Low':
          sort = { price: -1 }; // High to low
          break;
        case 'rating':
          sort = { rating: -1, reviews: -1 }; // High rating first
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const products = await Product.find(query).sort(sort).lean();
    res.json({
      success: true,
      products: products.map((p) => withNormalizedImages(p)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Default item-detail keys so frontend product page always gets same shape (admin-filled fields)
const ITEM_DETAIL_KEYS = {
  unitCount: '',
  numberOfItems: '',
  itemWeight: '',
  brandName: '',
  flavor: '',
  ageRange: '',
  itemForm: '',
  specialIngredients: '',
  asin: '',
  itemHSN: '',
  itemHeight: '',
  manufacturer: '',
  manufacturerContactInfo: '',
};

// Check if logged-in user can review (delivered order, not yet reviewed)
router.get('/:id/can-review', protect, async (req, res) => {
  try {
    const eligibility = await getReviewEligibility(req.user.id, req.params.id);
    res.json({ success: true, ...eligibility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product review (after delivered purchase)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    const product = await addProductReview(
      req.params.id,
      req.user.id,
      rating,
      comment
    );
    const normalized = withNormalizedImages(product.toObject());
    res.status(201).json({
      success: true,
      message: 'Review submitted',
      product: normalized,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

// Get single product (full document + item details for product detail page)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name email')
      .lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    // Ensure item-detail fields always present so frontend can show them
    const productWithDetails = withNormalizedImages({
      ...ITEM_DETAIL_KEYS,
      ...product,
    });
    res.json({ success: true, product: productWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


