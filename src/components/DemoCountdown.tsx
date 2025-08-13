import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Circle as Timer, Circle as Crown } from '@/lib/safe-icons'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DemoCountdownProps {
  timeRemaining: number // in milliseconds
  onUpgradeClick: () => void
  className?: string
}

export function DemoCountdown({ timeRemaining, onUpgradeClick, className }: DemoCountdownProps) {
  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)
  
  const isLowTime = timeRemaining < 60000 // Less than 1 minute
  const isVeryLowTime = timeRemaining < 30000 // Less than 30 seconds

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("fixed top-4 right-4 z-50", className)}
    >
      <Card className={cn(
        "shadow-lg border-2 transition-all duration-300",
        isVeryLowTime ? "border-red-500 bg-red-50 dark:bg-red-950" :
        isLowTime ? "border-orange-500 bg-orange-50 dark:bg-orange-950" :
        "border-blue-500 bg-blue-50 dark:bg-blue-950"
      )}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Timer 
              size={20} 
              className={cn(
                isVeryLowTime ? "text-red-600" :
                isLowTime ? "text-orange-600" :
                "text-blue-600"
              )} 
            />
            <span className="font-semibold text-sm">Demo Time</span>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold tabular-nums",
              isVeryLowTime ? "text-red-600" :
              isLowTime ? "text-orange-600" :
              "text-blue-600"
            )}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isVeryLowTime ? "Hurry! Demo expiring soon" :
               isLowTime ? "Demo ending soon" :
               "Demo access active"}
            </p>
          </div>

          <Button 
            onClick={onUpgradeClick}
            size="sm"
            className={cn(
              "w-full text-xs transition-all duration-300",
              isVeryLowTime ? "bg-red-600 hover:bg-red-700 animate-pulse" :
              isLowTime ? "bg-orange-600 hover:bg-orange-700" :
              "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Crown size={14} className="mr-1" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
