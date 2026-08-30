/* SEO content for Organize PDF subcategory — 21 tools expanded to 1000-1500 words */

const seoAddMargin: ToolSeo = {
  sections: [
    { heading: "What is Add Margin?", content: [
      { type: "paragraph", text: `Add Margin increases the space around every page in a PDF, pushing the existing content inward to create a uniform border. The margin is applied in points (1 point = 1/72 inch), and every page in the document receives the same treatment — the page dimensions grow by twice the margin value on each axis.` },
      { type: "paragraph", text: `The tool uses pdf-lib to resize each page and translate its content stream by the margin offset. For example, a 20-point margin adds 20 points of space on all four sides, making a standard letter page (612 × 792 points) grow to 652 × 832 points. The original content is shifted inward by the margin amount, preserving its layout exactly.` },
      { type: "paragraph", text: `This is a metadata-level operation — the content itself is not re-rendered or re-encoded. Text, images, fonts, and annotations remain identical; only the page boundary moves outward. The result is a PDF where the original content sits centered within a larger canvas.` },
    ]},
    { heading: "How to Use Add Margin", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF, regardless of page count or size.`,
        `Enter a <strong>margin size</strong> in points. The default is 20 points (about 0.28 inches). Common values: 36 points = half an inch, 72 points = one inch, 144 points = two inches. The margin is applied equally to all four sides.`,
        `Click <strong>Add Margin</strong>. The tool loads every page, resizes it by adding the margin to both width and height, and translates the content stream inward by the margin offset. This happens sequentially for each page in the document.`,
        `A download button appears with your file, automatically named <code>margins-added.pdf</code>. The file size may increase slightly due to the larger page dimensions.`,
        `If you need asymmetric margins (different values for top/bottom vs left/right), process the document twice — first with one value, then the other won't work since it applies uniformly. For asymmetric needs, use the Crop Pages tool in reverse or a dedicated layout tool.`,
      ]},
    ]},
    { heading: "Why Use Add Margin?", content: [
      { type: "paragraph", text: `Print-ready documents often need extra margin for binding, hole punching, or stapling. If a PDF was created with tight margins that risk cutting off content at the edges — common with exported presentations, scanned documents, or auto-generated reports — adding margin is the fastest fix without re-exporting from the original application.` },
      { type: "paragraph", text: `Designers and presentation teams use it to create consistent white space around exported slides or mockups, giving documents a cleaner, more professional appearance when shared or printed. Academic papers submitted for review frequently require specific margin sizes (e.g. 1-inch all sides), and this tool adjusts any PDF to meet those requirements.` },
      { type: "paragraph", text: `Legal filings and formal submissions often have strict margin requirements. Rather than reformatting the source document, adding margin to the final PDF ensures compliance with court or institutional formatting rules.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Does adding margin change the content size?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, resizing pages, and writing the output — happens on your own device using a PDF engine compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential documents like contracts, medical records, or financial statements, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Does adding margin change the content size?", content: [
      { type: "paragraph", text: `No. The content itself is not scaled or resized — only its position on the page shifts inward by the margin amount. Text, images, and layout remain identical; the page simply gets larger around them. Font sizes, image resolution, and vector graphics are all preserved at their original quality.` },
    ]},
    { heading: "", subHeading: "Can I add different margins to different pages?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool applies the same margin value to every page. If you need different margins per page, split the document into sections, process each with its own margin value, and recombine using the Merge tool.` },
    ]},
    { heading: "", subHeading: "What unit is the margin measured in?", content: [
      { type: "paragraph", text: `Points. There are 72 points per inch, so a margin of 72 creates a one-inch border on each side. A margin of 36 creates a half-inch border. For reference: a standard US Letter page is 612 × 792 points (8.5 × 11 inches), and A4 is 595 × 842 points (210 × 297 mm).` },
    ]},
    { heading: "", subHeading: "Will the larger page size affect printing?", content: [
      { type: "paragraph", text: `The page dimensions change, so if you print on a fixed paper size, the printer may scale the content to fit. Most PDF readers offer a "fit to page" option that handles this automatically. If you need the content at a specific print size, consider adding margin before or after adjusting the page size.` },
    ]},
  ],
};
};

const seoAddPageLabels: ToolSeo = {
  sections: [
    { heading: "What is Add Page Labels?", content: [
      { type: "paragraph", text: `Add Page Labels lets you assign custom numbering schemes to sections of a PDF — for example, roman numerals for front matter (i, ii, iii), then arabic numerals starting at 1 for the main body. These labels appear in PDF readers' page navigation and in printed page numbers, giving your document professional, book-style numbering.` },
      { type: "paragraph", text: `The tool reads the current page structure and lets you define label prefixes, numbering styles (decimal, roman, letters), and starting values for each range. The labels are written into the PDF's page label dictionary without altering the visual content on any page.` },
      { type: "paragraph", text: `Page labels are metadata — they change how pages are identified in the reader's navigation panel, page count display, and print dialog. The actual content of each page remains completely untouched. A page labeled "iii" still contains the same content it always did; only its identifier changes.` },
    ]},
    { heading: "How to Use Add Page Labels", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool displays the total page count so you know the range you're working with.`,
        `Define your first label range by specifying a <strong>start page</strong> and <strong>end page</strong> (1-based). For example, pages 1-4 for front matter.`,
        `Choose a <strong>numbering style</strong> for that range: decimal (1, 2, 3), uppercase roman (I, II, III), lowercase roman (i, ii, iii), uppercase letters (A, B, C), or lowercase letters (a, b, c).`,
        `Set the <strong>starting number</strong> for the range — for example, start roman numerals at "i" (the default) or start the main body at page 1 even though it begins on physical page 5.`,
        `Optionally add a <strong>prefix</strong> — text that appears before the number, like "Chapter 1-" producing "Chapter 1-1", "Chapter 1-2", etc.`,
        `Add additional ranges for other sections of the document. Each range gets its own style, start value, and optional prefix.`,
        `Click <strong>Apply Labels</strong>. The tool writes the label dictionary into the PDF metadata.`,
        `A download button appears with your file, named <code>labeled.pdf</code>. Open it in any PDF reader to verify the labels appear in the navigation panel.`,
      ]},
    ]},
    { heading: "Why Use Add Page Labels?", content: [
      { type: "paragraph", text: `Books, reports, and academic papers routinely use different numbering for front matter and body content. Without page labels, a PDF reader shows a continuous count from 1, which doesn't match the printed page numbers. Adding labels makes the digital and physical numbering consistent — a reader navigating to "page iii" sees the same page as the printed "iii".` },
      { type: "paragraph", text: `Legal filings and formal submissions often require specific page numbering schemes. Courts may reference pages by their label rather than their physical position, making accurate labels essential for compliance. Rather than re-exporting from a word processor, you can fix the numbering on any existing PDF in seconds.` },
      { type: "paragraph", text: `Multi-part documents assembled from separate files benefit too. If you combine chapters exported individually, the page count resets at each join. Adding labels with a continuous sequence across the full document restores a consistent reference scheme.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Do page labels affect the actual page content?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the PDF, configuring labels, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Do page labels affect the actual page content?", content: [
      { type: "paragraph", text: `No. Page labels are metadata — they change how pages are numbered in the reader's navigation and in printed output, but the visual content of each page is completely untouched. A page labeled "v" contains exactly the same content it did before labeling.` },
    ]},
    { heading: "", subHeading: "Can I add labels to only some pages?", content: [
      { type: "paragraph", text: `Yes. You define ranges (start page to end page) and assign a numbering scheme to each. Pages outside any defined range keep their default decimal numbering. This lets you label just the front matter while leaving the body untouched, or vice versa.` },
    ]},
    { heading: "", subHeading: "Will the labels show when I print?", content: [
      { type: "paragraph", text: `If your PDF reader supports printing page labels, they will appear in the printed page numbers. Most modern readers (Acrobat, Preview, Edge) respect page labels in print output. The labels also appear in the reader's page count display and navigation panel.` },
    ]},
    { heading: "", subHeading: "What's the difference between page labels and page numbers drawn on the page?", content: [
      { type: "paragraph", text: `Page labels are metadata — they identify pages in the reader's interface but don't appear visually on the page itself. Drawn page numbers (from the Add Page Numbers tool) are visible text rendered on the page content. You can use both together: labels for navigation, drawn numbers for visible pagination.` },
    ]},
  ],
};
};

const seoAddPageNumbers: ToolSeo = {
  sections: [
    { heading: "What is Add Page Numbers?", content: [
      { type: "paragraph", text: `Add Page Numbers stamps a sequential number onto every page of a PDF at a position you choose — bottom-right, bottom-center, bottom-left, top-right, top-center, or top-left. You control the starting number, the format (decimal, roman numerals, or letters), and where the number appears on the page.` },
      { type: "paragraph", text: `The tool uses pdf-lib to draw the page number text at the specified coordinates on each page using the Helvetica font at 11pt size. The numbers are rendered as part of the page content stream, so they appear in both on-screen viewing and printed output. Each number is positioned with a 30-point pad from the page edge.` },
      { type: "paragraph", text: `The text color is a dark gray (RGB 0.3, 0.3, 0.3) rather than pure black, giving the numbers a subtle appearance that doesn't overpower the existing content. The font embedding ensures the numbers render consistently across all PDF readers.` },
    ]},
    { heading: "How to Use Add Page Numbers", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Choose a <strong>position</strong> for the page numbers. Options: bottom-right (default), bottom-center, bottom-left, top-right, top-center, or top-left. The position determines both the horizontal alignment and vertical placement — top positions place numbers 28 points from the top edge; bottom positions place them 18 points from the bottom.`,
        `Set the <strong>starting number</strong> — defaults to 1. Use this to continue numbering from a previous document (e.g. start at 51 if the first document ended at page 50) or to match printed page numbers in a multi-part document.`,
        `Select a <strong>format</strong>: decimal (1, 2, 3), uppercase roman (I, II, III), or lowercase roman (i, ii, iii). Roman numerals are conventional for front matter in academic and legal documents.`,
        `Click <strong>Add Page Numbers</strong>. The tool iterates through every page, calculates the position based on your settings, formats the number string, measures its width using the embedded Helvetica font, and draws it at the computed coordinates.`,
        `A download button appears with your file, named <code>numbered.pdf</code>. The numbers are permanently part of the page content — they cannot be accidentally removed or hidden by the reader.`,
      ]},
    ]},
    { heading: "Why Use Add Page Numbers?", content: [
      { type: "paragraph", text: `Documents intended for printing, review, or legal filing need page numbers so readers can reference specific locations. Many PDFs — especially those assembled from scans, exported without numbering, or created from multiple sources — lack them entirely.` },
      { type: "paragraph", text: `Concatenated documents benefit too: if you merge chapters exported separately, the page count resets at each join. Adding sequential numbers across the full document restores a consistent reference scheme that matches the physical page order.` },
      { type: "paragraph", text: `Academic papers, legal briefs, and corporate reports all require page numbers for proper citation and review. The numbered pages make it possible for reviewers, editors, and collaborators to reference specific locations without ambiguity.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Will page numbers overlap with existing content?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, stamping numbers, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Will page numbers overlap with existing content?", content: [
      { type: "paragraph", text: `The numbers are placed near the page edges at standard margin positions — 30 points from the edge for horizontal placement, 28 points from the top or 18 points from the bottom vertically. If your PDF has content very close to the edges, there is a small chance of overlap. Review the output and use the Add Margin tool first if needed to create breathing room.` },
    ]},
    { heading: "", subHeading: "Can I skip numbering on the first page?", content: [
      { type: "paragraph", text: `Not directly — the tool numbers every page. A workaround is to set the starting number to 0 so the first page shows "0", then use a different tool to remove that specific number. Alternatively, start numbering at 2 if you want page 1 to appear unnumbered in a printed context.` },
    ]},
    { heading: "", subHeading: "What format should I use for academic papers?", content: [
      { type: "paragraph", text: `Decimal (1, 2, 3) is standard for most academic and professional documents. Use lowercase roman (i, ii, iii) for front matter like title pages, abstracts, and table of contents, then switch to decimal for the body. The tool can only apply one format per run, so process front matter and body separately if you need mixed formatting.` },
    ]},
    { heading: "", subHeading: "Are the numbers searchable or selectable?", content: [
      { type: "paragraph", text: `Yes. Since the numbers are drawn as text in the page content stream, they are fully searchable in PDF readers and can be selected, copied, and highlighted like any other text on the page.` },
    ]},
  ],
};
};

