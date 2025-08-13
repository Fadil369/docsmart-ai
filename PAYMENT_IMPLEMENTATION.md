# Payment System Implementation Guide

## Overview

This implementation provides a comprehensive payment system for DocSmart AI with SAR (Saudi Riyal) currency support, multiple payment gateways (Stripe, PayPal, Apple Pay), and flexible billing plans.

## Features

### 🏦 Payment Methods
- **Stripe**: Credit/Debit cards with 3D Secure support
- **Apple Pay**: Seamless mobile payments via Stripe
- **PayPal**: Alternative payment method with subscription support

### 💰 Currency Support
- **Primary Currency**: SAR (Saudi Riyal)
- **Localized Formatting**: Arabic number formatting (١٥٫٠٠ ر.س.)
- **Exchange Rate Handling**: PayPal USD conversion with rate display

### 📋 Payment Plans

#### Per-Document Plans
- **Basic Analysis**: 15 SAR - AI analysis for one document
- **Premium Analysis**: 25 SAR - Advanced analysis with collaboration

#### Time Passes
- **1 Hour Pass**: 20 SAR - Full access for 1 hour
- **24 Hour Pass**: 75 SAR - Full access for 24 hours (Popular)
- **7 Day Pass**: 200 SAR - Full access for 1 week

#### Subscriptions
- **Monthly Pro**: 299 SAR/month - Complete access
- **Annual Pro**: 2,990 SAR/year - Annual billing with 2 months free (Popular)

### 🎯 Entitlement System

The system tracks user access through three types of entitlements:

1. **Per-Document**: Linked to specific document IDs
2. **Time Passes**: Time-bound access with start/end dates
3. **Subscriptions**: Recurring access with renewal tracking

### 🔧 Technical Architecture

#### Core Components

```
src/types/payment.ts         - Type definitions and plan configurations
src/lib/payment-service.ts   - Payment processing and entitlement logic
src/components/payment/      - Payment UI components
├── PaymentPage.tsx         - Main payment flow orchestrator
├── PlanSelection.tsx       - Plan comparison and selection
├── PaymentCheckout.tsx     - Unified checkout interface
├── StripeCheckout.tsx      - Stripe payment implementation
├── PayPalCheckout.tsx      - PayPal payment implementation
├── PaymentSuccess.tsx      - Success confirmation page
├── PaymentError.tsx        - Error handling and recovery
└── BillingStatus.tsx       - Billing dashboard component
```

#### Integration Points

1. **App.tsx**: Main app routing and payment page state management
2. **Header.tsx**: "Upgrade" button for payment access
3. **AppSidebar.tsx**: "Billing" tab for account management

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with your payment gateway credentials:

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# PayPal Configuration  
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Webhook Secrets
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
```

### 2. Update Payment Service Configuration

Replace mock values in `src/lib/payment-service.ts`:

```typescript
// Replace these lines
const STRIPE_PUBLIC_KEY = 'pk_test_mock'
const PAYPAL_CLIENT_ID = 'mock_paypal_client_id'

