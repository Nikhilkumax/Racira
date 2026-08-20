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
}

export const tools: Tool[] = [
  // ============ ORGANIZE PDF (22) ============
   { name: 'PDF Merger', slug: 'merge', icon: inferIcon("PDF Merger", "merge"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
   { name: 'Merge with TOC', slug: 'merge-with-toc', icon: inferIcon("Merge with TOC", "merge-with-toc"), description: 'Merge PDFs with a table of contents',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
   { name: 'PDF Splitter', slug: 'split', icon: inferIcon("PDF Splitter", "split"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Rotate Pages', slug: 'rotate', icon: inferIcon("PDF Rotate Pages", "rotate"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Delete Pages', slug: 'delete-pages', icon: inferIcon("PDF Delete Pages", "delete-pages"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
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
  { name: 'Move Page', slug: 'move-page', icon: inferIcon("Move Page", "move-page"), description: 'Move a page to a new position',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'from', label: 'Move page', min: 1, default: 1 },
      { type: 'number', key: 'to', label: 'To position', min: 1, default: 2 }
    ] },
  { name: 'Page Range Picker', slug: 'page-range-picker', icon: inferIcon("Page Range Picker", "page-range-picker"), description: 'Visually select pages to extract',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Insert Blank Pages', slug: 'insert-blank-pages', icon: inferIcon("PDF Insert Blank Pages", "insert-blank-pages"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Page Cropper', slug: 'crop-pages', icon: inferIcon("PDF Page Cropper", "crop-pages"), description: 'Free, private, and secure PDF tool.',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'PDF Page Dimension Report', slug: 'page-dimensions', icon: inferIcon("PDF Page Dimension Report", "page-dimensions"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Remove Blank Pages', slug: 'remove-blank-pages', icon: inferIcon("Remove Blank Pages", "remove-blank-pages"), description: 'Detect and remove empty pages',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Replace Page', slug: 'replace-page', icon: inferIcon("Replace Page", "replace-page"), description: 'Replace a page with one from another PDF',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'file', key: 'sourcePdf', label: 'Source PDF', accept: 'application/pdf' },
      { type: 'number', key: 'targetPage', label: 'Page to replace', min: 1, default: 1 },
      { type: 'number', key: 'sourcePage', label: 'Page from source PDF', min: 1, default: 1 }
    ] },
  { name: "Reverse Page Order", slug: "reverse-pages", icon: inferIcon("Reverse Page Order", "reverse-pages"), description: "Flip the page order of a PDF",  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Split Odd / Even Pages', slug: 'split-odd-even', icon: inferIcon("Split Odd / Even Pages", "split-odd-even"), description: 'Separate odd and even pages',  status: "live", category: "pdf", subCategory: 'Organize PDF' },
  { name: 'Swap Pages', slug: 'swap-pages', icon: inferIcon("Swap Pages", "swap-pages"), description: 'Swap two pages',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'pageA', label: 'Page A', min: 1, default: 1 },
      { type: 'number', key: 'pageB', label: 'Page B', min: 1, default: 2 }
    ] },
  { name: 'Tint Pages', slug: 'tint-pages', icon: inferIcon("Tint Pages", "tint-pages"), description: 'Apply a color tint to pages',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'text', key: 'color', label: 'Tint color (hex)', placeholder: '#ffff00' },
      { type: 'number', key: 'opacity', label: 'Opacity (0–1)', min: 0, max: 1, default: 0.1 }
    ] },
  { name: 'Trim Pages', slug: 'trim-pages', icon: inferIcon("Trim Pages", "trim-pages"), description: 'Remove pages from start or end',  status: "live", category: "pdf", subCategory: 'Organize PDF',
    inputs: [
      { type: 'number', key: 'count', label: 'Number of pages to remove', min: 1, default: 1 },
      { type: 'select', key: 'from', label: 'Remove from', options: [
        { label: 'Start', value: 'start' }, { label: 'End', value: 'end' }
      ] }
    ] },
  

  // ============ CONVERT FROM PDF (12) ============
  { name: 'PDF to Image', slug: 'pdf-to-image', icon: inferIcon("PDF to Image", "pdf-to-image"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "Extract Embedded Images", slug: "extract-images", icon: inferIcon("Extract Embedded Images", "extract-images"), description: "Pull all images out of a PDF",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to CSV", slug: "pdf-to-csv", icon: inferIcon("PDF to CSV", "pdf-to-csv"), description: "Extract tabular PDF data to CSV",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to EPUB", slug: "pdf-to-epub", icon: inferIcon("PDF to EPUB", "pdf-to-epub"), description: "Convert PDFs into EPUB ebooks",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to HTML", slug: "pdf-to-html", icon: inferIcon("PDF to HTML", "pdf-to-html"), description: "Convert PDF content to HTML",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to JSON", slug: "pdf-to-json", icon: inferIcon("PDF to JSON", "pdf-to-json"), description: "Export PDF structure as JSON",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to Long Image', slug: 'pdf-to-long-image', icon: inferIcon("PDF to Long Image", "pdf-to-long-image"), description: 'Combine pages into one long image',  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to Markdown", slug: "pdf-to-markdown", icon: inferIcon("PDF to Markdown", "pdf-to-markdown"), description: "Convert PDF content to Markdown",  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: 'PDF to ODT', slug: 'pdf-to-odt', icon: inferIcon("PDF to ODT", "pdf-to-odt"), description: 'Convert PDF to OpenDocument Text',  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  { name: "PDF to SVG", slug: "pdf-to-svg", icon: inferIcon("PDF to SVG", "pdf-to-svg"), description: "Convert PDF pages to SVG vectors",  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },
   { name: 'PDF to Text', slug: 'pdf-to-text', icon: inferIcon("PDF to Text", "pdf-to-text"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert from PDF' },{ name: 'PDF to XML', slug: 'pdf-to-xml', icon: inferIcon("PDF to XML", "pdf-to-xml"), description: 'Extract PDF text to XML format',  status: "live", category: "pdf", subCategory: 'Convert from PDF' },
  

  // ============ CONVERT TO PDF (11) ============
  { name: 'Word to PDF', slug: 'word-to-pdf', icon: inferIcon("Word to PDF", "word-to-pdf"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "Image to PDF", slug: "image-to-pdf", icon: inferIcon("Image to PDF", "image-to-pdf"), description: "Convert any image to a PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'Excel to PDF', slug: 'excel-to-pdf', icon: inferIcon("Excel to PDF", "excel-to-pdf"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'CSV to PDF', slug: 'csv-to-pdf', icon: inferIcon("CSV to PDF", "csv-to-pdf"), description: 'Convert CSV table to PDF',  status: "live", category: "pdf", subCategory: 'Convert to PDF',
    inputs: [{ type: 'select', key: 'orientation', label: 'Page orientation', options: [
      { label: 'Portrait', value: 'portrait' }, { label: 'Landscape', value: 'landscape' }
    ] }] },
  { name: 'EPUB to PDF', slug: 'epub-to-pdf', icon: inferIcon("EPUB to PDF", "epub-to-pdf"), description: 'Convert EPUB ebook to PDF',  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "HTML to PDF", slug: "html-to-pdf", icon: inferIcon("HTML to PDF", "html-to-pdf"), description: "Render HTML markup to a PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "Markdown to PDF", slug: "markdown-to-pdf", icon: inferIcon("Markdown to PDF", "markdown-to-pdf"), description: "Convert Markdown notes to PDF",  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  { name: 'PowerPoint to PDF', slug: 'powerpoint-to-pdf', icon: inferIcon("PowerPoint to PDF", "powerpoint-to-pdf"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },  { name: 'RTF to PDF', slug: 'rtf-to-pdf', icon: inferIcon("RTF to PDF", "rtf-to-pdf"), description: 'Convert Rich Text to PDF',  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "SVG to PDF", slug: "svg-to-pdf", icon: inferIcon("SVG to PDF", "svg-to-pdf"), description: "Convert SVG vectors to a PDF",  status: "live", category: "pdf", subCategory: 'Convert to PDF' },
  { name: "Text to PDF", slug: "text-to-pdf", icon: inferIcon("Text to PDF", "text-to-pdf"), description: "Turn plain text into a PDF",  status: "soon", category: "pdf", subCategory: 'Convert to PDF' },
  

  // ============ SECURITY (6) ============
  { name: 'PDF Password Protector', slug: 'protect', icon: inferIcon("PDF Password Protector", "protect"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Security' },
  { name: 'PDF Password Remover', slug: 'unlock', icon: inferIcon("PDF Password Remover", "unlock"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Security' },
  { name: 'PDF Redaction Tool', slug: 'redact', icon: inferIcon("PDF Redaction Tool", "redact"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Security' },
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
  { name: "Highlight Text", slug: "highlight-text", icon: inferIcon("Highlight Text", "highlight-text"), description: "Highlight passages in your PDF",  status: "live", category: "pdf", subCategory: 'Edit PDF' },
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
  { name: "Strike Text", slug: "strike-text", icon: inferIcon("Strike Text", "strike-text"), description: "Strike through text in a PDF",  status: "live", category: "pdf", subCategory: 'Edit PDF' },
  { name: "Underline Text", slug: "underline-text", icon: inferIcon("Underline Text", "underline-text"), description: "Underline text in your PDF",  status: "live", category: "pdf", subCategory: 'Edit PDF' },
  

  // ============ INFO & INSPECTION (28) ============
  { name: 'PDF File Information', slug: 'file-info', icon: inferIcon("PDF File Information", "file-info"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
   { name: 'PDF Metadata Viewer', slug: 'view-metadata', icon: inferIcon("PDF Metadata Viewer", "view-metadata"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
   { name: 'Extract Tables', slug: 'extract-tables', icon: inferIcon("Extract Tables", "extract-tables"), description: 'Extract tables to CSV',  status: "live", category: "pdf", subCategory: 'Info & Inspection' },
   { name: 'PDF Certificate Inspector', slug: 'certificate-inspector', icon: inferIcon("PDF Certificate Inspector", "certificate-inspector"), description: 'Inspect digital certificates in a PDF',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
   { name: 'PDF Link Extractor', slug: 'extract-links', icon: inferIcon("PDF Link Extractor", "extract-links"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Detect Duplicates', slug: 'detect-duplicates', icon: inferIcon("Detect Duplicates", "detect-duplicates"), description: 'Detect duplicate pages',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Image Count', slug: 'image-count', icon: inferIcon("Image Count", "image-count"), description: 'Count embedded images',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'Language Detector', slug: 'language-detector', icon: inferIcon("Language Detector", "language-detector"), description: 'Detect document language',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: "PDF Attachment Viewer", slug: "attachment-viewer", icon: inferIcon("PDF Attachment Viewer", "attachment-viewer"), description: "View files attached to a PDF",  status: "live", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Viewer', slug: 'viewer', icon: inferIcon("PDF Viewer", "viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Citation/Reference Extractor', slug: 'extract-citations', icon: inferIcon("PDF Citation/Reference Extractor", "extract-citations"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Color Space Detector', slug: 'color-space-detector', icon: inferIcon("PDF Color Space Detector", "color-space-detector"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Color-Blindness Simulation Preview', slug: 'colorblind-preview', icon: inferIcon("PDF Color-Blindness Simulation Preview", "colorblind-preview"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },{ name: 'PDF Continuous Scroll Viewer', slug: 'continuous-scroll-viewer', icon: inferIcon("PDF Continuous Scroll Viewer", "continuous-scroll-viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Dual Page Viewer', slug: 'dual-page-viewer', icon: inferIcon("PDF Dual Page Viewer", "dual-page-viewer"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Email Address Extractor', slug: 'extract-emails', icon: inferIcon("PDF Email Address Extractor", "extract-emails"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
  { name: "PDF Font Inspector", slug: "font-inspector", icon: inferIcon("PDF Font Inspector", "font-inspector"), description: "Inspect fonts used in a PDF",  status: "live", category: "pdf", subCategory: 'Info & Inspection' },
  { name: 'PDF Heading Outline Extractor', slug: 'heading-extractor', icon: inferIcon("PDF Heading Outline Extractor", "heading-extractor"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Info & Inspection' },
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
  { name: 'PDF Flatten Tool', slug: 'flatten', icon: inferIcon("PDF Flatten Tool", "flatten"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Optimize & Color' },
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
  { name: "Form Field Inspector", slug: "form-field-inspector", icon: inferIcon("Form Field Inspector", "form-field-inspector"), description: "Inspect every form field",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Form Field Renamer", slug: "form-field-renamer", icon: inferIcon("Form Field Renamer", "form-field-renamer"), description: "Bulk rename PDF form fields",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'Form to HTML', slug: 'form-to-html', icon: inferIcon("Form to HTML", "form-to-html"), description: 'Extract form to HTML',  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: "Import Form Data", slug: "import-form-data", icon: inferIcon("Import Form Data", "import-form-data"), description: "Import form data from a JSON file",  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'PDF Signature Presence Checker', slug: 'signature-presence-checker', icon: inferIcon("PDF Signature Presence Checker", "signature-presence-checker"), description: "Upcoming PDF tool", status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },{ name: 'Remove Signatures', slug: 'remove-signatures', icon: inferIcon("Remove Signatures", "remove-signatures"), description: 'Remove signature widgets',  status: "live", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'Signature Booklet', slug: 'signature-booklet', icon: inferIcon("Signature Booklet", "signature-booklet"), description: 'Reorder for saddle-stitch',  status: "soon", category: "pdf", subCategory: 'Forms & Signatures' },
  { name: 'Uniform Page Size', slug: 'uniform-page-size', icon: inferIcon("Uniform Page Size", "uniform-page-size"), description: 'Make all pages the same size',  status: "live", category: "pdf", subCategory: 'Forms & Signatures',
    inputs: [{ type: 'select', key: 'pageSize', label: 'Target size', options: [
      { label: 'A4', value: 'A4' }, { label: 'Letter', value: 'Letter' },
      { label: 'A3', value: 'A3' }, { label: 'Legal', value: 'Legal' }
    ] }] },
  

  // ============ PRINT & LAYOUT (3) ============
  { name: 'PDF Booklet Maker', slug: 'booklet-maker', icon: inferIcon("PDF Booklet Maker", "booklet-maker"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Print & Layout' },
   { name: 'PDF N-Up Layout Tool', slug: 'n-up-layout', icon: inferIcon("PDF N-Up Layout Tool", "n-up-layout"), description: 'Free, private, and secure PDF tool.',  status: "soon", category: "pdf", subCategory: 'Print & Layout' },{ name: "Print Margin Adjuster", slug: "print-margin-adjuster", icon: inferIcon("Print Margin Adjuster", "print-margin-adjuster"), description: "Adjust margins before printing",  status: "live", category: "pdf", subCategory: 'Print & Layout' },
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
  { name: 'Keyword Frequency', slug: 'keyword-frequency', icon: inferIcon("Keyword Frequency", "keyword-frequency"), description: 'Count most frequent words',  status: "soon", category: "pdf", subCategory: 'Utilities',
    inputs: [{ type: 'number', key: 'topN', label: 'Show top N words', min: 5, max: 200, default: 50 }] },
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
  ];

export const categories = Array.from(new Set(tools.map((t) => (t as any).category)));

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
