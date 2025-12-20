/**
 * Centralized Permission Configuration
 * 
 * This file defines ALL permissions in the system.
 * Add new permissions here without code changes elsewhere.
 * The system will automatically recognize them.
 */

import { Shield, Store, Lock, Sparkles, Users, Package, ShoppingCart, CreditCard, MessageSquare, Settings, BarChart3, FileText, Database, Bell, UserCog } from 'lucide-react'

// Permission Category Definitions
export const PERMISSION_CATEGORIES = {
  admin: {
    id: 'admin',
    label: 'Admin Abilities',
    description: 'Core administrative capabilities',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: Shield,
  },
  seller: {
    id: 'seller',
    label: 'Seller Abilities',
    description: 'Vendor and shop management',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    icon: Store,
  },
  restricted: {
    id: 'restricted',
    label: 'Restricted Abilities',
    description: 'Only Super Admin can grant these',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    icon: Lock,
  },
  feature: {
    id: 'feature',
    label: 'Feature Access',
    description: 'Access to specific features',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: Sparkles,
  },
}

// All Permissions Definition
export interface Permission {
  id: string
  label: string
  description: string
  category: keyof typeof PERMISSION_CATEGORIES
  icon?: any
  defaultFor?: ('admin' | 'seller')[]  // Which roles have this by default
  superAdminOnly?: boolean  // Only super admin can grant
}

