import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 10 (alphabetical slugs 83-89).
 *
 * Skipped from this window:
 *  - color-temperature-adjuster — still flagged: the slug promises warm/cool
 *    temperature control but renders the generic HueShift component.
 *  - color-temperature-analyzer — still flagged: no Kelvin estimate is produced.
 *  - color-theory-reference-tool — renders the twelve-hue ColorWheel picker with
 *    no theory content, so the slug's promise does not match the tool. Deferred to
 *    hue-circle-interactive, which describes what the component actually does.
 */
export const SEO_BATCH_10: Record<string, ToolSeo> = {
  "color-swatch-png-generator": {
    keywords: [
      "color swatch png generator",
      "swatch sheet png",
      "palette swatch image with hex codes",
      "export color cards as png",
    ],
    intro:
      "The color swatch PNG generator renders each color as a labelled card — swatch, hex value and index — and exports the whole sheet as one PNG image.",
    content:
      "- The color swatch PNG generator renders the palette to a canvas and exports it as a single PNG, so one download contains the whole sheet.\n- Instead of a bare strip of blocks, every colour is drawn as a card: a large block of the colour with its uppercase hex value printed underneath, and a small caption numbering the swatch below that.\n- The hex values are legible inside the image itself.\n\nThe dimensions are fixed and easy to predict. Each card occupies two hundred and twenty pixels of width, the sheet is two hundred and sixty pixels tall, and the colour block fills the upper two hundred and four pixels with the text set in the remaining space. Width scales with the count, so four colours produce an eight-hundred-and-eighty pixel sheet and six produce one thousand three hundred and twenty. Because the header text is drawn into the pixels rather than layered over them in the page, the labels survive wherever the file goes.\n\nThat self-contained quality is the reason to choose this over the plain strip export. A palette image without values is decoration; with values printed on it, the same image becomes documentation that can stand alone. Someone opening it in a chat client, a ticket, a slide or a printed page can read the codes directly instead of asking for them, which removes a whole round of back-and-forth from design hand-offs. Sending a palette as text is fragile, because formatting gets stripped and values get reordered; sending it as one image with everything burned in is not.\n\nThe preview on screen is the exported canvas, so there is no separate rendering path that could disagree with the file. As you edit the palette the sheet is redrawn, which means a value can be corrected and the image re-downloaded in the same moment. There is no configuration at all: no card size, no columns, no background colour, no label format. The layout is one row, the labels are always the hex and an index, and the only decision available is which colours are in the list.\n\nComparing it with the near neighbours is the clearest way to place it. The unlabelled strip export gives plain blocks with no text, which suits decoration better than documentation. The printable sheet renders the same labelled cards in the page for the browser's print dialog, which is the right choice when the destination is paper or a PDF. And the SVG export gives editable vector markup rather than a raster image. This one sits in the middle: labelled like the printable sheet, but delivered as a portable image file.\n\nA few limitations follow from the fixed layout.\n\n- Because every card is the same size and the sheet is a single row, a long palette produces a very wide image with no wrapping to a second row.\n- The background behind the text is always white, which is worth knowing for a very pale palette — the hex text sits on white rather than on the colour block.\n- The caption is positional rather than a name, so roles and token names are not recorded.\n\nUsed as a color swatch png generator for hand-offs, it does exactly one thing well: it turns a working palette into a swatch sheet png with the codes already on it. When you need a palette swatch image with hex codes that will look identical on any machine, or you want to export color cards as png in one file, this is the tool that keeps the values visible instead of leaving them behind in the page they came from.",
    howTo: [
      { step: "Edit the palette rows on the left, adding or removing colours as needed." },
      { step: "Check the generated swatch card sheet in the panel beside them." },
      { step: "Press Download .png to save color-swatches.png." },
      { step: "Re-edit the palette and download again when a value changes." },
    ],
    whenToUse:
      "Use this export when a palette needs to travel as a single labelled image — hand-offs, tickets, slides or documentation. Use the unlabelled strip for decoration, the printable sheet for paper, and the SVG export for editable markup. When the palette has to stay editable rather than fixed in a picture, the {{color-palette-svg-exporter|color palette SVG exporter}} writes markup instead, and when it has to travel as data, the {{color-palette-json-exporter|color palette JSON exporter}} is the plainer carrier.",
    faqs: [
      {
        q: "What is drawn on each card?",
        a: "A large block of the colour, its uppercase hex value printed beneath, and a small index caption numbering the swatch. All of it is rendered into the image itself.",
      },
      {
        q: "What size is the exported sheet?",
        a: "Each card is two hundred and twenty pixels wide and the sheet is two hundred and sixty pixels tall, so the total width scales with the number of colours.",
      },
      {
        q: "Why put the values in the image?",
        a: "So the file stands alone. A palette image with the codes printed on it can be read by anyone who receives it, without a separate text version to keep in sync.",
      },
      {
        q: "Does a long palette wrap onto another row?",
        a: "No. The layout is a single row, so a long palette produces a wide image. Split the palette across two exports if width becomes a problem.",
      },
      {
        q: "Can each card be labelled with its role instead of a number?",
        a: "No — the caption is the swatch's position in the palette, so swatch 1 is simply the first colour. Names and roles have to be added afterwards in whatever document the image lands in, or carried by a token file instead.",
      },
    ],
  },

  "color-tetradic-finder": {
    keywords: [
      "color tetradic finder",
      "tetradic color scheme",
      "four color harmony",
      "square color scheme generator",
    ],
    intro:
      "The color tetradic finder derives a four-color tetradic scheme from one base color by stepping ninety degrees around the hue circle at fixed lightness and saturation.",
    content:
      "The color tetradic finder builds a four-colour scheme from a single base. Choose a colour and the tool returns it alongside three partners, each sitting a further quarter-turn around the hue circle — ninety degrees, one hundred and eighty, and two hundred and seventy from the original. Laid out in order, the four swatches form a symmetric arrangement with the base and its opposite diametrically facing and the two intermediates between them. Every swatch shows its hex value and offers a copy button, so the scheme can be lifted straight into a project.\n\nThe geometry is what makes this a tetradic color scheme rather than something looser.\n\n- The name simply means four, and the arrangement produced here places them at even quarter turns, which is the form usually drawn as a square on a wheel.\n- Two of the four are directly opposed, and the other two are likewise opposed, so the scheme contains two complementary axes crossing at a right angle.\n- That structure is the reason the set feels balanced without any one colour dominating, and it is also why it can look busy if all four are given equal visual weight.\n\nAll four colours are generated in a perceptually uniform space with lightness and saturation held exactly where the base had them. Only hue moves. That keeps the group visually even — none of the four arrives lighter or duller than the others as an accident of arithmetic — and it means the scheme you are judging is a judgement about hue relationships and nothing else. Adjusting the base's lightness or saturation later shifts the whole group together, which makes the scheme easy to tune as a unit rather than colour by colour.\n\nA four color harmony is one of the oldest named schemes, and the four hues produced here are its canonical form. Using it well is mostly a question of proportion rather than of picking. A workable pattern is to let one of the four carry the interface, give a second a supporting role, and reserve the remaining two for accents, so the scheme's symmetry is present in the palette without every screen showing all four at full strength. Because the pairs are complementary, any two adjacent entries in the row sit in strong contrast, which is useful for calls to action and dangerous for large adjacent surfaces.\n\nThere are two limits worth stating.\n\n- First, holding saturation constant means some quarter turns land outside what a screen can display — certain hue and saturation combinations only exist within a narrow band of lightness — so an individual swatch can come back slightly less vivid after rounding to a hex value.\n- Second, a tetradic scheme says nothing about legibility: two of these colours can be far apart in hue and still share enough luminance to be unusable as text and background.\n- Check any pairing you intend for text with a contrast checker before building on it.\n\nIt is also worth distinguishing this from the three-colour and two-colour options in the same family, since the choice between them is really a choice about how much tension a design can carry. A complementary pair is the most emphatic and the simplest; a triadic set spreads three colours evenly and reads as more varied but less opposed; the four-way tetradic used here is the richest and the hardest to keep calm. If you want related colours rather than opposed ones, an analogous scheme is the better starting point.\n\nAs a square color scheme generator the tool is a single decision followed by a copyable result: set a base, read the four values, and decide how much of each the design will actually show. What it will not do is tell you which of the four should be the primary — that depends on the brand, the content and the context, and no fixed rotation can answer it.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the four hues, spaced ninety degrees apart." },
      { step: "Choose which one leads and which two recede; four equal hues will otherwise compete." },
      { step: "Check the pairs you intend to use before committing to them." },
    ],
    whenToUse:
      "Use this finder when a design needs four related colors with a built-in structure of two complementary axes. Use the triadic option for three hues, the complementary option for a single opposing pair, and the analogous option when you want harmony rather than tension. The {{color-triadic-finder|triadic finder}} is the three-hue relative, and the {{color-analogous-finder|analogous finder}} stays inside a thirty-degree band for a quieter set.",
    faqs: [
      {
        q: "How are the four colors derived?",
        a: "The base is taken as the first colour and the others are its hue rotated by ninety, one hundred and eighty and two hundred and seventy degrees, with lightness and saturation unchanged.",
      },
      {
        q: "Why is this sometimes called a square scheme?",
        a: "Because the four hues sit at even quarter turns around the circle, which is traditionally drawn as a square. The word tetradic just means the scheme contains four colours.",
      },
      {
        q: "Do all four have the same brightness?",
        a: "Yes. Only hue is changed, so lightness and saturation match the base. Individual swatches can still round slightly flatter if the combination falls outside what a screen can display.",
      },
      {
        q: "Can I use two of them for text and background?",
        a: "Only if their luminance differs enough. A complementary pair can easily share a brightness and be unreadable as text, so check the pairing with a contrast checker.",
      },
      {
        q: "Does the scheme include the base colour?",
        a: "Yes. The base is one of the four, with the other three at ninety, one hundred and eighty and two hundred and seventy degrees from it, so the arrangement reads as a square on the wheel with the base as one corner.",
      },
    ],
  },

  "color-triadic-finder": {
    keywords: [
      "color triadic finder",
      "triadic color scheme",
      "three color harmony",
      "120 degree color harmony",
    ],
    intro:
      "The color triadic finder spreads one base color into three evenly spaced hues, each a third of the circle apart, at unchanged lightness and saturation.",
    content:
      "The color triadic finder takes one colour and returns a three-part scheme built from it. The base is kept as the first swatch, and the other two are the same colour rotated a third of the way around the hue circle in each direction, so the three sit one hundred and twenty degrees apart. That even spacing is the whole idea: no hue in a three color harmony of this kind is closer to another than to the third, which is why the result reads as three co-equal partners rather than a colour and its supporting cast. Each swatch carries its hex and a copy button.\n\nBecause the points are evenly distributed, the arrangement is usually drawn as an equilateral triangle inscribed on the wheel, and that picture explains the scheme's character. There is no dominant colour and no direct opposition either — every pair is separated by the same rotational distance, so the set has variety without the head-on tension of a complementary pair. That balance is what makes triadic schemes popular for illustrations, charts and playful interfaces where several colours need to coexist at similar importance without any one of them being obviously the accent.\n\n- The three hues are computed in a perceptually uniform space, with lightness and saturation copied from the base and only the hue angle moved.\n- Holding the other two properties fixed matters for two reasons.\n- It makes the three swatches visually even, so a preference between them is a judgement about hue rather than about brightness creeping in from the arithmetic.\n- And it makes the scheme adjustable as a single object: lighten the base and the entire set follows, keeping the relationship intact while changing its overall tone.\n\nA triadic color scheme is one of the oldest named relationships in colour theory, and the three hues produced here are its exact form. In practice it is rarely applied as three equal thirds of a screen. Even spacing in hue does not imply even spacing in use, and a workable pattern is to let one of the three lead, use the second for supporting structure such as borders and secondary buttons, and save the third for genuinely small accents. Because all three are the same distance apart, placing two of them on large adjacent surfaces tends to produce a restless result rather than a considered one. The scheme gives you a coherent set of colours; the proportions are still your decision.\n\nTwo limits are worth knowing in advance.\n\n- Constant saturation means some angles fall outside the range a screen can reproduce at that lightness, and a 120 degree color harmony that crosses those regions can produce one swatch noticeably flatter than the other two once values are written as hex — a limitation of the display gamut rather than of the rotation.\n- And the scheme says nothing about legibility: two evenly spaced hues can share a luminance and be unreadable together as text and background, so any pairing meant for text should be checked with a contrast checker first.\n\nIt is also worth being clear about which relative this is not. If you want the strongest possible opposition in two colours, a complementary scheme gives you one pairing rather than three. If you want four with a built-in structure, the tetradic option spreads hues at quarter turns. And if the design needs colours that already belong together rather than a set that spans the circle, an analogous scheme is the better fit — the triadic answer is variety by construction, and that is exactly the effect it will have.\n\nUsed as a color triadic finder, the tool is one decision and one result: choose a base, read three values, and go. What it cannot tell you is which of the three deserves to lead, and that usually depends on the brand and the content rather than on the geometry.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the three hues — the base plus the points one hundred and twenty degrees either side." },
      { step: "Give one hue the primary role and keep the other two as accents or surfaces." },
      { step: "Check the pairs you intend to use before committing to them." },
    ],
    whenToUse:
      "Use this finder when a design needs three evenly weighted, genuinely different colors — illustrations, charts and friendly interfaces. Use the complementary option for a single strong opposition, the tetradic option for four, and the analogous option for closely related hues. The {{color-tetradic-finder|tetradic finder}} widens the arrangement to four hues, and the {{split-complementary-palette-generator|split-complementary generator}} keeps a three-part spread without the exact opposite.",
    faqs: [
      {
        q: "How are the three colors spaced?",
        a: "Evenly. The base is kept and the other two are its hue rotated one hundred and twenty degrees each way, so the three sit a third of the circle apart.",
      },
      {
        q: "Is a triadic scheme always balanced?",
        a: "In hue, yes — no colour is closer to one than the other. Visually it depends on how much of each you use, so the proportions are still your decision.",
      },
      {
        q: "Why does one swatch sometimes look duller?",
        a: "Lightness and saturation are fixed, and some hue and saturation combinations fall outside what a screen can display at that brightness, so the value rounds less vividly.",
      },
      {
        q: "Can I use a triadic pair for text?",
        a: "Not automatically. Evenly spaced hues can share a luminance, so verify any text and background pairing with a contrast checker before using it.",
      },
      {
        q: "Why do some hues come back less vivid than the base?",
        a: "Because saturation is held constant across all three: the rotation happens in a perceptually uniform space with the base's lightness and chroma preserved, and some hue angles cannot carry the same chroma, so those swatches land slightly flatter once written as hex.",
      },
    ],
  },

  "color-tones-generator": {
    keywords: [
      "color tones generator",
      "desaturate a color",
      "muted color ramp",
      "tones of a color",
    ],
    intro:
      "The color tones generator produces ten progressively muted versions of one color, draining saturation while holding lightness and hue exactly in place.",
    content:
      "The color tones generator drains the colourfulness out of a single colour and shows the result as a ramp of ten steps, from a slightly softened version of the original down to something close to a neutral grey. Every step keeps the base's hue and, crucially, its lightness, so nothing in the strip gets darker or lighter — only less saturated. Each swatch shows its hex with a copy button. It is the third member of a small family, and the property it holds constant is the one that makes it useful.\n\n- Toning works by scaling chroma while leaving lightness untouched, and the ten entries are evenly spaced fractions of the base's saturation, so the first swatch barely differs from the original and the last retains only a trace of colour.\n- Because the base itself is not one of the ten, the strip begins just inside it and moves steadily toward grey.\n- The greys it arrives at are not arbitrary: since lightness is fixed, the most muted entry is the neutral that shares the base's brightness, which is exactly the neutral that sits behind everything else in the ramp.\n\nHolding lightness is what separates this from the neighbouring tools, and the distinction is worth holding on to because the three operations solve different problems. Shading keeps chroma and lowers lightness, producing stronger dark steps. Tinting keeps chroma and raises lightness, producing softer light steps. Toning keeps lightness and lowers chroma, producing quieter versions at the same visual weight. Only the third leaves a colour's brightness alone, which is why it is the right one when a hue is simply too loud rather than too bright.\n\nThe everyday use is taming a palette without rebuilding it. A saturated brand colour can be perfect at full strength on a button and overwhelming when used for a large panel, a background band or a chart series, and the fix is usually tone rather than shade or tint. Running the same colour through this ramp produces a set of deliberately quieter variants that still read as the same family, so the page keeps its identity while shedding the shouting. It is equally useful for building subdued support colours — borders, dividers, disabled states and secondary text — from the same hue the rest of the interface uses.\n\nIt also earns its place as a diagnostic. Because brightness never changes across the strip, the ten swatches isolate saturation as the only variable, which makes it easy to see how much of a colour's impact comes from colourfulness rather than from how light or dark it is. If a design still feels strong at the muted end of the ramp, the problem is not saturation.\n\nThere are a couple of practical limits.\n\n- Because lightness is fixed while saturation falls, the muted entries converge on a mid-tone grey, and endpoints at very high or very low lightness produce quite similar neutrals; a ramp built by mixing toward an explicit grey will separate those more clearly.\n- And muting a colour does not soften its contrast: a desaturated colour at the same lightness has roughly the same luminance as the vivid original, so a muted tone can be just as unreadable behind text as the version it came from.\n- Check pairings with a contrast checker rather than assuming that quieter means safer.\n\nUsed as a color tones generator, it answers a narrow question precisely: what does this exact hue look like at lower and lower saturation, with nothing else touched? When you want tones of a color that keep their original weight, or a muted color ramp drawn from one source rather than a set of greys chosen by eye, that precision is the whole value — and when a hue simply needs to desaturate a color rather than darken or lighten it, this is the one of the three to reach for.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the strip of ten entries — lightness is held while chroma falls." },
      { step: "Pick the muted step that fits; the far end is nearly grey." },
      { step: "Use the saturation reducer instead when a single chosen amount is wanted." },
    ],
    whenToUse:
      "Use this generator when a color is too saturated rather than too bright — large panels, chart series and subdued support colors. Use the shade generator to darken instead, and the tint generator to lighten. The {{saturation-reducer|saturation reducer}} mutes one colour by a chosen amount, and the {{color-shades-generator|shade generator}} and {{color-tints-generator|tint generator}} move lightness instead of chroma.",
    faqs: [
      {
        q: "What stays the same across the ten tones?",
        a: "Hue and lightness. Only saturation is reduced, so every step has the same brightness as the base and the ramp reads as one colour quietly receding.",
      },
      {
        q: "How is this different from a shade or a tint?",
        a: "A shade lowers lightness to darken, a tint raises it to lighten, and a tone reduces saturation while holding lightness. Toning is the only one that preserves brightness.",
      },
      {
        q: "Is the most muted tone truly grey?",
        a: "It keeps a trace of the base's hue. Because lightness does not move, it is the neutral that matches the base's brightness rather than an arbitrary grey.",
      },
      {
        q: "Does a muted color contrast less with text?",
        a: "Not necessarily. Reducing saturation barely changes luminance, so a muted tone can be just as unreadable behind text as the vivid original. Check the pairing directly.",
      },
      {
        q: "Why do the muted entries converge on a mid-tone?",
        a: "Because lightness is fixed while chroma falls: at the far end the entries hold almost no colour, so there is little left to distinguish them, and the base colour is not one of the ten.",
      },
    ],
  },
};
