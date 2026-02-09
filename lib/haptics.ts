/**
 * Haptics utility for Silk Elite.
 * Provides subtle tactile feedback for actions inside the standalone app.
 */
export const haptics = {
  /**
   * Triggers a light vibration for subtle feedback (e.g., button clicks, success).
   */
  light: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10)
    }
  },

  /**
   * Triggers a medium vibration (e.g., adding to cart).
   */
  medium: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([15, 5, 15])
    }
  },

  /**
   * Triggers a success pattern (double pulse).
   */
  success: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([10, 30, 20])
    }
  },

  /**
   * Triggers an error pattern (three short pulses).
   */
  error: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 50, 50, 50, 50])
    }
  },

  /**
   * Triggers a rhythmic pulse for AI proactive triggers.
   */
  pulse: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 100, 20])
    }
  },

  /**
   * Rigid impact (native-like click).
   */
  rigid: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([15])
    }
  },

  /**
   * Soft impact (subtle confirmation).
   */
  soft: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([5])
    }
  },

  /**
   * Heavy impact (for errors or major actions).
   */
  heavy: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([35])
    }
  }
}
