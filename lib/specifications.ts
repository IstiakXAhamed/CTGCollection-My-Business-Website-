// Generate dynamic product specifications based on category
export function generateSpecifications(product: any): Record<string, string> {
  const categoryName = product.category?.name?.toLowerCase() || ''
  const specs: Record<string, string> = {}

  // Common specs for all products
  if (product.variants?.[0]?.sku) {
    specs['Product Code'] = product.variants[0].sku
  }

  // Category-specific specifications
  if (categoryName.includes('fashion') || categoryName.includes('clothing')) {
    specs['Material'] = 'Premium Cotton Blend'
    specs['Care Instructions'] = 'Machine wash cold, tumble dry low'
    specs['Fit'] = 'Regular Fit'
    specs['Country of Origin'] = 'Bangladesh'
    
    if (product.variants?.length > 0) {
      const sizes = product.variants.map((v: any) => v.size).filter(Boolean)
      if (sizes.length > 0) {
        specs['Available Sizes'] = Array.from(new Set(sizes)).join(', ')
      }
      const colors = product.variants.map((v: any) => v.color).filter(Boolean)
      if (colors.length > 0) {
        specs['Available Colors'] = Array.from(new Set(colors)).join(', ')
      }
    }
  } else if (categoryName.includes('electronics') || categoryName.includes('games')) {
    specs['Brand'] = 'Premium Brand'
    specs['Warranty'] = '1 Year Manufacturer Warranty'
    specs['Package Contents'] = 'Product, User Manual, Warranty Card'
    specs['Country of Origin'] = 'International'
    
    if (product.name.toLowerCase().includes('game')) {
      specs['Platform'] = 'Multi-Platform'
      specs['Genre'] = 'Action/Adventure'
      specs['Rating'] = 'PEGI 18+'
      specs['Language'] = 'English, Subtitles Available'
    } else if (product.name.toLowerCase().includes('headphone') || product.name.toLowerCase().includes('phone')) {
      specs['Connectivity'] = 'Bluetooth 5.0 / Wired'
      specs['Battery Life'] = 'Up to 40 hours'
      specs['Charging Time'] = '2-3 hours'
    }
  } else if (categoryName.includes('beauty') || categoryName.includes('perfume')) {
    specs['Type'] = 'Eau de Parfum'
    specs['Fragrance Family'] = 'Floral & Woody'
    specs['Top Notes'] = 'Citrus, Bergamot'
    specs['Heart Notes'] = 'Rose, Jasmine'
    specs['Base Notes'] = 'Sandalwood, Musk'
    specs['Longevity'] = '6-8 hours'
    specs['Sillage'] = 'Moderate to Strong'
    
    if (product.variants?.length > 0) {
      const sizes = product.variants.map((v: any) => v.size).filter(Boolean)
      if (sizes.length > 0) {
        specs['Available Sizes'] = sizes.join(', ')
      }
    }
  } else if (categoryName.includes('home')) {
    specs['Material'] = 'High-Quality Materials'
    specs['Dimensions'] = 'Standard Size'
    specs['Care Instructions'] = 'Easy to clean and maintain'
    specs['Country of Origin'] = 'Bangladesh'
  }

  // Fallback specs if category not matched
  if (Object.keys(specs).length === 0 || Object.keys(specs).length === 1) {
    specs['Quality'] = 'Premium Quality'
    specs['Condition'] = 'Brand New'
    specs['Packaging'] = 'Original Packaging'
    specs['Authenticity'] = '100% Authentic'
  }

  return specs
}
