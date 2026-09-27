import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 25.
 *
 * visual-weight-analyzer through wes-anderson-style-palette. Each entry is written
 * against the component the registry wires for that slug: the OKLCH weight display,
 * the warm-band generator, the hue-band temperature verdict, the two fixed-threshold
 * WCAG variants, the 216-swatch cube and the Wes Anderson themed preset.
 */
export const SEO_BATCH_25: Record<string, ToolSeo> = {
  "visual-weight-analyzer": {
    keywords: [
      "visual weight analyzer",
      "color weight comparison",
      "which color is heavier",
      "oklch lightness",
      "palette weight",
    ],
    intro:
      "The visual weight analyzer sorts a palette by OKLCH lightness and sizes each swatch in proportion, so it is obvious at a glance which colors carry more weight.",
    content:
      "The palette editor at the top holds five colours and behaves like every other palette tool in this domain: swatches can be changed, added and removed. The default set is black, a blue, a purple, a green and white. Below the editor, a card titled Heaviest to lightest lays the same colours out as squares, ordered by lightness so that the darker a colour is, the larger its square, with each hex value available in a tooltip.\n\n- The ordering is by oklch lightness and nothing else, which keeps the comparison honest.\n- Hue and chroma cannot influence the order at all, so a vivid yellow and a dull one of the same lightness land in the same place.\n- That matters because visual weight is often read in practice as saturation, and this tool deliberately separates the two questions rather than blending them.\n\nSize encodes the same quantity a second time, and that is what makes the arrangement legible. A square's side is thirty pixels plus eighty scaled by one minus lightness, so white arrives at the floor of about thirty pixels and black at roughly a hundred and ten. The order already said which colour is heavier; the sizing shows how much, so a palette with two colours close in lightness reads as two similar squares while a wide spread reads as a staircase.\n\nIn use this answers questions that come up whenever a palette is assembled without a scheme. Which colour should be the background? Which one is carrying more attention than the area it holds deserves? Will these two mid-tones read as a pair? Turning the comparison into a shape makes those calls quicker, and it is the fastest way to notice that an accent sits at the same weight as the surface it is meant to sit on.\n\nThe default palette is a demonstration in itself. Black sits at the bottom of the lightness range and white at the top, and their squares are the two extremes of the row; the blue, purple and green in between land in a narrow band of sizes because all three are mid-tone. Replacing one of them with a pale tint or a deep shade changes the shape of the row immediately, which is the fastest way to see how much of a palette's apparent balance comes from lightness alone rather than from the hues chosen.\n\n- Some limits follow from the design.\n- Perceptual weight is more than lightness, and the tool does not pretend otherwise: area, saturation, position and surrounding colours all contribute in a real interface and none of them appear here.\n- The default five colours are only a starting point, the sort direction cannot be flipped, and no numbers are printed beyond the hex values in the tooltips.\n\nWithin those bounds the page does one thing cleanly. As a color weight comparison it orders a palette by oklch lightness and renders that gradient as area, which is a good deal more useful than it sounds — a visual weight analyzer answers which color is heavier in a set without arithmetic, and the palette weight view makes the answer readable in a single glance.",
    howTo: [
      { step: "Edit the palette in the top card, or keep the default five as a starting point." },
      { step: "Read the squares in the Heaviest to lightest card — they are ordered by lightness and sized in proportion." },
      { step: "Hover a square to read its hex value if you need the exact colour." },
    ],
    whenToUse:
      "Use this when a palette needs its tonal hierarchy checked — deciding a surface, spotting an accent that is too heavy, or confirming a set has enough spread. Use the palette balance analyzer when the question is the mix of light and dark rather than the order. The {{palette-balance-analyzer|palette balance analyzer}} puts numbers to the same lightness story across a set, and the {{color-hierarchy-analyzer|hierarchy analyzer}} applies the weights to three roles in context.",
    faqs: [
      {
        q: "What decides the order?",
        a: "OKLCH lightness alone. Hue and chroma are ignored, so two colours of the same lightness sit together however different they look.",
      },
      {
        q: "What do the square sizes mean?",
        a: "Side length scales from about thirty pixels for the lightest colour to roughly a hundred and ten for the darkest, so the sizes show the size of the gaps as well as the order.",
      },
      {
        q: "Does saturation affect the result?",
        a: "No. A muted colour and a vivid one with the same lightness are placed identically, which is deliberate — it keeps the measurement to one variable.",
      },
      {
        q: "Can I sort the other way round?",
        a: "No. The display is always heaviest to lightest, and there is no control to reverse it or to sort by chroma instead.",
      },
      {
        q: "Does lightness alone determine visual weight?",
        a: "No. Area, saturation, position and surrounding colours all contribute in a real interface and none of them appear in the measure, so the ordering is a statement about lightness rather than a complete account of weight. The default five colours are a starting point, and the sort direction cannot be flipped.",
      },
    ],
  },

  "warm-color-generator": {
    keywords: [
      "warm color generator",
      "warm colors palette",
      "red orange yellow colors",
      "generate warm colors",
    ],
    intro:
      "The warm color generator produces five colours drawn from the red, orange and yellow band of the wheel, with a single button that re-rolls the whole set.",
    content:
      "One button does all of it: Generate warm palette. Each press fills five swatches with new colours drawn from the warm arc of the hue circle, from three hundred and forty degrees around through red and orange to eighty degrees. The colours are generated after the page mounts rather than during rendering, so a fresh load never starts with an empty grid and the first paint is stable.\n\nThe arc is defined in OKLCH and covers the warm half of the wheel deliberately. The band runs from just before red, through the reds and oranges, to the yellow-green boundary, so nothing in the set can drift into blues, greens or purples. Hue is randomised within that band, which means one press can produce an orange-heavy set and the next a red-heavy one, and both are still unmistakably warm.\n\n- Lightness is held between roughly fifty-five and seventy-five percent and chroma between about 0.12 and 0.2, the range that keeps a colour warm without turning it into a pastel or a fluorescent accent.\n- All three values are randomised independently, so there is no guarantee the five colours harmonise with each other: they share a temperature, not a scheme, and the result is best read as a pool of candidates rather than a finished palette.\n\nThat distinction is the practical point. Building a warm colors palette usually starts from a mood rather than a fixed brand value — a food brand, an autumn campaign, a hospitality interface, a warning set that should feel energetic rather than alarming. Generating five plausible hues in one press is a faster way to explore that space than dragging a picker along the warm edge by hand.\n\nWhat it will not do is keep a hue. There is no lock, no seed, no single-colour mode and no way to ask for warmer or milder; every press is a fresh draw from the same band. Nothing is printed except the hex value on each swatch, and there is no naming, no contrast checking, no gradient or token export and no distinction between a warm accent and a warm surface.\n\nCompare the output with its neighbours and the narrowness is the point. The cool generator draws from the opposite arc of the wheel, the pastel and neon generators fix a lightness or a chroma and let hue travel the whole circle, and the themed presets fix both. This one fixes nothing except the band, so two presses in a row give genuinely different palettes while both stay warm — which is what makes it good for exploring a direction rather than for producing a specification.\n\nLimits, side by side with the useful part: five colours, one band, one button and no control beyond pressing it again.\n\n- Used as a warm color generator it is exactly as narrow as that sounds, and it earns its place by removing the hardest step — choosing the first red.\n- To generate warm colors here means working with red orange yellow colors as a starting point, five hex values to react to rather than an empty picker.",
    howTo: [
      { step: "Press Generate warm palette; five colours appear in the red, orange and yellow band." },
      { step: "Press again to re-roll the set — each press is a fresh draw from the same arc." },
      { step: "Note the hex value of any swatch worth keeping before pressing again, since nothing is locked." },
    ],
    whenToUse:
      "Use this when a project needs a warm starting point and the hue matters less than the temperature — food, hospitality, autumn campaigns. Use the themed palette generators when the whole set should follow a concept, or the cool colour generator when the mood is the opposite one. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "Which hues can appear?",
        a: "Only the warm arc: from about three hundred and forty degrees through red and orange to eighty degrees. Blues, greens and purples are outside the band and cannot be produced.",
      },
      {
        q: "Are the five colours designed to work together?",
        a: "Not as a scheme. They share a temperature range but each is drawn independently, so the set is a pool of candidates rather than a harmony.",
      },
      {
        q: "Can I regenerate to keep one colour?",
        a: "No. There is no lock and no seed, so a re-roll replaces all five. Copy a hex value you want to keep before pressing the button again.",
      },
      {
        q: "Does this produce pastels or neon colours?",
        a: "Neither. Lightness stays between about fifty-five and seventy-five percent and chroma between 0.12 and 0.2, which keeps the colours warm and moderately saturated.",
      },
      {
        q: "What does the warm color generator not do?",
        a: "Used as a warm color generator it is exactly as narrow as that sounds, and it earns its place by removing the hardest step — choosing the first red. To generate warm colors here means working with red orange yellow colors as a starting point, five hex values to react to rather than an empty picker.",
      },
    ],
  },

  "warm-cool-analyzer": {
    keywords: [
      "warm cool analyzer",
      "warm vs cool colors",
      "is my color warm or cool",
      "hue based temperature",
      "color temperature classification",
    ],
    intro:
      "The warm cool analyzer classifies a colour as warm or cool from its hue alone, reporting the degrees it used and the family that follows from them.",
    content:
      "Pick a colour and the tool returns a verdict. The card on the right is titled Temperature and shows either Warm or Cool in large type, then a line recording the hue in degrees and a short family description. The rule behind it is fixed: a hue between zero and seventy degrees, or at three hundred and twenty degrees and above, is warm; everything else is cool.\n\n- The line is drawn where it is because of where the warm range sits on the wheel.\n- Orange and red occupy the low degrees, and red continues past the end of the circle into the three-hundreds, where magenta begins, so the classification has to handle the wrap-around at three hundred and sixty.\n- The test compares the hue against two bands joined at that seam and covers the full circle without a gap.\n\nCool is the answer for anything outside those bands, which places mid greens and mid cyans firmly on the cool side. Violet around three hundred degrees is judged cool as well, since the warm band does not begin until three hundred and twenty — arguable to the eye, but consistent, and the boundary is at least stated rather than implied.\n\nThe verdict is about hue only. Lightness and chroma are ignored, so a near-black green and a vivid green are both cool, and a pale yellow and a saturated orange are both warm. That keeps the answer reproducible and narrowly defined, and it explains the cases where the tool disagrees with the eye: near-neutral colours have no meaningful hue, and their verdict follows whatever small hue residue they carry.\n\nThe boundary values are worth remembering, because the two bands are the entire rule. A hue of exactly seventy degrees is warm and seventy-one is cool; three hundred and nineteen is cool and three hundred and twenty is warm. Colours that straddle the line — an orange-yellow, a violet-red — flip their verdict on a single degree, and the hue printed in the card makes it easy to see when a colour is close to an edge rather than comfortably inside one band.\n\nThe honest uses are the ones that depend on the definition rather than on taste. Sorting a library of colours into warm and cool batches, checking that a set is not accidentally all warm, and verifying that a hue written into a specification really is on the warm side are all quick here. The question of whether a palette feels warm is a different one, and this page deliberately does not answer it.\n\n- Limits: one colour, one answer, a fixed threshold, no family naming beyond the warm or cool verdict and its short description, no lightness or saturation input and no palette view.\n- It is a color temperature classification with exactly one input: as a warm cool analyzer it turns warm vs cool colors into a number and a band, and for anyone asking is my color warm or cool, the hue based temperature reading is one pick away.",
    howTo: [
      { step: "Pick the colour to classify." },
      { step: "Read the verdict: Warm for hues from 0 to 70 degrees or from 320 to 360, Cool otherwise." },
      { step: "Note the reported hue if the colour sits near the 70 or 320 degree boundary." },
    ],
    whenToUse:
      "Use this when a colour has to be sorted into a warm or cool group and the definition matters more than the impression — building batch palettes, checking a specification, keeping a set consistent. Use the colour psychology or mood tools when the question is about feeling rather than hue. The {{color-temperature-analyzer|temperature analyzer}} puts a Kelvin figure on a single colour, the {{color-temperature-adjuster|temperature adjuster}} acts on the reading, and the {{warm-to-cool-color-shifter|warm-to-cool shifter}} moves a value across the line.",
    faqs: [
      {
        q: "How is the boundary decided?",
        a: "Hues from 0 to 70 degrees and from 320 to 360 degrees are warm; everything in between is cool. The band wraps across the end of the circle so reds on both sides are treated the same.",
      },
      {
        q: "Why is violet rated cool?",
        a: "Because the warm band stops at 320 degrees. Violet sits below that, so it falls on the cool side even though it neighbours magenta.",
      },
      {
        q: "Is saturation taken into account?",
        a: "No. Only the hue angle is tested, so a desaturated colour's verdict follows the small amount of hue it still carries.",
      },
      {
        q: "Can I check a whole palette?",
        a: "Not on this page — it takes one colour at a time. A palette-wide temperature read is a different tool in this domain.",
      },
      {
        q: "Does it name colour families beyond warm and cool?",
        a: "No. The rule is two bands and a fixed threshold: anything outside the warm hues is cool, so mid greens and mid cyans land firmly on the cool side and there is no family naming beyond the warm or cool verdict. Lightness and chroma are ignored, which means a near-black green and a vivid green return the same answer.",
      },
    ],
  },

  "wcag-21-aa-checker": {
    keywords: [
      "wcag 2.1 aa checker",
      "4.5 to 1 contrast",
      "wcag 2.1 aa contrast",
      "normal text contrast",
    ],
    intro:
      "WCAG 2.1 AA Checker gives a single pass-or-fail verdict against the 4.5 to 1 contrast minimum that WCAG 2.1 AA sets for normal text.",
    content:
      "WCAG 2.1 AA Checker gives one answer to one question: does this pair of colors reach 4.5 to 1, the contrast minimum that WCAG 2.1 AA sets for normal text. Instead of the four badges a general checker shows, this page compares your pair against a single fixed threshold and prints Pass or Fail beside it.\n\nThe AA level of WCAG 2.1 is the one most projects are held to, and it is defined across two conditions rather than one:\n\n- Normal text needs 4.5 to 1, which covers body copy, labels, table cells and anything else read at ordinary size.\n- Large text needs 3 to 1, where large means roughly 24px, or 18.66px when bold.\n\nThe verdict on this page is decided at 4.5 to 1 for every pair you enter, so the large-text allowance is not applied. That is a deliberate simplification for the common case of checking body copy, and it is also the one behaviour to know about before you use the result to sign off a heading.\n\nThe measurement behind the verdict is the standard WCAG 2.x contrast ratio. Both colors are converted to sRGB and linearised, then weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance. The lighter luminance plus 0.05 is divided by the darker plus 0.05, and the result is rounded to two decimals before the comparison. Because the comparison is a hard boundary rather than a gradient, a pair at 4.49 to 1 fails and a pair at 4.5 to 1 passes, with nothing in between.\n\nRead the result as a WCAG 2.1 AA contrast verdict for the pair, with the 4.5 to 1 contrast minimum as the only line being tested. Normal text contrast is the case the page is built around, which is why it applies that figure regardless of how large the text actually is. The verdict does not grade how far above the bar you land, so a pair at 4.5 to 1 and a pair at 12 to 1 are both simply Pass. When the margin between the two matters, the ratio printed beside the verdict is where that difference shows.\n\nA few things sit outside what a single-threshold check can tell you.\n\n- Large text is judged at the same 4.5 to 1 as body copy here, so a heading pair that only reaches 3 to 1 reports Fail even though WCAG 2.1 AA permits it for large type.\n- AAA is not evaluated at all. A passing pair tells you nothing about whether it reaches the 7 to 1 enhanced level.\n- The check covers text contrast only. Component boundaries, focus indicators and graphical objects are governed by the non-text requirement and are not assessed.\n- Two colors are compared, with no alpha and no third surface behind them.\n- The verdict says nothing about size, weight or how the text is actually rendered.\n\nUse this page when AA is the requirement you have agreed to and you want an unambiguous yes or no rather than a table. If the pair is a heading, check it against the large-text threshold instead, and if the pair is a boundary rather than text, the component and focus checks are the ones that apply.",
    howTo: [
      { step: "Pick the foreground color first, in the field labelled Foreground." },
      { step: "Pick the background color in the second field." },
      { step: "Read the ratio in the panel heading, to two decimal places." },
      { step: "Check the Pass or Fail line beneath it, which compares the ratio against 4.5 to 1 and shows the threshold in the same sentence." },
    ],
    whenToUse:
      "Use the WCAG 2.1 AA checker when AA is the level written into the brief and you want a single verdict for a body-copy pair. Pair it with the {{wcag-21-aaa-checker|WCAG 2.1 AAA checker}} when a project has to satisfy both levels, the {{large-text-contrast-checker|large text contrast checker}} when the pair is a heading rather than body copy, and the {{contrast-checker|contrast checker}} when you want all four thresholds side by side instead of one gate.",
    faqs: [
      {
        q: "Why does my heading pair fail here when it looks acceptable?",
        a: "Because this page applies the 4.5 to 1 normal-text minimum to everything it is given. WCAG 2.1 AA allows 3 to 1 for large text, so a heading pair in the 3 to 1 to 4.5 to 1 range is permitted but will still show as Fail here. Check those pairs against the large-text threshold instead.",
      },
      {
        q: "Is a pass here enough to claim WCAG 2.1 AA conformance?",
        a: "No. It confirms the contrast minimum for one text pair. AA covers many other requirements, and even within contrast it also sets a 3 to 1 requirement for non-text elements, which this check does not look at.",
      },
      {
        q: "What happens if my pair lands exactly on 4.5 to 1?",
        a: "It passes. The comparison is greater than or equal to the threshold, and both the ratio and the threshold are read at two decimal places, so an exact match is a pass rather than a borderline case.",
      },
      {
        q: "Does the checker account for text color over a gradient?",
        a: "No. It measures two solid colors. For text sitting on a gradient, check the lightest and darkest points separately and treat the worst result as the one that governs the pairing.",
      },
      {
        q: "Should I darken the text or lighten the background to reach the threshold?",
        a: "Either changes the ratio, but they are not equivalent in practice. Adjusting the larger area usually costs less visually, so lightening a dark background slightly is often the cheaper fix, while darkening the text is the better choice when the background is locked by a brand palette.",
      },
    ],
  },

  "wcag-21-aaa-checker": {
    keywords: [
      "wcag 2.1 aaa checker",
      "7 to 1 contrast",
      "aaa contrast verdict",
      "enhanced contrast ratio",
    ],
    intro:
      "WCAG 2.1 AAA Checker tests a color pair against the 7 to 1 enhanced contrast level, the stricter of the two thresholds WCAG 2.1 defines.",
    content:
      "WCAG 2.1 AAA Checker tests a pair of colors against 7 to 1, the enhanced contrast level that WCAG 2.1 defines above the ordinary AA minimum. It reports one ratio to two decimal places and one verdict, which makes it the fast way to find out whether a pair is anywhere near the stricter standard before you commit design time to it.\n\nThe AAA level is defined at two sizes, and both are above their AA counterparts:\n\n- Normal text needs 7 to 1, a substantial step up from the 4.5 to 1 that AA requires.\n- Large text needs 4.5 to 1, which is the same figure AA asks of body copy.\n\nThe verdict here is decided at 7 to 1 regardless of the size of the text, so the large-text allowance is not applied and a heading pair that clears AAA for large text will still report Fail.\n\nThe underlying figure is the WCAG 2.x contrast ratio. Each color is converted to sRGB, its channels are linearised, and the three linear values are weighted 0.2126 red, 0.7152 green and 0.0722 blue into relative luminance. The ratio is the lighter luminance plus 0.05 over the darker plus 0.05, rounded to two decimals before it is compared against the threshold. Reaching 7 to 1 usually means one color is very light and the other very dark, which is why AAA layouts tend to look high-contrast and spare rather than rich.\n\nRead the result as the AAA contrast verdict for the pair, with the 7 to 1 contrast threshold as the single line being tested. The page does not report how much headroom a passing pair has, so one that scrapes the threshold and one far beyond it carry the same verdict, and the enhanced contrast ratio printed in the panel heading is where that difference becomes visible. If the figure sits close to the line, treat it as unproven and move a color further before relying on it.\n\nWhat this single gate cannot tell you is as important as what it can.\n\n- Large text is judged at 7 to 1, not the 4.5 to 1 that AAA actually permits, so the check is stricter than the specification for headings.\n- It says nothing about AA. In practice anything that passes 7 to 1 also passes 4.5 to 1, but the page does not confirm that for other pairs in your palette.\n- Non-text contrast is excluded. Component boundaries and focus rings are not evaluated, and they carry their own 3 to 1 requirement.\n- No alpha, no gradients and no third surface behind the pair.\n- Font weight and rendered size are not inputs, so the verdict describes the colors and not the typography.\n\nReach for this page when AAA is a contractual or accessibility-policy requirement rather than a preference, such as public-sector work or a design system that ships an enhanced mode. If the resulting constraint flattens a palette you care about, the honest answer is usually to satisfy AAA in the reading surfaces and use AA elsewhere, rather than compromising the whole scheme.",
    howTo: [
      { step: "Set the foreground color and the background color in the two swatch fields." },
      { step: "Read the ratio shown in the panel heading, accurate to two decimal places." },
      { step: "Check the Pass or Fail line, which compares that figure against 7 to 1." },
      { step: "If it fails, adjust whichever color is easier to move and re-read the ratio, since small lightness changes move the figure sharply near the top of the scale." },
    ],
    whenToUse:
      "Use the WCAG 2.1 AAA checker when a policy, contract or accessibility statement commits you to the enhanced level, most often for long-form reading text that has to hold up for everyone. Use the {{wcag-21-aa-checker|WCAG 2.1 AA checker}} when AA is the agreed bar, the {{wcag-30-apca-checker|WCAG 3.0 APCA checker}} when you are questioning whether a ratio gate reflects perceived contrast at all, and the {{palette-accessibility-checker|palette accessibility checker}} when a whole palette rather than one pair has to be assessed.",
    faqs: [
      {
        q: "How much harder is AAA than AA in practice?",
        a: "Considerably. AA for body copy is 4.5 to 1 and AAA is 7 to 1, so the pair has to be pushed further apart in lightness. On a light background that typically means a text color below roughly a third of the background's luminance, which rules out most mid-tone brand colors for body copy.",
      },
      {
        q: "Does AAA require 7 to 1 for headings too?",
        a: "No. WCAG 2.1 sets 4.5 to 1 for large text at AAA. This page applies the stricter 7 to 1 to everything it is given, so a heading pair in between the two figures is acceptable by the specification but will report Fail here.",
      },
      {
        q: "Is AAA the highest level WCAG defines?",
        a: "For contrast, yes. AAA is the top of the three conformance levels in WCAG 2.1, and contrast is one of the few requirements where meeting it is realistic for an entire site rather than an aspiration.",
      },
      {
        q: "Will AAA contrast make my interface look flat?",
        a: "It can, because it forces a wide separation between text and its surface. The usual way through is to keep AAA for reading surfaces and body copy and let decorative fills, illustrations and non-text elements carry the visual character of the design.",
      },
      {
        q: "Can a mid-tone color ever pass at 7 to 1?",
        a: "Only against a surface at the opposite end of the lightness range. The ratio depends on the difference between the two luminances, so a mid-tone works if the background is much lighter or much darker, but it will not reach the threshold against a surface of similar lightness.",
      },
    ],
  },

  "web-safe-color-palette": {
    keywords: [
      "web safe color palette",
      "216 web safe colors",
      "netscape color cube",
      "browser safe hex",
      "websafe color chart",
    ],
    intro:
      "The web safe color palette lays out all 216 colours of the browser safe cube — every combination of 0, 51, 102, 153, 204 and 255 — as one grid of swatches.",
    content:
      "The page is a single grid: two hundred and sixteen coloured squares, six across on a narrow screen and twelve across on a wide one. Each square is one of the browser safe values, and each carries its hex code in a hover tooltip; there are no labels in the grid and no copy buttons, so this reads as a reference chart rather than a working palette.\n\nThe set is built by taking six channel values — zero, fifty-one, one hundred and two, one hundred and fifty-three, two hundred and four and two hundred and fifty-five — and combining them in every order. Six values to the third power is two hundred and sixteen, and the arrangement is the classic Netscape color cube: a regular lattice in which neighbouring squares differ by exactly one step in a single channel, which is why each band reads as a gradient of one primary.\n\nStructurally the grid is a map of RGB space. Read left to right and the red channel climbs in six steps; move down and the green channel does the same; the blue channel changes in blocks. Any colour in the set can be described by three indices rather than by a hex string, which is why designers once kept the cube in their heads. As a web safe color palette it is also a reminder of how coarse those two hundred and sixteen values are: two neighbouring squares can differ by so little that no modern display would call them distinct.\n\n- The historical reason for the cube was dithering.\n- Displays that could not render arbitrary colours approximated them by mixing pixels from a fixed palette, and staying on the grid avoided both the dithering and the banding that came with it.\n- Modern screens render millions of colours and nothing outside the cube is unsafe any more, so this is a reference rather than a constraint — the name survives because the set is still a clean, evenly spaced lattice.\n\nThat even spacing is what keeps it useful. Because every step is a fixed fifty-one in one channel, the cube is a dependable source of colours that differ by predictable amounts: handy for building a ramp with no surprises, for choosing two clearly distinct values without hunting for widely varying hues, or for checking a colour against a coarse grid.\n\nWhat the gaps cost is worth stating. Two hundred and sixteen colours contain no vivid modern hue and nothing near the saturated ends of the wheel, so an accent chosen in OKLCH will almost never be in here. The grid also has no search, no way to enter a colour and find its nearest safe value, no labels and no copy interaction, so a value taken from it has to be read from the tooltip and typed by hand.\n\n- Within those bounds, as a browser safe hex reference it is what the name promises: 216 web safe colors in a lattice, useful as a websafe color chart and as a reminder of what the netscape color cube actually contained.\n- Anyone who needs a value from it reads the hex from a hover tooltip, so visible labels and copy buttons are the obvious next step for anyone leaning on it regularly.",
    howTo: [
      { step: "Scan the grid for the region you want — each band steps one primary channel by fifty-one." },
      { step: "Hover a square to read its hex value." },
      { step: "Type the value into your file, since the swatches themselves do not copy." },
    ],
    whenToUse:
      "Use this when you need a fixed, evenly spaced palette for a reference or a constrained system — retro interfaces, quick ramps, teaching the cube. Use the colour picker or the palette generators when the requirement is a modern colour rather than a browser safe one. The nearest value in another fixed set is what the {{nearest-named-color-finder|nearest named color finder}} answers, and the other classic fixed reference is the {{css-named-colors-reference|CSS named colors reference}}.",
    faqs: [
      {
        q: "Why exactly 216 colours?",
        a: "Six channel values — 0, 51, 102, 153, 204 and 255 — combined in every order: six cubed is two hundred and sixteen.",
      },
      {
        q: "Are these colours still safer than others?",
        a: "No. The constraint came from displays that dithered, and modern screens render any hex value. The cube survives as a neat lattice rather than a requirement.",
      },
      {
        q: "Can I enter a colour and find its nearest safe match?",
        a: "Not on this page. The grid is a fixed reference with hover tooltips, so matching an arbitrary colour to the cube has to be done by eye.",
      },
      {
        q: "Are the hex codes labelled?",
        a: "Only in a hover tooltip on each square. There are no printed labels and no copy buttons, which makes the grid a chart rather than a working palette.",
      },
      {
        q: "Why is the grid six wide?",
        a: "Because the cube is built from six channel values — 0, 51, 102, 153, 204 and 255 — so each row of six is one channel stepping through its levels, which is why the layout reads as a cube unfolded rather than as an ordered chart.",
      },
    ],
  },

  "wes-anderson-style-palette": {
    keywords: [
      "wes anderson palette",
      "cinematic color palette",
      "symmetrical pastel colors",
      "film palette generator",
    ],
    intro:
      "The Wes Anderson palette takes one fixed run — orange, rose, mustard, teal and salmon — and pushes it up a lightness ramp from 0.5 to 0.8 into a cinematic colour palette.",
    content:
      "The palette this page produces is built from five hues — 30, 350, 60, 180 and 20 — raked upward from lightness 0.5 to 0.8 with chroma rolled between 0.1 and 0.2. That combination of warm orange, rose and salmon with a mustard and a single cool teal is the colour language people mean by a film palette generator: bright, evenly weighted, and closer to a painted set than to a natural scene. Regenerating rolls only chroma, so the arrangement survives while its intensity moves.\n\n- Hues: a warm orange at 30, a rose at 350, a mustard at 60, a teal at 180 and a salmon at 20.\n- Lightness: 0.5, 0.575, 0.65, 0.725 and 0.8.\n- Chroma: rolled per swatch within 0.1 to 0.2.\n- Output: five hex swatches plus a copyable block of CSS custom properties.\n\nWhat makes the set work compositionally is that four of the five sit on the warm half of the wheel while the teal sits alone on the cool half, and lightness rises through the whole run in the same order. The result is symmetrical in weight rather than in hue: nothing in the strip is dark, nothing is neutral, and the single cool colour gets more attention than its one slot in five would suggest. Designers usually end up assigning it to the element that has to be noticed, and letting the warm four carry the frame.\n\n- It is an approximation of a style, not an official or licensed palette, and no film is sampled to produce it.\n- Everything is light, so the set supplies surfaces and accents but no text colour and no deep ink.\n- Symmetrical pastel colors of this kind are unforgiving about contrast: warm light values in particular look darker than they measure, so pairs need checking rather than trusting.\n- No preset selector, no alpha, and no gradient output — hex tokens and the copy block only.\n\nUsed as a wes anderson palette of convenience, the strip is less an homage than a working register: light, warm, evenly weighted, with one cool note for contrast. A cinematic color palette of that shape is easy to place because nothing in it struggles for attention, which is what suits editorial layouts where photography does the shouting and the palette does the framing.\n\nUse it when a surface should feel staged and graphic: editorial spreads, event branding, packaging with a strong photographic direction, and interfaces that want warmth without noise. Give one element the teal, keep the warm four behind it, and add a deep brown or near-black from the shades tools for text. The sunset generator is the saturated, dusk-weighted version of the same warmth, the vintage generator takes it back to print-like chroma, and the pastel generator is the version with no hue story at all. Which of the four you choose is really a decision about how much colour the layout can carry, so open the page beside a real layout before committing to one of them.",
    howTo: [
      { step: "Open the page for the initial cinematic roll." },
      { step: "Press Regenerate to re-roll chroma while the hue order and rising ramp stay fixed." },
      { step: "Reserve the teal swatch for the element that has to be noticed." },
      { step: "Add a deep neutral from the shade tools before the palette carries any body text." },
    ],
    whenToUse:
      "Use this when a surface should feel composed and graphic rather than natural. The {{sunset-palette-generator|sunset palette generator}} takes the same warmth to full saturation, the {{vintage-retro-palette-generator|vintage retro generator}} moves it towards print, and the {{pastel-palette-generator|pastel palette generator}} is the version with no hue narrative behind it.",
    faqs: [
      {
        q: "Is this an official palette from any film?",
        a: "No. It is a set of hues in a recognised register, generated from fixed parameters; nothing is sampled from a film and no licence is implied.",
      },
      {
        q: "Why does one cool colour appear among four warm ones?",
        a: "It is the counterweight. With only warm hues the palette drifts into monotony, and a single teal gives the eye a comparison that makes the warm values look intentional.",
      },
      {
        q: "Can the palette carry text as it stands?",
        a: "Not comfortably. Every swatch sits at lightness 0.5 or above, so a dark ink from another tool is needed for anything that has to be read.",
      },
      {
        q: "What does Regenerate change?",
        a: "Chroma per swatch, within 0.1 to 0.2. The hue run, its order and the rising lightness ramp are fixed parts of the preset.",
      },
      {
        q: "Where should the teal colour be used?",
        a: "On the single element that must attract attention. It carries more weight than one swatch in five suggests, so spreading it across several elements flattens the composition.",
      },
    ],
  },
};
