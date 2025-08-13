// App.tsx - Phase 1 Refactored: Clean provider composition + routing
// Extracted: page logic → individual pages, demo timer → context, documents → context

import { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from 'react-error-boundary'

// Context Providers
import { DocumentProvider } from '@/contexts/DocumentContext'
import { DemoTimerProvider } from '@/contexts/DemoTimerContext'
import { SidebarProvider } from '@/components/ui/sidebar'

// Pages
import { LandingPage } from '@/pages/LandingPage'
import { WorkspacePage } from '@/pages/WorkspacePage'
import { PaymentPage } from '@/pages/PaymentPage'

// Components
import { AppSidebar } from '@/components/AppSidebar'
import { ErrorFallback } from '@/ErrorFallback'

// Loading Skeleton Component
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="animate-pulse space-y-4 p-8">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Workspace Layout with Sidebar
function WorkspaceLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <WorkspacePage />
      </div>
    </SidebarProvider>
  )
}

// Main App Component
export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <DemoTimerProvider
          options={{
            durationMs: 3 * 60 * 1000, // 3 minutes
            onExpire: () => {
              console.log('Demo expired - consider showing upgrade modal')
            }
          }}
        >
          <DocumentProvider>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<PageSkeleton />}>
                <Routes>
                  {/* Landing Page */}
                  <Route path="/" element={<LandingPage />} />
                  
                  {/* Workspace with Sidebar */}
                  <Route path="/workspace" element={<WorkspaceLayout />} />
                  
                  {/* Payment */}
                  <Route path="/payment" element={<PaymentPage />} />
                  
                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>

              {/* Global UI */}
              <Toaster position="top-right" />
            </div>
          </DocumentProvider>
        </DemoTimerProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
