# SEO Pilot Batch v2 — Structured Content

> **Format:** Each tool below maps to a `ToolSeo` object with `sections: SeoSection[]`.
> - `##` = `<h2>` section heading (rendered by `SeoContent.tsx`)
> - Numbered lists = `<ol>` via `{type: "list", items}` content blocks
> - `###` = `<h3>` via `subHeading` field (FAQ questions)
> - `<p>` = `{type: "paragraph", text}` content blocks
>
> **Reviewed against:** actual dispatcher cases and custom components in the codebase.

---

## 1. merge

### What is Merge PDF?

Merge PDF combines multiple PDF files into a single document, preserving the page order you specify. Whether you are assembling a contract package from separate signed pages, bundling chapter exports into one report, or collecting scattered scanned receipts into a single file, the tool produces one self-contained PDF that opens in any reader.

The merge happens entirely in your browser using pdf-lib — a PDF engine compiled to run client-side. No files are uploaded to a server, no copies are stored remotely, and the operation completes in seconds regardless of file count. The output carries over bookmarks, form fields, and embedded fonts from every source document, so a merged contract package keeps its internal navigation intact.

### How to Use Merge PDF

1. Drop multiple PDF files onto the upload zone, or click to browse and select them. You can add files at any point before running the merge — there is no fixed limit on how many you include.
2. Arrange the file list by dragging rows up or down. The order of this list is exactly the order pages will appear in the final document: first file's pages come first, last file's pages come last.
3. Click **Merge PDFs**. The tool reads each source document in sequence, copies its pages into a fresh PDF, and writes the combined result.
4. A download button appears with your file, automatically named `merged.pdf`. Click **Process Another** to clear the workspace and start a new merge without reloading the page.

### Why Use Merge PDF?

Legal and administrative workflows are the most common trigger. A closing package, visa application, or grant submission often requires a cover letter, supporting evidence, and signed forms to travel as one attachment. Merging assembles that packet in the right order so the recipient receives a single file instead of a zip archive to unpack.

Students and researchers face the same need when combining lecture notes, article chapters, and annotations into one study document. Designers and administrative teams use it for portfolio compilations and monthly report packs, where dozens of separate exports become one shareable deliverable.

### Privacy & Security

Your files never leave your browser. Every step — reading, merging, and writing the output — happens on your own device using a PDF engine compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential documents like contracts, medical records, or financial statements, this means the tool is suitable for material you would not trust to an upload service.

### Frequently Asked Questions

#### What happens to bookmarks and form fields during a merge?

Bookmarks, form field definitions, and embedded fonts are carried over from each source document. The merged file preserves the internal structure of every input, so interactive forms and navigation bookmarks remain functional in the output.

#### Is there a limit on how many files I can merge?

There is no hard file count limit imposed by the tool. Performance depends on your device's memory and browser, but typical merges of 20–50 files complete without issue. For very large merges (hundreds of files), splitting into batches may be more practical.

#### What if one of my source PDFs is password-protected?

A password-protected PDF may not load correctly during the merge. If a source file requires a password to open, use the Protect/Unlock tools to remove the password first, then include it in the merge.

#### Does the output preserve page orientation and size?

Yes. Each page retains its original dimensions, orientation, and content exactly as it appeared in the source file. If your sources mix portrait and landscape pages, the merged document will contain both orientations without modification.

---

## 2. clone-pages

### What is Clone Pages?

Clone Pages duplicates specific pages from a PDF and appends the copies to the end of the same document. Instead of extracting pages into a separate file, it keeps everything in one document — useful when you need repeated pages like a cover sheet, a signature page, or a frequently referenced appendix appearing multiple times in the same PDF.

The tool operates on a single PDF file. You specify which pages to clone using comma-separated page numbers (1-based, e.g. `1,3,5`), and how many copies of each to create (default is 2). The cloned pages are appended to the document after the last original page, preserving all content, formatting, and embedded resources.

### How to Use Clone Pages

1. Drop a PDF file onto the upload zone, or click to browse and select it.
2. In the **Pages** field, enter the page numbers you want to clone as a comma-separated list (e.g. `1,3,5`). These are 1-based numbers — page 1 is the first page.
3. In the **Copies** field, enter how many duplicates of each specified page to create. The default is 2, meaning each listed page will appear twice in the output.
4. Click **Clone Pages**. The tool reads your PDF, duplicates the specified pages the requested number of times, and appends them to the end of the document.
5. A download button appears with your file, named `cloned.pdf`.

### Why Use Clone Pages?

Forms and applications frequently require multiple copies of the same page — think W-2 copies for tax filings, multiple signed signature pages for a contract, or duplicate copies of an ID scan for an identity verification process. Rather than manually duplicating pages in an editor, Clone Pages appends them in one step.

Administrative teams also use this when assembling packets that need repeated reference pages. A compliance checklist that should appear after every section, or a terms-and-conditions page that must precede each signed document, can be cloned into the right positions without re-exporting from the source application.

