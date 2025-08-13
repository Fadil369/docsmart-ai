import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProcessedDocument, DocumentAnalysis, DocumentTranslation } from '../../services/DocumentProcessor';

interface DocumentViewerProps {
  document: ProcessedDocument;
  analysis?: DocumentAnalysis;
  translation?: DocumentTranslation;
  insights?: any;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  analysis,
  translation,
  insights,
  onClose
}) => {
  return (
    <div className="document-viewer-overlay">
      <div className="document-viewer">
        <div className="viewer-header">
          <h2 className="viewer-title">{document.name}</h2>
          <button onClick={onClose} className="close-btn">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="viewer-content">
          <div className="document-details">
            <p><strong>Type:</strong> {document.type}</p>
            <p><strong>Size:</strong> {(document.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Pages:</strong> {document.pages || 'N/A'}</p>
          </div>
          
          <div className="document-content">
            <h3>Content Preview</h3>
            <div className="content-preview">
              {document.content.substring(0, 1000)}
              {document.content.length > 1000 && '...'}
            </div>
          </div>
          
          {analysis && (
            <div className="analysis-section">
              <h3>Analysis</h3>
              <div className="analysis-content">
                <p><strong>Language:</strong> {analysis.language}</p>
                <p><strong>Word Count:</strong> {analysis.wordCount}</p>
                <p><strong>Readability:</strong> {analysis.readabilityScore}</p>
                {analysis.keyTopics && (
                  <div>
                    <strong>Key Topics:</strong>
                    <ul>
                      {analysis.keyTopics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {translation && (
            <div className="translation-section">
              <h3>Translation</h3>
              <div className="translation-content">
                <p><strong>Target Language:</strong> {translation.targetLanguage}</p>
                <p><strong>Confidence:</strong> {translation.confidence}</p>
                <div className="translated-text">
                  {translation.translatedContent.substring(0, 500)}
                  {translation.translatedContent.length > 500 && '...'}
                </div>
              </div>
            </div>
          )}
          
          {insights && (
            <div className="insights-section">
              <h3>AI Insights</h3>
              <div className="insights-content">
                {insights.insights && (
                  <div>
                    <h4>Key Insights</h4>
                    <ul>
                      {insights.insights.map((insight: string, index: number) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {insights.recommendations && (
                  <div>
                    <h4>Recommendations</h4>
                    <ul>
                      {insights.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
