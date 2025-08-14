import OpenAI from 'openai';
import { APP_CONFIG } from '../config/app.config';

export interface StreamingChatResponse {
  id: string;
  content: string;
  finished: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DocumentAnalysisRequest {
  content: string;
  analysisType: 'summary' | 'insights' | 'classification' | 'translation' | 'prd' | 'comprehensive';
  targetLanguage?: string;
  customPrompt?: string;
}

export interface DocumentInsights {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  readabilityScore: number;
  recommendations: string[];
}

export interface PRDGeneration {
  title: string;
  overview: string;
  objectives: string[];
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  userStories: Array<{
    title: string;
    description: string;
    acceptanceCriteria: string[];
  }>;
  timeline: {
    phases: Array<{
      name: string;
      duration: string;
      deliverables: string[];
    }>;
  };
  risks: Array<{
    risk: string;
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
}

class EnhancedAIService {
  private openai: OpenAI | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (APP_CONFIG.apis.openai.apiKey) {
      this.openai = new OpenAI({
        apiKey: APP_CONFIG.apis.openai.apiKey,
        dangerouslyAllowBrowser: true,
        baseURL: APP_CONFIG.apis.openai.baseURL
      });
      this.isInitialized = true;
    } else {
      console.warn('OpenAI API key not configured');
    }
  }

  public isAvailable(): boolean {
    return this.isInitialized && this.openai !== null;
  }

