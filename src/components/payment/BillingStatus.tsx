import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BillingStatus, Entitlement, formatSAR } from '@/types/payment'
import { paymentService } from '@/lib/payment-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  History
} from 'lucide-react'

interface BillingStatusComponentProps {
  onUpgrade?: () => void
}

export function BillingStatusComponent({ onUpgrade }: BillingStatusComponentProps) {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBillingStatus = () => {
      try {
        const status = paymentService.getBillingStatus()
        setBillingStatus(status)
      } catch (error) {
        console.error('Failed to load billing status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBillingStatus()
  }, [])

  const getStatusIcon = (status: Entitlement['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'canceled':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: Entitlement['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200'
      case 'expired':
        return 'bg-red-500/10 text-red-700 border-red-200'
      case 'canceled':
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
      case 'past_due':
        return 'bg-orange-500/10 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: Entitlement['type']) => {
    switch (type) {
      case 'per-document':
        return <FileText className="h-4 w-4" />
      case 'time-pass':
        return <Clock className="h-4 w-4" />
      case 'subscription':
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEntitlementExpiringSoon = (entitlement: Entitlement) => {
    if (!entitlement.endDate) return false
    const now = new Date()
    const endDate = new Date(entitlement.endDate)
    const timeDiff = endDate.getTime() - now.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    return daysDiff > 0 && daysDiff <= 7 // Expiring within 7 days
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!billingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Status</CardTitle>
          <CardDescription>Unable to load billing information</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Overview
          </CardTitle>
          <CardDescription>
            Your current subscription and payment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{billingStatus.activeEntitlements.length}</p>
              <p className="text-sm text-muted-foreground">Active Plans</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{formatSAR(billingStatus.totalSpent)}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">
                {billingStatus.nextBillingDate ? formatDate(billingStatus.nextBillingDate) : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Next Billing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Entitlements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Plans</CardTitle>
            <CardDescription>
              Your current active subscriptions and purchases
            </CardDescription>
          </div>
          {onUpgrade && (
            <Button onClick={onUpgrade} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {billingStatus.activeEntitlements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active plans</p>
              {onUpgrade && (
                <Button onClick={onUpgrade} className="mt-4">
                  Purchase Your First Plan
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {billingStatus.activeEntitlements.map((entitlement, index) => (
                <motion.div
                  key={entitlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(entitlement.type)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {entitlement.metadata?.planName || `${entitlement.type} Plan`}
                          </h4>
                          <Badge className={getStatusColor(entitlement.status)}>
                            {getStatusIcon(entitlement.status)}
                            {entitlement.status}
                          </Badge>
                          {isEntitlementExpiringSoon(entitlement) && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Started: {formatDate(entitlement.startDate)}
                          {entitlement.endDate && (
                            <> • Expires: {formatDate(entitlement.endDate)}</>
                          )}
                        </p>
                        {entitlement.documentId && (
                          <p className="text-xs text-muted-foreground">
                            Document-specific access
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {entitlement.features.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Included Features:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {entitlement.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Your recent transactions and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingStatus.billingHistory.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {billingStatus.billingHistory
                .filter(session => session.status === 'succeeded')
                .slice(0, 5)
                .map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">{session.metadata?.planName || 'Plan Purchase'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatSAR(session.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.paymentMethod}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {billingStatus.billingHistory.filter(s => s.status === 'succeeded').length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Transactions
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}