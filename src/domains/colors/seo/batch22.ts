import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 22.
 *
 * Skipped from this window:
 *  - pixel-color-picker — the registry aliases it to the identical ImageColorPicker
 *    as the already-authored image-color-picker.
 *  - pastel-palette-generator — renders the identical pastel generator as
 *    pastel-color-generator (authored here); one of the pair has to lose.
 *  - random-palette-generator — same screen as random-color-generator with five
 *    swatches instead of ten, so it would be a near-duplicate page.
 */
export const SEO_BATCH_22: Record<string, ToolSeo> = {
  "pastel-color-generator": {
    keywords: [
      "pastel color generator",
      "pastel color palette",
      "soft pastel colors",
      "pastel hex codes",
      "light pastel shades",
    ],
    intro:
      "The pastel color generator produces five soft colors at a fixed high lightness and low saturation, in random hues, with each pastel hex code ready to copy.",
    content:
      "The pastel color generator returns five swatches at a time, each with its hex value and a copy button, and a button that generates a fresh set. Every colour it produces sits at the same high lightness and the same modest saturation, which is the entire specification: pastels are defined by their position at the pale end of the range, not by any particular hue.\n\nBoth of the fixed values matter. Lightness sits around eighty-eight percent, which is high enough that the colour reads as tinted rather than as coloured, and low enough that it has not washed out to white. Saturation is held near 0.08, which is where a colour stops being a vivid mid-tone and becomes a soft one; below that it drifts towards grey. At those two settings, hue is what varies, and it varies across the whole wheel.\n\nThat last point shapes how the set behaves and is worth being clear about. Each of the five swatches is generated independently, drawing its own hue, so the result is five separate pastel colours rather than a coordinated pastel scheme. Sometimes that produces a pleasant spread; sometimes it produces several similar pinks and one stray green. There is no attempt at harmony, because the generator's subject is the tone rather than the relationships.\n\n- The way to use it follows from that.\n- Generate a set, keep the two or three that sit well together, and generate again for the rest — or take a single swatch as a starting point and let a harmony or monochromatic tool derive the related shades from it, which will hold together far better than five independent draws.\n- Copying all five straight into a design is what gives pastel palettes their occasional reputation for looking arbitrary.\n\nOne perceptual quirk is worth anticipating before it surprises you. At a constant chroma, pastels do not look equally saturated across hues: the yellows, greens and oranges at that lightness come out looking paler and closer to cream than the pinks, blues and violets, which keep more of their identity. The measured values are identical; the appearance is not, because the eye is more sensitive to colour difference in some regions than others. If a pastel palette needs to look even, the warm entries usually need a touch more chroma than the cool ones, which can be done by hand after copying.\n\nWhere pastels are appropriate is well established: children's products, wellness and beauty, wedding and celebration material, food and bakery branding, and any interface that should feel gentle rather than urgent. They are also a standard way to colour large background areas without competing with content. The caveat that comes with them is legibility — a pastel is a surface, not a text colour, and text in a pastel tone against white will fail a contrast check almost every time.\n\n- Limits: five colours, no coordination between them, no control over lightness or chroma, no contrast checking, and no history, so regenerating discards the previous set.\n- Used as a pastel color generator, though, it does the hard part of the job reliably — producing light pastel shades at a consistent tonal level, which is genuinely difficult to do by eye because the first colour always looks vivid next to the fourth.\n- Take the two or three that work, and you have soft pastel colors with pastel hex codes attached and a pastel color palette to build on without any mixing by hand.",
    howTo: [
      { step: "Press the generate button to produce five pastel swatches." },
      { step: "Keep the ones that work together and generate again for the rest." },
      { step: "Or take one swatch into a harmony tool to derive related shades from it." },
      { step: "Use the pastels as surfaces and fills, and check any text colour against them separately." },
    ],
    whenToUse:
      "Use this when a design should feel gentle — wellness, celebration, food, children's products — or when a large background area needs colour without competing with content. Use the neon generator for the opposite end of the tonal range. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "Why are the colours all the same brightness?",
        a: "Lightness is pinned around 88 percent and saturation near 0.08, which is what makes a colour pastel rather than merely light. Only the hue varies between swatches.",
      },
      {
        q: "Are the five colours a coordinated palette?",
        a: "No. Each draws its own hue independently, so the set shares a tone rather than a relationship. Keeping two or three and regenerating usually gives a better result.",
      },
      {
        q: "Why do the yellows look paler than the pinks?",
        a: "At the same measured chroma, some hues appear less saturated than others — warm colours read closer to cream at high lightness. If the set should look even, add a little chroma to the warm entries by hand.",
      },
      {
        q: "Can I use pastels for text?",
        a: "Rarely. A pastel against white fails the 4.5 to 1 requirement for body text almost every time, so treat these as surfaces and fills and choose text colours separately.",
      },
      {
        q: "What does the pastel color generator not do?",
        a: "Used as a pastel color generator, though, it does the hard part of the job reliably — producing light pastel shades at a consistent tonal level, which is genuinely difficult to do by eye because the first colour always looks vivid next to the fourth. Take the two or three that work, and you have soft pastel colors with",
      },
    ],
  },

  "primary-secondary-tertiary-colors": {
    keywords: [
      "primary secondary tertiary colors",
      "color wheel primary colors",
      "secondary colors list",
      "tertiary colors hex",
      "color theory primary secondary tertiary",
    ],
    intro:
      "The primary secondary tertiary colors reference lays out the three groups of the color wheel — red, green and blue, then yellow, magenta and cyan, then the six in-between hues — with hex values for each.",
    content:
      "The primary secondary tertiary colors reference is a fixed set of three cards. The first holds the color wheel primary colors: red, green and blue. The second holds the secondary colors list: yellow, magenta and cyan. The third holds six tertiary colours, the mixtures that sit between a primary and its neighbouring secondary. Every swatch shows its hex value and a copy button, and there is nothing to configure — this is a reference page rather than a tool.\n\nWhat makes it worth reading is which system of colour mixing it describes, because the two familiar systems disagree, and the disagreement is the source of most confusion about primary colours. On a screen the primaries are red, green and blue, because those are the channels a display emits; mixing all three at full strength produces white, and pairs of them produce the secondaries — yellow, magenta and cyan. In pigments the relationship inverts: the primaries are cyan, magenta and yellow, their pairs produce red, green and blue, and the secondaries you learned at school are different again. Both tables are correct, and a page that only showed one would leave the other looking wrong.\n\nThe tertiary row follows the additive system, which is the one this page is built on. Each entry is a half-and-half mixture of two channels, counted as two hundred and fifty-five down to one hundred and twenty-eight: red with half green gives orange, half red with full green gives a yellow-green, half green with full blue gives an azure, half red with full blue gives a violet, full red with half blue gives a rose, and full green with half blue gives a spring green. Those six complete the wheel, sitting between a secondary and a primary.\n\n- A detail that surprises people is that these are not merely the most saturated versions of their hues — two of them are close to the widest colours a screen can produce at all.\n- Pure green sits near the edge of what the display can render, which is why it appears almost unnaturally bright next to its neighbours, and pure blue is markedly darker than the other two at full intensity.\n- Both facts are useful when judging a design that uses them: equal numeric intensity does not mean equal perceived brightness, so a set built from these three values will look unbalanced even though the numbers are symmetrical.\n\nIn use, the page is a reference for explaining and for starting points. When a brief asks for a colour wheel primary colors set, these are the values a screen actually uses, which differ from the pigment set a traditional colour wheel illustrates. When someone needs a tertiary colors hex lookup — the six hues between the primaries and secondaries — the third card supplies them, and the copy buttons make lifting a value into a design file a click. Bring the color theory primary secondary tertiary diagram from a classroom next to this page and the disagreement is immediately visible, in a way that a written explanation rarely makes as clear.\n\nIt does not attempt to be a full colour theory course: there is no subtractive table, no discussion of how pigment mixing differs from light, no named tertiary terminology, and no tool for building a wheel from your own colours. What it does is lay the three groups out accurately for the additive system, with the hex values attached, which is the form most people actually need when working on a screen.",
    howTo: [
      { step: "Read the primaries card for red, green and blue — the channels a display emits." },
      { step: "Read the secondaries card for the pairs: yellow, magenta and cyan." },
      { step: "Use the tertiary card for the six mixtures between a primary and a secondary." },
      { step: "Copy any hex value from its swatch." },
    ],
    whenToUse:
      "Use this as a reference when explaining or checking colour relationships, or when a design needs a wheel-derived starting point. Use the harmony tools when you want a scheme generated from a base colour rather than the textbook sets. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Why are the secondaries yellow, magenta and cyan?",
        a: "Because this page describes additive mixing, where the primaries are red, green and blue. In pigments the primaries are cyan, magenta and yellow and the secondaries come out red, green and blue instead.",
      },
      {
        q: "How are the tertiary colours defined here?",
        a: "As half-and-half mixtures of two channels — red with half green, half red with full green, and so on for the six combinations that fill the gaps in the wheel.",
      },
      {
        q: "Why does the green swatch look so much brighter?",
        a: "Pure green sits near the edge of what a display can render and is perceived as far brighter than pure blue at the same numeric intensity, so a set built from the three primaries will look uneven despite symmetrical values.",
      },
      {
        q: "Is there a subtractive version?",
        a: "No. This reference covers the additive, screen-side system only, which is why its secondaries differ from a traditional painter's colour wheel.",
      },
      {
        q: "What does the primary, secondary & tertiary colors not do?",
        a: "Pure green sits near the edge of what the display can render, which is why it appears almost unnaturally bright next to its neighbours, and pure blue is markedly darker than the other two at full intensity. Both facts are useful when judging a design that uses them: equal numeric intensity does not mean equal perceived",
      },
    ],
  },

  "protanopia-simulator": {
    keywords: [
      "protanopia simulator",
      "red cone simulation",
      "protanopia hex",
      "cvd protanopia",
    ],
    intro:
      "Protanopia Simulator renders a color beside the same color as a protanopic viewer would see it, using the protanopia matrix and printing the resulting hex value.",
    content:
      "Protanopia Simulator shows a color twice: as it is, and as a protanopic viewer would see it. The two swatches are drawn large and side by side, which keeps the comparison to a single glance, and the hex value of the simulated result is printed underneath so the conversion can be recorded.\n\nProtanopia is the absence of the long-wavelength cone that carries red, and it differs from the other red-green deficiency in one respect that matters for design:\n\n- Reds lose saturation and darken noticeably, which means a red that was already dark can become nearly black.\n- Red and green converge toward a similar olive tone, so the hue axis between them largely closes.\n- Blues and yellows stay comparatively intact, since they depend on the short-wavelength cone.\n- Because reds also drop in luminance, a protanopic viewer can find a dark red harder to see than a deuteranopic viewer would, which is the practical difference between the two pages.\n\nThe simulated swatch comes from a fixed three-by-three matrix applied directly to the 8-bit red, green and blue channels. Its first row is 0.567 red plus 0.433 green, its second is 0.558 red plus 0.442 green, and its third is 0.242 green plus 0.758 blue, with the outputs clamped back into the 0 to 255 range and formatted as hex. The matrix is an approximation of how protanopia is usually modelled rather than an exact colorimetric transform, and it is applied at full strength with no way to ask for a partial result.\n\nThe narrowness of the page is worth being explicit about.\n\n- One deficiency only. The other complete type needs its own page, and the image mode lives elsewhere.\n- A single color at a time, so a palette is checked entry by entry.\n- No image or screenshot input.\n- Full-strength conversion, with nothing to represent a mild reduction in red sensitivity.\n- The output describes the model, not any individual viewer.\n\nReach for this page when a design leans on red, and especially when red is used against a dark surface or as a status color. Check the simulated swatch for two properties in particular: whether it has drifted toward the other colors in the set, and whether it has lost enough lightness to disappear against its background. Because this deficiency darkens reds as well as shifting them, a red that reads as vivid to you can be both duller and dimmer here, and that combination is what usually breaks an alert color.\n\nRead the page as a red cone simulation rather than as a palette review, because that is exactly what it is: one input color, one conversion and one printed result. The protanopia hex value below the simulated swatch is the useful artefact, letting you compare the converted color against the rest of your set without leaving the page. What it will not do is tell you whether a cvd protanopia viewer can still tell two colors apart, since that depends on the pair rather than on either color taken alone.",
    howTo: [
      { step: "Set the color you want converted in the swatch field." },
      { step: "Compare the two large swatches, with the original on the left and the protanopic simulation on the right." },
      { step: "Read the hex value under the simulated swatch and note how far it has moved in lightness, not only in hue." },
      { step: "Check that value against the dark surfaces it might sit on, since protanopia darkens reds rather than merely dulling them." },
    ],
    whenToUse:
      "Use the protanopia simulator when red carries meaning and you need to see how far a red moves once the long-wavelength cone is removed, which is the case it handles differently from the other red-green page. For the partial form, see the {{protanomaly-simulator|protanomaly simulator}}; for the other complete red-green deficiency, the {{deuteranopia-simulator|deuteranopia simulator}}; for all four deficiencies and the image simulation in one place, the {{color-blindness-simulator|color blindness simulator}}; and for text colors that survive the same conversion, the {{accessible-color-pair-finder|accessible color pair finder}}.",
    faqs: [
      {
        q: "What is the difference between this and deuteranopia?",
        a: "They remove different cones and their effects are not identical. Protanopia loses the long-wavelength cone, so reds both shift toward olive and darken. Deuteranopia loses the medium-wavelength cone, so hue separation collapses without the same loss of red luminance.",
      },
      {
        q: "Why does my red look almost black after the simulation?",
        a: "Because protanopia reduces red luminance as well as saturation. A dark red has little lightness to spare, so once the red contribution is removed the result sits close to black. Lifting the color's lightness is usually the fix rather than changing its hue.",
      },
      {
        q: "Is a protanopic viewer likely to see exactly this swatch?",
        a: "Not exactly. The matrix models the deficiency in a standard way and applies it at full strength, so the swatch shows a typical complete case rather than any individual's perception, which will vary with severity and with the display being used.",
      },
      {
        q: "Can I test an image on this page?",
        a: "No, this page works on a single color and shows one comparison. The image simulation, which downsamples a picture to a maximum 800 pixels on its longest edge before applying a matrix, is on the multi-type simulator.",
      },
      {
        q: "Does the simulated hex value belong in my palette?",
        a: "No. It is a reference for how the model converts your color, useful for checking separation and lightness. Shipping it as a palette color would mean designing for the simulation rather than for the range of viewers the simulation is trying to represent.",
      },
    ],
  },

  "radial-gradient-generator": {
    keywords: [
      "radial gradient generator",
      "radial gradient css",
      "circular gradient css",
      "radial gradient code",
      "generate radial gradient",
    ],
    intro:
      "The radial gradient generator builds a circular gradient from a list of color stops and writes the finished CSS declaration, with the ramp running outwards from the centre.",
    content:
      "- The radial gradient generator keeps the shared gradient controls — a live preview, one row per stop with a colour field and a position slider, and the CSS panel underneath — and swaps the axis for a centre.\n- There is no angle slider, because a radial gradient has no direction to set: it radiates from a point rather than running along an axis.\n\nEverything else about the stops still applies, and their meaning is worth restating for this shape. The zero percent position is the centre, not the left edge, so the first stop is the colour at the middle of the circle and the last is the colour at the outer boundary. A two-stop ramp therefore reads as a vignette or a spotlight, while adding stops creates rings — three colours produce a centre, a middle band and an outer band, which is the quickest way to build a soft halo or a button that appears lit from within.\n\nWhat the output always contains is a circle. The shape keyword is fixed: the declaration opens with a radial gradient of a circle, and the ramp is scaled to reach the corners of the element's box, which is the default sizing the browser applies when nothing else is specified. That combination behaves sensibly in most cases and is not adjustable here — there is no way to request an ellipse, to place the origin away from the centre, or to choose a different sizing keyword such as closest-side. Those are all legitimate things to want, and each would need to be written by hand into the copied declaration.\n\nPosition is the other omission worth naming. A radial gradient's centre can be moved, and moving it is often the difference between a spotlight effect and a wash, but with the centre fixed there is no control for it. In practice the workaround is the same as for the shape: copy the declaration and add the position clause manually, which is a small edit to a value that is otherwise generated correctly.\n\nThe angle slider's absence has a useful side effect, which is that the stops become the only variable. With a linear gradient it is easy to blame the direction when the ramp does not look right; here the only things to adjust are the colours and their spacing, so the effect of moving a stop is much easier to learn. That makes this a good place to experiment with stop management for its own sake, separate from direction decisions.\n\nWhere radial gradients are the right choice is when the light source matters — a soft glow behind a logo, a spotlight on a hero section, a vignette that draws the eye towards the centre of an image, a subtle interior shading on a card. They also work as decorative background layers stacked behind other elements, where the circle's soft edge blends into whatever is beneath.\n\n- Limits: one circle at a fixed centre, no ellipse, no repeat, no interpolation-space control and no conic form.\n- Within those bounds it produces a correct radial gradient css declaration in one pass, with the stops placed by drag rather than by typing numbers.\n- For a glow or a vignette it is the shortest route from a colour pair to a pasteable circular gradient css; to generate radial gradient code for anything more elaborate, the copied declaration is the right place to edit.",
    howTo: [
      { step: "Set the stop colours — the zero percent stop is the centre of the circle." },
      { step: "Drag the position sliders to control how far each colour reaches from the middle." },
      { step: "Add further stops if the gradient needs rings rather than a simple ramp." },
      { step: "Copy the background declaration, adding a position clause by hand if the centre should move." },
    ],
    whenToUse:
      "Use this when the effect should radiate — glows, spotlights, vignettes, interior shading. Use the linear gradient generator when the ramp should run across the element, or a conic tool when it should sweep around it. Where a radial gradient covers a large, soft area, the {{noise-grain-texture-generator|noise & grain texture generator}} is the direct antidote to the banding that shows in the widest part of the ramp, and wrapping several of these circles onto one surface is what the {{mesh-gradient-generator|mesh gradient generator}} does.",
    faqs: [
      {
        q: "Why is there no angle control?",
        a: "Because a radial gradient radiates from a point rather than running along an axis, so it has no direction to set. The angle slider only exists on the linear and conic builders.",
      },
      {
        q: "What does the zero percent stop mean here?",
        a: "The centre. The first stop is the colour at the middle of the circle and the last is the colour at the outer boundary, so a two-stop ramp reads as a vignette.",
      },
      {
        q: "Can I move the centre or make it an ellipse?",
        a: "Not from the interface — the shape is fixed to a circle at the centre. Both changes are a small manual edit to the copied declaration.",
      },
      {
        q: "How do I get rings instead of a smooth ramp?",
        a: "Add stops. Three colours produce a centre, a middle band and an outer band, and placing two stops at the same position creates a hard-edged ring.",
      },
      {
        q: "Does the ramp run out to the edge of the box or past it?",
        a: "Past the nearest edge. With no sizing keyword the browser scales the circle to reach the farthest corner, so a two-stop radial still has colour in the corners rather than fading out along the short side.",
      },
    ],
  },

  "random-color-generator": {
    keywords: [
      "random color generator",
      "random hex colors",
      "generate random colors",
      "random color palette hex",
      "color generator random",
    ],
    intro:
      "The random color generator produces ten unconstrained random colors at once as copyable hex swatches, and regenerates the whole set on demand.",
    content:
      "The random color generator shows ten random colours as a grid of swatches, each with its hex value and a copy button, and a button that replaces the entire set with ten new ones. It appears after the page loads rather than in the initial HTML, because the values are generated on the client so that the server and browser never disagree about them.\n\nTen is the fixed count. There is no way to ask for three or for fifty, and no way to keep one swatch while the others change — pressing the button replaces everything, so a colour worth keeping should be copied first. Within those constraints the tool is about as simple as it can be: one button, ten values, nothing to configure.\n\nThe interesting property is how unconstrained the values are. Each of the ten is drawn uniformly across the whole colour space rather than from any usable band, which is what makes the tool able to generate random colors that are genuinely unpredictable rather than merely varied, so a set will typically include a few that would never be chosen deliberately: near-blacks, colours that read as muddy brownish greys because their channels happened to land close together, and the occasional almost-white. That is the nature of a uniform random hex value, and it is worth knowing rather than treating as a defect — this generator is not trying to produce a palette, and it will not.\n\nWhat it is actually for is placeholders and practical decisions. Ten arbitrary values at once is a convenient supply of distinct colours for a chart with ten series, a table with ten categories, or a set of mock-ups where the colours only need to be different from each other. It is also useful in testing: a random value is a quick way to check that a component handles an unexpected colour, or that a layout survives an awkward one. And for anyone staring at an undecided colour choice, generated options are often enough to clarify what is wanted by ruling things out.\n\n- If the goal is something usable rather than merely arbitrary, the neighbouring tools are structured differently.\n- A random palette generator produces a smaller set that still has no relationship between its colours; the themed generators draw from bands that are known to work in a design; and an accessible palette generator filters its output so that every colour clears a contrast threshold against a chosen background.\n- The distinction matters — a random set is a source of variety, not a source of a scheme.\n\n- Limits: exactly ten colours per press, no history and no seed so a set cannot be reproduced, no locking or editing of individual swatches, no contrast checking, and no palette logic of any kind, since every value is independent.\n- Used as a random hex colors supply it does one job quickly, and when you need a random color palette hex values can be copied out of, ten at a time is a more practical unit than one.\n- For a color generator random enough to be genuinely unpredictable while still giving you copyable values, the one button and the fixed count are the whole interface.",
    howTo: [
      { step: "Load the page — ten random swatches appear." },
      { step: "Copy any value you want to keep from its swatch." },
      { step: "Press the button to replace the whole set with ten new colours." },
    ],
    whenToUse:
      "Use this when you need a batch of clearly different colours for placeholders, categories or testing. Use a themed, palette or accessible generator when the colours have to be usable rather than merely random. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "How many colours are generated?",
        a: "Ten at a time, always. The count is fixed, and pressing the button replaces all ten rather than adding to them.",
      },
      {
        q: "Why do the swatches appear after the page loads?",
        a: "The values are generated in the browser rather than on the server, so the initial HTML and the first render cannot disagree. The grid is empty for that first moment.",
      },
      {
        q: "Are the colours constrained to look good?",
        a: "No. Each is drawn uniformly across the whole colour space, so near-blacks, near-whites and muddy mid-tones all appear regularly. It supplies variety rather than a scheme.",
      },
      {
        q: "Can I lock a colour I like and regenerate the rest?",
        a: "No. Each press replaces the entire set, and there is no seed, so a set cannot be reproduced. Copy anything worth keeping before regenerating.",
      },
      {
        q: "What does the random color generator not do?",
        a: "Used as a random hex colors supply it does one job quickly, and when you need a random color palette hex values can be copied out of, ten at a time is a more practical unit than one. For a color generator random enough to be genuinely unpredictable while still giving you copyable values, the one button and the fixed co",
      },
    ],
  },

  "rgb-channel-adjuster": {
    keywords: [
      "rgb channel adjuster",
      "adjust rgb values",
      "rgb color mixer",
      "set rgb channels",
      "rgb value to hex",
    ],
    intro:
      "The RGB channel adjuster sets a color by its red, green and blue values with three sliders from 0 to 255, showing the resulting hex value as you move them.",
    content:
      "- The RGB channel adjuster is three sliders and a swatch.\n- Red, green and blue each run from zero to two hundred and fifty-five, the numbers used by every eight-bit colour value on the web, and the swatch beside them updates as they move, carrying its hex value and a copy button.\n- The starting point sits at a mid blue, with the channels at their corresponding values.\n\nWorking in channels rather than with a colour picker is not simply a slower way to do the same thing — it exposes different information, and it is the only way to adjust rgb values that have been specified as numbers. A picker encourages you to hunt for a colour by eye; three numeric sliders let you see the structure of a colour directly. Raising red while the other two stay fixed shows exactly how much of the final appearance that channel is responsible for, and because the three are independent, the effect of each is isolated. That makes the tool useful for learning as much as for producing.\n\nIt is also the right interface when the numbers are the requirement. Matching a value that has been specified channel by channel — from a hardware colour profile, a firmware configuration, a serialised settings file, or a colleague's specification — is a matter of typing three integers here rather than trying to land on them with a picker. Whether a colour appeared in a screenshot slightly off, or a device needs an exact channel triple, sliders set to whole numbers give exact control where dragging in a colour field gives approximate control.\n\n- The sliders are absolute rather than relative, which is the main thing to understand about the tool's behaviour.\n- There is no way to say add twenty to red; you set red's new value.\n- That means adjustments are made by repositioning each channel and watching the swatch, which is a different mental model from the lightness, saturation and hue tools in this domain where a slider expresses a change rather than a value.\n\nA related limitation follows from working in channels: some things are easy to see and hard to name. Increasing green from a hundred and thirty to a hundred and eighty moves the colour clearly towards yellow-green, but nothing in the interface tells you what hue or saturation that represents. For calibration and matching, that is fine. For choosing a colour by intent, an HSL or perceptual tool expresses the adjustment more directly, and the format converter or the playground is the better starting point. There is also no hex input, so an existing value has to be re-created by reading its three channels and setting them — and the output shows the hex, so it is easy to check you landed on the right one.\n\nWhere it earns its place is precision work: reproducing an exact specification, debugging a colour that renders differently from the design, or teaching what each channel contributes. As an rgb color mixer it is the clearest of the mixing tools, because additive mixing of red, green and blue is literally what the three sliders are doing — pushing all three to the top gives white, pushing all three down gives black, and each pair in between produces one of the secondary colours. When the task is to set rgb channels to an exact triple, or to convert a known rgb value to hex, three sliders and a swatch do the job without any interpretation, and the channel numbers stay visible while you work rather than being hidden behind a hex field.",
    howTo: [
      { step: "Move the red, green and blue sliders, each from 0 to 255." },
      { step: "Watch the swatch change and check the hex value against the specification you are matching." },
      { step: "Copy the hex value once the channels are correct." },
    ],
    whenToUse:
      "Use this when a colour is specified as channel values, or when you need to see how each channel contributes. Use the OKLCH playground or an HSL tool when you want to adjust by intent — lightness, vividness or hue — rather than by number. The {{cmyk-channel-mixer|CMYK channel mixer}} edits the same colour through the ink channels, and the {{hsl-channel-adjuster|HSL channel adjuster}} works the lightness and saturation axes instead of the raw channels.",
    faqs: [
      {
        q: "Why 0 to 255?",
        a: "Because that is the range of each channel in the eight-bit colour values the web uses. Two hundred and fifty-five of each gives white, and zero of each gives black.",
      },
      {
        q: "Can I enter a hex value and adjust from there?",
        a: "Not here — the sliders are the only input, so an existing colour is reproduced by setting its three channel values. The hex output lets you confirm you reached it.",
      },
      {
        q: "Are the sliders relative or absolute?",
        a: "Absolute. Each sets the channel's value rather than an amount to add, so adjustments are made by repositioning a channel and watching the swatch.",
      },
      {
        q: "Why does raising green lead to yellow?",
        a: "Because this is additive mixing. Red and green together produce yellow, green and blue produce cyan, and red and blue produce magenta — the secondary colours of a screen.",
      },
      {
        q: "Why do the sliders move the colour so unevenly?",
        a: "Because the sliders are absolute rather than relative and the channels are not perceptually even: green carries most of the brightness, so equal steps on the three sliders do not look like equal steps, and some colour changes are easy to hit this way while others, such as a pure hue rotation, are not.",
      },
    ],
  },

  "scss-variable-generator": {
    keywords: [
      "scss variable generator",
      "scss variables from colors",
      "sass color variables",
      "generate scss variables",
      "scss color palette code",
    ],
    intro:
      "The SCSS variable generator writes a palette out as Sass variables in the $name form, one declaration per color, ready to paste into a compiled stylesheet.",
    content:
      "- The SCSS variable generator works from a list of name-and-colour rows and produces one Sass variable per row.\n- It starts with two rows, primary and danger, and Add appends another, seeded with a random colour; each row pairs a text field with a colour field and a delete button.\n- The output panel headed SCSS updates as you type, with a copy button for the whole block.\n\nThe syntax is the reason a dedicated page exists. Sass declares variables with a dollar sign, so a name typed as primary comes out as a dollar-prefixed declaration followed by the hex value. It compiles to the same result as the CSS custom properties a browser understands, with the important difference that Sass variables are resolved at build time and then cease to exist, whereas custom properties remain available at runtime. Choosing between them is a real decision: Sass variables are simpler and work everywhere the preprocessor runs, while custom properties can be changed by JavaScript or by a media query without a rebuild.\n\nOne property of Sass naming is worth knowing before you type, and it is the kind of thing that causes confusing bugs. Sass treats hyphens and underscores as equivalent in identifiers, so a variable declared as a hyphenated name and referenced with an underscore is the same variable. That is usually convenient — it means the choice of separator does not matter — but it also means two names that look different in a source file can silently be one variable, which is worth remembering when a value appears to change on its own.\n\nThe output is minimal by design: one declaration per row, no imports, no maps, no comments and no nesting. That makes it easy to splice into an existing variables partial, and it means the block is not a standalone Sass file. Values are written as hex, which also means they can be used with Sass's own colour functions — lightened, darkened, mixed, adjusted — so derived shades can be computed at build time from a single declared value rather than listed individually here.\n\nIn practice the shortest workflow is to name the tokens the way the project already refers to them, set the values, and copy. If the palette lives in a design system with published names, use those names rather than inventing new ones; the whole value of a variable is that the name at the call site is stable. Migrating from another preprocessor is a matter of keeping the names and changing the sigil, which is a mechanical change this generator removes the risk from.\n\n- Limits: it exports colour variables only, with no mixins, functions, maps or control directives, and there is no validation — a blank name produces a declaration with no variable while a duplicate name quietly produces two declarations of the same variable.\n- The values are always hex, with no rgb, hsl or channel-based output.\n- Within those bounds, this is the quickest way to generate scss variables from colors, and for anyone assembling a set of sass color variables as a scss color palette code block it is a list of names and one copy — with the identical row interface driving the LESS and CSS-in-JS outputs, so the same naming decisions carry across if the build tooling changes.",
    howTo: [
      { step: "Replace the default names with the tokens your stylesheet uses." },
      { step: "Set each value with the field beside its name, or add rows with Add." },
      { step: "Copy the block from the SCSS panel into your variables partial." },
      { step: "Use Sass colour functions such as lighten or mix on the values where derived shades are needed." },
    ],
    whenToUse:
      "Use this when a palette has to reach a stylesheet compiled with Sass. Use the CSS variables generator when the tokens should stay available at runtime, or the LESS generator for that preprocessor's syntax. When the values should travel as data rather than as build-time variables, the {{design-token-generator|design token generator}} writes them as a token document, and a palette that already exists elsewhere can come in through the {{palette-importer|palette importer}} instead of being retyped row by row.",
    faqs: [
      {
        q: "How are the variables written?",
        a: "With a dollar sign, in the form Sass expects. Typing primary produces a variable whose name is primary, followed by the hex value.",
      },
      {
        q: "Do hyphens and underscores matter in names?",
        a: "No — Sass treats them as equivalent, so a hyphenated declaration and an underscore reference are the same variable. Convenient, and occasionally confusing when two names turn out to be one.",
      },
      {
        q: "How does this differ from CSS custom properties?",
        a: "Sass variables are resolved at build time and disappear from the output. Custom properties survive into the browser, which is why they can be changed at runtime and Sass variables cannot.",
      },
      {
        q: "Can I use Sass colour functions on the values?",
        a: "Yes. The values are plain hex, so lighten, darken, mix and similar functions can be applied in your own stylesheet rather than generating every shade here.",
      },
      {
        q: "Can I paste an existing SCSS block in and edit it here?",
        a: "No — the rows are the source rather than a parsed stylesheet. Pasting the values into the fields regenerates the block, which is usually slower than editing the copied output directly when the change is a small one.",
      },
    ],
  },
};
