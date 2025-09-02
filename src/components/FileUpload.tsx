import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update file info
    setFileInfo({
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    // Create preview if it's an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
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

      {fileInfo && (
        <div className="file-info">
          <p><strong>Name:</strong> {fileInfo.name} - <strong>Size:</strong> {fileInfo.size}</p>
        </div>
      )}

      {preview && (
        <div className="preview-container">
          <p className="preview-title">Preview:</p>
          <img 
            src={preview} 
            alt="Preview" 
            className="preview-image"
          />
        </div>
      )}
    </div>
  );
};
