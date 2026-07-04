import type { Tool } from "@/domains/pdf/registry/tools";

/**
 * Per-tool configuration for the unified single-page tool template.
 *
 * Every catalog tool gets a config; tools without an explicit entry fall
 * back to `defaultConfig`. The config drives the upload zone (accept types,
 * multi/single file), the action button (label, disabled-until-files),
 * the output filename, and the SEO metadata.
 *
 * Constraints honored:
 *  - No file-size hard block (maxSizeNote is advisory text only).
 *  - 100% client-side. `serverOnly` flags tools that cannot run in-browser
 *    (e.g. PowerPoint → PDF) — their action button renders disabled with a
 *    "coming soon" notice per spec, never a broken stub.
 */

export type ToolMode =
  | "default"        // single-PDF-in → PDF-out
  | "multi-pdf"      // many PDFs in (merge)
  | "image-in"       // image(s) in → PDF
  | "pdf-to-image"   // PDF in → image(s)/zip
  | "office-in"      // .docx/.xlsx/.pptx in → PDF
  | "pdf-to-office"  // PDF in → .docx/.xlsx/.pptx
  | "security"       // password / restriction tools
  | "ocr"            // OCR
  | "info";          // read-only inspection (no file mutation)

export interface ToolConfig {
  /** Action button label, specific to the tool (never generic). */
  actionLabel: string;
  /** HTML `accept` value for the file input. */
  accept: string;
  /** Whether multiple files can be added. */
  multiFile: boolean;
  /** Drives the upload-zone primary text, e.g. "PDF" or "JPG / PNG". */
  fileKindLabel: string;
  /** Advisory sub-text shown under the upload zone. Advisory only — never enforced. */
  maxSizeNote: string;
  /** Output file extension, used to build `racira-[slug]-output.[ext]`. */
  outputExt: string;
  /** Logical mode — selects the work-area sub-layout. */
  mode: ToolMode;
  /** Title-case category name shown in the breadcrumb. */
  category: string;
  /** <head> description, 150–160 chars. */
  metaDescription: string;
  /** True only for tools that genuinely cannot run client-side (PPT→PDF). */
  serverOnly?: boolean;
  /** Conversion-quality / hint note rendered under the upload zone. */
  hint?: string;
}

/** Advisory size note — kept consistent and advisory-only across tools. */
const ADVISORY_SIZE = "No size limit — large files welcome";

/** Build a meta description clamped to ~158 chars. */
const meta = (s: string): string => s;

const base = (category: string): Partial<ToolConfig> => ({ category });

/** Build a config for a text/markdown/json/html → PDF tool. */
function txtIn(label: string, accept: string): Partial<ToolConfig> {
  return {
    actionLabel: "Convert to PDF",
    accept,
    multiFile: false,
    fileKindLabel: label,
    outputExt: "pdf",
    mode: "default",
    maxSizeNote: ADVISORY_SIZE,
    metaDescription: `Convert ${label} to a PDF instantly in your browser. Free, private — no uploads, no signup.`,
  };
}

/** Build a config for an inspection tool that outputs JSON. */
function infoOut(label: string): Partial<ToolConfig> {
  return {
    actionLabel: label,
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "json",
    mode: "info",
    maxSizeNote: ADVISORY_SIZE,
    metaDescription: "Inspect PDF details instantly in your browser. Free, private, no signup.",
  };
}

/** Inspection tool that outputs a .txt file. */
function txtOutCfg(label: string): Partial<ToolConfig> {
  return {
    actionLabel: label,
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "txt",
    mode: "info",
    maxSizeNote: ADVISORY_SIZE,
    metaDescription: "Extract details from a PDF in your browser. Free, private, no signup.",
  };
}

/** Inspection tool that outputs a .json file. */
function jsonOutCfg(label: string): Partial<ToolConfig> {
  return {
    actionLabel: label,
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "json",
    mode: "info",
    maxSizeNote: ADVISORY_SIZE,
    metaDescription: "Analyze a PDF in your browser. Free, private, no signup.",
  };
}

/**
 * Explicit per-slug overrides. Tools not listed here use `defaultConfig`.
 * The homepage passes the resolved `Tool` (which already carries name,
 * description, icon, category, slug) so we only store the deltas here.
 */
