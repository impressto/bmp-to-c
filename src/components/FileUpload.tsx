import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import type { ChangeEvent } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onExampleClick?: () => void;
}

export interface FileUploadHandle {
  triggerFileSelect: (file: File) => void;
}


export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(({ onFileSelect, onExampleClick }, ref) => {
  // Preview is always the PNG image for display
  const previewPngUrl = '/images/rainbow_spiral.png';
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);

  const triggerFileSelect = (file: File) => {
    setFileInfo({
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });
    onFileSelect(file);
  };

  useImperativeHandle(ref, () => ({ triggerFileSelect }));


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    triggerFileSelect(file);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="file-upload">
      <input
        type="file"
        accept=".bmp"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button
        className="upload-button"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16h6M12 16V8M12 8l3 3M12 8l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Select BMP File
      </button>
      {onExampleClick && (
        <button className="example-image-button" onClick={onExampleClick}>
          Use Example File
        </button>
      )}

      {fileInfo && (
        <div className="file-info">
          <p><strong>Name:</strong> {fileInfo.name} - <strong>Size:</strong> {fileInfo.size}</p>
        </div>
      )}

      {fileInfo && (
        <div className="preview-container">
          <p className="preview-title">Preview:</p>
          <img 
            src={previewPngUrl} 
            alt="Preview" 
            className="preview-image"
          />
        </div>
      )}
    </div>
  );
});
