import { Badge } from '@/components/ui/badge'
import { TrendingUp, Flame, Clock } from 'lucide-react'

interface SocialProofProps {
  stock?: number
  isTrending?: boolean
  recentPurchases?: number
}

export function SocialProof({ stock, isTrending, recentPurchases }: SocialProofProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Stock Urgency */}
      {stock !== undefined && stock > 0 && stock <= 10 && (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Only {stock} left in stock!
        </Badge>
      )}

      {/* Trending Badge */}
      {isTrending && (
        <Badge className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Trending
        </Badge>
      )}

      {/* Recent Purchases */}
      {recentPurchases && recentPurchases > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Flame className="w-3 h-3" />
          {recentPurchases} people bought this today
        </Badge>
      )}
    </div>
  )
}