const seoBatesNumbering: ToolSeo = {
  sections: [
    { heading: "What is Bates Numbering?", content: [
      { type: "paragraph", text: `Bates Numbering stamps a unique, sequential identifier onto every page of a PDF — a requirement in legal proceedings, discovery, and regulatory compliance. Each page gets a stamp like "BATES-000001", "BATES-000002", and so on, using a template and padding you control.` },
      { type: "paragraph", text: `The tool supports customizable templates (e.g. \`[BATES]\` becomes \`BATES-000001\`), configurable digit padding (default: 6 digits), starting number, font, font size, and placement (bottom-right, bottom-center, top-right, etc.). The stamps are drawn directly onto each page using pdf-lib with the specified font.` },
      { type: "paragraph", text: `Bates numbers are the legal industry's standard for uniquely identifying pages in document productions. Courts, opposing counsel, and regulatory bodies reference specific pages by their Bates number, making accurate, sequential stamping essential for compliance.` },
    ]},
    { heading: "How to Use Bates Numbering", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Enter a <strong>template</strong> — use \`[BATES]\` as a placeholder for the sequential number. Everything else in the template is literal text. For example, \`CASE-2024-[BATES]\` produces stamps like \`CASE-2024-000001\`, \`CASE-2024-000002\`, etc. The template can include hyphens, underscores, or any characters.`,
        `Set <strong>padding</strong> (default: 6 digits) — this controls how many digits the number uses, zero-padded on the left. Padding of 6 produces 000001; padding of 4 produces 0001; padding of 8 produces 00000001. Choose padding based on your document's total page count.`,
        `Set the <strong>starting number</strong> (default: 1). Use this to continue numbering from a previous production — if the first batch ended at 000500, start the next at 501.`,
        `Choose a <strong>position</strong> for the stamp: bottom-right (default), bottom-center, top-right, or top-center. The position determines where on each page the Bates number appears.`,
        `Optionally adjust the <strong>font</strong> (default: Helvetica) and <strong>font size</strong> (default: 10pt). Standard PDF base fonts (Helvetica, Times, Courier) are supported. Custom fonts may not render correctly.`,
        `Click <strong>Apply Bates Numbers</strong>. The tool iterates through every page, formats the number using your template and padding, and draws it at the specified position.`,
        `A download button appears with your file, named <code>bates-numbered.pdf</code>. The stamps are permanent — they are part of the page content and cannot be removed without a PDF editor.`,
      ]},
    ]},
    { heading: "Why Use Bates Numbering?", content: [
      { type: "paragraph", text: `Legal teams use Bates numbering to uniquely identify every page in a document production. Courts and opposing counsel reference specific pages by their Bates number, making it the standard identifier for discovery documents, depositions, and exhibit packages. Without Bates numbers, locating a specific page in a production of thousands requires manual description — unreliable and inefficient.` },
      { type: "paragraph", text: `Regulatory filings and compliance archives also require sequential page identification. FDA submissions, SEC filings, and patent applications all use Bates-style numbering for page-level tracking. Rather than manually stamping numbers in an editor, this tool applies them across hundreds or thousands of pages in seconds.` },
      { type: "paragraph", text: `The customizable template lets you match your organization's naming convention. Some firms use case numbers, document IDs, or production prefixes — the template accommodates all of these while maintaining sequential numbering.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Can I continue numbering from a previous document?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, stamping identifiers, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Can I continue numbering from a previous document?", content: [
      { type: "paragraph", text: `Yes. Set the starting number to continue from where the previous document left off. For example, if the first document ended at Bates-000500, start the next at 501. The padding will be applied automatically — 501 becomes 000501 with the default 6-digit padding.` },
    ]},
    { heading: "", subHeading: "What template syntax is supported?", content: [
      { type: "paragraph", text: `Use \`[BATES]\` as the placeholder for the sequential number. Everything else in the template is literal text. For example, \`DOC-[BATES]-CONF\` produces \`DOC-000001-CONF\`. You can include hyphens, spaces, parentheses, or any characters around the placeholder.` },
    ]},
    { heading: "", subHeading: "Can I change the font or size of the stamps?", content: [
      { type: "paragraph", text: `Yes. The font defaults to Helvetica and the size to 10pt, but both are configurable. Standard PDF base fonts (Helvetica, Times, Courier) are guaranteed to render correctly. Using non-standard fonts may cause rendering issues in some readers.` },
    ]},
    { heading: "", subHeading: "How do I choose the right padding?", content: [
      { type: "paragraph", text: `Match the padding to your total page count. For documents under 100 pages, 3-digit padding (001) is sufficient. For productions of thousands of pages, use 5 or 6 digits. The padding ensures all numbers align visually in the reader's page list and in printed output. If you later add pages to the document, higher padding ensures new numbers still align with existing ones.` },
    ]},
    { heading: "", subHeading: "Can I use Bates numbering on only some pages?", content: [
      { type: "paragraph", text: `Not directly — the tool stamps every page sequentially. If you need to number only a subset, first extract the relevant pages using the Extract Pages tool, apply Bates numbering to the extracted document, then merge it back if needed.` },
    ]},
    { heading: "", subHeading: "What happens if two documents need sequential numbering?", content: [
      { type: "paragraph", text: `Use the starting number feature. If document A ends at page 500, start document B at 501. The padding will automatically expand if needed — 501 becomes 000501 with 6-digit padding. This maintains a continuous sequence across both documents.` },
    ]},
    { heading: "", subHeading: "Are Bates stamps searchable in the PDF?", content: [
      { type: "paragraph", text: `Yes. Since the stamps are drawn as text in the page content stream, they are fully searchable in PDF readers. You can search for a specific Bates number to jump directly to that page, which is essential for legal document review workflows.` },
    ]},
  ],
};
};

const seoBookmarkPdf: ToolSeo = {
  sections: [
    { heading: "What is Edit Bookmarks?", content: [
      { type: "paragraph", text: `Edit Bookmarks lets you view, add, rename, reorder, and delete bookmarks (also called outlines) in a PDF. Bookmarks appear in the navigation panel of PDF readers, giving readers a clickable table of contents to jump between sections.` },
      { type: "paragraph", text: `The tool reads the existing bookmark tree using pdf.js, displays it as an interactive hierarchy, and lets you modify it before saving. You can nest bookmarks under parent items, rename them, change their target pages, or remove ones you don't need. The modified outline tree is written back using pdf-lib.` },
      { type: "paragraph", text: `Bookmarks are metadata — they live in the PDF's outline dictionary and do not alter any visual content on the pages themselves. A bookmark pointing to page 5 simply tells the reader "clicking this jumps to page 5"; the page content is unchanged.` },
    ]},
    { heading: "How to Use Edit Bookmarks", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool loads the PDF using pdf.js and extracts the existing bookmark tree.`,
        `The tool displays the current bookmark structure as a hierarchical list. Each bookmark shows its title text and target page number. Empty outlines show "No bookmarks found" with an option to add new ones.`,
        `To <strong>add</strong> a bookmark, click the "+" button and enter a title (e.g. "Introduction") and a target page number (1-based). The new bookmark appears at the end of the list.`,
        `To <strong>rename</strong> a bookmark, click its title text and type a new one. This is useful when exported documents have generic titles like "Section 1" that don't reflect the actual content.`,
        `To <strong>reorder or nest</strong> bookmarks, drag them to a new position. Dropping a bookmark under another makes it a child — the hierarchy appears as an indented tree in the PDF reader's navigation panel.`,
        `To <strong>delete</strong> a bookmark, click the trash icon next to it. This removes the entry from the outline dictionary without affecting any page content.`,
        `Click <strong>Save Bookmarks</strong>. The tool writes the modified outline tree back into the PDF using pdf-lib.`,
        `A download button appears with your file, named <code>bookmarked.pdf</code>. Open it in any PDF reader to verify the bookmarks appear in the navigation panel.`,
      ]},
    ]},
    { heading: "Why Use Edit Bookmarks?", content: [
      { type: "paragraph", text: `Long PDFs without bookmarks force readers to scroll manually to find sections. Adding bookmarks turns a 50-page report into a navigable document where readers can jump directly to the chapter or section they need — essential for reports, manuals, and academic papers.` },
      { type: "paragraph", text: `Exported documents often lose their original bookmarks, or arrive with generic ones ("Section 1", "Section 2") that don't reflect the actual content. Renaming and restructuring bookmarks makes the document professionally navigable without re-exporting from the source application.` },
      { type: "paragraph", text: `Legal filings, compliance documents, and formal submissions benefit from well-structured bookmarks that mirror the document's table of contents. Courts and reviewers expect navigable PDFs, and missing bookmarks can make a large filing difficult to work with.` },
    ]},
    { heading: "Privacy & Security", subHeading: "What if my PDF has no existing bookmarks?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the bookmark tree, editing, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What if my PDF has no existing bookmarks?", content: [
      { type: "paragraph", text: `The tool starts with an empty bookmark list. You can add bookmarks from scratch by clicking the "+" button for each section you want to create. Enter a descriptive title and the target page number — the tool builds the outline tree from your entries.` },
    ]},
    { heading: "", subHeading: "Can I nest bookmarks under parent items?", content: [
      { type: "paragraph", text: `Yes. Drag a bookmark under another to make it a child. The hierarchy appears as an indented tree in the PDF reader's navigation panel, just like a book's table of contents with chapters and sub-sections. You can nest multiple levels deep.` },
    ]},
    { heading: "", subHeading: "Do bookmarks affect the page content?", content: [
      { type: "paragraph", text: `No. Bookmarks are metadata — they live in the PDF's outline dictionary and do not alter any visual content on the pages themselves. Adding, renaming, or deleting bookmarks changes only the navigation structure, not the page renders.` },
    ]},
    { heading: "", subHeading: "Will bookmarks work in all PDF readers?", content: [
      { type: "paragraph", text: `Yes. The outline dictionary is a standard PDF feature supported by every compliant reader — Acrobat, Preview, Edge, Chrome, mobile readers, and open-source tools like Evince and Okular all display bookmarks in their navigation panels.` },
    ]},
  ],
};
};