// With environment variables
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID
```

### 3. Backend Integration

The current implementation uses localStorage for mock data. For production:

1. **Create Backend API Endpoints**:
   - `POST /api/payments/create-session` - Create payment intent
   - `POST /api/payments/confirm` - Confirm payment
   - `POST /api/webhooks/stripe` - Stripe webhook handler
   - `POST /api/webhooks/paypal` - PayPal webhook handler
   - `GET /api/billing/status` - Get user billing status
   - `GET /api/entitlements` - Get user entitlements

2. **Database Schema**:
   ```sql
   -- Payment sessions
   CREATE TABLE payment_sessions (
     id VARCHAR PRIMARY KEY,
     user_id VARCHAR NOT NULL,
     plan_id VARCHAR NOT NULL,
     document_id VARCHAR,
     amount DECIMAL(10,2) NOT NULL,
     currency VARCHAR(3) DEFAULT 'SAR',
     status VARCHAR(20) NOT NULL,
     payment_method VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Entitlements
   CREATE TABLE entitlements (
     id VARCHAR PRIMARY KEY,
     user_id VARCHAR NOT NULL,
     plan_id VARCHAR NOT NULL,
     document_id VARCHAR,
     type VARCHAR(20) NOT NULL,
     status VARCHAR(20) NOT NULL,
     start_date TIMESTAMP NOT NULL,
     end_date TIMESTAMP,
     features JSON,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Payment events for auditing
   CREATE TABLE payment_events (
     id VARCHAR PRIMARY KEY,
     session_id VARCHAR NOT NULL,
     type VARCHAR(50) NOT NULL,
     data JSON,
     processed BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 4. Webhook Implementation

#### Stripe Webhooks

```typescript
import { stripe } from './stripe-config'

export async function handleStripeWebhook(req: Request) {
  const sig = req.headers['stripe-signature']
  const payload = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await grantEntitlement(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await renewSubscription(event.data.object)
        break
      case 'customer.subscription.deleted':
        await cancelSubscription(event.data.object)
        break
    }
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    return new Response('Webhook Error', { status: 400 })
  }
}
```

#### PayPal Webhooks

```typescript
export async function handlePayPalWebhook(req: Request) {
  const event = await req.json()
  
  // Verify webhook signature
  const isValid = await verifyPayPalWebhook(event, req.headers)
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 })
  }
  
  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await grantEntitlement(event.resource)
      break
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await activateSubscription(event.resource)
      break
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await cancelSubscription(event.resource)
      break
  }
  
  return new Response('OK', { status: 200 })
}
```

## Usage Examples

### 1. Access Payment Page

```typescript
// From any component
const [showPayments, setShowPayments] = useState(false)

// Open payment page
<PaymentPage 
  onClose={() => setShowPayments(false)}
  onSuccess={(session) => {
    console.log('Payment successful:', session)
    setShowPayments(false)
  }}
/>
```

### 2. Document-Specific Payment

```typescript
// For document unlock
<PaymentPage 
  documentId="doc_123"
  onClose={handleClose}
  onSuccess={handleSuccess}
/>
```

### 3. Check User Access

```typescript
import { paymentService } from '@/lib/payment-service'

// Check if user has access to a feature for a document
const hasAccess = paymentService.hasDocumentAccess(
  'doc_123', 
  'AI Analysis'
)

if (!hasAccess) {
  // Show upgrade prompt
}
```

### 4. Display Billing Status

```typescript
import { BillingStatus } from '@/components/payment'

<BillingStatus 
  onUpgrade={() => setShowPayments(true)}
/>
```

## Testing

### 1. Stripe Test Cards

```javascript
// Successful payment
4242424242424242

// Declined payment
4000000000000002

// 3D Secure required
4000000000003220
```

### 2. PayPal Sandbox

Use PayPal Developer sandbox credentials for testing.

### 3. Apple Pay Testing

Apple Pay requires HTTPS and proper domain validation.

## Security Considerations

1. **PCI Compliance**: All card data handled by Stripe/PayPal
2. **Webhook Verification**: All webhooks must verify signatures
3. **Environment Separation**: Use different keys for dev/staging/production
4. **Rate Limiting**: Implement rate limits on payment endpoints
5. **Fraud Detection**: Use Stripe Radar for fraud prevention

## Monitoring & Analytics

### Key Metrics to Track

1. **Conversion Rates**: Plan selection → payment completion
2. **Payment Method Usage**: Card vs PayPal vs Apple Pay
3. **Failed Payments**: By reason and payment method
4. **Revenue**: By plan type and time period
5. **Churn**: Subscription cancellations

### Recommended Tools

- **Stripe Dashboard**: Built-in analytics and reporting
- **PayPal Reports**: Transaction and subscription analytics
- **Custom Analytics**: Track user behavior and conversion funnels

## Troubleshooting

### Common Issues

1. **Stripe.js Load Failures**: Check public key and network access
2. **PayPal Script Errors**: Verify client ID and sandbox settings
3. **Webhook Failures**: Check endpoint URLs and signature verification
4. **Currency Conversion**: Ensure proper SAR → USD rates for PayPal

### Debug Tools

```typescript
// Enable debug logging
localStorage.setItem('payment_debug', 'true')

// Check payment service state
console.log(paymentService.getBillingStatus())
```

## Future Enhancements

1. **Additional Payment Methods**: 
   - MADA (Saudi local payment)
   - Bank transfers
   - Cryptocurrency

2. **Advanced Features**:
   - Promo codes and discounts
   - Usage-based billing
   - Multi-user team plans
   - Invoice generation

3. **Regional Expansion**:
   - Multi-currency support
   - Localized payment methods
   - Tax calculation by region

## Support

For implementation questions or issues:
- Email: support@docsmart.ai
- Documentation: [Payment API Docs]
- Slack: #payments-support