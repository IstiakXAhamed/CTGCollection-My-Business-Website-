// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  salePrice: number | null
  images: string | string[]
  categoryId: string
  category?: {
    name: string
    slug: string
  }
  variants?: ProductVariant[]
  reviews?: Review[]
  isFeatured: boolean
  isBestseller: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ProductVariant {
  id: string
  productId: string
  size: string | null
  color: string | null
  stock: number
  sku: string | null
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: Date | string
  user?: {
    name: string
    email?: string
  }
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
}

// User Types
export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  phone?: string | null
}

// Cart Types
export interface CartItem {
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

// Order Types
export interface Order {
  id: string
  userId: string
  total: number
  status: string
  paymentMethod: string
  createdAt: Date | string
}
