import React from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  LanguageIcon,
  CloudArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage: React.FC = () => {
  const { state } = useDocuments();

  const stats = {
    totalDocuments: state.documents.length,
    totalAnalyses: Object.keys(state.analyses).length,
    totalTranslations: Object.keys(state.translations).length,
    totalCompressions: Object.keys(state.compressionResults).length,
    totalInsights: Object.keys(state.insights).length,
    mergedDocuments: state.mergedDocuments.length
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="header-content">
          <div className="header-title">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Document processing insights and statistics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="stat-info">
              <h3 className="stat-title">Total Documents</h3>
              <p className="stat-value">{stats.totalDocuments}</p>
              <p className="stat-description">Documents processed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <SparklesIcon className="w-8 h-8 text-purple-500" />
            </div>
            <div className="stat-info">
              <h3 className="stat-title">AI Analyses</h3>
              <p className="stat-value">{stats.totalAnalyses}</p>
              <p className="stat-description">Documents analyzed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <LanguageIcon className="w-8 h-8 text-green-500" />
            </div>
            <div className="stat-info">
              <h3 className="stat-title">Translations</h3>
              <p className="stat-value">{stats.totalTranslations}</p>
              <p className="stat-description">Documents translated</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CloudArrowDownIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div className="stat-info">
              <h3 className="stat-title">Compressions</h3>
              <p className="stat-value">{stats.totalCompressions}</p>
              <p className="stat-description">Files compressed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ChartBarIcon className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="stat-info">
              <h3 className="stat-title">Insights Generated</h3>
              <p className="stat-value">{stats.totalInsights}</p>
              <p className="stat-description">AI insights created</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DocumentTextIcon className="w-8 h-8 text-red-500" />
            </div>
            <div className="stat-info">
              <h3 className="stat-title">Merged Documents</h3>
              <p className="stat-value">{stats.mergedDocuments}</p>
              <p className="stat-description">Documents merged</p>
            </div>
          </div>
        </div>

        {state.documents.length === 0 ? (
          <div className="empty-analytics">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Yet</h3>
            <p className="text-gray-500 mb-6">
              Start processing documents to see analytics and insights here.
            </p>
          </div>
        ) : (
          <div className="analytics-details">
            <div className="detail-section">
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-list">
                {state.documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="activity-item">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div className="activity-info">
                      <p className="activity-title">{doc.name}</p>
                      <p className="activity-meta">
                        {doc.type} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="activity-badges">
                      {state.analyses[doc.id] && (
                        <span className="badge badge-purple">Analyzed</span>
                      )}
                      {state.translations[doc.id] && (
                        <span className="badge badge-green">Translated</span>
                      )}
                      {state.compressionResults[doc.id] && (
                        <span className="badge badge-orange">Compressed</span>
                      )}
                      {state.insights[doc.id] && (
                        <span className="badge badge-indigo">Insights</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
