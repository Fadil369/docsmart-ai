/**
 * Analytics service for tracking trial events
 */

export interface AnalyticsEvent {
  event: string
  data: Record<string, any>
  timestamp: string
  userId?: string
}

class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private readonly storageKey = 'docsmart_analytics'

  constructor() {
    this.loadStoredEvents()
  }

  /**
   * Track an analytics event
   */
  track(event: string, data: Record<string, any> = {}, userId?: string): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userId
    }

    this.events.push(analyticsEvent)
    this.saveEvents()

    // In a real app, this would send to analytics service
    console.log('📊 Analytics Event:', analyticsEvent)

    // Emit to any listeners
    this.emitEvent(analyticsEvent)
  }

  /**
   * Track trial-specific events
   */
  trackTrialEvent(event: 'trial_start' | 'trial_24h_left' | 'trial_expired' | 'trial_ended_manually', data: Record<string, any> = {}): void {
    this.track(event, {
      ...data,
      category: 'trial'
    })
  }

  /**
   * Track feature usage during trial
   */
  trackFeatureUsage(feature: string, data: Record<string, any> = {}): void {
    this.track('feature_used', {
      feature,
      ...data,
      category: 'usage'
    })
  }

  /**
   * Track payment page visits
   */
  trackPaymentPageView(source: string = 'unknown'): void {
    this.track('payment_page_view', {
      source,
      category: 'conversion'
    })
  }

  /**
   * Track plan selection
   */
  trackPlanSelected(planId: string, source: string = 'unknown'): void {
    this.track('plan_selected', {
      plan_id: planId,
      source,
      category: 'conversion'
    })
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: string): AnalyticsEvent[] {
    return this.events.filter(event => event.data.category === category)
  }

  /**
   * Get trial events
   */
  getTrialEvents(): AnalyticsEvent[] {
    return this.getEventsByCategory('trial')
  }

  /**
   * Clear all events (for testing)
   */
  clearEvents(): void {
    this.events = []
    this.saveEvents()
  }

  /**
   * Export events as JSON
   */
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2)
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.events = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error)
      this.events = []
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events))
    } catch (error) {
      console.warn('Failed to save analytics events:', error)
    }
  }

  private emitEvent(event: AnalyticsEvent): void {
    // Emit custom event for any listeners
    const customEvent = new CustomEvent('docsmart-analytics', {
      detail: event
    })
    window.dispatchEvent(customEvent)
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Export individual tracking functions for convenience
export const trackTrialEvent = (event: 'trial_start' | 'trial_24h_left' | 'trial_expired' | 'trial_ended_manually', data?: Record<string, any>) => 
  analytics.trackTrialEvent(event, data)

export const trackFeatureUsage = (feature: string, data?: Record<string, any>) => 
  analytics.trackFeatureUsage(feature, data)

export const trackPaymentPageView = (source?: string) => 
  analytics.trackPaymentPageView(source)

export const trackPlanSelected = (planId: string, source?: string) => 
  analytics.trackPlanSelected(planId, source)