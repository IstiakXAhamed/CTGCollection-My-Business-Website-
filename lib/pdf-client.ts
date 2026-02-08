// Client-side PDF generation utility using html2canvas + jspdf
// This works on Vercel serverless and keeps the beautiful HTML templates

export async function generatePDFFromHTML(
  html: string,
  filename: string = 'receipt.pdf'
): Promise<Blob> {
  // Dynamic imports to reduce bundle size
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  // Create a temporary container
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '800px'
  container.style.background = 'white'
  document.body.appendChild(container)

  try {
    // Wait for images to load
    const images = container.querySelectorAll('img')
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(true)
            else {
              img.onload = () => resolve(true)
              img.onerror = () => resolve(true)
            }
          })
      )
    )

    // Capture as canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    })

    // Calculate PDF dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    )
    heightLeft -= pageHeight

    // Add more pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      )
      heightLeft -= pageHeight
    }

    // Return as blob
    return pdf.output('blob')
  } finally {
    // Cleanup
    document.body.removeChild(container)
  }
}

export async function downloadPDFFromHTML(
  html: string,
  filename: string = 'receipt.pdf'
): Promise<void> {
  const blob = await generatePDFFromHTML(html, filename)
  
  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function printHTMLReceipt(html: string): Promise<void> {
  // Open print dialog with the receipt
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}
