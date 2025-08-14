/**
 * Wasfaty Connector for Phase 2
 * Integration with Saudi Arabia's national e-prescription system
 */

import { MedicalEntity, HealthcareDocument } from '@/types/healthcare'
import { spark } from '@/lib/mock-spark'

export interface WasfatyPrescription {
  id: string
  prescriptionNumber: string
  patientId: string
  patientName: string
  patientNameArabic: string
  doctorId: string
  doctorName: string
  doctorNameArabic: string
  facilityId: string
  facilityName: string
  facilityNameArabic: string
  issueDate: string
  expiryDate: string
  medications: WasfatyMedication[]
  status: 'active' | 'dispensed' | 'cancelled' | 'expired'
  qrCode: string
  digitalSignature: string
  language: 'ar' | 'en' | 'bilingual'
}

export interface WasfatyMedication {
  id: string
  name: string
  nameArabic: string
  genericName: string
  genericNameArabic: string
  strength: string
  dosageForm: string
  dosageFormArabic: string
  quantity: number
  unit: string
  unitArabic: string
  instructions: string
  instructionsArabic: string
  frequency: string
  frequencyArabic: string
  duration: string
  durationArabic: string
  substitutionAllowed: boolean
  controlledSubstance: boolean
  sfdaCode: string
  nphiesCode?: string
  price?: number
  insurance?: {
    covered: boolean
    copayAmount: number
    copayPercentage: number
  }
}

export interface WasfatyDispensing {
  prescriptionId: string
  pharmacyId: string
  pharmacyName: string
  pharmacyNameArabic: string
  pharmacistId: string
  pharmacistName: string
  dispensedMedications: {
    medicationId: string
    dispensedQuantity: number
    batchNumber: string
    expiryDate: string
    substitution?: {
      originalMedicationId: string
      reason: string
      reasonArabic: string
    }
  }[]
  dispensingDate: string
  totalAmount: number
  patientSignature?: string
  pharmacistNotes?: string
  pharmacistNotesArabic?: string
}

export class WasfatyConnector {
  private static instance: WasfatyConnector
  private apiEndpoint: string
  private apiKey: string
  private isInitialized = false

  private constructor() {
    this.apiEndpoint = process.env.WASFATY_API_ENDPOINT || 'https://api.wasfaty.sa'
    this.apiKey = process.env.WASFATY_API_KEY || ''
  }

