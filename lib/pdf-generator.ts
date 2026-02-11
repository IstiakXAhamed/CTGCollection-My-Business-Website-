// PDF Receipt Generation with Template-Aware Layouts
// Uses PDF-lib - Free & Unlimited
// 5 distinct layout styles mapped to 26 templates

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, RGB } from 'pdf-lib'
import { getOrderForReceipt, getCurrentTemplate } from './receipt'

// =========== TYPES ===========
interface TemplateStyle {
  layout: 'classic' | 'elegant' | 'modern' | 'bold' | 'premium'
  primary: RGB
  accent: RGB
  headerBg: RGB
  headerText: RGB
  footerBg: RGB
  footerText: RGB
}

interface OrderData {
  orderNumber: string
  createdAt: Date
  address: { name: string; phone: string; address: string; city: string; district: string }
  user?: { email?: string | null } | null
  guestEmail?: string | null
  items: { product: { name: string }; quantity: number; price: number; variantInfo?: string | null }[]
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: string
  verificationCode?: string | null
}

// =========== TEMPLATE STYLE MAP ===========
const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  // Classic - Professional blue/navy, clean table
  '1':  { layout: 'classic', primary: rgb(0.10, 0.21, 0.36), accent: rgb(0.10, 0.21, 0.36), headerBg: rgb(0.10, 0.21, 0.36), headerText: rgb(1,1,1), footerBg: rgb(0.10, 0.21, 0.36), footerText: rgb(1,1,1) },
  '2':  { layout: 'classic', primary: rgb(0.20, 0.20, 0.20), accent: rgb(0.40, 0.40, 0.40), headerBg: rgb(1,1,1), headerText: rgb(0.13,0.13,0.13), footerBg: rgb(0.96,0.96,0.96), footerText: rgb(0.40,0.40,0.40) },
  '9':  { layout: 'classic', primary: rgb(0.11, 0.19, 0.33), accent: rgb(0.16, 0.65, 0.53), headerBg: rgb(0.11, 0.19, 0.33), headerText: rgb(1,1,1), footerBg: rgb(0.11, 0.19, 0.33), footerText: rgb(1,1,1) },
  '12': { layout: 'classic', primary: rgb(0.30, 0.30, 0.35), accent: rgb(0.50, 0.50, 0.55), headerBg: rgb(0.30, 0.30, 0.35), headerText: rgb(1,1,1), footerBg: rgb(0.30, 0.30, 0.35), footerText: rgb(1,1,1) },
  '13': { layout: 'classic', primary: rgb(0.05, 0.20, 0.45), accent: rgb(0.10, 0.35, 0.60), headerBg: rgb(0.05, 0.20, 0.45), headerText: rgb(1,1,1), footerBg: rgb(0.05, 0.20, 0.45), footerText: rgb(1,1,1) },
  '18': { layout: 'classic', primary: rgb(0.28, 0.33, 0.40), accent: rgb(0.45, 0.50, 0.55), headerBg: rgb(0.28, 0.33, 0.40), headerText: rgb(1,1,1), footerBg: rgb(0.28, 0.33, 0.40), footerText: rgb(1,1,1) },

  // Elegant - Gold/cream/rose, luxury spacing
  '3':  { layout: 'elegant', primary: rgb(0.70, 0.55, 0.10), accent: rgb(0.85, 0.70, 0.25), headerBg: rgb(0.98, 0.96, 0.90), headerText: rgb(0.50, 0.40, 0.10), footerBg: rgb(0.98, 0.96, 0.90), footerText: rgb(0.50, 0.40, 0.10) },
  '6':  { layout: 'elegant', primary: rgb(0.83, 0.69, 0.22), accent: rgb(0.83, 0.69, 0.22), headerBg: rgb(0.08, 0.08, 0.08), headerText: rgb(0.83, 0.69, 0.22), footerBg: rgb(0.08, 0.08, 0.08), footerText: rgb(0.83, 0.69, 0.22) },
  '14': { layout: 'elegant', primary: rgb(0.85, 0.40, 0.50), accent: rgb(0.90, 0.55, 0.60), headerBg: rgb(1, 0.96, 0.97), headerText: rgb(0.70, 0.25, 0.35), footerBg: rgb(1, 0.96, 0.97), footerText: rgb(0.70, 0.25, 0.35) },
  '24': { layout: 'elegant', primary: rgb(0.60, 0.45, 0.20), accent: rgb(0.75, 0.60, 0.30), headerBg: rgb(0.12, 0.10, 0.08), headerText: rgb(0.85, 0.70, 0.35), footerBg: rgb(0.12, 0.10, 0.08), footerText: rgb(0.85, 0.70, 0.35) },

  // Modern - Minimal, editorial, monochrome
  '7':  { layout: 'modern', primary: rgb(0.15, 0.15, 0.15), accent: rgb(0.50, 0.50, 0.50), headerBg: rgb(1,1,1), headerText: rgb(0.15, 0.15, 0.15), footerBg: rgb(0.97, 0.97, 0.97), footerText: rgb(0.50, 0.50, 0.50) },
  '21': { layout: 'modern', primary: rgb(0.10, 0.10, 0.10), accent: rgb(0.40, 0.40, 0.40), headerBg: rgb(1,1,1), headerText: rgb(0.10, 0.10, 0.10), footerBg: rgb(0.96, 0.96, 0.96), footerText: rgb(0.40, 0.40, 0.40) },
  '22': { layout: 'modern', primary: rgb(0.20, 0.20, 0.20), accent: rgb(0.55, 0.55, 0.55), headerBg: rgb(1,1,1), headerText: rgb(0.20, 0.20, 0.20), footerBg: rgb(0.98, 0.98, 0.98), footerText: rgb(0.45, 0.45, 0.45) },
  '23': { layout: 'modern', primary: rgb(0.18, 0.25, 0.35), accent: rgb(0.30, 0.45, 0.60), headerBg: rgb(1,1,1), headerText: rgb(0.18, 0.25, 0.35), footerBg: rgb(0.96, 0.97, 0.98), footerText: rgb(0.40, 0.50, 0.55) },

  // Bold - Vibrant colored header, gradient-like
  '4':  { layout: 'bold', primary: rgb(0.15, 0.15, 0.20), accent: rgb(0.25, 0.45, 0.85), headerBg: rgb(0.12, 0.12, 0.18), headerText: rgb(1,1,1), footerBg: rgb(0.12, 0.12, 0.18), footerText: rgb(1,1,1) },
  '5':  { layout: 'bold', primary: rgb(0.93, 0.28, 0.60), accent: rgb(0.60, 0.20, 0.80), headerBg: rgb(0.93, 0.28, 0.60), headerText: rgb(1,1,1), footerBg: rgb(0.60, 0.20, 0.80), footerText: rgb(1,1,1) },
  '11': { layout: 'bold', primary: rgb(0.40, 0.50, 0.90), accent: rgb(0.85, 0.25, 0.45), headerBg: rgb(0.40, 0.50, 0.90), headerText: rgb(1,1,1), footerBg: rgb(0.85, 0.25, 0.45), footerText: rgb(1,1,1) },
  '15': { layout: 'bold', primary: rgb(0.05, 0.55, 0.40), accent: rgb(0.10, 0.70, 0.50), headerBg: rgb(0.05, 0.55, 0.40), headerText: rgb(1,1,1), footerBg: rgb(0.05, 0.55, 0.40), footerText: rgb(1,1,1) },
  '16': { layout: 'bold', primary: rgb(0.35, 0.15, 0.55), accent: rgb(0.50, 0.25, 0.70), headerBg: rgb(0.35, 0.15, 0.55), headerText: rgb(1,1,1), footerBg: rgb(0.35, 0.15, 0.55), footerText: rgb(1,1,1) },
  '17': { layout: 'bold', primary: rgb(0.85, 0.55, 0.10), accent: rgb(0.90, 0.65, 0.15), headerBg: rgb(0.85, 0.55, 0.10), headerText: rgb(1,1,1), footerBg: rgb(0.85, 0.55, 0.10), footerText: rgb(1,1,1) },
  '19': { layout: 'bold', primary: rgb(0.10, 0.55, 0.60), accent: rgb(0.15, 0.65, 0.70), headerBg: rgb(0.10, 0.55, 0.60), headerText: rgb(1,1,1), footerBg: rgb(0.10, 0.55, 0.60), footerText: rgb(1,1,1) },

  // Premium - Signature/watermark, brand-focused
  '8':  { layout: 'premium', primary: rgb(0.30, 0.25, 0.20), accent: rgb(0.55, 0.45, 0.35), headerBg: rgb(0.98, 0.97, 0.95), headerText: rgb(0.30, 0.25, 0.20), footerBg: rgb(0.30, 0.25, 0.20), footerText: rgb(0.90, 0.85, 0.80) },
  '10': { layout: 'premium', primary: rgb(0.11, 0.19, 0.33), accent: rgb(0.16, 0.65, 0.53), headerBg: rgb(1,1,1), headerText: rgb(0.11, 0.19, 0.33), footerBg: rgb(0.11, 0.19, 0.33), footerText: rgb(1,1,1) },
  '20': { layout: 'premium', primary: rgb(0.15, 0.10, 0.25), accent: rgb(0.55, 0.35, 0.70), headerBg: rgb(0.15, 0.10, 0.25), headerText: rgb(1,1,1), footerBg: rgb(0.15, 0.10, 0.25), footerText: rgb(1,1,1) },
  '25': { layout: 'premium', primary: rgb(0.15, 0.35, 0.25), accent: rgb(0.20, 0.50, 0.35), headerBg: rgb(0.96, 0.98, 0.97), headerText: rgb(0.15, 0.35, 0.25), footerBg: rgb(0.15, 0.35, 0.25), footerText: rgb(1,1,1) },
  '26': { layout: 'premium', primary: rgb(0.45, 0.20, 0.10), accent: rgb(0.60, 0.30, 0.15), headerBg: rgb(0.99, 0.97, 0.95), headerText: rgb(0.45, 0.20, 0.10), footerBg: rgb(0.45, 0.20, 0.10), footerText: rgb(0.95, 0.90, 0.85) },
}

