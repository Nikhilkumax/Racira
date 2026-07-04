import {
  FileText, Scissors, LayoutGrid, RotateCw, Hash, Trash2,
  Minimize2, SlidersHorizontal, Copy, FilePlus, ArrowUpDown,
  Image as ImageIcon, FileImage, Globe, Type, FileCode, Camera, Paintbrush,
  ImageDown, ImageUp, FileDown, Images,
  Lock, Unlock, ShieldCheck, ShieldOff, KeyRound, KeySquare, Ban, ShieldX,
  PenTool, Pencil, Upload, Keyboard, Signature, FormInput, SquarePen, Layers,
  Highlighter, Underline, Strikethrough, Shapes, Brush, MessageSquare, StickyNote,
  ImagePlus, Stamp, Droplets, AlignStartHorizontal,
  Eye, Grid3x3, ZoomIn, Search, Maximize, Moon, Printer, Download, Info, Edit3,
  ScanLine, FileSearch, ClipboardCopy, Database,
  Crop, Columns, Contrast, Palette, BookOpen, Repeat, FileType,
  Bookmark, Paperclip, Binary, Ruler, FileJson, FileSpreadsheet, BookMarked,
  Archive, Link2, Sparkles, ListOrdered, Eraser,
  RefreshCw, Combine, SplitSquareHorizontal, FileCheck, FileX, Calendar,
  Filter, Shuffle, Move, ArrowLeftRight, QrCode, Barcode, Replace,
  PaintBucket, BarChart3, Boxes, Link, Accessibility, GitBranch, Code,
  AtSign, Globe2, BookText, Clock, LayoutTemplate, Grid2x2, Sliders, Tag,
  ScrollText, FileDigit, Gauge, FlipHorizontal, FlipVertical, Square, FileArchive,
  Table, Bomb, Shield, ArrowUpRight, MessageCircle, Grid, Expand, Asterisk, Map, Languages, PieChart, Phone, Calculator, BarChart, Text, AlignLeft, Volume2, Book, IdCard, FilePlus2, FolderOutput, MousePointerClick, FileType2, FileCog, Minimize
} from "lucide-react";

export type ToolInput = {
  type: "text" | "number" | "select" | "file" | "textarea";
  key: string;
  label: string;
  placeholder?: string;
  default?: any;
  min?: number;
  max?: number;
  accept?: string;
  options?: { label: string; value: string }[];
};

export interface Tool {
  name: string;
  slug: string;
  description: string;
  icon: typeof FileText;
  category: string;
  subCategory?: string;
  inputs?: ToolInput[];
}