const seoCropPages: ToolSeo = {
  sections: [
    { heading: "What is PDF Page Cropper?", content: [
      { type: "paragraph", text: `PDF Page Cropper trims the visible area of every page in a PDF by removing content outside specified margins. You define how many points to cut from each edge — top, right, bottom, and left — and the tool crops every page to those dimensions.` },
      { type: "paragraph", text: `The tool uses pdf-lib to set each page's crop box, which defines the visible region without altering the underlying content. Pages retain their original media box (full content area), but readers display only the cropped region. The default margins are 50 points on every side.` },
      { type: "paragraph", text: `Cropping is non-destructive — the content outside the crop box still exists in the PDF's internal structure. Readers simply don't display it. For true content removal (where the data is stripped from the file), use the Redact tool instead.` },
    ]},
    { heading: "How to Use PDF Page Cropper", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Set the <strong>crop margins</strong> for each edge: top, right, bottom, and left. The default is 50 points on every side. Values are in points (72 points = 1 inch). Each margin specifies how much to trim from that edge — a top margin of 100 removes the top 100 points (about 1.39 inches) from every page.`,
        `The tool applies the same margins to every page. For mixed-size documents, the margins are relative to each page's own dimensions, so a 50-point margin on a letter page and an A4 page removes the same absolute distance from each edge.`,
        `Click <strong>Crop Pages</strong>. The tool iterates through every page, calculates the new crop box coordinates based on your margins, and sets the visible region.`,
        `A download button appears with your file, named <code>cropped.pdf</code>. The file size may decrease slightly since readers skip rendering the cropped content, but the raw data remains in the file.`,
      ]},
    ]},
    { heading: "Why Use PDF Page Cropper?", content: [
      { type: "paragraph", text: `Scanned documents often include black borders, scanner edges, or stray marks around the page content. Cropping removes those distractions, producing a cleaner file that displays and prints more professionally. This is especially common with batch scans where the scanner lid didn't fully cover the page.` },
      { type: "paragraph", text: `Presentations and portfolios benefit too — cropping tight around the content eliminates excess white space, making each page feel intentional and well-composed when shared as a PDF. Designers use it to trim exported mockups and wireframes to their content boundaries.` },
      { type: "paragraph", text: `Legal and academic documents sometimes need specific visible areas — for example, cropping a scanned page to show only the text area while hiding the page margins. This tool handles that uniformly across every page in the document.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Does cropping delete the content outside the margins?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, cropping, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Does cropping delete the content outside the margins?", content: [
      { type: "paragraph", text: `Visually, yes — cropped content is hidden from view. Technically, the content remains in the PDF's media box and could be recovered with a PDF editor. For true removal where the data is actually stripped from the file, use the Redact tool instead.` },
    ]},
    { heading: "", subHeading: "Can I crop different pages by different amounts?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool applies the same crop margins to every page. For per-page cropping, split the document using the Split tool, crop each part separately, and recombine with Merge.` },
    ]},
    { heading: "", subHeading: "What unit are the margins in?", content: [
      { type: "paragraph", text: `Points. There are 72 points per inch, so a crop margin of 72 removes one inch from each edge. A margin of 36 removes half an inch. For reference: a standard US Letter page is 612 × 792 points.` },
    ]},
    { heading: "", subHeading: "Will cropping change the page size?", content: [
      { type: "paragraph", text: `The crop box changes what's visible, but the page's physical dimensions (the media box) remain the same. Some readers may display the cropped size as the page size, while others show the full dimensions. If you need the page dimensions to actually change, use the Fix Page Size tool after cropping.` },
    ]},
  ],
};
};

const seoDividePages: ToolSeo = {
  sections: [
    { heading: "What is Divide Pages?", content: [
      { type: "paragraph", text: `Divide Pages splits individual pages into smaller sections — either vertically (side-by-side columns) or horizontally (stacked rows). For example, a single landscape page can be divided into two portrait halves, or a page can be split into a grid of smaller sections.` },
      { type: "paragraph", text: `You control the division mode (vertical or horizontal), which pages to divide (a range or all pages), and how many output sections to produce per source page. The tool uses an external processing adapter (CoherentPDF-based) to crop each source page into the specified number of equal sections.` },
      { type: "paragraph", text: `Vertical mode splits left-to-right into columns. Horizontal mode splits top-to-bottom into rows. Each section becomes a separate page in the output document, preserving the original content at its original resolution.` },
    ]},
    { heading: "How to Use Divide Pages", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Choose a <strong>mode</strong>: vertical (splits left-to-right into columns) or horizontal (splits top-to-bottom into rows). Vertical mode is ideal for double-page spreads scanned as a single image. Horizontal mode works for documents with stacked content that needs to be separated.`,
        `Optionally specify a <strong>page range</strong> to divide only certain pages. Use a comma-separated list of page numbers or ranges (e.g. "1-5, 10"). Leave blank to divide all pages in the document.`,
        `Set the <strong>number of output sections</strong> per source page (default: 1, which means no division — increase to 2, 3, etc.). With 2 sections, each source page produces 2 output pages. With 3, it produces 3, and so on.`,
        `Click <strong>Divide Pages</strong>. The tool processes each source page: it calculates the section dimensions based on the mode and count, crops the page into equal sections, and appends each section as a new page in the output.`,
        `A download button appears with your file, named <code>divided.pdf</code>. The output contains the divided sections in reading order: for vertical mode, left-to-right; for horizontal mode, top-to-bottom.`,
      ]},
    ]},
    { heading: "Why Use Divide Pages?", content: [
      { type: "paragraph", text: `Scanned double-page spreads — books, magazines, or legal filings scanned as two pages side by side — need to be split into individual pages for readable viewing on phones and tablets. Divide Pages in vertical mode with 2 output sections handles this automatically, producing one page per half-spread.` },
      { type: "paragraph", text: `Print layout workflows use horizontal division to create half-page handouts or cutting guides, where a single large page needs to be physically divided into separate sections after printing. Teachers and trainers use this to create worksheet halves from full-page materials.` },
      { type: "paragraph", text: `Archival workflows benefit from dividing oversized scanned pages into standard-sized sections that can be stored, indexed, and retrieved individually rather than as unmanageable full-page images.` },
    ]},
    { heading: "Privacy & Security", subHeading: "What happens to text and images that span the division line?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, dividing, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What happens to text and images that span the division line?", content: [
      { type: "paragraph", text: `Content is cropped at the division boundary. If text or an image crosses the split point, it will be cut — the left half appears on one output page and the right half on the other. Review the output to confirm clean splits, especially for documents with wide tables or full-width images.` },
    ]},
    { heading: "", subHeading: "Can I divide only some pages?", content: [
      { type: "paragraph", text: `Yes. Specify a page range (e.g. "1-5") to limit division to those pages. All other pages pass through unchanged to the output document. This is useful when only certain pages in a document need splitting — for example, a report where only the appendix has double-page spreads.` },
    ]},
    { heading: "", subHeading: "Do the output pages maintain the original quality?", content: [
      { type: "paragraph", text: `Yes. Each section is a direct crop of the source page at its original resolution — no scaling, resampling, or compression occurs. Text remains sharp and images retain their original pixel data.` },
    ]},
  ],
};
};

const seoEditAttachments: ToolSeo = {
  sections: [
    { heading: "What is Edit Attachments?", content: [
      { type: "paragraph", text: `Edit Attachments lets you view and remove file attachments embedded in a PDF. Many PDFs carry attached files — spreadsheets, images, supplementary documents — that bloat the file size or contain information you don't want to share. This tool lists every attachment, lets you select which ones to remove, and produces a new PDF without them.` },
      { type: "paragraph", text: `The tool uses a web worker powered by CoherentPDF to parse the attachment dictionary, display each file's name and size, and strip selected attachments from the document. The processing happens in a background thread to keep the UI responsive during large file operations.` },
      { type: "paragraph", text: `Attachments are embedded files within the PDF — they are separate from the page content and are stored in the document's embedded files dictionary. Removing them reduces file size and prevents accidental disclosure of supplementary material when sharing the PDF externally.` },
    ]},
    { heading: "How to Use Edit Attachments", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool loads the file and sends it to a web worker for attachment scanning.`,
        `The tool scans the PDF's embedded files dictionary and displays a list of all attachments. Each entry shows the file's name and size. If the PDF has no attachments, the tool displays "No attachments found."`,
        `Review the list and check the boxes next to the attachments you want to <strong>remove</strong>. Unchecked attachments will be preserved in the output. You can select multiple attachments for removal in a single operation.`,
        `Click <strong>Remove Attachments</strong>. The tool sends the file and the list of attachments to remove to the web worker, which strips them from the PDF's embedded files dictionary.`,
        `A download button appears with your file, named <code>attachments-edited.pdf</code>. The output PDF is identical to the original except that the selected attachments are no longer embedded.`,
      ]},
    ]},
    { heading: "Why Use Edit Attachments?", content: [
      { type: "paragraph", text: `Before sharing a PDF externally, you may want to remove internal attachments that aren't relevant to the recipient — draft spreadsheets, source files, or working documents that were attached during creation. Stripping them reduces file size and prevents accidental disclosure of supplementary material.` },
      { type: "paragraph", text: `Archival workflows benefit too: when filing a PDF for long-term storage, removing unnecessary attachments keeps the archive clean and the file size manageable. Attachments can significantly inflate file size — a PDF with several embedded spreadsheets might be 10x larger than the PDF content alone.` },
      { type: "paragraph", text: `Compliance and privacy workflows sometimes require removing attachments before public disclosure. Government filings, FOIA responses, and published reports often need clean PDFs without embedded working files.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Can I download attachments before removing them?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — scanning attachments, removing selected files, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Can I download attachments before removing them?", content: [
      { type: "paragraph", text: `Not directly with this tool. Its focus is on removing attachments. To download individual attachments first, use a dedicated PDF editor or the PDF Attachment Viewer tool, which can extract and save individual attachments.` },
    ]},
    { heading: "", subHeading: "Does removing attachments reduce file size?", content: [
      { type: "paragraph", text: `Yes. Attachments are embedded files that contribute to the PDF's total size. Removing them reduces the file size by the size of the removed files. A PDF with several embedded spreadsheets can be significantly smaller after attachment removal.` },
    ]},
    { heading: "", subHeading: "Will removing attachments affect the page content?", content: [
      { type: "paragraph", text: `No. Attachments are stored separately from page content in the PDF's embedded files dictionary. Removing them does not alter any text, images, annotations, or formatting on the pages themselves.` },
    ]},
    { heading: "", subHeading: "What types of attachments can be removed?", content: [
      { type: "paragraph", text: `Any file type embedded in the PDF — spreadsheets, images, documents, executables, or any other format. The tool displays each attachment's name and size so you can identify what to remove.` },
    ]},
    { heading: "", subHeading: "Can I view attachment contents before removing?", content: [
      { type: "paragraph", text: `The tool shows file name and size for each attachment, usually sufficient to identify it. For detailed preview, use a dedicated PDF reader's attachment panel before running this tool.` },
    ]},
    { heading: "", subHeading: "How much can removing attachments reduce file size?", content: [
      { type: "paragraph", text: `Depends entirely on attachment sizes. A PDF with a 5MB embedded spreadsheet shrinks by roughly 5MB. PDFs with only small text attachments see minimal reduction.` },
    ]},
  ],
};
};

