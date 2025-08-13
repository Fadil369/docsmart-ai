import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PaymentPlan, PaymentSession } from '@/types/payment'
import { PlanSelection } from './PlanSelection'
import { PaymentCheckout } from './PaymentCheckout'
import { PaymentSuccess } from './PaymentSuccess'
import { PaymentError } from './PaymentError'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard } from 'lucide-react'

type PaymentStep = 'plan-selection' | 'checkout' | 'success' | 'error'

interface PaymentPageProps {
  documentId?: string
  initialPlanId?: string
  onClose?: () => void
  onSuccess?: (session: PaymentSession) => void
}

export function PaymentPage({ 
  documentId, 
  initialPlanId, 
  onClose, 
  onSuccess 
}: PaymentPageProps) {
  const [step, setStep] = useState<PaymentStep>('plan-selection')
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)
  const [completedSession, setCompletedSession] = useState<PaymentSession | null>(null)
  const [error, setError] = useState<any>(null)

  const handlePlanSelected = (plan: PaymentPlan) => {
    setSelectedPlan(plan)
    setStep('checkout')
  }

  const handleBackToPlans = () => {
    setStep('plan-selection')
    setSelectedPlan(null)
    setError(null)
  }

  const handlePaymentSuccess = (session: PaymentSession) => {
    setCompletedSession(session)
    setStep('success')
    onSuccess?.(session)
  }

  const handlePaymentError = (error: any) => {
    setError(error)
    setStep('error')
  }

  const handleRetryPayment = () => {
    setError(null)
    setStep('checkout')
  }

  const handleStartOver = () => {
    setSelectedPlan(null)
    setCompletedSession(null)
    setError(null)
    setStep('plan-selection')
  }

  const getStepTitle = () => {
    switch (step) {
      case 'plan-selection':
        return documentId ? 'Unlock Document Features' : 'Choose Your Plan'
      case 'checkout':
        return 'Complete Your Purchase'
      case 'success':
        return 'Payment Successful!'
      case 'error':
        return 'Payment Failed'
      default:
        return 'Payment'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 'plan-selection':
        return documentId 
          ? 'Select a plan to unlock advanced features for your document'
          : 'Choose the plan that best fits your needs'
      case 'checkout':
        return 'Secure checkout powered by Stripe and PayPal'
      case 'success':
        return 'Your payment has been processed and access has been granted'
      case 'error':
        return 'Something went wrong with your payment'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <Button onClick={onClose} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Button>
              )}
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">DocSmart AI Payments</h1>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`flex items-center gap-2 ${step === 'plan-selection' ? 'text-primary' : ''}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                  step === 'plan-selection' ? 'border-primary bg-primary text-primary-foreground' : 
                  ['checkout', 'success', 'error'].includes(step) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
                }`}>
                  1
                </div>
                <span>Select Plan</span>
              </div>
              
              <div className="w-8 h-px bg-border" />
              
              <div className={`flex items-center gap-2 ${step === 'checkout' ? 'text-primary' : ''}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                  step === 'checkout' ? 'border-primary bg-primary text-primary-foreground' : 
                  ['success', 'error'].includes(step) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
                }`}>
                  2
                </div>
                <span>Payment</span>
              </div>
              
              <div className="w-8 h-px bg-border" />
              
              <div className={`flex items-center gap-2 ${['success', 'error'].includes(step) ? 'text-primary' : ''}`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                  ['success', 'error'].includes(step) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
                }`}>
                  3
                </div>
                <span>Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">{getStepTitle()}</h2>
            <p className="text-lg text-muted-foreground">{getStepDescription()}</p>
          </motion.div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 'plan-selection' && (
              <motion.div
                key="plan-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PlanSelection
                  documentId={documentId}
                  onPlanSelected={handlePlanSelected}
                  selectedPlanId={initialPlanId}
                />
              </motion.div>
            )}

            {step === 'checkout' && selectedPlan && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentCheckout
                  plan={selectedPlan}
                  documentId={documentId}
                  onBack={handleBackToPlans}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </motion.div>
            )}

            {step === 'success' && completedSession && selectedPlan && (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentSuccess
                  session={completedSession}
                  plan={selectedPlan}
                  onStartOver={handleStartOver}
                  onClose={onClose}
                />
              </motion.div>
            )}

            {step === 'error' && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentError
                  error={error}
                  onRetry={handleRetryPayment}
                  onStartOver={handleStartOver}
                  onClose={onClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}