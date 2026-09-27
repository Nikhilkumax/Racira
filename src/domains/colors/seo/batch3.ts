import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 3 (verified tools only).
 *
 * Note: color-analogous-finder and color-blending-art-tool share their rendered
 * component with analogous-palette-generator and color-blend-tool respectively.
 * Their copy is written to describe the same mechanics from a different, honest
 * angle and is deliberately non-overlapping (build-gated by the similarity check).
 */
export const SEO_BATCH_3: Record<string, ToolSeo> = {
  "color-analogous-finder": {
    keywords: [
      "color analogous finder",
      "find analogous colors for a color",
      "adjacent hue colors",
      "neighbouring colors on the color wheel",
    ],
    intro:
      "The color analogous finder takes one color and returns the two hues immediately beside it, giving you the exact adjacent hue colors to harmonise a layout around.",
    content:
      "The color analogous finder returns the two hues that sit immediately beside a color you supply. Give it a base hex and it reports three values: the original, the neighbour thirty degrees lower in hue, and the neighbour thirty degrees higher. You get the exact hex for each, which is the difference between this finder and a palette generator that hands you a scheme to evaluate; here the question is narrower and the answer is precise, what are the adjacent hue colors to this specific value.\n\n- The two neighbours are computed in OKLCH with lightness and chroma pinned to the base, so only the hue moves.\n- That is what makes them usable as drop-in companions: a button, a badge and a link built from the three colours will have matching apparent brightness, and none of them will leap out simply because it happens to be lighter.\n- The thirty degree step is the conventional analogous spacing, small enough that the group reads as one family and large enough that the colours remain distinguishable when placed side by side.\n\nWhere this is genuinely handy is deciding which element gets which hue. A common pattern is to use the base for the primary surface, the lower neighbour for a pressed or active state and the upper neighbour for a hover or highlight, so an interaction changes hue slightly while keeping the same weight on the page. Because the finder gives you named values for each role, you can wire those into a component without inventing intermediate colours or drifting into a different saturation by accident.\n\nIt is also a quick way to extend a single brand colour you have already chosen. Rather than opening a wheel and eyeballing two nearby tones, you read the neighbours directly, and you know they were derived from your exact base rather than approximated. If you later need a longer scale, the neighbours can be fed into the shade and tint generators to add lightness steps without changing hue, which keeps the extension consistent with the original derivation.\n\n- Two cautions are worth carrying into practice.\n- First, adjacent hues are close by definition, so they will not provide the contrast needed to separate text from its background; rely on lightness for legibility and reserve the neighbours for decorative roles.\n- Second, do not confuse these with the complementary or triadic finders in this section, which deliberately place hues far apart to create tension.\n- If your layout needs energy, the neighbouring colors on the color wheel are the wrong tool, and reaching for a complementary pair will serve you better.\n- Used for calm, coherent groupings, however, the finder is quick and unambiguous.\n\nThe straightforward way to use it is to find analogous colors for a color you have already committed to: run the base through the finder, copy the two neighbours, and assign them to related roles such as hover, active and highlight. Because the values are exact rather than eyeballed, the three stay in a documented relationship that survives later edits and review.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the trio: the base plus the hues thirty degrees either side of it." },
      { step: "Assign the base to the primary element and the neighbours to supporting ones." },
      { step: "Reach for the complementary or triadic finders when the scheme needs more separation." },
    ],
    whenToUse:
      "Reach for this finder when you have a base colour and want the two exact neighbouring hues to assign to related UI roles. Use the complementary or triadic finders when you need high-contrast accents instead of a close family. The {{color-monochromatic-finder|monochromatic finder}} keeps one hue and moves lightness instead, and the {{color-triadic-finder|triadic finder}} spreads the same base across three evenly spaced hues.",
    faqs: [
      {
        q: "What exactly does it return?",
        a: "Three colours: your base, the hue thirty degrees below it and the hue thirty degrees above it, each given as a hex value with lightness and chroma unchanged.",
      },
      {
        q: "Why keep lightness and chroma fixed?",
        a: "So the three colours carry the same visual weight. Only the hue differs, which is what lets you swap them between roles without changing the layout's balance.",
      },
      {
        q: "Can these colours be used for text on each other?",
        a: "No. Neighbouring hues are too close to produce readable contrast. Use a lightness difference for text and keep the neighbours for decorative surfaces and states.",
      },
      {
        q: "How is this different from the analogous palette generator?",
        a: "Both derive the same neighbours. This finder reports them as individual values for specific roles, while the generator presents them as a scheme to evaluate as a set.",
      },
      {
        q: "How far apart are the neighbouring hues?",
        a: "Thirty degrees either side of the base, computed in OKLCH with lightness and chroma pinned to the base's own values. That is close enough that the three read as one family, and close enough that adjacent hues are easy to mistake for each other at small sizes.",
      },
    ],
  },

  "color-blend-tool": {
    keywords: [
      "color blend tool",
      "blend two colors",
      "mix two colors with a ratio",
      "color blending calculator",
    ],
    intro:
      "The color blend tool merges two colors at a ratio you control, previewing the blend at twenty-five, fifty and seventy-five percent so you can pick the exact midpoint you need.",
    content:
      "The color blend tool mixes two colors in a proportion you set with a single slider. Choose a color for each end, move the mix control to weight the blend toward either side, and the tool reports the resulting color and shows it as a large swatch. Beneath it, a strip previews the same pairing at twenty-five, fifty and seventy-five percent, so you can see how the transition behaves across the range rather than only at the point you happen to have selected.\n\n- The arithmetic is a straight per-channel interpolation.\n- Each of the red, green and blue channels is computed by taking the difference between the two source values, scaling it by the mix fraction and adding it to the first color.\n- At zero percent you get the first color exactly, at one hundred percent the second, and at fifty percent the value that sits precisely between them in RGB.\n- This is the same linear interpolation that underpins gradients and state transitions, which is why the result of a fifty percent blend often looks like the natural halfway point of a gradient between the two colours.\n\n- Blending in RGB is not the same as blending in paint, and that distinction catches people out.\n- Because RGB is a light model, a fifty-fifty blend of blue and yellow produces a desaturated grey rather than the green you would get from pigments.\n- If your question is about ink, pigment or paint, the subtractive mixer in this section is the right tool; this blend tool models what happens when two light values are combined proportionally, which is what a screen does.\n- Knowing which model you need is the single most important choice before you start.\n\nThe preview strip is the feature that makes the tool more than a calculator. State design and gradient work both rely on knowing how a colour behaves as it approaches another, and three evenly spaced samples reveal whether the transition is smooth or whether it passes through a muddy region in the middle. A blend between a saturated red and a saturated green, for example, dips through a dull brownish midpoint, and seeing that on the strip tells you to route the gradient through a third colour instead. That is a judgement you cannot make from the endpoints alone.\n\nUse the tool whenever you need a defensible intermediate colour rather than an eyeballed one. Whether you are deriving a disabled state from an active colour, finding the midpoint of a two-stop gradient, or building a hover transition, a ratio-controlled blend gives you a value that is provably between the two inputs, which is easier to document and to reproduce than a hand-picked hex. The result is copy-ready, and the neighbouring swatches give you the surrounding steps if you need a short scale.\n\nAt its simplest it is a color blending calculator for the everyday job of mixing a second colour into a first without opening a design application. Whether you need to blend two colors into a single state value or mix two colors with a ratio a design token can credit, the readout gives you the exact result and the surrounding steps.",
    howTo: [
      { step: "Set Color A and Color B." },
      { step: "Drag the Mix slider to the proportion you want, from zero to one hundred percent." },
      { step: "Read the result swatch and copy its hex." },
      { step: "Check the blend against the two parents when one of them must still be recognisable in the result." },
    ],
    whenToUse:
      "Use this tool when you need a precise intermediate colour between two known values. Use the subtractive mixer for pigment and ink blends, and the three-or-more-colour mixer when you want to combine a whole palette rather than a single pair. The {{color-mixer-2|color mixer}} shows the same blend at twenty-five, fifty and seventy-five percent in one view, and the {{color-mixer-3plus|palette mixer}} runs the operation across a whole list by adjacent pairs.",
    faqs: [
      {
        q: "How is the blended colour calculated?",
        a: "Each red, green and blue channel is linearly interpolated: the difference between the two values is scaled by the mix percentage and added to the first colour.",
      },
      {
        q: "Why does blue and yellow give grey instead of green?",
        a: "RGB is an additive light model, so opposite hues cancel toward grey. Pigments follow subtractive mixing and behave differently; use the subtractive mixer for that.",
      },
      {
        q: "What are the extra swatches for?",
        a: "They preview the pairing at twenty-five, fifty and seventy-five percent so you can see whether the transition passes through an undesirable colour before you choose a value.",
      },
      {
        q: "Can I blend more than two colours?",
        a: "Not in this tool. The three-or-more-colour mixer in this section combines a full palette, mixing each adjacent pair in turn.",
      },
      {
        q: "Is blending in RGB the same as mixing paint?",
        a: "No. Each of the red, green and blue channels is interpolated independently, which is what a screen does with two stacked colours, while pigments mix by subtracting wavelengths and routinely land somewhere else entirely — a blue and a yellow blend to a greyish mid-tone here and to green in paint.",
      },
    ],
  },

  "color-blending-art-tool": {
    keywords: [
      "color blending art tool",
      "blend colors for art",
      "artistic color mixing",
      "experiment with color blends",
    ],
    intro:
      "The color blending art tool is a playful workspace for exploring how two colors behave when combined, showing the full spread of intermediate tones as a strip you can read like a mini gradient.",
    content:
      "The color blending art tool is built for exploration rather than calculation. You drop two colors into it, sweep the mix control, and watch a strip of intermediate tones appear from one to the other. It is the same underlying blend as the precise design mixer in this section, but the emphasis here is on discovery: trying unlikely pairs, watching where a blend turns muddy, and finding the accidental in-between colours that make a piece feel considered rather than flat.\n\nOne of the most useful habits in colour work is studying what happens between two colours, not just at them. The artistic color mixing on show here is that study made interactive. Many of the named colours people find most appealing sit between two obvious ones, and sweeping the mix across a strip exposes those intermediates as discrete steps you can lift out and use directly. A muted dusty rose, for example, often appears somewhere in the middle of a blend between a red and a soft neutral, and it is far easier to find by sweeping than by guessing a hex.\n\nBecause the blend is a linear interpolation in red, green and blue, the path between two colours is predictable and free of surprises once you know the model. Complementary colours meet in the middle at a desaturated grey, which is either a problem to avoid or a pleasing neutral to exploit depending on what you are making. Analogous colours meet at a point that feels like a natural extension of both, which is why near-hue blends stay harmonious across the whole strip. Reading those two patterns is most of what makes exploratory blending useful.\n\nFor creative work the strip functions as a ready-made palette. Rather than committing to a single blended value, treat each intermediate as a candidate and pick two or three that work together, then use them as a small group in a composition. Because they all share a lineage, they tend to sit together without clashing, which is a quick route to a cohesive palette without opening a wheel or reasoning about harmony rules. Painters use exactly this approach physically, mixing a graded scale between two pigments and taking several stops from it.\n\n- Two honest notes keep the tool useful.\n- First, it models light rather than pigment, so if you are mentally mixing paint the results will disagree with what a physical palette does; reach for the subtractive mixer when pigment behaviour is the point.\n- Second, a blend is not a harmony: two randomly chosen colours will still produce an arbitrary midpoint, and a beautiful strip does not guarantee a beautiful composition.\n- Used as a fast way to generate and compare candidate in-betweens, it is a genuinely creative tool rather than just a converter.\n\nIts real use is to blend colors for art in an exploratory way: try an unlikely pair, sweep the range, and keep the accidental mid-tones. Using it purely to experiment with color blends costs nothing and often surfaces a palette you would never have specified deliberately, which is the point of a creative tool over a precise one.",
    howTo: [
      { step: "Set Color A and Color B." },
      { step: "Drag the Mix slider to the proportion you want." },
      { step: "Read the result swatch and copy its hex." },
    ],
    whenToUse:
      "Use this tool when you want to explore and harvest in-between colours for a creative project. Use the precise colour blend tool when you need one documented intermediate value, and the subtractive mixer when you are reasoning about pigment. For the neighbouring steps, see the {{color-blend-tool|color blend tool}} and the {{daily-color-generator|daily color generator}}.",
    faqs: [
      {
        q: "Is this different from the colour blend tool?",
        a: "The blend maths is the same. This version is presented for exploration, encouraging you to sweep the range and lift out several intermediate colours rather than fix on one value.",
      },
      {
        q: "Can I use the strip as a palette?",
        a: "Yes. Each intermediate is a candidate colour, and because they share the same blend they tend to sit together well. Pick two or three that work as a small group.",
      },
      {
        q: "Why do some blends go grey in the middle?",
        a: "Blending opposite hues in the additive RGB model cancels toward grey. It can be an unwanted dip or a useful neutral, depending on the effect you want.",
      },
      {
        q: "Does it match mixing paint?",
        a: "No. It models light. Physical pigments follow subtractive mixing and will produce noticeably different results, so use the subtractive mixer for paint questions.",
      },
      {
        q: "What does the color blending art tool not do?",
        a: "First, it models light rather than pigment, so if you are mentally mixing paint the results will disagree with what a physical palette does; reach for the subtractive mixer when pigment behaviour is the point. Second, a blend is not a harmony: two randomly chosen colours will still produce an arbitrary midpoint, and a ",
      },
    ],
  },

  "color-blindness-simulator": {
    keywords: [
      "color blindness simulator",
      "cvd simulation",
      "protanopia deuteranopia preview",
      "image color blindness preview",
    ],
    intro:
      "Color Blindness Simulator shows one color through four different color vision deficiencies at once, and can push the same simulation through an entire image.",
    content:
      "Color Blindness Simulator shows a single color as it would appear through four different color vision deficiencies, all at once, and can apply the same treatment to a whole image. Enter one color and the page renders a row of swatches, beginning with the untouched original so that every simulated swatch has a reference beside it.\n\nThe row covers the deficiencies the simulator models, in order:\n\n- Protanopia, the absence of the long-wavelength cone that carries red, which turns reds toward olive and darkens them noticeably.\n- Deuteranopia, the absence of the medium-wavelength cone, the commonest dichromacy and the one that collapses red and green into each other.\n- Tritanopia, the absence of the short-wavelength cone, which affects the blue and yellow axis and is far rarer than the other two.\n- Achromatopsia, the loss of color vision altogether, where the swatch is reduced to a single luminance value.\n- Plus the untouched original, sitting first in the row as the only swatch that is not a simulation.\n\nEach swatch comes from multiplying the red, green and blue channels by a fixed three-by-three matrix, following the Brettel and Machado approximations. Protanopia combines the channels with 0.567 and 0.433 on the first row, 0.558 and 0.442 on the second, and 0.242 and 0.758 on the third. Deuteranopia uses 0.625 and 0.375, then 0.7 and 0.3, then 0.3 and 0.7. Tritanopia uses 0.95 and 0.05, then 0.433 and 0.567, then 0.475 and 0.525. Achromatopsia applies the same luminance weights of 0.299 red, 0.587 green and 0.114 blue to all three output channels, which is why its swatch always lands on a grey. The matrices act on the 8-bit channel values directly and the results are clamped inside the 0 to 255 range, so this is an approximation of each deficiency rather than a colorimetrically exact transform.\n\nThe image half of the page works the same arithmetic over pixels. Drop an image in, choose one of the four deficiencies from the dropdown, and the canvas is redrawn through that matrix. The picture is scaled so its longest edge is at most 800 pixels before processing, which keeps the redraw quick but means the simulated canvas is a downsampled version of what you supplied. A button replaces the image whenever you want to try another.\n\nSome limits are worth holding in mind, because a simulation is easy to over-read.\n\n- Four deficiencies with no severity control. Every matrix is full strength, so the partial forms, which are much more common than the complete ones, are not represented.\n- Nothing is exported. The swatches and the canvas are for reading on screen, and no file is produced.\n- One image at a time, with no camera feed and no live capture.\n- The matrices approximate how these deficiencies are typically modelled. They are not a measurement of any individual's vision.\n- Legibility is not judged. The page shows what the colors become, not whether the result can still be used.\n\nUse the swatch row as a fast check on a single brand color, then run the simulation over a real screenshot of your interface, an image color blindness preview of the screens you actually ship. That is where the combinations you did not think about will surface. When two colors in a chart turn into the same swatch, the fix is almost always to separate them in lightness rather than in hue.\n\nIt is worth being clear about what a cvd simulation can and cannot establish. The protanopia deuteranopia preview swatches answer the question of whether two particular colors survive one conversion each, and they make no attempt to rank a palette or score a design. Read them as a set of views to think with rather than as a pass mark.",
    howTo: [
      { step: "Pick a color in the swatch field to populate the row of simulated views." },
      { step: "Compare the original against the protanopia, deuteranopia, tritanopia and achromatopsia swatches, looking for pairs that become hard to tell apart." },
      { step: "Drop an image into the simulation panel to see the same deficiency applied across a whole picture." },
      { step: "Choose the deficiency from the dropdown and use the replace button to swap the image when you want to compare another screen." },
    ],
    whenToUse:
      "Use the color blindness simulator when you want one color seen through every deficiency at once, and when you need to push that view across a whole screenshot rather than a single swatch. If one deficiency is the concern, the dedicated {{deuteranopia-simulator|deuteranopia simulator}} and {{tritanopia-simulator|tritanopia simulator}} pages keep the comparison to a single pair, the {{deuteranomaly-simulator|deuteranomaly simulator}} covers the partial form, and picking text colors that survive the same problem belongs with the {{color-blind-friendly-color-picker|color blind friendly color picker}}.",
    faqs: [
      {
        q: "How accurate are the simulated swatches?",
        a: "They are approximations. The matrices follow the Brettel and Machado approaches and are applied straight to the 8-bit channel values with clamping, which is a standard simplification rather than a colorimetric model. They are good enough to reveal where colors collapse together, which is what the tool is for.",
      },
      {
        q: "Why is the achromatopsia swatch always grey?",
        a: "Because that matrix uses the same luminance weights on all three output channels, so the red, green and blue results are equal by construction. Any color put through it comes out neutral, with only its lightness preserved.",
      },
      {
        q: "Does the image simulation run at full resolution?",
        a: "No. Images are scaled so the longest edge is at most 800 pixels before the matrix is applied, which keeps processing fast. The result is a faithful downsample of your picture for the purpose of judging color, not a full-resolution export.",
      },
      {
        q: "Can I simulate a partial deficiency like deuteranomaly here?",
        a: "Not on this page. The four swatches use full-strength matrices with no severity control, so the milder anomalous forms are not represented. The anomaly pages exist for that case, though they share the same complete matrices.",
      },
      {
        q: "Is a swatch comparison enough to tell whether my design is safe?",
        a: "It is a useful first pass, not a verdict. Two colors surviving the simulation separately can still be confusing together in a legend or a chart. Use the swatch row to find obvious collapses, then check the real screens.",
      },
    ],
  },

  "color-complement-finder": {
    keywords: [
      "color complement finder",
      "complementary color finder",
      "opposite color on the color wheel",
      "find the complement of a color",
    ],
    intro:
      "The color complement finder returns the exact colour that sits opposite your base on the colour wheel, computed by rotating its hue a full one hundred and eighty degrees.",
    content:
      "The color complement finder takes a base colour and returns its opposite on the colour wheel. Give it a hex value and it rotates the hue by one hundred and eighty degrees, keeping lightness and chroma as they were, and shows the original next to the complement. The two colours are the classic complementary pair: placed together they produce the maximum hue contrast available for that starting point, which is why complements are the backbone of so many accent and call-to-action decisions.\n\n- The rotation is performed in OKLCH, which matters for the quality of the result.\n- Working in a perceptually uniform space means the complement keeps the same apparent brightness as the original, so the pair reads as balanced rather than one colour dominating the other.\n- In an older model the same numeric rotation could land on a noticeably lighter or darker tone, and the resulting pair would feel lopsided for reasons that were hard to diagnose.\n- Pinning lightness and chroma isolates hue as the only thing that changes.\n\nComplementary pairs are the highest-energy relationship on the wheel, and that energy is both the appeal and the risk. Used sparingly, a complement is a superb accent: a single button, a link, a highlight or a chart series can carry the eye precisely because it opposes the surrounding colour. Used at similar areas and similar intensity across a whole layout, the same pair vibrates uncomfortably, a phenomenon the simultaneous contrast tool in this section demonstrates directly. The practical guidance is to let one colour of the pair dominate and use the other as a minority accent.\n\nFinding the complement is also a useful first step in building a broader scheme. The complementary pair defines the poles of the design, and you can then soften the relationship by using split complements, which replace the single opposite hue with two near-opposites rather than one. If you want the tension without the harshness, that split version is usually the more forgiving choice, and this finder is still the right place to start because it establishes the reference point both variants are built from.\n\n- A caution specific to this approach is that a mathematically exact complement is not always a pleasing one.\n- Flipping a muted earth tone a full one hundred and eighty degrees can produce a saturated blue that is technically opposite but stylistically unrelated, because lightness and chroma were preserved but context was not.\n- Treat the result as the correct answer to the geometry question and a strong starting point, then adjust saturation or lightness to fit the mood.\n- For accents needing maximum separation, however, the exact complement is exactly what you want.\n\nA complementary color finder is most useful before you have settled on an accent: find the complement of a color early, decide whether the pair should be split, and only then start building. The opposite color on the color wheel gives you the maximum hue separation available for that base, so if a design still feels flat after using it, the problem is likely to be area or lightness rather than hue.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the pair: the second swatch is the hue rotated one hundred and eighty degrees in OKLCH, at the base's own lightness and chroma." },
      { step: "Copy the complement's hex." },
      { step: "Move to the triadic or split-complementary tools when the exact opposite is too strong for the job." },
    ],
    whenToUse:
      "Use this finder when you need a single high-contrast accent for a base colour. Use the analogous finder when you want a calm family, and the split-complementary palette generator when you want the tension of a complement softened into two hues. The {{color-triadic-finder|triadic finder}} and {{color-tetradic-finder|tetradic finder}} widen the relationship to three and four hues, and the {{split-complementary-palette-generator|split-complementary generator}} keeps the tension while avoiding the exact opposite.",
    faqs: [
      {
        q: "How is the complement calculated?",
        a: "The base colour's hue is rotated by one hundred and eighty degrees with lightness and chroma held constant, which produces the opposite hue on the wheel.",
      },
      {
        q: "Why does the complement have the same brightness?",
        a: "The rotation happens in OKLCH, a perceptually uniform space, so only the hue changes. Both colours keep the same apparent lightness and read as balanced.",
      },
      {
        q: "Can I use both colours in equal amounts?",
        a: "You can, but equal areas of opposing hues can vibrate uncomfortably. Let one dominate and use the complement as a minority accent for a more stable result.",
      },
      {
        q: "What if the complement looks wrong for my palette?",
        a: "An exact complement preserves lightness and chroma but ignores context. Adjust saturation or lightness to fit the mood, or try a split complement instead.",
      },
      {
        q: "Is the exact opposite always the right accent?",
        a: "No. A mathematically exact complement is a starting point: it is the highest-energy relationship on the wheel, and on a large area it can read as a clash rather than a pairing, which is why split-complementary and toned variants exist for cases where the exact opposite is too loud.",
      },
    ],
  },

  "color-context-simulator": {
    keywords: [
      "color context simulator",
      "see a color on different backgrounds",
      "background color comparison",
      "color on white and black background",
    ],
    intro:
      "The color context simulator places one color on four different backgrounds at once, so you can see how white, black and coloured surroundings change the way it reads.",
    content:
      "- The color context simulator takes a single color and shows it simultaneously on four backgrounds: white, black, a mid blue and a green.\n- You pick the color, and the tool renders it as an identical circle on each surface, so any difference in apparent hue, brightness or saturation comes entirely from the surroundings rather than from the color itself.\n- It is the fastest way to demonstrate that a color has no fixed appearance independent of its context.\n\nThis effect is a real perceptual phenomenon rather than a rendering trick. The visual system judges color relative to its neighbourhood rather than in absolute terms, so the same patch looks lighter against a dark background and heavier against a light one, and shifts slightly in perceived hue when surrounded by a strong colour. Designers run into the practical consequence constantly: a brand color that looked perfect on a white marketing page can look dull or washed out on a dark dashboard, and vice versa, even though the hex value never changed.\n\nThe four backgrounds in the tool cover the situations that matter most. White and black bracket the lightness extremes and reveal whether the color depends on a particular background to look right. The blue background is the most instructive, because a color close to it in hue tends to recede while a contrasting hue advances, which is exactly why choosing a surface colour is as consequential as choosing the accent itself. The green background gives a second hue reference so you can compare how the color behaves against a warm-adjacent and a cool-adjacent field.\n\nA practical workflow is to pick the color you intend to use as an accent and check it on all four panels before committing. If it holds up on white and black but disappears on blue, you know it will need to be used away from blue surfaces, or adjusted for those contexts. If it shifts noticeably between the light and dark panels, plan for a separate variant per theme rather than reusing one value, which is what most design systems end up doing for exactly this reason.\n\n- Two caveats are worth keeping in mind.\n- The comparison is qualitative: the tool shows that a shift occurs and what it looks like, but it does not measure the magnitude, and small shifts are within normal variation between viewers and screens.\n- And the backgrounds are fixed rather than user-configurable, so for testing against your own surface colors you should place the swatch in situ.\n- Within those limits, seeing one color on different backgrounds side by side is the quickest way to build the habit of evaluating color in context instead of in isolation.\n\nUse it whenever you need to see a color on different backgrounds before committing to a surface. The four-panel view is a background color comparison in the literal sense, letting you judge a color on white and black background panels as well as against neighbouring hues, and it turns a question that is usually answered by intuition into one you can look at directly.",
    howTo: [
      { step: "Set the colour with the picker." },
      { step: "Compare the same disc against white, black, blue and green backgrounds." },
      { step: "Notice how much the surrounding surface changes what the colour appears to be." },
    ],
    whenToUse:
      "Use this simulator when you are choosing an accent or surface colour and want to confirm it holds up on light and dark and against neighbouring hues. Use the contrast checker when the question is legibility rather than appearance. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Which backgrounds does it use?",
        a: "White, black, a mid blue and a green. That brackets the lightness extremes and gives both a close-hue and a contrasting-hue reference.",
      },
      {
        q: "Why does the colour look different on each panel?",
        a: "The visual system judges colour relative to its surroundings. The hex is identical on every panel; only the perceived hue, brightness and saturation shift.",
      },
      {
        q: "Does this affect accessibility?",
        a: "It affects perceived legibility but not the measured contrast ratio. Use a contrast checker for the numeric ratio and this tool for the perceptual judgement.",
      },
      {
        q: "Should I use one colour across light and dark themes?",
        a: "Often not. If the color shifts noticeably between the panels, define a separate variant per theme, which is common practice in mature design systems.",
      },
      {
        q: "What does the color context simulator not do?",
        a: "The comparison is qualitative: the tool shows that a shift occurs and what it looks like, but it does not measure the magnitude, and small shifts are within normal variation between viewers and screens. And the backgrounds are fixed rather than user-configurable, so for testing against your own surface colors you shoul",
      },
    ],
  },

  "color-darken-tool": {
    keywords: [
      "color darken tool",
      "darken a color",
      "darken hex color by percentage",
      "darken color online",
    ],
    intro:
      "The color darken tool reduces any color's lightness by a percentage you choose, returning a darker version that keeps the original hue and saturation intact.",
    content:
      "The color darken tool takes a color and a percentage and returns a darker version of it. Move the slider and the tool lowers the color's perceptual lightness by that fraction, leaving hue and chroma untouched, and shows the result as a large swatch next to your input. It is the direct way to answer a question that comes up constantly in interface work: what is the pressed, deeper or shaded version of this exact colour.\n\n- The darkening is applied in OKLCH rather than by subtracting from the red, green and blue channels.\n- That choice is what keeps the result clean.\n- Reducing RGB channels independently tends to shift hue as the channels approach zero, so a blue darkened enough starts to look purple and a saturated orange can go brown.\n- Working on the lightness axis alone means the darker color is recognisably the same color, just deeper, which is what a hover or active state should be.\n- Hue and chroma are preserved by construction.\n\n- The slider runs from zero to one hundred percent, so the range covers everything from no change to very nearly black.\n- In practice most useful darkening sits in a much narrower band: ten to twenty percent for a subtle interactive state, twenty to thirty for a distinct pressed shade, and more than that only when you want a genuinely different tone rather than a state.\n- Because the swatch updates live, you can find that band by eye instead of guessing a numeric value and checking it afterwards.\n\nBuilding state colours is the primary use. A design system typically needs a base, a hover and an active value for every interactive color, and deriving them by darkening keeps the relationships consistent across the whole palette. When the base color later changes, the derived states change with it rather than drifting apart, which is the maintenance benefit of deriving rather than hand-picking. The same logic applies to borders, dividers and any element that should read as a deeper sibling of a surface colour.\n\nTwo things to watch. First, darkening reduces the colour's lightness but not its saturation, so a highly saturated colour darkened far enough can start to look vivid even though it is darker; if you want a muted deep tone, pair darkening with a reduction in chroma using the saturation tools. Second, darkening lowers contrast against dark backgrounds, so a darkened state that sits on a dark surface may lose legibility; verify pairings with a contrast checker. Used for states and shaded variants, though, deriving a darker tone this way is faster and more reliable than nudging channels by hand.\n\nWhen you need to darken a color for a state and want the value to be reproducible, this is quicker than editing channels by hand: pick the base, choose how far to darken hex color by percentage, and copy the result. It is also a convenient way to darken color online while inspecting a palette, because the live swatch updates as you drag and you can stop the moment the tone looks right.",
    howTo: [
      { step: "Set the colour in the field." },
      { step: "Drag the slider to the percentage of darkening you want, from zero to one hundred." },
      { step: "Read the result swatch and copy its hex." },
      { step: "Check the contrast if the darker value will carry text." },
    ],
    whenToUse:
      "Use this tool to derive hover, pressed and shaded variants from a base colour. Use the lighten tool for the opposite direction, and adjust saturation as well when you want a muted deep tone rather than a vivid one. The {{color-shades-generator|shade generator}} shows ten darker steps side by side, and the {{color-lighten-tool|lighten tool}} covers the opposite direction.",
    faqs: [
      {
        q: "Does darkening change the hue?",
        a: "No. Lightness is reduced in OKLCH while hue and chroma are preserved, so the darker colour is recognisably the same hue rather than drifting toward another.",
      },
      {
        q: "How much should I darken for a hover state?",
        a: "Ten to twenty percent is typical for a subtle state and twenty to thirty for a distinctly pressed one. Judge it on the live swatch rather than a fixed rule.",
      },
      {
        q: "Why not just reduce the RGB values?",
        a: "Independent channel reduction shifts hue as values approach zero, so colours can go purple or brown. Adjusting perceptual lightness keeps the colour stable.",
      },
      {
        q: "Does a darker colour always have more contrast?",
        a: "Only against lighter backgrounds. On dark surfaces a darkened colour loses contrast, so check legibility with a contrast checker before using it for text.",
      },
      {
        q: "Is darkening the same as reducing saturation?",
        a: "No. The step is applied to lightness in OKLCH, so chroma and hue are untouched — darkening reduces the colour's lightness but not its saturation, and contrast against dark backgrounds falls as the value drops.",
      },
    ],
  },
};
