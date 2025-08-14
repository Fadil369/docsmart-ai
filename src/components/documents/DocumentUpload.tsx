import React, { useCallback, useState } from 'react';
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface DocumentUploadProps {
  onUpload: (files: FileList | File[]) => Promise<void>;
  isProcessing: boolean;
  disabled?: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  isProcessing,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragOver(true);
    }
  }, [disabled, isProcessing]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isProcessing) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files);
    }
  }, [disabled, isProcessing, onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
    // Reset input
    e.target.value = '';
  }, [onUpload]);

  return (
    <div className="document-upload">
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.zip,.tar,.gz"
          onChange={handleFileInput}
          disabled={disabled || isProcessing}
          className="file-input"
          id="file-upload"
        />
        
        <label htmlFor="file-upload" className="upload-label">
          <div className="upload-content">
            {isProcessing ? (
              <>
                <div className="upload-spinner"></div>
                <h3 className="upload-title">Processing Documents...</h3>
                <p className="upload-description">Please wait while we process your files</p>
              </>
            ) : disabled ? (
              <>
                <DocumentIcon className="upload-icon text-gray-400" />
                <h3 className="upload-title text-gray-500">Upload Disabled</h3>
                <p className="upload-description text-gray-400">
                  Please configure your API keys to enable document upload
                </p>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="upload-icon" />
                <h3 className="upload-title">Upload Documents</h3>
                <p className="upload-description">
                  Drag and drop files here, or click to select
                </p>
                <p className="upload-formats">
                  Supports: PDF, Word, Excel, PowerPoint, Images, Text, Archives
                </p>
              </>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default DocumentUpload;
