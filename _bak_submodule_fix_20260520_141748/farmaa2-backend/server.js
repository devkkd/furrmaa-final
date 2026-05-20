import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { verifyEmailConfig } from './utils/email.service.js';
import firebaseAdmin from './config/firebase.admin.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import trainingRoutes from './routes/training.routes.js';
import healthcareRoutes from './routes/healthcare.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adoptionRoutes from './routes/adoption.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import socialRoutes from './routes/social.routes.js';
import serviceProviderRoutes from './routes/serviceProvider.routes.js';
import veterinarianRoutes from './routes/veterinarian.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cremationRoutes from './routes/cremation.routes.js';
import petEventsRoutes from './routes/petEvents.routes.js';
import hopeRoutes from './routes/hope.routes.js';
import addressRoutes from './routes/address.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import faqRoutes from './routes/faq.routes.js';
import supportRoutes from './routes/support.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import trainingVideoRoutes from './routes/trainingVideo.routes.js';
import trainingProgressRoutes from './routes/trainingProgress.routes.js';
import exploreRoutes from './routes/explore.routes.js';
import aiChatRoutes from './routes/aiChat.routes.js';
import petRoutes from './routes/pet.routes.js';
import reminderRoutes from './routes/reminder.routes.js';
import hopeChatRoutes from './routes/hopeChat.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import vetServiceTypeRoutes from './routes/vetServiceType.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import cartRoutes from './routes/cart.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import categoryRoutes from './routes/category.routes.js';
import sizesRoutes from './routes/sizes.routes.js';
import dietaryRoutes from './routes/dietary.routes.js';
import adminDevAuthRoutes from './controllers/adminlogin.js'

dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*')
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/healthcare', healthcareRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/adoption', adoptionRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/service-providers', serviceProviderRoutes);
app.use('/api/veterinarians', veterinarianRoutes);
app.use('/api/vet-service-types', vetServiceTypeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cremation', cremationRoutes);
app.use('/api/pet-events', petEventsRoutes);
app.use('/api/hope', hopeRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/training-videos', trainingVideoRoutes);
app.use('/api/training-progress', trainingProgressRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/hope/chats', hopeChatRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sizes', sizesRoutes);
app.use('/api/dietary', dietaryRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Furmaa API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Server start failed:', err.message);
  process.exit(1);
});


