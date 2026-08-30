/**
 * Editorial SEO content for individual tool pages.
 *
 * Structure is strictly `<h2>` + `<p>` — no lists, no headers formatted as
 * questions. Each tool's content is split into the six required movements:
 * what & why / how it works / understanding output / use cases / tips /
 * FAQ-woven-into-prose. Target 1500–2000 words per tool.
 *
 * Content for tools outside the active batches is generated on demand from
 * `genericSeo(tool)` so every tool has a full, non-empty SEO block from day
 * one; we replace those with hand-written editorial as each batch ships.
 */
import type { Tool } from "@/domains/pdf/registry/tools";

export interface SeoContentBlock {
  type: "paragraph" | "list";
  text?: string;
  items?: string[];
}

export interface SeoSection {
  heading: string;
  subHeading?: string;
  paragraphs?: string[];
  content?: SeoContentBlock[];
}

export interface ToolSeo {
  sections: SeoSection[];
}

/* ───────────────────────────── Batch 1 ───────────────────────────── */

const mergeSeo: ToolSeo = {
  sections: [
    {
      heading: "Why merging PDF files matters",
      paragraphs: [
        "Working with a dozen separate PDF files is rarely the goal. Contracts arrive as individual documents, scanned receipts pile up across folders, and research material spreads across chapters that all belong together. A reliable merge tool collapses that scattered material into a single, navigable file that reads in the order you intend, with one consistent set of bookmarks and one download to share. It is one of the most common reasons people reach for a PDF utility in the first place.",
        "Racira's Merge PDF tool handles this entirely in your browser. There is no upload step, no waiting in a server queue, and no copy of your document left behind on someone else's disk. You drag the files in, arrange them, and produce a combined PDF that is byte-for-byte assembled on your own machine. For anything confidential — legal paperwork, medical records, financial statements — that privacy guarantee is not a nice-to-have, it is the whole point.",
        "Because the work happens locally, it is also fast. Small documents combine in well under a second, and even large multi-file merges finish in moments because nothing is travelling across your network. The result is a tool that behaves the way you expect a desktop application to behave, delivered through a web page.",
      ],
    },
    {
      heading: "How the merge process works",
      paragraphs: [
        "Start by adding the PDF files you want to combine. You can drop them onto the upload zone, click to browse, or add more at any time before you run the merge. Each file appears in a list with its name and size, and crucially you can drag rows to reorder them. The order of that list is exactly the order the pages will appear in your final document, so getting the sequence right is simply a matter of moving files up or down.",
        "When you click Merge PDFs, the tool opens each source document, copies its pages in the order you specified, and writes them into a fresh PDF. Bookmarks, form fields, and embedded fonts are carried along faithfully, so a merged contract package keeps its internal structure intact. Nothing is uploaded during this step — the assembly uses a PDF engine compiled to run inside your browser.",
        "Once processing finishes, a download button appears with your combined file, automatically named so it is easy to find. If you need to merge a different set, the Process Another option clears the workspace so you can start over without reloading the page. There is no file count to track, no daily limit, and no account.",
      ],
    },
    {
      heading: "Understanding your merged output",
      paragraphs: [
        "The downloaded file is a standard, fully self-contained PDF that opens in any reader. Page numbers continue sequentially from the first source file to the last, and the overall page count is the sum of the source documents. If one of your inputs had its own bookmarks, those travel into the merged file alongside the new content.",
        "It is worth knowing that a merge combines pages, not form-field definitions. If you are assembling fillable forms, expect the visible content to carry over correctly while interactive field behaviour may need a final review. For the vast majority of use cases — reports, scanned pages, exported documents — the merged output is exactly the clean, ordered file you wanted.",
      ],
    },
    {
      heading: "Common situations where merging saves time",
      paragraphs: [
        "Legal and administrative work is the classic case. A closing package, a visa application, or a grant submission often requires a cover letter, supporting evidence, and signed forms to travel together as one file. Merging lets you assemble that packet in the right order and submit a single attachment instead of a zip archive the recipient has to unpack.",
        "Students and researchers run into the same need. Combining lecture notes, article chapters, and your own annotations into one study document makes revision far easier, and merging a thesis from per-chapter exports keeps the final submission tidy. Designers and administrative teams use it for portfolios and monthly report packs, where dozens of exports become one shareable deliverable.",
      ],
    },
    {
      heading: "Tips for a clean, professional result",
      paragraphs: [
        "Give some thought to order before you merge. Reordering after the fact means re-merging, so spend a few seconds dragging files into the exact sequence you want — cover first, appendices last, and so on. Naming your source files clearly before you add them makes that reordering much faster, since you will recognise each file at a glance.",
        "If a source file is the wrong orientation or has stray pages, fix it with the rotate or delete tools first, then merge the cleaned pieces. Merging is a combining operation, not a correcting one, so it pays to prepare each input. Finally, because everything stays on your device, you can merge, review, and re-merge as many times as you like without ever worrying about a usage cap or a file being stored remotely.",
      ],
    },
  ],
};

const splitSeo: ToolSeo = {
  sections: [
    {
      heading: "When splitting a PDF is the right move",
      paragraphs: [
        "A single large PDF is convenient for storage but awkward for sharing and editing. You might need to send just one chapter of a report, hand over only the relevant pages of a contract, or break a scanned book into manageable sections. Splitting lets you extract exactly the portion you need and leave the rest behind, producing smaller, purpose-built files that are easier to email, store, and read.",
        "Racira's Split PDF tool does all of this in your browser. Your document never leaves your device — there is no upload and no server copy — which matters enormously when the source contains sensitive information. The tool reads the PDF locally, identifies its pages, and writes one or more new files depending on how you choose to split.",
      ],
    },
    {
      heading: "How splitting works",
      paragraphs: [
        "After you add a PDF, the tool shows the total page count so you know what you are working with. You then choose a mode. You can split into individual pages, where every page becomes its own one-page PDF, or you can specify a custom range such as the first three pages followed by specific later ones. The range option is ideal when you know precisely which pages matter.",
        "When you click Split PDF, the engine copies the chosen pages into new documents and bundles the results. Splitting into individual pages produces a zip archive containing one file per page, neatly named so you can find the page you want afterward. A range split produces a single new PDF containing only the pages you selected. Either way, the operation runs locally and finishes quickly.",
        "A download button appears as soon as processing completes, with the result named so it is easy to identify. You can split again with different settings using Process Another, without ever reloading the page or hitting a limit.",
      ],
    },
    {
      heading: "Understanding what you get back",
      paragraphs: [
        "If you split into individual pages, expect a zip file. Extracting it gives you one PDF per page, each preserving the original page's content, orientation, and formatting. This is perfect for sharing a single page from a long document without revealing the rest, or for picking a few pages to recombine later.",
        "If you split by range, you receive a single PDF made of only the pages you kept. Its page count reflects your selection rather than the original, and the content is byte-for-byte copied from the source, so quality and formatting are preserved. Neither option degrades images or text — splitting is a lossless operation.",
      ],
    },
    {
      heading: "Practical scenarios for splitting",
      paragraphs: [
        "Sharing is the most common reason. Email attachments and upload forms often have size limits, and a fifty-page scanned document rarely fits. Splitting off the relevant section means you send only what the recipient needs, and nothing more. It is also the polite way to share — nobody wants to scroll through a hundred pages to find the two that matter.",
        "Archiving and review benefit too. Breaking a long report into chapter-length files makes it easier to read on a phone, easier to annotate individually, and easier to distribute to different reviewers. Legal professionals use range splits to produce excerpts for filings, and students use them to pull a single article out of a course pack.",
      ],
    },
    {
      heading: "Getting the split right the first time",
      paragraphs: [
        "Check the page count before you choose a mode. If you only need a handful of pages from a long document, a range split is faster and tidier than splitting everything and then deleting the rest. Count pages carefully when you type a range — the tool validates your input, but a quick double-check saves a re-run.",
        "Remember that splitting into individual pages produces many files, which is great for selective sharing but can be noisy if you only needed two. Match the mode to your actual goal, and use the page preview to confirm your selection before you run the split. Because the whole operation is local and free, you can experiment with different splits until the output is exactly what you want.",
      ],
    },
  ],
};

const compressSeo: ToolSeo = {
  sections: [
    {
      heading: "Why PDF files grow large",
      paragraphs: [
        "PDFs become unwieldy for predictable reasons. High-resolution images embedded directly into the file, scanned pages saved as full-page photographs, unused fonts and objects left over from the authoring tool, and duplicated resources across pages all inflate the final size. A document that should be a megabyte can easily balloon to ten or more, which makes it painful to email, slow to open, and expensive to store.",
        "Compressing a PDF shrinks that footprint without changing what the document looks like on screen. The goal is to remove or downsample what the reader cannot perceive — redundant objects, oversized images, and structural overhead — so the visible content stays essentially identical while the file becomes far smaller. Done well, compression is nearly invisible to the eye but transformative for file size.",
        "Racira's Compress PDF tool performs this reduction entirely in your browser. Nothing is uploaded, which means sensitive documents stay private and the operation is fast because there is no network round-trip. You choose a compression level, and the tool produces a leaner version of your file on your own machine.",
      ],
    },
    {
      heading: "How compression works here",
      paragraphs: [
        "After you add a PDF, the tool shows the original size and, for each compression level, an estimated output size and reduction percentage. These estimates guide your choice: aggressive compression yields the smallest file at some cost to image fidelity, while gentler settings preserve quality at the expense of size. For most documents, the recommended middle setting hits the sweet spot.",
        "When you click Compress PDF, the engine rewrites the document, stripping unused objects and re-saving its structure efficiently. For image-heavy PDFs, higher compression levels additionally downsample embedded images so they occupy less space while remaining perfectly readable. The entire process happens locally using a PDF library compiled for the browser.",
        "A download button appears once compression completes, and the result is named clearly so you can compare it side by side with the original. If the balance of size and quality is not quite right, Process Another lets you try a different level — there is no limit on attempts.",
      ],
    },
    {
      heading: "Understanding the compressed result",
      paragraphs: [
        "The output is a standard PDF that opens in any reader, with a smaller file size than the original. Text remains crisp and selectable throughout, because compression targets overhead and image data rather than vector text. For scanned documents, expect more dramatic reductions because those files are essentially large images, which have the most room to shrink.",
        "It helps to set expectations: compression trades size against fidelity, so extremely aggressive settings on an image-heavy file may introduce subtle softening in photographs. The recommended level is tuned to avoid visible quality loss for typical documents, and you can always compare the compressed file against the original before deciding whether to keep it.",
      ],
    },
    {
      heading: "When compression earns its keep",
      paragraphs: [
        "Email and upload limits are the everyday trigger. A CV, a portfolio, or a grant application that exceeds an attachment cap simply will not send, and compressing it down to size is far faster than re-exporting from the original application. Web publishers face the same constraint when attaching PDFs to articles or product pages, where every megabyte slows the page.",
        "Storage and archival benefit too. Compressing a library of scanned receipts, invoices, or reference documents before filing them away reduces long-term storage costs and makes the archive faster to browse. Teams that exchange documents frequently find that smaller files move through review and approval workflows with noticeably less friction.",
      ],
    },
    {
      heading: "Choosing the right compression level",
      paragraphs: [
        "Start with the recommended level for documents that mix text and images. It produces a meaningfully smaller file while keeping text sharp and images clearly readable, which covers the majority of real-world PDFs. Reserve the extreme setting for files where size is the overriding concern — perhaps a scanned archive destined for cold storage — and accept that photographs may soften slightly.",
        "For documents where visual fidelity is paramount, such as a design portfolio or a print-ready proof, choose the highest quality level. You will still reclaim the overhead from unused objects and structural waste, which can be substantial on its own, without touching the visible imagery. Because compression runs locally and without limits, you can run each level and keep the one that best fits your needs.",
      ],
    },
  ],
};

const rotateSeo: ToolSeo = {
  sections: [
    {
      heading: "Why pages end up sideways",
      paragraphs: [
        "Rotated pages are a remarkably common annoyance. Scanners capture a page in the orientation it was fed, phones photograph documents at whatever angle felt natural, and exporting tools sometimes apply a landscape layout to a portrait page or vice versa. The result is a PDF that reads correctly only if you tilt your head, which is frustrating for you and worse for whoever you share it with.",
        "Rotating fixes exactly this. It reorients individual pages — or the whole document — so that every page reads upright, without altering the underlying content. Text, images, and layout all remain intact; only the viewing angle changes. A good rotate tool lets you fix a single misbehaving page or correct an entire document in one motion.",
        "Racira's Rotate Pages tool does this in your browser. Your file is never uploaded, so private documents stay private, and the rotation is applied locally and instantly. You see thumbnails of every page, choose a direction, and produce a corrected PDF on your own machine.",
      ],
    },
    {
      heading: "How rotation works",
      paragraphs: [
        "After you add a PDF, the tool generates a thumbnail for each page so you can see at a glance which ones need attention. You can rotate every page at once, which is ideal when an entire scanned document came through sideways, or you can target specific pages when only a few are off. The rotation controls offer ninety-degree clockwise, ninety-degree counter-clockwise, and a full one-hundred-eighty-degree flip.",
        "When you click Apply Rotation, the engine writes the chosen rotation into each page's metadata. The content itself is not re-rendered or re-encoded, so quality is perfectly preserved — rotation is a metadata operation, not a re-draw. The whole process runs locally using a browser-based PDF engine.",
        "Once complete, a download button provides your corrected file, clearly named. If you need to fix a different document or try a different rotation, Process Another resets the workspace instantly, with no reload and no limit.",
      ],
    },
    {
      heading: "Understanding the rotated output",
      paragraphs: [
        "The result is a standard PDF in which the selected pages now display in their new orientation in every compliant reader. Because rotation is stored as page metadata rather than baked into the pixels, the file size is essentially unchanged and there is no generation loss — the text and images are identical to the source, merely viewed from a different angle.",
        "One subtlety worth knowing: rotation affects how a page is displayed and printed, not its internal coordinate system, so form fields and links continue to work as expected. If you rotate a page and later combine it with others, the rotation travels with it, keeping your corrected document consistent throughout any downstream editing.",
      ],
    },
    {
      heading: "Where rotation earns its place",
      paragraphs: [
        "Scanned documents are the headline use case. A stack fed through a sheet-fed scanner often emerges with a few pages upside down or sideways, and a quick rotation pass produces a clean, uniformly oriented file. Photographers and archivists rely on the same fix when digitising material with a phone camera, where holding the device naturally does not always match the page's intended orientation.",
        "Mixed-orientation documents benefit too. A report that combines a portrait cover page with landscape charts and tables often arrives with the landscape pages rotated inconsistently; a targeted rotation pass brings the whole document into a consistent reading flow before you share or print it.",
      ],
    },
    {
      heading: "Tips for a uniform document",
      paragraphs: [
        "Use the thumbnails to plan before you rotate. They make it obvious which pages are wrong and in which direction, so you can decide whether a single global rotation or a few targeted fixes is the faster path. For a document that is entirely sideways, rotating all pages at once is dramatically quicker than fixing them one by one.",
        "If your PDF mixes portrait and landscape content intentionally — a landscape chart between portrait pages, say — rotate only the pages that are genuinely mis-oriented, leaving the deliberate landscape pages as they are. The goal is a document that reads naturally, and because rotation is lossless and local, you can apply it, review the result, and re-apply until every page sits exactly upright.",
      ],
    },
  ],
};

/* ─────────────────── Generic fallback (all other tools) ───────────────────
 * Provides a complete, well-formed SEO block for every catalog tool that
 * does not yet have hand-written content. Replaced as batches ship. */

function describeVerb(tool: Tool): string {
  const n = tool.name.toLowerCase();
  if (n.includes("merge")) return "combine";
  if (n.includes("split")) return "separate";
  if (n.includes("compress") || n.includes("reduce") || n.includes("optimize")) return "reduce";
  if (n.includes("convert")) return "convert";
  if (n.includes("extract")) return "extract";
  if (n.includes("delete") || n.includes("remove")) return "remove";
  if (n.includes("add") || n.includes("insert")) return "add";
  if (n.includes("rotate")) return "rotate";
  if (n.includes("protect") || n.includes("lock") || n.includes("encrypt")) return "protect";
  if (n.includes("unlock") || n.includes("decrypt")) return "unlock";
  if (n.includes("view") || n.includes("inspect") || n.includes("counter") || n.includes("checker")) return "inspect";
  return "transform";
}

function genericSeo(tool: Tool): ToolSeo {
  const verb = describeVerb(tool);
  const lower = tool.name.toLowerCase();
  return {
    sections: [
      {
        heading: `An overview of ${tool.name}`,
        paragraphs: [
          `${tool.name} is a focused utility that helps you ${verb} PDF documents quickly and without friction. ${tool.description}. Rather than reaching for heavyweight desktop software or handing your file to an unfamiliar upload service, you can accomplish the task directly in your browser with a tool that does one thing well.`,
          `What sets this tool apart is that every step happens on your own device. The PDF you provide is read, processed, and written back to you without ever being transmitted to a remote server, which makes it suitable for sensitive documents you would rather not trust to a third party. There is no account to create, no queue to wait in, and no limit on how often you use it.`,
          `Because the processing is local, it is also responsive. Small documents finish in the blink of an eye, and even larger files complete promptly since nothing is travelling across your network. The result is an experience closer to a polished desktop application than a typical web utility.`,
        ],
      },
      {
        heading: `How ${tool.name} works`,
        paragraphs: [
          `The workflow follows a familiar pattern. You add the PDF you want to work with using the upload zone, where it is loaded directly into your browser's memory. Depending on the tool, you may then adjust a few options that control how the output is produced. A clearly labelled action button runs the operation only when you click it — nothing happens automatically the moment you select a file, so you stay in full control.`,
          `Under the hood, the tool relies on a PDF engine compiled to run inside the browser. That engine opens your document, applies the requested ${verb} operation, and writes a fresh file containing the result. Throughout, the original file remains untouched on your disk; the tool works on an in-memory copy and offers you the new file for download.`,
          `When processing completes, a download button appears with the result, named so it is easy to find in your downloads folder. If the output is not quite what you wanted, or you need to process a different document, a single click clears the workspace so you can begin again without reloading the page.`,
        ],
      },
      {
        heading: `Understanding the output`,
        paragraphs: [
          `The file you receive back is a standard PDF that opens in any modern reader, retaining the content and formatting of the source unless the operation itself intentionally changes them. For tools that modify a document — such as those that ${verb} pages — the visible result reflects your choices, while the underlying quality of text and images is preserved.`,
          `It is worth reviewing the output against your expectations before sharing it, particularly for operations that alter page structure. Because the tool is fast and free to reuse, iterating until the result is exactly right costs nothing but a few seconds of your time.`,
        ],
      },
      {
        heading: `Common reasons to reach for this tool`,
        paragraphs: [
          `People turn to a tool like this in a handful of recurring situations. Professionals use it to prepare documents for sharing, ensuring that what leaves their desk is clean, correct, and oriented the way a recipient expects. Students and researchers rely on it to tidy up material gathered from many sources into a consistent, readable form.`,
          `Anyone handling scanned or exported material benefits too, since those workflows routinely introduce small imperfections — a stray page, an odd orientation, an oversized file — that a targeted PDF utility can resolve in seconds. The common thread is the desire to ${verb} a document without installing software or surrendering it to an online upload box.`,
        ],
      },
      {
        heading: `Tips for the best results`,
        paragraphs: [
          `Spend a moment preparing your input. A document that is already close to what you want will produce a cleaner result than one you try to fix entirely through post-processing, so handle obvious issues — stray pages, the wrong orientation, an over-large file — before or alongside running the tool. The related tools listed nearby cover most of those preparatory steps.`,
          `Because every operation runs locally and without limits, you are free to experiment. Run the tool, inspect the output, and adjust your approach until the file meets your standard. There is no cost to a second attempt, and your documents never leave your device at any point in the process.`,
        ],
      },
    ],
  };
}

// ── Organize PDF batch ──
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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
    { heading: "Privacy & Security", content: [
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

// ── Convert from PDF batch ──
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
    { heading: "Privacy & Security", content: [
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

const seoPdfToBmp: ToolSeo = {
  sections: [
    { heading: "What is PDF to BMP?", content: [
      { type: "paragraph", text: `PDF to BMP renders every page of a PDF as a BMP (bitmap) image file. The tool uses pdf.js to draw each page onto a canvas at 2x resolution, extracts the raw pixel data, and packages the resulting BMP files into a zip archive for download.` },
      { type: "paragraph", text: `BMP is an uncompressed image format that preserves every pixel exactly — no quality loss from compression. The output files are named sequentially (page-1.bmp, page-2.bmp, etc.) and maintain the original page dimensions at double resolution.` },
      { type: "paragraph", text: `The rendering happens entirely in the browser using pdf.js's canvas output. Each page is drawn at a viewport scale of 2, producing images at twice the page's nominal resolution for crisp output on high-DPI displays.` },
    ]},
    { heading: "How to Use PDF to BMP", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Click <strong>Convert to BMP</strong>. The tool loads the PDF using pdf.js, iterates through every page, renders each page onto an off-screen canvas at 2x scale, extracts the pixel data, and converts it to BMP format.`,
        `A progress indicator shows the rendering status as pages are processed. Each page is rendered individually, so larger documents take proportionally longer.`,
        `A download button appears with your zip file, named <code>pdf-to-bmp.zip</code>. Extract it to access individual BMP files, one per page.`,
      ]},
    ]},
    { heading: "Why Use PDF to BMP?", content: [
      { type: "paragraph", text: `BMP's uncompressed format is ideal when pixel-perfect fidelity matters — medical imaging, legal exhibits, or archival reproduction where even minor compression artifacts are unacceptable. Every pixel in the output matches the rendered page exactly.` },
      { type: "paragraph", text: `Some legacy systems and specialized software only accept BMP input. Converting PDF pages to BMP makes them compatible with these workflows without introducing format-related quality loss.` },
      { type: "paragraph", text: `Quality control teams use BMP output for visual comparison — the uncompressed format ensures that any differences between the original PDF and the rendered image are due to the PDF content itself, not compression artifacts.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering pages, converting to BMP, and packaging the zip — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Why are BMP files so large?", content: [
      { type: "paragraph", text: `BMP is uncompressed — it stores every pixel's color data directly. A single letter-size page at 2x resolution produces roughly 14MB. This is the tradeoff for pixel-perfect fidelity. For smaller files with minimal quality loss, use PNG or WebP instead.` },
    ]},
    { heading: "", subHeading: "Can I control the resolution?", content: [
      { type: "paragraph", text: `The tool renders at a fixed 2x scale. For higher or lower resolution, use the PDF to Image tool which offers more format options, or render the PDF in a tool that supports custom DPI settings.` },
    ]},
    { heading: "", subHeading: "Do the BMP files preserve text?", content: [
      { type: "paragraph", text: `The output is a raster image — text is rendered as pixels, not as selectable/searchable text. For text extraction, use the PDF Text Extractor tool instead. BMP is for visual reproduction, not text access.` },
    ]},
  ],
};

const seoPdfToCbz: ToolSeo = {
  sections: [
    { heading: "What is PDF to CBZ?", content: [
      { type: "paragraph", text: `PDF to CBZ converts every page of a PDF into a CBZ (Comic Book ZIP) archive — the standard format for digital comic storage. The tool renders each page as a PNG image at 2x resolution and packages them into a .cbz file, which is simply a ZIP archive with a .cbz extension.` },
      { type: "paragraph", text: `CBZ files are supported by all major comic book readers — ComicRack, CDisplayEx, YACReader, and mobile apps like Panels and ComicFlow. The format preserves page order and image quality, making it the preferred way to read PDF-based comics on dedicated reader apps.` },
      { type: "paragraph", text: `The rendering uses pdf.js to draw each page onto a canvas at 2x scale, then encodes the result as PNG. The PNG images are named sequentially (001.png, 002.png, etc.) to ensure correct page order in comic readers.` },
    ]},
    { heading: "How to Use PDF to CBZ", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF — comics, manga, graphic novels, or any multi-page document.`,
        `Click <strong>Convert to CBZ</strong>. The tool renders every page as a PNG image at 2x resolution and packages them into a .cbz archive with zero-padded sequential filenames.`,
        `A progress indicator shows the rendering status. Comic PDFs with many pages take proportionally longer due to the per-page canvas rendering.`,
        `A download button appears with your .cbz file, named after the original PDF (e.g. ` + "`comic.cbz`" + `). Open it directly in your comic reader app.`,
      ]},
    ]},
    { heading: "Why Use PDF to CBZ?", content: [
      { type: "paragraph", text: `Comic book readers are optimized for CBZ/CBR formats — they offer page-by-page navigation, bookmark support, reading-mode options (single page, double page, guided view), and library management that PDF readers lack. Converting to CBZ unlocks these features.` },
      { type: "paragraph", text: `Manga and comic fans who collect PDF scans often find that PDF readers handle page transitions poorly, lack landscape-reading modes, and don't track reading progress. CBZ in a dedicated reader solves all of these issues.` },
      { type: "paragraph", text: `Archival workflows use CBZ for standardized comic storage — the format is simple (just a ZIP of images), widely supported, and future-proof. Converting PDFs to CBZ ensures long-term readability across different devices and apps.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering pages, encoding PNGs, and packaging the CBZ — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What's the difference between CBZ and CBR?", content: [
      { type: "paragraph", text: `CBZ is a ZIP archive; CBR is a RAR archive. Both contain the same image files in the same order. CBZ is more widely supported and easier to create (ZIP is a simpler format). Most comic readers support both.` },
    ]},
    { heading: "", subHeading: "Why PNG instead of JPEG for the images?", content: [
      { type: "paragraph", text: `PNG preserves line art and flat colors without JPEG compression artifacts — critical for comics and manga where sharp lines and solid fills are essential. The file size is larger, but the visual quality is significantly better for this type of content.` },
    ]},
    { heading: "", subHeading: "Can I adjust the image quality or resolution?", content: [
      { type: "paragraph", text: `The tool renders at a fixed 2x scale with PNG encoding. For different resolution or format options, use the PDF to Image tool which offers more flexibility in output format and scale.` },
    ]},
  ],
};

const seoPdfToEpub: ToolSeo = {
  sections: [
    { heading: "What is PDF to EPUB?", content: [
      { type: "paragraph", text: `PDF to EPUB extracts text from a PDF and packages it into an EPUB (Electronic Publication) file — the standard open format for e-readers like Kindle, Kobo, Nook, and Apple Books. The tool extracts text content from each page, structures it with chapter markers, and wraps it in a valid EPUB container.` },
      { type: "paragraph", text: `The EPUB output includes proper metadata (title, creator), a table of contents based on page breaks, and text content formatted with basic HTML tags. It's designed for text-heavy PDFs — books, reports, and articles — where the goal is readable reflowable text rather than visual fidelity.` },
      { type: "paragraph", text: `The tool uses pdf.js for text extraction and JSZip to assemble the EPUB package (which is a ZIP with a specific structure). The output is a valid .epub file that opens in any EPUB reader.` },
    ]},
    { heading: "How to Use PDF to EPUB", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool works best with text-heavy PDFs (books, articles, reports).`,
        `Click <strong>Convert to EPUB</strong>. The tool extracts text from every page using pdf.js, wraps each page's content in HTML paragraph tags, structures the document with chapter markers at page breaks, and packages everything into a valid EPUB container.`,
        `A progress indicator shows the extraction status as pages are processed.`,
        `A download button appears with your file, named <code>converted.epub</code>. Open it in any EPUB reader — Kindle, Kobo, Apple Books, Calibre, or browser-based readers.`,
      ]},
    ]},
    { heading: "Why Use PDF to EPUB?", content: [
      { type: "paragraph", text: `PDFs are fixed-layout — they look the same on every screen but don't reflow for small displays. EPUB is reflowable — text adjusts to screen size, font preference, and reading mode. Converting a PDF book to EPUB makes it comfortable to read on phones and e-readers.` },
      { type: "paragraph", text: `E-reader users who receive PDF documents (course materials, research papers, manuals) often find them painful to read on a 6-inch screen. Converting to EPUB lets them use their device's native reading experience — adjustable fonts, night mode, bookmarks, and progress tracking.` },
      { type: "paragraph", text: `Accessibility benefits too: EPUB readers support text-to-speech, adjustable line spacing, and high-contrast modes that PDF readers often lack. Converting to EPUB makes content accessible to users with visual impairments.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text, structuring the EPUB, and packaging the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Will images from the PDF be included in the EPUB?", content: [
      { type: "paragraph", text: `Currently, the tool extracts text only. Images, tables, and complex layouts are not included in the EPUB output. For image-heavy PDFs, the tool produces a text-only EPUB. For visual fidelity, consider keeping the original PDF.` },
    ]},
    { heading: "", subHeading: "Does the EPUB have a table of contents?", content: [
      { type: "paragraph", text: `Yes. The tool creates a basic table of contents based on page breaks — each page becomes a chapter in the EPUB's navigation. This provides rough navigation, though it may not match the original PDF's bookmarks or structure.` },
    ]},
    { heading: "", subHeading: "Will the text encoding handle special characters?", content: [
      { type: "paragraph", text: `Yes. The EPUB uses UTF-8 encoding, which supports all standard characters including accented letters, non-Latin scripts, and special symbols. Text is extracted with full Unicode fidelity from the PDF.` },
    ]},
  ],
};

const seoPdfToHtml: ToolSeo = {
  sections: [
    { heading: "What is PDF to HTML?", content: [
      { type: "paragraph", text: `PDF to HTML converts a PDF document into an HTML file that can be opened in any web browser. The tool uses pdf.js to analyze the document's structure and content, then generates an HTML representation with text, basic formatting, and page separators.` },
      { type: "paragraph", text: `The output is a single self-contained HTML file with inline CSS — no external dependencies. It preserves the reading order of text content and includes page break markers to maintain document structure.` },
      { type: "paragraph", text: `This tool is optimized for text content. Complex layouts (multi-column, tables, images) may not render perfectly in the HTML output. For visual fidelity, the original PDF is more reliable.` },
    ]},
    { heading: "How to Use PDF to HTML", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to HTML</strong>. The tool analyzes the PDF structure using pdf.js, extracts text content and basic formatting, generates HTML markup with CSS styling, and produces a self-contained HTML file.`,
        `A progress indicator shows the conversion status as pages are processed.`,
        `A download button appears with your file, named <code>pdf-to-html.html</code>. Open it in any web browser — the file is self-contained with no external dependencies.`,
      ]},
    ]},
    { heading: "Why Use PDF to HTML?", content: [
      { type: "paragraph", text: `HTML files are universally viewable — every device with a web browser can open them without special software. Converting a PDF to HTML makes it accessible on devices that don't have PDF readers, or in environments where PDF rendering is restricted.` },
      { type: "paragraph", text: `Web publishing benefits too: embedding PDF content as HTML on a website makes it indexable by search engines, accessible to screen readers, and viewable without plugin downloads. The text becomes searchable and selectable in the browser.` },
      { type: "paragraph", text: `Developers and content managers use HTML output for web-based document viewers, content management systems, and email embedding where PDF attachment links are less convenient than inline HTML.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — analyzing the PDF, generating HTML, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Will the HTML preserve the PDF's visual layout?", content: [
      { type: "paragraph", text: `Partially. Simple single-column layouts translate well. Complex layouts (multi-column, text boxes, overlays) may not render identically. The HTML preserves reading order and basic formatting but not precise pixel-level positioning.` },
    ]},
    { heading: "", subHeading: "Can I edit the HTML output?", content: [
      { type: "paragraph", text: `Yes. The output is a standard HTML file that opens in any text editor or IDE. You can modify text, add styling, restructure content, or integrate it into a larger web page.` },
    ]},
    { heading: "", subHeading: "How does this differ from PDF to Word?", content: [
      { type: "paragraph", text: `PDF to HTML produces a web-viewable file; PDF to Word produces a .doc file for word processors. Both use similar extraction logic, but the output format determines which tools can open and edit the result.` },
    ]},
  ],
};

const seoPdfToImage: ToolSeo = {
  sections: [
    { heading: "What is PDF to Image?", content: [
      { type: "paragraph", text: `PDF to Image renders every page of a PDF as a JPG (JPEG) image file. The tool uses pdf.js to draw each page onto a canvas at 2x resolution, compresses the result as JPEG, and packages the images into a zip archive.` },
      { type: "paragraph", text: `JPEG is a lossy format that balances file size and visual quality. At 2x resolution, the output images are sharp enough for most uses while remaining significantly smaller than BMP or uncompressed formats. The default JPEG quality preserves text readability and image detail.` },
      { type: "paragraph", text: `The output files are named sequentially (page-1.jpg, page-2.jpg, etc.) and packaged into a single zip for easy download. Each image represents one page of the original PDF.` },
    ]},
    { heading: "How to Use PDF to Image", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it. The tool accepts any standard PDF regardless of page count.`,
        `Click <strong>Convert to Image</strong>. The tool renders every page as a JPG image at 2x resolution using pdf.js canvas output, then packages all images into a zip archive.`,
        `A progress indicator shows the rendering status as pages are processed.`,
        `A download button appears with your zip file, named <code>pdf-to-image.zip</code>. Extract it to access individual JPG files, one per page.`,
      ]},
    ]},
    { heading: "Why Use PDF to Image?", content: [
      { type: "paragraph", text: `JPG images are universally viewable — every device, browser, and operating system can display them without special software. Converting PDF pages to JPG makes them shareable on social media, embeddable in presentations, and mailable as attachments.` },
      { type: "paragraph", text: `Social media and messaging platforms often don't support PDF previews. Converting to JPG lets you share document pages as images that render inline in chats, emails, and social feeds.` },
      { type: "paragraph", text: `Designers use JPG output for mood boards, reference collections, and client presentations where individual page images are easier to arrange and annotate than PDF pages.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering pages, compressing to JPEG, and packaging the zip — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "How does JPG quality compare to PNG?", content: [
      { type: "paragraph", text: `JPG uses lossy compression — there's a slight quality tradeoff for smaller file sizes. For most documents, the difference is imperceptible. For line art or text-heavy content where sharp edges matter, use the PDF to PNG tool instead.` },
    ]},
    { heading: "", subHeading: "Can I control the JPEG quality?", content: [
      { type: "paragraph", text: `The tool uses a fixed quality setting optimized for document content. For custom quality control, use the PDF to BMP tool (uncompressed) or PDF to PNG tool (lossless), then convert to JPEG in an image editor.` },
    ]},
    { heading: "", subHeading: "Why are the images at 2x resolution?", content: [
      { type: "paragraph", text: `The 2x scale ensures text and fine details remain sharp. At 1x, small text can appear pixelated. The 2x resolution produces images that look crisp on both standard and high-DPI displays.` },
    ]},
  ],
};

const seoPdfToMarkdown: ToolSeo = {
  sections: [
    { heading: "What is PDF to Markdown?", content: [
      { type: "paragraph", text: `PDF to Markdown extracts text from a PDF and saves it as a Markdown (.md) file — a lightweight markup format widely used for documentation, README files, and note-taking apps like Obsidian, Notion, and Bear.` },
      { type: "paragraph", text: `The tool uses pdf.js to extract text content from each page, formats it with Markdown paragraph structure, and inserts page break markers (` + "`--- Page N ---`" + `) between pages. The result is a clean, readable text file in Markdown format.` },
      { type: "paragraph", text: `Markdown is plain text with minimal formatting syntax — it renders beautifully in any Markdown viewer while remaining fully editable in any text editor. This makes it ideal for content that needs to be both readable and modifiable.` },
    ]},
    { heading: "How to Use PDF to Markdown", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to Markdown</strong>. The tool extracts text from every page using pdf.js, formats the output with Markdown paragraph structure, and adds page break markers between pages.`,
        `A progress indicator shows the extraction status as pages are processed.`,
        `A download button appears with your file, named <code>pdf-to-markdown.md</code>. Open it in any Markdown viewer, text editor, or note-taking app.`,
      ]},
    ]},
    { heading: "Why Use PDF to Markdown?", content: [
      { type: "paragraph", text: `Markdown files are editable plain text — unlike PDFs, you can modify content directly in a text editor without specialized software. Researchers and writers use this to extract text from published papers for annotation, summarization, and integration into their own notes.` },
      { type: "paragraph", text: `Note-taking apps (Obsidian, Notion, Logseq) natively import Markdown. Converting a PDF to Markdown lets you pull its content into your personal knowledge base where it becomes searchable, linkable, and annotatable alongside your other notes.` },
      { type: "paragraph", text: `Documentation teams convert reference PDFs to Markdown so they can be version-controlled in Git, edited collaboratively, and rendered as both plain text and formatted web pages through static site generators.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text, formatting as Markdown, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Does the Markdown include formatting like bold or headings?", content: [
      { type: "paragraph", text: `Currently, the output is plain text with paragraph breaks — no bold, italic, or heading markup is extracted. The text content is preserved with correct reading order, but visual formatting from the PDF is not converted to Markdown syntax.` },
    ]},
    { heading: "", subHeading: "How does this differ from PDF to Text?", content: [
      { type: "paragraph", text: `Both extract text content, but the output format differs. PDF to Text produces a plain .txt file; PDF to Markdown produces a .md file with Markdown-compatible structure. The Markdown version is preferred by note-taking apps and documentation tools.` },
    ]},
    { heading: "", subHeading: "Can I extract text from specific pages only?", content: [
      { type: "paragraph", text: `Not directly — the tool extracts all pages. To get text from specific pages, first extract those pages using the Extract Pages tool, then convert the smaller document to Markdown.` },
    ]},
  ],
};