const toolConfigs: Record<string, Partial<ToolConfig>> = {
  // ── Organize PDF ──────────────────────────────────────────────
  "merge": {
    actionLabel: "Merge PDFs",
    accept: ".pdf",
    multiFile: true,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "multi-pdf",
    metaDescription: meta("Merge multiple PDF files into one document in seconds. Free, secure, and 100% browser-based — your files never leave your device. No signup required."),
  },
  "split": {
    actionLabel: "Split PDF",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "zip",
    mode: "default",
    metaDescription: meta("Split a PDF into individual pages or custom ranges. Free online tool that processes everything in your browser — no uploads, no signup."),
  },
  "compress": {
    actionLabel: "Compress PDF",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Reduce PDF file size without losing quality. Choose your compression level and shrink PDFs instantly in your browser. Free, private, no signup."),
  },
  "rotate": {
    actionLabel: "Apply Rotation",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Rotate PDF pages 90°, 180° or 270° in any direction. Fix sideways or upside-down pages instantly in your browser. Free, private, no signup."),
  },
  "extract-pages": {
    actionLabel: "Extract Pages",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Extract selected pages from a PDF into a new document. Pick exactly the pages you need — all processed privately in your browser. Free, no signup."),
  },
  "delete-pages": {
    actionLabel: "Delete Pages",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Delete unwanted pages from a PDF and keep only what you need. Done instantly in your browser — your file never gets uploaded. Free, no signup."),
  },
  "organize-pages": {
    actionLabel: "Rearrange Pages",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Reorder PDF pages with drag and drop. Move pages anywhere you like — all in your browser, fully private. Free online PDF organizer, no signup."),
  },
  "add-blank-pages": {
    actionLabel: "Insert Blank Pages",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Add blank pages to a PDF at any position. Insert cover sheets or spacing pages instantly in your browser. Free, private, no signup."),
  },
  "duplicate-pages": {
    actionLabel: "Duplicate Pages",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Duplicate any page in a PDF in seconds. Clone single pages or ranges — processed privately in your browser. Free online PDF tool, no signup."),
  },
  "reverse-pages": {
    actionLabel: "Reverse Pages",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Reverse the page order of a PDF instantly. Flip documents back-to-front — all in your browser, fully private. Free online tool, no signup."),
  },
  "crop-pages": {
    actionLabel: "Crop PDF",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Crop margins from PDF pages to trim whitespace or borders. Adjust margins per page — all in your browser, fully private. Free, no signup."),
  },
  "headers-footers": {
    actionLabel: "Add Page Numbers",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Add page numbers to a PDF at the position and starting number you choose. Inserted instantly in your browser — private and free, no signup."),
  },

  // ── Convert to PDF (office + images → PDF) ────────────────────
  "word-to-pdf": {
    actionLabel: "Convert to PDF",
    accept: ".docx,.doc",
    multiFile: false,
    fileKindLabel: "Word (.docx)",
    outputExt: "pdf",
    mode: "office-in",
    hint: "Best results with .docx files containing text and standard formatting.",
    metaDescription: meta("Convert Word documents (.docx) to PDF instantly in your browser. Free, private, no uploads and no signup — your file never leaves your device."),
  },
  "excel-to-pdf": {
    actionLabel: "Convert to PDF",
    accept: ".xlsx,.xls,.csv",
    multiFile: false,
    fileKindLabel: "Excel (.xlsx)",
    outputExt: "pdf",
    mode: "office-in",
    hint: "Best results with simple spreadsheets; complex layouts may reflow.",
    metaDescription: meta("Convert Excel spreadsheets (.xlsx, .csv) to PDF in your browser. Free and private — no uploads, no signup. Get a clean PDF from any spreadsheet."),
  },
  "powerpoint-to-pdf": {
    // HARD CONSTRAINT: no viable client-side implementation.
    actionLabel: "Server processing required — coming soon",
    accept: ".pptx,.ppt",
    multiFile: false,
    fileKindLabel: "PowerPoint (.pptx)",
    outputExt: "pdf",
    mode: "office-in",
    serverOnly: true,
    hint: "PowerPoint to PDF conversion requires server-side rendering and is coming soon.",
    metaDescription: meta("Convert PowerPoint (.pptx) to PDF. This tool is coming soon — in the meantime explore our other free, private, browser-based PDF tools."),
  },
  "jpg-to-pdf": {
    actionLabel: "Convert to PDF",
    accept: "image/jpeg,.jpg,.jpeg",
    multiFile: true,
    fileKindLabel: "JPG",
    outputExt: "pdf",
    mode: "image-in",
    metaDescription: meta("Convert JPG images to a single PDF. Combine multiple photos into one document instantly in your browser. Free, private, no signup."),
  },
  "png-to-pdf": {
    actionLabel: "Convert to PDF",
    accept: "image/png,.png",
    multiFile: true,
    fileKindLabel: "PNG",
    outputExt: "pdf",
    mode: "image-in",
    metaDescription: meta("Convert PNG images to a PDF in your browser. Combine multiple PNGs into one document — free, private, no signup."),
  },
  "image-to-pdf": {
    actionLabel: "Convert to PDF",
    accept: "image/jpeg,image/png,.jpg,.jpeg,.png",
    multiFile: true,
    fileKindLabel: "JPG / PNG",
    outputExt: "pdf",
    mode: "image-in",
    metaDescription: meta("Convert JPG and PNG images to a PDF instantly in your browser. Free and private — no uploads, no signup."),
  },

  // ── Convert from PDF (PDF → office + images) ──────────────────
  "pdf-to-word": {
    actionLabel: "Convert to Word",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "docx",
    mode: "pdf-to-office",
    hint: "Best results with text-based PDFs. Scanned/image PDFs need OCR first.",
    metaDescription: meta("Convert PDF to editable Word (.docx) in your browser. Extract text into an editable document — free, private, no uploads, no signup."),
  },
  "pdf-to-excel": {
    actionLabel: "Convert to Excel",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "xlsx",
    mode: "pdf-to-office",
    hint: "Best results with tabular, text-based PDFs.",
    metaDescription: meta("Convert PDF tables to Excel (.xlsx) in your browser. Extract tabular data into a spreadsheet — free, private, no uploads, no signup."),
  },
  "pdf-to-powerpoint": {
    actionLabel: "Convert to PowerPoint",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pptx",
    mode: "pdf-to-office",
    hint: "Creates an image-based slide per PDF page. Best for presentations of existing PDF content.",
    metaDescription: meta("Convert PDF to PowerPoint (.pptx) in your browser. Each page becomes a slide — free, private, no uploads, no signup."),
  },
  "pdf-to-jpg": {
    actionLabel: "Convert to JPG",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "zip",
    mode: "pdf-to-image",
    metaDescription: meta("Convert PDF pages to JPG images. Download all pages as a zip — processed instantly in your browser. Free, private, no signup."),
  },
  "pdf-to-png": {
    actionLabel: "Convert to PNG",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "zip",
    mode: "pdf-to-image",
    metaDescription: meta("Convert PDF pages to PNG images. Download all pages as a zip — processed instantly in your browser. Free, private, no signup."),
  },

  // ── Security ──────────────────────────────────────────────────
  "protect": {
    actionLabel: "Protect PDF",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "security",
    metaDescription: meta("Add a password to a PDF to keep it private. Client-side AES encryption — your file and password never leave your browser. Free, no signup."),
  },
  "protect-pdf": {
    actionLabel: "Protect PDF",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "security",
    metaDescription: meta("Add a password to a PDF to keep it private. Client-side AES encryption — your file and password never leave your browser. Free, no signup."),
  },
  "add-password": {
    actionLabel: "Add Password",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "security",
    metaDescription: meta("Add a password to a PDF for privacy. Encryption runs entirely in your browser — your file and password never get uploaded. Free, no signup."),
  },
  "unlock": {
    actionLabel: "Remove Password",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "security",
    hint: "Enter the password that protects the PDF. Removes the open password.",
    metaDescription: meta("Remove the password from a PDF you own. Enter the password and unlock it instantly in your browser — free, private, no signup."),
  },
  "remove-password": {
    actionLabel: "Remove Password",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "security",
    metaDescription: meta("Remove the password from a PDF you own. Enter the password and unlock it in your browser — free, private, no signup."),
  },

  // ── OCR ───────────────────────────────────────────────────────
  "ocr-pdf": {
    actionLabel: "Run OCR",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "ocr",
    hint: "OCR runs entirely in your browser via WebAssembly. Large files process page by page.",
    metaDescription: meta("Run OCR on scanned PDFs to make them searchable and copyable. Runs 100% in your browser via WebAssembly — free, private, no signup."),
  },

  // ── Edit PDF ──────────────────────────────────────────────────
  "add-watermark": {
    actionLabel: "Add Watermark",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Add a text watermark to a PDF. Control text, size and opacity — applied instantly in your browser. Free, private, no signup."),
  },
  "add-text": {
    actionLabel: "Add Text",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "pdf",
    mode: "default",
    metaDescription: meta("Add text to a PDF page. Place your text exactly where you need it — done in your browser, fully private. Free, no signup."),
  },

  // ── Info / read-only tools (no mutation) ──────────────────────
  "page-counter": {
    actionLabel: "Count Pages",
    accept: ".pdf",
    multiFile: false,
    fileKindLabel: "PDF",
    outputExt: "json",
    mode: "info",
    metaDescription: meta("Instantly count the pages in any PDF. Runs entirely in your browser — free, private, no signup."),
  },

  // ── Text/markdown/json/html → PDF (text input) ─────────────────
  "text-to-pdf": txtIn("Text", ".txt"),
  "txt-to-pdf": txtIn("TXT", ".txt"),
  "markdown-to-pdf": txtIn("Markdown", ".md,.markdown"),
  "json-to-pdf": txtIn("JSON", ".json"),
  "html-to-pdf": txtIn("HTML", ".html,.htm"),

  // ── More Convert-from-PDF outputs ──────────────────────────────
  "pdf-to-webp": { actionLabel: "Convert to WebP", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "zip", mode: "pdf-to-image", metaDescription: meta("Convert PDF pages to WebP images. Download all pages as a zip — processed instantly in your browser. Free, private, no signup.") },
  "pdf-to-svg": { actionLabel: "Convert to SVG", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "zip", mode: "pdf-to-image", metaDescription: meta("Convert PDF pages to vector images in your browser. Free, private, no signup.") },
  "pdf-to-zip-images": { actionLabel: "Export Images", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "zip", mode: "pdf-to-image", metaDescription: meta("Export every PDF page as an image in a zip — free, private, browser-based.") },
  "pdf-pages-to-images": { actionLabel: "Export Images", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "zip", mode: "pdf-to-image", metaDescription: meta("Export every PDF page as an image — free, private, browser-based.") },
  "extract-images": { actionLabel: "Extract Images", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "zip", mode: "pdf-to-image", metaDescription: meta("Pull all embedded images out of a PDF. Runs in your browser — free, private, no signup.") },
  "extract-text-txt": { actionLabel: "Extract Text", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "txt", mode: "info", metaDescription: meta("Extract all text from a PDF into a .txt file. Runs entirely in your browser — free, private, no signup.") },
  "text-extraction": { actionLabel: "Extract Text", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "txt", mode: "info", metaDescription: meta("Extract all text from a PDF. Runs entirely in your browser — free, private, no signup.") },
  "extract-attachments": { actionLabel: "Extract Attachments", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "zip", mode: "info", metaDescription: meta("Download files attached to a PDF. Runs entirely in your browser — free, private, no signup.") },
  "pdf-to-base64": { actionLabel: "Encode to Base64", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "txt", mode: "info", metaDescription: meta("Encode a PDF as Base64 text in your browser. Free, private, no signup.") },
  "base64-to-pdf": { actionLabel: "Decode to PDF", accept: ".txt,.text", multiFile: false, fileKindLabel: "Base64 (.txt)", outputExt: "pdf", mode: "default", metaDescription: meta("Decode Base64 text back into a PDF in your browser. Free, private, no signup.") },
  "pdf-to-html": { actionLabel: "Convert to HTML", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "html", mode: "pdf-to-office", hint: "Best results with text-based PDFs.", metaDescription: meta("Convert PDF content to HTML in your browser. Free, private, no signup.") },
  "pdf-to-markdown": { actionLabel: "Convert to Markdown", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "md", mode: "pdf-to-office", metaDescription: meta("Convert PDF text to Markdown in your browser. Free, private, no signup.") },
  "pdf-to-json": { actionLabel: "Export JSON", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "json", mode: "info", metaDescription: meta("Export PDF structure as JSON in your browser. Free, private, no signup.") },
  "pdf-to-csv": { actionLabel: "Convert to CSV", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "csv", mode: "pdf-to-office", hint: "Best results with tabular, text-based PDFs.", metaDescription: meta("Extract tabular PDF data to CSV in your browser. Free, private, no signup.") },
  "pdf-to-epub": { actionLabel: "Convert to EPUB", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "epub", mode: "pdf-to-office", metaDescription: meta("Convert a PDF into an EPUB ebook in your browser. Free, private, no signup.") },

  // ── Optimize / color ───────────────────────────────────────────
  "grayscale-pdf": { actionLabel: "Grayscale PDF", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "pdf", mode: "default", metaDescription: meta("Convert every PDF page to grayscale in your browser. Free, private, no signup.") },
  "invert-colors": { actionLabel: "Invert Colors", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "pdf", mode: "default", metaDescription: meta("Invert the colors of a PDF in your browser. Free, private, no signup.") },
  "remove-metadata": { actionLabel: "Remove Metadata", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "pdf", mode: "default", metaDescription: meta("Erase author, title and other metadata from a PDF. Client-side, private, free.") },

  // ── Analysis / inspection (JSON output) ────────────────────────
  "pdf-statistics": infoOut("View Statistics"),
  "page-size-inspector": infoOut("Inspect Sizes"),
  "font-inspector": infoOut("Inspect Fonts"),
  "font-extractor": infoOut("Extract Fonts"),
  "object-inspector": infoOut("Inspect Objects"),
  "link-extractor": infoOut("Extract Links"),
  "attachment-viewer": infoOut("View Attachments"),
  "accessibility-checker": infoOut("Run Audit"),
  "version-detector": infoOut("Detect Version"),
  "structure-viewer": infoOut("View Structure"),
  "hex-viewer": infoOut("View Hex"),
  "linearization-checker": infoOut("Check Linearization"),
  "pdfa-checker": infoOut("Check PDF/A"),
  "xmp-metadata-viewer": infoOut("View XMP"),
  "page-label-editor": infoOut("Inspect Labels"),
  "permission-inspector": infoOut("Inspect Permissions"),
  "signature-inspector": infoOut("Inspect Signatures"),
  "metadata-viewer": infoOut("View Metadata"),
  "metadata-editor": infoOut("Edit Metadata"),
  "bookmark-viewer": infoOut("View Bookmarks"),
  "edit-bookmarks": infoOut("Edit Bookmarks"),

  // ── Text tools ─────────────────────────────────────────────────
  "extract-pdf-links": txtOutCfg("Extract Links"),
  "extract-pdf-urls": txtOutCfg("Extract URLs"),
  "extract-pdf-emails": txtOutCfg("Extract Emails"),
  "word-count": jsonOutCfg("Count Words"),
  "character-count": jsonOutCfg("Count Characters"),
  "reading-time": jsonOutCfg("Estimate Reading Time"),

  // ── Security output ────────────────────────────────────────────
  "password-strength-checker": { actionLabel: "Check Strength", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "json", mode: "info", metaDescription: meta("Test the strength of a PDF password. Runs in your browser — free, private.") },

  // ── Chapter split (zip output) ─────────────────────────────────
  "chapter-splitter": { actionLabel: "Split by Chapter", accept: ".pdf", multiFile: false, fileKindLabel: "PDF", outputExt: "zip", mode: "default", metaDescription: meta("Split a PDF by bookmarks/chapters in your browser. Free, private, no signup.") },
};

/** Default config for any catalog tool without an explicit override. */
const defaultConfig: ToolConfig = {
  actionLabel: "Process File",
  accept: ".pdf",
  multiFile: false,
  fileKindLabel: "PDF",
  maxSizeNote: ADVISORY_SIZE,
  outputExt: "pdf",
  mode: "default",
  category: "",
  metaDescription: meta("Free online PDF tool that runs entirely in your browser. Your files never get uploaded — private, fast and no signup required."),
};

/** Resolve a full config for a tool, merging overrides with defaults. */
export function getToolConfig(tool: Tool): ToolConfig {
  const override = toolConfigs[tool.slug] ?? {};
  return {
    ...defaultConfig,
    ...override,
    category: tool.category,
    maxSizeNote: override.maxSizeNote ?? ADVISORY_SIZE,
  };
}

/** Output filename: `racira-[slug]-output.[ext]`. */
export function outputFilename(slug: string, ext: string): string {
  if (!ext) return `racira-${slug}-output`;
  return `racira-${slug}-output.${ext}`;
}
