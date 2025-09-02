import { Container, Heading, Box, Textarea, Button, Spinner, Center } from '@chakra-ui/react'
import { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { ConversionOptionsForm, type ConversionOptions } from './components/ConversionOptions'
import { convertToC, resizeImage } from './utils/imageConverter'
import type { ImageData } from './utils/imageConverter'

function App() {
  const [convertedCode, setConvertedCode] = useState<string>('')
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [filename, setFilename] = useState<string>('')
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({})
  const [isConverting, setIsConverting] = useState(false)

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

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" flexDirection="column" gap={8}>

        
        <FileUpload onFileSelect={handleFileSelect} />
        
        <ConversionOptionsForm 
          onChange={setConversionOptions}
          originalWidth={imageData?.width}
          originalHeight={imageData?.height}
        />

        {isConverting ? (
          <Center>
            <Spinner size="xl" />
          </Center>
        ) : (
          <Button
            colorScheme="blue"
            onClick={() => {
              if (!imageData) return;
              setIsConverting(true);
              const resizedImage = resizeImage(imageData, conversionOptions.resizeWidth, conversionOptions.resizeHeight);
              const code = convertToC(resizedImage, filename);
              setConvertedCode(code);
              setIsConverting(false);
            }}
            disabled={!imageData}
          >
            Convert with Current Settings
          </Button>
        )}

        {convertedCode && (
          <Box display="flex" flexDirection="column" gap={4}>
            <Textarea
              value={convertedCode}
              readOnly
              height="300px"
              fontFamily="mono"
            />
            <Button onClick={handleCopyToClipboard}>
              Copy to Clipboard
            </Button>
            <Button onClick={handleSaveToFile}>
              Save as Header File
            </Button>
            <Button onClick={async () => {
              if (!imageData) return;
              // For resized images, we need to handle the data differently
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;

              // First convert the RGB565 data back to RGBA for the initial canvas
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d')!;
              tempCanvas.width = imageData.width;
              tempCanvas.height = imageData.height;
              
              const rgba = new Uint8ClampedArray(imageData.width * imageData.height * 4);
              for (let i = 0; i < imageData.data.length; i += 2) {
                const high = imageData.data[i];
                const low = imageData.data[i + 1];
                const value = (high << 8) | low;
                
                const r = (value >> 11) & 0x1F;
                const g = (value >> 5) & 0x3F;
                const b = value & 0x1F;
                
                const j = (i / 2) * 4;
                rgba[j] = (r << 3) | (r >> 2);     // 5 bits to 8 bits
                rgba[j + 1] = (g << 2) | (g >> 4);  // 6 bits to 8 bits
                rgba[j + 2] = (b << 3) | (b >> 2);  // 5 bits to 8 bits
                rgba[j + 3] = 255;                  // Alpha channel
              }
              
              // Put the original image data on the temp canvas
              tempCtx.putImageData(new ImageData(rgba, imageData.width, imageData.height), 0, 0);
              
              // Set up the final canvas with desired dimensions
              const finalWidth = conversionOptions.resizeWidth || imageData.width;
              const finalHeight = conversionOptions.resizeHeight || imageData.height;
              canvas.width = finalWidth;
              canvas.height = finalHeight;
              
              // Draw the resized image using proper image scaling
              ctx.drawImage(tempCanvas, 0, 0, finalWidth, finalHeight);
              
              // Convert to blob and save
              canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const imageFilename = filename.replace(/\.[^/.]+$/, "") + '_resized.bmp';
                a.download = imageFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 'image/bmp');
            }}>
              Save Resized Image
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default App