const seoPdfToOdt: ToolSeo = {
  sections: [
    { heading: "What is PDF to ODT?", content: [
      { type: "paragraph", text: `PDF to ODT converts a PDF document into an ODT (OpenDocument Text) file — the native format of LibreOffice Writer and compatible with OpenOffice, Google Docs, and other office suites. The tool extracts text content and structures it as ODT XML markup.` },
      { type: "paragraph", text: `The output preserves text content in reading order with page separators. It's designed for text-heavy PDFs where the goal is to get content into an editable word processor format, not for visual-faithful reproduction.` },
      { type: "paragraph", text: `ODT is an open standard — unlike .doc, it's fully specified and supported by multiple office suites. Converting to ODT ensures the output remains editable regardless of which office software you use.` },
    ]},
    { heading: "How to Use PDF to ODT", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to ODT</strong>. The tool extracts text from every page using pdf.js, wraps the content in ODT XML structure with paragraph formatting, and produces a valid ODT file.`,
        `A progress indicator shows the extraction status as pages are processed.`,
        `A download button appears with your file, named <code>converted.odt</code>. Open it in LibreOffice Writer, Google Docs, or any ODT-compatible word processor.`,
      ]},
    ]},
    { heading: "Why Use PDF to ODT?", content: [
      { type: "paragraph", text: `When you need to edit PDF content in a word processor but don't have Adobe Acrobat, converting to ODT gives you an editable file that opens in free software like LibreOffice Writer. You can modify text, add formatting, and re-export as PDF.` },
      { type: "paragraph", text: `Collaborative editing workflows benefit too — ODT files can be opened in Google Docs (via import) for real-time collaboration, something that PDF files don't support natively.` },
      { type: "paragraph", text: `Migration and archival teams use ODT conversion when transitioning from PDF-centric workflows to editable document management. The open format ensures long-term accessibility without vendor lock-in.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text, generating ODT XML, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Will the ODT preserve the PDF's formatting?", content: [
      { type: "paragraph", text: `Text content and reading order are preserved, but visual formatting (fonts, colors, precise layout) is not. The ODT contains plain text with basic paragraph structure. Complex layouts will need manual reformatting in the word processor.` },
    ]},
    { heading: "", subHeading: "Can I open the ODT in Microsoft Word?", content: [
      { type: "paragraph", text: `Yes, but with caveats. Word can open ODT files, though some formatting may not transfer perfectly. For best results with Word, use the PDF to Word tool instead, which produces a native .doc file.` },
    ]},
    { heading: "", subHeading: "How does this differ from PDF to Word?", content: [
      { type: "paragraph", text: `Both produce editable word processor files. ODT is open-standard (LibreOffice, OpenOffice); .doc is Microsoft's format. Choose ODT for open-source workflows, .doc for Microsoft-centric environments.` },
    ]},
  ],
};

const seoPdfToPng: ToolSeo = {
  sections: [
    { heading: "What is PDF to PNG?", content: [
      { type: "paragraph", text: `PDF to PNG renders every page of a PDF as a PNG (Portable Network Graphics) image file. The tool uses pdf.js to draw each page onto a canvas at 2x resolution, encodes the result as PNG, and packages the images into a zip archive.` },
      { type: "paragraph", text: `PNG is a lossless format — it preserves every pixel exactly without compression artifacts. This makes it ideal for text-heavy documents, line art, and graphics where sharp edges and clean colors are essential.` },
      { type: "paragraph", text: `The output files are named sequentially (page-1.png, page-2.png, etc.) and maintain the original page dimensions at double resolution for crisp rendering on high-DPI displays.` },
    ]},
    { heading: "How to Use PDF to PNG", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to PNG</strong>. The tool renders every page as a PNG image at 2x resolution using pdf.js canvas output, then packages all images into a zip archive.`,
        `A progress indicator shows the rendering status as pages are processed.`,
        `A download button appears with your zip file, named <code>pdf-to-png.zip</code>. Extract it to access individual PNG files, one per page.`,
      ]},
    ]},
    { heading: "Why Use PDF to PNG?", content: [
      { type: "paragraph", text: `PNG's lossless quality makes it the best choice for text-heavy PDFs, technical diagrams, and vector graphics rendered to raster. Unlike JPEG, there are no compression artifacts around text edges or in areas of flat color.` },
      { type: "paragraph", text: `Web publishing uses PNG for document screenshots and previews — the format supports transparency and renders crisply at any size. Blog posts, documentation, and social media often use PNG page images for visual references.` },
      { type: "paragraph", text: `Designers and illustrators use PNG output for archival reproduction where the rendered page must match the original pixel-for-pixel. The 2x resolution ensures the output is suitable for print at standard sizes.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering pages, encoding PNGs, and packaging the zip — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Why are PNG files larger than JPEG?", content: [
      { type: "paragraph", text: `PNG uses lossless compression — it preserves every pixel without discarding data. JPEG uses lossy compression that discards some detail for smaller files. PNG is larger but perfect; JPEG is smaller but slightly degraded. Choose based on whether quality or file size matters more.` },
    ]},
    { heading: "", subHeading: "Can I control the resolution?", content: [
      { type: "paragraph", text: `The tool renders at a fixed 2x scale. For custom resolution, use a PDF rendering tool that supports DPI settings, or resize the PNG output in an image editor after conversion.` },
    ]},
    { heading: "", subHeading: "Do PNG files support transparency?", content: [
      { type: "paragraph", text: `The output PNGs have an opaque white background (matching the PDF page). The PNG format supports transparency, but the rendering canvas fills the background with white before drawing the page content.` },
    ]},
  ],
};

const seoPdfToPowerpoint: ToolSeo = {
  sections: [
    { heading: "What is PDF to PowerPoint?", content: [
      { type: "paragraph", text: `PDF to PowerPoint renders every page of a PDF as a PNG image and packages them into a zip archive suitable for import into PowerPoint. Each page becomes a slide-sized image that can be inserted into a presentation.` },
      { type: "paragraph", text: `The tool uses pdf.js to render each page at 1.5x resolution — a scale optimized for PowerPoint's slide dimensions. The output is a zip of PNG files that you import into PowerPoint using Insert > Pictures, one image per slide.` },
      { type: "paragraph", text: `This is an image-based conversion — the output contains rendered page images, not editable text or shapes. The visual fidelity is high, but the content is not editable within PowerPoint.` },
    ]},
    { heading: "How to Use PDF to PowerPoint", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to PowerPoint</strong>. The tool renders every page as a PNG image at 1.5x resolution using pdf.js, then packages all images into a zip archive.`,
        `A progress indicator shows the rendering status as pages are processed.`,
        `A download button appears with your zip file, named <code>pdf-to-powerpoint.zip</code>. Extract it, then in PowerPoint: Insert > Pictures > select all PNGs > they become individual slides.`,
      ]},
    ]},
    { heading: "Why Use PDF to PowerPoint?", content: [
      { type: "paragraph", text: `When you receive a PDF presentation or report that you need to present, converting to PowerPoint lets you add slide transitions, speaker notes, and animations that PDF viewers don't support.` },
      { type: "paragraph", text: `Conference speakers and trainers often receive reference materials as PDFs and need to adapt them for live presentation. Converting to PowerPoint images gives them a starting point they can annotate, rearrange, and supplement with their own slides.` },
      { type: "paragraph", text: `Educational content conversion benefits too — lecture PDFs converted to PowerPoint slides can be presented with click-through animations and embedded in learning management systems that accept PPTX files.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering pages, encoding PNGs, and packaging the zip — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Is the output a real .pptx file?", content: [
      { type: "paragraph", text: `No. The output is a zip of PNG images. You import them into PowerPoint manually (Insert > Pictures). The images become slide backgrounds that you can overlay with text boxes, shapes, and annotations.` },
    ]},
    { heading: "", subHeading: "Can I edit the text in the slides?", content: [
      { type: "paragraph", text: `Not directly — the output is raster images, not editable text. You can add text boxes on top of the images, but the original text is baked into the pixels. For editable text, you'd need OCR or manual transcription.` },
    ]},
    { heading: "", subHeading: "Why 1.5x resolution instead of 2x?", content: [
      { type: "paragraph", text: `PowerPoint slides are typically displayed at lower resolution than print. 1.5x produces images that are sharp on screen while keeping file sizes manageable. The output is roughly 1440x1080 pixels per slide, which fits standard PowerPoint dimensions well.` },
    ]},
  ],
};

const seoPdfToRtf: ToolSeo = {
  sections: [
    { heading: "What is PDF to RTF?", content: [
      { type: "paragraph", text: `PDF to RTF converts a PDF document into an RTF (Rich Text Format) file — a widely compatible document format that opens in Microsoft Word, LibreOffice Writer, Google Docs, and virtually any word processor. The tool extracts text content and structures it with basic RTF formatting.` },
      { type: "paragraph", text: `The output includes a font table (defaulting to Arial), text content extracted from each page, and page break markers. RTF is a plain-text format that preserves basic text formatting while remaining editable across platforms.` },
      { type: "paragraph", text: `RTF is older than DOC/DOCX but more universally supported — it opens correctly in word processors that may struggle with ODT or have limited DOC support. This makes it a safe choice for cross-platform document exchange.` },
    ]},
    { heading: "How to Use PDF to RTF", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to RTF</strong>. The tool extracts text from every page using pdf.js, wraps the content in RTF syntax with font table and page breaks, and produces a valid RTF file.`,
        `A progress indicator shows the extraction status as pages are processed.`,
        `A download button appears with your file, named <code>converted.rtf</code>. Open it in any word processor — Word, Writer, Google Docs, or TextEdit.`,
      ]},
    ]},
    { heading: "Why Use PDF to RTF?", content: [
      { type: "paragraph", text: `RTF opens correctly in virtually every word processor ever made. When you need to get PDF text into an editable format but aren't sure what software the recipient has, RTF is the safest choice — it's universally supported.` },
      { type: "paragraph", text: `Legal and administrative workflows sometimes require documents in specific formats. RTF is accepted by many court filing systems and government portals that don't support newer formats like DOCX or ODT.` },
      { type: "paragraph", text: `Email and legacy system integration benefits from RTF — some older email clients and document management systems render RTF inline (showing formatted text directly in the email body) rather than requiring a download.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text, generating RTF syntax, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What formatting is preserved in the RTF?", content: [
      { type: "paragraph", text: `Text content and reading order are preserved. The RTF includes a font table (Arial by default) and basic paragraph structure. Complex formatting (bold, italic, colors, tables) from the original PDF is not extracted.` },
    ]},
    { heading: "", subHeading: "Can I open RTF in Microsoft Word?", content: [
      { type: "paragraph", text: `Yes. Word opens RTF files natively and renders them correctly. You can edit the text, add formatting, and save as DOC/DOCX. RTF is one of Word's most reliably supported import formats.` },
    ]},
    { heading: "", subHeading: "How does RTF differ from ODT?", content: [
      { type: "paragraph", text: `Both are editable document formats. RTF is older but more universally supported (opens in almost any word processor). ODT is the open standard preferred by LibreOffice. Choose RTF for maximum compatibility, ODT for open-source workflows.` },
    ]},
  ],
};

const seoPdfToTiff: ToolSeo = {
  sections: [
    { heading: "What is PDF to TIFF?", content: [
      { type: "paragraph", text: `PDF to TIFF renders every page of a PDF as a TIFF (Tagged Image File Format) image file. The tool uses pdf.js to draw each page onto a canvas at 2x resolution, encodes the result as TIFF, and packages the images into a zip archive.` },
      { type: "paragraph", text: `TIFF is a flexible image format widely used in publishing, printing, and archival workflows. It supports lossless compression, multiple pages per file, and extensive metadata — making it the preferred format for professional imaging pipelines.` },
      { type: "paragraph", text: `The output files are named sequentially and packaged into a zip. Each TIFF file contains one rendered page at double resolution, preserving the original page dimensions and content quality.` },
    ]},
    { heading: "How to Use PDF to TIFF", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to TIFF</strong>. The tool renders every page as a TIFF image at 2x resolution using pdf.js canvas output, then packages all images into a zip archive.`,
        `A progress indicator shows the rendering status as pages are processed.`,
        `A download button appears with your zip file, named <code>pdf-to-tiff.zip</code>. Extract it to access individual TIFF files, one per page.`,
      ]},
    ]},
    { heading: "Why Use PDF to TIFF?", content: [
      { type: "paragraph", text: `Publishing and print workflows often require TIFF input — prepress systems, offset printers, and color management tools work natively with TIFF but may not support PDF rendering directly. Converting to TIFF bridges this gap.` },
      { type: "paragraph", text: `Archival and preservation standards frequently specify TIFF as the preferred format for digitized documents. Converting PDFs to TIFF ensures compliance with institutional archival requirements.` },
      { type: "paragraph", text: `Medical and scientific imaging pipelines use TIFF for its lossless quality and support for high bit-depth color. Converting PDF reports or figures to TIFF maintains the visual fidelity required for analysis.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering pages, encoding TIFFs, and packaging the zip — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What compression does the TIFF use?", content: [
      { type: "paragraph", text: `The tool produces uncompressed TIFF files for maximum compatibility. Uncompressed TIFF preserves every pixel without any quality loss, though file sizes are larger than compressed alternatives.` },
    ]},
    { heading: "", subHeading: "Can I combine the TIFF files into a multi-page TIFF?", content: [
      { type: "paragraph", text: `The tool outputs individual TIFF files per page. To create a multi-page TIFF, use an image processing tool like ImageMagick (` + "`convert *.tif output.tif`" + `) or GIMP to combine them.` },
    ]},
    { heading: "", subHeading: "How does TIFF compare to PNG for this use case?", content: [
      { type: "paragraph", text: `Both are lossless. PNG is more widely supported on the web; TIFF is preferred in publishing and print workflows. TIFF supports additional features like multi-page files, embedded ICC profiles, and various compression schemes.` },
    ]},
  ],
};

const seoPdfToWebp: ToolSeo = {
  sections: [
    { heading: "What is PDF to WebP?", content: [
      { type: "paragraph", text: `PDF to WebP renders every page of a PDF as a WebP image file. The tool uses pdf.js to draw each page onto a canvas at 2x resolution, encodes the result as WebP, and packages the images into a zip archive.` },
      { type: "paragraph", text: `WebP is a modern image format developed by Google that provides superior compression compared to JPEG and PNG. It supports both lossy and lossless modes, producing smaller files with equivalent or better visual quality.` },
      { type: "paragraph", text: `The output files are named sequentially and packaged into a zip. WebP is natively supported by Chrome, Firefox, Edge, and Safari, making it ideal for web-based document sharing.` },
    ]},
    { heading: "How to Use PDF to WebP", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to WebP</strong>. The tool renders every page as a WebP image at 2x resolution using pdf.js canvas output, then packages all images into a zip archive.`,
        `A progress indicator shows the rendering status as pages are processed.`,
        `A download button appears with your zip file, named <code>pdf-to-webp.zip</code>. Extract it to access individual WebP files, one per page.`,
      ]},
    ]},
    { heading: "Why Use PDF to WebP?", content: [
      { type: "paragraph", text: `WebP produces significantly smaller files than JPEG at equivalent quality — typically 25-35% smaller. For web publishing, documentation sites, and email sharing, smaller file sizes mean faster loading and less bandwidth consumption.` },
      { type: "paragraph", text: `Web is the primary use case: every major browser supports WebP natively, and the format is optimized for screen display. Converting PDF pages to WebP creates web-ready assets that load quickly and look sharp.` },
      { type: "paragraph", text: `Content management systems and blogging platforms increasingly support WebP for its performance benefits. Converting PDF reference images to WebP before uploading improves page load times and SEO scores.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering pages, encoding WebP, and packaging the zip — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Is WebP supported by all browsers?", content: [
      { type: "paragraph", text: `Yes — Chrome, Firefox, Edge, and Safari all support WebP natively. Older browsers (IE11) do not. For maximum compatibility, PNG or JPEG are safer choices. For modern web use, WebP is preferred.` },
    ]},
    { heading: "", subHeading: "How does WebP quality compare to JPEG?", content: [
      { type: "paragraph", text: `WebP at the same quality level as JPEG produces sharper results with fewer artifacts, especially around text and edges. Alternatively, WebP at a lower quality setting matches JPEG quality at a smaller file size.` },
    ]},
    { heading: "", subHeading: "Can I control the compression level?", content: [
      { type: "paragraph", text: `The tool uses a fixed compression setting optimized for document content. For custom compression, render to PNG (lossless) and convert to WebP in an image editor where you can control the quality parameter.` },
    ]},
  ],
};

