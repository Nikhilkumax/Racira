import { PRIVACY_SECURITY_TEXT } from "../privacy";
import type { ToolSeoEntry } from "../tool-seo";

/**
 * Racira Fonts SEO content — batch 1 (preview + type scale & spacing).
 *
 * Written against the real components: defaults, control names and outputs in
 * this copy match what the tool actually renders. Keep it that way — the audit
 * re-checks that a live tool has an entry here.
 */
export const typographySeoBatch1: Record<string, ToolSeoEntry> = {
  "font-previewer": {
    keywords: [
      "font previewer",
      "preview sample text",
      "letter spacing slider",
      "italic toggle",
    ],
    intro:
      "The font previewer renders your own copy in any face from the shared catalogue and adjusts the four properties that change how a setting reads. Size, weight, leading and tracking are all live, with an italic toggle, and the page also shows the same face down a size ladder.",
    content:
      "The font previewer takes a sample string and five controls, then renders the preview sample text large, again down a fixed ladder of sizes, and once more as the CSS that would reproduce it.\n\n- The family list is the catalogue the whole typography domain loads, so every face in the picker has its webfonts on the page already.\n- Size runs from 12px to 160px, defaulting to 64px, which is a display size rather than a body one.\n- Weight is a row of buttons rather than a slider, so only the weights a face actually ships can be selected, and the default is 600.\n- The letter spacing slider spans minus 5 to 20 pixels in half-pixel steps, while line height spans 0.8 to 2.5 in steps of 0.05 with a default of 1.2.\n- The italic toggle switches the style, and the preview panel is sized to hold a display setting without reflowing the page as the sample changes.\n\nThe built-in ladder is the part that separates this from a single-line preview. The sample is rendered again at 14, 18, 24, 32, 48, 72 and 96 pixels with the same weight, tracking and italic setting, each row labelled in pixels and truncated with an ellipsis, so the face's behaviour across the whole range is visible without touching the sliders. That is what makes a display face that looks confident at 72px reveal whether it holds up at 18px, and vice versa. The tracking control is deliberately in pixels rather than ems, which is what a designer reaches for when nudging a heading, while the CSS panel writes the same value out with the family stack, size, weight, leading, tracking and style so the setting can be lifted into a stylesheet.\n\n- The face list is the shared catalogue. A font file that is not loaded by this domain cannot be previewed here.\n- The italic toggle applies a synthetic slant when a face ships no true italic, and nothing warns you when that happens.\n- The built-in ladder uses seven fixed sizes and a line height of 1.1, so it is not a substitute for a ladder you choose yourself.\n- No metric data is shown, so two faces that look similar here cannot be compared on x-height or cap height.\n- The output is a handful of declarations rather than a class, and nothing is saved between visits.\n\nUse it when a face is being chosen for a specific line of copy, when a heading needs its tracking nudged against a real layout, or when you want to see how a family behaves from 14px to 96px before committing to it. Where the size ladder has to match a real scale, the waterfall font preview takes an editable list of sizes, and where the copy itself matters more than the display setting, the custom text font preview prints its own word and character counts. The web font tester covers what the reader sees before the file arrives, the custom text font preview is the version built for pasting real copy, and the waterfall font preview takes an editable ladder of sizes when the 14-to-96 default does not match a project's scale.",
    howTo: [
      { step: "Paste the copy you actually want to judge into the sample field, then pick the family from the catalogue list." },
      { step: "Drag the size slider from a display size down to a body size and back, watching whether the face keeps its character at both ends." },
      { step: "Set the weight from the buttons, then use line height and tracking to find the setting where the sample sits comfortably." },
      { step: "Check the same face down the waterfall panel, then copy the CSS block with the six declarations you want to keep." },
    ],
    whenToUse:
      "Reach for it when a face is being chosen for a headline, when a setting needs a small correction to tracking or leading, or when a client needs to see the same copy in a family from the catalogue in seconds. It is the general-purpose entry point to the domain's faces. For a size ladder that matches a real type scale, the {{waterfall-font-preview|waterfall font preview}} is the closer tool, the {{font-specimen-sheet|font-specimen sheet}} lays out the full character set for a handover, and the {{custom-text-font-preview|custom text font preview}} is the version to use when the copy is a paragraph rather than a headline.",
    faqs: [
      {
        q: "Why are the weight options buttons rather than a slider?",
        a: "Because a face only ships the weights it ships. A slider would imply that every value between 100 and 900 is available, whereas the buttons offer the weights in the catalogue. Selecting one that a particular face does not carry simply renders the nearest available weight rather than synthesising a new one.",
      },
      {
        q: "Is the italic real or synthesised?",
        a: "It depends on the face. Some catalogue families ship a true italic with its own letterforms, and others do not, in which case the browser slants the roman. Nothing in the panel says which applies, so if the italic is central to a design, compare it against the roman and check whether the letterforms changed shape rather than just leaning.",
      },
      {
        q: "What does the waterfall panel add?",
        a: "It shows the same setting at seven sizes at once, from 14px to 96px, which is how you see whether a face that looks confident at display size holds together in a caption. Every row shares the weight, tracking and italic setting of the main preview, so the panel is a view of the current setting rather than a separate comparison.",
      },
      {
        q: "Why is tracking measured in pixels here?",
        a: "Because that is how tracking is adjusted on a display heading: a designer nudges the space between letters by a pixel or two until the line sits right. The CSS panel writes the same pixel value, so the visual adjustment and the declaration always agree. For tracking that scales with the type size, ems are the better unit and the custom preview uses them.",
      },
      {
        q: "Can I preview a font file from my own machine?",
        a: "Not here. The picker offers the faces this domain loads, which is deliberate: it keeps one catalogue so a family can never appear in a list without its webfont being available. A file you own has to be added to that catalogue, or tested in the declaration builder and rendered on a page of your own.",
      },
    ],
  },

  "modular-scale-calculator": {
    keywords: [
      "modular scale calculator",
      "geometric scale",
      "scale table",
      "effective ratio",
    ],
    intro:
      "The modular scale calculator works the arithmetic of a geometric type scale: each size is the base multiplied by the ratio raised to the step. Steps run in both directions from the base, so the table shows the sizes above and below it in one view.",
    content:
      "The modular scale calculator takes a base size, a unit, a ratio and a step count, then prints a scale table covering every step from the top of the scale down to the bottom.\n\n- The base unit can be pixels, rems or points, and the table converts each row into the other unit using a root size you supply.\n- Ten named ratios are offered, from the minor second at 1.067 through the major third at 1.25 to the octave at 2, and a custom ratio can be typed for anything else.\n- Steps up and down can be set from one to ten, so the table always runs symmetrically around the base rather than only upward.\n- Each row reports its step label, the multiplier applied to the base, the resulting size and its conversion into the other unit.\n- The readouts report the effective ratio, the full range of the scale, and the size increase produced by five steps.\n\nThe two directions are what make the table useful. Steps above the base give the heading sizes, and steps below give captions and footnote sizes, so a scale that runs from minus three to plus five can be read as a single ladder. Each row's multiplier is shown as well as the result, which is what makes the compounding visible: at a major third, one step up is 1.25 times the base, two steps is 1.5625 and five steps is 3.05, so the sizes do not increase by a constant amount but by a constant proportion. That is the property that distinguishes a geometric scale from a hand-built list of sizes, and it is also why small ratios are needed when a page carries many levels: at a ratio of 1.5, five steps above the base already place a heading at seven and a half times the body size. The custom ratio exists for the case where a project's own scale does not come from the named set.\n\n- The table is arithmetic only: it says nothing about whether the sizes suit a layout or whether the resulting line lengths work.\n- The conversion between units uses a single root size, so a document that changes its root at a breakpoint is not represented.\n- Named ratios are offered as a convenience rather than as recommendations, and the custom option accepts any value above one.\n- Steps are capped at ten in each direction, which keeps the table readable and bounds the largest size it can show.\n- Nothing models leading, so the vertical consequence of each size has to be worked out elsewhere.\n\nUse it when a scale has to be checked rather than chosen, when a set of sizes needs its ratios explained, or when a client asks why the heading is exactly that size. The multiplier column answers that question arithmetically. Where the steps have to be assigned to roles, the type scale generator does that mapping, and where the scale has to be fluid, the fluid type scale builder derives the clamp values. The type scale generator maps the steps to roles, the font size preview converts the sizes a second way against the browser's root, and the fluid type scale builder makes the same scale responsive between two viewports.",
    howTo: [
      { step: "Enter the base size and choose the unit the design works in, then read the base row to confirm the value landed as expected." },
      { step: "Pick a ratio from the named set or type a custom value, and watch the range readout change with it." },
      { step: "Set the number of steps up and down so the table covers every size the page needs, and check that adjacent steps are distinguishable." },
      { step: "Read the multiplier column to see the compounding, then copy the sizes into the scale or into a design token file." },
    ],
    whenToUse:
      "Reach for it when a scale needs verifying rather than choosing, when the ratios behind an existing set of sizes have to be explained, or when a project's sizes have to be reconciled onto one ratio. The multiplier column makes the compounding visible, which is what makes the arithmetic arguable. For assigning steps to roles, the {{type-scale-generator|type scale generator}} does the mapping, the {{font-size-preview|font size preview}} converts the sizes into the units a stylesheet and a printer need, and the {{fluid-type-scale-builder|fluid type scale builder}} turns the scale into a responsive one.",
    faqs: [
      {
        q: "What does geometric mean here?",
        a: "That each step multiplies the previous one by the same ratio, so sizes grow by a constant proportion rather than a constant amount. At a major third, one step is 1.25 times the base and five steps is 3.05 times it. That is what keeps the relationships between the sizes consistent however far up the scale a role sits.",
      },
      {
        q: "Why run steps below the base as well as above it?",
        a: "Because captions, footnotes and legal text sit below the body size, and they belong on the same scale rather than being chosen separately. A scale running from minus three to plus five covers a caption through to a display heading in one ladder. The symmetry is only of convenience: the step count is what you set.",
      },
      {
        q: "Which ratio should a page use?",
        a: "It depends how many levels there are. A page with six or seven distinct sizes needs a gentle ratio such as 1.125 or 1.2, because a larger one pushes the upper steps to unusable sizes. A display-led page with three or four levels can afford 1.333 or 1.5. The range readout shows the consequence of the choice immediately.",
      },
      {
        q: "How accurate is the unit conversion?",
        a: "Exact for the arithmetic, and dependent on the root size you supply for rems. A rem is one root em, so the conversion assumes a single root value for the whole document. A project that changes its root font size at a breakpoint has two valid conversions, and the table can only show one of them.",
      },
      {
        q: "Can a scale mix two ratios?",
        a: "Not in this tool, which works on one ratio at a time. Mixed scales are real, usually built by taking alternate steps from two interleaved ratios to produce more usable sizes in the middle of the range. They have to be assembled by hand from two tables, and the type scale generator's per-role steps are where the combined result is expressed.",
      },
    ],
  },

  "type-scale-generator": {
    keywords: [
      "type scale generator",
      "scale ratio",
      "role steps",
      "css variables",
    ],
    intro:
      "The type scale generator assigns each role on a page a step on one geometric scale, previews every role at its true size and exports the result as CSS variables. Line heights follow the usual pattern: tighter as the sizes grow.",
    content:
      "The type scale generator takes a base size, a ratio and a step number for each role, then renders every role at its true size and writes the whole scale out as custom properties.\n\n- Eight roles are mapped: the six heading levels, body and a small size, each with its own step on the scale.\n- The base size runs from 10px to 24px, and the scale ratio is chosen from six named options spanning the minor third at 1.2 through to the golden ratio at 1.618.\n- Role steps are editable per role and clamped between minus six and ten, so a role can sit below the base as well as above it.\n- A role's size is the base multiplied by the ratio raised to its step, which is what makes the whole scale follow from two numbers.\n- The exported CSS variables are named per role and written in pixels to three decimal places, so no role depends on another through arithmetic in the stylesheet.\n\nThe defaults show how a conventional hierarchy is built: the first heading sits five steps above the base, the second four, and each level down loses one step until the sixth heading and the body share step zero, with the small size one step below. The preview is what makes the numbers arguable, because every role is rendered at its actual size in one column with its computed pixel value shown, and the line height is derived rather than fixed: a heading's leading falls as its size grows, from around 1.4 at the smaller steps towards 1.05 at the top, while body and small text hold steady at 1.6. That pattern exists because large type needs proportionally less leading than small type, and hard-coding one value across a scale is the usual way a heading ends up looking cramped at the top of the ladder. The span readout reports the ratio between the first heading and the body, which is the single number that describes how dramatic the scale is.\n\n- The exported sizes are in pixels, so a rem-based or fluid system has to convert them.\n- Line heights are computed by a formula rather than set per role, so a role needing unusual leading has to be overridden afterwards.\n- The scale is geometric only, so a scale built on two interleaved ratios is not representable.\n- Steps are clamped, and a value outside the range is silently reduced to the nearest bound rather than rejected.\n- Nothing checks whether two adjacent roles are actually distinguishable at their rendered sizes, which is a judgement the preview supports rather than automates.\n\nUse it when a page's hierarchy is being defined from scratch, when an existing set of sizes needs checking against a single ratio, or when the number of distinct sizes is being reduced. The span readout is the quickest summary of how the scale will feel. Where the arithmetic itself has to be inspected step by step, the modular scale calculator shows the table of multipliers, and where the scale has to be fluid across viewports, the fluid type scale builder turns the same steps into clamp values. The modular scale calculator shows the underlying table, the fluid type scale builder makes the scale responsive, and the font size preview converts the resulting sizes into rem and points.",
    howTo: [
      { step: "Set the base size and choose the ratio, which immediately rescales every role in the preview." },
      { step: "Adjust the step number for each role, watching the preview column as each one moves at its true size." },
      { step: "Check that adjacent roles are still distinguishable, since two roles sharing a step will render identically." },
      { step: "Read the span readout for the heading-to-body ratio, then copy the variables into the stylesheet." },
    ],
    whenToUse:
      "Reach for it when a hierarchy is being built from scratch, when a set of sizes that grew ad hoc needs reconciling against one ratio, or when the number of sizes has to be reduced without losing the levels. For the underlying arithmetic the {{modular-scale-calculator|modular scale calculator}} shows every multiplier in a table, the {{fluid-type-scale-builder|fluid type scale builder}} derives the responsive version with clamp, and the {{font-size-preview|font size preview}} converts the resulting sizes into rem and points for the stylesheet and the printer.",
    faqs: [
      {
        q: "How many steps should a heading sit above the base?",
        a: "Enough that the first heading dominates without the page looking like a poster. The defaults put it five steps above the base, which at the major third ratio gives a span of roughly three times the body size. A span readout between two and four times is the common working range for an editorial page, and interfaces tend to sit lower.",
      },
      {
        q: "Why do smaller ratios suit interfaces?",
        a: "Because an interface has more roles packed into a smaller range of sizes. A ratio of 1.2 or 1.25 gives distinguishable steps without any single size becoming disproportionate, while the golden ratio produces dramatic jumps that suit a display-led design with few levels. The ratio is the main lever on how much contrast the whole hierarchy has.",
      },
      {
        q: "Why is the line height computed instead of set?",
        a: "Because large type needs less leading than small type. The formula tightens the leading as sizes grow, from about 1.4 down towards 1.05 at the top of the scale, while body and small text hold at 1.6. Setting one value everywhere is what makes a large heading look cramped and a caption look loose at the same time.",
      },
      {
        q: "What happens if two roles share a step?",
        a: "They render at the same size, which the preview will show clearly since both rows carry their computed pixel values. That is sometimes deliberate, as with body and the sixth heading in the defaults, though a heading at body size needs to separate itself by weight or family instead. Two adjacent roles sharing a step without a reason is the commonest scale defect.",
      },
      {
        q: "Why export the sizes as variables rather than as rules?",
        a: "Because the scale is a decision about sizes, and the rules that apply them belong elsewhere. Emitting one variable per role means the sizes can be consumed by headings, components and utilities without each of them re-deriving the arithmetic, and a change to the ratio can be applied in one place. It also keeps the scale independent of the element names.",
      },
    ],
  },

  "fluid-type-scale-builder": {
    keywords: [
      "fluid type scale builder",
      "clamp",
      "slope and intercept",
      "viewport range",
    ],
    intro:
      "The fluid type scale builder turns two design points into a scale of clamp values, so type grows continuously between a narrow and a wide viewport instead of jumping at breakpoints. Every step shares one viewport range and one slope.",
    content:
      "The fluid type scale builder takes a min and max viewport, a min and max body size, a root size and a ratio, then derives the clamp value for each role on the scale.\n\n- The viewport pair defaults to 360 pixels at the narrow end and 1440 at the wide end, which is the range most designs are drawn against.\n- The body size pair defaults to 15px and 18px, so the smallest viewport gets the smaller value and the largest gets the larger one.\n- Five roles are derived: the first, second and third heading levels at three, two and one steps above the body, the body itself at step zero, and a small size one step below.\n- The ratio on which the steps are built can be set, so the whole scale follows one proportion as well as one viewport range.\n- Each role is emitted as a clamp with a minimum, a preferred term and a maximum, written in rem units against the root size you supply.\n\nThe arithmetic behind the preferred term is a straight line through the two design points, and the slope and intercept are its two parameters. The slope is the difference between the two sizes divided by the difference between the two viewport widths, and the intercept is the smaller size minus the slope multiplied by the smaller viewport width. The preferred term is then the intercept plus the slope expressed against the viewport, which is why the output reads as a fixed rem value plus a viewport-relative one. Below the minimum viewport the font pins to the minimum size and above the maximum it pins to the maximum, so the text never grows beyond the range the design was tested in. The readouts give the slope in both viewport units and pixels per pixel, the intercept in pixels, and the preferred term in its final form, which is the useful thing to check before the CSS is pasted: a very steep slope means the type will change noticeably across the range, and a preferred term whose rem component dominates means the viewport influence is small.\n\n- The scale is derived from one body pair multiplied by the ratio, so a role needing a size outside that progression has to be written by hand.\n- Only one viewport range is modelled, so a third breakpoint with its own range needs a separate calculation and a media query.\n- The output assumes a stable root size, and a document that changes its root at a breakpoint invalidates the rem components.\n- The clamp values are generated for the five roles listed, so captions, quotes and interface text are outside the scale.\n- Nothing checks the result against a real layout, so whether the largest size fits its container has to be tested on the page.\n\nUse it when a type scale has to be responsive rather than stepped, when the jumps between breakpoints are visible and unwanted, or when a design pair has been drawn at two viewport widths and the middle of the range needs filling in. The slope readout is the part to check first, since a steep line is the commonest reason a fluid scale looks wrong at the ends. Where a single fluid value is needed rather than a scale, the clamp calculator works on one dimension, and where the steps themselves need deriving, the type scale generator and the modular scale calculator do that. The CSS clamp calculator covers a single value, the type scale generator derives the steps, and the CSS fluid typography builder writes the wider set of fluid typography rules.",
    howTo: [
      { step: "Enter the two viewport widths the design was drawn at, then the body size at each of them." },
      { step: "Set the root size and the ratio, and read the slope and intercept to see how steep the line through the two points is." },
      { step: "Check the role table, which lists each step's size range and its clamp value, and confirm adjacent steps stay distinguishable at both ends." },
      { step: "Copy the variables, then test the largest size in its real container at the wide viewport before the scale is adopted." },
    ],
    whenToUse:
      "Reach for it when a scale has to be responsive rather than stepped, when the size jumps between breakpoints are visible, or when a design pair exists at two widths and the range between them has to be filled in continuously. For a single fluid value the {{css-clamp-calculator|CSS clamp calculator}} is the narrower tool, the {{type-scale-generator|type scale generator}} derives the steps that the fluid version grows from, and the {{modular-scale-calculator|modular scale calculator}} shows the multipliers behind the ratio.",
    faqs: [
      {
        q: "What are the slope and intercept actually computing?",
        a: "They are the two parameters of the straight line that passes through your two design points. The slope is the size change per unit of viewport width, and the intercept is where that line would sit at a viewport of zero. Those two numbers become the preferred term of the clamp, with the intercept as a fixed rem value and the slope multiplied by the viewport as the fluid part.",
      },
      {
        q: "Why does the value pin at the ends?",
        a: "Because the clamp has a minimum and a maximum around the preferred term. Below the smaller viewport the line would keep producing smaller sizes, and above the larger one it would keep growing, so the clamp pins the value at the sizes the design was tested at. That is the entire purpose of using a clamp rather than a viewport-relative value on its own.",
      },
      {
        q: "What slope is too steep?",
        a: "It depends on how much change the design wants across the range, but a slope that produces more than about a forty per cent size change between the two viewports tends to be visible as the window is resized. The readout gives the slope in viewport units, so a value around 0.3 to 0.5vw per hundred for body copy at a common range is typical, and higher values are usually only wanted for display headings.",
      },
      {
        q: "Why are the sizes written in rem rather than pixels?",
        a: "So the scale still respects a reader's own font size setting. A clamp whose ends are expressed in rem scales with the root, which means a reader who has set a larger base size gets a larger scale rather than the same one. The viewport-relative middle part is what makes the scale fluid, and the rem parts are what keep it accessible.",
      },
      {
        q: "Do I still need breakpoints?",
        a: "For the type scale, usually not, since the values interpolate continuously. Layout still changes at breakpoints, so a design will keep them for columns, spacing and components. What the fluid scale removes is the type sizes changing abruptly at each one, which is the usual reason a page appears to reflow its text as the window narrows.",
      },
    ],
  },

  "baseline-grid-calculator": {
    keywords: [
      "baseline grid calculator",
      "baseline unit",
      "snapped line-height",
      "spacing steps",
    ],
    intro:
      "The baseline grid calculator derives the one number a vertical grid is built from — the body size times the body line-height — and then reports what a heading has to do to sit on it. The answer is usually a line-height that is a shade off the design value.",
    content:
      "The baseline grid calculator takes five numbers and returns the grid they imply. The baseline unit is the body font size multiplied by the body line-height: a 16px body at 1.5 gives a 24px unit, which is the distance between two baseline stripes and the module every other line box has to be a whole multiple of.\n\nFour values describe the grid, plus a root size for the rem conversions.\n\n- Body font size and body line-height, which together produce the baseline unit in pixels and in rem.\n- Heading font size and heading line-height, which give the heading's natural line box — the measurement that almost never lands on the grid.\n- Root size, so the unit and the spacing steps are expressed in the rem values a page actually uses.\n- The row count, which is the natural box divided by the unit and rounded to a whole number of rows with a floor of one.\n- The snapped line-height, which is that row count multiplied back by the unit and divided by the heading size, ready to paste.\n\nThe arithmetic is the interesting part. A 40px heading at a line-height of 1.2 has a 48px box; against a 24px unit that is exactly two rows, so the snapped value is unchanged and the heading was already on the grid. Change the unit to 20px and the same heading wants 48 divided by 20, which rounds to two rows — 40px, a snapped line-height of 1.0 — and the heading now sits on the grid with visibly tighter leading. The panel's own note says the box is rounded up to whole rows, while the arithmetic rounds to nearest with a one-row floor, so a box that falls just under a multiple can be pulled down as easily as up. That is worth knowing when the result looks tighter than expected rather than looser.\n\nThe output is a small stylesheet rather than a single number. It declares the baseline unit and the root size on the root element, sets the body rule with the unit as a comment, and gives the heading a snapped line-height with margins of two units above and one below. A spacing table then lists the first eight multiples of the unit in pixels and rem with a token name for each, which is how padding and margins inside the block stay on the grid instead of being chosen by eye.\n\nFour caveats apply before the stylesheet is pasted into a project.\n\n- The grid is only as good as the body rule typed into it, so a site whose real body size differs from the entered value has a grid that describes nothing.\n- Only one heading is snapped, so a full hierarchy needs the arithmetic repeated per level or a tool that handles the ladder.\n- Rounding changes the leading, which makes the heading's line-height a grid decision rather than a purely typographic one.\n- The unit is derived from the body rule alone, so a page whose body text changes size on a narrow screen has a second grid that these numbers do not describe.\n\nUse it when a page has begun to drift vertically, when a heading looks correct in isolation and wrong in the middle of a section, or when a spacing scale needs to be derived from the text rather than invented separately.",
    howTo: [
      { step: "Enter the body size and line-height first, since those two produce the baseline unit everything else is measured against." },
      { step: "Read the unit in both pixels and rem, and check the rem figure against the root size the project actually sets." },
      { step: "Enter the heading values and compare the natural line box with the snapped box to see how far off the grid it was." },
      { step: "Copy the stylesheet and the spacing steps together, so margins inside the block use the same module as the line boxes." },
    ],
    whenToUse:
      "Reach for it when a section drifts vertically as it is scrolled, when a heading sits on the grid in one size and breaks it in another, or when a spacing scale has to come out of the type rather than from a separate number someone chose once. The unit is the load-bearing idea. For the size ladder above the body, the {{type-scale-generator|type scale generator}} and the {{modular-scale-calculator|modular scale calculator}} produce the steps, and the {{vertical-rhythm-builder|vertical rhythm builder}} reports the snap error across a whole scale rather than one heading.",
    faqs: [
      {
        q: "How is the baseline unit calculated?",
        a: "It is the body font size multiplied by the body line-height. A 16px body at 1.5 gives a 24px unit, and that number becomes the module: line boxes should be whole multiples of it, and so should the vertical margins between blocks if the rhythm is to hold down the page.",
      },
      {
        q: "Why does the snapped line-height differ from the one I typed?",
        a: "Because the heading's natural line box is rarely a whole number of baseline units. The box is divided by the unit, rounded to a row count, multiplied back, and divided by the font size again. The result is a line-height that places the heading's baselines on the stripes at the cost of a fractionally different leading.",
      },
      {
        q: "Does the tool round the box up or to the nearest row?",
        a: "The arithmetic rounds to the nearest row with a minimum of one, while the explanatory note on the panel describes rounding up. In practice a box just under a multiple can therefore be pulled down rather than up, which is the case to look at when the snapped leading reads tighter than the entered value suggested.",
      },
      {
        q: "Should every heading be snapped to the grid?",
        a: "Large display headings can be left off it, since a two-line hero rarely sits beside body copy closely enough for the drift to show. The headings that matter are the ones inside running content — h2, h3 and anything with text above and below it — because that is where a misaligned baseline is visible.",
      },
      {
        q: "What are the spacing steps for?",
        a: "They are the first eight multiples of the baseline unit, given in pixels and rem with a token name each. Using them for padding and margins keeps the spaces between blocks in the same rhythm as the lines inside them, which is the half of a vertical grid that a line-height calculation alone does not cover.",
      },
    ],
  },

  "line-height-optimizer": {
    keywords: [
      "line height optimizer",
      "leading",
      "measure",
      "clamped",
    ],
    intro:
      "The line height optimizer returns a leading value derived from four inputs — size, measure, family and weight — using a formula it prints in full. The point is not the number but that the number is inspectable and can be argued with.",
    content:
      "The line height optimizer takes the four properties that actually move leading and returns a single value with the arithmetic shown. The formula is 1.2 plus 4.8 divided by the font size, plus the measure in characters minus 65 divided by 100, plus 0.03 for a serif and minus 0.03 for a weight of 600 or heavier, all clamped between 1.05 and 2.0.\n\nThree readings of that formula show how it behaves.\n\n- At 16px on a 65-character measure the size term gives 1.5, which is the familiar default for body text.\n- At 12px the same term rises to 1.6, because small text needs proportionally more air between lines to keep the eye from skipping.\n- At 32px it falls to 1.35, which is why display sizes tighten as they grow rather than holding the body value.\n\nThe measure term does the rest. A long line needs more leading because the return sweep is longer and a misread line is easier to lose; a short line needs less. The family and weight adjustments are small nudges: serifs sit fractionally airier because their stroke contrast breaks up at small sizes, and heavy weights can close up because their counters are already large in the reader's eye. Every value is clamped at both ends, so an extreme input returns the nearest sensible value rather than an unusable number.\n\nThe panel also states the band the measure should be in. Below 45 characters the line rhythm breaks and the reader stumbles at every wrap; from 45 to 75 is the comfortable reading band; past 75 the return sweep becomes a search and the text needs either more leading or a shorter column. Its own preview uses the recommended value at a maximum width derived from the character count, so the number can be judged in running text rather than as a figure.\n\nThree starting points are offered beside the recommendation: a compact setting one tenth below the result for dense interfaces and large headings, the recommended value itself, and an airy editorial setting up to 0.15 above, capped at the top of the clamp. The exported CSS carries the size and the leading with the pixel value in a comment, and a note that large text — above 24px, or above 18.66px at a bold weight — may drop to between 1.1 and 1.3, since those thresholds are where the accessibility guidance relaxes.\n\nWhat the model does not do is measure the face, which is the honest limit of any leading formula.\n\n- Line-height recommendations depend on x-height and vertical metrics as well as on size, so two faces set at 16px on the same measure can want different leading while the formula returns one value for both.\n- The measure is entered in characters rather than measured from the face, so a condensed font's real line length is not what the arithmetic is working with.\n- The clamps at 1.05 and 2.0 mean an extreme input returns the nearest usable value rather than a warning.\n- The preview is a single paragraph at a single width, so a value that reads well there still has to be checked against a narrow column and a wide one.\n\nIt is a starting point with a printed derivation, which is more useful than a table of defaults and less authoritative than the type designer's own specification.",
    howTo: [
      { step: "Enter the font size and the measure in characters, since those two terms carry most of the result." },
      { step: "Choose the family and the weight so the two small adjustments are applied, and read the measure verdict at the same time." },
      { step: "Compare the recommendation with the compact and airy starting points, and pick the one the layout needs rather than the middle by default." },
      { step: "Copy the CSS and keep the pixel value in the comment, because a unitless line-height in a different font size will change behind your back." },
    ],
    whenToUse:
      "Reach for it when body text feels crowded or floaty and the leading has been inherited rather than chosen, when a long measure has to be justified before the column width is changed, or when a design system needs a first value for every size in its scale. The formula is the deliverable. For the ladder those sizes come from, the {{type-scale-generator|type scale generator}} builds the steps, the {{paragraph-width-optimizer|paragraph width optimizer}} settles the measure in characters, and the {{baseline-grid-calculator|baseline grid calculator}} snaps the result to a vertical grid.",
    faqs: [
      {
        q: "Why does leading fall as the font size rises?",
        a: "Because the x-height grows with the size while the line box grows faster, so a display setting already has generous vertical space relative to its letters. The formula reflects that: the size term contributes 1.6 at 12px and 1.35 at 32px, which is the same optical correction a designer makes by hand at each end.",
      },
      {
        q: "How does the measure change the recommendation?",
        a: "Longer lines need more leading. The term adds one hundredth of a line-height for every character over 65 and subtracts the same for every character under it, so a 90-character measure gains a quarter of a line-height over the default while a 40-character measure tightens.",
      },
      {
        q: "What counts as large text for the relaxed guidance?",
        a: "Above 24 pixels, or above 18.66 pixels at a bold weight, where the accessibility guidance allows a lower contrast ratio and a tighter leading. That is the case where 1.1 to 1.3 becomes acceptable, and the exported CSS notes it beside the value so the tighter setting is a decision rather than an accident.",
      },
      {
        q: "Why is the result a unitless line-height?",
        a: "So it keeps its proportion when the font size changes. A pixel value is useful as a comment for checking the box height, but shipping it as the declaration means the leading breaks the moment the size is overridden by a responsive rule. The unitless form is inherited and recomputed against the current size.",
      },
      {
        q: "Can I trust the number without looking at the page?",
        a: "No, and the panel says so. The formula cannot see x-height, vertical metrics, or the width of the actual face, so two families at the same size and measure can want different leading. It is a start value with a stated derivation — the preview is there so the final judgement is made on running text.",
      },
    ],
  },

  "letter-spacing-calculator": {
    keywords: [
      "letter spacing calculator",
      "tracking",
      "em",
      "uppercase",
    ],
    intro:
      "The letter spacing calculator converts a tracking value between em, pixels and the thousandths-of-an-em number design tools use, and names the value that suits the size and the role. The conversion is the boring half; the size table is the useful half.",
    content:
      "The letter spacing calculator turns one tracking value into every form it is written in. Enter a number in em or in pixels along with the font size, and it returns the em value, the pixel value at that size, and the design-tool tracking number — thousandths of an em, so a value of 0.02em reads as tracking 20. That one convention is the reason tracking looks like a different quantity in a design file and in a stylesheet.\n\nThe size and role selection then names a recommended value, taken from a table of optical bands.\n\n- 10 to 12px body text wants about 0.02em positive tracking, because tiny letters crowd as they rasterise.\n- 13 to 16px body text sits at zero: the spacing the designer drew is the spacing intended.\n- 17 to 24px tightens slightly to minus 0.01em, and the bands above it continue in the same direction to minus 0.02em at 41px and up.\n- Uppercase always wants positive tracking, from 0.08em at the smallest sizes down to zero at the largest, because capitals are drawn to be spaced and their sidebearings assume surrounding lowercase.\n- Display headings want negative tracking at every size in the table, from minus 0.01em to minus 0.03em, since large letters show their sidebearings as gaps.\n\nThe role selector is separate from the size on purpose. A 14px uppercase label and a 14px paragraph sit in the same band and want opposite values: positive tracking for the capitals, zero for the sentence case. That is why the table has three columns rather than one recommendation per size, and why the readout gives the recommended value in both em and pixels for the size entered.\n\nThe exported CSS writes the font size and the letter-spacing together, with the pixel equivalent in a comment, and the em form is the declaration because it survives every breakpoint. A pixel value would have to be rewritten at each size in a responsive scale, which is exactly what the tracking number exists to avoid.\n\nFour things the tool does not claim, and each one matters when a value is applied to real text.\n\n- The bands are optical rules of thumb rather than measurements of a specific face, and faces differ: a geometric sans with already-wide sidebearings needs less positive tracking than a condensed grotesque.\n- Letter-spacing is not kerning, and no value here fixes a bad pair inside a word.\n- Positive tracking adds space after the final letter as well as between letters, so a centred line of tracked capitals drifts left of true centre by half that space; a negative trailing margin of the same size cancels the phantom space and restores the centre.\n- Nothing checks the result against the actual typeface, since the tool works in numbers rather than in a rendering, so the final judgement is still made by eye on real text at the size it ships.\n\nTreat it as a conversion table and a starting band, then confirm the value on the face and the size the project actually uses.",
    howTo: [
      { step: "Enter the font size, then type the tracking value in whichever unit you have it — em, pixels or a design-tool number — and read the conversion." },
      { step: "Choose the text role, since uppercase and sentence case want different values at the same size." },
      { step: "Compare the entered value with the recommended one for that size and role, and use the table to see how it changes up and down the scale." },
      { step: "Copy the CSS in em, keeping the pixel readout as a comment for the size you are working at." },
    ],
    whenToUse:
      "Reach for it when a tracking value has to be translated between a design file and a stylesheet, when a size ladder needs a tracking value per step rather than one global setting, or when a line of uppercase looks cramped and the reason is that capitals are drawn to be spaced. The unit conventions are the part worth learning. For the full role table in CSS custom properties, the {{css-letter-spacing-tool|CSS letter spacing tool}} writes it out; the {{font-letter-spacing-tester|font letter spacing tester}} shows the values on real text, and the {{type-scale-generator|type scale generator}} supplies the sizes the bands refer to.",
    faqs: [
      {
        q: "What is design-tool tracking in CSS terms?",
        a: "It is thousandths of an em, so a tracking of 20 is 0.02em and a tracking of minus 15 is minus 0.015em. Design tools show it as a whole number because the em is implied by the text size, which is also why the same number produces a different pixel gap at every size.",
      },
      {
        q: "Why does uppercase need positive tracking?",
        a: "Because capitals are designed to sit before and after lowercase letters, so their sidebearings assume a wider neighbour. Set next to each other they look crowded even when the spacing is technically correct. A little positive tracking restores the rhythm, which is why the uppercase column runs from 0.08em at the smallest sizes down to zero at the largest.",
      },
      {
        q: "Should body text ever be tracked?",
        a: "Not at normal reading sizes. The spacing in a text face is the designer's optical decision, and second-guessing it with a global value usually makes the paragraph worse rather than better. The exceptions are very small text, which needs a touch of positive tracking to survive rasterisation, and dense tabular figures.",
      },
      {
        q: "Why is letter-spacing written in em rather than pixels?",
        a: "Because em values scale with the font size. A declaration in pixels applies the same absolute gap at every size, so a value tuned on a heading becomes a visible gap on a caption. The em form is also what allows one declaration to hold across a responsive scale where the size keeps changing.",
      },
      {
        q: "Does tracking fix a badly spaced pair?",
        a: "No. Tracking acts on every gap in the run, while a bad pair is one relationship between two specific letters, which only kerning or a different face can fix. Positive tracking can make a tight pair less noticeable, but it also opens every other gap by the same amount.",
      },
    ],
  },

  "css-typography-token-generator": {
    keywords: [
      "css typography token generator",
      "design tokens",
      "custom properties",
      "modular scale",
    ],
    intro:
      "The CSS typography token generator exports one modular scale twice: as a block of CSS custom properties and as a JSON token object. Sizes and leading ship together, so a token carries the pairing rather than leaving it to whoever consumes it.",
    content:
      "The CSS typography token generator turns a base size, a ratio and three font stacks into a token set that can be dropped into a design system. It emits the same values twice — as CSS custom properties for a stylesheet and as a JSON object for whatever build step consumes tokens — which is the practical way to keep one source of numbers in a project that has both.\n\nThe token set has a fixed shape, described by the panel before anything is generated.\n\n- Nine size steps named from 2xs to 4xl, running from two steps below the body to six above it, so the scale covers small print and display sizes in one ladder.\n- A paired line height for each step, loosening to 1.6 at the small end, holding at 1.5 for body, and tightening to 1.4, 1.25 and then 1.15 as the steps grow.\n- Three family tokens — body, heading and monospace — carried as complete stacks rather than as single family names, so a token can be applied without a second fallback decision.\n\nThe emitted set is twenty-one declarations: nine sizes, nine leadings and three families. Two readouts describe the scale's span rather than its contents: the size range, from the smallest step to the largest in pixels, and the full scale factor, which is the largest size divided by the smallest and therefore the number that says how dramatic the ladder is. A prefix control renames the token namespace, so the set can land as a project's own tokens rather than as a generic one, and the JSON mirrors the same three groups with sizes and leadings as keyed objects.\n\nThe interesting decision the tool makes for you is the leading pairing. A modular scale produces sizes, not line heights, and design tokens that ship sizes alone leave every consumer to guess the leading. Pairing them by rule — looser at the small end, tighter at the top — matches what a designer would do by hand and keeps the relationship stable when the base size changes.\n\nWhat the tool does not do is scale fluidly, and a few other decisions are left outside it.\n\n- Every pixel value is fixed, so a responsive project still needs clamp declarations on top, and the heading scale visualizer is the tool for that layer.\n- The leading values are paired by rule rather than measured, so a face with unusual vertical metrics may need one or two of them adjusted after a look at real paragraphs.\n- The JSON and the CSS are generated side by side but nothing keeps them in step afterwards, so editing one output by hand starts a divergence that is invisible until a release.\n- The token names are fixed to the nine-step ladder, so a project whose scale has a different number of steps renames or extends the set by hand.\n- No spacing tokens are emitted, so the margins between type blocks stay outside the system even though the sizes and leadings are inside it.\n\nUsed as the single source for type values, the block turns a scale into something a build step and a stylesheet can share; the discipline is copying it rather than editing it.",
    howTo: [
      { step: "Set the base size and the ratio, then read the size range and full scale factor to check the ladder is as dramatic as the design needs." },
      { step: "Set the prefix so the tokens land in the project's own namespace, and confirm in the CSS output that no name collides." },
      { step: "Replace the three family stacks with the project's real stacks, since they ship as complete fallback chains." },
      { step: "Copy both outputs — the custom properties into the stylesheet and the JSON into the token pipeline — and treat the generated block as the source rather than editing either by hand." },
    ],
    whenToUse:
      "Reach for it when a type scale has to be handed to a build step as well as to a stylesheet, when a project has sizes but no agreed leading per size, or when a design system needs a scale named consistently from small print to display. The paired leading is the part that saves the most argument. For the steps themselves the {{modular-scale-calculator|modular scale calculator}} and the {{type-scale-generator|type scale generator}} derive the ladder, the {{heading-scale-visualizer|heading scale visualizer}} adds the fluid clamp layer on top, and the {{letter-spacing-calculator|letter spacing calculator}} supplies the tracking values that belong to each step.",
    faqs: [
      {
        q: "Why does each size token carry a line height?",
        a: "Because a scale defines sizes, not leading, and shipping sizes alone leaves every consumer to invent a leading per size. Pairing them by rule — looser for small text, tighter as the size grows — keeps the relationship between size and leading stable even when the base size changes and every token moves.",
      },
      {
        q: "What do the size range and scale factor readouts mean?",
        a: "The range is the smallest and largest size in the set, in pixels, which tells you whether the ladder covers what the project needs. The scale factor is the largest size divided by the smallest, so it expresses how dramatic the ratio is in a single number that can be compared between candidate ratios.",
      },
      {
        q: "Are the tokens fluid or fixed?",
        a: "Fixed. Every size is a pixel value, so a heading that has to grow with the viewport still needs a clamp declaration around the token. That is deliberate: tokens are the stable values, and the fluid behaviour is layered on top where it can be tuned per breakpoint.",
      },
      {
        q: "Can I add a step to the scale?",
        a: "Not through the tool. The nine names from 2xs to 4xl are fixed and map to the nine steps, so a scale with more levels has to be renamed or extended by hand after export. Keeping the names fixed is what allows the JSON and the CSS to describe the same set without a mapping table.",
      },
      {
        q: "Why ship the same values as JSON as well as CSS?",
        a: "Because design systems usually have two consumers: the stylesheet, which wants custom properties, and a build step or documentation site, which wants structured data. Emitting both from one configuration is what keeps them consistent; editing one output afterwards is exactly how they drift apart.",
      },
    ],
  },
};
