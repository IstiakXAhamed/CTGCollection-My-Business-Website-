// PDF Receipt Generation Service
// Beautiful HTML receipt that can be printed/saved as PDF

import { prisma } from './prisma'
import path from 'path'
import fs from 'fs'

interface OrderWithDetails {
  id: string
  orderNumber: string
  createdAt: Date
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  couponCode?: string | null
  notes?: string | null
  address: {
    name: string
    phone: string
    address: string
    city: string
    district: string
    postalCode?: string | null
  }
  user?: {
    name: string
    email: string
  } | null
  guestEmail?: string | null
  items: {
    quantity: number
    price: number
    product: {
      name: string
      hasWarranty: boolean
      warrantyPeriod?: string | null
    }
    variantInfo?: string | null
  }[]
}

// Generate beautiful receipt HTML
export function generateReceiptHTML(order: OrderWithDetails): string {
  const customerEmail = order.user?.email || order.guestEmail || 'N/A'
  const customerName = order.address.name
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  
  const itemsHTML = order.items.map((item, idx) => {
    const variant = item.variantInfo ? JSON.parse(item.variantInfo) : null
    const variantText = variant ? `${variant.size || ''}${variant.color ? ' / ' + variant.color : ''}` : '-'
    const itemTotal = item.price * item.quantity
    
    return `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: 600; color: #1a1a1a;">${item.product.name}</div>
          ${item.product.hasWarranty ? `
            <div style="display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; margin-top: 6px;">
              <span>🛡️</span>
              <span>${item.product.warrantyPeriod || 'Warranty'}</span>
            </div>
          ` : ''}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">${variantText}</td>
        <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; text-align: center; font-weight: 500;">${item.quantity}</td>
        <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #666;">৳${item.price.toLocaleString()}</td>
        <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #1a1a1a;">৳${itemTotal.toLocaleString()}</td>
      </tr>
    `
  }).join('')

  const warrantyItems = order.items.filter(item => item.product.hasWarranty)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Receipt - ${order.orderNumber} | CTG Collection</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
      color: white;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    }
    .logo {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 8px;
      position: relative;
    }
    .logo span { color: #60a5fa; }
    .tagline { opacity: 0.7; font-size: 14px; }
    .receipt-badge {
      position: absolute;
      top: 40px;
      right: 40px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      border-radius: 12px;
      text-align: right;
    }
    .receipt-badge .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
    .receipt-badge .number { font-size: 20px; font-weight: 700; margin-top: 4px; }
    
    .content { padding: 40px; }
    
    .info-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    .info-card {
      background: #f8fafc;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e2e8f0;
    }
    .info-card h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-card p { margin: 4px 0; color: #1e293b; }
    .info-card .highlight { font-weight: 600; font-size: 15px; }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-paid { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .status-pending { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }
    .items-table th {
      background: #f1f5f9;
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
    }
    .items-table th:first-child { border-radius: 12px 0 0 12px; }
    .items-table th:last-child { border-radius: 0 12px 12px 0; text-align: right; }
    
    .totals-section {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 16px;
      padding: 24px;
      margin-top: 24px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .totals-row:last-child { border: none; }
    .totals-row.total {
      border-top: 2px solid #cbd5e1;
      border-bottom: none;
      padding-top: 16px;
      margin-top: 8px;
    }
    .totals-row.total span {
      font-size: 20px;
      font-weight: 700;
    }
    .totals-row.total .amount {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .discount { color: #10b981; }
    
    .warranty-section {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 2px solid #a7f3d0;
      border-radius: 16px;
      padding: 24px;
      margin-top: 24px;
    }
    .warranty-section h4 {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #047857;
      font-size: 16px;
      margin-bottom: 12px;
    }
    .warranty-section ul { padding-left: 24px; color: #065f46; }
    .warranty-section li { margin: 8px 0; }
    
    .footer {
      background: #f8fafc;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-logo { font-size: 20px; font-weight: 700; color: #1e3a5f; margin-bottom: 8px; }
    .footer p { color: #64748b; font-size: 13px; margin: 4px 0; }
    .footer .contact { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    
    .print-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      gap: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 1000;
    }
    .print-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 50px rgba(59, 130, 246, 0.5);
    }
    
    @media print {
      body { background: white; padding: 0; }
      .receipt-container { box-shadow: none; border-radius: 0; }
      .print-btn { display: none; }
      .header { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    
    @media (max-width: 600px) {
      .info-cards { grid-template-columns: 1fr; }
      .receipt-badge { position: static; margin-top: 20px; text-align: left; }
      .items-table { font-size: 13px; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">CTG <span>Collection</span></div>
      <div class="tagline">Premium Fashion & Lifestyle</div>
      <div class="receipt-badge">
        <div class="label">Order Number</div>
        <div class="number">${order.orderNumber}</div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Info Cards -->
      <div class="info-cards">
        <div class="info-card">
          <h3>📅 Order Details</h3>
          <p class="highlight">${orderDate}</p>
          <p style="margin-top: 12px;">Payment: ${order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}</p>
          <div style="margin-top: 12px;">
            <span class="status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
              ${order.paymentStatus === 'paid' ? '✓ Payment Confirmed' : '⏳ Pending'}
            </span>
          </div>
        </div>
        <div class="info-card">
          <h3>📦 Delivery Address</h3>
          <p class="highlight">${customerName}</p>
          <p>${order.address.phone}</p>
          <p style="margin-top: 8px; color: #64748b; font-size: 14px;">
            ${order.address.address}<br>
            ${order.address.city}, ${order.address.district}${order.address.postalCode ? ' - ' + order.address.postalCode : ''}
          </p>
        </div>
      </div>
      
      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Variant</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div class="totals-section">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>৳${order.subtotal.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>Shipping</span>
          <span>৳${order.shippingCost.toLocaleString()}</span>
        </div>
        ${order.discount > 0 ? `
        <div class="totals-row discount">
          <span>Discount${order.couponCode ? ` (${order.couponCode})` : ''}</span>
          <span>-৳${order.discount.toLocaleString()}</span>
        </div>
        ` : ''}
        <div class="totals-row total">
          <span>Grand Total</span>
          <span class="amount">৳${order.total.toLocaleString()}</span>
        </div>
      </div>
      
      ${warrantyItems.length > 0 ? `
      <!-- Warranty Section -->
      <div class="warranty-section">
        <h4>🛡️ Warranty Coverage</h4>
        <p style="margin-bottom: 12px; font-size: 14px;">The following items include warranty. Keep this receipt as proof of purchase.</p>
        <ul>
          ${warrantyItems.map(item => `
            <li><strong>${item.product.name}</strong> — ${item.product.warrantyPeriod || 'Warranty Included'}</li>
          `).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">CTG Collection</div>
      <p>Thank you for shopping with us!</p>
      <div class="contact">
        <p>📧 ctgcollection2@gmail.com</p>
        <p>This is a computer-generated receipt. No signature required.</p>
      </div>
    </div>
  </div>
  
  <!-- Print/Download Button -->
  <button class="print-btn" onclick="window.print()">
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z"/>
    </svg>
    Download PDF
  </button>
</body>
</html>
  `
}

// Get order with all details for receipt
export async function getOrderForReceipt(orderId: string): Promise<OrderWithDetails | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    }) as any

    if (!order) return null

    return {
      ...order,
      address: {
        name: order.address.name,
        phone: order.address.phone,
        address: order.address.address,
        city: order.address.city,
        district: order.address.district,
        postalCode: order.address.postalCode
      },
      items: order.items.map((item: any) => ({
        quantity: item.quantity,
        price: item.price,
        product: {
          name: item.product.name,
          hasWarranty: item.product.hasWarranty || false,
          warrantyPeriod: item.product.warrantyPeriod || null
        },
        variantInfo: item.variantInfo
      }))
    } as OrderWithDetails
  } catch (error) {
    console.error('Error fetching order for receipt:', error)
    return null
  }
}

// Save receipt HTML to file
export async function saveReceiptToFile(orderId: string): Promise<string | null> {
  const order = await getOrderForReceipt(orderId)
  if (!order) return null

  const html = generateReceiptHTML(order)
  
  // Create receipts directory
  const receiptsDir = path.join(process.cwd(), 'public', 'receipts')
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true })
  }

  const filename = `receipt-${order.orderNumber}.html`
  const filepath = path.join(receiptsDir, filename)
  
  fs.writeFileSync(filepath, html)

  // Update order with receipt URL (use as any to bypass type check until prisma generate)
  try {
    await (prisma.order.update as any)({
      where: { id: orderId },
      data: { receiptUrl: `/receipts/${filename}` }
    })
  } catch (e) {
    // Ignore if field doesn't exist yet
    console.log('Note: receiptUrl field may not be available yet. Run prisma generate.')
  }

  return `/receipts/${filename}`
}

