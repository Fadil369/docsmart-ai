/**
 * Healthcare Templates for Saudi Healthcare System
 * Pre-configured templates for medical document processing
 */

import { HealthcareDocumentType, HealthcareWorkflow, StakeholderProfile } from '@/types/healthcare'

export interface HealthcareTemplate {
  id: string
  name: string
  arabicName: string
  description: string
  arabicDescription: string
  documentType: HealthcareDocumentType
  stakeholder: 'provider' | 'patient' | 'insurer' | 'admin' | 'regulator'
  features: TemplateFeatures
  workflow: TemplateWorkflow
  compliance: ComplianceRequirements
  icon: string
  color: string
}

interface TemplateFeatures {
  aiAnalysis: boolean
  translation: boolean
  fhirMapping: boolean
  voiceCommands: boolean
  realTimeCollaboration: boolean
  complianceValidation: boolean
  digitalSignature: boolean
  auditTrail: boolean
}

interface TemplateWorkflow {
  steps: WorkflowStep[]
  estimatedTime: number
  requiredApprovals: string[]
  notifications: string[]
}

interface WorkflowStep {
  id: string
  name: string
  arabicName: string
  type: 'upload' | 'analyze' | 'translate' | 'validate' | 'approve' | 'submit'
  automated: boolean
  duration: number
}

interface ComplianceRequirements {
  mohApproval: boolean
  nphiesSubmission: boolean
  wasfatyIntegration: boolean
  pdplCompliance: boolean
  auditRequired: boolean
}

