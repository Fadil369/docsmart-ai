import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, Star, Zap, Shield, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface PaymentPageProps {
  onBackToApp?: () => void
  recommendedPlan?: string
}

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'month',
    description: 'Perfect for individuals and small teams',
    features: [
      'Unlimited document uploads',
      'Advanced AI analysis',
      'Premium templates',
      'Export in all formats',
      'Priority support',
      'Team collaboration (up to 5 users)'
    ],
    highlighted: false
  },
  {
    id: 'business',
    name: 'Business',
    price: '$89',
    period: 'month',
    description: 'Best for growing teams and businesses',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Advanced analytics',
      'Custom templates',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options'
    ],
    highlighted: true,
    badge: 'Most Popular'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Business',
      'Custom deployment',
      'Advanced security',
      'Compliance features',
      'Custom SLA',
      'Dedicated support team',
      'Training and onboarding'
    ],
    highlighted: false
  }
]

export function PaymentPage({ onBackToApp, recommendedPlan = 'business' }: PaymentPageProps) {
  const handlePlanSelect = (planId: string) => {
    // In a real app, this would initiate the payment flow
    console.log('Selected plan:', planId)
    alert(`Payment flow would start for ${planId} plan`)
  }

  const handleBackToApp = () => {
    if (onBackToApp) {
      onBackToApp()
    } else {
      window.location.hash = '#/'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mb-4">
            <Badge variant="secondary" className="mb-4">
              🚀 Trial Expired
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Continue Your DocSmart AI Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            You've experienced the power of AI-driven document analysis. 
            Choose a plan to unlock unlimited access and premium features.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: Zap, title: 'AI-Powered', desc: 'Advanced document analysis' },
            { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security' },
            { icon: Users, title: 'Collaborative', desc: 'Team-friendly features' },
            { icon: Star, title: 'Premium', desc: 'Access all features' }
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-lg bg-muted/50"
            >
              <feature.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative p-8 rounded-xl border-2 transition-all duration-200
                ${plan.highlighted 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary/50'
                }
                ${plan.id === recommendedPlan ? 'ring-2 ring-primary/20' : ''}
              `}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}
              
              {plan.id === recommendedPlan && (
                <Badge variant="outline" className="absolute -top-3 right-4">
                  Recommended
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
              </div>

              <Separator className="mb-6" />

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanSelect(plan.id)}
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Choose Plan'}
              </Button>
            </div>
          ))}
        </motion.div>

        {/* Money-back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-6 bg-muted/30 rounded-lg border mb-8"
        >
          <Shield className="h-8 w-8 mx-auto mb-3 text-green-500" />
          <h3 className="font-semibold mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-sm text-muted-foreground">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
        </motion.div>

        {/* Back to app */}
        <div className="text-center">
          <Button
            onClick={handleBackToApp}
            variant="ghost"
            className="text-muted-foreground"
          >
            ← Back to App
          </Button>
        </div>
      </div>
    </div>
  )
}