### Privacy & Security

Your files never leave your browser. Every step — reading, cloning, and writing the output — happens on your own device using a PDF engine compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.

### Frequently Asked Questions

#### What happens if I enter a page number that doesn't exist in the PDF?

The tool silently skips invalid page numbers. If you specify page 10 in a 5-page document, that number is ignored and the remaining valid pages are cloned normally. No error is thrown.

#### Can I clone multiple different pages a different number of times?

Not in a single operation. The Copies field applies uniformly to every page number you list. If you need page 1 cloned twice and page 3 cloned five times, run the tool twice — once for each set.

#### Do cloned pages appear at the end of the document or next to the original?

Cloned pages are always appended after the last original page. They do not appear adjacent to the source page. If you need a specific arrangement, use the Merge tool to combine the original and cloned documents in your desired order.

#### Does cloning preserve form fields and bookmarks?

Yes. Cloned pages carry their full content — text, images, form fields, and annotations — into the output. The duplicated pages are byte-for-byte copies of the originals.

---

## 3. extract-images

### What is Extract Images?

Extract Images pulls every embedded image out of a PDF file and packages them into a downloadable zip archive. It scans every page's rendering operator list to find image objects — including photographs, diagrams, charts, and scanned elements — and converts each one to a PNG file.

The tool uses pdf.js to analyze the PDF's internal operator stream, identifying `paintImageXObject` and `paintInlineImageXObject` operations. Each discovered image is extracted as raw pixel data, converted to PNG format, and added to a zip file with a naming convention of `page-{N}-img-{N}.png` so you can trace every image back to its source page.

### How to Use Extract Images

1. Drop a PDF file onto the upload zone, or click to browse and select it.
2. Click **Extract Images**. The tool scans every page of the document for embedded image objects.
3. A progress indicator shows the extraction status as pages are processed.
4. When complete, a download button appears with your zip file, named `extracted-images.zip`.
5. Extract the zip to access individual PNG files, each named by its source page and image sequence number (e.g. `page-1-img-1.png`, `page-3-img-2.png`).

### Why Use Extract Images?

Designers and content creators regularly need to pull specific images out of PDF documents — product photos from a catalog, figures from a research paper, or illustrations from a style guide — without having access to the original source files. Extract Images makes this possible directly from the PDF, preserving each image at its original resolution.

Legal and compliance teams use it to collect exhibits, diagrams, or photographic evidence embedded in filings. Educators extract charts and illustrations from published papers for use in lectures and presentations. In each case, the tool eliminates the need for a desktop PDF editor or a screenshot-and-crop workaround.

### Privacy & Security

Your files never leave your browser. Every step — reading the PDF, analyzing operator lists, converting images to PNG, and packaging the zip — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.

### Frequently Asked Questions

#### What image format are the extracted files in?

All extracted images are converted to PNG. This preserves the original pixel data without compression loss, ensuring the output quality matches what is embedded in the PDF. The zip file contains only PNG files.

#### Can I extract images from specific pages only?

Currently, Extract Images processes every page in the document. There is no page-range filter. If you only need images from certain pages, you can extract from the full document and then delete the unneeded files from the zip.

#### Why are some images missing from the output?

Some PDFs embed images as vector graphics or use patterns that don't appear as discrete image objects in the operator list. In those cases, the tool may not detect them. Scanned pages saved as photographs are reliably extracted; vector illustrations composed from drawing commands may not be.

#### What is the naming convention for extracted files?

Files are named `page-{pageNumber}-img-{imageSequence}.png`. For example, the third image found on page 2 would be `page-2-img-3.png`. This makes it straightforward to identify where each image originated in the source document.

---

## 4. protect

### What is Protect PDF?

Protect PDF adds password encryption to a PDF file, restricting who can open, view, or modify the document. It supports two distinct password types: a **user password** that controls who can open the file, and an **owner password** that controls what permissions are granted (such as printing, copying, or editing) to users who can already open it.

The tool uses pdf-lib's built-in encryption to apply AES-256 encryption to the document. The output is a standard encrypted PDF that opens in any compliant reader when the correct password is provided. If the source file is already encrypted, the tool will attempt to load it with the `ignoreEncryption` flag — if the file requires a password to open, you will need to unlock it first using the Unlock PDF tool.

### How to Use Protect PDF

1. Drop a PDF file onto the upload zone, or click to browse and select it.
2. Enter a **User Password** — this is the password required to open the document. If set, anyone who opens the file must enter this password.
3. Optionally enter an **Owner Password** — this controls permissions for users who can open the file. If left blank, it defaults to the user password, or to a system default if no user password is set.
4. Configure **Permissions** — these settings control what users who can open the file are allowed to do (e.g. whether they can print, copy text, or modify the document).
5. Click **Protect PDF**. The tool encrypts the document and produces a new file.
6. A download button appears with your file, named `protected.pdf`.

### Why Use Protect PDF?

