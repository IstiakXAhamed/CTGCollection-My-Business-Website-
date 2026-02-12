import webPush from 'web-push'

// VAPID keys - Generate using: npx web-push generate-vapid-keys
// Set in environment variables for production
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

// Only configure if keys are set
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webPush.setVapidDetails(
    'mailto:admin@silkmart.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

// Helper to check if push is configured
export function isPushConfigured(): boolean {
  return !!(vapidKeys.publicKey && vapidKeys.privateKey)
}

export { webPush, vapidKeys }