export const tools: Tool[] = [
  // ============ ORGANIZE PDF (22) ============
  { name: "Extract Pages", slug: 'extract-pages', description: "Pull selected pages into a new PDF", icon: FileDown, category: 'pdf', subCategory: 'Organize PDF' },
  { name: "Rearrange Pages", slug: "organize-pages", description: "Reorder pages with drag and drop", icon: LayoutGrid, category: 'pdf', subCategory: 'Organize PDF' },
  { name: "Reverse Page Order", slug: "reverse-pages", description: "Flip the page order of a PDF", icon: ArrowUpDown, category: 'pdf', subCategory: 'Organize PDF' },
  { name: "Add Headers/Footers", slug: "headers-footers", description: "Add headers and footers to pages", icon: AlignStartHorizontal, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'Split Odd / Even Pages', slug: 'split-odd-even', description: 'Separate odd and even pages', icon: Scissors, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'Clone Pages', slug: 'clone-pages', description: 'Duplicate specific pages', icon: Copy, category: 'pdf', subCategory: 'Organize PDF',
    inputs: [
      { type: 'text', key: 'pages', label: 'Page numbers to clone (e.g. 1,3)', placeholder: '1,2,3' },
      { type: 'number', key: 'copies', label: 'Number of copies', min: 1, default: 2 }
    ] },
  { name: 'Remove Blank Pages', slug: 'remove-blank-pages', description: 'Detect and remove empty pages', icon: Eraser, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'Swap Pages', slug: 'swap-pages', description: 'Swap two pages', icon: Shuffle, category: 'pdf', subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'pageA', label: 'Page A', min: 1, default: 1 },
      { type: 'number', key: 'pageB', label: 'Page B', min: 1, default: 2 }
    ] },
  { name: 'Move Page', slug: 'move-page', description: 'Move a page to a new position', icon: Move, category: 'pdf', subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'from', label: 'Move page', min: 1, default: 1 },
      { type: 'number', key: 'to', label: 'To position', min: 1, default: 2 }
    ] },
  { name: 'Replace Page', slug: 'replace-page', description: 'Replace a page with one from another PDF', icon: Replace, category: 'pdf', subCategory: 'Organize PDF',
    inputs: [
      { type: 'file', key: 'sourcePdf', label: 'Source PDF', accept: 'application/pdf' },
      { type: 'number', key: 'targetPage', label: 'Page to replace', min: 1, default: 1 },
      { type: 'number', key: 'sourcePage', label: 'Page from source PDF', min: 1, default: 1 }
    ] },
  { name: 'Trim Pages', slug: 'trim-pages', description: 'Remove pages from start or end', icon: Scissors, category: 'pdf', subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'count', label: 'Number of pages to remove', min: 1, default: 1 },
      { type: 'select', key: 'from', label: 'Remove from', options: [
        { label: 'Start', value: 'start' }, { label: 'End', value: 'end' }
      ] }
    ] },
  { name: 'Keep Nth Page', slug: 'keep-nth-page', description: 'Keep every Nth page', icon: Filter, category: 'pdf', subCategory: 'Organize PDF',
    inputs: [{ type: 'number', key: 'n', label: 'Keep every Nth page (e.g. 2 = keep 1,3,5...)', min: 2, default: 2 }] },
  { name: 'Tint Pages', slug: 'tint-pages', description: 'Apply a color tint to pages', icon: Palette, category: 'pdf', subCategory: 'Organize PDF',
    inputs: [
      { type: 'text', key: 'color', label: 'Tint color (hex)', placeholder: '#ffff00' },
      { type: 'number', key: 'opacity', label: 'Opacity (0–1)', min: 0, max: 1, default: 0.1 }
    ] },
  { name: 'Page Range Picker', slug: 'page-range-picker', description: 'Visually select pages to extract', icon: MousePointerClick, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'PDF Merger', slug: 'merge', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'PDF Splitter', slug: 'split', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'PDF Rotate Pages', slug: 'rotate', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'PDF Delete Pages', slug: 'delete-pages', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'PDF Insert Blank Pages', slug: 'insert-blank-pages', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'PDF Page Cropper', slug: 'crop-pages', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'PDF Page Dimension Report', slug: 'page-dimensions', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },
  { name: 'Batch PDF Merger', slug: 'batch-merge', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Organize PDF' },

  // ============ CONVERT FROM PDF (12) ============
  { name: "PDF to SVG", slug: "pdf-to-svg", description: "Convert PDF pages to SVG vectors", icon: FileImage, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: "PDF to HTML", slug: "pdf-to-html", description: "Convert PDF content to HTML", icon: Globe, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: "PDF to Markdown", slug: "pdf-to-markdown", description: "Convert PDF content to Markdown", icon: FileCode, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: "PDF to JSON", slug: "pdf-to-json", description: "Export PDF structure as JSON", icon: FileJson, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: "PDF to CSV", slug: "pdf-to-csv", description: "Extract tabular PDF data to CSV", icon: FileSpreadsheet, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: "PDF to EPUB", slug: "pdf-to-epub", description: "Convert PDFs into EPUB ebooks", icon: BookOpen, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: "Extract Embedded Images", slug: "extract-images", description: "Pull all images out of a PDF", icon: ImageUp, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: 'PDF to XML', slug: 'pdf-to-xml', description: 'Extract PDF text to XML format', icon: FileCode, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: 'PDF to ODT', slug: 'pdf-to-odt', description: 'Convert PDF to OpenDocument Text', icon: FileType, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: 'PDF to Long Image', slug: 'pdf-to-long-image', description: 'Combine pages into one long image', icon: ImageDown, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: 'PDF to Image', slug: 'pdf-to-image', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Convert from PDF' },
  { name: 'PDF to Text', slug: 'pdf-to-text', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Convert from PDF' },

  // ============ CONVERT TO PDF (11) ============
  { name: "SVG to PDF", slug: "svg-to-pdf", description: "Convert SVG vectors to a PDF", icon: FileImage, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: "HTML to PDF", slug: "html-to-pdf", description: "Render HTML markup to a PDF", icon: Globe, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: "Text to PDF", slug: "text-to-pdf", description: "Turn plain text into a PDF", icon: Type, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: "Markdown to PDF", slug: "markdown-to-pdf", description: "Convert Markdown notes to PDF", icon: FileCode, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: "Image to PDF", slug: "image-to-pdf", description: "Convert any image to a PDF", icon: ImageIcon, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: 'CSV to PDF', slug: 'csv-to-pdf', description: 'Convert CSV table to PDF', icon: Table, category: 'pdf', subCategory: 'Convert to PDF',
    inputs: [{ type: 'select', key: 'orientation', label: 'Page orientation', options: [
      { label: 'Portrait', value: 'portrait' }, { label: 'Landscape', value: 'landscape' }
    ] }] },
  { name: 'EPUB to PDF', slug: 'epub-to-pdf', description: 'Convert EPUB ebook to PDF', icon: BookOpen, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: 'RTF to PDF', slug: 'rtf-to-pdf', description: 'Convert Rich Text to PDF', icon: FileText, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: 'Word to PDF', slug: 'word-to-pdf', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: 'Excel to PDF', slug: 'excel-to-pdf', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Convert to PDF' },
  { name: 'PowerPoint to PDF', slug: 'powerpoint-to-pdf', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Convert to PDF' },

  // ============ SECURITY (6) ============
  { name: "Add Watermark", slug: "add-watermark", description: "Stamp watermarks on PDF pages", icon: Droplets, category: 'pdf', subCategory: 'Security' },
  { name: 'Set Owner Password', slug: 'set-owner-password', description: 'Set advanced passwords', icon: Lock, category: 'pdf', subCategory: 'Security',
    inputs: [
      { type: 'text', key: 'ownerPassword', label: 'Owner password' },
      { type: 'text', key: 'userPassword', label: 'User password (optional)', placeholder: 'leave blank for none' }
    ] },
  { name: 'PDF Redaction Tool', slug: 'redact', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Security' },
  { name: 'PDF Password Protector', slug: 'protect', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Security' },
  { name: 'PDF Password Remover', slug: 'unlock', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Security' },
  { name: 'Batch PDF Watermarker', slug: 'batch-watermark', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Security' },

  // ============ OCR & TEXT (5) ============
  { name: 'Add Text Box', slug: 'add-text-box', description: 'Add a boxed text annotation', icon: MessageSquare, category: 'pdf', subCategory: 'OCR & Text',
    inputs: [
      { type: 'text', key: 'text', label: 'Text content' },
      { type: 'number', key: 'page', label: 'Page', min: 1, default: 1 },
      { type: 'number', key: 'x', label: 'X', min: 0, default: 50 },
      { type: 'number', key: 'y', label: 'Y', min: 0, default: 400 },
      { type: 'number', key: 'width', label: 'Width (pt)', min: 10, default: 200 },
      { type: 'number', key: 'height', label: 'Height (pt)', min: 10, default: 40 }
    ] },
  { name: 'Text Density Map', slug: 'text-density-map', description: 'Map text density per page', icon: Map, category: 'pdf', subCategory: 'OCR & Text' },
  { name: 'PDF OCR', slug: 'ocr', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'OCR & Text' },
  { name: 'PDF Text Extractor', slug: 'extract-text', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'OCR & Text' },
  { name: 'PDF Image Alt-Text Presence Checker', slug: 'alt-text-presence-checker', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'OCR & Text' },

  // ============ EDIT PDF (19) ============
  { name: "Highlight Text", slug: "highlight-text", description: "Highlight passages in your PDF", icon: Highlighter, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Underline Text", slug: "underline-text", description: "Underline text in your PDF", icon: Underline, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Strike Text", slug: "strike-text", description: "Strike through text in a PDF", icon: Strikethrough, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Add Shapes", slug: "add-shapes", description: "Draw rectangles, circles and lines", icon: Shapes, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Draw on PDF", slug: "draw-on-pdf", description: "Free-draw on top of a PDF", icon: Brush, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Add Comments", slug: "add-comments", description: "Attach comments to the PDF", icon: MessageSquare, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Add Images", slug: "add-image", description: "Place images onto PDF pages", icon: ImagePlus, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Add Stamps", slug: "add-stamps", description: "Apply approval and status stamps", icon: Stamp, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Add QR Code to PDF", slug: "add-qr-code", description: "Insert a QR code onto pages", icon: QrCode, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Add Date & Time Stamp", slug: "add-date-stamp", description: "Stamp dates and times onto a PDF", icon: Calendar, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Add Background to PDF", slug: "add-background", description: "Add a background color or image", icon: PaintBucket, category: 'pdf', subCategory: 'Edit PDF' },
  { name: "Edit Bookmarks", slug: "edit-bookmarks", description: "Add and edit PDF bookmarks", icon: Bookmark, category: 'pdf', subCategory: 'Edit PDF' },
  { name: 'Permission Editor', slug: 'permission-editor', description: 'Edit PDF permissions', icon: Shield, category: 'pdf', subCategory: 'Edit PDF',
    inputs: [
      { type: 'select', key: 'printing', label: 'Allow printing', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
      { type: 'select', key: 'copying', label: 'Allow copying', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
      { type: 'select', key: 'modifying', label: 'Allow modifying', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
      { type: 'text', key: 'ownerPassword', label: 'Owner password (required)' }
    ] },
  { name: 'Add Timestamp', slug: 'add-timestamp', description: 'Update creation dates', icon: Clock, category: 'pdf', subCategory: 'Edit PDF' },
  { name: 'Add Callout', slug: 'add-callout', description: 'Add a callout bubble', icon: MessageCircle, category: 'pdf', subCategory: 'Edit PDF',
    inputs: [
      { type: 'text', key: 'text', label: 'Callout text' },
      { type: 'number', key: 'page', label: 'Page', min: 1, default: 1 },
      { type: 'number', key: 'x', label: 'X', min: 0, default: 100 },
      { type: 'number', key: 'y', label: 'Y', min: 0, default: 400 }
    ] },
  { name: 'Add Grid Overlay', slug: 'add-grid-overlay', description: 'Draw a grid on pages', icon: Grid, category: 'pdf', subCategory: 'Edit PDF',
    inputs: [
      { type: 'number', key: 'gridSize', label: 'Grid spacing (pt)', min: 5, default: 50 },
      { type: 'text', key: 'lineColor', label: 'Line color (hex)', placeholder: '#cccccc' }
    ] },
  { name: 'Add Crop Marks', slug: 'add-crop-marks', description: 'Add printer crop marks', icon: Crop, category: 'pdf', subCategory: 'Edit PDF',
    inputs: [{ type: 'number', key: 'bleed', label: 'Bleed size (pt)', min: 0, default: 9 }] },
  { name: 'Add Bleed', slug: 'add-bleed', description: 'Add bleed area to pages', icon: Expand, category: 'pdf', subCategory: 'Edit PDF',
    inputs: [
      { type: 'number', key: 'bleedPt', label: 'Bleed size (pt)', min: 1, default: 9 },
      { type: 'text', key: 'fillColor', label: 'Bleed fill color (hex)', placeholder: '#ffffff' }
    ] },
  { name: 'PDF Hyperlink Editor', slug: 'edit-links', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Edit PDF' },

  // ============ INFO & INSPECTION (28) ============
  { name: "PDF Font Inspector", slug: "font-inspector", description: "Inspect fonts used in a PDF", icon: FileType, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: "PDF Attachment Viewer", slug: "attachment-viewer", description: "View files attached to a PDF", icon: Paperclip, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: "PDF Version Detector", slug: "version-detector", description: "Detect the PDF spec version", icon: GitBranch, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'Extract Tables', slug: 'extract-tables', description: 'Extract tables to CSV', icon: Grid3x3, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'Image Count', slug: 'image-count', description: 'Count embedded images', icon: Images, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'Detect Duplicates', slug: 'detect-duplicates', description: 'Detect duplicate pages', icon: Copy, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'Language Detector', slug: 'language-detector', description: 'Detect document language', icon: Languages, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'Unique Word Count', slug: 'unique-word-count', description: 'Count unique words', icon: Hash, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Dual Page Viewer', slug: 'dual-page-viewer', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Continuous Scroll Viewer', slug: 'continuous-scroll-viewer', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Layer Viewer', slug: 'layer-viewer', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Search Viewer', slug: 'search-viewer', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Link Extractor', slug: 'extract-links', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Phone/Date/Number Extractor', slug: 'extract-data-patterns', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Metadata Viewer', slug: 'view-metadata', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Structure Inspector', slug: 'structure-inspector', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Print Preview', slug: 'print-preview', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Color Space Detector', slug: 'color-space-detector', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Word/Character Counter', slug: 'word-counter', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF File Information', slug: 'file-info', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Preview Card Generator', slug: 'preview-card', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Vector Path Inspector', slug: 'vector-path-inspector', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Heading Outline Extractor', slug: 'heading-extractor', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Citation/Reference Extractor', slug: 'extract-citations', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Email Address Extractor', slug: 'extract-emails', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Producer/Creator Software Detector', slug: 'producer-detector', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Table Structure Detector', slug: 'table-structure-detector', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },
  { name: 'PDF Color-Blindness Simulation Preview', slug: 'colorblind-preview', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Info & Inspection' },

  // ============ OPTIMIZE & COLOR (9) ============
  { name: "Metadata Editor", slug: "metadata-editor", description: "Edit title, author and metadata", icon: Edit3, category: 'pdf', subCategory: 'Optimize & Color' },
  { name: 'Color Analyser', slug: 'color-analyser', description: 'Analyze dominant colors', icon: Palette, category: 'pdf', subCategory: 'Optimize & Color' },
  { name: 'Metadata Template', slug: 'metadata-template', description: 'Apply standard metadata', icon: FileType2, category: 'pdf', subCategory: 'Optimize & Color',
    inputs: [
      { type: 'text', key: 'title', label: 'Title template' },
      { type: 'text', key: 'author', label: 'Author' },
      { type: 'text', key: 'subject', label: 'Subject' },
      { type: 'text', key: 'keywords', label: 'Keywords' }
    ] },
  { name: 'PDF Metadata Cleaner', slug: 'clean-metadata', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Optimize & Color' },
  { name: 'PDF Compressor', slug: 'compress', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Optimize & Color' },
  { name: 'PDF Grayscale Converter', slug: 'grayscale', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Optimize & Color' },
  { name: 'PDF Flatten Tool', slug: 'flatten', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Optimize & Color' },
  { name: 'Batch PDF Compressor', slug: 'batch-compress', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Optimize & Color' },
  { name: 'Batch Metadata Editor', slug: 'batch-metadata', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Optimize & Color' },

  // ============ FORMS & SIGNATURES (17) ============
  { name: "Draw Signature", slug: "draw-signature", description: "Draw a signature with your mouse", icon: Pencil, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Upload Signature Image", slug: "upload-signature", description: "Use an image as your signature", icon: Upload, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Type Signature", slug: "type-signature", description: "Generate a typed signature", icon: Keyboard, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Add Initials", slug: "add-initials", description: "Stamp initials onto a PDF", icon: Signature, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Fill PDF Forms", slug: "fill-forms", description: "Fill in interactive PDF forms", icon: FormInput, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Create Form Fields", slug: "create-form-fields", description: "Add form fields to a PDF", icon: SquarePen, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Flatten Forms", slug: "flatten-forms", description: "Flatten form fields into the page", icon: Layers, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Form Field Inspector", slug: "form-field-inspector", description: "Inspect every form field", icon: Search, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Export Form Data", slug: "export-form-data", description: "Export filled form data to JSON", icon: FileJson, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Import Form Data", slug: "import-form-data", description: "Import form data from a JSON file", icon: Upload, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: "Form Field Renamer", slug: "form-field-renamer", description: "Bulk rename PDF form fields", icon: Edit3, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: 'Remove Signatures', slug: 'remove-signatures', description: 'Remove signature widgets', icon: Eraser, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: 'Uniform Page Size', slug: 'uniform-page-size', description: 'Make all pages the same size', icon: Maximize, category: 'pdf', subCategory: 'Forms & Signatures',
    inputs: [{ type: 'select', key: 'pageSize', label: 'Target size', options: [
      { label: 'A4', value: 'A4' }, { label: 'Letter', value: 'Letter' },
      { label: 'A3', value: 'A3' }, { label: 'Legal', value: 'Legal' }
    ] }] },
  { name: 'Form to HTML', slug: 'form-to-html', description: 'Extract form to HTML', icon: Code, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: 'Signature Booklet', slug: 'signature-booklet', description: 'Reorder for saddle-stitch', icon: Book, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: 'PDF Sign', slug: 'sign', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Forms & Signatures' },
  { name: 'PDF Signature Presence Checker', slug: 'signature-presence-checker', description: 'Coming Soon', icon: FileText, category: 'pdf', subCategory: 'Forms & Signatures' },

  // ============ PRINT & LAYOUT (3) ============
  { name: "Print Margin Adjuster", slug: "print-margin-adjuster", description: "Adjust margins before printing", icon: Sliders, category: 'pdf', subCategory: 'Print & Layout' },
  { name: 'PDF Booklet Maker', slug: 'booklet-maker', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Print & Layout' },
  { name: 'PDF N-Up Layout Tool', slug: 'n-up-layout', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Print & Layout' },

  // ============ UTILITIES (51) ============
  { name: "Dark Mode Reader", slug: "dark-mode-reader", description: "Read PDFs in a dark theme", icon: Moon, category: 'pdf', subCategory: 'Utilities' },
  { name: "Reading Time Calculator", slug: "reading-time", description: "Estimate the time to read a PDF", icon: Clock, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Diff Viewer', slug: 'pdf-diff', description: 'Compare two PDFs', icon: Accessibility, category: 'pdf', subCategory: 'Utilities',
    inputs: [{ type: 'file', key: 'secondPdf', label: 'Second PDF to compare', accept: 'application/pdf' }] },
  { name: 'Replace Image', slug: 'replace-image', description: 'Replace an embedded image', icon: Replace, category: 'pdf', subCategory: 'Utilities',
    inputs: [
      { type: 'file', key: 'newImage', label: 'Replacement image (PNG/JPG)', accept: 'image/png,image/jpeg' },
      { type: 'number', key: 'imageIndex', label: 'Image index to replace (1 = first)', min: 1, default: 1 }
    ] },
  { name: 'Insert PDF At', slug: 'insert-pdf-at', description: 'Insert a PDF at a specific page', icon: FilePlus, category: 'pdf', subCategory: 'Utilities',
    inputs: [
      { type: 'file', key: 'insertPdf', label: 'PDF to insert', accept: 'application/pdf' },
      { type: 'number', key: 'atPage', label: 'Insert at page', min: 1, default: 1 }
    ] },
  { name: 'Scale Content', slug: 'scale-content', description: 'Scale page content', icon: Maximize, category: 'pdf', subCategory: 'Utilities',
    inputs: [{ type: 'number', key: 'scale', label: 'Scale %', min: 10, max: 200, default: 90 }] },
  { name: 'PDF Hash', slug: 'pdf-hash', description: 'Calculate file hash', icon: Hash, category: 'pdf', subCategory: 'Utilities',
    inputs: [{ type: 'select', key: 'algorithm', label: 'Hash algorithm', options: [
      { label: 'SHA-256', value: 'SHA-256' }, { label: 'SHA-1', value: 'SHA-1' }, { label: 'MD5', value: 'MD5' }
    ] }] },
  { name: 'Overlay PDF', slug: 'overlay-pdf', description: 'Overlay a PDF on another', icon: Layers, category: 'pdf', subCategory: 'Utilities',
    inputs: [
      { type: 'file', key: 'overlayPdf', label: 'Overlay PDF', accept: 'application/pdf' },
      { type: 'number', key: 'opacity', label: 'Opacity (0–1)', min: 0, max: 1, default: 0.3 }
    ] },
  { name: 'Mark Required Fields', slug: 'mark-required-fields', description: 'Add asterisks to required fields', icon: Asterisk, category: 'pdf', subCategory: 'Utilities' },
  { name: 'Size Breakdown', slug: 'size-breakdown', description: 'Analyze file size contributions', icon: PieChart, category: 'pdf', subCategory: 'Utilities' },
  { name: 'Compliance Report', slug: 'compliance-report', description: 'Generate compliance report', icon: FileCheck, category: 'pdf', subCategory: 'Utilities' },
  { name: 'Keyword Frequency', slug: 'keyword-frequency', description: 'Count most frequent words', icon: BarChart, category: 'pdf', subCategory: 'Utilities',
    inputs: [{ type: 'number', key: 'topN', label: 'Show top N words', min: 5, max: 200, default: 50 }] },
  { name: 'TTS Prep', slug: 'tts-prep', description: 'Prepare text for Text-to-Speech', icon: Volume2, category: 'pdf', subCategory: 'Utilities' },
  { name: 'Duplex Prep', slug: 'duplex-prep', description: 'Prepare for duplex printing', icon: Printer, category: 'pdf', subCategory: 'Utilities',
    inputs: [{ type: 'select', key: 'flipEdge', label: 'Flip on', options: [
      { label: 'Long edge (portrait)', value: 'long' }, { label: 'Short edge (landscape)', value: 'short' }
    ] }] },
  { name: 'Batch Convert', slug: 'batch-convert', description: 'Export PNG, TXT, and Metadata', icon: FolderOutput, category: 'pdf', subCategory: 'Utilities' },
  { name: 'Shrink Report', slug: 'shrink-report', description: 'Compress and report savings', icon: Minimize, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Thumbnail Browser', slug: 'thumbnail-browser', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Bookmark Navigator', slug: 'bookmark-navigator', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Interleave', slug: 'interleave', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Whiteout Tool', slug: 'whiteout', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Attachment Remover', slug: 'remove-attachments', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Personal Data Finder', slug: 'find-personal-data', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF JavaScript Remover', slug: 'remove-javascript', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Hyperlink Sanitizer', slug: 'sanitize-links', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Image Downsampler', slug: 'downsample-images', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'Searchable PDF Maker', slug: 'make-searchable', description: 'Coming Soon', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Document Properties', slug: 'document-properties', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Label Sheet Maker', slug: 'label-sheet', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF ICC Profile Reader', slug: 'icc-profile-reader', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'Batch PDF Renamer', slug: 'batch-rename', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Thumbnail Generator', slug: 'thumbnails', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Table of Contents Generator', slug: 'generate-toc', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF to QR Link', slug: 'qr-link', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF/A Structural Checker', slug: 'pdfa-structural-checker', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF/X Structural Checker', slug: 'pdfx-structural-checker', description: 'Coming Soon', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF/UA Basic Accessibility Checker', slug: 'pdfua-basic-checker', description: 'Coming Soon', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Tagged-PDF Checker', slug: 'tagged-pdf-checker', description: 'Coming Soon', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Language Tag Checker', slug: 'language-tag-checker', description: 'Coming Soon', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Embedded Font Checker', slug: 'embedded-font-checker', description: 'Coming Soon', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Mirror/Flip Content', slug: 'mirror-flip', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Self-Destruct', slug: 'self-destruct', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Filename Sanitizer', slug: 'filename-sanitizer', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Integrity Verifier', slug: 'integrity-verifier', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Encryption Strength Checker', slug: 'encryption-strength-checker', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF URL/Link Inventory', slug: 'link-inventory', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Currency & Amount Totalizer', slug: 'totalize-amounts', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Revision History Reader', slug: 'revision-history', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Heading Hierarchy Visualizer', slug: 'heading-hierarchy-visualizer', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Contrast Ratio Checker', slug: 'contrast-ratio-checker', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Font Size Auditor', slug: 'font-size-auditor', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },
  { name: 'PDF Reading Order Visualizer', slug: 'reading-order-visualizer', description: 'Free, private, and secure PDF tool.', icon: FileText, category: 'pdf', subCategory: 'Utilities' },

];

export const categories = Array.from(new Set(tools.map((t) => t.category)));
