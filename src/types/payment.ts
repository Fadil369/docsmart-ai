// Payment and billing types for SAR currency support

export interface PaymentPlan {
  id: string
  name: string
  description: string
  type: 'per-document' | 'time-pass' | 'subscription'
  priceInSAR: number
  currency: 'SAR'
  duration?: {
    value: number
    unit: 'hour' | 'day' | 'week' | 'month' | 'year'
  }
  features: string[]
  popular?: boolean
}

export interface PaymentMethod {
  id: string
  type: 'stripe-card' | 'stripe-apple-pay' | 'paypal'
  enabled: boolean
}

export interface PaymentSession {
  id: string
  planId: string
  userId: string
  documentId?: string // For per-document purchases
  amount: number
  currency: 'SAR'
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, unknown>
}

export interface Entitlement {
  id: string
  userId: string
  planId: string
  documentId?: string // For per-document entitlements
  type: 'per-document' | 'time-pass' | 'subscription'
  status: 'active' | 'expired' | 'canceled' | 'past_due'
  startDate: Date
  endDate?: Date
  features: string[]
  metadata?: Record<string, unknown>
}

export interface PaymentEvent {
  id: string
  sessionId: string
  type: 'payment.created' | 'payment.succeeded' | 'payment.failed' | 'subscription.created' | 'subscription.updated' | 'subscription.canceled' | 'entitlement.granted' | 'entitlement.revoked'
  data: Record<string, unknown>
  createdAt: Date
  processed: boolean
}

export interface BillingStatus {
  userId: string
  activeEntitlements: Entitlement[]
  billingHistory: PaymentSession[]
  nextBillingDate?: Date
  totalSpent: number
  currency: 'SAR'
}

export interface PaymentError {
  code: string
  message: string
  type: 'validation' | 'payment' | 'network' | 'configuration'
  details?: Record<string, unknown>
}

// SAR Currency formatting
export const formatSAR = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Plan configurations
export const PAYMENT_PLANS: PaymentPlan[] = [
  // Per-document plans
  {
    id: 'per-doc-basic',
    name: 'Document Analysis',
    description: 'Unlock AI analysis for one document',
    type: 'per-document',
    priceInSAR: 15,
    currency: 'SAR',
    features: ['AI Analysis', 'Document Insights', 'Basic Annotations']
  },
  {
    id: 'per-doc-premium',
    name: 'Premium Document Analysis',
    description: 'Advanced AI analysis with collaboration features',
    type: 'per-document',
    priceInSAR: 25,
    currency: 'SAR',
    features: ['Advanced AI Analysis', 'Collaboration Tools', 'Priority Support', 'Export Options']
  },
  
  // Time passes
  {
    id: 'time-pass-1hour',
    name: '1 Hour Pass',
    description: 'Full access to all features for 1 hour',
    type: 'time-pass',
    priceInSAR: 20,
    currency: 'SAR',
    duration: { value: 1, unit: 'hour' },
    features: ['Unlimited Documents', 'All AI Features', 'Collaboration', 'Priority Processing']
  },
  {
    id: 'time-pass-1day',
    name: '24 Hour Pass',
    description: 'Full access to all features for 24 hours',
    type: 'time-pass',
    priceInSAR: 75,
    currency: 'SAR',
    duration: { value: 1, unit: 'day' },
    features: ['Unlimited Documents', 'All AI Features', 'Collaboration', 'Priority Processing', 'Advanced Analytics'],
    popular: true
  },
  {
    id: 'time-pass-1week',
    name: '7 Day Pass',
    description: 'Full access to all features for 1 week',
    type: 'time-pass',
    priceInSAR: 200,
    currency: 'SAR',
    duration: { value: 1, unit: 'week' },
    features: ['Unlimited Documents', 'All AI Features', 'Collaboration', 'Priority Processing', 'Advanced Analytics', 'Custom Templates']
  },
  
  // Subscriptions
  {
    id: 'subscription-monthly',
    name: 'Monthly Pro',
    description: 'Complete access with monthly billing',
    type: 'subscription',
    priceInSAR: 299,
    currency: 'SAR',
    duration: { value: 1, unit: 'month' },
    features: ['Unlimited Documents', 'All AI Features', 'Team Collaboration', 'Priority Support', 'Advanced Analytics', 'Custom Branding', 'API Access']
  },
  {
    id: 'subscription-annual',
    name: 'Annual Pro',
    description: 'Complete access with annual billing (2 months free)',
    type: 'subscription',
    priceInSAR: 2990, // ~10 months price
    currency: 'SAR',
    duration: { value: 1, unit: 'year' },
    features: ['Unlimited Documents', 'All AI Features', 'Team Collaboration', 'Priority Support', 'Advanced Analytics', 'Custom Branding', 'API Access', '2 Months Free'],
    popular: true
  }
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'stripe-card', type: 'stripe-card', enabled: true },
  { id: 'stripe-apple-pay', type: 'stripe-apple-pay', enabled: true },
  { id: 'paypal', type: 'paypal', enabled: true }
]