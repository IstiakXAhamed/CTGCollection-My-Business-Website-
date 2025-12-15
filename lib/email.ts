import nodemailer from 'nodemailer'

// Email configuration - update these in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

interface OrderEmailData {
  to: string
  orderNumber: string
  customerName: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  address: string
  paymentMethod: string
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price.toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .order-number { background: #f7f7f7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .order-number span { font-size: 24px; font-weight: bold; color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f7f7f7; padding: 12px; text-align: left; }
        .totals { background: #f7f7f7; padding: 15px; border-radius: 8px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-final { font-size: 20px; font-weight: bold; color: #667eea; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for shopping with CTG Collection</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order has been confirmed and is being processed.</p>
          
          <div class="order-number">
            <p style="margin: 0; color: #666;">Order Number</p>
            <span>${data.orderNumber}</span>
          </div>
          
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>৳${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Shipping:</span>
              <span>৳${data.shipping.toFixed(2)}</span>
            </div>
            ${data.discount > 0 ? `
            <div class="totals-row" style="color: green;">
              <span>Discount:</span>
              <span>-৳${data.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="totals-row total-final">
              <span>Total:</span>
              <span>৳${data.total.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>Delivery Address</h3>
          <p style="background: #f7f7f7; padding: 15px; border-radius: 8px;">${data.address}</p>
          
          <h3>Payment Method</h3>
          <p>${data.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Paid Online'}</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/orders" class="button">
              View Your Orders
            </a>
          </center>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us at ctgcollection2@gmail.com</p>
          <p>© ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER || 'noreply@ctgcollection.com'}>`,
      to: data.to,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html
    })
    console.log(`Order confirmation email sent to ${data.to}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export async function sendShippingNotification(to: string, orderNumber: string, trackingNumber: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .tracking { background: #f7f7f7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #11998e; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <p>Great news! Order <strong>${orderNumber}</strong> is on its way to you.</p>
          
          <div class="tracking">
            <p style="margin: 0 0 10px; color: #666;">Tracking Number</p>
            <div class="tracking-number">${trackingNumber}</div>
          </div>
          
          <p>You can track your package using the tracking number above.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER || 'noreply@ctgcollection.com'}>`,
      to,
      subject: `Your Order Has Shipped - ${orderNumber}`,
      html
    })
    return true
  } catch (error) {
    console.error('Failed to send shipping email:', error)
    return false
  }
}

// Send receipt email with HTML file attachment
interface ReceiptEmailData {
  to: string
  orderNumber: string
  customerName: string
  receiptPath?: string  // Path to receipt HTML file
  receiptHtml?: string  // Or raw HTML content
}

export async function sendReceiptEmail(data: ReceiptEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧾 Your Receipt is Ready!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Thank you for your purchase! Your payment has been confirmed.</p>
          <p>Please find your receipt attached to this email. You can also download it from your dashboard.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-weight: bold; color: #166534;">Order: ${data.orderNumber}</p>
            <p style="margin: 5px 0 0; color: #15803d;">✓ Payment Confirmed</p>
          </div>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/orders" class="button">
              View Order Details
            </a>
          </center>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>Questions? Contact us at ctgcollection2@gmail.com</p>
          <p>© ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const attachments: any[] = []
  
  // Add receipt as attachment if path provided
  if (data.receiptPath) {
    const fs = require('fs')
    const path = require('path')
    // Remove leading slash if present
    const cleanPath = data.receiptPath.startsWith('/') ? data.receiptPath.slice(1) : data.receiptPath
    const fullPath = path.join(process.cwd(), 'public', cleanPath)
    
    console.log('Attempting to attach receipt from:', fullPath)
    
    if (fs.existsSync(fullPath)) {
      const fileContent = fs.readFileSync(fullPath, 'utf8')
      attachments.push({
        filename: `Receipt-${data.orderNumber}.html`,
        content: fileContent,
        contentType: 'text/html'
      })
      console.log('Receipt file attached successfully')
    } else {
      console.log('Receipt file not found at path:', fullPath)
      // Fallback to HTML content if path file not found
      if (data.receiptHtml) {
        attachments.push({
          filename: `Receipt-${data.orderNumber}.html`,
          content: data.receiptHtml,
          contentType: 'text/html'
        })
        console.log('Using receipt HTML content as fallback')
      }
    }
  } else if (data.receiptHtml) {
    attachments.push({
      filename: `Receipt-${data.orderNumber}.html`,
      content: data.receiptHtml,
      contentType: 'text/html'
    })
    console.log('Using receipt HTML content directly')
  }

  console.log('Total attachments:', attachments.length)

  try {
    await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER || 'noreply@ctgcollection.com'}>`,
      to: data.to,
      subject: `Your Receipt - Order ${data.orderNumber}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined
    })
    console.log(`Receipt email sent to ${data.to} with ${attachments.length} attachment(s)`)
    return true
  } catch (error) {
    console.error('Failed to send receipt email:', error)
    return false
  }
}

