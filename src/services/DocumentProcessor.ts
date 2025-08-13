import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { marked } from 'marked';
import TurndownService from 'turndown';
import * as Papa from 'papaparse';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import OpenAI from 'openai';
import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics';
import axios from 'axios';
import { franc } from 'franc';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { APP_CONFIG } from '../config/app.config';

// Types for document processing
export interface ProcessedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  metadata: {
    pages?: number;
    words: number;
    characters: number;
    language?: string;
    extractedAt: Date;
    processingTime: number;
  };
  originalFile?: File;
  thumbnailUrl?: string;
}

export interface DocumentAnalysis {
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral';
    confidence: number;
    scores: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  keyPhrases: string[];
  entities: Array<{
    text: string;
    category: string;
    confidence: number;
  }>;
  language: {
    name: string;
    iso: string;
    confidence: number;
  };
  summary: string;
  topics: string[];
  readabilityScore?: number;
}

export interface DocumentTranslation {
  originalLanguage: string;
  targetLanguage: string;
  translatedContent: string;
  confidence: number;
  translatedAt: Date;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  method: string;
  compressedData: Uint8Array;
  processingTime: number;
}

export interface MergeOptions {
  outputFormat: 'pdf' | 'docx' | 'txt' | 'md';
  includeMetadata: boolean;
  addPageBreaks: boolean;
  title?: string;
  author?: string;
}

