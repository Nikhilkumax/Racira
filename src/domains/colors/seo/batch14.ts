import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 14.
 *
 * Skipped from this window:
 *  - daily-color-generator / daily-color-palette-generator — flagged in the audit;
 *    the first renders the plain random-hex grid and the second the random palette
 *    generator, neither of which is day-scoped despite the name.
 *  - deuteranomaly-simulator — flagged, and it renders the identical CVDPreview as
 *    the authored deuteranopia-simulator.
 *  - earth-tone-palette-generator — renders the identical earth palette component as
 *    earth-tone-color-generator (authored here). One of the pair has to lose; the
 *    loser is a good candidate for a differentiating prop on the shared factory.
 *  - emotion-color-finder — the slug promises colour-emotion associations (joy →
 *    yellow), but the component derives its palette from a string hash of the
 *    emotion name, so "Joy" yields arbitrary hues with no relation to the emotion.
 *    Skipped as a slug/behaviour mismatch worth a real Plutchik-style implementation.
 */
export const SEO_BATCH_14: Record<string, ToolSeo> = {
  "dark-mode-palette-generator": {
    keywords: [
      "dark mode palette generator",
      "dark ui color palette",
      "near black surfaces",
      "dark theme colors",
    ],
    intro:
      "The dark mode palette generator produces five near-black and deep-tinted surfaces from a fixed blue-violet run with lightness between 0.15 and 0.4 — a dark ui color palette, not an accent set.",
    content:
      "Dark interfaces are built from surfaces, and surfaces are where most dark themes go wrong: pure black flattens elevation and makes every layer look identical. This preset addresses that directly. Dark theme colors are generated from five blue-leaning hues — 220, 240, 260, 200 and 280 — with lightness climbing a narrow ramp from 0.15 to 0.4 and chroma rolled between 0.04 and 0.12, which is enough tint to separate layers without the surfaces reading as colours in their own right.\n\n- Hues: blue at 220, indigo at 240, violet at 260, cyan-blue at 200 and purple at 280.\n- Lightness: 0.15, 0.2125, 0.275, 0.3375 and 0.4 — five usable depth levels.\n- Chroma: rolled per swatch inside 0.04 to 0.12, keeping the tint subtle.\n- Output: five hex swatches and a copyable CSS custom-property block.\n\nA cast of a few degrees of blue or violet is what keeps near black surfaces from looking muddy, and it is also why dark themes are usually built on a tinted rather than a neutral base: pure greys sit beside each other ambiguously, while even a low-chroma tint gives the eye something to anchor elevation to. The ramp's five levels map naturally onto a surface ladder — page, panel, card, raised control, hover — which is the structure a dark ui color palette is actually for.\n\n- It supplies surfaces only. Text colours, accent colours and status colours all have to come from somewhere else.\n- Nothing in the set is dark enough to be a shadow and nothing is light enough to be a divider; both are separate jobs.\n- Chroma is low by design, so any colour used as an accent will need checking against every one of the five surfaces it might sit on.\n- No preset selector, no alpha and no theme tokens beyond the hex custom properties.\n\nChoosing between the five levels is easier if they are named before they are used. A dark mode palette generator of this design works best with the ramp mapped explicitly — surface, raised surface, control, overlay, emphasis — because names survive a redesign while hex values do not, and because a dark theme with unnamed levels drifts a little every time someone adds a component.\n\nUse it as the base layer of a dark theme and build the rest deliberately: pick one accent, confirm it passes against the lightest and darkest surfaces in the strip with the contrast checker, and keep text near-white rather than pure white so the surfaces retain a visible hierarchy. The light-mode generator is the mirror image of this page for a bright interface, the neon generator supplies the accents this palette is designed to carry, and the shade tools extend the ladder if five levels are not enough. Keep the palette honest as the theme grows: every new surface should come from the ramp rather than from a fresh guess. Five values cover most interfaces; a sixth needs a reason rather than a habit.",
    howTo: [
      { step: "Open the page and read the five surface levels, darkest first." },
      { step: "Press Regenerate to re-roll the tint chroma while the depth ramp stays fixed." },
      { step: "Assign the levels to page, panel, card, control and hover states in that order." },
      { step: "Check any accent or text colour against both the darkest and the lightest surfaces." },
    ],
    whenToUse:
      "Use this as the surface base of a dark interface. The {{light-mode-palette-generator|light mode palette generator}} is the mirror for bright themes, the {{neon-palette-generator|neon palette generator}} supplies the accents these surfaces are built to carry, and the {{contrast-checker|contrast checker}} settles which text colour survives on each level.",
    faqs: [
      {
        q: "Why not just use pure black for a dark theme?",
        a: "Because black gives elevation nothing to work with: every layer looks the same, and shadows have no room to read. A tinted near-black at lightness 0.15 keeps depth visible.",
      },
      {
        q: "How do I map five swatches onto an interface?",
        a: "Treat them as a surface ladder — page, panel, card, raised control and hover — from the darkest to the lightest. The ramp was designed to give that many levels.",
      },
      {
        q: "Does the palette include text or accent colours?",
        a: "No. It is surfaces only, so text, accents and status colours have to be chosen and verified separately against these five values.",
      },
      {
        q: "Why is there a blue or violet tint rather than a neutral grey?",
        a: "Tinted darks separate from one another more clearly than greys of the same lightness, which makes elevation legible without raising contrast.",
      },
      {
        q: "Can I use a saturated accent on these surfaces?",
        a: "Yes, and low-chroma darks are ideal backdrops for one, but check the accent against the lightest surface as well as the darkest — mid-level surfaces are where contrast usually breaks.",
      },
    ],
  },

  "design-token-generator": {
    keywords: [
      "design token generator",
      "w3c design tokens",
      "color tokens json",
      "design tokens color",
      "export design tokens",
    ],
    intro:
      "The design token generator exports a palette as a W3C design tokens JSON document, wrapping each colour as a named token with its value and type so it can be fed into a token pipeline.",
    content:
      "The design token generator pairs a palette editor with a JSON output panel, and the document it writes is the W3C design tokens shape that transform pipelines are built to consume. The editor starts with five colours and gives each one a colour field and a delete button, plus an Add color button that appends a randomly seeded swatch. Every edit is reflected immediately in the panel beside it, which renders the full token document, and a copy button takes the whole thing.\n\n- The structure of the output is a single color group whose keys are positional — brand-1 through brand-5 for the default five, extending as you add colours.\n- Each entry is an object carrying the colour in upper-case hex as its value and the string color as its type.\n- That shape is what the design token format is for: the type tells a consuming pipeline that this token is a colour, so it can be transformed into the right output for each target platform rather than being treated as an opaque string.\n\nOne detail is worth checking against your own pipeline before you paste. The emitted keys are the bare value and type pair, whereas the current draft of the format module prefixes these with a dollar sign, using $value and $type. Many toolchains accept both forms, but stricter ones — and the newer releases of the common transform libraries built around the draft — expect the prefixed spelling. If your build complains that a token has no value, that single character is usually the reason.\n\nNames are the other thing to decide rather than accept. Positional keys are excellent for a first pass, because you get a valid document in seconds, and poor for a long-lived token set, because brand-3 tells a future reader nothing. The usual fix is to rename after generation: --primary becomes color.primary or color.brand.primary in the document, and the group structure does most of the work of organising them. Since the type is declared once per token, a rename is safe.\n\nIn use, this fits neatly between a palette and a repository. Generate or paste in the colours, copy the document into a tokens file, and let the build step turn it into CSS variables, platform constants or a theme object. With five colours regenerated per session it is also a quick way to see whether a palette has enough spread: five entries that differ only in lightness will look repetitive in the JSON, which is a useful early signal that the palette needs more range.\n\n- What it does not do is scoped or nested tokens, gradients, numeric scales or the other token types a full design system eventually needs — this is a colour exporter, and every entry has the same type.\n- There is no validation of the output beyond well-formed JSON, and the group name is fixed at color.\n- Within those limits, the fastest way to export design tokens from a palette is right here: build the set, copy the design tokens color document, and adjust the keys to match your naming convention on the way through — and if it is color tokens json you need rather than a broader token set, that narrowing is an advantage, since the document stays small, valid and immediately transformable.",
    howTo: [
      { step: "Edit the five starting colours, or add more with Add color." },
      { step: "Watch the design tokens panel regenerate on every change." },
      { step: "Copy the JSON document into your tokens file." },
      { step: "Rename the positional keys and add the dollar prefix to value and type if your pipeline expects it." },
    ],
    whenToUse:
      "Use this when a palette needs to leave the browser as a machine-readable token document. Use the CSS variables exporter when you only need custom properties, or the SCSS and LESS generators for preprocessor variables. When the keys should be meaningful names you type rather than positional ones, the {{figma-token-generator|figma token generator}} produces that variant of the same document, and a lighter token shape for a smaller job is the {{color-token-generator|color token generator}}'s output.",
    faqs: [
      {
        q: "What token shape does it emit?",
        a: "A single color group whose keys are positional — brand-1, brand-2 and so on — each holding the hexadecimal value and the type color.",
      },
      {
        q: "Why does my token pipeline reject the output?",
        a: "Likely the key spelling. The generator writes value and type; the current draft of the format prefixes them with a dollar sign as $value and $type. Add the prefix if your toolchain expects the newer form.",
      },
      {
        q: "Can the token names be changed?",
        a: "Not inside the tool — keys are generated from position. Rename them in the copied document; the group structure is unchanged by a rename.",
      },
      {
        q: "Does it support token types other than color?",
        a: "No. Every entry is declared as a color, which is the point of the page. Spacing, typography and numeric scales are outside its scope.",
      },
      {
        q: "Is the JSON pretty-printed or minified?",
        a: "Pretty-printed with two-space indentation, so the file can be read and diffed in review. A pipeline can minify it later without any change to the structure.",
      },
    ],
  },

  "deuteranopia-simulator": {
    keywords: [
      "deuteranopia simulator",
      "green cone simulation",
      "deuteranopia hex",
      "cvd deuteranopia",
    ],
    intro:
      "Deuteranopia Simulator shows a color beside the same color as a deuteranopic viewer would see it, using the deuteranopia matrix the tool's engine applies.",
    content:
      "Deuteranopia Simulator takes one color and renders it twice: once untouched, and once as a deuteranopic viewer would see it. The two large swatches sit side by side, so the answer to the only question the page asks is impossible to miss, and the hex value of the simulated result is there when you need to record it.\n\nDeuteranopia is the absence of the medium-wavelength cone, and it is the most common of the complete deficiencies. What it removes is the separation between red and green, which means:\n\n- Reds and greens converge on a similar yellowish tone, and the distinction between them largely disappears.\n- Hues that sit between red and green, such as oranges and browns, shift rather than vanish, because their luminance is still doing work.\n- Blues and yellows are largely unaffected, since they depend on the short-wavelength cone instead.\n- Lightness is preserved throughout, which is why a well-designed palette can survive this deficiency purely on luminance.\n\nThe simulated swatch is produced by a fixed three-by-three matrix applied to the 8-bit red, green and blue channels. Its first row is 0.625 red plus 0.375 green, its second is 0.7 red plus 0.3 green, and its third is 0.3 green plus 0.7 blue. The results are clamped back into the 0 to 255 range, and the output is converted to hex so it can be copied directly. That matrix is an approximation of how deuteranopia is typically modelled, not a measurement of any individual's vision, and it is applied at full strength with no severity control.\n\nBecause the page is built around a single comparison, its boundaries are narrow.\n\n- Only deuteranopia is simulated. Other deficiencies need their own pages or the multi-type simulator.\n- The view is one color at a time. A palette has to be checked color by color.\n- There is no image mode, so a screenshot cannot be run through this matrix here.\n- Full strength only, with no slider for the partial form that deuteranomaly describes.\n- The simulated swatch is what the matrix produces, not a prediction of what a specific person will perceive.\n\nUse this page when red and green are both load-bearing in a design, which is the situation deuteranopia punishes most. Compare the swatch pair, then look at the hex value of the simulated color and ask whether it sits far enough from its neighbours in lightness. If the two swatches differ mainly in hue and barely in lightness, that is the case worth fixing, because lightness is the only channel this deficiency reliably leaves intact.\n\nAs a green cone simulation the page is narrow on purpose: it converts one color once and shows the result, rather than ranking a palette or scoring a design. That makes the deuteranopia hex value printed beneath the swatch the most portable output it produces, and it is worth copying for any color destined for a dark surface or a print run. What the page cannot say is whether the conversion is acceptable in context, since a cvd deuteranopia result that looks fine in isolation can still collapse against a neighbouring color in a real chart.",
    howTo: [
      { step: "Enter the color you want to test in the swatch field." },
      { step: "Read the two large swatches side by side, with the original labelled on the left and the simulated result on the right." },
      { step: "Note the hex value printed under the simulated swatch if you need to record the result." },
      { step: "Compare the lightness of the simulated color with the other colors it will sit next to, since that is the channel deuteranopia leaves working." },
    ],
    whenToUse:
      "Use the deuteranopia simulator when red and green both carry meaning in a design and you want the single most common deficiency checked directly. The partial form is covered by the {{deuteranomaly-simulator|deuteranomaly simulator}}, the other complete deficiency that affects red and green is the {{protanopia-simulator|protanopia simulator}}, all four types together including the image mode are on the {{color-blindness-simulator|color blindness simulator}}, and choosing colors that survive the problem in the first place is the {{color-blind-friendly-color-picker|color blind friendly color picker}}.",
    faqs: [
      {
        q: "How common is deuteranopia?",
        a: "It is the most common complete deficiency, affecting roughly one in a hundred men and a much smaller share of women. The partial form, deuteranomaly, is considerably more common still, which is why the two are often discussed together.",
      },
      {
        q: "Does the simulation account for severity?",
        a: "No. The matrix is applied at full strength, so the result shows a complete absence of the medium-wavelength cone rather than a graded reduction. Someone with a mild anomaly will typically see more color than the swatch suggests.",
      },
      {
        q: "Why do red and green look different after the simulation rather than disappearing?",
        a: "Because they do not vanish, they converge. Both end up nearer a yellowish tone, and what remains of the difference is mainly their luminance. That is why the practical fix is to separate colors in lightness rather than trying to find a hue that survives.",
      },
      {
        q: "Can I paste the simulated hex value into a design file?",
        a: "Yes, the value is printed in hex for that purpose. Treat it as a reference for how the color is modelled rather than as a color to ship, since it describes a simulation rather than a target for your palette.",
      },
      {
        q: "Does this page check whether my interface is usable?",
        a: "No. It converts one color and shows the result. Whether a chart, legend or status indicator still works once that conversion is applied depends on the whole set of colors, which is easier to judge with the multi-type simulator over a real screen.",
      },
    ],
  },

  "dominant-color-finder": {
    keywords: [
      "dominant color finder",
      "find dominant color of image",
      "extract dominant color",
      "image dominant color",
      "most common color in image",
    ],
    intro:
      "The dominant color finder extracts the single most common color from an image by counting its pixels into quantised buckets and returning the mean of the largest one.",
    content:
      "- The dominant color finder is a one-drop tool.\n- Upload an image and it returns a single swatch labelled Dominant, with the hex value underneath and a copy button beside it.\n- A Replace image button resets the state so another file can be measured.\n- There are no settings to adjust, because the question — what colour does this image mostly consist of — has one answer.\n\nGetting that answer right is more interesting than it sounds, because there are two plausible readings of the phrase and they behave very differently when you set out to find dominant color of image data. One is to average every pixel. That is easy, and it is usually wrong for the purpose: averaging a photograph blends the sky, the subject and the shadows into a muddy mid-tone that appears nowhere in the picture. The other reading, which is what this tool does, is to count how much of the image each colour occupies and return the most popular one.\n\nThe counting is done by quantising. Each channel is reduced to five bits — thirty-two levels instead of two hundred and fifty-six — and every pixel is filed into a bucket keyed by its quantised colour. The largest bucket wins, and the swatch shows the mean of the actual pixel values that landed there, so the result is a true colour from the image rather than the coarse centre of a bucket. Quantising matters for a practical reason: without it, a photograph with smooth gradients would spread its pixels across thousands of near-identical values and no single bucket would represent anything. With it, visually identical colours are treated as identical, which is what the eye does anyway.\n\nTwo details of the sampling are worth knowing. The image is downscaled before it is read, which averages fine detail away and makes the counting fast — so the answer reflects the image as a whole rather than the sharpest texture within it. And pixels that are more than half transparent are skipped entirely, which is why a fully transparent image produces a message instead of a colour; nothing was sampled. Partially transparent areas are read at their stated colour, so a logo with soft edges will be judged on its opaque body.\n\nThe usual workflow is to measure first and design second. Run a photograph through the tool to extract dominant color for a card, a banner or a background tint — the image dominant color is usually a better basis for the surrounding interface than a colour picked by eye — and then build outward from that value — a border, a tinted background panel or an accent — so the page and the image agree without the colour being picked by eye. It is equally useful in reverse for checking a delivery: a brand shot that returns a muddy grey rather than the intended green tells you the composition has more background than subject.\n\n- Where it stops: one colour, not a palette, so a photograph with two equally weighted themes will report whichever narrowly wins.\n- There is no cropping or region selection, so a large border or letterbox band can dominate the count.\n- And the result is a screen-sampled approximation, not a colour-managed measurement of the original file.\n- For the common case — grabbing the most common color in image content, in one upload — this is the shortest path from an image to its dominant color, and the one that most reliably matches what a person would name if asked what colour the picture is.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Read the single swatch and its hex — the bucket covering the most area wins, so the answer is the colour the image is most made of." },
      { step: "Reach for the palette extractor when the image has more than one theme." },
      { step: "Use the value as the base for a scheme rather than as a finished decision." },
    ],
    whenToUse:
      "Use this when you want one representative colour from an image — to tint a card, blend a photograph into a layout, or check what an image actually consists of. Use the image colour picker for sampling a specific spot, and a palette extractor when you need the image's several main colours instead of one. When a set rather than a single answer is wanted, the {{color-palette-extractor|palette extractor}} returns a whole palette and the {{color-histogram|color histogram}} shows the distribution behind it — and once the dominant colour is found, the {{color-replacer|color replacer}} is what swaps it for a different value across the image.",
    faqs: [
      {
        q: "Is the dominant colour the same as the average colour?",
        a: "No, and that is the difference that matters. An average blends every pixel into a mid-tone that need not appear in the image; the dominant colour is whichever colour covers the most area.",
      },
      {
        q: "How many colours are considered?",
        a: "Each channel is quantised to 32 levels, giving roughly 32,000 distinct buckets. Similar shades count as the same colour, which is what makes the most popular one meaningful.",
      },
      {
        q: "Can I pick a region of the image?",
        a: "No. The whole image is sampled, so a large background or border will influence the result. Crop the image first if only part of it matters.",
      },
      {
        q: "Why did I get a message instead of a colour?",
        a: "The image had no pixels that were at least half opaque, so there was nothing to count. Fully transparent PNGs are the usual cause.",
      },
      {
        q: "What if an image has two equally dominant colours?",
        a: "It returns one value, not a palette: the largest histogram bucket wins and its mean is reported, so a border or letterbox band can dominate the answer. There is no cropping or region selection to exclude it, and a fully transparent image reports that no opaque pixels were found.",
      },
    ],
  },

  "duotone-generator": {
    keywords: [
      "duotone generator",
      "duotone effect",
      "duotone image",
      "convert image to duotone",
      "two color image effect",
    ],
    intro:
      "The duotone generator maps an image onto a two-color gradient, replacing every pixel with a blend between a shadow colour and a highlight colour chosen by its brightness.",
    content:
      "The duotone generator takes an image and two colours — labelled Shadow and Highlight — and rebuilds the image from nothing but those two values. Upload through the dropzone and the canvas appears beside the controls; change either colour and the image is redrawn immediately. Replace image clears the file so another can be loaded.\n\nThe transformation is a gradient map, which is the defining characteristic of a duotone effect. For each pixel the tool first computes a single brightness value from the original colour, then uses that brightness as a position along a line drawn between the shadow colour and the highlight colour. Bright pixels land near the highlight, dark pixels near the shadow, and everything in between is interpolated. Nothing of the original hue survives — two photographs of the same scene lit differently will come out with the same colours if their brightness patterns match, which is why a duotone image always looks as though it was made from two inks.\n\n- The luminance figure uses the Rec.601 weights — roughly 0.299 red, 0.587 green and 0.114 blue — the same weighting older video systems used.\n- Green therefore contributes noticeably more to perceived brightness than blue, so two colours of identical intensity on screen can sit at different points on the gradient.\n- It is a good general approximation, and the one most image tooling has historically used.\n\nThe image is also scaled down to a maximum of eight hundred pixels on its longest side before it is processed. That keeps the effect responsive while dragging a colour picker, and it means the canvas you see is a working preview rather than a full-resolution render. For picking colours that is the right trade — the effect is a global mapping, so the palette decision looks the same at any size — but it does mean the canvas is not what you would want to ship to print.\n\nWhere the tool fits is quick art direction, or as a way to convert image to duotone for a set of assets that need a house style. A two color image effect like this is a reliable way to make a set of mismatched photographs feel like one family: apply the same shadow and highlight to all of them and the differences in lighting and colour cast disappear. It also works as a background treatment, pushing an image back so foreground text can sit on top without competing. Choosing the two colours is the whole craft here — a light highlight and a dark shadow give contrast, while two mid-tones give a flat, poster-like result that suits a stylised look.\n\nBe clear about the output route, because there is none built in. The result is drawn onto a canvas and there is no download button, so the way to keep it is to right-click the canvas and save the image, or capture it. Combined with the eight-hundred-pixel working size, that makes this a tool for exploring and deciding, after which the same two colours can be applied at full resolution in an image editor.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Set the Shadow colour for the darkest tones in the image." },
      { step: "Set the Highlight colour for the brightest tones and watch the canvas redraw." },
      { step: "Right-click the canvas to save the result, or reuse the same two colours at full resolution elsewhere." },
    ],
    whenToUse:
      "Use this when a set of images needs a consistent look, or when a photograph has to recede behind foreground content. Use the image recolour tool when you want to change the hue of an image while keeping its tonal structure similar to the original. When the hues should shift without collapsing to two colours, the {{image-recolor-tool|image recolor tool}} keeps the tonal structure and moves the hue instead, and a single tint over the whole frame is what the {{overlay-color-generator|overlay color generator}} previews.",
    faqs: [
      {
        q: "Does any of the original colour survive?",
        a: "No. Each pixel keeps only its brightness, which is then mapped between your two colours. Original hues are discarded entirely.",
      },
      {
        q: "Why does the image look smaller than the file I uploaded?",
        a: "It is scaled to a maximum of 800 pixels on the longest side before processing, so the canvas is a working preview. The colour choice transfers unchanged to a full-resolution edit.",
      },
      {
        q: "How do I download the duotone image?",
        a: "There is no download button. Right-click the canvas and save the image, or note the two colours and apply them at full resolution in an image editor.",
      },
      {
        q: "Which colour should be the shadow?",
        a: "Usually the darker, more muted of the two, since it stands in for the image's dark tones. Swapping them inverts the effect and is a quick way to produce a negative-feeling variant.",
      },
      {
        q: "What happens if the two colours are close in brightness?",
        a: "The map flattens: the image's tonal detail lives entirely in the distance between the shadow and the highlight colour, so a pair of near-matches collapses the picture towards one tone. Keeping one end clearly darker than the other is what gives the effect its depth.",
      },
    ],
  },

  "earth-tone-color-generator": {
    keywords: [
      "earth tone color generator",
      "earth tone colors",
      "earth tone palette",
      "muted warm color palette",
      "brown and ochre palette",
    ],
    intro:
      "The earth tone color generator produces a five-color palette from the warm part of the color wheel — terracottas, ochres and olive greens at low saturation — with every swatch written out as a CSS custom property.",
    content:
      "The earth tone color generator returns five swatches at a time with their hex values, plus a CSS panel listing them as numbered custom properties that can be copied in one go. A single Regenerate button produces a new set. There are no other controls, because the point of the tool is a specific band of colour rather than a configurable one.\n\n- That band is defined by two constraints.\n- The hues all fall between roughly ten and eighty degrees on the wheel, which is the arc running from a warm red-orange through terracotta and ochre to a yellowed olive; nothing in this palette is cool.\n- And chroma is held between about 0.06 and 0.14, which is low enough that no swatch reads as vivid.\n- Those two together are what make a colour earthly rather than merely brown: the warmth supplies the clay and pigment character, while the limited saturation keeps the result looking like a material sample rather than a paint chip.\n\nLightness is the third variable and it is a ladder rather than a random draw. The five swatches climb from roughly thirty-five to sixty-five percent in even steps, so the set always contains a deep terracotta at one end and a lighter straw tone at the other, with three intermediate values between them. That even spread is what makes the palette usable without adjustment — there is a dark enough value for text or a border and a light enough one for a surface, and the middle values fill the roles in between. It also means the output is a gradient in all but name, so the swatches sit together naturally.\n\nWhat Regenerate actually re-rolls is only the chroma. The hues of the five positions and their lightness ladder are computed rather than random, so each press keeps the same overall structure — the same warm-to-olive progression at the same tonal spacing — and shifts only how saturated each swatch is. That behaviour is worth knowing, because it makes regeneration predictable: you are choosing a saturation level for the set rather than gambling on a new palette, and a set you like can be nudged without losing what you liked about it.\n\nThe workflow is to regenerate until the palette feels dry enough or rich enough for the material you have in mind, then copy the CSS block. A brown and ochre palette of this kind is best read as a ladder rather than a set of equal colours: since the properties are numbered by position, mapping them onto real tokens is a matter of walking from the darker end, which suits text, borders and shadowed surfaces, up to the lighter end, which suits page backgrounds and highlight fills. Fewer decisions are needed than building an earth tone palette from scratch, because the tonal spacing is already even. Renaming the numbered properties to something semantic is the one manual step, and it is the same step every generated palette needs.\n\n- Being straight about the limits: this is a fixed band, not a configurable one, so there is no way to push the palette greener or paler than the ranges allow, and ten degrees of overlap at the cool end means you cannot get a genuinely neutral grey.\n- There is no contrast checking and no light or dark variant.\n- As a source of earth tone colors to design against, though, it removes the hardest part of building a muted warm color palette — knowing which combinations of hue, lightness and low saturation actually hold together as brown and ochre — and it hands you the syntax already written.",
    howTo: [
      { step: "Press the generate button for a fresh five-colour set drawn from the earth preset." },
      { step: "Press again to reroll within the same hue, lightness and chroma bands." },
      { step: "Copy the hex values you want to keep before the next roll." },
    ],
    whenToUse:
      "Use this when a project needs a warm, muted, natural-material direction — craft, food, ceramics, outdoors, editorial — and you want a five-colour set with usable tonal spread. Use the desert or forest themed generators when the reference is a specific landscape rather than materials. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "Why are none of the colours vivid?",
        a: "Chroma is capped at about 0.14, which is deliberately low. Muted saturation is what separates an earth tone from a bright orange or a pure yellow.",
      },
      {
        q: "Is the palette different every time?",
        a: "Only in saturation. The five hues and the lightness ladder are computed from fixed bands, so Regenerate gives the same structure with slightly different chroma rather than an entirely new set.",
      },
      {
        q: "Can I make the palette greener or greyer?",
        a: "Not from the interface — the hue and chroma bands are fixed. The result is always a warm palette spanning roughly the ten to eighty degree arc of the wheel.",
      },
      {
        q: "How do the five colours relate to each other?",
        a: "They form a lightness ladder from about thirty-five to sixty-five percent, evenly spaced. The darkest reads as terracotta, the lightest as straw, and the middle three fill the range between.",
      },
      {
        q: "What does the earth tone color generator not do?",
        a: "There is no contrast checking and no light or dark variant. As a source of earth tone colors to design against, though, it removes the hardest part of building a muted warm color palette — knowing which combinations of hue, lightness and low saturation actually hold together as brown and ochre — and it hands you the sy",
      },
    ],
  },
};