const seoPdfToWord: ToolSeo = {
  sections: [
    { heading: "What is PDF to Word?", content: [
      { type: "paragraph", text: `PDF to Word converts a PDF document into a Word-compatible file (.doc) that opens in Microsoft Word, LibreOffice Writer, and other word processors. The tool uses pdf.js to analyze the document's structure and generates HTML-based content that Word can import.` },
      { type: "paragraph", text: `The output preserves text content in reading order with basic formatting. It's designed for text-heavy PDFs where the goal is to get content into an editable Word document, not for pixel-perfect visual reproduction.` },
      { type: "paragraph", text: `The conversion produces a .doc file (the older Word format) for maximum compatibility. It opens in Word 97 and later, as well as Google Docs, LibreOffice, and WPS Office.` },
    ]},
    { heading: "How to Use PDF to Word", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to Word</strong>. The tool extracts text from every page using pdf.js, generates HTML-based Word content, and produces a .doc file.`,
        `A progress indicator shows the extraction status as pages are processed.`,
        `A download button appears with your file, named <code>converted.doc</code>. Open it in Microsoft Word, LibreOffice Writer, or Google Docs (via file import).`,
      ]},
    ]},
    { heading: "Why Use PDF to Word?", content: [
      { type: "paragraph", text: `When you need to edit a PDF's text content but don't have Adobe Acrobat, converting to Word gives you a fully editable document in software you already own. Modify text, add sections, reformat, and re-export as PDF.` },
      { type: "paragraph", text: `Legal and business workflows frequently require documents in editable formats for review, markup, and collaboration. Converting a PDF to Word lets multiple reviewers track changes, add comments, and suggest edits using Word's collaboration features.` },
      { type: "paragraph", text: `Template extraction benefits too — when you receive a PDF form or template that you want to customize, converting to Word gives you an editable starting point you can modify and redistribute.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text, generating Word content, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "Will the Word file look exactly like the PDF?", content: [
      { type: "paragraph", text: `No. The conversion extracts text content, not visual layout. Complex formatting (tables, columns, text boxes, images) may not transfer correctly. Simple single-column text documents convert most reliably.` },
    ]},
    { heading: "", subHeading: "Why .doc instead of .docx?", content: [
      { type: "paragraph", text: `The older .doc format has broader compatibility — it opens in Word 97 and later, as well as virtually every word processor ever made. The newer .docx format is smaller but may not open in very old software.` },
    ]},
    { heading: "", subHeading: "Can I convert a scanned PDF to Word?", content: [
      { type: "paragraph", text: `Scanned PDFs contain images of text, not actual text data. The tool reads the text content stream, which is empty for scans. For scanned documents, use the OCR tool first to recognize text, then convert to Word.` },
    ]},
  ],
};

const seoPdfToXml: ToolSeo = {
  sections: [
    { heading: "What is PDF to XML?", content: [
      { type: "paragraph", text: `PDF to XML extracts text content from a PDF and structures it as XML (Extensible Markup Language). The tool uses pdf.js to read each page's text content, wraps it in XML tags with page and paragraph elements, and produces a well-formed XML document.` },
      { type: "paragraph", text: `The output follows a simple structure: '<document>' → '<page>' → '<paragraph>' elements, with each paragraph containing the extracted text. This hierarchical structure preserves the document's page-by-page organization while making the text machine-readable.` },
      { type: "paragraph", text: `XML is the standard format for data exchange between systems. Converting PDF text to XML makes it parseable by XML processors, transformable with XSLT, and storable in XML databases.` },
    ]},
    { heading: "How to Use PDF to XML", content: [
      { type: "list", items: [
        `Drop a PDF file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to XML</strong>. The tool extracts text from every page using pdf.js, wraps the content in XML structure with page and paragraph elements, and produces a well-formed XML document.`,
        `A progress indicator shows the extraction status as pages are processed.`,
        `A download button appears with your file, named <code>converted.xml</code>. Open it in any XML editor, browser, or processing tool.`,
      ]},
    ]},
    { heading: "Why Use PDF to XML?", content: [
      { type: "paragraph", text: `Data pipelines and document management systems often require structured input. XML's hierarchical format makes it easy to parse, query (with XPath), and transform (with XSLT) — tasks that are difficult with raw text or PDF binary data.` },
      { type: "paragraph", text: `Legal and regulatory document processing systems frequently require XML input for automated analysis. Converting PDF filings to XML enables programmatic extraction of specific sections, clauses, or data points.` },
      { type: "paragraph", text: `Archival and digital preservation workflows use XML as a neutral format for long-term storage. PDFs may become obsolete; XML is a human-readable, self-describing format that remains parseable indefinitely.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text, generating XML, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
        { heading: "Frequently Asked Questions", subHeading: "What XML schema does the output use?", content: [
      { type: "paragraph", text: `The output uses a simple custom structure: '<document>' containing '<page>' elements, each containing '<paragraph>' elements with text content. There's no formal schema (XSD) — the structure is self-describing and straightforward to parse.` },
    ]},
    { heading: "", subHeading: "Can I transform the XML with XSLT?", content: [
      { type: "paragraph", text: `Yes. The well-formed XML can be transformed with XSLT to produce HTML, other XML formats, or plain text. The simple page/paragraph structure makes it easy to write XSLT templates for common transformations.` },
    ]},
    { heading: "", subHeading: "How does this differ from PDF to JSON?", content: [
      { type: "paragraph", text: `Both produce structured data from PDF text. XML uses angle-bracket tags; JSON uses key-value pairs. XML is preferred for document-centric workflows and XSLT processing; JSON is preferred for web APIs and JavaScript integration.` },
    ]},
  ],
};

const seoTextToPdf: ToolSeo = {
  sections: [
    { heading: "What is Text to PDF?", content: [
      { type: "paragraph", text: `Text to PDF converts plain text files into properly formatted PDF documents. The tool reads your .txt file, parses the content into lines, and renders each line as text on PDF pages using pdf-lib with the Helvetica font at 12pt size. Page breaks occur automatically when text reaches the bottom margin.` },
      { type: "paragraph", text: `The conversion preserves your original line breaks and paragraph spacing. Each page starts with a 50-point top margin and ends at a 50-point bottom margin, with 16 points of line spacing. Lines longer than 80 characters are automatically truncated with an ellipsis to prevent overflow.` },
      { type: "paragraph", text: `This is a text-only conversion — formatting like bold, italics, colors, and fonts from the source file are not preserved. The output is a clean, readable PDF suitable for sharing, printing, or archival where a consistent format matters more than visual styling.` },
      { type: "paragraph", text: `The tool creates pages on-demand as content flows, using a consistent layout across the entire document. Each page has generous margins that make the text comfortable to read both on screen and when printed, with a clean typographic style that prioritizes legibility over decoration.` },
    ]},
    { heading: "How to Use Text to PDF", content: [
      { type: "list", items: [
        `Drop a <strong>.txt</strong> file onto the upload zone, or click to browse and select it. The tool accepts any plain text file regardless of size.`,
        `Click <strong>Convert to PDF</strong>. The tool reads the file content, splits it into lines, and renders each line onto PDF pages using Helvetica at 12pt with automatic page breaks.`,
        `A download button appears with your file, named <code>converted.pdf</code>. The PDF preserves your original line breaks and paragraph structure.`,
        `The output filename defaults to <code>converted.pdf</code>. The PDF is a single file with all pages using the same Helvetica font and consistent layout.`,
      ]},
    ]},
    { heading: "Why Use Text to PDF?", content: [
      { type: "paragraph", text: `Shared notes, meeting minutes, and documentation often circulate as .txt files because they're universal, but many recipients prefer PDFs for consistent rendering across devices. Converting to PDF ensures the text looks identical on every screen and printer without requiring the recipient to have a specific text editor.` },
      { type: "paragraph", text: `Legal and compliance teams frequently need to submit plain-text drafts, logs, or reports as PDFs for official records. The conversion creates a clean, paginated document from raw text without introducing any visual artifacts or formatting inconsistencies.` },
      { type: "paragraph", text: `Academic and technical workflows benefit too — converting code snippets, terminal output, or data dumps to PDF creates a stable reference document that won't be accidentally edited or reformatted when opened on a different system.` },
      { type: "paragraph", text: `Data scientists and analysts who export results as .txt files from command-line tools need a portable format for including in presentations or reports. The PDF conversion ensures tables of numbers, log outputs, and generated reports look identical regardless of the viewers font settings or operating system.` },
      { type: "paragraph", text: `Personal journals, logs, and reading lists maintained as plain text files benefit from PDF conversion for long-term preservation. The PDF format is self-contained and does not depend on any specific application to render, making it ideal for documents you want to access years from now without worrying about software compatibility.` },
      { type: "paragraph", text: `Educators distributing handouts, worksheets, or assignment instructions as text files often need PDF versions for printing. The consistent formatting ensures every student sees the same layout regardless of their device or text editor settings.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the text file, rendering lines onto PDF pages, and generating the output — happens on your own device using pdf-lib compiled to JavaScript. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential documents like source code, internal reports, or sensitive notes, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will the PDF preserve my text formatting like bold or italics?", content: [
      { type: "paragraph", text: `No. The tool renders all text in Helvetica at 12pt — formatting markers like asterisks for bold or underscores for italic are treated as literal characters. For formatted output from Markdown, use the Markdown to PDF tool instead, which interprets basic Markdown syntax.` },
    ]},
    { heading: "", subHeading: "Is there a file size limit?", content: [
      { type: "paragraph", text: `There is no hard limit, but very large text files (over 10MB) may take longer to process since every line must be measured and rendered individually. The tool handles files with thousands of pages by automatically creating new pages as needed.` },
    ]},
    { heading: "", subHeading: "What happens to long lines?", content: [
      { type: "paragraph", text: `Lines longer than 80 characters are truncated and an ellipsis (...) is appended. This prevents text from overflowing the page margins. If you need full lines preserved, consider preprocessing the text to add line breaks at appropriate points, or use the Markdown to PDF tool which may handle wrapping differently.` },
    ]},
    { heading: "", subHeading: "Can I customize the font or page size?", content: [
      { type: "paragraph", text: `Not with this tool. The output uses Helvetica at 12pt on A4-style pages with fixed 50-point margins. If you need custom fonts, colors, or page dimensions, use a dedicated document editor or the HTML to PDF tool where you can control styling through CSS.` },
    ]},
    { heading: "", subHeading: "How many pages will the output have?", content: [
      { type: "paragraph", text: `The tool creates a new page every time text reaches the bottom margin. A file with 50 lines of text typically fits on one page, while a file with 500 lines produces roughly 10 pages. The exact count depends on line length and content density.` },
    ]},
    { heading: "", subHeading: "Can I merge multiple text files into one PDF?", content: [
      { type: "paragraph", text: `Not in a single operation. Each text file produces its own PDF. To combine multiple files, convert each one separately and then use the Merge PDF tool to combine them into a single document.` },
    ]},
    { heading: "", subHeading: "What encoding does the tool support?", content: [
      { type: "paragraph", text: `The tool reads the file as UTF-8, which covers ASCII, Western European, and most common character sets. Characters outside UTF-8 may not render correctly. If your file uses a different encoding like Windows-1252, convert it to UTF-8 first.` },
    ]},
    { heading: "", subHeading: "Does the PDF support bookmarks or navigation?", content: [
      { type: "paragraph", text: `No. The output is a flat text document with no bookmarks, hyperlinks, or table of contents. If you need navigation features, consider converting the text to Markdown first, then using the Markdown to PDF tool.` },
    ]},
    { heading: "", subHeading: "Does the PDF include metadata like title or author?", content: [
      { type: "paragraph", text: `No. The output PDF has minimal metadata. If you need custom metadata, consider using a dedicated PDF editor after conversion, or use the Metadata Editor tool to add title, author, and other fields.` },
    ]},
    { heading: "", subHeading: "How does the tool handle very long lines?", content: [
      { type: "paragraph", text: `Lines exceeding 80 characters are truncated with an ellipsis. This prevents text from extending beyond the page margins. For content that needs to wrap rather than truncate, convert the text to HTML first with manual line breaks, then use the HTML to PDF tool.` },
    ]},
  ],
};

const seoHtmlToPdf: ToolSeo = {
  sections: [
    { heading: "What is HTML to PDF?", content: [
      { type: "paragraph", text: `HTML to PDF extracts the text content from HTML files and renders it as a clean PDF document. The tool parses the HTML markup, strips all tags and attributes, and outputs the visible text as a formatted PDF using pdf-lib with Helvetica at 12pt.` },
      { type: "paragraph", text: `The conversion is text-only — it extracts what you can read, not how it looks. Headings become plain text lines, links become visible text without clickability, and images are skipped entirely. The result is a readable, paginated PDF suitable for archival or sharing where the text content matters more than the visual layout.` },
      { type: "paragraph", text: `This tool uses a browser-based HTML parser (DOMParser) when available, which handles malformed HTML gracefully. On the server side, it falls back to regex-based tag stripping. Both paths produce the same clean-text output.` },
      { type: "paragraph", text: `The browser-based parser handles malformed HTML gracefully, including unclosed tags, missing attributes, and improperly nested elements. This makes it suitable for processing real-world HTML files that may not validate against strict standards.` },
      { type: "paragraph", text: `The output preserves paragraph breaks and line structure from the source HTML, creating a clean, readable document that captures the informational essence of the original web content.` },
    ]},
    { heading: "How to Use HTML to PDF", content: [
      { type: "list", items: [
        `Drop an <strong>.html</strong> or <strong>.htm</strong> file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to PDF</strong>. The tool parses the HTML, extracts visible text content by stripping all markup tags, and renders it onto PDF pages with automatic line breaks.`,
        `A download button appears with your file, named <code>html-to-pdf.pdf</code>. The output contains the readable text from your HTML document, paginated and formatted for printing.`,
        `The output uses Helvetica at 12pt with automatic line breaks, creating a clean text document from your HTML markup.`,
        `If your HTML file contains entities, special characters, or non-Latin text, the tool handles them correctly through the browser built-in character decoding, producing accurate text output regardless of the source encoding.`,
      ]},
    ]},
    { heading: "Why Use HTML to PDF?", content: [
      { type: "paragraph", text: `Web pages and HTML emails often need to be shared as PDFs for record-keeping, but saving a webpage as PDF through the browser captures the visual layout including ads, sidebars, and navigation. This tool extracts just the text content — the actual information — into a clean document.` },
      { type: "paragraph", text: `Developers and technical writers frequently generate HTML reports, API documentation, or generated output that needs to be distributed as PDF. Converting the HTML to a text-based PDF ensures the content is readable without requiring the recipient to open an HTML file in a browser.` },
      { type: "paragraph", text: `Compliance teams processing HTML-formatted emails, contracts, or notices need to create PDF records of the text content. The extraction preserves the reading order and paragraph structure while stripping formatting that would be irrelevant in an archival document.` },
      { type: "paragraph", text: `Web archiving workflows benefit from text extraction when the goal is to preserve information rather than appearance. Converting HTML pages to text-based PDFs creates searchable, indexable documents that integrate with document management systems without the overhead of full visual rendering.` },
      { type: "paragraph", text: `Researchers collecting web content for analysis need the text extracted without the visual noise of navigation bars, advertisements, sidebars, and cookie banners. The text extraction produces a clean document containing only the informational content.` },
      { type: "paragraph", text: `Compliance teams processing HTML-formatted regulatory filings, patent documents, or government notices need PDF records that preserve the text content for archival. The conversion creates a stable, non-editable document from dynamic HTML sources.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the HTML, stripping markup, rendering text onto PDF pages, and generating the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential HTML documents like internal reports, emails, or draft web pages, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will the PDF look like the original HTML page?", content: [
      { type: "paragraph", text: `No. This tool extracts text content only — it does not preserve visual styling, layout, images, or CSS. The output is clean text rendered in Helvetica at 12pt. For a visual-faithful PDF that preserves the HTML layout, you would need a headless browser renderer, which is not available in this browser-based tool.` },
    ]},
    { heading: "", subHeading: "Can it handle malformed or broken HTML?", content: [
      { type: "paragraph", text: `Yes. The browser-based parser (DOMParser) handles common HTML issues like unclosed tags, missing attributes, and nested incorrectly. The regex fallback also tolerates most malformed markup. However, extremely broken HTML may produce unexpected text extraction results.` },
    ]},
    { heading: "", subHeading: "Does it extract content from <script> or <style> tags?", content: [
      { type: "paragraph", text: `No. The HTML parser naturally excludes content inside script and style elements — these are not part of the visible document text. Only the readable content that would appear in the browser viewport is extracted.` },
    ]},
    { heading: "", subHeading: "Can I convert HTML with images to PDF?", content: [
      { type: "paragraph", text: `Not with this tool — it extracts text only. Images, charts, and graphical elements in the HTML are skipped. If you need images preserved, consider using a screenshot-to-PDF workflow or a dedicated HTML-to-PDF renderer that supports visual output.` },
    ]},
    { heading: "", subHeading: "What happens to HTML tables?", content: [
      { type: "paragraph", text: `Table data is extracted as sequential text. Cell contents appear in reading order (left to right, top to bottom) without the original table structure. For tables that need to be preserved visually, a dedicated HTML-to-PDF renderer would be required.` },
    ]},
    { heading: "", subHeading: "Does it handle HTML entities correctly?", content: [
      { type: "paragraph", text: `Yes. HTML entities like &amp; (&amp;amp;), &lt; (&amp;lt;), &amp;nbsp; (non-breaking space), and &amp;quot; (quote) are decoded to their actual characters before text extraction. Numeric character references are also handled correctly.` },
    ]},
    { heading: "", subHeading: "Can it process HTML files with embedded CSS?", content: [
      { type: "paragraph", text: `CSS is ignored during text extraction. The tool reads the DOM content, not the visual rendering. Inline styles, external stylesheets, and style blocks have no effect on the output. Only the visible text content is extracted.` },
    ]},
    { heading: "", subHeading: "What HTML elements are extracted as text?", content: [
      { type: "paragraph", text: `All visible text elements are extracted: paragraphs, headings (h1-h6), lists, links (text only, not URLs), table cells, preformatted text, and blockquotes. Elements like script, style, meta, and head content are naturally excluded.` },
    ]},
    { heading: "", subHeading: "Can it handle frames and iframes in HTML?", content: [
      { type: "paragraph", text: `No. The tool processes a single HTML document. Content loaded via iframes or frames is not included in the extraction. To capture iframe content, you would need to extract the inner HTML of each frame separately.` },
    ]},
    { heading: "", subHeading: "What about HTML5 semantic elements?", content: [
      { type: "paragraph", text: `Semantic elements like article, section, nav, header, footer, and aside are all treated as containers for their text content. The semantic meaning is lost in the output, but the text content is preserved in document order.` },
    ]},
    { heading: "", subHeading: "Does it extract alt text from images?", content: [
      { type: "paragraph", text: `No. The text extraction only reads visible text content. Image elements and their alt attributes are skipped entirely. The tool produces a text-only output without any reference to visual elements in the HTML.` },
    ]},
  ],
};

const seoCsvToPdf: ToolSeo = {
  sections: [
    { heading: "What is CSV to PDF?", content: [
      { type: "paragraph", text: `CSV to PDF converts comma-separated value spreadsheets into formatted PDF table documents. The tool uses PapaParse to read the CSV data, then jsPDF with the autotable plugin to render a properly structured table on landscape A4 pages.` },
      { type: "paragraph", text: `The first row of the CSV is treated as table headers and rendered in bold at the top of each page. Data rows follow with automatic line wrapping for long cell content. Empty rows are filtered out, and the table auto-paginates when it exceeds a single page.` },
      { type: "paragraph", text: `The output PDF is in landscape orientation by default — better suited for the wide column layouts typical of spreadsheet data. Each cell has 3mm of padding, and the font size is 9pt to maximize the amount of data visible per page.` },
      { type: "paragraph", text: `The tool uses the jsPDF library with the autotable plugin to create properly structured PDF tables. Headers are styled distinctly from data rows, and the table auto-paginates with headers repeated on each new page for readability in multi-page datasets.` },
      { type: "paragraph", text: `For single-file conversions, the output downloads directly as a PDF. When multiple CSV files are loaded, each is converted independently and all outputs are bundled into a convenient zip archive for batch processing workflows.` },
    ]},
    { heading: "How to Use CSV to PDF", content: [
      { type: "list", items: [
        `Drop a <strong>.csv</strong> file onto the upload zone, or click to browse and select it. The tool accepts any standard CSV file.`,
        `Optionally add more CSV files using the <strong>Add File</strong> button — multiple files are converted individually and packaged into a zip archive.`,
        `Click <strong>Convert to PDF</strong>. The tool parses the CSV with PapaParse, extracts headers and data rows, and generates a landscape A4 PDF table using jsPDF and autotable.`,
        `A download button appears with your file. Single files download as <code>filename.pdf</code>; multiple files download as <code>csv-converted.zip</code>.`,
        `Multiple files can be added and will be converted individually into separate PDFs, then packaged into a single zip download.`,
        `The conversion preserves the logical structure of your spreadsheet. Column alignment, row ordering, and data types (as text) are maintained in the PDF output. Numeric values, dates, and text strings all appear exactly as they do in the source CSV.`,
      ]},
    ]},
    { heading: "Why Use CSV to PDF?", content: [
      { type: "paragraph", text: `Spreadsheet data exported as CSV is lightweight and universal, but not ideal for sharing with stakeholders who need a formatted, print-ready document. Converting to PDF creates a professional table layout that looks consistent across all devices without requiring Excel or Google Sheets.` },
      { type: "paragraph", text: `Financial reports, inventory lists, and data exports often need to be included in PDF presentations or reports. The landscape orientation and auto-pagination handle wide datasets that would wrap awkwardly on a portrait page.` },
      { type: "paragraph", text: `Compliance and audit workflows frequently require data snapshots as immutable PDF records. Converting CSV exports to PDF creates a fixed document that preserves the data at a point in time, suitable for attaching to official reports or filing alongside other PDF documents.` },
      { type: "paragraph", text: `Financial analysts exporting data from accounting software need to attach formatted tables to PDF reports. The landscape layout accommodates the wide column structures typical of financial spreadsheets without truncating data.` },
      { type: "paragraph", text: `Survey results and form submissions exported as CSV need to be formatted into presentable tables for stakeholder review. The PDF conversion creates a professional, print-ready table from raw data without requiring manual formatting in a spreadsheet application.` },
      { type: "paragraph", text: `Database administrators exporting query results as CSV often need to attach formatted data snapshots to incident reports or change requests. The landscape PDF output preserves the full width of multi-column result sets.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the CSV, generating the PDF table, and packaging multi-file outputs — happens on your own device using PapaParse and jsPDF. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential datasets like financial records, patient data, or proprietary analytics, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What CSV delimiters are supported?", content: [
      { type: "paragraph", text: `PapaParse auto-detects the delimiter — commas, semicolons, tabs, and pipes all work. If auto-detection fails on an unusual delimiter, the tool defaults to comma-separated parsing. The first row is always treated as column headers.` },
    ]},
    { heading: "", subHeading: "How are very wide tables handled?", content: [
      { type: "paragraph", text: `The landscape A4 layout gives approximately 277mm of usable width. Columns are auto-sized based on content, with cell padding of 3mm. Very wide tables (more than 10-12 columns) may still overflow — in that case, long cell content wraps to multiple lines within the cell.` },
    ]},
    { heading: "", subHeading: "Can I convert Excel (.xlsx) files?", content: [
      { type: "paragraph", text: `Not directly — this tool reads CSV format only. Export your Excel file as CSV first (File > Save As > CSV), then convert the CSV to PDF. This also applies to Google Sheets exports.` },
    ]},
    { heading: "", subHeading: "What happens to special characters and encoding?", content: [
      { type: "paragraph", text: `PapaParse handles UTF-8 encoding, so accented characters, non-Latin scripts, and special symbols are preserved correctly in the PDF output. However, the Helvetica font used for rendering has limited glyph support — characters outside Western European may appear as placeholders.` },
    ]},
    { heading: "", subHeading: "How are very large CSV files handled?", content: [
      { type: "paragraph", text: `Files with thousands of rows are paginated automatically. The table continues onto new pages as needed with headers repeated on each page. There is no hard row limit, but files over 5MB may take longer to process since every cell must be measured and rendered.` },
    ]},
    { heading: "", subHeading: "Does it support TSV (tab-separated) files?", content: [
      { type: "paragraph", text: `PapaParse auto-detects the delimiter, so tab-separated files work without any configuration change. Semicolons, pipes, and other delimiters are also auto-detected from the file content.` },
    ]},
    { heading: "", subHeading: "What if my CSV has quoted fields with commas inside?", content: [
      { type: "paragraph", text: `PapaParse handles standard CSV quoting correctly. Fields enclosed in double quotes that contain commas are parsed as single cells. Newlines within quoted fields are also handled properly, preserving multi-line cell content.` },
    ]},
    { heading: "", subHeading: "How are empty rows and columns handled?", content: [
      { type: "paragraph", text: `Empty rows (where all cells are blank) are filtered out before rendering. Empty cells within a row are preserved as blank table cells. This prevents sparse datasets from producing pages of empty space.` },
    ]},
    { heading: "", subHeading: "Does it handle CSV with a BOM (byte order mark)?", content: [
      { type: "paragraph", text: `Yes. PapaParse handles UTF-8 BOM correctly, stripping it before parsing. The first row is still treated as column headers even if preceded by a BOM character.` },
    ]},
    { heading: "", subHeading: "How are multi-line cell values displayed?", content: [
      { type: "paragraph", text: `Cells containing newline characters have their content wrapped within the cell boundaries. The autotable plugin calculates the required cell height based on wrapped text, ensuring all content is visible without overflow.` },
    ]},
    { heading: "", subHeading: "What if my CSV has inconsistent column counts?", content: [
      { type: "paragraph", text: `Rows with fewer columns than the header are padded with empty cells. Rows with more columns than the header have extra cells appended. PapaParse handles these variations gracefully, ensuring the table structure remains intact.` },
    ]},
  ],
};

const seoRtfToPdf: ToolSeo = {
  sections: [
    { heading: "What is RTF to PDF?", content: [
      { type: "paragraph", text: `RTF to PDF extracts the readable text from Rich Text Format files and renders it as a plain-text PDF document. The tool strips RTF control words, font tables, and formatting groups, then renders the remaining text onto PDF pages using pdf-lib with Helvetica at 12pt.` },
      { type: "paragraph", text: `The conversion is text-only — bold, italic, font sizes, colors, images, and table formatting defined in the RTF are not preserved. The tool extracts what the RTF says, not how it looks. Each line is rendered at 50-point margins with 16-point line spacing, and lines exceeding 80 characters are truncated.` },
      { type: "paragraph", text: `RTF files use a markup syntax with backslash-prefixed control words (like \\b for bold, \\fs for font size) wrapped in curly-brace groups. The tool strips these systematically — removing brace groups, control words, and control symbols — leaving only the plain text content.` },
      { type: "paragraph", text: `The tool systematically strips RTF control sequences: backslash-prefixed control words that define formatting, brace-delimited groups that scope formatting changes, and font table declarations. What remains is the pure text content, rendered cleanly on PDF pages.` },
      { type: "paragraph", text: `The approach is similar to copy-pasting from an RTF viewer into a plain text editor, but automated and paginated. The result is a consistent, printer-ready document that captures the full text content without requiring the original RTF-capable application.` },
    ]},
    { heading: "How to Use RTF to PDF", content: [
      { type: "list", items: [
        `Drop an <strong>.rtf</strong> file onto the upload zone, or click to browse and select it.`,
        `Click <strong>Convert to PDF</strong>. The tool strips RTF formatting markup, extracts the plain text content, and renders it onto PDF pages with automatic pagination.`,
        `A download button appears with your file, named <code>converted.pdf</code>. The output contains the readable text from your RTF document.`,
        `The output preserves paragraph structure from the original RTF while stripping all formatting markup.`,
        `The conversion process is lossless for text content. Every character that would appear as readable text in an RTF viewer is captured in the output PDF. Only formatting information (fonts, sizes, colors, styles) is discarded.`,
      ]},
    ]},
    { heading: "Why Use RTF to PDF?", content: [
      { type: "paragraph", text: `Rich Text Format was widely used for cross-platform document exchange before DOCX became standard. Many legacy documents, email archives, and government filings still exist as .rtf files that need to be converted to the universally readable PDF format.` },
      { type: "paragraph", text: `Legal teams processing archived correspondence often encounter RTF files from older email systems. Converting to PDF creates a consistent, searchable document format that integrates with modern document management workflows.` },
      { type: "paragraph", text: `When the text content is what matters — not the visual formatting — this tool creates a clean, readable PDF without the overhead of preserving RTF styling. The output is ideal for text search, archival, and situations where consistent rendering across devices is more important than font choices.` },
      { type: "paragraph", text: `Institutional archives often contain decades of correspondence in RTF format from legacy email systems. Bulk conversion to PDF creates a uniform, searchable archive that modern document management systems can index and retrieve.` },
      { type: "paragraph", text: `Help desk and IT teams maintaining knowledge bases from legacy RTF files need to consolidate documentation into a modern, universally readable format. PDF conversion ensures the text content remains accessible even as older software becomes obsolete.` },
      { type: "paragraph", text: `Publishing workflows that originated in WordPerfect or early Microsoft Word often produced RTF as an interchange format. Converting these historical documents to PDF preserves the text for editorial review and typesetting while discarding outdated formatting.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the RTF markup, stripping formatting, rendering text onto PDF pages, and generating the output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential documents like legal correspondence, contracts, or internal memos, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will the PDF preserve the original formatting?", content: [
      { type: "paragraph", text: `No. Bold, italic, font sizes, colors, and images defined in the RTF are not preserved. The output is plain text in Helvetica at 12pt. If you need formatting preserved, use a dedicated RTF editor (like Word or LibreOffice) to convert to PDF instead.` },
    ]},
    { heading: "", subHeading: "Does it handle images embedded in the RTF?", content: [
      { type: "paragraph", text: `No. RTF files can embed images as hex-encoded data, but this tool only extracts text content. Embedded images, drawings, and OLE objects are stripped along with the formatting markup.` },
    ]},
    { heading: "", subHeading: "Can it handle non-English RTF files?", content: [
      { type: "paragraph", text: `Yes, for the most part. The text extraction preserves Unicode characters that appear as literal text in the RTF. However, RTF files that use font-specific character mappings (common in older RTF editors) may produce garbled output for non-Latin characters.` },
    ]},
    { heading: "", subHeading: "How does this differ from Word's RTF import?", content: [
      { type: "paragraph", text: `Word and LibreOffice render RTF with full formatting — fonts, styles, images, tables, and page layout. This tool extracts text only. Use those applications when visual fidelity matters; use this tool when you need quick text extraction or when the formatting is irrelevant to the document's purpose.` },
    ]},
    { heading: "", subHeading: "How does the tool handle RTF groups (curly braces)?", content: [
      { type: "paragraph", text: `RTF uses curly braces to group formatting changes. The tool strips everything inside braces that starts with a backslash (control words), keeping only the plain text that falls between formatting groups. Nested groups are handled correctly.` },
    ]},
    { heading: "", subHeading: "Can it handle RTF with tables?", content: [
      { type: "paragraph", text: `Table content is extracted as text in reading order, with cells appearing sequentially. The visual table structure is not preserved. For formatted table output, use Word or LibreOffice to convert the RTF to PDF with formatting intact.` },
    ]},
    { heading: "", subHeading: "What RTF version is supported?", content: [
      { type: "paragraph", text: `The tool handles RTF 1.0 through 1.9.x control words, which covers the vast majority of RTF files produced by Word, LibreOffice, and email clients. Very new or proprietary RTF extensions may produce incomplete extraction.` },
    ]},
    { heading: "", subHeading: "How are special RTF characters handled?", content: [
      { type: "paragraph", text: `Characters that are escaped in RTF (like escaped braces, backslashes, and non-ASCII characters represented as Unicode escape sequences) are decoded to their actual characters in the PDF output.` },
    ]},
    { heading: "", subHeading: "How are escaped characters in RTF handled?", content: [
      { type: "paragraph", text: `RTF escapes special characters with backslash sequences (like \\\\ for backslash, \\{ for open brace, \\} for close brace). The tool decodes these to their literal characters in the output PDF.` },
    ]},
    { heading: "", subHeading: "Can the tool handle encrypted or password-protected RTF?", content: [
      { type: "paragraph", text: `Standard RTF files are not encrypted. If an RTF file has been modified with non-standard encryption, the text extraction may fail or produce garbled output. In that case, use the original application to decrypt the file first.` },
    ]},
    { heading: "", subHeading: "How does it handle mixed-language RTF documents?", content: [
      { type: "paragraph", text: `The text extraction preserves all Unicode characters present in the RTF file. However, the Helvetica font used for PDF rendering has limited glyph support for non-Western scripts. Characters outside the Latin range may appear as placeholder boxes.` },
    ]},
  ],
};

const seoSvgToPdf: ToolSeo = {
  sections: [
    { heading: "What is SVG to PDF?", content: [
      { type: "paragraph", text: `SVG to PDF converts Scalable Vector Graphics files into PDF documents. The tool renders the SVG onto a canvas at 2x resolution to capture every detail, converts the canvas to a PNG image, and then embeds that image into a PDF page using pdf-lib's imagesToPDF function.` },
      { type: "paragraph", text: `The conversion is image-based — the SVG's vector data is rasterized to pixels during the canvas rendering step. The 2x resolution ensures that text, lines, and fine details remain sharp in the output PDF. The resulting PDF page dimensions match the SVG's viewBox or explicit width/height attributes.` },
      { type: "paragraph", text: `This approach handles the full SVG specification — gradients, filters, clip paths, masks, and embedded text all render correctly because the browser's SVG engine handles the actual rendering. The PDF output is a faithful rasterized capture of exactly what the SVG looks like when displayed.` },
      { type: "paragraph", text: `The canvas-based rendering approach means the output faithfully captures exactly what the SVG looks like when displayed in a browser, including complex features like CSS animations (frozen at their current state), JavaScript-generated content, and dynamically loaded resources.` },
    ]},
    { heading: "How to Use SVG to PDF", content: [
      { type: "list", items: [
        `Drop an <strong>.svg</strong> file onto the upload zone, or click to browse and select it. The tool validates that the file is a valid SVG before processing.`,
        `Click <strong>Convert to PDF</strong>. The tool renders the SVG onto an offscreen canvas at 2x resolution, converts it to a PNG image, and embeds it into a PDF page with matching dimensions.`,
        `A download button appears with your file, named <code>svg-to-pdf.pdf</code>. The PDF contains a high-resolution rasterized image of your SVG.`,
        `The tool validates the SVG file type before processing and will reject non-SVG uploads with an informative error message.`,
        `The 2x resolution multiplier means a 400x300 SVG produces an 800x600 pixel raster image in the PDF, providing sufficient detail for print at standard sizes while keeping file sizes manageable.`,
      ]},
    ]},
    { heading: "Why Use SVG to PDF?", content: [
      { type: "paragraph", text: `Vector diagrams, icons, and illustrations created as SVGs are perfect for screen display but many document workflows require PDF. Converting SVG to PDF embeds the graphic into a format that can be included in reports, printed, or archived alongside other PDF documents.` },
      { type: "paragraph", text: `Design teams sharing wireframes, flowcharts, or technical diagrams often need to include them in PDF deliverables. The 2x rendering resolution ensures the output is print-quality even for detailed diagrams with small text or fine lines.` },
      { type: "paragraph", text: `Data visualization outputs from tools like D3.js, Chart.js, or matplotlib's SVG export often need to be embedded in PDF reports. This conversion preserves the exact visual appearance of the chart as rendered by the browser, ensuring what you see is what ends up in the PDF.` },
      { type: "paragraph", text: `Technical documentation teams embedding architecture diagrams, sequence diagrams, or UML charts need these vector graphics in PDF format for inclusion in formal reports and compliance documentation.` },
      { type: "paragraph", text: `Marketing teams creating social media graphics, email headers, or banner designs in SVG format need PDF versions for print campaigns. The 2x resolution output ensures the graphics look sharp on both screen and print at standard sizes.` },
      { type: "paragraph", text: `Scientific publications frequently require figures in PDF format for submission. Graphs and charts generated as SVGs from tools like matplotlib, gnuplot, or D3.js can be converted to PDF for inclusion in LaTeX or Word documents.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the SVG, rendering it onto a canvas, converting to PNG, and embedding in a PDF — happens on your own device using the browser's built-in SVG renderer and pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential diagrams like network architectures, proprietary designs, or internal process flows, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does the output preserve vector quality?", content: [
      { type: "paragraph", text: `The SVG is rendered to a bitmap (PNG) at 2x resolution before embedding in the PDF, so the output is rasterized, not vector. At 2x, the quality is sufficient for most printing and display use cases. For true vector output in PDF, you would need a dedicated SVG-to-PDF converter that translates SVG paths to PDF path objects.` },
    ]},
    { heading: "", subHeading: "What SVG features are supported?", content: [
      { type: "paragraph", text: `Since the browser's SVG engine does the actual rendering, all standard SVG features work: shapes, text, gradients, patterns, clip paths, masks, filters, animations (rendered as their final state), and embedded images. The tool captures the fully-rendered output as a bitmap.` },
    ]},
    { heading: "", subHeading: "Can I convert multiple SVGs to a single PDF?", content: [
      { type: "paragraph", text: `Not in a single operation — each SVG produces one PDF page. To combine multiple SVGs, convert each one separately and then use the Merge PDF tool to combine the resulting PDFs into a single document.` },
    ]},
    { heading: "", subHeading: "Why is the 2x resolution important?", content: [
      { type: "paragraph", text: `At 1x resolution, small text and thin lines in the SVG may appear aliased or blurry in the PDF. The 2x rendering doubles the pixel dimensions, producing a crisp capture that holds up well at standard print sizes (up to about 8.5 x 11 inches for an A4-sized SVG).` },
    ]},
    { heading: "", subHeading: "What if my SVG has animation elements?", content: [
      { type: "paragraph", text: `Animations are rendered as their final state. The tool captures a static snapshot of the SVG as displayed by the browser. SMIL animations, CSS animations, and JavaScript-driven animations all resolve to their end state in the output.` },
    ]},
    { heading: "", subHeading: "Can it handle SVGs with embedded fonts?", content: [
      { type: "paragraph", text: `If the SVG references fonts that are available in the browser, the text renders correctly. If the fonts are missing, the browser substitutes a fallback font, and the output reflects that substitution. Embedded web fonts in SVG are not loaded.` },
    ]},
    { heading: "", subHeading: "What SVG dimensions does the tool support?", content: [
      { type: "paragraph", text: `The PDF page dimensions match the SVGs viewBox or explicit width/height attributes. SVGs without explicit dimensions default to the browser default rendering size (typically 300x150). Very large SVGs over 4000px may be clipped by canvas limits.` },
    ]},
    { heading: "", subHeading: "Is the output vector or raster?", content: [
      { type: "paragraph", text: `The output is rasterized at 2x resolution. The SVG is rendered to a canvas bitmap, converted to PNG, then embedded in the PDF. For true vector PDF output, the SVG paths would need to be translated to PDF path objects, which requires a specialized converter.` },
    ]},
    { heading: "", subHeading: "What color space does the output use?", content: [
      { type: "paragraph", text: `The canvas renders in sRGB color space, which is the default for web content. If you need CMYK color space for professional printing, the SVG would need to be converted using a specialized print workflow tool.` },
    ]},
    { heading: "", subHeading: "Can it handle SVGs with transparency?", content: [
      { type: "paragraph", text: `The canvas renders with a white background by default. Semi-transparent elements in the SVG are composited against this white background. Fully transparent areas appear as white in the output PDF.` },
    ]},
  ],
};

const seoUnlock: ToolSeo = {
  sections: [
    { heading: "What is PDF Password Remover?", content: [
      { type: "paragraph", text: `PDF Password Remover strips the password encryption from a PDF file you own, producing an unrestricted version that opens without requiring a password. The tool uses pdf-lib to load the encrypted document with your provided password, then saves it without encryption settings.` },
      { type: "paragraph", text: `This tool requires the opening password (user password) to decrypt the document. If the PDF is protected with an owner password only (restricting printing or editing but not opening), the tool can remove those restrictions without needing a password.` },
      { type: "paragraph", text: `The output is a standard PDF with no encryption. Once decrypted, the document can be opened, edited, printed, and shared without any password prompts. The original file is never modified — a new unrestricted copy is created.` },
      { type: "paragraph", text: `The decryption process is fast — even large PDFs with hundreds of pages are processed in seconds because pdf-lib reads the encryption key and re-saves the document without the encryption dictionary, without re-rendering any content.` },
      { type: "paragraph", text: `The decryption process works by reading the PDF encryption dictionary, using your password to derive the encryption key, and then re-saving the document without the encryption layer. All page content, fonts, images, and annotations are copied verbatim to the output — only the encryption metadata is stripped.` },
    ]},
    { heading: "How to Use PDF Password Remover", content: [
      { type: "list", items: [
        `Drop a password-protected PDF onto the upload zone, or click to browse and select it.`,
        `Enter the <strong>password</strong> in the password field. This is the opening password needed to decrypt the document.`,
        `Click <strong>Remove Password</strong>. The tool decrypts the PDF using your password and saves it without encryption.`,
        `A download button appears with your file, named <code>unlocked.pdf</code>. The file opens without any password prompt.`,
        `If the PDF uses owner-password-only protection (no user password required to open), the tool detects this automatically and removes the restrictions without asking for a password.`,
      ]},
    ]},
    { heading: "Why Use PDF Password Remover?", content: [
      { type: "paragraph", text: `Password-protected PDFs from banks, legal firms, and government agencies are inconvenient when you need to access them regularly. Removing the password after initial verification streamlines your workflow without compromising the document content.` },
      { type: "paragraph", text: `Document management systems and archival tools often cannot process encrypted PDFs. Removing the password before ingestion ensures the documents are searchable, indexable, and accessible to authorized users without password prompts.` },
      { type: "paragraph", text: `When sharing decrypted copies internally within a trusted organization, removing the password eliminates the friction of distributing and managing passwords alongside the document itself.` },
      { type: "paragraph", text: `When migrating document collections between systems, encrypted PDFs can block automated processing pipelines. Decrypting them upfront ensures smooth ingestion into document management, search indexing, and archival systems without manual password entry at each step.` },
      { type: "paragraph", text: `IT administrators managing shared document repositories need to batch-process encrypted PDFs for indexing and search. Decrypting documents upfront eliminates the need for password management infrastructure in the processing pipeline.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the encrypted PDF, decrypting it with your password, and generating the unrestricted output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. Your password is processed locally and never transmitted over the network.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What if I don't know the password?", content: [
      { type: "paragraph", text: `The tool cannot decrypt a PDF without the correct password. If you have lost the password, you would need to contact the document creator or use a password recovery service. This tool is designed for legitimate owners who know their password but want to remove it for convenience.` },
    ]},
    { heading: "", subHeading: "Can it remove owner-password restrictions without the user password?", content: [
      { type: "paragraph", text: `Yes. If the PDF opens freely but restricts printing, copying, or editing (owner-password protection), the tool can remove those restrictions without requiring any password input. The document is saved without the permission flags.` },
    ]},
    { heading: "", subHeading: "Does removing the password affect the document content?", content: [
      { type: "paragraph", text: `No. The decryption process only removes the encryption layer. All text, images, fonts, annotations, bookmarks, and form fields are preserved exactly as they were in the encrypted original.` },
    ]},
    { heading: "", subHeading: "Will removing the password reduce the file size?", content: [
      { type: "paragraph", text: `Slightly. The encryption dictionary and associated metadata are removed, which typically saves a few kilobytes. The page content, images, and fonts are unchanged, so the overall file size reduction is minimal.` },
    ]},
    { heading: "", subHeading: "What happens if I enter the wrong password?", content: [
      { type: "paragraph", text: `The tool will report a decryption error. pdf-lib cannot decrypt a PDF with an incorrect password — the cryptographic operation fails and the tool displays an error message prompting you to try again with the correct password.` },
    ]},
    { heading: "", subHeading: "Is there a file size limit for decryption?", content: [
      { type: "paragraph", text: `No hard limit. The tool processes the entire document in memory, so very large files (over 100MB) may use significant browser memory. The decryption itself is fast — the bottleneck is loading and saving the large file, not the cryptographic operations.` },
    ]},
  ],
};

const seoSetOwnerPassword: ToolSeo = {
  sections: [
    { heading: "What is Set Owner Password?", content: [
      { type: "paragraph", text: `Set Owner Password adds an owner password to a PDF, controlling what recipients can do with the document — printing, copying text, modifying content, and adding annotations. The owner password is separate from the user (opening) password and governs permissions rather than access.` },
      { type: "paragraph", text: `The tool uses pdf-lib's encryption capabilities to apply the owner password and permission flags. You can optionally set a user password as well, which would be required to open the document. The owner password alone restricts actions without preventing viewing.` },
      { type: "paragraph", text: `The encryption is applied during the save step — the document is loaded, encryption settings are configured, and the encrypted PDF is written as a new file. The original unencrypted document is never modified.` },
      { type: "paragraph", text: `The encryption is applied during the save step. The document is loaded into memory, the encryption settings are configured on the save options, and the encrypted PDF is written as a new file. The original unencrypted document remains untouched on your device.` },
      { type: "paragraph", text: `The encryption process reads the PDF into memory, applies the owner password and permission flags to the save options, and writes the encrypted output as a new file. The encryption strength depends on the PDF version — newer PDFs support AES-256, while older ones may use RC4-128.` },
    ]},
    { heading: "How to Use Set Owner Password", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Enter an <strong>owner password</strong> in the designated field. This password controls permissions but does not prevent opening the document.`,
        `Optionally enter a <strong>user password</strong> to also require a password to open the document.`,
        `Click <strong>Set Password</strong>. The tool applies encryption with your specified passwords and permissions.`,
        `A download button appears with your file, named <code>protected.pdf</code>.`,
        `The encryption uses the standard PDF security handler, which is compatible with all major PDF readers including Adobe Acrobat, Preview, Chrome, and Edge.`,
      ]},
    ]},
    { heading: "Why Use Set Owner Password?", content: [
      { type: "paragraph", text: `Organizations distributing confidential documents need to prevent unauthorized modification or printing while still allowing recipients to view the content. The owner password enforces these restrictions at the PDF specification level, enforced by compliant readers.` },
      { type: "paragraph", text: `Legal and compliance teams protecting draft contracts, sensitive reports, or regulated documents use owner passwords to ensure the document cannot be altered after distribution, preserving the integrity of the original version.` },
      { type: "paragraph", text: `Content creators sharing previews or watermarked samples can restrict printing and copying while allowing the recipient to review the document on screen.` },
      { type: "paragraph", text: `Educational institutions distributing course materials need to prevent students from modifying content while allowing them to view and print. Owner passwords enforce these restrictions without requiring a password to open the document.` },
      { type: "paragraph", text: `Contract publishers distributing finalized agreements use owner passwords to lock down the document against modification while allowing recipients to review, print, and search the content without barriers.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the PDF, applying encryption, and saving the protected output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. Your passwords are processed locally and never leave your device.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What encryption strength is used?", content: [
      { type: "paragraph", text: `The tool uses AES-256 encryption when available, which is the strongest encryption standard supported by the PDF specification. Older PDF readers may fall back to RC4-128 if they don't support AES-256.` },
    ]},
    { heading: "", subHeading: "Can the owner password be cracked?", content: [
      { type: "paragraph", text: `Owner passwords are enforced by the PDF reader, not by the encryption itself. A determined attacker with the right tools can often bypass owner-password restrictions. The encryption protects against casual misuse, not determined adversaries. For high-security needs, combine with a strong user password.` },
    ]},
    { heading: "", subHeading: "What permissions can I set?", content: [
      { type: "paragraph", text: `With an owner password, you can restrict printing (high-resolution or disabled), text copying, content modification, and annotation addition. The specific permissions depend on the PDF reader's compliance with the PDF permission flags.` },
    ]},
    { heading: "", subHeading: "Can I set different permissions for different users?", content: [
      { type: "paragraph", text: `Not with this tool. Owner password permissions apply uniformly to anyone who opens the document. For per-user permission control, you would need a document management system with access control features.` },
    ]},
    { heading: "", subHeading: "Does the encryption work on all PDF readers?", content: [
      { type: "paragraph", text: `PDF encryption is part of the PDF specification (ISO 32000). All compliant readers support it. However, some lightweight or open-source readers may not enforce all permission flags. Adobe Acrobat and major commercial readers fully support owner-password permissions.` },
    ]},
    { heading: "", subHeading: "What if I forget the owner password I set?", content: [
      { type: "paragraph", text: `You would need to use the Unlock tool with the user password (if one was set) to decrypt the document, then re-apply a new owner password. If no user password was set, the document opens freely but the owner password restrictions remain in effect.` },
    ]},
  ],
};

const seoValidateSignature: ToolSeo = {
  sections: [
    { heading: "What is Validate Signature?", content: [
      { type: "paragraph", text: `Validate Signature verifies digital signatures embedded in a PDF document, checking whether each signature is cryptographically valid, when it was applied, and which certificate was used. The tool uses node-forge and Web Crypto APIs to parse and verify the signature structure entirely in your browser.` },
      { type: "paragraph", text: `The tool extracts the signature dictionary from the PDF, decodes the PKCS#7 signature container, verifies the certificate chain against the embedded trust anchors, and checks the document hash against the signed value. The results include signature validity, signer identity, timestamp, and any trust-chain issues.` },
      { type: "paragraph", text: `If no digital signatures are found in the PDF, the tool reports that explicitly. Multiple signatures on a single document are each validated independently, with results listed per signature.` },
      { type: "paragraph", text: `The validation results are returned as structured JSON, making them easy to integrate into automated document processing workflows. Each signature entry includes validity status, signer distinguished name, signing time, and any trust-chain warnings.` },
      { type: "paragraph", text: `The tool uses the node-forge library to parse PKCS#7 signature containers, extract X.509 certificates, and verify the cryptographic hash against the signed digest. The Web Crypto API handles SHA-256 and SHA-1 hash verification for the document content.` },
    ]},
    { heading: "How to Use Validate Signature", content: [
      { type: "list", items: [
        `Drop a signed PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Validate Signatures</strong>. The tool parses the PDF signature dictionaries, verifies the cryptographic signatures, and checks certificate chains.`,
        `A download button appears with <code>signatures.json</code> containing detailed results: number of signatures found, validity status for each, signer identity, signing time, and any trust-chain warnings.`,
        `The tool processes the PDF entirely in your browser using WebAssembly-compiled cryptography libraries. No server-side processing occurs — the signature parsing, hash verification, and certificate chain checking all happen locally.`,
      ]},
    ]},
    { heading: "Why Use Validate Signature?", content: [
      { type: "paragraph", text: `Legal and compliance teams receiving digitally signed contracts need to verify that signatures are valid before accepting the document as binding. The tool provides cryptographic proof of signature integrity without requiring Adobe Acrobat or other specialized software.` },
      { type: "paragraph", text: `Organizations processing signed invoices, purchase orders, or regulatory filings need automated verification that the signatures haven't been tampered with since signing. The JSON output can be integrated into document processing workflows.` },
      { type: "paragraph", text: `Individuals receiving signed PDFs from unknown sources can verify the signer's identity and certificate validity before trusting the document content, protecting against forged or manipulated signatures.` },
      { type: "paragraph", text: `Financial institutions processing signed loan documents, insurance claims, or regulatory filings need to verify signature authenticity before accepting documents as legally binding. The JSON output enables batch processing of signed documents in compliance workflows.` },
      { type: "paragraph", text: `Government agencies processing digitally signed permits, licenses, and certificates need automated verification to ensure signatures haven't been tampered with. The JSON output format enables integration with document management systems and compliance dashboards.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the PDF signature structure, verifying cryptographic hashes, and checking certificate chains — happens on your own device using node-forge and the Web Crypto API. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential signed documents like contracts or legal filings, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this tool verify the certificate against a trusted CA?", content: [
      { type: "paragraph", text: `The tool checks the certificate chain against the trust anchors embedded in the PDF signature dictionary. It reports whether the chain is complete and whether any certificates are expired or self-signed. For full CA validation, you would need a dedicated PKI verification tool.` },
    ]},
    { heading: "", subHeading: "Can it detect if the document was modified after signing?", content: [
      { type: "paragraph", text: `Yes. The signature verification checks the document hash against the signed value. If any bytes in the PDF have changed since the signature was applied, the verification fails and reports the document as modified.` },
    ]},
    { heading: "", subHeading: "What signature formats are supported?", content: [
      { type: "paragraph", text: `The tool supports PKCS#7 detached signatures (the standard PDF signature format), including both adbe.pkcs7.detached and adbe.pkcs7.sha1 subfilter types. Signatures using custom or non-standard formats may not be parsed correctly.` },
    ]},
    { heading: "", subHeading: "Does it detect forged signatures?", content: [
      { type: "paragraph", text: `The tool verifies cryptographic integrity — whether the signed hash matches the current document content and whether the certificate chain is valid. It cannot determine whether the signer actually authorized the signature (that requires human judgment or additional identity verification).` },
    ]},
    { heading: "", subHeading: "Can it validate signatures on encrypted PDFs?", content: [
      { type: "paragraph", text: `You would need to decrypt the PDF first using the Unlock tool, then run signature validation on the decrypted output. The signature verification requires reading the raw PDF bytes, which may be blocked by encryption.` },
    ]},
    { heading: "", subHeading: "How many signatures can it process per document?", content: [
      { type: "paragraph", text: `There is no limit. The tool iterates over all signature dictionaries in the PDF and validates each one independently. Documents with multiple signatures (sequential approvals, for example) will have each signature validated and reported separately.` },
    ]},
  ],
};

const seoTimestampPdf: ToolSeo = {
  sections: [
    { heading: "What is Timestamp PDF?", content: [
      { type: "paragraph", text: `Timestamp PDF adds an RFC 3161 timestamp to a PDF document by computing a cryptographic hash of the file and requesting a signed timestamp token from a trusted Timestamp Authority (TSA). The resulting .tsr file proves the document existed at a specific point in time.` },
      { type: "paragraph", text: `The tool uses node-forge to build the TSQ (Time Stamp Query) ASN.1 structure with a SHA-256 hash of the PDF, then sends it to FreeTSA through a server-side proxy to avoid CORS restrictions. The TSA responds with a signed timestamp token that can be verified independently.` },
      { type: "paragraph", text: `The output is a .tsr (Time Stamp Response) file containing the RFC 3161 timestamp token. This token can be embedded in the PDF using a PDF editor, or stored alongside the document as evidence of its existence at the timestamped time.` },
      { type: "paragraph", text: `The SHA-256 hash ensures that the timestamp is bound to the exact content of the PDF. If even one byte of the document changes after timestamping, the hash will no longer match, proving the document was modified after the timestamp was applied.` },
      { type: "paragraph", text: `The TSQ (Time Stamp Query) follows the RFC 3161 standard, using the SHA-256 hash algorithm and the standard OID for the timestamping policy. The response (TSR) contains the TSA certificate, the signed hash, and the authoritative timestamp time, all in a single ASN.1 structure.` },
    ]},
    { heading: "How to Use Timestamp PDF", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Add Timestamp</strong>. The tool computes a SHA-256 hash of the PDF and sends a timestamp request to FreeTSA.`,
        `A download button appears with <code>filename-timestamp.tsr</code>. This file contains the RFC 3161 timestamp token from the TSA.`,
        `The timestamp request is sent through a server-side proxy endpoint that forwards it to FreeTSA. This proxy exists because browsers cannot directly make TSA requests due to CORS restrictions. The proxy does not log or store any data from the request.`,
      ]},
    ]},
    { heading: "Why Use Timestamp PDF?", content: [
      { type: "paragraph", text: `Legal and intellectual property workflows require proof that a document existed at a specific date. A trusted timestamp from a TSA provides cryptographic evidence that is accepted by courts and regulatory bodies worldwide.` },
      { type: "paragraph", text: `Contract management systems use timestamps to establish the order of document versions and prove that specific revisions existed before certain dates, preventing backdating disputes.` },
      { type: "paragraph", text: `Archival workflows timestamp documents at the point of ingestion to create a tamper-evident record of when each document entered the system, supporting compliance with records retention policies.` },
      { type: "paragraph", text: `Software developers timestamping release builds, API responses, or compliance artifacts need cryptographic proof that specific data existed at a known time. The .tsr file provides this proof in a standard, verifiable format.` },
      { type: "paragraph", text: `Legal hold and e-discovery workflows use timestamps to establish the timeline of document creation and modification. A trusted timestamp provides non-repudiable evidence that a specific version of a document existed at a known point in time.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your PDF is processed locally — the SHA-256 hash is computed on your device. Only the hash (not the document content) is sent to the TSA proxy endpoint for timestamping. The TSA never sees your document, only its cryptographic fingerprint. No file data is stored on Racira's servers.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What TSA is used?", content: [
      { type: "paragraph", text: `The tool uses FreeTSA (freetsa.org), a free, publicly available Timestamp Authority. The request is proxied through Racira's API endpoint to avoid browser CORS restrictions. FreeTSA is widely trusted and recognized by most timestamp verification tools.` },
    ]},
    { heading: "", subHeading: "How do I verify the timestamp?", content: [
      { type: "paragraph", text: `Use a PDF signature verification tool or an RFC 3161 client to parse the .tsr file. The token contains the TSA's certificate, the signed hash, and the timestamp time. You can verify it matches the PDF's hash to confirm the document existed at the stated time.` },
    ]},
    { heading: "", subHeading: "Is the timestamp legally binding?", content: [
      { type: "paragraph", text: `RFC 3161 timestamps from trusted TSAs are recognized as legal evidence of document existence in most jurisdictions. However, a timestamp alone doesn't prove document content — it proves the hash existed at that time. For full legal weight, combine with a digital signature.` },
    ]},
    { heading: "", subHeading: "How long is a timestamp valid?", content: [
      { type: "paragraph", text: `The timestamp is valid as long as the TSA certificate chain can be verified against trusted root certificates. TSA certificates typically have 5-10 year validity periods. After the certificate expires, the timestamp can still be verified using historical certificate chain information.` },
    ]},
    { heading: "", subHeading: "What if the TSA server is unavailable?", content: [
      { type: "paragraph", text: `The tool will report an error if FreeTSA cannot be reached. You can retry later when the service is available. Timestamps are not time-critical — a delay of hours or days does not affect the validity of the timestamp once it is obtained.` },
    ]},
    { heading: "", subHeading: "Can I timestamp a document that already has a timestamp?", content: [
      { type: "paragraph", text: `Yes. Each timestamp is independent — adding a new timestamp does not affect existing ones. Multiple timestamps from different TSAs or at different times provide additional evidence of the document timeline.` },
    ]},
  ],
};

const seoNUpLayout: ToolSeo = {
  sections: [
    { heading: "What is PDF N-Up Layout Tool?", content: [
      { type: "paragraph", text: `N-Up Layout arranges multiple PDF pages onto single sheets in a grid pattern, reducing the number of pages needed for printing or review. You specify the grid dimensions (columns and rows), and each output page contains that many source pages scaled and positioned to fit.` },
      { type: "paragraph", text: `The tool uses pdf-lib to embed each source page into the output grid. Each source page is scaled uniformly to fit its grid cell while preserving aspect ratio, and centered within the cell. The output is always A4 size (595.28 x 841.89 points) regardless of the source page dimensions.` },
      { type: "paragraph", text: `Common layouts include 2-up (two pages per sheet), 4-up (four pages per sheet), and 6-up for thumbnail review. The grid dimensions are fully configurable — any combination of columns and rows works.` },
      { type: "paragraph", text: `Each source page is scaled uniformly to fit its grid cell while maintaining the original aspect ratio. If the source pages have different sizes, each is independently scaled to fit its cell, so the grid remains uniform even with mixed-size input.` },
      { type: "paragraph", text: `The scaling calculation uses Math.min(cellWidth/pageWidth, cellHeight/pageHeight) to ensure the entire page fits within its cell without cropping. This means pages with very different aspect ratios will have white space on the shorter dimension, preserving the full content.` },
    ]},
    { heading: "How to Use PDF N-Up Layout Tool", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Set the <strong>columns</strong> and <strong>rows</strong> for the grid layout. Default is 2 columns x 2 rows (4 pages per sheet).`,
        `Click <strong>Arrange</strong>. The tool scales each source page to fit its grid cell and arranges them on A4 output pages.`,
        `A download button appears with your file, named <code>n-up.pdf</code>.`,
        `The output pages are always A4 size (595.28 x 841.89 points). Source pages are scaled to fit their grid cells while maintaining aspect ratio. If source pages are larger than the cell, they are scaled down; if smaller, they are scaled up to fill the available space.`,
      ]},
    ]},
    { heading: "Why Use PDF N-Up Layout?", content: [
      { type: "paragraph", text: `Print preview workflows benefit from seeing multiple pages at once to check layout consistency, page breaks, and sequential flow without flipping through dozens of individual pages.` },
      { type: "paragraph", text: `Proofreading and editorial review become more efficient with N-Up layouts that show two or four pages side by side, making it easier to spot formatting inconsistencies, header alignment issues, and cross-page content flow.` },
      { type: "paragraph", text: `Handout and reference card creation uses N-Up to compress long documents into compact, printable summaries. A 40-page report becomes a 10-page handout at 4-up, perfect for meeting materials or quick reference guides.` },
      { type: "paragraph", text: `Legal teams reviewing large document sets use 4-up or 6-up layouts to quickly scan through hundreds of pages, identifying relevant sections without reading each page individually. The thumbnail view makes it easy to spot visual patterns and formatting issues.` },
      { type: "paragraph", text: `Printing services and copy shops use N-Up layouts to create proof sheets that show clients how their multi-page documents will look when printed at reduced size. This saves paper during the review phase before committing to full-size production runs.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the PDF, scaling pages, arranging the grid, and generating the output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What happens to pages that don't fit evenly?", content: [
      { type: "paragraph", text: `The last output page may have empty grid cells if the total number of pages isn't a perfect multiple of the grid size. For example, 10 pages in a 4-up layout produces 3 output pages, with the last one having 2 pages and 2 empty cells.` },
    ]},
    { heading: "", subHeading: "Does it preserve bookmarks and annotations?", content: [
      { type: "paragraph", text: `Page content, text, and images are preserved at the scaled size. Bookmarks and interactive form fields are not carried over to the output — the N-Up layout creates a new document with embedded page images.` },
    ]},
    { heading: "", subHeading: "Can I use different grid sizes for different sections?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool applies one grid layout to the entire document. For mixed layouts, split the document into sections first, process each with different grid settings, and merge the results.` },
    ]},
    { heading: "", subHeading: "What grid sizes work best for different use cases?", content: [
      { type: "paragraph", text: `2-up (1x2) for side-by-side proofreading, 4-up (2x2) for general review and handouts, 6-up (2x3) for thumbnail scanning of large documents, and 9-up (3x3) for high-density overview of very long documents.` },
    ]},
    { heading: "", subHeading: "Can I add page borders or dividers between the N-Up cells?", content: [
      { type: "paragraph", text: `Not with this tool. The output contains the scaled page content without any added borders, gridlines, or dividers. For separated cells, you would need to add margins to each source page before running the N-Up tool.` },
    ]},
    { heading: "", subHeading: "What output page size is used?", content: [
      { type: "paragraph", text: `The output is always A4 (595.28 x 841.89 points). Source pages of any size are scaled to fit the grid cells. If you need a different output page size, the tool does not currently support it — the A4 dimensions are hardcoded.` },
    ]},
  ],
};

const seoCreateBooklet: ToolSeo = {
  sections: [
    { heading: "What is PDF Booklet Maker?", content: [
      { type: "paragraph", text: `PDF Booklet Maker reorders pages for saddle-stitch booklet printing, placing pages side-by-side on spreads that fold into a properly sequenced booklet. The tool calculates the imposition layout so that when you print double-sided, fold, and staple, the pages appear in the correct reading order.` },
      { type: "paragraph", text: `The tool pads the page count to the nearest multiple of 4 (booklets require page counts divisible by 4), then arranges pages using the standard booklet imposition pattern: the first and last pages go on the outer spread, the second and second-to-last on the next spread, and so on.` },
      { type: "paragraph", text: `Each output spread is twice the width of the source page, with the left page on the left half and the right page on the right half. Blank pages are inserted where the source document doesn't have enough pages to fill a spread.` },
      { type: "paragraph", text: `The imposition algorithm follows the standard bookbinding industry pattern. For a 16-page booklet, page 1 pairs with page 16 on the outer spread, page 2 with page 15 on the next, and so on until the center spread (page 8 and page 9). This ensures correct reading order after folding.` },
      { type: "paragraph", text: `The page count padding adds blank pages as needed to reach a multiple of 4. Blank pages are plain white with the same dimensions as the source pages. They appear at the end of the booklet where they won't interrupt the reading flow of the content.` },
    ]},
    { heading: "How to Use PDF Booklet Maker", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Create Booklet</strong>. The tool calculates the imposition layout, pads the page count to a multiple of 4, and arranges pages into spreads.`,
        `A download button appears with your file, named <code>booklet.pdf</code>. Print this document double-sided, fold in half, and staple at the fold for a saddle-stitch booklet.`,
        `The tool preserves the original page dimensions in each half of the spread. If your source is letter-size (612 x 792 points), each output spread is 1224 x 792 points — two letter-size pages side by side.`,
      ]},
    ]},
    { heading: "Why Use PDF Booklet Maker?", content: [
      { type: "paragraph", text: `Self-publishing authors and small-press publishers create booklets for zines, chapbooks, programs, and manuals. The imposition tool eliminates the manual page-sorting that makes booklet preparation tedious and error-prone.` },
      { type: "paragraph", text: `Event organizers producing programs, schedules, or informational booklets need the pages in imposition order for professional saddle-stitch printing. This tool generates the print-ready layout directly from a sequentially-ordered PDF.` },
      { type: "paragraph", text: `Educational materials like study guides, workbooks, and reference sheets are commonly distributed as stapled booklets. The tool converts any PDF into the correct imposition format for in-office or print-shop production.` },
      { type: "paragraph", text: `Nonprofit organizations and community groups producing event programs, fundraising booklets, or informational pamphlets need cost-effective booklet production. The tool generates print-ready imposition layouts that can be produced on standard office printers.` },
      { type: "paragraph", text: `Marketing teams creating product catalogs, event programs, or promotional booklets use the tool to prepare print-ready layouts from sequentially-authored PDFs, eliminating the need for manual imposition in desktop publishing software.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the PDF, calculating imposition, embedding pages, and generating booklet spreads — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What if my page count isn't a multiple of 4?", content: [
      { type: "paragraph", text: `The tool automatically pads the document to the nearest multiple of 4 by adding blank pages at the end. For example, a 10-page document becomes 12 pages (2 blank pages added), producing 6 spreads.` },
    ]},
    { heading: "", subHeading: "Does it work with different page sizes?", content: [
      { type: "paragraph", text: `The output spreads use double the source page width. All source pages are embedded at their original size, so pages with different dimensions will appear at different scales within their spread half. For consistent output, ensure all source pages have the same dimensions.` },
    ]},
    { heading: "", subHeading: "How do I print the booklet?", content: [
      { type: "paragraph", text: `Print the output PDF double-sided (flip on long edge), then fold the stack in half along the center spine. The pages will be in the correct reading order. Staple or bind at the fold line for a saddle-stitch booklet.` },
    ]},
    { heading: "", subHeading: "How many blank pages are added for padding?", content: [
      { type: "paragraph", text: `The tool pads to the nearest multiple of 4 above the current page count. A 5-page document becomes 8 pages (3 blank added), a 9-page document becomes 12 pages (3 blank added). Blank pages appear at the end of the booklet where they won't interfere with content.` },
    ]},
    { heading: "", subHeading: "Does the output include crop marks or fold guides?", content: [
      { type: "paragraph", text: `No. The output contains only the page content arranged in imposition order. For professional printing that requires crop marks, registration marks, or fold guides, you would need to add these using a print-preparation tool after generating the booklet layout.` },
    ]},
    { heading: "", subHeading: "Does this tool handle different page sizes within the same document?", content: [
      { type: "paragraph", text: `The output spread width is determined by the first page dimensions. All subsequent pages are embedded at their original size, so pages with different dimensions may extend beyond or fall short of their half of the spread. For consistent results, use documents with uniform page sizes.` },
    ]},
  ],
};

const seoDuplexSimulator: ToolSeo = {
  sections: [
    { heading: "What is Duplex Simulator?", content: [
      { type: "paragraph", text: `Duplex Simulator flips every odd-numbered page (page 2, 4, 6, etc.) by 180 degrees to simulate how a double-sided document would look when printed with specific duplex binding. This lets you preview the back-side orientation before committing to paper.` },
      { type: "paragraph", text: `The tool uses pdf-lib to rotate odd pages by 180 degrees. You can choose between long-edge binding (flip along the long edge of the paper) and short-edge binding (flip along the short edge), which determines which pages need rotation.` },
      { type: "paragraph", text: `The output preserves all content, formatting, and page dimensions — only the rotation angle of odd pages changes. This is a metadata operation that doesn't re-render or re-encode any content.` },
      { type: "paragraph", text: `The tool modifies only the rotation metadata on odd-numbered pages. Page content, dimensions, annotations, and bookmarks are all preserved. The rotation is a display hint that tells PDF readers to render the page rotated, exactly as it would appear when physically flipped.` },
      { type: "paragraph", text: `The flip edge setting determines which pages need rotation. For long-edge binding (standard portrait), odd pages are rotated because flipping along the long edge inverts them. For short-edge binding (landscape or top-bound), the rotation pattern changes to match the different flip axis.` },
    ]},
    { heading: "How to Use Duplex Simulator", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Select the <strong>flip edge</strong>: long edge (default, for standard portrait binding) or short edge (for landscape or top-bound documents).`,
        `Click <strong>Simulate Duplex</strong>. The tool rotates every odd page by 180 degrees according to your selected flip edge.`,
        `A download button appears with your file, named <code>duplex-simulated.pdf</code>.`,
        `The tool processes all odd-numbered pages (2, 4, 6, etc.) in a single pass. Even pages (1, 3, 5) are left unchanged. The rotation is applied as a page-level metadata flag, not by re-rendering the content.`,
      ]},
    ]},
    { heading: "Why Use Duplex Simulator?", content: [
      { type: "paragraph", text: `Print operators need to verify that double-sided documents will read correctly before printing large runs. The simulator reveals which pages will appear upside-down when flipped, allowing corrections to the source document before wasting paper.` },
      { type: "paragraph", text: `Documents designed for single-sided reading often need adjustment when switching to duplex printing. Headers, footers, and page numbers on odd pages may appear inverted after flipping — the simulator catches these issues early.` },
      { type: "paragraph", text: `Book and report designers creating content for double-sided binding use the simulator to verify that spreads align correctly and that content near the binding edge doesn't get lost in the gutter.` },
      { type: "paragraph", text: `Office administrators preparing multi-page documents for duplex printing on shared printers need to verify that the output will be readable from both sides. The simulator reveals orientation issues before committing to a large print job.` },
      { type: "paragraph", text: `Print production teams preparing documents for automated duplex printers need to verify orientation before running large print jobs. The simulator reveals which pages will appear inverted after flipping, allowing corrections to headers, footers, and page numbers before wasting paper and toner.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the PDF, rotating odd pages, and saving the output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this actually change the content?", content: [
      { type: "paragraph", text: `No. Rotation is a metadata flag in the PDF specification. The page content, text, and images are not re-rendered. The rotation flag tells PDF readers to display the page rotated, which is exactly what happens when you flip a printed page.` },
    ]},
    { heading: "", subHeading: "When should I use long edge vs short edge?", content: [
      { type: "paragraph", text: `Long edge is the standard for portrait-oriented documents — you flip the page along its longer side (the left edge for left-to-right binding). Short edge is for landscape documents or top-bound notebooks where you flip along the shorter side.` },
    ]},
    { heading: "", subHeading: "Can I undo the simulation?", content: [
      { type: "paragraph", text: `Yes. Run the tool again on the simulated output with the same flip edge — rotating 180 degrees twice returns to the original orientation. Alternatively, use the Rotate tool to manually correct specific pages.` },
    ]},
    { heading: "", subHeading: "Why only odd pages and not even pages?", content: [
      { type: "paragraph", text: `In standard duplex printing, even pages (2, 4, 6) are printed on the back of odd pages (1, 3, 5). When you flip the printed sheet along the binding edge, the even pages rotate 180 degrees. Pre-rotating the odd pages compensates for this flip, so both sides read correctly.` },
    ]},
    { heading: "", subHeading: "Does this work with PDFs that already have rotated pages?", content: [
      { type: "paragraph", text: `Yes. The tool adds 180 degrees to the existing rotation of odd pages. If a page is already rotated 90 degrees, the result is 270 degrees. The tool does not normalize existing rotations — it only adds the duplex flip rotation.` },
    ]},
    { heading: "", subHeading: "Will this work with PDFs that already have some rotated pages?", content: [
      { type: "paragraph", text: `Yes. The tool adds 180 degrees to the current rotation of each odd page. If a page is already rotated (for example, a landscape page in a portrait document), the additional 180-degree rotation is applied on top of the existing rotation.` },
    ]},
  ],
};

const seoAddTextBox: ToolSeo = {
  sections: [
    { heading: "What is Add Text Box?", content: [
      { type: "paragraph", text: `Add Text Box places a bordered rectangular text annotation on a specific page of a PDF at coordinates you specify. The tool draws a white rectangle with a black border, then renders text inside it using Helvetica at 12pt.` },
      { type: "paragraph", text: `You configure the page number, x/y position, width, height, and text content. The text box is drawn directly onto the page's content stream using pdf-lib, making it a permanent part of the PDF — not an annotation that can be removed by a PDF reader.` },
      { type: "paragraph", text: `The default dimensions are 200x40 points at position (50, 400), but all parameters are fully configurable. The text is positioned 5 points from the left edge and 18 points from the top of the text box rectangle.` },
      { type: "paragraph", text: `The text box is drawn as a permanent part of the page content. The white rectangle background ensures the text is readable even over busy or dark page content. The black border makes the annotation visually distinct from the surrounding document.` },
      { type: "paragraph", text: `The text box consists of two elements drawn on the page content stream: a filled white rectangle with a black border (drawn first, so it appears behind the text), and the text itself rendered in Helvetica at 12pt. Both elements are permanent parts of the PDF content.` },
    ]},
    { heading: "How to Use Add Text Box", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Specify the <strong>page number</strong> (1-indexed) where the text box should appear.`,
        `Set the <strong>x and y coordinates</strong> (in PDF points, where 72 points = 1 inch). Default: x=50, y=400.`,
        `Set the <strong>width and height</strong> of the text box rectangle. Default: 200x40 points.`,
        `Enter the <strong>text content</strong> to display inside the box.`,
        `Click <strong>Add Text Box</strong>. The tool draws the bordered rectangle and renders the text on the specified page.`,
        `A download button appears with your file, named <code>text-box-added.pdf</code>.`,
        `The text is rendered using the standard Helvetica font at 12pt size. For longer text that exceeds the box width, the tool truncates at the box boundary. The text position within the box is fixed at 5 points from the left and 18 points from the top.`,
      ]},
    ]},
    { heading: "Why Use Add Text Box?", content: [
      { type: "paragraph", text: `Reviewers and editors adding comments, labels, or callouts to PDF pages need a quick way to place visible text markers without specialized annotation tools. The text box creates a permanent, visible marker that travels with the document.` },
      { type: "paragraph", text: `Form fillers and data entry workers adding reference numbers, dates, or classification labels to printed PDF pages use text boxes to stamp information at specific locations on the page.` },
      { type: "paragraph", text: `Designers and proofreaders marking up layouts need bordered text annotations that stand out from the page content. The white background and black border ensure the annotation is visible regardless of the underlying content.` },
      { type: "paragraph", text: `Quality assurance inspectors marking defect locations, page references, or review notes directly on PDF pages use text boxes as visible, permanent annotations that cannot be accidentally removed or hidden by PDF viewer settings.` },
      { type: "paragraph", text: `Legal document reviewers adding exhibit labels, bates numbers, or confidentiality markings use text boxes to stamp visible identifiers directly on specific pages, creating a permanent record that travels with the document.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the PDF, drawing the text box rectangle, rendering the text, and saving the output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Is the text box editable after adding it?", content: [
      { type: "paragraph", text: `No. The text box is drawn directly onto the page content stream as vector graphics and text, not as a PDF annotation object. Once added, it cannot be moved or edited with standard PDF tools. To modify it, you would need to redraw the page content.` },
    ]},
    { heading: "", subHeading: "Can I change the font, size, or colors?", content: [
      { type: "paragraph", text: `Not with this tool. The font is fixed at Helvetica 12pt, the border is black, and the background is white. For custom styling, use the Add Callout tool or a dedicated PDF editor.` },
    ]},
    { heading: "", subHeading: "How do PDF coordinates work?", content: [
      { type: "paragraph", text: `PDF coordinates use points (1 point = 1/72 inch). The origin (0,0) is at the bottom-left corner of the page. Y increases upward, so y=400 places the text box near the top of a standard letter page (which is 792 points tall).` },
    ]},
    { heading: "", subHeading: "Can I add multiple text boxes to the same page?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool adds one text box per run. To add multiple boxes, run the tool multiple times, using the output of each run as the input for the next. Each run adds one box at the specified coordinates.` },
    ]},
    { heading: "", subHeading: "Can I add text boxes to multiple pages at once?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool targets one page per run. To add text boxes to multiple pages, run the tool once for each page, using the output of each run as the input for the next. This sequential approach ensures each box is placed correctly.` },
    ]},
    { heading: "", subHeading: "What if my text is too long for the box?", content: [
      { type: "paragraph", text: `The text is rendered at the specified position and will extend beyond the box boundary if it is too long. The tool does not auto-wrap or truncate text. To prevent overflow, either increase the box width or shorten the text content.` },
    ]},
  ],
};

