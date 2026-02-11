'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

// Base skeleton with shimmer (uses globals.css .skeleton class)
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "skeleton rounded-lg",
        className
      )}
    />
  )
}

// Product Card Skeleton
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
    >
      {/* Image skeleton */}
      <div className="relative aspect-square">
        <Skeleton className="absolute inset-0 rounded-none" />
        
        {/* Badge placeholders */}
        <div className="absolute top-2 left-2">
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <Skeleton className="w-11 h-11 rounded-full" />
          <Skeleton className="w-11 h-11 rounded-full" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-1">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-14 h-3" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </div>
    </motion.div>
  )
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} index={i} />
      ))}
    </div>
  )
}

// Stories Skeleton
export function StoriesSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div className="relative">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
          </div>
          <Skeleton className="w-12 h-3" />
        </motion.div>
      ))}
    </div>
  )
}

// Category Pills Skeleton
export function CategoryPillsSkeleton() {
  return (
    <div className="flex gap-2 px-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <Skeleton className="w-20 h-8 rounded-full" />
        </motion.div>
      ))}
    </div>
  )
}

// Banner Skeleton
export function BannerSkeleton() {
  return (
    <div className="px-4">
      <Skeleton className="w-full h-40 rounded-2xl" />
    </div>
  )
}

// Section Header Skeleton
export function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="space-y-1">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-24 h-3" />
      </div>
      <Skeleton className="w-16 h-8 rounded-full" />
    </div>
  )
}

// Search Bar Skeleton
export function SearchBarSkeleton() {
  return (
    <div className="px-4 py-2">
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  )
}

// Cart Item Skeleton
export function CartItemSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl"
    >
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-24 h-8 rounded-lg" />
        </div>
      </div>
    </motion.div>
  )
}

// Profile Header Skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="relative">
      {/* Cover */}
      <Skeleton className="w-full h-32 rounded-none" />
      
      {/* Avatar & Info */}
      <div className="px-4 -mt-12">
        <div className="flex items-end gap-4">
          <Skeleton className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-950" />
          <div className="pb-2 space-y-2 flex-1">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-around px-4 py-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="w-12 h-6 mx-auto" />
            <Skeleton className="w-16 h-3 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Order Card Skeleton
export function OrderCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-white dark:bg-gray-900 rounded-2xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-14 h-14 rounded-lg" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
    </motion.div>
  )
}

// Full Page Loading Skeleton
export function MobilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 space-y-4 pb-24">
      <StoriesSkeleton />
      <BannerSkeleton />
      <CategoryPillsSkeleton />
      <SectionHeaderSkeleton />
      <ProductGridSkeleton count={4} />
      <SectionHeaderSkeleton />
      <ProductGridSkeleton count={4} />
    </div>
  )
}

export default {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  StoriesSkeleton,
  CategoryPillsSkeleton,
  BannerSkeleton,
  SectionHeaderSkeleton,
  SearchBarSkeleton,
  CartItemSkeleton,
  ProfileHeaderSkeleton,
  OrderCardSkeleton,
  MobilePageSkeleton,
}
