import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadImage, uploadVideo } from '../config/cloudinary.js';
import {
  normalizeProductPayload,
  normalizeProductImageUrls,
} from '../utils/productImages.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import FAQ from '../models/FAQ.model.js';
import Feedback from '../models/Feedback.model.js';
import SupportChat from '../models/SupportChat.model.js';
import Notification from '../models/Notification.model.js';
import Address from '../models/Address.model.js';
import TrainingVideo from '../models/TrainingVideo.model.js';
import ExploreContent from '../models/ExploreContent.model.js';
import Post from '../models/Post.model.js';
import Pet from '../models/Pet.model.js';
import Adoption from '../models/Adoption.model.js';
import PetEvent from '../models/PetEvent.model.js';
import CremationCenter from '../models/CremationCenter.model.js';
import CremationRequest from '../models/CremationRequest.model.js';
import HopePost from '../models/HopePost.model.js';
import Booking from '../models/Booking.model.js';
import Emergency from '../models/Emergency.model.js';
import Training from '../models/Training.model.js';
import AIChat from '../models/AIChat.model.js';
import Wishlist from '../models/Wishlist.model.js';
import Wallet from '../models/Wallet.model.js';
import { creditWalletForOrderRefund } from '../utils/walletRefund.js';
import VetServiceType from '../models/VetServiceType.model.js';
import Category from '../models/Category.model.js';
import ProductSize from '../models/ProductSize.model.js';
import ProductDietary from '../models/ProductDietary.model.js';
import { syncZohoShippingForOrder } from '../utils/zohoInventory.service.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// DEV only: one-tap admin login (disabled in production)
router.post('/dev-login', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not available in production' });
  }
  try {
    const admin = await User.findOne({ role: 'admin', isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        _id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Admin dev login failed' });
  }
});

