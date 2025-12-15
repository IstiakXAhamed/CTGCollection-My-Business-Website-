'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setWishlist(data.wishlist || [])
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        setWishlist(wishlist.filter(item => item.productId !== productId))
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  if (loading) return <div className="text-center py-12">Loading wishlist...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {wishlist.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6">Save items you love to buy them later</p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition group">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/product/${item.product.slug}`} className="relative w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded group-hover:scale-110 transition"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`} className="font-semibold hover:text-blue-600 block truncate">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">{item.product.category.name}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(item.product.salePrice || item.product.basePrice)}
                      </span>
                      {item.product.salePrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(item.product.basePrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(item.productId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