const seoComparePdfs: ToolSeo = {
  sections: [
    { heading: "What is Compare PDFs?", content: [
      { type: "paragraph", text: `Compare PDFs renders two PDF documents side by side and highlights the visual differences between them. Each page of both documents is rendered using pdf.js, and a pixel-level comparison identifies areas where the content has changed.` },
      { type: "paragraph", text: `The tool uses canvas-based rendering to capture each page as an image, then performs a pixel-by-pixel diff. Changed pixels are highlighted with a colored overlay, making it easy to spot text edits, image changes, layout shifts, and annotation differences.` },
      { type: "paragraph", text: `The comparison is visual, not structural — it detects what changed in the rendered output, not what changed in the underlying PDF data. This means formatting-only changes (like font substitution) that render identically won't be flagged, while content changes that look different will be.` },
      { type: "paragraph", text: `The comparison works by rendering each page of both documents at the same resolution using pdf.js, then performing a per-pixel color difference calculation. Pixels that differ beyond a configurable threshold are highlighted with a colored overlay, making changes immediately visible.` },
      { type: "paragraph", text: `The pixel comparison uses a color-distance algorithm that calculates the Euclidean distance between corresponding pixels in the two rendered images. Pixels with a distance above the threshold are marked as changed, while minor anti-aliasing differences fall below the threshold and are ignored.` },
    ]},
    { heading: "How to Use Compare PDFs", content: [
      { type: "list", items: [
        `Upload the <strong>original PDF</strong> (the reference document) onto the upload zone.`,
        `Upload the <strong>modified PDF</strong> (the document to compare) in the second upload zone.`,
        `Click <strong>Compare</strong>. The tool renders both documents page by page and highlights visual differences.`,
        `Browse through the side-by-side comparison. Pages with changes are marked, and the diff overlay shows exactly which areas differ.`,
        `The comparison renders both documents at the same DPI to ensure pixel alignment. Pages are compared in order — page 1 of the original against page 1 of the modified, and so on. If the documents have different page counts, extra pages in either document are noted but have no counterpart to compare against.`,
      ]},
    ]},
    { heading: "Why Use Compare PDFs?", content: [
      { type: "paragraph", text: `Legal teams reviewing contract revisions need to identify every change between draft versions. Visual comparison catches subtle modifications — number changes, clause rewording, added or removed pages — that text-based diff tools might miss due to PDF encoding differences.` },
      { type: "paragraph", text: `Quality assurance teams verifying that PDF exports match source documents use visual comparison to catch rendering discrepancies between the original and the exported version.` },
      { type: "paragraph", text: `Designers comparing proof versions track layout changes, image updates, and typography adjustments across revision cycles. The pixel-level diff ensures even small visual changes are flagged for review.` },
      { type: "paragraph", text: `Version control for PDF-heavy workflows benefits from visual comparison. When multiple stakeholders annotate, revise, and re-export the same document, visual diff ensures no change goes unnoticed — even subtle shifts in positioning, color, or sizing that text-based comparison would miss.` },
      { type: "paragraph", text: `Regulatory compliance teams comparing submitted documents against approved templates need to verify that no unauthorized changes were made. Visual comparison provides intuitive evidence of exactly what changed, where, and by how much.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering both PDFs to canvas, performing the pixel comparison, and generating the diff overlay — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. For confidential legal documents, contracts, or financial reports, this means the tool is suitable for material you would not trust to an upload service.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does it compare text content or visual rendering?", content: [
      { type: "paragraph", text: `Visual rendering. Both PDFs are rendered to images and the images are compared pixel-by-pixel. This catches all visible changes including text edits, image swaps, layout shifts, and color changes. Text-only changes that render identically (same font, same position) won't be flagged.` },
    ]},
    { heading: "", subHeading: "What if the PDFs have different page counts?", content: [
      { type: "paragraph", text: `The tool compares pages that exist in both documents. If one PDF has more pages than the other, the extra pages are noted but there are no corresponding pages to compare them against.` },
    ]},
    { heading: "", subHeading: "Can I export the comparison results?", content: [
      { type: "paragraph", text: `The comparison is displayed interactively in the browser. There is no export-to-PDF or export-to-image function for the diff results. You can take a screenshot of the comparison view for your records.` },
    ]},
    { heading: "", subHeading: "How sensitive is the pixel comparison?", content: [
      { type: "paragraph", text: `The comparison uses a color-distance threshold to account for minor anti-aliasing differences. Identical content rendered at the same resolution will show no differences. Minor rendering variations (sub-pixel alignment, font hinting) are filtered out by the threshold.` },
    ]},
    { heading: "", subHeading: "Can I compare a PDF against itself to check for rendering consistency?", content: [
      { type: "paragraph", text: `Yes. Comparing a document against itself should produce zero differences. If differences appear, it may indicate non-deterministic rendering behavior in the PDF viewer, which can be useful for testing renderer consistency.` },
    ]},
    { heading: "", subHeading: "Does it compare bookmarks, annotations, or form fields?", content: [
      { type: "paragraph", text: `No. The comparison is strictly visual — it compares the rendered output of each page, not the PDF structure. Bookmarks, annotations, form fields, and metadata differences are not detected. Only changes visible in the rendered page images are highlighted.` },
    ]},
  ],
};

const seoFormFieldExtract: ToolSeo = {
  sections: [
    { heading: "What is Form Field Extract?", content: [
      { type: "paragraph", text: `Form Field Extract identifies and lists all interactive form fields in a PDF document, showing each field's name, type, current value, and page location. The tool uses pdf.js to parse the AcroForm structure and extracts the complete field inventory.` },
      { type: "paragraph", text: `The output is a structured summary of every form field found in the document — text inputs, checkboxes, radio buttons, dropdowns, and signature fields. For each field, the tool reports the field name (T entry), field type (Tx, Btn, Ch, Sig), current value, and the page number where it appears.` },
      { type: "paragraph", text: `This is a read-only inspection tool — it does not modify the PDF or fill in any fields. The extraction is useful for auditing forms, verifying field names before automation, and understanding the structure of PDF forms you receive from external sources.` },
      { type: "paragraph", text: `The JSON output includes nested structure for fields with parents (like radio button groups), field flags that indicate read-only, required, or no-print status, and the page index where each field widget is rendered.` },
    ]},
    { heading: "How to Use Form Field Extract", content: [
      { type: "list", items: [
        `Drop a PDF with form fields onto the upload zone, or click to browse and select it.`,
        `Click <strong>Extract Fields</strong>. The tool parses the AcroForm dictionary and extracts every form field's metadata.`,
        `A download button appears with <code>form-fields.json</code> containing the complete field inventory: names, types, values, and page locations.`,
      ]},
    ]},
    { heading: "Why Use Form Field Extract?", content: [
      { type: "paragraph", text: `Developers building PDF form automation need to know the exact field names and types before writing scripts to fill forms programmatically. Extracting the field inventory first prevents errors from guessing field names or types.` },
      { type: "paragraph", text: `Compliance teams auditing PDF forms need to verify that all required fields are present, correctly named, and properly typed. The JSON output provides a machine-readable inventory that can be compared against form specifications.` },
      { type: "paragraph", text: `When receiving filled forms from clients or partners, extracting the field data lets you verify what was entered without opening the PDF in a form-capable reader. The current values are included in the extraction output.` },
      { type: "paragraph", text: `Data migration teams converting paper forms to digital need to understand the existing form structure before building automation scripts. The field inventory provides the exact names and types needed for programmatic form filling.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the PDF form structure, extracting field metadata, and generating the JSON output — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What form field types are detected?", content: [
      { type: "paragraph", text: `The tool detects all standard AcroForm field types: text fields (Tx), checkboxes and radio buttons (Btn), dropdowns and list boxes (Ch), and signature fields (Sig). Custom or non-standard field types may appear with generic type labels.` },
    ]},
    { heading: "", subHeading: "Does it extract the field values?", content: [
      { type: "paragraph", text: `Yes. The current value of each field is included in the extraction output. For text fields, this is the entered text. For checkboxes, it is the checked/unchecked state. For dropdowns, it is the selected option.` },
    ]},
    { heading: "", subHeading: "What if the PDF has no form fields?", content: [
      { type: "paragraph", text: `The tool reports an empty field list with a message indicating no interactive form fields were found. This is common for PDFs that look like forms but are actually flat images or static text without interactive elements.` },
    ]},
    { heading: "", subHeading: "Does it extract field appearances or just metadata?", content: [
      { type: "paragraph", text: `Metadata only — field names, types, values, and page locations. Visual appearances (fonts, colors, borders) are not extracted. For visual inspection, use the Highlight Form Fields tool instead.` },
    ]},
    { heading: "", subHeading: "How does it handle encrypted PDFs?", content: [
      { type: "paragraph", text: `If the PDF requires a password to open, the extraction will fail until the document is decrypted. Use the Unlock tool first to remove the password, then run field extraction on the decrypted output.` },
    ]},
  ],
};

const seoRemoveSignatures: ToolSeo = {
  sections: [
    { heading: "What is Remove Signatures?", content: [
      { type: "paragraph", text: `Remove Signatures covers visual signature images and signature field annotations from a PDF by drawing white rectangles over their bounding boxes and clearing the annotation list. The tool uses pdf.js to locate signature annotations and pdf-lib to white them out.` },
      { type: "paragraph", text: `The tool specifically targets Widget, Stamp, and Sig annotation subtypes — the three annotation types that PDF signatures use. For each detected signature, it calculates the bounding rectangle and draws a white filled rectangle over it, effectively erasing the visual signature from the page.` },
      { type: "paragraph", text: `Important: this tool removes visual signature images only. Cryptographic (digital) signatures embedded in the PDF are not invalidated or removed — the signature data remains in the document structure. The tool includes a message noting this limitation in its output.` },
      { type: "paragraph", text: `The white-out approach ensures that even if the annotation metadata is cleared, the visual signature image is still covered by a white rectangle. This double-layer removal provides confidence that the signature is no longer visible in any PDF viewer.` },
    ]},
    { heading: "How to Use Remove Signatures", content: [
      { type: "list", items: [
        `Drop a signed PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Remove Signatures</strong>. The tool scans every page for Widget, Stamp, and Sig annotations, draws white rectangles over them, and clears the annotation list.`,
        `A download button appears with your file, named <code>signatures-removed.pdf</code>. The output includes a note that visual signatures were removed but cryptographic signatures remain.`,
      ]},
    ]},
    { heading: "Why Use Remove Signatures?", content: [
      { type: "paragraph", text: `Legal teams processing signed documents need to create unsigned copies for redaction, re-distribution, or internal review. Removing visual signatures creates a clean document while preserving the original page content.` },
      { type: "paragraph", text: `Document preparers who receive forms with signature images stamped on them need to clean up the visual appearance before re-processing or archiving. The white-out approach removes the signature without affecting the underlying form content.` },
      { type: "paragraph", text: `When testing form filling workflows, existing signature images on test documents can interfere with the visual layout. Removing them creates a clean baseline for testing new signature placements.` },
      { type: "paragraph", text: `Organizations processing signed legal filings need to create clean versions for internal distribution. The white-out approach ensures the signature is visually removed even in PDF readers that might still render cleared annotations.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing annotations, drawing white rectangles, and clearing the annotation list — happens on your own device using pdf.js and pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this invalidate digital signatures?", content: [
      { type: "paragraph", text: `No. This tool removes visual signature images (the picture of a handwritten signature). Cryptographic digital signatures — the encrypted verification data embedded in the PDF — are not modified. If the document had a cryptographic signature, it will likely report as invalid after visual modification.` },
    ]},
    { heading: "", subHeading: "What happens to form fields near the signature?", content: [
      { type: "paragraph", text: `The tool only targets signature annotations. Other form fields (text inputs, checkboxes, dropdowns) are not affected. However, if a signature annotation overlaps with other annotations, the white rectangle may visually cover part of those overlapping elements.` },
    ]},
    { heading: "", subHeading: "Can it remove all signatures at once?", content: [
      { type: "paragraph", text: `Yes. The tool scans every page and removes all detected signature annotations in a single pass. Documents with multiple signatures on different pages will have all of them removed.` },
    ]},
    { heading: "", subHeading: "Does it remove signature form fields or just annotations?", content: [
      { type: "paragraph", text: `Both. The tool targets Widget annotations (form fields), Stamp annotations (stamped images), and Sig annotations (signature dictionaries). All three are cleared from the annotation list and visually covered.` },
    ]},
    { heading: "", subHeading: "Will the white rectangles be visible in all PDF readers?", content: [
      { type: "paragraph", text: `Yes. The white rectangles are drawn as page content, not annotations, so they render identically in every PDF reader. The signature area appears as a blank white space.` },
    ]},
  ],
};

const seoSignPdf: ToolSeo = {
  sections: [
    { heading: "What is Sign PDF?", content: [
      { type: "paragraph", text: `Sign PDF provides an interactive signature placement tool that lets you draw, type, or upload a signature and position it anywhere on a PDF page. The tool renders the PDF in a built-in viewer and overlays a draggable signature element that you can resize and move before finalizing.` },
      { type: "paragraph", text: `The signature is captured as a canvas drawing or uploaded image, then embedded into the PDF's annotation layer using pdf.js's annotation storage system. The final PDF includes the signature as a permanent stamp annotation at the position and size you specified.` },
      { type: "paragraph", text: `This is a visual signature tool — it places an image of your signature on the document but does not create a cryptographic digital signature. For legally binding digital signatures with certificate-based verification, use the Validate Signature tool to check existing digital signatures instead.` },
      { type: "paragraph", text: `The built-in PDF viewer uses pdf.js to render each page at high resolution, providing a pixel-perfect preview of where your signature will appear. The signature overlay is rendered at the same resolution for accurate placement.` },
    ]},
    { heading: "How to Use Sign PDF", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it. The document opens in a built-in PDF viewer.`,
        `Choose your signature method: <strong>Draw</strong> (freehand drawing on a canvas), <strong>Type</strong> (text rendered in a signature-style font), or <strong>Upload</strong> (import an image of your signature).`,
        `Position the signature on the desired page by dragging it to the correct location. Resize using the corner handles if needed.`,
        `Click <strong>Apply Signature</strong>. The tool embeds the signature as a stamp annotation and saves the modified PDF.`,
        `A download button appears with your signed PDF.`,
      ]},
    ]},
    { heading: "Why Use Sign PDF?", content: [
      { type: "paragraph", text: `Contract review workflows often require a quick signature on documents that don't need cryptographic verification. Internal approvals, acknowledgement forms, and non-binding agreements benefit from the speed of visual signature placement without the complexity of certificate management.` },
      { type: "paragraph", text: `Remote workers signing documents on shared computers need a fast way to add their signature without installing specialized software. The browser-based tool works on any device with a screen and input device.` },
      { type: "paragraph", text: `When you receive a PDF that needs your signature but you don't have a dedicated PDF editor installed, this tool provides immediate signature capability through the browser without any software installation or account creation.` },
      { type: "paragraph", text: `Real estate agents, insurance adjusters, and field service workers who need to sign documents on-site use the browser-based tool on tablets and phones without requiring a dedicated PDF signing application installed on the device.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The PDF is rendered using pdf.js, your signature is captured locally, and the final signed document is generated entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. Your signature image never leaves your device.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Is this a legally binding signature?", content: [
      { type: "paragraph", text: `Visual signatures placed with this tool are equivalent to a printed signature — they show intent but do not provide cryptographic verification of identity. For legally binding digital signatures with certificate-based verification, you would need a dedicated digital signing service.` },
    ]},
    { heading: "", subHeading: "Can I place multiple signatures on the same document?", content: [
      { type: "paragraph", text: `Yes. After applying the first signature, re-upload the signed PDF and add another signature. Each pass adds one signature annotation. Signatures from different people can be placed on different pages or the same page.` },
    ]},
    { heading: "", subHeading: "What image formats are accepted for upload?", content: [
      { type: "paragraph", text: `PNG and JPG images are supported. The image should have a transparent or white background for best results. Images with complex backgrounds may appear as a rectangular stamp on the document.` },
    ]},
    { heading: "", subHeading: "Can I resize the signature after placing it?", content: [
      { type: "paragraph", text: `Yes. Before clicking Apply, you can drag the signature to reposition it and use the corner handles to resize. Once applied, the signature is embedded as a permanent annotation and cannot be moved without re-signing.` },
    ]},
    { heading: "", subHeading: "Does the tool save the original PDF or overwrite it?", content: [
      { type: "paragraph", text: `The tool creates a new PDF with the signature embedded. The original file is never modified. You download the new signed version, leaving the original untouched on your device.` },
    ]},
  ],
};

const seoUniformPageSize: ToolSeo = {
  sections: [
    { heading: "What is Uniform Page Size?", content: [
      { type: "paragraph", text: `Uniform Page Size resizes every page in a PDF to a standard page dimension (A4, Letter, A3, or Legal). Pages that are already the target size pass through unchanged. Pages that are larger or smaller are resized and their content is centered on the new page.` },
      { type: "paragraph", text: `The tool uses pdf-lib to set each page's dimensions and translate the content stream so the original content is centered within the new page bounds. If a page is smaller than the target, the content shifts to center it. If larger, the content shifts inward.` },
      { type: "paragraph", text: `The content is not scaled — only the page boundaries and content position change. This means a page larger than the target will have content that extends beyond the new page edges if the original content was close to the original page boundaries.` },
      { type: "paragraph", text: `The content translation uses the formula (newSize - oldSize) / 2 to calculate the offset. This centers the content on the new page. If the original page was wider than the target, the content shifts inward horizontally. If taller, it shifts inward vertically.` },
    ]},
    { heading: "How to Use Uniform Page Size", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Select the target <strong>page size</strong>: A4 (595.28 x 841.89 pt), Letter (612 x 792 pt), A3 (841.89 x 1190.55 pt), or Legal (612 x 1008 pt).`,
        `Click <strong>Resize</strong>. The tool sets every page to the target dimensions and centers the content.`,
        `A download button appears with your file, named <code>uniform-size.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Uniform Page Size?", content: [
      { type: "paragraph", text: `Documents combining pages from multiple sources often have inconsistent page sizes — a mix of letter, legal, and A4 pages that looks unprofessional when printed or viewed. Standardizing the page size creates a consistent document.` },
      { type: "paragraph", text: `Print shops and commercial printers require documents in a specific page size for their workflows. Resizing to the required standard before submission prevents print errors, scaling issues, and unexpected margins.` },
      { type: "paragraph", text: `PDF archiving standards (like PDF/A) often require consistent page dimensions. Resizing mixed-size documents to a single standard ensures compliance with archival requirements.` },
      { type: "paragraph", text: `Legal document compilers merging filings from multiple courts need consistent page sizes for filing. Different courts may use letter, legal, or A4 — standardizing before submission prevents rejection for formatting non-compliance.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the PDF, resizing pages, centering content, and saving the output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will resizing cut off content on larger pages?", content: [
      { type: "paragraph", text: `Content is centered, not scaled. If a page is significantly larger than the target size, content near the edges may extend beyond the new page boundaries. For a safer approach, use the Add Margin tool first to create padding, then resize.` },
    ]},
    { heading: "", subHeading: "Does it preserve bookmarks and annotations?", content: [
      { type: "paragraph", text: `Bookmarks, links, and annotations are preserved during the resize. Form fields may shift position if they were near page edges, since the content translation affects their coordinates.` },
    ]},
    { heading: "", subHeading: "Can I resize to a custom page size?", content: [
      { type: "paragraph", text: `Not with this tool — only the four standard sizes (A4, Letter, A3, Legal) are available. For custom dimensions, use the Add Margin tool to adjust page sizes manually, or use a dedicated PDF editor with custom page size support.` },
    ]},
    { heading: "", subHeading: "What if some pages are much larger than the target?", content: [
      { type: "paragraph", text: `Content near the edges of large pages may extend beyond the new page boundaries since only position (not scale) is adjusted. For mixed-size documents, consider adding margins first with the Add Margin tool to ensure content fits within the target dimensions.` },
    ]},
    { heading: "", subHeading: "Does it handle pages with different orientations?", content: [
      { type: "paragraph", text: `Each page is resized independently. A landscape page and a portrait page in the same document will both be resized to the target dimensions, but their content orientation is preserved. The tool does not rotate pages.` },
    ]},
  ],
};

const seoHighlightFormFields: ToolSeo = {
  sections: [
    { heading: "What is Highlight Form Fields?", content: [
      { type: "paragraph", text: `Highlight Form Fields draws semi-transparent colored rectangles over every interactive form field in a PDF, making it easy to see where fillable fields are located. The tool uses pdf-lib to iterate over all AcroForm fields and draw colored overlays on each widget rectangle.` },
      { type: "paragraph", text: `The default highlight color is yellow (#ffff00) at 30% opacity, but any hex color can be specified. The overlay is drawn directly on the page content, creating a permanent visual indicator of every form field's position and size.` },
      { type: "paragraph", text: `This is a visual inspection tool — it does not modify the form fields themselves. After highlighting, you can clearly see which areas of the document are interactive (fillable) versus static content, useful for form auditing and quality assurance.` },
      { type: "paragraph", text: `The tool iterates over every AcroForm field in the document, extracts each widget rectangle (position and dimensions), and draws a semi-transparent filled rectangle at that location. Fields with multiple widgets (like radio button groups) have each widget highlighted individually.` },
    ]},
    { heading: "How to Use Highlight Form Fields", content: [
      { type: "list", items: [
        `Drop a PDF with form fields onto the upload zone, or click to browse and select it.`,
        `Optionally specify a <strong>highlight color</strong> as a hex code (default: #ffff00 yellow).`,
        `Click <strong>Highlight Fields</strong>. The tool iterates over all AcroForm fields and draws semi-transparent colored rectangles over each widget.`,
        `A download button appears with your file, named <code>highlighted-fields.pdf</code>. All form fields are now visually highlighted.`,
      ]},
    ]},
    { heading: "Why Use Highlight Form Fields?", content: [
      { type: "paragraph", text: `Quality assurance teams reviewing PDF forms need to verify that all expected fields are present and correctly positioned. Highlighting makes invisible form fields visible, ensuring no field is missing or misaligned.` },
      { type: "paragraph", text: `When training users on form-filling workflows, highlighted fields make it immediately obvious where input is expected. The visual guide reduces confusion about which areas are interactive.` },
      { type: "paragraph", text: `Form designers verifying their PDF output use highlighting to confirm that field positions match the intended layout, especially when fields overlap with static content or are positioned near page edges.` },
      { type: "paragraph", text: `Accessibility auditors reviewing PDF forms need to verify that form fields have appropriate sizes, are logically ordered, and are positioned correctly for screen reader navigation. Visual highlighting makes the field layout immediately apparent.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — loading the PDF, iterating form fields, drawing highlight rectangles, and saving the output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I change the highlight color?", content: [
      { type: "paragraph", text: `Yes. Specify any hex color code (like #ff0000 for red, #00ff00 for green, or #0000ff for blue) in the color field. The default is yellow (#ffff00). The highlight is drawn at 30% opacity so the underlying content remains visible.` },
    ]},
    { heading: "", subHeading: "Does this affect the form fields?", content: [
      { type: "paragraph", text: `No. The highlight rectangles are drawn on the page content layer, behind the form field widgets. The form fields remain fully functional — users can still click, type, and interact with them normally. The highlight is purely visual.` },
    ]},
    { heading: "", subHeading: "What if the PDF has no form fields?", content: [
      { type: "paragraph", text: `The tool reports that no interactive form fields were found and returns the document unchanged. Common reasons for no fields: the PDF is a flat image, the form was created as static text rather than interactive widgets, or the fields use a non-standard form system.` },
    ]},
    { heading: "", subHeading: "Can I highlight only certain types of fields?", content: [
      { type: "paragraph", text: `Not with this tool — it highlights all form fields uniformly. To highlight specific field types, you would need to extract the field inventory first (using Form Field Extract), identify the fields you want, and manually add highlights using a PDF editor.` },
    ]},
    { heading: "", subHeading: "Can I print the highlighted version?", content: [
      { type: "paragraph", text: `Yes. The highlight rectangles are part of the page content, so they print just like any other content. The semi-transparent yellow overlays will appear on the printed output, making form fields visible on paper.` },
    ]},
  ],
};

const seoExtractHyperlinks: ToolSeo = {
  sections: [
    { heading: "What is Extract Hyperlinks?", content: [
      { type: "paragraph", text: `Extract Hyperlinks scans a PDF for all embedded URLs and outputs them as a deduplicated JSON list. The tool searches two sources: Link annotations (clickable links in the PDF) and text content (URLs that appear as plain text on the page).` },
      { type: "paragraph", text: `Using pdf.js, the tool iterates over every page, extracts Link annotations with their URL properties, and also performs regex matching on the text content for http:// and https:// URLs. Both sources are merged and deduplicated to produce the final list.` },
      { type: "paragraph", text: `The output is a JSON file containing a single array of unique URLs, one per line. This is useful for link auditing, verifying hyperlink integrity, and cataloging references in research documents or legal filings.` },
      { type: "paragraph", text: `The regex matching covers both http:// and https:// protocols, as well as URLs starting with www. that may not have an explicit protocol prefix. URLs with special characters like query parameters, fragments, and encoded characters are captured as long as they appear on a single text line.` },
    ]},
    { heading: "How to Use Extract Hyperlinks", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Extract Links</strong>. The tool scans every page for Link annotations and text-based URLs.`,
        `A download button appears with <code>hyperlinks.json</code> containing the deduplicated list of all URLs found.`,
      ]},
    ]},
    { heading: "Why Use Extract Hyperlinks?", content: [
      { type: "paragraph", text: `Legal teams reviewing contracts and agreements need to identify all referenced URLs for compliance verification. Extracting hyperlinks creates a complete inventory of external references in the document.` },
      { type: "paragraph", text: `Web archivists and researchers collecting PDF sources need to extract all cited URLs for further analysis, link checking, or inclusion in reference databases.` },
      { type: "paragraph", text: `IT security teams scanning documents for potentially malicious links use hyperlink extraction to identify all URLs before the document is distributed to employees or clients.` },
      { type: "paragraph", text: `SEO auditors analyzing PDF marketing materials need to verify that all embedded links point to live, correct destinations. Bulk extraction followed by automated link checking is faster than manually clicking each link in a PDF reader.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the PDF, extracting Link annotations, scanning text content for URLs, and generating the JSON output — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does it extract URLs from Link annotations AND text content?", content: [
      { type: "paragraph", text: `Yes. Both sources are searched. Link annotations are clickable links embedded in the PDF. Text-based URLs are plain-text URLs that appear on the page but aren't clickable. Both are merged into a single deduplicated list.` },
    ]},
    { heading: "", subHeading: "Are the URLs deduplicated?", content: [
      { type: "paragraph", text: `Yes. If the same URL appears as both a Link annotation and as text, or appears on multiple pages, it appears only once in the output. The deduplication uses exact string matching.` },
    ]},
    { heading: "", subHeading: "What if the PDF has no hyperlinks?", content: [
      { type: "paragraph", text: `The tool returns an empty array: { links: [] }. This is common for scanned documents or text-only PDFs that contain no interactive elements or URL text.` },
    ]},
    { heading: "", subHeading: "Does it extract mailto: links from annotations?", content: [
      { type: "paragraph", text: `Not currently. Only http/https URLs from Link annotations and text content are extracted. Mailto: links in annotations are a different annotation subtype and are not included in this extraction.` },
    ]},
  ],
};

const seoExtractHeadings: ToolSeo = {
  sections: [
    { heading: "What is Extract Headings?", content: [
      { type: "paragraph", text: `Extract Headings identifies heading-like text in a PDF by detecting lines with larger-than-normal font sizes. The tool uses pdf.js to extract text content, calculates the font size of each text item, and flags lines where the maximum font size exceeds 14pt.` },
      { type: "paragraph", text: `For each detected heading, the output includes the page number, the heading text, and the font size. The detection heuristic looks for text lines that are shorter than 60 characters and longer than 3 characters — filtering out body text that happens to use a large font.` },
      { type: "paragraph", text: `The output is a JSON array of heading objects, sorted by page number. This is useful for understanding document structure, generating tables of contents, or verifying that heading hierarchy is consistent across the document.` },
      { type: "paragraph", text: `The font size calculation uses the Euclidean norm of the text matrix transformation vectors, which correctly handles rotated and scaled text. This means headings that are rotated 90 degrees or scaled non-uniformly are still detected by their effective font size.` },
    ]},
    { heading: "How to Use Extract Headings", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Extract Headings</strong>. The tool scans every page, calculates font sizes, and identifies lines with font sizes above 14pt.`,
        `A download button appears with <code>headings.json</code> containing the list of detected headings with page numbers and font sizes.`,
      ]},
    ]},
    { heading: "Why Use Extract Headings?", content: [
      { type: "paragraph", text: `Document analysts reviewing long reports need to understand the document's structure without reading every page. The heading extraction provides a quick overview of sections, subsections, and their page locations.` },
      { type: "paragraph", text: `Accessibility auditors checking heading hierarchy need to verify that headings follow a logical sequence (H1, H2, H3) without manually inspecting each page. The font size data helps identify heading levels.` },
      { type: "paragraph", text: `Automated document processing pipelines use heading extraction to segment long PDFs into chapters or sections for individual processing, indexing, or routing.` },
      { type: "paragraph", text: `Technical documentation teams verifying that their PDF export maintains proper heading hierarchy use the extraction output to compare against the source document outline. Discrepancies indicate export issues with heading detection.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering the PDF, extracting text content, calculating font sizes, and generating the JSON output — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What font size threshold determines a heading?", content: [
      { type: "paragraph", text: `Lines with a maximum font size above 14pt are flagged as potential headings. This threshold works for most standard documents where body text is 10-12pt and headings are 14pt or larger. Documents with unusual font sizes may need manual adjustment of the threshold.` },
    ]},
    { heading: "", subHeading: "Does it detect heading levels (H1, H2, H3)?", content: [
      { type: "paragraph", text: `Not explicitly. The tool reports the font size for each heading, which can be used to infer relative levels (larger font = higher-level heading). It does not map to specific HTML heading levels.` },
    ]},
    { heading: "", subHeading: "What about multi-line headings?", content: [
      { type: "paragraph", text: `The tool detects headings line by line. If a heading spans multiple lines, each line is reported separately. The output can be post-processed to group consecutive lines on the same page as a single heading.` },
    ]},
    { heading: "", subHeading: "Why the 14pt threshold?", content: [
      { type: "paragraph", text: `14pt is a common minimum for heading text in standard documents where body text is typically 10-12pt. Documents with larger body text may produce false positives. The threshold is hardcoded and cannot be adjusted per-document.` },
    ]},
  ],
};

const seoExtractEmailAddresses: ToolSeo = {
  sections: [
    { heading: "What is Extract Email Addresses?", content: [
      { type: "paragraph", text: `Extract Email Addresses scans all text content in a PDF and identifies email addresses using a regex pattern. The tool uses pdf.js to extract text from every page, then matches against the standard email pattern (user@domain.tld).` },
      { type: "paragraph", text: `The output is a JSON file containing a deduplicated array of all email addresses found in the document. Both annotated email links and plain-text email addresses visible on the page are captured.` },
      { type: "paragraph", text: `This is a read-only extraction tool — it does not modify the PDF or send any data externally. The email list is useful for contact harvesting from documents, compliance audits, and data processing workflows.` },
      { type: "paragraph", text: `The regex pattern matches standard email formats with at least one character before the @ symbol, a domain with at least one dot, and a top-level domain of at least 2 characters. This filters out most false positives while catching legitimate addresses in the document text.` },
    ]},
    { heading: "How to Use Extract Email Addresses", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Extract Emails</strong>. The tool scans every page's text content for email patterns.`,
        `A download button appears with <code>emails.json</code> containing the deduplicated list of email addresses.`,
      ]},
    ]},
    { heading: "Why Use Extract Email Addresses?", content: [
      { type: "paragraph", text: `Legal teams processing contracts, NDAs, and partnership agreements need to extract contact information for all parties involved. The email list provides a quick inventory of contacts referenced in the document.` },
      { type: "paragraph", text: `Compliance teams auditing documents for PII (Personally Identifiable Information) use email extraction to identify all email addresses that may need to be redacted before external distribution.` },
      { type: "paragraph", text: `Marketing teams analyzing competitor whitepapers or industry reports extract email addresses to build prospect lists or identify key contacts in the organization.` },
      { type: "paragraph", text: `Privacy compliance teams auditing PDFs for GDPR or CCPA requirements use email extraction to identify all personal data that may need to be redacted or disclosed in data subject access requests.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text from the PDF, matching email patterns, and generating the JSON output — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does it extract emails from annotations or only text?", content: [
      { type: "paragraph", text: `Text content only. Mailto: link annotations are not currently extracted — only email addresses that appear as visible text on the page are matched.` },
    ]},
    { heading: "", subHeading: "How accurate is the email detection?", content: [
      { type: "paragraph", text: `The regex pattern matches standard email formats (user@domain.tld). It may produce false positives for text that looks like an email but isn't (like code snippets or configuration strings). It may miss emails split across text items by pdf.js rendering.` },
    ]},
    { heading: "", subHeading: "Does it handle internationalized email addresses?", content: [
      { type: "paragraph", text: `The pattern matches ASCII email addresses. Internationalized email addresses with non-ASCII characters in the domain or local part may not be detected by the current regex.` },
    ]},
    { heading: "", subHeading: "What about email addresses split across text items?", content: [
      { type: "paragraph", text: `pdf.js may split a single email address across multiple text items if the PDF was created with individual character positioning. In that case, the email may not be detected because the @ symbol and domain are in separate text items. This is a known limitation of text-based extraction from PDFs.` },
    ]},
  ],
};

const seoExtractPhoneNumbers: ToolSeo = {
  sections: [
    { heading: "What is Extract Phone Numbers?", content: [
      { type: "paragraph", text: `Extract Phone Numbers scans all text content in a PDF and identifies phone numbers using a regex pattern that matches common international and domestic formats. The tool uses pdf.js to extract text from every page, then matches against patterns like (555) 123-4567, +1-555-123-4567, and 555.123.4567.` },
      { type: "paragraph", text: `The output is a JSON file containing a deduplicated array of all phone numbers found in the document. The tool handles various separators (dashes, dots, spaces, parentheses) and optional country codes.` },
      { type: "paragraph", text: `This is a read-only extraction tool. The phone number list is useful for contact harvesting, PII audits, and building contact databases from documents.` },
      { type: "paragraph", text: `The regex pattern handles US phone number formats with various separators including parentheses, dashes, dots, and spaces. The optional country code prefix is captured when present. The pattern requires exactly 10 digits for the main number after stripping formatting characters.` },
    ]},
    { heading: "How to Use Extract Phone Numbers", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Extract Phone Numbers</strong>. The tool scans every page's text content for phone number patterns.`,
        `A download button appears with <code>phones.json</code> containing the deduplicated list of phone numbers.`,
      ]},
    ]},
    { heading: "Why Use Extract Phone Numbers?", content: [
      { type: "paragraph", text: `Legal teams processing contracts and agreements need to extract contact information for all parties. Phone numbers are often embedded in signature blocks, letterheads, and contact sections.` },
      { type: "paragraph", text: `Compliance teams auditing documents for PII need to identify all phone numbers that may need redaction before external distribution or archival.` },
      { type: "paragraph", text: `Business development teams analyzing vendor proposals, RFPs, or partnership documents extract phone numbers to build prospect contact lists.` },
      { type: "paragraph", text: `HR departments processing employment applications or contact forms exported as PDFs need to extract phone numbers for their applicant tracking system. Bulk extraction eliminates manual data entry from PDF documents.` },
      { type: "paragraph", text: `Insurance companies processing claim forms exported as PDF need to extract contact information for all parties involved. Automated phone number extraction feeds directly into their customer relationship management system.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text from the PDF, matching phone number patterns, and generating the JSON output — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What phone number formats are detected?", content: [
      { type: "paragraph", text: `The pattern matches US-style numbers with optional country code: (555) 123-4567, 555-123-4567, 555.123.4567, +1-555-123-4567, and variations. International formats with different digit groupings may not be fully matched.` },
    ]},
    { heading: "", subHeading: "Can it detect fax numbers separately from phone numbers?", content: [
      { type: "paragraph", text: `No. The tool extracts all numbers matching the phone pattern regardless of context. If the document labels some numbers as fax, you would need to review the output manually or use text search to filter.` },
    ]},
    { heading: "", subHeading: "What about extension numbers?", content: [
      { type: "paragraph", text: `The pattern does not capture extensions (like x1234 or ext. 123). Only the main phone number is extracted. Extensions that appear as separate text items after the number are not included.` },
    ]},
    { heading: "", subHeading: "Does it handle international formats like +44 20 7946 0958?", content: [
      { type: "paragraph", text: `The pattern primarily matches US-style formats. International numbers with different digit groupings like UK 11-digit numbers or German area codes may not be fully matched. The pattern is designed for common North American formats.` },
    ]},
    { heading: "", subHeading: "What about toll-free numbers like 1-800-FLOWERS?", content: [
      { type: "paragraph", text: `The pattern matches numeric formats only. Vanity numbers with letters (1-800-FLOWERS) are not matched because the letters are not converted to digits. Only purely numeric phone number patterns are detected.` },
    ]},
  ],
};

const seoExtractTables: ToolSeo = {
  sections: [
    { heading: "What is Extract Tables?", content: [
      { type: "paragraph", text: `Extract Tables identifies tabular data in a PDF and exports each detected table as a separate CSV file. The tool uses pdf.js to extract text items, groups them by vertical position (Y coordinate) to identify rows, and detects tables by counting rows with 3 or more items.` },
      { type: "paragraph", text: `Rows with 3 or more text items on the same horizontal line are treated as table rows. Consecutive table rows are grouped into a single table. When no tables are detected, the tool falls back to exporting all text as a single CSV.` },
      { type: "paragraph", text: `The output is a zip archive containing one CSV file per detected table (table-1.csv, table-2.csv, etc.). Each CSV contains the table rows with cells quoted and comma-separated.` },
      { type: "paragraph", text: `The row grouping uses a 5-point Y-coordinate tolerance to handle slight vertical misalignment between text items on the same logical row. Text items within 5 points of the same Y position are grouped together, then sorted left-to-right by their X coordinate to preserve column order.` },
    ]},
    { heading: "How to Use Extract Tables", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Extract Tables</strong>. The tool scans every page, groups text items by Y position, and identifies table structures.`,
        `A download button appears with <code>tables.zip</code> containing one CSV file per detected table, or a fallback text CSV if no tables are found.`,
      ]},
    ]},
    { heading: "Why Use Extract Tables?", content: [
      { type: "paragraph", text: `Data analysts receiving PDF reports with embedded tables need the data in a spreadsheet-compatible format for analysis. CSV extraction converts tabular PDF content into a format that Excel, Google Sheets, and data tools can process directly.` },
      { type: "paragraph", text: `Financial teams extracting balance sheets, income statements, or transaction logs from PDF reports use table extraction to import the data into accounting software or analysis pipelines.` },
      { type: "paragraph", text: `Research teams processing academic papers or technical reports with data tables need structured exports for statistical analysis, visualization, or inclusion in meta-analyses.` },
      { type: "paragraph", text: `Financial analysts extracting data from annual reports or SEC filings need structured data from tables that appear as images or complex layouts in the PDF. The CSV output provides a machine-readable format for analysis in Excel or Python.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — extracting text content, grouping by position, detecting table structures, and generating CSV files — happens on your own device using pdf.js and JSZip. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How does the tool detect table boundaries?", content: [
      { type: "paragraph", text: `Text items on the same horizontal line (within 5 points of the same Y coordinate) are grouped into a row. Rows with 3 or more items are flagged as table rows. Consecutive table rows are grouped into a single table. A non-table row (fewer than 3 items) breaks the table boundary.` },
    ]},
    { heading: "", subHeading: "What about merged cells or complex table layouts?", content: [
      { type: "paragraph", text: `The tool does not detect merged cells. Each text item becomes its own cell. Merged cells may appear as a single cell spanning what should be multiple columns, or as separate cells with repeated content.` },
    ]},
    { heading: "", subHeading: "What happens if no tables are found?", content: [
      { type: "paragraph", text: `The tool falls back to exporting all text content as a single CSV file (fallback-text.csv), with each row containing all text items from that line. This ensures you always get output, even if the table detection heuristic doesn't match the document layout.` },
    ]},
    { heading: "", subHeading: "How does it handle tables with borders or lines?", content: [
      { type: "paragraph", text: `The tool does not detect table borders or lines - it only uses text item positions. Tables defined by visual borders but containing sparse text may not be detected as tables. The tool works best with text-heavy tables where items are clearly aligned in rows and columns.` },
    ]},
  ],
};

