import React from 'react';
import { ProcessedDocument, DocumentAnalysis, DocumentTranslation, CompressionResult } from '../../services/DocumentProcessor';

interface DocumentListProps {
  documents: ProcessedDocument[];
  selectedDocuments: string[];
  onSelect: (documentId: string) => void;
  onView: (documentId: string) => void;
  onRemove: (documentId: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  analyses: Record<string, DocumentAnalysis>;
  translations: Record<string, DocumentTranslation>;
  compressionResults: Record<string, CompressionResult>;
  insights: Record<string, any>;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocuments,
  onSelect,
  onView,
  onRemove,
  viewMode,
  onViewModeChange,
  analyses,
  translations,
  compressionResults,
  insights
}) => {
  return (
    <div className="document-list">
      <div className="list-header">
        <h3 className="list-title">Documents ({documents.length})</h3>
        <div className="view-controls">
          <button
            onClick={() => onViewModeChange('list')}
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            List
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            Grid
          </button>
        </div>
      </div>
      
      <div className={`documents-container ${viewMode}`}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`document-item ${selectedDocuments.includes(doc.id) ? 'selected' : ''}`}
          >
            <div className="document-checkbox">
              <input
                type="checkbox"
                checked={selectedDocuments.includes(doc.id)}
                onChange={() => onSelect(doc.id)}
              />
            </div>
            
            <div className="document-info" onClick={() => onView(doc.id)}>
              <h4 className="document-name">{doc.name}</h4>
              <p className="document-meta">
                {doc.type} • {(doc.size / 1024 / 1024).toFixed(2)} MB
              </p>
              
              <div className="document-badges">
                {analyses[doc.id] && (
                  <span className="badge badge-purple">Analyzed</span>
                )}
                {translations[doc.id] && (
                  <span className="badge badge-green">Translated</span>
                )}
                {compressionResults[doc.id] && (
                  <span className="badge badge-orange">Compressed</span>
                )}
                {insights[doc.id] && (
                  <span className="badge badge-indigo">Insights</span>
                )}
              </div>
            </div>
            
            <div className="document-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(doc.id);
                }}
                className="btn-secondary btn-sm"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(doc.id);
                }}
                className="btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
