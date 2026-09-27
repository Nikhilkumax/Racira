import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 12 (alphabetical slugs 99-105).
 *
 * Skipped from this window:
 *  - contrast-ratio-calculator — renders the identical ContrastChecker variant as
 *    contrast-checker, so it would duplicate that page. Its search phrasing is
 *    folded into the authored page as a keyword instead.
 */
export const SEO_BATCH_12: Record<string, ToolSeo> = {
  "contrast-checker": {
    keywords: [
      "contrast checker",
      "wcag contrast ratio",
      "aa and aaa contrast",
      "text and background contrast",
    ],
    intro:
      "Contrast Checker takes a text color and a background color and reports the WCAG contrast ratio between them, together with the four pass-or-fail verdicts that follow from that one number.",
    content:
      "Contrast Checker takes a text color and a background color and reports the WCAG contrast ratio between them, together with the four pass-or-fail verdicts that follow from that one number. The preview block renders your pair as a large heading above smaller body text, so the verdicts can be read directly against the thing they are judging. Because both AA and AAA contrast levels are decided from that one pair, the page doubles as a combined text and background contrast report rather than a test of a single threshold.\n\nEverything is decided from the single ratio the tool prints, and every threshold is shown at once instead of one level at a time:\n\n- WCAG AA, normal text — 4.5 to 1, the baseline for running body copy, and the ratio most teams treat as the shipping gate.\n- WCAG AA, large text — 3 to 1, the relaxed level that applies to text at roughly 24px, or 18.66px when bold.\n- WCAG AAA, normal text — 7 to 1, the enhanced level for body copy.\n- WCAG AAA, large text — 4.5 to 1, the enhanced level for large type.\n\nThose thresholds all read from the same calculation, which is the standard WCAG 2.x contrast ratio. Each color is converted to sRGB, each channel is linearised out of its gamma curve, and the three linear values are weighted 0.2126 red, 0.7152 green and 0.0722 blue to give a relative luminance. The ratio is then the lighter luminance plus 0.05 divided by the darker luminance plus 0.05, which is why the scale runs from 1 to 1 for a color against itself up to 21 to 1 for pure black on pure white. This page rounds the result to two decimal places, because the thresholds sit close enough together that one decimal is not always enough to tell a pass from a fail.\n\nSome limits are worth knowing before you treat a green badge as the whole story.\n\n- The verdicts are text thresholds only. A 3 to 1 pass says a pair is acceptable for large type, and says nothing about whether the same pair can carry a paragraph.\n- Only two colors are compared. A card, border or third surface layered behind the pair is not part of the calculation.\n- Alpha is not an input. A translucent overlay has to be flattened against its real backdrop before the number means anything.\n- The ratio is a property of two colors alone. Font weight, size and antialiasing change how a pair feels in use but never move the number.\n- Non-text elements are out of scope. Component boundaries and focus rings are also judged at 3 to 1 here, but the component and focus checks exist because the conditions that make them pass are different.\n\nStart with the pair you actually intend to ship, then read the badges in order of how the text will be used. Running body copy needs the AA normal badge, headings and display type can live with AA large, and AAA is worth chasing only where the contrast it demands does not flatten the design. If a pair sits just under a threshold and the color matters, adjust the background instead of the text color: a small change in the larger area moves the ratio further and is less visible once rendered.",
    howTo: [
      { step: "Set the text color in the first swatch and the background color in the second." },
      { step: "Read the contrast ratio printed in the second panel's title, to two decimal places." },
      { step: "Check the four badges below it, and note which of AA and AAA your pair satisfies for normal and large text." },
      { step: "Judge the preview block as well as the numbers, since a pair can pass at 4.5 to 1 and still read thinly at small sizes." },
    ],
    whenToUse:
      "Use the contrast checker as the general-purpose gate for a single text-and-background pair, because it answers every WCAG 2.x threshold at once and does not commit you to one level. Reach for the {{contrast-ratio-calculator|contrast ratio calculator}} when the ratio itself is the deliverable, and the {{wcag-21-aa-checker|WCAG 2.1 AA checker}} or {{wcag-21-aaa-checker|WCAG 2.1 AAA checker}} when a project has already committed to one level and you want a single verdict. Pairs that involve a visible boundary rather than text belong with the {{ui-component-contrast-checker|UI component contrast checker}} and {{focus-indicator-contrast-checker|focus indicator contrast checker}}, and any pair you suspect survives contrast but fails real reading should go through the {{text-readability-checker|text readability checker}}.",
    faqs: [
      {
        q: "Why does a pair pass AA but fail AAA?",
        a: "The two levels gate on different numbers. AA asks for 4.5 to 1 for normal text, while AAA asks for 7 to 1, so a ratio of, say, 5.8 to 1 satisfies every AA badge and neither AAA one. The badges are computed independently from the same ratio, so nothing is inconsistent when they disagree.",
      },
      {
        q: "My pair reads 4.4 to 1 and looks fine. Is the fail a rounding artefact?",
        a: "No. The badge is compared against the ratio rounded to two decimals, so 4.4 to 1 is genuinely below the 4.5 threshold rather than a display shortcut. Moving either color by a few percent of lightness is usually enough to clear it.",
      },
      {
        q: "Does the checker use the contrast ratio or the newer APCA formula?",
        a: "It uses the WCAG 2.x contrast ratio throughout, which is the formula the AA and AAA thresholds are defined against. The label on the WCAG 3.0 APCA page makes clear that no APCA calculation happens in this tool.",
      },
      {
        q: "Can I check a color with transparency in it?",
        a: "The two swatches take solid colors, so there is no alpha channel to evaluate. Composite the translucent color onto its real backdrop first, then paste the resulting opaque color in, otherwise the ratio will be measured against a background that is not what ships.",
      },
      {
        q: "Which badge should I use for a button label?",
        a: "It depends on how the label is set. At ordinary body size the AA normal badge applies; at roughly 24px, or 18.66px bold, the AA large badge is the correct bar. The component check covers the button's own boundary, which is a separate requirement from its label.",
      },
    ],
  },

  "cool-color-generator": {
    keywords: [
      "cool color generator",
      "cool color palette",
      "generate a cool color scheme",
      "cyan blue violet palette",
    ],
    intro:
      "The cool color generator builds a five-color palette from the cool half of the wheel, drawing each swatch from the cyan, blue and violet band.",
    content:
      "- The cool color generator produces a palette of five swatches drawn from the cool side of the colour wheel, and it is that restriction rather than any cleverness in the generation that defines it.\n- Press the button and the five slots are filled from a hue band running from about 180 degrees through blue and on to 280, which in plain terms means cyan, blue and violet.\n- Nothing warm can appear, however many times you press, because the warm end of the wheel is simply outside the range the generator draws from.\n- That makes it a useful escape hatch when a design needs a cool direction and you want options rather than a theory lesson.\n\nThe lightness range is mid, from about 50 to 75 percent, and saturation sits between a modest and a fairly strong level. Those bounds are what keep the output usable as a palette rather than a set of novelty colours: nothing comes out near-black or neon, so the swatches are plausible as surfaces, accents or chart series without adjustment. Each of the three properties is drawn independently for each swatch, which has a consequence worth knowing before you use the result.\n\n- That consequence is that the palette is genuinely a palette and not a ramp.\n- Because hue, lightness and saturation all vary independently, there is no guaranteed progression from light to dark, and no guarantee that the five swatches are spread out rather than clustered.\n- Press repeatedly and you will sometimes get five colours that sit very close together, and sometimes a set with a clear lead colour and four supporting tones.\n- That is the price of generating rather than curating, and it is also why the button is the whole interface: if a set does not work, generating another costs nothing.\n\nThe swatches are drawn once the page is interactive rather than baked into the markup, so a cool color palette appears on load and changes on each press. Every swatch carries its hex value and a copy button, which means the result can be lifted into a project without a second step. What you do not get is any guidance about roles: nothing in the output says which of the five should be a background and which an accent, and that assignment is the part that actually determines whether a palette works.\n\nTypical uses are starting points rather than finished schemes. It is a reasonable way to begin a dashboard, an internal tool, a technical product page or anything where the brief says cool or calm without being more specific. It is equally useful as a prompt when you are stuck on direction, because looking at five cyan and blue options side by side is faster than trying to imagine them. From there, the natural next steps are to build a ramp around the colour you choose using the shade and tint tools, and to check your chosen pairings before they are used for text.\n\nTwo limits are worth stating plainly. The generator does not check its own output: it says nothing about whether the five colours have enough contrast to be used together, so a set that looks coherent can still contain a pair that fails as text and background, and a contrast checker is the tool for that question. Nor does it produce relationships: if you need a complement or a triad rather than a range, the harmony tools compute those angles exactly.\n\nRead it as a cool color generator in the practical sense: one control, five values, all of them from the cool half of the spectrum, ready to copy. When the goal is simply to generate a cool color scheme — a cyan blue violet palette with mid lightness and moderate saturation — the value of starting here is that the whole warm end of the wheel is ruled out for you, and deciding between five options is a much smaller problem than deciding between all of them.",
    howTo: [
      { step: "Press the generate button to roll five colours from the cool range." },
      { step: "Press again for a fresh roll — the set is random each time." },
      { step: "Copy the values you want to keep before rerolling, because nothing is stored." },
      { step: "Reach for the warm generator when the set needs the other side of the scale." },
    ],
    whenToUse:
      "Use it for a cool starting point — dashboards, technical products, calm interfaces — or as a prompt when you know a direction is cool but not yet which hue. Use the harmony tools when you need an exact relationship and the shade or tint generators to build a ramp from a chosen swatch. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "Why can no warm colors appear?",
        a: "Because the generator draws its hues from a band running roughly from 180 to 280 degrees, which covers cyan, blue and violet. The warm end of the wheel is outside that range entirely.",
      },
      {
        q: "Do the five colors form a light-to-dark ramp?",
        a: "No. Hue, lightness and saturation are drawn independently for each swatch, so the set may be evenly spread or may cluster. It is a palette rather than a progression.",
      },
      {
        q: "Will the colors work together for text?",
        a: "Not automatically. The generator does not measure its own output, so check any pairing you intend for text with a contrast checker before using it.",
      },
      {
        q: "How do I get a different set?",
        a: "Press the button. Every press redraws all five swatches, so regenerating until a set feels right is the intended way to use it and costs nothing.",
      },
      {
        q: "What does the cool color generator not do?",
        a: "Because hue, lightness and saturation all vary independently, there is no guaranteed progression from light to dark, and no guarantee that the five swatches are spread out rather than clustered. Press repeatedly and you will sometimes get five colours that sit very close together, and sometimes a set with a clear lead ",
      },
    ],
  },

  "corporate-palette-generator": {
    keywords: [
      "corporate palette generator",
      "business color palette",
      "low chroma blues",
      "professional color scheme",
    ],
    intro:
      "The corporate palette generator is built for professional color schemes: three low-chroma blues, a red and an orange, spread across a lightness ramp from 0.35 to 0.65.",
    content:
      "There is a reason enterprise design looks the way it does, and this preset encodes it: blues at 220, 200 and 240 carry the structure, a red at 0 and an orange at 30 supply the only two warm values, and chroma is rolled between 0.04 and 0.12 — low enough that nothing in the set can shout. Lightness climbs from 0.35 to 0.65 across the strip, which gives a business color palette both a surface and a light accent without straying outside the register.\n\n- Hues: blue at 220, cyan-blue at 200, indigo at 240, red at 0 and orange at 30.\n- Lightness: 0.35, 0.425, 0.5, 0.575 and 0.65.\n- Chroma: rolled per swatch inside 0.04 to 0.12 — deliberately restrained.\n- Output: five hex swatches plus a copyable block of CSS custom properties.\n\nLow chroma blues are the load-bearing part of that arrangement. Blues survive small sizes, printed reproduction, projection and colour-vision deficiency better than most families, and keeping chroma low means the palette still looks calm when it is used at scale. The single red at hue 0 exists for the opposite purpose: it is the only value in the strip that can carry a warning or a required field, and its presence is what makes the set a professional color scheme rather than a monochrome one.\n\n- Only five values, so nothing here covers error, warning, success and information states at once.\n- The red and orange are close neighbours; using both for different meanings invites confusion, so pick one as the alert colour.\n- Nothing dark enough for body text; a near-black ink is still needed.\n- No preset selector, no alpha, and no theme tokens beyond the five hex custom properties.\n\nJudged as a corporate palette generator rather than as a brand, the set has to survive two tests: small type and large surfaces. Low chroma helps with both — a blue at chroma 0.06 keeps its shape at twelve pixels and stays calm behind a wall of text, where the same hue at full saturation would look loud in one context and muddy in the other. That is the practical argument for the register.\n\nThe register is a cliché for a reason: it works where trust matters more than personality — finance, healthcare, government, enterprise software, and any product whose audience has to believe it will still exist in five years. Where the brand needs to be remembered rather than trusted, this palette will underperform by design, and the neon or Wes Anderson presets are better starting points. The dark-mode generator converts these surfaces for a night theme, the shades tools fill in the tonal steps a full status system needs, and the palette accessibility checker audits whichever values end up carrying text or icons. Treat the palette as the floor of the brand system rather than as the whole of it: the register is deliberately quiet, and anything expressive has to be added on top. One accent, chosen deliberately, is usually enough to keep it from feeling anonymous.",
    howTo: [
      { step: "Open the page for the first professional roll." },
      { step: "Press Regenerate to re-roll chroma while the blue-heavy hue order and the ramp stay fixed." },
      { step: "Reserve either the red or the orange for alerts, not both." },
      { step: "Add a near-black ink and, if needed, a tonal ladder from the shade tools." },
    ],
    whenToUse:
      "Use this when trust and legibility outrank memorability — finance, health, government and enterprise products. The {{dark-mode-palette-generator|dark mode palette generator}} adapts the same surfaces for a night theme, the {{color-shades-generator|shades generator}} builds the extra tonal steps a status system needs, and the {{palette-accessibility-checker|palette accessibility checker}} audits the values that end up carrying text.",
    faqs: [
      {
        q: "Why is the palette almost entirely blue?",
        a: "Because blues hold up across sizes, printing, projection and colour-vision deficiencies, which is exactly what a palette has to do when trust is the brief. The other hues are accents rather than structure.",
      },
      {
        q: "Can I use both the red and the orange for different meanings?",
        a: "Better to pick one. They sit close on the wheel and read as the same signal at small sizes, so two meanings attached to them will be confused.",
      },
      {
        q: "Does the set cover status colours?",
        a: "Only partially. One alert colour is available; success and information states need extra values, usually built from the blues with the shade tools.",
      },
      {
        q: "Is a low-chroma palette boring by accident or on purpose?",
        a: "On purpose. Restraint is what keeps a palette credible at scale and across media; a more saturated set would compete with the content it is framing.",
      },
      {
        q: "Where would this palette be the wrong choice?",
        a: "Anywhere the brand has to be remembered rather than trusted — entertainment, youth products, nightlife. Those briefs want a register with more chroma and more personality.",
      },
    ],
  },

  "css-backdrop-filter-generator": {
    keywords: [
      "css backdrop filter generator",
      "backdrop-filter blur",
      "frosted glass css generator",
      "backdrop filter with saturate",
    ],
    intro:
      "The CSS backdrop filter generator pairs a blur radius with a saturation control and previews the frosted glass effect over a live background, then hands you the declaration.",
    content:
      "- Two controls do the work: a blur radius in pixels, defaulting to twelve on a scale from zero to forty, and a saturation percentage defaulting to one hundred and twenty on a scale from zero to two hundred.\n- Between them sits a live preview in which a translucent panel is laid over a coloured background, so the effect is visible as you drag rather than after a rebuild.\n- Underneath, the tool emits the finished declaration with a copy button.\n\nWhat separates backdrop-filter blur from an ordinary blur is what gets filtered. A regular blur applies to the element's own pixels and smears its content. A backdrop filter applies to whatever is painted behind the element, leaving the element itself sharp. That is why the effect behind frosted glass is the background becoming soft while any text on the glass stays crisp, and it explains the one requirement people most often miss: the element needs some transparency of its own, because an opaque surface hides the filtered backdrop entirely.\n\nThe saturation control is the part that turns a grey smear into glass. Blurring a background averages its colours, which tends to mute them, and a heavily blurred backdrop can look washed out and lifeless as a result. Pushing saturation above one hundred percent compensates by intensifying what remains visible behind the panel, so a backdrop filter with saturate above neutral keeps the colour underneath vivid rather than draining it. Dropping below one hundred percent does the opposite and is useful when the content on the glass needs to dominate.\n\nIn practice the workflow is to fix the background first and treat the panel as a layer over it, since the whole effect depends on what is behind. Then set the blur to taste: small radii give a subtle softening that reads as a tinted panel, while larger ones produce the unmistakable frosted glass look at the cost of hiding detail. Finally bring saturation in until the backdrop has some life left, checking that text on the panel is still readable against what shows through.\n\nThe uses are mostly overlays and chrome. A frosted glass css generator like this covers sticky headers that stay legible over scrolling content, modal dialogs and bottom sheets, media player controls, quick-look panels over a wallpaper, and navigation bars over hero images. The appeal in all of those cases is the same: the panel stays visually connected to what is behind it instead of cutting it off, while still separating itself enough to hold content.\n\nThere are a few limits worth knowing.\n\n- The declaration filters the backdrop rather than the element, so it cannot blur an element's own content — that needs a different property.\n- It does not create the tint either: the colour of the glass comes from a semi-transparent background of its own, which this tool does not set.\n- Large blur radii can be expensive to composite, particularly on low-powered devices, so a generous value is worth testing on the hardware that matters.\n- And no fallback is emitted, so a browser without support simply shows the unfiltered background.\n\nRead it as a css backdrop filter generator for the two numbers that matter most: how much the backdrop blurs, and how much of its colour survives. Copy the declaration, add your own translucent background, and the effect is complete, which makes this a faster way to find the right blur and saturation values than editing a stylesheet and refreshing.",
    howTo: [
      { step: "Set the blur radius with the first slider, from zero to forty pixels." },
      { step: "Set the saturation with the second slider, from zero to two hundred percent." },
      { step: "Judge the effect on the sample panel over the gradient." },
      { step: "Copy the backdrop-filter declaration from the CSS panel." },
    ],
    whenToUse:
      "Use it to find a blur and saturation pair for frosted panels, sticky headers, modals and media controls. Use the distinct glassmorphism and frosted glass generators when you want the complete panel recipe with its tint rather than just the filter. When the whole panel should be generated rather than just the filter, the {{glassmorphism-generator|glassmorphism generator}} writes the tint, border and radius alongside the blur; when the element's own content should be blurred instead, the {{css-filter-generator|CSS filter generator}} is the other property.",
    faqs: [
      {
        q: "What do the two controls change?",
        a: "Blur sets how much the background behind the element is smeared, from zero to forty pixels. Saturation adjusts how much of that backdrop's colour survives, from zero to two hundred percent.",
      },
      {
        q: "Why does the effect not appear on my element?",
        a: "Because the element is opaque. A backdrop filter applies to what is painted behind it, so the element needs some transparency or the filtered backdrop is hidden.",
      },
      {
        q: "Why pair saturation with the blur?",
        a: "Blurring averages a background, which tends to mute it. Raising saturation above neutral keeps the backdrop vivid behind the panel instead of washing it out.",
      },
      {
        q: "Does it give me the frosted panel's colour?",
        a: "No. The declaration covers the filter only. The tint of the glass comes from a semi-transparent background you set yourself, which the preview does not include.",
      },
      {
        q: "What should the element's own background be?",
        a: "Something semi-transparent: the filter has no tint of its own, so the panel's colour comes from a background value you set on the element. A translucent white, or black at low alpha, is the usual pairing with a saturated blur.",
      },
    ],
  },

  "css-background-color-preview": {
    keywords: [
      "css background color preview",
      "preview a css color value",
      "test css background value",
      "check a css color string",
    ],
    intro:
      "The CSS background color preview renders any CSS background value in a large block, so a string you are unsure about either shows up correctly or fails visibly.",
    content:
      "- The CSS background color preview is one input and one output: type or paste a CSS background value into the field, and the block beside it renders using exactly that value.\n- There are no options, no colour wheel and no palette, which makes it a fast way to answer a narrow question — does this string do what I think it does?\n- The value is applied as a background rather than parsed as a single colour, so the tool covers more than colours, and the browser does the rendering, so the answer is authoritative rather than an approximation.\n\nThe reason a dedicated preview earns its place is that CSS fails silently. An invalid or unsupported value is discarded by the browser without an error and without anything appearing in the console; the element simply renders as though the declaration were never written, usually showing whatever was underneath it. That silence is what makes colour problems slow to diagnose, because the symptom is a wrong colour rather than a broken page. Isolating the value in a preview removes the ambiguity: if the block renders, the value is fine and the problem lies elsewhere, and if it stays blank, the value itself is the fault.\n\nWhat you can put in the field is broader than the name suggests. Hex codes work, as do the rgb and rgba functions, hsl and hsla, hwb, and the newer lab, lch and oklch notations, along with every standard named colour. Gradients and other background syntaxes work too, since they are valid backgrounds, which means the same block can confirm that a linear gradient runs in the direction you expected or that a radial gradient's centre lands where you intended. Replacing one value with another is a matter of typing over it.\n\nDay to day it gets used for a handful of things. Checking a token before it ships, especially when the value was generated, copied from a tool, or pasted from a message where a character may have been mangled. Comparing two candidates by overwriting one with the other, which is easier when the sample is large. Verifying unusual syntax, such as a colour function with unexpected units or a gradient with several stops, where reading the string tells you less than looking at the result. And confirming that a declaration survived a refactor, which is the case where a silent failure does the most damage.\n\nThe workflow is intentionally minimal: paste, look, adjust. Because the preview updates as you type, there is no apply step and no state to reset, and a correct value is confirmed in under a second. That makes it something to keep open while editing a theme file rather than a tool you visit for a specific task, since the cost of a check is a paste.\n\nA few boundaries are worth stating.\n\n- Only one value is shown at a time, so it does not composite a colour over a chosen surface — that is a separate two-input tool.\n- Nothing is measured: no contrast ratio and no distance figure, so legibility and similarity questions need their own tools.\n- Nothing is validated explicitly either, which is why an unusable string produces an empty block rather than a message explaining what is wrong.\n\nUsed as a css background color preview, it does one job with no ceremony: render the string, so you can see whether it works. When the task is to preview a css color value quickly, to test css background value syntax you rarely write, or simply to check a css color string that came from somewhere untrusted, pasting it here and looking is faster and more reliable than reasoning about it.",
    howTo: [
      { step: "Type a CSS colour value into the field — rgb(59, 130, 246) opens on screen." },
      { step: "Watch the preview block fill with the value as you type." },
      { step: "Edit the value to compare one notation against another before it goes into a stylesheet." },
    ],
    whenToUse:
      "Use this preview to confirm that a CSS value renders as intended, particularly after a refactor or when the value came from a generator. Use the format validator for an explicit valid-or-invalid verdict, and the two-input preview when you need a color composited over a background. When the value has to carry text, the {{contrast-checker|contrast checker}} measures what the preview only shows, and when it has to match a name rather than a number, the {{css-named-colors-reference|CSS named colors reference}} is the lookup.",
    faqs: [
      {
        q: "Which value formats can I paste?",
        a: "Any valid CSS background: hex, rgb, rgba, hsl, hsla, hwb, lab, lch, oklch and named colors, plus gradients, since the value is applied directly as the background.",
      },
      {
        q: "Why does the block stay empty?",
        a: "Because the browser discarded the value. Invalid or unsupported CSS fails silently with no error message, so an empty block is the signal that the declaration is the problem.",
      },
      {
        q: "Can I compare two values side by side?",
        a: "Not simultaneously. One value is rendered at a time, so comparing candidates means overwriting the field and watching the block change.",
      },
      {
        q: "Does it tell me the contrast ratio?",
        a: "No. It shows the rendering only. Use a contrast checker when you need a ratio, and the format validator when you want an explicit yes or no on the string.",
      },
      {
        q: "Does the field keep a history of what I have tried?",
        a: "No — one value at a time, and a reload returns the default rgb(59, 130, 246). Anything worth keeping has to be copied into your own notes or the stylesheet you are working on.",
      },
    ],
  },

  "css-border-color-generator": {
    keywords: [
      "css border color generator",
      "css border with radius",
      "border style preview",
      "generate border css",
    ],
    intro:
      "The CSS border color generator combines a color, width, radius and style into a live preview and emits the finished border declarations for you to copy.",
    content:
      "The CSS border color generator assembles a border from four decisions and shows you the result immediately. You choose a colour, a width from zero to twenty pixels defaulting to two, a corner radius from zero to forty-eight pixels defaulting to twelve, and a style from solid, dashed, dotted or double, with solid selected to begin with. A preview box renders the combination, and the panel below emits the finished CSS as two declarations with a copy button. It is a small tool that removes a genuinely tedious loop, because a border is one of the few CSS features where the visual result is hard to predict from the values. Treat it as a border style preview as much as a code generator: the box on screen is where the decision actually gets made, and the declarations are a by-product of settling it.\n\nThe output is a border shorthand plus a radius declaration, which is worth noticing. The colour is embedded in the shorthand rather than being written as a separate border-colour property, so what comes out is a complete border rule you can apply to any element, followed by the corner rounding. Both declarations are plain, unminified and in a fixed order, so the result can be pasted into a stylesheet, a styled component or an inline style without editing, and it reads well in a diff.\n\nPredicting the result from the numbers is exactly where the preview pays for itself. A dashed border at one pixel looks like a dotted line because the gaps are proportionally tiny, while the same dash pattern at six pixels reads as a clearly broken rule. A dotted border at a large radius behaves differently again, because the dashes follow the curved corners and their spacing changes around them. Double borders need enough width to show two distinct lines, and a two-pixel double is indistinguishable from a solid. None of that is obvious from a value, and all of it is obvious from a preview.\n\n- The colour is the decision most worth pausing on, because borders are where contrast requirements are most often quietly missed.\n- The boundary of an interface component is expected to reach a contrast ratio of three to one against its surroundings, and a border that is a subtle tint of the surface behind it will fail that test while looking perfectly deliberate to a designer on a calibrated screen.\n- Picking the colour last, once the geometry is settled, makes it easier to judge the border on its own terms rather than as part of the shape, and any pairing that matters should be measured rather than eyeballed.\n\nA sensible order of work runs from the outside in. Corner radius is usually driven by the shape of the interface rather than by the border itself, so settle it first. Width comes next, because it determines how much of the style pattern will actually be visible. Style follows, since dash and double patterns only make sense at a width that can show them. Colour comes last, when the geometry is fixed and the remaining question is purely one of emphasis against the surface.\n\nA few limits are inherent to the approach.\n\n- The tool generates one border applied to all four sides, so asymmetric borders — a bottom rule under a header, say — have to be adapted by hand into their longhand form.\n- There is one colour for the whole border, so a gradient or an image border is out of scope, and no fallback is emitted for browsers that do not support a given style.\n- The preview also shows the border on a neutral card rather than on the surface it will really sit against, so the final judgement of contrast belongs on the page itself.\n\nUsed as a css border color generator, it turns four sliders and a dropdown into a visible result and a pasteable rule, which is the whole value. When you need a css border with radius settled quickly, or you want to generate border css for a component without the edit-and-refresh loop, this removes the guesswork, and the emitted declarations are usually exactly what you would have written by hand.",
    howTo: [
      { step: "Set the border colour with the colour field." },
      { step: "Set the width and radius with the sliders — up to twenty and forty-eight pixels." },
      { step: "Pick a style from the dropdown: solid, dashed, dotted or double." },
      { step: "Copy the declarations from the CSS panel." },
    ],
    whenToUse:
      "Use it to settle a border's colour, width, radius and style together and get pasteable declarations. Use a contrast checker when the border has to distinguish an interface component, since boundaries are expected to reach three to one. The other half of a card's edge treatment is the {{box-shadow-color-tool|box shadow color tool}}, and a border colour that has to travel with a theme is what the {{css-custom-properties-exporter|CSS custom properties exporter}} carries.",
    faqs: [
      {
        q: "What CSS does it produce?",
        a: "Two declarations: a border shorthand carrying the width, style and colour, followed by a border-radius. Both are plain and ready to paste without editing.",
      },
      {
        q: "Why does my dotted border look solid?",
        a: "At small widths the gaps between dots are proportionally tiny and read as a solid line. Increase the width to make the pattern visible, or preview the change before committing.",
      },
      {
        q: "Can I style each side differently?",
        a: "Not here. The tool generates one border applied to all four sides, so asymmetric borders need adapting into their longhand form by hand.",
      },
      {
        q: "Does the border need enough contrast?",
        a: "If it distinguishes an interface component, yes. The boundary is expected to reach a three to one ratio against its surroundings, so measure the pairing rather than judging it by eye.",
      },
      {
        q: "Can I get longhand properties instead of the shorthand?",
        a: "Not from the panel — the output is the shorthand plus a radius declaration. Per-side declarations are a manual expansion of the copied CSS, which is also what asymmetric borders need.",
      },
    ],
  },
};
