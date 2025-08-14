import React from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface EnvironmentStatusProps {
  isValid: boolean;
  missingVars: string[];
  onClose: () => void;
}

const EnvironmentStatus: React.FC<EnvironmentStatusProps> = ({
  isValid,
  missingVars,
  onClose
}) => {
  return (
    <div className="environment-status">
      <div className="environment-container">
        <div className="environment-header">
          <div className="environment-title">
            {isValid ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            )}
            <span className="font-semibold">
              Environment Status: {isValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="environment-close-btn"
            title="Close environment status"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="environment-content">
          {isValid ? (
            <div className="environment-success">
              <p className="text-green-700">
                ✅ All required API keys are configured. Full functionality is available.
              </p>
            </div>
          ) : (
            <div className="environment-warning">
              <p className="text-orange-700 mb-3">
                ⚠️ Some API keys are missing. Limited functionality available.
              </p>
              
              <div className="missing-vars">
                <h4 className="font-semibold text-gray-800 mb-2">Missing Environment Variables:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {missingVars.map((varName) => (
                    <li key={varName} className="text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{varName}</code>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="environment-help mt-4">
                <p className="text-sm text-gray-600">
                  To enable full functionality, please set these environment variables in your <code>.env</code> file:
                </p>
                <div className="env-example mt-2 p-3 bg-gray-50 rounded text-sm">
                  {missingVars.map((varName) => (
                    <div key={varName} className="font-mono">
                      {varName}=your_api_key_here
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentStatus;