// Default style
const DEFAULT_STYLE: TemplateStyle = TEMPLATE_STYLES['1']

// =========== HELPERS ===========
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const getVariant = (v: string | null | undefined): string => {
  if (!v) return '-'
  try { const p = JSON.parse(v); return `${p.size || ''}${p.color ? ' / ' + p.color : ''}`.trim() || '-' } catch { return '-' }
}

function txt(page: PDFPage, text: string, x: number, y: number, opts: { font: PDFFont; size: number; color: RGB; maxWidth?: number }) {
  page.drawText(text, { x, y, size: opts.size, font: opts.font, color: opts.color, maxWidth: opts.maxWidth })
}

function line(page: PDFPage, x1: number, y1: number, x2: number, y2: number, thickness: number, color: RGB) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color })
}

function rect(page: PDFPage, x: number, y: number, w: number, h: number, color: RGB, border?: { color: RGB; width: number }) {
  page.drawRectangle({ x, y, width: w, height: h, color, borderColor: border?.color, borderWidth: border?.width })
}

// =========== SHARED: Draw items table + totals ===========
function drawItemsAndTotals(
  page: PDFPage, order: OrderData, startY: number,
  fonts: { regular: PDFFont; bold: PDFFont },
  colors: { dark: RGB; gray: RGB; primary: RGB; accent: RGB; lightBg: RGB; tableBorder: RGB },
  margin: number, width: number
): number {
  let y = startY
  const { regular, bold } = fonts
  const { dark, gray, primary, lightBg, tableBorder } = colors

  // Table header
  rect(page, margin, y - 8, width - margin * 2, 24, lightBg)
  const c1 = margin + 10, c2 = margin + 230, c3 = margin + 330, c4 = margin + 410
  txt(page, 'ITEM', c1, y, { font: bold, size: 8, color: gray })
  txt(page, 'QTY', c2, y, { font: bold, size: 8, color: gray })
  txt(page, 'PRICE', c3, y, { font: bold, size: 8, color: gray })
  txt(page, 'TOTAL', c4, y, { font: bold, size: 8, color: gray })
  y -= 28

  // Items
  for (const item of order.items) {
    const name = item.product.name.length > 35 ? item.product.name.substring(0, 35) + '...' : item.product.name
    const variant = getVariant(item.variantInfo)
    const itemTotal = item.price * item.quantity

    txt(page, name, c1, y, { font: bold, size: 9, color: dark })
    if (variant !== '-') txt(page, variant, c1, y - 12, { font: regular, size: 7, color: gray })
    txt(page, item.quantity.toString(), c2, y, { font: regular, size: 9, color: dark })
    txt(page, `Tk${item.price.toLocaleString()}`, c3, y, { font: regular, size: 9, color: dark })
    txt(page, `Tk${itemTotal.toLocaleString()}`, c4, y, { font: bold, size: 9, color: dark })

    y -= (variant !== '-' ? 28 : 22)
    line(page, margin, y + 8, width - margin, y + 8, 0.3, tableBorder)
  }

  y -= 15

  // Totals
  rect(page, margin, y - 70, width - margin * 2, 80, lightBg)
  const lx = margin + 20, vx = width - margin - 80

  txt(page, 'Subtotal', lx, y, { font: regular, size: 9, color: gray })
  txt(page, `Tk${order.subtotal.toLocaleString()}`, vx, y, { font: regular, size: 9, color: dark })
  y -= 16

  txt(page, 'Shipping', lx, y, { font: regular, size: 9, color: gray })
  txt(page, `Tk${order.shippingCost.toLocaleString()}`, vx, y, { font: regular, size: 9, color: dark })
  y -= 16

  if (order.discount > 0) {
    const green = rgb(0.16, 0.65, 0.40)
    txt(page, 'Discount', lx, y, { font: regular, size: 9, color: green })
    txt(page, `-Tk${order.discount.toLocaleString()}`, vx, y, { font: regular, size: 9, color: green })
    y -= 16
  }

  line(page, margin + 10, y + 5, width - margin - 10, y + 5, 1, tableBorder)
  y -= 8
  txt(page, 'TOTAL', lx, y, { font: bold, size: 12, color: primary })
  txt(page, `Tk${order.total.toLocaleString()}`, vx - 10, y, { font: bold, size: 14, color: primary })
  y -= 35

  // Payment
  const payLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
  rect(page, margin, y - 20, width - margin * 2, 35, rgb(1,1,1), { color: tableBorder, width: 1 })
  txt(page, `Payment: ${payLabel}`, margin + 15, y - 2, { font: bold, size: 9, color: dark })

  if (order.paymentStatus === 'paid') {
    const bx = width - margin - 65
    rect(page, bx, y - 15, 48, 20, rgb(0.16, 0.65, 0.40))
    txt(page, 'PAID', bx + 10, y - 8, { font: bold, size: 9, color: rgb(1,1,1) })
  } else {
    const bx = width - margin - 80
    rect(page, bx, y - 15, 62, 20, rgb(0.95, 0.58, 0.07))
    txt(page, 'PENDING', bx + 8, y - 8, { font: bold, size: 8, color: rgb(1,1,1) })
  }
  y -= 40

  // Verification code
  if (order.verificationCode) {
    rect(page, margin, y - 20, width - margin * 2, 35, lightBg, { color: tableBorder, width: 1 })
    txt(page, 'Verification Code', margin + 15, y - 2, { font: regular, size: 8, color: gray })
    txt(page, order.verificationCode, width - margin - 85, y - 2, { font: bold, size: 14, color: primary })
    y -= 40
  }

  return y
}

