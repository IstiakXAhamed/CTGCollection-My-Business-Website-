'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Copy, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Prize {
  id: string
  label: string
  code?: string
  color: string
  probability: number // 0-100
}

const DEFAULT_PRIZES: Prize[] = [
  { id: '1', label: '5% OFF', code: 'SPIN5', color: '#FF6B6B', probability: 25 },
  { id: '2', label: '10% OFF', code: 'SPIN10', color: '#4ECDC4', probability: 20 },
  { id: '3', label: 'Free Ship', code: 'FREESHIP', color: '#45B7D1', probability: 15 },
  { id: '4', label: '15% OFF', code: 'SPIN15', color: '#96CEB4', probability: 10 },
  { id: '5', label: 'Try Again', code: '', color: '#DDA0DD', probability: 20 },
  { id: '6', label: '20% OFF', code: 'SPIN20', color: '#FFEAA7', probability: 5 },
  { id: '7', label: '৳50 OFF', code: 'SPIN50', color: '#74B9FF', probability: 3 },
  { id: '8', label: 'JACKPOT!', code: 'JACKPOT30', color: '#FD79A8', probability: 2 },
]

interface SpinWheelProps {
  prizes?: Prize[]
  onWin?: (prize: Prize) => void
  trigger?: 'button' | 'popup' | 'exit-intent'
  showOnce?: boolean
}

