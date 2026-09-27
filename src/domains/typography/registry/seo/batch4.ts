import { PRIVACY_SECURITY_TEXT } from "../privacy";
import type { ToolSeoEntry } from "../tool-seo";

/** Racira Fonts SEO content — batch 4 (font preview/testing + type scale). */
export const typographySeoBatch4: Record<string, ToolSeoEntry> = {
  "custom-text-font-preview": {
    keywords: [
      "custom text font preview",
      "real copy",
      "word count",
      "preview css",
    ],
    intro:
      "The custom text font preview is the paste-in-a-paragraph version of the previewer, built for real copy rather than a specimen line. It reports the word and character counts of what you paste and writes the CSS that reproduces the rendering.",
    content:
      "The custom text font preview takes a block of real copy and four type controls, renders it at the resulting setting and exports the class that produces it.\n\n- The family list is the shared catalogue, each entry labelled with its classification so a serif, sans or display face is identified before it is judged.\n- Size runs from 8px to 120px, weight comes from the catalogue's weight list, and the defaults are a 32px, 500 weight setting for a piece of display copy.\n- Tracking spans minus 0.1em to 0.4em in steps of five thousandths, and line height spans 0.9 to 2.4 in steps of two hundredths.\n- The readouts report the family classification, the word count and the character count of the pasted text.\n- The preview CSS is a single class carrying the stack, the pixel size, the weight, the em letter spacing and the unitless leading.\n\nThe word and character counts are what make this the version to reach for when the copy is real rather than a specimen. A headline of four words behaves differently from a pangram, and the counts are the quickest way to see that a paragraph is longer than the container it is being previewed in. Tracking is in ems here rather than pixels, which means the adjustment scales if the same setting is applied at another size, and the preview falls back to the domain's default sample string when the field is empty, so an empty field never renders nothing. The size range starts lower than the display-oriented previewers, at 8px, because the copy being tested may be a caption or a legal line rather than a headline.\n\n- Only faces from the shared catalogue can be previewed, and no face metadata is shown beyond its classification.\n- The word count splits on whitespace, so a hyphenated compound counts as one word and a language without spaces between words counts as one word for the whole passage.\n- There is no italic control and no per-line or per-paragraph override, so a mixed setting has to be judged in several passes.\n- The character count includes punctuation and spaces, which is useful for a rough measure but not for a character budget.\n- Nothing is saved, and the exported class keeps the pixel size, so it is not responsive as written.\n\nUse it when a real sentence or paragraph has to be judged in a candidate face, when a client has supplied their own copy to preview, or when the numbers matter and the length of a line needs checking before it goes into a layout. Where the question is how a face behaves across a range of sizes, the waterfall font preview answers it directly, and where several faces have to be compared on the same copy, the multi-font comparison puts them side by side. The font previewer is the display-oriented sibling, the font size preview answers the size question for a single face, and the waterfall font preview covers the whole ladder if the copy has to hold up at every step.",
    howTo: [
      { step: "Paste the real copy into the text field, then choose the family, watching the classification readout since it changes what sizes will read well." },
      { step: "Set the size and weight first, then adjust tracking and leading around them rather than the other way round." },
      { step: "Read the word and character counts to confirm the paste is complete and to see how long the passage actually is." },
      { step: "Copy the exported class and, if the same setting is needed at several sizes, convert the pixel size to rem so it scales." },
    ],
    whenToUse:
      "Reach for it when a specific piece of copy has to be judged in a candidate face, when a paragraph rather than a headline is the thing being set, or when the length of a line needs a numeric check. It is the tool for real content rather than specimens. Where the same copy has to be compared across several faces, the {{multi-font-comparison|multi font comparison}} lays them out together, the {{font-size-preview|font size preview}} narrows the size question, and the {{waterfall-font-preview|waterfall font preview}} shows the copy down an entire size ladder.",
    faqs: [
      {
        q: "Why does the word count look wrong for hyphenated words?",
        a: "Because the count splits on whitespace, so a hyphenated compound counts as one word and a line break inside a word does not split it either. The figure is there to confirm that a paste arrived intact and to give a rough sense of length, not to produce a manuscript count. For a language that does not separate words with spaces, expect the whole passage to count as one.",
      },
      {
        q: "Why is tracking in ems here and in pixels elsewhere?",
        a: "Because this tool is about copy at potentially several sizes. An em-based tracking value scales with the font size, so a setting tuned here stays proportionally correct if the same class is applied at a different size. The display preview uses pixels because nudging a heading by a pixel or two is how that adjustment is actually made.",
      },
      {
        q: "Which size should I start from for a paragraph?",
        a: "Around 16px to 19px for body copy, which is why the range starts at 8px rather than at a display size. Below about 16px the measure and leading start to matter more than the face itself, and above 24px the text is a display setting rather than a paragraph. The classification readout tells you which kind of face you are sizing.",
      },
      {
        q: "Is the exported class responsive?",
        a: "No. It writes the pixel size, the pixel-domain sizing and the unitless leading exactly as previewed, so it renders the same at every viewport. Converting the font size to rem and, if needed, replacing it with a clamp is the usual next step, and the fluid type scale builder does that conversion properly.",
      },
      {
        q: "What happens if I leave the text field empty?",
        a: "The preview falls back to the domain's default sample string, so the panel never renders an empty box. The word and character counts drop to zero, which is the signal that the field is empty rather than that the copy failed to paste.",
      },
    ],
  },

  "pangram-font-tester": {
    keywords: [
      "pangram font tester",
      "alphabet coverage",
      "missing letters",
      "text face",
    ],
    intro:
      "The pangram font tester renders a sentence that contains every letter of the alphabet, then counts which letters actually appeared. Because a pangram exercises the whole lowercase alphabet in one line, it is the fastest fair test of a text face.",
    content:
      "The pangram font tester takes a pangram, a face, a size and a weight, then renders the sample and reports the alphabet coverage it achieves.\n\n- The pangram list offers several classic sentences rather than one, so the sample can be changed without typing a new sentence.\n- Coverage is counted against the lowercase alphabet and reported as a fraction out of twenty-six, with the missing letters named individually.\n- Size runs from 10px to 96px, defaulting to 28px, and weight comes from the catalogue's list with 400 as the default.\n- A second line renders the digits and the punctuation set in the same face at the same weight, so figures and marks can be judged alongside the letters.\n- The character count of the sample is reported, which is the check that a paste or an edited pangram did not lose anything.\n\nThe coverage count is what makes the tool more than a sample box. A pangram is only a fair test if every letter is in it, and the count turns that assumption into a number: a sample showing twenty-four of twenty-six letters has two letterforms unexamined, and the panel names them so the gap can be filled. Coverage deliberately counts lowercase only, and the panel says so, because a text face's lowercase is where most of the reading happens and where a face's rhythm is decided. Digits and punctuation are rendered on their own line rather than being counted, since a pangram rarely contains them and a face's figure style is judged differently: old-style figures that sit below the baseline behave very differently from lining figures at the same size.\n\n- Coverage counts lowercase letters only, so a face with an unusual uppercase design is not tested by the count.\n- The pangram list is fixed, so a custom sentence has to be edited in after copying one from the list.\n- Digits and punctuation are rendered but not counted, so a missing glyph in either appears as a fallback rather than as a warning.\n- Only one size and one weight are shown at a time, and there is no tracking or leading control.\n- Glyph-level problems such as a badly drawn pair or a poorly spaced letter are visible but not measured.\n\nUse it when a text face is being judged on its letters rather than on a display line, when a webfont has to be checked for a complete alphabet before it is shipped, and when a family's lowercase needs comparing against another face on the same sentence. The named missing letters are the detail that makes the check worth repeating. Where the full character set matters, the font specimen sheet lays it out, and where individual glyphs need inspecting rather than whole words, the glyph browser shows them one at a time. The font specimen sheet covers the whole character set for a handover, the multi font comparison puts two faces on the same sentence, and the font previewer is the place to adjust tracking and leading once a face has passed the alphabet test.",
    howTo: [
      { step: "Pick a pangram from the list, then choose the face you are testing and set the size and weight you expect to use it at." },
      { step: "Read the coverage figure and the missing-letters readout, and if any letter is missing, treat the sample as an incomplete test." },
      { step: "Judge the lowercase letterforms for rhythm and consistency, since that is what the sentence is there to show." },
      { step: "Compare the digits and punctuation line against the letters to see whether the figures match the text in weight and colour." },
    ],
    whenToUse:
      "Reach for it when a text face is being chosen, when a webfont is being checked for a complete alphabet before shipping, or when two faces need comparing on the same sentence so the letterforms can be judged rather than the words. It is the fastest genuine test of a lowercase design. Where the whole character set, not just the letters, has to be inspected, the {{font-specimen-sheet|font-specimen sheet}} lays it out, the {{font-previewer|font previewer}} covers the display setting with tracking and leading, and the {{font-size-preview|font size preview}} answers how the same face behaves at another size.",
    faqs: [
      {
        q: "Why is coverage counted in lowercase only?",
        a: "Because that is where most reading happens and where a face's design is most exposed. Uppercase letters are usually a smaller, simpler set, and a face can have a perfectly good alphabet while its lowercase sits unevenly. Counting lowercase makes the check specific to the part of the design the sample is testing.",
      },
      {
        q: "What if a letter is reported as missing?",
        a: "Then the sample is not a complete test and the missing letters are the ones you have not seen. Either choose another pangram from the list or add the letters to the sentence you are using, since the point of a pangram is that one line exercises the whole alphabet. Editing the sentence changes the character count, which the readout shows.",
      },
      {
        q: "Why render digits and punctuation separately?",
        a: "Because a pangram contains almost none of them. Digits are judged differently from letters: the choice between lining and old-style figures, and whether the figures match the text in colour, only shows when they are set in a line of their own. The same applies to quotation marks, brackets and dashes, which are where a font's details are often weakest.",
      },
      {
        q: "Can I test my own sentence?",
        a: "The list is fixed, but any entry can be replaced with your own text in the underlying component. What you lose by doing that is the coverage guarantee, which the readout will show immediately. For testing a specific phrase rather than the alphabet, the custom text font preview is the better fit.",
      },
      {
        q: "Does the tool measure anything about the letterforms?",
        a: "No, and nothing could from a rendering alone. The count measures coverage; the judgement of rhythm, spacing and weight consistency is visual. Metrics that can be measured, such as x-height and cap height, come from the font file rather than from a rendered sample, which is why a specimen sheet and a pair comparison are complementary.",
      },
    ],
  },

  "font-size-preview": {
    keywords: [
      "font size preview",
      "unit conversion",
      "root font size",
      "line box",
    ],
    intro:
      "The font size preview renders a ladder of sizes and converts each one into the units a stylesheet needs. Pixels are the authoring unit, rem is what the browser resolves against the root font size, and points are the print unit, so all three are reported together.",
    content:
      "The font size preview renders one sample down an editable ladder of sizes and prints the unit conversion for each step alongside the rendered row.\n\n- The default ladder is 12, 14, 16, 18, 21, 24, 30, 36, 48 and 60 pixels, which spans a caption through to a large heading.\n- The root font size is an input rather than an assumption, because rem values only mean something relative to it, and it defaults to 16px.\n- Each row is labelled with its pixel size and rendered at that size at a fixed line height, with the sample wrapping rather than truncating.\n- The conversion table reports each size in pixels, in rem calculated against the root, in points at 0.75 per pixel, and as a 1.5 times line box in pixels.\n- Weight and family are selectable, so the ladder can be read in the face the project actually uses rather than in a default.\n\nThe conversions are the substance of the tool. A pixel size is what a designer thinks in, and a rem value is what a browser actually applies once the root font size is known, so a size ladder authored in pixels has to be converted before it can be expressed responsively. Points are the third unit, and the 0.75 ratio between pixels and points at 96 dots per inch is the same conversion the print tools use, which is what lets a size survive the trip from a screen design to a print specification. The line box column multiplies each size by 1.5, which is the leading a text setting usually wants, so the column doubles as a reminder of how much vertical space each step will take.\n\n- Sizes are taken as typed and filtered to the range from 1 to 300 pixels, so a value outside that is dropped rather than clamped.\n- The point conversion assumes 96 dots per inch, which is the CSS reference ratio rather than a particular device or printer resolution.\n- The line box column uses a fixed 1.5 multiplier, so it describes one common setting rather than the leading you have chosen.\n- The rem column depends entirely on the root font size entered, so a project that changes the root must update it before relying on the figures.\n- The ladder has no limit on the number of entries, and a long list is rendered in full rather than paginated.\n\nUse it when a type scale is being authored in pixels and the rem values are needed for the stylesheet, when a size has to be quoted in points for a print job, or when a ladder needs reading in the face a project actually uses rather than a default. Where the scale itself has to be derived rather than converted, the type scale generator and the modular scale calculator produce the steps. The type scale generator derives the ladder from a ratio, the waterfall font preview shows the same face down that ladder for judgement, and the modular scale calculator compares the ratios a scale could be built on.",
    howTo: [
      { step: "Type the size ladder you want to check, either your own scale or the default list, and set the root font size the project uses." },
      { step: "Choose the family and weight so the rendered rows show the face the sizes will actually be applied to." },
      { step: "Read the ladder to judge whether each step is distinguishable from the one below it at the size it will be used." },
      { step: "Copy the rem and point values from the conversion table into the stylesheet and the print specification respectively." },
    ],
    whenToUse:
      "Reach for it when a scale authored in pixels has to become rem values, when a size needs quoting in points for print, or when a set of steps has to be checked for whether adjacent sizes look different at their real sizes. It is the conversion step between a design and a stylesheet. For deriving the steps in the first place, the {{type-scale-generator|type scale generator}} and the {{modular-scale-calculator|modular scale calculator}} do that work, while the {{waterfall-font-preview|waterfall font preview}} judges how the face behaves across the same range.",
    faqs: [
      {
        q: "Why does the rem value depend on the root font size?",
        a: "Because a rem is one root em, so the pixel equivalent changes if a user or a stylesheet changes the root size. At the default 16px root, a 24px size is 1.5rem, and at a 20px root the same 1.5rem would render at 30px. That dependence is also the advantage: a size expressed in rem scales for readers who set a larger base size.",
      },
      {
        q: "How are points calculated here?",
        a: "At 0.75 points per pixel, which is the ratio that follows from 96 pixels per inch and 72 points per inch. So a 16px setting is 12 points, which is the familiar body size in print. The ratio is a CSS and print convention rather than a measurement of any particular screen or paper.",
      },
      {
        q: "What is the line box column for?",
        a: "It multiplies each size by 1.5 to show the vertical space the step would occupy at a typical text leading. On a ladder, the column makes the relationship between size and height visible, so it is easy to see that moving from 24px to 30px adds nine pixels of line box rather than six.",
      },
      {
        q: "Why would two adjacent sizes look identical?",
        a: "Because a step of one or two pixels is often within the difference a face can express, particularly at larger sizes. Reading the ladder is how a scale is trimmed: if 16px and 18px are indistinguishable in the chosen face, one of them is not doing work, and the ratio between the steps is usually the thing to adjust.",
      },
      {
        q: "Can I set a size in rem rather than pixels?",
        a: "The ladder is authored in pixels because that is the unit sizes are discussed in, and the conversion table reports the rem equivalent. To author in rem, take the rem column and use it in the stylesheet, remembering that the value depends on the root size you entered rather than on a fixed ratio.",
      },
    ],
  },

  "font-line-height-tester": {
    keywords: [
      "font line height tester",
      "line box height",
      "leading sweep",
      "ascenders and descenders",
    ],
    intro:
      "The font line height tester repeats one paragraph at a sweep of leading values so the choice can be made by reading rather than by guessing. The sweep is defined by a start value, a step and a count, and each step is labelled according to the band it falls in.",
    content:
      "The font line height tester renders the same paragraph once per leading value across a leading sweep you define, then reports the range and the line box height at the last step.\n\n- The sweep starts from a value between 0.9 and 2, advances by a step between 0.05 and 0.4, and renders between two and twelve steps.\n- Each rendered step is labelled with its exact multiplier and tagged as tight below 1.3, in the body range between 1.3 and 1.7, or airy above 1.7.\n- Type size runs from 10px to 40px, and the same size applies to every step in the sweep.\n- The paragraph is editable, so the sweep can run on a real passage rather than a specimen sentence.\n- The readouts report the line box at a multiplier of one, the range of the sweep, and the box height at the final step in pixels.\n\nThe bands are what make the output readable at a glance. A leading below about 1.3 puts ascenders and descenders from adjacent lines into each other's space, which is what the tight tag marks, and it is a deliberate choice for display type and a poor one for a paragraph. The body range from 1.3 to 1.7 covers the settings that read comfortably, and the guidance below the sweep notes that long measures push toward the upper end of it while short measures tolerate the lower. Headings are called out as a separate decision, since display sizes often want a multiplier between 1.05 and 1.2 because their own line boxes are already tall. The box-height readout converts the multiplier into pixels at the chosen size, which is the figure a vertical rhythm or a baseline grid needs.\n\n- The bands are conventional markers rather than the tool's verdict on your setting, and a face with a large x-height can read well slightly outside them.\n- Every step shares one type size, so the interaction between size and leading has to be explored in more than one pass.\n- The sweep advances in equal increments, so a range that needs finer sampling near one end has to be run as two sweeps.\n- Only the leading varies; measure, justification and paragraph spacing are all fixed, and each of them affects how a given leading reads.\n- Nothing checks the result against a baseline grid or a vertical rhythm, so the pixel figure has to be carried to another tool for that.\n\nUse it when a body leading is being decided for a specific face and measure, when an existing paragraph reads cramped but the reason is unclear, or when a display setting needs its leading loosened. The tagged bands turn a sweep into a decision quickly. Where the leading has to serve a whole vertical rhythm, the vertical rhythm builder and the line height optimizer take the pixel box figure onwards. The line height optimizer derives a leading from the measure, the CSS line height tool writes the declaration, and the vertical rhythm builder turns the resulting box height into a grid.",
    howTo: [
      { step: "Choose the face and set the type size to the value the paragraph will actually be set at, since leading is judged relative to size." },
      { step: "Set the starting multiplier, the step and the number of steps so the sweep brackets the range you expect to choose from." },
      { step: "Paste a real paragraph, ideally one long enough to run to several lines, since leading problems appear on the third line rather than the first." },
      { step: "Read down the sweep and pick the step where the paragraph holds together, then note the box height in pixels for the vertical rhythm." },
    ],
    whenToUse:
      "Reach for it when a paragraph's leading is being decided, when text reads cramped and the cause needs isolating from size and measure, or when a display setting needs the leading loosened without losing the hierarchy. Reading four or five candidates in one screen is much faster than adjusting one paragraph repeatedly. Where the leading has to follow from the measure instead of being chosen by eye, the {{line-height-optimizer|line height optimizer}} derives it, the {{css-line-height-tool|CSS line height tool}} turns the chosen value into a declaration, and the {{paragraph-width-optimizer|paragraph width optimizer}} settles the other half of the same problem.",
    faqs: [
      {
        q: "Why is a leading below 1.3 tagged as tight?",
        a: "Because at that multiplier the line box is shorter than the space a line of text needs once ascenders and descenders are counted, so the tails of one line sit close to the tops of the next. It is a legitimate choice for display type, where lines are short and the tightness is part of the look, and a poor one for a paragraph.",
      },
      {
        q: "What is the body range based on?",
        a: "It is the 1.3 to 1.7 band, which is where most text settings land in practice. The guidance notes that a long measure pushes toward the upper end because the eye has further to travel back to the start of the line, while a short measure tolerates the lower end. The band is a marker rather than a rule.",
      },
      {
        q: "Does the face matter?",
        a: "Considerably. A face with a large x-height and long ascenders needs more leading at the same size than a small-bodied face does, which is why the sweep runs in the actual face rather than in a default. Running the same sweep in two candidate faces is a quick way to see that the leading you know works is specific to one of them.",
      },
      {
        q: "Why do headings want a tighter multiplier?",
        a: "Because a heading's own line box is already tall relative to its apparent size: at 72px, a multiplier of 1.5 puts 108 pixels between baselines, which reads as three separate lines rather than one statement. Display settings usually want between 1.05 and 1.2, and short headings of one line are unaffected either way.",
      },
      {
        q: "How do I use the box height figure?",
        a: "It is the leading in pixels at the chosen size, so it is the figure a vertical rhythm or baseline grid is built from. Taking the box height at the last step and dividing a container height by it gives a whole number of lines, which is what keeps text aligned to a grid as it flows down a page.",
      },
    ],
  },

  "font-letter-spacing-tester": {
    keywords: [
      "font letter spacing tester",
      "tracking sweep",
      "em unit",
      "added width",
    ],
    intro:
      "The font letter spacing tester runs a tracking sweep in em, which is the scale-independent unit a stylesheet should use, and reports the equivalent pixel values for the size you have chosen. Each step also shows how much width the tracking adds across the whole string.",
    content:
      "The font letter spacing tester renders one sample across a tracking sweep, then converts each step into pixels, a ratio and the width it adds to the string.\n\n- Steps are generated from zero upward, advancing by a step between 0.002em and 0.05em, with between three and twelve steps rendered.\n- Each step is labelled with its em value in the sweep, and the sample is rendered at that tracking with the chosen family and weight.\n- The converted table reports the em value, the pixel equivalent at the current size, the ratio of tracked to untracked width, and the added width across the whole string.\n- Type size runs from 10px to 120px and weight is selectable, so the sweep can run at a caption size or at a display size.\n- The note under the table states the reason em is used: it scales with the font size, so one declaration holds at every breakpoint.\n\nThe added-width column is what makes the sweep more than a visual preference. Tracking of 0.02em on a forty-character line at 24px adds a specific number of pixels to that line, and that number is what determines whether the line still fits the measure or wraps a word earlier than it did. On a heading of three words the addition is negligible; on a paragraph it accumulates along the line, which is why tracking is applied to capitals, captions and small text rather than to body copy. The em unit is the other point the table makes: because an em is relative to the font size, a value tuned at 24px produces proportionally the same effect at 48px, whereas a pixel value would need recalculating for every size in a scale.\n\n- The sweep runs from zero upward only, so negative tracking for display sizes has to be tested by editing the sample's declaration or using a different tool.\n- Every step shares one size and weight, so the interaction of tracking with size is explored in separate passes.\n- The added-width figure is a proportional estimate from the string length rather than a measurement of the rendered line.\n- Only one line is rendered per step, so the effect of tracking on the line breaks of a paragraph is not shown.\n- Nothing checks the result against the measure, so the point at which tracked text starts wrapping differently has to be judged from the width figure.\n\nUse it when tracking is being applied to a heading, capitals or small text, when a design calls for a spaced-out word mark, or when the width cost of tracking a whole line needs to be known before it is applied. Where tracking has to follow from the optical behaviour of punctuation rather than the space between letters, the optical margin alignment preview covers the hanging side of the same problem. The letter spacing calculator derives a value for a given width, the CSS letter spacing tool writes the declaration, and the optical margin alignment preview handles the punctuation that tracking cannot fix.",
    howTo: [
      { step: "Choose the family and weight, then set the size the tracking will actually be applied at, since an em value interacts with both." },
      { step: "Enter the sample you want spaced, preferring the real words, since tracking behaves differently on a single word and on a full line." },
      { step: "Set the step and the number of steps so the sweep brackets the range you expect, then read down the sweep for the value that holds." },
      { step: "Check the added-width column against the measure, then copy the em value rather than the pixel equivalent into the stylesheet." },
    ],
    whenToUse:
      "Reach for it when tracking is being decided for a heading, a word mark, capitals or a caption, when a design calls for letterspacing that has to survive several breakpoints, or when the width cost of a tracking value needs checking before it changes the wrapping. The added-width column answers that last question directly. For the punctuation side of the same problem, the {{optical-margin-alignment-preview|optical margin alignment preview}} covers glyphs that hang outside the measure, while the {{css-letter-spacing-tool|CSS letter spacing tool}} writes the declaration and the {{letter-spacing-calculator|letter spacing calculator}} works backwards from a target width.",
    faqs: [
      {
        q: "Why is em the right unit for tracking?",
        a: "Because an em is relative to the font size, so the same declaration produces the same proportional effect at every size in a scale. A pixel value tuned at 24px would be half as strong at 12px and twice as strong at 48px, meaning a separate value for every step. Authoring in em is why one rule holds across a responsive page.",
      },
      {
        q: "When should tracking be negative?",
        a: "At display sizes, where a face's default sidebearings usually read as too loose once the letters are large. The conventional range for that correction is around minus 0.01em to minus 0.03em, and it is deliberately not in this sweep: the sweep runs upward from zero because positive tracking is what capitals, captions and letterspaced word marks need.",
      },
      {
        q: "What does the added width actually tell me?",
        a: "How much longer the tracked string becomes, in pixels. Multiplying the tracking value by the size and by the number of characters gives the figure, and it is the one that matters to a layout: on a single word a fraction of a pixel per gap is nothing, while on a forty-character line it can be enough to push a word onto the next line and change the shape of the paragraph.",
      },
      {
        q: "Why does tracked text wrap earlier?",
        a: "Because every gap in the line has become wider, so the same words occupy more horizontal space. The wrapping point is therefore reached sooner, which is why a heading that fitted on one line before tracking may take two afterwards. Checking the added width against the measure before applying the value is what avoids that surprise.",
      },
      {
        q: "Is the added-width column exact?",
        a: "It is proportional rather than measured: it multiplies the tracking value by the font size and by the number of characters in the string. That is accurate to within the width of one gap, since the last character has trailing space that does not always contribute, so it is a good planning figure rather than a rendering measurement.",
      },
    ],
  },

  "serif-sans-pairing-tool": {
    keywords: [
      "serif sans pairing tool",
      "fallback test",
      "voice contrast",
      "curated pairings",
    ],
    intro:
      "The serif and sans pairing tool puts one serif in the heading role and one sans in the body role, previews them on live text and shows what each face falls back to. It is the classic pairing made explicit, including the part most tools skip: what happens when a webfont never arrives.",
    content:
      "The serif sans pairing tool takes one serif for headings and one sans for body copy, renders the pair on your own text and exports the two custom properties that hold the roles.\n\n- The serif list is drawn from the serif faces in the catalogue and the sans list from its sans faces, so the two roles cannot be filled with the wrong kind of face.\n- Heading and body samples are both editable, which matters because a pairing that works on a headline can fail on a long paragraph.\n- The live pairing renders the heading in the serif at 30px bold and the body in the sans at 15px, so the size relationship is visible as well as the shapes.\n- A fallback test panel renders the same strings in the alternatives the two roles will use, a serif fallback of Georgia and Times New Roman, and a system interface stack for the sans.\n- Six curated pairings are offered with a note explaining why each works, and clicking one loads it into the preview.\n\nThe fallback test is the part that makes the tool useful beyond the preview. A serif heading is the role most likely to be seen in its fallback, because headings are usually styled at a weight and size where a substitute is obvious, and the panel shows the substitution in the two stacks the CSS actually declares. The voice contrast readout is the other judgement it offers: a serif against a sans gives a large contrast in voice, which is what makes the pairing read as deliberate rather than accidental. The curated list covers the range of those decisions, from a high-contrast display serif over a neutral grotesque, through warm pairs with similar tone, to a slab heading over a quiet body face where the sturdiness comes from the heading alone.\n\n- The two roles are restricted to serif and sans, so a pair involving a display or monospace face has to be tried elsewhere.\n- Sizes in the preview are fixed, so the pairing is judged at one size relationship rather than across a range.\n- The curated pairings are suggestions from the catalogue rather than rules, and their notes describe an intention rather than a measurement.\n- The fallback test shows two stacks only, so a project with a different fallback strategy is not represented.\n- Nothing checks the two faces for clashing details such as a similar x-height or contradictory stress, which is a judgement the preview supports but does not automate.\n\nUse it when an editorial or corporate page needs a heading and body pairing chosen deliberately, when the fallback behaviour of a serif heading needs checking before it ships, or when a client asks why a serif heading over a sans body is the conventional answer. The curated list with its reasons is the quickest way to explain that. Where the shortlist has to be generated rather than chosen, the font pairing suggester ranks every combination, and where the pairing is a hero line rather than a heading, the display body pairing tool reports the size ratio. The display and body pairing tool covers the hero case, the font pairing suggester generates the shortlist, and the brand font stack builder assembles the fallback chain for production.",
    howTo: [
      { step: "Pick the serif for headings and the sans for body copy, or load one of the curated pairings and edit from there." },
      { step: "Paste a real heading and a real paragraph into the two samples, since the pairing has to survive a long line rather than a sound bite." },
      { step: "Read the live pairing for the shape contrast, then read the fallback test to see what each role becomes without its webfont." },
      { step: "Copy the two custom properties and the role rules, which declare the families once and apply them by heading level." },
    ],
    whenToUse:
      "Reach for it when a page needs a heading and body pairing decided on purpose, when the fallback for a serif heading has to be checked, or when the case for the conventional serif-over-sans split has to be made in one screen. The fallback panel is the part most reviews skip and later regret. For a generated shortlist the {{font-pairing-suggester|font pairing suggester}} ranks every combination, the {{display-body-pairing-tool|display body pairing tool}} handles a hero and body pairing with its size ratio, and the {{multi-font-comparison|multi font comparison}} measures the candidates against each other.",
    faqs: [
      {
        q: "Why test the fallback at all?",
        a: "Because a heading is the role where a webfont substitute is most visible, and a pairing chosen for its shapes can collapse into something quite different when the serif is replaced by a system face. The fallback panel renders the actual alternatives declared in the CSS, so the pairing is judged in both states rather than only in the one the designer sees on a fast connection.",
      },
      {
        q: "What does voice contrast mean here?",
        a: "The difference in character between the two faces. A serif against a sans gives a large contrast, which is what lets the hierarchy read at sizes closer together. Two faces of the same kind give a smaller contrast, and the pairing then relies on weight and size to separate the roles, which is workable but less forgiving.",
      },
      {
        q: "Should the serif always be the heading face?",
        a: "No, but it is the conventional arrangement and the one this tool is built around. The reversed pairing, a sans heading over a serif body, is common in editorial design and reads as more contemporary. The tool restricts the roles to serif headings and sans body, so the reversed arrangement has to be built from the same faces in the opposite order.",
      },
      {
        q: "How are the suggested body sizes chosen?",
        a: "They are the conventional band: 16 to 18px with a line height between 1.5 and 1.65. That figure is a starting point rather than a measurement, since the right size depends on the face's x-height and on the measure. The panel states it because body copy under a large heading is where pairings most often lose their proportion.",
      },
      {
        q: "Can I use the same family for both roles?",
        a: "Not in this tool, since the two lists are filtered by classification. A single-family system is a legitimate and common approach, and it is covered by the pairing suggester, which scores same-classification pairs and reports that they would need to be differentiated by weight instead.",
      },
    ],
  },

  "display-body-pairing-tool": {
    keywords: [
      "display body pairing tool",
      "display sizes",
      "size ratio",
      "hierarchy",
    ],
    intro:
      "The display and body pairing tool tests a hero line against the body copy beneath it, which is the pairing a landing page actually needs. Display faces are designed for a handful of words at large sizes, so the question is not whether the two faces suit each other but where the size relationship lands.",
    content:
      "The display body pairing tool sets a headline in a display or serif face and supporting copy in a sans or serif face, then reports the size ratio between them and the CSS that holds the composition.\n\n- The display role draws on display and serif faces, and the body role on sans and serif faces, so a hero line cannot be set in a text-only face by accident.\n- Display size runs from 24px to 180px in two-pixel steps, defaulting to 64px, and body size from 10px to 40px, defaulting to 16px.\n- Headline and supporting copy are both editable, and the composition renders them in the relationship they will have on a page rather than separately.\n- The ratio of display size to body size is reported, with a verdict: below twice the size the hierarchy is called too close, above five times it is extreme, and between the two it reads as clear and deliberate.\n- The exported hero rule uses a clamp so the display size scales down on a narrow viewport while the body size stays fixed in rem.\n\nThe ratio is the measurement worth having, because a display and body pairing fails more often on proportion than on shape. Two faces that look wrong together are usually two faces set at the wrong sizes, and the two-to-five band is where the jump reads as intended rather than accidental. The display classification is reported alongside, which matters because a display face and a serif set at the same head size behave differently: a display face is drawn for a few words at large display sizes and starts to look crowded as the line grows, while a serif scales down in a heading role far more gracefully. The generated hero rule also handles letter spacing by classification, applying a slightly positive value to a display face and a slightly negative one to a serif, since condensed capitals and heavy display forms usually want opening up while serif headings want closing.\n\n- Only two roles are modelled, so a caption or an interface role has to be judged elsewhere.\n- The ratio bands are conventions rather than measurements of the specific faces, and a narrow display face can work at a smaller jump than the band suggests.\n- The clamp in the hero rule uses a fixed viewport-based middle value, so a project with different breakpoints should adjust it rather than adopt it.\n- Weight is fixed at 700 in the preview, which suits display faces and may be too heavy for a serif heading.\n- Nothing checks the pairing across several roles at once, so the relationship between the hero, a section heading and a caption is not shown.\n\nUse it when a landing page or a hero section is being composed, when a headline at a very large size needs checking against the copy beneath it, or when a display face is being proposed and the size it needs to justify itself has to be known. The ratio readout answers that last question directly. Where the pairing is heading over body rather than hero over body, the serif and sans pairing tool is the closer fit, and where the shortlist is still open the pairing suggester ranks the candidates. The serif and sans pairing tool covers the editorial arrangement, the heading and caption pairing adds the third role, and the type hierarchy planner settles how many levels a page needs before sizes are fixed.",
    howTo: [
      { step: "Choose the display face and the body face, then paste the real headline and supporting copy rather than placeholders." },
      { step: "Set the display size and the body size and read the ratio verdict, moving whichever value is easier to change until the hierarchy reads clearly." },
      { step: "Check the display classification readout, since a display face at a long line behaves differently from a serif at the same size." },
      { step: "Copy the hero rule and adjust the clamp's middle value to your own breakpoints before it goes into the layout." },
    ],
    whenToUse:
      "Reach for it when a hero section is being composed, when a headline at display size needs checking against the copy beneath it, or when a proposed display face needs to be justified at a size that suits it. Where the roles are heading and body rather than hero and body, the {{serif-sans-pairing-tool|serif sans pairing tool}} is the closer tool, the {{heading-caption-pairing|heading caption pairing}} covers the third level down, and the {{font-pairing-suggester|font pairing suggester}} ranks candidates when the shortlist is still open.",
    faqs: [
      {
        q: "What ratio should a hero headline have against its body copy?",
        a: "Somewhere between two and five times the body size. Below twice, the headline does not dominate and the composition reads as a paragraph with a larger first sentence; above five, the jump starts to look like two different documents stacked. The band is wide because a narrow display face can carry a smaller jump than a wide one.",
      },
      {
        q: "Why is a display face different from a serif in the heading role?",
        a: "Because it is drawn for a few words. A display face carries tightly spaced capitals and heavy forms that look confident at three words and crowded at twelve, while a serif heading scales down towards text sizes without losing its composure. That is why the classification is reported next to the size: the same headline length suits the two faces at different sizes.",
      },
      {
        q: "How does the exported hero rule handle screen sizes?",
        a: "It writes the display size as a clamp with a minimum, a viewport-relative middle value and the chosen maximum, so the headline shrinks on a narrow screen while the body copy stays fixed in rem. The middle value is set from the current display size, so a project with unusual breakpoints should adjust it rather than adopt it as written.",
      },
      {
        q: "Why does the letter spacing depend on the classification?",
        a: "Because display forms and serif forms need opposite corrections at large sizes. A condensed or heavy display face usually wants a little positive tracking to stop the caps colliding, while a serif heading at the same size usually wants slightly negative tracking because the type was designed for text sizes where the sidebearings are more generous.",
      },
      {
        q: "Can the body copy be a serif too?",
        a: "Yes, the body role accepts both sans and serif faces, and a serif body under a display heading is a common editorial arrangement. What changes is the contrast: a serif body under a serif heading leaves the hierarchy resting on size and weight alone, so the size ratio matters more than it does in a mixed pairing.",
      },
    ],
  },

  "heading-caption-pairing": {
    keywords: [
      "heading caption pairing",
      "caption floor",
      "figure unit",
      "two steps below",
    ],
    intro:
      "The heading and caption pairing renders the classic figure unit as one composition: a heading, an image slot and a caption beneath it. Captions are the smallest type a design uses, so the face that pairs with a heading is rarely the same one used for body copy.",
    content:
      "The heading caption pairing takes a heading face and a caption face, with a size for each, and renders them together in the figure unit a document actually uses.\n\n- Both slots draw on the whole catalogue, so a display face can be paired with a serif caption or a sans heading with a monospace caption.\n- Heading size runs from 16px to 96px and the caption from 8px to 24px, defaulting to 36px and 13px.\n- The composition renders the heading, a dashed image slot and the caption in that order, so the vertical relationship is judged rather than just the two faces.\n- The ratio of heading to caption size is reported, which is the figure that decides whether the caption reads as a caption.\n- A caption floor check flags anything below 11px as risky on mobile, and a same-face check reports when both slots hold the same family.\n\nThe two-step rule behind the tool is what the size ratio measures. A caption conventionally sits about two steps below its heading on the scale, and when the gap is too small the caption competes with the heading for attention while a gap that is too large makes the caption read as a footnote. Because the heading is set at weight 600 and the caption is drawn in a muted colour with a looser leading, the composition also shows the two other levers that separate the roles when the faces happen to be the same: weight and colour. That is what the same-face check exists for. A single-family system is entirely workable, and the panel states the alternative explicitly rather than leaving the user to guess: vary the weight or the colour, or accept that the caption will read as part of the heading. The exported CSS writes the two rules separately, so the figure element and its caption can be styled without touching the prose.\n\n- The image slot is a placeholder rectangle, so nothing checks how a real photograph or chart interacts with the heading's weight.\n- Only two roles are modelled, so the body copy between the heading and the caption is not shown even though a figure usually sits inside a paragraph flow.\n- The caption colour is a muted foreground token rather than a value you set, so a caption's contrast against the real background is not measured.\n- The suggested sizes are defaults rather than derived from a scale, so a project with its own ladder should enter its own values.\n- Nothing reports the two faces' x-heights, so a caption whose lowercase is disproportionately small or large is not flagged.\n\nUse it when a figure, a chart or a table needs a caption styled against the heading above it, when a caption has drifted to a size that competes with the heading, or when the same family is being used for both roles and the separation has to come from weight and colour. Where the display and body relationship is the question rather than heading and caption, the display body pairing tool reports the size ratio for a hero composition. The display and body pairing tool covers the hero case, the serif and sans pairing tool covers heading over body, and the caption and footnote scale derives the sizes from a scale rather than from defaults.",
    howTo: [
      { step: "Choose the heading face and the caption face, watching the same-face readout since that determines whether weight and colour must do the work." },
      { step: "Paste a real heading and a real caption, because the ratio reads differently on a long caption than on a short one." },
      { step: "Set the heading size and caption size and read the ratio, keeping the caption above the 11px floor for mobile." },
      { step: "Adjust weight and colour if both slots share a family, then copy the two CSS rules into the figure styles." },
    ],
    whenToUse:
      "Reach for it when a figure, chart or table needs a caption styled against the heading above it, when a caption has grown to a size that competes with its heading, or when one family is doing both jobs and the separation needs checking. It is the third role most designs forget to pair deliberately. For the hero and body relationship the {{display-body-pairing-tool|display body pairing tool}} is the closer tool, the {{serif-sans-pairing-tool|serif sans pairing tool}} covers heading over body copy, and the {{caption-and-footnote-scale|caption and footnote scale}} derives caption sizes from a type scale rather than leaving them to be chosen.",
    faqs: [
      {
        q: "Why is a caption below 11px risky?",
        a: "Because small text is where legibility fails first, and a phone held at reading distance makes an 9px caption genuinely hard to read even at high contrast. The panel flags anything under 11px rather than blocking it, since a print-oriented design can legitimately go smaller. The safer pattern is to keep the caption at 12px or above and separate it from the heading by weight and colour instead.",
      },
      {
        q: "What does the two-step-below convention mean numerically?",
        a: "It means the caption sits roughly two steps down a type scale from its heading, which the ratio readout expresses as a multiple. With a heading at 36px and a caption at 13px the ratio is about 2.8 times. When the ratio drops below about two, the caption starts to compete with the heading; when it climbs above four, the caption reads as a detached footnote rather than part of the figure.",
      },
      {
        q: "Can the caption use the same face as the heading?",
        a: "Yes, and the same-face readout tells you what that costs. The roles then have to separate by weight and colour, which the composition demonstrates with a 600-weight heading and a muted caption. A single-family system is common and reads as disciplined rather than lazy, provided the weight difference is real rather than nominal.",
      },
      {
        q: "Why is the caption a muted colour by default?",
        a: "Because a caption is supporting information, and colour is the cheapest way to say so without dropping the size further. The muted token is applied in the exported rule, which means the caption's contrast is inherited from the design system rather than measured here. A caption that has to remain legible at small size should be checked against its real background elsewhere.",
      },
      {
        q: "Should the heading inside a figure be a real heading element?",
        a: "It should be marked up so the structure survives: a figure with a caption belongs together, and the text above it is usually a heading level appropriate to the document rather than a decorative line. The exported CSS styles the two roles, and the markup decision is left to the implementation. The pair of rules is written separately for exactly that reason.",
      },
    ],
  },

  "monospace-pairing-tool": {
    keywords: [
      "monospace pairing tool",
      "advance width",
      "ambiguity checks",
      "ligatures",
    ],
    intro:
      "The monospace pairing tool pairs a fixed-width face with a proportional partner and previews the two together as code and prose. Monospace is used for code, tabular data and metadata, where character alignment matters more than reading rhythm.",
    content:
      "The monospace pairing tool takes a monospace face, a proportional partner and a code sample, then renders the pair in the two contexts they share and runs the checks that decide whether the combination is viable.\n\n- The monospace slot draws only on monospace faces and the partner slot only on proportional ones, so the roles cannot be filled wrongly.\n- The estimated advance width is reported as the code size multiplied by 0.6, which is the typical width of one character in a monospace face.\n- That figure converts into the number of characters that fit a 640 pixel line, which is the count a code block or a terminal actually depends on.\n- Code size runs from 9px to 28px, defaulting to 13px, and is the only size control since the partner face follows the document's own setting.\n- Alignment checks render the classic ambiguous pairs: figure one against lowercase l, zero against uppercase O, the bracket set, and a run of pipe characters.\n\nThe checks are what separate a usable monospace face from an unusable one in an editor or a table. A face without a distinguishable zero and capital O makes a code block ambiguous, and the usual fix is a slashed or dotted zero, which the panel names. The pipe character is the other common failure: in a proportional face it is narrow, and in a monospace face it should touch its neighbours so that a table rule drawn with pipes reads as continuous. Ligatures get their own line in the exported CSS, and it disables them deliberately, because a ligature that renders a not-equal or arrow operator as a single glyph makes the source ambiguous the moment someone copies it into another editor. The advance width figure is the practical counterpart to those checks: it says how wide a line of code will be at the chosen size, which is what determines whether a block needs horizontal scrolling in the layout it sits in.\n\n- The advance width is an estimate from a typical ratio rather than a measurement of the selected face.\n- The partner face is previewed at the document's own size, so the relationship between the two sizes is not adjustable here.\n- Only one code size is set, so a design with separate sizes for inline code and block code is checked in two passes.\n- The ambiguity checks are rendered rather than scored, so whether a given zero is distinguishable is a judgement the panel does not make.\n- Nothing evaluates the two faces' figures against each other, which matters when a monospace face appears inside a table set in the proportional one.\n\nUse it when a documentation site or a product interface needs a code face chosen, when an existing monospace face produces ambiguous characters in an editor, or when the width of a code block has to be estimated before a layout is built. Where the pairing has to be discovered rather than tested, the Google Fonts pairing picker offers a broader sweep. The Google Fonts pairing picker covers a wider set of candidates, the kerning pair inspector examines the spacing of individual pairs, and the font rendering preview shows how the code face rasterises at small sizes.",
    howTo: [
      { step: "Choose the monospace face and the proportional partner, then paste a representative code sample rather than a single line." },
      { step: "Set the code size and read the estimated advance width and the characters-per-line figure for a 640 pixel block." },
      { step: "Read the ambiguity checks, particularly the zero against the capital O and the run of pipes." },
      { step: "Copy the CSS, which keeps ligatures disabled for code and leaves the partner face to the document's own rules." },
    ],
    whenToUse:
      "Reach for it when a documentation site, a developer tool or a product interface needs its code face chosen, when an existing monospace face makes characters ambiguous in an editor, or when the width of a code block has to be known before a layout is committed. The pipe and zero checks catch most real problems. For a wider sweep of candidate pairings, the {{google-fonts-pairing-picker|Google Fonts pairing picker}} covers more faces, while the {{kerning-pair-inspector|kerning pair inspector}} examines individual pairs and the {{font-rendering-preview|font rendering preview}} shows the rasterised result at small sizes.",
    faqs: [
      {
        q: "Why disable ligatures in code?",
        a: "Because a ligature replaces a sequence of characters with a single glyph, so the source shown on screen no longer matches the characters in the file. Copying that code into another editor produces the original sequence, which means what is read is not what is copied. Coding ligatures are a deliberate preference for some readers, and the CSS here takes the safe default.",
      },
      {
        q: "What makes a zero ambiguous?",
        a: "Being too close in shape to the capital O. In a code context the difference matters because an identifier containing a zero and one containing an O are different identifiers. The conventional fixes are a slashed zero, a dotted zero, or a narrower capital O, and the check renders both characters so the distinction can be judged directly.",
      },
      {
        q: "How is the advance width calculated?",
        a: "The code size is multiplied by 0.6, which is the typical advance width of one character in a monospace face. It is an estimate rather than a measurement, which is why the figure is labelled as such: real faces range a little either side of that ratio, and a face with a wider set will fit fewer characters on the same line.",
      },
      {
        q: "Why does the pipe character matter?",
        a: "Because it is commonly used to draw table rules and boundaries in plain text, and a pipe that does not reach its neighbours leaves visible gaps in the line. In a monospace face the character is designed to touch, which is what makes an ASCII table read as a table. The check renders a run of them for exactly that reason.",
      },
      {
        q: "Should inline code be the same size as block code?",
        a: "Often not. Inline code sits within a line of prose, so it usually needs to be slightly smaller than the surrounding text to keep the line spacing steady, while a code block is read on its own and can be larger. The tool sets one size, so the two cases are checked in separate passes.",
      },
    ],
  },

  "web-font-tester": {
    keywords: [
      "web font tester",
      "font display",
      "layout shift",
      "fallback metrics",
    ],
    intro:
      "The web font tester previews the two states a reader can actually see, the fallback before the file arrives and the loaded state after it, and reports the layout shift each font display strategy costs. The choice is made on that trade-off rather than on the loaded state alone.",
    content:
      "The web font tester renders one sample twice, once in a system fallback and once in the chosen face, and pairs that with the layout shift cost of the four font display strategies across the text blocks on a page.\n\n- Swap shows the fallback immediately and swaps when the file lands, which is the strategy with one visible reflow.\n- Block holds the text invisible for up to three seconds while the file loads, which removes the reflow at the cost of a blank paragraph.\n- Fallback takes a hundred-millisecond blocking period and then uses the fallback permanently if the file has not arrived.\n- Optional uses the webfont only when it is already cached or the connection is fast, which costs nothing for a returning visitor.\n- The font display value and the selected face are written into a complete at-rule, with the source path derived from the family name and a weight range of 300 to 700.\n\nThe shift figures are the reason the panel exists. A webfont and a system fallback rarely share line-height metrics, and the conventional difference sits between three and six percent per line, so the tool estimates a four percent shift per block for swap, one and a half percent for fallback, none for block because nothing is rendered until the file arrives, and four percent for optional on the first visit. Multiplying that by the number of blocks on screen produces the total shift risk, which is the shape of the problem rather than a measurement: a page with twelve paragraphs carries twelve times the movement of a page with one. The panel then states the three fixes that actually reduce it, which are preloading the file used above the fold, subsetting to the characters the page uses, and tuning the fallback metrics with size-adjust and the two metric overrides so the fallback occupies the same space as the webfont.\n\n- The percentages are conventional estimates, not measurements taken from your two faces, so a pair with very different metrics will be worse than reported.\n- Nothing here loads a real font over a real network, so the blocking periods are described rather than timed.\n- The source path in the generated at-rule is derived from the family name rather than being a path you can verify.\n- Six blocks and a hundred blocks are treated linearly, whereas the shift score a browser reports aggregates differently.\n- The fallback pane always uses the same system stack, so a project whose fallback is a specific local face is not represented exactly.\n\nUse it when a webfont is being introduced, when a page's text visibly moves as it loads, or when the case for preloading and metric overrides has to be made to someone who has not seen the reflow. The fallback and loaded panes side by side are the quickest version of that argument. Where the loading sequence rather than the display value is being planned, the font loading strategy builder covers preload and priority, the font face declaration builder writes the metric overrides the panel recommends, and the font CSS generator produces the whole set of rules for a family.",
    howTo: [
      { step: "Choose the webfont and the font display value, then read the strategy verdict line under the loaded preview." },
      { step: "Compare the two panes at the same size and sample, since the amount of movement is easiest to judge when the paragraphs sit one above the other." },
      { step: "Set the number of text blocks on screen and read the total shift risk, which is the per-block estimate multiplied by that count." },
      { step: "Copy the at-rule and add the preload, subsetting and metric override steps the panel lists." },
    ],
    whenToUse:
      "Reach for it when a webfont is being added to a page, when text visibly jumps during load and the cause needs naming, or when a design review has approved a face without anyone checking what happens before it arrives. It is also the clearest way to show why block is a poor choice for body copy. For the full loading plan the {{font-loading-strategy-builder|font loading strategy builder}} covers preload and priority, the {{font-face-declaration-builder|font face declaration builder}} writes the metric overrides that stop the reflow, and the {{font-css-generator|font CSS generator}} produces the rules for a whole family at once.",
    faqs: [
      {
        q: "Which font display value should I start with?",
        a: "Swap for body copy, because the reader sees text immediately and the cost is one reflow. Block suits a display heading where a flash of the wrong face would be worse than a brief blank, but it is a poor choice for a paragraph since the text can stay invisible for seconds. Optional is the safest for performance and the least predictable, since a slow first visit never shows the webfont at all.",
      },
      {
        q: "How accurate is the shift estimate?",
        a: "It is a convention rather than a measurement. Without the two font files the tool cannot know how their metrics differ, so it uses the three to six percent line-height difference that typically separates a webfont from a system fallback, and reports four percent per swapped block. Treat the total as a way of comparing strategies and page shapes, not as a score a browser would agree with.",
      },
      {
        q: "What actually stops the text from moving?",
        a: "Making the fallback occupy the same space as the webfont. Three things do that: preloading the file so it arrives early, subsetting it so it arrives small, and overriding the fallback's metrics with size-adjust, ascent-override and descent-override. The metric overrides are the ones that remove the reflow properly, and they are written by the declaration builder for exactly this purpose.",
      },
      {
        q: "Why does block show no shift?",
        a: "Because nothing is drawn until the file arrives, so there is no fallback rendering to move. That is the trade: the shift is zero and the reader may wait up to three seconds looking at empty space. The estimate reflects the missing movement, not a recommendation, which is why the verdict line calls block unsuitable for body copy.",
      },
      {
        q: "Does the number of blocks really multiply the shift?",
        a: "Roughly, and it is the reason the control exists. Each paragraph that reflows contributes its own movement, so a long article carries far more of it than a landing page with two lines. A browser aggregates the score differently, measuring the movement of content around the viewport, so the multiplication is a way of comparing a template's risk rather than predicting a number.",
      },
    ],
  },

  "font-specimen-sheet": {
    keywords: [
      "font specimen sheet",
      "print specimen",
      "weight ladder",
      "character set",
    ],
    intro:
      "The font specimen sheet lays out one face as a printable page: the display alphabet, digit and punctuation rows, a weight ladder and sample lines, all on a light surface. It is the sheet you hand to a printer or a client rather than a screen you adjust.",
    content:
      "The font specimen sheet composes a print specimen for a chosen face and prints it, hiding the control panel so what comes out of the printer is the sheet itself.\n\n- The sheet header carries the title you type and the family name set in a monospaced uppercase line, with the family rendered large beneath it.\n- The character set is laid out in three rows: uppercase letters, lowercase letters and the digit and punctuation set, each at a comfortable reading size rather than at display size.\n- The weight ladder sets one line per weight the catalogue offers, each labelled with its numeric value in the margin and set in that weight.\n- Three sample lines follow, each a pangram, so the paragraphs at the foot of the sheet exercise the whole lowercase alphabet.\n- A footer note carries whatever measurement you want recorded, and the default names the display size, the text size and the print scale.\n\nThe sheet is a print object, which is why it uses a light surface with black type regardless of the application's theme: a dark-mode specimen would print as a solid block of ink. The print button calls the browser's own print dialog, and the control panel is hidden by a print media rule, so the printout contains the specimen and nothing else. The three alphabet rows are set at a reading size rather than at the display size the family name uses, because that is where a face's letterforms are actually judged: at display size every face looks deliberate. The weight ladder is the second thing a specimen is for, since a face's weights are not evenly spaced in design even when their numeric values are, and seeing 300 next to 700 on the same sheet is the fastest way to see where a family's weight range really sits.\n\n- Only the catalogue's faces can be specified, and only the weights those faces load are listed in the ladder.\n- The sheet is a fixed layout: the rows, the ladder and the three sample lines are not editable beyond the title and the footer note.\n- Sizes are fixed rather than adjustable, so the specimen reflects the tool's own typography rather than a project's.\n- There is no metric data such as x-height, cap height or character width, so two faces can only be compared visually here.\n- Nothing is saved, and the print scale depends on the browser's own settings.\n\nUse it when a face has been shortlisted and a printed reference is needed, when a client wants a one-page overview of a family, or when a specimen has to go into a style guide as an appendix. The print-hiding behaviour is the detail that makes it usable rather than a screenshot. Where several faces need comparing on the same copy, the multi font comparison puts them side by side with measured widths, and where the sample is the question rather than the sheet, the pangram font tester counts the alphabet coverage. The font previewer covers the interactive setting, the multi font comparison measures several faces against each other, and the pangram font tester checks that a sample really does cover every letter.",
    howTo: [
      { step: "Choose the family from the catalogue and set a sheet title that names the project or the client it belongs to." },
      { step: "Edit the footer note to record the measurements that matter for the handover, such as the display size and the print scale." },
      { step: "Read the sheet on screen first, checking the alphabet rows and the weight ladder against the face you expected." },
      { step: "Print it, which hides the control panel, and check the print preview before committing paper since the scale is set by the browser." },
    ],
    whenToUse:
      "Reach for it when a family needs a printed reference, when a style guide needs a specimen appendix, or when a review is easier with a sheet in hand than a screen. The weight ladder is usually the part people photograph. For a comparison of several faces on identical copy, the {{multi-font-comparison|multi font comparison}} reports measured sample widths rather than impressions, the {{pangram-font-tester|pangram font tester}} verifies that a sample covers the alphabet, and the {{waterfall-font-preview|waterfall font preview}} shows one face across a size ladder rather than across its weights.",
    faqs: [
      {
        q: "Why does the sheet use black on white when the rest of the tool is dark?",
        a: "Because the sheet exists to be printed. A dark surface would come out of the printer as a solid block of ink, hiding the letterforms the sheet is meant to show. The specimen keeps its own light surface regardless of the application theme, which is also how it renders in a dark-mode session.",
      },
      {
        q: "Which rows should I check first on a specimen?",
        a: "The digit and punctuation row, and then the weight ladder. Letters are the part every specimen shows well, while figures, brackets, quotation marks and dashes are where a face's details slip, and the ladder is where a family's weight range is revealed to be narrower or wider than the numeric values suggest.",
      },
      {
        q: "Can I change the sample sentences?",
        a: "Not on this sheet. The three lines are fixed pangrams, chosen so the paragraphs at the foot exercise the whole lowercase alphabet. If a specific phrase needs to be set, the font previewer and the custom text font preview both take arbitrary text, and a sheet built from those would have to be composed by hand.",
      },
      {
        q: "Why is there no size control for the specimen?",
        a: "Because a specimen's typography is part of the document rather than a variable. The rows are set at a reading size and the family name at a display size, which is the convention a printed specimen follows. Adjustable sizes belong in a previewer, where the question is how a face behaves rather than what it looks like on paper.",
      },
      {
        q: "Does the printed sheet come out at a predictable size?",
        a: "Only as predictable as the browser's print dialog. The sheet is laid out for a page, and the print media rule removes the controls, but scale, margins and paper size are chosen in the dialog rather than in the tool. Check the preview pane before printing a batch, since the difference between one hundred percent and shrink-to-fit is visible on the alphabet rows.",
      },
    ],
  },

  "font-rendering-preview": {
    keywords: [
      "font rendering preview",
      "text rendering",
      "subpixel antialiasing",
      "font smoothing",
    ],
    intro:
      "The font rendering preview shows the same string under each text rendering value and reports what the choice does in each engine. Browsers expose few controls over rasterisation, and the ones that exist matter most at small sizes and in light-on-dark settings.",
    content:
      "The font rendering preview renders a sample under each text rendering value, alongside a light-on-dark pane and a small-size comparison, and exports the declarations behind the combination.\n\n- Four rendering values are offered: the browser default, the legibility hint, the geometric precision value, and the speed value.\n- The default balances speed and shape fidelity, with kerning applied where the font provides it.\n- The legibility hint enables kerning and optional ligatures, and is reported as largely equal to the default in current engines because it began as a hint rather than a precise instruction.\n- Geometric precision scales glyph outlines without hinting, which is what makes text scale smoothly at fractional sizes.\n- The speed value disables kerning and ligatures together, and is described as rarely being the right choice on the web.\n\nThe second pane is the one that explains most rendering complaints. Subpixel antialiasing needs opaque dark text on a light background, so light-on-dark text is always rasterised with grayscale smoothing, and that is why the same weight looks optically heavier in a dark theme. The generated CSS therefore writes grayscale smoothing explicitly, which is the setting that keeps light-on-dark text from looking thick and slightly fuzzy. The small-size comparison at eleven, thirteen and fifteen pixels is the other half of the story: hinting and rasterisation differences are almost invisible at 28px and quite visible at 11px, so the value that looks identical in a large preview can change how a caption reads. Family, size and weight are all adjustable, since rendering behaviour differs with the weight of the strokes as well as with the engine. Every pane renders with the value currently in force, so the light-on-dark panel and the small-size rows are views of the selected setting rather than fixed reference comparisons.\n\n- The rendering values are hints to the engine rather than instructions, so two browsers may render the same value differently.\n- Font smoothing properties are non-standard even where they are implemented, and no engine outside the WebKit and Blink families honours them.\n- The preview always applies grayscale smoothing, so the subpixel path is described rather than shown side by side.\n- The small-size comparison uses three fixed sizes, so an intermediate size has to be judged by changing the main size slider.\n- Nothing reports the platform the page is being viewed on, and macOS, Windows and Linux rasterise text differently regardless of these values.\n\nUse it when text looks too heavy in a dark theme, when a caption has to be checked at a small size, or when someone has proposed the speed value and the cost needs showing. The light-on-dark pane is usually the deciding one. Where the underlying face choice is the question rather than its rasterisation, the font previewer covers the setting, and where the loading behaviour is at fault the web font tester covers the fallback state. The CSS font stack builder assembles the family list the rendering applies to, the web font tester covers what the reader sees before the file arrives, and the system font stack generator covers the platform-native alternative.",
    howTo: [
      { step: "Choose the family, size and weight you want to judge, since rendering differences are smallest at moderate sizes and regular weights." },
      { step: "Switch between the four text rendering values and compare, keeping in mind that the differences are hints rather than guaranteed outcomes." },
      { step: "Read the light-on-dark pane and then the small-size comparison, which are the two contexts where the choice actually shows." },
      { step: "Copy the CSS, keeping the grayscale smoothing declaration if the design has a dark theme." },
    ],
    whenToUse:
      "Reach for it when type looks too heavy on a dark background, when a small caption needs checking, or when someone proposes one of the exotic rendering values and the real effect needs demonstrating. It is also the fastest way to show why the same weight reads differently in light and dark themes. For the face itself, the {{font-previewer|font previewer}} covers the setting, the {{css-font-stack-builder|CSS font stack builder}} assembles the family list, and the {{web-font-tester|web font tester}} covers the state before the webfont arrives.",
    faqs: [
      {
        q: "Should I use the legibility value or the default?",
        a: "The default, in almost every case. The legibility value began as an instruction to enable kerning and ligatures, and current engines do that by default, so the two are reported as largely equivalent. The remaining difference is historical rather than visual, which is why the panel calls it a hint rather than a precise setting.",
      },
      {
        q: "Why does light text on a dark background look bolder?",
        a: "Because of how the text is rasterised. Subpixel antialiasing needs opaque dark text on a light surface, so light-on-dark text falls back to grayscale smoothing, which spreads the glyph slightly and makes the strokes read as heavier. The effect is not a weight change, which is why adjusting the weight to compensate can make light text look thin in another context.",
      },
      {
        q: "What does geometric precision change?",
        a: "It scales glyph outlines without hinting, so text stays smooth at fractional sizes and in transforms where hinted outlines would snap to pixel boundaries. That makes it useful in SVG and in scaled containers, and it costs some sharpness at very small sizes, where hinting exists precisely to keep stems crisp.",
      },
      {
        q: "Is the speed value ever correct?",
        a: "On very large amounts of text where rendering cost is the bottleneck, which in practice means it is almost never the right choice on the web. It disables kerning and ligatures, so spacing between letter pairs stops being corrected, which is visible immediately in a face with strong kerning pairs. The panel labels it rarely correct for that reason.",
      },
      {
        q: "Why does the same CSS render differently on another machine?",
        a: "Because rasterisation is a platform behaviour. The values the tool sets are honoured differently, or partly ignored, by each engine, and the operating system's own text stack sits below that. Two machines can render the same weight with visibly different stroke thicknesses, which is why the small-size comparison and the dark pane are worth checking rather than assuming.",
      },
    ],
  },

  "brand-font-stack-builder": {
    keywords: [
      "brand font stack builder",
      "four slot",
      "custom properties",
      "brand prefix",
    ],
    intro:
      "The brand font stack builder collects all four face decisions a brand needs, display, text, interface and monospace, and emits the complete set of CSS custom properties a design system consumes. It exists so the whole stack is decided in one place rather than drifting across files.",
    content:
      "The brand font stack builder takes a brand prefix and four face slots, then renders each slot and exports the custom properties and role rules that define them.\n\n- Four slots are filled: display, text, interface and monospace, each drawn from the catalogue and each carrying its own fallback chain in the emitted stack.\n- A brand prefix is used to name the custom properties, slugified into a safe form so a name with spaces or punctuation still produces valid CSS.\n- Each slot is previewed with content suited to it: a display line, a paragraph, an interface label row and a line of code.\n- The readouts report how many distinct families the four slots actually use, whether the generic fallbacks are named for all four, and how many stylesheet requests the set implies.\n- The exported CSS writes one custom property per slot and one rule per role, so a component consumes a variable name rather than a family name.\n\nThe prefix convention is the part that makes the output portable. Naming a property with the brand in it keeps the variables from colliding with a component library's own tokens, and the slugification means a brand typed with a space, an ampersand or any punctuation still produces a property name a stylesheet can use. The distinct-family readout is the other useful check: four slots do not have to mean four families, and a system that fills display and text with the same face is reporting that its hierarchy rests on weight and size rather than on shape. The monospace slot is deliberately included even for brands with no technical content, because code, keyboard shortcuts, tabular figures and version strings appear in most design systems eventually, and deciding the face once is cheaper than adding a fifth stack later.\n\n- The slots are filled from the catalogue, so a brand whose faces are not loaded here cannot be represented.\n- The emitted stacks carry the catalogue's fallback chain rather than a project-specific one, so a different local fallback has to be edited in afterwards.\n- The prefix is used for property names, and nothing else about a design system's naming convention, such as scale prefixes or semantic roles, is modelled.\n- Weights, sizes and loading strategy are all outside the tool, so the stacks describe families only.\n- The four slots are fixed, so a system that needs a separate accent or editorial face has to extend the output by hand.\n\nUse it when a brand's typography is being defined once for several products, when a design system needs its font variables settled, or when four slots have been decided in different places and have to be brought together. Where the emitted stacks need to survive a slow connection, the loading strategy is the companion decision rather than part of this one. The CSS font stack builder produces the stacks themselves in detail, the system font stack generator covers the platform-native alternative, and the editorial style guide generator turns the same decisions into a written guide.",
    howTo: [
      { step: "Enter the brand prefix that will name the custom properties, checking that the slugified form is one you would accept in a stylesheet." },
      { step: "Fill the four slots from the catalogue, reading the distinct-family count to see whether the system is genuinely using four faces." },
      { step: "Check the slot preview, paying attention to the monospace slot even if the brand has no technical content yet." },
      { step: "Copy the custom properties and role rules, then substitute the project's own fallback chain if it differs from the catalogue's." },
    ],
    whenToUse:
      "Reach for it when a brand's typography has to be defined once across products, when a design system's font variables are being established, or when the four slots were decided separately and need reconciling. Where the stacks need their fallbacks worked out in detail the {{css-font-stack-builder|CSS font stack builder}} does that, the {{system-font-stack-generator|system font stack generator}} covers faces that ship with the platform, and the {{editorial-style-guide-generator|editorial style guide generator}} writes the decisions up as a guide.",
    faqs: [
      {
        q: "Why is the brand name part of the property name?",
        a: "To keep the variables from colliding with whatever else the stylesheet defines. A generic name such as font-display is a good way to be overwritten by a component library. The prefix is slugified before use, so a brand typed with spaces or punctuation still produces a valid custom property rather than a broken declaration.",
      },
      {
        q: "Do I need four distinct families?",
        a: "No, and the distinct-family readout is there to make the choice visible. Many systems fill the display and text slots with the same family and separate the roles by weight and size. What matters is that the decision is deliberate: four slots filled from four unrelated faces without a reason is the pattern that reads as assembled rather than designed.",
      },
      {
        q: "Why include a monospace slot at all?",
        a: "Because code, keyboard shortcuts, tabular figures and version strings appear in most design systems eventually, and adding a stack later means revisiting components. Deciding the face when the rest of the system is decided costs one selection now. A brand with no technical content can point the slot at the text face and revisit it if needed.",
      },
      {
        q: "Where do the fallbacks come from?",
        a: "From the catalogue's own stacks, which name generic families for each face. A product with a specific local fallback, such as a particular system face that matches the webfont's metrics, should edit the emitted stacks afterwards rather than accept the generic chain. The metric overrides that stop a fallback from reflowing are a separate decision.",
      },
      {
        q: "Does this set the weights and sizes?",
        a: "No. The tool defines families and nothing else, which is deliberate: weights and sizes belong to a type scale, and the roles it emits are family roles. A design system needs both, and keeping them separate means the scale can change without reopening the family decision.",
      },
    ],
  },

  "heading-scale-visualizer": {
    keywords: [
      "heading scale visualizer",
      "ratio ladder",
      "mobile floor",
      "clamp",
    ],
    intro:
      "The heading scale visualizer builds an H1 to H6 ratio ladder from a base size and puts a mobile floor under it. It also writes the clamp declaration for each level, so the hierarchy survives on a phone without a second scale being maintained.",
    content:
      "The heading scale visualizer derives all six heading sizes from one base value and one ratio, then exports each one as a clamp declaration that holds the hierarchy on a narrow screen. The base is the H6 size, which means the ladder is anchored at the bottom rather than the top.\n\nThe construction is a ratio ladder: H1 is the base multiplied by the ratio raised to the fifth power, H2 by the fourth, and so on down to H6, which is the base exactly. That leaves the largest heading five multiplications away from the smallest, which is why the ratio matters more here than anywhere else in a type system. Six ratios are offered, each with a different character.\n\n- 1.125 is tight and suits a dense interface where headings are labels rather than statements.\n- 1.2, the minor third, is a gentle ladder for content-heavy pages with many heading levels in view at once.\n- 1.25, the major third, is the default and the usual compromise between presence and compression.\n- 1.333, the perfect fourth, gives headings a clear step up without the display sizes getting unwieldy.\n- 1.5, the perfect fifth, is the editorial choice, where H1 is allowed to be genuinely large and the lower levels stay modest.\n- 1.618, the golden ratio, produces the most dramatic spread and needs long-form content to justify it.\n\nThe mobile floor is the second control, and it is expressed as a multiple of the desktop size rather than as a separate scale. Each heading's exported declaration is a clamp whose lower bound is the desktop size times the floor factor — 0.78 by default, adjustable from 0.5 to 0.95 — whose upper bound is the full desktop size, and whose middle term is a fixed linear expression of 75 per cent of the desktop size in rem plus 1.4 viewport widths. The result is one rule per heading that grows with the viewport and stops at a floor and a ceiling, which is what keeps an H1 readable on a phone without shrinking the rest of the hierarchy out of proportion.\n\nThe table shows the multiplier, the desktop size in pixels and rem, and the mobile floor for each level, so a ladder that collapses at the bottom is visible before the CSS is copied: at a tight ratio the difference between H5 and H6 can fall under a pixel of rendered size, which is a hierarchy in name only. The limits of the generated ramp are worth knowing before the declarations ship.\n\n- The middle term is a linear approximation rather than a line drawn between two known sizes at two known viewports, so a ramp that has to pass through exact values belongs in a clamp calculator.\n- The same ratio applies to every level, where an editorial design often wants a larger jump between H1 and H2 and a smaller one further down.\n- The exported rem values assume a sixteen-pixel root, so a project that changes the root size shifts every heading with it.\n- The ceiling is the desktop size, which means very wide screens stop growing rather than continuing to scale.\n- Nothing checks the result against a line length, so a display heading on a short line may still need a step down by hand.\n\nUsed as a first pass, the ladder removes the guesswork from six headings at once; the deviations are then deliberate rather than accidental.",
    howTo: [
      { step: "Set the base size, remembering that it is the H6 size and that every other heading is derived upward from it." },
      { step: "Pick a ratio and read the table, checking that neighbouring levels at the bottom still differ enough to be seen." },
      { step: "Set the mobile floor and compare the desktop and floor columns, since the floor is what a phone will show." },
      { step: "Enter the sample text, read the rendered ladder, then copy the clamp declarations into the stylesheet." },
    ],
    whenToUse:
      "Reach for it when a heading hierarchy has to be established across breakpoints in one pass, when H5 and H6 have collapsed into the same effective size, or when a design needs to move from a fixed ladder to a fluid one without redoing the ratio choice. The mobile floor is the part that saves a second scale. For the same sizes as design tokens, the {{css-typography-token-generator|CSS typography token generator}} exports them as custom properties, the {{type-scale-generator|type scale generator}} builds the underlying scale, and the {{line-height-optimizer|line height optimizer}} gives each level a leading that matches its size.",
    faqs: [
      {
        q: "Why is the base size the H6 size?",
        a: "Because headings usually grow from the smallest one. Anchoring the ladder at H6 means the base is a value the page already uses somewhere, and the display sizes are the furthest away from it. Anchoring at H1 would make every other heading a division, which is harder to reason about when the ratio changes.",
      },
      {
        q: "What does the mobile floor actually change?",
        a: "It sets the minimum a heading may shrink to. The exported clamp keeps the desktop size as the ceiling, sets the floor at the desktop size multiplied by the factor, and lets the middle term move between them as the viewport changes. On a phone the headings sit at or near the floor, and the hierarchy stays proportional.",
      },
      {
        q: "Why does a tight ratio collapse at the bottom of the ladder?",
        a: "Because the steps are multiplied, and a small ratio compounds. At 1.125 the difference between two adjacent low levels can fall below a pixel of rendered size, which reads as inconsistency rather than hierarchy. Either widen the ratio or drop a level, since a heading that cannot be distinguished is not a level.",
      },
      {
        q: "Is the middle term of the clamp a real ramp?",
        a: "Not exactly. It is a linear expression built from 75 per cent of the desktop size plus 1.4 viewport widths, which is a reasonable approximation rather than a line drawn between two known sizes at two known viewports. When the ramp has to pass through specific sizes at specific widths, calculate it properly with the clamp calculator.",
      },
      {
        q: "Can I use different ratios for different levels?",
        a: "Not here, since the ladder is built from one ratio. In practice editorial designs often want a larger jump between the first two levels and smaller ones below, and that has to be done by editing the exported declarations. The tool's single-ratio view is the baseline to deviate from with intent.",
      },
    ],
  },

  "caption-and-footnote-scale": {
    keywords: [
      "caption and footnote scale",
      "legibility floor",
      "superscript",
      "small type",
    ],
    intro:
      "The caption and footnote scale works the small end of a type system: captions, footnotes, legal lines and superscripts, all derived from the body size. The check column flags the sizes that fall under the practical floor for continuous reading.",
    content:
      "The caption and footnote scale derives five small roles from the body size and reports whether each one is above the point where small type stops being comfortable to read.\n\nThe roles and how each is built:\n\n- Body is the anchor at one rem with a leading of 1.6, so every other role is a fraction of it.\n- Caption defaults to 0.8125 of the body size at a leading of 1.45, for figure captions and table notes.\n- Footnote defaults to 0.75 at a leading of 1.4, for notes at the foot of a page or the end of a chapter.\n- Legal and fine print is derived as nine tenths of the footnote size at a leading of 1.35, which is where terms and disclaimers live.\n- Superscript defaults to 0.65 of the body size, with a leading of one so it cannot push the line box apart.\n\nThe check column is the useful part, because small type is where a type system quietly breaks. Sizes below about 11 pixels are flagged as below the floor for continuous reading, and the distinction the tool draws is between reading and consulting. A caption that has to be read like a sentence should stay at or above the floor; a footnote, a reference mark or a legal line is consulted rather than read, and can sit below it without harming anyone. That is why a 16px body produces a comfortable 13px caption and a 12px footnote that is still acceptable in reference matter, while the same ratios applied to a 13px body fall under the floor and need the body size raised rather than the ratios adjusted.\n\nSuperscripts get their own treatment for a mechanical reason. A raised digit set at the normal line height pushes its line apart and leaves a visible gap in a paragraph of running text, so the exported rule sets the superscript size as a custom property, zeroes its line height and raises it with vertical alignment. That keeps the reference mark on its line without moving the lines around it, which is the same technique a real footnote mark needs.\n\nThe output is a small token block: a caption size, a footnote size and a superscript ratio as custom properties, plus figure caption and superscript rules that use them. Three limits are worth knowing before the block is adopted.\n\n- The ratios are not face-specific, and a face with a small x-height needs a larger caption than a face with a large one at the same nominal size, which is the usual reason a legibility floor verdict feels wrong in the browser.\n- The eleven-pixel threshold is a practical floor rather than a standard, so formal accessibility requirements still come first for anything that has to be read.\n- The legal size is derived from the footnote rather than adjustable on its own, so a design that wants more separation edits the declaration afterwards.\n- The superscript ratio sizes the mark but not its raised position, so an unusually high or low mark is a styling decision made where the rule is applied.\n- Nothing sets the width of a caption, so a long figure note still has to be wrapped or centred deliberately.\n\nRead the pixel column rather than the ratios: it is the number the reader meets, and it is the one that has to clear the floor.",
    howTo: [
      { step: "Set the body size, then read the pixel column rather than the ratio column, since the pixel values are what the reader meets." },
      { step: "Adjust the caption and footnote ratios and watch the check column, raising the body size if the roles fall under the floor." },
      { step: "Set the superscript ratio and confirm the line-height rule is copied with it, or the raised marks will open up the paragraph." },
      { step: "Enter a sample line and read the rendered roles against each other, checking that the caption does not look like body copy." },
    ],
    whenToUse:
      "Reach for it when a document has captions, notes or legal lines that have drifted out of proportion with the body text, when small type has to be justified against a legibility floor, or when superscripts are opening up the leading in running text. The reading-versus-consulting distinction is what makes the floor usable. For the larger end of the same system, the {{type-scale-generator|type scale generator}} and the {{heading-scale-visualizer|heading scale visualizer}} cover headings, the {{css-typography-token-generator|CSS typography token generator}} exports the sizes as tokens, and the {{line-height-optimizer|line height optimizer}} settles the leading for each role.",
    faqs: [
      {
        q: "Is there a minimum size for small type?",
        a: "There is a practical floor rather than a rule. Around 11 pixels is where continuous reading starts to suffer, so anything read like a sentence should stay at or above it. Reference matter — a footnote, a legal line, a figure note consulted rather than read — can sit below, which is why the check column separates the two cases.",
      },
      {
        q: "Why is the caption larger than the footnote?",
        a: "Because captions are usually read and footnotes are usually consulted. A caption sits under a figure and has to work as a sentence, while a note is looked up after the fact. The defaults reflect that: the caption keeps a slightly larger size and a more generous leading than the footnote at the same body size.",
      },
      {
        q: "Why does the superscript need a special rule?",
        a: "Because a raised character set at the normal line height enlarges the line box and opens a gap in the paragraph. Zeroing its line height takes it out of the vertical calculation while vertical alignment keeps the mark raised, so the reference digit sits where it should without disturbing the lines around it.",
      },
      {
        q: "How is the legal size determined?",
        a: "It is derived as nine tenths of the footnote size with a leading of 1.35, which keeps the two in a fixed relationship. That means a design that wants a bigger step between notes and fine print edits the exported declaration rather than a control, since the derivation is deliberate rather than adjustable.",
      },
      {
        q: "Do the ratios work for every typeface?",
        a: "No. A face with a small x-height needs more nominal size to reach the same apparent size, so the same ratio can look smaller in one family than another. The ratios are a starting structure; the pixel column and a rendered sample are what confirm whether the small roles actually read.",
      },
    ],
  },

  "vertical-rhythm-builder": {
    keywords: [
      "vertical rhythm builder",
      "baseline unit",
      "snap error",
      "modular scale",
    ],
    intro:
      "The vertical rhythm builder snaps a modular scale's line boxes to a single spacing unit and reports the snap error for every step. The error column is the point: a step that misses the grid by three per cent is visible on the page, and one that misses by half a per cent is not.",
    content:
      "The vertical rhythm builder takes a modular scale and forces its line boxes onto a single baseline unit, then reports how much each step had to move to get there.\n\nThe inputs describe the scale and the grid together.\n\n- Baseline unit, from 2 to 32 pixels, which is the stripe spacing every line box has to land on.\n- Body size and ratio, which generate the scale: each step is the body size multiplied by the ratio raised to the step number.\n- Body line height, which gives each step its natural line box before snapping.\n- Step count, from 2 to 8, which decides how far up the ladder the table goes.\n\nThe arithmetic per step is short. The natural box is the size times the leading; the snapped box is that value divided by the unit, rounded to a whole number, and multiplied back; the effective leading is the snapped box divided by the size; and the snap error is the difference between the snapped and natural boxes as a percentage of the natural one. A 21px step at a line-height of 1.5 has a natural box of 31.5px, which against an 8px unit rounds to 32px — a half-pixel change, an error of about 1.6 per cent, and an effective leading of 1.524 rather than 1.5.\n\nThat example is the tool's argument. A scale built purely from a ratio produces line boxes that are not multiples of anything, so the baselines of consecutive blocks drift a little further apart as the page runs down. Snapping fixes the drift and changes the leading slightly, and the size of that change is what the error column quantifies. The panel puts the practical threshold at about 1.5 per cent, under which the difference is invisible, and it names the worst step in the current ladder so the exceptions are visible before the CSS is copied. A striped preview draws the unit behind the rendered ladder, which makes a step that misses the stripes obvious without reading a number.\n\nThe output is one rule per step, each with the size in rem and the snapped leading, so the class list can be applied directly. Two limitations shape how far the result can be trusted.\n\n- Rounding can move a line box either up or down, so the snapped leading is not always looser than the natural one and a display step can tighten noticeably.\n- The rhythm is only as good as the margins, since a step with a snapped line box still breaks the grid when the space between blocks is an arbitrary number of pixels.\n- The scale is generated from a single ratio, so a ladder that deliberately skips a step for one role is not represented in the table.\n- The preview stripes are drawn at the chosen unit, so a unit that is very small relative to the text shows as closely spaced lines and is harder to judge by eye.\n\nUse it once the scale and the body leading are settled and before the margins are written, because that is the point at which an off-grid step is still cheap to fix.",
    howTo: [
      { step: "Set the baseline unit first, matching it to the body's own line box so the grid and the text agree from the start." },
      { step: "Enter the body size, ratio and step count to generate the scale, and set the leading the steps would naturally take." },
      { step: "Read the snap error column and the worst-step note, and adjust the ratio or the unit if a step is missing the grid by more than about a per cent and a half." },
      { step: "Copy the snapped rules and use the same unit for the margins between blocks, or the rhythm will break between the lines rather than inside them." },
    ],
    whenToUse:
      "Reach for it when a modular scale has been chosen and the page still looks slightly loose or tight as it scrolls, when a grid has to be imposed on an existing set of sizes, or when the cost of snapping a scale needs to be seen before it is committed to. The error column is what makes it a decision rather than a rule. For a single heading against a body grid, the {{baseline-grid-calculator|baseline grid calculator}} does the same arithmetic on one element, the {{type-scale-generator|type scale generator}} and the {{modular-scale-calculator|modular scale calculator}} build the scale itself, and the {{line-height-optimizer|line height optimizer}} supplies the leading the steps start from.",
    faqs: [
      {
        q: "What is a vertical rhythm in practice?",
        a: "It is a single spacing unit, usually the body's own line box, that every line box and every vertical margin is a whole multiple of. The reader never sees the grid; they see that blocks are consistently spaced and that baselines line up from section to section instead of drifting apart down the page.",
      },
      {
        q: "What does the snap error mean?",
        a: "It is how far the line box had to move to become a whole number of baseline units, expressed as a percentage of the natural box. A 31.5px box snapped to a 32px unit moves half a pixel, which is about 1.6 per cent. Under roughly 1.5 per cent the change is invisible; above it the leading visibly differs.",
      },
      {
        q: "Does snapping always increase the leading?",
        a: "No. The box is rounded to the nearest whole number of units, so a natural box just above a multiple is pulled down and the effective leading tightens. That is worth watching on display steps, where a tighter leading changes the look of a heading more than it would in body text.",
      },
      {
        q: "Why does the preview draw stripes?",
        a: "Because a grid is easier to see than to read. The stripes are the baseline unit drawn behind the rendered ladder, so a step whose baselines miss them is obvious at a glance. It also shows how far apart the units are relative to the text, which is where an overweight grid usually becomes apparent.",
      },
      {
        q: "Is snapping the line boxes enough on its own?",
        a: "No, and this is the most common place a rhythm fails. Margins and padding have to be multiples of the same unit, or the space between blocks breaks the grid even when every line box inside them is snapped. The spacing steps in the output are there to be used for exactly that.",
      },
    ],
  },

  "type-hierarchy-planner": {
    keywords: [
      "type hierarchy planner",
      "role map",
      "modular scale",
      "heading weight",
    ],
    intro:
      "The type hierarchy planner assigns every text role a step on one modular scale, then renders the whole outline so the jump between body and the smallest heading can be judged against the jump between the largest headings. Most hierarchies fail in the middle, not at the top.",
    content:
      "The type hierarchy planner takes a body size and a ratio, assigns each text role a step on the resulting modular scale, and renders the page outline the assignment produces. The default role map is the opinionated part, and it is worth reading before it is changed.\n\n- Display sits six steps above the body at weight 700 and a line-height of 1.05, for a hero marketing line that is read once.\n- H1 sits five steps up at the same weight and a leading of 1.1, which is the page title.\n- H2 and H3 take four and three steps at weight 600, leading 1.15 and 1.2, for sections and sub-sections.\n- H4 takes two steps at weight 600 and a leading of 1.25, which is the group label that most hierarchies get wrong.\n- Body sits at step zero, weight 400 and a leading of 1.6, and Small drops one step below it at 1.45 for captions and metadata.\n\nThe scale itself is the familiar modular construction: each role's size is the body size multiplied by the ratio raised to its step number, so changing the ratio re-proportions the whole outline at once and changing the base shifts it. Every role above the body takes the heading weight set in the panel rather than keeping its own, which is the quick way to see whether a hierarchy is carried by size or by weight. The table reports each role in pixels, as a multiple of body size, with its weight and leading, and the exported CSS writes one class per role — so the plan transfers as a set of declarations rather than as a description.\n\nThe outline is where the plan is tested. In page mode, body-sized roles also render a paragraph beneath them, which is how a reader will actually meet them; in type-only mode the ladder is shown alone. Two things become visible that a table hides. The step from Body to H4 is usually the weakest link, because if the ratio is small the group label barely differs from the paragraph beneath it. And mid-step sizes are the giveaway of a hierarchy that grew by accident: when a design has a 15px role between a 14px and a 17px one, the map has a hole in it, and the honest fix is to move the role rather than add a step.\n\nWhat the tool does not do is set the type, and the gaps are worth knowing before the role map is adopted.\n\n- Sizes are not snapped to a baseline grid, so a plan that has to sit on one is re-derived afterwards with a grid tool.\n- The sample copy is a single string, so roles are judged at one length rather than at the short and long lines real pages produce.\n- Heading weight is uniform above the body, which hides the case where two headings need different weights to separate.\n- Nothing accounts for measure, so a heading that works at 60 characters has to be re-checked at 20.\n- The role list is fixed at seven entries, so a project with a different set of roles edits the exported classes rather than the map.\n\nRead the map as a starting structure to be argued with rather than a specification to be applied.",
    howTo: [
      { step: "Set the body size and the ratio first, since every role's size is derived from those two numbers." },
      { step: "Read the role map table and check the multiple-of-body column, which is easier to judge than the pixel values." },
      { step: "Switch to page mode and compare adjacent roles in the outline, starting with the jump between the group label and the paragraph under it." },
      { step: "Set the heading weight and copy the role classes, remembering that the plan still has to be snapped to any baseline grid the project uses." },
    ],
    whenToUse:
      "Reach for it when a page has too many text sizes to keep straight, when a heading level looks redundant against the copy beneath it, or when a scale has to be documented as roles rather than as a list of sizes. The role map is the transferable part. For the raw steps, the {{modular-scale-calculator|modular scale calculator}} and the {{type-scale-generator|type scale generator}} build the ladder, the {{vertical-rhythm-builder|vertical rhythm builder}} snaps each role's line box to a unit, and the {{css-typography-token-generator|CSS typography token generator}} exports the whole set as tokens.",
    faqs: [
      {
        q: "Why assign roles to steps instead of sizes?",
        a: "Because a role survives a change of base size and a size does not. When every heading is defined as a number of steps above the body, raising the ratio or the base re-proportions the whole hierarchy in one move. A list of pixel values has to be recomputed by hand every time one of them changes.",
      },
      {
        q: "Which jump usually fails first?",
        a: "The one between the body and the smallest heading. Body copy sits at step zero with a generous leading, while a group label two steps up is only slightly larger and often the same weight, so it reads as emphasised text rather than as a heading. Raising the step count or the weight fixes it more reliably than adding a new level.",
      },
      {
        q: "Why does the heading weight apply to every heading role?",
        a: "Because it answers one question quickly: is the hierarchy carried by size or by weight. With a single weight above the body, any role that fails to separate is failing on size alone. Per-role weights are the next step, and the exported classes can be edited to give one, but the uniform setting is the honest first test.",
      },
      {
        q: "What is a mid-step size and why is it a problem?",
        a: "It is a role whose size does not sit on any step of the scale, usually because a design grew by adding a size rather than by moving a role. A 15px role between a 14px and a 17px one makes the hierarchy irregular, and readers feel it as inconsistency even when they cannot name the cause.",
      },
      {
        q: "Does the plan account for line length?",
        a: "No. The outline sets each role at one sample string, so a heading that looks convincing at 60 characters may be too large at 20 and too small across a full-width container. Roles that carry long lines usually need a step down or an extra leading, which is a decision to take on a real page rather than in the planner.",
      },
    ],
  },
};
