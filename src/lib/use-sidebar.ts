import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

export function useSidebar() {
  const [isOpen, setIsOpen] = useKV('sidebar-open', false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)
  const open = () => setIsOpen(true)

  return {
    isOpen,
    isMobile,
    toggle,
    close,
    open
  }
}