import { useState } from 'react'
import { Brain, Translate, ArrowsIn, DocumentDuplicate, Download, Sparkles, Eye, Target } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { DetailedAnalysis } from '@/components/DetailedAnalysis'
import { SmartAnalysis } from '@/components/SmartAnalysis'
import { toast } from 'sonner'

interface DocumentFile {
  id: string
  name: string
  size: number
  type: string
  status: string
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
}

interface DocumentCardProps {
  document: DocumentFile
  index: number
}

export function DocumentCard({ document, index }: DocumentCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)
  const [showSmartAnalysis, setShowSmartAnalysis] = useState(false)
  const [analysis, setAnalysis] = useKV<AnalysisResult | null>(`analysis_${document.id}`, null)
  const [compressionResult, setCompressionResult] = useState<{ originalSize: number, compressedSize: number } | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('sheet') || type.includes('excel')) return '📊'
    return '📎'
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis with more comprehensive data
    setTimeout(async () => {
      const mockAnalysis: AnalysisResult = {
        summary: `This ${document.type.includes('pdf') ? 'PDF document' : 'Excel spreadsheet'} contains comprehensive business information with key performance indicators and strategic insights that require stakeholder attention.`,
        keyPoints: [
          'Financial data shows positive growth trends across all quarters',
          'Key performance indicators exceed industry benchmarks by 15%',
          'Strategic recommendations align with long-term objectives',
          'Risk assessment indicates minimal exposure to market volatility'
        ],
        actionItems: [
          'Review quarterly budget allocations for optimal resource distribution',
          'Schedule follow-up meeting with stakeholders within 2 weeks',
          'Update project timelines to reflect new market conditions',
          'Prepare executive summary report for board presentation'
        ],
        insights: [
          'Customer acquisition costs decreased by 23% compared to previous quarter',
          'Revenue per customer increased significantly in high-value segments',
          'Market penetration in target demographics shows promising growth',
          'Operational efficiency improvements generated $2.1M in cost savings'
        ],
        recommendations: [
          'Increase marketing budget allocation for high-performing channels',
          'Implement automated reporting systems to reduce manual overhead',
          'Expand team capacity in customer success to maintain growth trajectory',
          'Consider strategic partnerships to accelerate market expansion'
        ],
        language: 'en',
        confidence: 0.92,
        processingTime: Math.floor(2 + Math.random() * 3)
      }
      
      await setAnalysis(mockAnalysis)
      setIsAnalyzing(false)
      toast.success('Document analysis completed successfully')
    }, 2000)
  }

  const handleTranslate = async () => {
    setIsTranslating(true)
    
    // Simulate translation
    setTimeout(() => {
      setIsTranslating(false)
      toast.success('Document translated successfully')
    }, 3000)
  }

  const handleCompress = async () => {
    setIsCompressing(true)
    
    // Simulate compression
    setTimeout(() => {
      const originalSize = document.size
      const compressedSize = Math.floor(originalSize * (0.3 + Math.random() * 0.4)) // 30-70% of original
      
      setCompressionResult({ originalSize, compressedSize })
      setIsCompressing(false)
      toast.success('Document compressed successfully')
    }, 1500)
  }

  const handleViewAnalysis = () => {
    if (analysis) {
      setShowDetailedAnalysis(true)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card className="hover:shadow-lg transition-all duration-200 hover:shadow-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{getFileTypeIcon(document.type)}</span>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{document.name}</CardTitle>
                <CardDescription>
                  {formatFileSize(document.size)} • {document.type.includes('pdf') ? 'PDF Document' : 'Excel Spreadsheet'}
                </CardDescription>
              </div>
              
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {document.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSmartAnalysis(true)}
                className="flex items-center gap-2"
              >
                <Target size={16} />
                Smart Analysis
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <Brain size={16} />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Quick AI'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-2"
              >
                {isTranslating ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <Translate size={16} />
                )}
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCompress}
                disabled={isCompressing}
                className="flex items-center gap-2"
              >
                {isCompressing ? (
                  <Sparkles size={16} className="animate-spin" />
                ) : (
                  <ArrowsIn size={16} />
                )}
                {isCompressing ? 'Compressing...' : 'Compress'}
              </Button>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain size={16} className="text-primary" />
                      <span className="font-medium text-sm">AI Analysis</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(analysis.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewAnalysis}
                      className="h-6 px-2 text-xs"
                    >
                      <Eye size={12} className="mr-1" />
                      View Full
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {analysis.summary}
                  </p>
                  
                  <div className="grid gap-3">
                    <div>
                      <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Key Points
                      </h5>
                      <ul className="text-xs space-y-1">
                        {analysis.keyPoints.slice(0, 2).map((point, i) => (
                          <li key={i} className="text-muted-foreground">• {point}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        Action Items
                      </h5>
                      <ul className="text-xs space-y-1">
                        {analysis.actionItems.slice(0, 2).map((item, i) => (
                          <li key={i} className="text-muted-foreground">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Compression Results */}
            {compressionResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Separator />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowsIn size={16} className="text-success" />
                    <span className="font-medium text-sm">Compression Complete</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Original:</span>
                      <p className="font-medium">{formatFileSize(compressionResult.originalSize)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Compressed:</span>
                      <p className="font-medium text-success">{formatFileSize(compressionResult.compressedSize)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                      {Math.round((1 - compressionResult.compressedSize / compressionResult.originalSize) * 100)}% smaller
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analysis Modal */}
      {showDetailedAnalysis && analysis && (
        <DetailedAnalysis
          documentName={document.name}
          analysis={analysis}
          onClose={() => setShowDetailedAnalysis(false)}
        />
      )}

      {/* Smart Analysis Modal */}
      {showSmartAnalysis && (
        <SmartAnalysis
          document={document}
          isOpen={showSmartAnalysis}
          onClose={() => setShowSmartAnalysis(false)}
        />
      )}
    </>
  )
}