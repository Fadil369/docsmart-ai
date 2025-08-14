/**
 * Healthcare-specific types for BrainSAIT DocSmart AI
 * Supporting Saudi healthcare standards and medical document processing
 */

export interface HealthcareDocument {
  id: string
  name: string
  type: HealthcareDocumentType
  format: DocumentFormat
  size: number
  status: ProcessingStatus
  uploadedAt: Date
  patientId?: string
  providerId?: string
  facilityId?: string
  metadata: HealthcareMetadata
  fhirResource?: FHIRResource
  saudiCompliance: SaudiComplianceData
}

export type HealthcareDocumentType = 
  | 'prescription'
  | 'lab_results'
  | 'radiology'
  | 'referral'
  | 'insurance_claim'
  | 'approval'
  | 'medical_history'
  | 'consent_form'
  | 'vaccination_record'
  | 'discharge_summary'
  | 'clinical_note'
  | 'dicom_image'
  | 'hl7_message'

export type DocumentFormat = 
  | 'pdf'
  | 'dicom'
  | 'hl7'
  | 'docx'
  | 'jpg'
  | 'png'
  | 'xml'
  | 'json'

export type ProcessingStatus = 
  | 'uploading'
  | 'processing'
  | 'analyzing'
  | 'translating'
  | 'mapping_fhir'
  | 'validating_compliance'
  | 'completed'
  | 'error'

export interface HealthcareMetadata {
  language: 'ar' | 'en' | 'mixed'
  patientInfo?: PatientInfo
  providerInfo?: ProviderInfo
  facilityInfo?: FacilityInfo
  medicalEntities: MedicalEntity[]
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  confidentialityLevel: 'public' | 'restricted' | 'confidential' | 'secret'
}

export interface PatientInfo {
  id: string
  name: string
  nationalId?: string
  iqamaNumber?: string
  dateOfBirth: string
  gender: 'male' | 'female'
  contactInfo?: ContactInfo
}

export interface ProviderInfo {
  id: string
  name: string
  license: string
  specialization: string
  facility: string
  contactInfo?: ContactInfo
}

export interface FacilityInfo {
  id: string
  name: string
  type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'radiology' | 'other'
  license: string
  region: string
  contactInfo?: ContactInfo
}

export interface ContactInfo {
  phone?: string
  email?: string
  address?: string
  city?: string
  region?: string
  postalCode?: string
}

export interface MedicalEntity {
  type: MedicalEntityType
  value: string
  confidence: number
  position: { start: number; end: number }
  arabicTranslation?: string
  englishTranslation?: string
  code?: MedicalCode
}

export type MedicalEntityType =
  | 'medication'
  | 'dosage'
  | 'frequency'
  | 'condition'
  | 'symptom'
  | 'procedure'
  | 'diagnosis'
  | 'body_part'
  | 'vital_sign'
  | 'allergy'
  | 'test_result'
  | 'measurement'

export interface MedicalCode {
  system: 'ICD-10' | 'SNOMED-CT' | 'LOINC' | 'RxNorm' | 'Saudi-Codes'
  code: string
  display: string
}

export interface FHIRResource {
  resourceType: string
  id: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    profile?: string[]
  }
  identifier?: Identifier[]
  status?: string
  category?: CodeableConcept[]
  code?: CodeableConcept
  subject?: Reference
  encounter?: Reference
  performer?: Reference[]
  valueQuantity?: Quantity
  valueString?: string
  valueDateTime?: string
  component?: Component[]
}

export interface Identifier {
  use?: string
  type?: CodeableConcept
  system?: string
  value?: string
}

export interface CodeableConcept {
  coding?: Coding[]
  text?: string
}

export interface Coding {
  system?: string
  code?: string
  display?: string
}

export interface Reference {
  reference?: string
  type?: string
  identifier?: Identifier
  display?: string
}

export interface Quantity {
  value?: number
  unit?: string
  system?: string
  code?: string
}

export interface Component {
  code: CodeableConcept
  valueQuantity?: Quantity
  valueString?: string
  valueDateTime?: string
}

export interface SaudiComplianceData {
  mohApproval: boolean
  nphiesCompatible: boolean
  wasfatyIntegrated: boolean
  sehhatyCompatible: boolean
  pdplCompliant: boolean
  validationResults: ValidationResult[]
}

export interface ValidationResult {
  field: string
  status: 'valid' | 'invalid' | 'warning'
  message: string
  arabicMessage: string
}

export interface ClinicalDecision {
  id: string
  type: 'recommendation' | 'alert' | 'warning' | 'contraindication'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  arabicMessage: string
  evidence: string[]
  actionRequired: boolean
  guidelines: GuidelineReference[]
}

export interface GuidelineReference {
  source: 'Saudi-MOH' | 'WHO' | 'International' | 'Local'
  title: string
  url?: string
  version?: string
}

export interface VoiceCommand {
  command: string
  arabicCommand: string
  intent: VoiceIntent
  entities: VoiceEntity[]
  confidence: number
}

export type VoiceIntent =
  | 'upload_document'
  | 'view_patient_record'
  | 'create_prescription'
  | 'schedule_appointment'
  | 'translate_document'
  | 'generate_report'
  | 'share_document'
  | 'search_patient'
  | 'add_notes'
  | 'export_data'

export interface VoiceEntity {
  type: string
  value: string
  confidence: number
}

export interface HealthcareWorkflow {
  id: string
  name: string
  arabicName: string
  description: string
  arabicDescription: string
  stakeholder: 'provider' | 'patient' | 'insurer' | 'admin' | 'regulator'
  steps: WorkflowStep[]
  requiredDocuments: HealthcareDocumentType[]
  outputs: string[]
  estimatedTime: number
  compliance: string[]
}

export interface WorkflowStep {
  id: string
  name: string
  arabicName: string
  description: string
  arabicDescription: string
  type: 'upload' | 'analyze' | 'translate' | 'validate' | 'approve' | 'notify'
  required: boolean
  automated: boolean
  estimatedTime: number
}

export interface StakeholderProfile {
  id: string
  type: 'healthcare_provider' | 'patient' | 'insurance_company' | 'hospital_admin' | 'regulator'
  name: string
  arabicName: string
  permissions: Permission[]
  features: Feature[]
  workflows: HealthcareWorkflow[]
  notifications: NotificationSettings
}

export interface Permission {
  action: string
  resource: string
  conditions?: string[]
}

export interface Feature {
  id: string
  name: string
  arabicName: string
  enabled: boolean
  configuration?: Record<string, any>
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  whatsapp: boolean
  inApp: boolean
  language: 'ar' | 'en' | 'both'
}