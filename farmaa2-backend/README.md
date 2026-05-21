# Furmaa Backend API

Backend API for Furmaa - A comprehensive pet-focused ecosystem platform.

## Features

- **E-commerce**: Product management, orders, payments
- **Training**: Pet training programs and sessions
- **Healthcare**: Medical records, vaccinations, vet appointments
- **Service Booking**: Grooming, walking, sitting, boarding services
- **Adoption/Rescue**: Pet adoption and rescue services
- **Emergency Support**: Emergency services for pets
- **Social Engagement**: Social feed, posts, likes, comments
- **Multi-role System**: Users, Service Providers, Veterinarians, Admins

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs for password hashing

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret.

4. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/send-otp` - Send OTP to email or phone
- `POST /api/auth/verify-otp` - Verify OTP and login/register

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Orders

- `POST /api/orders` - Create order (Protected)
- `GET /api/orders/my-orders` - Get user orders (Protected)

### Bookings

- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings/my-bookings` - Get user bookings (Protected)

### Adoption

- `POST /api/adoption` - Create adoption request (Protected)
- `GET /api/adoption` - Get adoption requests

### Emergency

- `POST /api/emergency` - Create emergency request (Protected)
- `GET /api/emergency/active` - Get active emergencies (Protected)

### Social

- `POST /api/social` - Create post (Protected)
- `GET /api/social` - Get all posts
- `PUT /api/social/:id/like` - Like/Unlike post (Protected)

### Admin

- `GET /api/admin/dashboard` - Get dashboard stats (Admin only)

## Environment Variables

See `.env.example` for all required environment variables.

## Database Models

- User
- Pet
- Product
- Order
- Booking
- Adoption
- Emergency
- Training
- Post