const seoPdfSizeAnalyzer: ToolSeo = {
  sections: [
    { heading: "What is PDF Size Analyzer?", content: [
      { type: "paragraph", text: `PDF Size Analyzer reports the file size of a PDF document in both bytes and megabytes. The tool reads the file metadata to provide a quick size assessment without processing the document content.` },
      { type: "paragraph", text: `The output is a JSON file containing the filename, total bytes, and total megabytes. This basic metadata is useful for quick file assessment before processing, upload size verification, and storage planning.` },
      { type: "paragraph", text: `For more detailed analysis including page count, image sizes, and font information, use the PDF Statistics tool which provides comprehensive document metrics.` },
      { type: "paragraph", text: `While this tool only reports file size, understanding what drives PDF size is useful context. The largest contributors to PDF file size are typically embedded images especially uncompressed or high-resolution ones, embedded fonts where full font subsets can add hundreds of KB per font, XMP metadata streams, and embedded attachments. A 10-page text-only PDF is usually under 100KB, while the same document with high-resolution images can easily exceed 10MB.` },
    ]},
    { heading: "How to Use PDF Size Analyzer", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Analyze Size</strong>. The tool reads the file metadata instantly.`,
        `A download button appears with <code>size-report.json</code> containing the filename, byte count, and megabyte count.`,
      ]},
    ]},
    { heading: "Why Use PDF Size Analyzer?", content: [
      { type: "paragraph", text: `Email and messaging platforms have file size limits. Quick size analysis before sending prevents upload failures and helps you decide whether compression is needed.` },
      { type: "paragraph", text: `Web developers optimizing document delivery need to know exact file sizes for caching headers, CDN configuration, and bandwidth estimation.` },
      { type: "paragraph", text: `Archival teams managing document repositories use size analysis to estimate storage requirements and identify unusually large files that may need optimization.` },
      { type: "paragraph", text: `Help desk teams receiving oversized PDF uploads need a quick size check before directing users to compression tools. Knowing the exact byte count helps determine whether the file exceeds email attachment limits typically 25MB or upload restrictions.` },
      { type: "paragraph", text: `Cloud storage billing teams tracking document upload sizes use file size reports to estimate monthly storage costs. Knowing exact byte counts per document enables accurate cost projection for document management platforms.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The file size is read from the local file metadata. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this analyze the content or just report file size?", content: [
      { type: "paragraph", text: `Just file size. For content analysis (page count, image sizes, font usage), use the PDF Statistics tool instead. This tool is designed for quick size assessment without processing the document.` },
    ]},
    { heading: "", subHeading: "What if the file is very large?", content: [
      { type: "paragraph", text: `File size is read from metadata, so even very large files (hundreds of MB) are processed instantly. The tool does not read the file content, only its size.` },
    ]},
    { heading: "", subHeading: "Why would a simple text PDF be large?", content: [
      { type: "paragraph", text: `Text PDFs can be large if they embed full font subsets including glyphs not used in the document, contain high-resolution scanned page images behind the text, or include embedded attachments and metadata streams. The file size reflects the total of all embedded resources, not just the visible text.` },
    ]},
    { heading: "", subHeading: "How does compressed vs uncompressed PDF affect size?", content: [
      { type: "paragraph", text: `PDFs using FlateDecode compression (the standard) are typically 5-10x smaller than uncompressed equivalents. PDFs with embedded JPEG images compress well, while those with uncompressed bitmaps or full font subsets remain large regardless of text content.` },
    ]},
  ],
};

const seoVersionChecker: ToolSeo = {
  sections: [
    { heading: "What is Version Checker?", content: [
      { type: "paragraph", text: `Version Checker reads the PDF header to determine the PDF specification version used to create the document. The tool reads the first 50 bytes of the file, looks for the %PDF-X.Y signature, and reports the version number.` },
      { type: "paragraph", text: `The output is a JSON file containing the filename and PDF version (like 1.4, 1.5, 1.7, or 2.0). The version indicates which PDF specification features the document may use, which is important for compatibility with PDF readers and processing tools.` },
      { type: "paragraph", text: `This is a lightweight inspection that reads only the file header — it does not parse the full document structure. The check completes instantly regardless of file size.` },
      { type: "paragraph", text: `Different PDF versions enable different features: PDF 1.4 (Acrobat 5) introduced transparency and layers; PDF 1.5 (Acrobat 6) added JPEG2000 compression, object streams, and XMP metadata; PDF 1.6 (Acrobat 7) added extended security and 3D annotations; PDF 1.7 (Acrobat 8) added improved compression and annotation support; PDF 2.0 (ISO 32000-2) added rich media, 3D, and improved encryption. Knowing the version helps predict which features a document may use.` },
    ]},
    { heading: "How to Use Version Checker", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Check Version</strong>. The tool reads the first 50 bytes of the file header.`,
        `A download button appears with <code>version.json</code> containing the filename and detected PDF version.`,
      ]},
    ]},
    { heading: "Why Use Version Checker?", content: [
      { type: "paragraph", text: `Compatibility testing teams need to verify which PDF version a document was created with before processing it through version-sensitive pipelines. Older tools may not support features from newer PDF versions.` },
      { type: "paragraph", text: `Archival workflows require specific PDF versions for long-term preservation (PDF/A mandates version 1.4 or 1.7). Version checking confirms compliance before archival submission.` },
      { type: "paragraph", text: `Debugging PDF rendering issues often starts with checking the version — certain visual artifacts are specific to particular PDF versions and their feature sets.` },
      { type: "paragraph", text: `Software compatibility teams testing PDF rendering across different viewers need to know the version to predict which features will render correctly. A PDF 2.0 document may not display properly in older readers that only support PDF 1.4.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Only the first 50 bytes of the file are read to extract the version header. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What PDF versions are detected?", content: [
      { type: "paragraph", text: `Any version specified in the PDF header: 1.0 through 2.0. The most common versions are 1.4 (Acrobat 5), 1.5 (Acrobat 6), 1.6 (Acrobat 7), 1.7 (Acrobat 8), and 2.0 (ISO 32000-2).` },
    ]},
    { heading: "", subHeading: "What if the version shows as Unknown?", content: [
      { type: "paragraph", text: `The file may not be a valid PDF, or the header may be corrupted. Non-PDF files uploaded by mistake will show Unknown since they lack the %PDF-X.Y signature.` },
    ]},
    { heading: "", subHeading: "Does the version affect how the PDF renders?", content: [
      { type: "paragraph", text: `Yes. Higher versions support more features (transparency, layers, JPEG2000 compression, XMP metadata). A PDF created with version 1.7 features may not render correctly in readers that only support version 1.4.` },
    ]},
    { heading: "", subHeading: "Can a PDF claim a version but use features from a different version?", content: [
      { type: "paragraph", text: `Yes. Some PDF producers set the version header higher than necessary, or embed features from newer versions in an older-version document. The header version indicates what the creator declared, not necessarily what features are actually used.` },
    ]},
    { heading: "", subHeading: "Does PDF/A compliance require a specific version?", content: [
      { type: "paragraph", text: `Yes. PDF/A-1 requires PDF 1.4, PDF/A-2 allows PDF 1.5-1.7, and PDF/A-3 allows PDF 1.5-1.7. PDF/A-4 is based on PDF 2.0. The version check helps determine which PDF/A level a document might conform to.` },
    ]},
  ],
};

const seoAttachmentInspector: ToolSeo = {
  sections: [
    { heading: "What is Attachment Inspector?", content: [
      { type: "paragraph", text: `Attachment Inspector lists all file attachments embedded in a PDF document, reporting each attachment's filename and size in bytes. The tool uses pdf.js to parse the PDF's EmbeddedFiles name tree and extract the attachment metadata.` },
      { type: "paragraph", text: `The output is a JSON file containing an array of attachment objects with name and size properties. If the PDF has no attachments, the output is an empty array.` },
      { type: "paragraph", text: `This is a read-only inspection tool — it does not extract, download, or modify the attachments. For extracting attachment files, use the Extract Attachments tool instead.` },
      { type: "paragraph", text: `PDF attachments are stored in the document EmbeddedFiles name tree, which maps filenames to file data streams. The inspector reads this tree structure and reports each entry filename and byte count without downloading the actual file data.` },
    ]},
    { heading: "How to Use Attachment Inspector", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Inspect Attachments</strong>. The tool parses the PDF's embedded file dictionary.`,
        `A download button appears with <code>attachments.json</code> listing each attachment's name and size.`,
      ]},
    ]},
    { heading: "Why Use Attachment Inspector?", content: [
      { type: "paragraph", text: `Security teams scanning PDFs for hidden content need to know what files are embedded before distributing the document. Attachments can contain malware, sensitive data, or unexpected content.` },
      { type: "paragraph", text: `Document managers auditing PDF archives need to verify which documents contain attachments and how large they are, to plan storage and extraction workflows.` },
      { type: "paragraph", text: `When receiving PDFs from external sources, inspecting attachments before opening them provides a safety check — you can see what's embedded without executing or downloading the attachment files.` },
      { type: "paragraph", text: `Security Operations teams scanning inbound PDFs for potential threats use attachment inspection to identify embedded executables, scripts, or suspicious file types before allowing the document into the corporate environment.` },
      { type: "paragraph", text: `Legal teams processing discovery documents need to catalog all embedded files before review. The attachment inventory helps prioritize which documents contain supplementary materials that may be relevant to the case.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the PDF attachment dictionary and generating the JSON output — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does it extract the attachment files?", content: [
      { type: "paragraph", text: `No. This tool only lists attachment metadata (name and size). To actually download the embedded files, use the Extract Attachments tool.` },
    ]},
    { heading: "", subHeading: "What if the PDF has no attachments?", content: [
      { type: "paragraph", text: `The tool returns an empty array: { attachments: [] }. This is the standard response for PDFs without embedded files.` },
    ]},
    { heading: "", subHeading: "Can attachments contain malware?", content: [
      { type: "paragraph", text: `Yes. PDF attachments can contain any file type, including executables. Never open attachments from untrusted sources without scanning them with antivirus software first. This tool helps you identify what's embedded so you can make an informed decision.` },
    ]},
    { heading: "", subHeading: "Can attachments be hidden or obfuscated?", content: [
      { type: "paragraph", text: `Attachments are visible in the PDF structure but may not be obvious to casual users. Some PDFs embed attachments without obvious UI indicators. This tool reveals all attachments regardless of whether the PDF reader displays them prominently.` },
    ]},
    { heading: "", subHeading: "What is the maximum attachment size?", content: [
      { type: "paragraph", text: `There is no PDF specification limit on attachment size, but some PDF readers may struggle with very large attachments (over 100MB). The inspector reports the size so you can assess whether extraction will be practical.` },
    ]},
  ],
};

const seoPdfStatistics: ToolSeo = {
  sections: [
    { heading: "What is PDF Statistics?", content: [
      { type: "paragraph", text: `PDF Statistics computes comprehensive metrics about a PDF document including page count, total text characters, image count, font count, annotation count, and form field count. The tool uses pdf.js to parse the document structure and aggregate statistics across all pages.` },
      { type: "paragraph", text: `The output is a JSON file containing all computed metrics. This provides a complete overview of the document's composition without needing to open it in a PDF reader.` },
      { type: "paragraph", text: `The statistics are computed by iterating over every page and its content streams, counting text items, image resources, font references, annotations, and form widgets. The results give a quantitative profile of the document.` },
      { type: "paragraph", text: `The text character count is calculated by summing the length of all text items across all pages. Image count includes both inline images and XObject references. Font count tracks unique font names, meaning the same font referenced on multiple pages counts once. Annotation and form field counts include all subtypes found in the document.` },
    ]},
    { heading: "How to Use PDF Statistics", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Analyze</strong>. The tool parses every page and aggregates content statistics.`,
        `A download button appears with <code>pdf-stats.json</code> containing the full document statistics.`,
      ]},
    ]},
    { heading: "Why Use PDF Statistics?", content: [
      { type: "paragraph", text: `Document processing pipelines need to pre-screen PDFs before ingestion. Statistics like page count, image density, and form field count help route documents to appropriate processing workflows.` },
      { type: "paragraph", text: `Optimization teams assessing PDFs for compression need to know the composition — image-heavy documents benefit from image recompression, while text-heavy documents benefit from font subsetting.` },
      { type: "paragraph", text: `Quality assurance teams comparing versions of the same document use statistics to quantify changes: added pages, new annotations, inserted images, or modified form fields.` },
      { type: "paragraph", text: `Document processing pipelines use statistics to classify incoming PDFs: text-heavy documents go to text extraction, image-heavy documents go to OCR, and form-heavy documents go to form processing. Statistics-based routing is faster than full content analysis.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing the PDF structure, counting content elements, and generating the statistics JSON — happens on your own device using pdf.js. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What metrics are included in the statistics?", content: [
      { type: "paragraph", text: `Page count, total text characters, image count, unique font count, annotation count, form field count, and file size. The specific metrics depend on the pdf.js parsing capabilities and the document structure.` },
    ]},
    { heading: "", subHeading: "How long does the analysis take?", content: [
      { type: "paragraph", text: `Analysis time scales with document complexity. Simple text PDFs analyze in under a second. Complex documents with hundreds of pages, many images, and extensive annotations may take a few seconds. The tool processes all pages sequentially.` },
    ]},
    { heading: "", subHeading: "Does it detect image compression types?", content: [
      { type: "paragraph", text: `The tool counts images but does not report compression types (JPEG, PNG, etc.). For compression-specific analysis, you would need a more specialized tool that inspects individual image streams.` },
    ]},
    { heading: "", subHeading: "Does it count images inside annotations or form fields?", content: [
      { type: "paragraph", text: `The tool counts images referenced as page resources (XObject references). Images embedded in annotations or form field appearances may or may not be counted depending on how they are referenced in the PDF structure. The count represents a best-effort approximation.` },
    ]},
  ],
};

const seoViewMetadata: ToolSeo = {
  sections: [
    { heading: "What is View Metadata?", content: [
      { type: "paragraph", text: `View Metadata extracts and displays the complete metadata dictionary from a PDF document, including title, author, subject, keywords, creation date, modification date, and producer. The tool uses pdf-lib to read the document information dictionary.` },
      { type: "paragraph", text: `The output is a JSON file containing all metadata fields found in the PDF. Fields that are not set in the document are reported as null. The metadata provides a complete profile of the document's authorship and history.` },
      { type: "paragraph", text: `This is a read-only inspection tool — it does not modify any metadata. For editing metadata values, use the Metadata Editor tool instead.` },
      { type: "paragraph", text: `The metadata dictionary, also called the Document Information Dictionary, stores key-value pairs in the PDF trailer. Standard fields include Title, Author, Subject, Keywords, Creator (the application that created the source document), Producer (the application that generated the PDF), CreationDate, and ModDate. Custom fields may also be present depending on the PDF producer.` },
    ]},
    { heading: "How to Use View Metadata", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>View Metadata</strong>. The tool reads the PDF's document information dictionary.`,
        `A download button appears with <code>metadata.json</code> containing all metadata fields.`,
      ]},
    ]},
    { heading: "Why Use View Metadata?", content: [
      { type: "paragraph", text: `Legal teams verifying document authenticity need to check creation dates, author information, and modification history. Metadata provides a chain of custody for document provenance.` },
      { type: "paragraph", text: `Publishers managing document libraries use metadata to verify title, author, and keyword fields are correctly set for search indexing and catalog management.` },
      { type: "paragraph", text: `Security teams reviewing documents from external sources check metadata for hidden information — author names, organization details, or software identifiers that may reveal information about the document's origin.` },
      { type: "paragraph", text: `Forensic document analysts use metadata to establish document provenance - when it was created, what software was used, and whether it has been modified. Metadata timestamps and software identifiers provide clues about the document history.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the PDF metadata dictionary and generating the JSON output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What metadata fields are extracted?", content: [
      { type: "paragraph", text: `Title, author, subject, keywords, creator (application that created the PDF), producer (application that produced it), creation date, modification date, and any custom metadata entries in the document information dictionary.` },
    ]},
    { heading: "", subHeading: "Can metadata be faked or misleading?", content: [
      { type: "paragraph", text: `Yes. PDF metadata is user-editable and can be modified by any PDF editor. Creation dates, author names, and other fields should not be relied upon as proof of authenticity without additional verification. For authenticated timestamps, use the Timestamp PDF tool.` },
    ]},
    { heading: "", subHeading: "Does it extract XMP metadata?", content: [
      { type: "paragraph", text: `The tool extracts the standard document information dictionary. XMP metadata (stored in a separate metadata stream) may not be fully captured by this tool. For comprehensive XMP extraction, a specialized XMP parser would be needed.` },
    ]},
    { heading: "", subHeading: "What date format is used?", content: [
      { type: "paragraph", text: `PDF metadata dates follow the D:YYYYMMDDHHmmSS format (for example D:20240115143000 for January 15, 2024 at 2:30 PM). Timezone offsets may be appended. The tool preserves the original format in the JSON output.` },
    ]},
  ],
};

const seoPageDimensions: ToolSeo = {
  sections: [
    { heading: "What is Page Dimensions?", content: [
      { type: "paragraph", text: `Page Dimensions reports the width and height of every page in a PDF, measured in points (1 point = 1/72 inch). The tool uses pdf-lib to read each page's MediaBox and report its dimensions.` },
      { type: "paragraph", text: `The output is a JSON file containing an array of page dimension objects, each with page number, width, height, and the standard size name (A4, Letter, Legal, etc.) if it matches a known format.` },
      { type: "paragraph", text: `This is useful for verifying that all pages have consistent dimensions, identifying mixed-size documents, and determining the correct output settings for printing or further processing.` },
      { type: "paragraph", text: `PDF dimensions are measured in points where 1 point equals 1/72 inch. Common sizes include A4 at 595.28 x 841.89 points (210 x 297mm), US Letter at 612 x 792 points (8.5 x 11 inches), and US Legal at 612 x 1008 points (8.5 x 14 inches). The tool reads the MediaBox array from each page dictionary, which defines the physical page boundaries.` },
    ]},
    { heading: "How to Use Page Dimensions", content: [
      { type: "list", items: [
        `Drop a PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Check Dimensions</strong>. The tool reads the MediaBox of every page.`,
        `A download button appears with <code>page-dimensions.json</code> listing each page's width, height, and detected size.`,
      ]},
    ]},
    { heading: "Why Use Page Dimensions?", content: [
      { type: "paragraph", text: `Print shops need exact page dimensions to configure their RIP (Raster Image Processor) settings. Incorrect dimensions cause scaling errors, cropped content, or wasted paper.` },
      { type: "paragraph", text: `Document preparers merging PDFs from different sources need to verify that page sizes are consistent. Mixed dimensions in a merged document can cause layout issues in viewers and printers.` },
      { type: "paragraph", text: `PDF/A compliance requires specific page dimension ranges. Checking dimensions before submission ensures the document meets archival format requirements.` },
      { type: "paragraph", text: `Print production teams need exact dimensions to configure imposition software, cutting templates, and binding equipment. Even small dimension mismatches can cause content to be trimmed or misaligned in the final printed product.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading page MediaBox values and generating the JSON output — happens on your own device using pdf-lib. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What standard sizes are detected?", content: [
      { type: "paragraph", text: `A4 (595.28 x 841.89 pt), US Letter (612 x 792 pt), US Legal (612 x 1008 pt), A3 (841.89 x 1190.55 pt), and A5 (419.53 x 595.28 pt). Pages that don't match standard sizes are reported as Custom.` },
    ]},
    { heading: "", subHeading: "Does it report CropBox or just MediaBox?", content: [
      { type: "paragraph", text: `The tool reports MediaBox dimensions, which represent the physical page size. CropBox, TrimBox, and BleedBox (which define visible and print areas) are not separately reported.` },
    ]},
    { heading: "", subHeading: "What if pages have different sizes?", content: [
      { type: "paragraph", text: `Each page is reported individually. If a document has mixed page sizes, the output will show different dimensions for different pages, making it easy to identify which pages need resizing.` },
    ]},
    { heading: "", subHeading: "What about pages with different orientations?", content: [
      { type: "paragraph", text: `Each page is reported independently. A document with mixed portrait and landscape pages will show different dimensions for different pages. The tool does not detect or report orientation - only raw width and height values.` },
    ]},
    { heading: "", subHeading: "What is the difference between MediaBox and CropBox?", content: [
      { type: "paragraph", text: `MediaBox defines the physical page size. CropBox defines the visible area (what the user sees). If CropBox is set and smaller than MediaBox, only the CropBox area is displayed. This tool reports MediaBox, which is the actual page size.` },
    ]},
  ],
};

