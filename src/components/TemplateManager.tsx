import { useState, useEffect } from 'react'
import { Settings, Download, Upload, Plus, Trash2, Copy, Edit, Save, Star, StarOff } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { AnalysisTemplate } from './AnalysisTemplates'

interface TemplatePreset {
  id: string
  name: string
  description: string
  templates: AnalysisTemplate[]
  isDefault: boolean
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  usageCount: number
  tags: string[]
}

interface TemplateManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function TemplateManager({ isOpen, onClose }: TemplateManagerProps) {
  const [templatePresets, setTemplatePresets] = useKV<TemplatePreset[]>('template-presets', [])
  const [customTemplates, setCustomTemplates] = useKV<AnalysisTemplate[]>('custom-templates', [])
  const [selectedPreset, setSelectedPreset] = useState<TemplatePreset | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('presets')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'date'>('name')
  const [showCreatePreset, setShowCreatePreset] = useState(false)

  // Initialize with default presets if none exist
  useEffect(() => {
    if (templatePresets.length === 0) {
      const defaultPresets: TemplatePreset[] = [
        {
          id: 'business-suite',
          name: 'Business Document Suite',
          description: 'Comprehensive templates for business documents, reports, and proposals',
          templates: [], // Would contain business-related templates
          isDefault: true,
          isFavorite: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          tags: ['business', 'reports', 'financial']
        },
        {
          id: 'legal-pack',
          name: 'Legal Document Pack',
          description: 'Specialized templates for contracts, agreements, and legal documents',
          templates: [], // Would contain legal templates
          isDefault: true,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          tags: ['legal', 'contracts', 'compliance']
        },
        {
          id: 'research-toolkit',
          name: 'Research & Academic Toolkit',
          description: 'Templates designed for academic papers, research documents, and studies',
          templates: [], // Would contain research templates
          isDefault: true,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          tags: ['research', 'academic', 'analysis']
        }
      ]
      setTemplatePresets(defaultPresets)
    }
  }, [templatePresets.length, setTemplatePresets])

