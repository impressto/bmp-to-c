import { useState } from 'react';
import './ConversionOptions.css';

export interface ConversionOptions {
  resizeWidth?: number;
  resizeHeight?: number;
}

interface ConversionOptionsFormProps {
  onChange: (options: ConversionOptions) => void;
  originalWidth?: number;
  originalHeight?: number;
}

export const ConversionOptionsForm = ({ onChange, originalWidth, originalHeight }: ConversionOptionsFormProps) => {
  const [options, setOptions] = useState<ConversionOptions>({});

  const handleChange = (field: keyof ConversionOptions, value: any) => {
    const newOptions = { ...options, [field]: value };
    setOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="options-container">
      <div className="resize-group">
        <label>Resize Image</label>
        <div className="dimensions-input">
          <div className="input-group">
            <input
              type="number"
              placeholder={originalWidth ? `Width (${originalWidth})` : 'Width'}
              value={options.resizeWidth || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('resizeWidth', value);
              }}
            />
          </div>
          <span className="dimension-separator">x</span>
          <div className="input-group">
            <input
              type="number"
              placeholder={originalHeight ? `Height (${originalHeight})` : 'Height'}
              value={options.resizeHeight || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('resizeHeight', value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
