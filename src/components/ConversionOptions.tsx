import { useState } from 'react';
import {
  Box,
  Input,
  Text,
  FormControl,
  FormLabel,
  VStack,
  HStack,
} from '@chakra-ui/react';

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
    <VStack spacing={4} align="stretch">
      <Box>
        <FormLabel>Resize Image</FormLabel>
        <HStack spacing={4}>
          <FormControl>
            <Input
              type="number"
              placeholder={originalWidth ? `Width (${originalWidth})` : 'Width'}
              value={options.resizeWidth || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('resizeWidth', value);
              }}
            />
          </FormControl>
          <Text>x</Text>
          <FormControl>
            <Input
              type="number"
              placeholder={originalHeight ? `Height (${originalHeight})` : 'Height'}
              value={options.resizeHeight || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('resizeHeight', value);
              }}
            />
          </FormControl>
        </HStack>
      </Box>




    </VStack>
  );
};