const seoExtractPages: ToolSeo = {
  sections: [
    { heading: "What is Extract Pages?", content: [
      { type: "paragraph", text: `Extract Pages pulls selected pages from a PDF into a new, separate document. You specify which pages to keep using a range string (e.g. "1-3, 7, 10-12"), and the tool copies only those pages into a fresh PDF, leaving the original untouched.` },
      { type: "paragraph", text: `The tool uses pdf-lib to parse the page range, load the source document, copy the specified page indices using the document's internal page references, and write a new file containing only the extracted pages. Page content, fonts, images, and annotations are preserved in the output.` },
      { type: "paragraph", text: `The extracted pages maintain their original dimensions, orientation, and content exactly as they appeared in the source document. The output is a standard PDF that opens in any reader.` },
    ]},
    { heading: "How to Use Extract Pages", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool reads the document and determines the total page count.`,
        `Enter a <strong>page range</strong> in the text field. Use commas to separate individual pages and hyphens for ranges: <code>1-3, 7, 10-12</code>. Pages are numbered starting from 1. You can mix ranges and individual pages freely.`,
        `The tool validates your input against the document's actual page count. Invalid page numbers (outside the range) are silently skipped — the output contains only valid pages.`,
        `Click <strong>Extract Pages</strong>. The tool parses the range string into page indices, loads the source document, copies the specified pages using pdf-lib's copyPages method, and assembles them into a new PDF.`,
        `A download button appears with your file, named <code>extracted-pages.pdf</code>. The output contains only the pages you specified, in the order you listed them.`,
      ]},
    ]},
    { heading: "Why Use Extract Pages?", content: [
      { type: "paragraph", text: `When you only need a few pages from a long document — a specific exhibit from a legal filing, a single chapter from a report, or the relevant pages from a scan — extracting them produces a focused, smaller file that's easier to share and review.` },
      { type: "paragraph", text: `It also works as a preprocessing step: extract the pages you need, then merge or process them further with other tools, without carrying along the rest of the document. This is common in document assembly workflows where you pull pages from multiple sources.` },
      { type: "paragraph", text: `Email and upload platforms often have file size limits. Extracting a 5-page subset from a 200-page document creates a file that's small enough to share without compression or splitting.` },
    ]},
    { heading: "Privacy & Security", subHeading: "What format does the page range use?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, extracting, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What format does the page range use?", content: [
      { type: "paragraph", text: `Comma-separated page numbers with optional hyphen ranges. Examples: <code>1,3,5</code> (pages 1, 3, and 5), <code>1-5</code> (pages 1 through 5), <code>1-3, 7, 10-12</code> (a mix of ranges and individual pages). Pages are 1-based — page 1 is the first page of the document.` },
    ]},
    { heading: "", subHeading: "Does this modify the original file?", content: [
      { type: "paragraph", text: `No. The original PDF is read but never modified. A completely new PDF is created containing only the extracted pages. The source file remains on your device exactly as it was.` },
    ]},
    { heading: "", subHeading: "Do bookmarks and form fields carry over?", content: [
      { type: "paragraph", text: `Page content, images, and formatting are preserved. Bookmarks and form fields may not transfer correctly since they can reference pages outside the extracted range. If interactive elements are important, review the output and consider re-creating bookmarks with the Edit Bookmarks tool.` },
    ]},
    { heading: "", subHeading: "Can I extract the same page multiple times?", content: [
      { type: "paragraph", text: `Yes. Include the same page number more than once in your range string. For example, <code>1,1,2</code> produces a three-page document with page 1 appearing twice followed by page 2.` },
    ]},
    { heading: "", subHeading: "What happens to annotations on extracted pages?", content: [
      { type: "paragraph", text: `Annotations (comments, highlights, form fields) on the extracted pages are preserved. Annotations on pages not extracted are not included in the output.` },
    ]},
    { heading: "", subHeading: "Can I extract pages from a password-protected PDF?", content: [
      { type: "paragraph", text: `If the PDF requires a password to open, the tool may not be able to read it. Use the Unlock tool first to remove the password, then extract the pages you need.` },
    ]},
  ],
};
};

const seoHeadersFooters: ToolSeo = {
  sections: [
    { heading: "What is Add Headers/Footers?", content: [
      { type: "paragraph", text: `Add Headers/Footers places text at the top or bottom of every page in a PDF. You provide the text content — a document title, date, confidential marker, page reference, or any custom string — and the tool stamps it onto each page using pdf-lib.` },
      { type: "paragraph", text: `The tool supports both header (top of page) and footer (bottom of page) text, applied uniformly across all pages. The text is drawn using the Helvetica font at a configurable size (default: 10pt), positioned with configurable margins (default: 28pt top, 18pt bottom). The text is centered horizontally on each page.` },
      { type: "paragraph", text: `The enhanced version of this tool (used internally) also supports left-aligned, center-aligned, and right-aligned text, page-range targeting, and separate header/footer content for odd and even pages. The basic interface exposes the center-aligned mode for simplicity.` },
    ]},
    { heading: "How to Use Add Headers/Footers", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Enter the <strong>header text</strong> — this appears at the top of every page, centered horizontally, 28 points from the top edge. Leave blank to skip headers. Common uses: document titles, dates, "CONFIDENTIAL" markers, or draft version labels.`,
        `Enter the <strong>footer text</strong> — this appears at the bottom of every page, centered horizontally, 18 points from the bottom edge. Leave blank to skip footers. Common uses: page references, copyright notices, or department names.`,
        `Click <strong>Apply Headers/Footers</strong>. The tool loads the PDF, embeds the Helvetica font, iterates through every page, calculates the centered position based on the text width, and draws the text at the specified coordinates.`,
        `A download button appears with your file, named <code>headers-footers.pdf</code>. The text is permanently part of the page content — it appears in both on-screen viewing and printed output.`,
      ]},
    ]},
    { heading: "Why Use Add Headers/Footers?", content: [
      { type: "paragraph", text: `Confidentiality notices, draft watermarks, and document dates are commonly added to PDFs after creation. Rather than re-exporting from the original application — which may not be available — this tool stamps them onto every page in seconds.` },
      { type: "paragraph", text: `Legal and corporate teams use it to add consistent branding, page references, or compliance markers across multi-page documents before distribution. A "DRAFT" footer on every page makes the document's status immediately clear to all recipients.` },
      { type: "paragraph", text: `Academic and research documents benefit from headers that include the paper title, author name, or submission date — information that helps reviewers identify the document when printed or viewed alongside other papers.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Can I use different text on different pages?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, stamping text, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Can I use different text on different pages?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool applies the same header and footer text to every page. For per-page customization, you would need to process pages individually — extract the pages, apply different text to each, and recombine.` },
    ]},
    { heading: "", subHeading: "Can I include dynamic content like dates or page numbers?", content: [
      { type: "paragraph", text: `Currently, the tool accepts static text only. For dynamic page numbers, use the dedicated Add Page Numbers tool. For dates, include the date string manually in the header/footer text (e.g. "August 27, 2026").` },
    ]},
    { heading: "", subHeading: "What font and size is used?", content: [
      { type: "paragraph", text: `The text is rendered in Helvetica at 10pt by default. This is a standard PDF base font that renders consistently across all readers. The font is embedded in the output to ensure the text displays correctly even on systems without Helvetica installed.` },
    ]},
    { heading: "", subHeading: "Will the text overlap with existing page content?", content: [
      { type: "paragraph", text: `The header is placed 28 points from the top edge and the footer 18 points from the bottom. If your PDF has content very close to the edges, there may be overlap. Review the output and use the Add Margin tool first if you need more breathing room.` },
    ]},
  ],
};
};

