'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=50')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast({
          title: 'Success!',
          description: `${productToDelete.name} deleted successfully`,
        })
        // Remove from list
        setProducts(products.filter(p => p.id !== productToDelete.id))
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete product',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the product',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const toggleFeatured = async (product: any) => {
    // Optimistic update - update UI FIRST for instant feedback
    const previousValue = product.isFeatured
    setProducts(products.map(p =>
      p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p
    ))

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          isFeatured: !previousValue,
          variants: product.variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku || ''
          }))
        }),
        credentials: 'include'
      })

      if (res.ok) {
        toast({
          title: 'Updated!',
          description: `Featured status ${!previousValue ? 'enabled' : 'disabled'}`,
        })
      } else {
        // Revert on error
        setProducts(products.map(p =>
          p.id === product.id ? { ...p, isFeatured: previousValue } : p
        ))
        toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
      }
    } catch (error) {
      // Revert on error
      setProducts(products.map(p =>
        p.id === product.id ? { ...p, isFeatured: previousValue } : p
      ))
      console.error('Failed to toggle featured:', error)
    }
  }

  const toggleActive = async (product: any) => {
    // Optimistic update - update UI FIRST for instant feedback
    const previousValue = product.isActive
    setProducts(products.map(p =>
      p.id === product.id ? { ...p, isActive: !p.isActive } : p
    ))

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          isActive: !previousValue,
          variants: product.variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku || ''
          }))
        }),
        credentials: 'include'
      })

      if (res.ok) {
        toast({
          title: 'Updated!',
          description: `Product ${!previousValue ? 'activated' : 'deactivated'}`,
        })
      } else {
        // Revert on error
        setProducts(products.map(p =>
          p.id === product.id ? { ...p, isActive: previousValue } : p
        ))
        toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
      }
    } catch (error) {
      // Revert on error
      setProducts(products.map(p =>
        p.id === product.id ? { ...p, isActive: previousValue } : p
      ))
      console.error('Failed to toggle active:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="text-center py-12">Loading products...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Products</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{products.length} total</p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-10 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-3">
                <div className="flex gap-3">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded flex-shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm truncate">{product.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{product.category?.name || '-'}</p>
                    <p className="font-semibold text-xs sm:text-sm text-blue-600 mt-1">
                      {formatPrice(product.salePrice || product.basePrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                      <Switch
                        checked={product.isFeatured}
                        onCheckedChange={() => toggleFeatured(product)}
                        className="scale-75"
                      />
                      <span>Featured</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={() => toggleActive(product)}
                        className="scale-75"
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 text-red-600"
                      onClick={() => {
                        setProductToDelete(product)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-center py-3 px-4">Featured</th>
                  <th className="text-center py-3 px-4">Active</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">#{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{product.category?.name}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold">{formatPrice(product.salePrice || product.basePrice)}</p>
                        {product.salePrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.basePrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.variants?.some((v: any) => v.stock > 0)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0} units
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Switch
                        checked={product.isFeatured}
                        onCheckedChange={() => toggleFeatured(product)}
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={() => toggleActive(product)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setProductToDelete(product)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{productToDelete?.name}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Product'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
