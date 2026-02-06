// PDF Generator - Local pdf-lib based (Free & Unlimited)
// Works on Vercel serverless

import { generateReceiptPDF } from './pdf-generator'

// Generate PDF using local pdf-lib (no cloud API needed)
export async function generateTemplatedPDF(orderId: string): Promise<Buffer | null> {
  try {
    console.log('=== LOCAL PDF GENERATION ===')
    console.log('Order ID:', orderId)
    
    // Use local pdf-lib generator directly (free & unlimited)
    const result = await generateReceiptPDF(orderId)
    console.log('PDF generated:', !!result, 'Size:', result?.length || 0, 'bytes')
    return result
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return null
  }
}
