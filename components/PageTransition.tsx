'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

// Smooth page transition with slide and fade effects
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayPathname, setDisplayPathname] = useState(pathname)

  useEffect(() => {
    if (pathname !== displayPathname) {
      // Trigger exit animation before changing content
      setDisplayPathname(pathname)
    }
  }, [pathname, displayPathname])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayPathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Staggered children animation container
interface StaggeredListProps {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}

export function StaggeredList({ 
  children, 
  staggerDelay = 0.05,
  className = "" 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

// Hover scale card effect
interface HoverCardProps {
  children: React.ReactNode
  className?: string
  scale?: number
}

export function HoverCard({ 
  children, 
  className = "",
  scale = 1.02 
}: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated counter component
interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 1000,
  className = ""
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const steps = 30
    const increment = value / steps
    const stepDuration = duration / steps
    let current = 0
    let timer: NodeJS.Timeout

    const updateCounter = () => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }

    timer = setInterval(updateCounter, stepDuration)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span className={className}>{displayValue.toLocaleString()}</span>
}

// Pulse animation for new items
interface PulseBadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

export function PulseBadge({ 
  children, 
  color = 'blue' 
}: PulseBadgeProps) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <div className="relative inline-flex">
      <motion.span
        animate={{ 
          boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 6px rgba(59, 130, 246, 0)', '0 0 0 0 rgba(59, 130, 246, 0)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${colors[color]}`}
      >
        {children}
      </motion.span>
    </div>
  )
}

// Shimmer loading effect
interface ShimmerProps {
  className?: string
}

export function Shimmer({ className = "" }: ShimmerProps) {
  return (
    <motion.div
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] rounded ${className}`}
    />
  )
}

// Glowing button effect
interface GlowButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  color?: string
}

export function GlowButton({ 
  children, 
  onClick,
  className = "",
  color = "#3b82f6"
}: GlowButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.span
        animate={{
          boxShadow: [`0 0 5px ${color}`, `0 0 20px ${color}`, `0 0 5px ${color}`]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-lg"
        style={{ boxShadow: `0 0 20px ${color}40` }}
      />
      {children}
    </motion.button>
  )
}

// Fade in on scroll reveal
interface RevealOnScrollProps {
  children: React.ReactNode
  threshold?: number
  className?: string
}

export function RevealOnScroll({ 
  children, 
  threshold = 0.1,
  className = ""
}: RevealOnScrollProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Skeleton loading component
interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function SkeletonLoader({ 
  className = "",
  variant = 'rectangular'
}: SkeletonLoaderProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`bg-gray-200 dark:bg-gray-700 ${variants[variant]} ${className}`}
    />
  )
}

export default {
  PageTransition,
  StaggeredList,
  HoverCard,
  AnimatedCounter,
  PulseBadge,
  Shimmer,
  GlowButton,
  RevealOnScroll,
  SkeletonLoader
}
