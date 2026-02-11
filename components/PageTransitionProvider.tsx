'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useRef, useEffect, useState } from 'react'

interface PageTransitionProviderProps {
  children: ReactNode
}

// Route depth for direction detection (deeper = forward, shallower = back)
const getRouteDepth = (path: string): number => {
  return path.split('/').filter(Boolean).length
}

export default function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)
  const [direction, setDirection] = useState<1 | -1>(1) // 1 = forward, -1 = back
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Determine navigation direction on route change
  useEffect(() => {
    if (pathname === prevPathRef.current) return

    const prevDepth = getRouteDepth(prevPathRef.current)
    const currDepth = getRouteDepth(pathname)

    // Deeper route = forward, shallower = back, same depth = forward
    setDirection(currDepth >= prevDepth ? 1 : -1)
    prevPathRef.current = pathname
  }, [pathname])

  // Skip animations entirely for reduced motion
  if (prefersReducedMotion) {
    return (
      <div className="w-full flex-grow flex flex-col">
        {children}
      </div>
    )
  }

  const slideDistance = 30

  const variants = {
    initial: {
      opacity: 0,
      x: direction * slideDistance, // Forward: slide in from right, Back: from left
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: direction * -slideDistance, // Forward: exit to left, Back: exit to right
    },
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{
          type: 'tween',
          ease: [0.25, 0.1, 0.25, 1], // cubic-bezier - smooth native feel
          duration: 0.2,
        }}
        className="w-full flex-grow flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
