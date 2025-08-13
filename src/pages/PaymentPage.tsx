import { motion } from 'framer-motion'
import { ArrowLeft, Check, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PaymentCheckout } from '@/components/payment/PaymentCheckout'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for individuals and small projects',
    features: [
      '50 documents per month',
      'Basic AI analysis',
      'PDF, Word, Text support',
      'Email support'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Ideal for businesses and teams',
    features: [
      '500 documents per month',
      'Advanced AI analysis',
      'All file formats',
      'Priority support',
      'Team collaboration',
      'Custom integrations'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large organizations with high volume needs',
    features: [
      'Unlimited documents',
      'Enterprise AI models',
      'White-label solution',
      'Dedicated support',
      'Advanced security',
      'Custom deployment'
    ],
    popular: false
  }
]

export function PaymentPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Choose Your Plan</h1>
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock unlimited document processing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Plans Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2">Pricing Plans</h2>
              <p className="text-muted-foreground">
                Choose the perfect plan for your document processing needs
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative rounded-lg border p-6 ${
                    plan.popular
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-card'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        <Star className="h-3 w-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center lg:text-left">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>

                    <ul className="space-y-2 text-left">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-lg bg-muted/50 p-4"
            >
              <div className="text-center lg:text-left">
                <h4 className="font-semibold mb-2">Why choose DocSmart AI?</h4>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    30-day money back guarantee
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Enterprise-grade security
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Cancel anytime
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    24/7 customer support
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:sticky lg:top-8"
          >
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Complete Your Purchase</h3>
                <p className="text-sm text-muted-foreground">
                  Start your subscription and unlock all features
                </p>
              </div>
              
              <PaymentCheckout />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
