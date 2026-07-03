import Link from "next/link";
import { ArrowRight, ImageIcon, Minimize2, Crop, Wand2, FileSearch, ScanSearch, FileImage, Layers, Sliders, Palette, RefreshCw, GitCompare, ZoomIn, RotateCw, FlipHorizontal, Eraser, Sparkles, BrushIcon } from "lucide-react";

export const metadata = {
  title: "Racira Image — 80+ Free Image Tools in Your Browser",
  description: "Resize, compress, crop, convert, and enhance images. 80+ free image tools that run entirely in your browser. No signup, no upload limits.",
  openGraph: {
    title: "Racira Image — Free Image Tools",
    description: "80+ free image tools in your browser. Resize, compress, convert and edit images instantly.",
  },
};

interface Tool {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  built: boolean;
}

interface Category {
  name: string;
  tools: Tool[];
}

const categories: Category[] = [
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

const totalCount = categories.reduce((sum, c) => sum + c.tools.length, 0);

function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ImagePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">Racira</span>{" "}
            <span className="text-foreground">Image</span>
          </Link>
          <div className="text-xs text-muted-foreground">{totalCount} tools</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {/* Hero */}
        <section className="pt-20 pb-16 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-sky-500/10 text-sky-500 mb-6 mx-auto">
            <ImageIcon className="h-8 w-8" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05]">
            All Image Tools You Need —{" "}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              Fast, Simple &amp; Free
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Resize, compress, convert, edit and analyze images. {totalCount}+ free image tools that
            run entirely in your browser. No signup. No upload limits.
          </p>
        </section>

        {/* Category nav */}
        <nav aria-label="Categories" className="mb-12 flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <a
              key={c.name}
              href={`#${slugify(c.name)}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-sky-500 hover:border-sky-400/40 transition-colors"
            >
              {c.name}
            </a>
          ))}
        </nav>

        {/* Tool grid per category */}
        {categories.map((cat) => (
          <section key={cat.name} id={slugify(cat.name)} className="mb-14 scroll-mt-24">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-muted-foreground">
                {cat.name}
              </h2>
              <span className="text-xs text-muted-foreground">{cat.tools.length} tools</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cat.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    href={`/image/tool/${tool.slug}`}
                    className="tool-card group"
                  >
                    <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">{tool.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tool.desc}</p>
                    {tool.built ? (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-500">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="mt-3 inline-block text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70">
                        Coming soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Image — {totalCount} free image tools. Runs entirely in your browser.
      </footer>
    </div>
  );
}
