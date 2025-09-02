import { Box, Button, Text, Image } from '@chakra-ui/react';
import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';

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
    <Box>
      <input
        type="file"
        accept=".bmp"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button
        colorScheme="blackAlpha"
        size="lg"
        onClick={() => fileInputRef.current?.click()}
        leftIcon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16h6M12 16V8M12 8l3 3M12 8l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      >
        Choose BMP File
      </Button>

      {fileInfo && (
        <Box mt={4}>
          <Text><strong>Name:</strong> {fileInfo.name} - <strong>Size:</strong> {fileInfo.size}</Text>
        </Box>
      )}

      {preview && (
        <Box mt={4} border="1px solid" borderColor="gray.200" p={2}>
          <Text mb={2}>Preview:</Text>
          <Image 
            src={preview} 
            alt="Preview" 
            maxH="200px"
            objectFit="contain"
          />
        </Box>
      )}
    </Box>
  );
};
