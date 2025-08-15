/**
 * NPHIES Integration Service for Phase 2
 * Saudi Arabia National Health Information Exchange System integration
 */

import { HealthcareDocument, FHIRResource, MedicalEntity } from '@/types/healthcare'
import { spark } from '@/lib/mock-spark'

export interface NPHIESClaim {
  id: string
  patientId: string
  providerId: string
  serviceDate: string
  diagnosis: string[]
  procedures: string[]
  medications: string[]
  totalAmount: number
  currency: 'SAR'
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
  submissionDate?: string
  approvalDate?: string
  rejectionReason?: string
  arabicRejectionReason?: string
}

export interface NPHIESEligibility {
  patientId: string
  insuranceId: string
  policyNumber: string
  isActive: boolean
  coverageType: string
  copayAmount: number
  deductibleAmount: number
  maxCoverage: number
  validFrom: string
  validTo: string
  restrictions?: string[]
}

export interface NPHIESPreauthorization {
  id: string
  patientId: string
  providerId: string
  requestedServices: string[]
  requestedMedications: string[]
  clinicalJustification: string
  arabicClinicalJustification: string
  estimatedCost: number
  urgency: 'routine' | 'urgent' | 'emergency'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  approvalCode?: string
  expiryDate?: string
}

export class NPHIESIntegration {
  private static instance: NPHIESIntegration
  private apiEndpoint: string
  private apiKey: string
  private isInitialized = false

  private constructor() {
    this.apiEndpoint = process.env.NPHIES_API_ENDPOINT || 'https://api.nphies.sa'
    this.apiKey = process.env.NPHIES_API_KEY || ''
  }

