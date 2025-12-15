// PDF Receipt Generation using Puppeteer
// Converts the beautiful HTML receipt to exact PDF copy

import puppeteer from 'puppeteer'
import { generateReceiptHTML, getOrderForReceipt } from './receipt'

// Generate PDF receipt buffer - exact match of HTML receipt
export async function generateReceiptPDF(orderId: string): Promise<Buffer | null> {
  try {
    console.log('Generating PDF for order:', orderId)
    
    const order = await getOrderForReceipt(orderId)
    if (!order) {
      console.error('Order not found for PDF generation:', orderId)
      return null
    }

    // Get the beautiful HTML receipt
    const html = generateReceiptHTML(order)
    console.log('HTML receipt generated, length:', html.length)
    
    // Launch puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    console.log('Browser launched')
    
    const page = await browser.newPage()
    
    // Set viewport for A4-like sizing
    await page.setViewport({ width: 800, height: 1200 })
    
    // Set content and wait for it to load completely
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    console.log('HTML content set')
    
    // Generate PDF with exact styling
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()
    
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('Error generating PDF:', error)
    return null
  }
}

// Alternative: Generate PDF from any HTML string
export async function htmlToPDF(html: string): Promise<Buffer | null> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    })
    
    await browser.close()
    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('Error converting HTML to PDF:', error)
    return null
  }
}
