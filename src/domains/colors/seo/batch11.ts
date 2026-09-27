import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 11 (alphabetical slugs 90-98).
 *
 * Skipped from this window:
 *  - color-trend-analyzer — still flagged: renders the ColorOfTheYear grid rather
 *    than any analysis of how a colour's popularity has moved over time.
 *  - color-wheel-theory-guide — renders the twelve-hue ColorWheel picker with no
 *    theory content, so the slug's promise does not match the tool.
 *  - complementary-palette-generator — same Comp harmony component as the
 *    already-authored color-complement-finder, so it would duplicate that page.
 */
export const SEO_BATCH_11: Record<string, ToolSeo> = {
  "color-token-generator": {
    keywords: [
      "color token generator",
      "palette to color tokens",
      "color tokens with rgb and hsl",
      "design token json",
    ],
    intro:
      "The color token generator turns an editable palette into an array of named token objects, each carrying a dotted name with its hex, rgb triple and hsl value.",
    content:
      "The color token generator sits between a bare list of hex codes and a full design system. You keep a palette in the editor on the left, and the panel on the right produces a JSON array in which every colour has become a token: an object with a dotted name, an uppercase hex value, a comma-separated rgb triple and an hsl string. A copy button lifts the whole array onto the clipboard, so the result can be pasted into a configuration file, a theme module or a script without editing.\n\nThe shape of each entry is worth reading once, because it determines where the output can be used:\n\n- A dotted name such as color.brand.1, which is the convention most token tooling expects.\n- An uppercase six-digit hex string.\n- An rgb value as three bare numbers separated by commas rather than a quoted CSS function, which is what colour libraries and canvas code usually want.\n- A complete hsl function string, ready to drop into a stylesheet.\n\nThat last point is the practical argument for generating color tokens rather than writing them. A palette that exists as hex in one file and as rgb in another has two sources of truth, and they diverge the first time someone edits only one of them. Producing all three notations from a single value means every consumer reads the same colour, whether it is a stylesheet asking for hex, a charting library asking for channels, or a hue-based tool asking for hsl. Multiplied across a palette, that removes a whole category of slow, hard-to-see bugs.\n\nThe names are the one thing the tool cannot decide for you. It emits dotted, positional paths because it has no idea what each colour is for, and positional names age badly: a token called color dot brand dot three tells a future reader nothing about whether it is a surface or a state. Treat the generated array as scaffolding and rename the entries to the roles they serve, which is what makes a palette survive a rebrand. The JSON structure, on the other hand, rarely needs editing.\n\nIn practice the output lands in three places. A plain data file imported by application code, which is the simplest case and needs no key renaming at all if you use positional lookups. A design token json file consumed by a build step, where the dotted names matter and the extra notations save conversion. And documentation, where an array of objects is easy to render as a table because every token has the same four fields in the same order.\n\nA few things are deliberately out of scope:\n\n- There are no types, descriptions or reference graphs, which is what separates this from a full W3C-style design token generator.\n- There is no alpha channel, so translucent values have to be handled downstream.\n- Names are positional — color.brand.1 through color.brand.n — because the tool cannot know what each colour is for, so the role naming is left to you.\n\nRead it as a color token generator in the literal sense: take a palette, get back an array of self-describing colour objects with their notations already aligned. When the goal is to move a palette to color tokens with rgb and hsl side by side, or to produce a design token json file that a build can consume without a conversion step in between, this is the shortest route from the colours on screen to the file that code reads.",
    howTo: [
      { step: "Build the palette in the editor on the left." },
      { step: "Read the JSON array on the right: each colour becomes one object with name, hex, rgb and hsl." },
      { step: "Copy the array and rename the positional entries to the roles they serve before committing it." },
    ],
    whenToUse:
      "Use this generator when a palette needs to become named, machine-readable tokens carrying more than one notation. Use the W3C-style token generator when types and descriptions are required, and the JSON exporter when a plain list of values is enough. The {{design-token-generator|W3C-style token generator}} adds types and descriptions, and when a plain list of values is enough the {{color-palette-json-exporter|JSON exporter}} is the lighter target.",
    faqs: [
      {
        q: "What does each token object contain?",
        a: "Four fields: a dotted name, an uppercase six-digit hex value, an rgb triple as bare comma-separated numbers, and an hsl value as a ready-to-paste function string.",
      },
      {
        q: "Why produce rgb and hsl as well as hex?",
        a: "Different consumers want different notations — stylesheets take hex, colour libraries and canvas take channels, hue-based tooling takes hsl. Deriving all three from one source keeps them from drifting apart.",
      },
      {
        q: "Can I rename the tokens?",
        a: "The tool emits positional dotted names because it does not know each colour's role. Take the array as scaffolding and rename the entries to roles, which is what keeps them meaningful after a rebrand.",
      },
      {
        q: "How is this different from the design token generator?",
        a: "That one produces the typed shape with a value and a type field. This one stops at names and notations, which is lighter and usually enough for application code.",
      },
      {
        q: "Can I use the rgb value directly in CSS?",
        a: "Not directly — the rgb field is three bare numbers for libraries and canvas code, while the hsl field is a complete function string. For CSS, use the hex value or the hsl string.",
      },
    ],
  },

  "color-variations-generator": {
    keywords: [
      "color variations generator",
      "tints shades and tones",
      "color variations chart",
      "light and dark variations of a color",
    ],
    intro:
      "The color variations generator lays out one base color as three labelled rows — tints, shades and tones — five swatches each, so all the classic variations are visible at once.",
    content:
      "The color variations generator takes a single base colour and shows it three ways at once. Under the colour picker sit three labelled rows of five swatches: a Tints row running from a pale wash to something nearly white, a Shades row running from a mid-dark to something close to black, and a Tones row running from a barely-tinted grey to a moderately muted version of the hue. Every swatch carries its hex value and a copy button. The point of the layout is comparison: three answers to three different questions, visible together rather than one at a time.\n\n- Each row is constructed differently, and the differences are what make the chart useful.\n- The tints keep the base's hue but drop chroma to a small fraction of it while raising lightness through a fixed sequence of light values, which is why a tint reads as a softened version of the colour rather than simply a lighter one.\n- The shades hold chroma at full strength and step lightness downward through a fixed dark sequence, preserving the colour's character as it deepens.\n- The tones are the odd one out in a useful way: lightness is pinned to whatever the base already has, and only chroma moves, so every entry in that row has the same brightness as your starting colour.\n\nThere is a structural detail worth understanding before you lean on the chart.\n\n- The tint and shade rows use fixed target lightness values rather than steps relative to your base, so the result is a standard set rather than a scaled version of the colour you chose.\n- Start from a very light base and the shade row is a large jump downward; start from a very dark base and the tint row is a large jump upward.\n- Only the tone row is derived from the base itself, because it keeps the base's lightness by definition.\n- Knowing that turns a possible surprise into an expectation.\n\nReading the chart is mostly about which direction preserves the colour's identity. Tints and shades usually keep a hue recognisable because saturation is present in at least one of them, while tones converge on neutral as chroma falls, so a heavily toned swatch can look like a different colour entirely. If a design needs variations that still feel like the original, the tint and shade rows are the safer source; if it needs something quieter that still sits in the same area, the tone row is the right one.\n\nThe everyday use is building a small system from one brand colour: a light surface, a base, a pressed state, a border and a muted text tone can all be read off a single chart in a few seconds. It is also useful as a reference while reviewing, because seeing all three families side by side makes it obvious when a palette has drifted into using tints as if they were shades. And because each swatch carries its value, taking five of them into a stylesheet is a matter of copying in sequence.\n\nWhere it differs from the dedicated tools is breadth against depth. The separate shade, tint and tone generators each produce ten steps of one kind, in a continuous sequence you can read as a ramp. This one gives you five of each kind and lets you compare across kinds, which is the better fit for choosing a direction rather than building a full ramp. Because the palette editor is live, changing the base re-renders all fifteen swatches together, so the whole chart can be explored quickly.\n\nUsed as a color variations generator it does one job cleanly: given a colour, show its light and dark variations of a color alongside its muted ones, in one glance. When you want a color variations chart to reason about directions rather than to pick precise steps, that is exactly the right amount of information, and the tints shades and tones rows together cover the classic vocabulary of colour variation without a second tool.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the three rows: tints towards white at reduced chroma, shades towards black, and tones that drain chroma at the base's lightness." },
      { step: "Notice that only the tone row keeps the lightness the eyes read as the colour's weight." },
      { step: "Move to the dedicated shade, tint or tone generator when one direction needs a deeper ladder." },
    ],
    whenToUse:
      "Use this chart to compare variation directions for one colour before committing to a ramp. Use the dedicated shade, tint and tone generators when you need ten continuous steps of a single kind. The dedicated {{color-shades-generator|shade}}, {{color-tints-generator|tint}} and {{color-tones-generator|tone}} generators give one row at a time with ten steps each, where this chart trades depth for breadth.",
    faqs: [
      {
        q: "What are the three rows?",
        a: "Tints, shades and tones, five swatches each. Tints lighten with reduced chroma, shades darken while holding chroma, and tones keep the base's lightness while reducing chroma.",
      },
      {
        q: "Why does the shade row sometimes look like a big jump?",
        a: "The tint and shade rows use fixed lightness sequences rather than steps relative to your base. A very light base makes the shade row a large jump, and a very dark base makes the tint row a large one.",
      },
      {
        q: "Which row keeps the colour most recognisable?",
        a: "Tints and shades, because each holds saturation in the other axis. Tones converge on neutral as chroma falls, so heavy tones can read as a different colour.",
      },
      {
        q: "How many steps of each kind do I get?",
        a: "Five of each. If you need a longer continuous ramp in one direction, the dedicated tint, shade or tone generator produces ten.",
      },
      {
        q: "Why are only five steps shown per row?",
        a: "Breadth against depth: three five-step rows show the directions a colour can move in one view — tints at reduced chroma, shades at full chroma and tones at the base's lightness — while the dedicated generators lay out ten steps along one axis.",
      },
    ],
  },

  "color-wheel-interactive": {
    keywords: [
      "interactive color wheel",
      "color wheel picker",
      "pick a hue from a color wheel",
      "color wheel by lightness",
    ],
    intro:
      "The interactive color wheel arranges twenty-four hues in a ring around a lightness slider, so you can set the brightness once and then choose a hue from the wheel.",
    content:
      "- The interactive color wheel arranges twenty-four hue swatches in a ring and gives you one slider to control something else entirely.\n- The slider sets lightness, from twenty percent to ninety, and it applies to the whole ring at once: move it and every swatch is regenerated at the new brightness.\n- Clicking any swatch loads it into the Selected panel, which shows the value as a large colour block with its hex and a copy button.\n- It is a colour picker with a particular opinion, and the opinion is that brightness is a setting rather than a search.\n- As a color wheel picker it therefore asks for that decision up front, which is the one thing that sets it apart from a ring of swatches with no controls attached.\n\nThe reasoning behind that layout is worth stating. Colour choice splits into two quite different decisions: how light or dark the colour should be, and where on the spectrum it sits. A conventional picker field folds both into one two-dimensional control, so moving to a different hue tends to shift the brightness as a side effect. Here they are separated. You settle the lightness band your design lives in first, and then the ring is a clean choice between equally bright hues, which is exactly what color wheel by lightness means in practice.\n\n- Chroma is held constant across the whole ring, which is what makes the comparison fair: at a fixed saturation no hue can look artificially louder than its neighbours, so a preference between them is a preference about hue.\n- The trade-off appears at the extremes.\n- At very high or very low lightness, a fixed chroma is not achievable for every hue, so some swatches come back slightly flatter once the value is written as a hex code.\n- That is a limit of what a screen can display rather than an error in the ring, and it is most visible at the top and bottom ends of the slider.\n\nOne behaviour is worth knowing before you rely on it. The selection is captured at the moment you click, so moving the lightness slider afterwards redraws the entire ring without changing your chosen value — the selection stays as it was rather than following the brightness. Clicking again takes whatever the swatch has become at the new lightness. Read as a two-step gesture that is quite natural: choose a brightness, choose a hue, adjust, and re-choose.\n\nWith twenty-four positions the ring resolves hue in fifteen-degree steps, which is fine for browsing but not fine enough for exact work. If you need a specific relationship — a true complement, a triad, a tetradic set — the harmony tools compute those angles precisely, and if you already know the value you want, typing it into a plain colour field is faster than hunting around a wheel. The wheel earns its place when you do not yet know, and want to look at a spread of equally bright options before deciding. The twelve-step variant of the same idea is available separately for a coarser sweep.\n\nIf the habit you are trying to break is to pick a hue from a color wheel first and then correct the brightness afterwards, reversing that order is the fix, and the slider is what makes the reversal possible. In day to day use it is a browsing tool: set the lightness to roughly the band a page actually uses, glance around the ring, and click the couple of hues worth trying. Because the ring re-renders instantly, testing three brightness levels takes a few seconds, which is much faster than reasoning about them. As an interactive color wheel that is the whole offer: one lightness setting, twenty-four hues, and a selected value you can lift straight out with its hex attached.",
    howTo: [
      { step: "Drag the lightness slider to set where on the ring you are working — twenty to ninety percent." },
      { step: "Click a hue to select it; the ring resolves hue in fifteen-degree steps." },
      { step: "Read the selected value in the Swatch card and copy the hex." },
      { step: "Move the slider and click again for a lighter or deeper version of the same hue." },
    ],
    whenToUse:
      "Use the wheel when you want to browse hues at a chosen brightness rather than find a known value. Use a plain colour field for an exact hex, and the harmony tools when you need a specific angular relationship. The {{hue-circle-interactive|hue circle}} and the {{color-harmony-generator|harmony generator}} explore the same ring from a different angle, and the {{color-theory-reference-tool|color theory reference}} is the harmony cheat sheet for checking a relationship.",
    faqs: [
      {
        q: "What does the lightness slider do?",
        a: "It sets the brightness of the whole ring at once, from twenty to ninety percent. Moving it regenerates every swatch, so you can compare hues at a different depth.",
      },
      {
        q: "Why does my selection not change when I move the slider?",
        a: "The value is captured when you click a swatch. Moving the slider afterwards redraws the ring and leaves your selection as it was; click again to take the value at the new lightness.",
      },
      {
        q: "How many hues are on the ring?",
        a: "Twenty-four, which is a fifteen degree step. Good for browsing, but use the harmony tools when you need an exact angular relationship.",
      },
      {
        q: "Why do some swatches look less vivid at the extremes?",
        a: "Saturation is fixed across the ring, and not every hue can reach that saturation at very high or very low lightness, so the value rounds slightly flatter on screen.",
      },
      {
        q: "Why are some swatches slightly flatter at the ends of the slider?",
        a: "Chroma is held constant around the ring so no hue looks artificially louder than its neighbours, but at very high or very low lightness a fixed chroma is not achievable for every hue, so a few swatches come back slightly flatter once written as a hex code. That is a limit of what a screen can display rather than an error in the ring.",
      },
    ],
  },

  "conic-gradient-generator": {
    keywords: [
      "conic gradient generator",
      "conic-gradient css",
      "conic gradient with color stops",
      "angular gradient generator",
    ],
    intro:
      "The conic gradient generator builds a gradient that sweeps around a centre point, with editable color stops, a from-angle control and copy-ready CSS output.",
    content:
      "- The conic gradient generator builds the gradient that travels around a point instead of across a box.\n- The controls are the shared set with one addition: a live preview, a stop list with a position slider per colour, an angle that decides where the sweep begins, and the finished CSS with a copy button.\n- Two stops are in place to begin with; more can be added, and a stop can be removed once more than two remain.\n- Between them, the simplest two-tone disc and a multi-band ring are both a few clicks away.\n\nThat circular behaviour is what makes conic different from its linear and radial relatives, and it changes what a stop position means. In a linear gradient a percentage is a distance across the element; in a conic gradient it is a fraction of the full turn, so fifty percent sits on the opposite side of the centre from zero, and one hundred percent arrives back where the sweep started. Reading the preview with that in mind makes the stop sliders predictable rather than fiddly, and it is why a two-stop conic looks like two halves rather than a smooth blend from one edge to another.\n\nThe from-angle control rotates where the sweep begins. It is set to ninety degrees by default, and dragging it moves the whole gradient around the centre without changing the colours or the spacing between them, which is how you aim the transition at a particular corner or line it up with a layout. The generated declaration takes the form of a background using a conic-gradient function with the angle first and the stop list after it, so the angle and the stops are the only two things in the output.\n\nOne consequence of the geometry is worth planning for. Because zero and one hundred percent occupy the same point on the circle, a two-stop gradient has a hard seam where the second colour meets the first. Adding a third stop at one hundred percent using the first colour closes the loop and produces a continuous ring, which is the standard fix and the reason loop-based conics usually have one more stop than you might expect. Conversely, deliberately leaving a seam is how you get a two-tone disc.\n\nBecause stop positions are independent sliders, unequal spacing and hard bands are both available. Placing two stops at the same position produces an abrupt edge rather than a blend, which is the approach behind segmented discs: a pie-chart style ring is a conic gradient with pairs of stops sharing positions. That makes this tool useful beyond decoration, since a quick segmented backdrop or a progress disc can be built here and copied out as a single declaration rather than assembled as markup.\n\nA few practical notes about the output. The CSS is emitted as a background declaration and uses the standard function with an angle and a percentage-positioned stop list, so it drops into a stylesheet, a styled component or an inline style without alteration. Everything is computed from the stops you have set, and the preview updates as you drag, so tuning is a matter of watching rather than guessing. There is no export beyond the declaration itself, which keeps the tool focused on getting the gradient right rather than on packaging it.\n\nUsed as a conic gradient generator it is fast and exact: set two stops for a disc, add a closing stop for a ring, drag the from-angle until the seam sits where it should, then copy the conic-gradient CSS straight into a stylesheet. For anything that needs an angular gradient generator — colour rings, segmented charts, decorative sweeps built from a conic gradient with color stops — the preview and the emitted declaration together are usually all you need.",
    howTo: [
      { step: "Set the starting angle with the Angle slider." },
      { step: "Set each stop's colour and position, using Add stop and Remove to edit the list." },
      { step: "Watch the preview repaint as the stops change." },
      { step: "Copy the background declaration from the CSS panel." },
    ],
    whenToUse:
      "Use this generator for any gradient that sweeps around a centre point: rings, discs, segmented charts and angular decoration. Use the linear or radial generator when the gradient should run across or outward instead. When the job is placing the boundaries rather than aiming the sweep, the {{gradient-color-stop-editor|gradient color stop editor}} turns the same stop maths into sliders, and a value you have written yourself can be checked in the {{gradient-previewer|gradient previewer}} — conic gradients included.",
    faqs: [
      {
        q: "How is a conic gradient different from a linear one?",
        a: "It sweeps around a centre point rather than across the element, so stop percentages are fractions of a full turn rather than distances across the box.",
      },
      {
        q: "Why is there a visible seam in my gradient?",
        a: "Zero and one hundred percent are the same point on the circle, so the last colour meets the first. Add a stop at one hundred percent using the first colour to close the loop.",
      },
      {
        q: "What does the angle control do?",
        a: "It sets where the sweep begins, rotating the whole gradient around its centre without altering the colours or the distances between stops.",
      },
      {
        q: "Can I make a segmented disc instead of a smooth blend?",
        a: "Yes. Place two stops at the same position to create an abrupt edge rather than a transition, which is how a pie-chart style ring is built.",
      },
      {
        q: "Can I build a pie chart with unequal sectors?",
        a: "Yes — every sector is a pair of stops sharing a boundary position, and the spacing between the pairs is free, so unequal slices are just uneven gaps. The percentages have to be worked out from the data first, since the sliders take numbers rather than values.",
      },
    ],
  },
};
