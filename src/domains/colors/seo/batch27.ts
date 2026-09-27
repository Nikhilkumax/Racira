import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 27.
 *
 * The design-system reference cluster, part one. These slugs were on the earlier skip
 * list, but the components behind them are not stubs: each one carries that framework's
 * own published base colour for every family and renders a full shade scale from it.
 * The one thing every entry states plainly is which half is the framework's data (the
 * base hexes) and which half is computed here (the numbered steps, generated at fixed
 * lightnesses from each base's OKLCH chroma and hue). That distinction is exactly what
 * the earlier audit could not describe, and describing it is what makes these pages
 * honest and worth having.
 *
 * Still skipped in this cluster because the component does not match the slug:
 * adobe-spectrum-color-reference, atlassian-design-color-reference and
 * github-primer-color-reference all render the same six Salesforce tokens; and
 * material-ui-color-exporter / chakra-ui-color-exporter both render the generic
 * Tailwind class generator rather than a Material or Chakra theme object.
 */
export const SEO_BATCH_27: Record<string, ToolSeo> = {
  "tailwind-color-reference": {
    keywords: [
      "tailwind color palette reference",
      "tailwind colors list",
      "tailwind color names",
      "tailwind shades hex",
      "tailwind color families",
    ],
    intro:
      "The Tailwind color palette reference lists all eighteen Tailwind color families from slate to rose, each shown as an eleven-step ramp from 50 to 950 with every hex value printed.",
    content:
      "- The page is organised as one block per family.\n- Eighteen families are covered — slate, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink and rose — and each block holds eleven tiles labelled 50 to 950, with the hex value printed beneath every swatch.\n- On a wide screen a family fits across a single row, so the shape of the ramp is visible at a glance.\n\nThe base value of each family is Tailwind's own published colour — the slate at #64748b, the red at #ef4444, the blue at #3b82f6, and so on — and that is the anchor of the reference. Each base is the value the framework ships as the five hundred step, which is what makes this list useful as a lookup: find the family by name and the anchor colour is the one you already know.\n\nThe eleven numbered steps are generated here rather than copied from the framework's own scale. Each step is computed at a fixed lightness — 0.97 for the fifty, then 0.93, 0.85, 0.75, 0.65, 0.55, 0.47, 0.40, 0.32, 0.22 and 0.14 for the nine-fifty — while the family's hue and chroma are held constant. The result is a ramp with the right shape and the right hue, and individual steps that will not always match the exact values in a Tailwind install.\n\nThat distinction matters when the numbers are going into a project. Use the base hex, the step label or the family name with confidence, since those come straight from the framework. Use the generated step hexes as a preview of the ramp and a starting point, and take the exact values from the installed package when a pixel-exact match is required.\n\nAs a tailwind color palette reference it is the fastest way to see the framework's families side by side, which is not something a documentation page does well: eighteen ramps stacked in one scroll shows how much of the system sits in the warm end, how the neutrals compare to the saturated families, and where the pale steps land relative to white. The tailwind color names are all here, and the order they appear in — slate through rose — follows the wheel closely enough to compare neighbours.\n\nWhy a reference page rather than the documentation itself is mostly a question of shape. Eighteen ramps stacked in one scroll can be compared against each other, which a per-colour documentation page cannot manage: it is easy to see here that the green and the emerald families are close enough to be alternatives, that the two darkest steps of the blues converge, and how far the yellow and lime ramps sit from white at their pale ends. For anyone assembling a set from the framework's own tailwind color families rather than from a brand colour, that comparison is the useful part of the page, and it is the reason a plain list of values is still worth keeping around.\n\nLimits: no search box, no copy buttons, no alpha or dark-mode variants, and no way to filter the list down to a few families.\n\n- The eleven steps are the only scale shown, so the framework's own bespoke values for specific components are not included.\n- Within those bounds, the tailwind colors list with every tailwind shades hex value printed is a complete, honest reference to the system's colour families.",
    howTo: [
      { step: "Find the family you need by scrolling to its block — they run slate to rose." },
      { step: "Read the eleven steps from 50 at the lightest to 950 at the darkest." },
      { step: "Take the hex printed under the step you want, which the tiles label as a Tailwind scale number." },
    ],
    whenToUse:
      "Use this when a Tailwind project needs the framework's own colour values, or when you want to see the whole system at once while choosing a family. Use the Tailwind colour exporter when the output has to be a config block for a brand colour instead of the framework's own palette. A ramp derived from your own brand colour is what the {{tailwind-palette-generator|Tailwind palette generator}} builds, and that ramp leaving as a config block is the {{tailwind-css-color-exporter|Tailwind CSS color exporter}}'s job.",
    faqs: [
      {
        q: "Are these the real Tailwind values?",
        a: "The base colour of each family is Tailwind's published value, and the fifty-to-nine-fifty steps are generated from it at fixed lightnesses, so individual steps can differ from an installed package.",
      },
      {
        q: "How many families are shown?",
        a: "Eighteen, from slate through rose, each with eleven steps. The families match the ones the framework ships, including the two neutrals at the start of the list.",
      },
      {
        q: "Can I copy a hex value?",
        a: "Not with a button — the value is printed as text under each swatch, so it has to be selected by hand. There is also no search box to jump to a family.",
      },
      {
        q: "Why does a step look different from the one I use in code?",
        a: "Because the steps are computed from the base colour's hue and chroma rather than copied, so treat them as a preview of the ramp and take exact values from the package.",
      },
      {
        q: "Can I compare families side by side?",
        a: "Yes — every family is a block on one page, so scrolling lines them up; there is no filter to narrow the list, which makes the stacked layout the comparison.",
      },
    ],
  },

  "material-design-color-reference": {
    keywords: [
      "material design color palette",
      "material colors list",
      "material design color names",
      "material palette hex codes",
      "material color families",
    ],
    intro:
      "The Material Design color palette reference shows nineteen Material families — red, deep purple, light blue, lime, brown and the rest — each as an eleven-step ramp with the base hex and every step value.",
    content:
      "Nineteen families are laid out one block each: red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime, yellow, amber, orange, deep-orange, brown, gray and blue-gray. Every block carries eleven tiles labelled 50 through 950 with the hex printed under each swatch, and the hyphenated names are kept as the framework writes them, so searching for light-blue finds the same family the framework does.\n\n- Each family is anchored on Material's own base colour: the red at #f44336, the blue at #2196f3, the teal at #009688, the amber at #ffc107.\n- Those are the published values for the five hundred step, and they are the part of this page that can be used verbatim in a project.\n- The nineteen of them together give a good sense of the system's temperament — heavy on the cool half of the wheel, with three neutrals at the end for surfaces and text.\n\nThe numbered steps themselves are generated rather than sampled. Each is placed at a fixed lightness — 0.97 at the pale end down to 0.14 at the darkest — with the family's hue and chroma held constant through the ramp. So the preview has the right hue and a plausible progression, and the steps will not always match the framework's published palette values exactly.\n\nOne difference is worth expecting before it surprises you. Material's own system is not a plain eleven-step ramp: it publishes a base scale plus separate accent values, and the darkest families in the list — brown and the two grays — behave differently from the saturated hues, because a near-neutral has very little chroma for a lightness ladder to work with. Raising one of those bases through the same ladder produces a set of near-neutrals with barely any colour in them, which is honest to the model and not a bug.\n\nAs a material design color palette reference the page is most useful for two jobs: finding the base value of a family by name, and comparing families against each other when picking one for a product. Seeing nineteen ramps stacked is also a quick lesson in how similar a pale tint of a red and a pale tint of an orange look, which is the failure mode pale steps usually cause.\n\nReading the list as a whole also shows where the material color families overlap. The two blues and the two greens are close cousins, the yellow and the amber are nearly the same hue at different lightnesses, and the pink sits between the red and the purple rather than beside either of them. Those relationships are hard to see one documentation page at a time, and they matter as soon as a product needs four or five distinct accents rather than a single family: picking blue, light-blue and cyan together would leave three colours that no legend could separate.\n\nLimits: no search, no copy buttons, no accent steps, no dark-theme values and no alpha variants.\n\n- The material design color names are exactly the framework's, and each material palette hex codes entry is printed under its swatch.\n- Within those limits the material colors list is honest about what it is — the framework's base colours, expanded into a generated ramp.",
    howTo: [
      { step: "Scroll to the family you want; the blocks run red, pink and purple through to brown, gray and blue-gray." },
      { step: "Read the eleven steps from 50 to 950, each labelled with its step number." },
      { step: "Copy the printed hex for the step you need, or take the base value from the family you recognise." },
    ],
    whenToUse:
      "Use this when a project follows Material and needs a family's anchor colour, or when comparing Material families while choosing one. Use the palette generators when the ramp should come from your own brand colour rather than from the framework's palette. Carrying a brand colour through that ramp structure is what the {{material-ui-color-exporter|Material UI color exporter}} does, and the same ramp without the theme wrapper is the {{material-palette-generator|Material palette generator}}'s output.",
    faqs: [
      {
        q: "Which Material families are included?",
        a: "Nineteen, including the two blues, both greens, the two oranges and the three neutrals — brown, gray and blue-gray — with the framework's hyphenated names preserved.",
      },
      {
        q: "Are the step values the framework's own?",
        a: "The base colour of each family is; the eleven steps from 50 to 950 are generated at fixed lightnesses using the base's hue and chroma, so they can differ from published values.",
      },
      {
        q: "Why do the brown and gray ramps look so flat?",
        a: "Because those families carry very little chroma, so a lightness ladder produces a near-neutral set at every step. The saturated families show far more colour through the same ramp.",
      },
      {
        q: "Where are the accent colours?",
        a: "They are not on this page. Only the base scale is shown, so any accent step published alongside the framework's palette has to be looked up separately.",
      },
      {
        q: "What are the three neutrals for?",
        a: "Surfaces and text: brown, gray and blue-gray close the list and do the work no hue can, which is why a Material interface can be almost entirely neutral and still look deliberate.",
      },
    ],
  },

  "bootstrap-color-reference": {
    keywords: [
      "bootstrap color palette",
      "bootstrap theme colors",
      "bootstrap color names",
      "bootstrap palette hex",
      "bootstrap css colors",
    ],
    intro:
      "The Bootstrap color palette reference lists the eight theme colours — primary, secondary, success, danger, warning, info, light and dark — each expanded into an eleven-step ramp with hex values.",
    content:
      "- This is a short list compared with the hue-heavy frameworks, and that is the point of it.\n- Bootstrap's colour system is built on eight semantic tokens rather than a wheel of families: primary at #0d6efd, secondary at #6c757d, success at #198754, danger at #dc3545, warning at #ffc107, info at #0dcaf0, light at #f8f9fa and dark at #212529.\n- Each one gets a block of eleven tiles labelled 50 through 950, with the hex printed beneath every swatch.\n\nThe semantic naming is what makes the reference different from a hue list. A reader arrives knowing they want the danger colour or the success colour and needing its value, not knowing which blue to pick — and the eight tokens answer that directly. The two neutrals, light and dark, sit at the ends of the luminance range, which is why their ramps behave so differently from the other six: the base of light is nearly white and the base of dark is nearly black, so a fixed lightness ladder pushes both towards the middle.\n\nEvery base hex above is Bootstrap's own published theme value, and those are the numbers that belong in a project. The eleven numbered steps are generated from each base rather than sampled from the framework's compiled CSS, computed at a fixed lightness with the base's hue and chroma held constant — so a step gives you a preview of the ramp in the right hue, while an exact compiled value may differ.\n\nOne gap is worth knowing about in advance. Bootstrap's compiled output does not stop at a plain ramp: its utilities include subtle backgrounds, emphasis variants and border colours derived from the same eight tokens, and none of those appear here. What the page shows is the token and a scale under it, which covers most lookups but not every class the framework ships.\n\nIn use this is a fast reference for anyone styling against Bootstrap: pull the primary value, check what a pale step of info looks like as a background, or confirm that the warning yellow is as light as it appears. Because there are only eight blocks, the whole system fits in one screen or two, which no other reference on this site manages.\n\nComparing the tokens against each other is where the eight-block layout earns its place. Success and danger are close in luminance, which is why they work as a pair in a status row; warning is much lighter than either and needs a dark text colour on it; info and primary are close enough in hue that using both in one interface usually reads as a mistake rather than as a decision. Reading the ramps side by side makes those relationships explicit before a component is styled, which is far harder to judge from a documentation page showing one token at a time.\n\n- Limits: eight tokens, eleven generated steps each, no search, no copy buttons, no subtle or emphasis variants, and no dark-mode values.\n- As a bootstrap color palette reference it covers the bootstrap theme colors completely — the bootstrap color names are the framework's own and every bootstrap palette hex value is printed under its swatch, which is what the eight bootstrap css colors were always meant to be looked up for.",
    howTo: [
      { step: "Find the theme token you need — primary, secondary, success, danger, warning, info, light or dark." },
      { step: "Read the eleven steps in that block, from 50 at the lightest to 950 at the darkest." },
      { step: "Use the printed hex, or take the family's base value which is Bootstrap's own published colour." },
    ],
    whenToUse:
      "Use this when a project is built on Bootstrap and a theme colour's value is needed quickly, or when checking whether a pale step of a token works as a background. Use the Tailwind or Material references when a broader set of hue families is wanted. When the theme values should come from a brand palette instead of the framework's own, the {{bootstrap-color-exporter|bootstrap color exporter}} writes that block, and the state tokens that have to carry text are worth putting through the {{contrast-checker|contrast checker}}.",
    faqs: [
      {
        q: "Why only eight colours?",
        a: "Because Bootstrap's colour system is a set of semantic tokens rather than a wheel of hue families. The eight cover primary, secondary, the four status roles and two neutrals.",
      },
      {
        q: "Are the base values the framework's own?",
        a: "Yes — each token's base is Bootstrap's published theme colour. The eleven numbered steps are generated from those bases rather than copied from the compiled stylesheet.",
      },
      {
        q: "Where are the subtle and emphasis variants?",
        a: "They are not shown. The framework derives extra background, border and emphasis values from the same tokens, and this reference stops at the token plus its numbered ramp.",
      },
      {
        q: "Why do the light and dark ramps look so different?",
        a: "Because their bases sit at the ends of the luminance range. Pushing a near-white or a near-black base through a fixed lightness ladder moves it much further than it moves a mid-tone.",
      },
      {
        q: "Do the ramps extend each token's own scale?",
        a: "Each block is generated at fixed lightnesses in that token's hue and chroma, so it is a visual extension rather than Bootstrap's own subtle and emphasis values, which the framework derives differently.",
      },
    ],
  },

  "open-color-reference": {
    keywords: [
      "open color palette",
      "open color list",
      "opencolor palette",
      "open color hex codes",
      "open color shades",
    ],
    intro:
      "The Open Color palette reference lays out thirteen Open Color families — gray, red, grape, indigo, cyan and the rest — each as a ten-step ramp with hex values printed under every swatch.",
    content:
      "- Thirteen families are shown, one block each: gray, red, pink, grape, violet, indigo, blue, cyan, teal, green, lime, yellow and orange.\n- Each block holds ten tiles at the step labels 50, 100, 200, 300, 400, 500, 600, 700, 800 and 900, with the hex printed beneath each swatch.\n\nOpen Color's own convention numbers its shades from zero to nine rather than with Tailwind-style names, and this page relabels that same ten-value ladder as 50 through 900. That is worth knowing when comparing against the package: the order and the count match, the labels do not, so the shade a project calls nine appears here as 900.\n\nEach family is anchored on Open Color's published base: the gray at #868e96, the red at #fa5252, the grape at #be4bdb, the blue at #228be6, the teal at #12b886, the yellow at #fab005. Those are the framework's own values and the part of the page that can be used exactly as written. The ten steps above and below each anchor are generated here at fixed lightnesses, holding the base's hue and chroma constant, so they preview the ramp rather than reproduce the package's numbered values.\n\nThe set itself has a recognisable character that the stacked blocks make obvious. Open Color keeps its saturated hues fairly bright and its neutrals at a single family, which is why the grays here sit alone at one end of the list while most other frameworks ship two or three neutral ramps. It is also one of the few systems in this cluster that names a grape and a violet separately, which makes the purple region of the list worth reading closely when two similar purples are needed.\n\nIn practice this is a lookup for anyone using the package directly: find the family, pick the shade, read the value. It is also a practical way to see whether a project needs all thirteen families or whether four or five would carry the interface, since thirteen ramps in one scroll makes the redundancies plain.\n\nReading the families in order also shows where the set's gaps are. There is a single gray and no second neutral, so a project that needs both a warm and a cool grey will have to derive one; the pink and the grape are close enough that using both would be a mistake; and the lime and yellow ramps sit nearest to white at their pale ends, which makes them the weakest candidates for a light surface. Thirteen blocks make those judgements quick, and quick is what a reference page is for.\n\nLimits: no search, no copy buttons, no alpha values, no dark variants and no way to filter the list.\n\n- The open color list shows the framework's base values exactly, and every open color hex codes entry is printed under its swatch.\n- Read as an open color palette reference or as a shorthand opencolor palette chart, it is the whole system in one page with its ten open color shades per family.",
    howTo: [
      { step: "Scroll to the family you need — thirteen blocks from gray through orange." },
      { step: "Read the ten steps, relabelled here from 50 to 900 in place of the package's own numbering." },
      { step: "Take the hex printed under the step, or use the family's base colour if that is what you know." },
    ],
    whenToUse:
      "Use this when a project uses Open Color and a family's value is needed, or when comparing its thirteen families while narrowing a palette down. Use the Radix or Tailwind references when a system with alpha variants or a wider neutral range is wanted. Step spacing is the thing to compare against the {{radix-color-reference|Radix color reference}}, and a set of these shades that has to reach a stylesheet is the {{color-palette-css-exporter|color palette CSS exporter}}'s output.",
    faqs: [
      {
        q: "Why do the step labels not match the package?",
        a: "Open Color numbers its shades zero to nine. The ten steps are the same ladder in the same order, relabelled here as 50 through 900 for consistency with the other references.",
      },
      {
        q: "How many colour families are listed?",
        a: "Thirteen, including a single gray family rather than the several neutrals some frameworks ship, and separate grape and violet families.",
      },
      {
        q: "Are the hex values the package's own?",
        a: "Each family's base colour is; the ten numbered steps are generated from that base at fixed lightnesses, so they preview the ramp rather than reproduce numbered package values.",
      },
      {
        q: "Is there a way to copy a value?",
        a: "No. The hex is printed as text under each swatch, so values have to be selected by hand, and there is no search to jump between families.",
      },
      {
        q: "Which family is the neutral?",
        a: "gray — it is the only block in the set built for surfaces and text; every other family is a hue with a full ten-step ramp, so the palette's neutrals come from that single family.",
      },
    ],
  },

  "radix-color-reference": {
    keywords: [
      "radix color palette",
      "radix colors list",
      "radix ui colors",
      "radix color scale",
      "radix themes colors",
    ],
    intro:
      "The Radix color palette reference shows twelve Radix families — tomato, crimson, plum, violet, indigo and the rest — each as a ten-step ramp with the base hex and every step value printed.",
    content:
      "- Twelve families are laid out one block each: tomato, red, crimson, pink, plum, purple, violet, indigo, blue, cyan, teal and green.\n- Every block carries ten tiles with the hex printed under each swatch, and the step labels run 50, 100, 200, 300, 400, 500, 600, 700, 800 and 900.\n\nThe family names are the most distinctive thing about this reference and the reason it is worth having separately from the other colour-system pages. Radix names its families after objects as often as after hues — tomato, crimson, plum — and the tomato ramps towards orange-red in a way that a family called red would not. Anyone reading a Radix-themed interface runs into those names constantly, and this page is where they can be resolved into values.\n\nEach family is anchored on Radix's published base: tomato at #e54d2e, red at #e5484d, crimson at #e93d82, plum at #ab4aba, violet at #6e56cf, blue at #0090ff, teal at #12a594. Those anchors are the framework's own colours and can be used as they stand; the ten steps around each one are generated at fixed lightnesses from the base's hue and chroma, so they approximate the ramp rather than reproducing the package's published scale.\n\nTwo differences from the framework's real system are worth stating plainly, because both will be noticed by anyone who uses Radix every day. The published scale runs to twelve steps rather than ten, with the last steps reserved for text and borders against a coloured surface. And it ships alpha variants of every family for layering over images and gradients. Neither is present here: this is the hue family from pale to deep, which covers the common case of picking a colour and noting its value.\n\nUsed as a reference, the page pays off when a project needs to know what a family looks like before committing to it, or when two similar names — pink and crimson, plum and purple — have to be told apart. Twelve ramps stacked in one scroll also show how much of the system is spent on the cool half of the wheel.\n\nComparing the families is the other half of the use. Radix deliberately spaces its hues close together in the purple and pink region — plum, purple, violet and crimson sit within a few degrees of each other — and far apart in the greens and blues, which is a choice a reader only notices when the ramps are stacked. For a product that needs several distinguishable accents, that spacing is useful information before a palette is committed to, and it is easier to judge from twelve rows of tiles than from twelve separate pages of documentation.\n\n- Limits: no search, no copy buttons, no alpha variants, no twelve-step scale and no naming beyond the family itself, so a class or token name cannot be looked up here.\n- Within those bounds, as a radix color palette reference it delivers the radix colors list with each radix color scale printed in full, which is what anyone comparing radix ui colors or wiring radix themes colors needs from a lookup page.",
    howTo: [
      { step: "Find the family by its Radix name — tomato, crimson, plum and the rest." },
      { step: "Read the ten steps from 50 at the lightest to 900 at the darkest." },
      { step: "Note the hex for the step you need, or use the base colour that anchors the family." },
    ],
    whenToUse:
      "Use this when a project follows Radix and a family's name has to be resolved to values, or when comparing families before choosing one. Use the Radix colour exporter when the output needs to be a token file for a project rather than a reference to read. The nearest system to compare step spacing against is the {{open-color-reference|Open Color reference}}, and the measured lightness and chroma behind any ramp are what the {{palette-balance-analyzer|palette balance analyzer}} reports.",
    faqs: [
      {
        q: "Why are the families named after objects?",
        a: "That is Radix's own naming — tomato, crimson, plum and so on. It keeps similar hues distinguishable, and the tomato ramp sits further towards orange than a plain red would.",
      },
      {
        q: "Where are the twelve steps?",
        a: "Not on this page. The published scale runs to twelve, with the final steps intended for text and borders; this reference shows ten steps per family.",
      },
      {
        q: "Are alpha variants included?",
        a: "No. Radix ships translucent versions of every family for layering, and this reference covers only the solid ramp.",
      },
      {
        q: "Do the hex values come from the framework itself?",
        a: "Each family's base is Radix's published colour. The ten numbered steps are generated from it at fixed lightnesses, so they preview the ramp rather than copy the published scale.",
      },
      {
        q: "Do the families sit at the same lightness from step to step?",
        a: "Yes — every family is generated on the same lightness ladder, so step 500 in one family sits at the same lightness as step 500 in another, which is what makes cross-family comparison meaningful.",
      },
    ],
  },

  "ant-design-color-reference": {
    keywords: [
      "ant design color palette",
      "ant design colors list",
      "antd color palette",
      "ant design color names",
      "ant design palette hex",
    ],
    intro:
      "The Ant Design color palette reference covers twelve Ant families — volcano, gold, geekblue, magenta and the rest — each as a ten-step ramp with the anchor hex and every step value.",
    content:
      "Twelve families are shown, one block each: red, volcano, orange, gold, yellow, lime, green, cyan, blue, geekblue, purple and magenta. Each block holds ten tiles at the labels 50 through 900, with the hex printed beneath every swatch, and the families are ordered roughly around the wheel so the warm hues sit together and the cool ones follow.\n\n- The names are the reason this reference is worth its own page.\n- Ant Design uses poetic identifiers rather than plain hue words — volcano for a deep orange, geekblue for a blue-violet, and a gold that sits noticeably warmer than its yellow neighbour.\n- Reading an Ant interface or theme file means decoding those names, and this page decodes them into values: volcano at #fa541c, gold at #faad14, geekblue at #2f54eb, magenta at #eb2f96, blue at #1677ff.\n\nEach anchor above is Ant's own published colour for the family. The ten steps under it are generated here at fixed lightnesses with the base's hue and chroma held constant, which previews the ramp in the right hue while leaving individual steps short of a pixel-exact match with the compiled theme.\n\nOne convention differs from the framework and is worth noting. Ant's own scale numbers its steps from one to ten, with one at the lightest, and the framework's components reference those numbers directly. This page relabels the same ten-value ladder as 50 through 900 for consistency with the other references, so the shade Ant calls one appears here as 50.\n\nThe families also illustrate a habit of the system: it dedicates two blue families and two orange-adjacent ones, and it names a magenta that is closer to a pink than the name suggests. Seeing all twelve ramps stacked makes those distinctions clearer than reading the tokens one at a time, and it is the fastest way to decide whether a project needs geekblue and blue both.\n\nComparing families is where the stacked layout pays off. The orange and the volcano are close enough to be alternatives rather than companions, the gold and the yellow overlap through most of their ramps, and the two blues are separated by a clear step towards violet — which is exactly the distinction the naming exists to preserve. Anyone building a legend from four or five of these families can check the spacing before committing, and a set that looked reasonable as names can be seen to be too crowded as colours.\n\n- Limits: no search, no copy buttons, no alpha values, no dark-theme tokens and no mapping back to the framework's component variables, so a token name cannot be resolved here — only a family.\n- As an ant design color palette reference it provides the ant design colors list with every ant design palette hex value printed, the antd color palette decoded by name, and the ant design color names anyone working in the system actually sees.\n- The page is static data rather than a generated palette, so a value noted here is the same value on the next visit — which is what makes a reference dependable in the first place.",
    howTo: [
      { step: "Find the family by its Ant name — volcano, gold, geekblue, magenta and so on." },
      { step: "Read the ten steps, relabelled here from 50 to 900 in place of the framework's own numbering." },
      { step: "Note the hex under the step you need, or take the anchor colour the family is built on." },
    ],
    whenToUse:
      "Use this when a project uses Ant Design and a family name has to be turned into a value, or when comparing the framework's similar hues — blue against geekblue, gold against yellow. Use the Material or Bootstrap references when the system is a different one. A family that has to become tokens is the {{color-token-generator|color token generator}}'s job, and the step that will carry text is worth checking in the {{contrast-checker|contrast checker}}.",
    faqs: [
      {
        q: "What is geekblue?",
        a: "One of Ant's family names, for a blue-violet at #2f54eb. It sits between the framework's blue and purple and is a good example of why the names exist.",
      },
      {
        q: "Why do the step labels not match the framework?",
        a: "Ant numbers its steps one to ten with one at the lightest. The same ladder is relabelled here as 50 through 900 so the references on this site read consistently.",
      },
      {
        q: "Are the anchor colours the framework's?",
        a: "Yes — each family's base value is Ant's published colour. The ten numbered steps are generated from it at fixed lightnesses rather than copied from the compiled theme.",
      },
      {
        q: "Can I look up a component token here?",
        a: "No. The page decodes family names, not the framework's component variables, and there is no search or copy interaction.",
      },
      {
        q: "Do the generated steps line up with Ant's numbered palettes?",
        a: "Not exactly — each of the ten steps is generated at a fixed lightness in the family's hue, so the anchor is Ant's own value while the steps around it are this page's rendering rather than the framework's numbered tints.",
      },
    ],
  },

  "ibm-carbon-color-reference": {
    keywords: [
      "ibm carbon color palette",
      "carbon design colors",
      "carbon color tokens",
      "ibm color palette",
      "carbon palette hex",
    ],
    intro:
      "The IBM Carbon color palette reference shows eleven Carbon families — blue, cool-gray, warm-gray, magenta and the rest — each as a ten-step ramp with the anchor hex printed under every swatch.",
    content:
      "Eleven families are laid out one block each: blue, cool-gray, warm-gray, green, red, magenta, purple, cyan, teal, yellow and orange. Every block carries ten tiles labelled 50 through 900 with the hex printed beneath each swatch, so a family reads as a strip from its palest step to its deepest.\n\nThe neutrals are what make this reference distinctive. Carbon ships two of them, cool-gray at #697077 and warm-gray at #7c7975, and the difference between the two is small enough that it only becomes visible when both ramps sit side by side — one drifting blue, the other drifting yellow. Reading them here is more useful than reading their hex values, which look almost identical in isolation.\n\n- Each family is anchored on Carbon's published colour:blue at #0f62fe, green at #198038, red at #da1e28, magenta at #d12771, purple at #8a3ffc, teal at #009d9a, yellow at #f1c21b.\n- Those anchors are the framework's own values.\n- The ten steps around each are generated here at fixed lightnesses with the base's hue and chroma constant, so the ramps preview the family in the right hue rather than reproducing the framework's numbered scale exactly.\n\nOne naming difference is worth knowing. Carbon's tokens are labelled by role and step in the framework itself — a colour is identified by its family and a number that runs the other way from the usual convention, with lower numbers darker. This page normalises everything to 50 at the lightest and 900 at the deepest, so the number on a tile is not the number in a Carbon token.\n\nIn use the page suits anyone working in a Carbon-based interface who needs to see a family before choosing it, or who is mapping a design onto the token set and wants the anchors. Eleven ramps in one scroll also shows how strongly the system leans on blue and its two neutrals, with the warm hues kept to a smaller share of the palette.\n\nComparing the families shows the system's restraint. A large share of the hues is committed to blue and its two greys, the warm end is kept to a red, an orange and a yellow, and the magenta and the purple sit close enough together that a product would rarely need both. That distribution is deliberate in a design system built for dense enterprise interfaces, where a few dependable hues do more work than a wide wheel, and eleven ramps in one scroll make it legible in a way a token list never does.\n\nLimits: no search, no copy buttons, no alpha or dark-theme values, no role names and no mapping from the framework's token identifiers.\n\n- As an ibm carbon color palette reference it gives the carbon design colors, and every carbon palette hex value printed, in the order the families are published — enough to read the ibm color palette as one system and to resolve carbon color tokens back to actual colours.\n- Nothing here changes between visits: the eleven families are fixed data with their anchors built in, which is exactly what makes a reference worth consulting twice.",
    howTo: [
      { step: "Find the family you need — the two grays are first, then the saturated hues." },
      { step: "Compare the cool-gray and warm-gray ramps if the choice between them matters." },
      { step: "Read the hex printed under the step you want, remembering the labels are normalised here." },
    ],
    whenToUse:
      "Use this when a project follows Carbon and a family's values are needed, or when the two neutral ramps have to be compared directly. Use the Material or Bootstrap references when the system is a different one. Turning a family into tokens is what the {{color-token-generator|color token generator}} does, and the lightness and chroma figures behind the two greys are what the {{palette-balance-analyzer|palette balance analyzer}} reports.",
    faqs: [
      {
        q: "What is the difference between cool-gray and warm-gray?",
        a: "A small shift in hue direction — one leans blue, the other yellow. Both are near-neutral, so the difference is easiest to see with the two ramps side by side.",
      },
      {
        q: "Do the step numbers match Carbon's tokens?",
        a: "No. The labels are normalised to 50 at the lightest and 900 at the deepest, while the framework numbers its own steps in the opposite direction, so the numbers are not interchangeable.",
      },
      {
        q: "Do the anchor colours come from the framework?",
        a: "Each family's base value is Carbon's published colour. The ten numbered steps are generated from it at fixed lightnesses rather than copied from the framework's scale.",
      },
      {
        q: "Can I look up a role or token name?",
        a: "Not here — the page shows families and steps only, with no search and no mapping back to the framework's token identifiers.",
      },
      {
        q: "Are the anchors usable on their own?",
        a: "Yes — each family's anchor is the framework's published value, so it can be taken verbatim; the ten steps around it are previews at fixed lightnesses and are the part to treat as an approximation.",
      },
    ],
  },
};
