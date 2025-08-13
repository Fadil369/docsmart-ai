import { useState } from 'react'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { PaymentSession, PaymentPlan } from '@/types/payment'
import { paymentService } from '@/lib/payment-service'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PayPalCheckoutProps {
  session: PaymentSession
  plan: PaymentPlan
  onSuccess: (session: PaymentSession) => void
  onError: (error: any) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function PayPalCheckout({ 
  session, 
  plan, 
  onSuccess, 
  onError, 
  loading, 
  setLoading 
}: PayPalCheckoutProps) {
  const [{ isResolved, isRejected, isLoading }] = usePayPalScriptReducer()
  const [error, setError] = useState<string>('')

  // Convert SAR to USD for PayPal (approximate conversion)
  // In production, use real-time exchange rates
  const convertSARToUSD = (sarAmount: number) => {
    const exchangeRate = 0.27 // Approximate SAR to USD rate
    return (sarAmount * exchangeRate).toFixed(2)
  }

  const usdAmount = convertSARToUSD(session.amount)

  const createOrder = async () => {
    try {
      // In production, this should call your backend to create PayPal order
      return Promise.resolve('mock_paypal_order_id_' + Date.now())
    } catch (error) {
      console.error('Failed to create PayPal order:', error)
      throw error
    }
  }

  const onApprove = async (data: any) => {
    try {
      setLoading(true)
      setError('')
      
      // In production, capture the payment on your backend
      // For demo, simulate successful PayPal payment
      const updatedSession = await paymentService.processPayPalPayment(
        session.id, 
        data.orderID || 'mock_order_id'
      )
      
      toast.success('PayPal payment successful!')
      onSuccess(updatedSession)
      
    } catch (error: any) {
      console.error('PayPal payment capture failed:', error)
      setError(error.message || 'Payment capture failed')
      onError(error)
    } finally {
      setLoading(false)
    }
  }

  const onErrorHandler = (error: any) => {
    console.error('PayPal payment error:', error)
    setError('PayPal payment failed. Please try again.')
    onError(error)
  }

  const onCancel = () => {
    toast.info('Payment cancelled')
    setError('Payment was cancelled')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading PayPal...</span>
      </div>
    )
  }

  if (isRejected) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load PayPal. Please check your internet connection and try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!isResolved) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Initializing PayPal...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Currency Notice */}
      <Alert>
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Currency Conversion Notice</p>
            <p className="text-sm">
              PayPal processes payments in USD. Your {session.currency} {session.amount} 
              will be charged as approximately ${usdAmount} USD at current exchange rates.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* PayPal Buttons */}
      <div className="paypal-buttons-container">
        {plan.type === 'subscription' ? (
          // For subscriptions, use PayPal subscription buttons
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'subscribe'
            }}
            createSubscription={async () => {
              // In production, create subscription on backend
              return 'mock_subscription_id_' + Date.now()
            }}
            onApprove={onApprove}
            onError={onErrorHandler}
            onCancel={onCancel}
            disabled={loading}
          />
        ) : (
          // For one-time payments, use regular PayPal buttons
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'pay'
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            onCancel={onCancel}
            disabled={loading}
          />
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">Processing PayPal payment...</span>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        <p>
          Secure payment powered by PayPal. You will be redirected to PayPal to complete your purchase.
        </p>
      </div>
    </div>
  )
}