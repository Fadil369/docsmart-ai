import React, { useState, useEffect } from 'react'
import { getTrialStatus, type TrialData } from '@/lib/user-trial'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface TrialCountdownProps {
  onUpgradeClick?: () => void
  compact?: boolean
}

export function TrialCountdown({ onUpgradeClick, compact = false }: TrialCountdownProps) {
  const [trial, setTrial] = useState<TrialData | null>(null)
  const [timeString, setTimeString] = useState<string>('')

  useEffect(() => {
    const updateTrial = () => {
      const currentTrial = getTrialStatus()
      setTrial(currentTrial)
      
      if (currentTrial && currentTrial.isActive) {
        const { daysRemaining, hoursRemaining } = currentTrial
        
        if (daysRemaining > 1) {
          setTimeString(`${daysRemaining} days left`)
        } else if (hoursRemaining > 1) {
          setTimeString(`${hoursRemaining} hours left`)
        } else if (hoursRemaining === 1) {
          setTimeString('1 hour left')
        } else {
          setTimeString('Less than 1 hour left')
        }
      }
    }

    // Update immediately
    updateTrial()

    // Update every minute
    const interval = setInterval(updateTrial, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick()
    } else {
      window.location.hash = '#/payment'
    }
  }

  if (!trial || !trial.isActive) {
    return null
  }

  const isUrgent = trial.hoursRemaining <= 24
  const isCritical = trial.hoursRemaining <= 2

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <Badge 
          variant={isCritical ? "destructive" : isUrgent ? "secondary" : "outline"}
          className="flex items-center gap-1"
        >
          <Clock className="h-3 w-3" />
          {timeString}
        </Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-lg border
        ${isCritical 
          ? 'bg-destructive/10 border-destructive/50' 
          : isUrgent 
            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
            : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-full
            ${isCritical 
              ? 'bg-destructive/20' 
              : isUrgent 
                ? 'bg-yellow-100 dark:bg-yellow-900'
                : 'bg-blue-100 dark:bg-blue-900'
            }
          `}>
            <Clock className={`
              h-4 w-4
              ${isCritical 
                ? 'text-destructive' 
                : isUrgent 
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-blue-600 dark:text-blue-400'
              }
            `} />
          </div>
          
          <div>
            <h4 className="font-medium">
              {isCritical 
                ? 'Trial Ending Soon!' 
                : isUrgent 
                  ? 'Trial Ending Tomorrow'
                  : 'Free Trial Active'
              }
            </h4>
            <p className="text-sm text-muted-foreground">
              {timeString} • {trial.daysRemaining === 0 ? 'Last day' : `${trial.daysRemaining} ${trial.daysRemaining === 1 ? 'day' : 'days'} remaining`}
            </p>
          </div>
        </div>

        <Button 
          onClick={handleUpgradeClick}
          size="sm"
          variant={isCritical ? "destructive" : isUrgent ? "default" : "outline"}
          className="shrink-0"
        >
          {isCritical ? 'Upgrade Now' : 'Upgrade'}
        </Button>
      </div>

      {isUrgent && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <p className="text-xs text-muted-foreground">
            After your trial ends, you'll need a subscription to access premium features.
          </p>
        </div>
      )}
    </motion.div>
  )
}