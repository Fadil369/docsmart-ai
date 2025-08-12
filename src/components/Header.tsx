import { useState } from 'react'
import { List, Squares, Brain, Translate, ArrowsIn, DocumentDuplicate, Settings, Users } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TemplateManager } from '@/components/TemplateManager'
import { TemplateSharing } from '@/components/TemplateSharing'
import { cn } from '@/lib/utils'

interface HeaderProps {
  documentsCount: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function Header({ documentsCount, viewMode, onViewModeChange }: HeaderProps) {
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showTemplateSharing, setShowTemplateSharing] = useState(false)

  return (
    <div className="space-y-6">
      {/* App Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Document Intelligence Hub</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTemplateManager(true)}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Templates
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTemplateSharing(true)}
              className="flex items-center gap-2"
            >
              <Users size={16} />
              Collaborate
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your documents with AI-powered analysis, seamless translation, and intelligent compression
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{documentsCount}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Translate size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowsIn size={20} className="text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">65%</p>
                <p className="text-xs text-muted-foreground">Avg Compression</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <DocumentDuplicate size={20} className="text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Operations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Section Header */}
      {documentsCount > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your Documents</h2>
            <p className="text-sm text-muted-foreground">
              {documentsCount} document{documentsCount !== 1 ? 's' : ''} ready for processing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="p-2"
            >
              <Squares size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="p-2"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      )}
      
      {/* Template Manager */}
      <TemplateManager 
        isOpen={showTemplateManager} 
        onClose={() => setShowTemplateManager(false)} 
      />
      
      {/* Template Sharing */}
      <TemplateSharing 
        isOpen={showTemplateSharing} 
        onClose={() => setShowTemplateSharing(false)} 
      />
    </div>
  )
}