  static getInstance(): WasfatyConnector {
    if (!WasfatyConnector.instance) {
      WasfatyConnector.instance = new WasfatyConnector()
    }
    return WasfatyConnector.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // In production, this would validate API connection and credentials
      console.log('Initializing Wasfaty Connector...')
      this.isInitialized = true
    } catch (error) {
      console.error('Wasfaty initialization failed:', error)
      throw new Error('Failed to initialize Wasfaty connector')
    }
  }

  /**
   * Create digital prescription in Wasfaty system
   */
  async createPrescription(
    patientData: any,
    doctorData: any,
    facilityData: any,
    medications: MedicalEntity[],
    language: 'ar' | 'en' | 'bilingual' = 'bilingual'
  ): Promise<WasfatyPrescription> {
    await this.initialize()

    try {
      // Convert medical entities to Wasfaty medications
      const wasfatyMedications = await this.convertToWasfatyMedications(medications)

      // Generate prescription
      const prescription: WasfatyPrescription = {
        id: `WF-${Date.now()}`,
        prescriptionNumber: this.generatePrescriptionNumber(),
        patientId: patientData.id || '',
        patientName: patientData.name || '',
        patientNameArabic: patientData.nameArabic || patientData.name || '',
        doctorId: doctorData.id || '',
        doctorName: doctorData.name || '',
        doctorNameArabic: doctorData.nameArabic || doctorData.name || '',
        facilityId: facilityData.id || '',
        facilityName: facilityData.name || '',
        facilityNameArabic: facilityData.nameArabic || facilityData.name || '',
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        medications: wasfatyMedications,
        status: 'active',
        qrCode: await this.generateQRCode(wasfatyMedications),
        digitalSignature: await this.generateDigitalSignature(doctorData, wasfatyMedications),
        language
      }

      // Submit to Wasfaty system (mock)
      console.log('Creating Wasfaty prescription:', prescription)

      return prescription
    } catch (error) {
      console.error('Prescription creation failed:', error)
      throw new Error('Failed to create Wasfaty prescription')
    }
  }

  /**
   * Verify prescription authenticity
   */
  async verifyPrescription(prescriptionId: string): Promise<{
    valid: boolean
    prescription?: WasfatyPrescription
    errors?: string[]
  }> {
    await this.initialize()

    try {
      // Mock verification
      const isValid = Math.random() > 0.1 // 90% success rate for demo

      if (isValid) {
        const prescription = await this.getPrescription(prescriptionId)
        return { valid: true, prescription }
      } else {
        return {
          valid: false,
          errors: ['Prescription not found', 'وصفة غير موجودة']
        }
      }
    } catch (error) {
      console.error('Prescription verification failed:', error)
      return {
        valid: false,
        errors: ['Verification service unavailable', 'خدمة التحقق غير متاحة']
      }
    }
  }

  /**
   * Get prescription details by ID
   */
  async getPrescription(prescriptionId: string): Promise<WasfatyPrescription> {
    await this.initialize()

    try {
      // Mock implementation - in production, this would fetch from Wasfaty API
      const prescription: WasfatyPrescription = {
        id: prescriptionId,
        prescriptionNumber: 'WF-2024-001234',
        patientId: 'PAT-123',
        patientName: 'Ahmed Al-Rashid',
        patientNameArabic: 'أحمد الراشد',
        doctorId: 'DOC-456',
        doctorName: 'Dr. Sarah Al-Zahra',
        doctorNameArabic: 'د. سارة الزهراء',
        facilityId: 'FAC-789',
        facilityName: 'King Fahad Hospital',
        facilityNameArabic: 'مستشفى الملك فهد',
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        medications: [
          {
            id: 'MED-001',
            name: 'Paracetamol 500mg Tablets',
            nameArabic: 'باراسيتامول 500 مج أقراص',
            genericName: 'Paracetamol',
            genericNameArabic: 'باراسيتامول',
            strength: '500mg',
            dosageForm: 'Tablet',
            dosageFormArabic: 'قرص',
            quantity: 20,
            unit: 'Tablets',
            unitArabic: 'أقراص',
            instructions: 'Take one tablet every 6 hours as needed for pain',
            instructionsArabic: 'تناول قرص واحد كل 6 ساعات حسب الحاجة للألم',
            frequency: 'Every 6 hours',
            frequencyArabic: 'كل 6 ساعات',
            duration: '5 days',
            durationArabic: '5 أيام',
            substitutionAllowed: true,
            controlledSubstance: false,
            sfdaCode: 'SFDA-PAR-500',
            nphiesCode: 'NPH-PAR-001',
            price: 15.50,
            insurance: {
              covered: true,
              copayAmount: 5.00,
              copayPercentage: 10
            }
          }
        ],
        status: 'active',
        qrCode: 'QR123456789',
        digitalSignature: 'DS_ABC123XYZ',
        language: 'bilingual'
      }

      return prescription
    } catch (error) {
      console.error('Failed to get prescription:', error)
      throw new Error('Failed to retrieve prescription')
    }
  }

  /**
   * Record medication dispensing
   */
  async recordDispensing(
    prescriptionId: string,
    pharmacyData: any,
    pharmacistData: any,
    dispensedMedications: any[]
  ): Promise<WasfatyDispensing> {
    await this.initialize()

    try {
      const dispensing: WasfatyDispensing = {
        prescriptionId,
        pharmacyId: pharmacyData.id || '',
        pharmacyName: pharmacyData.name || '',
        pharmacyNameArabic: pharmacyData.nameArabic || pharmacyData.name || '',
        pharmacistId: pharmacistData.id || '',
        pharmacistName: pharmacistData.name || '',
        dispensedMedications: dispensedMedications.map(med => ({
          medicationId: med.id,
          dispensedQuantity: med.quantity,
          batchNumber: med.batchNumber || `B${Date.now()}`,
          expiryDate: med.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          substitution: med.substitution
        })),
        dispensingDate: new Date().toISOString(),
        totalAmount: this.calculateTotalAmount(dispensedMedications),
        pharmacistNotes: pharmacyData.notes,
        pharmacistNotesArabic: pharmacyData.notesArabic
      }

      // Update prescription status if fully dispensed
      await this.updatePrescriptionStatus(prescriptionId, 'dispensed')

      console.log('Recording Wasfaty dispensing:', dispensing)
      return dispensing
    } catch (error) {
      console.error('Dispensing recording failed:', error)
      throw new Error('Failed to record medication dispensing')
    }
  }

  /**
   * Cancel prescription
   */
  async cancelPrescription(
    prescriptionId: string,
    reason: string,
    reasonArabic: string
  ): Promise<void> {
    await this.initialize()

    try {
      await this.updatePrescriptionStatus(prescriptionId, 'cancelled')
      console.log(`Prescription ${prescriptionId} cancelled: ${reason}`)
    } catch (error) {
      console.error('Prescription cancellation failed:', error)
      throw new Error('Failed to cancel prescription')
    }
  }

  /**
   * Check medication availability in Saudi pharmacies
   */
  async checkMedicationAvailability(
    sfdaCode: string,
    city?: string
  ): Promise<{
    available: boolean
    pharmacies: {
      id: string
      name: string
      nameArabic: string
      address: string
      addressArabic: string
      phone: string
      distance?: number
      stock: number
      price: number
    }[]
  }> {
    await this.initialize()

    try {
      // Mock implementation
      const mockPharmacies = [
        {
          id: 'PHARM-001',
          name: 'Al-Nahdi Pharmacy',
          nameArabic: 'صيدلية النهدي',
          address: '123 King Abdulaziz Street, Riyadh',
          addressArabic: '123 شارع الملك عبدالعزيز، الرياض',
          phone: '+966-11-1234567',
          distance: 2.5,
          stock: 50,
          price: 15.50
        },
        {
          id: 'PHARM-002',
          name: 'Seif Pharmacy',
          nameArabic: 'صيدلية صيف',
          address: '456 Olaya Street, Riyadh',
          addressArabic: '456 شارع العليا، الرياض',
          phone: '+966-11-2345678',
          distance: 1.8,
          stock: 25,
          price: 14.75
        }
      ]

      return {
        available: true,
        pharmacies: mockPharmacies
      }
    } catch (error) {
      console.error('Medication availability check failed:', error)
      return {
        available: false,
        pharmacies: []
      }
    }
  }

  // Private helper methods
  private async convertToWasfatyMedications(entities: MedicalEntity[]): Promise<WasfatyMedication[]> {
    const medications = entities.filter(entity => entity.type === 'medication')
    
    return Promise.all(medications.map(async (entity, index) => {
      // Extract dosage and frequency from nearby entities
      const dosage = entities.find(e => e.type === 'dosage' && 
        Math.abs(e.position.start - entity.position.end) < 50)
      const frequency = entities.find(e => e.type === 'frequency' && 
        Math.abs(e.position.start - entity.position.end) < 100)

      return {
        id: `MED-${Date.now()}-${index}`,
        name: entity.value,
        nameArabic: entity.arabicTranslation || entity.value,
        genericName: await this.getGenericName(entity.value),
        genericNameArabic: await this.getGenericNameArabic(entity.value),
        strength: dosage?.value || '500mg',
        dosageForm: 'Tablet',
        dosageFormArabic: 'قرص',
        quantity: this.extractQuantity(entity.value) || 30,
        unit: 'Tablets',
        unitArabic: 'أقراص',
        instructions: this.generateInstructions(dosage?.value, frequency?.value),
        instructionsArabic: this.generateInstructionsArabic(dosage?.value, frequency?.value),
        frequency: frequency?.value || 'Twice daily',
        frequencyArabic: frequency?.arabicTranslation || 'مرتين يومياً',
        duration: '7 days',
        durationArabic: '7 أيام',
        substitutionAllowed: true,
        controlledSubstance: this.isControlledSubstance(entity.value),
        sfdaCode: entity.code?.code || `SFDA-${Math.random().toString(36).substr(2, 9)}`,
        nphiesCode: entity.code?.code,
        price: Math.random() * 100 + 10, // Random price for demo
        insurance: {
          covered: true,
          copayAmount: 5.00,
          copayPercentage: 10
        }
      }
    }))
  }

  private generatePrescriptionNumber(): string {
    const year = new Date().getFullYear()
    const sequence = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
    return `WF-${year}-${sequence}`
  }

  private async generateQRCode(medications: WasfatyMedication[]): Promise<string> {
    // In production, this would generate a proper QR code
    return `QR_${Date.now()}_${medications.length}_MED`
  }

  private async generateDigitalSignature(doctorData: any, medications: WasfatyMedication[]): Promise<string> {
    // In production, this would use proper digital signature
    return `DS_${doctorData.id}_${Date.now()}_${medications.length}`
  }

  private async updatePrescriptionStatus(prescriptionId: string, status: string): Promise<void> {
    console.log(`Updating prescription ${prescriptionId} status to ${status}`)
  }

  private calculateTotalAmount(medications: any[]): number {
    return medications.reduce((total, med) => total + (med.price || 0) * (med.quantity || 1), 0)
  }

  private async getGenericName(brandName: string): Promise<string> {
    // Mock implementation - in production, would look up in drug database
    const genericMap: Record<string, string> = {
      'Panadol': 'Paracetamol',
      'Brufen': 'Ibuprofen',
      'Voltaren': 'Diclofenac'
    }
    return genericMap[brandName] || brandName
  }

  private async getGenericNameArabic(brandName: string): Promise<string> {
    // Mock implementation
    const arabicMap: Record<string, string> = {
      'Panadol': 'باراسيتامول',
      'Brufen': 'إيبوبروفين',
      'Voltaren': 'ديكلوفيناك'
    }
    return arabicMap[brandName] || brandName
  }

  private extractQuantity(medicationText: string): number {
    const match = medicationText.match(/(\d+)\s*(tablets?|pills?|capsules?)/i)
    return match ? parseInt(match[1]) : 30
  }

  private generateInstructions(dosage?: string, frequency?: string): string {
    return `Take ${dosage || 'as prescribed'} ${frequency || 'as directed'}`
  }

  private generateInstructionsArabic(dosage?: string, frequency?: string): string {
    return `تناول ${dosage || 'حسب الوصفة'} ${frequency || 'حسب التوجيه'}`
  }

  private isControlledSubstance(medicationName: string): boolean {
    const controlled = ['tramadol', 'codeine', 'morphine', 'oxycodone']
    return controlled.some(drug => medicationName.toLowerCase().includes(drug))
  }
}

// Export singleton instance
export const wasfatyConnector = WasfatyConnector.getInstance()