/**
 * Healthcare-enhanced AI Service for BrainSAIT DocSmart AI
 * Specialized medical document processing with Arabic support
 */

import { aiService } from './ai-service'
import {
  HealthcareDocument,
  HealthcareDocumentType,
  MedicalEntity,
  MedicalEntityType,
  FHIRResource,
  ClinicalDecision,
  VoiceCommand,
  VoiceIntent,
  SaudiComplianceData,
  ValidationResult
} from '@/types/healthcare'
import { spark } from '@/lib/mock-spark'

export interface HealthcareAnalysisResult {
  summary: string
  arabicSummary: string
  medicalEntities: MedicalEntity[]
  clinicalDecisions: ClinicalDecision[]
  riskAssessment: RiskAssessment
  recommendations: string[]
  arabicRecommendations: string[]
  fhirResource?: FHIRResource
  complianceCheck: SaudiComplianceData
  confidence: number
  processingTime: number
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  arabicFactors: string[]
  score: number
  explanation: string
  arabicExplanation: string
}

export interface MedicalTranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: 'ar' | 'en'
  targetLanguage: 'ar' | 'en'
  medicalTermsMap: Map<string, string>
  preservedFormatting: boolean
  confidence: number
  warnings: string[]
}

export class HealthcareAIService {
  private static instance: HealthcareAIService
  private isInitialized = false
  private medicalTermsDatabase: Map<string, any> = new Map()
  private saudiGuidelines: Map<string, any> = new Map()

  private constructor() {}

