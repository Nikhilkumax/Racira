import { inferIcon } from "@/components/shared/icon-map";
import { LucideIcon } from "lucide-react";

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
  category: string;
  icon: LucideIcon;
  status?: "live" | "soon";
  subCategory?: string;
  inputs?: ToolInput[];
  licenseNote?: string;
}

export const tools: Tool[] = [
  // ============ ORGANIZE PDF (22) ============
   { name: 'PDF Merger', slug: 'merge', icon: inferIcon("PDF Merger", "merge"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
   { name: 'Merge with TOC', slug: 'merge-with-toc', icon: inferIcon("Merge with TOC", "merge-with-toc"), description: 'Merge PDFs with a table of contents',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
   { name: 'PDF Splitter', slug: 'split', icon: inferIcon("PDF Splitter", "split"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Rotate Pages', slug: 'rotate', icon: inferIcon("PDF Rotate Pages", "rotate"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Delete Pages', slug: 'delete-pages', icon: inferIcon("PDF Delete Pages", "delete-pages"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: "Extract Pages", slug: 'extract-pages', icon: inferIcon("Extract Pages", "extract-pages"), description: "Pull selected pages into a new PDF",  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: "Rearrange Pages", slug: "organize-pages", icon: inferIcon("Rearrange Pages", "organize-pages"), description: "Reorder pages with drag and drop",  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: "Add Headers/Footers", slug: "headers-footers", icon: inferIcon("Add Headers/Footers", "headers-footers"), description: "Add headers and footers to pages",  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Batch PDF Merger', slug: 'batch-merge', icon: inferIcon("Batch PDF Merger", "batch-merge"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },{ name: 'Clone Pages', slug: 'clone-pages', icon: inferIcon("Clone Pages", "clone-pages"), description: 'Duplicate specific pages',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'text', key: 'pages', label: 'Page numbers to clone (e.g. 1,3)', placeholder: '1,2,3' },
      { type: 'number', key: 'copies', label: 'Number of copies', min: 1, default: 2 }
    ] },
  { name: 'Keep Nth Page', slug: 'keep-nth-page', icon: inferIcon("Keep Nth Page", "keep-nth-page"), description: 'Keep every Nth page',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [{ type: 'number', key: 'n', label: 'Keep every Nth page (e.g. 2 = keep 1,3,5...)', min: 2, default: 2 }] },
  { name: 'Move Page', slug: 'move-page', icon: inferIcon("Move Page", "move-page"), description: 'Move a page to a new position',  status: "soon", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'from', label: 'Move page', min: 1, default: 1 },
      { type: 'number', key: 'to', label: 'To position', min: 1, default: 2 }
    ] },
  { name: 'Page Range Picker', slug: 'page-range-picker', icon: inferIcon("Page Range Picker", "page-range-picker"), description: 'Visually select pages to extract',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Insert Blank Pages', slug: 'insert-blank-pages', icon: inferIcon("PDF Insert Blank Pages", "insert-blank-pages"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Page Cropper', slug: 'crop-pages', icon: inferIcon("PDF Page Cropper", "crop-pages"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Remove Blank Pages', slug: 'remove-blank-pages', icon: inferIcon("Remove Blank Pages", "remove-blank-pages"), description: 'Detect and remove empty pages',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Replace Page', slug: 'replace-page', icon: inferIcon("Replace Page", "replace-page"), description: 'Replace a page with one from another PDF',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'file', key: 'sourcePdf', label: 'Source PDF', accept: 'application/pdf' },
      { type: 'number', key: 'targetPage', label: 'Page to replace', min: 1, default: 1 },
      { type: 'number', key: 'sourcePage', label: 'Page from source PDF', min: 1, default: 1 }
    ] },
  { name: "Reverse Page Order", slug: "reverse-pages", icon: inferIcon("Reverse Page Order", "reverse-pages"), description: "Flip the page order of a PDF",  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Split Odd / Even Pages', slug: 'split-odd-even', icon: inferIcon("Split Odd / Even Pages", "split-odd-even"), description: 'Separate odd and even pages',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Swap Pages', slug: 'swap-pages', icon: inferIcon("Swap Pages", "swap-pages"), description: 'Swap two pages',  status: "soon", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'pageA', label: 'Page A', min: 1, default: 1 },
      { type: 'number', key: 'pageB', label: 'Page B', min: 1, default: 2 }
    ] },
  { name: 'Tint Pages', slug: 'tint-pages', icon: inferIcon("Tint Pages", "tint-pages"), description: 'Apply a color tint to pages',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'text', key: 'color', label: 'Tint color (hex)', placeholder: '#ffff00' },
      { type: 'number', key: 'opacity', label: 'Opacity (0–1)', min: 0, max: 1, default: 0.1 }
    ] },
  { name: 'Trim Pages', slug: 'trim-pages', icon: inferIcon("Trim Pages", "trim-pages"), description: 'Remove pages from start or end',  status: "soon", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'count', label: 'Number of pages to remove', min: 1, default: 1 },
      { type: 'select', key: 'from', label: 'Remove from', options: [
        { label: 'Start', value: 'start' }, { label: 'End', value: 'end' }
      ] }
    ] },
  

  // ============ CONVERT FROM PDF (12) ============
  { name: 'PDF to Image', slug: 'pdf-to-image', icon: inferIcon("PDF to Image", "pdf-to-image"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "Extract Embedded Images", slug: "extract-images", icon: inferIcon("Extract Embedded Images", "extract-images"), description: "Pull all images out of a PDF",  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to CSV", slug: "pdf-to-csv", icon: inferIcon("PDF to CSV", "pdf-to-csv"), description: "Extract tabular PDF data to CSV",  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to EPUB", slug: "pdf-to-epub", icon: inferIcon("PDF to EPUB", "pdf-to-epub"), description: "Convert PDFs into EPUB ebooks",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to HTML", slug: "pdf-to-html", icon: inferIcon("PDF to HTML", "pdf-to-html"), description: "Convert PDF content to HTML",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to JSON", slug: "pdf-to-json", icon: inferIcon("PDF to JSON", "pdf-to-json"), description: "Export PDF structure as JSON",  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to Long Image', slug: 'pdf-to-long-image', icon: inferIcon("PDF to Long Image", "pdf-to-long-image"), description: 'Combine pages into one long image',  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to Markdown", slug: "pdf-to-markdown", icon: inferIcon("PDF to Markdown", "pdf-to-markdown"), description: "Convert PDF content to Markdown",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to ODT', slug: 'pdf-to-odt', icon: inferIcon("PDF to ODT", "pdf-to-odt"), description: 'Convert PDF to OpenDocument Text',  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to SVG", slug: "pdf-to-svg", icon: inferIcon("PDF to SVG", "pdf-to-svg"), description: "Convert PDF pages to SVG vectors",  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
{ name: 'PDF to XML', slug: 'pdf-to-xml', icon: inferIcon("PDF to XML", "pdf-to-xml"), description: 'Extract PDF text to XML format',  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  

  // ============ CONVERT TO PDF (11) ============
  { name: 'Word to PDF', slug: 'word-to-pdf', icon: inferIcon("Word to PDF", "word-to-pdf"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "Image to PDF", slug: "image-to-pdf", icon: inferIcon("Image to PDF", "image-to-pdf"), description: "Convert any image to a PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },   { name: 'Excel to PDF', slug: 'excel-to-pdf', icon: inferIcon("Excel to PDF", "excel-to-pdf"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'CSV to PDF', slug: 'csv-to-pdf', icon: inferIcon("CSV to PDF", "csv-to-pdf"), description: 'Convert CSV table to PDF',  status: "live", category: "pdf", subCategory: 'Convert to PDF',
    inputs: [{ type: 'select', key: 'orientation', label: 'Page orientation', options: [
      { label: 'Portrait', value: 'portrait' }, { label: 'Landscape', value: 'landscape' }
    ] }] },
  { name: 'EPUB to PDF', slug: 'epub-to-pdf', icon: inferIcon("EPUB to PDF", "epub-to-pdf"), description: 'Convert EPUB ebook to PDF',  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "HTML to PDF", slug: "html-to-pdf", icon: inferIcon("HTML to PDF", "html-to-pdf"), description: "Render HTML markup to a PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "Markdown to PDF", slug: "markdown-to-pdf", icon: inferIcon("Markdown to PDF", "markdown-to-pdf"), description: "Convert Markdown notes to PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },   { name: 'PowerPoint to PDF', slug: 'powerpoint-to-pdf', icon: inferIcon("PowerPoint to PDF", "powerpoint-to-pdf"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },  { name: 'RTF to PDF', slug: 'rtf-to-pdf', icon: inferIcon("RTF to PDF", "rtf-to-pdf"), description: 'Convert Rich Text to PDF',  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "SVG to PDF", slug: "svg-to-pdf", icon: inferIcon("SVG to PDF", "svg-to-pdf"), description: "Convert SVG vectors to a PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "Text to PDF", slug: "text-to-pdf", icon: inferIcon("Text to PDF", "text-to-pdf"), description: "Turn plain text into a PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  

  // ============ SECURITY (6) ============
  { name: 'PDF Password Protector', slug: 'protect', icon: inferIcon("PDF Password Protector", "protect"), description: 'Add a password to protect a PDF',  status: "live", category: "pdf", subCategory: 'Security' },
  { name: 'PDF Password Remover', slug: 'unlock', icon: inferIcon("PDF Password Remover", "unlock"), description: 'Remove the password from a PDF you own',  status: "live", category: "pdf", subCategory: 'Security' },
  { name: 'PDF Redaction Tool', slug: 'redact', icon: inferIcon("PDF Redaction Tool", "redact"), description: 'Redact sensitive content from PDFs with black boxes',  status: "soon", category: "pdf", subCategory: 'Security' },
  { name: 'Extract Form Fields', slug: 'form-field-extract', icon: inferIcon("Extract Form Fields", "form-field-extract"), description: 'Extract and list all interactive form fields from a PDF',  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Add Watermark", slug: "add-watermark", icon: inferIcon("Add Watermark", "add-watermark"), description: "Stamp watermarks on PDF pages",  status: "live", category: "pdf", subCategory: 'Security' },
  { name: 'Batch PDF Watermarker', slug: 'batch-watermark', icon: inferIcon("Batch PDF Watermarker", "batch-watermark"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Security' },{ name: 'Set Owner Password', slug: 'set-owner-password', icon: inferIcon("Set Owner Password", "set-owner-password"), description: 'Set advanced passwords',  status: "live", category: "pdf", subCategory: 'Security',
    inputs: [
      { type: 'text', key: 'ownerPassword', label: 'Owner password' },
      { type: 'text', key: 'userPassword', label: 'User password (optional)', placeholder: 'leave blank for none' }
    ] },
  

  // ============ OCR & TEXT (5) ============
  { name: 'PDF OCR', slug: 'ocr', icon: inferIcon("PDF OCR", "ocr"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'OCR & Text' },
  { name: 'PDF Text Extractor', slug: 'extract-text', icon: inferIcon("PDF Text Extractor", "extract-text"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'OCR & Text' },
  { name: 'Add Text Box', slug: 'add-text-box', icon: inferIcon("Add Text Box", "add-text-box"), description: 'Add a boxed text annotation',  status: "live", category: "pdf", subCategory: 'OCR & Text',
    inputs: [
      { type: 'text', key: 'text', label: 'Text content' },
      { type: 'number', key: 'page', label: 'Page', min: 1, default: 1 },
      { type: 'number', key: 'x', label: 'X', min: 0, default: 50 },
      { type: 'number', key: 'y', label: 'Y', min: 0, default: 400 },
      { type: 'number', key: 'width', label: 'Width (pt)', min: 10, default: 200 },
      { type: 'number', key: 'height', label: 'Height (pt)', min: 10, default: 40 }
    ] },
  { name: 'PDF Image Alt-Text Presence Checker', slug: 'alt-text-presence-checker', icon: inferIcon("PDF Image Alt-Text Presence Checker", "alt-text-presence-checker"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'OCR & Text' },{ name: 'Text Density Map', slug: 'text-density-map', icon: inferIcon("Text Density Map", "text-density-map"), description: 'Map text density per page',  status: "soon", category: "pdf", subCategory: 'OCR & Text' },
  

 // ============ EDIT PDF (19) ============
 { name: 'Add Text', slug: 'add-text', icon: inferIcon("Add Text", "add-text"), description: 'Insert text anywhere on the PDF',  status: "live", category: "pdf", subCategory: 'Edit PDF' },
 { name: "Add Images", slug: "add-image", icon: inferIcon("Add Images", "add-image"), description: "Place images onto PDF pages",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Add Shapes", slug: "add-shapes", icon: inferIcon("Add Shapes", "add-shapes"), description: "Draw rectangles, circles and lines",  status: "live", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Draw on PDF", slug: "draw-on-pdf", icon: inferIcon("Draw on PDF", "draw-on-pdf"), description: "Free-draw on top of a PDF",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Highlight Text", slug: "highlight-text", icon: inferIcon("Highlight Text", "highlight-text"), description: "Highlight passages in your PDF",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Add Comments", slug: "add-comments", icon: inferIcon("Add Comments", "add-comments"), description: "Attach comments to the PDF",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Edit Bookmarks", slug: "edit-bookmarks", icon: inferIcon("Edit Bookmarks", "edit-bookmarks"), description: "Add and edit PDF bookmarks",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Add Background to PDF", slug: "add-background", icon: inferIcon("Add Background to PDF", "add-background"), description: "Add a background color or image",  status: "live", category: "pdf", subCategory: 'Edit PDF' },
  { name: 'Add Bleed', slug: 'add-bleed', icon: inferIcon("Add Bleed", "add-bleed"), description: 'Add bleed area to pages',  status: "live", category: "pdf", subCategory: 'Edit PDF',
    inputs: [
      { type: 'number', key: 'bleedPt', label: 'Bleed size (pt)', min: 1, default: 9 },
      { type: 'text', key: 'fillColor', label: 'Bleed fill color (hex)', placeholder: '#ffffff' }
    ] },
  { name: 'Add Callout', slug: 'add-callout', icon: inferIcon("Add Callout", "add-callout"), description: 'Add a callout bubble',  status: "live", category: "pdf", subCategory: 'Edit PDF',
    inputs: [
      { type: 'text', key: 'text', label: 'Callout text' },
      { type: 'number', key: 'page', label: 'Page', min: 1, default: 1 },
      { type: 'number', key: 'x', label: 'X', min: 0, default: 100 },
      { type: 'number', key: 'y', label: 'Y', min: 0, default: 400 }
    ] },
  { name: 'Add Crop Marks', slug: 'add-crop-marks', icon: inferIcon("Add Crop Marks", "add-crop-marks"), description: 'Add printer crop marks',  status: "live", category: "pdf", subCategory: 'Edit PDF',
    inputs: [{ type: 'number', key: 'bleed', label: 'Bleed size (pt)', min: 0, default: 9 }] },
  { name: "Add Date & Time Stamp", slug: "add-date-stamp", icon: inferIcon("Add Date & Time Stamp", "add-date-stamp"), description: "Stamp dates and times onto a PDF",  status: "live", category: "pdf", subCategory: 'Edit PDF' },
  { name: 'Add Grid Overlay', slug: 'add-grid-overlay', icon: inferIcon("Add Grid Overlay", "add-grid-overlay"), description: 'Draw a grid on pages',  status: "live", category: "pdf", subCategory: 'Edit PDF',
    inputs: [
      { type: 'number', key: 'gridSize', label: 'Grid spacing (pt)', min: 5, default: 50 },
      { type: 'text', key: 'lineColor', label: 'Line color (hex)', placeholder: '#cccccc' }
    ] },
  { name: "Add QR Code to PDF", slug: "add-qr-code", icon: inferIcon("Add QR Code to PDF", "add-qr-code"), description: "Insert a QR code onto pages",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Add Stamps", slug: "add-stamps", icon: inferIcon("Add Stamps", "add-stamps"), description: "Apply approval and status stamps",  status: "live", category: "pdf", subCategory: 'Edit PDF' },
  { name: 'Add Timestamp', slug: 'add-timestamp', icon: inferIcon("Add Timestamp", "add-timestamp"), description: 'Update creation dates',  status: "live", category: "pdf", subCategory: 'Edit PDF' },
  { name: 'PDF Hyperlink Editor', slug: 'edit-links', icon: inferIcon("PDF Hyperlink Editor", "edit-links"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Edit PDF' },{ name: 'Permission Editor', slug: 'permission-editor', icon: inferIcon("Permission Editor", "permission-editor"), description: 'Edit PDF permissions',  status: "live", category: "pdf", subCategory: 'Edit PDF',
    inputs: [
      { type: 'select', key: 'printing', label: 'Allow printing', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
      { type: 'select', key: 'copying', label: 'Allow copying', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
      { type: 'select', key: 'modifying', label: 'Allow modifying', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
      { type: 'text', key: 'ownerPassword', label: 'Owner password (required)' }
    ] },
  { name: "Strike Text", slug: "strike-text", icon: inferIcon("Strike Text", "strike-text"), description: "Strike through text in a PDF",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Underline Text", slug: "underline-text", icon: inferIcon("Underline Text", "underline-text"), description: "Underline text in your PDF",  status: "soon", category: "pdf", subCategory: 'Edit PDF' },
  

  // ============ INFO & INSPECTION (28) ============
  { name: 'PDF File Information', slug: 'file-info', icon: inferIcon("PDF File Information", "file-info"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
   { name: 'Extract Tables', slug: 'extract-tables', icon: inferIcon("Extract Tables", "extract-tables"), description: 'Extract tables to CSV',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Detect Duplicates', slug: 'detect-duplicates', icon: inferIcon("Detect Duplicates", "detect-duplicates"), description: 'Detect duplicate pages',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Image Count', slug: 'image-count', icon: inferIcon("Image Count", "image-count"), description: 'Count embedded images',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Language Detector', slug: 'language-detector', icon: inferIcon("Language Detector", "language-detector"), description: 'Detect document language',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: "PDF Attachment Viewer", slug: "attachment-viewer", icon: inferIcon("PDF Attachment Viewer", "attachment-viewer"), description: "View files attached to a PDF",  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Viewer', slug: 'viewer', icon: inferIcon("PDF Viewer", "viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Citation/Reference Extractor', slug: 'extract-citations', icon: inferIcon("PDF Citation/Reference Extractor", "extract-citations"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Color Space Detector', slug: 'color-space-detector', icon: inferIcon("PDF Color Space Detector", "color-space-detector"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Color-Blindness Simulation Preview', slug: 'colorblind-preview', icon: inferIcon("PDF Color-Blindness Simulation Preview", "colorblind-preview"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },{ name: 'PDF Continuous Scroll Viewer', slug: 'continuous-scroll-viewer', icon: inferIcon("PDF Continuous Scroll Viewer", "continuous-scroll-viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Dual Page Viewer', slug: 'dual-page-viewer', icon: inferIcon("PDF Dual Page Viewer", "dual-page-viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: "PDF Font Inspector", slug: "font-inspector", icon: inferIcon("PDF Font Inspector", "font-inspector"), description: "Inspect fonts used in a PDF",  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Layer Viewer', slug: 'layer-viewer', icon: inferIcon("PDF Layer Viewer", "layer-viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Phone/Date/Number Extractor', slug: 'extract-data-patterns', icon: inferIcon("PDF Phone/Date/Number Extractor", "extract-data-patterns"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Preview Card Generator', slug: 'preview-card', icon: inferIcon("PDF Preview Card Generator", "preview-card"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Print Preview', slug: 'print-preview', icon: inferIcon("PDF Print Preview", "print-preview"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Producer/Creator Software Detector', slug: 'producer-detector', icon: inferIcon("PDF Producer/Creator Software Detector", "producer-detector"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Search Viewer', slug: 'search-viewer', icon: inferIcon("PDF Search Viewer", "search-viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Structure Inspector', slug: 'structure-inspector', icon: inferIcon("PDF Structure Inspector", "structure-inspector"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Table Structure Detector', slug: 'table-structure-detector', icon: inferIcon("PDF Table Structure Detector", "table-structure-detector"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Vector Path Inspector', slug: 'vector-path-inspector', icon: inferIcon("PDF Vector Path Inspector", "vector-path-inspector"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: "PDF Version Detector", slug: "version-detector", icon: inferIcon("PDF Version Detector", "version-detector"), description: "Detect the PDF spec version",  status: "live", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Word/Character Counter', slug: 'word-counter', icon: inferIcon("PDF Word/Character Counter", "word-counter"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Unique Word Count', slug: 'unique-word-count', icon: inferIcon("Unique Word Count", "unique-word-count"), description: 'Count unique words',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  

  // ============ OPTIMIZE & COLOR (9) ============
  { name: 'PDF Compressor', slug: 'compress', icon: inferIcon("PDF Compressor", "compress"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Batch PDF Compressor', slug: 'batch-compress', icon: inferIcon("Batch PDF Compressor", "batch-compress"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'PDF Grayscale Converter', slug: 'grayscale', icon: inferIcon("PDF Grayscale Converter", "grayscale"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Batch Metadata Editor', slug: 'batch-metadata', icon: inferIcon("Batch Metadata Editor", "batch-metadata"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Optimize & Color' },{ name: 'Color Analyser', slug: 'color-analyser', icon: inferIcon("Color Analyser", "color-analyser"), description: 'Analyze dominant colors',  status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: "Metadata Editor", slug: "metadata-editor", icon: inferIcon("Metadata Editor", "metadata-editor"), description: "Edit title, author and metadata",  status: "live", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Metadata Template', slug: 'metadata-template', icon: inferIcon("Metadata Template", "metadata-template"), description: 'Apply standard metadata',  status: "soon", category: "pdf", subCategory: 'Optimize & Color',
    inputs: [
      { type: 'text', key: 'title', label: 'Title template' },
      { type: 'text', key: 'author', label: 'Author' },
      { type: 'text', key: 'subject', label: 'Subject' },
      { type: 'text', key: 'keywords', label: 'Keywords' }
    ] },
  { name: 'PDF Metadata Cleaner', slug: 'clean-metadata', icon: inferIcon("PDF Metadata Cleaner", "clean-metadata"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  

  // ============ FORMS & SIGNATURES (17) ============
  { name: 'PDF Sign', slug: 'sign', icon: inferIcon("PDF Sign", "sign"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Draw Signature", slug: "draw-signature", icon: inferIcon("Draw Signature", "draw-signature"), description: "Draw a signature with your mouse",  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Upload Signature Image", slug: "upload-signature", icon: inferIcon("Upload Signature Image", "upload-signature"), description: "Use an image as your signature",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Type Signature", slug: "type-signature", icon: inferIcon("Type Signature", "type-signature"), description: "Generate a typed signature",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Fill PDF Forms", slug: "fill-forms", icon: inferIcon("Fill PDF Forms", "fill-forms"), description: "Fill in interactive PDF forms",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Create Form Fields", slug: "create-form-fields", icon: inferIcon("Create Form Fields", "create-form-fields"), description: "Add form fields to a PDF",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Add Initials", slug: "add-initials", icon: inferIcon("Add Initials", "add-initials"), description: "Stamp initials onto a PDF",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Export Form Data", slug: "export-form-data", icon: inferIcon("Export Form Data", "export-form-data"), description: "Export filled form data to JSON",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Flatten Forms", slug: "flatten-forms", icon: inferIcon("Flatten Forms", "flatten-forms"), description: "Flatten form fields into the page",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Form Field Inspector", slug: "form-field-inspector", icon: inferIcon("Form Field Inspector", "form-field-inspector"), description: "Inspect every form field",  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Form Field Renamer", slug: "form-field-renamer", icon: inferIcon("Form Field Renamer", "form-field-renamer"), description: "Bulk rename PDF form fields",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'Form to HTML', slug: 'form-to-html', icon: inferIcon("Form to HTML", "form-to-html"), description: 'Extract form to HTML',  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Import Form Data", slug: "import-form-data", icon: inferIcon("Import Form Data", "import-form-data"), description: "Import form data from a JSON file",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'PDF Signature Presence Checker', slug: 'signature-presence-checker', icon: inferIcon("PDF Signature Presence Checker", "signature-presence-checker"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },{ name: 'Remove Signatures', slug: 'remove-signatures', icon: inferIcon("Remove Signatures", "remove-signatures"), description: 'Remove signature widgets',  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'Signature Booklet', slug: 'signature-booklet', icon: inferIcon("Signature Booklet", "signature-booklet"), description: 'Reorder for saddle-stitch',  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'Sign PDF', slug: 'sign-pdf', icon: inferIcon("Sign PDF", "sign-pdf"), description: 'Draw, type, or upload a signature and place it on your PDF', status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'PDF Layers', slug: 'pdf-layers', icon: inferIcon("PDF Layers", "pdf-layers"), description: 'View and manage PDF layers (OCG)', status: "soon", category: "pdf", subCategory: 'Edit & Modify', licenseNote: 'PyMuPDF AGPL compliance pending' },
  { name: 'Edit PDF Text', slug: 'edit-pdf-text', icon: inferIcon("Edit PDF Text", "edit-pdf-text"), description: 'Click any paragraph and edit it in place with live reflow', status: "soon", category: "pdf", subCategory: 'Edit & Modify', licenseNote: 'bentopdf-pdfium AGPL license pending confirmation' },
  { name: 'Edit Bookmarks', slug: 'bookmark-pdf', icon: inferIcon("Edit Bookmarks", "bookmark-pdf"), description: 'Add, edit, and organize PDF bookmarks', status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Scanner Effect', slug: 'scanner-effect', icon: inferIcon("Scanner Effect", "scanner-effect"), description: 'Apply a realistic scanner effect to your PDF', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Table of Contents', slug: 'table-of-contents', icon: inferIcon("Table of Contents", "table-of-contents"), description: 'Generate a table of contents from your PDF headings', status: "soon", category: "pdf", subCategory: 'Organize PDF', licenseNote: 'CoherentPDF AGPL compliance pending' },
  { name: 'Edit Attachments', slug: 'edit-attachments', icon: inferIcon("Edit Attachments", "edit-attachments"), description: 'View and remove attachments from your PDF', status: "soon", category: "pdf", subCategory: 'Organize PDF', licenseNote: 'CoherentPDF AGPL compliance pending' },
  { name: 'Add Page Labels', slug: 'add-page-labels', icon: inferIcon("Add Page Labels", "add-page-labels"), description: 'Add custom page number labels to your PDF', status: "soon", category: "pdf", subCategory: 'Organize PDF', licenseNote: 'CoherentPDF AGPL compliance pending' },
  { name: 'Compare PDFs', slug: 'compare-pdfs', icon: inferIcon("Compare PDFs", "compare-pdfs"), description: 'Compare two PDFs side by side and see what changed', status: "soon", category: "pdf", subCategory: 'Compare & Review' },
  { name: 'PDF Multi-Tool', slug: 'pdf-multi-tool', icon: inferIcon("PDF Multi-Tool", "pdf-multi-tool"), description: 'Merge, reorder, rotate, and delete pages from multiple PDFs', status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Uniform Page Size', slug: 'uniform-page-size', icon: inferIcon("Uniform Page Size", "uniform-page-size"), description: 'Make all pages the same size',  status: "live", category: "pdf", subCategory: 'Forms & Signatures',
    inputs: [{ type: 'select', key: 'pageSize', label: 'Target size', options: [
      { label: 'A4', value: 'A4' }, { label: 'Letter', value: 'Letter' },
      { label: 'A3', value: 'A3' }, { label: 'Legal', value: 'Legal' }
    ] }] },
  

  // ============ PRINT & LAYOUT (3) ============
  { name: 'PDF Booklet Maker', slug: 'booklet-maker', icon: inferIcon("PDF Booklet Maker", "booklet-maker"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Print & Layout' },
   { name: 'PDF N-Up Layout Tool', slug: 'n-up-layout', icon: inferIcon("PDF N-Up Layout Tool", "n-up-layout"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Print & Layout' },{ name: "Print Margin Adjuster", slug: "print-margin-adjuster", icon: inferIcon("Print Margin Adjuster", "print-margin-adjuster"), description: "Adjust margins before printing",  status: "live", category: "pdf", subCategory: 'Print & Layout' },
   { name: 'Imposition Layout', slug: 'imposition-layout', icon: inferIcon("Imposition Layout", "imposition-layout"), description: 'Arrange pages for professional printing',  status: "soon", category: "pdf", subCategory: 'Print & Layout' },
 

   // ============ UTILITIES (51) ============
  { name: 'PDF Diff Viewer', slug: 'pdf-diff', icon: inferIcon("PDF Diff Viewer", "pdf-diff"), description: 'Compare two PDFs',  status: "live", category: "pdf", subCategory: 'Utilities',
    inputs: [{ type: 'file', key: 'secondPdf', label: 'Second PDF to compare', accept: 'application/pdf' }] },
  { name: 'Replace Image', slug: 'replace-image', icon: inferIcon("Replace Image", "replace-image"), description: 'Replace an embedded image',  status: "live", category: "pdf", subCategory: 'Utilities',
    inputs: [
      { type: 'file', key: 'newImage', label: 'Replacement image (PNG/JPG)', accept: 'image/png,image/jpeg' },
      { type: 'number', key: 'imageIndex', label: 'Image index to replace (1 = first)', min: 1, default: 1 }
    ] },
  { name: 'Batch Convert', slug: 'batch-convert', icon: inferIcon("Batch Convert", "batch-convert"), description: 'Export PNG, TXT, and Metadata',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'Batch PDF Renamer', slug: 'batch-rename', icon: inferIcon("Batch PDF Renamer", "batch-rename"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'Compliance Report', slug: 'compliance-report', icon: inferIcon("Compliance Report", "compliance-report"), description: 'Generate compliance report',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: "Dark Mode Reader", slug: "dark-mode-reader", icon: inferIcon("Dark Mode Reader", "dark-mode-reader"), description: "Read PDFs in a dark theme",  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'Duplex Prep', slug: 'duplex-prep', icon: inferIcon("Duplex Prep", "duplex-prep"), description: 'Prepare for duplex printing',  status: "soon", category: "pdf", subCategory: 'Utilities',
    inputs: [{ type: 'select', key: 'flipEdge', label: 'Flip on', options: [
      { label: 'Long edge (portrait)', value: 'long' }, { label: 'Short edge (landscape)', value: 'short' }
    ] }] },
  { name: 'Insert PDF At', slug: 'insert-pdf-at', icon: inferIcon("Insert PDF At", "insert-pdf-at"), description: 'Insert a PDF at a specific page',  status: "live", category: "pdf", subCategory: 'Utilities',
    inputs: [
      { type: 'file', key: 'insertPdf', label: 'PDF to insert', accept: 'application/pdf' },
      { type: 'number', key: 'atPage', label: 'Insert at page', min: 1, default: 1 }
    ] },
  { name: 'Mark Required Fields', slug: 'mark-required-fields', icon: inferIcon("Mark Required Fields", "mark-required-fields"), description: 'Add asterisks to required fields',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'Overlay PDF', slug: 'overlay-pdf', icon: inferIcon("Overlay PDF", "overlay-pdf"), description: 'Overlay a PDF on another',  status: "live", category: "pdf", subCategory: 'Utilities',
    inputs: [
      { type: 'file', key: 'overlayPdf', label: 'Overlay PDF', accept: 'application/pdf' },
      { type: 'number', key: 'opacity', label: 'Opacity (0–1)', min: 0, max: 1, default: 0.3 }
    ] },
  { name: 'PDF Attachment Remover', slug: 'remove-attachments', icon: inferIcon("PDF Attachment Remover", "remove-attachments"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Bookmark Navigator', slug: 'bookmark-navigator', icon: inferIcon("PDF Bookmark Navigator", "bookmark-navigator"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Contrast Ratio Checker', slug: 'contrast-ratio-checker', icon: inferIcon("PDF Contrast Ratio Checker", "contrast-ratio-checker"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Currency & Amount Totalizer', slug: 'totalize-amounts', icon: inferIcon("PDF Currency & Amount Totalizer", "totalize-amounts"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Document Properties', slug: 'document-properties', icon: inferIcon("PDF Document Properties", "document-properties"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Embedded Font Checker', slug: 'embedded-font-checker', icon: inferIcon("PDF Embedded Font Checker", "embedded-font-checker"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Encryption Strength Checker', slug: 'encryption-strength-checker', icon: inferIcon("PDF Encryption Strength Checker", "encryption-strength-checker"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Filename Sanitizer', slug: 'filename-sanitizer', icon: inferIcon("PDF Filename Sanitizer", "filename-sanitizer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Font Size Auditor', slug: 'font-size-auditor', icon: inferIcon("PDF Font Size Auditor", "font-size-auditor"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Hash', slug: 'pdf-hash', icon: inferIcon("PDF Hash", "pdf-hash"), description: 'Calculate file hash',  status: "live", category: "pdf", subCategory: 'Utilities',
    inputs: [{ type: 'select', key: 'algorithm', label: 'Hash algorithm', options: [
      { label: 'SHA-256', value: 'SHA-256' }, { label: 'SHA-1', value: 'SHA-1' }, { label: 'MD5', value: 'MD5' }
    ] }] },
  { name: 'PDF Heading Hierarchy Visualizer', slug: 'heading-hierarchy-visualizer', icon: inferIcon("PDF Heading Hierarchy Visualizer", "heading-hierarchy-visualizer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Hyperlink Sanitizer', slug: 'sanitize-links', icon: inferIcon("PDF Hyperlink Sanitizer", "sanitize-links"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF ICC Profile Reader', slug: 'icc-profile-reader', icon: inferIcon("PDF ICC Profile Reader", "icc-profile-reader"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Image Downsampler', slug: 'downsample-images', icon: inferIcon("PDF Image Downsampler", "downsample-images"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Integrity Verifier', slug: 'integrity-verifier', icon: inferIcon("PDF Integrity Verifier", "integrity-verifier"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Interleave', slug: 'interleave', icon: inferIcon("PDF Interleave", "interleave"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF JavaScript Remover', slug: 'remove-javascript', icon: inferIcon("PDF JavaScript Remover", "remove-javascript"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Label Sheet Maker', slug: 'label-sheet', icon: inferIcon("PDF Label Sheet Maker", "label-sheet"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Language Tag Checker', slug: 'language-tag-checker', icon: inferIcon("PDF Language Tag Checker", "language-tag-checker"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Mirror/Flip Content', slug: 'mirror-flip', icon: inferIcon("PDF Mirror/Flip Content", "mirror-flip"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Personal Data Finder', slug: 'find-personal-data', icon: inferIcon("PDF Personal Data Finder", "find-personal-data"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Reading Order Visualizer', slug: 'reading-order-visualizer', icon: inferIcon("PDF Reading Order Visualizer", "reading-order-visualizer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },

{ name: 'PDF Revision History Reader', slug: 'revision-history', icon: inferIcon("PDF Revision History Reader", "revision-history"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Self-Destruct', slug: 'self-destruct', icon: inferIcon("PDF Self-Destruct", "self-destruct"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Table of Contents Generator', slug: 'generate-toc', icon: inferIcon("PDF Table of Contents Generator", "generate-toc"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Tagged-PDF Checker', slug: 'tagged-pdf-checker', icon: inferIcon("PDF Tagged-PDF Checker", "tagged-pdf-checker"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Thumbnail Browser', slug: 'thumbnail-browser', icon: inferIcon("PDF Thumbnail Browser", "thumbnail-browser"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Thumbnail Generator', slug: 'thumbnails', icon: inferIcon("PDF Thumbnail Generator", "thumbnails"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF to QR Link', slug: 'qr-link', icon: inferIcon("PDF to QR Link", "qr-link"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF URL/Link Inventory', slug: 'link-inventory', icon: inferIcon("PDF URL/Link Inventory", "link-inventory"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF Whiteout Tool', slug: 'whiteout', icon: inferIcon("PDF Whiteout Tool", "whiteout"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF/A Structural Checker', slug: 'pdfa-structural-checker', icon: inferIcon("PDF/A Structural Checker", "pdfa-structural-checker"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF/UA Basic Accessibility Checker', slug: 'pdfua-basic-checker', icon: inferIcon("PDF/UA Basic Accessibility Checker", "pdfua-basic-checker"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PDF/X Structural Checker', slug: 'pdfx-structural-checker', icon: inferIcon("PDF/X Structural Checker", "pdfx-structural-checker"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: "Reading Time Calculator", slug: "reading-time", icon: inferIcon("Reading Time Calculator", "reading-time"), description: "Estimate the time to read a PDF",  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'Scale Content', slug: 'scale-content', icon: inferIcon("Scale Content", "scale-content"), description: 'Scale page content',  status: "live", category: "pdf", subCategory: 'Utilities',
    inputs: [{ type: 'number', key: 'scale', label: 'Scale %', min: 10, max: 200, default: 90 }] },
  { name: 'Searchable PDF Maker', slug: 'make-searchable', icon: inferIcon("Searchable PDF Maker", "make-searchable"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'Shrink Report', slug: 'shrink-report', icon: inferIcon("Shrink Report", "shrink-report"), description: 'Compress and report savings',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'Size Breakdown', slug: 'size-breakdown', icon: inferIcon("Size Breakdown", "size-breakdown"), description: 'Analyze file size contributions',  status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'TTS Prep', slug: 'tts-prep', icon: inferIcon("TTS Prep", "tts-prep"), description: 'Prepare text for Text-to-Speech',  status: "soon", category: "pdf", subCategory: 'Utilities' },

  // ── Newly registered orphan implementations ────────────────
  { name: 'Split Every N Pages', slug: 'split-every-n', icon: inferIcon("Split Every N Pages", "split-every-n"), description: 'Split a PDF into chunks of N pages each', status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [{ type: 'number', key: 'n', label: 'Pages per chunk', min: 1, default: 5 }] },
  { name: 'Add Arrow', slug: 'add-arrow', icon: inferIcon("Add Arrow", "add-arrow"), description: 'Draw an arrow on a PDF page', status: "live", category: "pdf", subCategory: 'Edit PDF',
    inputs: [
      { type: 'number', key: 'page', label: 'Page', min: 1, default: 1 },
      { type: 'number', key: 'x1', label: 'Start X', min: 0, default: 50 },
      { type: 'number', key: 'y1', label: 'Start Y', min: 0, default: 400 },
      { type: 'number', key: 'x2', label: 'End X', min: 0, default: 200 },
      { type: 'number', key: 'y2', label: 'End Y', min: 0, default: 400 },
    ] },
  { name: 'PDF Booklet Maker', slug: 'create-booklet', icon: inferIcon("PDF Booklet Maker", "create-booklet"), description: 'Reorder pages for saddle-stitch booklet printing', status: "live", category: "pdf", subCategory: 'Print & Layout' },
  { name: 'Add Margin', slug: 'add-margin', icon: inferIcon("Add Margin", "add-margin"), description: 'Add uniform margins around all pages', status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [{ type: 'number', key: 'margin', label: 'Margin (pt)', min: 0, default: 20 }] },
  { name: 'Duplex Simulator', slug: 'duplex-simulator', icon: inferIcon("Duplex Simulator", "duplex-simulator"), description: 'Flip odd pages for duplex printing simulation', status: "live", category: "pdf", subCategory: 'Print & Layout',
    inputs: [{ type: 'select', key: 'flipEdge', label: 'Flip edge', options: [
      { label: 'Long edge (portrait)', value: 'long' }, { label: 'Short edge (landscape)', value: 'short' }
    ] }] },
  { name: 'PDF Version Detector', slug: 'version-checker', icon: inferIcon("PDF Version Detector", "version-checker"), description: 'Detect the PDF specification version', status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Add PDF Properties', slug: 'add-pdf-properties', icon: inferIcon("Add PDF Properties", "add-pdf-properties"), description: 'Set title, author and metadata properties', status: "live", category: "pdf", subCategory: 'Optimize & Color',
    inputs: [
      { type: 'text', key: 'title', label: 'Title' },
      { type: 'text', key: 'author', label: 'Author' },
      { type: 'text', key: 'subject', label: 'Subject' },
      { type: 'text', key: 'keywords', label: 'Keywords' },
    ] },
  { name: 'Optimize Fonts', slug: 'optimize-fonts', icon: inferIcon("Optimize Fonts", "optimize-fonts"), description: 'Optimize embedded fonts with object streams', status: "live", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Edit PDF Metadata', slug: 'edit-metadata', icon: inferIcon("Edit PDF Metadata", "edit-metadata"), description: 'Edit title, author, subject and keywords', status: "live", category: "pdf", subCategory: 'Optimize & Color',
    inputs: [
      { type: 'text', key: 'title', label: 'Title' },
      { type: 'text', key: 'author', label: 'Author' },
      { type: 'text', key: 'subject', label: 'Subject' },
      { type: 'text', key: 'keywords', label: 'Keywords' },
    ] },
  { name: 'Add Page Numbers', slug: 'add-page-numbers', icon: inferIcon("Add Page Numbers", "add-page-numbers"), description: 'Add page numbers to every page', status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'select', key: 'pageNumberPosition', label: 'Position', options: [
        { label: 'Bottom center', value: 'bottom-center' }, { label: 'Bottom right', value: 'bottom-right' },
        { label: 'Bottom left', value: 'bottom-left' }, { label: 'Top center', value: 'top-center' },
      ] },
      { type: 'number', key: 'pageNumberStart', label: 'Start number', min: 0, default: 1 },
    ] },
  { name: 'PDF Attachment Inspector', slug: 'attachment-inspector', icon: inferIcon("PDF Attachment Inspector", "attachment-inspector"), description: 'List file attachments embedded in a PDF', status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Size Analyzer', slug: 'pdf-size-analyzer', icon: inferIcon("PDF Size Analyzer", "pdf-size-analyzer"), description: 'Analyze PDF file size breakdown', status: "live", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Highlight Form Fields', slug: 'highlight-form-fields', icon: inferIcon("Highlight Form Fields", "highlight-form-fields"), description: 'Draw colored rectangles over form field widgets', status: "live", category: "pdf", subCategory: 'Forms & Signatures',
    inputs: [{ type: 'text', key: 'fillColor', label: 'Highlight color (hex)', placeholder: '#ffff00' }] },

  // ── Browser-only orphan implementations (verified via code review) ──
  { name: 'Extract Headings', slug: 'extract-headings', icon: inferIcon("Extract Headings", "extract-headings"), description: 'Extract headings by detecting large font sizes', status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Extract Email Addresses', slug: 'extract-email-addresses', icon: inferIcon("Extract Email Addresses", "extract-email-addresses"), description: 'Extract email addresses from PDF text', status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Extract Phone Numbers', slug: 'extract-phone-numbers', icon: inferIcon("Extract Phone Numbers", "extract-phone-numbers"), description: 'Extract phone numbers from PDF text', status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Extract Keywords', slug: 'extract-keywords', icon: inferIcon("Extract Keywords", "extract-keywords"), description: 'Count word frequency and return top N keywords', status: "soon", category: "pdf", subCategory: 'Utilities',
    inputs: [{ type: 'number', key: 'topN', label: 'Show top N words', min: 5, max: 200, default: 50 }] },
  { name: 'Extract Hyperlinks', slug: 'extract-hyperlinks', icon: inferIcon("Extract Hyperlinks", "extract-hyperlinks"), description: 'Extract URLs from annotations and text content', status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF to RTF', slug: 'pdf-to-rtf', icon: inferIcon("PDF to RTF", "pdf-to-rtf"), description: 'Convert PDF text to RTF format', status: "soon", category: "pdf", subCategory: 'Convert from PDF' },

  // ── Newly wired standalone functions ─────────────────────────
  { name: 'PDF to Base64', slug: 'pdf-to-base64', icon: inferIcon("PDF to Base64", "pdf-to-base64"), description: 'Encode a PDF as Base64 text', status: "live", category: "pdf", subCategory: 'Utilities' },
  { name: 'Base64 to PDF', slug: 'base64-to-pdf', icon: inferIcon("Base64 to PDF", "base64-to-pdf"), description: 'Decode Base64 text back into a PDF', status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Invert Colors', slug: 'invert-colors', icon: inferIcon("Invert Colors", "invert-colors"), description: 'Invert all colors in a PDF', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'PDF Grayscale Converter', slug: 'grayscale-pdf', icon: inferIcon("PDF Grayscale Converter", "grayscale-pdf"), description: 'Convert all pages to grayscale', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Remove Metadata', slug: 'remove-metadata', icon: inferIcon("Remove Metadata", "remove-metadata"), description: 'Strip title, author and other metadata', status: "live", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'PDF Statistics', slug: 'pdf-statistics', icon: inferIcon("PDF Statistics", "pdf-statistics"), description: 'View page count, file size and metadata stats', status: "live", category: "pdf", subCategory: 'Info & Inspection' },

  // ── PDF-to-office (honest descriptions) ──────────────────────
  { name: 'PDF to Word (Text)', slug: 'pdf-to-word', icon: inferIcon("PDF to Word (Text)", "pdf-to-word"), description: 'Extract PDF text into an HTML document', status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to CSV (Text)', slug: 'pdf-to-excel', icon: inferIcon("PDF to CSV (Text)", "pdf-to-excel"), description: 'Extract PDF text as CSV rows', status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to Slides (Images)', slug: 'pdf-to-powerpoint', icon: inferIcon("PDF to Slides (Images)", "pdf-to-powerpoint"), description: 'Render each page as a PNG image in a ZIP', status: "live", category: "pdf", subCategory: 'Convert from PDF' },

  // ── Bento pilot batch (5 tools) ───────────────────────────────
  { name: 'Bates Numbering', slug: 'bates-numbering', icon: inferIcon("Bates Numbering", "bates-numbering"), description: 'Add sequential bates stamps to PDF pages', status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'text', key: 'batesTemplate', label: 'Template', placeholder: '[BATES]', default: '[BATES]' },
      { type: 'number', key: 'batesStart', label: 'Start number', min: 1, default: 1 },
      { type: 'number', key: 'batesPadding', label: 'Zero-padding', min: 0, max: 12, default: 6 },
      { type: 'select', key: 'batesPosition', label: 'Position', default: 'bottom-right',
        options: [
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Top Right', value: 'top-right' },
          { label: 'Top Left', value: 'top-left' },
          { label: 'Top Center', value: 'top-center' },
        ] },
      { type: 'select', key: 'batesFontFamily', label: 'Font', default: 'Helvetica',
        options: [
          { label: 'Helvetica', value: 'Helvetica' },
          { label: 'Times Roman', value: 'TimesRoman' },
          { label: 'Courier', value: 'Courier' },
        ] },
      { type: 'number', key: 'batesFontSize', label: 'Font size', min: 6, max: 72, default: 10 },
      { type: 'text', key: 'batesColor', label: 'Text color (hex)', placeholder: '#000000', default: '#000000' },
    ] },
  { name: 'Background Color', slug: 'background-color', icon: inferIcon("Background Color", "background-color"), description: 'Change the background color of PDF pages', status: "live", category: "pdf", subCategory: 'Edit & Modify',
    inputs: [
      { type: 'text', key: 'backgroundColor', label: 'Background color (hex)', placeholder: '#FFFFFF', default: '#FFFFFF' },
    ] },
  { name: 'PDF Sanitizer', slug: 'sanitize-pdf', icon: inferIcon("PDF Sanitizer", "sanitize-pdf"), description: 'Remove metadata, annotations, JS, and other elements from PDFs', status: "live", category: "pdf", subCategory: 'Optimize & Color',
    inputs: [
      { type: 'select', key: 'sanitizePreset', label: 'Sanitization level', default: 'standard',
        options: [
          { label: 'Standard (recommended)', value: 'standard' },
          { label: 'Deep (removes links & structure)', value: 'deep' },
          { label: 'Maximum (all removable elements)', value: 'maximum' },
        ] },
    ] },
  { name: 'Text Color Changer', slug: 'text-color', icon: inferIcon("Text Color Changer", "text-color"), description: 'Change the color of dark text in a PDF', status: "live", category: "pdf", subCategory: 'Edit & Modify',
    inputs: [
      { type: 'text', key: 'textColor', label: 'Target color (hex)', placeholder: '#FF0000', default: '#FF0000' },
      { type: 'number', key: 'textColorThreshold', label: 'Darkness threshold (0-255)', min: 0, max: 255, default: 120 },
    ] },
  { name: 'Flatten Annotations', slug: 'flatten-annotations', icon: inferIcon("Flatten Annotations", "flatten-annotations"), description: 'Flatten all annotations into page content', status: "live", category: "pdf", subCategory: 'Edit & Modify' },
  { name: 'Comic Info Generator', slug: 'comic-info', icon: inferIcon("Comic Info Generator", "comic-info"), description: 'Generate ComicInfo XML metadata for comic archives', status: "live", category: "pdf", subCategory: 'Utilities',
    inputs: [
      { type: 'text', key: 'comicTitle', label: 'Title', placeholder: 'Comic title' },
      { type: 'text', key: 'comicSeries', label: 'Series', placeholder: 'Series name' },
      { type: 'text', key: 'comicNumber', label: 'Issue number', placeholder: '1' },
      { type: 'text', key: 'comicWriter', label: 'Writer', placeholder: 'Writer name' },
      { type: 'text', key: 'comicPublisher', label: 'Publisher', placeholder: 'Publisher name' },
      { type: 'text', key: 'comicGenre', label: 'Genre', placeholder: 'Genre' },
      { type: 'text', key: 'comicLanguage', label: 'Language (ISO)', placeholder: 'en' },
    ] },

  // ── Bento batch 2 (rotate-custom, divide-pages) ────────────────
  { name: 'Custom Rotation', slug: 'rotate-custom', icon: inferIcon("Custom Rotation", "rotate-custom"), description: 'Rotate PDF pages by any angle (not limited to 90°)', status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'rotateCustomAngle', label: 'Rotation angle (degrees)', min: -360, max: 360, default: 45 },
    ] },
  { name: 'Divide Pages', slug: 'divide-pages', icon: inferIcon("Divide Pages", "divide-pages"), description: 'Split each page in half vertically or horizontally', status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'select', key: 'divideMode', label: 'Split direction', default: 'vertical',
        options: [
          { label: 'Vertical (left/right)', value: 'vertical' },
          { label: 'Horizontal (top/bottom)', value: 'horizontal' },
        ] },
      { type: 'text', key: 'dividePageRange', label: 'Page range (empty = all)', placeholder: '1-3,5' },
    ] },
  { name: 'XML to PDF', slug: 'xml-to-pdf', icon: inferIcon("XML to PDF", "xml-to-pdf"), description: 'Convert XML files to PDF with auto-detected table structure', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'PDF Flatten Tool', slug: 'flatten', icon: inferIcon("PDF Flatten Tool", "flatten"), description: 'Flatten form fields and annotations into page content', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Remove Annotations', slug: 'remove-annotations', icon: inferIcon("Remove Annotations", "remove-annotations"), description: 'Remove annotations from PDF pages', status: "live", category: "pdf", subCategory: 'Edit & Modify',
    inputs: [
      { type: 'text', key: 'removeAnnotationTypes', label: 'Annotation types to remove (comma-separated, empty = all)', placeholder: 'FreeText,Highlight' },
    ] },

  // ── Bento batch 1: image converters + simple tools ──────────
  { name: 'BMP to PDF', slug: 'bmp-to-pdf', icon: inferIcon("BMP to PDF", "bmp-to-pdf"), description: 'Convert BMP images to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'PNG to PDF', slug: 'png-to-pdf', icon: inferIcon("PNG to PDF", "png-to-pdf"), description: 'Convert PNG images to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'HEIC to PDF', slug: 'heic-to-pdf', icon: inferIcon("HEIC to PDF", "heic-to-pdf"), description: 'Convert HEIC images to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'WebP to PDF', slug: 'webp-to-pdf', icon: inferIcon("WebP to PDF", "webp-to-pdf"), description: 'Convert WebP images to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'JSON to PDF', slug: 'json-to-pdf', icon: inferIcon("JSON to PDF", "json-to-pdf"), description: 'Convert JSON data to a formatted PDF', status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'PDF to PNG', slug: 'pdf-to-png', icon: inferIcon("PDF to PNG", "pdf-to-png"), description: 'Render PDF pages as PNG images', status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to WebP', slug: 'pdf-to-webp', icon: inferIcon("PDF to WebP", "pdf-to-webp"), description: 'Render PDF pages as WebP images', status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to BMP', slug: 'pdf-to-bmp', icon: inferIcon("PDF to BMP", "pdf-to-bmp"), description: 'Render PDF pages as BMP images', status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to TIFF', slug: 'pdf-to-tiff', icon: inferIcon("PDF to TIFF", "pdf-to-tiff"), description: 'Render PDF pages as TIFF images', status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF Metadata Viewer', slug: 'view-metadata', icon: inferIcon("PDF Metadata Viewer", "view-metadata"), description: 'View PDF title, author, and other metadata', status: "live", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Fix Page Size', slug: 'fix-page-size', icon: inferIcon("Fix Page Size", "fix-page-size"), description: 'Standardize all pages to a uniform size', status: "live", category: "pdf", subCategory: 'Optimize & Color' },

  // ── Bento batch 2: adapter-only ports ──────────────────────
  { name: 'Scan to PDF', slug: 'scan-to-pdf', icon: inferIcon("Scan to PDF", "scan-to-pdf"), description: 'Convert scanned images to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Combine to Single Page', slug: 'combine-single-page', icon: inferIcon("Combine to Single Page", "combine-single-page"), description: 'Stitch all pages into one continuous scroll', status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Posterize PDF', slug: 'posterize', icon: inferIcon("Posterize PDF", "posterize"), description: 'Split large pages into a grid of smaller pages', status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Extract Attachments', slug: 'extract-attachments', icon: inferIcon("Extract Attachments", "extract-attachments"), description: 'Extract embedded files from a PDF as a ZIP', status: "soon", category: "pdf", subCategory: 'Utilities' },

  // ── Bento batch 3: final adapter ports ──────────────────────
  { name: 'PDF to ZIP', slug: 'pdf-to-zip', icon: inferIcon("PDF to ZIP", "pdf-to-zip"), description: 'Package multiple PDFs into a ZIP archive', status: "live", category: "pdf", subCategory: 'Utilities' },
  { name: 'Page Dimensions', slug: 'page-dimensions', icon: inferIcon("Page Dimensions", "page-dimensions"), description: 'Analyze page size, orientation, and units', status: "live", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Text Extractor', slug: 'pdf-to-text', icon: inferIcon("PDF Text Extractor", "pdf-to-text"), description: 'Extract plain text from PDF files', status: "live", category: "pdf", subCategory: 'Convert from PDF' },

  // ── Bento Phase 3+4: WASM-backed conversions ──────────────────────
  { name: 'Linearize PDF', slug: 'linearize-pdf', icon: inferIcon("Linearize PDF", "linearize-pdf"), description: 'Optimize PDF for fast web display', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Remove Restrictions', slug: 'remove-restrictions', icon: inferIcon("Remove Restrictions", "remove-restrictions"), description: 'Remove print/copy/edit restrictions from PDF', status: "soon", category: "pdf", subCategory: 'Security' },
  { name: 'Validate Signature', slug: 'validate-signature', icon: inferIcon("Validate Signature", "validate-signature"), description: 'Verify digital signatures on a PDF', status: "soon", category: "pdf", subCategory: 'Security' },
  { name: 'Certificate Inspector', slug: 'certificate-inspector', icon: inferIcon("Certificate Inspector", "certificate-inspector"), description: 'Inspect embedded certificates in a PDF', status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'CBZ to PDF', slug: 'cbz-to-pdf', icon: inferIcon("CBZ to PDF", "cbz-to-pdf"), description: 'Convert comic book archives to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'PDF to CBZ', slug: 'pdf-to-cbz', icon: inferIcon("PDF to CBZ", "pdf-to-cbz"), description: 'Convert PDF pages to comic book archive', status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'Compress PDF', slug: 'compress-pdf', icon: inferIcon("Compress PDF", "compress-pdf"), description: 'Reduce PDF file size', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Deskew PDF', slug: 'deskew-pdf', icon: inferIcon("Deskew PDF", "deskew-pdf"), description: 'Straighten tilted scanned pages', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'Email to PDF', slug: 'email-to-pdf', icon: inferIcon("Email to PDF", "email-to-pdf"), description: 'Convert email files to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'FB2 to PDF', slug: 'fb2-to-pdf', icon: inferIcon("FB2 to PDF", "fb2-to-pdf"), description: 'Convert FB2 ebooks to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Font to Outline', slug: 'font-to-outline', icon: inferIcon("Font to Outline", "font-to-outline"), description: 'Convert text to outlines for font embedding', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'MOBI to PDF', slug: 'mobi-to-pdf', icon: inferIcon("MOBI to PDF", "mobi-to-pdf"), description: 'Convert MOBI ebooks to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'PDF OCR', slug: 'ocr-pdf', icon: inferIcon("PDF OCR", "ocr-pdf"), description: 'Extract text from scanned PDFs using OCR', status: "soon", category: "pdf", subCategory: 'OCR & Text' },
  { name: 'ODG to PDF', slug: 'odg-to-pdf', icon: inferIcon("ODG to PDF", "odg-to-pdf"), description: 'Convert OpenDocument Graphics to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'ODP to PDF', slug: 'odp-to-pdf', icon: inferIcon("ODP to PDF", "odp-to-pdf"), description: 'Convert OpenDocument Presentations to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'ODS to PDF', slug: 'ods-to-pdf', icon: inferIcon("ODS to PDF", "ods-to-pdf"), description: 'Convert OpenDocument Spreadsheets to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'ODT to PDF', slug: 'odt-to-pdf', icon: inferIcon("ODT to PDF", "odt-to-pdf"), description: 'Convert OpenDocument Text to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Pages to PDF', slug: 'pages-to-pdf', icon: inferIcon("Pages to PDF", "pages-to-pdf"), description: 'Convert Apple Pages documents to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'PDF to DOCX', slug: 'pdf-to-docx', icon: inferIcon("PDF to DOCX", "pdf-to-docx"), description: 'Convert PDF to Word document format', status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to PDF/A', slug: 'pdf-to-pdfa', icon: inferIcon("PDF to PDF/A", "pdf-to-pdfa"), description: 'Archive-compliant PDF/A conversion', status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'Prepare PDF for AI', slug: 'prepare-pdf-for-ai', icon: inferIcon("Prepare PDF for AI", "prepare-pdf-for-ai"), description: 'Optimize PDF structure for AI ingestion', status: "soon", category: "pdf", subCategory: 'Utilities' },
  { name: 'PSD to PDF', slug: 'psd-to-pdf', icon: inferIcon("PSD to PDF", "psd-to-pdf"), description: 'Convert Photoshop files to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Publisher to PDF', slug: 'pub-to-pdf', icon: inferIcon("Publisher to PDF", "pub-to-pdf"), description: 'Convert Microsoft Publisher files to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Rasterize PDF', slug: 'rasterize-pdf', icon: inferIcon("Rasterize PDF", "rasterize-pdf"), description: 'Flatten vector content to raster images', status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
  { name: 'TIFF to PDF', slug: 'tiff-to-pdf', icon: inferIcon("TIFF to PDF", "tiff-to-pdf"), description: 'Convert TIFF images to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Timestamp PDF', slug: 'timestamp-pdf', icon: inferIcon("Timestamp PDF", "timestamp-pdf"), description: 'Add RFC 3161 timestamp to PDF', status: "soon", category: "pdf", subCategory: 'Security' },
  { name: 'VSD to PDF', slug: 'vsd-to-pdf', icon: inferIcon("VSD to PDF", "vsd-to-pdf"), description: 'Convert Visio diagrams to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'WPD to PDF', slug: 'wpd-to-pdf', icon: inferIcon("WPD to PDF", "wpd-to-pdf"), description: 'Convert WordPerfect files to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'WPS to PDF', slug: 'wps-to-pdf', icon: inferIcon("WPS to PDF", "wps-to-pdf"), description: 'Convert WPS Office files to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'XPS to PDF', slug: 'xps-to-pdf', icon: inferIcon("XPS to PDF", "xps-to-pdf"), description: 'Convert XPS documents to PDF', status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  ];

export const categories = Array.from(new Set(tools.map((t) => (t as any).category)));

/** Fast slug → status lookup used by the centralized dispatcher gate. */
export const toolStatusMap = new Map(tools.map((t) => [t.slug, t.status]));

// ── Search registry (per-domain SEARCH_REGISTRY pattern) ──────────────
import type { ToolResult } from "@/components/CategorySearch";

export const SEARCH_REGISTRY: ToolResult[] = tools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  slug: tool.slug,
  href: `/pdf/${tool.slug}`,
  category: tool.category,
  subcategory: tool.subCategory,
  isBuilt: tool.status === "live",
}));
