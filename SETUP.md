# CTG Collection - Setup & Testing Guide

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `DATABASE_URL` - Already set to SQLite (no change needed)
   - `JWT_SECRET` - Keep default or generate a secure one
   - `SSLCOMMERZ_STORE_ID` & `SSLCOMMERZ_STORE_PASSWORD` - Get from [SSL Commerz Developer Portal](https://developer.sslcommerz.com/)
   - For sandbox testing, use test credentials provided by SSL Commerz

3. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   App will be available at http://localhost:3000

## 🧪 Testing the Application

### Test User Account
After seeding, you can login with:
- **Email**: `admin@ctgcollection.com` or `customer@ctgcollection.com`
- **Password**: `password123`

### Test Flow

1. **Browse Products**
   - Visit `/shop` to see all products
   - Products are pre-seeded with sample data

2. **Add to Cart**
   - Click on any product → "Add to Cart"
   - View cart at `/cart`

3. **Checkout Process**
   - Click "Proceed to Checkout"
   - Fill in shipping information
   - Choose payment method:
     - **Cash on Delivery (COD)** - Instant success
     - **SSL Commerz** - Redirects to payment gateway (sandbox)

4. **SSL Commerz Sandbox Testing**
   - Use test cards provided by SSL Commerz
   - Sandbox URL: https://sandbox.sslcommerz.com

### Test Coupons
Try these in cart:
- `WELCOME10` - 10% discount
- `SAVE500` - ৳500 flat discount

## 📁 Key Features Implemented

✅ User authentication (Register/Login)
✅ Product catalog with categories
✅ Shopping cart with persistence
✅ Checkout flow with address collection
✅ **SSL Commerz Integration** (Init, Success, Fail, Cancel, IPN handlers)
✅ Cash on Delivery support
✅ Order success/failure pages
✅ Coupon system
✅ Premium UI with Tailwind CSS + shadcn/ui
✅ Responsive design
✅ Database seeding

## 🔧 API Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Orders
- `POST /api/orders/create` - Create new order

### Payments (SSL Commerz)
- `POST /api/payment/init` - Initialize payment
- `POST /api/payment/success` - Payment success callback
- `POST /api/payment/fail` - Payment failure callback
- `POST /api/payment/cancel` - Payment cancellation
- `POST /api/payment/ipn` - IPN handler

## ⚠️ Important Notes

1. **SSL Commerz Sandbox**
   - Register at https://developer.sslcommerz.com/
   - Get sandbox credentials
   - Set `SSLCOMMERZ_IS_LIVE="false"` in `.env`

2. **Production Deployment**
   - Switch to PostgreSQL or MySQL for production
   - Set `SSLCOMMERZ_IS_LIVE="true"`
   - Update `NEXT_PUBLIC_APP_URL` to your domain
   - Generate strong `JWT_SECRET`

3. **Database**
   - Currently using SQLite for easy setup
   - Change to PostgreSQL by updating `schema.prisma` and `DATABASE_URL`

## 🐛 Troubleshooting

**Error: Module not found**
```bash
npm install
npx prisma generate
```

**Database errors**
```bash
npx prisma db push --force-reset
npx prisma db seed
```

**Port already in use**
```bash
npm run dev -- -p 3001
```
