import React from 'react'
import { hasGatedAccess } from '@/lib/user-trial'

interface TrialGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onAccessDenied?: () => void
  redirectToPayment?: boolean
}

/**
 * Guard component that restricts access to gated features during trial
 */
export function TrialGuard({ 
  children, 
  fallback, 
  onAccessDenied,
  redirectToPayment = false 
}: TrialGuardProps) {
  const hasAccess = hasGatedAccess()

  React.useEffect(() => {
    if (!hasAccess && redirectToPayment) {
      // Redirect to payment page
      window.location.hash = '#/payment'
    }
  }, [hasAccess, redirectToPayment])

  React.useEffect(() => {
    if (!hasAccess && onAccessDenied) {
      onAccessDenied()
    }
  }, [hasAccess, onAccessDenied])

  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Trial Expired
          </p>
          <p className="text-sm text-muted-foreground">
            This feature requires an active subscription
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Hook to check trial access in components
 */
export function useTrialAccess() {
  return {
    hasAccess: hasGatedAccess(),
    checkAccess: hasGatedAccess
  }
}