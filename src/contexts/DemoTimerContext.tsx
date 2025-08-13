import { createContext, useContext, ReactNode } from 'react'
import { useDemoTimer, type DemoTimerState, type DemoTimerOptions } from '@/hooks/useDemoTimer'

interface DemoTimerContextType extends DemoTimerState {
  // Additional context-specific methods can be added here
}

const DemoTimerContext = createContext<DemoTimerContextType | undefined>(undefined)

interface DemoTimerProviderProps {
  children: ReactNode
  options?: DemoTimerOptions
}

export function DemoTimerProvider({ children, options }: DemoTimerProviderProps) {
  const demoTimer = useDemoTimer(options)

  return (
    <DemoTimerContext.Provider value={demoTimer}>
      {children}
    </DemoTimerContext.Provider>
  )
}

export function useDemoTimerContext(): DemoTimerContextType {
  const context = useContext(DemoTimerContext)
  if (context === undefined) {
    throw new Error('useDemoTimerContext must be used within a DemoTimerProvider')
  }
  return context
}

// Optional: Export the context for advanced use cases
export { DemoTimerContext }
