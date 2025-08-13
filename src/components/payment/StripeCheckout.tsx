import { useState, useEffect } from 'react'
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  PaymentRequestButtonElement
} from '@stripe/react-stripe-js'
import { PaymentSession } from '@/types/payment'
import { paymentService } from '@/lib/payment-service'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, CreditCard, Smartphone } from 'lucide-react'

interface StripeCheckoutProps {
  session: PaymentSession
  onSuccess: (session: PaymentSession) => void
  onError: (error: any) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  useApplePay?: boolean
}

export function StripeCheckout({ 
  session, 
  onSuccess, 
  onError, 
  loading, 
  setLoading,
  useApplePay = false 
}: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canUseApplePay, setCanUseApplePay] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!stripe || !useApplePay) return

    const pr = stripe.paymentRequest({
      country: 'SA',
      currency: 'sar',
      total: {
        label: 'DocSmart AI',
        amount: Math.round(session.amount * 100), // Convert to smallest currency unit
      },
      requestPayerName: true,
      requestPayerEmail: true,
    })

    // Check if Apple Pay is available
    pr.canMakePayment().then(result => {
      if (result && result.applePay) {
        setPaymentRequest(pr)
        setCanUseApplePay(true)
      }
    })

    pr.on('paymentmethod', async (event) => {
      try {
        setLoading(true)
        
        // In production, you'd confirm the payment on your backend
        // For now, simulate successful Apple Pay payment
        const updatedSession = await paymentService.processApplePayPayment(session.id)
        
        // Complete the payment
        event.complete('success')
        onSuccess(updatedSession)
        
      } catch (error) {
        console.error('Apple Pay payment failed:', error)
        event.complete('fail')
        onError(error)
      } finally {
        setLoading(false)
      }
    })
  }, [stripe, session, useApplePay, setLoading, onSuccess, onError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // In a real implementation, you would:
      // 1. Create a PaymentIntent on your backend
      // 2. Confirm the payment with the returned client_secret
      
      // For this demo, we'll simulate the payment process
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        throw new Error(submitError.message)
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock successful payment - in production, this would be handled by webhooks
      const updatedSession = await paymentService.processStripePayment(session.id, 'mock_payment_method')
      
      onSuccess(updatedSession)
      
    } catch (error: any) {
      console.error('Payment failed:', error)
      setError(error.message || 'Payment failed. Please try again.')
      onError(error)
    } finally {
      setLoading(false)
    }
  }

  if (useApplePay) {
    if (!canUseApplePay) {
      return (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Apple Pay is not available on this device or browser.
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Pay securely with Apple Pay
          </p>
          {paymentRequest && (
            <PaymentRequestButtonElement 
              options={{ paymentRequest }}
              className="apple-pay-button"
            />
          )}
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Processing Apple Pay payment...</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-medium">Card Information</label>
        
        {/* Mock Payment Element - in production, use actual PaymentElement */}
        <div className="p-4 border rounded-lg bg-background">
          <div className="space-y-3">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="1234 1234 1234 1234"
                className="w-full p-2 border rounded text-sm"
                disabled={loading}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="p-2 border rounded text-sm"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="p-2 border rounded text-sm"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full name on card"
                className="w-full p-2 border rounded text-sm"
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        {/* In production, replace the above with: */}
        {/* <PaymentElement options={{ layout: 'tabs' }} /> */}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || loading}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay {session.currency} {session.amount}
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        <p>
          Your payment will be processed securely by Stripe. 
          By completing this purchase, you agree to our terms of service.
        </p>
      </div>
    </form>
  )
}