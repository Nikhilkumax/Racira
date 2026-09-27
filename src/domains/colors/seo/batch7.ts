import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 7 (alphabetical slugs 62-68).
 *
 * This window was unblocked by the registry repairs: color-naming-challenge now
 * renders a real ColorNamingChallenge quiz, color-swatch/PNG/SVG/CSV exporters
 * render distinct artefacts, and the game slugs render real games.
 *
 * Skipped from this window:
 *  - color-naming-history-tool — flagged in the logic audit; still renders the
 *    generic HtmlColorReference component rather than a naming history.
 *  - color-object-generator — renders the same ColorJsonGenerator as the
 *    already-authored color-json-generator, so it would duplicate that page.
 */
export const SEO_BATCH_7: Record<string, ToolSeo> = {

  "color-of-the-year-browser": {
    keywords: [
      "color of the year",
      "color of the year list",
      "annual color trends by year",
      "color of the year names and hex",
    ],
    intro:
      "The color of the year browser lays out recent annual color picks as a swatch grid, each card showing the year, the name and its hex value.",
    content:
      "The color of the year browser is a compact reference grid of recent annual color picks. Each card carries a large swatch, the year it was announced, the name attached to it, and the hex value, so you can read the whole recent run in one screen rather than hunting through archives. The current set runs from 2020 onward: Classic Blue, then Illuminating and Ultimate Gray, then Very Peri, Viva Magenta, Peach Fuzz, Mocha Mousse and Future Dusk. Because every card states its hex, the grid doubles as a source of copy-ready values.\n\nOne detail in the layout is deliberate rather than a duplication error. The 2021 entry appears as two cards, because that year was announced as a pair: a bright yellow and a neutral grey, intended to be used together. Showing both keeps the grid faithful to what was actually published, and it is a useful reminder that an annual colour is sometimes a combination rather than a single swatch.\n\nUse it when you want a palette to feel of its moment rather than timeless. Starting a moodboard from a recent pick gives a design a defensible anchor, and pairing the year's shade with its neutral partner is often enough to build a working scheme. It is equally useful for the reverse question: when a client references a shade by name from a particular year, the grid tells you immediately which colour they mean and gives you the value to work with instead of a guess.\n\n- The practical workflow is to lift the hex and carry it into the rest of the toolkit.\n- Take a value into the shade and tint generators to build a ramp, check it as a text colour with a contrast checker before using it on a surface, or feed it into the palette tools to see how it sits beside your existing brand colours.\n- Because the grid only shows a swatch, a name and a code, there is nothing to configure and no state to reset.\n\n- It is worth being precise about the limits, because colour-of-the-year announcements are easy to overstate.\n- The data here is a fixed, hand-maintained list rather than a live feed; adding a new year means editing the set, so a very recent announcement may not appear immediately.\n- The window covered is recent years only, not the full history of the idea.\n- And these are industry colour announcements rather than any kind of standard, so nothing about a shade is more correct because a company named it; treat the set as a cultural reference, not a specification.\n\nTwo nearby tools answer different questions. If you want to see how a colour has drifted in popularity rather than which single shade was named, the trend analyzer is the better fit, since it looks at movement over time rather than a discrete pick. And if you need to identify an arbitrary colour rather than look up a known one, the naming and lookup tools do that.\n\nAs a color of the year list the grid is intentionally shallow and wide: eight or nine entries, each fully described in three fields. That is enough to browse in seconds, to copy a value you need, or to sanity-check a name you half-remember. If you are building a case for a particular direction, the value of the list is that it gives you a defensible cultural reference point and an exact color of the year names and hex values to quote, which is usually all a moodboard needs before the real palette work starts. Read end to end the grid is also a short history of annual color trends by year, and that is the simplest way to use it.",
    howTo: [
      { step: "Scan the grid: each card carries the year, the colour's name and its hex value." },
      { step: "Read the sequence to see how the picks moved between 2020 and 2026." },
      { step: "Copy the hex of the year that fits the brief." },
      { step: "Treat the list as curated rather than live — the newest entry on the page is 2026." },
    ],
    whenToUse:
      "Use this browser when you want a recent annual color pick by name, year or hex. Use the trend analyzer for movement over time, and the color name lookup to identify an arbitrary value. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Why are there two cards for 2021?",
        a: "That year's pick was announced as a pair, a bright yellow alongside a neutral grey intended to be used together. Both are shown so the grid matches what was published.",
      },
      {
        q: "Does the list update automatically?",
        a: "No. It is a fixed, hand-maintained set of entries covering recent years, so a brand new announcement may not be present until the data is edited.",
      },
      {
        q: "Are these official standards?",
        a: "No. They are industry colour announcements. The values are exact, but nothing is more authoritative simply because a company named it — treat them as cultural references.",
      },
      {
        q: "Can I use the colors in a project?",
        a: "Yes. Each card shows its hex, so you can copy it into a palette, a ramp generator or a contrast check like any other value.",
      },
      {
        q: "What does the color of the year browser not do?",
        a: "The data here is a fixed, hand-maintained list rather than a live feed; adding a new year means editing the set, so a very recent announcement may not appear immediately. The window covered is recent years only, not the full history of the idea. And these are industry colour announcements rather than any kind of standa",
      },
    ],
  },

  "color-overlay-generator": {
    keywords: [
      "color overlay generator",
      "image color overlay",
      "mix blend mode preview",
      "tint a photo with css blend modes",
    ],
    intro:
      "The color overlay generator lays a colored layer over your image with thirteen CSS blend modes and an opacity slider, previewing exactly what the browser will render.",
    content:
      "The color overlay generator puts a colored layer over an image and lets you tune it until it looks right. Drop in a picture, choose an overlay color, set an opacity from zero to one hundred percent, and pick one of thirteen blend modes; the preview updates as you change anything. It answers a question that comes up constantly in layout work, which is what a photograph looks like when a brand color is washed across it, without you having to write the CSS first and refresh a page to find out. Treat it as a live mix blend mode preview and the workflow makes sense: every adjustment is rendered immediately, by the same engine that will render it in production.\n\nThe blend modes are the browser's own, not an approximation of them: multiply, screen, overlay, darken, lighten, color-dodge, color-burn, difference, exclusion, hue, saturation, color and luminosity. The preview applies your color as a layer with the chosen mode, so what you see on screen is what the same declaration renders in a stylesheet. That fidelity is the whole reason to do the experiment here rather than in an image editor, because an editor's blend maths can differ slightly from the browser's.\n\nThe modes fall into recognisable families. Multiply darkens and tints, which is why it is the usual default for a header image that needs to sit behind white text. Screen goes the other way and lightens. Overlay and soft-contrast modes increase contrast by pushing midtones apart. The four that move colour rather than tone are the interesting ones: hue, saturation, color and luminosity each transplant one property of your overlay while keeping others from the photograph. Choosing color, for example, keeps the photo's luminance — its texture, highlights and shadows — while adopting the overlay's hue and saturation, which is the classic way to tint an image without losing detail.\n\nOpacity and blend mode do different jobs, and separating them helps. The mode decides the formula, and the opacity decides how much of that result you actually see, from nothing at zero percent to the full effect at one hundred. Starting with multiply at around forty percent is a sensible first pass for a hero image; if the tint looks flat, the colour modes often give a richer result at a similar strength. Replacing the image resets to the dropzone without losing your settings.\n\n- The main limit is that this is a preview rather than an exporter.\n- There is no CSS snippet and no download button, so the way to capture the effect is to note the three settings and write them yourself, or take a screenshot.\n- That is worth knowing before you invest time in fine-tuning.\n\nIt is also worth remembering that a blended overlay is a rendering effect, not a change to the pixels. The original file is untouched, which is good for reuse but means you cannot export a flattened result from here. If you need the image itself modified rather than a layer over it, an image recolouring tool is the right kind of tool.\n\n- Used as an image color overlay experiment, it is fast and honest: pick a value, drag the opacity, cycle the modes, and settle on the pairing that keeps the subject readable.\n- The three settings are all a stylesheet needs, which makes this a cheap way to explore an effect that is otherwise fiddly to iterate on.\n- It pairs naturally with the duotone generator when two colours are wanted rather than one, and with a contrast checker when the overlaid image has to carry text on top.\n- If the aim is to tint a photo with css blend modes and then reproduce the effect in a stylesheet, the three settings shown here are the entire recipe.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Choose the overlay colour with the colour field." },
      { step: "Set the overlay's opacity with the slider." },
      { step: "Pick a blend mode and judge the result in the preview." },
    ],
    whenToUse:
      "Use this tool to preview how an overlay color and blend mode will look over an image before writing the CSS. Use an image recolouring tool when the pixels themselves need to change. When the effect should be a whole-image treatment rather than a layer, the {{duotone-generator|duotone generator}} maps the photograph onto two colours, and a tint that only has to fade is the {{transparent-gradient-generator|transparent gradient generator}}'s scrim.",
    faqs: [
      {
        q: "How many blend modes are available?",
        a: "Thirteen: multiply, screen, overlay, darken, lighten, color-dodge, color-burn, difference, exclusion, hue, saturation, color and luminosity.",
      },
      {
        q: "Does it export CSS?",
        a: "No. It is a live preview, so the output is what you see on screen. Note the color, opacity and mode, then write the declaration yourself.",
      },
      {
        q: "Which mode should I use to tint a photo without losing detail?",
        a: "The color mode. It keeps the photograph's luminance and takes the overlay's hue and saturation, so texture and contrast survive the tint.",
      },
      {
        q: "Does it change my original image?",
        a: "No. The overlay is a rendering layer placed over the image, so the file on your disk is untouched.",
      },
      {
        q: "Which comes first, the blend mode or the opacity?",
        a: "The mode decides how the layer and the image combine; opacity decides how much of that result shows. So pick the mode for character and use opacity for strength — a mode that already darkens does not need much opacity to go too far.",
      },
    ],
  },

  "color-palette-css-exporter": {
    keywords: [
      "color palette css exporter",
      "palette to css variables",
      "css color variables generator",
      "export palette as css",
    ],
    intro:
      "The color palette CSS exporter turns an editable palette into a ready-to-paste :root block of numbered custom properties, one declaration per color.",
    content:
      "The color palette CSS exporter edits a palette and writes the CSS custom properties for it. You keep a list of colors — add, remove, or adjust any of them — and the output beside it is a :root block containing one declaration per color, numbered from one, with the hex value uppercased. A copy button lifts the whole block onto the clipboard. It is the shortest route from a set of colors you have chosen to a stylesheet that can reference them by name, turning a palette to css variables with no hand editing at all.\n\nThe output shape is deliberately plain:\n\n- A :root block with one declaration per colour, numbered from one.\n- Each declaration indented two spaces for readability in a diff, with property names following the numbered pattern --brand-1, --brand-2 and upward.\n- Every value a six-digit hex, with no comments, no fallbacks and no nested theme blocks, so the block pastes directly into a stylesheet, a CSS-in-JS template or a build step that concatenates stylesheets.\n\nThe reason to put colors in custom properties rather than writing the values inline is maintenance. A literal repeated in twelve places has to be found and changed twelve times, and the risk is that one gets missed and the interface develops a slightly-off shade that nobody can quite explain. A variable changes once. That matters most when a theme swaps: if every surface and accent reads from a property, switching palettes is a matter of redefining the block rather than rewriting rules. It is also what makes runtime theming on a website practical at all.\n\nNaming is the one thing the tool cannot decide for you. It emits numbered names because it has no idea what the colors are for, and numbered names are a poor long-term choice: a property called brand dash three tells a future reader nothing about whether it is a border or a call to action. The sensible workflow is to take the generated block as a starting point and rename each declaration to the role it serves, because role-based names survive a rebrand while appearance-based ones do not.\n\nBecause the palette editor is live, iterating is cheap: adjust a color and the declaration updates immediately, so you can paste, preview and paste again. That makes it useful early in a project, when the palette is still moving, and later when a single shade needs nudging. If the target is not plain CSS but a framework config, the design token generator produces a structured object instead, and if the goal is JSON data rather than stylesheet declarations, the JSON exporter covers that direction.\n\nA few things are intentionally out of scope:\n\n- The block declares a single set of properties, with no light-and-dark variants, no media queries and no alpha handling.\n- Property names are numbered rather than role-based, because the tool has no idea what the colors are for, so renaming each declaration to the role it serves happens in the stylesheet and is what makes the names survive a rebrand.\n- Theme architecture is yours to wrap around the leaf declarations.\n\nNothing more is claimed for it than that: it is a css color variables generator rather than a theme architecture, and when the requirement is simply to export palette as css declarations that paste cleanly, that narrowness is exactly the feature.",
    howTo: [
      { step: "Edit the palette in the left-hand card until the values are right." },
      { step: "Read the :root block beside it — each change updates the declarations immediately." },
      { step: "Copy the block into a stylesheet, a CSS-in-JS template or a build step." },
      { step: "Rename the numbered properties to the roles they serve before committing." },
    ],
    whenToUse:
      "Use this exporter when you want a palette as a paste-ready block of CSS custom properties. Use the design token generator when the target is a token object, and the JSON exporter when you need data rather than declarations. When the target is a token object rather than declarations the {{design-token-generator|design token generator}} produces the structured shape, and for data rather than a stylesheet the {{color-palette-json-exporter|JSON exporter}} is the match.",
    faqs: [
      {
        q: "What exactly does the output look like?",
        a: "A colon-root block with one custom property per color, indented for readability, each value an uppercase six-digit hex, and a copy button for the whole block.",
      },
      {
        q: "Can I rename the properties?",
        a: "The tool emits numbered names because it does not know each color's role. Take the block as a starting point and rename the declarations to the roles they serve.",
      },
      {
        q: "Does it generate light and dark themes?",
        a: "No. It produces one flat set of declarations. Wrapping them in media queries or theme selectors is a project-level decision left to you.",
      },
      {
        q: "Why use variables instead of the hex values directly?",
        a: "A color written once can be changed once. Variables also make theme swapping and runtime theming practical, because every consumer follows the declaration.",
      },
      {
        q: "Can I generate light and dark variants in one go?",
        a: "No. The block declares a single set of properties; theme variants, media queries and alpha handling are decisions about how a project structures themes, so those wrappers are added around the exported declarations.",
      },
    ],
  },

  "color-palette-extractor": {
    keywords: [
      "color palette extractor",
      "extract colors from image",
      "image to color palette",
      "get palette from photo",
    ],
    intro:
      "The color palette extractor clusters the pixels of any uploaded image into a palette of two to sixteen representative colors, chosen with a slider.",
    content:
      "The color palette extractor pulls a working palette out of any image. Upload a picture and it returns a grid of swatches representing the colors the image is actually made of, with a slider to choose anywhere between two and sixteen entries and a preview of the source beside them. It is the answer to a very common starting problem: you have a photograph, a logo or a piece of reference art whose mood you want to keep, and you need that mood expressed as a handful of values you can build with. It is the quickest way to extract colors from image files you already own, instead of squinting at a screenshot and guessing at hex values.\n\nThe extraction is clustering rather than counting. The image is scaled down, its pixels are grouped into the number of clusters you requested, and each cluster's centre becomes one entry in the palette. The consequence is worth understanding: this finds the colors an image is made of, not the colors it contains most of. A small, vivid accent and a large expanse of neutrals can each earn a place in the palette, which is usually what you want for design work but is not the same as a frequency chart. If you specifically need proportions, a percentage breakdown of the same image is a different question.\n\nChoosing the number of colors is the only real decision:\n\n- A slider sets anywhere between two and sixteen entries, with five or six the sweet spot for most purposes — enough variety to build a scheme, few enough that the result still reads as a set.\n- Raising the count starts pulling out accents that the smaller palette averaged away, which is useful when a highlight color is needed.\n- Pushing it much higher has diminishing returns, because a photograph contains gradients rather than a fixed set of swatches, and the extra clusters end up splitting near-identical neighbours that look like duplicates on screen.\n\nA few mechanics are worth knowing because they explain surprising results:\n\n- The image is sampled at reduced size before clustering, so fine detail such as thin lines or text can be lost, and a colour that occupies a few pixels may not appear at all.\n- Pixels that are mostly transparent are skipped entirely, which is why a logo with a soft alpha edge produces a palette of its visible content rather than a muddied set including the invisible area.\n- The clustering is deterministic for a given image and count, so reopening the same file gives you the same palette rather than a slightly different one each time.\n\nThe obvious use is brand extraction: feeding a logo through to find the colors it implies, then reusing them consistently. It is just as useful for matching an interface to an existing photograph, for turning a moodboard into a starting palette, or for checking whether two images from a set are actually compatible in colour. Where the extracted values land in a design system is a separate decision, and the shade and tint generators are the natural next step for building a ramp around a chosen entry.\n\nTwo limits follow from what the clustering can and cannot know:\n\n- The output is a set of colours with no roles attached — nothing tells you which should be a background and which an accent.\n- An extracted palette is therefore a raw material rather than a finished scheme, and the roles and contrast checks come after it.\n\nUsed as an image to color palette starting point it does its job quickly and without ceremony: upload, adjust the count, and you have a set of values that genuinely belong to the image you started with, ready to be assigned roles and hardened with contrast checks. That is a far better beginning than guessing at colors by eye, which is exactly what makes it a dependable route to get palette from photo reference material.",
    howTo: [
      { step: "Drop an image onto the upload area; the source is previewed beside the result." },
      { step: "Set the number of colours with the slider — anywhere between two and sixteen." },
      { step: "Read the swatch grid, and raise the count when a highlight colour was averaged away." },
      { step: "Copy the hex values you want to build with." },
    ],
    whenToUse:
      "Use the extractor to derive a starting palette from a photograph, logo or moodboard image. Use the dominant color finder when you need a single representative value, and the percentage analyzer when you need proportions. When you need a single representative value the {{dominant-color-finder|dominant color finder}} answers that question, the {{color-histogram|color histogram}} gives proportions rather than a set, and the {{color-shades-generator|shade generator}} builds a ramp around a chosen entry.",
    faqs: [
      {
        q: "How many colors can I extract?",
        a: "Between two and sixteen, set with a slider. Five or six is the usual sweet spot; higher counts start splitting near-identical neighbours.",
      },
      {
        q: "Does it report how much of the image each color covers?",
        a: "No. The palette is built by clustering pixels, so it shows which colors the image is made of rather than what proportion each occupies.",
      },
      {
        q: "Why is a color I can see missing?",
        a: "The image is sampled at reduced size and mostly transparent pixels are skipped, so a tiny detail or a faint area may not survive into the palette.",
      },
      {
        q: "Will I get the same palette if I re-upload the image?",
        a: "Yes. The clustering is deterministic for a given image and color count, so the same file produces the same palette each time.",
      },
      {
        q: "How do I choose the number of colors?",
        a: "Five or six is the sweet spot for most purposes. Raising the count pulls out accents a smaller palette averaged away, which helps when a highlight colour is needed; pushing it much higher splits near-identical neighbours that look like duplicates on screen.",
      },
    ],
  },
};
