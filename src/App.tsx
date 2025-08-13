import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WorkspaceArea } from '@/components/WorkspaceArea'
import { AppSidebar } from '@/components/AppSidebar'
import { DocumentCard } from '@/components/DocumentCard'
import { LandingPage } from '@/components/LandingPage'
import { useKV } from '@github/spark/hooks'
import { useTheme } from '@/lib/theme'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  size: number
  type: string
  status: string
  uploadedAt: Date | string
  progress?: number
}

function App() {
  const [documents, setDocuments] = useKV<Document[]>('documents', [])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showLanding, setShowLanding] = useState(true)
  const [activeActions, setActiveActions] = useState<string[]>([])
  const [actionProgress, setActionProgress] = useState<Record<string, number>>({})
  
  // Initialize theme on app load
  useTheme()

  const handleActionClick = async (actionId: string, files?: File[]) => {
    if (activeActions.includes(actionId)) return

    setActiveActions(prev => [...prev, actionId])
    setActionProgress(prev => ({ ...prev, [actionId]: 0 }))

    try {
      switch (actionId) {
        case 'upload':
          if (files) {
            await handleFilesUploaded(files)
          }
          break
        
        case 'translate':
          await simulateProgress(actionId, 'Translation completed')
          break
        
        case 'compress':
          await simulateProgress(actionId, 'Compression completed with 70% size reduction')
          break
        
        case 'merge':
          await simulateProgress(actionId, 'Documents merged successfully')
          break
        
        case 'analyze':
          await simulateProgress(actionId, 'Analysis completed - insights generated')
          break
        
        case 'ai-analyze':
          await simulateProgress(actionId, 'AI Copilot analysis completed with advanced insights')
          break
        
        case 'share':
          await simulateProgress(actionId, 'Document shared with team members')
          break
        
        case 'collaborate':
          await simulateProgress(actionId, 'Collaboration session started')
          break
        
        case 'template':
          await simulateProgress(actionId, 'Template created successfully')
          break
        
        case 'copy':
          await simulateProgress(actionId, 'Document copied')
          break
        
        case 'export':
          await simulateProgress(actionId, 'Document exported in multiple formats')
          break
      }
    } catch (error) {
      toast.error(`${actionId} failed: ${error}`)
    } finally {
      setTimeout(() => {
        setActiveActions(prev => prev.filter(id => id !== actionId))
        setActionProgress(prev => {
          const { [actionId]: removed, ...rest } = prev
          return rest
        })
      }, 1000)
    }
  }

  const simulateProgress = async (actionId: string, successMessage: string) => {
    for (let i = 0; i <= 100; i += 10) {
      setActionProgress(prev => ({ ...prev, [actionId]: i }))
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    toast.success(successMessage)
  }

  const handleFilesUploaded = async (uploadedFiles: File[]) => {
    const newDocuments: Document[] = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'processing',
      uploadedAt: new Date(),
      progress: 0
    }))

    setDocuments(currentDocs => [...currentDocs, ...newDocuments])

    // Simulate processing
    for (const doc of newDocuments) {
      for (let progress = 0; progress <= 100; progress += 20) {
        setDocuments(currentDocs =>
          currentDocs.map(d =>
            d.id === doc.id ? { ...d, progress } : d
          )
        )
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      setDocuments(currentDocs =>
        currentDocs.map(d =>
          d.id === doc.id ? { ...d, status: 'completed', progress: 100 } : d
        )
      )
    }
  }

  const handleGetStarted = () => {
    setShowLanding(false)
  }

  if (showLanding) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <Toaster />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          <Header 
            documentsCount={documents.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="space-y-8">
            {/* Enhanced Workspace Area */}
            <WorkspaceArea 
              onActionClick={handleActionClick}
              activeActions={activeActions}
              actionProgress={actionProgress}
            />

            {/* Documents Grid */}
            {documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Recent Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} in your workspace
                  </p>
                </div>
                
                <div className={cn(
                  "gap-6",
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col space-y-4"
                )}>
                  {documents.map((document, index) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
      
      <Toaster />
    </div>
  )
}

export default App