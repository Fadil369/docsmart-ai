import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { DocumentUpload } from '@/components/DocumentUpload'
import { DocumentCard } from '@/components/DocumentCard'
import { Header } from '@/components/Header'
import { LiveCollaboration } from '@/components/LiveCollaboration'
import { LandingPage } from '@/components/LandingPage'
import { useKV } from '@github/spark/hooks'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  name: string
  size: number
  type: string
  status: string
  uploadedAt: Date | string
}

function App() {
  const [documents, setDocuments] = useKV<Document[]>('documents', [])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showLanding, setShowLanding] = useState(true)

  const handleFilesUploaded = (uploadedFiles: any[]) => {
    const newDocuments: Document[] = uploadedFiles.map(file => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      status: file.status,
      uploadedAt: new Date()
    }))

    setDocuments(currentDocs => [...currentDocs, ...newDocuments])
  }

  const updateDocumentStatus = (documentId: string, status: string) => {
    setDocuments(currentDocs =>
      currentDocs.map(doc =>
        doc.id === documentId ? { ...doc, status } : doc
      )
    )
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header 
          documentsCount={documents.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="space-y-8">
          <DocumentUpload onFilesUploaded={handleFilesUploaded} />

          {/* Live Collaboration Section */}
          <LiveCollaboration />

          {documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
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

          {documents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl">📄</div>
                <h3 className="text-xl font-semibold">No documents yet</h3>
                <p className="text-muted-foreground">
                  Upload your first PDF or Excel file to get started with AI-powered document processing
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}

export default App