const fs = require('fs');
const file = 'src/domains/pdf/registry/tool-seo.ts';
let content = fs.readFileSync(file, 'utf-8');

// Expansion content for each tool: additional FAQ entries + expanded "Why Use" paragraphs
const expansions = {
  'seoPdfToBmp': {
    faq: `    { heading: "", subHeading: "When would I choose BMP over PNG or TIFF?", content: [
      { type: "paragraph", text: \`BMP makes sense when you need raw, uncompressed pixel data for image processing pipelines or scientific analysis where compression artifacts would interfere. For most general-purpose document archiving, PNG or TIFF are more practical choices due to their smaller file sizes.\` },
    ]},
    { heading: "", subHeading: "Can I convert only specific pages to BMP?", content: [
      { type: "paragraph", text: \`Currently the tool converts every page. If you need specific pages, first use the Extract Pages tool to pull out the pages you want, then run BMP conversion on the smaller document.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Image processing pipelines that need raw, uncompressed input — such as OCR preprocessing, template matching, or pixel-level analysis — benefit from BMP's zero-compression guarantee. The tool renders each page at 2x resolution, producing images with enough detail for downstream processing without re-rendering.\` },`,
  },
  'seoPdfToCbz': {
    faq: `    { heading: "", subHeading: "Can I choose JPEG instead of PNG for the images?", content: [
      { type: "paragraph", text: \`Currently the tool uses PNG format exclusively. PNG preserves line art and flat colors without JPEG compression artifacts, which is ideal for comic and manga pages. If you need JPEG, convert the PNGs separately after extraction.\` },
    ]},
    { heading: "", subHeading: "How do I read the CBZ file?", content: [
      { type: "paragraph", text: \`Any comic reader application supports CBZ files — CDisplayEx, ComicRack, YACReader, and MComix are popular options. You can also rename .cbz to .zip and extract the images manually with any archive tool.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Digital comic collections and manga libraries are almost universally distributed as CBZ or CBR files. Converting PDF scans to CBZ format integrates them into existing comic reader workflows, preserving page order and enabling native page-by-page navigation instead of scrolling through a PDF.\` },`,
  },
  'seoPdfToEpub': {
    faq: `    { heading: "", subHeading: "How does the text reflow in the EPUB?", content: [
      { type: "paragraph", text: \`Each page's text becomes a chapter-like section in the EPUB. The text reflows to fit the reader's screen size and font settings — that's the fundamental advantage over PDF, where text is locked to fixed page dimensions.\` },
    ]},
    { heading: "", subHeading: "Can I add a cover image to the EPUB?", content: [
      { type: "paragraph", text: \`Currently the tool generates a text-only EPUB without cover images. For a polished ebook, you can open the EPUB in Sigil or Calibre and add a cover image manually after conversion.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`E-readers like Kindle, Kobo, and Nook display EPUBs with reflowable text that adapts to screen size, font preferences, and reading modes. PDFs on e-readers typically require constant zooming and panning. Converting to EPUB makes long documents comfortable to read on small screens.\` },`,
  },
  'seoPdfToHtml': {
    faq: `    { heading: "", subHeading: "Can I preserve images in the HTML output?", content: [
      { type: "paragraph", text: \`Currently the tool extracts text only. Images, charts, and graphical elements are not included in the HTML. For image-rich documents, consider keeping the original PDF alongside the HTML text version.\` },
    ]},
    { heading: "", subHeading: "Is the HTML responsive?", content: [
      { type: "paragraph", text: \`The output is a basic HTML file without responsive CSS. For a responsive layout, open the HTML in a code editor and add a viewport meta tag and basic responsive styles, or import it into a CMS that handles layout automatically.\` },
    ]},
    { heading: "", subHeading: "How does this differ from PDF to Markdown?", content: [
      { type: "paragraph", text: \`HTML is a display format (rendered by browsers); Markdown is a lightweight markup format (rendered by Markdown processors). HTML gives you more control over presentation; Markdown is simpler to write and edit by hand.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Web content management systems, email newsletters, and documentation platforms all accept HTML natively. Converting PDF articles to HTML makes them embeddable in websites, searchable by search engines, and accessible to screen readers without copy-paste formatting issues.\` },`,
  },
  'seoPdfToImage': {
    faq: `    { heading: "", subHeading: "What image format should I choose?", content: [
      { type: "paragraph", text: \`JPG for smallest file size and universal compatibility. PNG for lossless quality and transparency support. WebP for the best compression-to-quality ratio (supported by all modern browsers). BMP for raw uncompressed pixels.\` },
    ]},
    { heading: "", subHeading: "Can I convert specific pages only?", content: [
      { type: "paragraph", text: \`The tool converts all pages. To get specific pages, use the Extract Pages tool first to create a smaller PDF, then convert that to images.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Document sharing platforms, social media, and messaging apps handle images but not PDFs reliably. Converting PDF pages to images enables inline previews in email, presentations, and social posts where PDF rendering is inconsistent or unsupported.\` },`,
  },
  'seoPdfToMarkdown': {
    faq: `    { heading: "", subHeading: "How does this differ from PDF to HTML?", content: [
      { type: "paragraph", text: \`Markdown is a lightweight markup language designed for readability in plain text. HTML is a display format with richer formatting options. Markdown is preferred for README files, documentation, and note-taking apps; HTML is better for web publishing.\` },
    ]},
    { heading: "", subHeading: "Can I extract images along with the Markdown?", content: [
      { type: "paragraph", text: \`Currently the tool extracts text only. Images, tables, and diagrams are not included. For image-rich content, keep the original PDF alongside the Markdown text.\` },
    ]},
    { heading: "", subHeading: "What Markdown dialect is used?", content: [
      { type: "paragraph", text: \`The output uses standard Markdown syntax compatible with GitHub Flavored Markdown, Pandoc, and most Markdown processors. No proprietary extensions or non-standard formatting is used.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Documentation sites, technical blogs, and note-taking applications (Obsidian, Notion, Logseq) all support Markdown natively. Converting PDF research papers or technical documents to Markdown makes them editable, version-controllable with Git, and linkable in knowledge bases.\` },`,
  },
  'seoPdfToOdt': {
    faq: `    { heading: "", subHeading: "What formatting is preserved in the ODT?", content: [
      { type: "paragraph", text: \`Text content, reading order, and basic paragraph structure are preserved. Visual formatting (fonts, colors, precise positioning) may not transfer exactly, as ODT and PDF use fundamentally different layout models.\` },
    ]},
    { heading: "", subHeading: "Can I open ODT in Google Docs?", content: [
      { type: "paragraph", text: \`Yes. Google Docs imports ODT files directly. You can also upload the ODT to Google Drive and it will be converted to Google Docs format automatically for collaborative editing.\` },
    ]},
    { heading: "", subHeading: "Why would I choose ODT over DOCX?", content: [
      { type: "paragraph", text: \`ODT is an open standard maintained by OASIS. It works natively in LibreOffice, OpenOffice, and Google Docs. If you don't use Microsoft Word, ODT avoids vendor lock-in while remaining fully editable.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Linux and open-source office suites work natively with ODT files. Organizations committed to open standards — government agencies, academic institutions, and non-profits — often require ODT for document interoperability without Microsoft Office licensing.\` },`,
  },
  'seoPdfToPng': {
    faq: `    { heading: "", subHeading: "When should I choose PNG over JPEG?", content: [
      { type: "paragraph", text: \`PNG preserves every pixel exactly — no compression artifacts. This matters for documents with sharp text, line art, or transparent backgrounds. JPEG is better for photographic content where slight compression is acceptable.\` },
    ]},
    { heading: "", subHeading: "Can I set a custom resolution?", content: [
      { type: "paragraph", text: \`The tool renders at a fixed 2x scale. For custom resolution, export as PNG and resize with an image editor, or use the PDF to Image tool which may offer more resolution options.\` },
    ]},
    { heading: "", subHeading: "Why are the files larger than JPEG?", content: [
      { type: "paragraph", text: \`PNG uses lossless compression — it stores complete pixel data rather than approximating it. A 100-page document might produce 500MB of PNGs versus 50MB of JPEGs. The tradeoff is pixel-perfect fidelity.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Print publishers, design workflows, and archival systems need lossless image quality. PNG's transparency support also makes it suitable for compositing PDF pages into design layouts where the background needs to show through.\` },`,
  },
  'seoPdfToPowerpoint': {
    faq: `    { heading: "", subHeading: "Can I edit the text on the slides?", content: [
      { type: "paragraph", text: \`The output contains raster images of each page, not editable text. To get editable text, use PDF to Word or PDF to Text instead, then build the presentation manually.\` },
    ]},
    { heading: "", subHeading: "Why not use a direct PDF-to-PPTX converter?", content: [
      { type: "paragraph", text: \`Direct converters often produce misaligned text boxes, broken layouts, and font substitution errors. Page-as-image guarantees the visual fidelity matches the original PDF exactly.\` },
    ]},
    { heading: "", subHeading: "How do I add the images to an existing presentation?", content: [
      { type: "paragraph", text: \`Extract the zip, then in PowerPoint use Insert → Pictures to add each image to a slide. Set the image as a slide background for best alignment, or place it as a foreground element with manual sizing.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Academic posters, conference presentations, and lecture slides often start as PDF documents. Converting each page to a slide image gives you a presentation-ready format while preserving every visual element exactly as designed.\` },`,
  },
  'seoPdfToRtf': {
    faq: `    { heading: "", subHeading: "What formatting is preserved in RTF?", content: [
      { type: "paragraph", text: \`Text content and reading order are preserved. RTF supports basic formatting (bold, italic, font sizes) so the output includes paragraph structure, but complex layouts (columns, tables, text boxes) may not transfer accurately.\` },
    ]},
    { heading: "", subHeading: "Why would I choose RTF over Word or ODT?", content: [
      { type: "paragraph", text: \`RTF is the most universally compatible document format. Every word processor since the 1990s — including very old versions of Word, WordPerfect, and even some email clients — can open RTF without import errors.\` },
    ]},
    { heading: "", subHeading: "Can I convert RTF to other formats later?", content: [
      { type: "paragraph", text: \`Yes. Any word processor can open RTF and save it as DOCX, PDF, HTML, or other formats. RTF acts as a reliable intermediate format for format conversion chains.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Legacy document systems, government filing platforms, and legal databases often require RTF because of its decades-long compatibility track record. When you need a document format that will open reliably on any system, RTF is the safest choice.\` },`,
  },
  'seoPdfToTiff': {
    faq: `    { heading: "", subHeading: "Why would I use TIFF instead of PNG?", content: [
      { type: "paragraph", text: \`TIFF is the standard format in print publishing, medical imaging, and archival scanning workflows. Many professional tools (Preps, Kodak Prinergy, Halibut) expect TIFF input. PNG is more common in web and software workflows.\` },
    ]},
    { heading: "", subHeading: "Can I combine pages into a multi-page TIFF?", content: [
      { type: "paragraph", text: \`The tool outputs individual TIFF files per page. To create a multi-page TIFF, use a tool like ImageMagick (\`convert *.tif output.tif\`) or a TIFF-capable image editor after downloading the zip.\` },
    ]},
    { heading: "", subHeading: "What DPI are the TIFF files?", content: [
      { type: "paragraph", text: \`The tool renders at 2x the PDF's nominal resolution. A standard 72 DPI PDF page produces a TIFF at approximately 144 DPI. For higher resolution, use a PDF editor to increase the render resolution before converting.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Prepress and print production workflows universally require TIFF files for color separation, trapping, and plate generation. Converting PDF proofs to TIFF enables quality inspection in print-specific tools that don't support PDF rendering.\` },`,
  },
  'seoPdfToWebp': {
    faq: `    { heading: "", subHeading: "Is WebP better than JPEG?", content: [
      { type: "paragraph", text: \`WebP at the same quality level produces smaller files than JPEG while preserving more detail in text and line art. For document pages with sharp edges, WebP at quality 80-90 looks noticeably better than JPEG at the same setting.\` },
    ]},
    { heading: "", subHeading: "Can I control the compression level?", content: [
      { type: "paragraph", text: \`The tool uses a fixed compression setting optimized for document content. For custom compression, export as WebP and adjust with an image processing library, or use the PNG export for lossless output.\` },
    ]},
    { heading: "", subHeading: "Will WebP images work in email?", content: [
      { type: "paragraph", text: \`Some email clients (notably older Outlook versions) don't render WebP inline. For email attachments or embedded images, JPEG or PNG are safer choices. WebP works well for web-based document viewers.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Web applications, CDN-hosted document previews, and thumbnail generators benefit from WebP's superior compression. A 100-page document converts to roughly 30% smaller files than JPEG with better text clarity — reducing bandwidth and improving load times for web-based document viewers.\` },`,
  },
  'seoPdfToWord': {
    faq: `    { heading: "", subHeading: "Will the Word file look exactly like the PDF?", content: [
      { type: "paragraph", text: \`No. The conversion extracts text content and reading order, not visual layout. Multi-column layouts, text boxes, and precise positioning may shift. The tool prioritizes content accuracy over visual fidelity.\` },
    ]},
    { heading: "", subHeading: "Why .doc instead of .docx?", content: [
      { type: "paragraph", text: \`The older .doc format has broader compatibility — it opens in Word 97 and later, as well as many alternative word processors. If you need .docx, open the .doc in Word and save as .docx.\` },
    ]},
    { heading: "", subHeading: "Can I convert a scanned PDF to Word?", content: [
      { type: "paragraph", text: \`Scanned PDFs contain images of text, not actual text data. This tool reads the text content stream, which is empty for scanned pages. For scanned documents, use the OCR tool first to recognize text, then extract.\` },
    ]},
    { heading: "", subHeading: "How does this differ from copy-pasting from a PDF?", content: [
      { type: "paragraph", text: \`Copy-pasting from PDFs often produces broken line breaks, missing characters, and reordered paragraphs. This tool reads the underlying text content stream directly, producing cleaner output that preserves paragraph structure and reading order.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Legal filings, academic submissions, and business reports often arrive as PDFs but need editing. Converting to Word enables tracked changes, comments, and collaborative editing — workflows that are impossible with locked PDF documents.\` },`,
  },
  'seoPdfToXml': {
    faq: `    { heading: "", subHeading: "Can I transform the XML with XSLT?", content: [
      { type: "paragraph", text: \`Yes. The well-formed XML can be transformed with XSLT to produce HTML, other XML formats, or plain text. The simple page/paragraph structure makes it easy to write XSLT templates for common transformations.\` },
    ]},
    { heading: "", subHeading: "How does this differ from PDF to JSON?", content: [
      { type: "paragraph", text: \`Both produce structured data from PDF text. XML uses angle-bracket tags; JSON uses key-value pairs. XML is preferred for document-centric workflows and XSLT processing; JSON is preferred for web APIs and JavaScript integration.\` },
    ]},
    { heading: "", subHeading: "Can I query the XML with XPath?", content: [
      { type: "paragraph", text: \`Yes. The page/paragraph structure is straightforward to query. For example, \`//page[3]/paragraph\` selects all paragraphs on page 3, and \`//paragraph[contains(text(), "contract")]\` finds paragraphs mentioning a specific term.\` },
    ]},
    { heading: "", subHeading: "What if the PDF has tables or images?", content: [
      { type: "paragraph", text: \`Tables and images are not extracted as structured data — only the text content is captured. Table text appears as paragraphs in reading order. For structured table extraction, a specialized tool would be needed.\` },
    ]},`,
    whyUse: `      { type: "paragraph", text: \`Data pipelines and document management systems often require structured input. XML's hierarchical format makes it easy to parse, query with XPath, and transform with XSLT — tasks that are difficult with raw text or PDF binary data.\` },
      { type: "paragraph", text: \`Legal and regulatory document processing systems frequently require XML input for automated analysis. Converting PDF filings to XML enables programmatic extraction of specific sections, clauses, or data points.\` },
      { type: "paragraph", text: \`Archival and digital preservation workflows use XML as a neutral format for long-term storage. PDFs may become obsolete; XML is a human-readable, self-describing format that remains parseable indefinitely.\` },`,
  },
};