export const healthcareTemplates: HealthcareTemplate[] = [
  {
    id: 'saudi-prescription',
    name: 'Saudi E-Prescription',
    arabicName: 'الوصفة الطبية الإلكترونية السعودية',
    description: 'Electronic prescription template compliant with Saudi MOH and Wasfaty standards',
    arabicDescription: 'نموذج الوصفة الطبية الإلكترونية المتوافق مع معايير وزارة الصحة السعودية ووصفتي',
    documentType: 'prescription',
    stakeholder: 'provider',
    features: {
      aiAnalysis: true,
      translation: true,
      fhirMapping: true,
      voiceCommands: true,
      realTimeCollaboration: false,
      complianceValidation: true,
      digitalSignature: true,
      auditTrail: true
    },
    workflow: {
      steps: [
        {
          id: 'patient-verification',
          name: 'Patient Verification',
          arabicName: 'التحقق من هوية المريض',
          type: 'validate',
          automated: true,
          duration: 30
        },
        {
          id: 'prescription-creation',
          name: 'Prescription Creation',
          arabicName: 'إنشاء الوصفة الطبية',
          type: 'upload',
          automated: false,
          duration: 300
        },
        {
          id: 'drug-interaction-check',
          name: 'Drug Interaction Analysis',
          arabicName: 'تحليل تفاعل الأدوية',
          type: 'analyze',
          automated: true,
          duration: 60
        },
        {
          id: 'wasfaty-submission',
          name: 'Wasfaty Submission',
          arabicName: 'إرسال إلى وصفتي',
          type: 'submit',
          automated: true,
          duration: 90
        }
      ],
      estimatedTime: 480,
      requiredApprovals: ['prescriber_license_validation'],
      notifications: ['patient_sms', 'pharmacy_alert', 'insurance_notification']
    },
    compliance: {
      mohApproval: true,
      nphiesSubmission: false,
      wasfatyIntegration: true,
      pdplCompliance: true,
      auditRequired: true
    },
    icon: 'prescription',
    color: 'emerald'
  },
  {
    id: 'nphies-claim',
    name: 'NPHIES Insurance Claim',
    arabicName: 'مطالبة التأمين نفيس',
    description: 'Insurance claim processing template for NPHIES integration',
    arabicDescription: 'نموذج معالجة مطالبات التأمين للتكامل مع نفيس',
    documentType: 'insurance_claim',
    stakeholder: 'provider',
    features: {
      aiAnalysis: true,
      translation: true,
      fhirMapping: true,
      voiceCommands: false,
      realTimeCollaboration: true,
      complianceValidation: true,
      digitalSignature: true,
      auditTrail: true
    },
    workflow: {
      steps: [
        {
          id: 'claim-data-entry',
          name: 'Claim Data Entry',
          arabicName: 'إدخال بيانات المطالبة',
          type: 'upload',
          automated: false,
          duration: 600
        },
        {
          id: 'eligibility-check',
          name: 'Insurance Eligibility Check',
          arabicName: 'التحقق من أهلية التأمين',
          type: 'validate',
          automated: true,
          duration: 120
        },
        {
          id: 'clinical-validation',
          name: 'Clinical Validation',
          arabicName: 'التحقق السريري',
          type: 'analyze',
          automated: true,
          duration: 180
        },
        {
          id: 'nphies-submission',
          name: 'NPHIES Submission',
          arabicName: 'إرسال إلى نفيس',
          type: 'submit',
          automated: true,
          duration: 240
        }
      ],
      estimatedTime: 1140,
      requiredApprovals: ['clinical_supervisor', 'financial_controller'],
      notifications: ['insurer_notification', 'provider_confirmation', 'patient_update']
    },
    compliance: {
      mohApproval: true,
      nphiesSubmission: true,
      wasfatyIntegration: false,
      pdplCompliance: true,
      auditRequired: true
    },
    icon: 'insurance',
    color: 'blue'
  },
  {
    id: 'lab-results-analysis',
    name: 'Laboratory Results Analysis',
    arabicName: 'تحليل نتائج المختبر',
    description: 'AI-powered laboratory results processing with Arabic medical terminology',
    arabicDescription: 'معالجة نتائج المختبر بالذكاء الاصطناعي مع المصطلحات الطبية العربية',
    documentType: 'lab_results',
    stakeholder: 'provider',
    features: {
      aiAnalysis: true,
      translation: true,
      fhirMapping: true,
      voiceCommands: true,
      realTimeCollaboration: true,
      complianceValidation: true,
      digitalSignature: false,
      auditTrail: true
    },
    workflow: {
      steps: [
        {
          id: 'results-upload',
          name: 'Upload Lab Results',
          arabicName: 'رفع نتائج المختبر',
          type: 'upload',
          automated: false,
          duration: 120
        },
        {
          id: 'ai-interpretation',
          name: 'AI Results Interpretation',
          arabicName: 'تفسير النتائج بالذكاء الاصطناعي',
          type: 'analyze',
          automated: true,
          duration: 180
        },
        {
          id: 'clinical-correlation',
          name: 'Clinical Correlation',
          arabicName: 'الربط السريري',
          type: 'analyze',
          automated: true,
          duration: 240
        },
        {
          id: 'patient-notification',
          name: 'Patient Notification',
          arabicName: 'إشعار المريض',
          type: 'submit',
          automated: true,
          duration: 60
        }
      ],
      estimatedTime: 600,
      requiredApprovals: ['lab_director'],
      notifications: ['patient_notification', 'physician_alert', 'critical_values_alert']
    },
    compliance: {
      mohApproval: true,
      nphiesSubmission: false,
      wasfatyIntegration: false,
      pdplCompliance: true,
      auditRequired: true
    },
    icon: 'lab',
    color: 'purple'
  },
  {
    id: 'patient-medical-record',
    name: 'Patient Medical Record',
    arabicName: 'السجل الطبي للمريض',
    description: 'Comprehensive patient medical record management with Sehhaty integration',
    arabicDescription: 'إدارة شاملة للسجل الطبي للمريض مع التكامل مع صحتي',
    documentType: 'medical_history',
    stakeholder: 'patient',
    features: {
      aiAnalysis: true,
      translation: true,
      fhirMapping: true,
      voiceCommands: true,
      realTimeCollaboration: false,
      complianceValidation: true,
      digitalSignature: false,
      auditTrail: true
    },
    workflow: {
      steps: [
        {
          id: 'record-consolidation',
          name: 'Medical Record Consolidation',
          arabicName: 'توحيد السجل الطبي',
          type: 'analyze',
          automated: true,
          duration: 300
        },
        {
          id: 'privacy-check',
          name: 'Privacy Compliance Check',
          arabicName: 'فحص الامتثال للخصوصية',
          type: 'validate',
          automated: true,
          duration: 60
        },
        {
          id: 'sehhaty-sync',
          name: 'Sehhaty Synchronization',
          arabicName: 'مزامنة مع صحتي',
          type: 'submit',
          automated: true,
          duration: 180
        }
      ],
      estimatedTime: 540,
      requiredApprovals: ['patient_consent'],
      notifications: ['record_updated', 'provider_access_granted']
    },
    compliance: {
      mohApproval: true,
      nphiesSubmission: false,
      wasfatyIntegration: false,
      pdplCompliance: true,
      auditRequired: true
    },
    icon: 'medical-record',
    color: 'teal'
  },
  {
    id: 'radiology-report',
    name: 'Radiology Report Analysis',
    arabicName: 'تحليل تقرير الأشعة',
    description: 'AI-enhanced radiology report processing with DICOM integration',
    arabicDescription: 'معالجة تقارير الأشعة المحسنة بالذكاء الاصطناعي مع تكامل DICOM',
    documentType: 'radiology',
    stakeholder: 'provider',
    features: {
      aiAnalysis: true,
      translation: true,
      fhirMapping: true,
      voiceCommands: true,
      realTimeCollaboration: true,
      complianceValidation: true,
      digitalSignature: true,
      auditTrail: true
    },
    workflow: {
      steps: [
        {
          id: 'dicom-processing',
          name: 'DICOM Image Processing',
          arabicName: 'معالجة صور DICOM',
          type: 'analyze',
          automated: true,
          duration: 600
        },
        {
          id: 'ai-interpretation',
          name: 'AI Image Interpretation',
          arabicName: 'تفسير الصورة بالذكاء الاصطناعي',
          type: 'analyze',
          automated: true,
          duration: 900
        },
        {
          id: 'radiologist-review',
          name: 'Radiologist Review',
          arabicName: 'مراجعة أخصائي الأشعة',
          type: 'approve',
          automated: false,
          duration: 1800
        },
        {
          id: 'report-finalization',
          name: 'Report Finalization',
          arabicName: 'إنهاء التقرير',
          type: 'submit',
          automated: true,
          duration: 120
        }
      ],
      estimatedTime: 3420,
      requiredApprovals: ['radiologist', 'department_head'],
      notifications: ['referring_physician', 'patient_portal', 'urgent_findings_alert']
    },
    compliance: {
      mohApproval: true,
      nphiesSubmission: false,
      wasfatyIntegration: false,
      pdplCompliance: true,
      auditRequired: true
    },
    icon: 'radiology',
    color: 'orange'
  }
]

