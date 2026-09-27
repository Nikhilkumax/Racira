import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 5 (alphabetical slugs 48-54).
 * Skipped from this window (flagged): color-matching-game, color-memory-game.
 */
export const SEO_BATCH_5: Record<string, ToolSeo> = {
  "color-hierarchy-analyzer": {
    keywords: [
      "color hierarchy analyzer",
      "color hierarchy tool",
      "preview color hierarchy",
      "primary secondary muted color preview",
    ],
    intro:
      "The color hierarchy analyzer is a live preview of how a primary, secondary and muted color behave together on real controls, so you can see the ordering before you build it.",
    content:
      "The color hierarchy analyzer is a live preview of how three coordinated colors behave together. You set a primary, a secondary and a muted supporting color, and the tool renders a sample panel with a primary call to action, a secondary button and muted body text, so the relationship between the three tiers is visible immediately rather than something you have to imagine. It answers a question that palette strips cannot: given these three colors and a real interface, does the eye land on the right one first?\n\n- Color hierarchy is created by relative weight, not by hue alone.\n- The primary color is the one the eye reaches first, usually because it is the most saturated or the most contrasting against the surrounding surface.\n- The secondary sits behind it, close enough in family to feel related but deliberately quieter.\n- The muted tone carries supporting copy, where legibility matters but attention does not.\n- Because those judgements depend on comparison, seeing all three applied at realistic size is the only reliable test; a secondary that looks restrained in isolation can compete with the primary once the two share a screen.\n\nThe preview uses real buttons and paragraphs rather than flat swatches, and that is deliberate. A swatch tells you what a color is; a button tells you what it does. Once the colors are applied to controls at their real size, problems that were invisible in a palette become obvious: a muted tone that is too dark and pulls the eye, a secondary that disappears into the surface behind it, or a primary that looks handsome in isolation but sits too close in luminance to its own background to be readable at all.\n\nTreat it as a color hierarchy tool for the early, fluid stage of a build. Tune the three roles against the preview until the ordering reads correctly, then lock them in and derive interactive states from the same values using the lighten and darken tools. Because only three values drive the whole panel, changing direction is cheap, which makes it an unusually fast primary secondary muted color preview to iterate against: swap the primary and the entire hierarchy re-tests in a second.\n\nTwo limits are worth stating plainly.\n\n- The tool is a preview rather than a measurement, so it will not tell you the contrast ratio of any pairing; run the colors through a contrast checker for that.\n- And a three-level hierarchy is a simplification, since real design systems usually add surfaces, borders and states on top of it.\n- Use it whenever you want to preview color hierarchy quickly, and confirm the extended palette still reads in the intended order once those extra roles exist.\n\nOne more habit makes the tool more useful: change the primary first, then the secondary, then the muted tone, and judge each move against the other two rather than in isolation. Reordering them in that sequence keeps the comparison honest, because a muted tone chosen while the primary is still undecided often turns out too strong once the primary finally lands. It is a small workflow detail, but it is the difference between a hierarchy that survives review and one that has to be rebuilt later.",
    howTo: [
      { step: "Set the primary colour first, then the secondary, then the muted tone." },
      { step: "Read the preview, which applies the three roles to real controls rather than flat swatches." },
      { step: "Change the primary first when tuning, since the other two are read relative to it." },
      { step: "Confirm the ordering still holds once surfaces, borders and states are added." },
    ],
    whenToUse:
      "Use this analyzer to judge the relative weight of a three-color hierarchy on real controls. Use a contrast checker when you need the numeric ratio of a pairing, and the palette balance analyzer when you want aggregate lightness and chroma figures. When you need the numeric ratio of a pairing a {{contrast-checker|contrast checker}} supplies it, and the {{palette-balance-analyzer|palette balance analyzer}} measures lightness and chroma across a whole set.",
    faqs: [
      {
        q: "Does it measure contrast?",
        a: "No. It previews how the three roles look applied to real controls. For numeric ratios, run the specific pairs through a contrast checker.",
      },
      {
        q: "Why use buttons instead of plain swatches?",
        a: "Because a control at its real size shows whether a color recedes or advances in a way a flat swatch hides. The ordering is what a hierarchy is testing.",
      },
      {
        q: "How many colors can I test?",
        a: "Three roles: primary, secondary and muted. They are the backbone of most interfaces; add states on top once the ordering is right.",
      },
      {
        q: "Should light and dark themes use the same values?",
        a: "Often not. Colors can reverse their apparent order between surfaces, so define theme-specific values when the hierarchy flips.",
      },
      {
        q: "Does it report the contrast ratio of the hierarchy?",
        a: "No — it is a preview rather than a measurement, so the ratios have to come from a contrast checker. A three-level hierarchy is also a simplification: real design systems add surfaces, borders and states on top, and the extended palette still has to read in the intended order once those roles exist.",
      },
    ],
  },

  "color-histogram": {
    keywords: [
      "color histogram",
      "image color histogram",
      "rgb histogram generator",
      "analyze image colors",
    ],
    intro:
      "The color histogram charts how an image's pixels are distributed across the red, green and blue channels, with one bucket per value, so you can read exposure and color balance at a glance.",
    content:
      "- The color histogram reads an image you upload and charts how its pixels are distributed across the red, green and blue channels.\n- Each channel gets its own bar chart with two hundred and fifty-six buckets, one for every possible value, so you can see at a glance whether an image is dark and clipped, bright and blown out, or spread comfortably across the range.\n- It is the diagnostic you want before color-correcting a photograph, or before deciding whether a scanned document is usable.\n\nA histogram is a count, not a picture. The horizontal axis runs from the darkest value to the lightest and the vertical axis shows how many pixels fall into each bucket, scaled so the tallest bar fills the chart. Because the three channels are drawn separately, a color cast is easy to spot: if the red distribution sits noticeably to the right of the blue, the image is warm, and a green curve pushed toward the shadows suggests too much magenta in the midtones.\n\nReading an image color histogram well takes a little practice. A healthy exposure usually shows a broad, roughly bell-shaped spread that reaches both ends without piling up against either wall. A spike pressed against the far left means crushed shadows with lost detail; a spike on the right means clipped highlights that cannot be recovered. A single tall, narrow spike in the middle often indicates a flat, low-contrast image, or a large area of uniform color such as a studio backdrop.\n\n- The tool scales the image down before sampling, so very large files stay responsive, and pixels that are mostly transparent are skipped.\n- That matters for the common case of a logo with a soft alpha edge, which would otherwise distort the counts with invisible areas.\n- If a histogram looks strange, transparency is usually the reason rather than a bug: an image with a large transparent region is charting only its visible pixels.\n\nAs an rgb histogram generator it complements the palette tools elsewhere in this section. A palette extractor answers which colors an image contains; the histogram answers how those colors are distributed and whether the tonal range is healthy. Reach for it when you want to analyze image colors rather than name them, and remember it measures the whole frame rather than pointing at a region, so it works best alongside your eyes rather than as a replacement for them.\n\nA histogram is also worth reading in pairs. Compare the charts for two frames from the same shoot, or for a brand color alongside its photographic rendering, and the difference in spread tells you more than either chart alone. If one image crowds both ends of the range and the other sits comfortably inside it, the first has been pushed harder in editing and will be harder to match. Because the tool samples every visible pixel, it also quietly flags images that are effectively single tone: a chart with one dominant spike and very little else is a flat graphic or a silhouette rather than a photograph, and it will not respond to tonal adjustments the way a photograph does.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Read the three charts: each channel runs from darkest to lightest along the horizontal axis." },
      { step: "Look for a broad spread that reaches both ends when judging exposure." },
      { step: "Upload a second frame to compare two charts side by side." },
    ],
    whenToUse:
      "Use the histogram to judge exposure and color balance before corrections. Use the palette from image tool to extract the colors themselves, and the dominant color finder when you need a single representative value. A palette tool such as the {{color-palette-extractor|palette extractor}} or the {{dominant-color-finder|dominant color finder}} answers which colours are present, which is a different question from how they are distributed.",
    faqs: [
      {
        q: "What do the axes represent?",
        a: "The horizontal axis runs from the darkest to the lightest value and the vertical axis shows how many pixels fall in each bucket, scaled to the tallest bar.",
      },
      {
        q: "What does a spike at the edge mean?",
        a: "A spike at the left means crushed shadows and a spike at the right means clipped highlights. Detail in those regions cannot be recovered by editing.",
      },
      {
        q: "Why is each channel drawn separately?",
        a: "Separate curves make a color cast visible. If one channel sits noticeably to a side, the image is tinted in that direction.",
      },
      {
        q: "Does it handle transparent PNGs?",
        a: "Mostly transparent pixels are skipped when sampling, so a logo with soft edges charts only its visible content.",
      },
      {
        q: "Does the chart tell me whether an image is correctly exposed?",
        a: "No. It counts and plots how pixels are distributed across the red, green and blue channels; whether that distribution is right depends on the image's intent, and no target, warning or verdict is offered. Very large files are scaled down before sampling, so the counts describe a reduced read of the image.",
      },
    ],
  },

  "color-inverter": {
    keywords: [
      "color inverter",
      "invert a color",
      "invert hex color",
      "negative color generator",
    ],
    intro:
      "The color inverter returns the exact opposite of any color by subtracting each channel from its maximum, giving you a clean RGB negative with a copy-ready hex value.",
    content:
      "The color inverter returns the opposite of any color by subtracting each of its channels from the maximum. The result is the classic RGB negative: red becomes cyan, green becomes magenta, blue becomes yellow, and greys map to other greys. You pick a color, and the tool shows the original and the inverted value side by side with copy-ready hex, which makes it easy to use the result immediately in code or in a design file.\n\n- The arithmetic is exact and simple.\n- Each channel, from zero to two hundred and fifty-five, is subtracted from that maximum, so the red, green and blue values are mirrored around the midpoint.\n- Because each channel inverts independently, saturated colors invert to other saturated colors and neutrals stay neutral, which makes the operation predictable.\n- A very dark color inverts to a very light one and vice versa, so the luminance of the result is the mirror of the input.\n\nUse it whenever you need to invert a color as part of a technical transformation: generating a dark-theme counterpart for a light-theme value, finding the exact opposite for a debug overlay, or building a negative filter for an image pipeline. Because the operator is its own inverse, applying it twice returns the original color exactly, which makes it safe in a round trip and easy to verify by inspection rather than by trust.\n\n- The inversion is not the same as a perceptual complement, and it is worth knowing the difference.\n- Rotating hue by one hundred and eighty degrees in a perceptual space keeps lightness and saturation while swinging the hue; subtracting channels in RGB also flips the lightness, so a light blue becomes a dark yellow rather than a light orange.\n- If your goal is a harmonious opposite, a perceptual complement is usually the better choice.\n- When you specifically want the literal photographic negative, this is the invert hex color operation you want.\n\nAs a negative color generator it is a small, single-purpose tool, and that is the point. It calculates one result accurately and shows it with a copy button, with no options to misconfigure. Pair it with the color format converter when the inverted value needs to be expressed in another notation, or with the color distance calculator when you want to know how far the inversion actually moved the color in a measurable sense.\n\nBear in mind what the result is for. An inverted color is almost never a color you would choose for a design; it is a transformation step. It shows up in image-processing pipelines that build a negative filter, in test harnesses that need a guaranteed-unique color against a known background, and in dark-mode migrations, where inverting an existing light value gives a fast first draft that you then adjust by hand. Because the arithmetic is trivial to reproduce, the inverted value also makes a decent audit entry: if a stored color and its recorded negative ever stop matching, something upstream has changed the original. Treated as a starting point rather than a finished color, the inverted value saves you the arithmetic and gives you something concrete to tune.",
    howTo: [
      { step: "Set the colour in the field." },
      { step: "Read the inverted swatch beside it." },
      { step: "Copy the hex value for the transformation you are building." },
      { step: "Check the contrast if the inverted value will carry text — the inversion is arithmetic and can take the pair too close." },
    ],
    whenToUse:
      "Use the inverter for literal RGB negatives such as dark-theme counterparts and negative filters. Use a complement finder when you want a harmonious opposite that keeps the original lightness rather than flipping it. The {{color-complement-finder|complement finder}} produces the perceptual opposite rather than the negative, and the {{contrast-checker|contrast checker}} is where an inverted pair gets judged before it is used.",
    faqs: [
      {
        q: "How is the inversion calculated?",
        a: "Each red, green and blue channel is subtracted from 255, so the values mirror around the midpoint. The operation is exact and lossless.",
      },
      {
        q: "Is this the same as a complementary color?",
        a: "No. A perceptual complement rotates the hue while keeping lightness; inversion also flips lightness, so a light color becomes a dark opposite.",
      },
      {
        q: "What happens if I invert twice?",
        a: "You get the original color back exactly, because the operation is its own inverse. That makes it safe to use in a round trip.",
      },
      {
        q: "Can it invert a whole image?",
        a: "This tool inverts a single color. The image effects section applies the same idea across every pixel for a negative filter.",
      },
      {
        q: "Is an inverted colour the same as the complementary colour?",
        a: "No. Inversion subtracts each channel from two hundred and fifty-five, which is an arithmetic negative rather than a perceptual relationship: a mid blue inverts to a dull amber, while its complement on the wheel is a warm orange at the same lightness and chroma.",
      },
    ],
  },

  "color-json-generator": {
    keywords: [
      "color json generator",
      "palette to json",
      "generate json color palette",
      "json color object generator",
    ],
    intro:
      "The color json generator turns an editable list of colors into a keyed JSON object you can paste into a config file, theme module or token pipeline.",
    content:
      "The color json generator turns a working palette into a JSON object you can paste straight into a project. You edit a list of colors, add or remove entries, and the tool produces a keyed object where each color is written under a generated name with its uppercase hex value. It is the quickest way to get a palette out of your head and into a configuration file, a theme module or a design-token pipeline without hand-writing the braces. If you have ever had to convert a palette to json by hand, this replaces the whole chore.\n\nThe shape it produces is deliberately minimal and valid:\n\n- One key per colour, generated positionally as color-1, color-2 and upward.\n- Every value an uppercase six-digit hex string, so the values stay exact and there is no rounding to think about when the file is read back.\n- A pretty-printed object with two-space indentation, so the result reads cleanly in a diff and drops straight into a .json file or a JavaScript module.\n\nThe output is deliberately minimal and valid. Each entry is a string key mapped to a hex string, wrapped in a pretty-printed object with two-space indentation, so the result reads cleanly in a diff and can be dropped into a .json file or a JavaScript module without editing. Because hex is used throughout, the values stay exact and there is no rounding to think about when the file is read back.\n\nUse it when you want to generate a json color palette that downstream code can consume by key rather than by literal. Referencing colors by name is what makes a theme change survivable: updating one value in the JSON updates every consumer, whereas scattered literals have to be hunted down one at a time. Starting that file from a generated object, rather than typing it, also removes the risk of a stray comma that would break the parse.\n\nThe palette editor is live: add a colour, remove one, or change a value, and the object updates as you type. The keys are positional — color-1, color-2 and so on — so the JSON is a scaffold rather than a finished naming scheme. Role-based keys such as surface or danger survive a rebrand, while keys named after position do not, and that renaming happens in the file after the copy.\n\nAs a json color object generator it is intentionally narrow:\n\n- It produces one flat object rather than a full token system with types and descriptions, so the richer shape design tooling expects belongs to the design token generator.\n- The keys are positional, which leaves the naming work to you after the copy.\n- Hex is the only notation in the output — no rgb(), no hsl() and no alpha channel.\n\nWhere it earns its place is in the handoff between design and code. A designer picks colors by eye and a developer needs them as data, and this is the shortest path between the two: paste the palette in, copy the object out, commit it. Because the output is a plain object rather than a component or a build step, it can feed a Tailwind config, a CSS-in-JS theme, a charting library or a snapshot test with no adaptation at all. If a teammate asks how to generate json color palette entries that their code can read by key, this tool produces exactly that in a few seconds, and the result stays readable enough that a reviewer can check it by eye in a pull request.",
    howTo: [
      { step: "Set each colour in the palette rows, adding or removing entries until the list is complete." },
      { step: "Watch the JSON panel update as the list changes." },
      { step: "Copy the object and paste it into a JSON file, a theme module or a config." },
      { step: "Rename the positional keys to the roles the colours serve." },
    ],
    whenToUse:
      "Use this generator for a plain, keyed JSON palette. Use the design token generator when the target tooling needs typed tokens, and the colour token generator when you want hex, rgb and hsl recorded per color. When the target tooling needs typed tokens the {{design-token-generator|design token generator}} is the richer shape, and when each colour should carry hex, rgb and hsl side by side the {{color-token-generator|color token generator}} records all three.",
    faqs: [
      {
        q: "What shape is the output?",
        a: "A pretty-printed JSON object whose keys are generated color names and whose values are uppercase hex strings, ready to paste into a config or module.",
      },
      {
        q: "Can I rename the keys?",
        a: "The editor generates names as you add colors. For role-based naming, treat the output as a starting point and rename in your code, or use the design token generator.",
      },
      {
        q: "Are the values exact?",
        a: "Yes. The tool writes hex throughout, so there is no rounding or precision loss when the file is read back.",
      },
      {
        q: "Does it validate the JSON?",
        a: "The output is generated from the palette and is structurally valid by construction, including correct comma placement, so it will not break on a trailing-comma error.",
      },
      {
        q: "Are the generated keys role-based?",
        a: "No. Keys are positional — color-1, color-2 and so on — because the tool cannot know what each value is for. Renaming them to roles such as surface or danger happens in the file after the copy.",
      },
    ],
  },

  "color-lighten-tool": {
    keywords: [
      "color lighten tool",
      "lighten a color",
      "lighten hex color by percentage",
      "make a color lighter",
    ],
    intro:
      "The color lighten tool raises any color's lightness by a chosen percentage, producing a lighter value that keeps the original hue and saturation intact.",
    content:
      "The color lighten tool raises a color's lightness by a percentage you choose, returning a lighter version that keeps the original hue and saturation. Drag the slider and the tool lifts the color's perceptual lightness by that fraction, then shows the result as a large swatch beside your input. It answers the question that comes up constantly in interface work: what is the light, hover or highlight version of this exact color, written as a value you can paste?\n\n- The lightening is applied in OKLCH rather than by adding to the red, green and blue channels.\n- That choice keeps the result clean.\n- Raising channels independently tends to wash out saturation as the values climb, so a blue lightened enough starts to look pale and grey, and a saturated orange drifts toward yellow.\n- Working on the lightness axis alone means the lighter color is recognisably the same color, only brighter, with hue and chroma preserved by construction.\n\n- The slider spans zero to one hundred percent, which covers everything from no change to very nearly white, but most useful lightening sits in a narrower band.\n- Five to fifteen percent gives a subtle highlight or hover state, twenty to thirty gives a distinctly lighter surface, and beyond that you are usually looking at a genuinely different tone rather than a state.\n- Because the swatch updates live, you can find that band by eye rather than guessing a number and checking it afterwards.\n\nBuilding states from a base color is the primary use. A design system typically needs a base, a hover and a highlight value for every interactive color, and deriving them by lightening keeps the relationships consistent across the whole palette. When the base later changes, the derived states change with it rather than drifting apart, which is the maintenance benefit of deriving rather than hand-picking. If you need to lighten hex color by percentage inside a token pipeline, the result is a plain hex string you can store directly.\n\nTwo things to watch. First, as you lighten a color its contrast against light backgrounds falls, so a hover state that is too light can lose legibility against a pale surface; verify pairings with a contrast checker. Second, if you want a softer rather than simply brighter tone, pair lightening with a chroma adjustment using the saturation tools. Used for states and light variants, though, it is a fast and predictable way to make a color lighter without drifting its hue.\n\nIt is also worth lightening in small steps when you are building a ramp. Rather than asking for one big jump, run the base through the tool several times, feeding each result back in, and you get a sequence of increasingly light tones that share the original hue exactly. That sequence is more dependable than sampling a lightness slider at random positions, because every step derives from the last rather than from the base independently. Record the percentages you used and the ramp can be rebuilt elsewhere, since it is a simple, repeatable rule rather than a set of hand-chosen colors.",
    howTo: [
      { step: "Set the colour in the field." },
      { step: "Drag the slider to the percentage of lightening you want, from zero to one hundred." },
      { step: "Read the result swatch and copy its hex." },
      { step: "Check the contrast if the lighter value will carry text." },
    ],
    whenToUse:
      "Use this tool to derive hover, highlight and light-surface variants from a base color. Use the darken tool for the opposite direction, and the tint generator when you want a whole ramp of lighter steps rather than one value. The {{color-tints-generator|tint generator}} lays out ten lighter steps at once, and the {{color-darken-tool|darken tool}} is the same operation in the other direction.",
    faqs: [
      {
        q: "Does lightening change the hue?",
        a: "No. Lightness is raised in OKLCH while hue and chroma are held, so the result is recognisably the same color, just brighter.",
      },
      {
        q: "How much should I lighten for a hover state?",
        a: "Five to fifteen percent is typical for a subtle state and twenty to thirty for a distinctly lighter one. Judge it on the live swatch rather than a fixed rule.",
      },
      {
        q: "Why not just increase the RGB values?",
        a: "Raising channels independently washes out saturation. Adjusting perceptual lightness keeps the color stable instead of drifting toward grey.",
      },
      {
        q: "Does a lighter colour always reduce contrast?",
        a: "Against light backgrounds, yes. On dark surfaces a lighter color gains contrast, so check the pairing with a contrast checker before using it for text.",
      },
      {
        q: "What happens at one hundred percent?",
        a: "The colour goes to pure white: lightness is raised in OKLCH, so the whole step happens on the lightness axis with hue and chroma preserved. Contrast against light backgrounds falls as the value rises, which is the thing to watch when building a state.",
      },
    ],
  },
};
