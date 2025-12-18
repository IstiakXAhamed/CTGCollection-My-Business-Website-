'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, Star, Gift, Copy, Check, Share2, TrendingUp,
  Truck, Clock, Sparkles, Award, ChevronRight, Loader2,
  Users, ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export default function CustomerLoyaltyPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const memoizedFetch = useCallback(() => fetchLoyalty(), [])

  useEffect(() => {
    fetchLoyalty()
  }, [])

  // Auto-refresh every 30 seconds
  useAutoRefresh(memoizedFetch)

  const fetchLoyalty = async () => {
    try {
      const res = await fetch('/api/user/loyalty', { credentials: 'include' })
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed to fetch loyalty:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (data?.referral?.link) {
      navigator.clipboard.writeText(data.referral.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data?.enabled) {
    return (
      <div className="text-center py-12">
        <Crown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Loyalty Program Coming Soon</h2>
        <p className="text-gray-600">Stay tuned for exciting rewards!</p>
      </div>
    )
  }

  const tier = data.currentTier
  const nextTier = data.nextTier

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with Current Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div 
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: tier?.color || '#6B7280' }}
        >
          <Crown className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{tier?.displayName || 'Loyalty Program'} Member</h1>
        <p className="text-gray-600">You're part of our exclusive loyalty program!</p>
      </motion.div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.loyalty.totalPoints?.toLocaleString()}</p>
            <p className="text-purple-100">Available Points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.loyalty.lifetimePoints?.toLocaleString()}</p>
            <p className="text-blue-100">Lifetime Points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{formatPrice(data.loyalty.lifetimeSpent || 0)}</p>
            <p className="text-green-100">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      {nextTier && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: tier?.color }}
                >
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">{tier?.displayName}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: nextTier.color }}
                >
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">{nextTier.displayName}</span>
              </div>
            </div>

            <div className="relative mb-2">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: tier?.color }}
                />
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              Spend {formatPrice(data.amountToNextTier)} more to reach {nextTier.displayName}!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Benefits */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Your Benefits
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{tier?.discountPercent || 0}%</p>
              <p className="text-sm text-gray-600">Discount</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{tier?.pointsMultiplier || 1}x</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <p className="text-2xl font-bold text-pink-600">{tier?.birthdayBonus || 0}</p>
              <p className="text-sm text-gray-600">Birthday Bonus</p>
            </div>
            <div className={`text-center p-4 rounded-xl ${tier?.freeShipping ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <Truck className={`w-8 h-8 mx-auto mb-1 ${tier?.freeShipping ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className={`text-sm ${tier?.freeShipping ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                {tier?.freeShipping ? 'Free Shipping' : 'Standard Shipping'}
              </p>
            </div>
          </div>

          {(tier?.prioritySupport || tier?.earlyAccess || tier?.exclusiveDeals) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tier?.prioritySupport && (
                <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  ⚡ Priority Support
                </span>
              )}
              {tier?.earlyAccess && (
                <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Early Sale Access
                </span>
              )}
              {tier?.exclusiveDeals && (
                <span className="text-sm bg-pink-100 text-pink-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Exclusive Deals
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Refer Friends & Earn</h2>
              <p className="text-green-100">Get {data.referral.bonusPerReferral} points for each friend</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={data.referral.link}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">{data.referral.completedReferrals}</p>
              <p className="text-sm text-gray-600">Successful Referrals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {data.transactions?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {data.transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points} pts
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
