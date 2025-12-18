// Inventory logging utility function
import { prisma } from './prisma'

// Utility function to log inventory changes (for use in other APIs)
export async function logInventoryChange(
  productId: string,
  previousStock: number,
  newStock: number,
  reason: string,
  userId: string,
  orderId?: string,
  variantId?: string,
  notes?: string
) {
  try {
    await (prisma as any).inventoryLog.create({
      data: {
        productId,
        variantId,
        previousStock,
        newStock,
        change: newStock - previousStock,
        reason,
        orderId,
        userId,
        notes
      }
    })
    return true
  } catch (error) {
    console.error('Failed to log inventory change:', error)
    return false
  }
}
