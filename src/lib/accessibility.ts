/**
 * Accessibility Enhancement System
 * Comprehensive a11y improvements for better user experience
 */

export interface AccessibilityConfig {
  announcePageChanges: boolean
  enableKeyboardShortcuts: boolean
  highContrastMode: boolean
  reducedMotion: boolean
  screenReaderOptimizations: boolean
}

/**
 * Announce important changes to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Enhanced focus management for better keyboard navigation
 */
export class FocusManager {
  private focusStack: HTMLElement[] = []
  
  trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    firstElement.focus()
    
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
  
  pushFocus(element: HTMLElement) {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus) {
      this.focusStack.push(currentFocus)
    }
    element.focus()
  }
  
  popFocus() {
    const previousFocus = this.focusStack.pop()
    if (previousFocus) {
      previousFocus.focus()
    }
  }
}

/**
 * Keyboard shortcuts manager
 */
export class KeyboardShortcuts {
  private shortcuts: Map<string, () => void> = new Map()
  
  register(key: string, callback: () => void, description?: string) {
    this.shortcuts.set(key.toLowerCase(), callback)
  }
  
  unregister(key: string) {
    this.shortcuts.delete(key.toLowerCase())
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    const key = this.getKeyString(e)
    const callback = this.shortcuts.get(key)
    
    if (callback) {
      e.preventDefault()
      callback()
    }
  }
  
  private getKeyString(e: KeyboardEvent): string {
    const parts: string[] = []
    
    if (e.ctrlKey) parts.push('ctrl')
    if (e.altKey) parts.push('alt')
    if (e.shiftKey) parts.push('shift')
    if (e.metaKey) parts.push('meta')
    
    parts.push(e.key.toLowerCase())
    
    return parts.join('+')
  }
  
  enable() {
    document.addEventListener('keydown', this.handleKeyDown)
  }
  
  disable() {
    document.removeEventListener('keydown', this.handleKeyDown)
  }
}

/**
 * Responsive touch gesture enhancements
 */
export class TouchGestures {
  private touchStartX = 0
  private touchStartY = 0
  private minSwipeDistance = 50
  
  onSwipe(
    element: HTMLElement,
    callbacks: {
      onSwipeLeft?: () => void
      onSwipeRight?: () => void
      onSwipeUp?: () => void
      onSwipeDown?: () => void
    }
  ) {
    const handleTouchStart = (e: TouchEvent) => {
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!this.touchStartX || !this.touchStartY) return
      
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      
      const diffX = this.touchStartX - touchEndX
      const diffY = this.touchStartY - touchEndY
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > this.minSwipeDistance) {
          if (diffX > 0) {
            callbacks.onSwipeLeft?.()
          } else {
            callbacks.onSwipeRight?.()
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(diffY) > this.minSwipeDistance) {
          if (diffY > 0) {
            callbacks.onSwipeUp?.()
          } else {
            callbacks.onSwipeDown?.()
          }
        }
      }
      
      this.touchStartX = 0
      this.touchStartY = 0
    }
    
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }
}

/**
 * Color contrast and theme accessibility
 */
export function checkColorContrast(foreground: string, background: string): number {
  // Convert hex to RGB
  const toRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  
  const fgRgb = toRgb(foreground)
  const bgRgb = toRgb(background)
  
  if (!fgRgb || !bgRgb) return 0
  
  // Calculate relative luminance
  const luminance = (color: {r: number, g: number, b: number}) => {
    const {r, g, b} = color
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = luminance(fgRgb)
  const l2 = luminance(bgRgb)
  
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Motion preferences detection and management
 */
export function respectsReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setupMotionPreferences() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  
  const updateMotionPreference = () => {
    if (mediaQuery.matches) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }
  
  updateMotionPreference()
  mediaQuery.addEventListener('change', updateMotionPreference)
  
  return () => {
    mediaQuery.removeEventListener('change', updateMotionPreference)
  }
}

// Global accessibility instances
export const focusManager = new FocusManager()
export const keyboardShortcuts = new KeyboardShortcuts()
export const touchGestures = new TouchGestures()
