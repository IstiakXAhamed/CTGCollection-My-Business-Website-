import { ShieldCheck, Shield, BadgeCheck, User, Flame, Droplets, Sparkles, Crown, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role?: string
  tier?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

// Single badge component for internal use
function Badge({ config, size, showIcon, className }: { 
  config: { container: string; text: string; icon: any; label: string }
  size: 'sm' | 'md' | 'lg'
  showIcon: boolean
  className?: string
}) {
  const Icon = config.icon
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  }

  return (
    <div className={cn(
      'inline-flex items-center justify-center rounded-full border shadow-sm transition-all duration-300 select-none overflow-hidden relative',
      config.container,
      sizeClasses[size],
      className
    )}>
      {showIcon && <Icon className={cn(
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
      )} />}
      <span className={cn('relative z-10', config.text)}>
        {config.label}
      </span>
    </div>
  )
}

export default function RoleBadge({ role, tier, className, size = 'md', showIcon = true }: RoleBadgeProps) {
  const normalizedRole = role?.toLowerCase() || 'customer'
  const normalizedTier = tier?.toLowerCase()

  const roleStyles = {
    superadmin: {
      container: 'text-white border-red-500 animate-fire shadow-lg',
      text: 'font-bold tracking-wide drop-shadow-md',
      icon: Flame,
      label: 'Super Admin'
    },
    admin: {
      container: 'text-yellow-900 border-yellow-500 animate-gold shadow-md',
      text: 'font-bold drop-shadow-sm',
      icon: Shield,
      label: 'Admin'
    },
    seller: {
      container: 'text-blue-900 border-blue-400 animate-water shadow-md',
      text: 'font-semibold',
      icon: Droplets,
      label: 'Seller'
    },
    customer: {
      container: 'text-gray-700 border-gray-200 bg-gray-50',
      text: 'font-medium',
      icon: User,
      label: 'Customer'
    }
  }

  const tierStyles: Record<string, { container: string; text: string; icon: any; label: string }> = {
    // Premium Tiers (highest to lowest)
    legendary: {
      container: 'text-amber-900 border-amber-500 animate-legendary-tier shadow-xl',
      text: 'font-black tracking-wider',
      icon: Crown,
      label: 'Legendary'
    },
    obsidian: {
      container: 'animate-obsidian-tier shadow-lg',
      text: 'font-bold tracking-wide',
      icon: Gem,
      label: 'Obsidian'
    },
    sapphire: {
      container: 'text-blue-900 border-blue-500 animate-sapphire-tier shadow-lg',
      text: 'font-bold tracking-wide',
      icon: Gem,
      label: 'Sapphire'
    },
    ruby: {
      container: 'text-red-900 border-red-500 animate-ruby-tier shadow-lg',
      text: 'font-bold tracking-wide',
      icon: Gem,
      label: 'Ruby'
    },
    emerald: {
      container: 'text-emerald-900 border-emerald-500 animate-emerald-tier shadow-lg',
      text: 'font-bold tracking-wide',
      icon: Gem,
      label: 'Emerald'
    },
    // Standard Tiers
    diamond: {
      container: 'text-cyan-900 border-cyan-400 animate-diamond-tier shadow-lg',
      text: 'font-bold tracking-wide',
      icon: Gem,
      label: 'Diamond'
    },
    platinum: {
      container: 'text-gray-900 border-gray-400 animate-platinum-tier shadow-md',
      text: 'font-semibold',
      icon: Crown,
      label: 'Platinum'
    },
    gold: {
      container: 'text-yellow-900 border-yellow-500 animate-gold-tier shadow-md',
      text: 'font-semibold',
      icon: Crown,
      label: 'Gold'
    },
    silver: {
      container: 'text-gray-700 border-gray-300 animate-silver-tier shadow-sm',
      text: 'font-medium',
      icon: Shield,
      label: 'Silver'
    },
    bronze: {
      container: 'text-orange-900 border-orange-300 animate-bronze-tier shadow-sm',
      text: 'font-medium',
      icon: Shield,
      label: 'Bronze'
    }
  }

  const roleConfig = roleStyles[normalizedRole as keyof typeof roleStyles] || roleStyles.customer
  const tierConfig = normalizedTier ? tierStyles[normalizedTier] : null

  // For customers, show both role AND tier badges side by side
  if (normalizedRole === 'customer' && tierConfig) {
    return (
      <div className={cn('flex items-center gap-2 flex-wrap', className)}>
        <Badge config={roleConfig} size={size} showIcon={showIcon} />
        <Badge config={tierConfig} size={size} showIcon={showIcon} />
      </div>
    )
  }

  // For other roles (admin, seller, superadmin) or customers without tier
  return <Badge config={roleConfig} size={size} showIcon={showIcon} className={className} />
}

