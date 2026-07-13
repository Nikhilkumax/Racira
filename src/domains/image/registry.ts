import { inferIcon } from "@/components/shared/icon-map";
import { Tool } from "@/domains/_types";
import React from "react";

export const categories: any[] = [
  {
    name: "Conversion",
    tools: [
      { name: "JPG to PNG", slug: "jpg-to-png", description: "Convert JPEG images to PNG with transparency support.", icon: inferIcon("JPG to PNG", "jpg-to-png"), status: "soon" },
      { name: "PNG to JPG", slug: "png-to-jpg", description: "Convert PNG files to JPEG with quality control.", icon: inferIcon("PNG to JPG", "png-to-jpg"), status: "soon" },
      { name: "WebP Converter", slug: "webp-converter", description: "Convert any image to or from WebP format.", icon: inferIcon("WebP Converter", "webp-converter"), status: "soon" },
      { name: "HEIC to JPG", slug: "heic-to-jpg", description: "Convert iPhone HEIC photos to universal JPG.", icon: inferIcon("HEIC to JPG", "heic-to-jpg"), status: "soon" },
      { name: "SVG to PNG", slug: "svg-to-png", description: "Render SVG vector files to raster PNG images.", icon: inferIcon("SVG to PNG", "svg-to-png"), status: "soon" },
      { name: "GIF to MP4", slug: "gif-to-mp4", description: "Convert animated GIFs to lightweight MP4 video.", icon: inferIcon("GIF to MP4", "gif-to-mp4"), status: "soon" },
      { name: "AVIF Converter", slug: "avif-converter", description: "Convert images to or from AVIF for next-gen compression.", icon: inferIcon("AVIF Converter", "avif-converter"), status: "soon" },
      { name: "BMP to PNG", slug: "bmp-to-png", description: "Convert bitmap BMP files to PNG.", icon: inferIcon("BMP to PNG", "bmp-to-png"), status: "soon" },
    ],
  },
  {
    name: "Compression & Optimization",
    tools: [
      { name: "Image Compressor", slug: "image-compressor", description: "Reduce file size without visible quality loss.", icon: inferIcon("Image Compressor", "image-compressor"), status: "soon" },
      { name: "PNG Compressor", slug: "png-compressor", description: "Losslessly shrink PNG files for faster loads.", icon: inferIcon("PNG Compressor", "png-compressor"), status: "soon" },
      { name: "JPEG Optimizer", slug: "jpeg-optimizer", description: "Optimize JPEG quality vs. file size balance.", icon: inferIcon("JPEG Optimizer", "jpeg-optimizer"), status: "soon" },
      { name: "Batch Image Compressor", slug: "batch-image-compressor", description: "Compress multiple images in one go.", icon: inferIcon("Batch Image Compressor", "batch-image-compressor"), status: "soon" },
      { name: "Image Size Reducer", slug: "image-size-reducer", description: "Downscale images to hit a target file size.", icon: inferIcon("Image Size Reducer", "image-size-reducer"), status: "soon" },
    ],
  },
  {
    name: "Resizing & Cropping",
    tools: [
      { name: "Image Resizer", slug: "image-resizer", description: "Resize images to exact pixel or percentage dimensions.", icon: inferIcon("Image Resizer", "image-resizer"), status: "soon" },
      { name: "Image Cropper", slug: "image-cropper", description: "Crop images to custom dimensions or aspect ratios.", icon: inferIcon("Image Cropper", "image-cropper"), status: "soon" },
      { name: "Aspect Ratio Cropper", slug: "aspect-ratio-cropper", description: "Crop images to standard aspect ratios instantly.", icon: inferIcon("Aspect Ratio Cropper", "aspect-ratio-cropper"), status: "soon" },
      { name: "Bulk Image Resizer", slug: "bulk-image-resizer", description: "Resize multiple images to the same dimensions.", icon: inferIcon("Bulk Image Resizer", "bulk-image-resizer"), status: "soon" },
      { name: "Image Rotator", slug: "image-rotator", description: "Rotate images by any angle.", icon: inferIcon("Image Rotator", "image-rotator"), status: "soon" },
      { name: "Image Flipper", slug: "image-flipper", description: "Flip images horizontally or vertically.", icon: inferIcon("Image Flipper", "image-flipper"), status: "soon" },
      { name: "Canvas Extender", slug: "canvas-extender", description: "Add padding or extend the canvas around an image.", icon: inferIcon("Canvas Extender", "canvas-extender"), status: "soon" },
    ],
  },
  {
    name: "Editing & Enhancement",
    tools: [
      { name: "Background Remover", slug: "background-remover", description: "Remove image backgrounds with AI precision.", icon: inferIcon("Background Remover", "background-remover"), status: "soon" },
      { name: "Image Editor", slug: "image-editor", description: "Full-featured browser-based image editor.", icon: inferIcon("Image Editor", "image-editor"), status: "soon" },
      { name: "Photo Enhancer", slug: "photo-enhancer", description: "Auto-enhance brightness, contrast, and sharpness.", icon: inferIcon("Photo Enhancer", "photo-enhancer"), status: "soon" },
      { name: "Watermark Adder", slug: "watermark-adder", description: "Add text or image watermarks to photos.", icon: inferIcon("Watermark Adder", "watermark-adder"), status: "soon" },
      { name: "Color Adjuster", slug: "color-adjuster", description: "Adjust hue, saturation, and brightness.", icon: inferIcon("Color Adjuster", "color-adjuster"), status: "soon" },
      { name: "Grayscale Converter", slug: "grayscale-converter", description: "Convert color images to black and white.", icon: inferIcon("Grayscale Converter", "grayscale-converter"), status: "soon" },
      { name: "Image Sharpener", slug: "image-sharpener", description: "Sharpen blurry or soft images.", icon: inferIcon("Image Sharpener", "image-sharpener"), status: "soon" },
      { name: "Blur Tool", slug: "blur-tool", description: "Apply Gaussian or radial blur effects.", icon: inferIcon("Blur Tool", "blur-tool"), status: "soon" },
    ],
  },
  {
    name: "Analysis & Metadata",
    tools: [
      { name: "Image Metadata Viewer", slug: "image-metadata-viewer", description: "Inspect EXIF, IPTC, and XMP metadata from any image.", icon: inferIcon("Image Metadata Viewer", "image-metadata-viewer"), status: "soon" },
      { name: "EXIF Remover", slug: "exif-remover", description: "Strip all metadata for privacy before sharing.", icon: inferIcon("EXIF Remover", "exif-remover"), status: "soon" },
      { name: "Color Palette Extractor", slug: "color-palette-extractor", description: "Extract dominant colors from any image.", icon: inferIcon("Color Palette Extractor", "color-palette-extractor"), status: "soon" },
      { name: "Image Comparison Tool", slug: "image-comparison", description: "Compare two images side by side or with a slider.", icon: inferIcon("Image Comparison Tool", "image-comparison"), status: "soon" },
      { name: "Image Info Analyzer", slug: "image-info-analyzer", description: "Get width, height, DPI, color depth and more.", icon: inferIcon("Image Info Analyzer", "image-info-analyzer"), status: "soon" },
      { name: "Screenshot to PDF", slug: "screenshot-to-pdf", description: "Convert images or screenshots into PDF files.", icon: inferIcon("Screenshot to PDF", "screenshot-to-pdf"), status: "soon" },
    ],
  },
];

export function getImageToolBySlug(slug: string) {
  for (const cat of categories) {
    for (const tool of cat.tools) {
      if (tool.slug === slug) return tool;
    }
  }
  return null;
}
