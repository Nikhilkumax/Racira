import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 18.
 *
 * Skipped from this window:
 *  - color-theory-reference-tool / color-wheel-theory-guide — both render the
 *    identical ColorWheel as hue-circle-interactive (authored here), and neither
 *    contains the theory content its name promises, so the hue-circle slug is the
 *    one that keeps an honest page.
 *  - warm-to-cool-color-shifter / color-temperature-adjuster — both flagged, and both
 *    render the same HueShift as the authored hue-rotator.
 *  - webcam-color-picker — flagged; it renders the same ImageColorPicker as
 *    image-color-picker, with no camera input at all.
 *
 * Code fixed in this batch: the shared SliderTool appends "%" to any slider whose
 * step is 1, which made the hue slider read "Hue shift (deg): 30%". It now takes a
 * unit, and the hue rotator passes a degree sign.
 */
export const SEO_BATCH_18: Record<string, ToolSeo> = {
  "hair-color-reference": {
    keywords: [
      "hair color reference",
      "hair color palette",
      "hair color hex codes",
      "hair shades with hex",
      "natural hair colors",
    ],
    intro:
      "The hair color reference generates a five-swatch palette spanning the full range of natural hair — near-black through auburn and warm brown to ash blonde — with each value as a hex code.",
    content:
      "The hair color reference works like the other themed generators in this domain: five swatches with their codes, a Regenerate button, and a panel listing the set as numbered CSS custom properties. What sets it apart from its siblings is the shape of the range it draws from, which is unusual in two respects at once.\n\nThe first is the lightness span. Hair covers a wider tonal range than almost any other subject a palette generator is asked about — from near-black through mid browns to pale blonde — and this tool reflects that, generating across roughly ten to eighty-five percent lightness. That is by far the broadest ladder in the set. Most themed palettes keep their colours within a narrow band so they feel like one material; hair has to include both the darkest and one of the lightest values a person can have, and the even spacing between them is what makes the five swatches read as a family rather than as unrelated colours.\n\n- The second is the saturation, which is held between about 0.02 and 0.12 — very low, and deliberately so.\n- Natural hair colour is pigment seen through a translucent fibre, so even the warmest auburn reads as muted rather than vivid.\n- A saturated orange is a hair dye; a low-chroma orange is brown.\n- Keeping the chroma in that narrow band is what makes the palettes believable.\n\nThe hues complete the picture. The first swatch sits around thirty degrees, a warm brown; the second drops to fifteen for a red-brown that reads as auburn; the third falls to zero for a black-brown with a red undertone; the fourth climbs to forty-five for a golden tone; and the fifth reaches sixty, which at low saturation is the ash blonde that reads as cool rather than yellow. Read in order, that is the familiar ladder from dark to light, warm to ashen.\n\nRegenerate re-rolls the saturation only, so each of the five positions keeps its hue band and its place on the lightness ladder. Repeated presses move the palette between a richer, warmer set and a flatter, cooler one without changing its structure — which is the behaviour you want when choosing a direction rather than a single colour.\n\n- Where it earns its place is character work.\n- Avatars, illustrated figures, game characters and doll customisation all need a small set of hair colours that are distinguishable from one another yet clearly belong to the same world, and the two constraints here — a wide lightness ladder at very low saturation — produce exactly that.\n- It is also useful in reverse for checking a claim: if a sketch palette looks too orange or too yellow to read as natural hair, the chroma is usually the culprit.\n\nBeing honest about the limits: these are generated values chosen to occupy the right bands, not samples of real hair, and the palette covers natural colour rather than dye — there is no blue, green or pink here. Real hair also changes tone along its length, with highlights reflecting light and roots reading darker, so a single flat value is always an approximation. Nor is the set organised by shade name, so look elsewhere if you need a specific term. As a hair color palette to draw character work from, though, it is quicker than inventing natural hair colors by hand, and every swatch arrives as hair color hex codes with hex values you can use directly — a compact set of hair shades with hex notation, generated in one press.",
    howTo: [
      { step: "Press Regenerate until the saturation level suits the character or asset." },
      { step: "Read the five swatches, which run from near-black through browns to pale blonde." },
      { step: "Copy the numbered custom properties, or copy a single swatch value." },
    ],
    whenToUse:
      "Use this when a character, avatar or illustration needs a consistent set of natural hair colours. Use the eye colour reference for the same job on irises, or a themed palette generator when the subject is a mood rather than a material. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Why is the palette's lightness range so wide?",
        a: "Because hair spans more tones than most subjects — near-black through mid browns to pale blonde. The five swatches are spaced evenly across roughly 10 to 85 percent lightness so the set covers that range.",
      },
      {
        q: "Why are the colours so muted?",
        a: "Chroma is capped at about 0.12. Natural hair colour is pigment behind a translucent fibre, so even a warm auburn reads as brown rather than orange. Higher saturation would look like dye.",
      },
      {
        q: "Does it include unnatural hair colours?",
        a: "No. The five bands cover black-brown, auburn, warm brown, golden and ash blonde, so dips and fashion colours are outside its range.",
      },
      {
        q: "Are these sample values from real hair?",
        a: "No, they are generated within the right bands. Real hair also varies along its length, with roots reading darker than the highlighted tips, so a single flat value is an approximation.",
      },
      {
        q: "What does the hair color reference not do?",
        a: "Avatars, illustrated figures, game characters and doll customisation all need a small set of hair colours that are distinguishable from one another yet clearly belong to the same world, and the two constraints here — a wide lightness ladder at very low saturation — produce exactly that. It is also useful in reverse for",
      },
    ],
  },

  "hue-circle-interactive": {
    keywords: [
      "hue circle",
      "hue circle picker",
      "color wheel hue circle",
      "pick a hue from the circle",
      "interactive hue wheel",
    ],
    intro:
      "The hue circle lays twelve evenly spaced hues around a ring, all generated at the same lightness and chroma, and lets you select one to read its hex value.",
    content:
      "The hue circle arranges twelve buttons in a ring, spaced thirty degrees apart around a circular track. Each button is filled with the hue at that position, and clicking one selects it, filling a large swatch below with the same colour, its hex value and a copy button. Selection is discrete — twelve positions rather than a continuous sweep.\n\nThe important detail is how each button's colour is calculated. Rather than walking the red, green and blue channels, every hue is generated in a perceptual colour space at a fixed lightness and chroma, with only the hue angle changing from one button to the next. That matters, because evenly spaced hues in a channel-based model are not evenly spaced to the eye: the same numeric step produces a much larger perceptual jump through yellow and green than through blue. Here, all twelve sit at the same apparent lightness, which is why the ring reads as an even spectrum with no single swatch dominating, and why any two adjacent buttons are distinguishable from each other.\n\nThat uniformity is the reason to use a hue circle rather than the colour picker. A general picker trades this clarity for range: continuous hue, adjustable lightness, adjustable saturation, and usually a recent-colours list. The circle does one thing — laying out hue, at a constant tone, so the relationships between colours are easy to see. If you know you want a teal but not which one, the ring shows the family at a glance. If you need a dark teal for a border and a light one for a background, the ring cannot help beyond choosing the hue angle, and you would take that angle to a tool with lightness and chroma controls.\n\nThe workflow is a single click and a copy. Find the hue that matches your intent, select it, and read or copy the generated hex. Because the twelve values are computed rather than curated, the same twelve always appear, which makes the ring a stable reference — you can revisit the page months later and the turquoise in the same position will be the same colour.\n\nWhat it does not do is worth stating clearly.\n\n- There is no continuous selection, so the hue you want is one of twelve and never between them.\n- There is no lightness or chroma control, so every colour is a mid-tone of moderate saturation.\n- There is no harmony output, so complementary or triadic relationships have to be worked out or taken to a dedicated tool.\n- And there is no way to enter a starting colour and see its neighbour on the ring.\n\nThat makes it a deliberate simplification rather than a limitation to work around. Used as a hue circle picker, it does the one job without any of the noise: a color wheel hue circle with an interactive hue wheel at a constant tone, twelve options, and the hex for whichever you pick. It is the fastest way to pick a hue from the circle when the decision is about the colour's identity rather than its shade, and it keeps the ring readable by refusing to let lightness creep in and spoil the comparison.",
    howTo: [
      { step: "Look around the ring and choose the hue that matches what you have in mind." },
      { step: "Click that button — the selection fills the swatch below." },
      { step: "Copy the hex value, or note the hue and take it to a tool with lightness and chroma controls." },
    ],
    whenToUse:
      "Use this when you know which hue you want and need to see the options at a consistent tone. Use a full colour picker when lightness or saturation also need choosing, or a harmony tool when you need coordinated colours rather than one. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Why are all the swatches the same brightness?",
        a: "Each is generated in a perceptual colour space at a fixed lightness and chroma, with only the hue changing. That keeps the ring even to the eye, so no single hue dominates the comparison.",
      },
      {
        q: "Can I pick a hue between two buttons?",
        a: "No. There are twelve discrete positions, thirty degrees apart, so the hue you want is the nearest of them rather than an exact value.",
      },
      {
        q: "Why not just use a colour picker?",
        a: "A picker offers continuous hue plus lightness and saturation, which is more powerful and harder to compare at a glance. The ring trades range for an even, stable spectrum.",
      },
      {
        q: "Does it suggest matching colours?",
        a: "No. It selects a single hue and reports its hex value. Complementary, analogous and triadic relationships are handled by dedicated harmony tools.",
      },
      {
        q: "What does the hue circle interactive not do?",
        a: "There is no continuous selection, so the hue you want is one of twelve and never between them. There is no lightness or chroma control, so every colour is a mid-tone of moderate saturation. There is no harmony output, so complementary or triadic relationships have to be worked out or taken to a dedicated tool. And ther",
      },
    ],
  },

  "hue-rotator": {
    keywords: [
      "hue rotator",
      "hue shift tool",
      "rotate hue of a color",
      "shift color hue degrees",
      "hue rotation css equivalent",
    ],
    intro:
      "The hue rotator turns a color's hue by a chosen number of degrees while holding its lightness and saturation constant, returning the rotated color as a hex value.",
    content:
      "- The hue rotator is a two-control tool: a colour field and a slider running from minus one hundred and eighty degrees to plus one hundred and eighty, defaulting to thirty.\n- The result appears as a large swatch with its hex value and a copy button, updating as either control changes.\n- Negative values rotate the hue one way round the wheel and positive values the other, with the value wrapping when the rotation passes the end of the circle.\n\nThe behaviour that matters is what stays the same. The rotation is performed in a perceptual colour space — the color is converted to a lightness, chroma and hue triple, the hue angle is incremented, and the result is converted back. Because only the hue term is touched, the rotated colour has the same apparent lightness and the same chroma as the original. A medium blue at moderate saturation becomes a medium green at the same saturation, not a darker or brighter one.\n\nThat is worth contrasting with the hue rotation available in CSS filters, which is the closest thing most people have used. A filter-based hue rotation applies a matrix to the red, green and blue channels, which is an approximation: rotating a saturated colour that way frequently shifts its perceived lightness as well, so a careful design can come out brighter or duller after the rotation. The result here is the one you would get by picking a different hue and matching lightness and saturation by hand, achieved in one step.\n\nThe slider's range is a consequence of that symmetry. Rotating by one hundred and eighty degrees swings the hue to the opposite side of the wheel — the complementary relation — and anything beyond that is the same as a rotation in the other direction, so the range covers the full circle without redundancy. A rotation of zero returns the colour unchanged, which makes the slider's origin a useful reference point.\n\nThe practical uses are mostly derivative. Building a set of related colours in which only the hue changes is the obvious one: take a single brand colour, rotate it by a fixed step several times, and you have an evenly spaced family at a consistent tone, which is precisely what a categorical chart scale or a set of state colours needs. It is also a quick way to answer what a colour would look like in another hue without committing to it, and a way to correct a palette whose colours drift in brightness — rotating in this space leaves lightness untouched, so only the attribute you asked about moves.\n\nLimits to keep in mind.\n\n- Only hue changes, so a rotation cannot fix a colour that is too dark or too grey.\n- The output is a single hex value, and there is no history of previous rotations to compare against, so building a family means recording the values as you go.\n- Extreme rotations from a saturated starting colour can leave the target hue outside the range a display can render, in which case the result is the closest renderable colour rather than the exact rotation.\n- And the value shown is a screen-appropriate conversion, not a colour-managed one.\n\nEven so, as a hue shift tool it answers a narrow, frequent question cleanly: rotate hue of a color by a known number of degrees and get back something with the same weight. Where a hue rotation css filter would change the tone as a side effect, this is the equivalent performed properly — a hue rotation css equivalent that does not lose brightness along the way — which makes it a reliable way to shift color hue degrees while agreeing with the palette rather than fighting it.",
    howTo: [
      { step: "Pick the starting colour with the field." },
      { step: "Drag the slider to rotate the hue — negative values go one way round, positive the other." },
      { step: "Copy the hex value from the resulting swatch." },
      { step: "Repeat with the same rotation to build an evenly spaced family of hues at one tone." },
    ],
    whenToUse:
      "Use this when only the hue should change — building a categorical scale, exploring alternatives for a colour, or correcting tones that drifted. Use the saturation and lightness tools when those attributes are the problem instead. The {{color-temperature-adjuster|temperature adjuster}} and the {{warm-to-cool-color-shifter|warm-to-cool shifter}} are the same rotation framed as temperature rather than as an angle.",
    faqs: [
      {
        q: "Does the rotated colour keep the same brightness?",
        a: "Yes. The rotation happens in a perceptual colour space where lightness and chroma are separate from hue, so only the hue angle changes and the apparent weight stays put.",
      },
      {
        q: "How is this different from a CSS hue-rotate filter?",
        a: "The filter applies a matrix to the colour channels, which is an approximation and often shifts perceived lightness as a side effect. This rotation preserves lightness and chroma exactly.",
      },
      {
        q: "Why does the slider stop at 180 degrees?",
        a: "Rotating by 180 degrees reaches the opposite side of the wheel, and anything further is equivalent to rotating the other way. The range therefore covers the whole circle without duplicating values.",
      },
      {
        q: "Will the result always be displayable?",
        a: "Not necessarily. A large rotation from a saturated colour can land outside the range a screen can show, in which case the closest renderable colour is returned.",
      },
      {
        q: "What does the rotation leave untouched?",
        a: "Lightness and chroma. The rotation is performed in OKLCH, so only hue moves, which means a rotation cannot fix a colour that is too dark or too dull. The range is plus or minus one hundred and eighty degrees, and the two ends therefore meet.",
      },
    ],
  },

  "image-color-picker": {
    keywords: [
      "image color picker",
      "pick color from image",
      "eyedropper for images",
      "sample pixel color from photo",
      "hex from image pixel",
    ],
    intro:
      "The image color picker turns an uploaded photo into a sampling surface — click any point and read that pixel's exact hex value.",
    content:
      "The image color picker puts an uploaded image on a canvas beneath a crosshair cursor. Click anywhere and the pixel under the pointer is read and shown in a panel as a large swatch with its hex value and a copy button. Clicking again replaces the value, so the same image can be sampled repeatedly without reloading, and a Replace image button clears the state for a different file.\n\nThe accuracy of the sample comes from how the click is converted:\n\n- The image is drawn onto a canvas at a maximum of 800 pixels on its long side, and the click position is converted from the element's rendered bounds into canvas coordinates, so the value is the pixel actually under the pointer.\n- Reads come from the browser's decoder: PNG values are bit-exact, JPEG values reflect whatever the codec stored.\n- There is one mode — point and click, one colour at a time — with a Replace image button to clear the state for a different file.\n\nThe accuracy of the sample is worth explaining, because it is the part a naive implementation gets wrong. The canvas is displayed at whatever size the layout gives it, which is usually not the size of the canvas itself. The tool handles that by measuring the element's rendered bounds and converting the click position into canvas coordinates using the ratio between the two, then reading a single pixel at those coordinates. That means the value you get is the pixel actually under the pointer, not the pixel at the unscaled coordinate — a distinction that matters enormously on a wide image, where the two can be hundreds of pixels apart.\n\nOne consequence of the approach is that you are sampling the rendered image rather than the original file:\n\n- Very large files are downsampled before they are read, and colours from fine detail — hair, foliage, texture — are averaged with their neighbours.\n- Areas the image does not cover are transparent pixels, and sampling one returns black rather than nothing, since the sampler reads colour channels and ignores the alpha value.\n- There is no magnifier or zoom, no averaging over a small radius, and no history — each click replaces the last — so a palette cannot be assembled here.\n\nThe tool has one mode and does it well: point and click, one colour at a time. Textured areas give whichever single pixel is under the cursor rather than a representative tone, which is precisely what makes the read trustworthy when the question is what value sits at that spot.\n\nIf the immediate task is to pick color from image content — one specific point rather than a general impression — this is the fastest route there is, which is why the division of labour matters: what you do next. For a single colour read off an image, this is the right tool: quick, exact, no setup. For several colours from one image, an extraction tool that clusters the pixels will give you a more useful answer than clicking repeatedly, because it finds the colours that actually dominate rather than the ones you happened to click. For an image's overall tone, an average or dominant colour tool answers the question directly.\n\nUsed as an eyedropper for images, then, this is the direct route: upload a photo, click the point you care about, and copy hex from image pixel data — or work in the other direction and sample pixel color from photo content when matching a design to a picture. One click, one value, no interpretation in between.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Click anywhere on the image — the cursor is a crosshair to make the target clear." },
      { step: "Read or copy the hex value from the picked-colour panel." },
      { step: "Click again elsewhere to sample a different point, or replace the image to start over." },
    ],
    whenToUse:
      "Use this when you need the exact colour of a specific point in an image. Use a palette extractor when you need the image's several main colours, or the dominant colour finder when you want a single representative value rather than a chosen point. When several colours are wanted rather than one coordinate, an {{color-palette-extractor|extraction tool}} clusters the pixels, and the {{dominant-color-finder|dominant color finder}} answers the overall-tone question directly.",
    faqs: [
      {
        q: "Is the value exact?",
        a: "It is the exact pixel under the pointer in the rendered image. Large files are downsampled to 800 pixels on the long side before display, so very fine detail is averaged away.",
      },
      {
        q: "Why did I get black from an empty area?",
        a: "Transparent pixels have no colour, and the sampler reads only the colour channels, so clicking outside the subject returns black.",
      },
      {
        q: "Is there a magnifier or zoom?",
        a: "No. Sampling is a plain click at the cursor position, so precisely hitting a small feature on a large image takes care.",
      },
      {
        q: "Can I collect several colours into a palette?",
        a: "Not here — each click replaces the previous value. For a palette from one image, use an extraction tool that clusters the image's colours.",
      },
      {
        q: "Can I zoom in before clicking a pixel?",
        a: "There is no zoom or magnifier — the image is shown at the size the layout gives it. Uploading a cropped region of the file is the way to separate two adjacent pixels.",
      },
    ],
  },

  "image-recolor-tool": {
    keywords: [
      "image recolor tool",
      "recolor an image",
      "tint an image one color",
      "monochrome image tint",
      "change image color online",
    ],
    intro:
      "The image recolor tool repaints an entire photo in one color, keeping its brightness detail while replacing every hue with a single tint you choose.",
    content:
      "The image recolor tool takes an uploaded image and a tint colour and rebuilds the picture as a single-hue monochrome. Drop a file onto the upload area, choose a tint, and the canvas beside the controls redraws immediately. Change the tint and it redraws again; Replace image clears the file. There are no other settings, because there is no second colour involved.\n\n- The transformation is the same family as a duotone, with one end of the gradient removed.\n- Each pixel's brightness is computed from its original colour, and that brightness is then used to scale the tint.\n- The result is that white areas become exactly the tint colour, black areas stay black, and every mid-tone becomes a darker version of the tint.\n- The hue of the original image is discarded completely — two photographs of the same subject will come out with identical colouring if their brightness patterns agree.\n\nThe most useful consequence of that formula is a rule for choosing the tint. Because the brightest pixels are painted with the tint at full strength, the tint defines the ceiling of the image's brightness: nothing in the result can be lighter than the tint itself. Choose a deep navy and the whole picture darkens, including anything that was bright; choose a pale yellow and it brightens. That single sentence explains most of the surprising results people get from this kind of tool, and it is the reason a mid-tone tint reproduces the original's overall weight most faithfully.\n\nA second property, visible only in comparison, is that this tool works at the image's native resolution. The canvas is sized to the file rather than downsampled first, so fine detail survives — a useful distinction from the duotone generator in this domain, which caps its working size for responsiveness. The trade is that very large files take longer to process on every tint change.\n\nThe obvious uses are making a set of mismatched images look deliberate — to recolor an image set with one brand colour so the differences in native colouring disappear — and pushing an image back so it works as a background behind text. The same formula gives the classic monochrome image tint, where a photograph is reduced to a single hue so that composition and contrast become the subject rather than colour. It is also a quick way to see an image's structure, because removing the hue leaves only form and contrast, which is often the fastest check on whether a composition works.\n\nTwo limits are worth stating.\n\n- The transparency channel is left untouched, so a PNG with soft edges keeps them, which is usually what you want and occasionally surprising when a mostly transparent image recolours unevenly.\n- And there is no export: the result is drawn on a canvas with no download button, so the route to keeping it is to save the canvas from the browser or reproduce the effect at full resolution in an image editor.\n\nCompared with its neighbours, this is the simplest option in the group — one tint, no second colour, no tonal mapping to arrange. Where the duotone generator maps brightness between two chosen colours, this maps it between black and one colour, which is the classic monochrome approach. If the goal is to tint an image one color so that a set of photographs finally look like they belong together, or to change image color online without installing anything, one upload and one colour is the whole workflow.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Choose the tint colour — remember that the brightest parts of the image take the tint at full strength." },
      { step: "Adjust the tint until the overall brightness feels right." },
      { step: "Save the canvas from the browser, or reuse the tint at full resolution in an image editor." },
    ],
    whenToUse:
      "Use this when a photograph needs to be rendered in a single hue — brand-consistent imagery, background treatments, or unifying a set of mismatched pictures. Use the duotone generator when two colours should map the tonal range instead of one. The {{duotone-generator|duotone generator}} maps the image between two chosen tones rather than tinting with one, and the {{color-replacer|color replacer}} swaps a single target colour instead of tinting every pixel.",
    faqs: [
      {
        q: "Does any of the original colour remain?",
        a: "No. Only brightness survives; every pixel is repainted with the tint at an intensity set by its original lightness.",
      },
      {
        q: "Why did the whole image get darker?",
        a: "Because the brightest pixels are painted with the tint at full strength, so nothing can be lighter than the tint itself. A darker tint darkens everything.",
      },
      {
        q: "How is this different from the duotone generator?",
        a: "A duotone maps brightness between two chosen colours. This maps it between black and one colour, and it also processes at the image's native resolution rather than downsampling first.",
      },
      {
        q: "How do I save the result?",
        a: "There is no download button. Save the canvas through the browser, or note the tint and apply the same effect at full resolution elsewhere.",
      },
      {
        q: "How do I choose the tint colour?",
        a: "Pick the tint that the brightest parts of the image should become, because each pixel is multiplied by the tint in proportion to its own luminance — a mid-tone pixel lands roughly halfway between black and the tint, so the tint reads darkest wherever the image was darkest.",
      },
    ],
  },

  "image-theme-generator": {
    keywords: [
      "image theme generator",
      "generate theme from image",
      "ui theme from photo",
      "image color scheme",
      "build palette from image",
    ],
    intro:
      "The image theme generator clusters an uploaded image into six colors and assigns them to interface roles — background, surface, primary, secondary, accent and foreground.",
    content:
      "- One upload returns six swatches, each with a role name above it and its hex value below: background, surface, primary, secondary, accent and foreground.\n- The colours are grouped by similarity rather than picked one by one.\n- A Replace image button resets the state, and there are no settings.\n\nClustering is what makes the output usable rather than arbitrary. Rather than picking six pixels, the tool groups the image's pixels by similarity so that each of the six results represents a genuine region of colour — enough sky, enough foliage, enough of whatever dominates. On a landscape, that tends to produce several related greens and blues with one warm note, which is a far better starting point than six random samples would be.\n\nThe role labels are the part to approach with care, and understanding how they are assigned saves a lot of confusion. The six clusters come out of the algorithm in an order determined by how the clustering seeds, and the labels are applied to that order positionally — the first cluster is called background, the second surface, and so on down to foreground. Nothing in the process looks at whether a colour is dark enough to be a background or light enough to be readable as text. So the swatch labelled foreground may well be a mid-tone that cannot be read on the swatch labelled background, and the one labelled background may be the most vivid colour in the picture.\n\nThat is a real limitation, and it is best treated as a starting point rather than a finished theme. The useful move is to read the six values, then decide the roles yourself: sort them by lightness, put the darkest where text or a border belongs, the lightest under the largest surface, and keep one vivid colour as the accent. Running a contrast check between whichever pair you settle on for text and surface is the essential next step, since a palette that looks cohesive is not automatically legible.\n\nA second property worth knowing is determinism. The clustering is seeded at fixed positions rather than randomly, so the same image produces the same six colours every time — on a reload, on a second upload, on a different day. For something whose output is destined for a stylesheet, that stability is important: a theme that shifts between runs would be unusable.\n\nWhere this fits is at the start of a design rather than the end. A product built around photography — a travel app, a recipe site, a portfolio — can take its palette from its own imagery, which guarantees that the interface and the pictures agree instead of merely coexisting. The six clusters are usually enough to establish a tonal hierarchy without inventing anything, and having the colours come from the content removes the usual round of subjective argument.\n\n- Limits worth naming: six colours and six fixed labels, no control over the count, no contrast checking, no export beyond copying individual swatches, and a bias towards whatever covers the most area — so a small but vivid detail may not survive clustering at all.\n- There is no way to generate theme from image with one region weighted over another; the whole frame participates equally.\n- Used as an image theme generator, it answers build palette from image in one upload, and with the labels reassigned to match how the interface is actually built the result is a ui theme from photo that is at least guaranteed to be an image color scheme drawn from the picture itself.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Read the six swatches and their hex values." },
      { step: "Reassign the role labels yourself — sort by lightness and reserve the most vivid colour as the accent." },
      { step: "Check contrast between the text and surface pairings you intend to use." },
    ],
    whenToUse:
      "Use this when a project's palette should come from its own imagery — photography-led products, portfolios, editorial layouts. Use the palette extractor when you want the colours without interface roles attached, or the dominant colour finder for a single value. Since the roles arrive unchecked, the {{palette-accessibility-checker|palette accessibility checker}} is where the pairs a real interface depends on get audited, and a wider set derived from one of the swatches is what the {{single-color-to-full-palette|single color to full palette}} builds.",
    faqs: [
      {
        q: "How are the roles decided?",
        a: "Positionally — the six clusters come out of the algorithm in an order and the labels are applied to that order. No colour property is checked, so the labels are suggestions rather than judgements.",
      },
      {
        q: "Is the result accessible?",
        a: "Not necessarily. There is no contrast checking, and a swatch labelled foreground may not be readable on the one labelled background. Test any pairing you intend to ship.",
      },
      {
        q: "Does the same image give the same theme?",
        a: "Yes. The clustering is seeded deterministically, so the six colours are identical on every upload and after every reload.",
      },
      {
        q: "How many colours are produced?",
        a: "Six, always. The count is fixed, and there is no control over how the clusters are formed.",
      },
      {
        q: "Can I rename or reassign a role after the fact?",
        a: "Not on the page — the six labels are fixed, and the roles are names attached to the clustered values rather than a mapping you can edit. The workable route is to copy the six hex values out and reassign them in your own tokens, which is where roles really live anyway.",
      },
    ],
  },

  "ios-swift-color-generator": {
    keywords: [
      "ios swift color generator",
      "uicolor from hex",
      "swift uicolor code",
      "ios color constants",
      "swift color palette code",
    ],
    intro:
      "The iOS Swift color generator converts named hex colors into UIColor initialisers with floating-point components, ready to paste into a Swift extension.",
    content:
      "- The iOS Swift color generator takes a list of named colours and writes one Swift line per entry.\n- Two rows are provided to start with, primary and danger, and the Add button appends more, each seeded with a random colour.\n- Every row pairs a name field with a colour field and a delete button, and the output panel updates as the rows change.\n\nEach line comes out as a static let declaration whose value is a UIColor initialised with red, green and blue components as decimals between zero and one, plus an alpha of one. That conversion is the substance of the tool. UIKit does not accept hex strings, so a design-file value has to be restated as three fractions, and each division has to be done to enough decimal places that the colour is not visibly shifted. Three decimal places, which is what the output uses, is finer than a screen can show, so the converted colour is identical to the source.\n\nThere is a detail in the initialiser choice worth knowing. The form emitted takes components that UIKit interprets in the sRGB space, which is what a hex value from a design tool or a screenshot normally means. If a design system specifies colours in a wider gamut, the conversion here is not the right one, because nothing is being colour-managed — each channel is simply divided by two hundred and fifty-five. For the ordinary case of an sRGB swatch, the result is exact.\n\nThe output is a set of declarations rather than a complete file. That is deliberate: paste the lines inside a UIColor extension or a namespace struct and they compile as-is, with the names you typed becoming the accessors. There is no wrapper to reconcile and no naming convention imposed, so the token file and the call sites use the same words.\n\nWhen typing names, match what Swift expects: lowerCamelCase, and a valid identifier, since these become property names. Alpha is always one, so translucent colours cannot be expressed here — those are usually handled at the point of use in Swift anyway, with an opacity modifier applied to an opaque base colour. There is also no dark-mode variant and no asset catalogue output: a colour that has to differ between light and dark appearance needs either a dynamic initialiser or an asset entry, neither of which this page produces. And the lines carry no comments, so a large set benefits from grouping when it is pasted.\n\nBeing clear about the boundaries helps too: the output is a block of declarations rather than a file, so it needs a home inside an existing extension before it compiles. There is no asset-catalogue export, no dark-mode variant, and no wider-gamut initialiser, so a design system that relies on any of those will need edits after pasting. Compared with the other native exporters, this one sits alongside Android resources, Flutter constants and Figma tokens, sharing the same row interface with a different output. Used as an ios swift color generator, it removes the arithmetic that would otherwise be done by hand for every token: name the colours, copy the swift uicolor code, and paste the ios color constants into a swift color palette code file with the uicolor from hex conversion already done.",
    howTo: [
      { step: "Type the token names in the left column, using valid lowerCamelCase Swift identifiers." },
      { step: "Set each colour with the field beside its name, or add rows with Add." },
      { step: "Copy the declarations and paste them inside a UIColor extension or namespace struct." },
    ],
    whenToUse:
      "Use this when an iOS project needs a block of colour constants converted from a palette. Use the Flutter or Android exporters for those platforms, or the design token generator when the colours need to travel as a document instead of as code. Before the hex becomes a UIColor literal, the {{color-format-converter|color format converter}} shortens the checking, and a palette that arrives as a token document rather than rows is the {{figma-token-generator|figma token generator}}'s output.",
    faqs: [
      {
        q: "Why are the components decimals instead of hex?",
        a: "UIKit takes red, green and blue as fractions between zero and one, so each channel of the hex value is divided by 255. Three decimal places is finer than a screen can show.",
      },
      {
        q: "Is the conversion colour-managed?",
        a: "No. Each channel is simply divided by 255, which matches the sRGB interpretation a hex value from a design tool normally carries. Wider-gamut colour spaces need a different initialiser.",
      },
      {
        q: "Can I output translucent colours?",
        a: "Not here — every line carries an alpha of one. Apply opacity at the point of use in Swift when a translucent variant is needed.",
      },
      {
        q: "Does it handle dark mode?",
        a: "No. Each colour is a single static value. Dynamic colours that differ by appearance need a dynamic initialiser or an entry in an asset catalogue.",
      },
      {
        q: "Do the declarations have to live in an extension?",
        a: "They are top-level static lets, so they need a home — an extension on UIColor or your own enum namespace — before they compile. The block itself carries no type declaration.",
      },
    ],
  },
};
