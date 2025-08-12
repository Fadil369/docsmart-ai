import { useState, useEffect } from 'react'
import { Sparkle, Brain, Download, Copy, Share, ChartBar, Translate, AlertTriangle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AnalysisTemplates, AnalysisTemplate } from './AnalysisTemplates'
import { TemplateRecommendations } from './TemplateRecommendations'
import { DetailedAnalysis } from './DetailedAnalysis'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  size: number
  type: string
  content?: string
}

interface SmartAnalysisProps {
  document: Document
  isOpen: boolean
  onClose: () => void
}

interface AnalysisStep {
  id: string
  name: string
  description: string
  progress: number
  status: 'pending' | 'running' | 'completed' | 'error'
  result?: any
}

interface AnalysisResult {
  summary: string
  keyPoints: string[]
  actionItems: string[]
  insights: string[]
  recommendations: string[]
  language: 'en' | 'ar'
  confidence: number
  processingTime: number
  templateUsed: string
  customData?: any
}

export function SmartAnalysis({ document, isOpen, onClose }: SmartAnalysisProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AnalysisTemplate | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showDetailedResults, setShowDetailedResults] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'ar'>('en')
  const [analysisMode, setAnalysisMode] = useState<'template' | 'custom'>('template')

  // Auto-detect document type and suggest templates
  const detectedDocumentType = detectDocumentType(document)
  const documentHints = {
    fileType: document.type,
    fileName: document.name,
    fileSize: document.size,
    detectedLanguage: 'en', // Would be detected from content
    contentType: detectedDocumentType.category,
    complexity: document.size > 5000000 ? 'high' as const : document.size > 1000000 ? 'medium' as const : 'low' as const
  }

  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setAnalysisResult(null)
      setIsAnalyzing(false)
      setAnalysisSteps([])
      setShowDetailedResults(false)
    }
  }, [isOpen])

  const initializeAnalysisSteps = (template: AnalysisTemplate): AnalysisStep[] => {
    const baseSteps: AnalysisStep[] = [
      {
        id: 'extraction',
        name: 'Content Extraction',
        description: 'Extracting text and structure from document',
        progress: 0,
        status: 'pending'
      },
      {
        id: 'preprocessing',
        name: 'Content Processing',
        description: 'Cleaning and preparing content for analysis',
        progress: 0,
        status: 'pending'
      }
    ]

    // Add template-specific steps
    if (template.features.translation) {
      baseSteps.push({
        id: 'translation',
        name: 'Language Analysis',
        description: 'Detecting language and preparing translation',
        progress: 0,
        status: 'pending'
      })
    }

    if (template.features.entities) {
      baseSteps.push({
        id: 'entities',
        name: 'Entity Recognition',
        description: 'Identifying key entities and relationships',
        progress: 0,
        status: 'pending'
      })
    }

    if (template.features.sentiment) {
      baseSteps.push({
        id: 'sentiment',
        name: 'Sentiment Analysis',
        description: 'Analyzing document tone and sentiment',
        progress: 0,
        status: 'pending'
      })
    }

    if (template.features.keyMetrics) {
      baseSteps.push({
        id: 'metrics',
        name: 'Metrics Extraction',
        description: 'Extracting quantitative data and KPIs',
        progress: 0,
        status: 'pending'
      })
    }

    baseSteps.push(
      {
        id: 'ai-analysis',
        name: 'AI Analysis',
        description: `Applying ${template.name} analysis template`,
        progress: 0,
        status: 'pending'
      },
      {
        id: 'synthesis',
        name: 'Results Synthesis',
        description: 'Compiling and formatting final results',
        progress: 0,
        status: 'pending'
      }
    )

    return baseSteps
  }

  const simulateAnalysisStep = async (step: AnalysisStep, template: AnalysisTemplate): Promise<void> => {
    return new Promise((resolve) => {
      setAnalysisSteps(prev =>
        prev.map(s => s.id === step.id ? { ...s, status: 'running' } : s)
      )

      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisSteps(prev =>
          prev.map(s => {
            if (s.id === step.id && s.progress < 100) {
              return { ...s, progress: Math.min(s.progress + 10, 100) }
            }
            return s
          })
        )
      }, 100)

      // Complete after simulation
      setTimeout(() => {
        clearInterval(progressInterval)
        setAnalysisSteps(prev =>
          prev.map(s => s.id === step.id ? { ...s, status: 'completed', progress: 100 } : s)
        )
        resolve()
      }, 1500)
    })
  }

  const performAIAnalysis = async (template: AnalysisTemplate): Promise<AnalysisResult> => {
    // Simulate AI analysis using the template
    const startTime = Date.now()
    
    // Create AI prompts based on template
    const summaryPrompt = spark.llmPrompt`${template.prompts.summary}\n\nDocument: ${document.name}\nContent: [Document content would be here]`
    const insightsPrompt = spark.llmPrompt`${template.prompts.insights}\n\nDocument: ${document.name}\nContent: [Document content would be here]`
    const actionsPrompt = spark.llmPrompt`${template.prompts.actions}\n\nDocument: ${document.name}\nContent: [Document content would be here]`
    const recommendationsPrompt = spark.llmPrompt`${template.prompts.recommendations}\n\nDocument: ${document.name}\nContent: [Document content would be here]`

    // Simulate AI responses (in real implementation, these would be actual LLM calls)
    const mockResults = generateMockAnalysisResults(document, template)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const processingTime = Math.round((Date.now() - startTime) / 1000)

    return {
      ...mockResults,
      processingTime,
      templateUsed: template.name,
      confidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
    }
  }

  const startAnalysis = async () => {
    if (!selectedTemplate) {
      toast.error('Please select an analysis template')
      return
    }

    setIsAnalyzing(true)
    const steps = initializeAnalysisSteps(selectedTemplate)
    setAnalysisSteps(steps)

    try {
      // Execute analysis steps
      for (const step of steps) {
        if (step.id === 'ai-analysis') {
          // Perform actual AI analysis
          const result = await performAIAnalysis(selectedTemplate)
          setAnalysisResult(result)
        }
        await simulateAnalysisStep(step, selectedTemplate)
      }

      toast.success('Analysis completed successfully!')
      
      // Auto-show detailed results
      setTimeout(() => {
        setShowDetailedResults(true)
      }, 1000)

    } catch (error) {
      toast.error('Analysis failed. Please try again.')
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExportResults = (format: string) => {
    if (!analysisResult) return
    
    toast.success(`Results exported as ${format.toUpperCase()}`)
  }

  const handleTranslate = async () => {
    if (!analysisResult) return
    
    const newLanguage = targetLanguage === 'en' ? 'ar' : 'en'
    setTargetLanguage(newLanguage)
    
    toast.success(`Translating to ${newLanguage === 'ar' ? 'Arabic' : 'English'}...`)
    
    // Simulate translation
    setTimeout(() => {
      setAnalysisResult(prev => prev ? { ...prev, language: newLanguage } : null)
      toast.success('Translation completed!')
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="text-primary" size={20} />
            Smart AI Analysis
          </DialogTitle>
          <DialogDescription>
            Intelligent document analysis for {document.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="setup" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="progress" disabled={!isAnalyzing && !analysisResult}>
                Progress
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!analysisResult}>
                Results
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="setup" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-6">
                    {/* Document Info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Document Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p className="font-medium">{document.name}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <p className="font-medium">{detectedDocumentType.category}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <p className="font-medium">{(document.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Suggested Template:</span>
                            <p className="font-medium text-primary">{detectedDocumentType.suggestedTemplate}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Template Recommendations */}
                    <TemplateRecommendations
                      documentHints={documentHints}
                      availableTemplates={[]} // This would be populated with available templates
                      onTemplateSelect={setSelectedTemplate}
                      isVisible={!selectedTemplate}
                    />

                    {/* Template Selection */}
                    <AnalysisTemplates
                      documentType={document.type}
                      onTemplateSelect={setSelectedTemplate}
                      selectedTemplate={selectedTemplate}
                    />

                    {/* Analysis Options */}
                    {selectedTemplate && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Analysis Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="font-medium">Target Language</Label>
                              <p className="text-sm text-muted-foreground">
                                Language for analysis output
                              </p>
                            </div>
                            <Select value={targetLanguage} onValueChange={(value: 'en' | 'ar') => setTargetLanguage(value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ar">Arabic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="pt-4 border-t">
                            <Button 
                              onClick={startAnalysis}
                              disabled={isAnalyzing}
                              className="w-full"
                              size="lg"
                            >
                              <Sparkle size={16} className="mr-2" />
                              {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="progress" className="h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Analysis Progress</CardTitle>
                      <CardDescription>
                        Processing {document.name} using {selectedTemplate?.name} template
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysisSteps.map((step, index) => (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  step.status === 'completed' ? 'bg-success text-success-foreground' :
                                  step.status === 'running' ? 'bg-primary text-primary-foreground' :
                                  step.status === 'error' ? 'bg-destructive text-destructive-foreground' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {step.status === 'completed' ? '✓' :
                                   step.status === 'running' ? '⟳' :
                                   step.status === 'error' ? '✗' : index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{step.name}</p>
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                </div>
                              </div>
                              <Badge variant={
                                step.status === 'completed' ? 'default' :
                                step.status === 'running' ? 'default' :
                                step.status === 'error' ? 'destructive' : 'secondary'
                              }>
                                {step.status}
                              </Badge>
                            </div>
                            {step.status === 'running' && (
                              <Progress value={step.progress} className="h-1" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="results" className="h-full">
                {analysisResult && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">Analysis Complete</CardTitle>
                            <CardDescription>
                              Generated using {analysisResult.templateUsed} • {analysisResult.processingTime}s processing time
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              {Math.round(analysisResult.confidence * 100)}% confidence
                            </Badge>
                            {selectedTemplate?.features.translation && (
                              <Button variant="outline" size="sm" onClick={handleTranslate}>
                                <Translate size={14} className="mr-1" />
                                {targetLanguage === 'en' ? 'AR' : 'EN'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button onClick={() => setShowDetailedResults(true)}>
                            <ChartBar size={16} className="mr-2" />
                            View Detailed Report
                          </Button>
                          <Button variant="outline" onClick={() => handleExportResults('pdf')}>
                            <Download size={16} className="mr-2" />
                            Export PDF
                          </Button>
                          <Button variant="outline" onClick={() => handleExportResults('docx')}>
                            <Download size={16} className="mr-2" />
                            Export DOCX
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Results Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quick Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Summary</h4>
                            <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Key Points ({analysisResult.keyPoints.length})</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {analysisResult.keyPoints.slice(0, 3).map((point, index) => (
                                  <li key={index}>• {point}</li>
                                ))}
                                {analysisResult.keyPoints.length > 3 && (
                                  <li>• And {analysisResult.keyPoints.length - 3} more...</li>
                                )}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2">Action Items ({analysisResult.actionItems.length})</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {analysisResult.actionItems.slice(0, 3).map((item, index) => (
                                  <li key={index}>• {item}</li>
                                ))}
                                {analysisResult.actionItems.length > 3 && (
                                  <li>• And {analysisResult.actionItems.length - 3} more...</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Detailed Analysis Modal */}
        <AnimatePresence>
          {showDetailedResults && analysisResult && (
            <DetailedAnalysis
              documentName={document.name}
              analysis={analysisResult}
              onClose={() => setShowDetailedResults(false)}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions

function detectDocumentType(document: Document) {
  const extension = document.name.split('.').pop()?.toLowerCase()
  const name = document.name.toLowerCase()

  if (extension === 'pdf') {
    if (name.includes('contract') || name.includes('agreement') || name.includes('legal')) {
      return { category: 'Legal Document', suggestedTemplate: 'Legal Document Review' }
    }
    if (name.includes('financial') || name.includes('report') || name.includes('statement')) {
      return { category: 'Financial Document', suggestedTemplate: 'Financial Analysis' }
    }
    if (name.includes('research') || name.includes('paper') || name.includes('study')) {
      return { category: 'Research Document', suggestedTemplate: 'Research Analysis' }
    }
    if (name.includes('proposal') || name.includes('plan') || name.includes('business')) {
      return { category: 'Business Document', suggestedTemplate: 'Business Proposal Review' }
    }
    return { category: 'General PDF', suggestedTemplate: 'General Analysis' }
  }

  if (['xlsx', 'xls', 'csv'].includes(extension || '')) {
    return { category: 'Spreadsheet', suggestedTemplate: 'Data Analysis' }
  }

  if (['docx', 'doc'].includes(extension || '')) {
    return { category: 'Text Document', suggestedTemplate: 'General Analysis' }
  }

  return { category: 'Unknown', suggestedTemplate: 'General Analysis' }
}

function generateMockAnalysisResults(document: Document, template: AnalysisTemplate): Omit<AnalysisResult, 'processingTime' | 'templateUsed' | 'confidence'> {
  // Generate realistic mock results based on template type
  const templateResults: Record<string, any> = {
    'financial-report': {
      summary: 'This financial document shows strong revenue growth of 15% year-over-year, with improved profit margins and solid cash flow management. Key performance indicators demonstrate healthy business fundamentals.',
      keyPoints: [
        'Revenue increased 15% to $2.4M in Q3 2024',
        'Operating margin improved from 12% to 16%',
        'Cash flow from operations up 22%',
        'Debt-to-equity ratio maintained at 0.3'
      ],
      actionItems: [
        'Review cost optimization opportunities in operations',
        'Consider expansion into new markets given strong cash position',
        'Monitor debt levels as growth accelerates',
        'Implement quarterly performance tracking system'
      ],
      insights: [
        'Strong operational efficiency gains driving margin improvement',
        'Customer acquisition costs decreasing while retention improving',
        'Working capital management showing significant improvement',
        'Market position strengthening relative to competitors'
      ],
      recommendations: [
        'Maintain current growth trajectory while preserving margins',
        'Invest in technology infrastructure to support scaling',
        'Develop strategic partnerships for market expansion',
        'Consider dividend policy given improved cash generation'
      ]
    },
    'legal-contract': {
      summary: 'This legal agreement establishes clear terms for service delivery with well-defined obligations, reasonable termination clauses, and appropriate liability limitations. Several areas require attention for risk mitigation.',
      keyPoints: [
        'Service level agreements clearly defined with penalties',
        'Intellectual property rights properly assigned',
        'Termination clause allows 30-day notice period',
        'Liability cap set at 12 months of fees'
      ],
      actionItems: [
        'Review and negotiate liability cap terms',
        'Clarify data privacy compliance requirements',
        'Establish dispute resolution procedures',
        'Set up contract compliance monitoring system'
      ],
      insights: [
        'Contract favors the service provider in key areas',
        'Data handling provisions need GDPR compliance review',
        'Force majeure clause may be insufficient for current risks',
        'Payment terms are standard but could be optimized'
      ],
      recommendations: [
        'Negotiate more balanced liability terms',
        'Add specific data protection clauses',
        'Include technology change management provisions',
        'Establish regular contract review schedule'
      ]
    }
  }

  const defaultResult = {
    summary: `Comprehensive analysis of ${document.name} reveals key insights and actionable recommendations based on the document content and structure.`,
    keyPoints: [
      'Document contains well-structured information',
      'Key data points and metrics identified',
      'Important relationships and patterns discovered',
      'Critical information highlighted for attention'
    ],
    actionItems: [
      'Review highlighted sections for immediate action',
      'Follow up on identified opportunities',
      'Address potential risks or concerns',
      'Implement suggested improvements'
    ],
    insights: [
      'Document quality and completeness assessment',
      'Pattern analysis reveals important trends',
      'Cross-reference validation completed',
      'Context analysis provides deeper understanding'
    ],
    recommendations: [
      'Maintain regular review schedule for similar documents',
      'Implement tracking system for key metrics',
      'Consider automation opportunities',
      'Establish best practices based on findings'
    ]
  }

  const templateId = template.id
  return templateResults[templateId] || defaultResult
}