/**
 * RTL Layout System for Phase 2
 * Arabic-first UI enhancement with right-to-left layout support
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Languages, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RTLContextType {
  isRTL: boolean
  language: 'ar' | 'en'
  toggleLanguage: () => void
  setLanguage: (lang: 'ar' | 'en') => void
  direction: 'ltr' | 'rtl'
}

const RTLContext = createContext<RTLContextType | undefined>(undefined)

export function useRTL() {
  const context = useContext(RTLContext)
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider')
  }
  return context
}

interface RTLProviderProps {
  children: React.ReactNode
  defaultLanguage?: 'ar' | 'en'
}

export function RTLProvider({ children, defaultLanguage = 'ar' }: RTLProviderProps) {
  const [language, setLanguageState] = useState<'ar' | 'en'>(defaultLanguage)
  const isRTL = language === 'ar'
  const direction = isRTL ? 'rtl' : 'ltr'

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar'
    setLanguageState(newLang)
  }

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang)
  }

  // Update document direction
  useEffect(() => {
    document.documentElement.dir = direction
    document.documentElement.lang = language
    
    // Update CSS custom properties for RTL support
    document.documentElement.style.setProperty('--text-align-start', isRTL ? 'right' : 'left')
    document.documentElement.style.setProperty('--text-align-end', isRTL ? 'left' : 'right')
    document.documentElement.style.setProperty('--margin-start', isRTL ? 'margin-right' : 'margin-left')
    document.documentElement.style.setProperty('--margin-end', isRTL ? 'margin-left' : 'margin-right')
    document.documentElement.style.setProperty('--padding-start', isRTL ? 'padding-right' : 'padding-left')
    document.documentElement.style.setProperty('--padding-end', isRTL ? 'padding-left' : 'padding-right')
    document.documentElement.style.setProperty('--border-start', isRTL ? 'border-right' : 'border-left')
    document.documentElement.style.setProperty('--border-end', isRTL ? 'border-left' : 'border-right')
  }, [direction, language, isRTL])

  return (
    <RTLContext.Provider value={{
      isRTL,
      language,
      toggleLanguage,
      setLanguage,
      direction
    }}>
      {children}
    </RTLContext.Provider>
  )
}

interface RTLWrapperProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  rtlReverse?: boolean
}

export function RTLWrapper({ 
  children, 
  className = '', 
  as: Component = 'div',
  rtlReverse = false 
}: RTLWrapperProps) {
  const { isRTL } = useRTL()
  
  const rtlClasses = cn(
    isRTL && 'rtl',
    rtlReverse && isRTL && 'flex-row-reverse',
    className
  )

  return (
    <Component className={rtlClasses}>
      {children}
    </Component>
  )
}

interface RTLTextProps {
  children: React.ReactNode
  className?: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div'
  align?: 'start' | 'end' | 'center' | 'justify'
}

export function RTLText({ 
  children, 
  className = '', 
  as: Component = 'p',
  align = 'start'
}: RTLTextProps) {
  const { isRTL } = useRTL()
  
  const textClasses = cn(
    align === 'start' && (isRTL ? 'text-right' : 'text-left'),
    align === 'end' && (isRTL ? 'text-left' : 'text-right'),
    align === 'center' && 'text-center',
    align === 'justify' && 'text-justify',
    className
  )

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  )
}

interface RTLSpacingProps {
  children: React.ReactNode
  className?: string
  marginStart?: string
  marginEnd?: string
  paddingStart?: string
  paddingEnd?: string
}

export function RTLSpacing({ 
  children, 
  className = '',
  marginStart,
  marginEnd,
  paddingStart,
  paddingEnd
}: RTLSpacingProps) {
  const { isRTL } = useRTL()
  
  const spacingStyles: React.CSSProperties = {}
  
  if (marginStart) {
    spacingStyles[isRTL ? 'marginRight' : 'marginLeft'] = marginStart
  }
  if (marginEnd) {
    spacingStyles[isRTL ? 'marginLeft' : 'marginRight'] = marginEnd
  }
  if (paddingStart) {
    spacingStyles[isRTL ? 'paddingRight' : 'paddingLeft'] = paddingStart
  }
  if (paddingEnd) {
    spacingStyles[isRTL ? 'paddingLeft' : 'paddingRight'] = paddingEnd
  }

  return (
    <div className={className} style={spacingStyles}>
      {children}
    </div>
  )
}

interface LanguageToggleProps {
  className?: string
  variant?: 'switch' | 'button'
  showLabels?: boolean
}

export function LanguageToggle({ 
  className = '', 
  variant = 'switch',
  showLabels = true 
}: LanguageToggleProps) {
  const { language, toggleLanguage, isRTL } = useRTL()

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center space-x-2 space-x-reverse', className)}>
        {showLabels && (
          <span className={cn('text-sm', language === 'en' ? 'font-medium' : 'text-muted-foreground')}>
            EN
          </span>
        )}
        <Switch
          checked={language === 'ar'}
          onCheckedChange={toggleLanguage}
          aria-label="Toggle language"
        />
        {showLabels && (
          <span className={cn('text-sm', language === 'ar' ? 'font-medium' : 'text-muted-foreground')}>
            عربي
          </span>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={cn('flex items-center space-x-2 space-x-reverse', className)}
    >
      <Languages className="h-4 w-4" />
      {showLabels && (
        <span>{language === 'ar' ? 'عربي' : 'English'}</span>
      )}
    </Button>
  )
}

interface RTLNavigationProps {
  children: React.ReactNode
  className?: string
}

export function RTLNavigation({ children, className = '' }: RTLNavigationProps) {
  const { isRTL } = useRTL()
  
  return (
    <nav className={cn(
      'flex items-center',
      isRTL ? 'space-x-reverse space-x-4' : 'space-x-4',
      className
    )}>
      {children}
    </nav>
  )
}

interface RTLBreadcrumbProps {
  items: { label: string; href?: string }[]
  className?: string
}

export function RTLBreadcrumb({ items, className = '' }: RTLBreadcrumbProps) {
  const { isRTL } = useRTL()
  
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight
  
  return (
    <nav className={cn('flex items-center space-x-1', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronIcon className="h-4 w-4 text-muted-foreground" />
          )}
          {item.href ? (
            <a 
              href={item.href}
              className="text-sm hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

interface RTLLayoutProps {
  children: React.ReactNode
  className?: string
  sidebar?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function RTLLayout({ 
  children, 
  className = '',
  sidebar,
  header,
  footer
}: RTLLayoutProps) {
  const { isRTL } = useRTL()
  
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {header && (
        <header className="border-b">
          {header}
        </header>
      )}
      
      <div className="flex flex-1">
        {sidebar && (
          <aside className={cn(
            'border-r bg-muted/50',
            isRTL ? 'order-2 border-l border-r-0' : 'order-1'
          )}>
            {sidebar}
          </aside>
        )}
        
        <main className={cn(
          'flex-1 p-6',
          sidebar && (isRTL ? 'order-1' : 'order-2')
        )}>
          {children}
        </main>
      </div>
      
      {footer && (
        <footer className="border-t">
          {footer}
        </footer>
      )}
    </div>
  )
}

// CSS utilities for RTL support
export const rtlClasses = {
  // Margin utilities
  'mr-auto-rtl': 'rtl:ml-auto rtl:mr-0',
  'ml-auto-rtl': 'rtl:mr-auto rtl:ml-0',
  
  // Padding utilities
  'pr-4-rtl': 'rtl:pl-4 rtl:pr-0',
  'pl-4-rtl': 'rtl:pr-4 rtl:pl-0',
  
  // Border utilities
  'border-r-rtl': 'rtl:border-l rtl:border-r-0',
  'border-l-rtl': 'rtl:border-r rtl:border-l-0',
  
  // Text alignment
  'text-left-rtl': 'rtl:text-right',
  'text-right-rtl': 'rtl:text-left',
  
  // Flexbox
  'space-x-reverse-rtl': 'rtl:space-x-reverse',
  'flex-row-reverse-rtl': 'rtl:flex-row-reverse',
  
  // Positioning
  'left-0-rtl': 'rtl:right-0 rtl:left-auto',
  'right-0-rtl': 'rtl:left-0 rtl:right-auto'
}

// Higher-order component for RTL support
export function withRTL<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { rtlProps?: any }> {
  return function RTLComponent({ rtlProps, ...props }: P & { rtlProps?: any }) {
    const { isRTL, language, direction } = useRTL()
    
    return (
      <Component
        {...(props as P)}
        isRTL={isRTL}
        language={language}
        direction={direction}
        {...rtlProps}
      />
    )
  }
}

export default RTLProvider