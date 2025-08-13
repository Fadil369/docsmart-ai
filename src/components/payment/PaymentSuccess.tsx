import { motion } from 'framer-motion'
import { PaymentSession, PaymentPlan, formatSAR } from '@/types/payment'
import { paymentService } from '@/lib/payment-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Download, 
  Calendar, 
  CreditCard, 
  FileText, 
  ArrowRight,
  Clock
} from 'lucide-react'

interface PaymentSuccessProps {
  session: PaymentSession
  plan: PaymentPlan
  onStartOver: () => void
  onClose?: () => void
}

export function PaymentSuccess({ session, plan, onStartOver, onClose }: PaymentSuccessProps) {
  const billingStatus = paymentService.getBillingStatus()
  
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'stripe-card':
        return 'Credit/Debit Card'
      case 'stripe-apple-pay':
        return 'Apple Pay'
      case 'paypal':
        return 'PayPal'
      default:
        return method
    }
  }

  const getAccessDescription = () => {
    if (plan.type === 'per-document' && session.documentId) {
      return `You now have access to premium features for your document.`
    } else if (plan.type === 'time-pass' && plan.duration) {
      return `You have unlimited access for ${plan.duration.value} ${plan.duration.unit}${plan.duration.value > 1 ? 's' : ''}.`
    } else if (plan.type === 'subscription' && plan.duration) {
      return `Your ${plan.duration.unit}ly subscription is now active.`
    }
    return 'Your access has been activated.'
  }

  const getExpirationInfo = () => {
    const activeEntitlement = billingStatus.activeEntitlements.find(
      ent => ent.planId === plan.id
    )
    
    if (activeEntitlement?.endDate) {
      const endDate = new Date(activeEntitlement.endDate)
      return {
        hasExpiration: true,
        endDate: endDate.toLocaleDateString('en-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
    
    return { hasExpiration: false }
  }

  const expirationInfo = getExpirationInfo()

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Success Icon and Message */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-lg text-muted-foreground">
              {getAccessDescription()}
            </p>
          </div>
        </div>

        {/* Payment Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Plan</p>
                <p className="text-sm text-muted-foreground">{plan.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Amount</p>
                <p className="text-sm text-muted-foreground">{formatSAR(session.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">
                  {getPaymentMethodDisplay(session.paymentMethod)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Transaction ID</p>
                <p className="text-sm text-muted-foreground font-mono">{session.id}</p>
              </div>
            </div>
            
            {expirationInfo.hasExpiration && (
              <>
                <Separator />
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Access Expires</p>
                    <p className="text-sm text-muted-foreground">{expirationInfo.endDate}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Features Unlocked */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Features Unlocked
            </CardTitle>
            <CardDescription>
              You now have access to these premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plan.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Here's what you can do now that your payment is complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Start Using Your Features</p>
                <p className="text-sm text-muted-foreground">
                  All premium features are now available in your workspace
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Download className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Download Receipt</p>
                <p className="text-sm text-muted-foreground">
                  Save your payment confirmation for your records
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            {plan.type === 'subscription' && (
              <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Manage Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    View billing history and manage your subscription
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onClose && (
            <Button onClick={onClose} className="flex-1" size="lg">
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue to App
            </Button>
          )}
          
          <Button onClick={onStartOver} variant="outline" className="flex-1" size="lg">
            Purchase Another Plan
          </Button>
        </div>

        {/* Support Info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@docsmart.ai" className="text-primary hover:underline">
              support@docsmart.ai
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}