const seoInsertBlankPages: ToolSeo = {
  sections: [
    { heading: "What is Insert Blank Pages?", content: [
      { type: "paragraph", text: `Insert Blank Pages adds empty white pages into a PDF at a position you specify. You choose where to insert (before page 1, after page 5, etc.) and how many blank pages to add. The existing pages shift to accommodate the new ones.` },
      { type: "paragraph", text: `The tool uses pdf-lib to create blank pages matching the dimensions of the adjacent page and insert them at the specified index in the document. The blank pages are created with the same width and height as the page immediately before the insertion point, ensuring consistent page sizes.` },
      { type: "paragraph", text: `The position is specified as a page number (1-based). Use 0 to insert before the first page. Use the document's total page count to insert at the end. The tool handles edge cases like inserting beyond the document's length by appending to the end.` },
    ]},
    { heading: "How to Use Insert Blank Pages", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool reads the document and determines the total page count and page dimensions.`,
        `Set the <strong>position</strong> — the page number after which to insert blanks. Use 0 to insert before the first page. The default is 0 (beginning of document). The position is clamped to the document's page count — inserting after page 100 in a 50-page document appends to the end.`,
        `Set the <strong>count</strong> — how many blank pages to insert (default: 1). You can insert multiple blank pages at once. Each blank page matches the dimensions of the page at the insertion point.`,
        `Click <strong>Insert Blank Pages</strong>. The tool creates the blank pages, copies all existing pages from the source, and interleaves the blanks at the specified position.`,
        `A download button appears with your file, named <code>with-blank-pages.pdf</code>. The blank pages are standard PDF pages with no content — they appear as empty white pages in any reader.`,
      ]},
    ]},
    { heading: "Why Use Insert Blank Pages?", content: [
      { type: "paragraph", text: `Documents being prepared for print often need blank separator pages between chapters, placeholder pages for content that will be added later, or intentionally empty pages for notes. This tool adds them without re-exporting from the source application.` },
      { type: "paragraph", text: `Forms and applications that require a specific page count benefit too — inserting blank pages to meet a page-count requirement is faster than manually adding them in an editor. Some submission systems reject documents that don't meet minimum page requirements.` },
      { type: "paragraph", text: `Presentation handouts often need blank "notes" pages between slides for audience members to write on. Inserting blank pages after every content page creates this format automatically.` },
    ]},
    { heading: "Privacy & Security", subHeading: "What size are the blank pages?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, inserting, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What size are the blank pages?", content: [
      { type: "paragraph", text: `Blank pages match the dimensions of the page immediately before the insertion point. If you insert after page 3, the blank pages will be the same width and height as page 3. If inserting before page 1 (position 0), the blanks match page 1's dimensions.` },
    ]},
    { heading: "", subHeading: "Can I insert blanks at multiple positions at once?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool inserts all blanks at one position. To insert at multiple positions, run the tool once for each insertion point. Process from the end of the document backward to avoid position shifts affecting subsequent insertions.` },
    ]},
    { heading: "", subHeading: "Do blank pages have any hidden content?", content: [
      { type: "paragraph", text: `No. The blank pages are completely empty — no text, no images, no annotations, no hidden layers. They are standard PDF pages with only the page size defined.` },
    ]},
    { heading: "", subHeading: "Can I insert blank pages of a specific size?", content: [
      { type: "paragraph", text: `The tool automatically matches the blank page size to the page at the insertion point. For a custom size, first use the Fix Page Size tool to set all pages to your desired dimensions.` },
    ]},
    { heading: "", subHeading: "What happens if I insert at position 0?", content: [
      { type: "paragraph", text: `Position 0 inserts blanks before the first page. This is useful for adding a title page or cover sheet at the beginning of a document.` },
    ]},
  ],
};
};

const seoKeepNthPage: ToolSeo = {
  sections: [
    { heading: "What is Keep Nth Page?", content: [
      { type: "paragraph", text: `Keep Nth Page extracts every Nth page from a PDF, discarding the rest. With N set to 2, it keeps pages 1, 3, 5, 7, and so on — effectively selecting every other page. With N set to 3, it keeps pages 1, 4, 7, and so on.` },
      { type: "paragraph", text: `The tool uses pdf-lib to iterate through the source document, copy every Nth page by index, and write a new PDF containing only the selected pages. The extraction is lossless — page content, fonts, images, and annotations are preserved at their original quality.` },
      { type: "paragraph", text: `Page 1 is always kept. The tool counts from the first page and selects every Nth page thereafter. This means with N=2, you get the odd-numbered pages (1, 3, 5, ...); with N=3, you get pages 1, 4, 7, 10, and so on.` },
    ]},
    { heading: "How to Use Keep Nth Page", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool reads the document and determines the total page count.`,
        `Set <strong>N</strong> — the interval. The tool keeps every Nth page starting from page 1. Default is 2 (every other page). With N=2 and a 10-page document, you get pages 1, 3, 5, 7, 9 (5 pages). With N=3, you get pages 1, 4, 7 (3 pages).`,
        `Click <strong>Keep Nth Page</strong>. The tool iterates through the source document, selects pages at the specified interval, copies them into a new PDF, and writes the output.`,
        `A download button appears with your file, named <code>nth-pages.pdf</code>. The output contains only the selected pages in their original order.`,
      ]},
    ]},
    { heading: "Why Use Keep Nth Page?", content: [
      { type: "paragraph", text: `Scanned double-sided documents interleave front and back pages consecutively. Keeping every Nth page separates one side of the document from the other — useful when you only need the front or back of a set of scanned pages.` },
      { type: "paragraph", text: `Sampling is another common use: extracting every 5th or 10th page from a long document gives a quick overview without processing the entire file. This is useful for quality checks on large scan batches or for creating preview extracts from lengthy reports.` },
      { type: "paragraph", text: `Presentation handouts sometimes need every other slide (skipping title slides or transition slides). Keep Nth Page with N=2 produces a condensed version with only the content slides.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Which page is considered the first?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, selecting, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Which page is considered the first?", content: [
      { type: "paragraph", text: `Page 1 (the first page of the document) is always kept. With N=2, the tool keeps pages 1, 3, 5, 7, etc. — always starting from the first page. The first page is never skipped regardless of the interval.` },
    ]},
    { heading: "", subHeading: "Can I keep pages starting from a different position?", content: [
      { type: "paragraph", text: `Not directly — the tool always starts from page 1. To start from a different position, first extract the desired starting range with the Extract Pages tool, then apply Keep Nth Page to the result.` },
    ]},
    { heading: "", subHeading: "What happens if the page count isn't evenly divisible by N?", content: [
      { type: "paragraph", text: `The tool keeps whatever pages fall on the Nth interval. A 10-page document with N=3 keeps pages 1, 4, 7 (3 pages). The remaining pages are simply not included — there's no rounding or padding.` },
    ]},
    { heading: "", subHeading: "Can I keep every page except every Nth?", content: [
      { type: "paragraph", text: `Not directly. To remove every Nth page instead of keeping it, first extract all pages, then use the Delete Pages tool to remove the specific positions you want to exclude.` },
    ]},
    { heading: "", subHeading: "What if I want to keep pages in a different pattern?", content: [
      { type: "paragraph", text: `For non-uniform patterns (e.g. keep 2, skip 1), use the Extract Pages tool with a custom range string like 1-2, 4-5, 7-8 to define exactly which pages to keep.` },
    ]},
    { heading: "", subHeading: "Does the output file size change proportionally?", content: [
      { type: "paragraph", text: `Roughly yes. Keeping every Nth page produces approximately 1/N of the original page count. A 100-page document with N=5 produces about 20 pages.` },
    ]},
  ],
};
};

const seoOrganizePages: ToolSeo = {
  sections: [
    { heading: "What is Rearrange Pages?", content: [
      { type: "paragraph", text: `Rearrange Pages lets you reorder the pages in a PDF by specifying a custom page sequence. You provide a list of page numbers in the order you want them to appear — for example, "3,1,2,5,4" puts page 3 first, then page 1, then page 2, and so on.` },
      { type: "paragraph", text: `The tool uses pdf-lib to parse the order string into page indices, copy pages from the source document in the specified sequence, and write a new PDF with the reordered pages. The page content is preserved exactly — only the order changes.` },
      { type: "paragraph", text: `You can repeat pages in the sequence (e.g. "1,1,2" duplicates page 1), skip pages (omitted pages are not included in the output), and create any arbitrary ordering. The output contains exactly the pages you specified, in the order you specified.` },
    ]},
    { heading: "How to Use Rearrange Pages", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool reads the document and determines the total page count.`,
        `Enter a <strong>page order</strong> as a comma-separated list of page numbers: <code>3,1,2,5,4</code>. Pages are 1-based. You can repeat pages (e.g. <code>1,1,2</code> duplicates page 1). You can skip pages — only the pages you list appear in the output.`,
        `The tool validates your input against the document's actual page count. Invalid page numbers are silently skipped. If you list only valid pages, the output contains exactly those pages in your specified order.`,
        `Click <strong>Rearrange Pages</strong>. The tool parses the order string, copies pages from the source in the specified sequence, and writes a new PDF.`,
        `A download button appears with your file, named <code>organized.pdf</code>. The output contains your pages in the exact order you specified.`,
      ]},
    ]},
    { heading: "Why Use Rearrange Pages?", content: [
      { type: "paragraph", text: `Scanned documents frequently arrive out of order — pages scanned in reverse, interleaved from multiple sources, or shuffled during processing. Rearrange Pages restores the correct reading order in seconds.` },
      { type: "paragraph", text: `Presentations and reports benefit too: moving a cover page to the front, repositioning an appendix, or putting pages in a custom review sequence is a common pre-distribution task. Rather than re-exporting from the source application, you can fix the order on the final PDF.` },
      { type: "paragraph", text: `Legal teams use page reordering to assemble exhibit packages in the correct sequence, ensuring that exhibits appear in the order referenced by the filing. This is especially useful when exhibits arrive from multiple sources in random order.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Can I duplicate pages?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, reordering, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Can I duplicate pages?", content: [
      { type: "paragraph", text: `Yes. Include the same page number more than once in your order string. For example, <code>1,1,2</code> produces a three-page document with page 1 appearing twice followed by page 2. This is useful for creating multiple copies of a signature page or a cover sheet.` },
    ]},
    { heading: "", subHeading: "What happens if I enter an invalid page number?", content: [
      { type: "paragraph", text: `Invalid page numbers (outside the document's page range) are silently skipped. The output contains only pages that exist in the source document and were included in your order string. No error is thrown.` },
    ]},
    { heading: "", subHeading: "Can I skip pages?", content: [
      { type: "paragraph", text: `Yes. Only the pages you list in your order string appear in the output. If you have a 10-page document and enter "1,3,5", the output contains only those three pages — pages 2, 4, 6-10 are omitted.` },
    ]},
    { heading: "", subHeading: "Can I use page ranges in the order string?", content: [
      { type: "paragraph", text: `No. The order string accepts individual page numbers separated by commas. For page ranges, use the Extract Pages tool first to pull the pages you need, then rearrange.` },
    ]},
    { heading: "", subHeading: "What if I enter the same page number multiple times?", content: [
      { type: "paragraph", text: `The page is duplicated in the output. Entering 1,1,1,2 produces a 4-page document where page 1 appears three times followed by page 2.` },
    ]},
    { heading: "", subHeading: "Does rearranging affect page numbers in the reader?", content: [
      { type: "paragraph", text: `Yes. The output document renumbers pages sequentially from 1. If you move page 5 to position 1, it becomes page 1 in the output.` },
    ]},
  ],
};
};

