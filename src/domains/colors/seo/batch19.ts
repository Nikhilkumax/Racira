import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 19.
 *
 * Skipped from this window:
 *  - linear-gradient-generator — renders the identical GradientBuilder as the already
 *    authored gradient-angle-adjuster (same two default stops, same 90 degree start,
 *    same CSS output). Its phrasing is folded into that page's keywords. The natural
 *    fix is a defaults prop on the shared builder, so the plain generator can open
 *    with a different ramp.
 *  - just-noticeable-difference-calculator — renders the same ColorDistance as the
 *    authored color-distance-calculator.
 *  - material-ui-color-exporter / chakra-ui-color-exporter — flagged: both render the
 *    Tailwind class generator.
 */
export const SEO_BATCH_19: Record<string, ToolSeo> = {
  "large-text-contrast-checker": {
    keywords: [
      "large text contrast checker",
      "3 to 1 contrast",
      "heading contrast",
      "large text aa contrast",
    ],
    intro:
      "Large Text Contrast Checker tests a pair against the 3 to 1 minimum that WCAG 2.1 AA allows for large text, the relaxed bar that applies to headings and display type.",
    content:
      "Large Text Contrast Checker tests a color pair against 3 to 1, the lower contrast minimum that WCAG 2.1 AA permits for large text. It is the check to use for headings, display type and oversized labels, where the stricter 4.5 to 1 requirement does not apply and checking against it would reject pairings that are perfectly acceptable.\n\nThe relaxation exists because size compensates for a certain amount of lost contrast, and it applies at two points on the type scale:\n\n- Large text at 3 to 1, where large means approximately 24px, or 18.66px when the text is bold.\n- Ordinary text at 4.5 to 1, which is the bar this page deliberately does not apply.\n- AAA large text at 4.5 to 1, one step above this page's gate, for comparison.\n\nThis page is aimed at the first of those. Every pair you enter is compared against 3 to 1 and reported as Pass or Fail with the threshold shown beside the verdict.\n\nThe figure being compared is the WCAG 2.x contrast ratio. Both colors are parsed and converted to sRGB, each channel is linearised out of its gamma curve, and the linear values are weighted 0.2126 red, 0.7152 green and 0.0722 blue to produce a relative luminance. The ratio is the lighter luminance plus 0.05 divided by the darker plus 0.05, rounded to two decimals before comparison. Because 3 to 1 is a low bar by ratio standards, a wide range of mid-tone pairs clear it, which is exactly why the large-text exemption is only safe for type that genuinely is large.\n\nThink of the result as the large text AA contrast verdict for a heading contrast pairing, with the 3 to 1 contrast bar as the only threshold tested. The allowance is generous, so most sensible foreground and background pairs clear it, and the more useful question is usually how far above the bar you sit rather than whether you passed at all. A pair that also clears 4.5 to 1 removes the need to police the size boundary entirely, which is worth the extra effort on any heading that might later be reused at a smaller size.\n\nThat last point is the main limitation, and a few others follow from it.\n\n- The tool does not know how large your text is. It applies the large-text threshold to whatever pair you enter, so using it on body copy would return a pass that the specification does not grant.\n- There is no size or weight input, so the boundary between large and ordinary text is yours to police.\n- AAA is not assessed. A pair can pass here and be nowhere near the 7 to 1 enhanced level.\n- Non-text contrast is out of scope, including borders and focus rings, which carry their own requirement.\n- Two colors only, with no alpha and no surface behind them.\n\nUse this page for headings, hero text, chart labels set large and any other type that is comfortably above the large-text size. For running copy, use the ordinary AA check instead, and for a boundary rather than text, use the component or focus check. When in doubt about whether your text counts as large, check both: a heading pair that also clears 4.5 to 1 is immune to the question entirely.",
    howTo: [
      { step: "Set the heading or display color in the foreground field." },
      { step: "Set the surface behind it in the background field." },
      { step: "Read the ratio in the panel heading, to two decimal places." },
      { step: "Check the Pass or Fail verdict against the 3 to 1 threshold, and confirm your text really is large before relying on it." },
    ],
    whenToUse:
      "Use the large text contrast checker for headings, display type and any label set comfortably above the large-text size, where the 3 to 1 allowance is the correct bar. Use the {{wcag-21-aa-checker|WCAG 2.1 AA checker}} for running body copy, the {{contrast-checker|contrast checker}} when you want the large-text and normal-text thresholds side by side for the same pair, and the {{ui-component-contrast-checker|UI component contrast checker}} or {{focus-indicator-contrast-checker|focus indicator contrast checker}} when the thing being judged is a boundary rather than type.",
    faqs: [
      {
        q: "What counts as large text under WCAG 2.1?",
        a: "Roughly 24px for normal weight text, or about 18.66px when bold. Those correspond to 18pt and 14pt in the point sizes the specification uses, and they are the boundary below which the 4.5 to 1 requirement applies instead.",
      },
      {
        q: "Is 3 to 1 safe for body copy if the text is simply big?",
        a: "Only while it stays above the large-text size. The ratio belongs to the pair, so the same colors that pass for a 32px heading would fail the normal-text requirement if the type were reduced later. Check the size your design will actually ship with.",
      },
      {
        q: "Why does AAA use a different number for large text?",
        a: "AAA sets 4.5 to 1 for large text and 7 to 1 for normal text. This page applies the AA large-text figure of 3 to 1, so a pair can pass here and still fall short of the enhanced level for the same size.",
      },
      {
        q: "Does bold text get a lower requirement than regular text?",
        a: "It gets one at a smaller size. Bold text becomes large at roughly 18.66px rather than 24px, so heavier type reaches the relaxed threshold sooner. Below that size the same 4.5 to 1 applies as for regular text.",
      },
      {
        q: "Can I use a 3 to 1 pair for a button label?",
        a: "Only if the label is set large and the button's own boundary also meets the non-text requirement. A button label at ordinary size still needs 4.5 to 1, and the fill against its surrounding surface is a separate 3 to 1 check.",
      },
    ],
  },

  "less-variable-generator": {
    keywords: [
      "less variable generator",
      "less variables from colors",
      "less color variables",
      "generate less variables",
      "less color palette code",
    ],
    intro:
      "The LESS variable generator writes a palette out as LESS variables in the @name form, ready to paste into a stylesheet that is compiled with Less.",
    content:
      "- The LESS variable generator presents a list of name-and-colour rows and writes one variable declaration for each.\n- Two rows are provided to begin with, primary and danger, and Add appends more, each seeded with a random colour.\n- Every row has a text field for the name, a colour field for the value and a delete button; the output panel, headed LESS, updates as you type and a copy button takes the whole block.\n\nThe syntax Less expects is the reason a dedicated page is useful. Where Sass declares a variable with a dollar sign, Less uses an at sign, so a name typed as primary becomes @primary followed by a colon and the value. Both compile to the same result; only the notation differs, and moving a palette between the two is a mechanical change that a generator removes the risk from. Values are written as hex, so they can also be used directly in colour functions that Less provides.\n\n- Naming is worth a moment before copying, because Less is more permissive than JavaScript about what a variable name can contain.\n- Hyphens are legal, so surface-muted is as valid here as surfaceMuted would be — unlike the CSS-in-JS generator in this domain, where a hyphen produces code that will not run.\n- The convention worth adopting is consistency with the rest of the stylesheet rather than any particular spelling, since the whole point of a variable is that the name is the thing call sites depend on.\n\nThe output is deliberately minimal: one declaration per row, nothing else. No @import, no namespace, no comments and no grouping. That makes it easy to splice into an existing variables file, and it means the block is not a complete Less file on its own. Because the values are hex, they can also be composed with Less's colour functions — lightened, darkened, mixed — at the point of use, which is often the better pattern than generating every tint here.\n\nIn practice the shortest workflow is to name the tokens the way the project already refers to them, set the values, and copy. If you are migrating from Sass, keep the same names and change nothing else; the declarations will drop into the existing file and the call sites stay valid because only the sigil changed.\n\nWhat it does not do is mixins, nesting, guards or any other Less language feature — this is a colour variable exporter, and every line is a name bound to a hex value. There is no validation, so a blank name produces a declaration with no variable and a duplicate name silently produces two declarations of the same variable, with the later one winning. And it emits one flat list rather than a scoped structure.\n\nWithin those limits it does the one job cleanly. To generate less variables from colors is the whole job, and it removes the sigil errors and typing that come with transcribing a palette by hand. For anyone generating less variables from colors — or simply assembling a set of less color variables as a less color palette code block for a compiled stylesheet — the workflow is a list of names, a copy, and a paste. The same row interface also drives the SCSS and CSS-in-JS outputs, so the naming decisions carry across if the project later changes preprocessors.",
    howTo: [
      { step: "Replace the default names with the tokens your stylesheet uses, hyphens are fine in Less." },
      { step: "Set each value with the field beside its name, or add rows with Add." },
      { step: "Copy the block from the LESS panel into your variables file." },
    ],
    whenToUse:
      "Use this when a palette has to reach a stylesheet compiled with Less. Use the SCSS generator for Sass syntax, or the CSS variables generator when the tokens should be custom properties instead of build-time variables. The {{css-in-js-color-object-generator|css-in-js color object generator}} is the sibling whose syntax will not tolerate the hyphens this one accepts, and a token set that has to stay available at runtime is the {{css-custom-properties-exporter|CSS custom properties exporter}}'s output.",
    faqs: [
      {
        q: "How are the variables named?",
        a: "With an at sign — typing primary produces @primary. Less uses @ where Sass uses $, and this page writes the Less form.",
      },
      {
        q: "Can names contain hyphens?",
        a: "Yes. Less allows them, so surface-muted is valid. The CSS-in-JS generator is the one that breaks on hyphenated names, because those become unquoted object keys.",
      },
      {
        q: "Is the output a complete Less file?",
        a: "No. It is one declaration per row with no imports, comments or nesting, designed to be pasted into an existing variables file.",
      },
      {
        q: "Can I use Less colour functions on the values?",
        a: "You can — the values are plain hex, so functions such as lighten and mix can be applied at the point of use in your own stylesheet.",
      },
      {
        q: "Can I import the block into another Less file?",
        a: "Yes — it is plain declarations, so importing the file brings every variable with it. The generator itself emits no import line, which keeps the output to the part you actually need.",
      },
    ],
  },

  "light-mode-palette-generator": {
    keywords: [
      "light mode palette generator",
      "light ui color palette",
      "tinted white surfaces",
      "light background palette",
    ],
    intro:
      "The light mode palette generator produces five tinted white and pale blue surfaces from a fixed run with lightness between 0.85 and 0.97 — a light ui color palette built for bright themes.",
    content:
      "Bright interfaces live or die on surfaces that are nearly white but not identical to each other, and that is precisely the band this preset occupies. Its hues are 220, 200, 180, 0 and 30 — blue, cyan-blue, teal, a red and an orange — with lightness climbing from 0.85 to 0.97 and chroma rolled between 0.02 and 0.08. The tints are barely visible as colours and entirely visible as layers, which is the point of a light background palette.\n\n- Hues: 220, 200, 180, 0 and 30, giving blue, cyan, teal, red and orange casts.\n- Lightness: 0.85, 0.88, 0.91, 0.94 and 0.97 — five steps from soft tint to near paper.\n- Chroma: rolled per swatch in the very narrow band 0.02 to 0.08.\n- Output: five hex swatches and a copyable CSS custom-property block.\n\nThe narrow chroma band is what makes the result usable rather than decorative. At 0.02 a surface reads as white with an attitude; at 0.08 it is a distinguishable tint that can still sit behind dark text without competing. Because the ramp tops out at 0.97, the lightest swatch behaves like paper, and the darkest gives a footer or sidebar somewhere to sit without turning into a block of colour. Tinted white surfaces also avoid the pitfall of pure white in bright themes, where every subtle elevation change is invisible and the page reads as flat.\n\n- Text colours are not included: dark ink, muted ink and link colours all have to come from elsewhere.\n- Nothing in the set is dark enough for a border or a divider that must read clearly against the lightest surface.\n- The warm casts at hue 0 and 30 are easy to overuse; one warm surface plus four cool ones is the balance the preset implies.\n- No preset selector, no transparency, no theme tokens beyond the five hex custom properties.\n\nNaming the levels matters here for the same reason it does in a dark theme. A light mode palette generator is really a surface contract: page, panel, card, control and hover, one value each, so that a new component cannot invent its own near-white. Written down that way, a light ui color palette stops being a set of colours and becomes the rule that keeps a bright interface coherent as it grows.\n\nUse it as the base of a bright theme and assign it as a ladder: page, panel, card, raised control, hover state, from the lightest to the darkest. Then choose one accent and verify it against the two extremes with the contrast checker, because pale surfaces make accents look stronger than they measure. The dark-mode generator mirrors this page for night themes, the neutral shades tools supply the greys and inks this preset deliberately leaves out, and the CSS variables generator writes the ladder out as named tokens once the levels are assigned. A theme built from five named surfaces is far easier to audit than one assembled from dozens of near-whites.",
    howTo: [
      { step: "Open the page for the initial set of pale surfaces." },
      { step: "Press Regenerate to re-roll the tint chroma while the lightness ladder stays fixed." },
      { step: "Assign the five levels to page, panel, card, control and hover states." },
      { step: "Choose a dark ink and an accent separately, then measure both against the extremes." },
    ],
    whenToUse:
      "Use this as the surface base of a bright interface that needs more structure than plain white provides. The {{dark-mode-palette-generator|dark mode palette generator}} is the mirror for night themes, the {{css-color-variables-generator|CSS variables generator}} writes the levels out as named tokens, and the {{contrast-checker|contrast checker}} verifies the ink you pair with them.",
    faqs: [
      {
        q: "Are these colours or just pale greys?",
        a: "Tinted surfaces. The chroma band is 0.02 to 0.08, so at the low end they read as white with a cast, and at the high end as a clearly distinguishable tint.",
      },
      {
        q: "Why not use pure white for a light theme?",
        a: "Because elevation becomes invisible. Several near-whites at different lightness give cards, panels and hover states something to separate by, which one flat white cannot do.",
      },
      {
        q: "Where do text colours come from?",
        a: "Elsewhere — this preset supplies surfaces only. A dark ink, a muted ink and a link colour all have to be chosen and checked against these values.",
      },
      {
        q: "Why is one warm tint included among the cool ones?",
        a: "For contrast of temperature. A single warm surface gives notices, highlights or a sidebar a distinct register without introducing a saturated colour into a quiet palette.",
      },
      {
        q: "Why does regenerating barely change the palette?",
        a: "Because only the tint chroma is re-rolled, inside the narrow 0.02 to 0.08 band. The five-step lightness ladder and the hue order are fixed, so the set keeps its structure.",
      },
    ],
  },

  "lucky-color-generator": {
    keywords: [
      "lucky color generator",
      "random lucky color",
      "roll a random color",
      "color of the day generator",
      "random hex color generator",
    ],
    intro:
      "The lucky color generator rolls a single random color on demand and shows it as one swatch with its hex value ready to copy.",
    content:
      "- The lucky color generator is one button and one swatch.\n- Press Roll a lucky color and a fresh random colour appears, with its hex value underneath and a copy button beside it.\n- Press again and it is replaced.\n- There is nothing to configure, and no history of previous rolls is kept — the tool always shows exactly one colour, the most recent one.\n\nThe randomisation is uniform across the whole colour space rather than restricted to a pleasant subset, and that has a visible consequence. Because every hue, saturation and lightness combination is equally likely, a good share of rolls come back as colours most people would not choose: very dark near-blacks, washed-out greys where the three channels happen to land close together, or combinations that look muddy once converted to hex. That is the honest character of a uniform random hex generator. It is not a palette assistant that will hand you something tasteful; it is a die with sixteen million faces.\n\nWhat it is genuinely good for is breaking a decision. Designers and illustrators who have been circling the same three colours for an hour can roll until one of them is wrong in an interesting way, which is often enough to see what the work actually needs. It is also a quick source of an arbitrary value when something needs a placeholder — a test swatch, a dummy avatar colour, a one-off marker on a chart — where any distinct colour will do and choosing one properly would be wasted effort.\n\nIt is also a convenient way to settle a colour for a small personal project, where the appeal of a random lucky color is that the decision is out of your hands and the result is at least distinctive. Two practical points. The result is a single hex value with a copy button, so it transfers to a stylesheet or a design file immediately. And there is no seed and no repeat, so a colour you liked cannot be recovered once you roll again; copy it before pressing the button if it is worth keeping. That is a small thing that catches people out when they roll several times in a row looking for something better.\n\nIf the aim is something applicative rather than arbitrary, other tools in this domain do more. A random palette generator produces five colours at once that have some chance of working together, a themed generator draws from bands that are known to be usable, and an accessible palette generator filters its output so that every colour clears a contrast threshold against a chosen background. Rolling a single unconstrained colour is the least structured option of the four, which is precisely why it is useful when structure is the problem.\n\nAs a random lucky color tool, then, it does one thing: roll a random color on demand, show it, and let you copy the hex. Treat it as a random hex color generator for placeholders and for jolting a stalled decision, or as a light-hearted color of the day generator for a personal project — and take the results as they come, since that is the nature of a uniform roll.",
    howTo: [
      { step: "Press the Roll a lucky color button." },
      { step: "Read the swatch and its hex value." },
      { step: "Copy the value if you want to keep it — rolling again replaces it with no way back." },
    ],
    whenToUse:
      "Use this when you need an arbitrary colour quickly or want to break out of a decision loop. Use a themed, palette or accessible generator when the colour has to be usable rather than merely random. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Is the colour constrained in any way?",
        a: "No. It is uniform across the whole colour space, so very dark, very pale and muddy results are all possible and reasonably common.",
      },
      {
        q: "Can I get the previous colour back?",
        a: "No. No history is kept and there is no seed, so rolling again discards the last value permanently. Copy it first if you might want it.",
      },
      {
        q: "How is this different from the random color generator?",
        a: "This returns one colour with no constraints; the palette generator returns five at once, and the accessible generator filters its output so each colour clears a contrast threshold.",
      },
      {
        q: "How many possible results are there?",
        a: "Every hexadecimal colour is possible — around sixteen and a half million values, each equally likely.",
      },
      {
        q: "Where does the lucky color generator stop short?",
        a: "As a random lucky color tool, then, it does one thing: roll a random color on demand, show it, and let you copy the hex. Treat it as a random hex color generator for placeholders and for jolting a stalled decision, or as a light-hearted color of the day generator for a personal project — and take the results as they co",
      },
    ],
  },

  "lucky-number-color": {
    keywords: [
      "lucky number color",
      "color for a number",
      "number to color generator",
      "deterministic color from number",
      "numeric color palette",
    ],
    intro:
      "The lucky number color tool turns any number you type into a fixed five-color palette, so the same number always produces the same colors.",
    content:
      "- The lucky number color tool is a single text field and a palette.\n- Type a number into the box — seven is the default — and five swatches appear below, each with its hex value and a copy button, under a heading naming the number you entered.\n- Change the number and the palette changes with it.\n- There is no button to press and nothing to generate.\n\nThe mechanism behind it is worth understanding, because it explains both what the tool is good at and where its limits are. The number is treated as text, a hash is computed from its characters, and that hash is reduced to a starting hue. The five swatches then walk around the wheel from that starting point at fixed intervals, with their lightnesses varying in a repeating pattern across three values. There is no lookup table of colours associated with numbers and no numerology involved — the relationship is deterministic arithmetic on the characters you typed.\n\nWhat that buys you is stability, which is the whole point of using a number as the input. Seven always produces the same five colours, today and in a year, on any device, and so does any other number. The palette is reproducible from the number alone, so it can be written down as a single digit and regenerated later without recording five hex values — a useful property when a palette has to be attached to something that already has an identifier.\n\nThere are two consequences of hashing text that are easy to trip over. The first is that whitespace and leading zeros count: seven, oh-seven and a seven with a space before it are three different strings and produce three different palettes. Trim the input if you want a canonical result. The second is that the field accepts anything, so words work as well as digits, and a name will hash just as happily as a number. Nothing is validated because nothing needs to be.\n\nWhat the tool does not claim to do is assign colours by meaning. Numbers carry colour associations in various traditions, and this tool ignores all of them. If you are looking for the color for a number in that sense — the hue folklore attaches to it — you will get arithmetic instead. Similarly, a coincidence in the output is not a signal — two numbers that happen to produce similar palettes do so because their hashes landed near each other, nothing more.\n\nThe most honest use is as a labelled colour pair: give a user, a team, an order or a product a number, and the palette follows from it predictably. It is a compact way to make something visually identifiable from a value that is already being tracked, and because the colours come out at a constant lightness in a repeating pattern, sets of these palettes look like they belong to the same family even though the hues differ. For personal projects the framing as a lucky number color is harmless fun, and the underlying behaviour is a deterministic color from number arithmetic that anyone can rely on.\n\n- Limits: five colours per number, fixed brightness and chroma, no way to adjust the palette beyond changing the number, and no export other than copying swatches one at a time.\n- As a number to color generator it is narrow, and as a numeric color palette source it is dependable rather than expressive.",
    howTo: [
      { step: "Type a number into the field — seven is the default." },
      { step: "Read the five swatches that appear beneath it." },
      { step: "Copy individual hex values, and note the number itself as the way to regenerate the same palette later." },
    ],
    whenToUse:
      "Use this when a palette needs to be derived from an existing identifier and stay stable — teams, orders, users, categories. Use a themed or palette generator when you want to choose the colours instead of deriving them. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "How are the colours decided?",
        a: "The number is hashed as text to produce a starting hue, then five swatches walk around the wheel from there at fixed intervals with lightnesses in a repeating pattern.",
      },
      {
        q: "Does the same number always give the same palette?",
        a: "Yes. The result is deterministic arithmetic, so the five hex values are identical wherever and whenever the number is entered.",
      },
      {
        q: "Why does adding a leading zero change the colours?",
        a: "Because the input is hashed as text, so 7, 07 and a 7 with a space are three different strings. Trim the input for a canonical result.",
      },
      {
        q: "Are the colours based on traditional number symbolism?",
        a: "No. There is no lookup table of colours for numbers — only arithmetic on the characters typed. Any resemblance to a traditional association is coincidence.",
      },
      {
        q: "What does the lucky number color not do?",
        a: "As a number to color generator it is narrow, and as a numeric color palette source it is dependable rather than expressive.",
      },
    ],
  },

  "material-palette-generator": {
    keywords: [
      "material palette generator",
      "material design color scale",
      "50 to 900 ramp",
      "ten step ladder",
    ],
    intro:
      "The material palette generator builds a ten-step 50 to 900 ramp from one base colour, holding the base's hue and chroma while walking lightness down in even steps.",
    content:
      "Design systems adopted numbered ramps because a number says more about a colour's role than a word does: 50 is always the lightest surface, 900 always the darkest ink, and nothing has to be memorised beyond the convention. The material palette generator produces that ramp from a single base colour, with ten steps labelled 50, 100, 200, 300, 400, 500, 600, 700, 800 and 900, laid out in a grid that runs up to ten columns on a wide screen so the whole ladder can be compared at once.\n\n- Ten steps, in the conventional order, from 50 at the light end to 900 at the dark end.\n- Lightness walks down in fixed steps of 0.08, starting at 0.95 for the 50 slot and finishing at 0.23 for 900.\n- Hue and chroma are taken from the base colour and never change across the ramp, so every step belongs to the same family.\n- Each tile shows the step name and its hex value, which makes the ladder readable at a glance.\n\nThe mechanism is a lightness ladder in OKLCH, and that choice is why the ramp looks even rather than merely regular: equal steps in perceptual lightness read as equal steps to the eye, where the same arithmetic in HSL would bunch at the dark end and spread at the light end. Keeping chroma constant across all ten steps is the one place this diverges from published Material ramps, which reduce saturation as the steps approach white and black so the extremes stay believable. Here the light end keeps the base's full chroma, which produces a more saturated 50 and 100 than most design systems ship, and the dark end stays vivid rather than turning near-black.\n\n- Chroma is constant, so the pale steps can look more colourful than a reference ramp expects.\n- No copy button on the tiles and no export block: each hex value has to be lifted by hand.\n- Nothing checks that the ramp can carry text, and a ramp alone says nothing about which steps pass against which surfaces.\n- The step names are fixed. There is no way to add a 950 slot or to renounce the labels in favour of role names.\n\nRead as a material design color scale, the convention is what carries the meaning: a 50 to 900 ramp tells a developer which step to reach for without opening a style guide, and a ten step ladder is enough resolution to cover surfaces, borders, states and text inside one hue family. That grammar is the reason numbered ramps outlived the frameworks that popularised them.\n\nUse it when a project already speaks in numbered steps and a new hue has to join the convention — an accent family, a secondary brand colour, a data-series ramp. Because the base's hue survives intact, dropping a different input colour produces a ladder that sits beside the existing one without argument. Where the output has to be literal Material Design, check the pale steps against the published values rather than assuming a match, and where the destination is a Tailwind theme instead, the Tailwind exporter writes the ramp with 950 included and a config snippet attached.",
    howTo: [
      { step: "Set the base colour with the picker field." },
      { step: "Read the ten-step ramp, 50 through 900, left to right." },
      { step: "Check the pale steps against your design system's reference if a literal match matters." },
      { step: "Lift the hex values you need from the tiles, or move to the exporter tools for a written block." },
    ],
    whenToUse:
      "Use this when a numbered ramp has to be derived from one hue. The {{tailwind-palette-generator|Tailwind palette generator}} is the same idea with an extra 950 step and a config snippet, the {{color-shades-generator|shades generator}} gives a shorter ladder without step names, and the {{contrast-checker|contrast checker}} answer whether a chosen step can carry text.",
    faqs: [
      {
        q: "How are the ten steps spaced?",
        a: "Lightness falls by 0.08 per step in OKLCH, from 0.95 at 50 to 0.23 at 900. Perceptual spacing is what makes the ladder look even rather than bunching at one end.",
      },
      {
        q: "Is this an official Material Design palette?",
        a: "The steps follow the convention, not the specification. Published ramps also reduce chroma near the ends, while this generator holds the base's chroma throughout.",
      },
      {
        q: "Why do the light steps look more colourful than expected?",
        a: "Because chroma is constant. A true reference ramp desaturates towards white; here the base's chroma survives all the way to step 50.",
      },
      {
        q: "Can I export the ramp as code?",
        a: "Not from this page — the tiles show names and values but no copy block. The Tailwind exporter and the CSS variable tools write ramps out as text.",
      },
      {
        q: "Does the ramp tell me which steps are readable?",
        a: "No. It is a set of values, not an accessibility report. Send any pair through the contrast checker before it carries text.",
      },
    ],
  },

  "mesh-gradient-generator": {
    keywords: [
      "mesh gradient generator",
      "mesh gradient css",
      "multi blob gradient",
      "random mesh background",
      "aurora gradient css",
    ],
    intro:
      "The mesh gradient generator builds a mesh gradient CSS background from five randomly placed colour blobs and gives you the layered value to copy.",
    content:
      "The mesh gradient generator works with one button. Press Regenerate mesh and five coloured blobs are placed at random positions across a panel, producing a soft, clouded background rather than a directional ramp. Below the preview, the CSS card holds the whole background value with a copy button.\n\nThe construction is what separates a mesh gradient from an ordinary one, and it is visible in the emitted CSS. It is, in effect, a multi blob gradient: several soft shapes on one surface rather than a single sweep from one side to the other. Rather than a single gradient, the value is a comma-separated stack of five radial gradients, each centred at its own percentage coordinates and each fading from a solid colour to transparent by the halfway point of its radius. Layered on one background, those five circles overlap and blend, and because each fades out rather than ending abruptly, there are no visible edges — just regions where one colour is dominant and transitional areas where two or three mix.\n\nThat layering is also why the output looks the way it does when a blob has no neighbour nearby. A radial gradient fading to transparent leaves whatever is behind it showing through, and behind the whole stack there is nothing, so a blob near the edge of the panel reads as a colour floating on the page's own background. That is a feature for layering over an image and a surprise when you expected an opaque tile: if the result should be self-contained, place the mesh over a solid background colour rather than on its own.\n\n- Both the colours and the positions are drawn at random, so one regeneration produces a harmonious aurora and the next is closer to a palette accident.\n- Positions can also cluster by chance, leaving one region crowded and another bare.\n- There are no sliders for colour, position or blob count — the button is the only control, and the honest workflow is to press it until the result is worth keeping.\n\nIn use, this is a decorative background generator, and the sensible places for it follow from that — hero sections, page headers, empty states, card headers, presentation slides. It is a poor choice behind body text, both because a mesh gradient is busy and because the overlapping translucent layers make the effective background colour underneath any given word unpredictable, which is exactly what makes contrast hard to guarantee. If text has to sit on it, place the text in a panel with its own solid backing, or reduce the effect's prominence with an overlay.\n\n- Practical limits: five blobs at fixed saturation, no control over any of them, no seed, and no export beyond the CSS — so a mesh you liked cannot be reproduced once you regenerate.\n- Compared with the linear and conic gradients in this domain, it trades precision for variety, which is the right trade when the only requirement is that a background looks alive on the day.\n- Used as a random mesh background, it produces a plausible mesh gradient css value in one click, and the layered-blob recipe inside the declaration is exactly the aurora gradient css look that marketing pages chase.",
    howTo: [
      { step: "Press Regenerate mesh until the arrangement looks right." },
      { step: "Copy the background value from the CSS panel." },
      { step: "Place it over a solid background colour if the result needs to be opaque." },
      { step: "Keep text off the busy areas, or give it its own backing panel." },
    ],
    whenToUse:
      "Use this when a page needs a soft, multi-coloured decorative background — hero sections, headers, empty states. Use a linear or conic gradient generator when the direction and stops need to be controlled precisely. Where one blob needs its centre and its reach controlled rather than randomised, the {{radial-gradient-generator|radial gradient generator}} is the deliberate version; where the mesh has to carry text, the {{opacity-layering-calculator|opacity layering calculator}} flattens the translucent stack into the single effective colour contrast should be measured against.",
    faqs: [
      {
        q: "How is a mesh gradient built here?",
        a: "As five radial gradients layered on one background, each fading from a solid colour to transparent. Where they overlap, the colours blend into each other.",
      },
      {
        q: "Can I control the colours or positions?",
        a: "No. Both are drawn at random and the only control is the Regenerate button. There are no sliders for blob count, spread or colour.",
      },
      {
        q: "Why does the background look transparent in places?",
        a: "Because each blob fades to transparent and nothing sits behind the stack. Place the mesh over a solid colour if the result should be opaque.",
      },
      {
        q: "Can I reproduce a mesh I liked?",
        a: "Not after regenerating — there is no seed and no history. Copy the CSS value to keep it.",
      },
      {
        q: "Can the mesh be layered over a photograph?",
        a: "Yes — and there the transparency works in its favour: the five blobs go on as a background layer over the image, and the photograph shows through the gaps, which is exactly what the floating-colour look is after.",
      },
    ],
  },
};
