'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProviderProps {
  children: ReactNode
}

export default function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname()

  // Define transition variants
  const variants = {
    initial: {
      opacity: 0,
      x: 20,
      filter: 'blur(5px)'
    },
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)'
    },
    exit: {
      opacity: 0,
      x: -20,
      filter: 'blur(5px)'
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.3
        }}
        className="w-full flex-grow flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
