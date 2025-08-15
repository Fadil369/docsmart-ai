/**
 * Smart Form Builder for Phase 2
 * Auto-populating healthcare forms with patient history and AI assistance
 */

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Minus, Sparkles, Save, FileText, User, Stethoscope } from 'lucide-react'
import { HealthcareAIService } from '@/lib/healthcare-ai'
import { MedicalEntity, HealthcareDocumentType } from '@/types/healthcare'
import { toast } from 'sonner'

interface FormField {
  id: string
  name: string
  arabicName: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean' | 'medication' | 'diagnosis'
  required: boolean
  options?: { value: string; label: string; arabicLabel: string }[]
  defaultValue?: any
  aiSuggestion?: string
  arabicAiSuggestion?: string
  validation?: {
    pattern?: string
    min?: number
    max?: number
    maxLength?: number
  }
}

interface SmartFormTemplate {
  id: string
  name: string
  arabicName: string
  description: string
  arabicDescription: string
  documentType: HealthcareDocumentType
  sections: FormSection[]
}

interface FormSection {
  id: string
  title: string
  arabicTitle: string
  fields: FormField[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

interface SmartFormBuilderProps {
  templateId?: string
  patientData?: any
  medicalHistory?: MedicalEntity[]
  onFormSubmit?: (data: any) => void
  onSave?: (formData: any) => void
  className?: string
  language?: 'ar' | 'en'
}

export function SmartFormBuilder({
  templateId,
  patientData,
  medicalHistory = [],
  onFormSubmit,
  onSave,
  className = '',
  language = 'ar'
}: SmartFormBuilderProps) {
  const [formTemplate, setFormTemplate] = useState<SmartFormTemplate | null>(null)
  const [isAutoPopulating, setIsAutoPopulating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({})
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>(language)
  const [isLoading, setIsLoading] = useState(false)

  const healthcareAI = HealthcareAIService.getInstance()
  
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm()
  const watchedValues = watch()

  // Initialize form template
  useEffect(() => {
    if (templateId) {
      loadFormTemplate(templateId)
    } else {
      // Create default prescription form
      setFormTemplate(getDefaultPrescriptionForm())
    }
  }, [templateId])

  // Auto-populate when patient data changes
  useEffect(() => {
    if (formTemplate && patientData) {
      autoPopulateForm()
    }
  }, [formTemplate, patientData, medicalHistory])

  const loadFormTemplate = async (id: string) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from API
      const template = getFormTemplateById(id)
      setFormTemplate(template)
    } catch (error) {
      console.error('Failed to load form template:', error)
      toast.error('فشل في تحميل نموذج النماذج')
    } finally {
      setIsLoading(false)
    }
  }

  const autoPopulateForm = async () => {
    if (!formTemplate || !patientData) return

    setIsAutoPopulating(true)
    try {
      // Extract relevant data for auto-population
      const populationData = await healthcareAI.extractFormData(
        patientData,
        medicalHistory,
        formTemplate.documentType
      )

      // Populate form fields
      Object.entries(populationData).forEach(([fieldName, value]) => {
        setValue(fieldName, value)
      })

      // Generate AI suggestions for complex fields
      const suggestions = await generateAISuggestions()
      setAiSuggestions(suggestions)

      toast.success('تم ملء النموذج تلقائياً من بيانات المريض')
    } catch (error) {
      console.error('Auto-population failed:', error)
      toast.error('فشل في الملء التلقائي للنموذج')
    } finally {
      setIsAutoPopulating(false)
    }
  }

  const generateAISuggestions = async (): Promise<Record<string, string>> => {
    if (!formTemplate || !patientData) return {}

    try {
      const suggestions = await healthcareAI.generateFormSuggestions(
        patientData,
        medicalHistory,
        formTemplate.documentType,
        currentLanguage
      )
      
      return suggestions
    } catch (error) {
      console.error('AI suggestion generation failed:', error)
      return {}
    }
  }

  const handleFormSubmit = (data: any) => {
    // Validate and process form data
    const processedData = {
      ...data,
      submittedAt: new Date().toISOString(),
      language: currentLanguage,
      templateId: formTemplate?.id,
      patientId: patientData?.id
    }

    onFormSubmit?.(processedData)
    toast.success('تم إرسال النموذج بنجاح')
  }

  const applySuggestion = (fieldName: string, suggestion: string) => {
    setValue(fieldName, suggestion)
    toast.success('تم تطبيق الاقتراح')
  }

  const renderField = (field: FormField, sectionId: string) => {
    const fieldId = `${sectionId}.${field.id}`
    const fieldName = currentLanguage === 'ar' ? field.arabicName : field.name
    const suggestion = aiSuggestions[fieldId]

    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={fieldId} className="font-medium">
            {fieldName}
            {field.required && <span className="text-red-500 mr-1">*</span>}
          </Label>
          {suggestion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => applySuggestion(fieldId, suggestion)}
              className="h-6 px-2 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              اقتراح الذكي
            </Button>
          )}
        </div>

