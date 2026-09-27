import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 21.
 *
 * Skipped from this window:
 *  - opacity-layering-calculator — flagged; it renders the identical OpacityCalculator
 *    as opacity-calculator (authored here), which composites a colour over a
 *    background rather than layering several translucent surfaces.
 *  - palette-locker — flagged; it renders the palette shuffler with no locking.
 *
 * Code fixed in this batch: palette-comparison rendered two independent editors with
 * no comparative output at all. It now reports colour counts, average lightness and
 * average chroma for each palette, plus any colours the two share.
 */
export const SEO_BATCH_21: Record<string, ToolSeo> = {
  "ocean-beach-palette-generator": {
    keywords: [
      "ocean beach palette generator",
      "coastal color scheme",
      "cool blue palette",
      "sand accent tones",
    ],
    intro:
      "The ocean beach palette generator runs a fixed coastal colour scheme — blues at 200 and 180, a yellow and an orange sand accent, and a closing blue at 220 — along a lightness ramp from 0.55 to 0.85.",
    content:
      "Coastal colour has a shape: cool blues for water and sky, warm sand notes for the shore, and a lot of light. The ocean beach palette generator encodes that shape as a preset. Its hues are 200, 180, 50, 30 and 220 in order, its lightness climbs from 0.55 to 0.85 across the strip, and each swatch's chroma is rolled between 0.08 and 0.16 when you regenerate. The mix of two blues, two warm accents and a returning blue is what makes the set read as a place rather than as a palette.\n\n- Hues: a cyan-blue at 200, a teal at 180, a sand yellow at 50, a warmer orange at 30, and a blue at 220 to close.\n- Lightness: 0.55, 0.625, 0.7, 0.775 and 0.85 across the five swatches.\n- Chroma: rolled per swatch in the band 0.08 to 0.16.\n- Output: five hex swatches plus a copyable block of CSS custom properties.\n\nThe ordering does more work than it first appears. Because lightness rises with the index while the warm hues sit in the middle of the run, the sand accents land mid-ramp and the final swatch returns to blue at the lightest value — so the strip reads as sky, shore, sky again rather than as a list of colours. Anyone assigning roles gets a sensible starting point: the early blues are surfaces, the warm middle notes are highlights, and the closing blue is the lightest surface in the set.\n\n- The palette is bright throughout: nothing below lightness 0.55, so it supplies no dark tone for text or borders.\n- The warm accents are easy to mistake for the palette's purpose; they are accents, and using them as surfaces turns the scheme into something else.\n- Cool blue palettes like this one are the classic case for checking contrast, since light blues fail against white far more often than they look like they would.\n- No preset selector, no transparency and no tokens beyond hex custom properties.\n\nRead as a coastal color scheme, the two blues do the structural work and the two warm notes do the talking. Sand accent tones are what stop a shoreline palette from becoming another cool corporate blue, and giving them the middle of the lightness ramp keeps them between light and shadow rather than at either extreme, which makes them easy to reach for as highlights and hard to confuse with the base of the design.\n\nUse it for travel and hospitality brands, wellness surfaces, anything that should feel like weather and water. Pair it with a deep navy from the shades tools when the layout needs an anchor, and keep the sand hues for emphasis rather than for large fills. The forest generator is the green version of the same preset machinery, the earth-tone generator the warm inland counterpart, and the sunset generator the version of this palette that happens at dusk. Note how much the whole set depends on lightness: bring the same hues down into the 0.35 to 0.55 band and the coastal feeling disappears.",
    howTo: [
      { step: "Open the page for the initial coastal roll." },
      { step: "Press Regenerate to re-roll chroma while the coastal hue order and the light ramp stay put." },
      { step: "Copy the custom-property block, or take individual hex values from the swatches." },
      { step: "Add a deep neutral from the shade tools before the palette has to carry body text." },
    ],
    whenToUse:
      "Use this when the palette should feel light, cool and place-specific — travel, hospitality, wellness and anything marine. The {{earth-tone-palette-generator|earth palette generator}} is the warm inland counterpart, the {{forest-nature-palette-generator|forest palette generator}} the green one, and the {{sunset-palette-generator|sunset palette generator}} the same coast at the end of the day.",
    faqs: [
      {
        q: "Where do the warm colours fit in the strip?",
        a: "In the middle. The hue order runs cool, cool, warm, warm, cool, and lightness rises across it, so the sand accents arrive mid-ramp and the closing blue is the lightest swatch.",
      },
      {
        q: "Why does the palette have no dark colour?",
        a: "Its lightness range starts at 0.55 by design, which keeps the set bright and coastal. Dark tones have to come from elsewhere — the shade tools or a navy from another generator.",
      },
      {
        q: "What varies when I regenerate?",
        a: "Chroma only, rolled between 0.08 and 0.16 per swatch. The hues, their order and the lightness ramp are the preset and never change.",
      },
      {
        q: "Do light blues really need contrast checking?",
        a: "Yes. Pale, low-chroma blues look darker than they measure, and pairs that seem fine in a mock often fail against white text. Measure the pair rather than trusting the swatch.",
      },
      {
        q: "Can I use the sand colours as surfaces?",
        a: "They will work, but the palette stops reading as coastal: the warm notes are there to punctuate two blues rather than to carry the layout.",
      },
    ],
  },

  "oklch-color-playground": {
    keywords: [
      "oklch color playground",
      "oklch color picker",
      "oklch to hex",
      "perceptual color picker",
      "oklch lightness chroma hue",
    ],
    intro:
      "The OKLCH color playground exposes lightness, chroma and hue as three independent sliders and converts the result to a hex value you can copy.",
    content:
      "- The OKLCH color playground gives you three sliders and a swatch.\n- Lightness runs from zero to one hundred percent, chroma from zero to forty percent, and hue through the full three hundred and sixty degrees, with the starting point set at a mid lightness, moderate chroma and a violet hue.\n- The result appears beside the controls as a large swatch with its hex value and a copy button, updating as the sliders move.\n\nThe reason a playground like this exists is that OKLCH separates three things that most people find tangled together in HSL, which is what makes it work as an oklch color picker: the axes stop influencing each other. The swatch beside the sliders doubles as an oklch to hex conversion, so the value you settle on is immediately pasteable. In that older model, hue is an angle, saturation is a percentage and lightness is a percentage, and the three interact in a way that makes them hard to reason about: a yellow at fifty percent lightness and a blue at fifty percent lightness are not equally bright to the eye, and a colour kept at a constant saturation can still look muted at one hue and vivid at another. In a perceptual model, lightness means roughly the same thing at every hue — which is why the same lightness value produces colours that read as equally weighted whether they are red or blue.\n\nChroma is the more unfamiliar term, and in practice it is the one worth experimenting with. It is not saturation in the HSL sense: it measures how far the colour is from grey along the hue's axis, with zero being neutral grey and higher values moving towards the most vivid version of that hue a display can produce. Raising chroma at a constant lightness and hue moves a dusty blue towards a saturated one without making it darker or lighter, which is exactly the adjustment that is difficult to make in older models.\n\n- The upper limit of the chroma slider is what turns this from a demonstration into a useful tool.\n- The maximum chroma available differs by hue and by lightness — yellows and greens can go further at high lightness, blues and violets further at lower ones — so the same chroma value is inside the display's range for some combinations and outside it for others.\n- When the requested colour falls outside the range a screen can show, the conversion returns the closest displayable colour, which means the swatch can stop changing as you push the slider further.\n- That behaviour is informative rather than broken, but it is worth recognising: past a certain point, more chroma is not producing a more saturated colour.\n\nWhere this earns its place is in constructing colour scales and themes. Because lightness and chroma are independent, a set of colours at identical lightness values genuinely looks even rather than merely being numerically equal, which is the property that makes a palette feel deliberate. Building five tints of a brand colour or a sequence of steps for a chart is much more controllable here than it is by eye in HSL.\n\nThe limits: the output is a single colour rather than a palette, there is no colour-space conversion beyond the hex result, no contrast checking, and no history of previous values — so a scale is built by recording values as you go. There is also no gamut warning beyond the swatch quietly refusing to change. Used as a perceptual color picker, though, it is the clearest way to see how the three axes interact, and for anyone who has wondered what an oklch lightness chroma hue triple actually produces, moving the sliders for a minute explains it better than the specification does.",
    howTo: [
      { step: "Drag the Lightness slider and watch how the colour's apparent weight changes." },
      { step: "Raise Chroma to move from dusty towards vivid without affecting lightness." },
      { step: "Sweep Hue to move around the wheel at a constant weight and saturation." },
      { step: "Copy the hex value from the result swatch." },
    ],
    whenToUse:
      "Use this when you need to control lightness and vividness independently — building scales, levelling a palette, or understanding what a perceptual model does. Use HSL-based tools when you specifically want the older model's behaviour. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "What does chroma mean here?",
        a: "How far the colour sits from grey, on the axis of its hue. Zero is neutral, and higher values move towards the most vivid version of that hue the display can produce.",
      },
      {
        q: "Why does the swatch stop changing at high chroma?",
        a: "The requested colour has left the range the display can render for that hue and lightness. The closest displayable colour is returned, so further slider movement has no visible effect.",
      },
      {
        q: "How is this different from an HSL picker?",
        a: "Lightness here means roughly the same perceived weight at every hue, whereas in HSL the same lightness value looks brighter for yellows and darker for blues.",
      },
      {
        q: "Can I build a whole palette?",
        a: "Not in one go — the playground returns a single colour. A scale is built by holding lightness constant and recording the values as you vary chroma or hue.",
      },
      {
        q: "What does the oklch color playground not do?",
        a: "The maximum chroma available differs by hue and by lightness — yellows and greens can go further at high lightness, blues and violets further at lower ones — so the same chroma value is inside the display's range for some combinations and outside it for others. When the requested colour falls outside the range a screen",
      },
    ],
  },

  "opacity-calculator": {
    keywords: [
      "opacity calculator",
      "alpha blending calculator",
      "color with transparency over background",
      "hex with alpha",
      "what color does 50 percent opacity look like",
    ],
    intro:
      "The opacity calculator composites a foreground color over a background at any opacity and reports both the resulting solid color and the hex-with-alpha equivalent.",
    content:
      "The opacity calculator takes a background colour, a foreground colour and an opacity percentage, and returns the flattened result. Below the result swatch it prints a CSS declaration — the foreground colour written as an eight-digit hex value whose last two digits carry the alpha. Everything updates as the sliders and colour fields move.\n\nThe problem it solves is one of the most common sources of colour bugs in interface work. A translucent colour has no single appearance: what you see depends entirely on what is behind it. A white overlay at twenty percent over a dark header is a mid grey; the same overlay over a photograph is unpredictable. Developers write the alpha value and test it against one background, then ship it into a component that sits on another, and the result either disappears or muddy. Calculating the composite in advance turns an assumption into a number.\n\n- The arithmetic behind the flattened value is straightforward.\n- Each channel of the result is the background channel plus the difference between the foreground and background channels, scaled by the opacity.\n- At zero percent the result is exactly the background, at one hundred percent exactly the foreground, and in between it moves linearly along the line between them.\n- That linear movement in the red, green and blue channels matches how browsers composite opaque layers over each other, which is why the swatch and the browser agree rather than approximately agreeing.\n\nThe declaration underneath is the other useful half. It expresses the same colour as a single eight-digit hex value — six digits for the colour and two for the alpha — which is a portable way to write translucency when you already know the surface it will sit on. Setting that flattened value instead of a translucent one removes a dependency on the backdrop: the element will look the same whatever is behind it, which is exactly what you want for a badge, a tag or a chip that appears in several contexts.\n\nThe obvious workflow is to settle the appearance first and the notation second. Set the two colours, drag the opacity slider until the composite looks right, and then choose which of the two outputs you need: the flattened colour for a fixed surface, or the hex-with-alpha value for a translucent layer you intend to keep. Comparing the two is itself instructive — it shows how much a translucent token's appearance depends on context.\n\nTwo limits are worth knowing.\n\n- Anyone who has asked what color does 50 percent opacity look like over a given surface will recognise the problem this solves, and here it is answered exactly rather than approximately.\n- The composite is calculated in the standard eight-bit sRGB channels that browsers use by default, so it will not match an application that composites in a linear-light space; for web work that is the right choice, and for print or film pipelines it is not.\n- And there is no support for stacking several translucent layers — one foreground over one background is the whole computation, so three layers means three passes.\n\nUsed as an alpha blending calculator, it answers a question that otherwise requires a screenshot and a colour picker: what colour does this actually end up being. As a way to work out what a color with transparency over background produces, or to derive the hex with alpha that reproduces it, it is quicker than the loop of guessing, rendering and sampling.",
    howTo: [
      { step: "Set the Background colour to the surface the element will actually sit on." },
      { step: "Set the Foreground colour to the translucent colour." },
      { step: "Drag the opacity slider until the flattened result looks right." },
      { step: "Copy the result as a solid colour, or the declaration underneath as a hex value with alpha." },
    ],
    whenToUse:
      "Use this when a translucent colour needs to be judged against a specific surface, or when a flattened equivalent is needed so an element looks the same everywhere. Use the contrast checker when the question is legibility rather than appearance. The {{opacity-layering-calculator|opacity layering calculator}} is the same arithmetic framed as a stack to flatten, and the {{contrast-checker|contrast checker}} is what to run on the flattened value before it carries text.",
    faqs: [
      {
        q: "What does the eight-digit hex value mean?",
        a: "Six digits for the colour and two for the alpha channel, which is how CSS writes a translucent colour in hex. It is the input colour, not the composite.",
      },
      {
        q: "Why does the same translucent colour look different elsewhere?",
        a: "Because a translucent colour has no fixed appearance — it is the backdrop showing through. This calculator flattens one specific pairing so the result can be written as a solid value instead.",
      },
      {
        q: "Does the composite match what the browser renders?",
        a: "For ordinary web work, yes. Both composite linearly in the eight-bit red, green and blue channels, so the swatch and the rendered page agree.",
      },
      {
        q: "Can I stack three layers?",
        a: "Only one foreground over one background at a time. For a stack, calculate resulting pairs in sequence, feeding each flattened colour in as the next background.",
      },
      {
        q: "Does the result account for anything below the background?",
        a: "No. It is a two-colour blend: the foreground is composited over the single background you set, so anything stacked underneath that background is outside the calculation. The flattened value is exact for the pair you entered.",
      },
    ],
  },

  "palette-accessibility-checker": {
    keywords: [
      "palette accessibility checker",
      "palette contrast checker",
      "check palette against white",
      "palette aa contrast",
    ],
    intro:
      "Palette Accessibility Checker measures every color in a palette against a single white surface and marks each one as passing or failing AA at 4.5 to 1.",
    content:
      "Palette Accessibility Checker takes a palette and measures every color in it against white, reporting the ratio for each and marking it pass or fail at 4.5 to 1. It is the reviewer's view of a palette rather than the designer's: one column of swatches, one fixed surface, and a tick or a cross for each entry.\n\nThe palette is editable and starts populated, so the page is useful immediately and can be pointed at a real set:\n\n- Five colors are seeded to begin with, covering a blue, a purple, a red, a green and an amber.\n- Each entry can be replaced by picking a new color in its row.\n- Entries can be removed individually with the button beside each row.\n- Additional colors can be added, each one generated at random and then editable in place.\n\nEvery measurement is taken against white, which is fixed rather than configurable, and each row prints the hex value in upper case alongside the ratio to two decimal places and a tick or cross for the 4.5 to 1 AA line. The arithmetic is the standard WCAG 2.x contrast ratio: each color is converted to sRGB, its channels are linearised, the linear values are weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance, and the lighter plus 0.05 is divided by the darker plus 0.05 before rounding to two decimals.\n\nBecause the surface never changes, the results have to be read with the page's assumption in mind.\n\n- White is hardcoded. Every ratio describes a color on white, so a dark-theme palette will show almost everything failing, which says nothing about how those colors behave on a dark surface.\n- One surface only. The matrix of every color against every other color is not produced, so text-on-brand combinations still need their own check.\n- AA at 4.5 to 1 is the only threshold. There is no large-text allowance, so a color intended for headings is judged at the stricter figure, and AAA is not reported at all.\n- The tick is binary. A color at 4.51 to 1 and one at 15 to 1 look identical in the list.\n- Results are not exported, so anything you want to keep has to be copied out by hand.\n- The palette has no fixed size, which means a long one has to be scrolled rather than summarised.\n\nUse this page to sweep a light-theme palette in one pass and find the entries that cannot carry text on white. For text on a dark surface, reverse the roles and check the pairs individually, and for a boundary rather than text, the component check applies the right threshold.\n\nAs a palette contrast checker the page is fast by design: a fixed surface, one threshold and a binary verdict per color. That combination makes it a sound first pass over a light theme and a poor one over a dark theme, and the distinction is worth holding on to. A palette aa contrast sweep against white answers exactly one question, which is which of these colors can carry text on a light surface, so the fastest way to use it is to check palette against white once, replace the failures, and hand the surviving colors to the pair checks for the surfaces they will really sit on.",
    howTo: [
      { step: "Review the seeded palette of five colors, replacing any entry whose row does not match your own set." },
      { step: "Add colors with the add button when your palette is longer than five, then edit each new entry in place." },
      { step: "Read the contrast against white column, where every color shows its hex value, its ratio to two decimal places and a tick or cross for 4.5 to 1." },
      { step: "Remove the entries you have already dealt with using the button beside each row, so the remaining failures are the only thing on screen." },
    ],
    whenToUse:
      "Use the palette accessibility checker to sweep a whole light-theme palette in one pass and find which colors cannot carry text on white. A single pair belongs with the {{contrast-checker|contrast checker}}, the components built from those palette colors belong with the {{ui-component-contrast-checker|UI component contrast checker}}, finding replacements for the entries that fail is the {{accessible-color-pair-finder|accessible color pair finder}}, and confirming that a passing color reads well as text is the {{text-readability-checker|text readability checker}}.",
    faqs: [
      {
        q: "Why is everything failing in my dark palette?",
        a: "Because every measurement is taken against white. A palette built for a dark interface is deliberately low in lightness, so most of its colors will be close to white and fail the 4.5 to 1 requirement. The results are correct for a white surface and irrelevant to a dark one.",
      },
      {
        q: "How many colors can the palette hold?",
        a: "There is no cap. It starts with five seeded colors, and you can add or remove entries freely, which is why a long palette ends up as a scroll rather than a summary view.",
      },
      {
        q: "Does a tick mean the color is safe for text?",
        a: "It means the color reaches 4.5 to 1 against white, which is the requirement for ordinary text on that surface. It says nothing about the color as a background for other text, or about its use as a component boundary.",
      },
      {
        q: "Can I check my palette against a color other than white?",
        a: "Not on this page, because the surface is fixed. Move the pair to the contrast checker or the ratio calculator instead, where both colors are inputs, and use this page as the quick sweep it is designed to be.",
      },
      {
        q: "What is the difference between this and the pair finder?",
        a: "Direction. This page audits colors you already have and reports which ones fail. The pair finder starts from one fixed color and proposes neutral text colors that pass, which is the tool to reach for once the audit has told you a replacement is needed.",
      },
    ],
  },

  "palette-balance-analyzer": {
    keywords: [
      "palette balance analyzer",
      "palette average lightness",
      "check palette balance",
      "palette chroma average",
      "analyze color palette weight",
    ],
    intro:
      "The palette balance analyzer reports the average lightness and average chroma of a palette in perceptual terms, giving two numbers that describe how heavy and how vivid the set is.",
    content:
      "- The palette balance analyzer places a palette editor beside a summary card.\n- The editor holds five colours with fields to change them, removal buttons and an Add color button.\n- The card reports two figures: the average lightness of the palette and its average chroma, both to two decimal places, recalculating as the palette changes.\n\nBoth numbers are computed in a perceptual colour model, which is what makes them worth reading. The palette average lightness is the mean of each colour's perceived brightness on a scale from zero to one, so a palette of four mid-tones and one near-black reports slightly below the middle, and a palette of pale tints reports high. The palette chroma average — the mean distance from grey on the same scale — tells you how colourful the set is, so a group of muted colours reports low and a group of vivid ones reports high. To analyze color palette weight, those two numbers are the summary that matters most. Together they characterise a palette on its two most important global axes: how light it is, and how colourful it is.\n\nThe practical use is comparison, and it is also the answer to how to check palette balance across a set of candidates. Read the two figures for a palette, write them down, load the next one, and read them again. Two palettes with a similar average lightness and chroma will feel like siblings even when their hues differ completely, and a palette that has been refined by eye across several sessions can be checked against a reference to see whether it has drifted towards brighter or more saturated colours — which it will have, because the eye recalibrates as you work and small individual adjustments accumulate. Since the figures are means of a perceptual measure, they also travel between palettes of different sizes, so a five-colour set and a nine-colour one are comparable.\n\n- What the tool deliberately does not do is offer a verdict.\n- There is no ideal average, no target band and no warning, because what counts as balanced depends on the brief: a muted editorial palette and a vivid game palette are both balanced on their own terms.\n- It is a measurement, not an assessment, and the judgement stays with whoever is looking at the two numbers.\n\nThe corollary is the main limitation, and it is a real one. A mean hides its distribution completely. Two near-black colours and two near-white ones average to a comfortable mid lightness, as does a palette of four mid-tones — and those two palettes will behave nothing alike in a design, one being a high-contrast pair with no middle and the other a low-contrast set with no extremes. Averages also cannot tell you whether a palette has the range a design needs, whether its colours are related to each other, or anything at all about hue, since hue is the axis the tool ignores entirely. Reading the two figures as a whole-palette summary rather than as a description of its colours is the correct use.\n\nWithin those limits, as a palette balance analyzer it does one thing usefully: it puts a number on the two properties that are hardest to judge by eye and easiest to drift on. For checking that a palette has a defensible average lightness and chroma — or for comparing several candidates against each other — the summary card is quick, and it is a useful sanity check before a palette is handed to someone else.",
    howTo: [
      { step: "Load the palette into the editor, editing or adding colours as needed." },
      { step: "Read the average lightness figure to see how heavy the set is overall." },
      { step: "Read the average chroma figure to see how vivid it is." },
      { step: "Compare the two numbers across palettes to tell whether they feel like siblings." },
    ],
    whenToUse:
      "Use this when comparing candidate palettes or checking that one has drifted. Use the accessibility or contrast tools when the question is whether particular colours are usable rather than how the palette weighs overall. The {{visual-weight-analyzer|visual weight analyzer}} shows how a palette's lightness orders on screen, and the {{contrast-checker|contrast checker}} supplies the pairing verdict the summary deliberately withholds.",
    faqs: [
      {
        q: "What are the two figures measuring?",
        a: "Average perceived lightness and average chroma across the palette, both in a perceptual colour model. Lightness describes how heavy the set is; chroma describes how far its colours sit from grey.",
      },
      {
        q: "Is there a target value for a balanced palette?",
        a: "No. The tool reports measurements rather than a score, because what counts as balanced depends on the brief — a muted palette and a vivid one are both balanced in their own terms.",
      },
      {
        q: "What does it miss?",
        a: "Distribution, entirely. Four mid-tones and a mix of near-black and near-white can share an average lightness while behaving completely differently, and hue is not measured at all.",
      },
      {
        q: "Can I compare two palettes?",
        a: "By recording the numbers for each — the figures are comparable between palettes of different sizes because they are means. The comparison tool shows two palettes at once.",
      },
      {
        q: "Is there an ideal average lightness to aim for?",
        a: "No. There is no ideal average, no target band and no warning, because what counts as balanced depends on the surface and the intent. A mean also hides its distribution, so a palette with extremes and a palette of mid-tones can report the same figure.",
      },
    ],
  },

  "palette-comparison": {
    keywords: [
      "palette comparison",
      "compare two palettes",
      "average lightness and chroma",
      "shared colors",
    ],
    intro:
      "The palette comparison puts two editable palettes side by side and reports the numbers that actually differ between them: counts, average lightness, average chroma and any shared colours.",
    content:
      "Two palettes side by side do not explain themselves, which is why this page adds a summary underneath. The palette comparison gives each palette its own editor — add, remove and edit rows independently — and then reports four facts about the pair: how many colours each contains, each palette's average lightness, its average chroma, and which values appear in both.\n\n- Colour count per palette, which is usually the first thing to differ and the least important.\n- Average lightness, computed in OKLCH across each palette, so two sets can be compared for weight rather than for colour.\n- Average chroma, which answers whether one palette is quieter than the other and by how much.\n- Shared colours, listed by hex value when the two palettes contain exactly the same string, with an explicit message when nothing is shared.\n\nThe metrics are deliberately few, because the useful comparisons are few. Average lightness settles the most common argument in a palette review — whether a proposed set is broadly lighter or darker than the one in use — and average chroma settles its twin, whether the new palette is louder. The shared-colour check is exact-match only, which makes it a duplicate detector rather than a similarity test: two values one channel apart are reported as different, and that is the correct behaviour for spotting a copy of a token that should have been reused.\n\n- Averages describe a palette's centre, not its range. A set with one near-black and one near-white can average out to the same figure as a set of mid-tones.\n- No per-colour comparison: the summary says nothing about which specific value in A resembles which in B.\n- Exact matches only for the shared list, so near-duplicates pass silently.\n- No export and no persistence; the two palettes start from defaults each visit.\n\nReading the summary is a matter of knowing which figure settles which argument. When someone asks whether a new palette is too heavy, compare two palettes on average lightness alone; when the complaint is that it shouts, read average lightness and chroma together, because a set can be dark and quiet at the same time. The shared colors line answers a different question — whether the proposal is genuinely new or partly a copy of the palette already in use — and it is the fastest way to catch a token that was redefined instead of reused. A proposal that shares three of six values with the palette already in use is an iteration rather than a new direction, and that judgement is much harder to make from two strips side by side.\n\nThe page is most useful in a review: paste the palette in use into one side, the proposal into the other, and the summary turns an argument about taste into two numbers and a duplicate list. Where the question is perceptual rather than statistical — how far apart two specific colours are — the distance calculator answers it directly, and where the question is readability, the palette accessibility checker tests the values against a real background rather than against each other.",
    howTo: [
      { step: "Load the palette in use into the left editor." },
      { step: "Load the proposed palette into the right editor." },
      { step: "Compare the average lightness and chroma figures first — they settle most review arguments." },
      { step: "Check the shared list to catch values that should be reused rather than redefined." },
    ],
    whenToUse:
      "Use this during a palette review, when two sets have to be judged against each other rather than on their own. The {{palette-balance-analyzer|palette balance analyzer}} reports the same averages for one palette, the {{color-distance-calculator|colour distance calculator}} measures specific pairs, and the {{palette-accessibility-checker|palette accessibility checker}} tests whether either set works against a background.",
    faqs: [
      {
        q: "What does the summary compare?",
        a: "Four things: the colour count of each palette, average OKLCH lightness, average OKLCH chroma, and the values that appear in both. Nothing else is measured.",
      },
      {
        q: "How are shared colours detected?",
        a: "By exact hex match. A value one channel away from another is not reported as shared, which makes the list a duplicate detector rather than a similarity test.",
      },
      {
        q: "Do the averages describe a palette's range?",
        a: "No. An average describes the centre: a palette holding one near-black and one near-white can produce the same figure as one made entirely of mid-tones.",
      },
      {
        q: "Can I compare more than two palettes?",
        a: "Not at once. The page holds two editors, so a third palette means a second run with one side replaced.",
      },
      {
        q: "Are the two palettes saved when I leave?",
        a: "No. Both start from default sets on every visit, so paste the values again or keep them in a document for reference.",
      },
    ],
  },

  "palette-importer": {
    keywords: [
      "palette importer",
      "paste hex colors",
      "import json palette",
      "color list to swatches",
    ],
    intro:
      "The palette importer turns a pasted list of colours into swatches: paste a JSON array or a comma-separated string, press import, and the palette appears as a strip.",
    content:
      "Bringing colours into a tool is the step that usually costs the most effort, so the palette importer keeps it deliberately blunt. One field takes a paste, one button loads it, and the result is a row of swatches. Type or paste a JSON array such as [\"#3B82F6\",\"#A855F7\",\"#EF4444\"] and the parser keeps the string entries; paste a plain list separated by commas, spaces or newlines and it splits on those instead.\n\n- Accepted input: a JSON array of colour strings, or a loose list separated by whitespace, commas or newlines.\n- The loader tries JSON first and falls back to splitting, so both a copied export and a hand-typed list work.\n- Output: a swatch strip that runs two columns wide on a phone and six across on a desktop.\n- Nothing is stored: the imported palette lasts for the session and has to be pasted again to return.\n\nThe decision to accept loose input rather than insisting on JSON is what makes the tool practical for a colour list to swatches conversion. Values lifted from a design file, a spreadsheet column or a chat message arrive in whatever punctuation the source used, and the splitter handles all of it rather than rejecting the paste. That flexibility has a cost, though, and it is worth being explicit about: entries are not validated as colours. A stray word or a malformed hex string passes through as a string and renders as a swatch with no colour behind it, so a mostly empty strip usually means the paste contained something that was not a colour.\n\n- No validation: entries that are not colours still count as entries, and nothing reports them.\n- No names or roles. Order is the only structure, so a token file has to be mapped afterwards.\n- No export, no editing after import, and no sorting — the sorter is a separate tool.\n- Long lists render as one long strip with no pagination or wrapping controls.\n\nUse it as the entry point for any palette that exists somewhere else: a client's brand list, a measured sample, a JSON export from another tool, or the values you copied out of a random roll worth keeping. Once the colours are in, the sorters and comparators take over, and the CSS variable tools turn a settled list into named declarations. Before trusting an imported set, run the entries through the format validator if anything looks off — it will tell you which value is not a colour, which is faster than counting swatches. Both routes into the strip cover the two things people actually do — paste hex colors lifted from a design file, or import json palette exports from another tool — and the job is a color list to swatches conversion rather than an edit, so cleaning values up belongs to the tools downstream. Where the list has to become code rather than swatches, the CSS variable tools finish the job. Keeping the source list somewhere safe is the only discipline the page asks for, since nothing here survives the session.",
    howTo: [
      { step: "Paste the colour list into the field — a JSON array or a plain comma-separated string." },
      { step: "Press import; the loader tries JSON first and falls back to splitting on punctuation." },
      { step: "Check the strip: a missing swatch usually means one entry was not a valid colour." },
      { step: "Sort the imported palette or write it out as tokens with the other palette tools." },
    ],
    whenToUse:
      "Use this whenever a palette already exists outside this site — a brand list, a measured sample or an export from another tool. The {{palette-sorter|palette sorter}} orders what you import, the {{palette-comparison|palette comparison}} tool measures it against another set, and the {{css-color-variables-generator|CSS variables generator}} turns the settled list into named custom properties.",
    faqs: [
      {
        q: "What formats does the field accept?",
        a: "A JSON array of colour strings, or a loose list separated by commas, spaces or newlines. The loader tries JSON first and falls back to splitting, so hand-typed lists work too.",
      },
      {
        q: "Are the imported values checked?",
        a: "No. Entries are taken as strings without validation, so a malformed value appears as an entry with no colour behind it rather than as an error message.",
      },
      {
        q: "Can I name the colours as I import them?",
        a: "Not here — the palette is a list in order, with no roles attached. Naming happens afterwards, usually when the values are written out as custom properties.",
      },
      {
        q: "Is the imported palette saved?",
        a: "No. Nothing persists between visits, so keep the source list somewhere safe and paste it again whenever the palette is needed.",
      },
      {
        q: "How do I find a bad value in a long list?",
        a: "Run the entries through the format validator: it reports which string is not a colour, which is quicker than counting swatches to find the gap.",
      },
    ],
  },
};
