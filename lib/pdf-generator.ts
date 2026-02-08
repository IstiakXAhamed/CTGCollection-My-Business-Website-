// PDF Receipt Generation for Serverless Environments (Vercel)
// Uses PDF-lib - Free & Unlimited
// Matches the HTML template design exactly

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, RGB } from 'pdf-lib'
import { getOrderForReceipt, getCurrentTemplate } from './receipt'

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

// Helper function to draw text
function drawText(
  page: PDFPage, 
  text: string, 
  x: number, 
  y: number, 
  options: { font: PDFFont; size: number; color: RGB; maxWidth?: number }
) {
  page.drawText(text, {
    x,
    y,
    size: options.size,
    font: options.font,
    color: options.color,
    maxWidth: options.maxWidth
  })
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

    // Get current template ID to determine styles
    const templateId = await getCurrentTemplate()
    console.log('Using template ID for PDF:', templateId)

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

    // Base colors
    let primaryColor = navy
    let accentColor = navy
    
    // Adjust colors based on templateId (Template 36 is Purple Gradient, Template 6 is Gold)
    if (templateId === '36') {
      primaryColor = rgb(0.4, 0.31, 0.64) // Purple #667eea
      accentColor = rgb(0.46, 0.29, 0.64)  // #764ba2
    } else if (templateId === '6' || templateId === '24') {
      primaryColor = rgb(0.83, 0.69, 0.22) // Gold #d4af37
      accentColor = rgb(0.1, 0.1, 0.1)     // Black
    } else if (templateId === '5' || templateId === '14') {
      primaryColor = rgb(0.93, 0.28, 0.6)  // Pink #ec4899
    } else if (templateId === '1' || templateId === '13') {
      primaryColor = rgb(0.1, 0.21, 0.36)  // Navy #1a365d
    }

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
    // Logo area
    drawText(page, 'SILK', margin, y - 5, { font: bold, size: 24, color: primaryColor })
    drawText(page, 'MART', margin + 65, y - 5, { font: regular, size: 24, color: primaryColor })
    drawText(page, 'Premium Fashion & Lifestyle', margin, y - 25, { font: regular, size: 9, color: grayText })
    
    // Invoice info (right side)
    drawText(page, 'INVOICE', width - margin - 130, y, { font: regular, size: 9, color: grayText })
    drawText(page, order.orderNumber, width - margin - 130, y - 16, { font: bold, size: 14, color: primaryColor })
    drawText(page, formatDate(order.createdAt), width - margin - 130, y - 32, { font: regular, size: 10, color: grayText })
    
    y -= 70
    
    // Divider line
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1.5,
      color: primaryColor
    })
    
    y -= 35
    
    // ========== BILL TO / SHIP TO SECTION ==========
    // Bill To
    drawText(page, 'BILL TO', margin, y, { font: bold, size: 9, color: grayText })
    y -= 16
    drawText(page, order.address.name, margin, y, { font: bold, size: 11, color: darkText })
    y -= 14
    drawText(page, order.user?.email || order.guestEmail || '', margin, y, { font: regular, size: 10, color: grayText })
    y -= 12
    drawText(page, order.address.phone, margin, y, { font: regular, size: 10, color: grayText })
    
    // Ship To (right side)
    let shipY = y + 42
    drawText(page, 'SHIP TO', width/2, shipY, { font: bold, size: 9, color: grayText })
    shipY -= 16
    drawText(page, order.address.name, width/2, shipY, { font: bold, size: 11, color: darkText })
    shipY -= 14
    drawText(page, order.address.address, width/2, shipY, { font: regular, size: 10, color: grayText, maxWidth: 200 })
    shipY -= 12
    drawText(page, `${order.address.city}, ${order.address.district}`, width/2, shipY, { font: regular, size: 10, color: grayText })
    
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
    
    drawText(page, 'ITEM', colItem, y, { font: bold, size: 9, color: grayText })
    drawText(page, 'VARIANT', colVariant, y, { font: bold, size: 9, color: grayText })
    drawText(page, 'QTY', colQty, y, { font: bold, size: 9, color: grayText })
    drawText(page, 'PRICE', colPrice, y, { font: bold, size: 9, color: grayText })
    drawText(page, 'TOTAL', colTotal, y, { font: bold, size: 9, color: grayText })
    
    y -= 30
    
    // Items
    for (const item of order.items) {
      // Product name
      drawText(page, item.product.name, colItem, y, { font: bold, size: 10, color: darkText })
      
      // Variant
      const variant = getVariant(item.variantInfo)
      drawText(page, variant, colVariant, y, { font: regular, size: 10, color: grayText })
      
      // Quantity
      drawText(page, item.quantity.toString(), colQty, y, { font: regular, size: 10, color: darkText })
      
      // Price (using Tk instead of ৳)
      drawText(page, `Tk${item.price.toLocaleString()}`, colPrice, y, { font: regular, size: 10, color: darkText })
      
      // Total
      const itemTotal = item.price * item.quantity
      drawText(page, `Tk${itemTotal.toLocaleString()}`, colTotal, y, { font: bold, size: 10, color: darkText })
      
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
    drawText(page, 'Subtotal', totalsLabelX, y, { font: regular, size: 10, color: grayText })
    drawText(page, `Tk${order.subtotal.toLocaleString()}`, totalsValueX, y, { font: regular, size: 10, color: darkText })
    
    y -= 18
    
    // Shipping
    drawText(page, 'Shipping', totalsLabelX, y, { font: regular, size: 10, color: grayText })
    drawText(page, `Tk${order.shippingCost.toLocaleString()}`, totalsValueX, y, { font: regular, size: 10, color: darkText })
    
    y -= 18
    
    // Discount (if any)
    if (order.discount > 0) {
      drawText(page, 'Discount', totalsLabelX, y, { font: regular, size: 10, color: green })
      drawText(page, `-Tk${order.discount.toLocaleString()}`, totalsValueX, y, { font: regular, size: 10, color: green })
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
    drawText(page, 'Total', totalsLabelX, y, { font: bold, size: 12, color: primaryColor })
    drawText(page, `Tk${order.total.toLocaleString()}`, totalsValueX - 10, y, { font: bold, size: 14, color: primaryColor })
    
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
    drawText(page, `Payment: ${paymentMethod}`, margin + 15, y - 5, { font: bold, size: 10, color: darkText })
    
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
      drawText(page, 'Paid', badgeX + 12, badgeY + 6, { font: bold, size: 10, color: white })
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
      
      drawText(page, 'Verification Code', margin + 15, y - 5, { font: regular, size: 9, color: grayText })
      drawText(page, order.verificationCode, width - margin - 80, y - 5, { font: bold, size: 14, color: primaryColor })
    }
    
    // ========== FOOTER SECTION ==========
    const footerY = 50
    
    // Footer background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: footerY + 10,
      color: primaryColor
    })
    
    // Footer text
    drawText(page, 'Thank you for shopping with Silk Mart! * support@silkmartbd.com', margin + 50, footerY - 18, { font: regular, size: 10, color: white })
    
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
