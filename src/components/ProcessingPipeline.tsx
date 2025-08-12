import { useState } from 'react'
import { Sparkles, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'

interface ProcessingStageProps {
  title: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  isComplete: boolean
  progress?: number
}

function ProcessingStage({ title, description, icon, isActive, isComplete, progress }: ProcessingStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-4 rounded-lg border bg-card"
    >
      <div className={`p-3 rounded-full transition-colors ${
        isComplete ? 'bg-success/10 text-success' :
        isActive ? 'bg-primary/10 text-primary' :
        'bg-muted text-muted-foreground'
      }`}>
        {isComplete ? <CheckCircle size={24} /> : icon}
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {isActive && progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        {isActive && (
          <Sparkles size={20} className="text-primary animate-pulse" />
        )}
        {isComplete && (
          <CheckCircle size={20} className="text-success" />
        )}
      </div>
    </motion.div>
  )
}

interface ProcessingPipelineProps {
  documentName: string
  currentStage: number
  stages: Array<{
    title: string
    description: string
    icon: React.ReactNode
    progress?: number
  }>
  onComplete?: () => void
}

export function ProcessingPipeline({ documentName, currentStage, stages, onComplete }: ProcessingPipelineProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-4 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={24} className="text-primary" />
            Processing Document
          </CardTitle>
          <CardDescription>
            {documentName} is being processed through our AI pipeline
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {stages.map((stage, index) => (
            <ProcessingStage
              key={index}
              title={stage.title}
              description={stage.description}
              icon={stage.icon}
              isActive={index === currentStage}
              isComplete={index < currentStage}
              progress={index === currentStage ? stage.progress : undefined}
            />
          ))}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Stage {currentStage + 1} of {stages.length}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsVisible(false)}
              >
                Hide
              </Button>
              
              {currentStage >= stages.length - 1 && (
                <Button onClick={onComplete}>
                  <CheckCircle size={16} className="mr-2" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}