const seoCertificateInspector: ToolSeo = {
  sections: [
    { heading: "What is Certificate Inspector?", content: [
      { type: "paragraph", text: `Certificate Inspector extracts and displays detailed information about digital certificates embedded in a PDF document. The tool uses node-forge to parse X.509 certificates from the PDF's signature dictionaries and reports the certificate chain, issuer, subject, validity dates, and key information.` },
      { type: "paragraph", text: `The output is a JSON file containing certificate details for each digital signature found in the document. This includes the certificate hierarchy, trust chain status, expiration information, and the signing algorithm used.` },
      { type: "paragraph", text: `This tool complements the Validate Signature tool by providing the raw certificate data rather than just a validity verdict. It is useful for detailed certificate chain analysis and trust verification.` },
      { type: "paragraph", text: `The certificate chain typically has 2-3 levels: the end-entity certificate used to sign the document, one or more intermediate CA certificates, and the root CA certificate. The inspector reports each level separately, showing the issuer-subject relationship that forms the trust chain. Self-signed certificates where issuer equals subject appear at the root level.` },
    ]},
    { heading: "How to Use Certificate Inspector", content: [
      { type: "list", items: [
        `Drop a signed PDF onto the upload zone, or click to browse and select it.`,
        `Click <strong>Inspect Certificates</strong>. The tool parses the signature dictionaries and extracts X.509 certificate data.`,
        `A download button appears with <code>certificates.json</code> containing the certificate chain details for each signature.`,
      ]},
    ]},
    { heading: "Why Use Certificate Inspector?", content: [
      { type: "paragraph", text: `Security teams verifying document signatures need to examine the certificate chain to determine whether the signing certificate was issued by a trusted CA. The inspector provides the raw data needed for this analysis.` },
      { type: "paragraph", text: `Compliance auditors verifying digital signature validity check certificate expiration dates, key sizes, and signing algorithms against organizational policies. The inspector provides all this data in a structured format.` },
      { type: "paragraph", text: `PKI administrators debugging signature verification failures use the certificate inspector to identify which certificate in the chain is causing the issue — expired, revoked, or untrusted.` },
      { type: "paragraph", text: `PKI administrators validating signing certificates against their organization trust store need the full certificate chain data to verify that each link in the chain is valid and trusted. The inspector provides the raw data needed for this verification.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — parsing PDF signature dictionaries, extracting X.509 certificates, and generating the JSON output — happens on your own device using node-forge. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What certificate information is extracted?", content: [
      { type: "paragraph", text: `Subject distinguished name, issuer distinguished name, serial number, validity period (not-before and not-after dates), public key algorithm and size, signature algorithm, and certificate chain hierarchy.` },
    ]},
    { heading: "", subHeading: "Does it verify the certificate against a CA store?", content: [
      { type: "paragraph", text: `The tool extracts and displays the certificate data but does not perform online OCSP (Online Certificate Status Protocol) or CRL (Certificate Revocation List) checks. Trust verification against a CA store would require a separate PKI verification step.` },
    ]},
    { heading: "", subHeading: "What if the PDF has no digital signatures?", content: [
      { type: "paragraph", text: `The tool reports that no digital signatures were found. Note that visual signatures (stamped images) do not contain certificates — only cryptographic digital signatures have embedded X.509 certificates.` },
    ]},
    { heading: "", subHeading: "What if the certificate chain is incomplete?", content: [
      { type: "paragraph", text: `The tool reports whatever certificates are present in the signature. If intermediate certificates are missing, which is a common issue, the chain will appear truncated. Incomplete chains may cause validation failures in strict PDF readers.` },
    ]},
  ],
};



/* ════════════════════ Batch: Print & Layout ════════════════════ */

const seoPrintMarginAdjuster: ToolSeo = {
  sections: [
    { heading: "What is Print Margin Adjuster?", content: [
      { type: "paragraph", text: `Print Margin Adjuster changes the visible print area of each page in a PDF by modifying the CropBox. Unlike the Add Margin tool, which grows the page dimensions, this tool keeps the page size the same and moves the crop boundary inward — effectively hiding content near the edges without resizing anything.` },
      { type: "paragraph", text: `The tool reads each page's existing CropBox, then shifts its origin and reduces its width and height by the margin amounts you specify. Content outside the new crop boundary still exists in the file but is not printed or displayed by most readers. This makes it useful for hiding crop marks, bleed areas, or unwanted edge content before sending a document to print.` },
    ]},
    { heading: "How to Use Print Margin Adjuster", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone or clicking to browse.`,
        `Click <strong>Process</strong>. The tool reads each page's CropBox and adjusts it by the configured margins (default: 20 points on all sides).`,
        `Download the result as <code>adjusted-margins.pdf</code>. Open it in a PDF reader or print dialog to verify the visible area matches your expectations.`,
      ]},
    ]},
    { heading: "Why Use Print Margin Adjuster?", content: [
      { type: "paragraph", text: `When preparing documents for professional printing, crop marks and bleed areas are often included in the exported PDF. Print Margin Adjuster lets you hide those marks without re-exporting from the source application. It is also useful for trimming content that appears at the very edge of a page — watermarks, header artifacts, or scanner artifacts that sit outside the intended print area.` },
      { type: "paragraph", text: `Because the tool modifies only the CropBox metadata and does not alter the content stream, it is lossless. You can adjust margins multiple times without any degradation, and the original content remains intact in the file for future use.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the PDF, adjusting crop boxes, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this tool resize the page?", content: [
      { type: "paragraph", text: `No. The page dimensions stay the same; only the CropBox changes. Content outside the new crop boundary is hidden from view but still exists in the file.` },
    ]},
    { heading: "", subHeading: "Is this the same as Add Margin?", content: [
      { type: "paragraph", text: `No. Add Margin grows the page dimensions to create physical white space. Print Margin Adjuster keeps the page the same size and moves the crop boundary inward, hiding edge content without changing the page geometry.` },
    ]},
    { heading: "", subHeading: "Will the hidden content be visible when I print?", content: [
      { type: "paragraph", text: `Most PDF readers respect the CropBox when printing, so hidden content will not appear. However, some advanced print settings can override this. If you need content permanently removed (not just hidden), you would need to delete the pages and recreate them.` },
    ]},
  ],
};

/* ════════════════════ Batch: Security ════════════════════ */

const seoAddWatermark: ToolSeo = {
  sections: [
    { heading: "What is Add Watermark?", content: [
      { type: "paragraph", text: `Add Watermark places semi-transparent text or images over every page of a PDF. You control the watermark text, font size, opacity, rotation angle, color, and whether it appears once centered or tiled across the page. The result is a document where each page carries a visible overlay — typically used to mark drafts, identify confidential material, or brand shared files.` },
      { type: "paragraph", text: `The tool uses pdf-lib to draw the watermark directly onto each page's content stream. For text watermarks, it embeds a Helvetica Bold font and renders the text at your chosen size and angle. For image watermarks, it embeds a PNG or JPG and places it centered on each page with configurable opacity and scale.` },
    ]},
    { heading: "How to Use Add Watermark", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone or clicking to browse.`,
        `Enter your <strong>watermark text</strong> (e.g. "CONFIDENTIAL", "DRAFT", or your company name).`,
        `Adjust <strong>opacity</strong> (0–1, default 0.15) — lower values make the watermark more subtle.`,
        `Set the <strong>rotation angle</strong> in degrees (default -45 for a diagonal watermark).`,
        `Optionally choose a <strong>text color</strong> as a hex value (default is gray).`,
        `Click <strong>Add Watermark</strong>. The tool draws the watermark on every page.`,
        `Download the result as <code>watermarked.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Watermark?", content: [
      { type: "paragraph", text: `Watermarks are the standard way to label documents as drafts, mark confidential material, or brand files before sharing. Legal teams stamp "CONFIDENTIAL" on privileged documents. Designers overlay branding on portfolio samples. Administrative teams mark internal reports as "DRAFT" during review cycles.` },
      { type: "paragraph", text: `Because the watermark is drawn onto the content stream (not added as an annotation), it cannot be easily removed by the recipient. This makes it suitable for marking documents where you want the label to persist through printing and casual editing.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the PDF, drawing the watermark, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I remove the watermark later?", content: [
      { type: "paragraph", text: `Because the watermark is drawn directly into the page content stream, it cannot be removed with a simple undo. You would need to re-process the original (un-watermarked) PDF. This is by design — watermarks that are easy to remove defeat their purpose.` },
    ]},
    { heading: "", subHeading: "Does the watermark affect print quality?", content: [
      { type: "paragraph", text: `The watermark is rendered at the same resolution as the underlying page content. At low opacity values (0.1–0.2), it appears as a faint overlay that does not interfere with readability. At higher opacity, it becomes more prominent and may obscure content beneath it.` },
    ]},
    { heading: "", subHeading: "Can I watermark only specific pages?", content: [
      { type: "paragraph", text: `The current version applies the watermark to every page. To watermark only specific pages, split the document first, watermark the pages you need, then merge them back together.` },
    ]},
  ],
};

/* ════════════════════ Batch: Edit PDF ════════════════════ */

const seoAddText: ToolSeo = {
  sections: [
    { heading: "What is Add Text?", content: [
      { type: "paragraph", text: `Add Text lets you place arbitrary text anywhere on a PDF page. You specify the text content, font size, position (X and Y coordinates), and optional color. The text is drawn directly onto the page's content stream using the Helvetica font, making it a permanent part of the page — visible in any PDF reader and when printed.` },
      { type: "paragraph", text: `The tool uses pdf-lib to embed text at your specified coordinates. The X coordinate measures from the left edge of the page, and Y measures from the bottom (standard PDF coordinate system). Text is drawn on page 1 by default; for other pages, use the page option if available through the editor interface.` },
    ]},
    { heading: "How to Use Add Text", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Enter the <strong>text content</strong> you want to add.`,
        `Set the <strong>font size</strong> (default: 14pt).`,
        `Set the <strong>X and Y position</strong> in points from the page's bottom-left corner. For reference, a standard Letter page is 612 points wide and 792 points tall.`,
        `Optionally choose a <strong>text color</strong> as a hex value (default: black).`,
        `Click <strong>Add Text</strong>. The tool draws the text onto the page.`,
        `Download the result as <code>text-added.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Text?", content: [
      { type: "paragraph", text: `Adding text is useful for filling in form-like fields that are not interactive, annotating pages with notes or labels, or adding missing information to exported documents. Legal professionals add case numbers or filing dates. Students annotate study materials. Designers add captions or version numbers to mockups.` },
      { type: "paragraph", text: `Unlike annotation-based tools, text added here becomes part of the page content. It cannot be accidentally deleted by the reader and appears in print output exactly as positioned.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the PDF, drawing text, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What font is used?", content: [
      { type: "paragraph", text: `Helvetica (a standard PDF font). It is embedded automatically and renders consistently across all PDF readers and platforms. Other fonts are not currently supported.` },
    ]},
    { heading: "", subHeading: "Can I add text to multiple pages?", content: [
      { type: "paragraph", text: `The current version targets page 1. To add text to other pages, process the document once per page, or use the editor interface which supports page selection.` },
    ]},
    { heading: "", subHeading: "Is the text editable afterward?", content: [
      { type: "paragraph", text: `The text is drawn into the content stream, so it is not editable as a text object in most PDF editors. It becomes part of the page's visual content, like a printed word on paper.` },
    ]},
  ],
};

const seoAddShapes: ToolSeo = {
  sections: [
    { heading: "What is Add Shapes?", content: [
      { type: "paragraph", text: `Add Shapes draws geometric shapes — rectangles, lines, and other primitives — directly onto a PDF page. The current implementation places a red-outlined rectangle at a default position (50, 50) with dimensions 100×100 points and a 2-point border. This provides a foundation for annotating pages with visual markers, callouts, or layout guides.` },
      { type: "paragraph", text: `The tool uses pdf-lib's drawing primitives to render shapes into the page content stream. Like all pdf-lib operations, the shapes become a permanent part of the page — visible in any reader and when printed.` },
    ]},
    { heading: "How to Use Add Shapes", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Add Shapes</strong>. The tool draws a red-outlined rectangle on page 1 at position (50, 50) with dimensions 100×100 points.`,
        `Download the result as <code>with-shapes.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Shapes?", content: [
      { type: "paragraph", text: `Shapes are useful for visually marking areas of a page — highlighting a region for review, drawing attention to specific content, or creating layout guides for print preparation. While the current default is a single rectangle, the underlying engine supports lines, circles, and other primitives that can be configured for more complex annotations.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the PDF, drawing shapes, and writing the output — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I change the shape color or position?", content: [
      { type: "paragraph", text: `The current default is a red-outlined rectangle at (50, 50). Customization of color, position, and dimensions is planned for a future update.` },
    ]},
    { heading: "", subHeading: "Can I add multiple shapes?", content: [
      { type: "paragraph", text: `Currently, one shape is added per invocation. To add multiple shapes, process the document multiple times — each pass adds another shape to the existing content.` },
    ]},
  ],
};

/* ════════════════════ Batch 2: Info & Inspection ════════════════════ */

const seoPdfToBase64: ToolSeo = {
  sections: [
    { heading: "What is PDF to Base64?", content: [
      { type: "paragraph", text: `PDF to Base64 converts a PDF file into a Base64-encoded text string. Base64 encoding represents binary data as ASCII text, making it safe to embed in JSON payloads, HTML, email bodies, or any text-only format where raw binary would be corrupted or rejected.` },
      { type: "paragraph", text: `The tool reads the PDF binary, encodes it using the standard Base64 alphabet (A–Z, a–z, 0–9, +, /), and outputs a plain text file containing the encoded string. The output is roughly 33% larger than the original file due to the encoding overhead, but it preserves every byte of the original PDF exactly.` },
    ]},
    { heading: "How to Use PDF to Base64", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Encode to Base64</strong>. The tool reads the file and encodes it.`,
        `Download the result as <code>pdf-as-base64.txt</code>. The file contains the complete Base64 string.`,
        `Use the encoded string in your application — paste it into a JSON field, embed it in an HTML data URI, or store it in a text-based format.`,
      ]},
    ]},
    { heading: "Why Use PDF to Base64?", content: [
      { type: "paragraph", text: `Base64 encoding is essential when you need to transport binary PDF data through text-only channels. APIs that accept JSON payloads require file content as Base64 strings. Email attachments in MIME format use Base64. HTML data URIs let you embed PDFs directly in web pages. Database text columns can store Base64-encoded PDFs without binary encoding issues.` },
      { type: "paragraph", text: `Developers use this tool to quickly generate test payloads, debug encoding issues, or prepare PDF data for systems that require text-safe representation. The output is a valid, standards-compliant Base64 string that any decoder can还原 back to the original PDF.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The encoding happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How much larger is the Base64 output?", content: [
      { type: "paragraph", text: `Base64 encoding increases file size by approximately 33%. A 1 MB PDF produces roughly 1.33 MB of Base64 text. This is a fixed overhead of the encoding algorithm and cannot be reduced.` },
    ]},
    { heading: "", subHeading: "Can I decode it back to a PDF?", content: [
      { type: "paragraph", text: `Yes. Use the companion Base64 to PDF tool to decode the string back into a working PDF. The round-trip is lossless — every byte is preserved through encoding and decoding.` },
    ]},
  ],
};

const seoScanToPdf: ToolSeo = {
  sections: [
    { heading: "What is Scan to PDF?", content: [
      { type: "paragraph", text: `Scan to PDF converts scanned images — JPEG, PNG, or other image formats — into a single PDF document. Each image becomes one page in the output PDF, sized to match the image dimensions. This is the fastest way to turn a stack of phone photos or scanner exports into a shareable PDF.` },
      { type: "paragraph", text: `The tool uses pdf-lib to embed each image as a full-page drawing. Images are not re-compressed or re-encoded unless the format requires it (e.g., WebP or HEIC images are re-encoded to PNG first). The result is a PDF where each page contains one image at its original resolution.` },
    ]},
    { heading: "How to Use Scan to PDF", content: [
      { type: "list", items: [
        `Upload one or more image files (JPG, PNG, etc.) by dropping them onto the upload zone.`,
        `The images appear in a list. Reorder them by dragging if needed — the order determines page order in the output.`,
        `Click <strong>Convert to PDF</strong>. Each image is embedded as a page.`,
        `Download the result as <code>scanned.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Scan to PDF?", content: [
      { type: "paragraph", text: `Scanned documents, whiteboard photos, and phone-captured pages are almost always delivered as images. Converting them to PDF creates a single, page-ordered document that is easy to share, print, and archive. Legal professionals scan signed contracts. Students photograph lecture slides. Office workers scan receipts for expense reports. All of these benefit from a clean PDF output.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What image formats are supported?", content: [
      { type: "paragraph", text: `JPEG, PNG, BMP, GIF, and WebP are supported natively. HEIC images are re-encoded to PNG before embedding. SVG files are not currently supported for this conversion.` },
    ]},
    { heading: "", subHeading: "Can I set the page size?", content: [
      { type: "paragraph", text: `Each page is sized to match the image dimensions. To get a standard page size (A4, Letter), resize your images beforehand or use a different tool that places images onto fixed-size pages.` },
    ]},
  ],
};

/* ════════════════════ Batch 2: Optimize & Color ════════════════════ */

const seoMetadataEditor: ToolSeo = {
  sections: [
    { heading: "What is Metadata Editor?", content: [
      { type: "paragraph", text: `Metadata Editor lets you change the title, author, subject, keywords, creator, and producer fields embedded in a PDF's metadata dictionary. These fields are part of the document's XMP or Info dictionary and are displayed by PDF readers in their properties panel.` },
      { type: "paragraph", text: `The tool reads the existing metadata, lets you overwrite specific fields, and writes a new PDF with the updated metadata. Fields you leave blank are not changed. The visual content of the document is completely unaffected.` },
    ]},
    { heading: "How to Use Metadata Editor", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Fill in the fields you want to change: <strong>Title</strong>, <strong>Author</strong>, <strong>Subject</strong>, <strong>Keywords</strong> (comma-separated). Leave any field blank to keep its current value.`,
        `Click <strong>Process</strong>. The tool updates the metadata and writes a new PDF.`,
        `Download the result. Open it in any PDF reader and check the properties panel to verify the changes.`,
      ]},
    ]},
    { heading: "Why Use Metadata Editor?", content: [
      { type: "paragraph", text: `Clean metadata matters for document management. Files exported from different applications often carry incorrect or missing metadata — a PDF exported from a design tool might have the designer's name as author instead of the actual document author. Legal filings require specific title and subject fields. Archive systems use keywords for indexing.` },
      { type: "paragraph", text: `Metadata is also a privacy concern. PDFs often carry the original author's name, creation software, and file path. Stripping or correcting this information before sharing prevents accidental disclosure of internal details.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The metadata update happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this change the visible content?", content: [
      { type: "paragraph", text: `No. Metadata is stored separately from page content. Changing the title, author, or keywords has zero effect on what the pages look like when opened or printed.` },
    ]},
    { heading: "", subHeading: "Can I see the current metadata first?", content: [
      { type: "paragraph", text: `Yes — use the companion View Metadata tool to inspect the current values before editing. That tool displays all metadata fields as JSON, so you can see exactly what exists before making changes.` },
    ]},
  ],
};

const seoOptimizeFonts: ToolSeo = {
  sections: [
    { heading: "What is Optimize Fonts?", content: [
      { type: "paragraph", text: `Optimize Fonts reduces PDF file size by enabling object streams during the save process. Object streams allow pdf-lib to compress multiple PDF objects into a single stream, which particularly benefits documents with many embedded font definitions — a common source of bloat in PDFs exported from word processors and design tools.` },
      { type: "paragraph", text: `The tool loads the PDF, re-saves it with \`useObjectStreams: true\`, and returns the compressed result. Fonts, images, and other objects are repackaged into a more compact internal structure without altering any visual content.` },
    ]},
    { heading: "How to Use Optimize Fonts", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Optimize Fonts</strong>. The tool re-saves the document with compressed object streams.`,
        `Download the result as <code>fonts-optimized.pdf</code>. Compare the file size with the original to see the reduction.`,
      ]},
    ]},
    { heading: "Why Use Optimize Fonts?", content: [
      { type: "paragraph", text: `PDFs with many fonts — especially those created by LaTeX, design software, or office suites — can be surprisingly large because each font definition is stored as a separate object. Object streams merge these into compact groups, often reducing file size by 10–30% without any quality loss. This is particularly useful for documents that will be emailed, uploaded to web forms, or stored in bulk.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The optimization happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this reduce image quality?", content: [
      { type: "paragraph", text: `No. The optimization only changes how PDF objects are stored internally. Text, images, and vector graphics retain their exact original quality. The reduction comes from more efficient packaging, not from compression or re-encoding.` },
    ]},
    { heading: "", subHeading: "How much smaller will my file be?", content: [
      { type: "paragraph", text: `It depends on the document. PDFs with many font subsets or complex object structures benefit most — reductions of 10–30% are common. Simple documents with few fonts may see minimal change. The tool is lossless regardless of the size reduction.` },
    ]},
  ],
};

const seoRemoveMetadata: ToolSeo = {
  sections: [
    { heading: "What is Remove Metadata?", content: [
      { type: "paragraph", text: `Remove Metadata strips all metadata fields from a PDF — title, author, subject, keywords, creator, producer, creation date, and modification date — resetting them to empty values. The result is a document with no identifying information in its properties panel, suitable for anonymous sharing or archival.` },
      { type: "paragraph", text: `The tool loads the PDF, clears every metadata field using pdf-lib's setter methods, and writes a fresh file. Page content, bookmarks, annotations, and form fields are preserved exactly.` },
    ]},
    { heading: "How to Use Remove Metadata", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Remove Metadata</strong>. The tool clears all metadata fields.`,
        `Download the result as <code>metadata-stripped.pdf</code>. Open it in a PDF reader and check the properties panel — all fields should be empty.`,
      ]},
    ]},
    { heading: "Why Use Remove Metadata?", content: [
      { type: "paragraph", text: `PDFs carry more metadata than most people realize. The author field often contains a real name, the creator field reveals the software used, and the file path may expose internal directory structures. Before sharing documents externally — especially legal filings, resumes, or published material — stripping metadata prevents accidental disclosure of personal or organizational details.` },
      { type: "paragraph", text: `Archive workflows also benefit. Documents entering a long-term repository should carry consistent, clean metadata rather than the heterogeneous leftovers from multiple creation tools. Remove Metadata provides a blank slate that can then be populated with standardized values using the Metadata Editor tool.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The metadata removal happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this remove bookmarks and annotations?", content: [
      { type: "paragraph", text: `No. Only the document-level metadata fields are cleared. Bookmarks, annotations, form fields, embedded files, and page content remain intact.` },
    ]},
    { heading: "", subHeading: "Can I remove metadata from specific fields only?", content: [
      { type: "paragraph", text: `This tool clears all fields at once. To update specific fields while keeping others, use the Metadata Editor tool instead, which lets you selectively overwrite individual fields.` },
    ]},
  ],
};

const seoTextColor: ToolSeo = {
  sections: [
      { heading: "What is Text Color Changer?", content: [
      { type: "paragraph", text: `Text Color Changer modifies the color of dark text throughout a PDF. It scans each page's content stream for text drawing operations, identifies pixels below a configurable darkness threshold, and replaces their color with your chosen target color. The result is a document where all dark text appears in the new color while lighter elements (images, light text, backgrounds) remain untouched.` },
      { type: "paragraph", text: `The tool renders each page to a canvas, analyzes pixel brightness, and redraws dark pixels in the target color. This pixel-level approach works regardless of the original font or encoding, but it does rasterize the page — the output is image-based rather than vector text.` },
    ]},
    { heading: "How to Use Text Color Changer", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Enter a <strong>target color</strong> as a hex value (e.g. #FF0000 for red, #0000FF for blue).`,
        `Set the <strong>darkness threshold</strong> (0–255, default 120). Pixels darker than this value are recolored; lighter pixels are left alone.`,
        `Click <strong>Process</strong>. The tool renders each page, analyzes pixel darkness, and applies the color change.`,
        `Download the result as <code>text-color-changed.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Text Color Changer?", content: [
      { type: "paragraph", text: `Changing text color is useful for branding documents, improving contrast for accessibility, or preparing materials for specific print processes. Designers recolor extracted text to match brand guidelines. Accessibility workflows darken light text for better readability. Print preparation sometimes requires all text in a specific color for overlay printing.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The color change happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this rasterize the text?", content: [
      { type: "paragraph", text: `Yes. The tool renders pages to canvas for pixel-level analysis, so the output is image-based. Text is no longer selectable or searchable in the result. If you need to preserve text selectability, this tool is not the right choice.` },
    ]},
    { heading: "", subHeading: "What does the darkness threshold control?", content: [
      { type: "paragraph", text: `Pixels with brightness below the threshold are recolored. A threshold of 120 catches most body text (typically RGB 0–100). Increase it to recolor lighter text; decrease it to only change the darkest elements. Pure white (255) is never affected regardless of the threshold.` },
    ]},
  ],
};

const seoCombineSinglePage: ToolSeo = {
  sections: [
    { heading: "What is Combine to Single Page?", content: [
      { type: "paragraph", text: `Combine to Single Page stitches all pages of a PDF into one continuous vertical scroll. Each page is placed below the previous one on a single, extra-tall page, creating a long-image effect. The output width matches the widest source page, and the total height is the sum of all page heights.` },
      { type: "paragraph", text: `The tool uses pdf-lib to embed each page onto a single output page via \`drawPage\`. The original pages are not re-rendered \u2014 they are embedded as-is, preserving text selectability, vector graphics, and image quality. The result is a standard PDF that opens in any reader.` },
    ]},
    { heading: "How to Use Combine to Single Page", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Process</strong>. The tool calculates total height, creates a single tall page, and embeds each source page sequentially.`,
        `Download the result as <code>combined.pdf</code>. Open it in a PDF reader — you will see one continuous scroll instead of separate pages.`,
      ]},
    ]},
    { heading: "Why Use Combine to Single Page?", content: [
      { type: "paragraph", text: `This is useful for creating long-image-style documents — social media infographics, scrolling presentations, or continuous diagrams that read better as one flowing sequence than as separate pages. Designers use it for portfolio strips. Developers use it for continuous documentation. Educators use it for timeline or process-flow visuals.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The combining happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will the output be very large?", content: [
      { type: "paragraph", text: `The file size is roughly proportional to the number of pages, since each page's content is embedded. A 50-page document may produce a file several times larger than the original. For very long documents, consider reducing page count first.` },
    ]},
    { heading: "", subHeading: "Can I adjust the spacing between pages?", content: [
      { type: "paragraph", text: `Currently, pages are placed edge-to-edge with no gap. To add spacing, you would need to resize each source page with added margin before combining.` },
    ]},
  ],
};

/* ════════════════════ Batch 3: Convert to PDF ════════════════════ */

const seoEpubToPdf: ToolSeo = {
  sections: [
    { heading: "What is EPUB to PDF?", content: [
      { type: "paragraph", text: `EPUB to PDF converts EPUB ebook files into standard PDF documents. The tool extracts text content from the EPUB's HTML/XHTML chapters, strips formatting, and renders it as plain text onto Letter-sized PDF pages using the Helvetica font.` },
      { type: "paragraph", text: `The conversion is text-based — images, complex CSS layouts, and embedded media from the EPUB are not preserved. The output is a clean, readable PDF with the book's text content, suitable for printing, annotation, or sharing with recipients who cannot open EPUB files.` },
    ]},
    { heading: "How to Use EPUB to PDF", content: [
      { type: "list", items: [
        `Upload an EPUB file by dropping it onto the upload zone.`,
        `Click <strong>Convert to PDF</strong>. The tool reads the EPUB archive, extracts HTML content from each chapter, and renders the text onto PDF pages.`,
        `Download the result as <code>converted.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use EPUB to PDF?", content: [
      { type: "paragraph", text: `EPUB is the standard ebook format, but not every device or application supports it. Converting to PDF ensures the content is readable on any platform — phones, tablets, desktops, and e-readers with PDF support. It is also useful for printing chapters, extracting quotes for academic work, or sharing excerpts with people who do not have ebook software.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will images from the EPUB be included?", content: [
      { type: "paragraph", text: `No. The current conversion extracts text only. Images, illustrations, and complex layouts from the EPUB are not rendered into the PDF output.` },
    ]},
    { heading: "", subHeading: "What about DRM-protected EPUBs?", content: [
      { type: "paragraph", text: `DRM-protected files cannot be converted. The tool reads the EPUB as a standard ZIP archive; if the content is encrypted, the conversion will fail.` },
    ]},
  ],
};

const seoProtect: ToolSeo = {
  sections: [
    { heading: "What is PDF Password Protector?", content: [
      { type: "paragraph", text: `PDF Password Protector adds password encryption to a PDF file. You can set a user password (required to open the document) and/or an owner password (controls printing, copying, and editing permissions). The encryption is applied using pdf-lib's built-in save options, producing a standard encrypted PDF that any reader can open with the correct password.` },
    ]},
    { heading: "How to Use PDF Password Protector", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Enter a <strong>user password</strong> — this is required to open the document.`,
        `Optionally enter an <strong>owner password</strong> — this controls permissions (printing, copying). If left blank, a default owner password is set.`,
        `Click <strong>Protect PDF</strong>. The tool applies encryption and writes a new PDF.`,
        `Download the result as <code>protected.pdf</code>. Test it by opening in a PDF reader — you should be prompted for the password.`,
      ]},
    ]},
    { heading: "Why Use PDF Password Protector?", content: [
      { type: "paragraph", text: `Password protection is the most common way to secure PDF documents before sharing. Legal teams protect privileged communications. HR departments encrypt employee records. Financial advisors lock investment reports. Any time a PDF contains information that should only be seen by authorized recipients, password protection provides a straightforward barrier.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The encryption happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point. The password you enter is never transmitted or stored.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What encryption standard is used?", content: [
      { type: "paragraph", text: `pdf-lib applies AES-128 encryption by default when a user or owner password is provided. This is the standard encryption used by most PDF readers and is sufficient for general-purpose document protection.` },
    ]},
    { heading: "", subHeading: "Can I remove the password later?", content: [
      { type: "paragraph", text: `Yes. Use the companion PDF Password Remover tool, which takes the encrypted PDF and the password, then produces an unencrypted copy.` },
    ]},
  ],
};

const seoFlatten: ToolSeo = {
  sections: [
    { heading: "What is PDF Flatten Tool?", content: [
      { type: "paragraph", text: `PDF Flatten Tool merges form fields and annotations into the page content, making them a permanent, non-interactive part of the page. After flattening, form fields can no longer be filled in, and annotations cannot be moved or deleted — they become visual elements identical to the rest of the page content.` },
      { type: "paragraph", text: `The tool uses pdf-lib's \`form.flatten()\` method, which renders each form field widget into the page's content stream and removes the interactive field definitions. Annotations (highlights, comments, stamps) are similarly merged into the visual layer.` },
    ]},
    { heading: "How to Use PDF Flatten Tool", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Flatten</strong>. The tool processes every page, merging all form fields and annotations into the page content.`,
        `Download the result as <code>flattened.pdf</code>. Open it to verify that form fields are no longer interactive and annotations are now part of the page.`,
      ]},
    ]},
    { heading: "Why Use PDF Flatten Tool?", content: [
      { type: "paragraph", text: `Flattening is essential before sharing completed forms. A filled-in PDF with active form fields can be accidentally modified by the recipient — they might clear a field, change a checkbox, or accidentally submit the form. Flattening locks the visual state, ensuring everyone who opens the document sees exactly what you intended.` },
      { type: "paragraph", text: `Legal and compliance workflows often require flattened documents. Signed contracts, completed applications, and submitted reports should be immutable. Flattening also reduces file size in some cases by removing the form field infrastructure.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The flattening happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I undo flattening?", content: [
      { type: "paragraph", text: `No. Flattening is irreversible — form field data is merged into the visual content and the interactive definitions are removed. Always keep an unflattened copy if you might need to edit form fields later.` },
    ]},
    { heading: "", subHeading: "Does flattening affect text or images?", content: [
      { type: "paragraph", text: `No. Only form fields and annotations are merged. Text, images, and other page content remain exactly as they were. The visual appearance of the page does not change — only the interactive layer is removed.` },
    ]},
  ],
};

const seoRemoveAnnotations: ToolSeo = {
  sections: [
    { heading: "What is Remove Annotations?", content: [
      { type: "paragraph", text: `Remove Annotations strips all annotations from a PDF's pages. Annotations include highlights, underlines, text notes, stamps, ink drawings, and any other markup added on top of the page content. After removal, the pages contain only their original content — text, images, and vector graphics.` },
      { type: "paragraph", text: `The tool uses pdf-lib to access each page's annotation array and remove the entries. The underlying page content stream is not modified, so text, images, and formatting are preserved exactly.` },
    ]},
    { heading: "How to Use Remove Annotations", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Remove Annotations</strong>. The tool scans every page and strips all annotation objects.`,
        `Download the result as <code>annotations-removed.pdf</code>. Verify in a PDF reader that highlights, notes, and stamps are gone.`,
      ]},
    ]},
    { heading: "Why Use Remove Annotations?", content: [
      { type: "paragraph", text: `PDFs accumulate annotations over their lifecycle — reviewer comments, highlight marks, approval stamps. Before sharing a document externally, removing these annotations ensures the recipient sees only the clean content. It is also useful for resetting a document that was marked up during an internal review cycle.` },
      { type: "paragraph", text: `Privacy is another driver. Annotations sometimes contain internal notes, reviewer names, or draft comments that were never intended for external eyes. Stripping them before distribution prevents accidental disclosure.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The annotation removal happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this remove form fields?", content: [
      { type: "paragraph", text: `No. Form fields are a separate layer from annotations. Use the Flatten Tool or the Form Field tools to manage interactive form elements.` },
    ]},
    { heading: "", subHeading: "Can I remove only certain types of annotations?", content: [
      { type: "paragraph", text: `The current version removes all annotations. To selectively remove specific types, you would need to use a PDF editor that supports annotation-level filtering.` },
    ]},
  ],
};

