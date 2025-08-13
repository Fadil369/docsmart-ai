import { motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration, type DemoTimerStatus } from '@/hooks/useDemoTimer'

interface DemoStatusPillProps {
  timeRemaining: number
  percentRemaining: number
  status: DemoTimerStatus
  onUpgradeClick: () => void
  className?: string
  compact?: boolean
}

export function DemoStatusPill({
  timeRemaining,
  percentRemaining,
  status,
  onUpgradeClick,
  className,
  compact = false
}: DemoStatusPillProps) {
  if (status === 'idle') return null

  const isExpired = status === 'expired'
  const formattedTime = formatDuration(timeRemaining)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full backdrop-blur-sm transition-all duration-300',
        isExpired
          ? 'bg-destructive/10 border border-destructive/20'
          : 'bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50',
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={isExpired ? 'Demo has expired' : `Demo time remaining: ${formattedTime}`}
    >
      {/* Progress bar background */}
      <div
        className={cn(
          'absolute inset-0 rounded-full overflow-hidden',
          isExpired ? 'bg-destructive/5' : 'bg-white/20'
        )}
        aria-hidden="true"
      >
        {/* Animated progress fill */}
        <motion.div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            isExpired
              ? 'bg-gradient-to-r from-destructive/20 to-destructive/30'
              : 'bg-gradient-to-r from-amber-400/30 to-orange-400/40'
          )}
          style={{ width: `${(isExpired ? 100 : percentRemaining * 100)}%` }}
          initial={{ width: '100%' }}
          animate={{ width: `${(isExpired ? 100 : percentRemaining * 100)}%` }}
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex items-center gap-2">
        {/* Status icon */}
        <motion.div
          animate={isExpired ? { scale: [1, 1.1, 1] } : { rotate: 360 }}
          transition={
            isExpired
              ? { duration: 0.6, repeat: 2 }
              : { duration: 8, repeat: Infinity, ease: 'linear' }
          }
        >
          {isExpired ? (
            <Zap className={cn('h-3 w-3 text-destructive', compact && 'h-2.5 w-2.5')} />
          ) : (
            <Clock className={cn('h-3 w-3 text-amber-600', compact && 'h-2.5 w-2.5')} />
          )}
        </motion.div>

        {/* Time display */}
        <span
          className={cn(
            'font-medium tabular-nums',
            isExpired ? 'text-destructive' : 'text-amber-700',
            compact && 'text-xs'
          )}
        >
          {isExpired ? 'Demo ended' : `${formattedTime} left`}
        </span>

        {/* Upgrade button */}
        <motion.button
          onClick={onUpgradeClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'rounded-full font-semibold transition-all duration-200',
            isExpired
              ? 'bg-primary px-2 py-0.5 text-[10px] text-primary-foreground hover:bg-primary/90 shadow-sm'
              : 'bg-primary/10 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/20',
            compact && 'px-1.5 py-0.5 text-[9px]'
          )}
          aria-label={isExpired ? 'Upgrade to continue' : 'Upgrade for unlimited access'}
        >
          {isExpired ? 'Upgrade' : 'Pro'}
        </motion.button>
      </div>

      {/* Pulse effect for expired state */}
      {isExpired && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-destructive/30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  )
}

// Preset configurations for common use cases
export const DemoStatusPillPresets = {
  header: (props: Omit<DemoStatusPillProps, 'className' | 'compact'>) => (
    <DemoStatusPill {...props} className="ml-auto" compact />
  ),
  
  floating: (props: Omit<DemoStatusPillProps, 'className'>) => (
    <DemoStatusPill 
      {...props} 
      className="fixed top-4 right-4 z-50 shadow-lg"
    />
  ),
  
  inline: (props: Omit<DemoStatusPillProps, 'className'>) => (
    <DemoStatusPill {...props} className="mx-auto" />
  )
}
