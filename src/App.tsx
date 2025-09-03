import { useState, useRef } from 'react'

// Header and source code link
const AppHeader = () => (
  <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
    <h2>Generate C code from a BMP file for use with TFT displays.</h2>
    <div>
      Source code for this tool: <a href="https://github.com/impressto/bmp-to-c" target="_blank" rel="noopener noreferrer">https://github.com/impressto/bmp-to-c</a>
    </div>
  </div>
);
import { FileUpload } from './components/FileUpload'
import type { FileUploadHandle } from './components/FileUpload'
import { ConversionOptionsForm, type ConversionOptions } from './components/ConversionOptions'
import { convertToC, resizeImage } from './utils/imageConverter'
import type { ImageData } from './utils/imageConverter'
import './App.css'

function App() {
  const [convertedCode, setConvertedCode] = useState<string>('')
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [filename, setFilename] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)

  const [currentOptions, setCurrentOptions] = useState<ConversionOptions>({})

  const handleConversionOptionsChange = (options: ConversionOptions) => {
    setCurrentOptions(options)
  }

  const handleConvert = () => {
    if (!imageData) return
    // Apply current resize options when converting
    if (currentOptions.resizeWidth || currentOptions.resizeHeight) {
      const resizedImage = resizeImage(imageData, currentOptions.resizeWidth, currentOptions.resizeHeight)
      const code = convertToC(resizedImage, filename)
      setConvertedCode(code)
    } else {
      const code = convertToC(imageData, filename)
      setConvertedCode(code)
    }
  }

  const handleFileSelect = async (file: File) => {
    setFilename(file.name)
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Create a temporary canvas to get image dimensions
    const img = new Image()
    const blob = new Blob([uint8Array], { type: 'image/bmp' })
    const url = URL.createObjectURL(blob)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      
      const imgData = ctx.getImageData(0, 0, img.width, img.height)
      // Convert RGBA to RGB565 format
      const rgbaData = new Uint8Array(imgData.data);
      const rgb565Data = new Uint8Array(img.width * img.height * 2);
      
      for (let i = 0, j = 0; i < rgbaData.length; i += 4, j += 2) {
        const r = rgbaData[i];
        const g = rgbaData[i + 1];
        const b = rgbaData[i + 2];
        
        // Convert RGB to RGB565
        const rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
        rgb565Data[j] = (rgb565 >> 8) & 0xFF;  // High byte
        rgb565Data[j + 1] = rgb565 & 0xFF;     // Low byte
      }
      
      const newImageData = {
        width: img.width,
        height: img.height,
        data: rgb565Data
      };
      
      setImageData(newImageData);

      // Do initial conversion
      setIsConverting(true);
      const code = convertToC(newImageData, file.name);
      setConvertedCode(code);
      setIsConverting(false);
      
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }


  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(convertedCode)
  }

  const handleSaveToFile = () => {
    const blob = new Blob([convertedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const headerFilename = filename.replace(/\.[^/.]+$/, "") + '.h'
    a.download = headerFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSaveImage = async () => {
    if (!imageData) return

    // Use resized image if resize options are present
    const finalImage = (currentOptions.resizeWidth || currentOptions.resizeHeight) 
      ? resizeImage(imageData, currentOptions.resizeWidth, currentOptions.resizeHeight)
      : imageData

    // Create a canvas with the current image data
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = finalImage.width
    canvas.height = finalImage.height

    // Convert RGB565 back to RGBA
    const rgba = new Uint8ClampedArray(finalImage.width * finalImage.height * 4)
    for (let i = 0; i < finalImage.data.length; i += 2) {
      const high = finalImage.data[i]
      const low = finalImage.data[i + 1]
      const value = (high << 8) | low
      
      // Extract RGB components from RGB565
      const r5 = (value >> 11) & 0x1F;  // 5 bits for red
      const g6 = (value >> 5) & 0x3F;   // 6 bits for green
      const b5 = value & 0x1F;          // 5 bits for blue
      
      // Convert to 8-bit color channels
      const r8 = Math.round((r5 * 255) / 31);  // Scale 5 bits to 8 bits
      const g8 = Math.round((g6 * 255) / 63);  // Scale 6 bits to 8 bits
      const b8 = Math.round((b5 * 255) / 31);  // Scale 5 bits to 8 bits
      
      const j = (i / 2) * 4
      rgba[j] = r8;        // Red channel
      rgba[j + 1] = g8;    // Green channel
      rgba[j + 2] = b8;    // Blue channel
      rgba[j + 3] = 255;   // Alpha channel
    }

    // Put the image data on the canvas
    ctx.putImageData(new ImageData(rgba, finalImage.width, finalImage.height), 0, 0)

    // Convert canvas to blob and download
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(blob => resolve(blob!), 'image/bmp'))
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const bmpFilename = filename.replace(/\.[^/.]+$/, "") + '_converted.bmp'
    a.download = bmpFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Ref for FileUpload to allow programmatic file selection
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const handleLoadExampleImage = async () => {
  const response = await fetch('/images/rainbow_spiral.bmp');
    const blob = await response.blob();
    const file = new File([blob], 'rainbow_spiral.bmp', { type: 'image/bmp' });
    fileUploadRef.current?.triggerFileSelect(file);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AppHeader />
      <div className="content" style={{ width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
          <FileUpload ref={fileUploadRef} onFileSelect={handleFileSelect} onExampleClick={handleLoadExampleImage} />
        </div>

        {imageData && (
          <ConversionOptionsForm
            onChange={handleConversionOptionsChange}
            originalWidth={imageData.width}
            originalHeight={imageData.height}
          />
        )}

        {isConverting ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : imageData && (
          <button className="convert-button" onClick={handleConvert}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4v16M12 20l3-3M12 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {(currentOptions.resizeWidth || currentOptions.resizeHeight) ? 'Reconvert to C' : 'Convert to C'}
          </button>
        )}

        {convertedCode && (
          <div className="output-section">
            <textarea
              value={convertedCode}
              readOnly
              rows={10}
              className="output-textarea"
            />
            <div className="button-group">
              <button className="action-button" onClick={handleCopyToClipboard}>
                Copy to Clipboard
              </button>
              <button className="action-button" onClick={handleSaveToFile}>
                Save to File
              </button>
              <button className="action-button" onClick={handleSaveImage}>
                Save Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
