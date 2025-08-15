/**
 * Enhanced Healthcare Document Processor for Phase 2
 * Specialized medical document processing with Arabic OCR and Saudi healthcare compliance
 */

import { DocumentProcessor } from '@/services/DocumentProcessor'
import { HealthcareAIService } from './healthcare-ai'
import {
  HealthcareDocument,
  HealthcareDocumentType,
  MedicalEntity,
  FHIRResource,
  SaudiComplianceData
} from '@/types/healthcare'
import { spark } from './mock-spark'

export interface ArabicOCRResult {
  text: string
  confidence: number
  medicalTermsDetected: string[]
  handwritingDetected: boolean
  language: 'ar' | 'en' | 'mixed'
}

export interface DocumentClassificationResult {
  documentType: HealthcareDocumentType
  confidence: number
  subType?: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  requiresPhysicianReview: boolean
}

export class HealthcareDocumentProcessor extends DocumentProcessor {
  private healthcareAI: HealthcareAIService
  private static instance: HealthcareDocumentProcessor

  private constructor() {
    super()
    this.healthcareAI = HealthcareAIService.getInstance()
  }

  static getInstance(): HealthcareDocumentProcessor {
    if (!HealthcareDocumentProcessor.instance) {
      HealthcareDocumentProcessor.instance = new HealthcareDocumentProcessor()
    }
    return HealthcareDocumentProcessor.instance
  }

  /**
   * Enhanced Arabic OCR with medical terminology focus
   */
  async processArabicMedicalDocument(file: File): Promise<ArabicOCRResult> {
    try {
      // Enhanced OCR with medical model
      const result = await import('tesseract.js').then(Tesseract => 
        Tesseract.recognize(file, 'ara+eng', {
          logger: m => console.log(m),
          tessedit_pageseg_mode: '6', // Uniform block of text
          tessedit_ocr_engine_mode: '2', // Neural nets LSTM only
          preserve_interword_spaces: '1'
        })
      )

      const text = result.data.text || ''
      
      // Detect medical terminology
      const medicalTerms = await this.detectMedicalTerminology(text)
      
      // Check for handwriting patterns
      const handwritingDetected = this.detectHandwriting(result.data)
      
      // Determine primary language
      const language = this.detectPrimaryLanguage(text)

      return {
        text,
        confidence: result.data.confidence / 100,
        medicalTermsDetected: medicalTerms,
        handwritingDetected,
        language
      }
    } catch (error) {
      console.error('Arabic OCR processing failed:', error)
      throw new Error('Failed to process Arabic medical document')
    }
  }

  /**
   * Classify healthcare documents automatically
   */
  async classifyHealthcareDocument(content: string, fileName: string): Promise<DocumentClassificationResult> {
    const prompt = spark.llmPrompt`
      Classify this healthcare document based on content and filename.
      Identify document type, urgency level, and whether physician review is required.
      
      Content: ${content.substring(0, 1000)}
      Filename: ${fileName}
      
      Saudi healthcare context - consider MOH standards and NPHIES requirements.
      
      Return JSON with: documentType, confidence, subType, urgencyLevel, requiresPhysicianReview
    `

    try {
      const classification = await spark.llm(prompt, 'gpt-4o')
      const parsed = JSON.parse(classification || '{}')
      
      return {
        documentType: parsed.documentType || 'clinical_note',
        confidence: parsed.confidence || 0.7,
        subType: parsed.subType,
        urgencyLevel: parsed.urgencyLevel || 'medium',
        requiresPhysicianReview: parsed.requiresPhysicianReview || false
      }
    } catch (error) {
      console.error('Document classification failed:', error)
      return {
        documentType: 'clinical_note',
        confidence: 0.5,
        urgencyLevel: 'medium',
        requiresPhysicianReview: true
      }
    }
  }

  /**
   * Enhanced medical entity extraction with Arabic support
   */
  async extractMedicalEntitiesEnhanced(text: string, documentType: HealthcareDocumentType): Promise<MedicalEntity[]> {
    const language = this.detectPrimaryLanguage(text)
    
    const prompt = spark.llmPrompt`
      Extract medical entities from this ${language} ${documentType} document.
      Focus on Saudi healthcare context and Arabic medical terminology.
      
      Extract: medications (with Arabic names), dosages, frequencies, conditions, 
      symptoms, procedures, diagnoses, body parts, vital signs, allergies, test results,
      Saudi medication codes, MOH procedure codes.
      
      Text: ${text}
      
      Return JSON array with enhanced medical entity data including Saudi codes.
    `

    try {
      const result = await spark.llm(prompt, 'gpt-4o')
      const entities = JSON.parse(result || '[]')
      
      return entities.map((entity: any) => ({
        type: entity.type,
        value: entity.value,
        confidence: entity.confidence || 0.8,
        position: entity.position || { start: 0, end: 0 },
        arabicTranslation: entity.arabicTranslation,
        englishTranslation: entity.englishTranslation,
        code: entity.code ? {
          system: entity.code.system || 'Saudi-Codes',
          code: entity.code.code,
          display: entity.code.display || entity.value
        } : undefined
      }))
    } catch (error) {
      console.error('Enhanced medical entity extraction failed:', error)
      return []
    }
  }