// =========== LAYOUT: CLASSIC ===========
// Professional header bar, clean structure
async function layoutClassic(pdfDoc: PDFDocument, order: OrderData, style: TemplateStyle): Promise<void> {
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const m = 50
  const dark = rgb(0.13, 0.13, 0.13)
  const gray = rgb(0.47, 0.47, 0.47)
  const lightBg = rgb(0.96, 0.96, 0.96)
  const tableBorder = rgb(0.90, 0.90, 0.90)

  // Header bar
  rect(page, 0, height - 90, width, 90, style.headerBg)
  txt(page, 'SILK MART', m, height - 40, { font: bold, size: 22, color: style.headerText })
  txt(page, 'Premium Fashion & Lifestyle', m, height - 58, { font: regular, size: 9, color: style.headerText })
  txt(page, 'INVOICE', width - m - 120, height - 38, { font: regular, size: 8, color: style.headerText })
  txt(page, order.orderNumber, width - m - 120, height - 54, { font: bold, size: 13, color: style.headerText })

  // Date
  let y = height - 115
  txt(page, formatDate(order.createdAt), width - m - 120, y, { font: regular, size: 9, color: gray })

  y -= 10
  line(page, m, y, width - m, y, 1.5, style.primary)
  y -= 30

  // Bill To / Ship To
  txt(page, 'BILL TO', m, y, { font: bold, size: 8, color: gray })
  txt(page, 'SHIP TO', width / 2, y, { font: bold, size: 8, color: gray })
  y -= 14
  txt(page, order.address.name, m, y, { font: bold, size: 10, color: dark })
  txt(page, order.address.name, width / 2, y, { font: bold, size: 10, color: dark })
  y -= 12
  txt(page, order.user?.email || order.guestEmail || '', m, y, { font: regular, size: 9, color: gray })
  txt(page, order.address.address, width / 2, y, { font: regular, size: 9, color: gray, maxWidth: 200 })
  y -= 12
  txt(page, order.address.phone, m, y, { font: regular, size: 9, color: gray })
  txt(page, `${order.address.city}, ${order.address.district}`, width / 2, y, { font: regular, size: 9, color: gray })
  y -= 30

  // Items + Totals
  drawItemsAndTotals(page, order, y, { regular, bold }, { dark, gray, primary: style.primary, accent: style.accent, lightBg, tableBorder }, m, width)

  // Footer bar
  rect(page, 0, 0, width, 55, style.footerBg)
  txt(page, 'Thank you for shopping with Silk Mart! • support@silkmartbd.com', m + 30, 22, { font: regular, size: 9, color: style.footerText })
}

