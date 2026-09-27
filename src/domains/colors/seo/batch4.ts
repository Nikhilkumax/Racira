import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 4 (alphabetical slugs 41-47).
 * Skipped from this window (flagged in the logic audit): color-from-text-mood-tool,
 * color-gamut-checker, color-gamut-visualizer.
 */
export const SEO_BATCH_4: Record<string, ToolSeo> = {
  "color-distance-calculator": {
    keywords: [
      "color distance calculator",
      "color difference calculator",
      "rgb distance between two colors",
      "oklch color distance",
    ],
    intro:
      "The color distance calculator measures how far apart two colors are, reporting both the raw rgb distance between two colors and a perceptual OKLCH figure.",
    content:
      "The color distance calculator measures how far apart two colors are. Give it a pair of values and it reports two numbers: the straight-line distance between them in red, green and blue space, and an OKLCH-based figure that accounts for how the eye weights lightness, chroma and hue. There is no single correct answer to how different two colors are, so the tool shows both rather than pretending one number is definitive. Use it to ask whether two shades are distinguishable, or how far a generated color drifted from its target.\n\n- The rgb distance between two colors is the Euclidean length of the vector joining them in the three-channel cube: the square root of the sum of the squared differences on each channel.\n- It is fast, easy to reason about, and matches how a pixel edit behaves, but it is not perceptual.\n- Two colors can sit far apart in RGB and look almost identical, or be close in RGB and read as clearly different, because equal numeric steps are not equal steps to the eye.\n\nThe oklch color distance addresses that by working in a space designed to be perceptually uniform. Lightness and chroma are compared directly, and hue is compared as an angular difference scaled into the same range before all three are combined into a single distance. The result tracks perceived difference far more closely than the RGB figure, which is why it is the more useful number when you are asking whether a change will be noticed rather than merely measured.\n\nBoth numbers are useful in different contexts. Reach for the channel distance when you are debugging pixel operations, comparing large numbers of samples, or working inside a pipeline that already thinks in RGB. Reach for the perceptual figure when you are judging a palette, checking whether a hover state moved enough to be seen, or documenting how far a generated color ended up from the one you asked for. Reporting both keeps the tool honest about the fact that distance depends on the space you measure it in.\n\nAs a color difference calculator it is deliberately read-only: you compare, you do not modify. That makes it a good companion to the generators on this site, where you can produce a candidate color and then measure its distance from your reference before committing. Copy either figure into a design note, or use it as a threshold while tuning an algorithm. If the decision is about legibility rather than similarity, the contrast checker answers that different and more specific question.\n\n- Two practical notes keep the numbers meaningful.\n- First, the perceptual figure here is an approximation rather than a full CIEDE2000 delta-E, so treat it as a guide to relative difference rather than an absolute standard to quote in a specification.\n- Second, distance is not the same as contrast: two colors can be perceptually distant and still produce unreadable text if their luminance is similar.\n- Pair this tool with a contrast checker when the question is legibility, and use the distance figures when the question is how much a color actually moved.",
    howTo: [
      { step: "Set color A and color B with the two fields." },
      { step: "Read the RGB Euclidean distance for raw channel separation." },
      { step: "Read the OKLCH figure for how different the pair will look to the eye." },
      { step: "Run the same pair through a contrast checker when legibility rather than difference is the question." },
    ],
    whenToUse:
      "Use this calculator when you need to quantify similarity or drift between two colors. Use the contrast checker when the question is whether text will be readable, since that is a luminance ratio rather than a distance. The {{color-comparison-tool|color comparison tool}} runs the same two readings side by side for a review verdict, and when the question is legibility the {{contrast-checker|contrast checker}} supplies the luminance ratio instead.",
    faqs: [
      {
        q: "Why does it report two different numbers?",
        a: "One is a raw channel distance in RGB and the other is derived from a perceptually uniform space. They answer subtly different questions, so both are shown instead of burying the choice.",
      },
      {
        q: "Which of the two is the perceptual one?",
        a: "The OKLCH figure. It compares lightness, chroma and hue in a space designed to match how the eye judges difference, so it tracks perceived change more closely than the RGB number.",
      },
      {
        q: "Is this a standard delta-E?",
        a: "No. It is an approximation built on OKLCH rather than a full CIEDE2000 implementation, so it is best used for relative comparison rather than as an absolute figure.",
      },
      {
        q: "Does a large distance guarantee readable text?",
        a: "No. Distance measures similarity, not contrast. Two colors far apart in hue can still share a luminance and produce unreadable text; check that with a contrast checker.",
      },
      {
        q: "Is the perceptual distance figure an absolute standard?",
        a: "It is an approximation rather than a full CIEDE2000 delta-E, so it is a guide to relative difference rather than a specification figure. Distance is also not contrast: two colours can be perceptually distant and still produce unreadable text if their luminance is similar.",
      },
    ],
  },

  "color-format-converter": {
    keywords: [
      "color format converter",
      "convert color to hsl",
      "packed rgb integer",
      "oklch notation",
    ],
    intro:
      "The color format converter prints one color in nine notations at once — HEX, RGB, HSL, OKLCH, HWB, LAB, LCH, a CMYK approximation and a packed RGB integer — each on its own row with its own copy button.",
    content:
      "The color format converter answers a question about notation rather than about color. One color goes in at the top of the page and nine readings come back below it, each on a copy row, so a value that arrived as a screenshot swatch can leave as a token, an API field or a print approximation without a second tool. Every row is derived from the same parsed color, which is why the formats here can never disagree with one another.\n\n- HEX — six digits, upper case, the compact exact form for sRGB tokens.\n- RGB — decimal channels in red, green, blue order, as in rgb(59, 130, 246).\n- HSL — hue in degrees with saturation and lightness as percentages, two decimals deep.\n- OKLCH — perceptual lightness, chroma and hue, the oklch notation modern CSS accepts natively.\n- HWB — hue with whiteness and blackness percentages.\n- LAB and LCH — the CIE Lab axes and their cylindrical form, two decimals on each Lab value.\n- CMYK — four whole-number percentages, written cmyk(76%, 47%, 0%, 4%) for the same blue.\n- Int — the packed rgb integer, one 24-bit number built from the three channels.\n\nThe arithmetic is not hand-written. Parsing, RGB, HSL and the hex formatter come from the culori library this domain already uses, so a value here matches what a browser renders. HWB, LAB, LCH and OKLCH run through explicit conversions of that same parsed color; CMYK is computed in the tool from the 8-bit channels, taking black as one minus the largest channel and each ink as the remainder divided by the non-black share, rounded to whole percents. The packed integer shifts red into the top eight bits, green into the middle and blue into the bottom, which is how (r << 16) + (g << 8) + b turns three channels into one number.\n\nThe caveats are worth knowing before anything is pasted.\n\n- The CMYK figure is arithmetic, not a press profile. No ICC profile is consulted and no soft proof is produced, so treat it as the start of a conversation with a printer rather than a conversion to hand over.\n- The cmyk(...) string is not CSS. Browsers do not parse it; copy it into notes, spreadsheets or documentation tables, never into a declaration.\n- OKLCH prints at the library's full float precision, so that row is long even though the value itself is exact.\n- There is no alpha anywhere. An 8-digit value types into the field but is normalized to its six-digit form, so alpha never reaches a row.\n\nChoose the row by where it is going rather than by preference. Hex is the token format: compact, exact for sRGB, and the spelling every other tool understands. OKLCH is the one to keep when lightness or chroma will be edited later, because its coordinates map onto the things a designer actually changes. Use the panel to convert color to hsl when a person will tune the number by hand in a stylesheet, and to rgb when tooling wants channel integers. The packed integer earns its place when an API, a canvas call or a mobile framework expects one number instead of three. Before two of these notations land in the same file, confirm they round-trip to the same color — rounding is the only place where two spellings of one color can quietly disagree.",
    howTo: [
      { step: "Set the color with the picker field, or type any value the field accepts and let it normalize." },
      { step: "Read the formats panel: nine rows, from HEX through to the packed integer." },
      { step: "Copy the row your stylesheet, spec or API needs with the copy button on that row." },
      { step: "Cross-check a second notation only where a document quotes both, so the pair cannot drift." },
    ],
    whenToUse:
      "Use this when one color has to leave in a notation you do not have. The {{color-format-validator|format validator}} is the reverse direction — it checks a string you already have; the {{css-color-formatter|CSS color formatter}} gives the five CSS-ready spellings without the lab, lch and integer rows; the {{css-hex-color-generator|HEX generator}} is the shortest route when only the token form matters; and the {{alpha-color-generator|alpha generator}} covers the translucency this panel deliberately omits.",
    faqs: [
      {
        q: "Why is the CMYK row written as cmyk(...) rather than as four plain numbers?",
        a: "It mirrors how the other rows are labelled, but the prefix is not a CSS function. Browsers reject cmyk(), so the string is meant for notes and print conversations rather than for a stylesheet.",
      },
      {
        q: "Is the CMYK conversion accurate enough for print?",
        a: "No. It is arithmetic on the 8-bit channels with no ICC profile behind it. It is a sensible starting point for a printer conversation, not a specification.",
      },
      {
        q: "Why does the OKLCH row show so many decimal places?",
        a: "That row is printed by the library's CSS formatter at full precision. The value is right; the string is simply longer than the other rows, so trim it if a shorter token is wanted.",
      },
      {
        q: "What is the packed integer for?",
        a: "It is the colour written as one 24-bit number, with red in the top eight bits, green in the middle and blue in the bottom. APIs, canvas calls and mobile frameworks often take a colour in exactly that shape.",
      },
      {
        q: "Can I convert a translucent colour here?",
        a: "Not on this page. The field normalizes input to a six-digit opaque value, and no row carries an alpha channel. The alpha generator is the tool for rgba and 8-digit hex output.",
      },
    ],
  },

  "color-format-validator": {
    keywords: [
      "color format validator",
      "validate css color string",
      "check if a color is valid",
      "canonical hex",
    ],
    intro:
      "The color format validator reports whether a string is a colour a browser will accept, and shows the canonical hex when it is — the quickest way to find out why a declaration silently did nothing.",
    content:
      "The color format validator takes a string and answers one question: will a browser accept this as a colour? Type or paste a value and the badge flips between Valid and Invalid as you edit; when a value is accepted the page also shows a swatch and its canonical hex, so you can see what the parser understood rather than what you hoped it understood. Use it to validate css color string values that arrived from a template, a spreadsheet, a design export or a user input field, and to check if a color is valid before it is committed to a theme file.\n\n- Accepted: three, four, six and eight digit hex; rgb() and rgba() with commas or spaces and an optional slash alpha; hsl() and hsla(); hwb(); lab(); lch(); oklch(); the color() function for wide-gamut spaces such as display-p3; the keyword transparent; and the full set of CSS named colours.\n- Rejected: five-digit hex, hsv() and cmyk() functions, the keyword currentColor, and the newer relative-colour syntax such as rgb(from red r g b), which a current parser does not yet read.\n\nThe check is a parse rather than a pattern match. The same colour library the rest of this domain converts with is asked to read the string; if it returns a colour the value is valid, and if it does not, the value is not. That distinction matters because hand-written regular expressions almost always disagree with the browser: a regex that matches six-digit hex will reject hsl(), hwb(), oklch() and every named colour, which is the usual reason a home-grown validation helper passes a value that the browser then ignores. Parsing also catches the mistakes that look fine at a glance — a hex with the wrong number of digits, a missing percent sign, a stray space inside a function, a colour name that is not in the standard list.\n\nFour limits are worth knowing.\n\n- Valid here means the parser understands the value, not that every target browser does. Percentage alpha and the newest syntaxes may pass a current parser and still fail an older engine, so test in the browsers you support when the difference matters.\n- The hex readout is six digits. An 8-digit input is parsed correctly but its alpha is not shown in the reading, so do not treat that row as a transparency report.\n- The answer is binary. The page reports valid or invalid rather than pointing at the character that broke the parse.\n- It checks one value at a time, which is fine for a stylesheet but slow for auditing a column of colours from a data export.\n\nThe habit this page supports is checking the last mile. An invalid colour is dropped by the browser without an error message, and the element quietly keeps whatever it inherited, so the symptom is usually a wrong-looking page rather than a broken build. When a value passes and needs rewriting into another notation, the converter is the next step; when the question is whether text on that colour can actually be read, the contrast checker measures rather than parses.",
    howTo: [
      { step: "Type or paste the value into the colour string field." },
      { step: "Read the badge: Valid or Invalid, updated as you edit." },
      { step: "When it is valid, check the swatch and the canonical hex to confirm the parse went the way you meant." },
      { step: "Move a valid value on to the converter or the contrast checker, and fix an invalid one at the source." },
    ],
    whenToUse:
      "Use this when a colour is misbehaving and the string itself is the suspect. The {{color-format-converter|format converter}} is the reverse direction — it turns a colour you already have into every notation — the {{css-named-colors-reference|CSS named colours reference}} answers which names are legal in the first place, and the {{contrast-checker|contrast checker}} picks up where parsing stops and measures whether a valid pair can be read.",
    faqs: [
      {
        q: "Why does a value my browser rejects come back as valid?",
        a: "The parser follows the current specification, so very new syntax can validate here while an older engine refuses it. Test in the target browsers when that gap matters.",
      },
      {
        q: "Does it tell me which part of the string is wrong?",
        a: "No — the answer is valid or invalid, which keeps the check instantaneous. Compare a failing value against a known-good one of the same kind to spot the difference.",
      },
      {
        q: "Is a colour name such as rebeccapurple accepted?",
        a: "Yes, every name in the CSS named-colour list parses, along with transparent. Names that are not on the list are rejected like any other unknown token.",
      },
      {
        q: "What does the hex value beside a valid colour show?",
        a: "The canonical six-digit equivalent of whatever you entered, produced by parsing and reformatting. It is a confirmation of what the parser read, not a copy of your input.",
      },
      {
        q: "Can it check the relative-colour syntax or a color() space like display-p3?",
        a: "Wide-gamut color() values parse, so they validate and produce a swatch. Relative colours such as rgb(from red r g b) do not parse yet and are reported as invalid.",
      },
    ],
  },

  "color-harmony-generator": {
    keywords: [
      "color harmony generator",
      "color harmony calculator",
      "generate color harmonies",
      "complementary triadic tetradic palette",
    ],
    intro:
      "The color harmony generator derives every classic harmony from one base color and shows them together, so you can compare relationships before choosing a direction.",
    content:
      "The color harmony generator takes one base color and lays out every classic harmony derived from it, side by side. Rather than making you choose between complementary and triadic and re-enter the color each time, it shows complementary, analogous, triadic, tetradic and split-complementary at once, each as a row of swatches that begins with your base. It is the fastest way to see which relationship suits a project, because comparison is the whole point.\n\n- Each harmony is a fixed set of hue rotations applied to the base.\n- Complementary is a single rotation of 180 degrees.\n- Analogous takes the neighbours at minus and plus 30.\n- Triadic spreads three hues evenly at 120 and 240.\n- Tetradic uses a rectangle at 90, 180 and 270, and split-complementary replaces the single opposite with two hues at 150 and 210.\n- Because all of them start from the same value, switching between them never changes the lightness or saturation you began with.\n- When you generate color harmonies this way, the only variable is hue.\n\nThe rotations are applied in OKLCH, so lightness and chroma are held constant and only hue moves. That is what makes the rows comparable: analogous colors sit quietly together, complementary colors oppose each other at full strength, and the complementary triadic tetradic palette rows all keep the same apparent lightness rather than drifting darker or washed out. Working in a perceptually uniform space also avoids a common complaint about harmonies built in older models, where derived colors looked accidentally uneven.\n\n- Reading the rows is a quick education in how much tension each relationship creates.\n- If the brief is calm and cohesive, the analogous row will look right and the complementary row will feel agitated beside it.\n- If you want a single strong accent against a dominant color, the complementary row gives the most separation.\n- Triadic and tetradic sit in between, useful when a design needs several co-equal colors that nevertheless belong together.\n- Seeing all five at once turns those trade-offs into something concrete.\n\nUse it as a color harmony calculator while you are still deciding on a direction, then move to the dedicated generator for the harmony you chose once you have committed to it. Because every row shares the same base, you can also compare a light and a dark version of a project by changing the base once and re-reading all five rows. If you need to know whether any pair in a chosen harmony is legible for text, run the two colors through a contrast checker before you build.\n\nKeep in mind that a harmony is a relationship, not a finished palette. Two analogous colors are not automatically legible together, and a triadic set is not automatically balanced in area; the proportions you assign matter as much as the hues. Use the rows here to choose a direction, then decide how much of each color a screen will actually show, and verify any text pairing separately. A harmony generator gives you colors that belong together; making them work in a layout is a separate step that depends on size, spacing and contrast rather than hue alone.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the five harmony cards — complementary, analogous, triadic, tetradic and split complementary." },
      { step: "Each card shows the base beside the hues that relationship derives from it." },
      { step: "Copy the values from the arrangement that fits the scheme." },
    ],
    whenToUse:
      "Use this generator to compare harmonies on one base color before committing. Use the separate complementary, triadic or analogous generators when you have already chosen a relationship and want to focus on it. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Which harmonies are included?",
        a: "Complementary, analogous, triadic, tetradic and split-complementary, each shown as a row of swatches derived from the same base color.",
      },
      {
        q: "Why do the derived colors keep the same brightness?",
        a: "The rotations happen in OKLCH with lightness and chroma fixed, so only hue changes and the rows remain directly comparable.",
      },
      {
        q: "How is tetradic different from square?",
        a: "The tetradic row here uses the rectangular arrangement at 90, 180 and 270 degrees from the base. A square harmony is the evenly spaced four-hue variant.",
      },
      {
        q: "Can I use two colors from a row as text and background?",
        a: "Only if their luminance differs enough. Verify any pairing with a contrast checker before using it for text.",
      },
      {
        q: "What does the color harmony generator not do?",
        a: "If the brief is calm and cohesive, the analogous row will look right and the complementary row will feel agitated beside it. If you want a single strong accent against a dominant color, the complementary row gives the most separation. Triadic and tetradic sit in between, useful when a design needs several co-equal colo",
      },
    ],
  },
};