// Generic email with attachments (for admin marketing emails)
interface GenericEmailData {
  to: string | string[]
  subject: string
  html: string
  attachments?: {
    filename: string
    content?: string | Buffer
    path?: string
    contentType?: string
  }[]
}

export async function sendEmailWithAttachments(data: GenericEmailData) {
  try {
    const recipients = Array.isArray(data.to) ? data.to.join(', ') : data.to
    
    await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER || 'noreply@ctgcollection.com'}>`,
      to: recipients,
      subject: data.subject,
      html: data.html,
      attachments: data.attachments || []
    })
    
    return true
  } catch (error) {
    console.error('Failed to send email with attachments:', error)
    return false
  }
}

// Send Order Confirmation with PDF Receipt Attachment
// This is the main function that sends BOTH order details AND PDF receipt
interface OrderConfirmationWithPDFData {
  to: string
  orderNumber: string
  customerName: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  address: string
  paymentMethod: string
  pdfBuffer?: Buffer  // PDF receipt as buffer
}

export async function sendOrderConfirmationWithPDF(data: OrderConfirmationWithPDFData): Promise<boolean> {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price.toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .order-number { background: #f7f7f7; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .order-number span { font-size: 24px; font-weight: bold; color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f7f7f7; padding: 12px; text-align: left; }
        .totals { background: #f7f7f7; padding: 15px; border-radius: 8px; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .total-final { font-size: 20px; font-weight: bold; color: #667eea; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .pdf-notice { background: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .pdf-notice p { margin: 0; color: #2e7d32; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for shopping with CTG Collection</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order has been confirmed and is being processed.</p>
          
          <div class="pdf-notice">
            <p>📎 <strong>Your PDF Receipt is attached to this email!</strong></p>
          </div>
          
          <div class="order-number">
            <p style="margin: 0; color: #666;">Order Number</p>
            <span>${data.orderNumber}</span>
          </div>
          
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>৳${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Shipping:</span>
              <span>৳${data.shipping.toFixed(2)}</span>
            </div>
            ${data.discount > 0 ? `
            <div class="totals-row" style="color: green;">
              <span>Discount:</span>
              <span>-৳${data.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="totals-row total-final">
              <span>Total:</span>
              <span>৳${data.total.toFixed(2)}</span>
            </div>
          </div>
          
          <h3>Delivery Address</h3>
          <p style="background: #f7f7f7; padding: 15px; border-radius: 8px;">${data.address}</p>
          
          <h3>Payment Method</h3>
          <p>${data.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Paid Online'}</p>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/orders" class="button">
              View Your Orders
            </a>
          </center>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us at ctgcollection2@gmail.com</p>
          <p>© ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Prepare attachments
  const attachments: any[] = []
  if (data.pdfBuffer) {
    attachments.push({
      filename: `Receipt-${data.orderNumber}.pdf`,
      content: data.pdfBuffer,
      contentType: 'application/pdf'
    })
    console.log('PDF attachment added, size:', data.pdfBuffer.length, 'bytes')
  }

  try {
    await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER || 'noreply@ctgcollection.com'}>`,
      to: data.to,
      subject: `Order Confirmed - ${data.orderNumber} 📎 Receipt Attached`,
      html,
      attachments
    })
    console.log(`Order confirmation with PDF sent to ${data.to}, attachments: ${attachments.length}`)
    return true
  } catch (error) {
    console.error('Failed to send order confirmation with PDF:', error)
    return false
  }
}
