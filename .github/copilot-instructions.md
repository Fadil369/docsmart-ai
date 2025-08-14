# Copilot Instructions for BrainSAIT DocSmart AI

## Project Context
BrainSAIT DocSmart AI is a healthcare document intelligence platform designed for the Saudi healthcare market with Arabic-first design and comprehensive healthcare compliance.

## Development Guidelines

### Code Style
- Use TypeScript for all new components
- Follow React functional components with hooks
- Implement responsive design with Tailwind CSS
- Ensure RTL (right-to-left) support for Arabic content
- Use proper Arabic font rendering (Noto Sans Arabic)

### Healthcare-Specific Requirements
- All medical data must be FHIR-compliant
- Implement proper Arabic medical terminology processing
- Ensure Saudi MOH compliance for all healthcare features
- Include PDPL (Personal Data Protection Law) compliance
- Support bilingual interfaces (Arabic/English)

### API Standards
- Use RESTful API design principles
- Implement proper error handling with Arabic error messages
- Include comprehensive input validation
- Support both Arabic and English content processing
- Maintain backward compatibility with existing features

### Security Considerations
- Encrypt all healthcare data at rest and in transit
- Implement proper authentication and authorization
- Add audit trails for all healthcare document processing
- Ensure patient data privacy compliance
- Use secure API endpoints for healthcare integrations

### Arabic Language Support
- Primary language: Arabic (RTL layout)
- Secondary language: English (LTR layout)
- Voice commands: Support Arabic medical terminology
- Text processing: Handle Arabic medical terms correctly
- UI components: Design for both RTL and LTR layouts

### Integration Requirements
- NPHIES (National Platform for Health Information Exchange)
- Wasfaty (Saudi e-prescription platform)
- FHIR R4 standard compliance
- Saudi MOH data standards
- Sehhaty/Mawid integration readiness

### Performance Standards
- Arabic OCR processing: <3 seconds per page
- Voice command response: <500ms
- Document classification: >90% accuracy
- System uptime: 99.9% availability
- Mobile responsiveness: Support down to 375px viewport

### Testing Requirements
- Unit tests for all Arabic text processing
- Integration tests for healthcare APIs
- Performance tests for OCR pipeline
- Accessibility tests (WCAG 2.1 AA)
- Cross-browser testing including Arabic rendering

## Priority Features for Implementation
1. Arabic OCR document processing
2. Voice commands in Arabic for healthcare workflows
3. Smart forms with auto-population
4. Clinical decision support system
5. FHIR-compliant data export
6. Saudi healthcare compliance validation

## When Adding New Features
1. Ensure bilingual support (Arabic/English)
2. Test with both RTL and LTR layouts
3. Validate against healthcare compliance requirements
4. Include proper error handling with localized messages
5. Add comprehensive documentation
6. Implement proper accessibility features
7. Test voice commands with Arabic medical terminology

Remember: This is a healthcare platform serving Arabic-speaking medical professionals in Saudi Arabia. Every feature should be designed with Arabic-first principles and healthcare compliance as primary considerations.
