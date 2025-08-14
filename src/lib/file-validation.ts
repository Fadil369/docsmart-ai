/**
 * File Upload Security and Validation System
 * Comprehensive security measures for file handling
 */

export interface FileValidationConfig {
  maxFileSize: number // in bytes
  maxFiles: number
  allowedTypes: string[]
  allowedExtensions: string[]
  scanForMalware?: boolean
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fileInfo: {
    name: string
    size: number
    type: string
    extension: string
  }
}

// Default security configuration
export const DEFAULT_FILE_CONFIG: FileValidationConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp'
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.webp'],
  scanForMalware: true
}

/**
 * Validates a single file against security rules
 */
export function validateFile(file: File, config: FileValidationConfig = DEFAULT_FILE_CONFIG): FileValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: getFileExtension(file.name)
  }

  // 1. File size validation
  if (file.size > config.maxFileSize) {
    errors.push(`File size ${formatBytes(file.size)} exceeds maximum allowed size of ${formatBytes(config.maxFileSize)}`)
  }

  // 2. File type validation (MIME type)
  if (!config.allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`)
  }

  // 3. File extension validation (additional security layer)
  if (!config.allowedExtensions.includes(fileInfo.extension.toLowerCase())) {
    errors.push(`File extension "${fileInfo.extension}" is not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`)
  }

  // 4. Filename security validation
  if (containsSuspiciousContent(file.name)) {
    errors.push('Filename contains suspicious characters or patterns')
  }

  // 5. File structure validation
  if (file.size === 0) {
    errors.push('File is empty')
  }

  // 6. Advanced security checks
  if (isExecutableFile(fileInfo.extension)) {
    errors.push('Executable files are not allowed for security reasons')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo
  }
}

/**
 * Validates multiple files and enforces batch limits
 */
export function validateFiles(files: File[], config: FileValidationConfig = DEFAULT_FILE_CONFIG): {
  validFiles: File[]
  invalidFiles: { file: File; errors: string[] }[]
  globalErrors: string[]
  totalWarnings: string[]
} {
  const globalErrors: string[] = []
  const totalWarnings: string[] = []
  const validFiles: File[] = []
  const invalidFiles: { file: File; errors: string[] }[] = []

  // Check batch limits
  if (files.length > config.maxFiles) {
    globalErrors.push(`Too many files selected. Maximum allowed: ${config.maxFiles}, selected: ${files.length}`)
    return { validFiles: [], invalidFiles: [], globalErrors, totalWarnings }
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file, config)
    
    if (result.isValid) {
      validFiles.push(file)
    } else {
      invalidFiles.push({ file, errors: result.errors })
    }
    
    totalWarnings.push(...result.warnings)
  }

  return { validFiles, invalidFiles, globalErrors, totalWarnings }
}

/**
 * Get file extension safely
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot === -1 ? '' : filename.substring(lastDot)
}

/**
 * Format file size in human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check for suspicious filename content
 */
function containsSuspiciousContent(filename: string): boolean {
  const suspiciousPatterns = [
    /\.\./,           // Path traversal
    /[<>:"|?*]/,      // Invalid Windows filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    /\.(bat|cmd|exe|scr|vbs|js|jar)$/i, // Executable extensions
    /script:|javascript:|data:/i, // Script injections
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(filename))
}

/**
 * Check if file extension indicates executable
 */
function isExecutableFile(extension: string): boolean {
  const executableExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
    '.app', '.deb', '.pkg', '.dmg', '.run', '.sh', '.ps1'
  ]
  return executableExtensions.includes(extension.toLowerCase())
}
