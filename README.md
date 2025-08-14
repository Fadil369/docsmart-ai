# DocSmart AI - Comprehensive Document Processing Platform

A powerful, AI-driven document processing platform that provides comprehensive tools for document analysis, compression, translation, merging, and intelligent insights generation.

## 🚀 Features

### Core Document Processing
- **Multi-format Support**: PDF, Word, Excel, PowerPoint, images, text files, and archives
- **Intelligent Extraction**: Advanced content extraction with OCR capabilities
- **Batch Processing**: Handle multiple documents simultaneously

### AI-Powered Analysis
- **Document Analysis**: Deep content analysis using OpenAI GPT-4o
- **Intelligent Insights**: Generate actionable insights and recommendations
- **Content Summarization**: Automatic document summarization
- **PRD Generation**: Create Product Requirement Documents from analysis

### Document Operations
- **Smart Compression**: Multiple compression methods including Ghostscript
- **Document Merging**: Intelligent merging with customizable options
- **Arabic Translation**: Specialized Arabic translation support
- **Format Conversion**: Convert between different document formats

### Advanced Capabilities
- **OCR Processing**: Extract text from images and scanned documents
- **Metadata Extraction**: Comprehensive document metadata analysis
- **Quality Assessment**: Document quality and readability scoring
- **Error Handling**: Robust error management and recovery

## 🛠 Technology Stack

### Core Technologies
- **React 18** with TypeScript
- **Context API** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling

### Document Processing Libraries
- **pdf-lib**: PDF manipulation and compression
- **mammoth**: Word document processing
- **xlsx**: Excel file handling
- **marked**: Markdown processing
- **tesseract.js**: OCR capabilities
- **sharp**: Image processing

### AI Integration
- **OpenAI GPT-4o**: Document analysis and insights
- **Azure AI Language**: Enhanced translation services
- **GitHub Copilot API**: Additional AI capabilities

### Utility Libraries
- **jszip**: Archive handling
- **papaparse**: CSV processing
- **file-type**: File type detection
- **archiver**: Archive creation
- **compression**: Data compression

## 🏗 Architecture

### Project Structure
```
src/
├── components/
│   ├── documents/
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   └── DocumentViewer.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── ProcessingProgress.tsx
│       ├── ErrorDisplay.tsx
│       └── EnvironmentStatus.tsx
├── contexts/
│   └── DocumentContext.tsx
├── services/
│   └── DocumentProcessor.ts
├── config/
│   └── app.config.ts
├── pages/
│   ├── HomePage.tsx
│   ├── WorkspacePage.tsx
│   ├── AnalyticsPage.tsx
│   └── SettingsPage.tsx
└── App.tsx
```

### Key Components

#### DocumentProcessor Service
The core service handling all document operations:
- Document processing and analysis
- Compression with multiple methods
- Translation services
- Merging capabilities
- AI-powered insights generation

#### DocumentContext
Centralized state management for:
- Document storage and selection
- Processing progress tracking
- Error handling
- Analysis results
- Translation data

#### UI Components
- **ProcessingProgress**: Real-time processing feedback
- **ErrorDisplay**: Comprehensive error reporting
- **EnvironmentStatus**: API configuration validation

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- API keys for desired services (see configuration below)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd docsmart-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Start the development server**
```bash
npm start
```

## ⚙️ Configuration

### Required API Keys
Copy `.env.example` to `.env` and configure:

#### OpenAI (Required for AI features)
```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

#### Azure AI Services (Optional - Enhanced translation)
```env
REACT_APP_AZURE_AI_LANGUAGE_KEY=your_azure_language_key_here
REACT_APP_AZURE_AI_LANGUAGE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
```

#### GitHub (Optional - Copilot integration)
```env
REACT_APP_GITHUB_TOKEN=your_github_token_here
```

### Performance Settings
```env
REACT_APP_MAX_FILE_SIZE=50MB
REACT_APP_MAX_CONCURRENT_PROCESSING=3
REACT_APP_CHUNK_SIZE=1MB
```

### Document Processing Settings
```env
REACT_APP_ENABLE_OCR=true
REACT_APP_COMPRESSION_QUALITY=0.7
REACT_APP_DEFAULT_TARGET_LANGUAGE=ar
```

## 📚 Usage

### Document Upload
1. Navigate to the Workspace page
2. Drag and drop files or click to select
3. Supported formats: PDF, DOCX, XLSX, PPTX, images, text files

### Document Operations

#### Compression
- Select documents and click "Compress"
- Choose compression method: basic, aggressive, or Ghostscript
- Download compressed versions

#### Translation
- Select documents for Arabic translation
- AI-powered translation with context awareness
- Download translated versions

#### Merging
- Select multiple documents
- Configure merge options (format, order, metadata)
- Generate merged document

#### Analysis & Insights
- AI-powered document analysis
- Generate insights and recommendations
- Create Product Requirement Documents (PRDs)

### Batch Operations
- Select multiple documents using checkboxes
- Apply operations to all selected documents
- Track progress with real-time updates

## 🔧 Advanced Features

### OCR Processing
Automatic text extraction from:
- Scanned documents
- Images with text
- PDF files with embedded images

### Compression Methods
1. **Basic**: Standard compression algorithms
2. **Aggressive**: Maximum compression with quality trade-offs
3. **Ghostscript**: Professional PDF compression

### AI Analysis Types
- **Content Analysis**: Structure, topics, key points
- **Quality Assessment**: Readability, completeness
- **Insight Generation**: Actionable recommendations
- **PRD Creation**: Product requirement documentation

### Error Handling
- Comprehensive error tracking
- User-friendly error messages
- Automatic retry mechanisms
- Graceful degradation

## 🧪 Development

### Adding New Document Types
1. Update `supportedFormats` in `app.config.ts`
2. Add processing logic in `DocumentProcessor.extractContent()`
3. Handle format-specific operations

### Extending AI Capabilities
1. Add new analysis types in `DocumentProcessor.analyzeDocument()`
2. Update the analysis interface types
3. Implement UI components for new features

### Custom Compression Methods
1. Implement compression logic in `DocumentProcessor.compressDocument()`
2. Add configuration options
3. Update UI controls

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all required environment variables are set in your deployment environment.

### Performance Optimization
- Enable compression in your web server
- Configure CDN for static assets
- Set up monitoring for API usage

## 📊 Monitoring

### Built-in Monitoring
- Processing progress tracking
- Error reporting and logging
- Performance metrics collection

### External Monitoring
- API usage tracking
- Document processing analytics
- User interaction metrics

## 🔒 Security

### API Key Management
- Environment variable isolation
- Client-side key validation
- Secure transmission protocols

### Data Privacy
- No server-side storage
- Client-side processing
- Secure API communications

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- Azure AI Services team
- All open-source library contributors
- React and TypeScript communities

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review configuration examples

---

**Built with ❤️ using React, TypeScript, and AI**
