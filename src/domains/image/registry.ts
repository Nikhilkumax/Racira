import { Minimize2, Crop, Wand2, FileSearch, ScanSearch, FileImage, Layers, Sliders, Palette, RefreshCw, GitCompare, ZoomIn, RotateCw, FlipHorizontal, Eraser, Sparkles, BrushIcon } from "lucide-react";
import React from "react";

export interface Tool {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  built: boolean;
}

export interface Category {
  name: string;
  tools: Tool[];
}

export const categories: Category[] = [
  {
    name: "Conversion",
    tools: [
      { name: "JPG to PNG", slug: "jpg-to-png", desc: "Convert JPEG images to PNG with transparency support.", icon: RefreshCw, built: false },
      { name: "PNG to JPG", slug: "png-to-jpg", desc: "Convert PNG files to JPEG with quality control.", icon: RefreshCw, built: false },
      { name: "WebP Converter", slug: "webp-converter", desc: "Convert any image to or from WebP format.", icon: RefreshCw, built: false },
      { name: "HEIC to JPG", slug: "heic-to-jpg", desc: "Convert iPhone HEIC photos to universal JPG.", icon: RefreshCw, built: false },
      { name: "SVG to PNG", slug: "svg-to-png", desc: "Render SVG vector files to raster PNG images.", icon: RefreshCw, built: false },
      { name: "GIF to MP4", slug: "gif-to-mp4", desc: "Convert animated GIFs to lightweight MP4 video.", icon: RefreshCw, built: false },
      { name: "AVIF Converter", slug: "avif-converter", desc: "Convert images to or from AVIF for next-gen compression.", icon: RefreshCw, built: false },
      { name: "BMP to PNG", slug: "bmp-to-png", desc: "Convert bitmap BMP files to PNG.", icon: RefreshCw, built: false },
    ],
  },
  {
    name: "Compression & Optimization",
    tools: [
      { name: "Image Compressor", slug: "image-compressor", desc: "Reduce file size without visible quality loss.", icon: Minimize2, built: false },
      { name: "PNG Compressor", slug: "png-compressor", desc: "Losslessly shrink PNG files for faster loads.", icon: Minimize2, built: false },
      { name: "JPEG Optimizer", slug: "jpeg-optimizer", desc: "Optimize JPEG quality vs. file size balance.", icon: Minimize2, built: false },
      { name: "Batch Image Compressor", slug: "batch-image-compressor", desc: "Compress multiple images in one go.", icon: Layers, built: false },
      { name: "Image Size Reducer", slug: "image-size-reducer", desc: "Downscale images to hit a target file size.", icon: Minimize2, built: false },
    ],
  },
  {
    name: "Resizing & Cropping",
    tools: [
      { name: "Image Resizer", slug: "image-resizer", desc: "Resize images to exact pixel or percentage dimensions.", icon: ZoomIn, built: false },
      { name: "Image Cropper", slug: "image-cropper", desc: "Crop images to custom dimensions or aspect ratios.", icon: Crop, built: false },
      { name: "Aspect Ratio Cropper", slug: "aspect-ratio-cropper", desc: "Crop images to standard aspect ratios instantly.", icon: Crop, built: false },
      { name: "Bulk Image Resizer", slug: "bulk-image-resizer", desc: "Resize multiple images to the same dimensions.", icon: Layers, built: false },
      { name: "Image Rotator", slug: "image-rotator", desc: "Rotate images by any angle.", icon: RotateCw, built: false },
      { name: "Image Flipper", slug: "image-flipper", desc: "Flip images horizontally or vertically.", icon: FlipHorizontal, built: false },
      { name: "Canvas Extender", slug: "canvas-extender", desc: "Add padding or extend the canvas around an image.", icon: ZoomIn, built: false },
    ],
  },
  {
    name: "Editing & Enhancement",
    tools: [
      { name: "Background Remover", slug: "background-remover", desc: "Remove image backgrounds with AI precision.", icon: Eraser, built: false },
      { name: "Image Editor", slug: "image-editor", desc: "Full-featured browser-based image editor.", icon: BrushIcon, built: false },
      { name: "Photo Enhancer", slug: "photo-enhancer", desc: "Auto-enhance brightness, contrast, and sharpness.", icon: Sparkles, built: false },
      { name: "Watermark Adder", slug: "watermark-adder", desc: "Add text or image watermarks to photos.", icon: Layers, built: false },
      { name: "Color Adjuster", slug: "color-adjuster", desc: "Adjust hue, saturation, and brightness.", icon: Sliders, built: false },
      { name: "Grayscale Converter", slug: "grayscale-converter", desc: "Convert color images to black and white.", icon: Palette, built: false },
      { name: "Image Sharpener", slug: "image-sharpener", desc: "Sharpen blurry or soft images.", icon: Wand2, built: false },
      { name: "Blur Tool", slug: "blur-tool", desc: "Apply Gaussian or radial blur effects.", icon: Wand2, built: false },
    ],
  },
  {
    name: "Analysis & Metadata",
    tools: [
      { name: "Image Metadata Viewer", slug: "image-metadata-viewer", desc: "Inspect EXIF, IPTC, and XMP metadata from any image.", icon: FileSearch, built: false },
      { name: "EXIF Remover", slug: "exif-remover", desc: "Strip all metadata for privacy before sharing.", icon: Eraser, built: false },
      { name: "Color Palette Extractor", slug: "color-palette-extractor", desc: "Extract dominant colors from any image.", icon: Palette, built: false },
      { name: "Image Comparison Tool", slug: "image-comparison", desc: "Compare two images side by side or with a slider.", icon: GitCompare, built: false },
      { name: "Image Info Analyzer", slug: "image-info-analyzer", desc: "Get width, height, DPI, color depth and more.", icon: ScanSearch, built: false },
      { name: "Screenshot to PDF", slug: "screenshot-to-pdf", desc: "Convert images or screenshots into PDF files.", icon: FileImage, built: false },
    ],
  },
];
