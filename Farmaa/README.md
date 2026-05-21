# Furmaa - Pet-Focused Ecosystem Platform

Furmaa is a comprehensive pet-focused ecosystem offering e-commerce, training, healthcare, social engagement, service booking, rescue/adoption, and emergency support for dog and cat owners. The platform connects users, service providers, and veterinarians through a unified mobile and web-based admin system.

## 🚀 Features

### Core Features

- **E-commerce**: Buy pet products (food, toys, accessories, grooming supplies)
- **Training**: Professional pet training programs and sessions
- **Healthcare**: Medical records, vaccination tracking, vet appointments
- **Service Booking**: Book grooming, walking, sitting, boarding services
- **Rescue/Adoption**: Find and adopt pets, rescue services
- **Emergency Support**: 24/7 emergency services for pets
- **Social Engagement**: Social feed, share pet photos, connect with other pet owners

### User Roles

- **Users**: Pet owners who can use all services
- **Service Providers**: Groomers, trainers, walkers, sitters
- **Veterinarians**: Healthcare providers for pets
- **Admins**: Platform administrators

## 📁 Project Structure

```
pets/
├── Farmaa/              # React Native Mobile App
│   ├── android/         # Android native code
│   ├── ios/             # iOS native code
│   ├── src/             # App source code
│   └── package.json
│
└── backend/             # Node.js Backend API
    ├── config/          # Database configuration
    ├── controllers/     # Route controllers
    ├── middleware/      # Auth & other middleware
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    └── server.js        # Entry point
```

## 🛠️ Tech Stack

### Frontend (Mobile)

- React Native 0.82.1
- TypeScript
- React Navigation
- Axios for API calls
- AsyncStorage for local storage

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs for password hashing

## 📦 Installation & Setup

### Prerequisites

- Node.js (>=20)
- MongoDB (local or Atlas)
- React Native development environment
  - Android Studio (for Android)
  - Xcode (for iOS - macOS only)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/furmaa
JWT_SECRET=your_secret_key_here
```

5. Start the server:

```bash
# Development
npm run dev

# Production
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup (React Native)

1. Navigate to Farmaa directory:

```bash
cd Farmaa
```

2. Install dependencies (if not already done):

```bash
npm install
```

3. For iOS (macOS only):

```bash
cd ios
pod install
cd ..
```

4. Start Metro bundler:

```bash
npm start
```

5. Run on device/emulator:

```bash
# Android
npm run android

# iOS
npm run ios
```

## 🔌 API Configuration

Update the API base URL in your React Native app:

```javascript
// src/config/api.js
const API_BASE_URL = "http://localhost:5000/api"; // For development
// For production, use your deployed backend URL
```

## 📱 App Features Implementation

### Authentication

- User registration and login
- JWT token-based authentication
- Profile management

### E-commerce

- Browse products by category
- Product details and reviews
- Shopping cart and checkout
- Order tracking

### Services

- Book services (grooming, training, etc.)
- View service providers
- Manage bookings
- Rate and review services

### Healthcare

- Pet medical records
- Vaccination tracking
- Vet appointments
- Emergency requests

### Social

- Create posts with pet photos
- Like and comment
- Follow other pet owners
- Pet profiles

### Adoption

- Browse available pets
- Submit adoption applications
- Track application status

## 🔐 Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - Email configuration (optional)

## 📝 API Documentation

See `backend/README.md` for detailed API endpoint documentation.

## 🎨 Figma Design Integration

If you have a Figma design file, you can:

1. Share the Figma file link
2. I'll help you implement the exact UI/UX design
3. Create components matching the design specifications

## 🚧 Development Status

- ✅ Backend API structure
- ✅ Database models
- ✅ Authentication system
- ✅ Basic routes for all features
- ⏳ Frontend UI implementation
- ⏳ Figma design integration

## 📄 License

ISC

## 👥 Contributing

This is a private project. For questions or support, contact the development team.

---

**Note**: Make sure MongoDB is running before starting the backend server. For production deployment, use MongoDB Atlas or another cloud MongoDB service.