const seoHeicToPdf: ToolSeo = {
  sections: [
    { heading: "What is HEIC to PDF?", content: [
      { type: "paragraph", text: `HEIC to PDF converts HEIC and HEIF image files — the default format for iPhone and iPad photos — into a PDF document. Each image becomes one page, sized to match the image dimensions. This bridges the gap between Apple's native photo format and the universally supported PDF format.` },
      { type: "paragraph", text: `The tool re-encodes HEIC images to PNG before embedding them into the PDF using pdf-lib. The conversion preserves image quality, and the output PDF opens in any reader on any platform.` },
    ]},
    { heading: "How to Use HEIC to PDF", content: [
      { type: "list", items: [
        `Upload one or more HEIC/HEIF files by dropping them onto the upload zone.`,
        `Reorder the images if needed — the order determines page order in the output.`,
        `Click <strong>Convert to PDF</strong>. Each image is re-encoded and embedded as a page.`,
        `Download the result as <code>heic-to-pdf.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use HEIC to PDF?", content: [
      { type: "paragraph", text: `HEIC is efficient for storage but not widely supported outside Apple devices. Converting to PDF ensures photos can be viewed, printed, and shared on any platform. Common use cases include submitting photo evidence, compiling image-based reports, creating photo albums for non-Apple recipients, and archiving iPhone screenshots in a universal format.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this work with Live Photos?", content: [
      { type: "paragraph", text: `The tool converts the still image portion of a HEIC file. The video component of Live Photos is not included in the PDF output.` },
    ]},
    { heading: "", subHeading: "What about HEIF vs HEIC?", content: [
      { type: "paragraph", text: `Both are supported. HEIF and HEIC are closely related formats from the same family; the tool handles both transparently.` },
    ]},
  ],
};

const seoWebpToPdf: ToolSeo = {
  sections: [
    { heading: "What is WebP to PDF?", content: [
      { type: "paragraph", text: `WebP to PDF converts WebP image files into a PDF document. Each image becomes one page, preserving its original dimensions. WebP is a modern image format offering superior compression; this tool makes WebP images accessible in the universally supported PDF format.` },
      { type: "paragraph", text: `The tool embeds WebP images directly into the PDF using pdf-lib. If direct embedding fails, it re-encodes to PNG as a fallback. The output is a standard PDF that opens in any reader.` },
    ]},
    { heading: "How to Use WebP to PDF", content: [
      { type: "list", items: [
        `Upload one or more WebP files by dropping them onto the upload zone.`,
        `Reorder images if needed.`,
        `Click <strong>Convert to PDF</strong>. Each image is embedded as a page.`,
        `Download the result as <code>webp-to-pdf.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use WebP to PDF?", content: [
      { type: "paragraph", text: `WebP images are common on the web but not all applications and devices handle them natively. Converting to PDF ensures images can be printed, emailed, and archived in a format that works everywhere. Designers compile WebP assets into presentation-ready PDFs. Researchers embed web screenshots into reports.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this support animated WebP?", content: [
      { type: "paragraph", text: `Only the first frame of an animated WebP is captured. PDF does not support animation, so the static representation is used.` },
    ]},
  ],
};

const seoJsonToPdf: ToolSeo = {
  sections: [
    { heading: "What is JSON to PDF?", content: [
      { type: "paragraph", text: `JSON to PDF converts JSON data into a formatted PDF document. The tool parses the JSON, pretty-prints it with syntax highlighting, and renders it as monospaced text on Letter-sized pages. The result is a readable, printable representation of structured data.` },
      { type: "paragraph", text: `The tool uses pdf-lib to draw the formatted text onto pages, wrapping long lines automatically. Invalid JSON is displayed as raw text. The output uses the Courier font for consistent character alignment.` },
    ]},
    { heading: "How to Use JSON to PDF", content: [
      { type: "list", items: [
        `Upload a JSON file by dropping it onto the upload zone.`,
        `Click <strong>Convert to PDF</strong>. The tool parses, formats, and renders the JSON.`,
        `Download the result as <code>converted.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use JSON to PDF?", content: [
      { type: "paragraph", text: `JSON files are not printable and are difficult to read outside a code editor. Converting to PDF creates a shareable, printable version suitable for documentation, code reviews, API response archiving, and compliance records. Developers use it to include API responses in reports. Analysts use it to print data configurations for team review.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How are large JSON files handled?", content: [
      { type: "paragraph", text: `The formatted text wraps automatically across pages. Very large JSON files (hundreds of KB) will produce multi-page PDFs. The rendering preserves the full content regardless of size.` },
    ]},
  ],
};

/* ════════════════════ Batch 4: Edit & Modify ════════════════════ */

const seoBackgroundColor: ToolSeo = {
  sections: [
    { heading: "What is Background Color?", content: [
      { type: "paragraph", text: `Background Color changes the background of every page in a PDF to a solid color of your choice. The tool draws a filled rectangle over each page using pdf-lib, covering the existing background with the new color at 50% opacity. The result is a tinted document where the original content remains visible beneath the new background.` },
    ]},
    { heading: "How to Use Background Color", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Enter a <strong>background color</strong> as a hex value (e.g. #FFFFFF for white, #F0F0F0 for light gray).`,
        `Click <strong>Process</strong>. The tool draws a filled rectangle on every page.`,
        `Download the result as <code>background-color.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Background Color?", content: [
      { type: "paragraph", text: `PDFs with transparent or white backgrounds can look stark when printed or shared. Adding a subtle background color improves visual appeal for presentations, portfolios, and marketing materials. Designers use it to match brand colors. Educators use it to create visually distinct handouts.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The modification happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this cover the existing content?", content: [
      { type: "paragraph", text: `The background is drawn at 50% opacity, so existing text and images remain visible beneath it. The effect is a tinted overlay rather than a solid opaque layer.` },
    ]},
    { heading: "", subHeading: "Can I set a different color per page?", content: [
      { type: "paragraph", text: `Not in a single operation. The tool applies the same color to every page. For per-page colors, process the document multiple times after splitting.` },
    ]},
  ],
};

const seoSanitizePdf: ToolSeo = {
  sections: [
    { heading: "What is PDF Sanitizer?", content: [
      { type: "paragraph", text: `PDF Sanitizer removes potentially harmful or unnecessary elements from a PDF — metadata, annotations, JavaScript, embedded files, links, structure trees, and mark info — in a single pass. It offers three severity levels: Standard, Deep, and Maximum, each removing progressively more elements.` },
      { type: "paragraph", text: `The tool uses pdf-lib to flatten forms, clear metadata, strip annotations, remove JavaScript actions, delete embedded files, and optionally remove links and structure trees. The result is a leaner, safer document suitable for archival or external sharing.` },
    ]},
    { heading: "How to Use PDF Sanitizer", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Choose a <strong>sanitization level</strong>: Standard (recommended), Deep (removes links and structure), or Maximum (removes all removable elements).`,
        `Click <strong>Sanitize</strong>. The tool processes every page, removing elements at your chosen level.`,
        `Download the result as <code>sanitized.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use PDF Sanitizer?", content: [
      { type: "paragraph", text: `PDFs can contain hidden risks — JavaScript that executes on open, embedded files that carry malware, metadata that leaks author information, and annotations that reveal internal comments. Sanitizing a document before publishing, emailing, or archiving removes these risks in one step. It is standard practice in legal, healthcare, and government workflows where document integrity and safety are critical.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The sanitization happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What does each level remove?", content: [
      { type: "paragraph", text: `Standard: metadata, annotations, JavaScript, embedded files, and forms. Deep: everything in Standard plus links and structure trees. Maximum: everything in Deep plus mark info and any other removable metadata.` },
    ]},
    { heading: "", subHeading: "Does this affect the visual content?", content: [
      { type: "paragraph", text: `No. Only metadata, annotations, and interactive elements are removed. Text, images, and vector graphics on the page content layer are preserved exactly.` },
    ]},
  ],
};

const seoFlattenAnnotations: ToolSeo = {
  sections: [
    { heading: "What is Flatten Annotations?", content: [
      { type: "paragraph", text: `Flatten Annotations merges all annotation objects — highlights, underlines, text notes, stamps, ink drawings — into the page's visual content. After flattening, annotations become permanent parts of the page that cannot be moved, edited, or deleted by the reader.` },
      { type: "paragraph", text: `The tool uses pdf-lib's BentoPDF adapter to render each annotation into the page content stream and remove the annotation definition. The visual appearance is preserved; only the interactivity is removed.` },
    ]},
    { heading: "How to Use Flatten Annotations", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Flatten Annotations</strong>. The tool processes every page, merging annotations into the content.`,
        `Download the result as <code>annotations-flattened.pdf</code>. Verify that highlights, notes, and stamps are now part of the page.`,
      ]},
    ]},
    { heading: "Why Use Flatten Annotations?", content: [
      { type: "paragraph", text: `Annotating a PDF is useful during review, but those annotations should become permanent before final distribution. Flattening ensures that highlights, comments, and stamps are visible to every recipient regardless of their PDF reader's annotation support. It also prevents accidental modification of the annotation layer.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The flattening happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What's the difference between this and Flatten Forms?", content: [
      { type: "paragraph", text: `Flatten Annotations handles review markup (highlights, notes, stamps). Flatten Forms handles interactive form fields (text inputs, checkboxes, dropdowns). Use the one that matches the type of content you need to lock down, or both if your document has each.` },
    ]},
  ],
};

const seoComicInfo: ToolSeo = {
  sections: [
    { heading: "What is Comic Info Generator?", content: [
      { type: "paragraph", text: `Comic Info Generator creates a ComicInfo.xml metadata file for comic book archives. ComicInfo.xml is the standard metadata format used by comic readers like Komga, Calibre, and ComicRack to display series information, issue numbers, writers, publishers, and genres.` },
      { type: "paragraph", text: `You fill in fields like title, series, issue number, writer, publisher, genre, and language. The tool generates a standards-compliant XML file that can be added to a CBZ or CBR archive.` },
    ]},
    { heading: "How to Use Comic Info Generator", content: [
      { type: "list", items: [
        `Fill in the metadata fields: <strong>Title</strong>, <strong>Series</strong>, <strong>Issue number</strong>, <strong>Writer</strong>, <strong>Publisher</strong>, <strong>Genre</strong>, and <strong>Language</strong> (ISO code like "en").`,
        `Click <strong>Generate</strong>. The tool produces a ComicInfo.xml file.`,
        `Download the result as <code>ComicInfo.xml</code>. Add it to your CBZ/CBR archive alongside the image files.`,
      ]},
    ]},
    { heading: "Why Use Comic Info Generator?", content: [
      { type: "paragraph", text: `Comic readers use ComicInfo.xml to display series metadata, sort issues by number, and filter by genre or writer. Without this file, your comic archive appears as an untitled collection. Adding proper metadata makes your library browsable, searchable, and professional — essential for anyone building a digital comic collection.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `No files are uploaded. The XML is generated entirely in your browser from the fields you provide. Nothing is transmitted to any server.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How do I add this to my CBZ file?", content: [
      { type: "paragraph", text: `A CBZ file is a ZIP archive with a .cbz extension. Open it with any ZIP tool, add the ComicInfo.xml file to the root, and save. Most comic readers will automatically detect and display the metadata.` },
    ]},
  ],
};

const seoBmpToPdf: ToolSeo = {
  sections: [
    { heading: "What is BMP to PDF?", content: [
      { type: "paragraph", text: `BMP to PDF converts BMP (bitmap) image files into a PDF document. Each image becomes one page, sized to match the image dimensions. BMP is an uncompressed format common in Windows environments; converting to PDF makes these images universally shareable and printable.` },
      { type: "paragraph", text: `The tool embeds each BMP image into the PDF using pdf-lib's image embedding. The output is a standard PDF that opens in any reader on any platform.` },
    ]},
    { heading: "How to Use BMP to PDF", content: [
      { type: "list", items: [
        `Upload one or more BMP files by dropping them onto the upload zone.`,
        `Reorder if needed.`,
        `Click <strong>Convert to PDF</strong>. Each image is embedded as a page.`,
        `Download the result as <code>bmp-to-pdf.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use BMP to PDF?", content: [
      { type: "paragraph", text: `BMP files are not easily shared across platforms and cannot be viewed in browsers natively. Converting to PDF creates a single document that prints cleanly, emails easily, and opens anywhere. Common use cases include archiving screenshots, compiling image-based documentation, and preparing print-ready packets from BMP source files.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "BMP files are very large — will the PDF be huge?", content: [
      { type: "paragraph", text: `The PDF size depends on the BMP dimensions and count. BMP files are uncompressed, so a 10 MB BMP produces roughly the same size in the PDF. Consider converting to JPG first if file size is a concern.` },
    ]},
  ],
};

const seoPngToPdf: ToolSeo = {
  sections: [
    { heading: "What is PNG to PDF?", content: [
      { type: "paragraph", text: `PNG to PDF converts PNG image files into a PDF document. Each image becomes one page, sized to match the image dimensions. PNG files with transparency are rendered on a white background. The output is a standard PDF that preserves image quality.` },
      { type: "paragraph", text: `The tool embeds each PNG image into the PDF using pdf-lib. The conversion is lossless — no re-encoding or compression is applied to the image data.` },
    ]},
    { heading: "How to Use PNG to PDF", content: [
      { type: "list", items: [
        `Upload one or more PNG files by dropping them onto the upload zone.`,
        `Reorder if needed — the order determines page sequence.`,
        `Click <strong>Convert to PDF</strong>. Each image is embedded as a page.`,
        `Download the result as <code>png-to-pdf.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use PNG to PDF?", content: [
      { type: "paragraph", text: `PNG is the standard format for screenshots, diagrams, and transparent graphics, but it is not printable as a multi-image document. Converting to PDF combines multiple PNGs into a single, page-ordered document suitable for printing, emailing, and archiving. Designers compile mockups into presentations. Developers package screenshots into reports.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What about transparent PNGs?", content: [
      { type: "paragraph", text: `Transparent areas are rendered on a white background in the PDF. The transparency is not preserved because PDF pages have an opaque background by default.` },
    ]},
  ],
};

/* ════════════════════ Batch: Edit PDF (highlight, callout, etc.) ════════════════════ */

/* ════════════════════ Batch 4: Convert to PDF + Optimize & Color ════════════════════ */

const seoBase64ToPdf: ToolSeo = {
  sections: [
    { heading: "What is Base64 to PDF?", content: [
      { type: "paragraph", text: `Base64 to PDF decodes a Base64-encoded string back into a PDF file. It strips any data-URI prefix (like <code>data:application/pdf;base64,</code>), decodes the Base64 text using the browser's <code>atob()</code> function, and returns the raw PDF bytes.` },
    ]},
    { heading: "How to Use Base64 to PDF", content: [
      { type: "list", items: [
        `Upload a text file containing the Base64-encoded PDF string.`,
        `Click <strong>Decode</strong>. The tool strips whitespace and data-URI prefixes, then decodes the string.`,
        `Download the result as <code>decoded.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Base64 to PDF?", content: [
      { type: "paragraph", text: `Base64 encoding is commonly used to embed PDF data in JSON responses, email attachments, HTML pages, and configuration files. This tool lets you recover the original PDF from those encoded strings without writing any code.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The decoding happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What if my Base64 string includes a data URI prefix?", content: [
      { type: "paragraph", text: `The tool automatically strips common prefixes like <code>data:application/pdf;base64,</code> and <code>data:text/plain;base64,</code> before decoding, so you can paste the full data URI without cleaning it first.` },
    ]},
  ],
};

const seoXmlToPdf: ToolSeo = {
  sections: [
    { heading: "What is XML to PDF?", content: [
      { type: "paragraph", text: `XML to PDF converts an XML document into a PDF file. It uses a BentoPDF adapter to parse the XML structure and render it as a PDF document with proper page layout and formatting.` },
    ]},
    { heading: "How to Use XML to PDF", content: [
      { type: "list", items: [
        `Upload your XML file.`,
        `Click <strong>Convert</strong>. The tool parses the XML structure and generates a PDF.`,
        `Download the result as <code>xml-to-pdf.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use XML to PDF?", content: [
      { type: "paragraph", text: `XML data often needs to be presented as a readable document — reports from data pipelines, configuration dumps for documentation, or structured data that needs to be shared with stakeholders who don't read XML. This tool produces a formatted PDF from any XML input.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The conversion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What XML structures are supported?", content: [
      { type: "paragraph", text: `The tool handles standard XML with text content and nested elements. Complex XML with namespaces, CDATA sections, or mixed content may produce varying results. For best output, use well-structured XML with clear element hierarchy.` },
    ]},
  ],
};

const seoInvertColors: ToolSeo = {
  sections: [
    { heading: "What is Invert Colors?", content: [
      { type: "paragraph", text: `Invert Colors renders each page of a PDF at 1.5x resolution using PDF.js, inverts every pixel's RGB values (255 - original), and outputs the result as a new PDF with embedded JPEG images. The visual effect is a photographic negative of the original document.` },
    ]},
    { heading: "How to Use Invert Colors", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Click <strong>Invert</strong>. Each page is rendered to canvas, pixel colors are inverted, and the result is embedded as JPEG images in a new PDF.`,
        `Download the result as <code>inverted.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Invert Colors?", content: [
      { type: "paragraph", text: `Color inversion is useful for creating photographic negatives, improving readability of dark-on-light text for certain visual conditions, creating artistic effects, or testing display behavior with inverted content. It's also used in specialized workflows like some medical imaging review processes.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The color inversion happens entirely on your device using browser canvas. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will the text remain selectable after inversion?", content: [
      { type: "paragraph", text: `No. The tool renders pages as raster images (JPEG), so the output is image-based. Text is no longer selectable or searchable. The file size may also increase compared to the original vector-based PDF.` },
    ]},
  ],
};

const seoGrayscalePdf: ToolSeo = {
  sections: [
    { heading: "What is Grayscale PDF?", content: [
      { type: "paragraph", text: `Grayscale PDF converts each page of a color PDF to grayscale using luminance-weighted averaging (0.299R + 0.587G + 0.114B — the standard NTSC formula). Each page is rendered to canvas, desaturated, and embedded as a JPEG image in a new PDF.` },
    ]},
    { heading: "How to Use Grayscale PDF", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Click <strong>Convert</strong>. Each page is rendered, desaturated using the standard luminance formula, and embedded as a JPEG in a new document.`,
        `Download the result as <code>grayscale.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Grayscale PDF?", content: [
      { type: "paragraph", text: `Grayscale conversion reduces file size by eliminating color data, ensures consistent black-and-white printing, and is often required for academic submissions, legal filings, and archival standards. The luminance-weighted formula preserves the visual hierarchy of colored elements when converted to gray tones.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The grayscale conversion happens entirely on your device using browser canvas. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will text remain selectable?", content: [
      { type: "paragraph", text: `No. Like Invert Colors, this tool renders pages as raster JPEG images. The output is image-based, so text is not selectable or searchable. If you need to preserve text while removing color, use a different approach such as changing the PDF color space.` },
    ]},
  ],
};

const seoFixPageSize: ToolSeo = {
  sections: [
    { heading: "What is Fix Page Size?", content: [
      { type: "paragraph", text: `Fix Page Size normalizes all pages in a PDF to a consistent size by scaling and centering the content. It uses the first page's dimensions as the target size, then scales every other page's content to fit within those bounds while maintaining aspect ratio.` },
    ]},
    { heading: "How to Use Fix Page Size", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Optionally specify a target page size (defaults to the first page's dimensions).`,
        `Click <strong>Fix</strong>. The tool copies each page, scales its content to fit the target dimensions, and centers it.`,
        `Download the result as <code>fixed-pages.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Fix Page Size?", content: [
      { type: "paragraph", text: `Mixed page sizes in a PDF cause problems with printing, viewing, and sharing. Fix Page Size ensures uniform dimensions across the entire document — essential when combining PDFs from different sources, standardizing scanned documents, or preparing for consistent print output.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The page size adjustment happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What happens to oversized pages?", content: [
      { type: "paragraph", text: `Pages larger than the target are scaled down to fit. Pages smaller than the target are scaled up and centered. The aspect ratio is preserved in both cases — content is never stretched or distorted.` },
    ]},
  ],
};

/* ════════════════════ Batch 3: Utilities ════════════════════ */

const seoInsertPdfAt: ToolSeo = {
  sections: [
    { heading: "What is Insert PDF At?", content: [
      { type: "paragraph", text: `Insert PDF At inserts an entire second PDF document into a primary PDF at a specified page position. It splits the primary document before the insertion point, appends all pages from the secondary document, then appends the remaining pages from the primary — creating a single merged document.` },
    ]},
    { heading: "How to Use Insert PDF At", content: [
      { type: "list", items: [
        `Upload the primary PDF file.`,
        `Upload the secondary PDF to insert.`,
        `Specify the page position (1-indexed) where the secondary PDF should be inserted.`,
        `Click <strong>Insert</strong>. The tool assembles the combined document.`,
        `Download the result as <code>inserted.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Insert PDF At?", content: [
      { type: "paragraph", text: `This is the precise way to merge PDFs at a specific position, rather than just appending to the end. Use it to add cover pages in the middle of a document, insert appendices at specific locations, or combine portions of multiple documents in a defined order.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The PDF insertion happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What happens if the insertion position is beyond the last page?", content: [
      { type: "paragraph", text: `The secondary PDF is inserted at the specified index. If the position exceeds the document length, the pages are appended at the end.` },
    ]},
  ],
};

const seoOverlayPdf: ToolSeo = {
  sections: [
    { heading: "What is Overlay PDF?", content: [
      { type: "paragraph", text: `Overlay PDF renders each page of a secondary PDF as a PNG image at 2x resolution, then draws that image on top of the corresponding page in the primary PDF with adjustable opacity. The result is a layered document where the overlay appears as a semi-transparent layer on top of the original content.` },
    ]},
    { heading: "How to Use Overlay PDF", content: [
      { type: "list", items: [
        `Upload the primary PDF file.`,
        `Upload the overlay PDF file.`,
        `Set the overlay opacity (default is 0.3 for 30% opacity).`,
        `Click <strong>Overlay</strong>. The tool renders each overlay page and composites it onto the primary.`,
        `Download the result as <code>overlaid.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Overlay PDF?", content: [
      { type: "paragraph", text: `Overlays are useful for adding watermarks, stamps, backgrounds, or comparative layers to a document. Common use cases include superimposing a draft watermark, adding a letterhead background, or comparing two versions of a document visually by layering them at reduced opacity.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The overlay rendering happens entirely on your device using browser canvas. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What if the PDFs have different page counts?", content: [
      { type: "paragraph", text: `If the overlay PDF has fewer pages than the primary, the last overlay page is repeated for the remaining primary pages. If it has more pages, extra overlay pages are ignored.` },
    ]},
  ],
};

const seoPdfHash: ToolSeo = {
  sections: [
    { heading: "What is PDF Hash?", content: [
      { type: "paragraph", text: `PDF Hash computes a cryptographic hash of the entire PDF file using the Web Crypto API. You can choose the hash algorithm (default is SHA-256), and the tool returns the hex-encoded hash value along with the file name and algorithm used.` },
    ]},
    { heading: "How to Use PDF Hash", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Optionally select the hash algorithm (SHA-1, SHA-256, SHA-384, SHA-512 — default is SHA-256).`,
        `Click <strong>Calculate Hash</strong>. The tool computes the digest over the raw file bytes.`,
        `Download the result as <code>hash.txt</code> containing the algorithm, filename, and hex hash.`,
      ]},
    ]},
    { heading: "Why Use PDF Hash?", content: [
      { type: "paragraph", text: `File hashes are used for integrity verification — confirming that a file hasn't been modified or corrupted during transfer. SHA-256 is the industry standard for document verification, and you can compare the hash against a known-good value to confirm authenticity.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The hash calculation happens entirely on your device using the browser's built-in crypto API. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Which hash algorithm should I use?", content: [
      { type: "paragraph", text: `SHA-256 is the best default for most use cases — it's fast, widely supported, and collision-resistant. Use SHA-512 for maximum security requirements, or SHA-1 only when matching legacy systems that require it.` },
    ]},
  ],
};

const seoScaleContent: ToolSeo = {
  sections: [
    { heading: "What is Scale Content?", content: [
      { type: "paragraph", text: `Scale Content uniformly scales the page content of a PDF by a percentage while keeping the page dimensions unchanged. It uses pdf-lib's <code>scaleContent()</code> and <code>translateContent()</code> to resize the content and center it within the original page bounds.` },
    ]},
    { heading: "How to Use Scale Content", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Enter the scale percentage (default is 90% — content shrinks slightly with a margin).`,
        `Click <strong>Scale</strong>. The tool scales all page content by the factor and re-centers it.`,
        `Download the result as <code>scaled.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Scale Content?", content: [
      { type: "paragraph", text: `Scaling content is useful for adding margins to tightly cropped documents, fitting content to a different page size without changing the page dimensions, or adjusting visual scale for presentation or printing purposes.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The scaling happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What does the scale percentage mean?", content: [
      { type: "paragraph", text: `100% means no change. Values below 100% shrink the content (90% = content is 90% of original, centered with 5% margins on each side). Values above 100% enlarge the content, which may cause it to extend beyond page boundaries.` },
    ]},
  ],
};

const seoExtractAttachments: ToolSeo = {
  sections: [
    { heading: "What is Extract Attachments?", content: [
      { type: "paragraph", text: `Extract Attachments extracts all embedded file attachments from a PDF document. It navigates the PDF's internal catalog structure to find the EmbeddedFiles name tree, extracts each attached file's raw data, and packages them into a ZIP archive for download.` },
    ]},
    { heading: "How to Use Extract Attachments", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Click <strong>Extract</strong>. The tool scans the PDF catalog for embedded files.`,
        `If attachments are found, download them as <code>attachments.zip</code>. If none exist, the tool reports that no attachments were found.`,
      ]},
    ]},
    { heading: "Why Use Extract Attachments?", content: [
      { type: "paragraph", text: `Many professional PDFs contain embedded files — spreadsheets referenced in reports, source documents attached to contracts, or data files bundled with specifications. Extracting these attachments lets you access the bundled data without specialized PDF reader software.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The attachment extraction happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Why does the tool say no attachments found?", content: [
      { type: "paragraph", text: `Not all PDFs contain embedded attachments. The tool only extracts files stored in the PDF's EmbeddedFiles name tree — images, form data, and page content are not considered attachments. If your PDF only contains visual content, there will be no extractable attachments.` },
    ]},
  ],
};

const seoPdfToZip: ToolSeo = {
  sections: [
    { heading: "What is PDF to ZIP?", content: [
      { type: "paragraph", text: `PDF to ZIP packages multiple PDF files into a single ZIP archive. Upload any number of PDFs, and the tool bundles them into a downloadable <code>documents.zip</code> file with their original filenames preserved.` },
    ]},
    { heading: "How to Use PDF to ZIP", content: [
      { type: "list", items: [
        `Upload two or more PDF files.`,
        `Click <strong>Package</strong>. The tool creates a ZIP archive containing all uploaded files.`,
        `Download the result as <code>documents.zip</code>.`,
      ]},
    ]},
    { heading: "Why Use PDF to ZIP?", content: [
      { type: "paragraph", text: `Packaging PDFs into a ZIP is the simplest way to share multiple documents as a single download. It's useful for sending batches of reports, combining processed PDFs from different tools, or organizing files for archiving.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The ZIP packaging happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Is the ZIP file compressed?", content: [
      { type: "paragraph", text: `The ZIP archive uses standard compression. Since PDFs are already compressed formats (most use deflate internally), the additional ZIP compression provides modest size reduction — typically 1-5% smaller than the sum of the original files.` },
    ]},
  ],
};

/* ════════════════════ Batch 2: Forms & Signatures ════════════════════ */

const seoUploadSignature: ToolSeo = {
  sections: [
    { heading: "What is Upload Signature?", content: [
      { type: "paragraph", text: `Upload Signature accepts an image file containing your signature and returns it as a ready-to-use signature image. This is a passthrough tool — it reads the uploaded file bytes and outputs them as a <code>signature.png</code> file that can be used with Sign PDF or other signature workflows.` },
    ]},
    { heading: "How to Use Upload Signature", content: [
      { type: "list", items: [
        `Upload an image file containing your signature (PNG, JPG, or other image formats).`,
        `Click <strong>Upload Signature</strong>. The tool passes through the image data as-is.`,
        `Download the result as <code>signature.png</code>.`,
      ]},
    ]},
    { heading: "Why Use Upload Signature?", content: [
      { type: "paragraph", text: `If you have a scanned or photographed signature on paper, this tool gives you a clean digital version that can be embedded into PDF documents. The passthrough approach preserves the original quality without re-encoding artifacts.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The signature image is processed entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What image formats are supported?", content: [
      { type: "paragraph", text: `Any format your browser can read — PNG, JPG, WebP, GIF, BMP, and SVG. The output is always saved with the <code>.png</code> extension regardless of input format.` },
    ]},
  ],
};

const seoTypeSignature: ToolSeo = {
  sections: [
    { heading: "What is Type Signature?", content: [
      { type: "paragraph", text: `Type Signature creates a new PDF document containing a large text-based signature. You type your name or initials, and the tool generates a clean 400x200pt PDF with the text rendered at 48pt — a quick way to create a signature image without handwriting or scanning.` },
    ]},
    { heading: "How to Use Type Signature", content: [
      { type: "list", items: [
        `Enter your signature text in the input field (default is "Signature").`,
        `Click <strong>Generate</strong>. The tool creates a new PDF with your text rendered large and centered.`,
        `Download the result as <code>signature.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Type Signature?", content: [
      { type: "paragraph", text: `Not everyone has a scanned handwriting signature. Type Signature gives you a professional-looking typed signature that works for non-formal documents, internal approvals, and digital workflows where a typed name is acceptable as a signature.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The signature PDF is generated entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Is a typed signature legally valid?", content: [
      { type: "paragraph", text: `Typed signatures may be accepted in many contexts depending on jurisdiction and the parties involved. For legally binding documents, consult applicable electronic signature laws (e.g., ESIGN Act in the US, eIDAS in the EU) and consider using a dedicated e-signature service with audit trails.` },
    ]},
  ],
};

const seoFillForms: ToolSeo = {
  sections: [
    { heading: "What is Fill Forms?", content: [
      { type: "paragraph", text: `Fill Forms programmatically fills PDF form fields with the values you provide. It reads the form field names from the PDF, matches them against your input data, and sets the values using pdf-lib's form API. Supports text fields and checkboxes.` },
    ]},
    { heading: "How to Use Fill Forms", content: [
      { type: "list", items: [
        `Upload your PDF form file.`,
        `Provide the form field data as a JSON object mapping field names to values (text fields accept strings, checkboxes accept true/false).`,
        `Click <strong>Fill Forms</strong>. The tool iterates over your data and sets each matching field.`,
        `Download the result as <code>filled.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Fill Forms?", content: [
      { type: "paragraph", text: `Filling PDF forms programmatically is essential for batch processing, automated workflows, and situations where the form has many fields that would be tedious to fill manually. This tool works entirely in the browser with no server upload.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The form filling happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How do I find the field names?", content: [
      { type: "paragraph", text: `Use the Form Field Extract tool to scan your PDF and list all field names and their types. Then use those names as keys in your fill data JSON object.` },
    ]},
  ],
};

const seoCreateFormFields: ToolSeo = {
  sections: [
    { heading: "What is Create Form Fields?", content: [
      { type: "paragraph", text: `Create Form Fields adds new interactive form fields to an existing PDF. You specify field definitions with name, type (text or checkbox), page number, and position coordinates. The tool uses pdf-lib's form creation API to embed the fields into the document.` },
    ]},
    { heading: "How to Use Create Form Fields", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Define form fields as an array of objects, each with <code>name</code>, <code>type</code> ("text" or "checkbox"), <code>page</code>, <code>x</code>, <code>y</code>, <code>width</code>, and <code>height</code>.`,
        `Click <strong>Create Fields</strong>. The tool adds each field to the specified page at the given position.`,
        `Download the result as <code>with-fields.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Create Form Fields?", content: [
      { type: "paragraph", text: `Adding form fields to an existing PDF is useful when you have a designed document (a contract template, an application form layout) and need to make it interactive for digital completion. This tool lets you place fields precisely where you want them.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The field creation happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What field types are supported?", content: [
      { type: "paragraph", text: `Currently supported types are <code>text</code> (PDFTextField) and <code>checkbox</code> (PDFCheckBox). Dropdown, radio button, and signature fields are not yet supported.` },
    ]},
  ],
};

const seoAddInitials: ToolSeo = {
  sections: [
    { heading: "What is Add Initials?", content: [
      { type: "paragraph", text: `Add Initials draws text initials at specified coordinates on a PDF page. It uses pdf-lib to render the initials text at 24pt at the position you choose, commonly used for marking document pages with reviewer or approver initials.` },
    ]},
    { heading: "How to Use Add Initials", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Enter your initials text and specify the page number, x and y coordinates.`,
        `Click <strong>Add Initials</strong>. The tool draws your initials at the specified position.`,
        `Download the result as <code>with-initials.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Initials?", content: [
      { type: "paragraph", text: `Initials are commonly required in legal and business documents to confirm that each page has been reviewed. Rather than hand-writing initials on every page, this tool lets you place them consistently at the same position across all specified pages.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The initials are drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I add initials to every page at once?", content: [
      { type: "paragraph", text: `The current implementation places initials on a single specified page. To initial every page, you would need to run the tool once per page. Multi-page initial placement is not yet supported.` },
    ]},
  ],
};

const seoExportFormData: ToolSeo = {
  sections: [
    { heading: "What is Export Form Data?", content: [
      { type: "paragraph", text: `Export Form Data extracts all form field values from a PDF and outputs them as a structured JSON file. It reads every field in the document — text inputs, checkboxes, dropdowns, and radio buttons — and produces a JSON array with each field's name and current value.` },
    ]},
    { heading: "How to Use Export Form Data", content: [
      { type: "list", items: [
        `Upload your filled PDF form.`,
        `Click <strong>Export</strong>. The tool scans all form fields and extracts their current values.`,
        `Download the result as <code>form-data.json</code>.`,
      ]},
    ]},
    { heading: "Why Use Export Form Data?", content: [
      { type: "paragraph", text: `Exporting form data is useful for data migration, archival, verification, and integration with other systems. You can use the exported JSON to populate other forms, import into databases, or verify that all fields were filled correctly before submission.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The data extraction happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What format is the exported data?", content: [
      { type: "paragraph", text: `The export produces a JSON object with a <code>fields</code> array. Each element has a <code>name</code> (the field's internal name) and a <code>value</code> (the current value as a string). Checkboxes are "true" or "false" strings; text fields contain their text content.` },
    ]},
  ],
};

const seoFlattenForms: ToolSeo = {
  sections: [
    { heading: "What is Flatten Forms?", content: [
      { type: "paragraph", text: `Flatten Forms converts all interactive form fields in a PDF into static content. After flattening, the form field values are permanently baked into the page visuals — text inputs become regular text, checkboxes become static checkmarks — and the fields are no longer editable or interactive.` },
    ]},
    { heading: "How to Use Flatten Forms", content: [
      { type: "list", items: [
        `Upload your filled PDF form.`,
        `Click <strong>Flatten</strong>. The tool uses pdf-lib's <code>form.flatten()</code> to merge all field values into the page content.`,
        `Download the result as <code>flattened.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Flatten Forms?", content: [
      { type: "paragraph", text: `Flattening is essential before sharing filled forms externally. It ensures that the data cannot be accidentally modified by recipients, makes the PDF compatible with viewers that don't support interactive forms, and reduces file size by eliminating form field metadata.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The flattening happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I undo flattening?", content: [
      { type: "paragraph", text: `No. Flattening is irreversible — the form field structure is permanently removed and the values become part of the page content. Always keep a copy of the original unfilled form before flattening.` },
    ]},
  ],
};

const seoFormFieldRenamer: ToolSeo = {
  sections: [
    { heading: "What is Form Field Renamer?", content: [
      { type: "paragraph", text: `Form Field Renamer changes the internal names of form fields in a PDF. You provide a mapping of current field names to new names, and the tool updates the PDF's <code>/T</code> entry for each matching field using pdf-lib's low-level PDFName API.` },
    ]},
    { heading: "How to Use Form Field Renamer", content: [
      { type: "list", items: [
        `Upload your PDF form.`,
        `Provide a rename map as a JSON object mapping old field names to new field names.`,
        `Click <strong>Rename</strong>. The tool updates each matching field's internal name.`,
        `Download the result as <code>renamed-fields.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Form Field Renamer?", content: [
      { type: "paragraph", text: `Renaming form fields is useful when field names are auto-generated or cryptic (e.g., "field_001" → "Full Name"), when consolidating forms from different sources with conflicting names, or when preparing forms for systems that expect specific field name conventions.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The renaming happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will renaming break form functionality?", content: [
      { type: "paragraph", text: `Renaming changes the field identifier but preserves the field's type, value, position, and appearance. Form functionality is unaffected — only the internal name changes. However, if external scripts or databases reference the old field names, those references will need updating.` },
    ]},
  ],
};

const seoImportFormData: ToolSeo = {
  sections: [
    { heading: "What is Import Form Data?", content: [
      { type: "paragraph", text: `Import Form Data fills PDF form fields from structured input data. It accepts a JSON object mapping field names to values and uses pdf-lib to set each field's value — supporting text fields and checkboxes. This is the same engine as Fill Forms, designed for importing pre-collected data.` },
    ]},
    { heading: "How to Use Import Form Data", content: [
      { type: "list", items: [
        `Upload your blank or partially filled PDF form.`,
        `Provide the form data as a JSON object mapping field names to values.`,
        `Click <strong>Import</strong>. The tool sets each matching field's value.`,
        `Download the result as <code>filled.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Import Form Data?", content: [
      { type: "paragraph", text: `Importing form data is essential for batch processing workflows where form responses come from external systems (databases, APIs, CSV exports). Instead of filling each form manually, you can programmatically populate thousands of forms from structured data.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The data import happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What if my JSON field names don't match the PDF fields?", content: [
      { type: "paragraph", text: `Fields whose names don't match any field in the PDF are silently skipped. Use the Form Field Extract tool first to get the exact field names from your PDF, then use those names in your import data.` },
    ]},
  ],
};

const seoHighlightText: ToolSeo = {
  sections: [
    { heading: "What is Highlight Text?", content: [
      { type: "paragraph", text: `Highlight Text searches for a specific word or phrase across every page of a PDF and draws a semi-transparent yellow rectangle over each matching text fragment. It uses PDF.js to locate text positions and pdf-lib to draw the annotation rectangles directly onto the page content.` },
      { type: "paragraph", text: `The tool finds every occurrence, not just the first one, so a single search term will highlight every match throughout the entire document.` },
    ]},
    { heading: "How to Use Highlight Text", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Enter the text to search for in the <strong>Search Text</strong> field — this is case-insensitive.`,
        `Click <strong>Highlight</strong>. The tool scans every page and draws yellow rectangles over matching text.`,
        `Download the result as <code>highlight-text.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Highlight Text?", content: [
      { type: "paragraph", text: `Highlighting is the fastest way to visually flag important passages in a PDF. Unlike an editor that lets you annotate interactively, this tool processes the entire document in one step — useful when you need to mark every instance of a term across a long report or contract before sharing it with collaborators.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The highlighting happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I choose a different highlight color?", content: [
      { type: "paragraph", text: `The current implementation uses yellow. Custom highlight colors are not yet available but may be added in a future update.` },
    ]},
    { heading: "", subHeading: "What if my text spans multiple lines?", content: [
      { type: "paragraph", text: `The tool matches individual text items from the PDF's text layer. If your search term is split across text items (for example, broken by a line break), it may not match as a single highlight. Short words and phrases that appear within a single text item match best.` },
    ]},
  ],
};

const seoAddBackground: ToolSeo = {
  sections: [
    { heading: "What is Add Background?", content: [
      { type: "paragraph", text: `Add Background applies a solid color fill behind the content of every page in a PDF. It uses pdf-lib to draw a full-page rectangle in the specified color, effectively changing the page background from white to your chosen shade.` },
    ]},
    { heading: "How to Use Add Background", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Enter a hex color code for the background (default is <code>#f5f5f5</code>, a light gray).`,
        `Click <strong>Add Background</strong>. A filled rectangle is drawn on every page behind the existing content.`,
        `Download the result as <code>background-added.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Background?", content: [
      { type: "paragraph", text: `A background color can improve readability, match brand guidelines, or add visual contrast. This is especially useful for PDFs with transparent elements or documents that will be presented on-screen where a colored background looks more polished than plain white.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The background addition happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Will the background cover my content?", content: [
      { type: "paragraph", text: `The background rectangle is drawn before the existing page content, so your text and images remain visible on top. If you use a very dark color, it may reduce contrast with dark text.` },
    ]},
  ],
};

const seoAddBleed: ToolSeo = {
  sections: [
    { heading: "What is Add Bleed?", content: [
      { type: "paragraph", text: `Add Bleed extends the media box of every page in a PDF by a specified number of points on all four sides. This creates extra margin space around the page content, which is essential for professional print workflows where content must extend beyond the final trim line to avoid white edges after cutting.` },
    ]},
    { heading: "How to Use Add Bleed", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Specify the bleed amount in points (default is 9pt, approximately 3mm).`,
        `Click <strong>Add Bleed</strong>. The tool expands each page's media box symmetrically.`,
        `Download the result as <code>bleed-added.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Bleed?", content: [
      { type: "paragraph", text: `Commercial printers require bleed margins to ensure that trimmed pages don't show unprinted white edges. If you're preparing a PDF for professional printing, adding bleed is a standard prepress step that most design software handles — but this tool lets you add it after the fact, directly to an existing PDF.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The bleed adjustment happens entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What is a point in PDF terms?", content: [
      { type: "paragraph", text: `One PDF point equals 1/72 of an inch (approximately 0.35mm). So 9pt equals roughly 3mm, 18pt equals roughly 6mm, and 28.35pt equals exactly 10mm.` },
    ]},
  ],
};

const seoAddCallout: ToolSeo = {
  sections: [
      { heading: "What is Add Callout?", content: [
      { type: "paragraph", text: `Add Callout draws a text callout box with a triangular pointer on a PDF page. The callout consists of a bordered rectangle containing your text, with two lines forming a pointer triangle that directs attention to a specific area of the page.` },
      { type: "paragraph", text: `You specify the position (x, y coordinates), the text content, and which page to annotate. The box size auto-adjusts based on the text width.` },
    ]},
    { heading: "How to Use Add Callout", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Specify the page number, x and y coordinates, and the callout text.`,
        `Click <strong>Add Callout</strong>. The tool draws a bordered rectangle with a pointer triangle at your specified location.`,
        `Download the result as <code>callout-added.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Callout?", content: [
      { type: "paragraph", text: `Callouts are a standard visual annotation for drawing attention to specific parts of a document. They're useful in review workflows, educational materials, and presentations where you need to highlight a specific area with an explanatory note without obscuring the underlying content.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The callout is drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How do coordinates work in a PDF?", content: [
      { type: "paragraph", text: `PDF coordinates use points (1/72 inch) measured from the bottom-left corner of the page. X increases to the right, Y increases upward. For a US Letter page (612 x 792 pt), x=100 y=400 would place the callout in the upper-left area.` },
    ]},
  ],
};

const seoAddDateStamp: ToolSeo = {
  sections: [
    { heading: "What is Add Date Stamp?", content: [
      { type: "paragraph", text: `Add Date Stamp draws today's date on the first page of a PDF inside a small bordered box in the bottom-left corner. It uses the browser's locale to format the date string, so the format matches your system's regional settings (e.g., MM/DD/YYYY for US English).` },
    ]},
    { heading: "How to Use Add Date Stamp", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Click <strong>Add Date Stamp</strong>. The tool draws a gray box with today's date at position (45, 45) on page 1.`,
        `Download the result as <code>date-stamped.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Date Stamp?", content: [
      { type: "paragraph", text: `A date stamp provides a quick visual record of when a document was processed or printed. Common use cases include marking received documents, timestamping review copies, and adding processing dates to archival materials.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The date stamp is drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I stamp multiple pages?", content: [
      { type: "paragraph", text: `The current implementation stamps only the first page. Multi-page stamping is not yet supported.` },
    ]},
  ],
};

const seoAddGridOverlay: ToolSeo = {
  sections: [
    { heading: "What is Add Grid Overlay?", content: [
      { type: "paragraph", text: `Add Grid Overlay draws a grid of evenly spaced horizontal and vertical lines across every page of a PDF. You control the spacing (in points) and the line color. The grid is drawn directly onto the page content using pdf-lib.` },
    ]},
    { heading: "How to Use Add Grid Overlay", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Set the grid spacing in points (default is 50pt) and optionally choose a line color as a hex code (default is <code>#cccccc</code>).`,
        `Click <strong>Add Grid</strong>. The tool draws vertical lines at every x-interval and horizontal lines at every y-interval across all pages.`,
        `Download the result as <code>grid-overlay.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Grid Overlay?", content: [
      { type: "paragraph", text: `Grid overlays are useful for layout alignment, design review, print calibration, and educational purposes. Architects and designers use them to check proportions, while educators use them for graph paper overlays on worksheets.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The grid is drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What grid size should I use?", content: [
      { type: "paragraph", text: `50pt grids are roughly 17mm (good for general alignment). 72pt grids align to 1-inch intervals. Smaller values like 25pt create dense grids useful for fine layout work.` },
    ]},
  ],
};

const seoAddStamps: ToolSeo = {
  sections: [
    { heading: "What is Add Stamps?", content: [
      { type: "paragraph", text: `Add Stamps draws a large rotated text stamp on the first page of a PDF. The text is rendered at 48pt with 50% opacity, angled at 30 degrees. By default it stamps "APPROVED" in blue. If the text is "REJECTED", it uses red instead.` },
    ]},
    { heading: "How to Use Add Stamps", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Enter stamp text (default is <code>APPROVED</code>). Text is automatically converted to uppercase.`,
        `Click <strong>Add Stamp</strong>. A large semi-transparent rotated text stamp is drawn on page 1.`,
        `Download the result as <code>stamped.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Stamps?", content: [
      { type: "paragraph", text: `Stamps are a standard way to visually indicate document status — approval, rejection, draft marking, confidentiality notices. The large rotated semi-transparent style ensures the stamp is visible without completely obscuring the underlying content.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The stamp is drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I change the stamp position or size?", content: [
      { type: "paragraph", text: `The current implementation places the stamp at a fixed position (100, 100) at 48pt. Custom positioning and sizing are not yet available.` },
    ]},
  ],
};

const seoAddTimestamp: ToolSeo = {
  sections: [
    { heading: "What is Add Timestamp?", content: [
      { type: "paragraph", text: `Add Timestamp updates the PDF's internal creation and modification dates to the current date and time. It uses pdf-lib's <code>setCreationDate()</code> and <code>setModificationDate()</code> methods to modify the document's metadata timestamps.` },
    ]},
    { heading: "How to Use Add Timestamp", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Click <strong>Add Timestamp</strong>. The tool sets both the creation and modification dates to the current moment.`,
        `Download the result as <code>timestamped.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Timestamp?", content: [
      { type: "paragraph", text: `Timestamping establishes when a document was last modified, which is useful for version tracking, compliance workflows, and establishing document provenance. This is a metadata-level timestamp, not a cryptographic timestamp — for cryptographic proof, use the dedicated Timestamp PDF tool instead.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The timestamp is applied entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What's the difference between this and Timestamp PDF?", content: [
      { type: "paragraph", text: `Add Timestamp simply updates the PDF's internal date metadata fields. Timestamp PDF uses a cryptographic signing authority to create a verifiable, tamper-evident timestamp that can be validated independently. Use Add Timestamp for simple version tracking; use Timestamp PDF when you need cryptographic proof of when a document existed.` },
    ]},
  ],
};

const seoPermissionEditor: ToolSeo = {
  sections: [
    { heading: "What is Permission Editor?", content: [
      { type: "paragraph", text: `Permission Editor sets PDF document permissions — controlling whether the document can be printed, modified, or copied. It applies an owner password using pdf-lib's encryption support to enforce these restrictions. The permissions take effect in PDF readers that honor permission flags.` },
    ]},
    { heading: "How to Use Permission Editor", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Choose which permissions to enable: <strong>Printing</strong> (high resolution), <strong>Modifying</strong>, and <strong>Copying</strong>.`,
        `Set an owner password (defaults to a placeholder if left blank).`,
        `Click <strong>Set Permissions</strong>. The tool saves the PDF with the new permission flags.`,
        `Download the result as <code>permissions-set.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Permission Editor?", content: [
      { type: "paragraph", text: `PDF permissions let you control what readers can do with your document without requiring a full password to open it. This is common in business workflows where documents need to be viewable but not editable, or printable but not copyable.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Permissions are applied entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Are PDF permissions unbreakable?", content: [
      { type: "paragraph", text: `PDF permission flags are advisory — they work in compliant readers (Adobe Acrobat, most modern PDF viewers) but can be ignored by non-compliant tools. For stronger protection, combine permissions with an owner password that prevents unauthorized removal of the restrictions.` },
    ]},
  ],
};

const seoStrikeText: ToolSeo = {
  sections: [
    { heading: "What is Strike Text?", content: [
      { type: "paragraph", text: `Strike Text searches for a specific word or phrase across every page of a PDF and draws a horizontal strikethrough line through each matching text fragment. It uses PDF.js to locate text positions and pdf-lib to draw the lines.` },
    ]},
    { heading: "How to Use Strike Text", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Enter the text to strike through in the <strong>Search Text</strong> field.`,
        `Click <strong>Strike Text</strong>. The tool draws a red line through the vertical center of every matching text item across all pages.`,
        `Download the result as <code>strike-text.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Strike Text?", content: [
      { type: "paragraph", text: `Strikethrough text is universally understood to mean "deleted" or "obsolete." It's useful in review workflows for marking text slated for removal, in contracts to show redacted clauses, and in any document revision where you want the original text to remain visible but clearly marked as struck out.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The strikethrough lines are drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What if I want to redact text instead?", content: [
      { type: "paragraph", text: `Strikethrough leaves the original text visible beneath the line. If you need to permanently hide text (redaction), use the dedicated Redact tool instead, which fills the text area with an opaque rectangle.` },
    ]},
  ],
};

const seoUnderlineText: ToolSeo = {
  sections: [
    { heading: "What is Underline Text?", content: [
      { type: "paragraph", text: `Underline Text searches for a specific word or phrase across every page of a PDF and draws a red underline beneath each matching text fragment. It uses PDF.js to locate text positions and pdf-lib to draw the lines.` },
    ]},
    { heading: "How to Use Underline Text", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Enter the text to underline in the <strong>Search Text</strong> field.`,
        `Click <strong>Underline Text</strong>. The tool draws a red line below every matching text item across all pages.`,
        `Download the result as <code>underline-text.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Underline Text?", content: [
      { type: "paragraph", text: `Underlining is the most common way to emphasize text in a document. This tool automates the process for every occurrence of a term, which is useful for review workflows, study guides, and marking key terms in reference documents.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The underlines are drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I choose the underline color?", content: [
      { type: "paragraph", text: `The current implementation uses red underlines. Custom underline colors are not yet supported.` },
    ]},
  ],
};

const seoAddArrow: ToolSeo = {
  sections: [
    { heading: "What is Add Arrow?", content: [
      { type: "paragraph", text: `Add Arrow draws a straight arrow between two points on a PDF page. It renders a line from (x1, y1) to (x2, y2) with a triangular arrowhead at the destination end. The arrowhead is formed by two lines branching from the endpoint at 30-degree angles.` },
    ]},
    { heading: "How to Use Add Arrow", content: [
      { type: "list", items: [
        `Upload your PDF file.`,
        `Specify the page number and the start/end coordinates (x1, y1 to x2, y2). Default coordinates draw a horizontal arrow from (50, 400) to (200, 400).`,
        `Optionally set the line thickness via <strong>Stroke Width</strong> (default is 2pt).`,
        `Click <strong>Add Arrow</strong>. The tool draws the arrow with arrowhead.`,
        `Download the result as <code>arrow-added.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Add Arrow?", content: [
      { type: "paragraph", text: `Arrows are essential for annotations, diagrams, and flowcharts added to existing PDFs. Whether you're marking up a layout, creating a process diagram on a blank page, or pointing out specific elements in a document, arrows provide clear visual direction.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. The arrow is drawn entirely on your device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How do I point to a specific element on the page?", content: [
      { type: "paragraph", text: `PDF coordinates use points (1/72 inch) from the bottom-left corner. For a US Letter page, (306, 396) is the center. Experiment with coordinates — most elements on a standard document fall within the range x: 50–560, y: 100–700.` },
    ]},
  ],
};

/* ════════════════ Final Batch: 7 Missing Live Tools ════════════════ */

const seoMarkdownToPdf: ToolSeo = {
  sections: [
    { heading: "What is Markdown to PDF?", content: [
      { type: "paragraph", text: `Markdown to PDF converts Markdown text files into well-formatted PDF documents. The tool reads your Markdown source, parses formatting elements like headings, bold, italic, code blocks, lists, and links, and renders them into a clean PDF output with proper typography and layout.` },
      { type: "paragraph", text: `The conversion is handled by a Markdown parser compiled to run in the browser. Your source text is transformed into styled HTML first, then rendered into a PDF page. Headers become section headings, code blocks get monospace formatting with background shading, and lists maintain their indentation hierarchy.` },
    ]},
    { heading: "How to Use Markdown to PDF", content: [
      { type: "list", items: [
        `Upload a <code>.md</code> or <code>.txt</code> file containing Markdown text.`,
        `Click <strong>Convert to PDF</strong>. The tool parses your Markdown and renders it into a formatted PDF.`,
        `Download the result as <code>markdown-to-pdf.pdf</code>. Headings, lists, code blocks, and inline formatting are all preserved.`,
      ]},
    ]},
    { heading: "Why Use Markdown to PDF?", content: [
      { type: "paragraph", text: `Markdown is the universal format for technical writing, READMEs, documentation, and notes. Converting to PDF creates a shareable, print-ready version without losing any formatting. This is useful for distributing design specs, meeting notes, or documentation to stakeholders who don’t use Markdown editors. The output preserves code block syntax highlighting and table layouts, making it ideal for technical documents.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, parsing Markdown, and rendering the PDF — happens on your own device using engines compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does it support GitHub Flavored Markdown?", content: [
      { type: "paragraph", text: `The tool supports standard Markdown syntax including headings, emphasis, links, images, code blocks, and lists. Advanced GitHub Flavored Markdown features like task lists or autolinks may have partial support depending on the parser version. For best results, stick to standard Markdown.` },
    ]},
    { heading: "", subHeading: "Can I customize the PDF layout?", content: [
      { type: "paragraph", text: `The tool uses a default layout with sensible margins, font sizes, and spacing optimized for readability. For custom layouts, convert to HTML first and use the HTML to PDF tool, which gives you full control over styling.` },
    ]},
  ],
};

const seoAddCropMarks: ToolSeo = {
  sections: [
    { heading: "What is Add Crop Marks?", content: [
      { type: "paragraph", text: `Add Crop Marks inserts L-shaped registration marks at the corners of every page in a PDF. These marks define where the page should be trimmed after printing on larger paper stock. The tool expands each page's media box by a configurable bleed amount (default 9 points) and draws thin black lines at each corner to indicate the trim boundary.` },
      { type: "paragraph", text: `The implementation uses pdf-lib to load the document, expand the media box on each page, and draw 18-point crop lines at all four corners. The crop marks are drawn in black at 0.25pt thickness, following standard prepress conventions.` },
    ]},
    { heading: "How to Use Add Crop Marks", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Set the <strong>bleed</strong> amount (default: 9 points — roughly 3mm). This is the extra paper beyond the trim edge.`,
        `Click <strong>Add Crop Marks</strong>. The tool expands each page and adds corner marks.`,
        `Download the result as <code>crop-marks.pdf</code>. The file is ready for professional printing with bleed.`,
      ]},
    ]},
    { heading: "Why Use Add Crop Marks?", content: [
      { type: "paragraph", text: `Professional printing requires bleed and crop marks so the printer knows exactly where to trim. Without them, slight misalignment during cutting can leave thin white edges. Crop marks tell the cutting machine precisely where the final page boundary is, ensuring clean edges even if the paper shifts slightly during trimming. This tool converts a standard PDF into print-ready format without needing InDesign or other layout software.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, expanding media boxes, and drawing crop marks — happens on your own device using pdf-lib compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What bleed amount should I use?", content: [
      { type: "paragraph", text: `The standard bleed for professional printing is 3mm (about 9 points). For large-format printing or items with full-bleed backgrounds, use 5–10mm. The default of 9 points works well for most business documents and brochures.` },
    ]},
    { heading: "", subHeading: "Does this add bleed content?", content: [
      { type: "paragraph", text: `No. The tool adds crop marks and expands the page size, but it does not extend the page content into the bleed area. For true bleed, your source PDF should already have content extending beyond the trim edge, or you can use the Add Bleed tool to extend background colors and images.` },
    ]},
  ],
};

const seoVersionDetector: ToolSeo = {
  sections: [
    { heading: "What is Version Detector?", content: [
      { type: "paragraph", text: `Version Detector reads a PDF file and reports its version number, page count, title, and author metadata. It extracts the PDF version from the file header (the <code>%PDF-X.Y</code> marker in the first kilobyte), loads the document structure to count pages, and reads the document info dictionary for metadata fields.` },
      { type: "paragraph", text: `The tool outputs a plain-text report with the version, page count, title, and author. This is useful for checking compatibility with specific PDF readers or workflows that require a minimum version, or for quickly inspecting metadata without opening the file in a PDF viewer.` },
    ]},
    { heading: "How to Use Version Detector", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Click <strong>Detect Version</strong>. The tool reads the header and parses the document structure.`,
        `View the output report showing the PDF version, page count, title, and author.`,
      ]},
    ]},
    { heading: "Why Use Version Detector?", content: [
      { type: "paragraph", text: `Different PDF versions support different features — PDF 1.4 introduced transparency, PDF 1.5 added JPEG2000 compression, and PDF 2.0 includes 3D and rich media. Knowing the version helps determine compatibility with your target audience's reader software. The tool is also handy for auditing documents you receive from clients or third parties to confirm they meet your workflow requirements.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading the header, loading the document, and extracting metadata — happens on your own device using pdf-lib compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What PDF versions exist?", content: [
      { type: "paragraph", text: `Common versions are PDF 1.4 (Acrobat 5, supports transparency), PDF 1.6 (Acrobat 7, supports JBIG2 and OpenType), PDF 1.7 (Acrobat 8–9, widely supported), and PDF 2.0 (ISO 32000-2, the current standard). Most modern readers support PDF 1.4 and above.` },
    ]},
    { heading: "", subHeading: "Does this tool modify the PDF?", content: [
      { type: "paragraph", text: `No. Version Detector is read-only — it inspects the file and reports information without making any changes. The output is a plain-text report, not a modified PDF.` },
    ]},
  ],
};

const seoPdfDiff: ToolSeo = {
  sections: [
      { heading: "What is PDF Diff?", content: [
      { type: "paragraph", text: `PDF Diff compares two PDF files visually by rendering each page onto a canvas and calculating pixel-level differences. The tool highlights changed areas in red, producing a diff image that shows exactly where the two documents diverge. It compares page 1 of each document by default.` },
      { type: "paragraph", text: `The implementation uses pdf.js to render both pages at 2x scale onto canvas elements, then iterates through every pixel to compute the color difference. Pixels that differ by more than a threshold of 30 are marked in red; unchanged pixels are shown at reduced opacity. The result is a single PNG diff image.` },
    ]},
    { heading: "How to Use PDF Diff", content: [
      { type: "list", items: [
        `Upload the first PDF (original) by dropping it onto the upload zone.`,
        `Provide the second PDF (revised) using the <strong>second PDF</strong> option.`,
        `Click <strong>Compare PDFs</strong>. The tool renders both pages and computes the visual diff.`,
        `Download the result as <code>diff.png</code> — a side-by-side visual comparison with differences highlighted in red.`,
      ]},
    ]},
    { heading: "Why Use PDF Diff?", content: [
      { type: "paragraph", text: `When reviewing contract revisions, comparing draft versions, or verifying that edits were applied correctly, a visual diff is faster than reading both documents word by word. PDF Diff shows you exactly which regions changed, making it easy to spot unauthorized modifications, layout shifts, or missing content. Unlike text-based diff tools, it catches formatting and visual changes that don't affect the raw text.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — rendering both PDFs, computing pixel differences, and generating the diff image — happens on your own device. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Can I compare specific pages?", content: [
      { type: "paragraph", text: `The current implementation compares page 1 of each document. For multi-page comparison, you can split each PDF into individual pages, then compare specific page pairs using this tool.` },
    ]},
    { heading: "", subHeading: "What does red mean in the diff?", content: [
      { type: "paragraph", text: `Red pixels indicate areas where the two documents differ visually. The threshold of 30 (on a 0–255 per-channel scale) catches even subtle changes like font rendering differences or slight layout shifts. Unchanged areas appear as faded versions of the original.` },
    ]},
  ],
};

const seoReplaceImage: ToolSeo = {
  sections: [
    { heading: "What is Replace Image?", content: [
      { type: "paragraph", text: `Replace Image swaps a specific image in a PDF with a new one you provide. The tool iterates through every page, identifies the image at the specified index, and replaces its data while preserving the original position, dimensions, and page layout. The new image can be PNG or JPEG format.` },
      { type: "paragraph", text: `The implementation uses pdf.js to scan the document for image objects, then pdf-lib to embed the replacement image and update the page's XObject references. Pages without images are passed through unchanged.` },
    ]},
    { heading: "How to Use Replace Image", content: [
      { type: "list", items: [
        `Upload the PDF containing the image you want to replace.`,
        `Provide the replacement image (PNG or JPEG) using the <strong>New Image</strong> option.`,
        `Set the <strong>image index</strong> (default: 1) to specify which image to replace. Index 1 replaces the first image found in the document.`,
        `Click <strong>Replace Image</strong>. The tool swaps the target image across all pages.`,
        `Download the result as <code>replaced.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Replace Image?", content: [
      { type: "paragraph", text: `Updating a logo, product photo, or embedded screenshot in a PDF without recreating the entire document saves significant time. Instead of exporting from the original design tool, making the change, and re-exporting, you can swap the image directly. This is particularly useful for contracts with embedded diagrams, presentations with outdated screenshots, or brand assets that need refresh across multiple documents.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — scanning for images, embedding the replacement, and writing the output — happens on your own device using pdf-lib and pdf.js compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How do I know the image index?", content: [
      { type: "paragraph", text: `The image index counts images in document order (first page, top-to-bottom, left-to-right). Start with index 1 and increment if you need a later image. The tool replaces the same index on every page — if your PDF has different images per page, process each page separately after splitting.` },
    ]},
    { heading: "", subHeading: "What image formats are supported?", content: [
      { type: "paragraph", text: `PNG and JPEG are supported. The tool first attempts to embed as PNG; if that fails, it tries JPEG. For best results, match the format of the original image — use PNG for graphics with transparency and JPEG for photographs.` },
    ]},
  ],
};

const seoAddPdfProperties: ToolSeo = {
  sections: [
    { heading: "What is Add PDF Properties?", content: [
      { type: "paragraph", text: `Add PDF Properties sets title, author, subject, and keyword metadata on a PDF document. The tool loads the PDF, applies the metadata fields you specify, and returns the updated file. Any fields you leave blank are not modified — only the fields you fill in are changed.` },
      { type: "paragraph", text: `The implementation uses pdf-lib to read the existing document, call the setter methods for each metadata field, and save the result. The visual content, fonts, and structure of the PDF are completely preserved.` },
    ]},
    { heading: "How to Use Add PDF Properties", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Fill in any combination of <strong>Title</strong>, <strong>Author</strong>, <strong>Subject</strong>, and <strong>Keywords</strong> fields. Leave blank to keep existing values.`,
        `Click <strong>Add Properties</strong>. The tool sets the metadata and returns the updated PDF.`,
        `Download the result as <code>properties-added.pdf</code>. Open it in a PDF viewer to verify the properties panel shows your changes.`,
      ]},
    ]},
    { heading: "Why Use Add PDF Properties?", content: [
      { type: "paragraph", text: `PDF metadata is what search engines, document management systems, and operating system file explorers use to identify and organize your files. Adding proper title and author metadata makes documents searchable by name and creator. Keywords help document management systems categorize and retrieve files. For professional submissions, many organizations require specific metadata fields to be filled in before accepting PDF deliverables.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, setting metadata, and writing the PDF — happens on your own device using pdf-lib compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "Does this overwrite existing metadata?", content: [
      { type: "paragraph", text: `Only the fields you fill in are changed. If you leave Title blank but set Author, only the author is updated. Existing values in other fields remain untouched. To clear a field, you would need a separate tool that explicitly removes metadata.` },
    ]},
  ],
};

const seoEditMetadata: ToolSeo = {
  sections: [
    { heading: "What is Edit PDF Metadata?", content: [
      { type: "paragraph", text: `Edit PDF Metadata lets you update the title, author, subject, and keyword fields stored in a PDF document. Unlike Add PDF Properties which only sets new values, Edit PDF Metadata is designed for modifying existing metadata — the workflow assumes you are correcting or updating information that already exists in the document.` },
      { type: "paragraph", text: `The tool uses pdf-lib to load the PDF, apply your changes via setter methods for each field, and save the result. The document content, layout, and visual appearance remain completely unchanged.` },
    ]},
    { heading: "How to Use Edit PDF Metadata", content: [
      { type: "list", items: [
        `Upload a PDF by dropping it onto the upload zone.`,
        `Enter the updated values for <strong>Title</strong>, <strong>Author</strong>, <strong>Subject</strong>, and/or <strong>Keywords</strong>. Only fill in the fields you want to change.`,
        `Click <strong>Edit Metadata</strong>. The tool updates the specified fields and returns the modified PDF.`,
        `Download the result as <code>metadata-edited.pdf</code>.`,
      ]},
    ]},
    { heading: "Why Use Edit PDF Metadata?", content: [
      { type: "paragraph", text: `Correct metadata ensures documents are properly cataloged in document management systems, searchable by the right criteria, and displayed with accurate information in PDF viewers and file explorers. Common use cases include correcting a typo in the document title, updating the author after a team member leaves, adding subject keywords for better searchability, or rebranding documents with new organizational metadata.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, updating metadata, and saving the PDF — happens on your own device using pdf-lib compiled to WebAssembly. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "How is this different from Add PDF Properties?", content: [
      { type: "paragraph", text: `Both tools set the same metadata fields using the same underlying engine. Add PDF Properties is oriented toward setting metadata on new or untagged documents. Edit PDF Metadata is oriented toward modifying existing metadata. In practice, they produce the same result — use whichever name matches your mental model.` },
    ]},
    { heading: "", subHeading: "Can I remove all metadata?", content: [
      { type: "paragraph", text: `No, this tool only sets individual fields. To strip all metadata from a PDF, use the Remove Metadata tool which clears title, author, subject, keywords, creator, and producer fields in one operation.` },
    ]},
  ],
};

const seoImageToPdf: ToolSeo = {
  sections: [
    { heading: "What is Image to PDF?", content: [
      { type: "paragraph", text: `Image to PDF converts any standard image file — JPEG, PNG, and other raster formats — into a PDF document. The tool reads your image, embeds it into a new PDF page sized to match the image dimensions, and outputs a single-page PDF. For JPEG images, the data is embedded directly; for PNG and other formats, the tool re-encodes through a canvas first to ensure pdf-lib compatibility.` },
      { type: "paragraph", text: `The implementation uses pdf-lib to create a new document and embed the image bytes. JPEG files are embedded natively for maximum quality; other formats go through a re-encode step via the browser's canvas API, which converts them to PNG before embedding.` },
    ]},
    { heading: "How to Use Image to PDF", content: [
      { type: "list", items: [
        `Upload an image file (JPEG, PNG, or similar) by dropping it onto the upload zone.`,
        `Click <strong>Convert to PDF</strong>. The tool embeds the image into a new PDF page.`,
        `Download the result as <code>converted.pdf</code>. The page dimensions match your original image.`,
      ]},
    ]},
    { heading: "Why Use Image to PDF?", content: [
      { type: "paragraph", text: `Converting images to PDF creates a consistent, shareable format that opens on any device without needing an image viewer. This is useful for submitting scanned documents, combining screenshots into a printable format, or creating PDF portfolios from photographs. The output preserves the original image quality and dimensions — no resizing or compression is applied.` },
    ]},
    { heading: "Privacy & Security", content: [
      { type: "paragraph", text: `Your files never leave your browser. Every step — reading, encoding, and embedding — happens on your own device using pdf-lib and the browser canvas API. Nothing is uploaded to Racira's servers, no copies are stored in the cloud, and no file data is transmitted at any point.` },
    ]},
    { heading: "Frequently Asked Questions", subHeading: "What image formats are supported?", content: [
      { type: "paragraph", text: `JPEG and PNG are the primary supported formats. JPEG images are embedded directly without re-encoding, preserving original quality. PNG and other formats go through a canvas re-encode step, which may slightly alter color space or transparency handling.` },
    ]},
    { heading: "", subHeading: "Can I combine multiple images into one PDF?", content: [
      { type: "paragraph", text: `This tool processes one image at a time. To combine multiple images, convert each to a PDF individually, then use the Merge tool to combine them into a single multi-page document.` },
    ]},
  ],
};

const explicitSeo: Record<string, ToolSeo> = {
  /* ── Pilot batch v2 ── */
  "merge": mergeSeo,

  /* ── Batch 1 (existing) ── */
  "split": splitSeo,
  "compress": compressSeo,
  "rotate": rotateSeo,

  /* ── Organize PDF batch ── */
  "add-margin": seoAddMargin,
  "add-page-labels": seoAddPageLabels,
  "add-page-numbers": seoAddPageNumbers,
  "bates-numbering": seoBatesNumbering,
  "bookmark-pdf": seoBookmarkPdf,
  "crop-pages": seoCropPages,
  "divide-pages": seoDividePages,
  "edit-attachments": seoEditAttachments,
  "extract-pages": seoExtractPages,
  "headers-footers": seoHeadersFooters,
  "insert-blank-pages": seoInsertBlankPages,
  "keep-nth-page": seoKeepNthPage,
  "organize-pages": seoOrganizePages,
  "pdf-multi-tool": seoPdfMultiTool,
  "posterize": seoPosterize,
  "replace-page": seoReplacePage,
  "rotate-custom": seoRotateCustom,
  "split-every-n": seoSplitEveryN,
  "split-odd-even": seoSplitOddEven,
  "table-of-contents": seoTableOfContents,
  "tint-pages": seoTintPages,

  /* ── Convert from PDF batch ── */
  "pdf-to-text": seoPdfToText,
  "pdf-to-bmp": seoPdfToBmp,
  "pdf-to-cbz": seoPdfToCbz,
  "pdf-to-epub": seoPdfToEpub,
  "pdf-to-html": seoPdfToHtml,
  "pdf-to-image": seoPdfToImage,
  "pdf-to-markdown": seoPdfToMarkdown,
  "pdf-to-odt": seoPdfToOdt,
  "pdf-to-png": seoPdfToPng,
  "pdf-to-powerpoint": seoPdfToPowerpoint,
  "pdf-to-rtf": seoPdfToRtf,
  "pdf-to-tiff": seoPdfToTiff,
  "pdf-to-webp": seoPdfToWebp,
  "pdf-to-word": seoPdfToWord,
  "pdf-to-xml": seoPdfToXml,

  /* ── Convert to PDF batch ── */
  "text-to-pdf": seoTextToPdf,
  "html-to-pdf": seoHtmlToPdf,
  "csv-to-pdf": seoCsvToPdf,
  "rtf-to-pdf": seoRtfToPdf,
  "svg-to-pdf": seoSvgToPdf,

  /* ── Combined small batch ── */
  "unlock": seoUnlock,
  "set-owner-password": seoSetOwnerPassword,
  "validate-signature": seoValidateSignature,
  "timestamp-pdf": seoTimestampPdf,
  "n-up-layout": seoNUpLayout,
  "create-booklet": seoCreateBooklet,
  "duplex-simulator": seoDuplexSimulator,
  "add-text-box": seoAddTextBox,
  "compare-pdfs": seoComparePdfs,

  /* ── Forms & Signatures batch ── */
  "form-field-extract": seoFormFieldExtract,
  "remove-signatures": seoRemoveSignatures,
  "sign-pdf": seoSignPdf,
  "uniform-page-size": seoUniformPageSize,
  "highlight-form-fields": seoHighlightFormFields,

  /* ── Batch 2: Info & Inspection ── */
  "pdf-to-base64": seoPdfToBase64,
  "scan-to-pdf": seoScanToPdf,

  /* ── Batch 4: Edit & Modify ── */
  "background-color": seoBackgroundColor,
  "sanitize-pdf": seoSanitizePdf,
  "flatten-annotations": seoFlattenAnnotations,
  "comic-info": seoComicInfo,
  "bmp-to-pdf": seoBmpToPdf,
  "png-to-pdf": seoPngToPdf,

  /* ── Batch 3: Convert to PDF ── */
  "epub-to-pdf": seoEpubToPdf,
  "protect": seoProtect,
  "flatten": seoFlatten,
  "remove-annotations": seoRemoveAnnotations,
  "heic-to-pdf": seoHeicToPdf,
  "webp-to-pdf": seoWebpToPdf,
  "json-to-pdf": seoJsonToPdf,

  /* ── Batch 2: Optimize & Color ── */
  "metadata-editor": seoMetadataEditor,
  "optimize-fonts": seoOptimizeFonts,
  "remove-metadata": seoRemoveMetadata,
  "text-color": seoTextColor,
  "combine-single-page": seoCombineSinglePage,

  /* ── Batch: Print & Layout ── */
  "print-margin-adjuster": seoPrintMarginAdjuster,

  /* ── Batch: Security ── */
  "add-watermark": seoAddWatermark,

  /* ── Batch: Edit PDF (add-text, add-shapes) ── */
  "add-text": seoAddText,
  "add-shapes": seoAddShapes,

  /* ── Batch: Convert to PDF + Optimize & Color ── */
  "base64-to-pdf": seoBase64ToPdf,
  "xml-to-pdf": seoXmlToPdf,
  "invert-colors": seoInvertColors,
  "grayscale-pdf": seoGrayscalePdf,
  "fix-page-size": seoFixPageSize,

  /* ── Batch: Utilities (insert, overlay, hash, etc.) ── */
  "insert-pdf-at": seoInsertPdfAt,
  "overlay-pdf": seoOverlayPdf,
  "pdf-hash": seoPdfHash,
  "scale-content": seoScaleContent,
  "extract-attachments": seoExtractAttachments,
  "pdf-to-zip": seoPdfToZip,

  /* ── Batch: Forms & Signatures (upload, type, fill, etc.) ── */
  "upload-signature": seoUploadSignature,
  "type-signature": seoTypeSignature,
  "fill-forms": seoFillForms,
  "create-form-fields": seoCreateFormFields,
  "add-initials": seoAddInitials,
  "export-form-data": seoExportFormData,
  "flatten-forms": seoFlattenForms,
  "form-field-renamer": seoFormFieldRenamer,
  "import-form-data": seoImportFormData,

  /* ── Batch: Edit PDF (highlight, callout, etc.) ── */
  "highlight-text": seoHighlightText,
  "add-background": seoAddBackground,
  "add-bleed": seoAddBleed,
  "add-callout": seoAddCallout,
  "add-date-stamp": seoAddDateStamp,
  "add-grid-overlay": seoAddGridOverlay,
  "add-stamps": seoAddStamps,
  "add-timestamp": seoAddTimestamp,
  "permission-editor": seoPermissionEditor,
  "strike-text": seoStrikeText,
  "underline-text": seoUnderlineText,
  "add-arrow": seoAddArrow,

  /* ── Info & Inspection batch ── */
  "extract-hyperlinks": seoExtractHyperlinks,
  "extract-headings": seoExtractHeadings,
  "extract-email-addresses": seoExtractEmailAddresses,
  "extract-phone-numbers": seoExtractPhoneNumbers,
  "extract-tables": seoExtractTables,
  "pdf-size-analyzer": seoPdfSizeAnalyzer,
  "version-checker": seoVersionChecker,
  "attachment-inspector": seoAttachmentInspector,
  "pdf-statistics": seoPdfStatistics,
  "view-metadata": seoViewMetadata,
  "page-dimensions": seoPageDimensions,
  "certificate-inspector": seoCertificateInspector,
  /* ── Final batch: 7 missing live tools ── */
  "markdown-to-pdf": seoMarkdownToPdf,
  "add-crop-marks": seoAddCropMarks,
  "version-detector": seoVersionDetector,
  "pdf-diff": seoPdfDiff,
  "replace-image": seoReplaceImage,
  "add-pdf-properties": seoAddPdfProperties,
  "edit-metadata": seoEditMetadata,
  "image-to-pdf": seoImageToPdf,
};


/** Resolve the SEO content for a tool, falling back to generated prose. */
export function getToolSeo(tool: Tool): ToolSeo {
  return explicitSeo[tool.slug] ?? genericSeo(tool);
}
