import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 8 (alphabetical slugs 69-75).
 *
 * The three exporter slugs here became distinct tools when the shared
 * PaletteExporter was split into per-format factories, so each documents a
 * genuinely different artefact (JSON data, a PNG strip, SVG markup).
 *
 * Skipped from this window:
 *  - color-picker-with-favorites — still flagged: the slug advertises saved
 *    favorites but the ColorPicker component has no favorites feature at all.
 *  - color-picker-with-history — renders the identical ColorPicker as
 *    color-picker, whose Recent history is documented on the canonical page.
 */
export const SEO_BATCH_8: Record<string, ToolSeo> = {
  "color-palette-json-exporter": {
    keywords: [
      "color palette json exporter",
      "palette to json array",
      "export palette as json",
      "hex array json",
    ],
    intro:
      "The color palette JSON exporter turns an editable palette into a pretty-printed JSON array of uppercase hex values, ready to paste into code.",
    content:
      "The color palette JSON exporter edits a palette and writes it out as JSON. You keep a list of colors and the panel beside it shows the result: a JSON array in which each entry is an uppercase six-digit hex string, indented two spaces and spread one value per line. A copy button lifts the whole thing onto the clipboard. It is the direct answer to a recurring chore, which is taking colours you chose visually and getting them into a place where code can read them without hand-typing hashes and commas.\n\nThe exact shape is worth stating because it decides where the output can be used:\n\n- What comes out is a JSON array, not an object: it opens with a square bracket, holds a string per colour, and closes.\n- The values are uppercased for consistency and indented two spaces, one per line, so the result reads cleanly in a diff.\n- Because it is an array, order is preserved exactly as you arranged it, which is what a ramp, a chart series or anything positional depends on.\n\nThat array-versus-object distinction is the one real design choice in an exporter like this. An array keeps sequence, which is what you want for a ramp, a chart series or anything positional where the first colour means something different from the fourth. An object lets you reach a colour by name, which is what you want once values have roles attached. This tool produces the array form. If your target needs keys, the object and token generators cover that direction, and the CSS exporter produces declarations rather than data.\n\nIn practice the palette-to-json array route shows up wherever a list of values has to be consumed programmatically. Charting libraries take a series palette as an array. Test fixtures often snapshot a palette. Canvas and WebGL pipelines want plain values. Documentation sites generate colour tables from a JSON file. In all of those cases the array is exactly the right container, and generating it here removes the class of bug where a stray comma or a missing quote breaks a parse.\n\nThe workflow is deliberately short: edit the palette, watch the output update, copy it, paste it where it belongs. Because the editor is live there is no export step to remember, and the output can never disagree with what is on screen. Keeping the palette in one generated file rather than scattering literals through a codebase is the maintenance benefit, and starting from generated output rather than typing it by hand is what removes the typographic risk.\n\nTwo limits are worth knowing before you commit to this format:\n\n- The output carries no names, so nothing in the file says which colour is a surface and which is an accent; that meaning lives only in the order and in your own documentation.\n- It records hex only, with no rgb or hsl equivalents and no alpha channel, so a pipeline that needs those has to convert downstream.\n\nFor a clean palette to json array that code can read immediately, that narrowness is exactly what makes it paste-ready, so it remains the fastest way to export palette as json when the consumer expects a plain list of hex values, and where a target simply wants a hex array json file and nothing else, this produces it in one copy.\n\n",
    howTo: [
      { step: "Edit the palette in the left-hand card, adding or removing rows as needed." },
      { step: "Read the JSON array in the panel beside it — it updates with every change." },
      { step: "Copy the array into a .json file, a module, a fixture or a build script." },
    ],
    whenToUse:
      "Use this exporter when a list of colour values needs to be machine-readable as an array. Use the object or token generators when keys and types are required, and the CSS exporter for stylesheet declarations. When keys and types are needed, the {{color-object-generator|object generator}} and the {{color-token-generator|token generator}} cover that direction, and the {{color-palette-css-exporter|CSS exporter}} produces declarations rather than data.",
    faqs: [
      {
        q: "Is the output an array or an object?",
        a: "An array. It is a square-bracketed list of uppercase hex strings, indented and one per line, which preserves the order you arranged.",
      },
      {
        q: "Are the hex values uppercase?",
        a: "Yes. Values are normalised to uppercase six-digit hex for consistency wherever a case-sensitive comparison might be made.",
      },
      {
        q: "Does it record colour names or roles?",
        a: "No. The array holds values only, so any meaning such as surface or accent lives in the order and in your own documentation.",
      },
      {
        q: "Can I paste it directly into a config file?",
        a: "Yes, for any target that accepts a JSON array of strings — a chart palette, a fixture, a build script or a documentation source.",
      },
      {
        q: "Does the array keep the order I arranged?",
        a: "Yes. It is an array rather than an object, so the sequence is preserved exactly as the rows stand, which is what a ramp or a chart series depends on.",
      },
    ],
  },

  "color-palette-png-generator": {
    keywords: [
      "color palette png generator",
      "palette strip image",
      "export palette as png",
      "color ramp image download",
    ],
    intro:
      "The color palette PNG generator renders your palette as a horizontal strip image and downloads it, with the on-screen preview drawn from the exact same canvas.",
    content:
      "The color palette PNG generator turns a palette into a picture. You edit a list of colours, and the tool draws them as a single horizontal strip with one solid block per colour, then offers the result as a downloadable PNG, laying the palette out as a palette strip image rather than as data or markup. Because the preview on screen is the canvas that gets exported rather than a separate mock-up, what you see is precisely what lands in the file, which is a small thing that removes a lot of doubt when a swatch has been handed to someone else.\n\nThe geometry is fixed and predictable:\n\n- Each colour occupies a cell one hundred and sixty pixels wide, the strip is two hundred pixels tall, and the total width is the cell width multiplied by the number of colours.\n- A six-colour palette therefore produces a nine-hundred-and-sixty by two-hundred image, and a five-colour palette produces eight hundred by two hundred.\n- The image is redrawn whenever the palette changes, so adding or removing a colour re-proportions the strip immediately instead of leaving a stale preview behind.\n\nChoosing PNG over the other export formats is a decision about where the artefact is going. A PNG is understood everywhere and needs no viewer, no stylesheet and no markup: it drops into a slide deck, a documentation page, a pull request description, a design hand-off or a chat message and looks the same for everyone. Raster also means the pixels are final, so there is no question of how a renderer might interpolate the edges. If the destination is a document rather than a codebase, a strip image is usually the format people actually want.\n\nThere are two related jobs this covers well. The first is illustration: a header or divider that shows a scheme at a glance. The second is verification, because a strip laid out end to end is a much better way to judge whether a palette progresses evenly than a scatter of swatches seen one at a time. Adjacent steps that are too close together, or a jump that breaks the sequence, become obvious when the colours share an edge.\n\nIt is worth knowing what the image deliberately leaves out:\n\n- The strip is unlabelled: no hex values, no names and no borders between the blocks, which keeps it clean for visual use but means it is not a specification sheet.\n- The height and cell width are fixed, with no spacing, padding or label controls.\n- It is a plain raster, so for editable markup the SVG exporter is the vector route and for printed codes the labelled swatch export carries them.\n\nTreat it as a color palette png generator in the straightforward sense: edit the list, preview the strip, download the file. Keeping the palette in the tool rather than in an image editor means the strip can be regenerated the moment a value changes, which is precisely the point of generating the color ramp image rather than cutting one out of a screenshot and shipping it with stale colours. When the deliverable is a plain picture, that is the shortest route to export palette as png, and the fact that the strip is regenerated on every edit is what makes a color ramp image download worth generating rather than recreating.",
    howTo: [
      { step: "Edit the palette until the strip looks right." },
      { step: "Check the preview, which is the canvas that gets exported rather than a mock-up." },
      { step: "Press Download .png to save the strip." },
    ],
    whenToUse:
      "Use this generator when the palette needs to travel as a plain image — slides, docs, hand-offs or chat. Use the labelled swatch export when the values must be printed on the artefact, and the SVG exporter when you need editable vector markup. The {{color-palette-svg-exporter|SVG exporter}} produces editable vector markup instead of pixels, and the {{color-swatch-png-generator|labelled swatch export}} prints each value on its own card.",
    faqs: [
      {
        q: "What size is the exported image?",
        a: "Each colour gets a cell one hundred and sixty pixels wide and the strip is two hundred pixels tall, so the width is that cell width multiplied by the number of colours.",
      },
      {
        q: "Does the preview match the download?",
        a: "Yes. The on-screen preview is drawn from the same canvas that produces the PNG, so the file matches what you see exactly.",
      },
      {
        q: "Are the hex values shown on the image?",
        a: "No. The strip is unlabelled. Use the labelled swatch export if the codes need to appear on the artefact itself.",
      },
      {
        q: "Is it updated when I change a colour?",
        a: "Yes. The image is redrawn whenever the palette changes, so the strip re-proportions and recolours immediately rather than going stale.",
      },
      {
        q: "What are the exact pixel dimensions of the strip?",
        a: "Each colour is 160 pixels wide and the strip is 200 pixels tall, so the width is 160 times the number of colours — 960 by 200 for six colours, 800 by 200 for five.",
      },
    ],
  },

  "color-palette-svg-exporter": {
    keywords: [
      "color palette svg exporter",
      "palette to svg",
      "svg swatch strip",
      "export palette as svg code",
    ],
    intro:
      "The color palette SVG exporter writes your palette as vector markup — one rectangle per colour — which you can copy or download as an .svg file.",
    content:
      "The color palette SVG exporter converts a palette into vector markup rather than pixels. Edit the list of colours and the tool produces an SVG document containing one rectangle per colour, laid out left to right, with each rectangle carrying its fill value. You can copy the markup or download it as a file, and because the output is text it behaves like text everywhere: it can be read, edited, reviewed in a diff and committed to a repository.\n\nThe markup is deliberately minimal:\n\n- The document declares the SVG namespace, sets a width and height, and includes a viewBox so the strip scales predictably.\n- Each rectangle is ninety-six pixels square and positioned at an x offset equal to its index multiplied by ninety-six, so the strip grows one cell at a time as colours are added.\n- There are no groups, no transforms and no embedded styles — just filled rectangles in document order, which keeps the file simple enough to hand-edit.\n\nThe reason to choose SVG over a raster export is resolution independence. A vector strip can be scaled to a hero banner or shrunk into a favicon without any loss of edge quality, which matters for anything that will be displayed at different sizes. Because it is text, it can also be inlined directly into an HTML document, which avoids a separate network request, or assigned as a CSS background image with the markup embedded as a data URI. Neither trick works with a PNG.\n\nThree uses come up repeatedly. Display assets, where a crisp strip is needed at an unpredictable size. Inline decoration, where a small vector block is cheaper than a round trip for an image. And generation, where a build step or a template needs markup it can assemble rather than a binary it has to bundle. In each case the value is that the artefact stays editable and diffable instead of being a frozen bitmap.\n\nThere are a few deliberate omissions:\n\n- The markup carries no text labels, so the hex values are not printed on the artwork and a viewer sees only the colours.\n- The layout is a single row of equal squares with no spacing, padding or borders, so gaps between the blocks are edits you make to the rectangles' coordinates.\n- Only rectangles are emitted, with nothing for rounded corners or gradients, which keeps the output legible but leaves styling to you.\n\nFor producing a colour SVG swatch strip, then, the tool is at its most useful as a starting point: generate the markup, then either take it as-is or open it and adjust. Copying the source rather than downloading a file is often the better habit, because the markup is short enough to read at a glance and small enough to paste straight into a stylesheet or a component, which is exactly where an editable vector artefact earns its keep. For a palette to svg conversion you intend to keep in a repository, the markup is the durable form: readable in review, diffable between changes and rebuildable at any size. And when someone asks you to export palette as svg code that they can edit themselves, that editability — not the file itself — is the real deliverable.",
    howTo: [
      { step: "Edit the palette until the colours are right." },
      { step: "Read the SVG markup beside it, which updates as the list changes." },
      { step: "Copy the markup or press Download .svg." },
      { step: "Adjust the rectangle coordinates or sizes in the markup when the layout needs changing." },
    ],
    whenToUse:
      "Use this exporter when you need a scalable, editable representation of a palette for the web or for version control. Use the PNG generator when a plain image is more convenient, and the labelled swatch export when the values must be visible. When a plain image is more convenient the {{color-palette-png-generator|PNG palette generator}} draws the strip as pixels, and when the codes have to be visible the {{color-swatch-png-generator|labelled swatch export}} prints them.",
    faqs: [
      {
        q: "What does the markup look like?",
        a: "An SVG document with the namespace, width, height and a viewBox, followed by one ninety-six pixel square rectangle per colour, each filled with its value and positioned left to right.",
      },
      {
        q: "Why use SVG instead of a PNG?",
        a: "A vector strip stays sharp at any size, and because it is text it can be inlined in HTML, embedded as a CSS background, reviewed in a diff and version-controlled.",
      },
      {
        q: "Are the hex codes printed on the artwork?",
        a: "No. The output is rectangles only, so the values are not shown. Add text elements yourself if the artwork needs to display them.",
      },
      {
        q: "Can I adjust the layout?",
        a: "Yes. The markup is short and plain, so the rectangle coordinates, sizes or spacing can be edited directly after copying it.",
      },
      {
        q: "Can the strip be scaled to any size?",
        a: "Yes. It is vector markup with a viewBox, so it stays crisp from a favicon up to a hero banner, and the file can be inlined into HTML or embedded as a CSS data URI.",
      },
    ],
  },

  "color-picker": {
    keywords: [
      "color picker",
      "pick a color online",
      "hex color picker",
      "color picker with recent colors",
    ],
    intro:
      "The color picker is a focused colour chooser with a large preview and a running row of the colors you have used recently, remembered in the browser between visits.",
    content:
      "The color picker is a deliberately small tool: choose a colour, see it, and get back to it. The left panel holds the chooser along with a large block filled with the current value, so you can judge the colour at a useful size rather than in a tiny input. The right panel is a grid called Recent, which fills with the colours you have settled on. It is the plainest of the picking tools, and most of its value sits in that Recent row rather than in the chooser itself, which is the part every colour picker has.\n\nThe history behaviour is worth describing precisely, because it is the one feature here that is not obvious:\n\n- Every colour you select is moved to the front of the list, and a value already in the list is repositioned rather than duplicated, so nothing appears twice.\n- The list is capped at twelve entries, and the oldest falls off the end as new ones arrive.\n- Clicking any swatch in the row loads it back into the chooser, which turns the row into a set of shortcuts rather than just a record.\n\nThat record persists between visits. The list is written to the browser's own local storage under a fixed key, and it is read back when the page loads. One small ordering detail protects the stored data: the component reads the saved list once on mount and only begins saving after that read has landed, so the initial default colour never overwrites history that was about to be restored. It is the kind of detail that is invisible when it is right and infuriating when it is wrong.\n\nThe practical case for the tool is iteration. When you are sampling and adjusting, the colour you want is very often the one you had thirty seconds ago, before you wandered two steps away from it. Having the last dozen candidates one click away removes a great deal of going backwards. It is equally useful when a colleague sends a value to try: set it, judge it, and it stays available in the row while you compare it against what came before.\n\nThere are limits, and they follow from how the storage works:\n\n- The history lives in one browser on one device, so it does not follow you to another machine or another browser, and clearing site data removes it.\n- There is no way to pin a colour permanently, because a twelve-item history is a working memory rather than a favourites list.\n- This picker cannot sample from anything: it has no eyedropper, no screen sampling and no image input, since those need their own tools.\n\nKeep it as a hex color picker with a short memory and it does its job well. Reach for the image colour picker when the value you want already exists in a picture, and the interactive wheel when you would rather explore harmonies than set one value. When what you need is simply to pick a color online, look at it large, and keep it close at hand, this is the one to open. It is a color picker with recent colors and nothing else, and that narrow promise is precisely why it stays out of the way.",
    howTo: [
      { step: "Set a colour with the chooser; the large block fills with the current value at a size you can judge." },
      { step: "Watch the Recent grid: each colour you settle on moves to the front, and the twelfth-oldest falls off the end." },
      { step: "Click any swatch in the row to load that colour back into the chooser." },
      { step: "Copy the hex value from the field when you are ready to use it." },
    ],
    whenToUse:
      "Use this picker when you are choosing and comparing individual colors and want the last few close to hand. Use the image color picker to sample from a picture, or the interactive wheel to explore relationships. Use the {{image-color-picker|image color picker}} when the value already exists in a picture, the {{screen-color-picker|screen color picker}} when it is on screen rather than in a file, and the {{color-picker-with-favorites|favorites picker}} when the set should be curated rather than merely recent.",
    faqs: [
      {
        q: "How many recent colors are kept?",
        a: "Twelve. Each new choice moves to the front of the list, so values you come back to stay within reach while the oldest drops off.",
      },
      {
        q: "Does the history survive a reload?",
        a: "Yes. It is stored in the browser's local storage and restored on load, with the save held back until the stored list has been read so it is not overwritten.",
      },
      {
        q: "Can I save favorites permanently?",
        a: "No. The list is a rolling history of twelve entries, not a pinned collection, and it is cleared if you clear the browser's site data.",
      },
      {
        q: "Can it pick a color from an image or the screen?",
        a: "No. This one is a plain chooser. The image color picker handles sampling from a picture, and there are separate tools for screen sampling.",
      },
      {
        q: "Does the recent row survive a page refresh?",
        a: "Yes. The list is written to the browser's local storage under a fixed key and read back on load; it is lost only when you clear site data or when the twelve-entry cap pushes old values out.",
      },
    ],
  },

  "color-preview-on-background": {
    keywords: [
      "color preview on background",
      "preview a color on a background",
      "color over background preview",
      "check a color against a background",
    ],
    intro:
      "The color preview on background places any color onto a background you choose, showing it as a filled block and as text so the pairing can be judged as it will really appear.",
    content:
      "The color preview on background is a two-input pairing check. You set a colour and a background, and the tool renders the two together at a size you can actually judge: a solid block of the colour sitting on the background, plus two lines of sample text in that same colour on that same surface. Beneath sits a readout of both values. It answers a question that is genuinely hard to settle from memory, which is whether a colour still works once it is surrounded by something else instead of sitting alone on a neutral swatch.\n\nThe reason a pairing has to be seen rather than reasoned about is that colour is judged relative to its surroundings. The same blue reads as bright against charcoal and as heavy against cream, and a mid grey that looks balanced on white can look almost black on a dark surface. Two values that seem identical when examined one at a time can shift in the company of a third, so the reliable way to preview a color on a background is to use the surface it will actually live on rather than an approximation.\n\nThe two parts of the sample are doing different jobs, and it is worth understanding which one you are reading:\n\n- The filled block is the colour as an area — a button, a panel, a chart series, a border — and shows whether the colour separates from its surroundings or quietly disappears into them.\n- The text lines show the same value used as type, at a heading size and at a body size, which is where pairings most often fail: thin strokes deliver far less of the colour to the eye than a solid area does.\n- A readout beneath the sample reports both values as hex, updating as you work.\n\nIn practice the background is the constraint, so set it first. If a design already fixes the surface — a cream page, a dark dashboard, a tinted panel over a photograph — then the question is not what the background should be but which foreground survives it, and fixing the surface first turns the tool into a search rather than a compromise. From there, tuning the colour is quick, because the sample updates as you work and both values stay visible as hex. Ordering a color over background preview this way also makes it obvious early when no single colour will do and the surface itself has to move.\n\nWhat it will not do is grade the result:\n\n- No contrast ratio is shown, so the tool will cheerfully display a pairing that is technically unreadable and the judgement stays with you.\n- One pairing at a time — comparing three candidates means three separate passes rather than a row of alternatives.\n- Both inputs are colours rather than arbitrary CSS, which places gradients and other background syntaxes outside its scope.\n\nWhich leaves the question of when to reach for it. It is at its best whenever a colour and a surface have to be chosen together: picking an accent that must hold up on an existing brand background, checking that a new section fill does not swallow its own text, or settling a subtle border that only reads if it sits a shade or two off the surface. Because it shows the pairing in context and nothing else, it is the fastest way to check a color against a background before that combination is committed to a token file, and the block-plus-text sample covers the two ways a colour is almost always used.",
    howTo: [
      { step: "Set the background first, since the surface is usually the constraint the pairing has to survive." },
      { step: "Set the colour you are testing as the foreground value." },
      { step: "Judge the filled block for area use and the two text lines for type use." },
      { step: "Read both hex values from the pairing card and copy whichever one you need." },
    ],
    whenToUse:
      "Use this preview when a color and a surface have to be chosen together and the result needs judging by eye. Use a contrast checker when you need the ratio, and the format validator when you want an explicit valid or invalid verdict. For the ratio itself use the {{contrast-checker|contrast checker}}, and for a single CSS background value the {{css-background-color-preview|CSS background preview}} renders it without a foreground colour to pair against.",
    faqs: [
      {
        q: "How do I set the two colors?",
        a: "Both are color fields, so you can type a hex value or pick by eye. The pairing panel then records both values so the combination can be copied exactly.",
      },
      {
        q: "Does the preview tell me whether the text is readable?",
        a: "Only visually. No contrast ratio is calculated, so a pairing that is technically unreadable will still render happily. Use a contrast checker when you need the number.",
      },
      {
        q: "Can I put a gradient behind the color?",
        a: "No. Both inputs are single colors rather than arbitrary CSS, so gradients and other background syntaxes are outside its scope. The single-value CSS previewer covers those.",
      },
      {
        q: "Can I compare several candidates at once?",
        a: "No. One pairing is shown at a time, so comparing three candidates means three separate passes rather than a single row of alternatives.",
      },
      {
        q: "Does it tell me whether the pairing is readable?",
        a: "No. No contrast ratio is shown, so the judgement stays with you; a pass or fail verdict is what the contrast checkers are for.",
      },
    ],
  },
};
