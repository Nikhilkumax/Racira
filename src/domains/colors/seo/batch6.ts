import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 6 (alphabetical slugs 55-61).
 *
 * Skipped from this window:
 *  - color-memory-test — deferred rather than skipped: it shared the PersonalityQuiz
 *    placeholder, which has since been replaced by a real recall test, so this slug is
 *    authored in a later batch.
 *  - color-monochromatic-finder — renders the identical `Mono` harmony component as
 *    monochromatic-palette-generator (no props, same output), so its copy could not
 *    be honestly differentiated from its sibling.
 *  - color-mood-analyzer — renders the identical `ColorPsychology` component as
 *    color-psychology-reference. Only one of the two can carry unique copy; the
 *    reference slug is authored later because it targets the stronger keyword.
 */
export const SEO_BATCH_6: Record<string, ToolSeo> = {
  "color-mixer-2": {
    keywords: [
      "color mixer",
      "mix two colors",
      "blend two colors",
      "color mixing calculator",
      "mix two colors together",
    ],
    intro:
      "The color mixer blends two colors by ratio, returning the exact midpoint plus readable 25, 50 and 75 percent previews so you can pick the step that actually works.",
    content:
      "The color mixer is a two-input blending tool. You set Color A and Color B with standard pickers, then drag a slider from zero to one hundred percent to control how much of B goes into the result. Under the large result swatch the tool also renders the twenty-five, fifty and seventy-five percent points side by side, so the whole scale of intermediate colors is visible at once rather than tested one ratio at a time. You can blend two colors into any weight you like, type a hex directly, or pick by eye and watch the result follow.\n\n- The arithmetic is a straight interpolation between the two colors' red, green and blue channels, applied independently to each.\n- Every channel travels linearly from the first color's value to the second's, which is precisely the same operation a graphics editor performs when you fade a semi-transparent layer over the one beneath it.\n- Because the blend happens per channel in device space, it matches what a browser will render for the same pair, but it is emphatically not a pigment mix: blue and yellow at the halfway point land on a grey-green, never the green a paint tin would give you.\n\nThe preview strip is the part people underuse. A fifty percent blend is often the least attractive option, because averaging two distant hues pulls chroma toward grey; the quarter and three-quarter points usually keep more of the source character. That is why two-color ramps in real design systems rarely put their midpoint at the arithmetic centre, and why it is worth glancing along the strip before settling on a value.\n\nReach for it when you need an intermediate color that genuinely belongs to both parents: the in-between step in a two-stop ramp, a hover shade sitting between base and pressed, or a fallback for a gradient that only supports two stops. It is equally useful for previewing what an overlay will look like at half strength before you commit to it in CSS. Use it when the question is what lies between two specific colors, and the palette version when the same question applies to every neighbouring pair in a longer set.\n\nTwo limits are worth stating plainly so the result is not misread.\n\n- Channel interpolation is symmetric and lossless, but it knows nothing about perception, so complementary pairs mixing toward dirty grey is expected behaviour rather than a bug; a perceptual or subtractive blend would behave differently and often more pleasantly.\n- The output is also fully opaque, a single solid value with no alpha channel, so it should be stored as a hex rather than assumed to carry transparency.\n\nTreat it as a dependable color mixing calculator rather than a colour-management system: no profiles, no pigment model, no alpha, just a predictable way to mix two colors together in the same device space your stylesheet will use. That narrowness is the point. Because the maths is exactly what the browser does, the swatch on screen is a reliable promise of the pixels you will ship, which makes it safe to copy the result straight into a token file and move on without a second opinion from a design file.",
    howTo: [
      { step: "Set Color A and Color B." },
      { step: "Read the fifty percent result and the twenty-five, fifty and seventy-five percent previews." },
      { step: "Choose the ratio that behaves the way the design needs and copy its hex." },
    ],
    whenToUse:
      "Use it to find an intermediate value between two colors, or to preview how a half-strength overlay will read. Use the palette mixer when you need the midpoints between every adjacent pair in a longer list. The {{color-mixer-3plus|palette mixer}} blends a whole list by adjacent pairs, and the {{additive-color-mixer|additive}} and {{subtractive-color-mixer|subtractive}} mixers work in light and pigment rather than in channels.",
    faqs: [
      {
        q: "Does it mix like paint?",
        a: "No. The blend happens per RGB channel in device space, so it behaves like fading one color over another rather than mixing two pigments. Blue and yellow give a dull grey-green, not green.",
      },
      {
        q: "Why is the fifty percent result sometimes muddy?",
        a: "Averaging two hues that sit far apart on the wheel pulls saturation toward neutral. The twenty-five and seventy-five percent positions usually hold more character.",
      },
      {
        q: "Does the result carry transparency?",
        a: "No. It returns one opaque color as a hex value. If you need alpha, apply it to the source colors instead.",
      },
      {
        q: "Will the swatch match what a browser renders?",
        a: "Yes. The interpolation is the same per-channel operation a browser performs, so the value shown is the value you get.",
      },
      {
        q: "Is the half-way blend always the best one?",
        a: "No. The preview strip shows the blend at twenty-five, fifty and seventy-five percent, and the half-way point is often the least useful of the three, because channel interpolation is symmetric and knows nothing about perception.",
      },
    ],
  },

  "color-mixer-3plus": {
    keywords: [
      "palette mixer",
      "mix three colors",
      "blend multiple colors",
      "mix multiple colors together",
    ],
    intro:
      "The palette mixer collapses a color list inward by mixing every adjacent pair at the halfway point, so three colors become two and each press of the button thins the set.",
    content:
      "The palette mixer operates on a list rather than a single pair. You keep an editable palette — add entries, remove them, adjust any value — and one action averages each neighbouring pair, replacing the whole list with the midpoints. A three-entry set collapses to two, a five-entry set to four, and pressing the button again keeps folding the palette inward until a single color remains. Where a two-color tool answers what lies between one specific pair, this answers the same question for a whole set in one press.\n\nThere is deliberately no ratio control here.\n\n- Every adjacent pair is averaged at the halfway point, and the result replaces the palette instead of appearing beside it, so each press is a step in a sequence rather than a single lookup.\n- That makes the tool as much a compression device as a blending one: you are not inspecting a mix, you are marching a palette toward its centre one generation at a time.\n\nThe natural workflow starts from a set you already like. Press once and you have the intervening values — handy for building a gradient whose stops need to be evenly spread, or for adapting a five-color scheme to an interface that only has room for three. Because the surviving colors are genuine averages of their neighbours, the thinned palette still reads as a member of the same family; nothing foreign is introduced.\n\nRepeated pressing is where the behaviour becomes interesting. Each pass turns n colors into n minus one, so a five-entry list reaches a single swatch after four presses, and that final value is effectively a weighted average that has been drawn toward the middle of the original set. Watching the list slim down is a quick way to find the palette's centre of gravity, which is useful when you want a single representative tint for a system rather than a full scheme.\n\nUse it when you need to blend multiple colors into a smaller, coherent set, or when you want to mix three colors and inspect what the pairwise results look like before deciding which to keep. The pair blender remains the right choice when only two colors are involved and you want fine control over the ratio; this one is for breadth. Neither tool invents hues — both stay inside the range defined by the colors you supply.\n\n- The same caveat applies as to any channel-space blend: averaging colours that sit opposite each other produces a desaturated result rather than a vivid third colour, so a palette of high-contrast accents will dull noticeably after a pass or two.\n- If that happens, mixing in a perceptual space or curating by hand will serve better.\n- For tidying an over-long palette or generating evenly spaced steps, though, collapsing adjacent pairs is a fast and predictable way to mix multiple colors together.\n\nOne last habit is worth adopting: keep the original list somewhere before you press, since the action overwrites the palette in place and the previous generation is not retained. Undo may not restore it, so duplicating the set first turns a destructive experiment into a reversible one, and lets you compare two generations side by side before choosing which to carry forward.",
    howTo: [
      { step: "Load the list you want to blend — add or remove rows as needed." },
      { step: "Press Mix adjacent pairs; every neighbouring pair is averaged at the half." },
      { step: "Press again to halve the list once more, keeping the original values somewhere safe." },
    ],
    whenToUse:
      "Use this version when the palette is longer than two and you want the midpoint of every adjacent pair at once, or when you want to fold a set inward to a single representative color. The {{color-mixer-2|two-color mixer}} shows one blend at three ratios, and the {{palette-importer|palette importer}} is the way to bring a list in before mixing.",
    faqs: [
      {
        q: "Does it average the whole palette into one color?",
        a: "Not in a single step. It mixes each adjacent pair, so the list shrinks by one each press. Repeat until one color remains if that is the goal.",
      },
      {
        q: "Can I control the mix weight?",
        a: "No. Every pair is averaged at the halfway point. For a custom ratio between two colors, use the two-color mixer instead.",
      },
      {
        q: "Does it replace the palette or add to it?",
        a: "It replaces the palette with the mixed results, which is what makes repeated presses behave like a sequence of generations.",
      },
      {
        q: "Why did my bright palette turn dull?",
        a: "Averaging strongly contrasting hues pulls them toward neutral. The behaviour is expected in channel space; blend perceptually if you need to preserve chroma.",
      },
      {
        q: "What happens when I press the button twice?",
        a: "Each pass turns n colours into n minus one: every adjacent pair is averaged at the half and no ratio control is offered, so a five-colour palette becomes four and then three. Keep the original list somewhere before pressing, because the pass replaces the palette in place.",
      },
    ],
  },

  "color-name-generator": {
    keywords: [
      "color name generator",
      "generate a name for a color",
      "color nickname generator",
      "fun color names",
    ],
    intro:
      "The color name generator gives any color an evocative two-word nickname like Royal Ember, drawn deterministically from its hue and lightness, with a button to roll alternatives.",
    content:
      "The color name generator turns a color into an evocative two-word nickname. Pick a hue and the tool answers with a phrase such as Royal Ember, Quiet Aurora or Electric Mist, presented large beside a swatch of the color it describes. It is a creative naming aid rather than a dictionary: the point is to generate a name for a color that a person will actually remember, which is useful when a palette needs labels for a moodboard, a product, a theme or a writing project.\n\nThe words come from two fixed lists, one of adjectives and one of nouns, each indexed by a number derived from the color itself. Because that index is computed from the color's hue and its lightness, the generator is deterministic on first sight: two people who open the tool with the same hex see the same phrase, and changing the color a little shifts the name in a way that feels related to what changed. This is not a random word machine bolted to a colour picker; the result is repeatable as long as the inputs are.\n\nA roll button advances an extra seed, which is what makes it a usable generator rather than a single lookup. Each press walks through further adjective and noun combinations for the same color, so you can cycle until a phrase lands. In practice people mix the two behaviours: nudge the color until the hue direction feels right, then roll a few times to find wording that suits the project.\n\nTypical uses are naming a design token something friendlier than a hex, labelling swatches in a presentation, and giving brand or campaign colours a working title while the real naming is still undecided. It also works well as a creative prompt, since the pairing of hue and phrase often suggests an image or a mood you had not considered. For those tasks the generator is fast, playful and entirely appropriate.\n\n- It is not an authority, and it is worth being explicit about that.\n- It will not tell you the nearest standardised name for a color, and it does not use any paint, fashion or design-industry nomenclature; the phrases are invented.\n- If what you need is the closest official name — one a browser or stylesheet recognises — the lookup tool is the right one, since it matches against the standard named-color list rather than composing something new.\n\nUsed with that limitation in mind, it is a small tool with a clear job: fun color names on demand, consistent for a given input, with enough variation when you want it. Note that the same color always begins with the same phrase, so if you are naming several colors in one project, roll each one deliberately and record the choices rather than reopening the tool later and hoping the same words appear. Keep a note of the adjectives you like and reuse them as a family prefix, and a set of generated names starts to read like a deliberate naming scheme rather than a collection of coincidences. Think of it as a color nickname generator with a short memory rather than a naming authority, and it will serve exactly that purpose.",
    howTo: [
      { step: "Set the colour with the picker." },
      { step: "Read the generated name beside the swatch." },
      { step: "Press Roll new name for a different pairing drawn from the same colour." },
      { step: "Change the colour to move where the name starts from." },
    ],
    whenToUse:
      "Use it for creative labels, moodboards and working titles on a palette. Use the color name lookup when you need the closest recognised standard name for a value instead of an invented phrase. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Is the name random every time?",
        a: "No. The first phrase is derived from the color's hue and lightness, so the same color always opens with the same name. The roll button then advances to alternatives.",
      },
      {
        q: "Are these official color names?",
        a: "No. The adjectives and nouns are invented pairings, not paint, fashion or CSS nomenclature. Nothing here is a recognised standard.",
      },
      {
        q: "What if I need the real name of a color?",
        a: "Use the color name lookup, which matches your value against the standard CSS named color list and reports the nearest match.",
      },
      {
        q: "Can I get the same name again later?",
        a: "Yes, for the starting phrase: re-entering the same color reproduces it. Rolled alternatives are not saved, so note down any you intend to keep.",
      },
      {
        q: "What does the color name generator not do?",
        a: "It will not tell you the nearest standardised name for a color, and it does not use any paint, fashion or design-industry nomenclature; the phrases are invented. If what you need is the closest official name — one a browser or stylesheet recognises — the lookup tool is the right one, since it matches against the standa",
      },
    ],
  },

  "color-name-lookup": {
    keywords: [
      "color name lookup",
      "name of a color",
      "nearest css named color",
      "rgb distance",
    ],
    intro:
      "The color name lookup finds the CSS name closest to any color you pick, shows that named swatch beside your value, and reports how far apart the two are in RGB distance.",
    content:
      "The color name lookup answers one question — what is this color called? A colour goes in, either picked or typed into the field, and one answer comes back: the nearest css named color, drawn as a labelled swatch, with the rgb distance between your value and that name printed underneath it. It is a one-question page with a one-line answer, which is the point: naming a colour is a lookup rather than a judgement call.\n\n- The table it searches is the 141-name CSS list this domain uses everywhere else, aliceblue through yellowgreen.\n- Matching is nearest-neighbour by RGB distance: the red, green and blue channels are compared, squared and summed, and the smallest total wins.\n- The readout is three things at once — the name, the named colour's own hex value, and the distance rounded to a whole number.\n- The comparison is exhaustive, so the answer is the true nearest entry rather than an approximate one, and it is stable between visits and browsers.\n\nTwo details make the number worth reading. First, the metric is Euclidean in raw RGB, which is cheap but not perceptual: the default blue #3B82F6 snaps to royalblue #4169E1 at a distance of 33, while the pale grey-blue #E0E5EC snaps to lavender #E6E6FA at 15 — a smaller number, and a name that feels less accurate, because RGB distance does not know how eyes work. Second, the input is quantised before the search begins: a colour that arrived from a screenshot or a design export has already been rounded to whole 8-bit channels, so the comparison starts from that rounded value rather than the original.\n\nNaming is also a translation step between teams. A developer reading the name of a color in a ticket has a roughly shared picture of what it means, while the same value written as hex is exact and unreadable at a glance; that trade — shared vocabulary against precise value — is the reason both spellings often end up in the same document, with the name for discussion and the hex for code.\n\n- The distance is a ranking device, not a measure of how different two colours look. Treat small numbers as a hint that the name is close, not as proof.\n- The table holds 141 names. British spellings such as grey and darkslategrey are absent, so a greyish value comes back as a gray-spelled name or as a different colour entirely.\n- Two values carry two names each: aqua and cyan share #00FFFF, fuchsia and magenta share #FF00FF. Either spelling can be returned for those values.\n- It names colours only. There is no readability check, no print accuracy and no transparency handling on this page.\n\nUse it when a colour needs a human name — a ticket, an asset description, a note in a review — and treat the name as shorthand rather than as a value. Where the destination is code, copy the hex; where an exact name matters, read it from the named-colour table instead of trusting a snap; and where the real question is how far apart two chosen colours are, the distance calculator answers it directly rather than as a side effect of naming.",
    howTo: [
      { step: "Set the colour with the picker field, or type a hex value and let the field normalise it." },
      { step: "Read the result card: the named swatch, its label and its hex value." },
      { step: "Check the RGB distance underneath to judge how close the match actually is." },
      { step: "Copy the hex for code, or quote the name when a human-readable label is what is needed." },
    ],
    whenToUse:
      "Use this when a colour needs a name for humans rather than a value for a compiler. The {{nearest-named-color-finder|nearest named colour finder}} is the same lookup framed as a snapping step, the {{css-named-colors-reference|CSS named colours reference}} is the table to read from when the exact name matters, and the {{color-distance-calculator|colour distance calculator}} measures the gap between two chosen colours instead of naming one.",
    faqs: [
      {
        q: "How is the nearest name chosen?",
        a: "Every entry in the 141-name table is compared against your colour by Euclidean distance in RGB, and the smallest distance wins. The search is exhaustive, so nothing is skipped.",
      },
      {
        q: "Why does the default blue come back as royalblue rather than a closer-sounding name?",
        a: "Because royalblue #4169E1 really is the closest table entry by RGB distance — 33 units away. No name in the list is closer, which is a limit of the table rather than of the match.",
      },
      {
        q: "Is the distance a measure of how different the colours look?",
        a: "No. It is raw RGB arithmetic, which ignores perception: a small distance can still look like a different colour, and a large one across two dark values can be hard to see. Use it to rank candidates.",
      },
      {
        q: "Why do some grey colours come back with a different name?",
        a: "The table carries the gray spelling only, so grey and darkslategrey are not candidates. A greyish value therefore settles on whichever gray-spelled or neighbouring entry is numerically closest.",
      },
      {
        q: "Can it tell me whether the named colour is readable as text?",
        a: "No. Naming and contrast are separate jobs here; send the foreground and background pair through the contrast checker for that answer.",
      },
    ],
  },
};
