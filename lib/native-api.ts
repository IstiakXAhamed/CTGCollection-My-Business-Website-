/**
 * Silk Elite Native API Utility
 * Provides unified access to native OS features like Sharing and App Badging.
 */

export const nativeApi = {
  /**
   * Triggers the native OS share drawer.
   */
  share: async (data: { title?: string; text?: string; url?: string }) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(data)
        return true
      } catch (err) {
        console.error('Error sharing:', err)
        return false
      }
    }
    return false
  },

  /**
   * Sets the application icon badge count.
   * Only works on supported platforms (mostly installed PWAs/TWAs).
   */
  setBadge: async (count: number) => {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count)
        } else {
          await (navigator as any).clearAppBadge()
        }
        return true
      } catch (err) {
        console.error('Error setting badge:', err)
        return false
      }
    }
    return false
  },

  /**
   * Clears the application icon badge.
   */
  clearBadge: async () => {
    if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
      try {
        await (navigator as any).clearAppBadge()
        return true
      } catch (err) {
        console.error('Error clearing badge:', err)
        return false
      }
    }
    return false
  }
}