  // Streaming chat functionality
  public async *streamChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): AsyncGenerator<StreamingChatResponse, void, unknown> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    try {
      const stream = await this.openai.chat.completions.create({
        model: options?.model || APP_CONFIG.apis.openai.models.chat,
        messages,
        stream: true,
        temperature: options?.temperature || 0.3,
        max_tokens: options?.maxTokens || 2000,
      });

      let content = '';
      let id = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (chunk.id) id = chunk.id;
        
        if (delta?.content) {
          content += delta.content;
          yield {
            id,
            content,
            finished: false
          };
        }

        if (chunk.choices[0]?.finish_reason) {
          yield {
            id,
            content,
            finished: true,
            usage: chunk.usage as any
          };
          break;
        }
      }
    } catch (error) {
      throw new Error(`Streaming chat failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Advanced document analysis with function calling
  public async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentInsights | PRDGeneration | string> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    try {
      const prompt = this.buildAnalysisPrompt(request);
      const tools = this.getAnalysisTools(request.analysisType);

      const response = await this.openai.chat.completions.create({
        model: APP_CONFIG.apis.openai.models.chat,
        messages: [
          {
            role: 'system',
            content: 'You are an expert document analyst with capabilities in content analysis, insight generation, and technical documentation creation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        temperature: 0.3,
        max_tokens: 3000
      });

      const choice = response.choices[0];
      
      // Handle function calls
      if (choice.message.tool_calls) {
        return this.processToolCalls(choice.message.tool_calls, request);
      }

      // Handle direct response
      return this.parseAnalysisResponse(choice.message.content || '', request.analysisType);
    } catch (error) {
      throw new Error(`Document analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildAnalysisPrompt(request: DocumentAnalysisRequest): string {
    const basePrompt = `Analyze the following document content:\n\n${request.content.substring(0, 6000)}`;
    
    switch (request.analysisType) {
      case 'summary':
        return `${basePrompt}\n\nProvide a comprehensive summary including key points and main themes.`;
      
      case 'insights':
        return `${basePrompt}\n\nGenerate actionable insights, identify patterns, and provide recommendations.`;
      
      case 'classification':
        return `${basePrompt}\n\nClassify this document by type, purpose, and content category.`;
      
      case 'translation':
        return `${basePrompt}\n\nTranslate this content to ${request.targetLanguage || 'Arabic'} while preserving meaning and context.`;
      
      case 'prd':
        return `${basePrompt}\n\nCreate a comprehensive Product Requirements Document (PRD) based on this content.`;
      
      case 'comprehensive':
        return `${basePrompt}\n\nProvide a comprehensive analysis including summary, insights, classification, sentiment, and recommendations.`;
      
      default:
        return request.customPrompt || basePrompt;
    }
  }

  private getAnalysisTools(analysisType: string): any[] {
    const commonTools = [
      {
        type: 'function',
        function: {
          name: 'extract_entities',
          description: 'Extract named entities from text',
          parameters: {
            type: 'object',
            properties: {
              entities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    type: { type: 'string' },
                    confidence: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    ];

    switch (analysisType) {
      case 'prd':
        return [
          ...commonTools,
          {
            type: 'function',
            function: {
              name: 'generate_prd',
              description: 'Generate a structured Product Requirements Document',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  overview: { type: 'string' },
                  objectives: { type: 'array', items: { type: 'string' } },
                  requirements: {
                    type: 'object',
                    properties: {
                      functional: { type: 'array', items: { type: 'string' } },
                      nonFunctional: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        ];
      
      case 'comprehensive':
        return [
          ...commonTools,
          {
            type: 'function',
            function: {
              name: 'comprehensive_analysis',
              description: 'Perform comprehensive document analysis',
              parameters: {
                type: 'object',
                properties: {
                  summary: { type: 'string' },
                  keyPoints: { type: 'array', items: { type: 'string' } },
                  sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
                  recommendations: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        ];
      
      default:
        return [];
    }
  }

  private async processToolCalls(toolCalls: any[], request: DocumentAnalysisRequest): Promise<any> {
    // Process function calls and return structured data
    for (const toolCall of toolCalls) {
      if (toolCall.function?.name === 'generate_prd') {
        return JSON.parse(toolCall.function.arguments);
      } else if (toolCall.function?.name === 'comprehensive_analysis') {
        return JSON.parse(toolCall.function.arguments);
      }
    }
    
    return 'Analysis completed but no structured data was returned.';
  }

  private parseAnalysisResponse(content: string, analysisType: string): any {
    // Parse response based on analysis type
    switch (analysisType) {
      case 'summary':
      case 'translation':
        return content;
      
      case 'insights':
        return this.parseInsightsFromText(content);
      
      default:
        return content;
    }
  }

  private parseInsightsFromText(content: string): DocumentInsights {
    // Basic parsing of insights from text response
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      summary: lines.find(line => line.toLowerCase().includes('summary'))?.replace(/summary:?\s*/i, '') || '',
      keyPoints: lines.filter(line => line.trim().startsWith('•') || line.trim().startsWith('-')).map(line => line.replace(/^[•-]\s*/, '')),
      actionItems: [],
      sentiment: 'neutral',
      topics: [],
      entities: [],
      readabilityScore: 75,
      recommendations: lines.filter(line => line.toLowerCase().includes('recommend')).map(line => line.trim())
    };
  }

  // Batch processing for multiple documents
  public async batchAnalyze(
    documents: Array<{ id: string; content: string }>,
    analysisType: DocumentAnalysisRequest['analysisType'],
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{ id: string; result: any; error?: string }>> {
    const results: Array<{ id: string; result: any; error?: string }> = [];
    
    for (let i = 0; i < documents.length; i++) {
      try {
        const result = await this.analyzeDocument({
          content: documents[i].content,
          analysisType
        });
        
        results.push({
          id: documents[i].id,
          result
        });
      } catch (error) {
        results.push({
          id: documents[i].id,
          result: null,
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      onProgress?.(i + 1, documents.length);
    }
    
    return results;
  }

  // Enhanced translation with context awareness
  public async translateWithContext(
    content: string,
    targetLanguage: string,
    context?: {
      documentType?: string;
      domain?: string;
      tone?: 'formal' | 'informal' | 'technical';
    }
  ): Promise<{
    translatedText: string;
    confidence: number;
    alternatives?: string[];
  }> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    const contextPrompt = context 
      ? `Context: This is a ${context.documentType || 'document'} in the ${context.domain || 'general'} domain with a ${context.tone || 'neutral'} tone.`
      : '';

    try {
      const response = await this.openai.chat.completions.create({
        model: APP_CONFIG.apis.openai.models.chat,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in accurate, context-aware translations. ${contextPrompt}`
          },
          {
            role: 'user',
            content: `Translate the following text to ${targetLanguage}, preserving meaning, tone, and technical terminology:\n\n${content}`
          }
        ],
        temperature: 0.2,
        max_tokens: Math.min(content.length * 2, 4000)
      });

      return {
        translatedText: response.choices[0]?.message?.content || '',
        confidence: 0.9 // AI translation confidence estimate
      };
    } catch (error) {
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate embeddings for semantic search
  public async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: APP_CONFIG.apis.openai.models.embedding,
        input: texts
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Semantic similarity search
  public calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// Create and export singleton instance
export const enhancedAIService = new EnhancedAIService();
export default EnhancedAIService;
