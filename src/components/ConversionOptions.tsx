import { useState } from 'react';
import {
  Box,
  Input,
  Text,
  Checkbox,
  FormControl,
  FormLabel,
  VStack,
  HStack,
} from '@chakra-ui/react';

export interface ConversionOptions {
  resizeWidth?: number;
  resizeHeight?: number;
  useConst: boolean;
  usePROGMEM: boolean;
  variableName: string;
}

interface ConversionOptionsFormProps {
  onChange: (options: ConversionOptions) => void;
}

export const ConversionOptionsForm = ({ onChange }: ConversionOptionsFormProps) => {
  const [options, setOptions] = useState<ConversionOptions>({
    useConst: true,
    usePROGMEM: true,
    variableName: 'image_data'
  });

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
              placeholder="Width"
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
              placeholder="Height"
              value={options.resizeHeight || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('resizeHeight', value);
              }}
            />
          </FormControl>
        </HStack>
      </Box>

      <FormControl>
        <FormLabel>Variable Name</FormLabel>
        <Input
          value={options.variableName}
          onChange={(e) => handleChange('variableName', e.target.value)}
        />
      </FormControl>

      <FormControl display="flex" alignItems="center">
        <FormLabel mb="0">Use const</FormLabel>
        <Checkbox
          isChecked={options.useConst}
          onChange={(e) => handleChange('useConst', e.target.checked)}
        />
      </FormControl>


      <FormControl display="flex" alignItems="center">
        <FormLabel mb="0">Use PROGMEM</FormLabel>
        <Checkbox
          isChecked={options.usePROGMEM}
          onChange={(e) => handleChange('usePROGMEM', e.target.checked)}
        />
      </FormControl>
    </VStack>
  );
};