const seoPdfMultiTool: ToolSeo = {
  sections: [
    { heading: "What is PDF Multi-Tool?", content: [
      { type: "paragraph", text: `PDF Multi-Tool is an all-in-one page management interface that lets you merge multiple PDFs, reorder pages via drag-and-drop, rotate individual pages, and delete unwanted pages — all in a single workspace. Instead of using separate tools for each operation, you manage everything from one screen.` },
      { type: "paragraph", text: `The tool renders thumbnails of every page across all loaded documents, letting you visually arrange, rotate, and remove pages before exporting the final result as a single combined PDF. The interactive interface uses a browser-based rendering engine to display page previews.` },
      { type: "paragraph", text: `This is a browser-only tool with a custom interactive UI — it cannot run in headless mode. The page management happens entirely in the browser's memory, and the final export uses pdf-lib to assemble the selected pages into a new document.` },
    ]},
    { heading: "How to Use PDF Multi-Tool", content: [
      { type: "list", items: [
        `Drop one or more PDF files onto the upload zone. Each file's pages appear as thumbnails in the workspace, grouped by source document. You can add more files at any point using the "Add File" button.`,
        `Drag thumbnails to <strong>reorder</strong> pages across and within documents. You can move pages between files — dragging a page from one document's group to another merges it into the target location.`,
        `Click the <strong>rotate</strong> icon on a thumbnail to rotate it 90 degrees clockwise. Click again for 180°, again for 270°, and again to return to the original orientation. Rotation is visual — the actual page content is rotated in the output.`,
        `Click the <strong>delete</strong> icon (trash) on a thumbnail to remove it from the output. Deleted pages are not included in the final export. You can restore them by clicking "Undo" if you change your mind.`,
        `Use the toolbar for bulk operations: select multiple pages with Shift+click or Ctrl+click, then rotate or delete them as a group. The "Select All" button selects every page across all loaded documents.`,
        `Click <strong>Export PDF</strong>. The tool collects the remaining pages in their current visual order, copies them from the source documents using pdf-lib, and assembles them into a single combined PDF.`,
        `A download button appears with your file, named <code>combined.pdf</code>. The output contains exactly the pages you kept, in the order you arranged them.`,
      ]},
    ]},
    { heading: "Why Use PDF Multi-Tool?", content: [
      { type: "paragraph", text: `When you need to combine pages from multiple sources, fix the order, remove a few stray pages, and rotate some — all in one pass — using separate tools for each step is tedious. Multi-Tool gives you a visual workspace where all these operations happen before a single export.` },
      { type: "paragraph", text: `Legal teams assembling exhibit packages, administrators compiling reports from multiple departments, and students combining lecture notes all benefit from seeing every page as a thumbnail and arranging them visually rather than guessing page numbers from a text list.` },
      { type: "paragraph", text: `The drag-and-drop interface is particularly valuable when the correct page order isn't obvious from page numbers — for example, when combining scans from different sources that need to be interleaved in a specific sequence.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Is there a limit on how many files I can load?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading pages, rearranging, and exporting — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Is there a limit on how many files I can load?", content: [
      { type: "paragraph", text: `There is no hard limit, but performance depends on your device's memory. Very large documents (hundreds of pages each) may slow down the thumbnail rendering. For typical use with 5-20 files totaling under 200 pages, performance is smooth. Close other browser tabs if you're working with large documents.` },
    ]},
    { heading: "", subHeading: "Does this preserve bookmarks and form fields?", content: [
      { type: "paragraph", text: `Page content and formatting are preserved. Bookmarks and interactive form fields may not carry over correctly across the reorganization, since they can reference pages by their original positions. Review the output if interactive elements are important.` },
    ]},
    { heading: "", subHeading: "Can I preview the output before exporting?", content: [
      { type: "paragraph", text: `The thumbnail view shows the current arrangement. The pages appear in the workspace in the exact order they will appear in the output. Rearranging the thumbnails directly changes the output order.` },
    ]},
  ],
};
};

const seoPosterize: ToolSeo = {
  sections: [
    { heading: "What is Posterize PDF?", content: [
      { type: "paragraph", text: `Posterize splits each page of a PDF into a grid of smaller pages — like cutting a poster into tiles. You specify the number of columns and rows (e.g. 2×2 produces four tiles per page), and the tool crops each source page into equal sections, outputting them as sequential pages in a new PDF.` },
      { type: "paragraph", text: `The tool uses pdf-lib to calculate the grid dimensions, crop each source page into the specified number of tiles, and append them to the output document in reading order (left-to-right, top-to-bottom). Each tile is a direct crop of the source page at its original resolution.` },
      { type: "paragraph", text: `The output pages maintain the original page dimensions — a tile from a letter-size page is still letter-size, just showing a quarter of the original content. This makes the tiles suitable for printing at the same scale as the original.` },
    ]},
    { heading: "How to Use Posterize PDF", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Set the number of <strong>columns</strong> (default: 2) and <strong>rows</strong> (default: 2). A 2×2 grid produces 4 tiles per page; a 3×2 grid produces 6 tiles; a 3×3 grid produces 9 tiles. The total tiles per page is columns × rows.`,
        `Click <strong>Posterize</strong>. For each page in the document, the tool calculates the tile dimensions (page width ÷ columns, page height ÷ rows), crops the page into that many sections, and appends each tile as a new page in the output.`,
        `The tiles are ordered left-to-right, top-to-bottom. For a 2×2 grid: top-left, top-right, bottom-left, bottom-right. This reading order makes it straightforward to reassemble the tiles after printing.`,
        `A download button appears with your file, named <code>posterized.pdf</code>. The output has (columns × rows × original page count) pages — a 10-page document posterized at 2×2 produces 40 pages.`,
      ]},
    ]},
    { heading: "Why Use Posterize PDF?", content: [
      { type: "paragraph", text: `Printing large-format documents on standard paper requires splitting them into tiles that can be taped together after printing. Posterize automates this, producing correctly sized and ordered tiles from any PDF page. This is common for architectural plans, maps, and presentation posters.` },
      { type: "paragraph", text: `Teachers and presenters use it to create handouts from full-page diagrams — splitting a complex chart into quadrants that each fit on a standard sheet, making them easier to annotate and discuss in small groups.` },
      { type: "paragraph", text: `Artists and designers use posterization to create tiled prints from digital artwork, producing large-format physical pieces from standard home printers by assembling multiple printed tiles.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Does posterizing scale the content?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, splitting into tiles, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Does posterizing scale the content?", content: [
      { type: "paragraph", text: `No. Each tile is a direct crop of the source page at its original resolution — no scaling or resampling occurs. The content within each tile is identical to the corresponding section of the original page. Text remains sharp and images retain their original pixel data.` },
    ]},
    { heading: "", subHeading: "What grid size should I use for printing?", content: [
      { type: "paragraph", text: `For standard letter-size paper, a 2×2 grid works well for most posters. For larger prints, try 3×3 or 4×4. The output page size matches the source page size, so the tiles will be proportionally smaller. A 2×2 grid on letter paper produces tiles that are each half the width and half the height of the original.` },
    ]},
    { heading: "", subHeading: "How many pages will the output have?", content: [
      { type: "paragraph", text: `The output has (columns × rows × original page count) pages. A 10-page document posterized at 2×2 produces 40 pages. At 3×3, it produces 90 pages. Plan your output size accordingly.` },
    ]},
    { heading: "", subHeading: "Can I posterize only some pages?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool posterizes every page. To posterize only specific pages, split the document first, posterize the relevant portion, and recombine with Merge.` },
    ]},
    { heading: "", subHeading: "Will the tiles align correctly when printed?", content: [
      { type: "paragraph", text: `Each tile is a direct crop of the source page, so they align precisely when printed at the same scale. For best results, print all tiles at the same size and trim margins before assembling.` },
    ]},
  ],
};
};

const seoReplacePage: ToolSeo = {
  sections: [
    { heading: "What is Replace Page?", content: [
      { type: "paragraph", text: `Replace Page swaps a specific page in a PDF with a page from a different PDF file. You specify the target page number (in the main document) and the source page number (in the replacement file), and the tool substitutes one for the other while keeping all other pages intact.` },
      { type: "paragraph", text: `The tool uses pdf-lib to load both documents, copy pages from each according to your specifications, and write a new PDF where the target page has been replaced. All pages before and after the target are copied unchanged from the main document.` },
      { type: "paragraph", text: `The replacement page retains its original dimensions. If the source and target pages have different sizes, the output document will have mixed page sizes at that position. All other pages maintain their original dimensions from the main document.` },
    ]},
    { heading: "How to Use Replace Page", content: [
      { type: "list", items: [
        `Drop the <strong>main PDF</strong> onto the upload zone — this is the document you want to modify. The tool reads it and displays the total page count.`,
        `Upload a <strong>source PDF</strong> — this contains the replacement page. The tool reads it separately and determines its page count.`,
        `Enter the <strong>target page number</strong> (in the main document) — the page you want to replace. This is 1-based. For example, entering 5 replaces the 5th page.`,
        `Enter the <strong>source page number</strong> (in the replacement file) — the page you want to use as the replacement. This is also 1-based. If the replacement PDF has multiple pages, you choose which one to use.`,
        `Click <strong>Replace Page</strong>. The tool copies all pages from the main document except the target, inserting the source page at the target position instead.`,
        `A download button appears with your file, named <code>replaced.pdf</code>. The output is identical to the main document except for the single replaced page.`,
      ]},
    ]},
    { heading: "Why Use Replace Page?", content: [
      { type: "paragraph", text: `When a single page in a multi-page document needs updating — a corrected chart, a revised signature page, or a fixed scan — replacing just that page is far faster than re-exporting the entire document from the source application.` },
      { type: "paragraph", text: `Legal teams use it to swap in corrected exhibits, and administrators use it to update individual pages in multi-department reports without redistributing the full document. This is especially valuable when the source application is unavailable or the original files are lost.` },
      { type: "paragraph", text: `Quality control workflows use page replacement to fix errors found during review — replacing a mis-scanned page, correcting a typo on a specific page, or updating a single chart that has changed since the original export.` },
    ]},
    { heading: "Privacy & Security", subHeading: "What if the replacement page is a different size?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading both documents, replacing the page, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What if the replacement page is a different size?", content: [
      { type: "paragraph", text: `The replacement page retains its original dimensions. If the source and target pages have different sizes, the output document will have mixed page sizes at that position. Review the result and consider using the Uniform Page Size tool if consistency is needed across all pages.` },
    ]},
    { heading: "", subHeading: "Can I replace multiple pages at once?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool replaces one page at a time. To replace multiple pages, run the tool once for each replacement. Process from the end of the document backward to avoid page number shifts affecting subsequent replacements.` },
    ]},
    { heading: "", subHeading: "Does the replacement preserve annotations and form fields?", content: [
      { type: "paragraph", text: `The replacement page is copied as-is from the source document. Its own annotations and form fields (if any) are included. The original page's annotations and fields are discarded. Annotations on other pages in the main document are unaffected.` },
    ]},
    { heading: "", subHeading: "Can I replace a page with one from the same document?", content: [
      { type: "paragraph", text: `Yes. Upload the same PDF as both the main and source document, then specify different page numbers. This effectively duplicates a page from one position to another.` },
    ]},
    { heading: "", subHeading: "What happens to the original page bookmarks?", content: [
      { type: "paragraph", text: `Bookmarks that pointed to the replaced page may become invalid since the page content has changed. Bookmarks pointing to other pages are unaffected.` },
    ]},
  ],
};
};

