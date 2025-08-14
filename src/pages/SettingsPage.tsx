import React, { useState } from 'react';
import { useDocuments } from '../contexts/DocumentContext';
import { 
  CogIcon, 
  KeyIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const SettingsPage: React.FC = () => {
  const { state, checkEnvironment } = useDocuments();
  const [showApiKeys, setShowApiKeys] = useState(false);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <div className="header-title">
            <CogIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Configure your DocSmart AI experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sections">
          
          {/* Environment Status Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Environment Configuration</h2>
              <button
                onClick={checkEnvironment}
                className="btn-secondary"
              >
                Refresh Status
              </button>
            </div>
            
            <div className="section-content">
              <div className="environment-status-card">
                <div className="status-header">
                  {state.environmentValid ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                  )}
                  <h3 className="status-title">
                    {state.environmentValid ? 'Environment Valid' : 'Configuration Needed'}
                  </h3>
                </div>
                
                <div className="status-content">
                  {state.environmentValid ? (
                    <p className="text-green-700">
                      ✅ All required API keys are properly configured. Full functionality is available.
                    </p>
                  ) : (
                    <div className="configuration-needed">
                      <p className="text-orange-700 mb-3">
                        ⚠️ Some API keys are missing. Please configure the following environment variables:
                      </p>
                      
                      <div className="missing-keys">
                        {state.missingEnvVars.map((varName) => (
                          <div key={varName} className="missing-key-item">
                            <code className="key-name">{varName}</code>
                            <span className="key-status">Missing</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">API Configuration</h2>
              <button
                onClick={() => setShowApiKeys(!showApiKeys)}
                className="btn-secondary"
              >
                <KeyIcon className="w-4 h-4" />
                {showApiKeys ? 'Hide' : 'Show'} Configuration
              </button>
            </div>
            
            {showApiKeys && (
              <div className="section-content">
                <div className="api-config-card">
                  <h3 className="config-title">Required Environment Variables</h3>
                  <p className="config-description">
                    Add these to your <code>.env</code> file to enable full functionality:
                  </p>
                  
                  <div className="env-vars-list">
                    <div className="env-var-item">
                      <label className="env-var-label">REACT_APP_OPENAI_API_KEY</label>
                      <p className="env-var-description">
                        Required for AI analysis, insights generation, and content processing
                      </p>
                      <div className="env-var-status">
                        {!state.missingEnvVars.includes('REACT_APP_OPENAI_API_KEY') ? (
                          <span className="status-badge status-success">Configured</span>
                        ) : (
                          <span className="status-badge status-missing">Missing</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="env-var-item">
                      <label className="env-var-label">REACT_APP_AZURE_AI_LANGUAGE_KEY</label>
                      <p className="env-var-description">
                        Optional: Enhances translation capabilities and language analysis
                      </p>
                      <div className="env-var-status">
                        {!state.missingEnvVars.includes('REACT_APP_AZURE_AI_LANGUAGE_KEY') ? (
                          <span className="status-badge status-success">Configured</span>
                        ) : (
                          <span className="status-badge status-optional">Optional</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="env-var-item">
                      <label className="env-var-label">REACT_APP_GITHUB_TOKEN</label>
                      <p className="env-var-description">
                        Optional: Enables GitHub Copilot integration for enhanced code analysis
                      </p>
                      <div className="env-var-status">
                        {!state.missingEnvVars.includes('REACT_APP_GITHUB_TOKEN') ? (
                          <span className="status-badge status-success">Configured</span>
                        ) : (
                          <span className="status-badge status-optional">Optional</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="config-help">
                    <h4 className="help-title">Setup Instructions:</h4>
                    <ol className="help-steps">
                      <li>Copy <code>.env.example</code> to <code>.env</code></li>
                      <li>Add your API keys to the <code>.env</code> file</li>
                      <li>Restart the development server</li>
                      <li>Click "Refresh Status" to verify configuration</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Processing Settings Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Processing Settings</h2>
            </div>
            
            <div className="section-content">
              <div className="processing-settings-card">
                <div className="setting-item">
                  <label className="setting-label">Maximum File Size</label>
                  <p className="setting-description">50 MB (configurable via REACT_APP_MAX_FILE_SIZE)</p>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">OCR Support</label>
                  <p className="setting-description">Enabled for image and PDF text extraction</p>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Default Translation Language</label>
                  <p className="setting-description">Arabic (configurable via REACT_APP_DEFAULT_TARGET_LANGUAGE)</p>
                </div>
                
                <div className="setting-item">
                  <label className="setting-label">Compression Quality</label>
                  <p className="setting-description">70% (configurable via REACT_APP_COMPRESSION_QUALITY)</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
