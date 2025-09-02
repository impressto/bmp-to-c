import { Container, Heading, Box, Textarea, Button } from '@chakra-ui/react'
import { useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { ConversionOptionsForm, type ConversionOptions } from './components/ConversionOptions'
import { convertToC, resizeImage } from './utils/imageConverter'
import type { ImageData } from './utils/imageConverter'

function App() {
  const [convertedCode, setConvertedCode] = useState<string>('')
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    useConst: true,
    useUnsigned: true,
    usePROGMEM: true,
    variableName: 'image_data'
  })

  const handleFileSelect = async (file: File) => {
    // Get filename without extension for the variable name
    const variableName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_")
    setConversionOptions(prev => ({ ...prev, variableName }))

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
      
      setImageData({
        width: img.width,
        height: img.height,
        data: rgb565Data
      })
      
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }

  const handleConvert = () => {
    if (!imageData) return

    const resizedImage = resizeImage(
      imageData,
      conversionOptions.resizeWidth,
      conversionOptions.resizeHeight
    )

    const code = convertToC(resizedImage, conversionOptions)
    setConvertedCode(code)
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(convertedCode)
  }

  const handleSaveToFile = () => {
    const blob = new Blob([convertedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'image_data.h'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" flexDirection="column" gap={8}>
        <Heading as="h1" size="xl" textAlign="center">
          BMP to C Array Converter
        </Heading>
        
        <FileUpload onFileSelect={handleFileSelect} />
        
        <ConversionOptionsForm onChange={setConversionOptions} />
        
        <Button
          colorScheme="blue"
          onClick={handleConvert}
          disabled={!imageData}
        >
          Convert
        </Button>

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
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default App