// Public webhook endpoint used by Zoho callbacks.
router.post('/orders/zoho/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.ZOHO_WEBHOOK_SECRET || '';
    const headerSecret = req.headers['x-zoho-webhook-secret'];
    if (!webhookSecret || headerSecret !== webhookSecret) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }

    const body = req.body || {};
    const salesOrderId = body.salesorder_id || body.sales_order_id || body.salesOrderId;
    if (!salesOrderId) {
      return res.status(400).json({ success: false, message: 'salesOrderId missing' });
    }

    const order = await Order.findOne({ 'zohoShipping.salesOrderId': salesOrderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for given salesOrderId' });
    }

    const trackingNumber = body.tracking_number || body.trackingNumber || '';
    const trackingUrl = body.tracking_url || body.trackingUrl || '';
    const shipmentId = body.shipment_id || body.shipmentId || '';
    const packageId = body.package_id || body.packageId || '';
    const status = String(body.status || body.shipment_status || body.delivery_status || '').trim() || order.shippingDetails?.status || 'processing';

    order.zohoShipping = {
      ...(order.zohoShipping || {}),
      shipmentId: shipmentId || order.zohoShipping?.shipmentId,
      packageId: packageId || order.zohoShipping?.packageId,
      trackingNumber: trackingNumber || order.zohoShipping?.trackingNumber,
      trackingUrl: trackingUrl || order.zohoShipping?.trackingUrl,
      status,
      syncStatus: 'success',
      syncError: '',
      lastSyncAt: new Date(),
    };
    order.shippingDetails = {
      ...(order.shippingDetails || {}),
      trackingNumber: trackingNumber || order.shippingDetails?.trackingNumber,
      trackingUrl: trackingUrl || order.shippingDetails?.trackingUrl,
      status,
      lastUpdatedAt: new Date(),
    };
    if (trackingNumber) order.trackingNumber = trackingNumber;

    const statusMap = {
      confirmed: 'confirmed',
      packed: 'processing',
      shipped: 'shipped',
      in_transit: 'shipped',
      out_for_delivery: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    const normalized = status.toLowerCase().replace(/\s+/g, '_');
    if (statusMap[normalized]) {
      order.orderStatus = statusMap[normalized];
    }

    await order.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protect every route below for logged-in admins only.
router.use(protect);
router.use(authorize('admin'));

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .limit(10)
      .sort({ createdAt: -1 });

    // Get order stats
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Categories (Admin) – dynamic product categories
// ----------------------

// Create category (name → slug auto, optional image)
router.post('/categories', async (req, res) => {
  try {
    const { name, slug: slugInput, image: imageUrl } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const slug = (slugInput && String(slugInput).trim())
      ? String(slugInput).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : String(name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Valid category name is required' });
    }
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: `Category with slug "${slug}" already exists` });
    }
    const category = await Category.create({
      name: String(name).trim(),
      slug,
      image: imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : '',
      section: 'all',
      petType: ['both'],
      displayOrder: (await Category.countDocuments()) + 1,
      isActive: true,
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all categories (admin – including inactive); returns name, slug, image, etc.
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update category (e.g. add/change image for existing category)
router.patch('/categories/:id', async (req, res) => {
  try {
    const { image, name, isActive } = req.body;
    const update = {};
    if (typeof image === 'string') update.image = image.trim() || '';
    if (name && String(name).trim()) update.name = String(name).trim();
    if (typeof isActive === 'boolean') update.isActive = isActive;
    const category = await Category.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete category (blocked if products still use this category slug)
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const slug = category.slug;
    const inUse = await Product.countDocuments({
      $or: [
        { category: slug },
        { category: new RegExp(`^${slug}$`, 'i') },
      ],
    });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${inUse} product(s) use this category. Reassign them first.`,
      });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Sizes (Admin) – product size options
// ----------------------
router.post('/sizes', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Size name is required' });
    }
    const slug = String(name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'size';
    const existing = await ProductSize.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: `Size "${slug}" already exists` });
    }
    const size = await ProductSize.create({
      name: String(name).trim(),
      slug,
      displayOrder: (await ProductSize.countDocuments()) + 1,
      isActive: true,
    });
    res.status(201).json({ success: true, size });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sizes', async (req, res) => {
  try {
    const sizes = await ProductSize.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, sizes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Dietary (Admin) – product dietary options
// ----------------------
router.post('/dietary', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Dietary name is required' });
    }
    const slug = String(name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'dietary';
    const existing = await ProductDietary.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: `Dietary "${slug}" already exists` });
    }
    const dietary = await ProductDietary.create({
      name: String(name).trim(),
      slug,
      displayOrder: (await ProductDietary.countDocuments()) + 1,
      isActive: true,
    });
    res.status(201).json({ success: true, dietary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dietary', async (req, res) => {
  try {
    const dietary = await ProductDietary.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, dietary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Products CRUD (Admin)
// ----------------------

// List products (with optional filters: search, category, petType, age, size, dietary, minRating)
router.get('/products', async (req, res) => {
  try {
    const { search, category, petType, age, size, dietary, minRating } = req.query;
    const query = {};

    if (search && String(search).trim()) {
      const term = String(search).trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }
    if (category && String(category).trim()) {
      const cats = String(category).trim().toLowerCase().split(',').map((c) => c.trim()).filter(Boolean);
      if (cats.length) query.category = cats.length === 1 ? new RegExp(`^${cats[0]}$`, 'i') : { $in: cats };
    }
    if (petType && String(petType).trim()) {
      const p = String(petType).trim().toLowerCase();
      if (['dog', 'cat', 'both'].includes(p)) query.petType = { $in: [p, 'both'] };
    }
    if (age && String(age).trim()) query.age = { $in: [String(age).trim().toLowerCase(), 'all'] };
    if (size && String(size).trim()) query.size = new RegExp(`^${String(size).trim()}$`, 'i');
    if (dietary && String(dietary).trim()) query.dietaryNeeds = { $in: String(dietary).trim().split(',').map((d) => d.trim()).filter(Boolean) };
    if (minRating != null && !isNaN(Number(minRating))) query.rating = { $gte: Number(minRating) };

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      products: products.map((p) => ({
        ...p,
        images: normalizeProductImageUrls(p.images),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Default item-detail keys so frontend product page always gets same shape
const PRODUCT_ITEM_DETAIL_DEFAULTS = {
  unitCount: '', numberOfItems: '', itemWeight: '', brandName: '', flavor: '', ageRange: '',
  itemForm: '', specialIngredients: '', asin: '', itemHSN: '', itemHeight: '', manufacturer: '', manufacturerContactInfo: '',
};

// Get single product (full document with item details for product detail page)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const productWithDetails = {
      ...PRODUCT_ITEM_DETAIL_DEFAULTS,
      ...product,
      images: normalizeProductImageUrls(product.images),
    };
    res.json({ success: true, product: productWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(normalizeProductPayload(req.body));
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Item-detail field names (so PUT always persists them from req.body)
const PRODUCT_ITEM_FIELDS = [
  'unitCount', 'numberOfItems', 'itemWeight', 'brandName', 'flavor', 'ageRange',
  'itemForm', 'specialIngredients', 'asin', 'itemHSN', 'itemHeight', 'manufacturer', 'manufacturerContactInfo',
];

// Update product (explicitly set item-detail fields so they always save)
router.put('/products/:id', async (req, res) => {
  try {
    const body = normalizeProductPayload(req.body || {});
    const update = { ...body };
    // Always write item-detail fields (from body or empty string) so they persist
    for (const key of PRODUCT_ITEM_FIELDS) {
      update[key] = body[key] != null && body[key] !== '' ? String(body[key]).trim() : '';
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk upload products from Excel
router.post('/products/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    const XLSX = await import('xlsx');
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const products = XLSX.utils.sheet_to_json(worksheet);

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No products found in Excel file' });
    }

    const categoryDocs = await Category.find({ isActive: true }).select('slug');
    const validCategories = categoryDocs.map((c) => c.slug);
    const validPetTypes = ['dog', 'cat', 'both'];
    const errors = [];
    const created = [];
    const skipped = [];

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      try {
        // Validate required fields
        if (!row.name || !row.category || !row.price || !row.stock) {
          errors.push(`Row ${i + 2}: Missing required fields (name, category, price, stock)`);
          continue;
        }

        // Validate category
        const category = row.category.toLowerCase().trim();
        if (!validCategories.includes(category)) {
          errors.push(`Row ${i + 2}: Invalid category "${row.category}". Must be one of: ${validCategories.join(', ')}`);
          continue;
        }

        // Validate petType
        let petType = ['both'];
        if (row.petType) {
          const petTypes = String(row.petType).toLowerCase().split(',').map(t => t.trim());
          petType = petTypes.filter(t => validPetTypes.includes(t));
          if (petType.length === 0) petType = ['both'];
        }

        // Create product
        const productData = {
          name: String(row.name).trim(),
          description: String(row.description || '').trim() || 'No description provided',
          category: category,
          petType: petType,
          price: parseFloat(row.price) || 0,
          discountPrice: row.discountPrice ? parseFloat(row.discountPrice) : undefined,
          stock: parseInt(row.stock) || 0,
          brand: row.brand ? String(row.brand).trim() : undefined,
          isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
        };

        if (productData.price <= 0) {
          errors.push(`Row ${i + 2}: Price must be greater than 0`);
          continue;
        }

        const product = await Product.create(productData);
        created.push(product);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
        skipped.push(i + 2);
      }
    }

    res.json({
      success: true,
      message: `Uploaded ${created.length} products successfully`,
      created: created.length,
      errors: errors.length,
      skipped: skipped.length,
      errorDetails: errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download Excel template
router.get('/products/template', async (req, res) => {
  try {
    const XLSX = await import('xlsx');
    
    // Create template data
    const templateData = [
      {
        name: 'Premium Dog Food',
        description: 'High quality dog food for all breeds',
        category: 'food',
        petType: 'dog',
        price: 1500,
        discountPrice: 1200,
        stock: 100,
        brand: 'PetBrand',
        isActive: true,
      },
      {
        name: 'Cat Toy Set',
        description: 'Interactive toys for cats',
        category: 'toys',
        petType: 'cat',
        price: 500,
        discountPrice: 400,
        stock: 50,
        brand: 'ToyBrand',
        isActive: true,
      },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Add header row with instructions
    XLSX.utils.sheet_add_aoa(ws, [
      ['Product Bulk Upload Template'],
      [''],
      ['Instructions:'],
      ['1. Fill in all required fields (name, category, price, stock)'],
      ['2. Category must be one of: food, toys, accessories, grooming, health, bedding, other'],
      ['3. PetType can be: dog, cat, or both (comma-separated for multiple)'],
      ['4. Price and stock must be numbers'],
      ['5. Delete example rows before uploading'],
      [''],
    ], { origin: 'A1' });

    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=product-upload-template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Orders Management (Admin)
// ----------------------

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.product', 'name images price description');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber, notes, carrier, trackingUrl, shippingStatus, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    order.shippingDetails = {
      ...(order.shippingDetails || {}),
      carrier: carrier ?? order.shippingDetails?.carrier,
      trackingNumber: trackingNumber ?? order.shippingDetails?.trackingNumber,
      trackingUrl: trackingUrl ?? order.shippingDetails?.trackingUrl,
      status: shippingStatus ?? order.shippingDetails?.status,
      estimatedDelivery: estimatedDelivery ?? order.shippingDetails?.estimatedDelivery,
      lastUpdatedAt: new Date(),
    };
    if (notes !== undefined) {
      order.notes = notes;
    }

    if (orderStatus === 'returned') {
      const refundResult = await creditWalletForOrderRefund(order);
      if (refundResult.credited) {
        order.notes = [
          order.notes,
          `Wallet refund ₹${refundResult.amount} credited on ${new Date().toISOString()}`,
        ]
          .filter(Boolean)
          .join('\n');
      }
    }

    if (orderStatus === 'shipped' && process.env.ZOHO_AUTO_SYNC_ON_SHIPPED === 'true') {
      const zohoShipping = await syncZohoShippingForOrder(order);
      order.zohoShipping = {
        ...(order.zohoShipping || {}),
        ...zohoShipping,
      };
      order.shippingDetails = {
        ...(order.shippingDetails || {}),
        trackingNumber: zohoShipping.trackingNumber || order.shippingDetails?.trackingNumber,
        trackingUrl: zohoShipping.trackingUrl || order.shippingDetails?.trackingUrl,
        status: zohoShipping.status || order.shippingDetails?.status || 'shipped',
        lastUpdatedAt: new Date(),
      };
    }

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Manual shipping details update
router.put('/orders/:id/shipping', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const { carrier, trackingNumber, trackingUrl, status, estimatedDelivery } = req.body || {};
    order.shippingDetails = {
      ...(order.shippingDetails || {}),
      carrier: carrier ?? order.shippingDetails?.carrier,
      trackingNumber: trackingNumber ?? order.shippingDetails?.trackingNumber,
      trackingUrl: trackingUrl ?? order.shippingDetails?.trackingUrl,
      status: status ?? order.shippingDetails?.status,
      estimatedDelivery: estimatedDelivery ?? order.shippingDetails?.estimatedDelivery,
      lastUpdatedAt: new Date(),
    };
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Sync shipping with Zoho Inventory
router.post('/orders/:id/zoho-sync', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name description');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const zohoShipping = await syncZohoShippingForOrder(order);
    order.zohoShipping = {
      ...(order.zohoShipping || {}),
      ...zohoShipping,
    };
    order.shippingDetails = {
      ...(order.shippingDetails || {}),
      trackingNumber: zohoShipping.trackingNumber || order.shippingDetails?.trackingNumber,
      trackingUrl: zohoShipping.trackingUrl || order.shippingDetails?.trackingUrl,
      status: zohoShipping.status || order.shippingDetails?.status,
      lastUpdatedAt: new Date(),
    };
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get order statistics
router.get('/orders/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// FAQ Management (Admin)
// ----------------------

// Get all FAQs
router.get('/faq', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create FAQ
router.post('/faq', async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update FAQ
router.put('/faq/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete FAQ
router.delete('/faq/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    await faq.deleteOne();
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Feedback Management (Admin)
// ----------------------

// Get all feedback (incl. Contact Us form submissions – type=contact)
router.get('/feedback', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type; // e.g. type=contact for Contact Us only

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single feedback
router.get('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email phone');
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Respond to feedback
router.put('/feedback/:id/respond', async (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    feedback.adminResponse = adminResponse;
    feedback.status = status || feedback.status;
    feedback.respondedAt = new Date();
    await feedback.save();

    res.json({ success: true, feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// Support Chat Management (Admin)
// ----------------------

// Get all support chats
router.get('/support', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const chats = await SupportChat.find(query)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupportChat.countDocuments(query);

    res.json({
      success: true,
      chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single chat
router.get('/support/:id', async (req, res) => {
  try {
    const chat = await SupportChat.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name email');
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send admin message
router.post('/support/:id/message', async (req, res) => {
  try {
    const chat = await SupportChat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.messages.push({
      sender: 'admin',
      message: req.body.message,
      attachments: req.body.attachments || []
    });

    if (req.body.status) {
      chat.status = req.body.status;
    }

    const adminId = req.user?._id ?? req.user?.id;
    if (!chat.assignedTo && adminId) {
      chat.assignedTo = adminId;
    }

    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update chat status
router.put('/support/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const chat = await SupportChat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.status = status;
    if (status === 'resolved' || status === 'closed') {
      chat.resolvedAt = new Date();
    }
    await chat.save();

    res.json({ success: true, chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// Notifications Management (Admin)
// ----------------------

// Send notification to user
router.post('/notifications/send', async (req, res) => {
  try {
    const { userId, title, message, type, relatedId, relatedModel } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and message are required'
      });
    }

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type: type || 'system',
      relatedId,
      relatedModel
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Send notification to all users
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'title and message are required'
      });
    }

    const users = await User.find({ isActive: true }).select('_id');
    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type: type || 'system'
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Notification sent to ${notifications.length} users`
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const notifications = await Notification.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments();

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Users Management (Admin)
// ----------------------

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Addresses Management (Admin)
// ----------------------

// Get all addresses
router.get('/addresses', async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (userId) {
      query.user = userId;
    }

    const addresses = await Address.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Address.countDocuments(query);

    res.json({
      success: true,
      addresses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Training Videos Management (Admin)
// ----------------------

// Get all training videos
router.get('/training-videos', async (req, res) => {
  try {
    const videos = await TrainingVideo.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create training video
router.post('/training-videos', async (req, res) => {
  try {
    // Transform flat instructor fields to instructor object if needed
    const videoData = { ...req.body };
    
    // If instructor fields are sent separately, combine them into instructor object
    if (req.body.instructorName || req.body.instructorTitle || req.body.instructorBio) {
      videoData.instructor = {
        name: req.body.instructorName || 'Furrmaa Team',
        title: req.body.instructorTitle || 'Certified Pet Trainer',
        bio: req.body.instructorBio || 'Experienced pet trainer with years of expertise in pet care and training.',
        image: req.body.instructorImage || undefined,
        specialization: req.body.instructorSpecialization || undefined,
        experience: req.body.instructorExperience ? parseInt(req.body.instructorExperience) : undefined,
      };
      // Remove flat fields to avoid conflicts
      delete videoData.instructorName;
      delete videoData.instructorTitle;
      delete videoData.instructorBio;
      delete videoData.instructorImage;
      delete videoData.instructorSpecialization;
      delete videoData.instructorExperience;
    }
    
    // Set isFree based on category if not provided
    if (videoData.isFree === undefined) {
      videoData.isFree = videoData.category === 'basic';
    }
    
    const video = await TrainingVideo.create(videoData);
    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update training video
router.put('/training-videos/:id', async (req, res) => {
  try {
    // Transform flat instructor fields to instructor object if needed
    const updateData = { ...req.body };
    
    // If instructor fields are sent separately, combine them into instructor object
    if (req.body.instructorName || req.body.instructorTitle || req.body.instructorBio) {
      const existingVideo = await TrainingVideo.findById(req.params.id);
      const existingInstructor = existingVideo?.instructor || {};
      
      updateData.instructor = {
        name: req.body.instructorName || existingInstructor.name || 'Furrmaa Team',
        title: req.body.instructorTitle || existingInstructor.title || 'Certified Pet Trainer',
        bio: req.body.instructorBio || existingInstructor.bio || 'Experienced pet trainer with years of expertise in pet care and training.',
        image: req.body.instructorImage || existingInstructor.image || undefined,
        specialization: req.body.instructorSpecialization || existingInstructor.specialization || undefined,
        experience: req.body.instructorExperience ? parseInt(req.body.instructorExperience) : existingInstructor.experience || undefined,
      };
      // Remove flat fields to avoid conflicts
      delete updateData.instructorName;
      delete updateData.instructorTitle;
      delete updateData.instructorBio;
      delete updateData.instructorImage;
      delete updateData.instructorSpecialization;
      delete updateData.instructorExperience;
    }
    
    const video = await TrainingVideo.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json({ success: true, video });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete training video
router.delete('/training-videos/:id', async (req, res) => {
  try {
    const video = await TrainingVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    await video.deleteOne();
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Explore Content Management (Admin)
// ----------------------

// Get all explore content
router.get('/explore-content', async (req, res) => {
  try {
    const { category, type } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;

    const content = await ExploreContent.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create explore content
router.post('/explore-content', async (req, res) => {
  try {
    const content = await ExploreContent.create(req.body);
    res.status(201).json({ success: true, content });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update explore content
router.put('/explore-content/:id', async (req, res) => {
  try {
    const content = await ExploreContent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, content });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete explore content
router.delete('/explore-content/:id', async (req, res) => {
  try {
    const content = await ExploreContent.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    await content.deleteOne();
    res.json({ success: true, message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Social Feed Management (Admin)
// ----------------------

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const posts = await Post.find()
      .populate('user', 'name email profileImage')
      .populate('pet', 'name type breed')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create post (admin can create posts on behalf of users)
router.post('/posts', async (req, res) => {
  try {
    const { user, content, images, pet } = req.body;
    const post = await Post.create({ user, content, images, pet });
    await post.populate('user', 'name profileImage');
    await post.populate('pet', 'name type');
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update post
router.put('/posts/:id', async (req, res) => {
  try {
    const { content, images, pet } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { content, images, pet },
      { new: true, runValidators: true }
    )
      .populate('user', 'name profileImage')
      .populate('pet', 'name type');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Veterinarians Management (Admin)
// ----------------------

// Get all veterinarians
router.get('/veterinarians', async (req, res) => {
  try {
    const { specialization, city, isActive, serviceType } = req.query;
    const query = { role: 'veterinarian' };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (serviceType && serviceType !== 'All') {
      query.serviceType = { $regex: new RegExp(`^${String(serviceType).trim()}$`, 'i') };
    }
    
    const vets = await User.find(query)
      .select('-password')
      .sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, veterinarians: vets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/veterinarians', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      specialization,
      qualification,
      clinicName,
      experience,
      licenseNumber,
      profileImage,
      isActive = true,
      serviceType,
    } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Create new veterinarian
    const veterinarian = await User.create({
      name,
      email,
      phone,
      password: password || 'default123', // Default password if not provided
      address,
      role: 'veterinarian',
      specialization,
      qualification,
      clinicName,
      experience,
      licenseNumber,
      profileImage,
      isActive,
      isVerified: true,
      serviceType: serviceType ? String(serviceType).trim() : undefined,
    });

    res.status(201).json({
      success: true,
      veterinarian: await User.findById(veterinarian._id).select('-password'),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update veterinarian
router.put('/veterinarians/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const vet = await User.findById(req.params.id);
    
    if (!vet || vet.role !== 'veterinarian') {
      return res.status(404).json({ success: false, message: 'Veterinarian not found' });
    }
    
    // Update password separately if provided
    if (password) {
      vet.password = password;
      await vet.save();
    }
    
    // Update other fields
    Object.assign(vet, updateData);
    await vet.save();
    
    const updatedVet = await User.findById(vet._id).select('-password');
    res.json({ success: true, veterinarian: updatedVet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/veterinarians/:id', async (req, res) => {
  try {
    const vet = await User.findById(req.params.id);
    if (!vet || vet.role !== 'veterinarian') {
      return res.status(404).json({ success: false, message: 'Veterinarian not found' });
    }
    
    // Soft delete by setting isActive to false
    vet.isActive = false;
    await vet.save();
    
    res.json({ success: true, message: 'Veterinarian deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Vet Service Types (Admin) – categories shown on Vet Services page
// ----------------------
router.get('/vet-service-types', async (req, res) => {
  try {
    const types = await VetServiceType.find().sort({ order: 1, name: 1 }).maxTimeMS(8000);
    res.json({ success: true, types });
  } catch (error) {
    if (error.message && error.message.includes('buffering timed out')) {
      console.error('MongoDB not connected or slow – vet-service-types using empty list. Check MONGODB_URI and that MongoDB is running.');
      return res.json({ success: true, types: [] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/vet-service-types', async (req, res) => {
  try {
    const { name, slug, source, order } = req.body;
    if (!name || !source) {
      return res.status(400).json({ success: false, message: 'name and source are required' });
    }
    const type = await VetServiceType.create({
      name: name.trim(),
      slug: (slug || name).trim(),
      source: source,
      order: order != null ? Number(order) : 0,
    });
    res.status(201).json({ success: true, type });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/vet-service-types/:id', async (req, res) => {
  try {
    const type = await VetServiceType.findById(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Type not found' });
    const { name, slug, source, order, isActive } = req.body;
    if (name !== undefined) type.name = name.trim();
    if (slug !== undefined) type.slug = slug.trim();
    if (source !== undefined) type.source = source;
    if (order !== undefined) type.order = Number(order);
    if (isActive !== undefined) type.isActive = !!isActive;
    await type.save();
    res.json({ success: true, type });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/vet-service-types/:id', async (req, res) => {
  try {
    const type = await VetServiceType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ success: false, message: 'Type not found' });
    res.json({ success: true, message: 'Vet service type deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Pets for Adoption Management (Admin)
// ----------------------

// Get all pets for adoption
router.get('/pets', async (req, res) => {
  try {
    const { isAdopted, type } = req.query;
    const query = {};
    if (isAdopted !== undefined) query.isAdopted = isAdopted === 'true';
    if (type) query.type = type;
    
    const pets = await Pet.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create pet for adoption
router.post('/pets', async (req, res) => {
  try {
    const pet = await Pet.create(req.body);
    res.status(201).json({ success: true, pet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update pet for adoption
router.put('/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.json({ success: true, pet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete pet for adoption
router.delete('/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    await pet.deleteOne();
    res.json({ success: true, message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Adoption Requests Management (Admin)
// ----------------------

// Get all adoption requests
router.get('/adoptions', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const adoptions = await Adoption.find(query)
      .populate('pet')
      .populate('applicant', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, adoptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update adoption request status
router.put('/adoptions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ success: false, message: 'Adoption request not found' });
    }
    
    adoption.status = status;
    if (status === 'approved') {
      // Mark pet as adopted
      await Pet.findByIdAndUpdate(adoption.pet, { isAdopted: true });
    }
    await adoption.save();
    
    res.json({ success: true, adoption });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// Service Providers Management (Admin)
// ----------------------

// Get all service providers
router.get('/service-providers', async (req, res) => {
  try {
    const providers = await User.find({ role: 'service_provider' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update service provider
router.put('/service-providers/:id', async (req, res) => {
  try {
    const provider = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!provider || provider.role !== 'service_provider') {
      return res.status(404).json({ success: false, message: 'Service provider not found' });
    }
    res.json({ success: true, provider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// Pet Events Management (Admin)
// ----------------------

// Get all pet events
router.get('/pet-events', async (req, res) => {
  try {
    const { city, isActive } = req.query;
    const query = {};
    if (city) query.city = city;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const events = await PetEvent.find(query).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create pet event
router.post('/pet-events', async (req, res) => {
  try {
    const event = await PetEvent.create(req.body);
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update pet event
router.put('/pet-events/:id', async (req, res) => {
  try {
    const event = await PetEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete pet event
router.delete('/pet-events/:id', async (req, res) => {
  try {
    const event = await PetEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Cremation Centers Management (Admin)
// ----------------------

// Get all cremation centers
router.get('/cremation-centers', async (req, res) => {
  try {
    const { city, isActive } = req.query;
    const query = {};
    if (city) query.city = city;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const centers = await CremationCenter.find(query).sort({ createdAt: -1 });
    res.json({ success: true, centers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create cremation center
router.post('/cremation-centers', async (req, res) => {
  try {
    const center = await CremationCenter.create(req.body);
    res.status(201).json({ success: true, center });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update cremation center
router.put('/cremation-centers/:id', async (req, res) => {
  try {
    const center = await CremationCenter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!center) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }
    res.json({ success: true, center });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete cremation center
router.delete('/cremation-centers/:id', async (req, res) => {
  try {
    const center = await CremationCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }
    await center.deleteOne();
    res.json({ success: true, message: 'Center deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all cremation requests
router.get('/cremation-requests', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const requests = await CremationRequest.find(query)
      .populate('user', 'name email phone')
      .populate('center')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await CremationRequest.countDocuments(query);
    
    res.json({
      success: true,
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cremation request status
router.put('/cremation-requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CremationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    request.status = status;
    await request.save();
    res.json({ success: true, request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// Hope Posts Management (Admin)
// ----------------------

// Get all hope posts
router.get('/hope-posts', async (req, res) => {
  try {
    const { postType, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (postType) query.postType = postType;
    if (status) query.status = status;
    
    const posts = await HopePost.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await HopePost.countDocuments(query);
    
    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update hope post (admin can edit location, status, etc.)
router.put('/hope-posts/:id', async (req, res) => {
  try {
    const { status, locationText, description, postType, petType } = req.body;
    const post = await HopePost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (status) post.status = status;
    if (locationText) post.locationText = locationText;
    if (description !== undefined) post.description = description;
    if (postType) post.postType = postType;
    if (petType) post.petType = petType;

    await post.save();
    await post.populate('user', 'name email phone');
    res.json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update hope post status
router.put('/hope-posts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const post = await HopePost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    post.status = status;
    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete hope post
router.delete('/hope-posts/:id', async (req, res) => {
  try {
    const post = await HopePost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Bookings Management (Admin)
// ----------------------

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, serviceType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('serviceProvider', 'name email phone')
      .populate('pet')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update booking status
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (status) booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// Emergency Management (Admin)
// ----------------------

// Get all emergencies
router.get('/emergencies', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const emergencies = await Emergency.find(query)
      .populate('user', 'name email phone')
      .populate('pet')
      .populate('assignedVeterinarian', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Emergency.countDocuments(query);
    
    res.json({
      success: true,
      emergencies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update emergency status
router.put('/emergencies/:id/status', async (req, res) => {
  try {
    const { status, assignedVeterinarian, resolutionNotes } = req.body;
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }
    if (status) {
      emergency.status = status;
      if (status === 'resolved') {
        emergency.responseTime = new Date();
      }
    }
    if (assignedVeterinarian) emergency.assignedVeterinarian = assignedVeterinarian;
    if (resolutionNotes !== undefined) emergency.resolutionNotes = resolutionNotes;
    await emergency.save();
    res.json({ success: true, emergency });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// Training Programs Management (Admin)
// ----------------------

// Get all training programs
router.get('/trainings', async (req, res) => {
  try {
    const { status, program, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (program) query.program = program;
    
    const trainings = await Training.find(query)
      .populate('trainer', 'name email phone')
      .populate('pet')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Training.countDocuments(query);
    
    res.json({
      success: true,
      trainings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update training status
router.put('/trainings/:id/status', async (req, res) => {
  try {
    const { status, sessions } = req.body;
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    if (status) training.status = status;
    if (sessions) training.sessions = sessions;
    await training.save();
    res.json({ success: true, training });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ----------------------
// AI Chat Management (Admin)
// ----------------------

// Get all AI chat sessions
router.get('/ai-chats', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (userId) query.user = userId;
    
    const chats = await AIChat.find(query)
      .populate('user', 'name email phone')
      .populate('petContext.petId')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AIChat.countDocuments(query);
    
    res.json({
      success: true,
      chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single AI chat session
router.get('/ai-chats/:sessionId', async (req, res) => {
  try {
    const chat = await AIChat.findOne({ sessionId: req.params.sessionId })
      .populate('user', 'name email phone')
      .populate('petContext.petId');
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete AI chat session
router.delete('/ai-chats/:sessionId', async (req, res) => {
  try {
    const chat = await AIChat.findOne({ sessionId: req.params.sessionId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    chat.isActive = false;
    await chat.save();
    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get AI chat statistics
router.get('/ai-chats/stats', async (req, res) => {
  try {
    const totalChats = await AIChat.countDocuments({ isActive: true });
    const totalMessages = await AIChat.aggregate([
      { $match: { isActive: true } },
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);
    
    const activeUsers = await AIChat.distinct('user', { isActive: true });
    
    res.json({
      success: true,
      stats: {
        totalChats,
        totalMessages: totalMessages[0]?.total || 0,
        activeUsers: activeUsers.length,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Wishlist Management (Admin)
// ----------------------

// Get all wishlists
router.get('/wishlists', async (req, res) => {
  try {
    const wishlists = await Wishlist.find()
      .populate('user', 'name email phone')
      .populate('product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, wishlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wishlists by user
router.get('/wishlists/user/:userId', async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ user: req.params.userId })
      .populate('product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, wishlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wishlists by product
router.get('/wishlists/product/:productId', async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ product: req.params.productId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, wishlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------
// Wallet Management (Admin)
// ----------------------

// Get all wallets
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await Wallet.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wallet by user
router.get('/wallets/user/:userId', async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.params.userId })
      .populate('user', 'name email phone');
    
    if (!wallet) {
      return res.json({ success: true, wallet: null, balance: 0, transactions: [] });
    }
    
    res.json({
      success: true,
      wallet: {
        _id: wallet._id,
        user: wallet.user,
        balance: wallet.balance,
        transactions: wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wallet statistics
router.get('/wallets/stats', async (req, res) => {
  try {
    const totalWallets = await Wallet.countDocuments();
    const totalBalance = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    const recentTransactions = await Wallet.aggregate([
      { $unwind: '$transactions' },
      { $sort: { 'transactions.createdAt': -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$user._id',
          userName: '$user.name',
          userEmail: '$user.email',
          type: '$transactions.type',
          amount: '$transactions.amount',
          description: '$transactions.description',
          createdAt: '$transactions.createdAt'
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalWallets,
        totalBalance: totalBalance[0]?.total || 0,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


