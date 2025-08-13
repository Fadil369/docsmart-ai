import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/lib/theme'
import { useSidebar } from '@/lib/use-sidebar'
import { User as UserType } from '@/contexts/AuthContext'
import { 
  File, 
  Square, 
  List, 
  Gear,
  Brain,
  Bell,
  User,
  Moon,
  Sun,
  House
} from '@/lib/safe-icons'
import { CreditCard, LogIn, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  documentsCount: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  aiCopilotReady?: boolean
  onPaymentsClick?: () => void
  onAuthClick?: () => void
  onProfileClick?: () => void
  isAuthenticated?: boolean
  user?: UserType | null
}

export function Header({ 
  documentsCount, 
  viewMode, 
  onViewModeChange, 
  aiCopilotReady = false, 
  onPaymentsClick,
  onAuthClick,
  onProfileClick,
  isAuthenticated = false,
  user
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { isOpen, toggle, isMobile } = useSidebar()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Left Section */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Sidebar Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className={cn(
                "h-9 w-9 p-0 transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isOpen && "bg-accent text-accent-foreground"
              )}
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isOpen ? (
                <X size={18} className="transition-transform duration-200" />
              ) : (
                <Menu size={18} className="transition-transform duration-200" />
              )}
            </Button>

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative p-2 sm:p-3 bg-gradient-to-br from-primary to-primary/80 rounded-lg lg:rounded-xl shadow-lg">
                <Brain size={isMobile ? 20 : 24} className="text-primary-foreground" />
                {aiCopilotReady && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  BRAINSAITبرينسايت
                </h1>
                <p className="text-muted-foreground text-xs lg:text-sm leading-tight">
                  AI-Powered Document Intelligence
                </p>
              </div>
            </div>
            
            {/* Document Count Badge */}
            {documentsCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 sm:ml-4 text-xs animate-in fade-in-50 duration-500"
              >
                <File size={12} className="mr-1" />
                {documentsCount}
                <span className="hidden sm:inline ml-1">
                  document{documentsCount !== 1 ? 's' : ''}
                </span>
              </Badge>
            )}

            {/* AI Copilot Status */}
            <Badge 
              variant={aiCopilotReady ? "default" : "secondary"} 
              className={cn(
                "ml-2 text-xs transition-all duration-500",
                aiCopilotReady 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md animate-pulse'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Brain size={12} className="mr-1" />
              <span className="hidden lg:inline">AI Copilot: </span>
              {aiCopilotReady ? (
                <span className="animate-in slide-in-from-left-2 duration-300">Ready</span>
              ) : (
                <span className="animate-pulse">Loading...</span>
              )}
            </Badge>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 lg:gap-3">
            
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className={cn(
                "h-9 w-9 p-0 sm:w-auto sm:px-3 transition-all duration-300",
                "hover:scale-105 hover:shadow-md",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                theme === 'dark' && "bg-accent text-accent-foreground"
              )}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className="relative">
                {theme === 'light' ? (
                  <Moon size={16} className={cn("transition-transform duration-300", isMobile ? "" : "mr-2")} />
                ) : (
                  <Sun size={16} className={cn("transition-transform duration-300 rotate-0", isMobile ? "" : "mr-2")} />
                )}
              </div>
              <span className="hidden sm:inline transition-opacity duration-200">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </Button>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center border rounded-lg p-1 bg-background shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  "h-7 w-7 p-0 transition-all duration-200",
                  viewMode === 'grid' && "shadow-sm"
                )}
                aria-label="Grid view"
              >
                <Square size={14} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className={cn(
                  "h-7 w-7 p-0 transition-all duration-200",
                  viewMode === 'list' && "shadow-sm"
                )}
                aria-label="List view"
              >
                <List size={14} />
              </Button>
            </div>

            {/* Notifications */}
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "relative h-9 w-9 p-0 sm:w-auto sm:px-3 transition-all duration-200",
                "hover:scale-105 hover:shadow-md",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </Button>

            {/* Payments/Upgrade Button */}
            {onPaymentsClick && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPaymentsClick}
                className={cn(
                  "h-9 w-9 p-0 sm:w-auto sm:px-3 transition-all duration-200",
                  "hover:scale-105 hover:shadow-md hover:bg-primary hover:text-primary-foreground",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "group"
                )}
                aria-label="Upgrade account"
              >
                <CreditCard size={16} className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "" : "mr-2")} />
                <span className="hidden sm:inline">Upgrade</span>
              </Button>
            )}
            
            {/* Settings - Hidden on small screens */}
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "hidden lg:flex transition-all duration-200",
                "hover:scale-105 hover:shadow-md",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              aria-label="Settings"
            >
              <Gear size={16} className="mr-2" />
              Settings
            </Button>

            {/* Authentication Section */}
            {isAuthenticated && user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onProfileClick}
                className={cn(
                  "h-9 gap-2 sm:px-3 transition-all duration-200",
                  "hover:scale-105 hover:shadow-md",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "group"
                )}
                aria-label={`User profile: ${user.name}`}
              >
                <Avatar className="h-6 w-6 transition-transform duration-200 group-hover:scale-110">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline transition-opacity duration-200">
                  {user.name}
                </span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAuthClick}
                className={cn(
                  "h-9 w-9 p-0 sm:w-auto sm:px-3 transition-all duration-200",
                  "hover:scale-105 hover:shadow-md hover:bg-primary hover:text-primary-foreground",
                  "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "group"
                )}
                aria-label="Sign in"
              >
                <LogIn size={16} className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "" : "mr-2")} />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
