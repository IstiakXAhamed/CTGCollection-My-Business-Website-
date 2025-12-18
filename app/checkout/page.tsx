'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, CheckCircle2, Loader2, ShoppingCart, AlertCircle, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { ALL_DISTRICTS, calculateShippingCost, isValidBDPhone, CTG_DISTRICTS } from '@/lib/bangladesh-data'
import { useCartStore } from '@/store/cart'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  size?: string
  color?: string
}

interface FormErrors {
  name?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  district?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingCart, setLoadingCart] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
  })

  // Get cart items from store directly
  const storeItems = useCartStore((state) => state.items)
  const hasHydrated = useCartStore((state) => state._hasHydrated)

  useEffect(() => {
    // Update local state when store hydrates or items change
    if (hasHydrated) {
      console.log('Checkout: cart hydrated with', storeItems.length, 'items')
      setCartItems(storeItems)
      setLoadingCart(false)
    }
  }, [storeItems, hasHydrated])

  useEffect(() => {
    loadUserInfo()
    // Fallback timeout in case hydration takes too long
    const timeout = setTimeout(() => {
      if (loadingCart) {
        setCartItems(useCartStore.getState().items)
        setLoadingCart(false)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [])

  const loadUserInfo = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setIsAuthenticated(true)
          setFormData(prev => ({
            ...prev,
            name: data.user.name || prev.name,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load user info:', error)
    }
  }

  // Calculate shipping based on district
  const shippingCost = useMemo(() => {
    return calculateShippingCost(formData.district)
  }, [formData.district])
  
  const isCTG = CTG_DISTRICTS.some(d => d.toLowerCase() === formData.district.toLowerCase())

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + shippingCost

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!isValidBDPhone(formData.phone)) {
      newErrors.phone = 'Enter valid BD phone (01XXXXXXXXX)'
    }

    if (!isAuthenticated && !formData.email.trim()) {
      newErrors.email = 'Email is required for guest checkout'
    } else if (!isAuthenticated && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please enter complete address'
    }

    if (!formData.district) {
      newErrors.district = 'Please select a district'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City/Upazila is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    setLoading(true)

    try {
      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          shippingDetails: formData,
          paymentMethod,
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            variantId: item.variantId || null,
            size: item.size,
            color: item.color
          })),
          total,
          subtotal,
          shippingCost,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        if (orderData.requiresAuth) {
          router.push('/login?redirect=/checkout')
          return
        }
        throw new Error(orderData.message || orderData.error || 'Failed to create order')
      }


      useCartStore.getState().clearCart()

      if (paymentMethod === 'cod') {
        router.push(`/order/success?orderId=${orderData.orderId || orderData.order?.id}`)
        return
      }

      // SSLCommerz payment
      if (paymentMethod === 'sslcommerz') {
        const paymentRes = await fetch('/api/payment/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            orderId: orderData.orderId || orderData.order?.id,
            amount: total,
            customerInfo: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
            }
          }),
        })

        const paymentData = await paymentRes.json()

        if (paymentData.success && paymentData.GatewayPageURL) {
          window.location.href = paymentData.GatewayPageURL
        } else {
          throw new Error(paymentData.message || 'Payment initialization failed')
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <ShoppingCart className="w-16 h-16 text-muted-foreground" />
        <p className="text-xl text-muted-foreground">Your cart is empty</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">{cartItems.length} items in your order</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email * (for order updates)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Input
                      id="address"
                      placeholder="House No, Street, Area/Village"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <select
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.district ? 'border-red-500' : 'border-gray-200'}`}
                      >
                        <option value="">Select District</option>
                        {ALL_DISTRICTS.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                      {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Upazila *</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Agrabad"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="e.g. 4000"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Shipping Info Banner */}
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${isCTG ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <Truck className={`w-5 h-5 ${isCTG ? 'text-green-600' : 'text-blue-600'}`} />
                    <div>
                      <p className={`font-medium ${isCTG ? 'text-green-700' : 'text-blue-700'}`}>
                        {formData.district ? (
                          isCTG ? 'Chittagong Division - ৳80 Shipping' : 'Outside Chittagong - ৳130 Shipping'
                        ) : (
                          'Select district to see shipping cost'
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Delivery within 3-5 business days
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="sslcommerz" id="sslcommerz" />
                    <Label htmlFor="sslcommerz" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Online Payment (SSL Commerz)</div>
                      <div className="text-sm text-muted-foreground">
                        Pay with bKash, Nagad, Cards, or Banking
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">
                        Pay when you receive the product
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex-1">
                        {item.name} × {item.quantity}
                        {(item.size || item.color) && (
                          <span className="text-xs block">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' · '}
                            {item.color && `Color: ${item.color}`}
                          </span>
                        )}
                      </span>
                      <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Shipping
                      {formData.district && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isCTG ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isCTG ? 'CTG' : 'Outside'}
                        </span>
                      )}
                    </span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/cart">← Back to Cart</Link>
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
