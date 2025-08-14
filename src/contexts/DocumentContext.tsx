import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { documentProcessor, ProcessedDocument, DocumentAnalysis, DocumentTranslation, CompressionResult, MergeOptions } from '../services/DocumentProcessor';
import { validateEnvironment } from '../config/app.config';

// Types for document management
export interface DocumentState {
  documents: ProcessedDocument[];
  selectedDocuments: string[];
  isProcessing: boolean;
  processingProgress: number;
  errors: string[];
  analyses: Record<string, DocumentAnalysis>;
  translations: Record<string, DocumentTranslation>;
  compressionResults: Record<string, CompressionResult>;
  mergedDocuments: ProcessedDocument[];
  insights: Record<string, {
    insights: string[];
    recommendations: string[];
    prd?: string;
  }>;
  environmentValid: boolean;
  missingEnvVars: string[];
}

// Action types for state management
type DocumentAction =
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'ADD_DOCUMENT'; payload: ProcessedDocument }
  | { type: 'ADD_DOCUMENTS'; payload: ProcessedDocument[] }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'UPDATE_DOCUMENT'; payload: ProcessedDocument }
  | { type: 'SELECT_DOCUMENT'; payload: string }
  | { type: 'DESELECT_DOCUMENT'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_ANALYSIS'; payload: { documentId: string; analysis: DocumentAnalysis } }
  | { type: 'SET_TRANSLATION'; payload: { documentId: string; translation: DocumentTranslation } }
  | { type: 'SET_COMPRESSION_RESULT'; payload: { documentId: string; result: CompressionResult } }
  | { type: 'ADD_MERGED_DOCUMENT'; payload: ProcessedDocument }
  | { type: 'SET_INSIGHTS'; payload: { documentId: string; insights: any } }
  | { type: 'SET_ENVIRONMENT_STATUS'; payload: { valid: boolean; missing: string[] } };

// Initial state
const initialState: DocumentState = {
  documents: [],
  selectedDocuments: [],
  isProcessing: false,
  processingProgress: 0,
  errors: [],
  analyses: {},
  translations: {},
  compressionResults: {},
  mergedDocuments: [],
  insights: {},
  environmentValid: false,
  missingEnvVars: []
};

// Reducer function
function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    
    case 'SET_PROGRESS':
      return { ...state, processingProgress: action.payload };
    
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload]
      };
    
    case 'ADD_DOCUMENTS':
      return {
        ...state,
        documents: [...state.documents, ...action.payload]
      };
    
    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        selectedDocuments: state.selectedDocuments.filter(id => id !== action.payload)
      };
    
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? action.payload : doc
        )
      };
    
    case 'SELECT_DOCUMENT':
      return {
        ...state,
        selectedDocuments: [...state.selectedDocuments, action.payload]
      };
    
    case 'DESELECT_DOCUMENT':
      return {
        ...state,
        selectedDocuments: state.selectedDocuments.filter(id => id !== action.payload)
      };
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedDocuments: [] };
    
    case 'ADD_ERROR':
      return { ...state, errors: [...state.errors, action.payload] };
    
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    
    case 'SET_ANALYSIS':
      return {
        ...state,
        analyses: {
          ...state.analyses,
          [action.payload.documentId]: action.payload.analysis
        }
      };
    
    case 'SET_TRANSLATION':
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.documentId]: action.payload.translation
        }
      };
    
    case 'SET_COMPRESSION_RESULT':
      return {
        ...state,
        compressionResults: {
          ...state.compressionResults,
          [action.payload.documentId]: action.payload.result
        }
      };
    
    case 'ADD_MERGED_DOCUMENT':
      return {
        ...state,
        mergedDocuments: [...state.mergedDocuments, action.payload]
      };
    
    case 'SET_INSIGHTS':
      return {
        ...state,
        insights: {
          ...state.insights,
          [action.payload.documentId]: action.payload.insights
        }
      };
    
    case 'SET_ENVIRONMENT_STATUS':
      return {
        ...state,
        environmentValid: action.payload.valid,
        missingEnvVars: action.payload.missing
      };
    
    default:
      return state;
  }
}

