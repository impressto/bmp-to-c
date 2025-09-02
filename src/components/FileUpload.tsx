import { Box, Input, Text, Image } from '@chakra-ui/react';
import { useState } from 'react';
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

  return (
    <Box>
      <Input
        type="file"
        accept=".bmp"
        onChange={handleFileChange}
        p={2}
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="md"
      />

      {fileInfo && (
        <Box mt={4}>
          <Text><strong>Name:</strong> {fileInfo.name}</Text>
          <Text><strong>Size:</strong> {fileInfo.size}</Text>
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
