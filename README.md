
# bitmap converter

This project allows users to upload bitmap (BMP) images and convert them into C code arrays. The generated C code can then be saved as a header file (`.h`) for use in ESP32 and Arduino projects that utilize TFT displays.

## Purpose

Working with images on embedded systems like the ESP32 and Arduino can be challenging, especially when using TFT displays. This tool simplifies the process by:

- Accepting bitmap images as input.
- Converting the image into C array data.
- Allowing the result to be exported as a header file.

This makes it easy for developers to include custom graphics, icons, or splash screens directly into their microcontroller code without manually converting image data.

## Tech Stack

- **React + TypeScript + Vite**: Frontend framework with fast development and HMR (Hot Module Replacement).
- **ESLint configuration**: For code consistency and quality.

## How It Works

1. Upload a bitmap image (`.bmp`).
2. The application processes the image and generates equivalent C array data.
3. Save the output as a `.h` header file.
4. Include the header in your ESP32 or Arduino project to display the image on a TFT screen.

## Example Use Case

- Adding a company logo to an ESP32-based IoT device.
- Displaying icons on a small TFT screen for an Arduino project.
- Creating lightweight custom graphics for embedded dashboards.