export const stakeholderProfiles: StakeholderProfile[] = [
  {
    id: 'healthcare-provider',
    type: 'healthcare_provider',
    name: 'Healthcare Provider',
    arabicName: 'مقدم الرعاية الصحية',
    permissions: [
      { action: 'create', resource: 'prescription' },
      { action: 'read', resource: 'patient_record' },
      { action: 'update', resource: 'medical_history' },
      { action: 'submit', resource: 'insurance_claim' }
    ],
    features: [
      { id: 'voice-commands', name: 'Voice Commands', arabicName: 'الأوامر الصوتية', enabled: true },
      { id: 'ai-assistant', name: 'AI Clinical Assistant', arabicName: 'المساعد السريري الذكي', enabled: true },
      { id: 'fhir-export', name: 'FHIR Export', arabicName: 'تصدير FHIR', enabled: true },
      { id: 'real-time-collaboration', name: 'Real-time Collaboration', arabicName: 'التعاون الفورى', enabled: true }
    ],
    workflows: healthcareTemplates.filter(t => t.stakeholder === 'provider').map(t => ({
      id: t.id,
      name: t.name,
      arabicName: t.arabicName,
      description: t.description,
      arabicDescription: t.arabicDescription,
      stakeholder: t.stakeholder,
      steps: t.workflow.steps,
      requiredDocuments: [t.documentType],
      outputs: ['processed_document', 'compliance_report', 'audit_trail'],
      estimatedTime: t.workflow.estimatedTime,
      compliance: Object.keys(t.compliance).filter(key => t.compliance[key as keyof typeof t.compliance])
    })),
    notifications: {
      email: true,
      sms: true,
      whatsapp: false,
      inApp: true,
      language: 'both'
    }
  },
  {
    id: 'patient',
    type: 'patient',
    name: 'Patient',
    arabicName: 'المريض',
    permissions: [
      { action: 'read', resource: 'own_medical_record' },
      { action: 'update', resource: 'personal_info' },
      { action: 'share', resource: 'medical_documents', conditions: ['with_consent'] }
    ],
    features: [
      { id: 'document-wallet', name: 'Digital Document Wallet', arabicName: 'محفظة الوثائق الرقمية', enabled: true },
      { id: 'translation-service', name: 'Medical Translation', arabicName: 'الترجمة الطبية', enabled: true },
      { id: 'sehhaty-integration', name: 'Sehhaty Integration', arabicName: 'تكامل صحتي', enabled: true },
      { id: 'appointment-scheduling', name: 'Appointment Scheduling', arabicName: 'جدولة المواعيد', enabled: true }
    ],
    workflows: healthcareTemplates.filter(t => t.stakeholder === 'patient').map(t => ({
      id: t.id,
      name: t.name,
      arabicName: t.arabicName,
      description: t.description,
      arabicDescription: t.arabicDescription,
      stakeholder: t.stakeholder,
      steps: t.workflow.steps,
      requiredDocuments: [t.documentType],
      outputs: ['updated_record', 'access_log'],
      estimatedTime: t.workflow.estimatedTime,
      compliance: Object.keys(t.compliance).filter(key => t.compliance[key as keyof typeof t.compliance])
    })),
    notifications: {
      email: true,
      sms: true,
      whatsapp: true,
      inApp: true,
      language: 'ar'
    }
  },
  {
    id: 'insurance-company',
    type: 'insurance_company',
    name: 'Insurance Company',
    arabicName: 'شركة التأمين',
    permissions: [
      { action: 'read', resource: 'insurance_claim' },
      { action: 'approve', resource: 'claim_payment' },
      { action: 'validate', resource: 'medical_necessity' }
    ],
    features: [
      { id: 'claims-processing', name: 'Automated Claims Processing', arabicName: 'معالجة المطالبات الآلية', enabled: true },
      { id: 'fraud-detection', name: 'Fraud Detection', arabicName: 'اكتشاف الاحتيال', enabled: true },
      { id: 'nphies-integration', name: 'NPHIES Integration', arabicName: 'تكامل نفيس', enabled: true },
      { id: 'analytics-dashboard', name: 'Analytics Dashboard', arabicName: 'لوحة التحليلات', enabled: true }
    ],
    workflows: healthcareTemplates.filter(t => t.documentType === 'insurance_claim').map(t => ({
      id: t.id,
      name: t.name,
      arabicName: t.arabicName,
      description: t.description,
      arabicDescription: t.arabicDescription,
      stakeholder: t.stakeholder,
      steps: t.workflow.steps,
      requiredDocuments: [t.documentType],
      outputs: ['claim_decision', 'payment_authorization', 'audit_report'],
      estimatedTime: t.workflow.estimatedTime,
      compliance: Object.keys(t.compliance).filter(key => t.compliance[key as keyof typeof t.compliance])
    })),
    notifications: {
      email: true,
      sms: false,
      whatsapp: false,
      inApp: true,
      language: 'both'
    }
  }
]

export function getTemplatesByStakeholder(stakeholder: string): HealthcareTemplate[] {
  return healthcareTemplates.filter(template => template.stakeholder === stakeholder)
}

export function getTemplateById(id: string): HealthcareTemplate | undefined {
  return healthcareTemplates.find(template => template.id === id)
}

export function getWorkflowForDocument(documentType: HealthcareDocumentType): HealthcareTemplate | undefined {
  return healthcareTemplates.find(template => template.documentType === documentType)
}