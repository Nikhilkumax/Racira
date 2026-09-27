import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 28.
 *
 * Two more design-system references (Fluent, Chakra) plus four tools verified against
 * their implementations before writing: the two-colour gradient overlay, the brand
 * role palette, the sRGB/CMYK gamut page and the print margin check, and the CSV
 * exporter.
 *
 * Notes carried into the copy rather than hidden: the colour gamut page cannot ever
 * report an out-of-gamut hex (a hex value is sRGB by definition) so its substance is
 * the CMYK approximation, and the print page tests the RGB margins rather than running
 * a colour-managed proof. Skipped in this batch: material-ui-color-exporter and
 * chakra-ui-color-exporter (both render the generic Tailwind class generator) and
 * color-temperature-analyzer (its kelvin figure is derived from a rotated hue, so the
 * number runs the opposite way to photographic colour temperature).
 */
export const SEO_BATCH_28: Record<string, ToolSeo> = {
  "fluent-ui-color-reference": {
    keywords: [
      "fluent ui color palette",
      "fluent design colors",
      "microsoft fluent colors",
      "fluent ui color names",
      "fluent palette hex",
    ],
    intro:
      "The Fluent UI color palette reference lists the twelve Fluent colour families — communication blue, navy blue, royal blue and the rest — each as an eleven-step ramp with hex values.",
    content:
      "Twelve families are shown, one block each: communication-blue, navy-blue, royal-blue, teal, green, dark-green, red, dark-red, magenta, purple, orange and yellow. Every block carries eleven tiles labelled 50 through 950 with the hex printed under each swatch, so each family reads as a strip from its palest step to its deepest.\n\n- The naming is the fingerprint of this system.\n- Fluent does not stop at blue: it ships three of them, and the difference between communication-blue at #0078d4 and royal-blue at #004e8c is not subtle once the ramps are side by side.\n- It also ships two of both red and green — a bright pair and a dark pair — so the second half of the list is worth reading closely when a UI needs a state colour that sits apart from the brand one.\n\nEach anchor above is a Fluent published colour. The eleven steps around it are generated here at fixed lightnesses, holding the base's hue and chroma constant, which previews the family in the right hue while leaving individual steps short of an exact match with a themed build of the framework.\n\nOne difference between this page and the framework is worth knowing about. Fluent's real system is delivered as role-based tokens with light and dark themes, where a colour is referenced by the job it does — a background, a border, a text colour — and the themes swap the underlying values. This page shows the raw families and their steps, so it answers what a named colour looks like rather than which token a component should use.\n\nIn use, the reference suits two jobs: resolving one of the framework's colour names into a value, and comparing the families before one is chosen. Twelve ramps in one scroll also makes the system's emphasis obvious — three blues and two each of red and green is a stronger commitment to those hues than most colour systems make.\n\nComparing the families is where the stacked layout earns its keep. The three blues are deliberately graded — royal darker than communication, navy darker still — so a product can move between them for states without leaving the blue family. The two reds and the two greens work the same way, and the magenta and the purple sit close enough that only one of them is usually needed. Seeing those gradations laid out makes it obvious which of the framework's colours are alternatives to each other and which are genuinely different roles.\n\nLimits: no search, no copy buttons, no alpha values, no light or dark theme variants and no token names, so a component's role cannot be looked up here.\n\n- Within those bounds, as a fluent ui color palette reference it gives the microsoft fluent colors in full — every fluent design colors family with its fluent palette hex values printed and the fluent ui color names exactly as the framework writes them.\n- The page is static apart from the swatches it paints: the same twelve families render on every visit, so a value noted today is the value tomorrow.",
    howTo: [
      { step: "Find the family you need; the blocks run from the three blues through to orange and yellow." },
      { step: "Read the eleven steps from 50 at the lightest to 950 at the darkest." },
      { step: "Take the hex printed under the step, or use the anchor colour that the family is built from." },
    ],
    whenToUse:
      "Use this when a project follows Fluent UI and a family's values are needed, or when the framework's three blues have to be compared. Use the Tailwind or Material references when a different system is in play. The two neutral ramps invite a direct comparison with the {{ibm-carbon-color-reference|IBM Carbon color reference}}, and a borrowed family that has to be formalised is what the {{design-token-generator|design token generator}} carries.",
    faqs: [
      {
        q: "Why are there three blue families?",
        a: "Because the framework ships them — communication blue, navy blue and royal blue — alongside a teal. The ramps make the difference between them visible where hex values alone do not.",
      },
      {
        q: "Do the step values come from the framework?",
        a: "The anchor colour of each family does. The eleven steps are generated at fixed lightnesses from that base, so they preview the ramp rather than reproduce a themed build's values.",
      },
      {
        q: "Where are the light and dark theme tokens?",
        a: "Not on this page. The framework delivers colours through role-based tokens that swap between themes, and this reference shows the raw families only.",
      },
      {
        q: "Can I copy the value from each swatch?",
        a: "No. Values are printed as text under each swatch, and there is no search or filter for the twelve blocks.",
      },
      {
        q: "Which family should carry the brand?",
        a: "Communication-blue is the product default and the other two blues are its darker registers, so the brand decision is usually already answered; the pair of reds and greens exist to keep state colours distinct from it.",
      },
    ],
  },

  "chakra-ui-color-reference": {
    keywords: [
      "chakra ui color palette",
      "chakra colors list",
      "chakra ui colors",
      "chakra color scale",
      "chakra palette hex",
    ],
    intro:
      "The Chakra UI color palette reference shows the ten Chakra colour families — gray, red, orange, teal, cyan, purple and the rest — each as an eleven-step ramp with the step values printed.",
    content:
      "- Ten families are laid out one block each: gray, red, orange, yellow, green, teal, blue, cyan, purple and pink.\n- Every block carries eleven tiles labelled 50 through 950 with the hex printed beneath each swatch, and each block begins with Chakra's published anchor for that family — the gray at #718096, the red at #e53e3e, the teal at #319795, the purple at #805ad5, the pink at #d53f8c.\n\nThe set is deliberately narrow compared with the frameworks that ship eighteen or nineteen families. Ten hues and a single gray is enough for a component library, and reading them stacked makes the reason clear: each family is far enough from its neighbours on the wheel that two of them used together will not be mistaken for each other, which matters more in a system consumed as props than in a palette meant for illustration.\n\nEach anchor value above is Chakra's own published colour. The eleven steps around it are generated here at fixed lightnesses with the family's hue and chroma held constant, which gives a preview of the ramp in the right hue while individual steps may differ from the framework's compiled palette.\n\nOne convention differs and is worth stating. The framework's own scale runs from 50 to 900 — ten values with no 950 — and its semantic props resolve through tokens on top of those steps. This page normalises the ladder to 50 through 950, eleven steps, so the darkest tile here has no counterpart in the framework and the step numbers are not interchangeable with prop names.\n\nWhere the page pays off is in choosing rather than in lookup: comparing the orange against the yellow before committing an accent, checking whether the gray is warm or cool enough to sit under a brand colour, or seeing how pale the fifty of a family actually is before using it as a surface. Ten ramps is a size that fits the eye at once, which the larger systems cannot manage.\n\nComparing the families is useful in the same way. The blue and the cyan are close enough that a legend should not carry both; the teal sits between the green and the cyan and can serve as either; the orange and the yellow are separated mostly by lightness rather than by hue. Because the set is small, those relationships are visible at a glance, and a palette that looks varied as a list of names can be seen to be crowded once the ramps are stacked together.\n\nLimits: no search, no copy buttons, no alpha variants, no semantic tokens and no 900-terminated scale.\n\n- As a chakra ui color palette reference it provides the chakra colors list complete with every chakra palette hex value printed, the chakra ui colors resolved by family name, and each chakra color scale readable in one row.\n- The ramps are fixed data rather than a generated palette, so two visits show the same ten families and the same anchor colours — which is the property a reference page needs, and the reason these values can be quoted rather than reproduced.",
    howTo: [
      { step: "Scroll to the family by name — ten blocks from gray through pink." },
      { step: "Read the steps from 50 at the lightest to 950 at the darkest." },
      { step: "Note the printed hex, or use the anchor colour that the family is anchored on." },
    ],
    whenToUse:
      "Use this when a project follows Chakra UI and a family's values are needed, or when comparing its ten families while choosing an accent. Use the Chakra exporter when the output should be component configuration rather than a reference to read. Step spacing is easiest to compare against the {{radix-color-reference|Radix color reference}}, and the alpha scales a ten-step ramp does not list are a single value away in the {{alpha-color-generator|alpha color generator}}.",
    faqs: [
      {
        q: "How many families are there?",
        a: "Ten plus a single gray, which is narrower than the frameworks that ship eighteen or more. Each family is spaced far enough from its neighbours to stay distinguishable.",
      },
      {
        q: "Why is there a 950 step when Chakra stops at 900?",
        a: "The scale is normalised here to eleven steps for consistency with the other references. The darkest tile has no counterpart in the framework, so the labels are not prop names.",
      },
      {
        q: "Are the hex values the framework's?",
        a: "Each family's anchor is Chakra's published colour. The eleven numbered steps are generated from that anchor at fixed lightnesses rather than copied from a compiled palette.",
      },
      {
        q: "Can I search for a token?",
        a: "No. The page shows families and steps only — there is no token lookup, no search box and no copy button.",
      },
      {
        q: "Why do the tiles get darker from left to right?",
        a: "The ramp runs on a fixed lightness ladder from 50 down to 950 while the hue stays constant, so direction is the lightness axis — which is also what makes two families comparable at a glance.",
      },
    ],
  },

  "gradient-overlay-generator": {
    keywords: [
      "gradient overlay generator",
      "two color gradient css",
      "gradient scrim css",
      "linear gradient angle",
      "overlay gradient hex",
    ],
    intro:
      "The gradient overlay generator builds a two-colour linear gradient with an adjustable angle, previews it on a large panel and writes the background declaration with a copy button.",
    content:
      "- Three controls drive the page: a From colour, a To colour, and an angle slider that runs from zero to three hundred and sixty degrees and opens at one hundred and thirty-five.\n- The endpoints start on a blue and a purple and the angle opens on a diagonal, so the page loads with a usable scrim rather than a flat swatch.\n\nThe preview is the same declaration the code panel prints: a linear gradient at the chosen angle between the two colours, applied to a tall panel. Because both stops sit at the extremes with no positions in between, the result is a straight interpolation between the endpoints, and the angle decides the direction — zero points up the page, ninety runs left to right, one hundred and thirty-five runs diagonally down to the right, and one hundred and eighty runs top to bottom.\n\nTwo details separate this from the gradient builders elsewhere in the domain. There are exactly two stops, so it is a tool for a single transition rather than for a multi-stop build; and both stops are fully opaque, so the output is a gradient scrim rather than a fade to transparency. A gradient overlay that should let the image show through needs a colour with an alpha value, which means editing the copied declaration or using the transparent gradient tool instead.\n\nThe generated CSS is a single background declaration rather than a whole element or a set of custom properties, which makes it easy to drop onto a pseudo-element. The two things worth checking before that: the angle's effect on a wide versus a tall element, since the same degree value reads differently as the box's aspect ratio changes, and the contrast of any text that will sit on the gradient, which is a pair of separate questions because the colour changes along the ramp.\n\nAs a gradient scrim css source the page is quick and predictable: pick the two ends, settle the direction, copy one line. It is a good fit for hero overlays, tinted cards where one corner should be stronger than the other, and any surface that needs a directional wash rather than a flat fill.\n\nChoosing the two ends is the part that rewards a little thought. Stops that are close in value produce a wash that reads as a single surface, which suits page backgrounds and card headers; widening the gap between them produces a visible diagonal, which suits a hero panel or a corner accent. Because the preview updates live, that judgement is made by eye rather than by guessing at hex values, and the angle can be settled at the same time — a gradient that looks right at one hundred and thirty-five degrees often reads as heavy-handed at zero, since the ramp then climbs the full height of the element.\n\n- Limits: two stops, one of them never transparent, no stop positions, no repeating gradients, no radial or conic form, no easing, and one copy button for the whole declaration.\n- Within those limits it is a dependable gradient overlay generator: a two color gradient css background at any linear gradient angle, and every overlay gradient hex value it uses is one you supplied.",
    howTo: [
      { step: "Set the From colour and the To colour." },
      { step: "Drag the angle slider and watch the panel — 0 points up, 90 runs right, 180 runs down." },
      { step: "Copy the background declaration and apply it to the element the gradient should wash over." },
    ],
    whenToUse:
      "Use this when a surface needs a two-colour directional wash and one line of CSS is the output. Use the transparent gradient generator when the ramp should fade out rather than end on a second colour, or the multi-stop gradient builder when more than two colours are needed. When it is the type rather than the surface that should carry a gradient, the {{text-gradient-generator|text gradient generator}} is the lettering version, and a ramp that dissolves to nothing at one end is what the {{transparent-gradient-generator|transparent gradient generator}} writes.",
    faqs: [
      {
        q: "How many colours can the gradient have?",
        a: "Two, at the ends of the ramp, with no stop positions in between. A third colour means using the multi-stop builder instead.",
      },
      {
        q: "Can one end be transparent?",
        a: "Not as generated — both stops are opaque. A gradient that fades out has to come from the transparent gradient tool, or from editing an alpha channel into the copied value.",
      },
      {
        q: "What does the angle do at 0 and 180?",
        a: "Zero degrees runs up the page and one hundred and eighty runs down it, with ninety going left to right. The visible direction depends on the shape of the element the gradient is painted into.",
      },
      {
        q: "Will text on the gradient stay readable?",
        a: "The tool does not check that. Contrast changes along the ramp, so test the text colour against both ends rather than against a middle value.",
      },
      {
        q: "Why does the page open on a diagonal?",
        a: "The slider opens at 135 degrees because that is the diagonal most scrims are built on — the ramp runs across the box rather than straight down, which is usually what a caption wants. Both colours and the angle are editable, so it is a starting point rather than a house style.",
      },
    ],
  },

  "brand-style-guide-generator": {
    keywords: [
      "brand style guide generator",
      "brand color palette from one color",
      "brand color roles",
      "brand palette hex",
      "color system generator",
    ],
    intro:
      "The brand style guide generator turns one colour into five named roles — primary, primary dark, accent, surface and text — each with its own hex value.",
    content:
      "- One colour field drives the page, and the result is a list of five rows: a swatch, a role name and a hex value.\n- The roles are primary, primaryDark, accent, surface and text, and each is derived by a fixed rule rather than chosen, so the set arrives complete and internally consistent the moment the base colour changes.\n\nThe rules are worth knowing because they explain what the output can and cannot be. Primary is the colour you entered, unchanged. Primary dark lowers its lightness by 0.15 with a floor so a near-black base cannot go further, while keeping the chroma and hue — that is the pressed or hovered version of the same colour rather than a different one. Accent keeps the lightness and chroma and rotates the hue by exactly one hundred and eighty degrees, producing the complementary colour as the second voice. Surface and text are theirs by construction: a near-white and a near-black built from the base's own hue, at very low chroma, which is what keeps a tinted paper and a tinted ink from looking grey next to the brand colour.\n\nThat construction is the value of the page. Most brand palettes assembled by hand end up with an accent that does not relate to the primary and a neutral that is either pure white or pure black, which reads colder than the rest of the set. Deriving five roles from one input removes those two decisions, and the result holds together because every role is a transformation of the same colour rather than an independent pick.\n\nBrand color roles are also the part of a style guide that gets used, which is why the page lists roles rather than a ramp. A ramp answers how light a shade should be; roles answer what each colour is for, and five named slots cover the majority of what an interface needs — a primary action, its pressed state, one supporting accent, a surface and a text colour.\n\nWhat it does not do is check the result. Nothing on the page measures the contrast between text and surface, between the primary and white, or between the accent and anything it might touch, and nothing warns when a base colour is so pale that the derived text role is the only one with usable contrast. It also does not export: the five values are shown as rows with hex printed, and taking them into a project means reading them.\n\nWorking through the roles in order is the quickest way to judge a candidate brand colour. A primary that arrives with a usable dark variant beside it and a vivid accent is a colour with range; one whose dark version is barely distinguishable from the primary, or whose accent lands on a hue nobody would use, is telling you the base needs adjusting. Because all five roles are recomputed on every change, cycling through three or four candidates takes seconds, and the decision gets made against the derived set rather than against a single swatch.\n\n- Limits: five fixed roles, no naming, no contrast checking, no export, no dark-mode counterpart and no way to add a role or override one of the derived values.\n- As a brand color palette from one color it is a small color system generator: enter a brand colour, read five brand palette hex values with their job attached, and use the brand style guide generator's arithmetic rather than deciding the relationships by hand.",
    howTo: [
      { step: "Pick the brand colour — this becomes the primary role." },
      { step: "Read the five rows: primary, primary dark, accent, surface and text, each with its hex value." },
      { step: "Change the colour to see the whole set move together, then take the values into the project." },
    ],
    whenToUse:
      "Use this when a project has a single brand colour and needs the roles around it decided consistently. Use the design token generator when the output has to be a token file, or the palette accessibility checker when the derived pairs need auditing. A wider set derived from the same single colour is what the {{single-color-to-full-palette|single color to full palette}} builds, and the same five roles packaged for code are the {{color-token-generator|color token generator}}'s output.",
    faqs: [
      {
        q: "How is the accent worked out?",
        a: "The hue is rotated by one hundred and eighty degrees while lightness and chroma stay the same, so the accent is the complement of your colour at the same weight.",
      },
      {
        q: "What are surface and text built from?",
        a: "The base colour's own hue at very low chroma — a near-white and a near-black. Deriving them from the brand colour keeps the neutrals from looking grey beside it.",
      },
      {
        q: "Are the five colours contrast checked?",
        a: "No. Nothing on the page measures the pairs, so a pale base can produce a primary that is unusable behind white text without any warning.",
      },
      {
        q: "Can I export the palette?",
        a: "Not from this page — the values are listed as rows with their hex codes and nothing else. A token or CSS export comes from the exporter tools.",
      },
      {
        q: "What happens when the base colour is very light or very dark?",
        a: "The derived roles follow the base, so an extreme one produces an extreme set — surface and text are the pair to check first, since they are the two that have to sit together most often. Nothing on the page measures that for you.",
      },
    ],
  },

  "color-gamut-checker": {
    keywords: [
      "color gamut checker",
      "srgb gamut check",
      "cmyk approximation",
      "is my color printable",
      "gamut warning color",
    ],
    intro:
      "The color gamut checker compares a colour against the sRGB space and prints its CMYK approximation, which is the number that decides whether a colour is likely to be printable.",
    content:
      "Pick a colour and the page returns three things: a large swatch, a gamut verdict against sRGB, and an approximation of the same colour in CMYK written as the familiar four figures. The layout puts the swatch on the left and the readings on the right, so the colour and its numbers are visible together.\n\n- One property of the tool is worth stating before anything else, because it explains the verdict: a hex value is an sRGB value by definition.\n- Any colour that can be typed into the field is inside the space being tested, so the gamut line reads In gamut for every valid input and an out-of-gamut warning cannot be produced from a hex code.\n- The reading that carries real information is the CMYK one beside it.\n\nThe CMYK figures are an arithmetic conversion from the same colour rather than a profile-based separation, so they approximate what a print process would produce rather than predicting it. What they are good for is spotting the colours that will not survive conversion: a vivid green or an electric blue typically arrives with one channel near a hundred percent and the others low, which is the shape of a colour that a four-ink process cannot reproduce.\n\nReading the conversion alongside the swatch is the practical use of the page. A brand colour chosen on screen can look entirely reasonable and then arrive with a CMYK breakdown that no coated stock will match, and seeing both at once makes that explicit before a print run rather than after. For screen-only work the same figures are a useful sanity check that a chosen colour is not sitting at the edge of what any process can show.\n\nWhat the page does not do is compare two spaces properly. There is no wide-gamut input, no oklch or P3 entry, no render intent and no soft-proof preview, so the honest reading is a screen value with its ink approximation attached rather than a colour-managed comparison.\n\nReading the conversion beside the swatch is the habit worth forming. The colours most likely to raise a flag in a real print workflow are the ones whose ink figures show a single channel close to full with the others low, and this page makes that pattern visible immediately rather than after a press check. A gamut warning color on screen is still only a warning, though: the figures here are arithmetic rather than profiled, so the practical use is to shortlist candidates and confirm the survivors with a proof instead of treating the reading as final.\n\n- Limits: one colour at a time, a verdict that valid inputs always pass, an arithmetic CMYK approximation with no profile, no print standard selection and no export beyond reading the figures.\n- Within those bounds, as a color gamut checker it answers is my color printable with a cmyk approximation to look at, and as an srgb gamut check it is at least explicit that the answer for any hex colour is yes.",
    howTo: [
      { step: "Pick the colour you want to check." },
      { step: "Read the gamut line and the CMYK approximation on the right." },
      { step: "Judge the ink figures — a channel near full alongside low others is the shape of a colour print cannot hold." },
    ],
    whenToUse:
      "Use this when a screen colour is heading for print and its ink approximation needs a first look. Use the print accuracy checker when the question is whether a colour sits too close to the ends of the range, or a profile-based tool when the conversion has to be accurate. The {{print-color-accuracy-checker|print accuracy checker}} is the tool for whether a colour sits too close to the ends of the CMYK range, and the {{cmyk-channel-mixer|CMYK channel mixer}} works the ink channels directly.",
    faqs: [
      {
        q: "Why does it always say In gamut?",
        a: "Because a hex colour is an sRGB value by definition, so it cannot fall outside the space being tested. The CMYK figures beside it are where the useful information is.",
      },
      {
        q: "Are the CMYK numbers a real separation?",
        a: "No — they are an arithmetic conversion from the same colour rather than a profile-based separation, so they approximate what a press would produce rather than predicting it.",
      },
      {
        q: "What does a high single channel mean?",
        a: "That the colour relies on one ink being almost fully saturated, which is the usual reason a vivid screen colour cannot be matched on paper.",
      },
      {
        q: "Can I check a wide-gamut colour?",
        a: "Not here. Only hex values can be entered, so there is no way to test an oklch or P3 colour that falls outside sRGB.",
      },
      {
        q: "Can a hex colour ever come back out of gamut?",
        a: "No. A hex value is an sRGB value by definition, so any colour that can be typed into the field is inside the space being tested and the verdict reads In gamut for every valid input. The reading that carries real information is the CMYK approximation beside it.",
      },
    ],
  },

  "print-color-accuracy-checker": {
    keywords: [
      "print color accuracy checker",
      "will my color print correctly",
      "cmyk color shift",
      "print safe colors",
      "screen to print color check",
    ],
    intro:
      "The print color accuracy checker converts a colour to CMYK and reports whether its channels sit far enough from the ends of the range to survive being printed.",
    content:
      "One colour field feeds the page, and the result is a card with three lines: the CMYK approximation of the colour, a label saying what it represents, and a verdict. The verdict is either Likely prints close to screen in green or May shift in print in orange, decided by a margin test on the colour's own channels rather than by a profile.\n\n- The test is simple and worth knowing exactly, because it explains both the verdicts and their limits.\n- Each of the red, green and blue values is checked for sitting between five and two hundred and fifty.\n- A colour well inside that band passes; a colour that pushes any channel below five or above two hundred and fifty is flagged, because those are the values a four-ink process handles worst — near-black shadows, near-white highlights and fully saturated hues all land there.\n\nThe CMYK figures above the verdict are an arithmetic conversion rather than a separation, so they describe the colour as ink percentages instead of predicting what a press will do with it. A colour reported as likely to print close to screen is one whose channels are comfortably inside the range; it is not a proof, and a real proof needs the ink, the stock and the press.\n\nThe practical use is early triage. Choosing between two candidates for a brand colour, a packaging tone or a printed accent is faster when one of them is flagged before artwork is produced. It is also a quick way to see why very saturated colours and very dark ones are the two groups that shift most often: both sit at the extremes the margin test is looking for.\n\nWhat the page will not do is model the shift. There is no preview of the paper result, no soft proof, no selection of a print standard and no indication of how far a flagged colour will move — a colour just outside the band and one far outside it receive the same sentence.\n\nUsing it as a first pass is straightforward: run the two or three candidates for a printed colour through the page and compare the verdicts. One that clears the margins and one that does not is a decision made early and for free, and the ink figures printed above the verdict give a rough sense of which channels the colour leans on. What a print color accuracy checker cannot do is promise a match, so the reading is best treated as a filter deciding which colours are worth a proof rather than as an answer in itself.\n\n- Limits: one colour at a time, a fixed margin rule rather than a profile, an arithmetic CMYK approximation, and no rendering intent, stock or ink selection.\n- As a screen to print color check it answers will my color print correctly with a caveat rather than a verdict — the honest reading of a cmyk color shift warning is that the colour is in the group most likely to move, so treat the print safe colors question as a first filter and confirm with a proof.",
    howTo: [
      { step: "Pick the colour that is heading for print." },
      { step: "Read the CMYK approximation and the verdict line beneath it." },
      { step: "Treat the orange verdict as a prompt to test a proof rather than as a prediction of how far the colour will move." },
    ],
    whenToUse:
      "Use this when a screen colour is being considered for print and you want an early warning before artwork is produced. Use the gamut page when the ink approximation itself is the question, or a profile-based tool when the conversion has to be relied on. The {{color-gamut-checker|gamut checker}} covers the same CMYK approximation from the gamut side, and the {{cmyk-channel-mixer|CMYK channel mixer}} works the ink channels directly.",
    faqs: [
      {
        q: "What decides the verdict?",
        a: "A margin test on the colour's channels: each has to sit between five and two hundred and fifty. Push any channel beyond that and the colour is flagged as likely to shift.",
      },
      {
        q: "Is this a soft proof?",
        a: "No. There is no preview of the printed result, no print standard and no ink or stock selection — the figures are an arithmetic conversion, not a colour-managed separation.",
      },
      {
        q: "Which colours get flagged most?",
        a: "Near-blacks, near-whites and fully saturated hues, because those are the values that push a channel to the ends of the range where a four-ink process struggles.",
      },
      {
        q: "Does a pass mean the printed colour will match?",
        a: "No. A pass says the channels are comfortably inside the range, which makes a shift less likely. Only a proof against the real press, ink and stock settles the question.",
      },
      {
        q: "Can it predict how the ink will actually look on paper?",
        a: "No. The verdict is a fixed margin rule around an arithmetic CMYK conversion rather than a profile-based separation: there is no paper preview, no soft proof, no rendering intent and no ink-limit modelling, so the reading is early triage rather than a press-accurate proof.",
      },
    ],
  },

  "color-csv-exporter": {
    keywords: [
      "color csv exporter",
      "palette csv export",
      "hex rgb csv",
      "export colors to csv",
      "palette spreadsheet",
    ],
    intro:
      "The color CSV exporter writes a palette as a comma-separated table with one row per colour — index, hex, red, green, blue and HSL — ready to copy or download.",
    content:
      "The page is a palette editor on the left and a CSV card on the right. The editor holds five colours by default — a blue, a purple, a red, a green and an amber — and they can be changed, added or removed before exporting. The card prints the generated text in a scrollable block with two controls beneath it: a copy button and a Download .csv button that saves a file named palette.csv.\n\nThe format is fixed and worth knowing before the file is opened:\n\n- The first line is a header row of six column names: index, hex, r, g, b and hsl.\n- Each following line is one colour, numbered from one, with its hex value in upper case and its red, green and blue channels as whole numbers from zero to two hundred and fifty-five.\n- HSL is written in the functional form a stylesheet would accept, and values are separated by commas with no quoting and no padding.\n\nThat shape is what makes the export useful rather than merely available. Spreadsheets open it with the header as column names, so a palette can be sorted, annotated with notes on where each colour is used, or handed to a reviewer who does not work in code. The same file drops into a design handoff without conversion, because the hex column and the HSL column hold values in the forms both sides already use.\n\nA small detail matters for anyone round-tripping the palette: the HSL figure is a formatted string, not three separate numeric columns, so sorting by hue in a spreadsheet means splitting that column first. The red, green and blue channels are separate, which makes them the practical columns for arithmetic or charting.\n\nWhat the page does not offer is a choice of format. The editor exports CSV only — no JSON, no SVG, no PNG card and no token file — and there is no column selection, no delimiter setting and no way to paste a palette in for re-export. The colours come from the editor or they do not come at all.\n\nThe practical case for a table rather than an image is that a table can be edited. A palette exported as CSV can be annotated with where each colour is used, sorted by hue after the HSL column is split, merged with a second palette to check for near-duplicates, or handed to a reviewer who works in a spreadsheet. That is a different job from exporting a swatch image for a document, and it is what a color csv exporter is for: the same colours in rows, with the numbers separated so they can be used rather than only looked at.\n\nLimits are worth knowing before the file leaves the page:\n\n- One palette and one format: this page exports CSV only — no JSON, no SVG, no PNG card and no token file.\n- Six fixed columns, with no column selection, no delimiter setting and no way to paste a palette in for re-export.\n- The HSL figure is a formatted string rather than three separate numeric columns, so sorting by hue in a spreadsheet means splitting that column first, where the red, green and blue channels are the practical columns for arithmetic or charting.\n\nRead plainly, as a hex rgb csv export with the palette spreadsheet use in mind, the file it writes is exactly the table described: an export colors to csv at one row per colour, and the simplest palette csv export on the site.",
    howTo: [
      { step: "Edit the palette in the left-hand card — the default five can be changed, added to or removed." },
      { step: "Read the CSV text in the right-hand card, which updates as the palette changes." },
      { step: "Copy the text or press Download .csv to save the file as palette.csv." },
    ],
    whenToUse:
      "Use this when a palette has to leave the browser as a table — a spreadsheet for review, a handoff to a designer or a check of the channel values. Use the SVG or PNG palette exporters when the output should be an image, or the palette importer when a list is coming back the other way. When the output should be an image instead, the {{color-palette-svg-exporter|SVG palette exporter}} produces vector markup and the {{color-palette-png-generator|PNG palette generator}} draws a strip; when a list comes back the other way, the {{palette-importer|palette importer}} is the way in.",
    faqs: [
      {
        q: "What columns does the CSV have?",
        a: "A header row of index, hex, r, g, b and hsl, then one line per colour with those six values in that order and no quoting.",
      },
      {
        q: "Can I export JSON instead?",
        a: "Not here — this page writes CSV only. JSON output comes from the JSON palette exporter, which is a separate tool in the domain.",
      },
      {
        q: "Why is HSL one column rather than three?",
        a: "It is written in the functional form a stylesheet accepts, so it arrives as a single value. Split the column in a spreadsheet if hue has to be sorted numerically.",
      },
      {
        q: "Is the file downloaded or shown?",
        a: "Both. The text is printed in a card with a copy button, and a second button downloads it as palette.csv.",
      },
      {
        q: "Which columns are best for arithmetic or charting?",
        a: "The r, g and b columns, because they are separate whole numbers. The hsl column is a formatted string, so it has to be split before it can be sorted or compared numerically.",
      },
    ],
  },
};
