import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'

// Progressive app to test components one by one
function ProgressiveApp() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const testSteps = [
    { name: 'Base App', component: () => <div>✅ Base app working</div> },
    { name: 'Toaster', component: () => <><div>✅ Toaster added</div><Toaster /></> },
    // Add more steps as we test each component
  ]

  const handleNext = () => {
    try {
      setError(null)
      setStep(prev => Math.min(prev + 1, testSteps.length))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1))
    setError(null)
  }

  const currentStep = testSteps[step - 1]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DocSmart AI - Progressive Component Testing
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Step {step}/{testSteps.length}: {currentStep.name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={step === testSteps.length}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm font-medium">Error in {currentStep.name}:</p>
              <p className="text-red-600 text-xs mt-1">{error}</p>
            </div>
          )}
          
          <div className="border rounded p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">Component Output:</div>
            <div className="bg-white border rounded p-3">
              {currentStep.component()}
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Progress</h3>
          <div className="space-y-1">
            {testSteps.map((stepItem, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`text-sm ${
                  index + 1 < step ? 'text-green-600' : 
                  index + 1 === step ? 'text-blue-600 font-semibold' : 
                  'text-gray-400'
                }`}>
                  {index + 1 < step ? '✅' : index + 1 === step ? '🔄' : '⏳'} {stepItem.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressiveApp
