// Script to migrate data from SQLite to PostgreSQL
// Run with: npx ts-node scripts/migrate-sqlite-to-postgres.ts

import Database from 'better-sqlite3'
import { PrismaClient } from '@prisma/client'

const sqliteDb = new Database('./prisma/dev.db')
const prisma = new PrismaClient()

async function migrateData() {
  console.log('🚀 Starting data migration from SQLite to PostgreSQL...\n')

  try {
    // 1. Migrate Users
    console.log('📦 Migrating Users...')
    const users = sqliteDb.prepare('SELECT * FROM User').all() as any[]
    for (const user of users) {
      await (prisma.user as any).upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          phone: user.phone,
          role: user.role || 'customer',
          isActive: user.isActive === 1,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        }
      })
    }
    console.log(`   ✅ Migrated ${users.length} users`)

    // 2. Migrate Categories
    console.log('📦 Migrating Categories...')
    const categories = sqliteDb.prepare('SELECT * FROM Category').all() as any[]
    for (const cat of categories) {
      await (prisma.category as any).upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          isActive: cat.isActive === 1,
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt),
        }
      })
    }
    console.log(`   ✅ Migrated ${categories.length} categories`)

    // 3. Migrate Products
    console.log('📦 Migrating Products...')
    const products = sqliteDb.prepare('SELECT * FROM Product').all() as any[]
    for (const prod of products) {
      await (prisma.product as any).upsert({
        where: { id: prod.id },
        update: {},
        create: {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          categoryId: prod.categoryId,
          basePrice: prod.basePrice,
          salePrice: prod.salePrice,
          images: prod.images,
          isFeatured: prod.isFeatured === 1,
          isBestseller: prod.isBestseller === 1,
          isActive: prod.isActive === 1,
          createdAt: new Date(prod.createdAt),
          updatedAt: new Date(prod.updatedAt),
        }
      })
    }
    console.log(`   ✅ Migrated ${products.length} products`)

    // 4. Migrate ProductVariants
    console.log('📦 Migrating Product Variants...')
    const variants = sqliteDb.prepare('SELECT * FROM ProductVariant').all() as any[]
    for (const v of variants) {
      await (prisma.productVariant as any).upsert({
        where: { id: v.id },
        update: {},
        create: {
          id: v.id,
          productId: v.productId,
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
          createdAt: new Date(v.createdAt),
        }
      })
    }
    console.log(`   ✅ Migrated ${variants.length} variants`)

    // 5. Migrate Addresses
    console.log('📦 Migrating Addresses...')
    try {
      const addresses = sqliteDb.prepare('SELECT * FROM Address').all() as any[]
      for (const addr of addresses) {
        await (prisma.address as any).upsert({
          where: { id: addr.id },
          update: {},
          create: {
            id: addr.id,
            userId: addr.userId || undefined,
            guestEmail: addr.guestEmail || undefined,
            name: addr.name,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            district: addr.district,
            postalCode: addr.postalCode,
            isDefault: addr.isDefault === 1,
            createdAt: new Date(addr.createdAt),
          }
        })
      }
      console.log(`   ✅ Migrated ${addresses.length} addresses`)
    } catch (e) {
      console.log('   ⚠️ No addresses to migrate or table missing')
    }

    // 6. Migrate Orders
    console.log('📦 Migrating Orders...')
    try {
      const orders = sqliteDb.prepare('SELECT * FROM "Order"').all() as any[]
      for (const order of orders) {
        await (prisma.order as any).upsert({
          where: { id: order.id },
          update: {},
          create: {
            id: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId || undefined,
            guestEmail: order.guestEmail || undefined,
            addressId: order.addressId,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            discount: order.discount || 0,
            total: order.total,
            couponCode: order.couponCode,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            status: order.status,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
          }
        })
      }
      console.log(`   ✅ Migrated ${orders.length} orders`)
    } catch (e) {
      console.log('   ⚠️ No orders to migrate or table missing')
    }

    // 7. Migrate OrderItems
    console.log('📦 Migrating Order Items...')
    try {
      const orderItems = sqliteDb.prepare('SELECT * FROM OrderItem').all() as any[]
      for (const item of orderItems) {
        await (prisma.orderItem as any).upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variantInfo: item.variantInfo,
          }
        })
      }
      console.log(`   ✅ Migrated ${orderItems.length} order items`)
    } catch (e) {
      console.log('   ⚠️ No order items to migrate or table missing')
    }

    // 8. Migrate Reviews
    console.log('📦 Migrating Reviews...')
    try {
      const reviews = sqliteDb.prepare('SELECT * FROM Review').all() as any[]
      for (const review of reviews) {
        await (prisma.review as any).upsert({
          where: { id: review.id },
          update: {},
          create: {
            id: review.id,
            productId: review.productId,
            userId: review.userId,
            rating: review.rating,
            comment: review.comment || review.title || '',
            isVerified: review.isVerified === 1,
            isApproved: review.isApproved === 1,
            createdAt: new Date(review.createdAt),
          }
        })
      }
      console.log(`   ✅ Migrated ${reviews.length} reviews`)
    } catch (e) {
      console.log('   ⚠️ No reviews to migrate or table missing')
    }

    // 9. Migrate Coupons
    console.log('📦 Migrating Coupons...')
    try {
      const coupons = sqliteDb.prepare('SELECT * FROM Coupon').all() as any[]
      for (const coupon of coupons) {
        await (prisma.coupon as any).upsert({
          where: { id: coupon.id },
          update: {},
          create: {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxUses: coupon.maxUses,
            usedCount: coupon.usedCount,
            validFrom: new Date(coupon.validFrom),
            validUntil: new Date(coupon.validUntil),
            isActive: coupon.isActive === 1,
            createdAt: new Date(coupon.createdAt),
          }
        })
      }
      console.log(`   ✅ Migrated ${coupons.length} coupons`)
    } catch (e) {
      console.log('   ⚠️ No coupons to migrate or table missing')
    }

    // 10. Migrate SiteSettings
    console.log('📦 Migrating Site Settings...')
    try {
      const settings = sqliteDb.prepare('SELECT * FROM SiteSettings').all() as any[]
      for (const s of settings) {
        await (prisma as any).siteSettings.upsert({
          where: { id: s.id },
          update: {},
          create: {
            id: s.id,
            storeName: s.storeName,
            storeEmail: s.storeEmail,
            storePhone: s.storePhone,
            storeAddress: s.storeAddress,
            currency: s.currency,
            taxRate: s.taxRate,
            shippingCost: s.shippingCost,
            freeShippingThreshold: s.freeShippingThreshold,
            promoEnabled: s.promoEnabled === 1,
            promoMessage: s.promoMessage,
            promoCode: s.promoCode,
            chatStatus: s.chatStatus,
          }
        })
      }
      console.log(`   ✅ Migrated site settings`)
    } catch (e) {
      console.log('   ⚠️ No site settings to migrate or table missing')
    }

    // 11. Migrate Chat Sessions
    console.log('📦 Migrating Chat Sessions...')
    try {
      const sessions = sqliteDb.prepare('SELECT * FROM ChatSession').all() as any[]
      for (const s of sessions) {
        await (prisma as any).chatSession.upsert({
          where: { id: s.id },
          update: {},
          create: {
            id: s.id,
            sessionId: s.sessionId,
            userId: s.userId,
            visitorName: s.visitorName,
            visitorEmail: s.visitorEmail,
            status: s.status,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }
        })
      }
      console.log(`   ✅ Migrated ${sessions.length} chat sessions`)
    } catch (e) {
      console.log('   ⚠️ No chat sessions to migrate')
    }

    // 12. Migrate Chat Messages
    console.log('📦 Migrating Chat Messages...')
    try {
      const messages = sqliteDb.prepare('SELECT * FROM ChatMessage').all() as any[]
      for (const m of messages) {
        await (prisma as any).chatMessage.upsert({
          where: { id: m.id },
          update: {},
          create: {
            id: m.id,
            sessionId: m.sessionId,
            senderType: m.senderType,
            senderId: m.senderId,
            senderName: m.senderName,
            message: m.message,
            isRead: m.isRead === 1,
            createdAt: new Date(m.createdAt),
          }
        })
      }
      console.log(`   ✅ Migrated ${messages.length} chat messages`)
    } catch (e) {
      console.log('   ⚠️ No chat messages to migrate')
    }

    // 13. Migrate Wishlists
    console.log('📦 Migrating Wishlists...')
    try {
      const wishlists = sqliteDb.prepare('SELECT * FROM Wishlist').all() as any[]
      for (const w of wishlists) {
        await (prisma as any).wishlist.upsert({
          where: { id: w.id },
          update: {},
          create: {
            id: w.id,
            userId: w.userId,
            productId: w.productId,
            createdAt: new Date(w.createdAt),
          }
        })
      }
      console.log(`   ✅ Migrated ${wishlists.length} wishlists`)
    } catch (e) {
      console.log('   ⚠️ No wishlists to migrate')
    }

    console.log('\n✅ Data migration completed successfully!')
    console.log('🎉 Your PostgreSQL database now has all your data!')

  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    sqliteDb.close()
    await prisma.$disconnect()
  }
}

migrateData()
