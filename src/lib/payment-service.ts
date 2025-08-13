import { loadStripe, Stripe } from '@stripe/stripe-js'
import { 
  PaymentPlan, 
  PaymentSession, 
  Entitlement, 
  PaymentEvent, 
  BillingStatus, 
  PaymentError,
  PAYMENT_PLANS 
} from '@/types/payment'

// Mock configuration - in production these would come from environment variables
const STRIPE_PUBLIC_KEY = 'pk_test_mock' // Replace with actual Stripe public key
const PAYPAL_CLIENT_ID = 'mock_paypal_client_id' // Replace with actual PayPal client ID

class PaymentService {
  private stripe: Stripe | null = null
  private userId: string = 'mock-user-123' // In production, get from auth context

  async initialize() {
    try {
      this.stripe = await loadStripe(STRIPE_PUBLIC_KEY)
      if (!this.stripe) {
        throw new Error('Failed to load Stripe')
      }
    } catch (error) {
      console.error('Payment service initialization failed:', error)
      throw error
    }
  }

  getPlans(): PaymentPlan[] {
    return PAYMENT_PLANS
  }

  getPlanById(planId: string): PaymentPlan | null {
    return PAYMENT_PLANS.find(plan => plan.id === planId) || null
  }

  getPlansForDocument(): PaymentPlan[] {
    return PAYMENT_PLANS.filter(plan => plan.type === 'per-document')
  }

  getTimePasses(): PaymentPlan[] {
    return PAYMENT_PLANS.filter(plan => plan.type === 'time-pass')
  }

  getSubscriptions(): PaymentPlan[] {
    return PAYMENT_PLANS.filter(plan => plan.type === 'subscription')
  }

