// PDF Receipt Generation for Serverless Environments (Vercel)
// Uses PDF-lib instead of Puppeteer for serverless compatibility

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getOrderForReceipt } from './receipt'

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

// Format date for receipt
const formatDate = (date: Date) => 
  new Date(date).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })

// Parse variant info
const getVariant = (variantInfo: string | null | undefined): string => {
  if (!variantInfo) return '-'
  try {
    const v = JSON.parse(variantInfo)
    return `${v.size || ''}${v.color ? ' / ' + v.color : ''}` || '-'
  } catch { return '-' }
}

// Generate PDF receipt buffer - serverless compatible
export async function generateReceiptPDF(orderId: string): Promise<Buffer | null> {
  try {
    console.log('Generating PDF for order:', orderId)
    
    const order = await getOrderForReceipt(orderId)
    if (!order) {
      console.error('Order not found for PDF generation:', orderId)
      return null
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const { width, height } = page.getSize()
    
    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Colors
    const primaryColor = rgb(0.1, 0.2, 0.36) // #1a365d
    const textColor = rgb(0.2, 0.2, 0.2)
    const grayColor = rgb(0.5, 0.5, 0.5)
    const greenColor = rgb(0.09, 0.62, 0.35) // #16a34a
    
    let y = height - 50
    const margin = 50
    const contentWidth = width - (margin * 2)
    
    // Helper function to draw text
    const drawText = (text: string, x: number, yPos: number, options: {
      font?: typeof helvetica,
      size?: number,
      color?: typeof textColor,
      maxWidth?: number
    } = {}) => {
      const { font = helvetica, size = 10, color = textColor, maxWidth } = options
      page.drawText(text, {
        x,
        y: yPos,
        size,
        font,
        color,
        maxWidth
      })
    }
    
    // Header - Brand
    drawText('CTG COLLECTION', margin, y, { font: helveticaBold, size: 20, color: primaryColor })
    drawText('Premium Fashion & Lifestyle', margin, y - 18, { size: 9, color: grayColor })
    
    // Invoice number (right side)
    drawText('INVOICE', width - margin - 100, y, { font: helveticaBold, size: 10, color: grayColor })
    drawText(order.orderNumber, width - margin - 100, y - 14, { font: helveticaBold, size: 14, color: primaryColor })
    drawText(formatDate(order.createdAt), width - margin - 100, y - 28, { size: 9, color: grayColor })
    
    y -= 60
    
    // Divider line
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 2,
      color: primaryColor
    })
    
    y -= 30
    
    // Customer Info
    drawText('BILL TO', margin, y, { font: helveticaBold, size: 9, color: grayColor })
    y -= 14
    drawText(order.address.name, margin, y, { font: helveticaBold, size: 11, color: textColor })
    y -= 14
    drawText(order.user?.email || order.guestEmail || '', margin, y, { size: 10, color: grayColor })
    y -= 12
    drawText(order.address.phone, margin, y, { size: 10, color: grayColor })
    
    // Ship To (right side)
    let shipY = y + 40
    drawText('SHIP TO', width/2 + 20, shipY, { font: helveticaBold, size: 9, color: grayColor })
    shipY -= 14
    drawText(order.address.name, width/2 + 20, shipY, { font: helveticaBold, size: 11, color: textColor })
    shipY -= 14
    drawText(order.address.address, width/2 + 20, shipY, { size: 10, color: grayColor, maxWidth: 200 })
    shipY -= 12
    drawText(`${order.address.city}, ${order.address.district}`, width/2 + 20, shipY, { size: 10, color: grayColor })
    
    y -= 50
    
    // Items header
    page.drawRectangle({
      x: margin,
      y: y - 5,
      width: contentWidth,
      height: 20,
      color: rgb(0.96, 0.97, 0.98)
    })
    
    drawText('ITEM', margin + 10, y, { font: helveticaBold, size: 9, color: grayColor })
    drawText('QTY', margin + 300, y, { font: helveticaBold, size: 9, color: grayColor })
    drawText('PRICE', margin + 360, y, { font: helveticaBold, size: 9, color: grayColor })
    drawText('TOTAL', margin + 430, y, { font: helveticaBold, size: 9, color: grayColor })
    
    y -= 25
    
    // Items list
    for (const item of order.items) {
      // Item name
      drawText(item.product.name, margin + 10, y, { font: helveticaBold, size: 10, color: textColor })
      
      // Variant & Warranty
      const variant = getVariant(item.variantInfo)
      let variantText = variant
      if (item.product.hasWarranty) {
        variantText += ` • [W] ${item.product.warrantyPeriod || 'Warranty'}`
      }
      drawText(variantText, margin + 10, y - 12, { size: 8, color: grayColor })
      
      // Quantity
      drawText(item.quantity.toString(), margin + 300, y, { size: 10, color: textColor })
      
      // Price
      drawText(`BDT ${item.price.toLocaleString()}`, margin + 360, y, { size: 10, color: textColor })
      
      // Total
      drawText(`BDT ${(item.price * item.quantity).toLocaleString()}`, margin + 430, y, { font: helveticaBold, size: 10, color: textColor })
      
      y -= 35
      
      // Item divider
      page.drawLine({
        start: { x: margin, y: y + 15 },
        end: { x: width - margin, y: y + 15 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9)
      })
    }
    
    y -= 10
    
    // Totals section (right aligned box)
    const totalsX = width - margin - 200
    page.drawRectangle({
      x: totalsX - 10,
      y: y - 90,
      width: 210,
      height: 100,
      color: rgb(0.96, 0.97, 0.98)
    })
    
    drawText('Subtotal', totalsX, y, { size: 10, color: grayColor })
    drawText(`BDT ${order.subtotal.toLocaleString()}`, totalsX + 140, y, { size: 10, color: textColor })
    
    y -= 18
    drawText('Shipping', totalsX, y, { size: 10, color: grayColor })
    drawText(`BDT ${order.shippingCost.toLocaleString()}`, totalsX + 140, y, { size: 10, color: textColor })
    
    if (order.discount > 0) {
      y -= 18
      drawText(`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, totalsX, y, { size: 10, color: greenColor })
      drawText(`-BDT ${order.discount.toLocaleString()}`, totalsX + 140, y, { size: 10, color: greenColor })
    }
    
    y -= 25
    page.drawLine({
      start: { x: totalsX, y: y + 5 },
      end: { x: totalsX + 180, y: y + 5 },
      thickness: 1,
      color: primaryColor
    })
    
    drawText('TOTAL', totalsX, y - 5, { font: helveticaBold, size: 12, color: primaryColor })
    drawText(`BDT ${order.total.toLocaleString()}`, totalsX + 120, y - 5, { font: helveticaBold, size: 14, color: primaryColor })
    
    y -= 50
    
    // Payment info
    const paymentText = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
    const paymentStatus = order.paymentStatus === 'paid' ? '[OK] Paid' : 'Pending'
    drawText(`Payment: ${paymentText} • ${paymentStatus}`, margin, y, {
      font: helveticaBold,
      size: 10,
      color: order.paymentStatus === 'paid' ? greenColor : grayColor
    })
    
    y -= 30
    
    // Verification code
    if (order.verificationCode) {
      page.drawRectangle({
        x: margin,
        y: y - 15,
        width: 200,
        height: 35,
        color: rgb(0.96, 0.97, 0.98),
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1
      })
      drawText('Verification Code:', margin + 10, y + 5, { size: 9, color: grayColor })
      drawText(order.verificationCode, margin + 10, y - 10, { font: helveticaBold, size: 16, color: primaryColor })
    }
    
    // Footer
    const footerY = 40
    page.drawLine({
      start: { x: margin, y: footerY + 15 },
      end: { x: width - margin, y: footerY + 15 },
      thickness: 1,
      color: primaryColor
    })
    drawText('Thank you for shopping with CTG Collection! • ctgcollection2@gmail.com', margin, footerY, {
      size: 9,
      color: grayColor
    })
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()
    
    console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes')
    return Buffer.from(pdfBytes)
  } catch (error) {
    console.error('Error generating PDF:', error)
    return null
  }
}

// Alternative: Generate PDF from any HTML string
// Note: This is a simplified version - complex HTML won't render perfectly
export async function htmlToPDF(html: string): Promise<Buffer | null> {
  try {
    // For serverless, we can't render HTML to PDF directly without a headless browser
    // Instead, we return null and let the caller handle this case
    console.warn('htmlToPDF is not available in serverless environment')
    return null
  } catch (error) {
    console.error('Error converting HTML to PDF:', error)
    return null
  }
}