export function SpinWheel({
  prizes: initialPrizes = DEFAULT_PRIZES,
  onWin,
  trigger = 'popup',
  showOnce = true
}: SpinWheelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wonPrize, setWonPrize] = useState<Prize | null>(null)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [hasSpun, setHasSpun] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [prizes, setPrizes] = useState<Prize[]>(initialPrizes)
  const wheelRef = useRef<HTMLDivElement>(null)

  // Check if user has already spun (localStorage)
  const checkAlreadySpun = useCallback((cooldownMinutes = 0) => {
    try {
      if (typeof window !== 'undefined' && showOnce) {
        const lastSpun = localStorage.getItem('spin_wheel_last_spun')
        if (!lastSpun) return false
        
        // If no cooldown, assume once per forever (or session if simplified)
        // But if cooldownMinutes is set, check diff
        if (cooldownMinutes > 0) {
          const diff = Date.now() - parseInt(lastSpun)
          const cooldownMs = cooldownMinutes * 60 * 1000
          return diff < cooldownMs
        }
        
        return localStorage.getItem('spin_wheel_spun') === 'true'
      }
      return false
    } catch {
      return false
    }
  }, [showOnce])

  // Initial Fetch & Logic
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Check User Role (Hide for Admin/Seller)
        const authRes = await fetch('/api/auth/me')
        if (authRes.ok) {
          const authData = await authRes.json()
          if (authData.authenticated && (authData.user.role === 'admin' || authData.user.role === 'seller' || authData.user.role === 'superadmin')) {
            console.log('SpinWheel hidden for staff')
            return // Don't show
          }
        }

        // 2. Fetch Settings
        const settingsRes = await fetch('/api/settings/public')
        const settingsData = await settingsRes.json()
        const wheelConfig = settingsData.spinWheelConfig || {}
        
        setConfig(wheelConfig)

        if (wheelConfig.enabled !== true) return 
        if (wheelConfig.prizes && wheelConfig.prizes.length > 0) {
          setPrizes(wheelConfig.prizes)
        }

        // 3. Trigger Popup
        if (trigger === 'popup' && !checkAlreadySpun(wheelConfig.cooldownMinutes)) {
          const delay = (wheelConfig.delaySeconds || 10) * 1000
          const timer = setTimeout(() => {
            setIsOpen(true)
          }, delay)
          return () => clearTimeout(timer)
        }

      } catch (error) {
        console.error('SpinWheel init error:', error)
      }
    }

    init()

    const handleOpenEvent = () => setIsOpen(true)
    window.addEventListener('open-spin-wheel', handleOpenEvent)

    return () => {
      window.removeEventListener('open-spin-wheel', handleOpenEvent)
    }
  }, [trigger, checkAlreadySpun])

  // Weighted random selection
  const selectPrize = useCallback((): Prize => {
    try {
      const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0)
      let random = Math.random() * totalWeight
      
      for (const prize of prizes) {
        random -= prize.probability
        if (random <= 0) {
          return prize
        }
      }
      return prizes[0]
    } catch (error) {
      console.error('Error selecting prize:', error)
      return prizes[0]
    }
  }, [prizes])

  const handleSpin = async () => {
    if (isSpinning || hasSpun || !email.trim()) return

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address')
      return
    }

    setIsSpinning(true)

    try {
      // Select winning prize
      const selectedPrize = selectPrize()
      const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id)
      
      // Calculate rotation
      const segmentAngle = 360 / prizes.length
      const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2)
      const spins = 5 // Number of full rotations
      const finalRotation = spins * 360 + targetAngle
      
      setRotation(finalRotation)

      // Wait for spin animation
      await new Promise(resolve => setTimeout(resolve, 5000))

      setWonPrize(selectedPrize)
      setHasSpun(true)
      
      // Save to localStorage
      if (typeof window !== 'undefined' && showOnce) {
        localStorage.setItem('spin_wheel_spun', 'true')
        localStorage.setItem('spin_wheel_last_spun', Date.now().toString())
      }

      // Save email and prize to backend
      try {
        await fetch('/api/spin-wheel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            prizeId: selectedPrize.id,
            prizeLabel: selectedPrize.label,
            code: selectedPrize.code
          })
        })
      } catch {
        console.log('Failed to save spin result')
      }

      onWin?.(selectedPrize)
    } catch (error) {
      console.error('Spin error:', error)
    } finally {
      setIsSpinning(false)
    }
  }

  const copyCode = () => {
    if (wonPrize?.code) {
      navigator.clipboard.writeText(wonPrize.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderWheel = () => {
    const segmentAngle = 360 / prizes.length

    return (
      <div className="relative w-72 h-72 md:w-80 md:h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500" />
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-yellow-400"
          style={{ rotate: rotation }}
          animate={{ rotate: rotation }}
          transition={{ duration: 5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {prizes.map((prize, index) => {
              const startAngle = index * segmentAngle
              const endAngle = (index + 1) * segmentAngle
              const startRad = (startAngle - 90) * (Math.PI / 180)
              const endRad = (endAngle - 90) * (Math.PI / 180)
              
              const x1 = 50 + 50 * Math.cos(startRad)
              const y1 = 50 + 50 * Math.sin(startRad)
              const x2 = 50 + 50 * Math.cos(endRad)
              const y2 = 50 + 50 * Math.sin(endRad)
              
              const largeArc = segmentAngle > 180 ? 1 : 0
              
              const textAngle = startAngle + segmentAngle / 2
              const textRad = (textAngle - 90) * (Math.PI / 180)
              const textX = 50 + 35 * Math.cos(textRad)
              const textY = 50 + 35 * Math.sin(textRad)

              return (
                <g key={prize.id}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={prize.color}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="4.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="0.3"
                    paintOrder="stroke"
                  >
                    {prize.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </motion.div>

        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-yellow-700" />
        </div>
      </div>
    )
  }

  if (trigger === 'button') {
    return (
      <>
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <Gift className="w-4 h-4" />
          Spin to Win!
        </Button>
        <SpinWheelModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)}
          renderWheel={renderWheel}
          email={email}
          setEmail={setEmail}
          isSpinning={isSpinning}
          hasSpun={hasSpun}
          wonPrize={wonPrize}
          handleSpin={handleSpin}
          copyCode={copyCode}
          copied={copied}
        />
      </>
    )
  }

  return (
    <SpinWheelModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)}
      renderWheel={renderWheel}
      email={email}
      setEmail={setEmail}
      isSpinning={isSpinning}
      hasSpun={hasSpun}
      wonPrize={wonPrize}
      handleSpin={handleSpin}
      copyCode={copyCode}
      copied={copied}
    />
  )
}

// Modal component
function SpinWheelModal({
  isOpen,
  onClose,
  renderWheel,
  email,
  setEmail,
  isSpinning,
  hasSpun,
  wonPrize,
  handleSpin,
  copyCode,
  copied
}: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-1 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎡 Spin to Win!
                </h2>
                <p className="text-gray-500 mt-1">
                  Try your luck and win amazing discounts
                </p>
              </div>

              <div className="flex justify-center mb-6">
                {renderWheel()}
              </div>

              {!wonPrize ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to spin"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={isSpinning || hasSpun}
                  />
                  <Button
                    onClick={handleSpin}
                    disabled={isSpinning || hasSpun || !email.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSpinning ? 'Spinning...' : 'SPIN NOW! 🎯'}
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <h3 className="text-xl font-bold text-green-600 mb-2">
                    🎉 Congratulations!
                  </h3>
                  <p className="text-gray-600 mb-4">You won: <strong>{wonPrize.label}</strong></p>
                  
                  {wonPrize.code && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-2">Your coupon code:</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-mono font-bold text-purple-600">
                          {wonPrize.code}
                        </span>
                        <button onClick={copyCode} className="p-2">
                          {copied ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