  // Create payment session (mock implementation - would integrate with real backend)
  async createPaymentSession(planId: string, documentId?: string): Promise<PaymentSession> {
    const plan = this.getPlanById(planId)
    if (!plan) {
      throw new PaymentError({
        code: 'PLAN_NOT_FOUND',
        message: 'Selected plan not found',
        type: 'validation'
      })
    }

    const session: PaymentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      planId,
      userId: this.userId,
      documentId,
      amount: plan.priceInSAR,
      currency: 'SAR',
      status: 'pending',
      paymentMethod: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        planName: plan.name,
        planType: plan.type
      }
    }

    // Store session in localStorage for mock purposes
    this.storePaymentSession(session)
    return session
  }

  // Process Stripe payment
  async processStripePayment(sessionId: string, paymentMethodId: string): Promise<PaymentSession> {
    const session = this.getPaymentSession(sessionId)
    if (!session) {
      throw new PaymentError({
        code: 'SESSION_NOT_FOUND',
        message: 'Payment session not found',
        type: 'validation'
      })
    }

    if (!this.stripe) {
      throw new PaymentError({
        code: 'STRIPE_NOT_INITIALIZED',
        message: 'Stripe not initialized',
        type: 'configuration'
      })
    }

    try {
      // In production, this would call your backend API to create payment intent
      // For now, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

      const updatedSession: PaymentSession = {
        ...session,
        status: 'succeeded',
        paymentMethod: 'stripe-card',
        updatedAt: new Date()
      }

      this.storePaymentSession(updatedSession)
      await this.grantEntitlement(updatedSession)
      this.logPaymentEvent('payment.succeeded', updatedSession)

      return updatedSession
    } catch (error) {
      const failedSession: PaymentSession = {
        ...session,
        status: 'failed',
        updatedAt: new Date()
      }
      this.storePaymentSession(failedSession)
      this.logPaymentEvent('payment.failed', failedSession)
      throw error
    }
  }

  // Process Apple Pay payment
  async processApplePayPayment(sessionId: string): Promise<PaymentSession> {
    const session = this.getPaymentSession(sessionId)
    if (!session) {
      throw new PaymentError({
        code: 'SESSION_NOT_FOUND',
        message: 'Payment session not found',
        type: 'validation'
      })
    }

    if (!this.stripe) {
      throw new PaymentError({
        code: 'STRIPE_NOT_INITIALIZED',
        message: 'Stripe not initialized',
        type: 'configuration'
      })
    }

    try {
      // Mock Apple Pay processing
      await new Promise(resolve => setTimeout(resolve, 1500))

      const updatedSession: PaymentSession = {
        ...session,
        status: 'succeeded',
        paymentMethod: 'stripe-apple-pay',
        updatedAt: new Date()
      }

      this.storePaymentSession(updatedSession)
      await this.grantEntitlement(updatedSession)
      this.logPaymentEvent('payment.succeeded', updatedSession)

      return updatedSession
    } catch (error) {
      const failedSession: PaymentSession = {
        ...session,
        status: 'failed',
        updatedAt: new Date()
      }
      this.storePaymentSession(failedSession)
      this.logPaymentEvent('payment.failed', failedSession)
      throw error
    }
  }

  // Process PayPal payment
  async processPayPalPayment(sessionId: string, paypalOrderId: string): Promise<PaymentSession> {
    const session = this.getPaymentSession(sessionId)
    if (!session) {
      throw new PaymentError({
        code: 'SESSION_NOT_FOUND',
        message: 'Payment session not found',
        type: 'validation'
      })
    }

    try {
      // Mock PayPal processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const updatedSession: PaymentSession = {
        ...session,
        status: 'succeeded',
        paymentMethod: 'paypal',
        updatedAt: new Date(),
        metadata: {
          ...session.metadata,
          paypalOrderId
        }
      }

      this.storePaymentSession(updatedSession)
      await this.grantEntitlement(updatedSession)
      this.logPaymentEvent('payment.succeeded', updatedSession)

      return updatedSession
    } catch (error) {
      const failedSession: PaymentSession = {
        ...session,
        status: 'failed',
        updatedAt: new Date()
      }
      this.storePaymentSession(failedSession)
      this.logPaymentEvent('payment.failed', failedSession)
      throw error
    }
  }

  // Grant entitlement after successful payment
  private async grantEntitlement(session: PaymentSession): Promise<Entitlement> {
    const plan = this.getPlanById(session.planId)
    if (!plan) {
      throw new Error('Plan not found for entitlement')
    }

    const now = new Date()
    let endDate: Date | undefined

    // Calculate end date based on plan type
    if (plan.type === 'time-pass' && plan.duration) {
      endDate = new Date(now)
      switch (plan.duration.unit) {
        case 'hour':
          endDate.setHours(endDate.getHours() + plan.duration.value)
          break
        case 'day':
          endDate.setDate(endDate.getDate() + plan.duration.value)
          break
        case 'week':
          endDate.setDate(endDate.getDate() + (plan.duration.value * 7))
          break
        case 'month':
          endDate.setMonth(endDate.getMonth() + plan.duration.value)
          break
        case 'year':
          endDate.setFullYear(endDate.getFullYear() + plan.duration.value)
          break
      }
    } else if (plan.type === 'subscription' && plan.duration) {
      endDate = new Date(now)
      if (plan.duration.unit === 'month') {
        endDate.setMonth(endDate.getMonth() + plan.duration.value)
      } else if (plan.duration.unit === 'year') {
        endDate.setFullYear(endDate.getFullYear() + plan.duration.value)
      }
    }

    const entitlement: Entitlement = {
      id: `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.userId,
      planId: session.planId,
      documentId: session.documentId,
      type: plan.type,
      status: 'active',
      startDate: now,
      endDate,
      features: plan.features,
      metadata: {
        sessionId: session.id,
        planName: plan.name
      }
    }

    this.storeEntitlement(entitlement)
    this.logPaymentEvent('entitlement.granted', entitlement)

    return entitlement
  }

  // Get user's billing status
  getBillingStatus(): BillingStatus {
    const entitlements = this.getUserEntitlements()
    const sessions = this.getUserPaymentHistory()
    
    const totalSpent = sessions
      .filter(session => session.status === 'succeeded')
      .reduce((sum, session) => sum + session.amount, 0)

    const activeSubscription = entitlements.find(ent => 
      ent.type === 'subscription' && ent.status === 'active'
    )

    return {
      userId: this.userId,
      activeEntitlements: entitlements.filter(ent => ent.status === 'active'),
      billingHistory: sessions,
      nextBillingDate: activeSubscription?.endDate,
      totalSpent,
      currency: 'SAR'
    }
  }

  // Check if user has access to a feature for a specific document
  hasDocumentAccess(documentId: string, feature: string): boolean {
    const entitlements = this.getUserEntitlements()
    
    // Check document-specific entitlements
    const docEntitlement = entitlements.find(ent => 
      ent.documentId === documentId && 
      ent.status === 'active' &&
      ent.features.includes(feature)
    )

    if (docEntitlement) return true

    // Check time passes and subscriptions
    const now = new Date()
    const generalEntitlement = entitlements.find(ent => 
      !ent.documentId &&
      ent.status === 'active' &&
      ent.features.includes(feature) &&
      (!ent.endDate || ent.endDate > now)
    )

    return !!generalEntitlement
  }

  // Storage helpers (mock implementation using localStorage)
  private storePaymentSession(session: PaymentSession) {
    const sessions = this.getUserPaymentHistory()
    const index = sessions.findIndex(s => s.id === session.id)
    if (index >= 0) {
      sessions[index] = session
    } else {
      sessions.push(session)
    }
    localStorage.setItem(`payment_sessions_${this.userId}`, JSON.stringify(sessions))
  }

  private getPaymentSession(sessionId: string): PaymentSession | null {
    const sessions = this.getUserPaymentHistory()
    return sessions.find(s => s.id === sessionId) || null
  }

  private getUserPaymentHistory(): PaymentSession[] {
    const stored = localStorage.getItem(`payment_sessions_${this.userId}`)
    return stored ? JSON.parse(stored) : []
  }

  private storeEntitlement(entitlement: Entitlement) {
    const entitlements = this.getUserEntitlements()
    entitlements.push(entitlement)
    localStorage.setItem(`entitlements_${this.userId}`, JSON.stringify(entitlements))
  }

  private getUserEntitlements(): Entitlement[] {
    const stored = localStorage.getItem(`entitlements_${this.userId}`)
    return stored ? JSON.parse(stored) : []
  }

  private logPaymentEvent(type: PaymentEvent['type'], data: any) {
    const event: PaymentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: data.id || data.sessionId || '',
      type,
      data,
      createdAt: new Date(),
      processed: true
    }

    const events = this.getPaymentEvents()
    events.push(event)
    localStorage.setItem(`payment_events_${this.userId}`, JSON.stringify(events))
  }

  private getPaymentEvents(): PaymentEvent[] {
    const stored = localStorage.getItem(`payment_events_${this.userId}`)
    return stored ? JSON.parse(stored) : []
  }

  // Apple Pay availability check
  async isApplePayAvailable(): Promise<boolean> {
    if (!this.stripe) return false
    
    try {
      const paymentRequest = this.stripe.paymentRequest({
        country: 'SA',
        currency: 'sar',
        total: { label: 'Demo', amount: 100 },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      const result = await paymentRequest.canMakePayment()
      return result ? result.applePay === true : false
    } catch {
      return false
    }
  }
}

export const paymentService = new PaymentService()

// PaymentError constructor helper
function PaymentError(error: Pick<PaymentError, 'code' | 'message' | 'type' | 'details'>): PaymentError {
  return {
    code: error.code,
    message: error.message,
    type: error.type,
    details: error.details
  }
}