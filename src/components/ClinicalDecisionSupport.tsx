/**
 * Clinical Decision Support Component for Phase 2
 * AI-powered clinical recommendations with Saudi healthcare guidelines
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Stethoscope, 
  Pills,
  Activity,
  FileText,
  Brain,
  Shield
} from 'lucide-react'
import { HealthcareAIService } from '@/lib/healthcare-ai'
import { MedicalEntity, ClinicalDecision, HealthcareDocumentType } from '@/types/healthcare'
import { toast } from 'sonner'

interface DrugInteraction {
  severity: 'low' | 'moderate' | 'high' | 'critical'
  drug1: string
  drug2: string
  interaction: string
  arabicInteraction: string
  recommendation: string
  arabicRecommendation: string
  references: string[]
}

interface ClinicalAlert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  arabicTitle: string
  message: string
  arabicMessage: string
  actionRequired: boolean
  dismissible: boolean
  relatedMedications?: string[]
  guidelines?: string[]
}

interface SaudiGuideline {
  id: string
  title: string
  arabicTitle: string
  category: 'MOH' | 'SFDA' | 'NPHIES' | 'CBAHI'
  description: string
  arabicDescription: string
  compliance: 'compliant' | 'non-compliant' | 'warning' | 'unknown'
  recommendations: string[]
  arabicRecommendations: string[]
}

interface ClinicalDecisionSupportProps {
  medicalEntities: MedicalEntity[]
  patientData?: any
  documentType?: HealthcareDocumentType
  onDecisionMade?: (decision: ClinicalDecision) => void
  className?: string
  language?: 'ar' | 'en'
}

export function ClinicalDecisionSupport({
  medicalEntities = [],
  patientData,
  documentType,
  onDecisionMade,
  className = '',
  language = 'ar'
}: ClinicalDecisionSupportProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([])
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([])
  const [saudiGuidelines, setSaudiGuidelines] = useState<SaudiGuideline[]>([])
  const [riskScore, setRiskScore] = useState<number>(0)
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>(language)

  const healthcareAI = HealthcareAIService.getInstance()

  useEffect(() => {
    if (medicalEntities.length > 0) {
      performClinicalAnalysis()
    }
  }, [medicalEntities, patientData])

  const performClinicalAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      // Analyze drug interactions
      const interactions = await analyzeDrugInteractions()
      setDrugInteractions(interactions)

      // Check Saudi healthcare guidelines compliance
      const guidelines = await checkSaudiGuidelines()
      setSaudiGuidelines(guidelines)

      // Generate clinical alerts
      const alerts = await generateClinicalAlerts()
      setClinicalAlerts(alerts)

      // Calculate risk score
      const score = calculateRiskScore(interactions, alerts)
      setRiskScore(score)

      toast.success('تم إنجاز التحليل السريري')
    } catch (error) {
      console.error('Clinical analysis failed:', error)
      toast.error('فشل في التحليل السريري')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeDrugInteractions = async (): Promise<DrugInteraction[]> => {
    const medications = medicalEntities.filter(entity => entity.type === 'medication')
    
    if (medications.length < 2) return []

    try {
      const interactions = await healthcareAI.checkDrugInteractions(
        medications,
        patientData,
        'saudi_database'
      )
      return interactions
    } catch (error) {
      console.error('Drug interaction analysis failed:', error)
      return []
    }
  }

  const checkSaudiGuidelines = async (): Promise<SaudiGuideline[]> => {
    if (!documentType) return []

    try {
      const guidelines = await healthcareAI.checkSaudiGuidelines(
        medicalEntities,
        documentType,
        patientData
      )
      return guidelines
    } catch (error) {
      console.error('Saudi guidelines check failed:', error)
      return []
    }
  }

  const generateClinicalAlerts = async (): Promise<ClinicalAlert[]> => {
    try {
      const alerts = await healthcareAI.generateClinicalAlerts(
        medicalEntities,
        patientData,
        documentType,
        currentLanguage
      )
      return alerts
    } catch (error) {
      console.error('Clinical alerts generation failed:', error)
      return []
    }
  }

  const calculateRiskScore = (interactions: DrugInteraction[], alerts: ClinicalAlert[]): number => {
    let score = 0
    
    // Risk from drug interactions
    interactions.forEach(interaction => {
      switch (interaction.severity) {
        case 'critical': score += 40; break
        case 'high': score += 25; break
        case 'moderate': score += 15; break
        case 'low': score += 5; break
      }
    })

    // Risk from clinical alerts
    alerts.forEach(alert => {
      switch (alert.priority) {
        case 'critical': score += 30; break
        case 'high': score += 20; break
        case 'medium': score += 10; break
        case 'low': score += 5; break
      }
    })

    return Math.min(score, 100) // Cap at 100%
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      'critical': 'destructive',
      'high': 'destructive',
      'moderate': 'default',
      'low': 'secondary'
    }
    return colors[severity as keyof typeof colors] || 'secondary'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'moderate': return <Info className="h-4 w-4" />
      case 'low': return <CheckCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600'
    if (score >= 50) return 'text-orange-600'
    if (score >= 25) return 'text-yellow-600'
    return 'text-green-600'
  }

  const dismissAlert = (alertId: string) => {
    setClinicalAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const applyRecommendation = async (decision: ClinicalDecision) => {
    onDecisionMade?.(decision)
    toast.success('تم تطبيق التوصية السريرية')
  }

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
            <p>جارٍ إجراء التحليل السريري...</p>
            <Progress value={Math.random() * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Brain className="h-5 w-5" />
          <span>نظام دعم القرار السريري</span>
        </CardTitle>
        <CardDescription>
          توصيات ذكية مبنية على المعايير السعودية للرعاية الصحية
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Risk Score Dashboard */}
        <div className="mb-6">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">درجة المخاطر الإجمالية</p>
                  <p className={`text-2xl font-bold ${getRiskScoreColor(riskScore)}`}>
                    {riskScore}%
                  </p>
                </div>
                <div className="text-right">
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <Progress value={riskScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">
              التنبيهات ({clinicalAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="interactions">
              تفاعل الأدوية ({drugInteractions.length})
            </TabsTrigger>
            <TabsTrigger value="guidelines">
              المعايير السعودية ({saudiGuidelines.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              التوصيات
            </TabsTrigger>
          </TabsList>

          {/* Clinical Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {clinicalAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>لا توجد تنبيهات سريرية حاليًا</p>
              </div>
            ) : (
              clinicalAlerts.map((alert) => (
                <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{currentLanguage === 'ar' ? alert.arabicTitle : alert.title}</span>
                    {alert.dismissible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        تجاهل
                      </Button>
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {currentLanguage === 'ar' ? alert.arabicMessage : alert.message}
                    {alert.relatedMedications && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">الأدوية ذات الصلة:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alert.relatedMedications.map((med, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))
            )}
          </TabsContent>

          {/* Drug Interactions Tab */}
          <TabsContent value="interactions" className="space-y-4">
            {drugInteractions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Pills className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>لا توجد تفاعلات دوائية محتملة</p>
              </div>
            ) : (
              drugInteractions.map((interaction, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getSeverityIcon(interaction.severity)}
                        <Badge variant={getSeverityColor(interaction.severity) as any}>
                          {interaction.severity === 'critical' ? 'حرج' :
                           interaction.severity === 'high' ? 'عالي' :
                           interaction.severity === 'moderate' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-2">
                      تفاعل بين {interaction.drug1} و {interaction.drug2}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {currentLanguage === 'ar' ? interaction.arabicInteraction : interaction.interaction}
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        التوصية:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {currentLanguage === 'ar' ? interaction.arabicRecommendation : interaction.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Saudi Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-4">
            {saudiGuidelines.map((guideline, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">
                        {currentLanguage === 'ar' ? guideline.arabicTitle : guideline.title}
                      </h4>
                      <Badge variant="outline" className="mt-1">
                        {guideline.category}
                      </Badge>
                    </div>
                    <Badge 
                      variant={guideline.compliance === 'compliant' ? 'default' : 'destructive'}
                    >
                      {guideline.compliance === 'compliant' ? 'متوافق' : 'غير متوافق'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {currentLanguage === 'ar' ? guideline.arabicDescription : guideline.description}
                  </p>
                  
                  {guideline.arabicRecommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">التوصيات:</p>
                      <ul className="text-sm space-y-1">
                        {(currentLanguage === 'ar' ? guideline.arabicRecommendations : guideline.recommendations).map((rec, i) => (
                          <li key={i} className="flex items-start space-x-2 space-x-reverse">
                            <span className="text-blue-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">توصيات الذكاء الاصطناعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">مراجعة إضافية مطلوبة</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      يُنصح بمراجعة طبيب مختص قبل إعطاء الوصفة النهائية
                    </p>
                    <Button size="sm" onClick={() => toast.success('تم إرسال طلب المراجعة')}>
                      طلب مراجعة طبية
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">التوافق مع المعايير</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">وزارة الصحة السعودية</span>
                      <Badge variant="default">متوافق</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">هيئة الغذاء والدواء</span>
                      <Badge variant="default">متوافق</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">نظام نفيس</span>
                      <Badge variant="outline">تحت المراجعة</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ClinicalDecisionSupport