        {renderFieldInput(field, fieldId)}

        {suggestion && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
            <p className="text-blue-700 dark:text-blue-300">
              اقتراح الذكي: {suggestion}
            </p>
          </div>
        )}

        {errors[fieldId] && (
          <p className="text-red-500 text-xs">
            {currentLanguage === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required'}
          </p>
        )}
      </div>
    )
  }

  const renderFieldInput = (field: FormField, fieldId: string) => {
    const props = {
      id: fieldId,
      ...register(fieldId, { 
        required: field.required,
        pattern: field.validation?.pattern ? new RegExp(field.validation.pattern) : undefined,
        min: field.validation?.min,
        max: field.validation?.max,
        maxLength: field.validation?.maxLength
      })
    }

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...props}
            placeholder={currentLanguage === 'ar' ? field.arabicName : field.name}
            className="min-h-[80px]"
          />
        )

      case 'select':
        return (
          <Select onValueChange={(value) => setValue(fieldId, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`اختر ${field.arabicName}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {currentLanguage === 'ar' ? option.arabicLabel : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'date':
        return <Input {...props} type="date" />

      case 'number':
        return <Input {...props} type="number" />

      case 'boolean':
        return (
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              onCheckedChange={(checked) => setValue(fieldId, checked)}
            />
            <span className="text-sm">{fieldName}</span>
          </div>
        )

      case 'medication':
        return (
          <div className="space-y-2">
            <Input {...props} placeholder="اسم الدواء" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="الجرعة" />
              <Input placeholder="التكرار" />
            </div>
          </div>
        )

      default:
        return (
          <Input
            {...props}
            type="text"
            placeholder={currentLanguage === 'ar' ? field.arabicName : field.name}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
            <p>جارٍ تحميل النموذج...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!formTemplate) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            لم يتم العثور على نموذج النماذج
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <FileText className="h-5 w-5" />
              <span>
                {currentLanguage === 'ar' ? formTemplate.arabicName : formTemplate.name}
              </span>
            </CardTitle>
            <CardDescription>
              {currentLanguage === 'ar' ? formTemplate.arabicDescription : formTemplate.description}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              checked={currentLanguage === 'ar'}
              onCheckedChange={(checked) => setCurrentLanguage(checked ? 'ar' : 'en')}
            />
            <span className="text-sm">عربي</span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={autoPopulateForm}
              disabled={isAutoPopulating || !patientData}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {isAutoPopulating ? 'جارٍ الملء...' : 'ملء تلقائي'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue={formTemplate.sections[0]?.id}>
            <TabsList className="grid w-full grid-cols-3">
              {formTemplate.sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  {currentLanguage === 'ar' ? section.arabicTitle : section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {formTemplate.sections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => renderField(field, section.id))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Separator />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSave?.(watchedValues)}
            >
              <Save className="h-4 w-4 mr-2" />
              حفظ مسودة
            </Button>

            <Button type="submit">
              <FileText className="h-4 w-4 mr-2" />
              إرسال النموذج
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Helper functions for form templates
function getDefaultPrescriptionForm(): SmartFormTemplate {
  return {
    id: 'prescription-form',
    name: 'Prescription Form',
    arabicName: 'نموذج وصفة طبية',
    description: 'Medical prescription form with auto-population',
    arabicDescription: 'نموذج وصفة طبية مع الملء التلقائي',
    documentType: 'prescription',
    sections: [
      {
        id: 'patient-info',
        title: 'Patient Information',
        arabicTitle: 'معلومات المريض',
        fields: [
          {
            id: 'patient-name',
            name: 'Patient Name',
            arabicName: 'اسم المريض',
            type: 'text',
            required: true
          },
          {
            id: 'patient-id',
            name: 'Patient ID',
            arabicName: 'رقم هوية المريض',
            type: 'text',
            required: true
          },
          {
            id: 'age',
            name: 'Age',
            arabicName: 'العمر',
            type: 'number',
            required: true,
            validation: { min: 0, max: 150 }
          }
        ]
      },
      {
        id: 'medications',
        title: 'Medications',
        arabicTitle: 'الأدوية',
        fields: [
          {
            id: 'medication-1',
            name: 'Primary Medication',
            arabicName: 'الدواء الأساسي',
            type: 'medication',
            required: true
          },
          {
            id: 'duration',
            name: 'Treatment Duration',
            arabicName: 'مدة العلاج',
            type: 'text',
            required: true
          }
        ]
      },
      {
        id: 'instructions',
        title: 'Instructions',
        arabicTitle: 'التعليمات',
        fields: [
          {
            id: 'special-instructions',
            name: 'Special Instructions',
            arabicName: 'تعليمات خاصة',
            type: 'textarea',
            required: false
          }
        ]
      }
    ]
  }
}

function getFormTemplateById(id: string): SmartFormTemplate {
  // Mock implementation - in real app, this would fetch from API
  return getDefaultPrescriptionForm()
}

export default SmartFormBuilder