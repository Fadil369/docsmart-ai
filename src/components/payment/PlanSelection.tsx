import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PaymentPlan, formatSAR } from '@/types/payment'
import { paymentService } from '@/lib/payment-service'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Clock, Calendar, FileText, Zap } from 'lucide-react'

interface PlanSelectionProps {
  documentId?: string
  onPlanSelected: (plan: PaymentPlan) => void
  selectedPlanId?: string
}

export function PlanSelection({ documentId, onPlanSelected, selectedPlanId }: PlanSelectionProps) {
  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        let availablePlans: PaymentPlan[]
        
        if (documentId) {
          // For document-specific purchases, show per-document plans
          availablePlans = paymentService.getPlansForDocument()
        } else {
          // Show all plans for general access
          availablePlans = paymentService.getPlans()
        }
        
        setPlans(availablePlans)
      } catch (error) {
        console.error('Failed to load plans:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [documentId])

  const getPlanIcon = (planType: PaymentPlan['type']) => {
    switch (planType) {
      case 'per-document':
        return <FileText className="h-5 w-5" />
      case 'time-pass':
        return <Clock className="h-5 w-5" />
      case 'subscription':
        return <Calendar className="h-5 w-5" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const getDurationText = (plan: PaymentPlan) => {
    if (!plan.duration) return ''
    
    const { value, unit } = plan.duration
    const unitText = value === 1 ? unit : `${unit}s`
    return `${value} ${unitText}`
  }

  const getTypeDisplayName = (type: PaymentPlan['type']) => {
    switch (type) {
      case 'per-document':
        return 'One-Time Purchase'
      case 'time-pass':
        return 'Time Pass'
      case 'subscription':
        return 'Subscription'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-3 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-muted rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  // Group plans by type for better organization
  const groupedPlans = plans.reduce((acc, plan) => {
    if (!acc[plan.type]) acc[plan.type] = []
    acc[plan.type].push(plan)
    return acc
  }, {} as Record<string, PaymentPlan[]>)

  return (
    <div className="space-y-8">
      {documentId && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Unlock Document Features</h2>
          <p className="text-muted-foreground">
            Choose a plan to access advanced features for your document
          </p>
        </div>
      )}

      {Object.entries(groupedPlans).map(([type, typePlans], typeIndex) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: typeIndex * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            {getPlanIcon(type as PaymentPlan['type'])}
            <h3 className="text-xl font-semibold">{getTypeDisplayName(type as PaymentPlan['type'])}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typePlans.map((plan, planIndex) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: (typeIndex * 0.1) + (planIndex * 0.05) }}
              >
                <Card 
                  className={cn(
                    "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
                    selectedPlanId === plan.id && "ring-2 ring-primary shadow-lg",
                    plan.popular && "border-primary/50"
                  )}
                  onClick={() => onPlanSelected(plan)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {getPlanIcon(plan.type)}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    {plan.duration && (
                      <Badge variant="outline" className="w-fit">
                        {getDurationText(plan)}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">
                      {formatSAR(plan.priceInSAR)}
                      {plan.type === 'subscription' && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.duration?.unit}
                        </span>
                      )}
                    </div>
                    
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={selectedPlanId === plan.id ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPlanSelected(plan)
                      }}
                    >
                      {selectedPlanId === plan.id ? 'Selected' : 'Select Plan'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}