import { useState } from 'react'
import { FileText, Table, Image, Archive, Settings, Sparkle, Brain, Target } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

// Document type detection and template definitions
export interface AnalysisTemplate {
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
    customQuestions?: string[]
  }
  features: {
    translation: boolean
    sentiment: boolean
    entities: boolean
    keyMetrics: boolean
    compliance: boolean
  }
  outputFormat: {
    sections: string[]
    visualizations: string[]
  }
}

// Predefined templates for different document types
const defaultTemplates: AnalysisTemplate[] = [
  {
    id: 'financial-report',
    name: 'Financial Analysis',
    description: 'Comprehensive analysis for financial documents, reports, and statements',
    documentTypes: ['pdf', 'xlsx', 'csv'],
    icon: Target,
    color: 'text-green-500',
    prompts: {
      summary: 'Analyze this financial document and provide a comprehensive summary of financial performance, key metrics, and overall health indicators.',
      insights: 'Extract key financial insights including revenue trends, profitability analysis, cash flow patterns, and comparative performance metrics.',
      actions: 'Identify specific financial action items including cost optimization opportunities, investment recommendations, and risk mitigation strategies.',
      recommendations: 'Provide strategic financial recommendations for improving performance, addressing weaknesses, and capitalizing on opportunities.',
      customQuestions: [
        'What are the main revenue drivers?',
        'Are there any concerning financial trends?',
        'What is the debt-to-equity ratio analysis?',
        'How does this compare to industry benchmarks?'
      ]
    },
    features: {
      translation: true,
      sentiment: false,
      entities: true,
      keyMetrics: true,
      compliance: true
    },
    outputFormat: {
      sections: ['Executive Summary', 'Financial Metrics', 'Trend Analysis', 'Risk Assessment', 'Recommendations'],
      visualizations: ['charts', 'tables', 'metrics']
    }
  },
  {
    id: 'legal-contract',
    name: 'Legal Document Review',
    description: 'Specialized analysis for contracts, agreements, and legal documents',
    documentTypes: ['pdf', 'docx'],
    icon: FileText,
    color: 'text-blue-500',
    prompts: {
      summary: 'Analyze this legal document focusing on key terms, obligations, rights, deadlines, and potential risks or concerns.',
      insights: 'Extract critical legal insights including party obligations, liability terms, termination clauses, and compliance requirements.',
      actions: 'Identify immediate action items including deadline tracking, compliance requirements, and risk mitigation steps.',
      recommendations: 'Provide recommendations for contract optimization, risk reduction, and legal compliance improvements.',
      customQuestions: [
        'What are the key obligations for each party?',
        'Are there any unusual or risky clauses?',
        'What are the termination conditions?',
        'What compliance requirements exist?'
      ]
    },
    features: {
      translation: true,
      sentiment: false,
      entities: true,
      keyMetrics: false,
      compliance: true
    },
    outputFormat: {
      sections: ['Contract Overview', 'Key Terms', 'Obligations Matrix', 'Risk Analysis', 'Compliance Checklist'],
      visualizations: ['timeline', 'obligations-table', 'risk-matrix']
    }
  },
  {
    id: 'research-paper',
    name: 'Research Analysis',
    description: 'Academic and research document analysis with methodology focus',
    documentTypes: ['pdf', 'docx'],
    icon: Brain,
    color: 'text-purple-500',
    prompts: {
      summary: 'Analyze this research document focusing on methodology, findings, conclusions, and scientific contribution.',
      insights: 'Extract key research insights including novel findings, methodological strengths, limitations, and implications.',
      actions: 'Identify follow-up research opportunities, methodology improvements, and practical applications.',
      recommendations: 'Provide recommendations for research enhancement, future studies, and practical implementation.',
      customQuestions: [
        'What is the main research hypothesis?',
        'What methodologies were used?',
        'What are the key findings and their significance?',
        'What are the limitations and future research directions?'
      ]
    },
    features: {
      translation: true,
      sentiment: false,
      entities: true,
      keyMetrics: true,
      compliance: false
    },
    outputFormat: {
      sections: ['Research Summary', 'Methodology Analysis', 'Key Findings', 'Limitations', 'Future Work'],
      visualizations: ['methodology-flow', 'results-summary', 'citation-analysis']
    }
  },
  {
    id: 'business-proposal',
    name: 'Business Proposal Review',
    description: 'Strategic analysis for business proposals and project plans',
    documentTypes: ['pdf', 'docx', 'pptx'],
    icon: Sparkle,
    color: 'text-orange-500',
    prompts: {
      summary: 'Analyze this business proposal focusing on objectives, strategy, feasibility, and expected outcomes.',
      insights: 'Extract strategic insights including market opportunity, competitive advantage, resource requirements, and success factors.',
      actions: 'Identify critical action items for proposal improvement, implementation steps, and risk mitigation.',
      recommendations: 'Provide strategic recommendations for enhancing proposal strength, addressing weaknesses, and improving success probability.',
      customQuestions: [
        'What is the core value proposition?',
        'What are the main risks and mitigation strategies?',
        'Is the timeline realistic and achievable?',
        'What resources are required for success?'
      ]
    },
    features: {
      translation: true,
      sentiment: true,
      entities: true,
      keyMetrics: true,
      compliance: false
    },
    outputFormat: {
      sections: ['Proposal Overview', 'Strategic Analysis', 'Feasibility Assessment', 'Risk Analysis', 'Implementation Plan'],
      visualizations: ['swot-analysis', 'timeline', 'resource-allocation']
    }
  },
  {
    id: 'data-spreadsheet',
    name: 'Data Analysis',
    description: 'Comprehensive analysis for spreadsheets and data files',
    documentTypes: ['xlsx', 'csv', 'xls'],
    icon: Table,
    color: 'text-emerald-500',
    prompts: {
      summary: 'Analyze this data document focusing on patterns, trends, outliers, and statistical insights.',
      insights: 'Extract data insights including correlation patterns, distribution analysis, trend identification, and anomaly detection.',
      actions: 'Identify data quality improvements, further analysis opportunities, and actionable insights.',
      recommendations: 'Provide recommendations for data optimization, visualization strategies, and decision-making applications.',
      customQuestions: [
        'What are the main data patterns and trends?',
        'Are there any outliers or anomalies?',
        'What correlations exist between variables?',
        'What data quality issues should be addressed?'
      ]
    },
    features: {
      translation: false,
      sentiment: false,
      entities: false,
      keyMetrics: true,
      compliance: false
    },
    outputFormat: {
      sections: ['Data Overview', 'Statistical Analysis', 'Trend Analysis', 'Quality Assessment', 'Insights Summary'],
      visualizations: ['charts', 'distributions', 'correlation-matrix', 'trend-lines']
    }
  }
]