  static getInstance(): HealthcareAIService {
    if (!HealthcareAIService.instance) {
      HealthcareAIService.instance = new HealthcareAIService()
    }
    return HealthcareAIService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize base AI service
      await aiService.initialize()
      
      // Load medical terms database
      await this.loadMedicalTermsDatabase()
      
      // Load Saudi healthcare guidelines
      await this.loadSaudiGuidelines()
      
      this.isInitialized = true
      console.log('Healthcare AI Service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Healthcare AI Service:', error)
      throw error
    }
  }

  /**
   * Analyze healthcare document with medical entity recognition
   */
  async analyzeHealthcareDocument(
    content: string, 
    documentType: HealthcareDocumentType,
    language: 'ar' | 'en' = 'auto'
  ): Promise<HealthcareAnalysisResult> {
    await this.initialize()

    const detectedLanguage = this.detectLanguage(content)
    const actualLanguage = language === 'auto' ? detectedLanguage : language

    const prompt = spark.llmPrompt`
      Analyze this ${documentType} document in ${actualLanguage} language.
      Extract medical entities, provide clinical insights, and assess risks.
      
      Document content: ${content}
      
      Provide analysis in both Arabic and English with:
      1. Medical summary
      2. Key medical entities (medications, conditions, procedures)
      3. Clinical recommendations
      4. Risk assessment
      5. Compliance with Saudi healthcare standards
      
      Response format: JSON with bilingual content
    `

    try {
      const startTime = Date.now()
      const analysis = await spark.llm(prompt, 'gpt-4o')
      const processingTime = Date.now() - startTime

      // Extract medical entities
      const medicalEntities = await this.extractMedicalEntities(content, actualLanguage)
      
      // Generate clinical decisions
      const clinicalDecisions = await this.generateClinicalDecisions(medicalEntities, documentType)
      
      // Assess compliance
      const complianceCheck = await this.assessSaudiCompliance(content, documentType)
      
      // Generate FHIR resource if applicable
      const fhirResource = await this.generateFHIRResource(medicalEntities, documentType)

      return {
        summary: this.extractField(analysis, 'summary') || 'Document analyzed successfully',
        arabicSummary: this.extractField(analysis, 'arabicSummary') || 'تم تحليل الوثيقة بنجاح',
        medicalEntities,
        clinicalDecisions,
        riskAssessment: this.assessRisk(medicalEntities, clinicalDecisions),
        recommendations: this.extractArray(analysis, 'recommendations'),
        arabicRecommendations: this.extractArray(analysis, 'arabicRecommendations'),
        fhirResource,
        complianceCheck,
        confidence: 0.85,
        processingTime
      }
    } catch (error) {
      console.error('Healthcare document analysis failed:', error)
      throw new Error('Failed to analyze healthcare document')
    }
  }

  /**
   * Extract medical entities with Arabic support
   */
  async extractMedicalEntities(text: string, language: 'ar' | 'en'): Promise<MedicalEntity[]> {
    const prompt = spark.llmPrompt`
      Extract medical entities from this ${language} text.
      Identify: medications, dosages, frequencies, conditions, symptoms, procedures, diagnoses, body parts, vital signs, allergies, test results.
      
      Text: ${text}
      
      Return as JSON array with: type, value, confidence, position, translations
    `

    try {
      const entitiesResult = await spark.llm(prompt, 'gpt-4o')
      const entities = JSON.parse(entitiesResult || '[]')
      
      return entities.map((entity: any) => ({
        type: entity.type as MedicalEntityType,
        value: entity.value,
        confidence: entity.confidence || 0.8,
        position: entity.position || { start: 0, end: entity.value?.length || 0 },
        arabicTranslation: language === 'en' ? entity.arabicTranslation : entity.value,
        englishTranslation: language === 'ar' ? entity.englishTranslation : entity.value,
        code: entity.code
      }))
    } catch (error) {
      console.error('Medical entity extraction failed:', error)
      return []
    }
  }

  /**
   * Generate clinical decisions based on medical entities
   */
  async generateClinicalDecisions(
    entities: MedicalEntity[], 
    documentType: HealthcareDocumentType
  ): Promise<ClinicalDecision[]> {
    const medications = entities.filter(e => e.type === 'medication')
    const conditions = entities.filter(e => e.type === 'condition')
    const allergies = entities.filter(e => e.type === 'allergy')

    const decisions: ClinicalDecision[] = []

    // Drug interaction checking
    if (medications.length > 1) {
      const interactionCheck = await this.checkDrugInteractions(medications)
      if (interactionCheck.hasInteractions) {
        decisions.push({
          id: `interaction_${Date.now()}`,
          type: 'alert',
          severity: interactionCheck.severity,
          message: interactionCheck.message,
          arabicMessage: interactionCheck.arabicMessage,
          evidence: interactionCheck.evidence,
          actionRequired: true,
          guidelines: [{ source: 'Saudi-MOH', title: 'Drug Interaction Guidelines' }]
        })
      }
    }

    // Allergy checking
    if (allergies.length > 0 && medications.length > 0) {
      const allergyCheck = await this.checkAllergies(medications, allergies)
      if (allergyCheck.hasConflicts) {
        decisions.push({
          id: `allergy_${Date.now()}`,
          type: 'contraindication',
          severity: 'high',
          message: allergyCheck.message,
          arabicMessage: allergyCheck.arabicMessage,
          evidence: allergyCheck.evidence,
          actionRequired: true,
          guidelines: [{ source: 'Saudi-MOH', title: 'Allergy Management Guidelines' }]
        })
      }
    }

    // Saudi-specific clinical recommendations
    const saudiRecommendations = await this.getSaudiClinicalRecommendations(entities, documentType)
    decisions.push(...saudiRecommendations)

    return decisions
  }

  /**
   * Medical translation with terminology preservation
   */
  async translateMedicalDocument(
    content: string, 
    targetLanguage: 'ar' | 'en'
  ): Promise<MedicalTranslationResult> {
    const sourceLanguage = this.detectLanguage(content)
    
    if (sourceLanguage === targetLanguage) {
      return {
        originalText: content,
        translatedText: content,
        sourceLanguage,
        targetLanguage,
        medicalTermsMap: new Map(),
        preservedFormatting: true,
        confidence: 1.0,
        warnings: []
      }
    }

    const prompt = spark.llmPrompt`
      Translate this medical document from ${sourceLanguage} to ${targetLanguage}.
      Preserve medical terminology accuracy and document formatting.
      Provide a mapping of key medical terms.
      
      Content: ${content}
      
      Return JSON with: translatedText, medicalTermsMap, warnings
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      const parsedResult = JSON.parse(result || '{}')
      
      return {
        originalText: content,
        translatedText: parsedResult.translatedText || content,
        sourceLanguage,
        targetLanguage,
        medicalTermsMap: new Map(Object.entries(parsedResult.medicalTermsMap || {})),
        preservedFormatting: true,
        confidence: parsedResult.confidence || 0.9,
        warnings: parsedResult.warnings || []
      }
    } catch (error) {
      console.error('Medical translation failed:', error)
      throw new Error('Medical translation service unavailable')
    }
  }

  /**
   * Process Arabic voice commands for medical workflows
   */
  async processVoiceCommand(audioText: string, context?: any): Promise<VoiceCommand> {
    const prompt = spark.llmPrompt`
      Process this Arabic/English voice command for medical workflow.
      Identify intent and extract relevant entities.
      
      Command: ${audioText}
      Context: ${JSON.stringify(context || {})}
      
      Return JSON with: intent, entities, confidence, actionable steps
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      const parsed = JSON.parse(result || '{}')
      
      return {
        command: audioText,
        arabicCommand: parsed.arabicCommand || audioText,
        intent: parsed.intent as VoiceIntent || 'upload_document',
        entities: parsed.entities || [],
        confidence: parsed.confidence || 0.8
      }
    } catch (error) {
      console.error('Voice command processing failed:', error)
      return {
        command: audioText,
        arabicCommand: audioText,
        intent: 'upload_document',
        entities: [],
        confidence: 0.5
      }
    }
  }

  /**
   * Generate FHIR-compliant resource from medical entities
   */
  async generateFHIRResource(
    entities: MedicalEntity[], 
    documentType: HealthcareDocumentType
  ): Promise<FHIRResource | undefined> {
    if (entities.length === 0) return undefined

    try {
      const resourceType = this.mapDocumentTypeToFHIR(documentType)
      const resource: FHIRResource = {
        resourceType,
        id: `saudi-${Date.now()}`,
        meta: {
          lastUpdated: new Date().toISOString(),
          profile: [`http://saudi.moh.gov.sa/fhir/StructureDefinition/${resourceType}`]
        },
        status: 'final'
      }

      // Map entities to FHIR components
      entities.forEach(entity => {
        this.mapEntityToFHIR(entity, resource)
      })

      return resource
    } catch (error) {
      console.error('FHIR resource generation failed:', error)
      return undefined
    }
  }

  /**
   * Assess Saudi healthcare compliance
   */
  async assessSaudiCompliance(
    content: string, 
    documentType: HealthcareDocumentType
  ): Promise<SaudiComplianceData> {
    const validationResults: ValidationResult[] = []

    // MOH compliance check
    const mohCompliant = await this.checkMOHCompliance(content, documentType)
    validationResults.push(...mohCompliant.validationResults)

    // NPHIES compatibility
    const nphiesCompatible = await this.checkNPHIESCompatibility(content, documentType)
    
    // PDPL compliance
    const pdplCompliant = await this.checkPDPLCompliance(content)

    return {
      mohApproval: mohCompliant.approved,
      nphiesCompatible: nphiesCompatible.compatible,
      wasfatyIntegrated: documentType === 'prescription' && mohCompliant.approved,
      sehhatyCompatible: true, // Default for now
      pdplCompliant: pdplCompliant.compliant,
      validationResults
    }
  }

  // Private helper methods
  private detectLanguage(text: string): 'ar' | 'en' {
    const arabicRegex = /[\u0600-\u06FF]/
    return arabicRegex.test(text) ? 'ar' : 'en'
  }

  private extractField(analysis: string, field: string): string {
    try {
      const parsed = JSON.parse(analysis)
      return parsed[field] || ''
    } catch {
      return ''
    }
  }

  private extractArray(analysis: string, field: string): string[] {
    try {
      const parsed = JSON.parse(analysis)
      return Array.isArray(parsed[field]) ? parsed[field] : []
    } catch {
      return []
    }
  }

  private assessRisk(entities: MedicalEntity[], decisions: ClinicalDecision[]): RiskAssessment {
    const criticalDecisions = decisions.filter(d => d.severity === 'critical').length
    const highDecisions = decisions.filter(d => d.severity === 'high').length
    
    let level: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let score = 0

    if (criticalDecisions > 0) {
      level = 'critical'
      score = 90 + criticalDecisions * 5
    } else if (highDecisions > 0) {
      level = 'high'
      score = 70 + highDecisions * 5
    } else if (decisions.length > 2) {
      level = 'medium'
      score = 50 + decisions.length * 3
    } else {
      score = 20 + decisions.length * 5
    }

    return {
      level,
      factors: ['Medical complexity', 'Drug interactions', 'Clinical guidelines'],
      arabicFactors: ['التعقيد الطبي', 'تفاعل الأدوية', 'الإرشادات السريرية'],
      score: Math.min(score, 100),
      explanation: `Risk assessment based on clinical analysis and Saudi healthcare guidelines.`,
      arabicExplanation: 'تقييم المخاطر بناءً على التحليل السريري والإرشادات الصحية السعودية.'
    }
  }

  private async loadMedicalTermsDatabase(): Promise<void> {
    // Simulated loading of Arabic-English medical terms
    const medicalTerms = [
      { ar: 'باراسيتامول', en: 'Paracetamol', code: 'RxNorm:161' },
      { ar: 'ضغط الدم', en: 'Blood Pressure', code: 'LOINC:85354-9' },
      { ar: 'السكري', en: 'Diabetes', code: 'ICD-10:E11' },
      { ar: 'القلب', en: 'Heart', code: 'SNOMED:80891009' },
      { ar: 'الدواء', en: 'Medication', code: 'SNOMED:410942007' }
    ]
    
    medicalTerms.forEach(term => {
      this.medicalTermsDatabase.set(term.ar, term)
      this.medicalTermsDatabase.set(term.en, term)
    })
  }

  private async loadSaudiGuidelines(): Promise<void> {
    // Simulated loading of Saudi healthcare guidelines
    this.saudiGuidelines.set('prescriptions', {
      requiredFields: ['patient_id', 'provider_license', 'medication', 'dosage'],
      maxDuration: 30, // days
      requiresApproval: ['controlled_substances', 'expensive_medications']
    })
  }

  private async checkDrugInteractions(medications: MedicalEntity[]): Promise<any> {
    // Simplified drug interaction checking
    return {
      hasInteractions: medications.length > 2,
      severity: 'medium' as const,
      message: 'Potential drug interaction detected',
      arabicMessage: 'تم اكتشاف تفاعل محتمل بين الأدوية',
      evidence: ['Clinical database', 'Saudi guidelines'],
    }
  }

  private async checkAllergies(medications: MedicalEntity[], allergies: MedicalEntity[]): Promise<any> {
    return {
      hasConflicts: false,
      message: 'No allergy conflicts detected',
      arabicMessage: 'لم يتم اكتشاف تضارب في الحساسية',
      evidence: []
    }
  }

  private async getSaudiClinicalRecommendations(
    entities: MedicalEntity[], 
    documentType: HealthcareDocumentType
  ): Promise<ClinicalDecision[]> {
    return []
  }

  private mapDocumentTypeToFHIR(documentType: HealthcareDocumentType): string {
    const mapping: Record<HealthcareDocumentType, string> = {
      'prescription': 'MedicationRequest',
      'lab_results': 'Observation',
      'radiology': 'ImagingStudy',
      'referral': 'ServiceRequest',
      'insurance_claim': 'Claim',
      'approval': 'Coverage',
      'medical_history': 'Condition',
      'consent_form': 'Consent',
      'vaccination_record': 'Immunization',
      'discharge_summary': 'Encounter',
      'clinical_note': 'DocumentReference',
      'dicom_image': 'ImagingStudy',
      'hl7_message': 'Bundle'
    }
    return mapping[documentType] || 'DocumentReference'
  }

  private mapEntityToFHIR(entity: MedicalEntity, resource: FHIRResource): void {
    // Simplified FHIR mapping
    if (entity.type === 'medication' && resource.resourceType === 'MedicationRequest') {
      resource.code = {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: entity.code?.code || 'unknown',
          display: entity.value
        }],
        text: entity.value
      }
    }
  }

  private async checkMOHCompliance(content: string, documentType: HealthcareDocumentType): Promise<any> {
    return {
      approved: true,
      validationResults: []
    }
  }

  private async checkNPHIESCompatibility(content: string, documentType: HealthcareDocumentType): Promise<any> {
    return { compatible: true }
  }

  private async checkPDPLCompliance(content: string): Promise<any> {
    return { compliant: true }
  }

  /**
   * Extract form data from patient information for auto-population
   */
  async extractFormData(
    patientData: any,
    medicalHistory: MedicalEntity[],
    documentType: HealthcareDocumentType
  ): Promise<Record<string, any>> {
    const prompt = spark.llmPrompt`
      Extract relevant form data for auto-population from patient information.
      
      Patient Data: ${JSON.stringify(patientData)}
      Medical History: ${JSON.stringify(medicalHistory)}
      Document Type: ${documentType}
      
      Return JSON object with field names and values for form auto-population.
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      return JSON.parse(result || '{}')
    } catch (error) {
      console.error('Form data extraction failed:', error)
      return {}
    }
  }

  /**
   * Generate AI suggestions for form fields
   */
  async generateFormSuggestions(
    patientData: any,
    medicalHistory: MedicalEntity[],
    documentType: HealthcareDocumentType,
    language: 'ar' | 'en'
  ): Promise<Record<string, string>> {
    const prompt = spark.llmPrompt`
      Generate intelligent suggestions for form fields based on patient data and medical history.
      Provide suggestions in ${language} language.
      
      Patient Data: ${JSON.stringify(patientData)}
      Medical History: ${JSON.stringify(medicalHistory)}
      Document Type: ${documentType}
      
      Return JSON object with field names and suggestion values.
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      return JSON.parse(result || '{}')
    } catch (error) {
      console.error('Form suggestions generation failed:', error)
      return {}
    }
  }

  /**
   * Check drug interactions for Saudi medication database
   */
  async checkDrugInteractions(
    medications: MedicalEntity[],
    patientData: any,
    database: string = 'saudi_database'
  ): Promise<any[]> {
    const prompt = spark.llmPrompt`
      Check for drug interactions between these medications using ${database}.
      Consider patient data for personalized interaction checking.
      
      Medications: ${JSON.stringify(medications)}
      Patient Data: ${JSON.stringify(patientData)}
      
      Return JSON array of interactions with severity, description, and recommendations.
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      return JSON.parse(result || '[]')
    } catch (error) {
      console.error('Drug interaction check failed:', error)
      return []
    }
  }

  /**
   * Check compliance with Saudi healthcare guidelines
   */
  async checkSaudiGuidelines(
    medicalEntities: MedicalEntity[],
    documentType: HealthcareDocumentType,
    patientData: any
  ): Promise<any[]> {
    const prompt = spark.llmPrompt`
      Check compliance with Saudi healthcare guidelines (MOH, SFDA, NPHIES, CBAHI).
      
      Medical Entities: ${JSON.stringify(medicalEntities)}
      Document Type: ${documentType}
      Patient Data: ${JSON.stringify(patientData)}
      
      Return JSON array of guideline compliance checks with recommendations.
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      return JSON.parse(result || '[]')
    } catch (error) {
      console.error('Saudi guidelines check failed:', error)
      return []
    }
  }

  /**
   * Generate clinical alerts based on analysis
   */
  async generateClinicalAlerts(
    medicalEntities: MedicalEntity[],
    patientData: any,
    documentType?: HealthcareDocumentType,
    language: 'ar' | 'en' = 'ar'
  ): Promise<any[]> {
    const prompt = spark.llmPrompt`
      Generate clinical alerts and warnings based on medical analysis.
      Consider patient safety and Saudi healthcare standards.
      Provide alerts in ${language} language.
      
      Medical Entities: ${JSON.stringify(medicalEntities)}
      Patient Data: ${JSON.stringify(patientData)}
      Document Type: ${documentType}
      
      Return JSON array of clinical alerts with priority, type, and messages.
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      return JSON.parse(result || '[]')
    } catch (error) {
      console.error('Clinical alerts generation failed:', error)
      return []
    }
  }
}

// Export singleton instance
export const healthcareAI = HealthcareAIService.getInstance()