import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Grid3x3, 
  List, 
  Settings,
  Brain,
  Bell,
  User
} from '@phosphor-icons/react'

interface HeaderProps {
  documentsCount: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function Header({ documentsCount, viewMode, onViewModeChange }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8 p-6 bg-card rounded-2xl border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
            <Brain size={28} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BRAINSAITبرينسايت
            </h1>
            <p className="text-muted-foreground text-sm">AI-Powered Document Intelligence</p>
          </div>
        </div>
        
        {documentsCount > 0 && (
          <Badge variant="secondary" className="ml-4">
            <FileText size={14} className="mr-1" />
            {documentsCount} document{documentsCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg p-1 bg-background">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3x3 size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List size={16} />
          </Button>
        </div>

        {/* Notifications */}
        <Button variant="outline" size="sm" className="relative">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        {/* Settings */}
        <Button variant="outline" size="sm">
          <Settings size={16} className="mr-2" />
          Settings
        </Button>

        {/* User Profile */}
        <Button variant="outline" size="sm">
          <User size={16} className="mr-2" />
          Profile
        </Button>
      </div>
    </header>
  )
}