const seoRotateCustom: ToolSeo = {
  sections: [
    { heading: "What is Custom Rotation?", content: [
      { type: "paragraph", text: `Custom Rotation applies arbitrary rotation angles to PDF pages — not just the standard 90-degree increments. You can rotate pages by any angle (45°, 30°, 135°, etc.) and optionally apply different angles to specific pages using a per-page configuration.` },
      { type: "paragraph", text: `The tool uses pdf-lib to rotate each page by the specified angle. Unlike the standard Rotate tool (which only does 90°/180°/270°), this tool handles arbitrary angles useful for correcting tilted scans or creating diagonal layouts.` },
      { type: "paragraph", text: `Rotation is a metadata operation — it changes the page's rotation value without re-rendering the content. Text and images remain at their original resolution. The rotation affects how the page is displayed and printed, not its internal coordinate system.` },
    ]},
    { heading: "How to Use Custom Rotation", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool reads the document and determines the total page count.`,
        `Set the <strong>rotation angle</strong> in degrees (default: 45). Positive values rotate clockwise. Common values: 45° for diagonal correction, 90° for landscape-to-portrait, 180° for upside-down correction, 270° for portrait-to-landscape.`,
        `Optionally specify <strong>per-page rotations</strong> as a JSON object mapping page numbers to angles. For example: <code>{"1": 90, "3": 45, "5": 180}</code>. If provided, this overrides the global angle for those specific pages. All other pages use the global angle.`,
        `Click <strong>Rotate</strong>. The tool applies the rotation to every page (or the specified per-page angles) by modifying each page's rotation metadata.`,
        `A download button appears with your file, named <code>rotated-custom.pdf</code>. The rotation is applied — open the file in any reader to verify the pages display at the correct angle.`,
      ]},
    ]},
    { heading: "Why Use Custom Rotation?", content: [
      { type: "paragraph", text: `Scanned documents sometimes arrive tilted — the paper wasn't aligned perfectly on the scanner bed, or a phone photo was taken at a slight angle. Custom rotation corrects this, straightening the content without re-scanning.` },
      { type: "paragraph", text: `Designers use arbitrary rotation for creative layouts — angling content blocks, creating diagonal text overlays, or producing print-ready tiles that need specific angular alignment. The per-page option lets you apply different angles to different pages in a single operation.` },
      { type: "paragraph", text: `Mixed-orientation documents — where some pages need 45° correction and others need 90° — benefit from the per-page configuration. Rather than processing the document multiple times with different settings, you can fix all rotations in one pass.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Does arbitrary rotation reduce quality?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, rotating, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Does arbitrary rotation reduce quality?", content: [
      { type: "paragraph", text: `Rotation is a metadata operation — it changes the page's rotation value without re-rendering the content. Text and images remain at their original resolution. However, very large rotation angles on high-resolution pages may cause slight rendering artifacts in some readers due to how they handle non-standard rotation values.` },
    ]},
    { heading: "", subHeading: "When should I use this instead of the standard Rotate tool?", content: [
      { type: "paragraph", text: `Use the standard Rotate tool for 90°, 180°, and 270° rotations — it's simpler and guaranteed to work in all readers. Use Custom Rotation only when you need a non-standard angle like 45° or 135°. Standard rotation values have universal support; arbitrary angles may behave differently across readers.` },
    ]},
    { heading: "", subHeading: "Can I apply different angles to different pages?", content: [
      { type: "paragraph", text: `Yes. Use the per-page configuration option — a JSON object mapping page numbers to angles. For example, <code>{"1": 90, "3": 45}</code> rotates page 1 by 90° and page 3 by 45°, while all other pages use the global angle.` },
    ]},
    { heading: "", subHeading: "What angles are commonly used?", content: [
      { type: "paragraph", text: `90° for landscape-to-portrait, 180° for upside-down correction, 270° for portrait-to-landscape. For tilted scans, start with small angles (5-15°) and adjust visually.` },
    ]},
    { heading: "", subHeading: "Will all PDF readers handle non-standard rotations?", content: [
      { type: "paragraph", text: `Most modern readers (Acrobat, Preview, Edge, Chrome) handle arbitrary angles correctly. Some older readers may display non-90° rotations inaccurately. Test in your target reader.` },
    ]},
  ],
};
};

const seoSplitEveryN: ToolSeo = {
  sections: [
    { heading: "What is Split Every N Pages?", content: [
      { type: "paragraph", text: `Split Every N Pages breaks a PDF into multiple smaller files, each containing N pages. For example, with N=5, a 20-page document produces four 5-page files. The last chunk may contain fewer pages if the total isn't evenly divisible.` },
      { type: "paragraph", text: `The tool uses pdf-lib to load the source document, create new PDFs in chunks of N pages by copying page indices, and packages them into a zip archive using JSZip for a single download. Each chunk preserves the original page content, fonts, and formatting.` },
      { type: "paragraph", text: `The output files are named sequentially: <code>part-1.pdf</code>, <code>part-2.pdf</code>, etc. The zip archive contains all chunks, ready for distribution or archival.` },
    ]},
    { heading: "How to Use Split Every N Pages", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool reads the document and determines the total page count.`,
        `Set <strong>N</strong> — the number of pages per output file (default: 5). A 20-page document with N=5 produces 4 files. A 22-page document with N=5 produces 4 full files (5 pages each) plus 1 partial file (2 pages).`,
        `Click <strong>Split</strong>. The tool calculates the number of chunks, iterates through the source document in groups of N pages, creates a new PDF for each group by copying the relevant page indices, and packages all chunks into a zip archive.`,
        `A download button appears with your zip file, containing files named <code>part-1.pdf</code>, <code>part-2.pdf</code>, and so on. Extract the zip to access individual PDF files.`,
      ]},
    ]},
    { heading: "Why Use Split Every N Pages?", content: [
      { type: "paragraph", text: `Email and upload platforms often have file size or page count limits. Splitting a long document into fixed-size chunks makes it possible to share portions through restricted channels without sending the entire file.` },
      { type: "paragraph", text: `Review workflows benefit too: distributing different sections to different reviewers — chapters 1-5 to one person, 6-10 to another — is straightforward when the document is pre-split into equal chunks. Each reviewer receives only their assigned portion.` },
      { type: "paragraph", text: `Archival workflows use fixed-size splitting to create manageable file segments for storage systems that have per-file size limits or for backup systems that work better with smaller files.` },
    ]},
    { heading: "Privacy & Security", subHeading: "What happens to the last chunk if pages aren't evenly divisible?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, splitting, and packaging — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What happens to the last chunk if pages aren't evenly divisible?", content: [
      { type: "paragraph", text: `The last chunk contains whatever pages remain. A 22-page document split every 5 pages produces four 5-page files and one 2-page file. The partial chunk is included in the zip alongside the full chunks.` },
    ]},
    { heading: "", subHeading: "Do bookmarks and form fields carry over to the split files?", content: [
      { type: "paragraph", text: `Page content and formatting are preserved in each chunk. Bookmarks and form fields may not transfer correctly since they can reference pages in other chunks. If interactive elements are important, review the output and consider re-creating bookmarks with the Edit Bookmarks tool.` },
    ]},
    { heading: "", subHeading: "What format is the output?", content: [
      { type: "paragraph", text: `All chunks are packaged into a single zip archive. Each chunk is a standard PDF file with the original page quality preserved. Extract the zip to access individual files named <code>part-1.pdf</code>, <code>part-2.pdf</code>, etc.` },
    ]},
    { heading: "", subHeading: "Can I split a document into chunks of different sizes?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool creates equal-sized chunks (except the last). For custom-sized chunks, use the Extract Pages tool to pull specific page ranges.` },
    ]},
    { heading: "", subHeading: "Will the split files preserve the original page quality?", content: [
      { type: "paragraph", text: `Yes. Each chunk copies pages from the source without re-encoding. Text, images, and formatting are preserved at their original resolution in every output file.` },
    ]},
    { heading: "", subHeading: "How do I know which chunk contains a specific page?", content: [
      { type: "paragraph", text: `Calculate: chunk number = ceil(page number / N). For example, with N=5, page 12 is in chunk 3 (pages 11-15). The chunks are named sequentially as part-1.pdf, part-2.pdf, and so on, making it easy to find the right file.` },
    ]},
  ],
};
};

