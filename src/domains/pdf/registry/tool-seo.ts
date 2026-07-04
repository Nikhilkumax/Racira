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

export interface SeoSection {
  heading: string;
  paragraphs: string[];
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

const explicitSeo: Record<string, ToolSeo> = {
  "merge-pdf": mergeSeo,
  "split-pdf": splitSeo,
  "compress-pdf": compressSeo,
  "rotate-pdf": rotateSeo,
};

/** Resolve the SEO content for a tool, falling back to generated prose. */
export function getToolSeo(tool: Tool): ToolSeo {
  return explicitSeo[tool.slug] ?? genericSeo(tool);
}