Confidential documents circulating by email or shared drives benefit from password protection. A contract draft sent to opposing counsel, a financial statement shared with an accountant, or a medical record forwarded between providers all warrant access controls that travel with the file itself.

Owner passwords serve a different purpose: they let you share a document openly while preventing recipients from modifying, copying, or printing it without authorization. This is common for published reports, templates, and official forms where the content should be readable but not editable.

### Privacy & Security

Your files never leave your browser. Every step — reading the PDF, applying encryption, and writing the output — happens on your own device. The encryption is applied locally using pdf-lib's encryption implementation. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. The password you enter never leaves your browser.

### Frequently Asked Questions

#### What encryption standard does Protect PDF use?

The tool uses pdf-lib's encryption, which applies AES-256 encryption to the document. This is the current industry standard for PDF encryption and is supported by all modern PDF readers.

#### Can I protect a PDF that is already encrypted?

The tool attempts to load already-encrypted files, but if the file requires a password to open and you don't provide it, the operation will fail. In that case, use the Unlock PDF tool first to remove the existing encryption, then apply your new protection settings.

#### What is the difference between user and owner passwords?

A user password controls who can open the file — without it, the PDF cannot be viewed at all. An owner password controls what actions are permitted once the file is open (printing, copying, editing). A file with only an owner password opens freely but restricts certain operations.

#### Does protection affect the file size or quality?

Encryption adds minimal overhead to the file size — typically a few kilobytes. The document content, images, and text are not re-encoded or compressed differently; only the encryption layer is added. Opening the protected file in a reader with the correct password restores full access to the original content.

---

## 5. redact

### What is Redact PDF?

Redact PDF lets you draw black boxes over sensitive content in a PDF and download the redacted version. It renders each page as a visible canvas where you click-and-drag to mark areas for redaction — names, addresses, account numbers, signatures, or any content you want obscured.

The tool uses pdf.js for page rendering and pdf-lib for applying the redactions. Each drawn rectangle is converted to PDF coordinates and drawn as a solid black fill over the original content. The result is a new PDF with black boxes covering every area you marked, preserving the rest of the document unchanged.

**Important honesty note:** This tool draws opaque black rectangles over your marked areas. It does not strip the underlying content from the PDF's internal content streams — the original text and images remain embedded in the file structure. For visual redaction (what the document looks like when opened), the result is effective. For secure redaction (where the underlying data must be truly removed), a specialized redaction engine is required, which is beyond this tool's current capability.

### How to Use Redact PDF

1. Drop a PDF file onto the upload zone, or click to browse and select it.
2. The first page renders as a visible canvas. Use **Prev** and **Next** buttons to navigate between pages.
3. Click and drag on the canvas to draw a redaction rectangle over the content you want to obscure. A semi-transparent preview appears as you draw, and the rectangle turns solid black when you release the mouse.
4. To remove the most recent redaction on the current page, click **Undo on Page**. This only removes the last rectangle drawn on the page you are viewing.
5. Navigate to other pages and draw additional redactions as needed. The tool tracks redactions across all pages — the status bar shows the total count.
6. Click **Apply & Download**. The tool processes every marked area, draws black rectangles over them, and saves the result as `{filename}-redacted.pdf`.

### Why Use Redact PDF?

Legal teams redact personally identifiable information (PII) from court filings before public disclosure — Social Security numbers, home addresses, and minor children's names are common targets. HR departments redact salary figures from shared documents. Journalists redact sources' names from leaked documents before publication.

Any time a document needs to be shared but contains information that should not be visible to the recipient, redaction is the tool. The click-and-drag interface makes it possible to mark precise areas without needing to know the exact coordinates or page layout.

### Privacy & Security

Your files never leave your browser. Every step — rendering pages, tracking redaction rectangles, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.

### Frequently Asked Questions

#### Is the redacted content actually removed from the file?

No — and this is important to understand. This tool draws opaque black rectangles over your marked areas, which visually obscures the content. However, the underlying text and image data remain embedded in the PDF's internal structure. A technically skilled user with a PDF editor could potentially recover the original content. For true content removal, a specialized redaction engine (like those in Adobe Acrobat or government-grade tools) is required. Use this tool when visual redaction is sufficient for your threat model.

#### Can I redact across multiple pages?

Yes. The tool renders one page at a time with Prev/Next navigation. Redactions are tracked per page, and the total count is displayed in the status bar. When you click Apply & Download, all redactions across all pages are applied in a single pass.

#### What if I make a mistake?

Use the **Undo on Page** button to remove the most recent redaction on the currently visible page. There is no "undo all" — if you need to clear every redaction, start over by clicking **Start Over**. Because the tool runs locally, there is no cost to restarting.

#### Does the redacted PDF look the same as the original?

Yes, except for the black boxes over the areas you marked. All other content — text, images, page layout, and formatting — is preserved exactly as it appeared in the original file. The file size may increase slightly due to the added rectangle objects.
