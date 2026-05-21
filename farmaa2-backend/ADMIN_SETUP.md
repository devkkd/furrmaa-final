# Admin Setup Guide

## Admin User Seeding

This guide will help you create an admin user for the Furmaa platform.

### Quick Setup

1. **Run the seed script:**

   ```bash
   npm run seed:admin
   ```

2. **Default Admin Credentials:**
   - Email: `admin@furmaa.com`
   - Phone: `9999999999`
   - Password: `admin123`

### Custom Admin Credentials

You can customize the admin credentials by setting environment variables in your `.env` file:

```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PHONE=9876543210
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin Name
```

Then run:

```bash
npm run seed:admin
```

### Login Methods

Admin can login using:

1. **Email + Password** - Use the email and password set during seeding
2. **Mobile + OTP** - Use the phone number to receive OTP and login

### Admin Features

Once logged in as admin, you can access:

1. **Admin Dashboard** - View statistics and recent orders
2. **Product Management** - Add, edit, and delete products
3. **Order Management** - View all orders, update order status, track orders

### Accessing Admin Panel

1. Login with admin credentials (email/password or mobile/OTP)
2. Navigate to "More" tab (Profile tab)
3. Click on "Admin Panel" card
4. You'll see the Admin Dashboard with:
   - Total Users, Products, Orders
   - Pending Orders count
   - Total Revenue
   - Quick actions to manage products and orders
   - Recent orders list

### Important Notes

- ⚠️ **Change the default password** after first login for security
- Admin role is automatically assigned during seeding
- Admin user is marked as verified and active
- If admin already exists, the script will show existing admin details

### Troubleshooting

**Admin not showing in Profile?**

- Make sure you're logged in with admin credentials
- Check that `user.role === 'admin'` in the database
- Restart the app after login

**Can't access admin routes?**

- Ensure JWT token is being sent in Authorization header
- Check that user role is 'admin' in the token payload
- Verify middleware is working correctly

