// WorkspacePage.tsx - Enhanced workspace with demo timer integration

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap,
  ArrowRight 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemoTimerContext } from '@/contexts/DemoTimerContext'
import { useDocuments } from '@/contexts/DocumentContext'
import { DemoStatusPill } from '@/components/demo/DemoStatusPill'

// Mock document data for demo
const mockDocuments = [
  {
    id: '1',
    name: 'Financial Report Q3.pdf',
    type: 'PDF',
    size: '2.4 MB',
    status: 'processed',
    uploadDate: '2024-01-15',
    insights: 3
  },
  {
    id: '2', 
    name: 'Contract Agreement.docx',
    type: 'DOCX',
    size: '890 KB',
    status: 'processing',
    uploadDate: '2024-01-14',
    insights: 0
  }
]

export function WorkspacePage() {
  const navigate = useNavigate()
  const demoTimer = useDemoTimerContext()
  const { documents, addDocuments } = useDocuments()
  const [isUploading, setIsUploading] = useState(false)

  // Merge real documents with demo documents for richer experience
  const allDocuments = [...documents, ...mockDocuments]

  const handleUpload = async () => {
    if (demoTimer.hasExpired) {
      // Redirect to payment when demo expired
      navigate('/payment')
      return
    }

    setIsUploading(true)
    
    try {
      // Create a mock file for demo purposes
      const mockFileContent = new Blob(['Demo document content for AI analysis...'], { type: 'application/pdf' })
      const mockFile = new File([mockFileContent], `Demo Document ${allDocuments.length + 1}.pdf`, {
        type: 'application/pdf'
      })
      
      // Use the context's addDocuments function
      await addDocuments([mockFile])
      
      setIsUploading(false)
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
    }
  }

  const handleUpgrade = () => {
    navigate('/payment')
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Demo Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Workspace</h1>
          <p className="text-muted-foreground">
            Upload, analyze, and extract insights from your documents
          </p>
        </div>
        
        {/* Demo Timer Pill */}
        {(demoTimer.isActive || demoTimer.hasExpired) && (
          <DemoStatusPill {...demoTimer} variant="compact" />
        )}
      </div>

      {/* Demo Expired Banner */}
      {demoTimer.hasExpired && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your demo session has expired. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 text-amber-800 underline"
              onClick={handleUpgrade}
            >
              Upgrade to continue
            </Button>
            with full access to all features.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Upload Document</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Add a new document for AI analysis
            </CardDescription>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || (demoTimer.hasExpired && !demoTimer.isActive)}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {demoTimer.hasExpired ? 'Upgrade Required' : 'Upload File'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">AI Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              {allDocuments.length} documents analyzed
            </CardDescription>
            <div className="text-2xl font-bold text-green-600">
              {allDocuments.reduce((acc, doc) => acc + (doc.insights || 0), 0)} insights
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Document storage used
            </CardDescription>
            <div className="text-2xl font-bold text-purple-600">
              {allDocuments.length * 1.2} MB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            Your uploaded documents and analysis results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-4">Upload your first document to get started</p>
              <Button onClick={handleUpload} disabled={demoTimer.hasExpired}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={doc.status === 'processed' ? 'default' : 'secondary'}
                      className={doc.status === 'processed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {doc.status === 'processed' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Processed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Processing
                        </>
                      )}
                    </Badge>
                    {doc.insights && doc.insights > 0 && (
                      <Badge variant="outline">
                        {doc.insights} insights
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={demoTimer.hasExpired || doc.status !== 'processed'}
                    >
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo CTA */}
      {demoTimer.isActive && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Enjoying the demo?</h3>
                <p className="text-sm text-gray-600">
                  Upgrade to unlock unlimited document processing and advanced features.
                </p>
              </div>
              <Button onClick={handleUpgrade} className="bg-gradient-to-r from-blue-600 to-purple-600">
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