const seoSplitOddEven: ToolSeo = {
  sections: [
    { heading: "What is Split Odd / Even Pages?", content: [
      { type: "paragraph", text: `Split Odd / Even Pages separates a PDF into two files: one containing all odd-numbered pages (1, 3, 5, ...) and one containing all even-numbered pages (2, 4, 6, ...). Both files are packaged into a single zip for download.` },
      { type: "paragraph", text: `The tool uses pdf-lib to iterate through the source document, classify each page by its position (odd or even index), copy the pages into two separate PDFs, and package them into a zip archive. Page 1 (the first page) is classified as odd.` },
      { type: "paragraph", text: `The output files are named <code>odd-pages.pdf</code> and <code>even-pages.pdf</code>. Each contains only the pages from its classification, preserving the original page content and formatting.` },
    ]},
    { heading: "How to Use Split Odd / Even Pages", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool reads the document and determines the total page count.`,
        `Click <strong>Split Odd / Even</strong>. The tool iterates through every page, copies odd-indexed pages (1, 3, 5, ...) into one PDF and even-indexed pages (2, 4, 6, ...) into another, then packages both into a zip.`,
        `A download button appears with a zip file containing <code>odd-pages.pdf</code> and <code>even-pages.pdf</code>. Extract the zip to access the two separate files.`,
      ]},
    ]},
    { heading: "Why Use Split Odd / Even Pages?", content: [
      { type: "paragraph", text: `Double-sided scans capture front and back of each sheet as consecutive pages. Splitting odd and even separates the two sides into distinct files, making it easy to reassemble, review, or print one side at a time.` },
      { type: "paragraph", text: `Duplex printing workflows use this to send only one side of a document to the printer, or to print odd and even pages on separate paper stocks for specialized binding. This is common in bookbinding and professional printing.` },
      { type: "paragraph", text: `Review workflows benefit when different reviewers need to see different sides of a document — for example, a teacher reviewing student work on one side and answer keys on the other.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Is page 1 considered odd or even?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, sorting, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Is page 1 considered odd or even?", content: [
      { type: "paragraph", text: `Page 1 is the first page (index 0 in the document) and is classified as odd. The odd file starts with page 1, the even file starts with page 2. This matches the standard convention for duplex printing.` },
    ]},
    { heading: "", subHeading: "What if my document has an odd number of pages?", content: [
      { type: "paragraph", text: `The odd file will have one more page than the even file. A 7-page document produces an odd file with 4 pages (1, 3, 5, 7) and an even file with 3 pages (2, 4, 6). Both files are included in the zip regardless of size difference.` },
    ]},
    { heading: "", subHeading: "Can I split by page range instead of odd/even?", content: [
      { type: "paragraph", text: `For custom page ranges, use the Extract Pages tool instead. It lets you specify exactly which pages to keep (e.g. "1-5, 10-15") rather than the fixed odd/even classification.` },
    ]},
    { heading: "", subHeading: "Will the split files preserve bookmarks and annotations?", content: [
      { type: "paragraph", text: `Page content, images, and formatting are preserved in both output files. Bookmarks and annotations may not transfer correctly since they can reference pages in the other file.` },
    ]},
    { heading: "", subHeading: "How do I reassemble the odd and even files?", content: [
      { type: "paragraph", text: `Use the Merge tool to combine them back into a single document. For standard duplex reassembly, merge the odd file first, then the even file — this interleaves the pages back into their original order. You can also use the Multi-Tool for visual drag-and-drop reassembly if you need to verify the page order.` },
    ]},
    { heading: "", subHeading: "Can I print only one side after splitting?", content: [
      { type: "paragraph", text: `Yes. Open odd-pages.pdf or even-pages.pdf directly in your reader and print. Each file contains only one side, so you can print just fronts or just backs without wasting paper.` },
    ]},
  ],
};
};

const seoTableOfContents: ToolSeo = {
  sections: [
    { heading: "What is Table of Contents?", content: [
      { type: "paragraph", text: `Table of Contents reads the existing bookmark/outline structure from a PDF and lets you edit, add, or remove entries to create a navigable table of contents. The TOC appears in the PDF reader's navigation panel as clickable links that jump to specific pages.` },
      { type: "paragraph", text: `The tool uses pdf.js to extract the current outline tree, displays it in an interactive editor, and writes the modified structure back using pdf-lib. You can restructure the hierarchy, rename entries, and add new bookmarks that weren't in the original document.` },
      { type: "paragraph", text: `The TOC is implemented through the PDF's outline dictionary — the same mechanism used by bookmarks. A well-structured TOC makes long documents navigable, allowing readers to jump directly to chapters, sections, or subsections without scrolling.` },
    ]},
    { heading: "How to Use Table of Contents", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool loads the PDF using pdf.js and extracts the existing outline tree.`,
        `The tool displays the current table of contents as a hierarchical list. Each entry shows its title and target page number. If the document has no existing TOC, the tool shows "No table of contents found" with an option to create one from scratch.`,
        `To <strong>add</strong> an entry, click the "+" button and provide a title (e.g. "Chapter 3: Results") and a target page number. The new entry appears at the end of the list.`,
        `To <strong>edit</strong> an entry, click its title and type a new one. This is useful when exported documents have generic titles that don't reflect the actual content.`,
        `To <strong>restructure</strong>, drag entries to reorder or nest them under parent items. Indentation shows the hierarchy — a sub-section appears indented under its parent chapter. You can nest multiple levels deep.`,
        `To <strong>remove</strong> an entry, click the delete icon. This removes the entry from the outline dictionary without affecting any page content.`,
        `Click <strong>Save Table of Contents</strong>. The tool writes the modified structure back into the PDF.`,
        `A download button appears with your file, named <code>with-toc.pdf</code>. Open it in any PDF reader to verify the TOC appears in the navigation panel.`,
      ]},
    ]},
    { heading: "Why Use Table of Contents?", content: [
      { type: "paragraph", text: `PDFs without a table of contents force readers to scroll manually through the entire document. Adding a TOC — especially for reports, manuals, and academic papers — makes navigation instant and professional. A reader can jump to any section with a single click.` },
      { type: "paragraph", text: `Exported documents often lose their original TOC or arrive with outdated entries. This tool rebuilds or updates the structure without re-exporting from the source application, saving time when the original files are unavailable.` },
      { type: "paragraph", text: `Academic theses, long manuals, and multi-chapter reports all benefit from a navigable TOC — readers expect to jump to sections by clicking rather than scrolling through hundreds of pages manually.` },
    ]},
    { heading: "Privacy & Security", subHeading: "What if my PDF has no existing table of contents?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the outline tree, editing, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What if my PDF has no existing table of contents?", content: [
      { type: "paragraph", text: `The tool starts with an empty outline. You can add entries from scratch by clicking "+" for each section you want to include in the TOC. Enter a descriptive title and the target page number — the tool builds the structure from your entries.` },
    ]},
    { heading: "", subHeading: "Can I create nested (hierarchical) entries?", content: [
      { type: "paragraph", text: `Yes. Drag an entry under another to make it a child. The hierarchy appears as an indented tree in the PDF reader's navigation panel, just like a book's table of contents with chapters and sub-sections. You can nest multiple levels deep.` },
    ]},
    { heading: "", subHeading: "What's the difference between this and Edit Bookmarks?", content: [
      { type: "paragraph", text: `They operate on the same underlying data (the PDF's outline dictionary) through similar interfaces. The Table of Contents tool is optimized for creating structured, hierarchical navigation — it's the better choice when building a TOC from scratch. Edit Bookmarks is better for quick modifications to existing bookmarks.` },
    ]},
  ],
};
};

const seoTintPages: ToolSeo = {
  sections: [
    { heading: "What is Tint Pages?", content: [
      { type: "paragraph", text: `Tint Pages overlays a semi-transparent color rectangle on every page of a PDF, giving the document a colored tint. You choose the color (as a hex value like #ffff00 for yellow) and the opacity (0 to 1), and the tool draws a filled rectangle over each page's media box.` },
      { type: "paragraph", text: `The tool uses pdf-lib to draw a colored rectangle with the specified opacity on top of each page's content. The underlying content remains visible through the tint, creating a color-wash effect. The default color is yellow (#ffff00) with opacity 0.1, producing a subtle warm tint.` },
      { type: "paragraph", text: `The tint is drawn as a content element — it appears in both on-screen viewing and printed output. The opacity controls how much the original content shows through: 0.1 is barely visible, 0.3 is noticeable, and 1.0 completely obscures the content.` },
    ]},
    { heading: "How to Use Tint Pages", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Choose a <strong>color</strong> by entering a hex value (e.g. <code>#ffff00</code> for yellow, <code>#ff0000</code> for red, <code>#00ff00</code> for green, <code>#0000ff</code> for blue). The default is yellow. You can use any valid 6-digit hex color code.`,
        `Set the <strong>opacity</strong> — a value between 0 (invisible) and 1 (fully opaque). The default is 0.1, which gives a subtle tint. Values between 0.05 and 0.2 are typical for color-wash effects. Higher values make the color more prominent but obscure more of the underlying content.`,
        `Click <strong>Apply Tint</strong>. The tool loads the PDF, converts the hex color to RGB values, and draws a filled rectangle over each page's media box with the specified opacity.`,
        `A download button appears with your file, named <code>tinted.pdf</code>. The tint is permanently part of the page content — it appears in both on-screen viewing and printed output.`,
      ]},
    ]},
    { heading: "Why Use Tint Pages?", content: [
      { type: "paragraph", text: `Color-coding document sections by tint — yellow for drafts, blue for final versions, red for confidential — makes the document's status visually obvious at a glance without adding text watermarks. This is faster and less intrusive than adding "DRAFT" stamps to every page.` },
      { type: "paragraph", text: `Designers use tinting to create mood-washed PDFs for presentations, mood boards, or visual portfolios where a subtle color overlay unifies the aesthetic across pages. A light blue tint on architectural plans, or a warm yellow on vintage-style documents, creates a cohesive visual theme.` },
      { type: "paragraph", text: `Accessibility workflows use tinting to create high-contrast versions of documents — for example, adding a light yellow tint to reduce eye strain for readers with light sensitivity, or a blue tint for night-mode reading.` },
    ]},
    { heading: "Privacy & Security", subHeading: "Does the tint cover the content completely?", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, tinting, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Does the tint cover the content completely?", content: [
      { type: "paragraph", text: `No. The tint is semi-transparent by default (opacity 0.1), so the underlying content remains fully visible. Only at opacity 1.0 does the color completely obscure the content. At typical values (0.05-0.2), the tint is a subtle color wash that doesn't interfere with readability.` },
    ]},
    { heading: "", subHeading: "Can I tint only some pages?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool applies the tint to every page. To tint only specific pages, split the document using the Split tool, tint the relevant portion, and recombine with Merge.` },
    ]},
    { heading: "", subHeading: "What hex colors work?", content: [
      { type: "paragraph", text: `Any valid 6-digit hex color code works. Examples: <code>#ffff00</code> (yellow), <code>#ff0000</code> (red), <code>#00ff00</code> (green), <code>#0000ff</code> (blue), <code>#ff8800</code> (orange), <code>#8800ff</code> (purple). The hash symbol is optional — both "#ffff00" and "ffff00" work.` },
    ]},
    { heading: "", subHeading: "Will the tint affect printing?", content: [
      { type: "paragraph", text: `Yes. The tint is part of the page content, so it will appear in printed output. If you want the tint only for on-screen viewing, you would need to remove it before printing. For print-only use, consider using the reader's display settings instead of a permanent tint.` },
    ]},
  ],
};
};
