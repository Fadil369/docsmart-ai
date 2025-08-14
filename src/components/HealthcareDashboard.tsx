/**
 * Healthcare Dashboard for Phase 2
 * Integrated dashboard showcasing all healthcare features
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Mic, 
  Brain, 
  Stethoscope, 
  Users, 
  Activity,
  Clock,
  Shield,
  Globe,
  Heart
} from 'lucide-react'

// Import our new Phase 2 components
import ArabicVoiceCommand from './ArabicVoiceCommand'
import SmartFormBuilder from './SmartFormBuilder'
import ClinicalDecisionSupport from './ClinicalDecisionSupport'
import { RTLProvider, LanguageToggle, RTLLayout, useRTL } from './RTLLayoutSystem'

// Import services
import { HealthcareDocumentProcessor } from '@/lib/HealthcareDocumentProcessor'
import { NPHIESIntegration } from '@/lib/NPHIESIntegration'
import { WasfatyConnector } from '@/lib/WasfatyConnector'
import { HealthcareAIService } from '@/lib/healthcare-ai'
import { MedicalEntity, HealthcareDocument, VoiceCommand } from '@/types/healthcare'
import { toast } from 'sonner'

interface DashboardStats {
  documentsProcessed: number
  prescriptionsCreated: number
  voiceCommandsProcessed: number
  clinicalAlertsActive: number
  averageProcessingTime: number
  complianceScore: number
}

interface HealthcareDashboardProps {
  className?: string
}

function HealthcareDashboardContent({ className = '' }: HealthcareDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    documentsProcessed: 0,
    prescriptionsCreated: 0,
    voiceCommandsProcessed: 0,
    clinicalAlertsActive: 0,
    averageProcessingTime: 0,
    complianceScore: 95
  })
  
  const [recentDocuments, setRecentDocuments] = useState<HealthcareDocument[]>([])
  const [medicalEntities, setMedicalEntities] = useState<MedicalEntity[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  const { language } = useRTL()
  
  const healthcareProcessor = HealthcareDocumentProcessor.getInstance()
  const nphiesIntegration = NPHIESIntegration.getInstance()
  const wasfatyConnector = WasfatyConnector.getInstance()
  const healthcareAI = HealthcareAIService.getInstance()

  // Initialize services
  useEffect(() => {
    initializeServices()
    loadDashboardData()
  }, [])

  const initializeServices = async () => {
    try {
      await Promise.all([
        nphiesIntegration.initialize(),
        wasfatyConnector.initialize()
      ])
      toast.success(language === 'ar' ? 'تم تهيئة الخدمات بنجاح' : 'Services initialized successfully')
    } catch (error) {
      console.error('Service initialization failed:', error)
      toast.error(language === 'ar' ? 'فشل في تهيئة الخدمات' : 'Failed to initialize services')
    }
  }

  const loadDashboardData = async () => {
    // Mock dashboard data - in production, this would fetch from API
    setStats({
      documentsProcessed: 1247,
      prescriptionsCreated: 89,
      voiceCommandsProcessed: 156,
      clinicalAlertsActive: 3,
      averageProcessingTime: 2.3,
      complianceScore: 98
    })

    // Mock patient data
    setSelectedPatient({
      id: 'PAT-12345',
      name: 'Ahmed Al-Rashid',
      nameArabic: 'أحمد الراشد',
      nationalId: '1234567890',
      age: 45,
      gender: 'male'
    })

    // Mock medical entities
    setMedicalEntities([
      {
        type: 'medication',
        value: 'Paracetamol 500mg',
        confidence: 0.95,
        position: { start: 0, end: 15 },
        arabicTranslation: 'باراسيتامول 500 مج',
        code: {
          system: 'SFDA-MEDICATIONS',
          code: 'SFDA-PAR-500',
          display: 'Paracetamol 500mg'
        }
      },
      {
        type: 'diagnosis',
        value: 'Hypertension',
        confidence: 0.92,
        position: { start: 20, end: 32 },
        arabicTranslation: 'ارتفاع ضغط الدم',
        code: {
          system: 'ICD-10',
          code: 'I10',
          display: 'Essential hypertension'
        }
      }
    ])
  }

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true)
    try {
      for (const file of Array.from(files)) {
        const document = await healthcareProcessor.processHealthcareDocument(file)
        setRecentDocuments(prev => [document, ...prev.slice(0, 4)])
        
        // Update stats
        setStats(prev => ({
          ...prev,
          documentsProcessed: prev.documentsProcessed + 1
        }))
      }
      
      toast.success(language === 'ar' ? 'تمت معالجة الوثائق بنجاح' : 'Documents processed successfully')
    } catch (error) {
      console.error('Document processing failed:', error)
      toast.error(language === 'ar' ? 'فشل في معالجة الوثائق' : 'Document processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceCommand = async (command: VoiceCommand) => {
    console.log('Voice command received:', command)
    
    // Update stats
    setStats(prev => ({
      ...prev,
      voiceCommandsProcessed: prev.voiceCommandsProcessed + 1
    }))

    // Process command based on intent
    switch (command.intent) {
      case 'create_prescription':
        // Navigate to prescription form or open modal
        toast.success(language === 'ar' ? 'فتح نموذج الوصفة الطبية' : 'Opening prescription form')
        break
      case 'search_patient':
        // Trigger patient search
        toast.success(language === 'ar' ? 'البحث عن المريض' : 'Searching for patient')
        break
      case 'analyze_document':
        // Trigger document analysis
        toast.success(language === 'ar' ? 'تحليل الوثيقة' : 'Analyzing document')
        break
      default:
        toast.info(language === 'ar' ? `تم تنفيذ الأمر: ${command.arabicCommand}` : `Command executed: ${command.command}`)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    console.log('Form submitted:', formData)
    
    if (formData.templateId === 'prescription-form') {
      try {
        // Create Wasfaty prescription
        const prescription = await wasfatyConnector.createPrescription(
          selectedPatient,
          { id: 'DOC-123', name: 'Dr. Sarah Al-Zahra' },
          { id: 'FAC-456', name: 'King Fahad Hospital' },
          medicalEntities.filter(e => e.type === 'medication')
        )
        
        setStats(prev => ({
          ...prev,
          prescriptionsCreated: prev.prescriptionsCreated + 1
        }))
        
        toast.success(language === 'ar' ? 'تم إنشاء الوصفة الطبية' : 'Prescription created successfully')
      } catch (error) {
        console.error('Prescription creation failed:', error)
        toast.error(language === 'ar' ? 'فشل في إنشاء الوصفة' : 'Failed to create prescription')
      }
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = 'blue' 
  }: { 
    title: string
    value: string | number
    icon: any
    trend?: string
    color?: string 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">{trend}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {language === 'ar' ? 'لوحة تحكم الرعاية الصحية' : 'Healthcare Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'نظام ذكي لمعالجة الوثائق الطبية والقرارات السريرية' 
              : 'AI-powered medical document processing and clinical decision support'
            }
          </p>
        </div>
        <LanguageToggle />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title={language === 'ar' ? 'الوثائق المعالجة' : 'Documents Processed'}
          value={stats.documentsProcessed}
          icon={FileText}
          trend={language === 'ar' ? '+12% هذا الأسبوع' : '+12% this week'}
        />
        <StatCard
          title={language === 'ar' ? 'الوصفات الطبية' : 'Prescriptions Created'}
          value={stats.prescriptionsCreated}
          icon={Heart}
          trend={language === 'ar' ? '+8% هذا الأسبوع' : '+8% this week'}
          color="green"
        />
        <StatCard
          title={language === 'ar' ? 'الأوامر الصوتية' : 'Voice Commands'}
          value={stats.voiceCommandsProcessed}
          icon={Mic}
          trend={language === 'ar' ? '+23% هذا الأسبوع' : '+23% this week'}
          color="purple"
        />
        <StatCard
          title={language === 'ar' ? 'التنبيهات النشطة' : 'Active Alerts'}
          value={stats.clinicalAlertsActive}
          icon={Activity}
          trend={language === 'ar' ? 'تحت المراقبة' : 'Under monitoring'}
          color="orange"
        />
        <StatCard
          title={language === 'ar' ? 'وقت المعالجة' : 'Avg Processing'}
          value={`${stats.averageProcessingTime}s`}
          icon={Clock}
          trend={language === 'ar' ? '-15% تحسن' : '-15% improvement'}
          color="blue"
        />
        <StatCard
          title={language === 'ar' ? 'درجة الامتثال' : 'Compliance Score'}
          value={`${stats.complianceScore}%`}
          icon={Shield}
          trend={language === 'ar' ? 'ممتاز' : 'Excellent'}
          color="green"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">
            {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </TabsTrigger>
          <TabsTrigger value="voice-commands">
            {language === 'ar' ? 'الأوامر الصوتية' : 'Voice Commands'}
          </TabsTrigger>
          <TabsTrigger value="smart-forms">
            {language === 'ar' ? 'النماذج الذكية' : 'Smart Forms'}
          </TabsTrigger>
          <TabsTrigger value="clinical-support">
            {language === 'ar' ? 'الدعم السريري' : 'Clinical Support'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="h-5 w-5" />
                  <span>{language === 'ar' ? 'رفع الوثائق الطبية' : 'Medical Document Upload'}</span>
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'ارفع الوثائق الطبية للمعالجة الذكية والتحليل'
                    : 'Upload medical documents for intelligent processing and analysis'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileUpload(e.dataTransfer.files)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'اسحب الملفات هنا أو انقر للاختيار'
                      : 'Drag files here or click to select'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOCX, Images, DICOM
                  </p>
                </div>
                {isProcessing && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'جارٍ المعالجة...' : 'Processing...'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'الوثائق الأخيرة' : 'Recent Documents'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDocuments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {language === 'ar' ? 'لا توجد وثائق حديثة' : 'No recent documents'}
                    </p>
                  ) : (
                    recentDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {doc.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voice-commands">
          <ArabicVoiceCommand
            position="inline"
            onCommand={handleVoiceCommand}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="smart-forms">
          <SmartFormBuilder
            patientData={selectedPatient}
            medicalHistory={medicalEntities}
            onFormSubmit={handleFormSubmit}
            language={language}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="clinical-support">
          <ClinicalDecisionSupport
            medicalEntities={medicalEntities}
            patientData={selectedPatient}
            documentType="prescription"
            language={language}
            className="w-full"
          />
        </TabsContent>
      </Tabs>

      {/* Floating Voice Command */}
      <ArabicVoiceCommand
        position="floating"
        onCommand={handleVoiceCommand}
      />
    </div>
  )
}

export function HealthcareDashboard(props: HealthcareDashboardProps) {
  return (
    <RTLProvider defaultLanguage="ar">
      <RTLLayout>
        <HealthcareDashboardContent {...props} />
      </RTLLayout>
    </RTLProvider>
  )
}

export default HealthcareDashboard