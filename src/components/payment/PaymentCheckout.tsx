import { useState, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { PaymentPlan, PaymentSession, formatSAR } from '@/types/payment'
import { paymentService } from '@/lib/payment-service'
import { StripeCheckout } from './StripeCheckout'
import { PayPalCheckout } from './PayPalCheckout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  CreditCard, 
  Smartphone, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Loader2,
  Shield,
  Lock
} from 'lucide-react'

// Mock Stripe public key - replace with actual key
const stripePromise = loadStripe('pk_test_mock')

// Mock PayPal client ID - replace with actual client ID  
const PAYPAL_CLIENT_ID = 'mock_paypal_client_id'

interface PaymentCheckoutProps {
  plan: PaymentPlan
  documentId?: string
  onBack: () => void
  onSuccess: (session: PaymentSession) => void
  onError: (error: any) => void
}

export function PaymentCheckout({ 
  plan, 
  documentId, 
  onBack, 
  onSuccess, 
  onError 
}: PaymentCheckoutProps) {
  const [session, setSession] = useState<PaymentSession | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('stripe-card')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(true)
  const [applePayAvailable, setApplePayAvailable] = useState(false)

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setCreating(true)
        
        // Initialize payment service
        await paymentService.initialize()
        
        // Check Apple Pay availability
        const applePaySupported = await paymentService.isApplePayAvailable()
        setApplePayAvailable(applePaySupported)
        
        // Create payment session
        const newSession = await paymentService.createPaymentSession(plan.id, documentId)
        setSession(newSession)
        
      } catch (error) {
        console.error('Failed to initialize checkout:', error)
        toast.error('Failed to initialize payment')
        onError(error)
      } finally {
        setCreating(false)
      }
    }

    initializeCheckout()
  }, [plan.id, documentId, onError])

  const handlePaymentSuccess = async (updatedSession: PaymentSession) => {
    toast.success('Payment successful!', {
      description: 'Your access has been activated.'
    })
    onSuccess(updatedSession)
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error)
    toast.error('Payment failed', {
      description: error.message || 'Please try again or contact support.'
    })
    onError(error)
  }

  const paymentMethodOptions = [
    { id: 'stripe-card', label: 'Credit/Debit Card', icon: CreditCard, enabled: true },
    { id: 'stripe-apple-pay', label: 'Apple Pay', icon: Smartphone, enabled: applePayAvailable },
    { id: 'paypal', label: 'PayPal', icon: () => (
      <div className="text-[#0070ba] font-bold text-sm">PayPal</div>
    ), enabled: true }
  ].filter(option => option.enabled)

  if (creating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle>Setting up your payment...</CardTitle>
              <CardDescription>Please wait while we prepare your checkout</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <CardTitle>Payment Setup Failed</CardTitle>
              <CardDescription>
                Unable to create payment session. Please try again.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onBack} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
              <p className="text-muted-foreground">
                Secure checkout powered by Stripe and PayPal
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Payment Form - Takes more space */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="grid gap-4">
                      {paymentMethodOptions.map((option) => (
                        <div key={option.id}>
                          <Label
                            htmlFor={option.id}
                            className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem value={option.id} id={option.id} />
                            <option.icon className="h-6 w-6" />
                            <span className="font-medium text-base">{option.label}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <Separator />

                  {/* Payment Form */}
                  <div className="space-y-6">
                    {paymentMethod === 'stripe-card' && (
                      <Elements stripe={stripePromise}>
                        <StripeCheckout
                          session={session}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          loading={loading}
                          setLoading={setLoading}
                        />
                      </Elements>
                    )}

                    {paymentMethod === 'stripe-apple-pay' && applePayAvailable && (
                      <Elements stripe={stripePromise}>
                        <StripeCheckout
                          session={session}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          loading={loading}
                          setLoading={setLoading}
                          useApplePay={true}
                        />
                      </Elements>
                    )}

                    {paymentMethod === 'paypal' && (
                      <PayPalScriptProvider 
                        options={{ 
                          "client-id": PAYPAL_CLIENT_ID,
                          currency: "USD", // PayPal may require USD, convert from SAR
                          intent: "capture"
                        }}
                      >
                        <PayPalCheckout
                          session={session}
                          plan={plan}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          loading={loading}
                          setLoading={setLoading}
                        />
                      </PayPalScriptProvider>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Secure Payment</p>
                        <p className="text-xs text-muted-foreground">
                          Your payment is secured with industry-standard encryption.
                          We don't store your card details on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-lg">{plan.name}</span>
                        {plan.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {plan.description}
                      </p>
                      {plan.duration && (
                        <p className="text-sm text-muted-foreground">
                          Duration: {plan.duration.value} {plan.duration.unit}
                          {plan.duration.value > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">Included Features:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatSAR(plan.priceInSAR)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>Included</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>{formatSAR(plan.priceInSAR)}</span>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>SSL Encrypted</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>PCI Compliant</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
