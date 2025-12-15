'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface ProductTabsProps {
  product: any
  specifications: Record<string, string>
}

export function ProductTabs({ product, specifications }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping & Returns' },
    { id: 'reviews', label: `Reviews (${product.reviews?.length || 0})` }
  ]

  return (
    <Card>
      <CardContent className="p-6">
        {/* Tab Navigation */}
        <div className="border-b mb-6">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm font-semibold mb-1">Category</p>
                  <p className="text-muted-foreground">{product.category?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Availability</p>
                  <p className="text-green-600 font-semibold">In Stock</p>
                </div>
                {product.variants?.[0]?.sku && (
                  <div>
                    <p className="text-sm font-semibold mb-1">SKU</p>
                    <p className="text-muted-foreground font-mono text-sm">
                      {product.variants[0].sku}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <table className="w-full">
                <tbody>
                  {Object.entries(specifications).map(([key, value]) => (
                    <tr key={key} className="border-b last:border-0">
                      <td className="py-3 font-semibold text-sm w-1/3">{key}</td>
                      <td className="py-3 text-muted-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">🚚 Shipping Information</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Free shipping on orders over BDT 2,000</li>
                  <li>• Standard delivery: 3-5 business days</li>
                  <li>• Express delivery available in Dhaka (1-2 days)</li>
                  <li>• Cash on Delivery (COD) available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">↩️ Returns & Exchange</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• 7-day easy return policy</li>
                  <li>• Products must be unused and in original packaging</li>
                  <li>• Free return pickup available</li>
                  <li>• Refund processed within 5-7 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✓ Authenticity Guarantee</h4>
                <p className="text-muted-foreground text-sm">
                  All products are 100% authentic and sourced directly from authorized distributors.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="text-center text-muted-foreground">
                  <p>Reviews are displayed below the product details</p>
                  <button
                    onClick={() => {
                      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-blue-600 hover:underline mt-2"
                  >
                    Jump to Reviews →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground mb-2">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
