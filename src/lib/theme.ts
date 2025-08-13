import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useKV<Theme>('app-theme', 'light')

  useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    setTheme,
    toggleTheme
  }
}