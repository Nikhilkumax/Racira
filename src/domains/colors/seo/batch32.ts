import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 32 (accessibility + analysis).
 *
 * Only tools whose logic is correct (audit verdict "Y") are authored here.
 * Tools flagged "P"/"N" in the functional audit are deliberately excluded.
 */
export const SEO_BATCH_32: Record<string, ToolSeo> = {
  "wcag-30-apca-checker": {
    keywords: [
      "wcag 3.0 apca checker",
      "apca contrast",
      "perceptual contrast",
      "polarity contrast",
    ],
    intro:
      "WCAG 3.0 APCA Checker previews the direction of the next accessibility contrast model, applying a single perceptual-style gate to a text and background pair.",
    content:
      "WCAG 3.0 APCA Checker previews the direction of the next accessibility contrast model. It pairs a foreground and a background, prints the contrast figure to two decimal places, and judges it against a single threshold, with the panel labelled as an approximation of APCA rather than as an implementation of it.\n\nThe APCA work exists because the WCAG 2.x ratio has a well-known weakness, and knowing what it replaces is the point of this page:\n\n- The older ratio is symmetric, so dark text on a light background and light text on a dark background score the same even though they do not read the same.\n- The older ratio is not perceptually uniform, so equal steps of ratio do not correspond to equal steps of perceived contrast.\n- The older ratio ignores polarity, text size and font weight entirely, which is why a 4.5 to 1 result can describe two pairs that feel completely different.\n- APCA reworks the model around polarity and lightness, and reports a lightness contrast value rather than a ratio.\n\nThe figure this page prints comes from the WCAG 2.x contrast ratio calculation, rounded to two decimals, compared against a 4.5 to 1 gate. No APCA lightness contrast value is computed, and the panel heading says as much. That makes the page useful as an orientation aid, letting you see how an existing pair sits against a familiar number while you read up on the newer model, but not as evidence about how APCA would score the same pair.\n\nReading the printed figure as an APCA contrast score is the trap to avoid. What is on screen is a perceptual contrast figure in the WCAG 2.x tradition, and the polarity contrast question that motivates the newer model is left entirely unanswered by it. The quickest way to see the difference the model is arguing about is to compare a dark-on-light pair with the same two colors inverted, and note that this page returns identical numbers for both.\n\nBecause the panel is an approximation, its limits are the important part.\n\n- The number is the WCAG 2.x ratio. It cannot be quoted as an APCA lightness contrast value, and the two are not interchangeable.\n- Polarity is not modelled. Swapping the two colors returns the same figure here, whereas an APCA score would not.\n- Text size and font weight do not change the result, though both are inputs to the newer model.\n- The 4.5 to 1 threshold is borrowed from WCAG 2.x AA. It is not an APCA threshold, because APCA does not define one.\n- Two colors only, with no alpha and no surface behind them.\n\nTreat this page as a preview and a signpost. For a compliance decision today, the AA and AAA checks are the ones that map onto a published standard, and this page is the right place to start when you suspect that a ratio-shaped threshold is the wrong tool for a pair that simply does not read well.",
    howTo: [
      { step: "Enter the foreground color and the background color in the two swatch fields." },
      { step: "Read the panel heading, which labels the figure as an APCA approximation and gives it to two decimal places." },
      { step: "Compare the Pass or Fail line against the 4.5 to 1 gate shown beside it." },
      { step: "Swap the two colors and re-read the unchanged figure, which is the quickest way to see the polarity limitation for yourself." },
    ],
    whenToUse:
      "Use the WCAG 3.0 APCA checker when you want to know how a pair will look against a familiar ratio gate while you evaluate the perceptual model that is likely to replace it. For published compliance, the {{wcag-21-aa-checker|WCAG 2.1 AA checker}} and {{wcag-21-aaa-checker|WCAG 2.1 AAA checker}} are the checks that map onto WCAG 2.1 itself, the {{contrast-checker|contrast checker}} shows all four WCAG 2.x thresholds at once, and the {{text-readability-checker|text readability checker}} is the place to go when a pair passes on paper but still reads poorly in practice.",
    faqs: [
      {
        q: "Does this page calculate a real APCA score?",
        a: "No, and the panel says so. The figure is the WCAG 2.x contrast ratio rounded to two decimals, judged against a 4.5 to 1 gate. Real APCA produces a lightness contrast value on a different scale, which this tool does not compute.",
      },
      {
        q: "Why does swapping the two colors not change the result?",
        a: "Because the symmetric ratio is what is being measured, and swapping the inputs leaves it identical. This is exactly the property that APCA was designed to move away from, since dark-on-light and light-on-dark text genuinely score differently under the newer model.",
      },
      {
        q: "Is APCA part of a published standard yet?",
        a: "It is a draft direction for WCAG 3.0 rather than a finished requirement. Nothing about the current AA and AAA obligations changes because of it, which is why the compliance checks in this tool still use the WCAG 2.x thresholds.",
      },
      {
        q: "My pair passes here but is still hard to read. What then?",
        a: "That is the failure mode the APCA discussion is about. A pair can clear a ratio threshold and still read uncomfortably, usually because the text is thin or small. Raising the size or weight, or widening the lightness gap, fixes more than re-running the same colors.",
      },
      {
        q: "Should I quote this figure in an accessibility statement?",
        a: "No. Quote the WCAG 2.x ratio from the contrast checker or the ratio calculator, which are the figures the published thresholds are defined against, and treat this page as an orientation tool only.",
      },
    ],
  },

  "contrast-ratio-calculator": {
    keywords: [
      "contrast ratio calculator",
      "contrast ratio formula",
      "relative luminance",
      "wcag ratio scale",
    ],
    intro:
      "Contrast Ratio Calculator isolates the single number that every contrast rule is built on, printing the WCAG ratio between two colors to two decimal places.",
    content:
      "Contrast Ratio Calculator isolates the number that every contrast rule is built on: the WCAG ratio between two colors, printed to two decimal places. It runs the same two-color engine as the contrast checker, and the difference is emphasis rather than arithmetic. Here the ratio is the headline and the pass-or-fail badges are the by-product, which makes this page the right one when you need the figure itself rather than a verdict on it.\n\nThe calculator also shows the four standard comparisons, so you can see where your figure lands on the scale without switching pages:\n\n- AA normal text at 4.5 to 1, the common shipping gate for body copy.\n- AA large text at 3 to 1, the relaxed bar for large type.\n- AAA normal text at 7 to 1, the enhanced level.\n- AAA large text at 4.5 to 1, the enhanced level for large type.\n\nThe arithmetic is the WCAG 2.x contrast ratio formula, unmodified. Each color is parsed, converted to sRGB, and each channel is linearised so that mid-tones are weighted the way human vision weights them rather than the way the raw 8-bit values suggest. The linear channels are combined as 0.2126 red, 0.7152 green and 0.0722 blue into relative luminance, and the ratio is the lighter luminance plus 0.05 divided by the darker plus 0.05. The 0.05 offset is what keeps the result finite for black on black, and it is also why the scale is not linear: the useful steps crowd together at the top end.\n\nThe scale is worth internalising, because a WCAG ratio scale figure only means something next to the thresholds it sits between. Below 3 to 1 no text passes anything. From 3 to 1 up to 4.5 to 1 only large text is covered. From 4.5 to 1 to 7 to 1 AA is satisfied completely, and above 7 to 1 both AA and AAA are met at normal text size. The very top of the range, at 21 to 1, is reserved for black on white. Reading a figure against those bands is faster than comparing it with four badges one at a time.\n\nBecause the calculator exposes the raw figure, its limits are worth stating plainly.\n\n- The ratio is symmetric. Swapping the two colors returns exactly the same number, so the figure alone never tells you which color is lighter.\n- The scale is not perceptually uniform. A full point of ratio near 21 to 1 is a much smaller visual difference than a full point near 2 to 1, which is precisely the criticism that motivated perceptual alternatives.\n- It does not produce an APCA lightness contrast value. Anything asking for an Lc figure has to come from a dedicated APCA calculator.\n- Two colors only, no alpha, and no third surface behind them.\n- Font metrics are excluded. The number describes the color pair, not the text set in it.\n\nUse the figure as a precise, quotable measurement: for a design audit, a handoff document, or a regression test where you want to assert that a pair has not drifted. Where you only need to know whether to ship, the general contrast checker gives the same number with the thresholds already attached.",
    howTo: [
      { step: "Enter the two colors you want measured in the text and background swatches." },
      { step: "Read the contrast ratio in the second panel heading, accurate to two decimal places." },
      { step: "Compare it against the four badge rows below to place your figure on the AA and AAA scale." },
      { step: "Change one color a few percent at a time to see how far the ratio moves, which is the fastest way to find the smallest edit that clears a threshold." },
    ],
    whenToUse:
      "Use the contrast ratio calculator when the ratio itself is what you need to record, report or assert: an audit figure, a design-system token value, or a number to quote in review. The {{contrast-checker|contrast checker}} covers the same arithmetic when all you need is a verdict, the {{wcag-30-apca-checker|WCAG 3.0 APCA checker}} is the place to look when a ratio shape is the problem rather than the level, and the {{palette-accessibility-checker|palette accessibility checker}} measures a whole set at once rather than a single pair.",
    faqs: [
      {
        q: "How many decimal places is the reported ratio accurate to?",
        a: "The figure is rounded to two decimal places, which is the same precision the WCAG thresholds are usually compared at. That matters because 4.49 and 4.5 sit on opposite sides of the AA line.",
      },
      {
        q: "Why is a ratio of 21 to 1 the maximum?",
        a: "The formula offsets both luminances by 0.05 before dividing. The brightest luminance is 1 for white and the darkest is 0 for black, so the extreme case is 1.05 divided by 0.05, which is exactly 21. No pair of opaque sRGB colors can exceed it.",
      },
      {
        q: "Does it matter which color I put in the text swatch and which in the background?",
        a: "For the number itself, no, because the ratio is symmetric and gives the same result either way round. It matters for reading the preview, since that is what shows you which way the pair will actually be rendered.",
      },
      {
        q: "Can I use the ratio to compare two different color pairs against each other?",
        a: "Only loosely. A pair at 6 to 1 is more contrast than a pair at 4 to 1, but the gap between them is not proportionally larger in visual terms, because the scale compresses as it rises. Treat the figures as thresholds crossed rather than as scores to rank.",
      },
      {
        q: "Why does a pair at 4.5 to 1 fail one badge and pass another?",
        a: "The two badges measure different requirements. AA normal text and AAA large text both sit at 4.5 to 1, so a pair at exactly that figure clears both, while AA large at 3 to 1 also passes and AAA normal at 7 to 1 does not.",
      },
    ],
  },

  "minimum-contrast-auto-fixer": {
    keywords: [
      "minimum contrast auto fixer",
      "fix failing contrast",
      "contrast fix",
      "pass aa contrast",
    ],
    intro:
      "Minimum Contrast Auto-Fixer takes a color whose pairing has failed and returns neutral alternatives that reach the 4.5 to 1 AA minimum against it.",
    content:
      "Minimum Contrast Auto-Fixer starts from a color and returns the neutrals that already satisfy a contrast minimum against it. It is the repair side of the pair problem: instead of telling you whether a combination passes, it assumes one side is fixed, generates candidates for the other, and keeps only the ones that clear 4.5 to 1, strongest first.\n\nWhat the fix actually consists of is worth stating precisely, because the tool does not edit your color:\n\n- Your input color becomes the surface, and stays exactly as entered.\n- Twenty-one candidate neutrals are generated by stepping lightness from 0 to 1 in 5% increments at zero chroma.\n- Candidates below 4.5 to 1 against your color are discarded, and the rest are ordered by ratio.\n- The eight strongest survivors are shown, each previewed as text over your input color with its hex value and ratio.\n\nThe fix is therefore a substitution: the failing color in the pairing is replaced with one of the listed neutrals rather than being nudged until it passes. That is a real constraint in practice, because a brand color that fails cannot be repaired by this tool at all; what changes is the other half of the pair. The underlying figure is the usual WCAG 2.x contrast calculation, with each color linearised out of sRGB and weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance, divided and offset by 0.05, and rounded to two decimals.\n\nA few boundaries follow from how narrow the fix is.\n\n- Your color is never modified. If the failing color is the one that has to stay, this page tells you what to put with it, not how to lighten or darken it.\n- Every candidate is a pure neutral. Tinted replacements have to be taken from the list and re-checked after adjustment.\n- The threshold is fixed at 4.5 to 1. There is no way to ask for 3 to 1 on a large-text pairing or 7 to 1 for the enhanced level.\n- Only the top eight passing options are listed, so the list stops short of the full passing set.\n- Passing the ratio is not the same as reading well. A neutral that just clears the line is the riskiest entry in the list when the text is small or the font is light.\n- One pair at a time, with no alpha and no surface behind it.\n\nUse this page as the last step of a fix: run the check first, confirm what actually failed, then come here for replacements. Prefer an entry that clears the threshold with room to spare rather than the first one that passes, since the aim is a pairing that survives weight changes and smaller sizes.\n\nThe name describes the job plainly: a minimum contrast auto fixer exists to fix failing contrast by returning the neutrals that pass AA contrast. What it deliberately does not do is the more ambitious form of a contrast fix, which is to nudge your own color by a few percent of lightness until it clears the threshold while keeping its hue. That is usually what a designer wants when the failing color is a brand tone, and because this page never modifies its input, a manual adjustment is the right route when the color itself has to change.",
    howTo: [
      { step: "Enter the color that must not change in the swatch field, which will act as the surface." },
      { step: "Read the candidate grid, each entry previewed as text on that color." },
      { step: "Check the ratio printed under each candidate and choose one with headroom above 4.5 to 1 rather than the first that passes." },
      { step: "Re-run the threshold check with the replacement in place to confirm the pairing now clears AA." },
    ],
    whenToUse:
      "Use the minimum contrast auto-fixer when a pairing has already failed a check and one side of it cannot move. Confirming the failure itself belongs with the {{contrast-checker|contrast checker}} or the {{wcag-21-aa-checker|WCAG 2.1 AA checker}}, building a fresh set of pairings from a new base is the {{accessible-color-pair-finder|accessible color pair finder}}, and checking that the replacement reads well once applied is the {{text-readability-checker|text readability checker}}.",
    faqs: [
      {
        q: "Does this tool change my color to make it pass?",
        a: "No. Your input color is treated as fixed and becomes the surface for the pairing. What the tool returns are neutral partners that already meet the minimum, so applying the fix means substituting the other color in the pairing.",
      },
      {
        q: "What if the failing color is the one I cannot change?",
        a: "Then the replacement has to come from the other side of the pair. Keep your color as the text or the surface and choose a listed neutral for the opposite role, then re-check, because the roles do not carry the same usable range.",
      },
      {
        q: "Can it target AAA instead of AA?",
        a: "The filter is fixed at 4.5 to 1 for AA. Because the results are ordered from strongest contrast down, entries near the top often clear 7 to 1 as well, but the page does not filter or label them, so the printed ratio is what to read.",
      },
      {
        q: "The suggested neutral passes but looks heavy. Is that expected?",
        a: "Yes. A neutral strong enough to clear the threshold against a mid-tone surface is usually well separated, and on a light or dark surface it reads as stark. Choosing an entry lower in the list trades some contrast for softness, as long as it still clears the line.",
      },
      {
        q: "Why is the list so short if many colors would work?",
        a: "Because the candidate ramp itself is narrow: twenty-one neutrals at fixed lightness steps, filtered at the threshold and trimmed to the best eight. A wider, tinted search is outside what the ramp covers.",
      },
    ],
  },

  "deuteranomaly-simulator": {
    keywords: [
      "deuteranomaly simulator",
      "partial color blindness",
      "green weakness",
      "deuteranomaly prevalence",
    ],
    intro:
      "Deuteranomaly Simulator previews a color as a viewer with reduced green sensitivity would see it, covering the partial deficiency that is more common than the complete one.",
    content:
      "Deuteranomaly Simulator previews what a color becomes for a viewer with reduced sensitivity in the medium-wavelength cone. It draws the original and the simulated version as a large pair, and the reason the page matters is arithmetic rather than aesthetic: deuteranomaly is the most common color vision deficiency of any kind, so a palette that fails here fails for more people than any other single check on this site.\n\nDeuteranomaly is described as partial rather than complete, and that description carries the important nuance:\n\n- Green sensitivity is reduced rather than absent, so red and green separation narrows instead of closing.\n- Deuteranomaly prevalence among men is around one in twenty, which puts it well ahead of the complete deuteranopia it is often confused with.\n- What a viewer sees sits between typical color vision and a full deuteranopic view, and where on that range they sit varies from person to person.\n- The practical effect on a design is usually the same as for the complete form but milder, meaning reduced hue separation between reds and greens with lightness intact.\n\nOne detail of this page is worth stating plainly, because it affects how the result should be read. The simulation is produced by the same matrix the deuteranopia page uses, applied to the 8-bit red, green and blue channels: 0.625 red plus 0.375 green on the first row, 0.7 red plus 0.3 green on the second, and 0.3 green plus 0.7 blue on the third, clamped into the 0 to 255 range. That matrix models the complete deficiency at full strength. So the swatch on the right shows a full deuteranopia projection rather than a graded partial one, and it should be read as a worst case for this group rather than as a picture of the average viewer with deuteranomaly.\n\nThat gap between the label and the model is the main limitation, and it comes with a few others.\n\n- No severity control, so the partial range the tool is named for cannot be dialled in.\n- One color at a time, with no palette view.\n- No image simulation on this page.\n- The output is the complete-deficiency projection, which is typically a harder case than a viewer with the anomaly actually experiences.\n- The hex value printed is a product of that model, not a measurement of any individual's perception.\n\nTreat the page as a conservative test. If a red and a green survive the full projection, they will separate comfortably for someone with the partial form, and that is a useful property to design against. If lightness is the only thing keeping them apart, the projection will show it, and the fix is to widen that difference until even the complete case holds.\n\nIt helps to be precise about the label. This is a partial color blindness page in the sense that deuteranomaly is the partial form of the deficiency, but the swatch shows the complete projection, so green weakness is represented at its limit rather than at a typical level. Used that way it is a conservative check, and a pair that separates cleanly under it will separate for every viewer whose anomaly sits short of the complete case.",
    howTo: [
      { step: "Enter the color you want to preview in the swatch field." },
      { step: "Compare the original swatch with the simulated result beside it, paying attention to how much separation red and green have lost." },
      { step: "Read the hex value under the simulated swatch as a record of the conversion." },
      { step: "Decide whether the result is still distinguishable from the other colors it will appear with, remembering that this is the stricter complete-deficiency projection." },
    ],
    whenToUse:
      "Use the deuteranomaly simulator when you want the conservative version of a red-green check, since it applies the complete deuteranopia projection and therefore covers the partial form too. The complete deficiency on its own terms is the {{deuteranopia-simulator|deuteranopia simulator}}, the red end of the same problem is the {{protanomaly-simulator|protanomaly simulator}}, a whole screen rather than one color is better served by the {{color-blindness-simulator|color blindness simulator}}, and text colors that survive it are the business of the {{accessible-color-pair-finder|accessible color pair finder}}.",
    faqs: [
      {
        q: "How is deuteranomaly different from deuteranopia?",
        a: "Deuteranopia is the complete absence of the medium-wavelength cone and deuteranomaly is a reduced sensitivity in the same cone. The anomaly is far more common, the effect is milder, and the range of experience within it is wide.",
      },
      {
        q: "Does this page show a partial result?",
        a: "Not in severity. It uses the same complete matrix as the deuteranopia page, applied at full strength, so the simulated swatch represents a full deuteranopia projection. Reading it as a worst case for the affected group is the accurate interpretation.",
      },
      {
        q: "Why is deuteranomaly worth checking first?",
        a: "Because of how many people it covers. Its deuteranomaly prevalence among men is around one in twenty, making it more common than every complete deficiency combined. A single check on a red and green pairing therefore protects a larger group than any other simulation here.",
      },
      {
        q: "If my colors pass this page, are they safe for all red-green deficiencies?",
        a: "Passing the complete projection is a strong signal for this cone, and the protan side is a separate check on its own page. A palette that separates colors by lightness rather than hue tends to pass both, which is why luminance is the more reliable thing to design with.",
      },
      {
        q: "Can I see the difference between mild and severe cases here?",
        a: "No. There is a single full-strength matrix and no severity input, so the page cannot show the range that the anomaly describes. It represents the conservative end of that range rather than any point within it.",
      },
    ],
  },

  "protanomaly-simulator": {
    keywords: [
      "protanomaly simulator",
      "partial red blindness",
      "red weakness",
      "protanomaly prevalence",
    ],
    intro:
      "Protanomaly Simulator previews a color as a viewer with reduced red sensitivity would see it, applying the complete protanopia projection as a conservative check.",
    content:
      "Protanomaly Simulator previews a color for a viewer whose sensitivity to the long-wavelength cone is reduced rather than absent. The page shows the original and the simulated result as a large pair, which makes it the quickest way to see how much of a red survives when the red channel stops contributing as it usually does.\n\nProtanomaly sits on the same axis as protanopia, so the two are often grouped, but there are real differences in what a design should expect:\n\n- Red sensitivity is reduced rather than missing, so reds lose vividness progressively rather than collapsing at once.\n- Protanomaly prevalence among men is around one in a hundred, which makes it markedly less common than the green anomaly but still far more common than the complete form.\n- Red also loses some luminance, which is the reason this page is worth separating from the green anomaly: a dark red becomes harder to see, not merely duller.\n- Where a viewer sits between typical color vision and a complete protan view varies widely, so a single simulated swatch cannot represent the group.\n\nThe swatch is produced by the same matrix the protanopia page uses, applied directly to the 8-bit red, green and blue channels: 0.567 red plus 0.433 green on the first row, 0.558 red plus 0.442 green on the second, and 0.242 green plus 0.758 blue on the third, with results clamped into the 0 to 255 range before being written out as hex. That matrix models the complete deficiency at full strength. What appears on the right is therefore the severest case for this cone rather than a graded partial view, and the gap between that and a typical viewer with the anomaly is the single most important thing to know about this page.\n\nThe limits follow from the same source.\n\n- No severity control, so the partial range the page is named for cannot be reproduced.\n- One color per comparison, with no palette or image mode.\n- The simulated result is a complete-deficiency projection, which is generally harder than the anomaly itself.\n- The hex value describes the model, not a prediction of what a particular viewer will see.\n- Nothing is measured from a real display, so panel differences are not reflected.\n\nUse it as the strict version of a red check. Alerts, negative states, required-field markers and any red-versus-green pairing are the places it earns its keep, and the question to ask of the simulated swatch is whether it still separates from its neighbours in lightness once red has contributed as little as the matrix allows. If it does, someone with the partial form will see at least as much separation, because their red channel is still doing some work.\n\nThe naming is worth disentangling, because it shapes how the result should be used. Partial red blindness describes the audience the page is aimed at, while the conversion itself is the complete matrix, so red weakness appears at its limit rather than at the milder level most affected viewers experience. Read that way the swatch sets a floor: anything that still separates under it will separate for everyone whose red sensitivity is reduced by less.",
    howTo: [
      { step: "Set the color you want previewed in the swatch field." },
      { step: "Read the two swatches together, checking how much the red has lost in both saturation and lightness." },
      { step: "Note the hex value printed for the simulated result if the conversion needs recording." },
      { step: "Compare that result against the other colors it will appear with, and widen the lightness gap if it has become hard to separate." },
    ],
    whenToUse:
      "Use the protanomaly simulator when red carries meaning and you want the conservative end of the partial red deficiency covered in one check. The fully protanopic view is the {{protanopia-simulator|protanopia simulator}}, the green counterpart is the {{deuteranomaly-simulator|deuteranomaly simulator}}, a screen rather than a single color is better handled by the {{color-blindness-simulator|color blindness simulator}}, and text that has to remain legible after the conversion is the subject of the {{text-readability-checker|text readability checker}}.",
    faqs: [
      {
        q: "Is protanomaly a mild version of protanopia?",
        a: "It sits on the same axis but it is not simply a milder label. Sensitivity to the long-wavelength cone is reduced rather than absent, and where an individual falls along that range varies considerably, so a single swatch cannot stand in for the whole group.",
      },
      {
        q: "Why is red harder to see rather than just duller?",
        a: "Because the long-wavelength cone contributes luminance as well as hue information. Removing or reducing it both desaturates a red and lowers its perceived brightness, which is why a dark red can become difficult to distinguish from a dark background.",
      },
      {
        q: "Does the page show the partial case it is named after?",
        a: "No. It reuses the complete protanopia matrix at full strength, so the simulated swatch is a worst-case projection. That makes the page useful as a conservative test, and it means the label describes the audience rather than the arithmetic.",
      },
      {
        q: "What kinds of design fail here most often?",
        a: "Status systems that use red and green for opposite meanings, and alert text set in a mid-tone red on a dark surface. Both rely on hue for the distinction and on red for luminance, which are exactly the two things this deficiency reduces.",
      },
      {
        q: "Can I use the printed hex value as a replacement color?",
        a: "It is better read as a diagnostic. The value shows where the model sends your color, which is useful for judging separation, but adopting it as a palette entry would mean designing for the simulation rather than for the range of viewers it represents.",
      },
    ],
  },

  "color-blind-friendly-color-picker": {
    keywords: [
      "color blind friendly color picker",
      "cvd friendly palette",
      "accessible text colors",
      "luminance contrast picking",
    ],
    intro:
      "Color Blind Friendly Color Picker starts from a color and returns neutral text and surface colors that reach AA contrast against it, which is the separation color vision deficiencies leave intact.",
    content:
      "Color Blind Friendly Color Picker takes a color and returns neutral colors that reach AA contrast against it. The approach is deliberately indirect: rather than simulating a deficiency, it picks the other half of a pairing on the one channel that every deficiency leaves working, which is lightness. If a pairing is separated by luminance, it survives the loss of hue, and that is the property this page is built to find.\n\nStart with the base color, and the tool walks a ramp of neutrals against it:\n\n- Twenty-one neutral steps, generated by moving lightness from 0 to 1 in 5% increments with chroma held at zero.\n- A single filter at 4.5 to 1 against your base, which removes every candidate that would not be safe for ordinary text.\n- Ratio ordering, strongest first, so the top of the list is the most separated pairing rather than the most harmonious one.\n- A shortlist of eight, each shown as text over your base color with its hex value and ratio.\n\nThe candidates are built in OKLCH at zero chroma and converted to hex, and each ratio is the standard WCAG 2.x figure: the channels are linearised out of sRGB, weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance, and the lighter value plus 0.05 is divided by the darker plus 0.05. This is luminance contrast picking rather than color matching, which is why the results are greys, and why they hold up when hue information disappears.\n\nWhat the page does not do matters as much as what it does.\n\n- It does not simulate any deficiency. The results are chosen for contrast, and they help because lightness survives those conditions, not because the tool models them.\n- Every candidate is a pure neutral. A tinted alternative has to be derived from one of the listed values and then re-checked, since its hue will change the ratio.\n- The threshold is fixed at 4.5 to 1, so there is no way to request the 3 to 1 large-text figure or the 7 to 1 enhanced level directly.\n- Separation between two non-text colors is not addressed. A chart series palette still needs its own review.\n- One base color at a time, with no alpha.\n\nUse it when a brand color is fixed and you need text or surface colors that stay readable for viewers who lose hue distinctions. The recommended pattern is to take a neutral from the top of the list for body copy, which keeps the pairing separated in the one channel that survives, and then to verify the result in the simulation pages before shipping.\n\nIt is worth separating what this page is from what it is not. A cvd friendly palette needs its separation to sit on the axis the deficiencies leave intact, and the candidates here supply accessible text colors on exactly that basis, which is why every suggestion comes out neutral. Nothing on the page simulates a deficiency, so the results are a strong starting point and should be confirmed in the simulation views rather than treated as a final verdict.",
    howTo: [
      { step: "Enter the color that has to stay in the swatch field, which will act as the surface." },
      { step: "Read the eight candidates, each previewed as text on that color." },
      { step: "Pick a value from near the top of the list when the text is small, and further down when a softer pairing is wanted, checking the printed ratio each time." },
      { step: "Re-check the chosen pairing in a simulation page to confirm it still separates once hue is removed." },
    ],
    whenToUse:
      "Use the color blind friendly color picker when a fixed brand color has to carry text and you want the pairing chosen on lightness rather than hue. Confirming the result against actual deficiencies is the job of the {{color-blindness-simulator|color blindness simulator}}, checking that the pairing also reads well is the {{text-readability-checker|text readability checker}}, auditing a whole existing palette rather than one base is the {{palette-accessibility-checker|palette accessibility checker}}, and a plain threshold verdict on any pair is the {{wcag-21-aa-checker|WCAG 2.1 AA checker}}.",
    faqs: [
      {
        q: "Does this tool simulate color blindness?",
        a: "No. It chooses neutral colors that reach a contrast threshold against your base. Those neutrals help under color vision deficiencies because lightness is the channel the deficiencies leave intact, but no simulation is involved in producing them.",
      },
      {
        q: "Why are the suggestions all greys rather than tinted colors?",
        a: "Because the ramp runs at zero chroma, so lightness is the only variable. That keeps the result unambiguous and guarantees the separation is carried by luminance, which is the property that survives when hue information is lost.",
      },
      {
        q: "Will a neutral pairing look right with a strongly branded palette?",
        a: "Usually it does, since neutral text over a colored surface is a common pattern. If the palette needs a tinted alternative, start from the listed neutral and shift it a few degrees in hue, then re-check the ratio, because tinting always moves it.",
      },
      {
        q: "Can I get the enhanced AAA level from this list?",
        a: "The filter is fixed at 4.5 to 1 and the results are ordered strongest first, so entries near the top often clear 7 to 1 too. The page does not label them, so read the printed ratio rather than the position in the list.",
      },
      {
        q: "Does this help with chart colors as well as text?",
        a: "Only indirectly. The candidates are for text and surface pairings against one base color. Series that have to be told apart from each other need their own check, usually by giving them clearly different lightness values rather than different hues.",
      },
    ],
  },

  "color-blindness-test": {
    keywords: [
      "color blindness test",
      "color vision self check",
      "cvd screening",
      "normal and simulated swatches",
    ],
    intro:
      "Color Blindness Test is a quick color vision self check: it shows one color beside simulations of four common deficiencies so you can spot the ones that look identical to you.",
    content:
      "Color Blindness Test is a fast color vision self check rather than a clinical screen. It takes one color, renders it beside simulations of four common color vision deficiencies, and leaves the comparison to you. The useful signal is the opposite of what you might expect: it is the pairing where the normal and simulated swatches look the same that tells you something, because a deficiency the simulation is modelling would be one you cannot distinguish in the same way a viewer with it cannot.\n\nThe page lays out a small, fixed set of views:\n\n- The original color first, as the reference every other swatch is judged against.\n- Four simulated swatches, one for each deficiency the engine models: protanopia, deuteranopia, tritanopia and achromatopsia.\n- Normal and simulated swatches presented in the same row at the same size, so a difference or a match is a single glance away.\n- An image mode that applies one of the same four simulations to a picture you supply, for the case where a single color is not enough.\n\nBehind the swatches are four fixed three-by-three matrices that recombine the red, green and blue channels, applied directly to the 8-bit values and clamped to the 0 to 255 range. The achromatopsia entry is the only one whose output is guaranteed neutral, because it applies the same luminance weighting to all three channels. Because every matrix is applied at full strength, what you are comparing against is a complete deficiency rather than a graded one, and the page shows all four at once so no single result has to be trusted on its own.\n\nThe limits follow from it being a self check rather than a test with a score.\n\n- It is not a diagnosis. Recognising a color in a simulation is not a measure of your vision, and nothing here should be read as one.\n- It cannot tell you which deficiency you may have. It shows four versions of a color and you decide whether one of them is indistinguishable, which is a subjective comparison and not a result.\n- One color at a time, so checking a whole palette means working through it entry by entry.\n- The simulations are full deficiencies. A mild anomaly, which is by far the more common case, may see a clear difference that the swatch does not show.\n- Nothing is scored, stored or compared over time, and no history is kept between visits.\n\nUse it as a first look at a color you are unsure about, and as a way to get a feel for how much information a hue actually carries once a channel is removed. If two swatches match for you, treat that as a cue to separate the colors by lightness rather than as a finding about your eyes, and if you need more than a cue, the full simulation view and the image simulation give you a broader comparison to work from.\n\nAs a form of cvd screening it is deliberately shallow, and that is the honest description of the page. It produces a view rather than a score, so it will not tell you where on a range you sit or whether you should seek further advice. What it does well is make the loss of information visible on a single screen, which is often enough to change how a chart, a legend or a status color is set up.",
    howTo: [
      { step: "Choose a color in the swatch field, ideally one from a palette you are already working on." },
      { step: "Read the row from left to right, comparing the original against each deficiency in turn." },
      { step: "Note any pair where the normal and simulated swatches look indistinguishable to you, since that is the cue the page produces." },
      { step: "Switch to the image panel and run your most color-dependent screen through one of the simulations to check the same question in context." },
    ],
    whenToUse:
      "Use the color blindness test when you want a quick self check of how a single color reads across several deficiencies in one view. The wider comparison, including the image simulation across all four types, is the {{color-blindness-simulator|color blindness simulator}}; a one-to-one comparison for a specific deficiency is the {{protanopia-simulator|protanopia simulator}} or {{deuteranopia-simulator|deuteranopia simulator}}; and choosing text colors that hold up once hues are gone belongs with the {{color-blind-friendly-color-picker|color blind friendly color picker}}.",
    faqs: [
      {
        q: "Is this the same as an Ishihara plate test?",
        a: "No. Ishihara plates rely on figures hidden in a field of dots and are designed to reveal a specific deficiency. This page simulates what a color would look like, leaving the comparison to you, so it is a self check rather than a screening instrument.",
      },
      {
        q: "What does it mean if the normal and simulated swatches match for me?",
        a: "It means the color distinction that the simulation removes is one you were not depending on in that view. It is a useful cue about how much that hue was doing, but it is not a result about your vision and it should not be read as one.",
      },
      {
        q: "Can it tell me which deficiency I have?",
        a: "No. It shows four simulated versions of one color and you decide whether any of them look indistinguishable from the original. There is no scoring, no threshold and no output beyond the comparison on screen.",
      },
      {
        q: "Why does the page show all four deficiencies instead of one?",
        a: "Because a single color can behave very differently across them, and comparing four swatches at once removes the need to trust any one result. It also makes visible how much of a color's information is carried by the red and green channels, which the two commonest deficiencies affect.",
      },
      {
        q: "Does uploading an image send it anywhere?",
        a: "No. The processing happens in the browser on a canvas, so the picture never leaves the machine it was opened on, and nothing is uploaded or stored.",
      },
    ],
  },

  "nearest-named-color-finder": {
    keywords: [
      "nearest named color finder",
      "snap a color to a name",
      "css color names",
      "quantise a color",
    ],
    intro:
      "The nearest named color finder snaps any colour to the closest CSS name and reports the distance it had to travel, which is the honest way to see what a name costs you in precision.",
    content:
      "Snapping is a lossy step, and the nearest named color finder makes the loss visible. Point it at a colour and it returns the closest entry in the CSS name table together with the RGB distance between the two, so the answer arrives with its own error bar. That is the difference between this page and a plain lookup: the question is not only which name applies, but how much of the original value disappears when the name is used instead. Snap a color to a name in one step, and read what the step cost in the figure underneath.\n\nThe snap is exhaustive and deterministic. Every one of the 141 css color names is compared in RGB, the squared channel differences are summed, and the smallest total wins; ties resolve toward the earlier entry in the table, so the same colour always snaps the same way. Because the table is small, there is no shortcut worth taking and no chance of a missed neighbour — the result is the true nearest entry, not an approximation of one.\n\n- More precision than the table can hold is discarded, which is the point of naming at all.\n- The distance readout is the residue: 0 means the colour is exactly a named value, and larger numbers mean the name is a summary rather than a restatement.\n- The snapped value always exists in CSS, so it can be pasted into a stylesheet as a keyword without a conversion step.\n\nMeasurements are where the metric shows its limits. Euclidean RGB distance is blind to perception, and the failures are not subtle: a muted olive such as #7A7A52 snaps to dimgray #696969 at a distance of 33, and the near-black slate #0F172A snaps to black at 50 rather than to any slate-coloured name, because no dark slate-grey entry sits closer in raw channel space. Those are correct answers to the question as asked and poor answers to the question most people mean. In other words, the metric will quantise a color perfectly well and understand nothing about it.\n\n- The table is coarse: 141 values have to cover the whole gamut, so average gaps are large and a snap can shrug off a visibly different colour.\n- Only one candidate comes back. There is no second-best list, so a bad snap cannot be compared against an alternative from this page.\n- British spellings are missing from the table, so grey values land on gray-spelled or unrelated entries.\n- Snapping changes the value, and a changed value changes contrast: a pair that passed before the snap may not pass after it.\n\nUse it for design operations rather than for design decisions: naming a swatch so a ticket reads cleanly, describing an asset so a search finds it, sanity-checking that a colour a colleague mentioned is roughly the one in the file. Where the exact value matters, keep the hex; where the name has to be authoritative, read the table; and where two candidates both look plausible, measure the pair rather than the snap. Snapping is a description, and descriptions do not have to be exact — they have to be checkable, which is what the distance figure makes them.",
    howTo: [
      { step: "Set the colour you want to describe with the picker field." },
      { step: "Read the snapped swatch and its name — that is the value CSS would accept as a keyword." },
      { step: "Check the distance: near zero means the name is faithful, a large number means it is a summary." },
      { step: "Keep the original hex for anything precision-sensitive, and use the name only where a human is the audience." },
    ],
    whenToUse:
      "Use this when a colour has to be described in words and precision is negotiable. The {{color-name-lookup|colour name lookup}} answers the same question with less emphasis on the distance, the {{css-named-colors-reference|CSS named colours reference}} is the source list when the name itself has to be exact, and the {{color-distance-calculator|colour distance calculator}} compares two chosen colours when the snap is not the comparison you actually wanted.",
    faqs: [
      {
        q: "What does a distance of zero mean?",
        a: "That your colour is exactly one of the named values in the table, so the name restates it rather than approximating it. Larger numbers mean information was discarded.",
      },
      {
        q: "Why did a muted olive snap to a grey name?",
        a: "Because raw RGB distance does not model perception: #7A7A52 lands 33 units from dimgray and from nothing closer. The algorithm is right; the metric is simply not perceptual.",
      },
      {
        q: "Can I see the second-closest name for comparison?",
        a: "No — the page returns one candidate. If two names both look plausible, compare them by measuring the colours themselves instead of re-running the snap.",
      },
      {
        q: "Does the snapped name keep my colour's exact value?",
        a: "No, snapping replaces the value with the named one. Keep the hex alongside the name whenever the value is used downstream, because the substitute is a different colour.",
      },
      {
        q: "Is the result the same every time for the same input?",
        a: "Yes. The search is exhaustive over a fixed table and ties resolve toward the earlier entry, so a given colour always snaps to the same name.",
      },
    ],
  },

  "color-mood-analyzer": {
    keywords: [
      "color mood analyzer",
      "what does my color mean",
      "color psychology meaning tool",
      "analyze color mood",
    ],
    intro:
      "The color mood analyzer reads any color's hue and returns the psychological register it sits in — what the color conventionally communicates and the moods it carries.",
    content:
      "Every hue arrives with baggage. Red arrives with urgency, blue with calm, green with growth — associations absorbed from biology, culture and a century of branding, and deployed deliberately every time a designer picks a palette. The color mood analyzer makes that layer explicit: set any color, and the tool reads its hue and returns the psychological register it falls in, with the conventional meaning spelled out in plain language.\n\n- The mechanism is honest about being a mapping, not a mind-reader.\n- Hue is bucketed into the standard psychological bands — the warm actives, the cool steadies, the natural middle, the violet specials — and each band carries its summary of what the color conventionally communicates.\n- Lightness and chroma modulate the reading in practice — a pale blue and a navy do not say the same thing — but hue is the load-bearing axis of color association, and that is the axis this tool reads.\n- As a color psychology meaning tool it gives you the conventional register; the cultural overlays and the exceptions are yours to apply.\n\nWhere an analyze color mood pass earns its keep: brand and campaign reviews, where the question is whether the palette says what the brief claims; landing page audits, where the accent color's emotional register should match the call to action; and palette diplomacy, where a stakeholder asks what this teal means and deserves a grounded answer rather than a shrug. The mood color generator works the opposite direction — from mood word to palette — and the symbolism reference widens the lens to cultural and regional variation for work crossing borders.\n\nColour psychology is a soft science with a hard commercial edge, and the analysis is most useful when it is read as vocabulary rather than verdict. The associations reported — blues as calm and trustworthy, oranges as energetic, deep greens as grounded — are conventions built out of decades of advertising, packaging and interface design rather than laws of perception. That does not make them weak. A convention the audience already holds is exactly what a brand can lean on, and a colour that contradicts the register needs a reason. Where the analysis pays off is in mixture: the same blue reads institutional on a bank site and clinical on a wellness product, because meaning is set by everything around the swatch. Read the reported mood as what an average viewer brings to the colour before seeing any context, then judge how much of that the surrounding design actually supports.\n\nWhere the intended mood and the reported one disagree, that gap is worth closing deliberately rather than hoping the audience reads past it — and the fix is usually type, copy or imagery rather than a different hue.\n\n- What the tool will not do is settle arguments by itself: color association is a convention with real spread across cultures and contexts.\n- But for the everyday question of what does my color mean in the register designers actually operate in, it gives the conventional answer quickly — the shared starting point that the debate can proceed from.",
    howTo: [
      { step: "Set the color whose mood you want read." },
      { step: "Read the register name and its conventional meaning." },
      { step: "Apply context — audience, culture, lightness and chroma — before treating the reading as final." },
    ],
    whenToUse:
      "Use this when a single color's conventional register is the question. Use the mood generator to travel the opposite direction, the symbolism reference for cultural depth, and the seasonal or warm-cool analyzers when the question is temperature rather than psychology. To travel the opposite direction, the {{color-from-text-mood-tool|mood color generator}} turns words into a palette, the {{color-symbolism-reference|symbolism reference}} widens the lens to cultural and regional variation, and the {{warm-cool-analyzer|warm-cool analyzer}} answers the temperature question rather than the psychological one.",
    faqs: [
      {
        q: "Is color psychology scientific?",
        a: "Hue associations are well-documented conventions with biological and cultural roots, but they are tendencies, not laws. The tool reports the conventional register; real audiences vary.",
      },
      {
        q: "Why does lightness not change the reading?",
        a: "Hue carries the primary association, so the tool buckets by hue. In practice a pale blue and a navy differ in tone — treat the reading as the base register and modulate by hand.",
      },
      {
        q: "Does the meaning change across cultures?",
        a: "Considerably in places — white signals mourning in some traditions, red carries luck in others. The symbolism reference covers that layer; this tool gives the broadly Western default.",
      },
      {
        q: "Can it analyze a whole palette?",
        a: "It reads one color at a time; run each palette member through, or use the warm-cool analyzer for the set's overall temperature in one view.",
      },
      {
        q: "Can the reported mood settle a design debate on its own?",
        a: "No. Colour association is a convention with real spread across cultures and contexts, so the reading is a shared starting point rather than a verdict. Where the intended mood and the reported one disagree, the gap is usually closed with type, copy or imagery rather than a different hue.",
      },
    ],
  },

  "seasonal-color-finder": {
    keywords: [
      "seasonal color finder",
      "spring summer autumn winter colors",
      "seasonal color analysis tool",
      "which season is my color",
    ],
    intro:
      "The seasonal color finder reads a color's temperature and depth and places it in its season — spring, summer, autumn or winter — the four registers of seasonal color analysis.",
    content:
      "Seasonal color analysis sorts the world of color into four registers named for the seasons: spring's clear warmth, summer's cool softness, autumn's deep earthiness, winter's crisp high contrast. The seasonal color finder places any color in that taxonomy — set a value, and the tool returns its season, derived from the axes that actually separate the four: warm versus cool hue, and clear-versus-soft depth.\n\n- The four-way split has enough structure to be worth knowing precisely.\n- Spring colors are warm and bright — coral, fresh green, golden yellow; summer colors are cool and muted — powder blue, lavender, rose; autumn colors are warm and deep — rust, olive, mustard; winter colors are cool and strong — true red, royal blue, black and white.\n- Knowing which season is my color therefore means knowing two things about it: which side of the warm-cool line the hue sits on, and how much chroma and depth it carries.\n- A seasonal color analysis tool that reads both axes can place a color confidently; one that reads only temperature cannot tell spring from autumn or summer from winter.\n\nThe framework earns its keep in two domains. Personal color consulting uses it to match palettes to complexions — the seasonal registers were built for draping tests and wardrobe planning, and remain the shared language of that industry. Design work borrows the registers as palettes with coherent personalities: a spring-branded product page, an autumn-toned restaurant identity. The themed seasonal palette generators produce full sets per season; this tool answers the placement question for a single color you already have — a brand fill that must sit inside an autumn system, a swatch being checked against a summer wardrobe.\n\nSeasonal analysis is a framework for the way palettes flatter or fight each other, and the four seasons are its shorthand: spring for warm and clear, summer for cool and muted, autumn for warm and muted, winter for cool and clear. The axes underneath are the useful part — warmth and clarity, meaning hue direction and chroma — and they determine whether colour A sits comfortably beside colour B or makes it look dirty. Applied to design, the framework answers a question that comes up constantly once a brand colour has to be extended: which supporting hues will make the anchor look brighter, and which will make it look grubby. Reading a colour's season is the first half of that answer; keeping the supporting set inside the same quadrant is the second.\n\n- Placement also explains why combinations that look right in isolation fail in situ: a spring colour beside an autumn surface reads as a mismatch even when both are attractive on their own.\n- Building a set inside one season and borrowing a single accent from a neighbouring one is a reliable recipe for a palette that looks intentional.\n\nAs a spring summer autumn winter colors reference in tool form, it is deliberately simple: one color in, one season out. For the full seasonal sets, the generators are one click away; for single-color placement — which season a color belongs to — this is the direct answer.",
    howTo: [
      { step: "Set the color you want to place." },
      { step: "Read the season — derived from the hue's temperature and the color's depth." },
      { step: "Use the placement: wardrobe matching, brand-system alignment, or palette selection." },
    ],
    whenToUse:
      "Use this to place a single color in the seasonal taxonomy. Use the seasonal palette generators to produce full sets per season, the warm-cool analyzer for temperature alone, and the skin-tone finder when the matching target is a complexion rather than a system. For complete sets in one register the {{seasonal-palette-generator|seasonal palette generators}} produce five-colour schemes, the {{warm-cool-analyzer|warm-cool analyzer}} reads temperature alone, and the {{skin-tone-color-finder|skin-tone finder}} handles the complexion case.",
    faqs: [
      {
        q: "What determines a color's season?",
        a: "Two axes: hue temperature (warm toward spring and autumn, cool toward summer and winter) and depth (clear and bright versus deep and muted). Together they separate the four registers.",
      },
      {
        q: "Can a color belong to two seasons?",
        a: "Borderline colors exist — a soft warm green leans spring but can pass in autumn systems. The tool returns the closest placement; judgment handles the borders.",
      },
      {
        q: "Is this the same system personal stylists use?",
        a: "It is the same four-season framework — spring, summer, autumn, winter — applied to a single color rather than a whole complexion assessment.",
      },
      {
        q: "How do I get the full palette for a season?",
        a: "The seasonal palette generators produce complete five-color sets for each season, derived in a register consistent with the framework.",
      },
      {
        q: "Can I mix two seasons in one palette?",
        a: "A set is safest inside one season, because a spring colour beside an autumn surface reads as a mismatch even when both are attractive on their own. Borrowing a single accent from a neighbouring season is the reliable way to introduce variety without breaking the register.",
      },
    ],
  },

  "skin-tone-color-finder": {
    keywords: [
      "skin tone color finder",
      "match colors to skin tone",
      "skin tone swatch scale",
      "complexion matching colors",
    ],
    intro:
      "The skin tone color finder presents a curated scale of skin-tone swatches — from deep umber to pale porcelain — so you can match a complexion or pick harmonious colors against one.",
    content:
      "Skin tones occupy a specific and surprisingly narrow band of color space: warm hues, moderate chroma, lightness spanning the full human range. The skin tone color finder renders that band as a curated strip of swatches — a progression from deep umber through bronze, tan and beige to pale porcelain — each labeled with its hex, each a fair representative of the complexions it stands for.\n\nThe tool serves two related jobs. The first is matching: when a design must include a faithful skin reference — an avatar system, an illustration palette, a foundation shade chart — the scale provides honest starting values rather than the single flat peach that passes for skin in lazy palettes. Real complexions vary across the strip, and a palette that acknowledges that range reads as more human than one that does not. The second job is harmony: picking colors that sit well beside a complexion — clothing swatches against a portrait, background colors behind a face, makeup-adjacent branding — where the question is what flatters this tone, and having the tones themselves on screen makes the judgment visual rather than hypothetical.\n\n- The strip's construction reflects what skin actually is: hues locked to the warm band, chroma capped where pigment sits, lightness doing the work of range.\n- That is why the swatches read as a family despite spanning the full depth of the scale — and why colors derived from any of them, via the tints and shades tools, inherit the same believability.\n- For broader complexion-adjacent references, the hair-tone and eye-tone tools extend the human-palette set; the seasonal finder overlaps where warm skin meets autumn or spring registers.\n\n- Skin tones are the most demanding colour problem in illustration and product design, for a reason with a clear technical description: the range is narrow in hue, wide in lightness, and very vulnerable to whatever surface it sits on.\n- A complexion colour that looks correct on white turns orange against a warm beige card and grey against a cool one, because the eye judges it relative to its neighbours rather than in isolation.\n- Working from a labelled scale solves the largest part of the problem, replacing a value invented from memory with one that has been checked.\n- What remains is contextual: how much of the surrounding palette to keep neutral so the subject is not tinted by it, how bright a background can be before the lighter end of the scale loses its edge, and where a supporting colour is needed to keep the artwork from flattening.\n\nKeeping one scale across a set of illustrations matters as much as choosing a good one, because consistency between images is what makes a range of tones read as a single visual language rather than a series of guesses.\n\nAs a match colors to skin tone instrument, it is deliberately a reference rather than a calculator — a skin tone swatch scale to look at, compare against and copy from. Complexion matching colors chosen beside an honest scale beat values invented from memory every time.",
    howTo: [
      { step: "Browse the scale from deep to pale and find the swatch that matches your target complexion." },
      { step: "Copy its hex as the skin reference for your palette or illustration." },
      { step: "Judge companion colors visually against the swatch, or derive ramps from it with the tints and shades tools." },
    ],
    whenToUse:
      "Use this for avatar systems, illustration palettes, shade charts and any work that must represent or flatter skin. Use the hair-tone and eye-tone tools for the rest of the human palette, and the seasonal finder when matching skin to the seasonal framework. The {{hair-color-reference|hair-tone reference}} and the {{eye-color-reference|eye-tone reference}} extend the human-palette set, and the {{seasonal-color-finder|seasonal finder}} overlaps wherever warm skin meets the autumn or spring registers.",
    faqs: [
      {
        q: "How many tones does the scale cover?",
        a: "A curated set spanning the full human range from deep umber to pale porcelain, chosen as fair representatives rather than an exhaustive chart.",
      },
      {
        q: "Are these hex values exact matches for real skin?",
        a: "They are representative values for the bands they cover — real complexions vary with lighting and individual pigment. Treat them as honest starting points, not clinical matches.",
      },
      {
        q: "Can I derive variations from a tone?",
        a: "Yes — the tints and shades tools extend any swatch into ramps while keeping the warm hue family, which is how believable skin shading is built.",
      },
      {
        q: "Why do all the swatches look related?",
        a: "They share the warm hue band and capped chroma that real skin occupies; only lightness varies across the scale. That shared register is what makes the strip read as one family.",
      },
      {
        q: "Why does a skin tone change appearance on different backgrounds?",
        a: "A complexion colour is judged relative to its neighbours, so the same tone turns orange against a warm beige card and grey against a cool one. How neutral the surrounding palette stays, and how bright a background can be before the lighter end of the scale loses its edge, are the contextual decisions that remain.",
      },
    ],
  },

  "relative-luminance-calculator": {
    keywords: [
      "relative luminance calculator",
      "wcag luminance of a color",
      "compute color luminance",
      "linear rgb luminance value",
    ],
    intro:
      "The relative luminance calculator computes the WCAG relative luminance of any color — the linearised brightness figure every contrast ratio is built from.",
    content:
      "Relative luminance is the number underneath every accessibility verdict: the WCAG-defined brightness of a color after its sRGB channels are linearised and combined with vision's weighting — the green channel counting most, blue least. The relative luminance calculator computes that figure for any color you set, reporting the 0-to-1 value that contrast ratios are made from.\n\nThe definition deserves one paragraph of honesty, because the tool's whole value is computing it correctly.\n\n- Luminance is not perceived lightness: it is a physically-rooted measure in which the channels are first linearised — undoing the gamma curve that display encodes apply — then combined with fixed coefficients approximating the eye's sensitivity.\n- Skipping the linearisation is the classic error, and it silently corrupts every downstream ratio; the value here is the defined one, computed exactly as the WCAG formula prescribes, which is why the contrast tools that share this library agree with it to the digit.\n\nWhat the raw number offers that ratios do not is the single-color view. Contrast is a relationship between two colors; luminance is a property of one — which makes it the right quantity for reasoning about a color in isolation: how much brightness headroom a surface has, whether two accents differ enough in luminance to be distinguishable by achromatopsia simulation, how a color will behave in the ratio maths before pairing it. The full conversion panel beside it shows the same color in every standard format — hex, RGB, HSL, OKLCH, LAB — so the luminance figure lands in context rather than in isolation.\n\nLuminance is the number underneath every contrast claim, and reading it directly is sometimes the only honest way to answer a question. The definition is precise: linearise each channel from its gamma-encoded sRGB value, then weight the channels by their contribution to perceived brightness — roughly three tenths for red, six tenths for green and one tenth for blue. The weighting explains why parts of the guidance feel arbitrary until they are checked. Green carries so much brightness that a saturated green can be lighter than a mid grey, and blue so little that a deep blue sits close to black, and those are the surprises a ratio hides and a luminance value exposes. The practical uses are narrow but real: confirming that a hover state is genuinely darker than its resting state, ordering a ramp, or checking that a tinted surface is lighter than the one below it. Once the number is visible the palette's structure becomes obvious, because steps that are nearly the same show up as nearly the same value.\n\n- As a wcag luminance of a color instrument, the tool is deliberately narrow: one color in, the defined luminance out, computed the way the specification says.\n- For the two-color questions the number feeds, the contrast checkers and ratio calculator are one click away — but when the question is compute color luminance for a single value, this is the direct, linear rgb luminance value answer.\n- Quoting the value in a review settles disagreements quickly, because two people arguing about which swatch is darker are usually arguing about perception while one number settles the physics.",
    howTo: [
      { step: "Set the color whose luminance you need." },
      { step: "Read the relative luminance value in the 0-to-1 scale." },
      { step: "Feed it into contrast reasoning, or read the same color's other formats from the panel." },
    ],
    whenToUse:
      "Use this when a single color's WCAG luminance is the question — headroom checks, achromatopsia reasoning, formula verification. Use the contrast checkers for two-color verdicts, and the perceptual lightness calculator when the question is perceived lightness rather than the WCAG figure. For a two-colour verdict the {{contrast-ratio-calculator|contrast ratio calculator}} turns the figure into a ratio, and the {{perceptual-lightness-calculator|perceptual lightness calculator}} answers the appearance question that luminance alone does not.",
    faqs: [
      {
        q: "How is relative luminance different from lightness?",
        a: "Luminance linearises the channels and weights them by the eye's sensitivity — green-heavy — while perceptual lightness (as in OKLCH) models appearance. They agree on ordering only roughly; the WCAG ratios use luminance.",
      },
      {
        q: "What is the value range?",
        a: "Zero to one: black is 0, white is 1, and everything else falls between. The contrast ratio between two colors derives from dividing the larger luminance by the smaller after bias terms.",
      },
      {
        q: "Why do some tools report different luminance for the same color?",
        a: "Almost always a skipped or incorrect linearisation step. This tool follows the WCAG definition exactly, which is why its values agree with the contrast tools here.",
      },
      {
        q: "Can I use luminance alone to judge accessibility?",
        a: "Not directly — accessibility verdicts come from ratios between pairs. But luminance headroom is the right lens for reasoning about a single surface color.",
      },
      {
        q: "Why not work with the contrast ratio directly?",
        a: "Contrast is a relationship between two colours, while luminance is a property of one, which makes it the right lens for a surface considered alone — how much brightness headroom it has, whether two accents stay distinguishable in an achromatopsia simulation, or how the ratio maths will behave before a pairing is chosen.",
      },
    ],
  },

  "perceptual-lightness-calculator": {
    keywords: [
      "perceptual lightness calculator",
      "oklch lightness of a color",
      "perceived lightness tool",
      "how light does a color look",
    ],
    intro:
      "The perceptual lightness calculator reports how light a color actually looks — its OKLCH lightness — the appearance-based figure that WCAG luminance only approximates.",
    content:
      "Two colors with identical WCAG luminance can look unmistakably different in brightness — the legacy formula's known blind spot, because it weights channels for physical measurement rather than appearance. The perceptual lightness calculator answers the question the eye is actually asking: how light does this color look? Its answer is the OKLCH lightness component — set a color, read its perceived lightness on the 0-to-1 scale, calibrated so that equal steps look like equal steps.\n\n- The difference between the two lightness figures is not academic.\n- Yellow and blue at the same WCAG luminance do not look equally light — yellow looks far brighter — and the OKLCH figure reflects that while luminance does not.\n- That is why perceptual lightness is the right quantity for most design judgments: ordering a palette from light to dark, choosing which of two accents reads as the highlight, building monochromatic ramps where steps should look even, and judging whether text will feel bold or delicate on a surface.\n- The luminance calculator remains the correct tool for the legal contrast numbers; this tool is the correct one for the visual questions.\n\n- The full conversion panel situates the reading: the same color's hex, RGB, HSL and LAB values alongside, so the lightness figure can be compared against the color's other coordinates — and the monochromatic finder puts the axis to work, building ramps that step evenly in exactly this lightness.\n- The relativity caveat is worth keeping in mind: perceived lightness shifts with surrounding colors — a mid-grey looks darker on white than on black — so the figure is the color's own lightness, not its appearance in a specific layout.\n\nPerceived lightness is the most negotiable term in colour work, which is why a single number for it is such a relief. Two colours can share a luminance value and look entirely different in weight, because saturation, surrounding contrast and the adaptation state of the eye all pull on the impression. The OKLCH lightness coordinate is designed to track that impression rather than the physics, so a value of sixty reads as roughly the same lightness whatever the hue — which is precisely what most design decisions need. The uses are unglamorous and constant: building a ramp whose steps look evenly spaced, deciding whether two brand colours are truly a pair or one clearly dominant, and checking that a hover state is a visible step away from its resting state rather than a nudge. Reading it beside the luminance value is the quickest way to see where perception and physics part company, and that divergence is the whole reason the newer colour spaces exist.\n\nAs an oklch lightness of a color instrument, it is one field and one number — the perceived lightness tool answer to how light does a color look, in the space designed to make that question well-posed.\n\nQuoting it in a hand-off is often clearer than describing a swatch in words, because a single number says where a value sits on the ladder without anyone needing to see both swatches side by side. Where a design needs even steps, this is the coordinate to plan them in rather than the one the picker happens to show.",
    howTo: [
      { step: "Set the color whose perceived lightness you want." },
      { step: "Read the OKLCH lightness value on the 0-to-1 scale." },
      { step: "Use it for ordering, ramp-building and appearance judgments — and luminance for legal contrast." },
    ],
    whenToUse:
      "Use this for how light a color looks — palette ordering, ramps, highlight choices. Use the luminance calculator for WCAG figures, the contrast checkers for accessibility verdicts, and the monochromatic finder to build ramps in this same metric. The {{relative-luminance-calculator|luminance calculator}} supplies the WCAG figure for accessibility work, the {{contrast-checker|contrast checker}} applies the thresholds, and the {{color-monochromatic-finder|monochromatic finder}} builds ramps that step evenly in this same lightness axis.",
    faqs: [
      {
        q: "Why does OKLCH lightness differ from WCAG luminance?",
        a: "Luminance weights channels for physical measurement; OKLCH lightness models appearance. Yellow and blue with equal luminance have clearly different perceived lightness — OKLCH captures that, luminance does not.",
      },
      {
        q: "What scale is the lightness value on?",
        a: "Zero to one, where 0 is black, 1 is white, and equal differences are designed to look equal — the property that makes ramps and orderings trustworthy.",
      },
      {
        q: "Does the background change the number?",
        a: "No — the value is the color's own lightness. Simultaneous contrast changes how light it looks in context, which is the simultaneous contrast visualizer's subject.",
      },
      {
        q: "Which should I use for accessibility work?",
        a: "Luminance, via the contrast tools — WCAG thresholds are defined on it. Perceptual lightness is for design judgment, not legal compliance.",
      },
      {
        q: "Does the figure account for the colors around the swatch?",
        a: "No. The reading is the colour's own lightness, and perceived lightness shifts with its surroundings — a mid grey looks darker on white than on black — so the figure is the value to plan with rather than a prediction of appearance in a specific layout.",
      },
    ],
  },

  "color-temperature-analyzer": {
    keywords: [
      "color temperature analyzer",
      "kelvin value of a color",
      "warm or cool color checker",
      "estimate color temperature",
    ],
    intro:
      "The color temperature analyzer estimates a Kelvin value for any color from its hue — a warm or cool color checker that puts a number on how warm a color reads.",
    content:
      "Color temperature began in physics: the Kelvin value of a glowing blackbody, from candle-flame ambers near 2000K to north-sky blues approaching 10000K. Design borrowed the scale as a feeling — warm colors, cool colors — and the color temperature analyzer bridges the two, estimating a Kelvin reading for any color from where its hue sits on the wheel. Set a value, read a temperature, and the vague question of how warm is this color acquires a number.\n\n- The honest mechanism: the estimate is a hue-based heuristic, not a spectral measurement.\n- Hue swings around the wheel map onto the Kelvin band, with the warm oranges and ambers landing at the low end and the blues at the high end; greens and violets — hues with no true blackbody equivalent — land at interpolated midpoints.\n- That makes the reading a faithful ranking within warm or within cool, and a serviceable cross-group comparison, while real spectral color temperature — the domain of photographic white balance and lighting engineering — needs actual spectral data this single hex cannot provide.\n\nFor a warm or cool color checker, the estimate does the everyday work: ranking a palette's members by warmth, checking whether an accent's temperature suits a brand's register, choosing which of two neutrals reads cooler against a background, and assigning background temperatures behind a subject. The temperature adjuster acts on the reading — shifting a color warmer or cooler by degrees — and the warm-cool analyzer frames the whole palette's balance rather than one member's number.\n\nTemperature is a useful axis because it explains an interaction that saturation and hue do not: why a warm and a cool colour placed together make each other look more vivid, and why two colours at the same warm end look inert beside each other. The scale runs from candlelight through daylight to overcast sky, and a colour's position on it is a statement about the light it implies rather than about the pigment. That framing is what makes it practical in interfaces, where a warm surface reads as interior and human and a cool one as clinical and technical, and where the two can be mixed deliberately to separate functional zones. The analyser gives an estimate color temperature reading for any value, which is enough to sort a palette into warm and cool camps and to spot the swatch that is fighting its neighbours. Treat the Kelvin output as a rank rather than a measurement and it stays useful.\n\nWhere a palette needs to feel coherent, keeping every hue on the same side of the scale does more work than any amount of brightness tuning, and where a single warm accent has to stand out from a cool set the reading says how far apart the two actually are.\n\n- What the tool refuses is false precision: an estimate to the nearest Kelvin from a single hex would be theatre.\n- The color temperature analyzer instead gives the Kelvin value of a color as a well-defined heuristic — one that ranks reliably, explains itself, and hands the subtle truth about greens and violets along with the number.",
    howTo: [
      { step: "Set the color whose temperature you want estimated." },
      { step: "Read the Kelvin figure and where it sits in the warm-to-cool band." },
      { step: "Compare across palette members, or hand the color to the temperature adjuster to move it." },
    ],
    whenToUse:
      "Use this to put a comparative number on warmth for a single color. Use the temperature adjuster to act on the reading, the warm-cool analyzer for whole-palette balance, and the gamut checker when the question is physical reproducibility rather than perceived warmth. The {{color-temperature-adjuster|temperature adjuster}} acts on the reading, the {{warm-cool-analyzer|warm-cool analyzer}} reads a whole palette's balance, and the {{color-gamut-checker|gamut checker}} covers the print-side question.",
    faqs: [
      {
        q: "How accurate is the Kelvin estimate?",
        a: "It is a hue-based heuristic: reliable for ranking colors within the warm or cool ranges, approximate across them. True spectral color temperature requires spectral data, not a single hex.",
      },
      {
        q: "Why do greens and violets give odd temperatures?",
        a: "No blackbody glows green or violet, so those hues have no physical Kelvin anchor — the estimate interpolates them onto the scale, and they should be read as midpoint values.",
      },
      {
        q: "Can it replace my camera's white balance meter?",
        a: "No — photographic white balance needs the scene's spectral content. This tool reads one color's hue and is meant for design comparisons.",
      },
      {
        q: "Does lightness affect the reading?",
        a: "The estimate keys on hue, so a pale amber and a deep amber report similarly. Perceived warmth is mostly hue; tone modulates it — the warm-cool analyzer shows that context.",
      },
      {
        q: "How accurate is the Kelvin figure for greens and violets?",
        a: "Those hues have no true blackbody equivalent, so they land at interpolated midpoints rather than on a measured curve. The estimate is a faithful ranking within warm or within cool, and a serviceable cross-group comparison, while real spectral temperature needs actual spectral data a single hex cannot provide.",
      },
    ],
  },

  "color-theory-reference-tool": {
    keywords: [
      "color theory reference tool",
      "color wheel quick reference",
      "harmony cheat sheet",
      "color relationships guide",
    ],
    intro:
      "The color theory reference tool puts the wheel on screen — twelve hues, pickable, with the classic relationships one glance away when you need a color wheel quick reference mid-project.",
    content:
      "Every color theory conversation eventually needs the wheel: which hues neighbour which, what sits opposite what, where the triad lands. The color theory reference tool is that wheel, interactive — twelve hues arranged in their canonical order, any one pickable as the anchor, with the classic relationships readable directly from the arrangement rather than reconstructed from memory.\n\n- What makes it a reference rather than a lesson is the directness.\n- The wheel is the theory's entire geometry in one image: analogous pairs are neighbours because that is what adjacency means; complements are opposites because that is what 180 degrees means; a triad is the triangle you can trace with your eyes.\n- Choosing an anchor hue and scanning its relationships answers the mid-project questions — what opposes this brand blue, what flatters this orange — faster than any prose, and with less risk of a misremembered rule.\n- The harmony generators then execute whichever relationship you identify: the wheel points, they compute.\n\nThe twelve-hue arrangement itself encodes the primaries, secondaries and tertiaries of the traditional wheel — the RYB artist's model rather than the RGB of screens, which is why red sits opposite green and blue opposite orange, the relationships illustrators and interior designers still work in. That conventionality is deliberate: a color relationships guide is only useful if it speaks the shared language, and the traditional wheel is the shared language.\n\nA color wheel quick reference earns its keep precisely because the rules it summarises are easy to half-remember. Complementary, analogous, triadic, split complementary, tetradic: each is a fixed geometric relationship, and each answers a different question about how much contrast a design needs. Keeping the geometry on one page means a relationship can be checked in seconds rather than reconstructed from a wheel and a spreadsheet, and the check is what keeps a palette out of near-miss territory — two hues that are almost analogous, or a triangle that is slightly off, both read as mistakes rather than as choices. The reference is also the fastest way to explain a decision to somebody else. When a stakeholder asks why those three colours, showing the triangle is more persuasive than describing it, and the same diagram makes the consequence of a change visible before the change is made.\n\n- Where the tool fits in daily work is exactly where its name puts it — the quick consultation.\n- Not the place to learn color theory; the place to check a relationship before committing it.\n- The interactive wheel offers a deeper dive with lightness control and selection mechanics; the learning playground wraps the theory in guided exploration; and this reference stays what it should be — a harmony cheat sheet that keeps the geometry honest when memory wavers.\n\nThe habit that makes it stick is to check the relationship at the moment the palette is chosen rather than at review, when changing a hue costs a rebuild instead of a field. Keep the reference and the harmony generators side by side: one tells you what the relationship is, the other hands you the values that satisfy it. And when a stakeholder asks why the palette looks the way it does, the diagram is the explanation.",
    howTo: [
      { step: "Pick the anchor hue on the twelve-part wheel." },
      { step: "Read its relationships from the geometry — neighbours, opposite, triangles." },
      { step: "Hand the chosen relationship to the matching harmony generator to compute values." },
    ],
    whenToUse:
      "Use this as the mid-project wheel check — what opposes, what neighbours, what triangles. Use the interactive wheel for deeper exploration with lightness control, the harmony generators to execute a chosen relationship, and the theory guide for the full lesson. The {{color-wheel-interactive|interactive wheel}} offers a deeper dive with lightness control, the {{oklch-color-playground|OKLCH playground}} wraps the theory in guided exploration, and the {{color-harmony-generator|harmony generator}} applies the relationships to a palette.",
    faqs: [
      {
        q: "Which color model is the wheel based on?",
        a: "The traditional twelve-hue RYB artist's wheel — primaries red, yellow, blue — which is the convention most color theory teaching and the shared vocabulary use.",
      },
      {
        q: "Why do the relationships differ from my screen's RGB logic?",
        a: "The artist's wheel encodes pigment-mixing relationships and their cultural convention; RGB is an additive display model. Design references overwhelmingly use the traditional wheel.",
      },
      {
        q: "Can it compute the actual hex values for a harmony?",
        a: "That is the harmony generators' job — identify the relationship here, then set your base in the complementary, triadic or analogous tool to get values.",
      },
      {
        q: "Does it cover split-complementary and tetradic relationships?",
        a: "The geometry is all on the wheel — split pairs sit either side of the opposite, tetrads form rectangles — and the dedicated generators compute each scheme's exact values.",
      },
      {
        q: "Is it meant for learning color theory?",
        a: "No — it is the quick consultation rather than a course: it checks a relationship before a palette is committed, where the interactive wheel offers a deeper dive with lightness control and the playground wraps the theory in guided exploration.",
      },
    ],
  },

  "pantone-approximation-tool": {
    keywords: [
      "pantone approximation tool",
      "pantone match",
      "nearest css name",
      "print color reference",
    ],
    intro:
      "The Pantone approximation tool takes a picked colour and returns the nearest entry in the CSS name table — an approximation for discussion, because this tool ships no licensed Pantone library.",
    content:
      "The honest description of this page is shorter than its name suggests. Pantone is a proprietary colour system: a Pantone reference identifies an ink or a pigmented surface, published in families such as Coated, Uncoated and the paper-oriented Textile codes, and the matching data is licensed. This tool does not carry that data. What it does instead is run the nearest css name lookup: your colour is compared against the 141 named CSS values, the closest one is returned as a labelled swatch, and the RGB distance between the two is printed beside it.\n\nThat makes the pantone match a conversation starter rather than a specification. The output has no Pantone code in it at all, so nothing here can be pasted into a print order. Used knowingly, the result is still useful: a named CSS colour is far easier to describe to a colleague than a hex string, and the distance figure tells you how loose the comparison is before anyone builds on it.\n\n- The comparison metric is Euclidean distance in RGB, computed over the named CSS table.\n- The answer includes the name, its hex value and the rounded channel distance.\n- The search is exhaustive across those 141 entries, so the nearest one is genuinely the nearest in that table.\n- No Pantone code, no Pantone library and no ink reference is produced anywhere in the output.\n\nWhy the conversion is hard in the first place is worth knowing, because it explains why no tool of this size can do it properly. A Pantone code describes a pigment applied to a substrate; a hex value describes emitted light in sRGB. Turning one into the other requires measured spectral data for a particular ink on a particular stock, and the answer changes when the material changes. A licensed library or a physical swatch book exists because the conversion is a measurement, not a formula. Approximation pages like this one can help you choose a direction; they cannot certify a colour.\n\nWhat a print color reference is for, then, is agreement. Everyone in the chain — designer, client, printer, supplier — needs the same words to mean the same thing, and a shared vocabulary is how that happens. That is the real use of the pantone approximation tool: it produces a description everyone can look at together, and the distance figure keeps that description honest about how loose it is. None of this requires the words to be official, only that the people reading them understand them the same way.\n\nUse it as a first pass. Pick the colour you had in mind, note the returned name and distance, and treat both as descriptive rather than authoritative. Where a print decision is real, confirm against a licensed reference or a physical swatch under the light the job will be judged in. For the sharper version of the same question, the colour distance calculator compares two specific colours numerically, and the palette importer is the place to keep your own house table of measured values once you have them.",
    howTo: [
      { step: "Set the colour with the picker field." },
      { step: "Read the returned CSS name, its hex value and the RGB distance." },
      { step: "Judge the distance before using the name: a large number means the approximation is loose." },
      { step: "Take the result to a licensed reference or a physical swatch before any print decision is made." },
    ],
    whenToUse:
      "Use this when you need a rough vocabulary for a colour in a conversation about print. The {{pantone-to-hex-reference|Pantone to HEX reference}} frames the same limitation as a reference question, the {{ral-to-hex-reference|RAL to HEX reference}} does the same for the European paint standard, and the {{palette-importer|palette importer}} is where a measured house table of real values belongs.",
    faqs: [
      {
        q: "Does this tool return a Pantone code?",
        a: "No. The output is a CSS name, its hex value and an RGB distance. No Pantone code can be produced because no licensed Pantone data is part of this build.",
      },
      {
        q: "Why can a Pantone reference not be converted to hex exactly?",
        a: "Because the two describe different things: an ink on a surface against light emitted by a screen. Exact conversion needs measured data for that ink and stock, which is what the licensed libraries provide.",
      },
      {
        q: "What is the distance figure actually telling me?",
        a: "How far, in raw RGB channel terms, the named colour sits from the one you picked. It ranks candidates; it does not describe how similar they look.",
      },
      {
        q: "Is a Pantone match from here safe to send to a printer?",
        a: "No. A printer needs the licensed reference or a supplier's colour data. Treat anything from this page as a description for discussion, not as a specification.",
      },
      {
        q: "What should I use instead when accuracy matters?",
        a: "A licensed Pantone reference, a physical swatch book or a measured colour chip. Once you have measured values, keep them in an imported palette so the numbers live in one place.",
      },
    ],
  },
};
