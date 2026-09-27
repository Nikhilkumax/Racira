import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 9 (alphabetical slugs 76-82).
 *
 * Skipped from this window:
 *  - color-rendering-index-reference — still flagged: the slug promises a
 *    lighting-score reference but renders the hue-band ColorPsychology component.
 *  - color-stack-viewer — renders the identical MultiColorPicker as
 *    multi-color-picker, which is the better-matching slug for that behaviour,
 *    so this one is deferred rather than duplicated.
 */
export const SEO_BATCH_9: Record<string, ToolSeo> = {
  "color-psychology-reference": {
    keywords: [
      "color psychology",
      "color psychology reference",
      "what does each color mean",
      "color meanings chart",
    ],
    intro:
      "The color psychology reference reads any color's hue and reports the colour family it belongs to along with the associations typically attached to it.",
    content:
      "The color psychology reference takes a single color and tells you what family it belongs to and what that family tends to signify. Choose any value and the tool splits the screen: your swatch on one side, and on the other the name of the colour band it falls into plus a short list of associations — blue returns trust, calm and stability, red returns energy, passion and urgency, and so on through the spectrum. It is a lookup rather than an essay, and the whole point is speed: you get an answer in the time it takes to pick a colour.\n\n- Underneath, the tool works by hue.\n- It takes your colour's hue angle in a perceptually uniform space and finds which of eight bands it lands in: red near the top of the circle, then orange, yellow, green, blue, purple and magenta wrapping around, with red covering both ends because the circle joins back on itself.\n- Each band carries a family name and a short association.\n- Because the classification is based on hue alone, the result has a property worth understanding before you rely on it.\n\nThat property is that lightness and saturation are ignored entirely.\n\n- A pale sky tint, a mid blue and a near-black navy all return the same answer, because they share a hue.\n- It also means a very desaturated colour still resolves to a family, even when its hue is barely perceptible: a warm grey can report itself as orange, which is technically true of its hue angle and almost certainly not what a viewer perceives.\n- Treat the output as a statement about hue rather than about the colour as experienced.\n\nThe associations themselves are cultural shorthand rather than findings. The idea that colours carry meanings is real and useful — it is why warning interfaces lean red and why so much of the financial sector is blue — but the specific list is a convention of one particular design culture, and the same hue can carry opposite connotations elsewhere. White is mourning in parts of East Asia and purity in much of the West; green reads as growth in branding and as a religious colour in other contexts. The tool gives you a starting point for that conversation, not the conclusion of it.\n\nWhere it earns its place is the early, practical stage of choosing. When you are picking a palette for a product and need a defensible reason for a direction, being able to say that a hue sits in the trust band is a useful shorthand in a review. It is equally handy for the reverse check: choosing a shade and confirming which family it actually belongs to, which is not always obvious for muddy or tertiary colours, since a teal can sit closer to blue or to green depending on its exact angle.\n\nRead it as a color psychology reference in the narrow sense — a named band plus a short association, mapped from hue and nothing else. Used that way it is quick and consistent, and if you want to know what does each color mean in the broadest strokes it covers a color meanings chart's worth of ground in one screen. For the parts it deliberately leaves out, pair it with a tool that reports lightness and chroma, and with a contrast checker when the question is whether the colour will actually work behind text.",
    howTo: [
      { step: "Set a colour with the picker or by typing a hex value." },
      { step: "Read the family it lands in and the short list of associations beside it." },
      { step: "Check whether the hue sits near a band boundary — a teal can fall closer to blue or to green depending on its exact angle." },
    ],
    whenToUse:
      "Use this reference for a quick read on which family a colour belongs to and the associations commonly attached to it. Use the palette balance analyzer when you need measured lightness and chroma figures rather than cultural shorthand. When measured figures matter more than cultural shorthand, the {{palette-balance-analyzer|palette balance analyzer}} reports lightness and chroma, and the {{color-mood-analyzer|color mood analyzer}} reads a single colour's conventional register.",
    faqs: [
      {
        q: "How does it decide which color a value is?",
        a: "By hue. The colour's hue angle is matched against eight bands covering the circle, and each band carries a family name and a short list of associations.",
      },
      {
        q: "Why do a pale blue and a dark navy give the same answer?",
        a: "Because only the hue is considered. Lightness and saturation are ignored, so any colour that shares a hue angle resolves to the same family.",
      },
      {
        q: "Why does a greyed-out color report a vivid family?",
        a: "A desaturated colour still has a hue angle, even when it is barely visible. The result describes that angle rather than what a viewer would perceive.",
      },
      {
        q: "Are the associations objective?",
        a: "No. They are cultural shorthand widely used in design and marketing, and the same hue can carry different or opposite meanings in other traditions.",
      },
      {
        q: "Are lightness and saturation part of the classification?",
        a: "No. The classification is by hue alone, so a pale sky tint, a mid blue and a near-black navy all return the same family. A very desaturated colour still resolves to a band too: a warm grey can report itself as orange, which is true of its hue angle and almost certainly not what a viewer perceives.",
      },
    ],
  },

  "color-replacer": {
    keywords: [
      "color replacer",
      "replace a color in an image",
      "swap colors in a photo",
      "recolor an image online",
    ],
    intro:
      "The color replacer finds every pixel in an uploaded image within a tolerance of a target color and repaints it with the color you choose, live on a canvas.",
    content:
      "The color replacer does one specific job on an image: it finds the pixels that match a colour you nominate and repaints them. Upload a picture, set a target colour, choose what to replace it with, and drag a tolerance slider. The canvas beside the controls updates as you work, so the result is visible without any apply step. It is the tool for the everyday problem of a flat background that needs to be a different colour, or a logo whose one accent shade has to be swapped to match a new brand.\n\n- The matching rule is worth knowing precisely, because it explains both what the tool is good at and where it fringes.\n- A pixel is replaced when each of its red, green and blue values is individually within the tolerance of the target's corresponding channel.\n- That describes a box in colour space rather than a sphere: a colour can sit within tolerance on every channel and still be visually quite different, and two colours equidistant from the target by eye can fall on opposite sides of the boundary.\n- Raising the tolerance widens the box on all three channels at once, which is why a value that catches more of the background also starts bleeding into the subject.\n\nThe slider runs from zero, where only an exact match qualifies, up to two hundred, which is generous enough to sweep most of a scene. Starting values around the middle are usually right for a flat backdrop, and the honest way to work is to raise the tolerance until the background is covered and then back off a step or two as soon as the subject starts losing pixels. Because the swap runs on every change, that tuning is a matter of watching the canvas rather than guessing.\n\nTwo details make the result more usable than a naive swap. The replacement is written as a flat colour, so the exact hue you chose is what lands, and the alpha channel is left untouched, which means a transparent PNG stays transparent where it already was rather than gaining an opaque halo. The processing happens at the image's own resolution rather than on a downscaled copy, so fine details are preserved rather than smeared.\n\n- The limitation that matters most is the absence of any edge blending.\n- A pixel either matches and is fully replaced or does not match and is left exactly as it was, so along an anti-aliased edge between the target colour and its neighbour you get a ring of intermediate pixels that fall outside tolerance and keep their original values.\n- Against a contrasting background that shows as a visible fringe, and the fix is a higher tolerance or a different approach rather than a setting here.\n\nIt is also worth setting expectations about the output. The tool is a canvas preview rather than a file pipeline: there is no download button, so the way to keep a result is to save the rendered canvas from the browser. That makes it excellent for testing whether a recolour will work at all — the common case of a client asking whether the background could be a different shade — and less suited to batch work.\n\nUsed as a color replacer for that kind of quick trial it is hard to beat: no editing suite, no layers, no export dialog, just a target, a replacement and a tolerance. When the task is to swap colors in a photo that are effectively one flat value, or to see how an asset looks with a corrected shade, this gets you an answer in seconds. When the job needs feathered edges or a real file output, a recolouring tool that tints the whole image or an image editor will serve better. Where the job is to replace a color in an image that is effectively one flat value, or simply to recolor an image online without installing anything, that trade-off is an easy one to accept.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Set the target colour to the one you want replaced." },
      { step: "Set the replacement colour." },
      { step: "Raise the tolerance until the fringe disappears, watching for neighbouring colours being caught by mistake." },
    ],
    whenToUse:
      "Use the replacer for flat, near-uniform areas — a solid backdrop, a single logo accent — where you want to see the swap immediately. Use an image recolouring tool when the whole image should be tinted, and an editor when edges need feathering. The {{image-recolor-tool|image recolor tool}} tints every pixel rather than swapping one colour, and the {{duotone-generator|duotone generator}} flattens an image to two tones instead of hunting a match.",
    faqs: [
      {
        q: "How does the tolerance work?",
        a: "A pixel is replaced when its red, green and blue values are each individually within the tolerance of the target's channels. It is a box in colour space, not a radius.",
      },
      {
        q: "Why is there a fringe along edges?",
        a: "Anti-aliased pixels between the target colour and its neighbours take intermediate values, so they fall outside tolerance and keep their original colour, leaving a visible ring.",
      },
      {
        q: "Is transparency preserved?",
        a: "Yes. Only the colour channels are rewritten, so an image that was transparent stays transparent where it already was.",
      },
      {
        q: "Can I download the result?",
        a: "There is no download button. The output is a canvas rendered in the page, so saving it means storing the rendered canvas from the browser.",
      },
      {
        q: "Why are there speckles or halos after a replacement?",
        a: "Because there is no edge blending: a pixel either matches within the tolerance or is left alone, so anti-aliased edges and JPEG noise keep a fringe of the original colour. Raising the tolerance catches more of the fringe and also catches more of the image.",
      },
    ],
  },

  "color-shades-generator": {
    keywords: [
      "color shades generator",
      "shades of a color",
      "generate darker shades of a hex color",
      "css shade ramp",
    ],
    intro:
      "The color shades generator takes one color and returns ten progressively darker versions of it, each shown with its hex value and a copy button.",
    content:
      "The color shades generator builds a darker ramp from a single colour. Choose a base and the tool produces ten steps, arranged lightest to darkest, each rendered as a swatch carrying its own hex value and a copy button. The base colour itself is deliberately absent from the strip: every entry is a shade of it, the first only slightly deeper and the last approaching black. That is the whole tool, and its simplicity is the point — you get a usable ramp for a single colour without deciding anything except which colour to start from.\n\n- What the strip contains are shades of a color in the literal sense: darker versions of one hue, with hue and colourfulness left untouched so that the ramp still reads as a single colour.\n- The construction is worth describing because it explains how the ramp behaves.\n- Shading works by reducing perceptual lightness while leaving hue and chroma exactly as they were.\n- The ten steps are spaced evenly as fractions of the base lightness, so the first swatch sits at roughly nine tenths of the original brightness, the middle lands near half, and the final entry is under a tenth.\n- Because the spacing is proportional rather than absolute, a very light base produces a ramp with tighter steps and a dark base produces larger ones, which mirrors how lightness is actually perceived.\n\n- Holding chroma constant is what keeps the ramp feeling like one colour rather than a set of related greys.\n- It does introduce a limit worth knowing: as lightness falls, a saturated colour can travel outside the range the screen can display, and those extremes get clamped when they are written as hex.\n- The practical symptom is that the darkest two or three entries can look slightly flatter or more muted than the arithmetic suggests.\n- That is normal for a lightness-only ramp, not a fault, and it is the reason the very darkest steps are usually used as near-neutral surfaces rather than as accent colours.\n\nThe obvious use is interface work. Almost every design system needs a base colour plus several darker states for presses, borders, dark surfaces and text, and generating them together from one value keeps the relationships consistent across the whole palette instead of leaving a set of greys that were each chosen by eye and do not quite belong to the same family. Because each swatch carries a copy button, moving the ramp into a stylesheet is a matter of copying values in sequence, and the strip's ordering makes it obvious where a token name such as a numbered scale should land.\n\nIt also works well as a comparison device. Two different base colours produce two ramps, and laying them side by side shows immediately whether their dark ends are equally usable, which is the kind of question that is difficult to answer from a single swatch. If the darkest steps are too close together for your taste, the answer is not a setting here: a ramp built by mixing toward a specific dark colour, or a hand-tuned scale, gives finer control.\n\nTwo nearby tools complete the picture, and the distinction is worth holding on to. Shades darken a colour by reducing lightness; tints lighten one by raising it toward white; tones mute one by draining chroma while holding lightness. Together those three cover the classic ways a single hue is varied, and the shade ramp is the one you reach for whenever a css shade ramp of darker states is needed for a flat base colour. Which is exactly the reason to generate darker shades of a hex color here rather than pick them by hand. In practice the workflow is one decision and no configuration, and what you get is a complete darker ramp with the values already on screen.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the strip of ten darker steps — hue and chroma are held, only lightness falls." },
      { step: "Copy the hex of the step that fits the job." },
      { step: "Reach for the tint or tone generator when the ramp should get lighter or duller instead." },
    ],
    whenToUse:
      "Use this generator when you need a darker ramp from one base color — pressed and hover states, borders or dark surfaces. Use the tint generator to lighten a color instead, and the tone generator to mute one without changing its lightness. The {{color-tints-generator|tints}} and {{color-tones-generator|tones}} generators complete the strip — lighter and duller versions of the same base — and the {{palette-importer|palette importer}} is the route in when the base arrives as a list.",
    faqs: [
      {
        q: "How many shades are produced?",
        a: "Ten, ordered from just below the base colour through to a near-black at the darkest end. The base itself is not one of the ten.",
      },
      {
        q: "Does shading change the hue?",
        a: "No. Lightness is reduced while hue and chroma are held, which keeps the ramp recognisably the same colour rather than drifting toward grey.",
      },
      {
        q: "How is it different from a tint?",
        a: "A shade moves toward black by reducing lightness, a tint moves toward white by increasing it, and a tone reduces chroma at the same lightness. All three vary one hue in different directions.",
      },
      {
        q: "Are the darkest steps usable as accents?",
        a: "They can look flatter than expected, because a saturated colour held at low lightness can fall outside what a screen can display and get clamped. They usually work better as surfaces.",
      },
      {
        q: "Does the strip include the base colour?",
        a: "No. The ladder is ten darker versions of the base, and the base itself is not one of them: each step divides the base lightness by eleven, so the strip starts a little below the original and stops at roughly a tenth of its lightness. Hue and chroma stay put, which is what keeps the ramp reading as one colour.",
      },
    ],
  },

  "color-shift-generator": {
    keywords: [
      "color shift generator",
      "shift hue of a color",
      "hue rotation preview",
      "alternate hues of a color",
    ],
    intro:
      "The color shift generator shows one color rotated to seven hue positions at once, from sixty degrees back to sixty degrees forward, each labelled with its offset.",
    content:
      "- The color shift generator shows what a colour looks like when its hue is rotated.\n- Pick a base and the tool renders seven swatches in a row, each one that base turned by a fixed amount around the colour circle: sixty degrees anticlockwise, thirty, fifteen, none at all, then fifteen, thirty and sixty in the other direction.\n- Every swatch is labelled with its offset in degrees, so the middle entry is always your original colour and the row reads as a symmetric fan around it.\n- If your instinct is to shift hue of a color by a fixed amount and see what happens, this row of seven is the fastest way to find out.\n- It answers a question that is easy to ask and tedious to work out by hand: what else could this colour have been, without changing anything else about it?\n\nThe rotations happen in a perceptually uniform space rather than by adding to red, green and blue. That distinction is the reason the row is usable. Rotating channels independently changes brightness as a side effect, so a shifted colour can come back noticeably lighter or darker and the comparison stops being fair. Rotating the hue angle with lightness and chroma held produces seven swatches that are equally bright and equally saturated, which means the only variable you are looking at is hue. Judging a direction from this row is therefore judging hue alone, exactly as intended.\n\nReading the row is a quick lesson in how much a small shift matters. The fifteen-degree steps are close enough that the difference reads as a gentle variation, which is roughly the territory of analogous palettes and of a subtle accent sitting beside a base. The thirty-degree steps separate more clearly and start to feel like distinct colours working in concert. The sixty-degree steps are firmly different hues that share a family resemblance without being interchangeable, which is useful when a design needs a second colour that is related but plainly its own.\n\nThe most common use is deciding on a secondary or accent colour. Instead of opening a wheel and hunting, you see the plausible neighbours of your base laid out in order and can pick the one at the distance you want. It is also a fast way to check whether a colour is doing too much of the work: if all seven swatches look interchangeable in context, your design may be relying on hue where it should be relying on lightness or size instead.\n\nThere is an important limit that follows from holding the other two properties fixed.\n\n- Because chroma is constant, some rotations land outside what a screen can display — a saturated yellow, for instance, can only exist at a certain lightness, so rotating a dark blue sixty degrees toward yellow produces a colour that has to be clamped on output and comes back less vivid than the others.\n- When one swatch in the row looks noticeably duller than its neighbours, that is usually the reason rather than a mistake in the rotation.\n\nTwo wordings for the same idea are worth recognising so you do not go looking for a separate tool: shifting the hue of a colour and rotating its hue angle are the same operation, and a hue rotation preview like this one is the quickest way to see the range available. If a specific relationship is what you need rather than a range — a true complement, a triad, a tetrad — the dedicated harmony tools compute those exact angles. Used to explore, though, the fan of seven is an unusually efficient way to see the alternate hues of a color before committing to one, and it makes the size of each step obvious in a way that reading degrees never does.",
    howTo: [
      { step: "Set the base colour with the picker." },
      { step: "Read the seven swatches, running from sixty degrees below to sixty degrees above the base." },
      { step: "Note how far fifteen degrees moves the colour before choosing an accent." },
      { step: "Use the hue rotator when a single rotation value has to be applied and read out." },
    ],
    whenToUse:
      "Use this generator to preview a range of hues around a base color and choose how far to shift for an accent or secondary color. Use the harmony tools when you need specific relationships such as complementary or triadic. The {{hue-rotator|hue rotator}} applies a single rotation you set, and the {{color-temperature-adjuster|temperature adjuster}} frames the same move as a warm or cool correction.",
    faqs: [
      {
        q: "How many hues are shown?",
        a: "Seven: sixty, thirty and fifteen degrees anticlockwise, the original, then fifteen, thirty and sixty degrees clockwise, each labelled with its offset.",
      },
      {
        q: "Does the shift change brightness?",
        a: "No. The rotation happens in a perceptually uniform space with lightness and chroma held, so the swatches are equally bright and only the hue varies.",
      },
      {
        q: "Why does one swatch look duller than the rest?",
        a: "Some hue and saturation combinations cannot be displayed at that lightness, so the value gets clamped on output. It is a limit of the screen, not an error in the rotation.",
      },
      {
        q: "Is a hue rotation the same as a shift?",
        a: "Yes. Shifting the hue of a colour and rotating its hue angle describe the same operation, and this tool previews that operation across a fixed range of offsets.",
      },
      {
        q: "Does the row include the original colour?",
        a: "Yes. Seven swatches are shown, from sixty degrees below to sixty degrees above the base, with the base itself at zero in the middle. Lightness and chroma are held throughout, so only hue changes across the row.",
      },
    ],
  },

  "color-swatch-generator": {
    keywords: [
      "color swatch generator",
      "printable color swatch",
      "swatch sheet with hex codes",
      "print a color palette",
    ],
    intro:
      "The color swatch generator lays a palette out as labelled swatch cards — color, hex value and rgb equivalent — and prints that sheet from the browser.",
    content:
      "The color swatch generator turns a palette into a printable sheet of swatch cards. Edit a list of colours on the left and the right panel renders each one as a card: a block of the colour, its hex value in uppercase, and its rgb equivalent beneath. A print button then sends the sheet to the browser's own print dialog. It exists for the moment a palette has to leave the screen — for a wall, a sample book, a client meeting or a hand-off to someone who works on paper rather than in code.\n\n- The content of each card is chosen for that purpose rather than for decoration.\n- The colour block is large enough to judge at a glance, the hex is printed in a monospaced face so digits are unambiguous and can be read aloud or typed without confusing a one for an ell or a zero for an oh, and the rgb triple sits underneath because print and screen workflows ask for that notation at least as often.\n- There are no names and no descriptive labels, since the tool has no way to know what each colour is for.\n\n- Printing happens through the browser rather than through a generated file, and that is a deliberate kind of simplicity.\n- There is no download to manage, no page-size setting and no exporting step: the sheet on screen is what the print dialog receives, and the usual print options apply for scaling, paper size, orientation and margins.\n- It also means the sheet can be saved as a PDF from the same dialog, which is often the format people actually want when a palette has to be attached to documentation or sent to a printer who will not be opening a browser.\n\nThe workflow is short by design. Add the colours you want, name nothing, and print. Because the palette editor is live, adjusting a value updates the card immediately, so a last-minute correction before printing does not mean regenerating anything. That makes it useful mid-meeting, when someone asks whether a shade could be slightly warmer, and the answer can be produced and printed in the same minute rather than returned to later.\n\nIt is worth distinguishing this from its neighbours, because several tools produce similar-looking output for different destinations. A PNG swatch export renders labelled cards as an image file, which is better for slides and pull requests but is a picture rather than something you can print cleanly at any size. A palette strip image produces an unlabelled bar, useful as decoration but not as a specification. And the plain image export gives the simplest artefact of all. This tool is the one to reach for when the destination is paper.\n\nWhen the requirement is simply to print a color palette on paper, there is nothing else to configure, which is the whole appeal of doing it this way rather than through a layout application. A couple of practical notes about printing colours honestly. Ink and paper will not reproduce a screen colour exactly, and vivid saturated colours in particular tend to arrive duller on a desktop printer, so a printed swatch is a reference rather than a proof; a calibrated proof comes from a print process, not a browser. There is also nothing in the sheet that records the paper or printer used, so if you keep printed swatches for comparison it is worth writing that on the page yourself.\n\nUsed as a color swatch generator for physical reference, the appeal is that it removes every intermediate tool: no design application, no layout file, no export pipeline. You get a printable color swatch sheet with hex codes straight out of the browser, which is exactly what is needed when a swatch sheet with hex codes has to exist on paper and the only thing that should stand between the palette and the printer is a couple of clicks.",
    howTo: [
      { step: "Add the colours you want on the sheet." },
      { step: "Check the cards: a large colour block, the hex in a monospaced face and the rgb triple underneath." },
      { step: "Print the page and set paper size, orientation and margins in the browser's dialog." },
      { step: "Save as PDF from the same dialog when the sheet has to be attached or sent." },
    ],
    whenToUse:
      "Use this generator when a palette needs to exist on paper or as a PDF. Use the swatch PNG export for slides and documents, the palette strip for unlabelled decoration, and the SVG exporter when you need editable vector markup. The {{color-palette-png-generator|palette strip PNG}} is the unlabelled decoration for slides, the {{color-swatch-png-generator|labelled swatch export}} puts the codes on individual cards, and the {{color-palette-svg-exporter|SVG exporter}} produces editable markup when the artifact has to be reworked.",
    faqs: [
      {
        q: "What appears on each swatch card?",
        a: "A block of the colour, its uppercase hex value in a monospaced face, and the rgb equivalent underneath. There are no names, because the tool cannot know what each colour is for.",
      },
      {
        q: "How does printing work?",
        a: "Through the browser's own print dialog, using the sheet as rendered on screen. Your usual paper size, orientation and margin options apply, and you can save as a PDF from the same dialog.",
      },
      {
        q: "Will the printed colours match the screen?",
        a: "Not exactly. Ink and paper reproduce colour differently, and vivid saturated shades in particular tend to print duller, so treat a printed swatch as a reference rather than a proof.",
      },
      {
        q: "Is this the same as the PNG swatch export?",
        a: "No. The PNG export produces labelled cards as an image file, which suits slides and documents. This one produces a live sheet intended for printing or saving as a PDF.",
      },
      {
        q: "Can the sheet be saved as a file?",
        a: "The print dialog is where the file is made: the sheet on screen is what the dialog receives, so the usual options for paper size, orientation, margins and scaling apply, and saving as PDF from the same dialog is often the format a printer or a documentation page actually wants.",
      },
    ],
  },
};
