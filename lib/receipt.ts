// Receipt Templates System - 20 Unique Professional Designs
// Each template has truly different layouts and structures

import { prisma } from './prisma'
import path from 'path'
import fs from 'fs'

interface OrderData {
  id: string
  orderNumber: string
  verificationCode?: string | null
  createdAt: Date
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  couponCode?: string | null
  address: {
    name: string
    phone: string
    address: string
    city: string
    district: string
    postalCode?: string | null
  }
  user?: { name: string; email: string } | null
  guestEmail?: string | null
  items: {
    quantity: number
    price: number
    product: { name: string; hasWarranty: boolean; warrantyPeriod?: string | null }
    variantInfo?: string | null
  }[]
}

export const RECEIPT_TEMPLATES = {
  '1': { name: 'Classic Professional', description: 'Clean blue business invoice' },
  '2': { name: 'Modern Minimal', description: 'Ultra-clean white design' },
  '3': { name: 'Elegant Cream', description: 'Ivory with gold accents' },
  '4': { name: 'Corporate Bold', description: 'Dark gradient header' },
  '5': { name: 'Soft Luxe', description: 'Pink-purple gradients' },
  '6': { name: 'Dark Luxury', description: 'Black with gold accents' },
  '7': { name: 'Centered Minimal', description: 'Centered clean layout' },
  '8': { name: 'Retro Dotted', description: 'Classic dotted borders' },
  '9': { name: 'Split Invoice', description: 'Professional formal style' },
  '10': { name: 'Monogram', description: 'Large CTG watermark' },
  '11': { name: 'Gradient Banner', description: 'Rainbow gradient header' },
  '12': { name: 'Executive Gray', description: 'Sophisticated gray theme' },
  '13': { name: 'Ocean Blue', description: 'Deep blue professional' },
  '14': { name: 'Rose Elegant', description: 'Soft pink elegant' },
  '15': { name: 'Emerald Pro', description: 'Green professional' },
  '16': { name: 'Purple Reign', description: 'Deep purple elegant' },
  '17': { name: 'Amber Warm', description: 'Warm orange theme' },
  '18': { name: 'Slate Modern', description: 'Cool slate gray' },
  '19': { name: 'Teal Fresh', description: 'Fresh teal modern' },
  '20': { name: 'Signature CTG', description: 'Premium brand signature' },
  '21': { name: 'Premium Minimal', description: 'Clean, elegant, monochrome with warranty focus' }
}


export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Get order data for receipt generation
export async function getOrderForReceipt(orderId: string): Promise<OrderData | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        address: true, 
        user: { select: { name: true, email: true } }, 
        items: { include: { product: true } } 
      }
    }) as any
    
    if (!order) return null

    // Generate verification code if missing
    if (!order.verificationCode) {
      let code = generateVerificationCode()
      for (let i = 0; i < 10; i++) {
        const exists = await prisma.order.findUnique({ where: { verificationCode: code } })
        if (!exists) break
        code = generateVerificationCode()
      }
      await prisma.order.update({ where: { id: orderId }, data: { verificationCode: code } })
      order.verificationCode = code
    }

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
      items: order.items.map((i: any) => ({ 
        quantity: i.quantity, 
        price: i.price, 
        product: { 
          name: i.product.name, 
          hasWarranty: i.product.hasWarranty || false, 
          warrantyPeriod: i.product.warrantyPeriod 
        }, 
        variantInfo: i.variantInfo 
      }))
    }
  } catch (error) {
    console.error('Error getting order for receipt:', error)
    return null
  }
}

// Generate receipt HTML using the SELECTED template from database
export async function generateReceiptHTML(order: OrderData): Promise<string> {
  // Get logo as base64
  let logo: string | undefined
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    if (fs.existsSync(logoPath)) {
      logo = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    }
  } catch {}

  // Get the currently selected template from database
  const templateId = await getCurrentTemplate()
  
  // Generate receipt with selected template
  return generateReceipt(order, templateId, logo)
}


// Helper functions
const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })
const formatTime = (date: Date) => new Date(date).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })

const getVariant = (variantInfo: string | null | undefined) => {
  if (!variantInfo) return '-'
  try {
    const v = JSON.parse(variantInfo)
    return `${v.size || ''}${v.color ? ' / ' + v.color : ''}` || '-'
  } catch { return '-' }
}

// Common print button
const printBtn = (color: string) => `
  <button onclick="window.print()" style="position:fixed;bottom:24px;right:24px;background:${color};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:inherit;display:flex;align-items:center;gap:8px;">📄 Download Receipt</button>
`

// Common print styles
const printStyles = `
  @media print { 
    body { padding: 0 !important; background: white !important; } 
    .receipt { box-shadow: none !important; } 
    button { display: none !important; }
  }
`

