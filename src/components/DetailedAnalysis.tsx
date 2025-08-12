import { useState } from 'react'
import { Download, Copy, Share, Eye } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

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

interface DetailedAnalysisProps {
  documentName: string
  analysis: AnalysisResult
  onClose: () => void
}

export function DetailedAnalysis({ documentName, analysis, onClose }: DetailedAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleExport = (format: 'pdf' | 'docx' | 'txt') => {
    toast.success(`Analysis exported as ${format.toUpperCase()}`)
  }

  const handleCopy = () => {
    const text = `
Document Analysis: ${documentName}

Summary:
${analysis.summary}

Key Points:
${analysis.keyPoints.map(point => `• ${point}`).join('\n')}

Action Items:
${analysis.actionItems.map(item => `• ${item}`).join('\n')}

Insights:
${analysis.insights.map(insight => `• ${insight}`).join('\n')}

Recommendations:
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}
    `.trim()

    navigator.clipboard.writeText(text)
    toast.success('Analysis copied to clipboard')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-8 h-full flex flex-col max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">AI Analysis Report</h2>
            <p className="text-muted-foreground">{documentName}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              {Math.round(analysis.confidence * 100)}% confidence
            </Badge>
            
            <Badge variant="outline">
              {analysis.processingTime}s processing
            </Badge>
            
            <Button variant="outline" onClick={onClose}>
              <Eye size={16} className="mr-2" />
              Close
            </Button>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Document Intelligence Report</CardTitle>
                <CardDescription>
                  Generated on {new Date().toLocaleDateString()} • Language: {analysis.language.toUpperCase()}
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="h-full overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden mt-4">
                <TabsContent value="overview" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Executive Summary</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {analysis.summary}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-3">Key Findings</h3>
                        <div className="space-y-2">
                          {analysis.keyPoints.map((point, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                            >
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {index + 1}
                              </div>
                              <p className="text-sm">{point}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="insights" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {analysis.insights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <p className="text-sm">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="actions" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {analysis.actionItems.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
                        >
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <p className="text-sm flex-1">{item}</p>
                          <Badge variant="outline" className="text-xs">
                            Action {index + 1}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="recommendations" className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {analysis.recommendations.map((recommendation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg border bg-success/5 border-success/20"
                        >
                          <p className="text-sm">{recommendation}</p>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}