// =========== LAYOUT: ELEGANT ===========
// Luxury spacing, serif-like feel, decorative borders
async function layoutElegant(pdfDoc: PDFDocument, order: OrderData, style: TemplateStyle): Promise<void> {
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()
  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const m = 55
  const dark = rgb(0.15, 0.15, 0.15)
  const gray = rgb(0.50, 0.50, 0.50)
  const lightBg = rgb(0.98, 0.97, 0.95)
  const tableBorder = rgb(0.88, 0.85, 0.80)

  // Elegant header area
  rect(page, 0, height - 110, width, 110, style.headerBg)

  // Double border lines at top
  line(page, m - 10, height - 8, width - m + 10, height - 8, 2, style.primary)
  line(page, m - 10, height - 12, width - m + 10, height - 12, 0.5, style.primary)

  // Brand name centered
  const brandWidth = bold.widthOfTextAtSize('SILK MART', 26)
  txt(page, 'SILK MART', (width - brandWidth) / 2, height - 50, { font: bold, size: 26, color: style.headerText })
  const tagWidth = regular.widthOfTextAtSize('— Premium Fashion & Lifestyle —', 10)
  txt(page, '— Premium Fashion & Lifestyle —', (width - tagWidth) / 2, height - 68, { font: regular, size: 10, color: style.headerText })

  // Invoice centered
  const invWidth = helv.widthOfTextAtSize('INVOICE', 8)
  txt(page, 'INVOICE', (width - invWidth) / 2, height - 90, { font: helv, size: 8, color: style.primary })
  const numWidth = bold.widthOfTextAtSize(order.orderNumber, 12)
  txt(page, order.orderNumber, (width - numWidth) / 2, height - 104, { font: bold, size: 12, color: style.headerText })

  let y = height - 135
  // Decorative divider
  line(page, m, y, width - m, y, 0.5, style.primary)
  const diamondX = width / 2
  rect(page, diamondX - 4, y - 4, 8, 8, style.primary)
  y -= 30

  // Date
  txt(page, formatDate(order.createdAt), m, y, { font: regular, size: 9, color: gray })
  y -= 25

  // Customer info (single column, elegant)
  txt(page, 'BILLED TO', m, y, { font: helv, size: 7, color: style.primary })
  y -= 14
  txt(page, order.address.name, m, y, { font: bold, size: 11, color: dark })
  y -= 13
  txt(page, `${order.address.address}, ${order.address.city}`, m, y, { font: regular, size: 9, color: gray })
  y -= 12
  txt(page, `${order.address.district} • ${order.address.phone}`, m, y, { font: regular, size: 9, color: gray })
  y -= 12
  txt(page, order.user?.email || order.guestEmail || '', m, y, { font: regular, size: 9, color: gray })
  y -= 30

  // Elegant divider
  line(page, m, y, width - m, y, 0.5, style.primary)
  y -= 25

  // Items + Totals (using Helvetica for table readability)
  drawItemsAndTotals(page, order, y, { regular: helv, bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold) }, { dark, gray, primary: style.primary, accent: style.accent, lightBg, tableBorder }, m, width)

  // Footer
  rect(page, 0, 0, width, 65, style.footerBg)
  line(page, m - 10, 60, width - m + 10, 60, 0.5, style.primary)
  line(page, m - 10, 57, width - m + 10, 57, 2, style.primary)
  const thankWidth = regular.widthOfTextAtSize('Thank you for your patronage', 10)
  txt(page, 'Thank you for your patronage', (width - thankWidth) / 2, 35, { font: regular, size: 10, color: style.footerText })
  const emailWidth = helv.widthOfTextAtSize('support@silkmartbd.com', 8)
  txt(page, 'support@silkmartbd.com', (width - emailWidth) / 2, 18, { font: helv, size: 8, color: style.footerText })
}

