/* Template: pdf-to-text — Convert from PDF batch */

const seoPdfToText: ToolSeo = {
  sections: [
    { heading: "What is PDF Text Extractor?", content: [
      { type: "paragraph", text: `PDF Text Extractor pulls all readable text from a PDF file and saves it as a plain text file. The tool uses pdf.js to analyze each page's text content stream, extracts every text item (characters, words, lines), and concatenates them into a single continuous text output.` },
      { type: "paragraph", text: `The extraction preserves the reading order of text on each page and inserts page breaks between pages (marked with "--- Page N ---" separators). This makes the output easy to navigate while maintaining the document's logical flow.` },
      { type: "paragraph", text: `The result is a standard UTF-8 encoded text file that opens in any text editor, word processor, or search tool. It's ideal for searching content, copying text for reuse, or converting a PDF into an editable format.` },
    ]},
    { heading: "How to Use PDF Text Extractor", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count or file size.`,
        `Click <strong>Extract Text</strong>. The tool loads the PDF using pdf.js, iterates through every page, extracts the text content stream for each page, and concatenates the results with page separators.`,
        `A progress indicator shows the extraction status as pages are processed. Text extraction is faster than image-based tools since it reads the underlying text data directly.`,
        `A download button appears with your file, named <code>extracted.txt</code>. The file is UTF-8 encoded and opens in any text editor.`,
      ]},
    ]},
    { heading: "Why Use PDF Text Extractor?", content: [
      { type: "paragraph", text: `PDFs are great for preserving visual layout but terrible for searching, copying, or editing text. Extracting the text makes it possible to search for specific terms across the document, copy passages for reuse in other documents, or feed the content into analysis tools.` },
      { type: "paragraph", text: `Researchers and analysts use text extraction to pull data from published papers, reports, and filings into spreadsheets or databases. Rather than manually retyping content, the tool extracts it in seconds with full fidelity to the original text.` },
      { type: "paragraph", text: `Legal and compliance teams extract text from contracts, filings, and regulatory documents to build searchable archives. Having plain text versions of PDF documents makes full-text search possible across large document collections.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Does text extraction preserve formatting?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the PDF, extracting text, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Does text extraction preserve formatting?", content: [
      { type: "paragraph", text: `No. The output is plain text — no bold, italics, fonts, colors, or layout. The text is extracted in reading order with page separators. For formatted output, consider the PDF to HTML or PDF to Word tools instead.` },
    ]},
    { heading: "", subHeading: "Will it extract text from scanned PDFs?", content: [
      { type: "paragraph", text: `Not reliably. Scanned PDFs contain images of text, not actual text data. The tool reads the text content stream, which is empty for scanned pages. For scanned documents, use the OCR tool to recognize text first, then extract.` },
    ]},
    { heading: "", subHeading: "How are pages separated in the output?", content: [
      { type: "paragraph", text: `Each page's text is preceded by a "--- Page N ---" header. This makes it easy to identify which text came from which page and to navigate the output in a text editor.` },
    ]},
    { heading: "", subHeading: "Can I extract text from specific pages only?", content: [
      { type: "paragraph", text: `Not directly — the tool extracts all pages. To get text from specific pages, first extract those pages using the Extract Pages tool, then run text extraction on the smaller document.` },
    ]},
    { heading: "", subHeading: "Why does some text appear out of order?", content: [
      { type: "paragraph", text: `PDF text extraction follows the order items appear in the content stream, which may not match the visual reading order in complex layouts (multi-column pages, text boxes, overlays). For most single-column documents, the reading order is preserved correctly.` },
    ]},
    { heading: "", subHeading: "How large can the output file be?", content: [
      { type: "paragraph", text: `The output size depends on the text content of the PDF. A 100-page text-heavy document might produce a 200-500KB text file. Scanned PDFs with no embedded text data produce nearly empty output files.` },
    ]},
  ],
};