  const filteredPresets = templatePresets
    .filter(preset => 
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const handleCreatePreset = () => {
    const newPreset: TemplatePreset = {
      id: Date.now().toString(),
      name: '',
      description: '',
      templates: [],
      isDefault: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      tags: []
    }
    setSelectedPreset(newPreset)
    setIsEditing(true)
    setShowCreatePreset(true)
  }

  const handleSavePreset = (preset: TemplatePreset) => {
    if (preset.id && templatePresets.find(p => p.id === preset.id)) {
      // Update existing
      setTemplatePresets(current =>
        current.map(p => p.id === preset.id ? { ...preset, updatedAt: new Date() } : p)
      )
    } else {
      // Create new
      const newPreset = { ...preset, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
      setTemplatePresets(current => [...current, newPreset])
    }
    setIsEditing(false)
    setShowCreatePreset(false)
    setSelectedPreset(null)
    toast.success('Template preset saved successfully')
  }

  const handleDeletePreset = (presetId: string) => {
    setTemplatePresets(current => current.filter(p => p.id !== presetId))
    toast.success('Template preset deleted')
  }

  const handleDuplicatePreset = (preset: TemplatePreset) => {
    const duplicated: TemplatePreset = {
      ...preset,
      id: Date.now().toString(),
      name: `${preset.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    }
    setTemplatePresets(current => [...current, duplicated])
    toast.success('Template preset duplicated')
  }

  const handleToggleFavorite = (presetId: string) => {
    setTemplatePresets(current =>
      current.map(p => p.id === presetId ? { ...p, isFavorite: !p.isFavorite } : p)
    )
  }

  const handleExportPresets = () => {
    const dataStr = JSON.stringify(templatePresets, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'analysis-template-presets.json'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Template presets exported')
  }

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target?.result as string)
        setTemplatePresets(current => [...current, ...importedPresets])
        toast.success('Template presets imported successfully')
      } catch (error) {
        toast.error('Failed to import presets. Invalid file format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="text-primary" size={20} />
            Template Manager
          </DialogTitle>
          <DialogDescription>
            Manage your AI analysis templates and presets
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="presets">Template Presets</TabsTrigger>
                <TabsTrigger value="templates">Custom Templates ({customTemplates.length})</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPresets}>
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
                
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportPresets}
                  style={{ display: 'none' }}
                  id="import-presets"
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('import-presets')?.click()}>
                  <Upload size={14} className="mr-1" />
                  Import
                </Button>

                <Button onClick={handleCreatePreset}>
                  <Plus size={14} className="mr-1" />
                  New Preset
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="presets" className="h-full">
                <div className="space-y-4 h-full">
                  {/* Search and Filter */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search presets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={sortBy} onValueChange={(value: 'name' | 'usage' | 'date') => setSortBy(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="usage">Sort by Usage</SelectItem>
                        <SelectItem value="date">Sort by Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Presets Grid */}
                  <ScrollArea className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPresets.map((preset, index) => (
                        <PresetCard
                          key={preset.id}
                          preset={preset}
                          index={index}
                          onEdit={() => {
                            setSelectedPreset(preset)
                            setIsEditing(true)
                            setShowCreatePreset(true)
                          }}
                          onDelete={() => handleDeletePreset(preset.id)}
                          onDuplicate={() => handleDuplicatePreset(preset)}
                          onToggleFavorite={() => handleToggleFavorite(preset.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {customTemplates.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="max-w-md mx-auto space-y-4">
                          <div className="text-4xl">🎨</div>
                          <h3 className="text-lg font-semibold">No custom templates</h3>
                          <p className="text-muted-foreground text-sm">
                            Create custom analysis templates from the document analysis interface
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customTemplates.map((template, index) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            index={index}
                            onEdit={() => {
                              // Handle edit
                              toast.info('Template editing will be available in the document analysis interface')
                            }}
                            onDelete={() => {
                              setCustomTemplates(current => current.filter(t => t.id !== template.id))
                              toast.success('Template deleted')
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Template Settings</CardTitle>
                        <CardDescription>Configure default behavior for template analysis</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">Auto-select best template</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically select the most suitable template based on document type
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">Enable template suggestions</Label>
                            <p className="text-sm text-muted-foreground">
                              Show template recommendations during analysis
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">Save analysis results</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically save analysis results for future reference
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Performance Settings</CardTitle>
                        <CardDescription>Optimize template processing performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="font-medium">Default processing timeout</Label>
                          <Select defaultValue="60">
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 seconds</SelectItem>
                              <SelectItem value="60">60 seconds</SelectItem>
                              <SelectItem value="120">2 minutes</SelectItem>
                              <SelectItem value="300">5 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="font-medium">Concurrent analysis limit</Label>
                          <Select defaultValue="3">
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 document</SelectItem>
                              <SelectItem value="3">3 documents</SelectItem>
                              <SelectItem value="5">5 documents</SelectItem>
                              <SelectItem value="10">10 documents</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Create/Edit Preset Dialog */}
        {showCreatePreset && selectedPreset && (
          <PresetEditor
            preset={selectedPreset}
            isOpen={showCreatePreset}
            onSave={handleSavePreset}
            onClose={() => {
              setShowCreatePreset(false)
              setSelectedPreset(null)
              setIsEditing(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface PresetCardProps {
  preset: TemplatePreset
  index: number
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleFavorite: () => void
}

function PresetCard({ preset, index, onEdit, onDelete, onDuplicate, onToggleFavorite }: PresetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{preset.name}</CardTitle>
                {preset.isDefault && (
                  <Badge variant="outline" className="text-xs">Default</Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {preset.description}
              </CardDescription>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleFavorite}
              className="p-1"
            >
              {preset.isFavorite ? (
                <Star size={16} className="text-yellow-500 fill-current" />
              ) : (
                <StarOff size={16} className="text-muted-foreground" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {preset.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{preset.templates.length} templates</span>
              <span>Used {preset.usageCount} times</span>
            </div>

            <Separator />

            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit size={14} />
              </Button>
              
              <Button variant="outline" size="sm" onClick={onDuplicate}>
                <Copy size={14} />
              </Button>

              {!preset.isDefault && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template Preset</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{preset.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface TemplateCardProps {
  template: AnalysisTemplate
  index: number
  onEdit: () => void
  onDelete: () => void
}

function TemplateCard({ template, index, onEdit, onDelete }: TemplateCardProps) {
  const Icon = template.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-background ${template.color}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {template.documentTypes.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type.toUpperCase()}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {Object.entries(template.features)
                .filter(([_, enabled]) => enabled)
                .map(([feature, _]) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
            </div>

            <Separator />

            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit size={14} />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{template.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface PresetEditorProps {
  preset: TemplatePreset
  isOpen: boolean
  onSave: (preset: TemplatePreset) => void
  onClose: () => void
}

function PresetEditor({ preset: initialPreset, isOpen, onSave, onClose }: PresetEditorProps) {
  const [preset, setPreset] = useState<TemplatePreset>(initialPreset)
  const [newTag, setNewTag] = useState('')

  const handleSave = () => {
    if (!preset.name.trim()) {
      toast.error('Please enter a preset name')
      return
    }
    onSave(preset)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !preset.tags.includes(newTag.trim())) {
      setPreset(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPreset(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {preset.id ? 'Edit Template Preset' : 'Create Template Preset'}
          </DialogTitle>
          <DialogDescription>
            Configure a collection of analysis templates for specific use cases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name *</Label>
              <Input
                id="preset-name"
                value={preset.name}
                onChange={(e) => setPreset(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Legal Document Analysis Suite"
              />
            </div>

            <div className="space-y-2">
              <Label>Settings</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preset.isFavorite}
                    onCheckedChange={(checked) => setPreset(prev => ({ ...prev, isFavorite: checked }))}
                  />
                  <Label className="text-sm">Favorite</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-description">Description</Label>
            <Textarea
              id="preset-description"
              value={preset.description}
              onChange={(e) => setPreset(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this preset is designed for..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" onClick={handleAddTag}>Add</Button>
            </div>
            
            {preset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {preset.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Save Preset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}