import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 17.
 *
 * The four gradient-export slugs used to render one identical component. Rather than
 * skip three of them, the shared GradientBuilder was given a `format` prop, so each
 * slug now produces what its name promises:
 *   css       — the shorthand declaration (also used by gradient-angle-adjuster)
 *   css-all   — shorthand, background-image and a custom property
 *   svg       — <linearGradient> markup (verified: renders as a 480x320 image)
 *   canvas    — a createLinearGradient snippet with real coordinates
 *   png       — a real downloadable 1200x800 PNG
 *
 * Skipped from this window:
 *  - hue-circle-interactive — deferred to batch 18.
 */
export const SEO_BATCH_17: Record<string, ToolSeo> = {
  "svg-gradient-generator": {
    keywords: [
      "svg gradient generator",
      "svg gradient markup",
      "svg gradient code",
      "linear gradient in svg",
      "svg gradient stops",
    ],
    intro:
      "The SVG gradient generator writes a complete <linearGradient> element with the right axis coordinates for any angle, plus a rectangle that uses it, so the markup renders on its own.",
    content:
      "- The SVG gradient generator keeps the controls of the CSS builders — a large preview, stops with colour and position sliders, and an angle from zero to three hundred and sixty degrees — but the panel at the bottom holds markup rather than a declaration.\n- Copy takes the whole element, from the opening svg tag to the closing one.\n\nWhat the markup contains is the part worth understanding, because SVG does not think about gradients the way CSS does. A gradient in SVG is defined once inside a defs block, given an identifier, and then referenced by other elements through a fill or stroke attribute. So the output here is three things in one: a linearGradient element with an id, one stop per colour carrying an offset percentage and a stop color, and a rectangle filled with a reference to that gradient so the snippet renders as a picture the moment it is saved or pasted into a page.\n\nThe more interesting translation is the axis. CSS describes a gradient direction with a single angle; SVG describes it with a vector — an x1, y1 pair saying where the ramp begins and an x2, y2 pair saying where it ends, expressed in fractions of the shape's bounding box. So zero degrees, which in CSS points to the top, becomes a vector running from the bottom edge to the top edge, and ninety degrees becomes one running from the left edge to the right. Each coordinate is written to three decimal places, which is precision past the point of visible difference but keeps the markup stable and diff-friendly when the angle changes.\n\nStops are written as offset percentages, matching the positions set with the sliders. Only the offset and the colour are emitted, so a stop cannot carry a separate opacity here — SVG expresses that with a stop opacity attribute, which you would add by hand if a fade is needed. The identifier is fixed at grad, which matters as soon as you use the snippet twice: two elements in the same document with the same id are a collision, and the second reference will pick up the first definition. Rename the identifier on one of them.\n\nThe output is also a rectangle, and for many uses that is not what you want — an SVG gradient is usually there to fill a shape you already have. The defs block is the part to keep; the rectangle is a demonstration, and replacing its fill with your own path or icon is the expected next step.\n\n- Scale is the reason to choose this over a PNG: a gradient defined this way has no resolution, stays smooth at any size and weighs almost nothing, which is what icons, favicons and anything printed need.\n- The limits are that only a linear gradient is produced, and that the geometry is a bounding-box vector, so the ramp scales with whatever shape references it rather than with the document.\n- The workflow is one pass: set the colours and positions, choose the angle, copy the svg gradient markup, and keep the linear gradient in svg form wherever it has to scale.\n- Dropping it into a document takes no conversion — the svg gradient code arrives as a defs block with an identifier and bounding-box coordinates already written, svg gradient stops and all.",
    howTo: [
      { step: "Set the stop colours and drag their position sliders to place them on the ramp." },
      { step: "Choose the angle — the axis coordinates in the markup follow it." },
      { step: "Copy the entire element from the SVG panel." },
      { step: "Keep the defs block and reference the gradient from your own shape; rename the id if you use it twice." },
    ],
    whenToUse:
      "Use this when the gradient has to end up as vector artwork — icons, logos, illustrations or anything that must stay sharp at any size. Use the CSS exporter for backgrounds in a stylesheet, or the canvas generator when the gradient is drawn by script. When the same ramp has to be drawn by script rather than declared as markup, the {{canvas-gradient-generator|canvas gradient generator}} is the counterpart; when it only has to exist as a flat file, the {{css-gradient-to-image-exporter|CSS gradient to image exporter}} writes it out as a PNG.",
    faqs: [
      {
        q: "Why is there a rectangle in the output?",
        a: "So the snippet renders standalone. An SVG gradient on its own paints nothing until something references it, so a rectangle filled with url(#grad) is included as a worked example — replace it with your own shape.",
      },
      {
        q: "How does the angle become coordinates?",
        a: "SVG describes direction as a vector between two points in the shape's bounding box rather than as an angle. The tool converts the angle into that vector, which is why the corner cases come out as edges of the bounding box.",
      },
      {
        q: "Can I use two of these in one document?",
        a: "Yes, but rename the id on one of them. Both are emitted with the identifier grad, and duplicate ids in a document mean the second reference resolves to the first definition.",
      },
      {
        q: "Does it support radial or conic gradients?",
        a: "No. Only linear gradients are produced here. SVG has a radial gradient element, but this page does not emit it.",
      },
      {
        q: "How do I fill a multi-path icon with one gradient?",
        a: "Define the gradient once in the defs block, then point every path at the same identifier with fill set to url(#grad). The rectangle in the snippet is only there to make it render standalone — delete it and the definition stays usable.",
      },
    ],
  },

  "canvas-gradient-generator": {
    keywords: [
      "canvas gradient generator",
      "html5 canvas gradient",
      "canvas linear gradient javascript",
      "canvas gradient code",
      "draw gradient on canvas",
    ],
    intro:
      "The canvas gradient generator produces a ready-to-run JavaScript snippet that draws your gradient on a canvas, with the axis coordinates already calculated for the chosen angle.",
    content:
      "- The canvas gradient generator shares its controls with the CSS builders — stops with positions, an angle slider, a live preview — and changes only what the bottom panel contains.\n- Instead of CSS or markup, the panel holds six lines of JavaScript that draw the gradient onto a canvas element, with a copy button for the block.\n\nThe snippet follows the same order a person would write by hand. It is the html5 canvas gradient recipe in full. First it looks up an element by identifier, which is assumed to be gradient, then gets the two-dimensional drawing context. Then it creates the gradient object with four coordinates, adds one colour stop per entry in the ramp, assigns the result as the fill style, and finally fills a rectangle covering the canvas. Running it produces exactly the preview shown above it.\n\nThe interesting part is the pair of coordinate systems the tool has to reconcile. CSS expresses a gradient direction as an angle, while the canvas API wants two absolute points in pixel space — the start of the ramp and the end of it. The tool calculates those four numbers from the angle and the canvas size, centring the axis on the canvas and stretching it just far enough that the ramp spans the whole box, which is the same geometry a browser uses when it paints the CSS version. For the default ninety degrees on a four hundred and eighty by three hundred and twenty canvas, that resolves to a horizontal axis running from the left edge to the right edge at mid-height.\n\n- Stop positions are converted on the way out: canvas expects a number between zero and one, so each percentage from the slider is divided by a hundred and written to two decimal places.\n- That conversion is the easiest part to get wrong by hand — passing fifty rather than half a value does not throw, it simply crams both stops at one end.\n\nTwo assumptions are baked into the output and are worth checking before running it. The element is looked up with the identifier gradient, so either name your canvas that or rename the lookup. And the fill rectangle covers four hundred and eighty by three hundred and twenty pixels, matching the size the coordinates were computed for. On a canvas of a different size the code still runs, but the axis will no longer span the full box — the numbers need recalculating, which is what the angle slider is doing for you.\n\nWhere this is useful is anywhere the gradient has to be drawn by script rather than declared in a stylesheet — every case of a canvas linear gradient javascript is the answer instead: charts that paint their own backgrounds, image processing that composites a tint, generative art, or a canvas whose size is only known at runtime. In those cases a CSS declaration is not an option at all, and hand-building the gradient object with the right coordinates and normalised stops is precisely the fiddly part this removes. The limits are that it is a linear gradient only, that there is no support for radial or conic ramps in the canvas API here, and that the snippet draws once — animating it is a separate exercise in redrawing on each frame. As canvas gradient code to draw gradient on canvas without computing the axis yourself, it covers the part that is easiest to get wrong.",
    howTo: [
      { step: "Set the stops and their positions, then choose the angle." },
      { step: "Copy the JavaScript block from the Canvas panel." },
      { step: "Give your canvas element the id gradient, or rename the lookup in the first line to match." },
      { step: "Adjust the fill rectangle if your canvas is not 480 by 320." },
    ],
    whenToUse:
      "Use this when a gradient has to be drawn in script — charts, compositing, generative work or a canvas sized at runtime. Use the CSS exporter when a stylesheet can carry the gradient, or the SVG generator when the output should be vector artwork. When the ramp should end up as a picture rather than a drawing routine, the {{css-gradient-to-image-exporter|CSS gradient to image exporter}} saves it as a 1200 by 800 PNG, and when it should stay vector, the {{svg-gradient-generator|SVG gradient generator}} writes the markup instead.",
    faqs: [
      {
        q: "What element does the snippet expect?",
        a: "A canvas with the identifier gradient. Either give yours that id or change the first line, which is the only place the element is looked up.",
      },
      {
        q: "Why are the coordinates specific numbers rather than percentages?",
        a: "The canvas API takes absolute pixel positions for the gradient axis rather than a direction. The tool computes them from the angle and the assumed canvas size so the ramp spans the whole box.",
      },
      {
        q: "How are the stop positions converted?",
        a: "Canvas expects values between zero and one, so each percentage from the sliders is divided by a hundred and written to two decimal places. Passing the percentage directly is a common mistake.",
      },
      {
        q: "Can it draw a radial gradient?",
        a: "No. Only the linear form is emitted. The canvas API does offer radial gradients, but this page does not generate that code.",
      },
      {
        q: "What happens if the canvas is a different size?",
        a: "The code still runs, but the four axis coordinates were computed for a 480 by 320 box, so a differently sized canvas gets a ramp that no longer spans it. Recreate the gradient inside your redraw with the new width and height; the normalised stop values carry over unchanged.",
      },
    ],
  },

  "css-gradient-to-image-exporter": {
    keywords: [
      "css gradient to image",
      "gradient to png",
      "download gradient image",
      "export gradient as image",
      "gradient background image png",
    ],
    intro:
      "The CSS gradient to image exporter renders your gradient onto a real canvas and downloads it as a 1200 by 800 PNG, with no code to copy and nothing uploaded.",
    content:
      "- The controls are the standard stop-and-angle set with a live preview; the code panel is replaced by a single action.\n- A Download PNG button sits beside a note stating the size of the file it produces, and pressing it saves a twelve-hundred by eight-hundred PNG of the gradient shown above.\n\nThe generation happens entirely in the page. On click, the tool creates a canvas in memory at the full output size, computes the gradient axis from the current angle, adds one colour stop per entry in the ramp with its position converted into the range the canvas API expects, paints a rectangle covering the surface, and turns the result into a data URL. That is then handed to a download link and triggered. Nothing leaves the browser: there is no upload step, no server round trip and no third party involved, which matters if the gradient is part of unreleased work.\n\nThe resolution is fixed at twelve hundred by eight hundred, which is roughly the shape of a wide hero or a presentation slide and comfortably above the size most screenshots and headers need. Because the gradient is rebuilt at that size rather than scaled up from the preview, the result is a clean, smooth surface with no interpolation artefacts — the same reason a gradient is a poor candidate for upscaling an existing bitmap and a good candidate for being drawn fresh at the size you need.\n\n- The axis geometry changes shape with the angle even though the canvas dimensions never do: the ramp is drawn along a line stretched to span the whole rectangle in the chosen direction.\n- A ninety-degree angle therefore produces a strictly horizontal ramp across the width, while a forty-five-degree angle runs corner to corner and covers a longer distance than the width alone.\n- The result matches how a browser paints the same declaration, so the preview and the file agree.\n\nWhere an image is the right deliverable rather than a declaration: an email header, where support for gradients is unreliable and an image is the safe option; a social card or open-graph image; a slide background; a placeholder that has to sit somewhere CSS cannot reach. An exported gradient background image png also removes any dependence on browser gradient rendering, so the file looks identical everywhere it is used.\n\nWhat it does not offer: no size control, so you take twelve hundred by eight hundred or generate elsewhere; no JPEG or WebP output; no transparent variant, since the gradient fills the frame; and no SVG export, which is the other vector route and lives on its own page here. It also only exports a linear gradient, in keeping with the rest of this cluster. Within those bounds, when the question is how to go from a css gradient to image file with as few steps as possible, this is one button: pick the colours, choose the angle, and download gradient image as a png. Converting a CSS gradient to an image by hand usually means recreating it in a graphics editor; here the browser does the rendering, so gradient to png is a single click and there is no redrawing to get out of step with the original. If the task is to export gradient as image for an email or a slide, that is exactly the workflow this page supports.",
    howTo: [
      { step: "Set the stop colours and positions, then choose the angle." },
      { step: "Check the preview, remembering the exported file is drawn at the same angle and proportions." },
      { step: "Press Download PNG to save a 1200 × 800 image." },
    ],
    whenToUse:
      "Use this when the gradient has to exist as a file — email headers, social cards, slide backgrounds, places where CSS gradients are unreliable. Use the CSS or SVG exporters when the gradient can stay a declaration or vector markup. When it is allowed to stay a declaration, the {{gradient-to-css-exporter|gradient to CSS exporter}} hands it back in three stylesheet forms; when it should stay vector, the {{svg-gradient-generator|SVG gradient generator}} writes the markup instead.",
    faqs: [
      {
        q: "What size is the PNG?",
        a: "1200 × 800 pixels, drawn at that size rather than scaled from the preview. There is no control for changing it.",
      },
      {
        q: "Is anything uploaded?",
        a: "No. The image is rendered in the browser on a local canvas and handed to a download link, so the pixels never leave your machine.",
      },
      {
        q: "Can I export a JPEG or an SVG instead?",
        a: "Not here — the output is PNG only. The SVG gradient generator produces vector markup if that is what you need.",
      },
      {
        q: "Does the angle change the file dimensions?",
        a: "No, the canvas is always the same size; only the direction of the ramp changes. A diagonal angle therefore covers more distance across the same rectangle.",
      },
      {
        q: "Is the exported PNG transparent?",
        a: "No — the whole twelve-hundred by eight-hundred rectangle is filled with the ramp, so the file is fully opaque and can be dropped onto any background. A transparent edge would have to be added afterwards in an image editor.",
      },
    ],
  },

  "gradient-to-css-exporter": {
    keywords: [
      "gradient to css exporter",
      "export gradient css",
      "copy gradient css code",
      "css gradient shorthand",
      "gradient custom property",
    ],
    intro:
      "The gradient to CSS exporter writes a finished gradient three ways at once — the background shorthand, the explicit background-image property and a custom property — so it can be dropped into an existing stylesheet.",
    content:
      "- The controls are the familiar stop and angle set; the panel at the bottom holds three declarations rather than one.\n- All three describe the same gradient in the same notation, and differ only in how a stylesheet consumes them.\n- The copy button takes all three together, so nothing has to be retyped.\n\nThe first line is the background shorthand, which is what most people reach for: one property, the gradient, done. The second repeats the identical value as background-image, which exists for a specific situation. The shorthand resets every background property it does not mention — position, size, repeat, attachment, origin, clip — so assigning a gradient with it can quietly undo a background position set elsewhere in the same rule. Using the longhand changes only the image and leaves the rest of the background stack intact. That distinction causes real bugs in stylesheets where a gradient is layered onto an existing background, and having both spellings side by side is the simplest way to avoid it.\n\nThe third line is a custom property holding the gradient value, which is the form worth understanding if you have not used it. Declaring a gradient once as a variable and referencing it from several rules means the palette can be changed in one place: a hover state, a themed variant and a fallback can all point at the same definition instead of repeating the stops. It also lets the gradient be assembled from other custom properties, so the stops themselves can vary by theme while the gradient expression stays fixed. The trade is that a custom property containing a gradient is only meaningful where it is consumed, so the declaration needs to sit somewhere both the definition and the use can see.\n\nWhich form you want depends on what you are doing with it. Copying into a fresh rule, the shorthand is fine. Editing a rule that already positions a background, the longhand is safer. Building a theme where several components share one treatment, the custom property is the right starting point. Because all three arrive together, the decision is made after copying rather than before, and there is no risk of the three drifting apart since they are generated from the same state.\n\nThe controls themselves cover what the rest of the cluster covers: any number of stops with individual colour and position sliders, and an angle from zero to three hundred and sixty degrees, with the angle always written in degrees rather than as a direction keyword. It is a linear gradient throughout — radial and conic are not produced here — and no vendor prefixes are added, since gradients have been unprefixed in every current browser for years.\n\nUsed as a gradient to css exporter, then, this is the page for getting a gradient into a stylesheet in whichever shape the stylesheet needs. Where the angle adjuster is about choosing the gradient, this one is about delivering it: three spellings, one copy, no retyping, and the copy gradient css code arrives ready for whichever of the three the rule can actually accept. Whether the rule wants the css gradient shorthand, the explicit background-image property, or a gradient custom property that several selectors can share, the export gradient css step is already done.",
    howTo: [
      { step: "Set the stops and the angle until the preview looks right." },
      { step: "Copy the block — three declarations come together." },
      { step: "Keep the shorthand for a fresh rule, the background-image line when a rule already sets background position or size." },
      { step: "Use the custom property line when several rules should share one gradient definition." },
    ],
    whenToUse:
      "Use this when a gradient is being moved into a stylesheet and the form matters — layered backgrounds, theming, or several components sharing one treatment. Use the SVG or canvas generators when the destination is not CSS. When the gradient becomes one of many values a theme has to carry, the {{css-custom-properties-exporter|CSS custom properties exporter}} writes the whole variable block, and the {{design-token-generator|design token generator}} takes the same values into a token file.",
    faqs: [
      {
        q: "Why are three declarations produced instead of one?",
        a: "They are the same gradient written for three situations: the shorthand for a fresh rule, background-image when a rule already sets other background properties, and a custom property for sharing one definition across rules.",
      },
      {
        q: "When does the shorthand cause a problem?",
        a: "It resets every background property it does not mention, including position, size and repeat. If a rule already layers a gradient over a positioned background, the longhand is the safer choice.",
      },
      {
        q: "What is the custom property line for?",
        a: "Sharing one gradient across several rules or themes. Declare it once and reference it wherever the gradient is used, so changing the stops changes every use.",
      },
      {
        q: "Are browser prefixes included?",
        a: "No. Modern browsers support gradients unprefixed, so the output is the declaration alone.",
      },
      {
        q: "Can I copy just one of the three lines?",
        a: "Only by selecting it by hand — the copy button takes the whole block. That is the right default for pasting into a file that wants all three, and a single line is a quick manual trim when a file needs only one of them.",
      },
    ],
  },

  "gradient-palette-mixer": {
    keywords: [
      "gradient palette mixer",
      "mix two colors into a palette",
      "five color blend",
      "two color palette generator",
      "color blend palette",
    ],
    intro:
      "The gradient palette mixer blends two endpoint colors into a fixed five-swatch palette taken at even intervals, so the colours between them can be used as flat values.",
    content:
      "- The gradient palette mixer takes a From colour and a To colour and lays out five swatches: the two endpoints and three colours evenly spaced between them.\n- Each swatch shows its hex value with a copy button, and the row recalculates as either colour changes.\n- That is the whole tool — two inputs, five outputs, no further settings.\n\nThe positions are the thing to notice, because they are fixed rather than adjustable. The five swatches sit at zero, twenty-five, fifty, seventy-five and a hundred percent of the distance from one endpoint to the other. That is a quarter-step ladder, which is why the set behaves like a small scale rather than a freeform blend: there is always a colour exactly halfway between the two ends, and always one a quarter of the way along. If you need a different number of steps or a different spacing, the gradient interpolator in this domain offers between three and fifteen, and the stop editor lets positions be placed by hand.\n\nWhat the fixed quarter steps are good for is palette work in a design file. A five-swatch strip is small enough to read at a glance, large enough to give you a light, a mid and a dark option in a family, and consistent between projects because the spacing never changes. Adding a border, a hover state and a disabled state to a component usually means reaching for three related tones of one colour, and a quarter-step ladder supplies them without any decisions about where to put the intermediate values.\n\nThe blending itself is a straight line through the red, green and blue channels, which is the simplest interpolation and not always the most attractive. Neighbouring hues come out smooth — blending a teal into a blue gives a convincing family — while complementary pairs sag in the middle, because the straight line between them passes close to neutral. A mid blue and a red, for instance, meet at a muted violet that is noticeably duller than either endpoint. Knowing this is mostly about prediction: if a strip looks flat in the centre, the endpoints are probably too far apart on the wheel, and moving one slightly improves the result more than anything else.\n\nThere is no gradient in the output, and that is deliberate. The tool returns discrete colours with individual copy buttons, which is what a palette needs — chart series, category colours, tags and swatch libraries cannot accept a continuous ramp. If the goal is a painted ramp instead, that is a gradient tool; if the goal is five usable values that belong together, this is the shorter route.\n\nLimits: exactly five swatches, no step control, no interpolation-space option, and no export beyond copying the hex values one at a time.\n\n- It also does not check contrast, so a pair that works as a palette may not work as text on a surface.\n- Used to mix two colors into a palette, though, it does the one thing quickly, and as a two color palette generator it produces a five color blend that is immediately usable as a color blend palette for an interface.",
    howTo: [
      { step: "Set the From colour — usually the darker or more neutral of the two." },
      { step: "Set the To colour and read the five swatches as a quarter-step ladder." },
      { step: "Copy the individual hex values into your palette, or use the endpoints as accents and the middle values as surfaces." },
    ],
    whenToUse:
      "Use this when you need a small, fixed palette derived from two colours — component states, chart series, a swatch strip. Use the interpolator when the number of steps needs to vary, or a gradient generator when the output should be a painted ramp. For a ramp that has to pass through a third colour rather than straight between two, the {{multi-stop-gradient-builder|multi-stop gradient builder}} extends the same interpolation with real stop positions, and a set built from one hue rather than a pair is what the {{monochromatic-palette-generator|monochromatic palette generator}} produces.",
    faqs: [
      {
        q: "How many colours does it produce?",
        a: "Five — the two endpoints plus three evenly spaced colours at 25, 50 and 75 percent of the blend. The spacing is fixed.",
      },
      {
        q: "Can I change the number of steps?",
        a: "Not on this page. The gradient interpolator offers between three and fifteen steps, and the stop editor allows hand-placed positions.",
      },
      {
        q: "Why does the middle look dull for some pairs?",
        a: "The blend is a straight line through the RGB channels. Complementary pairs pass close to neutral halfway along and lose saturation; neighbouring hues blend cleanly.",
      },
      {
        q: "Is the output a gradient?",
        a: "No, it is five discrete colours with copy buttons. That is the point — charts, legends and design files take individual values rather than a ramp.",
      },
      {
        q: "Can the same two colours produce a dark-mode counterpart?",
        a: "Not from here — there is no lightness inversion and the five steps are fixed to the two values you set. A dark version means choosing darker endpoints and letting the mixer fill the three steps between them.",
      },
    ],
  },

  "gradient-previewer": {
    keywords: [
      "gradient previewer",
      "preview css gradient",
      "css gradient tester",
      "test gradient css",
      "radial and conic gradient preview",
    ],
    intro:
      "The gradient previewer renders any CSS gradient value you paste into it, which makes it a test bed for gradients written by hand or generated elsewhere.",
    content:
      "- A text area holds a gradient value and the panel underneath renders it; change a character and the panel updates.\n- There are no sliders, no colour fields and no stops, because the input is CSS rather than a set of controls.\n\nThat inversion is the point. Every other gradient tool in this domain builds a value from controls and shows you the result; this one starts from the value, so it can preview a gradient that came from somewhere else — copied out of a design tool, pasted from a code review, generated by a script, or written by hand from memory. The default value is a simple two-stop horizontal ramp, and replacing it with any other gradient expression is the whole workflow.\n\nThe property being previewed is background rather than background-image, which is a quiet advantage. It means the field is not restricted to gradients at all: a flat colour, an image URL, or a multi-layer stack combining an image with a gradient overlay all render correctly, because the browser is doing the parsing and this tool is only handing the value over. A layered gradient over a photograph is exactly the kind of value that is tedious to check in a stylesheet and trivial to check here.\n\nEvery gradient syntax a browser understands therefore works, and that is broader than it might sound. Radial gradients, conic gradients, repeating variants, hard colour stops, interpolation hints, gradients with the interpolation space specified, and gradients with stops given in any of the supported colour notations — all render as soon as they are typed, because none of it is being interpreted by this tool. That makes it the right place to test an unfamiliar form before trusting it in production, and the wrong place to find out why something is broken, since any syntax the browser rejects simply renders as the fallback.\n\n- There is no validation and no error state: a mistyped property, a missing closing parenthesis or a stray character produces an empty panel rather than a message.\n- The panel is a fixed height, so the ramp is always shown in one proportion regardless of whether it will end up in a hero or a sidebar.\n- Contrast, banding and legibility are outside its remit, because the value is passed straight through to the browser.\n\nIn practice it earns its place as a fast second opinion. When a gradient from another generator renders differently than expected in a page, pasting the exact value here shows whether the browser agrees with the generator; when a gradient is built from several layers, this is the quickest place to check that the top layer is not hiding the rest. As a gradient previewer it does exactly one thing — preview css gradient values — and as a css gradient tester it covers more ground than the sliders do, simply because it accepts everything a css gradient can be, including a radial and conic gradient preview and any multi-layer stack you want to test gradient css against.",
    howTo: [
      { step: "Paste or type a gradient value into the text area." },
      { step: "Watch the panel below render it — any browser-supported syntax works." },
      { step: "Edit the value in place to compare variants without leaving the page." },
    ],
    whenToUse:
      "Use this when a gradient value exists already and you want to see it — checking output from another generator, reviewing a layered background, or testing unfamiliar syntax. Use the builders when you are creating the gradient from colours rather than from code. If the value needs flipping rather than looking at, the {{gradient-reverser|gradient reverser}} mirrors its stops while keeping its angle; if it needs to go into a stylesheet, the {{gradient-to-css-exporter|gradient to CSS exporter}} returns it in the three forms a stylesheet consumes.",
    faqs: [
      {
        q: "Which gradient types can it preview?",
        a: "Any the browser supports: linear, radial, conic, repeating variations, hard stops and interpolation hints. Nothing is parsed here, so the value is simply handed to the browser.",
      },
      {
        q: "Why does nothing appear when I type an invalid value?",
        a: "There is no validation or error state. A broken value renders as nothing rather than reporting a problem, so an empty panel usually means a syntax error.",
      },
      {
        q: "Can I preview a background image or a flat colour?",
        a: "Yes. The value is applied as a background, so colours, image URLs and stacks of several layers all render. That makes it useful for checking layered backgrounds.",
      },
      {
        q: "Does it remember what I typed?",
        a: "No. The value resets to its default when the page is reloaded, so copy anything you want to keep before leaving.",
      },
      {
        q: "Should I paste the value or the whole declaration?",
        a: "Just the value — the property name is applied by the page, so a pasted background: prefix or a trailing semicolon is one of the things that renders as nothing. Strip the wrapper and the value itself is exactly what the field wants.",
      },
    ],
  },

  "gradient-reverser": {
    keywords: [
      "gradient reverser",
      "reverse gradient css",
      "flip gradient direction",
      "reverse linear gradient stops",
      "invert gradient colors",
    ],
    intro:
      "The gradient reverser flips a linear gradient so the ramp runs the other way, mirroring every stop position and returning a declaration that renders the reverse of the original.",
    content:
      "- The gradient reverser takes a linear gradient written as CSS and returns the same gradient running the other way.\n- Paste a value into the input field and two ramps appear one above the other — the original and the reversed version.\n- Beneath them, the reversed declaration is printed with a copy button, and both panels update as you type.\n\nWhat the reversal actually does is more subtle than swapping two colours, and it is the reason a naive version of this tool does not work. Each stop in a gradient carries a position along the axis, and the rendering depends on those positions rather than on the order the stops are written in. Reversing the order alone leaves every position attached to its colour, so CSS sorts the stops back into place and paints the original ramp — the text changes and the picture does not. To genuinely flip the ramp, every position has to be mirrored: a stop at zero percent moves to a hundred, one at twenty-five moves to seventy-five, and so on. Then the stops are re-ordered so they read left to right again, and the output is a mirrored ramp with an ascending, readable set of positions.\n\nThis is why a tool that appears to only reverse linear gradient stops is doing more than the phrase suggests: it is inverting the ramp, not just its source text. Mirroring the positions has a consequence worth knowing about. A stop written without an explicit position is spaced automatically by the browser, and an automatic position cannot be mirrored without first deciding what it was. The tool resolves this by computing the even spacing the browser would have used — one stop gets zero, the next a hundred, and the rest divided evenly between — and then writes every position out explicitly in the output. The reversed declaration is therefore more verbose than the input, with a percentage on every stop, which is a fair trade for a result that is unambiguous.\n\nThe gradient's head is preserved. Whatever appears before the first colour — an angle, or a direction keyword such as to right, or an interpolation directive — is carried across untouched, so only the ramp flips and never the axis. The consequence is that reversing a gradient reverses its colours but not its geometry, which is what makes the tool useful for mirroring a background: a ramp that fades to dark on the left becomes one that fades to dark on the right, with the same angle, so a pair of mirrored panels can share one gradient definition.\n\nOnly the linear form is understood. A radial or conic gradient passes through unchanged, because there is no axis to mirror in the same sense, and the output would be identical to the input. Values are also read as text rather than parsed into a full colour model, so unusual notation can defeat the pattern matching even when the browser accepts it.\n\nWhere this saves time is when a gradient exists and only its direction is wrong — a hero that fades the wrong way, a card whose tint sits on the wrong side, an icon that needs mirroring for a right-to-left layout. Rather than rebuilding the gradient by hand, or hand-editing four positions and hoping the commas survived, paste it in and take the reversed declaration. As a gradient reverser it does one small job accurately, and for reverse gradient css or flip gradient direction work the difference from a simple stop-order swap is precisely the part that makes it correct. When two panels should be mirror images of each other and share their colours, being able to invert gradient colors reliably — rather than hoping the ramp flips — is the whole value.",
    howTo: [
      { step: "Paste a linear gradient value into the input field." },
      { step: "Compare the two panels — the original above, the reversed ramp below." },
      { step: "Copy the reversed declaration, which now carries an explicit position on every stop." },
    ],
    whenToUse:
      "Use this when an existing gradient runs the wrong way — mirrored layouts, right-to-left interfaces, or a background that fades toward the wrong edge. Use a gradient builder when the colours themselves need changing rather than the direction. When the ramp needs rebuilding rather than flipping, the {{linear-gradient-generator|linear gradient generator}} is the builder, and a value written by hand that needs looking at is what the {{gradient-previewer|gradient previewer}} renders.",
    faqs: [
      {
        q: "Why not just swap the two colours?",
        a: "Because the positions travel with the colours. Swapping the order alone leaves CSS sorting them back into place and painting the original; the ramp only flips when each position is mirrored, which is what this tool does.",
      },
      {
        q: "Why does the output include a percentage on every stop?",
        a: "Because stops without an explicit position are spaced automatically, and an automatic position cannot be mirrored until it is known. The tool computes that spacing and writes every position explicitly.",
      },
      {
        q: "Does it reverse radial or conic gradients?",
        a: "No. Only the linear form has an axis to mirror, so any other gradient type passes through unchanged.",
      },
      {
        q: "Does the angle change?",
        a: "No. The head of the gradient — the angle or direction keyword — is preserved, so only the colour ramp flips and the axis stays where it was.",
      },
      {
        q: "Does a hard stop stay hard when the gradient is reversed?",
        a: "Yes. The two stops sharing a boundary position both mirror to the same new position, so the abrupt edge survives with the rest of the ramp — it simply lands on the other side of the element.",
      },
    ],
  },
};
