import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

// Minimal App to test basic functionality
function MinimalApp() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-gray-600">Loading DocSmart AI...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">DocSmart AI - Minimal Mode</h1>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Application Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>React 19:</span>
              <span className="text-green-600 font-semibold">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <span>TypeScript:</span>
              <span className="text-green-600 font-semibold">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tailwind CSS:</span>
              <span className="text-green-600 font-semibold">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Error Boundary:</span>
              <span className="text-green-600 font-semibold">✓ Working</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Auth Context:</span>
              <span className="text-green-600 font-semibold">✓ Working</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800">Next Steps</h3>
            <p className="text-blue-700 text-sm mt-1">
              Core React application is working. Ready to debug specific components.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MinimalApp />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
