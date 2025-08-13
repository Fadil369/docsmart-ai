import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/lib/theme'
import { useSidebar } from '@/lib/use-sidebar'
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
import { CreditCard } from 'lucide-react'

interface HeaderProps {
  documentsCount: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  aiCopilotReady?: boolean
  onPaymentsClick?: () => void
}

export function Header({ documentsCount, viewMode, onViewModeChange, aiCopilotReady = false, onPaymentsClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { toggle, isMobile } = useSidebar()

  return (
    <header className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-10 p-4 sm:p-6 lg:p-8 bg-card rounded-xl lg:rounded-2xl border shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
        {/* Sidebar Toggle (Mobile + Desktop) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="h-8 w-8 p-0 lg:h-9 lg:w-9"
        >
          <House size={isMobile ? 16 : 18} />
        </Button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-primary/80 rounded-lg lg:rounded-xl shadow-lg">
            <Brain size={isMobile ? 20 : 28} className="text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BRAINSAITبرينسايت
            </h1>
            <p className="text-muted-foreground text-xs lg:text-sm">AI-Powered Document Intelligence</p>
          </div>
        </div>
        
        {documentsCount > 0 && (
          <Badge variant="secondary" className="ml-2 sm:ml-4 text-xs">
            <File size={12} className="mr-1" />
            {documentsCount}
            <span className="hidden sm:inline">
              {' '}document{documentsCount !== 1 ? 's' : ''}
            </span>
          </Badge>
        )}

        {/* AI Copilot Status */}
        <Badge 
          variant={aiCopilotReady ? "default" : "secondary"} 
          className={`ml-2 text-xs transition-all duration-300 ${
            aiCopilotReady 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Brain size={12} className="mr-1" />
          <span className="hidden lg:inline">AI Copilot: </span>
          {aiCopilotReady ? 'Ready' : 'Loading...'}
        </Badge>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 transition-all duration-200 hover:scale-105"
        >
          {theme === 'light' ? (
            <Moon size={16} className={isMobile ? "" : "mr-2"} />
          ) : (
            <Sun size={16} className={isMobile ? "" : "mr-2"} />
          )}
          <span className="hidden sm:inline">
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        </Button>

        {/* View Mode Toggle - Hidden on mobile */}
        <div className="hidden md:flex items-center border rounded-lg p-1 bg-background">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-7 w-7 p-0"
          >
            <Square size={14} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-7 w-7 p-0"
          >
            <List size={14} />
          </Button>
        </div>

        {/* Notifications */}
        <Button variant="outline" size="sm" className="relative h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* Payments - New */}
        {onPaymentsClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPaymentsClick}
            className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 transition-all duration-200 hover:scale-105"
          >
            <CreditCard size={16} className={isMobile ? "" : "mr-2"} />
            <span className="hidden sm:inline">Upgrade</span>
          </Button>
        )}
        
        {/* Settings - Hidden on small screens */}
        <Button variant="outline" size="sm" className="hidden lg:flex">
          <Gear size={16} className="mr-2" />
          Settings
        </Button>

        {/* User Profile */}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3">
          <User size={16} className={isMobile ? "" : "mr-2"} />
          <span className="hidden sm:inline">Profile</span>
        </Button>
      </div>
    </header>
  )
}