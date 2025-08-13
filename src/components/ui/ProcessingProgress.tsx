import React from 'react';

interface ProcessingProgressProps {
  progress: number;
  message?: string;
}

const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  progress,
  message = 'Processing documents...'
}) => {
  return (
    <div className="processing-progress">
      <div className="progress-container">
        <div className="progress-info">
          <span className="progress-message">{message}</span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
        
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessingProgress;