interface AnalysisTemplatesProps {
  documentType: string
  onTemplateSelect: (template: AnalysisTemplate) => void
  selectedTemplate?: AnalysisTemplate
}

export function AnalysisTemplates({ documentType, onTemplateSelect, selectedTemplate }: AnalysisTemplatesProps) {
  const [customTemplates, setCustomTemplates] = useKV<AnalysisTemplate[]>('custom-templates', [])
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AnalysisTemplate | null>(null)
  const [activeTab, setActiveTab] = useState('templates')

  // Filter templates based on document type
  const availableTemplates = [...defaultTemplates, ...customTemplates].filter(template =>
    template.documentTypes.some(type => documentType.includes(type))
  )

  const handleTemplateSelect = (template: AnalysisTemplate) => {
    onTemplateSelect(template)
    toast.success(`${template.name} template selected`)
  }

  const handleCreateCustomTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      description: '',
      documentTypes: [documentType],
      icon: FileText,
      color: 'text-blue-500',
      prompts: {
        summary: '',
        insights: '',
        actions: '',
        recommendations: '',
        customQuestions: []
      },
      features: {
        translation: false,
        sentiment: false,
        entities: false,
        keyMetrics: false,
        compliance: false
      },
      outputFormat: {
        sections: [],
        visualizations: []
      }
    })
    setShowCustomDialog(true)
  }

  const handleSaveCustomTemplate = (template: AnalysisTemplate) => {
    if (template.id) {
      // Update existing
      setCustomTemplates(current =>
        current.map(t => t.id === template.id ? template : t)
      )
    } else {
      // Create new
      const newTemplate = { ...template, id: Date.now().toString() }
      setCustomTemplates(current => [...current, newTemplate])
    }
    setShowCustomDialog(false)
    setEditingTemplate(null)
    toast.success('Custom template saved successfully')
  }

  const handleDeleteTemplate = (templateId: string) => {
    setCustomTemplates(current => current.filter(t => t.id !== templateId))
    toast.success('Template deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Analysis Templates</h3>
          <p className="text-sm text-muted-foreground">
            Choose a specialized template for {documentType} analysis
          </p>
        </div>
        
        <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={handleCreateCustomTemplate}>
              <Settings size={16} className="mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                onSave={handleSaveCustomTemplate}
                onCancel={() => {
                  setShowCustomDialog(false)
                  setEditingTemplate(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Available Templates</TabsTrigger>
          <TabsTrigger value="custom">My Templates ({customTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultTemplates
              .filter(template => template.documentTypes.some(type => documentType.includes(type)))
              .map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleTemplateSelect(template)}
                  index={index}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {customTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-4xl">🎨</div>
                <h3 className="text-lg font-semibold">No custom templates yet</h3>
                <p className="text-muted-foreground text-sm">
                  Create custom analysis templates tailored to your specific document types and requirements
                </p>
                <Button onClick={handleCreateCustomTemplate}>
                  Create Your First Template
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => handleTemplateSelect(template)}
                  onEdit={() => {
                    setEditingTemplate(template)
                    setShowCustomDialog(true)
                  }}
                  onDelete={() => handleDeleteTemplate(template.id)}
                  isCustom
                  index={index}
                />
              ))}
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
  isCustom?: boolean
  index: number
}

function TemplateCard({ template, isSelected, onSelect, onEdit, onDelete, isCustom, index }: TemplateCardProps) {
  const Icon = template.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background ${template.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-xs">
                  {template.documentTypes.join(', ').toUpperCase()}
                </CardDescription>
              </div>
            </div>
            
            {isCustom && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Settings size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
                  ×
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent onClick={onSelect}>
          <p className="text-sm text-muted-foreground mb-3">
            {template.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(template.features)
              .filter(([_, enabled]) => enabled)
              .map(([feature, _]) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
          </div>

          <div className="text-xs text-muted-foreground">
            {template.outputFormat.sections.length} sections • {template.outputFormat.visualizations.length} visualizations
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

function CustomTemplateEditor({ template: initialTemplate, onSave, onCancel }: CustomTemplateEditorProps) {
  const [template, setTemplate] = useState<AnalysisTemplate>(initialTemplate)

  const handleSave = () => {
    if (!template.name || !template.description) {
      toast.error('Please fill in all required fields')
      return
    }
    onSave(template)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={template.name}
            onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Contract Analysis"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">Color Theme</Label>
          <Select
            value={template.color}
            onValueChange={(value) => setTemplate(prev => ({ ...prev, color: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-blue-500">Blue</SelectItem>
              <SelectItem value="text-green-500">Green</SelectItem>
              <SelectItem value="text-purple-500">Purple</SelectItem>
              <SelectItem value="text-orange-500">Orange</SelectItem>
              <SelectItem value="text-emerald-500">Emerald</SelectItem>
              <SelectItem value="text-red-500">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={template.description}
          onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this template is designed to analyze"
          rows={2}
        />
      </div>

      <div className="space-y-4">
        <Label>Analysis Prompts</Label>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="summary-prompt">Summary Prompt</Label>
            <Textarea
              id="summary-prompt"
              value={template.prompts.summary}
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
              value={template.prompts.insights}
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
              value={template.prompts.actions}
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
              value={template.prompts.recommendations}
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
          {Object.entries(template.features).map(([feature, enabled]) => (
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