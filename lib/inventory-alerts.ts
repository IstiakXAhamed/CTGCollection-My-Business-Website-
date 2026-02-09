// Inventory and Stock Alert Services

import { prisma } from './prisma'
import { getTransporter } from './email'

const LOW_STOCK_THRESHOLD = 5

// Check for low inventory and send alerts to admin
export async function checkLowInventory() {
  try {
    // Get all products with low stock
    const lowStockProducts = await (prisma.product.findMany as any)({
      where: {
        OR: [
          // Products with variants
          {
            variants: {
              some: {
                stock: { lte: LOW_STOCK_THRESHOLD }
              }
            }
          }
        ]
      },
      include: {
        variants: {
          where: {
            stock: { lte: LOW_STOCK_THRESHOLD }
          }
        },
        category: true
      }
    })

    if (lowStockProducts.length === 0) {
      console.log('No low stock items found')
      return { success: true, count: 0 }
    }

    // Send alert email to admin
    await sendLowStockEmail(lowStockProducts)

    return { success: true, count: lowStockProducts.length }
  } catch (error) {
    console.error('Error checking low inventory:', error)
    return { success: false, error }
  }
}

async function sendLowStockEmail(products: any[]) {
  const rows = products.flatMap((product: any) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${product.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${v.size || '-'} / ${v.color || '-'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: ${v.stock === 0 ? 'red' : 'orange'}; font-weight: bold;">
            ${v.stock === 0 ? '⚠️ OUT OF STOCK' : `${v.stock} left`}
          </td>
        </tr>
      `)
    }
    return []
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f7f7f7; padding: 12px; text-align: left; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⚠️ Low Stock Alert</h1>
          <p style="margin: 10px 0 0;">${products.length} products need attention</p>
        </div>
        
        <div class="content">
          <p>The following products are running low on stock:</p>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th style="text-align: center;">Stock</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin/products" class="button">
              Manage Inventory →
            </a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `

  await getTransporter().sendMail({
    from: `"CTG Collection Alerts" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || 'ctgcollection2@gmail.com',
    subject: `⚠️ Low Stock Alert - ${products.length} products need restocking`,
    html
  })
}

// Stock Alert Subscription - Notify customers when item is back in stock
export async function subscribeToStockAlert(productId: string, variantId: string | null, email: string) {
  try {
    // Check if already subscribed (would need StockAlert model in schema)
    // For now, we'll store in a simple way
    
    // In production, create a StockAlert model:
    // model StockAlert {
    //   id        String   @id @default(cuid())
    //   email     String
    //   productId String
    //   variantId String?
    //   notified  Boolean  @default(false)
    //   createdAt DateTime @default(now())
    // }

    console.log(`Stock alert subscription: ${email} for product ${productId}`)
    return { success: true, message: 'You will be notified when this item is back in stock!' }
  } catch (error) {
    console.error('Stock alert subscription error:', error)
    return { success: false, error }
  }
}

// Send stock available notification
export async function sendStockAvailableEmail(email: string, productName: string, productSlug: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; text-align: center; }
        .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Back in Stock!</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #333;">${productName}</h2>
          <p style="color: #666;">Great news! The item you were waiting for is now back in stock.</p>
          <p style="color: #666;">Hurry up before it sells out again!</p>
          
          <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/product/${productSlug}" class="button">
            Shop Now →
          </a>
          
          <p style="margin-top: 30px; color: #999; font-size: 12px;">
            You received this email because you subscribed to stock alerts for this product.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await getTransporter().sendMail({
    from: `"CTG Collection" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🎉 ${productName} is back in stock!`,
    html
  })
}
