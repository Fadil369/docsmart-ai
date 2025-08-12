import { useState, useEffect } from 'react'
import { Lightbulb, Star, Target, TrendUp, CheckCircle, Clock } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { AnalysisTemplate } from './AnalysisTemplates'

interface DocumentAnalysisHints {
  fileType: string
  fileName: string
  fileSize: number
  detectedLanguage?: string
  contentType?: string
  complexity?: 'low' | 'medium' | 'high'
  confidenceScore?: number
}

interface TemplateRecommendation {
  template: AnalysisTemplate
  matchScore: number
  reasonsForMatch: string[]
  expectedOutcomes: string[]
  processingTime: string
  confidence: number
}

interface TemplateRecommendationsProps {
  documentHints: DocumentAnalysisHints
  availableTemplates: AnalysisTemplate[]
  onTemplateSelect: (template: AnalysisTemplate) => void
  isVisible: boolean
}

export function TemplateRecommendations({ 
  documentHints, 
  availableTemplates, 
  onTemplateSelect, 
  isVisible 
}: TemplateRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<TemplateRecommendation | null>(null)

  useEffect(() => {
    if (isVisible && availableTemplates.length > 0) {
      generateRecommendations()
    }
  }, [documentHints, availableTemplates, isVisible])

  const generateRecommendations = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis for template matching
    setTimeout(() => {
      const recommendations = analyzeDocumentForTemplates(documentHints, availableTemplates)
      setRecommendations(recommendations)
      setIsAnalyzing(false)
    }, 1500)
  }

  const analyzeDocumentForTemplates = (
    hints: DocumentAnalysisHints, 
    templates: AnalysisTemplate[]
  ): TemplateRecommendation[] => {
    const scoredTemplates = templates.map(template => {
      let score = 0
      const reasons: string[] = []
      const outcomes: string[] = []

      // File type matching
      if (template.documentTypes.includes(hints.fileType)) {
        score += 30
        reasons.push(`Optimized for ${hints.fileType.toUpperCase()} files`)
      }

      // File name analysis
      const fileName = hints.fileName.toLowerCase()
      
      if (template.id === 'financial-report' && 
          (fileName.includes('financial') || fileName.includes('budget') || fileName.includes('revenue'))) {
        score += 25
        reasons.push('Financial keywords detected in filename')
        outcomes.push('Revenue trend analysis', 'Cost optimization opportunities')
      }

      if (template.id === 'legal-contract' && 
          (fileName.includes('contract') || fileName.includes('agreement') || fileName.includes('legal'))) {
        score += 25
        reasons.push('Legal document indicators found')
        outcomes.push('Contract risk assessment', 'Compliance checking')
      }

      if (template.id === 'research-paper' && 
          (fileName.includes('research') || fileName.includes('study') || fileName.includes('paper'))) {
        score += 25
        reasons.push('Academic/research content detected')
        outcomes.push('Methodology analysis', 'Citation tracking')
      }

      if (template.id === 'business-proposal' && 
          (fileName.includes('proposal') || fileName.includes('plan') || fileName.includes('strategy'))) {
        score += 25
        reasons.push('Business planning document identified')
        outcomes.push('Strategic recommendations', 'Feasibility assessment')
      }

      if (template.id === 'data-spreadsheet' && 
          ['xlsx', 'csv', 'xls'].includes(hints.fileType)) {
        score += 20
        reasons.push('Spreadsheet format perfect for data analysis')
        outcomes.push('Statistical insights', 'Pattern recognition')
      }

      // File size considerations
      if (hints.fileSize > 5000000) { // 5MB+
        if (template.features.keyMetrics) {
          score += 10
          reasons.push('Metrics extraction ideal for large documents')
        }
      } else {
        score += 5 // Small files are generally easier to process
        reasons.push('Quick processing expected for document size')
      }

      // Language support
      if (hints.detectedLanguage && template.features.translation) {
        score += 15
        reasons.push('Multi-language support available')
        outcomes.push('Cross-language analysis capabilities')
      }

      // Complexity matching
      if (hints.complexity === 'high' && template.features.entities) {
        score += 10
        reasons.push('Advanced entity recognition for complex documents')
      }

      // Add base outcomes for all templates
      outcomes.push('Comprehensive document summary', 'Actionable insights and recommendations')

      const processingTime = estimateProcessingTime(hints, template)
      const confidence = Math.min(score / 100, 0.95) // Cap at 95%

      return {
        template,
        matchScore: score,
        reasonsForMatch: reasons,
        expectedOutcomes: outcomes,
        processingTime,
        confidence
      }
    })

    // Sort by score and return top 3
    return scoredTemplates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
  }

  const estimateProcessingTime = (hints: DocumentAnalysisHints, template: AnalysisTemplate): string => {
    let baseTime = 30 // seconds
    
    // Adjust for file size
    const sizeMB = hints.fileSize / 1024 / 1024
    baseTime += sizeMB * 10
    
    // Adjust for template complexity
    const featureCount = Object.values(template.features).filter(Boolean).length
    baseTime += featureCount * 5
    
    // Adjust for document complexity
    if (hints.complexity === 'high') baseTime *= 1.5
    if (hints.complexity === 'low') baseTime *= 0.7
    
    if (baseTime < 60) {
      return `${Math.round(baseTime)}s`
    } else {
      return `${Math.round(baseTime / 60)}m ${Math.round(baseTime % 60)}s`
    }
  }

  const handleSelectTemplate = (recommendation: TemplateRecommendation) => {
    setSelectedRecommendation(recommendation)
    onTemplateSelect(recommendation.template)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="text-accent" size={20} />
                <CardTitle className="text-base">AI Template Recommendations</CardTitle>
              </div>
              <CardDescription>
                Based on your document analysis, here are the best template matches
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <Target size={16} className="text-primary" />
                    </div>
                    <span className="text-sm">Analyzing document characteristics...</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <RecommendationCard
                      key={recommendation.template.id}
                      recommendation={recommendation}
                      index={index}
                      isSelected={selectedRecommendation?.template.id === recommendation.template.id}
                      onSelect={() => handleSelectTemplate(recommendation)}
                    />
                  ))}
                  
                  {recommendations.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Lightbulb size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No specific template recommendations available</p>
                      <p className="text-xs">You can still choose from all available templates</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface RecommendationCardProps {
  recommendation: TemplateRecommendation
  index: number
  isSelected: boolean
  onSelect: () => void
}

function RecommendationCard({ recommendation, index, isSelected, onSelect }: RecommendationCardProps) {
  const { template, matchScore, reasonsForMatch, expectedOutcomes, processingTime, confidence } = recommendation
  const Icon = template.icon

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-orange-500'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent Match', variant: 'default' as const }
    if (score >= 60) return { text: 'Good Match', variant: 'secondary' as const }
    return { text: 'Partial Match', variant: 'outline' as const }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-background ${template.color}`}>
              <Icon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{template.name}</h4>
                {index === 0 && (
                  <Star size={12} className="text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge {...getScoreBadge(matchScore)}>
              {getScoreBadge(matchScore).text}
            </Badge>
            <div className="text-right">
              <div className={`text-lg font-bold ${getScoreColor(matchScore)}`}>
                {matchScore}%
              </div>
              <div className="text-xs text-muted-foreground">match</div>
            </div>
          </div>
        </div>

        {/* Reasons */}
        <div>
          <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Why this template
          </h5>
          <ul className="text-xs space-y-1">
            {reasonsForMatch.slice(0, 2).map((reason, i) => (
              <li key={i} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle size={10} className="text-success flex-shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Outcomes */}
        <div>
          <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Expected results
          </h5>
          <div className="flex flex-wrap gap-1">
            {expectedOutcomes.slice(0, 3).map((outcome, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {outcome}
              </Badge>
            ))}
          </div>
        </div>

        {/* Processing Info */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>~{processingTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendUp size={10} />
              <span>{Math.round(confidence * 100)}% confidence</span>
            </div>
          </div>
          
          {isSelected && (
            <Badge variant="default" className="text-xs">
              Selected
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}