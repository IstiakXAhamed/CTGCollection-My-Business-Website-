'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Sparkles } from 'lucide-react'

interface FloatingActionsProps {
  onSpinClick?: () => void
}

export function FloatingActions({ onSpinClick }: FloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasSpinAvailable, setHasSpinAvailable] = useState(false)
  const [showSpinModal, setShowSpinModal] = useState(false)

  // Check if spin is available (not used recently)
  useEffect(() => {
    const checkSpinAvailability = () => {
      const lastSpin = localStorage.getItem('spin_wheel_last')
      if (!lastSpin) {
        setHasSpinAvailable(true)
        return
      }
      
      const lastSpinTime = parseInt(lastSpin)
      const hoursSinceSpin = (Date.now() - lastSpinTime) / (1000 * 60 * 60)
      setHasSpinAvailable(hoursSinceSpin >= 24) // Available every 24 hours
    }
    
    checkSpinAvailability()
    const interval = setInterval(checkSpinAvailability, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const handleSpinClick = () => {
    if (onSpinClick) {
      onSpinClick()
    } else {
      setShowSpinModal(true)
    }
    setIsExpanded(false)
  }

  return (
    <>
      {/* Mini Floating Action Button - positioned above chat */}
      <div className="fixed bottom-[15rem] right-6 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* Spin Wheel Mini Button */}
              {hasSpinAvailable && (
                <motion.button
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  onClick={handleSpinClick}
                  className="relative flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Gift className="w-5 h-5" />
                  <span className="text-sm font-medium">Spin & Win!</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>
        
        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isExpanded 
              ? 'bg-gray-700 text-white' 
              : hasSpinAvailable 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-gray-400 text-white'
          }`}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="gift"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                className="relative"
              >
                <Sparkles className="w-5 h-5" />
                {hasSpinAvailable && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Inline Spin Modal */}
      <AnimatePresence>
        {showSpinModal && (
          <SpinWheelModal onClose={() => setShowSpinModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

// Inline Spin Wheel Modal
function SpinWheelModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  
  const prizes = [
    { label: '5% OFF', color: '#FF6B6B', probability: 0.25 },
    { label: '10% OFF', color: '#4ECDC4', probability: 0.20 },
    { label: 'Free Ship', color: '#45B7D1', probability: 0.15 },
    { label: '15% OFF', color: '#DDA0DD', probability: 0.10 },
    { label: 'Try Again', color: '#98D8C8', probability: 0.15 },
    { label: '20% OFF', color: '#F7DC6F', probability: 0.08 },
    { label: '৳50 OFF', color: '#BB8FCE', probability: 0.05 },
    { label: 'JACKPOT!', color: '#FF8C42', probability: 0.02 },
  ]

  const spin = () => {
    if (!email || isSpinning) return
    
    setIsSpinning(true)
    
    // Random prize
    const random = Math.random()
    let cumulative = 0
    let prizeIndex = 0
    for (let i = 0; i < prizes.length; i++) {
      cumulative += prizes[i].probability
      if (random <= cumulative) {
        prizeIndex = i
        break
      }
    }
    
    const segmentAngle = 360 / prizes.length
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2)
    const fullSpins = 5 * 360
    const finalRotation = fullSpins + targetAngle
    
    setRotation(finalRotation)
    
    setTimeout(() => {
      setResult(prizes[prizeIndex].label)
      setIsSpinning(false)
      localStorage.setItem('spin_wheel_last', Date.now().toString())
    }, 4000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-purple-600 flex items-center gap-2">
            <Gift className="w-5 h-5" /> Spin to Win!
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {!result ? (
          <>
            {/* Wheel */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <div 
                className="absolute inset-0 rounded-full overflow-hidden transition-transform duration-[4000ms] ease-out shadow-lg"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {prizes.map((prize, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${i * (360 / prizes.length)}deg)`,
                      clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
                    }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backgroundColor: prize.color,
                        transform: 'rotate(22.5deg)',
                      }}
                    >
                      <span className="text-[10px] font-bold text-white transform -rotate-[67.5deg] translate-x-4">
                        {prize.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 z-10" />
            </div>
            
            <input
              type="email"
              placeholder="Enter your email to spin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-3 text-sm"
            />
            
            <button
              onClick={spin}
              disabled={!email || isSpinning}
              className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {isSpinning ? 'Spinning...' : 'SPIN NOW! 🎰'}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h4 className="text-xl font-bold text-purple-600 mb-2">You Won!</h4>
            <p className="text-2xl font-bold text-green-500">{result}</p>
            <p className="text-sm text-gray-500 mt-2">Check your email for the coupon code!</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default FloatingActions
