import { PRIVACY_SECURITY_TEXT } from "../privacy";
import type { ToolSeoEntry } from "../tool-seo";

/** Racira Fonts SEO content — batch 6 (accessibility, CSS, print, decorative). */
export const typographySeoBatch6: Record<string, ToolSeoEntry> = {
  "low-vision-font-tester": {
    keywords: [
      "low vision font tester",
      "reduced acuity",
      "halation",
      "contrast sensitivity",
    ],
    intro:
      "The low vision font tester applies three visual conditions to the same sample paragraph and grades the type setting behind it. Reduced acuity, glare with its halation, and loss of contrast sensitivity are shown side by side against an unaffected reference, so a face and its spacing can be judged across all three at once.",
    content:
      "The low vision font tester renders one paragraph four times, once as an unaffected reference and three times under a filtered condition, then grades the underlying type setting on four checks and returns a letter grade.\n\n- Reduced acuity is simulated with a 2px blur, which dissolves fine hairlines first and letter details second.\n- Glare and the halation that comes with it are simulated with a light blur, a brightness lift and a contrast reduction together, reproducing the way light spreads and low-contrast pairs collapse.\n- Reduced contrast sensitivity is simulated by pulling the whole rendering toward mid-grey, which is the failure mode of light grey text.\n- The checks are size at 18px or more, weight at 500 or more, a contrast ratio of 7 to 1 or better, and a measure of 75 characters or fewer.\n- Faces come from the built-in catalogue, each shown with its classification so a serif, sans or display face is identified before it is judged.\n\nWeight carries more of the decision here than it does in a general legibility review, because stroke mass is what survives a blur: a 400 weight that reads cleanly at rest can lose its thins entirely under the 2px condition, which is why the check asks for 500 or more. The measure check is deliberately tighter than the usual 45 to 75 character band, capping at 75 on the argument that a reader who is already tracking with difficulty loses their place sooner on a long line. The four checks are scored as a count rather than a weighted composite: four passes is graded A and described as robust, three is a B with one weak point, two is a C to fix before shipping, and one or none is a D. The contrast slider is independent of the simulation filters, which means the ratio can be set to whatever the real design measures and then judged under all three conditions.\n\n- The three conditions are approximations built from CSS filters, not clinical simulations, and they describe the shape of the difficulty rather than a measured response.\n- Only one filter applies per pane, so a reader affected by both glare and reduced acuity is not represented in a single rendering.\n- The grade counts passes rather than weighing them, so a setting with a failed size and a passed weight scores the same as the reverse.\n- Nothing evaluates the palette as a whole, and the colour pair behind the ratio is not shown.\n- There is no export: the setting is judged on screen and the values are copied by hand.\n\nThe comparison is what makes it useful, because most faces look acceptable under a single condition. Judge the weight first, since that is where the conditions diverge most, then the measure, and treat the size and contrast checks as the two that are cheap to fix. Where the question is specifically about an older readership and a single acuity effect, the font for elderly simulator shows the same problem with a slider instead of presets, the dyslexia font simulator covers the spacing adjustments that help readers who lose their place, and the contrast text checker measures the colour pair that supplies the ratio tested here.",
    howTo: [
      { step: "Pick the face from the catalogue and set the size, weight, contrast ratio and measure that the real design uses." },
      { step: "Read the four rendered conditions in order, comparing the unaffected reference against the blurred, glare and reduced-contrast panes." },
      { step: "Check the four results in the table and note the grade, then look at which check failed rather than only at the letter." },
      { step: "Raise the weight first and shorten the measure second, since those are the two values the three conditions punish hardest." },
    ],
    whenToUse:
      "Use it when a face or a weight is being chosen and the audience includes readers with low vision, when a light-weight brand face is being proposed for body copy, or when a review needs to show why a hairline serif at 300 weight is a poor choice for a long article. It is the only tool here that shows three conditions at once, which makes it the right one for a face decision. For a single condition with a slider, the {{font-for-elderly-simulator|font for elderly simulator}} is the closer match, spacing adjustments for readers who lose their place belong to the {{dyslexia-font-simulator|dyslexia font simulator}}, and the colour pair behind the contrast figure is measured by the {{contrast-text-checker|contrast text checker}}.",
    faqs: [
      {
        q: "Why does the weight check ask for 500?",
        a: "Because stroke mass is what survives a blur. Under the 2px reduced-acuity condition a 400 weight loses its hairlines and the counters begin to fill in, while a 500 weight keeps enough contrast between stem and background for the letterform to stay recognisable. It is a threshold for this simulated condition rather than a requirement for all body text.",
      },
      {
        q: "Why cap the measure at 75 characters rather than 80?",
        a: "Because the return sweep is the first thing a reader loses when tracking is difficult. The usual band runs to 75 characters, and the check holds the line there rather than extending it, so a long line that would pass a general review is flagged here. Shortening the measure rarely costs anything and it is the cheapest of the four fixes.",
      },
      {
        q: "What does the glare condition actually simulate?",
        a: "The scattering of light inside the eye, which shows up as halation around the letterforms. It is built from a light blur together with a brightness lift and a contrast reduction, so the sample both softens and flattens. That combination is why low-contrast pairs collapse under it: there is no surplus contrast left to lose.",
      },
      {
        q: "Can two conditions be combined?",
        a: "Not in one pane. Each of the three filtered renderings applies a single filter chain, so a reader dealing with both glare and reduced acuity is not represented directly. The practical approach is to read the two panes in sequence and take the worse of the two verdicts as the setting's real position.",
      },
      {
        q: "Why does the grade count passes instead of weighting them?",
        a: "Because at this level of simulation a weighted composite would imply more precision than the filters support. Four independent checks that each matter produce a count that is easy to reason about, and the detail column identifies the failing one. The letter is a summary, not a measurement.",
      },
    ],
  },

  "font-for-elderly-simulator": {
    keywords: [
      "font for elderly simulator",
      "presbyopia",
      "acuity loss",
      "contrast sensitivity",
    ],
    intro:
      "The font for elderly simulator renders a sample under the two effects that dominate reading for older eyes, then recommends the size, weight and contrast that recover most of the loss. Presbyopia reduces the eye's ability to focus at close range while a narrowing pupil lowers retinal illuminance, and both are modelled in the preview.",
    content:
      "The font for elderly simulator applies a blur and a contrast reduction to a text sample, modelling presbyopia and the loss of contrast sensitivity that comes with it, then reports what the type setting would have to be for the same sample to read comfortably, with the CSS to produce it.\n\n- The blur control models simulated acuity loss from 0 to 3px in tenths, defaulting to 1.2px.\n- Contrast runs from 1 to 1 to 21 to 1 in half steps, defaulting to 10 to 1.\n- Size spans 12px to 40px, weight from 300 to 700 in hundred-unit steps, and the sample text is editable.\n- Faces come from the built-in catalogue with Source Serif 4 as the starting choice.\n- The recommendation table covers five settings: minimum body size of 18px with 19 to 20px preferred, minimum weight of 400 at 18px and 500 below it, contrast of 7 to 1 or better with 12 to 1 and above for long reading, line height of 1.6 to 1.8, and paragraph spacing of 1.2 to 1.5em.\n\nThe point of the preview is that the same acuity loss blurs proportionally less as the type grows. The effective blur is the blur value multiplied by sixteen and divided by the size, so at 16px a 1.2px simulation stays at 1.2px while at 24px it falls to 0.8px, which is why raising size is the most effective single change, ahead of weight and even contrast. Retinal illuminance is modelled as a contrast filter that combines the entered ratio with a base factor, so the preview darkens as the ratio drops and stops improving once the ratio is high enough that the filter reaches full strength. The panel also grades the setting directly: contrast at or above 7 to 1 satisfies the enhanced body text requirement, and a size of 18px or more is what the check looks for, with the exported CSS writing the size as a maximum of 1.125rem and the current value so it can never fall below the recommended floor.\n\n- Two effects are modelled, accommodation and pupil size, which between them account for much of the change but not all of it; field loss, floaters and cataract haze are not represented.\n- The blur is uniform across the sample, where real acuity loss varies with distance from the fixation point and with the letterform itself.\n- The contrast filter approximates retinal illuminance rather than simulating a measured response curve.\n- The checks are coarse by design: contrast passes at 7 to 1 and size passes at 18px, with no credit for being close.\n- This is a design aid, not a clinical tool, and nothing here measures a real reader's vision.\n\nUse it when an audience skews older and a design has been approved on a young reviewer's screen, since the failure mode is almost always a body size chosen for density rather than for the reader. Raise size first, then weight, then contrast, in that order, because that is the order of their effect on the simulated result. Comparing conditions rather than a single one belongs to the low vision font tester, the size thresholds for a text style are itemised by the WCAG font size checker, and the leading recommendation in the table is the same problem the line height optimizer solves at a fixed measure.",
    howTo: [
      { step: "Enter the type setting you are reviewing: face, size, weight and the contrast ratio the pair achieves, plus the sample text you want judged." },
      { step: "Set the simulated acuity loss, starting around 1.2px, and watch the effective blur readout as you change the size." },
      { step: "Compare the simulated reading experience against the recommended settings table, noting which rows your current values miss." },
      { step: "Copy the exported CSS, which floors the size at 1.125rem and the weight at 400, and adjust the contrast pair if the 7 to 1 row is failing." },
    ],
    whenToUse:
      "Reach for it when a product serves an older audience and a body size has been chosen for density, when a design review keeps producing the comment that the text feels small, or when a client needs to see why 14px body text fails a large part of its readership. It is the quickest of the simulators to explain, because a single blur slider makes the argument without numbers. For a comparison of several conditions rather than one, the {{low-vision-font-tester|low vision font tester}} applies acuity, glare and contrast sensitivity side by side, the {{wcag-font-size-checker|WCAG font size checker}} states the size and spacing thresholds formally, and the {{line-height-optimizer|line height optimizer}} settles the leading the recommendation table asks for.",
    faqs: [
      {
        q: "Why does a larger size reduce the simulated blur?",
        a: "Because the blur is applied as a fixed pixel radius while the letterforms grow around it. Effective blur is the simulation value scaled by sixteen divided by the current size, so the same visual impairment costs proportionally less detail at 24px than at 14px. That relationship is the whole reason size is the first lever for older readers.",
      },
      {
        q: "Why recommend 18px when many designs use 16px?",
        a: "Because the recommendation is aimed at readers whose accommodation has already narrowed, not at a general audience. The table puts the minimum at 18px with 19 to 20px preferred, and it treats 16px as a floor for younger readers rather than a target for this one. A design can hold 16px and still pass if the weight and contrast carry the rest.",
      },
      {
        q: "Is the contrast filter a real measure of retinal illuminance?",
        a: "No, it is a simulation. It combines the ratio you enter with a base factor so the preview loses contrast as the ratio drops and stops changing once the ratio is high enough. It is shaped to look like the effect rather than to reproduce a measured response curve, and it is there to make a comparison visible.",
      },
      {
        q: "Should I raise weight or contrast first?",
        a: "Size first, then weight, then contrast, in that order, because that is their order of effect on the simulated result. Weight matters most when the face is light and the strokes are thin, whereas contrast only helps while the pair is below the enhanced threshold; beyond about 12 to 1 there is little left to gain.",
      },
      {
        q: "Can it simulate a specific eye condition?",
        a: "Not a specific one. The simulator models the two changes that account for most of the difference for older readers, reduced accommodation and reduced retinal illuminance, and leaves out field loss, floaters and the scattering that cataracts cause. For the scattering case, the glare and halation preset in the low vision font tester is the closer approximation.",
      },
    ],
  },

  "text-gradient-maker": {
    keywords: [
      "text gradient maker",
      "background-clip",
      "gradient text",
      "worst stop contrast",
    ],
    intro:
      "The text gradient maker builds gradient text the way CSS actually does it — a background image clipped to the letterforms with a transparent fill — and reports the contrast of the worst stop against the page. It also writes the fallback and the selection rule that gradient text needs.",
    content:
      "The text gradient maker assembles the three declarations that gradient text is made of, plus the two that keep it from failing: a background image, background-clip set to text, a transparent colour, a plain fallback colour and an explicit selection background.\n\nThe controls map onto the stops and the geometry of the ramp.\n\n- Two or three stops, chosen by a stop-count control, with a colour picker for each: from, an optional midpoint, and to.\n- An angle from 0 to 360 degrees, which decides the direction the ramp runs across the text.\n- A size from 18 to 140 pixels, since gradient text is a display treatment and rarely suits body copy.\n- A fallback colour, used by engines that cannot clip a background to text.\n\nThe generated block is worth reading line by line, because each part answers a specific failure. The clip property paints the ramp only where the letters are; the transparent colour lets the ramp show through; the plain colour before it means an engine without support paints solid text rather than nothing, and a support query then restores the transparent fill where clipping is available. The selection rule sets a background for highlighted text, which is the failure nobody notices until a reader drags across the heading and the text disappears because its fill is transparent.\n\nThe contrast half is the part that separates this from a colour picker. The tool converts each stop to a relative luminance and returns the contrast ratio of the worst stop against the surface, along with whether that ratio clears the three-to-one threshold for large text. Since a gradient's lightest stop is what a reader struggles with, the worst stop is the number that matters, and it is reported rather than averaged. The honest caveat is that the calculation assumes a white page background and evaluates the stops rather than the blended pixels between them: a two-stop ramp passes through intermediate colours, and one of those can be lighter than either endpoint. Where the treatment is used over an image or a photograph, the ratio here no longer describes what a reader sees.\n\nFive further limits shape where the treatment is safe to use.\n\n- The mid-stop control only appears in three-stop mode, so a two-stop ramp has no way to bias its own midpoint.\n- Both modes emit a linear gradient, so the stop-count control chooses how many colours the ramp passes through rather than the kind of ramp it is.\n- Nothing measures the gradient across multiple lines, and a ramp that reads well on one line can leave the last line of a wrapped heading entirely in its palest colour.\n- The worst stop contrast is evaluated at the stops rather than between them, so a blend that passes through a lighter colour than either endpoint can still fail on screen.\n- The fallback colour is a single value, so an engine without clipping gets flat text in the one colour chosen rather than an approximation of the ramp.\n\nTreat the effect as a display treatment for one or two lines, and keep the fallback colour close to the darkest stop so the unclipped version still reads.",
    howTo: [
      { step: "Enter the words and set the size, remembering that gradient fills suit display type rather than paragraphs." },
      { step: "Choose two or three stops and an angle, watching the ramp in the preview rather than picking colours in the abstract." },
      { step: "Read the worst stop contrast and the large-text verdict, and darken the lightest stop until it clears the threshold you need." },
      { step: "Copy the CSS with the fallback colour and the selection rule intact, since both exist to cover a specific failure." },
    ],
    whenToUse:
      "Reach for it when a display heading wants colour that varies across the letters, when gradient text has already failed in one of the three predictable ways — no clip support, an invisible selection or a stop that is too light to read — or when the contrast of a gradient has to be checked rather than eyeballed. The worst-stop number is the one to quote. For flat coloured text the {{contrast-pairing-checker|contrast pairing checker}} is the dedicated check, the {{outlined-text-generator|outlined text generator}} and the {{shadow-text-generator|shadow text generator}} cover the other display treatments, and the {{type-scale-generator|type scale generator}} supplies the display sizes the effect is used at.",
    faqs: [
      {
        q: "How does gradient text work in CSS?",
        a: "The gradient is set as a background image on the text element, the background is clipped to the letterforms with background-clip set to text, and the text colour is made transparent so the clipped background shows through. Without the transparent fill the letters paint over the gradient and nothing appears to change.",
      },
      {
        q: "Why does the generated CSS include a plain colour as well?",
        a: "Because the clip property is not universally available and a transparent fill with no clipping paints an invisible heading. The plain colour is declared first, so an engine that cannot clip renders solid text, and a support query then replaces it with the transparent fill only where clipping works.",
      },
      {
        q: "Why does selected gradient text disappear?",
        a: "Because the fill is transparent, so the browser's selection highlight covers a colour that is not being painted, and inverting nothing leaves nothing. Declaring a background colour for the selection pseudo-element restores a visible highlight, which is why the generated block includes that rule rather than leaving it to chance.",
      },
      {
        q: "What is the worst stop contrast and why not average it?",
        a: "It is the contrast ratio of the palest stop against the surface, and it is the number a reader meets at the thin end of the ramp. Averaging the stops would hide exactly the failure that matters, since a gradient with three dark stops and one very light one still has a legibility problem where the light one lands.",
      },
      {
        q: "Is the contrast check valid over an image?",
        a: "No. The calculation assumes a flat white surface, so it describes text on a plain background only. Over a photograph the ratio changes with every pixel behind the letters, and the practical fix is a scrim or a solid panel rather than a different gradient.",
      },
    ],
  },

  "css-letter-spacing-tool": {
    keywords: [
      "css letter spacing tool",
      "tracking tokens",
      "uppercase tracking",
      "letter-spacing",
    ],
    intro:
      "The CSS letter spacing tool writes the tracking values a stylesheet really needs: one per role, from a tight display setting to a positive uppercase bump, emitted as custom properties. Body text stays at zero on purpose, and the tool says so.",
    content:
      "The CSS letter spacing tool turns two base sizes and one uppercase bump into a full set of tracking tokens, one per text role, and exports them as custom properties with a role table explaining each value.\n\nThe role set covers the decisions a stylesheet actually makes.\n\n- Display and hero roles take negative tracking, minus 0.02em, because large letterforms show their sidebearings as gaps.\n- The first and second heading levels continue in the same direction, minus 0.015em and minus 0.01em, so the tightening is progressive rather than abrupt.\n- Body text sits at exactly zero, which the panel states as a rule rather than a default: tracking body copy fights the spacing the type designer drew.\n- Small text and captions take a hair of positive tracking, 0.01em, which is the rasterisation case rather than a stylistic one.\n- Uppercase takes the bump value, adjustable from 0.01 to 0.15em, because capitals are drawn to be spaced and look crowded when set against each other.\n- Button labels take half the uppercase bump when the label is sentence case, and tabular figures take the same small positive value as captions, to separate digits in dense tables.\n\nEach row reports its size, its tracking in em and the same value converted to pixels at that size, which is what makes the numbers checkable: a tracking of 0.01em is a third of a pixel at 32 pixels of body text and a visible 0.14 at a 14 pixel uppercase label. The pixel column is also how the case gets made to a reviewer: a bare em value looks like a rounding error until it is converted into the gap it produces. The exported block names a custom property per role, derived from the role name, followed by a couple of usage examples for the uppercase and display cases. The counter-example beside it sets the same uppercase string twice, once untracked and once with the bump, which is the quickest way to show someone why caps need positive tracking at all.\n\nThe starting values are optical rules of thumb rather than measurements, and the tool is clear about the difference between a template and a specification.\n\n- A condensed grotesque with tight sidebearings wants more uppercase tracking at small sizes than a wide geometric sans, so the bump is a starting point per family.\n- A face with an unusually large x-height reads as crowded at the same nominal size, which shows up first in the small-text row.\n- The role table is fixed at nine entries, so a design with a different set of roles maps the tokens onto them rather than adding rows.\n- Every value is authored in em, so one letter-spacing declaration holds across every breakpoint while the pixel column stays a readout of what that means at each size.\n- Nothing here replaces kerning: tracking acts on every gap in a run, so a bad pair inside a word needs the typeface's own kerning rather than a token.\n\nThe templates are deliberately plain values, which is what makes them easy to override when a face turns out to want something different.",
    howTo: [
      { step: "Set the body and display sizes, since the pixel column is derived from them and is what makes the em values legible." },
      { step: "Set the uppercase bump and watch the caps row and the button row move together, since one is half of the other." },
      { step: "Read the role table and check the roles that sit at zero against the roles that are tracked, so the pattern is deliberate." },
      { step: "Copy the token block and use the variables in component styles rather than retyping the values, then check the uppercase counter-example against a real label." },
    ],
    whenToUse:
      "Reach for it when a stylesheet needs tracking values as a system rather than as one-offs, when uppercase labels look cramped at small sizes, or when several heading levels are being tuned and the tracking should tighten progressively instead of being decided per component. The zero for body text is the rule to keep. For converting a single value between units, the {{letter-spacing-calculator|letter spacing calculator}} handles em, pixels and design-tool tracking; the {{font-letter-spacing-tester|font letter spacing tester}} shows the values on real text, and the {{css-typography-token-generator|CSS typography token generator}} exports the sizes these tokens are applied at.",
    faqs: [
      {
        q: "Why is the tracking for body text zero?",
        a: "Because a text face's spacing is an optical decision made by its designer. Adding tracking to running copy opens gaps between every pair of letters and breaks the texture that makes a paragraph readable. The exceptions are very small sizes, where a little positive tracking helps rasterisation, and dense tabular figures.",
      },
      {
        q: "Why does uppercase need a positive bump?",
        a: "Capitals are drawn to sit beside lowercase letters, so their sidebearings assume a wider neighbour. Set against each other they crowd, which is why an uppercase label at the same size as body text looks tighter. The bump is applied as a custom property so a label can inherit it without repeating the value.",
      },
      {
        q: "How large should the uppercase bump be?",
        a: "Between 0.01 and 0.15em, and the right value depends on the size and the face. Small caps and short labels want more, wide tracking at large sizes starts to look like a deliberate style. In the template, the button label takes half the bump because its label is usually sentence case with a hint of tracking.",
      },
      {
        q: "Can I add more roles to the table?",
        a: "Not through the tool: nine roles are fixed and each produces one custom property. A project with different roles renames or maps them after export, which is straightforward because the properties are plain values. What the tool provides is the shape of a tracking system rather than a complete one.",
      },
      {
        q: "Are the recommended values face-independent?",
        a: "No, they are starting points. Faces differ in sidebearing, in x-height and in how much contrast their strokes carry, so two faces at the same size can want different tracking. The pixel column and a look at the rendered counter-example are what confirm the value for a specific family.",
      },
    ],
  },

  "css-line-height-tool": {
    keywords: [
      "css line height tool",
      "unitless",
      "line-height",
      "line box",
    ],
    intro:
      "The CSS line height tool writes the line-height declaration for every role in a small scale, and shows what each unit computes to at the chosen size. Four output units are offered, and the panel argues for one of them rather than leaving the choice to habit.",
    content:
      "The CSS line height tool takes a body size, three leading values and an output unit, then writes the declarations for a six-role scale and reports what each one computes to.\n\nThe four output units look interchangeable and behave very differently the moment a value is inherited.\n\n- Unitless, the default and the recommendation, is inherited as a number and re-resolved against each element's own font-size.\n- rem makes the line box a fixed multiple of the root size, so a nested element keeps the root's leading rather than its own.\n- px produces an exact length, and is the only mode that can guarantee a line box which is a whole number of pixels.\n- percent computes against the element's font-size at the point of declaration and is then inherited as a computed length, so it looks like unitless but inherits like pixels.\n\nThe role set is derived from the body size rather than entered per role: Display at three times the body, H1 at 2.25, H2 at 1.75, H3 at 1.375, Body at one, and Caption at 0.8, with the display, heading and body leadings controlled separately and the caption's worked out as the body leading minus a tenth, floored at 1.35 so a tight body setting cannot shrink the caption below a usable leading. The table reports each role's size, its ratio, the line-height in the selected unit and the line box in pixels, which is the column that makes the unit choice visible: the same 1.5 ratio is a 24 pixel box on body text and a 72 pixel box on a display heading.\n\nThe case for unitless is inheritance, and it is worth understanding rather than copying. A unitless value is a ratio, so an element inside a paragraph resolves it against its own font size and keeps the same optical leading. A pixel or rem value is inherited as a finished length, so a heading inside a paragraph receives the paragraph's line box and its leading becomes an accident of where it sits in the tree. There are two exceptions the panel names: rem is defensible when the leading must stay proportional to the root rather than to the element, which is rare, and pixels are the right choice when the line box has to be an exact multiple of a vertical grid.\n\nFour things about the scale are fixed rather than free, and each one is the reason another tool exists.\n\n- The six roles sit at fixed multiples of the body size, so a scale with different steps has to be expressed by editing the exported classes.\n- Three leading controls cover all six roles, which is enough for a small system and not enough for one where every level is tuned separately.\n- The character estimate assumes half an em per character, so it is a sanity check rather than a measurement.\n- Nothing checks the resulting line boxes against a baseline grid, which is where the grid tools take over.\n\nThe exported classes carry a size and a leading but no weight or tracking, since those belong to the roles rather than to the leading system. Read the computed column first, then choose the unit for the reason it is right rather than the one used last time.",
    howTo: [
      { step: "Set the body size and the body leading, since every other role is derived from those two values." },
      { step: "Adjust the heading and display leadings and watch the line box column rather than the ratio column, because the box is what the layout meets." },
      { step: "Choose the output unit deliberately: unitless for anything that inherits, pixels only when the box must be an exact length." },
      { step: "Set the measure and read the characters-per-line estimate, then copy the declarations for the roles the page actually uses." },
    ],
    whenToUse:
      "Reach for it when a scale needs leading values rather than one global line-height, when a heading nested inside running text has picked up the wrong leading through inheritance, or when someone needs the argument for unitless stated in a form they can act on. The inheritance behaviour is the part to take away. For the leading values themselves the {{line-height-optimizer|line height optimizer}} derives them from size and measure, the {{baseline-grid-calculator|baseline grid calculator}} snaps the resulting boxes to a grid, and the {{css-typography-token-generator|CSS typography token generator}} exports sizes and leadings together as tokens.",
    faqs: [
      {
        q: "Why is unitless the recommended line-height?",
        a: "Because it is inherited as a ratio and resolved against each element's own size. Text at 16 pixels and a heading at 40 pixels both keep the same optical leading, and a change of size never leaves a stale box behind. A length works out to exactly one value and is then inherited as that finished value.",
      },
      {
        q: "What happens when a pixel line-height is inherited?",
        a: "The child element receives the parent's computed line box, not a new one based on its own size. A small heading inside a paragraph therefore gets the paragraph's leading, which is usually far too much, and the effect is invisible until a nested element is inspected. That is the failure unitless values exist to prevent.",
      },
      {
        q: "Is a percentage the same as unitless?",
        a: "It looks the same and inherits differently. A percentage resolves against the font size at the point where it is declared and is inherited as a computed length, so it behaves like a pixel value for anything nested. Unitless is the only form that stays a ratio all the way down the tree.",
      },
      {
        q: "When is a pixel line-height worth using?",
        a: "When the line box has to be a whole number of pixels, which is the case on a baseline grid. Everything on the grid is a multiple of the same unit, so a ratio that lands between pixels defeats the point. The trade is that a change of font size no longer updates the box, so the value is tied to one size.",
      },
      {
        q: "How accurate is the characters-per-line readout?",
        a: "It assumes half an em per character, so it is an estimate rather than a measurement. It is useful for a quick check that a 60-character column has not become a 100-character one, and the dedicated measure tools are what confirm the number for a real face at a real size.",
      },
    ],
  },

  "css-fluid-typography-builder": {
    keywords: [
      "css fluid typography builder",
      "slope",
      "intercept",
      "clamp",
    ],
    intro:
      "The CSS fluid typography builder derives the slope and intercept pair for every step of a scale, so type grows smoothly between two viewports instead of jumping at a breakpoint. Each step is exported as a clamp declaration and a token.",
    content:
      "The CSS fluid typography builder takes a modular scale and turns every step into a declaration that grows linearly between a mobile and a desktop viewport. The output is not a set of breakpoints but a pair of values per step: a slope, which is how fast the size grows per pixel of viewport width, and an intercept, which is the size the line would have at a zero-width viewport.\n\nSix inputs describe the ramp, and each one moves the result.\n\n- The base size and the ratio generate the scale, exactly as they would in a fixed ladder.\n- The mobile and desktop viewports set the endpoints of the ramp: below the first, every step holds its minimum, and above the second it holds its maximum.\n- The step count decides how many rungs are emitted, from two to seven.\n- The mobile-to-desktop scale factor, from 0.5 to 1.0, decides how much smaller each step is at the narrow end.\n\nThe arithmetic per step is two lines. The slope is the difference between the maximum and the minimum size divided by the difference between the two viewport widths; the intercept is the minimum size minus the slope multiplied by the mobile viewport. The preferred value in the declaration is then the intercept expressed in rem plus the slope expressed in viewport width units, and the clamp holds the minimum at one end and the maximum at the other. Expressing the intercept in rem matters for accessibility: when a visitor raises their default font size, the rem part of the preferred value grows with it while the viewport part does not, so the type responds to the user's setting rather than to the screen alone.\n\nThe panel states the ramp's shape in words as a check: how wide the viewport range is, and what the mobile-to-desktop ratio works out to. The table reports each step's minimum, maximum and preferred term in full, and the rendered ramp is laid out below it so the growth can be watched by resizing the window rather than read off numbers. The exported block declares one custom property per step — from the top of the scale down to the base — and then one class per step that applies it, so a component can adopt a single step without copying the whole scale.\n\nFour limits are worth knowing before the tokens are adopted.\n\n- The preferred value assumes a sixteen-pixel root, so a project that changes the root size shifts the rem component of every step.\n- Viewport-based growth ignores container width, so a step inside a narrow sidebar still grows with the browser rather than with the box it sits in; a container query is the modern answer.\n- A seven-step scale produces fourteen declarations before anything is styled, which is the price of expressing a ramp as tokens.\n- The mobile-to-desktop factor applies to every step equally, so a scale whose small steps should compress more than its display sizes needs those steps adjusted by hand.\n- Nothing checks the midpoint of the ramp, so a value that grows convincingly at both ends can still pass slowly through the middle.\n\nRead the table as the specification of the ramp: the minimum, the maximum and the preferred term of each step together describe the whole of its behaviour.",
    howTo: [
      { step: "Set the base size and ratio to match the fixed scale the design already uses, so the fluid version is a change of mechanism rather than of sizing." },
      { step: "Enter the two viewports at which the design should be smallest and largest, since they define where the ramp starts and stops." },
      { step: "Set the mobile-to-desktop factor and check the stated ramp width, then read the table to see the minimum and maximum of each step." },
      { step: "Resize the preview to watch the growth, then copy the token block and the per-step classes." },
    ],
    whenToUse:
      "Reach for it when a type scale has to move continuously rather than in steps, when a hero heading is too small on a flagship phone and too large on a wide monitor at the same breakpoint, or when a design system wants one declaration per size instead of one per breakpoint. The slope and intercept pair is the idea to keep. For a single value rather than a scale, the {{css-clamp-calculator|CSS clamp calculator}} does the same arithmetic on two endpoints; the {{modular-scale-calculator|modular scale calculator}} builds the fixed ladder this ramp is derived from, and the {{heading-scale-visualizer|heading scale visualizer}} covers a heading ladder with a simpler approximation.",
    faqs: [
      {
        q: "What are the slope and intercept in plain terms?",
        a: "They describe a straight line: the slope is how many pixels the size grows for each pixel of viewport width, and the intercept is the size the line would have at a viewport of zero. The declaration adds the two together — a fixed part and a growing part — and lets the clamp bounds cut the line off at each end.",
      },
      {
        q: "Why express the intercept in rem?",
        a: "So the fixed part of the size follows the visitor's own font-size setting. A declaration built entirely from viewport units ignores that setting and can defeat zooming. With the intercept in rem, someone who raises their default size gets larger type, while the viewport term still adds the responsive growth.",
      },
      {
        q: "What happens outside the two viewports?",
        a: "The clamp bounds take over. Below the mobile viewport the preferred value would go on shrinking, so the minimum holds it; above the desktop viewport it would go on growing, so the maximum holds it. That is the point of clamping a linear ramp: the growth is bounded at both ends by design values.",
      },
      {
        q: "Does this replace media queries?",
        a: "For font sizes, largely yes, and that is the usual reason to adopt it: one declaration covers the range instead of three sets of rules. Media queries are still the tool for changing layout, and container queries are the tool when the size should depend on the component's box rather than on the viewport.",
      },
      {
        q: "How many steps should a fluid scale have?",
        a: "As few as the design needs, and rarely more than five. Each step adds two declarations and one class, and every additional rung is another value to keep consistent. If a scale needs seven steps, it is worth checking whether two of them are roles that could share a size instead.",
      },
    ],
  },

  "running-head-planner": {
    keywords: [
      "running head planner",
      "recto and verso",
      "chapter opening",
      "signature",
    ],
    intro:
      "The running head planner plans the head content of a whole run of pages rather than previewing one. It answers the questions a book designer has to settle before typesetting: which pages carry no head at all, which head goes on which side, and where the page number sits relative to the head text.",
    content:
      "The running head planner takes a book title, a list of chapter opening pages and four settings, then returns a page-by-page plan of head content and folio placement, plus the CSS Paged Media equivalent.\n\n- The recto head is the book title, typed once, and the verso head is derived from the chapter list as the chapter that most recently started.\n- Chapter opening pages are typed as a comma-separated list of page numbers, so the head suppression falls on exactly the pages a chapter begins.\n- Opening pages can either suppress the head or keep it, which is the difference between a conventional trade book and a reference work.\n- Page numbers can sit on the outer edge, the inner edge, centred, or be omitted entirely, and the plan states the placement per page rather than as a rule.\n- A signature size from 4 to 64 pages is used for one calculation: how many sheets the planned pages will occupy, since a plan that spills one page past a signature boundary adds a whole sheet.\n\nOdd pages become recto and even pages verso, and the plan applies that automatically, so the alternation between the book title and the chapter head falls on the right sides without being set by hand. Chapter openings are detected by comparing each page in the plan against the list, and the verso head names the chapter that started at or before that page, which is what makes a reader who opens the book in the middle able to tell where they are. The folio placement follows the same recto and verso alternation: on the outer edge it sits left on a verso page and right on a recto page, so the number always falls under the reader's thumb. The generated CSS Paged Media block writes those decisions as page rules for left, right and blank pages, using a named running head string and the page counter, so the plan can be carried into a paged-media renderer rather than only being read.\n\n- The plan covers a window of pages, from 4 to 32, rather than a whole book, so a long extent has to be checked in several passes.\n- Verso heads name the chapter position with a placeholder short title rather than a real per-chapter title, which has to be substituted by hand.\n- Only three head variants exist: the book title on recto pages, the chapter head on verso pages and the front matter head before the first chapter.\n- The signature calculation is a ceiling of pages divided by signature size, so imposition details and any allowance for plates are outside it.\n- Folio suppression on blank pages is written into the CSS rather than being visible in the plan table.\n\nUse it before a book is typeset, since the head and folio scheme is expensive to change once pages exist, and again when a designer wants to know where the chapter openings fall in a signature. The signature note is the useful part of the page count: it turns a head plan into a production consequence. Where a single page's head layout needs judging rather than the sequence, the running head previewer renders the pages themselves, the book interior layout preview reports the margins the head sits in, and the chapter header designer settles what the chapter opening page does instead.",
    howTo: [
      { step: "Type the book title that will serve as the recto head, and list the chapter opening pages as a comma-separated sequence." },
      { step: "Choose whether chapter openings suppress the head or keep it, and where the page numbers sit relative to the head text." },
      { step: "Set the first page number, the number of pages in the plan and the signature size, then read the page-by-page table." },
      { step: "Check the sheet count in the signature note, then copy the CSS Paged Media block for the renderer you are using." },
    ],
    whenToUse:
      "Reach for it when a book's running head scheme is being decided, when an existing book keeps confusing readers who open it in the middle, or when a chapter list needs checking against signature boundaries before imposition. It plans the sequence, which is the part a single-page preview cannot show. For the rendering of one page, the {{running-head-previewer|running head previewer}} shows the head against the body copy, the {{book-interior-layout-preview|book interior layout preview}} supplies the margins it sits in, and the {{chapter-header-designer|chapter header designer}} covers the page where the head is suppressed.",
    faqs: [
      {
        q: "How does the plan decide which head lands on which side?",
        a: "By convention the book title sits on the recto page and the chapter title on the verso, so the reader sees where the book is on the right and where they are in it on the left. The planner applies that automatically from the page number, since odd pages are recto and even pages are verso.",
      },
      {
        q: "Why suppress the head on a chapter opening?",
        a: "Because the chapter title already dominates that page. Repeating it in the head at the top of the same page is redundant, and the convention in trade books is to drop the head and let the opening page carry its own space. Reference works often keep the head instead, which is why it is a setting rather than a fixed rule.",
      },
      {
        q: "What does the signature figure tell me?",
        a: "How many sheets the planned pages occupy at the chosen signature size, calculated as the page count divided by the signature size and rounded up. It matters because printers impose in signatures, so a book that runs one page past a boundary adds a whole sheet. Adjusting the plan or the extent by a few pages can avoid that.",
      },
      {
        q: "Can heads alternate differently on the same spread?",
        a: "They do alternate, and the planner shows it page by page: the verso head names the chapter and the recto head names the book. What the planner does not model is a spread where a chapter opens on the recto page, which leaves the verso head of that spread belonging to the previous chapter. Check that case against the chapter list.",
      },
      {
        q: "Does the CSS actually place the heads?",
        a: "In a paged-media renderer, yes. The generated block names a running head string, positions it with the top-left and top-right page margin boxes for left and right pages, places the page counter on the opposite side, and clears both on blank pages. It is a portable way of expressing the plan rather than a substitute for it.",
      },
    ],
  },

  "print-type-specification-sheet": {
    keywords: [
      "print type specification sheet",
      "points and picas",
      "measure in picas",
      "print stylesheet",
    ],
    intro:
      "The print type specification sheet turns a set of type decisions into the table a print job is quoted and checked against, with sizes in points and the measure in picas. Screen sizes are usually quoted in pixels, and a print specification has to state points explicitly, so the sheet reports both.",
    content:
      "The print type specification sheet collects the type roles of a print job and returns them as a specification table stated in points and picas, plus the print stylesheet that matches it.\n\n- Inputs cover the job name, the page size as a label, body size in points, leading in points, caption size, heading size, the measure in millimetres and the number of columns.\n- Body defaults to 10.5pt on 14pt leading, captions to 8.5pt, headings to 24pt, the measure to 120mm across two columns.\n- Sub-headings are derived at 62 percent of the heading size on 1.2 times leading, and captions at 1.35 times their own size, so the sheet only needs the two anchor values typed in.\n- Conversions run in both directions: points to pixels at 96 over 72, millimetres to picas at six picas to the inch, and millimetres to points at 72 to the inch.\n- The column breakdown subtracts a 4mm gutter between columns and reports the resulting column width and an estimated characters per line.\n\nThe conversions are the reason the sheet exists. A point is one seventy-second of an inch and a pica is twelve points, so six picas make an inch, and those ratios are what a print house quotes against. The screen column states the pixel equivalent so the same specification can be checked against a web rendering, And because a supplier may ask for the measure in picas rather than millimetres, the measure row reports it as 28.35 picas alongside its point equivalent of 340.16 points, since which of the three a house works in is a matter of its own convention. Characters per line is estimated from the column width in points divided by the body size multiplied by 0.5, which is an average character width rather than a measurement of any particular face. The generated print stylesheet writes the four principal sizes as custom properties in points, keeps the pixel equivalents in comments, and sets the measure as a maximum width so a browser print preview matches the specification.\n\n- The page size is a label rather than a real dimension, so nothing here checks that the measure and column count actually fit the page it names.\n- Gutter width is fixed at 4mm across the column calculation and cannot be set separately.\n- The characters per line figure assumes an average character width, so a condensed or extended face will drift from it.\n- Caption and heading leading are fixed multipliers, which suits a conventional job and not an unusual one.\n- No font family, weight, colour or baseline grid is recorded, so the sheet is a size specification rather than a full production document.\n\nUse it at the point where a job moves from design to production, and print it: the sheet is laid out to be printed, which is how it reaches the person setting the type. Fill in the measured values rather than the intended ones, because the sheet is only worth having if it describes what will actually be set. Where a job also needs a running head and folio position, the running head previewer works out which text falls on which page, the book interior layout preview covers the text block and margin proportions around it, and the magazine column setter does the same column arithmetic on a baseline grid instead of a plain measure.",
    howTo: [
      { step: "Name the job and enter the page size as you would quote it, then fill in body, leading, caption and heading sizes from the design." },
      { step: "Set the measure in millimetres and the column count, and read the resulting column width and characters per line in the table note." },
      { step: "Check the ratio column against the design intent: body leading should read as a multiple of the size, not a fixed gap." },
      { step: "Print the sheet for the production file or copy the generated print stylesheet, which carries the same sizes as points." },
    ],
    whenToUse:
      "Reach for it when a print job is being handed over and the supplier has asked for a specification, or when a screen design has to be translated into points for print and the conversion keeps being done by hand. The pica figures are also useful for checking a measure against a standard page width before a layout is committed. Where the same job needs the pages themselves described, the {{running-head-previewer|running head previewer}} settles what each page carries, the {{book-interior-layout-preview|book interior layout preview}} reports the text block and margin proportions, and the {{magazine-column-setter|magazine column setter}} works the column count against a baseline grid.",
    faqs: [
      {
        q: "Why does a print spec use points when the design was made in pixels?",
        a: "Because print is specified in physical units. A point is one seventy-second of an inch, so type set at 10.5pt has a real size on paper, while a pixel has no fixed size at all. The sheet converts points to pixels at 96 to the inch so the two can be compared, but the specification itself has to be stated in points.",
      },
      {
        q: "How many points are in a pica?",
        a: "Twelve, and six picas make an inch. That is why the measure row reports both: a 120mm measure is 28.35 picas or 340.16 points, and a printer may ask for either. The column widths come out in millimetres because that is how page geometry is usually drawn, then convert to points for the character estimate.",
      },
      {
        q: "Can I specify a different gutter between columns?",
        a: "Not on this sheet. The column calculation subtracts a fixed 4mm gutter between columns, which is a common starting figure for a narrow measure. If the job needs a wider gutter, treat the column width it reports as an upper bound and subtract the extra from the measure before entering it.",
      },
      {
        q: "Why does the estimate say fewer characters per line than my design tool?",
        a: "Because it uses an average character width of half the point size, and most design tools measure the actual face. A face with a narrow lowercase or a small x-height fits more characters into the same column. The figure is there to catch a column that is obviously too narrow or too wide, not to replace a real setting.",
      },
      {
        q: "Is the print stylesheet the same specification?",
        a: "It carries the same sizes in points as custom properties, plus a print media block that applies them and sets the measure as a maximum width. What it does not carry is the page geometry, the column grid or the face, so it is a way of making a browser print preview agree with the sheet rather than a substitute for it.",
      },
    ],
  },

  "magazine-column-setter": {
    keywords: [
      "magazine column setter",
      "baseline grid",
      "column gutter",
      "jump head",
    ],
    intro:
      "The magazine column setter lays out a magazine page on a baseline grid, where the column count and gutter define the horizontal grid and the leading defines the vertical one. The readout checks the two things that break first in production: a column narrow enough to hyphenate badly, and a baseline unit that does not divide the text block.",
    content:
      "The magazine column setter takes a column count, a gutter, a body size, a leading value and two faces, then reports the resulting column geometry, the baseline unit and the CSS that produces the spread.\n\n- Columns run from one to five and the column gutter from 0 to 12mm in half-millimetre steps, with defaults of three columns and a 5mm gutter.\n- Body size runs from 6pt to 14pt in quarter-point steps, defaulting to 9.5pt, and leading from 8pt to 20pt, defaulting to 12.5pt.\n- The body and headline faces come from the built-in catalogue, and a jump head can be set to one of two standard phrasings or turned off.\n- The grid is drawn on a 180mm text width, which is an A4 page less 15mm margins a side, so the column width is that width minus the gutters divided by the column count.\n- A headline block is reported in baseline units, and the generated headline style is exactly three of them, which is what keeps a heading from breaking the vertical rhythm.\n\nThe characters per line figure is the check that matters most, because a magazine column is narrow by design. It is estimated from the column width in points divided by the body size multiplied by 0.5, and the readout names the band it falls in: below 30 characters the column is very narrow and hyphenation becomes essential, between 30 and 60 it is typical for a magazine, and above 60 it is wide for a column of that kind. The baseline unit is reported as the leading in points and as its ratio to the type size, which is usually between 1.2 and 1.5 on a magazine page. The generated CSS sets the type in points, applies the column count and the gutter in millimetres, justifies the copy with automatic hyphenation, and sizes the headline at 3.2 times the body with a leading of three baseline units.\n\n- The page geometry is fixed at a 180mm text width, so a different trim size or margin scheme has to be worked out with those numbers and entered as the measure elsewhere.\n- The character estimate uses an average character width, so a condensed or extended face drifts from it.\n- Photos, captions and the wells they occupy are not modelled, even though they consume columns on a real spread.\n- The baseline grid is described rather than overlaid, so misalignment between an element and the grid is not visible in the preview.\n- Justification and hyphenation are assumed rather than optional, which is right for a magazine column and wrong for a narrow one.\n\nUse it when a spread is being set and the column count is still being decided, since the characters per line figure settles that argument quickly, and again when the baseline unit is being fixed, because a leading that does not divide the text block height shows up later as a page that cannot hold a whole number of lines. Where the columns are for a screen rather than a page, the text column layout builder covers the same arithmetic with CSS properties, the book interior layout preview covers a single text block instead of a multi-column grid, and the running head previewer covers what each page carries at the top.",
    howTo: [
      { step: "Pick the body and headline faces, then set the column count and gutter for the page you are working on." },
      { step: "Set the body size and leading, and watch the baseline unit readout since that ratio is what the vertical grid depends on." },
      { step: "Check the characters per line band in the results box and adjust the column count until it sits between 30 and 60." },
      { step: "Choose a jump head or turn it off, then copy the generated CSS, which carries the column geometry, the justified body and the three-unit headline." },
    ],
    whenToUse:
      "Reach for it when a magazine spread is being laid out and the column count is not yet settled, or when a designer wants to see whether a 9.5pt body on 12.5pt leading will hold up across three columns. The baseline unit figure is also worth checking before a headline style is written, since a heading that is not a whole number of units will always look slightly off. For screen columns, the {{text-column-layout-builder|text column layout builder}} applies the same arithmetic in CSS, the {{newspaper-typography-previewer|newspaper typography previewer}} covers the tighter leadings a newspaper uses, and the {{print-type-specification-sheet|print type specification sheet}} records the resulting sizes in points for production.",
    faqs: [
      {
        q: "Why does a magazine column run narrower than a web column?",
        a: "Because the page is a fixed width and the column count is a design decision rather than a length. A three-column A4 page with a 5mm gutter leaves about 56mm of text per column, which is around 30 to 40 characters at 9.5pt. That is far below the 45 to 75 band used for screen reading, which is why newspaper and magazine setting depends on hyphenation to avoid rivers.",
      },
      {
        q: "What makes a baseline unit correct?",
        a: "It is the leading value, and what makes it correct is that the text block height divides by it into a whole number of lines. A leading of 12.5pt against a block of 240mm gives a clean line count; a leading of 12.6pt leaves a sliver at the foot of every page. The ratio to the type size, usually between 1.2 and 1.5, is the second thing the readout reports.",
      },
      {
        q: "Why is the headline three baseline units?",
        a: "Because a heading has to occupy whole units of the vertical grid if the page is to keep its rhythm. Three units gives a headline a line box that lines up with the body text below it, and the generated CSS applies exactly that as the line height, with the size set at 3.2 times the body size.",
      },
      {
        q: "Can the gutter be zero?",
        a: "Yes, and the column width calculation handles it, but a gutterless multi-column layout leaves no visual separation and reads as one wide block apart from the column breaks. Most magazine setting uses between 3mm and 6mm, which is enough separation to be seen at reading distance without breaking the page into unrelated strips.",
      },
      {
        q: "Does the column width account for the trim size?",
        a: "No. The calculation works from a fixed 180mm text width, which is an A4 page with 15mm margins a side. If you are setting a different trim size, work out your text width first and use the measure fields in the specification sheet to check the resulting column width before committing to a column count.",
      },
    ],
  },

  "newspaper-typography-previewer": {
    keywords: [
      "newspaper typography previewer",
      "headline to body ratio",
      "rule weights",
      "broadsheet scale",
    ],
    intro:
      "The newspaper typography previewer renders a broadsheet story unit: a banner headline, a deck, a byline, a rule and a multi-column body. The controls that matter are the headline size relative to the body, the leading, which newspapers run tight, and the rule weights that carry the structure when white space is scarce.",
    content:
      "The newspaper typography previewer builds a complete story unit from typed copy and a handful of controls, then reports the two ratios a newspaper setting lives on and exports the CSS behind it.\n\n- Three headline styles are offered: banner in sentence case, stacked caps, and ribbon with a rule above the headline.\n- The headline slider runs from 12pt to 84pt, the body from 6pt to 14pt in quarter-point steps, the leading from 8pt to 20pt and the column count from one to five.\n- The deck is set at 1.6 times the body size and the byline at 1.05 times with uppercase and 0.06em of tracking, so the supporting levels stay in proportion to whatever body size is chosen.\n- Three rule weights are available: hairline at half a pixel, thin at one pixel and thick at three, drawn between the byline and the body.\n- The body is justified with automatic hyphenation in the chosen number of columns, on a 4mm column gap.\n\nThe headline to body ratio is the figure that decides whether the page reads as a newspaper. It is reported to two decimals along with the leading ratio, and the panel notes that newspapers run their leadings between 1.15 and 1.25, which is deliberately tighter than the 1.45 to 1.8 that body text wants on a screen. A ratio below three to one is flagged as reading magazine-like, with the advice to raise the headline, while anything above that is called broadsheet scale. The preview also demonstrates the structural role of the rules: with white space scarce, the deck, the byline and the horizontal rule do the separating that margins would do elsewhere, and the rule weight is what makes the story unit start and end at the right place on a dense page.\n\n- The column gap is fixed at 4mm and the page is rendered on one fixed paper tone, so neither is adjustable.\n- The fold is described in the copy rather than simulated, so nothing shows what actually sits above it.\n- The headline-to-body verdict is a heuristic about scale, not a judgement about the headline itself.\n- Captions, pull quotes, images and their wells are absent, though they take up most of a real newspaper page.\n- The deck and byline sizes are fixed multipliers, and the paper stock is not modelled, so how the type behaves on newsprint is not represented.\n\nUse it when a story page needs a headline scale set against a body size, and again when a rule weight is being chosen, since the three options behave very differently on a dense page. The tight leadings it works with make it the right place to see how far leading can be pushed before the columns start to look like a wall, which is a question the screen-oriented tools do not cover. Where the setting is a magazine rather than a newspaper, the magazine column setter works the same problem on a baseline grid, the hyphenation tester covers the justification behaviour a narrow column depends on, and the print type specification sheet records the sizes in points for the printer.",
    howTo: [
      { step: "Enter the headline, deck, byline and story copy so the unit is built from real text rather than placeholder lines." },
      { step: "Choose the headline style and rule weight, which between them set how the story is separated from whatever sits beside it." },
      { step: "Set the headline and body sizes and read the headline to body ratio, then set the leading and watch the leading ratio against the 1.15 to 1.25 band." },
      { step: "Adjust the column count until the copy reads in the story unit, then copy the generated CSS for the newspaper block." },
    ],
    whenToUse:
      "Use it when a news or editorial page needs its headline scale set against a body size, when a dense page needs a rule weight decided, or when someone has asked for a broadsheet look and the type currently reads as a magazine. It is also a quick way to show why a newspaper leading will not work on a screen. For magazine setting, the {{magazine-column-setter|magazine column setter}} is the closer tool, the {{hyphenation-tester|hyphenation tester}} covers the justification a narrow measure needs, and the {{book-interior-layout-preview|book interior layout preview}} applies the same discipline to pages that are read in the hand rather than on a stand.",
    faqs: [
      {
        q: "Why is a newspaper leading so much tighter than on screen?",
        a: "Because the page has to fit as much copy as it can while staying readable at arm's length. A leading ratio of 1.15 to 1.25 is tight enough to save lines and still leave the lines distinct, helped by the short measure of a newspaper column. On a screen, where the measure is usually longer and the reading distance shorter, the same ratio reads as crowded.",
      },
      {
        q: "What does the headline to body ratio tell me?",
        a: "It is the scale relationship between the two roles, headline size divided by body size. Below about three to one the page reads magazine-like and the headline lacks authority against its columns; above it, the setting takes on the proportions of a broadsheet. The panel reports the figure rather than dictating a value, because the right ratio depends on how much the headline has to carry.",
      },
      {
        q: "Why do the three rule weights matter so much?",
        a: "Because on a dense page the rules do the structural work that white space would do. A hairline separates two stories on the same page without shouting, a thin rule marks the top of a story unit, and a thick rule is used where a section has to be clearly closed. The preview shows how much the heaviest option changes the perceived density of the page.",
      },
      {
        q: "Can the headline style be mixed within a page?",
        a: "The tool previews one style at a time, but there is no rule against mixing them in practice: banner headlines for the lead story and stacked caps for a secondary one is a common combination on a real page. Change the style to compare the two, then copy the CSS for each and apply them by story rather than by page.",
      },
      {
        q: "Does the preview show the fold?",
        a: "No. The page is rendered as a story unit rather than as a whole sheet, so there is no line marking where the paper folds and nothing above or below it. Whether the headline sits above the fold is a layout question that has to be checked in the page composition rather than here.",
      },
    ],
  },

  "footnote-and-endnote-formatter": {
    keywords: [
      "footnote and endnote formatter",
      "reference marker",
      "hanging indent",
      "footnote rule",
    ],
    intro:
      "The footnote and endnote formatter sets the notes block that runs under a rule at the foot of a page, together with the reference markers that connect it to the text. The marker style is the decision with the most downstream effect, so the tool states what each one is for before you commit to it.",
    content:
      "The footnote and endnote formatter takes one note per line, a reference marker style and four measures, then returns the notes block, the in-text reference marks and the CSS that produces both.\n\n- Four marker styles are offered: superscript numerals, bracketed numerals in square brackets, symbols, and an inline parenthetical form.\n- The symbol set cycles through asterisk, dagger, double dagger, section and pilcrow, which is the conventional sequence for a page carrying only a handful of notes.\n- Note size runs from 6pt to 12pt, the body size from 8pt to 14pt, the note leading from 8pt to 18pt, and the footnote rule from 10 to 100 percent of the column width.\n- Numbering can start anywhere from 1 to 99, which is how a chapter that continues a sequence is set without renumbering by hand.\n- The marker table reports the marker, the closed-up form and the case each style suits, so the choice is made against a stated reason rather than by habit.\n\nThe rule above the notes is a fraction of the column rather than the full measure, which is the convention that keeps a notes block from reading as a second column of text. The notes themselves use a hanging indent, so a reference that runs over more than one line starts its continuation aligned with the note text rather than under the number, and the CSS does that with a left padding and a matching negative text indent. The in-text mark is set at 65 percent of the body size with a line height of zero and a superscript alignment, and it is given a small negative left margin so the mark hangs outside the measure the way optical punctuation does, which keeps the spacing of the line it sits in from shifting.\n\n- The symbol set runs out after five notes and cycles, so a page with more notes than that needs numerals instead.\n- The notes block is set directly beneath the preview text rather than positioned at the foot of a page, since nothing here paginates a document.\n- Notes are taken as typed, one per line: the tool does not detect markers in the body text and pair them with notes automatically.\n- There is no support for cross-references, repeated references or shortened forms after a first full citation.\n- The rule is a single hairline at one width, so a two-weight rule or a bracketed notes block is outside the tool.\n\nUse it when the notes area of a page is being set and the marker style is still open, since the choice between numerals, symbols and inline references is the decision that everything else follows from. Superscript numerals are the convention for a text with figures, bracketed numerals survive being copied into plain text, and symbols are reserved for a page carrying only a few notes. Where the notes sit inside a page geometry, the book interior layout preview reports the text block and margins they have to fit, the print type specification sheet records the note size in points for the printer, and the index page layout preview covers the other apparatus page at the back of the book.",
    howTo: [
      { step: "Paste the notes one per line, then choose the reference marker style and the number the sequence starts at." },
      { step: "Set the note size, the body size it sits under, the note leading and the width of the rule as a share of the column." },
      { step: "Read the marker table to confirm the closed-up form and the case each style suits, since the mark appears in the text as well as in the block." },
      { step: "Copy the generated CSS, which carries the rule, the hanging indent and the in-text reference mark styling." },
    ],
    whenToUse:
      "Reach for it when a document's notes area is being set, when a book is moving from a word processor to a typeset layout and the markers need standardising, or when a page carrying many notes has to be made legible without shrinking the text. For the page around the notes, the {{book-interior-layout-preview|book interior layout preview}} gives the text block and margin proportions, the {{print-type-specification-sheet|print type specification sheet}} records the sizes in points, and the {{index-page-layout-preview|index page layout preview}} covers the apparatus page that sits at the other end of the book.",
    faqs: [
      {
        q: "When should I use symbols instead of numerals?",
        a: "When a page carries only a few notes and no long sequence. The conventional set runs asterisk, dagger, double dagger, section and pilcrow, which gives five markers before it has to repeat. Past that, the reader loses track of which mark belongs to which note, and numerals become the only workable choice.",
      },
      {
        q: "Why is the rule only part of the column width?",
        a: "Because the notes block is apparatus rather than body text. A short rule separates it from the text without implying a second column, and the conventional widths sit between a quarter and a half of the measure. The tool lets it run anywhere from a tenth to the full column for cases where a heavier separation is wanted.",
      },
      {
        q: "What is the hanging indent for?",
        a: "It keeps a reference that wraps onto a second line aligned with the note text rather than under its number. Without it, a two-line reference looks like two separate notes. The generated CSS does it with a left padding on the note and a negative text indent of the same value.",
      },
      {
        q: "Why does the reference mark have a negative margin?",
        a: "So it hangs outside the measure instead of pushing the word it follows. A superscript numeral takes up horizontal space at the end of a line, and without the small negative margin the line spacing shifts slightly wherever a mark appears. Hanging it is the same correction applied to optical punctuation.",
      },
      {
        q: "Can I set endnotes differently from footnotes?",
        a: "The tool formats one notes block, so endnotes use the same block with a different position in the document. What does change in practice is the marker numbering, which is why the sequence start is adjustable: a chapter of endnotes typically continues the numbering rather than restarting it at one.",
      },
    ],
  },

  "chapter-header-designer": {
    keywords: [
      "chapter header designer",
      "chapter opening",
      "top drop",
      "epigraph",
    ],
    intro:
      "The chapter header designer builds the page that opens a chapter, which is the one page in a book with no running head and generous top space. Four patterns cover the conventions in common use, and each one is measured against the text column rather than drawn in isolation.",
    content:
      "The chapter header designer takes a chapter number, a title, an optional epigraph and five settings, then renders the opening page and exports the CSS behind the chosen pattern.\n\n- Four patterns are offered: number above title with a rule and then text, a large number alone, a centred title with an epigraph, and a side-aligned vertical number.\n- Title size runs from 14pt to 72pt, the number from 8pt to 40pt, and the top drop from 0 to 180px.\n- The face is chosen from the catalogue with mono faces excluded, since the opening page is a display setting rather than a text one.\n- The top drop is reported both in pixels and in line boxes, dividing by an assumed 24px line box, so the space above the title can be related to the rhythm of the page below it.\n- The title size is also reported in pixels, using the 96 over 72 point-to-pixel ratio, so the opening can be checked against a screen rendering of the same design.\n\nThe top drop is the decision that the rest of the page inherits. It is the distance from the top of the page to the start of the header block, and setting it by eye is what produces an opening page that sits differently from the chapter that follows. Reporting it in line boxes makes the relationship explicit: a drop of seventy pixels is a little under three line boxes at a standard body setting. The side-aligned pattern writes the number as a vertical piece of type with the float cleared to the left and a margin to hold it off the text, which is the modern variant where the number reads as a spine label rather than as a heading. The rule under the header is a short bar rather than a full-measure line, which keeps the block reading as a title rather than as a section divider, and the preview draws every pattern at the same drop so the choices can be compared without re-entering values.\n\n- Ornaments, images and initial letters on the opening page are outside the tool, and the drop cap itself is a separate element.\n- The preview measures the drop from the top of its own container rather than from a page edge, so the head margin of a real page is not applied.\n- Four patterns are offered and cannot be combined, so a hybrid opening has to be built by editing the exported CSS.\n- The vertical number in the side pattern is drawn in a flex row in the preview rather than as a floated writing-mode block, so the two are close but not identical.\n- The title weight is fixed at 600 and the first line of body copy is not aligned to a baseline grid.\n\nUse it when a book's chapter openings are being designed, since the drop and the title scale set the rhythm the whole chapter inherits, and again when an opening page has to be justified against a screen equivalent. Where the head sequence across the book is the question rather than one page, the running head planner covers what each page carries, and where the opening page needs the geometry behind it, the book interior layout preview gives the margins the drop is measured from.",
    howTo: [
      { step: "Choose the pattern, then enter the chapter number, title and epigraph so the block is built from real content." },
      { step: "Pick the face and set the title and number sizes, watching the pixel equivalent readout if the same design also exists on screen." },
      { step: "Adjust the top drop and read the line-box figure, which relates the opening space to the body rhythm below it." },
      { step: "Compare the patterns at the same drop, then copy the generated CSS for the one you keep." },
    ],
    whenToUse:
      "Reach for it when a book's opening pages are being designed and the drop has to be agreed, or when an existing chapter opening feels detached from the text that follows it. It is also the quickest way to compare the traditional number-above-title block against the modern side-aligned number without building both. For the rest of the book's head scheme the {{running-head-planner|running head planner}} plans the sequence, the {{drop-cap-generator|drop cap generator}} handles the first paragraph where one is used, and the {{book-interior-layout-preview|book interior layout preview}} gives the margins the drop is measured against.",
    faqs: [
      {
        q: "How much top drop should a chapter opening have?",
        a: "Enough that the title block sits clearly below where a running head would be, which in practice means a drop of roughly a third of the page's head margin plus one or two line boxes. The tool reports the figure in line boxes so it can be related to the body rhythm rather than judged by eye, and a book that uses one drop throughout reads more calmly than one that varies it per chapter.",
      },
      {
        q: "Why is there no running head on a chapter opening?",
        a: "Because the chapter title is already on the page. The convention drops the head to give the opening its own space, and the readout states that the head is suppressed on this page. A reference book may keep the head for consistency, which is why the planner treats suppression as a setting rather than a rule.",
      },
      {
        q: "What is the epigraph for?",
        a: "It is the quotation or line that sits under a chapter title, set in italic and centred in the pattern that supports it. Only the centred pattern renders it, and it is optional: leaving the field empty simply omits the line rather than leaving a gap. The epigraph belongs to the opening page and is not repeated in the head.",
      },
      {
        q: "Does the side-aligned number work in a browser?",
        a: "The exported CSS writes it as a float with a vertical writing mode and a margin, which is a real technique rather than a preview trick. The preview draws it inside a flex row, so the two are close but not identical. Check the exported version in the target renderer before the pattern is committed to a book.",
      },
      {
        q: "Why does the title size have a pixel readout?",
        a: "Because the same design often exists as a web reading sample or an EPUB alongside the printed book. Points are the right unit for the page and pixels are the right unit for the screen, and the readout converts at 96 to the inch so the two can be held at the same apparent size. The drop is reported in line boxes for the same reason.",
      },
    ],
  },

  "table-of-contents-typesetter": {
    keywords: [
      "table of contents typesetter",
      "leader dots",
      "tabular figures",
      "page numbers",
    ],
    intro:
      "The table of contents typesetter builds a contents list with real leader dots, which is the part of a contents page that is easiest to get wrong. The two portable techniques are a flex row with a dotted border and a gradient background with controllable dot spacing, and the tool writes both.",
    content:
      "The table of contents typesetter takes one entry per line in a title and page format, then lays out the contents page with the leader style, the page number handling and the indents you choose, and exports the CSS.\n\n- Entries are typed one per line as a title, a vertical bar and a page number, and a line beginning with a space, a middle dot or a hyphen is treated as a sub-entry.\n- Three leader styles are available: a dotted border on a flexible row, a repeating gradient with controllable dot spacing, and no leaders at all.\n- Page numbers can be right-aligned with leaders leading to them, placed before the title, or omitted entirely.\n- Leader gap runs from 2px to 16px, dot size from 1px to 4px and the sub-entry indent from 0 to 4rem.\n- The entry table reports the title, the page, whether the line was read as top level or a sub-entry, and how the page numbers are being handled.\n\nThe two leader techniques are not equivalent. A dotted border on a flexible row is the simplest and renders uniformly, but the dots are drawn by the browser's border style, so their size and spacing are not really controllable and they sit slightly above the baseline. The gradient approach draws each dot as a radial gradient tile, with the background size set to the gap plus the dot size and the repeat set to horizontal, which gives exact control over both the spacing and the diameter at the cost of a background image that has to be positioned to sit on the baseline. The numbers are set with tabular figures so the digits line up in a column, which is what lets a reader scan page numbers rather than read them, and sub-entries are marked by indentation and a slight reduction in opacity rather than by a smaller size, so the hierarchy is positional.\n\n- Level detection is a heuristic on the first character of the line, so a sub-entry has to be typed with a leading space, dot or hyphen to be treated as one.\n- Page numbers are entered by hand. Nothing counts pages or derives them from a document.\n- The left-numbered style puts the page before the title and has no leaders at all, since leaders only make sense when the number is at the end of the row.\n- Only two levels exist, top level and sub-entry, so a third level has to be built by editing the exported CSS.\n- Gradient dots are a background rather than real glyphs, so they do not appear if backgrounds are disabled when printing.\n\nUse it when a contents page is being set by hand, when a generated contents list has to be restyled to match a printed book, or when leader dots are being argued about and both techniques need comparing on the same entries. Where the contents list sits in the page geometry, the book interior layout preview gives the text block it has to fit and the running head planner settles whether the contents pages carry a head at all.",
    howTo: [
      { step: "Type the entries one per line as title, a vertical bar and the page number, prefixing sub-entries with a dash or a middle dot." },
      { step: "Choose the leader style and the page number handling, and set the leader gap, the dot size and the sub-entry indent." },
      { step: "Check the entry table to confirm which lines were read as sub-entries, since the level comes from the first character of the line." },
      { step: "Copy the generated CSS, which carries the flex row, the leader technique and the tabular figures for the numbers." },
    ],
    whenToUse:
      "Reach for it when a contents page is being set and the leader dots need to match a house style, when a contents list generated by another system has to be restyled, or when both leader techniques need comparing before one is chosen. Where the page it sits on is being planned, the {{book-interior-layout-preview|book interior layout preview}} supplies the geometry, the {{index-page-layout-preview|index page layout preview}} does the equivalent job for the index, and the {{running-head-planner|running head planner}} covers the head the contents pages carry.",
    faqs: [
      {
        q: "Which leader technique should I ship?",
        a: "The dotted border is simpler and needs no background, which suits most projects and prints reliably. The gradient version gives exact control over dot spacing and diameter, which is what a house style with a specified leader demands. If neither is critical, the border is the safer choice because it does not depend on background printing.",
      },
      {
        q: "Why are tabular figures needed for page numbers?",
        a: "Because proportional digits have different widths, so a column of page numbers does not line up and the reader has to read each number rather than scan the column. Tabular figures give every digit the same width, which aligns the ones, tens and hundreds columns. The same setting is what keeps numbers from shifting as they change in a table.",
      },
      {
        q: "How are sub-entries detected?",
        a: "From the first character of the line. A line beginning with a space, a middle dot or a hyphen is treated as a sub-entry and gets the indent; anything else is top level. That is a heuristic rather than a parse, which is why the entry table shows the level it decided on so a misread line can be spotted before the CSS is copied.",
      },
      {
        q: "Can I have three levels of entry?",
        a: "Not directly. The tool models a top level and one level of sub-entry, which covers most contents pages. A third level has to be added by editing the exported CSS, where the structure is a flex row per entry and an indent rule per level, so adding a further class is a small change rather than a rewrite.",
      },
      {
        q: "Why does the dotted border sit slightly high?",
        a: "Because a border is drawn at the edge of the box rather than on the baseline, so the dots appear a little above where they would sit if they were type. The generated CSS compensates with a small upward transform on the leader element, which is why the value is written explicitly rather than left out.",
      },
    ],
  },

  "lettering-style-previewer": {
    keywords: [
      "lettering style previewer",
      "hand lettering",
      "stroke modulation",
      "lettering preset",
    ],
    intro:
      "The lettering style previewer shows the common hand lettering traditions as close CSS approximations, with the caveat stated on the page: real lettering has stroke modulation, bounce and irregular spacing that no font reproduces. Use the presets to pick a direction, then letter it properly.",
    content:
      "The lettering style previewer renders your text in one of six lettering traditions, each built from a real catalogue face plus a handful of CSS declarations, and it also lists what the approximation cannot do.\n\n- The six lettering preset options are brush script, sans marker, slab poster, condensed display, geometric monoline and ink pen, each naming the face it borrows and the effect it fakes.\n- Brush script uses an italic serif at weight 600 with a hair of rotation, standing in for a continuous thick-and-thin stroke.\n- Sans marker uses a grotesque at weight 700 with a hard half-pixel text shadow, which fakes the bleed of an ink edge.\n- Slab poster and condensed display are both uppercase settings, one heavy with a little tracking and one narrow with uniform stroke, which is the wood type and the packaging tradition respectively.\n- Geometric monoline uses a circular sans at weight 500 with wide tracking, and ink pen uses a true italic serif, which carries the calligraphic entry and exit strokes of a pen.\n- Size runs from 18px to 160px, tracking from minus 0.05em to 0.3em, and the baseline slant from six degrees one way to six the other.\n\nThe honest part of the tool is the table of what a font cannot fake. Stroke modulation is the first entry, because a real nib widens and narrows along the stroke while a font keeps one outline per glyph. Bounce is second: hand lettering puts each letter on its own baseline, and rotating the whole word only tilts the row. Irregular spacing is third, and it is the actual source of the hand-made feel, since a letterer tightens and loosens each pair by eye. Ink texture and per-pair ligature drawing complete the list, both being raster or drawn effects rather than anything an outline can carry. The exported CSS composes the stack, the size in rem to four decimals, the tracking, the rotation and the preset's own declarations into one class that can be dropped onto a heading.\n\n- The presets are approximations, and the panel says so rather than presenting them as lettering faces.\n- Rotation is applied to the whole word, so it tilts rather than bounces; a per-letter baseline would need one element per glyph.\n- The ink bleed in the marker preset is a half-pixel hard shadow, which reads as an offset edge rather than a bleed.\n- Faces are drawn from the catalogue, so a project with its own script face cannot be previewed here.\n- The exported transform creates a containing block and can affect neighbouring layout, which is worth knowing before it is applied to a hero heading.\n\nUse it at the start of a lettering job, when the question is which tradition suits the words rather than how the strokes are drawn. Picking the preset is the cheap part; the finished lettering then happens in a drawing tool or by hand. Where the outcome is a monogram rather than a running word, the monogram letter designer works on the single letter, the logo type tester checks it at the sizes a logo actually appears, and the retro type style maker covers the period-flavoured variants of the same traditions.",
    howTo: [
      { step: "Pick the tradition from the preset list, reading the note under the preview since each one states what it is faking and how." },
      { step: "Type the real words rather than a placeholder, because lettering traditions read differently at different lengths and letter combinations." },
      { step: "Set the size, then use tracking and baseline slant to find the feel: the alternatives to a custom drawing are a little tracking out and a little upward slant." },
      { step: "Read the table of what a font cannot fake before copying the CSS, so the approximation is used as a reference rather than shipped as finished lettering." },
    ],
    whenToUse:
      "Reach for it when a lettering direction has to be chosen quickly, when a client needs to see three traditions side by side before committing to a commission, or when a heading wants the flavour of a lettering style without a full drawing job. The caveat table is the other reason to open it: it is the argument for commissioning real lettering when the difference matters. For a single letter, the {{monogram-letter-designer|monogram letter designer}} is the closer tool, the {{logo-type-tester|logo type tester}} checks how the result holds up at the sizes a mark is used, and the {{retro-type-style-maker|retro type style maker}} covers the period variants of the same look.",
    faqs: [
      {
        q: "Can I ship the exported CSS as final lettering?",
        a: "For a decorative heading, often yes, and it will look like a typeface rather than like lettering. What it will not have is per-letter bounce, stroke modulation or irregular spacing, which is exactly the difference the table on the page lists. If the piece is meant to read as hand-lettered, the preset is the reference for a real drawing rather than the finished article.",
      },
      {
        q: "Why does the rotation tilt the whole word?",
        a: "Because a transform applies to the element rather than to each glyph. Bounce in hand lettering puts every letter at a slightly different angle and height on the baseline, which needs one element per letter and a rotation per letter. A single transform on the word is a rough stand-in for a slanted baseline.",
      },
      {
        q: "How is the marker bleed faked?",
        a: "With a half-pixel text shadow in the text colour, which thickens one edge of each glyph and reads as the edge of an ink mark. It is not a bleed: real ink spreads in every direction and varies with pressure and paper, while a shadow offset is uniform and hard-edged.",
      },
      {
        q: "Which preset suits a short display line?",
        a: "Condensed display and slab poster both work at a word or two, since their narrow or heavy forms hold up without much surrounding text. Brush script and ink pen need more words to show their rhythm and tend to look lost on a single short line. Geometric monoline sits between the two and suits a mid-length line.",
      },
      {
        q: "Do the presets change the typeface?",
        a: "They each name one catalogue face, so switching preset switches the font family as well as the CSS declarations. That means two presets are not comparable as pure effects: the comparison is between a face and a treatment together, which is how lettering is chosen in practice anyway.",
      },
    ],
  },

  "shadow-text-generator": {
    keywords: [
      "shadow text generator",
      "text shadow layers",
      "blur radius",
      "shadow preset",
    ],
    intro:
      "The shadow text generator builds a shadow from stacked layers, because every convincing text shadow is a stack rather than a single offset. A small hard layer gives definition and a larger soft one gives depth, and each layer carries its own alpha so overlaps never go solid.",
    content:
      "The shadow text generator takes a string, a size, two colours and a list of text shadow layers, then renders the result and exports the shadow declaration.\n\n- Five shadow preset options cover the common cases: a soft lift below the type, a hard offset for a printed feel, a long soft shadow for depth, an emboss pair with a light layer above and a dark layer below, and a neon haze of two accent layers at different blurs.\n- Each layer carries an offset in x and y from minus 40 to 40 pixels, a blur radius from 0 to 60 pixels, and a colour chosen from a list of alpha values including black at 90, 55, 25 and 12 percent, white at 75 percent and two accent values.\n- Layers can be added and removed, so a three-layer effect can be built from a two-layer preset.\n- The largest blur radius is reported as a ratio of the type size, with a warning above 0.3 that the effect is very soft and may look fuzzy.\n- The CSS writes the size in rem and the shadow as a comma-separated list, which is how the layers survive the copy.\n\nThe alpha values are why the stack works. A shadow in solid black over solid black does not read as depth; it reads as a second copy of the text. Using a partly transparent colour means the overlap between layers accumulates gradually, and a light layer placed above a dark one produces the embossed edge that neither layer gives alone. The blur-to-size ratio is the other rule the panel states: offsets and blurs in pixels do not scale with the type, so a shadow tuned on a 72px heading becomes a blur when the same class is applied to a 20px label. Keeping the ratio under about a third of the type size is a working threshold, and deriving the pixel values from the font size is the responsive answer when the same treatment has to work at several sizes.\n\n- The layer colours are a fixed list, so an arbitrary shadow colour has to be edited into the CSS after copying.\n- Offsets are absolute pixels, so the shadow does not scale automatically with the type size, which is the reason for the ratio warning rather than a fix.\n- The preview renders a single line, so a shadow that behaves well on one line is not tested for how it stacks over several.\n- There is no support for a stroked or outlined letter underneath the shadow, though the two treatments can be combined by hand.\n- Nothing reports the paint cost, which matters when a heavily layered shadow sits on an element that animates.\n\nUse it when a heading needs depth or lift and a single offset looks flat, and again when a shadow has to be diagnosed: three layers with descending alpha is almost always the answer, whatever the effect is called. Where the letter wants an edge rather than a shadow, the outlined text generator draws a stroke, the 3D text effect preview stacks hard shadows into an extrusion, and the neon text previewer layers glow around a light core. The shadow presets are also the quickest reference for the difference between definition and depth, and the neon text previewer shows the same layer technique applied to glow.",
    howTo: [
      { step: "Start from the preset closest to the effect you have in mind, then read the note under the preview to see how many layers it uses." },
      { step: "Set the size and the text and background colours before adjusting layers, since both change how much shadow the eye can read." },
      { step: "Adjust each layer's offsets and blur, keeping the largest blur under about a third of the type size, and add or remove layers as needed." },
      { step: "Copy the CSS and check the value of the blur ratio readout, converting the offsets to size-relative units if the treatment will be reused at other sizes." },
    ],
    whenToUse:
      "Reach for it when a heading needs lift or depth and a single offset shadow looks flat, when a shadow has to work on both a light and a dark surface, or when an existing shadow has to be made to scale with the type rather than staying fixed. The layer model is the useful idea, not the presets. For an edge rather than a shadow, the {{outlined-text-generator|outlined text generator}} draws a stroke; for an extrusion, the {{3d-text-effect-preview|3D text effect preview}} stacks hard shadows; and for a lit tube, the {{neon-text-previewer|neon text previewer}} layers glow around a bright core.",
    faqs: [
      {
        q: "Why stack layers instead of using one shadow?",
        a: "Because one layer can express either definition or depth but not both. A small blur with a stronger alpha sharpens the letter's edge against the background, while a large blur with a weaker alpha suggests the object lifting off the surface. Combined, the pair reads as a raised letter; alone, each reads as a flat effect.",
      },
      {
        q: "Why do the shadow colours use alpha?",
        a: "So that overlapping layers build up gradually instead of stacking into a solid block. A hard offset shadow in solid black over black text looks like a second copy of the word rather than a depth cue. With alpha, the overlap between the definition layer and the depth layer accumulates without any single layer turning opaque.",
      },
      {
        q: "What does the blur-to-size ratio tell me?",
        a: "Whether the shadow will still make sense when the type size changes. Offsets and blur radii are absolute pixels, so the same declaration on a smaller heading produces a proportionally larger shadow. The ratio is the largest blur divided by the type size, and above roughly a third the effect starts to read as fuzz rather than as depth.",
      },
      {
        q: "How do I make a shadow scale with the text?",
        a: "Derive the values from the type size rather than typing them as pixels: an em-based shadow can be expressed in the shadow's own units in newer CSS, or the values can be set from a custom property on the component. The panel states the rule directly, since the tool writes fixed pixels for clarity.",
      },
      {
        q: "Which preset suits text over an image?",
        a: "The long soft shadow, because its wide blur separates the letters from a busy background without a visible offset. On a flat surface a hard offset reads as a deliberate print effect, but over a photograph it competes with the image detail and tends to look like a rendering error.",
      },
    ],
  },

  "3d-text-effect-preview": {
    keywords: [
      "3d text effect preview",
      "extruded text",
      "paint cost",
      "perspective",
    ],
    intro:
      "The 3D text effect preview builds an extruded look the way CSS actually does it: a stack of hard-edged shadows, one per depth step, plus an optional perspective transform for the vanishing direction. The readout reports the shadow count, which is the real cost of the effect.",
    content:
      "The 3D text effect preview takes a string, a size, a depth, a step, a direction and an optional perspective, then generates the shadow stack that draws the extruded text and exports the CSS.\n\n- Depth runs from 1px to 40px and the step from half a pixel to 4px, and the number of layers is the depth divided by the step and rounded, so a 14px depth at a 1px step generates fourteen layers.\n- Direction is an angle from 0 to 360 degrees, which sets the horizontal and vertical components of every layer's offset through cosine and sine.\n- Perspective is off, a slight tilt at 12 degrees or a strong tilt at 24, applied as a rotation on an axis with a perspective distance set to six times the type size.\n- Layers darken toward the front of the extrusion and fade toward the tail, with each layer's alpha derived from its position in the stack.\n- The final layer adds a single one-pixel blur, which softens the last edge of the extrusion so the tail does not end in a hard line.\n\nEach layer is a hard-edged shadow with no blur, which is what makes the extrusion read as a solid body rather than a smudge: the offsets step evenly along the chosen direction, so the shadows tile into a continuous side surface. The paint cost is the part the panel makes explicit. Every layer is a separate rasterised shadow, so the count is the number of times the text is drawn, and a 40px depth at a half-pixel step produces eighty layers against the browser's paint budget. Above 24 layers the readout calls the cost high and advises against animating that element, since a hero animation repaints every frame. The alternative when the effect has to move is an SVG text object extruded as geometry, which animates as a transform rather than as a repaint.\n\n- The extrusion is flat: a real three-dimensional object has lit and shaded sides, and a stack of shadows has one uniform tone.\n- The perspective option rotates the whole element rather than shearing the extrusion, so the body of the letters does not recede in the way a modelled object would.\n- Only hard shadows and one soft tail layer are generated, so bevels, outlines and reflections are outside the tool.\n- The paint cost warning is a threshold on layer count rather than a measurement of any particular page.\n- The preview renders one line at a fixed weight of 800, so the effect is not tested over multiple lines.\n\nUse it for a poster or hero treatment where the depth is part of the design, and check the layer count before deciding it can animate. If the effect is going to move, the depth should come down and the step up, since layer count is what governs the cost. Where the letter needs an edge rather than a body, the outlined text generator draws a stroke, the shadow text generator stacks a few soft layers for depth instead of an extrusion, and the neon text previewer builds the opposite treatment with glow rather than shade.",
    howTo: [
      { step: "Type the display string in caps or a heavy weight, since an extrusion on thin letterforms closes the counters." },
      { step: "Set the size, then choose a depth and a step: the depth sets how long the extrusion is and the step sets how smooth its edge reads." },
      { step: "Set the direction angle so the extrusion points away from the light, then try the perspective options if the letter needs to recede." },
      { step: "Read the layer count and the paint cost before copying the CSS, and reduce the depth if the element is going to be animated." },
    ],
    whenToUse:
      "Reach for it when a hero heading or a poster line needs physical depth, when an existing text effect has to be sized without rebuilding it, or when someone has proposed animating a text effect and the layer count needs checking first. The cost readout is the part worth opening the tool for on its own. For an edge instead of a body, the {{outlined-text-generator|outlined text generator}} draws an outline, the {{shadow-text-generator|shadow text generator}} stacks a few soft layers, and the {{text-gradient-maker|text gradient maker}} handles a fill that changes across the letter.",
    faqs: [
      {
        q: "Why does a deeper extrusion cost so much?",
        a: "Because each layer is a separate shadow that the browser rasterises, so the text is effectively drawn once per layer. A 14px depth at a 1px step is fourteen draws; the same depth at a half-pixel step is twenty-eight. The count is what the readout reports, and it is why a deep effect on a large heading is more expensive than any font choice.",
      },
      {
        q: "Should I animate an extruded heading?",
        a: "Only if the layer count is low. Any animation on the element forces the shadows to be repainted, and above roughly two dozen layers the cost becomes visible on a mid-range device. Reducing the depth or raising the step is the quickest fix, and if the effect has to keep its weight while moving, an SVG extrusion animates as a transform instead.",
      },
      {
        q: "What does the step control change?",
        a: "How finely the side of the extrusion is sampled. A small step produces a smooth side with many layers, while a larger step produces visible banding between the shadow tiles, which sometimes reads as a deliberate hard-edged style. The layer count is the depth divided by the step, so the two controls trade directly against each other.",
      },
      {
        q: "Does the perspective tilt the extrusion?",
        a: "It rotates the element rather than reshaping the extrusion, so the letters lean into or out of the page while their bodies keep the same thickness. A modelled three-dimensional object would show the sides foreshortening as it turned. The result is still useful for a poster effect, but it is a rotation rather than a true perspective of the extrusion.",
      },
      {
        q: "Can I use this effect on more than one line?",
        a: "It works, but the cost multiplies with the number of lines, since every line carries the full shadow stack. Two or three lines of a display heading are usually acceptable at a moderate depth; a whole paragraph is not. The preview renders a single line for that reason, so a multi-line use should be measured on the real page.",
      },
    ],
  },

  "retro-type-style-maker": {
    keywords: [
      "retro type style maker",
      "decade preset",
      "neon glow",
      "chrome gradient",
    ],
    intro:
      "The retro type style maker holds five decade presets, and each one is a bundle rather than a filter: a face, two three-colour palettes and the CSS treatment that carries the period. Bundling them is the point, because a retro look is the face and the palette and the shadow moving together.",
    content:
      "The retro type style maker renders a word in one of five decade presets and exports the CSS behind it. Every preset answers the same three questions at once — which face, which colours, and which treatment — because changing only one of them produces something that reads as a contemporary setting with a period ornament attached.\n\nThe presets differ in the mechanism each one relies on, which is why they are reproducible rather than nostalgic.\n\n- 1950s diner — Bebas Neue, condensed caps with a hard offset shadow in the accent colour, sitting on a cream or amber ground.\n- 1970s warm — Fraunces at weight 700 with a little positive tracking, the analogue warmth carried by a rounded serif rather than an effect.\n- 1980s neon — Poppins with three stacked glows at 6, 18 and 36 pixels, all in the accent colour so the halo bleeds outward rather than sits as an edge.\n- 1990s grunge — Roboto Slab with minus 0.02em tracking and a one-pixel dark offset, which reads as imperfect registration on absorbent paper.\n- Y2K chrome — Space Grotesk filled with a vertical light-dark-light chrome gradient, white through the accent and back, clipped to the letterforms.\n\nTwo values drive the range. The size slider runs from 24px to 180px, is clamped at both ends and is written into the export in rem to four decimal places, so the declaration survives a root size other than 16px. The effect intensity runs from 0.2 to 3 and multiplies the diner offset, the neon glow radii and the grunge offset; the chrome ramp and the seventies spacing ignore it. Each decade ships two three-colour palettes, and the middle colour is the ground the preview sits on, which is why the same preset can look loud or quiet without touching the treatment. The exported class carries the accent and ink colours as custom properties, so a later palette edit happens in one place instead of across declarations.\n\nWhat the export leaves to whoever pastes it is worth knowing before the class is copied.\n\n- The chrome preset writes background-clip with a transparent fill and no fallback colour or selection style, so a browser that lacks the property shows nothing until a plain colour is added by hand.\n- Intensity covers three of the five treatments only; the gradient ramp and the seventies' letter-spacing are fixed values.\n- Faces come from the catalogue, so a project with a licensed display face cannot preview it here.\n- Nothing compares the palette against the text colour, so a low-contrast combination can be produced and exported without a warning.\n- The preview sets the weight itself at 800 for all presets, so the exported weight is not what the preview shows for every decade.\n\nReach for it when a headline or a poster needs a period flavour and the direction has to be shown rather than described, and when the same treatment has to be reused across a campaign rather than re-invented per asset. The honest limitation is that these are typefaces wearing period clothes, not lettering, so a piece that has to read as drawn or painted belongs further along the decorative shelf.",
    howTo: [
      { step: "Pick the decade first and read the face and treatment readouts before touching the text, since the preset decides both the family and the effect." },
      { step: "Enter the real words rather than a placeholder, because condensed caps and a chrome ramp behave very differently at one word and at six." },
      { step: "Choose one of the two palettes for that decade, then use the intensity slider to move between a subtle edge and an aggressive neon glow." },
      { step: "Copy the CSS and add the two pieces the export leaves out for the chrome preset: a plain fallback colour and a selection background." },
    ],
    whenToUse:
      "Reach for it when a retro direction has to be shown in minutes, when an existing headline looks period from a distance and wrong up close, or when a campaign needs four decade variants of one line built on the same structure. The bundle is the useful idea: face, palette and treatment chosen once. Where the period is a lettering tradition rather than a decade, the {{lettering-style-previewer|lettering style previewer}} covers brush and marker looks, while the {{hand-lettering-guide-sheet|hand-lettering guide sheet}} and the {{calligraphy-guideline-generator|calligraphy guideline generator}} handle practice guides, and the {{logo-type-tester|logo type tester}} checks whether the result survives at small sizes.",
    faqs: [
      {
        q: "Why does one preset change the face as well as the effect?",
        a: "Because a period look is the typeface and the treatment together. A neon glow on a transitional serif still reads as a serif with a glow, while the geometric sans makes the outline and the saturation agree. The presets keep the pairing deliberate so the two choices are not made independently and then reconciled.",
      },
      {
        q: "Does the intensity slider affect every preset?",
        a: "No. It multiplies the diner offset, the three neon glow radii and the grunge offset, so those three respond across a range from barely visible to heavy. The Y2K chrome ramp and the seventies tracking are fixed values, so the slider leaves those two presets where they are.",
      },
      {
        q: "Can I keep the treatment but change the colours?",
        a: "Yes, and that is why the accent and ink colours are written as custom properties rather than inlined. Editing the two variables changes the shadow, the glow and the ground at once. A third colour that is not part of the palette has to be typed into the declarations directly.",
      },
      {
        q: "Why does the chrome preset need extra CSS after copying?",
        a: "Because a gradient fill is a background image clipped to the text with the fill set to transparent. A browser without the clip property paints nothing, and a text selection would be invisible since the fill is transparent. The export therefore has to be given a plain fallback colour and a selection background before it ships.",
      },
      {
        q: "Which preset holds up on a long line of text?",
        a: "The seventies preset, since weight 700 in a rounded serif stays readable at length and needs no effect to carry it. The chrome ramp depends on the letter height, so it fades on a wrapped line, and the neon glow at 36 pixels blurs serifs and thin joins until the words stop separating.",
      },
    ],
  },

  "logo-type-tester": {
    keywords: [
      "logo type tester",
      "wordmark",
      "hairline",
      "favicon",
    ],
    intro:
      "The logo type tester sets a wordmark at logo size and again at a ladder down to 12 pixels, then reports the features that break first when a face is scaled down. Wordmarks fail at sizes the designer never previews, which is the whole reason the ladder exists.",
    content:
      "The logo type tester takes a word or a company name, sets it in a chosen face and shows the same setting twice: once at logo size, where it will be judged, and once down a ladder of 12, 16, 20 and 24 pixels, where it will actually be seen most often.\n\nThe controls map to the decisions a wordmark makes, and each one has a readout attached.\n\n- Face and weight, from 300 to 800, with the counter-survival readout keyed to the weight: below 500 the light strokes are flagged as vanishing under 20 pixels.\n- Tracking, from minus 0.05 to 0.3 em, plus the case setting, because uppercase is the common wordmark choice and it needs positive tracking far more than sentence case.\n- Logo size from 24 to 200 pixels, which sets the size of the reference setting and the approximate width readout, computed as the character count times the size times a per-character factor adjusted by the tracking.\n- Mark lockup, either the wordmark alone or a placeholder mark to the left of or above it, which is where the alignment question appears: a cap height should meet the optical centre of the mark rather than its box centre.\n\nThe scaling checks the tool states are the practical part. Any stroke that thins to a single pixel at 16 pixels has to be thickened or dropped. Counters in e, a and o must keep a visible hole at the smallest size, which is why light weights and tight apertures fail first. Capitals need roughly 0.02em more tracking for each step down so they do not touch. The lockup alignment is judged against the mark rather than the line box. And the monochrome test remains the arbiter: a mark that needs two colours to separate its letters has letterform problems rather than colour problems.\n\nTwo verifications are reported directly. Hairline risk comes from the face's category, flagging serifs as the first to thin out and display faces as the most resilient. The favicon check reports that a wordmark of more than two or three characters should hand the small size to a standalone mark instead, since a wordmark at 16 pixels is a texture rather than a name.\n\nWhat the tool does not settle has to be checked elsewhere.\n\n- The small-size ladder is fixed at four sizes, so intermediate steps have to be checked in a browser.\n- The width readout is an approximation based on an average character factor, not a measurement of the actual face.\n- Nothing rasterises the wordmark, so the favicon itself is not produced here.\n- The exported CSS sets white-space so the mark cannot wrap, which is correct for a wordmark but needs care inside a narrow container.\n- Contrast against the background is not evaluated, so a wordmark can be exported in a colour that disappears on its surface.\n\nUse it before a wordmark is locked, and again when a mark that looked fine on a slide fails in a browser tab.",
    howTo: [
      { step: "Enter the real name, not a placeholder, since its length and letter combinations decide whether the mark fits a lockup at all." },
      { step: "Choose the face, weight and case, then set tracking while watching the width readout and the counter-survival note." },
      { step: "Read the small-size ladder and the two risk readouts, and note which feature fails first as the size drops." },
      { step: "Copy the CSS for the large setting and plan the small cut separately if the ladder showed a break." },
    ],
    whenToUse:
      "Reach for it when a wordmark is about to be locked and has only been seen at presentation size, when a mark that works on a slide dissolves in a browser tab, or when someone needs the argument for a dedicated small cut with heavier weight and wider tracking. The small-size ladder is the evidence. For the mark beside the words, the {{monogram-letter-designer|monogram letter designer}} covers initials, the {{type-hierarchy-planner|type hierarchy planner}} sets the rest of the page around the lockup, and the {{font-pairing-suggester|font pairing suggester}} finds a face for the supporting text.",
    faqs: [
      {
        q: "Why does a wordmark need a separate small-size cut?",
        a: "Because optically correcting for size cannot be done by scaling. Below about 20 pixels a thin stroke falls under one pixel and disappears, counters close, and capitals begin to touch. The small cut thickens the weight, opens the tracking and often simplifies the shapes, which is a different drawing rather than a larger scale.",
      },
      {
        q: "What does the hairline risk readout mean?",
        a: "It is a statement about the face's category rather than a measurement. Serif faces lose their fine strokes first as they shrink, display faces are built from heavier forms and hold up longest, and text sans faces sit between the two. It tells you where to look on the ladder rather than what you will see.",
      },
      {
        q: "Why add tracking as the size drops?",
        a: "Because spacing that reads correctly at 96 pixels looks crowded at 16. The counters and sidebearings shrink with the glyphs while the eye needs proportionally more separation, so capitals in particular need a little positive tracking per step down. The check table puts the figure at roughly 0.02em per step.",
      },
      {
        q: "How accurate is the wordmark width readout?",
        a: "It is an estimate. The width is the character count times the size times an average per-character factor that the tracking adjusts, so a face with unusually wide or narrow forms will differ from the figure. It is useful for comparing two settings of the same word rather than for setting a precise container width.",
      },
      {
        q: "Should a wordmark be used as the favicon?",
        a: "Only if it is two or three characters. At 16 pixels a longer word becomes a grey texture and loses its letterforms, which is why the tool's check suggests the standalone mark for anything longer. The monogram or mark carries the identity at that size while the full wordmark stays for roomier placements.",
      },
    ],
  },
};