  /**
   * Process complete healthcare document workflow
   */
  async processHealthcareDocument(file: File): Promise<HealthcareDocument> {
    const startTime = Date.now()
    
    try {
      // Step 1: Extract content with enhanced OCR
      const ocrResult = await this.processArabicMedicalDocument(file)
      
      // Step 2: Classify document
      const classification = await this.classifyHealthcareDocument(ocrResult.text, file.name)
      
      // Step 3: Extract medical entities
      const medicalEntities = await this.extractMedicalEntitiesEnhanced(
        ocrResult.text, 
        classification.documentType
      )
      
      // Step 4: Generate FHIR resource
      const fhirResource = await this.healthcareAI.generateFHIRResource(
        medicalEntities,
        classification.documentType
      )
      
      // Step 5: Check Saudi compliance
      const complianceCheck = await this.healthcareAI.assessSaudiCompliance(
        ocrResult.text,
        classification.documentType
      )
      
      // Step 6: Create healthcare document object
      const healthcareDoc: HealthcareDocument = {
        id: `hc-${Date.now()}`,
        name: file.name,
        type: classification.documentType,
        format: this.getDocumentFormat(file.name),
        size: file.size,
        status: 'processed',
        uploadedAt: new Date(),
        metadata: {
          language: ocrResult.language,
          medicalEntities,
          urgencyLevel: classification.urgencyLevel,
          confidentialityLevel: this.determineConfidentialityLevel(classification.documentType)
        },
        fhirResource,
        saudiCompliance: complianceCheck
      }
      
      console.log(`Healthcare document processed in ${Date.now() - startTime}ms`)
      return healthcareDoc
      
    } catch (error) {
      console.error('Healthcare document processing failed:', error)
      throw new Error('Failed to process healthcare document')
    }
  }

  // Private helper methods
  private async detectMedicalTerminology(text: string): Promise<string[]> {
    const medicalKeywords = [
      // Arabic medical terms
      'دواء', 'علاج', 'مرض', 'عرض', 'تشخيص', 'فحص', 'أشعة', 'تحليل',
      'ضغط', 'سكر', 'قلب', 'كلى', 'كبد', 'رئة', 'دم', 'بول',
      // English medical terms
      'medication', 'treatment', 'diagnosis', 'symptom', 'prescription',
      'blood', 'pressure', 'diabetes', 'heart', 'kidney', 'liver'
    ]
    
    return medicalKeywords.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    )
  }

  private detectHandwriting(ocrData: any): boolean {
    // Simple heuristic based on confidence and character patterns
    return ocrData.confidence < 70 || /[a-zA-Z]{1,2}[0-9]/.test(ocrData.text)
  }

  private detectPrimaryLanguage(text: string): 'ar' | 'en' | 'mixed' {
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length
    
    if (arabicChars > englishChars * 2) return 'ar'
    if (englishChars > arabicChars * 2) return 'en'
    return 'mixed'
  }

  private getDocumentFormat(fileName: string): any {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const formatMap: Record<string, any> = {
      'pdf': 'pdf',
      'dcm': 'dicom',
      'hl7': 'hl7',
      'docx': 'docx',
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'png': 'png',
      'xml': 'xml',
      'json': 'json'
    }
    return formatMap[extension || 'pdf'] || 'pdf'
  }

  private determineConfidentialityLevel(documentType: HealthcareDocumentType): any {
    const confidentialityMap: Record<HealthcareDocumentType, any> = {
      'prescription': 'confidential',
      'lab_results': 'confidential',
      'radiology': 'confidential',
      'medical_history': 'secret',
      'clinical_note': 'confidential',
      'referral': 'restricted',
      'insurance_claim': 'restricted',
      'approval': 'restricted',
      'consent_form': 'restricted',
      'vaccination_record': 'restricted',
      'discharge_summary': 'confidential',
      'dicom_image': 'confidential',
      'hl7_message': 'confidential'
    }
    return confidentialityMap[documentType] || 'restricted'
  }
}

// Export singleton instance
export const healthcareDocumentProcessor = HealthcareDocumentProcessor.getInstance()