/**
 * Enhanced FHIR Resource Mapper for Phase 2
 * Comprehensive FHIR R4 mapping for Saudi healthcare context
 */

import {
  HealthcareDocument,
  HealthcareDocumentType,
  MedicalEntity,
  FHIRResource,
  MedicalCode
} from '@/types/healthcare'
import { spark } from '@/lib/mock-spark'

export interface FHIRMappingResult {
  resource: FHIRResource
  profile: string
  validationErrors: FHIRValidationError[]
  mappingQuality: number
  saudiExtensions: SaudiExtension[]
}

export interface FHIRValidationError {
  path: string
  message: string
  arabicMessage: string
  severity: 'error' | 'warning' | 'info'
}

export interface SaudiExtension {
  url: string
  valueCoding?: {
    system: string
    code: string
    display: string
    displayArabic?: string
  }
  valueString?: string
  valueBoolean?: boolean
  valueInteger?: number
}

export class FHIRResourceMapper {
  private static instance: FHIRResourceMapper
  private readonly saudiProfiles: Record<string, string> = {
    'Patient': 'http://saudi.moh.gov.sa/fhir/StructureDefinition/Patient',
    'Practitioner': 'http://saudi.moh.gov.sa/fhir/StructureDefinition/Practitioner',
    'Organization': 'http://saudi.moh.gov.sa/fhir/StructureDefinition/Organization',
    'MedicationRequest': 'http://saudi.moh.gov.sa/fhir/StructureDefinition/MedicationRequest',
    'Observation': 'http://saudi.moh.gov.sa/fhir/StructureDefinition/Observation',
    'DiagnosticReport': 'http://saudi.moh.gov.sa/fhir/StructureDefinition/DiagnosticReport',
    'Encounter': 'http://saudi.moh.gov.sa/fhir/StructureDefinition/Encounter',
    'Claim': 'http://nphies.sa/fhir/StructureDefinition/Claim',
    'Coverage': 'http://nphies.sa/fhir/StructureDefinition/Coverage'
  }

  private readonly saudiCodeSystems: Record<string, string> = {
    'MOH-PROCEDURES': 'http://saudi.moh.gov.sa/terminology/CodeSystem/procedures',
    'MOH-DIAGNOSES': 'http://saudi.moh.gov.sa/terminology/CodeSystem/diagnoses',
    'SFDA-MEDICATIONS': 'http://sfda.gov.sa/terminology/CodeSystem/medications',
    'NPHIES-SERVICES': 'http://nphies.sa/terminology/CodeSystem/services',
    'SAUDI-IDENTIFIERS': 'http://saudi.moh.gov.sa/terminology/CodeSystem/identifiers'
  }

  private constructor() {}

  static getInstance(): FHIRResourceMapper {
    if (!FHIRResourceMapper.instance) {
      FHIRResourceMapper.instance = new FHIRResourceMapper()
    }
    return FHIRResourceMapper.instance
  }

  /**
   * Map healthcare document to FHIR resource with Saudi extensions
   */
  async mapToFHIR(
    document: HealthcareDocument,
    medicalEntities: MedicalEntity[],
    context?: any
  ): Promise<FHIRMappingResult> {
    try {
      const resourceType = this.getResourceType(document.type)
      const baseResource = this.createBaseResource(resourceType, document)
      
      // Apply Saudi profile
      const profile = this.saudiProfiles[resourceType]
      if (profile) {
        baseResource.meta = {
          ...baseResource.meta,
          profile: [profile]
        }
      }

      // Map medical entities to FHIR elements
      await this.mapMedicalEntities(baseResource, medicalEntities, document.type)
      
      // Add Saudi-specific extensions
      const saudiExtensions = await this.addSaudiExtensions(baseResource, document, context)
      
      // Validate the resource
      const validationErrors = await this.validateResource(baseResource, resourceType)
      
      // Calculate mapping quality
      const mappingQuality = this.calculateMappingQuality(baseResource, medicalEntities, validationErrors)

      return {
        resource: baseResource,
        profile,
        validationErrors,
        mappingQuality,
        saudiExtensions
      }
    } catch (error) {
      console.error('FHIR mapping failed:', error)
      throw new Error('Failed to map to FHIR resource')
    }
  }

