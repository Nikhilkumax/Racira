import { PRIVACY_SECURITY_TEXT } from "../privacy";
import type { ToolSeoEntry } from "../tool-seo";

/** Racira Fonts SEO content — batch 2 (accessibility + glyph & character). */
export const typographySeoBatch2: Record<string, ToolSeoEntry> = {
  "readability-score-calculator": {
    keywords: [
      "readability score calculator",
      "flesch reading ease",
      "gunning fog index",
      "reading grade level",
    ],
    intro:
      "The readability score calculator runs six standard readability formulas over one pasted text sample and reports them together, because no single formula is the authority. You paste the copy once and the panels return the scores, the counts they are built from and a plain-language band for the result.",
    content:
      "The readability score calculator takes a block of text and applies six published formulas to it, then shows the intermediate counts on the same screen so a score can be argued with rather than just accepted.\n\n- Flesch Reading Ease returns a 0 to 100 ease score rather than a grade: 206.835 minus 1.015 times words per sentence minus 84.6 times syllables per word.\n- Flesch-Kincaid Grade gives a US school grade from 0.39 times words per sentence plus 11.8 times syllables per word minus 15.59.\n- The Gunning Fog index treats any word of three syllables or more as complex and applies 0.4 times the sum of words per sentence and 100 times the complex share.\n- SMOG, designed for health and consumer writing, takes 1.043 times the square root of complex words times 30 divided by sentences, plus 3.1291.\n- Automated Readability Index uses characters instead of syllables: 4.71 times letters per word plus 0.5 times words per sentence minus 21.43.\n- Coleman-Liau works from letters per 100 words and sentences per 100 words, weighted 0.0588 and 0.296 respectively.\n\nSyllables are approximated the way the formulas were designed to be fed. A word is split into vowel groups, one group is subtracted for a silent final e that is not a consonant plus le ending, a further group is removed for a non-syllabic es or ed ending unless the vowel pair already forms a syllable of its own, and no word is ever allowed to fall below one syllable. Words and sentences are counted from the sample as typed, complex words are those reaching three syllables, and reading time is the word count at 200 words per minute, rounded up with a floor of one minute. Sentences break on a period, exclamation mark or question mark followed by whitespace or the end of the text, so an abbreviation that ends in a period counts as a sentence boundary.\n\n- The syllable figure is an approximation, so the scores land close to, not identical to, a hand count; proper nouns and loanwords are the usual source of drift.\n- Every formula here is calibrated on English prose, so writing in another language produces a number that means nothing.\n- Only letters and digits are counted as words, so a line of punctuation or a row of symbols is skipped rather than treated as an error.\n- The formulas read surface features only. They say nothing about whether a sentence makes sense, and short sentences of hard vocabulary can still score well.\n- Nothing is highlighted sentence by sentence, so tracking down the clause that raised the grade means editing the text and running it again.\n\nTreat the reading grade level figures as a spread rather than a target: the tool averages Flesch-Kincaid, Gunning Fog, the ARI and Coleman-Liau, and that average is the number to quote when someone asks what reading level a page needs. For regulated copy, health, legal or government text, quote the weakest formula instead of the average, because the reader you are protecting sits at the bottom of the range. Readability is only one axis of legibility: a score in the plain-English band still reads badly if the measure is too wide or the leading too tight, which is where the line height optimizer and the paragraph width optimizer take over.",
    howTo: [
      { step: "Paste or type the copy into the sample field. The default sample is replaced as soon as you type, and every score recomputes on each keystroke." },
      { step: "Read the counts first — words, sentences, syllables, complex words, words per sentence, syllables per word and reading time at 200 words per minute — since these are what the formulas consume." },
      { step: "Compare the six formula results and the average of the four grade-level scores in the interpretation panel, which also names the Flesch band the sample falls into." },
      { step: "Edit the copy in place and watch the scores move. Rewriting one clause is usually enough to shift a grade level, so re-run rather than estimate." },
    ],
    whenToUse:
      "Reach for it when copy has to hit a stated reading level — a patient information sheet, a policy summary, a school text — or when a page reads heavy and you want the reason in numbers rather than opinion. It pairs naturally with the {{line-height-optimizer|line height optimizer}} because a plain-English grade still reads poorly at tight leading, and with the {{paragraph-width-optimizer|paragraph width optimizer}} when the measure rather than the prose is what is tiring the reader. Where the concern is the reader's access needs rather than the writing, the {{font-accessibility-evaluator|font accessibility evaluator}} covers the styling side of the same problem.",
    faqs: [
      {
        q: "Which of the six formulas should I quote?",
        a: "Quote the average of the four grade-level formulas for a general audience, and the weakest of them for regulated copy. Flesch Reading Ease is the only result that is not expressed as a school grade, which makes it useful as a headline figure, but it moves with syllables per word rather than sentence length, so it can look flattering on short sentences built from hard vocabulary.",
      },
      {
        q: "Why do Gunning Fog and SMOG disagree?",
        a: "They treat complex words differently. Gunning Fog uses the share of complex words in the whole sample, so length dilutes it, while SMOG takes the square root of complex words multiplied by 30 divided by the sentence count, so it is far more sensitive to how many sentences the sample contains. SMOG is also the more conservative of the two on short passages, which is why it is the usual choice for health writing.",
      },
      {
        q: "Does pasting markup or code change the result?",
        a: "Yes. Nothing strips tags, so the letters inside an element name or a CSS property are counted as words, and each tag inflates the octosyllabic and character counts. Paste the rendered prose rather than the markup, and expand any abbreviation you are actually measuring, since a period that ends an abbreviation is read as a sentence break.",
      },
      {
        q: "Is the syllable count exact?",
        a: "No, and it is not meant to be. Syllables come from vowel groups corrected for a silent final e and for non-syllabic es and ed endings, with a floor of one per word. That is the approximation the published formulas were fitted against, and it is why the tool reports the syllable total as a count rather than presenting it as a dictionary lookup.",
      },
      {
        q: "Can I use the scores for another language?",
        a: "No. All six formulas were calibrated on English word and sentence structure, and the syllable approximation assumes English spelling. A Spanish or German sample will return a grade, but the number is not comparable to the published bands, and the Flesch Reading Ease band names on the interpretation panel do not transfer either.",
      },
    ],
  },

  "contrast-text-checker": {
    keywords: [
      "contrast text checker",
      "wcag contrast ratio",
      "relative luminance",
      "large text classification",
    ],
    intro:
      "The contrast text checker measures one text and background pair against the WCAG 2.x contrast rules and reports the ratio, the luminance behind it and a pass or fail verdict for each level. You supply the two colours, the font size and the weight, and it decides whether the text counts as large before judging anything.",
    content:
      "The contrast text checker takes a foreground colour, a background colour, a font size in pixels and a weight, classifies the text, then measures the pair against the WCAG contrast ratio rules and returns a verdict for each conformance level that applies to it.\n\n- Both colours accept a hex field or a picker, and each value is normalised before measurement so a three-digit shorthand and a six-digit value are compared identically.\n- Font size is entered in pixels in half-pixel steps, and the weight selector spans 300 to 800.\n- Large text is classified automatically: 24px or more at any weight, or 18.66px and above once the weight reaches 700, which is the 14pt bold boundary from WCAG 1.4.3.\n- Verdicts are reported per level. AA needs 4.5 to 1 for normal text and 3 to 1 for large text; AAA needs 7 to 1 and 4.5 to 1 for the same split.\n- The preview re-renders your own string at the chosen size and weight, then prints a second line at 75 percent of that size, floored at 11px, because small text is where a weak pair fails first.\n\nThe number itself comes from the standard relative luminance formula. Each channel is linearised out of the 0 to 255 sRGB value, the three are weighted 0.2126 red, 0.7152 green and 0.0722 blue, and the ratio is the lighter luminance plus 0.05 divided by the darker luminance plus 0.05. That constant is what stops black on near-black from reporting an infinite ratio, and it is why every result carries two decimals. The panel prints both luminances to five decimals next to the normalised hex pair and the rendering-engine hex values, so a ratio that looks wrong can be traced to the colour that produced it rather than argued about.\n\n- One pair is evaluated at a time. A hover state, a placeholder, a disabled control or a focus ring needs its own run.\n- Contrast is measured between two flat colours, so text over a gradient, a photograph or a translucent overlay cannot be represented here.\n- The verdict covers the ratio only. Size and weight affect the large text classification rather than the ratio, so raising the weight does not rescue a pair that fails at body size.\n- The 3 to 1 requirement for interface borders and icons is stated in the footnote but not scored, since it applies to non-text elements rather than to a text pair.\n- Nothing reads your stylesheet. The colours measured are the ones typed in, including any that never reach production.\n\nMeasure the pairs you actually intend to ship rather than reaching for the checker at the end: the muted grey used for captions, the label inside a filled button and the placeholder text are the three that fail most often. When a pair comes up short, changing the background usually preserves the design for longer than brightening the text, because it moves the whole surface rather than one string. If the palette itself is the problem, the color on color text checker compares several pairings in a single pass, the WCAG font size checker states the thresholds and spacing minimums that apply at a given size, and the contrast pairing checker does the same work across a font pairing rather than a single sample.",
    howTo: [
      { step: "Set the text colour and the background, either by picking from the colour wells or by typing the hex values into the fields beside them." },
      { step: "Enter the font size in pixels and choose the weight, so the tool can classify the text as large or normal before applying a threshold." },
      { step: "Read the contrast ratio, the classification and the luminance pair in the results box, then check the per-level verdict lines for the AA and AAA outcome." },
      { step: "Judge the pair in the preview, including the 75 percent secondary line, and edit the sample string to your own copy before making a decision." },
    ],
    whenToUse:
      "Use it whenever a colour has to be justified against an accessibility requirement: a brand palette being applied to body copy, a caption colour that has drifted to light grey, or a dark-mode surface that was chosen by eye. It is also the fastest way to settle an argument about whether a pair is close enough, because the ratio and the thresholds are printed side by side. When the decision is about type rather than colour, the {{wcag-font-size-checker|WCAG font size checker}} covers size, spacing and resize criteria, and the {{font-accessibility-evaluator|font accessibility evaluator}} scores a whole specification in one table.",
    faqs: [
      {
        q: "What exactly counts as large text here?",
        a: "Two conditions, either of which qualifies: 24px or larger at any weight, or 18.66px or larger once the weight reaches 700. The second boundary is the 14pt bold case from WCAG 1.4.3, and it is why the weight selector matters — the same size can be judged against different thresholds depending on the weight you choose.",
      },
      {
        q: "Why is 0.05 added to each luminance before dividing?",
        a: "It is part of the WCAG formula and it keeps the ratio finite. Without the constant, two dark colours with luminances close to zero would produce an enormous or undefined ratio. Adding it to both terms, then dividing the larger by the smaller, compresses the scale so that black on white lands at the familiar 21 to 1 rather than at infinity.",
      },
      {
        q: "Do I need to check every state of the same pair?",
        a: "Yes, and it is the check most often skipped. Text that is legible at rest can fail once a hover tint or a disabled opacity is applied, because both change a colour the base pair never measured. Run each state as its own pair, and treat placeholder text and focus rings as pairs in their own right rather than as details of the base state.",
      },
      {
        q: "Is 3 to 1 enough for icons and borders?",
        a: "Yes, for non-text elements, which is a separate requirement from the text thresholds: interface components and graphical objects need 3 to 1 against their adjacent colour. This tool states that figure for reference but does not score it, because it evaluates a text pair rather than an icon, a border or a control outline.",
      },
      {
        q: "Why does the AAA result fail when AA passes?",
        a: "Because the enhanced level is a stricter target, not a stricter measurement. A pair sitting at 5 to 1 passes AA for normal text and fails AAA, which wants 7 to 1. Both verdicts describe the same measured ratio against different requirements, so the tool prints them together rather than collapsing them into a single grade.",
      },
    ],
  },

  "color-on-color-text-checker": {
    keywords: [
      "color on color text checker",
      "wcag contrast",
      "palette pairs",
      "contrast failure count",
    ],
    intro:
      "The color on color text checker measures a whole palette at once instead of one pair at a time, giving every foreground and background combination a ratio and a set of AA and AAA verdicts. Each pair is also rendered, so a failure can be seen as well as measured.",
    content:
      "The color on color text checker holds a working list of palette pairs, measures each one against the WCAG contrast thresholds and renders every pair as a sample line, so a pass or fail can be confirmed by eye as well as by number.\n\n- The palette pairs list starts with four labelled rows: body text on a surface, a muted caption, a link on a tinted background and a badge label on its fill.\n- Every row carries an editable label, a colour picker and a hex field for the foreground and the same pair again for the background.\n- Rows can be added or removed, so a palette can be trimmed to the combinations that will actually ship.\n- A single toggle switches the thresholds from normal text to large text, which is 24px or 18.66px at bold weight, and moves the bar from 4.5 to 1 down to 3 to 1.\n- Each measured pair shows its ratio to two decimals alongside AA and AAA verdict badges, and the sample is rendered at 16px regular or 26px bold depending on the toggle.\n\nThe measurements come from the same relative-luminance engine as the single-pair checker, so a ratio here and a ratio there always agree. What changes is the shape of the work: instead of one pair and a verdict, the panel keeps a contrast failure count that tallies every pair below the current threshold, which turns a palette review into a number that can be driven to zero. The rendered sample is deliberately blunt, carrying the text \"check it with your eyes too\", because a ratio meeting 4.5 to 1 does not guarantee that a muted grey caption reads comfortably, and a ratio just under the line is not automatically unusable for large display text.\n\n- The ratios describe flat colour pairs, so text over a gradient, a photograph, a translucent overlay or a hover tint needs its own row and its own measurement.\n- The large text toggle is global rather than per pair, so a palette mixing body copy and display text has to be measured in two passes.\n- The rendered sample uses two fixed sizes, 16px regular and 26px bold, rather than the real sizes from the design.\n- Removing a row is immediate, with no undo, so a palette being trimmed should be rebuilt from the original rather than edited destructively.\n- Nothing exports. The results are read from the screen and copied by hand into a review or a ticket.\n\nRun the palette through it whenever a colour palette or a theme is being proposed, and treat the seeded rows as the checklist of combinations that most often go unmeasured: muted captions, link colours on tinted surfaces, and label text on a filled badge. When a single pair needs a closer look, the contrast text checker measures one pair with its luminance breakdown, the contrast pairing checker applies the same measurement to a pairing decision, and the font accessibility evaluator scores the resulting type specification against the full set of text criteria.",
    howTo: [
      { step: "Edit the seeded rows so the labels describe your palette, replacing each foreground and background with the real values from the design." },
      { step: "Add a row for every combination you intend to ship, including muted captions, links on tinted surfaces and label text on filled elements." },
      { step: "Set the large text toggle to match what you are measuring, then read the contrast failure count and the verdict badges row by row." },
      { step: "Confirm the outcome in the rendered samples, since the eye catches a weak caption that a ratio on the line can hide." },
    ],
    whenToUse:
      "Use it when a palette is being signed off and the question is whether the whole set of combinations survives, rather than whether one pair is acceptable. It is also the fastest way to find the two or three combinations in a design system that were never measured, because the seeded rows are the ones that usually fail. For a single pair with its luminance arithmetic, the {{contrast-text-checker|contrast text checker}} is the more precise instrument, and for the type side of the same review the {{wcag-font-size-checker|WCAG font size checker}} and the {{font-accessibility-evaluator|font accessibility evaluator}} carry the thresholds that apply once the colours are settled.",
    faqs: [
      {
        q: "Why start with four seeded pairs?",
        a: "They are the combinations that most often ship unmeasured: body text on a surface, a muted caption, a link on a tint, and label text on a filled badge. They give the list a shape to edit rather than an empty screen, and each one is a real pattern from interface design rather than a placeholder.",
      },
      {
        q: "Does the large text toggle change the ratio?",
        a: "No. The ratio is a property of the two colours and nothing else. The toggle changes which threshold the ratio is compared against, dropping the requirement from 4.5 to 1 to 3 to 1, and it also changes how the rendered sample is drawn, from 16px regular to 26px bold.",
      },
      {
        q: "Why show a rendered sample when the ratio is already computed?",
        a: "Because a ratio sits on a line and a palette does not. A pair at 4.6 to 1 passes, but a muted caption at that ratio can still read as washed out against a busy layout, and a pair just below the threshold can be perfectly legible for large display text. The sample is there to be judged, not scored.",
      },
      {
        q: "How many pairs should a palette have?",
        a: "As many as will actually ship, and no more. Every foreground written over every background produces a list too long to read, so trim it to the combinations in the design: body, caption, link, badge label, button label and placeholder are the usual six, and each needs only the backgrounds it really appears on.",
      },
      {
        q: "Can I measure text over an image?",
        a: "Not directly. The checker measures two flat colours, so an image, a gradient or a translucent scrim cannot be entered as a background. The workable approach is to sample the lightest and darkest areas the text crosses, measure the pair against both, and treat the worse result as the real one.",
      },
    ],
  },

  "wcag-font-size-checker": {
    keywords: [
      "wcag font size checker",
      "text spacing minimums",
      "resize text",
      "contrast thresholds",
    ],
    intro:
      "The WCAG font size checker takes one text style and reports it against the success criteria that actually govern size and spacing, not only the contrast rule. Enter size, weight, measured contrast ratio and required zoom, and it classifies the text and scores each criterion.",
    content:
      "The WCAG font size checker evaluates a single text style against four numbered success criteria and returns a pass or fail for each, with the thresholds that applied written next to the result.\n\n- Contrast (Minimum), 1.4.3, requires 4.5 to 1 for normal text and 3 to 1 once the text is classified as large.\n- Contrast (Enhanced), 1.4.6, raises those to 7 to 1 and 4.5 to 1 for the same two classes.\n- Large-text classification follows WCAG: 24px or more at any weight, or 18.66px or more at weight 700, with the point equivalent reported as the pixel size multiplied by 0.75.\n- Resize text, 1.4.4, is scored against the zoom level you enter: support up to 200 percent passes outright, and beyond 200 percent the check only passes when the base size is at least 16px.\n- Text spacing minimums from 1.4.12 are reported as four values converted to pixels at the current size: line height at 1.5 times the size, paragraph spacing at twice the size, letter spacing at 0.12em and word spacing at 0.16em.\n\nThe check list deliberately mixes hard criteria with best practice. AA contrast, AAA contrast, the body-text norm and the resize condition are scored and counted, while the large-text classification is printed as information rather than a verdict, which keeps the failure count in the results panel honest. Everything recomputes from the four inputs, so the spacing table moves the moment the size changes: at 16px it asks for 24px of leading, 32px between paragraphs, 1.92px of tracking and 2.56px of word spacing, and a reader has to be able to apply all four without losing content or functionality. The note under the table warns against locking line height with fixed pixel heights, which is the usual way a compliant-looking style fails the criterion in practice.\n\n- The contrast ratio is typed in rather than measured from two colours, so this tool answers which thresholds apply rather than whether a specific pair meets them.\n- The spacing minimums are targets. Nothing inspects a stylesheet or verifies that a declaration survives a user stylesheet being applied over it.\n- Reflow at 320 CSS pixels, focus appearance and target size sit outside the four criteria evaluated here.\n- The 16px body-text figure is a widely used norm rather than a WCAG minimum, and the panel labels it as best practice for that reason.\n- A fixed pixel height on a text container is not detected, even though it is the commonest reason the spacing overrides fail.\n\nUse it as the checklist for a type style before a design review: quote the classification, both contrast thresholds and the four spacing minimums for the size in question, and the conversation stops being about taste. When a style fails, fix the ratio first, since contrast is measurable and unambiguous, then move to spacing. To measure a candidate pair rather than a claimed ratio, the contrast text checker returns the real figure, the CSS line height tool covers the leading end of the spacing criterion, and the mobile font size checker handles the case where the base size passes on a desktop and fails on a phone.",
    howTo: [
      { step: "Enter the font size in pixels and select the weight, so the tool can decide whether the style is treated as large text." },
      { step: "Type the contrast ratio you measured for the pair, and set the zoom level the design has to survive." },
      { step: "Work through the check list, reading the detail line under each criterion — it states the threshold that applied and the value you supplied." },
      { step: "Copy the four text-spacing minimums from the table at your chosen size and verify them against the stylesheet, remembering that a fixed pixel height will defeat them." },
    ],
    whenToUse:
      "Reach for it when a type style has to be defended against a checklist, when a designer wants to know whether 18px counts as large text, or when the spacing minimums for a given size need to be written down before a build. It is particularly useful in review, because each row states the requirement next to the measured value, which turns a vague objection into a specific number. For a full specification rather than one style, the {{font-accessibility-evaluator|font accessibility evaluator}} scores contrast, resize, spacing and reflow together, and the {{body-text-legibility-grader|body text legibility grader}} judges how the result actually reads.",
    faqs: [
      {
        q: "Why is the resize check tied to the zoom level I enter?",
        a: "Because 1.4.4 asks that text be resizable up to 200 percent without loss of content or functionality, and any support beyond that is a design decision rather than a requirement. The check passes outright at 200 percent or below, and above it the passing condition becomes a base size of at least 16px, which is the point where a larger zoom stops breaking a layout.",
      },
      {
        q: "Is 16px a WCAG requirement?",
        a: "No. It is a widely adopted norm for body text, and the panel labels it as best practice rather than a criterion. Where 16px does carry weight is the resize check, which only passes above 200 percent zoom when the base size reaches it, and the large-text classification, where 24px is the real threshold.",
      },
      {
        q: "Which criterion governs line height?",
        a: "Text spacing, 1.4.12. It does not mandate a particular line height for the page as authored; it requires that a reader who applies a line height of 1.5 times the font size, paragraph spacing of twice the font size, letter spacing of 0.12em and word spacing of 0.16em can do so without anything being clipped or lost.",
      },
      {
        q: "Why does the large-text row always pass?",
        a: "Because it is a classification rather than a criterion. Knowing whether the style counts as large text is what decides which contrast threshold the other two rows use, so the row reports the class and its consequence instead of inventing a pass or fail that WCAG does not have.",
      },
      {
        q: "Where do the 0.12em and 0.16em figures come from?",
        a: "They are the spacing overrides named in the text spacing criterion itself, which fixes tracking at 0.12em and word spacing at 0.16em as the values a reader must be able to apply. The table multiplies both by the current font size so the requirement arrives as pixels rather than as a ratio to convert by hand.",
      },
    ],
  },

  "dyslexia-font-simulator": {
    keywords: [
      "dyslexia font simulator",
      "letter spacing",
      "reading measure",
      "accessible text settings",
    ],
    intro:
      "The dyslexia font simulator places two renderings of the same paragraph side by side, one at browser defaults and one at settings chosen for dyslexic readers, and writes out the CSS that produces the second. It is a comparison tool rather than a font installer: you drive six sliders and read the values that change.",
    content:
      "The dyslexia font simulator renders one text sample twice and exposes the difference as a set of numbers plus the declaration block that reproduces it, so a recommendation can be handed to a developer rather than described.\n\n- Font size from 14px to 26px, defaulting to 19px, comfortably above the 16px browser norm.\n- Line height from 1.2 to 2.4 in steps of 0.05, defaulting to 1.8.\n- Letter spacing from 0 to 0.3em in hundredths, defaulting to 0.12em.\n- Word spacing from 0 to 0.4em, defaulting to 0.16em.\n- Reading measure from 30ch to 90ch, defaulting to 60 characters per line.\n- Weight from 300 to 700 in steps of 50, defaulting to 450, so the text is slightly heavier than regular without reading as bold.\n\nThe settings follow the accepted style guidance for dyslexic readers rather than any single product: a larger sans face with generous tracking, wide leading, a short measure, ragged-right text and dark grey on off-white instead of maximum-contrast black on white. The generated rule names Atkinson Hyperlegible with Verdana and Tahoma behind it, sets text-align to left so the copy is never justified, and hard-codes the reading colours as #1c1c1c on #faf8f3. Next to the CSS the panel reports the characters-per-line target and converts the effective reading width to rem by multiplying the size by the measure and dividing by sixteen, which is the figure to quote in a layout review.\n\n- The right-hand pane is a comparison, not a claim that any font cures dyslexia. The spacing and size controls are the parts supported by readability guidance.\n- Only one stack is written. A different face has to be substituted by hand, and the tool cannot tell whether the named file is installed, so the fallbacks are what many readers will actually see.\n- Six values are adjustable and nothing else: case, hyphenation, column count and alignment are pinned to the recommended settings.\n- The toggle affects the preview pane only, so the CSS can be copied while the adjustment is switched off and the two will disagree.\n- This is a browser rendering, not an assistive-technology test. It says nothing about screen reader output or about how the settings interact with a user stylesheet.\n\nHand the exported rule over as a starting point, treating it as accessible text settings rather than a prescription, and keep the measure between 45 and 70 characters: beyond that the eye has to hunt for the start of the next line, which is exactly the effort these settings exist to remove. Letter spacing past roughly 0.15em starts to break up word shapes, so take as much as the reader needs and no more. Body size is the other half of the problem on small screens, which is what the mobile font size checker examines, and where the goal is comparing faces for low-vision readers rather than tuning one, the low vision font tester is the closer fit. The line height optimizer covers leading at a fixed measure, and the letter spacing calculator covers tracking when the adjustment has to be applied to an existing design system.",
    howTo: [
      { step: "Paste your own paragraph into the sample field so both panes render text you care about, then set the size, leading, tracking, word spacing, measure and weight with the sliders." },
      { step: "Compare the browser-default pane against the adjusted pane, watching the characters-per-line and reading-width readouts as the measure slider moves." },
      { step: "Toggle the adjustment off and on to see how much of the improvement comes from spacing alone rather than from the named face." },
      { step: "Copy the generated CSS block and the effective reading width, then hand both to whoever maintains the stylesheet." },
    ],
    whenToUse:
      "Use it when a reader has asked for more comfortable body text and you need to show what changes and by how much, or when a page of long-form copy is being tuned for a general audience and the default settings look tight. It is also a quick way to demonstrate to a stakeholder why justified text and a wide measure are a poor pairing for readers who lose their place. Where the underlying ability rather than the reading configuration is the question, the {{readability-score-calculator|readability score calculator}} measures the prose, and the {{font-accessibility-evaluator|font accessibility evaluator}} evaluates a whole type specification against the WCAG criteria.",
    faqs: [
      {
        q: "Will these settings help every dyslexic reader?",
        a: "No, and the tool does not claim they will. Larger text, wider spacing and a shorter measure are the adjustments with the broadest support, and they help many readers who lose their place in dense copy. The named face is a starting suggestion rather than a treatment, and individual readers differ enough that the sliders exist precisely so the values can be tuned rather than adopted wholesale.",
      },
      {
        q: "Why does the output name Atkinson Hyperlegible?",
        a: "It is written into the declaration as the first choice, with Verdana and Tahoma behind it, because a rule has to name something concrete. It is a suggestion rather than a requirement — replace the family name with whatever face the project already licenses, and keep the fallback chain so the settings survive when the first file is missing.",
      },
      {
        q: "Why is the text left-aligned instead of justified?",
        a: "Because justification evens the line endings by varying the spaces between words, and those uneven gaps are exactly what makes a line hard to scan for a reader who is already working to keep their place. Ragged right keeps word spacing constant, which costs a slightly rougher edge and buys a steadier rhythm.",
      },
      {
        q: "Why off-white rather than a pure white background?",
        a: "The generated rule uses #1c1c1c on #faf8f3 rather than black on white. Full contrast is not automatically easier to read: a bright white field increases glare and halation, and dark grey on a warm off-white holds a high ratio while reducing that glare. The pair still clears the contrast thresholds by a wide margin.",
      },
      {
        q: "Can I apply these values to an existing stylesheet?",
        a: "Yes, and that is the intended use. Every value is written in a portable unit — pixels for size, unitless line height, em for tracking, ch for the measure — so the declaration can be added to a class and applied to an article body without touching the rest of the design. The reading-width readout tells you what the resulting column will measure.",
      },
    ],
  },

  "mobile-font-size-checker": {
    keywords: [
      "mobile font size checker",
      "characters per line",
      "ios auto zoom",
      "viewport width",
    ],
    intro:
      "The mobile font size checker works out how many characters a line will carry inside a real phone viewport, then reports the size and measure checks that follow from it. It answers a question a desktop review cannot: whether the type that looked comfortable at 1440 pixels still works at 390.",
    content:
      "The mobile font size checker takes a viewport width, the page padding on each side, a font size and a family width factor, then computes the available text width, the characters per line and the size that would produce a 65 character measure.\n\n- Viewport width defaults to 390px and page padding to 16px a side, and the available text width is the viewport minus twice the padding.\n- Family width factors are 0.5em average for a humanist sans, 0.55em for a serif and 0.6em for a monospace face, so the same size produces different line lengths on each.\n- Characters per line is the available width divided by the size multiplied by that factor, which is the figure the measure check reads.\n- Four checks are scored: body text at 16px or more, an absolute floor of 12px, the iOS auto zoom condition for form inputs, and a measure between 45 and 75 characters.\n- The text role selector covers body text, caption, form input and heading, and the size that would give a 65 character measure is reported alongside the checks.\n\nThe iOS auto zoom check is the one that catches people out. Safari on iOS enlarges the whole page when a focused text input is smaller than 16px, so a 15px input can make a page appear to jump on first use, and the check exists to catch that case before it reaches a device. The reference table that follows gives the guidance band per element: 16px for body text and 16 to 18px comfortable, 12px minimum for secondary and caption text, 16px for form inputs with the same auto zoom reason, 14px for a button label, and 20px for a page heading. The note under the table says plainly that WCAG itself sets no absolute font-size minimum, which is why the 16px figure is presented as a widespread norm rather than as a requirement.\n\n- The character width factors are averages, so a condensed or wide face will drift from the estimate, and the panel tells you to re-measure with the real typeface when the design is tight.\n- The measure check assumes a single column: a layout with a sidebar or a card grid has less usable width than the calculation assumes.\n- No leading is modelled, and the 45 to 75 character band says nothing about line height.\n- Device coverage is limited to whatever viewport and padding you enter, so a design has to be checked once per breakpoint rather than once for phones in general.\n- The auto zoom check is stated for iOS Safari and does not describe every mobile browser's behaviour.\n\nRun it per breakpoint whenever a fluid size or a clamp is being introduced, since a size that reads well at 390 can fall under the measure band at 320 and over it on a large phone. When the characters per line figure keeps missing, the paragraph width optimizer works through the same problem with more variables, the WCAG font size checker supplies the spacing minimums that apply at the chosen size, and a fluid type scale is the structural answer rather than a per-breakpoint size fix, which is the CSS fluid typography builder's job.",
    howTo: [
      { step: "Enter the viewport width and the page padding so the available text width matches the real layout at that breakpoint." },
      { step: "Set the font size, choose the family width factor that matches the face, and pick the text role being checked." },
      { step: "Read the characters per line figure and the suggested size for a 65 character measure, then compare against the four checks." },
      { step: "Repeat for each breakpoint you ship, and raise any form input below 16px before it triggers the iOS auto zoom behaviour on a device." },
    ],
    whenToUse:
      "Use it when a type scale is being adapted for mobile, when a clamp or fluid size is tuned, or when a body size chosen on a desktop layout needs to be justified at 390 pixels. It is also the quickest way to catch a form input that will zoom the whole page on an iPhone, which is a defect rather than a preference. When the measure itself is the problem, the {{paragraph-width-optimizer|paragraph width optimizer}} works it through properly, the {{wcag-font-size-checker|WCAG font size checker}} states the spacing minimums at the chosen size, and where several breakpoints need one continuous scale, the {{css-fluid-typography-builder|CSS fluid typography builder}} is the structural fix.",
    faqs: [
      {
        q: "Why does a 15px input zoom the whole page on iOS?",
        a: "Because Safari on iOS enlarges the viewport when a focused text field computes to less than 16px, so the reader's first tap appears to break the layout. The check flags any input below 16px for that reason. Raising the input to 16px keeps the design intact and removes the zoom, and it is a change that rarely costs a layout anything.",
      },
      {
        q: "Why are the character width factors different per family?",
        a: "Because a line of text is measured in glyph widths, and those differ by face. A humanist sans averages about 0.5em per character, a serif about 0.55em and a monospace face about 0.6em, so the same 16px setting carries noticeably fewer characters in monospace. The factors are averages across a family, which is why the panel warns that a condensed or wide face will drift.",
      },
      {
        q: "What viewport should I check?",
        a: "The narrowest one you support, and every breakpoint where the size changes. 320px is the usual narrow floor, 390px represents a modern phone, and a large phone or small tablet in the 430 to 480 range is worth a pass if the layout changes there. Each check takes seconds, so run all of them.",
      },
      {
        q: "Is 16px a minimum I have to meet?",
        a: "Not in WCAG, and the tool says so in the reference note. It is a widespread norm for mobile body text and it is also the iOS auto zoom threshold for inputs, which gives it practical force even though no criterion states an absolute minimum size. The 12px figure used here is a legibility floor rather than a standard.",
      },
      {
        q: "Does the measure check account for a sidebar or a grid?",
        a: "No. It assumes the text spans the available width between the page paddings, so a card, a sidebar or a two-column layout on a phone has less usable width than the calculation. Enter the real text width as the viewport in those cases, or subtract the extra padding by raising the padding value.",
      },
    ],
  },

  "character-code-converter": {
    keywords: [
      "character code converter",
      "code point",
      "utf-8 bytes",
      "css escape",
    ],
    intro:
      "The character code converter lists every encoding a character has, side by side: code point, decimal, HTML entity, CSS escape, JavaScript escape, UTF-8 bytes, UTF-16 units, percent-encoding and binary. It is the lookup table for anything that has to be written into code rather than typed.",
    content:
      "The character code converter takes a string and returns a table of encodings, one row per character, with the forms that different languages and file formats expect.\n\nThe columns are the useful part, and each exists because something in a codebase needs it.\n\n- The code point in hexadecimal and in decimal, which is how a character is specified in documentation and in most APIs.\n- The HTML entity in hexadecimal form, plus the CSS escape with its terminating space, which is the form that goes into a content declaration.\n- The JavaScript escape, which differs for characters above the basic multilingual plane since they need the braces form.\n- The UTF-8 byte sequence and the UTF-16 code units, which are the two byte-level counts that disagree about astral characters.\n- The percent-encoded form and the binary value of the code point, which cover URL work and the occasional bit-level check.\n\nThe implementation detail worth knowing is that the table iterates by code point rather than by UTF-16 unit. Characters above the basic plane — emoji, rare CJK ideographs — are represented in JavaScript as a surrogate pair, and a naive loop over the string would report two broken halves instead of one correct value. Iterating by code point reports the real code point, and the readouts make the difference plain: the character count, the UTF-8 byte count and the UTF-16 unit count are three different numbers, and they diverge as soon as the text contains anything outside the basic plane.\n\nBelow the table, the first six characters get copy-ready rows carrying the CSS escape and the JavaScript escape with a copy button, which is the workflow the tool is built around: find the character, take its escape, paste it into a stylesheet. One subtlety is handled there rather than left to chance, which is that a CSS escape is terminated by a space, so the copy button trims it; when the next character in a declaration is a hexadecimal digit, that space has to be put back or the escape absorbs the following character.\n\nFour limits are worth knowing before the table is treated as a specification.\n\n- The conversion stops after the first two hundred characters, which is generous for a symbol lookup and short for a paragraph.\n- The entity column shows the hexadecimal form only, since decimal entities work everywhere and the named forms are a separate catalogue.\n- The binary column is the code point rather than the UTF-8 bytes, which is the common case for bit-level work but not the only reading of the word.\n- The table lists encodings character by character, so it does not describe a whole string's size on the wire once a transport encoding is involved.\n\nWhat it does provide is the one thing documentation rarely collects in a single view: every form a character can take, side by side, so the right one can be copied rather than derived. Paste a character, take the form the destination expects, and move on.",
    howTo: [
      { step: "Paste the text or the single character into the input, then read the three counts to see whether anything sits outside the basic plane." },
      { step: "Find the character's row and choose the column the destination needs: entity for markup, escape for stylesheets, bytes for storage or headers." },
      { step: "Copy the escape from the ready-made row below the table rather than retyping it, and restore the terminating space if the next character is a hex digit." },
      { step: "Check the character count against the byte count when sizing storage or a request, since the two differ as soon as non-ASCII characters appear." },
    ],
    whenToUse:
      "Reach for it when a character has to be written into a stylesheet, a template or a JSON payload rather than typed, when a string's length behaves unexpectedly because it contains astral characters, or when a byte count is needed for a header or a storage calculation. The side-by-side columns save a round of documentation. For identifying an unknown character the {{unicode-character-explorer|Unicode character explorer}} gives the block context, the {{emoji-unicode-mapper|emoji Unicode mapper}} handles multi-code-point emoji sequences, and the {{special-character-picker|special character picker}} covers the punctuation characters with their named entities.",
    faqs: [
      {
        q: "Why do the character and byte counts differ?",
        a: "Because UTF-8 and UTF-16 spend different numbers of bytes on different characters, and astral characters cost more in both. A Latin letter is one byte and one code unit; an emoji is four bytes, two code units and one code point. The table reports all three so the relevant one can be chosen.",
      },
      {
        q: "What is a CSS escape for?",
        a: "It lets a stylesheet name a character by code point, which is how a generated content declaration can carry a glyph that would be awkward to type or unsafe to store in the file. The escape is a backslash followed by the hexadecimal value and a terminating space.",
      },
      {
        q: "Why does the JavaScript escape look different for some characters?",
        a: "Because characters above the basic plane cannot be written as a single four-digit escape. They need the braced form, which takes the full code point, and that syntax only exists in engines that support it. For older targets the value has to be written as a surrogate pair instead.",
      },
      {
        q: "When would I need percent-encoding?",
        a: "Whenever a character travels in a URL, a query parameter, or a form field. The percent-encoded form is what the request actually carries, and seeing it beside the code point explains why a URL with a space or an accent often needs to be written differently from how it reads.",
      },
      {
        q: "Can I convert a long text?",
        a: "The table covers the first two hundred characters, which is enough for a symbol lookup or a short string and deliberately short for prose. Converting a whole document is a job for a script, and what the tool provides is the reference for the handful of characters that need attention.",
      },
    ],
  },

  "unicode-character-explorer": {
    keywords: [
      "unicode character explorer",
      "unicode block",
      "code point",
      "utf-8 bytes",
    ],
    intro:
      "The Unicode character explorer indexes the blocks that matter to typography, with each block's range, size and a curated printable sample, plus an inspector for any character you paste. Samples are curated rather than generated because a whole block rendered blindly is mostly unassigned slots.",
    content:
      "The Unicode character explorer pairs a searchable index of Unicode blocks with an inspector for individual characters, which is the combination that answers the two questions typography work raises: which block does this belong to, and what exactly is this character in code.\n\nThe inspector reports four encodings for any character pasted into it.\n\n- The code point in hexadecimal with its decimal value, so the same character can be described in either notation.\n- The block it belongs to, looked up by range rather than by name, which matters for characters near a boundary.\n- Its utf-8 bytes and its hexadecimal HTML entity, which are the two forms a front-end task usually needs.\n- A copy button for the character itself, since the point of inspecting is usually to reuse it.\n\nThe block index holds curated samples because a block rendered wholesale is mostly gaps. Basic Latin shows the Latin alphabet, digits and punctuation; Latin Extended-A shows Central and Eastern European letters; the General Punctuation block shows the dashes, quotes and invisible spacing characters that cause real layout bugs; the symbol blocks show arrows, mathematical operators, box drawing and geometric shapes; and the emoji blocks show pictographs and faces. Filtering works on the block name and on the hexadecimal range, so a code point found elsewhere can be traced to its block by typing part of its value, and a character that has already been identified can be placed without pasting it.\n\nThe framing the tool gives the list is the part worth keeping: a font's coverage is not a count of glyphs but a set of claims, and each block a family covers costs design time and file size. Display faces generally stop after Basic Latin plus a few punctuation blocks, while text families continue through Latin Extended, Greek and Cyrillic, and specialist families extend into symbols or CJK. When a glyph is missing, the browser falls back to the next family in the stack for that character alone, which is why a mixed-script page can render with three typefaces — sometimes seamlessly, sometimes not.\n\nFour limits apply, and they are worth knowing before the index is quoted.\n\n- The index is a curated subset of the several hundred Unicode blocks, chosen for typography rather than for completeness.\n- Each sample lists printable characters only, so a block's size in code points is never the number of characters shown.\n- The character inspector describes the first character of whatever is pasted, so a sentence has to be entered one character at a time.\n- The UTF-8 byte count covers that first character only, which makes it useful for sizing a field and not for sizing a document.\n- None of this tests a specific font: whether a chosen face carries a character is a coverage question, which the missing glyph detector answers directly.\n\nThe two halves are complementary in practice — the index narrows down where a character lives, and the inspector says exactly what it is once it has been found.",
    howTo: [
      { step: "Paste the character you are working with into the inspector and read its code point, block and UTF-8 bytes before deciding how to write it in code." },
      { step: "Filter the block list by name or by part of a hexadecimal range to find the block a code point belongs to." },
      { step: "Read the sample column to see what the block actually contains in practice, remembering that non-printable and unassigned code points are not shown." },
      { step: "Copy the character or its entity from the inspector rather than retyping it, since visually identical characters can come from different blocks." },
    ],
    whenToUse:
      "Reach for it when a character in a document has to be identified before it is replaced or escaped, when a face's script coverage is being discussed and the block names matter, or when a symbol that looks like a hyphen turns out to be something else entirely. The block context is what makes the identification reliable. For the coverage of a specific face the {{missing-glyph-detector|missing glyph detector}} is the direct test, the {{unicode-block-explorer|Unicode block explorer}} covers the plane structure behind the blocks, and the {{character-code-converter|character code converter}} lists every encoding of a character at once.",
    faqs: [
      {
        q: "Why are the block samples curated instead of complete?",
        a: "Because a block contains unassigned and control code points alongside printable characters, so rendering the whole range produces mostly empty boxes. Each sample lists the characters a designer is likely to meet, which is what makes the index readable at a glance.",
      },
      {
        q: "What is a block, exactly?",
        a: "It is a contiguous range of code points that Unicode groups by purpose or script, such as General Punctuation or Cyrillic. Blocks are the unit fonts are usually described in, since a family's coverage is naturally summarised as which blocks it supports rather than as a list of characters.",
      },
      {
        q: "Why does the tool show UTF-8 bytes?",
        a: "Because byte length is what file size and network transfer are measured in, and it differs from the character count. A Latin letter is one byte, most accented letters and CJK characters are two or three, and an emoji is four — which is why a paragraph's weight cannot be estimated from its length in characters.",
      },
      {
        q: "How do I tell two similar characters apart?",
        a: "By code point rather than by eye. A typographic apostrophe, a prime and a straight quote can look nearly identical at small sizes but come from three different blocks, and the inspector names the block for the character you pasted. The copy button then captures the right one.",
      },
      {
        q: "Does the explorer tell me whether my font has a character?",
        a: "No. It describes the character and the block it lives in, not the coverage of any particular face. Whether a chosen font contains a code point depends on the file, and the missing glyph detector asks the browser's font-matching engine that question directly.",
      },
    ],
  },
};