export const ALL_PERMISSIONS: Permission[] = [
  // ========== ADMIN ABILITIES ==========
  {
    id: 'manage_shops',
    label: 'Manage Shops (Multi-Vendor)',
    description: 'Approve and manage vendor shops',
    category: 'admin',
    icon: Store,
    defaultFor: ['admin'],
  },
  {
    id: 'approve_sellers',
    label: 'Approve Seller Applications',
    description: 'Approve or reject seller applications',
    category: 'admin',
    icon: UserCog,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_products',
    label: 'Manage Products & Inventory',
    description: 'Manage all products and stock',
    category: 'admin',
    icon: Package,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_orders',
    label: 'Manage Orders',
    description: 'Update order status',
    category: 'admin',
    icon: ShoppingCart,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_users',
    label: 'Manage Customers & Reviews',
    description: 'Customer accounts and reviews',
    category: 'admin',
    icon: Users,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_marketing',
    label: 'Manage Marketing (Coupons, Banners)',
    description: 'Create coupons and promo banners',
    category: 'admin',
    icon: Sparkles,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_content',
    label: 'Manage Content (Announcements)',
    description: 'Post announcements',
    category: 'admin',
    icon: Bell,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_settings',
    label: 'Manage Site Settings',
    description: 'Edit site settings',
    category: 'admin',
    icon: Settings,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_admins',
    label: 'Manage Other Admins',
    description: 'Create/edit admins',
    category: 'admin',
    icon: UserCog,
    superAdminOnly: true,
  },
  {
    id: 'manage_communications',
    label: 'Manage Messages & Chat',
    description: 'Reply to chat and messages',
    category: 'admin',
    icon: MessageSquare,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_storage',
    label: 'Manage File Storage',
    description: 'Upload and delete files',
    category: 'admin',
    icon: FileText,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_payouts',
    label: 'Process Payout Requests',
    description: 'Approve/reject seller payouts',
    category: 'admin',
    icon: CreditCard,
    defaultFor: ['admin'],
  },
  {
    id: 'manage_refunds',
    label: 'Process Refund Requests',
    description: 'Approve/reject refund requests',
    category: 'admin',
    icon: CreditCard,
    defaultFor: ['admin'],
  },

  // ========== SELLER ABILITIES ==========
  {
    id: 'seller_add_products',
    label: 'Add New Products',
    description: 'Add new products to shop',
    category: 'seller',
    icon: Package,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_edit_products',
    label: 'Edit Own Products',
    description: 'Edit own products',
    category: 'seller',
    icon: Package,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_delete_products',
    label: 'Delete Own Products',
    description: 'Delete own products',
    category: 'seller',
    icon: Package,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_view_orders',
    label: 'View Own Orders',
    description: 'View orders for own products',
    category: 'seller',
    icon: ShoppingCart,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_update_orders',
    label: 'Update Order Status',
    description: 'Update order status',
    category: 'seller',
    icon: ShoppingCart,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_request_payout',
    label: 'Request Payouts',
    description: 'Request money withdrawal',
    category: 'seller',
    icon: CreditCard,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_create_coupons',
    label: 'Create Shop Coupons',
    description: 'Create coupons for own shop',
    category: 'seller',
    icon: Sparkles,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_reply_reviews',
    label: 'Reply to Reviews',
    description: 'Reply to customer reviews',
    category: 'seller',
    icon: MessageSquare,
    defaultFor: ['seller'],
  },
  {
    id: 'seller_answer_questions',
    label: 'Answer Product Questions',
    description: 'Answer Q&A questions',
    category: 'seller',
    icon: MessageSquare,
    defaultFor: ['seller'],
  },

  // ========== RESTRICTED ABILITIES (Super Admin Only) ==========
  {
    id: 'set_customer_tiers',
    label: 'Set Customer Loyalty Tiers',
    description: 'Assign loyalty tiers to customers',
    category: 'restricted',
    icon: Users,
    superAdminOnly: true,
  },
  {
    id: 'modify_loyalty_points',
    label: 'Modify Loyalty Points',
    description: 'Add/remove loyalty points',
    category: 'restricted',
    icon: Sparkles,
    superAdminOnly: true,
  },
  {
    id: 'configure_spin_wheel',
    label: 'Configure Spin Wheel',
    description: 'Edit spin wheel prizes',
    category: 'restricted',
    icon: Sparkles,
    superAdminOnly: true,
  },
  {
    id: 'set_commission_rates',
    label: 'Set Commission Rates',
    description: 'Change seller commission rates',
    category: 'restricted',
    icon: CreditCard,
    superAdminOnly: true,
  },
  {
    id: 'override_pricing',
    label: 'Override Product Pricing',
    description: 'Manually adjust prices',
    category: 'restricted',
    icon: Package,
    superAdminOnly: true,
  },
  {
    id: 'access_financial_reports',
    label: 'Access Financial Reports',
    description: 'View revenue and profit reports',
    category: 'restricted',
    icon: BarChart3,
    superAdminOnly: true,
  },
  {
    id: 'manage_tier_benefits',
    label: 'Manage Tier Benefits',
    description: 'Set tier discounts and perks',
    category: 'restricted',
    icon: Users,
    superAdminOnly: true,
  },
  {
    id: 'bulk_user_actions',
    label: 'Bulk User Actions',
    description: 'Mass email/ban/activate users',
    category: 'restricted',
    icon: Users,
    superAdminOnly: true,
  },
  {
    id: 'database_backup',
    label: 'Database Backup Access',
    description: 'Create and restore backups',
    category: 'restricted',
    icon: Database,
    superAdminOnly: true,
  },
  {
    id: 'view_audit_logs',
    label: 'View Audit Logs',
    description: 'See all admin actions history',
    category: 'restricted',
    icon: FileText,
    superAdminOnly: true,
  },

  // ========== FEATURE ACCESS ==========
  {
    id: 'access_loyalty_dashboard',
    label: 'Access Loyalty Dashboard',
    description: 'View loyalty program dashboard',
    category: 'feature',
    icon: Users,
  },
  {
    id: 'access_analytics',
    label: 'Access Analytics & Reports',
    description: 'View sales reports',
    category: 'feature',
    icon: BarChart3,
  },
  {
    id: 'access_internal_chat',
    label: 'Use Internal Chat',
    description: 'Use internal team chat',
    category: 'feature',
    icon: MessageSquare,
  },
  {
    id: 'access_flash_sales',
    label: 'Create Flash Sales',
    description: 'Create flash sale events',
    category: 'feature',
    icon: Sparkles,
  },
  {
    id: 'access_bulk_upload',
    label: 'Bulk Product Upload',
    description: 'Upload products in bulk',
    category: 'feature',
    icon: Package,
  },
  {
    id: 'access_export_data',
    label: 'Export Data (CSV/PDF)',
    description: 'Export data to files',
    category: 'feature',
    icon: FileText,
  },
  {
    id: 'access_api_keys',
    label: 'Manage API Keys',
    description: 'Manage API integrations',
    category: 'feature',
    icon: Settings,
  },
  
  // ========== AI FEATURES ==========
  {
    id: 'use_ai_product_assist',
    label: 'Use AI Product Assistant',
    description: 'Generate descriptions, tags, and analyze products with AI',
    category: 'feature',
    icon: Sparkles,
    defaultFor: ['admin', 'seller'],
  },
  {
    id: 'use_ai_chat_assist',
    label: 'Use AI Chat Assistant',
    description: 'Get AI-powered suggestions for customer support',
    category: 'feature',
    icon: MessageSquare,
    defaultFor: ['admin'],
  },
  {
    id: 'use_ai_review_moderation',
    label: 'Use AI Review Moderation',
    description: 'AI-powered spam and inappropriate content detection',
    category: 'feature',
    icon: FileText,
    defaultFor: ['admin'],
  },
  {
    id: 'use_ai_seo_generator',
    label: 'Use AI SEO Generator',
    description: 'Generate SEO meta descriptions for pages',
    category: 'feature',
    icon: Sparkles,
    defaultFor: ['admin'],
  },
  {
    id: 'use_ai_analytics',
    label: 'Use AI Analytics Insights',
    description: 'Get AI-powered insights from sales data',
    category: 'feature',
    icon: BarChart3,
    superAdminOnly: true,
  },
  {
    id: 'manage_ai_settings',
    label: 'Manage AI Settings',
    description: 'Configure AI features and API keys',
    category: 'restricted',
    icon: Settings,
    superAdminOnly: true,
  },
]

