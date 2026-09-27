import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 33 (manipulation + gradients + effects + css).
 *
 * Only tools whose logic is correct (audit verdict "Y") are authored here.
 * Tools flagged "P"/"N" in the functional audit are deliberately excluded.
 */
export const SEO_BATCH_33: Record<string, ToolSeo> = {
  "color-temperature-adjuster": {
    keywords: [
      "color temperature adjuster",
      "make color warmer or cooler",
      "shift color temperature",
      "warm up a color online",
    ],
    intro:
      "The color temperature adjuster shifts any color warmer or cooler by a controlled degree — nudging hue toward amber or blue while keeping the color recognisably itself.",
    content:
      "A color can be right in every coordinate and still wrong in temperature — the blue that reads cold next to a warm brand, the off-white that fights a sunset photograph. The color temperature adjuster fixes exactly that: set a color, move a slider, and the hue shifts toward warm amber or cool blue by controlled degrees while lightness and chroma hold steady. The result is the same color with its temperature turned — recognisably itself, one degree warmer or cooler.\n\n- The controlled part is what separates an adjuster from a repaint.\n- Because the shift walks the hue wheel in small steps, you can move by a whisper — the two-degree warm-up that makes a grey feel friendly — or by a stride, and every intermediate value is a legitimate color rather than a jump.\n- Lightness and chroma stay fixed throughout, so the adjustment changes only the question being asked: nothing about the color's weight or intensity moves while its warmth does.\n\nThe typical assignments: neutralising a palette whose members drifted apart in temperature — one pass with the adjuster and the greys agree again; warming a cold-feeling accent without abandoning it for a new hue; cooling a shadow color so it sits behind a warm subject without competing; and the endless white-balance theatre of landing an off-white that finally feels right against its neighbors. The temperature analyzer numbers the journey — check the Kelvin before and after — and the warm-to-cool shifter does the same job framed as direction of travel rather than degree.\n\nTemperature changes rarely happen in isolation. A warm gold on a marketing page usually needs a cooler companion for the functional interface, and a cool brand blue is often too clinical for a photography-led surface, so watching one swatch move while the relationship between the two stays visible is what keeps the decision honest. It is worth knowing how this differs from a saturation change, because the two are often confused. Desaturating makes a colour feel quieter and greyer; warming makes it feel nearer and more tactile, and the pair can be combined when a swatch needs to feel calmer and warmer at once. The direction to commit to is easier to judge against real content than on the swatch itself, since the surrounding surfaces tint the impression more than the isolated patch suggests. Dial one step at a time, apply it to the mock, and keep the version that reads as intended.\n\nKeeping a record of the original value matters as much as the new one, because a warm adjustment made for one surface can look overdone on the next, and stepping back a notch is usually cheaper than beginning the search again.\n\n- As a make color warmer or cooler instrument, the contract is one axis, finely controlled: shift color temperature without touching anything else.\n- For a warm up a color online task that keeps the original hue family intact — rather than reaching for a different color entirely — that narrow contract is precisely the tool for the job.",
    howTo: [
      { step: "Set the color whose temperature needs adjusting." },
      { step: "Move the slider toward warm or cool; the hue shifts in controlled steps, tone unchanged." },
      { step: "Stop when the temperature sits right against its neighbours, then copy the hex." },
    ],
    whenToUse:
      "Use this to nudge temperature while keeping everything else fixed. Use the temperature analyzer to measure before and after, the warm-to-cool shifter when you want the journey framed as direction, and the hue shift tool when any hue movement — not just warm-cool — is wanted. The {{warm-to-cool-color-shifter|warm-to-cool shifter}} frames the same shift as a flip between the two ends, and the {{hue-rotator|hue rotator}} exposes the rotation as a signed number.",
    faqs: [
      {
        q: "Does adjusting temperature change the color's lightness or vividness?",
        a: "No — the slider moves hue only, toward amber or blue. Lightness and chroma stay fixed, so weight and intensity are untouched.",
      },
      {
        q: "How large a shift is possible?",
        a: "The slider spans a controlled warm-to-cool range; small steps make subtle nudges, large steps approach a genuinely different color — the preview shows you when you have crossed the line.",
      },
      {
        q: "Can I adjust a neutral grey?",
        a: "Yes — that is a classic use. Greys pick up temperature from hue remnants; warming or cooling a near-neutral is how off-whites are tuned to sit with a palette.",
      },
      {
        q: "How is this different from hue shift?",
        a: "Hue shift moves around the whole wheel in any direction; this tool constrains movement to the warm-cool axis, which is usually the actual adjustment a temperature problem needs.",
      },
      {
        q: "Does the shift preserve lightness and saturation?",
        a: "Yes. The rotation happens in OKLCH, so hue is the axis that moves while lightness and chroma stay where they were — which is what keeps a temperature correction from turning into a different colour altogether.",
      },
    ],
  },

  "warm-to-cool-color-shifter": {
    keywords: [
      "warm to cool color shifter",
      "cool down a warm color",
      "shift color from warm to cool",
      "temperature flip tool",
    ],
    intro:
      "The warm-to-cool color shifter moves a color across the temperature divide — from its warm reading to a cool counterpart, or back — with the shift visible as you slide.",
    content:
      "Every warm color has a cool shadow-self: the coral that becomes a slate pink, the golden sand that becomes a grey-blue. The warm-to-cool color shifter walks a color across that divide — set the starting value, slide toward cool or toward warm, and watch the temperature flip happen in visible steps rather than as a jump between two unrelated colors.\n\n- The framing is the tool's identity.\n- The temperature adjuster treats warmth as a dial with a middle; this shifter treats it as a journey with two destinations — the question is not how warm but which side, and how far across.\n- That framing fits the assignments where temperature is binary: a brand palette that needs a cool variant of its warm anchor for a winter campaign; an interface whose sidebar must cool down behind content that stays warm; an illustration whose palette reads too fireside when the scene moved outdoors.\n- In each case the job is a shift color from warm to cool passage — recognisable origin, deliberate destination — and the slider's path guarantees continuity between the two.\n\nBecause the shift keeps lightness and chroma steady while the hue crosses the divide, the result inherits the original's weight and personality — a warm mid-tone arrives as a cool mid-tone, not as a washed-out blue or a darkened navy. That is what makes the output useful in systems: the cool counterpart slots into the same tonal slot the warm original occupied, and the palette keeps its structure while its temperature story changes.\n\nA temperature flip is one of the most useful single moves in palette work, because it changes mood without changing identity: the value stays in its place, the lightness stays where it was, and only the axis underneath rotates, which is why a set re-tempered this way still reads as the same family. That property makes a warm to cool color shifter useful for building a light and a dark register from one palette — warm the light side, cool the dark side, and the two look like deliberate siblings rather than two unrelated sets. Stepping through the sequence rather than jumping end to end is the other useful habit, since the intermediate values often suit surfaces better than either extreme: a slightly cooled mid tone can be exactly the neutral an interface was missing. Think of it as a temperature flip tool that also produces everything along the way, and the intermediate values become worth keeping rather than a byproduct of the journey.\n\n- As a cool down a warm color instrument — and the return trip too — the tool is one color, one axis, visible steps.\n- The temperature adjuster offers finer control around a fixed point; the analyzer numbers both ends of the journey; and for palettes needing the whole set shifted together, the member colors each take one pass through this shift color from warm to cool tool.\n\nRecord both ends of every journey, since a palette that documents its warm and cool variants is easier to extend later than one that only remembers its current state.",
    howTo: [
      { step: "Set the starting color on whichever side of the divide it lives." },
      { step: "Slide toward the opposite temperature; watch the hue cross in visible steps." },
      { step: "Stop when the cool (or warm) counterpart reads right, and copy the value." },
    ],
    whenToUse:
      "Use this when a color must cross the temperature divide deliberately — seasonal variants, campaign shifts, palette correction. Use the temperature adjuster for fine nudges near a fixed point, and the analyzer to verify the Kelvin before and after. The {{color-temperature-adjuster|temperature adjuster}} applies the same shift as a continuous correction, and the {{color-temperature-analyzer|temperature analyzer}} puts a Kelvin figure on where the result lands.",
    faqs: [
      {
        q: "Will the shifted color keep the original's weight?",
        a: "Yes — lightness and chroma are held while hue crosses the divide, so a warm mid-tone arrives as a cool mid-tone and slots into the same role.",
      },
      {
        q: "Can I shift only partway across?",
        a: "The slider is continuous — every intermediate temperature is available, so a half-crossed reading that leans cool without abandoning warmth is a valid stopping point.",
      },
      {
        q: "How is this different from the temperature adjuster?",
        a: "Same underlying axis, different framing: the adjuster nudges around a fixed point, this shifter frames the movement as a journey between the warm and cool destinations.",
      },
      {
        q: "Can I shift a whole palette at once?",
        a: "Run each member through individually — or for palette-level temperature work, the warm-cool analyzer first shows which members sit on which side.",
      },
      {
        q: "Does it keep the original value anywhere?",
        a: "No. The shift replaces the colour in place and there is no history or saved original, so record both ends of the journey by hand when the palette has to document its warm and cool versions.",
      },
    ],
  },

  "hsl-channel-adjuster": {
    keywords: [
      "hsl channel adjuster",
      "adjust hue saturation lightness",
      "hsl slider tool",
      "edit hsl channels independently",
    ],
    intro:
      "The HSL channel adjuster exposes the three channels separately — hue, saturation and lightness each with its own slider — so you can edit HSL channels independently and see exactly which one a color needs.",
    content:
      "- Most color pickers mix the three decisions into one gesture: drag inside a gradient and hue, saturation and lightness all move at once.\n- The HSL channel adjuster pulls them apart — three sliders, one per channel, each showing its current value — so an adjustment becomes a statement about a single axis: this color needs more lightness, and nothing else.\n\nThe discipline pays off in the fixes that one-axis thinking enables. A logo color that must stay the same hue but read lighter is a lightness slider move and nothing more; a palette member that is vivid enough but too green is a hue-only correction; a set whose members feel inconsistent is often one channel — all need the same saturation — and three sliders per color makes that pattern visible and fixable. Because each channel displays its numeric value, adjustments become reproducible: a five-point hue shift or a ten-point lightness lift is a specification, not a vibe, and can be applied to the next color identically.\n\nThe HSL model's shape is worth knowing while using it. Hue is circular — 360 degrees around the wheel — so its slider wraps; saturation runs from grey to vivid; lightness runs black through the pure hue to white, which is why its extremes look unlike the middle. The model is intuitive and imperfect — equal slider steps are not quite equal to the eye — which is where the OKLCH playground earns its keep for appearance-critical work. But for the everyday vocabulary designers and CSS share, HSL is the lingua franca, and a tool that lets you adjust hue saturation lightness as separate, named decisions is the model's natural interface.\n\nHSL is an interface over RGB rather than a perceptual model, which is exactly why it is useful for hand-editing. Hue is a dial, saturation is a dial, lightness is a dial, and the effect of each is obvious from its name, so a colour can be diagnosed in the three-channel view before anything is changed: too saturated here, marginally too dark there, hue drifting a few degrees off the intended family. That diagnosis is much faster than dragging a two-dimensional picker and watching three values move together. The caveat worth carrying is that lightness in HSL is not perceived lightness, so equal steps at different hues do not look equal, and a ramp tuned only in this space looks uneven once rendered next to a sibling ramp built in OKLCH. The channel view is the right instrument for repair; the perceptual coordinates are the right one for construction, and using both in that order keeps a palette coherent.\n\n- As an hsl slider tool it is deliberately bare: three channels, live values, instant preview.\n- The single-channel specialist tools — tints, shades, saturation adjusters, hue shift — are pre-packaged versions of one slider each; this is the whole desk, for when the fix needs edit hsl channels independently rather than one at a time.\n\nReading the channels is also the fastest way to check a value somebody else wrote, because three numbers that look wrong usually are, and the offending channel is visible immediately.",
    howTo: [
      { step: "Set the hue with the first slider — the full circle runs through three hundred and sixty degrees." },
      { step: "Set saturation with the second slider, from grey at zero to the most vivid value at one hundred." },
      { step: "Set lightness with the third slider, from black through the colour to white." },
      { step: "Read the result swatch and copy its hex value." },
    ],
    whenToUse:
      "Use this when the fix is one named channel and you want it precise and repeatable. Use the specialist single-channel tools for packaged adjustments, the OKLCH playground when perceptual evenness matters, and the converter when the result must be read out in other formats. The {{rgb-channel-adjuster|RGB channel adjuster}} edits the same colour by its channel numbers, and the {{oklch-color-playground|OKLCH playground}} is the model to reach for when adjustments have to stay perceptually even.",
    faqs: [
      {
        q: "Why does the lightness slider's middle look different from its ends?",
        a: "HSL lightness runs from black through the pure hue to white, so the middle is the vivid color and the extremes are black and white — a quirk of the model the slider makes visible.",
      },
      {
        q: "Does the hue slider wrap around?",
        a: "Yes — hue is a circle of 360 degrees, so sliding past the end continues from the start. A 350-degree shift and a minus-10-degree shift are the same color.",
      },
      {
        q: "Are equal slider steps visually equal?",
        a: "Not quite — HSL is intuitive but not perceptually uniform. For appearance-critical ramps, the OKLCH playground makes steps that look even.",
      },
      {
        q: "Can I see the HSL values as numbers?",
        a: "Each slider reports its channel value live, and the color's full HSL string is readable in the converter tools for copy-paste into CSS.",
      },
      {
        q: "What do the three sliders change?",
        a: "Hue is the circular axis, running through three hundred and sixty degrees, while saturation and lightness are percentages from zero to one hundred. Each slider prints its current value, so an adjustment can be written down and reproduced, and only the moved channel changes in the result.",
      },
    ],
  },

  "opacity-layering-calculator": {
    keywords: [
      "opacity layering calculator",
      "stack semi-transparent colors",
      "rgba overlay result",
      "alpha blending calculator",
    ],
    intro:
      "The opacity layering calculator computes what a semi-transparent color becomes over a background — the solid result of alpha blending, shown as a swatch and as ready-to-paste CSS.",
    content:
      "A 50% blue over white is not blue — it is the pale sky color that blue-at-half-strength produces on that particular background, and it is a different color over every other background. The opacity layering calculator does that arithmetic for you: set the background, set the foreground with its opacity, and see the solid color the stack actually renders — as a swatch, and as the flattened hex or eight-digit CSS value you can paste in place of the transparency.\n\nThe value of computing stack semi-transparent colors explicitly is that alpha is a relationship, not a property. The same rgba overlay produces different results on white, on black, on the brand orange — which is why translucency chosen in isolation so often surprises on the page. Flattening the stack answers the real questions: what does this scrim do to the photo behind it, what solid color is this glass panel equivalent to, does the tooltip background stay legible over both the light and dark sections it will float across. The blended swatch shows the truth; the CSS output lets you bake it in when the transparency's flexibility is not needed.\n\n- The tool's blend is the standard source-over compositing the browser itself uses — foreground mixed over background weighted by alpha — so what you see is what the page will paint, not an approximation.\n- The slider spans the full 0-to-100 range, the preview updates live, and the resulting color's hex is copy-ready for stylesheets that would rather own a solid value than manage an alpha dependency.\n\nCompositing arithmetic is the reason opacity surprises people. A fifty per cent black over white does not land halfway to a neutral grey of the same perceived weight; it lands at a specific value that then behaves differently again when the surface behind it changes. Stacking makes this worse, because the order of layers matters as much as their values: two overlays applied in one sequence give a different result from the same two applied in the other. Those are the cases that break a design system quietly, when a translucent surface takes on the wrong tint over a photograph and nobody can say which layer was responsible. Reading the blended value directly removes the guesswork and turns a composition question into a palette question: once the flattened result is known, the surface either works with the text colour or it does not. Check the flattened value first, then the stack behind it.\n\n- As an alpha blending calculator it is deliberately a two-layer instrument: one background, one foreground, one result.\n- Chains of translucency can be flattened iteratively — compute the inner pair, use the result as the next background — and for overlays on images specifically, the overlay generator previews blend modes that go beyond plain transparency.\n- For the honest question of what rgba overlay result a stack produces, though, this is the ground truth.\n\nKeep the flattened values with the palette: a translucent surface that has been checked once does not need checking again on every new screen, and the recorded value settles the next argument before it starts.",
    howTo: [
      { step: "Set the background color the layer sits on." },
      { step: "Set the foreground color and its opacity percentage." },
      { step: "Copy the flattened result — as a swatch hex or as ready CSS." },
    ],
    whenToUse:
      "Use this to know what a translucent stack really renders as — scrims, glass panels, floating surfaces. Use the overlay generator for image overlays with blend modes, the frosted glass generator for backdrop-filter treatments, and the color on background preview for opaque pairs. The {{opacity-calculator|opacity calculator}} produces the same flattened value with an explicit alpha notation, and the {{overlay-color-generator|overlay color generator}} handles overlays that use blend modes rather than plain alpha.",
    faqs: [
      {
        q: "Why does the same rgba look different on different backgrounds?",
        a: "Alpha blending is a relationship: the foreground mixes with whatever is behind it. The same translucent layer flattens to different solids on white, black or brand colors — which is exactly what the calculator shows.",
      },
      {
        q: "Is the result what the browser will actually paint?",
        a: "Yes — the tool uses the same source-over compositing browsers use, so the swatch is the true rendered result, not an estimate.",
      },
      {
        q: "Can it flatten three or more layers at once?",
        a: "Not in one pass, but iteratively: compute the bottom pair, then use the flattened result as the next layer's background.",
      },
      {
        q: "Why would I bake the flattened value instead of keeping the alpha?",
        a: "Keep alpha when the layer must adapt to changing backgrounds; bake the solid when the background is fixed and you want one fewer moving part in the stylesheet.",
      },
      {
        q: "Why does the same overlay look different on another background?",
        a: "Because alpha is a relationship rather than a property: a fifty per cent blue over white renders as a pale sky, and the identical declaration over black or over a brand orange renders as two other colours. The tool flattens the pair you set, so each background has to be computed separately.",
      },
    ],
  },

  "color-monochromatic-finder": {
    keywords: [
      "color monochromatic finder",
      "monochromatic palette from one color",
      "single hue color scheme",
      "one color palette generator",
    ],
    intro:
      "The color monochromatic finder derives a five-step palette from one color — the same hue throughout, lightness doing all the work — for the cleanest scheme color theory offers.",
    content:
      "Monochromatic is the scheme with one rule and no exceptions: take a single hue and vary nothing but its lightness. The color monochromatic finder applies that rule from any base — set a color, and the tool returns the five-step family: two darker steps, the original, two lighter, each the same hue and chroma as the base, separated by even lightness intervals. It is the one color palette generator whose output is guaranteed to cohere, because coherence is not designed but inherited.\n\n- The guarantee is the scheme's power.\n- Every swatch shares the base's temperature, personality and association; nothing in the set can clash, because nothing in the set is different except its weight.\n- That makes monochromatic the safest strong statement in design — a brand color expressed as a whole system, a moody photograph's palette formalised, an interface that wants its accent color to be the architecture.\n- The even steps are what make it functional as well as safe: equal lightness intervals mean the family distributes cleanly across surface, border, text and accent roles without one step crowding another.\n\n- The scheme's known limitation is the mirror of its strength: with hue fixed, all hierarchy is tonal, and low-chroma bases can drift toward grey at the extremes.\n- The remedies are the standard ones — verify text-carrying pairs with the contrast checker, extend the ramp with the shades and tints tools when five steps are not enough, and if the family feels flat, the saturation adjusters can give the whole register a nudge without breaking the single-hue promise.\n\nOne hue carried through every value is the most reliable palette there is and the hardest to make interesting, and the finder's value is that it makes the constraint explicit. With a single hue as the only variable, hierarchy has to come from lightness and area alone, so a monochromatic interface lives or dies on how well its ladder is spaced and how honestly its surfaces are separated. The upside is that nothing fights: there is no harmony to get wrong, no second hue to tune against a brand colour, and the palette survives translation into print, greyscale, dark mode and a mediocre projector without losing its structure. Product work that has to be legible under every condition benefits most, because a single-hue set carries text, buttons, states and charts while the eye is never asked to interpret a hue it has not seen before.\n\nAs a source of a monochromatic palette from one color, the finder sits between the raw expansion of the single-color-to-full-palette tool — same construction, different framing — and the harmony generators that introduce second hues. When the brief calls for a single hue color scheme with zero risk and maximum identity, this is the scheme and this is the tool.\n\nExtend the ladder with the tints and shades tools when a surface needs a step the ramp does not carry, and check the extremes against the text that will sit on them, since a single-hue palette has no second colour to fall back on when contrast fails.",
    howTo: [
      { step: "Set the base color whose family you want." },
      { step: "Read the five-step ramp — same hue throughout, even lightness steps." },
      { step: "Assign roles by lightness, verifying text pairs with the contrast checker." },
    ],
    whenToUse:
      "Use this for a single-hue system built from a color you must keep. Use the shades and tints tools to extend the ramp, the single-color-to-full-palette tool for the same idea framed as expansion, and the harmony generators when a second hue becomes welcome. The {{color-shades-generator|shade generator}} and {{color-tints-generator|tint generator}} extend the same ladder in one direction each, and the {{color-tones-generator|tone generator}} drains chroma instead of moving lightness.",
    faqs: [
      {
        q: "Does monochromatic mean shades of grey?",
        a: "No — it means one hue at varied lightness. A monochromatic blue palette spans navy to powder blue, all the same hue; only an achromatic scheme is grey.",
      },
      {
        q: "Why do the light steps look washed out on low-chroma colors?",
        a: "Chroma is inherited from the base, and pale colors amplify softness. If the top end needs presence, raise chroma deliberately — or choose a more saturated base.",
      },
      {
        q: "How is this different from the tints and shades tools?",
        a: "Same underlying ramp; this tool presents the complete five-step family at once as a scheme, while those generate one direction — darker or lighter — at your chosen step count.",
      },
      {
        q: "Can the scheme carry all text roles?",
        a: "Usually yes — the ramp's lightness span typically includes a passing text pair. Verify the specific pair with the contrast checker before committing.",
      },
      {
        q: "How many swatches come back, and which is the base?",
        a: "Five: the base in the middle with lightness steps of plus and minus fifteen and thirty percent either side, clamped where the range runs out. Hue and chroma are held, so every swatch shares the base's temperature.",
      },
    ],
  },

  "linear-gradient-generator": {
    keywords: [
      "linear gradient generator",
      "css linear gradient maker",
      "two color gradient tool",
      "angled gradient css",
    ],
    intro:
      "The linear gradient generator builds two-stop linear gradients with live angle control — drag the angle, set the colors, copy the CSS the browser will render.",
    content:
      "- The linear gradient generator takes the classic two-stop case and makes both of its decisions explicit: a colour field for each stop, and a single angle slider spanning the full 360 degrees.\n- A large live preview fills the panel above the controls, so the blend is judged as the browser paints it rather than in a separate swatch.\n- Underneath, one copy-ready line carries the exact linear-gradient declaration the preview is rendering — no translation step between the tool and the stylesheet.\n\nAngle is the axis most tools treat carelessly, and this one does not: the slider talks degrees the way CSS does — 0deg pointing up, 90deg pointing right, clockwise throughout — so the number you set is the number the stylesheet needs. The preview updates continuously as the angle drags, which is how you find the direction a design actually wants: not by reasoning about vectors but by watching the blend sweep until it settles. Stop positions are fixed at the extremes for the pure two-color case — the hard-stop and multi-stop tools open up interior positioning when a gradient needs more architecture.\n\nThe workflow the tool is built for is the fast one: set two colors, sweep the angle, copy. It is the right instrument for the vast population of gradients that are exactly this — a button fill, a banner wash, a card background — and the wrong one for gradient work that needs three or more stops, radial geometry or conic sweeps; the specialized generators cover those. The gradient previewer accepts hand-written CSS for editing existing values, and the exporters go beyond CSS to SVG and canvas when the gradient must leave the browser.\n\nThe two-stop gradient is the workhorse of the family and the one most often done badly, usually by eye. Two problems recur. The first is banding: interpolation through sRGB can produce a dull, grey-brown middle on a saturated pair, which is the sign that the interpolation space should be a perceptual one — a nuance the preview makes visible and a hex guess never does. The second is angle, because the same pair at the same length reads as completely different lighting depending on whether the axis runs top to bottom or across the corner, and a few degrees of rotation often changes which end the eye reads as the light source. Trying three or four angles against real content, rather than the same swatch box, is what settles which one the composition actually wants.\n\nAs a css linear gradient maker it is the definition of scoped: a two color gradient tool with an angled gradient css output that is exactly honest — what the preview shows is what the copy produces, and nothing in between needs trusting.\n\nBuilding the blend from the palette rather than from the picker is the habit worth keeping, because a two-stop gradient assembled from two existing values inherits the palette's relationships instead of introducing a pair that has to be justified later. Test it at the size it will render, too: a band that looks smooth in a thumbnail can band visibly across a full-width hero.",
    howTo: [
      { step: "Set the start and end colors in the two fields." },
      { step: "Drag the angle slider until the direction reads right in the live preview." },
      { step: "Copy the CSS line — it is the exact declaration the preview is rendering." },
    ],
    whenToUse:
      "Use this for the classic two-stop linear gradient. Use the multi-stop builder for interior positioning, the radial and conic generators for other geometries, and the hard-stop generator when the blend should be a crisp boundary instead. When the degree value itself needs explaining, the {{gradient-angle-calculator|gradient angle calculator}} spells the same angle in turns, radians and its nearest keyword; when a value already exists and you want to look at it without rebuilding it, the {{gradient-previewer|gradient previewer}} renders it.",
    faqs: [
      {
        q: "How do CSS gradient angles work here?",
        a: "As CSS defines them: 0deg points up, 90deg points right, and values increase clockwise. The slider and the output use the same convention, so the copied number is exact.",
      },
      {
        q: "Can I position the color stops?",
        a: "The pure two-stop version pins them at the extremes; for interior positions, the multi-stop builder gives each stop its own percentage.",
      },
      {
        q: "Why does the preview look slightly different from my site?",
        a: "If colors match and CSS matches, rendering matches — differences usually come from the surrounding surface or color profile. The copied declaration is standard CSS either way.",
      },
      {
        q: "Can I get the gradient as SVG or an image?",
        a: "The dedicated exporters output SVG, canvas code and PNG; this generator stays CSS-only by design.",
      },
      {
        q: "Do the copied stops carry their positions?",
        a: "Yes — each stop is written out with an explicit percentage, so a two-stop ramp arrives as 0% and 100% rather than as bare colours. That makes the declaration easy to edit later: change a number and the stop moves without you having to add positions first.",
      },
    ],
  },

  "hard-stop-gradient-generator": {
    keywords: [
      "hard stop gradient generator",
      "sharp gradient boundaries",
      "stripe gradient css",
      "no blend gradient tool",
    ],
    intro:
      "The hard-stop gradient generator builds gradients whose stops touch — sharp boundaries instead of blends — for stripes, segments and stepped fills in pure CSS.",
    content:
      "Most gradients exist to blend; the hard-stop gradient exists to refuse. When two stops share a position, the gradient produces no transition at all — an instant switch from one color to the next — and that refusal is the raw material of CSS stripes, segmented progress bars, stepped backgrounds and the crisp color-block effects that blends cannot make. The hard-stop gradient generator builds those: set the colors, set the boundary positions, and the preview shows the sharp-edged result with the CSS ready to copy.\n\n- The technique inverts normal gradient intuition: an ordinary two-stop gradient blends across the whole span, while placing both stops at 50% compresses the transition to zero width and turns a gradient into a boundary.\n- Add more touching pairs and the result is a stripe pattern — as many bands as the stops define, every edge crisp at any resolution because it is vector geometry rather than drawn pixels.\n- That is what makes a stripe gradient css approach better than sliced background images: it scales, it needs no assets, and the bands stay editable as colours and percentages.\n\n- Every stop's colour and position are set independently, so a three-stripe flag, a segmented meter or a stepped heat scale is a matter of pairing stops correctly — two per boundary, adjacent stops sharing a position.\n- The preview does the checking: touching stops that are off by a fraction render as a visible hairline of blend rather than a crisp edge.\n- Reading the finished declaration back is how the pattern gets recorded, because the stop positions are the part that has to be reproduced at another size.\n\nHard stops are the cheapest way to get several flat colours out of a single background, and they are used far less often than they deserve. Because a hard stop creates an edge rather than a blend, the technique replaces extra elements: a three-tone backdrop becomes one declaration, a striped pattern becomes one property, a progress track becomes a set of proportional bands. It is also the most predictable member of the gradient family, since nothing between the stops is interpolated and therefore nothing can band, and every value is exactly the value written. Keeping the stops on a scale — at ten, forty and one hundred per cent, say — turns the technique into something a reader can decode, because the proportions then mean something rather than reflecting a drag that happened once. Used that way, a hard stop gradient generator produces structure: dividers, gauges and backgrounds in which the boundaries are the design.\n\nAs a sharp gradient boundaries instrument, it is the specialist in the gradient family — the no blend gradient tool for when the brief says crisp. For genuine blends, the linear and multi-stop builders are the right instruments; for repeating stripe patterns specifically, CSS repeating gradients extend the same trick, and the previewer can verify those values too.\n\nRecord the stop percentages with the palette, because a pattern assembled from guessed positions is hard to reproduce at another size, while one built on a scale adapts simply by rescaling the numbers.",
    howTo: [
      { step: "Set each band's color as a stop." },
      { step: "Pair stops at shared positions so each boundary has zero width — the preview shows crisp edges." },
      { step: "Copy the CSS; the stripes are vector-sharp at any size." },
    ],
    whenToUse:
      "Use this for stripes, segments and stepped fills that must not blend. Use the multi-stop builder for genuine blends with interior positions, the linear generator for simple two-color washes, and the previewer to fine-tune hand-written values. When the structure comes first and the blending second, the {{gradient-color-stop-editor|gradient color stop editor}} works the same boundaries on a fixed horizontal axis, and if the bands should actually melt into each other, the {{multi-stop-gradient-builder|multi-stop gradient builder}} is the general form.",
    faqs: [
      {
        q: "How do I make a boundary perfectly sharp?",
        a: "Give the two colors meeting at the boundary the same stop position — the transition width becomes zero. The preview shows a hairline if the positions are even slightly apart.",
      },
      {
        q: "Do hard-stop stripes scale without blurring?",
        a: "Yes — they are vector geometry computed by the browser at display resolution, so edges stay crisp at any size, unlike sliced background images.",
      },
      {
        q: "Can the stripes repeat?",
        a: "The tool builds one explicit sequence; CSS repeating-linear-gradient extends the same construction for wallpaper-style repetition — the gradient previewer verifies those values.",
      },
      {
        q: "Why does my stripe show a faint blend line?",
        a: "The paired stops are not exactly equal — a fraction of a percent apart leaves a hairline of transition. Nudge the positions to match and the line disappears.",
      },
      {
        q: "How many stops does one crisp band need?",
        a: "Two per boundary, so a two-colour split comes to four entries — the first band's colour at 0% and again at 50%, the second band's colour at 50% and again at 100%. Every stop is written out explicitly in the declaration, so the stop count grows twice as fast as the number of stripes.",
      },
    ],
  },

  "text-shadow-color-tool": {
    keywords: [
      "text shadow color tool",
      "css text shadow generator",
      "design text shadow color",
      "glow and drop shadow for text",
    ],
    intro:
      "The text shadow color tool composes CSS text-shadows with a chosen color and geometry — offsets, blur and spread against a live preview of real rendered text.",
    content:
      "- A text shadow is four numbers and a color, and every one of them changes the personality of the type: the offset decides whether the shadow reads as depth or as a duplicate, the blur decides between crisp echo and soft glow, and the color decides everything about mood.\n- The text shadow color tool puts all four decisions on sliders with a live preview of actual rendered text — set the shadow color, drag the geometry, and the CSS updates beneath the sample.\n\nThe color deserves its place on the slider panel rather than being an afterthought, because shadow color is the difference between the technique's two great uses. A black or near-black shadow at low blur is the drop shadow — anchoring type to its surface, the classic print-derived depth cue. A saturated or lighter-than-text color at high blur is the glow — neon signage, title screens, the emphasis effect that made text-shadow famous. Between them sit the colored soft shadows of modern UI, where a tinted shadow (the surface's hue, darkened) reads more natural than plain black. The tool serves all three because the color field serves all three: any value, any blur, any offset.\n\n- The live preview does the quiet work of keeping the numbers honest.\n- Text shadows are notorious for looking different in the stylesheet than imagined — offsets that read as misprints, blurs that smear rather than glow — and watching real text update as each slider moves closes that gap.\n- The generated CSS is the browser's own syntax, offset-x, offset-y, blur, spread and color in order, copy-ready for any rule.\n\nText shadow does more work than most typography discussions admit. A short offset in a near-background colour is what makes type sit on a photograph without a scrim; a very soft, very light halo is what lets a heading survive over a busy image; a wide coloured glow is what makes an accent feel lit rather than printed. Those are three different jobs and they want three different settings, which is why the geometry and the colour deserve to be tuned together rather than borrowed from a preset. The usual mistakes are geometric as well: an offset larger than the stroke width reads as a duplicate rather than a shadow, a halo with too much opacity turns into a smudge, and a shadow applied to small type simply thickens it into mud. Judging the result at the size the type will actually ship at — rather than zoomed to a comfortable preview — is what keeps glow and drop shadow for text honest.\n\nAs a css text shadow generator it covers the shadow's geometry and color completely; what it deliberately does not touch is the box-shadow world of cards and panels — the shadow and border generators handle those. For the typography-specific question — design text shadow color and geometry until the type sits right — this is the focused instrument.\n\nKeep the shadow colour inside the palette and it reads as depth rather than as an unplanned second type colour, which is usually what separates a deliberate treatment from a default one.",
    howTo: [
      { step: "Choose the shadow color — dark for depth, saturated or light for glow." },
      { step: "Set the X and Y offsets, blur and spread on their sliders against the live text preview." },
      { step: "Copy the generated text-shadow declaration into your stylesheet." },
    ],
    whenToUse:
      "Use this for shadow effects on text specifically — depth, glow, tinted soft shadows. Use the box-shadow generator for panels and cards, the border generator for outlines, and the overlay generator when the effect belongs to an image rather than type. For a shadow that has to belong to a whole surface rather than to a word, the {{box-shadow-color-tool|box shadow color tool}} is the matching tool, and a glow that needs to be judged against the surface behind it is what the {{color-overlay-generator|color overlay generator}} previews.",
    faqs: [
      {
        q: "What color should a natural drop shadow be?",
        a: "Usually a darker version of the surface color rather than pure black — it reads as ambient depth. Pick the surface's hue, darken it, and keep the blur moderate.",
      },
      {
        q: "How do I make a neon glow?",
        a: "A saturated color matching or lighter than the text, zero or near-zero offsets, and a generous blur — optionally layered, which the CSS output supports with comma-separated shadows.",
      },
      {
        q: "Why does my shadow look like a misplaced copy of the text?",
        a: "The offsets are too large for the blur — a crisp duplicate rather than a shadow. Increase blur or reduce offsets until the echo merges into depth.",
      },
      {
        q: "Does spread work on text shadows?",
        a: "Spread is part of the modern syntax this tool outputs, though support varies by browser for text specifically — the preview reflects your environment.",
      },
      {
        q: "Can the shadow be animated or transitioned?",
        a: "Yes — text-shadow is an animatable property, so the copied value can be transitioned on hover or focus like any other. The tool stops at the value itself, so the state change lives in your own rule.",
      },
    ],
  },

  "overlay-color-generator": {
    keywords: [
      "overlay color generator",
      "image overlay color css",
      "photo scrim generator",
      "color tint over image",
    ],
    intro:
      "The overlay color generator drops a translucent color over an uploaded image with selectable blend modes — the photo scrim generator for text-readable heroes and tinted imagery.",
    content:
      "- The overlay color generator exists for the failing case where text sits on a photograph and the photo fights the words; the designer's answer is an overlay.\n- Upload the image, choose the overlay colour and its opacity, pick a blend mode, and the composite updates live with the CSS recipe underneath.\n- It is a photo scrim generator that shows the truth instead of asking you to imagine it.\n\nThe blend mode selector is what lifts the tool beyond flat transparency. Plain alpha blending washes an image uniformly; blend modes interact — multiply deepens into shadows, screen lifts into highlights, overlay pushes contrast both ways, hue recolors while keeping luminance. Those behaviors are the difference between a scrim that mutes and a treatment that styles, and the selector makes them one click apart: the same color over the same photo is a different design in each mode, and the live preview is where the choice gets made. The generated CSS pairs a background layer with mix-blend-mode, so what the preview shows is exactly what the stylesheet produces.\n\nThe workflow it serves is the readability contract: a color tint over image strong enough that white text passes its contrast obligations, tuned until the photograph still reads beneath. That tuning loop — opacity down until the image breathes, up until the text passes — is exactly what live preview makes fast, and the contrast checker is the referee for the final verdict on any text that will sit on the result. For glass treatments that blur rather than tint, the frosted glass generator handles backdrop-filter; for opaque color-on-color pairs, the background preview applies.\n\nAn overlay is the least destructive way to solve a contrast problem in photography-led design, because it edits the relationship between the image and the type rather than the image itself. Flat transparency is the starting point, but the interesting range sits further along. Multiply darkens while preserving the detail underneath, screen lifts a dark image without bleaching it, and overlay and soft light tint the mid tones while leaving highlights alone, which is usually what a photographic hero needs in order to keep its depth and gain a readable band for a headline. Because the effect depends on the photograph, the settings are not portable — the same values over a different image land somewhere else — so the practical approach is to tune against the actual asset at the actual crop, then check the result with the text that will sit on top of it.\n\nAs an image overlay color css instrument it covers the layer's color, strength and interaction completely — the image color overlay workflow from upload to copyable CSS, with the blend modes doing the styling that flat opacity cannot.\n\nThe other half of the job is checking the text on top, since a hero that reads well in the mock can fail over a different crop of the same photograph — so keep the tuned layer with the asset it was tuned for rather than reusing it as a general overlay colour.",
    howTo: [
      { step: "Upload the image that will sit under the overlay." },
      { step: "Choose the overlay color, its opacity, and a blend mode — multiply for depth, screen for lift, hue for recoloring." },
      { step: "Tune until text readability and image visibility balance, then copy the CSS recipe." },
    ],
    whenToUse:
      "Use this for scrims and tints on real imagery — heroes, cards, banners. Use the frosted glass generator for blur-based glass, the opacity layering calculator to flatten a stack to a solid, and the contrast checker to certify any text that lives on the result. A scrim that has to fade rather than sit flat is what the {{gradient-overlay-generator|gradient overlay generator}} builds, and a layer that changes the image's own colours instead of covering them is the {{duotone-generator|duotone generator}}.",
    faqs: [
      {
        q: "Which blend mode should I start with?",
        a: "Multiply for darkening scrims, screen for lightening ones, plain normal with opacity for neutral washes. Hue recolors the photo while keeping its light structure — powerful for duotone-style effects.",
      },
      {
        q: "How do I guarantee text is readable on the overlay?",
        a: "Tune opacity until the composite is calm, then verify the specific text/background pair with the contrast checker — the overlay's visual mood and the WCAG verdict are separate questions.",
      },
      {
        q: "Does the tool upload my image anywhere?",
        a: "No — the image stays in your browser; the composite is rendered locally on a canvas or with CSS, and nothing is transmitted.",
      },
      {
        q: "Can I use blend modes on the image itself rather than the overlay?",
        a: "The generated CSS places the blend on the overlay layer, which is the robust cross-browser pattern; the preview reflects exactly that construction.",
      },
      {
        q: "Does the overlay change the original file?",
        a: "No — the image is displayed with the layer composited on top, and the file itself is untouched. What the tool produces is the recipe: an overlay colour, an opacity and a blend mode, ready to write into CSS.",
      },
    ],
  },

  "frosted-glass-generator": {
    keywords: [
      "frosted glass generator",
      "glassmorphism css generator",
      "backdrop blur generator",
      "frosted glass effect css",
    ],
    intro:
      "The frosted glass generator composes the glassmorphism recipe — translucent tint, backdrop blur and edge highlight — over any backdrop, with the CSS ready to copy.",
    content:
      "Frosted glass is a recipe with four ingredients, and getting any one wrong collapses the illusion: a translucent tint, a backdrop blur, a hairline highlight along the edge, and a colorful backdrop worth looking through. The frosted glass generator assembles all four — pick the glass tint and its opacity, set the blur radius, choose a backdrop color to preview against — and renders the panel live above the generated CSS. It is a glassmorphism css generator that treats the effect as the system it is.\n\nThe tint and the blur are the load-bearing pair. The tint's opacity decides how much of the backdrop survives — too little and the panel is a plain colored card, too much and the blur has nothing to soften; the blur radius decides how transformed what survives becomes. Between them sits the effect's signature: content-colored fog, the backdrop's shapes readable as soft light behind the surface. The hairline highlight — a translucent white border — is the detail that sells it, catching a simulated rim of light the way real glass does. The tool sets all three together because tuning any alone misleads; the preview is the arbiter of the combination.\n\n- Backdrop-filter is GPU work, and panels full of it cost frames on modest hardware — one effect per surface, not a wall of glass.\n- The effect needs something behind it: frosted glass over a flat background is invisible, which is why the preview works against a chosen backdrop colour.\n- In real deployments that means imagery or a gradient underneath, and the radius is absolute rather than proportional — a blur that reads as glass across a hero is noticeably heavier on a small card and usually wants dialling back.\n- The test that matters is the real backdrop: glass tuned against a placeholder often reads as invisible or milky once the actual image is behind it.\n\n- Frosted glass is a stack rather than a single property: a backdrop blur supplies the diffusion, a translucent background tint supplies the tone and the sense of depth, and a low-opacity border supplies the edge.\n- An inner highlight or shadow supplies the impression of thickness, which is what separates glass from a flat translucent layer.\n- Change any one of them and the character changes — more blur reads as opaque, less reads as a dirty window, and an over-saturated tint turns the panel into a colour filter over the content beneath.\n- The preview matters for the same reason: the effect only exists relative to its backdrop, so it has to be tested over the actual hero image at the actual scroll position.\n\nAs a backdrop blur generator it is the focused instrument for the frosted glass effect css question: a translucent blur generator that assembles the whole recipe, previews it honestly against a real backdrop, and hands over the CSS — tint, blur, border and all — in one copy.\n\nKeep the recipe short enough to repeat elsewhere in the interface, because a glass panel that appears once reads as a decoration while the same panel used for navigation, cards and modals reads as a material, and that consistency is what makes the effect feel intentional.",
    howTo: [
      { step: "Choose the glass tint color and its opacity." },
      { step: "Set the blur radius and preview the panel against the chosen backdrop color." },
      { step: "Copy the CSS — tint, backdrop-filter, highlight border and radius included." },
    ],
    whenToUse:
      "Use this for glass panels over colorful backdrops — heroes, modals, floating cards. Use the overlay generator for tint-only scrims, the shadow color tool for the drop shadow beneath the glass, and the opacity calculator to flatten the tint to a solid when blur is dropped. When only the two filter numbers need tuning rather than the whole panel recipe, the {{css-backdrop-filter-generator|CSS backdrop filter generator}} isolates them, and the same functions applied to an element's own content rather than to what is behind it are the {{css-filter-generator|CSS filter generator}}'s subject.",
    faqs: [
      {
        q: "Why does my glass panel look like nothing?",
        a: "Frosted glass needs a backdrop worth frosting — over a flat background the blur has nothing to show. Preview against an image or gradient, as the tool's backdrop field demonstrates.",
      },
      {
        q: "Is backdrop-filter expensive?",
        a: "Yes — it is GPU compositing per element. Keep glass panels few and their areas moderate; a page of frosted panels will cost frames on weaker hardware.",
      },
      {
        q: "What opacity should the tint be?",
        a: "Low enough that the backdrop's shapes survive as soft light — typically 10–30%. The live preview is the judge; the recipe collapses when the tint reads as a plain card.",
      },
      {
        q: "Why the white border?",
        a: "The hairline highlight simulates the rim of light real glass catches — it is the detail that separates glassmorphism from a plain translucent rectangle.",
      },
      {
        q: "Does it work over video or an animated backdrop?",
        a: "It does — backdrop-filter filters whatever is painted behind, video included — but a moving backdrop means the compositor is never idle, which is where the frame cost is highest. Test it on a modest device before shipping it to everyone.",
      },
    ],
  },

  "css-hsl-color-generator": {
    keywords: [
      "css hsl color generator",
      "hsl value generator",
      "hsl notation",
      "tunable color channels",
    ],
    intro:
      "The css hsl color generator writes a picked colour as a stylesheet-ready hsl() string, with its hex, rgb(), rgba() and oklch() equivalents on the rows beside it.",
    content:
      "HSL is the notation people think in — hue, saturation, lightness, three nameable knobs — which is why stylesheets full of hsl() values read like intentions rather than arithmetic. The css hsl color generator produces that string from a visual pick: set the colour by eye and copy the hsl notation that comes back. The page is one colour field above a five-row panel — hex, rgb, rgba, hsl and oklch — each row copyable and all five generated together.\n\n- hsl — hue in degrees and saturation and lightness as percentages, printed with two decimals, as in hsl(217.22, 91.22%, 59.8%).\n- The hue is a real number rather than a rounded integer, which is the hsl value generator's honest answer for a colour that did not originate on a whole degree.\n- hex — upper-case six digits, for token files that prefer the short spelling.\n- rgb and rgba — decimal channels, with the alpha in the four-argument form fixed at 1.\n- oklch — perceptual lightness, chroma and hue, for anyone who needs even steps rather than familiar ones.\n\nThe arithmetic is not transcribed by hand. The parser and formatter come from the shared colour library, the field normalises whatever it receives — a three-digit shortcut, a named colour, a pasted rgb() string — into one six-digit base before the panel is built, and the hsl row is derived from that base. Nothing about the row depends on what you typed, which is why the numbers are consistent between visits and why two people copying the same swatch get the same string.\n\nhsl() is at its best where the numbers are the interface. Tunable color channels that a person will adjust — hue for the family, saturation for the temperature, lightness for the state — are exactly what the three components expose, so a hover state or a quiet background variant can be derived by moving one number instead of hunting for a new colour. That is also the notation's trap: because the components move so easily, it is tempting to build a whole scale in them, and equal steps in HSL are not equal steps to the eye.\n\n- Hue carries decimals: a colour picked visually rarely lands on a whole degree, so hsl(217.22, ...) is the correct answer rather than a mistake.\n- No alpha: the rgba row reads 1 and an alpha in the input is discarded when the field normalises the value.\n- Comma syntax only — the modern space-separated form with a slash for alpha is valid CSS but is not printed here.\n- Lightness is not perceptual: two hues at the same lightness can look very different in weight, so hsl() is a poor coordinate system for building even steps.\n\nUse hsl() where the value will be tuned by a human later — a hover state nudged by lightness, a tint derived by lowering saturation — because the three components map onto the things a person changes, and a reviewer can see intent in the numbers instead of decoding a six-digit string. Where the steps have to look even rather than be editable, prefer the oklch row: it is the coordinate system that keeps lightness consistent across hues, which hsl() only approximates. And when only the string matters, the rgb and hex generators print their own rows from the same panel, so the notation you need is never a second lookup away. Derive the family in oklch where the steps have to look even, quote it in hsl where a person has to edit it, and the two habits stop competing.",
    howTo: [
      { step: "Set the colour with the picker field, or paste a value and let the field normalise it." },
      { step: "Read the hsl() string from the fourth row of the panel." },
      { step: "Copy it into the stylesheet that styles colours by channel." },
      { step: "Fall back to the oklch row wherever the value needs perceptually even steps." },
    ],
    whenToUse:
      "Use this when a stylesheet styles colours by hue and lightness — tunable systems, hover states, themed shades. The {{css-rgb-color-generator|RGB generator}} and the {{css-hex-color-generator|HEX generator}} print their own notations from the same panel, the {{hsl-channel-adjuster|HSL channel adjuster}} edits the three numbers rather than quoting them, and the {{color-format-converter|format converter}} covers the lab, lch and hwb spellings when a destination wants those.",
    faqs: [
      {
        q: "Why does the hue have decimals instead of a whole number?",
        a: "A visually picked colour rarely lands on an exact degree, and the row prints the real value rather than rounding it away. hsl(217.22, 91.22%, 59.8%) is more accurate than a tidied 217.",
      },
      {
        q: "Is hsl() the same as the colour picker's wheel position?",
        a: "The hue shares the same 0–360 circle, so the two agree in shape. The saturation and lightness channels are the picker's own, which is why a colour can be reproduced from the string.",
      },
      {
        q: "Can the string carry transparency?",
        a: "Not from this page. The rgba row is always opaque because the field has no alpha control; translucent values come from the alpha and opacity tools.",
      },
      {
        q: "Why do two hues with the same lightness look different in weight?",
        a: "Because HSL lightness is a mathematical average rather than a perceptual measure. Equal lightness across hues is exactly what oklch is designed for, which is why that row is worth keeping.",
      },
      {
        q: "Should a design system store colours as hsl()?",
        a: "It can, and it stays readable, but it is a poor basis for generating even steps. Systems that need predictable ramps usually generate them in oklch or Lab and store hex.",
      },
    ],
  },

  "css-rgb-color-generator": {
    keywords: [
      "css rgb color generator",
      "rgb value generator",
      "numeric channel color",
      "rgb notation",
    ],
    intro:
      "The css rgb color generator writes a picked colour as a stylesheet-ready rgb() string, with its rgba(), hex, hsl() and oklch() equivalents on the rows beside it.",
    content:
      "rgb() is the notation of numbers: three channels, unambiguous, and the shape that image editors, screenshot inspectors and API responses all speak. The css rgb color generator produces it from a visual pick — set the colour by eye and copy the numeric channel colour that comes back — which removes the step where a channel gets transcribed wrong. The page is one colour field above a five-row panel: hex, rgb, rgba, hsl and oklch, every row copyable.\n\n- rgb — decimal channels in red, green, blue order, printed as rgb(59, 130, 246), which is the row this page is named for.\n- rgb value generator output is clamped and rounded to whole 0–255 integers, so the string is exactly what a browser computes.\n- rgba — the four-argument form with alpha fixed at 1, since the field has no alpha control.\n- hex — upper-case six digits, for token files that prefer the short spelling.\n- hsl and oklch — the same colour in channel-percentage and perceptual coordinates.\n\nThe conversions come from the shared colour parser and formatters rather than from a second implementation, and the panel is the same component the hex, hsl and formatting pages render. A value typed into the field is parsed and normalised to six-digit hex first, so a pasted rgb() string, a named colour and a hex value all reach the same base before the rows are built; the rgb row then re-expands that base into channel integers. Because the row is derived rather than typed, the channel order cannot be swapped and the channels cannot fall outside 0–255.\n\nReading a value off the panel rather than typing it is what keeps a numeric channel color honest: a hand-typed triple can be one channel out and still look plausible, while a copied string cannot be. Keep one convention for the rgb notation across a project — commas here or spaces there, but not both — so that a search for the notation finds every declaration that uses it.\n\n- No alpha: the rgba row always reads 1, and an alpha in an input value is dropped when the field normalises it.\n- Integer form only: percentage channels and the modern space-separated syntax are not printed here.\n- Bare values, not full declarations, so the property name and any fallback are still yours to write.\n- No image sampling or eyedropper input: the field takes a colour value, not pixels.\n\nReach for it when a spec, a ticket or a design note quotes rgb() and the value has to be exact — the notation exists precisely for that dialogue with tooling. When the task is editing the numbers rather than quoting them, the channel adjusters work the three values directly; when the source is a screenshot or an image, the image picker samples the pixel and hands the value on. Keep one convention in a codebase, because mixing comma and space syntax inside a project makes every future search-and-replace guesswork, and let this page hold the commas so nobody has to remember them. That is a small discipline with a visible payoff: the notation arrives correct, in one spelling, from a value that was chosen rather than recalled.",
    howTo: [
      { step: "Set the colour visually with the picker field." },
      { step: "Read the rgb() string from the second row of the panel." },
      { step: "Copy it into the stylesheet, spec or design ticket that quotes channel values." },
      { step: "Compare against the hex row when a token file has to agree with the stylesheet." },
    ],
    whenToUse:
      "Use this when a spec or a tool quotes rgb(). The {{css-hex-color-generator|HEX generator}} and the {{css-hsl-color-generator|HSL generator}} are the same panel for their own notations, the {{rgb-channel-adjuster|RGB channel adjuster}} edits the three numbers instead of quoting them, and the {{alpha-color-generator|alpha generator}} covers the translucent fourth channel this page leaves at 1.",
    faqs: [
      {
        q: "Does it print the 0–255 form or percentages?",
        a: "The 0–255 integer form. Percentage channels and the space-separated syntax render identically in a browser but are not among the strings this page prints.",
      },
      {
        q: "Are the channel values rounded when they are converted?",
        a: "They are clamped to the valid range and rounded to whole integers, which is what a browser stores internally, so a value copied here matches the rendered colour.",
      },
      {
        q: "Can I get rgba with a real alpha?",
        a: "The rgba row is always fully opaque on this page because the colour field has no alpha control. The opacity and alpha tools compute and format the translucent case.",
      },
      {
        q: "Why quote rgb() when hex is shorter?",
        a: "Because the surrounding tooling speaks it: images, editors, video and APIs traffic in channel integers, and a spec written in the same units is easier to verify against them.",
      },
      {
        q: "Is rgb() good for editing a colour later?",
        a: "It is workable but not perceptual, so equal steps in a channel do not look like equal steps to the eye. For adjustments by lightness or chroma, keep the oklch row instead.",
      },
    ],
  },

  "css-hex-color-generator": {
    keywords: [
      "css hex color generator",
      "hex color generator",
      "uppercase hex value",
      "hex for tokens",
    ],
    intro:
      "The css hex color generator turns a picked colour into the canonical six-digit upper-case hex string, with its rgb(), rgba(), hsl() and oklch() equivalents on the rows below.",
    content:
      "Hex is what design tokens, style guides and review diffs are written in, and the css hex color generator exists to produce it without a transcription step: set the colour once and copy the string. The page opens on a single colour field with its swatch, and below it a panel of five rows — hex, rgb, rgba, hsl and oklch — that all move together. The hex row is the headline: six digits, upper case, no shorthand and no alpha, which is the spelling a token file can be diffed against.\n\n- hex — the uppercase hex value, e.g. #3B82F6, which is the row this page is named for.\n- rgb — decimal channels, rgb(59, 130, 246).\n- rgba — the four-argument form with alpha fixed at 1, because the field here has no alpha control.\n- hsl — hue in degrees with two decimals on each channel, hsl(217.22, 91.22%, 59.8%).\n- oklch — perceptual lightness, chroma and hue for modern CSS.\n\nNothing on the page is arithmetic you have to trust by eye. The picker writes the value and the conversions come from the same parser and formatters the rest of the domain uses, which is why the hex row is the six-digit expansion rather than an echo of what you typed. Paste a three-digit shortcut or a named colour into the field and it normalises to that six-digit base before any row is rendered, so the same colour cannot be written two ways across two files. Because the five rows are built from one parsed value, they describe one colour; the difference between them is notation alone.\n\nTreat the first row as the contract: hex for tokens means the same six upper-case digits in the token file, in the spec and in the review diff, and the four other rows exist as context rather than as output. When a palette is transcribed into code, the shortest reliable route is to copy each value through this page in turn rather than to retype the set from a screenshot, because a retyped value is a new value that merely looks close.\n\n- No shorthand and no alpha in the hex row: three-digit input is expanded, and an 8-digit value is normalised to six, so an alpha never survives into the string.\n- The rgba row always reads 1, and the alpha slider lives on another page.\n- No colour names in the output: the panel stops at oklch, so a named colour is not among the results.\n- Nothing is stored: the page opens on its default blue every visit, in one uppercase hex value.\n\nUse it the way a token file uses hex — as the one spelling a system agrees on. Keep it open while a palette is transcribed into code and the values arrive canonical instead of by hand, which is how a case convention survives a second editor. Where the destination wants a ladder rather than a single value, generate the shades with the shade tools and copy each rung through here, since a derived rung that was copied cannot drift the way a rung typed from memory can. When a colour arrives from elsewhere and has to be checked before it is trusted, send it through the validator; when the whole notation set plus the packed integer is needed, the format converter prints more rows from the same colour.",
    howTo: [
      { step: "Set the colour with the picker field, or paste a value and let the field normalise it." },
      { step: "Read the canonical upper-case hex from the first row of the panel." },
      { step: "Copy the hex string into a token file, a spec or a stylesheet." },
      { step: "Use the rgb, hsl or oklch rows only if a destination explicitly asks for that notation." },
    ],
    whenToUse:
      "Use this when hex is the contract — tokens, specs and hand-off documents. The {{css-rgb-color-generator|RGB generator}} and the {{css-hsl-color-generator|HSL generator}} are the same panel aimed at their own notations, the {{color-format-converter|format converter}} covers hwb, lab, lch and the packed integer as well, and the {{color-palette-css-exporter|palette CSS exporter}} writes a whole palette out as variables rather than one value at a time.",
    faqs: [
      {
        q: "Why is the hex written in upper case?",
        a: "Upper case is the convention most token files and style guides settle on, and one casing keeps a diff readable. Lower case renders identically; only the string differs.",
      },
      {
        q: "What happens if I paste a three-digit hex shortcut?",
        a: "It is parsed and expanded to the six-digit form before any row is rendered, so the output is always the canonical spelling rather than a copy of the input.",
      },
      {
        q: "Can the hex row carry alpha?",
        a: "No. An 8-digit value is normalised to six digits when it enters the field, so the alpha is dropped before the panel is built. Use the alpha generator when translucency matters.",
      },
      {
        q: "Does the generator check that a colour is readable as text?",
        a: "It does not — it formats values and performs no contrast maths. Send the foreground and background pair through the contrast checker for that question.",
      },
      {
        q: "Is hex still the right format for a new design system?",
        a: "For storage and tooling compatibility, usually yes: every tool speaks it and it is exact for sRGB. For values that will be adjusted by lightness or chroma, oklch is the more useful coordinate system to keep.",
      },
    ],
  },

  "css-text-color-preview": {
    keywords: [
      "css text color preview",
      "preview text color on background",
      "test font color css",
      "text color contrast preview",
    ],
    intro:
      "The CSS text color preview renders real text in any color over any background — the fastest way to judge a font color before it ships.",
    content:
      "Color values lie quietly. A foreground that looks perfect on the swatch card can dissolve on the actual background it ships over — and the failure is only visible when real text renders on the real surface. The CSS text color preview closes that gap: set a CSS color value, set a background, and the tool renders live text in the exact pair — the test font color css verdict that swatches cannot give.\n\n- The input being a raw CSS value is the tool's edge.\n- Paste the color exactly as the stylesheet expresses it — a hex, an rgb() call, a var() token's resolved value, even a gradient-adjacent edge case the picker fields would reject — and the preview honors it as the browser would.\n- That makes the tool the verifier of the last mile: the token file says one thing, this shows what it means, on the background it will actually meet.\n- Typography renders at readable sizes with enough weight to judge, so the preview answers the question as a reader will experience it, not as a color-math abstraction.\n\nThe workflow it anchors is the before-commit check: every text/background pair that matters gets one glance here before it ships — body copy on its surface, links on cards, the footer on the footer color. The contrast checker sits one step deeper for the legal verdict: the preview shows what the pair looks like, the checker says whether it passes, and together they catch both the aesthetic and the compliance failure. The color on background preview generalizes the same idea beyond text to UI elements.\n\nReading text against a background is a different judgement from measuring it, and the two disagree often enough to be worth doing separately. Type size, weight, tracking and the length of the run all shift where the threshold of comfort sits: the same pair that is comfortable at twenty-four pixels over two words strains at fourteen over a paragraph, and a heading in a light weight needs more separation than a bold one at the same value. Rendering the pair true, with no scrim and no badge to anchor the judgement, is what surfaces those effects — which is why the order worth using is to preview text color on background first and measure afterwards. If the sample reads badly, no ratio will rescue it; if it reads well, the number is there to confirm the margin is real rather than marginal.\n\nTesting the worst case as well — the smallest size, the lightest weight, the longest line — is what keeps the preview from flattering a pair that only works in the sample.\n\nAs a text color contrast preview instrument it is deliberately unquantified — no ratios, no badges, just the pair rendered true. That is the point: the css text color preview answers how it reads, the moment before the stylesheet commits it, with nothing between your eye and the rendered truth.\n\nKeep the pair that passed with the palette, so a later redesign starts from a combination already read at the right size rather than from a fresh guess.",
    howTo: [
      { step: "Paste or type the CSS color value your stylesheet will use." },
      { step: "Set the background it will render over." },
      { step: "Judge the live text rendering — then confirm compliance with the contrast checker if the pair carries text." },
    ],
    whenToUse:
      "Use this as the last-mile visual check for any text/background pair. Use the contrast checker for the WCAG verdict, the color on background preview for elements beyond text, and the format validator when the value itself needs screening before previewing. When the answer has to be a number rather than an impression, the {{contrast-ratio-calculator|contrast ratio calculator}} produces it, and a longer passage that has to stay readable at real sizes is the {{text-readability-checker|text readability checker}}'s subject.",
    faqs: [
      {
        q: "What color formats can I paste?",
        a: "Anything CSS accepts for a color value — hex, rgb(), hsl(), and named colors among them. The preview renders it as the browser would.",
      },
      {
        q: "Does the preview replace a contrast check?",
        a: "No — it shows how the pair reads; the contrast checker supplies the WCAG verdict. Use both: visual judgment and legal number answer different questions.",
      },
      {
        q: "Can I preview multiple sizes of text?",
        a: "The preview renders a readable range of sizes and weights so the pair can be judged as body text and as a heading in one look.",
      },
      {
        q: "Why does my color look different here than in my app?",
        a: "Surroundings shift perception — simultaneous contrast in action. The rendered pair is identical; the context around it is what differs.",
      },
      {
        q: "Why paste the value in rather than pick it?",
        a: "Because the question is whether this particular string works, character for character — a picker would normalise it into something else, and the difference between what a picker writes and what a file contains is exactly what gets tested here.",
      },
    ],
  },

  "css-custom-properties-exporter": {
    keywords: [
      "css custom properties exporter",
      "css variables generator",
      "export palette as css variables",
      ":root custom properties tool",
    ],
    intro:
      "The CSS custom properties exporter turns an editable palette into a :root block of CSS custom properties — the css variables generator for tokens the whole stylesheet can share.",
    content:
      "CSS custom properties are how a stylesheet speaks a palette: one :root block declaring the colors, every rule downstream referencing the names. The CSS custom properties exporter produces that block from an editable palette — build the color set in the editor, and the tool emits the :root declaration with each color bound to a generated custom property name, copy-ready for the top of any stylesheet.\n\n- The editor is what makes it more than a formatter: palettes evolve — a colour swapped, a shade added, a name reconsidered — and the exporter regenerates the whole block from the current set, so the snippet never drifts away from the palette it came from.\n- That keeps the source of truth the palette rather than the snippet.\n- Each row carries its name and value, the generated block updates live, and the copy button hands over the complete declaration, :root braces included.\n- The naming follows the brand-slot convention — brand-1, brand-2 — ready to be renamed to the system's vocabulary or used as-is for prototypes that need working names today.\n\nWhat the output buys is the CSS variables architecture in one paste: theme overrides become one redeclaration, dark modes become a scoped swap, and a color change becomes a single-line diff instead of a hunt across the stylesheet. That is the whole argument for custom properties, and the exporter exists to remove the last manual step — writing the block — from adopting it. The shadcn and Bootstrap exporters produce dialect-specific variants of the same idea, the token exporters go to JSON-based design token formats, and the variable generator offers an interactive editor for values already in flight.\n\n- Custom properties changed how palettes live in stylesheets: the values became addressable rather than scattered.\n- A palette held in one block can be re-themed by overriding it, adjusted per context with a scoped declaration, and read by tooling that would otherwise have to parse every rule just to find the values.\n- That structure pays off only if the block is complete and consistently named, which is where hand-written variables usually fall down — a half-migrated palette leaves some colours as literals, and the ones left behind are always the ones that needed changing.\n- Generating the block from the palette guarantees the set is whole and forces the naming decision once rather than per component, which is the narrowness that keeps a theme file honest: as a css variables generator the contract is a palette in and one block out, so whatever is in the palette is addressable and nothing in the stylesheet needs a hex typed into it.\n\nAs an export palette as css variables instrument, the contract is: an editable palette in, an export palette as css variables block out — the :root custom properties tool that turns a color set into the stylesheet's shared vocabulary in one paste.\n\nThe names are the part worth spending time on: a variable called blue-500 will outlive the colour it holds, while one named by role keeps its meaning when the palette changes, and that difference is what makes a theme file maintainable a year later.",
    howTo: [
      { step: "Build the palette in the editor — add, rename or recolor rows as needed." },
      { step: "Watch the :root block generate live with a custom property per color." },
      { step: "Copy the block to the top of your stylesheet and reference the names everywhere." },
    ],
    whenToUse:
      "Use this to start the custom-properties architecture from a palette. Use the shadcn or Bootstrap exporters for those dialects, the token generators for JSON design token files, and the variable generator for editing values already declared. When the palette should be written out without the editing rows, the {{color-palette-css-exporter|color palette CSS exporter}} is the plainer carrier, and a block destined for a token pipeline is the {{style-dictionary-format-generator|style dictionary format generator}}'s source format.",
    faqs: [
      {
        q: "Can I rename the generated variables?",
        a: "Yes — the names are editable in the palette rows, or rename them after pasting; the structure is standard custom properties either way.",
      },
      {
        q: "Does it support dark mode output?",
        a: "The exporter emits the single :root block; dark themes are then one redeclaration away — scope the same names under a dark selector and swap the values.",
      },
      {
        q: "How does this differ from the design token generator?",
        a: "This emits CSS custom properties directly for stylesheets; the token generator emits the W3C design token JSON for toolchains that consume tokens.",
      },
      {
        q: "Do the variables work in all browsers?",
        a: "Custom properties are supported everywhere current; the exporter's output is plain, standard CSS with no preprocessing assumed.",
      },
      {
        q: "Does the copy button include the :root braces?",
        a: "Yes — the block is copied whole, braces included, so it pastes into a stylesheet as it stands and every variable is addressable from anywhere below it.",
      },
    ],
  },

  "style-dictionary-format-generator": {
    keywords: [
      "style dictionary format generator",
      "design token json generator",
      "w3c design tokens export",
      "token file from palette",
    ],
    intro:
      "The Style Dictionary format generator emits a palette as W3C design token JSON — the design token json generator for toolchains that consume tokens, not stylesheets.",
    content:
      "- Style Dictionary made design tokens portable: one JSON source of truth, transformed into every platform's format.\n- The Style Dictionary format generator produces that source — build a palette in the editor, and the tool emits the W3C design token JSON structure with each colour typed, named and grouped.\n- The result is a file a token pipeline can read without a conversion step in front of it.\n\nThe output follows the W3C design token format's shape: a color group holding each token with its value and its explicit $type, so toolchains can validate and transform without guessing. That typing is the point — the design token json generator output is not a stylesheet snippet but structured data, machine-readable by Style Dictionary itself, by Figma plugins, by the growing set of token pipelines that treat the format as their interchange. The generated names follow the brand-N convention, renameable to the system's vocabulary, and the whole block is one copy from the editor's live output.\n\nThe workflow it serves is the token-adopter's first mile: a palette exists — a brand hex, a derived set, a mood board's harvest — and the pipeline needs it in token form before any transformation can run. Editing lives in the palette editor rows; the JSON regenerates live; the token file lands in the repo and the pipeline does the rest. From there the platform-specific exporters take over: the CSS custom properties exporter for the stylesheet side, the native exporters for mobile platforms, the Figma exporter for the design tool — all consuming what this tool produces.\n\nToken pipelines live or die on the source file. Everything downstream — the platform transforms, the build steps, the generated stylesheets and native files — is a function of what that source says, so a file in a format the tooling has to guess at produces surprises all the way down. The W3C design token format exists to remove that guessing: types are declared, references between tokens are explicit, and composite values have a defined shape. Generating the file from a palette rather than hand-authoring it keeps the naming and the types consistent with the values, and it means a change to the palette propagates through the pipeline instead of needing a matching manual edit in the token file. For a team standing up its first token layer, starting from a correctly typed source also makes the platform outputs predictable, which is what turns a one-off script into a system.\n\n- As a w3c design tokens export instrument it is deliberately the source-format tool: a token file from palette in one pass, typed and structured for machines.\n- For teams standing up a token pipeline, this is the first file — and the honest one, because everything downstream transforms it rather than contradicting it.\n- The group name is fixed at color and the keys are positional, so any renaming happens once, in the file, before the pipeline ever runs.\n\nKeep the source in version control as the single point of truth and let the platform outputs be generated rather than edited: the moment an output is patched by hand the pipeline has a second, undocumented source, and every later change becomes a reconciliation instead of a rebuild.",
    howTo: [
      { step: "Build the palette in the editor — each row becomes a token." },
      { step: "Review the generated W3C token JSON, names and $type declarations included." },
      { step: "Copy the JSON into your token pipeline's source directory." },
    ],
    whenToUse:
      "Use this when a token pipeline — Style Dictionary or compatible — is the destination. Use the CSS custom properties exporter for stylesheet-only needs, the JSON generator for lighter formats, and the platform exporters once the pipeline transforms this source. The same structure without the pipeline framing comes from the {{design-token-generator|design token generator}}, and a document whose keys are typed names rather than positions is written by the {{figma-token-generator|figma token generator}}.",
    faqs: [
      {
        q: "What is the W3C design token format?",
        a: "The emerging standard for design tokens as JSON — typed values, grouped structure — that Style Dictionary and a growing tool ecosystem consume. The output here follows that shape.",
      },
      {
        q: "Can I rename the generated token names?",
        a: "Yes — edit the names in the palette rows and the JSON regenerates, or rename in the file after pasting; the structure is what the pipeline cares about.",
      },
      {
        q: "Does Style Dictionary consume this file directly?",
        a: "Yes — the typed color tokens are exactly what Style Dictionary transforms expect, so the file drops into a standard configuration as the source.",
      },
      {
        q: "How is this different from the JSON color generator?",
        a: "The JSON generator emits a simple name-value object; this emits the typed, grouped W3C token structure that pipelines validate and transform.",
      },
      {
        q: "What group do the tokens come out under?",
        a: "color — the same single group the design token generator writes, since both produce the W3C structure from the same editor. Renaming the group is a one-word edit at the top of the file.",
      },
    ],
  },

  "material-ui-color-exporter": {
    keywords: [
      "material ui color exporter",
      "mui theme palette generator",
      "material palette from hex",
      "mui colors export",
    ],
    intro:
      "The Material UI color exporter derives a full MUI-style shade ramp from one color — 50 through 900 — and emits the theme snippet Material palettes expect.",
    content:
      "- Material Design's palette contract is a shade ramp: one hue expressed as eleven steps named 50 through 900, each with a job — 50 for surfaces, 500 for the primary, 700 and up for text-on-light.\n- The Material UI color exporter builds that ramp from any single color: set the base hex, and the tool derives the eleven shades in the base's hue, emits the theme snippet Material expects, and previews the ramp as swatches labelled with both their step names and the bg-brand-N classes that consume them.\n\nThe derivation respects what makes a Material ramp feel coherent: every step holds the base's hue, so the family is unmistakably one color at eleven lightnesses — the ramp that Material's elevation and state systems assume. The lightness ladder follows the canonical Material spacing, dark steps anchored near the base's depth, light steps opened toward the 50 surface. The result is a Material palette from hex that lands in the theme file without hand-tuning: the mui colors export is the full ramp, formatted as the config snippet the framework consumes.\n\n- The tool's honesty is in what it does not claim: a derived ramp is a starting point that matches the base exactly at its anchor and approximates Material's official ramps elsewhere.\n- Official Pantone-specified Material palettes exist for the standard hues; for a brand color outside that set, derivation is the only honest path, and the ramp it produces is internally consistent even where it differs from Google's hand-tuned steps.\n- The Tailwind exporter produces the equivalent ramp for Tailwind's naming; the contrast checker verifies which steps may carry text on which surfaces.\n\nMaterial's palette convention is opinionated in a way that rewards reading before generating. A hue becomes an object of eleven steps carrying textual roles — main, dark, light, contrast text — and the framework's components are written against those names rather than against the numbers. The interesting decision is therefore not which values to include but which value is main: contrast text is derived from it, the other steps are read as directional variations, and the lightest and darkest entries are usually reserved for hover and disabled treatments rather than used as fills. A ramp that gets main wrong produces a theme whose buttons look plausible in isolation and wrong in every state. Generating the ramp from one brand colour gives the eleven steps; choosing which of them carries main is the step an eye still has to make.\n\nAs an mui theme palette generator it is deliberately single-hue: one color in, the full eleven-step ramp out, theme-ready. For a whole theme's worth of hues, each brand color takes one pass — the Material palette from hex workflow that turns a brand guideline into a theme file in as many pastes as the brand has colors.\n\nWhere the brand supplies more than one hue, each takes its own pass and its own main value, and the theme's coherence comes from the naming rather than from the ramp arithmetic.",
    howTo: [
      { step: "Set the base color the ramp must derive from." },
      { step: "Review the eleven-step ramp — 50 through 900 — in the swatch preview." },
      { step: "Copy the theme snippet into your Material theme configuration." },
    ],
    whenToUse:
      "Use this to materialise a brand color as a Material shade ramp. Use the Tailwind exporter for Tailwind naming, the contrast checker for step-role assignment, and the token exporters when the ramp joins a token pipeline instead of a theme file. The framework's own families are laid out in the {{material-design-color-reference|Material Design color reference}} for comparison, and a ramp drawn from a brand colour without the theme wrapper is what the {{material-palette-generator|Material palette generator}} produces.",
    faqs: [
      {
        q: "Will the ramp match Google's official Material colors?",
        a: "At your base color's step, yes by construction; elsewhere it approximates, since official ramps are hand-tuned. For standard hues, official palettes exist; for brand colors, derivation is the honest path.",
      },
      {
        q: "Which step is my primary color?",
        a: "The step closest to your input — conventionally 500 for mid-tone brands. The swatch preview marks each step so the anchor is visible.",
      },
      {
        q: "Can I export multiple hues at once?",
        a: "The tool derives one hue per pass — run each brand color through and combine the snippets in your theme.",
      },
      {
        q: "Does the output include the class names too?",
        a: "The preview labels each swatch with its step and class name for reference; the copied snippet is the theme configuration itself.",
      },
      {
        q: "How do I decide which step a role should use?",
        a: "Work from the light end for surfaces and the dark end for text on light, then check the pair rather than trusting the number — a step label is a position in the ramp, not a contrast guarantee.",
      },
    ],
  },

  "chakra-ui-color-exporter": {
    keywords: [
      "chakra ui color exporter",
      "chakra theme colors generator",
      "chakra color scale from hex",
      "chakra semantic tokens export",
    ],
    intro:
      "The Chakra UI color exporter derives a Chakra-style color scale from one hex — 50 through 900 — and emits the theme snippet Chakra's semantic tokens expect.",
    content:
      "Chakra's theming speaks in scales: every named color is a 50-to-900 ramp, and the semantic layer — brand, danger, success — points into those ramps. The Chakra UI color exporter builds the scale half of that system from any single hex: set the base, and the tool derives the full shade ladder in the base's hue and emits the theme snippet Chakra expects, previewed as swatches labelled with their scale steps.\n\n- The derivation follows Chakra's canonical lightness spacing, so the ramp behaves the way Chakra's built-in scales do: 50 as a whisper-background, 500 as the colour's self, 600 and 700 for hover and pressed states, the deep steps for text on light surfaces.\n- Every step keeps the base's hue, which is the property that makes the scale feel like one colour wearing eleven weights.\n- That is the Chakra color scale from hex that slots into a theme file without hand-tuning each step.\n\n- The tool sits deliberately inside Chakra's architecture rather than reinventing it: the output is the scale snippet, ready to bind into a theme's colors, after which the semantic tokens — primary, secondary, states — point at the scale steps per Chakra's own convention.\n- That division keeps the export honest where it belongs (the objective ramp) and leaves the opinionated binding (which step is primary) to the system that owns it.\n- The Material and Tailwind exporters produce the equivalent ramps for their frameworks' naming, and the contrast checker referees which steps can carry text against which surfaces.\n\nChakra splits colour into two layers and the split is the whole point: a numeric scale holds the values, and semantic tokens hold the meaning. Components are written against the semantic names, so a theme that populates only the scale produces components that look right in one mode and unthemed in the other. That is why the semantic layer deserves as much attention as the ramp itself, and why a chakra semantic tokens export is worth treating as the deliverable rather than an afterthought: it is the layer that lets a dark mode, a brand variant or a high-contrast register be switched without touching a component. The scales underneath stay mechanical — one hue per pass, every step derived from the same base — and the meaning is assigned on top of them, which keeps the theme legible a year after it was assembled.\n\nAssigning meaning after the ramp rather than during it is also what keeps two hues from claiming the same role.\n\nAs a chakra theme colors generator it is one hue per pass: a chakra color scale from hex in one paste, theme-ready. A full Chakra theme is as many passes as the theme has named colors — each brand hue deriving its own scale, each scale landing in the same file, the semantic layer assembling on top.\n\nReviewing that semantic layer against a real screen, rather than against the scale, is what catches a role that has been assigned twice or a name that no longer matches what it colours.",
    howTo: [
      { step: "Set the base color for the scale." },
      { step: "Review the 50–900 ramp in the swatch preview." },
      { step: "Copy the snippet into your Chakra theme's colors, then bind semantic tokens to the steps." },
    ],
    whenToUse:
      "Use this to turn a brand hex into a Chakra scale. Use the Material or Tailwind exporters for those frameworks, the contrast checker for step-role verification, and the token exporters when the scales feed a token pipeline. The framework's built-in scales are laid out in the {{chakra-ui-color-reference|Chakra UI color reference}} for comparing a derived ramp against them, and the other component-library dialect of the same idea is what the {{shadcn-ui-color-exporter|shadcn/ui color exporter}} writes.",
    faqs: [
      {
        q: "Which step becomes my primary?",
        a: "Conventionally the step nearest your input — usually 500 — with 600 as hover and 700 as pressed. The exporter emits the scale; the semantic binding follows Chakra's convention.",
      },
      {
        q: "Does it emit the semanticTokens section too?",
        a: "No — the output is the color scale, the objective half. Semantic tokens are opinions about which steps fill which roles, and Chakra's docs define the convention.",
      },
      {
        q: "Can I export several hues for one theme?",
        a: "One pass per hue, combining the snippets in the theme's colors — the same flow as any multi-color theme.",
      },
      {
        q: "Will the derived steps match Chakra's built-in scales?",
        a: "They follow the canonical spacing and match your base exactly at its step; official built-ins are hand-tuned, so treat the derived ramp as a consistent starting point.",
      },
      {
        q: "Which step suits a hover state?",
        a: "Read the ramp's spacing rather than a rule: a step or two below the base keeps the shift visible without making the state read as a different colour, and the deep end is where pressed states and text on light live.",
      },
    ],
  },

  "shadcn-ui-color-exporter": {
    keywords: [
      "shadcn ui color exporter",
      "shadcn css variables generator",
      "shadcn theme colors export",
      "hsl variables for shadcn",
    ],
    intro:
      "The shadcn/ui color exporter emits a palette as the CSS custom properties shadcn themes consume — the shadcn css variables generator for the --background/--foreground convention.",
    content:
      "shadcn/ui themes are CSS custom properties with a contract: --background, --foreground and their named companions, declared in :root and consumed by every component. The shadcn/ui color exporter produces that block from an editable palette — build the color set, and the tool emits the variable declarations in shadcn's naming convention, copy-ready for the theme file. It is the shadcn css variables generator for the convention the component library assumes.\n\nThe export speaks shadcn's dialect specifically: the variable names follow the --role/--foreground pairing the components reference — surfaces, borders, rings, the semantic slots — so the pasted block is consumable as-is, not a generic variable dump requiring renaming. The editor rows carry names and values; the block regenerates live; the copy hands over the complete declaration set. That focus on the convention is the tool's whole value: shadcn themes break silently when variable names drift, and the generator keeps the export on-contract — a shadcn theme colors export that lands working.\n\nThe workflow it serves is theme bootstrap and brand adaptation: a palette decided elsewhere — brand guideline, derived ramp, mood board harvest — needs to become the variable block shadcn components read. Editing lives in the palette rows; the CSS variables architecture (one redeclaration per theme, dark modes as scoped swaps) comes free with the format. The generic CSS custom properties exporter emits the same architecture without the shadcn naming; the token exporters feed pipelines instead of theme files.\n\n- Shadcn's convention is unusual enough to catch people out: the palette lives in HSL channel values without the wrapper, so the components can compose their own alpha and colour-mix expressions.\n- A theme block is therefore not just a list of colours but an agreement about notation, and a file written in another format produces components that render transparent or as an unrecognised value.\n- Getting that agreement right at the start is most of the work, which is why a shadcn ui color exporter is worth running rather than transcribing by hand: the notation, the variable names and the light and dark registers all come out together.\n- The tokens are also the ones components depend on implicitly, so a missing entry does not throw — it quietly renders a fallback — and a complete block is worth more than a pretty one.\n\nChecking the dark register against the light one before shipping the theme is the last cheap step, since both are generated from the same palette and either can be the one that fails.\n\nAs an hsl variables for shadcn instrument — the notation shadcn's convention uses — it is one palette in, the theme block out, on-contract by construction. For teams starting a shadcn project from a brand palette, it is the first file in the theme directory, and the one the components silently depend on.\n\nKeep the block in one file and import it once, since splitting a register across components is how a theme quietly acquires a second, contradictory definition; where a value genuinely needs to differ, override the variable rather than the token.",
    howTo: [
      { step: "Build the palette rows with shadcn role names — background, foreground, primary, and companions." },
      { step: "Watch the custom property block generate in shadcn's convention." },
      { step: "Copy the block into your theme file; the components consume it as-is." },
    ],
    whenToUse:
      "Use this to bootstrap or rebrand a shadcn/ui theme from a palette. Use the generic CSS variables exporter for non-shadcn projects, the token exporters for pipelines, and the dark-mode palette generator for the values of the dark scope. Once the block is in place, the {{palette-accessibility-checker|palette accessibility checker}} is where the pairs a real interface depends on get audited, and the other framework whose hook is a short list of named roles is covered by the {{bootstrap-color-exporter|bootstrap color exporter}}.",
    faqs: [
      {
        q: "Does the output use shadcn's exact variable names?",
        a: "Yes — the block follows the --background/--foreground style convention the components reference, so it is consumable without renaming.",
      },
      {
        q: "Can it generate the dark mode block too?",
        a: "The exporter emits the light-scope block; the dark scope is the same variable names redeclared under a dark selector — pick values with the dark-mode palette generator and re-run.",
      },
      {
        q: "Does it emit HSL channels or full colors?",
        a: "The output follows the notation convention shadcn's theme expects, formatted so the components render exactly what the preview showed.",
      },
      {
        q: "What if my palette has more colors than shadcn's slots?",
        a: "Bind the core slots first; extra colors become additional custom properties in the same block, referenceable by your own components.",
      },
      {
        q: "Do the variables need a particular order in the file?",
        a: "No — custom properties resolve by name rather than position, so the rows can be reordered freely. What matters is that every name a component references is present, since a missing one falls back silently rather than erroring.",
      },
    ],
  },

  "bootstrap-color-exporter": {
    keywords: [
      "bootstrap color exporter",
      "bootstrap theme colors scss",
      "bootstrap 5 color variables",
      "bootstrap palette variables export",
    ],
    intro:
      "The Bootstrap color exporter turns a palette into the theme-color variables Bootstrap 5 consumes — the bootstrap theme colors scss block, convention-ready.",
    content:
      "Bootstrap's theming hangs on a short list of theme colors — primary, secondary, success, danger, warning, info — plus the surface pair, all declared as variables the framework's components consume. The Bootstrap color exporter emits that block from an editable palette: assign your colors to the roles, and the tool generates the variable declarations in Bootstrap's convention, copy-ready for the theme file. It is the bootstrap 5 color variables block, on-contract.\n\n- The role mapping is the tool's real work.\n- Bootstrap's slots are semantic — success must read as success, danger as danger — so the export is an act of casting, not formatting: which palette member becomes primary, which neutral becomes secondary, which accents take the state roles.\n- The editor rows carry the role names, the block regenerates as the casting changes, and the pasted result plugs into Bootstrap's variable chain — after which components, buttons and utilities inherit the palette without further edits.\n- That is the bootstrap theme colors scss promise: one block, the whole framework re-skinned.\n\nThe workflow it serves is the Bootstrap project meeting a brand: the framework ships sane defaults that read as generic Bootstrap, and the fastest path to a branded build is the variables block, not overrides scattered through custom CSS. Editing lives in the rows; the export stays conventional; upgrades stay safe because the block overrides variables rather than fighting compiled CSS. The shadcn exporter serves that ecosystem's convention; the generic CSS variables exporter serves framework-agnostic stylesheets; the token exporters feed pipelines that transform rather than override.\n\n- Bootstrap's theming hook is deliberately simple: a map of named colours, each of which becomes a family of classes, buttons, alerts and utilities at build time.\n- That makes the names the real decision — calling something primary or danger rather than brand-blue is what lets the framework's components wire themselves up, and it means a later change of hex does not require a search across templates.\n- The supplied family also has to satisfy the framework's own assumptions about contrast, since the components expect each colour to carry text at a given weight, and a mapped hue that is too light produces buttons whose labels are unreadable without any warning at build time.\n- Generating the block from a palette keeps the names conventional and the values deliberate, which is the combination that makes a themed Bootstrap build look designed rather than rebuilt.\n\nAs a bootstrap palette variables export instrument it is deliberately the casting tool: a palette in, the theme-colors block out, roles assigned and names conventional. For Bootstrap 5 projects starting from a brand palette, it is the shortest path from brand guideline to a framework that looks like it was always yours.\n\nWhere the framework needs a colour the brand does not supply — a warning, a muted surface — take it from the generated ramp rather than inventing one, so the set stays inside the same family while still satisfying the roles Bootstrap expects, and the theme's exceptions remain visible instead of hidden inside the map.",
    howTo: [
      { step: "Assign palette colors to Bootstrap's roles — primary, secondary, the states, surfaces." },
      { step: "Watch the variable block generate in Bootstrap's convention." },
      { step: "Copy it into your theme overrides; components and utilities inherit the cast." },
    ],
    whenToUse:
      "Use this to brand a Bootstrap 5 project from a palette. Use the shadcn exporter for that ecosystem, the generic CSS variables exporter for custom stylesheets, and the contrast checker to verify text roles against the cast surfaces. The framework's own theme values are laid out in the {{bootstrap-color-reference|Bootstrap color reference}}, and when the build compiles Sass the same tokens can be written as build-time variables by the {{scss-variable-generator|SCSS variable generator}}.",
    faqs: [
      {
        q: "Which variables does the block override?",
        a: "Bootstrap's theme-color roles — primary, secondary, success, danger, warning, info — plus the surface variables, exactly the names the framework's components consume.",
      },
      {
        q: "Do I need SCSS, or does plain CSS work?",
        a: "The block is plain variable declarations, consumable wherever Bootstrap's variables are customized — SCSS builds override before compile; CSS-only setups use the runtime custom property layer.",
      },
      {
        q: "What if my palette lacks a state color?",
        a: "Bootstrap's semantic slots need casting — derive a success or danger from your palette's family with the harmony tools, or keep the framework defaults for states and cast only the brand roles.",
      },
      {
        q: "Will upgrades to Bootstrap break the block?",
        a: "No — the block overrides documented variables, which is the supported customization path and stays stable across minor upgrades.",
      },
      {
        q: "What happens when the brand palette changes?",
        a: "The export is a snapshot: regenerate the block from the new palette and swap it in. That is the point of keeping the values generated rather than hand-edited — the role names stay put while the values move.",
      },
    ],
  },
};
