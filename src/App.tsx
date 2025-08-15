import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WorkspaceArea } from '@/components/WorkspaceArea'
import { AppSidebar } from '@/components/AppSidebar'
import { DocumentCard } from '@/components/DocumentCard'
import { LandingPage } from '@/components/LandingPage'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserProfile } from '@/components/auth/UserProfile'
import { PaymentSession } from '@/types/payment'
import { PaymentPage } from '@/components/payment'
import { TrialCountdown } from '@/components/TrialCountdown'
import { useKV } from '@/lib/mock-spark'
import { useTheme } from '@/lib/theme'
import { useSidebar } from '@/lib/use-sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { getOrCreateTrial, getTrialStatus, hasGatedAccess, endTrial, resetTrial } from '@/lib/user-trial'
import { trackPaymentPageView, trackTrialEvent, trackFeatureUsage } from '@/lib/analytics'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { aiService } from '@/lib/ai-service'
import { toast } from 'sonner'

// Healthcare feature imports (optional)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DocumentProvider } from './contexts/DocumentContext';
import WorkspacePage from './pages/WorkspacePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import HealthcareDemoPage from './pages/HealthcareDemoPage';

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  status: 'processing' | 'completed' | 'error'
  thumbnail?: string
  content?: string
  analysis?: any
}

function App() {
  const { isAuthenticated, user } = useAuth()
  const [documents, setDocuments] = useKV<Document[]>('documents', [])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showLanding, setShowLanding] = useState(false) // Temporarily skip landing
  const [showPayment, setShowPayment] = useState(false)
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [showTrialMessage, setShowTrialMessage] = useState(false)
  const [showHealthcareMode, setShowHealthcareMode] = useState(false) // Healthcare feature toggle
  const { theme } = useTheme()
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar()

  // Trial management
  const [trialData, setTrialData] = useKV('userTrial', null)
  const [trialStatus, setTrialStatus] = useState<'active' | 'expired' | 'ended'>('active')
  const [documentsProcessed, setDocumentsProcessed] = useState(0)

  useEffect(() => {
    const initializeTrial = async () => {
      try {
        const trial = await getOrCreateTrial()
        setTrialData(trial)
        
        const status = getTrialStatus(trial)
        setTrialStatus(status.status)
        setDocumentsProcessed(trial.documentsProcessed)
        
        if (status.status === 'expired') {
          setShowTrialMessage(true)
          trackTrialEvent('trial_expired', { userId: user?.id })
        }
      } catch (error) {
        console.error('Failed to initialize trial:', error)
      }
    }

    if (isAuthenticated) {
      initializeTrial()
    }
  }, [isAuthenticated, user])

  const handleDocumentUpload = async (files: FileList) => {
    if (!hasGatedAccess(trialData, 'document_upload')) {
      setShowTrialMessage(true)
      trackTrialEvent('trial_limit_reached', { 
        feature: 'document_upload',
        userId: user?.id 
      })
      return
    }

    trackFeatureUsage('document_upload', { userId: user?.id })
    
    // Process file upload logic here
    // Update trial data after successful upload
  }

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
  }

  if (showPayment) {
    trackPaymentPageView({ userId: user?.id })
    return (
      <PaymentPage 
        session={paymentSession}
        onBack={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false)
          // Reset trial or upgrade user
        }}
      />
    )
  }

  // Healthcare mode wrapper
  if (showHealthcareMode) {
    return (
      <DocumentProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Header />
            <div className="flex">
              <AppSidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<WorkspaceArea />} />
                  <Route path="/workspace" element={<WorkspacePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </main>
            </div>
            <Toaster />
          </div>
        </Router>
      </DocumentProvider>
    )
  }

  // Main application (existing functionality)
  return (
    <div className={cn('min-h-screen bg-background', theme)}>
      {/* Trial countdown */}
      <TrialCountdown 
        trialData={trialData}
        onUpgrade={() => setShowPayment(true)}
        show={showTrialMessage}
        onDismiss={() => setShowTrialMessage(false)}
      />

      <div className="flex h-screen">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              {/* Healthcare Mode Toggle */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Mode Selection</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose between general document processing and healthcare-specific workflows
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowHealthcareMode(false)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        !showHealthcareMode 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      General Mode
                    </button>
                    <button
                      onClick={() => setShowHealthcareMode(true)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        showHealthcareMode 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      🏥 Healthcare Mode
                    </button>
                    {showHealthcareMode && (
                      <button
                        onClick={() => window.open('/healthcare-demo', '_blank')}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        🚀 Healthcare Demo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <WorkspaceArea 
                documents={documents}
                onDocumentUpload={handleDocumentUpload}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </main>
          
          <Footer />
        </div>
      </div>

      <AuthModal />
      <UserProfile />
      <Toaster />
    </div>
  )
}

export default App