// =========== LAYOUT: MODERN ===========
// Ultra-minimal, lots of whitespace, thin lines
async function layoutModern(pdfDoc: PDFDocument, order: OrderData, style: TemplateStyle): Promise<void> {
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const m = 60
  const dark = rgb(0.10, 0.10, 0.10)
  const gray = rgb(0.55, 0.55, 0.55)
  const lightBg = rgb(0.98, 0.98, 0.98)
  const tableBorder = rgb(0.92, 0.92, 0.92)

  // Minimal header - just text, no background box
  let y = height - 60
  txt(page, 'SILK MART', m, y, { font: bold, size: 18, color: style.primary })
  txt(page, 'RECEIPT', width - m - 80, y, { font: regular, size: 10, color: gray })
  y -= 20
  txt(page, order.orderNumber, width - m - 80, y, { font: bold, size: 11, color: style.primary })
  y -= 5
  line(page, m, y, width - m, y, 0.3, style.primary)
  y -= 30

  // Date + customer on same row
  txt(page, formatDate(order.createdAt), m, y, { font: regular, size: 8, color: gray })
  y -= 25

  txt(page, order.address.name, m, y, { font: bold, size: 10, color: dark })
  txt(page, order.address.phone, width / 2, y, { font: regular, size: 9, color: gray })
  y -= 13
  txt(page, order.user?.email || order.guestEmail || '', m, y, { font: regular, size: 9, color: gray })
  txt(page, order.address.city + ', ' + order.address.district, width / 2, y, { font: regular, size: 9, color: gray })
  y -= 13
  txt(page, order.address.address, m, y, { font: regular, size: 9, color: gray, maxWidth: 250 })
  y -= 30

  line(page, m, y, width - m, y, 0.3, tableBorder)
  y -= 25

  // Items + Totals
  drawItemsAndTotals(page, order, y, { regular, bold }, { dark, gray, primary: style.primary, accent: style.accent, lightBg, tableBorder }, m, width)

  // Minimal footer - just a thin line and text
  line(page, m, 55, width - m, 55, 0.3, style.primary)
  const footerText = 'Silk Mart • support@silkmartbd.com'
  const fw = regular.widthOfTextAtSize(footerText, 8)
  txt(page, footerText, (width - fw) / 2, 38, { font: regular, size: 8, color: gray })
}

