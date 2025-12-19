// PDF Receipt Generation for Serverless Environments (Vercel)
// Uses PDF-lib - Free & Unlimited
// Matches the HTML template design exactly

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getOrderForReceipt } from './receipt'

// Format date for receipt
const formatDate = (date: Date) => 
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// Parse variant info
const getVariant = (variantInfo: string | null | undefined): string => {
  if (!variantInfo) return '-'
  try {
    const v = JSON.parse(variantInfo)
    return `${v.size || ''}${v.color ? ' / ' + v.color : ''}`.trim() || '-'
  } catch { return '-' }
}

// Generate PDF receipt buffer - matches the HTML template design
export async function generateReceiptPDF(orderId: string): Promise<Buffer | null> {
  try {
    console.log('Generating PDF for order:', orderId)
    
    const order = await getOrderForReceipt(orderId)
    if (!order) {
      console.error('Order not found for PDF generation:', orderId)
      return null
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const { width, height } = page.getSize()
    
    // Embed fonts
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Colors matching the HTML template
    const navy = rgb(0.11, 0.19, 0.33)      // #1c3155 - dark navy header/footer
    const darkText = rgb(0.13, 0.13, 0.13)  // #222 - main text
    const grayText = rgb(0.47, 0.47, 0.47)  // #787878 - labels
    const lightGray = rgb(0.96, 0.96, 0.96) // #f5f5f5 - backgrounds
    const green = rgb(0.16, 0.65, 0.53)     // #2aa689 - paid badge
    const white = rgb(1, 1, 1)
    
    const margin = 50
    let y = height - 50
    
    // ========== HEADER SECTION ==========
    // White header background
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: white
    })
    
    // Logo area (CTG text as placeholder)
    page.drawText('CTG', margin, y - 5, {
      font: bold,
      size: 24,
      color: navy
    })
    page.drawText('Collection', margin + 55, y - 5, {
      font: regular,
      size: 18,
      color: navy
    })
    page.drawText('Premium Fashion & Lifestyle', margin, y - 22, {
      font: regular,
      size: 9,
      color: grayText
    })
    
    // Invoice info (right side)
    page.drawText('INVOICE', width - margin - 130, y, {
      font: regular,
      size: 9,
      color: grayText
    })
    page.drawText(order.orderNumber, width - margin - 130, y - 16, {
      font: bold,
      size: 14,
      color: navy
    })
    page.drawText(formatDate(order.createdAt), width - margin - 130, y - 32, {
      font: regular,
      size: 10,
      color: grayText
    })
    
    y -= 70
    
    // Divider line
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1.5,
      color: navy
    })
    
    y -= 35
    
    // ========== BILL TO / SHIP TO SECTION ==========
    // Bill To
    page.drawText('BILL TO', margin, y, {
      font: bold,
      size: 9,
      color: grayText
    })
    y -= 16
    page.drawText(order.address.name, margin, y, {
      font: bold,
      size: 11,
      color: darkText
    })
    y -= 14
    page.drawText(order.user?.email || order.guestEmail || '', margin, y, {
      font: regular,
      size: 10,
      color: grayText
    })
    y -= 12
    page.drawText(order.address.phone, margin, y, {
      font: regular,
      size: 10,
      color: grayText
    })
    
    // Ship To (right side)
    let shipY = y + 42
    page.drawText('SHIP TO', width/2, shipY, {
      font: bold,
      size: 9,
      color: grayText
    })
    shipY -= 16
    page.drawText(order.address.name, width/2, shipY, {
      font: bold,
      size: 11,
      color: darkText
    })
    shipY -= 14
    page.drawText(order.address.address, width/2, shipY, {
      font: regular,
      size: 10,
      color: grayText,
      maxWidth: 200
    })
    shipY -= 12
    page.drawText(`${order.address.city}, ${order.address.district}`, width/2, shipY, {
      font: regular,
      size: 10,
      color: grayText
    })
    
    y -= 45
    
    // ========== ITEMS TABLE SECTION ==========
    // Table header background
    page.drawRectangle({
      x: margin,
      y: y - 8,
      width: width - margin * 2,
      height: 24,
      color: lightGray
    })
    
    // Table headers
    const colItem = margin + 10
    const colVariant = margin + 170
    const colQty = margin + 290
    const colPrice = margin + 360
    const colTotal = margin + 440
    
    page.drawText('ITEM', colItem, y, { font: bold, size: 9, color: grayText })
    page.drawText('VARIANT', colVariant, y, { font: bold, size: 9, color: grayText })
    page.drawText('QTY', colQty, y, { font: bold, size: 9, color: grayText })
    page.drawText('PRICE', colPrice, y, { font: bold, size: 9, color: grayText })
    page.drawText('TOTAL', colTotal, y, { font: bold, size: 9, color: grayText })
    
    y -= 30
    
    // Items
    for (const item of order.items) {
      // Product name
      page.drawText(item.product.name, colItem, y, {
        font: bold,
        size: 10,
        color: darkText
      })
      
      // Variant
      const variant = getVariant(item.variantInfo)
      page.drawText(variant, colVariant, y, {
        font: regular,
        size: 10,
        color: grayText
      })
      
      // Quantity
      page.drawText(item.quantity.toString(), colQty, y, {
        font: regular,
        size: 10,
        color: darkText
      })
      
      // Price (using Tk instead of ৳)
      page.drawText(`Tk${item.price.toLocaleString()}`, colPrice, y, {
        font: regular,
        size: 10,
        color: darkText
      })
      
      // Total
      const itemTotal = item.price * item.quantity
      page.drawText(`Tk${itemTotal.toLocaleString()}`, colTotal, y, {
        font: bold,
        size: 10,
        color: darkText
      })
      
      y -= 28
      
      // Divider line
      page.drawLine({
        start: { x: margin, y: y + 12 },
        end: { x: width - margin, y: y + 12 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9)
      })
    }
    
    y -= 15
    
    // ========== TOTALS SECTION ==========
    // Totals background
    page.drawRectangle({
      x: margin,
      y: y - 80,
      width: width - margin * 2,
      height: 90,
      color: lightGray
    })
    
    const totalsLabelX = margin + 20
    const totalsValueX = width - margin - 80
    
    // Subtotal
    page.drawText('Subtotal', totalsLabelX, y, { font: regular, size: 10, color: grayText })
    page.drawText(`Tk${order.subtotal.toLocaleString()}`, totalsValueX, y, { font: regular, size: 10, color: darkText })
    
    y -= 18
    
    // Shipping
    page.drawText('Shipping', totalsLabelX, y, { font: regular, size: 10, color: grayText })
    page.drawText(`Tk${order.shippingCost.toLocaleString()}`, totalsValueX, y, { font: regular, size: 10, color: darkText })
    
    y -= 18
    
    // Discount (if any)
    if (order.discount > 0) {
      page.drawText('Discount', totalsLabelX, y, { font: regular, size: 10, color: green })
      page.drawText(`-Tk${order.discount.toLocaleString()}`, totalsValueX, y, { font: regular, size: 10, color: green })
      y -= 18
    }
    
    // Total row
    page.drawLine({
      start: { x: margin + 10, y: y + 5 },
      end: { x: width - margin - 10, y: y + 5 },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85)
    })
    y -= 8
    page.drawText('Total', totalsLabelX, y, { font: bold, size: 12, color: navy })
    page.drawText(`Tk${order.total.toLocaleString()}`, totalsValueX - 10, y, { font: bold, size: 14, color: navy })
    
    y -= 40
    
    // ========== PAYMENT SECTION ==========
    page.drawRectangle({
      x: margin,
      y: y - 25,
      width: width - margin * 2,
      height: 40,
      color: white,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1
    })
    
    const paymentMethod = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
    page.drawText(`Payment: ${paymentMethod}`, margin + 15, y - 5, {
      font: bold,
      size: 10,
      color: darkText
    })
    
    // Paid badge
    if (order.paymentStatus === 'paid') {
      const badgeX = width - margin - 70
      const badgeY = y - 12
      page.drawRectangle({
        x: badgeX,
        y: badgeY,
        width: 50,
        height: 22,
        color: green,
        borderColor: green,
        borderWidth: 1,
      })
      page.drawText('Paid', badgeX + 12, badgeY + 6, {
        font: bold,
        size: 10,
        color: white
      })
    }
    
    y -= 50
    
    // ========== VERIFICATION CODE SECTION ==========
    if (order.verificationCode) {
      page.drawRectangle({
        x: margin,
        y: y - 25,
        width: width - margin * 2,
        height: 40,
        color: lightGray,
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1
      })
      
      page.drawText('Verification Code', margin + 15, y - 5, {
        font: regular,
        size: 9,
        color: grayText
      })
      
      page.drawText(order.verificationCode, width - margin - 80, y - 5, {
        font: bold,
        size: 14,
        color: navy
      })
    }
    
    // ========== FOOTER SECTION ==========
    const footerY = 50
    
    // Footer background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: footerY + 10,
      color: navy
    })
    
    // Footer text
    page.drawText('Thank you for shopping with CTG Collection! * ctgcollection2@gmail.com', 
      margin + 50, footerY - 18, {
      font: regular,
      size: 10,
      color: white
    })
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()
    
    console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes')
    return Buffer.from(pdfBytes)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return null
  }
}

// Legacy function - not used in serverless
export async function htmlToPDF(html: string): Promise<Buffer | null> {
  console.warn('htmlToPDF is not available in serverless environment')
  return null
}