// Context interface
interface DocumentContextType {
  state: DocumentState;
  
  // Document management
  addDocuments: (files: FileList | File[]) => Promise<void>;
  removeDocument: (documentId: string) => void;
  updateDocument: (document: ProcessedDocument) => void;
  
  // Selection management
  selectDocument: (documentId: string) => void;
  deselectDocument: (documentId: string) => void;
  clearSelection: () => void;
  toggleDocumentSelection: (documentId: string) => void;
  
  // Document operations
  compressDocument: (documentId: string, method?: 'ghostscript' | 'basic' | 'aggressive') => Promise<CompressionResult>;
  compressSelected: (method?: 'ghostscript' | 'basic' | 'aggressive') => Promise<CompressionResult[]>;
  
  mergeDocuments: (documentIds: string[], options?: MergeOptions) => Promise<ProcessedDocument>;
  mergeSelected: (options?: MergeOptions) => Promise<ProcessedDocument>;
  
  analyzeDocument: (documentId: string) => Promise<DocumentAnalysis>;
  analyzeSelected: () => Promise<DocumentAnalysis[]>;
  
  translateDocument: (documentId: string, targetLanguage?: string) => Promise<DocumentTranslation>;
  translateSelected: (targetLanguage?: string) => Promise<DocumentTranslation[]>;
  
  generateInsights: (documentId: string) => Promise<{
    insights: string[];
    recommendations: string[];
    prd?: string;
  }>;
  generateInsightsForSelected: () => Promise<any[]>;
  
  // Utility functions
  getDocument: (documentId: string) => ProcessedDocument | undefined;
  getSelectedDocuments: () => ProcessedDocument[];
  downloadDocument: (documentId: string, format?: 'original' | 'compressed' | 'translated') => void;
  downloadSelected: (format?: 'original' | 'compressed' | 'translated') => void;
  
  // Error management
  clearErrors: () => void;
  
  // Environment status
  checkEnvironment: () => void;
}