  /**
   * Create patient resource with Saudi identifiers
   */
  async createPatientResource(
    patientData: any,
    nationalId?: string,
    iqamaId?: string
  ): Promise<FHIRResource> {
    const patient: FHIRResource = {
      resourceType: 'Patient',
      id: patientData.id || `patient-${Date.now()}`,
      meta: {
        profile: [this.saudiProfiles.Patient],
        lastUpdated: new Date().toISOString()
      },
      identifier: [],
      name: [
        {
          use: 'official',
          family: patientData.familyName || patientData.lastName,
          given: [patientData.givenName || patientData.firstName],
          text: patientData.fullName
        }
      ],
      gender: patientData.gender || 'unknown',
      birthDate: patientData.birthDate,
      telecom: [],
      address: [],
      communication: [
        {
          language: {
            coding: [
              {
                system: 'urn:ietf:bcp:47',
                code: 'ar-SA',
                display: 'Arabic (Saudi Arabia)'
              }
            ]
          },
          preferred: true
        }
      ]
    }

    // Add Saudi National ID
    if (nationalId) {
      patient.identifier?.push({
        use: 'official',
        type: {
          coding: [
            {
              system: this.saudiCodeSystems['SAUDI-IDENTIFIERS'],
              code: 'NATIONAL-ID',
              display: 'Saudi National ID'
            }
          ]
        },
        system: 'http://saudi.gov.sa/id/national-id',
        value: nationalId
      })
    }

    // Add Iqama ID for residents
    if (iqamaId) {
      patient.identifier?.push({
        use: 'official',
        type: {
          coding: [
            {
              system: this.saudiCodeSystems['SAUDI-IDENTIFIERS'],
              code: 'IQAMA-ID',
              display: 'Saudi Iqama ID'
            }
          ]
        },
        system: 'http://saudi.gov.sa/id/iqama',
        value: iqamaId
      })
    }

    // Add Arabic name if available
    if (patientData.arabicName) {
      patient.name?.push({
        use: 'usual',
        text: patientData.arabicName,
        extension: [
          {
            url: 'http://saudi.moh.gov.sa/fhir/StructureDefinition/name-language',
            valueCoding: {
              system: 'urn:ietf:bcp:47',
              code: 'ar-SA',
              display: 'Arabic'
            }
          }
        ]
      })
    }

    return patient
  }

  /**
   * Create medication request with Saudi medication codes
   */
  async createMedicationRequest(
    medicationEntity: MedicalEntity,
    patientId: string,
    prescriberId: string,
    context?: any
  ): Promise<FHIRResource> {
    const medicationRequest: FHIRResource = {
      resourceType: 'MedicationRequest',
      id: `med-req-${Date.now()}`,
      meta: {
        profile: [this.saudiProfiles.MedicationRequest],
        lastUpdated: new Date().toISOString()
      },
      status: 'active',
      intent: 'order',
      subject: {
        reference: `Patient/${patientId}`
      },
      requester: {
        reference: `Practitioner/${prescriberId}`
      },
      authoredOn: new Date().toISOString()
    }

    // Map medication with SFDA codes
    if (medicationEntity.code) {
      medicationRequest.medicationCodeableConcept = {
        coding: [
          {
            system: this.saudiCodeSystems['SFDA-MEDICATIONS'],
            code: medicationEntity.code.code,
            display: medicationEntity.value
          }
        ],
        text: medicationEntity.value
      }

      // Add Arabic translation
      if (medicationEntity.arabicTranslation) {
        medicationRequest.medicationCodeableConcept.coding?.push({
          system: this.saudiCodeSystems['SFDA-MEDICATIONS'],
          code: medicationEntity.code.code,
          display: medicationEntity.arabicTranslation,
          extension: [
            {
              url: 'http://saudi.moh.gov.sa/fhir/StructureDefinition/display-language',
              valueCoding: {
                system: 'urn:ietf:bcp:47',
                code: 'ar-SA'
              }
            }
          ]
        })
      }
    }

    // Add dosage instructions
    if (context?.dosage || context?.frequency) {
      medicationRequest.dosageInstruction = [
        {
          text: `${context.dosage || 'As prescribed'} ${context.frequency || ''}`.trim(),
          timing: this.createDosageTiming(context.frequency),
          doseAndRate: context.dosage ? [
            {
              doseQuantity: this.parseDosageQuantity(context.dosage)
            }
          ] : undefined
        }
      ]
    }

    return medicationRequest
  }

