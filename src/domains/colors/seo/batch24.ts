import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 24.
 *
 * The tail of the alphabet: tailwind-palette-generator through
 * vintage-retro-palette-generator. Seven slugs, seven different components, each
 * entry written against the implementation as it renders today.
 *
 * Skipped from this window (same component as an authored slug — no distinct page
 * to write): nearest-named-color-finder (returns ColorNameLookup), pixel-color-picker
 * (alias of ImageColorPicker), linear-gradient-generator (Linear is makeGradient("linear"),
 * identical to the authored gradient-angle-adjuster), random-palette-generator (same
 * random-swatch roll as the authored random-color-generator, five vs ten swatches).
 * emotion-color-finder is left for deliberate repair: the slug promises an
 * emotion-to-colour mapping and the component hashes the emotion name to arbitrary hues.
 */
export const SEO_BATCH_24: Record<string, ToolSeo> = {
  "tailwind-palette-generator": {
    keywords: [
      "tailwind palette generator",
      "tailwind color scale",
      "50 to 950 ramp",
      "tailwind config snippet",
    ],
    intro:
      "The tailwind palette generator writes an eleven-step 50 to 950 colour scale from one base hue and hands back a ready-to-paste tailwind.config.js snippet.",
    content:
      "A Tailwind colour scale is a ladder with a name attached, and the tailwind palette generator produces both: eleven steps from 50 to 950 derived from one base colour, plus a config snippet that already contains them. Set the base and the page shows a tailwind color scale at fixed lightness values — 0.97, 0.93, 0.85, 0.75, 0.65, 0.55, 0.47, 0.4, 0.32, 0.22 and 0.14 — with the base's hue and chroma carried through every step.\n\n- Eleven steps: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 and 950.\n- Lightness values are fixed per step rather than evenly spaced, which mirrors how hand-tuned scales are built: the light end moves gently, the dark end compresses.\n- Hue and chroma come from the base, so the whole scale belongs to one family.\n- Output: a tailwind.config.js snippet extending theme.colors with a brand key, complete with a copy button.\n\nThe fixed lightness table is the part worth understanding. Between 50 and 400 the steps move quickly because pale tints separate visually even when they are close in lightness; between 500 and 950 they compress because dark values need less travel to look different. That asymmetry is deliberate and it is what makes a generated scale usable next to a hand-written one. Because chroma is inherited unchanged, the lightest steps can look more saturated than a published palette's equivalents — the same trade-off the Material ramp makes on this site.\n\n- The snippet is emitted as a CommonJS tailwind.config.js fragment; projects on other config styles will need to adapt it.\n- One brand key only. A second family means running the tool again and merging the results by hand.\n- No per-swatch copy buttons and no plain CSS output; the config block is the one export.\n- Nothing is measured for contrast, and the pale steps in particular are unlikely to carry text.\n\nUse it when a brand hue has to become a full scale in a Tailwind project — it removes the usual evening of squinting at hex values and guessing which step should be lighter. Keep the generated values in source control and regenerate only when the brand hue changes, because hand-editing steps inside a generated scale is how a palette starts drifting. Where the destination is CSS custom properties rather than a Tailwind config, the variable tools write that instead, and where a shorter ladder is enough, the shade generator covers six steps without step names. Treat the output as a 50 to 950 ramp with a fixed shape rather than as eleven independently chosen colours, and let the tailwind config snippet be the only place those values are written down: a scale that lives in two files drifts within a month. Because every step descends from one hue, the theme never collects a stray blue that belongs to another family, which is the quiet advantage of generating a scale instead of copying one, and of regenerating only when the hue itself changes.",
    howTo: [
      { step: "Set the base colour with the picker field." },
      { step: "Review the eleven steps from 50 to 950, noting how the light end moves quickly and the dark end compresses." },
      { step: "Copy the tailwind.config.js snippet from the output panel." },
      { step: "Paste it into the theme's extend block and keep the generated values under source control." },
    ],
    whenToUse:
      "Use this when a Tailwind project needs a brand scale from a single hue. The {{css-color-variables-generator|CSS variables generator}} writes custom properties instead, the {{material-palette-generator|Material palette generator}} produces a ten-step ramp with conventional step names, and the {{palette-accessibility-checker|palette accessibility checker}} shows which steps can carry text.",
    faqs: [
      {
        q: "Why are the steps not evenly spaced in lightness?",
        a: "Because even spacing is not the same as even appearance. Pale tints separate easily, so those steps move fast, while dark values need less travel to look distinct and are compressed towards 950.",
      },
      {
        q: "What does the generated config look like?",
        a: "A CommonJS tailwind.config.js fragment that extends theme.colors with a brand object containing all eleven steps as quoted hex strings, ready to paste into an existing extend block.",
      },
      {
        q: "Does the scale match the Tailwind default palette?",
        a: "It follows the same step names but the values are derived from your base hue, so it will sit beside the defaults rather than replacing them.",
      },
      {
        q: "Why do the light steps look saturated?",
        a: "Chroma is inherited from the base without reduction, so step 50 and 100 keep the full chroma. Published scales usually desaturate there.",
      },
      {
        q: "Can I generate two brand families at once?",
        a: "No. Each run produces one family under a single brand key; a second hue means a second run and a manual merge of the two config objects.",
      },
    ],
  },

  "text-gradient-generator": {
    keywords: [
      "text gradient generator",
      "gradient text css",
      "background clip text",
      "css gradient text",
      "gradient headline css",
    ],
    intro:
      "The text gradient generator writes the CSS that fills type with a horizontal two-stop gradient and previews it on a headline using the background clip text technique.",
    content:
      "- Two colour fields decide everything: a From that starts on a blue and a To that starts on a purple.\n- The headline above them turns into a gradient running left to right as either field changes.\n- Underneath, a code panel holds the declarations that do the work, with a copy button for the whole block.\n- The angle is fixed at ninety degrees, so the gradient always travels horizontally.\n\nThe technique is a background trick rather than a text property. The element is given a linear gradient as its background, a background clip of text confines that background to the shape of the glyphs, and the text itself is made transparent so the gradient shows through. Both the standard declaration and the -webkit prefixed version are written, along with -webkit-text-fill-color and a plain transparent colour, which is why the snippet is five lines long rather than two.\n\nOne property of the approach matters in practice: the gradient is painted into the element's background box, so it stretches across the whole line rather than restarting per word. A two-word heading and a ten-word heading therefore reveal the same two colours at very different rates, and short text can look abrupt. Nothing in the interface warns about that, the preview copy is fixed, and a longer headline has to be tried in the page itself.\n\n- Where it earns its place is display type that carries a brand moment: a hero headline, a product name, a section opener.\n- Two stops are the plainest form of the idea and the easiest to keep legible, since the extremes of the ramp are colours you can test independently.\n- A third colour, an angled direction and an animated background all extend the technique and none of them are available here; the snippet is a foundation to edit, and the preview is honest about that scope — one phrase, one size, one direction.\n\nThe copy is what most visitors come for. It is a plain set of declarations that drops into a stylesheet class, with no custom properties, no variables and no fallback for engines that ignore the clipping. Where those engines matter, the transparent colour line is the risk: the text becomes invisible if the clipping is unsupported, so a production headline should carry a fallback.\n\nLegibility is the other consideration, and it is why a gradient headline css treatment deserves testing rather than trust. Contrast is judged between the gradient's colours and the surface behind the text, and a gradient that runs from strong to weak changes the answer along its length — the same headline can pass at the left edge and fail at the right.\n\nUse it for short display type: hero headings, section labels, product names, banner titles. Two colours only, no stop positions, no angle control, no font settings and no dark-mode preview. The panel showing the effect uses one fixed phrase at one size, so the preview is a proof of the CSS rather than a layout test.\n\nAs a text gradient generator it hands over gradient text css that works the first time, and for anyone who wants css gradient text without remembering which of the four clipping declarations is required, the background clip text block is one copy away.",
    howTo: [
      { step: "Set the From colour and the To colour." },
      { step: "Read the headline preview, which uses the same ninety-degree gradient the snippet will produce." },
      { step: "Copy the five declarations into a stylesheet class and apply it to short display type." },
    ],
    whenToUse:
      "Use this when a heading should carry a two-colour gradient and you want the exact declarations. Use the transparent gradient generator for a fade on a surface or overlay, or the gradient generator when the gradient itself needs an angle and stop positions. When the fade belongs to a surface rather than to type, the {{transparent-gradient-generator|transparent gradient generator}} writes the scrim version, and when the ramp needs an angle or extra stops the {{multi-stop-gradient-builder|multi-stop gradient builder}} is where those controls live.",
    faqs: [
      {
        q: "How does the gradient fill the letters?",
        a: "The gradient is painted as the element's background, clipping confines that background to the glyph shapes, and the text colour is made transparent so the background shows through the letters.",
      },
      {
        q: "Why are there five declarations rather than two?",
        a: "Because the technique needs a prefixed background-clip, a prefixed text fill colour for the WebKit engines, a standard background-clip and a plain transparent colour as the fallback form.",
      },
      {
        q: "Can I change the angle or add stops?",
        a: "No. The gradient is fixed at ninety degrees with your two colours and no stop positions, so a diagonal or three-colour headline has to be edited in the copied code.",
      },
      {
        q: "Does the gradient restart on each line?",
        a: "No — it is sized to the element's background box and stretches across the whole block, so a headline that wraps shows two slices of the same single ramp.",
      },
      {
        q: "What happens where background-clip is not supported?",
        a: "The emitted block ends with a transparent text fill and a transparent colour, so an engine that ignores the clip renders the text invisible — which is why a solid colour fallback ahead of it, or a different carrier for the headline, is worth having. Email clients are the usual example.",
      },
    ],
  },

  "text-readability-checker": {
    keywords: [
      "text readability checker",
      "text on color preview",
      "font size contrast",
      "readable text check",
    ],
    intro:
      "Text Readability Checker renders your own copy in your chosen colors at six sizes at once, so a pairing can be judged as text rather than as a pair of swatches.",
    content:
      "Text Readability Checker renders your own sentence in your chosen text and background colors at six sizes at once, from 12px up to 40px, with the contrast ratio printed underneath. It answers a question the number alone cannot: a pair can clear 4.5 to 1 and still read badly, and the only way to see that is to read it.\n\nThe preview is built to make the size question visible rather than theoretical:\n\n- 12px, the size where a pairing that only just satisfies the threshold starts to look thin.\n- 14px and 16px, the ordinary body sizes most interfaces actually use.\n- 20px and 28px, where large-text allowances begin to apply and type starts to hold up.\n- 40px, the display size at which almost any compliant pair reads comfortably.\n\nThe text is yours to set, so the preview shows the letters and word shapes your product will really print rather than a pangram. The colors are entered as a text color and a background color, and the ratio shown beside the preview is the standard WCAG 2.x calculation: both colors are converted to sRGB, their channels are linearised, and the linear values are weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance, before the lighter plus 0.05 is divided by the darker plus 0.05 and rounded to two decimals.\n\nThis page deliberately does not hand down a verdict, and that shapes what it can and cannot do.\n\n- There are no pass or fail badges. The ratio is printed and the judgement is left to you, which is right for a readability question but wrong if you need a compliance answer.\n- The six sizes are fixed at 12, 14, 16, 20, 28 and 40 pixels. They are not rem values, so browser text scaling is not reflected in the preview.\n- Nothing is measured from the rendering. The number is the ratio of the two colors, not a sample of the pixels on screen, so antialiasing and font choice do not enter the result.\n- Font family and weight are not inputs, though both change how a pairing holds up at small sizes.\n- No alpha, gradients or surfaces behind the pair.\n\nUse this page after a pair has passed its threshold check, not instead of it. Paste the longest line your interface really shows, read the 12px sample first and work upwards, and if the smallest size looks weak, treat that as a signal to move a color rather than to raise the type size everywhere.\n\nA text on color preview is also the only reliable way to catch the subtler failures, which are about font size contrast rather than the pair itself. A muted grey that satisfies 4.5 to 1 can still look weak at 12px in a light weight, and a dark navy can look heavy at 40px in a bold one. Because the page pairs one color choice with six fixed sizes, a readable text check is really a question about which size the pairing is fit for, and the answer is often that the same two colors suit body copy at one width and captions at quite another.",
    howTo: [
      { step: "Set the text color and the background color in the two swatch fields." },
      { step: "Type or paste the copy you actually want to test into the preview text field, replacing the default pangram." },
      { step: "Read the preview block, working from the 12px line upwards, since the smallest size reveals the most." },
      { step: "Compare the printed contrast ratio underneath against the threshold your text size requires." },
    ],
    whenToUse:
      "Use the text readability checker once a pair has already passed a threshold test and you want to see how it behaves as real text at small sizes. The threshold verdicts themselves belong with the {{contrast-checker|contrast checker}} or the {{wcag-21-aa-checker|WCAG 2.1 AA checker}}, deciding which neutral to set it in is the job of the {{accessible-color-pair-finder|accessible color pair finder}}, and reviewing the pairing across a whole interface is easier with the {{palette-accessibility-checker|palette accessibility checker}}.",
    faqs: [
      {
        q: "Why does this page not tell me whether my pair passes?",
        a: "Because readability is the question, not compliance. A pair can satisfy every threshold and still look weak at 12px in a thin font. The ratio is printed so you can compare it against your own requirement, and the verdicts live on the dedicated threshold checkers.",
      },
      {
        q: "Are the preview sizes in pixels or points?",
        a: "They are pixels, fixed at 12, 14, 16, 20, 28 and 40. Because they are absolute rather than relative units, changing your browser's text size setting will not change the preview, which is worth remembering when you evaluate the smallest line.",
      },
      {
        q: "Does the preview measure the actual rendered pixels?",
        a: "No. The ratio is computed from the two colors you entered, and the rendering is there for your eyes. Antialiasing, subpixel rendering and the font you are viewing in all affect how it looks but not the figure.",
      },
      {
        q: "Which size should I judge first?",
        a: "The 12px line. It is the most demanding case and the fastest way to spot a pairing that is technically compliant but practically thin. If it reads cleanly there, the larger sizes will as well.",
      },
      {
        q: "Can I check placeholder or secondary text here?",
        a: "Yes, and it is worth doing, because muted text colors are where threshold failures usually hide. Substitute the muted color as the text color and read the smallest line, treating anything below 4.5 to 1 as a candidate for a darker value.",
      },
    ],
  },

  "transparent-gradient-generator": {
    keywords: [
      "transparent gradient generator",
      "fade to transparent css",
      "gradient fade overlay",
      "css overlay fade",
      "gradient to transparent",
    ],
    intro:
      "The transparent gradient generator writes a top-to-bottom CSS gradient that fades a colour into transparency, with a tall preview panel and the declaration ready to copy.",
    content:
      "- One colour field is the only control: choose a colour and a tall panel fills with a gradient that starts at that colour at the top and reaches full transparency at the bottom.\n- Underneath, a code panel prints the single declaration that produced it, with a copy button for the whole value.\n\nThe gradient to transparent is written as a linear gradient at 180 degrees with two stops: your colour and the keyword transparent. One hundred and eighty degrees in CSS means top to bottom, so the fade always runs vertically downwards, and the second stop carries no position, which places it at the far end of the box. The angle and the stop placement are fixed, so the only decision the tool asks for is which colour fades out.\n\nThere is a subtlety in that keyword worth understanding. Transparent resolves to transparent black, not to your colour at zero alpha, so the interpolation runs from your colour to a clear black. Modern engines interpolate in premultiplied alpha, which removes the black and keeps the fade clean; some unusual renderers can show a grey haze partway through. Where a fade has to be exact everywhere, naming the end colour with an explicit zero alpha value is the safer form.\n\nThe dominant use is an overlay: a scrim that is opaque where it meets a caption and invisible where it meets an image. Because the output is a background value, it can be layered over anything through a background-image list or a pseudo-element, and because it reaches full transparency there is no visible seam at the bottom edge. The same shape hides the foot of a scrolling panel and softens the top edge of a coloured surface.\n\nChoosing the colour is mostly a question of what the overlay sits on. A scrim over a photograph usually takes the hue of the image's dominant tone, so the fade reads as part of the picture rather than as a panel laid over it; a fade at the foot of a coloured card usually takes the card's own colour, which keeps the dissolve invisible until it matters. Because the gradient starts at full strength, the value at the top edge is exactly the colour chosen, and any transparency in the overlay comes from how far the ramp has travelled rather than from the colour itself.\n\n- The fade runs top to bottom only, so a left-to-right scrim has to be re-angled in the copied code.\n- There is no second colour, no stop slider and no starting opacity, so the gradient always begins at full strength — a scrim that should top out at eighty percent needs a manual edit of the colour's alpha.\n\nThere is also no image handling, no preview against real content, no separate copy button per declaration and no contrast advice for whatever will sit on the overlay. What it does, it does in one pick: as a transparent gradient generator it produces a usable fade to transparent css value, and for a quick gradient fade overlay at the foot of a card or the top of an image, the copyable css overlay fade value is the entire interaction.",
    howTo: [
      { step: "Pick the colour the overlay should start from." },
      { step: "Check the panel, which shows the same top-to-bottom fade the CSS will produce." },
      { step: "Copy the declaration and apply it as a background or on a pseudo-element over the content it should scrim." },
      { step: "Edit the angle in the copied value if the fade needs to run horizontally instead." },
    ],
    whenToUse:
      "Use this when a colour has to dissolve into whatever is behind it — image scrims, fade-outs at the edge of a scrolling panel, soft edges on a coloured surface. Use the text gradient generator when the fill belongs to type rather than to a surface. When the overlay has to carry a colour at both ends, the {{gradient-overlay-generator|gradient overlay generator}} is the two-stop version with an angle, and a fade that has to be judged against real content is what the {{overlay-color-generator|overlay color generator}} previews over an image.",
    faqs: [
      {
        q: "What exactly is the generated value?",
        a: "A linear gradient at 180 degrees from your colour to the keyword transparent, printed as a background declaration with the whole value on the copy button.",
      },
      {
        q: "Why does transparent behave differently between engines?",
        a: "The keyword resolves to transparent black rather than to your colour with zero alpha. Engines that interpolate in premultiplied alpha keep the fade clean; others can introduce a grey haze, which explicit alpha avoids.",
      },
      {
        q: "Can I fade from left to right?",
        a: "Not in the tool. The angle is fixed at 180 degrees, so a horizontal scrim means editing the angle in the copied declaration.",
      },
      {
        q: "Can the fade start at partial opacity?",
        a: "No. The gradient always begins with your colour at full strength, so a softer start requires setting an alpha value on the colour by hand.",
      },
      {
        q: "Can the fade end on a second colour instead of transparency?",
        a: "Not here — the ramp always finishes fully transparent. A wash between two colours, transparent at neither end, is what the gradient overlay generator or a gradient builder produces.",
      },
    ],
  },

  "tritanopia-simulator": {
    keywords: [
      "tritanopia simulator",
      "blue cone simulation",
      "tritanopia hex",
      "blue yellow color blindness",
    ],
    intro:
      "Tritanopia Simulator shows a color beside the same color as a tritanopic viewer would see it, modelling the rarer blue-yellow deficiency.",
    content:
      "Tritanopia Simulator renders a color and its tritanopic simulation side by side, in the same large two-swatch layout the other single-deficiency pages use. It is the page to reach for when a design depends on blue and yellow, which is the axis the two common red-green deficiencies leave untouched.\n\nTritanopia is the absence of the short-wavelength cone, and it behaves differently enough from the red-green deficiencies that it is worth understanding on its own terms:\n\n- Blue and yellow converge, so a blue and a green can become difficult to separate while red stays comparatively distinct.\n- Blue darkens, in the same way red darkens under protanopia, because the cone being removed contributes luminance at that end of the spectrum.\n- Yellow is affected as well, which is why the deficiency is described as a blue-yellow condition rather than a blue one.\n- It is far rarer than the two red-green types, so a palette that is only tested for those can still fail a small but real group of viewers.\n\nThe simulated color is produced by a fixed three-by-three matrix over the 8-bit red, green and blue channels. Its first row is 0.95 red plus 0.05 green, its second is 0.433 green plus 0.567 blue, and its third is 0.475 green plus 0.525 blue, with the outputs clamped inside the 0 to 255 range and written out as hex. Note how little the red channel changes: the transformation is concentrated in the green and blue rows, which is the arithmetic reason the red-green axis survives better than the blue-yellow one here. As with the other pages, the matrix approximates the deficiency and is applied at full strength.\n\nA few things sit outside this page.\n\n- One deficiency only, with no combined view and no image simulation.\n- A single color per comparison, so a palette takes one pass per entry.\n- No severity control, which matters because acquired tritan-like deficiencies are often partial rather than complete.\n- The output is a model, not a prediction about a particular viewer.\n- No export beyond copying the hex value that is printed.\n\nUse it whenever blue and yellow are doing structural work: a two-series chart, a warm and cool status pair, or a gradient that runs from blue to yellow as a way of showing magnitude. Read the simulated swatch for two things, whether it has moved toward the greens in your set, and whether it has lost enough lightness to merge with its background. Both are common failures in this deficiency, and both are easier to correct by separating lightness than by searching for a hue that survives.\n\nThis is a blue cone simulation and nothing more, which is worth saying because the page is easy to over-read. The tritanopia hex value under the simulated swatch is what you take away from it, together with a view of how far a blue has moved. Set beside the more familiar red-green checks, it also makes the case for treating blue yellow color blindness as its own problem: a design can pass every red-green review and still lean on a blue and a yellow that this conversion pushes close together.",
    howTo: [
      { step: "Enter the color you want simulated in the swatch field." },
      { step: "Compare the original swatch with the tritanopic simulation beside it, looking at blues and yellows in particular." },
      { step: "Read the hex value printed under the simulated swatch to record how the color was changed." },
      { step: "Check whether the simulated result has drifted toward the greens or lost lightness against the surfaces it will sit on." },
    ],
    whenToUse:
      "Use the tritanopia simulator when blue and yellow carry meaning in a chart, a gradient or a status pair, since that is the axis this deficiency attacks and the one the red-green tools do not cover. Charts that depend on several hues benefit from the full {{color-blindness-simulator|color blindness simulator}}, blue-heavy palettes are worth checking against the {{palette-accessibility-checker|palette accessibility checker}}, and choosing text colors that survive any of these conversions is the {{color-blind-friendly-color-picker|color blind friendly color picker}}.",
    faqs: [
      {
        q: "How rare is tritanopia compared with the other deficiencies?",
        a: "It is much rarer. The two red-green forms each affect about one in a hundred men, while the blue-yellow form is far less common. It is still worth checking, because a design that leans on blue and yellow can fail badly for that smaller group.",
      },
      {
        q: "Why does the red channel barely change in this simulation?",
        a: "Because the deficiency is at the short-wavelength end, so the matrix concentrates its effect in the green and blue rows, where the red contribution is minimal. That is why reds generally stay recognisable while blues and yellows shift.",
      },
      {
        q: "Can blue and green really become confusing?",
        a: "Yes. Removing the short-wavelength cone pushes blue toward the middle of the spectrum, so a blue and a green in the same chart can end up close in both hue and lightness. Separating them by lightness is the usual remedy.",
      },
      {
        q: "Does the simulation cover the acquired forms of the condition?",
        a: "Only in shape, not in severity. The matrix is applied at full strength, while acquired blue-yellow loss is often partial and can differ between the two eyes, so this page shows a complete case rather than the range.",
      },
      {
        q: "Should I test a gradient with this page?",
        a: "Test its endpoints. The matrix converts colors rather than samples, so applying it to the two ends of a blue-to-yellow gradient tells you where the ramp will land. Intermediate stops can be checked the same way if the gradient carries meaning.",
      },
    ],
  },

  "ui-component-contrast-checker": {
    keywords: [
      "ui component contrast checker",
      "non-text contrast",
      "3 to 1 component contrast",
      "button contrast",
    ],
    intro:
      "UI Component Contrast Checker measures the color of a component boundary against the surface behind it and judges the pairing at 3 to 1, the non-text contrast requirement.",
    content:
      "UI Component Contrast Checker measures a component's color against the surface it sits on and reports the ratio to two decimal places, judged against a fixed 3 to 1 gate. It exists because a boundary is not text. A button fill, an input outline or a checked checkbox has to be distinguishable from its surroundings, but none of them has to be readable as a glyph, so the requirement is different and the sample shown here has to be different too.\n\nThe requirement this page tests comes from the non-text contrast rule in WCAG 2.1, which asks for 3 to 1 across the pieces of interface that carry meaning:\n\n- Component boundaries, meaning the fill, border or outline that makes a control recognisable as a control.\n- State indicators, such as the track of a toggle or the border of a selected card.\n- Graphical objects, including the lines and areas a chart uses to convey its data.\n- The focus indicator around an interactive element, which is close enough in kind to share the same figure but has its own dedicated check.\n\nThe second panel draws a component sample rather than a paragraph: a filled button on the chosen background, with the label set in the background color over the component color. That reversal is deliberate, because it shows the pair from both directions at once. The ratio itself is the standard WCAG 2.x contrast calculation, with each color converted to sRGB, its channels linearised, and the three linear values weighted 0.2126 red, 0.7152 green and 0.0722 blue into a relative luminance, before the lighter plus 0.05 is divided by the darker plus 0.05.\n\nWhat a single boundary check cannot cover is worth stating clearly.\n\n- The label inside the component is a separate requirement. A button fill can pass at 3 to 1 while the text on it fails at 4.5 to 1, and this page will not tell you that.\n- One pair is measured at a time. Hover, active, disabled and selected states are each their own pair and each needs its own check.\n- The component has no size. A 1px hairline border and a large filled area are treated identically, though they read very differently.\n- The page cannot know which pixels of your real component are load bearing, so it can only evaluate the colors you give it.\n- No alpha, and no third surface behind the pair.\n\nUse this check on button fills, input and textarea borders, checkbox and radio outlines, toggle tracks, tab indicators and any chart line or area that carries information. Pair it with the ordinary text check for the label sitting inside the component, and with the focus check for the ring that appears when the control is reached by keyboard.\n\nThe 3 to 1 component contrast requirement is easy to mistake for a soft target, because most brand fills clear it without help. Where it bites is at the edges of a design system: a hairline divider that carries grouping, a disabled state almost the same tone as the surface beneath it, or an outline that vanishes when the card it sits on changes color. Auditing the button contrast of every state rather than only the resting one is the cheapest way to catch those, since state colors are usually derived after the base fill has already been approved.",
    howTo: [
      { step: "Set the component or indicator color in the first field, which is labelled Indicator rather than Foreground." },
      { step: "Set the surface behind the component in the second field." },
      { step: "Read the ratio at the top of the second panel, to two decimal places." },
      { step: "Check the Pass or Fail line against the 3 to 1 threshold, then read the button sample to see the pair from both directions." },
    ],
    whenToUse:
      "Use the UI component contrast checker for any boundary that has to be distinguishable rather than readable: button fills, input outlines, toggle tracks, tab indicators and informative chart strokes. Text inside those components belongs with the {{wcag-21-aa-checker|WCAG 2.1 AA checker}}, the ring that appears on keyboard focus belongs with the {{focus-indicator-contrast-checker|focus indicator contrast checker}}, and mixed palettes where several boundaries are in play are easier to audit with the {{palette-accessibility-checker|palette accessibility checker}}.",
    faqs: [
      {
        q: "Why is a component boundary allowed 3 to 1 when text needs 4.5 to 1?",
        a: "The two requirements measure different things. Text has to be legible as shapes, which needs more separation, while a boundary only has to be distinguishable from its surroundings. WCAG 2.1 sets 3 to 1 for the pieces of an interface that carry meaning and 4.5 to 1 for ordinary text.",
      },
      {
        q: "Does a passing boundary make the text on top of it accessible?",
        a: "No, they are independent. The 3 to 1 figure describes the component against its surface. The label's own contrast is measured between the label color and the component fill, and it needs 4.5 to 1 at ordinary sizes.",
      },
      {
        q: "Which states do I need to check for the same button?",
        a: "Every state that changes a color. Default, hover, active, disabled, selected and dark-mode variants are separate pairs, and each has to clear the threshold on its own. A button that passes at rest can easily fail on hover.",
      },
      {
        q: "Does a shadow count as the component boundary?",
        a: "A shadow is an effect rather than the boundary itself, so a component identified only by a soft shadow is a poor candidate for a 3 to 1 measurement. Give the control a defined fill or border and check that instead.",
      },
      {
        q: "Can I use this for a chart line?",
        a: "Yes. Lines and areas that carry the data are graphical objects under the same requirement, so each series color should reach 3 to 1 against the chart background. Series against each other is a separate problem this check does not address.",
      },
    ],
  },

  "vintage-retro-palette-generator": {
    keywords: [
      "vintage retro palette generator",
      "muted retro colors",
      "faded print palette",
      "retro color scheme",
    ],
    intro:
      "The vintage retro palette generator builds five colours from a fixed run of faded hues — a burnt orange, a maroon, a mustard, a teal and a dusty pink — along a lightness ramp from 0.4 to 0.7.",
    content:
      "Ageing a palette is mostly a matter of chroma and warmth, and the vintage retro palette generator applies both to a fixed set of hues: 30, 10, 60, 200 and 350 in order, a lightness ramp from 0.4 at the first swatch to 0.7 at the last, and chroma rolled between 0.08 and 0.16. The mixture is what does the work — warm browns and mustards alongside a teal and a dusty pink, which is the colour language of printed packaging and mid-century posters rather than of screens.\n\n- Hues: burnt orange at 30, maroon at 10, mustard at 60, teal at 200 and dusty pink at 350.\n- Lightness: 0.4, 0.475, 0.55, 0.625 and 0.7 across the strip.\n- Chroma: rolled per swatch inside 0.08 to 0.16, which keeps every value short of full saturation.\n- Output: five hex swatches and a copyable CSS custom-property block from --color-1 to --color-5.\n\nThe teal matters more than its single slot suggests. Without it the palette would collapse into one warm family and read as sepia rather than as retro; a single cool note gives the eye something to compare against and makes the warm values look deliberately faded rather than merely old. That is also why muted retro colors work best in a layout that gives the cool slot real estate — as a background, a panel or the colour of one important element — rather than hiding it among four warm swatches.\n\n- Only five hues, fixed: no greens, no purple and no true neutral for text.\n- The darkest value sits at lightness 0.4, so a deep ink tone still has to come from elsewhere.\n- Low chroma at low lightness means several pairs inside the palette have little contrast between them; measure before using two of them together.\n- No preset selector, no transparency, and no export beyond the hex tokens.\n\nTreating it as a retro color scheme rather than as a historical reproduction is the most useful stance: the intent is the impression of age, and five values in a low-chroma, warm-dominant register produce that impression without depending on any particular decade. The same stance makes the palette easy to extend, because a sixth colour chosen from the same register will sit correctly beside the preset — rarely true of a palette copied out of a photograph.\n\nThe honest framing is that this is a faded print palette rather than a photographic one. It will not reproduce a particular era's packaging exactly, and it is not sampled from any archive; it is a set of hues in a register that reads as age. Use it for brand work that should feel made rather than rendered, for editorial surfaces, and for seasonal campaigns where warmth beats brightness. The earth-tone generator is the quieter, more neutral version of the same instincts, the sunset generator takes the warmth up to full saturation, and the shades tools supply the deep tone this preset leaves out.",
    howTo: [
      { step: "Open the page for the first roll of the faded set." },
      { step: "Press Regenerate to re-roll chroma while the hue order and the lightness ramp stay fixed." },
      { step: "Copy the custom-property block for a token file, or lift individual hex values." },
      { step: "Give the single cool swatch somewhere to be seen; the palette reads as retro because of it." },
    ],
    whenToUse:
      "Use this when a palette should look printed rather than rendered. The {{earth-tone-palette-generator|earth palette generator}} is the quieter take on warmth, the {{sunset-palette-generator|sunset palette generator}} is the saturated one, and the {{wes-anderson-style-palette|Wes Anderson palette}} is the same period instinct at much higher lightness.",
    faqs: [
      {
        q: "Why does a single cool colour appear among the warm ones?",
        a: "Because it is what stops the palette reading as sepia. One teal gives the eye a reference point, and the warm values then look deliberately faded rather than simply brown.",
      },
      {
        q: "What changes when I regenerate?",
        a: "Chroma only, rolled within 0.08 to 0.16 per swatch. The five hues, their order and the lightness ramp are fixed by the preset.",
      },
      {
        q: "Why is the palette not more saturated if it is meant to look retro?",
        a: "Because saturation is what makes a palette look modern. Printed ink on paper, and screenshots of it decades later, sit in a narrow chroma band; keeping chroma low is what produces the effect.",
      },
      {
        q: "Is there a dark tone for text in the set?",
        a: "No. The ramp starts at 0.4, which is a mid-dark surface rather than an ink tone, so a text colour still has to be chosen separately.",
      },
      {
        q: "Does the CSS block include anything but hex values?",
        a: "No, just the five custom properties and a copy button. Roles, theme overrides and contrast notes are added by hand.",
      },
    ],
  },
};
