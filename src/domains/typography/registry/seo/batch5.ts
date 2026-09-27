import { PRIVACY_SECURITY_TEXT } from "../privacy";
import type { ToolSeoEntry } from "../tool-seo";

/** Racira Fonts SEO content — batch 5 (conversion, glyphs, text rendering). */
export const typographySeoBatch5: Record<string, ToolSeoEntry> = {
  "font-base64-encoder": {
    keywords: [
      "font base64 encoder",
      "base64 encoding",
      "data URI",
      "inline font CSS",
    ],
    intro:
      "The font base64 encoder reads one local font file and returns a data: URI together with the @font-face rule that consumes it. The panel states the size cost of inlining before the URI reaches a stylesheet.",
    content:
      "The font base64 encoder turns a local font file into a data: URI. You pick the file with the file dialog, the browser reads it through FileReader, and the bytes come back through base64 encoding as data:<mime>;charset=utf-8;base64,... — nothing is uploaded, because the read happens on this machine. The panel reports the effective MIME type, the binary size, the base64 size with its inflation percentage and the final URI length in characters, so the cost of inlining is visible before you paste anything.\n\n- Accepted file types: .woff2, .woff, .ttf, .otf, .eot, plus the generic font/* filter.\n- MIME options: detect from extension, font/woff2, font/woff, font/ttf, font/otf.\n- Extension detection maps woff2, woff, ttf and otf to their font/* types and eot to application/vnd.ms-fontobject; an unrecognised extension falls back to font/woff2.\n- Outputs: a data: URI block, a usage @font-face snippet, and a CSS family name field used as the font-family in that snippet.\n- Guidance panel listing the cases where inlining is worth it, and the case where it is not.\n\nThe size figures come from the encoded string rather than from a re-read of the file: the binary figure is the base64 payload length multiplied by three and divided by four, and the base64 figure is the payload length itself. That is why the reported inflation is the familiar 33.3% — base64 uses four characters for every three bytes, so a 30 KB font arrives as roughly 40 KB of text. The generated declaration pairs that data URI with font-display: swap, and the preview truncates the URI to its first 96 characters so the panel stays readable; the full string is the one printed in the URI block above it.\n\n- One file per run. There is no batch mode, so a family with four faces means four passes.\n- No subsetting and no compression: the tool encodes the file exactly as it is, and every byte you saved by removing glyphs is yours to find elsewhere.\n- The usage snippet is a display convenience. Its src value is cut at 96 characters, so copy the URI from the URI panel when you paste into a real stylesheet.\n- Size numbers are derived from the base64 length, not measured on disk, so they are estimates within a byte or two rather than a checksum.\n- The file filter is advisory. Any file can be selected through the dialog, and nothing validates that the bytes are a font.\n\nInlining replaces a linked file with an inline font CSS block, and it earns its place in three situations: a subset under roughly 15 KB on the critical path, a self-contained SVG or HTML artifact that must not fetch extra files, and a template such as an email signature where external requests get stripped. It is the wrong tool for a full alphabet font, because the base64 block has to be parsed as part of the document and it bypasses the browser's normal font cache — the same face loaded by URL would be fetched once and reused instead. When the intent is self-hosting rather than inlining, the font CSS generator writes the file-based declaration and the character extractor produces the subset range that keeps the file small.",
    howTo: [
      { step: "Set the CSS family name the declaration should use." },
      { step: "Leave MIME type on detect from extension, or choose the type explicitly when the file has no usable extension." },
      { step: "Choose the font file — the panel fills in the effective MIME, both sizes and the URI length." },
      { step: "Copy the data: URI block, or the usage snippet when you want the surrounding @font-face rule too." },
    ],
    whenToUse:
      "Reach for this when a font has to travel inside the document rather than beside it: a single small face on the critical path, a self-contained artifact, or a template that strips external requests. When the font is served from a directory instead, the {{font-css-generator|font CSS generator}} writes the file-based @font-face set and the preload hint, and the {{font-face-declaration-builder|@font-face declaration builder}} covers the single-declaration case with metric overrides. Keep the payload small first: the {{font-character-extractor|font character extractor}} produces the unicode-range list a subsetter needs, which is also what a split {{font-face-generator|@font-face generator}} setup uses to load only the ranges a page needs.",
    faqs: [
      {
        q: "Does the font file leave my device?",
        a: "No. The file is read with the browser's FileReader API and encoded in this tab; there is no upload step and no server round-trip, so the URI is produced entirely locally.",
      },
      {
        q: "Why does the data URI come out about a third larger than the font?",
        a: "Base64 encodes every three bytes as four characters, which is a 33.3% increase. The panel prints both figures so the added weight is visible before the URI is committed to a stylesheet.",
      },
      {
        q: "Is the reported binary size exact?",
        a: "It is an estimate derived from the base64 payload length rather than a second read of the file. Expect it to match the file size within a byte or two, not to act as a checksum.",
      },
      {
        q: "Why is the URI in the usage snippet shorter than the one in the URI panel?",
        a: "The snippet truncates the URI at 96 characters so the preview stays readable. The URI panel holds the complete string, and that is the copy to paste into production CSS.",
      },
      {
        q: "Should I inline a full family this way?",
        a: "No. A full alphabet inflates the document, delays parsing and defeats the browser font cache. Inline a small subset at most, and serve the rest as files.",
      },
    ],
  },

  "font-css-generator": {
    keywords: [
      "font css generator",
      "@font-face block",
      "self-hosted family",
      "font preload link",
    ],
    intro:
      "The font CSS generator turns a self-hosted family's file list into a complete set of @font-face rules plus a preload hint for the weight used above the fold. Each weight and italic is declared as its own face.",
    content:
      "The font CSS generator builds the whole @font-face block for a self-hosted family from a short table of faces. You set the CSS family name, the directory slug the files live under, the file format, the font-display value and the weight to preload, then describe each face as a weight, a style and a file suffix. The output is one declaration per face in the order you listed them, followed by a font preload link for the chosen weight. The readout counts the declarations, the distinct files referenced and the directory the URLs are built from.\n\n- Formats: woff2, woff and ttf, applied to every face in the table at once.\n- font-display values: swap, block, fallback and optional, each labelled with its behaviour during load.\n- Preload weight options: 300, 400, 500, 600 and 700.\n- Face weights run the full 100 to 900 range, with normal or italic styling per face and a free-text file suffix.\n- The table opens with five faces — 300 normal, 400 normal, 400 italic, 500 normal and 700 normal — and Add face appends a 600 normal entry you can edit.\n\nEvery declaration is assembled from the same three inputs, so the URLs follow one predictable shape: /fonts/<slug>/<slug>-<face-suffix>.<format>. The format value is written twice, once inside url() and once as the format() hint, which is what lets the browser skip a file it cannot decode before downloading it. The preload tag is generated separately: it looks up the first normal-style face whose weight matches the preload selection and emits a link with as=\"font\", the matching type attribute and crossorigin, which is required because font fetches are always CORS-mode even on the same origin. Italic faces are declared with font-style: italic rather than a separate family, so an italic run inside a paragraph switches to the italic file without any extra CSS.\n\n- One format for the whole set. A mixed deployment — woff2 with a woff fallback — has to be generated as two passes and merged by hand.\n- URLs are composed from the naming convention. If your build emits different filenames, the suffixes in the table must be edited to match exactly.\n- No unicode-range descriptor, so a family split into subsets across several files cannot be expressed here.\n- The preload tag covers one weight and always the normal style; italic and additional weights are not preloaded.\n- Directory slug, format and font-display are global, and nothing verifies that the referenced files exist at those paths.\n\nUse it when a family is genuinely self-hosted and the deployment naming is predictable — the common case for a design system that ships woff2 files from a single folder and wants one declaration per face with an honest font-display value. Pair it with a preload for the single weight that renders above the fold, and leave the rest to load on demand. When one declaration with metric overrides is the real requirement, the @font-face declaration builder covers that case; when the family comes from Google's CDN rather than your own directory, the Google Fonts CSS generator is the right source of markup.",
    howTo: [
      { step: "Enter the CSS font-family value and the directory slug the font files are served from." },
      { step: "Choose the file format and the font-display behaviour, then set the weight to preload." },
      { step: "Describe each face in the table — weight, normal or italic, and the file suffix — adding rows for any weight the family ships." },
      { step: "Copy the @font-face rules and the preload link into the document head." },
    ],
    whenToUse:
      "This is the page for a family you host yourself and want declared face by face. For the single-declaration case with size-adjust and ascent overrides, the {{font-face-declaration-builder|@font-face declaration builder}} is the tighter fit, and the {{font-base64-encoder|font base64 encoder}} is the alternative when the font has to travel inside the document instead of beside it. When the family comes from a hosted collection, the {{google-fonts-css-generator|Google Fonts CSS generator}} writes the request markup, and the {{font-loading-strategy-builder|font loading strategy builder}} is where preload, font-display and fallback decisions get planned as a whole.",
    faqs: [
      {
        q: "Why does every face get its own @font-face rule?",
        a: "A weight or an italic is a separate file, and each file needs its own declaration. One family name with several descriptors is what lets a font-weight value and an italic run select the right file without extra CSS.",
      },
      {
        q: "What does the preload tag actually change?",
        a: "It starts the font download earlier than the CSS would, which shortens the swap for the weight that renders above the fold. It covers one weight and the normal style, so preloading more than that is a manual edit.",
      },
      {
        q: "Can I generate a woff2 rule with a woff fallback?",
        a: "Not in one pass. The format applies to the whole set, so produce the woff2 set, then generate the woff set and merge the two declarations for a family that needs a legacy path.",
      },
      {
        q: "Where do the file URLs come from?",
        a: "They are composed from the directory slug and each face's file suffix as /fonts/<slug>/<slug>-<suffix>.<format>. If your build names files differently, edit the suffixes to match.",
      },
      {
        q: "Which font-display value should I pick?",
        a: "swap keeps text visible immediately and swaps when the font arrives; optional may skip the webfont entirely on a slow connection, and block and fallback trade a period of invisible or fallback text for a shorter swap. The consequences are labelled on each option.",
      },
    ],
  },

  "font-face-declaration-builder": {
    keywords: [
      "@font-face declaration builder",
      "metric overrides",
      "size-adjust",
      "font-display",
    ],
    intro:
      "The @font-face declaration builder writes a single declaration with the descriptors that decide production behaviour — font-display, optional unicode-range, and the size-adjust, ascent-override and descent-override trio that metrics-matches a fallback so the swap does not shift layout.",
    content:
      "The @font-face declaration builder assembles one declaration from a family name, a src URL, a format, a weight value, a font-display choice and an optional unicode-range, then adds the three metric overrides that control how much space the face occupies. The readout translates those overrides into numbers instead of leaving them abstract: the overridden em box, what a line-height of 1.0 renders as before size-adjust, and the same value after size-adjust is applied. A second output writes the matching fallback declaration, which reuses the same overrides on a local font.\n\n- Formats offered: woff2, woff, truetype and opentype, written into the format() hint.\n- font-display values: auto, block, swap, fallback and optional.\n- font-weight accepts a single value or a range, so 400 and \"400 700\" both work — the range form is what a variable file needs.\n- Metric override ranges: size-adjust and ascent-override from 50% to 200%, descent-override from 0% to 100%, each clamped in code before it reaches the CSS.\n- The fallback declaration resolves through local(\"Arial\"), local(\"Helvetica\") and local(\"Liberation Sans\").\n- Reference metrics for common fallbacks are printed in the panel: Arial at 90.5 ascent and 21.2 descent, Georgia at 91.7 and 21.9, Segoe UI at 107.9 and 26.8.\n\nThe arithmetic is the point of the readout. The natural box is ascent plus descent as a percentage of the em, so 100 and 25 describe a 125% box; size-adjust scales the glyphs, and the adjusted figure multiplies the two together. Setting a webfont's box to match the fallback it replaces is what stops the layout from jumping when the file arrives — the fallback is temporarily rendered with the webfont's own metrics, so line heights computed during the swap are the values the final render keeps. The overrides work on any face, including a font that is not being swapped, and they are the supported alternative to rewriting every line-height in a stylesheet.\n\n- The metrics are yours to supply. The tool does not read them out of a font binary, so the numbers come from the reference list, from documentation, or from another tool that inspects the file.\n- The src URL and weight value are free text. Nothing checks that the file exists or that the weight matches the file's real axis.\n- unicode-range is passed through verbatim. A malformed series is written into the CSS exactly as typed.\n- One declaration per run, and the fallback uses a fixed three-family local() stack rather than a platform-specific one.\n- The em box figures model the overrides, not the rendered text, so they describe spacing behaviour rather than appearance.\n\nReach for it when a self-hosted face has to slot into an existing layout without a visible reflow: a brand font replacing a system face in body copy, a heading face with unusual vertical metrics, or a subset loaded through a unicode-range window. Copy the fallback declaration alongside the main one — the pair is what makes the swap invisible, and shipping only the first half is the usual mistake. Where a whole family needs declaring, the font CSS generator writes the full set of rules; where the concern is the loading sequence rather than the metrics, the font loading strategy builder plans preload, display and fallback together.",
    howTo: [
      { step: "Set the font-family name, the src URL and the format the file is served in." },
      { step: "Enter the font-weight value — a single number, or a range such as 400 700 for a variable file." },
      { step: "Pick a font-display behaviour and, if the face is a subset, paste its unicode-range." },
      { step: "Move the size-adjust, ascent-override and descent-override sliders until the adjusted em box matches the fallback, then copy both declarations." },
    ],
    whenToUse:
      "Use this when one face has to land in an existing layout without a reflow, or when a subset should load only for the ranges it covers. It pairs with the {{font-css-generator|font CSS generator}}, which declares a whole family face by face, and with the {{font-base64-encoder|font base64 encoder}} when the file is inlined rather than served. If the loading order itself is the problem, the {{font-loading-strategy-builder|font loading strategy builder}} plans preload and display across the page, and the {{font-character-extractor|font character extractor}} produces the unicode-range list a subset needs in the first place.",
    faqs: [
      {
        q: "What do the three overrides actually do?",
        a: "size-adjust scales the glyphs, and ascent-override plus descent-override redefine the vertical box the line box is measured against. Applied together they make a webfont occupy the same space as the fallback it replaces, which removes the layout shift at swap time.",
      },
      {
        q: "Where do I get the real metric values?",
        a: "The tool does not read them from the font file, so use the reference values in the panel — Arial, Georgia and Segoe UI are listed — or take them from the font's documentation or an inspector that reads its tables.",
      },
      {
        q: "Should I ship the fallback declaration too?",
        a: "Yes. The fallback is the half that stops the shift: it renders the temporary text with the webfont's metrics. Shipping the main declaration alone leaves the layout moving when the file arrives.",
      },
      {
        q: "Can font-weight be a range here?",
        a: "It can. The field accepts a single value or a range such as 400 700, and the range form is the correct descriptor for a variable file that spans those weights.",
      },
      {
        q: "Is the unicode-range checked?",
        a: "No. The value is written into the descriptor exactly as typed, so a mistyped series reaches the stylesheet unchanged. The range notation produced by the font character extractor is the safe source for it.",
      },
    ],
  },

  "special-character-picker": {
    keywords: [
      "special character picker",
      "html entity",
      "numeric reference",
      "typographic punctuation",
    ],
    intro:
      "The special character picker collects the characters a typist needs but cannot type: dashes, real quotes, primes, legal marks, units and arrows. Every entry carries a named html entity and a numeric reference, so it can be dropped into HTML, Markdown or plain text without guessing.",
    content:
      "The special character picker gathers the characters that a keyboard cannot produce and that copy-paste usually mangles, organised into four groups with their names and both entity forms.\n\nThe four groups, and the characters that cause the most trouble:\n\n- Typographic punctuation: the em dash and en dash, the ellipsis, the bullet, the middle dot, the section and paragraph signs, and the dagger pair.\n- Quotes and primes: curly single and double quotes, the prime and double prime used for feet and inches, and the guillemets for French and Italian setting.\n- Legal, math and units: copyright, registered and trademark marks, degrees, plus-minus, multiplication and division signs, the micro and ohm signs, and the euro.\n- Arrows and marks: the four cardinal arrows, the left-right arrow, a check mark, a star and a heart.\n\nEach row gives the character, its name, its named entity and its numeric reference, and two ways to take it away. The add button appends it to a build-a-string field that can be copied as a whole line, which is how a run of dashes and quotes is assembled for a caption or a legal line; the copy button puts that single character on the clipboard. Filtering works across the character, the name and the entity, so typing dash or arrow narrows the table without leaving the group.\n\nThe entity forms are shown side by side because they are not interchangeable in practice. A named entity is readable in source and says what it means, which is why it suits templates and documentation; a numeric reference is universal and needs no name to be defined, which is why it survives in contexts where the page's character encoding has been through too many hands. Both decode to the same character, and the group label makes the distinction obvious while the row is open rather than after something has rendered as mojibake.\n\nFour things the catalogue deliberately does not decide for you, and each one turns up in review.\n\n- It cannot tell whether the chosen font contains a character, so a correct section sign can still fall back to another face and render at a different weight.\n- It cannot arbitrate style: an en dash for a numeric range and an em dash for a break is a house rule rather than a fact, and both characters sit in the same group.\n- Every row offers an html entity and a numeric reference but no guidance for a plain text file, where neither is decoded and the character itself has to be pasted.\n- Choosing between the two entity forms is a decision about the destination rather than about the character, since both decode to the same value.\n- The catalogue is finite, so anything exotic belongs in a block explorer, which is where the search by code point lives.\n\nUse it as the everyday shelf rather than the whole repertoire: most of what a page needs is a dash, a quote or a symbol, and those are the characters the four groups cover.",
    howTo: [
      { step: "Choose the group that matches the job and filter by the character's name, so the table stops showing the groups you do not need." },
      { step: "Use add to build a string when several marks belong together, or copy for a single character pasted into a document." },
      { step: "Pick the entity form from the row: the named form for readable source, the numeric form wherever encoding is uncertain." },
      { step: "Check the pasted result in the destination, since a correct character can still render from a fallback face at a different weight." },
    ],
    whenToUse:
      "Reach for it when a page has straight quotes that should be curly, when a caption needs a real en dash rather than a hyphen, or when someone has to be handed the entity for a character instead of being told its name. The two entity forms are the practical part. For symbols beyond the catalogue the {{dingbat-and-symbol-explorer|dingbat and symbol explorer}} walks whole blocks, the {{character-code-converter|character code converter}} lists every encoding of a character at once, and the {{unicode-character-explorer|Unicode character explorer}} identifies a character whose name is unknown.",
    faqs: [
      {
        q: "What is the difference between the named and numeric entity?",
        a: "Both decode to the same character; the named form is human-readable in source and the numeric form is universal. Named entities suit templates and code that is read by people, while numeric references are safer where a document may be re-encoded or processed by a system that does not know the name.",
      },
      {
        q: "Why does an apostrophe sometimes look wrong after pasting?",
        a: "Because a straight apostrophe and a typographic one are different characters, and a font may draw them at different weights or widths. The picker supplies the typographic form; if it renders at an odd weight, the family in use does not contain it and the browser has substituted a fallback for that character alone.",
      },
      {
        q: "What are primes used for?",
        a: "Feet and inches, minutes and seconds, and coordinates. They are separate characters from quotes and are drawn as slanted marks rather than curls, which is why substituting a right quote for a prime is a common typesetting error that a careful reader will notice in measurements.",
      },
      {
        q: "Should a range use an en dash or a hyphen?",
        a: "An en dash is the usual choice for a numeric range such as pages 10 to 20, with a hyphen reserved for compound words. That is a style convention rather than a property of the characters, so both sit in the same group and a house style guide is what decides.",
      },
      {
        q: "Can I add my own characters to the list?",
        a: "Not to the catalogue, which is a curated set. The build-a-string field accepts anything typed or pasted into it, and the block explorers cover the rest of the symbol repertoire by code point, which is the route for a character that is not in the four groups.",
      },
    ],
  },

  "dingbat-and-symbol-explorer": {
    keywords: [
      "dingbat and symbol explorer",
      "symbol blocks",
      "code point",
      "paged grid",
    ],
    intro:
      "The dingbat and symbol explorer walks Unicode's symbol blocks in a paged grid, showing each code point with its hexadecimal value and a copy button. Blocks are the reliable unit here: unlike emoji, dingbats and marks are single code points with stable shapes.",
    content:
      "The dingbat and symbol explorer pages through the symbol blocks of Unicode, ninety-six characters at a time, with the block's range and purpose stated beside the grid. It is the tool for the case where a symbol has been seen in a design and has to be identified and reused.\n\nEight blocks are indexed, each chosen because it turns up in real work.\n\n- Arrows and mathematical operators, for flows, notation and set symbols.\n- Geometric shapes and miscellaneous symbols, which are the shape vocabulary of diagrams plus weather, chess and card marks.\n- Dingbats, holding check marks, crosses, stars, scissors and envelopes.\n- Miscellaneous symbols and arrows, the extra stars and arrows that icon work tends to reach for.\n- Box drawing and braille patterns, the latter doubling as a block-shading trick in terminal work.\n\nEach cell carries the character, its code point in the U+ format and a copy button, and the grid pages rather than scrolls so a block of several hundred characters stays readable. Filtering by code is the fastest way to confirm a specific character: type part of a U+ value and the grid narrows to the matches, resetting to the first page. The block selector shows each block's size, which is useful context — the arrows block and the dingbats block are the same order of magnitude, while braille offers exactly two hundred and fifty-six patterns and nothing else.\n\nThe caveats table is the part worth reading before a symbol ships. A glyph may render as a box when the current font lacks the code point, in which case the browser either falls back or draws the notdef glyph. Some marks in the miscellaneous symbols and dingbats ranges have emoji variants, selected by a variation selector, and are drawn in colour on platforms that prefer the emoji presentation. Width varies: symbols taken from East Asian fonts are often full-width, which breaks alignment in a monospaced context. And the copy target matters, since pasting into plain text carries the character while an HTML document may be better served by the numeric reference; both forms are safe, and only one of them survives an encoding mishap.\n\nFour limits are structural rather than incidental.\n\n- The index is a curated set of symbol blocks rather than the whole plane, so a specialised block has to be reached through a general Unicode reference.\n- The paged grid shows what a code point is, not whether a particular font contains it, so coverage stays a separate question.\n- Paging is fixed at ninety-six characters per page, which keeps a large block readable at the cost of a few clicks when the target sits near the end of a range.\n- The filter matches on the code point alone, since a symbol has no reliable name to search by until it has been identified.\n\nRead the grid as the identification tool and the caveats table as the shipping checklist: between them, most of the surprises a borrowed symbol produces have already been named.",
    howTo: [
      { step: "Choose the block closest to the kind of symbol you need, then read its note to confirm the range covers the character." },
      { step: "Filter by a partial code point when you know roughly where the symbol lives, and use the paging controls to walk a large block." },
      { step: "Copy the character from the grid, then check the caveats table for the width and presentation traps that apply to that range." },
      { step: "Confirm in the destination page that the symbol renders from the intended font rather than a colour emoji or a fallback box." },
    ],
    whenToUse:
      "Reach for it when a symbol in a mock-up has to be identified and handed over, when an icon candidate is being chosen from the text repertoire rather than from an icon set, or when a mark renders as a box or a colour emoji and the reason has to be found. The caveats table is the diagnostic. For arbitrary characters outside the symbol blocks the {{unicode-character-explorer|Unicode character explorer}} inspects anything pasted, the {{unicode-block-explorer|Unicode block explorer}} shows which plane a block sits in, and the {{special-character-picker|special character picker}} covers the punctuation typists reach for daily.",
    faqs: [
      {
        q: "Why is a symbol showing as a box?",
        a: "Because the font in use does not contain that code point, so the browser either substitutes a fallback face or draws the missing-glyph box when no fallback has it either. The character is correct; the coverage is the problem, and the fix is a font that carries the block or a numeric reference with a fallback declared.",
      },
      {
        q: "Why did a black-and-white symbol turn into colour?",
        a: "Because several ranges, notably miscellaneous symbols and dingbats, have emoji variants. A variation selector can force the text presentation, and some platforms choose the emoji form by default. The caveats table names the range so the behaviour can be anticipated rather than discovered in production.",
      },
      {
        q: "What is braille doing in a symbol explorer?",
        a: "Its patterns are used as a block-shading hack in terminal interfaces, where a two-by-four grid of dots produces smoother bars than the shade blocks allow. That is why the block is listed with its exact size rather than as a note about accessibility.",
      },
      {
        q: "Why does a copied symbol shift the layout?",
        a: "Because symbol widths differ and East Asian fonts often render them full-width. In a monospaced context, or inside a table column of fixed width, a full-width symbol changes the alignment of everything beside it. Checking the width in the destination is the only reliable test.",
      },
      {
        q: "Is it safe to use these characters instead of an icon font?",
        a: "For simple marks it is often better: the character needs no extra file and inherits the text colour and size. The trade is coverage across fonts and platforms, so the safe approach is a handful of very common marks, with anything decorative drawn as an icon rather than borrowed from Unicode.",
      },
    ],
  },

  "glyph-comparison-tool": {
    keywords: [
      "glyph comparison tool",
      "comparison presets",
      "old-style figures",
      "x-height",
    ],
    intro:
      "The glyph comparison tool renders the same characters in several families at once, so a pairing decision is made on evidence rather than on specimens seen separately. Five comparison presets cover the characters that usually decide the question.",
    content:
      "The glyph comparison tool sets one string of characters in as many faces as you select, at a common size and weight, so the differences are visible side by side rather than remembered from separate previews.\n\nThe five comparison presets are chosen for what they expose.\n\n- Alphabet, which shows proportions and the general texture of a face in two lines.\n- Numerals, which reveals whether the figures are lining or old-style and whether the family carries more than one figure set.\n- Ambiguous, a string of easily confused character pairs — capital O and zero, capital I, lower-case l and the digit one, S and five, Z and two, B and eight, G and six, plus r followed by n — which is where a face's legibility under strain is decided.\n- Punctuation, which shows the quotes, dashes, ellipsis and symbols a face draws and how it draws them.\n- Lower-case shapes, a short set of the letters whose forms vary most between grotesque, humanist and geometric traditions.\n\nThe settings are deliberately narrow so the comparison is fair. Size runs from 12 to 160 pixels and weight from 300 to 700, and both apply to every selected family at once, which means the comparison is like for like rather than each face at its own best setting. The layout switches between stacked rows and two-column groups, and the family chips add or remove faces from the set, so the same characters can be compared across a longlist and then a shortlist.\n\nThe table beside the comparison is the reading guide, and it names the five things worth looking at. The x-height decides how large a face appears at a given nominal size, so two candidates with different x-heights should be compared by adjusting the size until they look equal rather than by trusting the number. The single or double-storey form of g and a changes the texture of body copy and how neutral the face reads. The numeral style decides whether figures sit inside the text flow or align with capitals, with tabular lining figures the requirement wherever numbers are compared in columns. Terminal cuts carry the voice: horizontal terminals read technical and angled ones humanist. And the contrast axis decides the size at which a face stops being comfortable, since a high-contrast design needs a larger setting than a low-contrast one.\n\nWhat the tool does not do is measure, and three further limits follow from comparing by rendering.\n\n- Every entry in the guidance table is a judgement made by eye, so a decision about widths, coverage or metrics belongs with the measuring tools.\n- The catalogue is the source of faces, so a licensed family has to be judged from its own specimen rather than here.\n- Weight is uniform across families, which means a face without the requested weight is drawn with a synthesised version that will not match its real forms.\n- There is no overlay or superposition mode, so old-style figures, x-heights and terminal cuts are compared across rows rather than stacked on top of one another.\n\nThat last limitation is deliberate: reading the same string in two faces shows the difference a page will present, while stacking outlines shows a difference only a designer would see.",
    howTo: [
      { step: "Pick the preset that matches the question, since the ambiguous string and the numerals string answer different concerns." },
      { step: "Select the faces to compare and keep the longlist long enough to see the range before narrowing it." },
      { step: "Set a size and weight that apply to every face, then adjust the size so faces with different x-heights appear equal before judging anything else." },
      { step: "Read the comparison against the guidance table, then take the two finalists into a measuring or pairing tool for the decisions a preview cannot settle." },
    ],
    whenToUse:
      "Reach for it when a shortlist of faces has to be narrowed on the characters that actually differ, when a face that looked right in a specimen fails in a layout and the reason has to be found, or when two families are being considered for one page and their numerals or lower-case forms need to be seen together. The preset strings are the useful part. For a whole page of faces at once the {{multi-font-comparison|multi-font comparison}} sets running text in parallel, the {{font-pairing-suggester|font pairing suggester}} proposes combinations, and the {{glyph-browser|glyph browser}} reports the advance widths the comparison cannot measure.",
    faqs: [
      {
        q: "Why compare at the same size when faces differ in apparent size?",
        a: "Because the first pass should be fair. Once the faces are side by side, adjusting the size so the x-heights match is what shows the real difference in proportions. Comparing a face at its ideal size against another at a poor one is how a good candidate gets eliminated for the wrong reason.",
      },
      {
        q: "What does the ambiguous string test?",
        a: "It tests legibility under the conditions that actually cause misreadings: a capital O against a zero, a lower-case l against a digit one, S against five, and so on. A face that survives that string at a small size is much less likely to produce a confusing identifier, password or model number.",
      },
      {
        q: "How do I tell lining figures from old-style ones?",
        a: "By height and alignment. Lining figures are all the same height and sit on the baseline, so they align with capitals; old-style figures have ascenders and descenders and sit within the text flow, which reads more comfortably in prose but breaks the alignment of a column of numbers.",
      },
      {
        q: "Does the tool measure the faces it shows?",
        a: "No, it renders them. Everything in the guidance table is judged by eye, and the numbers that a design decision may depend on — advance widths, coverage, pair adjustments — come from the measuring tools. That division is deliberate: measurements without a rendering are hard to interpret, and renderings without measurements hide the facts.",
      },
      {
        q: "Why is there no overlay mode?",
        a: "Because the useful comparisons here are between characters as they read, not between outlines. Overlaying two faces shows structural differences, which matters when designing a companion, while reading the same string in two faces shows the difference a page will actually present.",
      },
    ],
  },

  "unicode-block-explorer": {
    keywords: [
      "unicode block explorer",
      "plane",
      "utf-16",
      "code points",
    ],
    intro:
      "The Unicode block explorer is a searchable index of the blocks most often met in typography work, with each block's range, plane and size. The plane column is the one that explains string-length surprises, because planes beyond the first cost two UTF-16 units per character.",
    content:
      "The Unicode block explorer indexes a representative set of Unicode blocks with their ranges, planes and sizes, filterable by name, by note and by plane. It answers the structural question that a character lookup raises: where does this block sit, and what does that imply for storage and string handling.\n\nThe plane filter is the part that carries the most information.\n\n- Plane zero, the basic multilingual plane, holds the Latin, Greek, Cyrillic, Hebrew, Arabic, Devanagari, CJK and symbol blocks that cover almost all western and Japanese text, and every character in it costs one UTF-16 unit.\n- Plane one is the supplementary multilingual plane, where the emoji blocks and a few historic scripts live; characters here are outside the basic plane and cost two units each.\n- Plane two is the supplementary ideographic plane, holding the rare Han extensions that a specialist font may include and a general one will not.\n- The all-planes view reports the total across the indexed blocks, which is the figure to quote when the scope of the index is being described rather than a specific range.\n\nThe table gives each block its range in hexadecimal, its plane number, its size in code points, its UTF-16 cost and a note naming the characters or scripts it holds. Two of the rows exist to make points rather than to be looked up. The private use area is listed with the note that its code points carry no assigned meaning, which is where icon fonts put their glyphs and why a private use character is meaningless outside the font it was designed for. The Hangul syllables block is listed with its exact size, eleven thousand one hundred and seventy-two code points, as an illustration of how a precomposed script can occupy a large contiguous range.\n\nThe framing note states the scale the index sits within, which is useful context for a curated list: Unicode assigns its characters across several hundred blocks, and this index covers the blocks encountered in web and editorial typography. Searching works on the block name and on the note, which is how a character is traced back to its block when only its purpose is known — typing emoji, math or CJK narrows the index to the relevant rows immediately.\n\nFour limits apply, and each one is a boundary the index respects deliberately.\n\n- The index is a slice rather than the whole standard, so a specialist script may simply not be listed.\n- The size column counts code points in the block's range, including unassigned slots, so it is not a count of characters a font would have to draw.\n- The totals readout covers the indexed blocks rather than the standard, so a figure taken from it describes this list and not Unicode as a whole.\n- There is no per-character drill-down, because reading characters is a different job from reading the map.\n\nThe character explorer and the block explorer are complementary rather than overlapping: one identifies a single code point, the other explains the neighbourhood it lives in.",
    howTo: [
      { step: "Filter by the plane you care about first, since the UTF-16 cost and the character repertoire both change above the basic multilingual plane." },
      { step: "Search by name or by the kind of character you need, then read the note column to confirm the block holds what you expect." },
      { step: "Read the UTF-16 cost column before writing string-handling code, because it decides whether character counts and code-unit counts agree." },
      { step: "Take the range from the table and use the character explorer when a specific code point inside the block has to be identified." },
    ],
    whenToUse:
      "Reach for it when string lengths behave unexpectedly because the text contains emoji or rare ideographs, when a face's script coverage is being scoped, or when a private use character from an icon font has to be understood as something that only works with its own font. The plane and UTF-16 columns are the diagnostic. For a single character the {{unicode-character-explorer|Unicode character explorer}} identifies it, the {{emoji-unicode-mapper|emoji Unicode mapper}} explains multi-code-point sequences, and the {{dingbat-and-symbol-explorer|dingbat and symbol explorer}} walks the symbol blocks character by character.",
    faqs: [
      {
        q: "What is a plane?",
        a: "A plane is a group of sixty-five thousand five hundred and thirty-six code points. The first, the basic multilingual plane, covers scripts and symbols used almost everywhere; planes beyond it hold emoji, historic scripts and rare ideographs. The plane a character sits in decides how many code units it costs.",
      },
      {
        q: "Why does an emoji make a string longer in JavaScript?",
        a: "Because JavaScript counts UTF-16 code units, and characters outside the basic plane need two of them. A string of ten emoji therefore reports a length of twenty. Iterating by code point instead of by index gives the count a person would make, which is what the character converter demonstrates.",
      },
      {
        q: "What is the private use area for?",
        a: "Nothing by itself, which is exactly its purpose. Its code points have no assigned meaning, so a font can map glyphs to them without colliding with real characters. Icon fonts use it, and the consequence is that those characters render as boxes unless the icon font is loaded.",
      },
      {
        q: "Why is the whole Unicode standard not listed?",
        a: "Because the index is curated for typography and web work rather than exhaustive. It covers the blocks that turn up in real projects, and a specialist script that is missing can be found in the Unicode standard itself, where every block has an official range and name.",
      },
      {
        q: "Does a large block mean a font has to include all of it?",
        a: "No. Blocks are ranges, and a font may cover a subset — a few hundred Han characters rather than the whole ideographic block, for instance. Coverage is a property of a file, not of a block, which is why the size column describes the range rather than any particular font.",
      },
    ],
  },

  "emoji-unicode-mapper": {
    keywords: [
      "emoji unicode mapper",
      "code points",
      "zwj sequence",
      "variation selector",
    ],
    intro:
      "The emoji Unicode mapper decodes what an emoji actually is in memory: its code points, its UTF-16 units, which is what a JavaScript length counts, and its UTF-8 bytes. It separates the three cases that behave differently in code.",
    content:
      "The emoji Unicode mapper takes an emoji and reports the sequence it is built from, which matters because the characters that look like single glyphs are often several code points long.\n\nThree cases cover almost every emoji, and they behave very differently in code.\n\n- A single code point, such as the party popper, which is one scalar value and one grapheme.\n- A base character with a variation selector, where U+FE0F forces the emoji presentation rather than the text one; the red heart and the warning sign are the common examples.\n- A zero-width joiner sequence, where several code points are joined by U+200D and render as one glyph, which is how the rainbow flag and the technologist emoji are built.\n\nTwo further variants are handled by the same model: a regional indicator pair, where two letters combine into a national flag, and a keycap, where a digit is followed by a variation selector and an enclosing mark. The readouts per emoji are the code point list in the U+ format, the count of code points, the UTF-16 unit count that JavaScript's length reports, the UTF-8 byte count that the network carries, the number of zero-width joiner joins and the number of variation selectors present, with a note explaining what each number implies. Copy buttons then take the emoji itself, its JavaScript escapes or its HTML entities, which is the escape route for storing an emoji safely in source.\n\nThe bulk mapper does the same work for a pasted list, and it uses grapheme segmentation to decide where one emoji ends and the next begins, which is the same unit a text cursor moves through. That matters because splitting a joined sequence on code points destroys it: half a rainbow flag is two code points that render as separate letters. The known-emojis table names fifteen common characters, including the joined sequences and the keycap, which is enough to make the segmentation output readable at a glance.\n\nFour limits are worth knowing, and they are the reason the numbers are shown rather than summarised.\n\n- Segmentation depends on the Unicode data the engine was built with, so an older browser can split a newer sequence, including a zwj sequence that a current engine reads as one grapheme.\n- The name list is small, so anything outside it is shown with a dash rather than a name.\n- Nothing here tests rendering, and a joined sequence can fall back to its components on a platform whose emoji font does not carry it, which turns one glyph into three.\n- The escape buttons concatenate code points without separators, which is right for source code and wrong for a case where each unit has to be read individually.\n\nThe code point count is not the number a reader perceives — a single flag can be two code points, four UTF-16 units and eight UTF-8 bytes, and separating those three figures is the whole purpose of the tool, as well as the reason a length limit written for characters rejects a perfectly valid emoji.",
    howTo: [
      { step: "Paste the emoji into the input, or pick one from the common set, and read the code point list before anything else." },
      { step: "Check the joiner and variation selector counts, since they explain why an emoji that looks like one glyph is several code points." },
      { step: "Compare the UTF-16 and UTF-8 counts against the number of code points to see which measure the code in front of you is using." },
      { step: "Copy the escape form the destination needs, and use the bulk mapper to segment a list rather than splitting it by character index." },
    ],
    whenToUse:
      "Reach for it when a validation rule rejects an emoji as too long, when a truncation function cuts one in half, or when an emoji has to be stored or compared in code and its sequence length has to be known rather than guessed. The three structural cases are the part worth learning. For the surrounding repertoire the {{unicode-block-explorer|Unicode block explorer}} shows the planes emoji live in, the {{character-code-converter|character code converter}} lists every encoding of a single character, and the {{special-character-picker|special character picker}} covers the punctuation marks that sit beside emoji in real text.",
    faqs: [
      {
        q: "Why is one emoji several code points?",
        a: "Because modern emoji are sequences rather than single characters. A flag is two regional indicators, a skin-toned or gendered emoji is a base plus modifiers, and a composed image such as a rainbow flag joins several elements with a zero-width joiner. Only the simplest emoji are single scalars.",
      },
      {
        q: "What does the variation selector do?",
        a: "It chooses which presentation a character takes when both are possible. Adding U+FE0F asks for the emoji form, which is why the red heart and the warning sign are written with a selector. Without it, a platform may render the older monochrome text form instead.",
      },
      {
        q: "Why does my string length show double the emoji?",
        a: "Because the length property counts UTF-16 code units, and anything outside the basic multilingual plane uses two of them. Counting graphemes, which is what a cursor does, gives the number a reader would count; the bulk mapper segments on exactly that boundary.",
      },
      {
        q: "Is it safe to split an emoji by index?",
        a: "No. Splitting mid-sequence produces an invalid fragment, and cutting a joined sequence in half leaves separate characters that render as letters or boxes. Truncation has to work on grapheme boundaries, which is what the segmentation in the bulk mapper demonstrates.",
      },
      {
        q: "Why might an emoji look different on another device?",
        a: "Because emoji drawings are supplied by the platform rather than the webfont, so the same sequence is drawn by a different typeface on each operating system. A joined sequence on a platform that lacks the combined glyph can even fall back to its individual components.",
      },
    ],
  },

  "text-justification-previewer": {
    keywords: [
      "text justification previewer",
      "justified text",
      "space stretch",
      "hyphenation",
    ],
    intro:
      "The text justification previewer renders one paragraph under each alignment and models the space stretch justified text needs on every line. You set the alignment, the hyphenation mode, the measure and the size, and the panel returns an approximate characters-per-line figure, a stretch multiplier and a verdict on whether the measure can carry justification at all.",
    content:
      "The text justification previewer works on a single paragraph. You paste the copy, choose an alignment, set the measure in characters and the size in pixels, and decide how hyphenation should behave; the preview redraws immediately while a reference table pairs the measure with an approximate characters-per-line count, a space stretch multiplier and a verdict. The generated stylesheet rule is written at the same time, so the readouts and the CSS always describe the same settings.\n\n- Alignment modes: ragged right, justified, centred and ragged left.\n- hyphens values: auto for language-aware hyphenation, manual for soft hyphens only, and none.\n- Measure from 28ch to 110ch, defaulting to 62ch, and size from 12px to 24px, defaulting to 16px.\n- A consecutive-hyphen switch that adds hyphenate-limit-lines: 2 when it is on; the rule always carries hyphenate-limit-chars: 6 3 3.\n- Faces come from the shared preview catalogue, with Lora as the default.\n- The reference table reports the measure, the approximate characters per line, the stretch multiplier and a verdict of too narrow, workable or too wide.\n- A second table row states whether rivers of white are likely, which depends only on the hyphenation mode.\n\nThe stretch figure is a model rather than a measurement of the rendered paragraph. With justification off it stays at 1.00x; with justification on and hyphens set to none it rises to 1.18x, because a line with no legal break point must absorb its leftover space in the gaps between words; with any hyphenation mode available it settles at 1.06x. The characters-per-line estimate divides the measure by 3.1% of the pixel size, a rough average advance for a text face, so a 62ch measure at 16px reads as about 125 characters. The verdict comes from the measure alone: below 45ch the panel reports too narrow to justify, above 85ch too wide, and in between workable. The rule also carries overflow-wrap: break-word, so an unbreakable string cannot push the line wider than the measure that was set.\n\n- The stretch multiplier is a fixed value per hyphenation mode, not a measurement of the paragraph you paste.\n- The characters-per-line estimate assumes an average advance, so wide or condensed faces drift from it.\n- Justification quality depends on the browser's hyphenation dictionary, which the panel cannot see or report on.\n- Centred and ragged-left alignments are drawn for comparison, but the stretch and rivers rows describe justification only.\n- The generated rule fixes line-height at 1.6 and hyphenate-limit-chars at 6 3 3, and neither is adjustable here.\n\nUse it to decide whether a measure can carry justified text before the stylesheet is written, and to see what switching hyphenation on does to the texture at that width. Once the decision is made, the hyphenation controls themselves belong to the tester that exercises hyphens, hyphenate-limit-chars and language selection. A measure that spans several columns should be checked in the column layout builder, and when the real problem is a line that ends with a single stranded word, the widow and orphan detector measures where that word will actually fall.",
    howTo: [
      { step: "Pick an alignment; justified is the mode the space-stretch model describes." },
      { step: "Set hyphens to auto, manual or none and watch the rivers row change with the mode." },
      { step: "Drag the measure and size sliders until the verdict reads workable for the copy you pasted." },
      { step: "Copy the generated rule, which carries the text-align, hyphens and hyphenate-limit-chars values." },
    ],
    whenToUse:
      "Reach for it when a wide measure has to be justified and you want to see the cost in space stretch before committing to a stylesheet. The hyphenation that makes justification survivable is exercised in the {{hyphenation-tester|hyphenation tester}}, where the language, the character limits and the consecutive-line cap are all adjustable. A measure that will span several columns belongs to the {{text-column-layout-builder|text column layout builder}}, and a single stranded word at the end of a paragraph is what the {{widow-and-orphan-detector|widow and orphan detector}} reports from real font metrics.",
    faqs: [
      {
        q: "Why does the stretch figure jump when I turn hyphenation off?",
        a: "A justified line with no legal break point has to absorb all its leftover space between words, and the panel models that as 1.18x against 1.06x when hyphenation is available. That increase is the mechanical cause of the rivers a narrow measure shows.",
      },
      {
        q: "Is the space stretch a real measurement of my paragraph?",
        a: "No. It is a fixed multiplier per hyphenation mode rather than a read of the rendered lines. Use it to compare settings and see the direction of the change, and judge the final texture in the preview.",
      },
      {
        q: "What does the verdict column actually check?",
        a: "The measure alone: below 45ch it reports too narrow to justify, above 85ch too wide, and between the two workable. It never inspects the words in your paragraph, so a workable measure can still produce a bad line.",
      },
      {
        q: "Can I justify text without hyphenation?",
        a: "You can, but the word gaps widen and rivers become likely on anything but a very wide measure. Leaving hyphens on auto keeps the spaces tighter, and the rivers row states which of those outcomes to expect.",
      },
      {
        q: "Why is the generated line height fixed?",
        a: "The rule fixes line-height at 1.6 and hyphenate-limit-chars at 6 3 3 so the output stays predictable. Edit those two declarations in the stylesheet when the design calls for different values.",
      },
    ],
  },

  "running-head-previewer": {
    keywords: [
      "running head previewer",
      "recto and verso",
      "folio",
      "head size",
    ],
    intro:
      "The running head previewer renders the small line at the top of a book page and alternates it across a two-page spread. You set the book title for the recto, the chapter for the verso, the page layout, the head face, the head size, the outside margin and the head weight, and the tool draws both pages so the folio's position on the outer edge is visible rather than described.",
    content:
      "The running head previewer is a print mock rather than a code generator. It takes the two texts a two-sided book needs, the layout mode, the head face, the head size in pixels, the outside margin in millimetres and a head weight, then draws the pages with a head line, a body block and a footer that echoes the margin. In two-sided mode two panels are rendered, and the alternation between the chapter head and the book head is the point of the exercise.\n\n- Page layouts: two-sided, with recto and verso alternation, or single-sided with one head.\n- Head size from 8px to 20px, defaulting to 16px, with the point equivalent reported.\n- Outside margin from 2mm to 40mm, defaulting to 12mm, with the inch equivalent reported.\n- Head weight from 300 to 700 in hundred-unit steps, defaulting to 400.\n- In two-sided mode the verso page 42 carries the chapter head with the folio on the left, and the recto page 43 carries the book title with the folio on the right, so the number always falls on the outer edge.\n- The head face comes from the shared catalogue, defaulting to Source Serif 4.\n- A footer line on each panel states the outer margin value and repeats the folio.\n\nThe arithmetic is the part a print specification keeps. The head size is set in pixels and reported in points by multiplying by 0.75, and the outside margin is converted from millimetres to inches by dividing by 25.4, which is what happens when type is chosen on screen but the page is specified on paper. The head sits above a rule and the body copy begins below it, separated by the margin rather than by another rule, which is the convention these panels demonstrate. At the default 16px the head line converts to 12pt, a common size for a book head, and the default 12mm margin is just under half an inch. Each page panel also prints an explanation of the head's size and weight in the context of the body copy, so the comparison does not have to be held in memory.\n\n- The page numbers are fixed at 42 and 43; nothing here paginates a real document.\n- The tool previews only. It exports no CSS, no paged-media markup and no print stylesheet.\n- Single-sided mode drops the chapter alternation, so the verso head cannot be judged from it.\n- The weight control moves in hundred-unit steps and assumes the chosen face carries those weights.\n- Nothing enforces a minimum clearance between the head line and the text block; the margin is a value, not a constraint.\n\nUse it to settle the two decisions a running head always raises: which text goes where, and where the folio falls on the outer edge. Judge the head size against the body copy and keep the head lighter than the chapter title below it, since a bold running head competes with the page's own hierarchy. The planning side of the same problem, what each page carries and how sections alternate, belongs to the running head planner, and the numbers chosen here are recorded for production in the print type specification sheet.",
    howTo: [
      { step: "Enter the book title for the recto head and the chapter for the verso head." },
      { step: "Choose the two-sided or single-sided layout and the face for the head line." },
      { step: "Set the head size, the outside margin and the head weight, then read the point and inch conversions." },
      { step: "Check both pages in the preview to confirm the folio falls on the outer edge before recording the specification." },
    ],
    whenToUse:
      "Use it before a book interior is specified, when the placement of the head and the folio still has to be agreed. The preview answers the two-page question visually, which is faster than reading a description of recto and verso rules. The surrounding page plan, including what each section carries, is the {{running-head-planner|running head planner}}'s job, and the full specification of head size, margin and weight belongs in the {{print-type-specification-sheet|print type specification sheet}}. The book-level layout this head sits in is previewed by the {{book-interior-layout-preview|book interior layout preview}}.",
    faqs: [
      {
        q: "Which head goes on which page?",
        a: "In a two-sided layout the verso carries the chapter or part title and the recto carries the book title. The folio always sits on the outer edge, left on the verso and right on the recto.",
      },
      {
        q: "How large should a running head be?",
        a: "One or two steps smaller than the body text is the usual answer, and the panels make that comparison in context. The point conversion is reported so the chosen value can be recorded in a print specification.",
      },
      {
        q: "Why is there no exported CSS?",
        a: "A running head belongs to a paged-media context, and the tool is a mock rather than a generator. Its purpose is to settle placement and relative size before a print stylesheet or a layout application takes over.",
      },
      {
        q: "Does the tool paginate my document?",
        a: "No. The two pages are fixed examples at 42 and 43, and the alternation is what is being demonstrated rather than a real page sequence.",
      },
      {
        q: "Should the running head be bold?",
        a: "Usually not. A lighter weight keeps the head from competing with the chapter title, and the weight control makes that difference visible against the body copy.",
      },
    ],
  },

  "optical-margin-alignment-preview": {
    keywords: [
      "optical margin alignment",
      "hanging punctuation",
      "sidebearing",
      "text-indent",
    ],
    intro:
      "The optical margin alignment preview shows the same line aligned to its box edge and then hung by the amount a glyph's ink sits inside its advance width. You choose the face, paste a line, set the size and the hang amount, and the panel reports the first character's code point, whether it appears in the measured table and the offset that is applied.",
    content:
      "The optical margin alignment preview exists because a text block aligned on its box edge looks ragged wherever a glyph's ink starts inside its advance width. A quotation mark, a bullet, a pointed capital and the numeral 1 all open a visible notch, and hanging punctuation pulls that ink out to the true edge. The tool renders the box-edge and optically hung versions of the same line side by side, with dashed guides marking the edge, and reports which character is at the start and what hang it is given.\n\n- A measured table of starting values: the opening double quote at 0.36em, the single quote at 0.26em, the bullet at 0.30em, the em dash at 0.12em, the numeral 1 at 0.08em, and the capitals A, V, T and J between 0.06em and 0.04em.\n- Hang amount from 0 to 0.6em in hundredth steps, defaulting to 0.36em for a line that opens with a double quote.\n- An on and off switch that renders both states at once.\n- hanging-punctuation values of first last, first or none, written into the generated rule and noted as Safari-supported.\n- Line size from 12px to 64px, defaulting to 22px, with Fraunces as the default face.\n- Readouts: the first character, its code point, its label in the measured table or a note that it is not covered, and the applied offset.\n- Per-character overrides keyed on a data-first attribute, so a quote can hang further than a capital without changing the markup.\n\nThe portable construction is a negative text-indent paired with equal padding, so the hung ink sits outside the box while the block keeps its width and nothing downstream reflows. The measured table supplies per-glyph starting points rather than one value for everything, because the ink of a quotation mark sits much further inside its advance than the ink of a capital A. The generated rule writes the hanging-punctuation property first and leaves it in place for engines that support it, which is why the preview works even where that property is ignored: the indent does the visible work.\n\n- The sidebearing figures are typical fractions for text faces, not values read from the selected font's tables.\n- hanging-punctuation support is limited, which is why the negative indent is the portable path.\n- Only the first glyph is hung; a line that opens with two marks receives a single offset.\n- One amount applies to the whole line unless the per-character overrides are used, so different glyph classes need the extra rules.\n- The comparison is drawn at one size, while optical alignment at display sizes usually needs a different amount than at text sizes.\n\nUse it on any block whose edge is judged by eye: a quotation opening with a mark, a list whose bullets appear to sit inside the margin, a heading that starts with a pointed capital. The adjustment is small and the panel is honest about where the numbers come from, so keep the amount adjustable per face rather than fixing it once. The designed quotation component is the pull quote designer's territory, and the contour case, where the text edge follows a shape rather than a glyph, is what the text box shape wrapper builds.",
    howTo: [
      { step: "Choose the face and paste the line, starting it with the punctuation or capital that should hang." },
      { step: "Set the size and switch optical alignment on to see the hung version beside the box-edge version." },
      { step: "Adjust the hang amount, or take the value for the starting character from the measured table." },
      { step: "Copy the rule, including the hanging-punctuation declaration and the per-character overrides, and keep the amount adjustable per face." },
    ],
    whenToUse:
      "Use it wherever a text edge is judged visually and a glyph's ink refuses to reach it: a pull quote that opens with a mark, a bulleted list, a display heading that starts with a capital. The difference is a fraction of an em, and that is exactly why it is worth measuring rather than guessing. A designed quotation belongs to the {{pull-quote-designer|pull quote designer}}, while the case where the edge follows an image or a shape is the {{text-box-shape-wrapper|text box shape wrapper}}. When a whole block of ragged-right text has an uneven edge, the fix is usually the measure, and that is what the {{text-justification-previewer|text justification previewer}} and the {{paragraph-width-optimizer|paragraph width optimizer}} examine.",
    faqs: [
      {
        q: "Why do quotation marks need a larger hang than capitals?",
        a: "The ink of a quotation mark sits much further inside its advance width than the ink of a capital. A pointed capital like A overhangs by a few hundredths of an em, while an opening double quote needs about a third of an em to reach the same visual edge.",
      },
      {
        q: "Where do the table's figures come from?",
        a: "They are typical sidebearing fractions for text faces, not readings from the selected font. Treat them as starting points and adjust the amount for the face in front of you.",
      },
      {
        q: "What does hanging-punctuation support look like in practice?",
        a: "The property is written into the generated rule and works in Safari. Elsewhere it is ignored, and the negative indent is what produces the visual hang, so the effect does not depend on that support.",
      },
      {
        q: "Does hanging a glyph change the layout?",
        a: "No. The block keeps its width and only the ink moves outside it, so nothing after the block reflows. That is the difference between optical alignment and a true outdent into the margin.",
      },
      {
        q: "Do I need the per-character overrides?",
        a: "Only when the opening glyph varies. A single amount is enough for a fixed template, while a component that can start with a quote, a bullet or a numeral needs the data-first rules to hang each class correctly.",
      },
    ],
  },

  "text-column-layout-builder": {
    keywords: [
      "text column layout builder",
      "column-width",
      "column-fill",
      "multi-column CSS",
    ],
    intro:
      "The text column layout builder writes a multi-column CSS block from either a target column width or a fixed column count, then reports how many columns the container will really produce and how wide they will be. You choose the sizing mode, the gap, the rule, the fill behaviour, the container width and the face, and the built-in character estimate checks the result against the comfortable 40 to 75 character band.",
    content:
      "The text column layout builder turns a short panel of controls into a complete multi-column CSS block. You set the sizing mode, the count or the column width, the column gap, an optional rule, the column-fill value, the container width, the text face and the copy; the readouts report the resulting column count, the effective column width and an approximate characters-per-column figure that is labelled as too narrow, in the 40 to 75 band, or too wide.\n\n- Sizing modes: column-width, where the browser fits as many columns as the container allows, and column-count, where the number is fixed.\n- Column count from 1 to 6, or column width from 10rem to 60rem.\n- Column gap from 0 to 8rem in quarter-rem steps, defaulting to 2rem.\n- Column rule options: none, 1px solid, 1px dashed and 1px dotted.\n- column-fill: balance for equal heights or auto to fill the columns in order.\n- Container width from 240px to 1400px, defaulting to 900px, and a preview that renders two paragraphs so the break behaviour between columns is visible.\n- The generated rule always carries widows: 2, orphans: 2 and hyphens: auto.\n- A gotchas panel covering column balance, break-inside, reflow limits and print units.\n\nIn width mode the effective count is computed by adding the gap to the container and dividing by the column width plus the gap, floored, so a 900px container with 26rem columns and a 2rem gap yields the count the browser will actually fit rather than the count you hoped for. In count mode the effective width is the container minus the gaps divided by the count. The character estimate divides that width by half the 16px base size, the same average-advance assumption the preview relies on, which is why it is reported as approximate. The default gap of 2rem is 32px at that base size, a common gutter for a two-column article. The preview applies the real column properties to two paragraphs, and each paragraph carries break-inside: avoid so it is never split across a boundary, the behaviour a heading or a figure needs in production.\n\n- The rule is always 1px; thicker or hairline separators are a stylesheet edit.\n- The character estimate is an average advance rather than a measurement of the selected face.\n- Column balance is a browser estimate, so the last column can still end up shorter than its neighbours.\n- The preview container is capped at the chosen pixel width, and a fluid container behaves differently above and below that value.\n- A column layout cannot be re-ordered by the page's own grid, so the container must be wide enough for the whole set.\n\nUse it when a wide measure needs slicing: an article body, a documentation index or a print page with a specified column width. The character band is the number worth watching, and the builder reports it on every change, which is faster than measuring columns by hand. The justification question inside each column is what the justification previewer models, and the surrounding page furniture, such as running heads and column rules, belongs to the print specifications that record those decisions for production.",
    howTo: [
      { step: "Choose column-width to let the browser fit columns, or column-count to fix the number." },
      { step: "Set the count or the width, then adjust the gap and decide whether a rule separates the columns." },
      { step: "Pick balance or auto fill, set the container width, and read the resulting columns and character band." },
      { step: "Paste the copy and copy the generated rule, keeping widows, orphans and hyphens if the text should break cleanly." },
    ],
    whenToUse:
      "Use it when one measure has to become several: a feature article, a documentation index or a printed page whose column width is already specified. The builder answers the two questions that come first, how many columns fit and how wide each one lands, before any content is set. The breaks inside a column belong to the {{hyphenation-tester|hyphenation tester}}, and the justification of each column is what the {{text-justification-previewer|text justification previewer}} models. When the columns are part of a page design rather than a web article, the {{magazine-column-setter|magazine column setter}} carries the same decisions into print.",
    faqs: [
      {
        q: "What is the difference between column-width and column-count?",
        a: "Width mode states a preferred column width and lets the browser fit as many columns as the container allows, so the count changes with the viewport. Count mode fixes the number and lets the width fall out of the container instead.",
      },
      {
        q: "Why do my character counts fall outside the 40-75 band?",
        a: "The estimate uses an average advance and the band is a readability target rather than a hard limit. Adjust the column width, the gap or the container width until the readout lands inside it.",
      },
      {
        q: "Why does the last column look shorter than the others?",
        a: "That is column balancing, which is a browser estimate rather than a solved computation. A slightly different container width or the auto fill mode usually evens the columns out.",
      },
      {
        q: "Can I use this layout for print?",
        a: "The CSS is valid for print, but a fixed paper size is easier to reason about in physical units. Keep the gap and the rule sizes in millimetres or points in the print stylesheet.",
      },
      {
        q: "Why do paragraphs never split across columns in the preview?",
        a: "The preview marks each paragraph break-inside: avoid so the block stays whole, which is the declaration a heading or a figure needs. Remove it where a long paragraph should be allowed to flow between columns.",
      },
    ],
  },

  "hyphenation-tester": {
    keywords: [
      "hyphenation tester",
      "hyphenate-limit-chars",
      "soft hyphen",
      "language-aware hyphenation",
    ],
    intro:
      "The hyphenation tester renders a paragraph with the CSS hyphenation controls applied and names the dictionary the browser needs for the selected language. You set the face, the language, the hyphens value, the character limits and the measure, and the readouts translate those choices into before and after minimums, the required dictionary and whether the measure makes hyphenation essential.",
    content:
      "The hyphenation tester is built around the controls that actually change output: hyphens, hyphenate-limit-chars, hyphenate-limit-lines and the measure of the container. The language-aware hyphenation that browsers implement requires a dictionary for the declared language, and the tool states which dictionary is needed rather than implying that any face will hyphenate correctly on its own. Alongside the automatic path, a separate panel converts a hyphenated word such as trans-contin-ental into invisible soft hyphen characters, which is the manual route for headlines and brand terms.\n\n- hyphens values: auto for the browser dictionary, manual for soft hyphens only, and none.\n- Languages: en-US, en-GB, de-DE labelled for long compounds, fr-FR, es-ES and pt-BR.\n- hyphenate-limit-chars presets: 5 2 2 aggressive, 6 3 3 balanced, 8 4 4 conservative and 10 5 5 minimal.\n- Consecutive hyphenated lines from 1 to 5, written as hyphenate-limit-lines.\n- Measure from 16ch to 90ch, defaulting to 34ch, with the readout calling hyphenation essential below 30ch and optional above it.\n- Justify is a separate switch that changes the paragraph to text-align: justify.\n- The manual panel renders the entered word with the hyphens replaced by U+00AD, so the soft hyphen positions can be checked in the chosen face.\n\nThe generated rule carries the standard hyphens property, the -webkit- prefixed copy for engines that still need it, the character limits, the consecutive-line cap and two max-width declarations, the second being min(100%, the measure in characters) so the block cannot overflow a narrow container. The limit readout splits the preset into its parts: 6 3 3 requires a word of at least six characters with three characters before the hyphen and three after it, which is why a word shorter than the combined minimum cannot break at all. With hyphens set to manual nothing hyphenates until a soft hyphen is inserted, because a browser will not infer a break point from spelling alone; that is the switch that keeps a brand term whole.\n\n- The dictionary comes from the browser or the operating system; the tool only declares the language.\n- Soft hyphens are invisible in most editors and are lost when copy passes through some tools.\n- Automatic hyphenation can break a proper noun or a product name in a way no dictionary check prevents.\n- The language selector must match the paragraph's real language, or the break points come from the wrong dictionary.\n- The preview paragraph is rendered at a fixed 16px, so behaviour at other sizes has to be judged elsewhere.\n\nUse it when ragged-right text is producing a loose edge or when justified text needs tighter spacing, and treat the language setting as the switch that matters most rather than the character presets. When the measure itself is the variable, the same test belongs beside the justification model or the multi-column layout, where width and column count move together. If the goal is avoiding a short last line rather than breaking words at all, the widow and orphan detector measures the paragraph and flags the stranded line directly.",
    howTo: [
      { step: "Choose the face and the language whose hyphenation dictionary should apply." },
      { step: "Set hyphens to auto, manual or none, then pick the hyphenate-limit-chars preset." },
      { step: "Cap the consecutive hyphenated lines and set the measure until the readout calls hyphenation essential or optional." },
      { step: "Paste the copy, check the rendered paragraph, and copy the CSS block including the language declaration." },
    ],
    whenToUse:
      "Open it when a narrow measure is leaving a ragged edge or when justified text needs the tighter spacing that hyphenation supplies. The character presets are a convenience, but the language switch is the one that decides whether break points come from a dictionary at all. When the paragraph's width is the open question rather than its breaks, the {{text-justification-previewer|text justification previewer}} models the space stretch and the {{text-column-layout-builder|text column layout builder}} checks the measure across columns. A paragraph that breaks cleanly but still ends with one stranded word is the case the {{widow-and-orphan-detector|widow and orphan detector}} measures directly.",
    faqs: [
      {
        q: "Why does nothing hyphenate while hyphens is set to manual?",
        a: "Manual mode breaks a word only where a soft hyphen already exists, because browsers do not infer break points from spelling. The paragraph stays unhyphenated until you insert U+00AD characters with the panel below it.",
      },
      {
        q: "Which character preset should I start from?",
        a: "6 3 3 balanced is the middle ground: at least six characters in the word, three before the break and three after. Move to 5 2 2 for tight measures, where more breaks are wanted, and to 10 5 5 when breaks should be rare.",
      },
      {
        q: "Does the tool ship hyphenation dictionaries?",
        a: "No. It declares the language and the browser or operating system supplies the dictionary. A missing dictionary is the usual reason automatic hyphenation looks random on one machine and correct on another.",
      },
      {
        q: "Why does the generated rule repeat max-width twice?",
        a: "The second declaration is min(100%, the measure), so the block respects the container on small screens while continuing to honour the character measure when the room is there. The first declaration is the plain measure for older engines.",
      },
      {
        q: "Can hyphenation break my brand name?",
        a: "It can, because the browser follows the dictionary rather than your naming rules. Use manual mode and place soft hyphens yourself for terms that may break only at approved points.",
      },
    ],
  },

  "drop-cap-generator": {
    keywords: [
      "drop cap generator",
      "initial-letter",
      "cap height",
      "line boxes",
    ],
    intro:
      "The drop cap generator writes the first-letter rule for an opening paragraph from the number of lines the cap should span. It offers the modern initial-letter property and the float plus font-size construction that production stylesheets still carry, and it reports the computed cap size, the indent the following lines need and how many line boxes the cap clears.",
    content:
      "The drop cap generator starts from a paragraph and a line count. You choose the cap face from the preview catalogue with the monospace families filtered out, set how many lines the letter should span, the body size, the body line height and the cap colour, and select a technique. The panel then reports the sink in lines, the float method's cap size in pixels and em, the indent needed to clear it and the number of line boxes it occupies, while the preview draws the paragraph with the calculated cap in place.\n\n- Lines spanned from 2 to 5, defaulting to 3.\n- Body size from 12px to 24px, defaulting to 16px, and body line height from 1.2 to 2.2, defaulting to 1.6.\n- Cap face from the shared catalogue, excluding the monospace families.\n- Techniques: initial-letter (modern) and float + font-size (portable).\n- A cap colour input, defaulting to a near-black ink.\n- Readouts: the sink in lines, the cap font size in pixels and em, the indent needed and the cleared line boxes.\n- The generated rule differs by technique: one initial-letter declaration, or a float with a computed font size, line height and top margin.\n\nThe float construction is computed from an assumption rather than read from the font binary: the cap height is taken as 0.7em, so the cap font size is the spanned line boxes divided by 0.7, and the cap's rendered height is that size multiplied back by 0.7. The rule then sets line-height to the line box divided by the cap size and a negative top margin equal to the overhang divided by the cap size, which is what pulls the glyph up so its top lands on the intended line boundary. The indent figure multiplies the cap size by three quarters, a working clearance rather than a measured sidebearing. The initial-letter branch is far smaller: one property whose value is the number of lines, plus a small right margin.\n\n- Cap height is assumed at 0.7em, so a face with unusually tall or short capitals needs the value checked by eye.\n- The preview always draws the float construction, even when initial-letter is the selected technique, so engine differences appear only in the stylesheet.\n- initial-letter support varies by engine, and the float branch is the one that renders everywhere.\n- The preview strips the paragraph's first character for the cap, so an opening quotation mark becomes the cap instead of a letter.\n- Body size and line height are the only typographic context offered; leading and measure are fixed by the page.\n\nUse it for a chapter opening, a long-form lede or a magazine feature where the first letter has to hold the paragraph open. Export both branches and keep the float version as the fallback, then check the three failures the preview is there to catch: a cap whose height does not land on a line boundary, a first line short enough to wrap under the cap, and a translucent colour that reads darker where the cap overlaps the indent. The related opening treatment without the sink is handled by the initial cap styler, and the chapter furniture around it belongs to the chapter header designer.",
    howTo: [
      { step: "Choose the cap face and the number of lines the letter should span." },
      { step: "Set the body size and the body line height, then pick the initial-letter or the float technique." },
      { step: "Adjust the cap colour and paste the paragraph the opening belongs to." },
      { step: "Copy the generated first-letter rule and keep the float branch as a fallback for engines without initial-letter support." },
    ],
    whenToUse:
      "Keep it for the moments when a document genuinely opens: a chapter, a feature lede, a section that has to announce itself. The float construction is the safer default on the web because it does not depend on initial-letter support, and the initial-letter branch is the shorter rule for projects that can rely on it. The lighter opening treatments, a raised cap or small caps, are what the {{initial-cap-styler|initial cap styler}} compares, and the designed quotation case is the {{pull-quote-designer|pull quote designer}}. When the drop cap sits inside a printed page, the {{chapter-header-designer|chapter header designer}} carries the surrounding furniture.",
    faqs: [
      {
        q: "Which technique should I ship?",
        a: "Ship the float construction unless the whole project targets engines with initial-letter support. The float rule is longer but renders consistently, and the modern property is a one-line replacement where support allows.",
      },
      {
        q: "Why does the preview look the same when I choose initial-letter?",
        a: "The preview always draws the float construction so the indent and clearance can be judged; the selected technique changes only the CSS that is generated. Engine differences show up when the stylesheet is applied, not in the panel.",
      },
      {
        q: "Why does the cap need a negative top margin?",
        a: "A floated glyph is positioned against its own line box rather than the body baseline. The margin pulls it upward so the cap's height lines up with the spanned line boxes instead of sitting low in the first line.",
      },
      {
        q: "What is the indent figure for?",
        a: "It estimates how far the following lines must clear the cap's ink, derived from the cap size rather than the face's real sidebearings. Treat it as a starting point and confirm it visually against the opening copy.",
      },
      {
        q: "Can the cap be a ligature or a quotation mark?",
        a: "The rule targets the first letter, so whatever character opens the paragraph becomes the cap. A paragraph that opens with a quotation mark hangs the quote rather than a letter, which is usually not the intent.",
      },
    ],
  },

  "pull-quote-designer": {
    keywords: [
      "pull quote designer",
      "hanging quotation mark",
      "quote-to-body ratio",
      "attribution",
    ],
    intro:
      "The pull quote designer composes a quotation lifted out of the flow and states the relationship between its size and the body text it interrupts. You enter the quotation, the attribution and the source, choose the quote face and the two sizes, decide how the opening mark and the rule are handled, and the readouts report the quote-to-body ratio, whether that ratio reads as a distinct voice, and the computed attribution size.",
    content:
      "The pull quote designer starts with the text of the quotation and ends with a blockquote rule whose parts are all visible in the panel. The quotation, attribution and source are typed in; the face, the quote size and the body size are chosen from controls; the opening mark can hang outside the measure, sit inline or be omitted; the rule can be a left border, a top border or nothing; and an italic switch decides the style. The readouts report the quote-to-body ratio, a hierarchy verdict and the size the attribution will take.\n\n- Quotation mark treatments: hanging outside the measure, inline in the flow, or omitted when the attribution already implies a quotation.\n- Rule options: a 3px left rule with 1.25rem of padding, a 2px top rule with 1rem of padding, or spacing alone.\n- Quote size from 18px to 64px, defaulting to 28px, and body size from 12px to 24px, defaulting to 16px.\n- An italic toggle that uses the italic cut when the face has one.\n- Attribution and source fields rendered as a small-caps footer at 80% of the body size with 0.04em of letter-spacing.\n- Hierarchy readout: below 1.4x the quote reads too close to the body, above 3x it may dominate the page, and between the two it reads as a clearly larger voice.\n- A preview that prints a line of body copy after the quotation at the body size, so the size jump can be judged in context.\n\nThe hanging quotation mark is produced with a negative text-indent on the blockquote, which pulls the opening mark outside the measure while the box keeps its width: the ink moves, the layout does not. The attribution is a block-level footer inside the blockquote rather than a separate paragraph, which is what keeps it attached to the quotation on narrow screens. The rule and the mark are separate decisions on purpose, because a quotation that hangs its mark and carries no border reads differently from one that is boxed in by a left rule. The preview's trailing body line is the piece that makes the ratio meaningful, since a quote can only be judged against the text it interrupts.\n\n- The model is a single quotation: nested quotations inside the pulled text are not styled or numbered.\n- Italic depends on the face having a true italic cut; otherwise the browser synthesises a slant.\n- The rule is fixed at 3px on the left and 2px on the top, so heavier editorial rules need a stylesheet edit.\n- The quote is a standalone block, and there is no inline variant where body text wraps around it.\n- The ratio thresholds are guidance rather than a measurement of the design's hierarchy.\n\nUse it when a long article needs a pause and the quotation is worth pulling out of the flow: a feature opener, a case-study testimonial or an interview answer. Keep the ratio between 1.4x and 3x of the body size, hang the opening mark rather than indenting the quotation, and let the attribution stay small and quiet. The other opening treatments in a document belong to the drop cap generator and the initial cap styler, and the spacing around the quotation is reconciled with the surrounding baseline by the vertical rhythm builder.",
    howTo: [
      { step: "Paste the quotation and fill in the attribution and source fields." },
      { step: "Choose the quote face and set the quote and body sizes so the ratio reads as a distinct voice." },
      { step: "Pick the quotation mark treatment and the rule, then decide whether the quotation is italic." },
      { step: "Copy the blockquote rule and its footer styling into the stylesheet." },
    ],
    whenToUse:
      "Reach for it when a single sentence deserves to be lifted out of a long piece: a feature opener, a testimonial or the answer that carries an interview. The quote-to-body ratio is the decision that makes or breaks it, and the panel states the range that works. When the lifted type is an opening letter rather than a quotation, the {{drop-cap-generator|drop cap generator}} and the {{initial-cap-styler|initial cap styler}} cover those constructions. The spacing between the quotation and the surrounding text is what the {{vertical-rhythm-builder|vertical rhythm builder}} reconciles, and a quotation that body copy should wrap around is the case the {{text-box-shape-wrapper|text box shape wrapper}} handles.",
    faqs: [
      {
        q: "What quote-to-body ratio should I aim for?",
        a: "Between 1.4x and 3x the body size. Below 1.4x the quotation reads as another paragraph, and above 3x it competes with the page's headings rather than sitting between them.",
      },
      {
        q: "Why hang the opening quotation mark?",
        a: "A hanging mark aligns the first letter of the quotation with the text edge, so the quote begins flush with the column instead of one character in. The negative indent moves only the ink and leaves the box width alone.",
      },
      {
        q: "How is the attribution styled?",
        a: "It renders as a block-level footer in small caps at 80% of the body size, with slight letter-spacing and the muted colour. That contrast keeps it readable without giving it the weight of the quotation.",
      },
      {
        q: "Can I place the quote inline so text wraps around it?",
        a: "No. The designer builds a standalone block. A float-based layout where body copy wraps around an element is what the text box shape wrapper demonstrates.",
      },
      {
        q: "Does the italic switch always work?",
        a: "Only when the face has a true italic cut. Otherwise the browser slants the roman, which is acceptable for a short quotation but noticeable across several lines.",
      },
    ],
  },

  "initial-cap-styler": {
    keywords: [
      "initial cap styler",
      "raised cap",
      "small caps",
      "first word in caps",
    ],
    intro:
      "The initial cap styler compares the four openings a chapter can carry: no initial, a small cap, a raised cap and a first word in caps. You set the face, the body size, the line height, the initial scale and the cap tracking, and the panel reports the raised rise above the first baseline and whether the opening line needs an indent.",
    content:
      "The initial cap styler is a comparison surface. Each of its four styles renders the same opening paragraph, and the readouts name the applied style, the raised cap's rise above the first baseline and the first-line indent needed. The raised branch floats the initial at a line height below one with a right margin equal to the tracking value; the small-cap branch sets the letter at one em in font-variant small-caps; the first-word branch sets the opening word in synthesised small caps at 62% of the initial scale; the no-initial branch leaves the paragraph untouched.\n\n- Opening styles: raised cap, small cap, first word in caps and no initial.\n- Body size from 12px to 24px, defaulting to 16px, and line height from 1.2 to 2.2, defaulting to 1.6.\n- Initial scale from 1.2em to 4em, defaulting to 1.9em.\n- Cap tracking from 0 to 0.2em in five-thousandth steps, defaulting to 0.06em.\n- A face selector over the shared catalogue, defaulting to Source Serif 4.\n- Readouts: the applied style, the raised rise in pixels and the first-line indent.\n- The generated rule is a single opening block whose selectors change with the style.\n\nThe tracking slider moves in steps of 0.005em, so the default 0.06em sits close to a sixteenth of an em. The rise figure multiplies the initial scale, the body size and a 0.7 cap-height factor, the same modelling shortcut the drop cap construction uses; the value is an estimate for a typical serif face rather than a reading from the font's tables. The tracking control applies to every style that spaces capitals, which is why the small-cap and first-word branches both take a letter-spacing value. The first-word branch scales the opening word by 0.62 of the initial scale, which lifts it above the body text without making it compete with a full raised cap. The raised branch produces no text-indent because a float clears the opening line by construction.\n\n- The rise is modelled with a 0.7 cap-height assumption rather than measured per face or per letter.\n- Small caps are synthesised when the face has no drawn small-cap cut, so the letterforms are scaled capitals.\n- A raised cap only works when the first line holds enough words to clear the float; a short opening line lets the second line slide under the ascender.\n- The panel renders one style at a time, so variants are judged by switching back and forth.\n- No indent control is exposed, and no per-face fitting is attempted.\n\nUse it on a chapter or section opening that should announce a new part of a document without the drama of a drop cap. A raised cap is the safer web choice because it leaves the line count alone, and the rise readout is the number that says whether the float has room in the first line. When the letter should sink into the text block instead, the drop cap generator covers that construction; when the lifted text is a quotation rather than an opening letter, the pull quote designer is the right surface.",
    howTo: [
      { step: "Choose one of the four opening styles, starting with the raised cap or the small cap." },
      { step: "Pick the face and set the body size and line height the chapter uses." },
      { step: "Adjust the initial scale and the cap tracking, then read the rise and indent figures." },
      { step: "Paste the real opening copy and check that the first line clears the float before copying the rule." },
    ],
    whenToUse:
      "Use it when a section opening needs presence but not the displacement of a drop cap: a raised cap or a spaced small cap keeps the paragraph's line count intact. The rise figure is what decides whether the chosen scale fits the first line. When the letter should instead sink into the block, the {{drop-cap-generator|drop cap generator}} writes that construction, and a quotation lifted out of the flow belongs to the {{pull-quote-designer|pull quote designer}}. The wider hierarchy of headings and openers around it is what the {{type-hierarchy-planner|type hierarchy planner}} sets out.",
    faqs: [
      {
        q: "Raised cap or drop cap?",
        a: "A raised cap sits on the first baseline and rises above it, so the paragraph keeps its normal line count. A drop cap sinks into the block and displaces lines. Use raised when the opening should stay calm and dropped when it should dominate.",
      },
      {
        q: "Why does a raised cap need a long first line?",
        a: "The cap is floated, so the first line's words must be long enough to wrap past it. A short opening line lets the following line slide under the ascender, which is exactly the failure the preview is there to catch.",
      },
      {
        q: "Are the small caps real or synthesised?",
        a: "They are synthesised unless the face ships a dedicated small-cap cut, so the browser draws scaled capitals. That is acceptable for most interfaces but visible in a long run of text.",
      },
      {
        q: "What does the rise figure mean?",
        a: "It is the height of the raised cap above the first baseline, modelled from the scale, the body size and a 0.7 cap-height factor. Treat it as an estimate and confirm the result visually.",
      },
      {
        q: "Why is there no indent control?",
        a: "The raised initial is a float, so the first line clears it by construction and no text-indent is needed. Wrap-indent tuning belongs to the drop cap construction instead.",
      },
    ],
  },

  "text-box-shape-wrapper": {
    keywords: [
      "text box shape wrapper",
      "shape-outside",
      "shape-margin",
      "float",
    ],
    intro:
      "The text box shape wrapper builds the two declarations that wrap body copy around a shape: a float that reserves the block, and a shape-outside value that decides where the text may enter. You choose the face, one of four shapes, the float side, the size of the float box, the shape-margin and the text size, and the panel reports the resolved shape function, the clearance beyond the contour and the fallback behaviour.",
    content:
      "The text box shape wrapper turns a shape choice into a working wrap. The controls are the text face, the shape function, the float side, the size of the float box, the shape-margin and the text size, and the preview shows body copy flowing around a tinted box so the contour can be judged directly. The generated rule keeps the float and the shape in one block, and a second output documents what happens in an engine that does not support shape-outside.\n\n- Shapes: circle(50% at 50% 50%), ellipse(45% 55% at 50% 50%), inset(6% 8% 10% 4% round 12px) and a triangle polygon whose points are 0% 0%, 100% 0% and 50% 100%.\n- A no-shape option that leaves a rectangular float, which is the fallback every other choice degrades to.\n- Float side of left or right, with half a rem of margin on the opposite side.\n- Float box from 60px to 420px, square for every shape.\n- shape-margin from 0 to 4rem in five-hundredth steps, defaulting to 1.25rem.\n- Text size from 12px to 22px, with Inter as the default face.\n- Readouts: the resolved shape function, the clearance converted to pixels and the statement that an unsupported engine wraps text to the float's rectangle.\n\nshape-outside changes where inline content may flow; it does not change the element's background, border or box model, which is why a transparent float can still steer a paragraph. The generated block carries the float and the shape together, and the at-supports note records the fallback rather than pretending it away. The support test asks specifically for shape-outside: circle(50%), so an engine that cannot parse that function takes the fallback path. The clearance readout multiplies the shape-margin into pixels, because the value is authored in rem but the gap it creates is physical. The preview tints the float so the contour is visible, and that tint is a preview convenience: in production the same element is usually invisible and the wrapped copy is the only evidence of its outline.\n\n- The shape governs text flow only; the float's size, background and position are separate decisions.\n- The polygon preset is a single triangle rather than an editable point list.\n- The float box is square, so an ellipse is drawn inside a square and reaches the same height as a circle.\n- The element must be floated; a grid or flex-positioned box does not create the same wrap.\n- At very small text sizes the line height is short relative to the contour, and the wrap can look stepped rather than smooth.\n\nUse it when an article carries a portrait, a diagram or a decorative block and the copy should follow its outline instead of running past it. Keep the shape-margin generous, because a contour the text touches reads as an accident while a visible clearance reads as a decision. When the wrap belongs to an opening letter rather than an image, the drop cap generator covers that construction, and the optical margin alignment preview is where the text edge itself is checked for a small glyph-level hang.",
    howTo: [
      { step: "Pick the text face and choose the shape the copy should follow." },
      { step: "Set the float side and the size of the float box." },
      { step: "Adjust the shape-margin until the clearance reads comfortably, then set the text size." },
      { step: "Paste the copy and copy the generated rule, keeping the at-supports note as the fallback documentation." },
    ],
    whenToUse:
      "Use it when an image or a decorative block should have copy around its contour rather than beside it: a portrait in a profile, a diagram in a technical piece, a circular badge in a landing page. The shape-margin is the control that turns a tight wrap into a deliberate one. When the contour is an opening letter, the construction belongs to the {{drop-cap-generator|drop cap generator}}, and a lifted quotation is the {{pull-quote-designer|pull quote designer}}'s job. The text edge itself, including glyph-level hangs, is what the {{optical-margin-alignment-preview|optical margin alignment preview}} checks, and the broader measure around the shape is set by the {{text-column-layout-builder|text column layout builder}}.",
    faqs: [
      {
        q: "Does shape-outside change the element's size?",
        a: "No. It changes where inline content may flow around the element, while width, height, background and border are unaffected. That is why an invisible box can still steer the paragraph.",
      },
      {
        q: "What happens in a browser without shape-outside support?",
        a: "The text wraps to the float's rectangle, which is the layout the page had before shapes existed. The generated at-supports block records that fallback for the stylesheet.",
      },
      {
        q: "Why is the float box square even for the ellipse?",
        a: "The presets keep one size for the box so the control stays simple. The ellipse is drawn inside that square, so widening it is a stylesheet edit rather than a slider move.",
      },
      {
        q: "Can I use an image instead of a coloured box?",
        a: "Yes. The shape is independent of what the float contains, so the same declarations wrap copy around an image once the image replaces the tinted preview box.",
      },
      {
        q: "How much shape-margin is enough?",
        a: "Enough that no line visibly touches the contour. Around one rem is a common starting point, and the readout converts the value to pixels so the clearance is concrete.",
      },
    ],
  },
};
