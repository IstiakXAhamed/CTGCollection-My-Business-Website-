'use client'

import { motion } from 'framer-motion'
import { Crown, Star, Medal, Gift, Percent, Truck, Headphones, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum'

interface CustomerTier {
  level: TierLevel
  name: string
  minSpend: number
  icon: typeof Crown
  color: string
  bgColor: string
  borderColor: string
  benefits: string[]
  discount: number
  pointsMultiplier: number
}

const TIERS: CustomerTier[] = [
  {
    level: 'bronze',
    name: 'Bronze',
    minSpend: 0,
    icon: Medal,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    benefits: ['Earn 1 point per ৳1', 'Birthday discount', 'Early sale access'],
    discount: 0,
    pointsMultiplier: 1
  },
  {
    level: 'silver',
    name: 'Silver',
    minSpend: 5000,
    icon: Star,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400',
    benefits: ['Earn 1.5x points', '5% discount on orders', 'Free shipping over ৳1000', 'Priority support'],
    discount: 5,
    pointsMultiplier: 1.5
  },
  {
    level: 'gold',
    name: 'Gold',
    minSpend: 15000,
    icon: Crown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    benefits: ['Earn 2x points', '10% discount on orders', 'Free shipping always', 'VIP support', 'Exclusive products'],
    discount: 10,
    pointsMultiplier: 2
  },
  {
    level: 'platinum',
    name: 'Platinum',
    minSpend: 50000,
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
    benefits: ['Earn 3x points', '15% discount on orders', 'Free express shipping', 'Dedicated manager', 'Early product access', 'Free gift wrapping'],
    discount: 15,
    pointsMultiplier: 3
  }
]

export function getTierBySpend(totalSpend: number): CustomerTier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalSpend >= TIERS[i].minSpend) {
      return TIERS[i]
    }
  }
  return TIERS[0]
}

export function getNextTier(currentTier: TierLevel): CustomerTier | null {
  const currentIndex = TIERS.findIndex(t => t.level === currentTier)
  if (currentIndex < TIERS.length - 1) {
    return TIERS[currentIndex + 1]
  }
  return null
}

interface CustomerTierCardProps {
  totalSpend: number
  variant?: 'full' | 'compact' | 'badge'
}

export function CustomerTierCard({ totalSpend, variant = 'full' }: CustomerTierCardProps) {
  const currentTier = getTierBySpend(totalSpend)
  const nextTier = getNextTier(currentTier.level)
  const Icon = currentTier.icon

  const progress = nextTier 
    ? ((totalSpend - currentTier.minSpend) / (nextTier.minSpend - currentTier.minSpend)) * 100
    : 100

  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${currentTier.bgColor} ${currentTier.color} border ${currentTier.borderColor}`}>
        <Icon className="w-3 h-3" />
        {currentTier.name}
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${currentTier.bgColor} border ${currentTier.borderColor}`}>
        <Icon className={`w-6 h-6 ${currentTier.color}`} />
        <div className="flex-1">
          <p className={`font-bold ${currentTier.color}`}>{currentTier.name} Member</p>
          {nextTier && (
            <p className="text-xs text-gray-500">
              {formatPrice(nextTier.minSpend - totalSpend)} more to {nextTier.name}
            </p>
          )}
        </div>
        {currentTier.discount > 0 && (
          <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
            {currentTier.discount}% OFF
          </span>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 ${currentTier.borderColor} overflow-hidden`}
    >
      {/* Header */}
      <div className={`${currentTier.bgColor} p-6 text-center`}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center shadow-lg`}
        >
          <Icon className={`w-8 h-8 ${currentTier.color}`} />
        </motion.div>
        <h3 className={`text-2xl font-bold ${currentTier.color}`}>
          {currentTier.name} Member
        </h3>
        <p className="text-gray-600 mt-1">
          Total spend: {formatPrice(totalSpend)}
        </p>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="px-6 py-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Progress to {nextTier.name}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full bg-gradient-to-r ${
                nextTier.level === 'silver' ? 'from-gray-400 to-gray-500' :
                nextTier.level === 'gold' ? 'from-yellow-400 to-yellow-500' :
                'from-purple-400 to-purple-500'
              }`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Spend {formatPrice(nextTier.minSpend - totalSpend)} more to unlock {nextTier.name}!
          </p>
        </div>
      )}

      {/* Benefits */}
      <div className="p-6 bg-white dark:bg-gray-800">
        <h4 className="font-bold mb-4">Your Benefits</h4>
        <div className="grid grid-cols-2 gap-3">
          {currentTier.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className={`w-5 h-5 rounded-full ${currentTier.bgColor} flex items-center justify-center`}>
                {idx === 0 && <Star className={`w-3 h-3 ${currentTier.color}`} />}
                {idx === 1 && <Percent className={`w-3 h-3 ${currentTier.color}`} />}
                {idx === 2 && <Truck className={`w-3 h-3 ${currentTier.color}`} />}
                {idx >= 3 && <Gift className={`w-3 h-3 ${currentTier.color}`} />}
              </div>
              <span className="text-gray-600">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All Tiers */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t">
        <p className="text-xs text-gray-500 mb-3">VIP Tiers</p>
        <div className="flex justify-between">
          {TIERS.map((tier) => {
            const TierIcon = tier.icon
            const isActive = tier.level === currentTier.level
            return (
              <div key={tier.level} className="text-center">
                <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                  isActive ? tier.bgColor : 'bg-gray-200'
                } ${isActive ? `border-2 ${tier.borderColor}` : ''}`}>
                  <TierIcon className={`w-5 h-5 ${isActive ? tier.color : 'text-gray-400'}`} />
                </div>
                <p className={`text-xs mt-1 ${isActive ? 'font-bold' : 'text-gray-400'}`}>
                  {tier.name}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
