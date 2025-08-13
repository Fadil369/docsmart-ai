import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { useKV } from '@/lib/mock-spark'
import { FileText, Target, Brain, Building, Table, Plus } from '@phosphor-icons/react'
import { Settings, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AnalysisTemplate {
  id: string
  name: string
  description: string
  documentTypes: string[]
  icon: any
  color: string
  prompts: {
    summary: string
    insights: string
    actions: string
    recommendations: string
    customQuestions: string[]
  }
  features: {
    sentiment: boolean
    keyMetrics: boolean
    translation: boolean
    entities: boolean
    compliance: boolean
  }
  outputFormat: {
    sections: string[]
    visualizations: string[]
  }
}

interface AnalysisTemplatesProps {
  documentType: string
  onTemplateSelect: (template: AnalysisTemplate) => void
  selectedTemplate: AnalysisTemplate | null
}

// Production-ready templates - users will create their own custom templates
const defaultTemplates: AnalysisTemplate[] = []

export function AnalysisTemplates({ documentType, onTemplateSelect, selectedTemplate }: AnalysisTemplatesProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [customTemplates, setCustomTemplates] = useKV<AnalysisTemplate[]>('custom-analysis-templates', [])
  const [editingTemplate, setEditingTemplate] = useState<AnalysisTemplate | null>(null)

  const handleTemplateSelect = (template: AnalysisTemplate) => {
    onTemplateSelect(template)
  }

  const handleCreateCustomTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      description: '',
      documentTypes: [documentType],
      icon: FileText,
      color: 'text-blue-400',
      prompts: {
        summary: '',
        insights: '',
        actions: '',
        recommendations: '',
        customQuestions: []
      },
      features: {
        sentiment: false,
        keyMetrics: false,
        translation: false,
        entities: false,
        compliance: false
      },
      outputFormat: {
        sections: [],
        visualizations: []
      }
    })
    setShowCustomDialog(true)
  }

  const handleSaveTemplate = (template: AnalysisTemplate) => {
    if (!template.name || !template.description) return

    const templateWithId = {
      ...template,
      id: template.id || `custom-${Date.now()}`
    }

    if (template.id && customTemplates.some(t => t.id === template.id)) {
      // Update existing
      setCustomTemplates(current =>
        current.map(t => t.id === template.id ? templateWithId : t)
      )
    } else {
      // Add new
      setCustomTemplates(current => [...current, templateWithId])
    }

    setShowCustomDialog(false)
    setEditingTemplate(null)
    toast.success('Template saved successfully')
  }

  const handleDeleteTemplate = (templateId: string) => {
    setCustomTemplates(current => current.filter(t => t.id !== templateId))
    toast.success('Template deleted')
  }

  const handleEditTemplate = (template: AnalysisTemplate) => {
    setEditingTemplate(template)
    setShowCustomDialog(true)
  }

  const filteredDefaultTemplates = defaultTemplates.filter(template =>
    template.documentTypes.includes(documentType)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analysis Templates</h3>
          <p className="text-sm text-muted-foreground">
            Choose a template to customize your AI analysis approach
          </p>
        </div>
        
        <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateCustomTemplate} className="gap-2">
              <Plus size={16} />
              Create Custom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate?.id ? 'Edit Template' : 'Create Custom Template'}
              </DialogTitle>
              <DialogDescription>
                Design a custom analysis template for your specific needs
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <CustomTemplateEditor
                template={editingTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => {
                  setShowCustomDialog(false)
                  setEditingTemplate(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="default" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default">Default Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="default" className="space-y-4">
          {filteredDefaultTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDefaultTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleTemplateSelect(template)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-muted-foreground">
                No default templates available for this document type
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          {customTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleTemplateSelect(template)}
                  onEdit={() => handleEditTemplate(template)}
                  onDelete={() => handleDeleteTemplate(template.id)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎨</div>
              <p className="text-muted-foreground mb-4">
                No custom templates yet
              </p>
              <Button onClick={handleCreateCustomTemplate} className="gap-2">
                <Plus size={16} />
                Create Your First Template
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TemplateCardProps {
  template: AnalysisTemplate
  isSelected: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
  index: number
}

function TemplateCard({ template, isSelected, onSelect, onEdit, onDelete, index }: TemplateCardProps) {
  const Icon = template.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-accent border-accent' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg bg-muted/50 ${template.color}`}>
              <Icon size={20} />
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    <Settings size={14} />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription className="text-xs">
              {template.documentTypes.join(', ')}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent onClick={onSelect}>
          <p className="text-sm text-muted-foreground mb-3">
            {template.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {Object.entries(template.features)
                .filter(([_, enabled]) => enabled)
                .map(([feature]) => (
                  <span key={feature} className="text-xs px-2 py-1 bg-muted rounded-md">
                    {feature}
                  </span>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface CustomTemplateEditorProps {
  template: AnalysisTemplate
  onSave: (template: AnalysisTemplate) => void
  onCancel: () => void
}

function CustomTemplateEditor({ template, onSave, onCancel }: CustomTemplateEditorProps) {
  const [editingTemplate, setTemplate] = useState<AnalysisTemplate>(template)

  const handleSave = () => {
    if (!editingTemplate.name || !editingTemplate.description) {
      toast.error('Please fill in all required fields')
      return
    }
    onSave(editingTemplate)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name *</Label>
          <Input
            id="template-name"
            value={editingTemplate.name}
            onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="template-description">Description *</Label>
          <Textarea
            id="template-description"
            value={editingTemplate.description}
            onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this template analyzes"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-types">Document Types</Label>
          <Select
            value={editingTemplate.documentTypes[0]}
            onValueChange={(value) => setTemplate(prev => ({
              ...prev,
              documentTypes: [value]
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="docx">Word</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pptx">PowerPoint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label>AI Prompts</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary-prompt">Summary Prompt</Label>
            <Textarea
              id="summary-prompt"
              value={editingTemplate.prompts.summary}
              onChange={(e) => setTemplate(prev => ({
                ...prev,
                prompts: { ...prev.prompts, summary: e.target.value }
              }))}
              placeholder="Define how the AI should summarize this document type"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insights-prompt">Insights Prompt</Label>
            <Textarea
              id="insights-prompt"
              value={editingTemplate.prompts.insights}
              onChange={(e) => setTemplate(prev => ({
                ...prev,
                prompts: { ...prev.prompts, insights: e.target.value }
              }))}
              placeholder="Define what insights the AI should extract"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actions-prompt">Actions Prompt</Label>
            <Textarea
              id="actions-prompt"
              value={editingTemplate.prompts.actions}
              onChange={(e) => setTemplate(prev => ({
                ...prev,
                prompts: { ...prev.prompts, actions: e.target.value }
              }))}
              placeholder="Define what action items the AI should identify"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations-prompt">Recommendations Prompt</Label>
            <Textarea
              id="recommendations-prompt"
              value={editingTemplate.prompts.recommendations}
              onChange={(e) => setTemplate(prev => ({
                ...prev,
                prompts: { ...prev.prompts, recommendations: e.target.value }
              }))}
              placeholder="Define what recommendations the AI should provide"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Analysis Features</Label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(editingTemplate.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between">
              <Label className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</Label>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) =>
                  setTemplate(prev => ({
                    ...prev,
                    features: { ...prev.features, [feature]: checked }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Template
        </Button>
      </div>
    </div>
  )
}