// =========== LAYOUT: BOLD ===========
// Large colored header block, vibrant, energetic
async function layoutBold(pdfDoc: PDFDocument, order: OrderData, style: TemplateStyle): Promise<void> {
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const m = 50
  const dark = rgb(0.13, 0.13, 0.13)
  const gray = rgb(0.47, 0.47, 0.47)
  const lightBg = rgb(0.96, 0.96, 0.96)
  const tableBorder = rgb(0.88, 0.88, 0.88)

  // Big bold header
  rect(page, 0, height - 140, width, 140, style.headerBg)
  // Accent strip at bottom of header
  rect(page, 0, height - 145, width, 5, style.accent)

  // Brand - large and bold
  txt(page, 'SILK', m, height - 50, { font: bold, size: 32, color: style.headerText })
  txt(page, 'MART', m + 80, height - 50, { font: regular, size: 32, color: style.headerText })

  // Order number - right side, large
  txt(page, order.orderNumber, width - m - 140, height - 45, { font: bold, size: 18, color: style.headerText })
  txt(page, 'INVOICE', width - m - 140, height - 60, { font: regular, size: 8, color: style.headerText })

  // Date bar
  rect(page, 0, height - 170, width, 25, lightBg)
  txt(page, `Date: ${formatDate(order.createdAt)}`, m, height - 163, { font: regular, size: 9, color: gray })
  txt(page, `Payment: ${order.paymentMethod === 'cod' ? 'COD' : 'Online'}`, width - m - 120, height - 163, { font: regular, size: 9, color: gray })

  let y = height - 200

  // Customer info in a colored box
  rect(page, m, y - 55, width - m * 2, 65, lightBg)
  txt(page, 'CUSTOMER', m + 12, y, { font: bold, size: 7, color: style.primary })
  y -= 14
  txt(page, order.address.name, m + 12, y, { font: bold, size: 10, color: dark })
  txt(page, order.address.phone, width / 2, y, { font: regular, size: 9, color: gray })
  y -= 12
  txt(page, order.user?.email || order.guestEmail || '', m + 12, y, { font: regular, size: 9, color: gray })
  txt(page, `${order.address.city}, ${order.address.district}`, width / 2, y, { font: regular, size: 9, color: gray })
  y -= 12
  txt(page, order.address.address, m + 12, y, { font: regular, size: 9, color: gray, maxWidth: 220 })
  y -= 30

  // Items + Totals
  drawItemsAndTotals(page, order, y, { regular, bold }, { dark, gray, primary: style.primary, accent: style.accent, lightBg, tableBorder }, m, width)

  // Bold footer
  rect(page, 0, 0, width, 60, style.footerBg)
  rect(page, 0, 55, width, 5, style.accent) // accent strip
  const ft = 'THANK YOU FOR SHOPPING WITH SILK MART!'
  const ftw = bold.widthOfTextAtSize(ft, 10)
  txt(page, ft, (width - ftw) / 2, 28, { font: bold, size: 10, color: style.footerText })
  const em = 'support@silkmartbd.com'
  const emw = regular.widthOfTextAtSize(em, 8)
  txt(page, em, (width - emw) / 2, 12, { font: regular, size: 8, color: style.footerText })
}

