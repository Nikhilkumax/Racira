// This file centralizes the definition of all available tools, organized by category.
const baseCategories = [
  {
    name: 'Popular Tools',
    tools: [
      {
        href: '/' + 'edit-pdf-text.html',
        name: 'Edit PDF Text',
        icon: 'ph-cursor-text',
        subtitle:
          'Click any paragraph and edit it in place with live reflow, fonts, and styling.',
      },
      {
        href: '/' + 'pdf-workflow.html',
        name: 'PDF Workflow Builder',
        icon: 'ph-tree-structure',
        subtitle:
          'Build custom PDF processing pipelines with a visual node editor.',
      },
      {
        href: '/' + 'pdf-multi-tool.html',
        name: 'PDF Multi Tool',
        icon: 'ph-pencil-ruler',
        subtitle:
          'Merge, Split, Organize, Delete, Rotate, Add Blank Pages, Extract and Duplicate in a unified interface.',
      },
      {
        href: '/' + 'merge-pdf.html',
        name: 'Merge PDF',
        icon: 'ph-browsers',
        subtitle: 'Combine multiple PDFs into one file. Preserves Bookmarks.',
      },
      {
        href: '/' + 'split-pdf.html',
        name: 'Split PDF',
        icon: 'ph-scissors',
        subtitle: 'Extract a range of pages into a new PDF.',
      },
      {
        href: '/' + 'compress-pdf.html',
        name: 'Compress PDF',
        icon: 'ph-lightning',
        subtitle: 'Reduce the file size of your PDF.',
      },
      {
        href: '/' + 'edit-pdf.html',
        name: 'PDF Editor',
        icon: 'ph-pencil-simple',
        subtitle:
          'Annotate, highlight, redact, comment, add shapes/images, search, and view PDFs.',
      },
      {
        href: '/' + 'jpg-to-pdf.html',
        name: 'JPG to PDF',
        icon: 'ph-file-jpg',
        subtitle: 'Create a PDF from one or more JPG images.',
      },
      {
        href: '/' + 'sign-pdf.html',
        name: 'Sign PDF',
        icon: 'ph-pen-nib',
        subtitle: 'Draw, type, or upload your signature.',
      },
      {
        href: '/' + 'crop-pdf.html',
        name: 'Crop PDF',
        icon: 'ph-crop',
        subtitle: 'Trim the margins of every page in your PDF.',
      },
      {
        href: '/' + 'extract-pages.html',
        name: 'Extract Pages',
        icon: 'ph-squares-four',
        subtitle: 'Save a selection of pages as new files.',
      },
      {
        href: '/' + 'organize-pdf.html',
        name: 'Duplicate & Organize',
        icon: 'ph-files',
        subtitle: 'Duplicate, reorder, and delete pages.',
      },
      {
        href: '/' + 'delete-pages.html',
        name: 'Delete Pages',
        icon: 'ph-trash',
        subtitle: 'Remove specific pages from your document.',
      },
    ],
  },
  {
    name: 'Edit & Annotate',
    tools: [
      {
        href: '/' + 'edit-pdf.html',
        name: 'PDF Editor',
        icon: 'ph-pencil-simple',
        subtitle:
          'Annotate, highlight, redact, comment, add shapes/images, search, and view PDFs.',
      },
      {
        href: '/' + 'edit-pdf-text.html',
        name: 'Edit PDF Text',
        icon: 'ph-cursor-text',
        subtitle:
          'Click any paragraph and edit it in place with live reflow, fonts, and styling.',
      },
      {
        href: '/' + 'bookmark.html',
        name: 'Edit Bookmarks',
        icon: 'ph-bookmark',
        subtitle: 'Add, edit, import, delete and extract PDF bookmarks.',
      },
      {
        href: '/' + 'table-of-contents.html',
        name: 'Table of Contents',
        icon: 'ph-list',
        subtitle: 'Generate a table of contents page from PDF bookmarks.',
      },
      {
        href: '/' + 'page-numbers.html',
        name: 'Page Numbers',
        icon: 'ph-list-numbers',
        subtitle: 'Insert page numbers into your document.',
      },
      {
        href: '/' + 'add-page-labels.html',
        name: 'Add Page Labels',
        icon: 'ph-text-aa',
        subtitle:
          'Apply PDF page labels with Roman numerals, prefixes, and custom starts.',
      },
      {
        href: '/' + 'bates-numbering.html',
        name: 'Bates Numbering',
        icon: 'ph-hash',
        subtitle: 'Add sequential Bates numbers across one or more PDF files.',
      },
      {
        href: '/' + 'add-watermark.html',
        name: 'Add Watermark',
        icon: 'ph-drop',
        subtitle: 'Stamp text or an image over your PDF pages.',
      },
      {
        href: '/' + 'header-footer.html',
        name: 'Header & Footer',
        icon: 'ph-paragraph',
        subtitle: 'Add text to the top and bottom of pages.',
      },
      {
        href: '/' + 'invert-colors.html',
        name: 'Invert Colors',
        icon: 'ph-circle-half',
        subtitle: 'Create a "dark mode" version of your PDF.',
      },
      {
        href: '/' + 'scanner-effect.html',
        name: 'Scanner Effect',
        icon: 'ph-scan',
        subtitle: 'Make your PDF look like a scanned document.',
      },
      {
        href: '/' + 'adjust-colors.html',
        name: 'Adjust Colors',
        icon: 'ph-sliders-horizontal',
        subtitle: 'Fine-tune brightness, contrast, saturation and more.',
      },
      {
        href: '/' + 'background-color.html',
        name: 'Background Color',
        icon: 'ph-palette',
        subtitle: 'Change the background color of your PDF.',
      },
      {
        href: '/' + 'text-color.html',
        name: 'Change Text Color',
        icon: 'ph-eyedropper',
        subtitle: 'Change the color of text in your PDF.',
      },
      {
        href: '/' + 'sign-pdf.html',
        name: 'Sign PDF',
        icon: 'ph-pen-nib',
        subtitle: 'Draw, type, or upload your signature.',
      },
      {
        href: '/' + 'add-stamps.html',
        name: 'Add Stamps',
        icon: 'ph-stamp',
        subtitle: 'Add image stamps to your PDF using the annotation toolbar.',
      },
      {
        href: '/' + 'remove-annotations.html',
        name: 'Remove Annotations',
        icon: 'ph-eraser',
        subtitle: 'Strip comments, highlights, and links.',
      },
      {
        href: '/' + 'crop-pdf.html',
        name: 'Crop PDF',
        icon: 'ph-crop',
        subtitle: 'Trim the margins of every page in your PDF.',
      },
      {
        href: '/' + 'form-filler.html',
        name: 'PDF Form Filler',
        icon: 'ph-pencil-line',
        subtitle:
          'Fill in forms directly in the browser. Also supports XFA forms.',
      },
      {
        href: '/' + 'form-creator.html',
        name: 'Create PDF Form',
        icon: 'ph-file-plus',
        subtitle: 'Create fillable PDF forms with drag-and-drop text fields.',
      },
      {
        href: '/' + 'remove-blank-pages.html',
        name: 'Remove Blank Pages',
        icon: 'ph-file-minus',
        subtitle: 'Automatically detect and delete blank pages.',
      },
    ],
  },
  {
    name: 'Convert to PDF',
    tools: [
      {
        href: '/' + 'image-to-pdf.html',
        name: 'Images to PDF',
        icon: 'ph-images',
        subtitle:
          'Convert JPG, PNG, BMP, GIF, TIFF, PNM, PGM, PBM, PPM, PAM, JXR, JPX, JP2, PSD, SVG, HEIC, WebP to PDF.',
      },
      {
        href: '/' + 'jpg-to-pdf.html',
        name: 'JPG to PDF',
        icon: 'ph-file-jpg',
        subtitle: 'Create a PDF from one or more JPG images.',
      },
      {
        href: '/' + 'png-to-pdf.html',
        name: 'PNG to PDF',
        icon: 'ph-file-png',
        subtitle: 'Create a PDF from one or more PNG images.',
      },
      {
        href: '/' + 'webp-to-pdf.html',
        name: 'WebP to PDF',
        icon: 'ph-image',
        subtitle: 'Create a PDF from one or more WebP images.',
      },
      {
        href: '/' + 'svg-to-pdf.html',
        name: 'SVG to PDF',
        icon: 'ph-file-svg',
        subtitle: 'Create a PDF from one or more SVG images.',
      },
      {
        href: '/' + 'bmp-to-pdf.html',
        name: 'BMP to PDF',
        icon: 'ph-image',
        subtitle: 'Create a PDF from one or more BMP images.',
      },
      {
        href: '/' + 'heic-to-pdf.html',
        name: 'HEIC to PDF',
        icon: 'ph-device-mobile',
        subtitle: 'Create a PDF from one or more HEIC images.',
      },
      {
        href: '/' + 'tiff-to-pdf.html',
        name: 'TIFF to PDF',
        icon: 'ph-image',
        subtitle: 'Create a PDF from one or more TIFF images.',
      },
      {
        href: '/' + 'txt-to-pdf.html',
        name: 'Text to PDF',
        icon: 'ph-text-t',
        subtitle: 'Convert a plain text file into a PDF.',
      },
      {
        href: '/' + 'markdown-to-pdf.html',
        name: 'Markdown to PDF',
        icon: 'ph-markdown-logo',
        subtitle:
          'Convert Markdown to PDF with live preview and syntax highlighting.',
      },
      {
        href: '/' + 'json-to-pdf.html',
        name: 'JSON to PDF',
        icon: 'ph-file-code',
        subtitle: 'Convert JSON files to PDF format.',
      },
      {
        href: '/' + 'odt-to-pdf.html',
        name: 'ODT to PDF',
        icon: 'ph-file',
        subtitle: 'Convert ODT (OpenDocument Text) files to PDF.',
      },
      {
        href: '/' + 'csv-to-pdf.html',
        name: 'CSV to PDF',
        icon: 'ph-file-csv',
        subtitle: 'Convert CSV (Comma-Separated Values) spreadsheets to PDF.',
      },
      {
        href: '/' + 'rtf-to-pdf.html',
        name: 'RTF to PDF',
        icon: 'ph-file-text',
        subtitle: 'Convert RTF (Rich Text Format) documents to PDF.',
      },
      {
        href: '/' + 'word-to-pdf.html',
        name: 'Word to PDF',
        icon: 'ph-microsoft-word-logo',
        subtitle: 'Convert Word documents (DOCX, DOC, ODT) to PDF.',
      },
      {
        href: '/' + 'excel-to-pdf.html',
        name: 'Excel to PDF',
        icon: 'ph-microsoft-excel-logo',
        subtitle: 'Convert Excel spreadsheets (XLSX, XLS, ODS) to PDF.',
      },
      {
        href: '/' + 'powerpoint-to-pdf.html',
        name: 'PowerPoint to PDF',
        icon: 'ph-microsoft-powerpoint-logo',
        subtitle: 'Convert PowerPoint presentations (PPTX, PPT, ODP) to PDF.',
      },
      {
        href: '/' + 'xps-to-pdf.html',
        name: 'XPS to PDF',
        icon: 'ph-scan',
        subtitle: 'Convert XPS/OXPS documents to PDF.',
      },
      {
        href: '/' + 'mobi-to-pdf.html',
        name: 'MOBI to PDF',
        icon: 'ph-book-open-text',
        subtitle: 'Convert MOBI e-books to PDF.',
      },
      {
        href: '/' + 'epub-to-pdf.html',
        name: 'EPUB to PDF',
        icon: 'ph-book-open-text',
        subtitle: 'Convert EPUB e-books to PDF.',
      },
      {
        href: '/' + 'fb2-to-pdf.html',
        name: 'FB2 to PDF',
        icon: 'ph-book-bookmark',
        subtitle: 'Convert FictionBook (FB2) e-books to PDF.',
      },
      {
        href: '/' + 'cbz-to-pdf.html',
        name: 'CBZ to PDF',
        icon: 'ph-book-open',
        subtitle: 'Convert comic book archives (CBZ/CBR) to PDF.',
      },
      {
        href: '/' + 'wpd-to-pdf.html',
        name: 'WPD to PDF',
        icon: 'ph-file-text',
        subtitle: 'Convert WordPerfect documents (WPD) to PDF.',
      },
      {
        href: '/' + 'wps-to-pdf.html',
        name: 'WPS to PDF',
        icon: 'ph-file-text',
        subtitle: 'Convert WPS Office documents to PDF.',
      },
      {
        href: '/' + 'xml-to-pdf.html',
        name: 'XML to PDF',
        icon: 'ph-file-code',
        subtitle: 'Convert XML documents to PDF.',
      },
      {
        href: '/' + 'pages-to-pdf.html',
        name: 'Pages to PDF',
        icon: 'ph-file-text',
        subtitle: 'Convert Apple Pages documents to PDF.',
      },
      {
        href: '/' + 'odg-to-pdf.html',
        name: 'ODG to PDF',
        icon: 'ph-image',
        subtitle: 'Convert OpenDocument Graphics (ODG) to PDF.',
      },
      {
        href: '/' + 'ods-to-pdf.html',
        name: 'ODS to PDF',
        icon: 'ph-table',
        subtitle: 'Convert OpenDocument Spreadsheet (ODS) to PDF.',
      },
      {
        href: '/' + 'odp-to-pdf.html',
        name: 'ODP to PDF',
        icon: 'ph-presentation',
        subtitle: 'Convert OpenDocument Presentation (ODP) to PDF.',
      },
      {
        href: '/' + 'pub-to-pdf.html',
        name: 'PUB to PDF',
        icon: 'ph-book-open',
        subtitle: 'Convert Microsoft Publisher (PUB) to PDF.',
      },
      {
        href: '/' + 'vsd-to-pdf.html',
        name: 'VSD to PDF',
        icon: 'ph-git-branch',
        subtitle: 'Convert Microsoft Visio (VSD, VSDX) to PDF.',
      },
      {
        href: '/' + 'psd-to-pdf.html',
        name: 'PSD to PDF',
        icon: 'ph-image',
        subtitle:
          'Convert Adobe Photoshop (PSD) files to PDF. Multiple files supported.',
      },
      {
        href: '/' + 'email-to-pdf.html',
        name: 'Email to PDF',
        icon: 'ph-envelope',
        subtitle: 'Convert email files (EML, MSG) to PDF format.',
      },
    ],
  },
  {
    name: 'Convert from PDF',
    tools: [
      {
        href: '/' + 'pdf-to-jpg.html',
        name: 'PDF to JPG',
        icon: 'ph-file-image',
        subtitle: 'Convert each PDF page into a JPG image.',
      },
      {
        href: '/' + 'pdf-to-png.html',
        name: 'PDF to PNG',
        icon: 'ph-file-image',
        subtitle: 'Convert each PDF page into a PNG image.',
      },
      {
        href: '/' + 'pdf-to-webp.html',
        name: 'PDF to WebP',
        icon: 'ph-file-image',
        subtitle: 'Convert each PDF page into a WebP image.',
      },
      {
        href: '/' + 'pdf-to-bmp.html',
        name: 'PDF to BMP',
        icon: 'ph-file-image',
        subtitle: 'Convert each PDF page into a BMP image.',
      },
      {
        href: '/' + 'pdf-to-tiff.html',
        name: 'PDF to TIFF',
        icon: 'ph-file-image',
        subtitle: 'Convert each PDF page into a TIFF image.',
      },
      {
        href: '/' + 'pdf-to-cbz.html',
        name: 'PDF to CBZ',
        icon: 'ph-book-open',
        subtitle:
          'Convert a PDF into a CBZ (Comic Book Archive) file for comic readers.',
      },
      {
        href: '/' + 'pdf-to-svg.html',
        name: 'PDF to SVG',
        icon: 'ph-file-code',
        subtitle: 'Convert each PDF page into a scalable vector graphic.',
      },
      {
        href: '/' + 'pdf-to-csv.html',
        name: 'PDF to CSV',
        icon: 'ph-file-csv',
        subtitle: 'Extract tables from PDF and convert to CSV format.',
      },
      {
        href: '/' + 'pdf-to-excel.html',
        name: 'PDF to Excel',
        icon: 'ph-microsoft-excel-logo',
        subtitle: 'Extract tables from PDF and convert to Excel (XLSX).',
      },
      {
        href: '/' + 'pdf-to-greyscale.html',
        name: 'PDF to Greyscale',
        icon: 'ph-palette',
        subtitle: 'Convert all colors to black and white.',
      },
      {
        href: '/' + 'pdf-to-json.html',
        name: 'PDF to JSON',
        icon: 'ph-file-code',
        subtitle: 'Convert PDF files to JSON format.',
      },
      {
        href: '/' + 'pdf-to-docx.html',
        name: 'PDF to Word',
        icon: 'ph-microsoft-word-logo',
        subtitle: 'Convert PDF files to editable Word documents.',
      },
      {
        href: '/' + 'extract-images.html',
        name: 'Extract Images',
        icon: 'ph-download-simple',
        subtitle: 'Extract all embedded images from your PDF files.',
      },
      {
        href: '/' + 'pdf-to-markdown.html',
        name: 'PDF to Markdown',
        icon: 'ph-markdown-logo',
        subtitle: 'Convert PDF text and tables to Markdown format.',
      },
      {
        href: '/' + 'prepare-pdf-for-ai.html',
        name: 'Prepare PDF for AI',
        icon: 'ph-sparkle',
        subtitle:
          'Extract PDF content as LlamaIndex JSON for RAG/LLM pipelines.',
      },
      {
        href: '/' + 'pdf-to-text.html',
        name: 'PDF to Text',
        icon: 'ph-text-aa',
        subtitle: 'Extract text from PDF files and save as plain text (.txt).',
      },
    ],
  },
  {
    name: 'Organize & Manage',
    tools: [
      {
        href: '/' + 'ocr-pdf.html',
        name: 'OCR PDF',
        icon: 'ph-barcode',
        subtitle: 'Make a PDF searchable and copyable.',
      },
      {
        href: '/' + 'merge-pdf.html',
        name: 'Merge PDF',
        icon: 'ph-browsers',
        subtitle: 'Combine multiple PDFs into one file.',
      },
      {
        href: '/' + 'alternate-merge.html',
        name: 'Alternate & Mix Pages',
        icon: 'ph-shuffle',
        subtitle:
          'Merge PDFs by alternating pages from each PDF. Preserves Bookmarks.',
      },
      {
        href: '/' + 'organize-pdf.html',
        name: 'Organize & Duplicate',
        icon: 'ph-files',
        subtitle: 'Duplicate, reorder, and delete pages.',
      },
      {
        href: '/' + 'overlay-pdf.html',
        name: 'PDF Overlay',
        icon: 'ph-stack-simple',
        subtitle: 'Overlay or underlay pages from one PDF onto another.',
      },
      {
        href: '/' + 'add-attachments.html',
        name: 'Add Attachments',
        icon: 'ph-paperclip',
        subtitle: 'Embed one or more files into your PDF.',
      },
      {
        href: '/' + 'extract-attachments.html',
        name: 'Extract Attachments',
        icon: 'ph-download',
        subtitle: 'Extract all embedded files from PDF(s) as a ZIP.',
      },
      {
        href: '/' + 'edit-attachments.html',
        name: 'Edit Attachments',
        icon: 'ph-paperclip-horizontal',
        subtitle: 'View or remove attachments in your PDF.',
      },
      {
        href: '/' + 'pdf-multi-tool.html',
        name: 'PDF Multi Tool',
        icon: 'ph-pencil-ruler',
        subtitle: 'Full-featured PDF editor with page management.',
      },
      {
        href: '/' + 'pdf-layers.html',
        name: 'PDF OCG',
        icon: 'ph-stack-simple',
        subtitle: 'View, toggle, add, and delete OCG layers in your PDF.',
      },
      {
        href: '/' + 'extract-tables.html',
        name: 'Extract Tables',
        icon: 'ph-table',
        subtitle: 'Extract tables from PDFs as CSV, JSON, or Markdown.',
      },
      {
        href: '/' + 'split-pdf.html',
        name: 'Split PDF',
        icon: 'ph-scissors',
        subtitle: 'Extract a range of pages into a new PDF.',
      },
      {
        href: '/' + 'divide-pages.html',
        name: 'Divide Pages',
        icon: 'ph-columns',
        subtitle: 'Divide pages horizontally or vertically.',
      },
      {
        href: '/' + 'extract-pages.html',
        name: 'Extract Pages',
        icon: 'ph-squares-four',
        subtitle: 'Save a selection of pages as new files.',
      },
      {
        href: '/' + 'delete-pages.html',
        name: 'Delete Pages',
        icon: 'ph-trash',
        subtitle: 'Remove specific pages from your document.',
      },
      {
        href: '/' + 'add-blank-page.html',
        name: 'Add Blank Page',
        icon: 'ph-file-plus',
        subtitle: 'Insert an empty page anywhere in your PDF.',
      },
      {
        href: '/' + 'reverse-pages.html',
        name: 'Reverse Pages',
        icon: 'ph-sort-descending',
        subtitle: 'Flip the order of all pages in your document.',
      },
      {
        href: '/' + 'rotate-pdf.html',
        name: 'Rotate PDF',
        icon: 'ph-arrow-clockwise',
        subtitle: 'Turn pages in 90-degree increments.',
      },
      {
        href: '/' + 'rotate-custom.html',
        name: 'Rotate by Custom Degrees',
        icon: 'ph-arrows-clockwise',
        subtitle: 'Rotate pages by any custom angle.',
      },
      {
        href: '/' + 'n-up-pdf.html',
        name: 'N-Up PDF',
        icon: 'ph-squares-four',
        subtitle: 'Arrange multiple pages onto a single sheet.',
      },
      {
        href: '/' + 'pdf-booklet.html',
        name: 'PDF Booklet',
        icon: 'ph-book-open',
        subtitle: 'Rearrange pages for double-sided booklet printing.',
      },
      {
        href: '/' + 'combine-single-page.html',
        name: 'Combine to Single Page',
        icon: 'ph-arrows-out-line-vertical',
        subtitle: 'Stitch all pages into one continuous scroll.',
      },
      {
        href: '/' + 'view-metadata.html',
        name: 'View Metadata',
        icon: 'ph-info',
        subtitle: 'Inspect the hidden properties of your PDF.',
      },
      {
        href: '/' + 'edit-metadata.html',
        name: 'Edit Metadata',
        icon: 'ph-file-code',
        subtitle: 'Change the author, title, and other properties.',
      },
      {
        href: '/' + 'pdf-to-zip.html',
        name: 'PDFs to ZIP',
        icon: 'ph-file-zip',
        subtitle: 'Package multiple PDF files into a ZIP archive.',
      },
      {
        href: '/' + 'compare-pdfs.html',
        name: 'Compare PDFs',
        icon: 'ph-git-diff',
        subtitle: 'Compare two PDFs side by side.',
      },
      {
        href: '/' + 'posterize-pdf.html',
        name: 'Posterize PDF',
        icon: 'ph-notepad',
        subtitle: 'Split a large page into multiple smaller pages.',
      },
    ],
  },
  {
    name: 'Optimize & Repair',
    tools: [
      {
        href: '/' + 'compress-pdf.html',
        name: 'Compress PDF',
        icon: 'ph-lightning',
        subtitle: 'Reduce the file size of your PDF.',
      },
      {
        href: '/' + 'pdf-to-pdfa.html',
        name: 'PDF to PDF/A',
        icon: 'ph-archive',
        subtitle: 'Convert PDF to PDF/A for long-term archiving.',
      },
      {
        href: '/' + 'fix-page-size.html',
        name: 'Fix Page Size',
        icon: 'ph-ruler',
        subtitle: 'Standardize all pages to a uniform size.',
      },
      {
        href: '/' + 'linearize-pdf.html',
        name: 'Linearize PDF',
        icon: 'ph-gauge',
        subtitle: 'Optimize PDF for fast web viewing.',
      },
      {
        href: '/' + 'page-dimensions.html',
        name: 'Page Dimensions',
        icon: 'ph-ruler',
        subtitle: 'Analyze page size, orientation, and units.',
      },
      {
        href: '/' + 'remove-restrictions.html',
        name: 'Remove Restrictions',
        icon: 'ph-link-break',
        subtitle:
          'Remove password protection and security restrictions associated with digitally signed PDF files.',
      },
      {
        href: '/' + 'repair-pdf.html',
        name: 'Repair PDF',
        icon: 'ph-wrench',
        subtitle: 'Recover data from corrupted or damaged PDF files.',
      },
      {
        href: '/' + 'rasterize-pdf.html',
        name: 'Rasterize PDF',
        icon: 'ph-image',
        subtitle:
          'Convert PDF to image-based PDF. Flatten layers and remove selectable text.',
      },
      {
        href: '/' + 'deskew-pdf.html',
        name: 'Deskew PDF',
        icon: 'ph-perspective',
        subtitle: 'Automatically straighten tilted scanned pages using OpenCV.',
      },
      {
        href: '/' + 'font-to-outline.html',
        name: 'Font to Outline',
        icon: 'ph-text-outdent',
        subtitle:
          'Convert all fonts to vector outlines for consistent rendering.',
      },
    ],
  },
  {
    name: 'Secure PDF',
    tools: [
      {
        href: '/' + 'encrypt-pdf.html',
        name: 'Encrypt PDF',
        icon: 'ph-lock',
        subtitle: 'Lock your PDF by adding a password.',
      },
      {
        href: '/' + 'sanitize-pdf.html',
        name: 'Sanitize PDF',
        icon: 'ph-broom',
        subtitle: 'Remove metadata, annotations, scripts, and more.',
      },
      {
        href: '/' + 'decrypt-pdf.html',
        name: 'Decrypt PDF',
        icon: 'ph-lock-open',
        subtitle: 'Unlock PDF by removing password protection.',
      },
      {
        href: '/' + 'flatten-pdf.html',
        name: 'Flatten PDF',
        icon: 'ph-stack',
        subtitle: 'Make form fields and annotations non-editable.',
      },
      {
        href: '/' + 'remove-metadata.html',
        name: 'Remove Metadata',
        icon: 'ph-file-x',
        subtitle: 'Strip hidden data from your PDF.',
      },
      {
        href: '/' + 'change-permissions.html',
        name: 'Change Permissions',
        icon: 'ph-shield-check',
        subtitle: 'Set or change user permissions on a PDF.',
      },
      {
        href: '/' + 'digital-sign-pdf.html',
        name: 'Digital Signature',
        icon: 'ph-certificate',
        subtitle:
          'Add a cryptographic digital signature using X.509 certificates.',
      },
      {
        href: '/' + 'validate-signature-pdf.html',
        name: 'Validate Signature',
        icon: 'ph-seal-check',
        subtitle: 'Verify digital signatures and view certificate details.',
      },
      {
        href: '/' + 'timestamp-pdf.html',
        name: 'Timestamp PDF',
        icon: 'ph-clock',
        subtitle:
          'Add an RFC 3161 document timestamp using a trusted TSA server.',
      },
    ],
  },
];

const getToolIdFromHref = (href: string): string => {
  const match = href.match(/\/([^/]+)\.html$/);
  return match?.[1] ?? href;
};

export const categories = baseCategories.map((category) => ({
  ...category,
  tools: category.tools.map((tool) => ({
    ...tool,
    id: getToolIdFromHref(tool.href),
  })),
}));