  static getInstance(): NPHIESIntegration {
    if (!NPHIESIntegration.instance) {
      NPHIESIntegration.instance = new NPHIESIntegration()
    }
    return NPHIESIntegration.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // In production, this would validate API connection
      console.log('Initializing NPHIES Integration...')
      this.isInitialized = true
    } catch (error) {
      console.error('NPHIES initialization failed:', error)
      throw new Error('Failed to initialize NPHIES integration')
    }
  }

  /**
   * Check patient eligibility in NPHIES system
   */
  async checkPatientEligibility(
    patientId: string,
    insuranceId: string,
    serviceDate: string
  ): Promise<NPHIESEligibility> {
    await this.initialize()

    try {
      // Mock implementation - in production, this would call NPHIES API
      const eligibility: NPHIESEligibility = {
        patientId,
        insuranceId,
        policyNumber: `POL-${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        coverageType: 'comprehensive',
        copayAmount: 50,
        deductibleAmount: 200,
        maxCoverage: 100000,
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        restrictions: []
      }

      return eligibility
    } catch (error) {
      console.error('Eligibility check failed:', error)
      throw new Error('Failed to check patient eligibility')
    }
  }

  /**
   * Submit insurance claim to NPHIES
   */
  async submitClaim(
    healthcareDocument: HealthcareDocument,
    medicalEntities: MedicalEntity[],
    providerId: string
  ): Promise<NPHIESClaim> {
    await this.initialize()

    try {
      // Extract claim data from healthcare document
      const claimData = await this.extractClaimData(healthcareDocument, medicalEntities)
      
      // Create NPHIES claim
      const claim: NPHIESClaim = {
        id: `CLM-${Date.now()}`,
        patientId: healthcareDocument.patientId || '',
        providerId,
        serviceDate: new Date().toISOString().split('T')[0],
        diagnosis: claimData.diagnosis,
        procedures: claimData.procedures,
        medications: claimData.medications,
        totalAmount: claimData.totalAmount,
        currency: 'SAR',
        status: 'submitted',
        submissionDate: new Date().toISOString()
      }

      // Submit to NPHIES (mock)
      console.log('Submitting claim to NPHIES:', claim)
      
      return claim
    } catch (error) {
      console.error('Claim submission failed:', error)
      throw new Error('Failed to submit insurance claim')
    }
  }

  /**
   * Request preauthorization for services/medications
   */
  async requestPreauthorization(
    patientId: string,
    providerId: string,
    services: string[],
    medications: string[],
    justification: string,
    urgency: 'routine' | 'urgent' | 'emergency' = 'routine'
  ): Promise<NPHIESPreauthorization> {
    await this.initialize()

    try {
      // Translate justification to Arabic if needed
      const arabicJustification = await this.translateToArabic(justification)

      const preauth: NPHIESPreauthorization = {
        id: `AUTH-${Date.now()}`,
        patientId,
        providerId,
        requestedServices: services,
        requestedMedications: medications,
        clinicalJustification: justification,
        arabicClinicalJustification: arabicJustification,
        estimatedCost: this.calculateEstimatedCost(services, medications),
        urgency,
        status: 'pending'
      }

      // Submit preauthorization request (mock)
      console.log('Requesting preauthorization:', preauth)
      
      // Simulate approval for demo
      setTimeout(() => {
        preauth.status = 'approved'
        preauth.approvalCode = `APV-${Math.random().toString(36).substr(2, 8)}`
        preauth.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, 2000)

      return preauth
    } catch (error) {
      console.error('Preauthorization request failed:', error)
      throw new Error('Failed to request preauthorization')
    }
  }

  /**
   * Check claim status in NPHIES system
   */
  async checkClaimStatus(claimId: string): Promise<NPHIESClaim> {
    await this.initialize()

    try {
      // Mock implementation
      const claim: NPHIESClaim = {
        id: claimId,
        patientId: 'PAT-123',
        providerId: 'PROV-456',
        serviceDate: new Date().toISOString().split('T')[0],
        diagnosis: ['M25.511'],
        procedures: ['99213'],
        medications: ['Ibuprofen 600mg'],
        totalAmount: 350,
        currency: 'SAR',
        status: 'approved',
        submissionDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        approvalDate: new Date().toISOString()
      }

      return claim
    } catch (error) {
      console.error('Claim status check failed:', error)
      throw new Error('Failed to check claim status')
    }
  }

  /**
   * Convert healthcare document to NPHIES FHIR format
   */
  async convertToNPHIESFHIR(
    healthcareDocument: HealthcareDocument,
    medicalEntities: MedicalEntity[]
  ): Promise<FHIRResource> {
    const fhirResource: FHIRResource = {
      resourceType: 'Claim',
      id: `nphies-${healthcareDocument.id}`,
      meta: {
        profile: ['http://nphies.sa/fhir/StructureDefinition/Claim'],
        lastUpdated: new Date().toISOString()
      },
      status: 'active',
      // Add NPHIES-specific mappings
      identifier: [{
        use: 'official',
        system: 'http://nphies.sa/identifier/claim',
        value: healthcareDocument.id
      }]
    }

    // Map medical entities to FHIR components
    medicalEntities.forEach(entity => {
      this.mapEntityToNPHIESFHIR(entity, fhirResource)
    })

    return fhirResource
  }

  // Private helper methods
  private async extractClaimData(
    document: HealthcareDocument,
    entities: MedicalEntity[]
  ): Promise<any> {
    const diagnosis = entities
      .filter(e => e.type === 'diagnosis' || e.type === 'condition')
      .map(e => e.code?.code || e.value)

    const procedures = entities
      .filter(e => e.type === 'procedure')
      .map(e => e.code?.code || e.value)

    const medications = entities
      .filter(e => e.type === 'medication')
      .map(e => e.value)

    return {
      diagnosis,
      procedures,
      medications,
      totalAmount: this.calculateTotalAmount(entities)
    }
  }

  private calculateTotalAmount(entities: MedicalEntity[]): number {
    // Mock calculation based on entity types
    let total = 0
    entities.forEach(entity => {
      switch (entity.type) {
        case 'procedure': total += 200; break
        case 'medication': total += 50; break
        case 'diagnosis': total += 100; break
        default: total += 25; break
      }
    })
    return total
  }

  private calculateEstimatedCost(services: string[], medications: string[]): number {
    return services.length * 200 + medications.length * 50
  }

  private async translateToArabic(text: string): Promise<string> {
    if (/[\u0600-\u06FF]/.test(text)) return text // Already Arabic
    
    try {
      const prompt = spark.llmPrompt`
        Translate this medical text to Arabic:
        ${text}
        
        Return only the Arabic translation.
      `
      
      const translation = await spark.llm(prompt, 'gpt-4o')
      return translation || text
    } catch (error) {
      console.error('Translation failed:', error)
      return text
    }
  }

  private mapEntityToNPHIESFHIR(entity: MedicalEntity, resource: FHIRResource): void {
    // NPHIES-specific FHIR mapping
    if (entity.type === 'diagnosis' && entity.code) {
      if (!resource.diagnosis) resource.diagnosis = []
      resource.diagnosis.push({
        diagnosisCodeableConcept: {
          coding: [{
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: entity.code.code,
            display: entity.value
          }]
        }
      })
    }
  }
}

// Export singleton instance
export const nphiesIntegration = NPHIESIntegration.getInstance()