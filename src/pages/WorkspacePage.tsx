import React, { useState, useCallback } from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { toast } from 'react-hot-toast';

// Components
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentList from '../components/documents/DocumentList';
import DocumentViewer from '../components/documents/DocumentViewer';
import ProcessingProgress from '../components/ui/ProcessingProgress';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import EnvironmentStatus from '../components/ui/EnvironmentStatus';

// Icons
import { 
  DocumentIcon, 
  FolderIcon, 
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const WorkspacePage: React.FC = () => {
  const {
    state,
    addDocuments,
    removeDocument,
    selectDocument,
    deselectDocument,
    clearSelection,
    toggleDocumentSelection,
    compressSelected,
    mergeSelected,
    analyzeSelected,
    translateSelected,
    generateInsightsForSelected,
    downloadSelected,
    clearErrors,
    checkEnvironment
  } = useDocuments();

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showEnvironmentStatus, setShowEnvironmentStatus] = useState(!state.environmentValid);

  // Handle file uploads
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    try {
      await addDocuments(files);
      const fileCount = Array.from(files).length;
      toast.success(`Successfully processed ${fileCount} file${fileCount > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to process some files. Check the error panel for details.');
    }
  }, [addDocuments]);

  // Handle document selection for viewing
  const handleDocumentView = useCallback((documentId: string) => {
    setSelectedDocumentId(documentId);
  }, []);

  // Handle document operations
  const handleCompress = useCallback(async () => {
    if (state.selectedDocuments.length === 0) {
      toast.error('Please select documents to compress');
      return;
    }

    try {
      const results = await compressSelected('basic');
      const successCount = results.length;
      toast.success(`Successfully compressed ${successCount} document${successCount > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to compress documents');
    }
  }, [state.selectedDocuments.length, compressSelected]);

  const handleMerge = useCallback(async () => {
    if (state.selectedDocuments.length < 2) {
      toast.error('Please select at least 2 documents to merge');
      return;
    }

    try {
      const mergedDoc = await mergeSelected();
      toast.success(`Successfully merged ${state.selectedDocuments.length} documents into "${mergedDoc.name}"`);
      clearSelection();
    } catch (error) {
      toast.error('Failed to merge documents');
    }
  }, [state.selectedDocuments.length, mergeSelected, clearSelection]);

  const handleAnalyze = useCallback(async () => {
    if (state.selectedDocuments.length === 0) {
      toast.error('Please select documents to analyze');
      return;
    }

    try {
      const analyses = await analyzeSelected();
      const successCount = analyses.length;
      toast.success(`Successfully analyzed ${successCount} document${successCount > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to analyze documents');
    }
  }, [state.selectedDocuments.length, analyzeSelected]);

  const handleTranslate = useCallback(async () => {
    if (state.selectedDocuments.length === 0) {
      toast.error('Please select documents to translate');
      return;
    }

    try {
      const translations = await translateSelected('ar'); // Default to Arabic
      const successCount = translations.length;
      toast.success(`Successfully translated ${successCount} document${successCount > 1 ? 's' : ''} to Arabic`);
    } catch (error) {
      toast.error('Failed to translate documents');
    }
  }, [state.selectedDocuments.length, translateSelected]);

  const handleGenerateInsights = useCallback(async () => {
    if (state.selectedDocuments.length === 0) {
      toast.error('Please select documents to generate insights');
      return;
    }

    try {
      const insights = await generateInsightsForSelected();
      const successCount = insights.length;
      toast.success(`Successfully generated insights for ${successCount} document${successCount > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to generate insights');
    }
  }, [state.selectedDocuments.length, generateInsightsForSelected]);

  const handleDownload = useCallback((format: 'original' | 'compressed' | 'translated' = 'original') => {
    if (state.selectedDocuments.length === 0) {
      toast.error('Please select documents to download');
      return;
    }

    try {
      downloadSelected(format);
      toast.success(`Downloading ${state.selectedDocuments.length} document${state.selectedDocuments.length > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to download documents');
    }
  }, [state.selectedDocuments.length, downloadSelected]);

  // Get selected document for viewing
  const selectedDocument = selectedDocumentId 
    ? state.documents.find(doc => doc.id === selectedDocumentId)
    : null;

  return (
    <div className="workspace-page">
      {/* Header */}
      <div className="workspace-header">
        <div className="header-content">
          <div className="header-title">
            <FolderIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Workspace</h1>
              <p className="text-gray-600">
                {state.documents.length} document{state.documents.length !== 1 ? 's' : ''} • {state.selectedDocuments.length} selected
              </p>
            </div>
          </div>

          <div className="header-actions">
            {/* Environment Status */}
            <button
              onClick={() => setShowEnvironmentStatus(!showEnvironmentStatus)}
              className={`environment-status-btn ${state.environmentValid ? 'valid' : 'invalid'}`}
            >
              {state.environmentValid ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
              Environment
            </button>

            {/* Settings */}
            <button
              onClick={checkEnvironment}
              className="btn-secondary"
              title="Refresh environment status"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Environment Status Panel */}
        {showEnvironmentStatus && (
          <EnvironmentStatus
            isValid={state.environmentValid}
            missingVars={state.missingEnvVars}
            onClose={() => setShowEnvironmentStatus(false)}
          />
        )}
      </div>

      {/* Processing Progress */}
      {state.isProcessing && (
        <ProcessingProgress progress={state.processingProgress} />
      )}

      {/* Error Display */}
      {state.errors.length > 0 && (
        <ErrorDisplay
          errors={state.errors}
          onClear={clearErrors}
        />
      )}

      {/* Main Content */}
      <div className="workspace-content">
        {/* Upload Area */}
        <div className="upload-section">
          <DocumentUpload
            onUpload={handleFileUpload}
            isProcessing={state.isProcessing}
            disabled={!state.environmentValid}
          />
        </div>

        {/* Document Operations */}
        {state.selectedDocuments.length > 0 && (
          <div className="operations-bar">
            <div className="operations-info">
              <span className="selected-count">
                {state.selectedDocuments.length} document{state.selectedDocuments.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="operations-actions">
              <button
                onClick={handleCompress}
                className="btn-primary"
                disabled={state.isProcessing}
              >
                Compress
              </button>

              <button
                onClick={handleMerge}
                className="btn-primary"
                disabled={state.isProcessing || state.selectedDocuments.length < 2}
              >
                Merge
              </button>

              <button
                onClick={handleAnalyze}
                className="btn-primary"
                disabled={state.isProcessing}
              >
                Analyze
              </button>

              <button
                onClick={handleTranslate}
                className="btn-primary"
                disabled={state.isProcessing}
              >
                Translate to Arabic
              </button>

              <button
                onClick={handleGenerateInsights}
                className="btn-primary"
                disabled={state.isProcessing}
              >
                Generate Insights
              </button>

              <div className="download-dropdown">
                <button
                  onClick={() => handleDownload('original')}
                  className="btn-secondary"
                  disabled={state.isProcessing}
                >
                  Download Original
                </button>
                <button
                  onClick={() => handleDownload('compressed')}
                  className="btn-secondary"
                  disabled={state.isProcessing}
                >
                  Download Compressed
                </button>
                <button
                  onClick={() => handleDownload('translated')}
                  className="btn-secondary"
                  disabled={state.isProcessing}
                >
                  Download Translated
                </button>
              </div>

              <button
                onClick={clearSelection}
                className="btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Document List/Grid */}
        <div className="documents-section">
          {state.documents.length === 0 ? (
            <div className="empty-state">
              <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents yet</h3>
              <p className="text-gray-500 mb-6">
                Upload your first document to get started with processing, analysis, and insights.
              </p>
              {!state.environmentValid && (
                <p className="text-orange-600 text-sm">
                  ⚠️ Please configure your API keys in the environment to enable full functionality.
                </p>
              )}
            </div>
          ) : (
            <DocumentList
              documents={state.documents}
              selectedDocuments={state.selectedDocuments}
              onSelect={toggleDocumentSelection}
              onView={handleDocumentView}
              onRemove={removeDocument}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              analyses={state.analyses}
              translations={state.translations}
              compressionResults={state.compressionResults}
              insights={state.insights}
            />
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          analysis={state.analyses[selectedDocument.id]}
          translation={state.translations[selectedDocument.id]}
          insights={state.insights[selectedDocument.id]}
          onClose={() => setSelectedDocumentId(null)}
        />
      )}
    </div>
  );
};

export default WorkspacePage;