// Helper Functions

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(category: keyof typeof PERMISSION_CATEGORIES): Permission[] {
  return ALL_PERMISSIONS.filter(p => p.category === category)
}

/**
 * Get default permissions for a role
 */
export function getDefaultPermissionsForRole(role: 'admin' | 'seller'): string[] {
  return ALL_PERMISSIONS
    .filter(p => p.defaultFor?.includes(role))
    .map(p => p.id)
}

/**
 * Check if a permission is restricted (super admin only)
 */
export function isRestrictedPermission(permissionId: string): boolean {
  const perm = ALL_PERMISSIONS.find(p => p.id === permissionId)
  return perm?.superAdminOnly === true || perm?.category === 'restricted'
}

/**
 * Get permission by ID
 */
export function getPermissionById(id: string): Permission | undefined {
  return ALL_PERMISSIONS.find(p => p.id === id)
}

/**
 * Get category info
 */
export function getCategoryInfo(categoryId: keyof typeof PERMISSION_CATEGORIES) {
  return PERMISSION_CATEGORIES[categoryId]
}

/**
 * Permission Templates for quick assignment
 */
export const PERMISSION_TEMPLATES = {
  fullAdmin: {
    id: 'full_admin',
    name: 'Full Admin Access',
    description: 'All admin abilities except restricted ones',
    permissions: ALL_PERMISSIONS
      .filter(p => p.category === 'admin' && !p.superAdminOnly)
      .map(p => p.id),
  },
  limitedAdmin: {
    id: 'limited_admin',
    name: 'Limited Admin',
    description: 'Basic admin access without user management',
    permissions: ['manage_products', 'manage_orders', 'manage_content', 'manage_communications'],
  },
  fullSeller: {
    id: 'full_seller',
    name: 'Full Seller Access',
    description: 'All seller abilities',
    permissions: ALL_PERMISSIONS
      .filter(p => p.category === 'seller')
      .map(p => p.id),
  },
  restrictedSeller: {
    id: 'restricted_seller',
    name: 'Restricted Seller',
    description: 'View-only seller access',
    permissions: ['seller_view_orders', 'seller_reply_reviews', 'seller_answer_questions'],
  },
}