// Create context
const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Provider component
export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Check environment on mount
  useEffect(() => {
    const envStatus = validateEnvironment();
    dispatch({
      type: 'SET_ENVIRONMENT_STATUS',
      payload: { valid: envStatus.valid, missing: envStatus.missing }
    });
  }, []);

  // Helper function to handle errors
  const handleError = useCallback((error: any, operation: string) => {
    const errorMessage = `${operation}: ${error instanceof Error ? error.message : String(error)}`;
    dispatch({ type: 'ADD_ERROR', payload: errorMessage });
    console.error(errorMessage, error);
  }, []);

  // Helper function to update progress
  const updateProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress });
  }, []);

  // Add documents
  const addDocuments = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'CLEAR_ERRORS' });
    
    try {
      const processedDocs: ProcessedDocument[] = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        updateProgress((i / fileArray.length) * 100);
        
        try {
          const processedDoc = await documentProcessor.processDocument(file);
          processedDocs.push(processedDoc);
        } catch (error) {
          handleError(error, `Processing file ${file.name}`);
        }
      }
      
      if (processedDocs.length > 0) {
        dispatch({ type: 'ADD_DOCUMENTS', payload: processedDocs });
      }
    } catch (error) {
      handleError(error, 'Adding documents');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
      updateProgress(0);
    }
  }, [handleError, updateProgress]);

  // Remove document
  const removeDocument = useCallback((documentId: string) => {
    dispatch({ type: 'REMOVE_DOCUMENT', payload: documentId });
  }, []);

  // Update document
  const updateDocument = useCallback((document: ProcessedDocument) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
  }, []);

  // Selection management
  const selectDocument = useCallback((documentId: string) => {
    if (!state.selectedDocuments.includes(documentId)) {
      dispatch({ type: 'SELECT_DOCUMENT', payload: documentId });
    }
  }, [state.selectedDocuments]);

  const deselectDocument = useCallback((documentId: string) => {
    dispatch({ type: 'DESELECT_DOCUMENT', payload: documentId });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const toggleDocumentSelection = useCallback((documentId: string) => {
    if (state.selectedDocuments.includes(documentId)) {
      deselectDocument(documentId);
    } else {
      selectDocument(documentId);
    }
  }, [state.selectedDocuments, selectDocument, deselectDocument]);

  // Compress document
  const compressDocument = useCallback(async (
    documentId: string,
    method: 'ghostscript' | 'basic' | 'aggressive' = 'basic'
  ): Promise<CompressionResult> => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      const result = await documentProcessor.compressDocument(document, method);
      dispatch({
        type: 'SET_COMPRESSION_RESULT',
        payload: { documentId, result }
      });
      return result;
    } catch (error) {
      handleError(error, 'Compressing document');
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.documents, handleError]);

  // Compress selected documents
  const compressSelected = useCallback(async (
    method: 'ghostscript' | 'basic' | 'aggressive' = 'basic'
  ): Promise<CompressionResult[]> => {
    const results: CompressionResult[] = [];
    
    for (const documentId of state.selectedDocuments) {
      try {
        const result = await compressDocument(documentId, method);
        results.push(result);
      } catch (error) {
        handleError(error, `Compressing document ${documentId}`);
      }
    }
    
    return results;
  }, [state.selectedDocuments, compressDocument, handleError]);

  // Merge documents
  const mergeDocuments = useCallback(async (
    documentIds: string[],
    options?: MergeOptions
  ): Promise<ProcessedDocument> => {
    const documents = documentIds
      .map(id => state.documents.find(doc => doc.id === id))
      .filter(Boolean) as ProcessedDocument[];

    if (documents.length === 0) {
      throw new Error('No valid documents found for merging');
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      const mergedDoc = await documentProcessor.mergeDocuments(documents, options);
      dispatch({ type: 'ADD_MERGED_DOCUMENT', payload: mergedDoc });
      return mergedDoc;
    } catch (error) {
      handleError(error, 'Merging documents');
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.documents, handleError]);

  // Merge selected documents
  const mergeSelected = useCallback(async (options?: MergeOptions): Promise<ProcessedDocument> => {
    return mergeDocuments(state.selectedDocuments, options);
  }, [state.selectedDocuments, mergeDocuments]);

  // Analyze document
  const analyzeDocument = useCallback(async (documentId: string): Promise<DocumentAnalysis> => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      const analysis = await documentProcessor.analyzeDocument(document);
      dispatch({
        type: 'SET_ANALYSIS',
        payload: { documentId, analysis }
      });
      return analysis;
    } catch (error) {
      handleError(error, 'Analyzing document');
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.documents, handleError]);

  // Analyze selected documents
  const analyzeSelected = useCallback(async (): Promise<DocumentAnalysis[]> => {
    const results: DocumentAnalysis[] = [];
    
    for (const documentId of state.selectedDocuments) {
      try {
        const analysis = await analyzeDocument(documentId);
        results.push(analysis);
      } catch (error) {
        handleError(error, `Analyzing document ${documentId}`);
      }
    }
    
    return results;
  }, [state.selectedDocuments, analyzeDocument, handleError]);

  // Translate document
  const translateDocument = useCallback(async (
    documentId: string,
    targetLanguage?: string
  ): Promise<DocumentTranslation> => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      const translation = await documentProcessor.translateDocument(document, targetLanguage);
      dispatch({
        type: 'SET_TRANSLATION',
        payload: { documentId, translation }
      });
      return translation;
    } catch (error) {
      handleError(error, 'Translating document');
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.documents, handleError]);

  // Translate selected documents
  const translateSelected = useCallback(async (
    targetLanguage?: string
  ): Promise<DocumentTranslation[]> => {
    const results: DocumentTranslation[] = [];
    
    for (const documentId of state.selectedDocuments) {
      try {
        const translation = await translateDocument(documentId, targetLanguage);
        results.push(translation);
      } catch (error) {
        handleError(error, `Translating document ${documentId}`);
      }
    }
    
    return results;
  }, [state.selectedDocuments, translateDocument, handleError]);

  // Generate insights
  const generateInsights = useCallback(async (documentId: string) => {
    const document = state.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      const insights = await documentProcessor.generateInsights(document);
      dispatch({
        type: 'SET_INSIGHTS',
        payload: { documentId, insights }
      });
      return insights;
    } catch (error) {
      handleError(error, 'Generating insights');
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.documents, handleError]);

  // Generate insights for selected documents
  const generateInsightsForSelected = useCallback(async () => {
    const results: any[] = [];
    
    for (const documentId of state.selectedDocuments) {
      try {
        const insights = await generateInsights(documentId);
        results.push(insights);
      } catch (error) {
        handleError(error, `Generating insights for document ${documentId}`);
      }
    }
    
    return results;
  }, [state.selectedDocuments, generateInsights, handleError]);

  // Utility functions
  const getDocument = useCallback((documentId: string): ProcessedDocument | undefined => {
    return state.documents.find(doc => doc.id === documentId);
  }, [state.documents]);

  const getSelectedDocuments = useCallback((): ProcessedDocument[] => {
    return state.selectedDocuments
      .map(id => state.documents.find(doc => doc.id === id))
      .filter(Boolean) as ProcessedDocument[];
  }, [state.documents, state.selectedDocuments]);

  const downloadDocument = useCallback((
    documentId: string,
    format: 'original' | 'compressed' | 'translated' = 'original'
  ) => {
    const document = getDocument(documentId);
    if (!document) return;

    let content = document.content;
    let filename = document.name;
    let mimeType = document.type;

    // Modify content based on format
    switch (format) {
      case 'compressed':
        const compressionResult = state.compressionResults[documentId];
        if (compressionResult) {
          content = new TextDecoder().decode(compressionResult.compressedData);
          filename = `compressed_${filename}`;
        }
        break;
      
      case 'translated':
        const translation = state.translations[documentId];
        if (translation) {
          content = translation.translatedContent;
          filename = `translated_${filename}`;
        }
        break;
    }

    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [getDocument, state.compressionResults, state.translations]);

  const downloadSelected = useCallback((
    format: 'original' | 'compressed' | 'translated' = 'original'
  ) => {
    state.selectedDocuments.forEach(documentId => {
      downloadDocument(documentId, format);
    });
  }, [state.selectedDocuments, downloadDocument]);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const checkEnvironment = useCallback(() => {
    const envStatus = validateEnvironment();
    dispatch({
      type: 'SET_ENVIRONMENT_STATUS',
      payload: { valid: envStatus.valid, missing: envStatus.missing }
    });
  }, []);

  const contextValue: DocumentContextType = {
    state,
    addDocuments,
    removeDocument,
    updateDocument,
    selectDocument,
    deselectDocument,
    clearSelection,
    toggleDocumentSelection,
    compressDocument,
    compressSelected,
    mergeDocuments,
    mergeSelected,
    analyzeDocument,
    analyzeSelected,
    translateDocument,
    translateSelected,
    generateInsights,
    generateInsightsForSelected,
    getDocument,
    getSelectedDocuments,
    downloadDocument,
    downloadSelected,
    clearErrors,
    checkEnvironment
  };

  return (
    <DocumentContext.Provider value={contextValue}>
      {children}
    </DocumentContext.Provider>
  );
}

// Custom hook to use the context
export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}

export default DocumentContext;
