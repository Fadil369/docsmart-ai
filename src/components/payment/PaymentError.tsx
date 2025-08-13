import { motion } from 'framer-motion'
import { PaymentError as PaymentErrorType } from '@/types/payment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  XCircle, 
  RefreshCw, 
  ArrowLeft, 
  AlertCircle, 
  CreditCard,
  Wifi,
  Shield,
  HelpCircle
} from 'lucide-react'

interface PaymentErrorProps {
  error: PaymentErrorType | any
  onRetry: () => void
  onStartOver: () => void
  onClose?: () => void
}

export function PaymentError({ error, onRetry, onStartOver, onClose }: PaymentErrorProps) {
  const getErrorIcon = () => {
    if (error?.type === 'network') return Wifi
    if (error?.type === 'payment') return CreditCard
    if (error?.type === 'configuration') return Shield
    return AlertCircle
  }

  const getErrorTitle = () => {
    switch (error?.type) {
      case 'network':
        return 'Connection Error'
      case 'payment':
        return 'Payment Failed'
      case 'validation':
        return 'Invalid Payment Information'
      case 'configuration':
        return 'Payment System Error'
      default:
        return 'Payment Failed'
    }
  }

  const getErrorMessage = () => {
    if (error?.message) {
      return error.message
    }
    
    switch (error?.code) {
      case 'CARD_DECLINED':
        return 'Your card was declined. Please try a different payment method or contact your bank.'
      case 'INSUFFICIENT_FUNDS':
        return 'Your card has insufficient funds. Please try a different payment method.'
      case 'EXPIRED_CARD':
        return 'Your card has expired. Please use a different card.'
      case 'NETWORK_ERROR':
        return 'We couldn\'t connect to our payment processor. Please check your internet connection and try again.'
      case 'PLAN_NOT_FOUND':
        return 'The selected plan is no longer available. Please choose a different plan.'
      case 'SESSION_EXPIRED':
        return 'Your payment session has expired. Please start over.'
      default:
        return 'Something went wrong while processing your payment. Please try again.'
    }
  }

  const getSuggestions = () => {
    const suggestions = []
    
    switch (error?.type) {
      case 'network':
        suggestions.push('Check your internet connection')
        suggestions.push('Try again in a few moments')
        suggestions.push('Contact support if the problem persists')
        break
      case 'payment':
        suggestions.push('Verify your card information is correct')
        suggestions.push('Try a different payment method')
        suggestions.push('Contact your bank if the issue continues')
        suggestions.push('Use PayPal as an alternative')
        break
      case 'validation':
        suggestions.push('Double-check your card details')
        suggestions.push('Ensure your billing address is correct')
        suggestions.push('Try typing your information again')
        break
      default:
        suggestions.push('Try again with the same payment method')
        suggestions.push('Use a different payment method')
        suggestions.push('Contact support if you need assistance')
    }
    
    return suggestions
  }

  const ErrorIcon = getErrorIcon()

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Error Icon and Message */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-destructive">{getErrorTitle()}</h2>
            <p className="text-lg text-muted-foreground">
              We encountered an issue while processing your payment
            </p>
          </div>
        </div>

        {/* Error Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ErrorIcon className="h-5 w-5 text-destructive" />
              Error Details
            </CardTitle>
            <CardDescription>
              Here's what went wrong and how to fix it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getErrorMessage()}
              </AlertDescription>
            </Alert>
            
            {error?.code && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Error Code</p>
                <p className="text-sm text-muted-foreground font-mono">{error.code}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              What You Can Do
            </CardTitle>
            <CardDescription>
              Try these steps to resolve the issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getSuggestions().map((suggestion, index) => (
                <motion.li
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={onRetry} className="flex-1" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button onClick={onStartOver} variant="outline" className="flex-1" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Choose Different Plan
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="text-center space-y-3">
          {onClose && (
            <Button onClick={onClose} variant="ghost">
              Return to App
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>
              Still having trouble? Contact our support team at{' '}
              <a href="mailto:support@docsmart.ai" className="text-primary hover:underline">
                support@docsmart.ai
              </a>
            </p>
            <p className="mt-1">
              Include error code{' '}
              <span className="font-mono bg-muted px-1 rounded">
                {error?.code || 'UNKNOWN_ERROR'}
              </span>{' '}
              for faster assistance
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}