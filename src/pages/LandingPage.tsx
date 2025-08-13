import { ChevronRight, FileText, Zap, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDemoTimerContext } from '@/contexts/DemoTimerContext'
import { useNavigate } from 'react-router-dom'
import { DemoStatusPill } from '@/components/demo/DemoStatusPill'

export function LandingPage() {
  const navigate = useNavigate()
  const demoTimer = useDemoTimerContext()

  const handleStartDemo = () => {
    demoTimer.start()
    navigate('/workspace')
  }

  const features = [
    {
      icon: FileText,
      title: 'Smart Document Processing',
      description: 'AI-powered analysis and insights for your documents with advanced OCR and understanding.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process documents in seconds with our optimized AI pipeline and cloud infrastructure.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with end-to-end encryption and compliance with industry standards.'
    },
    {
      icon: Clock,
      title: 'Real-time Analysis',
      description: 'Get instant insights and analysis as you upload documents with live processing updates.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Demo Status */}
      {(demoTimer.isActive || demoTimer.hasExpired) && (
        <div className="fixed top-4 right-4 z-50">
          <DemoStatusPill {...demoTimer} />
        </div>
      )}

      {/* Header */}
      <header className="relative border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocSmart AI
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <Button variant="outline" onClick={() => navigate('/workspace')}>
                Sign In
              </Button>
              <Button onClick={handleStartDemo} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Try Free Demo
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative py-20 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1>
                  <span className="block text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Smart Document Processing
                  </span>
                  <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                    <span className="block text-gray-900">Transform your</span>
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      documents with AI
                    </span>
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Experience the future of document processing with our AI-powered platform. 
                  Extract insights, automate workflows, and boost productivity like never before.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      onClick={handleStartDemo}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Start Free Demo
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => navigate('/workspace')}
                      className="flex-1"
                    >
                      View Workspace
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    No credit card required • 5-minute demo • Full feature access
                  </p>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-8">
                      <div className="text-center">
                        <FileText className="mx-auto h-12 w-12 text-white mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">AI Document Analysis</h3>
                        <p className="text-blue-100">Intelligent processing in action</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Powerful AI-driven capabilities
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Everything you need to transform your document workflow with cutting-edge AI technology.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => (
                  <Card key={index} className="relative group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to transform your documents?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-100">
              Join thousands of teams already using DocSmart AI to streamline their document workflows.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleStartDemo}
                className="bg-white text-blue-600 hover:bg-gray-50"
              >
                Start Your Free Demo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/payment')}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