// =========== LAYOUT: PREMIUM ===========
// Signature brand feel, watermark, centered focus
async function layoutPremium(pdfDoc: PDFDocument, order: OrderData, style: TemplateStyle): Promise<void> {
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const times = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const m = 50
  const dark = rgb(0.13, 0.13, 0.13)
  const gray = rgb(0.47, 0.47, 0.47)
  const lightBg = rgb(0.97, 0.97, 0.97)
  const tableBorder = rgb(0.90, 0.90, 0.90)

  // Watermark - large faded brand text
  const wmText = 'SM'
  const wmSize = 200
  const wmWidth = times.widthOfTextAtSize(wmText, wmSize)
  const wmColor = rgb(
    Math.min(1, style.primary.red + 0.85),
    Math.min(1, style.primary.green + 0.85),
    Math.min(1, style.primary.blue + 0.85)
  )
  txt(page, wmText, (width - wmWidth) / 2, height / 2 - 60, { font: times, size: wmSize, color: wmColor })

  // Top accent line
  rect(page, 0, height - 4, width, 4, style.primary)

  // Header
  rect(page, 0, height - 105, width, 101, style.headerBg)
  let y = height - 35

  // Centered brand
  const brandW = bold.widthOfTextAtSize('SILK MART', 24)
  txt(page, 'SILK MART', (width - brandW) / 2, y, { font: bold, size: 24, color: style.headerText })
  y -= 18
  const tagW = regular.widthOfTextAtSize('PREMIUM FASHION & LIFESTYLE', 8)
  txt(page, 'PREMIUM FASHION & LIFESTYLE', (width - tagW) / 2, y, { font: regular, size: 8, color: style.headerText })
  y -= 25

  // Order details centered
  const invLine = `Invoice ${order.orderNumber} • ${formatDate(order.createdAt)}`
  const invW = regular.widthOfTextAtSize(invLine, 9)
  txt(page, invLine, (width - invW) / 2, y, { font: regular, size: 9, color: style.headerText })

  y = height - 130

  // Thin accent line below header
  line(page, 0, y, width, y, 2, style.accent)
  y -= 35

  // Customer box
  rect(page, m, y - 55, width - m * 2, 70, lightBg, { color: tableBorder, width: 0.5 })
  txt(page, 'CUSTOMER DETAILS', m + 15, y + 5, { font: bold, size: 7, color: style.primary })
  y -= 10
  txt(page, order.address.name, m + 15, y, { font: bold, size: 10, color: dark })
  txt(page, order.address.phone, width / 2 + 20, y, { font: regular, size: 9, color: gray })
  y -= 13
  txt(page, order.user?.email || order.guestEmail || '', m + 15, y, { font: regular, size: 9, color: gray })
  txt(page, `${order.address.city}, ${order.address.district}`, width / 2 + 20, y, { font: regular, size: 9, color: gray })
  y -= 13
  txt(page, order.address.address, m + 15, y, { font: regular, size: 9, color: gray, maxWidth: 220 })
  y -= 30

  // Items + Totals
  drawItemsAndTotals(page, order, y, { regular, bold }, { dark, gray, primary: style.primary, accent: style.accent, lightBg, tableBorder }, m, width)

  // Footer
  rect(page, 0, 0, width, 65, style.footerBg)
  rect(page, 0, 61, width, 2, style.accent)
  const ty = 'Thank you for shopping with us'
  const tw = regular.widthOfTextAtSize(ty, 10)
  txt(page, ty, (width - tw) / 2, 38, { font: regular, size: 10, color: style.footerText })
  const se = 'Silk Mart • support@silkmartbd.com'
  const sw = regular.widthOfTextAtSize(se, 8)
  txt(page, se, (width - sw) / 2, 20, { font: regular, size: 8, color: style.footerText })
}