  /**
   * Create observation resource for lab results/vital signs
   */
  async createObservation(
    entity: MedicalEntity,
    patientId: string,
    performerId?: string,
    context?: any
  ): Promise<FHIRResource> {
    const observation: FHIRResource = {
      resourceType: 'Observation',
      id: `obs-${Date.now()}`,
      meta: {
        profile: [this.saudiProfiles.Observation],
        lastUpdated: new Date().toISOString()
      },
      status: 'final',
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: new Date().toISOString()
    }

    // Map observation code
    if (entity.code) {
      observation.code = {
        coding: [
          {
            system: 'http://loinc.org',
            code: entity.code.code,
            display: entity.value
          }
        ]
      }
    }

    // Map value based on entity type
    if (entity.type === 'vital_sign' || entity.type === 'test_result') {
      const numericValue = this.extractNumericValue(entity.value)
      if (numericValue) {
        observation.valueQuantity = {
          value: numericValue.value,
          unit: numericValue.unit,
          system: 'http://unitsofmeasure.org'
        }
      } else {
        observation.valueString = entity.value
      }
    }

    // Add performer if provided
    if (performerId) {
      observation.performer = [
        {
          reference: `Practitioner/${performerId}`
        }
      ]
    }

    return observation
  }

  // Private helper methods
  private getResourceType(documentType: HealthcareDocumentType): string {
    const mapping: Record<HealthcareDocumentType, string> = {
      'prescription': 'MedicationRequest',
      'lab_results': 'DiagnosticReport',
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

  private createBaseResource(resourceType: string, document: HealthcareDocument): FHIRResource {
    return {
      resourceType,
      id: document.id,
      meta: {
        lastUpdated: document.uploadedAt.toISOString(),
        source: 'BrainSAIT-DocSmart-AI'
      },
      identifier: [
        {
          use: 'usual',
          system: 'http://docsmart.ai/fhir/identifier',
          value: document.id
        }
      ]
    }
  }

  private async mapMedicalEntities(
    resource: FHIRResource,
    entities: MedicalEntity[],
    documentType: HealthcareDocumentType
  ): Promise<void> {
    for (const entity of entities) {
      switch (entity.type) {
        case 'medication':
          this.mapMedicationEntity(resource, entity)
          break
        case 'diagnosis':
        case 'condition':
          this.mapDiagnosisEntity(resource, entity)
          break
        case 'procedure':
          this.mapProcedureEntity(resource, entity)
          break
        case 'vital_sign':
        case 'test_result':
          this.mapObservationEntity(resource, entity)
          break
      }
    }
  }

  private mapMedicationEntity(resource: FHIRResource, entity: MedicalEntity): void {
    if (resource.resourceType === 'MedicationRequest') {
      resource.medicationCodeableConcept = {
        coding: [
          {
            system: entity.code?.system || this.saudiCodeSystems['SFDA-MEDICATIONS'],
            code: entity.code?.code || 'unknown',
            display: entity.value
          }
        ],
        text: entity.value
      }
    }
  }

  private mapDiagnosisEntity(resource: FHIRResource, entity: MedicalEntity): void {
    if (!resource.diagnosis) resource.diagnosis = []
    
    resource.diagnosis.push({
      diagnosisCodeableConcept: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: entity.code?.code || 'unknown',
            display: entity.value
          }
        ]
      }
    })
  }

  private mapProcedureEntity(resource: FHIRResource, entity: MedicalEntity): void {
    if (!resource.procedure) resource.procedure = []
    
    resource.procedure.push({
      procedureCodeableConcept: {
        coding: [
          {
            system: this.saudiCodeSystems['MOH-PROCEDURES'],
            code: entity.code?.code || 'unknown',
            display: entity.value
          }
        ]
      }
    })
  }

  private mapObservationEntity(resource: FHIRResource, entity: MedicalEntity): void {
    if (!resource.component) resource.component = []
    
    resource.component.push({
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: entity.code?.code || 'unknown',
            display: entity.value
          }
        ]
      },
      valueString: entity.value
    })
  }

  private async addSaudiExtensions(
    resource: FHIRResource,
    document: HealthcareDocument,
    context?: any
  ): Promise<SaudiExtension[]> {
    const extensions: SaudiExtension[] = []

    // Add Saudi facility extension
    if (document.facilityId) {
      extensions.push({
        url: 'http://saudi.moh.gov.sa/fhir/StructureDefinition/facility-identifier',
        valueString: document.facilityId
      })
    }

    // Add language extension
    if (document.metadata.language) {
      extensions.push({
        url: 'http://saudi.moh.gov.sa/fhir/StructureDefinition/document-language',
        valueCoding: {
          system: 'urn:ietf:bcp:47',
          code: document.metadata.language === 'ar' ? 'ar-SA' : 'en-US',
          display: document.metadata.language === 'ar' ? 'Arabic' : 'English'
        }
      })
    }

    // Add confidentiality extension
    extensions.push({
      url: 'http://saudi.moh.gov.sa/fhir/StructureDefinition/confidentiality-level',
      valueString: document.metadata.confidentialityLevel
    })

    // Apply extensions to resource
    if (!resource.extension) resource.extension = []
    resource.extension.push(...extensions)

    return extensions
  }

  private async validateResource(resource: FHIRResource, resourceType: string): Promise<FHIRValidationError[]> {
    const errors: FHIRValidationError[] = []

    // Basic validation
    if (!resource.id) {
      errors.push({
        path: 'id',
        message: 'Resource ID is required',
        arabicMessage: 'معرف المورد مطلوب',
        severity: 'error'
      })
    }

    if (!resource.meta?.lastUpdated) {
      errors.push({
        path: 'meta.lastUpdated',
        message: 'Last updated timestamp is required',
        arabicMessage: 'طابع زمني لآخر تحديث مطلوب',
        severity: 'warning'
      })
    }

    // Resource-specific validation
    switch (resourceType) {
      case 'Patient':
        if (!resource.name || resource.name.length === 0) {
          errors.push({
            path: 'name',
            message: 'Patient name is required',
            arabicMessage: 'اسم المريض مطلوب',
            severity: 'error'
          })
        }
        break
      case 'MedicationRequest':
        if (!resource.subject) {
          errors.push({
            path: 'subject',
            message: 'Patient reference is required',
            arabicMessage: 'مرجع المريض مطلوب',
            severity: 'error'
          })
        }
        break
    }

    return errors
  }

  private calculateMappingQuality(
    resource: FHIRResource,
    entities: MedicalEntity[],
    errors: FHIRValidationError[]
  ): number {
    let score = 100

    // Deduct for validation errors
    errors.forEach(error => {
      switch (error.severity) {
        case 'error': score -= 20; break
        case 'warning': score -= 10; break
        case 'info': score -= 5; break
      }
    })

    // Deduct for missing entity mappings
    const unmappedEntities = entities.filter(entity => !entity.code)
    score -= unmappedEntities.length * 5

    // Bonus for Saudi extensions
    if (resource.extension && resource.extension.length > 0) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  private createDosageTiming(frequency?: string): any {
    if (!frequency) return undefined

    // Parse common frequency patterns
    if (frequency.includes('daily') || frequency.includes('يومياً')) {
      return {
        repeat: {
          frequency: 1,
          period: 1,
          periodUnit: 'd'
        }
      }
    }

    if (frequency.includes('twice') || frequency.includes('مرتين')) {
      return {
        repeat: {
          frequency: 2,
          period: 1,
          periodUnit: 'd'
        }
      }
    }

    return {
      code: {
        text: frequency
      }
    }
  }

  private parseDosageQuantity(dosage: string): any {
    const match = dosage.match(/(\d+)\s*(mg|g|ml|units?)/i)
    if (match) {
      return {
        value: parseInt(match[1]),
        unit: match[2],
        system: 'http://unitsofmeasure.org',
        code: match[2]
      }
    }
    return {
      value: 1,
      unit: 'dose'
    }
  }

  private extractNumericValue(value: string): { value: number; unit: string } | null {
    const match = value.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z\/]+)?/)
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2] || 'unit'
      }
    }
    return null
  }
}

// Export singleton instance
export const fhirResourceMapper = FHIRResourceMapper.getInstance()