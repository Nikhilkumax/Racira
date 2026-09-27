import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 34 (designsys + data + fun + theory).
 *
 * Only tools whose logic is correct (audit verdict "Y") are authored here.
 * Tools flagged "P"/"N" in the functional audit are deliberately excluded.
 */
export const SEO_BATCH_34: Record<string, ToolSeo> = {
  "adobe-spectrum-color-reference": {
    keywords: [
      "adobe spectrum color reference",
      "spectrum design system colors",
      "adobe design tokens colors",
      "spectrum color palette tool",
    ],
    intro:
      "The Adobe Spectrum color reference browses the Spectrum design system's core palette — each color family as a labeled shade ramp, copy-ready for design tokens.",
    content:
      "Spectrum is Adobe's design system — the visual language behind Creative Cloud and the company's product surface — and its color architecture is a study in enterprise restraint: a set of core hues, each expressed as a labeled ramp, each ramp designed for roles before aesthetics. The Adobe Spectrum color reference lays those families out as browsable swatch rows — every shade labeled with its step and hex — so the system's colors can be studied, compared and copied without opening Adobe's tooling.\n\nReading a mature design system's palette is education in itself. Spectrum's ramps are built for accessibility-first deployment: the dark steps are calibrated for text on light surfaces, the light steps for text on dark, and the mid steps carry the brand presence. Browsing the families side-by-side shows the discipline — consistent spacing between steps, consistent saturation logic across hues — that distinguishes a designed system from an assembled one. For teams building their own token architecture, it is a reference implementation worth imitating; for teams working inside Adobe's ecosystem, it is the palette of record.\n\nEach swatch copies its hex directly, so the tool doubles as a palette donor: a Spectrum blue can seed an interface prototype, a family can be compared against your own ramp for calibration, and the enterprise-neutral greys are a dependable starting scale for any product UI. The other design-system references — GitHub Primer, Atlassian — present their systems in the same browsable form, and setting them side-by-side is a masterclass in how the big platforms solved the same problems differently.\n\n- A design system's palette is a record of its constraints, and reading one is closer to reading an engineering document than a mood board.\n- Spectrum's ramps were built for surfaces that must survive long sessions and dense information: the steps are spaced so that adjacent values can serve as surface and edge without flattering each other, and the restrained register keeps text legible without leaning on contrast alone.\n- What the browser makes visible is that discipline: the same number of steps in every family, the same relationship between the dark end and the light end, and an accent set deliberately smaller than the surface set.\n- That ratio is the most transferable lesson — place a family from your own system beside these ramps and the differences in step spacing become obvious, which is usually where a home-grown palette proves either too crowded or too sparse.\n\nThe grey family deserves a look on its own, since it carries most of the interface and is the hardest ramp to get right. The semantic colours are worth comparing against their own brand set too, because that is where a system's judgement shows most clearly.\n\nAs a Spectrum design system colors browser it is deliberately a reference: the adobe design tokens colors laid out, labeled and copy-ready — a spectrum color palette tool for studying how the enterprise systems do it, and for borrowing honestly when your own system needs a proven starting point.",
    howTo: [
      { step: "Browse the color families, each shown as a labeled shade ramp." },
      { step: "Compare ramps for step spacing and saturation logic across hues." },
      { step: "Copy any swatch's hex for prototypes, calibration or token seeds." },
    ],
    whenToUse:
      "Use this to study or borrow from Adobe's system palette. Use the Primer and Atlassian references for the sibling systems, the Material and Tailwind exporters when a derived ramp must match those frameworks, and the token exporters to formalise what you borrow. Values that should join a working palette rather than be read are the {{palette-importer|palette importer}}'s job, and a borrowed value that has to carry your own text roles belongs in the {{contrast-checker|contrast checker}}.",
    faqs: [
      {
        q: "Is this the complete Spectrum palette?",
        a: "It presents the core color families as labeled ramps — the working set most design work needs. Adobe's full system adds semantic and component-level tokens beyond this scope.",
      },
      {
        q: "Can I use Spectrum colors in my own product?",
        a: "Color values are facts; the value is studying the system's structure. For products inside Adobe's ecosystem the official tokens are the sanctioned source — elsewhere, treat the palette as a reference.",
      },
      {
        q: "Why do the ramps look muted compared to marketing palettes?",
        a: "Enterprise systems tune for long-session legibility and accessibility at scale — calmer saturation, careful step spacing. That restraint is the lesson the ramps teach.",
      },
      {
        q: "How does it compare to the Primer reference?",
        a: "Same browsing format, different system: Spectrum leans Adobe's warm enterprise neutrality; Primer leans GitHub's cool developer-tooling register. Comparing both is instructive.",
      },
      {
        q: "How many steps does each ramp show?",
        a: "Ten, labelled 50 to 900, generated at fixed lightnesses around the family's anchor — the same ladder for every family, so a step number means the same lightness wherever it appears.",
      },
    ],
  },

  "github-primer-color-reference": {
    keywords: [
      "github primer color reference",
      "primer design system colors",
      "github color palette hex",
      "primer color tokens tool",
    ],
    intro:
      "The GitHub Primer color reference browses the Primer design system's palette — functional color families as labeled ramps, from the signature blues to the semantic states.",
    content:
      "Primer is GitHub's design system, and its palette is a case study in functional color: every hue earns its place by doing a job — the signature blues carry brand and action, the greens carry success, the reds carry danger, the greys carry the enormous weight of a text-first interface. The GitHub Primer color reference lays those families out as browsable ramps, each swatch labeled and copy-ready, so the github color palette hex values are one click away and the system's logic is visible in the arrangement.\n\nWhat Primer teaches is the economy of a developer-tooling palette. Because GitHub's surface is mostly text and code, the ramps are calibrated for legibility first: the greys form the real backbone — surfaces, borders, muted text — while the chromatic families stay in their lanes, appearing where meaning demands them. Browsing the system shows the ratio: how few saturated colors a product needs when the neutrals are designed well. That is the lesson worth stealing, and the reason the primer color tokens tool is as useful to teams building their own systems as to those working in GitHub's orbit.\n\nEach swatch copies its hex for prototypes, calibration or token seeds; the ramps' step spacing shows Primer's accessibility calibration — dark steps tuned for text on light, light for text on dark. The sibling references present Adobe Spectrum and Atlassian's systems in the same form, and the three together are a survey of how the major platforms answered the same brief: functional color at scale, trustworthy in the dark corners of a UI nobody styled deliberately.\n\nFunctional colour is a discipline about proportion, and Primer demonstrates it better than almost any public system because its surface is text and code rather than imagery. In that context the neutrals carry the interface — backgrounds, borders, muted text, hover states — while the chromatic families are rationed to meanings: a blue for actions, a green for success, reds and oranges for the states that must interrupt. The consequence is a palette whose saturated entries can be counted on one hand while its greys come in more steps than most teams would think to write. The lesson transfers directly to product work, where a palette that feels loud usually has too much accent relative to its working surfaces rather than too much saturation in the accent itself. Comparing here also shows how a system handles states, since disabled and hover values are the entries a home-grown palette most often leaves to chance.\n\nReading the ramps as a whole, rather than sampling a favourite blue, is what makes the exercise worthwhile. The dark-mode families deserve the same attention, because a set tuned for light rarely inverts cleanly without its own calibration.\n\n- As a Primer design system colors browser it is deliberately a reference — browsable, labeled, honest about being a study aid.\n- For teams calibrating their own functional palettes, it is the dev-tooling benchmark; for GitHub-adjacent work, it is the palette of record in swatch form.",
    howTo: [
      { step: "Browse the functional families — brand blues, semantic states, the grey backbone." },
      { step: "Study the ramps' spacing and how little saturation the system spends." },
      { step: "Copy swatch hexes for prototypes or calibration against your own palette." },
    ],
    whenToUse:
      "Use this to study or borrow from GitHub's system palette. Use the Spectrum and Atlassian references for sibling systems, the dark-mode palette generator when Primer's dark-surface logic is the lesson needed, and the token exporters to formalise borrowed values. Calibrating your own palette against this one is what the {{palette-comparison|palette comparison}} is for, and borrowed values have to meet your own text roles in the {{contrast-checker|contrast checker}}.",
    faqs: [
      {
        q: "Which color modes does it show?",
        a: "The core color families as light-mode ramps — the canonical values the system documents. Primer's dark mode re-maps the same tokens to different values.",
      },
      {
        q: "Why are the greys the most interesting part?",
        a: "Because a text-first product lives on its neutrals — Primer's grey ramp does most of the visual work, and its calibration is the system's real achievement.",
      },
      {
        q: "Can I copy values for my own design system?",
        a: "Yes — each swatch copies its hex. Treat borrowed values as a starting calibration; a system earns its own palette by adapting the structure, not just the colors.",
      },
      {
        q: "How current is this against Primer's latest release?",
        a: "It presents the core families' canonical values; Primer evolves its tokens between releases, so the official source remains the record for version-sensitive work.",
      },
      {
        q: "How do the ramps relate to Primer's tokens?",
        a: "They show families rather than tokens: each block is one family's ladder, so a value can be read directly while a semantic token name still has to come from the system's own documentation.",
      },
    ],
  },

  "atlassian-design-color-reference": {
    keywords: [
      "atlassian design color reference",
      "atlassian design system colors",
      "adg color palette hex",
      "atlaskit color tokens tool",
    ],
    intro:
      "The Atlassian design color reference browses the Atlassian Design System's palette — brand blues, semantic states and neutral ramps, labeled and copy-ready.",
    content:
      "Atlassian's design system colors a very specific world — collaboration software where tables, boards and docs run for eight hours a day — and its palette reflects that audience: calm brand blues, carefully rationed semantic color, and a neutral structure built for information density without fatigue. The Atlassian design color reference lays those families out as browsable ramps, each swatch labeled and copy-ready, making the adg color palette hex values accessible without the design system's full documentation weight.\n\nThe system's lesson is semantic discipline at enterprise scale. The blue family carries interaction and brand; green, red, yellow and purple each hold a state lane — success, danger, warning, discovery — and the greens stay green across contexts rather than drifting with marketing campaigns. Browsing the ramps shows the calibration that eight-hour legibility demands: mid-tone saturation, generous neutral share, step spacing tuned for text roles at each depth. For teams building dashboards and productivity tools, that register is the relevant benchmark — closer to most products' reality than consumer-vivid systems.\n\nEach swatch copies its hex for prototypes and calibration; the families compare cleanly against the sibling references — Adobe Spectrum's enterprise neutrality, GitHub Primer's text-first economy — and the three surveyed together show three coherent answers to the same enterprise brief. The dark-mode palette generator is the natural companion study: enterprise systems live or die by their dark-mode remapping, and the atlaskit color tokens tool's light ramps are the first half of that story.\n\nEnterprise software is the hardest environment for colour, because the interface is dense, the sessions are long, and the audience includes people who will look at the tool for eight hours a day. Atlassian's palette reflects those conditions: restrained saturation, surfaces pitched carefully enough to sit behind tables and boards without vibrating, and a small set of accents that carry status across a very large product. The interesting part to study is how much of the palette exists to separate layers — a card on a board, a row in a table, a panel on a page — since that is the problem a dense interface actually has, and it is solved with steps close enough that the eye reads structure rather than decoration. Teams building admin and productivity surfaces can borrow the discipline directly, and teams working inside Atlassian's ecosystem get the swatch-level view the documentation assumes they already have.\n\nTwo habits are worth copying whatever the framework. Keep status colours out of the brand palette, so a green never has to double as a marketing accent. And reserve the strongest value in the set for the one element that must be found first on a given screen. Both are cheap to adopt early and expensive to retrofit, which is why studying a mature system before a project starts pays off disproportionately.\n\n- As an Atlassian Design System colors browser it is deliberately a reference: labeled ramps, honest scope, one click per hex.\n- For teams calibrating productivity-tool palettes or working in Atlassian's ecosystem, it is the swatch-level view the system docs assume you already have.",
    howTo: [
      { step: "Browse the brand and semantic families, each as a labeled ramp." },
      { step: "Note the semantic lanes — each state color holds one meaning across steps." },
      { step: "Copy swatch hexes for prototypes, dashboards or palette calibration." },
    ],
    whenToUse:
      "Use this to study or borrow from Atlassian's system palette, especially for dashboard and productivity contexts. Use the Spectrum and Primer references for sibling systems, and the contrast checker when borrowed values meet your own text roles. The measured lightness and chroma behind a ramp are what the {{palette-balance-analyzer|palette balance analyzer}} reports, and a borrowed set that has to travel into code is the {{design-token-generator|design token generator}}'s output.",
    faqs: [
      {
        q: "Which product palette does this show?",
        a: "The core Atlassian Design System families — brand blues, semantic states, neutrals — as canonical ramps. Individual products layer product-specific accents on top.",
      },
      {
        q: "Why does the palette feel calmer than consumer brands?",
        a: "Eight-hour information work punishes saturation — the ramps are tuned for long-session legibility and dense UIs, which is exactly the register most enterprise products need.",
      },
      {
        q: "Can I copy values into my own design system?",
        a: "Yes — every swatch copies its hex. Study the lane discipline as much as the values; the semantic restraint is the system's real lesson.",
      },
      {
        q: "Does it include the dark mode values?",
        a: "It presents the light-mode canonical ramps; dark-mode remapping is its own discipline — the dark-mode palette generator covers that side.",
      },
      {
        q: "What do the ten steps in each ramp represent?",
        a: "Fixed lightness positions from 50 at the light end to 900 at the dark end, generated around each family's anchor — a consistent ladder rather than the system's official token scale.",
      },
    ],
  },

  "color-array-generator": {
    keywords: [
      "color array generator",
      "javascript color array from palette",
      "colors as js array",
      "palette to array export",
    ],
    intro:
      "The color array generator turns an editable palette into a JavaScript array literal — colors as js, formatted, quoted and copy-ready for any script.",
    content:
      "JavaScript wants its colors as an array — chart libraries take arrays, canvas scripts iterate arrays, generative sketches index arrays — and hand-writing the literal is where quotes, commas and casing go to die. The color array generator does the formatting: build the palette in the editor, and the tool emits the array literal — every color quoted, comma-separated, correctly cased — ready to paste into any script. It is the colors as js bridge between a palette and the code that will consume it.\n\nThe editor-first flow matters because palettes in code are living things. A chart's series colors get adjusted after seeing the legend; a generative sketch's palette evolves over an afternoon of iterations. Editing lives in the palette rows — recolor, rename, reorder — and the array literal regenerates on every change, so the source of truth stays the palette and the output stays mechanical. The copy hands over the complete literal, formatted for direct paste into the consuming script's top or config.\n\nThe array form earns its keep wherever code iterates: series assignments in a charting library, a canvas animation cycling through hues, a game's faction colors, a test fixture asserting a palette's contract. For structures beyond arrays — named keys, nested objects — the color object generator emits the object literal form of the same palette; for JSON-shaped config files, that tool's output is the dialect those files expect. The other exporters speak framework and stylesheet dialects; this one speaks plain script.\n\nHanding a palette to code is a different job from designing one, and most of the friction lives in the syntax rather than the values. Charts want an ordered array, canvas work wants the values in a specific sequence, tests want a list that can be spread and iterated, and a palette arriving as a paragraph of hex codes has to be re-keyed before any of it runs. Producing colors as js array output removes that step and the class of bug that comes with it, since a list generated from one source cannot disagree with itself about ordering or casing. It also makes the palette reproducible: regenerate after a tweak and the diff shows exactly which value moved, which is far harder to read in a hand-edited list. Where several files consume the values, keeping the array in one module and importing it is what stops a second, slightly different copy from appearing later.\n\nThe formatting choices are worth getting right the first time:\n\n- Every value is quoted, comma-separated and correctly cased, one per line.\n- The literal regenerates on every edit, so the source of truth stays the palette and the output stays mechanical.\n- Only opaque hex is represented; translucent values have to be computed elsewhere and pasted in by hand, and the literal carries no names.\n\nAs a javascript color array from palette instrument it is deliberately the smallest useful export: a palette to array export with the syntax handled and nothing else assumed. For the chart, the sketch or the test that just wants colors as js — quoted, separated, valid — this is the shortest path from palette to running code.",
    howTo: [
      { step: "Build the palette in the editor — one row per color." },
      { step: "Watch the JavaScript array literal regenerate with each edit." },
      { step: "Copy the literal into your script, config or test." },
    ],
    whenToUse:
      "Use this when code consumes colors as a list — charts, canvas, tests. Use the object generator for keyed structures, the JSON generator for config files, and the token exporters when a pipeline rather than a script is the consumer. For keyed structures the {{color-object-generator|color object generator}} emits an object literal, the {{color-json-generator|JSON generator}} speaks the config-file dialect, and the {{color-token-generator|token generator}} is for a pipeline rather than a script.",
    faqs: [
      {
        q: "What format are the array entries?",
        a: "Quoted hex strings, comma-separated — the literal form every JavaScript context accepts, cased consistently for diff-friendly diffs.",
      },
      {
        q: "Can I change the order of the colors?",
        a: "Yes — order in the editor is order in the array, which matters for indexed consumers like chart series.",
      },
      {
        q: "How is this different from the JSON generator?",
        a: "The JSON generator emits a keyed object for config files; this emits a plain array literal for code that iterates. Same palette, different JavaScript shape.",
      },
      {
        q: "Does it handle alpha or other formats?",
        a: "The output is opaque hex — the array's most portable form. Translucent values can be computed with the opacity tools and pasted into the array by hand.",
      },
      {
        q: "Is the array keyed by name?",
        a: "No. It is a plain ordered list of quoted hex strings; for named, keyed output the color object generator produces the object literal form of the same palette.",
      },
    ],
  },

  "color-object-generator": {
    keywords: [
      "color object generator",
      "javascript color object export",
      "palette as named object",
      "js config colors tool",
    ],
    intro:
      "The color object generator emits a palette as a JavaScript object literal — named keys, quoted values — the palette as named object form configs and components import.",
    content:
      "Arrays carry order; objects carry meaning. The moment a palette's colors have roles — primary, danger, surface, accent — the right JavaScript shape is an object: named keys, quoted values, readable at the point of use as config.primary rather than config[0]. The color object generator produces that shape from an editable palette — build the rows with their names, and the tool emits the object literal, formatted and copy-ready. It is the palette as named object form, exported correctly.\n\nThe editor holds the values, and the naming step happens after the copy: the tool exports a flat object literal whose keys are positional — color1, color2 and so on — while role names such as primary, surface or danger are what you apply to those keys in the file. That keeps the two halves honest: values are edited where they belong, in the rows, and the js config colors output regenerates as values change, with the copy handing over the complete literal ready for a config module, a component's props or a theme stub.\n\nThe object form serves the consumers that read by name: theme configuration objects, component default props, canvas scenes addressing colors by role, test fixtures asserting a named contract. The array generator serves the consumers that iterate; the JSON generator emits the same keyed shape in JSON dialect for config files outside JavaScript proper; and the token exporters go further — typed, grouped, pipeline-ready — when the palette graduates to a design-token system. Between them, the family covers the export spectrum; this tool holds the middle: structured, named, plain JavaScript.\n\nConfiguration files care about names, and that is the difference between an object export and a list. A keyed literal gives every value an address, so a component can ask for surface-raised or text-muted rather than remembering an index, and the palette survives being reordered or extended. It also makes the mapping explicit: the moment values are named, the naming decisions become reviewable, and a name that describes a colour rather than a role stands out as a problem before it reaches a component. That is why a js config colors tool is worth reaching for at the point where a palette stops being a design artefact and starts being a dependency. Keeping the export flat and predictable matters as much as the values, since nested structures and mixed quoting are what make a generated file hard to diff or reuse in a second framework.\n\nThe generated shape also tends to reveal gaps in the palette itself. Writing the object forces the question of what each value is for, and palettes usually turn out to be missing a state, a border or an overlay that had been improvised separately in each component. Two limits keep the tool narrow:\n\n- Keys are positional until you rename them, so the naming work stays in the file rather than in the editor.\n- The output is hex only — no rgb, hsl or alpha — and one flat object with no nesting, types or descriptions.\n\nAs a javascript color object export instrument it is deliberately the naming tool: an editable palette in, a keyed literal out, valid by construction. For palettes whose colors mean things — which is most palettes, once they meet code — this is the shape and this is the export.",
    howTo: [
      { step: "Build the palette rows, naming each color for the role it plays." },
      { step: "Watch the object literal regenerate as names and values change." },
      { step: "Copy the literal into your config, component or test." },
    ],
    whenToUse:
      "Use this when colors are addressed by name in code — configs, props, themes. Use the array generator for ordered lists, the JSON generator for config-file dialects, and the token exporters for pipeline-grade structure. For ordered lists the {{color-array-generator|array generator}} emits the array form of the same palette, the {{color-json-generator|JSON generator}} produces config-file dialect, and the {{design-token-generator|token generator}} goes further with typed, grouped output.",
    faqs: [
      {
        q: "What key naming works best?",
        a: "Role names — primary, surface, danger — read best at the point of use. Avoid positional names like color1; they defeat the object's whole advantage.",
      },
      {
        q: "Can I use this for theme config files?",
        a: "Yes — the literal drops into theme objects and default-prop configs directly; the JSON generator is there when the file must be strict JSON rather than a JavaScript literal.",
      },
      {
        q: "How is this different from the token generator?",
        a: "Tokens add typing and grouping for pipelines; this emits the plain object literal code consumes directly. Same palette, one step less ceremony.",
      },
      {
        q: "Does key order matter?",
        a: "JavaScript objects preserve insertion order for iteration, so the editor's row order is the object's key order — worth keeping intentional.",
      },
      {
        q: "Do the generated keys have role names?",
        a: "No. Keys are positional — color1, color2 and so on — because the tool cannot know what each value is for. Renaming them to primary, surface or danger is a step taken in the file, and that is what keeps the palette readable after a rebrand.",
      },
    ],
  },

  "random-accessible-color-generator": {
    keywords: [
      "random accessible color generator",
      "random color that passes contrast",
      "accessible random palette",
      "wcag safe random colors",
    ],
    intro:
      "The random accessible color generator rolls colors that are random in hue but verified in contrast — every candidate checked against your background until it clears the WCAG bar.",
    content:
      "- Random color generators produce two things: colors and problems — most of what they emit fails contrast against any given background, because vivid randomness ignores legibility.\n- The random accessible color generator inverts the contract: set a background, press the button, and receive colors that are random in hue but verified against your surface — each candidate drawn, measured with the standard contrast formula, rejected if it misses the 4.5:1 bar, retried until the set fills with passes.\n- A random color that passes contrast, by construction rather than luck.\n\nThe verification loop is the tool's entire difference. Unconstrained rolls land most often in the mid-lightness band where failure is guaranteed; this generator keeps drawing until candidates clear the bar, so the accessible random palette it returns is random where randomness delights — the hues — and disciplined where legibility demands it — the contrast. The result is a set you can deploy without a checking pass: every swatch shown renders sample content against your actual background, so the passes are visible as well as counted.\n\nThe natural deployments: playful interfaces that must stay legible — generators, games, educational tools; decorative accents behind or beneath text where contrast obligations apply; and teaching contrast itself, since the tool's output demonstrates that randomness and accessibility are compatible when the right axis carries the randomness. For guaranteed-neutral text on any surface, the friendly picker's ladder is the stronger instrument; for palettes with a planned harmony rather than a random one, the harmony generators apply craft where this applies chance.\n\n- Randomness and accessibility are usually enemies, and the reason is structural: a palette generated in an unconstrained space wanders through the ranges where text stops being readable, and no amount of previewing fixes a value that should never have been proposed.\n- Constraining the generator is what makes the two compatible.\n- If the surface is fixed and the contrast target is given, the search space narrows to values that can actually work on that surface, and randomness then operates where it is genuinely useful — hue, temperature and the character of the accent — rather than where it produces failures.\n- The result behaves like a briefed collaborator instead of a slot machine: every roll is admissible, so the choosing is aesthetic rather than remedial.\n- It is a good first stop when a design needs a colour from nothing, because whatever comes out is already usable.\n\nThat also changes how the output is used: with a floor under the quality, the rarer wins are the interesting ones and there is less need to keep rolling in the hope of a legal result. Keeping the contrast reading alongside each generated value is worth the extra line, since it is the first thing a later reviewer will want to verify.\n\nAs an accessible random palette instrument it makes one promise and keeps it mechanically: wcag safe random colors against the background you set, random in the dimensions where randomness is fun, verified in the dimension where failure costs users.\n\nKeeping the surface value with the generated set matters too, since a palette that passes on white can fail completely on the tinted panel it later moves onto.",
    howTo: [
      { step: "Set the background the colors must work against." },
      { step: "Press generate — the tool draws and verifies until five candidates clear 4.5:1." },
      { step: "Copy the verified set; every swatch is pre-checked for your surface." },
    ],
    whenToUse:
      "Use this when playfulness and legibility must coexist — games, generators, decorative accents. Use the friendly picker for guaranteed neutral text, the harmony generators for planned palettes, and the contrast checker to verify any pair this tool did not draw. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "What threshold do the colors pass?",
        a: "4.5:1 against your chosen background — the WCAG AA bar for normal text — verified per candidate before it enters the set.",
      },
      {
        q: "Are the hues coordinated between the five colors?",
        a: "No — hue is genuinely random; only contrast is verified. Coordination is the harmony generators' department.",
      },
      {
        q: "Why does generation sometimes take a moment?",
        a: "The tool rejects candidates that miss the bar and redraws — against a mid-lightness background, most random draws fail, so several rounds of verification are normal.",
      },
      {
        q: "Can I use the colors as text on the background?",
        a: "Yes — that is the bar they passed. For large text the 3:1 bar applies and any of these passes it too; verify any other pairing with the contrast checker.",
      },
      {
        q: "What does the random accessible color generator not do?",
        a: "Constraining the generator is what makes the two compatible. If the surface is fixed and the contrast target is given, the search space narrows to values that can actually work on that surface, and randomness then operates where it is genuinely useful — hue, temperature and the character of the accent — rather than whe",
      },
    ],
  },

  "daily-color-generator": {
    keywords: [
      "daily color generator",
      "color of the day",
      "date-based color",
      "fresh color every day tool",
    ],
    intro:
      "The daily color generator derives one color from today's date — the color of the day, identical for everyone, new again tomorrow.",
    content:
      "One color per day, chosen by the calendar: the daily color generator hashes the date into a hue and renders the result as a full-size swatch with its hex. Today's color is today's color — the same on every screen, in every time zone that still shares the date — and tomorrow it is replaced by one nobody has met. The palette of the day's single-color sibling, with the same determinism and the same refusal to take requests.\n\nThe mechanism is the point: the date is the seed, the seed is the color, and no button exists to reroll it. That determinism is what makes the social layer work — a team can wear today's color in a stand-up theme, a community can generate art against the shared daily value, a personal practice can treat the color as a constraint for a sketch. None of it functions with a random roller, whose privacy and unrepeatable presses are exactly wrong for shared prompts. A date-based color is a tiny daily ritual with the agreement built in.\n\nThe color itself derives in a coherent register — the same derivation care the palette version applies — so the daily result is usable, not just novel: seed a design exercise, pick an accent for a one-day page, name a mood. Keepers go to the favorites picker before midnight; the daily palette generator extends the ritual to five-color sets; the color of the day browser surveys the named-color tradition the ritual nods toward.\n\n- A daily colour has a property that a generator does not: it is the same for everyone.\n- That shared constraint is what turns a random prompt into something conversational, because two people working from the same value can compare results without agreeing on a seed, and a week of values reads as a series with an internal logic nobody designed.\n- For a practice that depends on repetition, removing the choice is the whole mechanism: there is nothing to tune, so the time goes into the making rather than the picking.\n- Treat the result as a constraint rather than a palette — one component, one thumbnail, one illustration coloured from it is enough — and pin the values that turn out to be usable before the day rolls over, since the archive of interesting days is the part that survives.\n- A fresh color every day tool also works well as a variable inside longer projects, where a small daily accent keeps the practice alive without derailing the main job.\n\nOver a month the collection is more interesting than any single day, and the calendar is the only schedule, which is exactly what makes it repeatable.\n\nWhat the tool will never do is negotiate. The fresh color every day arrives on the calendar's schedule, identical for everyone sharing the date — which is, as with its palette sibling, the entire point: a constraint you did not choose, a result everyone shares, and a small daily surprise that costs nothing but attention.",
    howTo: [
      { step: "Open the tool — today's color derives automatically from the date." },
      { step: "Share it: everyone on the same date sees the same color." },
      { step: "Use it as a prompt, accent or constraint — and copy the hex before midnight." },
    ],
    whenToUse:
      "Use this for shared daily prompts and one-color constraints. Use the daily palette generator for five-color sets, the random color tool for on-demand rolls, and the favorites picker to keep the values worth keeping. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Is the color the same for everyone?",
        a: "Yes — the date seeds the derivation deterministically, so everyone sharing the date sees the same color, regardless of device.",
      },
      {
        q: "Can I reroll or request a different color?",
        a: "No — the date is the seed and the tool takes no requests. The random generator is the tool for unlimited private rolls.",
      },
      {
        q: "When does the color change?",
        a: "At your browser's local midnight, since the seed is the date your device reports.",
      },
      {
        q: "Can I see yesterday's color?",
        a: "Not in the tool — the daily value is not archived. Copy it out before the rollover if it matters.",
      },
      {
        q: "What does the daily color generator not do?",
        a: "That shared constraint is what turns a random prompt into something conversational, because two people working from the same value can compare results without agreeing on a seed, and a week of values reads as a series with an internal logic nobody designed. For a practice that depends on repetition, removing the choice",
      },
    ],
  },

  "rgb-cube-visualizer": {
    keywords: [
      "rgb cube visualizer",
      "rgb color space 3d",
      "visualize rgb cube",
      "rgb volume explorer",
    ],
    intro:
      "The RGB cube visualizer renders the RGB color space as the cube it is — axes for red, green and blue, colors living at the corners and between — as an interactive way to see where a color sits.",
    content:
      "- RGB is a cube.\n- Every color the model can express is a point inside a unit cube whose axes are the three channel intensities — black at the origin, white at the far corner, the primaries and their secondaries occupying the other corners, and the vast muted population filling the space between.\n- The RGB cube visualizer renders that geometry: an interactive rgb color space 3d view where the cube can be turned, its corners and interior sampled, and any picked point identified as a color with its coordinates.\n\nSeeing the cube does for color intuition what seeing a map does for geography. The greys run diagonally from black to white — the line every desaturation walks. The primaries own three edges; the secondaries own the opposite three; complementary pairs sit at opposite ends of body diagonals. Uniform random RGB sampling, which the random tools perform, is throwing darts at this volume — which is why they land so often in the greyish middle: the middle is most of the cube. These are facts every color worker eventually internalizes; the visualize rgb cube view installs them visually, in one rotatable object.\n\nThe interactive part earns its keep in exploration: rotate to a corner and watch a family of related colors cluster; sample along the black-white diagonal and watch chroma drain; find your brand color's neighborhood and see what sits beside it in RGB space — which is not, the OKLCH tools will show, where perceptual neighbors live. That contrast is the deeper lesson: the cube is the machine's truth, and the wheel is the eye's; knowing both, and when each lies, is the beginning of color competence.\n\nRGB is a coordinate system before it is a notation, and the cube is where that becomes visible: three axes, each running the full range of one channel, every possible colour a point inside them. Two properties are worth learning from the geometry rather than from a diagram. The greys form a diagonal from black to white, so any move along it is a lightness change while any move away from it is a chroma change — the fastest way to understand why tinting and shading are different operations. And the space is not perceptually uniform, which shows up as the crowded region near white and the sparse region near the saturated primaries: equal distances in RGB do not correspond to equal differences in appearance, and the cube makes that unevenness obvious in a way a flat wheel cannot. Navigating it also builds an intuition for what a hex value means, since the three pairs of digits are the three axes and a typo moves the point rather than producing a value that is merely unattractive.\n\nPutting a favourite colour into the space is the exercise worth doing once, because seeing where it sits relative to its neighbours explains more about it than any label.\n\nAs an rgb volume explorer it is deliberately the raw geometry — no harmonies, no conversions, just the space itself, navigable. For the perceptual alternative, the OKLCH playground renders the uniform view of the same colors; for the wheel convention, the interactive color wheel spins the flat classic. The cube is where RGB actually lives — worth visiting at least once, preferably with your favorite color in hand.",
    howTo: [
      { step: "Rotate the cube to inspect its corners — primaries, secondaries, black and white." },
      { step: "Sample points on the surface or inside to identify colors and their coordinates." },
      { step: "Trace the black-white diagonal and the body diagonals to see greys and complements geometrically." },
    ],
    whenToUse:
      "Use this to build or refresh RGB-space intuition — where colors live, why random rolls go grey, what sits near what. Use the OKLCH playground for the perceptual view of the same space, and the color wheel for the artist's flat model. For the neighbouring steps, see the {{flag-color-extractor|flag color extractor}} and the {{brand-color-library|brand color library}}.",
    faqs: [
      {
        q: "Why does the cube look muted in the middle?",
        a: "Because it is: most of RGB's volume is desaturated. Uniform channel sampling lands in the middle far more often than at the vivid corners — the geometry explains the statistics.",
      },
      {
        q: "Where do complementary pairs sit in the cube?",
        a: "At opposite ends of body diagonals through the cube's center — which is also why RGB-space complement rotation can look wrong to the eye; perception does not live in this geometry.",
      },
      {
        q: "Is this the same as the HSL cylinder?",
        a: "They are different projections of the same colors — the cube is the channel-space truth; HSL reshapes it into a cylinder. Neither matches perception; OKLCH is the space that tries.",
      },
      {
        q: "Can I find my brand color's neighbors here?",
        a: "Yes — sample its position and inspect the region. Just remember RGB-adjacent is not perceptually adjacent; check neighbors in OKLCH too.",
      },
      {
        q: "Where does the rgb cube visualizer stop short?",
        a: "As an rgb volume explorer it is deliberately the raw geometry — no harmonies, no conversions, just the space itself, navigable. For the perceptual alternative, the OKLCH playground renders the uniform view of the same colors; for the wheel convention, the interactive color wheel spins the flat classic. The cube is wher",
      },
    ],
  },

  "color-wheel-theory-guide": {
    keywords: [
      "color wheel theory guide",
      "learn the color wheel",
      "color wheel lesson",
      "interactive color theory tutorial",
    ],
    intro:
      "The color wheel theory guide teaches the wheel by building it — primaries, secondaries and tertiaries placed and explained, with the classic relationships one interaction away.",
    content:
      "- The color wheel is color theory's first artifact and its most misunderstood: everyone has seen it, few can say why red sits opposite green or why a triad balances.\n- The color wheel theory guide builds the wheel instead of asserting it — the primaries first, then the secondaries they mix into, then the tertiaries filling the gaps — each placement explained as it lands, so the wheel's geometry becomes consequences rather than trivia.\n\nThe build-up matters because each layer encodes a mixing fact. Three primaries because the eye's cones triangulate color from three signals; three secondaries because each pair of primaries mixes to one; six tertiaries because each primary neighbours two secondaries and the in-between hues are the palette's connective tissue. Once the twelve are placed, the relationships stop being arbitrary rules: complements are the hues that mix to neutral, analogous neighbors are the ones that share a primary, and a triad is the arrangement where no hue shares — the geometry is the theory, and the guide makes the derivation visible.\n\nThe interactive layer turns the lesson into experimentation: pick any hue as the anchor and watch its relationships highlight — its complement, its neighbours, its triangle — so the abstract rules become habits of seeing. That habit is the actual deliverable, because the wheel's relationships are the vocabulary every harmony generator speaks: the complementary, triadic and analogous tools execute what this guide teaches, and knowing why the schemes sit where they sit is the difference between using them and merely clicking them.\n\n- Most people meet the colour wheel as a craft object and never learn what it models, which is why the vocabulary of colour theory stays opaque long after the wheel itself becomes familiar.\n- Treating the guide as an interactive color theory tutorial closes that gap by letting each relationship be tried rather than described: move the base hue and watch the triangle, the square and the complementary pair rotate with it, and the geometry stops being a diagram and becomes a consequence.\n- It is also the honest way to learn the wheel's limits, since the classic construction is a hue circle — useful for relationships, silent about lightness, saturation and perception.\n- Knowing where the model ends is what stops a designer forcing an answer out of it, and it makes the perceptual tools that come later read as refinements rather than as contradictions.\n\nOne relationship per sitting is usually enough, since the aim is to recognise the geometry on sight rather than to memorise six names. Once the triangle is familiar, the palette generators built on it become legible rather than magical, and the wheel turns into a tool rather than a diagram.\n\nAs a learn the color wheel resource it is deliberately the lesson, not the lookup — the reference tool handles quick consultations; the interactive wheel offers deeper play; and this guide carries the one task neither can: making a color wheel lesson land as understanding rather than decoration, for anyone who has ever wondered why the wheel looks the way it does.",
    howTo: [
      { step: "Follow the build: primaries, then secondaries, then tertiaries — read why each lands where it does." },
      { step: "Pick hues on the finished wheel and watch their relationships highlight." },
      { step: "Take a relationship to the harmony generators and watch the same geometry produce values." },
    ],
    whenToUse:
      "Use this to learn or teach why the wheel works. Use the reference tool for mid-project lookups, the interactive wheel for free exploration, and the harmony generators to execute the relationships the guide explains. For the neighbouring steps, see the {{bezold-effect-visualizer|bezold effect visualizer}} and the {{color-afterimage-tool|color afterimage tool}}.",
    faqs: [
      {
        q: "Why does it use red-yellow-blue primaries?",
        a: "The traditional artist's wheel is the RYB model — the shared vocabulary of art teaching and most harmony tools. Screen-light primaries (RGB) shuffle the geometry; the relationships carry over with renamed anchors.",
      },
      {
        q: "Why is red opposite green and not cyan?",
        a: "In the RYB wheel, green is red's mix-opposite — the pair that neutralises each other in pigment. Screen RGB says cyan; the artist's wheel says green. Both are 'right' in their own model.",
      },
      {
        q: "Is this enough to design with color?",
        a: "It is the vocabulary — schemes, temperature, relationships. The rest is practice with tools that speak it: the harmony generators, the contrast checkers, and your eye.",
      },
      {
        q: "What should I learn after the wheel?",
        a: "Perceptual spaces — the OKLCH playground is the natural next step — because the wheel's even steps are not perceptually even, and modern tools can do better.",
      },
      {
        q: "What does the color wheel theory guide not do?",
        a: "Treating the guide as an interactive color theory tutorial closes that gap by letting each relationship be tried rather than described: move the base hue and watch the triangle, the square and the complementary pair rotate with it, and the geometry stops being a diagram and becomes a consequence. It is also the honest ",
      },
    ],
  },

  "bezold-effect-visualizer": {
    keywords: [
      "bezold effect visualizer",
      "bezold spreading effect",
      "color depends on neighbors demo",
      "simultaneous color shift demo",
    ],
    intro:
      "The Bezold effect visualizer demonstrates how one color changes appearance depending on its neighbors — the spreading effect, rendered as a live two-background comparison.",
    content:
      "Wilhelm von Bezold noticed it in rugs: change one thread color and the whole carpet's character shifts, because each color spreads its influence into its neighbours. The Bezold effect visualizer renders the demonstration in its cleanest form: one color, two contexts — the same swatch centered on black and on white — and the two renders side-by-side. The color is identical in both panels by pixel value; the appearance is not, and the difference is entirely in your visual system.\n\nWhat the demo shows is the spreading effect's mechanism: light backgrounds bleed brightness into the color, dark backgrounds pull it darker, and the same hex acquires two personalities. This is why a mid-tone that sparkles on white sulks on black; why UI palettes need re-tuning, not copying, when a dark mode ships; why print proofs are judged against the substrate they will live on. The color depends on neighbors demo makes the dependency undeniable — not as theory but as two panels your own eyes cannot reconcile.\n\nThe design consequences are the tool's payload. Context is part of every color decision: a palette chosen on a white artboard is a hypothesis, not a fact, until it meets its real background. Adjacent colors interact whether invited or not — the same mechanism that makes Bezold's rugs shift makes a gray button look lighter beside black than beside white. The simultaneous contrast visualizer scales the demonstration to the interface question; the color context explorer arranges one color against many surfaces at once; and this visualizer keeps the minimum pair — the cleanest possible statement of the effect.\n\nThe demonstration is worth doing once properly, because the effect is stronger than most people expect from a diagram. Two identical swatches, placed on different backgrounds, genuinely appear to be different colours, and the effect persists after you know it is happening, which is what makes it a fact about perception rather than a trick. The design consequences are concrete. A neutral placed on a warm surface takes on the surface's temperature and stops reading as neutral. A brand colour specified on white looks like a different colour on the tinted card it ends up on. And two states that are distinguishable in the palette can become indistinguishable in a component, because each is carrying the tint of its own surroundings. That is why context matters more than swatch review, and why a simultaneous color shift demo is worth running on a real screen before a palette is signed off.\n\nThe classic variant of the effect — a thin line appearing to change colour as it crosses contrasting ground — is worth seeing too, since it explains a whole class of illustration and outline quirks. Where the shift cannot be removed, separating the pair with a border is the practical response.\n\nAs a bezold spreading effect instrument it is deliberately the two-panel demo: identical values, different neighbors, different appearances. The lesson costs one look and pays for itself every time a palette changes context — which is to say, every time a design ships.",
    howTo: [
      { step: "Set the test color in the field." },
      { step: "Compare the two panels — the same swatch on black and on white." },
      { step: "Accept the verdict: the color's appearance is a property of its context, and plan palettes accordingly." },
    ],
    whenToUse:
      "Use this to demonstrate or verify context dependence with the minimum pair. Use the simultaneous contrast visualizer for interface-scale demos, the color context explorer for many backgrounds at once, and the dark-mode generator when the lesson sends you re-tuning a palette. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{color-afterimage-tool|color afterimage tool}}.",
    faqs: [
      {
        q: "Are the two swatches really the same color?",
        a: "Yes — identical pixel values. Every difference you see is your visual system spreading the neighbors' influence into the target, which is the effect.",
      },
      {
        q: "How does this differ from simultaneous contrast?",
        a: "They are siblings — simultaneous contrast is the general framing of context-dependent appearance; the Bezold effect is the spreading version, classically demonstrated with patterns and neighbors.",
      },
      {
        q: "What is the practical takeaway for dark mode?",
        a: "Colors must be re-tuned, not copied: the same values acquire different weight on dark surfaces. The dark-mode palette generator exists for exactly that re-tuning.",
      },
      {
        q: "Why does my design look different on my client's screen?",
        a: "Contexts differ — surrounding UI, window chrome, adjacent panels. The effect you are seeing between these panels happens between every element and its neighbors in production.",
      },
      {
        q: "Where does the bezold effect visualizer stop short?",
        a: "As a bezold spreading effect instrument it is deliberately the two-panel demo: identical values, different neighbors, different appearances. The lesson costs one look and pays for itself every time a palette changes context — which is to say, every time a design ships.",
      },
    ],
  },

  "just-noticeable-difference-calculator": {
    keywords: [
      "just noticeable difference calculator",
      "jnd color difference",
      "smallest visible color change",
      "color delta threshold tool",
    ],
    intro:
      "The just noticeable difference calculator measures two colors' distance in perceptual terms — the color delta threshold read that says whether a change is visible or imaginary.",
    content:
      "Somewhere between identical and obviously different lies the boundary the just noticeable difference calculator maps: the JND — the smallest change a typical observer can detect. The tool takes two colors, computes their separation in perceptual space, and reports the distance in terms that mean something to the eye — so the question is this change visible? stops being a matter of squinting and becomes a measurement.\n\nThe perceptual framing is what separates this from raw channel arithmetic. RGB distance measures machine coordinates; a JND measures how far apart the colors look, which requires a space built to match appearance — the same perceptual reasoning that powers the OKLCH tools here. The two-color comparison reports both readings, and the disagreement between them is the lesson: pairs that score far apart in RGB can sit within a JND perceptually (invisible change), and modest RGB shifts can cross the threshold where the eye is sensitive (obvious change). The number that predicts what a person notices is the perceptual one.\n\n- The tool's home turf is the changes-too-small-to-eyeball territory: did the export pipeline shift this brand color? did the compression move this gradient stop? is this token change a real change or a rounding artifact?\n- In each case the delta is real in the machine but possibly imaginary to a human — and the color delta threshold read settles which.\n- The color comparison tool frames the same measurement as a general comparison; this one asks the narrower, sharper question — the smallest visible color change boundary — and answers it for a specific pair.\n\nDifference measurement exists because the eye is a poor judge of small changes. Two values viewed in sequence are easy to compare; the same two viewed minutes apart, on different surfaces, or by different people are not, and the error grows exactly in the range where the decision matters — the hover state that must be visible, the disabled state that must be distinguishable, the border that must not appear. A color delta threshold tool turns those questions into a number computed in a perceptually uniform space, so the answer is stable and repeatable and can be attached to a review comment instead of an opinion. The threshold is the useful part: below it the pair reads as one colour, above it as two, and where a pair sits matters more than how far apart the two values look in a picker's coordinates.\n\nIn practice the number is used as a floor rather than a target: pick the value you like, then check that its distance from its neighbour clears the threshold for the job. That habit removes most of the mystery from apparently identical states and makes the difference between a deliberate step and an accidental one visible.\n\nWhat the tool will not do is certify invisibility universally: JNDs vary with age, display and adaptation. But as a jnd color difference reference for the changes that must be judged — visible or not — it replaces the squint with a number, and the number is computed in the space where the eye actually lives.",
    howTo: [
      { step: "Set color A — the original or reference value." },
      { step: "Set color B — the changed value under test." },
      { step: "Read the perceptual distance and judge whether the change crosses the visible threshold." },
    ],
    whenToUse:
      "Use this for pipeline shifts, compression checks and token diffs where the change may be sub-visible. Use the color comparison tool for general two-color measurement, the pixel color picker to obtain the values, and the CVD simulators when the visibility question involves color vision differences. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "What size change counts as a JND?",
        a: "It depends on the colors and the viewing conditions, but in perceptual-space terms, changes below a small fraction of the space's typical scale are generally invisible — the tool's reading lets you compare against that order of magnitude.",
      },
      {
        q: "Why not just measure RGB distance?",
        a: "Because the eye does not live in RGB: equal RGB steps are unequal to vision. The perceptual reading predicts what a person notices; the RGB reading predicts what a machine stored.",
      },
      {
        q: "My pipeline shifted a color — the JND says invisible. Do I care?",
        a: "Probably not visually — but consistency audits may still care that the value changed. The tool tells you users will not see it; the rest is policy.",
      },
      {
        q: "Does the JND differ for color-blind viewers?",
        a: "Yes — thresholds shift under CVD, which is why the simulators exist. This tool answers for typical trichromatic vision.",
      },
      {
        q: "What does the just noticeable difference calculator not do?",
        a: "In each case the delta is real in the machine but possibly imaginary to a human — and the color delta threshold read settles which. The color comparison tool frames the same measurement as a general comparison; this one asks the narrower, sharper question — the smallest visible color change boundary — and answers it fo",
      },
    ],
  },

  "color-rendering-index-reference": {
    keywords: [
      "color rendering index reference",
      "cri lighting scale explained",
      "cri 80 vs 90 difference",
      "light quality color reference",
    ],
    intro:
      "The color rendering index reference explains the CRI scale — how lighting scores from CRI 50 to 100 change the way colors appear under them, and which scores suit which rooms.",
    content:
      "- A paint chip that looks perfect in the store can look dead at home, and the culprit is usually the light: the color rendering index measures how faithfully a light source reveals color, and the difference between a CRI 70 bulb and a CRI 95 one is the difference between colors surviving and colors surrendering.\n- The color rendering index reference lays the scale out — what CRI means, how the bands from 50 to 100 behave, and which score a given room deserves.\n\nThe scale's logic is worth internalizing once. CRI 100 is defined as daylight-like fidelity — colors render as they would under reference light. The 80s are the mainstream: fine for corridors and storage, where cost beats fidelity, but where skin tones dull and reds brown. The 90s are where design lives: kitchens, bathrooms, studios and retail — anywhere food looks appetizing, complexions look alive and materials read true. Below 80, colors mute progressively; the low band belongs to warehouses and streetlights, where efficiency is the only brief. The cri 80 vs 90 difference, in practice, is the difference between acceptable and deliberate — the band where lighting starts serving design instead of merely illuminating.\n\n- The reference earns its keep at the decision point: choosing bulbs for a renovation, diagnosing why a room's palette feels wrong, specifying lighting for a studio or a shop.\n- Pair it with the color temperature side of the same decisions — the temperature analyzer handles a color's warmth, and lighting temperature (Kelvin) is the sibling question that CRI does not answer: a light can be warm and faithful, or warm and terrible.\n- Both coordinates matter; this reference owns the fidelity one.\n\nCRI answers a question that is easy to ask and hard to settle without numbers: how faithfully does a light source render what it illuminates. The scale runs to one hundred, where a perfect source would reproduce a standard reference, and the practical consequence of a low score is a scene whose colours look plausible individually but wrong together — a red that turns brown, a fabric that reads flat, a white that shifts. Two cautions come with the number. A high score does not guarantee a pleasing light, since the measure says nothing about tint or temperature, and a fixture can score well overall while performing poorly in the specific reds that matter for skin and food. Nor is the scale the whole story for modern LED sources, where the shape of the spectrum matters as much as its closeness to the reference.\n\nFor design work the takeaway is narrow and useful: if a colour has to survive a physical environment, specify it under the light it will actually be seen in rather than in neutral daylight, because the reference conditions are rarely what the room provides. Where a product will be photographed, that test is worth doing before the palette is locked.\n\nAs a cri lighting scale explained resource it is deliberately prose-plus-scale: the light quality color reference that turns a bulb-box number into a design decision — and explains, finally, why the store looked better than the kitchen.",
    howTo: [
      { step: "Read the scale bands — what 50s, 80s and 90s actually render." },
      { step: "Match the band to the room: fidelity where color matters, efficiency where it does not." },
      { step: "Pair with the Kelvin question — temperature and rendering are separate light choices." },
    ],
    whenToUse:
      "Use this when choosing or diagnosing lighting for color-critical rooms. Use the color temperature analyzer for a color's own warmth, the temperature adjuster to act on it, and the swatch tools to test palettes under the light you settle on. For the neighbouring steps, see the {{color-psychology-reference|color psychology reference}} and the {{color-wheel-theory-guide|color wheel theory guide}}.",
    faqs: [
      {
        q: "Is CRI 90 really worth the premium?",
        a: "Where color matters — kitchens, bathrooms, studios, retail — yes: the 90s render skin, food and materials recognisably, while the 80s merely get by. Corridors and storage can happily stay in the 80s.",
      },
      {
        q: "Does CRI relate to warm or cool light?",
        a: "No — CRI measures fidelity, temperature measures warmth. A warm 2700K bulb can be high-CRI and faithful, or warm and miserable; the two coordinates are independent.",
      },
      {
        q: "Why did my room's colors look flat until I changed bulbs?",
        a: "Almost certainly low CRI — colors render muted under unfaithful light, no matter how good the palette is. The reference's band table maps the symptom to the score.",
      },
      {
        q: "Is CRI the only fidelity metric?",
        a: "It is the common one, with known blind spots — especially in deep reds. Newer metrics refine it, but the 80s-versus-90s decision the reference supports is where CRI remains the practical guide.",
      },
      {
        q: "What does the color rendering index reference not do?",
        a: "Pair it with the color temperature side of the same decisions — the temperature analyzer handles a color's warmth, and lighting temperature (Kelvin) is the sibling question that CRI does not answer: a light can be warm and faithful, or warm and terrible. Both coordinates matter; this reference owns the fidelity one.",
      },
    ],
  },

  "munsell-color-system-reference": {
    keywords: [
      "munsell color system reference",
      "munsell hue value chroma",
      "munsell notation explained",
      "munsell color chart tool",
    ],
    intro:
      "The Munsell color system reference browses the century-old notation that organized color by hue, value and chroma — the munsell notation explained as a browsable chart.",
    content:
      "- Before OKLCH, before HSL, Albert Munsell built the color order that got it right: three independent axes — hue, value (lightness), chroma (saturation) — each numbered, each scale even, each color addressed like a coordinate.\n- The Munsell color system reference presents that structure as a browsable chart: hue families as columns, value steps as rows, and the munsell notation explained alongside — the 5R 4/14-style addresses that soil scientists, art conservators and the USDA still use daily.\n\nThe system's claim to fame is being first and being right. Its value scale is perceptually even; its chroma scale stretches as far as each hue can reach rather than pretending all hues saturate equally; and its notation is absolute — a Munsell address names a color the way coordinates name a place, which is why industries that must communicate color without samples (soil science, brewing, dentistry, conservation) adopted it and never left. Browsing the chart shows the design decisions modern spaces inherited: the separation of lightness from colorfulness that HSL blurs and OKLCH restores, the uneven-reach chroma that flat scales misrepresent.\n\nThe reference serves two audiences. The practical one needs the addresses: matching a conservation spec, decoding a soil survey, or translating a legacy document's Munsell notations into hex — the browsable families put the addresses next to their colors. The educational one needs the ideas: Munsell is where the hue-value-chroma decomposition — the spine of every modern perceptual space — was first done properly, and seeing the original arrangement makes the modern tools' design decisions look like the continuations they are.\n\nMunsell is worth the effort because it answers a question the other systems only gesture at: what a colour is made of. Three coordinates, each with a defined origin and a defined step — hue as a numbered wheel, value as a lightness ladder from black to white, chroma as distance from the neutral axis — and the notation reads as a set of measured properties rather than a position on a chart. That is why the system survives in soil science, dentistry, brewing and anywhere a colour has to be recorded unambiguously for somebody else to read. It is also the clearest existing argument that colour is three-dimensional: working through one family in the notation makes it obvious that a palette can step in value and chroma as well as hue, which is the insight most colour anxiety comes from missing. The modern perceptual spaces owe the structure a debt, which makes the reference useful history as well as practice.\n\nCopying a handful of values into a project is the fastest way to feel the difference between a measured colour and a picked one.\n\nAs a munsell hue value chroma browser it is deliberately the historical system in working form — a munsell color chart tool that explains the notation and shows the space, honoring the hundred-year-old answer to the question every color order system asks: how should color be organized?\n\nFollowing one chroma step across several hues is the exercise that repays the visit, because it shows how unevenly the space is distributed and why a hue-by-hue ramp lifted from a picker rarely looks balanced.",
    howTo: [
      { step: "Browse the hue families; each column is a hue, each row a value step." },
      { step: "Read the notation — hue value/chroma — and how it addresses each swatch." },
      { step: "Note the chroma reach differing by hue — the system's honest answer to saturation's unevenness." },
    ],
    whenToUse:
      "Use this to decode Munsell notations or study the ancestor of modern color spaces. Use the OKLCH playground for the modern perceptual successor, the named colors reference for CSS's flat list, and the Pantone and RAL references for the print-industrial order systems. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "What do the numbers in a Munsell notation mean?",
        a: "Hue value/chroma — for example 5R 4/14: the hue family and its position within it, the lightness step, and the saturation strength. The address is absolute and needs no sample to communicate.",
      },
      {
        q: "Why does chroma reach differ between hues?",
        a: "Because it does in reality — yellows can reach far higher chroma than blues at equal value. Munsell's honest, per-hue chroma scales are one of the system's innovations.",
      },
      {
        q: "Who still uses Munsell?",
        a: "Soil science, brewing, dentistry, art conservation and government standards — anywhere color must be specified without a screen or a shared sample book.",
      },
      {
        q: "How does it relate to OKLCH?",
        a: "Directly — Munsell established the hue-value-chroma decomposition and perceptual evenness that OKLCH implements computationally. The reference is the paper ancestor; the playground is the digital heir.",
      },
      {
        q: "Where does the munsell color system reference stop short?",
        a: "Following one chroma step across several hues is the exercise that repays the visit, because it shows how unevenly the space is distributed and why a hue-by-hue ramp lifted from a picker rarely looks balanced.",
      },
    ],
  },

  "natural-color-system-reference": {
    keywords: [
      "natural color system reference",
      "ncs color notation",
      "ncs color chart explained",
      "scandinavian color standard tool",
    ],
    intro:
      "The Natural Color System reference explains and browses the NCS notation — the Scandinavian standard that describes colors by their resemblance to six elementary colors.",
    content:
      "- The Natural Color System takes a different door into color order than Munsell's three axes: every color, it proposes, can be described by how much it resembles six elementary colors — white, black, yellow, red, blue and green — the pure percepts that human vision treats as irreducible.\n- The Natural Color System reference explains that logic and browses the resulting notation: NCS addresses like S 2050-Y10R read as percentages of blackness and chromaticness plus a hue position between two elementaries, and the ncs color notation becomes decodable rather than cryptic.\n\nThe system's signature is its perceptual honesty about hue. Rather than numbering hues around a wheel, NCS positions each color between its two nearest elementary hues — Y10R is a yellow sitting a step toward red — which matches how people actually describe color: orange is yellow-some-red, teal is green-some-blue. The blackness and chromaticness percentages front-load the two judgments that matter most in Scandinavian architecture and design, where the system is the national standard: how dark, how colorful, which way the hue leans. The ncs color chart explained here shows how those three judgments generate the whole space.\n\nThe reference serves the European workflow — NCS is the color language of Scandinavian and broader European construction, interiors and public signage — where specs arrive in NCS and need translation to hex for screens, or vice versa. It also serves the comparative education: set beside Munsell's three-axis order, NCS's resemblance model shows there is more than one right way to organize color, and the differences are philosophical, not just notational. The Pantone and RAL references cover the print-industrial and industrial-German siblings.\n\nNCS is built on a different premise from most colour systems: instead of starting from a geometric model, it starts from what the eye reports. Six elementary perceptions — white, black, yellow, red, blue, green — with every other colour described as a mixture of them, and the notation recording the proportions as percentages, so a value states how much it resembles white, how much black, and where its chromatic content falls between the two hue pairs. The consequence is a system that predicts appearance rather than position, and designers often find it states problems more directly than coordinates do: two colours that ought to look equally far from a base are easier to check when the notation says so. It is also the working standard across Scandinavian and much of European industry, which makes it the natural reference wherever those specifications are in play, and makes a scandinavian color standard tool worth having open next to a print brief.\n\nReading a handful of familiar colours in the notation is the quickest way to see how differently it thinks about the same space.\n\nAs an ncs color chart explained resource it is the Scandinavian standard in browsable form — the system that asks, of every color, the disarmingly human question: how much white, how much black, which elementary hues, and in what proportion?\n\nComparing it with Munsell, which answers the same question geometrically rather than perceptually, is the shortest route to understanding what each system is actually for.",
    howTo: [
      { step: "Read the notation anatomy — blackness, chromaticness, and the hue between two elementaries." },
      { step: "Browse the families and match addresses to swatches." },
      { step: "Translate spec values to hex for screen work, or hex toward NCS for European specs." },
    ],
    whenToUse:
      "Use this to decode NCS specifications or study its resemblance model. Use the Munsell reference for the three-axis ancestor, the RAL reference for industrial German colors, and the converters for the screen-side translations. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "How do I read an NCS code like S 2050-Y10R?",
        a: "S prefixes the standard edition; 20 is blackness (20%), 50 is chromaticness (50%), and Y10R is the hue — yellow with a 10% step toward red. The three numbers describe the color completely.",
      },
      {
        q: "Why does NCS position hues between elementary colors?",
        a: "Because that is how vision and language work — orange is understood as yellow-toward-red. The resemblance model matches description, not mixing physics.",
      },
      {
        q: "Where is NCS the standard?",
        a: "Across Scandinavia and much of Europe for architecture, construction and public signage — the specification language those industries write in.",
      },
      {
        q: "Can NCS colors be shown exactly on screen?",
        a: "Approximately — like all physical standards, NCS swatches exceed screen gamut in places. The reference's hex values are faithful screen representations, not calibrations.",
      },
      {
        q: "Where does the natural color system reference stop short?",
        a: "Comparing it with Munsell, which answers the same question geometrically rather than perceptually, is the shortest route to understanding what each system is actually for.",
      },
    ],
  },

  "pantone-to-hex-reference": {
    keywords: [
      "pantone to hex",
      "pantone hex conversion",
      "licensed color data",
      "pantone codes",
    ],
    intro:
      "The Pantone to HEX reference explains the conversion honestly: a Pantone code identifies ink, a hex value identifies screen light, and this page holds no licensed Pantone table to bridge them.",
    content:
      "Asking for pantone to hex is really two questions in one, and separating them explains everything about this page. The first is a data question: what measured sRGB value corresponds to a given Pantone reference? The second is a tool question: what can a page with no licensed dataset actually do? The answer to the first lives in licensed colour libraries and physical swatch books. The answer to the second is what this page offers — a nearest-name lookup that describes a picked colour using the CSS table, with the distance between the two reported so the approximation is not mistaken for data.\n\n- The page returns a CSS name, its hex value and an RGB distance; it does not return Pantone codes.\n- The licensed color data behind a real Pantone-to-hex conversion is not part of this build.\n- The lookup searches the 141 named CSS values exhaustively, so the returned name is the closest of those rather than a guess.\n\nHere is why the licensed data is not optional. Pantone references come in families — Coated and Uncoated stock behave differently, and the textile codes use a different paper — so a bare code does not fully specify an ink. Even with a library, the value you get describes a standard substrate, not your substrate; printed on uncoated card, the same reference reads differently. Anyone who has compared a screen mock against a proof knows the gap this leaves, and it cannot be closed by arithmetic in a browser tab.\n\nThe practical way to work with that gap is to keep a house table. When someone measures the printed or manufactured sample, the measured values belong in one reviewable place rather than in several people's notes: import them as a palette, name the roles, and let the survey work be checkable. Then, when a new job starts, the measured values are already there and the question is only which of them applies.\n\nSo use this page as a decoder for description, not for production. A CSS name and a distance figure are a perfectly good way to say which direction a colour leans. They are not a colour match. Where the exact numbers matter, a licensed reference, a measurement or a swatch under the lighting the job will be judged in is what settles it, and the tools here are happy to hold the results once you have them. A workable routine for a pantone hex conversion starts with the material rather than the screen: settle the substrate, ask the printer or supplier which reference family applies, and only then look at values, because the value that matters is the one measured on that material. Working backwards from a screen mock, name the colour here, note the distance, and treat the name as the opening of a conversation. Recording the outcome — reference used, material, measured value and the light it was checked under — is what turns this job's decision into the next job's data. Two or three such records are usually enough to make the next approximation far less of a guess.",
    howTo: [
      { step: "Pick or type the colour you are trying to describe." },
      { step: "Read the CSS name and distance the page returns, and treat both as descriptive." },
      { step: "Note that no Pantone code is produced — nothing here substitutes for licensed colour data." },
      { step: "Keep measured values in an imported palette so the numbers live in one reviewable place." },
    ],
    whenToUse:
      "Use this to understand why the conversion is approximate, and to describe a colour quickly. The {{pantone-approximation-tool|Pantone approximation tool}} performs the lookup itself, the {{ral-to-hex-reference|RAL to HEX reference}} covers the same problem for the European paint standard, and the {{color-format-validator|format validator}} is the check to run before any value is committed to a stylesheet.",
    faqs: [
      {
        q: "Why is there no Pantone code output anywhere on this page?",
        a: "Because Pantone data is licensed and this build does not include it. What the page can honestly produce is a CSS name, its hex value and the RGB distance to your colour.",
      },
      {
        q: "If I know the Pantone code, can I get the hex here?",
        a: "Not from this page. Enter the nearest colour you know and read the name; for the actual reference value, use a licensed library or a physical swatch book.",
      },
      {
        q: "Why do two references look identical on screen but differ in print?",
        a: "Because paper and ink change the result. Coated and uncoated stock, and different substrates in manufacturing, shift an ink away from its standard value, which is why a code alone does not fully specify a colour.",
      },
      {
        q: "Is a satin or gloss finish part of the same problem?",
        a: "Yes. Finish affects how light leaves the surface, so the same reference can read differently under the same light on a different finish. Physical comparison is the only reliable check.",
      },
      {
        q: "What is the best way to store measured values?",
        a: "As an imported palette with role names rather than loose notes. The palette importer accepts pasted values or JSON, so the measured set becomes a shared, checkable reference.",
      },
    ],
  },

  "ral-to-hex-reference": {
    keywords: [
      "ral to hex",
      "ral color codes",
      "ral classic",
      "paint color conversion",
    ],
    intro:
      "The RAL to HEX reference covers the European paint standard and what this page can honestly do with it: describe a colour using the nearest CSS name, because no RAL dataset ships with the build.",
    content:
      "RAL is a colour standard from the painting and coatings world, and it is specified by code rather than by value. RAL Classic uses four digits — a blue such as 5015, a green such as 6005 — and RAL Design uses seven, in a system built for architectural and industrial finishes. That structure is the whole point of the standard: a code is a durable instruction that survives a supplier change, a colour card fading in a workshop drawer, or a designer leaving the project. What a code is not is a hex value.\n\nSo the ral color codes question splits the same way it does for any proprietary system. The reference data belongs to the standard's publisher. This page does not carry it. What it does carry is the nearest-name lookup: your colour is compared with the 141 CSS named values, the closest is drawn as a swatch with its name and hex, and the RGB distance between the two is printed beside it.\n\n- The output is a CSS name, a hex value and a numeric distance.\n- No RAL code is produced, and no RAL table is included in the build.\n- The comparison is exhaustive over those 141 entries, so the nearest entry is the genuine nearest in that set.\n\nRAL sits in the physical world in a way screens cannot reproduce. A finish has sheen, texture and a substrate: the same reference looks different in a matte powder coat on metal, in a satin wall paint and in a glossy plastic moulding, and it changes again with the light in the room. A screen value is emitted light, so a paint color conversion can only ever be a description of direction — warmer, greener, greyer — unless it is grounded in measured data or a physical chip.\n\nPractical use follows from that. When a colour has to be specified for a physical finish, quote the RAL code in the specification and keep the screen value as a preview aid, not the other way round. When a screen palette has to approximate a painted surface, work from a measured value rather than from a memory of the colour, and keep those measured values in an imported palette where the whole team can reach the same numbers. And when the mock and the sample disagree, believe the sample: it is the object the code describes. There is a naming discipline worth borrowing from the standard too. Because ral to hex converts between a code and a screen value rather than between two screen values, keep the code in the specification and the value in the implementation, and note which reference family the code came from. A system that records a code plus a measured value survives a supplier change; one that records a screenshot does not, because a screenshot cannot be re-issued to a manufacturer. Where a range of finishes is offered, record the finish beside the code, since the same reference in a different sheen is a different result on the wall.",
    howTo: [
      { step: "Set the colour you are approximating with the picker field." },
      { step: "Read the returned CSS name, hex value and distance." },
      { step: "Quote the RAL code in the specification and use the screen value only as a preview." },
      { step: "Keep measured values from real samples in an imported palette for the next job." },
    ],
    whenToUse:
      "Use this when a screen colour has to be described next to a physical finish. The {{pantone-to-hex-reference|Pantone to HEX reference}} and the {{pantone-approximation-tool|Pantone approximation tool}} cover the same ground for the print system, and the {{palette-importer|palette importer}} is where measured sample values belong once they exist.",
    faqs: [
      {
        q: "How is a RAL reference structured?",
        a: "RAL Classic uses four digits, such as 5015 for a blue, and RAL Design uses seven. The code is the durable part of the reference; the value behind it belongs to the standard's publisher.",
      },
      {
        q: "Can this page output a RAL code?",
        a: "No. There is no RAL dataset in the build, so the page returns the nearest CSS name with its hex and distance instead of inventing a code.",
      },
      {
        q: "Why can the same RAL colour look different on two products?",
        a: "Because finish and substrate change how light leaves the surface. Matte powder coat, satin paint and gloss plastic read differently even when they carry the same code.",
      },
      {
        q: "Should a design system store RAL codes or hex values?",
        a: "Store the code where the specification is physical and use hex for the screen preview. Keeping both, with the code authoritative, is what stops a preview from being mistaken for the approved colour.",
      },
      {
        q: "What settles a disagreement between a screen mock and a painted sample?",
        a: "The sample. It is the object the reference describes; measure it and record the measured value so the next round starts from data rather than memory.",
      },
    ],
  },

  "color-gamut-visualizer": {
    keywords: [
      "color gamut visualizer",
      "srgb vs p3 gamut check",
      "out of gamut color tool",
      "gamut coverage checker",
    ],
    intro:
      "The color gamut visualizer shows where a color sits relative to the gamuts that display it — sRGB, P3 and beyond — and flags what survives the journey to print.",
    content:
      "- A color is not a color until a device renders it, and devices disagree: the sRGB web standard draws one boundary around what ordinary monitors show, Display-P3 widens it for modern screens, and CMYK print shrinks it drastically.\n- The color gamut visualizer places any color in that landscape — showing its sRGB standing, an approximate CMYK rendering of what print would make of it, and the verdict on whether the color survives the journey.\n- It is a srgb vs p3 gamut check in tool form, for the moment a vivid screen color meets a medium that cannot keep up.\n\nThe common failure the tool explains is the vivid-blue-to-purple print disaster. Screen blues at high saturation sit outside CMYK's reach; the print conversion pulls them toward violet, and the brand's blue arrives on paper wrong. The out of gamut color tool verdict makes the risk visible before the press does: colors inside the gamut render as themselves; colors outside get their approximate printed appearance, and the distance between the two swatches is the size of the surprise. The same logic extends toward the wide-gamut future — P3-capable displays show more than sRGB, so colors specified carelessly look different across the monitor fleet.\n\nThe practical deployments: pre-print checks on brand colors, deciding which accents survive a print collateral run, and understanding why the screen-approved design looks muted in the catalog. The converters supply the CMYK numbers when the print path is chosen; the gamut checker shares this tool's verdict machinery for a lighter-weight question; and the display-side lesson — specify in spaces, not devices — is the one the OKLCH tools reinforce from the other direction.\n\nGamut is the reason a beautiful screen colour can become a disappointing print, and it deserves better than a footnote in the brief. The useful framing is coverage per hue rather than one overall percentage: a colour can be perfectly printable in its lightness while sitting outside the range of saturation the ink can reach, and it is exactly those values — vivid purples, bright greens, saturated cyans — that cause the surprise. Seeing where a value sits relative to the printable region turns an abstract risk into a specific decision: shift this hue slightly, accept a duller version here, or plan to specify that element as a spot ink instead. Modern displays complicate the picture further, since a palette that exceeds the sRGB reference is now common, and a print check has to account for the fact that the screen itself may be showing something no ink can match.\n\nChecking the palette rather than the individual colour is the habit that pays, since a gamut problem is usually a pattern across a family rather than one unlucky value.\n\nAs a gamut coverage checker it is deliberately the boundary tool: where does this color live, what survives, what does print make of it. For designs that will meet ink, it is the check that prevents the purple surprise. Where a brand colour fails the check, the useful question is not whether to accept a compromise but where in the interface that difference will genuinely be noticed.",
    howTo: [
      { step: "Set the color you plan to use across media." },
      { step: "Read the sRGB verdict and the approximate CMYK rendering side-by-side." },
      { step: "If print matters and the shift is visible, choose a print-safe variant or plan a spot color." },
    ],
    whenToUse:
      "Use this before committing vivid colors to print, or when displays disagree about a brand color. Use the converters for the CMYK numbers, the temperature analyzer for warmth questions, and the approximation tool when the conversation runs toward Pantone. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Why does my vivid blue print as purple?",
        a: "The color sits outside CMYK's gamut — print inks cannot reach that saturation at that hue — so conversion pulls it inward, and blues characteristically drift violet. The verdict panel shows the shift before the press does.",
      },
      {
        q: "What is the difference between sRGB and P3 here?",
        a: "P3 displays render a wider gamut, so a color outside sRGB but inside P3 looks richer on modern screens and ordinary on older ones. Specifying in sRGB guarantees consistency; using the wider gamut trades it for vibrance.",
      },
      {
        q: "Is the CMYK preview exact?",
        a: "It is an approximation — real conversions depend on profile, substrate and press. The preview's job is showing whether a shift exists and its rough size, not issuing the final proof.",
      },
      {
        q: "How do I keep brand colors consistent across media?",
        a: "Specify print-safe variants for ink, screen values for display, and treat the Pantone bridge as the cross-media contract — checked here before committing.",
      },
      {
        q: "Where does the color gamut visualizer stop short?",
        a: "As a gamut coverage checker it is deliberately the boundary tool: where does this color live, what survives, what does print make of it. For designs that will meet ink, it is the check that prevents the purple surprise. Where a brand colour fails the check, the useful question is not whether to accept a compromise but ",
      },
    ],
  },

  "color-symbolism-reference": {
    keywords: [
      "color symbolism reference",
      "color meanings across cultures",
      "what colors mean in different countries",
      "global color symbolism tool",
    ],
    intro:
      "The color symbolism reference browses what colors mean across cultures — where white weddings and white mourning coexist, and why red means luck, danger or revolution depending on the map.",
    content:
      "The mood analyzer reports what a color means in the broadly Western convention; the symbolism reference reports what it means everywhere else — because color meanings are cultural contracts, and the contracts differ. The color symbolism reference browses the major hues against their cross-cultural registers: white as purity here and mourning there; red as luck and celebration in one tradition, danger in a second, revolution in a third; green as paradise in one geography, something to avoid in finance contexts in another. It is the what colors mean in different countries survey, in browsable form.\n\nThe reference exists because the failure it prevents is expensive and quiet: a campaign ships globally with a palette tuned to one culture's conventions and lands wrong in another — white bridal motifs in a market where white is funerary, a green-heavy promotion that reads as financial loss where the convention inverts. Color meanings across cultures is not trivia; it is the due diligence layer of any design that crosses a border, and the reference puts the layer's findings where the palette decisions happen.\n\n- The browsing form teaches the deeper pattern: meanings cluster by tradition, religion and history, and the same hue can carry opposite loads a few thousand kilometers apart.\n- That is why the tool refuses the comfort of a single verdict per color — the honest answer to what does red mean is where and to whom, and the entries are written accordingly.\n- The mood analyzer covers the Western default register for single-color questions; the psychology reference adds the marketing-layer meanings; and this reference owns the global map, where the conventions are many and the designer's job is navigation, not selection.\n\nSymbolism is where colour decisions stop being aesthetic and become contextual, and a browsable reference is valuable because it shows how widely the conventions spread and how often they contradict each other. White reads as mourning across much of East Asia and as purity across Europe and North America; green is sacred in many Islamic traditions and unlucky in parts of the West; the same red that signals celebration in one market signals danger in another. None of that makes symbolism unusable — it makes it a research task rather than an assumption, and the reference frames it that way, laying out historical, regional and religious usage so a designer can see where a choice will be read as intended and where it will be misread. For anything shipping across markets, that check is far cheaper before a palette is fixed than after a campaign is translated.\n\nKeeping notes next to the swatches is what turns a one-off check into a reusable decision record for the next market.\n\nAs a global color symbolism tool it is deliberately a browser rather than a rulebook: meanings surveyed, contexts labeled, and the final call left where it belongs — with the audience research this reference informs but cannot replace.\n\nThe habit worth keeping is to record the check alongside the palette, so the reasoning survives the person who did the research.",
    howTo: [
      { step: "Look up each palette hue's cross-cultural entries before shipping across markets." },
      { step: "Note where meanings oppose — the spots where one palette cannot serve all audiences." },
      { step: "Adjust per-market, or choose register-neutral colors for global surfaces." },
    ],
    whenToUse:
      "Use this as the due-diligence layer for cross-border design. Use the mood analyzer for the Western register of a single color, the psychology reference for marketing-layer meanings, and local research to confirm what this reference surfaces. For the neighbouring steps, see the {{color-psychology-reference|color psychology reference}} and the {{color-wheel-theory-guide|color wheel theory guide}}.",
    faqs: [
      {
        q: "Why do color meanings differ so much across cultures?",
        a: "They are cultural contracts — shaped by religion, history, climate and language — not universal biology. The biology-level associations are thin; the cultural ones are deep and divergent.",
      },
      {
        q: "Is there a universally safe palette?",
        a: "Not exactly, but register-neutral choices — deep neutrals, restrained accents — travel better than symbolically loaded hues. The reference shows which hues carry the heaviest loads.",
      },
      {
        q: "Does this cover every country?",
        a: "It surveys the major documented traditions and their divergences; fine-grained regional and subcultural variation always deserves local confirmation.",
      },
      {
        q: "How do I use this with the mood analyzer?",
        a: "The analyzer gives the Western conventional register; the symbolism reference shows where that register does not travel. Together they cover the single-hue question at home and abroad.",
      },
      {
        q: "What does the color symbolism reference not do?",
        a: "That is why the tool refuses the comfort of a single verdict per color — the honest answer to what does red mean is where and to whom, and the entries are written accordingly. The mood analyzer covers the Western default register for single-color questions; the psychology reference adds the marketing-layer meanings; an",
      },
    ],
  },

  "color-naming-history-tool": {
    keywords: [
      "color naming history tool",
      "origin of color names",
      "history of color words",
      "where color names come from",
    ],
    intro:
      "The color naming history tool browses the standard color names with their stories — where color words come from, and why the CSS list reads like a travelogue.",
    content:
      "The standard color names are a museum nobody labels: chartreuse is a liqueur, magenta a battle, aliceblue a fictional heroine's pinafore. The color naming history tool adds the labels — browsing the named-color list with the origin of color names attached, so the history of color words becomes visible in the list every stylesheet quotes.\n\n- The stories follow the patterns all vocabulary follows.\n- Many names are places of manufacture: the dyes and pigments that built trade routes — a crimson from an insect, an ochre from the earth, the chartreuse liqueur that gave its yellow-green to the world.\n- Others are discoveries and accidents: magenta named for the 1859 battle where the dye debuted, mauve's aniline accident that launched the synthetic dye industry.\n- The rest are literature and familiarity — aliceblue and its Alice-in-Wonderland siblings, named by a programmer with favorite books — and the whole collection, browsed with origins, reads as a compressed history of trade, chemistry and fandom.\n\nThe tool's value is the layer it adds to a list designers quote daily. Knowing that Peru is a country, that burlywood is a wood, that navajowhite is neither navajo nor particularly white, changes how the names sit in a stylesheet — and occasionally saves a brand from a name whose history it did not check. The named colors reference covers the same list as pure lookup; the nearest-named finder handles arbitrary colors; the name generator invents evocative names in the tradition this tool documents; and this one keeps the archive — where color words come from, told name by name.\n\nColour names are a record of what a culture could make, trade and see, which is why the history is more useful than it first appears. Many ordinary words descend from pigments — a name that began as a mineral, a dye or a place — and the order in which a language acquires colour terms is remarkably consistent across cultures. Those stories are precisely what a tool for where color names come from puts beside the swatches, and a name with a story attached is the one that sticks when a palette has to be discussed in a review. The exercise also builds a healthy respect for how approximate naming is. A name covers a region rather than a point, the regions shift between languages and eras, and that looseness is the reason hex values exist — as a correction to naming rather than a replacement for it.\n\nReading two languages side by side is the fastest way to see where the boundaries fall differently.\n\nAs a history of color words resource it is deliberately narrative: each entry a swatch, a name, and the story of how the two met — the museum, finally labeled.\n\nThe oldest entries are the most interesting, since they show what a culture had to work with, and the newest show how quickly a colour acquires a name once a product adopts it. Reading both ends of the list together is the fastest way to see that naming is an ongoing negotiation rather than a settled table.",
    howTo: [
      { step: "Browse the list; each entry pairs the swatch and name with its origin." },
      { step: "Follow the patterns — trade-route dyes, chemical accidents, literary tributes." },
      { step: "Quote names with their histories in mind, especially in brand-adjacent work." },
    ],
    whenToUse:
      "Use this for the stories behind the names you quote daily, and for checking a name's baggage before it enters a brand. Use the named colors reference for pure lookup, the name generator for evocative new names, and the finder to match colors to the archive. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Why is the CSS list so eclectic?",
        a: "It inherited the X11 list, which accumulated names from tradition, literature and one programmer's favorites — hence the travelogue: dyes, battles, countries and an Alice.",
      },
      {
        q: "Which name has the most surprising history?",
        a: "Magenta is a strong contender — a dye named after an 1859 battle, which then named a color of light. Chartreuse's liqueur origin runs a close second.",
      },
      {
        q: "Can I rely on the histories for scholarship?",
        a: "The entries are well-attested popular histories, appropriate for design context — for academic work, the etymological sources behind each entry are the deeper trail.",
      },
      {
        q: "Does it cover non-CSS historical names?",
        a: "The focus is the standard list designers actually quote; famous names outside it appear where the story connects to the list.",
      },
      {
        q: "Where does the color naming history tool stop short?",
        a: "The oldest entries are the most interesting, since they show what a culture had to work with, and the newest show how quickly a colour acquires a name once a product adopts it. Reading both ends of the list together is the fastest way to see that naming is an ongoing negotiation rather than a settled table.",
      },
    ],
  },

  "color-trend-analyzer": {
    keywords: [
      "color trend analyzer",
      "color of the year history",
      "pantone color of the year list",
      "track color trends over time",
    ],
    intro:
      "The color trend analyzer browses the color-of-the-year record — the pantone color of the year list as a swatch timeline — and reads what the sequence says about taste's drift.",
    content:
      "Once a year, the color industries crown a color, and the crowns have accumulated into a record worth reading: a decade-plus of color-of-the-year choices that traces taste's drift — the lavender-blues of one era, the living corals of another, the earthy calm of the most recent years. The color trend analyzer browses that record as a swatch timeline — each year, its color, its hex — and frames the pattern: what the sequence says about where palettes came from and where they are drifting.\n\nThe record rewards two readings. The design-historical one: the choices track the mood of their moment — recession-era practicality, recovery-era optimism, the pandemic-era turn toward comfort — and knowing the arc equips designers to place their own work in time, or deliberately against it. The practical one: the color of the year is a supply-chain event — paint aisles, product lines and campaign palettes fill with it within months — so the track color trends over time view doubles as a forecast of what clients will ask for and what shelves will hold. Both readings run on the same browsable data.\n\n- The tool's honesty is in what the timeline is not: not a mandate.\n- The color of the year history is a record of institutional taste — one company's influence amplified by an industry — and the useful posture is informed choice, not obedience.\n- The color of the year browser presents the same record as pure reference; the cultural palettes reference widens the lens to traditions the annual crown ignores; and this analyzer keeps the analytical frame — years as data points, the sequence as signal.\n\nTrend history is more useful as a sequence than as a set of announcements, which is what a browsable list of the years makes possible. Read in order, the colours show a pattern: moods shift in pairs, warm years following cool ones and saturated seasons following muted ones, and a colour announced as a surprise almost always turns out to have been building in packaging and interiors for a season or two beforehand. That pattern is the practical value, because it indicates how far ahead a trend is being consumed rather than simply what it was. Keeping the hex values alongside the names makes the sequence usable as well: a palette can be graded against a decade of colours to see where it belongs, and a campaign can compare its own accent against the neighbouring years without hunting for swatches. A pantone color of the year list, read that way, is a small dataset rather than a gallery.\n\nCharting the values makes the drift between announcements visible, which is the part that guides a decision.\n\nAs a color of the year history tool it is the trend conversation grounded in its primary source: the colors themselves, in order, with the hex values that let the argument start from swatches instead of memories.\n\nGrading a palette against the sequence is the practical check, since a set that reads as current usually sits close to the neighbouring years rather than echoing one from a decade ago.",
    howTo: [
      { step: "Browse the timeline — each year's color as a labeled swatch." },
      { step: "Read the arc: what the sequence says about the moods that chose it." },
      { step: "Use the record to place your work in time — or to anticipate the palette climate clients will bring." },
    ],
    whenToUse:
      "Use this to ground trend discussions in the actual record. Use the color of the year browser for pure reference, the cultural palettes reference for the traditions beyond the annual crown, and the harmony generators to build with whatever the timeline suggests. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Whose color of the year is this record based on?",
        a: "The Pantone Color Institute's annual selection — the most influential of the color-of-the-year institutions — with the record presented as a design-historical timeline.",
      },
      {
        q: "Should I use the color of the year in my work?",
        a: "As information, not instruction: the choice signals the palette climate but does not fit every brand. The analyzer's frame is informed choice, not annual obedience.",
      },
      {
        q: "Why do recent years lean earthy and muted?",
        a: "The arc tracks the mood of its moment — recent selections favor comfort and grounding, a readable response to the years that produced them. The timeline makes the pattern visible.",
      },
      {
        q: "Can I get the hex values for each year?",
        a: "Yes — each swatch carries its hex and copies directly, so the record is usable, not just viewable.",
      },
      {
        q: "What does the color trend analyzer not do?",
        a: "The color of the year history is a record of institutional taste — one company's influence amplified by an industry — and the useful posture is informed choice, not obedience. The color of the year browser presents the same record as pure reference; the cultural palettes reference widens the lens to traditions the annu",
      },
    ],
  },

  "color-from-text-mood-tool": {
    keywords: [
      "color from text mood tool",
      "palette from a word",
      "mood to color generator",
      "generate palette from text",
    ],
    intro:
      "The color from text mood tool turns a word into a palette — type a mood, a name or a phrase, and receive the five-color family the text deterministically derives.",
    content:
      "Type a word — calm, velocity, grandmother's kitchen — and the color from text mood tool answers with a palette: five colors derived from the text itself, deterministic and instant. The same word always yields the same family; change one letter and the family shifts. It is a mood to color generator that treats text as a seed and palettes as fruit, with no configuration between the word and the swatches.\n\nThe derivation is honest hashing: the text folds into a hue seed, and the palette derives around it in a fixed register — five colors, balanced spacing, one family. That determinism is the tool's character: unlike a random generator, it is a lookup with infinite keys, so a project can standardize on the word (a team can share ocean and all see the same palette) and a brand can check whether its own name produces a family worth wearing. The register is deliberately neutral — the derivation does not read semantics, so calm and chaos can land near each other — and that neutrality is the honest line between hashing and pretending to understand.\n\nWords carry colour more reliably than most briefs admit, because the associations are learned early and shared widely. A tool that turns a sentence into a family is therefore less gimmicky than it sounds: what it really does is make the implicit palette in a word explicit and arguable, which is exactly what a design conversation needs at the start. A palette from a word is a starting position rather than an answer, and starting positions are the scarce thing in early exploration — a blank canvas costs more time than a mediocre palette that can be corrected. The determinism helps too: the same word produces the same family for everyone in the room, so the discussion is about the palette rather than about who remembers what. Feed the brief's own language in and the first review has something concrete to react to, which is usually the difference between a meeting that decides and one that circles.\n\nKeeping the input words with the output palettes turns the collection into a rough map of how the project talks about itself.\n\nThe tool earns its keep as an ideation accelerator: the blank-palette problem solved by a word — any word, the first one that comes to mind — and the resulting family nudged from there. Names to palettes for personal projects; mood words for campaigns; the client's one-line brief fed straight in for a starting set to argue with. The mood color generator works the curated direction — a fixed menu of moods, each mapped with more editorial intent — and the emotion finder keys on the emotion vocabulary specifically; this tool is the open-textured sibling: generate palette from text, any text, and let the determinism be the feature. Because the derivation is repeatable, the word is worth keeping as a note beside the palette it produced, so the reasoning is recoverable when a later review asks why those values were chosen.",
    howTo: [
      { step: "Type the word or phrase whose mood you want colored." },
      { step: "Read the derived five-color family — deterministic for this exact text." },
      { step: "Iterate on the wording (one letter changes the result) or hand the palette to the editor to refine." },
    ],
    whenToUse:
      "Use this for instant, shareable palettes from any text — ideation, naming exploration, team prompts. Use the mood generator for curated mood words, the emotion finder for the emotion vocabulary, and the palette editor to refine what the hash produced. For the neighbouring steps, see the {{color-wheel-theory-guide|color wheel theory guide}} and the {{bezold-effect-visualizer|bezold effect visualizer}}.",
    faqs: [
      {
        q: "Does the tool understand the word's meaning?",
        a: "No — it hashes the text into a color seed deterministically. The word calm does not guarantee calm colors; the honesty is the feature, and curation is the editor's job.",
      },
      {
        q: "Why does one letter change the whole palette?",
        a: "The derivation hashes the exact string, so any change produces a new seed. The determinism that makes palettes shareable also makes them sensitive — iterate on wording deliberately.",
      },
      {
        q: "Will everyone see the same palette for the same word?",
        a: "Yes — same text, same seed, same family, on any device. That is what makes it usable as a shared reference.",
      },
      {
        q: "Can I refine the derived palette?",
        a: "Copy it into the palette editor or locker — the tool's job is the seed; refinement belongs to the tools downstream.",
      },
      {
        q: "Where does the color from text/mood tool stop short?",
        a: "The tool earns its keep as an ideation accelerator: the blank-palette problem solved by a word — any word, the first one that comes to mind — and the resulting family nudged from there. Names to palettes for personal projects; mood words for campaigns; the client's one-line brief fed straight in for a starting set to a",
      },
    ],
  },

  "color-blindness-test-ishihara": {
    keywords: [
      "ishihara style color test",
      "ishihara plate test online",
      "color blindness plate test",
      "ishihara dots demo",
    ],
    intro:
      "The Ishihara-style test renders the classic plate format — dot mosaics where numbers hide from certain kinds of color vision — as a design demonstration of what CVD really costs.",
    content:
      "The Ishihara plates are the world's most famous color vision test: circles of dots where a number hides in color, visible to typical vision and invisible — or visible wrongly — to deficient vision. The Ishihara-style test renders that format here: a dot mosaic with an embedded figure, shown alongside the simulation of how the plate reads under color vision differences. It is an ishihara plate test online in form, and a design demonstration in purpose.\n\n- The simulation is what makes this version a tool rather than a diagnosis.\n- A real Ishihara test answers a clinical question about the viewer; this rendering answers a design question about the image: take the plate and view it through the CVD simulations — the same matrices that power the simulators here — and watch the embedded figure dissolve under protanopia or deuteranopia exactly as it does for viewers with those conditions.\n- That is the most visceral demonstration available of what color vision deficiency costs: not muted colors, but information that simply is not there.\n- The color blindness test presents the general comparison row; this one stages the classic plate because the format makes the loss undeniable.\n\n- The design lesson travels far beyond plates.\n- Any signal encoded only in hue — a red error badge, a green success dot, a chart's red-vs-green series — is an Ishihara plate to someone in the audience: a number that is not there.\n- The robustness responses are standard and effective — pair hue with lightness, shape or a label — and the simulators verify the fixes.\n- The medical honesty stands: real screening belongs with a professional, whose plates are calibrated and whose administration is controlled.\n\nThe plates are famous for a reason worth stating precisely: they test the discriminations that matter most in everyday interfaces, not the ones that are easiest to measure. A plate hides a figure in dots that vary in lightness but not in hue, so anyone whose red-green axis is compressed loses the figure while a typical viewer finds it instantly — and the same construction produces the failure that matters in a chart legend or a status indicator. Reproducing the format digitally allows the simulated view to be shown beside the original, which is where the design lesson lands: the plate stops being a puzzle and becomes a demonstration of what disappears. Used as an ishihara style color test on design work rather than as a screening instrument, the point is the reminder rather than the score. A color blindness plate test run against your own palette is worth more than one run against somebody else's eyesight.\n\nAs an ishihara dots demo it is the classic format in service of design empathy: one plate, its simulated disappearances, and the standing reminder that somewhere in the audience, the number is missing.\n\nRunning the plate against a real chart or status list, rather than against swatches alone, is where the reminder becomes a change: the hue that disappears is usually carrying a meaning nobody intended to hide.",
    howTo: [
      { step: "View the plate — typical vision reads the embedded figure; note its value." },
      { step: "Switch through the CVD simulations and watch the figure dissolve or survive." },
      { step: "Apply the lesson: hue-only signals are plates to someone — add a second channel." },
    ],
    whenToUse:
      "Use this to build empathy and demonstrate CVD's information cost vividly. Use the color blindness test for the general comparison, the individual simulators for specific deficiencies, and the friendly picker when the fix is choosing safer colors. For the neighbouring steps, see the {{color-blindness-test|color blindness test}} and the {{color-wheel-theory-guide|color wheel theory guide}}.",
    faqs: [
      {
        q: "Is this a real Ishihara test?",
        a: "No — it is an Ishihara-style demonstration with simulated plates, for design education. Actual screening requires calibrated plates and professional administration.",
      },
      {
        q: "Why does the figure disappear under simulation?",
        a: "Because the figure and background differ mainly in hue, which the simulated deficiency collapses — exactly what happens for viewers with that condition. The disappearing number is the point.",
      },
      {
        q: "What should designers take from the plate?",
        a: "That hue-only encoding hides information from a significant minority. Every red/green signal needs a second channel — lightness, shape, text — and the simulators verify the repair.",
      },
      {
        q: "Can I check my own vision here?",
        a: "Not reliably — the plate here is a design demo, not a calibrated instrument. If you suspect a color vision difference, professional screening is the valid path.",
      },
      {
        q: "What does the color blindness test (ishihara-style) not do?",
        a: "Any signal encoded only in hue — a red error badge, a green success dot, a chart's red-vs-green series — is an Ishihara plate to someone in the audience: a number that is not there. The robustness responses are standard and effective — pair hue with lightness, shape or a label — and the simulators verify the fixes. The",
      },
    ],
  },

  "emotion-color-finder": {
    keywords: [
      "emotion color finder",
      "colors for emotions",
      "emotion palette generator",
      "joy sadness anger color palettes",
    ],
    intro:
      "The emotion color finder maps the classic emotion set to palettes — choose joy, sadness, anger or trust, and receive the five-color family keyed to that feeling.",
    content:
      "Emotions have color reputations: joy is yellow, sadness is blue, anger is red — associations old enough to appear in every language's metaphors. The emotion color finder builds its palettes on that vocabulary: a fixed menu of the classic emotions — joy, sadness, anger, trust, fear, surprise, anticipation, disgust — each selection deriving a five-color family keyed to the feeling. It is the joy sadness anger color palettes set, one emotion at a time.\n\nThe mapping lives where language and color already meet. Each emotion seeds the derivation from its conventional color territory — joy's warm yellows, anger's aggressive reds, trust's steady blues — with the palette deriving around that anchor in a coherent register, so sadness arrives as a family of weighty blues and greys rather than one lonely swatch. The determinism is deliberate: the same emotion always yields the same palette, on every device, so a team can speak in emotions and see the same colors — a shared vocabulary for mood-boarding, character design and emotional UI states.\n\n- The tool's home turf is emotional design: mood boards that start from a feeling rather than a reference image, character and scene palettes for illustration, UI states that should feel like the state they announce, and creative prompts where the constraint is a feeling instead of a word count.\n- The mood generator works the adjacent menu — moods like calm and energetic, broader than emotions — and the text tool accepts any word at all; this one keeps the classic emotion set because the vocabulary is the point: colors for emotions, keyed to the words everyone already uses.\n\nEmotion-based palettes work because the mapping is conventional rather than arbitrary: the associations were set by decades of shared usage, and an audience recognises them before it can explain them. That makes the output genuinely useful as a starting point, and it also defines the limit, since a convention describes expectation rather than governing perception. The tool shines when the brief itself is emotional — a launch, a wellness product, a campaign with a mood rather than a message — because it converts an adjective into values that can be reviewed. It also works well as a constraint, since a family derived from one named emotion holds together better than a set assembled from several, and the determinism means everyone is looking at the same palette. Where the emotion is genuinely complex, the practical move is to start from the nearest available one and let the work correct it.\n\nAs an emotion palette generator it is deliberately curated: a fixed menu, deterministic derivations, honest about mapping convention rather than reading minds. For the question what does joy look like as a palette — and the seven siblings — it is the direct answer.\n\nKeeping the emotion word attached to the palette is worth the extra line, since it explains the derivation a season later and gives the next review a starting point rather than a set of values to defend from scratch. Where the palette is reused, the word is also the fastest way to explain the intended mood to somebody who was not in the original conversation.",
    howTo: [
      { step: "Choose the emotion from the menu — joy, sadness, anger and the rest." },
      { step: "Read the derived five-color family, deterministic for that emotion." },
      { step: "Use the palette for mood-boards, characters or emotional UI — and refine in the editor if needed." },
    ],
    whenToUse:
      "Use this when the brief is a feeling from the classic set. Use the mood generator for broader moods, the text tool for arbitrary words, and the palette editor to take the derived family the last mile. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "How are the emotion palettes derived?",
        a: "Each emotion anchors to its conventional color territory — joy's yellows, anger's reds — and the palette derives deterministically around that anchor in a coherent register.",
      },
      {
        q: "Why does the same emotion always give the same palette?",
        a: "The derivation is deterministic by design, so the emotion is a shared key: everyone who selects trust sees the same family, which makes the vocabulary usable across a team.",
      },
      {
        q: "Is the emotion-to-color mapping scientific?",
        a: "It is built on well-attested convention — the metaphors languages actually use — rather than lab measurement. For emotional design, convention is usually the material that matters.",
      },
      {
        q: "Can I get a palette for a feeling not on the menu?",
        a: "The text mood tool accepts any word — type the feeling there; this tool keeps the classic emotion set as its curated vocabulary.",
      },
      {
        q: "What does the emotion color finder not do?",
        a: "The mood generator works the adjacent menu — moods like calm and energetic, broader than emotions — and the text tool accepts any word at all; this one keeps the classic emotion set because the vocabulary is the point: colors for emotions, keyed to the words everyone already uses.",
      },
    ],
  },
};
