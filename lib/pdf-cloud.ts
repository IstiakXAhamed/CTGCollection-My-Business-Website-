// PDF Generator using html2pdf.app cloud API
// This allows converting HTML templates to PDF on Vercel serverless
// Free tier: 100 PDFs/month

import { generateReceiptHTML, getOrderForReceipt } from './receipt'

const HTML2PDF_API_URL = 'https://api.html2pdf.app/v1/generate'
const HTML2PDF_API_KEY = process.env.HTML2PDF_API_KEY // Get free key from html2pdf.app

// Generate PDF from HTML template using cloud API
export async function generateTemplatedPDF(orderId: string): Promise<Buffer | null> {
  try {
    console.log('=== CLOUD PDF GENERATION ===')
    console.log('Order ID:', orderId)

    // If no API key configured, use local pdf-lib generator directly
    if (!HTML2PDF_API_KEY) {
      console.log('No HTML2PDF_API_KEY configured, using fallback pdf-lib generator')
      try {
        const { generateReceiptPDF } = await import('./pdf-generator')
        const result = await generateReceiptPDF(orderId)
        console.log('Fallback PDF result:', !!result, 'Size:', result?.length || 0)
        return result
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError)
        return null
      }
    }

    // Get order data
    const order = await getOrderForReceipt(orderId)
    if (!order) {
      console.error('Order not found for PDF generation:', orderId)
      // Still try fallback
      const { generateReceiptPDF } = await import('./pdf-generator')
      return generateReceiptPDF(orderId)
    }

    // Generate HTML using the SELECTED template from database
    const html = await generateReceiptHTML(order)
    console.log('Generated HTML length:', html.length)

    // Call html2pdf.app API
    const response = await fetch(HTML2PDF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HTML2PDF_API_KEY}`
      },
      body: JSON.stringify({
        html,
        format: 'A4',
        margin: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      })
    })

    if (!response.ok) {
      console.error('html2pdf.app API error:', response.status, response.statusText)
      // Fallback to local generator
      const { generateReceiptPDF } = await import('./pdf-generator')
      return generateReceiptPDF(orderId)
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer())
    console.log('PDF generated via cloud API, size:', pdfBuffer.length, 'bytes')
    return pdfBuffer

  } catch (error) {
    console.error('Cloud PDF generation error:', error)
    // Fallback to local generator
    try {
      console.log('Attempting fallback PDF generation...')
      const { generateReceiptPDF } = await import('./pdf-generator')
      const result = await generateReceiptPDF(orderId)
      console.log('Fallback result:', !!result)
      return result
    } catch (e) {
      console.error('Fallback PDF generation also failed:', e)
      return null
    }
  }
}

// Alternative: Use PDFShift API (250 free/month)
// https://pdfshift.io/
export async function generatePDFWithPDFShift(orderId: string): Promise<Buffer | null> {
  const PDFSHIFT_API_KEY = process.env.PDFSHIFT_API_KEY
  
  if (!PDFSHIFT_API_KEY) {
    console.log('No PDFSHIFT_API_KEY, using fallback')
    const { generateReceiptPDF } = await import('./pdf-generator')
    return generateReceiptPDF(orderId)
  }

  try {
    const order = await getOrderForReceipt(orderId)
    if (!order) return null

    const html = await generateReceiptHTML(order)

    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`api:${PDFSHIFT_API_KEY}`).toString('base64')}`
      },
      body: JSON.stringify({
        source: html,
        format: 'A4',
        margin: '10mm'
      })
    })

    if (!response.ok) {
      console.error('PDFShift API error:', response.status)
      const { generateReceiptPDF } = await import('./pdf-generator')
      return generateReceiptPDF(orderId)
    }

    return Buffer.from(await response.arrayBuffer())
  } catch (error) {
    console.error('PDFShift error:', error)
    const { generateReceiptPDF } = await import('./pdf-generator')
    return generateReceiptPDF(orderId)
  }
}
