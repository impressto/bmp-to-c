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

  // Convert RGB565 back to RGBA
  const rgba = new Uint8ClampedArray(imageData.width * imageData.height * 4);
  for (let i = 0; i < imageData.data.length; i += 2) {
    const high = imageData.data[i];
    const low = imageData.data[i + 1];
    const value = (high << 8) | low;
    
    // Extract RGB components from RGB565
    const r5 = (value >> 11) & 0x1F;  // 5 bits for red
    const g6 = (value >> 5) & 0x3F;   // 6 bits for green
    const b5 = value & 0x1F;          // 5 bits for blue
    
    // Convert to 8-bit color channels using proper scaling
    const j = (i / 2) * 4;
    rgba[j] = Math.round((r5 * 255) / 31);     // Scale 5 bits to 8 bits
    rgba[j + 1] = Math.round((g6 * 255) / 63); // Scale 6 bits to 8 bits
    rgba[j + 2] = Math.round((b5 * 255) / 31); // Scale 5 bits to 8 bits
    rgba[j + 3] = 255;                         // Alpha channel
  }

  // Create ImageData and put it on temp canvas
  const originalImgData = new ImageData(rgba, imageData.width, imageData.height);
  tempCtx.putImageData(originalImgData, 0, 0);

  // Draw resized image
  ctx.drawImage(tempCanvas, 0, 0, finalWidth, finalHeight);
  
  // Get the resized image data
  const resizedData = ctx.getImageData(0, 0, finalWidth, finalHeight);
  
  // Convert back to RGB565
  const rgb565Data = new Uint8Array(finalWidth * finalHeight * 2);
  for (let i = 0, j = 0; i < resizedData.data.length; i += 4, j += 2) {
    const r = resizedData.data[i];
    const g = resizedData.data[i + 1];
    const b = resizedData.data[i + 2];
    
    // Convert to RGB565
    const r5 = Math.round((r * 31) / 255);  // Scale to 5 bits
    const g6 = Math.round((g * 63) / 255);  // Scale to 6 bits
    const b5 = Math.round((b * 31) / 255);  // Scale to 5 bits
    
    const rgb565 = (r5 << 11) | (g6 << 5) | b5;
    rgb565Data[j] = (rgb565 >> 8) & 0xFF;     // High byte
    rgb565Data[j + 1] = rgb565 & 0xFF;        // Low byte
  }

  return {
    width: finalWidth,
    height: finalHeight,
    data: rgb565Data
  };
};

export const convertToC = (
  imageData: ImageData,
  filename: string
): string => {
  const declarations: string[] = [];
  const variableName = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_");
  const progmemKeyword = ' PROGMEM';

  // Convert RGB565 bytes to hex values
  const bytes = Array.from(imageData.data);
  const hexData = [];
  for (let i = 0; i < bytes.length; i += 2) {
    // Bytes are already in RGB565 format, just combine them
    const value = (bytes[i] << 8) | bytes[i + 1];
    hexData.push('0x' + value.toString(16).padStart(4, '0'));
  }
  const formattedHexData = hexData.join(', ');

  // Calculate array size
  const arraySize = hexData.length;
  
  // Add image data array as 16-bit values with size comment
  declarations.push(
    `// array size is ${arraySize}\nint16_t ${variableName}[]${progmemKeyword} = {
  ${formattedHexData}
};`
  );

  return declarations.join('\n');
};
