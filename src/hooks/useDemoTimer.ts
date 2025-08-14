/**
 * useDemoTimer - Production-ready demo/trial timer with clean lifecycle
 * 
 * Features:
 * - Prevents negative time values
 * - Idempotent start/stop operations
 * - Auto-cleanup on unmount
 * - Extensible duration support
 * - Type-safe status machine
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_DURATION = 3 * 60 * 1000 // 3 minutes
const TICK_INTERVAL = 1000 // 1 second

export type DemoTimerStatus = 'idle' | 'running' | 'expired'

export interface DemoTimerOptions {
  durationMs?: number
  onExpire?: () => void
  onTick?: (remaining: number) => void
  onStart?: () => void
}

export interface DemoTimerState {
  isActive: boolean
  timeRemaining: number
  percentRemaining: number
  status: DemoTimerStatus
  start: (durationMs?: number) => void
  stop: () => void
  expireNow: () => void
  extend: (deltaMs: number) => void
  reset: () => void
}

export function useDemoTimer(options: DemoTimerOptions = {}): DemoTimerState {
  const { 
    durationMs = DEFAULT_DURATION, 
    onExpire, 
    onTick,
    onStart 
  } = options

  const [timeRemaining, setTimeRemaining] = useState(durationMs)
  const [status, setStatus] = useState<DemoTimerStatus>('idle')
  const intervalRef = useRef<number | null>(null)
  const startedDurationRef = useRef(durationMs)

  // Cleanup interval helper
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Start timer (idempotent)
  const start = useCallback((customDuration?: number) => {
    if (status === 'running') return
    
    const effectiveDuration = customDuration ?? durationMs
    startedDurationRef.current = effectiveDuration
    setTimeRemaining(effectiveDuration)
    setStatus('running')
    onStart?.()
  }, [durationMs, status, onStart])

  // Stop timer
  const stop = useCallback(() => {
    clearTimer()
    setStatus(prev => prev === 'expired' ? 'expired' : 'idle')
  }, [clearTimer])

  // Force expiration
  const expireNow = useCallback(() => {
    clearTimer()
    setTimeRemaining(0)
    setStatus('expired')
    onExpire?.()
  }, [clearTimer, onExpire])

  // Extend timer duration
  const extend = useCallback((deltaMs: number) => {
    if (deltaMs <= 0) return
    
    setTimeRemaining(prev => {
      const next = Math.max(0, prev) + deltaMs
      // Resurrect expired timer if extended
      if (next > 0 && status === 'expired') {
        setStatus('running')
      }
      return next
    })
  }, [status])

  // Reset to initial state
  const reset = useCallback(() => {
    clearTimer()
    setTimeRemaining(durationMs)
    setStatus('idle')
  }, [clearTimer, durationMs])

  // Tick management effect
  useEffect(() => {
    if (status !== 'running') {
      clearTimer()
      return
    }

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        const next = prev - TICK_INTERVAL
        
        if (next <= 0) {
          clearTimer()
          setStatus('expired')
          onExpire?.()
          return 0
        }
        
        onTick?.(next)
        return next
      })
    }, TICK_INTERVAL)

    return clearTimer
  }, [status, clearTimer, onExpire, onTick])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  // Calculate percentage remaining
  const percentRemaining = startedDurationRef.current > 0 
    ? Math.max(0, Math.min(1, timeRemaining / startedDurationRef.current))
    : 0

  return {
    isActive: status === 'running',
    status,
    timeRemaining,
    percentRemaining,
    start,
    stop,
    expireNow,
    extend,
    reset
  }
}

// Utility function for formatting duration
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
