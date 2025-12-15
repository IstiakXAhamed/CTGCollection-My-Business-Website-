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
          <h1>Order Confirmed</h1>
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
          <p><span style="display:inline-block; width:10px; height:10px; background-color:${data.paymentMethod === 'cod' ? '#f59e0b' : '#10b981'}; border-radius:50%; margin-right:5px; vertical-align:middle;"></span>${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
          
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
          <h1>Your Order Has Shipped</h1>
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
          <h1>Your Receipt is Ready</h1>
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
          <h1>Order Confirmed</h1>
          <p>Thank you for shopping with CTG Collection</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order has been confirmed and is being processed.</p>
          
          <div class="pdf-notice">
            <p><strong>Your PDF Receipt is attached to this email</strong></p>
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
          <p><span style="display:inline-block; width:10px; height:10px; background-color:${data.paymentMethod === 'cod' ? '#f59e0b' : '#10b981'}; border-radius:50%; margin-right:5px; vertical-align:middle;"></span>${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
          
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

// Send generic order status update email
export async function sendOrderStatusUpdate(to: string, data: { 
  orderNumber: string, 
  customerName: string, 
  status: string,
  message?: string
}) {
  const statusColors: Record<string, string> = {
    'processing': '#3b82f6', // blue
    'shipped': '#8b5cf6',    // purple
    'delivered': '#10b981',  // green
    'cancelled': '#ef4444',  // red
    'pending': '#f59e0b',    // amber
    'confirmed': '#10b981',  // green
  }

  const statusMessages: Record<string, { subject: string, title: string, body: string }> = {
    'processing': {
      subject: `Order #${data.orderNumber} is Processing`,
      title: 'Order Processing',
      body: 'Your order is being processed and will be shipped soon.'
    },
    'shipped': {
      subject: `Order #${data.orderNumber} has Shipped!`,
      title: 'Order Shipped',
      body: 'Great news! Your order is on its way.'
    },
    'delivered': {
      subject: `Order #${data.orderNumber} Delivered`,
      title: 'Order Delivered',
      body: 'Your order has been delivered. We hope you enjoy your purchase!'
    },
    'cancelled': {
      subject: `Order #${data.orderNumber} Cancelled`,
      title: 'Order Cancelled',
      body: 'Your order has been cancelled.'
    },
    'confirmed': {
      subject: `Order #${data.orderNumber} Confirmed`,
      title: 'Order Confirmed',
      body: 'Your order has been confirmed and we are preparing it.'
    },
    'pending': {
      subject: `Order #${data.orderNumber} Pending`,
      title: 'Order Pending',
      body: 'Your order is currently pending.'
    }
  }

  const statusInfo = statusMessages[data.status] || {
    subject: `Order #${data.orderNumber} Update`,
    title: 'Order Update',
    body: `Your order status has been updated to ${data.status}.`
  }

  const color = statusColors[data.status] || '#666666'
  
  const additionalMessage = data.message ? `
    <div style="background-color: #f8f9fa; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #555;"><strong>Note from Admin:</strong></p>
      <p style="margin: 5px 0 0 0;">${data.message}</p>
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 5px 15px; background: ${color}20; color: ${color}; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body style="background-color: #f5f5f5;">
      <div class="container">
        <div class="header">
          <h1 style="margin:0;">${statusInfo.title}</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <div style="text-align: center;">
            <div class="status-badge">${data.status.toUpperCase()}</div>
          </div>
          <p>${statusInfo.body}</p>
          
          ${additionalMessage}
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" class="button">View Order</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: statusInfo.subject,
      html
    })
    console.log('Order status email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Send Tier Update Email
export async function sendTierUpdateEmail(to: string, data: { 
  customerName: string, 
  tierName: string,
  benefits?: string[]
}) {
  const tierStyles: Record<string, string> = {
    'Bronze': 'background: linear-gradient(135deg, #df8944 0%, #a0522d 100%); box-shadow: 0 4px 6px -1px rgba(160, 82, 45, 0.4);',
    'Silver': 'background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%); box-shadow: 0 4px 6px -1px rgba(156, 163, 175, 0.4); color: #374151;',
    'Gold': 'background: linear-gradient(135deg, #fbbf24 0%, #b45309 100%); box-shadow: 0 4px 6px -1px rgba(180, 83, 9, 0.4);',
    'Platinum': 'background: linear-gradient(135deg, #e0e7ff 0%, #6366f1 100%); box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);'
  }
  
  const headerStyle = tierStyles[data.tierName] || 'background: linear-gradient(135deg, #3b82f6, #1d4ed8);'
  const buttonColor = data.tierName === 'Bronze' ? '#a0522d' : data.tierName === 'Silver' ? '#4b5563' : data.tierName === 'Gold' ? '#b45309' : '#4338ca'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { ${headerStyle} color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px; }
        .tier-badge { display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin: 10px 0; backdrop-filter: blur(5px); }
        .button { display: inline-block; padding: 12px 24px; background: ${buttonColor}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
        .benefits { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: left; }
        .benefits h3 { margin-top: 0; }
        .benefits ul { padding-left: 20px; }
        .benefits li { margin-bottom: 5px; }
      </style>
    </head>
    <body style="background-color: #f5f5f5;">
      <div class="container">
        <div class="header">
          <h1>Congratulations!</h1>
          <p>You've reached a new level</p>
          <div class="tier-badge">${data.tierName} Member</div>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>We are thrilled to inform you that your membership status has been upgraded to <strong>${data.tierName}</strong>!</p>
          
          <p>This exclusive status unlocks new privileges designed just for you.</p>
          
          ${data.benefits && data.benefits.length > 0 ? `
          <div class="benefits">
            <h3>Your ${data.tierName} Benefits:</h3>
            <ul>
              ${data.benefits.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View My Benefits</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: `Welcome to ${data.tierName} Membership!`,
      html
    })
    console.log('Tier update email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Send Loyalty/Referral Update Email
export async function sendLoyaltyUpdateEmail(to: string, data: { 
  customerName: string, 
  type: 'Referral Bonus' | 'Loyalty Bonus' | 'Points Earned' | 'Redemption',
  points: number,
  message?: string
}) {
  const isPositive = data.points > 0
  const color = isPositive ? '#10b981' : '#f59e0b' // Green for earn, Amber for spend

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px; }
        .points-badge { font-size: 32px; font-weight: bold; margin: 10px 0; color: ${color}; }
        .button { display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body style="background-color: #f5f5f5;">
      <div class="container">
        <div class="header">
          <h1 style="margin:0;">${data.type}</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <div style="text-align: center;">
            <div class="points-badge">${isPositive ? '+' : ''}${data.points} Points</div>
            <p style="font-size: 18px; font-weight: 500;">${data.message || (isPositive ? 'Added to your wallet!' : 'Redeemed from your wallet')}</p>
          </div>
          
          <p>Use your points to get discounts on your next purchase!</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/loyalty" class="button">Check Balance</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: `You got ${data.points} points! - ${data.type}`,
      html
    })
    console.log('Loyalty email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// ============= ACCOUNT STATUS EMAILS =============

// Send Role Change Email
export async function sendRoleChangeEmail(to: string, data: { 
  customerName: string, 
  oldRole: string,
  newRole: string
}) {
  const roleLabels: Record<string, string> = {
    customer: 'Customer',
    seller: 'Seller',
    admin: 'Admin',
    superadmin: 'Super Admin'
  }
  
  const newRoleLabel = roleLabels[data.newRole] || data.newRole
  const isPromotion = ['admin', 'seller', 'superadmin'].includes(data.newRole) && data.oldRole === 'customer'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${isPromotion ? '#10b981' : '#6366f1'} 0%, ${isPromotion ? '#059669' : '#4f46e5'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .role-badge { display: inline-block; background: ${isPromotion ? '#dcfce7' : '#e0e7ff'}; color: ${isPromotion ? '#166534' : '#4338ca'}; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isPromotion ? 'Congratulations!' : 'Account Update'}</h1>
          <p>${isPromotion ? 'You have been promoted!' : 'Your role has changed'}</p>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          ${isPromotion 
            ? `<p>We are thrilled to inform you that you have been <strong>promoted</strong> to a new role on CTG Collection!</p>`
            : `<p>Your account role has been updated.</p>`
          }
          
          <div style="text-align: center;">
            <p>Your new role:</p>
            <span class="role-badge">${newRoleLabel}</span>
          </div>
          
          ${isPromotion ? `
            <p>As a ${newRoleLabel}, you now have access to additional features and responsibilities. We trust you will continue to be an excellent member of our team!</p>
          ` : ''}
          
          <p>If you have any questions about your new role, please don't hesitate to contact us.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for being part of CTG Collection!</p>
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: isPromotion ? `Congratulations! You've been promoted to ${newRoleLabel}` : `Your account role has been updated`,
      html
    })
    console.log('Role change email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Send Account Deactivation Email
export async function sendAccountDeactivatedEmail(to: string, customerName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Temporarily Deactivated</h1>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>We regret to inform you that your account on CTG Collection has been temporarily deactivated.</p>
          <p>This may have occurred due to:</p>
          <ul>
            <li>A review of account activity</li>
            <li>Administrative action</li>
            <li>Your request</li>
          </ul>
          <p>If you believe this was done in error or would like to discuss reactivating your account, please contact our support team.</p>
          <p>We value your membership and hope to welcome you back soon.</p>
        </div>
        <div class="footer">
          <p>Need help? Contact us at support@ctgcollection.com</p>
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your CTG Collection Account Has Been Deactivated',
      html
    })
    console.log('Deactivation email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Send Account Reactivation Email
export async function sendAccountReactivatedEmail(to: string, customerName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome Back!</h1>
          <p>Your account has been reactivated</p>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>Great news! Your account on CTG Collection has been reactivated. You can now log in and access all features.</p>
          <p>We're happy to have you back!</p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Log In Now</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome Back! Your CTG Collection Account is Reactivated',
      html
    })
    console.log('Reactivation email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Send Account Deleted Email
export async function sendAccountDeletedEmail(to: string, customerName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Removed</h1>
        </div>
        <div class="content">
          <p>Dear ${customerName},</p>
          <p>We're writing to confirm that your account on CTG Collection has been removed from our system.</p>
          <p>All your personal data has been deleted in accordance with our privacy policy.</p>
          <p>If you did not request this action or believe this was done in error, please contact our support team immediately.</p>
          <p>We're sorry to see you go. If you ever wish to return, you're always welcome to create a new account.</p>
          <p>Thank you for having been part of our community.</p>
        </div>
        <div class="footer">
          <p>Questions? Contact us at support@ctgcollection.com</p>
          <p>&copy; ${new Date().getFullYear()} CTG Collection. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"CTG Collection" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your CTG Collection Account Has Been Removed',
      html
    })
    console.log('Account deleted email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