// =========== MAIN GENERATOR ===========
export async function generateReceiptPDF(orderId: string): Promise<Buffer | null> {
  try {
    console.log('Generating PDF for order:', orderId)

    const order = await getOrderForReceipt(orderId)
    if (!order) {
      console.error('Order not found for PDF generation:', orderId)
      return null
    }

    const templateId = await getCurrentTemplate()
    console.log('Using template ID for PDF:', templateId)

    const style = TEMPLATE_STYLES[templateId] || DEFAULT_STYLE
    console.log('PDF layout style:', style.layout)

    const pdfDoc = await PDFDocument.create()
    pdfDoc.setTitle(`Invoice ${order.orderNumber}`)
    pdfDoc.setAuthor('Silk Mart')
    pdfDoc.setSubject(`Order Receipt - ${order.orderNumber}`)

    // Route to the appropriate layout
    switch (style.layout) {
      case 'classic': await layoutClassic(pdfDoc, order as any, style); break
      case 'elegant': await layoutElegant(pdfDoc, order as any, style); break
      case 'modern':  await layoutModern(pdfDoc, order as any, style); break
      case 'bold':    await layoutBold(pdfDoc, order as any, style); break
      case 'premium': await layoutPremium(pdfDoc, order as any, style); break
      default:        await layoutClassic(pdfDoc, order as any, style); break
    }

    const pdfBytes = await pdfDoc.save()
    console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes')
    return Buffer.from(pdfBytes)

  } catch (error) {
    console.error('Error generating PDF:', error)
    return null
  }
}

// Legacy function - not used
export async function htmlToPDF(html: string): Promise<Buffer | null> {
  console.warn('htmlToPDF is not available')
  return null
}