for (const [toolName, exp] of Object.entries(expansions)) {
  // Find the tool's closing "Frequently Asked Questions" section and add FAQ before ]
  // Strategy: find the last FAQ entry in each tool and insert after it
  
  // Find the tool block
  const toolRegex = new RegExp(`(const ${toolName}: ToolSeo = \\{[\\s\\S]*?)\\n\\};`);
  const toolMatch = content.match(toolRegex);
  if (!toolMatch) {
    console.log(`SKIP ${toolName}: not found`);
    continue;
  }
  
  const toolBlock = toolMatch[1];
  
  // Find the sections array end - last "]}," before "\n  ],"
  const sectionsEnd = toolBlock.lastIndexOf('\n  ],');
  if (sectionsEnd < 0) {
    console.log(`SKIP ${toolName}: can't find sections end`);
    continue;
  }
  
  // Insert FAQ entries before the sections closing
  const newBlock = toolBlock.slice(0, sectionsEnd) + '\n' + exp.faq + '\n' + toolBlock.slice(sectionsEnd);
  
  // Also expand "Why Use" section - insert after last existing "Why Use" paragraph
  // Find "Why Use" section and its last paragraph
  const whyUseIdx = newBlock.indexOf('"Why Use');
  if (whyUseIdx >= 0 && exp.whyUse) {
    // Find the closing of the "Why Use" section's content array
    // Look for the next section heading after "Why Use"
    const afterWhyUse = newBlock.indexOf('\n    { heading:', whyUseIdx + 10);
    if (afterWhyUse >= 0) {
      // Insert before the next section
      const insertPoint = newBlock.lastIndexOf('\n    ]},', afterWhyUse);
      if (insertPoint >= 0) {
        const expanded = newBlock.slice(0, insertPoint) + '\n' + exp.whyUse + '\n' + newBlock.slice(insertPoint);
        content = content.replace(toolBlock, expanded);
        console.log(`✅ ${toolName}: expanded FAQ + Why Use`);
        continue;
      }
    }
  }
  
  // If Why Use expansion didn't work, just do FAQ
  content = content.replace(toolBlock, newBlock);
  console.log(`✅ ${toolName}: expanded FAQ only`);
}

fs.writeFileSync(file, content);
console.log('\nDone. Run verify-seo-structure.ts to check word counts.');
