const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed (Pure JS)...');

  // Clear existing data
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create Super Admin User (Main Admin)
  const superAdminPassword = await bcrypt.hash('Sanim@9944', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'sanim1728@gmail.com',
      password: superAdminPassword,
      name: 'Super Admin',
      phone: '+8801700000000',
      role: 'superadmin',
      isActive: true,
    },
  });
  console.log('✅ Created superadmin user:', superAdmin.email);

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ctgcollection.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+8801712345678',
      role: 'admin',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create Customer Users
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'John Doe',
      phone: '+8801812345678',
      role: 'customer',
    },
  });
  console.log('✅ Created customer user:', customer1.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trending fashion items for men and women',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets and electronic devices',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Beautiful items for your home',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fragrance',
        slug: 'fragrance',
        description: 'Premium fragrance and perfume products',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created categories:', categories.map(c => c.name).join(', '));

  // Create Products with variants
  const products = [];

  // Fashion Products
  const fashionProducts = [
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: 'Comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% premium cotton with excellent breathability.',
      basePrice: 899,
      salePrice: 699,
      images: JSON.stringify(['/images/products/tshirt.png']),
      isFeatured: true,
      isBestseller: true,
      categoryId: categories[0].id,
      variants: {
        create: [
          { sku: 'TSH-NVY-S', size: 'S', color: 'Navy', stock: 50 },
          { sku: 'TSH-NVY-M', size: 'M', color: 'Navy', stock: 75 },
          { sku: 'TSH-NVY-L', size: 'L', color: 'Navy', stock: 60 },
          { sku: 'TSH-NVY-XL', size: 'XL', color: 'Navy', stock: 40 },
        ],
      },
    },
    {
      name: 'Floral Summer Dress',
      slug: 'floral-summer-dress',
      description: 'Elegant floral dress perfect for summer outings. Lightweight and breathable fabric with beautiful floral patterns.',
      basePrice: 2499,
      salePrice: 1999,
      images: JSON.stringify(['/images/products/dress.png']),
      isFeatured: true,
      categoryId: categories[0].id,
      variants: {
        create: [
          { sku: 'DRS-FLR-S', size: 'S', color: 'Floral', stock: 30 },
          { sku: 'DRS-FLR-M', size: 'M', color: 'Floral', stock: 40 },
          { sku: 'DRS-FLR-L', size: 'L', color: 'Floral', stock: 35 },
        ],
      },
    },
    {
      name: 'Classic White Sneakers',
      slug: 'classic-white-sneakers',
      description: 'Versatile white sneakers with blue accents. Comfortable cushioning and durable construction for all-day wear.',
      basePrice: 3499,
      salePrice: 2799,
      images: JSON.stringify(['/images/products/sneakers.png']),
      isBestseller: true,
      categoryId: categories[0].id,
      variants: {
        create: [
          { sku: 'SNK-WHT-39', size: '39', color: 'White/Blue', stock: 25 },
          { sku: 'SNK-WHT-40', size: '40', color: 'White/Blue', stock: 30 },
          { sku: 'SNK-WHT-41', size: '41', color: 'White/Blue', stock: 35 },
          { sku: 'SNK-WHT-42', size: '42', color: 'White/Blue', stock: 30 },
          { sku: 'SNK-WHT-43', size: '43', color: 'White/Blue', stock: 20 },
        ],
      },
    },
    {
      name: 'Leather Backpack',
      slug: 'leather-backpack',
      description: 'Premium black leather backpack with multiple compartments. Perfect for work, travel, or daily use.',
      basePrice: 4999,
      salePrice: 3999,
      images: JSON.stringify(['/images/products/backpack.png']),
      isFeatured: true,
      categoryId: categories[0].id,
      variants: {
        create: [
          { sku: 'BAG-BLK-STD', size: 'Standard', color: 'Black', stock: 45 },
        ],
      },
    },
  ];

  // Electronics Products
  const electronicsProducts = [
    {
      name: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      description: 'Premium wireless headphones with active noise cancellation. 40-hour battery life and superior sound quality.',
      basePrice: 5999,
      salePrice: 4499,
      images: JSON.stringify(['/images/products/headphones.png']),
      isFeatured: true,
      isBestseller: true,
      categoryId: categories[1].id,
      variants: {
        create: [
          { sku: 'HP-BLK-STD', size: 'Standard', color: 'Black', stock: 60 },
        ],
      },
    },
    {
      name: 'Smartphone Pro X',
      slug: 'smartphone-pro-x',
      description: 'Latest flagship smartphone with 6.5" AMOLED display, 128GB storage, and advanced camera system.',
      basePrice: 45999,
      salePrice: 42999,
      images: JSON.stringify(['/images/products/smartphone.png']),
      isFeatured: true,
      categoryId: categories[1].id,
      variants: {
        create: [
          { sku: 'PHN-BLK-128', size: '128GB', color: 'Black', stock: 20 },
          { sku: 'PHN-BLU-128', size: '128GB', color: 'Blue', stock: 15 },
        ],
      },
    },
  ];

  // Home & Living Products
  const homeProducts = [
    {
      name: 'Stainless Steel Coffee Maker',
      slug: 'stainless-steel-coffee-maker',
      description: 'Modern coffee maker with programmable settings. Makes perfect coffee every time with 12-cup capacity.',
      basePrice: 6499,
      salePrice: 5499,
      images: JSON.stringify(['/images/products/coffee.png']),
      isBestseller: true,
      categoryId: categories[2].id,
      variants: {
        create: [
          { sku: 'COF-SS-12', size: '12-Cup', color: 'Stainless Steel', stock: 35 },
        ],
      },
    },
    {
      name: 'Modern Desk Lamp',
      slug: 'modern-desk-lamp',
      description: 'Minimalist desk lamp with adjustable brightness. Energy-efficient LED with touch controls.',
      basePrice: 2499,
      salePrice: 1899,
      images: JSON.stringify(['/images/products/lamp.png']),
      isFeatured: true,
      categoryId: categories[2].id,
      variants: {
        create: [
          { sku: 'LMP-BLK-STD', size: 'Standard', color: 'Black', stock: 50 },
          { sku: 'LMP-WHT-STD', size: 'Standard', color: 'White', stock: 45 },
        ],
      },
    },
  ];

  // Fragrance Products
  const fragranceProducts = [
    {
      name: 'Luxury Skincare Set',
      slug: 'luxury-skincare-set',
      description: 'Complete skincare routine with cleanser, toner, serum, and moisturizer. Premium ingredients for radiant skin.',
      basePrice: 7999,
      salePrice: 6499,
      images: JSON.stringify(['/images/products/skincare.png']),
      isFeatured: true,
      isBestseller: true,
      categoryId: categories[3].id,
      variants: {
        create: [
          { sku: 'SKN-LUX-SET', size: 'Full Set', color: 'Gold', stock: 40 },
        ],
      },
    },
    {
      name: 'Eau de Parfum',
      slug: 'eau-de-parfum',
      description: 'Elegant fragrance with floral and woody notes. Long-lasting scent in a beautiful crystal bottle.',
      basePrice: 5999,
      salePrice: 4999,
      images: JSON.stringify(['/images/products/perfume.png']),
      isFeatured: true,
      categoryId: categories[3].id,
      variants: {
        create: [
          { sku: 'PRF-EDP-50', size: '50ml', color: 'Clear', stock: 55 },
          { sku: 'PRF-EDP-100', size: '100ml', color: 'Clear', stock: 30 },
        ],
      },
    },
  ];

  const allProducts = [
    ...fashionProducts,
    ...electronicsProducts,
    ...homeProducts,
    ...fragranceProducts,
  ];

  for (const productData of allProducts) {
    const product = await prisma.product.create({ data: productData });
    products.push(product);
  }
  console.log('✅ Created products:', products.length);

  // Create additional customer users for reviews
  const reviewer1 = await prisma.user.create({
    data: {
      email: 'fahim.rahman@email.com',
      password: customerPassword,
      name: 'Fahim Rahman',
      phone: '+8801911223344',
      role: 'customer',
    },
  });

  const reviewer2 = await prisma.user.create({
    data: {
      email: 'nasrin.akter@email.com',
      password: customerPassword,
      name: 'Nasrin Akter',
      phone: '+8801722334455',
      role: 'customer',
    },
  });

  const reviewer3 = await prisma.user.create({
    data: {
      email: 'rahim.mia@email.com',
      password: customerPassword,
      name: 'Rahim Mia',
      phone: '+8801833445566',
      role: 'customer',
    },
  });

  const reviewer4 = await prisma.user.create({
    data: {
      email: 'ayesha.begum@email.com',
      password: customerPassword,
      name: 'Ayesha Begum',
      phone: '+8801944556677',
      role: 'customer',
    },
  });

  const reviewer5 = await prisma.user.create({
    data: {
      email: 'kamal.hossain@email.com',
      password: customerPassword,
      name: 'Kamal Hossain',
      phone: '+8801655667788',
      role: 'customer',
    },
  });

  console.log('✅ Created review users');

  // Helper to find product by slug
  const findProduct = (slug) => products.find(p => p.slug === slug);

  // Create demo reviews
  const reviews = [];

  // Reviews for Floral Summer Dress
  const dress = findProduct('floral-summer-dress');
  if (dress) {
    await prisma.review.create({
      data: {
        productId: dress.id,
        userId: reviewer4.id,
        rating: 5,
        comment: 'Beautiful dress! The fabric is very comfortable and the print is exactly as shown. Perfect fit!',
        isApproved: true,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Reviews for Eau de Parfum
  const perfume = findProduct('eau-de-parfum');
  if (perfume) {
    await prisma.review.create({
      data: {
        productId: perfume.id,
        userId: reviewer2.id,
        rating: 5,
        comment: 'Absolutely love this fragrance! Long-lasting and the scent is very elegant. Perfect for special occasions.',
        isApproved: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create Coupons
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        description: 'Welcome discount for new customers',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'SAVE500',
        description: 'Save 500 BDT on orders above 5000',
        discountType: 'fixed',
        discountValue: 500,
        minOrderValue: 5000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created coupons:', coupons.map(c => c.code).join(', '));

  // Create Address for customer
  await prisma.address.create({
    data: {
      userId: customer1.id,
      name: 'John Doe',
      phone: '+8801812345678',
      address: '123 Main Street, Apartment 4B',
      city: 'Chittagong',
      district: 'Chittagong',
      postalCode: '4000',
      isDefault: true,
    },
  });
  console.log('✅ Created customer address');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