class DocumentProcessor {
  private openai: OpenAI | null = null;
  private azureAnalytics: TextAnalyticsClient | null = null;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize OpenAI
    if (APP_CONFIG.apis.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: APP_CONFIG.apis.openai.apiKey,
        dangerouslyAllowBrowser: true
      });
    }

    // Initialize Azure Text Analytics
    if (APP_CONFIG.apis.azure.languageKey && APP_CONFIG.apis.azure.languageEndpoint) {
      this.azureAnalytics = new TextAnalyticsClient(
        APP_CONFIG.apis.azure.languageEndpoint,
        new AzureKeyCredential(APP_CONFIG.apis.azure.languageKey)
      );
    }
  }

  // Main document processing method
  async processDocument(file: File): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      const content = await this.extractContent(file);
      const words = this.countWords(content);
      const characters = content.length;
      const language = this.detectLanguage(content);
      
      const processedDoc: ProcessedDocument = {
        id: this.generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        content,
        metadata: {
          words,
          characters,
          language,
          extractedAt: new Date(),
          processingTime: Date.now() - startTime
        },
        originalFile: file
      };

      // Generate thumbnail for supported formats
      if (file.type.startsWith('image/')) {
        processedDoc.thumbnailUrl = await this.generateImageThumbnail(file);
      }

      return processedDoc;
    } catch (error) {
      throw new Error(`Failed to process document ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Content extraction methods
  private async extractContent(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return this.extractPDFContent(file);
    } else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return this.extractWordContent(file);
    } else if (fileType.includes('sheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return this.extractExcelContent(file);
    } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
      return this.extractTextContent(file);
    } else if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
      return this.extractMarkdownContent(file);
    } else if (fileName.endsWith('.csv')) {
      return this.extractCSVContent(file);
    } else if (fileType.includes('image/')) {
      return this.extractImageContent(file);
    } else {
      // Try to read as text for unknown formats
      return this.extractTextContent(file);
    }
  }

  private async extractPDFContent(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      let content = '';
      for (let i = 0; i < pages.length; i++) {
        // For now, we'll return basic info. In a real implementation,
        // you'd use a proper PDF text extraction library
        content += `Page ${i + 1}\n`;
      }
      
      return content || 'PDF content could not be extracted';
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async extractWordContent(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error(`Word document extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async extractExcelContent(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let content = '';
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        content += `Sheet: ${sheetName}\n`;
        content += XLSX.utils.sheet_to_txt(worksheet);
        content += '\n\n';
      });
      
      return content;
    } catch (error) {
      throw new Error(`Excel extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async extractTextContent(file: File): Promise<string> {
    try {
      return await file.text();
    } catch (error) {
      throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async extractMarkdownContent(file: File): Promise<string> {
    try {
      const markdownText = await file.text();
      // Convert to HTML first, then to plain text for content analysis
      const html = marked(markdownText);
      const dom = new JSDOM(html);
      return dom.window.document.body.textContent || markdownText;
    } catch (error) {
      return await this.extractTextContent(file);
    }
  }

  private async extractCSVContent(file: File): Promise<string> {
    try {
      const csvText = await file.text();
      const parsed = Papa.parse(csvText, { header: true });
      
      let content = 'CSV Data:\n';
      if (parsed.data && Array.isArray(parsed.data)) {
        content += `Rows: ${parsed.data.length}\n`;
        if (parsed.data.length > 0) {
          const firstRow = parsed.data[0] as any;
          content += `Columns: ${Object.keys(firstRow).join(', ')}\n\n`;
          content += csvText;
        }
      }
      
      return content;
    } catch (error) {
      return await this.extractTextContent(file);
    }
  }

  private async extractImageContent(file: File): Promise<string> {
    if (!APP_CONFIG.documents.ocr.enabled) {
      return `Image file: ${file.name} (OCR disabled)`;
    }

    try {
      const result = await Tesseract.recognize(file, 'eng+ara', {
        logger: m => console.log(m)
      });
      
      return result.data.text || `Image file: ${file.name} (no text detected)`;
    } catch (error) {
      console.warn('OCR failed:', error);
      return `Image file: ${file.name} (OCR failed)`;
    }
  }

  // Compression methods
  async compressDocument(document: ProcessedDocument, method: 'ghostscript' | 'basic' | 'aggressive' = 'basic'): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      let compressedData: Uint8Array;
      
      switch (method) {
        case 'ghostscript':
          compressedData = await this.ghostscriptCompress(document);
          break;
        case 'aggressive':
          compressedData = await this.aggressiveCompress(document);
          break;
        default:
          compressedData = await this.basicCompress(document);
      }
      
      return {
        originalSize: document.size,
        compressedSize: compressedData.length,
        compressionRatio: (1 - compressedData.length / document.size) * 100,
        method,
        compressedData,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Compression failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async basicCompress(document: ProcessedDocument): Promise<Uint8Array> {
    // Basic text compression using simple algorithms
    const compressed = this.compressText(document.content);
    return new TextEncoder().encode(compressed);
  }

  private async aggressiveCompress(document: ProcessedDocument): Promise<Uint8Array> {
    // More aggressive compression
    let compressed = document.content;
    
    // Remove extra whitespace
    compressed = compressed.replace(/\s+/g, ' ');
    // Remove empty lines
    compressed = compressed.replace(/\n\s*\n/g, '\n');
    
    return new TextEncoder().encode(this.compressText(compressed));
  }

  private async ghostscriptCompress(document: ProcessedDocument): Promise<Uint8Array> {
    // For now, use basic compression as Ghostscript would need server-side processing
    console.warn('Ghostscript compression not available in browser environment');
    return this.basicCompress(document);
  }

  private compressText(text: string): string {
    // Simple text compression (in real implementation, use proper compression algorithms)
    return text
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Merge documents
  async mergeDocuments(documents: ProcessedDocument[], options: MergeOptions = {
    outputFormat: 'pdf',
    includeMetadata: true,
    addPageBreaks: true
  }): Promise<ProcessedDocument> {
    try {
      const mergedContent = this.mergeContent(documents, options);
      const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
      const totalWords = documents.reduce((sum, doc) => sum + doc.metadata.words, 0);
      
      const mergedDoc: ProcessedDocument = {
        id: this.generateId(),
        name: options.title || `Merged_Document_${new Date().toISOString().split('T')[0]}.${options.outputFormat}`,
        type: this.getTypeFromFormat(options.outputFormat),
        size: totalSize,
        content: mergedContent,
        metadata: {
          words: totalWords,
          characters: mergedContent.length,
          extractedAt: new Date(),
          processingTime: 0,
          pages: documents.length
        }
      };
      
      return mergedDoc;
    } catch (error) {
      throw new Error(`Document merge failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private mergeContent(documents: ProcessedDocument[], options: MergeOptions): string {
    let merged = '';
    
    if (options.includeMetadata && options.title) {
      merged += `# ${options.title}\n\n`;
    }
    
    documents.forEach((doc, index) => {
      if (options.includeMetadata) {
        merged += `## Document ${index + 1}: ${doc.name}\n`;
        merged += `- Type: ${doc.type}\n`;
        merged += `- Size: ${this.formatFileSize(doc.size)}\n`;
        merged += `- Words: ${doc.metadata.words}\n\n`;
      }
      
      merged += doc.content;
      
      if (options.addPageBreaks && index < documents.length - 1) {
        merged += '\n\n---\n\n';
      }
    });
    
    return merged;
  }

  // Document analysis
  async analyzeDocument(document: ProcessedDocument): Promise<DocumentAnalysis> {
    try {
      const analysis: DocumentAnalysis = {
        sentiment: await this.analyzeSentiment(document.content),
        keyPhrases: await this.extractKeyPhrases(document.content),
        entities: await this.extractEntities(document.content),
        language: this.detectLanguageDetailed(document.content),
        summary: await this.generateSummary(document.content),
        topics: await this.extractTopics(document.content),
        readabilityScore: this.calculateReadabilityScore(document.content)
      };
      
      return analysis;
    } catch (error) {
      throw new Error(`Document analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async analyzeSentiment(content: string): Promise<DocumentAnalysis['sentiment']> {
    if (this.azureAnalytics) {
      try {
        const results = await this.azureAnalytics.analyzeSentiment([content]);
        const result = results[0];
        
        if (!result.error) {
          return {
            overall: result.sentiment as 'positive' | 'negative' | 'neutral',
            confidence: result.confidenceScores.positive + result.confidenceScores.negative + result.confidenceScores.neutral,
            scores: {
              positive: result.confidenceScores.positive,
              negative: result.confidenceScores.negative,
              neutral: result.confidenceScores.neutral
            }
          };
        }
      } catch (error) {
        console.warn('Azure sentiment analysis failed:', error);
      }
    }
    
    // Fallback to basic sentiment analysis
    return this.basicSentimentAnalysis(content);
  }

  private basicSentimentAnalysis(content: string): DocumentAnalysis['sentiment'] {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'happy', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'negative', 'sad', 'angry', 'disappointed'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    const total = positiveCount + negativeCount;
    if (total === 0) {
      return {
        overall: 'neutral',
        confidence: 0.5,
        scores: { positive: 0.33, negative: 0.33, neutral: 0.34 }
      };
    }
    
    const positiveScore = positiveCount / total;
    const negativeScore = negativeCount / total;
    const neutralScore = 1 - positiveScore - negativeScore;
    
    let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveScore > negativeScore && positiveScore > 0.4) overall = 'positive';
    else if (negativeScore > positiveScore && negativeScore > 0.4) overall = 'negative';
    
    return {
      overall,
      confidence: Math.max(positiveScore, negativeScore, neutralScore),
      scores: {
        positive: positiveScore,
        negative: negativeScore,
        neutral: neutralScore
      }
    };
  }

  private async extractKeyPhrases(content: string): Promise<string[]> {
    if (this.azureAnalytics) {
      try {
        const results = await this.azureAnalytics.extractKeyPhrases([content]);
        const result = results[0];
        
        if (!result.error) {
          return result.keyPhrases;
        }
      } catch (error) {
        console.warn('Azure key phrase extraction failed:', error);
      }
    }
    
    // Fallback to basic key phrase extraction
    return this.basicKeyPhraseExtraction(content);
  }

  private basicKeyPhraseExtraction(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private async extractEntities(content: string): Promise<DocumentAnalysis['entities']> {
    if (this.azureAnalytics) {
      try {
        const results = await this.azureAnalytics.recognizeEntities([content]);
        const result = results[0];
        
        if (!result.error) {
          return result.entities.map(entity => ({
            text: entity.text,
            category: entity.category,
            confidence: entity.confidenceScore
          }));
        }
      } catch (error) {
        console.warn('Azure entity recognition failed:', error);
      }
    }
    
    // Fallback to basic entity recognition
    return this.basicEntityRecognition(content);
  }

  private basicEntityRecognition(content: string): DocumentAnalysis['entities'] {
    const entities: DocumentAnalysis['entities'] = [];
    
    // Simple pattern matching for basic entities
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phonePattern = /\b\d{3}-\d{3}-\d{4}\b/g;
    const urlPattern = /https?:\/\/[^\s]+/g;
    
    const emails = content.match(emailPattern) || [];
    const phones = content.match(phonePattern) || [];
    const urls = content.match(urlPattern) || [];
    
    emails.forEach(email => entities.push({ text: email, category: 'Email', confidence: 0.9 }));
    phones.forEach(phone => entities.push({ text: phone, category: 'PhoneNumber', confidence: 0.9 }));
    urls.forEach(url => entities.push({ text: url, category: 'URL', confidence: 0.9 }));
    
    return entities;
  }

  private detectLanguage(content: string): string {
    try {
      const langCode = franc(content);
      return langCode === 'und' ? 'en' : langCode;
    } catch {
      return 'en';
    }
  }

  private detectLanguageDetailed(content: string): DocumentAnalysis['language'] {
    try {
      const langCode = franc(content);
      const langNames: { [key: string]: string } = {
        'en': 'English',
        'ar': 'Arabic',
        'fr': 'French',
        'es': 'Spanish',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ru': 'Russian',
        'pt': 'Portuguese',
        'it': 'Italian',
        'und': 'Unknown'
      };
      
      return {
        name: langNames[langCode] || 'Unknown',
        iso: langCode === 'und' ? 'en' : langCode,
        confidence: langCode === 'und' ? 0.1 : 0.8
      };
    } catch {
      return {
        name: 'English',
        iso: 'en',
        confidence: 0.1
      };
    }
  }

  private async generateSummary(content: string): Promise<string> {
    if (this.openai && content.length > 500) {
      try {
        const response = await this.openai.chat.completions.create({
          model: APP_CONFIG.apis.openai.model,
          messages: [
            {
              role: 'user',
              content: `Please provide a concise summary of the following text in 2-3 sentences:\n\n${content.substring(0, 4000)}`
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        });
        
        return response.choices[0]?.message?.content || this.extractiveSummary(content);
      } catch (error) {
        console.warn('OpenAI summarization failed:', error);
      }
    }
    
    return this.extractiveSummary(content);
  }

  private extractiveSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length <= 3) return content;
    
    // Simple extractive summarization: take first, middle, and last sentences
    const summary = [
      sentences[0]?.trim(),
      sentences[Math.floor(sentences.length / 2)]?.trim(),
      sentences[sentences.length - 1]?.trim()
    ].filter(Boolean).join('. ');
    
    return summary + '.';
  }

  private async extractTopics(content: string): Promise<string[]> {
    // Simple topic extraction based on word frequency and importance
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'out', 'off', 'down', 'under', 'again', 'further', 'then', 'once']);
    
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4 && !stopWords.has(word));
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private calculateReadabilityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = this.countSyllables(content);
    
    // Flesch Reading Ease Score
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((total, word) => {
      const syllableCount = word.match(/[aeiouy]+/g)?.length || 1;
      return total + syllableCount;
    }, 0);
  }

  // Translation
  async translateDocument(document: ProcessedDocument, targetLanguage: string = 'ar'): Promise<DocumentTranslation> {
    try {
      // Use simple translation service (in production, use proper translation API)
      const translatedContent = await this.translateText(document.content, targetLanguage);
      
      return {
        originalLanguage: document.metadata.language || 'en',
        targetLanguage,
        translatedContent,
        confidence: 0.8, // Placeholder confidence
        translatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async translateText(text: string, targetLanguage: string): Promise<string> {
    // For demo purposes, return a placeholder
    // In production, integrate with Google Translate API or Azure Translator
    const placeholderTranslations: { [key: string]: string } = {
      'ar': 'نص مترجم إلى العربية', // Translated text in Arabic
      'es': 'Texto traducido al español',
      'fr': 'Texte traduit en français',
      'de': 'Text ins Deutsche übersetzt'
    };
    
    if (text.length > 100) {
      return `${placeholderTranslations[targetLanguage] || 'Translated text'}\n\n${text.substring(0, 200)}...`;
    }
    
    return placeholderTranslations[targetLanguage] || text;
  }

  // AI-powered insights generation
  async generateInsights(document: ProcessedDocument): Promise<{
    insights: string[];
    recommendations: string[];
    prd?: string;
  }> {
    try {
      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: APP_CONFIG.apis.openai.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert document analyst. Provide insights, recommendations, and if applicable, create a Product Requirements Document (PRD) based on the document content.'
            },
            {
              role: 'user',
              content: `Analyze the following document and provide:
1. Key insights (3-5 bullet points)
2. Recommendations for improvement or action items (3-5 bullet points)
3. If this appears to be a product or project document, create a basic PRD structure

Document content:
${document.content.substring(0, 3000)}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        });
        
        const result = response.choices[0]?.message?.content || '';
        return this.parseInsightsResponse(result);
      }
      
      return this.generateBasicInsights(document);
    } catch (error) {
      console.warn('AI insights generation failed:', error);
      return this.generateBasicInsights(document);
    }
  }

  private parseInsightsResponse(response: string): {
    insights: string[];
    recommendations: string[];
    prd?: string;
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    let prd: string | undefined;
    
    const sections = response.split(/\n\s*\n/);
    let currentSection = '';
    
    sections.forEach(section => {
      const lowerSection = section.toLowerCase();
      if (lowerSection.includes('insight')) {
        currentSection = 'insights';
      } else if (lowerSection.includes('recommendation')) {
        currentSection = 'recommendations';
      } else if (lowerSection.includes('prd') || lowerSection.includes('product requirement')) {
        currentSection = 'prd';
        prd = section;
      } else {
        const lines = section.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          const trimmedLine = line.replace(/^[-•*]\s*/, '').trim();
          if (trimmedLine) {
            if (currentSection === 'insights') {
              insights.push(trimmedLine);
            } else if (currentSection === 'recommendations') {
              recommendations.push(trimmedLine);
            }
          }
        });
      }
    });
    
    return { insights, recommendations, prd };
  }

  private generateBasicInsights(document: ProcessedDocument): {
    insights: string[];
    recommendations: string[];
  } {
    const insights = [
      `Document contains ${document.metadata.words} words and ${document.metadata.characters} characters`,
      `Primary language detected: ${document.metadata.language || 'Unknown'}`,
      `Document type: ${document.type}`,
      `File size: ${this.formatFileSize(document.size)}`
    ];
    
    const recommendations = [
      'Consider adding more structured headings for better organization',
      'Review document for clarity and conciseness',
      'Add metadata and tags for better searchability'
    ];
    
    if (document.metadata.words > 2000) {
      recommendations.push('Document is quite long - consider breaking into smaller sections');
    }
    
    return { insights, recommendations };
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private getTypeFromFormat(format: string): string {
    const types: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'md': 'text/markdown'
    };
    return types[format] || 'text/plain';
  }

  private async generateImageThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxSize = 200;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL());
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}

// Create and export singleton instance
export const documentProcessor = new DocumentProcessor();
export default DocumentProcessor;