// Template 1: Classic Professional - Clean business invoice
const template1 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8f9fa;padding:30px;color:#333}
.receipt{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 2px 15px rgba(0,0,0,0.08)}
.header{padding:40px;border-bottom:3px solid #1a365d}
.header-content{display:flex;justify-content:space-between;align-items:flex-start}
.brand{display:flex;align-items:center;gap:12px}
.brand h1{font-size:24px;color:#1a365d}
.brand p{color:#666;font-size:12px}
.invoice-box{text-align:right}
.invoice-box h2{color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase}
.invoice-box .num{font-size:20px;font-weight:700;color:#1a365d}
.invoice-box .date{color:#666;font-size:13px;margin-top:4px}
.body{padding:40px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:30px}
.box h4{font-size:11px;text-transform:uppercase;color:#999;letter-spacing:1px;margin-bottom:8px}
.box p{margin:3px 0;font-size:14px}
.box .name{font-weight:600}
table{width:100%;border-collapse:collapse}
th{background:#f8f9fa;padding:12px;text-align:left;font-size:11px;text-transform:uppercase;color:#666;font-weight:600}
td{padding:14px 12px;border-bottom:1px solid #eee}
.totals{margin-top:24px;background:#f8f9fa;padding:24px;border-radius:4px}
.total-row{display:flex;justify-content:space-between;padding:6px 0}
.total-row.grand{font-size:20px;font-weight:700;border-top:2px solid #1a365d;padding-top:16px;margin-top:10px}
.payment{margin-top:20px;padding:16px;border:1px solid #e2e8f0;border-radius:4px;display:flex;justify-content:space-between;align-items:center}
.status{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600}
.paid{background:#dcfce7;color:#166534}
.pending{background:#fef3c7;color:#92400e}
.warranty{margin-top:16px;padding:16px;background:#f0fdf4;border-left:4px solid #22c55e;border-radius:4px}
.warranty h4{color:#166534;font-size:13px;margin-bottom:8px}
.warranty ul{padding-left:20px;color:#166534;font-size:13px}
.verify{margin-top:20px;padding:14px;background:#f1f5f9;border-radius:6px;display:flex;justify-content:space-between;align-items:center}
.verify-code{font-family:monospace;font-size:18px;font-weight:700;letter-spacing:3px;color:#1a365d}
.footer{padding:24px 40px;background:#1a365d;color:#fff;text-align:center}
.footer p{font-size:12px;opacity:0.8}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="header-content">
      <div class="brand">
        ${logo ? `<img src="${logo}" style="height:48px;border-radius:8px">` : '<div style="width:48px;height:48px;background:#1a365d;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px">C</div>'}
        <div><h1>CTG Collection</h1><p>Premium Fashion & Lifestyle</p></div>
      </div>
      <div class="invoice-box">
        <h2>Invoice</h2>
        <div class="num">${o.orderNumber}</div>
        <div class="date">${formatDate(o.createdAt)}</div>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="row">
      <div class="box"><h4>Bill To</h4><p class="name">${o.address.name}</p><p>${o.user?.email || o.guestEmail || ''}</p><p>${o.address.phone}</p></div>
      <div class="box"><h4>Ship To</h4><p class="name">${o.address.name}</p><p>${o.address.address}</p><p>${o.address.city}, ${o.address.district}</p></div>
    </div>
    <table><thead><tr><th>Item</th><th>Variant</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>
      ${o.items.map(i => `<tr><td><strong>${i.product.name}</strong>${i.product.hasWarranty ? '<br><span style="font-size:11px;color:#16a34a">🛡️ '+( i.product.warrantyPeriod||'Warranty')+'</span>' : ''}</td><td>${getVariant(i.variantInfo)}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">৳${i.price.toLocaleString()}</td><td style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
    </tbody></table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row" style="color:#16a34a"><span>Discount${o.couponCode?' ('+o.couponCode+')':''}</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
    <div class="payment"><div><strong>Payment:</strong> ${o.paymentMethod==='cod'?'Cash on Delivery':'Online Payment'}</div><span class="status ${o.paymentStatus==='paid'?'paid':'pending'}">${o.paymentStatus==='paid'?'✓ Paid':'Pending'}</span></div>
    ${o.items.filter(i=>i.product.hasWarranty).length>0?`<div class="warranty"><h4>🛡️ Warranty Coverage</h4><ul>${o.items.filter(i=>i.product.hasWarranty).map(i=>`<li>${i.product.name} - ${i.product.warrantyPeriod||'Warranty'}</li>`).join('')}</ul></div>`:''}
    ${o.verificationCode?`<div class="verify"><span style="font-size:12px;color:#666">Verification Code</span><span class="verify-code">${o.verificationCode}</span></div>`:''}
  </div>
  <div class="footer"><p>Thank you for shopping with CTG Collection! • ctgcollection2@gmail.com</p></div>
</div>
${printBtn('#1a365d')}
</body></html>`

// Template 2: Modern Minimal - Ultra clean
const template2 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#fff;padding:60px;color:#111}
.receipt{max-width:700px;margin:0 auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:40px;border-bottom:1px solid #eee}
.brand h1{font-size:18px;font-weight:400;letter-spacing:2px}
.invoice-info{text-align:right;font-size:13px;color:#888}
.invoice-info .num{font-size:14px;color:#111;font-weight:500;margin-top:4px}
.section{padding:40px 0;border-bottom:1px solid #eee}
.section-title{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:16px}
.info-row{display:flex;gap:80px}
.info-col p{margin:2px 0;font-size:14px;font-weight:300}
.info-col .name{font-weight:500}
.items{padding:40px 0;border-bottom:1px solid #eee}
.item{display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f5f5f5}
.item:last-child{border:none}
.item-name{font-weight:500;font-size:14px}
.item-details{font-size:12px;color:#888;margin-top:2px}
.item-price{font-weight:500;text-align:right}
.totals{padding:30px 0;display:flex;flex-direction:column;align-items:flex-end}
.total-row{display:flex;justify-content:space-between;width:200px;padding:6px 0;font-size:14px}
.total-row.grand{font-size:18px;font-weight:600;border-top:1px solid #111;padding-top:14px;margin-top:8px}
.meta{display:flex;justify-content:space-between;align-items:center;padding:20px 0;font-size:13px;color:#666}
.verify-code{font-family:monospace;font-size:16px;font-weight:500;letter-spacing:2px;color:#111}
.footer{text-align:center;padding-top:40px;font-size:11px;color:#999}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="brand"><h1>CTG COLLECTION</h1></div>
    <div class="invoice-info"><div>Invoice</div><div class="num">${o.orderNumber}</div><div style="margin-top:8px">${formatDate(o.createdAt)}</div></div>
  </div>
  <div class="section">
    <div class="section-title">Billing & Shipping</div>
    <div class="info-row">
      <div class="info-col"><p class="name">${o.address.name}</p><p>${o.address.phone}</p><p>${o.user?.email||o.guestEmail||''}</p></div>
      <div class="info-col"><p>${o.address.address}</p><p>${o.address.city}, ${o.address.district}</p></div>
    </div>
  </div>
  <div class="items">
    <div class="section-title">Items</div>
    ${o.items.map(i => `<div class="item"><div><div class="item-name">${i.product.name}</div><div class="item-details">${getVariant(i.variantInfo)} • Qty: ${i.quantity}${i.product.hasWarranty?' • 🛡️ '+( i.product.warrantyPeriod||'Warranty'):''}</div></div><div class="item-price">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}
  </div>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
    <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
    ${o.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
    <div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div>
  </div>
  <div class="meta">
    <div>${o.paymentMethod==='cod'?'Cash on Delivery':'Online Payment'} • ${o.paymentStatus==='paid'?'Paid':'Pending'}</div>
    ${o.verificationCode?`<div class="verify-code">${o.verificationCode}</div>`:''}
  </div>
  <div class="footer">CTG Collection • ctgcollection2@gmail.com</div>
</div>
${printBtn('#111')}
</body></html>`

// Template 3: Elegant Cream - Warm ivory with gold accents
const template3 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8f5f0;padding:40px;color:#3d3425}
.receipt{max-width:750px;margin:0 auto;background:#fffef9;border:1px solid #e8e0d0;box-shadow:0 4px 20px rgba(0,0,0,0.06)}
.header{padding:40px;text-align:center;border-bottom:2px solid #c9a959}
.brand h1{font-family:'Playfair Display',serif;font-size:32px;color:#5c4a2a;font-weight:500}
.brand p{color:#a08060;font-size:12px;letter-spacing:2px;margin-top:4px}
.invoice-num{display:inline-block;margin-top:20px;padding:8px 24px;border:1px solid #c9a959;color:#c9a959;font-size:12px;letter-spacing:1px}
.body{padding:40px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:40px}
.info-card{padding:20px;background:#fdf9f0;border-radius:4px}
.info-card h4{font-family:'Playfair Display',serif;font-size:14px;color:#5c4a2a;margin-bottom:10px}
.info-card p{font-size:13px;margin:3px 0;color:#666}
.items{border:1px solid #e8e0d0}
.item-header{display:grid;grid-template-columns:2fr 1fr 0.5fr 1fr 1fr;background:#f8f5f0;padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999}
.item-row{display:grid;grid-template-columns:2fr 1fr 0.5fr 1fr 1fr;padding:16px;border-bottom:1px solid #f0ebe0;align-items:center}
.item-row:last-child{border:none}
.item-name{font-weight:500}
.warranty-badge{display:inline-block;font-size:10px;background:#f0fdf4;color:#166534;padding:2px 8px;border-radius:10px;margin-top:4px}
.totals{margin-top:30px;padding:24px;background:#5c4a2a;color:#fff;border-radius:4px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;opacity:0.9}
.total-row.grand{font-size:22px;font-weight:600;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:16px;margin-top:10px}
.verify{margin-top:20px;padding:16px;border:2px dashed #c9a959;text-align:center;border-radius:4px}
.verify-label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px}
.verify-code{font-family:monospace;font-size:24px;font-weight:600;letter-spacing:4px;color:#c9a959;margin-top:6px}
.footer{padding:30px;text-align:center;border-top:1px solid #e8e0d0}
.footer p{font-family:'Playfair Display',serif;font-size:14px;color:#5c4a2a}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${logo ? `<img src="${logo}" style="height:50px;margin-bottom:12px">` : ''}
    <div class="brand"><h1>CTG Collection</h1><p>PREMIUM FASHION</p></div>
    <div class="invoice-num">INVOICE ${o.orderNumber}</div>
    <div style="margin-top:12px;font-size:13px;color:#888">${formatDate(o.createdAt)}</div>
  </div>
  <div class="body">
    <div class="info-grid">
      <div class="info-card"><h4>Customer Details</h4><p><strong>${o.address.name}</strong></p><p>${o.user?.email||o.guestEmail||''}</p><p>${o.address.phone}</p></div>
      <div class="info-card"><h4>Delivery Address</h4><p><strong>${o.address.name}</strong></p><p>${o.address.address}</p><p>${o.address.city}, ${o.address.district}</p></div>
    </div>
    <div class="items">
      <div class="item-header"><span>Product</span><span>Variant</span><span style="text-align:center">Qty</span><span style="text-align:right">Price</span><span style="text-align:right">Total</span></div>
      ${o.items.map(i => `<div class="item-row"><div><div class="item-name">${i.product.name}</div>${i.product.hasWarranty?'<div class="warranty-badge">🛡️ '+(i.product.warrantyPeriod||'Warranty')+'</div>':''}</div><div>${getVariant(i.variantInfo)}</div><div style="text-align:center">${i.quantity}</div><div style="text-align:right">৳${i.price.toLocaleString()}</div><div style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row grand"><span>Grand Total</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
    ${o.verificationCode?`<div class="verify"><div class="verify-label">Verification Code</div><div class="verify-code">${o.verificationCode}</div></div>`:''}
  </div>
  <div class="footer"><p>Thank you for choosing CTG Collection</p></div>
</div>
${printBtn('#c9a959')}
</body></html>`

// Template 4: Corporate Bold - Strong header
const template4 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#e8f0fe;padding:30px;color:#333}
.receipt{max-width:800px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
.header{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:0}
.header-top{padding:30px 40px;display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:12px}
.brand h1{font-size:22px;font-weight:700}
.invoice-badge{background:rgba(255,255,255,0.2);padding:8px 20px;border-radius:4px;font-weight:600}
.header-info{display:grid;grid-template-columns:repeat(4,1fr);background:rgba(0,0,0,0.1);padding:16px 40px}
.header-info div{font-size:12px}
.header-info strong{display:block;font-size:14px;margin-top:4px}
.body{padding:40px}
.info-boxes{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
.info-box{border:1px solid #e5e7eb;padding:20px;border-radius:8px}
.info-box h4{font-size:11px;text-transform:uppercase;color:#1e40af;letter-spacing:1px;margin-bottom:10px;border-bottom:2px solid #1e40af;padding-bottom:6px;display:inline-block}
.info-box p{margin:3px 0;font-size:13px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#1e40af;color:#fff;padding:12px;text-align:left;font-size:11px;text-transform:uppercase}
td{padding:14px 12px;border-bottom:1px solid #e5e7eb}
.totals{background:#f8fafc;padding:20px;border-radius:8px}
.total-row{display:flex;justify-content:space-between;padding:6px 0}
.total-row.grand{font-size:20px;font-weight:700;color:#1e40af;border-top:2px solid #1e40af;padding-top:12px;margin-top:8px}
.footer-info{display:flex;justify-content:space-between;margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb}
.payment-status{padding:8px 16px;border-radius:4px;font-size:12px;font-weight:600}
.paid{background:#16a34a;color:#fff}
.pending{background:#f59e0b;color:#fff}
.verify-code{font-family:monospace;font-size:18px;font-weight:700;letter-spacing:3px;color:#1e40af}
.footer{background:#1e40af;color:#fff;padding:20px 40px;text-align:center;font-size:13px}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="header-top">
      <div class="brand">${logo ? `<img src="${logo}" style="height:40px;border-radius:6px">` : ''}<h1>CTG Collection</h1></div>
      <div class="invoice-badge">INVOICE</div>
    </div>
    <div class="header-info">
      <div>Invoice No.<strong>${o.orderNumber}</strong></div>
      <div>Date<strong>${formatDate(o.createdAt)}</strong></div>
      <div>Status<strong>${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</strong></div>
      <div>Payment<strong>${o.paymentStatus==='paid'?'PAID':'PENDING'}</strong></div>
    </div>
  </div>
  <div class="body">
    <div class="info-boxes">
      <div class="info-box"><h4>Bill To</h4><p><strong>${o.address.name}</strong></p><p>${o.user?.email||o.guestEmail||''}</p><p>${o.address.phone}</p></div>
      <div class="info-box"><h4>Ship To</h4><p><strong>${o.address.name}</strong></p><p>${o.address.address}</p><p>${o.address.city}, ${o.address.district}</p></div>
    </div>
    <table><thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>
      ${o.items.map(i => `<tr><td><strong>${i.product.name}</strong>${i.product.hasWarranty?'<br><span style="color:#16a34a;font-size:11px">🛡️ '+(i.product.warrantyPeriod||'Warranty')+'</span>':''}</td><td>${getVariant(i.variantInfo)}</td><td>${i.quantity}</td><td style="text-align:right">৳${i.price.toLocaleString()}</td><td style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
    </tbody></table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row" style="color:#16a34a"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row grand"><span>Total Due</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
    <div class="footer-info">
      <div><strong>Payment:</strong> ${o.paymentMethod==='cod'?'Cash on Delivery':'Online Payment'} <span class="payment-status ${o.paymentStatus==='paid'?'paid':'pending'}">${o.paymentStatus==='paid'?'PAID':'PENDING'}</span></div>
      ${o.verificationCode?`<div><strong>Verify:</strong> <span class="verify-code">${o.verificationCode}</span></div>`:''}
    </div>
  </div>
  <div class="footer">CTG Collection • Thank you for your business!</div>
</div>
${printBtn('#1e40af')}
</body></html>`

// Template 5: Soft Luxe - Gentle gradients
const template5 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#fdf2f8,#faf5ff);padding:40px;color:#333}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:24px;box-shadow:0 10px 40px rgba(0,0,0,0.08);overflow:hidden}
.header{background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;padding:40px;text-align:center}
.brand h1{font-size:24px;font-weight:600}
.brand p{opacity:0.8;font-size:12px;margin-top:4px}
.invoice-num{display:inline-block;margin-top:16px;padding:8px 20px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:13px}
.body{padding:40px}
.info-pills{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:30px}
.pill{flex:1;min-width:200px;padding:16px 20px;background:linear-gradient(135deg,#fdf2f8,#faf5ff);border-radius:12px}
.pill-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;margin-bottom:6px}
.pill-value{font-size:14px;font-weight:500}
.items{margin-bottom:24px}
.item{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#fafafa;border-radius:12px;margin-bottom:8px}
.item-left{display:flex;align-items:center;gap:12px}
.item-icon{width:40px;height:40px;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px}
.item-name{font-weight:500}
.item-meta{font-size:12px;color:#888}
.item-price{font-weight:600;font-size:15px}
.totals{background:linear-gradient(135deg,#1f2937,#374151);color:#fff;padding:24px;border-radius:16px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.8}
.total-row.grand{font-size:20px;font-weight:600;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:14px;margin-top:8px}
.verify{margin-top:20px;text-align:center;padding:16px;background:#faf5ff;border-radius:12px}
.verify-code{font-family:monospace;font-size:20px;font-weight:600;letter-spacing:3px;background:linear-gradient(135deg,#ec4899,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.footer{text-align:center;padding:24px;font-size:12px;color:#888}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${logo ? `<img src="${logo}" style="height:50px;margin-bottom:12px;border-radius:12px">` : ''}
    <div class="brand"><h1>CTG Collection</h1><p>Premium Fashion & Lifestyle</p></div>
    <div class="invoice-num">${o.orderNumber} • ${formatDate(o.createdAt)}</div>
  </div>
  <div class="body">
    <div class="info-pills">
      <div class="pill"><div class="pill-label">Customer</div><div class="pill-value">${o.address.name}<br><span style="font-size:12px;color:#888">${o.address.phone}</span></div></div>
      <div class="pill"><div class="pill-label">Delivery</div><div class="pill-value">${o.address.city}<br><span style="font-size:12px;color:#888">${o.address.district}</span></div></div>
      <div class="pill"><div class="pill-label">Payment</div><div class="pill-value">${o.paymentMethod==='cod'?'COD':'Online'}<br><span style="font-size:12px;color:${o.paymentStatus==='paid'?'#16a34a':'#f59e0b'}">${o.paymentStatus==='paid'?'✓ Paid':'Pending'}</span></div></div>
    </div>
    <div class="items">
      ${o.items.map(i => `<div class="item"><div class="item-left"><div class="item-icon">📦</div><div><div class="item-name">${i.product.name}</div><div class="item-meta">${getVariant(i.variantInfo)} × ${i.quantity}${i.product.hasWarranty?' • 🛡️':''}</div></div></div><div class="item-price">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
    ${o.verificationCode?`<div class="verify"><div style="font-size:11px;color:#888;margin-bottom:4px">VERIFICATION</div><div class="verify-code">${o.verificationCode}</div></div>`:''}
  </div>
  <div class="footer">Thank you for shopping! ❤️</div>
</div>
${printBtn('#8b5cf6')}
</body></html>`


// Template 6: Dark Luxury - Black with gold accents
const template6 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0a;padding:40px;color:#fff}
.receipt{max-width:700px;margin:0 auto;background:#111;border:1px solid #333;overflow:hidden}
.gold-line{height:3px;background:linear-gradient(90deg,#0a0a0a,#d4af37,#0a0a0a)}
.header{padding:40px;text-align:center;background:#0a0a0a;border-bottom:1px solid #222}
.header h1{font-family:'Playfair Display',serif;font-size:32px;color:#d4af37;letter-spacing:3px}
.header p{color:#666;font-size:11px;margin-top:6px;letter-spacing:2px}
.invoice-badge{display:inline-block;margin-top:20px;padding:10px 30px;border:1px solid #d4af37;color:#d4af37;font-size:12px;letter-spacing:1px}
.body{padding:40px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:36px}
.info-box{padding:20px;border:1px solid #222;background:#0a0a0a}
.info-box h4{color:#d4af37;font-size:10px;letter-spacing:2px;margin-bottom:10px}
.info-box p{color:#888;font-size:13px;line-height:1.8}
.items{margin-bottom:30px}
.item{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid #222}
.item:first-child{border-top:1px solid #222}
.item-name{font-weight:500;color:#fff}
.item-meta{color:#666;font-size:12px;margin-top:4px}
.item-price{color:#d4af37;font-weight:600;font-size:16px}
.totals{background:#0a0a0a;border:1px solid #222;padding:24px}
.total-row{display:flex;justify-content:space-between;padding:8px 0;color:#888}
.total-row.grand{color:#d4af37;font-size:20px;font-family:'Playfair Display',serif;border-top:1px solid #333;padding-top:16px;margin-top:10px}
.verify{margin-top:24px;text-align:center;padding:16px;border:1px solid #333}
.verify-code{font-family:monospace;font-size:24px;letter-spacing:6px;color:#d4af37}
.footer{padding:24px;text-align:center;background:#0a0a0a;color:#444;font-size:11px;letter-spacing:1px}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="gold-line"></div>
  <div class="header">
    ${logo ? `<img src="${logo}" style="height:50px;margin-bottom:16px;border-radius:8px">` : ''}
    <h1>CTG COLLECTION</h1>
    <p>PREMIUM FASHION & LIFESTYLE</p>
    <div class="invoice-badge">${o.orderNumber} • ${formatDate(o.createdAt)}</div>
  </div>
  <div class="body">
    <div class="info-grid">
      <div class="info-box"><h4>CUSTOMER</h4><p><strong style="color:#fff">${o.address.name}</strong><br>${o.address.phone}<br>${o.user?.email || ''}</p></div>
      <div class="info-box"><h4>DELIVERY</h4><p>${o.address.address}<br>${o.address.city}, ${o.address.district}</p></div>
    </div>
    <div class="items">
      ${o.items.map(i => `<div class="item"><div><div class="item-name">${i.product.name}${i.product.hasWarranty?' <span style="color:#d4af37">✦</span>':''}</div><div class="item-meta">${getVariant(i.variantInfo)} × ${i.quantity}</div></div><div class="item-price">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
    ${o.verificationCode?`<div class="verify"><div style="color:#666;font-size:10px;letter-spacing:2px;margin-bottom:8px">VERIFICATION</div><div class="verify-code">${o.verificationCode}</div></div>`:''}
  </div>
  <div class="gold-line"></div>
  <div class="footer">THANK YOU FOR YOUR PURCHASE</div>
</div>
${printBtn('#d4af37')}
</body></html>`

// Template 7: Centered Minimal - Ultra clean centered layout
const template7 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:#fafafa;padding:40px;color:#111}
.receipt{max-width:600px;margin:0 auto;background:#fff;padding:60px 50px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.header{text-align:center;margin-bottom:50px}
.header h1{font-size:18px;font-weight:600;letter-spacing:4px;margin-bottom:4px}
.header p{color:#999;font-size:11px}
.divider{height:1px;background:#eee;margin:30px 0}
.invoice-num{text-align:center;font-size:11px;color:#666;margin-bottom:40px}
.invoice-num span{display:block;font-size:20px;font-weight:500;color:#111;margin-top:4px}
.section{margin-bottom:36px}
.section-title{font-size:9px;letter-spacing:2px;color:#999;margin-bottom:16px;text-transform:uppercase}
.info-centered{text-align:center;line-height:1.8}
.items-list{border-top:1px solid #eee;border-bottom:1px solid #eee;padding:20px 0}
.item{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #f0f0f0}
.item:last-child{border-bottom:none}
.item-name{font-weight:500}
.item-details{color:#888;font-size:12px}
.totals{padding-top:20px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;color:#666;font-size:14px}
.total-row.grand{font-size:18px;color:#111;font-weight:600;margin-top:10px;padding-top:16px;border-top:1px solid #eee}
.verify-section{text-align:center;margin-top:30px;padding:20px;background:#fafafa}
.verify-code{font-family:monospace;font-size:22px;letter-spacing:4px;font-weight:600}
.footer{text-align:center;margin-top:40px;font-size:12px;color:#999}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    ${logo ? `<img src="${logo}" style="height:40px;margin-bottom:16px">` : ''}
    <h1>CTG COLLECTION</h1>
    <p>Premium Fashion</p>
  </div>
  <div class="invoice-num">Invoice<span>${o.orderNumber}</span>${formatDate(o.createdAt)}</div>
  <div class="section">
    <div class="section-title">Customer</div>
    <div class="info-centered"><strong>${o.address.name}</strong><br>${o.address.phone}</div>
  </div>
  <div class="section">
    <div class="section-title">Delivery</div>
    <div class="info-centered">${o.address.address}<br>${o.address.city}, ${o.address.district}</div>
  </div>
  <div class="items-list">
    ${o.items.map(i => `<div class="item"><div><div class="item-name">${i.product.name}</div><div class="item-details">${getVariant(i.variantInfo)} × ${i.quantity}</div></div><div>৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}
  </div>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
    <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
    ${o.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
    <div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div>
  </div>
  ${o.verificationCode?`<div class="verify-section"><div style="color:#999;font-size:9px;letter-spacing:2px;margin-bottom:8px">VERIFICATION CODE</div><div class="verify-code">${o.verificationCode}</div></div>`:''}
  <div class="footer">Thank you for shopping with us</div>
</div>
${printBtn('#111')}
</body></html>`

// Template 8: Retro Dotted - Classic dotted line separators
const template8 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#fef7e9;padding:40px;color:#3d2914}
.receipt{max-width:650px;margin:0 auto;background:#fffdf8;border:3px double #d4a373;padding:8px}
.inner{border:1px solid #e6d5b8;padding:30px}
.header{text-align:center;padding-bottom:24px;border-bottom:2px dotted #d4a373}
.header h1{font-family:'Courier Prime',monospace;font-size:28px;letter-spacing:2px}
.header p{color:#8b7355;font-size:12px;margin-top:4px}
.dotted{border-top:2px dotted #d4a373;margin:20px 0}
.info-section{display:flex;justify-content:space-between;padding:16px 0}
.info-block h4{font-family:'Courier Prime',monospace;font-size:11px;color:#8b7355;margin-bottom:6px}
.info-block p{font-size:13px}
.invoice-center{text-align:center;padding:16px 0}
.invoice-center .num{font-family:'Courier Prime',monospace;font-size:18px;font-weight:700}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{font-family:'Courier Prime',monospace;font-size:11px;text-align:left;padding:10px 0;border-bottom:2px dotted #d4a373}
td{padding:12px 0;border-bottom:1px dotted #e6d5b8;font-size:13px}
.totals{text-align:right;padding-top:16px}
.total-row{font-size:14px;padding:6px 0}
.total-row.grand{font-family:'Courier Prime',monospace;font-size:22px;font-weight:700;border-top:2px dotted #d4a373;padding-top:12px;margin-top:8px}
.verify{text-align:center;padding:16px;margin-top:16px;border:1px dashed #d4a373;background:#fef7e9}
.verify-code{font-family:'Courier Prime',monospace;font-size:20px;letter-spacing:4px}
.footer{text-align:center;padding-top:20px;color:#8b7355;font-size:12px;font-style:italic}
${printStyles}
</style></head><body>
<div class="receipt"><div class="inner">
  <div class="header">
    ${logo ? `<img src="${logo}" style="height:45px;margin-bottom:12px">` : ''}
    <h1>CTG COLLECTION</h1>
    <p>Premium Fashion & Lifestyle</p>
  </div>
  <div class="dotted"></div>
  <div class="invoice-center"><div style="font-size:11px;color:#8b7355">INVOICE</div><div class="num">${o.orderNumber}</div><div style="font-size:12px;color:#8b7355">${formatDate(o.createdAt)}</div></div>
  <div class="dotted"></div>
  <div class="info-section">
    <div class="info-block"><h4>BILL TO:</h4><p>${o.address.name}<br>${o.address.phone}</p></div>
    <div class="info-block" style="text-align:right"><h4>SHIP TO:</h4><p>${o.address.city}<br>${o.address.district}</p></div>
  </div>
  <table><thead><tr><th>ITEM</th><th>QTY</th><th style="text-align:right">AMOUNT</th></tr></thead><tbody>
    ${o.items.map(i => `<tr><td>${i.product.name}<br><span style="color:#8b7355;font-size:11px">${getVariant(i.variantInfo)}</span></td><td>${i.quantity}</td><td style="text-align:right">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
  </tbody></table>
  <div class="totals">
    <div class="total-row">Subtotal: ৳${o.subtotal.toLocaleString()}</div>
    <div class="total-row">Shipping: ৳${o.shippingCost.toLocaleString()}</div>
    ${o.discount > 0 ? `<div class="total-row">Discount: -৳${o.discount.toLocaleString()}</div>` : ''}
    <div class="total-row grand">TOTAL: ৳${o.total.toLocaleString()}</div>
  </div>
  ${o.verificationCode?`<div class="verify"><div style="font-size:10px;color:#8b7355;margin-bottom:6px">VERIFICATION CODE</div><div class="verify-code">${o.verificationCode}</div></div>`:''}
  <div class="footer">~ Thank you for your patronage ~</div>
</div></div>
${printBtn('#d4a373')}
</body></html>`

// Template 9: Split Invoice - Formal business style
const template9 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f0f4f8;padding:40px;color:#1e293b}
.receipt{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding:40px;border-bottom:1px solid #e2e8f0}
.brand h1{font-size:22px;font-weight:700;color:#0f172a}
.brand p{color:#64748b;font-size:11px;margin-top:2px}
.invoice-box{text-align:right}
.invoice-box .label{font-size:10px;color:#94a3b8;letter-spacing:1px}
.invoice-box .number{font-size:24px;font-weight:700;color:#0f172a;margin-top:4px}
.invoice-box .date{font-size:12px;color:#64748b;margin-top:4px}
.body{padding:40px}
.address-row{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-bottom:36px}
.address-box h4{font-size:10px;color:#94a3b8;letter-spacing:1px;margin-bottom:8px}
.address-box p{font-size:14px;line-height:1.7}
.table-header{display:grid;grid-template-columns:3fr 1fr 1fr 1fr;background:#f8fafc;padding:14px 20px;font-size:10px;font-weight:600;color:#64748b;letter-spacing:1px;border-radius:8px 8px 0 0}
.row{display:grid;grid-template-columns:3fr 1fr 1fr 1fr;padding:16px 20px;border-bottom:1px solid #f1f5f9;align-items:center}
.row:hover{background:#fafbfc}
.item-name{font-weight:500}
.item-variant{font-size:12px;color:#94a3b8}
.summary{display:flex;justify-content:flex-end;margin-top:24px}
.summary-box{min-width:280px;padding:24px;background:#0f172a;color:#fff;border-radius:12px}
.summary-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}
.summary-row.grand{font-size:20px;font-weight:600;opacity:1;border-top:1px solid #334155;padding-top:14px;margin-top:10px}
.verify-footer{display:flex;justify-content:space-between;align-items:center;margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0}
.payment-badge{padding:8px 16px;border-radius:20px;font-size:12px;font-weight:500}
.paid{background:#dcfce7;color:#166534}
.pending{background:#fef3c7;color:#92400e}
.verify-code{font-family:monospace;font-size:16px;letter-spacing:3px;font-weight:600;color:#0f172a}
.footer{text-align:center;padding:24px;background:#f8fafc;color:#64748b;font-size:12px}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="brand">${logo ? `<img src="${logo}" style="height:40px;margin-bottom:8px">` : ''}<h1>CTG Collection</h1><p>Premium Fashion & Lifestyle</p></div>
    <div class="invoice-box"><div class="label">INVOICE</div><div class="number">${o.orderNumber}</div><div class="date">${formatDate(o.createdAt)}</div></div>
  </div>
  <div class="body">
    <div class="address-row">
      <div class="address-box"><h4>BILL TO</h4><p><strong>${o.address.name}</strong><br>${o.user?.email || ''}<br>${o.address.phone}</p></div>
      <div class="address-box"><h4>SHIP TO</h4><p>${o.address.address}<br>${o.address.city}, ${o.address.district}<br>${o.address.postalCode || ''}</p></div>
    </div>
    <div class="table-header"><span>DESCRIPTION</span><span>VARIANT</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
    ${o.items.map(i => `<div class="row"><div><div class="item-name">${i.product.name}${i.product.hasWarranty?' 🛡️':''}</div></div><div class="item-variant">${getVariant(i.variantInfo)}</div><div style="text-align:center">${i.quantity}</div><div style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}
    <div class="summary">
      <div class="summary-box">
        <div class="summary-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
        <div class="summary-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
        ${o.discount > 0 ? `<div class="summary-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
        <div class="summary-row grand"><span>Total Due</span><span>৳${o.total.toLocaleString()}</span></div>
      </div>
    </div>
    <div class="verify-footer">
      <span class="payment-badge ${o.paymentStatus==='paid'?'paid':'pending'}">${o.paymentMethod==='cod'?'COD':'Paid Online'} • ${o.paymentStatus==='paid'?'✓ Paid':'Pending'}</span>
      ${o.verificationCode?`<span class="verify-code">${o.verificationCode}</span>`:''}
    </div>
  </div>
  <div class="footer">Thank you for shopping with CTG Collection • ctgcollection2@gmail.com</div>
</div>
${printBtn('#0f172a')}
</body></html>`

// Template 10: Monogram - Large decorative CTG
const template10 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#1e3a5f,#172554);padding:40px;color:#fff}
.receipt{max-width:700px;margin:0 auto;background:#fff;color:#1e3a5f;border-radius:2px;overflow:hidden}
.header{position:relative;padding:50px 40px;background:linear-gradient(135deg,#1e3a5f,#172554);color:#fff;text-align:center;overflow:hidden}
.monogram{position:absolute;top:-30px;left:50%;transform:translateX(-50%);font-family:'Playfair Display',serif;font-size:180px;font-weight:700;opacity:0.08;color:#fff;line-height:1}
.header-content{position:relative;z-index:1}
.header h1{font-family:'Playfair Display',serif;font-size:24px;margin-top:40px}
.header p{opacity:0.6;font-size:11px;margin-top:4px}
.badge{display:inline-block;margin-top:16px;padding:8px 24px;border:1px solid rgba(255,255,255,0.3);font-size:12px;letter-spacing:1px}
.body{padding:40px}
.info-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px}
.card{padding:20px;background:#f8fafc;border-radius:8px}
.card h4{font-size:9px;color:#94a3b8;letter-spacing:1.5px;margin-bottom:8px}
.card p{font-size:14px}
.items{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.items-header{display:grid;grid-template-columns:2fr 1fr 1fr;padding:12px 16px;background:#f8fafc;font-size:10px;color:#64748b;font-weight:600}
.item-row{display:grid;grid-template-columns:2fr 1fr 1fr;padding:16px;border-top:1px solid #f1f5f9;align-items:center}
.totals{margin-top:24px;padding:24px;background:linear-gradient(135deg,#1e3a5f,#172554);color:#fff;border-radius:8px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}
.total-row.grand{font-size:22px;font-family:'Playfair Display',serif;font-weight:600;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:14px;margin-top:10px}
.verify{text-align:center;margin-top:20px;padding:16px;border:1px dashed #cbd5e1}
.verify-code{font-family:monospace;font-size:20px;letter-spacing:4px;color:#1e3a5f;font-weight:600}
.footer{text-align:center;padding:24px;background:#f8fafc;color:#64748b;font-size:12px}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="monogram">CTG</div>
    <div class="header-content">
      ${logo ? `<img src="${logo}" style="height:45px;margin-bottom:12px;border-radius:8px">` : ''}
      <h1>CTG Collection</h1>
      <p>PREMIUM FASHION & LIFESTYLE</p>
      <div class="badge">INVOICE ${o.orderNumber}</div>
    </div>
  </div>
  <div class="body">
    <div style="text-align:center;margin-bottom:24px;color:#64748b;font-size:13px">${formatDate(o.createdAt)}</div>
    <div class="info-cards">
      <div class="card"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
      <div class="card"><h4>DELIVERY</h4><p>${o.address.city}<br>${o.address.district}</p></div>
    </div>
    <div class="items">
      <div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
      ${o.items.map(i => `<div class="item-row"><div><strong>${i.product.name}</strong><br><span style="font-size:12px;color:#94a3b8">${getVariant(i.variantInfo)}</span></div><div style="text-align:center">${i.quantity}</div><div style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}
    </div>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
    ${o.verificationCode?`<div class="verify"><div style="font-size:10px;color:#94a3b8;margin-bottom:6px">VERIFICATION</div><div class="verify-code">${o.verificationCode}</div></div>`:''}
  </div>
  <div class="footer">Thank you for choosing CTG Collection</div>
</div>
${printBtn('#1e3a5f')}
</body></html>`

// Template 11: Gradient Banner - Full width gradient header
const template11 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#f1f5f9;padding:40px}
.receipt{max-width:750px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)}
.header{background:linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899);padding:48px 40px;color:#fff;text-align:center}
.header h1{font-size:28px;font-weight:600}.header p{opacity:0.8;font-size:12px;margin-top:4px}
.badge{display:inline-block;margin-top:16px;padding:8px 24px;background:rgba(255,255,255,0.2);border-radius:24px;font-size:12px}
.body{padding:40px}.info{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
.info-box{padding:20px;background:#f8fafc;border-radius:12px}
.info-box h4{font-size:10px;color:#94a3b8;letter-spacing:1px;margin-bottom:8px}
table{width:100%;border-collapse:collapse}th{text-align:left;padding:12px;background:#f1f5f9;font-size:11px;color:#64748b}
td{padding:14px 12px;border-bottom:1px solid #f1f5f9}
.totals{background:#0f172a;color:#fff;padding:24px;border-radius:12px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}
.total-row.grand{font-size:20px;opacity:1;border-top:1px solid #334155;padding-top:12px;margin-top:8px}
.footer{text-align:center;color:#94a3b8;padding:24px;font-size:12px}
${printStyles}</style></head><body>
<div class="receipt">
<div class="header">${logo?`<img src="${logo}" style="height:45px;margin-bottom:12px">`:''}
<h1>CTG Collection</h1><p>Premium Fashion</p>
<div class="badge">${o.orderNumber} • ${formatDate(o.createdAt)}</div></div>
<div class="body"><div class="info">
<div class="info-box"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="info-box"><h4>DELIVERY</h4><p>${o.address.city}<br>${o.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${o.items.map(i=>`<tr><td><strong>${i.product.name}</strong><br><span style="color:#94a3b8;font-size:12px">${getVariant(i.variantInfo)}</span></td><td>${i.quantity}</td><td style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
</tbody></table>
<div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you! • ctgcollection2@gmail.com</div>
</div>${printBtn('#3b82f6')}</body></html>`

// Template 12: Executive Gray - Sophisticated gray theme
const template12 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#e5e7eb;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.1)}
.header{background:#374151;color:#fff;padding:32px;display:flex;justify-content:space-between;align-items:center}
.brand h1{font-size:20px}.brand p{opacity:0.7;font-size:11px}
.invoice-num{font-size:20px;font-weight:600}
.body{padding:32px}.row{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:24px}
.box{padding:16px;border:1px solid #e5e7eb;border-radius:6px}
.box h4{font-size:10px;color:#6b7280;margin-bottom:8px}
table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:10px;text-align:left;font-size:11px;color:#6b7280}
td{padding:12px 10px;border-bottom:1px solid #f3f4f6}
.totals{background:#374151;color:#fff;padding:20px;border-radius:6px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid #4b5563;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#9ca3af;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header"><div class="brand">${logo?`<img src="${logo}" style="height:32px;margin-right:10px;vertical-align:middle">`:''}
<h1 style="display:inline;vertical-align:middle">CTG Collection</h1><p>Premium Fashion</p></div>
<div class="invoice-num">${o.orderNumber}</div></div>
<div class="body"><div style="color:#6b7280;font-size:12px;margin-bottom:16px">${formatDate(o.createdAt)}</div>
<div class="row"><div class="box"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="box"><h4>SHIPPING</h4><p>${o.address.city}, ${o.address.district}</p></div></div>
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${o.items.map(i=>`<tr><td>${i.product.name}<br><span style="color:#9ca3af;font-size:11px">${getVariant(i.variantInfo)}</span></td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for your order</div></div>${printBtn('#374151')}</body></html>`

// Template 13: Ocean Blue - Deep blue professional
const template13 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:linear-gradient(135deg,#0369a1,#0284c7);padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
.header{background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;padding:36px;text-align:center}
.header h1{font-size:24px}.header p{opacity:0.8;font-size:11px;margin-top:2px}
.invoice-badge{display:inline-block;margin-top:14px;padding:8px 20px;border:1px solid rgba(255,255,255,0.3);border-radius:4px;font-size:13px}
.body{padding:36px}.cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}
.card{padding:18px;background:#f0f9ff;border-radius:8px;border-left:3px solid #0284c7}
.card h4{font-size:10px;color:#0369a1;margin-bottom:6px}
.items{border:1px solid #e0f2fe;border-radius:8px;overflow:hidden}
.items-header{background:#e0f2fe;padding:12px 16px;font-size:10px;color:#0369a1;display:grid;grid-template-columns:2fr 1fr 1fr}
.item-row{padding:14px 16px;border-bottom:1px solid #e0f2fe;display:grid;grid-template-columns:2fr 1fr 1fr;align-items:center}
.totals{background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;padding:20px;border-radius:8px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#64748b;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header">${logo?`<img src="${logo}" style="height:40px;margin-bottom:10px">`:''}
<h1>CTG Collection</h1><p>Premium Fashion</p>
<div class="invoice-badge">${o.orderNumber}</div></div>
<div class="body"><div style="text-align:center;color:#64748b;font-size:12px;margin-bottom:20px">${formatDate(o.createdAt)}</div>
<div class="cards"><div class="card"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${o.address.city}<br>${o.address.district}</p></div></div>
<div class="items"><div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
${o.items.map(i=>`<div class="item-row"><div><strong>${i.product.name}</strong><br><span style="color:#64748b;font-size:11px">${getVariant(i.variantInfo)}</span></div><div style="text-align:center">${i.quantity}</div><div style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for shopping!</div></div>${printBtn('#0284c7')}</body></html>`

// Template 14: Rose Elegant - Soft pink elegant
const template14 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#fdf2f8;padding:40px}
.receipt{max-width:650px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(236,72,153,0.1)}
.header{background:linear-gradient(135deg,#ec4899,#f472b6);color:#fff;padding:40px;text-align:center}
.header h1{font-family:'DM Serif Display',serif;font-size:28px;letter-spacing:1px}.header p{opacity:0.8;font-size:11px;margin-top:4px}
.body{padding:36px}
.invoice-info{text-align:center;margin-bottom:28px}.invoice-info .num{font-size:18px;font-weight:600;color:#be185d}
.cards{display:flex;gap:16px;margin-bottom:24px}
.card{flex:1;padding:18px;background:linear-gradient(135deg,#fdf2f8,#fce7f3);border-radius:12px}
.card h4{font-size:9px;color:#be185d;letter-spacing:1px;margin-bottom:6px}
.items{margin-bottom:24px}.item{padding:14px 0;border-bottom:1px solid #fce7f3;display:flex;justify-content:space-between}
.item-name{font-weight:500}.item-meta{color:#9ca3af;font-size:11px}
.totals{background:linear-gradient(135deg,#be185d,#ec4899);color:#fff;padding:24px;border-radius:16px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#be185d;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header">${logo?`<img src="${logo}" style="height:40px;margin-bottom:12px">`:''}
<h1>CTG Collection</h1><p>Premium Fashion</p></div>
<div class="body"><div class="invoice-info"><div style="color:#9ca3af;font-size:11px">Invoice</div>
<div class="num">${o.orderNumber}</div><div style="color:#9ca3af;font-size:12px">${formatDate(o.createdAt)}</div></div>
<div class="cards"><div class="card"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${o.address.city}<br>${o.address.district}</p></div></div>
<div class="items">${o.items.map(i=>`<div class="item"><div><div class="item-name">${i.product.name}</div><div class="item-meta">${getVariant(i.variantInfo)} × ${i.quantity}</div></div><div style="font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you! ♡</div></div>${printBtn('#ec4899')}</body></html>`

// Template 15: Emerald Pro - Green professional
const template15 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#ecfdf5;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(16,185,129,0.1)}
.header{background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:36px;display:flex;justify-content:space-between}
.brand h1{font-size:22px}.brand p{opacity:0.8;font-size:11px}
.invoice-box{text-align:right}.invoice-box span{display:block;opacity:0.7;font-size:11px}.invoice-box strong{font-size:18px}
.body{padding:36px}.info{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
.info-card{padding:18px;background:#f0fdf4;border-radius:8px;border-left:3px solid #10b981}
.info-card h4{color:#059669;font-size:10px;margin-bottom:6px}
table{width:100%;border-collapse:collapse}th{background:#f0fdf4;padding:12px;text-align:left;font-size:10px;color:#059669}
td{padding:14px 12px;border-bottom:1px solid #ecfdf5}
.totals{background:#065f46;color:#fff;padding:24px;border-radius:10px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.8}.total-row.grand{font-size:20px;opacity:1;border-top:1px solid #047857;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#6b7280;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header"><div class="brand">${logo?`<img src="${logo}" style="height:36px;margin-bottom:8px">`:''}
<h1>CTG Collection</h1><p>Premium Fashion</p></div>
<div class="invoice-box"><span>Invoice</span><strong>${o.orderNumber}</strong><span>${formatDate(o.createdAt)}</span></div></div>
<div class="body"><div class="info">
<div class="info-card"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="info-card"><h4>DELIVERY</h4><p>${o.address.city}, ${o.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${o.items.map(i=>`<tr><td><strong>${i.product.name}</strong><br><span style="color:#9ca3af;font-size:11px">${getVariant(i.variantInfo)}</span></td><td style="text-align:center">${i.quantity}</td><td style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you!</div></div>${printBtn('#10b981')}</body></html>`

// Template 16: Purple Reign - Deep purple elegant
const template16 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:linear-gradient(135deg,#4c1d95,#6d28d9);padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
.header{background:#4c1d95;color:#fff;padding:40px;text-align:center}
.header h1{font-size:26px}.header p{opacity:0.7;font-size:11px;margin-top:4px}
.badge{display:inline-block;margin-top:16px;padding:8px 20px;background:rgba(255,255,255,0.1);border-radius:4px;font-size:13px}
.body{padding:36px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
.info-box{padding:18px;background:#faf5ff;border-radius:10px}
.info-box h4{color:#7c3aed;font-size:10px;margin-bottom:8px}
.items{border-radius:10px;overflow:hidden;border:1px solid #e9d5ff}
.items-header{background:#f3e8ff;padding:12px 16px;font-size:10px;color:#7c3aed;font-weight:600;display:grid;grid-template-columns:2fr 1fr 1fr}
.item-row{padding:14px 16px;border-bottom:1px solid #f3e8ff;display:grid;grid-template-columns:2fr 1fr 1fr}
.totals{background:#4c1d95;color:#fff;padding:24px;border-radius:12px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7}.total-row.grand{font-size:20px;opacity:1;border-top:1px solid #6d28d9;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#7c3aed;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header">${logo?`<img src="${logo}" style="height:45px;margin-bottom:12px">`:''}
<h1>CTG Collection</h1><p>Premium Fashion</p>
<div class="badge">${o.orderNumber} • ${formatDate(o.createdAt)}</div></div>
<div class="body"><div class="info-grid">
<div class="info-box"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="info-box"><h4>DELIVERY</h4><p>${o.address.city}<br>${o.address.district}</p></div></div>
<div class="items"><div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
${o.items.map(i=>`<div class="item-row"><div><strong>${i.product.name}</strong><br><span style="color:#9ca3af;font-size:11px">${getVariant(i.variantInfo)}</span></div><div style="text-align:center">${i.quantity}</div><div style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for shopping!</div></div>${printBtn('#7c3aed')}</body></html>`

// Template 17: Amber Warm - Warm orange theme
const template17 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#fffbeb;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:12px;border:2px solid #fcd34d;overflow:hidden}
.header{background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;padding:36px;text-align:center}
.header h1{font-size:24px}.header p{opacity:0.8;font-size:11px;margin-top:4px}
.body{padding:36px}.invoice-row{display:flex;justify-content:space-between;padding:12px 0;margin-bottom:20px;border-bottom:2px solid #fcd34d}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.card{padding:16px;background:#fffbeb;border-radius:8px}.card h4{color:#b45309;font-size:10px;margin-bottom:6px}
table{width:100%;border-collapse:collapse}th{background:#fef3c7;padding:10px;text-align:left;font-size:11px;color:#b45309}
td{padding:12px 10px;border-bottom:1px solid #fef3c7}
.totals{background:linear-gradient(135deg,#b45309,#d97706);color:#fff;padding:22px;border-radius:10px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.8}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid #f59e0b;padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#b45309;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header">${logo?`<img src="${logo}" style="height:40px;margin-bottom:10px">`:''}
<h1>CTG Collection</h1><p>Premium Fashion</p></div>
<div class="body"><div class="invoice-row"><span style="color:#b45309">Invoice: <strong>${o.orderNumber}</strong></span><span style="color:#92400e">${formatDate(o.createdAt)}</span></div>
<div class="cards"><div class="card"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${o.address.city}, ${o.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${o.items.map(i=>`<tr><td><strong>${i.product.name}</strong><br><span style="color:#9ca3af;font-size:11px">${getVariant(i.variantInfo)}</span></td><td style="text-align:center">${i.quantity}</td><td style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you!</div></div>${printBtn('#d97706')}</body></html>`

// Template 18: Slate Modern - Cool slate gray
const template18 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#f1f5f9;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}
.header{background:#1e293b;color:#fff;padding:32px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0}
.brand h1{font-size:20px}.brand p{opacity:0.6;font-size:11px}
.invoice-box{text-align:right;font-size:13px}.invoice-box strong{display:block;font-size:16px;margin-top:2px}
.body{padding:32px}.info-row{display:flex;gap:24px;margin-bottom:24px}
.info-box{flex:1;padding:16px;background:#f8fafc;border-radius:6px;border-left:3px solid #64748b}
.info-box h4{color:#64748b;font-size:10px;margin-bottom:6px}
table{width:100%;border-collapse:collapse}th{background:#f8fafc;padding:10px;text-align:left;font-size:10px;color:#64748b}
td{padding:12px 10px;border-bottom:1px solid #f1f5f9}
.totals{margin-top:20px;padding:20px;background:#1e293b;color:#fff;border-radius:6px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;opacity:0.7}.total-row.grand{font-size:18px;opacity:1;border-top:1px solid #334155;padding-top:10px;margin-top:6px}
.footer{text-align:center;padding:24px;color:#94a3b8;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header"><div class="brand">${logo?`<img src="${logo}" style="height:32px;margin-right:10px;vertical-align:middle">`:''}
<h1 style="display:inline;vertical-align:middle">CTG Collection</h1><p>Premium Fashion</p></div>
<div class="invoice-box">${formatDate(o.createdAt)}<strong>${o.orderNumber}</strong></div></div>
<div class="body"><div class="info-row">
<div class="info-box"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="info-box"><h4>SHIPPING</h4><p>${o.address.city}, ${o.address.district}</p></div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>
${o.items.map(i=>`<tr><td><strong>${i.product.name}</strong><br><span style="color:#94a3b8;font-size:11px">${getVariant(i.variantInfo)}</span></td><td style="text-align:center">${i.quantity}</td><td style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you for your order</div></div>${printBtn('#64748b')}</body></html>`

// Template 19: Teal Fresh - Fresh teal modern
const template19 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:#f0fdfa;padding:40px}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(20,184,166,0.1)}
.header{background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;padding:40px;text-align:center}
.header h1{font-size:26px}.header p{opacity:0.8;font-size:11px;margin-top:4px}
.invoice-pill{display:inline-block;margin-top:14px;padding:8px 20px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:12px}
.body{padding:36px}.info-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}
.card{padding:18px;background:#f0fdfa;border-radius:12px}.card h4{color:#0d9488;font-size:10px;margin-bottom:6px}
.items{border:1px solid #ccfbf1;border-radius:12px;overflow:hidden}
.items-header{background:#ccfbf1;padding:12px 16px;font-size:10px;color:#0d9488;font-weight:600;display:grid;grid-template-columns:2fr 1fr 1fr}
.item-row{padding:14px 16px;border-bottom:1px solid #ccfbf1;display:grid;grid-template-columns:2fr 1fr 1fr}
.totals{background:linear-gradient(135deg,#0d9488,#14b8a6);color:#fff;padding:24px;border-radius:14px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.8}.total-row.grand{font-size:20px;opacity:1;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;margin-top:8px}
.footer{text-align:center;padding:24px;color:#0d9488;font-size:12px}
${printStyles}</style></head><body><div class="receipt">
<div class="header">${logo?`<img src="${logo}" style="height:42px;margin-bottom:12px">`:''}
<h1>CTG Collection</h1><p>Premium Fashion</p>
<div class="invoice-pill">${o.orderNumber} • ${formatDate(o.createdAt)}</div></div>
<div class="body"><div class="info-cards">
<div class="card"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="card"><h4>DELIVERY</h4><p>${o.address.city}<br>${o.address.district}</p></div></div>
<div class="items"><div class="items-header"><span>ITEM</span><span style="text-align:center">QTY</span><span style="text-align:right">AMOUNT</span></div>
${o.items.map(i=>`<div class="item-row"><div><strong>${i.product.name}</strong><br><span style="color:#94a3b8;font-size:11px">${getVariant(i.variantInfo)}</span></div><div style="text-align:center">${i.quantity}</div><div style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</div></div>`).join('')}</div>
<div class="totals"><div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>Total</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="footer">Thank you!</div></div>${printBtn('#14b8a6')}</body></html>`

// Template 20: Signature CTG - Premium brand signature
const template20 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter';background:linear-gradient(180deg,#0f172a,#1e293b);padding:40px}
.receipt{max-width:720px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
.gold-bar{height:4px;background:linear-gradient(90deg,#d4af37,#f5d87a,#d4af37)}
.header{background:#0f172a;color:#fff;padding:48px;text-align:center;position:relative}
.header h1{font-family:'Playfair Display',serif;font-size:32px;letter-spacing:2px;color:#d4af37}.header p{opacity:0.6;font-size:11px;margin-top:6px;letter-spacing:2px}
.badge{display:inline-block;margin-top:20px;padding:10px 28px;border:1px solid #d4af37;color:#d4af37;font-size:12px;letter-spacing:1px}
.body{padding:40px}.info{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:32px}
.info-box{padding:20px;border:1px solid #e2e8f0;border-radius:4px}.info-box h4{color:#d4af37;font-size:10px;letter-spacing:1px;margin-bottom:8px}
table{width:100%;border-collapse:collapse}th{background:#0f172a;color:#d4af37;padding:12px;text-align:left;font-size:10px;letter-spacing:1px}
td{padding:14px 12px;border-bottom:1px solid #f1f5f9}
.totals{background:#0f172a;color:#fff;padding:24px;border-radius:4px;margin-top:24px}
.total-row{display:flex;justify-content:space-between;padding:6px 0;opacity:0.7;font-size:14px}
.total-row.grand{font-size:22px;font-family:'Playfair Display',serif;color:#d4af37;opacity:1;border-top:1px solid #334155;padding-top:14px;margin-top:10px}
.footer{padding:28px;background:#0f172a;text-align:center;color:#64748b;font-size:11px;letter-spacing:1px}
${printStyles}</style></head><body><div class="receipt">
<div class="gold-bar"></div>
<div class="header">${logo?`<img src="${logo}" style="height:50px;margin-bottom:16px">`:''}
<h1>CTG</h1><p>COLLECTION</p>
<div class="badge">${o.orderNumber}</div></div>
<div class="body"><div style="text-align:center;color:#94a3b8;font-size:12px;margin-bottom:28px">${formatDate(o.createdAt)}</div>
<div class="info"><div class="info-box"><h4>CUSTOMER</h4><p><strong>${o.address.name}</strong><br>${o.address.phone}</p></div>
<div class="info-box"><h4>DELIVERY</h4><p>${o.address.city}<br>${o.address.district}</p></div></div>
<table><thead><tr><th>ITEM</th><th style="text-align:center">QTY</th><th style="text-align:right">AMOUNT</th></tr></thead><tbody>
${o.items.map(i=>`<tr><td><strong>${i.product.name}</strong><br><span style="color:#94a3b8;font-size:11px">${getVariant(i.variantInfo)}</span></td><td style="text-align:center">${i.quantity}</td><td style="text-align:right;font-weight:600">৳${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}
</tbody></table><div class="totals">
<div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
<div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
${o.discount>0?`<div class="total-row"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>`:''}
<div class="total-row grand"><span>TOTAL</span><span>৳${o.total.toLocaleString()}</span></div></div></div>
<div class="gold-bar"></div>
<div class="footer">THANK YOU FOR CHOOSING CTG COLLECTION</div></div>${printBtn('#d4af37')}</body></html>`

// Template 21: Premium Minimal - Clean, elegant, monochrome with warranty focus
const template21 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f8fafc;padding:40px;color:#1e293b;line-height:1.5;font-size:14px}
.receipt{max-width:800px;margin:0 auto;background:#fff;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);border:1px solid #e2e8f0}
.header{padding:40px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-start}
.logo-area{flex:1}
.logo-area h1{font-size:24px;font-weight:600;letter-spacing:-0.5px;color:#0f172a;margin-bottom:4px}
.logo-area p{font-size:13px;color:#64748b}
.invoice-details{text-align:right}
.invoice-details h2{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:4px;font-weight:600}
.invoice-details p{font-size:16px;font-weight:500;color:#0f172a}
.meta-grid{display:grid;grid-template-columns:repeat(3,1fr);padding:30px 40px;gap:20px;border-bottom:1px solid #e2e8f0;background:#fafafa}
.meta-item h3{font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:6px;font-weight:600}
.meta-item p{font-size:14px;color:#334155;font-weight:500}
.table-container{padding:0 40px}
table{width:100%;border-collapse:collapse;margin:30px 0}
th{text-align:left;padding:12px 0;border-bottom:2px solid #0f172a;color:#0f172a;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:16px 0;border-bottom:1px solid #e2e8f0;vertical-align:top}
.item-main{display:flex;flex-direction:column;gap:4px}
.item-name{font-weight:500;color:#0f172a;font-size:14px}
.item-variant{color:#64748b;font-size:12px}
.warranty-badge{display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:11px;color:#475569;margin-top:4px;width:fit-content;border:1px solid #cbd5e1}
.totals-area{padding:0 40px 40px;display:flex;justify-content:flex-end}
.totals-box{width:300px}
.total-row{display:flex;justify-content:space-between;padding:8px 0;color:#64748b}
.grand-total{display:flex;justify-content:space-between;padding:16px 0;border-top:2px solid #0f172a;margin-top:8px;font-weight:600;font-size:18px;color:#0f172a}
.footer{text-align:center;padding:30px;background:#fafafa;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="logo-area">
      ${logo ? `<img src="${logo}" style="height:40px;margin-bottom:16px;display:block">` : ''}
      <h1>CTG Collection</h1>
      <p>Premium E-Commerce Store</p>
    </div>
    <div class="invoice-details">
      <h2>Invoice Number</h2>
      <p>${o.orderNumber}</p>
      <div style="margin-top:12px">
        <h2>Date</h2>
        <p>${formatDate(o.createdAt)}</p>
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <h3>Billed To</h3>
      <p>${o.address.name}</p>
      <p>${o.address.phone}</p>
      <p>${o.address.address}</p>
    </div>
    <div class="meta-item">
      <h3>Shipping To</h3>
      <p>${o.address.city}, ${o.address.district}</p>
      <p>${o.address.postalCode || ''}</p>
    </div>
    <div class="meta-item">
      <h3>Payment Method</h3>
      <p style="text-transform:uppercase">${o.paymentMethod === 'cod' ? 'Cash on Delivery' : o.paymentMethod}</p>
      <p>${o.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}</p>
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width:50%">Item Description</th>
          <th style="text-align:center;width:15%">Qty</th>
          <th style="text-align:right;width:15%">Price</th>
          <th style="text-align:right;width:20%">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${o.items.map(i => `
        <tr>
          <td>
            <div class="item-main">
              <span class="item-name">${i.product.name}</span>
              ${i.variantInfo ? `<span class="item-variant">${getVariant(i.variantInfo)}</span>` : ''}
              ${i.product.hasWarranty ? `
                <div class="warranty-badge">
                  <span>🛡️</span>
                  <span>${i.product.warrantyPeriod || 'Warranty Included'}</span>
                </div>
              ` : ''}
            </div>
          </td>
          <td style="text-align:center">${i.quantity}</td>
          <td style="text-align:right">৳${i.price.toLocaleString()}</td>
          <td style="text-align:right;font-weight:500">৳${(i.price * i.quantity).toLocaleString()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals-area">
    <div class="totals-box">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row" style="color:#16a34a"><span>Discount</span><span>-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="grand-total"><span>Total Due</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with CTG Collection</p>
    <p style="margin-top:8px">For support, contact us at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@ctgcollection.com'}</p>
  </div>
</div>
${printBtn('#0f172a')}
</body></html>`

// Template 22-35: Similar structure with different color schemes
const template22 = (o: OrderData, logo?: string) => template21(o, logo).replace(/#0f172a/g,'#14532d').replace(/#1e293b/g,'#166534').replace(/#60a5fa/g,'#22c55e').replace(/#334155/g,'#15803d')
const template23 = (o: OrderData, logo?: string) => template21(o, logo).replace(/#0f172a/g,'#7f1d1d').replace(/#1e293b/g,'#991b1b').replace(/#60a5fa/g,'#f87171').replace(/#334155/g,'#b91c1c')
const template24 = (o: OrderData, logo?: string) => template21(o, logo).replace(/#0f172a/g,'#78350f').replace(/#1e293b/g,'#92400e').replace(/#60a5fa/g,'#fbbf24').replace(/#334155/g,'#b45309')
const template25 = (o: OrderData, logo?: string) => template1(o, logo).replace(/#1a365d/g,'#0ea5e9').replace(/#fff/g,'#f0f9ff')
const template26 = (o: OrderData, logo?: string) => template1(o, logo).replace(/#1a365d/g,'#ea580c').replace(/#fff/g,'#fff7ed')
const template27 = (o: OrderData, logo?: string) => template1(o, logo).replace(/#1a365d/g,'#10b981').replace(/#fff/g,'#ecfdf5')
const template28 = (o: OrderData, logo?: string) => template1(o, logo).replace(/#1a365d/g,'#27272a').replace(/#fff/g,'#fafafa')
const template29 = (o: OrderData, logo?: string) => template3(o, logo).replace(/#b8860b/g,'#b45309').replace(/#fffef5/g,'#fef3c7')
const template30 = (o: OrderData, logo?: string) => template11(o, logo).replace(/#3b82f6/g,'#0369a1').replace(/#8b5cf6/g,'#38bdf8')
const template31 = (o: OrderData, logo?: string) => template12(o, logo).replace(/#374151/g,'#44403c').replace(/#e5e7eb/g,'#fafaf9')
const template32 = (o: OrderData, logo?: string) => template2(o, logo).replace(/#111/g,'#cbd5e1').replace(/#333/g,'#94a3b8')
const template33 = (o: OrderData, logo?: string) => template1(o, logo).replace(/#1a365d/g,'#dc2626')
const template34 = (o: OrderData, logo?: string) => template1(o, logo).replace(/#1a365d/g,'#1e40af')
const template35 = (o: OrderData, logo?: string) => template2(o, logo).replace(/#111/g,'#94a3b8').replace(/#333/g,'#64748b')

// Template 36: Classic Purple Gradient - The original beloved template
const template36 = (o: OrderData, logo?: string) => `
<!DOCTYPE html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Receipt ${o.orderNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;padding:30px;color:#333}
.receipt{max-width:700px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.3)}
.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:35px 40px;display:flex;justify-content:space-between;align-items:center}
.brand{color:#fff}
.brand h1{font-size:28px;font-weight:700;margin-bottom:4px}
.brand h1 span{font-weight:400;font-style:italic}
.brand p{font-size:13px;opacity:0.9}
.order-box{background:rgba(255,255,255,0.2);padding:12px 20px;border-radius:10px;text-align:center;backdrop-filter:blur(10px)}
.order-box small{color:rgba(255,255,255,0.8);font-size:10px;text-transform:uppercase;letter-spacing:1px}
.order-box p{color:#fff;font-size:14px;font-weight:700;margin-top:4px}
.body{padding:35px 40px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:25px;margin-bottom:30px}
.info-section{background:#f8fafc;border-radius:12px;padding:20px;border-left:4px solid #667eea}
.info-section h4{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#667eea;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.info-section p{font-size:14px;margin:4px 0;color:#374151}
.info-section .name{font-weight:600;font-size:16px;color:#1f2937}
.payment-badge{display:inline-flex;align-items:center;gap:6px;background:#10b981;color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;margin-top:8px}
table{width:100%;border-collapse:collapse;margin:24px 0}
th{background:#f1f5f9;padding:14px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;font-weight:600}
td{padding:16px 12px;border-bottom:1px solid #e2e8f0;font-size:14px}
td:last-child{text-align:right;font-weight:600;color:#667eea}
.product-name{font-weight:600;color:#1f2937}
.variant{font-size:12px;color:#94a3b8}
.totals{background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);padding:24px;border-radius:12px;margin-top:20px}
.total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:14px}
.total-row.grand{font-size:20px;font-weight:700;color:#667eea;border-top:2px solid #e2e8f0;padding-top:16px;margin-top:10px}
.footer{padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0}
.footer h3{font-size:18px;font-weight:700;color:#1f2937;margin-bottom:4px}
.footer p{color:#667eea;font-size:13px}
.email{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:15px;font-size:13px;color:#64748b}
.disclaimer{font-size:11px;color:#94a3b8;margin-top:10px}
${printStyles}
</style></head><body>
<div class="receipt">
  <div class="header">
    <div class="brand">
      ${logo ? `<img src="${logo}" style="height:45px;margin-bottom:8px;border-radius:8px">` : ''}
      <h1>CTG <span>Collection</span></h1>
      <p>Premium Fashion & Lifestyle</p>
    </div>
    <div class="order-box">
      <small>Order Number</small>
      <p>${o.orderNumber}</p>
    </div>
  </div>
  
  <div class="body">
    <div class="info-grid">
      <div class="info-section">
        <h4>📋 Order Details</h4>
        <p>${formatDate(o.createdAt)}</p>
        <p>Payment: 💳 ${o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
        <div class="payment-badge">✓ ${o.paymentStatus === 'paid' ? 'Payment Confirmed' : 'Payment Pending'}</div>
      </div>
      <div class="info-section">
        <h4>📍 Delivery Address</h4>
        <p class="name">${o.address.name}</p>
        <p>${o.address.phone}</p>
        <p>${o.address.address}</p>
        <p>${o.address.city}, ${o.address.district}${o.address.postalCode ? ' - ' + o.address.postalCode : ''}</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Variant</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${o.items.map(item => `
          <tr>
            <td class="product-name">${item.product.name}</td>
            <td class="variant">${getVariant(item.variantInfo)}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">৳${item.price.toLocaleString()}</td>
            <td>৳${(item.price * item.quantity).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>৳${o.subtotal.toLocaleString()}</span></div>
      <div class="total-row"><span>Shipping</span><span>৳${o.shippingCost.toLocaleString()}</span></div>
      ${o.discount > 0 ? `<div class="total-row"><span>Discount</span><span style="color:#10b981">-৳${o.discount.toLocaleString()}</span></div>` : ''}
      <div class="total-row grand"><span>Grand Total</span><span>৳${o.total.toLocaleString()}</span></div>
    </div>
  </div>
  
  <div class="footer">
    <h3>CTG Collection</h3>
    <p>Thank you for shopping with us!</p>
    <div class="email">📧 ctgcollection2@gmail.com</div>
    <p class="disclaimer">This is a computer-generated receipt. No signature required.</p>
  </div>
</div>
${printBtn('#667eea')}
</body></html>`

// Main generator function
export function generateReceipt(o: OrderData, templateId: string = '1', logo?: string): string {
  switch(templateId) {
    case '1': return template1(o, logo)
    case '2': return template2(o, logo)
    case '3': return template3(o, logo)
    case '4': return template4(o, logo)
    case '5': return template5(o, logo)
    case '6': return template6(o, logo)
    case '7': return template7(o, logo)
    case '8': return template8(o, logo)
    case '9': return template9(o, logo)
    case '10': return template10(o, logo)
    case '11': return template11(o, logo)
    case '12': return template12(o, logo)
    case '13': return template13(o, logo)
    case '14': return template14(o, logo)
    case '15': return template15(o, logo)
    case '16': return template16(o, logo)
    case '17': return template17(o, logo)
    case '18': return template18(o, logo)
    case '19': return template19(o, logo)
    case '20': return template20(o, logo)
    case '21': return template21(o, logo)
    case '22': return template22(o, logo)
    case '23': return template23(o, logo)
    case '24': return template24(o, logo)
    case '25': return template25(o, logo)
    case '26': return template26(o, logo)
    case '27': return template27(o, logo)
    case '28': return template28(o, logo)
    case '29': return template29(o, logo)
    case '30': return template30(o, logo)
    case '31': return template31(o, logo)
    case '32': return template32(o, logo)
    case '33': return template33(o, logo)
    case '34': return template34(o, logo)
    case '35': return template35(o, logo)
    case '36': return template36(o, logo)
    default: return template1(o, logo)
  }
}




// Get current template setting
export async function getCurrentTemplate(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'receiptTemplate' } })
    return setting?.value || '1'
  } catch { return '1' }
}

// Save receipt to file
export async function saveReceiptToFile(orderId: string): Promise<string | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true, user: { select: { name: true, email: true } }, items: { include: { product: true } } }
    }) as any
    if (!order) return null

    // Generate verification code if missing
    if (!order.verificationCode) {
      let code = generateVerificationCode()
      for (let i = 0; i < 10; i++) {
        const exists = await prisma.order.findUnique({ where: { verificationCode: code } })
        if (!exists) break
        code = generateVerificationCode()
      }
      await prisma.order.update({ where: { id: orderId }, data: { verificationCode: code } })
      order.verificationCode = code
    }

    const orderData: OrderData = {
      ...order,
      address: { name: order.address.name, phone: order.address.phone, address: order.address.address, city: order.address.city, district: order.address.district, postalCode: order.address.postalCode },
      items: order.items.map((i: any) => ({ quantity: i.quantity, price: i.price, product: { name: i.product.name, hasWarranty: i.product.hasWarranty || false, warrantyPeriod: i.product.warrantyPeriod }, variantInfo: i.variantInfo }))
    }

    // Get logo
    let logo: string | undefined
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png')
      if (fs.existsSync(logoPath)) logo = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    } catch {}

    const templateId = await getCurrentTemplate()
    const html = generateReceipt(orderData, templateId, logo)
    
    const receiptsDir = path.join(process.cwd(), 'public', 'receipts')
    if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true })
    
    const filename = `receipt-${order.orderNumber}.html`
    fs.writeFileSync(path.join(receiptsDir, filename), html)
    await prisma.order.update({ where: { id: orderId }, data: { receiptUrl: `/receipts/${filename}` } })
    
    return `/receipts/${filename}`
  } catch (error) {
    console.error('Error generating receipt:', error)
    return null
  }
}
