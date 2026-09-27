import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 1.
 *
 * Only tools whose logic is correct (audit verdict "Y") are authored here.
 * Tools flagged "P"/"N" in the functional audit are deliberately excluded.
 */
export const SEO_BATCH_1: Record<string, ToolSeo> = {
  "accessible-color-pair-finder": {
    keywords: [
      "accessible color pair finder",
      "readable color pairs",
      "aa contrast neutrals",
      "text color for background",
    ],
    intro:
      "Accessible Color Pair Finder starts from one color and works outward, proposing neutral text colors that reach AA contrast against it without any further tuning.",
    content:
      "Accessible Color Pair Finder starts from a single color and works outward. You choose the base, and the tool builds a ramp of neutral candidates, keeps only the ones that reach 4.5 to 1 against it, sorts them from strongest to weakest and shows the best eight. It answers the common design question of what to set on top of a given color, without a round of trial and error.\n\nThe candidates are generated rather than looked up, and the way they are built is the important detail behind the results:\n\n- Twenty-one neutral steps, produced by walking lightness from 0 to 1 in fixed 5% increments with chroma held at zero throughout.\n- A single AA contrast filter at 4.5 to 1 against your base, with everything below that discarded before the list is built.\n- Ratio ordering, strongest first, so the top of the list is the most separated pairing rather than the most visually pleasing one.\n- A shortlist of eight, since the passing set is usually longer than a design decision needs.\n\nEach candidate is constructed in OKLCH with zero chroma, then converted to hex, and every ratio is the standard WCAG 2.x contrast figure: channels linearised out of sRGB, weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance, then the lighter plus 0.05 divided by the darker plus 0.05, rounded to two decimals. The preview draws each candidate as text on your base color, so you can see the pairing rather than infer it.\n\nThe narrowness of the ramp is what keeps the results clean, and it is also the main limitation.\n\n- Every candidate is a pure neutral with no chroma. A warm or cool tinted grey has to be derived from one of these and re-checked, since the hex value will no longer be in the list.\n- Only the AA threshold is applied. There is no way to ask for the 7 to 1 enhanced set, so finding AAA-safe text means working up the list manually.\n- The lightness steps are fixed at 5%, which means a workable value just inside a threshold can be missed entirely.\n- Only the top eight passing candidates are shown, so the list is a shortlist rather than the complete set.\n- The base is always the background. If your base is the text and the neutral is the surface, the ratio is the same but the reading of the results is reversed.\n- No alpha, and no third surface behind the pair.\n\nReach for this page when you have a brand color that has to stay and you need text colors that work on it, which is the reverse of the usual check. For a palette that already exists, a whole-set audit is faster elsewhere, and for a pair that passes on paper but reads poorly, the readability preview is the better next step.\n\nThe list is deliberately a set of AA contrast neutrals rather than a palette generator, so the results read as answers to one question: what text color for background X still works. That framing is why the candidates are ordered by ratio and why the shortlist stops at eight, since a designer choosing readable color pairs is usually looking for the first value that clears the bar with room to spare rather than the widest possible set of options.",
    howTo: [
      { step: "Enter the base color in the swatch field, which is the surface the text will sit on." },
      { step: "Read the grid of candidates, each previewed as text on your base color." },
      { step: "Check the hex value and the ratio printed under each candidate, to two decimal places." },
      { step: "Pick from the top of the list for the strongest separation, or further down when you want a softer pairing, then re-check any tinted variant separately." },
    ],
    whenToUse:
      "Use the accessible color pair finder when a base color is fixed by a brand and you need to know what text colors can safely sit on it. Choosing between two known colors is the job of the {{contrast-checker|contrast checker}}, auditing a whole palette at once belongs with the {{palette-accessibility-checker|palette accessibility checker}}, checking whether a passing pair actually reads well is the {{text-readability-checker|text readability checker}}, and the same is equally true of the {{wcag-21-aa-checker|WCAG 2.1 AA checker}} verdict once a candidate is chosen.",
    faqs: [
      {
        q: "Why are all the suggested colors greys?",
        a: "Because the ramp is built at zero chroma, so the lightness ramp is the only variable being explored. That keeps the results unambiguous, but it means every suggestion is a pure neutral and any tinted alternative has to be checked separately.",
      },
      {
        q: "Can I get AAA-safe colors from this list?",
        a: "The tool only filters at 4.5 to 1, so it does not label which candidates also clear 7 to 1. Since the list is sorted strongest first, the top entries usually do, but the printed ratio is what to go by rather than the position in the list.",
      },
      {
        q: "Why does my exact grey not appear in the results?",
        a: "Because the ramp walks lightness in fixed 5% steps, so the candidate nearest to your grey may sit just on the wrong side of a step. If you need a specific value, check it directly against the base instead of looking for it in the list.",
      },
      {
        q: "Does the ordering tell me which color is best?",
        a: "It tells you which is most separated, which is not the same thing. The strongest pairing is the safest for small text and the least subtle as a surface color, so the right entry is usually the one that clears the threshold with the least contrast you can afford.",
      },
      {
        q: "What if my base color is the text rather than the background?",
        a: "The ratios are unchanged, because contrast is symmetric, but the list becomes a set of surface colors rather than text colors. Read the previews accordingly, and expect the usable range to be narrower, since backgrounds have to be lighter than the text they carry.",
      },
    ],
  },

  "accessible-palette-generator": {
    keywords: [
      "accessible palette generator",
      "wcag aa colors",
      "4.5 contrast",
      "foreground colors for a background",
    ],
    intro:
      "The accessible palette generator picks a background and rolls foreground colours that clear WCAG AA against it, keeping five that reach a 4.5:1 contrast ratio.",
    content:
      "Contrast is a property of a pair, not of a colour, so this tool starts where the problem actually is: you choose the background, and it hunts for foreground colours that work on top of it. That is the reverse of the way most palettes are built, and it is the reason the page exists — a set of wcag aa colors is far easier to assemble when the surface is fixed first and the text colours are fitted to it.\n\nThe mechanism is rejection sampling against the WCAG ratio. A random colour is generated, its contrast ratio against your background is computed with the same formula the rest of the domain uses, and the colour is kept only if the ratio reaches 4.5:1 — the AA threshold for normal-size text. The loop repeats until five colours have passed or two hundred attempts have been spent, and it runs again whenever the background changes.\n\n- Threshold: a 4.5 contrast ratio, the AA requirement for body text, applied to every candidate.\n- Target: up to five foreground colours, each previewed as sample text on your chosen background with its hex value underneath.\n- Budget: two hundred attempts per run, which is generous for most backgrounds and occasionally insufficient for hard ones.\n- Refresh: changing the background colour regenerates the set rather than adding to it.\n\nThe failure mode is worth knowing, because it is predictable rather than random. Mid-grey backgrounds are the hardest case: at 4.5:1 against a mid-tone, the acceptable colours form two narrow bands at the extremes, so a run can end with fewer than five swatches or with a set dominated by near-black and near-white. Very dark and very light backgrounds are easy, which is why the tool is most useful against the pale surfaces that most interfaces actually use. Two hundred attempts is a budget rather than a guarantee: an accessible palette generator can return three colours on an awkward surface, and that is the mechanism working as designed rather than a fault.\n\n- AA only. There is no 7:1 AAA mode, and no 3:1 option for large text, icons or component boundaries.\n- One background at a time: a palette that has to work on both light and dark surfaces needs two runs and a merge.\n- The colours are random apart from the contrast rule, so they carry no hue relationships and no curation.\n- Nothing is checked for colour-vision deficiency, and nothing is exported — the values are copied by hand.\n\nUse it to fill the last awkward slot of a palette: the text colour, the icon tint, the border that has to be seen against a known surface. Where the relationship runs the other way — a fixed foreground colour that needs a background — the pair finder searches for partners instead, and where the question is not compliance but legibility, the readability checker adds the APCA reading that WCAG ratios do not provide. It is built for the case where the surface is settled and the foreground colors for a background are the open question, so run it after the layout is decided rather than before.",
    howTo: [
      { step: "Set the background colour the interface will actually use." },
      { step: "Read the five candidates: each is previewed as sample text on that background." },
      { step: "Copy the hex values that fit the design; regenerate by nudging the background if the roll is unpromising." },
      { step: "Confirm each pair with the contrast checker, and add an APCA read if you need more than compliance." },
    ],
    whenToUse:
      "Use this when the surface is fixed and the text colours are the open question. The {{contrast-checker|contrast checker}} verifies any pair afterwards, the {{10-color-palette-generator|10 colour palette generator}} builds a related hue family instead of a contrast-filtered set, and the {{wcag-21-aaa-checker|WCAG AAA checker}} is the tool when the requirement is 7:1 rather than 4.5:1.",
    faqs: [
      {
        q: "What contrast threshold does it target?",
        a: "4.5:1 — the WCAG AA requirement for normal-size text. Every candidate is measured against your background and kept only if it reaches the threshold.",
      },
      {
        q: "Why did I get fewer than five colours?",
        a: "The generator stops after two hundred attempts. Mid-grey backgrounds are the hard case, because very few colours reach 4.5:1 against them, so the loop can run out of budget.",
      },
      {
        q: "Does it produce AAA-level colours?",
        a: "Not specifically. The threshold is fixed at AA, so a returned colour may or may not also clear 7:1. Check candidates with the AAA checker when that level is required.",
      },
      {
        q: "Can it check a palette that has to work on light and dark?",
        a: "Run it once per background and compare: a colour set that satisfies both is the intersection of the two results, and nothing here computes that for you.",
      },
      {
        q: "Are the generated colours related to each other?",
        a: "No. Apart from the contrast rule they are random, so they share no hue relationships. Treat them as usable foreground candidates rather than as a designed palette.",
      },
    ],
  },

  "achromatopsia-simulator": {
    keywords: [
      "achromatopsia simulator",
      "total color blindness simulation",
      "grayscale conversion",
      "luminance conversion",
    ],
    intro:
      "Achromatopsia Simulator reduces a color to the neutral tone a viewer with no color vision would see, which is the most demanding test a palette can face.",
    content:
      "Achromatopsia Simulator shows a color and the neutral tone it becomes when no color signal is available at all. The comparison is stark by construction, because the simulated side is always a grey: the original and the result differ only in lightness, and every distinction the design was making with hue is gone.\n\nAchromatopsia is the complete absence of color vision, and it is rare, but the simulation is still the most useful stress test in the set:\n\n- The simulated swatch is guaranteed neutral, since the same luminance weight is applied to all three output channels.\n- Only lightness survives, so any two colors that were separated by hue alone will collapse together.\n- It is a stricter test than any of the single-channel deficiencies, because none of the three color axes is available.\n- Designs that pass it are almost always safe for the other deficiencies, since they have been forced to encode information in lightness rather than hue.\n\nThe conversion uses a single luminance formula applied identically to each output channel: 0.299 of the red value, 0.587 of the green and 0.114 of the blue. Those are the recursive luminance weights that standard grayscale conversion uses, and because the same total is written to red, green and blue, the result is neutral by definition. The arithmetic happens on the 8-bit channel values and is clamped into the 0 to 255 range before being written out as hex. Note how much of the total comes from green: a green color converts to a much lighter grey than a blue of the same apparent brightness, which is why two colors that look equally vivid can land at very different greys.\n\nThe page is deliberately minimal, and that is its limitation as much as its strength.\n\n- One color at a time, so a palette has to be worked through entry by entry.\n- No image simulation on this page.\n- The output is a single grey per color, with no intermediate or partial color vision option.\n- It does not tell you whether the resulting greys are distinguishable from each other, which is the question that actually decides whether a palette survives.\n- The grey is a model of how the colors convert, not a claim about any particular viewer's perception.\n\nUse it as the final check on a chart or a status system, after the individual pairs have passed their contrast thresholds. The practical test is to collect the grey values of every color in a set and ask whether they are far enough apart to be told apart at a glance, because that is the only channel left. Where two greys are close, increase the difference in the original colors' lightness rather than changing their hues.\n\nAs a total color blindness simulation the page is the bluntest check available, which is precisely why it is worth running first on a chart. The luminance conversion it applies uses the standard grayscale weights, so the result is also what you would see if the artwork were printed in black and white. That makes it dual-purpose: a palette that survives this check is both more robust for viewers and safer for grayscale reproduction.",
    howTo: [
      { step: "Enter a color in the swatch field to see it beside its grayscale conversion." },
      { step: "Note the hex value of the simulated swatch, which is always a neutral tone." },
      { step: "Repeat for each color in the palette, and compare the resulting greys against each other rather than one at a time." },
      { step: "Where two greys are close, adjust the lightness of the original colors until the neutral versions separate." },
    ],
    whenToUse:
      "Use the achromatopsia simulator as the strictest check on a palette, especially for charts, status colors and anything that has to work in print or in a grayscale reproduction. It pairs well with the {{color-blindness-simulator|color blindness simulator}} when you want all four deficiencies in one row, with the {{palette-accessibility-checker|palette accessibility checker}} when the question is contrast rather than separation, and with the {{text-readability-checker|text readability checker}} when the neutral result needs to be judged as actual text on a surface.",
    faqs: [
      {
        q: "Why is the simulated swatch always a plain grey?",
        a: "Because the conversion writes the same luminance value to all three channels, which makes the output neutral by definition. There is no hue left to show, only the light or dark tone the color carries.",
      },
      {
        q: "Which colors turn into light greys and which into dark ones?",
        a: "It depends mostly on green content, because green carries 0.587 of the luminance weight against 0.299 for red and 0.114 for blue. A saturated green converts to a distinctly light grey, while a blue of similar visual brightness lands much darker.",
      },
      {
        q: "Is a palette that passes this check safe for everyone?",
        a: "It is a strong indication rather than a guarantee. A palette that separates its colors by lightness has removed its dependence on hue, which is the main cause of failure across the deficiencies, but individual pairings still need their own contrast checks.",
      },
      {
        q: "Does the page show whether my greys are distinguishable?",
        a: "No. It gives you one grey per color and leaves the comparison to you. Converting every palette entry and lining the results up is the way to answer that question, since two greys that sit close together are the failure this check is looking for.",
      },
      {
        q: "Can I convert an image here?",
        a: "Not on this page, which works on a single color. The image path, which downsamples a picture to a maximum of 800 pixels on its longest edge and then applies a matrix, is part of the multi-type simulator.",
      },
    ],
  },

  "additive-color-mixer": {
    keywords: [
      "additive color mixer",
      "additive rgb mixing",
      "mix light colors together",
      "additive color calculator",
    ],
    intro:
      "The additive color mixer combines two colors the way emitted light does, summing their red, green and blue channels to show the additive rgb mixing result of overlapping light sources.",
    content:
      "- The additive color mixer combines two colors by adding their channels, which is how light behaves when two beams overlap.\n- You choose two colors and the tool adds the red values together, the green values together and the blue values together, clamping each sum at the maximum of 255.\n- The result is the color you would see where two spotlights of those colors overlap on a dark stage, or how two glowing pixels would combine if their energy were additive.\n\nThis is the model behind every screen. A display draws red, green and blue subpixels, and the viewer's eye integrates their light, so the browser rendering two overlapping translucent colored layers in the additive family behaves the way this tool predicts. Red plus green produces yellow, green plus blue produces cyan, and blue plus red produces magenta, all of which surprise people who are used to thinking in paint. The clamping at 255 is what keeps the sums inside the displayable range: once a channel is already at maximum, adding more light cannot brighten it further.\n\nIt is deliberately the opposite of the subtractive colour mixer in this same section, which multiplies channels instead. Additive mixing describes emitters such as screens, projectors, LEDs and stage lights. Subtractive mixing describes pigments, inks and filters, where each layer removes light rather than contributing it. Knowing which model applies is the single biggest source of confusion when people compare a printed proof against an on-screen design, and the two tools exist to make that distinction concrete.\n\n- A useful property of additive mixing is that it can only brighten.\n- Because every operation is a sum, the result is always at least as bright as the brighter input in each channel, and the mixed color can never be darker than either source.\n- That makes the tool a fast sanity check: if a proposed blend needs to come out darker, additive mixing cannot be the right model and you want the subtractive mixer or a weighted blend instead.\n\nFor practical work, additive mixing is the correct mental model for glow effects, light leaks, particle systems, and layered emissive UI elements. It is not a substitute for a designer-grade colour picker with alpha compositing, which weights the blend rather than simply summing it. When you want to know what two lights produce, or want to confirm that a red and green additive pair will read as yellow rather than brown, this is the calculator to reach for.\n\nAs an additive color calculator it is also a quick way to check a plan before building it. If you want to mix light colors together in a glow layer, a projector overlap or a set of emissive indicators, check the arithmetic here first: the addition of channels tells you immediately whether a pair will read as a distinct third hue or dissolve into white. The same additive rgb mixing model explains why overlapping translucent screens brighten toward white in the middle, which is a common surprise when stacking luminous overlays without controlling their combined intensity.",
    howTo: [
      { step: "Set Light A and Light B." },
      { step: "Read the sum: each channel is added and clamped at two hundred and fifty-five." },
      { step: "Compare the result with the two inputs — additive mixing is the mental model for glow and projection, not for pigment." },
      { step: "Use the subtractive mixer when the two colours are inks or filters rather than lights." },
    ],
    whenToUse:
      "Use additive mixing for anything that emits light: screens, LEDs, projectors, stage lighting and emissive glow effects. Switch to the subtractive mixer for pigments and inks, and to the two-color blend tool when you want a weighted interpolation rather than a pure sum. The {{subtractive-color-mixer|subtractive mixer}} is the pigment-side counterpart, and the {{cmyk-channel-mixer|CMYK channel mixer}} exposes the four ink channels directly.",
    faqs: [
      {
        q: "Why does red plus green give yellow?",
        a: "Because the eyes response to red and green stimuli together is perceived as yellow. Both the red and green channels are boosted, and the combination reads as a bright hue between them.",
      },
      {
        q: "Why does the result sometimes look clipped?",
        a: "Channel sums are clamped at 255, the brightest value a display can show. Once a channel is saturated, adding more of the same light cannot brighten it further.",
      },
      {
        q: "Is this the same as mixing paint?",
        a: "No. Paint follows subtractive mixing, where each pigment removes light and the result gets darker. Use the subtractive mixer for pigment and ink questions.",
      },
      {
        q: "Can additive mixing make a darker color?",
        a: "No. Every operation is a sum, so the result is always at least as bright as the brighter input in each channel. Use a weighted blend when you need to go darker.",
      },
      {
        q: "Can additive mixing make a colour darker?",
        a: "No. Each channel is a sum clamped at two hundred and fifty-five, so the result can only brighten: red and green sum to yellow, and adding a third light moves the answer towards white rather than away from it.",
      },
    ],
  },

  "alpha-color-generator": {
    keywords: [
      "alpha color generator",
      "rgba color generator",
      "8-digit hex",
      "color with transparency",
    ],
    intro:
      "The alpha color generator pairs a colour with an opacity percentage and prints both spellings of the result — an rgba() function and an 8-digit hex value — over a checkerboard that makes the transparency visible.",
    content:
      "Transparency is written two ways in CSS, and the alpha color generator produces both from a single control. Set a colour, drag the alpha slider, and the result panel shows a checkerboard preview with two copy rows beneath it: an rgba color generator value such as rgba(59, 130, 246, 0.50), and the matching 8-digit hex value, #3B82F680, for the same colour at the same half opacity.\n\n- rgba — decimal channels with the alpha as a two-decimal fraction, the form most stylesheets, templates and older linters expect.\n- hex8 — the same colour with its transparency byte appended, which is the color with transparency written as one string and the form design tokens and CSS variables usually prefer.\n- The preview composites the value over a twenty-pixel checkerboard tile of four grey and white quadrants, which is the only honest way to show alpha: a translucent colour painted on plain white is indistinguishable from a lighter opaque one.\n\nThe two outputs are computed differently, and that explains the last digit. The rgba string divides the slider by one hundred and prints two decimals; the hex value multiplies the same percentage by 255, rounds it, and appends the result as a byte. That is why fifty percent is 0x80 rather than 0x50 — the transparency channel counts in the same zero-to-255 range as the colour channels, not in percentages — and why the two strings describe the same intent with slightly different numbers: 0.50 against 128/255, which is 0.5020.\n\nA practical use is building a tint scale from one brand colour. Instead of defining faint, medium and strong variants by hand, generate the steps from the same base so the family stays mathematically consistent and a later brand change updates the whole ladder by moving one value. The catch is that every variant built this way inherits whatever surface it is painted on, which is why such a scale should be reviewed on the darkest and the lightest background it will meet rather than on the checkerboard alone.\n\n- The slider moves in whole percents, so alpha arrives in 101 steps and the rgba string always lands on two decimals.\n- The two notations do not map onto each other exactly. Pick one as the token and note the other beside it rather than treating the strings as interchangeable.\n- The base colour is always opaque. The field normalises input to six-digit hex, so a translucent value cannot be used as the starting point.\n- The preview composites over a checkerboard rather than over the surface the colour will actually sit on, so the final appearance still depends on whatever is behind it in the page.\n\nUse it for overlays, scrims, focus rings, hairlines and layered surfaces, where the colour is meant to composite with what is behind it. Where the value has to stay identical no matter what it is painted on, generate an opaque variation instead — alpha follows its backdrop, a lightened or darkened colour does not. When the alpha is already known and only the flattened result matters, the opacity calculator composites it against a real background and hands back the solid equivalent, which is also the value to quote when a downstream tool cannot render transparency at all.",
    howTo: [
      { step: "Set the base colour with the field at the top of the page." },
      { step: "Drag the alpha slider to the opacity you want; the percentage is shown beside it." },
      { step: "Watch the checkerboard preview for how much of the surface will show through." },
      { step: "Copy the rgba row for functional syntax, or the hex8 row when the value has to be a single token." },
    ],
    whenToUse:
      "Use this when a colour has to composite with what is behind it — overlays, scrims, borders and layered surfaces. The {{opacity-calculator|opacity calculator}} answers the opposite question by flattening a translucent value into the solid colour it produces, the {{color-overlay-generator|overlay generator}} applies alpha over a real image, the {{css-color-formatter|CSS color formatter}} covers the opaque notations, and the {{color-preview-on-background|color-on-background preview}} shows how a finished value reads on a chosen surface.",
    faqs: [
      {
        q: "Why is fifty percent alpha 0x80 instead of 0x50?",
        a: "The final hex pair counts transparency in the same zero-to-255 range as the colour channels. Half of 255 rounds to 128, which is 0x80; 0x50 would be about thirty-one percent.",
      },
      {
        q: "Which of the two strings should I store as a token?",
        a: "Store whichever your tooling reads back more reliably — usually the 8-digit hex in a token file and the rgba string in component code — and note the other beside it so the two are never edited apart.",
      },
      {
        q: "Why does the swatch show a checkerboard?",
        a: "Because a checkerboard is the standard way to reveal transparency. Without it, a translucent colour on a white card looks exactly like a lighter opaque colour, and the alpha is invisible.",
      },
      {
        q: "Can I start from a colour that already has transparency?",
        a: "No. The field normalises what you enter to six-digit hex, so the base is always opaque and the slider is the only source of alpha.",
      },
      {
        q: "Does alpha change the colour itself?",
        a: "The six-digit base colour is unchanged; alpha only decides how much of the surface behind shows through. That is why the same translucent value reads differently on a light and a dark page.",
      },
    ],
  },

  "analogous-palette-generator": {
    keywords: [
      "analogous palette generator",
      "three neighboring hues",
      "analogous color scheme",
      "30 degree color harmony",
    ],
    intro:
      "The analogous palette generator derives a three-color set from one base, using the base hue together with the two hues 30 degrees to either side. It is the quietest harmony here: neighbouring hues, one small step apart.",
    content:
      "An analogous palette generator builds its set from hues that sit next to each other on the wheel: the base, minus 30 degrees, and plus 30 degrees. That yields a run of three neighboring hues in which every member is a neighbour rather than an opposite, so the effect is continuity instead of contrast. The base is placed in the middle of the strip, with the two derived hues flanking it, which makes the relationship visible at a glance. The count is fixed by the rule at three, and the analogous color scheme is the gentlest set this domain produces.\n\nThe rotation is applied in OKLCH, and hue is the only coordinate that moves: lightness and chroma are carried over from the base, so all three swatches share the base's weight and differ only by hue. Keeping the weight constant is what stops the set from reading as a gradient; the 30 degree color harmony is a small hop in hue, and the uniform lightness makes the neighbours read as one family. Because OKLCH spaces hue perceptually, the minus and plus steps look evenly placed to the eye even though they are equal rotations from the base.\n\n- The spread is fixed at 30 degrees either side. There is no control for widening or narrowing the run.\n- The count is fixed at three. There is no count control and no fourth hue.\n- No contrast check. Neighbouring hues at equal lightness are the hardest set to separate for text, so pairings must be verified elsewhere.\n- No ordering or sorting. The strip keeps derivation order: minus 30, base, plus 30.\n- No lightness or chroma controls. The base is the only input, so tonal work moves to the tints and shades tools afterwards.\n\nUse the run where the palette should feel calm and continuous rather than pointed: a section background, a two-step hover, or a chart that steps gently through one family. Because neighbouring hues sit close together, the practical work is making them distinguishable. Adjacent swatches can read as one colour at small sizes, so assigning them to large, separate areas helps. If the set needs a point of emphasis, pair it with a complementary accent rather than adding a fourth neighbour, since the analogous color scheme is at its best when something else supplies the contrast.\n\nKeep a note of the base hue when the set is settled, because the whole trio is derived from it and reproducing the palette later means reproducing that one choice. A subtle palette also benefits from being tested on real content rather than the swatch strip: fill an actual surface and a real heading with the three hues, and the run either holds together as intended or shows where it needs a lightness step.\n\nThe set is also fully deterministic, which matters when a palette has to be reproduced: the same base always yields the same minus 30, base and plus 30 trio, on any machine and in any session. That makes an analogous palette generator useful for design tokens, where two neighbouring hues often serve successive states such as rest and hover, since the values can be regenerated exactly rather than eyeballed from a screenshot. Where the base is a brand colour, the derived neighbours inherit its identity automatically, so a quiet interface can be built from a single decision instead of three.",
    howTo: [
      { step: "Set the base color with the picker or by typing a hex value." },
      { step: "Read the three swatches: the -30° hue, the base, then the +30° hue." },
      { step: "Copy the hex value from any swatch you want to keep." },
    ],
    whenToUse:
      "Use the analogous generator when the palette should read as one family, such as gentle backgrounds, quiet chart steps or atmospheric gradients. The {{complementary-palette-generator|complementary generator}} is this set's opposite in temperament, the {{triadic-palette-generator|triadic generator}} spreads the same idea into a balanced triangle, and the {{monochromatic-palette-generator|monochromatic generator}} holds the hue and varies lightness instead. Check any text pair with the {{contrast-checker|contrast checker}}, and use the {{palette-sorter|palette sorters}} if the strip needs an order.",
    faqs: [
      {
        q: "Why is the base in the middle of the strip?",
        a: "The rule derives one hue below the base and one above, so the base naturally sits between them. It is always present, which keeps the color you must keep inside the set.",
      },
      {
        q: "Can I make the neighbouring hues closer or further apart?",
        a: "No. The analogous color scheme is fixed at 30 degrees either side. A narrower spread would collapse towards one hue and a wider one would stop being analogous; other spreads are served by the triadic and tetradic tools.",
      },
      {
        q: "Why do the three colors look so similar?",
        a: "That is the rule working as intended. Neighbouring hues at a shared lightness read as one family. Separate them by role and area, or pull one member's lightness apart with the tints and shades tools.",
      },
      {
        q: "Is this the same as a monochromatic palette?",
        a: "No. Analogous varies hue and holds lightness, while the monochromatic generator does the reverse, holding hue and stepping lightness. They are two routes to a quiet palette from different axes.",
      },
      {
        q: "Can the three hues carry text against each other?",
        a: "Rarely without help. Neighbours at equal lightness give very low contrast, so check the pair with the contrast checker and darken or lighten one side before assigning text.",
      },
    ],
  },

  "android-xml-color-generator": {
    keywords: [
      "android xml color generator",
      "colors.xml generator",
      "android color resource generator",
      "generate colors.xml entries",
    ],
    intro:
      "The Android XML color generator turns a list of named colors into a ready-to-paste colors.xml resource file with correctly formed color elements for your Android project.",
    content:
      "The Android XML color generator converts a working list of named colors into a valid Android color resource file. You add entries by giving each one a name and picking its color, and the tool assembles them into the resources block Android expects, with one color element per entry carrying the name as an attribute and the hex value as its content. The whole file is shown in a copy-ready block so you can paste it straight into the res values folder.\n\nThe output is deliberately plain. Android color resources are simple by design: a resources root element wrapping color children, each identified by a name attribute that your layouts, styles and code refer to. Generating them by hand is error prone because a typo in a color element or a stray character in the hex value produces a build error rather than a warning. Producing the block from a validated list removes that class of mistake entirely.\n\nIn practice you will generate colors.xml entries for a small palette and then reference them by name throughout the app rather than repeating hex literals. That indirection is what makes a theme change survivable: updating the color once in the resource file updates every screen that references it. Starting that resource file from a generated block, instead of typing it, means the names and values are consistent from the first commit.\n\n- The editor lets you rename entries freely, which is where most of the real work happens.\n- Good resource names describe roles rather than appearance, so a color called color_surface or color_danger survives a rebrand while one called light_blue_2 does not.\n- Because the palette editing is live, you can rename while watching the generated file update, and the copy button always reflects the current state.\n\nA few practical notes make the workflow smoother. Android supports six-digit and eight-digit hex, and the eight-digit form places alpha first rather than last, which is the opposite of the CSS convention; if you need transparency it is worth confirming the format matches what your project expects. Also keep an eye on the number of colors: it is easy to accumulate dozens of near-duplicates, and a generated file is a good moment to consolidate. If you want the same palette in other platforms, the iOS and Flutter generators in this section produce the equivalent declarations from the same list.\n\nBecause it is a dedicated colors.xml generator, it also removes the most common source of resource mistakes: a hand-typed hex value or a malformed element that only fails at build time. Treating it as an android color resource generator means you can keep the file generated from a source of truth rather than maintained by hand, so renaming a colour updates every reference deliberately instead of leaving stale duplicates behind. If you maintain several product flavours or a light and dark variant, generating the block separately for each keeps the resource files consistent and makes a diff between them readable rather than a wall of near-identical hex values.",
    howTo: [
      { step: "Add a row for each color you need and give it a resource name." },
      { step: "Pick the color for each row using the color field." },
      { step: "Rename any entry so it describes a role rather than an appearance." },
      { step: "Copy the generated resources block and paste it into res/values/colors.xml." },
    ],
    whenToUse:
      "Use this generator when you are defining Android color resources and want a clean colors.xml to commit. Use the iOS Swift or Flutter generators in the same section when the same palette needs to ship to those platforms. A palette that has to drive several platform files from one place is what the {{design-token-generator|design token generator}} carries, and the {{color-palette-json-exporter|color palette JSON exporter}} is where the palette lives before it becomes resources.",
    faqs: [
      {
        q: "Where does the file go?",
        a: "Paste the generated block into your app's res/values/colors.xml file. Android merges resource files, but keeping one colors.xml is the simplest convention.",
      },
      {
        q: "Does it support alpha channels?",
        a: "You can type any value the field accepts, but be aware Android's eight-digit hex places alpha first while CSS places it last. Confirm the ordering your project expects.",
      },
      {
        q: "How should I name the entries?",
        a: "Prefer role-based names such as color_surface or color_danger over appearance-based names like light_blue. Role names survive rebrands without edits.",
      },
      {
        q: "Can I edit the generated file after copying?",
        a: "Yes, the output is plain XML. Just keep it valid on future edits; that is exactly the kind of typo this generator exists to avoid.",
      },
      {
        q: "Can the output carry comments or groups?",
        a: "No — it is one resources block with one element per row, so comments, groups and resource qualifiers such as a values-night file are manual additions to the copied XML.",
      },
    ],
  },
};
