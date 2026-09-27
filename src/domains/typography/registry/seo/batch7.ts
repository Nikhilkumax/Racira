import { PRIVACY_SECURITY_TEXT } from "../privacy";
import type { ToolSeoEntry } from "../tool-seo";

/** Racira Fonts SEO content — batch 7 (medium tier). */
export const typographySeoBatch7: Record<string, ToolSeoEntry> = {
  "multi-font-comparison": {
    keywords: [
      "multi font comparison",
      "canvas measurement",
      "sample width",
      "four slots",
    ],
    intro:
      "The multi font comparison sets one sample in four faces under identical size and weight, then reports what actually differs. Alongside the visual comparison it measures each family's rendering of the sample with the canvas API, so the judgement is made on width as well as on impression.",
    content:
      "The multi font comparison gives four slots to four faces, renders one shared sample in all of them at the same size and weight, and tables the measured result.\n\n- Four slots labelled A to D each take a family from the catalogue, and the default set pairs a sans, a serif, a grotesque and a monospace to show the comparison at its most useful.\n- The sample is a single shared paragraph, so every slot renders the same words and no slot gets an easier line than the others.\n- Size runs from 12px to 96px and weight from 300 to 700 in hundred-unit steps, both applied to all four slots at once.\n- The table reports each slot's family, its classification, the measured width of the sample in pixels, and that width as a percentage of the widest slot.\n- The side-by-side preview stacks the four renderings at a shared line height, each labelled with its slot letter and family name.\n\nThe measurement is the part that turns a preference into a comparison. The sample width column is a canvas measurement: each slot's sample is laid out through the canvas text API at the size and weight in force, so the browser's own shaping engine produces the figure rather than an average character width. A face that measures 88 percent of the widest at the same nominal size is either narrower in design or smaller in x-height, and that is exactly the difference a table of numbers reveals and a pair of screenshots hides. The practical consequence is space: on a fixed width a narrower face fits more characters and therefore reads at a longer measure, which changes whether the copy falls inside a comfortable line length. Setting all four at one size and weight is deliberate for the same reason, since varying either would make the widths incomparable.\n\n- Four slots are the limit, so a shortlist longer than that has to be run in two passes.\n- The measurement is of the sample string only, so a family that is narrow on the sample may still be wide on other text.\n- Every slot shares one size and weight, which is what makes the comparison fair and what prevents testing how each face behaves at its own best size.\n- The numbers are widths in pixels at the current setting, not ratios that hold across sizes.\n- Nothing reports the loaded font's own metrics, so a width difference cannot be attributed to x-height or character width specifically.\n\nUse it when a shortlist has to be narrowed on evidence rather than on taste, when a client asks why two faces at the same size look different, or when a face change is being proposed and the effect on line length needs checking first. The relative width column settles that argument in one reading. Where a pairing rather than a single face is the question, the font pairing suggester works on the relationship between two families, and where a stack has to be assembled for production, the brand font stack builder orders the fallbacks. The font previewer is the place to tune one face, the font pairing suggester covers pairing two of them, and the font specimen sheet gives any single face its own printed page.",
    howTo: [
      { step: "Paste the sample copy that matters, ideally a real sentence rather than a pangram, so the comparison reflects the words you will set." },
      { step: "Set the size and weight, which apply to every slot, then assign a family to each of the four slots." },
      { step: "Read the measured widths and the relative percentages in the table before looking at the renderings, so the numbers are not coloured by the visual." },
      { step: "Judge the four renderings against each other, then swap one slot at a time to work through a longer shortlist." },
    ],
    whenToUse:
      "Reach for it when a shortlist of faces has to be reduced on measured differences, when someone asks why two faces at the same size occupy different widths, or when a proposed face change has to be checked against the layout it will sit in. The relative column is the evidence. For a pair that has to work together rather than in competition, the {{font-pairing-suggester|font pairing suggester}} is the closer tool, the {{pangram-font-tester|pangram font tester}} checks alphabet coverage before a face is adopted, and the {{font-specimen-sheet|font-specimen sheet}} produces the printed page once the choice is made.",
    faqs: [
      {
        q: "How is the sample width measured?",
        a: "Through the canvas text API, which lays out the string with the browser's own shaping at the size and weight in force and returns its width in pixels. That makes the figure a real measurement of the rendered text rather than an estimate from average character widths, and it is why the table can compare four faces honestly.",
      },
      {
        q: "Why keep the size and weight the same across all four slots?",
        a: "Because a comparison is only meaningful when one thing varies. If each face were set at the size it suited best, the widths and the impressions would both differ for two reasons at once. Setting one size and one weight holds those constant so the remaining difference is the faces themselves.",
      },
      {
        q: "What does a lower relative percentage actually mean?",
        a: "That the face occupies less width for the same words at the same nominal size. That usually comes from narrower letterforms or a smaller x-height, and in a layout it means more characters per line, which lengthens the measure. Whether that is an improvement depends on where the measure lands, which is why the check pairs well with a line length target.",
      },
      {
        q: "Can I compare more than four faces?",
        a: "Not at once. Four slots is the limit, which suits a shortlist that has already been narrowed. For a longer list, run two passes and keep the best from each, or use the specimen sheet to look at faces one at a time before bringing the survivors into a single comparison.",
      },
      {
        q: "Do the figures change with the text?",
        a: "Yes, and that is the point of using your own copy. A sentence full of wide letters will favour a different face from one full of narrow ones, and a string of digits will behave differently again. Comparison on the actual copy is more informative than comparison on a pangram, which is why the sample is editable.",
      },
    ],
  },
  "variable-font-sliders": {
    keywords: [
      "variable font sliders",
      "optical size",
      "font variation settings",
      "registered property",
    ],
    intro:
      "The variable font sliders drive the real axes of the variable families this domain loads, one slider per axis, and report what each axis is doing. Optical size is the interesting one, since it changes the drawing of the face rather than its weight.",
    content:
      "The variable font sliders expose one control per axis for each variable family in the catalogue, render the sample at the resulting settings and export either form of the CSS.\n\n- Seven families carry variable axes here: five with a weight axis alone, and three that add an optical size axis, with one of those also offering a softness axis.\n- Weight runs from 300 to 700 in steps of ten, optical size ranges differ per family, and the softness axis runs from 0 to 100 in steps of five.\n- Every axis is driven through font variation settings in the preview, so moving a slider changes the rendering immediately.\n- Two CSS modes are offered: the raw tag form, and the registered properties form which writes font-weight and enables automatic optical sizing.\n- The axis reference table lists each tag, its name, its range and the registered CSS property that maps to it, and marks the axes that have no standard property at all.\n\nThe distinction the panel draws is the reason the tool exists. A raw tag list overrides everything it touches and does not participate in inheritance or the cascade, while a registered property behaves like any other CSS property and inherits properly. Weight has a registered property, optical size has one, width maps to font stretch, and italic maps to font style, but a custom axis such as softness has no property and can only be reached through the raw tag form. The optical size readout builds on the same idea: it compares the axis value with the actual type size and calls the pairing matched when the two are within a quarter of each other, because an optical size axis is designed to track the rendered size, and a face set at a display optical size in body text looks wrong in a way that is hard to name.\n\n- Only the axes declared for each family are exposed, so a variable file with an axis the domain does not request cannot be driven here.\n- The ranges come from the webfont request rather than from the file itself, so a face whose real range is narrower will clamp silently.\n- The preview always enables automatic optical sizing, which means the optical size slider and the rendered size interact.\n- Weight readouts are a number on an axis, not a named weight, so 500 here is not guaranteed to match the family's medium.\n- Nothing reports the file size cost of a variable family against a static subset of the same faces.\n\nUse it when a variable family is being evaluated, when an optical size axis needs understanding before it is used in production, or when a custom axis has to be seen before a design commits to it. The readout comparing the axis with the rendered size is the part that most often changes a decision. Where the axes have to be exported into a stylesheet for the whole family, the CSS variable font builder writes the full set, and where the axis ranges need to be read out of a file, the variable font axis exporter does that. The CSS variable font builder produces the declarations, the variable font axis exporter reads real axis ranges from a file, and the font rendering preview covers how the result rasterises at small sizes.",
    howTo: [
      { step: "Choose the variable family, which resets the sliders to that family's defaults and shows how many axes it declares." },
      { step: "Move each axis slider and watch the sample, remembering to compare the optical size readout against the type size as you change it." },
      { step: "Switch the CSS mode and compare the two forms, then read the axis table to see which of the axes has no registered property." },
      { step: "Copy the exported CSS and prefer the registered properties wherever the table lists one, since they inherit." },
    ],
    whenToUse:
      "Reach for it when a variable family is being assessed before it is adopted, when an optical size axis needs to be seen at several sizes, or when a custom axis such as softness has to be justified to a reviewer. The size against axis readout settles the last of those quickly. For production declarations the {{css-variable-font-builder|CSS variable font builder}} writes the whole family, the {{variable-font-axis-exporter|variable font axis exporter}} reads the real ranges out of a file rather than from the request, and the {{font-previewer|font previewer}} is the tool for judging a static setting instead.",
    faqs: [
      {
        q: "Why prefer the registered properties over raw tags?",
        a: "Because they behave like normal CSS. A registered property such as font-weight or font-optical-sizing inherits, participates in the cascade, and can be changed by a media query without disturbing other axes, whereas a raw tag list replaces the entire axis state at once and overrides whatever else was set. The raw form is for axes with no standard property, such as softness.",
      },
      {
        q: "What is optical size actually changing?",
        a: "The drawing of the face, not its scale. A variable family with an optical size axis carries a set of design parameters that shift from text proportions to display proportions, with the counters opening and the strokes thinning as the size grows. That is why setting a display optical size in body copy looks subtly wrong rather than obviously broken.",
      },
      {
        q: "Why does the readout call a pairing mismatched?",
        a: "Because it compares the axis value with the rendered size and flags them as mismatched when they differ by more than a quarter of the size. With automatic optical sizing enabled the two normally track each other, so a mismatch means the axis has been moved by hand away from what the size would choose. Sometimes that is deliberate, and the readout is the record of it.",
      },
      {
        q: "Do all seven families have the same axes?",
        a: "No. Five of them expose only a weight axis, two add optical size, and one carries a third softness axis on top of both. The axis count is reported for whichever family is selected, and the sliders are rebuilt when the family changes, so the control set always matches the file being tested.",
      },
      {
        q: "Is a variable font always the lighter choice?",
        a: "Not necessarily. A variable file carries every weight and axis, so it is usually heavier than a single static face and lighter than the set of statics it replaces. The tool does not weigh the file, so the trade has to be made on the real figures: one variable file against the three or four weights a design actually uses.",
      },
    ],
  },
  "contrast-pairing-checker": {
    keywords: [
      "contrast pairing checker",
      "typographic contrast",
      "style axes",
      "wcag contrast",
    ],
    intro:
      "The contrast pairing checker evaluates two type treatments against both kinds of contrast that decide whether they can be told apart. Colour contrast is measured with the WCAG formula, and typographic contrast is counted across the axes that a pair can differ on.",
    content:
      "The contrast pairing checker takes two type treatments, a shared background and a text size class, then reports both a measured contrast ratio for each treatment and the number of style axes on which the two differ.\n\n- Each treatment carries a family, a colour, a weight from 300 to 800 and a size from 10px to 96px, so weight and size differences can be expressed as well as colour.\n- The background is shared, which is what makes the two ratios comparable, and each treatment's WCAG contrast against it is measured with the relative-luminance formula.\n- Four verdicts are reported: each treatment against the AA and AAA thresholds, at the body level of 4.5 and 7 to 1 or the large-text level of 3 and 4.5 to 1.\n- Four style axes are counted: family classification, weight, size and colour, and the count of those that differ is reported out of four.\n- The pairing verdict calls the pair distinguishable when at least two axes differ, and too similar when fewer do.\n\nThe reason both measurements are needed is that passing WCAG says nothing about hierarchy. Two faces at the same size and weight in similar greys can clear 4.5 to 1 comfortably and still read as a mistake, because the reader cannot tell which of them is the heading. The style axes count is the answer to that: a pair that differs on classification and weight is separated by shape and mass, while a pair that differs only in colour is relying on a difference that disappears in a grayscale print or for a reader with reduced colour vision. The measurement table sets the two kinds of evidence side by side, with the four WCAG verdicts on the upper rows and the four axes on the lower ones, and the note states plainly that typographic contrast is a count rather than a ratio.\n\n- The axis count treats each difference as equal, so a family change and a twenty-per-cent size change score the same.\n- Contrast is measured against one flat background, so a treatment over a gradient or an image is not represented.\n- The large-text class is a manual toggle rather than derived from the treatment sizes, so it has to be set deliberately.\n- Only two treatments are compared, so a three-level hierarchy has to be checked as three separate pairs.\n- Nothing evaluates the result in grayscale or under a colour-vision deficiency, which is the case where a colour-only separation fails.\n\nUse it when a heading and a subheading look too alike, when a design relies on colour alone to separate two roles, or when a pair has to be defended on both accessibility and hierarchy grounds at once. The two-part table is the quickest way to show which is actually failing. Where only the colour needs measuring, the contrast text checker does that with its luminance breakdown, and a whole palette belongs to the color on color text checker. The contrast text checker measures a single pair precisely, the color on color text checker covers a whole palette, and the font accessibility evaluator scores the wider set of text criteria for one specification.",
    howTo: [
      { step: "Enter the sample text and set each treatment's family, colour, weight and size, and the background they share." },
      { step: "Set the text size class, since the AA and AAA thresholds change between body text and large text." },
      { step: "Read the two ratios and their verdicts in the measurement table, then check the four style axes for what actually differs." },
      { step: "If the verdict is too similar, change an axis the reader can perceive without colour, such as weight or size, and measure again." },
    ],
    whenToUse:
      "Reach for it when two roles look too similar on a page, when a design separates hierarchy by colour alone and needs the risk shown, or when a pair has to satisfy an accessibility review and a design review at the same time. The table gives one answer for each. For the colour measurement alone, the {{contrast-text-checker|contrast text checker}} is the narrower tool, a full palette belongs to the {{color-on-color-text-checker|color on color text checker}}, and the {{font-accessibility-evaluator|font accessibility evaluator}} covers contrast, spacing and reflow for one specification.",
    faqs: [
      {
        q: "Why is passing WCAG not enough for a pairing?",
        a: "Because the contrast rule asks whether text can be read, not whether two roles can be told apart. Two treatments in similar greys at 4.6 to 1 are both legible and both look like the same level of the hierarchy. The style axes count answers the second question, which is why the tool reports both rather than choosing one.",
      },
      {
        q: "What counts as a style axis that differs?",
        a: "Four things: the family classification, the weight, the size and the colour. Each is compared between the two treatments, and the count of differences is reported out of four. Classification differences are the most durable because they survive grayscale, size changes and any loss of colour vision, which is why at least two differing axes is the threshold for a readable hierarchy.",
      },
      {
        q: "Why is a colour-only difference a weakness?",
        a: "Because it disappears in circumstances the design cannot control. Printed in grayscale, viewed by a reader with reduced colour vision, or rendered on a screen with a strong colour cast, two treatments that differ only in hue can become identical. Weight and size differences survive all three, so they are the safer way to separate levels.",
      },
      {
        q: "Does the size class change the measured ratio?",
        a: "No, the ratio is a property of the two colours. What changes is the threshold it is compared against: body text needs 4.5 to 1 for AA and 7 to 1 for AAA, while large text needs 3 and 4.5 to 1. The toggle exists because the tool cannot know from the treatment sizes alone whether the design intends the text to count as large.",
      },
      {
        q: "Can I compare three levels at once?",
        a: "Not directly. The tool evaluates a pair, so a three-level hierarchy is checked as heading against subheading, then subheading against body, and then heading against body if the two are far enough apart. Each pair is quick, and the intermediate comparison is the one that usually reveals the problem.",
      },
    ],
  },
  "font-style-contrast-analyzer": {
    keywords: [
      "font style contrast analyzer",
      "stylistic axes",
      "contrast score",
      "pairing role",
    ],
    intro:
      "The font style contrast analyzer scores two faces on five stylistic axes and reports the difference as a profile rather than a single verdict. Pairings work when they differ deliberately on one or two axes and fail when they differ on none or on all five.",
    content:
      "The font style contrast analyzer compares two faces across five stylistic axes, totals the differences and reports both a score out of a hundred and the verdict that follows from it.\n\n- The five axes are serif character, stroke contrast, width, weight and warmth, each scored from zero to five where zero is neutral and five is a strong expression of the axis.\n- Profile values are recorded per family in the catalogue, so the comparison runs on reference values rather than on an assumption drawn from the classification.\n- A pairing role can be set to heading and body, interface and editorial, or display and text, since the role context changes how much contrast is desirable.\n- The contrast score is the total difference across the five axes expressed as a percentage of the maximum, so it is comparable between pairings.\n- The verdict bands run from identical profiles through subtle contrast, clear contrast and extreme contrast, with advice attached to the extremes.\n\nWhat the score measures is deliberate difference rather than quality. Identical profiles are reported as a pairing that will read as a mistake, because two faces that agree on every axis give the reader no signal about which is which. A total difference of three or less is called subtle contrast: harmonious, and dependent on weight or colour to separate the roles. The clear range runs to eight, and above that the verdict warns of a strong voice clash that has to be intentional. The role selector changes the reading of the same number, because a heading and body pairing tolerates far more contrast than an interface and editorial split, where similarity is what makes the two feel like one product rather than two. The table reports the per-axis differences with a bar for each face, so the profile is visible rather than only the total, and the rendered pair sets the second face at half the first's size and states that ratio explicitly.\n\n- The profiles are reference values recorded for comparison, not metadata read from the font files.\n- Warmth and serif character are qualitative properties given numbers, so two judges could score the same face differently.\n- Five axes are covered, so details such as terminal shape, figure style and the spacing of individual pairs are outside the model.\n- The score treats every axis as equally important, so a difference in warmth counts the same as a difference in stroke contrast.\n- The rendered pair uses a fixed half-size relationship, so the sizes are demonstrated rather than optimised.\n\nUse it when a pairing looks wrong and the cause needs locating on a specific axis, when two faces have to be compared on something other than classification, or when a team wants to argue about a pairing with a shared scale rather than adjectives. Where the comparison is about whether the roles can be told apart at all, the contrast pairing checker counts the axes a reader can perceive. The font harmony visualizer plots the same kind of profile with an emphasis on x-height, the contrast pairing checker adds the colour measurement, and the font pairing suggester turns the profiles into a shortlist.",
    howTo: [
      { step: "Choose face A for the stronger role and face B for the supporting one, then set the pairing role to match the context." },
      { step: "Read the five per-axis differences in the table rather than only the score, since one large difference and five small ones are different situations." },
      { step: "Compare the total against the verdict bands and read the advice, which differs between the subtle and the clear ranges." },
      { step: "Check the rendered pair at the stated ratio, then adjust sizes if the score points to a separation the reader cannot perceive." },
    ],
    whenToUse:
      "Reach for it when a pairing looks slightly wrong and the axis responsible needs identifying, when two faces have to be compared beyond their classification, or when a design discussion needs a shared scale rather than opinions. For the perceptual side of the same question, the {{contrast-pairing-checker|contrast pairing checker}} measures colour and counts visible differences, the {{font-harmony-visualizer|font harmony visualizer}} emphasises x-height agreement, and the {{multi-font-comparison|multi font comparison}} measures the faces against each other at one size.",
    faqs: [
      {
        q: "What makes a contrast score good or bad?",
        a: "Neither extreme is good. Identical profiles mean the reader cannot tell the roles apart, and a very high total means the two faces have no shared language and the page reads as two designs. The working range is clear contrast, which is a total difference of about four to eight across the five axes, plus one deliberate divergence in the right place.",
      },
      {
        q: "Why does the role selector change the interpretation?",
        a: "Because different pairings want different amounts of separation. A heading and body pairing needs enough contrast that the hierarchy is obvious, while an interface and editorial pairing usually wants similarity, so that a help article and the product around it read as one thing. The same score can therefore be right in one role and wrong in another.",
      },
      {
        q: "Where do the profile numbers come from?",
        a: "They are reference values recorded per family for comparison, not metadata extracted from the font files. That makes them consistent between sessions and comparable across faces, at the cost of precision: a face scored four on warmth is warmer than one scored two, but the figures are not measurements.",
      },
      {
        q: "What should I do when the verdict says subtle contrast?",
        a: "Separate the roles by something other than the faces, which is what the advice column suggests: a weight difference, a colour difference, or a larger size jump. A pairing in the subtle band is harmonious and perfectly workable, provided the hierarchy is carried by another decision, and the same applies to two treatments that share a family.",
      },
      {
        q: "Can the score be compared between different pairings?",
        a: "Yes, that is what expressing it as a percentage of the maximum makes possible. Two candidate pairings can be scored and the two totals compared directly, which turns a subjective choice into a bounded one. What the comparison cannot say is which pairing suits the content, only how far apart the two faces are.",
      },
    ],
  },
  "font-pairing-suggester": {
    keywords: [
      "font pairing suggester",
      "rule based scorer",
      "brief fit",
      "ranked shortlist",
    ],
    intro:
      "The font pairing suggester scores every heading and body combination in the catalogue against three rules, ranks them and shows its reasoning. It is a shortlist machine rather than an oracle: it removes the combinations that fail structurally and leaves the choice to the preview.",
    content:
      "The font pairing suggester scores every ordered pair of faces in the catalogue against a brief, then returns a ranked shortlist of eight and previews the top three.\n\n- Five briefs are offered: editorial and long-form reading, product interface, brand and marketing, technical documentation, and a warm humanist brief.\n- Each candidate pair is scored by a rule based scorer, and every ordered combination is evaluated rather than a hand-picked list.\n- The first rule adds three points when the two faces differ in classification, because the roles have to read apart before anything else matters.\n- The second rule scores the brief fit: a serif or display heading suits an editorial page, a sans or monospace heading suits a product or technical one, and the warm brief spreads its favour more evenly.\n- The third rule removes a monospace heading outside a technical brief and adds a point for a display heading, since display faces are expressive by design.\n\nThe shortlist is the useful part, and the reasoning column is what makes it arguable rather than opaque. Each row states why it ranked, either naming the classification difference and the brief fit or admitting that the two faces share a classification and would have to be differentiated by weight instead. Only eight pairs are shown from the full set of ordered combinations, and clicking a heading face in the table loads that pair into the preview below, where the heading sample and the body sample are rendered together at their respective sizes. Each row also reports its score, so the gap between the top suggestion and the fifth is visible and a close score can be treated as a tie to be judged visually.\n\n- The rules are structural and simple: they say nothing about how the two faces look together on the page.\n- Classification comes from the catalogue's own labels, so a face whose label is broad, such as a serif that behaves like a display face, is scored on the label rather than on its behaviour.\n- The scorer ranks heading and body roles only, so caption, interface and quotation roles are outside it.\n- Weights, sizes and measures are not considered, so a pair that scores well can still be set badly.\n- Eight suggestions are shown from the full set, and the underlying order is broken by score rather than by diversity, so a shortlist can contain similar combinations.\n\nUse it when a project needs a pairing quickly and the alternatives keep collapsing into the same handful of familiar combinations, or when a client wants the reasoning behind a pairing rather than an assertion. The why column is what makes the second case work. Where an editorial pair has to be chosen deliberately rather than suggested, the serif and sans pairing tool presents curated combinations with their rationale, and where a display and body pairing is the shape of the brief, the display body pairing tool reports the size ratio. The serif sans pairing tool and the display body pairing tool cover those two shapes directly, the multi font comparison measures faces against each other, and the heading and caption pairing covers the third role a page usually needs.",
    howTo: [
      { step: "Choose the brief that describes what the page is for, which re-scores every combination immediately." },
      { step: "Read the shortlist from the top, paying more attention to the why column than to the scores." },
      { step: "Click a heading face in the table to load that pair into the preview, then judge it on the heading and body samples together." },
      { step: "Take the two or three pairs that survive the preview and set them at real sizes before deciding, since the ranking is structural rather than visual." },
    ],
    whenToUse:
      "Reach for it when a pairing is needed quickly, when the shortlist keeps producing the same familiar combinations, or when the reasoning behind a pairing has to be shown to someone else. Where the brief is editorial and the choice should be deliberate, the {{serif-sans-pairing-tool|serif sans pairing tool}} presents curated combinations with their rationale, the {{display-body-pairing-tool|display body pairing tool}} covers a hero line against body copy, and the {{font-harmony-visualizer|font harmony visualizer}} shows how the chosen faces sit together across several roles.",
    faqs: [
      {
        q: "How many combinations are actually scored?",
        a: "Every ordered pair of faces in the catalogue with no face paired with itself, which is the count reported in the results box. The shortlist is the top eight of those. Because it is an exhaustive scan rather than a curated list, a suggestion can surface that no one would have typed into a search.",
      },
      {
        q: "Why does the first rule reward a classification difference?",
        a: "Because the fastest way for two roles to read apart is for the two faces to be visibly different in kind, and hierarchy that relies only on size is easier to lose. A serif heading over a sans body separates by shape as well as by size, so the pairing survives being set at sizes closer together than you intended.",
      },
      {
        q: "What happens when both faces share a classification?",
        a: "The pair is still scored, but the reasoning column says so plainly and suggests differentiating by weight instead. That is a legitimate approach, and it is the one most single-family systems use. The suggester reports it rather than hiding it, so a same-classification pair is visible as a deliberate choice rather than a scoring accident.",
      },
      {
        q: "Can I trust the ranking as a quality judgement?",
        a: "Not as a quality judgement, because the scorer knows nothing about how the faces look together. It knows classification and the brief, which is enough to remove combinations that fail structurally. The preview of the top three is where the real decision happens, and a lower-scoring pair that previews well is a better answer than the top one.",
      },
      {
        q: "Why does a monospace heading lose points outside a technical brief?",
        a: "Because a monospaced heading makes a specific promise about the content, namely that it is code or data. Outside a technical brief that promise is wrong, and no amount of spacing will make it read as a general heading. The penalty is a way of encoding that judgement rather than a statement about monospace design.",
      },
    ],
  },
  "font-harmony-visualizer": {
    keywords: [
      "font harmony visualizer",
      "metric profiles",
      "x-height agreement",
      "divergence",
    ],
    intro:
      "The font harmony visualizer plots two families against five shared metrics and shows where they align and where they diverge. Harmony is not sameness: a pairing usually needs the x-heights close so the text sits on the same optical line, plus one or two deliberate divergences elsewhere.",
    content:
      "The font harmony visualizer compares two faces across five metrics and reports which axes they share, which diverge, and whether the resulting pairing reads as harmonious.\n\n- Five axes are compared on a reference scale of zero to ten: x-height, width, stroke contrast, apparent weight and warmth.\n- Each catalogue face carries a metric profile, so the comparison works from recorded values rather than from an assumption about the classification.\n- A pair is harmonious when the x-height agreement is close and exactly one or two other axes diverge deliberately.\n- If the x-heights differ by more than one point the verdict tells you to set the sizes by eye rather than by number.\n- No divergence at all is reported as too alike, since a pairing with no axis of separation has no hierarchy.\n\nThe x-height rule is the one that matters most in practice. Two faces at the same nominal size look unequal when their lowercase bodies are different heights, so a pairing with mismatched x-heights has to be corrected by nudging one of the sizes rather than by trusting the numbers in the stylesheet. The visualizer responds to that directly: the rendered pairing sets the body sample at a scaled size derived from the heading size, so the correction can be seen rather than calculated. The metric table then explains each axis in terms of its consequence, from an identical score described as no separation on that axis, through a difference of up to two points described as close enough to read as a system, to a difference of four or more warned about as a strong divergence that the pairing has to hold together some other way. The total divergence across all five axes is reported as a figure out of fifty, which gives a sense of how far apart the two faces are overall rather than axis by axis.\n\n- The metric profiles are reference values on a ten-point scale rather than measurements taken from the font files.\n- Only five axes are covered, so details such as serif shape, terminal angle and the contrast of the figures are outside the model.\n- Warmth is a subjective axis that has been given a number for comparison, not a measurable property.\n- The rendered pairing scales the body sample from the heading size using a fixed ratio, so it demonstrates a correction rather than reporting the optimal one.\n- Two faces are compared at a time, so a three-face system is checked as three pairs.\n\nUse it when a pairing looks slightly wrong and the reason needs identifying, when two faces with different x-heights have to be reconciled, or when a design team wants a shared vocabulary for why a pairing works. The consequence column is the part that turns numbers into decisions. Where the pairing has to come from a shortlist, the font pairing suggester scores every combination, and where the two faces are being judged on measured width, the multi font comparison reports it. The font pairing suggester generates candidates, the multi font comparison measures their widths, and the contrast pairing checker covers whether the two roles can be told apart at all.",
    howTo: [
      { step: "Choose the two faces, then enter a heading sample and a body sample so the pairing is judged on real text as well as on metrics." },
      { step: "Read the x-height agreement first, since a difference greater than one point is what forces sizes to be set by eye." },
      { step: "Check the shared and diverging axis readouts, aiming for exactly one or two deliberate divergences." },
      { step: "Compare the rendered pairing against the scaled sizes, then set the two sizes in the design to match what the correction shows." },
    ],
    whenToUse:
      "Reach for it when a pairing looks subtly wrong and the cause needs naming, when a project has two faces with different x-heights and the body size needs correcting, or when a team wants a shared reason for why one pairing works and another does not. The consequence column is what makes the vocabulary stick. For generating the shortlist the {{font-pairing-suggester|font pairing suggester}} is the starting point, the {{multi-font-comparison|multi font comparison}} measures candidate widths, and the {{serif-sans-pairing-tool|serif sans pairing tool}} covers the heading and body arrangement directly.",
    faqs: [
      {
        q: "Why do the x-heights have to match?",
        a: "Because the x-height is what the eye registers as the size of lowercase text. Two faces set at the same nominal size with different x-heights look like different sizes, so the smaller-bodied face has to be set larger to sit optically level. The rule reported here is a difference of more than one point on the scale, beyond which the sizes have to be adjusted by eye.",
      },
      {
        q: "Why is no divergence a problem?",
        a: "Because two faces that agree on everything give the reader no signal about which is which. Harmony comes from a shared framework with one or two deliberate differences, such as identical x-heights and warmth but contrasting stroke contrast. When nothing diverges, the roles have to be separated by weight or size alone, which the verdict reports as too alike.",
      },
      {
        q: "Where do the metric values come from?",
        a: "They are reference profiles recorded per family on a ten-point scale, not values read out of the font files. That makes them comparable across faces and consistent between sessions, at the cost of precision. Where a real figure is needed rather than a comparison, the font file itself has to be inspected.",
      },
      {
        q: "What does the total divergence figure mean?",
        a: "It sums the differences across all five axes, so it expresses how far apart the two faces are overall. A low total with matching x-heights and one clear divergence is the harmonious case; a high total means the faces differ on most axes, which can still work as a deliberate contrast but has to be held together by tone.",
      },
      {
        q: "Why is the body sample scaled from the heading size?",
        a: "Because that is the correction the x-height mismatch calls for. Setting the body text at a size derived from the heading demonstrates what the two faces look like once they sit on the same optical line, so the adjustment can be checked visually instead of calculated. It is a demonstration of one correction rather than a calculation of the best one.",
      },
    ],
  },
  "google-fonts-pairing-picker": {
    keywords: [
      "google fonts pairing picker",
      "curated pairing",
      "stylesheet request",
      "preconnect",
    ],
    intro:
      "The Google Fonts pairing picker offers six curated pairings from the catalogue, each with the exact stylesheet request it needs, the two custom properties to paste and the size ratio that suits its role. It is the shortest path from a pairing decision to working code.",
    content:
      "The Google Fonts pairing picker takes one of six curated pairings and a handful of settings, then emits the stylesheet link block, the custom properties and the role rules the pairing requires.\n\n- The six pairings cover distinct roles: a high-contrast display serif over a neutral grotesque for editorial and luxury work, a soft optical-size serif with a technical sans for brands, a large x-height serif with a geometric sans for documentation, a slab over a geometric sans for marketing, two warm faces for a blog, and condensed display caps over a documentary serif for magazines and news.\n- Each pairing carries a note describing why it works, from the contrast between voice and neutral through to the harmonious case where both faces share a tone.\n- The weights to request are chosen from four options, from a single 400 through to four weights, which is what keeps the stylesheet request to the weights the design actually uses.\n- The body size runs from 12px to 24px and the heading-to-body ratio from 1.2 to 4, with the heading size derived by multiplication rather than set separately.\n- The stylesheet request is generated from the pair and the chosen weights, with a display value of swap so the fallback renders while the file loads.\n\nThe emitted link block is the part that saves the most time, because it includes the two preconnect hints alongside the stylesheet request. The font host serves CSS from one domain and font files from another, so the preconnect to the stylesheet host alone leaves the font connection to be opened later; naming both is what removes the extra round trip. The request itself is built in the multi-family form, which fetches both families in one request rather than two, and the weights are limited to the ones selected, since a request that asks for every weight is the commonest cause of a bloated font payload. The CSS then declares two family properties and two size steps, so the heading size follows from the body size and the ratio instead of being set independently and drifting when one of them changes.\n\n- Six pairings are offered, all drawn from this domain's catalogue, so a pairing outside that set is not represented.\n- The request is built for the Google Fonts host, so a self-hosted or alternative provider needs the URL replaced.\n- Weights are chosen from four presets rather than one at a time, so an unusual weight combination has to be edited after copying.\n- The sizes are reported in pixels, so a rem-based system has to convert the two values.\n- Nothing checks whether the pairing suits the content, and the roles named for each pair are a guide rather than a rule.\n\nUse it when a pairing has been chosen and the code is needed quickly, when a self-hosted setup is being migrated to a hosted one, or when the weight list in an existing request needs trimming. The preconnect pair is usually the difference between a fast and a merely acceptable first paint. Where the pairing still has to be chosen, the font pairing suggester ranks every combination in the catalogue, the serif and sans pairing tool presents the editorial arrangement with its rationale, and the Google Fonts CSS generator covers the full set of rules for a family once the pairing is settled. The font pairing suggester generates candidates, the Google Fonts CSS generator writes the family rules, and the font loading strategy builder covers the loading sequence around the request.",
    howTo: [
      { step: "Choose the curated pairing whose role matches the project, then read its note to confirm the reasoning fits." },
      { step: "Set the body size and the heading ratio, watching the derived heading size in the results box." },
      { step: "Select the weights to request, keeping the list to the weights the design uses rather than requesting the whole family." },
      { step: "Copy the link block into the document head and the custom properties into the stylesheet, then check that both preconnects went in." },
    ],
    whenToUse:
      "Reach for it when a pairing is settled and the code is the next step, when a request needs its weight list trimmed, or when a migration from self-hosted files to a hosted stylesheet is being done. Where the pairing is still open, the {{font-pairing-suggester|font pairing suggester}} ranks the combinations, the {{serif-sans-pairing-tool|serif sans pairing tool}} covers the editorial arrangement, and the {{font-loading-strategy-builder|font loading strategy builder}} plans what happens before the file arrives.",
    faqs: [
      {
        q: "Why are there two preconnect hints?",
        a: "Because the stylesheet and the font files are served from different hosts. The first preconnect opens the connection to the stylesheet host, and the second, which carries the cross-origin attribute, opens the one the font files come from. Without the second, the browser only discovers the font host after parsing the stylesheet, which costs an extra round trip on the first visit.",
      },
      {
        q: "Why limit the weights in the request?",
        a: "Because each weight is a separate font file inside the returned CSS, and only the ones the design uses are worth downloading. Requesting the whole family is the most common cause of a font payload that is several times larger than it needs to be. The weight presets exist so the request can be matched to the design without editing the URL by hand.",
      },
      {
        q: "What does the display value do?",
        a: "It decides what the reader sees while the font file is arriving. Swap renders the fallback immediately and replaces it when the file lands, which is why the generated request uses it: text is never invisible, and the cost is a single reflow. The alternative values trade that reflow for a period of blank or fallback text, and the trade is set out in the web font tester.",
      },
      {
        q: "Can I use the generated CSS without the link block?",
        a: "Yes, since the two are independent. The CSS declares the family properties and role rules and works with any source of the font files, including self-hosted ones. If the files are self-hosted, drop the link block and add an at-rule instead, which is what the declaration builder produces.",
      },
      {
        q: "Why is the heading size derived rather than set?",
        a: "Because a ratio holds the relationship when either value changes. If the body size moves from 16px to 18px, a derived heading follows it and the hierarchy stays the same, while a heading set independently would silently change its proportion. The two size steps are written as properties for the same reason.",
      },
    ],
  },
  "paragraph-width-optimizer": {
    keywords: [
      "paragraph width optimizer",
      "characters per line",
      "average glyph width",
      "canvas api",
    ],
    intro:
      "The paragraph width optimizer measures the real measure — the characters per line a column actually produces — by measuring the sample text with the Canvas API instead of assuming an average glyph width. Counting characters in the abstract is the error it exists to avoid.",
    content:
      "The paragraph width optimizer answers one question with a measurement rather than an estimate: how many characters per line does this text, in this face, at this size, inside this container actually produce.\n\nThe measurement works by drawing the sample string to a canvas at the chosen size and face, reading its width, and dividing by the character count and the size to get an average glyph width in em. The container width divided by that average gives the characters per line, which is why the number changes when the face changes instead of staying fixed.\n\nFour inputs are involved, and each one moves the answer.\n\n- Face, chosen from the catalogue, because a condensed face fits roughly a quarter more characters into the same box than a wide one at the same size.\n- Size, from 12 to 32 pixels, which scales the average glyph width directly.\n- Container width, from 240 to 1600 pixels, which is the variable being optimised.\n- Line height, from 1.1 to 2.4, which does not change the measure but decides whether a wide measure is comfortable.\n\nThe verdict bands are the part that translates the number into a decision. Under 30 characters a column is very narrow and needs hyphenation to avoid rivers; 30 to 44 suits mobile body copy and multi-column print; 45 to 75 is the standard reading band; 76 to 90 is wide and wants more leading; and beyond 90 characters only large display text survives, never running copy. The tool also reports the container width that would put the measure at 66 characters — the middle of the comfortable band — and an approximate line count for the text you pasted, derived from its length and the measured measure.\n\nSeveral honest limits come with a measurement taken through the Canvas API, and they are worth stating before the number is quoted.\n\n- The sample has to be real: measuring a placeholder string returns the average width of those characters rather than of your prose.\n- The measurement uses the face and size selected in the tool, so a page that loads a different font at a different size will measure differently from the readout.\n- The line count is an approximation rather than a layout, since it multiplies the text length by a factor instead of breaking lines.\n- The Canvas API measures one run of text, so letter-spacing, word-spacing and any justification applied in the page are outside the calculation.\n- Nothing measures the container itself, so a max-width that a grid or a flex rule overrides still has to be confirmed in the browser.\n\nThe output is a small rule — a max-width in pixels with its em and character equivalents in comments, plus the line height — which is the practical way to hold a measure in place while the container around it stays fluid. The rule belongs on the paragraph rather than on the page, which keeps the measure intact when a sidebar takes part of the row. Pair it with the leading the line height optimizer derives and the column stops being a guess at every breakpoint.",
    howTo: [
      { step: "Paste a real paragraph rather than a placeholder, since the average glyph width is measured from the characters you supply." },
      { step: "Choose the face and size, then set the container width and watch the characters-per-line readout rather than judging the column by eye." },
      { step: "Read the verdict against the band table and, if the measure is outside the comfortable band, jump to the ideal container width the tool reports." },
      { step: "Copy the max-width rule and adjust the line height for the measure you settled on." },
    ],
    whenToUse:
      "Reach for it when a column is noticeably hard to read and the cause has not been diagnosed, when a design has to hold a measure across a fluid layout, or when a condensed face is being chosen and the extra characters per line it brings need to be quantified. Measuring rather than counting is the point. For the leading that pairs with the measure, the {{line-height-optimizer|line height optimizer}} derives it from the character count; the {{css-clamp-calculator|CSS clamp calculator}} handles the fluid container, and the {{type-scale-generator|type scale generator}} supplies the font size the measure depends on.",
    faqs: [
      {
        q: "Why not just count characters instead of measuring?",
        a: "Because counting assumes an average character width, and the average belongs to the face. A condensed face fits about a quarter more characters into the same box than a wide one at the same size, so the same container produces 55 characters in one face and 70 in another. Only measuring the real face gives a number that means anything.",
      },
      {
        q: "What does the average glyph width readout tell me?",
        a: "It is the width of an average character as a fraction of the em, measured from your sample in the chosen face at the chosen size. It is the factor that converts container width into characters per line, and comparing two faces at the same size shows the difference a design decision is buying.",
      },
      {
        q: "Is the line count exact?",
        a: "No. It multiplies the length of the pasted text by a factor and divides by the measured characters per line, which is an estimate rather than a line break. Treat it as a sanity check on how tall the paragraph will be, not as a layout prediction.",
      },
      {
        q: "Why does the tool report an ideal container width as well?",
        a: "Because 66 characters sits in the middle of the comfortable band, and the width that produces it is the target for the layout. The tool derives that width from the measured average glyph, so it changes with the face and the size rather than being a fixed pixel value.",
      },
      {
        q: "Does the measurement use my website's font?",
        a: "Only if it is one of the catalogue faces and it is available to the browser in this page. A webfont that has not loaded, or a face the page does not have, falls back to a local substitute and the measurement describes that substitute instead. Check the rendered sample before trusting the number.",
      },
    ],
  },
  "font-character-extractor": {
    keywords: [
      "font character extractor",
      "unicode-range",
      "subsetting",
      "unique characters",
    ],
    intro:
      "The font character extractor reduces a body of copy to the unique characters it contains and to the compact unicode-range notation a subsetter takes. It is the input step of subsetting, not a font reader.",
    content:
      "The font character extractor works from text rather than from a font file. You paste the copy the font has to cover, choose whether whitespace counts, and the tool returns the distinct characters, a category breakdown, and a collapsed unicode-range list. That range list is the compact form a subsetting step consumes, and it is also what a @font-face unicode-range descriptor needs when a face is split across several files.\n\n- Whitespace handling: exclude, which is the default and the recommended setting for ranges, or include.\n- Readouts: unique characters, ranges produced, UTF-8 payload in bytes, astral code points, and the reduction against full Latin-1.\n- Category table covering lowercase letters, uppercase letters, digits, punctuation and symbols, and whitespace.\n- Outputs: the extracted character string, the unicode-range list, and a characters-plus-summary block.\n\nThe range collapse is straightforward but decisive: the distinct code points are sorted ascending and any run where each value is exactly one above the last is merged into a single start-end range. A paragraph of ordinary English typically reduces to a handful of ranges, which is far shorter than the character list and directly usable as a descriptor. Two numbers keep the result honest. The UTF-8 payload counts encoded bytes with TextEncoder, so a page of accented letters is visibly heavier than the same page in plain ASCII. The astral count reports code points above U+FFFF, because those are the ones a subsetter or an older toolchain is most likely to mishandle. The reduction percentage compares the distinct count against the 191 printable Latin-1 code points, which is a useful reminder of how much of a font a normal page never touches. A page that reuses a small character set stays cheap; one that mixes scripts pulls hundreds more code points into the list.\n\n- It reads paste, not fonts. There is no cmap lookup, so it cannot tell you which characters a file actually contains — only which ones your copy needs.\n- Code points, not grapheme clusters. A combining mark is a separate character here, and an emoji built from several code points counts as several.\n- Ligatures and composed sequences are invisible to it: \"fi\" is two characters, and no shaping is modelled.\n- The reduction figure uses printable Latin-1 as its baseline, so it describes that comparison rather than a real font's glyph count.\n- Ranges describe coverage, not order: the list is sorted by code point, not by first appearance in the text.\n\nUse it as the first step whenever a face is too heavy for what a page renders: paste the real copy, excluding whitespace, and take the range list to whatever performs the subset. The same list is useful without subsetting at all, because splitting a large family into a Latin file and an extended file is done with unicode-range descriptors. When the copy includes symbols, the special character picker and the Unicode block explorer help assemble the exact characters, and the character code converter is the quick way to check a code point before it goes into a range.",
    howTo: [
      { step: "Paste the copy the font must cover into the source text area." },
      { step: "Leave whitespace on exclude for a range list, or switch to include when spaces are part of what you are counting." },
      { step: "Read the panel: unique characters, ranges produced, UTF-8 payload and any astral code points." },
      { step: "Copy the unicode-range list, or the characters-plus-summary block when the character set itself is the deliverable." },
    ],
    whenToUse:
      "This is the page to visit before cutting a font down to size, because the range list it produces is the specification a subsetter follows. When the characters themselves need finding rather than counting, the {{unicode-character-explorer|Unicode character explorer}} and the {{special-character-picker|special character picker}} are the places to look them up, and the {{unicode-block-explorer|Unicode block explorer}} explains which ranges a script lives in. Code points that need converting between notations go through the {{character-code-converter|character code converter}}, and the list this tool produces is what a {{font-face-generator|@font-face generator}} or a split family uses as its unicode-range descriptor.",
    faqs: [
      {
        q: "Does this read my font file?",
        a: "No. It works from pasted text and never opens a font binary, so it reports the characters your copy uses rather than the glyphs the file contains. Reading a file's real coverage is a different job.",
      },
      {
        q: "Why exclude whitespace by default?",
        a: "Range lists are usually built to describe visible coverage, and including a space pulls the range wider for no benefit. Switch to include when the character count itself is what you are reporting.",
      },
      {
        q: "How is the unicode-range list built?",
        a: "Distinct code points are sorted and any consecutive run is merged into a start-end pair, so a few ranges stand in for the whole set. That is the notation subsetters and unicode-range descriptors both accept.",
      },
      {
        q: "What does the astral code point count mean?",
        a: "It counts characters above U+FFFF, which need two UTF-16 units. They are the ones most likely to break in a toolchain that assumes one unit per character, so the count is worth watching.",
      },
      {
        q: "Why is the reduction percentage measured against Latin-1?",
        a: "Printable Latin-1 is 191 code points, a familiar yardstick for how much of a font a page actually exercises. It is a comparison figure, not a claim about the glyph count of any particular file.",
      },
    ],
  },
  "font-license-inspector": {
    keywords: [
      "font license inspector",
      "webfont serving",
      "spdx identifier",
      "audit checklist",
      "manifest entry",
    ],
    intro:
      "The font license inspector states what the common font licences permit — webfont serving, app embedding, modification and redistribution — and walks a project's fonts through an eight-point audit. It does not read terms out of a font binary.",
    content:
      "The font license inspector answers the question that decides whether a font can ship: what does its licence allow? It presents a comparison of the licence families fonts are actually released under, each with its SPDX identifier and a per-permission answer, plus a checklist for auditing the fonts already in a project and a manifest entry that records the result next to the asset. You choose a licence, name the font being audited and work through the checklist; the panel reports the SPDX identifier, whether webfont serving and app embedding are permitted, whether modification and subsetting are allowed and what attribution is required.\n\n- Licence families compared: SIL Open Font License 1.1 (OFL-1.1), Apache License 2.0, Ubuntu Font Licence 1.0, MIT/Expat, Freeware or unknown terms, and commercial desktop-licensed fonts.\n- The comparison table carries four permission columns — webfont serving, app embedding, modification and redistribution — and any row can be selected to load its terms.\n- Audit checklist, eight items: whether the source is recorded, whether the licence file is stored beside the font, whether webfont serving is explicitly allowed, whether app embedding is covered, whether modification and subsetting are permitted, whether a modified font has been renamed, whether attribution is in place, and whether the terms are recorded in the project's asset manifest.\n- Progress and status readouts: a count of completed items and a status that reads audit complete, in progress, or not yet audited.\n- Manifest output: a JSON entry with the family, source, version, licence name and SPDX identifier, three boolean permission flags and the expected licence file path.\n\nThe answers differ in exactly the ways that catch teams out. OFL-1.1 permits commercial use, webfont serving and modification, but a derivative must use a different reserved name and the licence must travel with the font. Apache-2.0 is permissive with an explicit patent grant and asks for the notice file plus a statement of changes. MIT is rare for fonts but occasionally used for small releases. Freeware and unknown terms are treated as an unknown: the tool answers \"check the readme\" rather than implying a right. A commercial desktop licence typically covers design use only, with webfont serving and app embedding sold as separate grants — which is precisely the situation where a project ships a font it never had permission to serve. The manifest entry exists so that question is answered once, in the repository, instead of being re-researched wrongly by the next person who touches the asset.\n\n- Six licence families are covered, not the whole SPDX list. Anything unusual has to be read directly.\n- It cannot detect a font's licence. Terms live in the accompanying licence file, not in a name table, and no file is opened here.\n- The manifest flags are derived from the selected licence family, so an answer such as \"check the readme\" produces a false permission rather than a verdict.\n- Checklist state lives in the page only and resets on reload, so the completed audit is the manifest entry, not the ticks.\n- It is a reference, not legal advice, and licences get amended — the LICENSE file that shipped with the font is the authority.\n\nTreat it as the pre-flight check before a font is self-hosted or bundled: select the licence, read the permissions that matter for the delivery, then record the outcome in the manifest so the decision survives the project. The narrower engineering questions that follow — how the declaration is shaped, how heavy the file is and how much of the alphabet is actually needed — belong to the font CSS generator, the font base64 encoder and the character extractor. If the audit concludes the font is not distributable, the pairings and stacks built from system and open faces are where the design continues.",
    howTo: [
      { step: "Select the licence the font ships under and name the font being audited." },
      { step: "Read the permission readouts for webfont serving, app embedding, modification and attribution before touching any asset." },
      { step: "Work through the eight audit questions, leaving the ones you cannot answer unchecked." },
      { step: "Copy the manifest entry into the project's asset record, replacing the source and version placeholders with the real values." },
    ],
    whenToUse:
      "Open it before self-hosting a font or bundling one into an app, because those are the two cases where a desktop licence is not sufficient on its own. The engineering work that follows depends on the answer: how the declaration is written is the {{font-css-generator|font CSS generator}}'s job, how the file is delivered is the {{font-base64-encoder|font base64 encoder}}'s, and how large the delivered file needs to be is what the {{font-character-extractor|font character extractor}} establishes before any subset is cut. When a licence permits modification, the {{font-face-declaration-builder|@font-face declaration builder}} is where the modified file's declaration and metric overrides get written.",
    faqs: [
      {
        q: "Can the tool tell me the licence of a font file I have?",
        a: "No. Licence terms live in the accompanying licence file rather than in the font's tables, and this tool opens no binary at all — it is a reference for the terms plus an audit checklist for what you already know.",
      },
      {
        q: "Is a free download the same as permission to use it on a website?",
        a: "No, and that is the most common misunderstanding the tool is built to interrupt. Freeware often grants no redistribution and no webfont embedding, and a commercial desktop licence typically covers design use only.",
      },
      {
        q: "What does OFL-1.1 require if I modify a font?",
        a: "Derivatives must use a different reserved name and the licence must travel with the font. Renaming after modification is one of the audit questions for exactly that reason.",
      },
      {
        q: "Why record a manifest entry instead of just storing the licence file?",
        a: "The manifest states the decision in machine-readable form — which permissions were relied on and where the licence file lives — so the next person to touch the asset does not have to repeat the research or guess.",
      },
      {
        q: "Does the checklist save my progress?",
        a: "No. The ticks are page state and reset on reload; the durable output is the manifest entry you copy out. Completing the ticks is the ritual, the entry is the record.",
      },
    ],
  },
  "variable-font-axis-exporter": {
    keywords: [
      "variable font axis exporter",
      "font-variation-settings",
      "woff2-variations",
      "registered property",
    ],
    intro:
      "The variable font axis exporter writes the complete CSS contract for a variable face: the @font-face with its weight range, the axes as custom properties, and the rendering rules that use a registered property wherever one exists.",
    content:
      "The variable font axis exporter produces the three pieces of CSS a variable font needs: a @font-face whose descriptors describe the axes, a set of axis tokens as custom properties, and the rules that apply them. You choose a reference family, name the CSS family, give the font URL, set the weight range descriptor — and optionally a width range — then export. The axis table is the part worth reading before copying: it states which axes can be driven by a standard property and which can only be reached through font-variation-settings.\n\n- Reference families with declared axes: Fraunces (wght 300-700, opsz 9-144), Source Serif 4 (wght 300-700, opsz 8-60), Inter (wght 300-700) and DM Sans (wght 300-700, opsz 9-40), each with its default.\n- Registered-property axis catalogue: wght through font-weight, wdth through font-stretch, opsz through font-optical-sizing, ital through font-style: italic, and slnt through font-style with an oblique angle.\n- Custom-only axes in the catalogue: GRAD -200 to 150, SOFT 0 to 100 and WONK 0 to 1, none of which have a standard property.\n- Outputs: the variable @font-face with format(\"woff2-variations\"), an axis token block, and a custom-axis rule when any exported axis lacks a registered property.\n- Sample text and size, up to 120px, previewed with the reference family's own axes.\n\nThe distinction the tool is built around is cascade. An axis with a registered property — weight, width, optical size, italic, slant — is reachable through ordinary CSS, so it inherits, animates and responds to media queries like any other declaration. An axis without one can only be set through font-variation-settings, which overrides everything for that axis, including inheritance, and is not interpolated the same way by every engine. That is why the exported token block names each axis as a custom property with its range in a comment and then applies the registered ones through their real properties, leaving font-variation-settings for exactly the axes that have no alternative. The @font-face describes the weight range you supplied, which is what allows a browser to instance any weight in that range from a single file.\n\n- The axis list is declared, not read. It comes from the built-in table for the four reference families, so the export describes any variable font only after you replace the family name, URL and ranges by hand.\n- The weight and width descriptors are free text. Nothing validates them against the file's real fvar table.\n- The slant descriptor is written as a fixed oblique angle range when that axis is present, rather than following the axis values.\n- It exports CSS only — no font file is produced, opened or modified.\n- The preview drives the catalogue family's real axes, so what you see is that family, not the font you are describing.\n\nThe natural use is a design system that ships one variable file and wants predictable, cascading control over it: export the contract, replace the placeholders with the real asset details, and keep the tokens in one place so weight and optical size are changed by name rather than by magic numbers. For exploratory work on the same file, the variable font sliders are the faster way to feel the axes, and the CSS variable font builder is the page for assembling the surrounding typographic system. Whichever route the CSS takes, the character extractor's range list is what keeps the delivered file small.",
    howTo: [
      { step: "Pick the reference family whose axes match the font you are describing." },
      { step: "Set the CSS family name, the font URL and the weight range descriptor, and add a width range if the file has one." },
      { step: "Type sample text and set a size to see the axes move using the reference family." },
      { step: "Copy the @font-face, then the axis tokens and custom-axis rule, and replace the placeholder family and URL with the real asset." },
    ],
    whenToUse:
      "Choose it when one variable file has to be driven by name across a whole interface and the exported contract is going into a design system. If the goal is to explore what the axes do before committing to CSS, the {{variable-font-sliders|variable font sliders}} are quicker, and the {{css-variable-font-builder|CSS variable font builder}} places the same file in a wider typographic system. Every axis the contract exposes should be explainable to whoever maintains it, which is what the tokens and the registered-property notes are for. Where several faces have to be declared side by side, the {{font-css-generator|font CSS generator}} handles the family-wide case, and the {{font-loading-strategy-builder|font loading strategy builder}} decides when the variable file is fetched.",
    faqs: [
      {
        q: "Why does the export prefer font-weight over font-variation-settings?",
        a: "font-weight is a registered property, so it inherits and animates like any CSS value. font-variation-settings overrides the axis outright and is not interpolated identically across engines, so it is kept for axes with no registered property.",
      },
      {
        q: "Does it read my font's axes?",
        a: "No. The axis table comes from the built-in reference families. The export then describes any variable font once you replace the family name, URL and ranges with the real values.",
      },
      {
        q: "What does format(\"woff2-variations\") mean in the output?",
        a: "It is the format hint for a variable WOFF2 file. Browsers that support variations use it as written; the descriptor is what pairs the file with the ranges declared above it.",
      },
      {
        q: "Why do some axes get called custom-only?",
        a: "Axes such as GRAD, SOFT and WONK have no CSS property that maps to them, so the only way to set them is font-variation-settings. The exported rule collects those axes in one place rather than scattering overrides.",
      },
      {
        q: "Can I animate these axes?",
        a: "Animating font-weight is smooth on a variable file. Animating font-variation-settings is not interpolated the same way in every engine, which is the other reason the registered properties come first.",
      },
    ],
  },
  "font-glyph-png-exporter": {
    keywords: [
      "font glyph png exporter",
      "png contact sheet",
      "canvas",
      "webfont",
    ],
    intro:
      "The font glyph PNG exporter draws chosen characters into a canvas with the browser's own text engine and exports the sheet as a PNG. Because the live renderer does the drawing, the image carries the real shaping, kerning and antialiasing of the font.",
    content:
      "The font glyph PNG exporter takes a face and a string of characters and returns a PNG contact sheet of those glyphs. You pick from the preview catalogue, type the characters to export, set the glyph size, the column count and the padding per cell, choose background and ink colours, and the canvas redraws immediately. The panel reports how many glyphs were drawn, the canvas dimensions, an estimate of the PNG's byte weight and the background setting, and the download button saves the file with a slug derived from the family name.\n\n- Faces: every family in the preview catalogue, labelled with its name and kind.\n- Glyph size from 16px to 320px, in steps of 4, defaulting to 120px.\n- Columns from 1 to 12, defaulting to 6, and padding per cell from 0 to 80px, defaulting to 16px.\n- Background and ink are direct colour inputs; the default is a white sheet with near-black ink.\n- Characters are deduplicated and spaces are skipped, so the sheet holds one cell per distinct visible glyph.\n- Readouts: glyph count, canvas size in pixels, PNG size estimate and whether the background is still the default white.\n\nThe sheet is laid out arithmetically. A cell is the glyph size plus twice the padding, the canvas width is the cell multiplied by the column count, and the height is the cell multiplied by however many rows the character list needs. Each glyph is centred in its own cell with ctx.textAlign and ctx.textBaseline set to the middle, and the font string passed to the context is the catalogue family's full stack — so what lands in the PNG is the same face the preview uses, shaped by the same engine that renders the page. The image is read back with toDataURL, which is also where the byte estimate comes from: the encoded payload is measured and converted at the usual three-quarters ratio.\n\n- No transparent background. A white sheet is the default and the tool deliberately does not offer alpha, because layered PNG alpha around antialiased edges produces dark fringes in some design tools.\n- It is a raster export. A PNG cannot scale past its pixel size, so production iconography still belongs in a font editor that can emit outlines.\n- One glyph per cell, drawn alone. There is no pair or paragraph mode, so kerning between two letters and ligature substitution are not shown.\n- If the webfont has not finished loading, the canvas catches the fallback face — re-render after the font is ready rather than trusting the first draw.\n- Spaces are dropped instead of becoming cells, so the sheet is not a proofing of your spacing.\n\nReach for it when a designed image is the deliverable rather than a font: a spec sheet for a client, a draught of an icon set, a glyph-by-glyph comparison between two faces, or a title card made from the letters themselves. Export at two to four times the final display size and downscale in the design tool, which is the cheapest way to keep small glyphs crisp. To compare the same characters across faces, the glyph comparison tool lines them up; the glyph browser is where a face's full character map is browsed, and the font specimen sheet serves the case where a whole specimen page is wanted rather than a character grid.",
    howTo: [
      { step: "Pick a face from the catalogue and type the characters the sheet should contain." },
      { step: "Set the glyph size, the column count and the padding between cells until the grid looks right." },
      { step: "Choose background and ink colours, keeping the default white when the image will be composited later." },
      { step: "Download the PNG, or open it in a tab when you only need to check the render." },
    ],
    whenToUse:
      "Use it when the output is an image: a client-facing spec sheet, a glyph comparison, or a title card built from the letters themselves. Where the goal is browsing what a face contains rather than exporting a picture, the {{glyph-browser|glyph browser}} is the faster surface, and the {{glyph-comparison-tool|glyph comparison tool}} puts two faces side by side on the same characters. A full specimen with sizes, weights and text blocks is what the {{font-specimen-sheet|font specimen sheet}} produces, and characters that seem to be missing from a face are worth checking with the {{missing-glyph-detector|missing glyph detector}} before they are drawn.",
    faqs: [
      {
        q: "Why can I not export a transparent background?",
        a: "Transparency around antialiased glyph edges often shows as dark fringes once an image is scaled inside a design tool. The exporter keeps the sheet opaque so the edges stay clean.",
      },
      {
        q: "Can I use the PNG as production iconography?",
        a: "Not really. It is a raster image fixed at the size you exported; a PNG cannot scale cleanly past its pixel size, so icons that ship should have their outlines exported from a font editor instead.",
      },
      {
        q: "Why are some characters missing from the sheet?",
        a: "Duplicates are collapsed into one cell and spaces are skipped, so the sheet holds each distinct visible glyph once. A character that appears to be gone is usually a repeated one.",
      },
      {
        q: "The canvas shows a different face than I selected — why?",
        a: "The canvas draws with whatever face the browser currently has loaded. If the webfont has not arrived yet, the fallback is drawn until it does; re-render after the font loads.",
      },
      {
        q: "Is the PNG size exact?",
        a: "It is an estimate computed from the length of the encoded data URL, converted at the usual three-quarters ratio. It is close enough to judge weight, not a byte-exact figure.",
      },
    ],
  },
  "glyph-browser": {
    keywords: [
      "glyph browser",
      "advance width",
      "canvas api",
      "code point",
    ],
    intro:
      "The glyph browser walks the printable code points of a chosen face and measures each one with the browser's own text engine, so the widths it reports are the rendered metrics rather than a table copied from elsewhere. Cells that a fallback face draws are marked.",
    content:
      "The glyph browser pages through a face's printable code points, draws each one in a grid and measures its advance width in the canvas api at the size you choose. The measurement is the part that makes it useful: the browser's shaping engine reports what the font does when it is rendered, including the kerning and default feature behaviour that apply to a single glyph.\n\nFour controls set the walk, and one of them accepts two input formats.\n\n- Face, chosen from the catalogue, which decides both the grid and the measurements.\n- Start code point, entered either as a hexadecimal value with a leading 0x or as a plain decimal number, clamped to the printable range.\n- Glyph count, from 16 to 480, which is how far past the start the grid runs.\n- Cell size, from 12 to 96 pixels, which changes both the rendering and the units the advance widths are measured in.\n\nThe readouts turn the grid into an assessment, and the average advance is the quickest figure for comparing two candidates' economy of space before a paragraph is set in either of them. The shown and native counts answer whether the face really covers the range or is borrowing glyphs from a fallback, the average advance is given in pixels and as a fraction of the em, and the range line names the first and last code point displayed. Every cell carries its hexadecimal code, and a cell the face does not draw is labelled as a fallback, using the browser's own font-matching check rather than a guess. Selecting a glyph opens a detail panel with its code point, its advance width in pixels and in em units, and buttons that copy the character, the code point and an HTML entity, which is the sequence a designer actually needs when a symbol has to be documented for a developer, along with the face and size the measurement was taken at.\n\nFour limits follow from measuring in the browser rather than reading a table.\n\n- A width taken at 12 pixels is rounded by the renderer, so comparisons of similar faces are more reliable at the larger sizes the slider allows.\n- The measurement describes the glyph as the browser shapes it, with default features on, so a width that changes under a stylistic set will not match what a different rule produces.\n- The fallback check depends on the font actually being loaded, which means a face that has not finished loading can look less complete than it is.\n- The walk is clamped to the printable range, so control characters and the private use area are out of scope by design.\n\nUse it when a face's coverage is being assessed before it is chosen, when a symbol seen in a design has to be identified by code point, or when the real advance widths of a face matter — for example alongside a monospace companion, in a table of figures, or where a display setting has to fit a fixed width.",
    howTo: [
      { step: "Pick the face and confirm the native count, since a low figure on a wide range means the grid is showing fallback glyphs rather than the font's own." },
      { step: "Enter the start code point in whichever form you have it, hexadecimal or decimal, and set a count that covers the ranges you care about." },
      { step: "Raise the cell size before comparing widths between faces, because small sizes round the measurements." },
      { step: "Select the glyph you need and copy the character, the code point or the HTML entity, checking the detail panel's drawn-by row first." },
    ],
    whenToUse:
      "Reach for it when a face's coverage has to be judged before it is adopted, when a symbol in a design has to be identified and handed to a developer, or when real advance widths matter for aligning figures. The measured-width column is the honest part. For a symbol that is not covered at all the {{missing-glyph-detector|missing glyph detector}} names the fallbacks, the {{unicode-character-explorer|Unicode character explorer}} gives the block and encoding context, and the {{font-glyph-png-exporter|font glyph PNG exporter}} turns individual glyphs into images.",
    faqs: [
      {
        q: "How does the tool measure a glyph's width?",
        a: "It asks the browser's own text engine, through the canvas measurement API, at the size you set. That means the number includes whatever the renderer applies to a single glyph, such as kerning contexts and the font's default features, rather than being read from a separate metrics table.",
      },
      {
        q: "What does the fallback label on a cell mean?",
        a: "It means the face does not contain that code point, so the browser would substitute another font at render time. The label comes from the platform's font-matching check, which is the same machinery that decides at paint time, so it reflects what the visitor will actually see on this machine.",
      },
      {
        q: "Why is the advance width given in em units as well as pixels?",
        a: "Because pixels alone do not travel. An em value is the width relative to the font size, so it can be compared with another face measured at a different size, and it converts into any size the design later uses. The pixel figure is there so the current setting can be read at a glance.",
      },
      {
        q: "Can I browse the whole font?",
        a: "The walk covers up to 480 consecutive code points from wherever you start, clamped to the printable range, so a large CJK font is covered in several passes rather than one. That is deliberate: measuring hundreds of glyphs in one go is slower and the grid becomes unreadable long before it runs out of code points.",
      },
      {
        q: "Why do two faces show different widths for the same letter?",
        a: "Because advance width is a design decision, not a constant. A condensed face fits more characters into the same line precisely because its advances are narrower, and the average advance readout is the quickest way to see the difference between two candidates before reading a single paragraph.",
      },
    ],
  },
  "kerning-pair-inspector": {
    keywords: [
      "kerning pair inspector",
      "kerning adjustment",
      "shaped width",
      "em/1000",
    ],
    intro:
      "The kerning pair inspector measures the difference between a shaped pair and the sum of its two glyphs, which is exactly the adjustment the font applied. The number comes from the browser's own shaping engine rather than from a table copied out of the file.",
    content:
      "The kerning pair inspector compares two measurements of the same pair: the width of the pair as the browser shapes it, and the sum of the widths of its glyphs measured separately. The difference is the kerning adjustment the font actually applied, read from the renderer rather than from a specification.\n\nThe inputs are deliberately few, and two of them matter for accuracy.\n\n- Face, from the catalogue, since kerning data varies from family to family and even between weights.\n- The pair to inspect, from the classic A and V through to lower-case pairs and figure pairs.\n- The measurement size, from 12 to 200 pixels, which should be large enough that the renderer does not round the result.\n- A pair list, space separated, which produces a table of comparisons in one pass; the current pair is always included.\n\nThe readouts give the shaped width, the sum of the glyph widths, the difference in pixels and the same difference in em/1000 units, which is the unit kerning tables are authored in. The verdict line turns the number into a reading: a negative difference means the pair was tightened, which is the usual case where a diagonal meets a vertical, as in A and V or T and o; a positive difference means the font adds space; and a difference of zero means no adjustment was applied, which does not prove the face lacks kerning data, because plenty of pairs genuinely need none. The panel's guidance puts a normal kern between twenty and sixty units, notes that beyond a hundred the two letters visually merge and optical spacing is the better fix, and warns that letter-spacing is added on top of kerning and will hide small adjustments, so measurements should be taken with tracking at zero.\n\nThe rendered preview makes the comparison physical: the same pair is drawn twice, once with kerning on and once with kerning disabled, and the difference between the two columns is the font's own adjustment. The exported CSS is a small rule whose only interesting line is the kerning property set to normal, with a comment explaining that leaving it unset or disabling it discards the pair adjustments the measurement just quantified.\n\nFour limits apply to what the measurement can claim.\n\n- The measurement describes the browser's shaping at the chosen size and with default features, so a pair that changes under a discretionary ligature or a stylistic set will not match the number here.\n- The sum of the parts assumes each glyph is independent, which is true for two letters and not for a sequence containing marks or combined forms.\n- The rendered on-off comparison depends on the platform having a fallback face to compare against, so the two columns can look identical on a system with unusual font matching.\n- The thresholds in the verdict column are the tool's own reading of accepted practice rather than a specification, useful as a scale and not as a rule.\n\nWhat it settles reliably is the common case: two letters, one face, a size large enough to avoid rounding, and a figure in units per thousand of the em that can be compared with any other pair in the same face.",
    howTo: [
      { step: "Choose the face first, because kerning data differs per family and per weight and the measurement is only meaningful for the face in use." },
      { step: "Enter the pair and raise the measurement size above about 48 pixels, so renderer rounding is small relative to the adjustment." },
      { step: "Read the difference in em per thousand units, which is the figure to compare against a normal kern of twenty to sixty." },
      { step: "Compare the two rendered columns to see whether the adjustment is visible, then copy the rule with kerning explicitly enabled." },
    ],
    whenToUse:
      "Reach for it when text set in caps looks unevenly spaced, when a display setting has two letters that appear to collide, or when someone claims a face ships no kerning and the claim needs testing rather than repeating. The rendered on-off comparison is the proof. For spacing across a whole run the {{letter-spacing-calculator|letter spacing calculator}} and the {{font-letter-spacing-tester|font letter spacing tester}} handle tracking, the {{opentype-feature-explorer|OpenType feature explorer}} shows the feature tags that change shaping, and the {{glyph-comparison-tool|glyph comparison tool}} sets the same pair in several faces at once.",
    faqs: [
      {
        q: "How is the kerning adjustment measured?",
        a: "By measuring the pair as the browser shapes it and subtracting the widths of the two glyphs measured separately. The difference is the adjustment the font applied to bring them together, which is the same value a kerning table would record, obtained from the renderer instead of the file.",
      },
      {
        q: "Why does a pair show no adjustment?",
        a: "Most likely because it genuinely needs none. A zero difference does not prove the font lacks kerning data, since many pairs are drawn with enough sidebearing already. To test a face properly, try several classic pairs such as A and V, T and o, and the figure pairs, where an absence of adjustment is unusual.",
      },
      {
        q: "What is a normal kerning value?",
        a: "Between about minus twenty and minus sixty units per thousand of the em for a pair that visibly benefits from tightening. Beyond a hundred the letters start to merge and the pair usually needs optical spacing instead of kerning, which is a drawing decision rather than a property of the font.",
      },
      {
        q: "Why does letter-spacing hide the adjustment?",
        a: "Because tracking is added to every gap in the run, including the gap inside the pair, so a small tightening is partly cancelled by the added space. A measurement taken with tracking applied describes the combination rather than the font's own kerning, which is why the tool tells you to measure with tracking at zero.",
      },
      {
        q: "Does the measurement change with the size?",
        a: "It should scale proportionally, which is why the difference is converted into units per thousand of the em. At very small sizes the renderer rounds glyph widths to whole pixels and the ratio drifts, so measuring at forty-eight pixels or above is the reliable range.",
      },
    ],
  },
  "missing-glyph-detector": {
    keywords: [
      "missing glyph detector",
      "coverage",
      "fallback",
      "document.fonts.check",
    ],
    intro:
      "The missing glyph detector asks the browser's own font-matching engine whether a face can render each character in your text. That is the real answer rather than a heuristic: the same check that decides at paint time whether to substitute a fallback.",
    content:
      "The missing glyph detector takes a face and a string of text, then reports which characters the face can draw and which will be substituted by a fallback. The test is the browser's font-matching check — document.fonts.check — which is the machinery that already decides this at paint time, so the result describes what a visitor will see rather than what a specification claims.\n\nCoverage is summarised by block-like groups, which is how a font's repertoire is usually described.\n\n- Basic Latin, the ASCII range, followed by the Latin-1 supplement that carries Western European accents and the common legal marks.\n- General punctuation and currency, which are the two ranges where an incomplete face tends to fail quietly.\n- Arrows and mathematical operators, then the symbols and dingbats range, which few text faces cover fully.\n- CJK and the emoji range, the two groups where a face either commits to a large repertoire or has nothing at all.\n\nThe readouts add up the picture: the unique character count, how many are covered, how many need a fallback, and the coverage as a percentage of the sample. The per-group table then shows coverage as a fraction and a share, with a note naming the missing count wherever a group is incomplete, which is the line that matters when a page is expected to render currency symbols or arrows reliably. A detail table lists every character with its code point, whether the face or a fallback draws it, and its group, and it can be searched, so a single character can be confirmed without reading the whole list.\n\nThe honest rendering panel is the part that makes the result tangible. The text is drawn at a large size in the chosen face, and the characters that will be substituted are named by code point below it, so the difference between coverage and rendering is visible: a character can be present in the face and still look wrong at a particular weight, and a character reported as covered is not a claim about how well it is drawn.\n\nFour limits follow from asking the browser rather than reading the file.\n\n- Detection depends on the font being loaded and available, so a webfont that has not arrived reports as unavailable along with everything else.\n- The result is specific to the platform's fonts, which means a machine with a different fallback set can produce a different report for the same file.\n- The group list is eight practical buckets rather than the full Unicode block taxonomy, so a character outside them is labelled as other and left out of the summary counts while still appearing in the detail table.\n- The check answers the availability question only, so a glyph that is present but drawn at a weight too light for its size passes without comment.\n\nRun it after the fonts have loaded, on the platform whose fallbacks matter most, and the report names exactly which characters will be substituted before the page ships.",
    howTo: [
      { step: "Choose the face under test, then paste the real text the page will render rather than a shortened sample." },
      { step: "Read the coverage percentage and the missing count first, since those two numbers summarise the whole result." },
      { step: "Check the per-group table for the ranges the project depends on, noting any group that is only partly covered." },
      { step: "Search the detail table for the specific characters that matter, and treat the honest rendering panel as the final check." },
    ],
    whenToUse:
      "Reach for it when a page renders a symbol, a currency mark or CJK text and the fallback behaviour has to be known before launch, when a webfont is being chosen and its coverage is being asserted rather than tested, or when a character on the page has rendered in a visibly different face. Coverage rather than aesthetics is the question. For identifying an unknown character the {{unicode-character-explorer|Unicode character explorer}} is the first step, the {{unicode-block-explorer|Unicode block explorer}} explains the planes and byte costs, and the {{glyph-browser|glyph browser}} measures the glyphs the face does carry.",
    faqs: [
      {
        q: "How does the detector know which characters a font has?",
        a: "It asks the browser through the font-matching check, which reports whether the requested family can supply a glyph for a given string. That is the same test the renderer performs before substituting a fallback, so the answer reflects rendering rather than a lookup table compiled separately.",
      },
      {
        q: "Why does a character report as missing when I can see it?",
        a: "Because it is being drawn by a fallback face, which is invisible when the substitute resembles the intended font. The detector distinguishes the two cases, and the honest rendering panel names the substituted code points, which is how a page that quietly mixes three typefaces is found.",
      },
      {
        q: "Is the report the same on every machine?",
        a: "No. It depends on the fonts installed and on whether the webfont has loaded, so a report generated before the file arrives overstates the problem. Generating it after load, on a machine that has the fallback set users are likely to have, gives the most useful reading.",
      },
      {
        q: "Does full coverage mean the characters look right?",
        a: "Not necessarily. Coverage says the face contains a glyph; it says nothing about how the glyph is drawn at the weight and size in use. A thin weight can make a covered character illegible, and a symbol borrowed from a text face can look out of place beside a display setting.",
      },
      {
        q: "What should I do about a group that is only partly covered?",
        a: "Decide whether the page needs it. Currency symbols and arrows are the two ranges where a deficit usually matters, because a missing one is replaced by a fallback with different weight and width, which is visible in a table or a label. Where the range is decorative, partial coverage is usually acceptable.",
      },
    ],
  },
  "widow-and-orphan-detector": {
    keywords: [
      "widow and orphan detector",
      "single-word last line",
      "canvas measuretext",
      "text-wrap: pretty",
    ],
    intro:
      "The widow and orphan detector measures a paragraph in the real face at the real size, simulates the line breaks and reports which paragraphs are at risk of a single-word last line. You set the size, the measure, the line height, the widows and orphans value and the font stack, then paste the copy; the panel returns counts of widows, orphans and short last lines with a per-paragraph breakdown.",
    content:
      "The widow and orphan detector is a measurement tool rather than a style generator. It takes the size, the measure in pixels, the line height, the widows and orphans value and a free-text font stack, then splits the pasted text into paragraphs and analyses each one. The report counts single-word last lines, short first lines and short last lines, and a table gives every paragraph its line count, the number of words on its final line, its average fill and a flag.\n\n- Report columns: the paragraph number, its line count, the words on the last line, the average fill percentage of the preceding lines, and a flag of widow, orphan, short last line or clean.\n- Widows and orphans from 1 to 4, defaulting to 2, written into the generated rule as both properties.\n- Measure from 240px to 1200px, defaulting to 600px; size from 12px to 28px, defaulting to 17px; line height from 1.2 to 2.4.\n- A font stack field that accepts any CSS family list, defaulting to Source Serif 4 with Georgia and serif fallbacks.\n- A short last line is flagged when the final line fills less than a quarter of the measure, and an orphan when the first line is similarly short.\n- The generated rule adds widows, orphans, text-wrap: pretty and a paragraph spacing value of 0.9em.\n\nThe measurement is a greedy line-break simulation driven by the Canvas measureText call. Each word is measured at the chosen pixel size and font stack, the widths accumulate with the space width until the measure is exceeded, and the break is taken at the last word that fits, which reproduces how a browser fills a paragraph without hyphenation or justification. The average fill figure divides the summed widths of every line except the last by the number of those lines times the measure, so a paragraph that is comfortable throughout but ends badly is distinguished from one that is loose everywhere. When no Canvas context is available, the detector falls back to a rough half-em advance per character and says so.\n\n- The simulation is greedy and unhyphenated, so a browser with hyphenation or justification enabled will break the paragraph differently.\n- Canvas measurement depends on the face being loaded; an unloaded webfont measures in the fallback stack.\n- CSS widows and orphans are hints, honoured unevenly across engines, and a value of 2 is not a guarantee.\n- text-wrap: pretty is recent, and engines without it ignore the declaration.\n- A paragraph of only one line can never be flagged, so very short copy passes without a verdict.\n\nRun it when long copy is about to ship inside a fixed measure: an article body, a documentation column, a printed column. Fix the paragraphs it flags rather than adding rules across the whole site, since the corrections are local: a slightly different measure, a small change in leading, or a reworded sentence. The detector reports the outcome of the first two immediately because it re-measures whenever a slider moves. A paragraph that width alone cannot fix is the case the justification previewer and the hyphenation tester address, and the same logic applied across several columns is what the column layout builder checks.",
    howTo: [
      { step: "Set the size, the measure and the line height the copy will actually ship at." },
      { step: "Choose the widows and orphans value and paste the font stack the page uses." },
      { step: "Paste one paragraph per line break and read the counts and the per-paragraph table." },
      { step: "Copy the generated rule, or adjust the measure until the flagged paragraphs come back clean." },
    ],
    whenToUse:
      "Reach for it when copy is about to be set in a fixed measure and the last lines are the risk: an article body, a documentation column, a print column. It converts a judgement call into a count, and it reports the two corrections that usually work, a different measure and a different leading, as soon as they are tried. A paragraph that breaks badly because of long words is the {{hyphenation-tester|hyphenation tester}}'s problem, and the {{text-justification-previewer|text justification previewer}} explains why a tight measure with no hyphenation produces rivers. The text edge itself, independent of the paragraph's last line, is what the {{optical-margin-alignment-preview|optical margin alignment preview}} examines.",
    faqs: [
      {
        q: "What counts as a widow here?",
        a: "A paragraph with more than one line whose final line holds a single word. The count and the table both report it, and the last-line width is shown so a short line that still holds two words is not confused with a true widow.",
      },
      {
        q: "Why does the detector need the real font stack?",
        a: "Line breaks depend on the actual widths of the face. The stack is measured with the Canvas API at the chosen size, so a fallback family or a different weight changes the analysis and the flagged paragraphs with it.",
      },
      {
        q: "Do widows and orphans in CSS actually work?",
        a: "They are hints rather than rules, and engines honour them unevenly. The detector reports what your paragraph will look like and leaves the hint in the generated CSS, but expect some browsers to ignore the values.",
      },
      {
        q: "Why can a one-line paragraph never be flagged?",
        a: "A widow needs a preceding line to break away from, so a single-line paragraph cannot strand its last line in the same way. Keeping it out of the count avoids noise in a list of short copy.",
      },
      {
        q: "How accurate is the Canvas simulation?",
        a: "It reproduces a greedy, unhyphenated break using the face's real metrics, which matches an engine with the same settings. Hyphenation, justification or an unloaded webfont will move the line breaks away from the estimate.",
      },
    ],
  },
  "font-accessibility-evaluator": {
    keywords: [
      "font accessibility evaluator",
      "wcag 1.4.12",
      "text reflow",
      "accessible type css",
    ],
    intro:
      "The font accessibility evaluator scores a whole type specification against the WCAG criteria that apply to text and, for each one, states what was required, what was measured and what would fix it. You choose a face and set the specification; the tool returns the criteria table, a live preview and a CSS block.",
    content:
      "The font accessibility evaluator takes a face, a size, a weight, two colours and four spacing values, then runs the specification through the criteria that apply to text and reports a pass or fail per criterion alongside the change that would resolve it.\n\n- Faces come from the built-in catalogue with Inter as the starting choice, and each entry carries the stack that is written into the exported CSS.\n- Size runs from 10px to 48px, weight in hundred-unit steps from 300 to 800, and the measure from 20ch to 140ch.\n- Line height runs from 1 to 2.4, letter spacing from 0 to 0.3em and paragraph spacing from 0 to 4em, each clamped inside its range before it is evaluated.\n- Five criteria are scored: contrast at AA, contrast at AAA, resize text, text spacing and text reflow.\n- Every failing row carries a fix, from darkening the text for a weak ratio to capping the measure so the copy can wrap inside a 320 pixel viewport.\n\nText spacing, WCAG 1.4.12, is the criterion a type specification most often fails, and it is evaluated as a conjunction of three conditions: line height must reach 1.5, paragraph spacing must equal at least twice the size, and letter spacing must reach 0.12em. Missing any one of them fails the row. Reflow is scored from the measure and passes at 80 characters or fewer, on the reasoning that a wider setting cannot wrap inside a narrow viewport without two-dimensional scrolling. The accessible type CSS the panel exports then rebuilds the same specification as a class: the size is converted to rem by dividing by sixteen to four decimals, the line height is floored at 1.5, the letter spacing at 0.12em and paragraph margins at 2em, so applying the block cannot reintroduce a value the table has just failed. A second paragraph renders in the preview at the specified paragraph spacing, which means the spacing criterion can be judged against real text instead of an abstract number.\n\n- Images of text, 1.4.5, is not scored, because it needs the page markup rather than a type specification.\n- The resize and reflow rows reason about the specification, not a rendered page, so a fixed-height container elsewhere in the layout stays invisible here.\n- Contrast is evaluated for one pair only. Hover, focus, disabled and placeholder states are separate specifications and need their own run.\n- The preview renders in the browser, so the chosen face is subject to whatever is installed on the machine viewing it.\n- Nothing is saved or versioned. The evaluation is a snapshot of the current settings, and changing the face clears the comparison.\n\nRun it once per text role rather than once per page, because a caption and a heading rarely share thresholds, and treat the fix column as review notes: a specification that passes all five rows has a defensible answer for contrast, spacing and reflow in one place. Where the copy itself is the problem rather than the styling, the readability score calculator measures the prose, the body text legibility grader scores how the text reads at a glance, and the paragraph width optimizer settles the measure when the reflow row keeps failing. The line height optimizer is the companion for the leading value, and the contrast text checker measures the pair the contrast rows depend on.",
    howTo: [
      { step: "Pick the face from the catalogue, then set the size, weight and the two colours that make up the text pair you are evaluating." },
      { step: "Set the measure, line height, letter spacing and paragraph spacing, watching the preview since it renders at exactly the values being scored." },
      { step: "Read the evaluation table row by row, noting the requirement, the measured value and the fix for any criterion showing a fail." },
      { step: "Adjust until the passed count reaches five out of five, then copy the exported CSS, which already floors the leading and tracking at the values the table requires." },
    ],
    whenToUse:
      "Use it when a type specification has to be signed off, when a design system's body style is being reviewed for the first time, or when a single failing criterion needs to be isolated from the rest. It is the broadest of the accessibility checks here, since it scores contrast, resize, spacing and reflow in one table rather than one criterion at a time. For a narrower question, the {{wcag-font-size-checker|WCAG font size checker}} states the thresholds and spacing minimums for a single size, and the {{dyslexia-font-simulator|dyslexia font simulator}} shows what the spacing adjustment looks like on real copy.",
    faqs: [
      {
        q: "Why does the text-spacing row test three values at once?",
        a: "Because the criterion itself is a conjunction: a reader must be able to apply a line height of 1.5, paragraph spacing of twice the font size and letter spacing of 0.12em together without loss of content. Passing on one value while failing on another does not satisfy it, so the row reports the measured triple and fails if any element is short.",
      },
      {
        q: "How can reflow be scored from a measure?",
        a: "The measure is a proxy. A line longer than about 80 characters cannot wrap inside a 320 pixel viewport without the container scrolling in two directions, which is what the criterion forbids, so capping the measure keeps the specification on the right side of it. It is a conservative reading of the criterion rather than a rendered test.",
      },
      {
        q: "Does the exported CSS pass by construction?",
        a: "It is biased that way. The block floors the line height at 1.5, the letter spacing at 0.12em and paragraph margins at 2em, and it writes sizes in rem so the resize criterion holds, which means the values that were failing in the table cannot survive into the copied code.",
      },
      {
        q: "Why is the images-of-text criterion not in the table?",
        a: "Because it cannot be judged from a type specification. Whether a heading is real text or a picture of text is a property of the markup, so evaluating it needs the page rather than a set of numbers. The criteria that are scored are the ones derivable from size, weight, colour, measure and spacing.",
      },
      {
        q: "Should I evaluate every text role separately?",
        a: "Yes. Body copy, captions and headings have different sizes and thresholds, so a specification that passes for the body style can fail for a 12px caption whose colour was reused from the body text. Each role gets its own run, its own colour pair and its own saved CSS block.",
      },
    ],
  },
  "body-text-legibility-grader": {
    keywords: [
      "body text legibility grader",
      "type measure",
      "leading ratio",
      "legibility grade",
    ],
    intro:
      "The body text legibility grader scores a paragraph setting on the five criteria that decide how body copy reads, then weights them into a single number and a letter grade. It is not a pass or fail check: each criterion scores on a curve, so the grader reports how far a setting has drifted from comfortable rather than simply flagging it.",
    content:
      "The body text legibility grader takes a face, a size, a type measure, a leading ratio and a weight, scores each one against the range that reads well, and combines them into a weighted composite with an approximate line count for the sample.\n\n- Face selection comes from the built-in catalogue, and the face's classification shifts the size floor: 17px for a serif, 16px for a sans.\n- Size is adjustable from 12px to 32px, the measure from 20ch to 140ch, the leading from 1 to 2.4, and the weight in hundred-unit steps from 300 to 800.\n- The five criteria are weighted: measure 30 percent, leading 25 percent, size 20 percent, weight 15 percent and line box height 10 percent, since measure and leading do most of the work in a paragraph.\n- Measure scores full marks between 45ch and 80ch, then falls away in both directions rather than failing abruptly.\n- Leading scores full marks from 1.45 to 1.8 and decays outside it, and the line box criterion rewards a box of 24px or more, which is the leading multiplied by the size.\n\nSize is graded in three steps rather than one: a serif face earns full marks at 19px and above, a sans at 18px and above, and either face keeps a large part of its score when it sits exactly on its floor. Weight scores full marks from 400 to 600, drops to 0.6 below 400 because thin strokes lose definition at body sizes, and to 0.85 above 600 because heavy text starts to close up its counters. The composite becomes a legibility grade on fixed cutoffs: 92 and above is an A, 82 a B, 70 a C, 55 a D, and below that the setting is not a body text setting at all. The results panel names the weakest criterion alongside the score, which is usually the fastest route to a better grade, and estimates the number of lines the sample will occupy by dividing its length by the measure multiplied by 1.5.\n\n- The score curves are editorial positions expressed as arithmetic, not published thresholds, and a setting can score an A while still looking wrong in a particular typeface.\n- The face's x-height is represented only by the serif and sans floors, so two sans faces with very different x-heights are graded identically.\n- Contrast, colour and background are out of scope entirely: a perfectly graded paragraph can still fail accessibility on its colour pair.\n- Justification, hyphenation and paragraph spacing are not modelled, so a justified setting is graded as though the spaces were even.\n- The line estimate is a rough figure based on average character widths, and it moves with the sample text rather than with the layout.\n\nUse it when a body style needs to be argued about with numbers rather than adjectives, and read the criteria table instead of only the grade: a B with the weakest criterion showing as weight means something different from a B produced by a narrow measure. Fix measure and leading first, because they carry the most weight and they are also the two a reader notices. When the measure is the stumbling block, the paragraph width optimizer narrows it down properly, the line height optimizer settles the leading, and where the deciding factor is the reader's access needs rather than the arithmetic, the font accessibility evaluator scores the same specification against the WCAG criteria.",
    howTo: [
      { step: "Choose the face first, since its classification sets the size floor the size criterion is graded against." },
      { step: "Set the size, measure, leading and weight with the sliders, and replace the sample paragraph with the real copy if the line estimate matters to you." },
      { step: "Read the criteria table rather than just the composite: each row shows the weight, the score out of 100 and the measured value behind it." },
      { step: "Fix the criterion named as weakest, re-read the grade, and compare the graded paragraph rendered at the foot of the page." },
    ],
    whenToUse:
      "Reach for it when a design system's body style is being set for the first time, or when a page reads badly and you need to know which of the five values is responsible instead of changing all of them. It is also a useful way to compare two candidate settings, because the composite makes the trade visible in a single figure. Where the measure keeps being the weak criterion, the {{paragraph-width-optimizer|paragraph width optimizer}} narrows it properly, the {{line-height-optimizer|line height optimizer}} does the same for leading, and the {{readability-score-calculator|readability score calculator}} covers the prose side of the same paragraph.",
    faqs: [
      {
        q: "Why are the criteria weighted instead of averaged?",
        a: "Because the five values do not matter equally. Measure and leading carry half the total weight between them, since a paragraph of the right length with generous leading reads well even at a modest weight, while the reverse is not true. Weight and line box height get the smallest shares because they refine a setting rather than rescue one.",
      },
      {
        q: "Why does a serif face need a larger size than a sans?",
        a: "The size floor is 17px for a serif and 16px for a sans, and the full-marks point is two pixels above whichever floor applies. Serif faces generally carry finer strokes and smaller counters, so they need a little more size before the letterforms hold together at body text sizes on a screen.",
      },
      {
        q: "Why can a score be high while the paragraph still looks poor?",
        a: "Because the grader models five values and nothing else. Colour contrast, the typeface's own proportions, hyphenation, justification and paragraph spacing all sit outside the score. A setting that grades an A on the curve can still fail a reader on a low-contrast pair or on a face whose x-height is much smaller than the catalogue average.",
      },
      {
        q: "What does the line count tell me?",
        a: "It is an estimate of how many lines the sample will occupy at the current measure, from the text length divided by the measure multiplied by 1.5 and rounded up. Treat it as a sanity check rather than a measurement: it assumes average character widths, so it drifts on text with long words or many numerals.",
      },
      {
        q: "Is a B good enough to ship?",
        a: "Usually, provided the weakest criterion is not the one your readers are most sensitive to. A B produced by a slightly heavy weight is a different proposition from a B produced by a measure outside the comfortable band. Grade A means every criterion sits inside its range, so it is the target for long-form reading rather than for captions or interface text.",
      },
    ],
  },
  "css-variable-font-builder": {
    keywords: [
      "css variable font builder",
      "size-adjust",
      "font-variation-settings",
      "registered properties",
    ],
    intro:
      "The CSS variable font builder assembles the three rules a variable font needs in production: the declaration with a weight range, a fallback face whose metrics are close enough to survive the swap, and a usage rule that prefers registered properties over raw axis settings.",
    content:
      "The CSS variable font builder writes three rules rather than one, because a variable font in production is a loading strategy as much as a file format. The first rule declares the face with a weight range and a stretch range, the second declares a fallback face whose metrics have been adjusted to match, and the third applies the font with properties that behave like normal CSS.\n\nThe tool sets the work out as a five-layer ladder, and each layer is worth understanding.\n\n- Layer one is a plain fallback stack that always renders, with no request and no risk.\n- Layer two adds a metrics match: the fallback is declared with size-adjust set to a percentage between 60 and 150, which changes its rendered size so its lines occupy the space the webfont will occupy. That is what removes the shift when the real font lands.\n- Layer three declares the variable face itself with a format of woff2-variations, a weight range such as 300 to 800, a stretch range of 75 to 125 per cent and a display policy of swap.\n- Layer four applies the font with registered properties — font-weight for the weight axis, font-stretch for the width axis and optical sizing set to auto for a face with an optical size axis.\n- Layer five is the escape hatch: font-variation-settings for axes that have no standard property, such as a grade axis.\n\nThe reason registered properties come before the escape hatch is that they cascade, inherit and animate like any other CSS property, while font-variation-settings is a single declaration that resets every axis it does not mention and cannot be transitioned reliably. The preview makes the loading point visually: it renders the text in the fallback face at the adjusted size, because that is the version most first-time visitors actually see, and matching it to the webfont is what makes the swap invisible. Finding the figure is a matter of entering a value, comparing the two versions and repeating until they occupy the same lines, since the percentage belongs to the pair of faces rather than to any standard.\n\nFour limits apply, and they are the reasons the output still has to be reviewed.\n\n- One URL is generated, so a static fallback for very old engines has to be added by hand rather than being assembled by the tool.\n- The size-adjust figure is a single percentage, so a face that needs different adjustments at different weights cannot be matched exactly and the compromise has to be chosen deliberately.\n- Optical sizing only does anything when the file carries an optical size axis, and a variable font without one simply ignores the declaration.\n- The raw axis names in the final layer are specific to each file, so they are applied by whoever pastes the CSS and cannot be guessed from the font's name.\n- Nothing checks that the declared weight range matches the axes the file actually carries, so an optimistic range can advertise weights the font cannot render.",
    howTo: [
      { step: "Enter the family name, file URL and the weight range the variable file covers, matching the descriptor to the file's real axis." },
      { step: "Choose the fallback face and tune size-adjust while watching the preview, which shows the fallback at the adjusted size rather than the webfont." },
      { step: "Set the weight and stretch the type will actually use, so the usage rule carries real values rather than defaults." },
      { step: "Copy the full rule set and the fallback variant, then check the page with the webfont blocked to confirm the fallback reads acceptably." },
    ],
    whenToUse:
      "Reach for it when a variable font is being introduced and the loading strategy has to be settled at the same time, when a swap is producing a visible jump in a page whose fallback metrics differ, or when someone is reaching for raw axis settings where a registered property would do the job and animate. The ladder is the useful model. For the declaration alone, the {{font-face-generator|font-face generator}} writes it without the metrics layer; the {{variable-font-sliders|variable font sliders}} explore what the axes do, and the {{font-loading-strategy-builder|font loading strategy builder}} decides how many files the page should ask for.",
    faqs: [
      {
        q: "What does size-adjust do?",
        a: "It scales the fallback face's rendered size without changing its declared font size, so its lines take up roughly the space the webfont will take up. That is what removes the reflow when the webfont arrives. The value is a percentage, and matching it by eye against the preview is how the adjustment is found.",
      },
      {
        q: "Why prefer font-weight over font-variation-settings?",
        a: "Because font-weight, font-stretch and optical sizing are ordinary CSS properties: they inherit, cascade and animate, and a stylesheet can override them per component. The raw axis declaration resets every axis it does not mention, does not animate reliably and cannot be reasoned about from the cascade, so it belongs only where no standard property exists.",
      },
      {
        q: "Is one variable file smaller than three static weights?",
        a: "Usually smaller than the weights it replaces, and certainly fewer requests. A variable file carries every intermediate value, so it is larger than any single static weight but replaces the range. The trade is one file that covers 100 to 900 against four or five separate files that each need their own declaration.",
      },
      {
        q: "What happens if the variable font fails to load?",
        a: "The adjusted fallback renders, which is why the second rule exists and why its metrics were matched. With the size-adjust figure close to the webfont's, the difference between the two states is a change of letterforms rather than a change of layout, which is the least disruptive failure mode available.",
      },
      {
        q: "Which axes can I use this way?",
        a: "Weight, width and optical size have standard properties and should always use them. Other axes — grade, contrast, slant or a custom axis — have no equivalent, so they go through font-variation-settings with the axis tag and value. The tool's fifth layer is where that belongs, and the file's own documentation names the tags.",
      },
    ],
  },
  "font-loading-strategy-builder": {
    keywords: [
      "font loading strategy builder",
      "preload",
      "subsetting",
      "font-display",
    ],
    intro:
      "The font loading strategy builder does the arithmetic a font plan depends on: how many files a page asks for, how much they weigh, how many can be preloaded, and which of the loading trade-offs the project is choosing. Every extra weight is another request on the critical path.",
    content:
      "The font loading strategy builder turns a font plan into numbers. Families multiplied by weights gives the file count, the file count multiplied by the average file size gives the transfer, and a subsetting factor applied to that gives what the visitor actually downloads.\n\nFive decisions are made explicitly rather than left to default.\n\n- How many files are preloaded, which should be the ones used above the fold and nothing more, since preload is a hint that the request must start immediately.\n- The font-display policy, which decides what the visitor reads while the files arrive.\n- The subsetting approach, with typical reductions stated: latin only at roughly 35 per cent of the full size, latin extended at 55 per cent, and a unicode-range split at about 40 per cent, against no subsetting at all.\n- Where the files are hosted, self-hosted or through a third-party service.\n- The average file size, which is the one figure only the project can supply and the one that makes the total honest.\n\nThe verdict bands are deliberately blunt. One or two files with a single preload is lean. Up to four files is acceptable as long as the preload list stays at one or two. Beyond that the plan is heavy, and the advice is to consolidate weights or subset further rather than to add preloads. The tool also states the reason self-hosting is worth considering: a third-party host adds a DNS lookup and a TLS handshake on the critical path, and the service's availability becomes part of the page's. When a third-party host is chosen anyway, the preconnect hints become mandatory rather than optional, and the generated head markup includes them.\n\nThe outputs are the two blocks a page actually needs. The head markup contains the preconnect for the file host, a comment naming how many of the total files are being preloaded, and one preload link per chosen file with the font type and the crossorigin attribute. The style block writes one declaration per weight, each with its own URL, weight and display policy, and adds a character range when the unicode-range split was chosen. A strategy table then restates the plan as decisions with their reasons, which is the part to keep when the numbers change.\n\nWhat the tool cannot do is measure, and the plan is only as good as the figures entered.\n\n- The average file size is an estimate typed by hand, so the totals describe the assumption rather than the build.\n- The subsetting factors are typical reductions — roughly 35 per cent for latin, 55 for latin extended and 40 for a unicode-range split — rather than measurements of the project's own files.\n- Nothing checks that the paths in the generated markup exist, or that a preloaded file is the one the first screen actually uses.\n- The display policy is recorded as a decision with its trade-off rather than verified, so the result still has to be watched on a slow connection.\n- Layout shift is described rather than measured, since removing it depends on matching the fallback metrics in the declarations themselves.",
    howTo: [
      { step: "Enter the families and weights the design really uses, since the file count is their product and is the first thing the verdict reacts to." },
      { step: "Enter an average file size from the project's own files rather than the default, so the totals describe this site." },
      { step: "Choose subsetting and the display policy, then read the verdict and the totals before and after subsetting." },
      { step: "Set how many files are preloaded — the above-the-fold ones only — and copy the head markup before the style block." },
    ],
    whenToUse:
      "Reach for it when a page has accumulated weights over several iterations and nobody has counted the files, when a product decision about a third-party font host has to be argued with numbers, or when subsetting is being considered and the size reduction needs an estimate before the work. The file count is the number to watch. For the declarations themselves the {{font-face-generator|font-face generator}} writes them one at a time, the {{css-variable-font-builder|CSS variable font builder}} collapses several weights into one file, and the {{system-font-stack-generator|system font stack generator}} removes the requests entirely.",
    faqs: [
      {
        q: "How many font files should a page load?",
        a: "As few as the design allows, and the tool's verdict calls one or two files lean and anything past four heavy. Each file is a request on the critical path, so a plan with six weights across two families is twelve requests unless the weights are consolidated into a variable file or dropped.",
      },
      {
        q: "What should be preloaded?",
        a: "Only the files used above the fold, usually a single body weight and sometimes one heading weight. Preload tells the browser to start the request immediately and at high priority, so adding more files to that list competes with the images and scripts the first screen also needs.",
      },
      {
        q: "How much does subsetting save?",
        a: "The tool uses typical figures: about a third of the size for latin only, a little over half for latin extended, and around 40 per cent for a unicode-range split. The real saving depends on the file, so the estimate is there to justify the work rather than to replace measuring the result.",
      },
      {
        q: "Why is a third-party font host a bigger decision than it looks?",
        a: "Because it adds a domain to resolve and a connection to open before the font can arrive, and the page's rendering then depends on someone else's uptime and response headers. Preconnect mitigates the handshake but not the dependency, which is why self-hosting is worth costing out at the same time.",
      },
      {
        q: "Which display policy fits an e-commerce page?",
        a: "Swap in most cases, because readable text immediately is worth one re-render, and a product name that is invisible for a moment costs more than a change of letterforms. Optional is worth considering where any movement is unacceptable, accepting that a slow connection may never show the webfont.",
      },
    ],
  },
  "editorial-style-guide-generator": {
    keywords: [
      "editorial style guide generator",
      "type scale ratio",
      "role table",
      "markdown style guide",
    ],
    intro:
      "The editorial style guide generator turns a set of type decisions into the document a project needs, with every role, size, weight and leading stated rather than left implicit in a stylesheet. The output is Markdown, so it can live in the repository beside the code it describes.",
    content:
      "The editorial style guide generator takes three faces and four numbers, derives seven roles from a single scale, and writes a Markdown document containing the role table and the rules that go with it.\n\n- The three faces are display, text and UI, and they are assigned by role: display covers the display heading, H1 and H2 styles, text covers H3 and body copy, and the UI face covers captions and interface labels.\n- Seven roles are defined on one scale: display at four steps above the base, H1 at three, H2 at two, H3 at one, body at the base, and caption and UI one step below.\n- The base runs from 14px to 22px, defaulting to 17px, with a type scale ratio chosen from 1.125, 1.2, 1.25, 1.333, 1.414, 1.5 and 1.618, defaulting to 1.25.\n- Leading is set once for body copy between 1.2 and 2.2, and every other role carries its own line height: 1.05 for display, 1.1 for H1, 1.2 for H2, 1.25 for H3, 1.45 for captions and 1.4 for interface text.\n- The measure sets the upper bound named in the rules, and every size is reported in pixels and in rem alongside its weight and leading.\n\nThe role table is the part that a stylesheet cannot express: each row states the face, the pixel size, the rem value, the weight, the leading and the purpose, so a reviewer can see that the display face never appears below twice the base size and that interface text is a step below body rather than an arbitrary value. The generated guide then states six rules in prose. Body measure stays between 45 and the chosen maximum, and widening the container is done by adding columns rather than by stretching a single one. Headings never inherit body leading. Tracking is negative above twice the base size, zero at body size and positive for uppercase and captions. One emphasis mechanism is used per passage, whether bold, italic or colour. Figures in tables and captions are tabular while figures in prose may be proportional. And the UI face never appears in body copy while the display face never appears below twice the base.\n\n- The faces are typed in by name and are not checked against any catalogue, so a misspelled family silently produces a guide that names a font nobody has.\n- Five of the six rules are fixed text with the measure and the base size interpolated, so an unusual system cannot restate them.\n- Weights are assigned per role rather than adjustable, which suits a conventional hierarchy and not a display system built on one weight.\n- Colour, spacing, grid and motion are outside the guide entirely.\n- The output is Markdown only, and it is copied rather than written to a file.\n\nUse it when a project needs a type guide that reviewers and contractors can read, or when the same decisions keep being re-explained in tickets. The output is a Markdown style guide rather than a stylesheet, which is why it reads as rules, and generating it from the real numbers at the start of a project is what makes those rules enforceable later, since updating the guide and the stylesheet together is a two-minute job. Where the scale itself is the question, the type scale generator derives the steps and the modular scale calculator compares ratios, and if the hierarchy needs planning before the sizes are fixed, the type hierarchy planner works through the roles. The token generator is the companion that turns the same decisions into variables.",
    howTo: [
      { step: "Name the guide and enter the three faces the system uses for display, text and interface type." },
      { step: "Choose the scale ratio, then set the base size, the body leading and the maximum measure with the sliders." },
      { step: "Read the role table and check the size range and face count in the results box, since a guide naming three faces where the design uses two is a sign the roles have drifted." },
      { step: "Copy the Markdown and commit it to the repository as a type guide, then keep it in step with the stylesheet as the scale changes." },
    ],
    whenToUse:
      "Reach for it at the start of a design system, when a team is about to build several pages from the same scale, or when a review keeps reopening questions about sizes that were never written down. It is the document that stops a hierarchy being re-invented page by page. Where the scale steps themselves need deriving, the {{type-scale-generator|type scale generator}} does the arithmetic, the {{modular-scale-calculator|modular scale calculator}} compares candidate ratios, and the {{type-hierarchy-planner|type hierarchy planner}} settles which roles a project actually needs before any size is fixed.",
    faqs: [
      {
        q: "Why assign faces by role rather than to the whole guide?",
        a: "Because most editorial systems use two or three faces with narrow jobs. The display face sits at the top of the hierarchy and the UI face at the bottom, while the text face carries body copy and the H3 level. Assigning them at the role level is what lets the guide state that the UI face never appears in body copy, which is the rule most often broken.",
      },
      {
        q: "Which ratio should I choose?",
        a: "It depends how much contrast the hierarchy needs. 1.125 and 1.2 give a gentle step suitable for dense interface text, 1.25 is the common editorial default, and 1.414, 1.5 and 1.618 give the wide jumps that suit a display-led design. A larger ratio means fewer usable steps above the base before the sizes become unusable.",
      },
      {
        q: "Why do captions and UI text share a step?",
        a: "They are both supporting roles that should read as subordinate to body copy, so they sit one step below the base rather than at arbitrary sizes. Their weights differ, 400 for captions and 500 for interface labels, and so do their line heights, which is what keeps the two roles distinct while they share a size.",
      },
      {
        q: "Is the Markdown output the same as the role table?",
        a: "It contains the same figures plus the faces and the six rules, formatted as a document rather than a table view. The table on screen shows pixel size, rem, weight, leading and purpose; the Markdown adds the face list, the scale statement and the numbered rules, which is what makes it readable as a guide rather than as a spec.",
      },
      {
        q: "Can the rules be edited?",
        a: "Not in the tool. Five of the six rules are fixed text with values interpolated from your base size and measure, which keeps the guide consistent across projects. Rules that need rewriting for a particular system can be edited in the Markdown after it is copied, at the cost of that consistency.",
      },
    ],
  },
  "index-page-layout-preview": {
    keywords: [
      "index page layout preview",
      "hanging indent",
      "sub-entries",
      "tabular figures",
    ],
    intro:
      "The index page layout preview sets a book index as it is actually read: a two-column page with runover indents for continuation lines, sub-entries under their parents, and a page number column that aligns by digit. The indents and the column count are the two decisions that decide whether an index can be scanned.",
    content:
      "The index page layout preview takes one entry per line as a term and its page numbers, then sets the column count, the entry size and leading, and three indent values, returning a typeset index, a column breakdown and the CSS.\n\n- Entries are typed one per line as a term followed by commas and page numbers, and a line whose term begins with a dash is treated as a sub-entry.\n- The column count runs from one to three, with two as the default, since two or three columns are the norm for a printed index.\n- Entry size runs from 6pt to 14pt and leading from 8pt to 20pt, defaulting to 9.5pt on 11.5pt.\n- A hanging indent puts continuation lines under the term rather than under the entry number, using a left padding and an equal negative text indent.\n- The readout reports the entry count, the entries per column, the number of sub-entries and the resulting column height in points.\n\nThe runover indent is what makes a long entry read as one entry rather than two: a term whose page list wraps onto a second line starts that line aligned with the term, so the reader's eye does not have to decide whether a new entry has begun. Sub-entries take a further indent, which places them under their parent by position rather than by size, and the convention list in the panel states the reason: hierarchy in an index is expressed by where a line starts, not by making it smaller. Page numbers are set with tabular figures so the digits align down the column, and hyphenation is switched off entirely, because a hyphenated term is a term a reader cannot find. The column height figure is the leading multiplied by the entries per column plus one line, which is the estimate a page plan needs to know whether the index will fit its allotted pages.\n\n- Entries are set exactly as typed. Nothing sorts them, merges duplicates or normalises a page range.\n- The hanging indent slider is present but not wired into the generated CSS; the runover indent is what sets the hanging value in practice.\n- Sub-entries exist at one level only, and a further level has to be added by editing the CSS.\n- Column balancing is left to the browser, so the last column can be short by several lines.\n- Cross-references, see-also entries and any styling that distinguishes them are outside the tool.\n\nUse it when an index is being set and the indent scheme is still being decided, when a generated index has to be restyled to fit a page, or when a column count needs checking against the number of entries before pages are allocated. The entry and column counts are what a page plan is built from. Where the page geometry has to be fixed first, the book interior layout preview reports the text block the index will occupy, and the table of contents typesetter covers the contents page that mirrors it at the front of the book.",
    howTo: [
      { step: "Paste the entries one per line, with the term first and its page numbers after commas, prefixing sub-entries with a dash." },
      { step: "Set the column count, the entry size and the leading, then choose the runover and sub-entry indents." },
      { step: "Read the entry count, entries per column and column height to see whether the index fits the pages it has been allotted." },
      { step: "Copy the index CSS, which carries the runover indent, the disabled hyphenation and the tabular figures for the page numbers." },
    ],
    whenToUse:
      "Reach for it when an index is being typeset for print, when a generated index from a word processor needs to be made scannable, or when the space an index needs has to be estimated before pages are allocated. It is also the quickest way to show why hyphenation must be off in an index. For the page it sits on, the {{book-interior-layout-preview|book interior layout preview}} gives the text block and margins, the {{table-of-contents-typesetter|table of contents typesetter}} covers the contents page, and the {{print-type-specification-sheet|print type specification sheet}} records the index size in points for the printer.",
    faqs: [
      {
        q: "Why must an index never be hyphenated?",
        a: "Because a hyphenated term becomes two fragments that a reader cannot find. Someone searching the index for letterspacing will not look at a line ending in letter with spacing on the next line. The generated CSS therefore disables hyphenation outright, which is the one place in a typeset book where ragged word spacing is preferable to a break.",
      },
      {
        q: "What does the runover indent do?",
        a: "It aligns the second and later lines of a long entry with the first line's text rather than with its start, so the entry reads as one unit. It is built from a left padding and an equal negative text indent, which is the same technique a hanging indent uses. Without it, a wrapped page list looks like a separate entry.",
      },
      {
        q: "Why are page numbers set in tabular figures?",
        a: "So that the numbers form a column the eye can scan. Proportional digits have different widths, so the ones and twos would not line up vertically and the reader would have to read each number instead of scanning. Tabular figures make every digit the same width, which is what a page-number column depends on.",
      },
      {
        q: "How many columns should an index have?",
        a: "Two or three for a printed book, with two the usual choice. A single-column index is only justified on a very narrow page, because an index is read by scanning short entries and a wide single column wastes the scan. The tool reports entries per column and the resulting column height, which is what tells you whether the count fits the pages you have.",
      },
      {
        q: "Does the tool sort the entries?",
        a: "No. Entries are set exactly as typed, so sorting, merging duplicate terms and normalising page ranges all happen before the text is pasted in. The one thing it reads from the input is the sub-entry marker, which is a leading dash on the term.",
      },
    ],
  },
  "book-interior-layout-preview": {
    keywords: [
      "book interior layout preview",
      "text block",
      "margin ratios",
      "characters per line",
    ],
    intro:
      "The book interior layout preview lays out a page with the five regions a book page actually has, then reports the proportions between them. The measurements are the ones a print production sheet asks for: text block size, margin ratios, lines per page and the resulting characters per line.",
    content:
      "The book interior layout preview takes a page size, a type size and leading, and four margin values, then draws the resulting page and reports the geometry a production sheet needs, including the margin ratios between the regions.\n\n- Page width runs from 100mm to 230mm and height from 140mm to 330mm, defaulting to 148 by 210mm, which is A5.\n- Body size spans 6pt to 14pt in quarter-point steps and leading from 8pt to 22pt, defaulting to 10.5pt on 14pt.\n- Inner, outer, head and foot margins are all adjustable, and the folio position is set independently in millimetres from the trim.\n- Lines per page is derived from the text block height less 6mm, divided by the leading converted from points to millimetres at 0.3528.\n- Characters per line is estimated from the text block width in points divided by the body size multiplied by 0.5, and the verdict names whether it falls in the 45 to 75 band.\n\nThe five regions are what make a book page different from a web container. The text block is smaller than the page so the margins can do their work: the inner margin protects the text from the gutter, the outer margin holds the reader's thumbs, and the head and foot margins carry the running head and the folio. The panel states two of the conventions as measurements rather than rules — the inner margin should be at least as large as the outer for a page that is bound, and the foot margin should be at least as deep as the head margin because the folio sits there. The ink-on-page share reports the text block as a percentage of the whole page, which is the quickest way to see whether a page has been over- or under-margined. The generated print CSS writes the @page rule with the four margins in the correct order, justifies the body with automatic hyphenation, sets widow and orphan control to two lines, and sizes the folio at 85 percent of the body.\n\n- One page is modelled, so a facing-page spread and the creep that appears in a thick book at the gutter are not shown.\n- The baseline grid is not drawn, so a leading that does not divide the block evenly shows up only in the lines-per-page figure.\n- The margin conventions are reported as measurements without being enforced, so a page with the outer margin deeper than the inner still renders.\n- Characters per line is an estimate based on an average character width rather than the chosen face.\n- The folio is drawn as a placeholder number rather than a real page number, and no running head beyond the text you supply is set.\n\nUse it when a book's page geometry is being decided, since the text block and margin proportions are the decisions that are expensive to revisit once a book is set, and again when a pre-existing trim size has to be checked against a comfortable line count. The lines per page figure is also what a production plan is built from, because it converts into an extent once the word count is known. Where the pages need what each one carries at the top, the running head previewer works that out, the widow and orphan detector finds the bad breaks before they reach proof, and the baseline grid calculator checks that the leading divides the block evenly.",
    howTo: [
      { step: "Set the page width and height, either to a standard trim size or to the dimensions the job specifies." },
      { step: "Enter the body size and leading, which together decide how many lines the text block will hold." },
      { step: "Adjust the inner, outer, head and foot margins and the folio position, watching the text block share and the lines per page readouts." },
      { step: "Check the characters per line verdict, then copy the print CSS, which writes the page rule, the margins and the folio size." },
    ],
    whenToUse:
      "Reach for it when a book's trim size and margins are being decided, when a publisher has supplied a page size and you need to know what type size will fit it comfortably, or when an existing layout is producing a line count that does not suit the manuscript. It is the tool that turns a margin scheme into numbers that can be argued with. For the running head and folio placement, the {{running-head-previewer|running head previewer}} is the companion, the {{widow-and-orphan-detector|widow and orphan detector}} catches the failures that appear once the text flows, and the {{print-type-specification-sheet|print type specification sheet}} records the resulting sizes in points for the printer.",
    faqs: [
      {
        q: "Why must the inner margin be larger than the outer one?",
        a: "Because part of the inner margin disappears into the gutter when the book is bound. A page that looks symmetrical flat becomes cramped at the spine once the sections are sewn or glued, so printers set the inner margin larger to compensate. The panel reports the difference between the two so you can see whether the compensation is there.",
      },
      {
        q: "How do I choose a leading that divides the block?",
        a: "Work backwards. Take the text block height in millimetres, convert the candidate leading to millimetres by multiplying by 0.3528, and divide, then adjust the leading by quarter points until the result is a whole number. The lines-per-page readout tells you where you landed, though the baseline grid calculator shows the alignment directly.",
      },
      {
        q: "What is a good ink-on-page share?",
        a: "It depends on the kind of book, but common ranges sit between roughly 55 and 75 percent of the page for a text-heavy novel. Below that the margins dominate and the page reads as a gift edition; above it the page looks crowded and the lines get long. The share is reported as a percentage so it can be compared against a reference edition.",
      },
      {
        q: "Why is characters per line only an estimate?",
        a: "Because it uses an average character width of half the point size. A face with a narrow set or a small x-height fits more characters into the same block, and a face with generous sidebearings fits fewer. The figure is there to catch a block that is clearly wrong, and the final answer comes from setting a page in the actual face.",
      },
      {
        q: "Does the preview show a spread?",
        a: "No, one page at a time. Facing pages matter for judging margins, since the inner and outer margins mirror across the spread and the gutter is where they meet, so a spread view is worth checking in the page layout tool rather than here. The single page is enough for the geometry and the line count.",
      },
    ],
  },
  "hand-lettering-guide-sheet": {
    keywords: [
      "hand-lettering guide sheet",
      "x-height",
      "cap height",
      "slant guide",
    ],
    intro:
      "The hand-lettering guide sheet prints the ruled page a lettering practice session needs: baseline, x-height, cap height, ascender and descender lines plus an optional slant guide. Every measure is expressed as a ratio of the x-height, which is how exemplars are actually specified.",
    content:
      "The hand-lettering guide sheet builds a printable practice page from one number: the x-height. Everything else on the page is a ratio of it — the cap height, the ascender, the descender and the slant — so a sheet can be re-proportioned for a different script without redrawing anything.\n\nFour guide sets are available, and each one suits a different stage of practice.\n\n- Full set — baseline, x-height, cap height, ascender and descender, which is the sheet for learning a new alphabet.\n- Cap-height only — for practicing capitals where the lowercase body is not the subject.\n- Ascender and descender focus — the two extremes only, for a script whose loops are the hard part.\n- Slant practice — adds the slanted guide line at the chosen angle, for italic and copperplate drills.\n\nFive ratios control the proportions, and the tool keeps them inspectable rather than hiding them behind a preset. Cap height defaults to 1.45 times the x-height, with a range from 1 to 1.8. The ascender starts at 1.6 and is forced to at least the cap height, since an ascender that sits below the capitals is a drawing error rather than a style choice. The descender defaults to 0.75 and can drop to 0.2, which is the shallow case for a script with almost no tails. Slant runs from 0 to 45 degrees, and the sheet reports the horizontal offset one x-height of slant produces, which is the number a ruler can actually check.\n\nThe page is built to print at 100 percent. Each row is the ascender plus the descender plus a fixed 24-pixel gap, the sheet height is the row height times the number of practice rows plus a margin, and the controls are hidden from the printed output. Practice words sit above the baseline, and the guide lines are drawn in light grey and dashed colours so they stay subordinate to the strokes — a guide that competes with the lettering stops being a guide. Up to eight rows fit on a sheet, and the practice word, the reference face and the ratio set can all be changed before printing.\n\nWhere the sheet is limited is worth reading before it is printed for a class.\n\n- The guide lines are geometric ratios, not the metrics of the reference face, so a face with an unusually large x-height will not sit on the cap line the way the sheet implies.\n- The slant guide is a single skewed line rather than a set of slant lines across the row, so a long practice word needs the angle read from the ruler readout rather than eyeballed down the page.\n- Printing depends on the browser dialog: scaling the job below 100 percent shrinks the measured proportions along with everything else.\n- There is no PDF export and no saved sheet, so a set of sheets for a class has to be printed one configuration at a time.\n- Nothing measures the result, so the sheet cannot tell whether the practice strokes are landing on the guides.\n\nUse it when a practice session needs a page that matches a real script's proportions, and again when a lettering commission has to be specified numerically for someone else to draw. The ratio readouts double as the specification: cap height, ascender and descender as multiples of the x-height are exactly the numbers a brief can carry.",
    howTo: [
      { step: "Set the x-height in pixels first, since every other measure on the sheet scales from it and the printed size follows from that number." },
      { step: "Adjust the cap, ascender and descender ratios to match the script, keeping the ascender at or above the cap height as the tool enforces." },
      { step: "Choose the guide set and the slant, then type the practice word that will be printed on every row." },
      { step: "Print at 100 percent scale and check the row height readout against the paper, since browser scaling changes the measured proportions." },
    ],
    whenToUse:
      "Reach for it when a lettering practice page has to match a script's real proportions, when a class needs one sheet per alphabet rather than a generic ruled pad, or when a commission has to be specified so another hand can reproduce the size. The ratio model is the transferable part: cap, ascender and descender as multiples of the x-height. For measuring an existing face rather than planning a sheet, the {{type-scale-generator|type scale generator}} and the {{modular-scale-calculator|modular scale calculator}} give the size ladder, while the {{calligraphy-guideline-generator|calligraphy guideline generator}} works the same ground in nib widths for broad-edge scripts.",
    faqs: [
      {
        q: "Why is the x-height the only size the sheet asks for?",
        a: "Because every other measure on a practice sheet is defined as a multiple of it. Cap heights sit around one and a half x-heights, ascenders a little above that, descenders below, and calligraphic proportions are taught in nib widths of the x-height. One base number plus four ratios describes the whole page.",
      },
      {
        q: "Do the guides follow the metrics of the reference face?",
        a: "No, and that is deliberate. The sheet is a drawing guide, so the lines are the geometric ratios you set rather than the font's own metrics. If a specific face's x-height or cap height is the target, measure it first and enter those ratios, since the guide lines will not bend to the loaded font.",
      },
      {
        q: "What does the slant offset readout mean?",
        a: "It is the horizontal distance one x-height of slant covers, taken as the tangent of the angle. It is useful because a slanted line on a page is hard to verify by eye while a distance is measurable: set a ruler vertically by one x-height and check that the slant line has moved across by that many pixels.",
      },
      {
        q: "Why is the ascender forced above the cap height?",
        a: "Because lowercase ascenders normally rise above the capitals, and a sheet with the ascender line below the cap line invites practice strokes that would be wrong on real letterforms. The tool raises the value to the cap height whenever a lower one is entered, which keeps the sheet drawable even when the two controls disagree.",
      },
      {
        q: "Can I use the sheet for a different paper size?",
        a: "Yes, by changing the x-height rather than the paper. The proportions survive any scale, so a 48-pixel x-height on A4 and a 24-pixel x-height on a smaller pad describe the same hand at two sizes. What does not survive is browser print scaling, which shrinks the rendered lines away from the printed measurements.",
      },
    ],
  },
  "calligraphy-guideline-generator": {
    keywords: [
      "calligraphy guideline generator",
      "nib width",
      "slanted guide",
      "line spacing",
    ],
    intro:
      "The calligraphy guideline generator rules a writing page from the two things calligraphy proportions are actually taught in: nib widths for broad-edge scripts and millimetres for pointed-pen work. Slant, ascender and descender rules follow the chosen script rather than being set from scratch.",
    content:
      "The calligraphy guideline generator draws the ruled sheet a calligrapher writes on, and it starts from the script rather than from the page. Four scripts are modelled, each with the proportions it is normally taught in, and the slanted guide and line spacing follow from that choice rather than being set separately.\n\n- Italic, the cancellaresca hand — five nib widths of x-height with a modest forward slant, so a two-millimetre nib gives a ten-millimetre x-height.\n- Foundational hand — four nib widths, upright, circular bowls, which is why it is the teaching script.\n- Copperplate, a pointed-pen script — no nib-width relationship at all; the proportion comes from the pointed-stroke ratio and the x-height is entered in millimetres, with a steep slant near 55 degrees.\n- Uncial — five nib widths and upright, rounded majuscule forms with almost no ascenders.\n\nFor the three broad-edge scripts the x-height is derived from the nib width rather than typed, and the panel states the arithmetic, so a 2mm nib at five widths reads as a 10mm x-height. The slant is initialised from the script and remains adjustable from 0 to 75 degrees, which matters because the pointed-pen hands sit far steeper than the broad-edge ones. Ascenders are taken at 1.6 times the x-height and descenders at 0.7, both stated as derivations in the reference table rather than presented as fixed rules of calligraphy. The millimetre-to-pixel conversion the sheet uses is 3.78, the figure approximated from a 96 dots-per-inch screen, and the line spacing is the ascender plus the x-height plus the descender plus a small gap, reported in millimetres so it can be compared with the nib on the desk.\n\nOn the page, the baseline is drawn solid and the other rules dashed, the slant appears as one skewed line per row, and the practice alphabet is set small and grey at the baseline of each row. Up to ten rows can be generated, and the print action hides the controls so only the sheet comes out. The intentional limitation of the page is that it describes proportions, not a hand: the same rules that serve a formal italic will not make a beginner's strokes even.\n\nThe printed sheet comes with a few caveats that are easy to miss.\n\n- The sheet prints at whatever scale the browser dialog uses, so a scaled job loses the millimetre relationships the table reports.\n- The pixel conversion is fixed at 3.78, so a device with a different assumed resolution shows a slightly different physical size on screen; the printed result is what carries the measurement.\n- The practice alphabet is a single line of characters and cannot be set in more than one size per sheet.\n- Copperplate proportions are entered directly, since a pointed nib has no width relationship to the x-height and the tool does not pretend otherwise.\n- Nothing checks the nib against the x-height after you override the derived value, so an unrealistic combination can be printed.\n\nUse it at the start of a calligraphy session when the nib has to be matched to a comfortable x-height, and when a script's slant or ascender rule has to be confirmed rather than remembered.",
    howTo: [
      { step: "Choose the script, which sets the nib-width relationship, the slant and the default x-height together." },
      { step: "Enter the nib width for a broad-edge hand and read the derived x-height, or type the x-height directly for pointed-pen work." },
      { step: "Set the slant and the number of rows, then read the line spacing in millimetres to check it against the dip of the nib." },
      { step: "Print the page and confirm the scale is 100 percent, because the table's measurements assume it." },
    ],
    whenToUse:
      "Reach for it when a nib has to be matched to a comfortable x-height, when a script's slant and ascender rules need confirming in millimetres, or when a calligraphy class needs ruled sheets that follow the teaching proportions instead of a generic ruling. The nib-width arithmetic is the part worth carrying away. Where the sheet is for a drawn hand rather than a nib, the {{hand-lettering-guide-sheet|hand-lettering guide sheet}} works in x-height ratios, the {{lettering-style-previewer|lettering style previewer}} covers brush and marker traditions, and the {{monogram-letter-designer|monogram letter designer}} takes the same proportions into a single framed letter.",
    faqs: [
      {
        q: "Why is the x-height derived from the nib width?",
        a: "Because that is how broad-edge proportions are taught and how they stay consistent. A hand is defined as a number of nib widths tall, so the x-height changes whenever the nib does, and entering the nib once keeps the sheet matched to the pen in your hand rather than to an abstract size.",
      },
      {
        q: "Why does Copperplate skip the nib-width relationship?",
        a: "Because a pointed nib has no edge width to measure. Its stroke weight comes from pressure, so the proportions are set by the pointed-stroke ratio and the x-height is entered in millimetres. The tool says so on the panel instead of inventing a width for a pen that does not have one.",
      },
      {
        q: "What millimetre figure does the sheet trust?",
        a: "The printed one. The screen conversion uses 3.78 pixels per millimetre, taken from a 96 dots-per-inch assumption, so the on-screen ruler may be a fraction out depending on the display. Print at 100 percent and the millimetres in the table are the millimetres on the paper.",
      },
      {
        q: "How is the line spacing worked out?",
        a: "It is the ascender plus the x-height plus the descender plus a small gap, all converted to millimetres. That is the smallest spacing in which a full ascender and a full descender can coexist without the next row's ascenders touching the row above's descenders.",
      },
      {
        q: "Can I use the same slant for every script?",
        a: "You can, but the scripts disagree about it for a reason. Broad-edge hands sit near upright because the nib is held at an angle to the baseline, while pointed-pen scripts want a steep slant that suits the flex of the nib. The tool seeds each script with its own value and leaves it adjustable.",
      },
    ],
  },
  "opentype-feature-explorer": {
    keywords: [
      "opentype feature explorer",
      "font-feature-settings",
      "small caps",
      "tabular figures",
    ],
    intro:
      "The OpenType feature explorer toggles the features webfonts actually ship and shows each sample line changing as the tags are switched. Two facts are stated rather than hidden: features are font-dependent, and the modern CSS properties are preferred over raw tag settings.",
    content:
      "The OpenType feature explorer switches the features a webfont may or may not contain and renders a sample line for each one, so the effect can be seen before it is trusted. Twelve tags are covered, from the ones every text face ships to the ones only a few families implement.\n\nThe tags are grouped by what they change.\n\n- Shaping basics: kerning and standard ligatures, which are on by default in any sensible stylesheet.\n- Letterform variants: discretionary ligatures, small caps, and stylistic alternates with the first two stylistic sets, which are the tags most likely to be missing from a given face.\n- Figures: old-style figures, tabular figures and fractions, which matter whenever numbers sit in a table or a paragraph.\n- Position and case: superscript forms and case-sensitive punctuation, which adjust marks near capitals.\n\nThe samples are not decorative, they are the evidence. The tabular figures sample stacks four ones over four nines, which is where equal widths show themselves as a clean column; the old-style sample shows how the same digits sit within a line of text; the small caps sample is set in lower case so the rendered result exposes whether the face has real small capitals or is synthesising them by shrinking capitals; and the case-sensitive sample puts capitals inside brackets, where the difference between a default and an adjusted form is visible immediately.\n\nThe two CSS modes are the part that matters in a stylesheet. The raw mode writes font-feature-settings as a list of all twelve tags with each value set to one or zero, which is explicit and also blunt: the tags that are off are actively disabled, and the declaration has to be maintained whenever a new tag is used. The property mode emits the registered font-variant properties instead — variant-ligatures, variant-numeric, variant-caps, variant-position and variant-alternates — which inherit and cascade like ordinary CSS and leave anything unmapped at its default. The reference table lists which property corresponds to each tag, so a design system can be written in properties and only fall back to raw tags for unregistered stylistic sets.\n\nTwo honest limits are stated on the panel, and two more follow from the way features are requested.\n\n- A feature the font does not contain is ignored silently, with no error and no warning, so an unconfirmed tag produces no visible change and no complaint; the panel therefore lists which tags the chosen face plausibly ships, as a guide rather than a guarantee.\n- Feature interaction is not modelled, since two tags can affect the same glyph, so combining several on one line is the only way to see the true result.\n- The raw mode writes all twelve tags with explicit values, so the declaration has to be regenerated whenever a tag is added to the design.\n- Nothing compares the rendered output against a synthesised alternative, so a face without true small capitals will simply look as though the feature did nothing.\n\nRead the samples as the evidence and the reference table as the mapping: what a tag does is a property of the font, and what CSS should carry is a property of the project.",
    howTo: [
      { step: "Choose the face first and read the likely-present column, since the tags a face supports are the ones worth switching on." },
      { step: "Toggle the tags one at a time and watch their sample lines, using the custom sample field when the text you care about differs from the default." },
      { step: "Switch between the raw and property CSS modes to see both declarations and decide which the project's stylesheet should carry." },
      { step: "Copy the generated declaration, then confirm on a real page that the face actually contains the features and that nothing is being synthesised." },
    ],
    whenToUse:
      "Reach for it when a design calls for small caps or old-style figures and it is unclear whether the face ships them or the browser is faking them, when a stylesheet needs to move from raw feature tags to the registered properties, or when a typographic detail behaves differently in different browsers. Seeing the sample change is the test. For spacing rather than features the {{kerning-pair-inspector|kerning pair inspector}} measures pair adjustments, the {{variable-font-sliders|variable font sliders}} explore axis values, and the {{font-specimen-sheet|font specimen sheet}} shows the whole repertoire as a printable page.",
    faqs: [
      {
        q: "What happens if a font lacks the feature I enable?",
        a: "Nothing, and nothing is reported: the tag is ignored silently, the sample line stays as it was, and there is no error in the console. That is why the panel lists which tags the chosen face plausibly carries — a feature that a face does not contain cannot be requested into existence.",
      },
      {
        q: "Should I use font-feature-settings or the font-variant properties?",
        a: "Prefer the properties wherever one exists, because they inherit and cascade and can be overridden by component styles. Raw tag settings are a single declaration that is not inherited in the same way and must list every tag it wants to affect, so they belong to unregistered stylistic sets and to cases the properties cannot express.",
      },
      {
        q: "How do I know whether a face ships real small caps?",
        a: "By comparing the rendering against a synthesised version. Real small capitals are drawn at a slightly larger height and a heavier stem than scaled capitals, so a line set in lower case with the small caps feature on should look steadier than one where the browser shrinks capitals to fit. The panel's likely-present list points at faces that ship the feature.",
      },
      {
        q: "Why do tabular figures matter?",
        a: "Because proportional digits have different widths, so numbers in a table or a column do not align. Tabular figures are drawn on a single advance width, which makes a column of figures line up. The sample uses stacked ones and nines precisely because that pair exposes the difference most clearly.",
      },
      {
        q: "What are stylistic sets?",
        a: "Numbered groups of alternates that a type designer chooses to expose, such as an alternate a, g or single-storey form. They are not standardised beyond their tags, so a set that changes a letter in one family may do something different in another, and the sample line is the only reliable description.",
      },
    ],
  },

  "monogram-letter-designer": {
    keywords: [
      "monogram letter designer",
      "interlocking letters",
      "frame clearance",
      "inline svg",
    ],
    intro:
      "The monogram letter designer sets two or three initials in a frame and exports the mark as inline SVG. A monogram is a spacing problem before it is a drawing problem, so the tool reports the overlap, the tracking and the frame clearance the letters actually have.",
    content:
      "The monogram letter designer takes up to three initials, sets them in a chosen face and frames the result, then exports the whole mark as inline SVG that scales from a favicon to signage.\n\nFour choices shape the mark, and the last three are all about how the letters share the box.\n\n- Layout — interlocked, evenly spaced or stacked. Interlocking letters are the classic two-letter form, evenly spaced leaves each initial its own column, and stacking suits three initials that would otherwise crowd.\n- Frame — none, circle, rounded square, diamond or shield, each drawn as a stroked path that scales with the box rather than as a fixed image.\n- Size — 60px to 320px, with the letter size derived from it: two initials are set at roughly 0.62 of the box, three drop to about 0.42 so the row still fits.\n\nOverlap and tracking are separate controls because they solve different problems. Overlap runs from 0 to 0.4 em and shifts each successive letter toward the previous one, which is what makes two initials interlock. Tracking runs from minus 0.05 to 0.4 em and changes the space between letters without moving their anchors. A three-letter mark usually needs the middle letter treated differently — reduced, raised or tracked out — and the panel says so rather than letting the row become a block. The frame stroke is adjustable from 0 to 12px and is redrawn proportionally in the small-size previews, since a stroke that reads at 320px looks like a heavy collar at 24px.\n\nThree properties decide whether the mark survives.\n\n- The frame is sized to the letters' optical bounds rather than their em boxes, because a mathematically centred monogram looks high on the page; the frame clearance readout reports how much of the box the letters leave free.\n- Legibility at small sizes is reported from the letter count, and three initials in a tight frame are flagged as the case that needs a simpler treatment.\n- The exported SVG carries an accessible label built from the initials, so the mark is not silent to a screen reader when it is the only content of a link or a header.\n\nA few things are left to whoever places the mark.\n\n- The export is one flat ink colour; a two-colour monogram or a metallic fill has to be styled in the surrounding code.\n- The preview ladder shows 24, 40 and 64 pixels only, so intermediate sizes have to be judged in a browser rather than on the page.\n- Nothing checks the initials against the frame at extreme overlaps, so a hostile combination can be exported as it stands.\n- The letters are set in the catalogue faces, so initials in a proprietary logo face cannot be proofed here.\n- The SVG is a live text element rather than outlines, so a viewer without the face installed falls back to the generic family.\n\nUse it when a mark has to be settled quickly, when an existing monogram reads as crowded or as floating in its frame, or when a design system needs the same initials at three scales.",
    howTo: [
      { step: "Enter the initials and read the legibility readout, since a third letter changes how much of the box each one can take." },
      { step: "Pick the layout and the frame, then set the size to the largest context the mark appears in." },
      { step: "Use overlap to interlock and tracking to even out the spacing, watching the frame clearance readout rather than judging the centre by eye." },
      { step: "Read the small-size ladder before exporting, and simplify the frame or drop a letter if the 24-pixel version stops reading." },
    ],
    whenToUse:
      "Reach for it when initials have to be set as a mark, when an existing monogram is crowded, high in its frame or unreadable at favicon size, or when one set of initials has to work on a letterhead and in a browser tab. Overlap and clearance are the two numbers that decide most of it. For the surrounding wordmark, the {{logo-type-tester|logo type tester}} tests the same mark at small sizes, the {{lettering-style-previewer|lettering style previewer}} covers drawn alternatives, and the {{type-hierarchy-planner|type hierarchy planner}} keeps a lockup consistent across the rest of a page.",
    faqs: [
      {
        q: "How many initials can a monogram carry?",
        a: "Three at most, and two is usually better. A two-letter mark interlinks without effort, while three needs the middle letter reduced or raised to keep the row from reading as a solid bar. The tool caps the input at three and reports the legibility verdict for the count you enter.",
      },
      {
        q: "What is the difference between overlap and tracking?",
        a: "Overlap moves each successive letter toward the previous one, so the forms interlock and share space. Tracking changes the spacing between letters without moving their anchors, which evens out a pair that will not touch. Interlocking marks are tuned with overlap; spaced marks with tracking.",
      },
      {
        q: "Why does a mathematically centred monogram look wrong?",
        a: "Because centring uses the em box while the eye reads the ink. A cap with no descender leaves space at the bottom of its box, so a perfectly centred setting appears to float high. The frame is therefore sized to the letters' optical bounds, and the clearance readout reports the room those bounds leave.",
      },
      {
        q: "Is the exported SVG editable type or outlines?",
        a: "It is live text inside an SVG, so the initials stay editable and the file stays small. The trade-off is that the face has to be available wherever the mark renders; converting the text to outlines before shipping avoids a fallback face appearing on someone else's machine.",
      },
      {
        q: "Why does the small-size preview redraw the frame stroke?",
        a: "Because a stroke scales with the viewBox, and a 6px rule that looks refined at 320 pixels reads as a heavy band at 24 pixels. The small previews thin or thicken the frame proportionally so the mark can be judged at browser-tab size rather than only at logo size.",
      },
    ],
  },
};
