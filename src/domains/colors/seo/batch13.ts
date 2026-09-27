import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 13 (alphabetical slugs 106-118).
 *
 * Skipped from this window:
 *  - css-custom-properties-exporter — renders the same CssVariablesExporter as the
 *    already-authored color-palette-css-exporter.
 *  - css-gradient-to-image-exporter — flagged in the audit; the shared
 *    CSSGradientExporter emits CSS text, not a downloadable image.
 *  - css-hex-color-generator / css-hsl-color-generator / css-rgb-color-generator —
 *    all three are flagged and all three render the identical CssColorGenerator as
 *    css-color-formatter, which is authored here, so each promises a single-format
 *    page while the component returns every format.
 *  - css-text-color-preview — renders the same CssColorPreview as the authored
 *    css-background-color-preview.
 *  - daily-color-generator / daily-color-palette-generator — flagged; both render
 *    the plain random-hex grid / random palette pair.
 */
export const SEO_BATCH_13: Record<string, ToolSeo> = {
  "css-color-formatter": {
    keywords: [
      "css color formatter",
      "format a color as css",
      "css color values",
      "css notation",
    ],
    intro:
      "The css color formatter writes one picked colour as five ready-to-paste strings — upper-case hex, rgb(), rgba(), hsl() and oklch() — so whichever css notation a stylesheet needs is one copy away.",
    content:
      "The css color formatter is the wide page in the notation cluster: rather than producing a single format, it produces five at once. One colour field sits above a panel of five rows — hex, rgb, rgba, hsl and oklch — and every row shows its value in monospace with a copy button beside it. The panel updates as the field changes, so the strings are never stale, and because all five are built from one parsed value they cannot disagree with each other.\n\n- hex — six digits, upper case, the form tokens and diffs are written in.\n- rgb — decimal channels with a space after each comma, as a person would type them.\n- rgba — the four-argument form with the alpha fixed at 1, because the field has no alpha control.\n- hsl — hue in degrees with saturation and lightness as percentages.\n- oklch — perceptual lightness, chroma and hue, printed as native CSS.\n\nThe implementation is deliberately thin, because there is nothing to decide. The five strings come from the same conversion the rest of this domain uses, and the field itself normalises what you type: a three-digit shortcut, a named colour or a pasted rgb() value is parsed and reduced to one six-digit base before any row is rendered. That is why the panel is trustworthy for a handoff document — it cannot print a value it did not parse, and it cannot print five notations of five different colours.\n\nThe page exists for the moment someone needs to format a color as css rather than to convert a colour between systems: five css color values, one source value, and no decisions left to make. When a hand-off document, a README and a stylesheet comment all quote from the same panel, the code that ships and the note that describes it stay in step, and a reviewer comparing the two is comparing two spellings of one colour rather than two colours.\n\nIts limits are the limits of a formatting page.\n\n- No alpha control anywhere, so translucent values are out of scope and the rgba row always reads 1.\n- Bare values, not declarations: the panel hands over the string and leaves the property name to you.\n- No preprocessor or component syntax. SCSS and LESS variable blocks and CSS-in-JS objects belong to the output family rather than to this page.\n- Alpha in an input is discarded rather than shown, because the field normalises to six-digit hex before the rows are built.\n\nReach for this page when a note, comment or README has to quote the same colour in more than one css notation, and reach for a single-notation generator when only one format matters and four of the five rows would be noise. Where the destination needs hwb, lab, lch or a packed integer as well, the format converter covers more ground; where a value already exists and needs checking rather than formatting, the validator is the right gate. The reason to keep this page open during a build is narrower but real: it makes the copy in the document and the value in the stylesheet the same string, which is the failure this family of tools exists to prevent. Five strings from one source colour is a small promise, but it is the promise that stops a token and its documentation from drifting apart.",
    howTo: [
      { step: "Pick the colour with the field at the top of the page." },
      { step: "Scan the five rows — hex, rgb, rgba, hsl and oklch all update together." },
      { step: "Copy the notation your stylesheet or document needs with that row's button." },
      { step: "Paste the value and write the property name yourself; the panel returns strings, not declarations." },
    ],
    whenToUse:
      "Use this when a document or comment needs the same colour in more than one css notation. The {{css-hex-color-generator|HEX generator}}, the {{css-rgb-color-generator|RGB generator}} and the {{css-hsl-color-generator|HSL generator}} are the same panel narrowed to a single expected format, and the {{color-format-converter|format converter}} adds hwb, lab, lch and the packed integer when the destination needs them.",
    faqs: [
      {
        q: "How many formats does the panel produce?",
        a: "Five: upper-case six-digit hex, rgb(), rgba() with an explicit alpha of 1, hsl() and oklch(). All five are generated from the same parsed colour in one pass.",
      },
      {
        q: "Can I paste a colour value in rather than picking one?",
        a: "Yes. The field parses a three-digit or named colour, an rgb() string or a hex value and normalises it to six-digit hex before the rows are built, so the panel always describes one value.",
      },
      {
        q: "Why does the rgba row never carry real transparency?",
        a: "The colour field has no alpha control, so every value it produces is opaque. The four-argument form is still printed because some templates, linters and older codebases insist on it.",
      },
      {
        q: "Is oklch safe to paste into a stylesheet today?",
        a: "Current evergreen browsers render it natively. Older engines will not parse it, so pair it with a fallback declaration in the same rule if those browsers are still in scope.",
      },
      {
        q: "Where are the SCSS and JavaScript outputs?",
        a: "Not on this page — it formats CSS colour values only. Variable blocks and component objects are produced by the CSS variable and export tools in the same domain.",
      },
    ],
  },

  "css-color-variables-generator": {
    keywords: [
      "css color variables generator",
      "css custom property generator",
      "generate css color variables",
      "root css variables",
      "css variable naming",
    ],
    intro:
      "The CSS color variables generator builds a :root block of custom properties from a list of name-and-color pairs you control, so a palette can be named in the same language your project already uses.",
    content:
      "- The CSS color variables generator starts from three rows — primary, background and foreground — and lets you rewrite, remove or extend them.\n- Every row has a text field for the variable name, a colour field for its value and a button that deletes it; Add creates a new row named color plus a number, seeded with a random colour.\n- The panel beside the rows renders the live result: a :root block containing one custom property per row.\n\nThe name field is the part that earns its keep. Values are easy; naming is a decision, and it is the one that determines whether a palette survives a redesign. Type the name without the leading double dash and the generator adds it, so filling in background produces --background. That keeps the field free of syntax and reduces the temptation to type a stray character that would make the declaration invalid. Because the output is regenerated on every keystroke, you can rename a variable and watch the block change under your fingers.\n\n- There is a real design argument for semantic names here, which makes css variable naming the decision that outlives the palette.\n- A property called --background survives a rebrand, because the surface is still a surface, while --blue-500 becomes a lie the first time the brand moves off blue.\n- The generator does not enforce either approach, so it suits both: model a token set around roles for application chrome, or around scale positions when documenting a palette that has to stay faithful to a source.\n\nThe output is plain and deliberately narrow. Each row becomes one --name: value; declaration inside a single :root rule, with the value exactly as the picker produced it, in hex. Copy takes the whole block, so it drops into a stylesheet as-is. Nothing is validated: two rows with the same name produce two declarations of the same property, and the later one wins, which is how CSS works but is almost never what was intended.\n\nAs a css custom property generator it fits a specific job — you already know what the tokens are called and just want the syntax written out. The palette exporters in this domain take the opposite route: they start from a generated palette and derive names from position, which is useful for speed and awkward when the names need to match a brand guide. For preprocessor syntax there are separate SCSS and LESS generators, and for a JavaScript theme object there is a CSS-in-JS generator. This page is the one where you choose the names as well as the values.\n\nThe limitations are worth knowing before you paste. The generator emits a :root block only: no dark-mode media query, no fallback values, no comments and no grouping. Blank or malformed names are passed through untouched, so an empty field yields a declaration with no property. And every value is a hex colour, so gradients, shadows and numeric scales are out of scope. Within that remit, the shortest way to generate css color variables is to type the names you already use, set the colours, and copy one root css variables block — and the naming discipline it encourages is arguably the more durable benefit.",
    howTo: [
      { step: "Replace the default names — primary, background, foreground — with the tokens your project uses, typed without the leading double dash." },
      { step: "Set each value with the colour field beside its name." },
      { step: "Use Add variable for extra tokens, and the delete button to drop any you do not need." },
      { step: "Copy the generated :root block from the CSS panel." },
    ],
    whenToUse:
      "Use this when the token names are already decided and you need the custom-property syntax written correctly. Use the palette exporters when you want names derived from a generated palette instead, or the SCSS and LESS generators for preprocessor syntax. When the set has to travel as a document rather than a stylesheet, the {{design-token-generator|design token generator}} is the carrier, and one common dialect of the same syntax is written out by the {{shadcn-ui-color-exporter|shadcn/ui color exporter}}.",
    faqs: [
      {
        q: "Do I type the double dash in the name field?",
        a: "No. Type primary and the generated declaration reads --primary. The prefix is added at output time, which keeps the field free of syntax errors.",
      },
      {
        q: "What happens if two variables share a name?",
        a: "Both declarations are emitted. CSS resolves the conflict by letting the later one win, so the second row effectively overwrites the first. Nothing warns you.",
      },
      {
        q: "Does it generate dark-mode variables?",
        a: "No. The output is a single :root block. To theme for dark mode you would duplicate the block inside a prefers-color-scheme media query yourself.",
      },
      {
        q: "What format are the values?",
        a: "Hex, taken straight from the colour field. The generator does not emit rgb(), hsl() or oklch() values, so translations between notations are not part of the output.",
      },
      {
        q: "Can one variable reference another?",
        a: "No — the value field is a colour picker, so every property comes out as its own hex. A chain like --brand: var(--base) is a one-line edit in the copied block.",
      },
    ],
  },

  "css-filter-generator": {
    keywords: [
      "css filter generator",
      "css filter color formula",
      "generate css filter",
      "css filter for images",
      "hue rotate css filter",
    ],
    intro:
      "The CSS filter generator composes a filter() formula from five sliders — blur, brightness, contrast, saturate and hue-rotate — and previews the result live on a colour gradient.",
    content:
      "- The CSS filter generator gives you five sliders and a preview panel: blur runs from 0 to 20 pixels; brightness, contrast and saturation each run from 0 to 200 percent; hue-rotate runs from 0 to 360 degrees.\n- The preview is a fixed diagonal gradient of rose, violet and sky, chosen because it carries a wide spread of hues and mid-range tones — so every slider's effect is visible at once.\n- Under the preview, a card holds the finished declaration on a single line with a copy button.\n\nAll five functions are always printed, in a fixed order: blur, then brightness, contrast, saturate and hue-rotate. That makes the output stable and easy to diff — the string changes only where the numbers change — at the cost of being longer than a hand-written one. It also means the neutral values are spelled out, so a freshly loaded page emits filter: blur(0px) brightness(100%) contrast(100%) saturate(100%) hue-rotate(0deg). You can delete the functions you do not need once pasted.\n\nThe order is not cosmetic. CSS applies filter functions in sequence, each one receiving the output of the last, so blurring after a hue rotation is not the same operation as blurring before it. The generator fixes an order that matches how people normally reason about the stack — soften first, then adjust tone, then shift hue — and the preview reflects exactly that sequence. If you reorder the functions in your own stylesheet, expect the result to move away from what you saw here.\n\n- Hue-rotate deserves a caution, because it is the slider most likely to disappoint.\n- The rotation is a matrix approximation in RGB rather than a true conversion into a perceptual colour space, so it can nudge saturation and perceived lightness as well as hue — shifting a saturated blue by 120 degrees will not always land on the green you expect.\n- For precise hue changes a colour value is more predictable, so treat a hue rotate css filter as a quick approximation, best used on something you cannot edit such as a photograph or a third-party asset.\n\nAs a css filter for images tool, the practical workflow is to spill the values into shape here and then verify against the real asset. The preview is a gradient rather than your own image, so the last ten percent of tuning — how a particular skin tone or sky reacts — is best done in the browser's developer tools, where the same declaration can be typed into the styles panel and adjusted live. What this page gives you first is a defensible starting point and the exact syntax.\n\nA few limits belong on the label. The ranges stop at 200 percent, so extreme values cannot be expressed; grayscale, sepia, invert, drop-shadow and opacity are absent from the interface even though filter supports them; and the output is always in pixels and percentages, never in other units. Filters also create a new stacking context and can be expensive to animate on large surfaces. Within those boundaries, this is a fast way to generate css filter declarations and to see a css filter color formula settle into place before you commit it to a stylesheet.",
    howTo: [
      { step: "Drag the five sliders to build the filter, watching the gradient preview update live." },
      { step: "Copy the single-line declaration from the CSS card." },
      { step: "Paste it into your stylesheet and delete any functions left at their neutral values." },
    ],
    whenToUse:
      "Use this when you need a filter applied to an existing element you cannot recolour, such as a photograph or a vendor logo. Use the backdrop-filter generator when the goal is to blur or tint whatever sits behind an element instead. When the hue shift has to be precise rather than approximate, the {{hue-rotator|hue rotator}} works on the colour itself; when the target is what sits behind an element rather than inside it, the {{css-backdrop-filter-generator|CSS backdrop filter generator}} is the sibling property.",
    faqs: [
      {
        q: "Why does the output always contain all five functions?",
        a: "It is generated from a fixed template, so the string is stable and diff-friendly. Neutral entries such as contrast(100%) are harmless and can be deleted after pasting.",
      },
      {
        q: "Does the order of the filter functions matter?",
        a: "Yes. Each function receives the output of the previous one, so the same five numbers in a different order can produce a visibly different result. The preview shows the fixed order used in the output.",
      },
      {
        q: "Why is the preview a gradient rather than my image?",
        a: "The page has no image input. The gradient spans many hues so every slider is visible at once; for fine tuning against a specific photo, paste the declaration into your browser's developer tools.",
      },
      {
        q: "Can I apply grayscale or sepia here?",
        a: "Not from the interface — only blur, brightness, contrast, saturate and hue-rotate have sliders. You can add those functions manually to the copied declaration.",
      },
      {
        q: "Does the filter apply to the element's children too?",
        a: "Yes — a filter on an element affects everything painted inside it, text and images included, which is why a wrapper with a blur takes its whole contents with it. Filtering only what sits behind an element is what backdrop-filter does instead.",
      },
    ],
  },

  "css-gradient-animation-generator": {
    keywords: [
      "css gradient animation generator",
      "animated gradient css",
      "css animated background",
      "gradient animation css",
    ],
    intro:
      "The CSS gradient animation generator produces a complete keyframes-plus-class snippet for a drifting three-colour animated gradient background, with the running animation previewed above the code.",
    content:
      "The CSS gradient animation generator is a two-part page: a panel with a live animated gradient, and a card holding the entire snippet that produces it. Copying that card gives you a @keyframes shift rule and a .animated-bg class, ready to paste into a stylesheet. There are no inputs — the colours, angle, duration and easing are fixed — so the preview and the code are guaranteed to match, which is the point of showing them side by side.\n\n- The class declares a three-stop linear gradient at 270 degrees, running blue through purple to red, and then sets background-size to 600 percent in both directions.\n- At that size the gradient is far larger than the element it paints, so only a slice of it is visible at any moment.\n- The keyframes then animate background-position from 0 percent to 100 percent and back, sliding the visible window across the oversized gradient.\n- That is what produces the sense of colours drifting past rather than the element changing colour.\n- Nothing in the snippet changes colour: the same three stops slide across the element, which is why the effect reads as movement rather than as a state change.\n\nUsing it is a two-step job: copy the block and paste it into a stylesheet, then add the class name to whichever element should carry the effect. Because the animation lives in a class rather than an inline style, any element that receives animated-bg inherits the whole effect, which makes it easy to give a hero banner, a card header or a loading placeholder a css animated background without duplicating declarations.\n\n- If the animation should carry your own brand colours, this page will not accept them.\n- The gradient, angle, duration and easing are all fixed in the emitted snippet, so any variation starts with an edit to the copied CSS.\n- The workable route is to generate the static gradient you want and reuse only the background-size and keyframes from this snippet around it.\n- The timing is a deliberately slow drift at 12 seconds, ease, infinite; shortening it reads as motion rather than ambience, and stretching it much further reads as static.\n\nWhere it belongs is behind content that is allowed to be decorative: hero sections, empty states, marketing panels. It is a poor choice directly behind body text, and worth avoiding in any interface that needs to hold attention on a task. Continuous animation also costs paint work, so the larger the element, the more it shows up in performance profiles.\n\nFinally, the snippet carries no accessibility guard. The CSS is a gradient animation, so it is exactly the kind of motion a prefers-reduced-motion query exists for, and you should wrap the animation property in a media query that disables it for people who ask for reduced motion. With that addition — and a decision about whether the drifting gradient suits the surface — this is the fastest way to get animated gradient css into a page, complete with the gradient animation css keyframes that make it move.",
    howTo: [
      { step: "Copy the CSS block from the card under the preview." },
      { step: "Paste it into a stylesheet — it brings both the @keyframes rule and the .animated-bg class." },
      { step: "Add the class to the element that should carry the animated background." },
      { step: "Wrap the animation property in a prefers-reduced-motion query if the effect is decorative." },
    ],
    whenToUse:
      "Use this when you want a ready-made drifting gradient and are happy with its fixed palette and timing. Use the linear or radial gradient generators when you need your own colours and will add the animation yourself. Where the drift has to exist without CSS animation — an email header, a slide background, a static mock — the {{css-gradient-to-image-exporter|CSS gradient to image exporter}} writes a gradient of your own out as a PNG, and a hand-edited version of the snippet's background value can be checked in the {{gradient-previewer|gradient previewer}} before it goes back into the keyframes.",
    faqs: [
      {
        q: "Can I change the colours or the speed?",
        a: "Not on this page. The gradient, angle, duration and easing are fixed in the emitted snippet. Edit the copied CSS afterwards, or generate the gradient you want separately and reuse only the background-size and keyframes.",
      },
      {
        q: "Why does the snippet set background-size to 600%?",
        a: "It makes the gradient far larger than the element, so animating background-position slides a visible window across it. Without the enlarged background size, the position change would have nothing to move across.",
      },
      {
        q: "How do I apply it to an element?",
        a: "Paste the block into your stylesheet and add the class animated-bg to the element. The keyframes rule is global; the class is what carries the background and the animation.",
      },
      {
        q: "Is there a reduced-motion guard?",
        a: "No. The emitted CSS animates unconditionally, so if the effect is decorative you should add a prefers-reduced-motion media query that turns it off.",
      },
      {
        q: "What happens if I paste the snippet twice?",
        a: "It duplicates the same @keyframes shift rule. CSS tolerates that — the definitions are identical, so the later one wins — but the tidier deployment is to paste the block once and put the animated-bg class on every element that should carry the effect.",
      },
    ],
  },

  "css-in-js-color-object-generator": {
    keywords: [
      "css in js color object generator",
      "styled components colors",
      "javascript color object",
      "generate colors object",
      "styled-components palette",
    ],
    intro:
      "The CSS-in-JS color object generator turns a list of named colors into a JavaScript module exporting a colors object, ready for styled-components and other CSS-in-JS setups.",
    content:
      "- The CSS-in-JS color object generator works from a pair of rows — primary and danger by default — where each row pairs a name field with a colour field and a delete button.\n- Add appends another row named color plus a number, seeded with a random colour.\n- The panel on the right, headed STYLED, shows the module the current rows produce: an import line for styled-components, then an exported colors object with one single-quoted value per row.\n\nWhat you get out is a plain ES module. Drop it into a theme file and import the object wherever a component needs a token; the keys you typed become the accessors, so a row named primary is reached as colors.primary. That is the whole contract, and it keeps the colour source in one place rather than scattered through component files as literals.\n\n- Two details in the generated code deserve attention before you ship it, and the first is the import line.\n- It brings in css from styled-components, but the exported object uses nothing from that package — the import is scaffolding that matches the conventional look of a theme file rather than something the object needs, so delete it if the file does not otherwise use the tagged template helper.\n- The second is more consequential: the keys are emitted unquoted, so every name has to be a valid JavaScript identifier, and a hyphen breaks it.\n- That bites the moment you press Add, because the generated name is color-3 style — paste that output without renaming and the module will not parse. Rename to camelCase or snake_case, and treat any name you type that would not survive as an unquoted key the same way.\n\nValues are always single-quoted hex strings, so the object is portable between bundlers and needs no runtime parsing. There is no nesting, no theme provider wiring, no dark and light variants and no alpha. If you need those, the object is a starting point rather than a finished theme — which is a reasonable division of labour, since the colours are the part that changes most often and the structure around them is usually project-specific.\n\nCompared with its neighbours, this generator is aimed squarely at JavaScript consumers. The SCSS and LESS variable generators in this domain share the same row interface but emit preprocessor syntax, the native export generators emit Android, iOS, Flutter and Figma formats, and the design token generator writes the W3C JSON shape. As a css in js color object generator it is the shortest route to a styled components colors object, a styled-components palette or a javascript color object in a file you can import immediately, and it keeps the naming decision in your hands rather than deriving names from position. If the thing you actually need is to generate colors object entries for a theme file, the row interface here does that directly, one name and one value at a time.\n\nOne thing to plan for if the file is TypeScript: the output is untyped, so you will want as const on the object or an explicit interface if other code relies on the key names. Beyond that, the output is exactly what it looks like — an import, an object, and your colours, ready to copy.",
    howTo: [
      { step: "Rename the default primary and danger rows, or add new ones, using names that would be valid as unquoted JavaScript keys." },
      { step: "Set each colour with the field beside its name." },
      { step: "Copy the module from the STYLED panel." },
      { step: "Paste it into a theme file and delete the import line if styled-components is not otherwise used there." },
    ],
    whenToUse:
      "Use this when colours need to reach components through JavaScript — a styled-components theme, an emotion object or a plain config module. Use the SCSS or LESS generators for preprocessor syntax, or the design token generator for the W3C JSON format. A lighter JavaScript shape for the same values is the {{color-object-generator|color object generator}}, and when the object becomes a component library's theme rather than a palette, the {{chakra-ui-color-exporter|chakra ui color exporter}} writes that dialect.",
    faqs: [
      {
        q: "Which syntaxes are supported?",
        a: "This page emits a JavaScript module for styled-components. The same row interface also exists for SCSS and LESS variables, and for Android, iOS, Flutter and Figma exports, on their own pages.",
      },
      {
        q: "Why did my copied object fail to parse?",
        a: "Because the keys are written unquoted, so they must be valid JavaScript identifiers. A hyphenated name such as the auto-generated color-3 is invalid — rename it to camelCase or snake_case.",
      },
      {
        q: "Do I need the styled-components import?",
        a: "No. The object itself uses nothing from styled-components, so the import line is boilerplate and can be deleted unless the same file uses the tagged template helper.",
      },
      {
        q: "Can I express lighter and darker variants?",
        a: "Not in this output. Every row becomes one flat hex value. For tints and shades of the same token, generate them separately and add them as extra rows.",
      },
      {
        q: "Can the object hold nested groups rather than one flat list?",
        a: "Not from the rows — one row is one key at the top level. Nesting is a manual edit of the copied object, where a second level of braces is all it takes.",
      },
    ],
  },

  "css-named-colors-reference": {
    keywords: [
      "css named colors reference",
      "css color names",
      "search color names",
      "named color values",
    ],
    intro:
      "The CSS named colors reference is the searchable table of the names CSS defines, each shown as a swatch with its hex value and a copy button.",
    content:
      "The CSS named colors reference is the table itself rather than a tool wrapped around it. Names sit in a responsive grid — two columns on a phone, six on a wide screen — and each card shows the swatch, the name and its hex value with a copy button beside it. A search field above the grid filters the list as you type.\n\nThe search is a substring match over the name, which is exactly the behaviour you want when the name is half-remembered. Typing sky finds skyblue and lightskyblue and darkskyblue but not a colour whose name merely means sky, and typing dark narrows the list to the dark-prefixed family — the darkolivegreen and darkseagreen entries alongside the rest. Because the filter runs on every keystroke, the grid is a practical way to answer questions like which two names share a value or what the hex of aliceblue actually is, without leaving the page for a specification document.\n\nA reference page has one job beyond listing: it should answer the small questions that come up while writing css color names into a stylesheet, and the filter is how it does that. Search color names by the fragment you remember and the grid narrows to a handful of swatches, so darkseagreen and mediumseagreen can be compared by eye rather than by argument. The same habit runs in reverse when you need named color values to paste into a token file: type the family, read the hex off the card, copy it.\n\nWhat the build's table contains is worth stating precisely, because a reference is only as good as its list.\n\n- 141 names, ordered alphabetically from aliceblue to yellowgreen.\n- Two values with two names each: aqua and cyan both mean #00FFFF, and fuchsia and magenta both mean #FF00FF.\n- The gray spelling only. grey, darkslategrey and the other British spellings are not part of this table, though CSS accepts them.\n- No transparent or currentcolor entries: those are keywords a browser understands, not fixed named values, and nothing here pretends otherwise.\n\nThe strengths and the limits are the same fact seen twice: a name is shorter to remember than a hex string and says nothing about how the colour should be used. Nothing in this table tells you whether a name is safe for text, which names are old and which were added later, or how a value behaves under a colour-vision deficiency. It lists values, and the rest of the domain exists for the other questions — the lookup names an arbitrary colour, the finder snaps one to this table, and the contrast tools measure what happens when two of these values meet.\n\nRead it the way you would read a dictionary: for definitions, not for style. When a name is going into a stylesheet, copy the hex beside it, because a keyword survives a rename-free refactor but a hex string behaves the same in every tool and every language, and because a value that has to be checked later is easier to check when it is written in one notation everywhere.",
    howTo: [
      { step: "Type part of a name into the search field to filter the grid." },
      { step: "Scan the swatches to find the value you meant rather than the name you remembered." },
      { step: "Use the copy button on a card to take its hex value for a stylesheet or a token file." },
      { step: "Clear the filter to read the list in alphabetical order when browsing rather than searching." },
    ],
    whenToUse:
      "Use this when the name is the question — spelling it correctly, finding its value, or checking whether a colour has a name at all. The {{color-name-lookup|colour name lookup}} does the reverse by naming a colour you already have, the {{nearest-named-color-finder|nearest named colour finder}} snaps a value into this table and reports what the snap cost, and the {{color-format-validator|format validator}} checks whether a name you have written will actually be accepted.",
    faqs: [
      {
        q: "How many names does the table hold?",
        a: "141 alphabetical entries. It is the same list the lookup and snapping tools search, so a colour that has no name anywhere else has none here either.",
      },
      {
        q: "Why are the British spellings missing?",
        a: "This build's table carries the gray spelling family only, so grey and darkslategrey are absent. Browsers still accept those keywords; the reference simply does not list them.",
      },
      {
        q: "Why do aqua and cyan both appear with the same value?",
        a: "Because they are two accepted names for #00FFFF, as fuchsia and magenta both mean #FF00FF. Both spellings exist so that old stylesheets written with either name keep working.",
      },
      {
        q: "Is it better to write a name or a hex value in CSS?",
        a: "Names read well in a prototype and are easy to remember; hex values are unambiguous and portable. For anything that a token file or another tool has to read, copy the hex.",
      },
      {
        q: "Does the search handle misspellings?",
        a: "No. Filtering is a plain substring match on the name, so a typo returns an empty grid rather than a suggestion. The rest of the name usually still finds it.",
      },
    ],
  },

  "cultural-color-palettes": {
    keywords: [
      "cultural color palettes",
      "palettes from world cultures",
      "japanese color palette",
      "traditional color palettes",
      "indian color palette",
    ],
    intro:
      "Cultural color palettes presents five curated palettes drawn from world cultures — Japanese, Scandinavian, Indian, Mexican and Moroccan — each rendered as five swatches with copyable hex values.",
    content:
      "Cultural color palettes is a browse-only page: five labelled cards, one per tradition, each holding five swatches. Every swatch shows its hex value and a copy button, so a colour can be lifted out of a set and used on its own. There are no controls and nothing to configure, which suits a page whose job is to hand you a direction rather than a computation.\n\nThe Japanese set pairs a strong vermilion with a golden yellow, a deep navy, a near-black and a warm off-white — red, gold, indigo, ink and paper, which is a recognisably traditional overlap of lacquerware and indigo dyeing. The Scandinavian palette runs almost the other way: a warm paper white and a soft sage are the two colours with any personality, supported by charcoal, a muted terracotta and a pale straw. It is the quietest of the five, and the only one whose accents are desaturated.\n\nThe Indian palette is built on contrast — a bright red and a warm orange set directly against a teal and a dark slate, with a saturated yellow available to lift any composition. The Mexican palette carries the same red as its loudest note but surrounds it with near-white, pale aqua, a mid steel blue and a deep navy, which cools the whole set and makes the red read as accent rather than theme. Sharing a colour across two palettes is a useful reminder that a palette is defined by its relationships, not its ingredients.\n\n- The Moroccan set uses a different strategy again: two blues at very different lightnesses, a pale mint, a warm orange and a saturated crimson.\n- It reads as tilework — a cool field with warm incident — and it is the most evenly weighted of the five, with no single colour claiming the foreground.\n\nIn practice the page is a mood board with exact codes attached. Pick the tradition whose character matches the brief, copy two or three values and use them as fixed points while the rest of the interface falls into place. Because each set includes at least one neutral and one accent, a palette is usually enough to establish a tonal hierarchy without adding anything, and the neutrals in each are the values most worth copying first, since they are the hardest to invent convincingly.\n\n- A word of care about the framing, because it is the honest part of working with this material.\n- A culture is not a palette, and colour symbolism is regional, contested and frequently inverted — white signals mourning in parts of East Asia while reading as celebration elsewhere, and red moves between prosperity and danger depending on context and era.\n- These five sets are design interpretations with a regional flavour, chosen for how well they work together rather than as scholarly references, and they should be treated as traditional color palettes in the loosest sense: starting points for a mood.\n- Used that way — as five usable palettes from world cultures, with a japanese color palette to hand when you need one instantly — the page does its job.\n- Treat any single one as a claim about an indian color palette or about how a whole region uses colour and it will mislead you.",
    howTo: [
      { step: "Find the group you want — Japanese, Scandinavian, Indian, Mexican or Moroccan." },
      { step: "Read the five-swatch row for that group." },
      { step: "Copy the values that fit the project." },
      { step: "Treat a group as a starting point rather than a specification of any culture's palette." },
    ],
    whenToUse:
      "Use this when a project needs a regional or cultural mood and you want concrete values to start from. Use the flag colour extractor for national flags specifically, or the seasonal and dessert palette generators when the imagery is thematic rather than cultural. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Can I edit or shuffle these palettes?",
        a: "No. The page is a reference — five fixed sets, each with five swatches. The copy button on each swatch is the only interaction.",
      },
      {
        q: "Do the palettes repeat any colours?",
        a: "Yes. Indian and Mexican share the same red, #E63946, which is a useful illustration of how much context changes the role a colour plays.",
      },
      {
        q: "How should I use a palette like this?",
        a: "Treat it as direction rather than a finished scheme. Each set contains at least one neutral and one accent, so it is usually enough to establish a tonal hierarchy in a first pass.",
      },
      {
        q: "Is this an authoritative cultural reference?",
        a: "No. These are design interpretations with a regional flavour. Colour symbolism varies by region, era and context, and often carries opposite meanings in neighbouring cultures.",
      },
      {
        q: "What does the cultural color palettes not do?",
        a: "A culture is not a palette, and colour symbolism is regional, contested and frequently inverted — white signals mourning in parts of East Asia while reading as celebration elsewhere, and red moves between prosperity and danger depending on context and era. These five sets are design interpretations with a regional flav",
      },
    ],
  },
};
