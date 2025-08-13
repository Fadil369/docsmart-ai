import { useState, useEffect } from 'react'
import { GitBranch, Clock, Users, AlertTriangle, Check, X, ArrowRight, ArrowLeft, Merge, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { AnalysisTemplate } from './AnalysisTemplates'

interface TemplateVersion {
  id: string
  templateId: string
  version: string
  changes: TemplateChange[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date | string
  message: string
  isActive: boolean
  parentVersion?: string
  mergedFrom?: string[]
}

interface TemplateChange {
  id: string
  type: 'property_changed' | 'feature_added' | 'feature_removed' | 'prompt_modified' | 'metadata_updated'
  property: string
  oldValue: any
  newValue: any
  description: string
}

interface TemplateConflict {
  id: string
  templateId: string
  conflictType: 'concurrent_edit' | 'feature_conflict' | 'property_conflict'
  description: string
  baseVersion: string
  conflictingVersions: string[]
  conflictedProperties: Array<{
    property: string
    versions: Array<{
      versionId: string
      value: any
      author: string
    }>
  }>
  status: 'pending' | 'resolved' | 'ignored'
  createdAt: Date | string
  resolvedAt?: Date | string
  resolution?: 'merge' | 'override' | 'manual'
}

interface VersionControlProps {
  isOpen: boolean
  onClose: () => void
  templateId?: string
}

export function TemplateVersionControl({ isOpen, onClose, templateId }: VersionControlProps) {
  const [versions, setVersions] = useKV<TemplateVersion[]>('template-versions', [])
  const [conflicts, setConflicts] = useKV<TemplateConflict[]>('template-conflicts', [])
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('versions')
  const [commitMessage, setCommitMessage] = useState('')
  const [showConflictResolver, setShowConflictResolver] = useState<string | null>(null)

  // Initialize with sample data
  useEffect(() => {
    if (versions.length === 0) {
      const sampleVersions: TemplateVersion[] = [
        {
          id: 'v1.0.0',
          templateId: 'template-1',
          version: '1.0.0',
          changes: [
            {
              id: 'change-1',
              type: 'property_changed',
              property: 'name',
              oldValue: 'Contract Template',
              newValue: 'Legal Contract Analysis',
              description: 'Updated template name for clarity'
            }
          ],
          author: {
            id: 'user-1',
            name: 'Sarah Chen',
            avatar: 'SC'
          },
          createdAt: new Date('2024-01-15'),
          message: 'Initial template creation',
          isActive: false
        },
        {
          id: 'v1.1.0',
          templateId: 'template-1',
          version: '1.1.0',
          changes: [
            {
              id: 'change-2',
              type: 'feature_added',
              property: 'features.keyPhrasesExtraction',
              oldValue: false,
              newValue: true,
              description: 'Added key phrases extraction feature'
            },
            {
              id: 'change-3',
              type: 'prompt_modified',
              property: 'prompts.summary',
              oldValue: 'Summarize the document',
              newValue: 'Provide a comprehensive summary of the legal document highlighting key terms and obligations',
              description: 'Enhanced summary prompt for legal documents'
            }
          ],
          author: {
            id: 'user-2',
            name: 'Ahmed Hassan',
            avatar: 'AH'
          },
          createdAt: new Date('2024-02-01'),
          message: 'Enhanced legal analysis capabilities',
          isActive: true,
          parentVersion: 'v1.0.0'
        },
        {
          id: 'v1.1.1',
          templateId: 'template-1',
          version: '1.1.1',
          changes: [
            {
              id: 'change-4',
              type: 'property_changed',
              property: 'description',
              oldValue: 'Template for legal documents',
              newValue: 'Comprehensive template for analyzing legal contracts and agreements',
              description: 'Updated description for better clarity'
            }
          ],
          author: {
            id: 'user-3',
            name: 'Maria Rodriguez',
            avatar: 'MR'
          },
          createdAt: new Date('2024-02-15'),
          message: 'Updated description and minor fixes',
          isActive: false,
          parentVersion: 'v1.1.0'
        }
      ]
      setVersions(sampleVersions)
    }

    if (conflicts.length === 0) {
      const sampleConflicts: TemplateConflict[] = [
        {
          id: 'conflict-1',
          templateId: 'template-1',
          conflictType: 'concurrent_edit',
          description: 'Multiple users edited the template simultaneously',
          baseVersion: 'v1.1.0',
          conflictingVersions: ['v1.1.1', 'v1.1.2'],
          conflictedProperties: [
            {
              property: 'description',
              versions: [
                {
                  versionId: 'v1.1.1',
                  value: 'Comprehensive template for analyzing legal contracts and agreements',
                  author: 'Maria Rodriguez'
                },
                {
                  versionId: 'v1.1.2',
                  value: 'Advanced legal document analysis template with AI-powered insights',
                  author: 'Ahmed Hassan'
                }
              ]
            }
          ],
          status: 'pending',
          createdAt: new Date('2024-02-16')
        }
      ]
      setConflicts(sampleConflicts)
    }
  }, [versions.length, conflicts.length, setVersions, setConflicts])

  const filteredVersions = templateId 
    ? versions.filter(v => v.templateId === templateId)
    : versions

  const pendingConflicts = conflicts.filter(c => c.status === 'pending')
  const templateConflicts = templateId 
    ? conflicts.filter(c => c.templateId === templateId)
    : conflicts

  const handleCreateVersion = () => {
    if (!commitMessage.trim()) {
      toast.error('Please enter a commit message')
      return
    }

    const newVersion: TemplateVersion = {
      id: `v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      templateId: templateId || 'template-1',
      version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      changes: [
        {
          id: Date.now().toString(),
          type: 'property_changed',
          property: 'updatedAt',
          oldValue: new Date(Date.now() - 1000 * 60 * 60),
          newValue: new Date(),
          description: 'Template updated'
        }
      ],
      author: {
        id: 'current-user',
        name: 'You',
        avatar: 'Y'
      },
      createdAt: new Date(),
      message: commitMessage,
      isActive: false,
      parentVersion: filteredVersions.find(v => v.isActive)?.id
    }

    setVersions(current => [newVersion, ...current])
    setCommitMessage('')
    toast.success('New version created successfully')
  }

  const handleMergeVersions = () => {
    if (selectedVersions.length < 2) {
      toast.error('Please select at least 2 versions to merge')
      return
    }

    const mergedVersion: TemplateVersion = {
      id: `merge-${Date.now()}`,
      templateId: templateId || 'template-1',
      version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      changes: [
        {
          id: Date.now().toString(),
          type: 'property_changed',
          property: 'merged',
          oldValue: null,
          newValue: selectedVersions,
          description: `Merged versions: ${selectedVersions.join(', ')}`
        }
      ],
      author: {
        id: 'current-user',
        name: 'You',
        avatar: 'Y'
      },
      createdAt: new Date(),
      message: `Merged versions: ${selectedVersions.join(', ')}`,
      isActive: true,
      mergedFrom: selectedVersions
    }

    // Deactivate other versions
    setVersions(current => [
      mergedVersion,
      ...current.map(v => ({ ...v, isActive: false }))
    ])

    setSelectedVersions([])
    toast.success('Versions merged successfully')
  }

  const handleResolveConflict = (conflictId: string, resolution: 'merge' | 'override' | 'manual') => {
    setConflicts(current =>
      current.map(conflict =>
        conflict.id === conflictId
          ? {
              ...conflict,
              status: 'resolved' as const,
              resolvedAt: new Date(),
              resolution
            }
          : conflict
      )
    )
    setShowConflictResolver(null)
    toast.success('Conflict resolved successfully')
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'property_changed': return <ArrowRight size={14} className="text-accent" />
      case 'feature_added': return <Plus size={14} className="text-success" />
      case 'feature_removed': return <X size={14} className="text-destructive" />
      case 'prompt_modified': return <GitBranch size={14} className="text-primary" />
      default: return <Clock size={14} className="text-muted-foreground" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="text-primary" size={20} />
            Template Version Control
          </DialogTitle>
          <DialogDescription>
            Manage template versions, resolve conflicts, and track changes
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="versions">
                  Version History
                  <Badge variant="secondary" className="ml-2">
                    {filteredVersions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="conflicts">
                  Conflicts
                  {pendingConflicts.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingConflicts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="compare">Compare Versions</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                {selectedVersions.length >= 2 && (
                  <Button variant="outline" onClick={handleMergeVersions}>
                    <Merge size={14} className="mr-1" />
                    Merge Selected
                  </Button>
                )}
                
                <Button onClick={() => setActiveTab('create')}>
                  <Plus size={14} className="mr-1" />
                  New Version
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="versions" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {filteredVersions.map((version, index) => (
                      <VersionCard
                        key={version.id}
                        version={version}
                        index={index}
                        isSelected={selectedVersions.includes(version.id)}
                        onSelect={(selected) => {
                          if (selected) {
                            setSelectedVersions(prev => [...prev, version.id])
                          } else {
                            setSelectedVersions(prev => prev.filter(id => id !== version.id))
                          }
                        }}
                        onActivate={() => {
                          setVersions(current =>
                            current.map(v => ({
                              ...v,
                              isActive: v.id === version.id
                            }))
                          )
                          toast.success('Version activated')
                        }}
                        getChangeIcon={getChangeIcon}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="conflicts" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {templateConflicts.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="max-w-md mx-auto space-y-4">
                          <Check size={48} className="text-success mx-auto" />
                          <h3 className="text-lg font-semibold">No conflicts</h3>
                          <p className="text-muted-foreground text-sm">
                            All template versions are in sync
                          </p>
                        </div>
                      </div>
                    ) : (
                      templateConflicts.map((conflict, index) => (
                        <ConflictCard
                          key={conflict.id}
                          conflict={conflict}
                          index={index}
                          onResolve={(resolution) => handleResolveConflict(conflict.id, resolution)}
                          onViewDetails={() => setShowConflictResolver(conflict.id)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="compare" className="h-full">
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto space-y-4">
                    <GitBranch size={48} className="text-primary mx-auto" />
                    <h3 className="text-lg font-semibold">Version Comparison</h3>
                    <p className="text-muted-foreground text-sm">
                      Select versions from the history tab to compare changes
                    </p>
                    {selectedVersions.length > 0 && (
                      <div>
                        <p className="text-sm mb-2">Selected: {selectedVersions.length} versions</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {selectedVersions.map(versionId => {
                            const version = versions.find(v => v.id === versionId)
                            return (
                              <Badge key={versionId} variant="secondary">
                                {version?.version || versionId}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="create" className="h-full">
                <div className="max-w-md mx-auto py-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Version</CardTitle>
                      <CardDescription>
                        Commit your changes with a descriptive message
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Commit Message</label>
                        <Textarea
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                          placeholder="Describe the changes made in this version..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Version Type</label>
                        <Select defaultValue="minor">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="major">Major (1.0.0) - Breaking changes</SelectItem>
                            <SelectItem value="minor">Minor (0.1.0) - New features</SelectItem>
                            <SelectItem value="patch">Patch (0.0.1) - Bug fixes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handleCreateVersion} className="w-full">
                        Create Version
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Conflict Resolution Dialog */}
        {showConflictResolver && (
          <ConflictResolver
            conflictId={showConflictResolver}
            conflict={conflicts.find(c => c.id === showConflictResolver)!}
            onClose={() => setShowConflictResolver(null)}
            onResolve={handleResolveConflict}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface VersionCardProps {
  version: TemplateVersion
  index: number
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onActivate: () => void
  getChangeIcon: (type: string) => React.ReactNode
}

function VersionCard({ version, index, isSelected, onSelect, onActivate, getChangeIcon }: VersionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${version.isActive ? 'bg-accent/5 border-accent' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(e.target.checked)}
                className="mt-1"
              />
              
              <Avatar className="h-8 w-8">
                <AvatarImage src={version.author.avatar} />
                <AvatarFallback className="text-xs">
                  {version.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">v{version.version}</CardTitle>
                  {version.isActive && (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  )}
                  {version.mergedFrom && (
                    <Badge variant="outline" className="text-xs">Merged</Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {version.message}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  by {version.author.name} • {new Date(version.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {!version.isActive && (
              <Button variant="outline" size="sm" onClick={onActivate}>
                Activate
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">Changes ({version.changes.length})</p>
            <div className="space-y-1">
              {version.changes.slice(0, 3).map(change => (
                <div key={change.id} className="flex items-center gap-2 text-xs">
                  {getChangeIcon(change.type)}
                  <span className="flex-1">{change.description}</span>
                </div>
              ))}
              {version.changes.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{version.changes.length - 3} more changes
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface ConflictCardProps {
  conflict: TemplateConflict
  index: number
  onResolve: (resolution: 'merge' | 'override' | 'manual') => void
  onViewDetails: () => void
}

function ConflictCard({ conflict, index, onResolve, onViewDetails }: ConflictCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-destructive mt-1" />
              <div className="flex-1">
                <CardTitle className="text-base">{conflict.conflictType.replace('_', ' ').toUpperCase()}</CardTitle>
                <CardDescription className="text-sm">
                  {conflict.description}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(conflict.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Badge variant="destructive" className="text-xs">
              {conflict.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Conflicting Properties</p>
              <div className="space-y-1">
                {conflict.conflictedProperties.map(prop => (
                  <div key={prop.property} className="text-xs">
                    <span className="font-medium">{prop.property}</span>
                    <span className="text-muted-foreground ml-2">
                      ({prop.versions.length} versions)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button size="sm" onClick={() => onResolve('merge')}>
                <Merge size={14} className="mr-1" />
                Auto Merge
              </Button>
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                View Details
              </Button>
              <Button variant="outline" size="sm" onClick={() => onResolve('override')}>
                Override
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface ConflictResolverProps {
  conflictId: string
  conflict: TemplateConflict
  onClose: () => void
  onResolve: (conflictId: string, resolution: 'merge' | 'override' | 'manual') => void
}

function ConflictResolver({ conflictId, conflict, onClose, onResolve }: ConflictResolverProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Resolve Conflict</DialogTitle>
          <DialogDescription>
            Choose how to resolve the conflicting changes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {conflict.conflictedProperties.map(prop => (
            <Card key={prop.property}>
              <CardHeader>
                <CardTitle className="text-base">{prop.property}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prop.versions.map(version => (
                    <div key={version.versionId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{version.versionId}</Badge>
                        <span className="text-xs text-muted-foreground">{version.author}</span>
                      </div>
                      <div className="text-sm bg-muted/30 p-2 rounded">
                        {JSON.stringify(version.value, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onResolve(conflictId, 'manual')}>
              Resolve Manually
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}