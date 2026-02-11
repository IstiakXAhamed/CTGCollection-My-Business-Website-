'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  }

  const style: React.CSSProperties = {
    width: width,
    height: height || (variant === 'text' ? '1rem' : undefined),
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        className
      )}
      style={style}
      {...props}
    />
  )
}

// Preset skeleton components for common patterns

export function SkeletonCard() {
  return (
    <div className="border rounded-xl p-4 space-y-4">
      <Skeleton variant="rectangular" width="100%" height={160} />
      <div className="space-y-2">
        <Skeleton width="80%" height={20} />
        <Skeleton width="60%" height={16} />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton width="40%" height={24} />
        <Skeleton variant="circular" width={36} height={36} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height={20} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} width={`${100 / cols}%`} height={16} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="space-y-2 flex-1">
        <Skeleton width="40%" height={20} />
        <Skeleton width="60%" height={16} />
      </div>
    </div>
  )
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton variant="rectangular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 border rounded-xl space-y-3">
          <Skeleton width="40%" height={16} />
          <Skeleton width="60%" height={32} />
          <Skeleton width="30%" height={12} />
        </div>
      ))}
    </div>
  )
}
