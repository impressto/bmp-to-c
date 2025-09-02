export interface ImageData {
  width: number;
  height: number;
  data: Uint8Array;
}

export const resizeImage = (
  imageData: ImageData,
  newWidth?: number,
  newHeight?: number
): ImageData => {
  if (!newWidth && !newHeight) return imageData;

  const aspectRatio = imageData.width / imageData.height;
  const finalWidth = newWidth || Math.round(newHeight! * aspectRatio);
  const finalHeight = newHeight || Math.round(newWidth! / aspectRatio);

  // Create a canvas to resize the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas dimensions
  canvas.width = finalWidth;
  canvas.height = finalHeight;

  // Create temporary canvas for original image
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;

  // Create ImageData and put it on temp canvas
  const originalImgData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
  tempCtx.putImageData(originalImgData, 0, 0);

  // Draw resized image
  ctx.drawImage(tempCanvas, 0, 0, finalWidth, finalHeight);
  
  // Get the resized image data
  const resizedData = ctx.getImageData(0, 0, finalWidth, finalHeight);

  return {
    width: finalWidth,
    height: finalHeight,
    data: new Uint8Array(resizedData.data)
  };
};

export const convertToC = (
  imageData: ImageData,
  options: {
    variableName?: string;
    useConst?: boolean;
    usePROGMEM?: boolean;
  } = {}
): string => {
  const {
    variableName = 'image_data',
    useConst = true,
    usePROGMEM = true
  } = options;

  const declarations: string[] = [];
  const constKeyword = useConst ? 'const ' : '';
  const progmemKeyword = usePROGMEM ? ' PROGMEM' : '';

  // Add image dimensions
  declarations.push(`${constKeyword}int ${variableName}_width = ${imageData.width};`);
  declarations.push(`${constKeyword}int ${variableName}_height = ${imageData.height};`);

  // Convert RGB565 bytes to hex values
  const bytes = Array.from(imageData.data);
  const hexData = [];
  for (let i = 0; i < bytes.length; i += 2) {
    // Bytes are already in RGB565 format, just combine them
    const value = (bytes[i] << 8) | bytes[i + 1];
    hexData.push('0x' + value.toString(16).padStart(4, '0'));
  }
  const formattedHexData = hexData.join(', ');

  // Add image data array as 16-bit values
  declarations.push(
    `${constKeyword}int16_t ${variableName}[]${progmemKeyword} = {
  ${formattedHexData}
};`
  );

  return declarations.join('\n');
};
