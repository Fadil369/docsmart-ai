import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorDisplayProps {
  errors: string[];
  onClear: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, onClear }) => {
  if (errors.length === 0) return null;

  return (
    <div className="error-display">
      <div className="error-container">
        <div className="error-header">
          <div className="error-title">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-red-800">
              {errors.length} Error{errors.length > 1 ? 's' : ''} Occurred
            </span>
          </div>
          
          <button
            onClick={onClear}
            className="error-close-btn"
            title="Clear errors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="error-list">
          {errors.map((error, index) => (
            <div key={index} className="error-item">
              <span className="error-text">{error}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
