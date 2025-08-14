export const APP_CONFIG = {
  // API Configuration
  apis: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      models: {
        chat: 'gpt-4o',
        embedding: 'text-embedding-3-large',
        whisper: 'whisper-1',
        tts: 'tts-1-hd'
      }
    },
    azure: {
      textAnalytics: {
        key: process.env.AZURE_TEXT_ANALYTICS_KEY || '',
        endpoint: process.env.AZURE_TEXT_ANALYTICS_ENDPOINT || ''
      },
      translator: {
        key: process.env.AZURE_TRANSLATOR_KEY || '',
        endpoint: process.env.AZURE_TRANSLATOR_ENDPOINT || '',
        region: process.env.AZURE_TRANSLATOR_REGION || 'global'
      }
    },
    github: {
      copilotApiKey: process.env.GITHUB_COPILOT_API_KEY || '',
      token: process.env.GITHUB_TOKEN || ''
    }
  },

  // Document Processing Configuration
  documents: {
    // File size limits (in bytes)
    maxFileSize: {
      pdf: 50 * 1024 * 1024, // 50MB
      office: 25 * 1024 * 1024, // 25MB
      image: 10 * 1024 * 1024, // 10MB
      text: 5 * 1024 * 1024, // 5MB
      default: 10 * 1024 * 1024 // 10MB
    },

    // Supported formats
    supportedFormats: {
      pdf: ['.pdf'],
      office: ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'],
      text: ['.txt', '.md', '.csv', '.json', '.xml', '.html'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
      archive: ['.zip', '.rar', '.7z', '.tar', '.gz']
    },

    // Compression settings
    compression: {
      pdf: {
        quality: 85,
        ghostscriptOptions: [
          '-sDEVICE=pdfwrite',
          '-dCompatibilityLevel=1.4',
          '-dPDFSETTINGS=/ebook',
          '-dNOPAUSE',
          '-dQUIET',
          '-dBATCH'
        ]
      },
      image: {
        quality: 80,
        format: 'jpeg'
      }
    },

    // OCR settings
    ocr: {
      language: 'eng+ara', // English + Arabic
      options: {
        logger: m => {} // Silent logging
      }
    }
  },

  // AI Analysis Configuration
  analysis: {
    chunkSize: 4000, // For text splitting
    overlap: 200, // Overlap between chunks
    languages: {
      primary: 'en',
      supported: ['en', 'ar', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
    },
    translation: {
      targetLanguage: 'ar', // Arabic as default target
      batchSize: 100 // Number of text segments per batch
    }
  },

  // Performance Settings
  performance: {
    worker: {
      enabled: true,
      maxConcurrentTasks: 4
    },
    caching: {
      enabled: true,
      ttl: 3600000 // 1 hour in milliseconds
    },
    retry: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000
    }
  },

  // Security Settings
  security: {
    sanitization: {
      enabled: true,
      allowedTags: [], // No HTML tags allowed by default
      allowedAttributes: {}
    },
    encryption: {
      enabled: false, // Enable for sensitive documents
      algorithm: 'aes-256-gcm'
    }
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    },
    animations: {
      duration: 200,
      easing: 'ease-in-out'
    },
    notifications: {
      duration: 5000,
      position: 'top-right'
    }
  }
} as const;

// Environment validation
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const requiredEnvVars = [
    'OPENAI_API_KEY'
  ];

  const optionalEnvVars = [
    'AZURE_TEXT_ANALYTICS_KEY',
    'AZURE_TRANSLATOR_KEY',
    'GITHUB_COPILOT_API_KEY'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// Type definitions for configuration
export type ApiConfig = typeof APP_CONFIG.apis;
export type DocumentConfig = typeof APP_CONFIG.documents;
export type AnalysisConfig = typeof APP_CONFIG.analysis;
export type PerformanceConfig = typeof APP_CONFIG.performance;
